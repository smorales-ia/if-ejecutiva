"""lado.py original.pdf nuevo.pdf prefijo desfase [escala] — pares lado a lado (página original i ↔ nueva i-desfase)."""
import sys
import pypdfium2 as pdfium
from PIL import Image
o, n, pref, desf = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
esc = float(sys.argv[5]) if len(sys.argv) > 5 else 1.3
A, B = pdfium.PdfDocument(o), pdfium.PdfDocument(n)
print("paginas original", len(A), "nuevo", len(B))
for i in range(len(A)):
    j = i - desf
    if not (0 <= j < len(B)):
        continue
    a = A[i].render(scale=esc).to_pil()
    b = B[j].render(scale=esc).to_pil().resize(a.size)
    c = Image.new("RGB", (a.width * 2 + 10, a.height), "white")
    c.paste(a, (0, 0)); c.paste(b, (a.width + 10, 0))
    c.save(f"{pref}_{i + 1}.png")
