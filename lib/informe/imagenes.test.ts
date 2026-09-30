import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Resolutor genérico de las 20 ranuras de imagen + grilla de 16 fotos —
 * T-PDF-E3-GENERICOS-20260930 (plan §4).
 *
 * Candados:
 * (a) grilla desde fotos reales: orden asc con null al final, caption =
 *     label de `CATEGORIAS_FOTO` (o custom tal cual), fuente = thumbnail
 *     data-URI con caída a URL http(s);
 * (b) ranuras fotográficas por categoría y `orden` (mapa/fachada/refMapa/
 *     ref1..3); categoría ausente → null;
 * (c) ranuras de anexo por código `D_TipoDocumento` (mapeo compartido
 *     `RANURAS_ANEXO`); adjunto sin thumbnail renderizable → null;
 * (d) firma desde `firma_url` (data-URI o https); no renderizable → null;
 * (e) sin fuentes → las 20 ranuras null y grilla vacía honesta — nunca se
 *     rompe el render, nunca aparece la imagen de otra propiedad;
 * (f) foto sin fuente renderizable se OMITE de la grilla (warn); con más de
 *     16 entran las primeras 16 por orden.
 *
 * Sin red, sin disco, sin base: el fallback por-código a assets del repo
 * del caso espejo se eliminó del camino vivo en esta tanda.
 */

import { CATEGORIAS_FOTO } from '@/lib/tasador/tasaciones'
import {
  RANURAS_ANEXO,
  resolverAnexos,
  resolverImagenes,
  type AnexoResuelto,
  type DocumentoAnexo,
} from './imagenes'
import type { FotosInforme, ImagenesInforme } from './tipos'

const CODIGO = 'VP-2026-0100'

const DATA_URI = 'data:image/jpeg;base64,/9j/QUJD'

type Foto = FotosInforme['fotos'][number]

function foto(parcial: Partial<Foto> & { id: string }): Foto {
  return {
    nombre: `${parcial.id}.jpg`,
    categoria: 'cocina',
    url: '/Solicitudes/VP-2026-0100/foto.jpg', // path Dropbox: NO renderizable
    thumbnailUrl: DATA_URI,
    orden: null,
    ...parcial,
  }
}

function canonicas(fotos: Foto[]): FotosInforme {
  return { total: fotos.length, porCategoria: {}, fotos }
}

function doc(codigo: string, thumbnailUrl: string | null): DocumentoAnexo {
  return { codigo, nombre: `${codigo}.jpg`, thumbnailUrl }
}

/** Atajo: resolver con anexos crudos y firma opcional. */
function resolver(
  fotos: Foto[],
  documentos: DocumentoAnexo[] = [],
  firmaUrl: string | null = null,
) {
  return resolverImagenes(CODIGO, canonicas(fotos), resolverAnexos(documentos), firmaUrl)
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

    const { fotos: grilla } = resolver(entrada)

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
  })

  it('null en orden va al final, en orden de llegada estable', () => {
    const { fotos: grilla } = resolver([
      foto({ id: 'sin-orden-a', orden: null }),
      foto({ id: 'con-orden', orden: 5 }),
      foto({ id: 'sin-orden-b', orden: null }),
    ])
    expect(grilla.fotos.map((f) => f.id)).toEqual(['con-orden', 'sin-orden-a', 'sin-orden-b'])
  })

  it('(f) foto con thumbnail null: usa la url si es http(s); si no, se omite con warn', () => {
    const { fotos: grilla } = resolver([
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
    ])
    expect(grilla.total).toBe(1)
    expect(grilla.fotos[0].id).toBe('con-http')
    // La URL http(s) pasa TAL CUAL (Carbone la descarga; no se baja acá).
    expect(grilla.fotos[0].url).toBe('https://dl.airtable.com/foo.jpg')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('sin fuente renderizable'),
      CODIGO,
      'sin-fuente',
      'sin-fuente.jpg',
    )
  })

  it('(f) con más de 16 renderizables entran las primeras 16 por orden, con warn', () => {
    const fotos = Array.from({ length: 18 }, (_, i) =>
      foto({ id: `f${i}`, orden: i + 1 }),
    )
    const { fotos: grilla } = resolver(fotos)
    expect(grilla.total).toBe(16)
    expect(grilla.fotos.at(-1)!.id).toBe('f15')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('16 posiciones'),
      CODIGO,
    )
  })
})

describe('resolverImagenes · ranuras fotográficas por categoría (plan §4)', () => {
  it('(b) mapa/fachada/refMapa = 1ª de su categoría; ref1..3 = 3 primeras de ofertas, por orden', () => {
    const { imagenes } = resolver([
      // Desordenadas a propósito: manda `orden`, no la llegada.
      foto({ id: 'of-2', categoria: 'ofertas_comparables', orden: 20, thumbnailUrl: 'data:image/jpeg;base64,OF2' }),
      foto({ id: 'mapa', categoria: 'mapa_ubicacion', orden: 1, thumbnailUrl: 'data:image/jpeg;base64,MAPA' }),
      foto({ id: 'of-1', categoria: 'ofertas_comparables', orden: 10, thumbnailUrl: 'data:image/jpeg;base64,OF1' }),
      foto({ id: 'refmapa', categoria: 'mapa_referencias', orden: 2, thumbnailUrl: 'data:image/jpeg;base64,REFMAPA' }),
      foto({ id: 'fachada-2', categoria: 'fachada_exterior', orden: 6, thumbnailUrl: 'data:image/jpeg;base64,FACH2' }),
      foto({ id: 'fachada-1', categoria: 'fachada_exterior', orden: 5, thumbnailUrl: 'data:image/jpeg;base64,FACH1' }),
      foto({ id: 'of-3', categoria: 'ofertas_comparables', orden: 30, thumbnailUrl: 'data:image/jpeg;base64,OF3' }),
      foto({ id: 'of-4', categoria: 'ofertas_comparables', orden: 40, thumbnailUrl: 'data:image/jpeg;base64,OF4' }),
    ])

    expect(imagenes.mapaUbicacion).toBe('data:image/jpeg;base64,MAPA')
    expect(imagenes.fachada).toBe('data:image/jpeg;base64,FACH1')
    expect(imagenes.refMapa).toBe('data:image/jpeg;base64,REFMAPA')
    expect(imagenes.ref1).toBe('data:image/jpeg;base64,OF1')
    expect(imagenes.ref2).toBe('data:image/jpeg;base64,OF2')
    expect(imagenes.ref3).toBe('data:image/jpeg;base64,OF3')
  })

  it('(b) categoría sin fotos → ranura null; ofertas con menos de 3 → ref sobrantes null', () => {
    const { imagenes } = resolver([
      foto({ id: 'of-1', categoria: 'ofertas_comparables', orden: 1 }),
    ])
    expect(imagenes.mapaUbicacion).toBeNull()
    expect(imagenes.fachada).toBeNull()
    expect(imagenes.refMapa).toBeNull()
    expect(imagenes.ref1).toBe(DATA_URI)
    expect(imagenes.ref2).toBeNull()
    expect(imagenes.ref3).toBeNull()
  })

  it('(b) foto de categoría sin fuente renderizable no ocupa ranura (pasa la siguiente)', () => {
    const { imagenes } = resolver([
      foto({ id: 'rota', categoria: 'fachada_exterior', orden: 1, thumbnailUrl: null }),
      foto({ id: 'buena', categoria: 'fachada_exterior', orden: 2, thumbnailUrl: 'data:image/jpeg;base64,OK' }),
    ])
    expect(imagenes.fachada).toBe('data:image/jpeg;base64,OK')
  })
})

describe('resolverAnexos · mapeo código→ranura (constante compartida)', () => {
  it('cubre las 13 ranuras documentales de ImagenesInforme, en orden Anexo 1 → Anexo 2', () => {
    expect(RANURAS_ANEXO.map((r) => r.ranura)).toEqual([
      'anexo1Plano',
      'anexo1Esquema',
      'anexo1CuadroSup',
      'anexo1Emplazamiento',
      'anexo1Aerea',
      'anexo1MapaSii',
      'anexo1InfoSii',
      'anexo2RolAvaluo',
      'anexo2Permiso',
      'anexo2Escritura',
      'anexo2NoExpropiacion',
      'anexo2Recepcion',
      'anexo2Tgr',
    ])
    // Códigos D_TipoDocumento del contrato §4, sin duplicados.
    expect(new Set(RANURAS_ANEXO.map((r) => r.codigo)).size).toBe(13)
    // Labels humanos: sin ids técnicos con guión bajo.
    for (const r of RANURAS_ANEXO) expect(r.label).not.toMatch(/_/)
  })

  it('(c) casa adjunto por código con thumbnail renderizable; sin thumbnail → vacío honesto', () => {
    const anexos = resolverAnexos([
      doc('permiso_edificacion', 'data:image/jpeg;base64,PERMISO'),
      doc('escritura_compraventa', null), // subido como PDF: sin miniatura (P2)
      doc('certificado_deuda_tgr', '/Solicitudes/x/tgr.pdf'), // path: NO renderizable
      doc('codigo_desconocido', 'data:image/jpeg;base64,NADIE'), // no mapea a ranura
    ])
    const porRanura = new Map(anexos.map((a) => [a.ranura, a]))

    const permiso = porRanura.get('anexo2Permiso')!
    expect(permiso.thumbnailUrl).toBe('data:image/jpeg;base64,PERMISO')
    expect(permiso.nombre).toBe('permiso_edificacion.jpg')

    expect(porRanura.get('anexo2Escritura')!.thumbnailUrl).toBeNull()
    expect(porRanura.get('anexo2Escritura')!.nombre).toBeNull()
    expect(porRanura.get('anexo2Tgr')!.thumbnailUrl).toBeNull()
    // Las 13 ranuras siempre presentes, con null donde no hay fuente.
    expect(anexos).toHaveLength(13)
    expect(anexos.filter((a) => a.thumbnailUrl !== null)).toHaveLength(1)
  })

  it('(c) las ranuras de anexo resueltas llegan tal cual a ImagenesInforme', () => {
    const { imagenes } = resolver(
      [],
      [
        doc('foto_plano_cuadro_superficies', 'data:image/jpeg;base64,PLANO'),
        doc('certificado_avaluo_fiscal', 'https://ejemplo.cl/avaluo.jpg'),
      ],
    )
    expect(imagenes.anexo1Plano).toBe('data:image/jpeg;base64,PLANO')
    expect(imagenes.anexo2RolAvaluo).toBe('https://ejemplo.cl/avaluo.jpg')
    expect(imagenes.anexo1Esquema).toBeNull()
    expect(imagenes.anexo2Permiso).toBeNull()
  })
})

describe('resolverImagenes · firma del tasador (M_Tasadores.firma_url)', () => {
  it('(d) acepta data-URI y URL https; rechaza path/no renderizable', () => {
    expect(resolver([], [], 'data:image/png;base64,FIRMA').imagenes.firma).toBe(
      'data:image/png;base64,FIRMA',
    )
    expect(resolver([], [], 'https://ejemplo.cl/firma.png').imagenes.firma).toBe(
      'https://ejemplo.cl/firma.png',
    )
    expect(resolver([], [], '/Dropbox/firma.png').imagenes.firma).toBeNull()
    expect(resolver([], [], null).imagenes.firma).toBeNull()
  })
})

describe('resolverImagenes · vacío honesto (plan §4)', () => {
  it('(e) sin fuentes: las 20 ranuras null y grilla vacía — para CUALQUIER código', () => {
    const { imagenes, fotos } = resolver([])
    expect(fotos).toEqual({ total: 0, porCategoria: {}, fotos: [] })
    expect(Object.values(imagenes).every((v) => v === null)).toBe(true)
    // Las 20 ranuras del contrato, ni una menos.
    expect(Object.keys(imagenes)).toHaveLength(20)
  })

  it('(e) un AnexoResuelto ya vacío no inventa fuente', () => {
    const vacios: AnexoResuelto[] = RANURAS_ANEXO.map((r) => ({
      ...r,
      nombre: null,
      thumbnailUrl: null,
    }))
    const { imagenes } = resolverImagenes(CODIGO, canonicas([]), vacios, null)
    const anexoKeys: (keyof ImagenesInforme)[] = RANURAS_ANEXO.map((r) => r.ranura)
    for (const k of anexoKeys) expect(imagenes[k]).toBeNull()
  })
})
