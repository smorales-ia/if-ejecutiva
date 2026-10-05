/**
 * Render DIRECTO contra Carbone v5 del contexto real del Caso 1 (sin tocar
 * E2/E3). Prueba que el informe es espejo del oráculo aunque E3 (persistencia
 * a Dropbox + pdf_final_url) esté inactivo. Baja el PDF a caso1-PROD.pdf.
 * Patrón de docs/_evidencia/T-PLANTILLA-DISENO-FINO/render-carbone.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { construirInformeContexto } from '@/lib/informe/ensamblador'

const EV = 'docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003'
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const _fetch = globalThis.fetch
globalThis.fetch = (async (u: any, o: any) => { let e; for (let a = 1; a <= 6; a++) { try { return await _fetch(u, o) } catch (x) { e = x; await new Promise((r) => setTimeout(r, 800 * a)) } } throw e }) as typeof fetch

const R = JSON.parse(readFileSync(`${EV}/seed-result.json`, 'utf8'))

it('CASO 1 · render directo Carbone v5 → PDF', async () => {
  const rec = await (await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/tblaHTyMHYfmy7Fg6/${R.id}`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } })).json()
  const ctx = await construirInformeContexto(R.id, rec.fields)

  const API = process.env.CARBONE_API_URL || 'https://api.carbone.io'
  const TID = process.env.CARBONE_TEMPLATE_ID
  const H = { Authorization: `Bearer ${process.env.CARBONE_API_TOKEN_PROD}`, 'carbone-version': '4' }
  const r1 = await fetch(`${API}/render/${TID}`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: ctx, convertTo: 'pdf', lang: 'es-cl' }),
  })
  const j1 = await r1.json().catch(() => ({}))
  // eslint-disable-next-line no-console
  console.log('Carbone POST /render:', r1.status, JSON.stringify(j1).slice(0, 120))
  expect(r1.ok && j1.success).toBeTruthy()
  const renderId = j1.data.renderId
  const r2 = await fetch(`${API}/render/${renderId}`, { headers: H })
  // eslint-disable-next-line no-console
  console.log('Carbone GET /render:', r2.status)
  expect(r2.status).toBe(200)
  const buf = Buffer.from(await r2.arrayBuffer())
  expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
  writeFileSync(`${EV}/caso1-PROD.pdf`, buf)
  // eslint-disable-next-line no-console
  console.log('PDF OK', `${EV}/caso1-PROD.pdf`, buf.length, 'bytes · templateId', String(TID).slice(0, 10))
}, 180_000)
