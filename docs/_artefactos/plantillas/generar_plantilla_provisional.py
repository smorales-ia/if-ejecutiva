#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera `Informe_VProperty_provisional_v0.docx` — la plantilla PROVISIONAL del
informe de tasación (T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 5).

- Estructura calcada del gold master
  `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` (8 hojas).
- TODOS los tags Carbone salen de `lib/informe/matriz-tags.ts` (se parsea en
  vivo — si la matriz cambia, regenerar con `python3 generar_plantilla_provisional.py`
  y los tags nuevos caen solos; los que pierdan su lugar natural aterrizan en la
  sección final «Datos adicionales», cero tags perdidos).
- Los tags auxiliares de tablas/loops (columnas de comparables, cuadro, fotos…)
  usan las rutas reales de `InformeContexto` (`lib/informe/tipos.ts`).
- Al final valida el binario: abre el zip, parsea `word/document.xml` con
  ElementTree y verifica que cada tag con ruta no vacía de MATRIZ_TAGS aparece
  al menos una vez. Sale con código ≠0 si falta alguno.

Sin dependencias externas: python3 stdlib (re, zipfile, xml.etree).
"""
from __future__ import annotations

import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

AQUI = Path(__file__).resolve().parent
REPO = AQUI.parents[2]
MATRIZ_TS = REPO / 'lib' / 'informe' / 'matriz-tags.ts'
SALIDA = AQUI / 'Informe_VProperty_provisional_v0.docx'

# ---------------------------------------------------------------------------
# 1 · Parseo de la matriz (fuente de verdad: lib/informe/matriz-tags.ts)
# ---------------------------------------------------------------------------

RE_ENTRADA = re.compile(
    r"tag:\s*'(?P<tag>[^']*)',\s*"
    r"ruta:\s*'(?P<ruta>[^']*)',"
    r".*?estado:\s*'(?P<estado>[^']*)',\s*"
    r"pId:\s*(?P<pid>null|'[^']*')",
    re.S,
)


def parsear_matriz() -> list[dict]:
    src = MATRIZ_TS.read_text(encoding='utf-8')
    entradas = []
    for m in RE_ENTRADA.finditer(src):
        pid = m.group('pid')
        entradas.append({
            'tag': m.group('tag'),
            'ruta': m.group('ruta'),
            'estado': m.group('estado'),
            'pId': None if pid == 'null' else pid.strip("'"),
        })
    if not entradas:
        raise SystemExit(f'ERROR: no se pudo parsear ninguna entrada de {MATRIZ_TS}')
    return entradas


MATRIZ = parsear_matriz()

# Tags esperados en la plantilla: tag Carbone real (≠ '—') con ruta no vacía.
TAGS_ESPERADOS: list[str] = []
for e in MATRIZ:
    if e['tag'] != '—' and e['ruta'] and e['tag'] not in TAGS_ESPERADOS:
        TAGS_ESPERADOS.append(e['tag'])

# Para anotar «[pendiente Px-y]»: si alguna entrada del tag es HUECO/METLIFE_ONLY.
TAG_INFO: dict[str, tuple[str, str | None]] = {}
for e in MATRIZ:
    if e['tag'] == '—':
        continue
    previo = TAG_INFO.get(e['tag'])
    if previo is None or (previo[0] == 'OK' and e['estado'] != 'OK'):
        TAG_INFO[e['tag']] = (e['estado'], e['pId'])

# ---------------------------------------------------------------------------
# 2 · Helpers WordprocessingML
# ---------------------------------------------------------------------------

GRIS = '808080'


def esc(t: str) -> str:
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def R(texto: str, b: bool = False, i: bool = False,
      color: str | None = None, sz: str | None = None) -> str:
    props = ''
    if b:
        props += '<w:b/>'
    if i:
        props += '<w:i/>'
    if color:
        props += f'<w:color w:val="{color}"/>'
    if sz:
        props += f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>'
    rpr = f'<w:rPr>{props}</w:rPr>' if props else ''
    return f'<w:r>{rpr}<w:t xml:space="preserve">{esc(texto)}</w:t></w:r>'


_anotados: set[str] = set()


def TAG(tag: str) -> str:
    """Run con el tag Carbone; la 1ª aparición de un HUECO/METLIFE_ONLY lleva
    la marca discreta «[pendiente Px-y]» (gris, 7pt)."""
    xml = R(tag)
    info = TAG_INFO.get(tag)
    if info and info[0] in ('HUECO', 'METLIFE_ONLY') and tag not in _anotados:
        _anotados.add(tag)
        etiqueta = info[1] or info[0]
        xml += R(f'  [pendiente {etiqueta}]', i=True, color=GRIS, sz='14')
    return xml


def P(*runs: str, align: str | None = None) -> str:
    ppr = f'<w:pPr><w:jc w:val="{align}"/></w:pPr>' if align else ''
    return f'<w:p>{ppr}{"".join(runs)}</w:p>'


def PT(texto: str, b: bool = False, i: bool = False, color: str | None = None,
       sz: str | None = None, align: str | None = None) -> str:
    return P(R(texto, b=b, i=i, color=color, sz=sz), align=align)


def TITULO(texto: str) -> str:
    return PT(texto, b=True, sz='28', align='center')


def SECCION(texto: str) -> str:
    return PT(texto, b=True, sz='22')


def NOTA(texto: str) -> str:
    return PT(texto, i=True, color=GRIS, sz='14')


def KV(label: str, *runs: str) -> str:
    return P(R(f'{label}: ', b=True), *runs)


def TC(*paras: str) -> str:
    contenido = ''.join(paras) if paras else P()
    return f'<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>{contenido}</w:tc>'


def ctext(t: str, **kw) -> str:
    return TC(PT(t, **kw))


def ctag(tag: str) -> str:
    return TC(P(TAG(tag)))


def TRow(*cells: str) -> str:
    return f'<w:tr>{"".join(cells)}</w:tr>'


def hrow(*labels: str) -> str:
    return TRow(*[ctext(l, b=True) for l in labels])


def TBL(*rows: str) -> str:
    bordes = ''.join(
        f'<w:{b} w:val="single" w:sz="4" w:space="0" w:color="999999"/>'
        for b in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'))
    return ('<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/>'
            f'<w:tblBorders>{bordes}</w:tblBorders></w:tblPr>{"".join(rows)}</w:tbl>' + P())


PAGEBREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'


def folio(n: int) -> str:
    return PT(f'Hoja N°{n}', b=True, align='right')


def encabezado_repetido() -> str:
    """Encabezado repetido Hojas 2-7 (E-117): cliente, RUT, dirección, Nº interno."""
    return TBL(
        TRow(ctext('Nombre Cliente', b=True), ctag('{d.partes.propietario}'),
             ctext('Nº Interno', b=True), ctag('{d.meta.codigo}')),
        TRow(ctext('RUT', b=True), ctag('{d.partes.rut}'),
             ctext('Dirección', b=True), ctag('{d.propiedad.direccion}')),
    )


# ---------------------------------------------------------------------------
# 3 · Literales del gold master (extraídos del PDF MET-6283 — no inventar)
# ---------------------------------------------------------------------------

DECLARACION_LEGAL = (
    'El profesional que firma declara que no tiene hoy, ni espera tener en el futuro, '
    'interés en la propiedad tasada ni ningún impedimento para llevar a cabo este trabajo. '
    'No tiene personal interés ni participación en los usos que se hagan de la tasación ni '
    'con las personas que participen en la operación. Ha inspeccionado la vivienda y la '
    'información que en esta fecha presenta es totalmente verdadera, y no ha olvidado nada '
    'de importancia. Los inconvenientes y limitaciones que pueda tener la vivienda y su '
    'vecindario están mencionados. Por otra parte se mantendrá un nivel de confidencialidad '
    'de la información obtenida, acorde a las exigencias de la Institución, que desde ya '
    'declara conocer y aceptar.'
)

BOILERPLATE_REFERENCIAS = (
    'Las muestras fueron seleccionadas por ser propiedades que comparten características '
    'similares en cuanto a dimensiones, programa, tipología de edificación, sector y se '
    'homologa en función a sus características propias como; diseño constructivo, calidad '
    'de sus materiales, calidad de sus revestimientos interiores y estado de mantención.'
)

PIE_CORPORATIVO = [
    'www.valueproperty.cl',
    'Mail: info@valueproperty.cl',
    'Dirección: Santa Magdalena 75 Of 310, Providencia - Santiago',
    'Fono: 22 500 0366',
]

# ---------------------------------------------------------------------------
# 4 · Las 8 hojas
# ---------------------------------------------------------------------------


def hoja_1_portada() -> str:
    x = P(TAG('{d.clienteInforme.logoUrl}'), align='center')
    x += TITULO('INFORME DE TASACION')
    x += PT('ANTECEDENTES', b=True, sz='22', align='center')
    x += TBL(
        TRow(ctext('Numero Solicitud', b=True), ctag('{d.meta.numeroSolicitudCliente}')),
        TRow(ctext('Institución', b=True), ctag('{d.clienteInforme.nombre}')),
        TRow(ctext('Nombre Cliente', b=True), ctag('{d.partes.propietario}')),
        TRow(ctext('Rut', b=True), ctag('{d.partes.rut}')),
        TRow(ctext('Dirección Propiedad', b=True), ctag('{d.propiedad.direccion}')),
        TRow(ctext('Comuna', b=True), ctag('{d.propiedad.comuna}')),
        TRow(ctext('Región', b=True), ctag('{d.propiedad.region}')),
    )
    for linea in PIE_CORPORATIVO:
        x += PT(linea, align='center', sz='16')
    return x


def hoja_2_identificacion() -> str:
    x = TITULO('INFORME DE TASACIÓN')
    # --- Identificación ---
    x += SECCION('Identificación')
    x += TBL(
        TRow(ctext('Nº Interno', b=True), ctag('{d.meta.codigo}'),
             ctext('N° SOLICITUD', b=True), ctag('{d.meta.numeroSolicitudCliente}')),
        TRow(ctext('Cliente', b=True), ctag('{d.clienteInforme.nombre}'),
             ctext('Propietario', b=True), ctag('{d.partes.propietario}')),
        TRow(ctext('RUT Prop.', b=True), ctag('{d.partes.rut}'),
             ctext('Dirección', b=True), ctag('{d.propiedad.direccion}')),
        TRow(ctext('Comuna', b=True), ctag('{d.propiedad.comuna}'),
             ctext('Region', b=True), ctag('{d.propiedad.region}')),
        TRow(ctext('Ejecutivo', b=True), ctag('{d.partes.ejecutivo}'),
             ctext('Tasador', b=True), ctag('{d.partes.tasador.nombre}')),
        TRow(ctext('Objetivo', b=True), ctag('{d.propiedad.objetivo}'),
             ctext('Tipo Prop.', b=True), ctag('{d.propiedad.tipoPropiedad}')),
        TRow(ctext('Fecha Tasación', b=True), ctag('{d.partes.fechaVisita}'),
             ctext('Destino SII', b=True), ctag('{d.sii.destinoSii}')),
        TRow(ctext('Rol', b=True), ctag('{d.sii.rolSii}'),
             ctext('Manzana', b=True), ctag('{d.sii.codManzana}')),
        TRow(ctext('DFL-2', b=True), ctag('{d.propiedad.dfl2}'),
             ctext('Año Construccion', b=True), ctag('{d.propiedad.anioConstruccion}')),
        TRow(ctext('Vida util', b=True), ctag('{d.propiedad.vidaUtil}'),
             ctext('Estado conservacion', b=True), ctag('{d.propiedad.estadoConservacion}')),
        TRow(ctext('Permiso', b=True), ctag('{d.legales.permisoEdificacion}'),
             ctext('Recepcion', b=True), ctag('{d.legales.recepcionFinal}')),
        TRow(ctext('Pisos Propiedad', b=True), ctag('{d.propiedad.pisos}'),
             ctext('Bodegas', b=True), ctag('{d.propiedad.bodegas}')),
        TRow(ctext('Estacionamientos Asociados', b=True), ctag('{d.propiedad.estacionamientos}'),
             ctext('Mansarda / Subterraneos', b=True), ctag('{d.cualitativa.detallePropiedad}')),
        TRow(ctext('Condominio · Sitio/Lote · Zona · Sello SEC · Afecto a expropi. · Fuente Información', b=True),
             ctag('{d.cualitativa.detallePropiedad}'),
             ctext('Ampliación', b=True), ctext('(detalle en Hoja N°3)', i=True, sz='14')),
        TRow(ctext('Ejecutivo (2º)', b=True), TC(NOTA('[condicional por cliente · P2]')),
             ctext('Formalizador', b=True), TC(NOTA('[condicional por cliente · P2]'))),
    )
    x += KV('Descripcion Expropiación', TAG('{d.textosIA.textoExpropiacion}'))
    x += KV('FOTO FACHADA', TAG('{d.fotos.fotos[i].url}'))
    x += NOTA('(miniatura: en la plantilla oficial T5 será {d.fotos.fotos[i=0].url:imageFit} '
              'sobre la categoría Fachada/Exterior)')
    # --- Síntesis ---
    x += SECCION('Síntesis de la Prop.')
    x += P(TAG('{d.textosIA.sintesisPropiedad}'))
    # --- Referencias ---
    x += SECCION('REF. OFERTAS · REF. C.B.R.')
    x += TBL(
        hrow('Nº', 'Dirección referencias', 'Tipo', 'Año', 'Total UF', 'Sup. Terreno.',
             'Sup. Constr.', 'UF/m² T.', 'UF/m² C.', 'Comentarios Relevantes'),
        TRow(ctag('{d.comparablesInforme.filas[i].id}'),
             ctag('{d.comparablesInforme.filas[i].direccion}'),
             ctag('{d.comparablesInforme.filas[i].tipoReferencia}'),
             ctag('{d.comparablesInforme.filas[i].anio}'),
             ctag('{d.comparablesInforme.filas[i].precioUf}'),
             ctag('{d.comparablesInforme.filas[i].supTerreno}'),
             ctag('{d.comparablesInforme.filas[i].supConstruida}'),
             ctext('—'),
             ctag('{d.comparablesInforme.filas[i].ufM2Construccion}'),
             TC(NOTA('[sin columna · P2-3]'))),
        TRow(ctag('{d.comparablesInforme.filas[i+1].id}'),
             ctag('{d.comparablesInforme.filas[i+1].direccion}'),
             ctext(''), ctext(''), ctext(''), ctext(''), ctext(''), ctext(''),
             ctext(''), ctext('')),
        TRow(TC(PT('PROMEDIO DE LA MUESTRA', b=True)), ctext(''), ctext(''), ctext(''),
             ctext(''), ctext(''), ctext(''), ctext(''),
             ctag('{d.comparablesInforme.promedioUfM2}'), ctext('')),
        TRow(TC(PT('VALOR TASACIÓN / TASACION', b=True)), ctext(''), ctext(''), ctext(''),
             ctext(''), ctext(''), ctext(''), ctext(''),
             ctag('{d.comparablesInforme.tasacionUfM2}'), ctext('')),
        TRow(TC(PT('TASACION V/S PROMEDIO DE LA MUESTRA', b=True)), ctext(''), ctext(''),
             ctext(''), ctext(''), ctext(''), ctext(''), ctext(''),
             ctag('{d.comparablesInforme.tasacionVsPct}'), ctext('')),
    )
    # --- Rentabilidad ---
    x += SECCION('ANALISIS DE RENTABILIDAD')
    x += TBL(
        TRow(ctext('Vida Util Remanente Años', b=True), ctag('{d.propiedad.vidaUtil}'),
             ctext('Arriendo Bruto $ / mes', b=True), ctag('{d.rentabilidad.arriendoBrutoMensualClp}')),
        TRow(ctext('UF/ mes', b=True), ctag('{d.rentabilidad.arriendoUfMes}'),
             ctext('Gasto Anual $', b=True), ctag('{d.rentabilidad.gastoAnualClp}')),
        TRow(ctext('Tasa Exigida Proyecto', b=True), ctag('{d.rentabilidad.tasaCapRate}'),
             ctext('Tiempo Renta (años)', b=True), ctag('{d.propiedad.vidaUtil}')),
        TRow(ctext('Ingreso Líquido Anual', b=True), ctag('{d.rentabilidad.ingresoLiquidoAnualClp}'),
             ctext('Renta Perpetua', b=True), ctag('{d.rentabilidad.rentaPerpetuaClp}')),
    )
    # --- Análisis de las referencias (boilerplate) ---
    x += SECCION('ANÁLISIS DE LAS REFERENCIAS')
    x += PT(BOILERPLATE_REFERENCIAS)
    # --- Cuadro de valoración ---
    x += SECCION('CUADRO DE VALORACION')
    x += TBL(
        hrow('Nº', 'Item', 'Detalle Item valorado', 'Situación Municipal', 'Superficie m²',
             'UF/m²', 'D. F.', 'Total UF', 'Grntía.'),
        TRow(ctag('{d.cuadro.items[i].orden}'),
             ctag('{d.cuadro.items[i].tipoItem}'),
             ctag('{d.cuadro.items[i].descripcion}'),
             ctag('{d.cuadro.items[i].situacionMunicipal}'),
             ctag('{d.cuadro.items[i].supM2}'),
             ctag('{d.cuadro.items[i].ufM2Aplicado}'),
             ctag('{d.cuadro.items[i].factorAplicado}'),
             ctag('{d.cuadro.items[i].ufTotalItem}'),
             ctag('{d.cuadro.items[i].aportaAGarantia}')),
        TRow(ctag('{d.cuadro.items[i+1].orden}'),
             ctag('{d.cuadro.items[i+1].descripcion}'),
             ctext(''), ctext(''), ctext(''), ctext(''), ctext(''), ctext(''), ctext('')),
        TRow(TC(PT('TOTAL TERRENO · TOTAL EDIFICACION · TOTAL OBRAS COMPLEMENTARIAS', b=True)),
             ctext(''), TC(NOTA('[subtotales por tipo: sin ruta en el contrato — se suman en T5]')),
             ctext(''), ctext(''), ctext(''), ctext(''), ctext(''), ctext('')),
        TRow(TC(PT('VALOR COMERCIAL NORMAL', b=True)), ctext(''), ctext(''), ctext(''),
             ctext(''), ctext(''), ctext('UF', b=True),
             ctag('{d.cuadro.totalUf}'), ctext('')),
    )
    x += KV('BIENES NO CONSIDERADOS GARANTIA', R('—'))
    # --- Valores terminales ---
    x += SECCION('Valores y Firma')
    x += TBL(
        TRow(ctext('Valor Comercial UF', b=True), ctag('{d.terminales.valorComercialUf}'),
             ctext('$', b=True), ctag('{d.terminales.valorComercialClp}')),
        TRow(ctext('Velocidad de venta normal', b=True), ctag('{d.propiedad.velocidadVentaEstimada}'),
             ctext('al', b=True), ctag('{d.terminales.fechaUf}')),
        TRow(ctext('1UF =', b=True), ctag('{d.terminales.ufDia}'),
             ctext('1US$ =', b=True), ctag('{d.terminales.usdDia}')),
        TRow(ctext('Valor de Reposición', b=True), ctag('{d.terminales.valorReposicionUf}'),
             ctext('$', b=True), ctag('{d.terminales.valorReposicionClp}')),
        TRow(ctext('Seguro Incendio y otros', b=True), ctag('{d.terminales.seguroIncendioUf}'),
             ctext('$', b=True), ctag('{d.terminales.seguroIncendioClp}')),
        TRow(ctext('Avalúo fiscal propiedad', b=True), ctag('{d.terminales.avaluoFiscalUf}'),
             ctext('$', b=True), ctext('—')),
        TRow(ctext('Valor a Remate', b=True), ctag('{d.terminales.valorRemateUf}'),
             ctext('$', b=True), ctag('{d.terminales.valorRemateClp}')),
        TRow(ctext('Liquid. Normal', b=True), ctag('{d.terminales.valorLiquidacionUf}'),
             ctext('$', b=True), ctag('{d.terminales.valorLiquidacionClp}')),
    )
    # --- Firmas ---
    x += TBL(
        TRow(ctext('Tasador', b=True), ctag('{d.partes.tasador.nombre}'),
             ctext('Firma', b=True), ctag('{d.partes.tasador.firmaUrl}')),
        TRow(ctext('Visador', b=True), ctag('{d.partes.visador.nombre}'),
             ctext('Fecha visita', b=True), ctag('{d.partes.fechaVisita}')),
        TRow(ctext('Fecha Visado', b=True), ctag('{d.partes.fechaVisado}'),
             ctext('REVISOR', b=True), ctag('{d.clienteInforme.nombreRevisor}')),
        TRow(ctext('Fecha revisión', b=True), TC(NOTA('[campo vacío de plantilla · P2]')),
             ctext(''), ctext('')),
    )
    x += PT(DECLARACION_LEGAL, sz='14', i=True)
    x += folio(1)
    return x


def hoja_3_referencias() -> str:
    x = encabezado_repetido()
    x += TITULO('Plano de Emplazamiento y referencias')
    x += SECCION('Mapa de ubicación de referencias')
    x += P(TAG('{d.mapa.staticMapUrl}'))
    x += SECCION('Referencia Nº 1 · Referencia Nº 2 · Referencia Nº 3')
    x += TBL(
        hrow('Fachada', 'Tipo', 'Dirección', 'Valor UF', 'Año', 'Sup const', 'Terreno', 'Telefono'),
        TRow(TC(NOTA('[foto por comparable sin camino · P1-4]')),
             ctag('{d.comparablesInforme.filas[i].tipoReferencia}'),
             ctag('{d.comparablesInforme.filas[i].direccion}'),
             ctag('{d.comparablesInforme.filas[i].precioUf}'),
             ctag('{d.comparablesInforme.filas[i].anio}'),
             ctag('{d.comparablesInforme.filas[i].supConstruida}'),
             ctag('{d.comparablesInforme.filas[i].supTerreno}'),
             ctext('—')),
        TRow(ctext(''), ctext(''),
             ctag('{d.comparablesInforme.filas[i+1].direccion}'),
             ctext(''), ctext(''), ctext(''), ctext(''), ctext('')),
    )
    x += folio(2)
    return x


def hoja_4_caracteristicas() -> str:
    x = encabezado_repetido()
    x += SECCION('Exigencias · PROPIEDAD ACOGIDA A')
    x += TBL(
        TRow(ctext('D.F.L. 2', b=True), ctag('{d.propiedad.dfl2}'),
             ctext('LEY 6071 (Venta por Pisos) · LEY 9135 (Ley Pereira) · LEY 19537 (Coprop. Inmob.)', b=True),
             ctag('{d.cualitativa.normativa}')),
        TRow(ctext('Exigencias PRMS / OGUC · Cambios en Plan Regulador · CUMPLE PLAN REGULADOR VIGENTE', b=True),
             ctag('{d.cualitativa.normativa}'),
             ctext('Uso más probable del bien · Según el uso actual del bien · Según tipo construcción', b=True),
             ctag('{d.cualitativa.normativa}')),
    )
    x += SECCION('Sector')
    x += TBL(
        TRow(ctext('Demanda · Tendencia · Densidad · Mercado · ABC1 · Homogéneo', b=True),
             ctag('{d.cualitativa.sector}')),
        TRow(ctext('Uso de terrenos (%) · Destino barrio · Arteria Principal · Calzada · Acera · Redes', b=True),
             ctag('{d.cualitativa.sector}')),
    )
    x += SECCION('Terreno')
    x += TBL(
        TRow(ctext('Tipo zona', b=True), ctag('{d.propiedad.tipoZonaDescripcion}'),
             ctext('Superficie', b=True), ctag('{d.propiedad.supTerrenoM2}')),
        TRow(ctext('Orientación', b=True), ctag('{d.propiedad.orientacion}'),
             ctext('Forma · Pendiente · Frente · Contrafrente · Deslindes · Relación Terr/Constr', b=True),
             ctag('{d.cualitativa.geometriaTerreno}')),
    )
    x += SECCION('Emplazamiento')
    x += TBL(
        TRow(ctext('Tipo agrupamiento', b=True), ctag('{d.propiedad.agrupacion}'),
             ctext('Estado de conservación', b=True), ctag('{d.propiedad.estadoConservacion}')),
        TRow(ctext('Calidad constructiva', b=True), ctag('{d.propiedad.calidadConstruccion}'),
             ctext('Diseño Arquitectónico · Predio y/o vista · Utilidad Funcional · Tipo Adosamiento · Iluminación natural', b=True),
             ctag('{d.cualitativa.emplazamiento}')),
    )
    x += SECCION('Características Constructivas')
    x += TBL(
        TRow(ctext('Estructura Soportante (material predominante)', b=True),
             ctag('{d.propiedad.materialPredominante}')),
        TRow(ctext('Elementos Fundamentales · Materialidad / Tipo · Calidad · Estado (16 filas) · Otros', b=True),
             ctag('{d.cualitativa.constructivas}')),
    )
    x += SECCION('O. Complementarias · Servicios')
    x += TBL(
        TRow(ctext('Agua Potable · Alcantarillado · Red Eléctrica · Gas · Otros', b=True),
             ctag('{d.cualitativa.servicios}')),
    )
    x += SECCION('HABITACIONES')
    x += TBL(
        hrow('Nivel', 'Tipo de recinto', 'Cantidad'),
        TRow(ctag('{d.recintos.habitacionesPorNivel[i].nivel}'),
             ctag('{d.recintos.habitacionesPorNivel[i].tipoRecinto}'),
             ctag('{d.recintos.habitacionesPorNivel[i].cantidad}')),
        TRow(ctag('{d.recintos.habitacionesPorNivel[i+1].nivel}'), ctext(''), ctext('')),
    )
    x += SECCION('Terminaciones (Tipo de Pavimento · Revestimiento de Muros · Terminación de Cielo)')
    x += TBL(
        hrow('Recinto', 'Categoría', 'Descripción', 'Calidad'),
        TRow(ctag('{d.recintos.terminacionesPorRecinto[i].nombre}'),
             ctag('{d.recintos.terminacionesPorRecinto[i].categoria}'),
             ctag('{d.recintos.terminacionesPorRecinto[i].descripcion}'),
             ctag('{d.recintos.terminacionesPorRecinto[i].calidad}')),
        TRow(ctag('{d.recintos.terminacionesPorRecinto[i+1].nombre}'),
             ctext(''), ctext(''), ctext('')),
    )
    x += SECCION('Ampliaciones')
    x += TBL(
        hrow('Descripción', 'Superficie m²', 'Regulación (año)'),
        TRow(ctag('{d.recintos.ampliaciones[i].descripcion}'),
             ctag('{d.recintos.ampliaciones[i].supM2}'),
             ctag('{d.recintos.ampliaciones[i].annoRegularizacion}')),
        TRow(ctag('{d.recintos.ampliaciones[i+1].descripcion}'), ctext(''), ctext('')),
    )
    x += SECCION('COMODIDADES')
    x += P(TAG('{d.cualitativa.comodidades}'))
    x += folio(3)
    return x


def hoja_5_fotos() -> str:
    x = encabezado_repetido()
    x += TITULO('Fotos de la Propiedad')
    x += TBL(
        hrow('Foto (URL)', 'Rótulo', 'Categoría'),
        TRow(ctag('{d.fotos.fotos[i].url}'),
             ctag('{d.fotos.fotos[i].nombre}'),
             ctag('{d.fotos.fotos[i].categoria}')),
        TRow(ctag('{d.fotos.fotos[i+1].url}'), ctext(''), ctext('')),
    )
    x += NOTA('En la plantilla oficial (T5) esta lista será la grilla 2×4 con inserción de '
              'imagen Carbone ({d.fotos.fotos[i].url:imageFit}); el loop pagina solo.')
    x += folio(4)
    return x


def hoja_6_fotos_cont() -> str:
    x = encabezado_repetido()
    x += TITULO('Fotos de la Propiedad')
    x += NOTA('(continuación — el loop de fotos de la Hoja N°4 se extiende automáticamente; '
              'esta hoja existe para calcar la foliación del gold master: 16 fotos en dos '
              'grillas 2×4)')
    x += folio(5)
    return x


def hoja_7_anexo1() -> str:
    x = encabezado_repetido()
    x += TITULO('ANEXO N°1')
    x += KV('Anexo N° 1: Comentarios', R('—'))
    x += SECCION('INFORMACION DE SII · PLANO · ESQUEMA DE SUPERFICIES')
    x += TBL(
        hrow('Documento', 'Tipo', 'Archivo'),
        TRow(ctag('{d.anexos.documentos[i].nombre}'),
             ctag('{d.anexos.documentos[i].tipo}'),
             ctag('{d.anexos.documentos[i].url}')),
        TRow(ctag('{d.anexos.documentos[i+1].nombre}'), ctext(''), ctext('')),
    )
    x += folio(6)
    return x


def hoja_8_anexo2(extra: str = '') -> str:
    x = encabezado_repetido()
    x += TITULO('ANEXO N°2')
    x += KV('Anexo N° 2: Comentarios', R('—'))
    x += SECCION('ROL - AVALUO · PERMISO DE EDIFICACIÓN · RECEPCION FINAL · NO EXPROPIACIÓN SERVIU')
    x += NOTA('Mismo loop de {d.anexos.documentos[i]…} de la Hoja N°6: en T5 la inserción se '
              'reparte por tipo de documento entre Anexo 1 y Anexo 2.')
    x += extra
    x += folio(7)
    return x


def seccion_datos_adicionales(tags_faltantes: list[str]) -> str:
    """Red de seguridad: todo tag de la matriz sin lugar natural aterriza acá."""
    if not tags_faltantes:
        return ''
    x = SECCION('Datos adicionales')
    x += NOTA('Tags de la matriz sin lugar natural en el layout — cero tags perdidos.')
    for t in tags_faltantes:
        x += P(TAG(t))
    return x


# ---------------------------------------------------------------------------
# 5 · Ensamblado del paquete OOXML
# ---------------------------------------------------------------------------

NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
NS_R = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'

CONTENT_TYPES = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
</Types>'''

RELS_RAIZ = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

RELS_DOCUMENTO = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
</Relationships>'''

STYLES = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles {NS}>
<w:docDefaults>
<w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="60"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
</w:styles>'''

HEADER = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr {NS}>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr>
<w:r><w:rPr><w:b/><w:color w:val="B91C1C"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr>
<w:t xml:space="preserve">PLANTILLA PROVISIONAL v0 — NO OFICIAL</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr>
<w:r><w:rPr><w:i/><w:color w:val="808080"/><w:sz w:val="12"/><w:szCs w:val="12"/></w:rPr>
<w:t xml:space="preserve">Estructura calcada del gold master MET-6283 · tags: lib/informe/matriz-tags.ts · regenerar: docs/_artefactos/plantillas/generar_plantilla_provisional.py</w:t></w:r></w:p>
</w:hdr>'''


def construir_document_xml() -> str:
    global _anotados
    _anotados = set()
    hojas = [
        hoja_1_portada(),
        hoja_2_identificacion(),
        hoja_3_referencias(),
        hoja_4_caracteristicas(),
        hoja_5_fotos(),
        hoja_6_fotos_cont(),
        hoja_7_anexo1(),
    ]
    cuerpo_parcial = PAGEBREAK.join(hojas)
    # Red de seguridad: matriz-tags que aún no aparecen van a «Datos adicionales»
    # dentro de la última hoja.
    faltantes = [t for t in TAGS_ESPERADOS if t not in cuerpo_parcial]
    faltantes_post_anexo2 = [t for t in faltantes
                             if t not in hoja_8_anexo2()]  # sin sección extra
    hojas.append(hoja_8_anexo2(seccion_datos_adicionales(faltantes_post_anexo2)))
    body = PAGEBREAK.join(hojas)
    sect = ('<w:sectPr><w:headerReference w:type="default" r:id="rId2"/>'
            '<w:pgSz w:w="12240" w:h="15840"/>'
            '<w:pgMar w:top="1080" w:right="720" w:bottom="720" w:left="720" '
            'w:header="360" w:footer="360" w:gutter="0"/></w:sectPr>')
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<w:document {NS} {NS_R}><w:body>{body}{sect}</w:body></w:document>')


def escribir_docx() -> None:
    doc = construir_document_xml()
    with zipfile.ZipFile(SALIDA, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', CONTENT_TYPES)
        z.writestr('_rels/.rels', RELS_RAIZ)
        z.writestr('word/document.xml', doc)
        z.writestr('word/_rels/document.xml.rels', RELS_DOCUMENTO)
        z.writestr('word/styles.xml', STYLES)
        z.writestr('word/header1.xml', HEADER)


# ---------------------------------------------------------------------------
# 6 · Verificación (zip válido · XML parseable · todos los tags presentes)
# ---------------------------------------------------------------------------

def verificar() -> int:
    with zipfile.ZipFile(SALIDA) as z:
        mal = z.testzip()
        if mal:
            print(f'ERROR: entrada corrupta en el zip: {mal}')
            return 1
        partes = set(z.namelist())
        for requerida in ('[Content_Types].xml', '_rels/.rels',
                          'word/document.xml', 'word/_rels/document.xml.rels',
                          'word/styles.xml', 'word/header1.xml'):
            if requerida not in partes:
                print(f'ERROR: falta la parte {requerida}')
                return 1
        for parte in sorted(partes):
            ET.fromstring(z.read(parte))  # XML bien formado o explota
        doc = z.read('word/document.xml').decode('utf-8')
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    arbol = ET.fromstring(doc)
    texto = ''.join(t.text or '' for t in arbol.iter(f'{{{ns["w"]}}}t'))
    encontrados = [t for t in TAGS_ESPERADOS if t in texto]
    faltantes = [t for t in TAGS_ESPERADOS if t not in texto]
    print(f'Plantilla: {SALIDA.relative_to(REPO)}')
    print(f'Partes OOXML: {len(partes)} · XML bien formado: sí')
    print(f'Tags de la matriz (ruta no vacía): {len(TAGS_ESPERADOS)} esperados '
          f'· {len(encontrados)} encontrados · {len(faltantes)} faltantes')
    if faltantes:
        for t in faltantes:
            print(f'  FALTA: {t}')
        return 1
    return 0


if __name__ == '__main__':
    escribir_docx()
    sys.exit(verificar())
