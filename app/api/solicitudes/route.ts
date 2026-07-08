import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { listRecords, AirtableError } from '@/lib/airtable-client'
import { mapRecord, SOLICITUD_FIELDS, TX_SOLICITUDES } from '@/lib/solicitudes'
import { nuevaSolicitudInternaSchema } from '@/lib/validators/nueva-solicitud-interna'
import { postToMake } from '@/lib/make-client'

export const dynamic = 'force-dynamic'

type Vista = 'activas' | 'sla_riesgo' | 'reasignar' | 'pausadas' | 'aprobadas' | 'cartera'

const VISTAS_VALIDAS: Vista[] = [
  'activas',
  'sla_riesgo',
  'reasignar',
  'pausadas',
  'aprobadas',
  'cartera',
]

function buildFormula(vista: Vista, userId?: string): string {
  switch (vista) {
    case 'activas':
      return 'NOT(OR({estado}="cancelada",{estado}="cerrada",{estado}="entregada"))'
    case 'sla_riesgo':
      return 'OR({semaforo_sla}="rojo",{semaforo_sla}="ámbar",{semaforo_sla}="ambar")'
    case 'reasignar':
      return 'AND({estado}="creada",DATETIME_DIFF(NOW(),CREATED_TIME(),"hours")>48)'
    case 'pausadas':
      return '{estado}="pausada"'
    case 'aprobadas':
      return '{estado}="aprobada"'
    case 'cartera':
      return `{ejecutiva_asignada}="${userId}"`
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const rawVista = searchParams.get('vista') ?? 'activas'
  const vista: Vista = VISTAS_VALIDAS.includes(rawVista as Vista)
    ? (rawVista as Vista)
    : 'activas'

  let userId: string | undefined
  if (vista === 'cartera') {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    userId = clerkUserId
  }

  try {
    const formula = buildFormula(vista, userId)
    const records = await listRecords<Record<string, string | undefined>>(TX_SOLICITUDES, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      filterByFormula: formula,
      'sort[0][field]': 'fecha_limite_entrega',
      'sort[0][direction]': 'asc',
      fields: SOLICITUD_FIELDS,
    })
    const data = records.map((r) => mapRecord(r.id, r.createdTime, r.fields))
    return NextResponse.json({ data, total: data.length })
  } catch (err) {
    if (err instanceof AirtableError && err.status === 422 && vista === 'cartera') {
      // ejecutiva_asignada not yet created in TX_Solicitudes (D-08 pending)
      return NextResponse.json({ data: [], degraded: true, total: 0 })
    }
    console.error('[GET /api/solicitudes]', err)
    return NextResponse.json(
      { error: 'No se pudo cargar la lista de solicitudes.' },
      { status: 500 }
    )
  }
}

/**
 * Fase 2 · alta interna real vía SC01 (Make). Si MAKE_WEBHOOK_URL_SC01 no está
 * configurada, cae a modo simulado (sim-<uuid>) sin llamar a Make ni escribir
 * en Airtable — así el formulario sigue siendo usable en entornos sin Make.
 *
 * Notas heredadas de Tanda 4A (siguen vigentes):
 *  - `origen_canal` se fija a "ingreso_manual" (único valor válido del singleSelect
 *    real: tally_externo · ingreso_manual · api · migracion_inicial). El valor libre
 *    de `canal` (WhatsApp/Email/Teléfono/...) NO se guarda en origen_canal: se antepone
 *    a `observaciones_internas` como prefijo "Canal: <canal>. " (D-C1, Fase 3).
 *  - `telefono` mapea a TX_Solicitudes.solicitante_telefono.
 *  - `email` y `banco_id` no tienen campo destino todavía en TX_Solicitudes — son
 *    prerrequisito de una tanda posterior (crear `email_contacto` y un campo
 *    equivalente a `banco_id`, o decidir eliminarlos del formulario).
 *
 * Fase 3 · Tanda C ítem 1: se agrega `ejecutiva_email` (email de la sesión Clerk)
 * al payload para que Make resuelva `ejecutiva_asignada` con un Search Records
 * contra AUTH_Usuarios por email (gap_solicitud_persistencia.md, caso "d").
 * El POST a Make ahora va firmado HMAC-SHA256 y logueado en LogEscenarios vía
 * lib/make-client.ts (D-03).
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: 400 }
    )
  }

  const parsed = nuevaSolicitudInternaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Revisa el formulario: hay campos obligatorios sin completar o con errores.' },
      { status: 400 }
    )
  }

  const user = await currentUser()
  const ejecutivaEmail = user?.primaryEmailAddress?.emailAddress ?? ''
  if (!ejecutivaEmail) {
    console.warn(
      '[POST /api/solicitudes] sesión Clerk sin email primario; ejecutiva_asignada no se podrá resolver en Make'
    )
  }

  const payload = {
    ...parsed.data,
    origen_canal: 'ingreso_manual' as const,
    ejecutiva_email: ejecutivaEmail,
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_SC01
  if (!webhookUrl) {
    console.warn('MAKE_WEBHOOK_URL_SC01 no definida, usando modo simulado')
    const id = `sim-${randomUUID()}`
    return NextResponse.json({ id, ...payload }, { status: 201 })
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'SC01',
      timeoutMs: 15000,
    })
  } catch (err) {
    console.error('[POST /api/solicitudes] error de red/timeout hacia Make SC01', err)
    return NextResponse.json(
      { error: 'No pudimos registrar la solicitud. Intenta de nuevo.' },
      { status: 502 }
    )
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/solicitudes] Make SC01 respondió con error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json(
      { error: 'No pudimos registrar la solicitud. Intenta de nuevo.' },
      { status: 502 }
    )
  }

  let makeJson: unknown
  try {
    makeJson = await makeRes.json()
  } catch (err) {
    console.error('[POST /api/solicitudes] respuesta de Make SC01 no es JSON válido', err)
    return NextResponse.json(
      { error: 'No pudimos registrar la solicitud. Intenta de nuevo.' },
      { status: 502 }
    )
  }

  const id =
    typeof makeJson === 'object' && makeJson !== null && 'id' in makeJson
      ? (makeJson as { id: unknown }).id
      : undefined

  if (typeof id !== 'string' || !id.startsWith('rec')) {
    console.error('[POST /api/solicitudes] Make SC01 no retornó ID de solicitud', { makeJson })
    return NextResponse.json({ error: 'Make no retornó ID de solicitud' }, { status: 502 })
  }

  return NextResponse.json({ id, ...payload }, { status: 201 })
}
