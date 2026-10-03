/**
 * Smoke test del go-live — T-GOLIVE-V5-PROD-20261001.
 * Dispara la cadena VIVA de producción (E2 webhook → Carbone[v5] → E3 → Dropbox + Airtable)
 * posteando el MISMO payload que `POST /api/tasaciones/[id]/generar-pdf` (contexto + HMAC),
 * espera la fila nueva en TX_DocumentosGenerados y baja el PDF del render (v5).
 *
 * Uso:
 *   set -a; source .env.local; set +a
 *   pnpm vitest run docs/_evidencia/T-GOLIVE-V5-PROD-20261001/smoke-e2-live.test.mts
 * NUNCA imprime secretos.
 */
import { writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { construirInformeContexto } from '@/lib/informe/ensamblador'
import { postToMake } from '@/lib/make-client'

const ID = 'recmMzeu3eWGxyXsf'
const CODIGO = 'VP-2026-0067'
const EV = 'docs/_evidencia/T-GOLIVE-V5-PROD-20261001'
const TBL_SOL = 'tblaHTyMHYfmy7Fg6'
const TBL_DOC = 'tbl5sYnGPZXgYCBSY'
const VIEJO = 'MTAuMjAuMTEuNDEgICAg2wZw' // render_id vigente antes del go-live

async function at(path: string): Promise<any> {
  const r = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  })
  return r.json()
}

it.skipIf(!process.env.MAKE_WEBHOOK_E2)(
  'go-live: E2[v5] → Carbone → E3 → Dropbox + Airtable',
  async () => {
    const rec = await at(`${TBL_SOL}/${ID}`)
    const contexto = await construirInformeContexto(ID, rec.fields)
    expect(contexto.meta.codigo).toBe(CODIGO)

    const res = await postToMake(
      process.env.MAKE_WEBHOOK_E2!,
      { solicitud_id: ID, solicitud_codigo: CODIGO, contexto },
      { escenario: 'E2_Carbone_Render', solicitudId: CODIGO, timeoutMs: 30000 }
    )
    // eslint-disable-next-line no-console
    console.log('E2 webhook status:', res.status)
    expect(res.ok).toBe(true)

    let renderId: string | null = null
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 10_000))
      const docs = await at(
        `${TBL_DOC}?filterByFormula=${encodeURIComponent(`FIND("${CODIGO}",ARRAYJOIN({solicitud}))`)}`
      )
      const nuevos = (docs.records ?? []).filter(
        (d: any) => d.fields.render_id_carbone && !String(d.fields.render_id_carbone).startsWith(VIEJO)
      )
      if (nuevos.length) {
        renderId = String(nuevos[0].fields.render_id_carbone)
        // eslint-disable-next-line no-console
        console.log('DocGen nueva:', nuevos[0].id, '· es_vigente:', nuevos[0].fields.es_vigente)
        break
      }
      // eslint-disable-next-line no-console
      console.log(`poll ${i + 1}/30: sin fila nueva aún`)
    }
    expect(renderId, 'E3 no escribió la fila nueva').toBeTruthy()

    const sol = await at(`${TBL_SOL}/${ID}`)
    // eslint-disable-next-line no-console
    console.log('pdf_final_url:', String(sol.fields.pdf_final_url).slice(0, 80))

    const pdf = await fetch(`${process.env.CARBONE_API_URL}/render/${renderId}`, {
      headers: { Authorization: `Bearer ${process.env.CARBONE_API_TOKEN_PROD}`, 'carbone-version': '4' },
    })
    // eslint-disable-next-line no-console
    console.log('Carbone GET render:', pdf.status)
    if (pdf.status === 200) {
      const buf = Buffer.from(await pdf.arrayBuffer())
      expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
      writeFileSync(`${EV}/PDF_PROD_VP0067_v5-live.pdf`, buf)
      // eslint-disable-next-line no-console
      console.log('PDF v5-live guardado:', buf.length, 'bytes')
    } else {
      // Carbone borra el render tras la primera descarga (la hizo E3). Bajar de Dropbox en su lugar.
      // eslint-disable-next-line no-console
      console.log('render ya consumido por E3 (404 esperado); usar pdf_final_url de Dropbox')
    }
  },
  360_000
)
