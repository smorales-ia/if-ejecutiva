/**
 * `POST /api/tasaciones/[id]/calcular` — transición `asignada → visitada`.
 *
 * RF-TAS-07 · RF-TAS-22. Tanda P2-TAS · plan §3.1.
 *
 * ## Es la mutación más delicada del plan
 *
 * Dispara **SC06 → SC08 → AT03** aguas abajo y **no se puede deshacer desde la
 * UI**. Por eso el guard de estado es lo primero después de la autorización, y
 * por eso la escritura es un único `PATCH` con los dos campos: si `estado` y
 * `fecha_visita` fueran dos llamadas, un fallo entre medio dejaría la solicitud
 * en `visitada` sin fecha real, que es justo lo que la Regla T-B prohíbe.
 *
 * ## El 409 no es cosmético
 *
 * Un doble tap en «Calcular Tasación», o un reintento del usuario tras un
 * timeout, llegarían dos veces. La segunda encuentra `estado != asignada` y se
 * rechaza **sin escribir**. Sin este guard, AT03 se dispararía dos veces sobre
 * la misma solicitud.
 */

import type { NextRequest } from 'next/server'
import { updateRecord } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { auditar } from '@/lib/tasador/auditoria'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'
import { calcularSchema, parsearCuerpo } from '@/lib/tasador/validators'

export const dynamic = 'force-dynamic'

/** Único estado desde el que se puede enviar a cálculo. */
const ESTADO_ORIGEN = 'asignada'
const ESTADO_DESTINO = 'visitada'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Capas 1 y 2 — identidad y autorización.
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  // Capa 3 — validación. El cuerpo va vacío; un cuerpo con basura se rechaza.
  const cuerpo = await parsearCuerpo(request, calcularSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)

  const estadoActual = guard.fields.estado

  if (estadoActual === ESTADO_DESTINO || estadoActual === 'calculada') {
    return error(MENSAJES.calculoYaIniciado, 409)
  }
  if (estadoActual !== ESTADO_ORIGEN) {
    return error(MENSAJES.estadoNoPermite, 409)
  }

  // La fecha real de visita es obligatoria para calcular (Regla T-B). Si no
  // está, el formulario no debería haber habilitado el botón — pero el server
  // revalida: la UI muestra y captura, nunca decide.
  const fechaVisitaReal = guard.fields['fecha_visita']
  if (!fechaVisitaReal) {
    return error(MENSAJES.estadoNoPermite, 409)
  }

  try {
    // Capa 4 — escritura. Un solo PATCH.
    await updateRecord(TABLE_IDS.solicitudes, id, { estado: ESTADO_DESTINO })

    await auditar([
      {
        registroId: id,
        registroNombre: String(guard.fields.codigo_solicitud ?? ''),
        campo: 'estado',
        valorAnterior: estadoActual,
        valorNuevo: ESTADO_DESTINO,
        razon: 'Envío a cálculo desde IF-03 (RF-TAS-22)',
      },
    ])

    return ok({ id, estado: ESTADO_DESTINO })
  } catch (err) {
    return desdeExcepcion('POST /api/tasaciones/[id]/calcular', err)
  }
}
