"""Lista docPr id/name, rId de la imagen y descr de cada imagen; marca ids repetidos."""
import collections, re, sys, zipfile

z = zipfile.ZipFile(sys.argv[1])
x = z.read("word/document.xml").decode("utf-8")
rels = z.read("word/_rels/document.xml.rels").decode("utf-8")
destino = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
filas = []
for m in re.finditer(r"<wp:inline\b.*?</wp:inline>", x, re.S):
    b = m.group(0)
    dp = re.search(r'<wp:docPr id="(\d+)" name="([^"]*)"', b)
    emb = re.search(r'r:embed="(rId\d+)"', b)
    d = re.search(r'descr="([^"]*)"', b)
    filas.append((dp.group(1), dp.group(2), emb.group(1) if emb else None, destino.get(emb.group(1)) if emb else None, d.group(1) if d else None))
ids = collections.Counter(f[0] for f in filas)
for f in filas:
    print(("DUP " if ids[f[0]] > 1 else "    ") + " | ".join(str(c) for c in f))
