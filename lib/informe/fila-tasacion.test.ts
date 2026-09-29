/**
 * Candado de la aritmética única de la fila TASACIÓN (F-2 · P1-8 · RO-05).
 *
 * Los números espejan el golden VP-2026-0066 del ensamblador
 * (`valor_comercial_uf = 20125.8624`, `sup_construccion_m2 = 249.91`).
 */

import { describe, expect, it } from 'vitest'

import { filaTasacionUfM2, filaTasacionVsPct, promedioSinCeros } from './fila-tasacion'

describe('filaTasacionUfM2', () => {
  it('divide valor de tasación por superficie construida (golden 0066)', () => {
    expect(filaTasacionUfM2(20125.8624, 249.91)).toBeCloseTo(80.53, 2)
  })

  it('sin valor de tasación → null', () => {
    expect(filaTasacionUfM2(null, 249.91)).toBeNull()
  })

  it('superficie ausente o 0 → null (nunca división por cero)', () => {
    expect(filaTasacionUfM2(20125.8624, null)).toBeNull()
    expect(filaTasacionUfM2(20125.8624, 0)).toBeNull()
  })
})

describe('filaTasacionVsPct', () => {
  it('devuelve la desviación en puntos porcentuales, con signo', () => {
    // 90 vs 75 → (90/75 − 1) × 100 = +20 %
    expect(filaTasacionVsPct(90, 75)).toBeCloseTo(20, 6)
    // 60 vs 75 → −20 %
    expect(filaTasacionVsPct(60, 75)).toBeCloseTo(-20, 6)
  })

  it('sin tasación o sin promedio → null', () => {
    expect(filaTasacionVsPct(null, 75)).toBeNull()
    expect(filaTasacionVsPct(90, null)).toBeNull()
  })

  it('promedio 0 → null (sin base contra la que comparar)', () => {
    expect(filaTasacionVsPct(90, 0)).toBeNull()
  })
})

describe('promedioSinCeros · XLSM SUM/COUNTIF(">0") (CI-057)', () => {
  it('promedia los UF/m²C de las 5 ofertas MET-6283 → 33,64', () => {
    // Portada!AX29:AX33 — homologados de las ofertas del gold master.
    const ofertas = [34.049372384937236, 35.19372384937238, 35.706349206349206, 31.44961240310078, 31.818181818181817]
    expect(promedioSinCeros(ofertas)).toBeCloseTo(33.643448, 4)
  })

  it('promedia las 2 CBR por separado → 24,08 (nunca combinado con ofertas)', () => {
    // Portada!AX38:AX39 — el promedio combinado de los 7 era el 30,91 del bug.
    expect(promedioSinCeros([25.1784, 22.990555555555556])).toBeCloseTo(24.084478, 4)
  })

  it('excluye ceros y nulls del promedio (COUNTIF(">0"))', () => {
    expect(promedioSinCeros([10, 0, null, 20])).toBeCloseTo(15, 6)
  })

  it('sin valores positivos → null, nunca un 0 inventado', () => {
    expect(promedioSinCeros([])).toBeNull()
    expect(promedioSinCeros([0, null])).toBeNull()
  })
})
