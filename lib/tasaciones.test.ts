import { describe, expect, it } from 'vitest'
import { resolverAccionCard, type EstadoCoordinacion, type Tasacion } from './tasaciones'

/**
 * Bloque 2 (A · gate §2.4 · CI-046) — el único punto de la Regla T-A.
 *
 * `resolverAccionCard()` es lo que la card consume: la card no decide, sólo
 * renderiza la variante que esta función devuelve. Por eso la lógica del gate se
 * prueba acá y no en el componente —el repo no tiene `jsdom` ni
 * `@testing-library` y `CLAUDE.md` cierra la puerta a agregarlos—, y lo que
 * queda en el `.tsx` es render sobre un `switch` exhaustivo.
 *
 * Sólo se leen `id` y `coordinacionVigente`, así que el resto de `Tasacion` se
 * omite con un cast: el contrato bajo prueba es el discriminante, no la
 * proyección completa.
 */
function tasacion(id: string, coordinacionVigente?: EstadoCoordinacion | null): Tasacion {
  return { id, coordinacionVigente } as Tasacion
}

describe('resolverAccionCard · las tres variantes excluyentes de la Regla T-A', () => {
  it('sin coordinación (null) → "Coordinar visita", acento, hacia /coordinar', () => {
    expect(resolverAccionCard(tasacion('rec1', null))).toEqual({
      tipo: 'coordinar',
      rotulo: 'Coordinar visita',
      href: '/tasaciones/rec1/coordinar',
      variante: 'acento',
    })
  })

  it('sin intentos (undefined) cae en la misma rama que null', () => {
    expect(resolverAccionCard(tasacion('rec1', undefined)).tipo).toBe('coordinar')
  })

  it('confirmada → "Abrir tasación", primario, hacia la captura', () => {
    expect(resolverAccionCard(tasacion('rec2', 'confirmada'))).toEqual({
      tipo: 'abrir',
      rotulo: 'Abrir tasación',
      href: '/tasaciones/rec2',
      variante: 'primario',
    })
  })

  it('rechazada → "Ver coordinación" deshabilitado + badge, sin href', () => {
    const accion = resolverAccionCard(tasacion('rec3', 'rechazada'))
    expect(accion).toEqual({
      tipo: 'esperando_ejecutiva',
      rotulo: 'Ver coordinación',
      deshabilitado: true,
      badge: 'Esperando contacto de ejecutiva',
    })
    expect('href' in accion).toBe(false)
  })

  /**
   * Los dos href son las dos rutas del gate y no pueden colarse cruzados: sin
   * coordinar se va a coordinar, coordinado se entra a la captura. Se afirman
   * aparte para que un swap accidental de rutas rompa un test propio.
   */
  it('los href de las dos variantes con Link apuntan a rutas distintas', () => {
    const coordinar = resolverAccionCard(tasacion('rec9', null))
    const abrir = resolverAccionCard(tasacion('rec9', 'confirmada'))
    expect(coordinar.tipo === 'coordinar' && coordinar.href).toBe('/tasaciones/rec9/coordinar')
    expect(abrir.tipo === 'abrir' && abrir.href).toBe('/tasaciones/rec9')
  })
})
