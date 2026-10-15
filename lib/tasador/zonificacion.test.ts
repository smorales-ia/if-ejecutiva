import { beforeEach, describe, expect, it, vi } from 'vitest'

const listRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

import { TABLE_IDS } from './field-ids'
import {
  _resetCacheZonificacion,
  resolverZona,
  zonasDeComuna,
  zonasDeComunaSinFallar,
} from './zonificacion'

function fila(id: string, zona?: string) {
  return { id, createdTime: '', fields: zona === undefined ? {} : { zona } }
}

beforeEach(() => {
  vi.clearAllMocks()
  _resetCacheZonificacion()
})

describe('zonasDeComuna · catálogo M_Zonificacion por comuna (§2.8.1)', () => {
  it('filtra por el Link comuna o, de respaldo, por clave_zona = comuna & zona; no por activo', async () => {
    listRecords.mockResolvedValue([])
    await zonasDeComuna('Colina')

    expect(listRecords).toHaveBeenCalledWith(TABLE_IDS.zonificacion, {
      fields: ['zona'],
      filterByFormula:
        'AND({zona}!="",OR(LOWER(ARRAYJOIN({comuna}))=LOWER("Colina"),' +
        'LOWER({clave_zona})=LOWER("Colina"&{zona})))',
    })
  })

  it('regresión 14-oct-2026: comunas cuya clave_zona no calza con el nombre se resuelven por el Link', async () => {
    // `CoihaiqueZONA Z2`, `Pedro Aguirre CerdaA` o `Maria PintoZ1` nunca
    // igualan "Coyhaique", "Pedro Aguirre Cerda" o "María Pinto" & zona: sólo
    // el Link las alcanza, así que la fórmula tiene que mirarlo.
    listRecords.mockResolvedValue([])
    await zonasDeComuna('Coyhaique')
    const formula = listRecords.mock.calls[0][1].filterByFormula as string
    expect(formula).toContain('LOWER(ARRAYJOIN({comuna}))=LOWER("Coyhaique")')
    expect(formula).not.toContain('{activo}')
  })

  it('escapa comillas del nombre de la comuna en las dos ramas', async () => {
    listRecords.mockResolvedValue([])
    await zonasDeComuna('La "Rara"')
    const formula = listRecords.mock.calls[0][1].filterByFormula as string
    expect(formula).toContain('LOWER(ARRAYJOIN({comuna}))=LOWER("La \\"Rara\\"")')
    expect(formula).toContain('LOWER("La \\"Rara\\""&{zona})')
  })

  it('ordena como la planilla (numérico dentro del texto) y quita duplicados y vacíos', async () => {
    listRecords.mockResolvedValue([
      fila('r1', 'A10a'),
      fila('r2', 'A2'),
      fila('r3', 'A1'),
      fila('r4', 'a1'),
      fila('r5'),
      fila('r6', 'B1a'),
    ])
    const zonas = await zonasDeComuna('Colina')
    expect(zonas.map((z) => z.zona)).toEqual(['A1', 'A2', 'A10a', 'B1a'])
    expect(zonas[0].id).toBe('r3')
  })

  it('comuna vacía o placeholder → lista vacía sin consultar', async () => {
    expect(await zonasDeComuna('')).toEqual([])
    expect(await zonasDeComuna('—')).toEqual([])
    expect(listRecords).not.toHaveBeenCalled()
  })

  it('cachea por comuna normalizada', async () => {
    listRecords.mockResolvedValue([fila('r1', 'A1')])
    await zonasDeComuna('Estación Central')
    await zonasDeComuna('estacion central')
    expect(listRecords).toHaveBeenCalledTimes(1)
  })

  it('la variante SinFallar devuelve [] si Airtable falla', async () => {
    listRecords.mockRejectedValue(new Error('503'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await zonasDeComunaSinFallar('Colina')).toEqual([])
  })
})

describe('resolverZona · lo que guarda el PATCH de /datos', () => {
  it('código del catálogo → grafía del catálogo y su recordId', async () => {
    listRecords.mockResolvedValue([fila('recA1', 'A1'), fila('recE2a', 'E2a')])
    expect(await resolverZona('e2a', 'Colina')).toEqual({ codigo: 'E2a', zonificacionId: 'recE2a' })
  })

  it('código fuera del catálogo → se guarda tal cual y el Link vacío (null)', async () => {
    listRecords.mockResolvedValue([fila('recA1', 'A1')])
    expect(await resolverZona('IPB', 'Colina')).toEqual({ codigo: 'IPB', zonificacionId: null })
  })

  it('texto viejo con la comuna → código solo', async () => {
    listRecords.mockResolvedValue([fila('recA1', 'A1')])
    expect(await resolverZona('A1 (Colina)', 'Colina')).toEqual({ codigo: 'A1', zonificacionId: 'recA1' })
  })

  it('vacío → código vacío y Link vacío', async () => {
    listRecords.mockResolvedValue([fila('recA1', 'A1')])
    expect(await resolverZona('', 'Colina')).toEqual({ codigo: '', zonificacionId: null })
  })

  it('catálogo ilegible → guarda el código y deja el Link sin tocar (undefined)', async () => {
    listRecords.mockRejectedValue(new Error('503'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await resolverZona('A1 (Colina)', 'Colina')).toEqual({ codigo: 'A1', zonificacionId: undefined })
  })
})
