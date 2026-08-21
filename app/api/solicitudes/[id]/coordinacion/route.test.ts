import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AirtableError } from '@/lib/airtable-client'
import type { CoordinacionSolicitud } from '@/lib/coordinacion-airtable'

/**
 * C2 · bloque 1 — contrato de `GET /api/solicitudes/[id]/coordinacion`.
 *
 * La ruta es un pasamanos deliberado: valida el `[id]`, delega en el reader y
 * sirve el payload al ras. Lo que se prueba acá es justo lo que el reader no
 * puede probar — el 404 del id mal formado, que un fallo **no** se convierta en
 * un riel vacío, y que el cuerpo no venga envuelto en `{ data }`.
 */

const fetchCoordinacionSolicitud = vi.fn()

vi.mock('@/lib/coordinacion-airtable', () => ({
  fetchCoordinacionSolicitud: (id: string) => fetchCoordinacionSolicitud(id),
}))

// Import estático: `vi.mock` se iza sobre los imports, así que el mock ya está
// puesto cuando la ruta se evalúa.
import { GET } from './route'

const ID = 'rec9qf3DchOY5Lk2N'

const RESPUESTA: CoordinacionSolicitud = {
  coordinacionVigente: 'confirmada',
  intentos: [
    {
      id: 'recE7iW1JvR6ynIig',
      solicitudId: ID,
      estado: 'confirmada',
      intentoNumero: 1,
      fechaRespuesta: '2026-08-21T17:00:00.000Z',
      fechaVisita: '2026-08-25',
      nota: 'Seed FRENTE-C · propietario disponible en la mañana.',
    },
  ],
}

function llamar(id = ID) {
  return GET({} as never, { params: Promise.resolve({ id }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchCoordinacionSolicitud.mockResolvedValue(RESPUESTA)
})

describe('identidad del [id]', () => {
  it('pasa el record ID al reader tal cual', async () => {
    await llamar()

    expect(fetchCoordinacionSolicitud).toHaveBeenCalledWith(ID)
  })

  it('responde 404 ante un id que no es record ID, sin tocar Airtable', async () => {
    // El código de la solicitud no sirve acá: la tabla se filtra por el lookup
    // `solicitud_record_id`. Ver DUDA-2 de la propuesta del bloque.
    const res = await llamar('VP-2026-0054')

    expect(res.status).toBe(404)
    expect(fetchCoordinacionSolicitud).not.toHaveBeenCalled()
  })
})

describe('200', () => {
  it('sirve el payload al ras, sin envolver en { data }', async () => {
    const res = await llamar()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(RESPUESTA)
  })

  it('sin intentos devuelve null y lista vacía (RO-34)', async () => {
    fetchCoordinacionSolicitud.mockResolvedValue({
      coordinacionVigente: null,
      intentos: [],
    })

    const res = await llamar()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ coordinacionVigente: null, intentos: [] })
  })
})

describe('errores', () => {
  it('un fallo de Airtable sale por 502 y no como riel vacío', async () => {
    fetchCoordinacionSolicitud.mockRejectedValue(new AirtableError(502, 'upstream caído'))

    const res = await llamar()
    const cuerpo = await res.json()

    expect(res.status).toBe(502)
    expect(cuerpo.intentos).toBeUndefined()
    // §6.1 · nada de jerga técnica hacia la persona.
    expect(cuerpo.error).toBe(
      'No pudimos completar la acción. Intenta nuevamente en unos segundos.'
    )
  })

  it('un fallo que no es de Airtable sale por 500', async () => {
    fetchCoordinacionSolicitud.mockRejectedValue(new Error('boom'))

    const res = await llamar()

    expect(res.status).toBe(500)
  })
})
