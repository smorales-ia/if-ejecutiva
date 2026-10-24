"""Cuenta celdas combinadas y otros rasgos de la hoja Impresion en libros xlsx/xlsm."""
import re, sys, zipfile


def hoja(z, nombre):
    wbx = z.read("xl/workbook.xml").decode()
    rels = z.read("xl/_rels/workbook.xml.rels").decode()
    rid = re.search(rf'<sheet [^>]*name="{nombre}"[^>]*r:id="(rId\d+)"', wbx).group(1)
    for rel in re.findall(r"<Relationship [^>]*>", rels):
        if f'Id="{rid}"' in rel:
            t = re.search(r'Target="([^"]+)"', rel).group(1)
            return z.read("xl/" + t.split("xl/")[-1].lstrip("/")).decode()


for p in sys.argv[1:]:
    z = zipfile.ZipFile(p)
    x = hoja(z, "Impresion")
    print(p.split("\\")[-1], "merges", x.count("<mergeCell "), "condFmt", x.count("<conditionalFormatting"), "cols", x.count("<col "), "bytes", len(x))
