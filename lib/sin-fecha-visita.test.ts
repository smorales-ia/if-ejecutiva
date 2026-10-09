import { describe, expect, it } from 'vitest'

import { desdeSantiago, minutosHabilesEntre } from './sla-habil'
import {
  CLAVE_CONTADOR_SIN_FECHA_VISITA,
  ESTADOS_FUERA_DEL_TOPE,
  ETIQUETA_SIN_FECHA_VISITA,
  PARAM_SIN_FECHA_VISITA,
  sinFechaVisitaVencida,
  TOPE_RESPUESTA_CLIENTE_HORAS_HABILES,
  VALOR_SIN_FECHA_VISITA,
  type EntradaSinFechaVisita,
} from './sin-fecha-visita'
import type { EstadoSolicitud } from './console-data'

/**
 * A-03 · predicado del filtro «sin fecha de visita · más de 24 h hábiles»
 * (Spec v1.9.17 §5.2.8 · §5.2.9).
 *
 * Lo que se fija acá es el borde: 24 h hábiles son 2 jornadas completas y 6 h
 * de una tercera (9 h por día, §5.2.1), así que un ingreso del martes 10:00
 * vence el jueves 16:00 y no el miércoles 10:00 que daría un reloj corrido.
 */

/**
 * Feriados reales de `C_Feriados`, los mismos literales que
 * `lib/sla-habil.test.ts`, acotados a las fechas que estos casos cruzan.
 * 18-sep-2026 cae viernes; 3-abr-2026 (Viernes Santo) también.
 */
const FERIADOS = new Set([
  '2026-04-03', // Viernes Santo — viernes
  '2026-04-04', // Sábado Santo — sábado
  '2026-09-18', // Independencia Nacional — viernes
  '2026-09-19', // Glorias del Ejército — sábado
])

const SIN_FERIADOS: ReadonlySet<string> = new Set<string>()

const TOPE_MIN = TOPE_RESPUESTA_CLIENTE_HORAS_HABILES * 60

/** Solicitud mínima sin fecha de visita, en estado `creada`. */
function entrada(ingreso: Date | string | null | undefined, extra: Partial<EntradaSinFechaVisita> = {}) {
  return {
    estado: 'creada',
    ingresoTs: ingreso instanceof Date ? ingreso.toISOString() : ingreso,
    ...extra,
  }
}

/**
 * Oráculo independiente: la definición literal del tope ("más de 24 h hábiles
 * transcurridas") medida con `minutosHabilesEntre`, que es la inversa de
 * `sumarHorasHabiles`. Si el predicado y el oráculo divergen en un borde, uno
 * de los dos está mal.
 */
function oraculo(ingreso: Date, ahora: Date, feriados: ReadonlySet<string>): boolean {
  return minutosHabilesEntre(ingreso, ahora, feriados) > TOPE_MIN
}

describe('constantes · §5.2.8', () => {
  it('el tope son 24 horas hábiles', () => {
    expect(TOPE_RESPUESTA_CLIENTE_HORAS_HABILES).toBe(24)
  })

  it('la etiqueta interpola el tope y no lleva tono de alerta', () => {
    expect(ETIQUETA_SIN_FECHA_VISITA).toBe('Sin fecha de visita · más de 24 h hábiles')
  })

  it('el parámetro de URL, su valor y la clave del contador son estables', () => {
    expect(PARAM_SIN_FECHA_VISITA).toBe('sin_fecha_visita')
    expect(VALOR_SIN_FECHA_VISITA).toBe('1')
    expect(CLAVE_CONTADOR_SIN_FECHA_VISITA).toBe('sin_fecha_visita_24h')
  })
})

describe('borde exacto del tope', () => {
  // Martes 4-ago-2026 10:00: martes 8 h + miércoles 9 h + jueves 7 h → jueves 16:00.
  const ingreso = desdeSantiago(2026, 8, 4, 10, 0)

  it('a las 24 h hábiles justas todavía no se lista', () => {
    const ahora = desdeSantiago(2026, 8, 6, 16, 0)
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(false)
    expect(oraculo(ingreso, ahora, SIN_FERIADOS)).toBe(false)
  })

  it('un minuto después sí', () => {
    const ahora = desdeSantiago(2026, 8, 6, 16, 1)
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(true)
    expect(oraculo(ingreso, ahora, SIN_FERIADOS)).toBe(true)
  })

  it('no confunde 24 h hábiles con 24 h de reloj', () => {
    // Miércoles 10:00: 24 h corridas, sólo 9 h hábiles.
    const ahora = desdeSantiago(2026, 8, 5, 10, 0)
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(false)
  })

  it('si el tope cae justo al cierre, no se lista hasta pasada la apertura siguiente', () => {
    // Martes 12:00: martes 6 h + miércoles 9 h + jueves 9 h → jueves 18:00.
    // Lo que va del cierre a la apertura del viernes no es hábil.
    const ingresoMedioDia = desdeSantiago(2026, 8, 4, 12, 0)
    for (const [ahora, esperado] of [
      [desdeSantiago(2026, 8, 6, 18, 0), false],
      [desdeSantiago(2026, 8, 6, 23, 0), false],
      [desdeSantiago(2026, 8, 7, 9, 0), false],
      [desdeSantiago(2026, 8, 7, 9, 1), true],
    ] as const) {
      expect(sinFechaVisitaVencida(entrada(ingresoMedioDia), ahora, SIN_FERIADOS)).toBe(esperado)
      expect(oraculo(ingresoMedioDia, ahora, SIN_FERIADOS)).toBe(esperado)
    }
  })
})

describe('fin de semana', () => {
  // Viernes 7-ago 10:00: viernes 8 h + lunes 9 h + martes 7 h → martes 11-ago 16:00.
  const ingreso = desdeSantiago(2026, 8, 7, 10, 0)

  it('el sábado y el domingo no cuentan', () => {
    const ahora = desdeSantiago(2026, 8, 10, 18, 0) // lunes al cierre: 17 h hábiles
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(false)
    expect(oraculo(ingreso, ahora, SIN_FERIADOS)).toBe(false)
  })

  it('vence el martes a las 16:00', () => {
    const ahora = desdeSantiago(2026, 8, 11, 16, 1)
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(true)
    expect(oraculo(ingreso, ahora, SIN_FERIADOS)).toBe(true)
  })

  it('un ingreso del sábado a las 22:00 empieza a contar el lunes a las 09:00', () => {
    // Lunes 9 h + martes 9 h + miércoles 6 h → miércoles 12-ago 15:00.
    const sabado = desdeSantiago(2026, 8, 8, 22, 0)
    const borde = desdeSantiago(2026, 8, 12, 15, 0)
    const despues = desdeSantiago(2026, 8, 12, 15, 1)
    expect(sinFechaVisitaVencida(entrada(sabado), borde, SIN_FERIADOS)).toBe(false)
    expect(sinFechaVisitaVencida(entrada(sabado), despues, SIN_FERIADOS)).toBe(true)
    expect(oraculo(sabado, borde, SIN_FERIADOS)).toBe(false)
    expect(oraculo(sabado, despues, SIN_FERIADOS)).toBe(true)
  })
})

describe('feriados', () => {
  it('un feriado en viernes empuja el tope un día hábil', () => {
    // Jueves 17-sep 10:00 · viernes 18-sep feriado: jueves 8 h + lunes 9 h +
    // martes 7 h → martes 22-sep 16:00. Sin el feriado: lunes 21-sep 16:00.
    const ingreso = desdeSantiago(2026, 9, 17, 10, 0)
    const ahora = desdeSantiago(2026, 9, 22, 10, 0)
    expect(FERIADOS.has('2026-09-18')).toBe(true)
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, FERIADOS)).toBe(false)
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(true)
    expect(oraculo(ingreso, ahora, FERIADOS)).toBe(false)
    expect(oraculo(ingreso, ahora, SIN_FERIADOS)).toBe(true)
  })

  it('cruza el cambio de horario del 5-abr y el Viernes Santo sin correrse', () => {
    // Jueves 2-abr 10:00 (GMT−3) · viernes 3-abr feriado · domingo 5-abr cambio
    // a GMT−4: jueves 8 h + lunes 9 h + martes 7 h → martes 7-abr 16:00.
    const ingreso = desdeSantiago(2026, 4, 2, 10, 0)
    const ahora = desdeSantiago(2026, 4, 7, 10, 0)
    expect(FERIADOS.has('2026-04-03')).toBe(true)
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, FERIADOS)).toBe(false)
    expect(oraculo(ingreso, ahora, FERIADOS)).toBe(false)
    // Sin el feriado el tope caía el lunes 6-abr 16:00: el martes ya está vencido.
    expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(true)
    // Y con el feriado, el borde real es el martes 16:00 en hora de invierno.
    expect(
      sinFechaVisitaVencida(entrada(ingreso), desdeSantiago(2026, 4, 7, 16, 0), FERIADOS)
    ).toBe(false)
    expect(
      sinFechaVisitaVencida(entrada(ingreso), desdeSantiago(2026, 4, 7, 16, 1), FERIADOS)
    ).toBe(true)
  })
})

describe('fecha de visita', () => {
  const ingreso = desdeSantiago(2026, 8, 4, 10, 0)
  // Unas 100 h hábiles después: muy por encima del tope.
  const muchoDespues = desdeSantiago(2026, 8, 20, 12, 0)

  it('con fecha de visita nunca se lista, pase el tiempo que pase', () => {
    expect(minutosHabilesEntre(ingreso, muchoDespues, SIN_FERIADOS)).toBeGreaterThanOrEqual(100 * 60)
    expect(
      sinFechaVisitaVencida(
        entrada(ingreso, { fechaVisitaProgramada: '2026-08-21' }),
        muchoDespues,
        SIN_FERIADOS
      )
    ).toBe(false)
  })

  it('una fecha de visita en blanco cuenta como vacía', () => {
    for (const vacia of ['', '   ', null, undefined]) {
      expect(
        sinFechaVisitaVencida(
          entrada(ingreso, { fechaVisitaProgramada: vacia }),
          muchoDespues,
          SIN_FERIADOS
        )
      ).toBe(true)
    }
  })
})

describe('estado', () => {
  const ingreso = desdeSantiago(2026, 8, 4, 10, 0)
  const vencido = desdeSantiago(2026, 8, 20, 12, 0)

  it('los estados terminales quedan fuera del tope', () => {
    expect([...ESTADOS_FUERA_DEL_TOPE].sort()).toEqual(['cancelada', 'cerrada', 'entregada'])
    for (const estado of ESTADOS_FUERA_DEL_TOPE) {
      expect(sinFechaVisitaVencida(entrada(ingreso, { estado }), vencido, SIN_FERIADOS)).toBe(false)
    }
  })

  it('los estados en vuelo sí se evalúan', () => {
    const enVuelo: EstadoSolicitud[] = ['creada', 'asignada', 'requiere_atencion']
    for (const estado of enVuelo) {
      expect(sinFechaVisitaVencida(entrada(ingreso, { estado }), vencido, SIN_FERIADOS)).toBe(true)
    }
  })
})

describe('ingreso ausente o inválido', () => {
  const ahora = desdeSantiago(2026, 8, 20, 12, 0)

  it('sin instante de ingreso no se fabrica antigüedad', () => {
    for (const ingreso of [undefined, null, '', '   ', 'no es fecha']) {
      expect(sinFechaVisitaVencida(entrada(ingreso), ahora, SIN_FERIADOS)).toBe(false)
    }
  })

  it('un ingreso futuro no se lista', () => {
    const futuro = desdeSantiago(2026, 9, 1, 10, 0)
    expect(sinFechaVisitaVencida(entrada(futuro), ahora, SIN_FERIADOS)).toBe(false)
  })
})
