import { describe, expect, it } from 'vitest'
import {
  NO_REGISTRA,
  SII_LEGALES_VACIO,
  SIN_DATO,
  construirSiiLegales,
  formatoFecha,
  formatoPesos,
  superficieConstruidaVigente,
} from '@/lib/sii-legales'

describe('superficie construida de la consola · fuente única (T-SUPERFICIES-CONSOLIDADAS)', () => {
  it('lee TX_DatosTasacion.sup_construccion_m2 y gana sobre la columna antigua de la solicitud', () => {
    const { sii } = construirSiiLegales([], { sup_construccion_m2: 249.91 }, null)
    expect(sii.supConstruccionM2).toBe(249.91)
    expect(superficieConstruidaVigente(sii, 120)).toBe(249.91)
  })

  it('sin dato en TX_DatosTasacion cae a la columna antigua; cero cuenta como vacío', () => {
    expect(superficieConstruidaVigente(SII_LEGALES_VACIO.sii, 47.61)).toBe(47.61)
    expect(superficieConstruidaVigente(SII_LEGALES_VACIO.sii, 0)).toBeNull()
    expect(superficieConstruidaVigente(SII_LEGALES_VACIO.sii, undefined)).toBeNull()
    expect(construirSiiLegales([], { sup_construccion_m2: 0 }, null).sii.supConstruccionM2).toBeNull()
  })
})

describe('construirSiiLegales · sin datos no se inventa nada (PRD R3)', () => {
  it('sin filas todo queda en «—» y sin unidades', () => {
    const { sii, legales } = SII_LEGALES_VACIO
    expect(sii.unidades).toEqual([])
    expect(sii.avaluoTotal).toBe(SIN_DATO)
    expect(sii.contribucionAnual).toBe(SIN_DATO)
    expect(sii.destinoPrincipal).toBe(SIN_DATO)
    expect(Object.values(legales).every((v) => v === SIN_DATO)).toBe(true)
  })

  it('nunca aparecen los valores del mock retirado', () => {
    const json = JSON.stringify(SII_LEGALES_VACIO)
    for (const mock of ['108-2009', '12.345', '8.901', '1.200 UF', '18,4 UF']) {
      expect(json).not.toContain(mock)
    }
  })
})

describe('construirSiiLegales · caso real VP-2026-0079 (MET-6283)', () => {
  const resultado = construirSiiLegales(
    [{ id: 'receXRGWbpYBg26xl', numero_unidad: 'Casa N°2100', subtipo: 'Casa', rol_sii: '882-40', avaluo_clp: 339809429, orden: 1 }],
    { destino_sii: 'HABITACIONAL', contribucion_anual: 1358324, avaluo_fiscal_clp: 339809429 },
    {
      permiso_edificacion_numero: 'N°319  09/09/2020',
      permiso_edificacion_fecha: '2020-09-09',
      recepcion_final_numero: 'N°210  18/07/2024',
      recepcion_final_fecha: '2024-07-18',
      fojas: '3312',
      numero_inscripcion: '4663',
      ano_inscripcion: 2020,
    },
  )

  it('Datos SII con los valores de Airtable', () => {
    expect(resultado.sii.destinoPrincipal).toBe('HABITACIONAL')
    expect(resultado.sii.contribucionAnual).toBe('$1.358.324')
    expect(resultado.sii.avaluoTotal).toBe('$339.809.429')
    expect(resultado.sii.unidades).toEqual([
      { unidadId: 'receXRGWbpYBg26xl', ubicacion: 'Casa N°2100', tipo: 'Casa', codigoSii: '882-40', avaluoFiscal: '$339.809.429' },
    ])
  })

  it('Antecedentes legales con los valores de Airtable', () => {
    expect(resultado.legales).toEqual({
      permisoEdificacion: 'N°319  09/09/2020',
      fechaPermiso: '09/09/2020',
      recepcionFinal: 'N°210  18/07/2024',
      fechaRecepcion: '18/07/2024',
      fojas: '3312',
      numeroInscripcion: '4663',
      anioInscripcion: '2020',
    })
  })
})

describe('construirSiiLegales · avalúo total (RN-48 · RN-37)', () => {
  it('suma los avalúos de las unidades y ordena por `orden`', () => {
    const r = construirSiiLegales(
      [
        { id: 'recB', numero_unidad: 'Est. 5', rol_sii: '100-2', avaluo_clp: 10000000, orden: 2 },
        { id: 'recA', numero_unidad: 'Depto 101', rol_sii: '100-1', avaluo_clp: 90000000, orden: 1 },
      ],
      { avaluo_fiscal_clp: 1 },
      null,
    )
    expect(r.sii.avaluoTotal).toBe('$100.000.000')
    expect(r.sii.unidades.map((u) => u.unidadId)).toEqual(['recA', 'recB'])
  })

  it('sin avalúo por unidad usa avaluo_fiscal_clp y luego avaluo_total', () => {
    expect(construirSiiLegales([], { avaluo_fiscal_clp: 5000000, avaluo_total: 7 }, null).sii.avaluoTotal).toBe('$5.000.000')
    expect(construirSiiLegales([], { avaluo_total: 7000000 }, null).sii.avaluoTotal).toBe('$7.000.000')
  })

  it('con avaluo_no_registra muestra el literal NO REGISTRA', () => {
    expect(construirSiiLegales([], { avaluo_no_registra: true, avaluo_total: 9 }, null).sii.avaluoTotal).toBe(NO_REGISTRA)
  })
})

describe('formatos', () => {
  it('pesos: cero o vacío es «—»', () => {
    expect(formatoPesos(0)).toBe(SIN_DATO)
    expect(formatoPesos(null)).toBe(SIN_DATO)
    expect(formatoPesos('abc')).toBe(SIN_DATO)
    expect(formatoPesos(339809429)).toBe('$339.809.429')
  })

  it('fecha ISO a dd/mm/yyyy', () => {
    expect(formatoFecha('2020-09-09')).toBe('09/09/2020')
    expect(formatoFecha('')).toBe(SIN_DATO)
    expect(formatoFecha(undefined)).toBe(SIN_DATO)
  })
})
