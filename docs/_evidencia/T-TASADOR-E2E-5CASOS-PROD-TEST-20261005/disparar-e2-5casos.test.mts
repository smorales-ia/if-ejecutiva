/**
 * T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · Disparo de la cadena E2→E3 para los 5 casos sandbox.
 *
 * ⚠ PRERREQUISITO (paso manual de Sergio): E3 (scenario 5791413) debe estar ACTIVO con el fix de
 * idempotencia — `bash docs/_evidencia/T-PDF-E3-GENERICOS-20260930/fix-e3-apply.sh` o los pasos UI
 * de fix-e3-pasos-manuales.md. Con E3 caído, este disparo encola renders que expiran (no correr).
 *
 * Qué hace por caso: mismo payload que POST /api/tasaciones/[id]/generar-pdf (contexto + HMAC) →
 * E2 renderiza en Carbone (plantilla v5) → E3 sube a Dropbox, crea share-link, escribe
 * TX_DocumentosGenerados + pdf_final_url + estado=pdf_listo. Luego poll y verificación.
 *
 * Uso:
 *   set -a; source .env.local; set +a
 *   pnpm vitest run docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-TEST-20261005/disparar-e2-5casos.test.mts
 * Un caso que falle no aborta a los demás (tests independientes). NUNCA imprime secretos.
 */
import { writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { construirInformeContexto } from '@/lib/informe/ensamblador'
import { postToMake } from '@/lib/make-client'

const EV = 'docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-TEST-20261005'
const TBL_SOL = 'tblaHTyMHYfmy7Fg6'
const TBL_DOC = 'tbl5sYnGPZXgYCBSY'

const CASOS: Array<{ n: number; id: string; codigo: string }> = [
  { n: 1, id: 'reczuns8NHdI45Owp', codigo: 'VP-2026-0073' },
  { n: 2, id: 'recconVQfAc8LSGJf', codigo: 'VP-2026-0074' },
  { n: 3, id: 'recE1LwwH2xbcCHti', codigo: 'VP-2026-0075' },
  { n: 4, id: 'rectnGOaHvEioXZw3', codigo: 'VP-2026-0076' },
  { n: 5, id: 'recoZcwmgCBVKQMxF', codigo: 'VP-2026-0077' },
]

async function at(path: string): Promise<any> {
  const r = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  })
  return r.json()
}

for (const caso of CASOS) {
  it.skipIf(!process.env.MAKE_WEBHOOK_E2)(
    `caso ${caso.n} (${caso.codigo}): E2[v5] → Carbone → E3 → Dropbox + pdf_final_url`,
    async () => {
      const rec = await at(`${TBL_SOL}/${caso.id}`)
      if (rec.fields.pdf_final_url) {
        // idempotencia: ya tiene PDF vigente — no re-emitir (re-emisión = 409 share-link sin fix)
        // eslint-disable-next-line no-console
        console.log(`caso ${caso.n}: ya tiene pdf_final_url, se omite re-emisión`)
        return
      }
      const contexto = await construirInformeContexto(caso.id, rec.fields)
      expect(contexto.meta.codigo).toBe(caso.codigo)

      const res = await postToMake(
        process.env.MAKE_WEBHOOK_E2!,
        { solicitud_id: caso.id, solicitud_codigo: caso.codigo, contexto },
        { escenario: 'E2_Carbone_Render', solicitudId: caso.codigo, timeoutMs: 30000 }
      )
      // eslint-disable-next-line no-console
      console.log(`caso ${caso.n} E2 webhook status:`, res.status)
      expect(res.ok).toBe(true)

      let renderId: string | null = null
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 10_000))
        const docs = await at(
          `${TBL_DOC}?filterByFormula=${encodeURIComponent(`FIND("${caso.codigo}",ARRAYJOIN({solicitud}))`)}`
        )
        const nuevos = (docs.records ?? []).filter((d: any) => d.fields.render_id_carbone)
        if (nuevos.length) {
          renderId = String(nuevos[0].fields.render_id_carbone)
          // eslint-disable-next-line no-console
          console.log(`caso ${caso.n} DocGen nueva:`, nuevos[0].id, '· es_vigente:', nuevos[0].fields.es_vigente)
          break
        }
      }
      expect(renderId, `caso ${caso.n}: E3 no escribió la fila DocGen`).toBeTruthy()

      const sol = await at(`${TBL_SOL}/${caso.id}`)
      // eslint-disable-next-line no-console
      console.log(`caso ${caso.n} pdf_final_url:`, String(sol.fields.pdf_final_url).slice(0, 80), '· estado:', sol.fields.estado)
      expect(sol.fields.pdf_final_url).toBeTruthy()

      const pdf = await fetch(`${process.env.CARBONE_API_URL}/render/${renderId}`, {
        headers: { Authorization: `Bearer ${process.env.CARBONE_API_TOKEN_PROD}`, 'carbone-version': '4' },
      })
      if (pdf.status === 200) {
        const buf = Buffer.from(await pdf.arrayBuffer())
        expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
        writeFileSync(`${EV}/pdf-caso${caso.n}-PROD.pdf`, buf)
      }
    },
    360_000
  )
}
