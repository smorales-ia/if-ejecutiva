import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P14-TAS-CASCADE · limpieza de comparables derivados al borrar un adjunto.
 *
 * Se mockean las tres primitivas de Airtable que el helper compone —`listRecords`
 * (captura), `deleteRecords` (baja de hijos puros) y `updateRecord` (desligado
 * RO-31)— para verificar el enrutamiento sin tocar la base.
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
  capturarComparablesDeAdjunto,
  purgarComparablesCapturados,
} from '@/lib/adjuntos-cascade'
import { TABLE_IDS } from '@/lib/tasador/field-ids'

const ADJUNTO = 'recADJ00000000001'
const OTRO_ADJUNTO = 'recADJ00000000002'
const CODIGO = 'VP-2026-0060'

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

beforeEach(() => {
  vi.clearAllMocks()
  listRecords.mockResolvedValue([])
  deleteRecords.mockResolvedValue(0)
  updateRecord.mockResolvedValue({ id: 'x', createdTime: '', fields: {} })
})

describe('capturarComparablesDeAdjunto', () => {
  it('filtra por adjunto_origen: sólo los del adjunto, ignorando los de otro adjunto o sin link', async () => {
    listRecords.mockResolvedValue([
      fila('recCOMP1', [ADJUNTO], false),
      fila('recCOMP2', [ADJUNTO], true),
      fila('recCOMP3', [OTRO_ADJUNTO], false), // otro adjunto → fuera
      fila('recCOMP4', undefined, false), // sin adjunto_origen → fuera
    ])

    const capturados = await capturarComparablesDeAdjunto(ADJUNTO, CODIGO)

    expect(capturados).toEqual([
      { id: 'recCOMP1', aportaHistorico: false },
      { id: 'recCOMP2', aportaHistorico: true },
    ])
  })

  it('scopea por clave_natural (no por el link solicitud, poco fiable en esta tabla)', async () => {
    await capturarComparablesDeAdjunto(ADJUNTO, CODIGO)

    const [tableId, params] = listRecords.mock.calls[0]
    expect(tableId).toBe(TABLE_IDS.comparables)
    expect(params.filterByFormula).toBe(`SEARCH("${CODIGO}", {clave_natural})`)
  })

  it('sin coincidencias devuelve lista vacía', async () => {
    listRecords.mockResolvedValue([fila('recCOMP9', [OTRO_ADJUNTO], false)])
    expect(await capturarComparablesDeAdjunto(ADJUNTO, CODIGO)).toEqual([])
  })
})

describe('purgarComparablesCapturados', () => {
  it('aporta_a_historico=false → borra (DELETE), no desliga', async () => {
    deleteRecords.mockResolvedValue(2)

    const r = await purgarComparablesCapturados([
      { id: 'recA', aportaHistorico: false },
      { id: 'recB', aportaHistorico: false },
    ])

    expect(deleteRecords).toHaveBeenCalledWith(TABLE_IDS.comparables, ['recA', 'recB'])
    expect(updateRecord).not.toHaveBeenCalled()
    expect(r).toEqual({ borrados: 2, desligados: 0, errores: 0 })
  })

  it('aporta_a_historico=true → desliga (PATCH solicitud:[]), no borra (RO-31)', async () => {
    const r = await purgarComparablesCapturados([
      { id: 'recH1', aportaHistorico: true },
      { id: 'recH2', aportaHistorico: true },
    ])

    expect(deleteRecords).not.toHaveBeenCalled()
    expect(updateRecord).toHaveBeenCalledWith(TABLE_IDS.comparables, 'recH1', { solicitud: [] })
    expect(updateRecord).toHaveBeenCalledWith(TABLE_IDS.comparables, 'recH2', { solicitud: [] })
    expect(r).toEqual({ borrados: 0, desligados: 2, errores: 0 })
  })

  it('mezcla: borra los falsy y desliga los true', async () => {
    deleteRecords.mockResolvedValue(1)

    const r = await purgarComparablesCapturados([
      { id: 'recDel', aportaHistorico: false },
      { id: 'recUnlink', aportaHistorico: true },
    ])

    expect(deleteRecords).toHaveBeenCalledWith(TABLE_IDS.comparables, ['recDel'])
    expect(updateRecord).toHaveBeenCalledWith(TABLE_IDS.comparables, 'recUnlink', { solicitud: [] })
    expect(r).toEqual({ borrados: 1, desligados: 1, errores: 0 })
  })

  it('lista vacía → no-op idempotente sin tocar Airtable', async () => {
    const r = await purgarComparablesCapturados([])

    expect(deleteRecords).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
    expect(r).toEqual({ borrados: 0, desligados: 0, errores: 0 })
  })

  it('si el DELETE falla, cuenta el error y NO re-lanza', async () => {
    deleteRecords.mockRejectedValue(new Error('502 airtable'))

    const r = await purgarComparablesCapturados([{ id: 'recA', aportaHistorico: false }])

    expect(r).toEqual({ borrados: 0, desligados: 0, errores: 1 })
  })

  it('si un desligado falla, cuenta el error, sigue con el resto y NO re-lanza', async () => {
    updateRecord
      .mockRejectedValueOnce(new Error('502 airtable'))
      .mockResolvedValueOnce({ id: 'recH2', createdTime: '', fields: {} })

    const r = await purgarComparablesCapturados([
      { id: 'recH1', aportaHistorico: true },
      { id: 'recH2', aportaHistorico: true },
    ])

    expect(r).toEqual({ borrados: 0, desligados: 1, errores: 1 })
  })
})
