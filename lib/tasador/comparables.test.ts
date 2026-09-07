import { describe, expect, it } from 'vitest'

/**
 * Aritmética de la sección D — P13-TAS, el cuadro-a-cuadro.
 *
 * El módulo espeja los renglones de resumen del cuadro `[Excel: Portada!B28:AX44]`
 * sin inventar números: `PROMEDIO DE LA MUESTRA` (promedio simple columna a
 * columna, sobre valores **crudos** de la foto) y `TASACION V/S PROMEDIO`
 * (cociente contra el promedio). Los casos cubren las dos ramas que un promedio
 * se come en silencio —la celda vacía y la base `0` de un porcentaje—, y que el
 * cuadro produce cada vez que la foto corta una columna.
 */

import {
  numeroDe,
  promedioMuestra,
  tasacionVsPromedio,
  ufM2Construccion,
  ufM2Terreno,
} from './comparables'
import type { Comparable } from './tasaciones'

/**
 * Comparable con los campos que la aritmética mira. El resto del tipo se
 * completa vacío: los helpers leen columnas crudas puntuales, y fijar aquí un
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
    fechaPublicacion: '',
    ooCcUf: '',
    ufM2TerrenoF: '',
    ufM2ConstruccionF: '',
    telefonoContacto: '',
    foja: '',
    numero: '',
    ...campos,
  }
}

describe('numeroDe · lectura de una celda cruda', () => {
  it('lee un número y tolera espacios', () => {
    expect(numeroDe(' 34.05 ')).toBeCloseTo(34.05, 5)
  })

  it('devuelve null ante vacío o texto no numérico', () => {
    expect(numeroDe('')).toBeNull()
    expect(numeroDe('consultar')).toBeNull()
  })

  it('respeta un 0 legítimo', () => {
    expect(numeroDe('0')).toBe(0)
  })
})

describe('UF/m² crudos · se muestran tal como vinieron de la foto', () => {
  it('devuelve el UF/m² de construcción crudo, no precio/sup', () => {
    // El cuadro trae 34,05 aunque precio/sup daría 20000/239 ≈ 83,7.
    expect(
      ufM2Construccion(comparable({ totalUf: '20000', supConstruida: '239', ufM2ConstruccionF: '34.05' })),
    ).toBeCloseTo(34.05, 5)
  })

  it('devuelve el UF/m² de terreno crudo', () => {
    expect(ufM2Terreno(comparable({ ufM2TerrenoF: '2.20' }))).toBeCloseTo(2.2, 5)
  })

  it('devuelve null cuando la celda cruda vino vacía', () => {
    expect(ufM2Construccion(comparable({ totalUf: '20000', supConstruida: '239' }))).toBeNull()
  })
})

describe('promedioMuestra · renglón PROMEDIO DE LA MUESTRA', () => {
  it('promedia cada columna de forma simple', () => {
    const filas = [
      comparable({ totalUf: '20000', supTerreno: '5000', supConstruida: '200', ooCcUf: '600', ufM2TerrenoF: '2.00', ufM2ConstruccionF: '30' }),
      comparable({ totalUf: '22000', supTerreno: '5100', supConstruida: '300', ooCcUf: '700', ufM2TerrenoF: '2.40', ufM2ConstruccionF: '36' }),
    ]

    const p = promedioMuestra(filas)
    expect(p.totalUf).toBe(21000)
    expect(p.supTerreno).toBe(5050)
    expect(p.supConstruida).toBe(250)
    expect(p.ooCcUf).toBe(650)
    expect(p.ufM2Terreno).toBeCloseTo(2.2, 5)
    expect(p.ufM2Construccion).toBe(33)
  })

  /**
   * Verifica el promedio de UF/m² C. contra el ejemplo canónico del JPG (bloque
   * REF. OFERTAS): mean(34,05; 35,19; 35,71; 31,45; 31,82) = 33,64.
   */
  it('reproduce el promedio UF/m² C. del cuadro de referencia', () => {
    const filas = ['34.05', '35.19', '35.71', '31.45', '31.82'].map((v, i) =>
      comparable({ id: `o${i}`, ufM2ConstruccionF: v }),
    )

    expect(promedioMuestra(filas).ufM2Construccion).toBeCloseTo(33.64, 2)
  })

  it('excluye del promedio las celdas vacías, sin bajarlo a cero', () => {
    const filas = [
      comparable({ ufM2ConstruccionF: '30' }),
      comparable({ ufM2ConstruccionF: '40' }),
      comparable({ ufM2ConstruccionF: '' }), // fuera del divisor
    ]

    expect(promedioMuestra(filas).ufM2Construccion).toBe(35)
  })

  it('devuelve null por columna cuando ninguna fila la trae', () => {
    expect(promedioMuestra([]).ufM2Construccion).toBeNull()
    expect(promedioMuestra([comparable()]).totalUf).toBeNull()
  })
})

describe('tasacionVsPromedio · renglón TASACION V/S PROMEDIO', () => {
  it('calcula el cociente (tasacion - promedio) / promedio', () => {
    // Ejemplo del JPG: 32,64 vs 33,64 ≈ -3%.
    expect(tasacionVsPromedio(32.64, 33.64)).toBeCloseTo(-0.0297, 3)
  })

  it('devuelve null si falta la tasación del sujeto', () => {
    expect(tasacionVsPromedio(null, 33.64)).toBeNull()
  })

  it('devuelve null si el promedio es 0 o ausente: no hay base', () => {
    expect(tasacionVsPromedio(32.64, 0)).toBeNull()
    expect(tasacionVsPromedio(32.64, null)).toBeNull()
  })
})
