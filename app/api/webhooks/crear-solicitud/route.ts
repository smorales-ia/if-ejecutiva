import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { nuevaSolicitudInternaSchema } from '@/lib/validators/nueva-solicitud-interna'
import { postToMake } from '@/lib/make-client'

export const dynamic = 'force-dynamic'

const MENSAJE_ERROR_RED = 'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * Fase 2 · Paso 4B · Endpoint real de alta interna (reemplaza la simulación
 * de `/api/solicitudes`). Contrato Tanda B refinado (08-jul-2026):
 *  - `documentos[]` del formulario NO viaja — el upload de adjuntos es una
 *    fase posterior.
 *  - El formulario distingue banco originador (`banco_id`, obligatorio) de
 *    banco financista (`banco`, condicional); el payload envía ambos como
 *    `bancoOriginador`/`bancoFinancista` porque Make todavía no tiene el
 *    Search Records del originador — queda sin mapear en el módulo Solicitud
 *    hasta que se agregue.
 *  - `ejecutivaClerkId` se agrega server-side desde la sesión Clerk activa,
 *    nunca desde el cliente — Make resuelve `ejecutiva_asignada` con un
 *    Search Records contra `AUTH_Usuarios.clerk_user_id`.
 *  - Fase Adjuntos 1 (D-12, Opción C, 10-jul-2026): SC01 ahora devuelve
 *    `{ id, codigo_ext }` en el body del webhook (fix aplicado al módulo 8
 *    del blueprint). Este endpoint parsea esos dos campos y los agrega a la
 *    respuesta como `solicitud_id`/`codigo_ext` — el frontend los necesita
 *    para subir los adjuntos después de crear la solicitud, sin ellos no
 *    puede identificar dónde subirlos. Si Make no los trae (degradación o
 *    escenario desactualizado), la respuesta sigue siendo `{ ok: true }`
 *    sin esos campos — la solicitud ya se creó igual, sólo no se pueden
 *    subir adjuntos hasta que la Ejecutiva reintente desde el detalle.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 400 })
  }

  const parsed = nuevaSolicitudInternaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Revisa el formulario: hay campos obligatorios sin completar o con errores.',
      },
      { status: 400 }
    )
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const { banco_id, banco, ...resto } = parsed.data

  const payload = {
    ...resto,
    bancoOriginador: banco_id,
    bancoFinancista: banco && banco.length > 0 ? banco : null,
    origen_canal: 'ingreso_manual' as const,
    ejecutivaClerkId: userId,
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_SC01
  const hmacSecret = process.env.MAKE_HMAC_SECRET
  if (!webhookUrl || !hmacSecret) {
    console.error('[POST /api/webhooks/crear-solicitud] faltan variables MAKE_* en el entorno')
    return NextResponse.json(
      { ok: false, error: 'Falta configurar variables MAKE_* en el entorno' },
      { status: 500 }
    )
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'SC01',
      timeoutMs: 15000,
    })
  } catch (err) {
    console.error('[POST /api/webhooks/crear-solicitud] error de red/timeout hacia Make SC01', err)
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 502 })
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/webhooks/crear-solicitud] Make SC01 respondió con error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 502 })
  }

  const makeBody = (await makeRes.json().catch(() => ({}))) as {
    id?: string
    codigo_ext?: string
  }

  return NextResponse.json(
    {
      ok: true,
      solicitud_id: makeBody.id ?? null,
      codigo_ext: makeBody.codigo_ext ?? null,
    },
    { status: 200 }
  )
}
