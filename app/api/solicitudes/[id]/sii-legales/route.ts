import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { fetchSiiLegales } from '@/lib/sii-legales-airtable'
import { SII_LEGALES_VACIO } from '@/lib/sii-legales'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

/**
 * GET /api/solicitudes/[id]/sii-legales — bloques «Datos SII» y «Antecedentes
 * legales» de la pestaña Datos, leídos de `TX_Unidades`, `TX_DatosTasacion` y
 * `TX_DocumentosLegales`. Reemplaza a los mocks de `lib/console-data.ts` (PRD R3).
 *
 * Contrato: `{ data: SiiLegales }`. Una solicitud sin filas en esas tablas
 * devuelve los bloques con «—», no un error: es el caso normal antes de que se
 * suban los documentos.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isValidRecordId(id)) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }

  try {
    const solicitud = await getRecord<Record<string, string | undefined>>(TX_SOLICITUDES, id)
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }

    const codigo = solicitud.fields['codigo_solicitud'] ?? solicitud.fields['codigo_ext']
    if (!codigo) {
      console.error('[GET /api/solicitudes/[id]/sii-legales] solicitud sin código', id)
      return NextResponse.json({ data: SII_LEGALES_VACIO })
    }

    const data = await fetchSiiLegales(codigo)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/solicitudes/[id]/sii-legales]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
