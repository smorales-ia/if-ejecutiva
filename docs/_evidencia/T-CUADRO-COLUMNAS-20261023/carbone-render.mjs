#!/usr/bin/env node
/**
 * Render directo contra Carbone (copia de render-carbone.mjs con elección de clave).
 * Uso:
 *   node carbone.mjs <test|prod> --upload <plantilla.docx>
 *   node carbone.mjs <test|prod> <templateId> <payload.json> <salida.pdf>
 * Lee credenciales de .env.local. NUNCA imprime secretos.
 */
import { readFileSync, writeFileSync } from 'node:fs'
const env = readFileSync('C:/Users/Sergio/Documents/GitHub/if-ejecutiva/.env.local', 'utf8')
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const API = get('CARBONE_API_URL') || 'https://api.carbone.io'
const a = process.argv.slice(2)
const modo = a.shift()
const TOKEN = get(modo === 'prod' ? 'CARBONE_API_TOKEN_PROD' : 'CARBONE_API_TOKEN_TEST')
if (!TOKEN) { console.error('falta token ' + modo); process.exit(3) }
const H = { Authorization: `Bearer ${TOKEN}`, 'carbone-version': '4' }

async function upload(docxPath) {
  const fd = new FormData()
  fd.append('template', new Blob([readFileSync(docxPath)]), docxPath.split(/[\\/]/).pop())
  const res = await fetch(`${API}/template`, { method: 'POST', headers: H, body: fd })
  const j = await res.json().catch(() => ({}))
  console.log('POST /template →', res.status, j.success, j.error ?? '')
  if (!res.ok || !j.success) process.exit(4)
  console.log('TEMPLATE_ID=' + j.data.templateId)
}

async function render(templateId, payloadPath, outPath) {
  const data = JSON.parse(readFileSync(payloadPath, 'utf8'))
  const body = JSON.stringify({ data, convertTo: 'pdf', lang: 'es-cl' })
  const r1 = await fetch(`${API}/render/${templateId}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body })
  const j1 = await r1.json().catch(() => ({}))
  console.log('POST /render →', r1.status, j1.success, j1.error ?? '')
  if (!r1.ok || !j1.success) process.exit(5)
  const r2 = await fetch(`${API}/render/${j1.data.renderId}`, { headers: H })
  const buf = Buffer.from(await r2.arrayBuffer())
  if (buf.subarray(0, 5).toString() !== '%PDF-') { console.error('no es PDF', buf.subarray(0, 200).toString()); process.exit(7) }
  writeFileSync(outPath, buf)
  console.log(`OK ${outPath} · ${buf.length} bytes`)
}

if (a[0] === '--upload') await upload(a[1])
else if (a.length === 3) await render(a[0], a[1], a[2])
else { console.error('uso'); process.exit(1) }
