import { NextResponse } from 'next/server'
import { listRecords, AirtableError } from '@/lib/airtable-client'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

/**
 * Health check: valida que el token de Airtable esté configurado y que la base
 * responda. Devuelve 200 `{status:'ok'}` sólo si una lectura mínima a
 * `TX_Solicitudes` funciona; 503 `{status:'degraded'}` si falta configuración
 * o Airtable no responde. Útil para el healthcheck de Railway.
 */
export async function GET() {
  const envOk = !!process.env.AIRTABLE_TOKEN && !!process.env.AIRTABLE_BASE_ID
  if (!envOk) {
    return NextResponse.json({ status: 'degraded', airtable: 'sin_configurar' }, { status: 503 })
  }
  try {
    await listRecords(TX_SOLICITUDES, { maxRecords: '1', fields: ['codigo_ext'] })
    return NextResponse.json({ status: 'ok', airtable: 'ok' })
  } catch (err) {
    const detalle = err instanceof AirtableError ? `airtable_${err.status}` : 'error'
    console.error('[GET /api/health]', err)
    return NextResponse.json({ status: 'degraded', airtable: detalle }, { status: 503 })
  }
}
