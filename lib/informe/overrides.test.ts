/**
 * Candado del merge de overrides locales (T-PDF-IDENTICO-20260927).
 * Sólo la función pura `fusionar`; la lectura del archivo se ejercita
 * indirectamente vía el ensamblador (sin archivo o con código distinto el
 * contexto pasa intacto).
 */

import { describe, expect, it } from 'vitest'

import { fusionar } from './overrides'

describe('fusionar', () => {
  it('mergea objetos en profundidad sin perder claves base', () => {
    const base = { a: { x: 1, y: 2 }, b: 'queda' }
    const override = { a: { y: 99 } }
    expect(fusionar(base, override)).toEqual({ a: { x: 1, y: 99 }, b: 'queda' })
  })

  it('arrays: reemplazo por índice, conservando filas no pisadas y agregando extra', () => {
    const base = [{ n: 1 }, { n: 2 }]
    const override = [{ n: 10 }, undefined, { n: 30 }]
    expect(fusionar(base, override)).toEqual([{ n: 10 }, { n: 2 }, { n: 30 }])
  })

  it('null explícito del override gana (permite vaciar una ranura)', () => {
    expect(fusionar({ a: 'valor' }, { a: null })).toEqual({ a: null })
  })

  it('undefined del override no pisa nada', () => {
    expect(fusionar({ a: 1 }, undefined)).toEqual({ a: 1 })
  })

  it('tipos distintos → gana el override completo', () => {
    expect(fusionar({ a: { x: 1 } }, { a: [1, 2] })).toEqual({ a: [1, 2] })
  })
})
