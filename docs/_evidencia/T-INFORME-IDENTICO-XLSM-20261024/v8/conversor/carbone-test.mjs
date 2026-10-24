#!/usr/bin/env node
/**
 * Sube una plantilla y la renderiza con la clave TEST de Carbone (marca de agua, sin costo).
 * Uso: node carbone-test.mjs <plantilla.docx> <payload.json> <salida.pdf>
 * Lee credenciales de .env.local del repo. No imprime secretos.
 */
import { readFileSync, writeFileSync } from 'node:fs'
const env = readFileSync('C:/Users/Sergio/Documents/GitHub/if-ejecutiva/.env.local', 'utf8')
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const API = get('CARBONE_API_URL') || 'https://api.carbone.io'
const TOKEN = get('CARBONE_API_TOKEN_TEST')
if (!TOKEN) { console.error('falta token TEST'); process.exit(3) }
const H = { Authorization: `Bearer ${TOKEN}`, 'carbone-version': '4' }
const [docx, payload, salida] = process.argv.slice(2)

const fd = new FormData()
fd.append('template', new Blob([readFileSync(docx)]), docx.split(/[\\/]/).pop())
const up = await fetch(`${API}/template`, { method: 'POST', headers: H, body: fd })
const ju = await up.json().catch(() => ({}))
console.log('POST /template →', up.status, ju.success, ju.error ?? '')
if (!up.ok || !ju.success) process.exit(4)
const id = ju.data.templateId
console.log('TEMPLATE_ID=' + id)
const data = JSON.parse(readFileSync(payload, 'utf8'))
const t0 = Date.now()
const r1 = await fetch(`${API}/render/${id}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ data, convertTo: 'pdf', lang: 'es-cl' }) })
const j1 = await r1.json().catch(() => ({}))
console.log('POST /render →', r1.status, j1.success, j1.error ?? '', `${Date.now() - t0} ms`)
if (!r1.ok || !j1.success) process.exit(5)
const r2 = await fetch(`${API}/render/${j1.data.renderId}`, { headers: H })
const buf = Buffer.from(await r2.arrayBuffer())
if (buf.subarray(0, 5).toString() !== '%PDF-') { console.error('no es PDF', buf.subarray(0, 300).toString()); process.exit(7) }
writeFileSync(salida, buf)
console.log(`OK ${salida} · ${buf.length} bytes`)
