import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listRecords, AirtableError } from '@/lib/airtable-client'
import {
  buildFormula,
  mapRecord,
  SOLICITUD_FIELDS,
  TX_SOLICITUDES,
  VISTAS_VALIDAS,
  type SolicitudesFiltros,
  type Vista,
} from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const rawVista = searchParams.get('vista') ?? 'activas'
  const vista: Vista = VISTAS_VALIDAS.includes(rawVista as Vista)
    ? (rawVista as Vista)
    : 'activas'

  // D-07: filtros de FiltrosBar leídos server-side desde query params.
  const filtros: SolicitudesFiltros = {
    cliente: searchParams.get('cliente') ?? undefined,
    estado: searchParams.get('estado') ?? undefined,
    sla: searchParams.get('sla') ?? undefined,
    desde: searchParams.get('desde') ?? undefined,
    hasta: searchParams.get('hasta') ?? undefined,
  }

  let userId: string | undefined
  if (vista === 'cartera') {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    userId = clerkUserId
  }

  try {
    const formula = buildFormula(vista, userId, filtros)
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
