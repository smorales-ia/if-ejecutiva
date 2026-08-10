import { describe, expect, it } from 'vitest'

import { partesEnSantiago } from './sla-habil'
import {
  buildFormula,
  mapRecord,
  nombresDeEtapas,
  SLA_ETAPA_FILTROS_VALIDOS,
  SOLICITUD_FIELDS,
} from './solicitudes'
import { FIELD_IDS_SLA, type MatrizEtapas } from './sla-etapas'

/**
 * Tanda C · §9.6.2 — contrato del read-layer del reloj por etapa.
 *
 * Lo que estos tests fijan no es aritmética (eso es la Tanda B) sino **contrato
 * de lectura**: qué literales se comparan, qué campos se piden, y cuándo
 * `slaEtapa` está presente. Los tres son cosas que fallan en silencio si se
 * rompen —una fórmula que filtra cero filas se lee como "no hay casos"—, que es
 * exactamente la familia de bugs de RO-13.
 */

/** Copia literal de §5.2.4, igual que en `sla-etapas.test.ts`: es un fixture. */
const MATRIZ: MatrizEtapas = {
  e1: { etapaKey: 'e1', orden: 1, nombre: 'Ingreso de solicitud', responsable: 'control_seguimiento', idealHoras: 2, maxHoras: 3 },
  e2: { etapaKey: 'e2', orden: 2, nombre: 'Coordinación de visita (llamado)', responsable: 'tasador', idealHoras: 4, maxHoras: 6 },
  e7: { etapaKey: 'e7', orden: 7, nombre: 'Visación y envío final', responsable: 'visado', idealHoras: 0.5, maxHoras: 0.5 },
}

const NOMBRES = nombresDeEtapas(MATRIZ)

/** Campos mínimos para que `mapRecord` no reviente; ninguno toca el SLA. */
const BASE: Record<string, string | undefined> = {
  codigo_ext: 'VP-2026-0081',
  estado: 'asignada',
}

function mapear(extra: Record<string, string | undefined>) {
  return mapRecord('recAAAAAAAAAAAAAA', '2026-08-10T12:00:00.000Z', { ...BASE, ...extra }, NOMBRES)
}

describe('SOLICITUD_FIELDS · proyección del reloj por etapa (C-2)', () => {
  it('pide los cinco campos SLA por FIELD_ID, no por nombre', () => {
    // Por FIELD_ID porque son campos recién creados que todavía no están en
    // `docs/schema-airtable.md`: el `fld…` es lo único verificado, y un rename
    // en la UI de Airtable degradaría la lectura en silencio (E-018/E-019).
    for (const fld of [
      FIELD_IDS_SLA.sla_e1_inicio_ts,
      FIELD_IDS_SLA.sla_etapa_actual,
      FIELD_IDS_SLA.sla_etapa_alerta_ts,
      FIELD_IDS_SLA.sla_etapa_vence_ts,
      FIELD_IDS_SLA.sla_semaforo_etapa,
    ]) {
      expect(SOLICITUD_FIELDS).toContain(fld)
    }
  })

  it('no pide ninguno de los cinco por su nombre (evita pedir el mismo campo dos veces)', () => {
    for (const nombre of [
      'sla_e1_inicio_ts',
      'sla_etapa_actual',
      'sla_etapa_alerta_ts',
      'sla_etapa_vence_ts',
      'sla_semaforo_etapa',
    ]) {
      expect(SOLICITUD_FIELDS).not.toContain(nombre)
    }
  })
})

describe('mapRecord · slaEtapa (C-2)', () => {
  it('deja slaEtapa ausente cuando no hay sla_etapa_actual', () => {
    // Criterio de aceptación de la Tanda C: "ausente para una sin datos". Es el
    // caso de casi toda la cartera en v1.9 — sólo e1 y e2 tienen escritor.
    expect(mapear({}).slaEtapa).toBeUndefined()
  })

  it('deja slaEtapa ausente cuando sla_etapa_actual está fuera de 1-7', () => {
    expect(mapear({ sla_etapa_actual: '0' }).slaEtapa).toBeUndefined()
    expect(mapear({ sla_etapa_actual: '8' }).slaEtapa).toBeUndefined()
  })

  it('puebla slaEtapa con el nombre leído de C_SLA_Etapas, no hardcodeado', () => {
    const s = mapear({ sla_etapa_actual: '2', sla_semaforo_etapa: 'ambar' })
    expect(s.slaEtapa?.numero).toBe(2)
    expect(s.slaEtapa?.nombre).toBe('Coordinación de visita (llamado)')
  })

  it('degrada el nombre a "Etapa {n}" si la matriz no llegó, sin tumbar la lectura', () => {
    const s = mapRecord('recAAAAAAAAAAAAAA', '2026-08-10T12:00:00.000Z', {
      ...BASE,
      sla_etapa_actual: '5',
    })
    expect(s.slaEtapa?.nombre).toBe('Etapa 5')
  })

  it('copia el tono de la fórmula por igualdad literal, sin recalcular (RO-13 · §9.6-R5)', () => {
    for (const tono of ['verde', 'ambar', 'rojo', 'sin_dato'] as const) {
      expect(mapear({ sla_etapa_actual: '3', sla_semaforo_etapa: tono }).slaEtapa?.tono).toBe(tono)
    }
  })

  it('cae a sin_dato ante un literal que no está en el contrato, en vez de normalizarlo', () => {
    // Regresión del anti-patrón de RO-13: si la fórmula empezara a emitir
    // "Ambar" o "🟡 ambar", lo correcto es que se note como sin_dato y no que
    // el mapper lo disimule con un toLowerCase que esconda el cambio.
    expect(mapear({ sla_etapa_actual: '3', sla_semaforo_etapa: 'Ambar' }).slaEtapa?.tono).toBe('sin_dato')
    expect(mapear({ sla_etapa_actual: '3', sla_semaforo_etapa: '🟡 ambar' }).slaEtapa?.tono).toBe('sin_dato')
  })

  it('conserva la etapa con tono sin_dato cuando no hay umbrales materializados', () => {
    // "Estoy en la etapa 3 y no sé su plazo" no es lo mismo que "no sé nada de
    // esta solicitud", y ninguno de los dos es verde.
    const s = mapear({ sla_etapa_actual: '3' })
    expect(s.slaEtapa?.tono).toBe('sin_dato')
    expect(s.slaEtapa?.venceTs).toBeNull()
    expect(s.slaEtapa?.etiqueta).toBe('Sin datos de etapa')
  })

  it('normaliza a ISO tanto la fecha es-CL de cellFormat=string como el ISO crudo', () => {
    // El mismo campo llega renderizado en es-CL por la bandeja (cellFormat
    // string) y en ISO por el endpoint de cronología (JSON). Si el mapper no
    // normalizara, `venceTs` significaría cosas distintas según por dónde entró
    // (RO-05).
    const desdeCL = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '12-08-2026 13:00' })
    const p = partesEnSantiago(new Date(desdeCL.slaEtapa!.venceTs!))
    expect([p.anio, p.mes, p.dia, p.hora, p.minuto]).toEqual([2026, 8, 12, 13, 0])

    const desdeIso = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '2026-08-12T17:00:00.000Z' })
    expect(desdeIso.slaEtapa?.venceTs).toBe('2026-08-12T17:00:00.000Z')
  })

  it('interpreta la fecha es-CL en reloj de Santiago, no en el del proceso', () => {
    // El proceso corre en UTC en Railway. Un `new Date("12-08-2026 13:00")`
    // ingenuo daría las 13:00 UTC, o sea las 09:00 de Santiago: cuatro horas de
    // corrimiento en todos los vencimientos.
    const s = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '12-08-2026 13:00' })
    expect(s.slaEtapa?.venceTs).toBe('2026-08-12T17:00:00.000Z') // invierno = UTC-4
  })

  it('devuelve null y no una fecha inventada cuando el texto no es parseable', () => {
    const s = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: 'proximamente' })
    expect(s.slaEtapa?.venceTs).toBeNull()
    expect(s.slaEtapa?.etiqueta).toBe('Sin datos de etapa')
  })

  it('expone slaE1InicioTs en ISO para que el formulario de edición lo edite (C-7)', () => {
    const s = mapear({ sla_e1_inicio_ts: '10-08-2026 09:10' })
    expect(s.slaE1InicioTs).toBe('2026-08-10T13:10:00.000Z')
  })

  it('no rompe los mocks: sin campos SLA, slaEtapa y slaE1InicioTs quedan undefined', () => {
    const s = mapear({})
    expect(s.slaEtapa).toBeUndefined()
    expect(s.slaE1InicioTs).toBeUndefined()
  })
})

describe('etiqueta de la píldora (C-2)', () => {
  const enMinutos = (m: number) => new Date(Date.now() + m * 60_000).toISOString()

  it('dice cuánto falta cuando la etapa está en plazo', () => {
    const s = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: enMinutos(250) })
    expect(s.slaEtapa?.etiqueta).toMatch(/^Vence en 4h (9|10)m$/)
  })

  it('dice cuánto hace que venció cuando el plazo ya pasó', () => {
    const s = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: enMinutos(-1500) })
    expect(s.slaEtapa?.etiqueta).toMatch(/^Vencida hace 1d 1h$/)
  })

  it('usa una sola unidad cuando la segunda es cero', () => {
    const s = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: enMinutos(120) })
    expect(s.slaEtapa?.etiqueta).toMatch(/^Vence en (1h 59m|2h)$/)
  })
})

describe('buildFormula · vista sla_riesgo como unión (C-3)', () => {
  const formula = buildFormula('sla_riesgo')

  it('conserva los dos términos del agregado por subcadena', () => {
    // `semaforo_sla` emite literales con emoji que llega mangleado a "?": la
    // palabra es confiable, el prefijo no (RO-13).
    expect(formula).toContain('FIND("VENCIDO",{semaforo_sla})>0')
    expect(formula).toContain('FIND("EN RIESGO",{semaforo_sla})>0')
  })

  it('agrega los dos términos de etapa por igualdad literal', () => {
    expect(formula).toContain('{sla_semaforo_etapa}="ambar"')
    expect(formula).toContain('{sla_semaforo_etapa}="rojo"')
  })

  it('no usa FIND sobre sla_semaforo_etapa', () => {
    // La fórmula la escribimos nosotros en M-13 y emite cuatro literales
    // limpios; un FIND aquí haría que "verde" matchee un futuro "verde_claro".
    expect(formula).not.toContain('FIND("ambar"')
    expect(formula).not.toContain('FIND("rojo"')
  })

  it('es un OR de los cuatro términos, no un AND', () => {
    // La pregunta de la vista es "qué tengo que mirar hoy": un AND devolvería
    // sólo las que están mal en los dos relojes a la vez, o sea casi ninguna, y
    // una bandeja vacía se lee como "no hay casos".
    expect(formula.startsWith('OR(')).toBe(true)
  })
})

describe('filtro ?sla_etapa= (C-3)', () => {
  it('acepta sólo ambar y rojo', () => {
    expect(SLA_ETAPA_FILTROS_VALIDOS).toEqual(['ambar', 'rojo'])
  })

  it('interpola el valor de la lista cerrada por igualdad', () => {
    expect(buildFormula('todas', undefined, { sla_etapa: 'rojo' })).toContain(
      '{sla_semaforo_etapa}="rojo"'
    )
  })

  it('descarta cualquier valor fuera de la lista, incluido verde y sin_dato', () => {
    for (const valor of ['verde', 'sin_dato', 'AMBAR', '']) {
      expect(buildFormula('todas', undefined, { sla_etapa: valor })).toBe('TRUE()')
    }
  })

  it('no deja escapar comillas hacia la fórmula (RF-05 · D-07)', () => {
    // La lista cerrada ya lo impide; el escape es la segunda línea, para que la
    // protección no dependa de que la lista siga siendo cerrada mañana.
    const f = buildFormula('todas', undefined, { sla_etapa: 'rojo","x' })
    expect(f).toBe('TRUE()')
  })

  it('convive con ?sla= sin pisarlo: son dos relojes, no dos nombres del mismo', () => {
    const f = buildFormula('todas', undefined, { sla: 'rojo', sla_etapa: 'ambar' })
    expect(f).toContain('FIND("VENCIDO",{semaforo_sla})>0')
    expect(f).toContain('{sla_semaforo_etapa}="ambar"')
  })
})
