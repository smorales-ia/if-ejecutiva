/**
 * `GET /api/tasaciones/[id]` — datos de la solicitud para las pantallas de
 * fotos, formulario e informe. RF-09.
 *
 * Devuelve una proyección explícita, no el registro crudo: `TX_Solicitudes`
 * tiene 157 campos y la mayoría no le incumben al tasador. Enumerar lo que sale
 * es también parte del blindaje — un campo nuevo en Airtable no se filtra solo
 * a la respuesta.
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

  // El guard ya leyó el registro: no se vuelve a pedir.
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const f = guard.fields

  return ok({
    id,
    codigo: f.codigo_solicitud ?? '',
    estado: f.estado ?? null,
    direccion: f['direccion'] ?? null,
    rolSii: f['rol_sii'] ?? null,
    tipoPropiedad: f['tipo_propiedad_nuevo_usado'] ?? null,
    proyecto: f['proyecto_condominio'] ?? null,
    observaciones: f['observaciones_internas'] ?? null,
    valorEstimadoUf: f['monto_estimado_uf'] ?? null,
    /** Regla T-B — dos fechas que nunca se colapsan. */
    fechaVisitaPlanificada: f['fecha_visita_programada'] ?? null,
    fechaVisitaReal: f['fecha_visita'] ?? null,
    fechaSolicitud: f['fecha_solicitud'] ?? null,
    fechaAsignacion: f['fecha_asignacion_ts'] ?? null,
    observacionRechazoTasador: f['observacion_rechazo_tasador'] ?? null,
    vendedor: {
      nombre: f['vendedor_razon_social_o_nombre'] ?? null,
      rut: f['vendedor_rut'] ?? null,
    },
    pdfUrl: f['pdf_final_url'] ?? null,
  })
}
