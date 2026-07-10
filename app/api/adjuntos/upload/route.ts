import { NextRequest, NextResponse } from 'next/server'
import { postToMake } from '@/lib/make-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MENSAJE_DEGRADADO =
  'Subida de adjuntos temporalmente no disponible. Puedes crear la solicitud sin adjuntos y agregarlos después.'
const MENSAJE_ERROR_RED =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

interface MakeAdjuntoResponse {
  dropbox_url?: string
}

/**
 * Streaming: cliente → este route handler → Make → Dropbox (construccion.md §6).
 * El escenario Make de adjuntos aún no está provisionado (BQ pendiente, sin
 * código propio asignado todavía). Mientras `MAKE_WEBHOOK_URL_ADJUNTOS` no
 * exista en el entorno, degrada de inmediato sin tocar Make — el submit de
 * NewRequestSheet ya no depende de esta llamada, así que nunca queda bloqueado.
 */
export async function POST(request: NextRequest) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL_ADJUNTOS
  const hmacSecret = process.env.MAKE_HMAC_SECRET

  if (!webhookUrl || !hmacSecret) {
    return NextResponse.json(
      { ok: false, degraded: true, error: MENSAJE_DEGRADADO },
      { status: 200 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { ok: false, error: 'Selecciona un archivo para adjuntar.' },
      { status: 400 }
    )
  }

  const nombreArchivo = file instanceof File ? file.name : 'archivo'
  const mimeType = file.type || 'application/octet-stream'
  const tipoOk =
    TIPOS_PERMITIDOS.includes(mimeType) || /\.(pdf|jpe?g|png)$/i.test(nombreArchivo)

  if (!tipoOk) {
    return NextResponse.json(
      { ok: false, error: 'Formato no permitido. Usa PDF, JPG o PNG.' },
      { status: 400 }
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'El archivo excede el máximo de 10MB.' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const payload = {
    nombre_archivo: nombreArchivo,
    mime_type: mimeType,
    tamanio_kb: Math.round(file.size / 1024),
    contenido_base64: buffer.toString('base64'),
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'ADJUNTOS_UPLOAD',
      timeoutMs: 30000,
    })
  } catch (err) {
    console.error('[POST /api/adjuntos/upload] error de red/timeout hacia Make', err)
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 502 })
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/adjuntos/upload] Make respondió con error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 502 })
  }

  const data = (await makeRes.json().catch(() => ({}))) as MakeAdjuntoResponse
  if (!data.dropbox_url) {
    console.error('[POST /api/adjuntos/upload] Make respondió 200 sin dropbox_url')
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 502 })
  }

  return NextResponse.json({ ok: true, dropbox_url: data.dropbox_url }, { status: 200 })
}
