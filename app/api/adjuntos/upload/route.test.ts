import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * E2-A · T-VP0067-LECTURA-FIX-20260929 — veto server-side a archivos Word.
 *
 * Lo que estos tests protegen: el cliente ya restringe a PDF/JPG/PNG, pero el
 * Route Handler aceptaba cualquier `mime_type`. Un docx que se colara llegaba
 * al pipeline de extracción y viajaba a la API de Claude como bloque "image"
 * con mime docx, degradando la corrida (caso VP-0067). El rechazo tiene que
 * ocurrir aquí, antes de componer el path y de tocar Dropbox/Make.
 */

const auth = vi.fn()
const postToMake = vi.fn()
const resolverContextoSolicitud = vi.fn()
const resolverCasoPath = vi.fn()
const componerCarpetaDropbox = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({ auth: () => auth() }))

vi.mock('@/lib/make-client', () => ({
  postToMake: (...args: unknown[]) => postToMake(...args),
}))

vi.mock('@/lib/dropbox-path-contexto', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/dropbox-path-contexto')>()
  return {
    ...real,
    resolverContextoSolicitud: (...args: unknown[]) => resolverContextoSolicitud(...args),
    resolverCasoPath: (...args: unknown[]) => resolverCasoPath(...args),
  }
})

vi.mock('@/lib/dropbox-path', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/dropbox-path')>()
  return {
    ...real,
    componerCarpetaDropbox: (...args: unknown[]) => componerCarpetaDropbox(...args),
  }
})

// Import estático — ver la nota del test de `asignar/route.test.ts`.
import { POST } from './route'

const MENSAJE_ARCHIVO_WORD =
  'Este archivo está en Word y no podemos leerlo. Súbelo en PDF o como imagen (JPG o PNG).'

/** Payload base válido; cada caso pisa `nombre_archivo` / `mime_type`. */
function payloadBase(overrides: Record<string, unknown> = {}) {
  return {
    solicitud_id: 'recAAAAAAAAAAAAAA',
    codigo_ext: 'VP-0067',
    nombre_archivo: 'certificado.pdf',
    mime_type: 'application/pdf',
    tamanio_kb: 120,
    hash_md5: 'abc123',
    subido_por: 'Ejecutivo',
    contenido_base64: 'JVBERi0xLjQ=',
    ...overrides,
  }
}

function llamar(body: unknown) {
  const request = { json: async () => body } as never
  return POST(request)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('MAKE_WEBHOOK_URL_ADJUNTOS', 'https://hook.eu1.make.com/test')
  vi.stubEnv('MAKE_HMAC_SECRET', 'secreto-de-prueba')
  auth.mockResolvedValue({ userId: 'user_123' })
  resolverContextoSolicitud.mockResolvedValue({ codigoSolicitud: 'VP-0067' })
  resolverCasoPath.mockResolvedValue({ tipo: 'sin_unidades' })
  componerCarpetaDropbox.mockReturnValue('/VProperty/Tasaciones/VP-0067')
  postToMake.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ ok: true, adjunto_id: 'recADJ00000000001' }),
    text: async () => '',
  })
})

describe('veto a archivos Word (E2-A · VP-0067)', () => {
  it('rechaza con 400 un payload con mime docx', async () => {
    const res = await llamar(
      payloadBase({
        nombre_archivo: 'tasacion.docx',
        mime_type:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    )
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      ok: false,
      error: MENSAJE_ARCHIVO_WORD,
      reintentable: false,
    })
  })

  it('rechaza con 400 un mime .doc legado', async () => {
    const res = await llamar(
      payloadBase({ nombre_archivo: 'informe.doc', mime_type: 'application/msword' })
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe(MENSAJE_ARCHIVO_WORD)
  })

  it('rechaza por extensión aunque el mime sea genérico (case-insensitive)', async () => {
    // El navegador puede reportar `application/octet-stream`; la extensión es
    // la segunda red de contención.
    const res = await llamar(
      payloadBase({ nombre_archivo: 'algo.DOCX', mime_type: 'application/octet-stream' })
    )
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      ok: false,
      error: MENSAJE_ARCHIVO_WORD,
      reintentable: false,
    })
  })

  it('no llega a Dropbox ni a Make cuando el veto se activa', async () => {
    await llamar(
      payloadBase({ nombre_archivo: 'tasacion.docx', mime_type: 'application/msword' })
    )
    expect(resolverContextoSolicitud).not.toHaveBeenCalled()
    expect(postToMake).not.toHaveBeenCalled()
  })

  it('un PDF válido no cae en el rechazo Word', async () => {
    const res = await llamar(payloadBase())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.error).not.toBe(MENSAJE_ARCHIVO_WORD)
    expect(postToMake).toHaveBeenCalledTimes(1)
  })
})
