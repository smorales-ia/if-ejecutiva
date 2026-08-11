import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { fetchDecisionMotor } from '@/lib/decision-motor-airtable'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

/**
 * GET /api/solicitudes/[id]/decision-motor — decisión de AT01 para la solicitud.
 *
 * La ruta recibe un record ID, pero `A_DecisionesMotor` identifica la solicitud
 * por su **código** en un `singleLineText` (`solicitud_codigo`), no por el Link:
 * hay que resolver `rec…` → `codigo_solicitud` antes de consultar. Misma
 * traducción que hace `[id]/eventos/route.ts`, y por la misma clase de motivo.
 *
 * Contrato de respuesta: `{ data: DecisionMotor | null }`. El `null` significa
 * "el motor todavía no evaluó esta solicitud" y es un desenlace normal —AT01 se
 * dispara con `estado = creada`—, distinto de un fallo de lectura, que sale por
 * el 502.
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
      console.error('[GET /api/solicitudes/[id]/decision-motor] solicitud sin código', id)
      return NextResponse.json({ data: null })
    }

    const data = await fetchDecisionMotor(codigo)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/solicitudes/[id]/decision-motor]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
