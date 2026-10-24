"""dy de línea de base agrupado por tamaño de fuente (spans emparejados por texto)."""
import sys, collections, statistics
import pymupdf
o, n, desf = sys.argv[1], sys.argv[2], int(sys.argv[3])
A, B = pymupdf.open(o), pymupdf.open(n)
g = collections.defaultdict(list)
ej = collections.defaultdict(list)
for j in range(len(B)):
    i = j + desf
    if i >= len(A):
        break
    def spans(pg):
        out = []
        for b in pg.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                if l["dir"] != (1.0, 0.0):
                    continue
                for s in l["spans"]:
                    if s["text"].strip():
                        out.append((s["text"].strip(), s["origin"][0], s["origin"][1], round(s["size"], 1), s["font"]))
        return out
    pa, pb = spans(A[i]), spans(B[j])
    idx = collections.defaultdict(list)
    for s in pb:
        idx[s[0]].append(s)
    for s in pa:
        c = [x for x in idx.get(s[0], []) if abs(x[1] - s[1]) < 15 and abs(x[2] - s[2]) < 8]
        if c:
            x = min(c, key=lambda x: abs(x[2] - s[2]) + abs(x[1] - s[1]))
            g[s[3]].append(x[2] - s[2])
            ej[s[3]].append((i + 1, s[0][:25], round(x[2] - s[2], 2)))
for k in sorted(g):
    v = g[k]
    print(f"tam {k:5}: n={len(v):4} dy medio={statistics.mean(v):+.2f} mediana={statistics.median(v):+.2f} min={min(v):+.2f} max={max(v):+.2f}")
    if len(sys.argv) > 4:
        print("    ", ej[k][:8])
