"""Construye el DOCX de la hoja Impresion (y Tapa) del xlsm.

Uso: python construir.py <xlsm> <geometria_impresion.tsv> <salida.docx> [--etiquetas mapa.json]
Sin --etiquetas genera la versión ESTÁTICA (valores e imágenes del propio xlsm) para validar la
geometría contra el PDF original.
"""
import argparse, csv, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xl_modelo import cargar_hoja, cargar_geometria, anclas_dibujo
from docx_escritor import Conversor, Pagina, xml_imagen, xml_forma, empaquetar, sectpr, parrafo_ancla, rpr, run_texto, tw

EMU = 12700

IMPRESION = dict(
    hoja="Impresion", area="A1:BW554",
    anchos_json=os.path.join(os.path.dirname(os.path.abspath(__file__)), "anchos_impresos.json"),
    paginas=[(1, 85), (86, 143), (144, 218), (219, 302), (303, 386), (387, 470), (471, 554)],
    o=dict(kx=0.6137, ky=0.5845, kf=0.6, ksx=0.602, forma_dy=-1.1, x0=16.44, y0=15.02, pad=1.27, tbl_ind=0.0,
           indent_pt=7.5 * 0.6137, pad_char_pt=3.4, after_bottom=18, after_center=36),
)


def bgr(v):
    v = int(v)
    return f"{v & 255:02X}{(v >> 8) & 255:02X}{(v >> 16) & 255:02X}"


def formas_pagina(cfg, shapes, rows, anclas, z_xlsm, pag, imagenes, excluir, media, ids):
    """XML de las formas cuyo borde superior cae en la página."""
    o = cfg["o"]
    r0, r1 = pag
    top0, top1 = rows[r0][0], rows[r1][0] + rows[r1][1]
    out = []
    for s in sorted(shapes, key=lambda s: s["z"]):
        a = anclas[s["z"] - 1]           # el dibujo del xlsm está en el mismo orden Z que COM
        if not s["visible"] or s["w"] <= 0.5 and s["h"] <= 0.5 or a.get("_pt") is None:
            continue
        ax, ay, aw, ah = a["_pt"]
        if s["tipo"] == 8 or s["left"] >= o.get("x_max", 927) or not (top0 - 1 <= ay < top1):
            continue
        if s["nombre"] in excluir or (s["nombre"], s["tl"]) in excluir:
            continue
        # Horizontal: posición de la forma (COM) × 0,60; vertical: por la grilla de filas (ancla).
        x = o.get("forma_x0", o["x0"]) + s["left"] * o["ksx"]
        y = o["y0"] + (ay - top0) * o["ky"] + o.get("forma_dy", 0)
        w, h = s["w"] * o["ksx"], ah * o["ky"]
        ids[0] += 1
        id_ = ids[0]
        z = 251658240 + s["z"] * 1024
        if s["tipo"] == 13:
            clave = (s["nombre"], s["tl"])
            if clave in imagenes:          # casilla variable de Carbone
                tag, datos, nombre = imagenes[clave]
                rid = f"rIdImg{id_}"
                media.append((rid, nombre, datos))
                out.append(xml_imagen(id_, x, y, w, h, z, rid, tag))
            else:                           # imagen fija del xlsm
                if a["media"] is None:
                    print("  sin media:", s["nombre"], s["tl"])
                    continue
                datos = z_xlsm.read(a["media"])
                ext = a["media"].rsplit(".", 1)[-1].lower()
                rid = f"rIdImg{id_}"
                media.append((rid, f"x{id_}.{ext}", datos))
                rec = re.search(r"<a:srcRect[^>]*/>", a["xml"])
                out.append(xml_imagen(id_, x, y, w, h, z, rid, "", rec.group(0) if rec else ""))
        elif s["tipo"] in (1, 17):
            relleno = bgr(s["fill"].split("|")[0]) if s["fill"] else None
            linea = None
            if s["line"]:
                col, peso, _ = s["line"].split("|")
                linea = (bgr(col), float(peso.replace(",", ".")) * o["ksx"])
            txt = ""
            ins = (0, 0, 0, 0)
            anchor = "t"
            if s["texto"]:
                p = s["fuente"].split("|")
                nombre, tam, neg, col, alin = p[0], float(p[1].replace(",", ".")), p[2] == "-1", bgr(p[3]), p[4]
                mm = re.search(r"m=([\d,]+)", s["fuente"]).group(1).split(",")
                mars = [float(mm[i] + "." + mm[i + 1]) for i in range(0, len(mm), 2)]
                va = re.search(r"va=(\d)", s["fuente"]).group(1)
                ins = (mars[0] * o["ksx"], mars[2] * o["ky"], mars[1] * o["ksx"], mars[3] * o["ky"])
                anchor = {"1": "t", "3": "ctr", "4": "b"}.get(va, "t")
                f = dict(nombre=nombre, sz=tam, b=neg, i=False, u=False, color=col)
                jc = {"1": "left", "2": "center", "3": "right"}.get(alin, "left")
                txt = (f'<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="{jc}"/></w:pPr>'
                       + run_texto(s["texto"], rpr(f, o["kf"])) + "</w:p>")
            out.append(xml_forma(id_, x, y, w, h, z, relleno, linea, txt, ins, anchor))
    return "".join(out)


def buscar_ancla(s, anclas):
    mejor, dist = None, 9e9
    for a in anclas:
        if a.get("_pt") is None:
            continue
        x, y, w, h = a["_pt"]
        d = abs(x - s["left"]) + abs(y - s["top"]) + abs(w - s["w"]) + abs(h - s["h"])
        if d < dist:
            mejor, dist = a, d
    return mejor if dist < 6 else None


def preparar_anclas(anclas, cols, rows):
    for a in anclas:
        if not a["desde"] or not a["hasta"]:
            a["_pt"] = None
            continue
        c, co, r, ro = a["desde"]
        c2, co2, r2, ro2 = a["hasta"]
        if c + 1 not in cols or c2 + 1 not in cols or r + 1 not in rows or r2 + 1 not in rows:
            a["_pt"] = None
            continue
        x = cols[c + 1][0] + co / EMU
        y = rows[r + 1][0] + ro / EMU
        x2 = cols[c2 + 1][0] + co2 / EMU
        y2 = rows[r2 + 1][0] + ro2 / EMU
        a["_pt"] = (x, y, x2 - x, y2 - y)


def construir(xlsm, geo, salida, cfg=IMPRESION, etiquetas=None, imagenes=None, excluir=(), sobre=None, textos_excel=None):
    cols, rows, shapes = cargar_geometria(geo)
    if cfg.get("anchos_json"):
        aj = json.load(open(cfg["anchos_json"]))
        cfg["o"]["anchos"] = aj["anchos"]
    modelo = cargar_hoja(xlsm, cfg["hoja"], cfg["area"], textos_excel)
    anclas, z = anclas_dibujo(xlsm, cfg["hoja"])
    preparar_anclas(anclas, cols, rows)
    conv = Conversor(modelo, cols, rows, cfg["o"], etiquetas, sobre)
    media, ids = [], [0]
    cuerpo = []
    for i, (r0, r1) in enumerate(cfg["paginas"]):
        f = formas_pagina(cfg, shapes, rows, anclas, z, (r0, r1), imagenes or {}, set(excluir), media, ids)
        cuerpo.append(parrafo_ancla(i > 0, f))
        cuerpo.append(conv.xml_tabla(Pagina(r0, r1)))
    cuerpo.append('<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/><w:rPr><w:sz w:val="2"/></w:rPr></w:pPr></w:p>')
    o = cfg["o"]
    empaquetar(salida, "".join(cuerpo), sectpr(top=o["y0"] - 1.0, left=o["x0"], right=0, bottom=0), media)
    print("OK", salida, "media", len(media), "bytes", os.path.getsize(salida))


def textos_tsv(ruta):
    d = {}
    for r in csv.DictReader(open(ruta, encoding="utf-8"), delimiter="\t", quoting=csv.QUOTE_NONE):
        d[r["dir"]] = r["texto"]
    return d


EXCLUIR_IMPRESION = {
    # Mapa de referencias (Hoja 2): marcas y flechas dibujadas sobre el mapa del caso MET-6283.
    "27 Elipse", "28 Conector recto de flecha", "30 Conector recto de flecha", "32 Conector recto de flecha",
    "33 Elipse", "38 Elipse", "39 Elipse", "41 Conector recto de flecha", "8 Rectángulo", "42 Elipse",
    # Rectángulos blancos bajo el plano del anexo 1 (quedan tapados por la imagen).
    "Rectangle 39", "Rectangle 71", "Rectangle 104", "Rectangle 137", "Rectangle 170", "Rectangle 203", "Rectangle 115",
}

def marcador_png(texto):
    """PNG gris de 4×4 con un comentario propio: cada casilla de imagen necesita bytes únicos (v7)."""
    import io, struct, zlib
    from PIL import Image
    b = io.BytesIO()
    Image.new("RGB", (4, 4), (200, 200, 200)).save(b, "PNG")
    datos = b.getvalue()
    cuerpo = b"Comment\x00" + texto.encode()
    bloque = struct.pack(">I", len(cuerpo)) + b"tEXt" + cuerpo + struct.pack(">I", zlib.crc32(b"tEXt" + cuerpo) & 0xFFFFFFFF)
    i = datos.rfind(b"IEND") - 4
    return datos[:i] + bloque + datos[i:]


def imagenes_carbone(mapa):
    out = {}
    for n, (clave, (ruta, ajuste)) in enumerate(mapa.items()):
        tag = f"{{d.{ruta}:imageFit({ajuste})}}"
        out[clave] = (tag, marcador_png(f"casilla {n} {ruta}"), f"marcador_{n:02d}.png")
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("xlsm"); ap.add_argument("geo"); ap.add_argument("salida")
    ap.add_argument("--textos")
    ap.add_argument("--con-marcas", action="store_true", help="incluir las marcas del mapa de referencias (estático)")
    ap.add_argument("--etiquetas", action="store_true", help="plantilla Carbone (etiquetas e imágenes variables)")
    a = ap.parse_args()
    excl = set() if a.con_marcas else set(EXCLUIR_IMPRESION)
    tx = textos_tsv(a.textos) if a.textos else None
    if a.etiquetas:
        import etiquetas_impresion as ei
        excl |= ei.EXCLUIR_EXTRA
        construir(a.xlsm, a.geo, a.salida, etiquetas=ei.ETIQUETAS, imagenes=imagenes_carbone(ei.IMAGENES), excluir=excl,
                  textos_excel=tx)
    else:
        construir(a.xlsm, a.geo, a.salida, excluir=excl, textos_excel=tx)
