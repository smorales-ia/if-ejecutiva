"""Corta una página del original y del nuevo en tramos verticales y los pone lado a lado."""
import sys
import pypdfium2 as pdfium

orig, nuevo, pagina, salida, n_tramos = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], int(sys.argv[5])
pag_nuevo = int(sys.argv[6]) if len(sys.argv) > 6 else pagina
from PIL import Image

a = pdfium.PdfDocument(orig)[pagina - 1].render(scale=2.2).to_pil()
b = pdfium.PdfDocument(nuevo)[pag_nuevo - 1].render(scale=2.2).to_pil().resize(a.size)
h = a.height // n_tramos
for t in range(n_tramos):
    caja = (0, t * h, a.width, (t + 1) * h)
    ca, cb = a.crop(caja), b.crop(caja)
    lienzo = Image.new("RGB", (a.width * 2 + 20, h), "white")
    lienzo.paste(ca, (0, 0))
    lienzo.paste(cb, (a.width + 20, 0))
    lienzo.save(f"{salida}_{t + 1}.png")
print("ok", a.size)
