import { getRecord, listRecords } from '@/lib/airtable-client'
import type { CasoPath } from '@/lib/dropbox-path'
import { TX_SOLICITUDES } from '@/lib/solicitudes'
import { TX_UNIDADES } from '@/lib/unidades'

/**
 * Resolución del contexto que el path de §8.1 necesita y que el payload de
 * subida no trae: nombre del cliente, año de la solicitud y unidad de destino.
 *
 * Todo lo de este archivo es **lectura** de Airtable. Las escrituras siguen
 * yendo por Make (RT-03); acá no hay ni un POST. Se separa de
 * `lib/dropbox-path.ts` para que la regla normativa quede pura y testeable sin
 * red, y el I/O quede aislado en un solo sitio.
 */

// M_Clientes verificado vía MCP 06-ago-2026
const M_CLIENTES = 'tblpK7AcYBMH93apK'

/**
 * Segmento de cliente cuando la solicitud no tiene el link poblado. No está en
 * §8.1 —que asume `cliente` siempre presente— pero el caso existe en la base
 * real (VP-2026-0044 al 07-ago-2026). Se prefiere un segmento auditable, en la
 * línea de `sin_subtipo`, antes que bloquear la subida por un defecto de datos
 * maestros que la Ejecutiva no puede corregir desde el diálogo de adjuntos.
 */
export const CLIENTE_SIN_DECLARAR = 'SIN_CLIENTE'

interface SolicitudFields {
  codigo_solicitud?: string
  codigo_ext?: string
  /** dateTime en UTC. */
  fecha_solicitud?: string
  /** Link → M_Clientes; en formato JSON llega como array de record IDs. */
  cliente?: string[]
}

interface ClienteFields {
  nombre?: string
}

interface UnidadFields {
  subtipo?: string
  numero_unidad?: string
  orden?: number
  solicitud?: string[]
}

export interface ContextoSolicitud {
  /** `codigo_solicitud` (`fldDXEE1ejMNVDlpB`), el primary field. */
  codigoSolicitud: string
  clienteNombre: string
  fechaSolicitud: Date
}

/**
 * Lee de `TX_Solicitudes` y `M_Clientes` los tres datos fijos del path.
 *
 * Dos `getRecord` por record ID, no una búsqueda por fórmula: el id ya viene
 * validado en el Route Handler y así no se depende de que `codigo_ext` y
 * `codigo_solicitud` sigan coincidiendo (hoy coinciden, son campos distintos —
 * ver la advertencia de §8.6.2).
 *
 * @throws si la solicitud no existe. Un path sin código o sin año no es
 * auditable, así que es preferible cortar antes de tocar Dropbox.
 */
export async function resolverContextoSolicitud(
  solicitudId: string,
  codigoExtDelPayload: string
): Promise<ContextoSolicitud> {
  const solicitud = await getRecord<SolicitudFields>(TX_SOLICITUDES, solicitudId)
  if (!solicitud) {
    throw new Error(`[dropbox-path] la solicitud ${solicitudId} no existe en TX_Solicitudes`)
  }

  const f = solicitud.fields
  const codigoSolicitud = (f.codigo_solicitud || f.codigo_ext || codigoExtDelPayload).trim()
  if (!codigoSolicitud) {
    throw new Error(`[dropbox-path] la solicitud ${solicitudId} no tiene código`)
  }

  // `fecha_solicitud` es el dato de negocio; `createdTime` es el respaldo para
  // las filas que lo tienen vacío. Los dos caen casi siempre en el mismo año, y
  // un año aproximado es mejor que una subida caída.
  const fechaSolicitud = new Date(f.fecha_solicitud || solicitud.createdTime)
  if (Number.isNaN(fechaSolicitud.getTime())) {
    throw new Error(`[dropbox-path] fecha_solicitud ilegible en ${solicitudId}`)
  }

  const clienteId = f.cliente?.[0]
  if (!clienteId) {
    console.warn(
      `[dropbox-path] la solicitud ${codigoSolicitud} no tiene cliente vinculado — ` +
        `el adjunto va a ${CLIENTE_SIN_DECLARAR}/`
    )
    return { codigoSolicitud, clienteNombre: CLIENTE_SIN_DECLARAR, fechaSolicitud }
  }

  const cliente = await getRecord<ClienteFields>(M_CLIENTES, clienteId)
  const nombre = cliente?.fields.nombre?.trim()
  if (!nombre) {
    console.warn(
      `[dropbox-path] el cliente ${clienteId} de ${codigoSolicitud} no tiene nombre — ` +
        `el adjunto va a ${CLIENTE_SIN_DECLARAR}/`
    )
    return { codigoSolicitud, clienteNombre: CLIENTE_SIN_DECLARAR, fechaSolicitud }
  }

  return { codigoSolicitud, clienteNombre: nombre, fechaSolicitud }
}

interface UnidadDelPath {
  id: string
  subtipo: string | null
  numeroUnidad: string | null
  orden: number
}

/**
 * Unidades de una solicitud, ordenadas por `orden`.
 *
 * Se filtra por **código** y no por record ID: dentro de un `filterByFormula`,
 * un campo Link se evalúa contra el *primary field* de la tabla destino
 * (`codigo_solicitud`), nunca contra el record ID — lección E-018/E-076. Las
 * comas a ambos lados exigen match de token exacto, para que `VP-2026-0054` no
 * matchee dentro de `VP-2026-00541`.
 */
async function leerUnidades(codigoSolicitud: string): Promise<UnidadDelPath[]> {
  if (codigoSolicitud.includes('"')) return []

  const records = await listRecords<UnidadFields>(TX_UNIDADES, {
    filterByFormula: `FIND(",${codigoSolicitud},", "," & ARRAYJOIN({solicitud}, ",") & ",") > 0`,
    'sort[0][field]': 'orden',
    'sort[0][direction]': 'asc',
    fields: ['subtipo', 'numero_unidad', 'orden', 'solicitud'],
  })

  return records.map((r, i) => ({
    id: r.id,
    subtipo: r.fields.subtipo?.trim() || null,
    numeroUnidad: r.fields.numero_unidad?.trim() || null,
    orden: r.fields.orden ?? i + 1,
  }))
}

/** Arma el `CasoPath` de una unidad concreta contando sus hermanas del mismo subtipo. */
function casoDeUnidad(unidad: UnidadDelPath, todas: UnidadDelPath[]): CasoPath {
  const delMismoSubtipo = todas.filter((u) => u.subtipo === unidad.subtipo)
  return {
    tipo: 'unidad',
    subtipoUnidad: unidad.subtipo,
    numeroUnidad: unidad.numeroUnidad,
    totalDelMismoSubtipo: delMismoSubtipo.length,
    ordinalEnGrupo: delMismoSubtipo.findIndex((u) => u.id === unidad.id) + 1,
  }
}

/** Carpetas hermanas que el llamador puede pedir explícitamente. */
export type CarpetaExplicita = 'comun' | 'ingreso' | 'informe'

export interface EntradaCasoPath {
  codigoSolicitud: string
  /** Record ID de `TX_Unidades`, cuando la interfaz sabe a qué unidad pertenece el adjunto. */
  unidadId?: string
  /** Carpeta hermana pedida explícitamente; tiene precedencia sobre `unidadId`. */
  carpeta?: CarpetaExplicita
}

/**
 * Resuelve el segmento `{Unidad}` del path (§8.1).
 *
 * Precedencia: carpeta explícita → unidad explícita → auto-derivación.
 *
 * La auto-derivación cubre el caso (a) de la nota de diseño §9.1 del plan —una
 * sola unidad, se deduce sin preguntar— y deja el caso (b) —dos o más, con
 * selector por fila— para la tanda del checklist. Mientras tanto, una solicitud
 * multi-unidad manda sus adjuntos a `comun/`: es la carpeta de los documentos
 * que cubren varias unidades y, sobre todo, es **verdad** —el adjunto no está
 * atribuido a ninguna unidad— mientras que elegir una al azar sería un dato
 * falso persistido en un path que §8 declara inmutable (CI-004).
 *
 * Sin unidades declaradas va a `_ingreso/`, que es exactamente su definición:
 * adjuntos cargados antes de que existan unidades.
 */
export async function resolverCasoPath(entrada: EntradaCasoPath): Promise<CasoPath> {
  if (entrada.carpeta === 'comun') return { tipo: 'comun' }
  if (entrada.carpeta === 'informe') return { tipo: 'informe' }
  if (entrada.carpeta === 'ingreso') return { tipo: 'ingreso' }

  const unidades = await leerUnidades(entrada.codigoSolicitud)

  if (entrada.unidadId) {
    const unidad = unidades.find((u) => u.id === entrada.unidadId)
    if (unidad) return casoDeUnidad(unidad, unidades)
    // Un `unidad_id` que no pertenece a esta solicitud es un cliente
    // desincronizado o un id manipulado: no se le da carpeta propia.
    console.warn(
      `[dropbox-path] unidad ${entrada.unidadId} no pertenece a ${entrada.codigoSolicitud} — ` +
        'el adjunto va a comun/'
    )
    return { tipo: 'comun' }
  }

  if (unidades.length === 0) return { tipo: 'ingreso' }
  if (unidades.length === 1) return casoDeUnidad(unidades[0], unidades)
  return { tipo: 'comun' }
}
