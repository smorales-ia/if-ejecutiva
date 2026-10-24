"""Compara dos PDF página por página: cantidad de páginas y números presentes en uno y no en el otro."""
import re, sys
import pypdf

nuevo, original = sys.argv[1:3]

def paginas(ruta):
    return [p.extract_text() or "" for p in pypdf.PdfReader(ruta).pages]

def numeros(texto):
    return set(re.findall(r"\d[\d.]*,\d+|\d{1,3}(?:\.\d{3})+|\d{2,}", texto))

a, b = paginas(nuevo), paginas(original)
print(f"páginas nuevo={len(a)} original={len(b)}")
todo_a = numeros(" ".join(a)); todo_b = numeros(" ".join(b))
print("números del original que faltan en el nuevo:", sorted(todo_b - todo_a)[:80])
print("números del nuevo que no están en el original:", sorted(todo_a - todo_b)[:80])
for i in range(max(len(a), len(b))):
    ta = a[i] if i < len(a) else ""; tb = b[i] if i < len(b) else ""
    fa, fb = numeros(ta) - numeros(tb), numeros(tb) - numeros(ta)
    print(f"--- pág {i+1}: solo-nuevo={sorted(fa)[:25]} | solo-original={sorted(fb)[:25]}")
