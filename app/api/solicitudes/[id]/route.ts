import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { mapRecord, SOLICITUD_FIELDS, TX_SOLICITUDES } from '@/lib/solicitudes'

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
    const record = await getRecord<Record<string, string | undefined>>(TX_SOLICITUDES, id, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      fields: SOLICITUD_FIELDS,
    })

    if (!record) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }

    const data = mapRecord(record.id, record.createdTime, record.fields)
    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof AirtableError && err.status === 404) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    console.error('[GET /api/solicitudes/[id]]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: 502 }
    )
  }
}
