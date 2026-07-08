import crypto from 'crypto'
import { createRecord } from '@/lib/airtable-client'

// LogEscenarios verified via MCP 2026-07-04
const LOG_ESCENARIOS_TABLE = 'tblR4VWpUHw1CSyIS'

export type EstadoLog = 'ok' | 'error' | 'retry'

interface LogEscenarioParams {
  escenario: string
  solicitudId?: string
  estado: EstadoLog
  payloadEnviado?: unknown
  respuesta?: string
}

/**
 * Escribe una fila en LogEscenarios. Es observabilidad, no negocio: un fallo
 * al loguear se registra en consola pero nunca interrumpe el flujo que la
 * llamó (crear/asignar solicitud ya habrá ocurrido o fallado por su cuenta).
 */
export async function logEscenario(params: LogEscenarioParams): Promise<void> {
  try {
    await createRecord(LOG_ESCENARIOS_TABLE, {
      escenario: params.escenario,
      solicitud_id: params.solicitudId ?? '',
      estado: params.estado,
      payload_enviado: params.payloadEnviado
        ? JSON.stringify(params.payloadEnviado)
        : '',
      respuesta: params.respuesta ?? '',
    })
  } catch (err) {
    console.error('[logEscenario] no se pudo escribir en LogEscenarios', err)
  }
}

export interface PostToMakeOptions {
  /** Nombre del escenario para LogEscenarios, ej. "SC01". */
  escenario: string
  /** Código de la solicitud si ya se conoce (ej. tras la respuesta de Make). */
  solicitudId?: string
  timeoutMs?: number
}

/**
 * Firma el payload con HMAC-SHA256 (D-03), hace POST al webhook de Make y
 * registra el resultado en LogEscenarios. El secreto (MAKE_HMAC_SECRET) sólo
 * se lee aquí, server-side — nunca se expone al cliente.
 */
export async function postToMake(
  webhookUrl: string,
  payload: Record<string, unknown>,
  options: PostToMakeOptions
): Promise<Response> {
  const secret = process.env.MAKE_HMAC_SECRET
  if (!secret) throw new Error('MAKE_HMAC_SECRET is not configured')

  const body = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  let res: Response
  try {
    res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VP-Signature': signature,
      },
      body,
      signal: options.timeoutMs
        ? AbortSignal.timeout(options.timeoutMs)
        : undefined,
    })
  } catch (err) {
    await logEscenario({
      escenario: options.escenario,
      solicitudId: options.solicitudId,
      estado: 'error',
      payloadEnviado: payload,
      respuesta: err instanceof Error ? err.message : 'Error de red desconocido',
    })
    throw err
  }

  const respuestaTexto = await res
    .clone()
    .text()
    .catch(() => '')

  await logEscenario({
    escenario: options.escenario,
    solicitudId: options.solicitudId,
    estado: res.ok ? 'ok' : 'error',
    payloadEnviado: payload,
    respuesta: respuestaTexto.slice(0, 10000),
  })

  return res
}
