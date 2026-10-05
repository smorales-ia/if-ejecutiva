#!/usr/bin/env python3
"""Extrae y categoriza las fotos del PDF oráculo del Caso 2 (AGH-1548).
Mapeo DETERMINISTA por xref (inventario verificado con pymupdf el 2026-10-05:
rótulos debajo de cada foto en pp. 5-6; Hoja 2 en p. 3). Recomprime a JPEG y
vuelca data-URIs ≤95k chars a caso2-fotos.json. Solo lectura del oráculo.
Cap a 16 fotos (paridad VP-0067; caso 1 con 18 spill-eó a 11 páginas)."""
import pymupdf, io, base64, json
from PIL import Image

PDF = "docs/_referencias/5tasaciones/Informe JANETH PATRICIA CANDO ARIAS.pdf"
OUT = "docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/caso2-fotos.json"
MAXURI = 95000

# (página idx, xref) -> categoria (ids de CATEGORIAS_FOTO + custom 'planificacion')
MAPEO = [
    (2, 31, "mapa_ubicacion"),       # Hoja 2 · mapa grande de referencias
    (2, 64, "ofertas_comparables"),  # Referencia 1 (fachada)
    (2, 65, "ofertas_comparables"),  # Referencia 2
    (2, 66, "ofertas_comparables"),  # Referencia 3
    (4, 73, "mapa_referencias"),     # Hoja 4 · "Ubicación" (mapa chico → ranura refMapa)
    (4, 74, "planificacion"),        # "Planificación" (custom, como VP-0067)
    (4, 75, "fachada_exterior"),     # "Fachada"
    (4, 77, "living_comedor"),       # "Living"
    (4, 78, "living_comedor"),       # "Comedor"
    (4, 79, "cocina"),               # "Cocina"
    (4, 80, "cocina"),               # "Cocina"
    (5, 83, "habitaciones"),         # "Dormitorio"
    (5, 84, "habitaciones"),         # "Dormitorio"
    (5, 85, "habitaciones"),         # "Dormitorio"
    (5, 87, "habitaciones"),         # "Dormitorio"
    (5, 86, "living_comedor"),       # "living" (2ª toma)
]
# Excluidas a propósito (cap 16): p5 xref76 "Sector", p6 xref89 "Quinchos",
# xref90 "Sala multiuso", xref88 "Numeración/Nombre de la calle".

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
