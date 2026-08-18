/**
 * Borrado de registros de Airtable para IF-03.
 *
 * Tanda P2-TAS.A · complementa `lib/airtable-client.ts`, **no lo reemplaza**.
 *
 * ## Por qué existe este archivo
 *
 * `lib/airtable-client.ts` expone `listRecords`, `getRecord`, `createRecord` y
 * `updateRecord`, pero **no `deleteRecord`**, y sus helpers `request` /
 * `postRequest` son privados. IF-02 nunca necesitó borrar: sus bajas pasan por
 * Make (`SC-Adjuntos-Delete`). IF-03 es el primer consumidor que borra directo
 * contra la API REST, porque el sync de las tablas hijas de `/datos` es
 * destructivo (RO-31).
 *
 * Agregar `deleteRecord` a `lib/airtable-client.ts` sería **editar territorio
 * IF-02**, que R5 prohíbe. La alternativa que el plan §0.4·nota 3 declaraba
 * preferente —un módulo bajo `lib/tasador/` que lo envuelva— es la que se
 * aplica acá.
 *
 * ⚠ **Revisión de OV-8.** El override declaró innecesario este archivo porque
 * `createRecord` y `listRecords` ya existían. Es cierto para esas dos, y por
 * eso este módulo **no las duplica**: aporta sólo lo que falta. OV-8 evaluó las
 * funciones que el plan nombraba, y `deleteRecord` no estaba en esa lista.
 *
 * ## Convenciones heredadas
 *
 * Mismo `API_BASE`, misma política de reintento (3 intentos en 429 y 5xx, con
 * `Retry-After` cuando viene) y mismo `AirtableError(status, texto)` que
 * `lib/airtable-client.ts`, del que se importa el tipo de error para que un
 * `catch` de ruta no tenga que distinguir de dónde salió el fallo —
 * `desdeExcepcion()` mapea `AirtableError` a 502 sin saber quién lo lanzó.
 */

import { AirtableError } from '@/lib/airtable-client'

const API_BASE = 'https://api.airtable.com/v0'

/** Máximo de registros por request del endpoint bulk de Airtable. */
const MAX_POR_LOTE = 10

async function deleteRequest(url: string, attempt = 1): Promise<Response> {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN is not configured')

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (res.status === 429 && attempt < 3) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? attempt)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    return deleteRequest(url, attempt + 1)
  }

  if (res.status >= 500 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 500 * attempt))
    return deleteRequest(url, attempt + 1)
  }

  return res
}

/**
 * Borra registros de una tabla. Devuelve cuántos se borraron.
 *
 * ⚠ **Es destructivo y no se deshace.** Sólo debe llamarse sobre filas que
 * pertenecen en exclusiva al registro padre (RO-31): las hijas de captura de
 * una solicitud. Para filas que alimentan datos compartidos —`TX_Comparables`
 * y su `aporta_a_historico`— la baja correcta es **desligar**, vaciando el
 * Link, y eso se hace con `updateRecord`, no con esta función.
 *
 * ## Las dos guardas
 *
 * 1. **Array vacío → 0 sin llamar.** El endpoint bulk responde `422 "records"
 *    must be a non-empty array of record IDs` ante una lista vacía. Es
 *    exactamente el error que costó el fallo F-1 de `SC-Edicion` (ver
 *    `CLAUDE.md`), donde el plural del mensaje despistó sobre la causa. Un sync
 *    que no tiene nada que borrar es el caso **normal**, no un error: cortar
 *    acá evita un 502 espurio en cada guardado que no quita filas.
 * 2. **Troceo de a 10.** Es el máximo por request. Mandar 15 ids devuelve 422
 *    y no borra ninguno.
 *
 * Los lotes se emiten en serie, no en paralelo: el borrado en paralelo sobre la
 * misma tabla es la vía rápida al 429, y el reintento no compensa el ahorro.
 */
export async function deleteRecords(tableId: string, recordIds: string[]): Promise<number> {
  if (recordIds.length === 0) return 0

  const baseId = process.env.AIRTABLE_BASE_ID
  if (!baseId) throw new Error('AIRTABLE_BASE_ID is not configured')

  let borrados = 0

  for (let i = 0; i < recordIds.length; i += MAX_POR_LOTE) {
    const lote = recordIds.slice(i, i + MAX_POR_LOTE)
    const query = lote.map((id) => `records[]=${encodeURIComponent(id)}`).join('&')
    const res = await deleteRequest(`${API_BASE}/${baseId}/${tableId}?${query}`)

    if (!res.ok) {
      throw new AirtableError(res.status, await res.text())
    }

    const cuerpo = (await res.json()) as { records?: { id: string; deleted: boolean }[] }
    borrados += (cuerpo.records ?? []).filter((r) => r.deleted).length
  }

  return borrados
}
