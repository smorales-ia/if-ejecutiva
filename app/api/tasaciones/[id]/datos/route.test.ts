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
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { seccionEPorDefecto } from '@/lib/tasador/antecedentes-e'
import { _resetCacheComunas } from '@/lib/tasador/lectura-tasacion'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { _resetCacheZonificacion } from '@/lib/tasador/zonificacion'

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

describe('sección E · hoja «Antecedentes» en seccion_e_json (19-oct-2026)', () => {
  function seccionE() {
    const base = seccionEPorDefecto(
      {
        tipoPropiedad: 'Casa',
        nueva: false,
        estadoConservacion: 'BUENO',
        pisos: '1',
        supConstruida: '249.91',
        supPrimerPiso: '249.91',
        estacionamientos: '0',
        bodegas: '0',
      },
      { estar: { pavimento: 'ENMADERADO' } },
    )
    return {
      ...base,
      habitaciones: { ...base.habitaciones, n1: { ...base.habitaciones.n1, cantidades: { suite: 1, dormSimple: 3 } } },
    }
  }

  it('guarda el JSON, deriva las hijas desde él e ignora las claves E anteriores', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarPatch({
      seccionE: seccionE(),
      niveles: { n1: { living: 5 } },
      comodidades: { piscina: true },
      estructuraSoportante: 'texto viejo',
    })

    expect(res.status).toBe(200)
    const datos = createRecord.mock.calls.find(([tabla]) => tabla === TABLE_IDS.datosTasacion)
    const json = JSON.parse(String(datos?.[1].seccion_e_json))
    expect(json.terminaciones.estar).toMatchObject({ pavimento: 'ENMADERADO', material: 'MADERA' })

    const habitaciones = createRecord.mock.calls
      .filter(([tabla]) => tabla === TABLE_IDS.habitacionesPorNivel)
      .map(([, f]) => f.tipo_recinto)
    expect(habitaciones.sort()).toEqual(['D.Simple', 'Suite'])

    const terminaciones = createRecord.mock.calls.filter(([tabla]) => tabla === TABLE_IDS.terminacionesPorRecinto)
    expect(terminaciones.map(([, f]) => f.descripcion)).toEqual(['ENMADERADO'])

    const cuerpo = (await res.json()) as { data: { noPersistidos: string[] } }
    expect(cuerpo.data.noPersistidos).toEqual([])
  })

  it('sin seccionE, un bundle viejo sigue guardando con la forma anterior', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    await llamarPatch({ niveles: { n1: { living: 2 } } })

    const habitaciones = createRecord.mock.calls.filter(([tabla]) => tabla === TABLE_IDS.habitacionesPorNivel)
    expect(habitaciones.map(([, f]) => f.tipo_recinto)).toEqual(['Living'])
  })
})

describe('sección A · las dos fechas de visita (RF-TAS-17 · 19-oct-2026)', () => {
  it('la fecha real que trae el formulario se guarda en fecha_visita, aunque sea la heredada', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    // La heredada llega igual a la planificada: se guarda tal cual, sin colapsar campos.
    const res = await llamarPatch({
      fechaPlanificadaVisita: '2026-04-13',
      fechaVisitaReal: '2026-04-13',
    })

    expect(res.status).toBe(200)
    const llamada = updateRecord.mock.calls.find(([tabla]) => tabla === TABLE_IDS.solicitudes)
    expect(llamada?.[2]).toMatchObject({
      fecha_visita_programada: '2026-04-13',
      fecha_visita: '2026-04-13',
    })
  })
})

describe('candado origen_dato al guardar (T-LEGALES-CONSOLIDADOS-20261015)', () => {
  it('una fila creada por la lectura de documentos queda `tipeado` al guardar el formulario', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())
    listRecords.mockImplementation(async (tabla: string) =>
      tabla === TABLE_IDS.datosTasacion
        ? [{ id: 'recDATOS00000001', createdTime: '', fields: { origen_dato: 'extraido_rf09', sup_construccion_m2: 249.91 } }]
        : [],
    )

    const res = await llamarPatch({ supConstruida: '249.91', nCertificadoNoExpropiacion: '3444743' })

    expect(res.status).toBe(200)
    const llamada = updateRecord.mock.calls.find(([tabla]) => tabla === TABLE_IDS.datosTasacion)
    expect(llamada?.[1]).toBe('recDATOS00000001')
    expect(llamada?.[2]).toMatchObject({ origen_dato: 'tipeado', n_cert_no_expropiacion: '3444743' })
  })

  it('el candado no se audita como un cambio del tasador', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())
    listRecords.mockImplementation(async (tabla: string) =>
      tabla === TABLE_IDS.datosTasacion
        ? [{ id: 'recDATOS00000001', createdTime: '', fields: { origen_dato: 'extraido_rf09' } }]
        : [],
    )

    await llamarPatch({ supTerreno: '500' })

    const auditado = JSON.stringify(auditar.mock.calls)
    expect(auditado).not.toContain('origen_dato')
  })
})

describe('sección F · Sello SEC y candado de TX_DocumentosLegales (15-oct-2026)', () => {
  it('guarda el Sello SEC y deja la fila `tipeado`; vacíos de select y fecha van como null', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())
    listRecords.mockImplementation(async (tabla: string) =>
      tabla === TABLE_IDS.documentosLegales
        ? [{ id: 'recLEGAL00000001', createdTime: '', fields: { origen_dato: 'extraido_rf09', fojas: '3312' } }]
        : [],
    )

    const res = await llamarPatch({ cbrFoja: '3312', selloSec: 'no_aplica', selloSecId: '', selloSecVencimiento: '' })

    expect(res.status).toBe(200)
    const llamada = updateRecord.mock.calls.find(([tabla]) => tabla === TABLE_IDS.documentosLegales)
    expect(llamada?.[1]).toBe('recLEGAL00000001')
    expect(llamada?.[2]).toEqual({
      fojas: '3312',
      sello_sec: 'no_aplica',
      sello_sec_id: '',
      sello_sec_vencimiento: null,
      origen_dato: 'tipeado',
    })
  })

  it('el Sello SEC ya no se reporta como no persistido', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarPatch({ selloSec: 'vigente', selloSecVencimiento: '2027-03-01' })

    expect(JSON.stringify(await res.json())).not.toContain('selloSec')
  })
})

describe('sección F · comprador, notaría y repertorio retirados (15-oct-2026)', () => {
  it('un PATCH de un bundle viejo que todavía los manda responde 200 y no los escribe', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarPatch({ cbrFoja: '3312', comprador: 'X', notaria: 'N', repertorio: 'R' })

    expect(res.status).toBe(200)
    const escrito = JSON.stringify([...createRecord.mock.calls, ...updateRecord.mock.calls])
    expect(escrito).toContain('3312')
    expect(escrito).not.toMatch(/comprador|notaria|repertorio/)
  })
})

describe('sección B · estado de conservación y calidad de construcción (14-oct-2026)', () => {
  /** Los `fields` con que el PATCH creó la fila de `TX_DatosTasacion`. */
  function camposCreadosEnDatos(): Record<string, unknown> {
    const llamada = createRecord.mock.calls.find(([tabla]) => tabla === TABLE_IDS.datosTasacion)
    return (llamada?.[1] ?? {}) as Record<string, unknown>
  }

  it('el GET abre con los defaults de la planilla: BUENO y BUENA', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarGet()
    const cuerpo = await res.json()

    expect(res.status).toBe(200)
    expect(JSON.stringify(cuerpo)).toContain('"estadoConservacion":"BUENO"')
    expect(JSON.stringify(cuerpo)).toContain('"calidadConstruccion":"BUENA"')
  })

  it('el PATCH guarda los literales tal cual en TX_DatosTasacion', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarPatch({ estadoConservacion: 'BUENO', calidadConstruccion: 'BUENA' })

    expect(res.status).toBe(200)
    expect(camposCreadosEnDatos()).toMatchObject({
      estado_conservacion: 'BUENO',
      calidad_construccion: 'BUENA',
    })
  })

  it('una estrella numérica de un borrador viejo no rebota ni se escribe', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk())

    const res = await llamarPatch({ supTerreno: '500', calidadConstruccion: 4 })

    expect(res.status).toBe(200)
    expect('calidad_construccion' in camposCreadosEnDatos()).toBe(false)
  })
})

describe('sección B · zona del plan regulador (§2.8.1 · 14-oct-2026)', () => {
  const TABLA_COMUNAS = 'tblyggAfQfq682XHK'
  const COLINA = 'recColina0000001'

  function camposCreadosEnDatos(): Record<string, unknown> {
    const llamada = createRecord.mock.calls.find(([tabla]) => tabla === TABLE_IDS.datosTasacion)
    return (llamada?.[1] ?? {}) as Record<string, unknown>
  }

  /** Solicitud de Colina; M_Zonificacion de Colina con A1 y E2a. */
  function airtableColina() {
    autorizarSolicitud.mockResolvedValue({
      ...guardOk(),
      fields: { ...guardOk().fields, comuna: [COLINA] },
    })
    listRecords.mockImplementation(async (tabla: string) => {
      if (tabla === TABLA_COMUNAS) return [{ id: COLINA, createdTime: '', fields: { nombre: 'Colina' } }]
      if (tabla === TABLE_IDS.zonificacion) {
        return [
          { id: 'recZonaA1000001', createdTime: '', fields: { zona: 'A1' } },
          { id: 'recZonaE2a00001', createdTime: '', fields: { zona: 'E2a' } },
        ]
      }
      return []
    })
  }

  beforeEach(() => {
    _resetCacheComunas()
    _resetCacheZonificacion()
  })

  it('zona de la lista → guarda el código y el Link a M_Zonificacion', async () => {
    airtableColina()

    const res = await llamarPatch({ tipoZona: 'e2a' })

    expect(res.status).toBe(200)
    expect(camposCreadosEnDatos()).toMatchObject({
      tipo_zona_descripcion: 'E2a',
      zonificacion: ['recZonaE2a00001'],
    })
  })

  it('zona escrita a mano que no está en la lista → código tal cual y Link vacío', async () => {
    airtableColina()

    await llamarPatch({ tipoZona: 'IPB' })

    expect(camposCreadosEnDatos()).toMatchObject({ tipo_zona_descripcion: 'IPB', zonificacion: [] })
  })

  it('no guarda la comuna aunque venga tecleada: «IPB (Colina)» → «IPB»', async () => {
    airtableColina()

    await llamarPatch({ tipoZona: 'IPB (Colina)' })

    expect(camposCreadosEnDatos()).toMatchObject({ tipo_zona_descripcion: 'IPB' })
  })

  it('sin tipoZona en el payload no consulta comunas ni zonas, ni toca los dos campos', async () => {
    airtableColina()

    await llamarPatch({ supTerreno: '500' })

    const tablas = listRecords.mock.calls.map(([tabla]) => tabla)
    expect(tablas).not.toContain(TABLA_COMUNAS)
    expect(tablas).not.toContain(TABLE_IDS.zonificacion)
    expect('tipo_zona_descripcion' in camposCreadosEnDatos()).toBe(false)
    expect('zonificacion' in camposCreadosEnDatos()).toBe(false)
  })
})
