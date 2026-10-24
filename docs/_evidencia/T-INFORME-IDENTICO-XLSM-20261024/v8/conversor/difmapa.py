"""Mapa de diferencias: rojo = tinta del original que falta en el nuevo; azul = tinta del nuevo que no está en el original."""
import sys
import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageFilter
o, n, po, pn, sal = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
esc = 150 / 72
a = pdfium.PdfDocument(o)[po - 1].render(scale=esc).to_pil().convert("RGB")
b = pdfium.PdfDocument(n)[pn - 1].render(scale=esc).to_pil().convert("RGB").resize(a.size)
an, bn = np.asarray(a).astype(int), np.asarray(b).astype(int)
verde = (bn[..., 1] > 180) & (bn[..., 0] < 170) & (bn[..., 2] < 170) & (bn[..., 1] - bn[..., 0] > 60)
ta, tb = (an.mean(2) < 200) & ~verde, (bn.mean(2) < 200) & ~verde
dil = lambda m: np.asarray(Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))) > 0
falta, sobra = ta & ~dil(tb), tb & ~dil(ta)
out = np.full(an.shape, 255, dtype=np.uint8)
gris = (an.mean(2) < 200)
out[gris] = (210, 210, 210)
out[falta] = (220, 0, 0)
out[sobra] = (0, 80, 230)
Image.fromarray(out).save(sal)
print("falta", int(falta.sum()), "sobra", int(sobra.sum()))
