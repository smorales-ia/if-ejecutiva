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
  usuario?: string
}

function tituloEvento(f: RawFields): string {
  if (f.descripcion) return f.descripcion
  const tipo = f.tipo_evento ?? 'Evento'
  return f.usuario ? `${tipo} · ${f.usuario}` : tipo
}

function iconoEvento(tipoEvento: string | undefined): IconoEvento {
  return EVENTO_ICONS[tipoEvento as keyof typeof EVENTO_ICONS] ?? 'eye'
}

/** `solicitud` es un link field; se filtra con FIND()/ARRAYJOIN() sobre el record ID. */
export async function fetchEventosPorSolicitud(solicitudId: string): Promise<Evento[]> {
  const records = await listRecords<RawFields>(A_EVENTOS, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: `FIND("${solicitudId}", ARRAYJOIN({solicitud}))`,
    'sort[0][field]': 'timestamp',
    'sort[0][direction]': 'desc',
    fields: ['tipo_evento', 'descripcion', 'usuario'],
  })

  return records.map((r) => ({
    id: r.id,
    titulo: tituloEvento(r.fields),
    hace: relativeTime(r.createdTime),
    icono: iconoEvento(r.fields.tipo_evento),
  }))
}
