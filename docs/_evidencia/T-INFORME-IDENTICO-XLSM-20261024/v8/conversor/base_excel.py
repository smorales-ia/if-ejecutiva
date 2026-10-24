"""Mide en un PDF la distancia (pt) de la línea de base de cada texto al pie de su celda de Excel.

Uso: python base_excel.py <xlsm> <geometria.tsv> <pdf> <desfase_pagina> [--detalle]
Agrupa por (alineación vertical, tamaño impreso, alto de celda, tiene borde inferior).
"""
import sys, os, collections, statistics, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pymupdf
from xl_modelo import cargar_hoja, cargar_geometria
from construir import IMPRESION

xlsm, geo, pdf, desf = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
cols, rows, _ = cargar_geometria(geo)
o = IMPRESION["o"]
m = cargar_hoja(xlsm, "Impresion", "A1:BW554")
cov = {}
for (a, b, c, d) in m["merges"]:
    cov[(a, b)] = (a, b, c, d)
doc = pymupdf.open(pdf)
spans_pag = {}
for pi, (r0, r1) in enumerate(IMPRESION["paginas"]):
    pg = doc[pi + desf]
    lst = []
    for bl in pg.get_text("dict")["blocks"]:
        for l in bl.get("lines", []):
            if l["dir"] != (1.0, 0.0):
                continue
            t = "".join(s["text"] for s in l["spans"]).strip()
            if t:
                lst.append((t, l["spans"][0]["origin"][1], l["spans"][0]["size"]))
    spans_pag[pi] = lst
g = collections.defaultdict(list)
for pi, (r0, r1) in enumerate(IMPRESION["paginas"]):
    top0 = rows[r0][0]
    textos = collections.Counter(t for t, _, _ in spans_pag[pi])
    for (r, c), k in m["celdas"].items():
        if not (r0 <= r <= r1) or not k.texto or k.rot or k.wrap:
            continue
        t = k.texto.strip()
        cand = [s for s in spans_pag[pi] if s[0] == t]
        if len(cand) != 1:
            continue
        mg = cov.get((r, c))
        rr1 = mg[2] if mg else r
        bottom = o["y0"] + (rows[rr1][0] + rows[rr1][1] - top0) * o["ky"]
        H = sum(rows[x][1] for x in range(r, rr1 + 1)) * o["ky"]
        b = bottom - cand[0][1]
        tiene_b = k.bordes["b"] is not None or (m["celdas"].get((rr1 + 1, c)) and m["celdas"][(rr1 + 1, c)].bordes["t"] is not None)
        g[(k.v, round(k.fuente["sz"] * o["kf"], 1), round(H, 1), bool(tiene_b))].append((round(b, 2), t[:20]))
for key in sorted(g):
    v = [x[0] for x in g[key]]
    print(key, f"n={len(v)} b_med={statistics.median(v):.2f} min={min(v):.2f} max={max(v):.2f}", g[key][:3] if "--detalle" in sys.argv else "")
