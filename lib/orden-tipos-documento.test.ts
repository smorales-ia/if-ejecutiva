import { describe, expect, it } from 'vitest'
import { compararTiposDocumento } from '@/lib/orden-tipos-documento'

describe('compararTiposDocumento · orden de negocio y luego alfabético (PRD «Temas 1» R3)', () => {
  const catalogo = [
    { nombre: 'Certificado de Deuda de Gastos Comunes', orden: null },
    { nombre: 'Plano y Cuadro de Superficies', orden: 60 },
    { nombre: 'Certificado de Avalúo Fiscal', orden: 20 },
    { nombre: 'Escritura de Compraventa' },
    { nombre: 'Certificado de Recepción Definitiva de Obras', orden: 50 },
    { nombre: 'Foto fuente SII', orden: 10 },
    { nombre: 'Permiso de Edificación', orden: 40 },
    { nombre: 'Certificado de Deuda de Contribuciones', orden: 30 },
    { nombre: 'Dominio Vigente', orden: null },
  ]

  it('los seis del cliente primero, en su orden; el resto alfabético', () => {
    expect([...catalogo].sort(compararTiposDocumento).map((t) => t.nombre)).toEqual([
      'Foto fuente SII',
      'Certificado de Avalúo Fiscal',
      'Certificado de Deuda de Contribuciones',
      'Permiso de Edificación',
      'Certificado de Recepción Definitiva de Obras',
      'Plano y Cuadro de Superficies',
      'Certificado de Deuda de Gastos Comunes',
      'Dominio Vigente',
      'Escritura de Compraventa',
    ])
  })

  it('propiedad nueva (sin foto SII ni contribuciones) parte en avalúo', () => {
    const nueva = catalogo.filter(
      (t) => t.nombre !== 'Foto fuente SII' && t.nombre !== 'Certificado de Deuda de Contribuciones'
    )
    expect([...nueva].sort(compararTiposDocumento)[0].nombre).toBe('Certificado de Avalúo Fiscal')
  })

  it('empate de orden se desempata por nombre', () => {
    expect(compararTiposDocumento({ nombre: 'B', orden: 5 }, { nombre: 'A', orden: 5 })).toBeGreaterThan(0)
  })
})
