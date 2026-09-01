import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P4-TAS · bloque 4+5 — `POST /api/tasaciones/[id]/coordinacion`.
 *
 * Cubre lo que sólo esta ruta puede afirmar. **No re-prueba el guard de
 * pertenencia**: `autorizarSolicitud` es implementación única y está cubierto
 * en `datos/route.test.ts`; acá sólo se comprueba que un guard fallido no
 * escribe.
 *
 * ## Los tres candados que justifican este archivo
 *
 * 1. **`estado` no se toca.** §2.3 lo exige y es invisible mirando el código:
 *    una línea de más en el `updateRecord` haría que coordinar una visita
 *    disparara AT03. El test compara el payload real del PATCH.
 * 2. **`motivo` se valida contra el catálogo de Airtable**, no contra un enum
 *    local (A-17). Con `typecast: true`, un motivo inventado se habría
 *    **creado como opción nueva** en silencio.
 * 3. **Idempotencia por ventana deslizante**, con el reloj congelado. Sin
 *    `vi.setSystemTime` el test sería temporal y frágil.
 */

const autorizarSolicitud = vi.fn()
const listRecords = vi.fn()
const createRecord = vi.fn()
const updateRecord = vi.fn()
const auditar = vi.fn()
const marcarFinEtapa = vi.fn()
const opcionesDeSingleSelect = vi.fn()

vi.mock('@/lib/tasador/auth-guard', () => ({
  autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
}))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
    listRecords: (...args: unknown[]) => listRecords(...args),
    createRecord: (...args: unknown[]) => createRecord(...args),
    updateRecord: (...args: unknown[]) => updateRecord(...args),
  }
})

vi.mock('@/lib/tasador/auditoria', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/tasador/auditoria')>()
  return { ...real, auditar: (...args: unknown[]) => auditar(...args) }
})

vi.mock('@/lib/sla-etapas', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/sla-etapas')>()
  return { ...real, marcarFinEtapa: (...args: unknown[]) => marcarFinEtapa(...args) }
})

vi.mock('@/lib/tasador/schema-airtable', () => ({
  opcionesDeSingleSelect: (...args: unknown[]) => opcionesDeSingleSelect(...args),
}))

// La ruta resuelve la identidad Clerk directamente (para `autor_clerk_id`),
// aparte del guard. Sin este mock, `getUsuarioTasador()` llamaría a `auth()` de
// Clerk, que lanza fuera de un request. El `usuarioId` no se asevera en ningún
// test; sólo importa que la identidad resuelva y la ruta no devuelva 403.
vi.mock('@/lib/tasador/usuario', () => ({
  getUsuarioTasador: vi.fn().mockResolvedValue({
    usuarioId: 'user_test_coord',
    recordId: 'recSR3RxY6rsLb8k7',
    nombre: 'Tasador Test',
  }),
}))

import { POST } from './route'
import { MENSAJES } from '@/lib/tasador/mensajes'

const ID = 'recAAAAAAAAAAAAAA'
const CODIGO = 'VP-2026-0060'
const AHORA = new Date('2026-08-19T15:00:00.000Z')

const CATALOGO = [
  'Teléfono no contesta',
  'Teléfono equivocado',
  'Cliente rechaza visita',
  'Otro',
]

const CONFIRMADA = { resultado: 'confirmada', fechaVisita: '2026-08-30' }
const RECHAZADA = {
  resultado: 'rechazada',
  motivo: 'Teléfono no contesta',
  detalle: 'Llamé tres veces en la mañana y no contestó nadie.',
}

function guardOk(estado = 'asignada') {
  return {
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: CODIGO, estado, coordinacion_vigente: undefined },
  }
}

function llamar(body: unknown, id = ID) {
  const request = { json: async () => body } as never
  return POST(request, { params: Promise.resolve({ id }) })
}

/** El payload del `PATCH` sobre `TX_Solicitudes`. */
function payloadPatch() {
  return updateRecord.mock.calls[0]?.[2] as Record<string, unknown>
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(AHORA)

  autorizarSolicitud.mockResolvedValue(guardOk())
  listRecords.mockResolvedValue([])
  createRecord.mockResolvedValue({ id: 'recCOORD0000000001', fields: {} })
  updateRecord.mockResolvedValue({ id: ID, fields: {} })
  auditar.mockResolvedValue(1)
  marcarFinEtapa.mockResolvedValue(null)
  opcionesDeSingleSelect.mockResolvedValue(CATALOGO)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('guard y estado', () => {
  it('no escribe nada si el guard falla', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: false,
      status: 403,
      mensaje: MENSAJES.solicitudNoDisponible,
    })

    const res = await llamar(CONFIRMADA)

    expect(res.status).toBe(403)
    expect(createRecord).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('responde 409 si la solicitud ya no está en asignada', async () => {
    autorizarSolicitud.mockResolvedValue(guardOk('visitada'))

    const res = await llamar(CONFIRMADA)

    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toMatchObject({
      error: MENSAJES.coordinacionNoAplica,
    })
    expect(createRecord).not.toHaveBeenCalled()
  })
})

describe('§2.3 · la coordinación NO cambia el estado', () => {
  it('el PATCH sobre TX_Solicitudes no incluye la clave estado', async () => {
    await llamar(CONFIRMADA)

    expect(updateRecord).toHaveBeenCalledTimes(1)
    expect(payloadPatch()).not.toHaveProperty('estado')
  })

  it('la respuesta devuelve el estado intacto en asignada', async () => {
    const res = await llamar(RECHAZADA)

    await expect(res.json()).resolves.toMatchObject({
      data: { estado: 'asignada' },
    })
  })
})

describe('rama confirmada', () => {
  it('persiste fecha_visita_propuesta y no motivo ni detalle', async () => {
    await llamar({ ...CONFIRMADA, nota: 'Portero autoriza 10-13h' })

    const fila = createRecord.mock.calls[0][1] as Record<string, unknown>
    expect(fila).toMatchObject({
      estado_coordinacion: 'confirmada',
      fecha_visita_propuesta: '2026-08-30',
      nota: 'Portero autoriza 10-13h',
      email_enviado_status: 'pendiente',
      intento_numero: 1,
    })
    expect(fila).not.toHaveProperty('motivo')
    expect(fila).not.toHaveProperty('detalle')
  })

  it('la fecha de visita viaja como string, sin construir Date (RO-36)', async () => {
    await llamar(CONFIRMADA)

    const fila = createRecord.mock.calls[0][1] as Record<string, unknown>
    expect(fila.fecha_visita_propuesta).toBe('2026-08-30')
    expect(typeof fila.fecha_visita_propuesta).toBe('string')
  })

  it('no consulta el catálogo de motivos', async () => {
    await llamar(CONFIRMADA)
    expect(opcionesDeSingleSelect).not.toHaveBeenCalled()
  })
})

describe('rama rechazada', () => {
  it('persiste motivo y detalle y no fecha ni nota', async () => {
    await llamar(RECHAZADA)

    const fila = createRecord.mock.calls[0][1] as Record<string, unknown>
    expect(fila).toMatchObject({
      estado_coordinacion: 'rechazada',
      motivo: 'Teléfono no contesta',
      detalle: RECHAZADA.detalle,
    })
    expect(fila).not.toHaveProperty('fecha_visita_propuesta')
    expect(fila).not.toHaveProperty('nota')
  })

  it('rechaza con 400 un detalle de menos de 20 caracteres', async () => {
    const res = await llamar({ ...RECHAZADA, detalle: 'corto' })

    expect(res.status).toBe(400)
    expect(createRecord).not.toHaveBeenCalled()
  })

  it('rechaza con 400 un motivo fuera del catálogo de Airtable (A-17)', async () => {
    const res = await llamar({ ...RECHAZADA, motivo: 'Motivo inventado' })

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({
      error: MENSAJES.motivoNoValido,
    })
    // Con `typecast: true` se habría creado como opción nueva en silencio.
    expect(createRecord).not.toHaveBeenCalled()
  })

  it('acepta un motivo que existe en Airtable aunque no esté en el diseño v4', async () => {
    opcionesDeSingleSelect.mockResolvedValue([...CATALOGO, 'Cliente fuera del país'])

    const res = await llamar({ ...RECHAZADA, motivo: 'Cliente fuera del país' })

    expect(res.status).toBe(200)
    expect(createRecord).toHaveBeenCalled()
  })
})

describe('intento_numero', () => {
  it('es 2 cuando ya existe un intento previo (RF-TAS-04)', async () => {
    listRecords.mockResolvedValue([
      {
        id: 'recCOORD0000000000',
        fields: {
          intento_numero: 1,
          fecha_respuesta: '2026-08-18T10:00:00.000Z',
        },
      },
    ])

    await llamar(CONFIRMADA)

    const fila = createRecord.mock.calls[0][1] as Record<string, unknown>
    expect(fila.intento_numero).toBe(2)
    expect(fila.coordinacion_key).toBe(`${CODIGO} · intento 2`)
  })
})

describe('idempotencia · ventana deslizante de 10 s', () => {
  it('devuelve la fila existente sin crear otra si hay una de hace 3 s', async () => {
    listRecords.mockResolvedValue([
      {
        id: 'recCOORD0000000042',
        fields: {
          intento_numero: 1,
          estado_coordinacion: 'confirmada',
          fecha_respuesta: new Date(AHORA.getTime() - 3_000).toISOString(),
        },
      },
    ])

    const res = await llamar(CONFIRMADA)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      data: { id: 'recCOORD0000000042', replay: true },
    })
    expect(createRecord).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('crea fila nueva si la anterior es de hace 11 s', async () => {
    listRecords.mockResolvedValue([
      {
        id: 'recCOORD0000000042',
        fields: {
          intento_numero: 1,
          fecha_respuesta: new Date(AHORA.getTime() - 11_000).toISOString(),
        },
      },
    ])

    const res = await llamar(CONFIRMADA)

    expect(res.status).toBe(200)
    expect(createRecord).toHaveBeenCalledTimes(1)
    const fila = createRecord.mock.calls[0][1] as Record<string, unknown>
    expect(fila.intento_numero).toBe(2)
  })
})

describe('SLA · cierre de e2 y e3 en el mismo evento (Q5)', () => {
  it('cierra las dos etapas y funde sus campos en un solo PATCH', async () => {
    marcarFinEtapa
      .mockResolvedValueOnce({ campos: { sla_e2_fin_ts: 'X', sla_e3_inicio_ts: 'X' } })
      .mockResolvedValueOnce({ campos: { sla_e3_fin_ts: 'Y', sla_e4_inicio_ts: 'Y' } })

    await llamar(CONFIRMADA)

    expect(marcarFinEtapa).toHaveBeenCalledTimes(2)
    expect(marcarFinEtapa.mock.calls[0][1]).toBe(2)
    expect(marcarFinEtapa.mock.calls[1][1]).toBe(3)

    expect(updateRecord).toHaveBeenCalledTimes(1)
    expect(payloadPatch()).toMatchObject({
      coordinacion_vigente: 'confirmada',
      sla_e2_fin_ts: 'X',
      sla_e3_fin_ts: 'Y',
      sla_e4_inicio_ts: 'Y',
    })
  })

  it('un fallo del motor no bloquea la coordinación', async () => {
    marcarFinEtapa.mockRejectedValue(new Error('C_SLA_Etapas no responde'))

    const res = await llamar(CONFIRMADA)

    expect(res.status).toBe(200)
    expect(createRecord).toHaveBeenCalledTimes(1)
    expect(payloadPatch()).toMatchObject({ coordinacion_vigente: 'confirmada' })
  })
})
