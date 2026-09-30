import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Grilla de 16 fotos del informe — T-VP0067-IMAGENES-UI-20260930 (P3).
 *
 * Candados:
 * (a) con fotos reales (bloque 7 no vacío), la grilla sale DE ELLAS: orden
 *     asc con null al final, caption = label de `CATEGORIAS_FOTO` (o custom
 *     tal cual), fuente = thumbnail data-URI con caída a URL http(s);
 * (b) sin fotos reales y código espejo VP-2026-0067 → fallback repo intacto
 *     (16 assets del gold master como data-URI, captions del MANIFEST);
 * (c) sin fotos y otro código → grilla vacía honesta + ranuras fijas null;
 * (d) foto sin fuente renderizable (thumbnail null y url no-http) → se OMITE
 *     con warn (decisión de tanda: ranura sin imagen no aporta al PDF);
 * (e) más de 16 → entran las primeras 16 por orden, con warn.
 *
 * Sin red ni base: sólo assets del repo (fallback) y fixtures en memoria.
 */

import { CATEGORIAS_FOTO } from '@/lib/tasador/tasaciones'
import { resolverImagenes } from './imagenes'
import type { FotosInforme } from './tipos'

const ESPEJO = 'VP-2026-0067'
const OTRO = 'VP-2026-0099'

const DATA_URI = 'data:image/jpeg;base64,/9j/QUJD'

type Foto = FotosInforme['fotos'][number]

function foto(parcial: Partial<Foto> & { id: string }): Foto {
  return {
    nombre: `${parcial.id}.jpg`,
    categoria: 'cocina',
    url: '/Solicitudes/VP-2026-0067/foto.jpg', // path Dropbox: NO renderizable
    thumbnailUrl: DATA_URI,
    orden: null,
    ...parcial,
  }
}

function canonicas(fotos: Foto[]): FotosInforme {
  return { total: fotos.length, porCategoria: {}, fotos }
}

const label = (id: string) => CATEGORIAS_FOTO.find((c) => c.id === id)!.label

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolverImagenes · grilla desde fotos reales (origen único §4)', () => {
  it('(a) 16 fotos con data-URI y categorías mixtas: captions = labels, orden respetado', () => {
    // 15 con orden explícito desordenado + 1 sin orden (va al final).
    const ids = [
      'mapa_ubicacion',
      'Planificación', // custom: pasa tal cual
      'fachada_exterior',
      'fachada_exterior',
      'living_comedor',
      'living_comedor',
      'cocina',
      'banos',
      'habitaciones',
      'banos',
      'habitaciones',
      'habitaciones',
      'living_comedor',
      'fachada_exterior',
      'fachada_exterior',
      'fachada_exterior',
    ]
    const fotos = ids.map((categoria, i) =>
      foto({
        id: `f${i}`,
        categoria,
        // Entrada desordenada: orden decreciente 16..2; la última sin orden.
        orden: i === 15 ? null : 16 - i,
        thumbnailUrl: `data:image/jpeg;base64,IMG${i}`,
      }),
    )
    // Se barajan para probar que manda `orden`, no la posición de entrada.
    const entrada = [...fotos.slice(8), ...fotos.slice(0, 8)]

    const { fotos: grilla } = resolverImagenes(ESPEJO, canonicas(entrada))

    expect(grilla.total).toBe(16)
    // orden asc: f14 (orden 2) primero … f0 (orden 16), y f15 (null) al final.
    expect(grilla.fotos.map((f) => f.id)).toEqual([
      'f14', 'f13', 'f12', 'f11', 'f10', 'f9', 'f8', 'f7',
      'f6', 'f5', 'f4', 'f3', 'f2', 'f1', 'f0', 'f15',
    ])
    // La fuente es el thumbnail data-URI de cada foto.
    expect(grilla.fotos.every((f) => f.url.startsWith('data:image/jpeg;base64,IMG'))).toBe(true)
    // Captions: labels oficiales para los ids; el custom tal cual.
    const porId = new Map(grilla.fotos.map((f) => [f.id, f.categoria]))
    expect(porId.get('f0')).toBe(label('mapa_ubicacion'))
    expect(porId.get('f1')).toBe('Planificación')
    expect(porId.get('f2')).toBe(label('fachada_exterior'))
    expect(porId.get('f6')).toBe(label('cocina'))
    expect(porId.get('f7')).toBe(label('banos'))
    expect(porId.get('f8')).toBe(label('habitaciones'))
    expect(porId.get('f12')).toBe(label('living_comedor'))
    // Conteo por caption (labels), no por id.
    expect(grilla.porCategoria[label('fachada_exterior')]).toBe(5)
    expect(grilla.porCategoria[label('living_comedor')]).toBe(3)
    expect(grilla.porCategoria['Planificación']).toBe(1)
    // Ningún string de la grilla del gold master se cuela (assets del repo).
    expect(grilla.fotos.some((f) => f.nombre.includes('h4_') || f.nombre.includes('h5_'))).toBe(false)
  })

  it('las fotos reales mandan incluso en el código espejo (no se mezclan assets)', () => {
    const { fotos: grilla } = resolverImagenes(
      ESPEJO,
      canonicas([foto({ id: 'real-1', categoria: 'cocina', orden: 1 })]),
    )
    expect(grilla.total).toBe(1)
    expect(grilla.fotos[0].id).toBe('real-1')
    expect(grilla.fotos[0].categoria).toBe(label('cocina'))
    expect(grilla.fotos[0].url).toBe(DATA_URI)
  })

  it('null en orden va al final, en orden de llegada estable', () => {
    const { fotos: grilla } = resolverImagenes(
      OTRO,
      canonicas([
        foto({ id: 'sin-orden-a', orden: null }),
        foto({ id: 'con-orden', orden: 5 }),
        foto({ id: 'sin-orden-b', orden: null }),
      ]),
    )
    expect(grilla.fotos.map((f) => f.id)).toEqual(['con-orden', 'sin-orden-a', 'sin-orden-b'])
  })

  it('(d) foto con thumbnail null: usa la url si es http(s); si no, se omite con warn', () => {
    const { fotos: grilla } = resolverImagenes(
      OTRO,
      canonicas([
        foto({
          id: 'con-http',
          orden: 1,
          thumbnailUrl: null,
          url: 'https://dl.airtable.com/foo.jpg',
        }),
        foto({
          id: 'sin-fuente',
          orden: 2,
          thumbnailUrl: null, // y url = path Dropbox → irrenderizable
        }),
      ]),
    )
    expect(grilla.total).toBe(1)
    expect(grilla.fotos[0].id).toBe('con-http')
    // La URL http(s) pasa TAL CUAL (Carbone la descarga; no se baja acá).
    expect(grilla.fotos[0].url).toBe('https://dl.airtable.com/foo.jpg')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('sin fuente renderizable'),
      OTRO,
      'sin-fuente',
      'sin-fuente.jpg',
    )
  })

  it('(e) con más de 16 renderizables entran las primeras 16 por orden, con warn', () => {
    const fotos = Array.from({ length: 18 }, (_, i) =>
      foto({ id: `f${i}`, orden: i + 1 }),
    )
    const { fotos: grilla } = resolverImagenes(OTRO, canonicas(fotos))
    expect(grilla.total).toBe(16)
    expect(grilla.fotos.at(-1)!.id).toBe('f15')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('16 posiciones'),
      OTRO,
    )
  })
})

describe('resolverImagenes · fallback espejo (transitorio pre-siembra)', () => {
  it('(b) sin fotos reales y código espejo: grilla del gold master intacta', () => {
    const { imagenes, fotos } = resolverImagenes(ESPEJO, canonicas([]))
    expect(fotos.total).toBe(16)
    // Captions EXACTOS del gold master (MANIFEST), no labels de la UI.
    expect(fotos.fotos[0].categoria).toBe('Ubicación')
    expect(fotos.fotos[6].categoria).toBe('Cocina')
    expect(fotos.fotos.every((f) => f.url.startsWith('data:image/'))).toBe(true)
    // Ranuras fijas: siguen saliendo de los assets del espejo.
    expect(imagenes.mapaUbicacion).toMatch(/^data:image\//)
    expect(imagenes.firma).toMatch(/^data:image\//)
  })

  it('(c) sin fotos reales y otro código: grilla vacía honesta y ranuras null', () => {
    const { imagenes, fotos } = resolverImagenes(OTRO, canonicas([]))
    expect(fotos).toEqual({ total: 0, porCategoria: {}, fotos: [] })
    expect(Object.values(imagenes).every((v) => v === null)).toBe(true)
  })
})
