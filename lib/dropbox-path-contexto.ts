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
 * Motivo por el que no se pudo componer el path. El `code` viaja al cliente
 * para que la interfaz distinga *qué* falta; el texto humano lo pone el Route
 * Handler, nunca este módulo.
 *
 * - `cliente_sin_vincular` — la solicitud no tiene `cliente` (o el cliente no
 *   tiene `nombre`). Falta un dato maestro que la Ejecutiva puede corregir.
 * - `unidad_no_especificada` — la solicitud tiene dos o más unidades y nadie
 *   dijo a cuál pertenece el adjunto.
 * - `unidad_no_pertenece` — el `unidad_id` recibido no es de esta solicitud.
 * - `solicitud_irresoluble` — no existe, no tiene código o su fecha es ilegible.
 */
export type MotivoPathIrresoluble =
  | 'cliente_sin_vincular'
  | 'unidad_no_especificada'
  | 'unidad_no_pertenece'
  | 'solicitud_irresoluble'

/**
 * El path no se pudo componer y **no hay fallback**.
 *
 * ── Por qué no hay fallback (CI-003b, 07-ago-2026) ────────────────────────
 *
 * La versión inicial de CI-003 resolvía estos casos en silencio: una solicitud
 * sin cliente iba a `SIN_CLIENTE/` y una multi-unidad iba a `comun/`, las dos
 * con un `console.warn` que nadie lee. El razonamiento era no bloquear a la
 * Ejecutiva por un defecto de datos que ella no causó.
 *
 * El defecto de ese razonamiento es que el fallback **oculta** exactamente lo
 * que hay que ver: `SIN_CLIENTE/` esconde un error de datos maestros que sí es
 * corregible, y `comun/` esconde una decisión de UX pendiente —el selector de
 * unidad del checklist— detrás de un archivo que queda mal archivado para
 * siempre, porque §8 declara el path inmutable (CI-004). Un archivo en la
 * carpeta equivocada no se puede distinguir después de uno bien archivado.
 *
 * La regla que queda: cuando falta una señal que alguien puede aportar, el
 * backend falla ruidoso y con `code` discriminador. El silencio se reserva para
 * lo que de verdad no tiene remedio ni consecuencia.
 */
export class ErrorPathIrresoluble extends Error {
  constructor(
    readonly code: MotivoPathIrresoluble,
    message: string
  ) {
    super(message)
    this.name = 'ErrorPathIrresoluble'
  }
}

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
  rol_sii?: string
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
 * @throws {ErrorPathIrresoluble} si falta cualquiera de los tres datos. Ninguno
 * admite fallback: un path sin código, sin año o sin cliente no es auditable, y
 * es preferible cortar antes de tocar Dropbox.
 */
export async function resolverContextoSolicitud(
  solicitudId: string,
  codigoExtDelPayload: string
): Promise<ContextoSolicitud> {
  const solicitud = await getRecord<SolicitudFields>(TX_SOLICITUDES, solicitudId)
  if (!solicitud) {
    throw new ErrorPathIrresoluble(
      'solicitud_irresoluble',
      `la solicitud ${solicitudId} no existe en TX_Solicitudes`
    )
  }

  const f = solicitud.fields
  const codigoSolicitud = (f.codigo_solicitud || f.codigo_ext || codigoExtDelPayload).trim()
  if (!codigoSolicitud) {
    throw new ErrorPathIrresoluble(
      'solicitud_irresoluble',
      `la solicitud ${solicitudId} no tiene código`
    )
  }

  // `fecha_solicitud` es el dato de negocio; `createdTime` es el respaldo para
  // las filas que lo tienen vacío. Los dos caen casi siempre en el mismo año, y
  // un año aproximado es mejor que una subida caída.
  const fechaSolicitud = new Date(f.fecha_solicitud || solicitud.createdTime)
  if (Number.isNaN(fechaSolicitud.getTime())) {
    throw new ErrorPathIrresoluble(
      'solicitud_irresoluble',
      `fecha_solicitud ilegible en ${solicitudId}`
    )
  }

  /**
   * Sin cliente no hay segmento `{Cliente}` y no se inventa uno. El caso existe
   * en la base real —VP-2026-0044 no tiene el link poblado al 07-ago-2026— y es
   * precisamente por eso que no puede pasar en silencio: es un dato maestro
   * incompleto que alguien tiene que arreglar, no un estado legítimo.
   */
  const clienteId = f.cliente?.[0]
  if (!clienteId) {
    throw new ErrorPathIrresoluble(
      'cliente_sin_vincular',
      `la solicitud ${codigoSolicitud} no tiene cliente vinculado`
    )
  }

  const cliente = await getRecord<ClienteFields>(M_CLIENTES, clienteId)
  const nombre = cliente?.fields.nombre?.trim()
  if (!nombre) {
    throw new ErrorPathIrresoluble(
      'cliente_sin_vincular',
      `el cliente ${clienteId} de ${codigoSolicitud} no tiene nombre`
    )
  }

  return { codigoSolicitud, clienteNombre: nombre, fechaSolicitud }
}

interface UnidadDelPath {
  id: string
  subtipo: string | null
  numeroUnidad: string | null
  rolSii: string | null
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
    fields: ['subtipo', 'numero_unidad', 'rol_sii', 'orden', 'solicitud'],
  })

  return records.map((r, i) => ({
    id: r.id,
    subtipo: r.fields.subtipo?.trim() || null,
    numeroUnidad: r.fields.numero_unidad?.trim() || null,
    rolSii: r.fields.rol_sii?.trim() || null,
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
    rolSii: unidad.rolSii,
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
 * La auto-derivación cubre dos casos y **falla en el tercero**:
 *
 * - **Sin unidades declaradas → `_ingreso/`.** Es exactamente su definición:
 *   adjuntos cargados antes de que existan unidades (§8.1).
 * - **Una sola unidad → esa unidad.** Es el caso (a) de la nota de diseño §9.1
 *   del plan: se deduce sin preguntar porque no hay ambigüedad posible.
 * - **Dos o más → `unidad_no_especificada`.** No se elige por el operador.
 *
 * Sobre el tercero (CI-003b, 07-ago-2026): la versión inicial mandaba estos
 * adjuntos a `comun/` con un warning. Parecía la opción conservadora —`comun/`
 * es una carpeta legítima y no atribuye el archivo a una unidad equivocada—
 * pero enmascara el caso (b) de §9.1, el selector de unidad que el checklist
 * todavía no tiene: la subida "funciona", nadie se entera de que falta el
 * selector, y los archivos se acumulan en `comun/` con un path que ya no se
 * recalcula (CI-004). Fallar aquí hace visible la deuda de UX en el único
 * momento en que importa, y no cuesta datos: no hay archivo que reubicar.
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
    // desincronizado o un id manipulado. Tampoco se degrada a `comun/`: sería
    // el mismo fallback silencioso con otra causa.
    throw new ErrorPathIrresoluble(
      'unidad_no_pertenece',
      `la unidad ${entrada.unidadId} no pertenece a ${entrada.codigoSolicitud}`
    )
  }

  if (unidades.length === 0) return { tipo: 'ingreso' }
  if (unidades.length === 1) return casoDeUnidad(unidades[0], unidades)

  throw new ErrorPathIrresoluble(
    'unidad_no_especificada',
    `${entrada.codigoSolicitud} tiene ${unidades.length} unidades y el adjunto no declara a cuál pertenece`
  )
}
