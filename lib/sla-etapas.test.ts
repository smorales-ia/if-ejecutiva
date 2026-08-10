import { describe, expect, it, vi } from 'vitest'

import { desdeSantiago, minutosHabilesEntre, partesEnSantiago } from './sla-habil'
import {
  campoFin,
  campoInicio,
  etapaVigente,
  EtapaInvalida,
  FIELD_IDS_SLA,
  marcarFinEtapa,
  marcarInicioEtapa,
  pausar,
  reanudar,
  recalcularSla,
  resolverSlaDelPar,
  SlaConfigFaltante,
  SolicitudNoEncontrada,
  umbralesDeEtapa,
  type MatrizEtapas,
  type NumeroEtapa,
  type SlaDeps,
} from './sla-etapas'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * Copia literal de las 7 filas de `C_SLA_Etapas` (§5.2.4), leídas vía MCP el
 * 10-ago-2026. Viven en el test, no en el motor: el criterio de aceptación de
 * la Tanda B exige que `lib/sla-*.ts` no contenga ninguno de estos números.
 */
const MATRIZ: MatrizEtapas = {
  e1: { etapaKey: 'e1', orden: 1, nombre: 'Ingreso de solicitud', responsable: 'control_seguimiento', idealHoras: 2, maxHoras: 3 },
  e2: { etapaKey: 'e2', orden: 2, nombre: 'Coordinación de visita (llamado)', responsable: 'tasador', idealHoras: 4, maxHoras: 6 },
  e3: { etapaKey: 'e3', orden: 3, nombre: 'Informe post-llamado', responsable: 'tasador', idealHoras: 0.5, maxHoras: 0.5 },
  e4: { etapaKey: 'e4', orden: 4, nombre: 'Aviso de coordinación al cliente', responsable: 'control_seguimiento', idealHoras: 2, maxHoras: 3 },
  e5: { etapaKey: 'e5', orden: 5, nombre: 'Visita y envío de informe', responsable: 'tasador', idealHoras: 24, maxHoras: 48 },
  e6: { etapaKey: 'e6', orden: 6, nombre: 'Disponible para visado', responsable: 'control_seguimiento', idealHoras: 2, maxHoras: 3 },
  e7: { etapaKey: 'e7', orden: 7, nombre: 'Visación y envío final', responsable: 'visado', idealHoras: 0.5, maxHoras: 0.5 },
}

const FERIADOS = new Set(['2026-04-03', '2026-04-04', '2026-09-18', '2026-09-19'])

const SOLICITUD_ID = 'recTESTsolicitud01'

function etiqueta(iso: string | null): string {
  if (!iso) return 'null'
  const p = partesEnSantiago(new Date(iso))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${p.anio}-${pad(p.mes)}-${pad(p.dia)} ${pad(p.hora)}:${pad(p.minuto)}`
}

interface Fake {
  deps: Partial<SlaDeps>
  escrituras: Array<Record<string, unknown>>
  solicitud: Record<string, unknown>
}

/**
 * Cliente Airtable falso. `escrituras` acumula cada payload que el motor habría
 * enviado, y la solicitud se actualiza en memoria para que las llamadas
 * encadenadas vean el estado real.
 */
function fake(
  solicitud: Record<string, unknown>,
  opciones: { ahora?: Date; matriz?: MatrizEtapas; revisionHoras?: number | null } = {}
): Fake {
  const estado = { ...solicitud }
  const escrituras: Array<Record<string, unknown>> = []
  return {
    escrituras,
    solicitud: estado,
    deps: {
      leerSolicitud: async (id) => (id === SOLICITUD_ID ? { ...estado } : null),
      escribirSolicitud: async (_id, campos) => {
        escrituras.push(campos)
        Object.assign(estado, campos)
      },
      leerMatriz: async () => opciones.matriz ?? MATRIZ,
      leerSlaDelPar: async () => ({
        clave: 'SLA_DEFAULT_GLOBAL',
        revisionHoras: opciones.revisionHoras ?? null,
      }),
      leerFeriados: async () => FERIADOS,
      ahora: () => opciones.ahora ?? desdeSantiago(2026, 8, 4, 11, 0),
    },
  }
}

/** Solicitud con e1 y e2 cerradas y la etapa `abierta` en curso. */
function solicitudConEtapaAbierta(abierta: NumeroEtapa, inicio: Date): Record<string, unknown> {
  const campos: Record<string, unknown> = {
    cliente: ['recClienteX'],
    tipo_informe: ['recTipoInformeX'],
    tipo_propiedad: ['recTipoPropX'],
  }
  const inicioIso = inicio.toISOString()
  for (let e = 1 as NumeroEtapa; e < abierta; e = (e + 1) as NumeroEtapa) {
    campos[campoInicio(e)] = inicioIso
    campos[campoFin(e)] = inicioIso
  }
  campos[campoInicio(abierta)] = inicioIso
  return campos
}

// ---------------------------------------------------------------------------
// Contrato de campos
// ---------------------------------------------------------------------------

describe('contrato de campos SLA', () => {
  it('declara los 14 timestamps de etapa más los 7 derivados', () => {
    const claves = Object.keys(FIELD_IDS_SLA)
    expect(claves).toHaveLength(21)
    for (const id of Object.values(FIELD_IDS_SLA)) {
      expect(id).toMatch(/^fld[a-zA-Z0-9]{14}$/)
    }
  })

  it('los fldIDs son únicos', () => {
    const ids = Object.values(FIELD_IDS_SLA)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('nombra los campos de cada etapa según el esquema real', () => {
    expect(campoInicio(5)).toBe('sla_e5_inicio_ts')
    expect(campoFin(7)).toBe('sla_e7_fin_ts')
    expect(FIELD_IDS_SLA[campoInicio(5)]).toBe('fldmSHiYM8kC6c1cp')
  })
})

// ---------------------------------------------------------------------------
// etapaVigente
// ---------------------------------------------------------------------------

describe('etapaVigente', () => {
  const t = desdeSantiago(2026, 8, 4, 10, 0).toISOString()

  it('es la de mayor orden con inicio y sin fin', () => {
    expect(
      etapaVigente({
        sla_e1_inicio_ts: t,
        sla_e1_fin_ts: t,
        sla_e2_inicio_ts: t,
      })
    ).toBe(2)
  })

  it('devuelve null cuando no hay ninguna abierta — sin datos, no verde', () => {
    expect(etapaVigente({})).toBeNull()
    expect(etapaVigente({ sla_e1_inicio_ts: t, sla_e1_fin_ts: t })).toBeNull()
  })

  it('ignora un timestamp que no parsea', () => {
    expect(etapaVigente({ sla_e1_inicio_ts: 'no es fecha' })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Precedencia de umbrales · §9.6-R3
// ---------------------------------------------------------------------------

describe('umbralesDeEtapa · precedencia §9.6-R3', () => {
  it('sin override, la etapa 7 usa la media hora de C_SLA_Etapas', () => {
    const u = umbralesDeEtapa(7, MATRIZ, { clave: null, revisionHoras: null })
    expect([u.idealHoras, u.maxHoras]).toEqual([0.5, 0.5])
  })

  it('sla_revision_horas del par sustituye AMBOS umbrales de la etapa 7', () => {
    const u = umbralesDeEtapa(7, MATRIZ, { clave: 'SLA_X', revisionHoras: 1 })
    expect([u.idealHoras, u.maxHoras]).toEqual([1, 1])
  })

  it('el override no toca ninguna etapa distinta de la 7', () => {
    for (const etapa of [1, 2, 3, 4, 5, 6] as NumeroEtapa[]) {
      const u = umbralesDeEtapa(etapa, MATRIZ, { clave: 'SLA_X', revisionHoras: 1 })
      expect([u.idealHoras, u.maxHoras]).toEqual([
        MATRIZ[`e${etapa}`].idealHoras,
        MATRIZ[`e${etapa}`].maxHoras,
      ])
    }
  })

  it('falla tipificado si la matriz no cubre la etapa', () => {
    expect(() => umbralesDeEtapa(5, { e1: MATRIZ.e1 }, { clave: null, revisionHoras: null }))
      .toThrow(SlaConfigFaltante)
  })
})

describe('resolverSlaDelPar · §9.6-R4', () => {
  const comodin = {
    clave: 'SLA_DEFAULT_GLOBAL',
    clienteIds: [],
    tipoInformeIds: [],
    tipoPropiedadIds: [],
    revisionHoras: null,
  }
  const especifica = {
    clave: 'SLA_METLIFE_Refinanciamiento',
    clienteIds: ['recMetLife'],
    tipoInformeIds: ['recRefi'],
    tipoPropiedadIds: ['recCasa'],
    revisionHoras: 1,
  }

  it('el comodín se expresa con los tres links vacíos, no con un literal', () => {
    const r = resolverSlaDelPar({ cliente: ['recOtro'] }, [comodin, especifica])
    expect(r.clave).toBe('SLA_DEFAULT_GLOBAL')
  })

  it('gana la fila más específica que empareja', () => {
    const r = resolverSlaDelPar(
      { cliente: ['recMetLife'], tipo_informe: ['recRefi'], tipo_propiedad: ['recCasa'] },
      [comodin, especifica]
    )
    expect(r.clave).toBe('SLA_METLIFE_Refinanciamiento')
    expect(r.revisionHoras).toBe(1)
  })

  it('un campo vacío en la específica se resuelve contra la comodín', () => {
    const sinRevision = { ...especifica, revisionHoras: null }
    const comodinConRevision = { ...comodin, revisionHoras: 2 }
    const r = resolverSlaDelPar(
      { cliente: ['recMetLife'], tipo_informe: ['recRefi'], tipo_propiedad: ['recCasa'] },
      [comodinConRevision, sinRevision]
    )
    expect(r.clave).toBe('SLA_METLIFE_Refinanciamiento')
    expect(r.revisionHoras).toBe(2)
  })

  it('sin filas devuelve todo nulo, sin inventar umbrales', () => {
    expect(resolverSlaDelPar({}, [])).toEqual({ clave: null, revisionHoras: null })
  })
})

// ---------------------------------------------------------------------------
// recalcularSla
// ---------------------------------------------------------------------------

describe('recalcularSla', () => {
  it('etapa 5 desde martes 10:00: alerta jueves 16:00, vence martes 16:00 de la semana siguiente', async () => {
    // 24 h hábiles desde el martes 4-ago 10:00, con jornadas de nueve horas:
    // 8 h el martes + 9 h el miércoles + 7 h el jueves → jueves 16:00.
    // 48 h: martes 8 + mié 9 + jue 9 + vie 9 + lun 9 = 44, y 4 h el martes 11.
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake(solicitudConEtapaAbierta(5, inicio))

    const r = await recalcularSla(SOLICITUD_ID, { deps: f.deps })

    expect(r.etapaActual).toBe(5)
    expect(etiqueta(r.alertaTs)).toBe('2026-08-06 16:00')
    expect(etiqueta(r.venceTs)).toBe('2026-08-11 13:00')
    expect(f.escrituras).toHaveLength(1)
    expect(f.escrituras[0].sla_etapa_actual).toBe(5)
  })

  it('etapa 3 de media hora: martes 17:45 → miércoles 09:15 en ambos umbrales', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 17, 45)
    const f = fake(solicitudConEtapaAbierta(3, inicio), {
      ahora: desdeSantiago(2026, 8, 5, 9, 0),
    })

    const r = await recalcularSla(SOLICITUD_ID, { deps: f.deps })

    expect(etiqueta(r.alertaTs)).toBe('2026-08-05 09:15')
    expect(etiqueta(r.venceTs)).toBe('2026-08-05 09:15')
  })

  it('cuenta el feriado del 18-sep: etapa 2 desde jueves 14:00', async () => {
    // 4 h ideal / 6 h máximo. Jueves 17-sep 14:00 → 4 h el jueves llegan a las
    // 18:00; el viernes 18 es feriado, así que las 6 h caen el lunes 21.
    const inicio = desdeSantiago(2026, 9, 17, 14, 0)
    const f = fake(solicitudConEtapaAbierta(2, inicio), {
      ahora: desdeSantiago(2026, 9, 17, 15, 0),
    })

    const r = await recalcularSla(SOLICITUD_ID, { deps: f.deps })

    expect(etiqueta(r.alertaTs)).toBe('2026-09-17 18:00')
    expect(etiqueta(r.venceTs)).toBe('2026-09-21 11:00')
  })

  it('etapa 7 con override del par usa 1 h en vez de la media hora del default', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const conOverride = fake(solicitudConEtapaAbierta(7, inicio), { revisionHoras: 1 })
    const sinOverride = fake(solicitudConEtapaAbierta(7, inicio))

    const r1 = await recalcularSla(SOLICITUD_ID, { deps: conOverride.deps })
    const r2 = await recalcularSla(SOLICITUD_ID, { deps: sinOverride.deps })

    expect(etiqueta(r1.alertaTs)).toBe('2026-08-04 11:00')
    expect(etiqueta(r1.venceTs)).toBe('2026-08-04 11:00')
    expect(etiqueta(r2.alertaTs)).toBe('2026-08-04 10:30')
    expect(etiqueta(r2.venceTs)).toBe('2026-08-04 10:30')
  })

  it('el override explícito por opciones también manda sobre la etapa 7', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake(solicitudConEtapaAbierta(7, inicio))
    const r = await recalcularSla(SOLICITUD_ID, {
      deps: f.deps,
      slaRevisionHorasOverride: 2,
    })
    expect(etiqueta(r.alertaTs)).toBe('2026-08-04 12:00')
  })

  it('sin etapa vigente limpia los umbrales para que la fórmula diga sin_dato', async () => {
    const f = fake({ cliente: ['recClienteX'] })
    const r = await recalcularSla(SOLICITUD_ID, { deps: f.deps })

    expect(r.etapaActual).toBeNull()
    expect(r.alertaTs).toBeNull()
    expect(f.escrituras[0]).toMatchObject({
      sla_etapa_actual: null,
      sla_etapa_alerta_ts: null,
      sla_etapa_vence_ts: null,
    })
  })

  it('nunca escribe sla_semaforo_etapa: es fórmula', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake(solicitudConEtapaAbierta(5, inicio))
    await recalcularSla(SOLICITUD_ID, { deps: f.deps })
    for (const escritura of f.escrituras) {
      expect(escritura).not.toHaveProperty('sla_semaforo_etapa')
    }
  })

  it('persistir:false devuelve el payload sin tocar Airtable (§9.6 · C-5)', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake(solicitudConEtapaAbierta(5, inicio))

    const r = await recalcularSla(SOLICITUD_ID, { deps: f.deps, persistir: false })

    expect(r.persistido).toBe(false)
    expect(f.escrituras).toHaveLength(0)
    expect(r.campos.sla_etapa_vence_ts).toBe(r.venceTs)
  })

  it('reporta los minutos hábiles ya consumidos', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake(solicitudConEtapaAbierta(5, inicio), {
      ahora: desdeSantiago(2026, 8, 4, 15, 30),
    })
    const r = await recalcularSla(SOLICITUD_ID, { deps: f.deps })
    expect(r.minutosConsumidos).toBe(330)
  })

  it('lanza SolicitudNoEncontrada con record id inexistente', async () => {
    const f = fake({})
    await expect(recalcularSla('recNOEXISTE000001', { deps: f.deps })).rejects.toThrow(
      SolicitudNoEncontrada
    )
  })

  it('lanza SlaConfigFaltante si la matriz no cubre la etapa vigente', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake(solicitudConEtapaAbierta(5, inicio), { matriz: { e1: MATRIZ.e1 } })
    await expect(recalcularSla(SOLICITUD_ID, { deps: f.deps })).rejects.toThrow(SlaConfigFaltante)
  })
})

// ---------------------------------------------------------------------------
// Marcas de etapa
// ---------------------------------------------------------------------------

describe('marcarInicioEtapa', () => {
  it('escribe el inicio normalizado a la ventana hábil', async () => {
    const f = fake({ cliente: ['recClienteX'] })
    // Viernes 22:00 → lunes 09:00 (§5.2.2).
    await marcarInicioEtapa(SOLICITUD_ID, 1, desdeSantiago(2026, 8, 7, 22, 0), {
      deps: f.deps,
    })
    expect(etiqueta(f.solicitud.sla_e1_inicio_ts as string)).toBe('2026-08-10 09:00')
  })

  it('recalcula los umbrales de la etapa que abre', async () => {
    const f = fake({ cliente: ['recClienteX'] })
    const r = await marcarInicioEtapa(SOLICITUD_ID, 1, desdeSantiago(2026, 8, 4, 10, 0), {
      deps: f.deps,
    })
    // e1: 2 h ideal, 3 h máximo.
    expect(etiqueta(r?.alertaTs ?? null)).toBe('2026-08-04 12:00')
    expect(etiqueta(r?.venceTs ?? null)).toBe('2026-08-04 13:00')
    expect(r?.etapaActual).toBe(1)
  })

  it('es idempotente: un reintento no corre el reloj', async () => {
    const original = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake({ sla_e1_inicio_ts: original.toISOString() })

    const r = await marcarInicioEtapa(SOLICITUD_ID, 1, desdeSantiago(2026, 8, 4, 16, 0), {
      deps: f.deps,
    })

    expect(r).toBeNull()
    expect(f.escrituras).toHaveLength(0)
    expect(f.solicitud.sla_e1_inicio_ts).toBe(original.toISOString())
  })

  it('con forzar:true sí sobrescribe', async () => {
    const f = fake({ sla_e1_inicio_ts: desdeSantiago(2026, 8, 4, 10, 0).toISOString() })
    await marcarInicioEtapa(SOLICITUD_ID, 1, desdeSantiago(2026, 8, 4, 16, 0), {
      deps: f.deps,
      forzar: true,
    })
    expect(etiqueta(f.solicitud.sla_e1_inicio_ts as string)).toBe('2026-08-04 16:00')
  })

  it('usa ahora() si no se pasa instante', async () => {
    const f = fake({}, { ahora: desdeSantiago(2026, 8, 4, 14, 30) })
    await marcarInicioEtapa(SOLICITUD_ID, 1, undefined, { deps: f.deps })
    expect(etiqueta(f.solicitud.sla_e1_inicio_ts as string)).toBe('2026-08-04 14:30')
  })

  it('rechaza etapas fuera de 1-7 con EtapaInvalida', async () => {
    const f = fake({})
    await expect(
      marcarInicioEtapa(SOLICITUD_ID, 0 as NumeroEtapa, undefined, { deps: f.deps })
    ).rejects.toThrow(EtapaInvalida)
    await expect(
      marcarInicioEtapa(SOLICITUD_ID, 8 as NumeroEtapa, undefined, { deps: f.deps })
    ).rejects.toThrow(EtapaInvalida)
  })
})

describe('marcarFinEtapa · transiciones De → A de §5.2.4', () => {
  it('cerrar la etapa 3 abre la etapa 4 en el mismo instante', async () => {
    const inicio = desdeSantiago(2026, 8, 5, 9, 0)
    const f = fake(solicitudConEtapaAbierta(3, inicio))
    const cierre = desdeSantiago(2026, 8, 5, 11, 0)

    const r = await marcarFinEtapa(SOLICITUD_ID, 3, cierre, { deps: f.deps })

    expect(etiqueta(f.solicitud.sla_e3_fin_ts as string)).toBe('2026-08-05 11:00')
    expect(etiqueta(f.solicitud.sla_e4_inicio_ts as string)).toBe('2026-08-05 11:00')
    // Y el recálculo ya apunta a la etapa 4 (2 h ideal / 3 h máximo).
    expect(r?.etapaActual).toBe(4)
    expect(etiqueta(r?.alertaTs ?? null)).toBe('2026-08-05 13:00')
    expect(etiqueta(r?.venceTs ?? null)).toBe('2026-08-05 14:00')
  })

  it('el fin y el inicio siguiente se guardan por separado aunque coincidan', async () => {
    const inicio = desdeSantiago(2026, 8, 5, 9, 0)
    const f = fake(solicitudConEtapaAbierta(1, inicio))
    const cierre = desdeSantiago(2026, 8, 5, 10, 0)

    const r = await marcarFinEtapa(SOLICITUD_ID, 1, cierre, { deps: f.deps })

    expect(r?.campos.sla_e1_fin_ts).toBe(cierre.toISOString())
    expect(r?.campos.sla_e2_inicio_ts).toBe(cierre.toISOString())
  })

  it('cerrar la etapa 7 no abre ninguna y deja los umbrales en null', async () => {
    const inicio = desdeSantiago(2026, 8, 5, 9, 0)
    const f = fake(solicitudConEtapaAbierta(7, inicio))

    const r = await marcarFinEtapa(SOLICITUD_ID, 7, desdeSantiago(2026, 8, 5, 9, 20), {
      deps: f.deps,
    })

    expect(r?.etapaActual).toBeNull()
    expect(r?.alertaTs).toBeNull()
    expect(f.solicitud.sla_e7_fin_ts).toBeTruthy()
  })

  it('es idempotente sobre un fin ya escrito', async () => {
    const inicio = desdeSantiago(2026, 8, 5, 9, 0)
    const solicitud = solicitudConEtapaAbierta(3, inicio)
    solicitud.sla_e3_fin_ts = inicio.toISOString()
    const f = fake(solicitud)

    const r = await marcarFinEtapa(SOLICITUD_ID, 3, desdeSantiago(2026, 8, 5, 15, 0), {
      deps: f.deps,
    })

    expect(r).toBeNull()
    expect(f.escrituras).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Pausa y reanudación · RN-54
// ---------------------------------------------------------------------------

describe('pausar / reanudar · RN-54', () => {
  it('pausar escribe el inicio de la pausa', async () => {
    const inicio = desdeSantiago(2026, 8, 4, 10, 0)
    const f = fake(solicitudConEtapaAbierta(5, inicio), {
      ahora: desdeSantiago(2026, 8, 5, 10, 0),
    })

    const r = await pausar(SOLICITUD_ID, 'contacto_no_logrado', { deps: f.deps })

    expect(r.pausada).toBe(true)
    expect(r.motivo).toBe('contacto_no_logrado')
    expect(etiqueta(f.solicitud.sla_pausa_inicio_ts as string)).toBe('2026-08-05 10:00')
  })

  it('pausar dos veces es no-op: no regala el tiempo ya pausado', async () => {
    const yaPausada = desdeSantiago(2026, 8, 5, 10, 0)
    const f = fake({ sla_pausa_inicio_ts: yaPausada.toISOString() })

    const r = await pausar(SOLICITUD_ID, 'otro', { deps: f.deps })

    expect(r.pausada).toBe(false)
    expect(f.escrituras).toHaveLength(0)
    expect(f.solicitud.sla_pausa_inicio_ts).toBe(yaPausada.toISOString())
  })

  it('una pausa de 3 h hábiles corre alerta y vencimiento exactamente 3 h hábiles', async () => {
    const inicioEtapa = desdeSantiago(2026, 8, 4, 10, 0)
    const base = fake(solicitudConEtapaAbierta(5, inicioEtapa))
    const sinPausa = await recalcularSla(SOLICITUD_ID, { deps: base.deps })

    const solicitudPausada = solicitudConEtapaAbierta(5, inicioEtapa)
    solicitudPausada.sla_pausa_inicio_ts = desdeSantiago(2026, 8, 5, 10, 0).toISOString()
    const f = fake(solicitudPausada, { ahora: desdeSantiago(2026, 8, 5, 13, 0) })

    const r = await reanudar(SOLICITUD_ID, { deps: f.deps })

    expect(r.reanudada).toBe(true)
    expect(r.minutosPausa).toBe(180)
    expect(r.pausaAcumuladaMin).toBe(180)
    expect(f.solicitud.sla_pausa_inicio_ts).toBeNull()

    // El corrimiento se mide en minutos hábiles, que es la única unidad honesta:
    // entre jueves 16:00 y viernes 10:00 hay 3 h hábiles, no 18 h corridas.
    const desplazamientoAlerta = minutosHabilesEntre(
      new Date(sinPausa.alertaTs as string),
      new Date(r.recalculo?.alertaTs as string),
      FERIADOS
    )
    const desplazamientoVence = minutosHabilesEntre(
      new Date(sinPausa.venceTs as string),
      new Date(r.recalculo?.venceTs as string),
      FERIADOS
    )
    expect(desplazamientoAlerta).toBe(180)
    expect(desplazamientoVence).toBe(180)

    expect(etiqueta(r.recalculo?.alertaTs ?? null)).toBe('2026-08-07 10:00')
    expect(etiqueta(r.recalculo?.venceTs ?? null)).toBe('2026-08-11 16:00')
  })

  it('acumula sobre una pausa previa en vez de reemplazarla', async () => {
    const solicitud = solicitudConEtapaAbierta(5, desdeSantiago(2026, 8, 4, 10, 0))
    solicitud.sla_pausa_habil_min = 60
    solicitud.sla_pausa_inicio_ts = desdeSantiago(2026, 8, 5, 10, 0).toISOString()
    const f = fake(solicitud, { ahora: desdeSantiago(2026, 8, 5, 12, 0) })

    const r = await reanudar(SOLICITUD_ID, { deps: f.deps })

    expect(r.minutosPausa).toBe(120)
    expect(r.pausaAcumuladaMin).toBe(180)
  })

  it('la noche dentro de una pausa no se descuenta dos veces', async () => {
    // Pausa del miércoles 17:00 al jueves 10:00: 1 h + 1 h = 2 h hábiles, no 17.
    const solicitud = solicitudConEtapaAbierta(5, desdeSantiago(2026, 8, 4, 10, 0))
    solicitud.sla_pausa_inicio_ts = desdeSantiago(2026, 8, 5, 17, 0).toISOString()
    const f = fake(solicitud, { ahora: desdeSantiago(2026, 8, 6, 10, 0) })

    const r = await reanudar(SOLICITUD_ID, { deps: f.deps })

    expect(r.minutosPausa).toBe(120)
  })

  it('reanudar sin pausa activa es no-op', async () => {
    const f = fake(solicitudConEtapaAbierta(5, desdeSantiago(2026, 8, 4, 10, 0)))
    const r = await reanudar(SOLICITUD_ID, { deps: f.deps })

    expect(r.reanudada).toBe(false)
    expect(r.minutosPausa).toBe(0)
    expect(r.recalculo).toBeNull()
    expect(f.escrituras).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Aislamiento
// ---------------------------------------------------------------------------

describe('aislamiento del motor', () => {
  it('no hace ninguna llamada de red: todo el I/O pasa por los puertos', async () => {
    const espia = vi.spyOn(globalThis, 'fetch')
    const f = fake(solicitudConEtapaAbierta(5, desdeSantiago(2026, 8, 4, 10, 0)))
    await recalcularSla(SOLICITUD_ID, { deps: f.deps })
    expect(espia).not.toHaveBeenCalled()
    espia.mockRestore()
  })
})
