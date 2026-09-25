/**
 * Ensamblador del informe — produce el `InformeContexto` completo por
 * solicitud. Módulo **server-only** (usa `AIRTABLE_TOKEN` vía
 * `lib/airtable-client`; jamás se importa desde un componente cliente).
 *
 * Tanda T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 2.
 *
 * ## Extiende `construirInforme`, no lo reescribe
 *
 * El modelo canónico (`lib/tasador/lectura-informe.ts`, 8 bloques §10.1)
 * sigue siendo el productor de bloques; acá se **suma** lo que el informe
 * final necesita y el canónico no trae:
 *
 * - `TX_Calculos` (los 13 terminales del motor AT03: una fila por fórmula,
 *   `variable_output` → `resultado`).
 * - `H_PreciosUF` (UF y dólar del día de la visita — «1UF=» / «1US$=»).
 * - `TX_Ampliaciones` · `TX_HabitacionesPorNivel` · `TX_TerminacionesPorRecinto`
 *   (sección E, mismo lector `filasDeSolicitud` que usa `/datos`).
 * - Los nombres de los Links (`cliente`, `comuna`, `tasador`, `visador`,
 *   `tipo_informe`, `tipo_propiedad`): la REST API devuelve record IDs, y el
 *   informe imprime nombres. Se resuelven con `getRecord` contra el maestro
 *   (primary field `nombre` en los seis) — mismo patrón que
 *   `lib/dropbox-path-contexto.ts` usa con `M_Clientes`. Un maestro caído
 *   degrada a `null` + hueco, nunca tumba el informe.
 *
 * ## Relecturas deliberadas (y por qué)
 *
 * `construirInforme` lee `TX_DatosTasacion`, `TX_ItemsCuadroValoracion` y
 * `TX_Adjuntos` pero **no expone las filas crudas** — sólo sus proyecciones
 * por bloque. Este módulo las relee porque necesita campos que los bloques no
 * proyectan:
 *
 * - `TX_DatosTasacion`: `arriendo_bruto_mensual_clp`/`gasto_anual_clp` (los
 *   campos que lee el motor — CI-023 §4), `velocidad_venta_estimada`,
 *   `tipo_zona_descripcion`, `pisos`, `orientacion`, `lat`/`long`.
 * - `TX_ItemsCuadroValoracion`: **hallazgo de esta tanda** — las filas que
 *   escribe el motor pueblan la pareja nueva (`nombre_item` · `uf_m2_unitario`
 *   · fórmula `valor_uf`) y dejan vacía la vieja (`descripcion` ·
 *   `uf_m2_aplicado` · `uf_total_item`) que lee el canónico; con 0066 el
 *   `totalUf` canónico daría 0. Acá cada campo cae de la vieja a la nueva
 *   (misma técnica que `version_doc`/`version` en `TX_DocumentosGenerados`).
 * - `TX_Adjuntos`: los anexos son los adjuntos **no**-foto y el bloque 7 sólo
 *   proyecta fotos.
 *
 * ## Campos calculados — los únicos, y con permiso
 *
 * `tasacionUfM2 = valorComercialUf / supConstruccionM2` y
 * `tasacionVsPct = (tasacionUfM2 / promedioUfM2 − 1) × 100` cablean la fila
 * TASACIÓN que pintaba «—» (F-2), como puente hasta que T2 los persista en
 * el motor (P1-8). Lo manda el ROADMAP §3 bloque 2. Todo lo demás se lee, no
 * se computa. La aritmética vive en `lib/informe/fila-tasacion.ts` (RO-05:
 * una sola fuente por número — la comparte el preview del tasador).
 */

import { getRecord, listRecords } from '@/lib/airtable-client'
import { autorizarSolicitud, type ResultadoGuard } from '@/lib/tasador/auth-guard'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { filasDeSolicitud } from '@/lib/tasador/lectura-datos'
import { construirInforme } from '@/lib/tasador/lectura-informe'
import { filaTasacionUfM2, filaTasacionVsPct } from './fila-tasacion'
import type {
  ComparablesInforme,
  CualitativaInforme,
  FilaComparableInforme,
  FotosInforme,
  Hueco,
  InformeContexto,
} from './tipos'

type Fields = Record<string, unknown>

/**
 * Maestros para resolver nombres de Links. Los seis tienen `nombre` como
 * primary field (verificado vía MCP el 25-sep-2026). TABLE_IDs de
 * `docs/schema-airtable.md` §1 / CLAUDE.md — ninguno se inventó.
 */
const MAESTROS = Object.freeze({
  clientes: 'tblpK7AcYBMH93apK',
  comunas: 'tblyggAfQfq682XHK',
  tasadores: TABLE_IDS.tasadores,
  visadores: 'tbludtgDtHWvt0Q3D',
  tiposInforme: 'tblOcsdiwxQLfD178',
  tiposPropiedad: 'tbl8rxZA14xFIBGU6',
} as const)

/** `null` para ausente. Nunca `0` — misma regla que el modelo canónico. */
function numeroONull(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function texto(valor: unknown): string {
  return valor === null || valor === undefined ? '' : String(valor)
}

/**
 * Resuelve el nombre de un Link (`multipleRecordLinks` → primer record ID)
 * contra su maestro. Degrada a `null` ante link vacío, registro inexistente,
 * `nombre` vacío o fallo de red: el nombre de un maestro nunca es motivo para
 * romper el ensamblado — el hueco queda declarado por el llamador.
 */
async function nombreDeLink(tableId: string, link: unknown): Promise<string | null> {
  const id = Array.isArray(link) ? link[0] : null
  if (typeof id !== 'string' || !id) return null
  try {
    const registro = await getRecord<{ nombre?: string }>(tableId, id)
    const nombre = registro?.fields.nombre
    return typeof nombre === 'string' && nombre.trim() !== '' ? nombre : null
  } catch (err) {
    console.error('[ensamblador] maestro irresoluble', tableId, id, err)
    return null
  }
}

/**
 * Huecos estructurales: datos del gold master **sin productor** hoy,
 * independientes del caso. Se declaran siempre — un caso con el dato poblado
 * a mano (p. ej. el dólar del seed 13-abr) no cierra el hueco: lo cierra el
 * escritor (cron, UI, IF-04…). E-ids y P-ids de la auditoría PARIDAD /
 * ROADMAP.
 */
const HUECOS_ESTRUCTURALES: readonly Hueco[] = Object.freeze([
  {
    ruta: 'textosIA.sintesisPropiedad',
    eIds: ['E-59', 'E-60'],
    pId: 'P0-2',
    motivo: 'Textos redactados sin productor (Claude RN-25/RF-32 en SC09 · T5)',
  },
  {
    ruta: 'textosIA.descripcionSector',
    eIds: ['E-59', 'E-60'],
    pId: 'P0-2',
    motivo: 'Textos redactados sin productor (Claude RN-25/RF-32 en SC09 · T5)',
  },
  {
    ruta: 'textosIA.textoExpropiacion',
    eIds: ['E-57'],
    pId: 'P1-1',
    motivo: 'Plantilla con variables; falta la columna afecto_expropiacion',
  },
  {
    ruta: 'cualitativa.detallePropiedad',
    eIds: ['E-37', 'E-39', 'E-41', 'E-45', 'E-52', 'E-56', 'E-54', 'E-55'],
    pId: 'P1-1',
    motivo: 'La UI captura y descarta (CI-023): sin columnas destino',
  },
  {
    ruta: 'cualitativa.constructivas',
    eIds: ['E-176..E-191'],
    pId: 'P1-1',
    motivo: 'La UI captura y descarta (6 CI-023 + 7 silenciosos): sin columnas',
  },
  {
    ruta: 'cualitativa.comodidades',
    eIds: ['E-207'],
    pId: 'P1-1',
    motivo: '14 switches capturados y descartados; TX_Amenities no existe',
  },
  {
    ruta: 'cualitativa.normativa',
    eIds: ['E-125..E-140'],
    pId: 'P1-2',
    motivo: 'Sin catálogo normativo poblado ni UI (rescate M_Zonificacion en T4)',
  },
  {
    ruta: 'cualitativa.sector',
    eIds: ['E-141..E-146', 'E-148..E-157'],
    pId: 'P1-2',
    motivo: 'Mercado y sector sin UI ni columnas',
  },
  {
    ruta: 'cualitativa.geometriaTerreno',
    eIds: ['E-159..E-165'],
    pId: 'P1-2',
    motivo: 'Forma/pendiente/frente/deslindes sin UI ni columnas',
  },
  {
    ruta: 'cualitativa.emplazamiento',
    eIds: ['E-167..E-175'],
    pId: 'P1-2',
    motivo: 'Emplazamiento cualitativo sin UI ni columnas',
  },
  {
    ruta: 'cualitativa.servicios',
    eIds: ['E-197..E-201'],
    pId: 'P1-2',
    motivo: 'Servicios de la propiedad sin UI ni columnas',
  },
  {
    ruta: 'terminales.usdDia',
    eIds: ['E-103'],
    pId: 'P1-3',
    motivo: 'tipo_cambio_usd sin escritor automático (el cron UF no lo escribe; el valor de 0066 es seed manual)',
  },
  {
    ruta: 'mapa.staticMapUrl',
    eIds: ['E-120'],
    pId: 'P1-4',
    motivo: 'Google Static Maps sin implementación ni API key',
  },
  {
    ruta: 'clienteInforme.logoUrl',
    eIds: ['E-02'],
    pId: 'P1-5',
    motivo: 'C_VariablesCliente sin clientes reales (H9 — la portada MET salió con marca Austral)',
  },
  {
    ruta: 'clienteInforme.nombreRevisor',
    eIds: ['E-114'],
    pId: 'P1-5',
    motivo: 'C_VariablesCliente.nombre_revisor sin valor (H9)',
  },
  {
    ruta: 'comparablesInforme.promedioUfM2',
    eIds: ['E-66..E-68', 'E-73..E-75'],
    pId: 'P1-8',
    motivo: 'Promedios y fila TASACIÓN calculados por el ensamblador, sin persistencia (puente hasta T2)',
  },
  {
    ruta: 'partes.tasador.firmaUrl',
    eIds: ['E-111'],
    pId: 'P1-9',
    motivo: 'Imagen de firma sin mecanismo en M_Tasadores',
  },
  {
    ruta: 'partes.fechaVisado',
    eIds: ['E-113'],
    pId: 'P1-9',
    motivo: 'IF-04 (visación) no existe',
  },
  {
    ruta: 'propiedad.vidaUtil',
    eIds: ['E-48', 'E-76', 'E-81'],
    pId: 'P1-9',
    motivo: 'F_VidaUtil existe pero está fuera de la regla v32',
  },
])

/** La rama de fallo del guard — lo que `desdeGuard` traduce a HTTP. */
type GuardFallido = Extract<ResultadoGuard, { ok: false }>

export type ResultadoInformeContexto =
  | { ok: false; guard: GuardFallido }
  | { ok: true; contexto: InformeContexto }

/**
 * Productor puro (sin guard): dada la solicitud ya autorizada, ensambla el
 * contexto completo. El test lo ejercita sustituyendo sólo `listRecords` y
 * `getRecord` — mismo candado que `construirInforme`.
 */
export async function construirInformeContexto(
  id: string,
  s: Fields,
): Promise<InformeContexto> {
  const codigo = texto(s.codigo_solicitud)
  const fechaVisita = texto(s.fecha_visita)

  const [informe, datos, items, adjuntos, ampliaciones, habitaciones, terminaciones, calculos, filasUf] =
    await Promise.all([
      construirInforme(id, s),
      filasDeSolicitud<Fields>(TABLE_IDS.datosTasacion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.itemsCuadroValoracion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.adjuntos, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.ampliaciones, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.habitacionesPorNivel, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.terminacionesPorRecinto, codigo),
      /* TX_Calculos no tiene campo `solicitud` como primary evaluable estable
         para el filtro genérico: se filtra por `solicitud_codigo`, el campo de
         texto que el motor escribe en cada fila. */
      codigo
        ? listRecords<Fields>(TABLE_IDS.calculos, {
            filterByFormula: `{solicitud_codigo}="${codigo.replace(/"/g, '\\"')}"`,
          })
        : Promise.resolve([]),
      /* H_PreciosUF: la fila del día de la visita — mismo lookup que hace el
         guard H3 del motor. Sin fecha de visita no se consulta. */
      fechaVisita
        ? listRecords<Fields>(TABLE_IDS.preciosUf, {
            filterByFormula: `{fecha}="${fechaVisita.replace(/"/g, '\\"')}"`,
          })
        : Promise.resolve([]),
    ])

  const [clienteNombre, comunaNombre, tasadorNombre, visadorNombre, objetivoNombre, tipoPropiedadNombre] =
    await Promise.all([
      nombreDeLink(MAESTROS.clientes, s.cliente),
      nombreDeLink(MAESTROS.comunas, s.comuna),
      nombreDeLink(MAESTROS.tasadores, s.tasador),
      nombreDeLink(MAESTROS.visadores, s.visador),
      nombreDeLink(MAESTROS.tiposInforme, s.tipo_informe),
      nombreDeLink(MAESTROS.tiposPropiedad, s.tipo_propiedad),
    ])

  const d = datos[0]?.fields ?? {}
  const uf = filasUf[0]?.fields ?? {}

  /* --- Terminales: variable_output → resultado ----------------------- */
  const terminal = new Map<string, number | null>()
  for (const fila of calculos) {
    const variable = texto(fila.fields.variable_output)
    if (variable) terminal.set(variable, numeroONull(fila.fields.resultado))
  }
  const t = (variable: string): number | null => terminal.get(variable) ?? null

  /* --- Cuadro: pareja vieja con caída a la nueva (ver docblock) ------ */
  const itemsCuadro = items.map((i) => {
    const f = i.fields
    return {
      id: i.id,
      orden: numeroONull(f.orden) ?? numeroONull(f.item_id),
      descripcion: texto(f.descripcion) || texto(f.nombre_item),
      tipoItem: texto(f.tipo_item),
      supM2: numeroONull(f.sup_m2),
      ufM2Aplicado: numeroONull(f.uf_m2_aplicado) ?? numeroONull(f.uf_m2_unitario),
      factorAplicado: numeroONull(f.factor_aplicado),
      ufTotalItem: numeroONull(f.uf_total_item) ?? numeroONull(f.valor_uf),
      aportaAGarantia: Boolean(f.aporta_a_garantia),
      situacionMunicipal: texto(f.situacion_municipal),
    }
  })
  const totalUf =
    itemsCuadro.length > 0
      ? itemsCuadro.reduce((suma, i) => suma + (i.ufTotalItem ?? 0), 0)
      : null

  /* --- Comparables: base canónica + fila TASACIÓN calculada (F-2) ---- */
  const bloqueComparables = informe.bloques.find((b) => b.id === 'comparables')!
    .datos as {
    comparables: FilaComparableInforme[]
    promedioUfM2: number | null
    usadosEnPromedio: number
    cumpleMinimo: boolean
  }
  const valorComercialUf =
    t('valor_comercial_uf') ?? informe.valorDestacado.valorUf
  const supConstruccionM2 = numeroONull(d.sup_construccion_m2)
  const tasacionUfM2 = filaTasacionUfM2(valorComercialUf, supConstruccionM2)
  const tasacionVsPct = filaTasacionVsPct(
    tasacionUfM2,
    bloqueComparables.promedioUfM2,
  )

  const comparablesInforme: ComparablesInforme = {
    filas: bloqueComparables.comparables,
    promedioUfM2: bloqueComparables.promedioUfM2,
    usadosEnPromedio: bloqueComparables.usadosEnPromedio,
    cumpleMinimo: bloqueComparables.cumpleMinimo,
    tasacionUfM2,
    tasacionVsPct,
  }

  /* --- Fotos (bloque 7 canónico) y anexos (adjuntos no-foto) --------- */
  const fotos = informe.bloques.find((b) => b.id === 'fotografico')!
    .datos as unknown as FotosInforme
  const anexos = {
    documentos: adjuntos
      .filter((a) => !texto(a.fields.tipo_adjunto).startsWith('foto'))
      .map((a) => ({
        id: a.id,
        nombre: texto(a.fields.nombre_archivo),
        tipo: texto(a.fields.tipo_adjunto),
        url: texto(a.fields.url_dropbox),
      })),
  }

  /* --- Cualitativa: todo null hoy (P1-1/P1-2) ------------------------ */
  const cualitativa: CualitativaInforme = {
    normativa: null,
    sector: null,
    geometriaTerreno: null,
    emplazamiento: null,
    constructivas: null,
    servicios: null,
    comodidades: null,
    detallePropiedad: null,
  }

  /* --- Huecos: estructurales + los dependientes del caso ------------- */
  const huecos: Hueco[] = [...HUECOS_ESTRUCTURALES]
  if (clienteNombre === null) {
    huecos.push({
      ruta: 'clienteInforme.nombre',
      eIds: ['E-05'],
      pId: 'P0-4',
      motivo: 'Link cliente vacío o maestro irresoluble (dato maestro incompleto)',
    })
  }

  return {
    meta: {
      codigo,
      codigoExt: texto(s.codigo_ext),
      nOperacionCliente: numeroONull(s.n_operacion_cliente),
      numeroSolicitudCliente: texto(s.numero_solicitud) || null,
      estado: texto(s.estado),
      version: informe.versionVigente?.version ?? null,
      fechaEmision: informe.versionVigente?.generadoEn || null,
    },
    clienteInforme: {
      nombre: clienteNombre,
      logoUrl: null,
      nombreRevisor: null,
    },
    partes: {
      propietario: texto(s.cliente_final_nombre),
      rut: texto(s.cliente_final_rut),
      ejecutivo: texto(s.ejecutivo_solicitante) || null,
      tasador: { nombre: tasadorNombre, firmaUrl: null },
      visador: { nombre: visadorNombre },
      fechaVisita,
      fechaVisado: null,
    },
    propiedad: {
      direccion: texto(s.direccion),
      comuna: comunaNombre,
      region: texto(s.region),
      tipoPropiedad: tipoPropiedadNombre,
      objetivo: objetivoNombre,
      nuevoUsado: texto(s.tipo_propiedad_nuevo_usado),
      proyectoCondominio: texto(s.proyecto_condominio),
      supTerrenoM2: numeroONull(d.sup_terreno_m2),
      supConstruccionM2,
      supPrimerPisoM2: numeroONull(d.sup_primer_piso_m2),
      supConstruidaTotal: numeroONull(d.sup_construida_total),
      anioConstruccion: numeroONull(d.anio_construccion),
      materialPredominante: texto(d.material_predominante),
      calidadConstruccion: numeroONull(d.calidad_construccion),
      estadoConservacion: texto(d.estado_conservacion),
      agrupacion: texto(d.agrupacion_propiedad),
      orientacion: texto(d.orientacion),
      pisos: numeroONull(d.pisos),
      dormitorios: numeroONull(d.dormitorios),
      banos: numeroONull(d.banos),
      estacionamientos: numeroONull(d.estacionamientos),
      bodegas: numeroONull(d.bodegas),
      dfl2: texto(d.dfl2),
      velocidadVentaEstimada: texto(d.velocidad_venta_estimada),
      tipoZonaDescripcion: texto(d.tipo_zona_descripcion),
      vidaUtil: numeroONull(s.vida_util_override),
    },
    sii: informe.datosSii,
    cuadro: { items: itemsCuadro, totalUf },
    terminales: {
      valorComercialUf,
      valorComercialClp: t('valor_comercial_clp'),
      valorReposicionUf: t('valor_reposicion_uf'),
      valorReposicionClp: t('valor_reposicion_clp'),
      seguroIncendioUf: t('seguro_incendio_uf'),
      seguroIncendioClp: t('seguro_incendio_clp'),
      avaluoFiscalUf: t('avaluo_fiscal_uf'),
      valorRemateUf: t('valor_remate_uf'),
      valorRemateClp: t('valor_remate_clp'),
      valorLiquidacionUf: t('valor_liquidacion_uf'),
      valorLiquidacionClp: t('valor_liquidacion_clp'),
      rentaPerpetuaClp: t('renta_perpetua_clp'),
      ingresoLiquidoAnualClp: t('ingreso_liquido_anual_clp'),
      ufDia:
        numeroONull(uf.valor_clp) ??
        numeroONull(s.uf_dia_visita) ??
        numeroONull(d.uf_dia_visita),
      usdDia: numeroONull(uf.tipo_cambio_usd),
      fechaUf: filasUf.length > 0 ? texto(uf.fecha) || fechaVisita : null,
    },
    comparablesInforme,
    rentabilidad: {
      /* Los campos *_clp son los que lee el motor; la pareja sin sufijo
         (`arriendo_mensual`/`gasto_anual`) alimenta la fórmula legacy de la
         tabla (CI-023 §4). Se prefiere la del motor y se cae a la otra. */
      arriendoBrutoMensualClp:
        numeroONull(d.arriendo_bruto_mensual_clp) ?? numeroONull(d.arriendo_mensual),
      gastoAnualClp: numeroONull(d.gasto_anual_clp) ?? numeroONull(d.gasto_anual),
      ingresoLiquidoAnualClp: t('ingreso_liquido_anual_clp'),
      rentaPerpetuaClp: t('renta_perpetua_clp'),
      tasaCapRate: informe.valorDestacado.capRate,
      arriendoUfMes: null,
    },
    textosIA: {
      sintesisPropiedad: null,
      descripcionSector: null,
      textoExpropiacion: null,
    },
    cualitativa,
    recintos: {
      ampliaciones: ampliaciones.map((a) => ({
        id: a.id,
        descripcion: texto(a.fields.descripcion),
        supM2: numeroONull(a.fields.sup_m2),
        annoRegularizacion: numeroONull(a.fields.anno_regularizacion),
      })),
      habitacionesPorNivel: habitaciones.map((h) => ({
        id: h.id,
        nivel: texto(h.fields.nivel),
        tipoRecinto: texto(h.fields.tipo_recinto),
        cantidad: numeroONull(h.fields.cantidad),
      })),
      terminacionesPorRecinto: terminaciones.map((r) => ({
        id: r.id,
        nombre: texto(r.fields.nombre),
        categoria: texto(r.fields.categoria),
        descripcion: texto(r.fields.descripcion),
        calidad: texto(r.fields.calidad),
      })),
    },
    fotos,
    anexos,
    mapa: {
      staticMapUrl: null,
      lat: numeroONull(d.lat),
      long: numeroONull(d.long),
    },
    legales: informe.observaciones.antecedentesLegales,
    huecos,
    canonico: informe,
  }
}

/**
 * Lectura autorizada del contexto: guard RF-09 (`clerk_user_id ===
 * TX_Solicitudes.tasador`) y delegación en `construirInformeContexto` —
 * mismo patrón que `lecturaInforme`. El route traduce `{ ok: false }` con
 * `desdeGuard`.
 */
export async function lecturaInformeContexto(
  id: string,
): Promise<ResultadoInformeContexto> {
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return { ok: false, guard }
  const contexto = await construirInformeContexto(id, guard.fields as Fields)
  return { ok: true, contexto }
}
