import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * T-PDF-IMPRENTA-20260927 — el 409 y el contrato de `POST /generar-pdf`.
 *
 * La ruta es el único puente UI → imprenta: entrega el `InformeContexto` al
 * webhook de E2 y NO escribe estado (eso lo hace el pipeline). Cada rechazo
 * afirma el status **y** que `postToMake` no se llamó: un 409 que igual
 * disparó el render duplicaría PDFs en Dropbox.
 */

const lecturaInformeContexto = vi.fn()
const postToMake = vi.fn()

vi.mock('@/lib/informe/ensamblador', () => ({
  lecturaInformeContexto: (...args: unknown[]) => lecturaInformeContexto(...args),
}))

vi.mock('@/lib/make-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/make-client')>()
  return { ...real, postToMake: (...args: unknown[]) => postToMake(...args) }
})

import { POST } from './route'
import { MENSAJES } from '@/lib/tasador/mensajes'

const ID = 'recAAAAAAAAAAAAAA'
const CODIGO = 'VP-2026-0067'

function contextoConEstado(estado: string) {
  return {
    ok: true,
    contexto: { meta: { codigo: CODIGO, estado } },
  }
}

function llamar(id = ID) {
  const request = {} as never
  return POST(request, { params: Promise.resolve({ id }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('MAKE_WEBHOOK_E2', 'https://hook.eu1.make.com/test-e2')
  postToMake.mockResolvedValue({ ok: true })
})

describe('POST /api/tasaciones/[id]/generar-pdf', () => {
  it('rechaza 409 sin llamar a Make cuando el estado no permite imprimir', async () => {
    lecturaInformeContexto.mockResolvedValue(contextoConEstado('asignada'))

    const res = await llamar()
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).toBe(MENSAJES.estadoNoPermite)
    expect(postToMake).not.toHaveBeenCalled()
  })

  it('propaga el guard cuando la solicitud no es del tasador', async () => {
    lecturaInformeContexto.mockResolvedValue({
      ok: false,
      guard: { ok: false, status: 404, mensaje: 'No encontramos esta tasación.' },
    })

    const res = await llamar()

    expect(res.status).toBe(404)
    expect(postToMake).not.toHaveBeenCalled()
  })

  it('entrega el contexto completo al webhook de E2 en estado calculada', async () => {
    lecturaInformeContexto.mockResolvedValue(contextoConEstado('calculada'))

    const res = await llamar()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual({ id: ID, enviado: true })
    expect(postToMake).toHaveBeenCalledTimes(1)
    const [url, payload, opts] = postToMake.mock.calls[0]
    expect(url).toBe('https://hook.eu1.make.com/test-e2')
    expect(payload.solicitud_codigo).toBe(CODIGO)
    expect(payload.contexto.meta.codigo).toBe(CODIGO)
    expect(opts.escenario).toBe('E2_Carbone_Render')
  })

  it('permite re-emitir desde pdf_listo (nueva versión del documento)', async () => {
    lecturaInformeContexto.mockResolvedValue(contextoConEstado('pdf_listo'))

    const res = await llamar()

    expect(res.status).toBe(200)
    expect(postToMake).toHaveBeenCalledTimes(1)
  })

  it('responde 502 con mensaje humano si Make rechaza el webhook', async () => {
    lecturaInformeContexto.mockResolvedValue(contextoConEstado('calculada'))
    postToMake.mockResolvedValue({ ok: false, status: 500 })

    const res = await llamar()
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe(MENSAJES.errorGenerico)
  })

  it('responde 503 sin llamar a Make si falta MAKE_WEBHOOK_E2', async () => {
    vi.stubEnv('MAKE_WEBHOOK_E2', '')
    lecturaInformeContexto.mockResolvedValue(contextoConEstado('calculada'))

    const res = await llamar()

    expect(res.status).toBe(503)
    expect(postToMake).not.toHaveBeenCalled()
  })
})
