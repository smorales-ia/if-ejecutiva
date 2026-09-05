import { describe, expect, it } from 'vitest'
import { resolverAvanceLectura } from '@/lib/tasador/avance-lectura'

/**
 * P6-TAS · el gate del botón «Continuar con datos de la visita».
 *
 * `EstadoProcesando` deriva del avance: `completado` mueve el aspecto de la
 * pantalla —círculo, título, stepper— y `puedeContinuar` habilita el botón. En
 * `lectura` **coinciden** (D-2026-09-04): el botón se abre en cuanto nada sigue
 * en curso. Con `error`/`delegado_visador` el proceso terminó y el botón habilita
 * —el aviso ámbar informa qué completar—; antes bloqueaban (§7.3) y atrapaban al
 * tasador con «Datos listos» + «completa a mano» + botón gris.
 *
 * El componente es cliente y el repo no tiene `jsdom` ni `@testing-library`
 * —las instrucciones del repo cierran la puerta a agregarlos—, así que se prueba
 * la **regla** que el render consume, que es donde puede equivocarse. Lo que queda fuera
 * —que `disabled` bloquee teclado y doble toque— es comportamiento nativo del
 * `<button>`, y por eso la variante bloqueada se renderiza como botón y no como
 * enlace: un `<a>` deshabilitado no existe, sigue siendo activable con Enter.
 *
 * Mismo tratamiento que P5-TAS dio a `FileUploadZone`.
 */

/** Espeja la derivación del componente para la variante `lectura`. */
function gate(conteo: Record<string, number>) {
  const avance = resolverAvanceLectura(conteo)
  return {
    completado: avance.completo,
    puedeContinuar: avance.puedeContinuar,
    fase: avance.fase,
  }
}

describe('mientras la extracción corre', () => {
  it('el botón no se habilita, por mucho que pase el tiempo', () => {
    // El defecto que P6-TAS corrige: antes bastaban 8 segundos.
    const g = gate({ extrayendo: 2, listo: 1 })
    expect(g.completado).toBe(false)
    expect(g.puedeContinuar).toBe(false)
  })

  it('un adjunto todavía `idle` basta para mantenerlo cerrado', () => {
    expect(gate({ idle: 1, listo: 9 }).puedeContinuar).toBe(false)
  })
})

describe('al completarse los tres pasos', () => {
  it('el botón se habilita sin recargar: es el mismo cálculo sobre datos nuevos', () => {
    // Sondeo N: falta uno. Sondeo N+1: llegó. Ningún remount de por medio.
    expect(gate({ listo: 2, extrayendo: 1 }).puedeContinuar).toBe(false)
    expect(gate({ listo: 3 }).puedeContinuar).toBe(true)
  })

  it('la pantalla queda en fase 2', () => {
    expect(gate({ listo: 3 }).fase).toBe(2)
  })
})

describe('los desenlaces con aviso también habilitan (D-2026-09-04)', () => {
  it('`error`: el stepper completa y el botón habilita (el aviso informa)', () => {
    const g = gate({ listo: 2, error: 1 })
    expect(g.completado).toBe(true)
    expect(g.fase).toBe(2)
    expect(g.puedeContinuar).toBe(true)
  })

  it('`delegado_visador`: mismo tratamiento', () => {
    const g = gate({ listo: 1, delegado_visador: 1 })
    expect(g.completado).toBe(true)
    expect(g.puedeContinuar).toBe(true)
  })

  it('`skipped` y `no_corresponde` habilitan: no son fallos', () => {
    expect(gate({ skipped: 1, no_corresponde: 1 }).puedeContinuar).toBe(true)
  })
})

describe('volver y regresar', () => {
  it('recupera el progreso porque sale del backend, no del montaje', () => {
    // Dos montajes distintos, mismo estado en Airtable → mismo avance. El
    // temporizador anterior devolvía fase 0 en cada regreso.
    const antes = gate({ listo: 2, extrayendo: 2 })
    const despues = gate({ listo: 2, extrayendo: 2 })
    expect(despues).toEqual(antes)
    expect(despues.fase).toBe(1)
  })

  it('y refleja el avance ocurrido mientras la pantalla estuvo cerrada', () => {
    expect(gate({ listo: 1, extrayendo: 3 }).fase).toBe(1)
    expect(gate({ listo: 4 }).fase).toBe(2)
  })
})

describe('sin adjuntos', () => {
  it('no deja al tasador atascado', () => {
    const g = gate({})
    expect(g.completado).toBe(true)
    expect(g.puedeContinuar).toBe(true)
  })
})
