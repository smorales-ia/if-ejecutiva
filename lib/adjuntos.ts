import { getRecord, listRecords } from '@/lib/airtable-client'
import { relativeTime } from '@/lib/solicitudes'

// TX_Adjuntos verified via MCP 2026-07-04
export const TX_ADJUNTOS = 'tblur71x1oItbmKZc'
/** `TX_Solicitudes` — se lee sólo para resolver `codigo_solicitud`. */
const TX_SOLICITUDES = 'tblaHTyMHYfmy7Fg6'

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
  /**
   * `estado_extraccion` (`fld54epvDJ7YdJIYD`) — avance de la lectura del
   * documento con Claude API (§4 · RF-09). Lo escribe `AT-RF09-Trigger`, que
   * hoy **falla al disparar el webhook**: el campo está vacío en todo adjunto
   * nuevo (CI-002 abierta). Por eso la pestaña Adjuntos lo muestra sólo cuando
   * trae valor, en vez de pintar un "idle" que nadie escribió.
   */
  estadoExtraccion: string
  /**
   * `true` si el archivo es una imagen. Se deriva de la extensión del nombre y
   * no de `mime_type`, que está vacío en la mayoría de las filas. Sólo decide
   * qué icono se pinta, así que un falso negativo es inocuo.
   */
  esImagen: boolean
}

const EXTENSIONES_IMAGEN = /\.(jpe?g|png|gif|webp|bmp|heic|tiff?)$/i

type RawFields = {
  nombre_archivo?: string
  tipo?: string
  clave_adjunto?: string
  url_dropbox?: string
  tamanio_kb?: number
  hash_md5?: string
  requerido_por_ejecutiva?: boolean
  estado_extraccion?: string
  solicitud?: string[]
}

/**
 * `url_dropbox` (`fldEccoUrOjV7oKZ5`) es de tipo `url` en Airtable, pero
 * `SC-Adjuntos-Upload` escribe ahí `{{6.path_display}}` — la **ruta** dentro de
 * Dropbox, no un enlace navegable. Desde `v1.3` del escenario esa ruta sigue la
 * estructura de spec v1.9.6 §8.1, compuesta en `lib/dropbox-path.ts`. Ej.:
 * `/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/departamento/cert.pdf`.
 *
 * Los adjuntos subidos antes del cierre de CI-003 conservan el path viejo
 * —`/VProperty/Tasaciones/VP-2026-0053/Foto REF Ofertas.JPG`—: quedaron
 * *grandfathered* por la cláusula de corte de RF-51 §8.3 y no se migran. Este
 * lector tiene que seguir tragando las dos formas, que es justo lo que hace: no
 * parsea el path, sólo lo normaliza a enlace.
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

const CAMPOS_ADJUNTO = [
  'nombre_archivo',
  'tipo',
  'clave_adjunto',
  'url_dropbox',
  'tamanio_kb',
  'hash_md5',
  'requerido_por_ejecutiva',
  'estado_extraccion',
  'solicitud',
]

/**
 * Adjuntos de una solicitud, filtrados **en Airtable** y no en memoria.
 *
 * ## Por qué antes se leía la tabla entera, y por qué ya no hace falta
 *
 * Un campo Link, dentro de `filterByFormula`, se evalúa contra el **primary
 * field** del registro vinculado —no contra su record ID (lección E-018)—, que
 * en `TX_Solicitudes` es `codigo_solicitud`. El 10-jul-2026 ese campo estaba
 * vacío en todas las filas (**E-024**), así que cualquier `FIND()/ARRAYJOIN()`
 * comparaba contra `""` y no hacía match nunca. La salida entonces fue correcta:
 * traer toda la tabla y filtrar en memoria.
 *
 * **E-024 quedó superado.** El campo se convirtió en fórmula entre el 10 y el
 * 13-jul-2026 (`docs/schema-airtable.md` §19) y hoy está poblado —verificado vía
 * MCP el 22-ago-2026—, de modo que el filtro server-side vuelve a ser posible y
 * el escaneo completo deja de justificarse: `TX_Adjuntos` crece con cada subida
 * y esta lectura corre en cada apertura del sheet.
 *
 * ## El coste: una lectura extra, deliberada
 *
 * Filtrar por `codigo_solicitud` obliga a resolverlo primero, así que son dos
 * peticiones donde antes había una. Es la misma forma que ya usan
 * `filasDeSolicitud()` en las rutas de IF-03. Se acepta porque la segunda
 * petición pasa de O(tabla) a O(adjuntos de esta solicitud), que es lo que
 * escala; y porque las dos son lecturas, cubiertas por el reintento de red de
 * `lib/airtable-client.ts`.
 *
 * Si la solicitud no existe o no tiene código, se devuelve `[]` en vez de caer
 * al escaneo completo: sin código no hay nada que casar, y traer la tabla entera
 * para filtrarla contra un id que ya sabemos ausente sólo gasta cuota.
 */
export async function fetchAdjuntosPorSolicitud(solicitudId: string): Promise<Adjunto[]> {
  const solicitud = await getRecord<{ codigo_solicitud?: string }>(
    TX_SOLICITUDES,
    solicitudId
  )
  const codigo = solicitud?.fields.codigo_solicitud?.trim() ?? ''
  if (!codigo) return []

  const records = await listRecords<RawFields>(TX_ADJUNTOS, {
    fields: CAMPOS_ADJUNTO,
    filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
  })

  return records
    .map((r) => {
      const tamano = formatTamanioKb(Number(r.fields.tamanio_kb ?? 0))
      const hace = relativeTime(r.createdTime)
      const nombre = r.fields.nombre_archivo ?? 'Sin nombre'
      return {
        id: r.id,
        nombre,
        tipo: r.fields.tipo ?? '—',
        detalle: tamano ? `${tamano} · subido ${hace}` : `Subido ${hace}`,
        urlDropbox: urlNavegableDropbox(r.fields.url_dropbox),
        requeridoPorEjecutiva: Boolean(r.fields.requerido_por_ejecutiva),
        claveAdjunto: r.fields.clave_adjunto?.trim() ?? '',
        hashMd5: r.fields.hash_md5?.trim() ?? '',
        pathDropbox: r.fields.url_dropbox?.trim() ?? '',
        estadoExtraccion: r.fields.estado_extraccion?.trim() ?? '',
        esImagen: EXTENSIONES_IMAGEN.test(nombre),
      }
    })
}
