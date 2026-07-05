const API_BASE = 'https://api.airtable.com/v0'

export class AirtableError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'AirtableError'
  }
}

async function request(url: string, attempt = 1): Promise<Response> {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN is not configured')

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

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
