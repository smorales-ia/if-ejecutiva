"""Lista los textos de una página de PDF con posición (pt desde arriba-izquierda), fuente y tamaño."""
import sys
import pypdfium2 as pdfium

ruta, pagina = sys.argv[1], int(sys.argv[2])
y_desde = float(sys.argv[3]) if len(sys.argv) > 3 else 0
y_hasta = float(sys.argv[4]) if len(sys.argv) > 4 else 9999
pdf = pdfium.PdfDocument(ruta)
pg = pdf[pagina - 1]
alto = pg.get_height()
tp = pg.get_textpage()
n = tp.count_chars()
# Agrupar caracteres en palabras/segmentos por cercanía.
segs = []
actual = None
for i in range(n):
    ch = tp.get_text_range(i, 1)
    l, b, r, t = tp.get_charbox(i)
    y = round(alto - t, 1)
    if ch.strip() == "":
        if actual:
            actual["txt"] += " "
        continue
    if actual and abs(actual["y"] - y) < 2 and l - actual["r"] < 6:
        actual["txt"] += ch
        actual["r"] = r
    else:
        if actual:
            segs.append(actual)
        actual = {"x": round(l, 1), "y": y, "r": r, "txt": ch, "h": round(t - b, 1)}
if actual:
    segs.append(actual)
for s in sorted(segs, key=lambda s: (round(s["y"]), s["x"])):
    if y_desde <= s["y"] <= y_hasta:
        print(f'y={s["y"]:6.1f} x={s["x"]:6.1f}-{s["r"]:6.1f} h={s["h"]:4.1f} | {s["txt"].strip()}')
