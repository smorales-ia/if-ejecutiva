#!/usr/bin/env python3
"""Extrae y categoriza las fotos del PDF oráculo del Caso 3 (ALH -335).
Mapeo DETERMINISTA por xref (inventario verificado con pymupdf el 2026-10-05:
rótulos debajo de cada foto en pp. 5-6; Hoja 2 en p. 3). Recomprime a JPEG y
vuelca data-URIs ≤95k chars a caso3-fotos.json. Solo lectura del oráculo.
16 fotos exactas (sin cap que aplicar: anexos pp. 7-8 y foto principal de
Hoja 1 quedan fuera, como en los casos 1-2)."""
import pymupdf, io, base64, json
from PIL import Image

PDF = "docs/_referencias/5tasaciones/Informe MIGUENSON RAMEAU.pdf"
OUT = "docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/caso3-fotos.json"
MAXURI = 95000

# (página idx, xref) -> categoria (ids de CATEGORIAS_FOTO + custom 'planificacion')
MAPEO = [
    (2, 30, "mapa_ubicacion"),       # Hoja 2 · mapa grande de referencias
    (2, 41, "ofertas_comparables"),  # Referencia 1 (fachada)
    (2, 42, "ofertas_comparables"),  # Referencia 2
    (2, 43, "ofertas_comparables"),  # Referencia 3
    (4, 48, "mapa_referencias"),     # Hoja 4 · "Ubicación" (mapa chico → ranura refMapa)
    (4, 55, "planificacion"),        # "Planificación" (custom, como VP-0067)
    (4, 49, "fachada_exterior"),     # "Fachada"
    (4, 50, "fachada_exterior"),     # "Sector" (2ª toma exterior)
    (4, 51, "living_comedor"),       # "Living"
    (4, 52, "living_comedor"),       # "Comedor"
    (4, 53, "cocina"),               # "Cocina"
    (4, 54, "banos"),                # "Baño"
    (5, 60, "habitaciones"),         # "Dormitorio"
    (5, 61, "habitaciones"),         # "Dormitorio"
    (5, 59, "fachada_exterior"),     # "Entrada a la propiedad"
    (5, 58, "fachada_exterior"),     # "Interior de Block"
]
# Excluidas a propósito: p2 xref26 (foto principal Hoja 1, duplica Fachada),
# anexos pp.7-8 (SII/plano/TGR — riel documental, no registro fotográfico),
# logos/membretes (xref 11/19/27/31/33 y los <200px de ancho).

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
