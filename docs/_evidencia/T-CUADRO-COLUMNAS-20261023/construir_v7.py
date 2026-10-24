"""Construye PLANTILLA_MET_v7.docx desde la v6 (réplica MET-6283, 23-oct-2026).

Cambios, todos sin tocar el diseño de Word:
1. Imágenes: cada casilla {d.…} recibe su propio archivo de marcador (bytes
   únicos) y rId; en la v6 las 36 compartían `rId7`. Además, `:imageFit(contain)`
   para que la imagen quede dentro de su casilla. Con eso la fachada y el mapa
   de la Hoja 1 dejan de desbordar la página, las fotos caben 8 por hoja y el
   anexo 2 cabe en una.
2. Hoja 1: «Dirección» imprime sólo la calle (`propiedad.calle`) y «Rol» el rol
   con «N°» (`propiedad.rolImpreso`), como el original.

Uso: python -P construir_v7.py <v6.docx> <v7.docx>
"""
import re, struct, sys, zipfile, zlib

origen, destino = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(origen)
contenido = {i.filename: zin.read(i.filename) for i in zin.infolist()}
items = list(zin.infolist())
zin.close()

x = contenido["word/document.xml"].decode("utf-8")
rels = contenido["word/_rels/document.xml.rels"].decode("utf-8")

# --- 2. Etiquetas de la Hoja 1 (entre «Hoja N°1» y «Hoja N°2») -------------
# La Hoja 1 empieza en «Hoja N°1»; su dirección es la primera después de esa
# marca (la siguiente ya es la del encabezado de la Hoja 2, que va completa).
ini = x.find("Hoja N°1")
assert ini > 0, "no encontré la Hoja 1"
i_dir = x.find("{d.propiedad.direccion}", ini)
i_rol = x.find("{d.sii.rolSii}", ini)
assert i_dir > 0 and i_rol > 0 and i_rol < x.find("Hoja N°2"), "no encontré dirección o rol en la Hoja 1"
assert x.count("{d.sii.rolSii}") == 1
x = x[:i_dir] + "{d.propiedad.calle}" + x[i_dir + len("{d.propiedad.direccion}"):]
x = x.replace("{d.sii.rolSii}", "{d.propiedad.rolImpreso}")

# --- 1. Imágenes ----------------------------------------------------------
destinos = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
siguiente = max(int(n) for n in re.findall(r'Id="rId(\d+)"', rels)) + 1
nuevos, nuevas_rels = {}, []


def png_unico(datos: bytes, marca: str) -> bytes:
    if not datos.startswith(b"\x89PNG"):
        return datos
    cuerpo = b"Comment\x00" + marca.encode()
    bloque = struct.pack(">I", len(cuerpo)) + b"tEXt" + cuerpo + struct.pack(">I", zlib.crc32(b"tEXt" + cuerpo) & 0xFFFFFFFF)
    i = datos.rfind(b"IEND") - 4
    return datos[:i] + bloque + datos[i:]


def arreglar(m):
    global siguiente
    b = m.group(0)
    d = re.search(r'descr="\{(d\.[^"}]*)\}"', b)
    if not d:
        return b
    tag = d.group(1)
    if ":imageFit(" not in tag:
        b = b.replace(d.group(0), f'descr="{{{tag}:imageFit(contain)}}"')
    emb = re.search(r'r:embed="(rId\d+)"', b)
    if emb:
        target = destinos[emb.group(1)]
        rid = f"rId{siguiente}"
        siguiente += 1
        nuevo = f"media/marcador_{rid}.{target.rsplit('.', 1)[-1]}"
        nuevos["word/" + nuevo] = png_unico(contenido["word/" + target], nuevo)
        nuevas_rels.append(
            f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="{nuevo}"/>'
        )
        b = b.replace(emb.group(0), f'r:embed="{rid}"')
    return b


x = re.sub(r"<wp:inline\b.*?</wp:inline>", arreglar, x, flags=re.S)
rels = rels.replace("</Relationships>", "".join(nuevas_rels) + "</Relationships>")

zout = zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED)
for item in items:
    if item.filename == "word/document.xml":
        zout.writestr(item, x.encode("utf-8"))
    elif item.filename == "word/_rels/document.xml.rels":
        zout.writestr(item, rels.encode("utf-8"))
    else:
        zout.writestr(item, contenido[item.filename])
for nombre, datos in nuevos.items():
    zout.writestr(nombre, datos)
zout.close()
assert zipfile.ZipFile(destino).testzip() is None
print(f"OK {destino} · imágenes con archivo propio: {len(nuevos)}")
