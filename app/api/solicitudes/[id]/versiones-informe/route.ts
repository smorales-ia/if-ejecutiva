import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { fetchVersionesInforme } from '@/lib/documentos-generados-airtable'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

/**
 * GET /api/solicitudes/[id]/versiones-informe — versiones del PDF (§1.3.4 · RN-56).
 *
 * Lee `TX_DocumentosGenerados`, que es donde el pipeline PDF (E1/E2/E3) registra
 * cada informe emitido. **No lee `TX_Adjuntos`**: esa tabla guarda los
 * antecedentes de entrada y no tiene noción de versión.
 *
 * Igual que el endpoint de decisión del motor, la ruta recibe un record ID y la
 * tabla destino identifica la solicitud por código, así que hay que traducir
 * antes de consultar.
 *
 * `{ data: [] }` significa "el pipeline todavía no generó ningún informe", que
 * es el estado normal de casi toda la cartera. Un fallo de lectura sale por 502.
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
    const solicitud = await getRecord<Record<string, string | undefined>>(
      TX_SOLICITUDES,
      id
    )
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }

    const codigo =
      solicitud.fields['codigo_solicitud'] ?? solicitud.fields['codigo_ext']
    if (!codigo) {
      console.error('[GET /api/solicitudes/[id]/versiones-informe] solicitud sin código', id)
      return NextResponse.json({ data: [] })
    }

    const data = await fetchVersionesInforme(codigo)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/solicitudes/[id]/versiones-informe]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
