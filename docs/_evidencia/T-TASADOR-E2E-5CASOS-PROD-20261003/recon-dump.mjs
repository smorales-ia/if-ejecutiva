#!/usr/bin/env node
/**
 * Recon read-only · T-TASADOR-E2E-5CASOS-PROD-20261003 Fase 2 BLOQUE 0.
 * Vuelca VP-0067 completo (plantilla a replicar) + estado actual de los 5 casos.
 * NO escribe en Airtable. NUNCA imprime secretos.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dir, '..', '..', '..')
const env = readFileSync(join(REPO, '.env.local'), 'utf8')
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const TOKEN = get('AIRTABLE_TOKEN')
const BASE = get('AIRTABLE_BASE_ID')
if (!TOKEN || !BASE) { console.error('faltan credenciales Airtable'); process.exit(3) }
const H = { Authorization: `Bearer ${TOKEN}` }

const T = {
  solicitudes: 'tblaHTyMHYfmy7Fg6',
  datosTasacion: 'tblMoK3mFuwN8Yr1A',
  comparables: 'tbllbTuhb0waWIbRo',
  itemsCuadroValoracion: 'tblCxnMtOETK2ulD0',
  unidades: 'tbl2QDLvJDyy3Rg2I',
  ampliaciones: 'tblpAtUq4p6o1vofo',
  habitacionesPorNivel: 'tblBITpPb8WuqsatM',
  terminacionesPorRecinto: 'tbleQ7pcLxYx9NbCi',
  documentosLegales: 'tbl7qIg5x4Y0tOiLk',
  adjuntos: 'tblur71x1oItbmKZc',
  calculos: 'tblFz37KSvn5pLKDR',
  preciosUf: 'tblWPRuIYfzdlveHM',
  documentosGenerados: 'tbl5sYnGPZXgYCBSY',
}

async function at(path) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${path}`, { headers: H })
  const j = await r.json()
  if (!r.ok) { console.error('AT err', r.status, path, JSON.stringify(j).slice(0, 200)); return { records: [] } }
  return j
}
async function listAll(tbl, formula) {
  const out = []
  let offset
  do {
    const qs = new URLSearchParams({ pageSize: '100' })
    if (formula) qs.set('filterByFormula', formula)
    if (offset) qs.set('offset', offset)
    const j = await at(`${tbl}?${qs}`)
    out.push(...(j.records ?? []))
    offset = j.offset
  } while (offset)
  return out
}
// trunca strings largos (base64) para no saturar
function clean(fields) {
  const o = {}
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string' && v.length > 160) o[k] = `«str len=${v.length}: ${v.slice(0, 60)}…»`
    else o[k] = v
  }
  return o
}

const CODIGO = 'VP-2026-0067'
const ID = 'recmMzeu3eWGxyXsf'

const report = { generado: 'recon BLOQUE 0', vp0067: {}, casos5: {}, render: {} }

// --- VP-0067 solicitud ---
const sol = await at(`${T.solicitudes}/${ID}`)
report.vp0067.solicitud = clean(sol.fields ?? {})

// --- hijos por codigo ---
for (const [name, tbl] of Object.entries(T)) {
  if (['solicitudes', 'preciosUf', 'documentosGenerados'].includes(name)) continue
  const formula = name === 'calculos'
    ? `{solicitud_codigo}="${CODIGO}"`
    : `{solicitud}="${CODIGO}"`
  const rows = await listAll(tbl, formula)
  report.vp0067[name] = {
    count: rows.length,
    sample: rows.slice(0, 3).map((r) => ({ id: r.id, fields: clean(r.fields) })),
    // para adjuntos: resumen por tipo/subido_por
    ...(name === 'adjuntos' ? {
      porSubidoPor: rows.reduce((a, r) => { const k = r.fields.subido_por ?? '?'; a[k] = (a[k] || 0) + 1; return a }, {}),
      tipos: rows.reduce((a, r) => { const k = r.fields.tipo_adjunto ?? '?'; a[k] = (a[k] || 0) + 1; return a }, {}),
    } : {}),
    ...(name === 'calculos' ? {
      terminales: rows.map((r) => ({ v: r.fields.variable_output, res: r.fields.resultado })),
    } : {}),
  }
}

// --- H_PreciosUF de la fecha de visita de VP-0067 ---
const fv = String(sol.fields?.fecha_visita ?? '').slice(0, 10)
if (fv) {
  const uf = await listAll(T.preciosUf, `DATETIME_FORMAT({fecha},'YYYY-MM-DD')="${fv}"`)
  report.vp0067.preciosUf = { fecha: fv, count: uf.length, sample: uf.slice(0, 2).map((r) => ({ id: r.id, fields: clean(r.fields) })) }
}

// --- DocumentosGenerados VP-0067 ---
const dg = await listAll(T.documentosGenerados, `FIND("${CODIGO}",ARRAYJOIN({solicitud}))`)
report.vp0067.documentosGenerados = { count: dg.length, sample: dg.slice(0, 3).map((r) => ({ id: r.id, fields: clean(r.fields) })) }

// --- Estado actual de los 5 casos (por nombre propietario y dirección) ---
const buscas = [
  { caso: 1, q: 'Alejandro', campo: 'cliente_final_nombre' },
  { caso: 2, q: 'Janeth', campo: 'cliente_final_nombre' },
  { caso: 2, q: 'Andrés', campo: 'cliente_final_nombre' },
  { caso: 3, q: 'Miguenson', campo: 'cliente_final_nombre' },
  { caso: 3, q: 'Víctor', campo: 'cliente_final_nombre' },
  { caso: 4, q: 'Patricio', campo: 'cliente_final_nombre' },
  { caso: 4, q: 'Irma', campo: 'cliente_final_nombre' },
  { caso: 5, q: 'Carlos Andrés', campo: 'cliente_final_nombre' },
  { caso: 5, q: 'Exequiel', campo: 'direccion' },
]
report.casos5.hits = []
for (const b of buscas) {
  const rows = await listAll(T.solicitudes, `FIND("${b.q}",{${b.campo}})`)
  for (const r of rows) {
    report.casos5.hits.push({
      caso: b.caso, matchQ: b.q, id: r.id,
      codigo: r.fields.codigo_solicitud, estado: r.fields.estado,
      propietario: r.fields.cliente_final_nombre, direccion: r.fields.direccion,
      pdf_final_url: r.fields.pdf_final_url ? '«SET»' : null,
      tasador: r.fields.tasador, cliente: r.fields.cliente,
    })
  }
}

// --- M_Clientes y M_Comunas presencia (los 5 clientes, 4 comunas) ---
const clientes = await listAll('tblpK7AcYBMH93apK')
report.casos5.clientes = clientes.map((r) => ({ id: r.id, nombre: r.fields.nombre }))
const comunas = await listAll('tblyggAfQfq682XHK')
report.casos5.comunas = comunas.filter((r) => ['San Miguel', 'Estación Central', 'Quilicura', 'La Florida'].includes(r.fields.nombre)).map((r) => ({ id: r.id, nombre: r.fields.nombre }))

// --- Tasadores con clerk_user_id ---
const tasadores = await listAll('tblEi5jp18c1j00bQ')
report.casos5.tasadores = tasadores.filter((r) => r.fields.clerk_user_id).map((r) => ({ id: r.id, nombre: r.fields.nombre, clerk: '«SET»', firma: r.fields.firma_url ? '«SET»' : null }))

writeFileSync(join(__dir, 'recon-dump.json'), JSON.stringify(report, null, 2))
console.log('OK recon-dump.json escrito')
console.log('VP-0067 estado:', report.vp0067.solicitud.estado, '· pdf:', report.vp0067.solicitud.pdf_final_url ? 'SET' : 'null')
console.log('VP-0067 hijos:', Object.fromEntries(Object.entries(report.vp0067).filter(([k, v]) => v && typeof v === 'object' && 'count' in v).map(([k, v]) => [k, v.count])))
console.log('Casos5 hits:', report.casos5.hits.length)
for (const h of report.casos5.hits) console.log(`  caso${h.caso} ${h.codigo} ${h.estado} · ${h.propietario} · ${h.direccion}`)
console.log('Clientes M_:', report.casos5.clientes.map(c => c.nombre).join(' | '))
console.log('Comunas M_:', report.casos5.comunas.map(c => c.nombre).join(' | '))
console.log('Tasadores c/clerk:', report.casos5.tasadores.map(t => t.nombre).join(' | '))
