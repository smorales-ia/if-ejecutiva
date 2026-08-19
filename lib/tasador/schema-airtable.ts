/**
 * Lectura de **schema** de Airtable (Meta API) — módulo server-only.
 *
 * Tanda P4-TAS · bloque 4+5. Sirve los valores de un `singleSelect` para que la
 * UI no los hardcodee: es la realización de **A-17**, cuyo criterio de
 * aceptación es que agregar una opción desde Airtable llegue a la pantalla
 * **sin deploy**.
 *
 * ## Por qué no vive en `lib/airtable-client.ts` — RO-37
 *
 * `airtable-client.ts` es superficie compartida con IF-02, en producción desde
 * hace meses (**R5**). Agregarle un cliente de Meta API por una necesidad de
 * IF-03 amplía el radio de impacto de esta tanda a la consola de la Ejecutiva
 * sin que nada de IF-02 lo pida. La capacidad se aísla acá y **se promueve a
 * `airtable-client.ts` el día que IF-02 la necesite**, no antes.
 *
 * ## Meta API, no API de registros
 *
 * Las opciones de un `singleSelect` son **schema**, no datos: viven en
 * `/v0/meta/bases/{baseId}/tables` y no aparecen en ninguna respuesta de
 * *List records*. Es el primer consumo de Meta API del repositorio.
 *
 * ⚠ El token necesita scope **`schema.bases:read`**. Es distinto del que usan
 * las lecturas de registros, y un token sin él responde **403** con un cuerpo
 * que no dice cuál falta. Si esta ruta empieza a devolver el literal genérico
 * de error sin causa aparente, ése es el primer sitio donde mirar.
 *
 * ## Caché
 *
 * Un catálogo de dominio cambia una vez cada meses y el select se abre muchas
 * veces por jornada. Se cachea con TTL, mismo patrón que `mapaComunas()` de
 * `lectura-tasacion.ts`. La caché es **por proceso**: en Railway con más de una
 * instancia, cada una tiene la suya, y el peor caso tras un cambio en Airtable
 * es que una instancia sirva el catálogo viejo durante el TTL. Aceptable para
 * un catálogo de cuatro valores; no lo sería para datos de negocio.
 */

import { AirtableError } from '@/lib/airtable-client'

const API_META_BASE = 'https://api.airtable.com/v0/meta/bases'

/** Igual que en `mapaComunas()`: cinco minutos. */
const TTL_MS = 5 * 60 * 1000

interface ChoiceMeta {
  id?: string
  name?: string
}

interface FieldMeta {
  id?: string
  name?: string
  type?: string
  options?: { choices?: ChoiceMeta[] }
}

interface TableMeta {
  id?: string
  name?: string
  fields?: FieldMeta[]
}

interface RespuestaMeta {
  tables?: TableMeta[]
}

/** Clave `tableId::fieldId` → opciones, con su vencimiento. */
const cache = new Map<string, { valor: readonly string[]; expira: number }>()

/** Invalida la caché de schema. Sólo para tests. */
export function _resetCacheSchema(): void {
  cache.clear()
}

/**
 * Nombres de las opciones de un `singleSelect`, **en el orden en que están
 * definidas en Airtable**.
 *
 * El orden importa y no se toca: es el que el desplegable muestra, y el diseño
 * v4 lo fija en `p19_2.png`. Reordenar acá —alfabéticamente, por ejemplo—
 * cambiaría la pantalla sin que nadie lo hubiera pedido.
 *
 * @throws {AirtableError} Si la Meta API falla, si la tabla o el campo no
 * existen, o si el campo no es un `singleSelect`. **No degrada a lista vacía**:
 * un catálogo vacío en la UI es indistinguible de "no hay motivos", y el
 * llamador tiene que poder decir "no pudimos cargar" en vez de mentir.
 */
export async function opcionesDeSingleSelect(
  tableId: string,
  fieldId: string,
): Promise<readonly string[]> {
  const clave = `${tableId}::${fieldId}`
  const ahora = Date.now()

  const enCache = cache.get(clave)
  if (enCache && enCache.expira > ahora) return enCache.valor

  const baseId = process.env.AIRTABLE_BASE_ID
  if (!baseId) throw new Error('AIRTABLE_BASE_ID is not configured')

  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN is not configured')

  const res = await fetch(`${API_META_BASE}/${baseId}/tables`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new AirtableError(
      res.status,
      `Meta API respondió ${res.status} al leer el schema de ${tableId}`,
    )
  }

  const cuerpo = (await res.json()) as RespuestaMeta
  const tabla = cuerpo.tables?.find((t) => t.id === tableId)
  if (!tabla) {
    throw new AirtableError(404, `La tabla ${tableId} no está en el schema de la base`)
  }

  const campo = tabla.fields?.find((f) => f.id === fieldId)
  if (!campo) {
    throw new AirtableError(404, `El campo ${fieldId} no está en ${tableId}`)
  }

  if (campo.type !== 'singleSelect') {
    throw new AirtableError(
      422,
      `${fieldId} es de tipo ${campo.type ?? 'desconocido'}, no singleSelect`,
    )
  }

  const valor = Object.freeze(
    (campo.options?.choices ?? [])
      .map((c) => (c.name ?? '').trim())
      .filter((n) => n !== ''),
  )

  cache.set(clave, { valor, expira: ahora + TTL_MS })
  return valor
}
