/**
 * Smoke S-H4-01/02/03 — PLAN_T-AUDIT-CLOSE-20260923 §6 · paso C3.
 *
 * Gating de la sección H · Rentabilidad por `tipo_informe`, a nivel de
 * lógica de props (sin browser): se prueba la semántica que `tasacion-form.tsx`
 * consume tal cual — `seccionRentabilidadVisible` decide el render y
 * `rentabilidadObligatoria` decide si arriendo/gasto entran a `faltantes`.
 *
 * Mecanismo (Opción 1 confirmada por Sergio, 23-09-2026): checkbox
 * `requiere_rentabilidad` en `M_TiposInforme`; la UI sólo obedece. El caso
 * `null` es el contrato fail-safe: dato no disponible → comportamiento pre-C3.
 */
import { describe, expect, it } from 'vitest'

import {
  rentabilidadObligatoria,
  resolverFlagRentabilidad,
  seccionRentabilidadVisible,
} from './rentabilidad'

describe('S-H4-01 · tipo_informe exige rentabilidad (flag=true)', () => {
  it('la sección H se renderiza', () => {
    expect(seccionRentabilidadVisible(true)).toBe(true)
  })

  it('arriendo/gasto pasan a obligatorios (entran a faltantes)', () => {
    expect(rentabilidadObligatoria(true)).toBe(true)
  })
})

describe('S-H4-02 · tipo_informe no la exige (flag=false, checkbox desmarcado)', () => {
  it('la sección H se oculta', () => {
    expect(seccionRentabilidadVisible(false)).toBe(false)
  })

  it('sus campos no son obligatorios', () => {
    expect(rentabilidadObligatoria(false)).toBe(false)
  })
})

describe('S-H4-03 · dato no disponible (flag=null) — fail-safe pre-C3', () => {
  it('la sección H sigue visible, como antes de C3', () => {
    expect(seccionRentabilidadVisible(null)).toBe(true)
  })

  it('y sigue siendo opcional: no agrega faltantes', () => {
    expect(rentabilidadObligatoria(null)).toBe(false)
  })
})

describe('resolverFlagRentabilidad · proyección Link → flag', () => {
  const REC_EXIGE = 'recTipoExige000000'
  const REC_NO_EXIGE = 'recTipoNoExige0000'
  const mapa = new Map<string, boolean>([
    [REC_EXIGE, true],
    [REC_NO_EXIGE, false],
  ])

  it('maestro ilegible (mapa null) → null, nunca false: vacío ocultaría la sección', () => {
    expect(resolverFlagRentabilidad([REC_EXIGE], null)).toBeNull()
  })

  it('solicitud sin tipo_informe vinculado → null (fail-safe)', () => {
    expect(resolverFlagRentabilidad([], mapa)).toBeNull()
    expect(resolverFlagRentabilidad(undefined, mapa)).toBeNull()
  })

  it('tipo desconocido para el mapa → null (fail-safe)', () => {
    expect(resolverFlagRentabilidad(['recDesconocido0000'], mapa)).toBeNull()
  })

  it('tipo con checkbox marcado → true · desmarcado → false', () => {
    expect(resolverFlagRentabilidad([REC_EXIGE], mapa)).toBe(true)
    expect(resolverFlagRentabilidad([REC_NO_EXIGE], mapa)).toBe(false)
  })
})
