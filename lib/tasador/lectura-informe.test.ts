import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Modelo canónico del informe — P9-TAS · CI-063.
 *
 * `construirInforme` es el productor que `informe-preview.tsx` consume para el
 * bloque 2 (cap rate + valor) tras cerrar CI-063. Este test fija dos cosas:
 *
 * 1. El **cap rate sale del valor ALMACENADO** (`tasa_cap_rate_override ??
 *    tasa_cap_rate`), no de un cómputo sobre `valorReferenciaClp`.
 * 2. **Candado paralelo a `lectura-datos.test.ts:208`**: `valorReferenciaClp`
 *    no participa del cap rate canónico. Aunque la solicitud lo trajera, el
 *    número no cambia. Es la mitad que CI-023 §1 deja sin columna, y el modelo
 *    canónico existe justamente para no necesitarla.
 *
 * Se mockea sólo `listRecords` y se pasan los `fields` de la solicitud directo,
 * igual que el candado de la sección H: `construirInforme` no hace guard.
 */

const listRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

import { construirInforme, type Bloque } from './lectura-informe'
import { TABLE_IDS } from './field-ids'

const ID = 'rec0000000000INF1'
const CODIGO = 'VP-2026-0063'

function fila(id: string, fields: Record<string, unknown>) {
  return { id, createdTime: '', fields }
}

/** Por defecto todas las tablas hijas vacías; los casos pueblan lo que necesiten. */
function airtableVacio() {
  listRecords.mockImplementation(async () => [])
}

/** `TX_DatosTasacion` con la fila dada; el resto vacío. */
function airtableConDatos(datos: Record<string, unknown>) {
  listRecords.mockImplementation(async (tableId: string) =>
    tableId === TABLE_IDS.datosTasacion ? [fila('recDatos00000INF1', datos)] : []
  )
}

function bloqueValor(bloques: Bloque[]) {
  return bloques.find((b) => b.id === 'valor')!
}

function bloquePorId(bloques: Bloque[], id: string) {
  return bloques.find((b) => b.id === id)!
}

/** Puebla las tablas hijas indicadas por TABLE_ID; el resto queda vacío. */
function airtableCon(porTabla: Partial<Record<string, ReturnType<typeof fila>[]>>) {
  listRecords.mockImplementation(async (tableId: string) => porTabla[tableId] ?? [])
}

beforeEach(() => {
  vi.clearAllMocks()
  airtableVacio()
})

describe('construirInforme · estructura de los 8 bloques', () => {
  it('devuelve 8 bloques numerados 1..8 en orden (contrato §10.1)', async () => {
    const { bloques } = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(bloques).toHaveLength(8)
    expect(bloques.map((b) => b.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(bloques.map((b) => b.id)).toEqual([
      'cabecera',
      'valor',
      'antecedentes',
      'sii',
      'valoracion',
      'comparables',
      'fotografico',
      'observaciones',
    ])
  })

  it('conserva id, codigo y estado de la solicitud', async () => {
    const informe = await construirInforme(ID, {
      codigo_solicitud: CODIGO,
      estado: 'calculada',
    })

    expect(informe.id).toBe(ID)
    expect(informe.codigo).toBe(CODIGO)
    expect(informe.estado).toBe('calculada')
  })
})

describe('construirInforme · cap rate del bloque 2 (CI-063)', () => {
  it('toma el cap rate almacenado en TX_DatosTasacion.tasa_cap_rate', async () => {
    airtableConDatos({ tasa_cap_rate: 4.75 })

    const informe = await construirInforme(ID, {
      codigo_solicitud: CODIGO,
      valor_comercial_uf: 8200,
    })

    expect(informe.valorDestacado.capRate).toBe(4.75)
    expect(bloqueValor(informe.bloques).datos.capRate).toBe(4.75)
  })

  it('prefiere tasa_cap_rate_override de la solicitud sobre el de datos', async () => {
    airtableConDatos({ tasa_cap_rate: 4.75 })

    const informe = await construirInforme(ID, {
      codigo_solicitud: CODIGO,
      tasa_cap_rate_override: 5.1,
    })

    expect(informe.valorDestacado.capRate).toBe(5.1)
  })

  it('cap rate es null cuando no hay ni override ni valor almacenado', async () => {
    const informe = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(informe.valorDestacado.capRate).toBeNull()
  })

  it(
    'no usa valorReferenciaClp para el cap rate: aunque la solicitud lo traiga, ' +
      'el número no cambia (CI-023 §1 · candado CI-063)',
    async () => {
      airtableConDatos({ tasa_cap_rate: 4.75, arriendo_mensual: 850000, gasto_anual: 1200000 })

      const informe = await construirInforme(ID, {
        codigo_solicitud: CODIGO,
        // El modelo cliente dividía por esto y quedaba «—». El canónico lo ignora.
        valor_referencia: 90000000,
        valorReferenciaClp: 90000000,
      })

      // El cap rate sigue siendo el almacenado, intacto por el ruido de arriba.
      expect(informe.valorDestacado.capRate).toBe(4.75)
    }
  )
})

describe('construirInforme · valor destacado (bloque 2)', () => {
  it('prefiere valor_final_override y marca esOverride', async () => {
    const informe = await construirInforme(ID, {
      codigo_solicitud: CODIGO,
      valor_final_override: 5200,
      valor_comercial_uf: 8200,
    })

    expect(informe.valorDestacado.valorUf).toBe(5200)
    expect(informe.valorDestacado.esOverride).toBe(true)
  })

  it('cae a valor_comercial_uf sin override, sin marcar esOverride', async () => {
    const informe = await construirInforme(ID, {
      codigo_solicitud: CODIGO,
      valor_comercial_uf: 8200,
    })

    expect(informe.valorDestacado.valorUf).toBe(8200)
    expect(informe.valorDestacado.esOverride).toBe(false)
  })

  it('valorUf null y bloque 2 vacío cuando faltan ambos (nunca 0)', async () => {
    const informe = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(informe.valorDestacado.valorUf).toBeNull()
    expect(bloqueValor(informe.bloques).vacio).toBe(true)
  })
})

describe('construirInforme · bloque 4 (SII/avalúo · P9-TAS.B)', () => {
  it('proyecta avalúo desde TX_DatosTasacion y lo expone top-level', async () => {
    airtableCon({
      [TABLE_IDS.datosTasacion]: [
        fila('recD1', {
          avaluo_total: 45000000,
          avaluo_fiscal_uf: 1200.5,
          avaluo_exento: 30000000,
          contribucion_anual: 350000,
          calidad_sii: 'B',
          destino_sii: 'Habitacional',
        }),
      ],
    })

    const informe = await construirInforme(ID, {
      codigo_solicitud: CODIGO,
      rol_sii: '658-128',
    })

    expect(informe.datosSii.avaluoTotal).toBe(45000000)
    expect(informe.datosSii.avaluoFiscalUf).toBe(1200.5)
    expect(informe.datosSii.rolSii).toBe('658-128')
    expect(informe.datosSii.calidadSii).toBe('B')
    // El top-level y bloques[] son el MISMO objeto (contrato del route intacto).
    expect(bloquePorId(informe.bloques, 'sii').datos).toBe(informe.datosSii)
  })

  it('mapea TX_Unidades a porUnidad[]', async () => {
    airtableCon({
      [TABLE_IDS.unidades]: [
        fila('recU1', {
          numero_unidad: 'Depto 101',
          rol_sii: '658-128',
          subtipo: 'Departamento',
          sup_m2: 62.5,
          avaluo_uf: 900,
        }),
      ],
    })

    const informe = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(informe.datosSii.porUnidad).toHaveLength(1)
    expect(informe.datosSii.porUnidad[0]).toMatchObject({
      id: 'recU1',
      numeroUnidad: 'Depto 101',
      subtipo: 'Departamento',
      supM2: 62.5,
      avaluoUf: 900,
    })
  })

  it.each([
    [null, 'Rol SII pendiente'],
    ['', 'Rol SII pendiente'],
    ['   ', 'Rol SII pendiente'],
    ['EN TRAMITE', 'Rol SII pendiente'],
    ['658-128', '658-128'],
  ])(
    'rol de bloque: rol_sii=%j → %j (CI-067 · Héctor 29-ago-2026)',
    async (entrada, esperado) => {
      const informe = await construirInforme(ID, {
        codigo_solicitud: CODIGO,
        rol_sii: entrada,
      })

      expect(informe.datosSii.rolSii).toBe(esperado)
    },
  )

  it('rol por unidad: aplica el mismo sentinel que el rol de bloque', async () => {
    airtableCon({
      [TABLE_IDS.unidades]: [
        fila('recU1', { numero_unidad: 'Depto 101', rol_sii: 'EN TRAMITE' }),
        fila('recU2', { numero_unidad: 'Depto 102', rol_sii: '658-128' }),
      ],
    })

    const informe = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(informe.datosSii.porUnidad[0].rolSii).toBe('Rol SII pendiente')
    expect(informe.datosSii.porUnidad[1].rolSii).toBe('658-128')
  })

  it('bloque sii vacío sin unidades ni datos (ausencia honesta · RO-34)', async () => {
    const informe = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(bloquePorId(informe.bloques, 'sii').vacio).toBe(true)
    expect(informe.datosSii.porUnidad).toEqual([])
    expect(informe.datosSii.avaluoTotal).toBeNull()
  })
})

describe('construirInforme · bloque 8 (observaciones + legales · P9-TAS.B)', () => {
  it('mapea antecedentes legales desde TX_DocumentosLegales', async () => {
    airtableCon({
      [TABLE_IDS.documentosLegales]: [
        fila('recL1', {
          fojas: '1234',
          numero_inscripcion: '567',
          ano_inscripcion: 2019,
          permiso_edificacion_numero: 'PE-88',
          recepcion_final_numero: 'RF-90',
        }),
      ],
    })

    const informe = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(informe.observaciones.antecedentesLegales).toEqual({
      fojas: '1234',
      numeroInscripcion: '567',
      anoInscripcion: 2019,
      permisoEdificacion: 'PE-88',
      recepcionFinal: 'RF-90',
    })
    expect(bloquePorId(informe.bloques, 'observaciones').datos).toBe(
      informe.observaciones,
    )
  })

  it('overrides[] filtra los nulos y conserva los presentes', async () => {
    const informe = await construirInforme(ID, {
      codigo_solicitud: CODIGO,
      tasa_cap_rate_override: 5.1,
      valor_final_override: 5200,
      // vida_util_override ausente → no aparece en el array
    })

    expect(informe.observaciones.overrides).toEqual([
      { campo: 'Tasa cap rate', valor: 5.1 },
      { campo: 'Valor final', valor: 5200 },
    ])
  })

  it('bloque observaciones vacío sin observaciones ni overrides', async () => {
    const informe = await construirInforme(ID, { codigo_solicitud: CODIGO })

    expect(bloquePorId(informe.bloques, 'observaciones').vacio).toBe(true)
    expect(informe.observaciones.overrides).toEqual([])
    // Antecedentes legales vacíos: la tabla no tiene fila (ausencia honesta).
    expect(informe.observaciones.antecedentesLegales.fojas).toBe('')
  })
})

describe('construirInforme · bloque 6 (comparables · A-44 fórmula directa)', () => {
  /** `datos` del bloque 6 con la forma que produce construirInforme. */
  function datosComparables(bloques: Bloque[]) {
    return bloquePorId(bloques, 'comparables').datos as {
      comparables: { id: string; ufM2Construccion: number | null }[]
      promedioUfM2: number | null
      usadosEnPromedio: number
      cumpleMinimo: boolean
    }
  }

  it('caso normal: uf_m2_c = (precio_uf - uf_m2_terreno_f*sup_t - oo_cc_uf) / sup_c', async () => {
    airtableCon({
      [TABLE_IDS.comparables]: [
        fila('recC1', {
          precio_uf: 12500,
          sup_terreno_m2: 100,
          sup_construccion_m2: 80,
          uf_m2_terreno_f: 5,
          oo_cc_uf: 300,
        }),
      ],
    })

    const { bloques } = await construirInforme(ID, { codigo_solicitud: CODIGO })
    const datos = datosComparables(bloques)

    // (12500 - 5*100 - 300) / 80 = 11700 / 80 = 146.25
    expect(datos.comparables[0].ufM2Construccion).toBe(146.25)
    expect(datos.promedioUfM2).toBe(146.25)
    expect(datos.usadosEnPromedio).toBe(1)
  })

  it('oo_cc_uf ausente (null) se trata como 0', async () => {
    airtableCon({
      [TABLE_IDS.comparables]: [
        fila('recC1', {
          precio_uf: 12500,
          sup_terreno_m2: 100,
          sup_construccion_m2: 80,
          uf_m2_terreno_f: 5,
          oo_cc_uf: null,
        }),
      ],
    })

    const { bloques } = await construirInforme(ID, { codigo_solicitud: CODIGO })
    const datos = datosComparables(bloques)

    // (12500 - 5*100 - 0) / 80 = 12000 / 80 = 150
    expect(datos.comparables[0].ufM2Construccion).toBe(150)
  })

  it('sup_construccion_m2 = 0 → uf_m2_c null y fuera del promedio (sin división por cero)', async () => {
    airtableCon({
      [TABLE_IDS.comparables]: [
        fila('recC1', {
          precio_uf: 12500,
          sup_terreno_m2: 100,
          sup_construccion_m2: 0,
          uf_m2_terreno_f: 5,
          oo_cc_uf: 300,
        }),
      ],
    })

    const { bloques } = await construirInforme(ID, { codigo_solicitud: CODIGO })
    const datos = datosComparables(bloques)

    expect(datos.comparables[0].ufM2Construccion).toBeNull()
    expect(datos.usadosEnPromedio).toBe(0)
    expect(datos.promedioUfM2).toBeNull()
  })
})
