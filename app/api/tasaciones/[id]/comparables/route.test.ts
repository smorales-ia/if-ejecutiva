import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `GET /api/tasaciones/[id]/comparables` — CI-056, cierre de A-13.
 *
 * ## El candado que da nombre al archivo
 *
 * El primer `describe` no prueba comportamiento: prueba una **ausencia**. La
 * ruta exponía `POST` y `DELETE`, los dos se retiraron al pasar la sección D a
 * sólo lectura, y la forma de que no vuelvan sin que nadie lea la ficha es
 * afirmar que el módulo no los exporta. Un test de tres líneas que sobrevive a
 * refactors, renames y merges — cosa que un comentario no hace.
 *
 * Si algún día hay que reponerlos, el test falla y obliga a leer **A-18** (el
 * protocolo de resurrección) y **A-45** (qué hace el re-fotografiado con las
 * filas previas), que es exactamente la conversación que debe ocurrir antes.
 *
 * ## Lo que NO se prueba acá
 *
 * El guard `autorizarSolicitud` en profundidad: es implementación única y está
 * cubierto en `datos/route.test.ts`, que además puede afirmar lo que una ruta
 * de lectura no puede —que un guard fallido no escribió nada—. Acá sólo se
 * afirma que se propaga y que corta antes de leer.
 *
 * El mapeo Airtable → `Comparable` vive en `lib/tasador/lectura-datos.ts` y
 * tiene su propio test; acá se comprueba que la ruta lo usa y no reimplementa
 * uno paralelo, que es la duplicación que CI-056 vino a cerrar.
 */

const autorizarSolicitud = vi.fn()
const listRecords = vi.fn()

vi.mock('@/lib/tasador/auth-guard', () => ({
  autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
}))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

import * as ruta from './route'
import { GET } from './route'
import { MENSAJES } from '@/lib/tasador/mensajes'

const ID = 'recAAAAAAAAAAAAAA'
const ID_INVALIDO = 'no-es-un-record-id'
const CODIGO = 'VP-2026-0060'

const MODOS = [
  { nombre: 'solicitud ajena', status: 403 as const, id: ID },
  { nombre: 'solicitud inexistente', status: 404 as const, id: ID },
  { nombre: 'id con forma inválida', status: 404 as const, id: ID_INVALIDO },
]

function guardFalla(status: 403 | 404) {
  return { ok: false, status, mensaje: MENSAJES.solicitudNoDisponible }
}

function guardOk(codigo = CODIGO) {
  return {
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: codigo, estado: 'asignada' },
  }
}

function fila(id: string, fields: Record<string, unknown>) {
  return { id, createdTime: '', fields }
}

function llamar(id = ID) {
  return GET({} as never, { params: Promise.resolve({ id }) })
}

/**
 * Cuerpo útil de la respuesta. `ok()` envuelve en `{ data }` (ver
 * `lib/tasador/respuestas.ts`); el envoltorio es contrato de toda IF-03 y no se
 * repite en cada aserción.
 */
async function datos(id = ID) {
  const res = await llamar(id)
  return (await res.json()).data
}

beforeEach(() => {
  vi.clearAllMocks()
  listRecords.mockResolvedValue([])
})

describe('candado A-13 · la ruta es de sólo lectura', () => {
  it('no exporta POST', () => {
    expect('POST' in ruta).toBe(false)
  })

  it('no exporta DELETE', () => {
    expect('DELETE' in ruta).toBe(false)
  })

  it('no exporta PATCH ni PUT', () => {
    expect('PATCH' in ruta).toBe(false)
    expect('PUT' in ruta).toBe(false)
  })
})

describe('GET · el guard corta antes de leer', () => {
  for (const modo of MODOS) {
    it(`responde ${modo.status} ante ${modo.nombre}`, async () => {
      autorizarSolicitud.mockResolvedValue(guardFalla(modo.status))

      const res = await llamar(modo.id)

      expect(res.status).toBe(modo.status)
      expect(listRecords).not.toHaveBeenCalled()
    })
  }
})

describe('GET · sin código de solicitud no se consulta la tabla', () => {
  /**
   * Un `filterByFormula` con cadena vacía no filtra nada: devolvería
   * `TX_Comparables` **entera**, o sea los comparables de todas las solicitudes
   * de todos los tasadores. La rama existe para eso y por eso se prueba.
   */
  it('devuelve la grilla vacía sin llamar a Airtable', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk(''))

    const res = await llamar()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: { id: ID, comparables: [], total: 0 } })
    expect(listRecords).not.toHaveBeenCalled()
  })
})

describe('GET · proyección de las filas', () => {
  it('traduce tipo_referencia al discriminador del formulario', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())
    listRecords.mockResolvedValue([
      fila('rec00000000000001', { direccion: 'Av. Apoquindo 5230', tipo_referencia: 'Oferta' }),
      fila('rec00000000000002', { direccion: 'Los Militares 4600', tipo_referencia: 'CBR' }),
    ])

    const cuerpo = await datos()

    expect(cuerpo.comparables.map((c: { fuente: string }) => c.fuente)).toEqual([
      'oferta',
      'cbr',
    ])
  })

  /**
   * `tipo_referencia` es un singleSelect de dos opciones: un valor fuera de
   * dominio es dato roto, no un tercer tipo. Cae en `'oferta'` porque
   * `Comparable.fuente` no admite `null`. Lo que importa es que **no rompe**.
   */
  it('cae en oferta ante un tipo_referencia desconocido o ausente', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())
    listRecords.mockResolvedValue([
      fila('rec00000000000001', { tipo_referencia: 'Remate' }),
      fila('rec00000000000002', {}),
    ])

    const cuerpo = await datos()

    expect(cuerpo.comparables.map((c: { fuente: string }) => c.fuente)).toEqual([
      'oferta',
      'oferta',
    ])
  })

  /**
   * D-5: hasta CI-056 la ruta devolvía los numéricos como `number | null`
   * mientras `Comparable` los declara `string`, y nadie lo veía porque la ruta
   * no estaba tipada contra el tipo. Ahora comparte el mapeo con la hidratación
   * de la pantalla, así que las dos superficies no pueden divergir.
   */
  it('normaliza los numéricos a string y los ausentes a cadena vacía', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())
    listRecords.mockResolvedValue([
      fila('rec00000000000001', {
        direccion: 'Av. Apoquindo 5230',
        comuna_comparable: 'Las Condes',
        sup_terreno_m2: 320,
        sup_construccion_m2: 180.5,
        precio_uf: 12500,
        anio: 2015,
        tipo_referencia: 'Oferta',
        telefono_contacto: '+56 9 1234 5678',
      }),
    ])

    const cuerpo = await datos()

    expect(cuerpo.comparables[0]).toEqual({
      id: 'rec00000000000001',
      direccionReferencia: 'Av. Apoquindo 5230',
      comuna: 'Las Condes',
      supTerreno: '320',
      supConstruida: '180.5',
      totalUf: '12500',
      anio: '2015',
      fuente: 'oferta',
      factorSup: '',
      factorEdad: '',
      factorDistancia: '',
      telefonoContacto: '+56 9 1234 5678',
      foja: '',
      numero: '',
    })
  })

  it('informa el total junto a las filas', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())
    listRecords.mockResolvedValue([
      fila('rec00000000000001', {}),
      fila('rec00000000000002', {}),
      fila('rec00000000000003', {}),
    ])

    const cuerpo = await datos()

    expect(cuerpo.total).toBe(3)
    expect(cuerpo.comparables).toHaveLength(3)
  })

  it('filtra por el código de la solicitud, no por su record id', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    await llamar()

    const [, opciones] = listRecords.mock.calls[0]
    expect(opciones.filterByFormula).toContain(CODIGO)
    expect(opciones.filterByFormula).not.toContain(ID)
  })
})
