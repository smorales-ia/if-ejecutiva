import { listRecords, AirtableError } from '@/lib/airtable-client'
import type { EstadoSolicitud, Prioridad, Solicitud } from '@/lib/console-data'

// TX_Solicitudes verified via MCP 2026-07-04
export const TX_SOLICITUDES = 'tblaHTyMHYfmy7Fg6'

export type Vista = 'activas' | 'sla_riesgo' | 'reasignar' | 'pausadas' | 'aprobadas' | 'cartera'

export const VISTAS_VALIDAS: Vista[] = [
  'activas',
  'sla_riesgo',
  'reasignar',
  'pausadas',
  'aprobadas',
  'cartera',
]

export function buildFormula(vista: Vista, userId?: string): string {
  switch (vista) {
    case 'activas':
      return 'NOT(OR({estado}="cancelada",{estado}="cerrada",{estado}="entregada"))'
    case 'sla_riesgo':
      return 'OR({semaforo_sla}="rojo",{semaforo_sla}="ámbar",{semaforo_sla}="ambar")'
    case 'reasignar':
      return 'AND({estado}="creada",DATETIME_DIFF(NOW(),CREATED_TIME(),"hours")>48)'
    case 'pausadas':
      return '{estado}="pausada"'
    case 'aprobadas':
      return '{estado}="aprobada"'
    case 'cartera':
      return `{ejecutiva_asignada}="${userId ?? ''}"`
  }
}

export interface FetchResult {
  data: Solicitud[]
  degraded?: boolean
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
    banco: f['banco'] ?? '—',
    producto: f['producto'] ?? '—',
    direccion: f['direccion'] ?? '—',
    region: '—',
    montoUf: formatMontoUf(f['monto_estimado_uf']),
    propietario: f['cliente_final_nombre'] ?? '—',
    rut: f['cliente_final_rut'] ?? '—',
    email: '—',
    fechaVisita: f['fecha_visita_programada']
      ? formatDisplay(f['fecha_visita_programada'])
      : 'Por agendar',
    slaAplicable: '5 días hábiles',
    observaciones: f['observaciones_internas'] ?? '',
    canal: f['origen_canal'] ?? '—',
  }
}

export async function fetchSolicitudes(vista: Vista = 'activas', userId?: string): Promise<FetchResult> {
  const formula = buildFormula(vista, userId)
  try {
    const records = await listRecords<RawFields>(TX_SOLICITUDES, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      filterByFormula: formula,
      'sort[0][field]': 'fecha_limite_entrega',
      'sort[0][direction]': 'asc',
      fields: SOLICITUD_FIELDS,
    })
    return { data: records.map((r) => mapRecord(r.id, r.createdTime, r.fields)) }
  } catch (err) {
    // ejecutiva_asignada not yet created in TX_Solicitudes (D-08 pending)
    if (
      err instanceof AirtableError &&
      vista === 'cartera' &&
      (err.message.includes('ejecutiva_asignada') || err.message.includes('Unknown field names'))
    ) {
      return { data: [], degraded: true }
    }
    throw err
  }
}
