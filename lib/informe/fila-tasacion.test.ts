/**
 * Candado de la aritmética única de la fila TASACIÓN (F-2 · P1-8 · RO-05).
 *
 * Los números espejan el golden VP-2026-0066 del ensamblador
 * (`valor_comercial_uf = 20125.8624`, `sup_construccion_m2 = 249.91`).
 */

import { describe, expect, it } from 'vitest'

import { filaTasacionUfM2, filaTasacionVsPct } from './fila-tasacion'

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
