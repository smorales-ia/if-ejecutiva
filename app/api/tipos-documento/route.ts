import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AirtableError } from '@/lib/airtable-client'
import { getTiposDocumento } from '@/lib/tipos-documento'

export const dynamic = 'force-dynamic'

const MENSAJE_ERROR_RED =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * Catálogo de tipos de documento (`D_TipoDocumento`) para el checklist del
 * sheet "Documentos y Adjuntos".
 *
 * Es la mitad de RN-25 (Especificación v1.9.4 §4.2): el sistema no infiere el
 * tipo de un documento, lo declara la Ejecutiva desde un dropdown filtrado por
 * esta tabla. Sólo devuelve filas con `activo = TRUE()` — soft-delete de la
 * Capa de Datos v2.6.5.
 *
 * Va detrás de Clerk como el resto de `/api/*`. No emite `Cache-Control`: el
 * repo no usa headers de caché en ninguna ruta, y la caché real es la de
 * `getTiposDocumento()` (memoria del proceso, TTL 5 min).
 *
 * @see lib/tipos-documento.ts — por qué el dominio D_ no vive en lib/catalogos.ts
 */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const data = await getTiposDocumento()
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/tipos-documento]', err)
    return NextResponse.json(
      { error: MENSAJE_ERROR_RED },
      { status: err instanceof AirtableError ? 502 : 500 },
    )
  }
}
