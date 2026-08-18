/**
 * `GET /api/tasaciones/[id]` — datos de la solicitud para las pantallas de
 * fotos, formulario e informe. RF-09.
 *
 * Devuelve una proyección explícita, no el registro crudo: `TX_Solicitudes`
 * tiene 157 campos y la mayoría no le incumben al tasador. Enumerar lo que sale
 * es también parte del blindaje — un campo nuevo en Airtable no se filtra solo
 * a la respuesta.
 *
 * ## Proyección compartida — ensanchada en P2-TAS.B
 *
 * El cuerpo lo arma `proyectarTasacion()` de `lib/tasador/lectura-tasacion.ts`,
 * el mismo mapper que consumen los Server Components. Hasta P2-TAS.A esta ruta
 * devolvía 17 claves planas que **no** satisfacían el tipo `Tasacion`: faltaban
 * `comuna`, `tipo`, `cliente`, `producto`, `visita`, `version`, `datos` y
 * `datosEjecutiva`, los ocho no-opcionales. Los componentes compilaban contra
 * un tipo que ninguna ruta servía. La enumeración sigue siendo explícita; lo
 * que cambia es que vive en un solo sitio.
 */

import type { NextRequest } from 'next/server'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { leerMaestros, proyectarTasacion } from '@/lib/tasador/lectura-tasacion'
import { desdeExcepcion, desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // El guard ya leyó el registro: no se vuelve a pedir.
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  try {
    const maestros = await leerMaestros()

    return ok({
      ...proyectarTasacion(guard.solicitudId, guard.fields, maestros),
      /**
       * Fuera de `Tasacion` porque ninguna pantalla lo pinta hoy, pero la ruta
       * lo sirve: es lo que `POST /rechazo` persiste y lo que P9-TAS necesita
       * para mostrar la devolución del visador (RF-TAS-09).
       */
      observacionRechazoTasador: guard.fields['observacion_rechazo_tasador'] ?? null,
      /** Regla T-B — las dos fechas de visita, que nunca se colapsan. */
      fechaVisitaReal: guard.fields['fecha_visita'] ?? null,
      rolSii: guard.fields['rol_sii'] ?? null,
    })
  } catch (err) {
    return desdeExcepcion(`GET /api/tasaciones/${id}`, err)
  }
}
