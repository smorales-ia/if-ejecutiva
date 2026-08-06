import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { AirtableError, isValidRecordId } from '@/lib/airtable-client'
import { postToMake } from '@/lib/make-client'
import { verificarRN59 } from '@/lib/rn59'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MENSAJE_DEGRADADO =
  'Eliminación de adjuntos temporalmente no disponible. Intenta nuevamente más tarde.'
const MENSAJE_ERROR_RED =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * 30 s frente a los 45 s de la subida (§8.6.4): aquí no viaja binario, sólo
 * cinco campos de texto. Un borrado que tarda más de medio minuto está colgado,
 * y esperar más sólo alarga el momento en que el usuario reintenta sobre una
 * lista ya recargada.
 */
const TIMEOUT_MS = 30_000

/**
 * Cuerpo del DELETE. `codigo_ext` viaja además del record ID porque
 * `SC-Adjuntos-Delete` lo usa para el log y porque la respuesta de Make lo
 * necesita para correlacionar en `LogEscenarios`.
 *
 * `hash_md5` es la salvaguarda de integridad de §8.6.3: el escenario compara el
 * hash del payload contra el del registro y aborta si difieren. Cubre la
 * carrera en la que el adjunto fue reemplazado entre que la Ejecutiva vio la
 * lista y pulsó eliminar — sin esta comprobación, el record ID reciclado
 * borraría un archivo que nadie eligió borrar.
 */
const deleteSchema = z.object({
  solicitud_id: z.string().min(1, 'Falta el identificador de la solicitud.'),
  codigo_ext: z.string().min(1, 'Falta el código de la solicitud.'),
  hash_md5: z.string().min(1, 'Falta el hash del archivo.'),
  subido_por: z.string().min(1).default('Ejecutivo'),
})

interface MakeDeleteResponse {
  ok?: boolean
  adjunto_id?: string
  dropbox_borrado?: boolean
  airtable_borrado?: boolean
  ya_no_existia?: boolean
  aviso?: string
  reason?: 'mismatch' | 'dropbox_failed' | 'airtable_orphan' | string
  error?: string
  reintentable?: boolean
}

/**
 * DELETE /api/adjuntos/[id] — Borrado real de un adjunto (RF-52 · §8.6.3).
 *
 * Espeja al endpoint de subida: rechaza sin sesión, degrada con aviso si
 * faltan las variables de entorno en lugar de romper la consola, valida el
 * segmento `[id]` con el guard de record ID, valida el cuerpo con esquema y
 * delega en Make con firma HMAC. Toda la destrucción ocurre en
 * `SC-Adjuntos-Delete`; este handler no escribe en Airtable ni habla con
 * Dropbox.
 *
 * ## Identificador: record ID, no `adjunto_id`
 *
 * `TX_Adjuntos` tiene dos identificadores y sólo uno sirve aquí. El autoNumber
 * `adjunto_id` (`fldVt7Lk1ptvmgbtT`) es el que devuelve el escenario de subida
 * y el que guarda el estado del checklist; `ActionDeleteRecord` no lo acepta.
 * El segmento `[id]` es el record ID `rec…` que expone la lectura de adjuntos
 * por solicitud, y por eso el checklist debe casar su fila con el adjunto
 * persistido por `clave_adjunto` antes de poder borrar.
 *
 * ## Un borrado repetido devuelve éxito, no 404
 *
 * Si el registro ya no existe, Make responde `ya_no_existia: true` con
 * `ok: true` y aquí sale un 200. El estado final deseado ya se cumple, y
 * devolver 404 obligaría al cliente a distinguir dos casos que para el usuario
 * son el mismo (§8.6.5).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  if (!isValidRecordId(id)) {
    console.error('[ADJUNTOS-DELETE] id no es un record ID de Airtable', { id })
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
      { status: 400 }
    )
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_ADJUNTOS_DELETE
  const hmacSecret = process.env.MAKE_HMAC_SECRET

  if (!webhookUrl || !hmacSecret) {
    return NextResponse.json(
      { ok: false, degraded: true, error: MENSAJE_DEGRADADO },
      { status: 200 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 400 })
  }

  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
      { status: 400 }
    )
  }

  const payload = parsed.data

  if (!isValidRecordId(payload.solicitud_id)) {
    console.error('[ADJUNTOS-DELETE] solicitud_id no es un record ID de Airtable', {
      solicitud_id: payload.solicitud_id,
      codigo_ext: payload.codigo_ext,
    })
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
      { status: 400 }
    )
  }

  /**
   * RN-59 en dos capas (§8.6.5). El checklist ni siquiera renderiza el control
   * en modo consulta, pero eso es feedback, no control de acceso: la petición
   * puede llegar desde otra pestaña abierta antes de la asignación, o
   * directamente contra el endpoint.
   */
  try {
    const rn59 = await verificarRN59(payload.solicitud_id)
    if (rn59.tipo === 'no_encontrada') {
      return NextResponse.json({ ok: false, error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    if (rn59.tipo === 'modo_consulta') {
      console.warn('[ADJUNTOS-DELETE] rechazado por RN-59', {
        solicitud_id: payload.solicitud_id,
        estado: rn59.estado,
      })
      return NextResponse.json(
        {
          ok: false,
          error: 'conflicto_negocio',
          motivo:
            'La solicitud está en modo consulta: no se pueden eliminar documentos.',
        },
        { status: 409 }
      )
    }
  } catch (err) {
    const status = err instanceof AirtableError ? 502 : 500
    console.error('[ADJUNTOS-DELETE] no se pudo verificar RN-59', {
      solicitud_id: payload.solicitud_id,
      detalle: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status }
    )
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(
      webhookUrl,
      { adjunto_record_id: id, ...payload },
      {
        escenario: 'ADJUNTOS_DELETE',
        solicitudId: payload.codigo_ext,
        timeoutMs: TIMEOUT_MS,
      }
    )
  } catch (err) {
    console.error('[ADJUNTOS-DELETE] error de red/timeout hacia Make', err)
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status: 502 }
    )
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[ADJUNTOS-DELETE] Make respondió con error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status: 502 }
    )
  }

  const data = (await makeRes.json().catch(() => ({}))) as MakeDeleteResponse

  if (data.ok) {
    /**
     * Éxito parcial con `dropbox_borrado: false` se trata como éxito de cara al
     * usuario (§8.6.4): el huérfano en Dropbox es un problema de operación que
     * la Ejecutiva no puede resolver ni necesita entender. Queda en
     * LogEscenarios y en este log.
     */
    if (data.aviso === 'huerfano_dropbox') {
      console.warn('[ADJUNTOS-DELETE] fila borrada con binario ya ausente en Dropbox', {
        adjunto_record_id: id,
        codigo_ext: payload.codigo_ext,
      })
    }
    return NextResponse.json(
      {
        ok: true,
        adjunto_id: data.adjunto_id ?? id,
        dropbox_borrado: data.dropbox_borrado ?? false,
        airtable_borrado: data.airtable_borrado ?? false,
        ya_no_existia: data.ya_no_existia ?? false,
      },
      { status: 200 }
    )
  }

  switch (data.reason) {
    case 'mismatch':
      // El registro apuntado ya no es el que el usuario vio. No se borró nada.
      console.warn('[ADJUNTOS-DELETE] salvaguarda de integridad: mismatch', {
        adjunto_record_id: id,
        codigo_ext: payload.codigo_ext,
      })
      return NextResponse.json(
        { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
        { status: 409 }
      )

    case 'dropbox_failed':
      console.error('[ADJUNTOS-DELETE] Dropbox falló; nada se borró', {
        adjunto_record_id: id,
        detalle: data.error,
      })
      return NextResponse.json(
        { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
        { status: 502 }
      )

    case 'airtable_orphan':
      /**
       * Binario borrado y fila viva: la fila apunta a un archivo inexistente.
       * Es el estado inconsistente **recuperable** de §8.6.5 —visible en la
       * interfaz y auditable—, pero necesita ojo humano, así que se marca con
       * un prefijo grep-eable para el monitoreo.
       */
      console.error('[ADJUNTOS-DELETE-ORPHAN] fila viva apuntando a un binario borrado', {
        adjunto_record_id: id,
        solicitud_id: payload.solicitud_id,
        codigo_ext: payload.codigo_ext,
        detalle: data.error,
      })
      return NextResponse.json(
        { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
        { status: 500 }
      )

    default:
      console.error('[ADJUNTOS-DELETE] Make respondió ok:false sin reason conocido', data)
      return NextResponse.json(
        { ok: false, error: MENSAJE_ERROR_RED, reintentable: data.reintentable ?? true },
        { status: 502 }
      )
  }
}
