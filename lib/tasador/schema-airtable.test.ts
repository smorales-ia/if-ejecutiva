import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P4-TAS · bloque 4+5 — `opcionesDeSingleSelect`.
 *
 * Es el primer consumo de **Meta API** del repositorio, así que lo que hay que
 * fijar acá no es sólo el camino feliz sino los tres modos de fallo que la
 * distinguen de una lectura de registros: schema inaccesible, campo ausente y
 * campo del tipo equivocado. Los tres tienen que **lanzar**, no degradar: un
 * catálogo vacío en la UI es indistinguible de «no hay motivos».
 */

import { _resetCacheSchema, opcionesDeSingleSelect } from './schema-airtable'

const TABLA = 'tblBwMErRxo57ML2r'
const CAMPO = 'fld0rkrlg9Xo0fFVm'

const SCHEMA_OK = {
  tables: [
    {
      id: TABLA,
      name: 'TX_CoordinacionVisita',
      fields: [
        { id: 'fldOTRO', name: 'detalle', type: 'multilineText' },
        {
          id: CAMPO,
          name: 'motivo',
          type: 'singleSelect',
          options: {
            choices: [
              { id: 'sel1', name: 'Teléfono no contesta' },
              { id: 'sel2', name: 'Teléfono equivocado' },
              { id: 'sel3', name: 'Cliente rechaza visita' },
              { id: 'sel4', name: 'Otro' },
            ],
          },
        },
      ],
    },
  ],
}

function respuesta(cuerpo: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => cuerpo } as unknown as Response
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  _resetCacheSchema()
  process.env.AIRTABLE_BASE_ID = 'app9G7lLkIV3CpeLa'
  process.env.AIRTABLE_TOKEN = 'pat-de-prueba'
  fetchMock = vi.fn().mockResolvedValue(respuesta(SCHEMA_OK))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  _resetCacheSchema()
})

describe('camino feliz', () => {
  it('devuelve los nombres de las opciones en el orden de Airtable', async () => {
    const motivos = await opcionesDeSingleSelect(TABLA, CAMPO)

    expect(motivos).toEqual([
      'Teléfono no contesta',
      'Teléfono equivocado',
      'Cliente rechaza visita',
      'Otro',
    ])
  })

  it('pega a la Meta API, no al endpoint de registros', async () => {
    await opcionesDeSingleSelect(TABLA, CAMPO)

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('/v0/meta/bases/')
    expect(url).not.toContain(`/v0/app9G7lLkIV3CpeLa/${TABLA}`)
  })

  it('descarta opciones con nombre vacío', async () => {
    fetchMock.mockResolvedValue(
      respuesta({
        tables: [
          {
            id: TABLA,
            fields: [
              {
                id: CAMPO,
                type: 'singleSelect',
                options: { choices: [{ name: 'Otro' }, { name: '   ' }, {}] },
              },
            ],
          },
        ],
      }),
    )

    await expect(opcionesDeSingleSelect(TABLA, CAMPO)).resolves.toEqual(['Otro'])
  })
})

describe('caché TTL', () => {
  it('dos llamadas seguidas hacen un solo fetch', async () => {
    await opcionesDeSingleSelect(TABLA, CAMPO)
    await opcionesDeSingleSelect(TABLA, CAMPO)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('vuelve a pedir pasado el TTL de 5 minutos', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-08-19T10:00:00.000Z'))
      await opcionesDeSingleSelect(TABLA, CAMPO)

      vi.setSystemTime(new Date('2026-08-19T10:05:01.000Z'))
      await opcionesDeSingleSelect(TABLA, CAMPO)

      expect(fetchMock).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('cachea por par tabla+campo, no globalmente', async () => {
    await opcionesDeSingleSelect(TABLA, CAMPO)
    await opcionesDeSingleSelect(TABLA, 'fldOTRO').catch(() => {})

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('modos de fallo · lanzan, no degradan', () => {
  it('propaga el status cuando la Meta API responde 403', async () => {
    fetchMock.mockResolvedValue(respuesta({}, false, 403))

    await expect(opcionesDeSingleSelect(TABLA, CAMPO)).rejects.toMatchObject({
      status: 403,
    })
  })

  it('lanza 404 si la tabla no está en el schema', async () => {
    await expect(
      opcionesDeSingleSelect('tblNOEXISTE00000', CAMPO),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('lanza 404 si el campo no está en la tabla', async () => {
    await expect(
      opcionesDeSingleSelect(TABLA, 'fldNOEXISTE00000'),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('lanza 422 si el campo no es un singleSelect', async () => {
    await expect(opcionesDeSingleSelect(TABLA, 'fldOTRO')).rejects.toMatchObject({
      status: 422,
    })
  })

  it('no cachea un fallo', async () => {
    fetchMock.mockResolvedValueOnce(respuesta({}, false, 500))
    await expect(opcionesDeSingleSelect(TABLA, CAMPO)).rejects.toBeDefined()

    fetchMock.mockResolvedValue(respuesta(SCHEMA_OK))
    await expect(opcionesDeSingleSelect(TABLA, CAMPO)).resolves.toHaveLength(4)
  })
})
