const API_BASE = 'https://api.airtable.com/v0'

export class AirtableError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'AirtableError'
  }
}

/**
 * ¿El fallo es de red y vale la pena reintentarlo?
 *
 * `fetch` de Node no lanza `AirtableError` ni devuelve un status cuando la
 * conexión no llega a establecerse: lanza `TypeError: fetch failed` con la causa
 * real anidada —típicamente un `AggregateError` con `code: 'ETIMEDOUT'`, uno por
 * cada IP que resolvió el DNS—. Sin mirar la causa, todos esos casos se
 * confunden con un error de programación.
 *
 * Detectado el 22-ago-2026 verificando IF-03 sobre WSL2: la salida a
 * `api.airtable.com` cae de forma intermitente y el mismo endpoint alterna 200 y
 * 500 en la misma sesión. El código no tenía nada malo; simplemente no
 * reintentaba lo único que estaba fallando.
 */
export function esFalloDeRedTransitorio(err: unknown): boolean {
  const CODIGOS = new Set([
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'EAI_AGAIN',
    'ENOTFOUND',
    'EPIPE',
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_SOCKET',
  ])

  // La causa puede venir anidada varios niveles (TypeError → AggregateError →
  // Error), así que se recorre la cadena en vez de mirar sólo el primer nivel.
  let actual: unknown = err
  for (let nivel = 0; nivel < 5 && actual; nivel++) {
    if (typeof actual !== 'object') break
    const e = actual as { code?: string; errors?: unknown[]; cause?: unknown }

    if (e.code && CODIGOS.has(e.code)) return true
    if (Array.isArray(e.errors) && e.errors.some((sub) => esFalloDeRedTransitorio(sub))) {
      return true
    }
    actual = e.cause
  }

  // Último recurso: el mensaje. `fetch failed` es el texto que Node emite para
  // todo fallo de transporte, y no hay ningún caso en que reintentarlo sea peor
  // que devolver un 500 al usuario.
  return err instanceof TypeError && /fetch failed/i.test(err.message)
}

/**
 * Lectura con reintentos.
 *
 * ⚠ El reintento ante fallo de red vive **sólo acá y no en `postRequest`**. Una
 * lectura es idempotente y repetirla no tiene consecuencias; una escritura que
 * falla por red puede haber llegado igualmente al servidor, y reintentar un
 * `createRecord` a ciegas duplicaría el registro. Ésa es exactamente la clase de
 * duplicación que CI-052 acaba de cerrar, y no se reintroduce por la puerta del
 * cliente HTTP.
 */
async function request(url: string, attempt = 1): Promise<Response> {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN is not configured')

  let res: Response
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
  } catch (err) {
    if (attempt < 3 && esFalloDeRedTransitorio(err)) {
      // Backoff igual al de los 5xx: el enlace intermitente se recupera en
      // cientos de milisegundos, y esperar más castiga al usuario en terreno.
      await new Promise((r) => setTimeout(r, 500 * attempt))
      return request(url, attempt + 1)
    }
    throw err
  }

  if (res.status === 429 && attempt < 3) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? attempt)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    return request(url, attempt + 1)
  }

  if (res.status >= 500 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 500 * attempt))
    return request(url, attempt + 1)
  }

  return res
}

export interface AirtableRecord<T> {
  id: string
  createdTime: string
  fields: T
}

/** Formato de record ID de Airtable (`recXXXXXXXXXXXXXX`). */
const RECORD_ID_RE = /^rec[a-zA-Z0-9]{14}$/

export function isValidRecordId(id: string): boolean {
  return RECORD_ID_RE.test(id)
}

type Params = Record<string, string | string[]>

export async function listRecords<T>(
  tableId: string,
  params: Params = {}
): Promise<AirtableRecord<T>[]> {
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!baseId) throw new Error('AIRTABLE_BASE_ID is not configured')

  const all: AirtableRecord<T>[] = []
  let offset: string | undefined

  do {
    const url = new URL(`${API_BASE}/${baseId}/${tableId}`)
    for (const [key, val] of Object.entries(params)) {
      if (Array.isArray(val)) {
        for (const v of val) url.searchParams.append(`${key}[]`, v)
      } else {
        url.searchParams.set(key, val)
      }
    }
    if (offset) url.searchParams.set('offset', offset)

    const res = await request(url.toString())
    if (!res.ok) {
      throw new AirtableError(res.status, await res.text())
    }

    const body = (await res.json()) as {
      records: AirtableRecord<T>[]
      offset?: string
    }
    all.push(...body.records)
    offset = body.offset
  } while (offset)

  return all
}

/**
 * Parámetros que el endpoint *Get record* de Airtable acepta en la querystring.
 * Cualquier otro — `fields` incluido — hace fallar la petición con
 * `422 INVALID_REQUEST_UNKNOWN: parameter validation failed`.
 * @see https://airtable.com/developers/web/api/get-record
 */
const GET_RECORD_ALLOWED_PARAMS = new Set([
  'cellFormat',
  'timeZone',
  'userLocale',
  'returnFieldsByFieldId',
])

/**
 * Lee un registro por id.
 *
 * `fields` se acepta en la firma —por compatibilidad con los llamadores y
 * porque expresa la intención de proyección— pero **no se propaga a Airtable**:
 * a diferencia de *List records*, el endpoint *Get record* no soporta ese
 * parámetro y responde 422 ante su sola presencia (con o sin corchetes).
 * Consecuencia: el registro llega completo y la proyección queda como
 * documentación del llamador. Si Airtable llegara a soportarlo, basta con
 * añadir `fields` a `GET_RECORD_ALLOWED_PARAMS`.
 * @see https://airtable.com/developers/web/api/get-record
 */
export async function getRecord<T>(
  tableId: string,
  recordId: string,
  params: Params = {}
): Promise<AirtableRecord<T> | null> {
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!baseId) throw new Error('AIRTABLE_BASE_ID is not configured')

  const url = new URL(`${API_BASE}/${baseId}/${tableId}/${recordId}`)
  for (const [key, val] of Object.entries(params)) {
    if (!GET_RECORD_ALLOWED_PARAMS.has(key)) continue
    if (Array.isArray(val)) {
      for (const v of val) url.searchParams.append(`${key}[]`, v)
    } else {
      url.searchParams.set(key, val)
    }
  }

  const res = await request(url.toString())
  if (res.status === 404) return null
  if (!res.ok) {
    throw new AirtableError(res.status, await res.text())
  }

  return (await res.json()) as AirtableRecord<T>
}

async function postRequest(
  url: string,
  body: unknown,
  attempt = 1,
  method: 'POST' | 'PATCH' = 'POST'
): Promise<Response> {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN is not configured')

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (res.status === 429 && attempt < 3) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? attempt)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    return postRequest(url, body, attempt + 1, method)
  }

  if (res.status >= 500 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 500 * attempt))
    return postRequest(url, body, attempt + 1, method)
  }

  return res
}

/**
 * Crea un registro en una tabla de Airtable. `typecast: true` permite que
 * Airtable resuelva valores de singleSelect por nombre sin fallar si el
 * llamador no conoce el choice id exacto.
 */
export async function createRecord<T>(
  tableId: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord<T>> {
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!baseId) throw new Error('AIRTABLE_BASE_ID is not configured')

  const url = `${API_BASE}/${baseId}/${tableId}`
  const res = await postRequest(url, { fields, typecast: true })
  if (!res.ok) {
    throw new AirtableError(res.status, await res.text())
  }

  return (await res.json()) as AirtableRecord<T>
}

/**
 * Actualiza campos de un registro existente (`PATCH`: los campos ausentes del
 * payload quedan intactos, no se vacían).
 *
 * Sólo para **datos derivados server-side**. Las escrituras de negocio de IF-02
 * siguen pasando por Make (`lib/make-client.ts`): la máquina de estados vive en
 * Airtable/Make y esta función no es la puerta trasera para saltárselo. Su caso
 * de uso es el motor de SLA, que materializa timestamps calculados a partir de
 * datos que ya están en la base.
 */
export async function updateRecord<T>(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord<T>> {
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!baseId) throw new Error('AIRTABLE_BASE_ID is not configured')

  const url = `${API_BASE}/${baseId}/${tableId}/${recordId}`
  const res = await postRequest(url, { fields, typecast: true }, 1, 'PATCH')
  if (!res.ok) {
    throw new AirtableError(res.status, await res.text())
  }

  return (await res.json()) as AirtableRecord<T>
}
