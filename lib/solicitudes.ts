import { listRecords, AirtableError } from '@/lib/airtable-client'
import {
  ESTADO_LABELS,
  PRIORIDAD,
  regionDeComuna,
  type EstadoSolicitud,
  type Prioridad,
  type Solicitud,
} from '@/lib/console-data'

// TX_Solicitudes verified via MCP 2026-07-04
export const TX_SOLICITUDES = 'tblaHTyMHYfmy7Fg6'

// AUTH_Usuarios verified via MCP 2026-07-07 (RF-52)
const AUTH_USUARIOS = 'tblbX3hPD2uhqhl5v'

// Enum de vistas reconciliado a las 5 del plan v1.9 (P5). Se eliminaron
// 'reasignar' (REGLA A quita la reasignación) y 'pausadas' (estado inexistente
// en el enum). 'mi_cartera' reemplaza al antiguo 'cartera'; 'todas' al 'activas'.
export type Vista = 'mi_cartera' | 'sla_riesgo' | 'por_asignar' | 'aprobadas' | 'todas'

export const VISTAS_VALIDAS: Vista[] = [
  'mi_cartera',
  'sla_riesgo',
  'por_asignar',
  'aprobadas',
  'todas',
]

export const VISTA_DEFAULT: Vista = 'todas'

export type SlaFiltro = 'verde' | 'ambar' | 'rojo'

export const SLA_FILTROS_VALIDOS: SlaFiltro[] = ['verde', 'ambar', 'rojo']

/**
 * Traduce el vocabulario de la UI al que emite realmente la fórmula
 * `semaforo_sla` de Airtable. Ver la nota extensa en `buildVistaFormula`.
 * Una solicitud ya entregada emite "… Entregado" y no cae en ninguno de los
 * tres: filtrar por `verde` no la devuelve, que es el comportamiento deseado
 * (verde = en plazo y viva, no = cerrada sin incidencias).
 */
const SEMAFORO_POR_SLA: Record<SlaFiltro, string> = {
  verde: 'OK',
  ambar: 'EN RIESGO',
  rojo: 'VENCIDO',
}

// D-07: filtros de FiltrosBar persistidos como URL params (RF-05 Subtarea C · P5).
export interface SolicitudesFiltros {
  cliente?: string
  estado?: string
  sla?: string
  desde?: string // YYYY-MM-DD
  hasta?: string // YYYY-MM-DD
  /** Nombre del tasador, o 'sin_asignar' para las que no tienen tasador. */
  tasador?: string
  prioridad?: string
  /** Búsqueda: código VP, RUT del comprador o dirección. */
  q?: string
}

// Orden de la lista (P5). Mapea a un sort de Airtable.
export type OrdenParam = 'sla_desc' | 'sla_asc' | 'fecha_solicitud_desc' | 'prioridad'

export const ORDENES_VALIDOS: OrdenParam[] = [
  'sla_desc',
  'sla_asc',
  'fecha_solicitud_desc',
  'prioridad',
]

function escapeFormulaString(value: string): string {
  return value.replace(/"/g, '\\"')
}

/**
 * `ejecutivaNombre`: el *primary field* (nombre) del registro de AUTH_Usuarios
 * ya resuelto — NUNCA el clerk_user_id ni el recordId. Ver E-018/E-019 en
 * docs/aprendizajes.md: un campo Link, dentro de una fórmula de Airtable, se
 * evalúa contra el primary field del registro vinculado, no contra su
 * recordId (verificado en vivo). La resolución clerk_user_id → nombre vive en
 * `resolveEjecutiva()`, más abajo.
 */
function buildVistaFormula(vista: Vista, ejecutivaNombre?: string): string {
  switch (vista) {
    case 'todas':
      return 'TRUE()'
    case 'sla_riesgo':
      // `semaforo_sla` NO emite "rojo"/"ámbar"/"verde": eso es lo que documenta
      // `schema-airtable.md:160`, no lo que calcula la fórmula real. Verificada
      // vía `get_table_schema` el 29-jul-2026, emite cuatro literales con emoji
      // de prefijo — "… Entregado", "… VENCIDO", "… EN RIESGO", "… OK" — y el
      // emoji llega mangleado a "?" según el cliente que lea el campo. Por eso
      // se busca la subcadena y no se compara por igualdad: el prefijo no es
      // confiable, la palabra sí. Ninguno de los cuatro literales contiene a
      // otro como subcadena, así que no hay solapamiento.
      // ⚠ Deuda: la fórmula de Airtable no se tocó en esta tanda (D-01).
      return 'OR(FIND("VENCIDO",{semaforo_sla})>0,FIND("EN RIESGO",{semaforo_sla})>0)'
    case 'por_asignar':
      // Sin tasador asignado y en un estado que aún admite asignación.
      return 'AND(OR({estado}="creada",{estado}="requiere_atencion"),ARRAYJOIN({tasador})="")'
    case 'aprobadas':
      return '{estado}="aprobada"'
    case 'mi_cartera':
      return `FIND("${escapeFormulaString(ejecutivaNombre ?? '')}", ARRAYJOIN({ejecutiva_asignada}))`
  }
}

const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/

// Cada valor se valida contra una lista cerrada antes de interpolarse en la
// fórmula Airtable — nunca se inyecta texto libre del usuario (RF-05 D-07).
function buildFiltrosClauses(filtros?: SolicitudesFiltros): string[] {
  if (!filtros) return []
  const clauses: string[] = []

  // El cliente ya no se valida contra una lista cerrada en código: la lista
  // vive en `M_Clientes` y tiene ~90 filas que cambian sin tocar el repo. La
  // protección contra inyección es el escape, no el allowlist — mismo criterio
  // que `mi_cartera` con el nombre de la ejecutiva.
  if (filtros.cliente) {
    clauses.push(`{cliente}="${escapeFormulaString(filtros.cliente)}"`)
  }
  if (filtros.estado && filtros.estado in ESTADO_LABELS) {
    clauses.push(`{estado}="${filtros.estado}"`)
  }
  if (filtros.sla && SLA_FILTROS_VALIDOS.includes(filtros.sla as SlaFiltro)) {
    // Mismo desajuste de vocabulario que `sla_riesgo`, arriba: la UI habla
    // verde/ámbar/rojo y la fórmula emite OK/EN RIESGO/VENCIDO. La traducción
    // vive aquí y no en la UI para que el contrato de la URL (`?sla=rojo`) no
    // dependa de cómo esté redactada la fórmula de Airtable hoy.
    clauses.push(`FIND("${SEMAFORO_POR_SLA[filtros.sla as SlaFiltro]}",{semaforo_sla})>0`)
  }
  if (filtros.desde && FECHA_VALIDA.test(filtros.desde)) {
    clauses.push(`NOT(IS_BEFORE({fecha_solicitud},DATETIME_PARSE("${filtros.desde}","YYYY-MM-DD")))`)
  }
  if (filtros.hasta && FECHA_VALIDA.test(filtros.hasta)) {
    // `fecha_solicitud` es **dateTime**, no date (divergencia §19.2 del schema).
    // Comparar contra `DATETIME_PARSE(hasta)` mide contra la medianoche de ese
    // día, así que cualquier solicitud creada durante el propio día `hasta`
    // quedaba excluida — el caso más común es "hasta hoy", que escondía justo
    // las altas recientes. Se compara contra la medianoche del día siguiente.
    clauses.push(
      `IS_BEFORE({fecha_solicitud},DATEADD(DATETIME_PARSE("${filtros.hasta}","YYYY-MM-DD"),1,"days"))`
    )
  }
  if (filtros.prioridad && (PRIORIDAD as readonly string[]).includes(filtros.prioridad)) {
    clauses.push(`{prioridad}="${filtros.prioridad}"`)
  }
  if (filtros.tasador) {
    // 'sin_asignar' = sin tasador; cualquier otro valor = por nombre. Un campo
    // Link, dentro de una fórmula, se evalúa contra su primary field (E-018).
    clauses.push(
      filtros.tasador === 'sin_asignar'
        ? 'ARRAYJOIN({tasador})=""'
        : `FIND("${escapeFormulaString(filtros.tasador)}",ARRAYJOIN({tasador}))`
    )
  }
  if (filtros.q && filtros.q.trim() !== '') {
    // Búsqueda case-insensitive sobre código VP, RUT del comprador y dirección.
    const q = escapeFormulaString(filtros.q.trim().toUpperCase())
    clauses.push(
      `OR(FIND("${q}",UPPER({codigo_ext})),FIND("${q}",UPPER({cliente_final_rut})),FIND("${q}",UPPER({direccion})))`
    )
  }

  return clauses
}

export function buildFormula(vista: Vista, ejecutivaNombre?: string, filtros?: SolicitudesFiltros): string {
  const vistaFormula = buildVistaFormula(vista, ejecutivaNombre)
  const filtrosClauses = buildFiltrosClauses(filtros)
  if (filtrosClauses.length === 0) return vistaFormula
  return `AND(${vistaFormula},${filtrosClauses.join(',')})`
}

export interface FetchResult {
  data: Solicitud[]
  degraded?: boolean
  /** "Mi cartera" sin match en AUTH_Usuarios para el clerk_user_id de la sesión. */
  motivo?: 'ejecutiva_no_encontrada'
}

interface EjecutivaResuelta {
  recordId: string
  nombre: string
}

const EJECUTIVA_CACHE_TTL_MS = 5 * 60 * 1000
// Cache en memoria de proceso, sin persistencia — se pierde en cada redeploy/restart.
const ejecutivaCache = new Map<string, { data: EjecutivaResuelta | null; expiresAt: number }>()

/**
 * Resuelve un clerk_user_id (ej. `user_3GBF...`) al registro de AUTH_Usuarios
 * correspondiente. Cachea en memoria de proceso por 5 min. `null` si no hay
 * fila con ese `clerk_user_id` (caso legítimo: usuario nunca sincronizado).
 */
export async function resolveEjecutiva(clerkUserId: string): Promise<EjecutivaResuelta | null> {
  const cached = ejecutivaCache.get(clerkUserId)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  const records = await listRecords<{ nombre?: string }>(AUTH_USUARIOS, {
    filterByFormula: `{clerk_user_id}="${escapeFormulaString(clerkUserId)}"`,
    fields: ['nombre'],
  })
  const data: EjecutivaResuelta | null = records[0]
    ? { recordId: records[0].id, nombre: records[0].fields.nombre ?? '' }
    : null
  ejecutivaCache.set(clerkUserId, { data, expiresAt: Date.now() + EJECUTIVA_CACHE_TTL_MS })
  return data
}

// Airtable returns all values as strings when cellFormat=string.
// Linked record fields return comma-separated primary field values.
type RawFields = Record<string, string | undefined>

export const SOLICITUD_FIELDS: string[] = [
  'codigo_ext',
  'estado',
  'prioridad',
  'cliente',
  'tasador',
  'visador',
  'comuna',
  'tipo_informe',
  'tipo_propiedad',
  'banco',
  'producto',
  'fecha_solicitud',
  'fecha_limite_entrega',
  'fecha_visita_programada',
  'observaciones_internas',
  // Dos campos distintos que la consola confundía en uno solo (E-089):
  // `canal_contacto_original` es por dónde contactó el cliente (whatsapp ·
  // email · telefono · …) y es lo que la Ejecutiva edita; `origen_canal` es por
  // dónde entró la fila al sistema (ingreso_manual · tally_externo · …) y es de
  // sólo lectura.
  'canal_contacto_original',
  'origen_canal',
  'ejecutivo_solicitante',
  'cliente_final_nombre',
  'cliente_final_rut',
  'semaforo_sla',
  'direccion',
  'monto_estimado_uf',
  'solicitante_telefono',
  'email_contacto',

  // ── Ampliación Tanda D-02 (29-jul-2026) ─────────────────────────────────
  // El detalle mostraba 25 campos de los ~55 operacionales de TX_Solicitudes;
  // el resto lo rellenaba `mapRecord` con '—', [] o constantes, así que era
  // invisible en pantalla **y** inaccesible para la edición. Se excluyen a
  // propósito los ~17 `*_override` (motor AT01–AT10, fuera de CU-002) y los 8
  // `fin_*_uf` (duplicado histórico de `financiero_*_uf`).
  'n_operacion_cliente',
  // ⚠ El nombre real termina en espacio (D-08, verificado vía MCP 29-jul-2026).
  // Sin el espacio Airtable responde 422 "Unknown field names".
  'sucursal_originadora ',
  'correo_cliente_ref',
  'nro_interno',
  'numero_solicitud',
  'rol_sii',
  'notas',
  'solicitante_nombre',
  'profesion_solicitante',
  'banco_financista',
  'origen_dato',
  'origen_direccion',
  'tipo_cliente_origen',
  'modo_creacion',
  'tipo_propiedad_nuevo_usado',
  'estado_conservacion',
  'proyecto_condominio',
  'ejecutivo_formalizador',
  'email_thread_id',
  'region',
  'velocidad_venta',
  'sup_terreno_m2',
  'sup_construccion_m2',
  'anio_construccion',
  'valor_comercial_uf',
  'avaluo_fiscal_clp',
  'comision_ov',
  'uf_dia_visita',
  'fecha_asignacion_ts',
  'fecha_visita',
  'fecha_entrega',
  'fecha_cierre',
  'fecha_creacion',
  'ultima_modificacion',
  'dias_desde_solicitud',
  'pdf_final_url',
  'tiene_pendientes_visador',
  // Bloque financiero (`financiero_*_uf`), que el tipo `Solicitud` declaraba
  // como `financiero?` y `mapRecord` nunca poblaba.
  'financiero_valor_total_uf',
  'financiero_subsidio_uf',
  'financiero_ahorro_uf',
  'financiero_mutuo_uf',
  'financiero_pago_contado_uf',
  'financiero_bono_captacion_uf',
  'financiero_bono_integracion_uf',
  'financiero_precio_venta_uf',
  // Bloque vendedor, que `mapRecord` devolvía hardcodeado a '—'.
  'vendedor_razon_social_o_nombre',
  'vendedor_rut',
  'vendedor_nombre',
  'vendedor_email',
  'vendedor_telefono',
  'vendedor_tipo_persona',
  'vendedor_origen_dato',
]

function parseDate(str: string | undefined): Date | null {
  if (!str) return null
  // ISO: 2026-07-05T...
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(`${str.substring(0, 10)}T12:00:00`)
    return isNaN(d.getTime()) ? null : d
  }
  // DD/MM/YYYY (es-CL locale from Airtable cellFormat=string)
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

function formatDisplay(str: string | undefined, fallback = '—'): string {
  if (!str) return fallback
  const d = parseDate(str)
  if (!d) return str
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function computeSlaDias(fechaLimite: string | undefined, semaforo: string | undefined): number {
  const limit = parseDate(fechaLimite)
  if (limit) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.round((limit.getTime() - today.getTime()) / 86_400_000)
  }
  // Fallback cuando `fecha_limite_entrega` no es parseable — que es el caso de
  // toda alta nueva, porque vale #ERROR (ver la nota de `ordenToSort`). Se
  // deriva del semáforo, con los literales que la fórmula emite de verdad
  // ("… VENCIDO" / "… EN RIESGO" / "… OK"), no con "rojo"/"ámbar", que no
  // existen y hacían caer siempre en el `return 3` (Tanda D-01/D-02).
  const s = semaforo ?? ''
  if (s.includes('VENCIDO')) return -1
  if (s.includes('EN RIESGO')) return 2
  return 3
}

function formatMontoUf(str: string | undefined): string {
  if (!str) return '—'
  const n = Number(str)
  return Number.isNaN(n) ? `${str} UF` : `${n.toLocaleString('es-CL')} UF`
}

/**
 * Con `cellFormat: 'string'` **todo** llega como texto, incluidos los campos
 * `number`. Devuelve `undefined` —y no 0— cuando el campo está vacío o no es
 * numérico: un 0 fabricado se mostraría como un valor real en el detalle.
 * Tolera el separador de miles de es-CL ("1.234,5").
 */
function num(str: string | undefined): number | undefined {
  if (!str || str.trim() === '') return undefined
  const limpio = str.trim().replace(/\./g, '').replace(',', '.')
  const n = Number(limpio)
  return Number.isFinite(n) ? n : undefined
}

/** Checkbox en `cellFormat: 'string'` llega como "true"/"checked"/"1" o vacío. */
function bool(str: string | undefined): boolean {
  return /^(true|checked|1|s[ií])$/i.test((str ?? '').trim())
}

/** Texto que degrada a `undefined` en vez de a '—', para campos opcionales. */
function txt(str: string | undefined): string | undefined {
  const v = (str ?? '').trim()
  return v === '' ? undefined : v
}

export function relativeTime(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return 'hace menos de 1 hora'
  if (h < 24) return `hace ${h} hora${h !== 1 ? 's' : ''}`
  const d = Math.floor(h / 24)
  return `hace ${d} día${d !== 1 ? 's' : ''}`
}

export function mapRecord(id: string, createdTime: string, f: Record<string, string | undefined>): Solicitud {
  return {
    id,
    codigoExt: f['codigo_ext'] ?? id,
    cliente: f['cliente'] ?? '—',
    comuna: f['comuna'] ?? '—',
    estado: (f['estado'] as EstadoSolicitud) ?? 'creada',
    slaDias: computeSlaDias(f['fecha_limite_entrega'], f['semaforo_sla']),
    slaTotal: 5,
    prioridad: (f['prioridad'] as Prioridad) ?? 'normal',
    tasador: f['tasador'] || 'Sin asignar',
    visador: f['visador'] || 'Sin asignar',
    fechaLimite: formatDisplay(f['fecha_limite_entrega']),
    // D-C3 (Fase 3): fecha_solicitud es el dato de negocio real (poblado por
    // SC01 desde Fase 2); createdTime queda solo como fallback para filas
    // legacy creadas antes del fix del bug VP-NaN-XXXX.
    fechaSolicitud: formatDisplay(f['fecha_solicitud'] || createdTime),
    modificado: relativeTime(createdTime),
    modificadoPor: f['ejecutivo_solicitante'] ?? '—',
    tipoInforme: f['tipo_informe'] ?? '—',
    tipoPropiedad: f['tipo_propiedad'] ?? '—',
    // `tipo_propiedad_nuevo_usado` (fldHxx1P1ao33PWrl) sí existe desde el
    // 24-jul-2026 (§21.4 del schema). El hardcode a 'usado' venía de cuando no
    // existía y falseaba la forma del formulario en las propiedades nuevas.
    tipoPropiedadNuevoUsado: f['tipo_propiedad_nuevo_usado'] === 'nuevo' ? 'nuevo' : 'usado',
    banco: f['banco'] ?? '—',
    producto: f['producto'] ?? '—',
    direccion: f['direccion'] ?? '—',
    region: regionDeComuna(f['comuna'] ?? ''),
    montoUf: formatMontoUf(f['monto_estimado_uf']),
    propietario: f['cliente_final_nombre'] ?? '—',
    rut: f['cliente_final_rut'] ?? '—',
    email: f['email_contacto'] ?? '—',
    fechaVisita: f['fecha_visita_programada']
      ? formatDisplay(f['fecha_visita_programada'])
      : 'Por agendar',
    slaAplicable: '5 días hábiles',
    observaciones: f['observaciones_internas'] ?? '',
    // `canal` es el canal de contacto editable; `origenCanal` es el canal de
    // ingreso, que la pantalla no edita pero SC-Edicion reescribe en cada
    // ejecución y por eso hay que devolverle intacto (E-089).
    canal: f['canal_contacto_original'] ?? '—',
    origenCanal: f['origen_canal'] ?? '—',
    comprador: {
      rut: f['cliente_final_rut'] ?? '—',
      nombre: f['cliente_final_nombre'] ?? '—',
      email: f['email_contacto'] ?? '—',
      telefono: f['solicitante_telefono'] ?? '—',
    },
    // El vendedor vive como campos planos en TX_Solicitudes — `TX_Vendedor` no
    // existe (§21 del schema). Hasta D-02 esto devolvía '—' fijo.
    // `esInmobiliaria` se deriva de `vendedor_tipo_persona`: "juridica" (con o
    // sin tilde) = inmobiliaria; cualquier otro valor, natural.
    vendedor: {
      esInmobiliaria: /jur[ií]dica/i.test(f['vendedor_tipo_persona'] ?? ''),
      razonSocial: txt(f['vendedor_razon_social_o_nombre']),
      rutInmobiliaria: /jur[ií]dica/i.test(f['vendedor_tipo_persona'] ?? '')
        ? txt(f['vendedor_rut'])
        : undefined,
      nombre: txt(f['vendedor_nombre']),
      rut: txt(f['vendedor_rut']),
      correo: f['vendedor_email'] || '—',
      telefono: f['vendedor_telefono'] || '—',
      origenDato: f['vendedor_origen_dato'] || '—',
    },
    // `unidades` las hidrata `hydrateUnidades` (lib/unidades.ts) desde
    // TX_Unidades, y `contactosVisita` las hidrata `hydrateContactos`, ambas
    // en app/(ejecutiva)/consola/page.tsx. Aquí sólo se declara el valor
    // neutro. ⚠ Mientras `unidades` quedó en [] de forma permanente, RN-44
    // evaluaba siempre "faltan unidades" y el botón "Asignar Tasador" nunca se
    // habilitaba (Regla A, Tanda D-02).
    unidades: [],
    contactosVisita: [],
    contadorReasignaciones: 0,

    // ── Campos operacionales (Tanda D-02) ──────────────────────────────────
    nOperacionCliente: num(f['n_operacion_cliente']),
    sucursalOriginadora: txt(f['sucursal_originadora ']),
    correoClienteRef: txt(f['correo_cliente_ref']),
    nroInterno: txt(f['nro_interno']),
    numeroSolicitud: txt(f['numero_solicitud']),
    rolSii: txt(f['rol_sii']),
    notas: txt(f['notas']),
    solicitanteNombre: txt(f['solicitante_nombre']),
    solicitanteTelefono: txt(f['solicitante_telefono']),
    profesionSolicitante: txt(f['profesion_solicitante']),
    bancoFinancista: txt(f['banco_financista']),
    origenDato: txt(f['origen_dato']),
    velocidadVenta: txt(f['velocidad_venta']),
    supTerrenoM2: num(f['sup_terreno_m2']),
    supConstruccionM2: num(f['sup_construccion_m2']),
    anioConstruccion: num(f['anio_construccion']),
    valorComercialUf: num(f['valor_comercial_uf']),
    avaluoFiscalClp: num(f['avaluo_fiscal_clp']),
    comisionOv: num(f['comision_ov']),
    ufDiaVisita: num(f['uf_dia_visita']),
    fechaVisitaReal: txt(f['fecha_visita']),
    fechaEntrega: txt(f['fecha_entrega']),
    fechaCierre: txt(f['fecha_cierre']),
    fechaCreacion: txt(f['fecha_creacion']),
    ultimaModificacion: txt(f['ultima_modificacion']),
    diasDesdeSolicitud: num(f['dias_desde_solicitud']),
    pdfFinalUrl: txt(f['pdf_final_url']),
    tienePendientesVisador: bool(f['tiene_pendientes_visador']),
    fechaAsignacion: txt(f['fecha_asignacion_ts']),
    proyecto: txt(f['proyecto_condominio']),
    estadoConservacion: txt(f['estado_conservacion']),
    ejecFormalizador: txt(f['ejecutivo_formalizador']),
    emailThreadId: txt(f['email_thread_id']),
    origenDireccion: f['origen_direccion'] as Solicitud['origenDireccion'],
    tipoClienteOrigen: txt(f['tipo_cliente_origen']),
    modoCreacion: f['modo_creacion'] as Solicitud['modoCreacion'],
    // Bloque financiero: el tipo lo declaraba como `financiero?` y nadie lo
    // poblaba. Se mantiene el shape de strings del modelo de UI.
    financiero: {
      valorTotalUf: txt(f['financiero_valor_total_uf']),
      subsidio: txt(f['financiero_subsidio_uf']),
      ahorro: txt(f['financiero_ahorro_uf']),
      mutuo: txt(f['financiero_mutuo_uf']),
      pagoContado: txt(f['financiero_pago_contado_uf']),
      bonoCaptacion: txt(f['financiero_bono_captacion_uf']),
      bonoIntegracion: txt(f['financiero_bono_integracion_uf']),
      precioVenta: txt(f['financiero_precio_venta_uf']),
    },
  }
}

/**
 * Traduce el orden de la UI a un sort de Airtable (campo + direccion).
 *
 * El default es `fecha_solicitud desc` desde la tanda D-01 (29-jul-2026). Antes
 * era `fecha_limite_entrega asc`, que es un estado inválido y no una
 * preferencia: `fecha_limite_entrega` es `DATEADD({fldpTBzjfbAw5FSYI},2,'days')`
 * sobre un campo date que SC01 no puebla, así que vale `#ERROR` en **toda alta
 * nueva** y la posición que Airtable les da en el sort es indefinida. Ordenar
 * por `fecha_solicitud desc` deja además lo recién creado arriba, que es lo
 * esperable de una bandeja operativa.
 *
 * `sla_desc` y `sla_asc` **ya no ordenan en Airtable**: se resuelven en memoria
 * sobre `slaDias` (ver `ordenarPorSla`). Airtable recibe un orden neutro y
 * estable, `fecha_solicitud desc`, para que el resultado sea determinista antes
 * del reordenamiento.
 */
function ordenToSort(orden?: OrdenParam): { field: string; direction: 'asc' | 'desc' } {
  switch (orden) {
    case 'prioridad':
      return { field: 'prioridad', direction: 'desc' }
    case 'sla_asc':
    case 'sla_desc':
    case 'fecha_solicitud_desc':
    default:
      return { field: 'fecha_solicitud', direction: 'desc' }
  }
}

/**
 * Reordena por urgencia de SLA en memoria.
 *
 * Antes esto era un `sort` de Airtable sobre `fecha_limite_entrega`, que es
 * `DATEADD({fecha_visita},2,'days')` sobre un campo vacío en toda alta nueva:
 * valía `#ERROR` y la posición que Airtable le da a un valor errado es
 * indefinida (deuda D-01 · ítem 6).
 *
 * `slaDias` ya codifica la urgencia y siempre tiene valor: sale de la fecha
 * límite cuando es parseable y, si no, del semáforo (`VENCIDO` → -1,
 * `EN RIESGO` → 2, resto → 3). Ordenar por él no requiere ningún campo nuevo
 * en Airtable ni depende de la fórmula.
 *
 * `sla_desc` = "SLA descendente" en la UI = **lo más urgente primero**, o sea
 * `slaDias` ascendente. El empate se rompe por código para que el orden sea
 * estable entre recargas.
 */
function ordenarPorSla(data: Solicitud[], orden: OrdenParam): Solicitud[] {
  const signo = orden === 'sla_desc' ? 1 : -1
  return [...data].sort(
    (a, b) => signo * (a.slaDias - b.slaDias) || a.codigoExt.localeCompare(b.codigoExt)
  )
}

export async function fetchSolicitudes(
  vista: Vista = VISTA_DEFAULT,
  userId?: string,
  filtros?: SolicitudesFiltros,
  orden?: OrdenParam
): Promise<FetchResult> {
  // "Mi cartera": resolver clerk_user_id -> AUTH_Usuarios ANTES de armar la
  // fórmula. Sin esto, {ejecutiva_asignada} nunca puede matchear un
  // clerk_user_id (E-018/E-019 en docs/aprendizajes.md).
  let ejecutivaNombre: string | undefined
  if (vista === 'mi_cartera') {
    if (!userId) return { data: [], motivo: 'ejecutiva_no_encontrada' }
    const ejecutiva = await resolveEjecutiva(userId)
    if (!ejecutiva) return { data: [], motivo: 'ejecutiva_no_encontrada' }
    ejecutivaNombre = ejecutiva.nombre
  }

  const formula = buildFormula(vista, ejecutivaNombre, filtros)
  const sort = ordenToSort(orden)
  try {
    const records = await listRecords<RawFields>(TX_SOLICITUDES, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      filterByFormula: formula,
      'sort[0][field]': sort.field,
      'sort[0][direction]': sort.direction,
      fields: SOLICITUD_FIELDS,
    })
    const data = records.map((r) => mapRecord(r.id, r.createdTime, r.fields))
    // El orden por SLA se resuelve aquí y no en Airtable (ver `ordenarPorSla`).
    // Es seguro hacerlo en memoria porque esta función ya devuelve el conjunto
    // completo y la paginación se aplica después, sobre el array ordenado.
    return {
      data:
        orden === 'sla_desc' || orden === 'sla_asc' ? ordenarPorSla(data, orden) : data,
    }
  } catch (err) {
    // ejecutiva_asignada not yet created in TX_Solicitudes (D-08 pending)
    if (
      err instanceof AirtableError &&
      vista === 'mi_cartera' &&
      (err.message.includes('ejecutiva_asignada') || err.message.includes('Unknown field names'))
    ) {
      return { data: [], degraded: true }
    }
    throw err
  }
}
