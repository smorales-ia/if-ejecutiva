"""Formato de números y fechas como los muestra Excel en es-CL (separador de miles «.», decimal «,»).

`mostrar(valor, codigo)` devuelve un dict:
  {"texto": str, "simbolo": str|None, "pad": float}
  - simbolo: para formatos contables con relleno (`_(\\$* …`, `_("UF"* …`): va a la izquierda de la
    celda y el número a la derecha.
  - pad: cuántos «anchos de carácter» deja el formato a la derecha (`_)`, `_ €`, `_-`).
"""
import datetime, re

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre",
         "octubre", "noviembre", "diciembre"]
MESES3 = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def miles(n_entero: str) -> str:
    s = n_entero
    neg = s.startswith("-")
    if neg:
        s = s[1:]
    partes = []
    while len(s) > 3:
        partes.insert(0, s[-3:])
        s = s[:-3]
    partes.insert(0, s)
    return ("-" if neg else "") + ".".join(partes)


def numero(v, decimales: int, sep_miles: bool) -> str:
    t = f"{abs(v):.{decimales}f}"
    ent, _, dec = t.partition(".")
    if sep_miles:
        ent = miles(ent)
    s = ent + ("," + dec if decimales else "")
    if v < 0 and float(t) != 0:
        s = "-" + s
    return s


def general(v) -> str:
    if isinstance(v, bool):
        return "VERDADERO" if v else "FALSO"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        if v == int(v) and abs(v) < 1e15:
            return str(int(v))
        s = f"{v:.10g}"
        if "e" in s:
            return s.replace(".", ",")
        return s.replace(".", ",")
    return str(v)


def _seccion(codigo: str, v):
    secs = codigo.split(";")
    if len(secs) == 1:
        return secs[0], v
    if isinstance(v, (int, float)):
        if v > 0 or len(secs) == 1:
            return secs[0], v
        if v < 0:
            return (secs[1], abs(v)) if len(secs) > 1 else (secs[0], v)
        return (secs[2], v) if len(secs) > 2 else (secs[0], v)
    return (secs[3] if len(secs) > 3 else secs[0]), v


def mostrar(v, codigo: str):
    out = {"texto": "", "simbolo": None, "pad": 0.0}
    if v is None:
        return out
    if isinstance(v, str):
        out["texto"] = v
        return out
    if isinstance(v, datetime.time):
        out["texto"] = v.strftime("%H:%M")
        return out
    c = codigo or "General"
    if isinstance(v, datetime.datetime) or isinstance(v, datetime.date):
        d = v
        f = c.split(";")[0]
        f = re.sub(r"\[[^\]]*\]", "", f)
        f = f.replace("\\", "")
        res = ""
        i = 0
        lit = re.findall(r'"([^"]*)"', f)
        f2 = re.sub(r'"[^"]*"', "\x00", f)
        k = 0
        toks = re.findall(r"dddd|ddd|dd|d|mmmm|mmm|mm|m|yyyy|yy|\x00|.", f2)
        for t in toks:
            if t == "\x00":
                res += lit[k]; k += 1
            elif t == "dd": res += f"{d.day:02d}"
            elif t == "d": res += str(d.day)
            elif t == "mmmm": res += MESES[d.month - 1]
            elif t == "mmm": res += MESES3[d.month - 1]
            elif t == "mm": res += f"{d.month:02d}"
            elif t == "m": res += str(d.month)
            elif t == "yyyy": res += f"{d.year:04d}"
            elif t == "yy": res += f"{d.year % 100:02d}"
            elif t == "/": res += "-"
            elif t == "@": pass
            else: res += t
        out["texto"] = res
        return out
    if c == "General":
        out["texto"] = general(v)
        return out
    sec, vv = _seccion(c, v)
    # «*x» repite x hasta llenar la celda: el número queda pegado a la derecha (formato contable).
    out["estrella"] = bool(re.search(r"(?<!\\)\*.", sec))
    # Relleno contable: «* » entre símbolo y número.
    m_sim = re.search(r'_\(\s*(?:\\\$|"([^"]*)")\*\s', sec)
    simbolo = None
    if m_sim:
        simbolo = "$" if m_sim.group(1) is None else m_sim.group(1)
    if re.search(r"\\-\?\?|\\-", sec) and not re.search(r"[0#]", sec):
        out["texto"] = "-"
        out["simbolo"] = simbolo
        out["pad"] = 2.0 if "??" in sec else 0.0
        return out
    pct = "%" in sec
    x = vv * 100 if pct else vv
    nucleo = re.search(r"[#0][#0,.]*", sec)
    dec = 0
    sep = False
    if nucleo:
        n = nucleo.group(0)
        sep = "," in n.split(".")[0]
        dec = len(n.split(".")[1]) if "." in n else 0
    s = numero(x, dec, sep)
    if vv is not v and v < 0 and "(" in sec.replace("_(", ""):
        s = "(" + s + ")"
    elif vv is not v and v < 0 and "-" in sec:
        s = "-" + s
    pre = "".join(re.findall(r'"([^"]*)"', sec.split(nucleo.group(0))[0])) if nucleo else ""
    post = "".join(re.findall(r'"([^"]*)"', sec.split(nucleo.group(0))[-1])) if nucleo else ""
    if simbolo:
        pre = ""
    texto = pre + s + post + ("%" if pct else "")
    pad = 0.0
    tail = sec.split(nucleo.group(0))[-1] if nucleo else ""
    pad += len(re.findall(r"_.", tail)) + 0.45 * len(re.findall(r"\\ ", tail))
    out.update(texto=texto, simbolo=simbolo, pad=pad)
    return out


if __name__ == "__main__":
    pruebas = [
        (34.049372384937236, "#,##0.00"), (20000, '_(* #,##0_);_(* \\(#,##0\\);_(* \\-??_);_(@_)'),
        (5051, '_(* #,##0.00_);_(* \\(#,##0.00\\);_(* \\-??_);_(@_)'), (-0.0298, "0%"),
        (1402.35, '#,##0.00\\ _€;\\-#,##0.00\\ _€'), (239, '#,##0.00" m²";"-$"#,##0.00" m²"'),
        (900159638, "0"), (datetime.datetime(2026, 4, 13), "mmm-yy"), (750, "0.00"),
        (3300000, '_(\\$* #,##0_);_(\\$* \\(#,##0\\);_(\\$* \\-??_);_(@_)'), (0, '_-* #,##0.00_-;\\-* #,##0.00_-;_-* \\-??_-;_-@_-'),
        (datetime.datetime(2026, 4, 13), "dd/mm/yyyy;@"), (70, '0" años"'), (39894.61, '"$ "#,##0.00'),
        (datetime.datetime(2026, 4, 13), 'dd" de "mmmm" de "yyyy'), (82.71794109530084, '_("UF"* #,##0.0_);_("UF"* \\(#,##0.0\\);_("UF"* \\-??_);_(@_)'),
        (0.825, "0.0%"), (249.91, '#,##0.00" m²"'), (0.045, "0.00%"), (70, "General"), (2.2326592, "General"),
    ]
    for v, c in pruebas:
        print(repr(v)[:22].ljust(24), c[:40].ljust(42), mostrar(v, c))
