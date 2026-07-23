import { listRecords, AirtableError } from '@/lib/airtable-client'
import {
  CLIENTES,
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
      return 'OR({semaforo_sla}="rojo",{semaforo_sla}="ámbar",{semaforo_sla}="ambar")'
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

  if (filtros.cliente && (CLIENTES as readonly string[]).includes(filtros.cliente)) {
    clauses.push(`{cliente}="${filtros.cliente}"`)
  }
  if (filtros.estado && filtros.estado in ESTADO_LABELS) {
    clauses.push(`{estado}="${filtros.estado}"`)
  }
  if (filtros.sla && SLA_FILTROS_VALIDOS.includes(filtros.sla as SlaFiltro)) {
    // semaforo_sla real usa "ámbar" (con tilde); se acepta también sin tilde.
    clauses.push(
      filtros.sla === 'ambar'
        ? 'OR({semaforo_sla}="ámbar",{semaforo_sla}="ambar")'
        : `{semaforo_sla}="${filtros.sla}"`
    )
  }
  if (filtros.desde && FECHA_VALIDA.test(filtros.desde)) {
    clauses.push(`NOT(IS_BEFORE({fecha_solicitud},DATETIME_PARSE("${filtros.desde}","YYYY-MM-DD")))`)
  }
  if (filtros.hasta && FECHA_VALIDA.test(filtros.hasta)) {
    clauses.push(`NOT(IS_AFTER({fecha_solicitud},DATETIME_PARSE("${filtros.hasta}","YYYY-MM-DD")))`)
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
  'origen_canal',
  'ejecutivo_solicitante',
  'cliente_final_nombre',
  'cliente_final_rut',
  'semaforo_sla',
  'direccion',
  'monto_estimado_uf',
  'solicitante_telefono',
  'email_contacto',
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
  // Fallback: derive from semaforo_sla formula value
  if (semaforo === 'rojo') return -1
  if (semaforo === 'ámbar' || semaforo === 'ambar') return 2
  return 3
}

function formatMontoUf(str: string | undefined): string {
  if (!str) return '—'
  const n = Number(str)
  return Number.isNaN(n) ? `${str} UF` : `${n.toLocaleString('es-CL')} UF`
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
    // ⚙ Pendiente de creación en Airtable: TX_Solicitudes no distingue nuevo/usado
    // todavía. Degrada a "usado" (mayoría de los casos actuales).
    tipoPropiedadNuevoUsado: 'usado',
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
    canal: f['origen_canal'] ?? '—',
    // ⚙ Pendiente de creación en Airtable: comprador/vendedor/unidades/
    // contactosVisita (modelo v1.9 del diseño) no tienen respaldo en
    // TX_Solicitudes todavía. `comprador` se arma con los mismos campos planos
    // que ya existían (propietario/rut/email); el resto degrada vacío.
    comprador: {
      rut: f['cliente_final_rut'] ?? '—',
      nombre: f['cliente_final_nombre'] ?? '—',
      email: f['email_contacto'] ?? '—',
      telefono: f['solicitante_telefono'] ?? '—',
    },
    vendedor: {
      esInmobiliaria: false,
      correo: '—',
      telefono: '—',
      origenDato: '—',
    },
    unidades: [],
    contactosVisita: [],
    contadorReasignaciones: 0,
  }
}

/** Traduce el orden de la UI a un sort de Airtable (campo + direccion). */
function ordenToSort(orden?: OrdenParam): { field: string; direction: 'asc' | 'desc' } {
  switch (orden) {
    case 'sla_asc':
      return { field: 'fecha_limite_entrega', direction: 'desc' }
    case 'fecha_solicitud_desc':
      return { field: 'fecha_solicitud', direction: 'desc' }
    case 'prioridad':
      return { field: 'prioridad', direction: 'desc' }
    case 'sla_desc':
    default:
      return { field: 'fecha_limite_entrega', direction: 'asc' }
  }
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
    return { data: records.map((r) => mapRecord(r.id, r.createdTime, r.fields)) }
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
