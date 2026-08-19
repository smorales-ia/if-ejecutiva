import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P4-TAS · bloque 4+5 — `GET /api/tasaciones/config/motivos-devolucion`.
 *
 * La ruta es fina a propósito: toda la lógica vive en `opcionesDeSingleSelect`,
 * que tiene su propio archivo. Acá se fija lo que **sólo la ruta** decide —qué
 * tabla y qué campo consulta, y que un fallo no degrada a lista vacía—, que es
 * justamente lo que rompería A-17 sin que nada fallara.
 */

const opcionesDeSingleSelect = vi.fn()

vi.mock('@/lib/tasador/schema-airtable', () => ({
  opcionesDeSingleSelect: (...args: unknown[]) => opcionesDeSingleSelect(...args),
}))

import { GET } from './route'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { TABLE_IDS } from '@/lib/tasador/field-ids'

const CATALOGO = ['Teléfono no contesta', 'Otro']

beforeEach(() => {
  vi.clearAllMocks()
  opcionesDeSingleSelect.mockResolvedValue(CATALOGO)
})

it('devuelve el catálogo tal como lo entrega el schema', async () => {
  const res = await GET()

  expect(res.status).toBe(200)
  await expect(res.json()).resolves.toEqual({ data: CATALOGO })
})

it('consulta TX_CoordinacionVisita.motivo, no otra tabla', async () => {
  await GET()

  expect(opcionesDeSingleSelect).toHaveBeenCalledWith(
    TABLE_IDS.coordinacionVisita,
    'fld0rkrlg9Xo0fFVm',
  )
})

describe('ante fallo', () => {
  it('responde 502 con literal humano, no 200 con lista vacía', async () => {
    opcionesDeSingleSelect.mockRejectedValue(new Error('Meta API caída'))

    const res = await GET()

    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toMatchObject({
      error: MENSAJES.catalogoNoDisponible,
    })
  })

  it('no expone el error técnico al cliente (§6.5)', async () => {
    opcionesDeSingleSelect.mockRejectedValue(new Error('AIRTABLE_TOKEN inválido'))

    const res = await GET()
    const cuerpo = JSON.stringify(await res.json())

    expect(cuerpo).not.toContain('AIRTABLE_TOKEN')
    expect(cuerpo).not.toContain('Meta API')
  })
})
