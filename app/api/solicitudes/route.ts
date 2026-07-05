import { NextResponse } from 'next/server'
import { fetchSolicitudes } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await fetchSolicitudes()
    return NextResponse.json({ data, total: data.length })
  } catch (err) {
    console.error('[GET /api/solicitudes]', err)
    return NextResponse.json(
      { error: 'No se pudo cargar la lista de solicitudes.' },
      { status: 500 }
    )
  }
}
