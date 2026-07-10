import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { postToMake } from '@/lib/make-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const MENSAJE_DEGRADADO =
  'Subida de adjuntos temporalmente no disponible. Puedes crear la solicitud sin adjuntos y agregarlos después.'
const MENSAJE_ERROR_RED =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'
const MENSAJE_ARCHIVO_GRANDE =
  'Este archivo supera el límite de 7 MB. Comprímelo o divídelo.'

const MAX_TAMANIO_KB = 7 * 1024 // 7MB, ya en KB (D-13)

/**
 * Fase Adjuntos 1 (D-11 a D-14, 10-jul-2026): reescritura completa de
 * formData/Blob a JSON+base64. `solicitud_id` es OBLIGATORIO (D-12, Opción C
 * — la solicitud ya existe cuando se llama este endpoint, sin excepción; ver
 * docs/aprendizajes.md E-023 SUPERSEDED). El cliente calcula `hash_md5` antes
 * de enviar (idempotencia D-14.4, resuelta en el escenario Make).
 */
const uploadSchema = z.object({
  solicitud_id: z.string().min(1, 'Falta el identificador de la solicitud.'),
  codigo_ext: z.string().min(1, 'Falta el código de la solicitud.'),
  nombre_archivo: z.string().min(1, 'Falta el nombre del archivo.'),
  mime_type: z.string().min(1, 'Falta el tipo de archivo.'),
  tamanio_kb: z.number().positive('Tamaño de archivo inválido.'),
  hash_md5: z.string().min(1, 'Falta el hash del archivo.'),
  subido_por: z.string().min(1).default('Ejecutivo'),
  contenido_base64: z.string().min(1, 'Falta el contenido del archivo.'),
})

interface MakeAdjuntoResponse {
  ok?: boolean
  adjunto_id?: string | number
  url_dropbox?: string
  nombre_archivo?: string
  tamanio_kb?: number
  reused?: boolean
  error?: string
  reintentable?: boolean
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_ADJUNTOS
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

  const parsed = uploadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
      { status: 400 }
    )
  }

  const payload = parsed.data

  if (payload.tamanio_kb > MAX_TAMANIO_KB) {
    return NextResponse.json(
      { ok: false, error: MENSAJE_ARCHIVO_GRANDE, reintentable: false },
      { status: 413 }
    )
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'ADJUNTOS_UPLOAD',
      solicitudId: payload.codigo_ext,
      timeoutMs: 45000,
    })
  } catch (err) {
    console.error('[POST /api/adjuntos/upload] error de red/timeout hacia Make', err)
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status: 502 }
    )
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/adjuntos/upload] Make respondió con error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status: 502 }
    )
  }

  const data = (await makeRes.json().catch(() => ({}))) as MakeAdjuntoResponse

  if (!data.ok || !data.adjunto_id) {
    console.error('[POST /api/adjuntos/upload] Make respondió 200 sin adjunto_id', data)
    return NextResponse.json(
      { ok: false, error: data.error ?? MENSAJE_ERROR_RED, reintentable: data.reintentable ?? true },
      { status: 502 }
    )
  }

  return NextResponse.json(
    {
      ok: true,
      adjunto_id: data.adjunto_id,
      url_dropbox: data.url_dropbox ?? '',
      nombre_archivo: data.nombre_archivo ?? payload.nombre_archivo,
      tamanio_kb: data.tamanio_kb ?? payload.tamanio_kb,
      reused: data.reused ?? false,
    },
    { status: 200 }
  )
}
