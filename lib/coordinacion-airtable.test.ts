import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FIELD_IDS_COORDINACION_VISITA, TABLE_IDS } from '@/lib/tasador/field-ids'

/**
 * C2 · bloque 1 — contrato de `fetchCoordinacionSolicitud`.
 *
 * Los dos invariantes que se cuidan acá son el de **RO-34** (cero filas devuelve
 * `null`, no un desenlace neutro) y el del **orden**, del que depende
 * `coordinacionVigente`: si `intentos[0]` deja de ser el más reciente, el bloque
 * de coordinación de IF-02 muestra un desenlace viejo sin que nada falle.
 */

const listRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  // `isValidRecordId` se conserva real: el reader lo usa para cortar antes de
  // la lectura, y falsearlo probaría el mock en vez del módulo.
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

import { fetchCoordinacionSolicitud } from './coordinacion-airtable'

const F = FIELD_IDS_COORDINACION_VISITA

/** La solicitud de la seed de validación del bloque. */
const SOLICITUD = 'rec9qf3DchOY5Lk2N'

/** La fila real de `TX_CoordinacionVisita`, verificada vía MCP el 21-ago-2026. */
const SEED = {
  id: 'recE7iW1JvR6ynIig',
  createdTime: '2026-08-21T17:00:00.000Z',
  fields: {
    [F.estadoCoordinacion]: 'confirmada',
    [F.solicitudRecordId]: [SOLICITUD],
    [F.intentoNumero]: 1,
    [F.fechaRespuesta]: '2026-08-21T17:00:00.000Z',
    [F.fechaVisitaPropuesta]: '2026-08-25',
    [F.nota]: 'Seed FRENTE-C · propietario disponible en la mañana.',
  },
}

function conFilas(...records: unknown[]) {
  listRecords.mockResolvedValue(records)
}

beforeEach(() => {
  vi.clearAllMocks()
  conFilas()
})

describe('lectura de la seed', () => {
  it('proyecta la rama confirmada completa', async () => {
    conFilas(SEED)

    const { coordinacionVigente, intentos } = await fetchCoordinacionSolicitud(SOLICITUD)

    expect(coordinacionVigente).toBe('confirmada')
    expect(intentos).toHaveLength(1)
    expect(intentos[0]).toEqual({
      id: 'recE7iW1JvR6ynIig',
      solicitudId: SOLICITUD,
      estado: 'confirmada',
      intentoNumero: 1,
      fechaRespuesta: '2026-08-21T17:00:00.000Z',
      fechaVisita: '2026-08-25',
      nota: 'Seed FRENTE-C · propietario disponible en la mañana.',
      motivo: undefined,
      detalle: undefined,
    })
  })

  it('filtra por el lookup solicitud_record_id, no por el Link', async () => {
    await fetchCoordinacionSolicitud(SOLICITUD)

    const [tableId, params] = listRecords.mock.calls[0]
    expect(tableId).toBe(TABLE_IDS.coordinacionVisita)
    // Un Link dentro de un filterByFormula se evalúa contra `codigo_solicitud`
    // y devolvería cero filas siempre (E-076/E-077).
    expect(params.filterByFormula).toContain('{solicitud_record_id}')
    expect(params.filterByFormula).toContain(SOLICITUD)
  })
})

describe('ausencia (RO-34)', () => {
  it('cero filas devuelve null y lista vacía, no un desenlace neutro', async () => {
    const resultado = await fetchCoordinacionSolicitud(SOLICITUD)

    expect(resultado).toEqual({ coordinacionVigente: null, intentos: [] })
  })

  it('un id fuera de formato no llega a Airtable', async () => {
    const resultado = await fetchCoordinacionSolicitud('VP-2026-0054')

    expect(resultado).toEqual({ coordinacionVigente: null, intentos: [] })
    expect(listRecords).not.toHaveBeenCalled()
  })
})

describe('orden', () => {
  it('ordena por fecha_respuesta descendente y toma el más reciente como vigente', async () => {
    const viejo = {
      id: 'recVIEJOOOOOOOOOO',
      createdTime: '2026-08-19T12:00:00.000Z',
      fields: {
        [F.estadoCoordinacion]: 'rechazada',
        [F.solicitudRecordId]: [SOLICITUD],
        [F.intentoNumero]: 1,
        [F.fechaRespuesta]: '2026-08-19T12:00:00.000Z',
        [F.motivo]: 'No contesta',
        [F.detalle]: 'Se llamó tres veces sin respuesta durante la mañana.',
      },
    }

    // Llegan al revés a propósito: el orden lo impone el reader, no la query.
    conFilas(viejo, SEED)

    const { coordinacionVigente, intentos } = await fetchCoordinacionSolicitud(SOLICITUD)

    expect(intentos.map((i) => i.id)).toEqual(['recE7iW1JvR6ynIig', 'recVIEJOOOOOOOOOO'])
    expect(coordinacionVigente).toBe('confirmada')
  })
})

describe('rama rechazada', () => {
  it('proyecta motivo y detalle, y deja fechaVisita ausente', async () => {
    conFilas({
      id: 'recRECHAZADAAAAA',
      createdTime: '2026-08-20T15:30:00.000Z',
      fields: {
        [F.estadoCoordinacion]: 'rechazada',
        [F.solicitudRecordId]: [SOLICITUD],
        [F.intentoNumero]: 2,
        [F.fechaRespuesta]: '2026-08-20T15:30:00.000Z',
        [F.motivo]: 'Teléfono equivocado',
        [F.detalle]: 'El número corresponde a otra persona, no al propietario.',
      },
    })

    const { coordinacionVigente, intentos } = await fetchCoordinacionSolicitud(SOLICITUD)

    expect(coordinacionVigente).toBe('rechazada')
    expect(intentos[0].motivo).toBe('Teléfono equivocado')
    expect(intentos[0].detalle).toBe(
      'El número corresponde a otra persona, no al propietario.'
    )
    expect(intentos[0].fechaVisita).toBeUndefined()
    expect(intentos[0].nota).toBeUndefined()
  })

  it('pasa el motivo tal cual lo emitió Airtable (A-17)', async () => {
    // Un motivo agregado desde la UI de Airtable tiene que llegar sin deploy:
    // el dominio lo posee el singleSelect, no este código.
    conFilas({
      id: 'recMOTIVONUEVOO0',
      createdTime: '2026-08-20T15:30:00.000Z',
      fields: {
        [F.estadoCoordinacion]: 'rechazada',
        [F.solicitudRecordId]: [SOLICITUD],
        [F.intentoNumero]: 1,
        [F.fechaRespuesta]: '2026-08-20T15:30:00.000Z',
        [F.motivo]: 'Motivo inventado que no está en ningún enum del repo',
        [F.detalle]: 'Detalle largo que supera los veinte caracteres exigidos.',
      },
    })

    const { intentos } = await fetchCoordinacionSolicitud(SOLICITUD)

    expect(intentos[0].motivo).toBe('Motivo inventado que no está en ningún enum del repo')
  })
})

describe('estado fuera de dominio (defensivo)', () => {
  it('no rompe y no fija coordinacionVigente', async () => {
    conFilas({
      id: 'recRAROOOOOOOOOO',
      createdTime: '2026-08-21T18:00:00.000Z',
      fields: {
        [F.estadoCoordinacion]: 'reagendada',
        [F.solicitudRecordId]: [SOLICITUD],
        [F.intentoNumero]: 2,
        [F.fechaRespuesta]: '2026-08-21T18:00:00.000Z',
      },
    })

    const { coordinacionVigente, intentos } = await fetchCoordinacionSolicitud(SOLICITUD)

    // La fila viaja —no se descarta—, pero su estado es "no hay dato".
    expect(intentos).toHaveLength(1)
    expect(intentos[0].estado).toBeNull()
    expect(coordinacionVigente).toBeNull()
  })

  it('un estado fuera de dominio en el intento más reciente tapa al anterior', async () => {
    conFilas(SEED, {
      id: 'recRAROOOOOOOOOO',
      createdTime: '2026-08-21T18:00:00.000Z',
      fields: {
        [F.estadoCoordinacion]: '',
        [F.solicitudRecordId]: [SOLICITUD],
        [F.intentoNumero]: 2,
        [F.fechaRespuesta]: '2026-08-21T18:00:00.000Z',
      },
    })

    const { coordinacionVigente, intentos } = await fetchCoordinacionSolicitud(SOLICITUD)

    // Deliberado: `coordinacionVigente` es el desenlace del último intento, no
    // "el último desenlace conocido". Heredar el estado de un intento anterior
    // sería inventar que la coordinación sigue confirmada.
    expect(intentos[0].id).toBe('recRAROOOOOOOOOO')
    expect(coordinacionVigente).toBeNull()
  })
})

describe('errores', () => {
  it('propaga el fallo de lectura en vez de degradar a lista vacía', async () => {
    listRecords.mockRejectedValue(new Error('Airtable 502'))

    await expect(fetchCoordinacionSolicitud(SOLICITUD)).rejects.toThrow('Airtable 502')
  })
})
