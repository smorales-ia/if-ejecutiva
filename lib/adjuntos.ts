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
  tamanio_kb?: string
}

/** `tamanio_kb` ya viene en KB desde Airtable (no bytes) — sin dividir por 1024 antes de mostrar KB. */
function formatTamanioKb(kb: number): string {
  if (!kb) return ''
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

/** `solicitud` es un link field; se filtra con FIND()/ARRAYJOIN() sobre el record ID. */
export async function fetchAdjuntosPorSolicitud(solicitudId: string): Promise<Adjunto[]> {
  const records = await listRecords<RawFields>(TX_ADJUNTOS, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: `FIND("${solicitudId}", ARRAYJOIN({solicitud}))`,
    fields: ['nombre_archivo', 'url_dropbox', 'tamanio_kb'],
  })

  return records.map((r) => {
    const tamano = formatTamanioKb(Number(r.fields.tamanio_kb ?? 0))
    const hace = relativeTime(r.createdTime)
    return {
      id: r.id,
      nombre: r.fields.nombre_archivo ?? 'Sin nombre',
      detalle: tamano ? `${tamano} · subido ${hace}` : `Subido ${hace}`,
      urlDropbox: r.fields.url_dropbox ?? '',
    }
  })
}
