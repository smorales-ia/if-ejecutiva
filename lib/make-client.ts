import crypto from 'crypto'
import { createRecord } from '@/lib/airtable-client'

// LogEscenarios verified via MCP 2026-07-04
const LOG_ESCENARIOS_TABLE = 'tblR4VWpUHw1CSyIS'

/**
 * Nombres reales de los campos de `LogEscenarios`, verificados vía MCP el
 * 27-jul-2026. La tabla es anterior a IF-02 (nació para el pipeline PDF
 * E1/E2/E3) y **no** sigue la convención snake_case del resto de la base: usa
 * Title Case con espacios, y no tiene campos `escenario`, `solicitud_id`,
 * `payload_enviado` ni `respuesta`. Escribir esos nombres devolvía
 * `422 UNKNOWN_FIELD_NAME "escenario"` y dejaba el log sin escribir — que es
 * exactamente lo que rompió la primera línea de diagnóstico del checklist §2.3
 * durante la Tanda D.
 *
 * Correspondencia con el contrato anterior:
 * | Contrato viejo    | Campo real       | Tipo             |
 * |-------------------|------------------|------------------|
 * | `escenario`       | `Escenario`      | singleSelect ⚠   |
 * | `estado`          | `Estado`         | singleSelect ⚠   |
 * | `solicitud_id`    | `Solicitud`      | singleLineText   |
 * | `payload_enviado` | `Detalle`        | multilineText    |
 * | `respuesta`       | `Detalle`        | multilineText    |
 */
const CAMPO = {
  /** Campo primario de la tabla. */
  titulo: 'Titulo Log',
  fecha: 'Fecha / Hora',
  escenario: 'Escenario',
  estado: 'Estado',
  trigger: 'Trigger',
  detalle: 'Detalle',
  duracionMs: 'Duracion ms',
  solicitud: 'Solicitud',
} as const

export type EstadoLog = 'ok' | 'error' | 'retry'

/**
 * `Estado` es singleSelect. Estos son los únicos nombres de opción que existen
 * hoy en la tabla (los tres primeros de cinco; "⏭ Omitido" y "OK" quedan sin
 * uso desde IF-02).
 */
const ESTADO_CHOICE: Record<EstadoLog, string> = {
  ok: '✓ OK',
  error: '✗ Error',
  retry: '⚠ Parcial',
}

/**
 * `Escenario` también es singleSelect, y `createRecord` envía `typecast: true`:
 * ante un valor que no coincide con ninguna opción, Airtable intenta **crear**
 * la opción y falla con `Insufficient permissions to create new select option`
 * si el token no tiene scope de schema. Por eso sólo se escribe el campo
 * cuando el código del escenario tiene opción existente; si no la tiene, la
 * fila igual se crea (con `Escenario` vacío) y el código viaja en `Trigger` y
 * en `Detalle`, que son texto libre. Observabilidad degradada > sin log.
 *
 * Las cinco opciones de abajo están verificadas vía MCP el 27-jul-2026: las tres
 * `SC-*` ya existían y `SC01` / `ADJUNTOS_UPLOAD` las creó Sergio a mano ese
 * mismo día. Al agregar un escenario nuevo, créalo primero como opción en
 * Airtable y recién después añádelo aquí.
 */
const ESCENARIO_CHOICE: Record<string, string> = {
  SC01: 'SC01',
  'SC-Asignar': 'SC-Asignar',
  'SC-Edicion': 'SC-Edicion',
  'SC-RF09-ExtraccionClaude': 'SC-RF09-ExtraccionClaude',
  ADJUNTOS_UPLOAD: 'ADJUNTOS_UPLOAD',
}

/** Airtable acepta hasta 100.000 caracteres en un campo de texto largo. */
const MAX_PAYLOAD_CHARS = 40_000
const MAX_RESPUESTA_CHARS = 10_000

function truncar(texto: string, max: number): string {
  return texto.length > max
    ? `${texto.slice(0, max)}\n…[truncado ${texto.length - max} caracteres]`
    : texto
}

/**
 * Compone el cuerpo de `Detalle`. Es el único campo de texto largo de la
 * tabla, así que payload y respuesta conviven ahí con encabezados fijos para
 * que sigan siendo grep-eables desde la UI de Airtable.
 */
function componerDetalle(params: LogEscenarioParams): string {
  const bloques: string[] = [`escenario: ${params.escenario}`]

  if (params.payloadEnviado !== undefined) {
    let json: string
    try {
      json = JSON.stringify(params.payloadEnviado, null, 2)
    } catch {
      json = '[payload no serializable]'
    }
    bloques.push(`payload_enviado:\n${truncar(json, MAX_PAYLOAD_CHARS)}`)
  }

  if (params.respuesta) {
    bloques.push(`respuesta:\n${truncar(params.respuesta, MAX_RESPUESTA_CHARS)}`)
  }

  return bloques.join('\n\n')
}

interface LogEscenarioParams {
  escenario: string
  solicitudId?: string
  estado: EstadoLog
  payloadEnviado?: unknown
  respuesta?: string
  /** Latencia del POST a Make, si el llamador la midió. */
  duracionMs?: number
}

/**
 * Escribe una fila en LogEscenarios. Es observabilidad, no negocio: un fallo
 * al loguear se registra en consola pero nunca interrumpe el flujo que la
 * llamó (crear/asignar solicitud ya habrá ocurrido o fallado por su cuenta).
 */
export async function logEscenario(params: LogEscenarioParams): Promise<void> {
  const estadoChoice = ESTADO_CHOICE[params.estado]
  const escenarioChoice = ESCENARIO_CHOICE[params.escenario]

  const fields: Record<string, unknown> = {
    [CAMPO.titulo]: [params.escenario, estadoChoice, params.solicitudId]
      .filter(Boolean)
      .join(' · '),
    [CAMPO.fecha]: new Date().toISOString(),
    [CAMPO.estado]: estadoChoice,
    // Texto libre: preserva el código del escenario aunque `Escenario` se omita.
    [CAMPO.trigger]: params.escenario,
    [CAMPO.detalle]: componerDetalle(params),
  }

  if (escenarioChoice) fields[CAMPO.escenario] = escenarioChoice
  if (params.solicitudId) fields[CAMPO.solicitud] = params.solicitudId
  if (params.duracionMs !== undefined) {
    fields[CAMPO.duracionMs] = Math.round(params.duracionMs)
  }

  try {
    await createRecord(LOG_ESCENARIOS_TABLE, fields)
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

  const inicio = Date.now()
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
      duracionMs: Date.now() - inicio,
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
    respuesta: `HTTP ${res.status}\n${respuestaTexto.slice(0, MAX_RESPUESTA_CHARS)}`,
    duracionMs: Date.now() - inicio,
  })

  return res
}
