import { listRecords } from '@/lib/airtable-client'
import { relativeTime } from '@/lib/solicitudes'

// TX_Adjuntos verified via MCP 2026-07-04
export const TX_ADJUNTOS = 'tblur71x1oItbmKZc'

export interface Adjunto {
  id: string
  nombre: string
  tipo: string
  detalle: string
  urlDropbox: string
  /** `requerido_por_ejecutiva` — distingue el checklist obligatorio de adjuntos sueltos (Fase 2 Tanda A). */
  requeridoPorEjecutiva: boolean
}

type RawFields = {
  nombre_archivo?: string
  tipo?: string
  url_dropbox?: string
  tamanio_kb?: number
  requerido_por_ejecutiva?: boolean
  solicitud?: string[]
}

/** `tamanio_kb` ya viene en KB desde Airtable (no bytes) — sin dividir por 1024 antes de mostrar KB. */
function formatTamanioKb(kb: number): string {
  if (!kb) return ''
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

/**
 * `TX_Solicitudes.codigo_solicitud` (su primary field) está vacío en todas
 * las filas — nunca se pobló (hallazgo 10-jul-2026, ver docs/aprendizajes.md
 * E-024). Como un campo Link, DENTRO de filterByFormula, se evalúa contra el
 * primary field del registro vinculado (no contra su record ID — lección
 * E-018), filtrar `TX_Adjuntos.solicitud` con FIND()/ARRAYJOIN() siempre
 * devolvía "" y nunca hacía match. Se pide el campo en formato JSON normal
 * (sin cellFormat 'string', que también renderiza Link fields como texto del
 * primary field) para que `fields.solicitud` traiga el array real de record
 * IDs, y se filtra en memoria.
 */
export async function fetchAdjuntosPorSolicitud(solicitudId: string): Promise<Adjunto[]> {
  const records = await listRecords<RawFields>(TX_ADJUNTOS, {
    fields: ['nombre_archivo', 'tipo', 'url_dropbox', 'tamanio_kb', 'requerido_por_ejecutiva', 'solicitud'],
  })

  return records
    .filter((r) => (r.fields.solicitud ?? []).includes(solicitudId))
    .map((r) => {
      const tamano = formatTamanioKb(Number(r.fields.tamanio_kb ?? 0))
      const hace = relativeTime(r.createdTime)
      return {
        id: r.id,
        nombre: r.fields.nombre_archivo ?? 'Sin nombre',
        tipo: r.fields.tipo ?? '—',
        detalle: tamano ? `${tamano} · subido ${hace}` : `Subido ${hace}`,
        urlDropbox: r.fields.url_dropbox ?? '',
        requeridoPorEjecutiva: Boolean(r.fields.requerido_por_ejecutiva),
      }
    })
}
