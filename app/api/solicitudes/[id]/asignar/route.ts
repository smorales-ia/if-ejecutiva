import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { TX_SOLICITUDES } from '@/lib/solicitudes'
import { postToMake } from '@/lib/make-client'
import { asignarSolicitudSchema, issuesToCampos } from '@/lib/validators/acciones-solicitud'

export const dynamic = 'force-dynamic'

const MSG_RED = 'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * POST /api/solicitudes/[id]/asignar — Asigna un tasador (REGLA A).
 *
 * La transición `creada → asignada`, el registro de `fecha_asignacion`, los
 * eventos de `A_Eventos` y el envío del correo los ejecuta Make (SC-Asignar);
 * este handler sólo valida, verifica idempotencia y reenvía firmado (HMAC).
 *
 * Idempotencia REGLA A: si la solicitud ya tiene tasador, responde 409 (el
 * botón no debería estar visible, pero el server es la última línea de defensa).
 *
 * Deuda: la validación server-side de RN-44 (datos mínimos) queda pendiente
 * hasta que `unidades`/`contactos_visita` existan en Airtable — hoy el
 * read-layer los degrada a `[]`, así que validarlos aquí bloquearía toda
 * asignación. Mientras tanto la precondición vive client-side en
 * `solicitud-detail.tsx` (RN-44). TODO P6/P9: mover a server cuando exista schema.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!isValidRecordId(id)) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: MSG_RED }, { status: 400 })
  }

  const parsed = asignarSolicitudSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validacion', campos: issuesToCampos(parsed.error.issues) },
      { status: 422 }
    )
  }

  // Idempotencia + estado terminal: releer el registro real antes de asignar.
  try {
    const record = await getRecord<Record<string, string | undefined>>(TX_SOLICITUDES, id, {
      cellFormat: 'string',
      fields: ['tasador', 'estado'],
    })
    if (!record) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    const tasadorActual = (record.fields['tasador'] ?? '').trim()
    if (tasadorActual !== '') {
      return NextResponse.json(
        {
          error: 'conflicto_negocio',
          campo: 'tasador',
          motivo: `La solicitud ya tiene tasador asignado (${tasadorActual}).`,
        },
        { status: 409 }
      )
    }
    const estado = (record.fields['estado'] ?? '').trim()
    if (estado === 'cancelada' || estado === 'cerrada') {
      return NextResponse.json(
        {
          error: 'conflicto_negocio',
          campo: 'estado',
          motivo: `No se puede asignar una solicitud en estado ${estado}.`,
        },
        { status: 409 }
      )
    }
  } catch (err) {
    if (err instanceof AirtableError && err.status === 404) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    console.error('[POST /api/solicitudes/[id]/asignar] error leyendo solicitud', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  const payload = {
    solicitudId: id,
    tasadorId: parsed.data.tasadorId,
    motivo: parsed.data.motivo ?? null,
    ejecutivaClerkId: userId,
  }

  // Escenario Make aún no provisionado (BQ pendiente). Mock temporal §3.2.10:
  // se degrada con `pendiente_make` para que P6/P7 construyan la UI sin Make
  // vivo; la conexión real se cierra en P9. No se fabrica un éxito silencioso.
  const webhookUrl = process.env.MAKE_WEBHOOK_URL_SC_ASIGNAR
  if (!webhookUrl || !process.env.MAKE_HMAC_SECRET) {
    console.warn('[POST /api/solicitudes/[id]/asignar] MAKE_WEBHOOK_URL_SC_ASIGNAR sin configurar — respuesta mock')
    return NextResponse.json({ ok: true, pendiente_make: true }, { status: 200 })
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'SC-Asignar',
      solicitudId: id,
      timeoutMs: 15000,
    })
  } catch (err) {
    console.error('[POST /api/solicitudes/[id]/asignar] error de red hacia Make', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/solicitudes/[id]/asignar] Make respondió error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
