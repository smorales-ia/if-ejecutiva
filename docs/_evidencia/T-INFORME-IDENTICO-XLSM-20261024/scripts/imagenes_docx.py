"""Lista las imágenes de una plantilla docx: posición, tamaño y descr (tag de Carbone)."""
import re, sys, zipfile

x = zipfile.ZipFile(sys.argv[1]).read("word/document.xml").decode("utf-8")
for m in re.finditer(r"<wp:(inline|anchor)\b.*?</wp:\1>", x, re.S):
    blk = m.group(0)
    ext = re.search(r'<wp:extent cx="(\d+)" cy="(\d+)"', blk)
    descr = re.search(r'descr="([^"]*)"', blk)
    w, h = (int(ext.group(1)) / 12700, int(ext.group(2)) / 12700) if ext else (0, 0)
    print(f"{m.start():7d} {w:6.1f}x{h:6.1f}pt {m.group(1)} descr={descr.group(1) if descr else None}")
