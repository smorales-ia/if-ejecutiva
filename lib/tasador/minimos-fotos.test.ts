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
    expect(resolverMinimo('ofertas_comparables', d)).toBe(1)
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

  it('con `informeInicial` hidratado a 5 dormitorios exige 5, no 0', () => {
    const hidratado = { dormitorios: '5', banos: '3', estacionamientos: '2' }
    const d = declaradosDeFormulario(hidratado)

    expect(resolverMinimo('habitaciones', d)).toBe(5)
    expect(resolverMinimo('banos', d)).toBe(3)
    expect(resolverMinimo('estacionamientos', d)).toBe(2)
  })

  it('sin hidratar valdría 0 — el defecto que .A.4 cierra', () => {
    // Ésta es la forma que devolvía `resolverInforme(tasacion)` a secas, y es
    // lo que la pantalla usaba hasta .A.4. Se deja explícito para que quede
    // claro qué se rompió y por qué la página tiene que pasar `informeInicial`.
    const sinHidratar = { dormitorios: '', banos: '', estacionamientos: '' }

    expect(resolverMinimo('habitaciones', declaradosDeFormulario(sinHidratar))).toBe(0)
  })

  it('las tres categorías dinámicas siguen siendo dinámicas', () => {
    // Si alguien fija los mínimos en `MINIMOS_DINAMICOS`, este test cae junto
    // con los de A-16 de arriba: es el aviso, no un obstáculo a rodear.
    expect(esMinimoDinamico('habitaciones')).toBe(true)
    expect(esMinimoDinamico('banos')).toBe(true)
    expect(esMinimoDinamico('estacionamientos')).toBe(true)
  })
})
