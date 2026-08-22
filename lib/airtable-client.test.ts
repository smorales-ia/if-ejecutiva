import { describe, expect, it } from 'vitest'
import { esFalloDeRedTransitorio } from './airtable-client'

/**
 * El detector de fallo de red transitorio que decide si una **lectura** a
 * Airtable se reintenta (22-ago-2026).
 *
 * Existe porque `fetch` de Node no informa el fallo de transporte donde uno lo
 * busca: lanza `TypeError: fetch failed` con un mensaje genérico y esconde la
 * causa real —`ETIMEDOUT`, `ECONNRESET`— dentro de un `AggregateError` anidado,
 * uno por cada IP que resolvió el DNS. Mirar sólo el primer nivel del error
 * confunde una caída de enlace con un bug de programación, que es exactamente lo
 * que pasó al verificar IF-03 sobre WSL2: el mismo endpoint alternaba 200 y 500
 * en la misma sesión.
 *
 * Los dos lados importan por igual. Un falso negativo devuelve un 500 evitable
 * al usuario en terreno; un falso positivo reintenta tres veces algo que nunca
 * va a funcionar y multiplica la espera antes del mismo error.
 */

/** Reproduce la forma exacta que emite Node: TypeError → AggregateError → Error[]. */
function fetchFailedConCausa(code: string, cuantas = 10): TypeError {
  const err = new TypeError('fetch failed')
  const agregado = new AggregateError(
    Array.from({ length: cuantas }, () => Object.assign(new Error('connect'), { code })),
    ''
  )
  Object.assign(agregado, { code })
  Object.assign(err, { cause: agregado })
  return err
}

describe('reconoce los fallos de transporte', () => {
  it('el caso real de WSL2: fetch failed con ETIMEDOUT anidado', () => {
    expect(esFalloDeRedTransitorio(fetchFailedConCausa('ETIMEDOUT'))).toBe(true)
  })

  it.each([
    'ECONNRESET',
    'ECONNREFUSED',
    'EAI_AGAIN',
    'ENOTFOUND',
    'EPIPE',
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_SOCKET',
  ])('reconoce %s', (code) => {
    expect(esFalloDeRedTransitorio(fetchFailedConCausa(code))).toBe(true)
  })

  it('encuentra el código aunque venga en el primer nivel, sin anidar', () => {
    expect(esFalloDeRedTransitorio(Object.assign(new Error('x'), { code: 'ETIMEDOUT' }))).toBe(
      true
    )
  })

  it('encuentra el código dentro del array de un AggregateError', () => {
    const agregado = new AggregateError(
      [new Error('otro'), Object.assign(new Error('connect'), { code: 'ECONNRESET' })],
      ''
    )
    expect(esFalloDeRedTransitorio(agregado)).toBe(true)
  })

  it('cae al mensaje cuando no hay ningún código reconocible', () => {
    // Node no siempre adjunta `code`; `fetch failed` es su texto invariante.
    expect(esFalloDeRedTransitorio(new TypeError('fetch failed'))).toBe(true)
  })
})

describe('no reintenta lo que no es de red', () => {
  it('un error de programación no se toma por fallo de enlace', () => {
    expect(esFalloDeRedTransitorio(new TypeError('x is not a function'))).toBe(false)
  })

  it('un fallo de configuración no se reintenta', () => {
    // Reintentar esto tres veces sólo retrasa el mismo error: falta una env var.
    expect(esFalloDeRedTransitorio(new Error('AIRTABLE_TOKEN is not configured'))).toBe(false)
  })

  it('un error de parseo no se reintenta', () => {
    expect(esFalloDeRedTransitorio(new SyntaxError('Unexpected token'))).toBe(false)
  })

  it.each([null, undefined, 'ETIMEDOUT', 42])('tolera un valor no-Error (%s)', (v) => {
    expect(esFalloDeRedTransitorio(v)).toBe(false)
  })

  it('no se cuelga con una cadena de causas circular', () => {
    const a: { cause?: unknown } = {}
    a.cause = a
    expect(esFalloDeRedTransitorio(a)).toBe(false)
  })
})
