import { NextRequest, NextResponse } from 'next/server'
import { AirtableError } from '@/lib/airtable-client'
import { fetchTasadores } from '@/lib/tasadores'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tasadores/candidatos?comuna=X — Candidatos para asignar (P7).
 *
 * Devuelve **todos** los tasadores activos, nunca un subconjunto filtrado por
 * comuna. Es deliberado: `zonas_cobertura` sólo está poblada en los tasadores
 * internos, así que filtrar por comuna escondería a la mitad del padrón por un
 * dato faltante — y una lista vacía bloquearía la asignación sin explicar por
 * qué. En su lugar cada candidato viaja con `cubreComuna`, y el diálogo los
 * ordena (los que cubren primero) y marca al resto con un badge.
 *
 * `cubreComuna` es `false` tanto para "no cubre esta comuna" como para "no
 * declaró zonas". La distinción la da `zonas.length === 0`, que el diálogo usa
 * para redactar el badge sin afirmar algo que no sabe.
 *
 * Lo que queda vivo de H-05: `casos_en_curso` no existe en `M_Tasadores`, así
 * que el orden por carga real sigue siendo por `capacidad_activa`.
 */
export async function GET(request: NextRequest) {
  const comuna = request.nextUrl.searchParams.get('comuna') ?? undefined

  try {
    const tasadores = await fetchTasadores()
    const comunaNormalizada = (comuna ?? '').trim().toLowerCase()
    const candidatos = tasadores.map((t) => ({
      ...t,
      cubreComuna:
        comunaNormalizada !== '' &&
        t.zonas.some((z) => z.toLowerCase() === comunaNormalizada),
    }))
    return NextResponse.json({ candidatos, comuna, coberturaDisponible: true })
  } catch (err) {
    console.error('[GET /api/tasadores/candidatos]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
