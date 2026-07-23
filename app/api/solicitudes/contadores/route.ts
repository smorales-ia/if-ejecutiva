import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { fetchSolicitudes, VISTAS_VALIDAS, type Vista } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

/**
 * GET /api/solicitudes/contadores — Conteo por vista para las pestañas (P5).
 *
 * Devuelve `{ contadores: { <vista>: number } }` sobre `VISTAS_VALIDAS` reales
 * del repo. La reconciliación del enum `Vista` (nombres del plan: `mi_cartera`,
 * `por_asignar`, `todas`) se resuelve en P5; aquí se cuentan las vistas que hoy
 * existen. `cartera` requiere sesión Clerk; sin ella cuenta 0.
 *
 * Cada vista es una consulta independiente a Airtable — se ejecutan en paralelo.
 * Un fallo puntual de una vista degrada esa a 0 sin tumbar el resto.
 */
export async function GET(_request: NextRequest) {
  const { userId } = await auth()

  const entradas = await Promise.all(
    VISTAS_VALIDAS.map(async (vista: Vista): Promise<[Vista, number]> => {
      try {
        const { data } = await fetchSolicitudes(
          vista,
          vista === 'mi_cartera' ? (userId ?? undefined) : undefined
        )
        return [vista, data.length]
      } catch (err) {
        console.error(`[GET /api/solicitudes/contadores] vista ${vista}`, err)
        return [vista, 0]
      }
    })
  )

  return NextResponse.json({ contadores: Object.fromEntries(entradas) })
}
