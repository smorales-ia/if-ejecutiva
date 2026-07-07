import { listRecords } from '@/lib/airtable-client'
import { relativeTime } from '@/lib/solicitudes'

// TX_Adjuntos verified via MCP 2026-07-04
export const TX_ADJUNTOS = 'tblur71x1oItbmKZc'

export interface Adjunto {
  id: string
  nombre: string
  detalle: string
  urlDropbox: string
}

type RawFields = {
  nombre_archivo?: string
  url_dropbox?: string
  tamano_bytes?: string
}

function formatBytes(bytes: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** `solicitud` es un link field; se filtra con FIND()/ARRAYJOIN() sobre el record ID. */
export async function fetchAdjuntosPorSolicitud(solicitudId: string): Promise<Adjunto[]> {
  const records = await listRecords<RawFields>(TX_ADJUNTOS, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: `FIND("${solicitudId}", ARRAYJOIN({solicitud}))`,
    fields: ['nombre_archivo', 'url_dropbox', 'tamano_bytes'],
  })

  return records.map((r) => {
    const tamano = formatBytes(Number(r.fields.tamano_bytes ?? 0))
    const hace = relativeTime(r.createdTime)
    return {
      id: r.id,
      nombre: r.fields.nombre_archivo ?? 'Sin nombre',
      detalle: tamano ? `${tamano} · subido ${hace}` : `Subido ${hace}`,
      urlDropbox: r.fields.url_dropbox ?? '',
    }
  })
}
