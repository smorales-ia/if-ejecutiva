import { describe, expect, it } from 'vitest'

import {
  duracionCorta,
  etiquetaResponsable,
  ETIQUETA_ESTADO,
  RESPONSABLE_LABELS,
  horasHabilesCortas,
  instanteCorto,
  mensajeAlertaEtapa,
  MSG_SIN_CRONOLOGIA,
  partesFechaHora,
  rangoEtapa,
  resumenTiempoEtapa,
  tieneCronologia,
  type EtapaCronologia,
} from './sla-cronologia'

/**
 * Tanda E · §9.6.2 — formato y literales de la cronología de etapas.
 *
 * Lo que se fija acá es **texto que el usuario lee**: los dos literales de
 * alerta de §9.6.1, palabra por palabra, y las reglas de degradación honesta
 * (sin `venceTs` no hay alerta; sin inicio no hay minutos). Los literales son
 * canónicos y no admiten variación (§6 del Blueprint), así que un test que los
 * compare por igualdad exacta es la única forma de que un refactor no los
 * reescriba sin que nadie lo note.
 *
 * Todas las fechas se escriben en UTC y se esperan en hora de Santiago: agosto
 * es invierno en Chile, UTC−4.
 */

/** Fixture con los umbrales reales de §5.2.4 para e1. */
function etapa(over: Partial<EtapaCronologia> = {}): EtapaCronologia {
  return {
    numero: 1,
    etapaKey: 'e1',
    nombre: 'Ingreso de solicitud',
    responsable: 'Control y Seguimiento',
    slaIdealHoras: 2,
    slaMaxHoras: 3,
    inicioTs: null,
    finTs: null,
    minutosHabiles: null,
    alertaTs: null,
    venceTs: null,
    estado: 'pendiente',
    ...over,
  }
}

const AHORA = new Date('2026-08-11T14:00:00.000Z')

describe('duracionCorta · dos unidades como máximo', () => {
  it('formatea minutos, horas y días', () => {
    expect(duracionCorta(0)).toBe('0m')
    expect(duracionCorta(12)).toBe('12m')
    expect(duracionCorta(60)).toBe('1h')
    expect(duracionCorta(250)).toBe('4h 10m')
    expect(duracionCorta(1500)).toBe('1d 1h')
    expect(duracionCorta(1440)).toBe('1d')
  })

  it('no emite duraciones negativas', () => {
    expect(duracionCorta(-30)).toBe('0m')
  })
})

describe('horasHabilesCortas · umbrales fraccionarios de §5.2.4', () => {
  it('escribe la media hora de la etapa 7 como 30m, no como 0.5h', () => {
    expect(horasHabilesCortas(0.5)).toBe('30m')
    expect(horasHabilesCortas(2)).toBe('2h')
    expect(horasHabilesCortas(1.5)).toBe('1h 30m')
  })
})

describe('resumenTiempoEtapa · consumido contra ideal/máximo', () => {
  it('escribe el par completo de §5.2.4', () => {
    const e = etapa({ minutosHabiles: 100, estado: 'completada' })
    expect(resumenTiempoEtapa(e)).toBe('1h 40m de 2h / 3h')
  })

  it('muestra el cero: una etapa recién abierta no es una etapa sin empezar', () => {
    expect(resumenTiempoEtapa(etapa({ minutosHabiles: 0, estado: 'en_curso' }))).toBe(
      '0m de 2h / 3h'
    )
  })

  it('devuelve null cuando la etapa no empezó', () => {
    expect(resumenTiempoEtapa(etapa())).toBeNull()
  })
})

describe('instanteCorto · hora de Santiago, no la del navegador', () => {
  it('convierte el instante UTC al reloj de pared de la oficina', () => {
    // 13:10Z en invierno chileno = 09:10 en Santiago.
    expect(instanteCorto('2026-08-10T13:10:00.000Z')).toBe('10 ago 09:10')
  })

  it('no inventa nada con entrada nula o basura', () => {
    expect(instanteCorto(null)).toBeNull()
    expect(instanteCorto('no-es-fecha')).toBeNull()
  })
})

describe('rangoEtapa · entrada → salida', () => {
  it('cierra el rango con la salida real cuando la etapa terminó', () => {
    const e = etapa({
      inicioTs: '2026-08-10T13:10:00.000Z',
      finTs: '2026-08-10T15:40:00.000Z',
      estado: 'completada',
    })
    expect(rangoEtapa(e)).toBe('10 ago 09:10 → 10 ago 11:40')
  })

  it('dice "en curso" en la etapa vigente, sin fabricar una salida', () => {
    const e = etapa({ inicioTs: '2026-08-10T15:40:00.000Z', estado: 'en_curso' })
    expect(rangoEtapa(e)).toBe('10 ago 11:40 → en curso')
  })

  it('declara la falta de entrada en las filas del backfill (fin sin inicio)', () => {
    const e = etapa({ finTs: '2026-08-10T15:40:00.000Z', estado: 'completada' })
    expect(rangoEtapa(e)).toBe('sin registro de entrada → 10 ago 11:40')
  })

  it('devuelve null cuando no hay ningún timestamp', () => {
    expect(rangoEtapa(etapa())).toBeNull()
  })
})

describe('partesFechaHora · el año sólo cuando aporta', () => {
  it('omite el año en curso', () => {
    expect(partesFechaHora('2026-08-11T19:30:00.000Z', AHORA)).toEqual({
      fecha: '11 de agosto',
      hora: '15:30',
    })
  })

  it('escribe el año cuando el instante es de otro año', () => {
    expect(partesFechaHora('2025-12-30T19:30:00.000Z', AHORA)?.fecha).toBe(
      '30 de diciembre de 2025'
    )
  })
})

describe('tieneCronologia · estado vacío honesto (E-4)', () => {
  it('es false cuando las siete están pendientes', () => {
    const siete = Array.from({ length: 7 }, () => etapa())
    expect(tieneCronologia(siete)).toBe(false)
    expect(MSG_SIN_CRONOLOGIA).toBe(
      'Todavía no hay cronología de etapas para esta solicitud.'
    )
  })

  it('es true con una sola etapa instrumentada', () => {
    expect(tieneCronologia([etapa(), etapa({ estado: 'en_curso' })])).toBe(true)
  })
})

describe('mensajeAlertaEtapa · literales de §9.6.1 (E-3)', () => {
  const vigente = etapa({
    numero: 2,
    nombre: 'Coordinación de visita (llamado)',
    // La clave tal como la guarda `C_SLA_Etapas`, no el rótulo. Verificado
    // contra la tabla real el 11-ago-2026.
    responsable: 'tasador',
    venceTs: '2026-08-11T19:30:00.000Z',
    estado: 'en_curso',
  })

  it('emite el literal ámbar palabra por palabra', () => {
    expect(mensajeAlertaEtapa('ambar', vigente, AHORA)).toBe(
      'La etapa 2 · Coordinación de visita (llamado) alcanzó su plazo ideal. ' +
        'Vence el 11 de agosto a las 15:30.'
    )
  })

  it('emite el literal rojo palabra por palabra, con el área responsable', () => {
    expect(mensajeAlertaEtapa('rojo', vigente, AHORA)).toBe(
      'La etapa 2 · Coordinación de visita (llamado) superó su plazo máximo el ' +
        '11 de agosto a las 15:30. Responsable: Tasador.'
    )
  })

  it('omite la frase del responsable antes que nombrar a nadie', () => {
    const sinArea = { ...vigente, responsable: null }
    expect(mensajeAlertaEtapa('rojo', sinArea, AHORA)).toBe(
      'La etapa 2 · Coordinación de visita (llamado) superó su plazo máximo el ' +
        '11 de agosto a las 15:30.'
    )
  })

  it('no alerta en verde ni sin dato: la alerta interrumpe, y sólo dos casos lo ameritan', () => {
    expect(mensajeAlertaEtapa('verde', vigente, AHORA)).toBeNull()
    expect(mensajeAlertaEtapa('sin_dato', vigente, AHORA)).toBeNull()
  })

  it('no alerta sin venceTs: una alerta con la fecha en blanco es peor que ninguna', () => {
    expect(mensajeAlertaEtapa('rojo', { ...vigente, venceTs: null }, AHORA)).toBeNull()
    expect(mensajeAlertaEtapa('ambar', { ...vigente, venceTs: 'x' }, AHORA)).toBeNull()
  })

  it('respeta el separador " · " entre número y nombre (§6.1)', () => {
    expect(mensajeAlertaEtapa('ambar', vigente, AHORA)).toContain('La etapa 2 · ')
  })
})

describe('etiquetaResponsable · las áreas de §5.2.3, no las claves de la tabla', () => {
  it('traduce las tres claves que C_SLA_Etapas usa de verdad', () => {
    // Verificadas contra `tbl05zu5RLhH3u6pl` el 11-ago-2026: las siete filas
    // guardan `control_seguimiento`, `tasador` o `visado`.
    expect(etiquetaResponsable('control_seguimiento')).toBe('Control y Seguimiento')
    expect(etiquetaResponsable('tasador')).toBe('Tasador')
    expect(etiquetaResponsable('visado')).toBe('Visado')
  })

  it('devuelve la clave cruda si aparece un actor que §5.2.3 no declara', () => {
    // Feo a propósito: un quinto actor es una señal, y esconderlo tras "—"
    // borraría al responsable de una etapa en rojo.
    expect(etiquetaResponsable('perito_externo')).toBe('perito_externo')
  })

  it('no inventa área cuando la fila viene vacía', () => {
    expect(etiquetaResponsable(null)).toBeNull()
    expect(etiquetaResponsable('')).toBeNull()
  })

  it('ningún rótulo se emite en snake_case (§6.1: nada de claves técnicas)', () => {
    for (const rotulo of Object.values(RESPONSABLE_LABELS)) {
      expect(rotulo).not.toMatch(/_/)
    }
  })
})

describe('ETIQUETA_ESTADO · los tres estados del endpoint', () => {
  it('rotula en español y sin inventar un cuarto estado', () => {
    expect(ETIQUETA_ESTADO).toEqual({
      completada: 'Completada',
      en_curso: 'En curso',
      pendiente: 'Pendiente',
    })
  })
})
