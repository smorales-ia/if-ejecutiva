#!/usr/bin/env node
/**
 * Re-apunte de E2 (scenario 5750023) al template Carbone v5 — T-GOLIVE-V5-PROD-20261001.
 * Cambia ÚNICAMENTE el templateId en la URL del módulo de render; preserva todo lo demás.
 *
 * Uso:
 *   node golive-e2-repoint.mjs --dry-run   # muestra el cambio, NO escribe
 *   node golive-e2-repoint.mjs --apply     # hace el PATCH real en Make
 *
 * Lee credenciales de .env.local. NUNCA imprime secretos ni el blueprint crudo.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dir, '..', '..', '..')
const env = readFileSync(join(REPO, '.env.local'), 'utf8')
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const BASE = get('MAKE_BASE_URL')            // ya incluye /api/v2
const TOKEN = get('MAKE_API_TOKEN')
const V5 = readFileSync(join(__dir, '..', 'T-PLANTILLA-WORD-XLSM-20261001', 'v5-templateid.txt'), 'utf8').trim()
const SCEN = '5750023'
const OLD = '31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32'
const H = { Authorization: `Token ${TOKEN}`, 'Content-Type': 'application/json' }

const mode = process.argv[2]
if (!['--dry-run', '--apply'].includes(mode)) { console.error('uso: --dry-run | --apply'); process.exit(1) }

const r = await fetch(`${BASE}/scenarios/${SCEN}/blueprint`, { headers: { Authorization: `Token ${TOKEN}` } })
if (!r.ok) { console.error('GET blueprint →', r.status); process.exit(2) }
const data = await r.json()
const bp = data.response?.blueprint ?? data.blueprint ?? data
let s = JSON.stringify(bp)
const occ = (s.match(new RegExp(OLD, 'g')) || []).length
console.log(`templateId viejo aparece ${occ} vez(ces) en el blueprint`)
if (occ !== 1) { console.error('ABORTA: se esperaba exactamente 1 ocurrencia'); process.exit(3) }
if (s.includes(V5)) { console.log('YA está en v5; nada que hacer'); process.exit(0) }
s = s.replace(OLD, V5)
const newBp = JSON.parse(s)
console.log(`cambio: render/${OLD.slice(0,12)}… → render/${V5.slice(0,12)}…`)
if (mode === '--dry-run') { console.log('DRY-RUN: sin escribir'); process.exit(0) }

const p = await fetch(`${BASE}/scenarios/${SCEN}`, {
  method: 'PATCH', headers: H, body: JSON.stringify({ blueprint: JSON.stringify(newBp) }),
})
const body = await p.text()
console.log('PATCH /scenarios/5750023 →', p.status)
if (!p.ok) { console.error('FALLO PATCH body:', body.slice(0, 300)); process.exit(4) }
console.log('RE-APUNTE OK a v5')
