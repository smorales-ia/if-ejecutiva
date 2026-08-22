import { describe, expect, it } from 'vitest'
import { fotosPorCategoriaVacias, repartirFotos } from './reparto-fotos'
import { CATEGORIAS_FOTO, type FotoAdjunta, type FotoCategoriaCustom } from '@/lib/tasaciones'

/**
 * P5-TAS · B2 — la hidratación del organizador desde `GET /fotos`.
 *
 * Es el punto donde un error no se ve: una foto mal repartida no lanza ni deja
 * traza, sólo aparece en la categoría equivocada —o desaparece— y el tasador lo
 * descubre cuando ya no está en la propiedad.
 */

const foto = (categoria: string, n = 1): FotoAdjunta => ({
  id: `recF${String(n).padStart(13, '0')}`,
  categoria,
  nombre: `IMG_${n}.jpg`,
  url: `/VProperty/${categoria}/IMG_${n}.jpg`,
  thumbnailUrl: null,
  hashMd5: `hash-${n}`,
})

describe('las ocho del catálogo', () => {
  it('parte con las ocho vacías, ni una más', () => {
    const vacias = fotosPorCategoriaVacias()
    expect(Object.keys(vacias)).toHaveLength(8)
    expect(Object.values(vacias).every((v) => v.length === 0)).toBe(true)
  })

  it('reparte cada foto a la categoría cuyo id trae', () => {
    const { fotosPredefinidas } = repartirFotos(
      [foto('cocina', 1), foto('banos', 2), foto('banos', 3)],
      [],
    )

    expect(fotosPredefinidas.cocina).toHaveLength(1)
    expect(fotosPredefinidas.banos).toHaveLength(2)
    expect(fotosPredefinidas.living_comedor).toHaveLength(0)
  })

  it('conserva el orden de llegada dentro de cada categoría', () => {
    const { fotosPredefinidas } = repartirFotos(
      [foto('banos', 1), foto('banos', 2), foto('banos', 3)],
      [],
    )

    expect(fotosPredefinidas.banos.map((f) => f.nombre)).toEqual([
      'IMG_1.jpg',
      'IMG_2.jpg',
      'IMG_3.jpg',
    ])
  })

  it('acepta los ocho ids reales del catálogo', () => {
    const todas = CATEGORIAS_FOTO.map((c, i) => foto(c.id, i))
    const { fotosPredefinidas, categoriasCustom } = repartirFotos(todas, [])

    expect(Object.values(fotosPredefinidas).every((v) => v.length === 1)).toBe(true)
    // Ninguna de las ocho debe haberse tomado por personalizada.
    expect(categoriasCustom).toHaveLength(0)
  })
})

describe('categorías personalizadas', () => {
  const bodega = (fotos: FotoAdjunta[] = []): FotoCategoriaCustom => ({
    id: 'cat-1',
    nombre: 'Bodega',
    minimo: 0,
    fotos,
  })

  it('una recién creada y todavía vacía sobrevive al refresco', () => {
    // El servidor no la conoce: no tiene fotos, así que no viene en GET /fotos.
    // Si el reparto se construyera sólo con lo del servidor, desaparecería
    // delante del tasador que acaba de crearla.
    const { categoriasCustom } = repartirFotos([], [bodega()])

    expect(categoriasCustom).toHaveLength(1)
    expect(categoriasCustom[0].nombre).toBe('Bodega')
    expect(categoriasCustom[0].fotos).toHaveLength(0)
  })

  it('las fotos del servidor caen en la categoría local que ya existe', () => {
    const { categoriasCustom } = repartirFotos([foto('Bodega', 7)], [bodega()])

    expect(categoriasCustom).toHaveLength(1)
    expect(categoriasCustom[0].id).toBe('cat-1')
    expect(categoriasCustom[0].fotos).toHaveLength(1)
  })

  it('no duplica las fotos que el borrador ya traía', () => {
    // El borrador local llega con la foto dentro; el servidor la manda otra vez.
    // Sin vaciar primero, la categoría quedaría con dos copias de la misma.
    const previo = bodega([foto('Bodega', 7)])
    const { categoriasCustom } = repartirFotos([foto('Bodega', 7)], [previo])

    expect(categoriasCustom[0].fotos).toHaveLength(1)
  })

  it('crea la categoría cuando llega del servidor y no existe localmente', () => {
    // El caso de reabrir la tasación en otro dispositivo.
    const { categoriasCustom } = repartirFotos([foto('Quincho', 9)], [])

    expect(categoriasCustom).toHaveLength(1)
    expect(categoriasCustom[0].nombre).toBe('Quincho')
    // RF-TAS-14: las personalizadas no exigen mínimo.
    expect(categoriasCustom[0].minimo).toBe(0)
  })

  it('una personalizada llamada como una del catálogo no colisiona con ella', () => {
    // El tasador puede teclear "Cocina"; lo que nunca puede teclear es el id
    // `cocina`, que es lo que distingue una del catálogo en `descripcion`.
    const { fotosPredefinidas, categoriasCustom } = repartirFotos(
      [foto('Cocina', 1), foto('cocina', 2)],
      [],
    )

    expect(fotosPredefinidas.cocina).toHaveLength(1)
    expect(fotosPredefinidas.cocina[0].nombre).toBe('IMG_2.jpg')
    expect(categoriasCustom).toHaveLength(1)
    expect(categoriasCustom[0].nombre).toBe('Cocina')
  })
})

describe('no muta lo que recibe', () => {
  it('deja intacto el array de categorías previo', () => {
    const previo: FotoCategoriaCustom[] = [
      { id: 'cat-1', nombre: 'Bodega', minimo: 0, fotos: [foto('Bodega', 1)] },
    ]

    repartirFotos([foto('Bodega', 2)], previo)

    expect(previo[0].fotos).toHaveLength(1)
    expect(previo[0].fotos[0].nombre).toBe('IMG_1.jpg')
  })
})
