"""Agrega rangos combinados a la hoja Impresion de un xlsx (edición de XML, conserva imágenes)."""
import re, sys, zipfile

origen, destino, *rangos = sys.argv[1:]
zin = zipfile.ZipFile(origen)
contenido = {i.filename: zin.read(i.filename) for i in zin.infolist()}
items = list(zin.infolist())
wbx = contenido["xl/workbook.xml"].decode()
rels = contenido["xl/_rels/workbook.xml.rels"].decode()
rid = re.search(r'<sheet [^>]*name="Impresion"[^>]*r:id="(rId\d+)"', wbx).group(1)
ruta = None
for rel in re.findall(r"<Relationship [^>]*>", rels):
    if f'Id="{rid}"' in rel:
        ruta = "xl/" + re.search(r'Target="([^"]+)"', rel).group(1).split("xl/")[-1].lstrip("/")
x = contenido[ruta].decode()
nuevos = "".join(f'<mergeCell ref="{r}"/>' for r in rangos)
x = re.sub(r'<mergeCells count="(\d+)">', lambda m: f'<mergeCells count="{int(m.group(1)) + len(rangos)}">' + nuevos, x, count=1)
contenido[ruta] = x.encode()
zout = zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED)
for it in items:
    zout.writestr(it, contenido[it.filename])
zout.close()
print("ok", ruta, rangos)
