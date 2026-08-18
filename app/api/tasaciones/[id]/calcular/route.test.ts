import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P2-TAS.A · plan §3.2 paso 8 — el 409 de `POST /calcular`.
 *
 * Lo que protegen estos tests es que la transición `asignada → visitada`
 * ocurra **una sola vez**. La ruta dispara SC06 → SC08 → AT03 aguas abajo y no
 * se puede deshacer desde la UI: un doble tap, o un reintento del usuario tras
 * un timeout, llegarían dos veces, y sin el guard AT03 correría dos veces sobre
 * la misma solicitud.
 *
 * Por eso cada caso de rechazo afirma **dos** cosas: el status **y** que
 * `updateRecord` no se llamó. Un 409 que igual escribió es un 409 inútil, y esa
 * diferencia no se ve mirando sólo el código de estado.
 */

const autorizarSolicitud = vi.fn()
const updateRecord = vi.fn()
const auditar = vi.fn()

vi.mock('@/lib/tasador/auth-guard', () => ({
  autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
}))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, updateRecord: (...args: unknown[]) => updateRecord(...args) }
})

vi.mock('@/lib/tasador/auditoria', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/tasador/auditoria')>()
  return { ...real, auditar: (...args: unknown[]) => auditar(...args) }
})

// Import estático — mismo patrón que `solicitudes/[id]/asignar/route.test.ts`.
import { POST } from './route'
import { MENSAJES } from '@/lib/tasador/mensajes'

const ID = 'recAAAAAAAAAAAAAA'
const CODIGO = 'VP-2026-0060'

/** Guard en verde, con los campos que la ruta lee del registro ya leído. */
function guardOk(fields: Record<string, unknown>) {
  return {
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: CODIGO, ...fields },
  }
}

function llamar(body: unknown = {}, id = ID) {
  const request = { json: async () => body } as never
  return POST(request, { params: Promise.resolve({ id }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  updateRecord.mockResolvedValue({ id: ID, createdTime: '', fields: {} })
  auditar.mockResolvedValue(1)
  // Estado por defecto: calculable — asignada y con fecha real de visita.
  autorizarSolicitud.mockResolvedValue(
    guardOk({ estado: 'asignada', fecha_visita: '2026-08-18' })
  )
})

describe('happy path', () => {
  it('responde 200 y escribe la transición en un solo update', async () => {
    const res = await llamar()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: { id: ID, estado: 'visitada' } })
    expect(updateRecord).toHaveBeenCalledTimes(1)
    expect(updateRecord).toHaveBeenCalledWith('tblaHTyMHYfmy7Fg6', ID, {
      estado: 'visitada',
    })
  })

  it('audita el cambio de estado con el valor anterior', async () => {
    await llamar()

    expect(auditar).toHaveBeenCalledTimes(1)
    expect(auditar.mock.calls[0][0]).toMatchObject([
      { registroId: ID, campo: 'estado', valorAnterior: 'asignada', valorNuevo: 'visitada' },
    ])
  })
})

describe('el 409 de RF-TAS-07', () => {
  it('rechaza con 409 y sin escribir si la solicitud ya está visitada', async () => {
    autorizarSolicitud.mockResolvedValue(
      guardOk({ estado: 'visitada', fecha_visita: '2026-08-18' })
    )

    const res = await llamar()

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: MENSAJES.calculoYaIniciado })
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('rechaza con 409 y sin escribir si ya está calculada', async () => {
    autorizarSolicitud.mockResolvedValue(
      guardOk({ estado: 'calculada', fecha_visita: '2026-08-18' })
    )

    const res = await llamar()

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: MENSAJES.calculoYaIniciado })
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('rechaza cualquier estado que no sea asignada', async () => {
    // `creada` es el caso real: la Ejecutiva todavía no asignó y la cola no
    // debería mostrarla, pero el server revalida igual — la UI no decide.
    for (const estado of ['creada', 'pdf_listo', 'aprobada', 'pendiente']) {
      vi.clearAllMocks()
      autorizarSolicitud.mockResolvedValue(guardOk({ estado, fecha_visita: '2026-08-18' }))

      const res = await llamar()

      expect(res.status, `estado ${estado}`).toBe(409)
      expect(await res.json()).toEqual({ error: MENSAJES.estadoNoPermite })
      expect(updateRecord, `estado ${estado}`).not.toHaveBeenCalled()
    }
  })

  it('no deja pasar un doble tap: la segunda llamada encuentra otro estado', async () => {
    // Simula la secuencia real. La primera transiciona; para la segunda el
    // guard ya lee `visitada`, que es lo que hace Airtable en producción.
    const primera = await llamar()
    expect(primera.status).toBe(200)

    autorizarSolicitud.mockResolvedValue(
      guardOk({ estado: 'visitada', fecha_visita: '2026-08-18' })
    )
    const segunda = await llamar()

    expect(segunda.status).toBe(409)
    // Una sola escritura entre las dos llamadas: AT03 se dispara una vez.
    expect(updateRecord).toHaveBeenCalledTimes(1)
  })
})

describe('la fecha real de visita es obligatoria (Regla T-B)', () => {
  it('rechaza con 409 y sin escribir si falta fecha_visita', async () => {
    // El botón no debería haberse habilitado, pero el server revalida: la UI
    // muestra y captura, nunca decide.
    autorizarSolicitud.mockResolvedValue(guardOk({ estado: 'asignada' }))

    const res = await llamar()

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: MENSAJES.estadoNoPermite })
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('no confunde la fecha planificada con la real', async () => {
    // Regla T-B: son dos campos y no se colapsan. Tener `fecha_visita_programada`
    // no habilita el cálculo; sólo la real (`fecha_visita`) lo hace.
    autorizarSolicitud.mockResolvedValue(
      guardOk({ estado: 'asignada', fecha_visita_programada: '2026-08-20' })
    )

    const res = await llamar()

    expect(res.status).toBe(409)
    expect(updateRecord).not.toHaveBeenCalled()
  })
})

describe('el guard corre antes que todo', () => {
  it('propaga el 403 del guard sin escribir', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: false,
      status: 403,
      mensaje: MENSAJES.solicitudNoDisponible,
    })

    const res = await llamar()

    expect(res.status).toBe(403)
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('rechaza un cuerpo con basura antes de mirar el estado', async () => {
    // `calcularSchema` es `.strict()`: la transición no lleva parámetros y un
    // cuerpo con campos extra se rechaza en vez de ignorarse.
    const res = await llamar({ estado: 'aprobada' })

    expect(res.status).toBe(400)
    expect(updateRecord).not.toHaveBeenCalled()
  })
})
