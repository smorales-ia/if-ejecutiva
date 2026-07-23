import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  fetchSolicitudes,
  ORDENES_VALIDOS,
  VISTA_DEFAULT,
  VISTAS_VALIDAS,
  type OrdenParam,
  type SolicitudesFiltros,
  type Vista,
} from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

const PAGE_SIZE_DEFAULT = 20

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const rawVista = searchParams.get('vista') ?? VISTA_DEFAULT
  const vista: Vista = VISTAS_VALIDAS.includes(rawVista as Vista)
    ? (rawVista as Vista)
    : VISTA_DEFAULT

  // D-07: filtros de FiltrosBar leídos server-side desde query params.
  const filtros: SolicitudesFiltros = {
    cliente: searchParams.get('cliente') ?? undefined,
    estado: searchParams.get('estado') ?? undefined,
    sla: searchParams.get('sla') ?? undefined,
    desde: searchParams.get('desde') ?? undefined,
    hasta: searchParams.get('hasta') ?? undefined,
    tasador: searchParams.get('tasador') ?? undefined,
    prioridad: searchParams.get('prioridad') ?? undefined,
    q: searchParams.get('q') ?? undefined,
  }

  const rawOrden = searchParams.get('orden') ?? undefined
  const orden: OrdenParam | undefined = ORDENES_VALIDOS.includes(rawOrden as OrdenParam)
    ? (rawOrden as OrdenParam)
    : undefined

  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const pageSize = Math.max(1, Number(searchParams.get('pageSize') ?? PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT)

  let userId: string | undefined
  if (vista === 'mi_cartera') {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    userId = clerkUserId
  }

  try {
    // fetchSolicitudes resuelve clerk_user_id -> AUTH_Usuarios internamente
    // para "mi_cartera" (ver lib/solicitudes.ts, resolveEjecutiva).
    const { data, degraded, motivo } = await fetchSolicitudes(vista, userId, filtros, orden)
    const total = data.length
    const paginadas = data.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
    return NextResponse.json({ data: paginadas, total, page, pageSize, degraded, motivo })
  } catch (err) {
    console.error('[GET /api/solicitudes]', err)
    return NextResponse.json(
      { error: 'No se pudo cargar la lista de solicitudes.' },
      { status: 500 }
    )
  }
}
