import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AirtableError } from '@/lib/airtable-client'
import { fetchCatalogos } from '@/lib/catalogos'

export const dynamic = 'force-dynamic'

const MENSAJE_ERROR_RED =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * Catálogos maestros para los selects que alimentan un `Search Records` de
 * SC01 (cliente · tipo de informe · tipo de propiedad · producto · banco
 * financista).
 *
 * Va detrás de Clerk como el resto de `/api/*`: son datos comerciales de
 * VProperty (la cartera completa de clientes), no un catálogo público.
 *
 * @see lib/catalogos.ts — por qué estos 5 catálogos dejaron de estar hardcodeados
 */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const data = await fetchCatalogos()
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/catalogos]', err)
    return NextResponse.json(
      { error: MENSAJE_ERROR_RED },
      { status: err instanceof AirtableError ? 502 : 500 },
    )
  }
}
