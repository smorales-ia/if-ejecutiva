"""Coincidencia de píxeles por página (original vs nuevo), sin contar la marca de agua verde de la clave TEST.
Un píxel coincide si en una vecindad de ±1 px (a 100 ppp) hay un píxel del otro con diferencia de gris < 60.
Reporta % de píxeles con tinta (no blancos) del original que coinciden, y viceversa."""
import sys
import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageFilter

o, n, desf = sys.argv[1], sys.argv[2], int(sys.argv[3])
A, B = pdfium.PdfDocument(o), pdfium.PdfDocument(n)
esc = 100 / 72
for j in range(len(B)):
    i = j + desf
    if i >= len(A):
        break
    a = A[i].render(scale=esc).to_pil().convert("RGB")
    b = B[j].render(scale=esc).to_pil().convert("RGB").resize(a.size)
    an, bn = np.asarray(a).astype(int), np.asarray(b).astype(int)
    verde = (bn[..., 1] > 180) & (bn[..., 0] < 170) & (bn[..., 2] < 170) & (bn[..., 1] - bn[..., 0] > 60)
    ga, gb = an.mean(axis=2), bn.mean(axis=2)
    tinta_a = (ga < 200) & ~verde
    tinta_b = (gb < 200) & ~verde
    # dilatar para tolerar ±1 px
    def dil(m):
        return np.asarray(Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3))) > 0
    ok_a = tinta_a & dil(tinta_b)
    ok_b = tinta_b & dil(tinta_a)
    pa = 100 * ok_a.sum() / max(1, tinta_a.sum())
    pb = 100 * ok_b.sum() / max(1, tinta_b.sum())
    print(f"pág {i + 1}: tinta del original presente en el nuevo {pa:5.1f}% · tinta del nuevo presente en el original {pb:5.1f}%")
