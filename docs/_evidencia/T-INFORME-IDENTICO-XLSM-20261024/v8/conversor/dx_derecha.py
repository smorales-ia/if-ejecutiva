"""dx del borde DERECHO de palabras numéricas emparejadas (para calibrar alineación derecha)."""
import sys, re, collections, statistics
import pymupdf
o, n, po, pn = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
wa = [w for w in pymupdf.open(o)[po - 1].get_text("words") if re.fullmatch(r"[\d.,%-]+", w[4])]
wb = [w for w in pymupdf.open(n)[pn - 1].get_text("words") if re.fullmatch(r"[\d.,%-]+", w[4])]
idx = collections.defaultdict(list)
for w in wb:
    idx[w[4]].append(w)
d = []
for w in wa:
    c = [x for x in idx[w[4]] if abs(x[3] - w[3]) < 3 and abs(x[2] - w[2]) < 8]
    if c:
        x = min(c, key=lambda x: abs(x[2] - w[2]))
        d.append((round(x[2] - w[2], 2), w[4], round(w[0]), round(w[3])))
print("n", len(d), "mediana dx der", statistics.median([v[0] for v in d]))
for v in sorted(d)[:5] + sorted(d)[-8:]:
    print(v)
