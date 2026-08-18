/**
 * `GET /api/tasaciones/[id]/estado` — estado backend de la solicitud.
 *
 * RF-TAS-07 · RF-TAS-19. Lo consumen el polling de la Pantalla 6 (P8-TAS) y el
 * bloqueo del botón «Calcular Tasación» cuando la solicitud ya salió de
 * `asignada`.
 *
 * Es deliberadamente mínima: un estado y dos derivados. El polling la llama
 * cada pocos segundos, así que devolver la proyección completa de `[id]` sería
 * caro sin necesidad.
 */

import type { NextRequest } from 'next/server'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const estado = (guard.fields.estado as string | undefined) ?? null

  return ok({
    id,
    estado,
    /**
     * El formulario es de sólo lectura desde que la solicitud sale de
     * `asignada`: el cálculo ya corre y editar los datos de entrada dejaría el
     * informe describiendo algo distinto de lo que se calculó (RF-TAS-07).
     */
    bloqueadoParaEdicion: estado === 'visitada' || estado === 'calculada',
    /** El informe está disponible para revisar. */
    informeDisponible: estado === 'calculada' || estado === 'pdf_listo',
  })
}
