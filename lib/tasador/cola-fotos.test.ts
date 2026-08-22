import { describe, expect, it, vi } from 'vitest'
import {
  archivoDeCola,
  drenarCola,
  esIdDeCola,
  type AlmacenCola,
  type FotoEnCola,
} from './cola-fotos'

/**
 * P5-TAS · B4 — la política de drenaje de la cola offline (§6.1 · §0.2).
 *
 * Lo que se prueba es **qué hace la cola ante cada desenlace**, que es donde una
 * decisión equivocada cuesta caro: descartar una foto reintentable la pierde
 * para siempre —el tasador ya no está en la propiedad—, y reintentar
 * indefinidamente una que nunca va a entrar deja la cola atascada y la batería
 * consumida.
 *
 * El acceso a IndexedDB se inyecta: abrir una base de datos no es la parte que
 * puede equivocarse.
 */

const registro = (id: string, categoria = 'cocina'): FotoEnCola => ({
  id,
  solicitudId: 'recAAAAAAAAAAAAAA',
  codigoExt: 'VP-2026-0060',
  categoria,
  nombre: `${id}.jpg`,
  mimeType: 'image/jpeg',
  blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' }),
  creadoEn: `2026-08-22T10:0${id.slice(-1)}:00.000Z`,
  intentos: 0,
})

function almacenFalso(inicial: FotoEnCola[]) {
  const cola = [...inicial]
  const almacen: AlmacenCola = {
    listar: async () => [...cola],
    eliminar: async (id) => {
      const i = cola.findIndex((r) => r.id === id)
      if (i >= 0) cola.splice(i, 1)
    },
    marcar: async (r) => {
      const i = cola.findIndex((x) => x.id === r.id)
      if (i >= 0) cola[i] = { ...r, intentos: r.intentos + 1 }
    },
  }
  return { almacen, cola }
}

describe('esIdDeCola', () => {
  it('distingue una foto en cola de una ya persistida', () => {
    expect(esIdDeCola('cola-abc')).toBe(true)
    expect(esIdDeCola('recFOTO123456789')).toBe(false)
  })
})

describe('archivoDeCola', () => {
  it('reconstruye el File con su nombre y tipo', () => {
    const archivo = archivoDeCola(registro('cola-1'))
    expect(archivo.name).toBe('cola-1.jpg')
    expect(archivo.type).toBe('image/jpeg')
  })
})

describe('drenarCola', () => {
  it('sube todo y vacía la cola cuando hay señal', async () => {
    const { almacen, cola } = almacenFalso([registro('cola-1'), registro('cola-2')])
    const subir = vi.fn().mockResolvedValue({ ok: true, reintentable: false })

    const res = await drenarCola('recAAAAAAAAAAAAAA', subir, almacen)

    expect(res).toEqual({ subidas: 2, pendientes: 0 })
    expect(cola).toHaveLength(0)
  })

  it('se detiene en el primer fallo reintentable y conserva lo que queda', async () => {
    const { almacen, cola } = almacenFalso([
      registro('cola-1'),
      registro('cola-2'),
      registro('cola-3'),
    ])
    const subir = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, reintentable: false })
      .mockResolvedValueOnce({ ok: false, reintentable: true })

    const res = await drenarCola('recAAAAAAAAAAAAAA', subir, almacen)

    // La señal se cayó otra vez: no tiene sentido intentar con la tercera.
    expect(subir).toHaveBeenCalledTimes(2)
    expect(res.subidas).toBe(1)
    expect(res.pendientes).toBe(2)
    expect(cola.map((r) => r.id)).toEqual(['cola-2', 'cola-3'])
  })

  it('cuenta el intento fallido, para poder decir «reintentando»', async () => {
    const { almacen, cola } = almacenFalso([registro('cola-1')])
    const subir = vi.fn().mockResolvedValue({ ok: false, reintentable: true })

    await drenarCola('recAAAAAAAAAAAAAA', subir, almacen)

    expect(cola[0].intentos).toBe(1)
  })

  it('descarta un fallo definitivo y sigue con las demás', async () => {
    const { almacen, cola } = almacenFalso([registro('cola-1'), registro('cola-2')])
    const subir = vi
      .fn()
      // Archivo demasiado grande, o path irresoluble: reintentar no lo arregla.
      .mockResolvedValueOnce({ ok: false, reintentable: false })
      .mockResolvedValueOnce({ ok: true, reintentable: false })

    const res = await drenarCola('recAAAAAAAAAAAAAA', subir, almacen)

    expect(res).toEqual({ subidas: 1, pendientes: 0 })
    expect(cola).toHaveLength(0)
  })

  it('con la cola vacía no intenta nada', async () => {
    const { almacen } = almacenFalso([])
    const subir = vi.fn()

    const res = await drenarCola('recAAAAAAAAAAAAAA', subir, almacen)

    expect(subir).not.toHaveBeenCalled()
    expect(res).toEqual({ subidas: 0, pendientes: 0 })
  })

  it('sube de a una, nunca en paralelo', async () => {
    const { almacen } = almacenFalso([
      registro('cola-1'),
      registro('cola-2'),
      registro('cola-3'),
    ])
    let enVuelo = 0
    let maximo = 0
    const subir = vi.fn().mockImplementation(async () => {
      enVuelo += 1
      maximo = Math.max(maximo, enVuelo)
      await Promise.resolve()
      enVuelo -= 1
      return { ok: true, reintentable: false }
    })

    await drenarCola('recAAAAAAAAAAAAAA', subir, almacen)

    // La cola existe porque la conexión es mala: tres subidas simultáneas sobre
    // un enlace que apenas sostiene una fallan las tres.
    expect(maximo).toBe(1)
  })
})
