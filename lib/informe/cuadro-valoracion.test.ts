import { describe, expect, it } from 'vitest'

import {
  codigoEstadoPlanilla,
  codigoMaterialPlanilla,
  factorLiquidacion,
  garantiaPlanilla,
  normalizarRol,
  numerosPorTipo,
  origenSuperficiePlanilla,
  rolImpreso,
  tipoItemImpreso,
  totalesCuadro,
  ufM2Valorado,
  valorLiquidacionItem,
  valorSeguroItem,
} from './cuadro-valoracion'
import type { ItemCuadroInforme } from './tipos'

/**
 * Reglas de las columnas del CUADRO DE VALORACION contra la planilla MET-6283
 * (`Portada!B50:BV61`). Los casos con cifras son los del original.
 */

function item(p: Partial<ItemCuadroInforme>): ItemCuadroInforme {
  return {
    id: 'rec',
    orden: null,
    descripcion: '',
    tipoItem: '',
    supM2: null,
    ufM2Aplicado: null,
    factorAplicado: null,
    ufTotalItem: null,
    aportaAGarantia: true,
    situacionMunicipal: '',
    numeroEnTipo: 1,
    tipoImpreso: '',
    rolSii: '',
    anio: null,
    codigoMaterial: '',
    codigoEstado: '',
    garantia: 'N/D',
    origenSuperficie: '',
    ufM2: null,
    valorSeguroUf: null,
    valorLiquidacionUf: null,
    ...p,
  }
}

describe('columnas descriptivas', () => {
  it('Tipo: código de la lista de la planilla; Mixto y vacío quedan en blanco', () => {
    expect(codigoMaterialPlanilla('Albanileria')).toBe('AL')
    expect(codigoMaterialPlanilla('Hormigon armado')).toBe('HA')
    expect(codigoMaterialPlanilla('HORMIGÓN ARMADO')).toBe('HA')
    expect(codigoMaterialPlanilla('Acero')).toBe('AC')
    expect(codigoMaterialPlanilla('Madera')).toBe('MA')
    expect(codigoMaterialPlanilla('Mixto')).toBe('')
    expect(codigoMaterialPlanilla('')).toBe('')
  })

  it('Estado: inicial de flag_estado', () => {
    expect(codigoEstadoPlanilla('Bueno')).toBe('B')
    expect(codigoEstadoPlanilla('Regular')).toBe('R')
    expect(codigoEstadoPlanilla('Malo')).toBe('M')
    expect(codigoEstadoPlanilla('')).toBe('')
  })

  it('Grntía.: N/D si aporta, D si se descuenta (lista «N/D,D»)', () => {
    expect(garantiaPlanilla(true)).toBe('N/D')
    expect(garantiaPlanilla(false)).toBe('D')
  })

  it('Origen Super.: plano → «Plano Muni.»; el resto con el rótulo de la consola', () => {
    expect(origenSuperficiePlanilla('plano')).toBe('Plano Muni.')
    expect(origenSuperficiePlanilla('medicion_tasador')).toBe('M. Laser')
    expect(origenSuperficiePlanilla('certificado_avaluo')).toBe('Certificado de avalúo')
    expect(origenSuperficiePlanilla('')).toBe('')
  })

  it('Rol: «N°» + rol sin ceros a la izquierda; casa formato SII y planilla', () => {
    expect(rolImpreso('882-40')).toBe('N°882-40')
    expect(rolImpreso('00882-00040')).toBe('N°882-40')
    expect(rolImpreso('N°882-40')).toBe('N°882-40')
    expect(rolImpreso('')).toBe('')
    expect(normalizarRol('00882-00040')).toBe(normalizarRol('882-40'))
    expect(normalizarRol('100-0')).toBe('100-0')
  })

  it('Item: rótulos de la lista de la planilla', () => {
    expect(tipoItemImpreso('Edificacion')).toBe('Edificación')
    expect(tipoItemImpreso('OO.CC.')).toBe('OO.CC')
    expect(tipoItemImpreso('Terreno')).toBe('Terreno')
  })

  it('N°: correlativo dentro de cada tipo (COUNTIF), en el orden del cuadro', () => {
    expect(
      numerosPorTipo(['Terreno', 'Edificacion', 'Terreno', 'Piscina', 'OO.CC.', 'OO.CC.']),
    ).toEqual([1, 1, 2, 1, 1, 2])
  })
})

describe('columnas numéricas por fila', () => {
  it('UF/m² = UF/m² nuevo × D.F. (34 × 0,96 = 32,64)', () => {
    expect(ufM2Valorado(34, 0.96)).toBeCloseTo(32.64, 10)
    expect(ufM2Valorado(null, 0.96)).toBeNull()
    expect(ufM2Valorado(34, null)).toBeNull()
  })

  it('seguro = base × factor del cliente; sin factor, null', () => {
    expect(valorSeguroItem(8157.0624, 1)).toBe(8157.0624)
    expect(valorSeguroItem(1000, 0.8)).toBe(800)
    expect(valorSeguroItem(0, 1)).toBe(0)
    expect(valorSeguroItem(1000, null)).toBeNull()
    expect(valorSeguroItem(null, 1)).toBeNull()
  })

  it('liquidación = UF × (liquidación ÷ comercial del motor)', () => {
    const f = factorLiquidacion(16603.83648, 20125.8624)
    expect(f).toBeCloseTo(0.825, 12)
    expect(valorLiquidacionItem(8157.0624, f)).toBeCloseTo(6729.57648, 6)
    expect(factorLiquidacion(null, 20125.8624)).toBeNull()
    expect(factorLiquidacion(100, 0)).toBeNull()
    expect(valorLiquidacionItem(100, null)).toBeNull()
  })
})

describe('totalesCuadro', () => {
  it('grupo sin ítems: cantidad 0 y sumas en 0, cocientes null', () => {
    const t = totalesCuadro([])
    expect(t.terreno).toEqual({
      cantidad: 0, anio: null, supM2: 0, ufM2Nuevo: null, factor: null, ufM2: null,
      ufTotal: 0, seguroUf: 0, liquidacionUf: 0,
    })
  })

  it('dos edificaciones: UF/m² nuevo ponderado por superficie y D.F. derivado', () => {
    const t = totalesCuadro([
      item({ tipoItem: 'Edificacion', supM2: 100, ufM2Aplicado: 30, factorAplicado: 1, ufTotalItem: 3000, anio: 2010 }),
      item({ tipoItem: 'Edificacion', supM2: 50, ufM2Aplicado: 24, factorAplicado: 0.5, ufTotalItem: 600, anio: 1995 }),
    ])
    // Σ(sup × UF/m² nuevo) = 3000 + 1200 = 4200 → 4200 / 150 = 28.
    expect(t.edificacion.ufM2Nuevo).toBeCloseTo(28, 10)
    // Σ UF / Σ sup = 3600 / 150 = 24 → D.F. = 24 / 28.
    expect(t.edificacion.ufM2).toBeCloseTo(24, 10)
    expect(t.edificacion.factor).toBeCloseTo(24 / 28, 10)
    expect(t.edificacion.anio).toBe(1995)
    expect(t.edificacion.cantidad).toBe(2)
  })

  it('obras complementarias juntan todo lo que no es edificación ni terreno', () => {
    const t = totalesCuadro([
      item({ tipoItem: 'Piscina', supM2: 1, ufTotalItem: 350 }),
      item({ tipoItem: 'Bodega', supM2: 4, ufTotalItem: 40 }),
      item({ tipoItem: 'Terreno', supM2: 500, ufTotalItem: 1000 }),
    ])
    expect(t.obrasComplementarias).toMatchObject({ cantidad: 2, supM2: 5, ufTotal: 390, ufM2Nuevo: 78 })
    expect(t.terreno).toMatchObject({ cantidad: 1, ufM2: 2 })
  })
})
