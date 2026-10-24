"""Compara posición de palabras entre el PDF original y uno nuevo, página por página.

Uso: python delta_textos.py original.pdf nuevo.pdf desfase [umbral_pt] [--detalle N]
desfase: página_original = página_nueva + desfase (p. ej. 1 si el nuevo no tiene Tapa).
Reporta por página: palabras emparejadas, |dx|,|dy| medios y máximos, palabras sin pareja en cada lado.
"""
import sys, collections, statistics
import pymupdf

o, n, desf = sys.argv[1], sys.argv[2], int(sys.argv[3])
umbral = float(sys.argv[4]) if len(sys.argv) > 4 and not sys.argv[4].startswith("--") else 2.0
det = int(sys.argv[sys.argv.index("--detalle") + 1]) if "--detalle" in sys.argv else 0
A, B = pymupdf.open(o), pymupdf.open(n)


def palabras(pg):
    out = []
    for w in pg.get_text("words"):
        x0, y0, x1, y1, t = w[:5]
        if t.strip():
            out.append((t, x0, y1))
    return out


tot = collections.Counter()
for j in range(len(B)):
    i = j + desf
    if i >= len(A):
        break
    pa, pb = palabras(A[i]), palabras(B[j])
    por_t = collections.defaultdict(list)
    for w in pb:
        por_t[w[0]].append(w)
    usados = set()
    pares, solo_o = [], []
    for w in pa:
        cands = [c for c in por_t.get(w[0], []) if id(c) not in usados]
        if not cands:
            solo_o.append(w)
            continue
        c = min(cands, key=lambda c: abs(c[1] - w[1]) + abs(c[2] - w[2]))
        if abs(c[1] - w[1]) + abs(c[2] - w[2]) > 40:
            solo_o.append(w)
            continue
        usados.add(id(c))
        pares.append((w, c))
    solo_n = [w for w in pb if id(w) not in usados]
    dx = [c[1] - w[1] for w, c in pares]
    dy = [c[2] - w[2] for w, c in pares]
    malos = [(w, c) for w, c in pares if abs(c[1] - w[1]) > umbral or abs(c[2] - w[2]) > umbral]
    if pares:
        print(f"pág {i + 1}: pares={len(pares)} dx medio={statistics.mean(dx):+.2f} |dx|máx={max(map(abs, dx)):.1f} "
              f"dy medio={statistics.mean(dy):+.2f} |dy|máx={max(map(abs, dy)):.1f} · >{umbral}pt: {len(malos)} · "
              f"sin pareja: orig={len(solo_o)} nuevo={len(solo_n)}")
    for w, c in sorted(malos, key=lambda p: -(abs(p[1][1] - p[0][1]) + abs(p[1][2] - p[0][2])))[:det]:
        print(f"     {w[0][:30]!r:32} orig=({w[1]:.1f},{w[2]:.1f}) nuevo=({c[1]:.1f},{c[2]:.1f})")
    if det:
        print("     solo original:", [w[0] for w in solo_o][:det])
        print("     solo nuevo:   ", [w[0] for w in solo_n][:det])
