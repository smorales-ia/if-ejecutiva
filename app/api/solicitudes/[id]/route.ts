import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { mapRecord, SOLICITUD_FIELDS, TX_SOLICITUDES } from '@/lib/solicitudes'
import { postToMake } from '@/lib/make-client'
import { editarSolicitudSchema, issuesToCampos } from '@/lib/validators/acciones-solicitud'

export const dynamic = 'force-dynamic'

const MSG_RED = 'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isValidRecordId(id)) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }

  try {
    const record = await getRecord<Record<string, string | undefined>>(TX_SOLICITUDES, id, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      fields: SOLICITUD_FIELDS,
    })

    if (!record) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }

    const data = mapRecord(record.id, record.createdTime, record.fields)
    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof AirtableError && err.status === 404) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    console.error('[GET /api/solicitudes/[id]]', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }
}

/**
 * PATCH /api/solicitudes/[id] — Edita datos de una solicitud (REGLA C).
 *
 * Sólo editable en estado `creada` (validado de forma defensiva server-side).
 * La escritura la ejecuta Make (SC-Edicion) + registra `datos_modificados` en
 * `A_Eventos`; este handler valida el payload, verifica el estado y reenvía
 * firmado. Escenario Make aún no provisionado → mock temporal §3.2.10.
 */
export async function PATCH(
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

  const parsed = editarSolicitudSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validacion', campos: issuesToCampos(parsed.error.issues) },
      { status: 422 }
    )
  }

  // REGLA C: sólo se puede editar en estado `creada`. Verificar contra el
  // registro real antes de reenviar (defensivo — la UI ya oculta el botón).
  try {
    // `estado` es singleSelect: el formato json por defecto ya lo devuelve como
    // string. Evitamos `cellFormat: 'string'`, que exige timeZone + userLocale
    // y devuelve 422 si faltan.
    const record = await getRecord<Record<string, string | undefined>>(TX_SOLICITUDES, id, {
      fields: ['estado'],
    })
    if (!record) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    const estado = (record.fields['estado'] ?? '').trim()
    if (estado !== 'creada') {
      return NextResponse.json(
        {
          error: 'conflicto_negocio',
          campo: 'estado',
          motivo: `Sólo se puede editar una solicitud en estado creada (actual: ${estado || '—'}).`,
        },
        { status: 409 }
      )
    }
  } catch (err) {
    if (err instanceof AirtableError && err.status === 404) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    console.error('[PATCH /api/solicitudes/[id]] error leyendo solicitud', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  const payload = { solicitudId: id, ejecutivaClerkId: userId, cambios: parsed.data }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_SC_EDICION
  if (!webhookUrl || !process.env.MAKE_HMAC_SECRET) {
    // Sin webhook no hay persistencia. Un 200 aquí es indistinguible del éxito
    // para el cliente y produce el "toast verde sin cambios en Airtable"
    // (E-078): en producción es un fallo de configuración (503) y en desarrollo
    // un 202 explícito que la UI no puede confundir con un guardado real.
    console.warn('[PATCH /api/solicitudes/[id]] MAKE_WEBHOOK_URL_SC_EDICION sin configurar — no se persiste')
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: MSG_RED }, { status: 503 })
    }
    return NextResponse.json({ ok: false, pendiente_make: true }, { status: 202 })
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'SC-Edicion',
      solicitudId: id,
      timeoutMs: 15000,
    })
  } catch (err) {
    console.error('[PATCH /api/solicitudes/[id]] error de red hacia Make', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[PATCH /api/solicitudes/[id]] Make respondió error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
