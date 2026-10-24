"""Muestra el XML crudo de una fila de la hoja Impresion de uno o más libros."""
import re, sys, zipfile


def hoja(z, nombre):
    wbx = z.read("xl/workbook.xml").decode()
    rels = z.read("xl/_rels/workbook.xml.rels").decode()
    rid = re.search(rf'<sheet [^>]*name="{nombre}"[^>]*r:id="(rId\d+)"', wbx).group(1)
    for rel in re.findall(r"<Relationship [^>]*>", rels):
        if f'Id="{rid}"' in rel:
            t = re.search(r'Target="([^"]+)"', rel).group(1)
            return z.read("xl/" + t.split("xl/")[-1].lstrip("/")).decode()


fila = sys.argv[1]
for p in sys.argv[2:]:
    x = hoja(zipfile.ZipFile(p), "Impresion")
    m = re.search(rf'<row r="{fila}"[^>]*>(.*?)</row>', x, re.S)
    print("==", p.split("\\")[-1])
    print(re.sub(r"(<c )", r"\n\1", m.group(1))[:1800] if m else "sin fila")
    cols = re.search(r"<cols>(.*?)</cols>", x, re.S)
    if cols:
        print("cols:", cols.group(1)[:600])
