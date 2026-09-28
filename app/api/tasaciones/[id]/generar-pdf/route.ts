/**
 * `POST /api/tasaciones/[id]/generar-pdf` — dispara la imprenta del informe.
 *
 * T-PDF-IMPRENTA-20260927 · cierra el stub `marcarPdfListo` (P2-TAS.B).
 *
 * La UI muestra y captura; la cadena decide: este route sólo ensambla el
 * `InformeContexto` in-process (guard de tasador incluido — mismo
 * `lecturaInformeContexto` que `informe-data`) y lo entrega firmado al
 * webhook de E2_Carbone_Render. El render (Carbone), el almacenamiento
 * (Dropbox vía E3) y la transición a `pdf_listo` + `pdf_final_url` +
 * `TX_DocumentosGenerados` ocurren en Make, nunca acá.
 *
 * El 409 protege contra doble click y contra estados sin cálculo: sólo se
 * imprime una solicitud `calculada` o `pdf_listo` (re-emisión = nueva versión
 * en TX_DocumentosGenerados; la vigencia la administra el pipeline).
 */

import type { NextRequest } from 'next/server'
import { lecturaInformeContexto } from '@/lib/informe/ensamblador'
import { postToMake } from '@/lib/make-client'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

/** Estados desde los que se puede emitir el PDF. */
const ESTADOS_PERMITIDOS = ['calculada', 'pdf_listo']

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const lectura = await lecturaInformeContexto(id)
    if (!lectura.ok) return desdeGuard(lectura.guard)

    const { contexto } = lectura
    if (!ESTADOS_PERMITIDOS.includes(contexto.meta.estado)) {
      return error(MENSAJES.estadoNoPermite, 409)
    }

    const webhook = process.env.MAKE_WEBHOOK_E2
    if (!webhook) {
      return error(MENSAJES.errorGenerico, 503)
    }

    const res = await postToMake(
      webhook,
      {
        solicitud_id: id,
        solicitud_codigo: contexto.meta.codigo,
        contexto,
      },
      { escenario: 'E2_Carbone_Render', solicitudId: contexto.meta.codigo, timeoutMs: 15000 }
    )
    if (!res.ok) {
      return error(MENSAJES.errorGenerico, 502)
    }

    return ok({ id, enviado: true })
  } catch (err) {
    return desdeExcepcion('generar-pdf', err)
  }
}
