/**
 * `GET /api/tasaciones/[id]/lectura` — avance de la extracción documental.
 *
 * RF-TAS-15. La consume el stepper de la Pantalla 4 por polling (P6-TAS).
 *
 * ## No dispara nada: sólo observa
 *
 * El pipeline de extracción ya existe (`SC-RF09-ExtraccionClaude` +
 * `app/api/adjuntos/upload/route.ts`). IF-03 **consulta** el avance leyendo
 * `TX_Adjuntos.estado_extraccion` (`fld54epvDJ7YdJIYD`); no escribe un pipeline
 * nuevo ni reintenta.
 *
 * ## Regla T-C
 *
 * La respuesta no nombra el medio técnico. Devuelve un progreso y un estado
 * agregado; los literales visibles («Leyendo datos de la visita», «Datos
 * listos») los pone la UI. Ningún campo de este body dice IA, modelo ni OCR
 * — nótese que el campo `procesado_por_ia` de `TX_Adjuntos` **no se expone**.
 */

import type { NextRequest } from 'next/server'
import { listRecords } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { desdeExcepcion, desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

interface AdjuntoFields {
  nombre_archivo?: string
  estado_extraccion?: string
  solicitud?: string[]
}

/** Estados de `estado_extraccion` que cuentan como terminados. */
const TERMINALES = new Set(['listo', 'error', 'skipped', 'no_corresponde', 'delegado_visador'])
const EN_CURSO = 'extrayendo'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const codigo = String(guard.fields.codigo_solicitud ?? '')

  try {
    // El Link `solicitud` de TX_Adjuntos se evalúa dentro de una fórmula contra
    // el primary field de TX_Solicitudes, que es `codigo_solicitud` — no contra
    // el recordId (E-018). Sin código no se puede filtrar sin traer la tabla.
    if (!codigo) {
      console.error('[GET /api/tasaciones/[id]/lectura] solicitud sin código', id)
      return ok({ id, total: 0, terminados: 0, enCurso: 0, conError: 0, completo: true })
    }

    const adjuntos = await listRecords<AdjuntoFields>(TABLE_IDS.adjuntos, {
      filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
      fields: ['nombre_archivo', 'estado_extraccion'],
    })

    const estados = adjuntos.map((a) => a.fields.estado_extraccion ?? 'idle')
    const terminados = estados.filter((e) => TERMINALES.has(e)).length
    const enCurso = estados.filter((e) => e === EN_CURSO).length
    const conError = estados.filter((e) => e === 'error').length

    return ok({
      id,
      total: estados.length,
      terminados,
      enCurso,
      conError,
      /**
       * `true` cuando no queda nada por procesar. Con cero adjuntos también es
       * `true`: no hay nada que esperar, y dejar el stepper girando para
       * siempre sería peor que avanzar.
       */
      completo: estados.length === 0 || terminados === estados.length,
    })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/lectura', err)
  }
}
