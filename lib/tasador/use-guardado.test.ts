import { describe, expect, it } from 'vitest'

/**
 * P7-TAS.A.3 · la leyenda del pie del formulario.
 *
 * ## Qué NO cubre este archivo
 *
 * `useGuardado` en sí. No hay `jsdom`, `happy-dom` ni `@testing-library/react`
 * en el proyecto, `vitest.config.mts` no declara `environment` y CLAUDE.md
 * prohíbe agregar dependencias de testing. El temporizador de 30 s, el guardado
 * al desmontar, el `fetch` y las transiciones de estado quedan sin cobertura
 * automatizada, y así se declaró al aprobar la tanda.
 *
 * `leyendaGuardado` se exportó aparte precisamente para que la única parte del
 * hook que **decide** algo sea probable sin navegador.
 *
 * ## La hora es determinista a propósito
 *
 * Los ISO de los casos se construyen con `new Date(a, m, d, h, min)`, que es
 * hora **local**. Así `leyendaGuardado` devuelve el mismo `HH:MM` corra el test
 * donde corra, sin fijar la zona horaria del proceso.
 */

import { leyendaGuardado } from './use-guardado'

/** ISO de una hora local concreta. */
function iso(h: number, min: number): string {
  return new Date(2026, 7, 20, h, min).toISOString()
}

const LAS_1432 = iso(14, 32)
const LAS_1500 = iso(15, 0)

describe('leyendaGuardado', () => {
  it('dice "Guardando…" mientras el PATCH viaja', () => {
    expect(
      leyendaGuardado({
        estado: 'guardando',
        guardadoLocalTs: LAS_1432,
        sincronizadoTs: LAS_1432,
      }),
    ).toBe('Guardando…')
  })

  it('dice "Sin enviar" si nunca sincronizó', () => {
    expect(
      leyendaGuardado({
        estado: 'inactivo',
        guardadoLocalTs: LAS_1432,
        sincronizadoTs: null,
      }),
    ).toBe('Sin enviar')
  })

  it('dice "Sin enviar" si hay cambios locales posteriores', () => {
    expect(
      leyendaGuardado({
        estado: 'guardado',
        guardadoLocalTs: LAS_1500,
        sincronizadoTs: LAS_1432,
      }),
    ).toBe('Sin enviar')
  })

  it('dice la hora del último envío confirmado', () => {
    expect(
      leyendaGuardado({
        estado: 'guardado',
        guardadoLocalTs: LAS_1432,
        sincronizadoTs: LAS_1500,
      }),
    ).toBe('Guardado 15:00')
  })

  it('rellena la hora con cero a la izquierda', () => {
    expect(
      leyendaGuardado({
        estado: 'guardado',
        guardadoLocalTs: null,
        sincronizadoTs: iso(9, 5),
      }),
    ).toBe('Guardado 09:05')
  })

  it('el error del PATCH colapsa en "Sin enviar"', () => {
    // Tres literales, no cuatro: el fallo ya se reporta por toast (Regla B) y
    // el pie es estado ambiente.
    expect(
      leyendaGuardado({
        estado: 'error',
        guardadoLocalTs: LAS_1500,
        sincronizadoTs: LAS_1432,
      }),
    ).toBe('Sin enviar')
  })

  it('un ISO ilegible no produce "Guardado " a medias', () => {
    expect(
      leyendaGuardado({
        estado: 'guardado',
        guardadoLocalTs: null,
        sincronizadoTs: 'no-es-una-fecha',
      }),
    ).toBe('Sin enviar')
  })
})
