#!/usr/bin/env node
/**
 * Render directo contra Carbone — T-PLANTILLA-DISENO-FINO-20261001.
 * Valida la plantilla SIN tocar Make/E2 (el veto al clasificador sobre E2/E3
 * sigue vigente; esto sólo usa la API de Carbone, igual que la tanda
 * T-PDF-IDENTICO hizo con render-local-contexto-real.pdf).
 *
 * Uso:
 *   node render-carbone.mjs <templateId> <payload.json> <salida.pdf>
 *   node render-carbone.mjs --upload <plantilla.docx>   # sube y devuelve templateId
 *
 * Lee credenciales de .env.local. NUNCA imprime secretos.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dir, '..', '..', '..')
const env = readFileSync(join(REPO, '.env.local'), 'utf8')
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const API = get('CARBONE_API_URL') || 'https://api.carbone.io'
const TOKEN = get('CARBONE_API_TOKEN_PROD')
if (!TOKEN) { console.error('FALTA CARBONE_API_TOKEN_PROD'); process.exit(3) }
const H = { Authorization: `Bearer ${TOKEN}`, 'carbone-version': '4' }

async function upload(docxPath) {
  const buf = readFileSync(docxPath)
  const fd = new FormData()
  fd.append('template', new Blob([buf]), docxPath.split('/').pop())
  const res = await fetch(`${API}/template`, { method: 'POST', headers: H, body: fd })
  const j = await res.json().catch(() => ({}))
  console.log('POST /template →', res.status, JSON.stringify(j).slice(0, 200))
  if (!res.ok || !j.success) process.exit(4)
  console.log('TEMPLATE_ID=' + j.data.templateId)
}

async function render(templateId, payloadPath, outPath) {
  const data = JSON.parse(readFileSync(payloadPath, 'utf8'))
  const body = JSON.stringify({ data, convertTo: 'pdf', lang: 'es-cl' })
  const r1 = await fetch(`${API}/render/${templateId}`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body,
  })
  const j1 = await r1.json().catch(() => ({}))
  console.log('POST /render →', r1.status, JSON.stringify(j1).slice(0, 200))
  if (!r1.ok || !j1.success) process.exit(5)
  const renderId = j1.data.renderId
  const r2 = await fetch(`${API}/render/${renderId}`, { headers: H })
  console.log('GET /render/{id} →', r2.status)
  if (r2.status !== 200) process.exit(6)
  const buf = Buffer.from(await r2.arrayBuffer())
  if (buf.subarray(0, 5).toString() !== '%PDF-') { console.error('no es PDF'); process.exit(7) }
  writeFileSync(outPath, buf)
  console.log(`OK ${outPath} · ${buf.length} bytes`)
}

const a = process.argv.slice(2)
if (a[0] === '--upload') await upload(a[1])
else if (a.length === 3) await render(a[0], a[1], a[2])
else { console.error('uso: node render-carbone.mjs <templateId> <payload> <out.pdf> | --upload <docx>'); process.exit(1) }
