/**
 * `GET /api/tasaciones/[id]/comparables` — grilla de la sección D.
 *
 * RF-12. Tanda P2-TAS · plan §3.1. **Reducida a sólo lectura en CI-056.**
 *
 * ## A-13 cerró: esta ruta ya no escribe
 *
 * Los comparables llegan por **extracción de la foto del cuadro**
 * `[Excel: Portada!B28:AX44]` y la sección D es de sólo lectura. El `POST` y el
 * `DELETE` que esta ruta exponía **se retiraron**: no tenían un solo consumidor
 * —ni cliente ni servidor— y dejarlos vivos habría mantenido abierta en el
 * borde HTTP justo la escritura que A-13 cierra en la UI. Que un botón no se
 * pinte no impide un `POST` con `curl`; que el handler no exista, sí.
 *
 * El pipeline de P6-TAS **no pasaba por acá**: escribe `TX_Comparables` desde
 * Make, contra Airtable directo. Retirarlos no le quita nada.
 *
 * Protocolo de resurrección, si una versión futura reintroduce la captura: el
 * que declaró **A-18**. Quedan en git, en el commit de esta tanda.
 *
 * ⚠ **A-45 abierta.** Con el `DELETE` retirado, IF-03 no tiene forma de purgar
 * comparables. Si el re-fotografiado debe *reemplazar* el conjunto en vez de
 * acumularlo, la purga se implementa en el escenario Make de extracción, no
 * acá. No se repone el handler mientras la pregunta esté sin responder.
 *
 * ## ⚠ El campo se llama `tipo_referencia`, no `fuente`
 *
 * El v0 llama `fuente` al discriminador Oferta/CBR. En `TX_Comparables` ese
 * dato vive en **`tipo_referencia`** (`fldB920e8jIKgbERM`, `Oferta · CBR`). El
 * campo `fuente` **también existe** (`fldNYh1KpD3oO0Gmz`) con un dominio ajeno
 * —`tasador · portal_toc · historico_sistema · cliente · Portal Inmobiliario ·
 * Yapo · Toctoc · Ofert. · CBR.`— que describe **de dónde salió el dato**, no
 * qué clase de referencia es.
 *
 * La traducción ya no vive acá: la hace `aComparable()` en
 * `lib/tasador/lectura-datos.ts`, que es el mismo mapeo que usa la hidratación
 * server-side de la pantalla. Tenerlo dos veces era tener dos verdades.
 *
 * ## Cambio de forma de la respuesta (D-5)
 *
 * Hasta CI-056 esta ruta devolvía los numéricos como `number | null` mientras
 * el tipo `Comparable` los declara `string`. La ruta no está tipada contra
 * `Comparable`, así que TS no veía la mentira. Ahora comparte el mapeo con la
 * hidratación y **devuelve `Comparable` de verdad**: todo `string`. El cambio
 * es seguro porque la ruta **no tiene consumidores** —la pantalla se hidrata
 * server-side, no por `fetch`—; se conserva como superficie HTTP de la sección,
 * que es lo que el plan pide.
 */

import type { NextRequest } from 'next/server'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { comparablesDeSolicitud } from '@/lib/tasador/lectura-datos'
import { desdeExcepcion, desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const codigo = String(guard.fields.codigo_solicitud ?? '')

  try {
    const comparables = await comparablesDeSolicitud(codigo)
    return ok({ id, comparables, total: comparables.length })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/comparables', err)
  }
}
