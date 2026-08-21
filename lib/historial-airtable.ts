import { listRecords } from '@/lib/airtable-client'
import { fetchCoordinacionSolicitud } from '@/lib/coordinacion-airtable'
import { detalleDeCoordinacion, tituloDeCoordinacion } from '@/lib/coordinacion'
import {
  fundirHistorial,
  iconoDeEvento,
  tituloDeCambio,
  tituloDeEvento,
  type ItemHistorial,
} from '@/lib/historial'
import { relativeTime } from '@/lib/solicitudes'

// Verificadas vía MCP 2026-07-04 y re-verificadas vía REST 11-ago-2026.
export const A_EVENTOS = 'tblMKmDg2KrO5fMn8'
export const A_CAMBIOS = 'tbl6Yd0c7MRqNeC0x'

/** Nombre de la tabla tal como `A_Cambios.tabla_origen` lo escribe. */
const TABLA_ORIGEN_SOLICITUDES = 'TX_Solicitudes'

type EventoFields = {
  tipo_evento?: string
  descripcion?: string
  actor?: string
  actor_nombre?: string
  timestamp?: string
}

type CambioFields = {
  tabla_origen?: string
  registro_id?: string
  campo_modificado?: string
  valor_anterior?: string
  valor_nuevo?: string
  modificado_por_email?: string
  razon_cambio?: string
  timestamp?: string
}

function escapar(valor: string): string {
  return valor.replace(/"/g, '\\"')
}

/**
 * Quién hizo la acción, en algo que se le pueda mostrar a una persona.
 *
 * `A_Eventos.actor` trae el **clerk user id** crudo (`user_3GBF4Jp…`) en las 50
 * filas que lo tienen pobladas, y `actor_nombre` está vacío en las 66 — o sea,
 * en toda la tabla. Mostrar el id sería exponer jerga técnica (§6.1), así que se
 * omite el autor cuando lo único disponible es un identificador.
 *
 * Resolver el id a nombre exigiría una lectura extra de `AUTH_Usuarios` por cada
 * evento; queda pendiente para cuando los escenarios Make empiecen a poblar
 * `actor_nombre`, que es donde corresponde que viva el dato.
 */
function autorLegible(valor: string | undefined): string | undefined {
  const v = valor?.trim()
  if (!v) return undefined
  if (/^user_[A-Za-z0-9]+$/.test(v)) return undefined
  return v
}

/**
 * Eventos de `A_Eventos` para una solicitud, ya mapeados al riel.
 *
 * ⚠ Recibe el **código** (`VP-2026-0054`), no el record ID. `solicitud` es un
 * campo Link y dentro de un `filterByFormula` un link se evalúa contra el
 * *primary field* de la tabla destino —que en `TX_Solicitudes` es
 * `codigo_solicitud`— nunca contra el record ID (E-076/E-077). Interpolar un
 * `rec…` acá devuelve **cero filas siempre**, sin error: el historial se ve
 * vacío y es indistinguible de "no hay eventos".
 */
export async function fetchEventosPorSolicitud(
  codigoSolicitud: string
): Promise<ItemHistorial[]> {
  // Sin código no hay filtro posible: devolver [] es preferible a emitir una
  // fórmula con FIND("") que matchea todas las filas de A_Eventos.
  if (!codigoSolicitud || codigoSolicitud.includes('"')) return []

  // Delimitado con comas a ambos lados para exigir match de token exacto: un
  // FIND suelto haría que "VP-2026-0054" matchee dentro de "VP-2026-00541" el
  // día que el correlativo pase de 4 dígitos.
  const formula = `FIND(",${codigoSolicitud},", "," & ARRAYJOIN({solicitud}, ",") & ",") > 0`

  const records = await listRecords<EventoFields>(A_EVENTOS, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: formula,
    'sort[0][field]': 'timestamp',
    'sort[0][direction]': 'desc',
    fields: ['tipo_evento', 'descripcion', 'actor', 'actor_nombre', 'timestamp'],
  })

  return records.map((r) => ({
    id: r.id,
    titulo: tituloDeEvento(r.fields.descripcion, r.fields.tipo_evento),
    autor: autorLegible(r.fields.actor_nombre) ?? autorLegible(r.fields.actor),
    // `timestamp` llega formateado por `cellFormat: 'string'`, así que no sirve
    // para ordenar; `createdTime` es ISO y siempre viene. Las filas de esta
    // tabla son append-only, de modo que ambos coinciden en la práctica.
    timestamp: r.createdTime,
    hace: relativeTime(r.createdTime),
    origen: 'evento' as const,
    icono: iconoDeEvento(r.fields.tipo_evento),
  }))
}

/**
 * Cambios auditados de `A_Cambios` para una solicitud.
 *
 * ⚠ A diferencia de `A_Eventos`, esta tabla **no tiene campo Link a la
 * solicitud**: la referencia vive en `registro_id` (`singleLineText`) junto a
 * `tabla_origen`, porque `A_Cambios` audita varias tablas —hoy hay filas de
 * `TX_Solicitudes` y de `C_ReglasNegocio`—. Por eso el filtro es igualdad de
 * texto contra el **record ID**, y no la traducción a código que exige
 * `A_Eventos`. Filtrar sólo por `registro_id` sin `tabla_origen` funcionaría hoy
 * por la unicidad de los `rec…`, pero deja de expresar la intención en cuanto
 * se audite otra tabla.
 */
export async function fetchCambiosPorSolicitud(
  solicitudId: string
): Promise<ItemHistorial[]> {
  if (!solicitudId || solicitudId.includes('"')) return []

  const formula = `AND({tabla_origen}="${TABLA_ORIGEN_SOLICITUDES}",{registro_id}="${escapar(solicitudId)}")`

  const records = await listRecords<CambioFields>(A_CAMBIOS, {
    filterByFormula: formula,
    'sort[0][field]': 'timestamp',
    'sort[0][direction]': 'desc',
    fields: [
      'tabla_origen',
      'registro_id',
      'campo_modificado',
      'valor_anterior',
      'valor_nuevo',
      'modificado_por_email',
      'razon_cambio',
      'timestamp',
    ],
  })

  return records.map((r) => ({
    id: r.id,
    titulo: tituloDeCambio(
      r.fields.campo_modificado,
      r.fields.valor_anterior,
      r.fields.valor_nuevo
    ),
    autor: autorLegible(r.fields.modificado_por_email),
    timestamp: r.fields.timestamp ?? r.createdTime,
    hace: relativeTime(r.fields.timestamp ?? r.createdTime),
    origen: 'cambio' as const,
    icono: 'edit' as const,
    detalle: r.fields.razon_cambio?.trim() || undefined,
  }))
}

/**
 * Intentos de coordinación de `TX_CoordinacionVisita` mapeados al riel (C4 ·
 * **RF-TAS-05**).
 *
 * ⚠ **No lee Airtable por su cuenta**: delega entero en
 * `fetchCoordinacionSolicitud` (C2), que ya resuelve el filtro por el lookup
 * `solicitud_record_id`, el orden por `fecha_respuesta` y la proyección de los
 * nueve campos. Acá sólo se traduce cada intento a `ItemHistorial`. Duplicar el
 * `filterByFormula` de la tabla sería un segundo sitio donde el filtro se puede
 * romper sin que nada lo note.
 *
 * Recibe el **record ID**, como `fetchCambiosPorSolicitud` y a diferencia de
 * `fetchEventosPorSolicitud`, que necesita el código.
 *
 * ## Sin intentos no hay filas
 *
 * Cero intentos devuelve `[]` y el riel queda exactamente como estaba antes de
 * C4. **No se agrega una fila "sin coordinar"** (RO-34): el timeline es la
 * secuencia de lo que pasó, y "no pasó nada todavía" no es un hito. Eso ya lo
 * dice la sección *Coordinación* de la pestaña Datos, que es donde corresponde.
 *
 * ## El autor no se muestra (§6.1)
 *
 * `TX_CoordinacionVisita.autor_clerk_id` trae el identificador crudo de Clerk
 * (`user_3GBF4Jp…`), el mismo formato que `autorLegible()` descarta más arriba
 * para `A_Eventos`. Resolverlo a nombre exige una lectura extra de
 * `AUTH_Usuarios` por ítem; es la misma deuda ya documentada en este módulo, no
 * una nueva.
 */
export async function fetchCoordinacionParaHistorial(
  solicitudId: string
): Promise<ItemHistorial[]> {
  const { intentos } = await fetchCoordinacionSolicitud(solicitudId)

  return intentos.map((intento) => ({
    id: intento.id,
    titulo: tituloDeCoordinacion(intento),
    // Sin autor a propósito — ver el docblock.
    timestamp: intento.fechaRespuesta,
    hace: relativeTime(intento.fechaRespuesta),
    origen: 'coordinacion' as const,
    icono: 'phone' as const,
    detalle: detalleDeCoordinacion(intento),
  }))
}

/**
 * Timeline completo de §1.3.3: eventos + cambios + coordinación, en un solo
 * riel cronológico.
 *
 * Las tres lecturas son independientes, así que corren en paralelo. Una lectura
 * que falle **no** degrada a lista vacía: se propaga, porque un historial
 * incompleto que se ve completo es peor que un error visible — la Ejecutiva no
 * tendría forma de saber que le falta un tercio de la secuencia.
 *
 * ⚠ **Consecuencia asumida desde C4**: `TX_CoordinacionVisita` ilegible deja el
 * timeline **entero** en error, no sólo sus filas. Es deliberado y es el mismo
 * criterio que ya regía para las otras dos; degradar sólo la coordinación
 * crearía dos criterios de fallo dentro de la misma función, y el más laxo
 * terminaría aplicándose por costumbre al que no debía.
 *
 * ## Historia de esta sección, para no repetir diagnósticos viejos
 *
 * Hasta el 19-ago-2026 la coordinación no se leía porque `TX_CoordinacionVisita`
 * **no existía en la base**. Después existió (`tblBwMErRxo57ML2r`, creada en
 * P4-TAS al cerrarse CI-012 en positivo) pero **faltaba construir la lectura**,
 * que quedó fuera de P4-TAS por tocar superficie de IF-02. Esa lectura se
 * construyó en **C2** (`lib/coordinacion-airtable.ts`) y **se funde acá desde
 * C4**. Ninguna de las dos frases anteriores sigue vigente: si aparecen citadas
 * en otro documento, están superadas.
 *
 * Lo que **sigue** fuera de alcance, y no es omisión de este módulo: las
 * **descargas** de documentos no se registran en ninguna tabla (`A_Accesos`
 * existe pero nadie la escribe).
 */
export async function fetchHistorialSolicitud(
  solicitudId: string,
  codigoSolicitud: string
): Promise<ItemHistorial[]> {
  const [eventos, cambios, coordinacion] = await Promise.all([
    fetchEventosPorSolicitud(codigoSolicitud),
    fetchCambiosPorSolicitud(solicitudId),
    fetchCoordinacionParaHistorial(solicitudId),
  ])

  return fundirHistorial(eventos, cambios, coordinacion)
}
