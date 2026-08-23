import { describe, expect, it } from 'vitest'
import { _coordinacionVigente, _fechaVisible, proyectarSlaEtapa } from './lectura-tasacion'
import type { SolicitudFields } from './auth-guard'
import { SIN_FECHA_VISITA } from '@/lib/tasador/tasaciones'

/**
 * P3-TAS.A · el reloj por etapa de la card (RF-53 · CI-021).
 *
 * ## Qué defiende este archivo
 *
 * Hasta P3-TAS.A ninguna capa poblaba el semáforo de la cola: la card caía a
 * `slaStatus ?? 'en_plazo'` y `horasRestantes ?? 0` y pintaba **"En plazo · 0h"**
 * en todas las filas, con la cartera entera emitiendo
 * `sla_semaforo_etapa = "rojo"`. Un verde que la base no respalda es peor que
 * un hueco: el hueco se ve.
 *
 * Por eso la afirmación central no es «proyecta bien» sino **«no fabrica»**:
 * sin `sla_etapa_actual` no hay objeto, sin `sla_etapa_vence_ts` no hay
 * etiqueta con número, y un tono que la fórmula no emitió es `sin_dato` y no
 * un color elegido acá.
 *
 * `ahora` se inyecta para que la etiqueta no dependa del reloj de pared: sin
 * eso, estos tests cambiarían de resultado según el día en que se corran.
 */

const AHORA = new Date('2026-08-19T12:00:00.000Z')

const NOMBRES: ReadonlyMap<number, string> = new Map([
  [1, 'Ingreso y validación'],
  [2, 'Coordinación de visita'],
])

function campos(extra: Record<string, unknown> = {}): SolicitudFields {
  return {
    sla_etapa_actual: 2,
    sla_semaforo_etapa: 'ambar',
    sla_etapa_alerta_ts: '2026-08-19T13:00:00.000Z',
    sla_etapa_vence_ts: '2026-08-19T14:30:00.000Z',
    ...extra,
  }
}

describe('proyectarSlaEtapa · cuándo NO hay píldora', () => {
  it('sin sla_etapa_actual no proyecta nada — ausente, no gris', () => {
    expect(proyectarSlaEtapa({}, NOMBRES, AHORA)).toBeUndefined()
  })

  it('descarta una etapa fuera del rango 1–7', () => {
    expect(proyectarSlaEtapa(campos({ sla_etapa_actual: 0 }), NOMBRES, AHORA)).toBeUndefined()
    expect(proyectarSlaEtapa(campos({ sla_etapa_actual: 8 }), NOMBRES, AHORA)).toBeUndefined()
  })

  it('descarta una etapa que no es un entero', () => {
    expect(proyectarSlaEtapa(campos({ sla_etapa_actual: 2.5 }), NOMBRES, AHORA)).toBeUndefined()
    expect(proyectarSlaEtapa(campos({ sla_etapa_actual: '2' }), NOMBRES, AHORA)).toBeUndefined()
  })
})

describe('proyectarSlaEtapa · tono', () => {
  it('lo lee literal de la fórmula, sin recalcular', () => {
    for (const tono of ['verde', 'ambar', 'rojo', 'sin_dato'] as const) {
      expect(proyectarSlaEtapa(campos({ sla_semaforo_etapa: tono }), NOMBRES, AHORA)?.tono).toBe(
        tono
      )
    }
  })

  /**
   * Si la fórmula empezara a emitir otra cosa, lo correcto es que se note como
   * `sin_dato` —la píldora no se pinta— y no que el mapper lo disimule
   * eligiendo un color por su cuenta (RO-05 · RO-13).
   */
  it('un valor fuera del contrato cae a sin_dato y no a un color elegido acá', () => {
    expect(
      proyectarSlaEtapa(campos({ sla_semaforo_etapa: 'AMARILLO' }), NOMBRES, AHORA)?.tono
    ).toBe('sin_dato')
    expect(proyectarSlaEtapa(campos({ sla_semaforo_etapa: undefined }), NOMBRES, AHORA)?.tono).toBe(
      'sin_dato'
    )
  })

  it('no recalcula el tono a partir de las fechas: vencida y en verde se proyecta verde', () => {
    const etapa = proyectarSlaEtapa(
      campos({ sla_semaforo_etapa: 'verde', sla_etapa_vence_ts: '2026-01-01T00:00:00.000Z' }),
      NOMBRES,
      AHORA
    )
    expect(etapa?.tono).toBe('verde')
  })
})

describe('proyectarSlaEtapa · rótulo y etiqueta', () => {
  it('toma el nombre de C_SLA_Etapas, nunca de un literal del repo', () => {
    expect(proyectarSlaEtapa(campos(), NOMBRES, AHORA)?.nombre).toBe('Coordinación de visita')
  })

  it('sin catálogo degrada a "Etapa {n}" en vez de tumbar la lectura', () => {
    expect(proyectarSlaEtapa(campos(), new Map(), AHORA)?.nombre).toBe('Etapa 2')
  })

  it('mide contra el instante ya materializado por el motor', () => {
    expect(proyectarSlaEtapa(campos(), NOMBRES, AHORA)?.etiqueta).toBe('Vence en 2h 30m')
  })

  it('vencida lo dice, y no muestra un número en positivo', () => {
    const etapa = proyectarSlaEtapa(
      campos({ sla_etapa_vence_ts: '2026-08-19T10:00:00.000Z' }),
      NOMBRES,
      AHORA
    )
    expect(etapa?.etiqueta).toBe('Vencida hace 2h')
  })

  it('sin venceTs no fabrica un plazo', () => {
    const etapa = proyectarSlaEtapa(campos({ sla_etapa_vence_ts: undefined }), NOMBRES, AHORA)
    expect(etapa?.etiqueta).toBe('Sin datos de etapa')
    expect(etapa?.venceTs).toBeNull()
  })
})

describe('proyectarSlaEtapa · instantes', () => {
  it('normaliza los dos timestamps a ISO', () => {
    const etapa = proyectarSlaEtapa(campos(), NOMBRES, AHORA)
    expect(etapa?.alertaTs).toBe('2026-08-19T13:00:00.000Z')
    expect(etapa?.venceTs).toBe('2026-08-19T14:30:00.000Z')
  })

  it('una fecha ilegible es null, no una Invalid Date que llegue a la UI', () => {
    const etapa = proyectarSlaEtapa(
      campos({ sla_etapa_alerta_ts: 'ayer', sla_etapa_vence_ts: '' }),
      NOMBRES,
      AHORA
    )
    expect(etapa?.alertaTs).toBeNull()
    expect(etapa?.venceTs).toBeNull()
  })

  /** Control negativo: sin él, todo lo anterior pasaría con una función que devuelve undefined. */
  it('el camino feliz sí proyecta la etapa completa', () => {
    expect(proyectarSlaEtapa(campos(), NOMBRES, AHORA)).toEqual({
      numero: 2,
      nombre: 'Coordinación de visita',
      tono: 'ambar',
      etiqueta: 'Vence en 2h 30m',
      alertaTs: '2026-08-19T13:00:00.000Z',
      venceTs: '2026-08-19T14:30:00.000Z',
    })
  })
})

describe('coordinacionVigente · el discriminante del gate T-A (§2.4 · CI-045 · CI-048)', () => {
  /**
   * El campo no es fórmula: lo escribe el handler de coordinación con exactamente
   * estos dos literales. Se afirman para que un cambio de contrato en el write
   * path lo rompa acá y no en la UI.
   */
  it('deja pasar los dos literales del contrato', () => {
    expect(_coordinacionVigente('confirmada')).toBe('confirmada')
    expect(_coordinacionVigente('rechazada')).toBe('rechazada')
  })

  /**
   * La afirmación central, igual que en `proyectarSlaEtapa`: **no fabrica**. Un
   * `""` (sin coordinación aún), un campo ausente o cualquier valor fuera del
   * contrato son `null` — nunca un estado inventado que dejaría entrar a la
   * captura a una solicitud sin coordinar (el gate de §2.4).
   */
  it('todo lo demás es null, no un estado inventado', () => {
    expect(_coordinacionVigente('')).toBeNull()
    expect(_coordinacionVigente(undefined)).toBeNull()
    expect(_coordinacionVigente(null)).toBeNull()
    expect(_coordinacionVigente('CONFIRMADA')).toBeNull()
    expect(_coordinacionVigente('devuelta')).toBeNull()
    expect(_coordinacionVigente(1)).toBeNull()
    expect(_coordinacionVigente(['confirmada'])).toBeNull()
  })
})

describe('fechaVisible · el desfase de huso que encontró el seed', () => {
  /**
   * El caso real: VP-2026-0062 se sembró con `fecha_visita_programada` el
   * **18-08-2026** y la cola mostraba **17-08-2026**. `fecha_visita_programada`
   * es un campo `date`, llega sin hora, y la medianoche UTC cae en el día
   * anterior para cualquier huso al oeste de Greenwich.
   *
   * Es el bug con peor consecuencia de los que aparecieron en P3-TAS: manda al
   * tasador a la propiedad un día antes.
   */
  it('un campo date no retrocede un día al formatearse', () => {
    expect(_fechaVisible('2026-08-18')).toBe('18-08-2026')
  })

  it('tampoco retrocede el primero de mes, que es donde el error salta al mes anterior', () => {
    expect(_fechaVisible('2026-09-01')).toBe('01-09-2026')
  })

  it('un dateTime con hora real se muestra en su día', () => {
    expect(_fechaVisible('2026-08-18T09:30:00.000Z')).toBe('18-08-2026')
  })

  it('sin fecha devuelve el literal de "por agendar", no una fecha inventada', () => {
    expect(_fechaVisible(undefined)).toBe(SIN_FECHA_VISITA)
    expect(_fechaVisible('   ')).toBe(SIN_FECHA_VISITA)
    expect(_fechaVisible('mañana')).toBe(SIN_FECHA_VISITA)
  })
})
