import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P2-TAS.A · plan §3.2 paso 8 — el guard 403 de RF-TAS-09.
 *
 * `autorizarSolicitud` es **implementación única** compartida por las once
 * rutas de IF-03 (`lib/tasador/auth-guard.ts`), así que probarlo acá lo prueba
 * para todas. No se duplica en las otras rutas: cada una afirma sólo que
 * propaga el fallo sin escribir.
 *
 * ## Por qué el guard se prueba en `/datos` y no en una ruta de sólo lectura
 *
 * `/datos` es la única ruta donde una falla del guard sería **destructiva**: el
 * sync de las tablas hijas borra filas (RO-31). En el resto, un guard roto
 * filtra datos ajenos; acá los **elimina**. Eso permite afirmar algo que una
 * ruta de lectura no puede: que ante un 403 no hubo *ninguna* escritura. Un 403
 * que igual borró filas es un 403 inútil, y esa diferencia es invisible mirando
 * el código de estado.
 *
 * ## El candado sobre la no-filtración de existencia
 *
 * El guard trata «no existe», «no es tuya» e «id con forma inválida» con el
 * **mismo cuerpo de respuesta**, a propósito: distinguirlos le confirmaría a un
 * tercero que un código de solicitud existe. Los tests de abajo comparan los
 * tres cuerpos entre sí, no contra un literal — así el candado sigue cerrado
 * aunque el mensaje cambie de redacción.
 *
 * ⚠ **El candado protege el cuerpo, no el status.** Hoy la solicitud ajena
 * responde **403** y las otras dos **404**, de modo que un tercero todavía
 * puede distinguir «existe pero no es tuya» de «no existe» por el código de
 * estado. Los tests documentan ese comportamiento tal cual es. Cerrar esa
 * diferencia es una decisión de producto —implicaría devolver 404 también para
 * la ajena— y no se toma desde un test.
 *
 * ## Lo que NO se prueba acá
 *
 * El guard de **Clerk** (sesión de la Ejecutiva), que ya está cubierto en
 * `solicitudes/[id]/asignar/route.test.ts` y `solicitudes/[id]/sla/route.test.ts`.
 * Es otro guard: aquél autentica; `autorizarSolicitud` autoriza la pertenencia
 * de una solicitud a un tasador (RF-09). Tampoco se re-prueban el 409 de
 * `/calcular` ni los 20 caracteres de `/rechazo`, que tienen sus propios
 * archivos.
 */

const autorizarSolicitud = vi.fn()
const listRecords = vi.fn()
const getRecord = vi.fn()
const createRecord = vi.fn()
const updateRecord = vi.fn()
const deleteRecords = vi.fn()
const auditar = vi.fn()

vi.mock('@/lib/tasador/auth-guard', () => ({
  autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
}))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
    listRecords: (...args: unknown[]) => listRecords(...args),
    getRecord: (...args: unknown[]) => getRecord(...args),
    createRecord: (...args: unknown[]) => createRecord(...args),
    updateRecord: (...args: unknown[]) => updateRecord(...args),
  }
})

vi.mock('@/lib/tasador/airtable-writes', () => ({
  deleteRecords: (...args: unknown[]) => deleteRecords(...args),
}))

vi.mock('@/lib/tasador/auditoria', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/tasador/auditoria')>()
  return { ...real, auditar: (...args: unknown[]) => auditar(...args) }
})

import { GET, PATCH } from './route'
import { MENSAJES } from '@/lib/tasador/mensajes'

const ID = 'recAAAAAAAAAAAAAA'
const ID_INVALIDO = 'no-es-un-record-id'
const CODIGO = 'VP-2026-0060'

/** Los tres modos de fallo del guard, con el status real de cada uno. */
const MODOS = [
  { nombre: 'solicitud ajena', status: 403 as const, id: ID },
  { nombre: 'solicitud inexistente', status: 404 as const, id: ID },
  { nombre: 'id con forma inválida', status: 404 as const, id: ID_INVALIDO },
]

function guardFalla(status: 403 | 404) {
  return { ok: false, status, mensaje: MENSAJES.solicitudNoDisponible }
}

function guardOk() {
  return {
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: CODIGO, estado: 'asignada' },
  }
}

function llamarGet(id = ID) {
  return GET({} as never, { params: Promise.resolve({ id }) })
}

function llamarPatch(body: unknown = { supTerreno: '500' }, id = ID) {
  const request = { json: async () => body } as never
  return PATCH(request, { params: Promise.resolve({ id }) })
}

/** Toda función que toque Airtable. Ninguna debe correr tras un guard fallido. */
function todosLosAccesos() {
  return { listRecords, getRecord, createRecord, updateRecord, deleteRecords }
}

beforeEach(() => {
  vi.clearAllMocks()
  listRecords.mockResolvedValue([])
  createRecord.mockResolvedValue({ id: 'recNUEVA00000001', createdTime: '', fields: {} })
  updateRecord.mockResolvedValue({ id: ID, createdTime: '', fields: {} })
  deleteRecords.mockResolvedValue(0)
  auditar.mockResolvedValue(1)
})

describe('GET · el guard corta antes de leer', () => {
  for (const modo of MODOS) {
    it(`responde ${modo.status} ante ${modo.nombre}`, async () => {
      autorizarSolicitud.mockResolvedValue(guardFalla(modo.status))

      const res = await llamarGet(modo.id)

      expect(res.status).toBe(modo.status)
    })

    it(`no lee ninguna tabla ante ${modo.nombre}`, async () => {
      autorizarSolicitud.mockResolvedValue(guardFalla(modo.status))

      await llamarGet(modo.id)

      // Cero lecturas: el 403 no filtra ni siquiera de forma indirecta, por
      // tiempo de respuesta o por un error de Airtable que se propagara.
      expect(listRecords).not.toHaveBeenCalled()
      expect(getRecord).not.toHaveBeenCalled()
    })
  }

  it('devuelve el MISMO cuerpo en los tres modos', async () => {
    const cuerpos: unknown[] = []

    for (const modo of MODOS) {
      vi.clearAllMocks()
      autorizarSolicitud.mockResolvedValue(guardFalla(modo.status))
      cuerpos.push(await (await llamarGet(modo.id)).json())
    }

    // Se comparan entre sí, no contra un literal: el candado sobrevive a un
    // cambio de redacción del mensaje. Lo que no puede cambiar es que los tres
    // digan lo mismo — si divergen, el cuerpo revela si la solicitud existe.
    expect(cuerpos[0]).toEqual(cuerpos[1])
    expect(cuerpos[1]).toEqual(cuerpos[2])
  })

  it('el cuerpo no nombra la solicitud ni al tasador dueño', async () => {
    autorizarSolicitud.mockResolvedValue(guardFalla(403))

    const texto = JSON.stringify(await (await llamarGet()).json())

    expect(texto).not.toContain(ID)
    expect(texto).not.toContain(CODIGO)
    expect(texto).not.toMatch(/rec[a-zA-Z0-9]{14}/)
  })
})

describe('PATCH · el guard corta antes de escribir', () => {
  for (const modo of MODOS) {
    it(`responde ${modo.status} ante ${modo.nombre}`, async () => {
      autorizarSolicitud.mockResolvedValue(guardFalla(modo.status))

      const res = await llamarPatch(undefined, modo.id)

      expect(res.status).toBe(modo.status)
    })

    it(`no escribe NADA ante ${modo.nombre}`, async () => {
      autorizarSolicitud.mockResolvedValue(guardFalla(modo.status))

      await llamarPatch({ supTerreno: '500', items: [], recintos: [] }, modo.id)

      // La aserción central del archivo. `deleteRecords` es la que más importa:
      // el sync de las hijas borra filas, así que un guard que dejara pasar la
      // escritura destruiría datos de una solicitud ajena. Un 403 con filas
      // borradas es indistinguible de un 403 correcto mirando sólo el status.
      for (const [nombre, mock] of Object.entries(todosLosAccesos())) {
        expect(mock, `${nombre} fue llamado`).not.toHaveBeenCalled()
      }
    })
  }

  it('devuelve el MISMO cuerpo en los tres modos', async () => {
    const cuerpos: unknown[] = []

    for (const modo of MODOS) {
      vi.clearAllMocks()
      autorizarSolicitud.mockResolvedValue(guardFalla(modo.status))
      cuerpos.push(await (await llamarPatch(undefined, modo.id)).json())
    }

    expect(cuerpos[0]).toEqual(cuerpos[1])
    expect(cuerpos[1]).toEqual(cuerpos[2])
  })

  it('el GET y el PATCH fallan con el mismo cuerpo', async () => {
    autorizarSolicitud.mockResolvedValue(guardFalla(403))
    const cuerpoGet = await (await llamarGet()).json()

    vi.clearAllMocks()
    autorizarSolicitud.mockResolvedValue(guardFalla(403))
    const cuerpoPatch = await (await llamarPatch()).json()

    // Si divergieran, el método revelaría información: probar con PATCH diría
    // algo que el GET calla.
    expect(cuerpoGet).toEqual(cuerpoPatch)
  })
})

describe('el guard corre ANTES que Zod', () => {
  it('un cuerpo inválido desde una sesión ajena da 403, no 400', async () => {
    autorizarSolicitud.mockResolvedValue(guardFalla(403))

    // Payload con basura: si la validación corriera primero, el 400 le
    // confirmaría al atacante qué forma tiene el body que la ruta espera.
    const res = await llamarPatch({ supTerreno: { no: 'es un número' }, items: 'tampoco' })

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: MENSAJES.solicitudNoDisponible })
  })

  it('un JSON malformado desde una sesión ajena también da 403', async () => {
    autorizarSolicitud.mockResolvedValue(guardFalla(403))

    const request = {
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    } as never
    const res = await PATCH(request, { params: Promise.resolve({ id: ID }) })

    // El guard ni siquiera llegó a pedir el cuerpo, así que el throw no ocurre.
    expect(res.status).toBe(403)
  })
})

describe('con el guard en verde la ruta sí trabaja', () => {
  it('el GET lee las tablas', async () => {
    // Control negativo: sin esto, un GET roto que no leyera nunca nada haría
    // pasar todos los tests de arriba por la razón equivocada.
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarGet()

    expect(res.status).toBe(200)
    expect(listRecords).toHaveBeenCalled()
  })

  it('el PATCH escribe', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarPatch({ supTerreno: '500' })

    expect(res.status).toBe(200)
    // Sin fila previa de TX_DatosTasacion, el upsert crea.
    expect(createRecord).toHaveBeenCalled()
  })
})
