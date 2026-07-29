import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { fetchEventosPorSolicitud } from '@/lib/eventos'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

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
    // La ruta recibe un record ID, pero el filtro de A_Eventos va contra el
    // primary field (E-076): hay que resolver `rec…` → `codigo_solicitud`
    // antes de consultar. Una lectura extra, aceptable para el historial.
    const solicitud = await getRecord<Record<string, string | undefined>>(TX_SOLICITUDES, id)
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }

    const codigo = solicitud.fields['codigo_solicitud'] ?? solicitud.fields['codigo_ext']
    if (!codigo) {
      // Sin código no se puede filtrar sin devolver la tabla entera.
      console.error('[GET /api/solicitudes/[id]/eventos] solicitud sin código', id)
      return NextResponse.json({ data: [] })
    }

    const data = await fetchEventosPorSolicitud(codigo)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/solicitudes/[id]/eventos]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
