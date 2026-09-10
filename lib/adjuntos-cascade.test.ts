import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P14-TAS-CASCADE · generalizado en Tarea 5 · Fase A — cascade genérico de
 * limpieza de data derivada al borrar un adjunto.
 *
 * Se mockean las tres primitivas de Airtable que el helper compone —`listRecords`
 * (captura), `deleteRecords` (baja de hijos puros) y `updateRecord` (desligado
 * RO-31)— para verificar el enrutamiento vía {@link CASCADE_REGISTRY} sin tocar
 * la base. El registry tiene hoy una sola entrada (TX_Comparables), así que las
 * aserciones van contra `TABLE_IDS.comparables`, pero el código ya es
 * table-agnostic.
 */

const listRecords = vi.fn()
const updateRecord = vi.fn()
const deleteRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
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
} from '@/lib/adjuntos-cascade'
import { TABLE_IDS } from '@/lib/tasador/field-ids'

const ADJUNTO = 'recADJ00000000001'
const OTRO_ADJUNTO = 'recADJ00000000002'
const CODIGO = 'VP-2026-0060'
const COMPARABLES = TABLE_IDS.comparables

function fila(id: string, adjuntoOrigen: string[] | undefined, aporta?: boolean) {
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

/** Un derivado ya capturado, con la tabla que exige la nueva firma. */
function derivado(id: string, aportaHistorico: boolean) {
  return { id, tabla: COMPARABLES, aportaHistorico }
}

beforeEach(() => {
  vi.clearAllMocks()
  listRecords.mockResolvedValue([])
  deleteRecords.mockResolvedValue(0)
  updateRecord.mockResolvedValue({ id: 'x', createdTime: '', fields: {} })
})

describe('CASCADE_REGISTRY', () => {
  it('hoy declara únicamente TX_Comparables con su historicoField (RO-31)', () => {
    expect(CASCADE_REGISTRY).toHaveLength(1)
    expect(CASCADE_REGISTRY[0]).toMatchObject({
      tabla: COMPARABLES,
      linkField: 'adjunto_origen',
      historicoField: 'aporta_a_historico',
      desligarField: 'solicitud',
    })
  })
})

describe('capturarDerivadosDeAdjunto', () => {
  it('filtra por el link de provenance: sólo los del adjunto, ignorando otro adjunto o sin link', async () => {
    listRecords.mockResolvedValue([
      fila('recCOMP1', [ADJUNTO], false),
      fila('recCOMP2', [ADJUNTO], true),
      fila('recCOMP3', [OTRO_ADJUNTO], false), // otro adjunto → fuera
      fila('recCOMP4', undefined, false), // sin adjunto_origen → fuera
    ])

    const capturados = await capturarDerivadosDeAdjunto(ADJUNTO, CODIGO)

    expect(capturados).toEqual([
      { id: 'recCOMP1', tabla: COMPARABLES, aportaHistorico: false },
      { id: 'recCOMP2', tabla: COMPARABLES, aportaHistorico: true },
    ])
  })

  it('scopea por la scopeFormula del registry (clave_natural, no el link solicitud)', async () => {
    await capturarDerivadosDeAdjunto(ADJUNTO, CODIGO)

    const [tableId, params] = listRecords.mock.calls[0]
    expect(tableId).toBe(COMPARABLES)
    expect(params.filterByFormula).toBe(`SEARCH("${CODIGO}", {clave_natural})`)
    // Lee link + historicoField para poder decidir RO-31 sin una segunda lectura.
    expect(params.fields).toEqual(['adjunto_origen', 'aporta_a_historico'])
  })

  it('adjunto que no pobló nada (cero filas en scope) → lista vacía (no-op)', async () => {
    listRecords.mockResolvedValue([])
    expect(await capturarDerivadosDeAdjunto(ADJUNTO, CODIGO)).toEqual([])
  })

  it('documento sin datos poblados en esta tabla (todo de otro adjunto) → lista vacía', async () => {
    listRecords.mockResolvedValue([fila('recCOMP9', [OTRO_ADJUNTO], false)])
    expect(await capturarDerivadosDeAdjunto(ADJUNTO, CODIGO)).toEqual([])
  })
})

describe('purgarDerivadosCapturados', () => {
  it('happy path patrón b: aportaHistorico=false → borra (DELETE), no desliga', async () => {
    deleteRecords.mockResolvedValue(2)

    const r = await purgarDerivadosCapturados([derivado('recA', false), derivado('recB', false)])

    expect(deleteRecords).toHaveBeenCalledWith(COMPARABLES, ['recA', 'recB'])
    expect(updateRecord).not.toHaveBeenCalled()
    expect(r).toEqual({ borrados: 2, desligados: 0, errores: 0 })
  })

  it('aportaHistorico=true → desliga (PATCH solicitud:[]), no borra (RO-31)', async () => {
    const r = await purgarDerivadosCapturados([derivado('recH1', true), derivado('recH2', true)])

    expect(deleteRecords).not.toHaveBeenCalled()
    expect(updateRecord).toHaveBeenCalledWith(COMPARABLES, 'recH1', { solicitud: [] })
    expect(updateRecord).toHaveBeenCalledWith(COMPARABLES, 'recH2', { solicitud: [] })
    expect(r).toEqual({ borrados: 0, desligados: 2, errores: 0 })
  })

  it('mezcla: borra los falsy y desliga los true', async () => {
    deleteRecords.mockResolvedValue(1)

    const r = await purgarDerivadosCapturados([derivado('recDel', false), derivado('recUnlink', true)])

    expect(deleteRecords).toHaveBeenCalledWith(COMPARABLES, ['recDel'])
    expect(updateRecord).toHaveBeenCalledWith(COMPARABLES, 'recUnlink', { solicitud: [] })
    expect(r).toEqual({ borrados: 1, desligados: 1, errores: 0 })
  })

  it('idempotencia: lista vacía → {0,0,0} sin tocar Airtable', async () => {
    const r = await purgarDerivadosCapturados([])

    expect(deleteRecords).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
    expect(r).toEqual({ borrados: 0, desligados: 0, errores: 0 })
  })

  it('borrado parcial: si el DELETE falla, cuenta el error y NO re-lanza', async () => {
    deleteRecords.mockRejectedValue(new Error('502 airtable'))

    const r = await purgarDerivadosCapturados([derivado('recA', false)])

    expect(r).toEqual({ borrados: 0, desligados: 0, errores: 1 })
  })

  it('borrado parcial: si un desligado falla, cuenta el error, sigue con el resto y NO re-lanza', async () => {
    updateRecord
      .mockRejectedValueOnce(new Error('502 airtable'))
      .mockResolvedValueOnce({ id: 'recH2', createdTime: '', fields: {} })

    const r = await purgarDerivadosCapturados([derivado('recH1', true), derivado('recH2', true)])

    expect(r).toEqual({ borrados: 0, desligados: 1, errores: 1 })
  })
})
