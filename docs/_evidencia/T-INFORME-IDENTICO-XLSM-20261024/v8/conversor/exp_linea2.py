"""Experimento 2: interlineado exacto L + espacio posterior a, celda de alto H, alineación inferior."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx_escritor import empaquetar, sectpr, tw
casos, filas = [], []
for H, S in ((8.77, 6.6), (8.77, 7.2), (9.47, 9.6), (8.77, 6.0)):
    for L in (S * 0.8, S * 1.0, S * 1.1, min(H, S * 1.22)):
        for a in (0.0, 0.5, 1.0, 1.5):
            if a + L > H + 0.01:
                continue
            hp = int(round(S * 2))
            p = (f'<w:p><w:pPr><w:spacing w:before="0" w:after="{tw(a)}" w:line="{tw(L)}" w:lineRule="exact"/><w:rPr><w:sz w:val="{hp}"/></w:rPr></w:pPr>'
                 f'<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="{hp}"/></w:rPr><w:t>X{len(casos)}X</w:t></w:r></w:p>')
            tc = f'<w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:vAlign w:val="bottom"/></w:tcPr>{p}</w:tc>'
            filas.append(f'<w:tr><w:trPr><w:trHeight w:val="{tw(H)}" w:hRule="exact"/></w:trPr>{tc}</w:tr>')
            casos.append(dict(id=len(casos), H=H, S=S, L=round(L, 2), a=a, var=f"L={L:.2f} a={a}"))
tbl = ('<w:tbl><w:tblPr><w:tblW w:w="3000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/>'
       '<w:left w:w="20" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="20" w:type="dxa"/></w:tblCellMar></w:tblPr>'
       '<w:tblGrid><w:gridCol w:w="3000"/></w:tblGrid>' + "".join(filas) + "</w:tbl><w:p/>")
empaquetar(sys.argv[1], tbl, sectpr(top=20, left=20), [])
json.dump(casos, open(sys.argv[2], "w"))
print(len(casos))
