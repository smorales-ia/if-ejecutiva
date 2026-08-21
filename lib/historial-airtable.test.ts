import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CoordinacionSolicitud, IntentoCoordinacion } from '@/lib/coordinacion'

/**
 * C4 · bloque 1 — la coordinación dentro del riel de §1.3.3.
 *
 * Primer test de este módulo. Lo que se cuida es que la tercera fuente no rompa
 * las dos que ya estaban: que el riel siga siendo **cronológico y no agrupado
 * por origen**, que cero intentos no agregue filas fantasma (RO-34) y que un
 * fallo de lectura se propague en vez de servir dos tercios del historial como
 * si fuera completo.
 */

const listRecords = vi.fn()
const fetchCoordinacionSolicitud = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

vi.mock('@/lib/coordinacion-airtable', () => ({
  fetchCoordinacionSolicitud: (id: string) => fetchCoordinacionSolicitud(id),
}))

import { fetchCoordinacionParaHistorial, fetchHistorialSolicitud } from './historial-airtable'

const ID = 'rec9qf3DchOY5Lk2N'
const CODIGO = 'VP-2026-0061'

/** Fijo, para que `relativeTime` no dependa de cuándo corra el test. */
const AHORA = new Date('2026-08-22T12:00:00.000Z')

function intento(extra: Partial<IntentoCoordinacion> = {}): IntentoCoordinacion {
  return {
    id: 'recE7iW1JvR6ynIig',
    solicitudId: ID,
    estado: 'confirmada',
    intentoNumero: 1,
    fechaRespuesta: '2026-08-21T17:00:00.000Z',
    fechaVisita: '2026-08-25',
    ...extra,
  }
}

function conCoordinacion(...intentos: IntentoCoordinacion[]) {
  const datos: CoordinacionSolicitud = {
    coordinacionVigente: intentos[0]?.estado ?? null,
    intentos,
  }
  fetchCoordinacionSolicitud.mockResolvedValue(datos)
}

/** `A_Eventos` y `A_Cambios` comparten el mock de `listRecords`, en ese orden. */
function conTablas(eventos: unknown[], cambios: unknown[]) {
  listRecords.mockImplementation((tableId: string) =>
    Promise.resolve(tableId === 'tblMKmDg2KrO5fMn8' ? eventos : cambios)
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(AHORA)
  vi.clearAllMocks()
  conTablas([], [])
  conCoordinacion()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('fetchCoordinacionParaHistorial', () => {
  it('proyecta el intento al riel con su origen, su icono y su instante', async () => {
    conCoordinacion(intento())

    const [item, ...resto] = await fetchCoordinacionParaHistorial(ID)

    expect(resto).toHaveLength(0)
    // El id es el de la fila de TX_CoordinacionVisita: es la key del <li> y no
    // puede colisionar con las de A_Eventos.
    expect(item.id).toBe('recE7iW1JvR6ynIig')
    expect(item.origen).toBe('coordinacion')
    expect(item.icono).toBe('phone')
    // `fecha_respuesta` es la clave de orden del riel: si no viaja como
    // `timestamp`, el ítem se hunde al fondo sin que nada falle.
    expect(item.timestamp).toBe('2026-08-21T17:00:00.000Z')
    expect(item.titulo).toBe('Visita confirmada para el 25 ago 2026')
    // §6.1 · `autor_clerk_id` no se muestra: es jerga técnica.
    expect(item.autor).toBeUndefined()
  })

  it('delega la lectura en el reader de C2, sin filtrar por su cuenta', async () => {
    await fetchCoordinacionParaHistorial(ID)

    expect(fetchCoordinacionSolicitud).toHaveBeenCalledWith(ID)
    // Ni una lectura propia de la tabla: duplicar el filterByFormula sería un
    // segundo sitio donde el filtro se puede romper.
    expect(listRecords).not.toHaveBeenCalled()
  })
})

describe('fetchHistorialSolicitud', () => {
  it('funde los tres orígenes por timestamp, sin agrupar por procedencia', async () => {
    conTablas(
      [
        {
          id: 'recEVENTOOOOOOOO',
          createdTime: '2026-08-22T09:00:00.000Z',
          fields: { tipo_evento: 'tasador_asignado', descripcion: 'Tasador asignado' },
        },
      ],
      [
        {
          id: 'recCAMBIOOOOOOOO',
          createdTime: '2026-08-20T08:00:00.000Z',
          fields: {
            campo_modificado: 'direccion',
            valor_nuevo: 'Av. Apoquindo 5230',
            timestamp: '2026-08-20T08:00:00.000Z',
          },
        },
      ]
    )
    conCoordinacion(intento())

    const riel = await fetchHistorialSolicitud(ID, CODIGO)

    // Evento (22) → coordinación (21) → cambio (20). Intercalado, no por bloques.
    expect(riel.map((i) => i.origen)).toEqual(['evento', 'coordinacion', 'cambio'])
  })

  it('sin intentos el riel no gana filas fantasma (RO-34)', async () => {
    conTablas(
      [
        {
          id: 'recEVENTOOOOOOOO',
          createdTime: '2026-08-22T09:00:00.000Z',
          fields: { tipo_evento: 'solicitud_creada' },
        },
      ],
      []
    )
    conCoordinacion()

    const riel = await fetchHistorialSolicitud(ID, CODIGO)

    // Ni una fila "sin coordinar": el timeline es lo que pasó, y no pasó nada.
    expect(riel).toHaveLength(1)
    expect(riel.some((i) => i.origen === 'coordinacion')).toBe(false)
  })

  it('un fallo leyendo coordinación propaga en vez de servir el riel a medias', async () => {
    conTablas(
      [
        {
          id: 'recEVENTOOOOOOOO',
          createdTime: '2026-08-22T09:00:00.000Z',
          fields: { tipo_evento: 'solicitud_creada' },
        },
      ],
      []
    )
    fetchCoordinacionSolicitud.mockRejectedValue(new Error('Airtable 502'))

    // Consecuencia asumida desde C4: TX_CoordinacionVisita ilegible deja el
    // timeline entero en error. Un historial incompleto que se ve completo es
    // peor, porque la Ejecutiva no tiene forma de saber que le falta un tercio.
    await expect(fetchHistorialSolicitud(ID, CODIGO)).rejects.toThrow('Airtable 502')
  })
})
