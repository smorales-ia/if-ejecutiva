import { NextRequest, NextResponse } from 'next/server'
import { AirtableError } from '@/lib/airtable-client'
import { fetchTasadores } from '@/lib/tasadores'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tasadores/candidatos?comuna=X — Candidatos para asignar (P7).
 *
 * H-05: `zonas_cobertura` y `casos_en_curso` aún no existen en `M_Tasadores`,
 * así que no se puede clasificar por cobertura ni ordenar por carga. Mientras
 * tanto se devuelven todos los tasadores activos (fetchTasadores, orden por
 * `capacidad_activa`) con `coberturaDisponible: false`, y el diálogo de P7
 * decide cómo presentarlos. La comuna se ecoa para trazabilidad.
 */
export async function GET(request: NextRequest) {
  const comuna = request.nextUrl.searchParams.get('comuna') ?? undefined

  try {
    const candidatos = await fetchTasadores()
    return NextResponse.json({ candidatos, comuna, coberturaDisponible: false })
  } catch (err) {
    console.error('[GET /api/tasadores/candidatos]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
