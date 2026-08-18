/**
 * `GET · POST /api/tasaciones/[id]/fotos` — organizador de fotos de la visita.
 *
 * RF-TAS-14 · §2.6. Tanda P2-TAS · plan §3.1.
 *
 * ## El binario no pasa por acá
 *
 * Esta ruta gestiona **metadatos** en `TX_Adjuntos`. El archivo sube por el
 * pipeline existente (`app/api/adjuntos/upload/route.ts` → Make → Dropbox), que
 * IF-03 reutiliza tal cual (R7). El POST de acá registra la fila y su categoría;
 * recibe la `url_dropbox` que aquel devolvió.
 *
 * Separarlos es deliberado: el organizador reordena y recategoriza fotos ya
 * subidas muchas más veces de las que sube archivos nuevos, y esas operaciones
 * no deben arrastrar un multipart.
 *
 * ## A-16 · los mínimos no se resuelven acá
 *
 * La ruta devuelve el **conteo por categoría**. Cuántas exige cada una lo decide
 * `resolverLimite()` en el cliente (P2-TAS.B) a partir de lo declarado en la
 * sección B, que es el único punto de cambio si A-16 cierra a favor de mínimos
 * fijos. El server no conoce los mínimos y por eso no hay ningún literal
 * numérico en este archivo.
 *
 * ## ⚠ `TX_Adjuntos` no tiene campo `seccion`
 *
 * El plan §2.6 afirma que *"el campo `TX_Adjuntos.seccion` se sigue escribiendo
 * aunque la sección ya aparezca en el path"*. **Ese campo no existe** en la
 * tabla (26 campos, verificados vía Meta API el 17-ago-2026). La categoría se
 * guarda en `tipo_adjunto` y el detalle libre en `descripcion`. Anotado para
 * P5-TAS, que es la tanda de esta pantalla.
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createRecord, listRecords } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { auditar } from '@/lib/tasador/auditoria'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'
import { parsearCuerpo } from '@/lib/tasador/validators'

export const dynamic = 'force-dynamic'

/**
 * Alta de foto ya subida a Dropbox.
 *
 * `categoria` es libre a propósito: el catálogo tiene ocho entradas fijas
 * (`CATEGORIAS_FOTO`) **más las personalizadas que el tasador crea en terreno**
 * (§2.6), así que un `enum` cerrado rechazaría precisamente lo que el requisito
 * permite.
 */
const fotoSchema = z.object({
  categoria: z.string().trim().min(1),
  nombreArchivo: z.string().trim().min(1),
  urlDropbox: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  tamanioKb: z.number().nonnegative().optional(),
  mimeType: z.string().trim().optional(),
  orden: z.number().int().nonnegative().optional(),
})

interface AdjuntoFields {
  nombre_archivo?: string
  tipo_adjunto?: string
  descripcion?: string
  url_dropbox?: string
  thumbnail_url?: string
  tamanio_kb?: number
  orden?: number
  subido_por?: string
  subido_en?: string
  solicitud?: string[]
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
    if (!codigo) return ok({ id, fotos: [], porCategoria: {}, total: 0 })

    const registros = await listRecords<AdjuntoFields>(TABLE_IDS.adjuntos, {
      filterByFormula: `AND({solicitud}="${codigo.replace(/"/g, '\\"')}",{subido_por}="Tasador")`,
      'sort[0][field]': 'orden',
      'sort[0][direction]': 'asc',
    })

    const fotos = registros.map((r) => ({
      id: r.id,
      // La categoría real vive en `descripcion` cuando es personalizada; el
      // vocabulario cerrado de `tipo_adjunto` no admite nombres libres.
      categoria: r.fields.descripcion || r.fields.tipo_adjunto || 'otro',
      nombre: r.fields.nombre_archivo ?? '',
      url: r.fields.url_dropbox ?? null,
      thumbnailUrl: r.fields.thumbnail_url ?? null,
      orden: r.fields.orden ?? null,
      subidoEn: r.fields.subido_en ?? null,
    }))

    const porCategoria = fotos.reduce<Record<string, number>>((acc, f) => {
      acc[f.categoria] = (acc[f.categoria] ?? 0) + 1
      return acc
    }, {})

    return ok({ id, fotos, porCategoria, total: fotos.length })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/fotos', err)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const cuerpo = await parsearCuerpo(request, fotoSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)

  const d = cuerpo.datos

  try {
    const creado = await createRecord<AdjuntoFields>(TABLE_IDS.adjuntos, {
      solicitud: [id],
      nombre_archivo: d.nombreArchivo,
      // `tipo_adjunto` tiene dominio cerrado; la categoría libre del organizador
      // va en `descripcion`, que es texto. Escribir la categoría personalizada
      // en `tipo_adjunto` la crearía como opción nueva por `typecast`.
      tipo_adjunto: 'foto_interior',
      descripcion: d.categoria,
      url_dropbox: d.urlDropbox,
      thumbnail_url: d.thumbnailUrl,
      tamanio_kb: d.tamanioKb,
      mime_type: d.mimeType,
      orden: d.orden,
      subido_por: 'Tasador',
      subido_en: new Date().toISOString(),
    })

    await auditar([
      {
        registroId: id,
        registroNombre: String(guard.fields.codigo_solicitud ?? ''),
        campo: 'fotos',
        valorAnterior: '',
        valorNuevo: `alta ${creado.id} · ${d.categoria} · ${d.nombreArchivo}`,
        razon: 'Alta de foto de la visita desde IF-03 (RF-TAS-14)',
      },
    ])

    return ok({ id: creado.id, categoria: d.categoria, nombre: d.nombreArchivo }, 201)
  } catch (err) {
    return desdeExcepcion('POST /api/tasaciones/[id]/fotos', err)
  }
}
