import { listRecords } from '@/lib/airtable-client'
import { relativeTime } from '@/lib/solicitudes'

// A_Eventos verified via MCP 2026-07-04
export const A_EVENTOS = 'tblMKmDg2KrO5fMn8'

const EVENTO_ICONS = {
  solicitud_creada: 'plus',
  tasador_asignado: 'check',
  reasignacion_manual: 'check',
  cambio_prioridad: 'alert',
  solicitud_pausada: 'alert',
  solicitud_cancelada: 'alert',
} as const

export type IconoEvento = 'check' | 'plus' | 'alert' | 'eye'

export interface Evento {
  id: string
  titulo: string
  hace: string
  icono: IconoEvento
}

type RawFields = {
  tipo_evento?: string
  descripcion?: string
  actor_nombre?: string
}

function tituloEvento(f: RawFields): string {
  if (f.descripcion) return f.descripcion
  const tipo = f.tipo_evento ?? 'Evento'
  return f.actor_nombre ? `${tipo} · ${f.actor_nombre}` : tipo
}

function iconoEvento(tipoEvento: string | undefined): IconoEvento {
  return EVENTO_ICONS[tipoEvento as keyof typeof EVENTO_ICONS] ?? 'eye'
}

/**
 * Eventos de una solicitud, más recientes primero.
 *
 * ⚠ Recibe el **código** (`VP-2026-0054`), no el record ID. `solicitud` es un
 * campo Link y dentro de un `filterByFormula` un link se evalúa contra el
 * *primary field* de la tabla destino — que en `TX_Solicitudes` es
 * `codigo_solicitud` — nunca contra el record ID (E-076/E-077). La versión
 * anterior interpolaba un `rec…` aquí y devolvía **cero filas siempre**, sin
 * error: el historial se veía vacío y era indistinguible de "no hay eventos".
 * Mismo patrón, y misma corrección, que `hydrateContactos`
 * (`lib/contactos-visita.ts`).
 */
export async function fetchEventosPorSolicitud(codigoSolicitud: string): Promise<Evento[]> {
  // Sin código no hay filtro posible: devolver [] es preferible a emitir una
  // fórmula con FIND("") que matchea todas las filas de A_Eventos.
  if (!codigoSolicitud || codigoSolicitud.includes('"')) return []

  // Delimitado con comas a ambos lados para exigir match de token exacto: un
  // FIND suelto haría que "VP-2026-0054" matchee dentro de "VP-2026-00541" el
  // día que `solicitud_id` pase de 4 dígitos.
  const formula = `FIND(",${codigoSolicitud},", "," & ARRAYJOIN({solicitud}, ",") & ",") > 0`

  const records = await listRecords<RawFields>(A_EVENTOS, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: formula,
    'sort[0][field]': 'timestamp',
    'sort[0][direction]': 'desc',
    fields: ['tipo_evento', 'descripcion', 'actor_nombre'],
  })

  return records.map((r) => ({
    id: r.id,
    titulo: tituloEvento(r.fields),
    hace: relativeTime(r.createdTime),
    icono: iconoEvento(r.fields.tipo_evento),
  }))
}
