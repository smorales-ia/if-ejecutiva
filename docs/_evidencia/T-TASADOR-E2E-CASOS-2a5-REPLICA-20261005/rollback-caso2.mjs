#!/usr/bin/env node
/**
 * Rollback del CASO 2 (AGH-1548) · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005.
 * Borra TODO lo creado por seed-caso2.mjs (leyendo rollback-caso2.json) más las
 * filas de TX_Calculos y A_Eventos que el motor escribió para el código sandbox.
 * H_PreciosUF solo se borra si lo creó esta tanda (accion='creado').
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dir, '..', '..', '..')
const env = readFileSync(join(REPO, '.env.local'), 'utf8')
const g = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const TOKEN = g('AIRTABLE_TOKEN'), BASE = g('AIRTABLE_BASE_ID')
const H = { Authorization: `Bearer ${TOKEN}` }
const RB = JSON.parse(readFileSync(join(__dir, 'rollback-caso2.json'), 'utf8'))

const T = {
  solicitud: 'tblaHTyMHYfmy7Fg6', datosTasacion: 'tblMoK3mFuwN8Yr1A',
  comparables: 'tbllbTuhb0waWIbRo', items: 'tblCxnMtOETK2ulD0',
  habitaciones: 'tblBITpPb8WuqsatM', docLegales: 'tbl7qIg5x4Y0tOiLk',
  adjuntos: 'tblur71x1oItbmKZc', calculos: 'tblFz37KSvn5pLKDR',
  preciosUf: 'tblWPRuIYfzdlveHM',
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function del(tbl, ids) {
  for (let i = 0; i < ids.length; i += 10) {
    const q = ids.slice(i, i + 10).map((x) => `records[]=${x}`).join('&')
    const r = await fetch(`https://api.airtable.com/v0/${BASE}/${tbl}?${q}`, { method: 'DELETE', headers: H })
    if (!r.ok) console.error('DELETE', tbl, r.status, (await r.text()).slice(0, 200))
    await sleep(250)
  }
}
async function main() {
  // TX_Calculos del motor (por solicitud_codigo): requiere el codigo del seed-result
  let codigo = null
  try { codigo = JSON.parse(readFileSync(join(__dir, 'seed-result-caso2.json'), 'utf8')).codigo } catch {}
  if (codigo) {
    const q = new URLSearchParams({ filterByFormula: `{solicitud_codigo}="${codigo}"`, pageSize: '100' })
    const j = await (await fetch(`https://api.airtable.com/v0/${BASE}/${T.calculos}?${q}`, { headers: H })).json()
    const ids = (j.records || []).map((r) => r.id)
    console.log('TX_Calculos (motor) a borrar:', ids.length)
    await del(T.calculos, ids)
  }
  const mapa = {
    datosTasacion: T.datosTasacion, items: T.items, comparables: T.comparables,
    habitaciones: T.habitaciones, docLegales: T.docLegales, adjuntos: T.adjuntos,
    solicitud: T.solicitud,
  }
  for (const [key, tbl] of Object.entries(mapa)) {
    const ids = RB.created?.[key] || []
    if (ids.length) { console.log(`borrando ${key}: ${ids.length}`); await del(tbl, ids) }
  }
  if (RB.preciosUf?.accion === 'creado') {
    console.log('borrando H_PreciosUF creado por la tanda:', RB.preciosUf.id)
    await del(T.preciosUf, [RB.preciosUf.id])
  } else console.log('H_PreciosUF: preexistente o no tocado — se conserva')
  console.log('ROLLBACK CASO2 completo.')
}
main().catch((e) => { console.error('FALLO ROLLBACK:', e.message); process.exit(1) })
