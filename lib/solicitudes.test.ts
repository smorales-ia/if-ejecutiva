import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// A-03: `fetchSolicitudes` se prueba sin red. Se mockean el cliente de
// Airtable, el lector de feriados y el catálogo de etapas, conservando lo real
// de cada módulo (`importOriginal`) para que el resto de este archivo —que
// prueba funciones puras— no cambie de comportamiento. Las claves son las del
// alias `@/`; vitest las resuelve a la misma ruta que los imports relativos.
const listRecords = vi.fn()
const obtenerFeriados = vi.fn()
const obtenerMatrizEtapas = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

vi.mock('@/lib/feriados', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/feriados')>()
  return { ...real, obtenerFeriados: (...args: unknown[]) => obtenerFeriados(...args) }
})

vi.mock('@/lib/sla-etapas', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/sla-etapas')>()
  return {
    ...real,
    obtenerMatrizEtapas: (...args: unknown[]) => obtenerMatrizEtapas(...args),
  }
})

import { desdeSantiago, partesEnSantiago } from './sla-habil'
import {
  buildFormula,
  fetchSolicitudes,
  mapRecord,
  nombresDeEtapas,
  SLA_ETAPA_FILTROS_VALIDOS,
  SOLICITUD_FIELDS,
} from './solicitudes'
import { FIELD_IDS_SLA, type MatrizEtapas } from './sla-etapas'
import {
  SLA_ETAPA_FILTROS,
  SLA_ETAPA_FILTRO_LABELS,
  toneDeEtapa,
  type SlaTonoEtapa,
} from './console-data'

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

  /**
   * ⚠ **Los strings de este bloque están copiados del wire, no del contrato.**
   *
   * La versión anterior de estos tests usaba `'12-08-2026 13:00'` como caso
   * principal —el formato que el docblock documentaba— y daba verde mientras la
   * pantalla mostraba "Sin datos de etapa" en toda la cartera: Airtable emite
   * `"2026-08-11 14:00"` para estos campos, que ninguna rama reconocía. El
   * fixture inventado es lo que dejó pasar el bug (RO-13 del lado del parseo).
   *
   * Respuesta real de `GET tblaHTyMHYfmy7Fg6` con `cellFormat=string`,
   * `timeZone=America/Santiago`, `userLocale=es-CL`, el 11-ago-2026:
   *
   * ```json
   * { "codigo_ext": "VP-2026-0048", "sla_etapa_actual": "2",
   *   "sla_etapa_vence_ts": "2026-08-11 14:00",
   *   "sla_etapa_alerta_ts": "2026-08-11 12:00",
   *   "sla_e1_inicio_ts":    "2026-07-27 00:00",
   *   "sla_semaforo_etapa":  "verde" }
   * ```
   */
  it('parsea el formato REAL de cellFormat=string: "YYYY-MM-DD HH:MM"', () => {
    const s = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '2026-08-11 14:00' })
    // 14:00 de Santiago en invierno (UTC−4) = 18:00Z. Si esto diera 14:00Z,
    // el string se estaría leyendo en la zona del proceso.
    expect(s.slaEtapa?.venceTs).toBe('2026-08-11T18:00:00.000Z')
    // Lo que veía la Ejecutiva cuando esta rama no existía:
    expect(s.slaEtapa?.etiqueta).not.toBe('Sin datos de etapa')
  })

  it('parsea la variante am/pm del mismo formato ("2026-07-27 12:00am")', () => {
    // Es el que emite `fecha_solicitud`, verificado el mismo día. Medianoche de
    // Santiago, no mediodía: el "12:00am" hay que convertirlo, no truncarlo.
    const s = mapear({ sla_etapa_actual: '1', sla_etapa_vence_ts: '2026-07-27 12:00am' })
    expect(s.slaEtapa?.venceTs).toBe('2026-07-27T04:00:00.000Z')
  })

  it('el ISO con T sigue siendo absoluto y no se convierte dos veces', () => {
    // Mismo prefijo que el caso de arriba, semántica opuesta: con `T` y `Z` el
    // texto ya es un instante. Pasarlo por `desdeSantiago` lo correría 4 horas.
    const desdeIso = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '2026-08-12T17:00:00.000Z' })
    expect(desdeIso.slaEtapa?.venceTs).toBe('2026-08-12T17:00:00.000Z')
  })

  it('sigue aceptando el reloj es-CL D-M-YYYY de los campos con formato local', () => {
    // Caso secundario, no principal: los campos viejos de `TX_Solicitudes` sí
    // llegan así, y la rama tiene que seguir viva.
    const desdeCL = mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '12-08-2026 13:00' })
    const p = partesEnSantiago(new Date(desdeCL.slaEtapa!.venceTs!))
    expect([p.anio, p.mes, p.dia, p.hora, p.minuto]).toEqual([2026, 8, 12, 13, 0])
  })

  it('interpreta los dos relojes de pared en Santiago, no en el del proceso', () => {
    // El proceso corre en UTC en Railway. Un `new Date(…)` ingenuo daría las
    // 13:00 UTC, o sea las 09:00 de Santiago: cuatro horas de corrimiento en
    // todos los vencimientos, en las dos ramas.
    expect(
      mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '12-08-2026 13:00' }).slaEtapa?.venceTs
    ).toBe('2026-08-12T17:00:00.000Z') // invierno = UTC-4
    expect(
      mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '2026-08-12 13:00' }).slaEtapa?.venceTs
    ).toBe('2026-08-12T17:00:00.000Z')
  })

  it('no confunde el formato real con basura parcial', () => {
    // Sin minutos no es una hora, y media fecha no es una fecha. El null es la
    // degradación correcta; lo que no puede pasar es inventar un instante.
    expect(
      mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '2026-08-11 14' }).slaEtapa?.venceTs
    ).toBeNull()
    expect(
      mapear({ sla_etapa_actual: '2', sla_etapa_vence_ts: '2026-13-45 14:00' }).slaEtapa?.venceTs
    ).toBeNull()
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

  // D-3: la lista se trasladó a `console-data.ts` para que el selector cliente
  // no arrastre el cliente de Airtable al bundle. Este test es lo que impide
  // que las dos vuelvan a ser dos listas.
  it('reexporta exactamente la lista canónica de console-data', () => {
    expect(SLA_ETAPA_FILTROS_VALIDOS).toEqual(SLA_ETAPA_FILTROS)
  })

  it('tiene rótulo para cada valor del filtro, y ninguno de más', () => {
    expect(Object.keys(SLA_ETAPA_FILTRO_LABELS).sort()).toEqual([...SLA_ETAPA_FILTROS].sort())
    for (const valor of SLA_ETAPA_FILTROS) {
      expect(SLA_ETAPA_FILTRO_LABELS[valor]).toBeTruthy()
    }
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

/**
 * Tanda D · §9.6.2 — contrato visual de la píldora de etapa.
 *
 * `SLABadge` es un componente y el repo no tiene runner de DOM, así que lo que
 * se fija acá es la **decisión** que el componente delega en `lib/`: qué tono
 * pinta color y cuál no se renderiza. Es la regla que evita el verde fabricado,
 * y vive en una función pura justamente para poder fijarla sin montar React.
 */
describe('píldora de etapa · toneDeEtapa (D-1)', () => {
  it('traduce los tres tonos con color al vocabulario de SLA_CLASSES', () => {
    expect(toneDeEtapa('verde')).toBe('green')
    expect(toneDeEtapa('ambar')).toBe('amber')
    expect(toneDeEtapa('rojo')).toBe('red')
  })

  it('devuelve null sólo para sin_dato, que es lo que impide renderizar', () => {
    // Si esto empezara a devolver un tono, la bandeja pintaría una píldora por
    // cada solicitud sin umbrales materializados — y en v1.9 son casi todas,
    // porque sólo e1 y e2 tienen escritor.
    expect(toneDeEtapa('sin_dato')).toBeNull()

    const conColor = (['verde', 'ambar', 'rojo'] as SlaTonoEtapa[]).filter(
      (t) => toneDeEtapa(t) !== null
    )
    expect(conColor).toHaveLength(3)
  })

  it('los valores del filtro son un subconjunto de los tonos que sí pintan', () => {
    // `?sla_etapa=` no puede ofrecer un tono que la píldora no sabe pintar.
    for (const valor of SLA_ETAPA_FILTROS) {
      expect(toneDeEtapa(valor)).not.toBeNull()
    }
  })
})

/**
 * A-03 · filtro «sin fecha de visita · más de 24 h hábiles» (§5.2.8).
 *
 * El predicado se prueba en `sin-fecha-visita.test.ts`. Acá se fija el
 * **cableado**: qué instante usa `mapRecord` como ingreso, que el filtro no
 * toca la fórmula de Airtable, que conserva el orden y que sin el parámetro no
 * se leen feriados.
 */
describe('mapRecord · ingresoTs y fechaVisitaProgramada (A-03)', () => {
  it('la proyección sigue pidiendo los campos que el filtro necesita', () => {
    // Sin `fecha_visita_programada` en la proyección, toda fila vencida se
    // listaría como "sin fecha" en silencio; sin `fecha_solicitud` se pierde el
    // respaldo del ingreso para la cartera sin `sla_e1_inicio_ts`.
    expect(SOLICITUD_FIELDS).toContain('fecha_visita_programada')
    expect(SOLICITUD_FIELDS).toContain('fecha_solicitud')
  })

  it('usa sla_e1_inicio_ts como ingreso cuando existe', () => {
    const s = mapear({
      sla_e1_inicio_ts: '2026-08-04 10:00',
      fecha_solicitud: '2026-08-05 11:30',
    })
    // Reloj de pared de Santiago (GMT−4 en agosto), no del proceso.
    expect(s.ingresoTs).toBe('2026-08-04T14:00:00.000Z')
  })

  it('cae a fecha_solicitud (dateTime) si falta el hito de §5.2.2', () => {
    const s = mapear({ fecha_solicitud: '2026-08-05 11:30' })
    expect(s.ingresoTs).toBe('2026-08-05T15:30:00.000Z')
  })

  it('cae al createdTime del registro como último respaldo', () => {
    const s = mapear({})
    expect(s.ingresoTs).toBe('2026-08-10T12:00:00.000Z')
  })

  it('expone fecha_visita_programada cruda, sin el centinela de pantalla', () => {
    const con = mapear({ fecha_visita_programada: '2026-08-12' })
    expect(con.fechaVisitaProgramada).toBe('2026-08-12')

    const sin = mapear({})
    expect(sin.fechaVisitaProgramada).toBeUndefined()
    // `fechaVisita` sigue siendo el texto de pantalla; el filtro no lo usa.
    expect(sin.fechaVisita).toBe('Por agendar')

    expect(mapear({ fecha_visita_programada: '   ' }).fechaVisitaProgramada).toBeUndefined()
  })
})

describe('buildFormula · ?sin_fecha_visita no genera fórmula (A-03)', () => {
  it('la fórmula es idéntica con y sin el filtro', () => {
    expect(buildFormula('todas', undefined, { sin_fecha_visita: '1' })).toBe(
      buildFormula('todas', undefined, {})
    )
    expect(buildFormula('todas', undefined, { sin_fecha_visita: '1', sla: 'rojo' })).toBe(
      buildFormula('todas', undefined, { sla: 'rojo' })
    )
  })
})

describe('fetchSolicitudes · filtro sin fecha de visita (A-03)', () => {
  // Lunes 10-ago-2026 12:00 Santiago.
  const AHORA = desdeSantiago(2026, 8, 10, 12, 0)

  /** Registro crudo como lo devuelve `listRecords` con `cellFormat: 'string'`. */
  function registro(codigo: string, fields: Record<string, string | undefined>) {
    return {
      id: `rec${codigo}`,
      createdTime: '2026-07-01T12:00:00.000Z',
      fields: { codigo_ext: codigo, estado: 'creada', ...fields },
    }
  }

  // Orden de Airtable deliberadamente no cronológico, para ver que se conserva.
  const REGISTROS = [
    // Lunes 3-ago 09:00, asignada, sin visita → venció el martes 4-ago 15:00.
    registro('VP-4', { estado: 'asignada', sla_e1_inicio_ts: '2026-08-03 09:00' }),
    // Con fecha de visita → nunca.
    registro('VP-2', {
      sla_e1_inicio_ts: '2026-08-04 10:00',
      fecha_visita_programada: '2026-08-12',
    }),
    // Martes 4-ago 10:00 sin visita → venció el jueves 6-ago 16:00.
    registro('VP-1', { sla_e1_inicio_ts: '2026-08-04 10:00' }),
    // Viernes 7-ago 10:00 → vence el martes 11-ago 16:00: todavía no.
    registro('VP-3', { sla_e1_inicio_ts: '2026-08-07 10:00' }),
    // Terminal → nunca.
    registro('VP-5', { estado: 'cerrada', sla_e1_inicio_ts: '2026-07-01 10:00' }),
  ]

  function codigos(data: { codigoExt: string }[]) {
    return data.map((s) => s.codigoExt)
  }

  function formulaDeLlamada(i: number): string {
    return (listRecords.mock.calls[i][1] as { filterByFormula: string }).filterByFormula
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(AHORA)
    listRecords.mockResolvedValue(REGISTROS)
    obtenerFeriados.mockResolvedValue(new Set<string>())
    obtenerMatrizEtapas.mockResolvedValue(MATRIZ)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("con '1' devuelve sólo las vencidas, en el orden de Airtable", async () => {
    const { data } = await fetchSolicitudes('todas', undefined, { sin_fecha_visita: '1' })
    expect(codigos(data)).toEqual(['VP-4', 'VP-1'])
    expect(obtenerFeriados).toHaveBeenCalledTimes(1)
  })

  it('los feriados que devuelve C_Feriados entran al cómputo', async () => {
    // Con miércoles 5 y jueves 6 de agosto como no hábiles, VP-1 (martes 10:00)
    // pasa a vencer el lunes 10-ago 16:00 y a las 12:00 todavía no se lista.
    // VP-4 (lunes 3-ago 09:00) venció el martes 4-ago 15:00, antes de los
    // feriados, y se mantiene.
    obtenerFeriados.mockResolvedValue(new Set(['2026-08-05', '2026-08-06']))
    const { data } = await fetchSolicitudes('todas', undefined, { sin_fecha_visita: '1' })
    expect(codigos(data)).toEqual(['VP-4'])
  })

  it("sin el parámetro, o con otro valor, devuelve todas y no lee feriados", async () => {
    for (const filtros of [undefined, {}, { sin_fecha_visita: '0' }, { sin_fecha_visita: 'true' }]) {
      const { data } = await fetchSolicitudes('todas', undefined, filtros)
      expect(codigos(data)).toEqual(['VP-4', 'VP-2', 'VP-1', 'VP-3', 'VP-5'])
    }
    expect(obtenerFeriados).not.toHaveBeenCalled()
  })

  it('el filterByFormula enviado a Airtable es idéntico con y sin el filtro', async () => {
    await fetchSolicitudes('todas', undefined, { estado: 'creada' })
    await fetchSolicitudes('todas', undefined, { estado: 'creada', sin_fecha_visita: '1' })
    expect(formulaDeLlamada(1)).toBe(formulaDeLlamada(0))
  })

  it('si C_Feriados falla no lanza: cuenta sin feriados', async () => {
    obtenerFeriados.mockRejectedValue(new Error('Airtable caído'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { data } = await fetchSolicitudes('todas', undefined, { sin_fecha_visita: '1' })
    expect(codigos(data)).toEqual(['VP-4', 'VP-1'])
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})
