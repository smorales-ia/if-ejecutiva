/**
 * Corrida REAL punta a punta — T-PDF-IDENTICO-20260927 · Bloque 2.
 *
 * Replica exactamente lo que hace `POST /api/tasaciones/[id]/generar-pdf`
 * (mismo ensamblador, mismo payload `{solicitud_id, solicitud_codigo,
 * contexto}`, misma firma HMAC vía `postToMake`) y entrega el contexto al
 * webhook de E2_Carbone_Render, que debe estar ACTIVO. Luego espera a que E3
 * escriba `pdf_final_url` + la fila nueva de TX_DocumentosGenerados, y baja
 * el binario del render desde Carbone (GET /render/{renderId}) como
 * `PDF_generado_VP0067_v2.pdf`.
 *
 * Uso (oneshot):
 *   set -a; source .env.local; set +a
 *   pnpm vitest run docs/_evidencia/T-PDF-IDENTICO-20260927/corrida-real.test.mts
 *
 * NUNCA imprime tokens.
 */
import { writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'

import { construirInformeContexto } from '@/lib/informe/ensamblador'
import { postToMake } from '@/lib/make-client'

const ID = 'recmMzeu3eWGxyXsf'
const CODIGO = 'VP-2026-0067'
const EVIDENCIA = 'docs/_evidencia/T-PDF-IDENTICO-20260927'
const TBL_SOLICITUDES = 'tblaHTyMHYfmy7Fg6'
const TBL_DOCGEN = 'tbl5sYnGPZXgYCBSY'
/** render_id de la corrida v1 (27-sep) — la fila nueva debe traer otro. */
const RENDER_ID_VIEJO_PREFIJO = 'MTAuMjAuMjEuNDMg'

async function airtable(path: string): Promise<any> {
  const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  })
  return res.json()
}

it.skipIf(!process.env.AIRTABLE_TOKEN || !process.env.MAKE_WEBHOOK_E2)(
  'corrida real: E2 → Carbone → E3 → Dropbox + Airtable',
  async () => {
    // 1. Contexto real — misma ruta de código que el route.
    const rec = await airtable(`${TBL_SOLICITUDES}/${ID}`)
    const contexto = await construirInformeContexto(ID, rec.fields)
    expect(contexto.meta.codigo).toBe(CODIGO)

    // 2. POST al webhook E2 (payload y firma idénticos al route).
    const res = await postToMake(
      process.env.MAKE_WEBHOOK_E2!,
      { solicitud_id: ID, solicitud_codigo: CODIGO, contexto },
      { escenario: 'E2_Carbone_Render', solicitudId: CODIGO, timeoutMs: 30000 }
    )
    // eslint-disable-next-line no-console
    console.log('E2 webhook status:', res.status)
    expect(res.ok).toBe(true)

    // 3. Poll: fila nueva en TX_DocumentosGenerados con render_id distinto.
    let renderId: string | null = null
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 10_000))
      const docs = await airtable(
        `${TBL_DOCGEN}?filterByFormula=${encodeURIComponent(`FIND("${CODIGO}",ARRAYJOIN({solicitud}))`)}`
      )
      const nuevos = (docs.records ?? []).filter(
        (d: any) =>
          d.fields.render_id_carbone &&
          !String(d.fields.render_id_carbone).startsWith(RENDER_ID_VIEJO_PREFIJO)
      )
      if (nuevos.length > 0) {
        renderId = String(nuevos[0].fields.render_id_carbone)
        // eslint-disable-next-line no-console
        console.log('DocGen nueva:', nuevos[0].id, '· es_vigente:', nuevos[0].fields.es_vigente)
        break
      }
      // eslint-disable-next-line no-console
      console.log(`poll ${i + 1}/30: sin fila nueva aún`)
    }
    expect(renderId, 'E3 no escribió la fila nueva en TX_DocumentosGenerados').toBeTruthy()

    // 4. Verificar pdf_final_url en la solicitud.
    const solicitud = await airtable(`${TBL_SOLICITUDES}/${ID}`)
    // eslint-disable-next-line no-console
    console.log('pdf_final_url:', solicitud.fields.pdf_final_url, '· estado:', solicitud.fields.estado)

    // 5. Bajar el binario del render desde Carbone (mismo renderId que usó E3).
    const pdf = await fetch(`${process.env.CARBONE_API_URL}/render/${renderId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONE_API_TOKEN_PROD}`,
        'carbone-version': '4',
      },
    })
    // eslint-disable-next-line no-console
    console.log('Carbone GET render:', pdf.status)
    expect(pdf.status).toBe(200)
    const buf = Buffer.from(await pdf.arrayBuffer())
    expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
    writeFileSync(`${EVIDENCIA}/PDF_generado_VP0067_v2.pdf`, buf)
    // eslint-disable-next-line no-console
    console.log('PDF v2 guardado:', buf.length, 'bytes')
  },
  360_000
)
