import { describe, expect, it } from 'vitest'
import {
  esMinimoDinamico,
  minimoCategoriaPersonalizada,
  resolverLimiteFoto,
  resolverMaximo,
  resolverMinimo,
  type DeclaradosSeccionB,
} from './minimos-fotos'
import { CATEGORIAS_FOTO } from './tasaciones'

/**
 * A-16 · los mínimos se resuelven **sólo acá** (plan §6.3).
 *
 * Desde el 14-oct-2026 (tarde) **no queda ningún mínimo dinámico**: Sergio retiró
 * de la pantalla las categorías fijas Baños, Dormitorios y Estacionamientos, que
 * quedan como heredadas con mínimo 0. Estos tests fijan ese estado; si el negocio
 * repone los mínimos según lo declarado, deben fallar: son el aviso.
 */

const declarados = (dorm: number, banos: number, estac: number): DeclaradosSeccionB => ({
  dorm,
  banos,
  estac,
})

describe('resolverMinimo · A-16 · mínimos', () => {
  it('14-oct-2026: habitaciones, baños y estacionamientos ya no siguen lo declarado (heredadas, mínimo 0)', () => {
    const d = declarados(5, 3, 2)
    expect(resolverMinimo('habitaciones', d)).toBe(0)
    expect(resolverMinimo('banos', d)).toBe(0)
    expect(resolverMinimo('estacionamientos', d)).toBe(0)
  })

  it('mantiene fijos los cuatro mínimos de 1 que no dependen de lo declarado', () => {
    const d = declarados(9, 9, 9)
    expect(resolverMinimo('datos_comparables', d)).toBe(1)
    expect(resolverMinimo('ofertas_comparables', d)).toBe(1)
    expect(resolverMinimo('mapa_ubicacion', d)).toBe(1)
    expect(resolverMinimo('fachada_exterior', d)).toBe(1)
  })

  it('14-oct-2026 · Dormitorio y Baño (fijas) y Cocina (heredada) exigen 0', () => {
    const d = declarados(9, 9, 9)
    for (const id of ['dormitorio', 'bano', 'cocina'] as const) expect(resolverMinimo(id, d)).toBe(0)
  })

  it('T-TEMAS1 · las seis nuevas y la heredada living_comedor exigen 0 (Q3)', () => {
    const d = declarados(9, 9, 9)
    for (const id of ['sector', 'casa', 'living', 'comedor', 'terraza', 'quincho', 'living_comedor'] as const) {
      expect(resolverMinimo(id, d)).toBe(0)
    }
  })

  it('cero declarado exige cero fotos: no se piden fotos de un baño que no existe', () => {
    expect(resolverMinimo('banos', declarados(0, 0, 0))).toBe(0)
  })

  it('nunca devuelve null: una categoría sin mínimo exige cero, que es un número', () => {
    expect(resolverMinimo('habitaciones', declarados(0, 0, 0))).toBe(0)
  })
})

describe('esMinimoDinamico', () => {
  it('14-oct-2026: ninguna categoría es dinámica', () => {
    for (const { id } of CATEGORIAS_FOTO) expect(esMinimoDinamico(id)).toBe(false)
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
  it('devuelve null en todas las categorías del catálogo, y null no es cero', () => {
    const d = declarados(2, 2, 1)
    for (const { id } of CATEGORIAS_FOTO) {
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

/* -------------------------------------------------------------------------
 * Candado sobre H-1 · el cableado, no la función
 * ---------------------------------------------------------------------- */

/**
 * P7-TAS.A.4 · **H-1**.
 *
 * `resolverMinimo` nunca estuvo mal: los tests de arriba lo prueban desde
 * P5-TAS. Lo que estaba mal era **de dónde salían los declarados**.
 *
 * `app/tasaciones/[id]/fotos/page.tsx` no hidrataba nada, así que `FotosScreen`
 * montaba con `resolverInforme(tasacion)` —`dormitorios: ''`— y el `declarados`
 * que arma con `Number(form.dormitorios) || 0` valía **0**. Con mínimo 0 la
 * categoría «Habitaciones» nacía completa: **una casa de cinco dormitorios se
 * daba por cubierta sin una sola foto**, que es exactamente la evidencia de
 * terreno que el organizador existe para asegurar.
 *
 * Este bloque prueba la **cadena entera** —`informeInicial` hidratado → el
 * `declarados` que la pantalla deriva → `resolverMinimo`— porque el defecto
 * vivía en la junta y ninguna de las piezas lo delataba por separado.
 */
describe('H-1 · el mínimo se resuelve contra el informe hidratado', () => {
  /** El `declarados` tal como lo deriva `FotosScreen`, literalmente. */
  const declaradosDeFormulario = (form: {
    dormitorios: string
    banos: string
    estacionamientos: string
  }): DeclaradosSeccionB => ({
    dorm: Number(form.dormitorios) || 0,
    banos: Number(form.banos) || 0,
    estac: Number(form.estacionamientos) || 0,
  })

  it('el declarado se sigue derivando del formulario hidratado', () => {
    // La cadena que H-1 arregló sigue armada: si se reponen los mínimos
    // dinámicos, `resolverLimiteFoto` los traduce desde estos números.
    const d = declaradosDeFormulario({ dormitorios: '5', banos: '3', estacionamientos: '2' })
    expect(d).toEqual({ dorm: 5, banos: 3, estac: 2 })
    expect(resolverLimiteFoto('dorm', d)).toBe(5)
  })

  it('14-oct-2026: con las categorías retiradas, el mínimo es 0 haya o no hidratación', () => {
    const hidratado = declaradosDeFormulario({ dormitorios: '5', banos: '3', estacionamientos: '2' })
    const sinHidratar = declaradosDeFormulario({ dormitorios: '', banos: '', estacionamientos: '' })
    expect(resolverMinimo('habitaciones', hidratado)).toBe(0)
    expect(resolverMinimo('habitaciones', sinHidratar)).toBe(0)
  })
})
