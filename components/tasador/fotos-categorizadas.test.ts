import { describe, expect, it } from 'vitest'
import {
  evaluarCategorias,
  evaluarCustom,
  type FotosPorCategoria,
} from './fotos-categorizadas'
import {
  CATEGORIAS_FOTO,
  type FotoAdjunta,
  type FotoCategoriaCustom,
} from '@/lib/tasador/tasaciones'

/**
 * RF-TAS-14 · criterio de aceptación: *"el contador de cada categoría y el total
 * del header se actualizan en la misma interacción en que se agrega o elimina
 * una foto"* y *"una categoría personalizada aparece en el listado
 * inmediatamente después de crearse y **admite fotos sin exigir mínimo**"*.
 *
 * El total del header es la suma de los `count` de `evaluarCategorias` +
 * `evaluarCustom`, que es como lo compone `FotosScreen`. Probar las dos
 * funciones cubre el contador y el total con la misma aserción: no hay un
 * tercer sitio donde el número pueda divergir.
 */

/**
 * Fixture de foto persistida. Desde P5-TAS el estado guarda `FotoAdjunta` —con
 * el record ID de `TX_Adjuntos`— y no el contador local que se usaba antes; las
 * aserciones de conteo son las mismas, pero el dato ya no es un número suelto.
 */
const foto = (n: number): FotoAdjunta => ({
  id: `recFOTO${String(n).padStart(9, '0')}`,
  categoria: 'cocina',
  nombre: `IMG_${n}.jpg`,
  url: null,
  thumbnailUrl: null,
  hashMd5: null,
})

const vacio = (): FotosPorCategoria => {
  const f = {} as FotosPorCategoria
  for (const c of CATEGORIAS_FOTO) f[c.id] = []
  return f
}

const declarados = { dorm: 2, banos: 2, estac: 1 }

/** Total del header, compuesto igual que en `FotosScreen`. */
const totalHeader = (fotos: FotosPorCategoria, custom: FotoCategoriaCustom[]) =>
  [...evaluarCategorias(fotos, declarados), ...evaluarCustom(custom)].reduce(
    (a, e) => a + e.count,
    0,
  )

describe('evaluarCategorias · las ocho del catálogo', () => {
  it('rinde exactamente ocho estados', () => {
    expect(evaluarCategorias(vacio(), declarados)).toHaveLength(8)
  })

  it('no incluye ninguna categoría "Documentos" (§2.6 la elimina)', () => {
    const labels = evaluarCategorias(vacio(), declarados).map((e) => e.label.toLowerCase())
    expect(labels.some((l) => l.includes('documento'))).toBe(false)
  })

  it('el contador sube en la misma interacción en que se agrega una foto', () => {
    const fotos = vacio()
    expect(evaluarCategorias(fotos, declarados).find((e) => e.id === 'cocina')!.count).toBe(0)

    const conFoto = { ...fotos, cocina: [foto(1)] }
    const cocina = evaluarCategorias(conFoto, declarados).find((e) => e.id === 'cocina')!
    expect(cocina.count).toBe(1)
    expect(cocina.completa).toBe(true)
    expect(cocina.faltan).toBe(0)
  })

  it('el contador baja en la misma interacción en que se elimina', () => {
    const conDos = { ...vacio(), banos: [foto(1), foto(2)] }
    expect(evaluarCategorias(conDos, declarados).find((e) => e.id === 'banos')!.completa).toBe(
      true,
    )

    const conUna = { ...conDos, banos: [foto(1)] }
    const banos = evaluarCategorias(conUna, declarados).find((e) => e.id === 'banos')!
    expect(banos.count).toBe(1)
    expect(banos.completa).toBe(false)
    expect(banos.faltan).toBe(1)
  })

  it('el mínimo de habitaciones sigue lo declarado, no un literal del componente', () => {
    const fotos = { ...vacio(), habitaciones: [foto(1), foto(2)] }
    const conDos = evaluarCategorias(fotos, declarados).find((e) => e.id === 'habitaciones')!
    expect(conDos.completa).toBe(true)

    // La misma foto contra una casa de 5 dormitorios ya no alcanza.
    const conCinco = evaluarCategorias(fotos, { dorm: 5, banos: 2, estac: 1 }).find(
      (e) => e.id === 'habitaciones',
    )!
    expect(conCinco.min).toBe(5)
    expect(conCinco.completa).toBe(false)
  })
})

describe('evaluarCustom · RF-TAS-14 · sin mínimo', () => {
  const nueva = (over: Partial<FotoCategoriaCustom> = {}): FotoCategoriaCustom => ({
    id: 'cat-1',
    nombre: 'Bodega',
    minimo: 0,
    fotos: [],
    ...over,
  })

  it('una categoría recién creada está completa aunque no tenga fotos', () => {
    const [estado] = evaluarCustom([nueva()])
    expect(estado.count).toBe(0)
    expect(estado.min).toBe(0)
    expect(estado.completa).toBe(true)
    expect(estado.faltan).toBe(0)
  })

  it('ignora el `minimo: 1` de los borradores anteriores a P5-TAS', () => {
    // Un borrador guardado en localStorage antes de esta tanda trae `minimo: 1`.
    // Si se respetara, la categoría reviviría la exigencia que el requisito niega.
    const [estado] = evaluarCustom([nueva({ minimo: 1 })])
    expect(estado.min).toBe(0)
    expect(estado.completa).toBe(true)
  })

  it('cuenta sus fotos igual que una del catálogo', () => {
    const [estado] = evaluarCustom([nueva({ fotos: [foto(1), foto(2), foto(3)] })])
    expect(estado.count).toBe(3)
    expect(estado.label).toBe('Bodega')
  })
})

describe('total del header · "N fotos · N docs"', () => {
  it('suma catálogo y personalizadas en la misma interacción', () => {
    expect(totalHeader(vacio(), [])).toBe(0)

    const fotos = { ...vacio(), cocina: [foto(1)], banos: [foto(2), foto(3)] }
    expect(totalHeader(fotos, [])).toBe(3)

    const custom: FotoCategoriaCustom[] = [
      { id: 'cat-1', nombre: 'Bodega', minimo: 0, fotos: [foto(4), foto(5)] },
    ]
    expect(totalHeader(fotos, custom)).toBe(5)
  })

  it('una categoría personalizada vacía no altera el total', () => {
    const custom: FotoCategoriaCustom[] = [
      { id: 'cat-1', nombre: 'Quincho', minimo: 0, fotos: [] },
    ]
    expect(totalHeader(vacio(), custom)).toBe(0)
  })
})
