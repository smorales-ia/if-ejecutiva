import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Harness de paridad Etapa A — T-INFORME-ENSAMBLADOR-20260925 (ROADMAP §3
 * bloque 4).
 *
 * Cinco candados:
 *
 * (a) **Integridad de la matriz**: los E-ids de `MATRIZ_TAGS` suman
 *     exactamente 228, sin duplicados, cubriendo E-01..E-228.
 * (b) **Golden VP-2026-0066**: cada valor de `GOLDEN_MET6283` coincide con el
 *     contexto ensamblado (tolerancia 0,01 en numéricos).
 * (c) **Score de paridad fijado**: el baseline medido contra 0066 queda
 *     asertado con su número exacto; toda tanda futura debe subirlo, nunca
 *     bajarlo. Se asierta también el desglose de faltantes por P-id.
 * (d) **Huecos trazados**: `huecos[]` declara P0-2 / P1-1 / P1-2 / P1-3 /
 *     P1-4 (los pendientes estructurales del roadmap).
 * (e) **Matriz y tipos no divergen**: toda ruta no vacía de la matriz
 *     resuelve a algo distinto de `undefined` sobre el contexto (null es
 *     válido: hueco declarado; undefined es ruta rota).
 *
 * ## El fixture es la base REAL, no un invento
 *
 * Los registros de VP-2026-0066 se leyeron vía MCP el 25-sep-2026 y se
 * transcriben aquí con la forma que la REST API entrega en runtime (Links
 * como arrays de record IDs, singleSelects como strings). Los campos vacíos
 * en la base vienen vacíos en el fixture: 0066 es el sandbox de valores
 * tipeados-oráculo, así que TX_Comparables, TX_Adjuntos, TX_Unidades,
 * TX_Ampliaciones, TX_HabitacionesPorNivel, TX_TerminacionesPorRecinto,
 * TX_DocumentosLegales y TX_DocumentosGenerados **no tienen filas** — y el
 * score de datos lo refleja.
 *
 * Se mockean sólo `listRecords`/`getRecord` (candado de `lectura-informe
 * .test.ts`) y el guard para `lecturaInformeContexto`. Cero red, cero base
 * productiva.
 */

const listRecords = vi.fn()
const getRecord = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
    listRecords: (...args: unknown[]) => listRecords(...args),
    getRecord: (...args: unknown[]) => getRecord(...args),
  }
})

const autorizarSolicitud = vi.fn()

vi.mock('@/lib/tasador/auth-guard', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/tasador/auth-guard')>()
  return {
    ...real,
    autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
  }
})

import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { construirInformeContexto, lecturaInformeContexto } from './ensamblador'
import { GOLDEN_MET6283 } from './golden-met6283'
import { MATRIZ_TAGS } from './matriz-tags'
import { leerRuta, medirParidad } from './medidor'
import type { InformeContexto } from './tipos'

const ID = 'recNiwM4s1ibr3sbO'

function fila(id: string, fields: Record<string, unknown>) {
  return { id, createdTime: '', fields }
}

/* -------------------------------------------------------------------------
 * Fixture VP-2026-0066 — transcripción MCP 25-sep-2026 (forma REST)
 * ---------------------------------------------------------------------- */

/** `TX_Solicitudes` recNiwM4s1ibr3sbO. Campos vacíos en la base: omitidos. */
const SOLICITUD_0066: Record<string, unknown> = {
  codigo_solicitud: 'VP-2026-0066',
  codigo_ext: 'VP-2026-0066',
  estado: 'asignada',
  cliente: ['recIg8NtVhptXkEUJ'],
  tipo_propiedad: ['recrXDAjlVCe59XBW'],
  tipo_informe: ['recreojxTjoAWOEHa'],
  comuna: ['recKT9mUJkeq3YuBu'],
  tasador: ['recTJcV3BIvdcG4em'],
  // ⚠ `visador` está VACÍO en la base — el nombre degrada a null.
  direccion: 'LOS EUCALIPTUS 2100',
  region: 'Metropolitana de Santiago',
  cliente_final_nombre: 'FRANCISCO JOSE VERGARA UNDURRAGA',
  cliente_final_rut: '16.610.203-0',
  rol_sii: '00882-00040',
  fecha_visita: '2026-04-13',
  fecha_visita_programada: '2026-04-13',
  fecha_solicitud: '2026-09-17T12:00:00.000Z',
  numero_solicitud: 'METLIFE-6283-TEST',
  tipo_propiedad_nuevo_usado: 'usada',
  override_motivo:
    'Prueba prod MET-6283: overrides desde xlsm original (Portada BI62/BG72/BO62).',
  override_autor: 'Sergio Morales · audit xlsm',
  semaforo_sla: 'VENCIDO',
  solicitud_id: 66,
}

/** `TX_DatosTasacion` recfgslxbCJN5oAoD (origen_dato=tipeado). */
const DATOS_0066 = fila('recfgslxbCJN5oAoD', {
  solicitud: [ID],
  sup_terreno_m2: 5024.86,
  sup_construccion_m2: 249.91,
  anio_construccion: 2020,
  material_predominante: 'ALBAÑILERÍA LADRILLO',
  estado_conservacion: 'Bueno',
  tasa_cap_rate: 0.045,
  velocidad_venta_estimada: '8 a 10 meses',
  origen_dato: 'tipeado',
  avaluo_fiscal_clp: 339809429,
  // ⚠ fórmula rota en la base: imprime el CLP, no UF. Se transcribe tal cual.
  avaluo_fiscal_uf: 339809429,
  arriendo_bruto_mensual_clp: 3300000,
  gasto_anual_clp: 3300000,
  uf_dia_visita: 39894.61,
  propietario_nombre: 'FRANCISCO JOSE VERGARA UNDURRAGA',
  propietario_rut: '16.610.203-0',
  sup_construida_total: 0,
  // Fórmula legacy en 0: alimenta arriendo_mensual/gasto_anual, vacíos (CI-023 §4).
  ingreso_liquido_anual: 0,
  dfl2: 'NO',
})

/**
 * `TX_ItemsCuadroValoracion` — 6 filas del motor. ⚠ Pueblan la pareja NUEVA
 * (`nombre_item` · `uf_m2_unitario` · fórmula `valor_uf`); `descripcion`,
 * `uf_m2_aplicado` y `uf_total_item` vienen vacíos — el candado del fallback
 * del ensamblador. Σ valor_uf = 20.125,8624.
 */
const ITEMS_0066 = [
  fila('reciUBbOFzcqe7RCP', {
    solicitud: [ID],
    nombre_item: 'Terreno',
    tipo_item: 'Terreno',
    sup_m2: 1402.35,
    uf_m2_unitario: 8,
    factor_aplicado: 1,
    valor_uf: 11218.8,
    item_id: 7,
    situacion_municipal: 'Regularizado',
    valoracion_por: 'm2',
  }),
  fila('recvxRGbICF8lbE7E', {
    solicitud: [ID],
    nombre_item: 'Servidumbre',
    tipo_item: 'Terreno',
    sup_m2: 3622.51,
    uf_m2_unitario: 0,
    factor_aplicado: 1,
    valor_uf: 0,
    item_id: 8,
    situacion_municipal: 'Regularizado',
    valoracion_por: 'm2',
  }),
  fila('rec1Qtn0qyVbQYhxI', {
    solicitud: [ID],
    nombre_item: 'Piso 1',
    tipo_item: 'Edificacion',
    sup_m2: 249.91,
    uf_m2_unitario: 34,
    factor_aplicado: 0.96,
    valor_uf: 8157.0624,
    item_id: 9,
    situacion_municipal: 'Regularizado',
    valoracion_por: 'm2',
  }),
  fila('recupc729ooXrweGl', {
    solicitud: [ID],
    nombre_item: 'Piscina',
    tipo_item: 'Piscina',
    sup_m2: 1,
    uf_m2_unitario: 350,
    factor_aplicado: 1,
    valor_uf: 350,
    item_id: 10,
    situacion_municipal: 'Regularizado',
    valoracion_por: 'unidad',
  }),
  fila('recuQEMmCOId9Jfbp', {
    solicitud: [ID],
    nombre_item: 'Quincho, terrazas, bodega',
    tipo_item: 'OO.CC.',
    sup_m2: 1,
    uf_m2_unitario: 250,
    factor_aplicado: 1,
    valor_uf: 250,
    item_id: 11,
    situacion_municipal: 'Regularizado',
    valoracion_por: 'unidad',
  }),
  fila('rec1s7d6ET147j7hM', {
    solicitud: [ID],
    nombre_item: 'Cierros, pavimento exterior',
    tipo_item: 'OO.CC.',
    sup_m2: 1,
    uf_m2_unitario: 150,
    factor_aplicado: 1,
    valor_uf: 150,
    item_id: 12,
    situacion_municipal: 'Regularizado',
    valoracion_por: 'unidad',
  }),
]

/** `TX_Calculos` — las 13 filas del motor AT03_v11.1.1_v32b0 (23-sep). */
const CALCULOS_0066 = (
  [
    ['recadqk2BU4ME6kSh', 'F_IngresoLiquidoAnualCLP', 'ingreso_liquido_anual_clp', 36300000],
    ['recUbCf2jpMg7RL1E', 'F_RentaPerpetuaCLP', 'renta_perpetua_clp', 806666666.6666667],
    ['recmDmE6cw2u12ugE', 'F_ValorComercialUF', 'valor_comercial_uf', 20125.862399999998],
    ['rec9nGq6D2VZeWVgN', 'F_ValorComercialCLP', 'valor_comercial_clp', 802913431.3616639],
    ['recYiJGtIVbP6gwPd', 'F_ValorReposicionUF', 'valor_reposicion_uf', 9246.94],
    ['rec60mmxjQdoBYrpP', 'F_SeguroIncendioUF', 'seguro_incendio_uf', 8907.062399999999],
    ['rec16bw1QmBhoNUS9', 'F_AvaluoFiscalUF', 'avaluo_fiscal_uf', 8517.67767625752],
    ['recuNUco8TOqqLJAe', 'F_ValorRemateUF', 'valor_remate_uf', 13081.81056],
    ['recDTR0ntj50Z9K8E', 'F_ValorLiquidacionUF', 'valor_liquidacion_uf', 16603.836479999998],
    ['recBtElF1Wnu1h1Zj', 'F_ValorReposicionCLP', 'valor_reposicion_clp', 368903064.99340004],
    ['recSEPwoT4lIkFRQC', 'F_SeguroIncendioCLP', 'seguro_incendio_clp', 355343780.69366395],
    ['recn6pwLkWZmpWqdn', 'F_ValorRemateCLP', 'valor_remate_clp', 521893730.3850816],
    ['recu4Bv4dYcr8FnyX', 'F_ValorLiquidacionCLP', 'valor_liquidacion_clp', 662403580.8733728],
  ] as const
).map(([id, formula, variable, resultado]) =>
  fila(id, {
    solicitud: [ID],
    solicitud_codigo: 'VP-2026-0066',
    formula_nombre: formula,
    variable_output: variable,
    resultado,
    version_motor: 'AT03_v11.1.1_v32b0',
  }),
)

/** `H_PreciosUF` recbnHFtlFHQnyEM9 — fecha de la visita (seed 13-abr). */
const UF_0066 = fila('recbnHFtlFHQnyEM9', {
  fecha: '2026-04-13',
  valor_clp: 39894.61,
  tipo_cambio_usd: 890.33,
  fuente: 'Banco Central',
})

/** Maestros: recordId → fila con `nombre` (primary field en los seis). */
const MAESTROS_0066: Record<string, ReturnType<typeof fila>> = {
  recIg8NtVhptXkEUJ: fila('recIg8NtVhptXkEUJ', { nombre: 'MetLife' }),
  recKT9mUJkeq3YuBu: fila('recKT9mUJkeq3YuBu', { nombre: 'Colina' }),
  recTJcV3BIvdcG4em: fila('recTJcV3BIvdcG4em', { nombre: 'Sergio (nutricionsaludketo)' }),
  recreojxTjoAWOEHa: fila('recreojxTjoAWOEHa', { nombre: 'Refinanciamiento' }),
  recrXDAjlVCe59XBW: fila('recrXDAjlVCe59XBW', { nombre: 'Casa' }),
}

/** Tablas hijas por TABLE_ID. Las ausentes devuelven `[]` (vacías en la base). */
const TABLAS_0066: Record<string, ReturnType<typeof fila>[]> = {
  [TABLE_IDS.datosTasacion]: [DATOS_0066],
  [TABLE_IDS.itemsCuadroValoracion]: ITEMS_0066,
  [TABLE_IDS.calculos]: CALCULOS_0066,
  [TABLE_IDS.preciosUf]: [UF_0066],
}

function airtable0066() {
  listRecords.mockImplementation(async (tableId: string) => TABLAS_0066[tableId] ?? [])
  getRecord.mockImplementation(async (_tableId: string, recordId: string) =>
    MAESTROS_0066[recordId] ?? null,
  )
}

async function contexto0066(): Promise<InformeContexto> {
  return construirInformeContexto(ID, SOLICITUD_0066)
}

beforeEach(() => {
  vi.clearAllMocks()
  airtable0066()
})

/* -------------------------------------------------------------------------
 * (a) Integridad de la matriz
 * ---------------------------------------------------------------------- */

describe('MATRIZ_TAGS · integridad de los 228 E-ids', () => {
  it('cubre E-01..E-228 exactamente una vez (suma 228, sin duplicados)', () => {
    const todos = MATRIZ_TAGS.flatMap((e) => e.eIds).map((eid) => {
      const n = Number(eid.replace('E-', ''))
      expect(Number.isInteger(n), `E-id ilegible: ${eid}`).toBe(true)
      return n
    })

    expect(todos).toHaveLength(228)
    expect(new Set(todos).size).toBe(228)
    expect([...todos].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 228 }, (_, i) => i + 1),
    )
  })

  it('los PLANTILLA llevan tag «—» y ruta vacía; el resto trae tag {d.…}', () => {
    for (const entrada of MATRIZ_TAGS) {
      if (entrada.estado === 'PLANTILLA') {
        expect(entrada.tag).toBe('—')
        expect(entrada.ruta).toBe('')
      } else if (entrada.ruta !== '') {
        expect(entrada.tag.startsWith('{d.'), entrada.tag).toBe(true)
      }
    }
  })
})

/* -------------------------------------------------------------------------
 * (b) Golden VP-2026-0066
 * ---------------------------------------------------------------------- */

describe('construirInformeContexto · golden VP-2026-0066', () => {
  it.each(GOLDEN_MET6283.map((g) => [g.ruta, g] as const))(
    '%s coincide con el valor esperado (tolerancia 0,01)',
    async (_ruta, golden) => {
      const contexto = await contexto0066()
      const valor = leerRuta(contexto, golden.ruta)

      if (golden.modo === 'conteo') {
        expect(Array.isArray(valor), `${golden.ruta} no es array`).toBe(true)
        expect((valor as unknown[]).length).toBe(golden.esperado)
      } else if (typeof golden.esperado === 'number') {
        expect(typeof valor, `${golden.ruta} sin valor numérico`).toBe('number')
        expect(Math.abs((valor as number) - golden.esperado)).toBeLessThanOrEqual(0.01)
      } else {
        expect(valor).toBe(golden.esperado)
      }
    },
  )

  it('el cuadro cae de la pareja vieja a la nueva: totalUf sale de valor_uf', async () => {
    // Las filas del motor traen uf_total_item VACÍO; sin el fallback el total
    // canónico daría 0 — hallazgo de esta tanda, documentado en ensamblador.ts.
    const contexto = await contexto0066()
    expect(contexto.cuadro.totalUf).toBeCloseTo(20125.8624, 3)
    expect(contexto.cuadro.items[0].descripcion).toBe('Terreno')
    expect(contexto.cuadro.items[0].ufM2Aplicado).toBe(8)
  })

  it('fila TASACIÓN (F-2): tasacionUfM2 calculada; tasacionVsPct null sin muestra', async () => {
    const contexto = await contexto0066()
    // 20125.8624 / 249.91 = 80.5324…
    expect(contexto.comparablesInforme.tasacionUfM2).toBeCloseTo(80.53, 2)
    // 0066 no tiene comparables: sin promedio no hay desviación — null honesto.
    expect(contexto.comparablesInforme.tasacionVsPct).toBeNull()
  })

  it('visador vacío en la base → nombre null, sin inventar', async () => {
    const contexto = await contexto0066()
    expect(contexto.partes.visador.nombre).toBeNull()
  })
})

/* -------------------------------------------------------------------------
 * (c) Score de paridad — baseline fijado
 * ---------------------------------------------------------------------- */

describe('medirParidad · baseline VP-2026-0066', () => {
  it('fija el score de datos y el desglose por estado', async () => {
    const paridad = medirParidad(await contexto0066())

    expect(paridad.total).toBe(228)
    expect(paridad.porEstado).toEqual({
      OK: 96,
      HUECO: 79,
      METLIFE_ONLY: 30,
      PLANTILLA: 23,
    })
    // Baseline medido: 70 E-ids OK con valor real sobre 205 elementos-dato.
    expect(paridad.conValor).toBe(70)
    expect(paridad.score).toBe(34.1)
    // No bajar NUNCA: regresión dura para toda tanda futura.
    expect(paridad.score).toBeGreaterThanOrEqual(34)
    expect(paridad.scoreTotal228).toBe(40.8)
  })

  it('desglose de faltantes por P-id (E-ids sin dato, agrupados)', async () => {
    const paridad = medirParidad(await contexto0066())

    const porPid: Record<string, number> = {}
    for (const f of paridad.faltantes) {
      const clave = f.pId ?? 'sin-pId'
      porPid[clave] = (porPid[clave] ?? 0) + f.eIds.length
    }

    expect(porPid).toEqual({
      'sin-pId': 17, // legales, foto fachada, comparables, habitaciones (OK sin filas en 0066)
      'P0-1': 8, // anexos (inserción manual → plantilla)
      'P0-2': 2, // textos IA
      'P1-1': 26, // constructivas + detalle propiedad + comodidades + texto expropiación
      'P1-2': 49, // normativa + sector + geometría + emplazamiento + servicios
      'P1-3': 1, // dólar
      'P1-4': 4, // mapa + fichas con foto
      'P1-5': 2, // logo + revisor
      'P1-8': 6, // promedios de la muestra
      'P1-9': 6, // vida útil + cap rate base + firma + fecha visado
      P2: 3, // campos de plantilla vacíos
      'P2-2': 2, // 16 fotos (sin filas en 0066)
      'P2-3': 9, // ampliaciones + terminaciones + comentarios + arriendo UF/mes
    })

    // La suma de faltantes + con-valor + plantilla cierra los 228.
    const totalFaltantes = paridad.faltantes.reduce((s, f) => s + f.eIds.length, 0)
    expect(totalFaltantes + paridad.conValor + paridad.plantilla).toBe(228)
  })
})

/* -------------------------------------------------------------------------
 * (d) Huecos trazados a P-id
 * ---------------------------------------------------------------------- */

describe('huecos[] · trazabilidad a los pendientes del roadmap', () => {
  it('declara P0-2, P1-1, P1-2, P1-3 y P1-4 con ruta y motivo', async () => {
    const { huecos } = await contexto0066()
    const pIds = new Set(huecos.map((h) => h.pId))

    for (const pId of ['P0-2', 'P1-1', 'P1-2', 'P1-3', 'P1-4']) {
      expect(pIds.has(pId), `falta el hueco ${pId}`).toBe(true)
    }
    for (const hueco of huecos) {
      expect(hueco.ruta).not.toBe('')
      expect(hueco.motivo).not.toBe('')
      expect(hueco.eIds.length).toBeGreaterThan(0)
    }
  })

  it('con cliente resoluble NO declara hueco de nombre de cliente', async () => {
    const { huecos } = await contexto0066()
    expect(huecos.some((h) => h.ruta === 'clienteInforme.nombre')).toBe(false)
  })

  it('con Link cliente vacío declara el hueco de dato maestro', async () => {
    const { cliente: _cliente, ...sinCliente } = SOLICITUD_0066
    const { huecos, clienteInforme } = await construirInformeContexto(ID, sinCliente)

    expect(clienteInforme.nombre).toBeNull()
    expect(huecos.some((h) => h.ruta === 'clienteInforme.nombre')).toBe(true)
  })
})

/* -------------------------------------------------------------------------
 * (e) Matriz y tipos no divergen
 * ---------------------------------------------------------------------- */

describe('MATRIZ_TAGS ↔ InformeContexto · las rutas existen', () => {
  it('toda ruta no vacía resuelve a algo ≠ undefined (null = hueco válido)', async () => {
    const contexto = await contexto0066()

    for (const entrada of MATRIZ_TAGS.filter((e) => e.ruta !== '')) {
      const valor = leerRuta(contexto, entrada.ruta)
      expect(valor, `ruta rota en la matriz: ${entrada.ruta}`).not.toBeUndefined()
    }
  })

  it('las rutas de los huecos también existen en el contrato', async () => {
    const contexto = await contexto0066()

    for (const hueco of contexto.huecos) {
      expect(
        leerRuta(contexto, hueco.ruta),
        `ruta rota en huecos[]: ${hueco.ruta}`,
      ).not.toBeUndefined()
    }
  })
})

/* -------------------------------------------------------------------------
 * lecturaInformeContexto · guard
 * ---------------------------------------------------------------------- */

describe('lecturaInformeContexto · guard RF-09', () => {
  it('guard ok → ensambla con los fields de la solicitud autorizada', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: true,
      solicitudId: ID,
      fields: SOLICITUD_0066,
      usuarioRecordId: 'recTJcV3BIvdcG4em',
    })

    const res = await lecturaInformeContexto(ID)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.contexto.meta.codigo).toBe('VP-2026-0066')
    }
  })

  it('guard fallido → propaga la rama para desdeGuard, sin ensamblar', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: false,
      status: 403,
      mensaje: 'no disponible',
    })

    const res = await lecturaInformeContexto(ID)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.guard.status).toBe(403)
    expect(listRecords).not.toHaveBeenCalled()
  })
})
