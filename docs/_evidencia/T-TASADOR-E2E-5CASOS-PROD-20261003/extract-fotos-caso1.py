#!/usr/bin/env python3
"""Extrae y categoriza las fotos del PDF oráculo del Caso 1.
Categoriza por proximidad al rótulo de texto en la página. Recomprime a
JPEG <=95KB y vuelca data-URIs a caso1-fotos.json. Solo lectura del oráculo."""
import pymupdf, io, base64, json, os
from PIL import Image

PDF = "docs/_referencias/5tasaciones/Informe ALEJANDRO AVILA DURAN (II).pdf"
OUT = "docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003/caso1-fotos.json"
# El campo thumbnail_url (long text de Airtable) capea el STRING en ~100k chars.
# El data-URI base64 infla el JPEG +33%; apuntamos a <=95000 chars de data-URI
# (contrato imagenes.ts §4: "data-URI JPEG <=95k chars"). => JPEG <= ~70KB.
MAXURI = 95000

# rótulo de texto -> categoria id (CATEGORIAS_FOTO)
LABELS = [
    ("referencia", "ofertas_comparables"),
    ("cocina", "cocina"),
    ("living", "living_comedor"),
    ("comedor", "living_comedor"),
    ("estar", "living_comedor"),
    ("dormitorio", "habitaciones"),
    ("suite", "habitaciones"),
    ("baño", "banos"),
    ("bano", "banos"),
    ("estacionamiento", "estacionamientos"),
    ("fachada", "fachada_exterior"),
    ("ubicaci", "mapa_ubicacion"),
    ("emplazamiento", "mapa_ubicacion"),
    ("mapa", "mapa_referencias"),
]

def to_datauri(pix):
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    # cabe en 1000px lado mayor
    w, h = img.size
    scale = min(1.0, 1000.0 / max(w, h))
    if scale < 1.0:
        img = img.resize((int(w*scale), int(h*scale)))
    def encode(im, q):
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=q)
        b = buf.getvalue()
        return "data:image/jpeg;base64," + base64.b64encode(b).decode()
    # baja calidad y, si no alcanza, resolución, hasta que el data-URI <= MAXURI chars
    for shrink in (1.0, 0.85, 0.7, 0.55):
        im = img if shrink == 1.0 else img.resize((max(1, int(img.size[0]*shrink)), max(1, int(img.size[1]*shrink))))
        for q in (82, 70, 58, 45, 32):
            uri = encode(im, q)
            if len(uri) <= MAXURI:
                return uri, len(uri)
    return uri, len(uri)  # último intento (mejor esfuerzo)

def categoria_por_proximidad(page, rect):
    """Rótulo de texto cuyo centro esté más cerca del centro de la imagen."""
    cx, cy = (rect.x0+rect.x1)/2, (rect.y0+rect.y1)/2
    best, bestd = None, 1e9
    for w in page.get_text("words"):  # x0,y0,x1,y1,word,...
        txt = w[4].lower()
        for key, cat in LABELS:
            if key in txt:
                wx, wy = (w[0]+w[2])/2, (w[1]+w[3])/2
                # preferencia a rótulos por encima de la imagen
                d = ((wx-cx)**2 + (wy-cy)**2) ** 0.5 + (40 if wy > cy else 0)
                if d < bestd:
                    bestd, best = d, cat
    return best

d = pymupdf.open(PDF)
fotos = []
# Páginas de fotos de propiedad/referencias: 3 (idx2), 5 (idx4), 6 (idx5)
# Página 3: mapa grande + 3 referencias. Págs 5-6: interiores.
PAGINAS_FOTO = {2: "ref", 4: "int", 5: "int"}
MIN_AREA = 150*150

for pidx, kind in PAGINAS_FOTO.items():
    page = d[pidx]
    for im in page.get_images(full=True):
        xref = im[0]
        try:
            rects = page.get_image_rects(xref)
            pix = pymupdf.Pixmap(d, xref)
        except Exception:
            continue
        if pix.width*pix.height < MIN_AREA:
            pix = None; continue
        rect = rects[0] if rects else pymupdf.Rect(0, 0, 0, 0)
        if pidx == 2:
            # Pág 3 (Hoja N°2 · referencias): layout fijo del formato Value Property.
            # Mapa grande -> mapa_ubicacion; 3 fotos medianas -> ofertas_comparables
            # (ranuras ref1/2/3); panorámico ancho/bajo -> mapa_referencias.
            w, h = pix.width, pix.height
            if w > 900:
                cat = "mapa_ubicacion"
            elif w > 320 and h > 250:
                cat = "ofertas_comparables"
            else:
                cat = "mapa_referencias"
        else:
            cat = categoria_por_proximidad(page, rect)
            if cat in (None, "mapa_ubicacion", "mapa_referencias", "ofertas_comparables"):
                # en páginas de interiores no hay mapas/refs: cae a interior genérico
                cat = cat if cat in ("cocina", "banos", "living_comedor", "habitaciones") else "fachada_exterior"
        datauri, nbytes = to_datauri(pix)
        pix = None
        fotos.append({
            "pagina": pidx+1, "xref": xref, "w": im and 0,
            "categoria": cat, "bytes": nbytes, "dataUri": datauri,
        })

# Orden y numeración por categoría; cap grilla 16 pero mantener ranuras clave
# asignar 'orden' global ascendente estable
for i, f in enumerate(fotos):
    f["orden"] = i

resumen = {}
for f in fotos:
    resumen[f["categoria"]] = resumen.get(f["categoria"], 0) + 1

json.dump({"total": len(fotos), "porCategoria": resumen, "fotos": fotos},
          open(OUT, "w"))
print("OK", OUT)
print("total:", len(fotos), "· porCategoria:", resumen)
print("bytes max:", max((f["bytes"] for f in fotos), default=0))
