import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Tanda C · C-5 — el motor calcula, Make persiste.
 *
 * Lo que estos tests protegen es el reparto de RT-03: el Route Handler agrega
 * seis campos calculados al payload y **no escribe Airtable**. Si algún día
 * alguien cambiara `persistir: false` por `true`, habría dos escritores para la
 * misma fila —este handler y SC-Asignar— y las escrituras se pisarían sin que
 * ningún test lo notara. Por eso hay una aserción explícita sobre el modo.
 */

const auth = vi.fn()
const getRecord = vi.fn()
const postToMake = vi.fn()
const marcarFinEtapa = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({ auth: () => auth() }))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, getRecord: (...args: unknown[]) => getRecord(...args) }
})

vi.mock('@/lib/make-client', () => ({
  postToMake: (...args: unknown[]) => postToMake(...args),
}))

vi.mock('@/lib/sla-etapas', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/sla-etapas')>()
  return {
    ...real,
    marcarFinEtapa: (...args: unknown[]) => marcarFinEtapa(...args),
  }
})

// Import estático — ver la nota del test de `sla/route.test.ts`.
import { POST } from './route'

const ID = 'recAAAAAAAAAAAAAA'
const MSG_RED = 'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/** Los seis campos de C-5, tal como los devuelve `marcarFinEtapa`. */
const CAMPOS_SLA = {
  sla_e1_fin_ts: '2026-08-10T15:40:00.000Z',
  sla_e2_inicio_ts: '2026-08-10T15:40:00.000Z',
  sla_etapa_actual: 2,
  sla_etapa_alerta_ts: '2026-08-10T19:40:00.000Z',
  sla_etapa_vence_ts: '2026-08-10T21:40:00.000Z',
  sla_recalculado_ts: '2026-08-10T15:40:00.000Z',
}

function llamar(body: unknown = { tasadorId: 'recTASADOR000001' }, id = ID) {
  const request = { json: async () => body } as never
  return POST(request, { params: Promise.resolve({ id }) })
}

/** Payload que el handler envió a Make en la última llamada. */
function payloadEnviado(): Record<string, unknown> {
  return postToMake.mock.calls.at(-1)?.[1] as Record<string, unknown>
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('MAKE_WEBHOOK_URL_SC_ASIGNAR', 'https://hook.eu1.make.com/test')
  vi.stubEnv('MAKE_HMAC_SECRET', 'secreto-de-prueba')
  auth.mockResolvedValue({ userId: 'user_123' })
  // Sin tasador y en estado `creada`: la solicitud es asignable.
  getRecord.mockResolvedValue({ id: ID, createdTime: '', fields: { tasador: '', estado: 'creada' } })
  marcarFinEtapa.mockResolvedValue({ campos: { ...CAMPOS_SLA } })
  postToMake.mockResolvedValue({ ok: true, status: 200, text: async () => '' })
})

describe('happy path', () => {
  it('responde 200 y agrega los seis campos de SLA al payload de SC-Asignar', async () => {
    const res = await llamar()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(payloadEnviado()).toMatchObject({ solicitudId: ID, ...CAMPOS_SLA })
  })

  it('nombra las claves igual que los campos de TX_Solicitudes', async () => {
    // El blueprint las lee como `{{1.sla_e1_fin_ts}}`: si el handler las
    // renombrara a camelCase, Make mapearía vacío y Airtable no cambiaría —el
    // silent 200 de E-078, esta vez sólo sobre el reloj.
    await llamar()
    for (const clave of Object.keys(CAMPOS_SLA)) {
      expect(payloadEnviado()).toHaveProperty(clave)
    }
  })

  it('calcula la transición e1 → e2 en modo no persistente', async () => {
    await llamar()
    expect(marcarFinEtapa).toHaveBeenCalledWith(ID, 1, undefined, { persistir: false })
  })

  it('calcula antes de disparar el webhook', async () => {
    // Al revés, un fallo del motor dejaría la solicitud asignada y sin reloj, y
    // nadie se enteraría.
    const orden: string[] = []
    marcarFinEtapa.mockImplementation(async () => {
      orden.push('motor')
      return { campos: { ...CAMPOS_SLA } }
    })
    postToMake.mockImplementation(async () => {
      orden.push('make')
      return { ok: true, status: 200, text: async () => '' }
    })
    await llamar()
    expect(orden).toEqual(['motor', 'make'])
  })
})

describe('el motor no escribe Airtable (RT-03)', () => {
  it('no llama a updateRecord en ninguna rama', async () => {
    const cliente = await import('@/lib/airtable-client')
    const update = vi.spyOn(cliente, 'updateRecord')
    await llamar()
    expect(update).not.toHaveBeenCalled()
  })
})

describe('degradación honesta del reloj', () => {
  it('asigna igual si el motor falla, y omite las claves en vez de mandarlas vacías', async () => {
    // El reloj es instrumentación; la asignación es la operación de negocio.
    // Y una clave ausente no es lo mismo que una clave en "" para el módulo de
    // Airtable de Make.
    marcarFinEtapa.mockRejectedValue(new Error('C_SLA_Etapas no responde'))
    const res = await llamar()
    expect(res.status).toBe(200)
    for (const clave of Object.keys(CAMPOS_SLA)) {
      expect(payloadEnviado()).not.toHaveProperty(clave)
    }
  })

  it('no recalcula si e1 ya estaba cerrada (guard de idempotencia del motor)', async () => {
    marcarFinEtapa.mockResolvedValue(null)
    const res = await llamar()
    expect(res.status).toBe(200)
    expect(payloadEnviado()).not.toHaveProperty('sla_e1_fin_ts')
  })
})

describe('guards previos, intactos', () => {
  it('responde 401 sin sesión Clerk', async () => {
    auth.mockResolvedValue({ userId: null })
    expect((await llamar()).status).toBe(401)
  })

  it('responde 404 ante un id sin formato de record', async () => {
    expect((await llamar(undefined, 'no-es-un-record')).status).toBe(404)
  })

  it('responde 404 cuando la solicitud no existe', async () => {
    getRecord.mockResolvedValue(null)
    expect((await llamar()).status).toBe(404)
  })

  it('responde 422 si falta el tasador', async () => {
    const res = await llamar({})
    expect(res.status).toBe(422)
    expect((await res.json()).error).toBe('validacion')
  })

  it('responde 409 si la solicitud ya tiene tasador (REGLA A · idempotencia)', async () => {
    getRecord.mockResolvedValue({
      id: ID,
      createdTime: '',
      fields: { tasador: 'Sergio Gajardo', estado: 'asignada' },
    })
    const res = await llamar()
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('conflicto_negocio')
  })

  it('no corre el motor ni dispara Make cuando el 409 se activa', async () => {
    // Si el motor corriera antes del guard, un segundo click movería los
    // umbrales de la etapa hacia adelante aunque la asignación se rechace.
    getRecord.mockResolvedValue({
      id: ID,
      createdTime: '',
      fields: { tasador: 'Sergio Gajardo', estado: 'asignada' },
    })
    await llamar()
    expect(marcarFinEtapa).not.toHaveBeenCalled()
    expect(postToMake).not.toHaveBeenCalled()
  })

  it('responde 409 en estados terminales', async () => {
    for (const estado of ['cancelada', 'cerrada']) {
      getRecord.mockResolvedValue({ id: ID, createdTime: '', fields: { tasador: '', estado } })
      expect((await llamar()).status).toBe(409)
    }
  })
})

describe('webhook sin configurar', () => {
  it('en producción devuelve 503, nunca 200 con bandera silenciosa', async () => {
    vi.stubEnv('MAKE_WEBHOOK_URL_SC_ASIGNAR', '')
    vi.stubEnv('NODE_ENV', 'production')
    const res = await llamar()
    expect(res.status).toBe(503)
    expect((await res.json()).error).toBe(MSG_RED)
  })

  it('en desarrollo devuelve 202 con pendiente_make, que la UI no confunde con éxito', async () => {
    vi.stubEnv('MAKE_WEBHOOK_URL_SC_ASIGNAR', '')
    vi.stubEnv('NODE_ENV', 'development')
    const res = await llamar()
    expect(res.status).toBe(202)
    expect(await res.json()).toEqual({ ok: false, pendiente_make: true })
  })
})

describe('errores de Make', () => {
  it('traduce un error de Make a 502 con mensaje humano', async () => {
    postToMake.mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' })
    const res = await llamar()
    expect(res.status).toBe(502)
    expect((await res.json()).error).toBe(MSG_RED)
  })
})
