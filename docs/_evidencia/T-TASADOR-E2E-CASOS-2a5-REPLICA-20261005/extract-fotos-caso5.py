#!/usr/bin/env python3
"""Extrae y categoriza las fotos del PDF oráculo del Caso 5 (HEV-3183).
Mapeo DETERMINISTA por xref (inventario verificado con pymupdf el 2026-10-05:
rótulos debajo de cada foto en pp. 5-6; Hoja 2 en p. 3). Recomprime a JPEG y
vuelca data-URIs ≤95k chars a caso5-fotos.json. Solo lectura del oráculo.
Cap a 16 fotos (paridad VP-0067/Caso 2; la plantilla tiene 16 ranuras)."""
import pymupdf, io, base64, json
from PIL import Image

PDF = "docs/_referencias/5tasaciones/informe CARLOS ANDRÉS CORTÉS PÉREZ.pdf"
OUT = "docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/caso5-fotos.json"
MAXURI = 95000

# (página idx, xref) -> categoria (ids de CATEGORIAS_FOTO + custom 'planificacion')
MAPEO = [
    (2, 31, "mapa_ubicacion"),       # Hoja 2 · mapa grande de referencias (1172x606)
    (2, 58, "ofertas_comparables"),  # Referencia (fachada comparable)
    (2, 59, "ofertas_comparables"),  # Referencia
    (2, 60, "ofertas_comparables"),  # Referencia
    (4, 65, "mapa_referencias"),     # Hoja 4 · "Ubicación" (mapa chico → ranura refMapa)
    (4, 71, "planificacion"),        # "Planificación" (custom, como VP-0067/Caso 2)
    (4, 28, "fachada_exterior"),     # "Fachada"
    (4, 67, "living_comedor"),       # "Living"
    (4, 66, "living_comedor"),       # "Cocina americana - Comedor"
    (4, 69, "cocina"),               # "Cocina"
    (4, 68, "banos"),                # "Baño"
    (5, 75, "habitaciones"),         # "Dormitorio"
    (5, 78, "habitaciones"),         # "Dormitorio"
    (5, 76, "living_comedor"),       # "Terraza" (salida desde living)
    (5, 77, "cocina"),               # "Espacio lavadora" (contiguo a cocina)
    (5, 81, "fachada_exterior"),     # "Acceso edificio - Seguridad"
]
# Excluidas a propósito (cap 16, mismo criterio del Caso 2): p5 xref70 "Sector",
# p6 xref80 "Piscina", xref79 "Quincho", xref74 "Salón multiusos".

def to_datauri(pix):
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    w, h = img.size
    scale = min(1.0, 1000.0 / max(w, h))
    if scale < 1.0:
        img = img.resize((int(w * scale), int(h * scale)))
    def encode(im, q):
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=q)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    for shrink in (1.0, 0.85, 0.7, 0.55):
        im = img if shrink == 1.0 else img.resize(
            (max(1, int(img.size[0] * shrink)), max(1, int(img.size[1] * shrink))))
        for q in (82, 70, 58, 45, 32):
            uri = encode(im, q)
            if len(uri) <= MAXURI:
                return uri, len(uri)
    return uri, len(uri)

d = pymupdf.open(PDF)
fotos = []
for orden, (pidx, xref, cat) in enumerate(MAPEO):
    pix = pymupdf.Pixmap(d, xref)
    if pix.n > 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    uri, nbytes = to_datauri(pix)
    fotos.append({"pagina": pidx + 1, "xref": xref, "categoria": cat,
                  "orden": orden, "bytes": nbytes, "dataUri": uri})

resumen = {}
for f in fotos:
    resumen[f["categoria"]] = resumen.get(f["categoria"], 0) + 1
json.dump({"total": len(fotos), "porCategoria": resumen, "fotos": fotos}, open(OUT, "w"))
print("OK", OUT, "total:", len(fotos), "porCategoria:", resumen,
      "bytes max:", max(f["bytes"] for f in fotos))
