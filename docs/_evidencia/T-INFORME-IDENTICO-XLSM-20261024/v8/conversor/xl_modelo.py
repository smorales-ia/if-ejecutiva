"""Modelo de una hoja de Excel para imprimir: celdas (valor, estilo resuelto), combinaciones,
geometría (de Excel COM) y formas (anclas del dibujo + geometría COM).

Sólo lee. Los colores de tema se resuelven con el tema del libro; el formato condicional se evalúa
para las reglas simples que usa la planilla (comparaciones contra celdas con su valor guardado).
"""
import colorsys, csv, re, warnings, zipfile, posixpath
import openpyxl
from openpyxl.styles.colors import COLOR_INDEX
from openpyxl.utils import get_column_letter, column_index_from_string, range_boundaries

from formato_xl import mostrar

warnings.filterwarnings("ignore")


# ------------------------------------------------------------------ colores
def _tema(wb):
    x = wb.loaded_theme.decode("utf-8") if isinstance(wb.loaded_theme, bytes) else wb.loaded_theme
    esquema = re.search(r"<a:clrScheme[^>]*>(.*?)</a:clrScheme>", x, re.S).group(1)
    orden = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"]
    val = {}
    for n in orden:
        b = re.search(rf"<a:{n}>(.*?)</a:{n}>", esquema, re.S).group(1)
        m = re.search(r'srgbClr val="([0-9A-Fa-f]{6})"', b) or re.search(r'lastClr="([0-9A-Fa-f]{6})"', b)
        val[n] = m.group(1).upper()
    # Índices de Excel: 0=lt1, 1=dk1, 2=lt2, 3=dk2, 4..9 accents, 10 hlink, 11 folHlink
    return [val["lt1"], val["dk1"], val["lt2"], val["dk2"]] + [val[f"accent{i}"] for i in range(1, 7)] + [val["hlink"], val["folHlink"]]


def _tinte(hexrgb, tint):
    if not tint:
        return hexrgb
    r, g, b = (int(hexrgb[i:i + 2], 16) / 255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = l * (1 + tint) if tint < 0 else l * (1 - tint) + tint
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return "".join(f"{round(c * 255):02X}" for c in (r, g, b))


def color(c, tema, defecto=None):
    if c is None:
        return defecto
    t = getattr(c, "type", None)
    if t == "rgb" and isinstance(c.rgb, str):
        v = c.rgb[-6:].upper()
        if c.rgb.upper() == "00000000" and defecto is not None:
            return defecto
        return _tinte(v, c.tint)
    if t == "theme" and c.theme is not None:
        return _tinte(tema[c.theme], c.tint)
    if t == "indexed" and c.indexed is not None:
        if c.indexed >= 64:
            return defecto
        return COLOR_INDEX[c.indexed][-6:].upper()
    return defecto


# ------------------------------------------------------------------ geometría
def cargar_geometria(ruta):
    cols, rows, shapes, page = {}, {}, [], {}
    f = lambda s: float(s.replace(",", "."))
    for ln in open(ruta, encoding="utf-8"):
        p = ln.rstrip("\n").split("\t")
        if p[0] == "COL":
            cols[int(p[1])] = (f(p[2]), f(p[3]))
        elif p[0] == "ROW":
            rows[int(p[1])] = (f(p[2]), f(p[3]))
        elif p[0] == "SHP":
            shapes.append(dict(nombre=p[1], tipo=int(p[2]), left=f(p[3]), top=f(p[4]), w=f(p[5]), h=f(p[6]),
                               visible=p[7] == "-1", z=int(p[8]), tl=p[9], br=p[10], fill=p[11], line=p[12],
                               rot=p[13], texto=p[14] if len(p) > 14 else "", fuente=p[15] if len(p) > 15 else ""))
    return cols, rows, shapes


def anclas_dibujo(ruta_xlsm, hoja):
    """name -> (from(col,colOff,row,rowOff), to(...), media) del dibujo de la hoja (EMU, base 0)."""
    z = zipfile.ZipFile(ruta_xlsm)
    wbx = z.read("xl/workbook.xml").decode()
    rels = z.read("xl/_rels/workbook.xml.rels").decode()
    rid = re.search(rf'<sheet [^>]*name="{hoja}"[^>]*r:id="(rId\d+)"', wbx).group(1)
    t = re.search(rf'Id="{rid}"[^>]*Target="([^"]+)"', rels) or re.search(rf'Target="([^"]+)"[^>]*Id="{rid}"', rels)
    hp = "xl/" + t.group(1).split("xl/")[-1].lstrip("/")
    hr = z.read(posixpath.join(posixpath.dirname(hp), "_rels", posixpath.basename(hp) + ".rels")).decode()
    m = re.search(r'Target="([^"]*drawing\d+\.xml)"', hr)
    if not m:
        return [], z
    dp = posixpath.normpath(posixpath.join(posixpath.dirname(hp), m.group(1)))
    x = z.read(dp).decode("utf-8")
    drels = z.read(posixpath.join(posixpath.dirname(dp), "_rels", posixpath.basename(dp) + ".rels")).decode()
    dest = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', drels))
    out = []
    for mm in re.finditer(r"<xdr:(twoCellAnchor|oneCellAnchor)([^>]*)>(.*?)</xdr:\1>", x, re.S):
        b = mm.group(3)

        def pos(tag):
            q = re.search(rf"<xdr:{tag}><xdr:col>(\d+)</xdr:col><xdr:colOff>(-?\d+)</xdr:colOff><xdr:row>(\d+)</xdr:row><xdr:rowOff>(-?\d+)</xdr:rowOff></xdr:{tag}>", b)
            return tuple(int(v) for v in q.groups()) if q else None
        nombre = re.search(r'<xdr:cNvPr id="\d+" name="([^"]*)"', b)
        emb = re.search(r'r:embed="(rId\d+)"', b)
        media = posixpath.normpath(posixpath.join(posixpath.dirname(dp), dest[emb.group(1)])) if emb else None
        out.append(dict(nombre=nombre.group(1) if nombre else "", desde=pos("from"), hasta=pos("to"), media=media, xml=b))
    return out, z


# ------------------------------------------------------------------ celdas
class Borde:
    __slots__ = ("estilo", "color")

    def __init__(self, estilo, color):
        self.estilo, self.color = estilo, color

    def __eq__(self, o):
        return isinstance(o, Borde) and (self.estilo, self.color) == (o.estilo, o.color)

    def __hash__(self):
        return hash((self.estilo, self.color))

    def __repr__(self):
        return f"{self.estilo}:{self.color}"


class Celda:
    __slots__ = ("r", "c", "valor", "texto", "simbolo", "pad", "fuente", "relleno", "bordes", "h", "v", "wrap",
                 "rot", "indent", "es_num", "formula", "fmt", "shrink", "estrella")


def _borde(side, tema):
    if side is None or side.style is None:
        return None
    return Borde(side.style, color(side.color, tema, "000000"))


def cargar_hoja(ruta_xlsm, hoja, area, textos_excel=None):
    """Lee la hoja; area = 'A1:BW554'. textos_excel: dict dir->texto mostrado por Excel (celdas con fórmula)."""
    wf = openpyxl.load_workbook(ruta_xlsm)
    wv = openpyxl.load_workbook(ruta_xlsm, data_only=True)
    tema = _tema(wf)
    sf, sv = wf[hoja], wv[hoja]
    c0, r0, c1, r1 = range_boundaries(area)
    sin_ceros = sf.sheet_view.showZeros is False
    celdas = {}
    for row in sf.iter_rows(min_row=r0, max_row=r1, min_col=c0, max_col=c1):
        for x in row:
            if x.value is None and not x.has_style:
                continue
            k = Celda()
            k.r, k.c = x.row, x.column
            v = sv.cell(x.row, x.column).value
            k.formula = x.value if isinstance(x.value, str) and x.value.startswith("=") else None
            k.valor = v
            k.fmt = x.number_format
            m = mostrar(v, x.number_format)
            k.texto, k.simbolo, k.pad = m["texto"], m["simbolo"], m["pad"]
            k.estrella = bool(m.get("estrella"))
            es_cero = (isinstance(v, (int, float)) and not isinstance(v, bool) and v == 0) or \
                (hasattr(v, "hour") and not hasattr(v, "year") and (v.hour, v.minute, v.second) == (0, 0, 0))
            # Sin «mostrar ceros», Excel deja en blanco el 0 salvo que el formato tenga sección propia para el cero.
            if sin_ceros and es_cero and len((x.number_format or "General").split(";")) < 3:
                k.texto, k.simbolo = "", None
            if textos_excel is not None and k.formula and x.coordinate in textos_excel and x.number_format == "General" \
                    and isinstance(v, float):
                t = textos_excel[x.coordinate].strip()
                if t and not t.startswith("#"):
                    k.texto = t
            k.es_num = isinstance(v, (int, float)) and not isinstance(v, bool)
            f = x.font
            k.fuente = dict(nombre=f.name or "Calibri", sz=float(f.sz or 11), b=bool(f.b), i=bool(f.i),
                            u=(f.u not in (None, "none")), color=color(f.color, tema, "000000"))
            fl = x.fill
            k.relleno = None
            if fl is not None and fl.fill_type == "solid":
                k.relleno = color(fl.fgColor, tema, None)
            b = x.border
            k.bordes = dict(l=_borde(b.left, tema), r=_borde(b.right, tema), t=_borde(b.top, tema), b=_borde(b.bottom, tema))
            a = x.alignment
            k.h = a.horizontal or "general"
            k.v = a.vertical or "bottom"
            # En Excel, «justificar»/«distribuido» siempre ajustan el texto en varias líneas.
            k.wrap = bool(a.wrap_text) or a.horizontal in ("justify", "distributed") or a.vertical in ("justify", "distributed")
            k.rot = int(a.textRotation or 0)
            k.indent = int(a.indent or 0)
            k.shrink = bool(a.shrink_to_fit)
            celdas[(x.row, x.column)] = k
    merges = []
    for m in sf.merged_cells.ranges:
        if m.min_row <= r1 and m.max_row >= r0 and m.min_col <= c1 and m.max_col >= c0:
            merges.append((m.min_row, m.min_col, min(m.max_row, r1), min(m.max_col, c1)))
    cf = _formato_condicional(sf, sv, wf, tema)
    return dict(celdas=celdas, merges=merges, cf=cf, tema=tema, area=(r0, c0, r1, c1), wf=wf, wv=wv, sv=sv)


def _formato_condicional(sf, sv, wf, tema):
    """Evalúa las reglas de formato condicional de la planilla con los valores guardados.
    Devuelve {(r,c): {"relleno": hex|None, "color": hex|None, "b": bool|None}} para las celdas a las que aplica."""
    res = {}

    def val(ref):
        ref = ref.replace("$", "")
        if "!" in ref or "#REF" in ref:
            return None
        try:
            return sv[ref].value
        except Exception:
            return None

    def evaluar(expr, r, c, rule):
        e = expr.strip()
        m = re.fullmatch(r"(\$?[A-Z]+\$?\d+)", e)
        if m:
            v = val(_rel(m.group(1), r, c, rule))
            return bool(v)
        m = re.fullmatch(r'(\$?[A-Z]+\$?\d+)\s*(=|>|<|<>)\s*"?([^"]*)"?', e)
        if m:
            v = val(_rel(m.group(1), r, c, rule))
            op, lit = m.group(2), m.group(3)
            try:
                litn = float(lit)
            except ValueError:
                litn = None
            if op == "=":
                return (v == lit) if litn is None else (v == litn)
            if op == "<>":
                return v != lit
            if v is None or litn is None:
                return False
            return v > litn if op == ">" else v < litn
        return False

    def _rel(ref, r, c, rule):
        # Referencias relativas en reglas: relativas a la primera celda del rango.
        m = re.fullmatch(r"(\$?)([A-Z]+)(\$?)(\d+)", ref)
        ca, col, ra, fil = m.groups()
        r0, c0 = rule["_origen"]
        cc = column_index_from_string(col) if ca else column_index_from_string(col) + (c - c0)
        rr = int(fil) if ra else int(fil) + (r - r0)
        return f"{get_column_letter(cc)}{rr}"

    dxfs = wf._differential_styles
    for rango in sf.conditional_formatting:
        celdas = []
        for cr in rango.sqref.ranges:
            for rr in range(cr.min_row, cr.max_row + 1):
                for cc in range(cr.min_col, cr.max_col + 1):
                    celdas.append((rr, cc))
        primera = min(celdas)
        for rule in sorted(rango.rules, key=lambda x: x.priority):
            primero = str(rango.sqref).split()[0]
            pc0, pr0, _, _ = range_boundaries(primero)
            d = {"_origen": (pr0, pc0)}
            for (rr, cc) in celdas:
                ok = False
                if rule.type == "expression" and rule.formula:
                    ok = evaluar(rule.formula[0], rr, cc, d)
                elif rule.type == "cellIs" and rule.formula:
                    v = sv.cell(rr, cc).value
                    try:
                        lim = float(rule.formula[0])
                        ok = isinstance(v, (int, float)) and {"greaterThan": v > lim, "lessThan": v < lim, "equal": v == lim}.get(rule.operator, False)
                    except ValueError:
                        ok = False
                if not ok or (rr, cc) in res and res[(rr, cc)].get("_stop"):
                    continue
                dx = rule.dxf if rule.dxf is not None else (dxfs[rule.dxfId] if rule.dxfId is not None and rule.dxfId < len(dxfs) else None)
                e = res.setdefault((rr, cc), {})
                if dx is not None:
                    if dx.fill is not None and dx.fill.fill_type in ("solid", None) and (dx.fill.bgColor is not None or dx.fill.fgColor is not None):
                        col = color(dx.fill.bgColor, tema, None) or color(dx.fill.fgColor, tema, None)
                        if col and "relleno" not in e:
                            e["relleno"] = col
                    if dx.font is not None:
                        if dx.font.color is not None and "color" not in e:
                            e["color"] = color(dx.font.color, tema, None)
                        if dx.font.b is not None and "b" not in e:
                            e["b"] = bool(dx.font.b)
                if rule.stopIfTrue:
                    e["_stop"] = True
    return res
