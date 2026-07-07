import { NextResponse } from 'next/server'
import { AirtableError } from '@/lib/airtable-client'
import { fetchVisadores } from '@/lib/visadores'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await fetchVisadores()
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/visadores]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
