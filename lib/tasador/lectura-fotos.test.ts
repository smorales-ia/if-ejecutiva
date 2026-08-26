import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P7-TAS.A.4 — la proyección server-side de las fotos de la visita (D-1).
 *
 * `vi.mock` se iza sobre los imports, así que el módulo bajo prueba entra ya
 * mockeado. Import estático y no `await import()`: es el patrón del resto de los
 * tests del repo (`contactos-cola.test.ts`, `route.test.ts`).
 *
 * Se mockean **dos** módulos y por razones distintas. `airtable-client` con
 * `importOriginal`, para conservar `isValidRecordId` y `AirtableError` reales —
 * el guard los usa. `auth-guard` entero, porque su identidad sale de
 * `TASADOR_MOCK_RECORD_ID` y un test no puede depender de un `.env.local`.
 */

const listRecords = vi.fn()
const autorizarSolicitud = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

vi.mock('@/lib/tasador/auth-guard', () => ({
  autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
}))

import {
  aFotoProyectada,
  leerFotosCaptura,
  proyectarFotosCaptura,
  repartoDeCaptura,
  SUBIDO_POR_TASADOR,
} from './lectura-fotos'
import { CATEGORIAS_FOTO } from '@/lib/tasador/tasaciones'

const ID = 'recAAAAAAAAAAAAAA'
const CODIGO = 'VP-2026-0061'
const TABLA_ADJUNTOS = 'tblur71x1oItbmKZc'

function fila(id: string, fields: Record<string, unknown> = {}) {
  return { id, createdTime: '', fields: { nombre_archivo: `${id}.jpg`, ...fields } }
}

beforeEach(() => {
  vi.clearAllMocks()
  listRecords.mockResolvedValue([])
  autorizarSolicitud.mockResolvedValue({
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: CODIGO, estado: 'asignada' },
  })
})

/* -------------------------------------------------------------------------
 * Candado sobre H-3 / CI-061
 * ---------------------------------------------------------------------- */

describe('CI-061 · una foto sin categorizar no se pierde', () => {
  it("cae en 'otro' y sigue en la proyección", async () => {
    // Ésta es la forma real de `recY2P0Ju0n5FAN62` (VP-2026-0061): el binario
    // llegó a Dropbox y el PATCH de categorización nunca se aplicó, así que
    // `descripcion`, `tipo_adjunto` y `orden` quedaron vacíos.
    listRecords.mockResolvedValue([
      fila('recY2P0Ju0n5FAN62', {
        nombre_archivo: 'Foto REF Ofertas y REF CBR.JPG',
        url_dropbox: '/VProperty/VP-2026-0061/foto.jpg',
        hash_md5: 'abc123',
      }),
    ])

    const captura = await proyectarFotosCaptura({ codigo_solicitud: CODIGO })

    // Lo que se protege no es el literal 'otro': es que la foto **esté**.
    // Filtrarla convertiría un fallo de categorización en una pérdida aparente
    // de evidencia, y el tasador la volvería a tomar sin saber que ya subió.
    expect(captura.total).toBe(1)
    expect(captura.fotos[0].id).toBe('recY2P0Ju0n5FAN62')
    expect(captura.fotos[0].categoria).toBe('otro')
    expect(captura.fotos[0].hashMd5).toBe('abc123')
  })

  it('`descripcion` gana sobre `tipo_adjunto`, y `tipo_adjunto` sobre el fallback', () => {
    expect(aFotoProyectada('rec1', { descripcion: 'cocina', tipo_adjunto: 'foto_interior' }).categoria).toBe(
      'cocina',
    )
    expect(aFotoProyectada('rec2', { tipo_adjunto: 'foto_interior' }).categoria).toBe('foto_interior')
    expect(aFotoProyectada('rec3', {}).categoria).toBe('otro')
    // Cadena vacía no es una categoría: `||` la trata como ausencia, y debe
    // seguir haciéndolo. Un `??` acá dejaría pasar el `''` y rompería el reparto.
    expect(aFotoProyectada('rec4', { descripcion: '' }).categoria).toBe('otro')
  })

  it('la foto sin categoría llega a la pantalla como categoría personalizada', () => {
    const reparto = repartoDeCaptura({
      fotos: [aFotoProyectada('recY2P0Ju0n5FAN62', {})],
      porCategoria: { otro: 1 },
      total: 1,
    })

    // 'otro' no es ninguna de las ocho del catálogo, así que `repartirFotos` le
    // crea su bucket: visible, con nombre y sin mínimo.
    expect(reparto.categoriasCustom).toHaveLength(1)
    expect(reparto.categoriasCustom[0].nombre).toBe('otro')
    expect(reparto.categoriasCustom[0].minimo).toBe(0)
    expect(reparto.categoriasCustom[0].fotos).toHaveLength(1)
  })
})

/* -------------------------------------------------------------------------
 * El filtro
 * ---------------------------------------------------------------------- */

describe('filtro de la consulta', () => {
  it("exige `subido_por` = 'Tasador' con la capitalización exacta", async () => {
    await proyectarFotosCaptura({ codigo_solicitud: CODIGO })

    expect(listRecords.mock.calls[0][0]).toBe(TABLA_ADJUNTOS)
    const { filterByFormula } = listRecords.mock.calls[0][1]

    // El singleSelect tiene hoy DOS opciones que sólo difieren en la mayúscula
    // —`Tasador` y `tasador`, esta última ya presente en filas reales—. Filtrar
    // por la minúscula deja fuera todas las fotos sin error visible.
    expect(SUBIDO_POR_TASADOR).toBe('Tasador')
    expect(filterByFormula).toContain('{subido_por}="Tasador"')
    expect(filterByFormula).toContain(`{solicitud}="${CODIGO}"`)
  })

  it('ordena por `orden` ascendente', async () => {
    await proyectarFotosCaptura({ codigo_solicitud: CODIGO })

    const params = listRecords.mock.calls[0][1]
    expect(params['sort[0][field]']).toBe('orden')
    expect(params['sort[0][direction]']).toBe('asc')
  })

  it('escapa las comillas del código', async () => {
    await proyectarFotosCaptura({ codigo_solicitud: 'VP-"2026"-0061' })

    expect(listRecords.mock.calls[0][1].filterByFormula).toContain('VP-\\"2026\\"-0061')
  })
})

/* -------------------------------------------------------------------------
 * Proyección vacía
 * ---------------------------------------------------------------------- */

describe('proyección vacía', () => {
  it('sin `codigo_solicitud` no consulta Airtable', async () => {
    const captura = await proyectarFotosCaptura({})

    // Un `filterByFormula` con cadena vacía traería la tabla entera: el Link
    // `solicitud` se evalúa contra el primary field de `TX_Solicitudes`.
    expect(listRecords).not.toHaveBeenCalled()
    expect(captura).toEqual({ fotos: [], porCategoria: {}, total: 0 })
  })

  it('sin fotos devuelve la captura vacía tras consultar', async () => {
    const captura = await proyectarFotosCaptura({ codigo_solicitud: CODIGO })

    expect(listRecords).toHaveBeenCalledTimes(1)
    expect(captura).toEqual({ fotos: [], porCategoria: {}, total: 0 })
  })

  it('`repartoDeCaptura(null)` da las ocho categorías vacías, no un hueco', () => {
    const reparto = repartoDeCaptura(null)

    // Nunca `undefined`: el spread sobre `resolverInforme` tiene que ser una
    // sustitución, no dejar la clave sin definir.
    expect(Object.keys(reparto.fotosPredefinidas).sort()).toEqual(
      CATEGORIAS_FOTO.map((c) => c.id).sort(),
    )
    expect(Object.values(reparto.fotosPredefinidas).every((v) => v.length === 0)).toBe(true)
    expect(reparto.categoriasCustom).toEqual([])
  })
})

/* -------------------------------------------------------------------------
 * repartirFotos sobre la proyección
 * ---------------------------------------------------------------------- */

describe('repartoDeCaptura sobre la proyección', () => {
  it('reparte las ocho del catálogo y las personalizadas', async () => {
    listRecords.mockResolvedValue([
      ...CATEGORIAS_FOTO.map((c, i) => fila(`rec${i}`, { descripcion: c.id, orden: i })),
      fila('recQ1', { descripcion: 'Quincho techado', orden: 8 }),
      fila('recQ2', { descripcion: 'Quincho techado', orden: 9 }),
    ])

    const captura = await proyectarFotosCaptura({ codigo_solicitud: CODIGO })
    const reparto = repartoDeCaptura(captura)

    expect(captura.total).toBe(10)
    for (const c of CATEGORIAS_FOTO) {
      expect(reparto.fotosPredefinidas[c.id]).toHaveLength(1)
    }
    expect(reparto.categoriasCustom).toHaveLength(1)
    expect(reparto.categoriasCustom[0].nombre).toBe('Quincho techado')
    expect(reparto.categoriasCustom[0].fotos).toHaveLength(2)
  })

  it('cuenta por categoría lo mismo que reparte', async () => {
    listRecords.mockResolvedValue([
      fila('rec1', { descripcion: 'habitaciones' }),
      fila('rec2', { descripcion: 'habitaciones' }),
      fila('rec3', { descripcion: 'cocina' }),
    ])

    const captura = await proyectarFotosCaptura({ codigo_solicitud: CODIGO })
    const reparto = repartoDeCaptura(captura)

    expect(captura.porCategoria).toEqual({ habitaciones: 2, cocina: 1 })
    expect(reparto.fotosPredefinidas.habitaciones).toHaveLength(2)
    expect(reparto.fotosPredefinidas.cocina).toHaveLength(1)
  })

  it('conserva el orden de llegada dentro de cada categoría', async () => {
    // El orden lo pone Airtable (`orden ASC`) y el reparto no reordena nada.
    listRecords.mockResolvedValue([
      fila('recA', { descripcion: 'banos', orden: 0 }),
      fila('recB', { descripcion: 'banos', orden: 1 }),
      fila('recC', { descripcion: 'banos', orden: 2 }),
    ])

    const reparto = repartoDeCaptura(await proyectarFotosCaptura({ codigo_solicitud: CODIGO }))

    expect(reparto.fotosPredefinidas.banos.map((f) => f.id)).toEqual(['recA', 'recB', 'recC'])
  })
})

/* -------------------------------------------------------------------------
 * leerFotosCaptura · el contrato de degradación
 * ---------------------------------------------------------------------- */

describe('leerFotosCaptura', () => {
  it('devuelve `null` con el guard en rojo, sin consultar adjuntos', async () => {
    autorizarSolicitud.mockResolvedValue({ ok: false, status: 403, mensaje: 'no disponible' })

    expect(await leerFotosCaptura(ID)).toBeNull()
    expect(listRecords).not.toHaveBeenCalled()
  })

  it('devuelve `null` —no lanza— si Airtable falla', async () => {
    listRecords.mockRejectedValue(new Error('Airtable 503'))

    // Mismo contrato que `leerTasacion` y `leerDatosCaptura`: la página abre con
    // el organizador vacío y el `useEffect` de `FotosScreen` reintenta por HTTP.
    // Una excepción acá tumbaría el Server Component entero.
    expect(await leerFotosCaptura(ID)).toBeNull()
  })

  it('proyecta cuando el guard pasa', async () => {
    listRecords.mockResolvedValue([fila('rec1', { descripcion: 'cocina' })])

    const captura = await leerFotosCaptura(ID)

    expect(captura?.total).toBe(1)
    expect(captura?.fotos[0].categoria).toBe('cocina')
  })
})
