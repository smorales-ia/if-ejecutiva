"""Experimento 3: efecto de los bordes sobre la línea de base (interlineado exacto L=S, espacio posterior a)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx_escritor import empaquetar, sectpr, tw
casos, filas = [], []
B = {"nada": None, "fino": ("single", 5), "medio": ("single", 10), "doble": ("double", 3)}
for H, S in ((8.77, 6.0), (8.77, 7.2)):
    for bn, bv in B.items():
        for donde in ("abajo", "arriba", "ambos"):
            if bn == "nada" and donde != "abajo":
                continue
            for a in (0.0, 1.0):
                L = S
                hp = int(round(S * 2))
                bx = ""
                if bv:
                    e = f'w:val="{bv[0]}" w:sz="{bv[1]}" w:space="0" w:color="000000"'
                    bx = "<w:tcBorders>" + (f"<w:top {e}/>" if donde in ("arriba", "ambos") else "") + (f"<w:bottom {e}/>" if donde in ("abajo", "ambos") else "") + "</w:tcBorders>"
                p = (f'<w:p><w:pPr><w:spacing w:before="0" w:after="{tw(a)}" w:line="{tw(L)}" w:lineRule="exact"/></w:pPr>'
                     f'<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="{hp}"/></w:rPr><w:t>X{len(casos)}X</w:t></w:r></w:p>')
                tc = f'<w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/>{bx}<w:vAlign w:val="bottom"/></w:tcPr>{p}</w:tc>'
                filas.append(f'<w:tr><w:trPr><w:trHeight w:val="{tw(H)}" w:hRule="exact"/></w:trPr>{tc}</w:tr>')
                casos.append(dict(id=len(casos), H=H, S=S, var=f"{bn}-{donde} a={a}"))
                # fila separadora para que los bordes no se compartan
                filas.append(f'<w:tr><w:trPr><w:trHeight w:val="{tw(H)}" w:hRule="exact"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr><w:p/></w:tc></w:tr>')
                casos.append(dict(id=len(casos), H=H, S=S, var="sep"))
tbl = ('<w:tbl><w:tblPr><w:tblW w:w="3000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/>'
       '<w:left w:w="20" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="20" w:type="dxa"/></w:tblCellMar></w:tblPr>'
       '<w:tblGrid><w:gridCol w:w="3000"/></w:tblGrid>' + "".join(filas) + "</w:tbl><w:p/>")
empaquetar(sys.argv[1], tbl, sectpr(top=20, left=20), [])
json.dump(casos, open(sys.argv[2], "w"))
