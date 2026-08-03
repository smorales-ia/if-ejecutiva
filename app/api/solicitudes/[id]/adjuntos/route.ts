import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, isValidRecordId } from '@/lib/airtable-client'
import { fetchAdjuntosPorSolicitud } from '@/lib/adjuntos'

export const dynamic = 'force-dynamic'

/**
 * Adjuntos de una solicitud (`TX_Adjuntos` filtrados por el Link `solicitud`).
 *
 * ## Instrumentación `[ADJUNTOS-LEER]` (02-ago-2026 · Bug A)
 *
 * Se reportó un banner "No pudimos cargar los adjuntos" en VP-2026-0053
 * (`recIEvKCbe7J8TDaB`) pese a existir 2 filas en `TX_Adjuntos` ligadas a esa
 * solicitud. La reproducción estática del path servidor —misma querystring,
 * mismo token— devuelve **HTTP 200 con las 2 filas**, así que el fallo no está
 * ni en los nombres de campo ni en el filtro en memoria.
 *
 * La hipótesis viva es un **429 de Airtable**: `fetchAdjuntosPorSolicitud` lee
 * la tabla completa en cada apertura del sheet, y tras una subida se dispara de
 * nuevo (`recargar()`) mientras Make ejecuta Search + Create + 2 escrituras de
 * log contra la misma base. Airtable limita a 5 req/s por base, y el backoff de
 * `lib/airtable-client.ts` reintenta a 1s y 2s cuando no viene `Retry-After` —
 * demasiado corto para el 429 de Airtable, que pide ~30s. Agotados los 3
 * intentos, `listRecords` lanza `AirtableError(429)` y esta ruta responde 502,
 * que el hook pinta como banner rojo.
 *
 * Estos logs quedan hasta que Sergio reproduzca el fallo una vez: con el status
 * y el conteo en mano, la causa deja de ser hipótesis. Retirar después.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isValidRecordId(id)) {
    console.warn('[ADJUNTOS-LEER] id rechazado por isValidRecordId', { id })
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }

  const t0 = Date.now()
  try {
    const data = await fetchAdjuntosPorSolicitud(id)
    console.info('[ADJUNTOS-LEER] ok', {
      solicitudId: id,
      encontrados: data.length,
      ms: Date.now() - t0,
      claves: data.map((a) => a.claveAdjunto || '(sin clave)'),
    })
    return NextResponse.json({ data })
  } catch (err) {
    const status = err instanceof AirtableError ? 502 : 500
    console.error('[ADJUNTOS-LEER] FALLO', {
      solicitudId: id,
      ms: Date.now() - t0,
      status,
      airtableStatus: err instanceof AirtableError ? err.status : undefined,
      detalle: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status }
    )
  }
}
