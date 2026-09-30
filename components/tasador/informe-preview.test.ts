import { describe, expect, it } from 'vitest'
import { gruposConFotos } from './informe-preview'
import {
  CATEGORIAS_FOTO,
  type CategoriaFotoId,
  type FotoAdjunta,
  type FotoCategoriaCustom,
} from '@/lib/tasador/tasaciones'

/**
 * T-VP0067-IMAGENES-UI · P1-MOSTRAR: la sección 7 del preview muestra las
 * miniaturas de cada foto bajo su categoría, y **sólo** las categorías con
 * fotos rinden grilla — una categoría en 0 sigue existiendo únicamente como
 * contador. `gruposConFotos` es el único punto donde se decide qué categorías
 * llevan grilla, así que probarlo cubre la regla completa.
 *
 * El render en sí (data-URI en `src`, placeholder cuando `thumbnailUrl` es
 * null) no se prueba acá: el repo no tiene infraestructura de render de
 * componentes y no se inventa (convención de `fotos-categorizadas.test.ts`).
 */

const foto = (n: number, thumbnailUrl: string | null = null): FotoAdjunta => ({
  id: `recFOTO${String(n).padStart(9, '0')}`,
  categoria: 'cocina',
  nombre: `IMG_${n}.jpg`,
  url: null,
  thumbnailUrl,
  hashMd5: null,
})

const vacias = (): Record<CategoriaFotoId, FotoAdjunta[]> => {
  const f = {} as Record<CategoriaFotoId, FotoAdjunta[]>
  for (const c of CATEGORIAS_FOTO) f[c.id] = []
  return f
}

const custom = (
  nombre: string,
  fotos: FotoAdjunta[],
): FotoCategoriaCustom => ({
  id: `custom-${nombre}`,
  nombre,
  minimo: 0,
  fotos,
})

describe('gruposConFotos · qué categorías rinden grilla de miniaturas', () => {
  it('sin fotos no rinde ningún grupo (los contadores en 0 no llevan grilla)', () => {
    expect(gruposConFotos(vacias(), [])).toEqual([])
  })

  it('sólo las categorías predefinidas con fotos aparecen, con su label del catálogo', () => {
    const fotos = { ...vacias(), cocina: [foto(1), foto(2)] }
    const grupos = gruposConFotos(fotos, [])
    expect(grupos).toHaveLength(1)
    expect(grupos[0].id).toBe('cocina')
    expect(grupos[0].label).toBe('Cocina')
    expect(grupos[0].fotos.map((f) => f.id)).toEqual([foto(1).id, foto(2).id])
  })

  it('las personalizadas con fotos van después de las predefinidas, con su nombre', () => {
    const fotos = { ...vacias(), fachada_exterior: [foto(1)] }
    const grupos = gruposConFotos(fotos, [
      custom('Quincho', [foto(2)]),
      custom('Bodega exterior', []),
    ])
    expect(grupos.map((g) => g.label)).toEqual(['Fachada / Exterior', 'Quincho'])
  })

  it('conserva el orden del catálogo entre predefinidas', () => {
    const fotos = {
      ...vacias(),
      living_comedor: [foto(1)],
      ofertas_comparables: [foto(2)],
    }
    const ids = gruposConFotos(fotos, []).map((g) => g.id)
    expect(ids).toEqual(['ofertas_comparables', 'living_comedor'])
  })

  it('las fotos viajan tal cual, con o sin thumbnailUrl (fotos viejas → null)', () => {
    const conThumb = foto(1, 'data:image/jpeg;base64,AAAA')
    const sinThumb = foto(2, null)
    const fotos = { ...vacias(), banos: [conThumb, sinThumb] }
    const [grupo] = gruposConFotos(fotos, [])
    expect(grupo.fotos[0].thumbnailUrl).toBe('data:image/jpeg;base64,AAAA')
    expect(grupo.fotos[1].thumbnailUrl).toBeNull()
  })
})
