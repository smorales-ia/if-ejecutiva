import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { fetchHistorialSolicitud } from '@/lib/historial-airtable'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

/**
 * GET /api/solicitudes/[id]/eventos — timeline de §1.3.3.
 *
 * Devuelve el riel único: los hitos de `A_Eventos` **y** los cambios auditados
 * de `A_Cambios`, fundidos por timestamp descendente. Hasta la Tanda de
 * cableado del detalle sólo servía `A_Eventos`, y la pestaña ni siquiera lo
 * consumía: pintaba el mock `HISTORIAL` de `lib/console-data.ts`.
 *
 * Las dos tablas se referencian de forma distinta y por eso hacen falta los dos
 * identificadores: `A_Eventos` tiene un Link que dentro de una fórmula se
 * evalúa contra el primary field (`codigo_solicitud`), mientras que `A_Cambios`
 * guarda el record ID crudo en `registro_id`. La traducción `rec…` → código se
 * hace acá, una sola vez, y cuesta una lectura extra.
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
      // Sin código no se puede filtrar `A_Eventos` sin traer la tabla entera.
      // Los cambios sí se pueden leer: no dependen del código sino del record
      // ID, así que se sirve la mitad que sí es correcta en vez de nada.
      console.error('[GET /api/solicitudes/[id]/eventos] solicitud sin código', id)
      const data = await fetchHistorialSolicitud(id, '')
      return NextResponse.json({ data })
    }

    const data = await fetchHistorialSolicitud(id, codigo)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/solicitudes/[id]/eventos]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
