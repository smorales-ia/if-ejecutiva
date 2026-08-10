import { describe, expect, it } from 'vitest'

import {
  desdeSantiago,
  esHabil,
  MINUTOS_POR_DIA_HABIL,
  minutosHabilesEntre,
  normalizarAVentana,
  partesEnSantiago,
  proximoInstanteHabil,
  sumarHorasHabiles,
  VENTANA_VPROPERTY,
} from './sla-habil'

/**
 * Feriados reales de `C_Feriados` (leídos vía MCP el 10-ago-2026), acotados a
 * las fechas que estos tests cruzan. Se usan los literales de la base, no un
 * calendario inventado.
 *
 * Ojo con septiembre: **18-sep-2026 cae viernes y 19-sep cae sábado.** Los dos
 * están cargados como feriado, pero el sábado ya era no hábil, así que lo que
 * hace fuerte al caso es el feriado en viernes arrastrando el fin de semana.
 */
const FERIADOS = new Set([
  '2026-04-03', // Viernes Santo — viernes
  '2026-04-04', // Sábado Santo — sábado
  '2026-09-18', // Independencia Nacional — viernes
  '2026-09-19', // Glorias del Ejército — sábado
])

const SIN_FERIADOS: ReadonlySet<string> = new Set<string>()

/** Etiqueta legible en reloj de Santiago, para que un fallo diga qué pasó. */
function enSantiago(d: Date): string {
  const p = partesEnSantiago(d)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${p.anio}-${pad(p.mes)}-${pad(p.dia)} ${pad(p.hora)}:${pad(p.minuto)}`
}

describe('conversión de zona · §5.2.1', () => {
  it('la ventana son nueve horas hábiles por día, no ocho', () => {
    expect(VENTANA_VPROPERTY.horaInicio).toBe(9)
    expect(VENTANA_VPROPERTY.horaFin).toBe(18)
    expect(MINUTOS_POR_DIA_HABIL).toBe(540)
  })

  it('resuelve el offset real de Chile en invierno y en verano, no uno fijo', () => {
    // Agosto: horario de invierno, GMT−4.
    expect(desdeSantiago(2026, 8, 4, 10, 0).toISOString()).toBe('2026-08-04T14:00:00.000Z')
    // Septiembre, tras el cambio del 6-sep-2026: horario de verano, GMT−3.
    expect(desdeSantiago(2026, 9, 17, 14, 0).toISOString()).toBe('2026-09-17T17:00:00.000Z')
  })

  it('partesEnSantiago es la inversa de desdeSantiago', () => {
    const instante = desdeSantiago(2026, 4, 2, 16, 0)
    const p = partesEnSantiago(instante)
    expect([p.anio, p.mes, p.dia, p.hora, p.minuto]).toEqual([2026, 4, 2, 16, 0])
  })
})

describe('esHabil · §5.2.1', () => {
  it('acepta un martes a media mañana', () => {
    expect(esHabil(desdeSantiago(2026, 8, 4, 10, 0), SIN_FERIADOS)).toBe(true)
  })

  it('rechaza el fin de semana', () => {
    expect(esHabil(desdeSantiago(2026, 8, 8, 10, 0), SIN_FERIADOS)).toBe(false) // sábado
    expect(esHabil(desdeSantiago(2026, 8, 9, 10, 0), SIN_FERIADOS)).toBe(false) // domingo
  })

  it('rechaza un feriado en día de semana', () => {
    // Viernes 18-sep-2026.
    expect(esHabil(desdeSantiago(2026, 9, 18, 10, 0), FERIADOS)).toBe(false)
    expect(esHabil(desdeSantiago(2026, 9, 18, 10, 0), SIN_FERIADOS)).toBe(true)
  })

  it('incluye la apertura y excluye el cierre', () => {
    expect(esHabil(desdeSantiago(2026, 8, 4, 9, 0), SIN_FERIADOS)).toBe(true)
    expect(esHabil(desdeSantiago(2026, 8, 4, 17, 59), SIN_FERIADOS)).toBe(true)
    expect(esHabil(desdeSantiago(2026, 8, 4, 18, 0), SIN_FERIADOS)).toBe(false)
    expect(esHabil(desdeSantiago(2026, 8, 4, 8, 59), SIN_FERIADOS)).toBe(false)
  })
})

describe('proximoInstanteHabil · §5.2.2', () => {
  it('devuelve el mismo instante si ya es hábil', () => {
    const dentro = desdeSantiago(2026, 8, 4, 10, 0)
    expect(proximoInstanteHabil(dentro, SIN_FERIADOS).getTime()).toBe(dentro.getTime())
  })

  it('sábado 15:00 → lunes 09:00', () => {
    const resultado = proximoInstanteHabil(desdeSantiago(2026, 8, 8, 15, 0), SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-10 09:00')
  })

  it('el correo que entra viernes 22:00 no consume SLA hasta lunes 09:00', () => {
    // Es el ejemplo literal de §5.2.2.
    const resultado = proximoInstanteHabil(desdeSantiago(2026, 8, 7, 22, 0), SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-10 09:00')
  })

  it('antes de abrir en día hábil → apertura del mismo día', () => {
    const resultado = proximoInstanteHabil(desdeSantiago(2026, 8, 4, 7, 30), SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-04 09:00')
  })

  it('salta el feriado en viernes y el fin de semana que arrastra', () => {
    // Jueves 17-sep 19:00 (cerrado) → viernes 18 feriado → lunes 21 09:00.
    const resultado = proximoInstanteHabil(desdeSantiago(2026, 9, 17, 19, 0), FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-09-21 09:00')
  })

  it('normalizarAVentana es el alias que usa el plan §9.6.1', () => {
    expect(normalizarAVentana).toBe(proximoInstanteHabil)
  })
})

describe('sumarHorasHabiles · núcleo del motor', () => {
  it('2 h dentro de la ventana: martes 10:00 → martes 12:00', () => {
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 8, 4, 10, 0), 2, SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-04 12:00')
  })

  it('4 h que cruzan el cierre un viernes: viernes 16:00 → lunes 11:00', () => {
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 8, 7, 16, 0), 4, SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-10 11:00')
  })

  it('media hora que cruza el cierre: martes 17:45 → miércoles 09:15', () => {
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 8, 4, 17, 45), 0.5, SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-05 09:15')
  })

  it('8 h que cruzan el feriado del 18-sep: jueves 14:00 → lunes 13:00', () => {
    // Jueves 17-sep 14:00 + 8 h → 4 h el jueves, viernes 18 feriado, fin de
    // semana, y 4 h el lunes 21 desde la apertura.
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 9, 17, 14, 0), 8, FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-09-21 13:00')
  })

  it('cruza el cambio de horario chileno, que es donde falla un offset fijo', () => {
    // Jueves 2-abr-2026 (GMT−3) + 4 h → viernes 3 y sábado 4 feriados, y el
    // domingo 5 Chile atrasa el reloj: el lunes 6 ya es GMT−4.
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 4, 2, 16, 0), 4, FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-04-06 11:00')
    // Y el instante absoluto confirma que el offset cambió: 11:00 GMT−4 = 15:00Z.
    expect(resultado.toISOString()).toBe('2026-04-06T15:00:00.000Z')
  })

  it('un aterrizaje exacto en el cierre se queda en el cierre, no rueda', () => {
    // 8 h desde las 10:00 dan exactamente las 18:00 del mismo día.
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 8, 4, 10, 0), 8, SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-04 18:00')
  })

  it('normaliza el punto de partida antes de sumar', () => {
    // Domingo 21:00 + 2 h se cuenta desde el lunes 09:00.
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 8, 9, 21, 0), 2, SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-10 11:00')
  })

  it('cero horas devuelve el instante normalizado', () => {
    const resultado = sumarHorasHabiles(desdeSantiago(2026, 8, 8, 15, 0), 0, SIN_FERIADOS)
    expect(enSantiago(resultado)).toBe('2026-08-10 09:00')
  })
})

describe('minutosHabilesEntre', () => {
  it('cuenta sólo el tramo dentro de la ventana', () => {
    const desde = desdeSantiago(2026, 8, 4, 17, 0)
    const hasta = desdeSantiago(2026, 8, 5, 10, 0)
    expect(minutosHabilesEntre(desde, hasta, SIN_FERIADOS)).toBe(120)
  })

  it('un fin de semana completo no aporta minutos', () => {
    const desde = desdeSantiago(2026, 8, 7, 17, 0) // viernes
    const hasta = desdeSantiago(2026, 8, 10, 10, 0) // lunes
    expect(minutosHabilesEntre(desde, hasta, SIN_FERIADOS)).toBe(120)
  })

  it('un día hábil completo rinde 540 minutos', () => {
    const desde = desdeSantiago(2026, 8, 4, 9, 0)
    const hasta = desdeSantiago(2026, 8, 4, 18, 0)
    expect(minutosHabilesEntre(desde, hasta, SIN_FERIADOS)).toBe(MINUTOS_POR_DIA_HABIL)
  })

  it('descuenta el feriado intermedio', () => {
    const desde = desdeSantiago(2026, 9, 17, 14, 0)
    const hasta = desdeSantiago(2026, 9, 21, 13, 0)
    expect(minutosHabilesEntre(desde, hasta, FERIADOS)).toBe(480)
    // Sin feriados, el viernes 18 y su jornada completa sí entrarían.
    expect(minutosHabilesEntre(desde, hasta, SIN_FERIADOS)).toBe(480 + MINUTOS_POR_DIA_HABIL)
  })

  it('devuelve 0 si el intervalo está invertido o vacío', () => {
    const a = desdeSantiago(2026, 8, 4, 10, 0)
    const b = desdeSantiago(2026, 8, 4, 12, 0)
    expect(minutosHabilesEntre(b, a, SIN_FERIADOS)).toBe(0)
    expect(minutosHabilesEntre(a, a, SIN_FERIADOS)).toBe(0)
  })

  it('un intervalo enteramente fuera de ventana no aporta minutos', () => {
    const desde = desdeSantiago(2026, 8, 8, 10, 0) // sábado
    const hasta = desdeSantiago(2026, 8, 9, 23, 0) // domingo
    expect(minutosHabilesEntre(desde, hasta, SIN_FERIADOS)).toBe(0)
  })
})

describe('invariante estructural · RO-06', () => {
  /**
   * `minutosHabilesEntre(t, sumarHorasHabiles(t, h)) === h * 60` para los
   * umbrales de las siete etapas de §5.2.4 y varias fechas de partida, entre
   * ellas las que cruzan feriado y cambio de horario. Es la propiedad que
   * garantiza que las dos funciones son inversas y que ningún borde de jornada
   * se cuenta dos veces ni se pierde.
   *
   * Los umbrales van como datos del test —no como constantes del motor—: el
   * criterio de aceptación de la Tanda B exige que `lib/sla-*.ts` no contenga
   * ninguno de los números de §5.2.4.
   */
  const umbralesEtapas = [2, 3, 4, 6, 0.5, 24, 48]

  const partidas: Array<[string, Date]> = [
    ['martes media mañana', desdeSantiago(2026, 8, 4, 10, 0)],
    ['viernes a punto de cerrar', desdeSantiago(2026, 8, 7, 17, 45)],
    ['jueves antes del feriado en viernes', desdeSantiago(2026, 9, 17, 14, 0)],
    ['jueves antes del cambio de horario', desdeSantiago(2026, 4, 2, 16, 0)],
    ['apertura del lunes', desdeSantiago(2026, 8, 10, 9, 0)],
    ['fuera de ventana, domingo', desdeSantiago(2026, 8, 9, 21, 0)],
  ]

  for (const [etiqueta, partida] of partidas) {
    for (const horas of umbralesEtapas) {
      it(`${etiqueta} + ${horas} h ida y vuelta`, () => {
        const destino = sumarHorasHabiles(partida, horas, FERIADOS)
        const base = proximoInstanteHabil(partida, FERIADOS)
        expect(minutosHabilesEntre(base, destino, FERIADOS)).toBe(Math.round(horas * 60))
      })
    }
  }
})
