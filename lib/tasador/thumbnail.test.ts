import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { generarThumbnailDataUri, MAX_CHARS_THUMBNAIL } from './thumbnail'

/**
 * T-VP0067-IMAGENES-UI — el generador de thumbnails es **best-effort**.
 *
 * Los dos contratos que se protegen acá:
 *
 * 1. **Nunca lanza y nunca bloquea la subida**: todo entorno incapaz (SSR sin
 *    `document`, imagen indecodificable, canvas tainted) devuelve `null`.
 * 2. **El techo de 95k es duro**: si el JPEG a calidad 0.72 no cabe, se
 *    reintenta con más compresión (y menos resolución) hasta caber, y si ni el
 *    último escalón cabe, `null` — jamás un string que el PATCH rechazaría.
 *
 * El canvas se mockea entero (vitest corre en node, sin DOM): lo que se prueba
 * es la lógica de reintento y las guardas, no el codec JPEG del navegador.
 */

const UN_JPEG = (chars: number) =>
  `data:image/jpeg;base64,${'A'.repeat(Math.max(0, chars - 23))}`

const archivo = () =>
  new File([new Uint8Array([1, 2, 3])], 'IMG_1.jpg', { type: 'image/jpeg' })

/** Canvas falso: registra dimensiones y delega toDataURL en el mock del test. */
function stubCanvas(toDataURL: ReturnType<typeof vi.fn>) {
  const canvases: Array<{ width: number; height: number }> = []
  const drawImage = vi.fn()
  vi.stubGlobal('document', {
    createElement: vi.fn(() => {
      const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({ drawImage })),
        toDataURL,
      }
      canvases.push(canvas)
      return canvas
    }),
  })
  return { canvases, drawImage }
}

function stubBitmap(ancho = 4000, alto = 3000) {
  const close = vi.fn()
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width: ancho, height: alto, close })),
  )
  return { close }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('generarThumbnailDataUri · guardas de entorno', () => {
  it('devuelve null sin document (SSR) — la subida no puede fallar por esto', async () => {
    // Entorno node de vitest: no hay document ni canvas. Ni siquiera debe
    // intentar decodificar.
    await expect(generarThumbnailDataUri(archivo())).resolves.toBeNull()
  })

  it('devuelve null si la imagen no se puede decodificar, sin lanzar', async () => {
    stubCanvas(vi.fn())
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => {
        throw new Error('formato ilegible')
      }),
    )
    // Sin fallback posible (node no tiene Image), el resultado es null y la
    // excepción del decodificador no se propaga al caller.
    await expect(generarThumbnailDataUri(archivo())).resolves.toBeNull()
  })

  it('devuelve null ante el "data:," de un canvas vacío o tainted', async () => {
    stubBitmap()
    stubCanvas(vi.fn(() => 'data:,'))

    await expect(generarThumbnailDataUri(archivo())).resolves.toBeNull()
  })
})

describe('generarThumbnailDataUri · redimensión', () => {
  it('escala el lado mayor a 1000 px conservando proporción', async () => {
    stubBitmap(4000, 3000)
    const toDataURL = vi.fn(() => UN_JPEG(50_000))
    const { canvases, drawImage } = stubCanvas(toDataURL)

    const uri = await generarThumbnailDataUri(archivo())

    expect(uri).toBe(UN_JPEG(50_000))
    expect(canvases[0]).toMatchObject({ width: 1000, height: 750 })
    expect(drawImage).toHaveBeenCalledTimes(1)
    // El contrato de calidad del primer intento: 0.72.
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.72)
  })

  it('no agranda una foto más chica que el lado objetivo', async () => {
    stubBitmap(640, 480)
    const { canvases } = stubCanvas(vi.fn(() => UN_JPEG(10_000)))

    await generarThumbnailDataUri(archivo())

    expect(canvases[0]).toMatchObject({ width: 640, height: 480 })
  })

  it('libera el bitmap incluso en el camino feliz', async () => {
    const { close } = stubBitmap()
    stubCanvas(vi.fn(() => UN_JPEG(10_000)))

    await generarThumbnailDataUri(archivo())

    expect(close).toHaveBeenCalledTimes(1)
  })
})

describe('generarThumbnailDataUri · techo de 95k caracteres', () => {
  it('reintenta con más compresión hasta caber bajo el techo', async () => {
    stubBitmap()
    // 0.72 y 0.6 exceden; 0.5 cabe justo.
    const toDataURL = vi
      .fn()
      .mockReturnValueOnce(UN_JPEG(140_000))
      .mockReturnValueOnce(UN_JPEG(110_000))
      .mockReturnValueOnce(UN_JPEG(MAX_CHARS_THUMBNAIL))
    stubCanvas(toDataURL)

    const uri = await generarThumbnailDataUri(archivo())

    expect(uri).not.toBeNull()
    expect(uri!.length).toBeLessThanOrEqual(MAX_CHARS_THUMBNAIL)
    expect(toDataURL).toHaveBeenNthCalledWith(1, 'image/jpeg', 0.72)
    expect(toDataURL).toHaveBeenNthCalledWith(2, 'image/jpeg', 0.6)
    expect(toDataURL).toHaveBeenNthCalledWith(3, 'image/jpeg', 0.5)
  })

  it('baja la resolución cuando ninguna calidad alcanza a 1000 px', async () => {
    stubBitmap(4000, 3000)
    // Los 4 escalones de calidad a 1000 px exceden; el primero a 720 px cabe.
    const toDataURL = vi
      .fn()
      .mockReturnValueOnce(UN_JPEG(200_000))
      .mockReturnValueOnce(UN_JPEG(180_000))
      .mockReturnValueOnce(UN_JPEG(150_000))
      .mockReturnValueOnce(UN_JPEG(120_000))
      .mockReturnValueOnce(UN_JPEG(80_000))
    const { canvases } = stubCanvas(toDataURL)

    const uri = await generarThumbnailDataUri(archivo())

    expect(uri).toBe(UN_JPEG(80_000))
    expect(canvases[1]).toMatchObject({ width: 720, height: 540 })
  })

  it('devuelve null si ni el último escalón cabe: nunca un string sobre el techo', async () => {
    stubBitmap()
    const toDataURL = vi.fn(() => UN_JPEG(96_000))
    stubCanvas(toDataURL)

    await expect(generarThumbnailDataUri(archivo())).resolves.toBeNull()
    // Agotó la escalera completa: 3 resoluciones × 4 calidades.
    expect(toDataURL).toHaveBeenCalledTimes(12)
  })
})
