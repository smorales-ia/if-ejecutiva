import { describe, expect, it } from 'vitest'
import {
  esMinimoDinamico,
  minimoCategoriaPersonalizada,
  resolverLimiteFoto,
  resolverMaximo,
  resolverMinimo,
  type DeclaradosSeccionB,
} from './minimos-fotos'

/**
 * A-16 · los mínimos dinámicos se resuelven **sólo acá** (plan §6.3).
 *
 * Estos tests fijan el comportamiento que la ficha A-16 declara como asunción
 * reversible. Si el negocio decide mínimos fijos, **estos tests deben fallar**:
 * son el aviso de que el cambio llegó, no un obstáculo a rodear.
 */

const declarados = (dorm: number, banos: number, estac: number): DeclaradosSeccionB => ({
  dorm,
  banos,
  estac,
})

describe('resolverMinimo · A-16 · mínimos dinámicos', () => {
  it('deriva habitaciones, baños y estacionamientos de lo declarado en la sección B', () => {
    const d = declarados(5, 3, 2)
    expect(resolverMinimo('habitaciones', d)).toBe(5)
    expect(resolverMinimo('banos', d)).toBe(3)
    expect(resolverMinimo('estacionamientos', d)).toBe(2)
  })

  it('es el caso que A-16 protege: una casa de 5 dormitorios exige 5 fotos, no 2', () => {
    // Con mínimos fijos (2·2·1) esta casa se daría por completa con 2 fotos de
    // habitaciones, que es la degradación de evidencia que la ficha describe.
    expect(resolverMinimo('habitaciones', declarados(5, 2, 1))).toBe(5)
  })

  it('mantiene fijos los cinco mínimos que no dependen de lo declarado', () => {
    const d = declarados(9, 9, 9)
    expect(resolverMinimo('ofertas_comparables', d)).toBe(3)
    expect(resolverMinimo('mapa_ubicacion', d)).toBe(1)
    expect(resolverMinimo('fachada_exterior', d)).toBe(1)
    expect(resolverMinimo('cocina', d)).toBe(1)
    expect(resolverMinimo('living_comedor', d)).toBe(1)
  })

  it('cero declarado exige cero fotos: no se piden fotos de un baño que no existe', () => {
    expect(resolverMinimo('banos', declarados(0, 0, 0))).toBe(0)
  })

  it('nunca devuelve null: una categoría sin mínimo exige cero, que es un número', () => {
    expect(resolverMinimo('habitaciones', declarados(0, 0, 0))).toBe(0)
  })
})

describe('esMinimoDinamico', () => {
  it('marca exactamente las tres categorías de A-16', () => {
    expect(esMinimoDinamico('habitaciones')).toBe(true)
    expect(esMinimoDinamico('banos')).toBe(true)
    expect(esMinimoDinamico('estacionamientos')).toBe(true)
  })

  it('no marca las cinco fijas', () => {
    expect(esMinimoDinamico('ofertas_comparables')).toBe(false)
    expect(esMinimoDinamico('mapa_ubicacion')).toBe(false)
    expect(esMinimoDinamico('fachada_exterior')).toBe(false)
    expect(esMinimoDinamico('cocina')).toBe(false)
    expect(esMinimoDinamico('living_comedor')).toBe(false)
  })
})

describe('resolverMaximo · la spec no declara ningún tope', () => {
  it('devuelve null en las ocho categorías, y null no es cero', () => {
    const d = declarados(2, 2, 1)
    for (const id of [
      'ofertas_comparables',
      'habitaciones',
      'banos',
      'estacionamientos',
      'mapa_ubicacion',
      'fachada_exterior',
      'cocina',
      'living_comedor',
    ] as const) {
      expect(resolverMaximo(id, d)).toBeNull()
    }
  })
})

describe('resolverLimiteFoto · traducción cruda', () => {
  it('null significa sin límite, no cero', () => {
    expect(resolverLimiteFoto(null, declarados(2, 2, 1))).toBeNull()
  })

  it('un número se devuelve tal cual, sin mirar lo declarado', () => {
    expect(resolverLimiteFoto(3, declarados(0, 0, 0))).toBe(3)
  })

  it('una clave dinámica se resuelve contra lo declarado', () => {
    expect(resolverLimiteFoto('dorm', declarados(4, 0, 0))).toBe(4)
  })
})

describe('minimoCategoriaPersonalizada · RF-TAS-14', () => {
  it('es cero: una categoría personalizada admite fotos sin exigir mínimo', () => {
    expect(minimoCategoriaPersonalizada()).toBe(0)
  })
})
