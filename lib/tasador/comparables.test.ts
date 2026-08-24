import { describe, expect, it } from 'vitest'

/**
 * Aritmética de la sección D — CI-056, cierre de A-13.
 *
 * El módulo bajo prueba sucede al de factores purgado en la misma tanda
 * (**CI-056**), que **no tenía test propio**. Estos casos existen sobre todo por
 * las dos ramas que un promedio se come en silencio: la superficie `0` y el
 * comparable a medias. Ninguna de las dos lanza; las dos envenenan el número
 * que el tasador ve si nadie las corta.
 */

import { promedioUfM2, ufM2 } from './comparables'
import type { Comparable } from './tasaciones'

/**
 * Comparable con los campos que la aritmética mira. El resto del tipo se
 * completa vacío: `ufM2` sólo lee `totalUf` y `supConstruida`, y fijar aquí un
 * comparable completo ataría los tests a claves que no participan.
 */
function comparable(campos: Partial<Comparable> = {}): Comparable {
  return {
    id: 'cmp-1',
    direccionReferencia: '',
    comuna: '',
    supTerreno: '',
    supConstruida: '',
    totalUf: '',
    anio: '',
    fuente: 'oferta',
    factorSup: '',
    factorEdad: '',
    factorDistancia: '',
    telefonoContacto: '',
    foja: '',
    numero: '',
    ...campos,
  }
}

describe('ufM2 · unitario de un comparable', () => {
  it('divide precio por superficie construida', () => {
    expect(ufM2(comparable({ totalUf: '5000', supConstruida: '100' }))).toBe(50)
  })

  it('acepta decimales y espacios alrededor', () => {
    expect(ufM2(comparable({ totalUf: ' 4520.5 ', supConstruida: ' 90.41 ' }))).toBeCloseTo(50, 5)
  })

  it('devuelve null sin precio', () => {
    expect(ufM2(comparable({ supConstruida: '100' }))).toBeNull()
  })

  it('devuelve null sin superficie', () => {
    expect(ufM2(comparable({ totalUf: '5000' }))).toBeNull()
  })

  it('devuelve null ante texto no numérico', () => {
    expect(ufM2(comparable({ totalUf: 'consultar', supConstruida: '100' }))).toBeNull()
  })

  /**
   * El candado que motiva el módulo: sin este corte, `5000 / 0` sería
   * `Infinity` y `promedioUfM2` devolvería `Infinity` para toda la grilla.
   */
  it('devuelve null con superficie 0, no Infinity', () => {
    expect(ufM2(comparable({ totalUf: '5000', supConstruida: '0' }))).toBeNull()
  })

  it('respeta un precio 0 tecleado: es un valor, no un dato ausente', () => {
    expect(ufM2(comparable({ totalUf: '0', supConstruida: '100' }))).toBe(0)
  })
})

describe('promedioUfM2 · fila resumen de la grilla', () => {
  it('promedia los comparables calculables', () => {
    const filas = [
      comparable({ id: 'a', totalUf: '5000', supConstruida: '100' }), // 50
      comparable({ id: 'b', totalUf: '6000', supConstruida: '100' }), // 60
      comparable({ id: 'c', totalUf: '7000', supConstruida: '100' }), // 70
    ]

    expect(promedioUfM2(filas)).toBe(60)
  })

  /**
   * Una fila incompleta **no baja el promedio a cero**: queda fuera del
   * divisor. Es la diferencia entre «este comparable vale 0» y «este
   * comparable no se puede unitarizar», y el cuadro fotografiado produce la
   * segunda cada vez que la foto corta una columna.
   */
  it('excluye del promedio las filas sin precio o sin superficie', () => {
    const filas = [
      comparable({ id: 'a', totalUf: '5000', supConstruida: '100' }), // 50
      comparable({ id: 'b', totalUf: '7000', supConstruida: '100' }), // 70
      comparable({ id: 'c', supConstruida: '100' }), // fuera
      comparable({ id: 'd', totalUf: '9000' }), // fuera
    ]

    expect(promedioUfM2(filas)).toBe(60)
  })

  it('devuelve null con la grilla vacía', () => {
    expect(promedioUfM2([])).toBeNull()
  })

  it('devuelve null cuando ninguna fila es calculable', () => {
    const filas = [comparable({ id: 'a' }), comparable({ id: 'b', totalUf: '5000' })]

    expect(promedioUfM2(filas)).toBeNull()
  })

  it('una superficie 0 no contamina el promedio de las demás', () => {
    const filas = [
      comparable({ id: 'a', totalUf: '5000', supConstruida: '100' }), // 50
      comparable({ id: 'b', totalUf: '5000', supConstruida: '0' }), // fuera
    ]

    expect(promedioUfM2(filas)).toBe(50)
  })
})
