/**
 * Matriz de tags del informe — el «artefacto vivo §7.3» en forma ejecutable.
 *
 * Tanda T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 1. Derivada del
 * Excel gemelo `docs/_analisis/PARIDAD_informe_UI_20260924.xlsx` (228 filas,
 * E-01…E-228) agrupado como los 53 grupos del §2 de la auditoría: **cada E-id
 * aparece exactamente una vez** en toda la matriz (lo asegura
 * `ensamblador.test.ts`, aserción de integridad).
 *
 * ## Semántica de cada entrada
 *
 * - `tag`: sintaxis Carbone (`{d.ruta}`; loops `{d.x[i].y}`). Los elementos
 *   `PLANTILLA` (texto estático del `.docx`: rótulos, pie corporativo,
 *   declaración legal, boilerplate metodológico, formato del año) llevan
 *   `tag: '—'` y `ruta: ''` — no son datos, no viajan en el JSON.
 * - `ruta`: ruta real dentro de `InformeContexto` (`lib/informe/tipos.ts`).
 *   Es lo que `medirParidad` resuelve con `leerRuta` para decidir presencia.
 * - `estado`: viene de la columna `estado` del Excel, con **una** traducción:
 *   los hardcode de plantilla (origen `hardcode plantilla` en la hoja
 *   Contexto_Tecnico, más E-124 «formato del año», que es normalización de
 *   plantilla) pasan de HUECO/OK a `PLANTILLA` — cubiertos por el `.docx`,
 *   no por datos. El resto se conserva literal: `OK` → `OK`, `HUECO` →
 *   `HUECO`, `MetLife-only` → `METLIFE_ONLY`.
 * - `pId`: pendiente del roadmap que afina o cierra el elemento (`null` si no
 *   hay acción pendiente).
 *
 * ## Fuente de verdad
 *
 * Este módulo ES la fuente de verdad ejecutable de la matriz;
 * `docs/_artefactos/plantillas/matriz-tags-informe.md` es su proyección
 * legible y se regenera desde acá. Ante divergencia, gana este archivo.
 */

export type EstadoMatriz = 'OK' | 'HUECO' | 'METLIFE_ONLY' | 'PLANTILLA'

export interface EntradaMatriz {
  /** E-ids cubiertos, formato de la auditoría (`E-01`…`E-228`). */
  eIds: string[]
  /** Tag Carbone (`{d.ruta}`) o `—` si es texto estático de plantilla. */
  tag: string
  /** Ruta dentro de `InformeContexto`. Vacía sólo en PLANTILLA o cuando el
   *  dato no tiene siquiera clave en el contrato (se anota en descripcion). */
  ruta: string
  /** Qué es el elemento, en una frase (del §2 de la auditoría). */
  descripcion: string
  /** Fuente real del dato: tabla.campo / motor / cron / IA / plantilla. */
  fuente: string
  estado: EstadoMatriz
  /** P-id del roadmap (`P0-1`…`P2-5`) o `null` sin acción pendiente. */
  pId: string | null
}

/** `E-7` → `E-07` (la auditoría pad-ea a 2 dígitos; E-100+ va tal cual). */
const eid = (n: number): string => `E-${String(n).padStart(2, '0')}`

/** Rango inclusivo de E-ids. */
const rango = (desde: number, hasta: number): string[] =>
  Array.from({ length: hasta - desde + 1 }, (_, i) => eid(desde + i))

/** Lista suelta de E-ids. */
const ids = (...ns: number[]): string[] => ns.map(eid)

export const MATRIZ_TAGS: readonly EntradaMatriz[] = Object.freeze([
  {
    eIds: ids(1, 3, 15, 16, 18, 84, 86, 118, 119, 209, 212, 213, 218, 219, 224, 225),
    tag: '—',
    ruta: '',
    descripcion: 'Rótulos, títulos y foliación fijos («INFORME DE TASACION», «Hoja N°X»)',
    fuente: 'hardcode plantilla Carbone (.docx)',
    estado: 'PLANTILLA',
    pId: 'P0-1',
  },
  {
    eIds: ids(2),
    tag: '{d.clienteInforme.logoUrl}',
    ruta: 'clienteInforme.logoUrl',
    descripcion: 'Logo/marca de portada (VProperty + marca cliente — brecha B2/H9)',
    fuente: 'C_VariablesCliente.logo_url (EAV, sin clientes reales)',
    estado: 'HUECO',
    pId: 'P1-5',
  },
  {
    eIds: ids(4, 5, 17, 31),
    tag: '{d.meta.codigo}',
    ruta: 'meta.codigo',
    descripcion: 'Identificadores de la solicitud (N° interno, institución, N° cliente)',
    fuente: 'TX_Solicitudes.codigo_solicitud · n_operacion_cliente · cliente',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(6, 7, 8, 9, 10, 19, 20, 21, 22, 32, 33, 34, 35),
    tag: '{d.partes.propietario}',
    ruta: 'partes.propietario',
    descripcion: 'Propietario, RUT, dirección, comuna, región (portada + identificación)',
    fuente: 'TX_Solicitudes.cliente_final_nombre/_rut · direccion · comuna · region',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(11, 12, 13, 14),
    tag: '—',
    ruta: '',
    descripcion: 'Pie corporativo de portada (web, mail, dirección, fono)',
    fuente: 'hardcode plantilla Carbone (.docx)',
    estado: 'PLANTILLA',
    pId: 'P0-1',
  },
  {
    eIds: rango(23, 28),
    tag: '{d.partes.fechaVisita}',
    ruta: 'partes.fechaVisita',
    descripcion: 'Ejecutivo, tasador, objetivo, tipo propiedad, fecha tasación, destino SII',
    fuente: 'TX_Solicitudes (asignación IF-02) · M_Tasadores · RF-09 destino_sii',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(29, 30, 115),
    tag: '—',
    ruta: '',
    descripcion: 'Campos de plantilla vacíos (Ejecutivo 2º, Formalizador, Fecha revisión)',
    fuente: 'sin origen — tags condicionales por cliente en plantilla',
    estado: 'HUECO',
    pId: 'P2',
  },
  {
    eIds: ids(36, 40),
    tag: '{d.sii.rolSii}',
    ruta: 'sii.rolSii',
    descripcion: 'Rol SII y manzana',
    fuente: 'TX_Solicitudes.rol_sii · TX_DatosTasacion.cod_sii_manzana (RF-09/UI F)',
    estado: 'OK',
    pId: 'P1-6',
  },
  {
    eIds: ids(37, 39, 41, 45, 52, 56),
    tag: '{d.cualitativa.detallePropiedad}',
    ruta: 'cualitativa.detallePropiedad',
    descripcion: 'Condominio, sitio/lote, zona normativa, mansarda, subterráneos, fuente info',
    fuente: 'UI captura y descarta (CI-023) — sin columnas destino',
    estado: 'HUECO',
    pId: 'P1-1',
  },
  {
    eIds: ids(38, 42, 43, 44, 46, 47, 53),
    tag: '{d.propiedad.anioConstruccion}',
    ruta: 'propiedad.anioConstruccion',
    descripcion: 'Pisos, estacionamientos, bodegas, DFL-2, año construcción, estado conservación',
    fuente: 'TX_DatosTasacion (UI sección B)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(48, 76, 81),
    tag: '{d.propiedad.vidaUtil}',
    ruta: 'propiedad.vidaUtil',
    descripcion: 'Vida útil, vida útil remanente, tiempo renta',
    fuente: 'F_VidaUtil existe pero fuera de la regla v32',
    estado: 'HUECO',
    pId: 'P1-9',
  },
  {
    eIds: ids(49, 50),
    tag: '{d.legales.permisoEdificacion}',
    ruta: 'legales.permisoEdificacion',
    descripcion: 'Permiso de edificación y recepción final (N° y fecha)',
    fuente: 'TX_DocumentosLegales (UI sección F / RF-09)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(51, 208),
    tag: '{d.recintos.ampliaciones[i].descripcion}',
    ruta: 'recintos.ampliaciones[].descripcion',
    descripcion: 'Ampliaciones (flag + detalle 1-3)',
    fuente: 'TX_Ampliaciones (UI sección E)',
    estado: 'OK',
    pId: 'P2-3',
  },
  {
    eIds: ids(54, 55),
    tag: '{d.cualitativa.detallePropiedad}',
    ruta: 'cualitativa.detallePropiedad',
    descripcion: 'Sello SEC y afecto a expropiación',
    fuente: 'UI captura y descarta (CI-023) — sin columnas destino',
    estado: 'HUECO',
    pId: 'P1-1',
  },
  {
    eIds: ids(57),
    tag: '{d.textosIA.textoExpropiacion}',
    ruta: 'textosIA.textoExpropiacion',
    descripcion: 'Texto de expropiación (párrafo con comuna + N° cert)',
    fuente: 'plantilla con variables — n_cert persiste; falta afecto_expropiacion',
    estado: 'HUECO',
    pId: 'P1-1',
  },
  {
    eIds: ids(58, 99),
    tag: '{d.fotos.fotos[i].url}',
    ruta: 'fotos.fotos[].url',
    descripcion: 'Foto fachada (miniatura identificación + cuadro valoración)',
    fuente: 'TX_Adjuntos (UI Fotos, categoría Fachada/Exterior)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(59, 60),
    tag: '{d.textosIA.sintesisPropiedad}',
    ruta: 'textosIA.sintesisPropiedad',
    descripcion: 'Síntesis de la propiedad y descripción del sector (párrafos redactados)',
    fuente: 'Claude RN-25/RF-32 en SC09 — sin productor implementado',
    estado: 'METLIFE_ONLY',
    pId: 'P0-2',
  },
  {
    eIds: ids(61, 62, 63, 64, 65, 70, 71, 72),
    tag: '{d.comparablesInforme.filas[i].direccion}',
    ruta: 'comparablesInforme.filas[].direccion',
    descripcion: 'Comparables: 5 ofertas + 2 CBR (14 atributos por fila)',
    fuente: 'TX_Comparables (RF-09 foto del cuadro · A-13)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(66, 67, 68, 73, 74, 75),
    tag: '{d.comparablesInforme.promedioUfM2}',
    ruta: 'comparablesInforme.promedioUfM2',
    descripcion: 'Promedios de la muestra, fila TASACIÓN y % tasación vs promedio',
    fuente: 'calculado por el ensamblador (puente F-2/P1-8) — no persiste',
    estado: 'HUECO',
    pId: 'P1-8',
  },
  {
    eIds: ids(69),
    tag: '—',
    ruta: '',
    descripcion: 'Comentarios relevantes por comparable (campo inexistente)',
    fuente: 'sin columna en TX_Comparables',
    estado: 'HUECO',
    pId: 'P2-3',
  },
  {
    eIds: ids(77, 79, 82, 83),
    tag: '{d.rentabilidad.ingresoLiquidoAnualClp}',
    ruta: 'rentabilidad.ingresoLiquidoAnualClp',
    descripcion: 'Rentabilidad: arriendo bruto, gasto anual, ingreso líquido, renta perpetua',
    fuente: 'TX_DatosTasacion (sección H) + TX_Calculos (F_IngresoLiquidoAnualCLP · F_RentaPerpetuaCLP)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(78),
    tag: '{d.rentabilidad.arriendoUfMes}',
    ruta: 'rentabilidad.arriendoUfMes',
    descripcion: 'Arriendo UF/mes',
    fuente: 'F_IngresoLiquido (UF) fuera de la regla v32',
    estado: 'HUECO',
    pId: 'P2-3',
  },
  {
    eIds: ids(80),
    tag: '{d.rentabilidad.tasaCapRate}',
    ruta: 'rentabilidad.tasaCapRate',
    descripcion: 'Tasa exigida / cap rate base (hoy tipeado; sin cascada M_Clientes poblada)',
    fuente: 'cascada override > TX_DatosTasacion.tasa_cap_rate > M_Clientes (guard H5)',
    estado: 'HUECO',
    pId: 'P1-9',
  },
  {
    eIds: ids(85),
    tag: '—',
    ruta: '',
    descripcion: 'Párrafo «Análisis de las referencias» (boilerplate metodológico)',
    fuente: 'hardcode plantilla Carbone (.docx)',
    estado: 'PLANTILLA',
    pId: 'P0-1',
  },
  {
    eIds: rango(87, 98),
    tag: '{d.cuadro.totalUf}',
    ruta: 'cuadro.totalUf',
    descripcion: 'Cuadro de valoración completo (terreno/edificación/OO.CC, UF/m², D.F., totales)',
    fuente: 'TX_ItemsCuadroValoracion (UI sección C · H1/H2) + motor AT03 v32 · 0,00% vs oráculo',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(100, 102),
    tag: '{d.terminales.valorComercialUf}',
    ruta: 'terminales.valorComercialUf',
    descripcion: 'Valor tasación UF/$ y paridad «1UF=»',
    fuente: 'TX_Calculos (F_ValorComercialUF/CLP) + H_PreciosUF (cron, guard H3)',
    estado: 'OK',
    pId: 'P1-3',
  },
  {
    eIds: ids(101),
    tag: '{d.propiedad.velocidadVentaEstimada}',
    ruta: 'propiedad.velocidadVentaEstimada',
    descripcion: 'Velocidad de venta normal (no influye en 0,65/0,825 — hardcode)',
    fuente: 'TX_DatosTasacion.velocidad_venta_estimada (UI sección B)',
    estado: 'OK',
    pId: 'P2-1',
  },
  {
    eIds: ids(103),
    tag: '{d.terminales.usdDia}',
    ruta: 'terminales.usdDia',
    descripcion: 'Paridad «1US$=»',
    fuente: 'H_PreciosUF.tipo_cambio_usd — sin escritor automático (sólo seed manual)',
    estado: 'HUECO',
    pId: 'P1-3',
  },
  {
    eIds: rango(104, 108),
    tag: '{d.terminales.valorReposicionUf}',
    ruta: 'terminales.valorReposicionUf',
    descripcion: 'Valores terminales: reposición, seguro, avalúo fiscal, remate 65%, liquidación 82,5%',
    fuente: 'TX_Calculos (13 fórmulas v32) + RF-09 avalúo + overrides sección G',
    estado: 'OK',
    pId: 'P1-3',
  },
  {
    eIds: ids(109, 110),
    tag: '{d.partes.tasador.nombre}',
    ruta: 'partes.tasador.nombre',
    descripcion: 'Nombres de tasador y visador en el bloque de firmas',
    fuente: 'M_Tasadores/M_Visadores.nombre (asignación IF-02)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(111),
    tag: '{d.partes.tasador.firmaUrl}',
    ruta: 'partes.tasador.firmaUrl',
    descripcion: 'Firma manuscrita del tasador (imagen)',
    fuente: 'sin mecanismo — pegada a mano en el xlsm',
    estado: 'HUECO',
    pId: 'P1-9',
  },
  {
    eIds: ids(112),
    tag: '{d.partes.fechaVisita}',
    ruta: 'partes.fechaVisita',
    descripcion: 'Fecha de visita (la real, regla T-B)',
    fuente: 'TX_Solicitudes.fecha_visita (UI sección A)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(113),
    tag: '{d.partes.fechaVisado}',
    ruta: 'partes.fechaVisado',
    descripcion: 'Fecha de visado',
    fuente: 'IF-04 (visación) no existe',
    estado: 'HUECO',
    pId: 'P1-9',
  },
  {
    eIds: ids(114),
    tag: '{d.clienteInforme.nombreRevisor}',
    ruta: 'clienteInforme.nombreRevisor',
    descripcion: 'Revisor (institución)',
    fuente: 'C_VariablesCliente.nombre_revisor (EAV, sin valor)',
    estado: 'HUECO',
    pId: 'P1-5',
  },
  {
    eIds: ids(116),
    tag: '—',
    ruta: '',
    descripcion: 'Declaración legal del profesional',
    fuente: 'hardcode plantilla Carbone (.docx)',
    estado: 'PLANTILLA',
    pId: 'P0-1',
  },
  {
    eIds: ids(117),
    tag: '{d.meta.codigo}',
    ruta: 'meta.codigo',
    descripcion: 'Encabezado repetido Hojas 2-7 (cliente, dirección, RUT, N° interno)',
    fuente: 'TX_Solicitudes (datos ya existen; lo repite la plantilla)',
    estado: 'OK',
    pId: 'P0-1',
  },
  {
    eIds: ids(120),
    tag: '{d.mapa.staticMapUrl}',
    ruta: 'mapa.staticMapUrl',
    descripcion: 'Mapa de ubicación de referencias (satelital con pines)',
    fuente: 'Google Static Maps desde lat/long — sin implementación ni API key',
    estado: 'METLIFE_ONLY',
    pId: 'P1-4',
  },
  {
    eIds: ids(121, 122, 123),
    tag: '—',
    ruta: '',
    descripcion: 'Fichas de referencias 1-3 con foto de fachada (datos sí; foto por comparable no existe)',
    fuente: 'TX_Comparables (datos RF-09) + foto adjunta por comparable sin camino',
    estado: 'METLIFE_ONLY',
    pId: 'P1-4',
  },
  {
    eIds: ids(124),
    tag: '—',
    ruta: '',
    descripcion: 'Formato del año en fichas (2.015 vs 2015) — normalización de plantilla',
    fuente: 'formato es-CL en plantilla Carbone',
    estado: 'PLANTILLA',
    pId: null,
  },
  {
    eIds: rango(125, 140),
    tag: '{d.cualitativa.normativa}',
    ruta: 'cualitativa.normativa',
    descripcion: 'Exigencias normativas y plan regulador (PRMS/OGUC, leyes, cumplimiento, uso probable)',
    fuente: 'listas del xlsm — sin catálogo poblado ni UI (rescate M_Zonificacion en T4)',
    estado: 'METLIFE_ONLY',
    pId: 'P1-2',
  },
  {
    eIds: [...ids(141, 142, 143, 144, 145, 146), ...rango(148, 157)],
    tag: '{d.cualitativa.sector}',
    ruta: 'cualitativa.sector',
    descripcion: 'Mercado y sector (demanda, tendencia, calzada/acera, redes, % usos, arteria)',
    fuente: 'sin UI ni columnas',
    estado: 'HUECO',
    pId: 'P1-2',
  },
  {
    eIds: ids(147, 158, 161),
    tag: '{d.propiedad.supTerrenoM2}',
    ruta: 'propiedad.supTerrenoM2',
    descripcion: 'Tipo de zona, superficie terreno, orientación',
    fuente: 'TX_DatosTasacion (UI sección B)',
    estado: 'OK',
    pId: 'P2-3',
  },
  {
    eIds: ids(159, 160, 162, 163, 164, 165),
    tag: '{d.cualitativa.geometriaTerreno}',
    ruta: 'cualitativa.geometriaTerreno',
    descripcion: 'Forma, pendiente, frente, contrafrente, deslindes, ratio',
    fuente: 'sin UI ni columnas',
    estado: 'HUECO',
    pId: 'P1-2',
  },
  {
    eIds: ids(166, 170, 171, 173),
    tag: '{d.propiedad.estadoConservacion}',
    ruta: 'propiedad.estadoConservacion',
    descripcion: 'Emplazamiento con captura: agrupamiento, calidad, estado conservación, orientación',
    fuente: 'TX_DatosTasacion (UI sección B)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(167, 168, 169, 172, 174, 175),
    tag: '{d.cualitativa.emplazamiento}',
    ruta: 'cualitativa.emplazamiento',
    descripcion: 'Emplazamiento cualitativo: diseño, utilidad funcional, adosamiento, vista, iluminación',
    fuente: 'sin UI ni columnas',
    estado: 'HUECO',
    pId: 'P1-2',
  },
  {
    eIds: rango(176, 191),
    tag: '{d.cualitativa.constructivas}',
    ruta: 'cualitativa.constructivas',
    descripcion: 'Características constructivas y «otros» (16 filas materialidad/calidad/estado)',
    fuente: 'UI captura y descarta (6 CI-023 + 7 silenciosos) — sin columnas',
    estado: 'HUECO',
    pId: 'P1-1',
  },
  {
    eIds: rango(192, 196),
    tag: '{d.recintos.terminacionesPorRecinto[i].descripcion}',
    ruta: 'recintos.terminacionesPorRecinto[].descripcion',
    descripcion: 'Terminaciones por recinto (pavimento, muros, cielo) — 5 recintos',
    fuente: 'TX_TerminacionesPorRecinto (UI sección E)',
    estado: 'OK',
    pId: 'P2-3',
  },
  {
    eIds: rango(197, 201),
    tag: '{d.cualitativa.servicios}',
    ruta: 'cualitativa.servicios',
    descripcion: 'Servicios de la propiedad (alcantarillado, agua, electricidad, gas, otros)',
    fuente: 'sin UI ni columnas',
    estado: 'HUECO',
    pId: 'P1-2',
  },
  {
    eIds: rango(202, 206),
    tag: '{d.recintos.habitacionesPorNivel[i].cantidad}',
    ruta: 'recintos.habitacionesPorNivel[].cantidad',
    descripcion: 'Habitaciones por nivel (matriz 10 tipos × 4 niveles + totales)',
    fuente: 'TX_HabitacionesPorNivel (UI sección E)',
    estado: 'OK',
    pId: null,
  },
  {
    eIds: ids(207),
    tag: '{d.cualitativa.comodidades}',
    ruta: 'cualitativa.comodidades',
    descripcion: 'Comodidades (16 ítems SI/NO) — la UI captura 14 switches y descarta',
    fuente: 'sin tabla destino (TX_Amenities no existe)',
    estado: 'HUECO',
    pId: 'P1-1',
  },
  {
    eIds: ids(210, 211),
    tag: '{d.fotos.fotos[i].url}',
    ruta: 'fotos.fotos[].url',
    descripcion: '16 fotos de la propiedad en grillas 2×4 con rótulos',
    fuente: 'TX_Adjuntos (UI Fotos, mínimos dinámicos A-16 · categoría en descripcion, CI-051)',
    estado: 'OK',
    pId: 'P2-2',
  },
  {
    eIds: [...rango(214, 217), ...rango(220, 223)],
    tag: '{d.anexos.documentos[i].url}',
    ruta: 'anexos.documentos[].url',
    descripcion: 'Anexos 1-2: plano, esquema, info SII, rol-avalúo, permiso, recepción, no-expropiación',
    fuente: 'TX_Adjuntos.url_dropbox por tipo doc (adjuntos existen; inserción era manual)',
    estado: 'METLIFE_ONLY',
    pId: 'P0-1',
  },
  {
    eIds: ids(226, 227, 228),
    tag: '{d.terminales.valorComercialUf}',
    ruta: 'terminales.valorComercialUf',
    descripcion: 'Metadatos globales y cadena de consistencia numérica (sumas cuadran)',
    fuente: 'TX_Calculos (motor AT03, validación 0,00% vs oráculo)',
    estado: 'OK',
    pId: null,
  },
])
