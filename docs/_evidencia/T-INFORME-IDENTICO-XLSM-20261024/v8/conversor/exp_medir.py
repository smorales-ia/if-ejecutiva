import json, re, sys
import pymupdf
casos = json.load(open(sys.argv[1]))
d = pymupdf.open(sys.argv[2])
pos = {}
for pi, pg in enumerate(d):
    for b in pg.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for sp in l["spans"]:
                m = re.search(r"X(\d+)X", sp["text"])
                if m:
                    pos[int(m.group(1))] = (pi, sp["origin"][1])
for c in casos:
    if c["id"] in pos:
        pi, yb = pos[c["id"]]
        if pi:
            continue
        acc = sum(round(x["H"] * 20) / 20 for x in casos[: c["id"] + 1]); bot = 20 + acc
        print(f"{c['var']:18} H={c['H']:5} S={c['S']:4}  base_desde_abajo={bot - yb:6.2f}  excel={0.9 + 0.269 * c['S']:5.2f}")
    else:
        print("falta", c)


