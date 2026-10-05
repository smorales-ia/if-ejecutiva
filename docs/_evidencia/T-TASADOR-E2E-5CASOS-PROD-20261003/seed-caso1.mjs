#!/usr/bin/env node
/**
 * Seed sandbox-replica (D1) del CASO 1 (METLIFE-6280) · T-TASADOR-E2E-5CASOS.
 * Crea TX_Solicitudes + hijos con los valores del oráculo (XLSM∩PDF), SIN correr
 * AT03. Idempotente (aborta si ya existe el record del caso). Registra rollback
 * (IDs creados) en rollback-caso1.json. NUNCA imprime secretos.
 *
 * Fases: 1) crea solicitud (estado=creada) → lee codigo auto-generado.
 *        2) crea hijos (datos/items/comparables/habitaciones/legales/calculos/
 *           preciosUf/adjuntos) ligados por codigo. 3) PATCH estado→calculada.
 *        4) verifica calculos (anti-AT03). Escribe seed-result.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dir, '..', '..', '..')
const env = readFileSync(join(REPO, '.env.local'), 'utf8')
const g = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const TOKEN = g('AIRTABLE_TOKEN'), BASE = g('AIRTABLE_BASE_ID')
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
const O = JSON.parse(readFileSync(join(__dir, 'caso1-oraculo.json'), 'utf8'))
const F = JSON.parse(readFileSync(join(__dir, 'caso1-fotos.json'), 'utf8'))

const T = {
  solicitudes: 'tblaHTyMHYfmy7Fg6', datosTasacion: 'tblMoK3mFuwN8Yr1A',
  comparables: 'tbllbTuhb0waWIbRo', items: 'tblCxnMtOETK2ulD0',
  habitaciones: 'tblBITpPb8WuqsatM', docLegales: 'tbl7qIg5x4Y0tOiLk',
  adjuntos: 'tblur71x1oItbmKZc', calculos: 'tblFz37KSvn5pLKDR',
  preciosUf: 'tblWPRuIYfzdlveHM',
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rollback = { created: {}, preciosUf: null, nota: 'IDs creados por seed-caso1 — borrar para revertir' }

async function rfetch(url, opts, tries = 5) {
  for (let a = 1; ; a++) {
    try { return await fetch(url, opts) }
    catch (e) { if (a >= tries) throw e; await sleep(1000 * a) }
  }
}
async function at(method, path, body) {
  const r = await rfetch(`https://api.airtable.com/v0/${BASE}/${path}`, {
    method, headers: H, body: body ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) { console.error('AT', method, r.status, path, JSON.stringify(j).slice(0, 300)); throw new Error(`AT ${r.status}`) }
  return j
}
async function listAll(tbl, formula) {
  const out = []; let off
  do {
    const q = new URLSearchParams({ pageSize: '100' }); if (formula) q.set('filterByFormula', formula); if (off) q.set('offset', off)
    const j = await at('GET', `${tbl}?${q}`); out.push(...(j.records ?? [])); off = j.offset
  } while (off)
  return out
}
// crea en lotes de 10; si Airtable rechaza un campo por computado, lo quita y reintenta
async function postBatch(tbl, batch, stripped) {
  const r = await rfetch(`https://api.airtable.com/v0/${BASE}/${tbl}`, {
    method: 'POST', headers: H, body: JSON.stringify({ records: batch, typecast: false }),
  })
  const j = await r.json().catch(() => ({}))
  if (r.ok) return j.records.map((x) => x.id)
  const msg = j?.error?.message || ''
  const m = msg.match(/Field "([^"]+)" cannot accept a value because the field is computed/)
  if (m) {
    stripped.add(m[1])
    for (const b of batch) delete b.fields[m[1]]
    return postBatch(tbl, batch, stripped)  // reintenta sin ese campo
  }
  console.error('AT POST', r.status, tbl, msg.slice(0, 200)); throw new Error(`AT ${r.status}`)
}
const COMPUTADOS = new Set()
async function createRows(tbl, rows) {
  const ids = []
  for (let i = 0; i < rows.length; i += 10) {
    ids.push(...await postBatch(tbl, rows.slice(i, i + 10).map((fields) => ({ fields })), COMPUTADOS))
  }
  return ids
}

async function main() {
  // --- idempotencia: abortar si ya existe el caso ---
  const existentes = await listAll(T.solicitudes, `{numero_solicitud}="METLIFE -6280"`)
  if (existentes.length) {
    console.log('YA EXISTE caso1:', existentes.map((r) => `${r.id}:${r.fields.codigo_solicitud}:${r.fields.estado}`).join(','))
    console.log('Abortando para no duplicar. Borra esos records o cambia el guard si querés re-sembrar.')
    process.exit(2)
  }

  // --- FASE 1: crear solicitud (estado=creada) ---
  const s = O.solicitud
  const solFields = {
    cliente_final_nombre: s.cliente_final_nombre, cliente_final_rut: s.cliente_final_rut,
    ejecutivo_solicitante: s.ejecutivo_solicitante, direccion: s.direccion, region: s.region,
    rol_sii: s.rol_sii, n_operacion_cliente: s.n_operacion_cliente, numero_solicitud: s.numero_solicitud,
    proyecto_condominio: s.proyecto_condominio, tipo_propiedad_nuevo_usado: s.tipo_propiedad_nuevo_usado,
    fecha_visita: s.fecha_visita, fecha_visita_programada: s.fecha_visita_programada,
    vida_util_override: s.vida_util_override, notas: s.notas, override_motivo: s.override_motivo,
    fecha_solicitud: '2026-03-20T12:00:00.000Z',
    estado: 'creada',
    cliente: [O.links.cliente], comuna: [O.links.comuna], tasador: [O.links.tasador],
    visador: [O.links.visador], tipo_informe: [O.links.tipo_informe], tipo_propiedad: [O.links.tipo_propiedad],
  }
  const solRes = await at('POST', T.solicitudes, { records: [{ fields: solFields }], typecast: false })
  const rec = solRes.records[0]
  const id = rec.id
  rollback.created.solicitud = [id]
  writeFileSync(join(__dir, 'rollback-caso1.json'), JSON.stringify(rollback, null, 2))
  // leer codigo auto
  const got = await at('GET', `${T.solicitudes}/${id}`)
  const codigo = got.fields.codigo_solicitud
  console.log('SOLICITUD creada:', id, '· codigo:', codigo)

  // --- FASE 2: hijos --- (persiste rollback tras cada tabla → cero huérfanos sin registrar)
  const RB = join(__dir, 'rollback-caso1.json')
  const seedChild = async (key, tbl, rows) => {
    rollback.created[key] = await createRows(tbl, rows)
    writeFileSync(RB, JSON.stringify(rollback, null, 2))
    console.log(`  ${key}: ${rollback.created[key].length}`)
    return rollback.created[key]
  }
  const d = O.datosTasacion
  await seedChild('datosTasacion', T.datosTasacion, [{ ...d, solicitud: [id] }])

  await seedChild('items', T.items, O.items.map((it) => ({
    clave_natural: `${codigo}|ITEM-${String(it.item_id).padStart(2, '0')}`,
    orden: it.item_id, tipo_item: it.tipo_item, nombre_item: it.nombre_item, descripcion: it.nombre_item,
    sup_m2: it.sup_m2, uf_m2_unitario: it.uf_m2_unitario, uf_m2_aplicado: it.uf_m2_unitario * it.factor_aplicado,
    factor_aplicado: it.factor_aplicado, valor_uf: it.valor_uf, uf_total_item: it.valor_uf,
    situacion_municipal: it.situacion_municipal, valoracion_por: it.valoracion_por,
    es_bien_no_garantia: it.es_bien_no_garantia, solicitud: [id],
  })))

  await seedChild('comparables', T.comparables, O.comparables.map((c) => ({
    clave_natural: `${codigo}|COMP-${String(c.comp_id).padStart(2, '0')}`,
    tipo_referencia: c.tipo_referencia, direccion: c.direccion,
    comuna_comparable: c.comuna_comparable, anio: c.anio, telefono_contacto: c.telefono_contacto,
    precio_uf: c.precio_uf, sup_construccion_m2: c.sup_construccion_m2, oo_cc_uf: c.oo_cc_uf,
    uf_m2_construccion: c.uf_m2_construccion, fecha_publicacion: c.fecha_publicacion, solicitud: [id],
  })))

  await seedChild('habitaciones', T.habitaciones, O.habitaciones.map((h, i) => ({
    clave_habitacion: `${codigo}|HAB-${String(i + 1).padStart(2, '0')}`,
    nivel: h.nivel, tipo_recinto: h.tipo_recinto, cantidad: h.cantidad, es_dormitorio: h.es_dormitorio, solicitud: [id],
  })))

  const L = O.legales
  await seedChild('docLegales', T.docLegales, [{
    clave_doc_legal: `${codigo}|LEGAL`,
    permiso_edificacion_numero: L.permiso_edificacion_numero, permiso_edificacion_fecha: L.permiso_edificacion_fecha,
    recepcion_final_numero: L.recepcion_final_numero, recepcion_final_fecha: L.recepcion_final_fecha, solicitud: [id],
  }])

  // calculos: una fila por terminal (variable_output + resultado + solicitud_codigo)
  await seedChild('calculos', T.calculos, Object.entries(O.calculos).map(([v, res]) => ({
    variable_output: v, resultado: res, solicitud_codigo: codigo,
  })))

  // adjuntos: fotos (Tasador)
  await seedChild('adjuntos', T.adjuntos, F.fotos.map((f) => ({
    nombre_archivo: `caso1_${f.categoria}_${f.orden}.jpg`, tipo_adjunto: 'foto_interior',
    subido_por: 'Tasador', descripcion: f.categoria, orden: f.orden,
    estado_extraccion: 'listo', mime_type: 'image/jpeg', thumbnail_url: f.dataUri, solicitud: [id],
  })))

  // H_PreciosUF 2026-04-06 (tabla compartida · D3)
  const uf = O.preciosUf
  const existUf = await listAll(T.preciosUf, `DATETIME_FORMAT({fecha},'YYYY-MM-DD')="${uf.fecha}"`)
  if (existUf.length) {
    const cur = existUf[0].fields
    rollback.preciosUf = { accion: 'preexistente', id: existUf[0].id, valor_clp: cur.valor_clp, tipo_cambio_usd: cur.tipo_cambio_usd }
    if (Number(cur.valor_clp) !== uf.valor_clp || Number(cur.tipo_cambio_usd) !== uf.tipo_cambio_usd) {
      console.log('⚠ H_PreciosUF 2026-04-06 EXISTE con otros valores — NO se toca (tabla compartida):', JSON.stringify(cur))
    } else console.log('H_PreciosUF 2026-04-06 ya existe con los mismos valores:', existUf[0].id)
  } else {
    const ufRes = await at('POST', T.preciosUf, { records: [{ fields: { fecha: uf.fecha, valor_clp: uf.valor_clp, tipo_cambio_usd: uf.tipo_cambio_usd } }], typecast: false })
    rollback.preciosUf = { accion: 'creado', id: ufRes.records[0].id }
    console.log('H_PreciosUF 2026-04-06 creado:', ufRes.records[0].id)
  }
  writeFileSync(join(__dir, 'rollback-caso1.json'), JSON.stringify(rollback, null, 2))

  // --- FASE 3: estado → calculada ---
  await at('PATCH', T.solicitudes, { records: [{ id, fields: { estado: 'calculada' } }], typecast: false })
  console.log('estado → calculada')

  // --- FASE 4: verificar calculos (anti-AT03) ---
  await sleep(6000)
  const calc = await listAll(T.calculos, `{solicitud_codigo}="${codigo}"`)
  const vals = Object.fromEntries(calc.map((r) => [r.fields.variable_output, r.fields.resultado]))
  const esperaVC = O.calculos.valor_comercial_uf
  const okVC = Math.abs(Number(vals.valor_comercial_uf) - esperaVC) < 0.5
  console.log('CALCULOS tras calculada:', calc.length, 'filas · valor_comercial_uf=', vals.valor_comercial_uf, okVC ? 'OK' : '⚠ CLOBBERED')

  const estadoFin = (await at('GET', `${T.solicitudes}/${id}`)).fields.estado
  const camposComputados = [...COMPUTADOS]
  writeFileSync(join(__dir, 'seed-result.json'), JSON.stringify({ id, codigo, estadoFin, calculos: calc.length, calculosOk: okVC, vals, camposComputados }, null, 2))
  console.log('\n=== SEED OK ===')
  console.log('record:', id, '· codigo:', codigo, '· estado:', estadoFin)
  console.log('hijos:', Object.fromEntries(Object.entries(rollback.created).map(([k, v]) => [k, v.length])))
  console.log('campos computados auto-stripeados:', camposComputados.join(', '))
}
main().catch((e) => { console.error('FALLO SEED:', e.message); process.exit(1) })
