/**
 * `GET /api/tasaciones/[id]/informe-data` — el JSON canónico completo del
 * informe (`InformeContexto`) más su medición de paridad.
 *
 * Tanda T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 3. Calcado del
 * patrón de `app/api/tasaciones/[id]/informe/route.ts`: guard →
 * `desdeGuard`, `catch` → `desdeExcepcion`, body `{ data }` vía `ok`.
 *
 * ## Quién lo consume
 *
 * - Hoy: el harness de paridad y la verificación manual en dev.
 * - En T5: **SC09** (orquestador delgado en Make) hace este GET, pasa el
 *   contexto por el generador de textos (RF-32) y lo entrega a Carbone. Por
 *   eso la respuesta incluye `paridad`: SC09 puede rehusarse a imprimir un
 *   informe cuyo score cayó bajo el baseline.
 *
 * ## GET puro — sin PATCH, y no debe haberlo
 *
 * Misma regla que `/informe`: el contexto se **lee**; los datos los escriben
 * la UI (`/datos`), el motor AT03 y el cron UF. Los únicos campos calculados
 * acá (fila TASACIÓN de comparables) están documentados en el ensamblador
 * como puente F-2/P1-8.
 */

import type { NextRequest } from 'next/server'
import { lecturaInformeContexto } from '@/lib/informe/ensamblador'
import { medirParidad } from '@/lib/informe/medidor'
import { desdeExcepcion, desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await lecturaInformeContexto(id)
    if (!res.ok) return desdeGuard(res.guard)

    const { contexto } = res
    return ok({ contexto, paridad: medirParidad(contexto) })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/informe-data', err)
  }
}
