#!/usr/bin/env python3
"""
Genera docs/_artefactos/carbone/PLANTILLA_MET_v2.docx — plantilla Carbone del informe
MetLife idéntica en diseño al PDF de referencia MET-6283 (T-PDF-IDENTICO-20260927).

Cambios v2 sobre v1 (top-10 del Agente 4 + contrato de imágenes §3.3 del plan):
- 8 páginas exactas (Hoja 1 compacta en una sola página, fuentes 4,8-6pt).
- Ranuras de imagen NUEVAS: mapa Hoja 1 arriba-derecha, mapa referencias Hoja 2,
  3 fotos de referencias, grillas 2×4 Hojas 4-5 (16 celdas con caption), Anexo 1
  (7 ranuras) y Anexo 2 (6 escaneados, incluida la escritura Fojas 3312).
- Comparables por bloque: `comparablesInforme.ofertas.*` (5 filas) y `.cbr.*` (2 filas),
  cada uno con su PROMEDIO, fila TASACION (tasacionFila.*) y V/S dentro de la tabla.
- Columna US$ cableada (`terminales.*Usd` + `usdDia`).
- Hoja 3 completa con el contrato `cualitativa.*` (claves camelCase por grupo).
- Cajas de borde fino sin grillas negras; énfasis cian #00B0F0; rojos #FF0000;
  fila TASACION celeste #8DB4E2; matriz habitaciones 15 col; matriz % uso terrenos.

Reglas duras que se conservan de v1: cada tag {d.*} en UN run único; placeholders de
imagen PNG gris con alt-text = tag; layout fixed anti-autofit (LibreOffice/Carbone).
"""
import re
import struct
import sys
import zipfile
import zlib
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

AQUI = Path(__file__).resolve().parent
REPO = AQUI.parents[2]
SALIDA = AQUI / "PLANTILLA_MET_v2.docx"
REQUERIDAS = REPO / "docs/_evidencia/T-PDF-BASE-20260927/variables_requeridas.txt"
LOGO = AQUI / "_logo_extraido.png"

AZUL = "095085"
CELESTE = "8DB4E2"
GRIS = "D4D4D4"
CIAN = "00B0F0"
ROJO = RGBColor(0xFF, 0x00, 0x00)
BLANCO = RGBColor(0xFF, 0xFF, 0xFF)
NEGRO = RGBColor(0, 0, 0)

# Excluidos deliberados v2: A4 pidió quitar el sufijo "(VP-2026-0067)" de la banda
# Nº Interno — era el único uso de {d.meta.codigo}; el dato sigue en el contexto.
EXCLUIDOS_V2 = {"{d.meta.codigo}"}

# Renombres v1 → v2 del contrato (para verificar() contra la lista de la tanda BASE).
ALIAS_V2 = {
    "{d.comparablesInforme.filas[i].direccion}": "{d.comparablesInforme.ofertas.filas[i].direccion}",
    "{d.comparablesInforme.filas[i].comuna}": "{d.comparablesInforme.ofertas.filas[i].comuna}",
    "{d.comparablesInforme.filas[i].supTerreno}": "{d.comparablesInforme.ofertas.filas[i].supTerreno}",
    "{d.comparablesInforme.filas[i].supConstruida}": "{d.comparablesInforme.ofertas.filas[i].supConstruida}",
    "{d.comparablesInforme.filas[i].precioUf}": "{d.comparablesInforme.ofertas.filas[i].precioUf}",
    "{d.comparablesInforme.filas[i].ufM2Construccion}": "{d.comparablesInforme.ofertas.filas[i].ufM2Construccion}",
    "{d.comparablesInforme.tasacionVsPct}": "{d.comparablesInforme.ofertas.tasacionVsPct}",
}

DECLARACION = (
    "El profesional que firma declara que no tiene hoy, ni espera tener en el futuro, interés en la "
    "propiedad tasada ni ningún impedimento para llevar a cabo este trabajo. No tiene personal interés "
    "ni participación en los usos que se hagan de la tasación ni con las personas que participen en la "
    "operación. Ha inspeccionado la vivienda y la información que en esta fecha presenta es totalmente "
    "verdadera, y no ha olvidado nada de importancia. Los inconvenientes y limitaciones que pueda tener "
    "la vivienda y su vecindario están mencionados. Por otra parte se mantendrá un nivel de "
    "confidencialidad de la información obtenida, acorde a las exigencias de la Institución, que desde "
    "ya declara conocer y aceptar."
)
BOILERPLATE_REFERENCIAS = (
    "Las muestras fueron seleccionadas por ser propiedades que comparten características similares en "
    "cuanto a dimensiones, programa, tipología de edificación, sector y se homologa en función a sus "
    "características propias como; diseño constructivo, calidad de sus materiales, calidad de sus "
    "revestimientos interiores y estado de mantención."
)

# ----------------------------------------------------------------------------- helpers OOXML


def shade(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), color)
    tcPr.append(shd)


def vertical(cell):
    tcPr = cell._tc.get_or_add_tcPr()
    td = OxmlElement("w:textDirection")
    td.set(qn("w:val"), "btLr")
    tcPr.append(td)


def bordes(table, sz=4, color="000000"):
    tbl = table._tbl
    tblPr = tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for lado in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{lado}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(sz))
        el.set(qn("w:color"), color)
        borders.append(el)
    tblPr.append(borders)


def caja(table, sz=6, color=AZUL):
    """Borde exterior fino, SIN líneas internas (cajas de la referencia)."""
    tbl = table._tbl
    borders = OxmlElement("w:tblBorders")
    for lado in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{lado}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(sz))
        el.set(qn("w:color"), color)
        borders.append(el)
    for lado in ("insideH", "insideV"):
        el = OxmlElement(f"w:{lado}")
        el.set(qn("w:val"), "none")
        borders.append(el)
    tbl.tblPr.append(borders)


def sin_bordes(table):
    tbl = table._tbl
    borders = OxmlElement("w:tblBorders")
    for lado in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{lado}")
        el.set(qn("w:val"), "none")
        borders.append(el)
    tbl.tblPr.append(borders)


def margenes_celda(table, lr=30, tb=0):
    """tblCellMar mínimo — compresión vertical clave para Hoja 1 en una página."""
    tblPr = table._tbl.tblPr
    m = OxmlElement("w:tblCellMar")
    for side, w in (("top", tb), ("left", lr), ("bottom", tb), ("right", lr)):
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:w"), str(w))
        el.set(qn("w:type"), "dxa")
        m.append(el)
    tblPr.append(m)


def alto_fila(row, cm, rule="atLeast"):
    trPr = row._tr.get_or_add_trPr()
    h = OxmlElement("w:trHeight")
    h.set(qn("w:val"), str(int(cm * 567)))
    h.set(qn("w:hRule"), rule)
    trPr.append(h)


def run_fmt(run, size, bold, color, font="Calibri"):
    run.font.name = font
    run.font.size = Pt(size)
    run.bold = bold
    if color is not None:
        run.font.color.rgb = color


def celda(cell, texto, size=5.5, bold=False, color=None, align=None, font="Calibri"):
    p = cell.paragraphs[0]
    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    run = p.add_run(texto)
    run_fmt(run, size, bold, color, font)
    if align:
        p.alignment = align
    return p


def celda_partes(cell, partes, align=None):
    p = cell.paragraphs[0]
    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    for texto, size, bold, color in partes:
        run = p.add_run(texto)
        run_fmt(run, size, bold, color)
    if align:
        p.alignment = align
    return p


def parrafo(doc, texto, size=5.5, bold=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, color=None,
            space_after=2):
    p = doc.add_paragraph()
    run = p.add_run(texto)
    run_fmt(run, size, bold, color)
    p.alignment = align
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    return p


def barra(doc, texto, size=8, fill=AZUL, color=BLANCO, bold=True, ancho=19.8):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    t.columns[0].width = Cm(ancho)
    margenes_celda(t)
    shade(t.cell(0, 0), fill)
    celda(t.cell(0, 0), texto, size=size, bold=bold, color=color,
          align=WD_ALIGN_PARAGRAPH.CENTER)
    return t


PNG_GRIS = None


def png_gris(path):
    w, h = 120, 80
    fila = b"\x00" + b"\xd9\xd9\xd9" * w
    raw = fila * h

    def chunk(tipo, data):
        c = struct.pack(">I", len(data)) + tipo + data
        return c + struct.pack(">I", zlib.crc32(tipo + data) & 0xFFFFFFFF)

    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw))
           + chunk(b"IEND", b""))
    path.write_bytes(png)
    return path


def imagen(cell_o_doc, alt, ancho_cm, alto_cm=None, path=None):
    from docx.table import _Cell
    src = path or PNG_GRIS
    if isinstance(cell_o_doc, _Cell):
        p = cell_o_doc.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run()
    else:
        # Document: párrafo nuevo al final del cuerpo (¡no usar hasattr:
        # Document también tiene .paragraphs y el mapa iría a la portada!)
        p = cell_o_doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run()
    shape = run.add_picture(str(src), width=Cm(ancho_cm),
                            height=Cm(alto_cm) if alto_cm else None)
    if alt:
        shape._inline.docPr.set("descr", alt)
    return shape


def encabezado_hoja(doc, n):
    """Encabezado repetido Hojas 2-7: labels 4,8pt regular / valores 6pt bold,
    borde fino, folio fuera del recuadro (celda sin sombrear a la derecha)."""
    t = doc.add_table(rows=2, cols=5)
    t.autofit = False
    caja(t, sz=4, color="7F7F7F")
    margenes_celda(t)
    anchos = (2.4, 6.6, 2.0, 6.8, 2.0)
    for fila in t.rows:
        alto_fila(fila, 0.35)
        for i, c in enumerate(fila.cells):
            c.width = Cm(anchos[i])
    celda(t.cell(0, 0), "Nombre Cliente", 4.8, False)
    celda(t.cell(0, 1), "{d.partes.propietario}", 6, True)
    celda(t.cell(0, 2), "Dirección", 4.8, False)
    celda(t.cell(0, 3), "{d.propiedad.direccion}", 6, True)
    celda(t.cell(0, 4), f"Hoja N°{n}", 5.5, True, align=WD_ALIGN_PARAGRAPH.RIGHT)
    celda(t.cell(1, 0), "Rut", 4.8, False)
    celda(t.cell(1, 1), "{d.partes.rut}", 6, True)
    celda(t.cell(1, 2), "Nº Interno", 4.8, False)
    celda(t.cell(1, 3), "{d.meta.numeroSolicitudCliente}", 6, True)
    celda(t.cell(1, 4), "", 5)
    return t


def bloque_con_sidebar(doc, rotulo, filas, cols, anchos_cm, borde_sz=2):
    ext = doc.add_table(rows=1, cols=2)
    ext.autofit = False
    sin_bordes(ext)
    margenes_celda(ext, lr=0)
    sb = ext.cell(0, 0)
    sb.width = Cm(0.5)
    shade(sb, AZUL)
    vertical(sb)
    celda(sb, rotulo, 5, True, BLANCO, align=WD_ALIGN_PARAGRAPH.CENTER)
    cont = ext.cell(0, 1)
    cont.width = Cm(19.3)
    inner = cont.add_table(rows=filas, cols=cols)
    inner.autofit = False
    bordes(inner, sz=borde_sz, color="808080")
    margenes_celda(inner)
    if anchos_cm:
        for fila in inner.rows:
            for i, c in enumerate(fila.cells):
                c.width = Cm(anchos_cm[i])
    for fila in inner.rows:
        alto_fila(fila, 0.28)
    return inner


# ----------------------------------------------------------------------------- páginas


def portada(doc):
    # Densidad vertical calibrada contra el oráculo Met6283 (T-CIERRE-FINAL-20260929):
    # la portada generada terminaba a ~68% de la altura y la referencia a ~81%.
    # Los spacers se agrandaron (space_after) para bajar cada bloque a su posición
    # de referencia: título 6,3% · logo 23,2% · ANTECEDENTES 54,4% · ficha 59,8%
    # · pie 77,6% (medidos como % del alto de página a 100 dpi).
    barra(doc, "INFORME DE TASACION", size=18, bold=False, ancho=17.0)
    for _ in range(4):
        parrafo(doc, "", size=11, space_after=21)
    # logo centrado, sin recuadro (v1 tenía caja con placeholder sobrante)
    if LOGO.exists():
        imagen(doc, None, 9.9, 6.3, path=LOGO)
    for _ in range(3):
        parrafo(doc, "", size=11, space_after=21)
    barra(doc, "ANTECEDENTES", size=14, bold=False, ancho=17.0)
    parrafo(doc, "", size=8, space_after=20)
    # caja única de borde azul fino SIN grilla interna; label + tab a ~40%
    ficha = doc.add_table(rows=7, cols=2)
    ficha.alignment = WD_TABLE_ALIGNMENT.CENTER
    ficha.autofit = False
    caja(ficha, sz=6, color=AZUL)
    margenes_celda(ficha, lr=120, tb=20)
    datos = [
        ("Numero Solicitud :", "{d.meta.numeroSolicitudCliente}"),
        ("Institución :", "{d.clienteInforme.nombre}"),
        ("Nombre Cliente :", "{d.partes.propietario}"),
        ("Rut :", "{d.partes.rut}"),
        ("Dirección Propiedad :", "{d.propiedad.direccion}"),
        ("Comuna :", "{d.propiedad.comuna}"),
        ("Región :", "{d.propiedad.region}"),
    ]
    for i, (k, v) in enumerate(datos):
        ficha.rows[i].cells[0].width = Cm(6.8)
        ficha.rows[i].cells[1].width = Cm(10.2)
        alto_fila(ficha.rows[i], 0.55)
        celda(ficha.cell(i, 0), k, 11, False)
        celda(ficha.cell(i, 1), v, 11, True)
    parrafo(doc, "", size=11, space_after=12)
    pie = doc.add_table(rows=2, cols=2)
    pie.alignment = WD_TABLE_ALIGNMENT.CENTER
    pie.autofit = False
    caja(pie, sz=6, color=AZUL)
    margenes_celda(pie, lr=120, tb=20)
    pie.columns[0].width = Cm(7.5)
    pie.columns[1].width = Cm(11.5)
    celda(pie.cell(0, 0), "www.valueproperty.cl", 10, False)
    celda(pie.cell(1, 0), "Mail: info@valueproperty.cl", 10, False)
    celda(pie.cell(0, 1), "Dirección: Santa Magdalena 75 Of 310, Providencia - Santiago", 10, False)
    celda(pie.cell(1, 1), "Fono: 22 500 0366", 10, False)


def _tabla_comparables(doc, titulo, grupo, nfilas, col4_titulo, col4_campo, anchos,
                       comentario_ancho=True):
    """Bloque REF. OFERTAS / REF. C.B.R.: título, header, filas [i=K] directas,
    PROMEDIO + TASACION + V/S adentro, todo con el contrato v2 por bloque."""
    cab = ["N°", "Fecha", "Tipo", "Dirección referencias", "Año", col4_titulo, "Total UF",
           "Sup. Terreno.", "Sup. Construida.", "OO.CC.", "UF/m² T.", "UF/m² C.",
           "Comentarios Relevantes"]
    filas_tot = 2 + nfilas + 3
    t = bloque_con_sidebar(doc, "Referencias y Mercado", filas_tot, len(cab), anchos)
    fila_t = t.rows[0]
    fila_t.cells[0].merge(fila_t.cells[len(cab) - 1])
    shade(fila_t.cells[0], GRIS)
    celda(fila_t.cells[0], titulo, 6, True)
    for j, h in enumerate(cab):
        shade(t.cell(1, j), GRIS)
        color = ROJO if h == "Comentarios Relevantes" else None
        celda(t.cell(1, j), h, 4.8, True, color, align=WD_ALIGN_PARAGRAPH.CENTER)
    for k in range(nfilas):
        pref = f"{{d.comparablesInforme.{grupo}.filas[i={k}]"
        fila = [str(k + 1), pref + ".fecha}", pref + ".tipoReferencia}",
                pref + ".direccion}", pref + ".anio}", pref + f".{col4_campo}}}",
                pref + ".precioUf:formatN(0)}", pref + ".supTerreno:formatN(0)}",
                pref + ".supConstruida:formatN(0)}", pref + ".oocc:formatN(0)}",
                pref + ".ufM2Terreno:formatN(2)}", pref + ".ufM2Construccion:formatN(2)}",
                pref + ".comentarios}"]
        for j, v in enumerate(fila):
            al = WD_ALIGN_PARAGRAPH.RIGHT if 6 <= j <= 11 else (
                WD_ALIGN_PARAGRAPH.CENTER if j in (0, 1, 2, 4) else None)
            celda(t.cell(2 + k, j), v, 4.8, align=al)
    # PROMEDIO (celeste)
    fp = 2 + nfilas
    for j in range(len(cab)):
        shade(t.cell(fp, j), CELESTE)
        shade(t.cell(fp + 1, j), CELESTE)
        shade(t.cell(fp + 2, j), CELESTE)
    prom = f"{{d.comparablesInforme.{grupo}.promedio"
    celda(t.cell(fp, 3), "PROMEDIO DE LA MUESTRA", 4.8, True)
    for j, campo in ((6, ".totalUf:formatN(0)}"), (7, ".supTerreno:formatN(1)}"),
                     (8, ".supConstruida:formatN(1)}"), (9, ".oocc:formatN(0)}"),
                     (10, ".ufM2Terreno:formatN(2)}"), (11, ".ufM2Construccion:formatN(2)}")):
        celda(t.cell(fp, j), prom + campo, 4.8, True, align=WD_ALIGN_PARAGRAPH.RIGHT)
    # TASACION (celeste, desde tasacionFila.*)
    tf = "{d.comparablesInforme.tasacionFila"
    celda(t.cell(fp + 1, 3), "TASACION", 4.8, True)
    for j, campo in ((6, ".totalUf:formatN(0)}"), (7, ".supTerreno:formatN(0)}"),
                     (8, ".supConstruida:formatN(0)}"), (9, ".oocc:formatN(0)}"),
                     (10, ".ufM2Terreno:formatN(2)}"), (11, ".ufM2Construccion:formatN(2)}")):
        celda(t.cell(fp + 1, j), tf + campo, 4.8, True, align=WD_ALIGN_PARAGRAPH.RIGHT)
    # V/S adentro de la tabla, % en la columna UF/m² C.
    fila_vs = t.rows[fp + 2]
    fila_vs.cells[0].merge(fila_vs.cells[10])
    celda(fila_vs.cells[0], "TASACION V/S PROMEDIO DE LA MUESTRA", 4.8, True)
    celda_partes(t.cell(fp + 2, 11),
                 [(f"{{d.comparablesInforme.{grupo}.tasacionVsPct:formatN(0)}}", 4.8, True, None),
                  ("%", 4.8, True, None)], align=WD_ALIGN_PARAGRAPH.RIGHT)
    return t


def hoja1(doc):
    barra(doc, "INFORME DE TASACION", size=9)
    band = doc.add_table(rows=1, cols=2)
    band.autofit = False
    margenes_celda(band)
    band.columns[0].width = Cm(16.0)
    band.columns[1].width = Cm(3.8)
    shade(band.cell(0, 0), AZUL)
    celda_partes(band.cell(0, 0), [
        ("Nº Interno  :  ", 7, True, BLANCO),
        ("{d.meta.numeroSolicitudCliente}", 7, True, BLANCO),
    ])
    celda(band.cell(0, 1), "Hoja N°1", 5.5, True, align=WD_ALIGN_PARAGRAPH.RIGHT)

    # ---- Identificación: 3 pares label/valor + columna mapa (merge vertical)
    colA = [
        ("Cliente", "{d.partes.propietario}"), ("RUT Cliente", "{d.partes.rut}"),
        ("Propietario", "{d.partes.propietario}"), ("RUT Prop.", "{d.partes.rut}"),
        ("Ejecutivo", "{d.partes.ejecutivo}"), ("Tasador", "{d.partes.tasador.nombre}"),
        ("Objetivo", "{d.propiedad.objetivo}"), ("Tipo Prop.", "{d.propiedad.tipoPropiedad}"),
        ("Fecha Tasación", "{d.partes.fechaVisita:formatD(DD-MM-YYYY)}"),
        ("Destino SII", "{d.sii.destinoSii}"),
        ("N° SOLICITUD", "{d.meta.nOperacionCliente}"),
        ("Formalizador", ""),
    ]
    colB = [
        ("Dirección", "{d.propiedad.direccion}"),
        ("Casa Nº", "{d.cualitativa.detallePropiedad.casaNumero}"),
        ("Comuna", "{d.propiedad.comuna}"), ("Region", "{d.propiedad.region}"),
        ("Rol", "{d.sii.rolSii}"), ("Condominio", "{d.propiedad.proyectoCondominio}"),
        ("Pisos Propiedad", "{d.propiedad.pisos}"),
        ("Sitio/Lote", "{d.cualitativa.detallePropiedad.sitioLote}"),
        ("Zona", "{d.cualitativa.detallePropiedad.zona}"),
        ("Manzana", "{d.sii.codManzana}"),
        ("Estacionamientos", "{d.propiedad.estacionamientos}"),
        ("Bodegas", "{d.propiedad.bodegas}"),
    ]
    colC = [
        ("DFL-2", "{d.propiedad.dfl2}"),
        ("Año Construccion", "{d.propiedad.anioConstruccion}"),
        ("Vida util", "{d.propiedad.vidaUtil}"),
        ("Permiso", "{d.legales.permisoEdificacion}"),
        ("Recepcion", "{d.legales.recepcionFinal}"),
        ("Ampliación", "{d.cualitativa.detallePropiedad.ampliacion}"),
        ("Subterraneos", "{d.cualitativa.detallePropiedad.subterraneos}"),
        ("Estado conservacion", "{d.propiedad.estadoConservacion:upperCase}"),
        ("Sello SEC", "{d.cualitativa.detallePropiedad.selloSec}"),
        ("Afecto a expropi.", "{d.cualitativa.detallePropiedad.afectoExpropiacion}"),
        ("Fuente Información", "{d.cualitativa.detallePropiedad.fuenteInformacion}"),
        ("Mansarda", "{d.cualitativa.detallePropiedad.mansarda}"),
    ]
    anchos = (1.6, 3.4, 1.6, 3.2, 1.6, 3.2, 4.3)
    ident = bloque_con_sidebar(doc, "Identificación", len(colA) + 1, 7, anchos)
    # mapa: merge vertical de la columna 7 (filas 0..11), arriba-derecha como la referencia
    mapa_cell = ident.cell(0, 6)
    for f in range(1, len(colA)):
        mapa_cell = mapa_cell.merge(ident.cell(f, 6))
    imagen(mapa_cell, "{d.imagenes.mapaUbicacion}", 4.1, 4.0)
    for i in range(len(colA)):
        for j, col in enumerate((colA, colB, colC)):
            k, v = col[i]
            cl = ident.cell(i, j * 2)
            shade(cl, GRIS)
            celda(cl, k, 4.8, False)
            vc = ident.cell(i, j * 2 + 1)
            if k in ("Afecto a expropi.",):
                shade(vc, CIAN)
            celda(vc, v, 4.8, True)
    ult = ident.rows[len(colA)]
    celda(ult.cells[0], "Ubicación/Empresa", 4.8, False)
    shade(ult.cells[0], GRIS)
    dexp = ult.cells[1].merge(ult.cells[5])
    shade(dexp, CIAN)
    celda_partes(dexp, [("Descripcion Expropiación:  ", 4.8, False, None),
                        ("{d.textosIA.textoExpropiacion}", 4.8, False, None)])
    celda(ult.cells[6], "", 4.8)

    # ---- Síntesis
    sint = bloque_con_sidebar(doc, "Síntesis", 2, 1, (19.3,))
    celda(sint.cell(0, 0), "{d.textosIA.sintesisPropiedad}", 4.8,
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    celda(sint.cell(1, 0), "{d.textosIA.descripcionSector}", 4.8,
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    # ---- REF. OFERTAS (5 filas, ancho completo)
    anchos_of = (0.5, 0.9, 0.9, 3.2, 0.7, 1.3, 1.1, 1.1, 1.1, 0.9, 0.9, 0.9, 5.8)
    _tabla_comparables(doc, "REF. OFERTAS", "ofertas", 5, "Teléfono", "telefono", anchos_of)

    # ---- REF. C.B.R. (2 filas) + ANALISIS DE RENTABILIDAD lado a lado
    dos = doc.add_table(rows=1, cols=2)
    dos.autofit = False
    sin_bordes(dos)
    margenes_celda(dos, lr=0)
    dos.columns[0].width = Cm(13.6)
    dos.columns[1].width = Cm(6.2)
    izq, der = dos.cell(0, 0), dos.cell(0, 1)

    cab_c = ["N°", "Fecha", "Tipo", "Dirección referencias", "Año", "Foja y Número",
             "Total UF", "Sup. Terreno.", "Sup. Construida.", "OO.CC.", "UF/m² T.", "UF/m² C."]
    anchos_c = (0.4, 0.8, 0.8, 2.5, 0.6, 1.4, 1.0, 1.0, 1.0, 0.8, 0.9, 0.9)
    tc = izq.add_table(rows=7, cols=len(cab_c))
    tc.autofit = False
    bordes(tc, sz=2, color="808080")
    margenes_celda(tc)
    for fila in tc.rows:
        alto_fila(fila, 0.28)
        for i, c in enumerate(fila.cells):
            c.width = Cm(anchos_c[i])
    f0 = tc.rows[0]
    f0.cells[0].merge(f0.cells[len(cab_c) - 1])
    shade(f0.cells[0], GRIS)
    celda(f0.cells[0], "REF. C.B.R.", 6, True)
    for j, h in enumerate(cab_c):
        shade(tc.cell(1, j), GRIS)
        celda(tc.cell(1, j), h, 4.8, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    for k in range(2):
        pref = f"{{d.comparablesInforme.cbr.filas[i={k}]"
        fila = [str(k + 6), pref + ".fecha}", pref + ".tipoReferencia}", pref + ".direccion}",
                pref + ".anio}", pref + ".fojaNumero}", pref + ".precioUf:formatN(0)}",
                pref + ".supTerreno:formatN(0)}", pref + ".supConstruida:formatN(0)}",
                pref + ".oocc:formatN(0)}", pref + ".ufM2Terreno:formatN(2)}",
                pref + ".ufM2Construccion:formatN(2)}"]
        for j, v in enumerate(fila):
            al = WD_ALIGN_PARAGRAPH.RIGHT if j >= 6 else (
                WD_ALIGN_PARAGRAPH.CENTER if j in (0, 1, 2, 4) else None)
            celda(tc.cell(2 + k, j), v, 4.8, align=al)
    for j in range(len(cab_c)):
        shade(tc.cell(4, j), CELESTE)
        shade(tc.cell(5, j), CELESTE)
        shade(tc.cell(6, j), CELESTE)
    promc = "{d.comparablesInforme.cbr.promedio"
    celda(tc.cell(4, 3), "PROMEDIO DE LA MUESTRA", 4.8, True)
    for j, campo in ((6, ".totalUf:formatN(0)}"), (7, ".supTerreno:formatN(1)}"),
                     (8, ".supConstruida:formatN(1)}"), (9, ".oocc:formatN(0)}"),
                     (10, ".ufM2Terreno:formatN(2)}"), (11, ".ufM2Construccion:formatN(2)}")):
        celda(tc.cell(4, j), promc + campo, 4.8, True, align=WD_ALIGN_PARAGRAPH.RIGHT)
    tfx = "{d.comparablesInforme.tasacionFila"
    celda(tc.cell(5, 3), "TASACION", 4.8, True)
    for j, campo in ((6, ".totalUf:formatN(0)}"), (7, ".supTerreno:formatN(0)}"),
                     (8, ".supConstruida:formatN(0)}"), (9, ".oocc:formatN(0)}"),
                     (10, ".ufM2Terreno:formatN(2)}"), (11, ".ufM2Construccion:formatN(2)}")):
        celda(tc.cell(5, j), tfx + campo, 4.8, True, align=WD_ALIGN_PARAGRAPH.RIGHT)
    fvs = tc.rows[6]
    fvs.cells[0].merge(fvs.cells[10])
    celda(fvs.cells[0], "TASACION V/S PROMEDIO DE LA MUESTRA", 4.8, True)
    celda_partes(tc.cell(6, 11),
                 [("{d.comparablesInforme.cbr.tasacionVsPct:formatN(0)}", 4.8, True, None),
                  ("%", 4.8, True, None)], align=WD_ALIGN_PARAGRAPH.RIGHT)

    # rentabilidad a la derecha
    rent_datos = [
        ("Vida Util Remanente Años", "{d.propiedad.vidaUtil}"),
        ("Arriendo Bruto $ / mes", "{d.rentabilidad.arriendoBrutoMensualClp:formatN(0)}"),
        ("UF/ mes", "{d.rentabilidad.arriendoUfMes:formatN(1)}"),
        ("Gasto Anual $", "{d.rentabilidad.gastoAnualClp:formatN(0)}"),
        ("Tasa Exigida Proyecto", None),
        ("Tiempo Renta (años)", "{d.rentabilidad.tiempoRentaAnios}"),
        ("Ingreso Líquido Anual", "{d.rentabilidad.ingresoLiquidoAnualClp:formatN(0)}"),
        ("Renta Perpetua", "{d.rentabilidad.rentaPerpetuaClp:formatN(0)}"),
    ]
    rent = der.add_table(rows=len(rent_datos) + 1, cols=2)
    rent.autofit = False
    bordes(rent, sz=2, color="808080")
    margenes_celda(rent)
    rent.columns[0].width = Cm(3.4)
    rent.columns[1].width = Cm(2.7)
    for fila in rent.rows:
        alto_fila(fila, 0.28)
    fila0 = rent.rows[0]
    fila0.cells[0].merge(fila0.cells[1])
    shade(fila0.cells[0], GRIS)
    celda(fila0.cells[0], "ANALISIS DE RENTABILIDAD", 5.5, True,
          align=WD_ALIGN_PARAGRAPH.CENTER)
    for i, (k, v) in enumerate(rent_datos, start=1):
        celda(rent.cell(i, 0), k, 4.8, False)
        if v is None:
            celda_partes(rent.cell(i, 1),
                         [("{d.rentabilidad.tasaCapRate:mul(100):formatN(1)}", 4.8, False, None),
                          ("%", 4.8, False, None)], align=WD_ALIGN_PARAGRAPH.RIGHT)
        else:
            celda(rent.cell(i, 1), v, 4.8, align=WD_ALIGN_PARAGRAPH.RIGHT)

    # ---- Boilerplate análisis
    barra(doc, "ANÁLISIS DE LAS REFERENCIAS", size=6, fill=GRIS, color=NEGRO)
    parrafo(doc, BOILERPLATE_REFERENCIAS, size=4.8)

    # ---- Cuadro de valoración (6 ítems [i=0..5] ordenados por la data + VCN)
    cab_q = ["Item", "Nº", "Detalle Item valorado", "Rol SII", "Año", "Tipo",
             "Situación Municipal", "Estado", "Grntía.", "Origen Super.", "Superficie m²",
             "UF/m² Nuevo", "D. F.", "UF/m²", "Valor Comercial UF", "Valor Seguros UF",
             "Valor Liquidación UF"]
    anchos_q = (1.2, 0.4, 2.3, 1.1, 0.6, 0.6, 1.4, 0.7, 0.7, 1.1, 1.1, 1.0, 0.5, 0.9,
                1.5, 1.4, 1.5)
    q = bloque_con_sidebar(doc, "Valores", 9, len(cab_q), anchos_q)
    fila_tq = q.rows[0]
    fila_tq.cells[0].merge(fila_tq.cells[len(cab_q) - 1])
    shade(fila_tq.cells[0], GRIS)
    celda(fila_tq.cells[0], "CUADRO DE VALORACION", 6, True,
          align=WD_ALIGN_PARAGRAPH.CENTER)
    for j, h in enumerate(cab_q):
        shade(q.cell(1, j), GRIS)
        celda(q.cell(1, j), h, 4.5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    for k in range(6):
        pref = f"{{d.cuadro.items[i={k}]"
        fila = [pref + ".tipoItem}", str(k + 1), pref + ".descripcion}", "{d.sii.rolSii}",
                "", "", pref + ".situacionMunicipal}", "",
                pref + ".aportaAGarantia:ifEQ(true):show(SI):elseShow( )}", "",
                pref + ".supM2:formatN(2)}", pref + ".ufM2Aplicado:formatN(2)}",
                pref + ".factorAplicado:formatN(2)}", "", pref + ".ufTotalItem:formatN(2)}",
                "", ""]
        for j, v in enumerate(fila):
            celda(q.cell(2 + k, j), v, 4.5,
                  align=WD_ALIGN_PARAGRAPH.RIGHT if j >= 10 else None)
    fila_vc = 8
    for j in range(len(cab_q)):
        shade(q.cell(fila_vc, j), CELESTE)
    celda(q.cell(fila_vc, 2), "VALOR COMERCIAL NORMAL :", 5, True)
    celda(q.cell(fila_vc, 14), "{d.cuadro.totalUf:formatN(2)}", 5, True,
          align=WD_ALIGN_PARAGRAPH.RIGHT)
    celda(q.cell(fila_vc, 15), "{d.terminales.seguroIncendioUf:formatN(2)}", 5, True,
          align=WD_ALIGN_PARAGRAPH.RIGHT)
    celda(q.cell(fila_vc, 16), "{d.terminales.valorLiquidacionUf:formatN(2)}", 5, True,
          align=WD_ALIGN_PARAGRAPH.RIGHT)

    # ---- FOTO FACHADA + firma (izq) · VALOR TASACIÓN + valores US$/UF/$ (der)
    dos2 = doc.add_table(rows=1, cols=2)
    dos2.autofit = False
    sin_bordes(dos2)
    margenes_celda(dos2, lr=0)
    dos2.columns[0].width = Cm(9.2)
    dos2.columns[1].width = Cm(10.6)
    izq2, der2 = dos2.cell(0, 0), dos2.cell(0, 1)

    tfoto = izq2.add_table(rows=2, cols=1)
    bordes(tfoto, sz=2, color="808080")
    margenes_celda(tfoto)
    shade(tfoto.cell(0, 0), GRIS)
    celda(tfoto.cell(0, 0), "FOTO FACHADA", 6, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    imagen(tfoto.cell(1, 0), "{d.imagenes.fachada}", 8.3, 4.2)

    firma_datos = [
        ("Tasador :", "{d.partes.tasador.nombre}"),
        ("Visador :", "{d.partes.visador.nombre}"),
        ("Fecha visita :", "{d.partes.fechaVisita:formatD(DD-MM-YYYY)}"),
        ("Fecha Visado :", "{d.partes.fechaVisado:formatD(DD-MM-YYYY)}"),
    ]
    tfirma = izq2.add_table(rows=len(firma_datos) + 1, cols=2)
    sin_bordes(tfirma)
    margenes_celda(tfirma)
    tfirma.columns[0].width = Cm(2.6)
    tfirma.columns[1].width = Cm(6.6)
    for i, (k, v) in enumerate(firma_datos):
        celda(tfirma.cell(i, 0), k, 5.5, False)
        celda(tfirma.cell(i, 1), v, 5.5, True)
    celda(tfirma.cell(len(firma_datos), 0), "Firma :", 5.5, False)
    imagen(tfirma.cell(len(firma_datos), 1), "{d.imagenes.firma}", 2.7, 1.3)

    tv = der2.add_table(rows=4, cols=1)
    bordes(tv, sz=2, color="808080")
    margenes_celda(tv)
    shade(tv.cell(0, 0), CELESTE)
    celda(tv.cell(0, 0), "VALOR TASACIÓN", 9, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    shade(tv.cell(1, 0), CELESTE)
    celda_partes(tv.cell(1, 0), [
        ("UF  ", 8, True, None), ("{d.terminales.valorComercialUf:formatN(2)}", 8, True, None),
        ("      $  ", 8, True, None),
        ("{d.terminales.valorComercialClp:formatN(0)}", 8, True, None),
        ("      al ", 8, True, None),
        ("{d.partes.fechaVisita:formatD(DD-MM-YYYY)}", 8, True, None),
    ], align=WD_ALIGN_PARAGRAPH.CENTER)
    celda_partes(tv.cell(2, 0), [
        ("Velocidad de venta normal : ", 6.5, True, None),
        ("{d.propiedad.velocidadVentaEstimada:upperCase}", 6.5, True, None),
    ], align=WD_ALIGN_PARAGRAPH.CENTER)
    celda_partes(tv.cell(3, 0), [
        ("1UF =  $ ", 6.5, True, None), ("{d.terminales.ufDia:formatN(2)}", 6.5, True, None),
        ("        1US$ =  $ ", 6.5, True, None),
        ("{d.terminales.usdDia:formatN(2)}", 6.5, True, None),
    ], align=WD_ALIGN_PARAGRAPH.CENTER)

    val_filas = [
        ("Valor de Reposición :", "{d.terminales.valorReposicionUsd:formatN(0)}",
         "{d.terminales.valorReposicionUf:formatN(2)}",
         "{d.terminales.valorReposicionClp:formatN(0)}", None),
        ("Seguro Incendio y otros :", "{d.terminales.seguroIncendioUsd:formatN(0)}",
         "{d.terminales.seguroIncendioUf:formatN(2)}",
         "{d.terminales.seguroIncendioClp:formatN(0)}", None),
        ("Avalúo fiscal propiedad :", "{d.terminales.avaluoFiscalUsd:formatN(0)}",
         "{d.terminales.avaluoFiscalUf:formatN(2)}", "{d.sii.avaluoTotal:formatN(0)}", None),
        ("Valor a Remate  65% :", "{d.terminales.valorRemateUsd:formatN(0)}",
         "{d.terminales.valorRemateUf:formatN(2)}",
         "{d.terminales.valorRemateClp:formatN(0)}", CELESTE),
        ("Liquid. Normal  82,5% :", "{d.terminales.valorLiquidacionUsd:formatN(0)}",
         "{d.terminales.valorLiquidacionUf:formatN(2)}",
         "{d.terminales.valorLiquidacionClp:formatN(0)}", None),
    ]
    t5 = der2.add_table(rows=len(val_filas) + 1, cols=4)
    bordes(t5, sz=2, color="808080")
    margenes_celda(t5)
    t5.columns[0].width = Cm(3.6)
    t5.columns[1].width = Cm(2.0)
    t5.columns[2].width = Cm(2.2)
    t5.columns[3].width = Cm(2.6)
    for j, h in enumerate(("", "US$", "UF", "$")):
        shade(t5.cell(0, j), GRIS)
        celda(t5.cell(0, j), h, 5.5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    for i, (k, usd, uf, clp, fill) in enumerate(val_filas, start=1):
        for j, v in enumerate((k, usd, uf, clp)):
            if fill:
                shade(t5.cell(i, j), fill)
            celda(t5.cell(i, j), v, 5.5, j == 0,
                  align=WD_ALIGN_PARAGRAPH.RIGHT if j else None)

    parrafo(doc, DECLARACION, size=4.8)


def hoja2(doc):
    encabezado_hoja(doc, 2)
    barra(doc, "Mapa de ubicación de referencias", size=7, fill=CELESTE, color=NEGRO)
    imagen(doc, "{d.imagenes.refMapa}", 18.9, 7.4)
    tf = doc.add_table(rows=2, cols=3)
    tf.autofit = False
    bordes(tf, sz=2, color="808080")
    margenes_celda(tf)
    ref_imgs = ("{d.imagenes.ref1}", "{d.imagenes.ref2}", "{d.imagenes.ref3}")
    for j in range(3):
        tf.columns[j].width = Cm(6.4)
        shade(tf.cell(0, j), GRIS)
        celda(tf.cell(0, j), "Fachada", 6, True, align=WD_ALIGN_PARAGRAPH.CENTER)
        imagen(tf.cell(1, j), ref_imgs[j], 5.3, 4.4)
    parrafo(doc, "", size=4)
    fichas = doc.add_table(rows=9, cols=6)
    fichas.autofit = False
    bordes(fichas, sz=2, color="808080")
    margenes_celda(fichas)
    anchos_f = (1.7, 4.7, 1.7, 4.7, 1.7, 4.7)
    for fila in fichas.rows:
        alto_fila(fila, 0.32)
        for i, c in enumerate(fila.cells):
            c.width = Cm(anchos_f[i])
    for k in range(3):
        c0 = 2 * k
        fichas.cell(0, c0).merge(fichas.cell(0, c0 + 1))
        shade(fichas.cell(0, c0), GRIS)
        celda(fichas.cell(0, c0), f"Referencia Nº {k + 1}", 6, True,
              align=WD_ALIGN_PARAGRAPH.CENTER)
        idx = f"[i={k}]"
        pares = [
            ("Tipo:", f"{{d.comparablesInforme.ofertas.filas{idx}.tipoReferencia}}"),
            ("Dirección:", f"{{d.comparablesInforme.ofertas.filas{idx}.direccion}}"),
            ("Comuna:", f"{{d.comparablesInforme.ofertas.filas{idx}.comuna}}"),
            ("Valor UF:", f"{{d.comparablesInforme.ofertas.filas{idx}.precioUf:formatN(0)}}"),
            ("Año:", f"{{d.comparablesInforme.ofertas.filas{idx}.anio}}"),
            ("Sup const:", f"{{d.comparablesInforme.ofertas.filas{idx}.supConstruida:formatN(0)}} m²"),
            ("Terreno:", f"{{d.comparablesInforme.ofertas.filas{idx}.supTerreno:formatN(0)}} m²"),
            ("Teléfono:", f"{{d.comparablesInforme.ofertas.filas{idx}.telefono}}"),
        ]
        for i, (kk, vv) in enumerate(pares, start=1):
            celda(fichas.cell(i, c0), kk, 5.5, False)
            celda(fichas.cell(i, c0 + 1), vv, 5.5, align=WD_ALIGN_PARAGRAPH.CENTER)
    parrafo(doc, "", size=4)
    parrafo(doc, BOILERPLATE_REFERENCIAS, size=5.5)


def hoja3(doc):
    encabezado_hoja(doc, 3)

    def bloque(rotulo, pares, cols=4, tags=None, bold_valor=True):
        tags = tags or {}
        filas = (len(pares) + cols // 2 - 1) // (cols // 2)
        t = bloque_con_sidebar(doc, rotulo, filas, cols, None)
        idx = 0
        for f in range(filas):
            for cpar in range(cols // 2):
                if idx >= len(pares):
                    break
                k = pares[idx]
                cl = t.cell(f, cpar * 2)
                shade(cl, GRIS)
                celda(cl, k, 4.8, False)
                celda(t.cell(f, cpar * 2 + 1), tags.get(k, ""), 4.8, bold_valor)
                idx += 1
        return t

    N = "{d.cualitativa.normativa."
    bloque("Exigencias", [
        "Superf. Predial Mínimo", "Frente Predial Mínimo", "% Ocupación Suelo",
        "Sistema Agrupamiento", "Coef Máx Constructibidad", "Altura Edificación",
        "Distancia medianero", "Antejardin",
    ], tags={
        "Superf. Predial Mínimo": N + "supPredialMinimo}",
        "Frente Predial Mínimo": N + "frentePredialMinimo}",
        "% Ocupación Suelo": N + "ocupacionSuelo}",
        "Sistema Agrupamiento": N + "sistemaAgrupamiento}",
        "Coef Máx Constructibidad": N + "coefConstructibilidad}",
        "Altura Edificación": N + "alturaEdificacion}",
        "Distancia medianero": N + "distanciaMedianero}",
        "Antejardin": N + "antejardin}",
    })

    # PROPIEDAD ACOGIDA A + CUMPLE PLAN REGULADOR (dos cajas lado a lado)
    dosc = doc.add_table(rows=1, cols=2)
    dosc.autofit = False
    sin_bordes(dosc)
    margenes_celda(dosc, lr=0)
    dosc.columns[0].width = Cm(9.9)
    dosc.columns[1].width = Cm(9.9)
    for lado, titulo, filas in (
        (0, "PROPIEDAD ACOGIDA A:", [
            ("D.F.L. 2", N + "dfl2}"), ("LEY 6071 (Venta por Pisos)", N + "ley6071}"),
            ("LEY 9135 (Ley Pereira)", N + "ley9135}"),
            ("LEY 19537 (Coprop. Inmob.)", N + "ley19537}")]),
        (1, "CUMPLE PLAN REGULADOR VIGENTE", [
            ("Según el uso actual del bien", N + "cumpleUsoActual}"),
            ("Según tipo construcción", N + "cumpleTipoConstruccion}"),
            ("Uso más probable del bien", N + "usoMasProbable}"),
            ("Cambios en Plan Regulador", N + "cambiosPlanRegulador}")]),
    ):
        tb = dosc.cell(0, lado).add_table(rows=5, cols=2)
        tb.autofit = False
        bordes(tb, sz=2, color="808080")
        margenes_celda(tb)
        tb.columns[0].width = Cm(6.2)
        tb.columns[1].width = Cm(3.4)
        for fila in tb.rows:
            alto_fila(fila, 0.28)
        h0 = tb.rows[0]
        h0.cells[0].merge(h0.cells[1])
        shade(h0.cells[0], GRIS)
        celda(h0.cells[0], titulo, 5.5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
        for i, (k, v) in enumerate(filas, start=1):
            celda(tb.cell(i, 0), k, 4.8, False)
            rojo = ROJO if k == "Uso más probable del bien" else None
            celda(tb.cell(i, 1), v, 4.8, True, rojo, align=WD_ALIGN_PARAGRAPH.CENTER)

    S = "{d.cualitativa.sector."
    bloque("Sector", [
        "Demanda", "Tendencia", "Densidad", "Mercado", "ABC1", "Destino barrio",
        "Tipo zona", "Calzada", "Acera", "Solera", "Antejardin", "Red Eléctrica",
        "Agua Potable", "Gas", "Proy. Uso Terrenos",
    ], cols=6, tags={
        "Demanda": S + "demanda}", "Tendencia": S + "tendencia}",
        "Densidad": S + "densidad}", "Mercado": S + "mercado}", "ABC1": S + "abc1}",
        "Destino barrio": S + "destinoBarrio}", "Tipo zona": S + "tipoZona}",
        "Calzada": S + "calzada}", "Acera": S + "acera}", "Solera": S + "solera}",
        "Antejardin": S + "antejardin}", "Red Eléctrica": S + "redElectrica}",
        "Agua Potable": S + "aguaPotable}", "Gas": S + "gas}",
        "Proy. Uso Terrenos": S + "proyUsoTerrenos}",
    })

    # matriz % uso de terrenos (2 filas × 4 pares, con " %")
    uso = bloque_con_sidebar(doc, "Uso terrenos", 2, 8, (2.0, 1.3, 2.0, 1.3, 2.0, 1.3, 2.1, 1.3) +
                             tuple())
    usos = [("Casas", "pctCasas"), ("Deptos.", "pctDeptos"), ("Condominios", "pctCondominios"),
            ("Equip. Comer", "pctEquipComercial"), ("Industrial", "pctIndustrial"),
            ("Comercial", "pctComercial"), ("Sitios Eriazos", "pctSitiosEriazos"),
            ("Otros", "pctOtros")]
    for n, (k, campo) in enumerate(usos):
        f, c0 = divmod(n, 4)
        cl = uso.cell(f, c0 * 2)
        shade(cl, GRIS)
        celda(cl, k, 4.8, False)
        celda_partes(uso.cell(f, c0 * 2 + 1),
                     [(S + campo + "}", 4.8, True, None), (" %", 4.8, True, None)])

    # Arteria Principal — banda azul con el valor al lado
    art = doc.add_table(rows=1, cols=2)
    art.autofit = False
    margenes_celda(art)
    art.columns[0].width = Cm(5.0)
    art.columns[1].width = Cm(14.8)
    shade(art.cell(0, 0), AZUL)
    celda(art.cell(0, 0), "Arteria Principal", 6, True, BLANCO)
    celda(art.cell(0, 1), S + "arteriaPrincipal}", 6, True)

    G = "{d.cualitativa.geometriaTerreno."
    bloque("Terreno", [
        "Superficie", "Forma", "Pendiente", "Orientación", "Frente", "Contrafrente",
        "NORTE", "SUR",
    ], tags={
        "Superficie": "{d.propiedad.supTerrenoM2:formatN(2)} m²",
        "Forma": G + "forma}", "Pendiente": G + "pendiente}",
        "Orientación": G + "orientacion}", "Frente": G + "frente}",
        "Contrafrente": G + "contrafrente}", "NORTE": G + "deslindeNorte}",
        "SUR": G + "deslindeSur}",
    })

    E = "{d.cualitativa.emplazamiento."
    bloque("Emplazamiento", [
        "Tipo agrupamiento", "Diseño Arquitectónico", "Utilidad Funcional", "Tipo Adosamiento",
        "Calidad constructiva", "Estado de conservación", "Predio y/o vista",
        "Orientación construcción", "Relación Terr/Constr", "Iluminación natural",
    ], tags={
        "Tipo agrupamiento": E + "tipoAgrupamiento}",
        "Diseño Arquitectónico": E + "disenoArquitectonico}",
        "Utilidad Funcional": E + "utilidadFuncional}",
        "Tipo Adosamiento": E + "tipoAdosamiento}",
        "Calidad constructiva": E + "calidadConstructiva}",
        "Estado de conservación": E + "estadoConservacion}",
        "Predio y/o vista": E + "predioVista}",
        "Orientación construcción": E + "orientacionConstruccion}",
        "Relación Terr/Constr": E + "relacionTerrenoConstruccion}",
        "Iluminación natural": E + "iluminacionNatural}",
    })

    # Características constructivas: Elementos (izq) + Otros (der)
    C = "{d.cualitativa.constructivas."
    dosk = doc.add_table(rows=1, cols=2)
    dosk.autofit = False
    sin_bordes(dosk)
    margenes_celda(dosk, lr=0)
    dosk.columns[0].width = Cm(11.2)
    dosk.columns[1].width = Cm(8.6)
    elems = [("Estructura Soportante", "estructura"), ("Divisiones Interiores", "divisiones"),
             ("Entrepisos", "entrepisos"), ("Cubierta", "cubierta"),
             ("Revestimiento exterior", "revestimientoExterior"),
             ("Cierros exteriores", "cierros"), ("O. Complementarias", "obrasComplementarias"),
             ("Construcción anexo", "construccionAnexo")]
    te = dosk.cell(0, 0).add_table(rows=len(elems) + 1, cols=4)
    te.autofit = False
    bordes(te, sz=2, color="808080")
    margenes_celda(te)
    for w, col in zip((3.0, 4.6, 1.8, 1.8), te.columns):
        col.width = Cm(w)
    for fila in te.rows:
        alto_fila(fila, 0.28)
    for j, h in enumerate(("Elementos", "Materialidad/Tipo", "Calidad", "Estado")):
        shade(te.cell(0, j), GRIS)
        celda(te.cell(0, j), h, 5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    for i, (k, campo) in enumerate(elems, start=1):
        celda(te.cell(i, 0), k, 4.8, False)
        # Estructura usa propiedad.materialPredominante (ya poblado en Airtable);
        # el resto va por el contrato cualitativa.constructivas.*
        mat = ("{d.propiedad.materialPredominante}" if campo == "estructura"
               else C + campo + "}")
        celda(te.cell(i, 1), mat, 4.8, True)
        celda(te.cell(i, 2), C + campo + "Calidad}", 4.8)
        celda(te.cell(i, 3), C + campo + "Estado}", 4.8)
    otros = [("Aire Acondicionado", "aireAcondicionado"), ("Calefacción", "calefaccion"),
             ("Closet Mural", "closet"), ("Muebles de cocina", "mueblesCocina"),
             ("Sanitarios", "sanitarios"), ("Grifería", "griferia"),
             ("Puerta Principal", "puertaPrincipal"), ("Ventanas", "ventanas")]
    to = dosk.cell(0, 1).add_table(rows=len(otros) + 1, cols=2)
    to.autofit = False
    bordes(to, sz=2, color="808080")
    margenes_celda(to)
    to.columns[0].width = Cm(3.4)
    to.columns[1].width = Cm(5.0)
    for fila in to.rows:
        alto_fila(fila, 0.28)
    h0 = to.rows[0]
    h0.cells[0].merge(h0.cells[1])
    shade(h0.cells[0], GRIS)
    celda(h0.cells[0], "Otros", 5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    for i, (k, campo) in enumerate(otros, start=1):
        celda(to.cell(i, 0), k, 4.8, False)
        celda(to.cell(i, 1), C + campo + "}", 4.8, True)

    # Terminaciones (loop) + servicios
    term = bloque_con_sidebar(doc, "Terminaciones", 4, 7,
                              (2.8, 3.0, 3.6, 3.0, 3.0, 2.0, 1.9))
    heads_t = ("Terminaciones", "Tipo de Pavimento", "Material/Marca/Origen",
               "Revestimiento de Muros", "Terminación de Cielo", "Iluminación", "Estado")
    for j, h in enumerate(heads_t):
        shade(term.cell(0, j), GRIS)
        celda(term.cell(0, j), h, 5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    celda(term.cell(1, 0), "{d.recintos.terminacionesPorRecinto[i].nombre}", 4.8)
    celda(term.cell(1, 1), "{d.recintos.terminacionesPorRecinto[i].categoria}", 4.8)
    celda(term.cell(1, 2), "{d.recintos.terminacionesPorRecinto[i].descripcion}", 4.8)
    celda(term.cell(1, 3), "{d.recintos.terminacionesPorRecinto[i].revMuros}", 4.8)
    celda(term.cell(1, 4), "{d.recintos.terminacionesPorRecinto[i].cielo}", 4.8)
    celda(term.cell(1, 5), "{d.recintos.terminacionesPorRecinto[i].iluminacion}", 4.8)
    celda(term.cell(1, 6), "{d.recintos.terminacionesPorRecinto[i].calidad}", 4.8)
    celda(term.cell(2, 0), "{d.recintos.terminacionesPorRecinto[i+1].nombre}", 4.8)
    V = "{d.cualitativa.servicios."
    servicios = (("Alcantarillado", "alcantarillado}"), ("Agua Potable", "aguaPotable}"),
                 ("Electricidad", "electricidad}"), ("Gas", "gas}"), ("Otros", "otros}"))
    f3 = term.rows[3]
    f3.cells[5].merge(f3.cells[6])
    for j, (k, campo) in enumerate(servicios):
        cl = term.cell(3, j) if j < 5 else None
        if j < 5:
            celda_partes(cl, [(k + ": ", 4.8, True, None), (V + campo, 4.8, False, None)])

    # Habitaciones — matriz 16 columnas (Nivel + 14 recintos + Superficie)
    rec_cols = [("Comedor", "Comedor"), ("Living", "Living"), ("Estar", "Sala"),
                ("Hall", "Hall"), ("Suite", "Suite"), ("D.Simple", "D.Simple"),
                ("D.Serv.", "D.Servicio"), ("Cocina", "Cocina"), ("Escritorio", "Escritorio"),
                ("Baños", "Bano"), ("½ Baño", "MedioBano"), ("Bñ.Serv.", "BanoServicio"),
                ("Loggia", "Lavadero"), ("Otros", "Otro")]
    anchos_h = (1.6,) + (1.1,) * 14 + (1.6,)
    hab = bloque_con_sidebar(doc, "Habitaciones", 6, 16, anchos_h)
    shade(hab.cell(0, 0), GRIS)
    celda(hab.cell(0, 0), "Nivel", 4.8, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    for j, (lbl, _) in enumerate(rec_cols, start=1):
        shade(hab.cell(0, j), GRIS)
        celda(hab.cell(0, j), lbl, 4.5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    shade(hab.cell(0, 15), GRIS)
    celda(hab.cell(0, 15), "Superficie", 4.5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    niveles = (("Subterraneo", "Subterraneo"), ("Piso 1", "Piso1"), ("Piso 2", "Piso2"),
               ("Piso 3", "Piso3"))
    for f, (lbl, niv) in enumerate(niveles, start=1):
        shade(hab.cell(f, 0), GRIS)
        celda(hab.cell(f, 0), lbl, 4.8, False)
        for j, (_, tipo) in enumerate(rec_cols, start=1):
            tag = (f"{{d.recintos.habitacionesPorNivel[nivel='{niv}',"
                   f"tipoRecinto='{tipo}'].cantidad}}")
            celda(hab.cell(f, j), tag, 4.8, align=WD_ALIGN_PARAGRAPH.CENTER)
        if niv == "Piso1":
            celda(hab.cell(f, 15), "{d.propiedad.supConstruccionM2:formatN(2)}", 4.8,
                  align=WD_ALIGN_PARAGRAPH.CENTER)
    ftot = hab.rows[5]
    for j in range(16):
        shade(hab.cell(5, j), CELESTE)
    ftot.cells[1].merge(ftot.cells[4])
    celda(hab.cell(5, 0), "TOTALES", 4.8, True)
    celda_partes(ftot.cells[1], [("Recintos: ", 4.8, True, None),
                                 ("{d.recintos.totalRecintos}", 4.8, True, None)])
    celda_partes(hab.cell(5, 6), [("{d.propiedad.dormitorios}", 4.8, True, None)],
                 align=WD_ALIGN_PARAGRAPH.CENTER)
    celda_partes(hab.cell(5, 10), [("{d.propiedad.banos}", 4.8, True, None)],
                 align=WD_ALIGN_PARAGRAPH.CENTER)
    celda_partes(hab.cell(5, 15),
                 [("{d.propiedad.supConstruccionM2:formatN(2)}", 4.8, True, None),
                  (" m²", 4.8, True, None)], align=WD_ALIGN_PARAGRAPH.CENTER)

    K = "{d.cualitativa.comodidades."
    como = [("Muebles de Cocina", "mueblesCocina"), ("Comedor de Diario", "comedorDiario"),
            ("Patio de servicio", "patioServicio"), ("Estacionamiento", "estacionamiento"),
            ("Piscina", "piscina"), ("Gimnasio", "gimnasio"), ("Sauna", "sauna"),
            ("Bodega", "bodega"), ("Jardin conformado", "jardin"),
            ("Calefacción", "calefaccion"), ("Alarma", "alarma"),
            ("Protecciones/Rejas", "protecciones"), ("Aspiración central", "aspiracion"),
            ("Climatización", "climatizacion"), ("Purificador de aire", "purificador"),
            ("Corrientes. Débiles", "corrientesDebiles")]
    bloque("COMODIDADES", [k for k, _ in como], cols=8,
           tags={k: K + campo + "}" for k, campo in como})

    amp = bloque_con_sidebar(doc, "Ampliaciones", 3, 3, (8.2, 5.6, 5.5))
    for j, h in enumerate(("Descripción", "Metros Cuadrados", "Año regularización")):
        shade(amp.cell(0, j), GRIS)
        celda(amp.cell(0, j), h, 5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    celda(amp.cell(1, 0), "{d.recintos.ampliaciones[i].descripcion}", 4.8)
    celda(amp.cell(1, 1), "{d.recintos.ampliaciones[i].supM2:formatN(2)}", 4.8,
          align=WD_ALIGN_PARAGRAPH.RIGHT)
    celda(amp.cell(1, 2), "{d.recintos.ampliaciones[i].annoRegularizacion}", 4.8,
          align=WD_ALIGN_PARAGRAPH.RIGHT)
    celda(amp.cell(2, 0), "{d.recintos.ampliaciones[i+1].descripcion}", 4.8)


def hoja_fotos(doc, n, desde):
    """Grilla 2×4 de fotos con caption gris — acceso directo fotos.fotos[i=K]."""
    encabezado_hoja(doc, n)
    barra(doc, "Fotos de la Propiedad", size=7, fill=GRIS, color=NEGRO)
    g = doc.add_table(rows=8, cols=2)
    g.autofit = False
    bordes(g, sz=2, color="808080")
    margenes_celda(g)
    g.columns[0].width = Cm(9.7)
    g.columns[1].width = Cm(9.7)
    for fila in range(4):
        k_izq = desde + fila * 2
        k_der = desde + fila * 2 + 1
        r_img = fila * 2
        r_cap = fila * 2 + 1
        alto_fila(g.rows[r_cap], 0.3)
        # fotos recortadas a aspecto 1,545 (el de la referencia); la celda
        # "Planificación" (plano, casi cuadrado) va angosta como en la referencia
        if desde == 0 and fila == 0:
            imagen(g.cell(r_img, 0), f"{{d.fotos.fotos[i={k_izq}].url}}", 9.1, 5.9)
            imagen(g.cell(r_img, 1), f"{{d.fotos.fotos[i={k_der}].url}}", 5.7, 5.9)
        else:
            imagen(g.cell(r_img, 0), f"{{d.fotos.fotos[i={k_izq}].url}}", 9.1, 5.9)
            imagen(g.cell(r_img, 1), f"{{d.fotos.fotos[i={k_der}].url}}", 9.1, 5.9)
        shade(g.cell(r_cap, 0), GRIS)
        shade(g.cell(r_cap, 1), GRIS)
        celda(g.cell(r_cap, 0), f"{{d.fotos.fotos[i={k_izq}].categoria}}", 6, True,
              align=WD_ALIGN_PARAGRAPH.CENTER)
        celda(g.cell(r_cap, 1), f"{{d.fotos.fotos[i={k_der}].categoria}}", 6, True,
              align=WD_ALIGN_PARAGRAPH.CENTER)


def hoja_anexo1(doc):
    encabezado_hoja(doc, 6)
    barra(doc, "ANEXO N°1", size=8)
    com = doc.add_table(rows=1, cols=2)
    com.autofit = False
    bordes(com, sz=2, color="808080")
    margenes_celda(com)
    com.columns[0].width = Cm(4.6)
    com.columns[1].width = Cm(14.8)
    celda(com.cell(0, 0), "Anexo N° 1: Comentarios", 6, True)
    celda(com.cell(0, 1), "", 6)

    fila1 = doc.add_table(rows=2, cols=2)
    fila1.autofit = False
    sin_bordes(fila1)
    margenes_celda(fila1, lr=0)
    fila1.columns[0].width = Cm(11.6)
    fila1.columns[1].width = Cm(7.8)
    shade(fila1.cell(0, 0), GRIS)
    celda(fila1.cell(0, 0), "PLANO", 6.5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
    shade(fila1.cell(0, 1), GRIS)
    celda(fila1.cell(0, 1), "PLANTA DE EMPLAZAMIENTO", 6.5, True,
          align=WD_ALIGN_PARAGRAPH.CENTER)
    imagen(fila1.cell(1, 0), "{d.imagenes.anexo1Plano}", 11.0, 10.4)
    imagen(fila1.cell(1, 1), "{d.imagenes.anexo1Emplazamiento}", 7.2, 11.6)

    fila2 = doc.add_table(rows=2, cols=3)
    fila2.autofit = False
    sin_bordes(fila2)
    margenes_celda(fila2, lr=0)
    fila2.columns[0].width = Cm(6.3)
    fila2.columns[1].width = Cm(5.5)
    fila2.columns[2].width = Cm(7.6)
    shade(fila2.cell(0, 0), GRIS)
    celda(fila2.cell(0, 0), "ESQUEMA DE SUPERFICIES", 6.5, True,
          align=WD_ALIGN_PARAGRAPH.CENTER)
    shade(fila2.cell(0, 1), GRIS)
    celda(fila2.cell(0, 1), "CUADRO DE SUPERFICIE", 6.5, True,
          align=WD_ALIGN_PARAGRAPH.CENTER)
    celda(fila2.cell(0, 2), "", 6.5)
    imagen(fila2.cell(1, 0), "{d.imagenes.anexo1Esquema}", 5.9, 5.8)
    imagen(fila2.cell(1, 1), "{d.imagenes.anexo1CuadroSup}", 5.1, 6.4)
    imagen(fila2.cell(1, 2), "{d.imagenes.anexo1Aerea}", 7.4, 6.2)

    barra(doc, "INFORMACION DE SII", size=7, fill=GRIS, color=NEGRO)
    fila3 = doc.add_table(rows=1, cols=2)
    fila3.autofit = False
    sin_bordes(fila3)
    margenes_celda(fila3, lr=0)
    fila3.columns[0].width = Cm(11.6)
    fila3.columns[1].width = Cm(7.8)
    imagen(fila3.cell(0, 0), "{d.imagenes.anexo1MapaSii}", 11.3, 5.2)
    imagen(fila3.cell(0, 1), "{d.imagenes.anexo1InfoSii}", 7.2, 5.0)


def hoja_anexo2(doc):
    """Dos columnas INDEPENDIENTES (como la referencia): cada columna apila sus
    bandas+escaneados sin alinear filas con la otra — evita el desborde por
    fila-máxima. Tamaños = ranuras medidas en el PDF de referencia."""
    encabezado_hoja(doc, 7)
    barra(doc, "ANEXO N°2", size=8)
    g = doc.add_table(rows=1, cols=2)
    g.autofit = False
    sin_bordes(g)
    margenes_celda(g, lr=0)
    g.columns[0].width = Cm(9.7)
    g.columns[1].width = Cm(9.7)
    columnas = (
        (0, [("ROL - AVALUO", "{d.imagenes.anexo2RolAvaluo}", 9.1, 5.2),
             ("PERMISO DE EDIFICACIÓN", "{d.imagenes.anexo2Permiso}", 9.1, 12.8),
             ("CERTIFICADO DEUDA TGR", "{d.imagenes.anexo2Tgr}", 9.3, 4.3)]),
        (1, [("ESCRITURA", "{d.imagenes.anexo2Escritura}", 9.2, 9.1),
             ("NO EXPROPIACIÓN SERVIU", "{d.imagenes.anexo2NoExpropiacion}", 9.2, 6.8),
             ("RECEPCION FINAL", "{d.imagenes.anexo2Recepcion}", 9.2, 6.0)]),
    )
    for c, piezas in columnas:
        cell = g.cell(0, c)
        primero = True
        for titulo, tag, w, h in piezas:
            tb = cell.add_table(rows=1, cols=1)
            tb.autofit = False
            tb.columns[0].width = Cm(9.5)
            shade(tb.cell(0, 0), GRIS)
            celda(tb.cell(0, 0), titulo, 6.5, True, align=WD_ALIGN_PARAGRAPH.CENTER)
            p = cell.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run()
            shape = run.add_picture(str(PNG_GRIS), width=Cm(w), height=Cm(h))
            shape._inline.docPr.set("descr", tag)
            primero = False


# ----------------------------------------------------------------------------- verificación


def normalizar(tag):
    t = re.sub(r"\[[^\]]*\]", "[i]", tag)
    t = re.sub(r":[^{}]*}$", "}", t)
    return t


def extraer_tags(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    descr = re.findall(r'descr="([^"]*)"', xml)
    texto = re.sub(r"<[^>]+>", "", xml)
    crudos = re.findall(r"\{d\.[^{}]*\}", texto)
    for d in descr:
        crudos += re.findall(r"\{d\.[^{}]*\}", d)
    return crudos


def verificar():
    requeridas = [ln.strip() for ln in REQUERIDAS.read_text(encoding="utf-8").splitlines()
                  if ln.strip()]
    presentes = {normalizar(t) for t in extraer_tags(SALIDA)}
    faltan = []
    for r in requeridas:
        if r in EXCLUIDOS_V2:
            continue
        objetivo = ALIAS_V2.get(r, r)
        if normalizar(objetivo) not in presentes:
            faltan.append(r)
    print(f"verificar(): {len(requeridas) - len(faltan)}/{len(requeridas)} requeridas "
          f"presentes (con alias v2); {len(presentes)} tags únicos en el docx")
    if faltan:
        print("FALTAN:")
        for f in faltan:
            print("  " + f)
        sys.exit(1)


def _fijar_tabla(tbl, tope_dxa, W):
    filas = tbl.findall(f"{W}tr")
    if not filas:
        return

    def spans(tr):
        out = []
        for tc in tr.findall(f"{W}tc"):
            gs = tc.find(f"{W}tcPr/{W}gridSpan")
            out.append(int(gs.get(f"{W}val")) if gs is not None else 1)
        return out

    ncols = max(sum(spans(tr)) for tr in filas)

    anchos = None
    for tr in filas:
        sp = spans(tr)
        if sum(sp) == ncols and len(sp) == ncols:
            ws = []
            for tc in tr.findall(f"{W}tc"):
                tcw = tc.find(f"{W}tcPr/{W}tcW")
                if tcw is None or tcw.get(f"{W}type") != "dxa":
                    ws = None
                    break
                ws.append(int(tcw.get(f"{W}w")))
            if ws:
                anchos = ws
                break
    if anchos is None:
        grid = tbl.find(f"{W}tblGrid")
        if grid is not None:
            gcs = [gc.get(f"{W}w") for gc in grid.findall(f"{W}gridCol")]
            if len(gcs) == ncols and all(gcs):
                anchos = [int(g) for g in gcs]
    if anchos is None:
        anchos = [tope_dxa // ncols] * ncols

    total = sum(anchos)
    if total > tope_dxa:
        anchos = [max(150, a * tope_dxa // total) for a in anchos]
        total = sum(anchos)

    tblPr = tbl.find(f"{W}tblPr")
    if tblPr is None:
        tblPr = OxmlElement("w:tblPr")
        tbl.insert(0, tblPr)
    for tag in ("w:tblW", "w:tblLayout"):
        for el in tblPr.findall(qn(tag)):
            tblPr.remove(el)
    tblW = OxmlElement("w:tblW")
    tblW.set(qn("w:w"), str(total))
    tblW.set(qn("w:type"), "dxa")
    tblPr.append(tblW)
    lay = OxmlElement("w:tblLayout")
    lay.set(qn("w:type"), "fixed")
    tblPr.append(lay)

    grid = tbl.find(f"{W}tblGrid")
    if grid is not None:
        tbl.remove(grid)
    grid = OxmlElement("w:tblGrid")
    for a in anchos:
        gc = OxmlElement("w:gridCol")
        gc.set(qn("w:w"), str(a))
        grid.append(gc)
    tbl.insert(list(tbl).index(tblPr) + 1, grid)

    for tr in filas:
        col = 0
        for tc in tr.findall(f"{W}tc"):
            gs = tc.find(f"{W}tcPr/{W}gridSpan")
            n = int(gs.get(f"{W}val")) if gs is not None else 1
            w = sum(anchos[col:col + n])
            col += n
            tcPr = tc.find(f"{W}tcPr")
            if tcPr is None:
                tcPr = OxmlElement("w:tcPr")
                tc.insert(0, tcPr)
            for el in tcPr.findall(qn("w:tcW")):
                tcPr.remove(el)
            tcW = OxmlElement("w:tcW")
            tcW.set(qn("w:w"), str(w))
            tcW.set(qn("w:type"), "dxa")
            tcPr.append(tcW)
            for sub in tc.findall(f"{W}tbl"):
                _fijar_tabla(sub, w - 250, W)


def enforce_fixed_layout(doc):
    W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    tope = int(19.0 * 567)
    for child in doc.element.body:
        if child.tag == f"{W}p" and child.find(f"{W}pPr/{W}sectPr") is not None:
            tope = int(19.9 * 567)
        elif child.tag == f"{W}tbl":
            _fijar_tabla(child, tope, W)


def validar_anchos(path):
    from lxml import etree
    W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    root = etree.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
    body = root.find(f"{W}body")
    tope = int(19.0 * 567)
    excesos = 0
    i = 0
    for child in body:
        if child.tag == f"{W}p" and child.find(f"{W}pPr/{W}sectPr") is not None:
            tope = int(19.9 * 567)
        elif child.tag == f"{W}tbl":
            i += 1
            grid = child.find(f"{W}tblGrid")
            suma = sum(int(g.get(f"{W}w")) for g in grid.findall(f"{W}gridCol"))
            if suma > tope + 5:
                excesos += 1
                print(f"  EXCEDE tabla {i}: {suma} dxa (tope {tope})")
    print(f"validar_anchos: {excesos} EXCEDEN de {i}")
    return excesos


def main():
    global PNG_GRIS
    PNG_GRIS = png_gris(AQUI / "_placeholder_gris.png")
    doc = Document()
    st = doc.styles["Normal"]
    st.font.name = "Calibri"
    st.font.size = Pt(5.5)
    st.paragraph_format.space_after = Pt(0)
    st.paragraph_format.space_before = Pt(0)

    s0 = doc.sections[0]
    s0.page_width, s0.page_height = Cm(21), Cm(29.7)
    for m in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(s0, m, Cm(1.0))
    # sólo portada: la referencia arranca la banda de título a 6,3% del alto
    s0.top_margin = Cm(1.87)
    portada(doc)

    s1 = doc.add_section(WD_SECTION.NEW_PAGE)
    s1.page_width, s1.page_height = Cm(21), Cm(29.7)
    s1.left_margin = s1.right_margin = Cm(0.5)
    s1.top_margin, s1.bottom_margin = Cm(0.45), Cm(0.35)

    hoja1(doc)
    doc.add_page_break()
    hoja2(doc)
    doc.add_page_break()
    hoja3(doc)
    doc.add_page_break()
    hoja_fotos(doc, 4, desde=0)
    doc.add_page_break()
    hoja_fotos(doc, 5, desde=8)
    doc.add_page_break()
    hoja_anexo1(doc)
    doc.add_page_break()
    hoja_anexo2(doc)

    enforce_fixed_layout(doc)
    doc.save(SALIDA)
    print(f"OK: {SALIDA} ({SALIDA.stat().st_size} bytes)")
    if validar_anchos(SALIDA) != 0:
        raise SystemExit("hay tablas que exceden el ancho útil")
    verificar()


if __name__ == "__main__":
    main()
