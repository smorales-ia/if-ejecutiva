import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P2-TAS.A · plan §3.2 paso 8 — la validación de los 20 caracteres de
 * `POST /rechazo` (RF-TAS-09).
 *
 * El mínimo de 20 caracteres es la única regla de negocio del endpoint, y
 * existe para que la observación sirva: «no sirve» o «rehacer» no le dicen al
 * visador qué resolver, y el rechazo es el único canal por el que el tasador
 * devuelve el borrador.
 *
 * La otra mitad de lo que se protege acá es **lo que la ruta no hace**: no
 * toca `estado` y no emite aviso al visador (A-15). Que no haya código para
 * eso *es* la implementación del requisito, y sin un test que lo afirme,
 * agregarlo mañana no rompería nada visible.
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

import { POST } from './route'
import { MENSAJES, MIN_CARACTERES_OBSERVACION } from '@/lib/tasador/mensajes'

const ID = 'recAAAAAAAAAAAAAA'
const CODIGO = 'VP-2026-0060'
const CAMPO = 'observacion_rechazo_tasador'

/** 20 caracteres exactos — el borde inferior de lo aceptable. */
const VEINTE = 'Falta el certificado'
/** 19 — el borde superior de lo rechazado. */
const DIECINUEVE = 'Falta certificado x'

function guardOk(fields: Record<string, unknown> = {}) {
  return {
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: CODIGO, estado: 'calculada', ...fields },
  }
}

function llamar(body: unknown, id = ID) {
  const request = { json: async () => body } as never
  return POST(request, { params: Promise.resolve({ id }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  updateRecord.mockResolvedValue({ id: ID, createdTime: '', fields: {} })
  auditar.mockResolvedValue(1)
  autorizarSolicitud.mockResolvedValue(guardOk())
})

describe('el mínimo de 20 caracteres', () => {
  it('acepta exactamente 20', async () => {
    expect(VEINTE).toHaveLength(MIN_CARACTERES_OBSERVACION)

    const res = await llamar({ observacion: VEINTE })

    expect(res.status).toBe(200)
    expect(updateRecord).toHaveBeenCalledWith('tblaHTyMHYfmy7Fg6', ID, {
      [CAMPO]: VEINTE,
    })
  })

  it('rechaza 19 con 400, sin escribir y con el mensaje humano', async () => {
    expect(DIECINUEVE).toHaveLength(MIN_CARACTERES_OBSERVACION - 1)

    const res = await llamar({ observacion: DIECINUEVE })

    expect(res.status).toBe(400)
    // §6.5: nunca el error crudo de Zod. El literal es el de MENSAJES.
    expect(await res.json()).toEqual({ error: MENSAJES.observacionCorta })
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('cuenta después de recortar espacios', async () => {
    // 19 caracteres rodeados de espacios llegan a 25 de longitud bruta. Sin el
    // `.trim()` previo al `.min()`, pasarían: el tasador habría mandado una
    // observación de 19 caracteres y el visador recibiría eso.
    const res = await llamar({ observacion: `   ${DIECINUEVE}   ` })

    expect(res.status).toBe(400)
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('persiste la observación ya recortada, no la cruda', async () => {
    await llamar({ observacion: `  ${VEINTE}  ` })

    expect(updateRecord).toHaveBeenCalledWith('tblaHTyMHYfmy7Fg6', ID, {
      [CAMPO]: VEINTE,
    })
  })

  it('rechaza cuerpos sin observación, vacíos o de otro tipo', async () => {
    for (const body of [{}, { observacion: '' }, { observacion: 42 }, null]) {
      vi.clearAllMocks()
      const res = await llamar(body)

      expect(res.status, JSON.stringify(body)).toBe(400)
      expect(updateRecord, JSON.stringify(body)).not.toHaveBeenCalled()
    }
  })
})

describe('lo que la ruta NO hace (RF-TAS-09 · A-15)', () => {
  it('no toca `estado` en el update', async () => {
    await llamar({ observacion: VEINTE })

    const campos = updateRecord.mock.calls[0][2] as Record<string, unknown>
    expect(Object.keys(campos)).toEqual([CAMPO])
    expect(campos).not.toHaveProperty('estado')
  })

  it('devuelve el estado idéntico al que tenía antes', async () => {
    // Criterio de aceptación de §3.3: el estado es el mismo antes y después.
    autorizarSolicitud.mockResolvedValue(guardOk({ estado: 'pdf_listo' }))

    const res = await llamar({ observacion: VEINTE })

    expect(await res.json()).toEqual({ data: { id: ID, estado: 'pdf_listo' } })
  })

  it('escribe una sola vez: no hay notificación ni evento adicional', async () => {
    // A-15 está abierta y el plan manda implementar sólo lo que RF-TAS-09
    // declara. Una segunda escritura acá sería un aviso que el diálogo de la UI
    // no promete y que el negocio no aprobó.
    await llamar({ observacion: VEINTE })

    expect(updateRecord).toHaveBeenCalledTimes(1)
  })
})

describe('el guard corre antes que la validación', () => {
  it('propaga el 403 sin escribir ni evaluar el cuerpo', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: false,
      status: 403,
      mensaje: MENSAJES.solicitudNoDisponible,
    })

    // Cuerpo válido: si respondiera 400 en vez de 403, sabríamos que el orden
    // de las capas se invirtió.
    const res = await llamar({ observacion: VEINTE })

    expect(res.status).toBe(403)
    expect(updateRecord).not.toHaveBeenCalled()
  })
})
