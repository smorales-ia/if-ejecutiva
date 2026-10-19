import { beforeEach, describe, expect, it, vi } from 'vitest'

const listRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

import {
  _resetCacheDefaultsAntecedentes,
  evidenciasDe,
  hidratarSeccionE,
  leerDefaultsAntecedentes,
} from './defaults-antecedentes'
import { TABLE_IDS } from './field-ids'

const fila = (campo_destino: string, atributo: string, valor_default: string) => ({
  id: `rec${campo_destino}${atributo}`,
  createdTime: '',
  fields: { campo_destino, atributo, valor_default },
})

const B = {
  estadoConservacion: 'BUENO',
  pisosPropiedad: '1',
  supConstruida: '249.91',
  supPrimerPiso: '249.91',
  estacionamientos: '',
  bodegas: '',
  dormitorios: '4',
  banos: '4',
  mediosBanos: '1',
  banoServicio: '1',
  items: [
    { descripcion: 'Terreno', subtipo: 'Terreno', tipo: 'Terreno', situacionMunicipal: 'Regularizado', superficieM2: '1402.35' },
    { descripcion: 'Ampliación cocina', subtipo: 'Edificacion', tipo: 'Edificacion', situacionMunicipal: 'S/Reg Regularizable', superficieM2: '12' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  _resetCacheDefaultsAntecedentes()
})

describe('leerDefaultsAntecedentes', () => {
  it('agrupa las filas por campo y atributo y filtra por tipo × estado de uso', async () => {
    listRecords.mockResolvedValue([fila('cubierta', 'materialidad', 'PLANCHA METALICA'), fila('cubierta', 'calidad', 'BUENA')])

    const t = await leerDefaultsAntecedentes('Casa', false)

    expect(t).toEqual({ cubierta: { materialidad: 'PLANCHA METALICA', calidad: 'BUENA' } })
    const [tabla, params] = listRecords.mock.calls[0]
    expect(tabla).toBe(TABLE_IDS.defaultsAntecedentes)
    expect(params.filterByFormula).toContain('{estado_uso}="usado"')
    expect(params.filterByFormula).toContain('LOWER("Casa")')
  })

  it('cachea por tipo × estado de uso', async () => {
    listRecords.mockResolvedValue([])
    await leerDefaultsAntecedentes('Casa', false)
    await leerDefaultsAntecedentes('casa', false)
    expect(listRecords).toHaveBeenCalledTimes(1)
  })
})

describe('evidenciasDe · sólo datos', () => {
  it('toma los ítems del cuadro C y las ampliaciones que declaran', () => {
    const ev = evidenciasDe(B, { textos: ['Casa N°2100'], materiales: ['albanileria'] })

    expect(ev.textos).toEqual(expect.arrayContaining(['Casa N°2100', 'Terreno', 'Ampliación cocina']))
    expect(ev.materiales).toEqual(['albanileria'])
    expect(ev.ampliaciones).toEqual([
      { regulado: 'NO', pe: '', rif: '', regulacion: 'S/Reg Regularizable', m2: '12' },
    ])
  })
})

describe('hidratarSeccionE', () => {
  it('sin sección guardada: tabla + fórmulas + datos, y marca la sección pre-llenada', async () => {
    listRecords.mockResolvedValue([fila('estar', 'pavimento', 'PISO FLOTANTE')])

    const r = await hidratarSeccionE({ tipo: 'Casa', tipoPropiedad: 'usada' }, B, undefined, {
      textos: [],
      materiales: ['albanileria'],
    })

    expect(r.prellenada).toBe(true)
    expect(r.seccionE.terminaciones.estar).toMatchObject({ pavimento: 'PISO FLOTANTE', material: 'TIPO LAMINADO' })
    expect(r.seccionE.elementos.estructuraSoportante.materialidad).toBe('ALBAÑILERIA LADRILLO')
    expect(r.seccionE.habitaciones.n1.cantidades.dormSimple).toBe(4)
    expect(r.seccionE.ampliaciones[0].m2).toBe('12')
  })

  it('con sección guardada no lee la tabla y la devuelve tal cual', async () => {
    const guardada = (await hidratarSeccionE({ tipo: 'Casa', tipoPropiedad: 'usada' }, B, undefined)).seccionE
    vi.clearAllMocks()

    const r = await hidratarSeccionE({ tipo: 'Casa', tipoPropiedad: 'usada' }, B, guardada)

    expect(r.prellenada).toBe(false)
    expect(r.seccionE).toEqual(guardada)
    expect(listRecords).not.toHaveBeenCalled()
  })
})
