import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P5-TAS · B3 — la cadena de persistencia de una foto de la visita.
 *
 * El contrato que se protege acá es el de **CI-052 visto desde el cliente**: la
 * segunda llamada de la cadena tiene que ser un `PATCH` contra
 * `/api/tasaciones/[id]/fotos` con el `adjuntoId` que devolvió la subida, y
 * nunca un `POST` que cree una fila nueva.
 *
 * El otro invariante es `subido_por: 'Tasador'`. Es la clase de defecto que no
 * se nota: la foto sube, se guarda, y simplemente no vuelve nunca al listado
 * porque el `GET` filtra por ese literal.
 */

const uploadConReintentos = vi.fn()

vi.mock('@/lib/adjuntos-uploader', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/adjuntos-uploader')>()
  return {
    ...real,
    uploadConReintentos: (...args: unknown[]) => uploadConReintentos(...args),
  }
})

import {
  categorizarFoto,
  eliminarFotoDeVisita,
  leerFotosDeVisita,
  subirFotoDeVisita,
  SUBIDO_POR_TASADOR,
} from './fotos'

const SOLICITUD = 'recAAAAAAAAAAAAAA'
const CODIGO = 'VP-2026-0060'
const ADJUNTO = 'recFOTO1234567890'.slice(0, 17)

const archivo = () =>
  new File([new Uint8Array([1, 2, 3])], 'IMG_1.jpg', { type: 'image/jpeg' })

function respuesta(cuerpo: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => cuerpo,
  } as Response
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue(respuesta({ data: {} }))
  uploadConReintentos.mockResolvedValue({
    ok: true,
    adjunto_id: ADJUNTO,
    url_dropbox: '/VProperty/VP-2026-0060/IMG_1.jpg',
    nombre_archivo: 'IMG_1.jpg',
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('subirFotoDeVisita · la cadena completa', () => {
  it('sube declarando subido_por = Tasador', async () => {
    await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
    })

    expect(uploadConReintentos).toHaveBeenCalledTimes(1)
    const [params] = uploadConReintentos.mock.calls[0]
    expect(params.subido_por).toBe('Tasador')
    expect(SUBIDO_POR_TASADOR).toBe('Tasador')
  })

  it('la foto del cuadro de comparables declara tipo_documento para disparar RF-09', async () => {
    await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'ofertas_comparables',
    })

    // Sin este código `TX_Adjuntos.clave_adjunto` queda vacío y AT-RF09-Trigger
    // salta la extracción (RN-25): el webhook nunca se llama y la sección D
    // queda en «0 de 3 comparables leídos».
    const [params] = uploadConReintentos.mock.calls[0]
    expect(params.tipo_documento).toBe('foto_ofertas_comparables')
  })

  it('una foto de registro normal no declara tipo_documento', async () => {
    await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
    })

    const [params] = uploadConReintentos.mock.calls[0]
    expect(params.tipo_documento).toBeUndefined()
  })

  it('no manda destino de unidad: el backend lo auto-deriva', async () => {
    await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
    })

    // Precedente de B5 (`unidadesParaPath()` devuelve []): Pantalla 3 no tiene
    // selector de unidad, así que con dos o más el backend responde 422 y el
    // tasador ve su literal humano. Comportamiento declarado, no accidente.
    const [params] = uploadConReintentos.mock.calls[0]
    expect(params.unidad_id).toBeUndefined()
    expect(params.carpeta).toBeUndefined()
  })

  it('categoriza con PATCH sobre el adjunto que devolvió la subida (CI-052)', async () => {
    const res = await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
      orden: 2,
    })

    expect(res.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`/api/tasaciones/${SOLICITUD}/fotos`)
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({
      adjuntoId: ADJUNTO,
      categoria: 'cocina',
      orden: 2,
    })
  })

  it('devuelve la foto con el record ID de TX_Adjuntos', async () => {
    const res = await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
    })

    expect(res.ok && res.foto.id).toBe(ADJUNTO)
    expect(res.ok && res.foto.categoria).toBe('cocina')
  })

  it('no categoriza si la subida falló', async () => {
    uploadConReintentos.mockResolvedValue({
      ok: false,
      error: 'Este archivo supera el límite de 7 MB. Comprímelo o divídelo.',
      reintentable: false,
    })

    const res = await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
    })

    expect(res.ok).toBe(false)
    expect(res.ok === false && res.reintentable).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('trata como reintentable un 200 de Make sin adjunto_id', async () => {
    uploadConReintentos.mockResolvedValue({ ok: true })

    const res = await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
    })

    expect(res.ok).toBe(false)
    expect(res.ok === false && res.reintentable).toBe(true)
  })

  it('si la categorización falla, el fallo es reintentable y la foto ya está a salvo', async () => {
    fetchMock.mockResolvedValue(respuesta({ error: 'x' }, false, 502))

    const res = await subirFotoDeVisita({
      file: archivo(),
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      categoria: 'cocina',
    })

    // No se compensa borrando: el archivo ya está en Dropbox, que es lo caro de
    // recuperar en terreno. Reintentar es barato — la subida se deduplica por
    // hash y el PATCH es idempotente.
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.reintentable).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('categorizarFoto · también sirve para recategorizar', () => {
  it('no vuelve a subir el binario', async () => {
    const res = await categorizarFoto(SOLICITUD, ADJUNTO, 'fachada_exterior')

    expect(res.ok).toBe(true)
    expect(uploadConReintentos).not.toHaveBeenCalled()
    expect(fetchMock.mock.calls[0][1].method).toBe('PATCH')
  })

  it('devuelve el literal humano que mandó el servidor', async () => {
    fetchMock.mockResolvedValue(
      respuesta({ error: 'No encontramos esta foto entre las de tu tasación.' }, false, 404),
    )

    const res = await categorizarFoto(SOLICITUD, ADJUNTO, 'cocina')

    expect(res.ok).toBe(false)
    expect(res.mensaje).toBe('No encontramos esta foto entre las de tu tasación.')
  })
})

describe('leerFotosDeVisita', () => {
  it('proyecta la respuesta del GET, hash incluido', async () => {
    fetchMock.mockResolvedValue(
      respuesta({
        data: {
          fotos: [
            {
              id: ADJUNTO,
              categoria: 'cocina',
              nombre: 'IMG_1.jpg',
              url: '/ruta/IMG_1.jpg',
              thumbnailUrl: null,
              hashMd5: 'abc123',
            },
          ],
        },
      }),
    )

    const fotos = await leerFotosDeVisita(SOLICITUD)

    expect(fotos).toHaveLength(1)
    expect(fotos[0].hashMd5).toBe('abc123')
  })

  it('lanza si el GET no responde bien, para no vaciar la pantalla en silencio', async () => {
    fetchMock.mockResolvedValue(respuesta({}, false, 500))

    await expect(leerFotosDeVisita(SOLICITUD)).rejects.toThrow()
  })
})

describe('eliminarFotoDeVisita · §8.6.3', () => {
  it('no intenta borrar sin hash', async () => {
    const ok = await eliminarFotoDeVisita({
      adjuntoId: ADJUNTO,
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      hashMd5: null,
    })

    // El endpoint exige `hash_md5` con `min(1)`: sin él respondería 400. La
    // salvaguarda de integridad no es opcional.
    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('manda el hash y se identifica como Tasador', async () => {
    fetchMock.mockResolvedValue(respuesta({ ok: true }))

    const ok = await eliminarFotoDeVisita({
      adjuntoId: ADJUNTO,
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      hashMd5: 'abc123',
    })

    expect(ok).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`/api/adjuntos/${ADJUNTO}`)
    expect(init.method).toBe('DELETE')
    expect(JSON.parse(init.body)).toMatchObject({
      hash_md5: 'abc123',
      subido_por: 'Tasador',
    })
  })

  it('devuelve false si Make no confirmó el borrado', async () => {
    fetchMock.mockResolvedValue(respuesta({ ok: false }, true, 200))

    const ok = await eliminarFotoDeVisita({
      adjuntoId: ADJUNTO,
      solicitudId: SOLICITUD,
      codigoExt: CODIGO,
      hashMd5: 'abc123',
    })

    expect(ok).toBe(false)
  })
})
