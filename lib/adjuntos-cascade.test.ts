import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P14-TAS-CASCADE · generalizado en Tarea 5 · Fase A (patrón b) y Fase B
 * (patrones a/c) — cascade genérico de limpieza de data derivada al borrar un
 * adjunto.
 *
 * Se mockean las primitivas de Airtable que el helper compone —`getRecord`
 * (lee `clave_adjunto`), `listRecords` (captura), `deleteRecords` (baja de hijos
 * puros) y `updateRecord` (desligado RO-31 y limpieza de campos a/c)— para
 * verificar el enrutamiento vía {@link CASCADE_REGISTRY} sin tocar la base.
 */

const getRecord = vi.fn()
const listRecords = vi.fn()
const updateRecord = vi.fn()
const deleteRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
    getRecord: (...args: unknown[]) => getRecord(...args),
    listRecords: (...args: unknown[]) => listRecords(...args),
    updateRecord: (...args: unknown[]) => updateRecord(...args),
  }
})

vi.mock('@/lib/tasador/airtable-writes', () => ({
  deleteRecords: (...args: unknown[]) => deleteRecords(...args),
}))

import {
  CASCADE_REGISTRY,
  capturarDerivadosDeAdjunto,
  purgarDerivadosCapturados,
  type DerivadoCascade,
} from '@/lib/adjuntos-cascade'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { CAMPOS_DERIVADOS } from '@/lib/adjuntos-doc-campos'

const ADJUNTO = 'recADJ00000000001'
const OTRO_ADJUNTO = 'recADJ00000000002'
const CODIGO = 'VP-2026-0060'
const SOLICITUD = 'recSOL00000000001'
const CTX = { codigoExt: CODIGO, solicitudId: SOLICITUD }
const COMPARABLES = TABLE_IDS.comparables

/** IDs esperados de campos, derivados del mismo mapa que consume el cascade. */
const fieldsDatosSii = CAMPOS_DERIVADOS['foto_fuente_sii']
  .find((t) => t.tabla === TABLE_IDS.datosTasacion)!
  .campos.map((c) => c.fieldId)
const fieldsUnidadesSii = CAMPOS_DERIVADOS['foto_fuente_sii']
  .find((t) => t.tabla === TABLE_IDS.unidades)!
  .campos.map((c) => c.fieldId)

function filaComparable(id: string, adjuntoOrigen: string[] | undefined, aporta?: boolean) {
  return {
    id,
    createdTime: '',
    fields: {
      clave_natural: `${CODIGO}|COMP-01`,
      adjunto_origen: adjuntoOrigen,
      aporta_a_historico: aporta,
    },
  }
}

/** Mock de getRecord para devolver un `clave_adjunto` dado. */
function conClave(clave: string) {
  getRecord.mockResolvedValue({ id: ADJUNTO, createdTime: '', fields: { clave_adjunto: clave } })
}

/**
 * Enruta `listRecords` por tabla. Por defecto todo vacío; el test rellena sólo
 * las tablas que le importan.
 */
function listRecordsPorTabla(map: Record<string, Array<{ id: string; fields?: Record<string, unknown> }>>) {
  listRecords.mockImplementation(async (tableId: string) => {
    const filas = map[tableId] ?? []
    return filas.map((f) => ({ id: f.id, createdTime: '', fields: f.fields ?? {} }))
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  getRecord.mockResolvedValue({ id: ADJUNTO, createdTime: '', fields: { clave_adjunto: '' } })
  listRecords.mockResolvedValue([])
  deleteRecords.mockResolvedValue(0)
  updateRecord.mockResolvedValue({ id: 'x', createdTime: '', fields: {} })
})

describe('CASCADE_REGISTRY', () => {
  it('la primera entrada es TX_Comparables (b) con su historicoField (RO-31)', () => {
    expect(CASCADE_REGISTRY[0]).toMatchObject({
      patron: 'b',
      tabla: COMPARABLES,
      linkField: 'adjunto_origen',
      historicoField: 'aporta_a_historico',
      desligarField: 'solicitud',
    })
  })

  it('incluye las 8 entradas de campos (a/c) derivadas del mapa §28', () => {
    const campos = CASCADE_REGISTRY.filter((e) => e.patron !== 'b')
    // foto_fuente_sii(3) + certificado_avaluo_fiscal(2) + escritura_compraventa(1)
    //   + permiso_edificacion(1) + certificado_recepcion_final(1)
    expect(campos).toHaveLength(8)
    expect(CASCADE_REGISTRY).toHaveLength(9)
  })
})

describe('capturarDerivadosDeAdjunto · patrón b (comparables)', () => {
  it('filtra por el link de provenance: sólo los del adjunto', async () => {
    conClave('foto_ofertas_comparables') // patrón b; no dispara a/c
    listRecordsPorTabla({
      [COMPARABLES]: [
        filaComparable('recCOMP1', [ADJUNTO], false),
        filaComparable('recCOMP2', [ADJUNTO], true),
        filaComparable('recCOMP3', [OTRO_ADJUNTO], false),
        filaComparable('recCOMP4', undefined, false),
      ],
    })

    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CTX)

    expect(capturados).toEqual([
      { op: 'baja', id: 'recCOMP1', tabla: COMPARABLES, aportaHistorico: false },
      { op: 'baja', id: 'recCOMP2', tabla: COMPARABLES, aportaHistorico: true },
    ])
  })

  it('lee clave_adjunto del adjunto vivo ANTES del borrado', async () => {
    conClave('foto_ofertas_comparables')
    await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    expect(getRecord).toHaveBeenCalledWith(TABLE_IDS.adjuntos, ADJUNTO)
  })

  it('scopea comparables por clave_natural (no por el link solicitud)', async () => {
    conClave('foto_ofertas_comparables')
    await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    const call = listRecords.mock.calls.find((c) => c[0] === COMPARABLES)!
    expect(call[1].filterByFormula).toBe(`SEARCH("${CODIGO}", {clave_natural})`)
    expect(call[1].fields).toEqual(['adjunto_origen', 'aporta_a_historico'])
  })
})

describe('capturarDerivadosDeAdjunto · patrones a/c por tipo de documento', () => {
  it('foto_fuente_sii → limpiar DatosTasacion, DocumentosLegales y cada Unidad', async () => {
    conClave('foto_fuente_sii')
    listRecordsPorTabla({
      [TABLE_IDS.datosTasacion]: [{ id: 'recDT1' }],
      [TABLE_IDS.documentosLegales]: [{ id: 'recDL1' }],
      [TABLE_IDS.unidades]: [{ id: 'recU1' }, { id: 'recU2' }],
    })

    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CTX)

    // DatosTasacion (14) + DocumentosLegales (3) + 2 Unidades = 4 filas limpiar
    expect(capturados).toHaveLength(4)
    const dt = capturados.find((c) => c.tabla === TABLE_IDS.datosTasacion)!
    expect(dt).toMatchObject({ op: 'limpiar', id: 'recDT1' })
    expect((dt as Extract<DerivadoCascade, { op: 'limpiar' }>).campos).toHaveLength(14)
    const unidades = capturados.filter((c) => c.tabla === TABLE_IDS.unidades)
    expect(unidades.map((u) => u.id)).toEqual(['recU1', 'recU2'])
    expect((unidades[0] as Extract<DerivadoCascade, { op: 'limpiar' }>).campos).toEqual(
      fieldsUnidadesSii
    )
  })

  it('foto_fuente_sii → scope de Unidades por solicitud_record_id, no por {solicitud}', async () => {
    conClave('foto_fuente_sii')
    await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    const call = listRecords.mock.calls.find((c) => c[0] === TABLE_IDS.unidades)!
    expect(call[1].filterByFormula).toBe(`ARRAYJOIN({solicitud_record_id})="${SOLICITUD}"`)
    const callDT = listRecords.mock.calls.find((c) => c[0] === TABLE_IDS.datosTasacion)!
    expect(callDT[1].filterByFormula).toBe(`{solicitud}="${CODIGO}"`)
  })

  it('certificado_avaluo_fiscal → DatosTasacion (5) y Unidades', async () => {
    conClave('certificado_avaluo_fiscal')
    listRecordsPorTabla({
      [TABLE_IDS.datosTasacion]: [{ id: 'recDT1' }],
      [TABLE_IDS.unidades]: [{ id: 'recU1' }],
    })

    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    const dt = capturados.find((c) => c.tabla === TABLE_IDS.datosTasacion)!
    expect((dt as Extract<DerivadoCascade, { op: 'limpiar' }>).campos).toHaveLength(5)
    // no toca DocumentosLegales
    expect(capturados.some((c) => c.tabla === TABLE_IDS.documentosLegales)).toBe(false)
  })

  it('escritura_compraventa → sólo DocumentosLegales (4)', async () => {
    conClave('escritura_compraventa')
    listRecordsPorTabla({ [TABLE_IDS.documentosLegales]: [{ id: 'recDL1' }] })

    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    expect(capturados).toHaveLength(1)
    expect(capturados[0]).toMatchObject({ op: 'limpiar', tabla: TABLE_IDS.documentosLegales })
    expect((capturados[0] as Extract<DerivadoCascade, { op: 'limpiar' }>).campos).toHaveLength(4)
  })

  it('permiso_edificacion → sólo DocumentosLegales (par permiso · 2)', async () => {
    conClave('permiso_edificacion')
    listRecordsPorTabla({ [TABLE_IDS.documentosLegales]: [{ id: 'recDL1' }] })

    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    const campos = CAMPOS_DERIVADOS['permiso_edificacion']
      .find((t) => t.tabla === TABLE_IDS.documentosLegales)!
      .campos.map((c) => c.fieldId)
    expect(capturados).toEqual([
      { op: 'limpiar', id: 'recDL1', tabla: TABLE_IDS.documentosLegales, campos },
    ])
    expect(campos).toHaveLength(2)
  })

  it('certificado_recepcion_final → DocumentosLegales (par recepción final · 2) y PATCHea esos 2 a null (regresión bug de borrado)', async () => {
    conClave('certificado_recepcion_final')
    listRecordsPorTabla({ [TABLE_IDS.documentosLegales]: [{ id: 'recDL1' }] })

    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    const campos = CAMPOS_DERIVADOS['certificado_recepcion_final']
      .find((t) => t.tabla === TABLE_IDS.documentosLegales)!
      .campos.map((c) => c.fieldId)
    expect(capturados).toEqual([
      { op: 'limpiar', id: 'recDL1', tabla: TABLE_IDS.documentosLegales, campos },
    ])
    expect(campos).toHaveLength(2)

    // Integración capture→purge: la purga escribe EXACTAMENTE esos 2 campos a null
    // en TX_DocumentosLegales (el UPDATE que faltaba ejecutarse en producción).
    await purgarDerivadosCapturados(capturados)
    expect(updateRecord).toHaveBeenCalledWith(
      TABLE_IDS.documentosLegales,
      'recDL1',
      Object.fromEntries(campos.map((f) => [f, null]))
    )
  })

  it('clave desconocida (los 8 sin destino · Q5) → no captura nada', async () => {
    conClave('consulta_antecedentes_bien_raiz')
    listRecordsPorTabla({
      [TABLE_IDS.datosTasacion]: [{ id: 'recDT1' }],
      [TABLE_IDS.unidades]: [{ id: 'recU1' }],
    })
    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CTX)
    expect(capturados).toEqual([])
    // no debió consultar tablas a/c
    expect(listRecords.mock.calls.some((c) => c[0] === TABLE_IDS.datosTasacion)).toBe(false)
  })

  it('campos compartidos (Q1): foto_fuente_sii limpia los 4 que comparte con certificado_avaluo_fiscal', () => {
    const compartidos = CAMPOS_DERIVADOS['certificado_avaluo_fiscal']
      .find((t) => t.tabla === TABLE_IDS.datosTasacion)!
      .campos.map((c) => c.fieldId)
      .filter((f) =>
        // los que NO son material_predominante, es decir los 4 SII compartidos
        fieldsDatosSii.includes(f)
      )
    expect(compartidos.length).toBe(4)
    for (const f of compartidos) expect(fieldsDatosSii).toContain(f)
  })
})

describe('purgarDerivadosCapturados', () => {
  it('op:baja aportaHistorico=false → borra (DELETE), no desliga', async () => {
    deleteRecords.mockResolvedValue(2)
    const r = await purgarDerivadosCapturados([
      { op: 'baja', id: 'recA', tabla: COMPARABLES, aportaHistorico: false },
      { op: 'baja', id: 'recB', tabla: COMPARABLES, aportaHistorico: false },
    ])
    expect(deleteRecords).toHaveBeenCalledWith(COMPARABLES, ['recA', 'recB'])
    expect(updateRecord).not.toHaveBeenCalled()
    expect(r).toEqual({ borrados: 2, desligados: 0, limpiados: 0, errores: 0 })
  })

  it('op:baja aportaHistorico=true → desliga (PATCH solicitud:[]), no borra (RO-31)', async () => {
    const r = await purgarDerivadosCapturados([
      { op: 'baja', id: 'recH1', tabla: COMPARABLES, aportaHistorico: true },
    ])
    expect(deleteRecords).not.toHaveBeenCalled()
    expect(updateRecord).toHaveBeenCalledWith(COMPARABLES, 'recH1', { solicitud: [] })
    expect(r).toEqual({ borrados: 0, desligados: 1, limpiados: 0, errores: 0 })
  })

  it('op:limpiar → PATCH de cada FIELD_ID a null, CONSERVA la fila (no DELETE)', async () => {
    const campos = fieldsUnidadesSii
    const r = await purgarDerivadosCapturados([
      { op: 'limpiar', id: 'recU1', tabla: TABLE_IDS.unidades, campos },
      { op: 'limpiar', id: 'recU2', tabla: TABLE_IDS.unidades, campos },
    ])
    expect(deleteRecords).not.toHaveBeenCalled()
    const esperado = Object.fromEntries(campos.map((f) => [f, null]))
    expect(updateRecord).toHaveBeenCalledWith(TABLE_IDS.unidades, 'recU1', esperado)
    expect(updateRecord).toHaveBeenCalledWith(TABLE_IDS.unidades, 'recU2', esperado)
    expect(r).toEqual({ borrados: 0, desligados: 0, limpiados: 2, errores: 0 })
  })

  it('mezcla b + a/c: borra comparable y limpia DatosTasacion en el mismo delete', async () => {
    deleteRecords.mockResolvedValue(1)
    const r = await purgarDerivadosCapturados([
      { op: 'baja', id: 'recDel', tabla: COMPARABLES, aportaHistorico: false },
      { op: 'limpiar', id: 'recDT1', tabla: TABLE_IDS.datosTasacion, campos: fieldsDatosSii },
    ])
    expect(deleteRecords).toHaveBeenCalledWith(COMPARABLES, ['recDel'])
    expect(updateRecord).toHaveBeenCalledWith(
      TABLE_IDS.datosTasacion,
      'recDT1',
      Object.fromEntries(fieldsDatosSii.map((f) => [f, null]))
    )
    expect(r).toEqual({ borrados: 1, desligados: 0, limpiados: 1, errores: 0 })
  })

  it('idempotencia: lista vacía → {0,0,0,0} sin tocar Airtable', async () => {
    const r = await purgarDerivadosCapturados([])
    expect(deleteRecords).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
    expect(r).toEqual({ borrados: 0, desligados: 0, limpiados: 0, errores: 0 })
  })

  it('borrado parcial: un limpiar que falla cuenta el error, sigue con el resto y NO re-lanza', async () => {
    updateRecord
      .mockRejectedValueOnce(new Error('422 unknown field'))
      .mockResolvedValueOnce({ id: 'recU2', createdTime: '', fields: {} })
    const r = await purgarDerivadosCapturados([
      { op: 'limpiar', id: 'recU1', tabla: TABLE_IDS.unidades, campos: fieldsUnidadesSii },
      { op: 'limpiar', id: 'recU2', tabla: TABLE_IDS.unidades, campos: fieldsUnidadesSii },
    ])
    expect(r).toEqual({ borrados: 0, desligados: 0, limpiados: 1, errores: 1 })
  })

  it('borrado parcial: si el DELETE falla, cuenta el error y NO re-lanza', async () => {
    deleteRecords.mockRejectedValue(new Error('502 airtable'))
    const r = await purgarDerivadosCapturados([
      { op: 'baja', id: 'recA', tabla: COMPARABLES, aportaHistorico: false },
    ])
    expect(r).toEqual({ borrados: 0, desligados: 0, limpiados: 0, errores: 1 })
  })
})
