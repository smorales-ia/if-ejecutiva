#!/usr/bin/env node
/** Rollback ejecutor · borra TODOS los records creados por seed-caso1 (según
 * rollback-caso1.json). Revierte la Fase 2 del Caso 1. NUNCA imprime secretos.
 * H_PreciosUF: sólo borra si el seed lo CREÓ (accion=creado); si preexistía, no toca. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const __dir = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(join(__dir, '..', '..', '..', '.env.local'), 'utf8')
const g = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const BASE = g('AIRTABLE_BASE_ID'), H = { Authorization: `Bearer ${g('AIRTABLE_TOKEN')}` }
const rb = JSON.parse(readFileSync(join(__dir, 'rollback-caso1.json'), 'utf8'))
const T = { solicitud: 'tblaHTyMHYfmy7Fg6', datosTasacion: 'tblMoK3mFuwN8Yr1A', comparables: 'tbllbTuhb0waWIbRo', items: 'tblCxnMtOETK2ulD0', habitaciones: 'tblBITpPb8WuqsatM', docLegales: 'tbl7qIg5x4Y0tOiLk', adjuntos: 'tblur71x1oItbmKZc', calculos: 'tblFz37KSvn5pLKDR', preciosUf: 'tblWPRuIYfzdlveHM' }
async function rfetch(url, opts, tries = 5) {
  for (let a = 1; ; a++) {
    try { return await fetch(url, opts) }
    catch (e) { if (a >= tries) throw e; await new Promise((r) => setTimeout(r, 1000 * a)) }
  }
}
async function del(tbl, ids) {
  for (let i = 0; i < ids.length; i += 10) {
    const q = ids.slice(i, i + 10).map((x) => `records[]=${x}`).join('&')
    const r = await rfetch(`https://api.airtable.com/v0/${BASE}/${tbl}?${q}`, { method: 'DELETE', headers: H })
    console.log('DEL', tbl, r.status, ids.slice(i, i + 10).length)
  }
}
for (const [k, ids] of Object.entries(rb.created || {})) {
  if (k === 'solicitud') continue  // la solicitud al final
  if (ids?.length) await del(T[k], ids)
}
if (rb.preciosUf?.accion === 'creado') await del(T.preciosUf, [rb.preciosUf.id])
else console.log('H_PreciosUF preexistente — no se toca')
if (rb.created?.solicitud?.length) await del(T.solicitud, rb.created.solicitud)
console.log('ROLLBACK caso1 completo')
