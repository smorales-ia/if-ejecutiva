import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { fetchSolicitudes, VISTAS_VALIDAS, type Vista } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

/**
 * Clave del contador de "mi cartera en SLA rojo" (§1.2 · RN-04).
 *
 * No es una vista: no aparece en `VISTAS_VALIDAS` ni tiene pestaña propia. Es el
 * cruce de la vista `mi_cartera` con el filtro agregado `?sla=rojo`, y existe
 * porque el indicador del header lo necesita como número.
 *
 * **El número y su enlace miden lo mismo, y esto es el punto.** El indicador
 * lleva a `/consola?vista=mi_cartera&sla=rojo`, que es exactamente la consulta
 * que se cuenta acá. Contar sobre la cartera propia y enlazar a la pestaña
 * global "SLA en riesgo" —que además incluye el ámbar— haría que la ejecutiva
 * viera "3" y aterrizara en una lista de doce.
 */
export const CLAVE_CARTERA_ROJO = 'mi_cartera_rojo'

/**
 * GET /api/solicitudes/contadores — conteo por vista para las pestañas (P5) y
 * para el indicador de cartera del header (§1.2).
 *
 * Devuelve `{ contadores: { <vista>: number, mi_cartera_rojo: number } }`.
 *
 * Cada entrada es una consulta independiente a Airtable — se ejecutan en
 * paralelo. Un fallo puntual degrada esa entrada a 0 sin tumbar el resto: un
 * contador ausente esconde una pestaña, un 500 esconde la pantalla entera.
 *
 * Las vistas que dependen de la sesión (`mi_cartera` y su derivada en rojo)
 * cuentan 0 sin sesión Clerk, que es lo mismo que verían esas pestañas.
 */
export async function GET(_request: NextRequest) {
  const { userId } = await auth()

  const entradas = await Promise.all([
    ...VISTAS_VALIDAS.map(async (vista: Vista): Promise<[string, number]> => {
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
    }),
    (async (): Promise<[string, number]> => {
      // Sin sesión no hay cartera propia que contar. Se corta antes de la
      // consulta: `fetchSolicitudes('mi_cartera', undefined)` degradaría a la
      // rama sin ejecutiva y el número no significaría lo que dice la etiqueta.
      if (!userId) return [CLAVE_CARTERA_ROJO, 0]
      try {
        // `sla: 'rojo'` es el semáforo **agregado** de RF-08 (días contra
        // `C_SLA`), no el de etapa de RF-53. Son dos relojes distintos que
        // conviven (§5.2) y el indicador del header habla del primero.
        const { data } = await fetchSolicitudes('mi_cartera', userId, {
          sla: 'rojo',
        })
        return [CLAVE_CARTERA_ROJO, data.length]
      } catch (err) {
        console.error('[GET /api/solicitudes/contadores] mi_cartera_rojo', err)
        return [CLAVE_CARTERA_ROJO, 0]
      }
    })(),
  ])

  return NextResponse.json({ contadores: Object.fromEntries(entradas) })
}
