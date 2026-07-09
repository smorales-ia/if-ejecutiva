import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  fetchSolicitudes,
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
    // fetchSolicitudes resuelve clerk_user_id -> AUTH_Usuarios internamente
    // para "cartera" (ver lib/solicitudes.ts, resolveEjecutiva).
    const { data, degraded, motivo } = await fetchSolicitudes(vista, userId, filtros)
    return NextResponse.json({ data, total: data.length, degraded, motivo })
  } catch (err) {
    console.error('[GET /api/solicitudes]', err)
    return NextResponse.json(
      { error: 'No se pudo cargar la lista de solicitudes.' },
      { status: 500 }
    )
  }
}
