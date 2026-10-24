"""Construye PLANTILLA_MET_v8.docx: hoja Tapa + hoja Impresion de la planilla del cliente (MET-6283),
cada una con la escala con que Excel la imprimió (medida en el PDF original), con etiquetas Carbone.

Uso:
  python -P construir_v8.py <xlsm> <geometria_impresion.tsv> <geometria_tapa.tsv> <salida.docx> [--estatico]

--estatico: valores e imágenes del propio xlsm (sin etiquetas), para validar la geometría.
Requiere: anchos_impresos.json (ajustar_cols.py) y celdas.tsv (textos de Excel de las celdas con fórmula).
"""
import argparse, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from xl_modelo import cargar_hoja, cargar_geometria, anclas_dibujo
from docx_escritor import Conversor, Pagina, empaquetar, sectpr, parrafo_ancla
from construir import IMPRESION, EXCLUIR_IMPRESION, formas_pagina, preparar_anclas, textos_tsv, imagenes_carbone
import json

TAPA = dict(
    hoja="Tapa", area="A1:J57", paginas=[(1, 57)],
    # Medido en la página 1 del original: bandas B4:I5 y B35:I36; logo (Picture 1).
    o=dict(kx=0.6152, ky=0.5893, kf=0.6, ksx=0.6165, forma_x0=16.18, forma_dy=0.0, x0=15.97, y0=14.63, pad=1.27,
           tbl_ind=0.0, indent_pt=7.5 * 0.6152, pad_char_pt=3.4, x_max=914),
)
ETIQUETAS_TAPA = {
    (39, 5): "{d.meta.numeroSolicitudCliente}",
    (40, 5): "{d.clienteInforme.nombre}",
    (41, 5): "{d.partes.propietario}",
    (42, 5): "{d.partes.rut}",
    (43, 5): "{d.propiedad.direccion}",
    (46, 5): "{d.propiedad.comuna}",
    (47, 5): "{d.propiedad.region}",
}


def hoja(xlsm, geo, cfg, etiquetas, imagenes, excluir, textos, sobre=None):
    cols, rows, shapes = cargar_geometria(geo)
    if cfg.get("anchos_json"):
        cfg["o"]["anchos"] = json.load(open(cfg["anchos_json"]))["anchos"]
    modelo = cargar_hoja(xlsm, cfg["hoja"], cfg["area"], textos)
    anclas, z = anclas_dibujo(xlsm, cfg["hoja"])
    preparar_anclas(anclas, cols, rows)
    return dict(cfg=cfg, cols=cols, rows=rows, shapes=shapes, anclas=anclas, z=z,
                conv=Conversor(modelo, cols, rows, cfg["o"], etiquetas, sobre), imagenes=imagenes or {}, excluir=excluir)


def construir_libro(hojas, salida):
    x_marg = min(h["cfg"]["o"]["x0"] for h in hojas)
    y_marg = min(h["cfg"]["o"]["y0"] for h in hojas) - 1.0
    media, ids, cuerpo = [], [0], []
    primera = True
    for h in hojas:
        o = h["cfg"]["o"]
        o["tbl_ind"] = o["x0"] - x_marg
        for (r0, r1) in h["cfg"]["paginas"]:
            f = formas_pagina(h["cfg"], h["shapes"], h["rows"], h["anclas"], h["z"], (r0, r1), h["imagenes"],
                              set(h["excluir"]), media, ids)
            # El párrafo ancla de 1 pt (+ la diferencia de origen vertical de la hoja) precede a la tabla.
            cuerpo.append(parrafo_ancla(not primera, f, alto_pt=o["y0"] - y_marg))
            cuerpo.append(h["conv"].xml_tabla(Pagina(r0, r1)))
            primera = False
    cuerpo.append('<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/><w:rPr><w:sz w:val="2"/></w:rPr></w:pPr></w:p>')
    empaquetar(salida, "".join(cuerpo), sectpr(top=y_marg, left=x_marg, right=0, bottom=0), media)
    print("OK", salida, "media", len(media), "bytes", os.path.getsize(salida))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("xlsm"); ap.add_argument("geo_impresion"); ap.add_argument("geo_tapa"); ap.add_argument("salida")
    ap.add_argument("--textos", required=True)
    ap.add_argument("--estatico", action="store_true")
    a = ap.parse_args()
    tx = textos_tsv(a.textos)
    if a.estatico:
        hs = [hoja(a.xlsm, a.geo_tapa, TAPA, None, None, set(), tx),
              hoja(a.xlsm, a.geo_impresion, IMPRESION, None, None, set(EXCLUIR_IMPRESION), tx)]
    else:
        import etiquetas_impresion as ei
        hs = [hoja(a.xlsm, a.geo_tapa, TAPA, ETIQUETAS_TAPA, None, set(), tx),
              hoja(a.xlsm, a.geo_impresion, IMPRESION, ei.ETIQUETAS, imagenes_carbone(ei.IMAGENES),
                   set(EXCLUIR_IMPRESION) | ei.EXCLUIR_EXTRA, tx, ei.SOBRE)]
    construir_libro(hs, a.salida)
