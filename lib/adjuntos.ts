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
  /**
   * `clave_adjunto` (`fldaLLtzAaEn1O8IW`) — el `codigo` de `D_TipoDocumento`
   * declarado al subir (RN-25). Es el campo que **sí** escribe
   * `SC-Adjuntos-Upload` (módulo 8 del blueprint mapea `{{1.tipo_documento}}`
   * aquí), y por tanto el único fiable para casar un adjunto con su fila del
   * checklist.
   *
   * No confundir con `tipo` (`fldUYBO3LeOHxiIGW`), un `singleSelect` heredado
   * con opciones incoherentes (`plano`, `sii`, `Permiso edificacion`,
   * `Certificado avaluo`) que el escenario Make no escribe nunca. Se sigue
   * leyendo sólo para no romper a `AdjuntosTab`.
   */
  claveAdjunto: string
  /**
   * `hash_md5` (`fld9shmoBhZyNTK8x`) — MD5 del binario, calculado en el cliente
   * antes de subir. Se expone porque es la **salvaguarda de integridad** del
   * borrado (§8.6.3): `DELETE /api/adjuntos/[id]` lo reenvía a
   * `SC-Adjuntos-Delete`, que se niega a destruir nada si el registro apuntado
   * por el record ID ya no tiene ese hash. Cubre la carrera en la que el
   * adjunto fue reemplazado entre la lectura y el clic.
   */
  hashMd5: string
  /**
   * Ruta cruda en Dropbox (`url_dropbox` sin normalizar al visor web). Se
   * conserva junto a `urlDropbox` porque es lo que `Delete a file` espera.
   */
  pathDropbox: string
}

type RawFields = {
  nombre_archivo?: string
  tipo?: string
  clave_adjunto?: string
  url_dropbox?: string
  tamanio_kb?: number
  hash_md5?: string
  requerido_por_ejecutiva?: boolean
  solicitud?: string[]
}

/**
 * `url_dropbox` (`fldEccoUrOjV7oKZ5`) es de tipo `url` en Airtable, pero
 * `SC-Adjuntos-Upload` escribe ahí `{{6.path_display}}` — la **ruta** dentro de
 * Dropbox, no un enlace navegable. Ej.:
 * `/VProperty/Tasaciones/VP-2026-0053/Foto REF Ofertas.JPG`.
 *
 * Puesto tal cual en un `href`, el navegador lo resuelve como ruta **relativa
 * al dominio de la app** y devuelve 404. Se normaliza al visor web de Dropbox,
 * que acepta la ruta como query param y respeta los permisos de la cuenta.
 *
 * Devuelve `''` si no hay ruta: el consumidor pinta un badge en vez de un
 * enlace roto.
 */
function urlNavegableDropbox(valor: string | undefined): string {
  const v = valor?.trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  return `https://www.dropbox.com/home${v.startsWith('/') ? '' : '/'}${v
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`
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
    fields: [
      'nombre_archivo',
      'tipo',
      'clave_adjunto',
      'url_dropbox',
      'tamanio_kb',
      'hash_md5',
      'requerido_por_ejecutiva',
      'solicitud',
    ],
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
        urlDropbox: urlNavegableDropbox(r.fields.url_dropbox),
        requeridoPorEjecutiva: Boolean(r.fields.requerido_por_ejecutiva),
        claveAdjunto: r.fields.clave_adjunto?.trim() ?? '',
        hashMd5: r.fields.hash_md5?.trim() ?? '',
        pathDropbox: r.fields.url_dropbox?.trim() ?? '',
      }
    })
}
