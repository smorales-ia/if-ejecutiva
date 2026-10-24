"""Escribe un DOCX que reproduce la impresión de una hoja de Excel.

Una tabla por página impresa (alto de fila exacto, anchos fijos), precedida de un párrafo de 1 pt
que lleva las formas flotantes de esa página (imágenes, cuadros de texto, recuadros) ancladas a la
página con posición absoluta. Pensado para Carbone (LibreOffice) — sin estilos de Word salvo los
mínimos.
"""
import os, re, zipfile
from xml.sax.saxutils import escape
from PIL import ImageFont

EMU = 12700
FUENTES = {
    ("calibri", False): "calibri.ttf", ("calibri", True): "calibrib.ttf",
    ("arial", False): "arial.ttf", ("arial", True): "arialbd.ttf",
    ("arial narrow", False): "ARIALN.TTF", ("arial narrow", True): "ARIALNB.TTF",
}
_cache = {}


def ancho_texto(texto, nombre, pt, negrita):
    clave = (nombre.lower(), negrita)
    archivo = FUENTES.get(clave) or FUENTES[("calibri", negrita)]
    k = (archivo, round(pt * 10))
    if k not in _cache:
        _cache[k] = ImageFont.truetype(os.path.join(r"C:\Windows\Fonts", archivo), size=max(1, round(pt * 10)))
    return _cache[k].getlength(texto) / 10.0


def tw(pt):
    return int(round(pt * 20))


ESTILO_BORDE = {
    "thin": ("single", 5), "hair": ("single", 2), "medium": ("single", 10), "thick": ("single", 14),
    "dashed": ("dashed", 5), "dotted": ("dotted", 5), "double": ("double", 3), "mediumDashed": ("dashed", 10),
    "dashDot": ("dotDash", 5), "mediumDashDot": ("dotDash", 10), "dashDotDot": ("dotDotDash", 5),
    "mediumDashDotDot": ("dotDotDash", 10), "slantDashDot": ("dotDash", 10),
}


def ancho_borde(b):
    if b is None:
        return 0.0
    val, sz = ESTILO_BORDE.get(b.estilo, ("single", 5))
    return sz / 8.0 * (3 if val == "double" else 1)


def xml_borde(lado, b):
    if b is None:
        return f'<w:{lado} w:val="nil"/>'
    val, sz = ESTILO_BORDE.get(b.estilo, ("single", 5))
    return f'<w:{lado} w:val="{val}" w:sz="{sz}" w:space="0" w:color="{b.color}"/>'


def rpr(f, kf, extra_color=None, negrita=None, escala=1.0):
    tam = f["sz"] * kf
    hp = max(2, int(round(tam * 2)))
    esc = int(round(tam * 2 / hp * 100 * escala))
    nombre = escape(f["nombre"])
    s = f'<w:rFonts w:ascii="{nombre}" w:hAnsi="{nombre}" w:cs="{nombre}" w:eastAsia="{nombre}"/>'
    b = f["b"] if negrita is None else negrita
    if b:
        s += "<w:b/><w:bCs/>"
    if f["i"]:
        s += "<w:i/>"
    if f["u"]:
        s += '<w:u w:val="single"/>'
    col = extra_color or f["color"]
    if col and col != "000000":
        s += f'<w:color w:val="{col}"/>'
    if esc != 100:
        s += f'<w:w w:val="{esc}"/>'
    s += f'<w:sz w:val="{hp}"/><w:szCs w:val="{hp}"/>'
    return f"<w:rPr>{s}</w:rPr>"


def run_texto(texto, rp):
    partes = texto.split("\n")
    out = []
    for i, p in enumerate(partes):
        if i:
            out.append(f"<w:r>{rp}<w:br/></w:r>")
        if p:
            out.append(f'<w:r>{rp}<w:t xml:space="preserve">{escape(p)}</w:t></w:r>')
    return "".join(out)


class Pagina:
    def __init__(self, r0, r1):
        self.r0, self.r1 = r0, r1


class Conversor:
    """opciones: kx, ky, kf (fuente), ksx (formas en x), x0, y0 (pt de página), pad (pt), y_off_pagina."""

    def __init__(self, modelo, cols, rows, opciones, etiquetas=None, sobre=None):
        self.m = modelo
        self.cols, self.rows = cols, rows
        self.o = opciones
        self.etq = etiquetas or {}       # (r,c) -> texto con etiquetas Carbone (reemplaza el texto)
        self.sobre = sobre or {}         # (r,c) -> dict de ajustes (h, simbolo, fuente…)
        r0, c0, r1, c1 = modelo["area"]
        self.c0, self.c1 = c0, c1
        kx = opciones["kx"]
        # Bordes de columna acumulados en twips (sin error acumulado de redondeo).
        base = cols[c0][0]
        if opciones.get("anchos"):
            # Anchos impresos medidos en el PDF original (Excel redondea cada columna a su manera).
            acc, self.bx = 0.0, [0]
            for w in opciones["anchos"][: c1 - c0 + 1]:
                acc += w
                self.bx.append(tw(acc))
        else:
            self.bx = [tw((cols[c][0] - base) * kx) for c in range(c0, c1 + 1)] + [tw((cols[c1][0] + cols[c1][1] - base) * kx)]
        self.anchos = [self.bx[i + 1] - self.bx[i] for i in range(c1 - c0 + 1)]
        self._cov = {}
        for (a, b, c, d) in modelo["merges"]:
            for rr in range(a, c + 1):
                for cc in range(b, d + 1):
                    self._cov[(rr, cc)] = (a, b, c, d)
        self.cf = modelo["cf"]

    # ---------------------------------------------------------- utilidades de celda
    def celda(self, r, c):
        return self.m["celdas"].get((r, c))

    def texto(self, r, c):
        if "texto" in self.sobre.get((r, c), {}):
            return self.sobre[(r, c)]["texto"]
        if (r, c) in self.etq:
            return self.etq[(r, c)]
        k = self.celda(r, c)
        return k.texto if k else ""

    def relleno(self, r, c):
        e = self.cf.get((r, c), {})
        if "relleno" in e:
            v = e["relleno"]
        else:
            k = self.celda(r, c)
            v = k.relleno if k else None
        return None if v in (None, "FFFFFF") else v

    def borde_propio(self, r, c, lado):
        k = self.celda(r, c)
        return k.bordes[lado] if k else None

    def borde(self, r, c, lado):
        """Borde efectivo de una celda de Excel en un lado (propio o del vecino)."""
        b = self.borde_propio(r, c, lado)
        if b is not None:
            return b
        vec = {"l": (r, c - 1, "r"), "r": (r, c + 1, "l"), "t": (r - 1, c, "b"), "b": (r + 1, c, "t")}[lado]
        rr, cc, ll = vec
        pag = getattr(self, "_pag", None)
        if pag is not None and not (pag.r0 <= rr <= pag.r1):
            return None      # Excel no imprime en una página los bordes de celdas de otra página
        # Un borde de una celda combinada vecina se aplica sólo si es del perímetro de esa combinación.
        return self.borde_propio(rr, cc, ll)

    def borde_rango(self, a, b, c, d, lado):
        if lado == "t":
            cand = [self.borde(a, cc, "t") for cc in range(b, d + 1)]
        elif lado == "b":
            cand = [self.borde(c, cc, "b") for cc in range(b, d + 1)]
        elif lado == "l":
            cand = [self.borde(rr, b, "l") for rr in range(a, c + 1)]
        else:
            cand = [self.borde(rr, d, "r") for rr in range(a, c + 1)]
        for x in cand:
            if x is not None:
                return x
        return None

    def _alto_celda(self, r, c):
        mg = self._cov.get((r, c))
        r0, r1 = (mg[0], mg[2]) if mg else (r, r)
        return sum(self.rows[x][1] for x in range(r0, r1 + 1)) * self.o["ky"]

    def ancho_pt(self, c_ini, c_fin):
        return (self.bx[c_fin + 1 - self.c0] - self.bx[c_ini - self.c0]) / 20.0

    # ---------------------------------------------------------- fila → celdas Word
    def celdas_fila(self, r, pag):
        out = []
        c = self.c0
        while c <= self.c1:
            mg = self._cov.get((r, c))
            if mg:
                a, b, cc, d = mg
                a2, cc2 = max(a, pag.r0), min(cc, pag.r1)
                if c != b:
                    c += 1
                    continue
                cont = r > a2
                out.append(dict(c0=b, c1=d, r0=a2, r1=cc2, merge=True, vm=("cont" if cont else ("restart" if cc2 > a2 else None)),
                                fuente=(a, b)))
                c = d + 1
            else:
                out.append(dict(c0=c, c1=c, r0=r, r1=r, merge=False, vm=None, fuente=(r, c)))
                c += 1
        self._desbordar(out, r)
        self._colapsar(out, r)
        return out

    def _vacia(self, x, r):
        return not x["merge"] and self.texto(r, x["c0"]) == "" and (r, x["c0"]) not in self.etq

    def _compatible(self, a, b, r, cruzar_borde=False):
        """¿Se pueden juntar las celdas sencillas a (izq.) y b (der.) sin cambiar el aspecto?
        cruzar_borde: el texto que desborda en Excel tapa el borde vertical entre celdas vacías."""
        ca, cb = a["c1"], b["c0"]
        if self.relleno(r, ca) != self.relleno(r, cb):
            return False
        if not cruzar_borde and (self.borde(r, ca, "r") is not None or self.borde(r, cb, "l") is not None):
            return False
        if self.borde(r, ca, "t") != self.borde(r, cb, "t") or self.borde(r, ca, "b") != self.borde(r, cb, "b"):
            return False
        return True

    def _desbordar(self, out, r):
        pad = self.o["pad"]
        i = 0
        while i < len(out):
            x = out[i]
            if x["merge"]:
                i += 1
                continue
            c = x["c0"]
            k = self.celda(r, c)
            t = self.texto(r, c)
            if not t or k is None or k.wrap or k.rot or k.simbolo:
                i += 1
                continue
            h = self.sobre.get((r, c), {}).get("h", k.h)
            num = k.es_num
            if h == "general":
                h = "right" if num else "left"
            if num and h != "centerContinuous":
                i += 1
                continue
            es_etq = (r, c) in self.etq
            t_med = k.texto if es_etq else t
            f = k.fuente
            nec = (ancho_texto(t_med, f["nombre"], f["sz"] * self.o["kf"], f["b"]) + 2 * pad) if t_med else 0
            # 1) sobre celdas vacías sin borde entre medio: todo lo posible si es dato variable (puede ser más
            #    largo en otro caso), y si no, sólo lo necesario; 2) si aún falta, Excel sigue desbordando sobre
            #    celdas vacías aunque tengan borde (el texto lo tapa).
            if h in ("left", "justify", "fill", "distributed"):
                for cruzar in (False, True):
                    j = i
                    while (j + 1 < len(out) and self.ancho_pt(x["c0"], out[j]["c1"]) < (nec if cruzar or not es_etq else 9e9)
                           and self._vacia(out[j + 1], r) and self._compatible(out[j], out[j + 1], r, cruzar)):
                        j += 1
                    if j > i and self.ancho_pt(x["c0"], x["c1"]) < (nec if cruzar or not es_etq else 9e9):
                        x["c1"] = out[j]["c1"]
                        del out[i + 1:j + 1]
            elif h == "right":
                for cruzar in (False, True):
                    j = i
                    while (j - 1 >= 0 and self.ancho_pt(out[j]["c0"], x["c1"]) < (nec if cruzar or not es_etq else 9e9)
                           and self._vacia(out[j - 1], r) and self._compatible(out[j - 1], out[j], r, cruzar)):
                        j -= 1
                    if j < i and self.ancho_pt(x["c0"], x["c1"]) < (nec if cruzar or not es_etq else 9e9):
                        x["c0"] = out[j]["c0"]
                        del out[j:i]
                        i = j
            elif h == "center":
                izq, der = i, i
                while self.ancho_pt(out[izq]["c0"], out[der]["c1"]) < nec:
                    ok_i = izq - 1 >= 0 and self._vacia(out[izq - 1], r) and self._compatible(out[izq - 1], out[izq], r)
                    ok_d = der + 1 < len(out) and self._vacia(out[der + 1], r) and self._compatible(out[der], out[der + 1], r)
                    if not (ok_i and ok_d):
                        break
                    izq, der = izq - 1, der + 1
                if izq < i or der > i:
                    x["c0"], x["c1"] = out[izq]["c0"], out[der]["c1"]
                    del out[i + 1:der + 1]
                    del out[izq:i]
                    i = izq
            elif h == "centerContinuous":
                j = i
                while j + 1 < len(out) and self._vacia(out[j + 1], r):
                    kk = self.celda(r, out[j + 1]["c0"])
                    if kk is None or kk.h != "centerContinuous":
                        break
                    j += 1
                if j > i:
                    x["c1"] = out[j]["c1"]
                    del out[i + 1:j + 1]
            i += 1

    def _colapsar(self, out, r):
        i = 0
        while i + 1 < len(out):
            a, b = out[i], out[i + 1]
            if (not a["merge"] and not b["merge"] and a["c0"] == a["c1"] or a.get("vacio_grupo")) and False:
                pass
            if not a["merge"] and not b["merge"] and self._vacia_rango(a, r) and self._vacia_rango(b, r) and self._compatible(a, b, r):
                a["c1"] = b["c1"]
                a["vacio_grupo"] = True
                del out[i + 1]
            else:
                i += 1

    def _vacia_rango(self, x, r):
        return all(self.texto(r, c) == "" and (r, c) not in self.etq for c in range(x["c0"], x["c1"] + 1))

    # ---------------------------------------------------------- XML de celda
    def xml_celda(self, x, r):
        span = x["c1"] - x["c0"] + 1
        w = self.bx[x["c1"] + 1 - self.c0] - self.bx[x["c0"] - self.c0]
        fr, fc = x["fuente"]
        if x["merge"]:
            a, b, c, d = self._cov[(fr, fc)]
            a, c = x["r0"], x["r1"]
            bt = self.borde_rango(a, b, c, d, "t") if x["vm"] != "cont" else None
            bb = self.borde_rango(a, b, c, d, "b") if (x["vm"] is None or r == x["r1"]) else None
            if x["vm"] == "restart":
                bb = None
            bl = self.borde_rango(r, b, r, d, "l")
            br = self.borde_rango(r, b, r, d, "r")
            if x["vm"] in ("restart", "cont"):
                bl = self.borde_rango(a, b, c, d, "l")
                br = self.borde_rango(a, b, c, d, "r")
            if x["vm"] == "cont" and r == x["r1"]:
                bb = self.borde_rango(a, b, c, d, "b")
        else:
            bt = next((v for v in (self.borde(r, cc, "t") for cc in range(x["c0"], x["c1"] + 1)) if v is not None), None)
            bb = next((v for v in (self.borde(r, cc, "b") for cc in range(x["c0"], x["c1"] + 1)) if v is not None), None)
            bl = self.borde(r, x["c0"], "l")
            br = self.borde(r, x["c1"], "r")
        k = self.celda(fr, fc)
        rel = self.relleno(fr, fc)
        p = [f'<w:tcW w:w="{w}" w:type="dxa"/>']
        if span > 1:
            p.append(f'<w:gridSpan w:val="{span}"/>')
        if x["vm"] == "restart":
            p.append('<w:vMerge w:val="restart"/>')
        elif x["vm"] == "cont":
            p.append("<w:vMerge/>")
        p.append("<w:tcBorders>" + xml_borde("top", bt) + xml_borde("left", bl) + xml_borde("bottom", bb) + xml_borde("right", br) + "</w:tcBorders>")
        if rel:
            p.append(f'<w:shd w:val="clear" w:color="auto" w:fill="{rel}"/>')
        p.append("<w:noWrap/>" if not (k and k.wrap) else "")
        rot = k.rot if k else 0
        if rot == 90:
            p.append('<w:textDirection w:val="btLr"/>')
        elif rot == 180:
            p.append('<w:textDirection w:val="tbRl"/>')
        va = {"top": "top", "center": "center", "bottom": "bottom", "justify": "center", "distributed": "center"}.get(k.v if k else "bottom", "bottom")
        if rot in (90, 180) and k:
            # En texto girado, el centrado horizontal de Excel es el vertical de Word y viceversa.
            hh = {"center": "center", "left": "bottom", "right": "top", "general": "bottom"}.get(k.h, "center")
            va = "center" if k.v == "center" else ("bottom" if k.v == "bottom" else "top")
            va, jc_rot = {"center": "center"}.get(k.h, va), hh
        if k is not None and not k.rot and (not k.wrap or 1.22 * k.fuente["sz"] * self.o["kf"] > self._alto_celda(fr, fc) - 0.1):
            va = "bottom"     # la posición vertical la fija el párrafo (ver xml_parrafo)
        p.append(f'<w:vAlign w:val="{va}"/>')
        tcpr = "<w:tcPr>" + "".join(p) + "</w:tcPr>"
        if x["vm"] == "cont":
            return f"<w:tc>{tcpr}<w:p><w:pPr><w:rPr><w:sz w:val=\"2\"/></w:rPr></w:pPr></w:p></w:tc>"
        if x["vm"] == "restart":
            a, b, c, d = self._cov[(fr, fc)]
            bb = self.borde_rango(x["r0"], b, x["r1"], d, "b")
        return f"<w:tc>{tcpr}{self.xml_parrafo(fr, fc, k, w, (ancho_borde(bt), ancho_borde(bb)))}</w:tc>"

    def xml_parrafo(self, r, c, k, w_tw, bordes_alto=(0.0, 0.0)):
        t = self.texto(r, c)
        if k is None or t == "":
            return '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:sz w:val="2"/></w:rPr></w:pPr></w:p>'
        s = self.sobre.get((r, c), {})
        h = s.get("h", k.h)
        num = k.es_num
        if h == "general":
            h = "right" if num else "left"
        if getattr(k, "estrella", False) and not s.get("simbolo", k.simbolo):
            h = "right"
        if k.rot in (90, 180):
            h = {"center": "center", "left": "left", "right": "right"}.get(h, "center")
        jc = {"left": "left", "right": "right", "center": "center", "centerContinuous": "center", "justify": "both",
              "distributed": "distribute", "fill": "left"}.get(h, "left")
        e = self.cf.get((r, c), {})
        f = s.get("fuente", k.fuente)
        tam = f["sz"] * self.o["kf"]
        pad = s.get("pad", k.pad)
        escala = 1.0
        if not k.wrap and not k.rot:
            # Texto de una línea que no cabe: Word lo partiría (y el alto exacto escondería la 2.ª línea).
            t_med = k.texto if (r, c) in self.etq else t
            disp = w_tw / 20.0 - 2 * self.o["pad"] - (pad * self.o["pad_char_pt"] if pad else 0)
            nec = ancho_texto((s.get("simbolo", k.simbolo) or "") + "  " + t_med if s.get("simbolo", k.simbolo) else t_med,
                              f["nombre"], tam, e.get("b", f["b"])) if t_med else 0
            if nec > disp > 0:
                es_etq = (r, c) in self.etq
                escala = max(0.6 if es_etq else 0.9, disp / nec * 0.98)
                if not es_etq and nec * 0.9 > disp and not s.get("simbolo", k.simbolo):
                    # Excel corta el texto en el borde de la celda: se dejan los caracteres que caben.
                    escala = 1.0
                    while len(t) > 1 and ancho_texto(t[:-1], f["nombre"], tam, e.get("b", f["b"])) > disp + self.o["pad"]:
                        t = t[:-1]
                    ancho_t = ancho_texto(t, f["nombre"], tam, e.get("b", f["b"]))
                    if ancho_t > disp:
                        escala = max(0.8, disp / ancho_t * 0.98)
        rp = rpr(f, self.o["kf"], extra_color=e.get("color"), negrita=e.get("b"), escala=escala)
        alto = self._alto_celda(r, c)
        bt_w, _ = bordes_alto
        linea = 'w:line="240" w:lineRule="auto"'
        after = 0
        una_linea = not k.wrap or 1.22 * tam > alto - 0.1   # con «ajustar texto» pero la línea no cabe
        if not k.rot and una_linea:
            # Texto de una línea: la celda va con alineación inferior en Word y la línea de base se ubica
            # donde la pone Excel. Medido en el PDF original (b = base sobre el pie de la celda):
            #   inferior b = 0,9 + 0,25·S · centrada b = H/2 − 0,75 − 0,11·S (S ≤ 9; H/2 − 0,3·S si mayor) · superior b = H − 0,3 − 0,93·S
            # LibreOffice con interlineado exacto L y espacio posterior a: b = a + 0,205·L, siempre que
            # L + a quepa en H menos el borde superior (el inferior no resta); no recorta letras si L < S.
            va = "center" if k.v in ("center", "justify", "distributed") else ("top" if k.v == "top" else "bottom")
            b = {"bottom": 0.9 + 0.25 * tam, "center": (alto / 2 - 0.75 - 0.11 * tam) if tam <= 9 else (alto / 2 - 0.3 * tam), "top": alto - 0.3 - 0.93 * tam}[va]
            disp = alto - bt_w - 0.06
            L = tam
            a = b - 0.205 * L
            if a < 0:
                a = 0.0
            if L + a > disp:
                L = max(0.3 * tam, (disp - b) / 0.795)
                a = max(0.0, b - 0.205 * L)
            after = tw(a)
            linea = f'w:line="{tw(L)}" w:lineRule="exact"'
        ppr = f'<w:spacing w:before="0" w:after="{after}" {linea}/>'
        ind = ""
        if k.indent:
            ind = f'<w:ind w:{"left" if jc != "right" else "right"}="{tw(k.indent * self.o["indent_pt"])}"/>'
        if s.get("indent_pt"):
            ind = f'<w:ind w:left="{tw(s["indent_pt"])}"/>'
        simbolo = s.get("simbolo", k.simbolo)
        pad = s.get("pad", k.pad)
        if pad and jc == "right" and not ind:
            ind = f'<w:ind w:right="{tw(pad * self.o["pad_char_pt"])}"/>'
        cuerpo = ""
        if simbolo:
            # Contable: símbolo a la izquierda, número alineado a la derecha con tabulación.
            pos = w_tw - tw(self.o["pad"]) - tw(pad * self.o["pad_char_pt"])
            ppr += f'<w:tabs><w:tab w:val="right" w:pos="{max(0, pos)}"/></w:tabs>'
            jc = "left"
            ind = ""
            cuerpo = run_texto(simbolo, rp) + f"<w:r>{rp}<w:tab/></w:r>" + run_texto(t, rp)
        else:
            cuerpo = run_texto(t, rp)
        return f'<w:p><w:pPr>{ppr}{ind}<w:jc w:val="{jc}"/>{rp}</w:pPr>{cuerpo}</w:p>'

    # ---------------------------------------------------------- tabla de una página
    def xml_tabla(self, pag):
        self._pag = pag
        ky = self.o["ky"]
        g = "".join(f'<w:gridCol w:w="{a}"/>' for a in self.anchos)
        total = self.bx[-1]
        pad = tw(self.o["pad"])
        tblpr = (f'<w:tblPr><w:tblW w:w="{total}" w:type="dxa"/><w:tblInd w:w="{tw(self.o["tbl_ind"])}" w:type="dxa"/>'
                 f'<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>'
                 f'<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="{pad}" w:type="dxa"/>'
                 f'<w:bottom w:w="0" w:type="dxa"/><w:right w:w="{pad}" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="0000"/></w:tblPr>')
        filas = []
        base = self.rows[pag.r0][0]
        acum_prev = 0
        for r in range(pag.r0, pag.r1 + 1):
            fin = tw((self.rows[r][0] + self.rows[r][1] - base) * ky)
            h = fin - acum_prev
            acum_prev = fin
            celdas = self.celdas_fila(r, pag)
            filas.append(f'<w:tr><w:trPr><w:cantSplit/><w:trHeight w:val="{h}" w:hRule="exact"/></w:trPr>'
                         + "".join(self.xml_celda(x, r) for x in celdas) + "</w:tr>")
        return f"<w:tbl>{tblpr}<w:tblGrid>{g}</w:tblGrid>{''.join(filas)}</w:tbl>"


# ------------------------------------------------------------------ formas flotantes
NS = ('xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" '
      'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" '
      'xmlns:o="urn:schemas-microsoft-com:office:office" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" '
      'xmlns:v="urn:schemas-microsoft-com:vml" '
      'xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" '
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
      'xmlns:w10="urn:schemas-microsoft-com:office:word" '
      'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
      'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" '
      'xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" '
      'xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" '
      'xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" '
      'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" '
      'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" '
      'mc:Ignorable="w14 wp14"')


def _ancla(id_, x, y, w, h, z, cuerpo, nombre, descr=""):
    d = f' descr="{escape(descr, {chr(34): "&quot;"})}"' if descr else ""
    return (f'<w:r><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="{z}" '
            f'behindDoc="0" locked="1" layoutInCell="0" allowOverlap="1">'
            f'<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>{int(x * EMU)}</wp:posOffset></wp:positionH>'
            f'<wp:positionV relativeFrom="page"><wp:posOffset>{int(y * EMU)}</wp:posOffset></wp:positionV>'
            f'<wp:extent cx="{int(w * EMU)}" cy="{int(h * EMU)}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/>'
            f'<wp:docPr id="{id_}" name="{escape(nombre)}"{d}/><wp:cNvGraphicFramePr/>{cuerpo}</wp:anchor></w:drawing></w:r>')


def xml_imagen(id_, x, y, w, h, z, rid, descr, recorte=""):
    g = (f'<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
         f'<pic:pic><pic:nvPicPr><pic:cNvPr id="{id_}" name="Imagen {id_}"/><pic:cNvPicPr/></pic:nvPicPr>'
         f'<pic:blipFill><a:blip r:embed="{rid}"/>{recorte}<a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
         f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{int(w * EMU)}" cy="{int(h * EMU)}"/></a:xfrm>'
         f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic>')
    return _ancla(id_, x, y, w, h, z, g, f"Imagen {id_}", descr)


def xml_forma(id_, x, y, w, h, z, relleno, linea, texto_xml="", ins=(0, 0, 0, 0), anchor="t"):
    sp = f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="{int(w * EMU)}" cy="{int(h * EMU)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
    sp += f'<a:solidFill><a:srgbClr val="{relleno}"/></a:solidFill>' if relleno else "<a:noFill/>"
    if linea:
        col, ancho = linea
        sp += f'<a:ln w="{int(ancho * EMU)}"><a:solidFill><a:srgbClr val="{col}"/></a:solidFill></a:ln>'
    else:
        sp += "<a:ln><a:noFill/></a:ln>"
    tx = f"<wps:txbx><w:txbxContent>{texto_xml}</w:txbxContent></wps:txbx>" if texto_xml else ""
    l, t, r, b = (int(v * EMU) for v in ins)
    g = (f'<a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">'
         f'<wps:wsp><wps:cNvSpPr{" txBox=\"1\"" if texto_xml else ""}/><wps:spPr>{sp}</wps:spPr>{tx}'
         f'<wps:bodyPr rot="0" vert="horz" wrap="square" lIns="{l}" tIns="{t}" rIns="{r}" bIns="{b}" anchor="{anchor}" anchorCtr="0"><a:noAutofit/></wps:bodyPr>'
         f'</wps:wsp></a:graphicData></a:graphic>')
    return _ancla(id_, x, y, w, h, z, g, f"Forma {id_}")


# ------------------------------------------------------------------ paquete
CT = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      '<Default Extension="xml" ContentType="application/xml"/>'
      '<Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/>'
      '<Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="emf" ContentType="image/x-emf"/>'
      '<Default Extension="gif" ContentType="image/gif"/>'
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
      '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>'
      '</Types>')
RELS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        '</Relationships>')
ESTILOS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
           '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
           '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" w:eastAsia="Calibri"/>'
           '<w:sz w:val="12"/><w:szCs w:val="12"/><w:lang w:val="es-CL"/></w:rPr></w:rPrDefault>'
           '<w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'
           '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>'
           '<w:style w:type="table" w:default="1" w:styleId="TablaNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/>'
           '<w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>'
           '</w:styles>')
SETTINGS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/>'
            '<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat>'
            '</w:settings>')


def empaquetar(salida, cuerpo_xml, sectpr, media):
    """media: lista de (rid, nombre_archivo, bytes)."""
    doc = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document {NS}><w:body>{cuerpo_xml}{sectpr}</w:body></w:document>'
    rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
            '<Relationship Id="rIdEst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
            '<Relationship Id="rIdCfg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>']
    for rid, nombre, _ in media:
        rels.append(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{nombre}"/>')
    rels.append("</Relationships>")
    import xml.dom.minidom
    xml.dom.minidom.parseString(doc.encode("utf-8"))   # falla si el XML quedó mal formado
    z = zipfile.ZipFile(salida, "w", zipfile.ZIP_DEFLATED)
    _w = z.writestr

    def _fijo(nombre, datos):
        # Fecha fija: el .docx sale idéntico byte a byte en cada corrida (su SHA-256 es el templateId).
        zi = zipfile.ZipInfo(nombre, date_time=(2026, 10, 25, 0, 0, 0))
        zi.compress_type = zipfile.ZIP_DEFLATED
        _w(zi, datos)
    z.writestr = _fijo
    z.writestr("[Content_Types].xml", CT)
    z.writestr("_rels/.rels", RELS)
    z.writestr("word/document.xml", doc.encode("utf-8"))
    z.writestr("word/_rels/document.xml.rels", "".join(rels))
    z.writestr("word/styles.xml", ESTILOS)
    z.writestr("word/settings.xml", SETTINGS)
    for _, nombre, datos in media:
        z.writestr(f"word/media/{nombre}", datos)
    z.close()


def sectpr(top, left, right=0, bottom=0):
    return (f'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="{tw(top)}" w:right="{tw(right)}" '
            f'w:bottom="{tw(bottom)}" w:left="{tw(left)}" w:header="0" w:footer="0" w:gutter="0"/><w:cols w:space="720"/></w:sectPr>')


def parrafo_ancla(salto, anclas_xml, alto_pt=1.0):
    pb = "<w:pageBreakBefore/>" if salto else ""
    return (f'<w:p><w:pPr>{pb}<w:spacing w:before="0" w:after="0" w:line="{tw(alto_pt)}" w:lineRule="exact"/>'
            f'<w:rPr><w:sz w:val="2"/></w:rPr></w:pPr>{anclas_xml}</w:p>')
