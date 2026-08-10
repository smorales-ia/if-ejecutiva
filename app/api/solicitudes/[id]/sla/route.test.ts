import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MatrizEtapas } from '@/lib/sla-etapas'

/**
 * Tanda C · C-4 — contrato de `GET /api/solicitudes/[id]/sla`.
 *
 * El invariante central es **siempre siete entradas**. Devolver sólo las
 * pobladas haría que "esta etapa todavía no empezó" y "esta etapa no existe" se
 * vieran igual en pantalla, y en v1.9 lo normal es que cinco de las siete no
 * tengan escritor (§9.6.1 · *Quién escribe cada etapa*).
 */

const auth = vi.fn()
const getRecord = vi.fn()
const obtenerMatrizEtapas = vi.fn()
const obtenerSlaDelPar = vi.fn()
const obtenerFeriados = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({ auth: () => auth() }))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  // `AirtableError` e `isValidRecordId` se conservan reales: el handler los usa
  // para discriminar el 404, y falsearlos probaría el mock, no la ruta.
  return { ...real, getRecord: (...args: unknown[]) => getRecord(...args) }
})

vi.mock('@/lib/sla-etapas', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/sla-etapas')>()
  return {
    ...real,
    obtenerMatrizEtapas: () => obtenerMatrizEtapas(),
    obtenerSlaDelPar: (s: Record<string, unknown>) => obtenerSlaDelPar(s),
  }
})

vi.mock('@/lib/feriados', () => ({ obtenerFeriados: () => obtenerFeriados() }))

// Import estático, no `await import(...)`: `vi.mock` se iza por encima de los
// imports, así que el mock ya está puesto cuando la ruta se evalúa. Un
// `await import` de nivel superior obligaría además a mover `module` a esnext
// sólo para los tests (TS1378).
import { GET } from './route'

const ID = 'recAAAAAAAAAAAAAA'

/** Copia literal de §5.2.4 — fixture, igual que en `sla-etapas.test.ts`. */
const MATRIZ: MatrizEtapas = {
  e1: { etapaKey: 'e1', orden: 1, nombre: 'Ingreso de solicitud', responsable: 'control_seguimiento', idealHoras: 2, maxHoras: 3 },
  e2: { etapaKey: 'e2', orden: 2, nombre: 'Coordinación de visita (llamado)', responsable: 'tasador', idealHoras: 4, maxHoras: 6 },
  e3: { etapaKey: 'e3', orden: 3, nombre: 'Informe post-llamado', responsable: 'tasador', idealHoras: 0.5, maxHoras: 0.5 },
  e4: { etapaKey: 'e4', orden: 4, nombre: 'Aviso de coordinación al cliente', responsable: 'control_seguimiento', idealHoras: 2, maxHoras: 3 },
  e5: { etapaKey: 'e5', orden: 5, nombre: 'Visita y envío de informe', responsable: 'tasador', idealHoras: 24, maxHoras: 48 },
  e6: { etapaKey: 'e6', orden: 6, nombre: 'Disponible para visado', responsable: 'control_seguimiento', idealHoras: 2, maxHoras: 3 },
  e7: { etapaKey: 'e7', orden: 7, nombre: 'Visación y envío final', responsable: 'visado', idealHoras: 0.5, maxHoras: 0.5 },
}

function llamar(id = ID) {
  return GET({} as never, { params: Promise.resolve({ id }) })
}

function conFila(fields: Record<string, unknown>) {
  getRecord.mockResolvedValue({ id: ID, createdTime: '2026-08-10T12:00:00.000Z', fields })
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.mockResolvedValue({ userId: 'user_123' })
  obtenerMatrizEtapas.mockResolvedValue(MATRIZ)
  obtenerSlaDelPar.mockResolvedValue({ clave: 'SLA_DEFAULT_GLOBAL', revisionHoras: null })
  obtenerFeriados.mockResolvedValue(new Set(['2026-09-18']))
  conFila({})
})

describe('autorización', () => {
  it('responde 401 sin sesión Clerk', async () => {
    auth.mockResolvedValue({ userId: null })
    const res = await llamar()
    expect(res.status).toBe(401)
  })

  it('no toca Airtable cuando no hay sesión', async () => {
    // La autorización va antes de la lectura: sin sesión no se gasta una
    // llamada ni se revela si el record existe.
    auth.mockResolvedValue({ userId: null })
    await llamar()
    expect(getRecord).not.toHaveBeenCalled()
  })
})

describe('validación del [id]', () => {
  it('responde 404 ante un id que no tiene formato de record', async () => {
    for (const malo of ['123', 'rec-corto', '', 'tblAAAAAAAAAAAAAA']) {
      expect((await llamar(malo)).status).toBe(404)
    }
    expect(getRecord).not.toHaveBeenCalled()
  })

  it('responde 404 cuando la solicitud no existe', async () => {
    getRecord.mockResolvedValue(null)
    const res = await llamar()
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('Solicitud no encontrada.')
  })
})

describe('contrato de las siete etapas', () => {
  it('devuelve siempre siete entradas, aun sin ningún timestamp', async () => {
    const res = await llamar()
    const { data } = await res.json()
    expect(res.status).toBe(200)
    expect(data.etapas).toHaveLength(7)
    expect(data.etapas.map((e: { numero: number }) => e.numero)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('marca pendiente todo lo no instrumentado, sin fabricar tiempos', async () => {
    const { data } = await (await llamar()).json()
    for (const etapa of data.etapas) {
      expect(etapa.estado).toBe('pendiente')
      expect(etapa.minutosHabiles).toBeNull()
      expect(etapa.inicioTs).toBeNull()
      expect(etapa.venceTs).toBeNull()
    }
    expect(data.etapaActual).toBeNull()
  })

  it('trae nombre, responsable y umbrales desde C_SLA_Etapas', async () => {
    const { data } = await (await llamar()).json()
    expect(data.etapas[0]).toMatchObject({
      etapaKey: 'e1',
      nombre: 'Ingreso de solicitud',
      responsable: 'control_seguimiento',
      slaIdealHoras: 2,
      slaMaxHoras: 3,
    })
  })

  it('distingue completada · en_curso · pendiente por sus timestamps', async () => {
    conFila({
      sla_e1_inicio_ts: '2026-08-10T13:10:00.000Z', // lun 09:10 Santiago
      sla_e1_fin_ts: '2026-08-10T15:40:00.000Z', // lun 11:40
      sla_e2_inicio_ts: '2026-08-10T15:40:00.000Z',
      sla_etapa_alerta_ts: '2026-08-10T19:40:00.000Z',
      sla_etapa_vence_ts: '2026-08-10T21:40:00.000Z',
    })
    const { data } = await (await llamar()).json()
    expect(data.etapas[0].estado).toBe('completada')
    expect(data.etapas[1].estado).toBe('en_curso')
    expect(data.etapas[2].estado).toBe('pendiente')
    expect(data.etapaActual).toBe(2)
  })

  it('mide los minutos hábiles de una etapa cerrada contra su fin, no contra ahora', async () => {
    conFila({
      sla_e1_inicio_ts: '2026-08-10T13:10:00.000Z',
      sla_e1_fin_ts: '2026-08-10T15:40:00.000Z',
    })
    const { data } = await (await llamar()).json()
    expect(data.etapas[0].minutosHabiles).toBe(150) // 09:10 → 11:40 = 2h 30m
  })

  it('publica los dos umbrales sólo en la etapa en curso', async () => {
    conFila({
      sla_e1_inicio_ts: '2026-08-10T13:10:00.000Z',
      sla_etapa_alerta_ts: '2026-08-10T15:10:00.000Z',
      sla_etapa_vence_ts: '2026-08-10T16:10:00.000Z',
    })
    const { data } = await (await llamar()).json()
    expect(data.etapas[0].estado).toBe('en_curso')
    expect(data.etapas[0].venceTs).toBe('2026-08-10T16:10:00.000Z')
    // Copiarlos a las otras seis sugeriría que los umbrales de la etapa vigente
    // aplican a todas.
    expect(data.etapas[1].venceTs).toBeNull()
  })

  it('trata como completada una etapa con fin y sin inicio (backfill A-5)', async () => {
    conFila({ sla_e1_fin_ts: '2026-08-10T15:40:00.000Z' })
    const { data } = await (await llamar()).json()
    expect(data.etapas[0].estado).toBe('completada')
    expect(data.etapas[0].minutosHabiles).toBeNull()
  })

  it('aplica el override de e7 de C_SLA cuando existe (§9.6-R3)', async () => {
    obtenerSlaDelPar.mockResolvedValue({ clave: 'SLA_X', revisionHoras: 3 })
    const { data } = await (await llamar()).json()
    expect(data.etapas[6]).toMatchObject({ slaIdealHoras: 3, slaMaxHoras: 3 })
    // Y sólo la 7: el override no toca ninguna otra etapa.
    expect(data.etapas[0]).toMatchObject({ slaIdealHoras: 2, slaMaxHoras: 3 })
  })
})

describe('sólo lectura', () => {
  it('no escribe en Airtable en ninguna rama', async () => {
    const cliente = await import('@/lib/airtable-client')
    const update = vi.spyOn(cliente, 'updateRecord')
    const create = vi.spyOn(cliente, 'createRecord')
    conFila({ sla_e1_inicio_ts: '2026-08-10T13:10:00.000Z' })
    await llamar()
    expect(update).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it('lee en formato JSON, sin cellFormat=string', async () => {
    // Con `cellFormat: 'string'` los dateTime llegan renderizados en es-CL y los
    // links como texto; este handler necesita ISO y record IDs para resolver el
    // par de `C_SLA`.
    await llamar()
    expect(getRecord).toHaveBeenCalledWith(expect.any(String), ID)
  })
})

describe('errores', () => {
  it('responde 502 y mensaje humano si Airtable falla', async () => {
    getRecord.mockRejectedValue(new Error('boom'))
    const res = await llamar()
    expect(res.status).toBe(502)
    expect((await res.json()).error).toBe(
      'No pudimos completar la acción. Intenta nuevamente en unos segundos.'
    )
  })

  it('responde 502 —no 200 vacío— si C_SLA_Etapas no tiene filas', async () => {
    // Sin matriz no hay umbrales, y devolver siete etapas con ceros sería
    // inventar plazos que la base no respalda.
    obtenerMatrizEtapas.mockRejectedValue(new Error('C_SLA_Etapas vacía'))
    expect((await llamar()).status).toBe(502)
  })
})
