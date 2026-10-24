"""Ajusta el ancho impreso de cada clase de ancho de columna a partir de los bordes verticales del PDF original.

Bordes verticales observados: rectángulos finos (ancho < 1,6 pt) y altos (> 3 pt) de todas las páginas de
Impresion. Se emparejan con los límites de columna predichos y se resuelve por mínimos cuadrados.
Salida: JSON {col: ancho_impreso_pt} para A..BW.
"""
import json, sys, collections
import numpy as np
import pymupdf
sys.path.insert(0, __import__("os").path.dirname(__file__))
from xl_modelo import cargar_geometria

pdf, geo, salida = sys.argv[1], sys.argv[2], sys.argv[3]
cols, rows, _ = cargar_geometria(geo)
N = 75
w_com = [cols[c][1] for c in range(1, N + 1)]
clases = sorted(set(round(w, 2) for w in w_com))
idx = {c: i for i, c in enumerate(clases)}
cls = [idx[round(w, 2)] for w in w_com]

doc = pymupdf.open(pdf)
obs = []
for p in range(1, 8):
    for d in doc[p].get_drawings():
        r = d["rect"]
        if d.get("fill") is not None and r.width < 1.6 and r.height > 3:
            obs.append((r.x0 + r.x1) / 2)
        for it in d["items"]:
            if it[0] == "l":
                a, b = it[1], it[2]
                if abs(a.x - b.x) < 0.2 and abs(a.y - b.y) > 3:
                    obs.append(a.x)
obs = sorted(set(round(x, 2) for x in obs))
print("bordes verticales observados", len(obs))

K = 0.6055
x0 = 16.44
anchos = np.array([w * K for w in w_com])
for it in range(8):
    lim = x0 + np.concatenate([[0], np.cumsum(anchos)])
    filas, b = [], []
    for x in obs:
        i = int(np.argmin(np.abs(lim - x)))
        if abs(lim[i] - x) > 1.5:
            continue
        # x = x0' + sum_{j<i} W(cls_j)  → incógnitas: x0' y W por clase
        v = np.zeros(len(clases) + 1)
        v[0] = 1
        for j in range(i):
            v[1 + cls[j]] += 1
        filas.append(v); b.append(x)
    A = np.array(filas); bb = np.array(b)
    sol, *_ = np.linalg.lstsq(A, bb, rcond=None)
    x0 = sol[0]
    W = sol[1:]
    # clases sin observación: escala media
    usado = A[:, 1:].sum(axis=0) > 0
    anchos = np.array([W[cls[j]] if usado[cls[j]] else w_com[j] * K for j in range(N)])
    res = A @ sol - bb
    print(f"iter {it}: x0={x0:.3f} n={len(bb)} rms={np.sqrt(np.mean(res**2)):.3f} max={np.max(np.abs(res)):.3f}")
for c, w in zip(clases, W):
    print(f"  clase {c:6.2f}pt → {w:7.3f} pt impresos (k={w / c:.4f})")
json.dump({"x0": x0, "anchos": [float(a) for a in anchos]}, open(salida, "w"))
print("total", float(sum(anchos)))
