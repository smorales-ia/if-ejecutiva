import { describe, expect, it } from 'vitest'
import {
  ESTADOS_EXTRACCION,
  esTerminal,
  resolverAvanceLectura,
  type ConteoPorEstado,
} from './avance-lectura'

/**
 * P6-TAS · el mapeo de los 7 valores de `estado_extraccion` a los 3 pasos del
 * stepper (RF-TAS-15 · §7.2 paso 3 · §7.3 criterio 5).
 *
 * Lo que se protege: **todo estado terminal deja continuar** (D-2026-09-04).
 * `error`/`delegado_visador` ya no bloquean el botón; sólo avisan por
 * `hayError`/`hayDelegado`. Antes bloqueaban (§7.3) y producían la pantalla
 * contradictoria «Datos listos» + «completa a mano» + botón gris.
 *
 * Antes de P6-TAS no había nada que probar: la pantalla avanzaba con dos
 * `setTimeout` y llegaba a «Datos listos» a los 8 segundos pasara lo que pasara.
 */

const conteo = (parcial: ConteoPorEstado): ConteoPorEstado => parcial

describe('los siete valores están cubiertos', () => {
  it('el catálogo tiene exactamente siete', () => {
    expect(ESTADOS_EXTRACCION).toHaveLength(7)
  })

  it.each([...ESTADOS_EXTRACCION])('%s produce un avance sin excepciones', (estado) => {
    const avance = resolverAvanceLectura({ [estado]: 1 })
    expect(avance.total).toBe(1)
    expect([0, 1, 2]).toContain(avance.fase)
  })

  it('sólo `idle` y `extrayendo` no son terminales', () => {
    const noTerminales = ESTADOS_EXTRACCION.filter((e) => !esTerminal(e))
    expect(noTerminales).toEqual(['idle', 'extrayendo'])
  })
})

describe('qué habilita «Continuar» y qué no', () => {
  it.each(['listo', 'skipped', 'no_corresponde'])(
    '%s deja continuar: es un desenlace normal',
    (estado) => {
      const avance = resolverAvanceLectura({ [estado]: 2 })
      expect(avance.completo).toBe(true)
      expect(avance.puedeContinuar).toBe(true)
    }
  )

  it.each(['error', 'delegado_visador'])(
    '%s es terminal y SÍ deja continuar; sólo avisa (D-2026-09-04)',
    (estado) => {
      const avance = resolverAvanceLectura({ [estado]: 1 })
      expect(avance.completo).toBe(true)
      // El botón se abre: el desenlace informa, no bloquea.
      expect(avance.puedeContinuar).toBe(true)
    }
  )

  it('datos-listos con un doc no leído (error): botón habilitado, con aviso', () => {
    // El caso del bug: la pantalla decía «Datos listos» + «completa a mano» y
    // el botón salía gris. Ahora habilita y el aviso (hayError) coexiste.
    const avance = resolverAvanceLectura(conteo({ listo: 5, error: 1 }))
    expect(avance.completo).toBe(true)
    expect(avance.puedeContinuar).toBe(true)
    expect(avance.hayError).toBe(true)
  })

  it('un `delegado_visador` entre varios `listo` habilita y avisa', () => {
    const avance = resolverAvanceLectura(conteo({ listo: 4, delegado_visador: 1 }))
    expect(avance.puedeContinuar).toBe(true)
    expect(avance.hayDelegado).toBe(true)
  })
})

describe('estados mixtos · lo que pasa mientras corre', () => {
  it('con algo `extrayendo` no está completo ni deja continuar', () => {
    const avance = resolverAvanceLectura(conteo({ listo: 2, extrayendo: 1 }))
    expect(avance.completo).toBe(false)
    expect(avance.puedeContinuar).toBe(false)
    expect(avance.pendientes).toBe(1)
  })

  it('con algo `idle` tampoco: subido no es procesado', () => {
    const avance = resolverAvanceLectura(conteo({ listo: 3, idle: 2 }))
    expect(avance.completo).toBe(false)
    expect(avance.pendientes).toBe(2)
  })

  it('un `error` con trabajo todavía pendiente no adelanta el final', () => {
    const avance = resolverAvanceLectura(conteo({ error: 1, extrayendo: 2 }))
    expect(avance.completo).toBe(false)
    expect(avance.hayError).toBe(true)
    expect(avance.puedeContinuar).toBe(false)
  })
})

describe('fase del stepper · sale del dato, no del reloj', () => {
  it('nada terminado → fase 0', () => {
    expect(resolverAvanceLectura(conteo({ idle: 3 })).fase).toBe(0)
  })

  it('algo terminado pero no todo → fase 1', () => {
    expect(resolverAvanceLectura(conteo({ listo: 1, extrayendo: 2 })).fase).toBe(1)
  })

  it('todo terminado → fase 2', () => {
    expect(resolverAvanceLectura(conteo({ listo: 3 })).fase).toBe(2)
  })

  it('la fase llega a 2 y el botón habilita aunque el desenlace sea error', () => {
    // El proceso terminó: el stepper lo refleja y el botón se abre. El aviso de
    // hayError coexiste, pero no atrapa al tasador.
    const avance = resolverAvanceLectura(conteo({ error: 2 }))
    expect(avance.fase).toBe(2)
    expect(avance.puedeContinuar).toBe(true)
    expect(avance.hayError).toBe(true)
  })
})

describe('progreso · porcentaje real', () => {
  it('es la proporción de terminados', () => {
    expect(resolverAvanceLectura(conteo({ listo: 1, extrayendo: 3 })).progreso).toBe(25)
    expect(resolverAvanceLectura(conteo({ listo: 3, idle: 1 })).progreso).toBe(75)
  })

  it('no depende del tiempo transcurrido', () => {
    // Dos llamadas con el mismo conteo dan lo mismo, siempre. Es la garantía
    // que el temporizador de antes no podía dar.
    const a = resolverAvanceLectura(conteo({ listo: 1, extrayendo: 1 }))
    const b = resolverAvanceLectura(conteo({ listo: 1, extrayendo: 1 }))
    expect(a).toEqual(b)
  })
})

describe('sin adjuntos', () => {
  it('avanza en vez de girar para siempre', () => {
    const avance = resolverAvanceLectura({})
    expect(avance.total).toBe(0)
    expect(avance.completo).toBe(true)
    expect(avance.puedeContinuar).toBe(true)
    expect(avance.progreso).toBe(100)
    expect(avance.fase).toBe(2)
  })

  it('un conteo con todo en cero equivale a no tener adjuntos', () => {
    const todosCero = Object.fromEntries(ESTADOS_EXTRACCION.map((e) => [e, 0]))
    expect(resolverAvanceLectura(todosCero).completo).toBe(true)
  })
})

describe('degradación ante un estado desconocido', () => {
  it('no lo cuenta como terminado, así que la pantalla sigue esperando', () => {
    const avance = resolverAvanceLectura(conteo({ listo: 1, un_estado_nuevo: 1 }))
    expect(avance.total).toBe(2)
    expect(avance.terminados).toBe(1)
    expect(avance.completo).toBe(false)
  })

  it('pero no bloquea por sí solo si el resto terminó bien', () => {
    // Bloquear por un valor que nadie definió dejaría la pantalla muerta sin
    // diagnóstico; la degradación segura es tratarlo como pendiente.
    const avance = resolverAvanceLectura(conteo({ listo: 2 }))
    expect(avance.puedeContinuar).toBe(true)
  })
})
