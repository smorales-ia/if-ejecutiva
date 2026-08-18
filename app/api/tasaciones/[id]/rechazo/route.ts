/**
 * `POST /api/tasaciones/[id]/rechazo` — RF-TAS-09.
 *
 * Persiste la observación del tasador al rechazar el borrador del informe en
 * `TX_Solicitudes.observacion_rechazo_tasador` (`fldAccib5yNYaOmJc`, creado en
 * P0.5-TAS).
 *
 * ## Lo que esta ruta deliberadamente NO hace
 *
 * - **No toca `estado`.** Bajo ninguna circunstancia. El informe queda como
 *   borrador y la solicitud donde estaba. Es la mitad del requisito.
 * - **No emite aviso al visador** (A-15). Ni notificación, ni evento, ni
 *   correo. La ambigüedad está abierta y el plan manda implementar sólo lo que
 *   RF-TAS-09 declara: persistir y dirigir al canal habitual. El diálogo de la
 *   UI no promete un aviso que el sistema no hace.
 *
 * Que no haya código para esas dos cosas **es** la implementación del
 * requisito, no una omisión: si alguien agrega aquí un cambio de estado o una
 * notificación, rompe RF-TAS-09 sin que ningún test lo note.
 */

import type { NextRequest } from 'next/server'
import { updateRecord } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { auditar } from '@/lib/tasador/auditoria'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'
import { parsearCuerpo, rechazoSchema } from '@/lib/tasador/validators'

export const dynamic = 'force-dynamic'

const CAMPO = 'observacion_rechazo_tasador'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const cuerpo = await parsearCuerpo(request, rechazoSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)

  const anterior = guard.fields[CAMPO]

  try {
    await updateRecord(TABLE_IDS.solicitudes, id, {
      [CAMPO]: cuerpo.datos.observacion,
    })

    await auditar([
      {
        registroId: id,
        registroNombre: String(guard.fields.codigo_solicitud ?? ''),
        campo: CAMPO,
        valorAnterior: anterior,
        valorNuevo: cuerpo.datos.observacion,
        razon: 'Rechazo del borrador por el tasador (RF-TAS-09)',
      },
    ])

    // Se devuelve el estado sin tocar, para que la UI pueda comprobar que no
    // cambió y el test de aceptación tenga qué comparar.
    return ok({ id, estado: guard.fields.estado ?? null })
  } catch (err) {
    return desdeExcepcion('POST /api/tasaciones/[id]/rechazo', err)
  }
}
