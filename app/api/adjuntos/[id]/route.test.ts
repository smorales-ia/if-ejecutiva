import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P14-TAS-CASCADE · `DELETE /api/adjuntos/[id]` — el cascade de comparables.
 *
 * Lo que estos tests protegen es el ORDEN alrededor de Make: la captura ocurre
 * **antes** del borrado (si no, Airtable ya habría limpiado `adjunto_origen`) y
 * la purga **sólo** tras `data.ok`. Y que ningún fallo del cascade cambie el 200
 * de un borrado que sí ocurrió.
 */

const auth = vi.fn()
const verificarRN59 = vi.fn()
const postToMake = vi.fn()
const capturarDerivadosDeAdjunto = vi.fn()
const purgarDerivadosCapturados = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({ auth: () => auth() }))

vi.mock('@/lib/rn59', () => ({
  verificarRN59: (...args: unknown[]) => verificarRN59(...args),
}))

vi.mock('@/lib/make-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/make-client')>()
  return { ...real, postToMake: (...args: unknown[]) => postToMake(...args) }
})

vi.mock('@/lib/adjuntos-cascade', () => ({
  capturarDerivadosDeAdjunto: (...args: unknown[]) => capturarDerivadosDeAdjunto(...args),
  purgarDerivadosCapturados: (...args: unknown[]) => purgarDerivadosCapturados(...args),
}))

import { DELETE } from './route'

const ID = 'recAAAAAAAAAAAAAA'
const SOLICITUD = 'recBBBBBBBBBBBBBB'
const CODIGO = 'VP-2026-0060'

function makeResponse(ok: boolean, body: unknown) {
  return {
    ok,
    status: ok ? 200 : 502,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

function llamar(body: unknown = undefined, id = ID) {
  const cuerpo =
    body ?? { solicitud_id: SOLICITUD, codigo_ext: CODIGO, hash_md5: 'abc123', subido_por: 'Tasador' }
  const request = { json: async () => cuerpo } as never
  return DELETE(request, { params: Promise.resolve({ id }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('MAKE_WEBHOOK_URL_ADJUNTOS_DELETE', 'https://hook.eu1.make.com/test')
  vi.stubEnv('MAKE_HMAC_SECRET', 'secreto-de-prueba')
  auth.mockResolvedValue({ userId: 'user_123' })
  verificarRN59.mockResolvedValue({ tipo: 'ok' })
  capturarDerivadosDeAdjunto.mockResolvedValue([])
  purgarDerivadosCapturados.mockResolvedValue({ borrados: 0, desligados: 0, errores: 0 })
  postToMake.mockResolvedValue(makeResponse(true, { ok: true, adjunto_id: '77', airtable_borrado: true }))
})

describe('cascade en el borrado', () => {
  it('captura los derivados ANTES de llamar a Make', async () => {
    await llamar()

    expect(capturarDerivadosDeAdjunto).toHaveBeenCalledWith(ID, CODIGO)
    expect(capturarDerivadosDeAdjunto.mock.invocationCallOrder[0]).toBeLessThan(
      postToMake.mock.invocationCallOrder[0]
    )
  })

  it('tras data.ok, purga lo capturado y responde 200', async () => {
    const capturados = [
      { id: 'recCOMP1', tabla: 'tblComparables', aportaHistorico: false },
      { id: 'recCOMP2', tabla: 'tblComparables', aportaHistorico: true },
    ]
    capturarDerivadosDeAdjunto.mockResolvedValue(capturados)

    const res = await llamar()

    expect(purgarDerivadosCapturados).toHaveBeenCalledWith(capturados)
    expect(res.status).toBe(200)
  })

  it('si Make no borró nada (mismatch), NO purga', async () => {
    postToMake.mockResolvedValue(makeResponse(true, { ok: false, reason: 'mismatch' }))

    const res = await llamar()

    expect(res.status).toBe(409)
    expect(purgarDerivadosCapturados).not.toHaveBeenCalled()
  })

  it('un fallo del cascade NO cambia el 200', async () => {
    purgarDerivadosCapturados.mockRejectedValue(new Error('boom'))

    const res = await llamar()

    expect(res.status).toBe(200)
  })

  it('un fallo de la captura no aborta el borrado (sigue a Make y responde 200)', async () => {
    capturarDerivadosDeAdjunto.mockRejectedValue(new Error('lectura caída'))

    const res = await llamar()

    expect(postToMake).toHaveBeenCalled()
    expect(res.status).toBe(200)
  })

  it('idempotencia: un segundo borrado (ya_no_existia) responde 200 y purga vacío', async () => {
    // El primer borrado ya se llevó las filas derivadas; el segundo no captura
    // nada y la purga es no-op. Make responde ok con `ya_no_existia`.
    postToMake.mockResolvedValue(makeResponse(true, { ok: true, ya_no_existia: true }))
    capturarDerivadosDeAdjunto.mockResolvedValue([])

    const res = await llamar()

    expect(res.status).toBe(200)
    expect(purgarDerivadosCapturados).toHaveBeenCalledWith([])
  })
})
