import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, isValidRecordId } from '@/lib/airtable-client'
import { fetchAdjuntosPorSolicitud } from '@/lib/adjuntos'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isValidRecordId(id)) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }

  try {
    const data = await fetchAdjuntosPorSolicitud(id)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/solicitudes/[id]/adjuntos]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
