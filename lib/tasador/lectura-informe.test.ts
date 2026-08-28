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
