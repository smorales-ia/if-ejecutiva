/**
 * `GET /api/tasaciones/[id]/expediente` — adjuntos de sólo lectura.
 *
 * RF-TAS-10. La consume `components/tasador/expediente-sheet.tsx`.
 *
 * ## Sólo lectura, y por eso este archivo no tiene POST ni DELETE
 *
 * RF-TAS-10 exige que el expediente **no permita alta, reemplazo ni baja de
 * archivos**. La forma de garantizarlo en la capa server es que los verbos de
 * escritura no existan: un `DELETE` que devuelve 405 es una invitación; uno que
 * no está no se puede llamar por error desde la UI.
 *
 * Las altas de fotos van por `/fotos`, que es otra ruta con otro contrato.
 */

import type { NextRequest } from 'next/server'
import { listRecords } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { desdeExcepcion, desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

interface AdjuntoFields {
  nombre_archivo?: string
  tipo?: string
  tipo_adjunto?: string
  url_dropbox?: string
  thumbnail_url?: string
  tamanio_kb?: number
  mime_type?: string
  subido_por?: string
  subido_en?: string
  descripcion?: string
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const codigo = String(guard.fields.codigo_solicitud ?? '')

  try {
    if (!codigo) {
      console.error('[GET /api/tasaciones/[id]/expediente] solicitud sin código', id)
      return ok({ id, archivos: [], total: 0 })
    }

    const adjuntos = await listRecords<AdjuntoFields>(TABLE_IDS.adjuntos, {
      filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
      'sort[0][field]': 'orden',
      'sort[0][direction]': 'asc',
    })

    const archivos = adjuntos.map((a) => ({
      id: a.id,
      nombre: a.fields.nombre_archivo ?? '',
      // `tipo_adjunto` es el vocabulario nuevo (foto_exterior · plano · cbr …);
      // `tipo` es el legacy con etiquetas largas. Se exponen los dos porque en
      // la base conviven poblados de forma desigual.
      tipo: a.fields.tipo_adjunto ?? a.fields.tipo ?? null,
      url: a.fields.url_dropbox ?? null,
      thumbnailUrl: a.fields.thumbnail_url ?? null,
      // El sheet muestra tamaños en bytes; Airtable guarda KB.
      sizeBytes: typeof a.fields.tamanio_kb === 'number' ? a.fields.tamanio_kb * 1000 : null,
      mimeType: a.fields.mime_type ?? null,
      subidoPor: a.fields.subido_por ?? null,
      subidoEn: a.fields.subido_en ?? null,
      descripcion: a.fields.descripcion ?? null,
    }))

    return ok({ id, archivos, total: archivos.length })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/expediente', err)
  }
}
