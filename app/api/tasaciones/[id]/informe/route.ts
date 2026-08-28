/**
 * `GET /api/tasaciones/[id]/informe` — los 8 bloques del preview del informe
 * más la versión vigente (RF-TAS-20 · RN-56).
 *
 * Tanda P2-TAS.A · plan §3.1 y §10.1. **Reescrito en P9-TAS (CI-063).**
 *
 * ## El productor vive en `lib/tasador/lectura-informe.ts`
 *
 * Hasta P9-TAS este route armaba los 8 bloques inline. Se **extrajo** a
 * `lib/tasador/lectura-informe.ts` para que `app/tasaciones/[id]/informe/page.tsx`
 * hidrate el preview con la **misma** aritmética —cerrando **CI-063**— sin
 * duplicarla ni hacer un self-fetch HTTP. Este route ahora sólo **delega** y
 * mantiene su contrato de respuesta **idéntico**: mismas 5 claves
 * `{ id, codigo, estado, versionVigente, bloques }`. `valorDestacado`, que el lib
 * también expone, **no** viaja en la respuesta para no cambiar el contrato.
 *
 * ## Sigue siendo GET puro. No hay PATCH y no debe haberlo
 *
 * El informe lo produce **AT03** (motor determinista) y el PDF lo deposita el
 * pipeline **Carbone** (E1/E2/E3). `TX_DocumentosGenerados` la escribe ese
 * pipeline, **nunca IF-03**. Si alguien necesita editar un dato del preview, el
 * lugar es `PATCH /datos` y después recalcular — no un PATCH acá.
 *
 * Las degradaciones declaradas (versión vigente `null` · CI-024, códigos SII
 * vacíos · CI-025) y las tres decisiones de presentación (valor destacado que
 * prefiere el override y nunca cae a cero, conteo fotográfico por
 * `descripcion || tipo_adjunto`, promedio homogeneizado server-side) están
 * documentadas en el docblock de `lib/tasador/lectura-informe.ts`.
 */

import type { NextRequest } from 'next/server'
import { lecturaInforme } from '@/lib/tasador/lectura-informe'
import { desdeExcepcion, desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await lecturaInforme(id)
    if (!res.ok) return desdeGuard(res.guard)

    const { informe } = res
    // Contrato idéntico al de P2-TAS.A: `valorDestacado` no se expone acá.
    return ok({
      id: informe.id,
      codigo: informe.codigo,
      estado: informe.estado,
      versionVigente: informe.versionVigente,
      bloques: informe.bloques,
    })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/informe', err)
  }
}
