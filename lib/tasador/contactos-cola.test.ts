import { beforeEach, describe, expect, it, vi } from 'vitest'
// `vi.mock` se iza sobre los imports, así que el módulo bajo prueba entra ya
// mockeado. Import estático y no `await import()`: es el patrón de los tests de
// Route Handler del repo, y el `tsconfig` no admite top-level await.
import { TX_CONTACTOS_VISITA, telefonosPrioritarios } from './contactos-cola'

/**
 * P3-TAS.A · **CI-035** — el teléfono de la card sale de `TX_ContactosVisita`.
 *
 * ## Por qué esta lectura merece tests propios
 *
 * Es el dato más importante de la Pantalla 1 desde que **RO-29** dejó la
 * coordinación en manos del teléfono, y llega por un camino con tres formas de
 * fallar en silencio: el lookup puede venir como array o como texto, la
 * prioridad puede faltar, y el contacto puede estar marcado como erróneo. Los
 * tres casos devuelven un teléfono plausible si nadie los mira — y un teléfono
 * plausible bajo un `href="tel:"` es una llamada perdida, no un error visible.
 *
 * ## El caso que motivó la ficha
 *
 * La única solicitud de la cola del tasador mock (VP-2026-0058) **no tiene**
 * `vendedor_telefono` y **sí** tiene contacto de prioridad 1. Antes de esta
 * tanda la card renderizaba `href="tel:"` vacío. El último test de este archivo
 * es ese caso, con los datos reales que devolvió Airtable.
 */

const listRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
    listRecords: (...args: unknown[]) => listRecords(...args),
  }
})

interface FilaContacto {
  telefono?: string
  orden_prioridad?: number
  estado_contacto?: string
  solicitud_record_id?: string[]
}

function fila(fields: FilaContacto, id = `rec${Math.random().toString(36).slice(2, 16)}`) {
  return { id, createdTime: '2026-08-19T00:00:00.000Z', fields }
}

const SOLICITUD = 'recvtkiqSUPzTKEQ0'

beforeEach(() => {
  listRecords.mockReset()
  listRecords.mockResolvedValue([])
})

describe('telefonosPrioritarios · consulta', () => {
  it('no toca Airtable si no hay solicitudes que resolver', async () => {
    expect(await telefonosPrioritarios([])).toEqual(new Map())
    expect(listRecords).not.toHaveBeenCalled()
  })

  it('resuelve toda la cola en UNA sola llamada — el motivo de CI-035', async () => {
    await telefonosPrioritarios([SOLICITUD, 'recAAAAAAAAAAAAAA', 'recBBBBBBBBBBBBBB'])
    expect(listRecords).toHaveBeenCalledTimes(1)
    expect(listRecords.mock.calls[0][0]).toBe(TX_CONTACTOS_VISITA)
  })

  it('filtra por el lookup solicitud_record_id, no por el Link', async () => {
    await telefonosPrioritarios([SOLICITUD])
    const { filterByFormula } = listRecords.mock.calls[0][1]
    expect(filterByFormula).toContain('solicitud_record_id')
    // El Link se resolvería al primary field (`codigo_solicitud`) — lección E-018.
    expect(filterByFormula).not.toContain('{solicitud}')
  })

  /** Un FIND suelto haría match parcial el día que dos ids compartan prefijo. */
  it('delimita el recordId con comas a ambos lados', async () => {
    await telefonosPrioritarios([SOLICITUD])
    expect(listRecords.mock.calls[0][1].filterByFormula).toContain(`",${SOLICITUD},"`)
  })

  it('deduplica ids y descarta lo que no es un recordId', async () => {
    await telefonosPrioritarios([SOLICITUD, SOLICITUD, '', 'VP-2026-0058'])
    const { filterByFormula } = listRecords.mock.calls[0][1]
    expect(filterByFormula.match(new RegExp(SOLICITUD, 'g'))).toHaveLength(1)
    expect(filterByFormula).not.toContain('VP-2026-0058')
  })
})

describe('telefonosPrioritarios · elección del contacto', () => {
  it('se queda con el de menor orden_prioridad, llegue en el orden que llegue', async () => {
    listRecords.mockResolvedValue([
      fila({ telefono: '930396393', orden_prioridad: 3, solicitud_record_id: [SOLICITUD] }),
      fila({ telefono: '+56968446600', orden_prioridad: 1, solicitud_record_id: [SOLICITUD] }),
      fila({ telefono: '222334455', orden_prioridad: 2, solicitud_record_id: [SOLICITUD] }),
    ])
    expect((await telefonosPrioritarios([SOLICITUD])).get(SOLICITUD)).toBe('+56968446600')
  })

  it('ignora contactos sin teléfono aunque sean prioridad 1', async () => {
    listRecords.mockResolvedValue([
      fila({ telefono: '   ', orden_prioridad: 1, solicitud_record_id: [SOLICITUD] }),
      fila({ telefono: '930396393', orden_prioridad: 2, solicitud_record_id: [SOLICITUD] }),
    ])
    expect((await telefonosPrioritarios([SOLICITUD])).get(SOLICITUD)).toBe('930396393')
  })

  it('descarta el teléfono marcado como erróneo — es el estado que el campo existe para registrar', async () => {
    listRecords.mockResolvedValue([
      fila({
        telefono: '900000000',
        orden_prioridad: 1,
        estado_contacto: 'telefono_erroneo',
        solicitud_record_id: [SOLICITUD],
      }),
      fila({
        telefono: '930396393',
        orden_prioridad: 2,
        estado_contacto: 'valido',
        solicitud_record_id: [SOLICITUD],
      }),
    ])
    expect((await telefonosPrioritarios([SOLICITUD])).get(SOLICITUD)).toBe('930396393')
  })

  it('si el único contacto no trae orden_prioridad, igual devuelve su teléfono', async () => {
    listRecords.mockResolvedValue([
      fila({ telefono: '930396393', solicitud_record_id: [SOLICITUD] }),
    ])
    expect((await telefonosPrioritarios([SOLICITUD])).get(SOLICITUD)).toBe('930396393')
  })

  it('el contacto sin prioridad pierde contra uno que sí la trae', async () => {
    listRecords.mockResolvedValue([
      fila({ telefono: '900000000', solicitud_record_id: [SOLICITUD] }),
      fila({ telefono: '930396393', orden_prioridad: 9, solicitud_record_id: [SOLICITUD] }),
    ])
    expect((await telefonosPrioritarios([SOLICITUD])).get(SOLICITUD)).toBe('930396393')
  })

  it('no mezcla contactos entre solicitudes', async () => {
    const otra = 'recjPkLir5FNaQZWy'
    listRecords.mockResolvedValue([
      fila({ telefono: '111111111', orden_prioridad: 1, solicitud_record_id: [SOLICITUD] }),
      fila({ telefono: '222222222', orden_prioridad: 1, solicitud_record_id: [otra] }),
    ])
    const mapa = await telefonosPrioritarios([SOLICITUD, otra])
    expect(mapa.get(SOLICITUD)).toBe('111111111')
    expect(mapa.get(otra)).toBe('222222222')
  })

  it('descarta la fila cuyo lookup no resuelve a ninguna solicitud', async () => {
    listRecords.mockResolvedValue([
      fila({ telefono: '111111111', orden_prioridad: 1, solicitud_record_id: [] }),
    ])
    expect(await telefonosPrioritarios([SOLICITUD])).toEqual(new Map())
  })
})

describe('telefonosPrioritarios · degradación', () => {
  /**
   * La cola entera no se cae porque no se pudo resolver un teléfono: la card
   * omite la línea y el resto de la pantalla sigue siendo utilizable.
   */
  it('un fallo de Airtable devuelve mapa vacío y no lanza', async () => {
    listRecords.mockRejectedValue(new Error('Airtable 503'))
    await expect(telefonosPrioritarios([SOLICITUD])).resolves.toEqual(new Map())
  })

  /** Control negativo: sin él, todo lo anterior pasaría con una función que devuelve Map(). */
  it('el camino feliz sí devuelve algo', async () => {
    listRecords.mockResolvedValue([
      fila({ telefono: '+56968446600', orden_prioridad: 1, solicitud_record_id: [SOLICITUD] }),
    ])
    expect((await telefonosPrioritarios([SOLICITUD])).size).toBe(1)
  })
})
