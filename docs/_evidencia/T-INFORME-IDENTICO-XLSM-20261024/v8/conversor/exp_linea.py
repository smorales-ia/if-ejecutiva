"""Experimento: línea de base de LibreOffice (Carbone) según alto de fila, tamaño y regla de interlineado."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx_escritor import empaquetar, sectpr, tw

casos = []
filas = []
y = 0
for H in (8.77, 9.47, 12.0):
    for S in (6.0, 7.2, 8.4, 9.6, 10.8):
        for var in ("auto_bottom", "exactS_bottom", "exactH_bottom", "auto_top0", "exact_top"):
            etiqueta = f"H{H}S{S}{var}"
            hp = int(round(S * 2))
            if var == "auto_bottom":
                sp, va = 'w:line="240" w:lineRule="auto"', "bottom"
            elif var == "exactS_bottom":
                sp, va = f'w:line="{tw(S)}" w:lineRule="exact"', "bottom"
            elif var == "exactH_bottom":
                sp, va = f'w:line="{tw(H)}" w:lineRule="exact"', "bottom"
            elif var == "auto_top0":
                sp, va = 'w:line="240" w:lineRule="auto"', "top"
            else:
                sp, va = f'w:line="{tw(H)}" w:lineRule="exact"', "top"
            p = (f'<w:p><w:pPr><w:spacing w:before="0" w:after="0" {sp}/><w:rPr><w:sz w:val="{hp}"/></w:rPr></w:pPr>'
                 f'<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="{hp}"/></w:rPr><w:t>X{len(casos)}X</w:t></w:r></w:p>')
            tc = (f'<w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="2" w:color="FF0000"/></w:tcBorders>'
                  f'<w:vAlign w:val="{va}"/></w:tcPr>{p}</w:tc>')
            filas.append(f'<w:tr><w:trPr><w:trHeight w:val="{tw(H)}" w:hRule="exact"/></w:trPr>{tc}</w:tr>')
            casos.append(dict(id=len(casos), H=H, S=S, var=var, top=y))
            y += H
tbl = ('<w:tbl><w:tblPr><w:tblW w:w="3000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/>'
       '<w:left w:w="20" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="20" w:type="dxa"/></w:tblCellMar></w:tblPr>'
       '<w:tblGrid><w:gridCol w:w="3000"/></w:tblGrid>' + "".join(filas) + "</w:tbl><w:p/>")
empaquetar(sys.argv[1], tbl, sectpr(top=20, left=20), [])
json.dump(casos, open(sys.argv[2], "w"))
print(len(casos), "casos, alto total", y)
