#!/usr/bin/env node
/**
 * Seed ESPEJO VÍA MOTOR del CASO 5 (HEV-3183) · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005.
 * Receta probada del Caso 2:
 *   - Siembra SOLO ENTRADAS (solicitud + hijos). Incluye RN-37: avaluo_fiscal_clp
 *     se deja VACÍO + avaluo_no_registra=TRUE + avaluo_total_raw='NO REGISTRA'.
 *   - NO siembra TX_Calculos ni fija 'calculada' a mano.
 *   - Deja que AT01 (estado=creada) fije regla_aplicada y que AT03 (estado=visitada)
 *     calcule y transicione a 'calculada'.
 * Idempotente (aborta si ya existe numero_solicitud="HEV -3183"). Registra rollback
 * vivo en rollback-caso5.json. NUNCA imprime secretos.
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
const O = JSON.parse(readFileSync(join(__dir, 'caso5-oraculo.json'), 'utf8'))
const F = JSON.parse(readFileSync(join(__dir, 'caso5-fotos.json'), 'utf8'))
const E = O.entradas

const T = {
  solicitudes: 'tblaHTyMHYfmy7Fg6', datosTasacion: 'tblMoK3mFuwN8Yr1A',
  comparables: 'tbllbTuhb0waWIbRo', items: 'tblCxnMtOETK2ulD0',
  habitaciones: 'tblBITpPb8WuqsatM', docLegales: 'tbl7qIg5x4Y0tOiLk',
  adjuntos: 'tblur71x1oItbmKZc', calculos: 'tblFz37KSvn5pLKDR',
  preciosUf: 'tblWPRuIYfzdlveHM', eventos: 'tblMKmDg2KrO5fMn8',
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const RB = join(__dir, 'rollback-caso5.json')
const rollback = JSON.parse(readFileSync(RB, 'utf8'))
rollback.created = rollback.created || {}
const saveRB = () => writeFileSync(RB, JSON.stringify(rollback, null, 2))
const sinNulos = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined))

async function rfetch(url, opts, tries = 6) {
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
  if (!r.ok) { console.error('AT', method, r.status, path.slice(0, 60), JSON.stringify(j).slice(0, 300)); throw new Error(`AT ${r.status}`) }
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
    return postBatch(tbl, batch, stripped)
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
  // --- idempotencia ---
  const existentes = await listAll(T.solicitudes, `{numero_solicitud}="${E.solicitud.numero_solicitud}"`)
  if (existentes.length) {
    console.log('YA EXISTE caso5:', existentes.map((r) => `${r.id}:${r.fields.codigo_solicitud}:${r.fields.estado}`).join(','))
    console.log('Abortando para no duplicar.')
    process.exit(2)
  }

  // --- FASE 1: crear solicitud (estado=creada) → AT01 fija regla_aplicada ---
  const s = E.solicitud
  const solFields = {
    cliente_final_nombre: s.cliente_final_nombre, cliente_final_rut: s.cliente_final_rut,
    ejecutivo_solicitante: s.ejecutivo_solicitante, direccion: s.direccion, region: s.region,
    rol_sii: s.rol_sii, n_operacion_cliente: s.n_operacion_cliente, numero_solicitud: s.numero_solicitud,
    proyecto_condominio: s.proyecto_condominio, tipo_propiedad_nuevo_usado: s.tipo_propiedad_nuevo_usado,
    fecha_visita: s.fecha_visita, fecha_visita_programada: s.fecha_visita_programada,
    vida_util_override: s.vida_util_override, notas: s.notas,
    valor_reposicion_override: s.valor_reposicion_override,
    valor_seguro_override: s.valor_seguro_override,
    override_motivo: s.override_motivo, override_autor: s.override_autor,
    fecha_solicitud: s.fecha_solicitud,
    estado: 'creada',
    cliente: [O.links.cliente], comuna: [O.links.comuna], tasador: [O.links.tasador],
    visador: [O.links.visador], tipo_informe: [O.links.tipo_informe], tipo_propiedad: [O.links.tipo_propiedad],
  }
  const solRes = await at('POST', T.solicitudes, { records: [{ fields: solFields }], typecast: false })
  const id = solRes.records[0].id
  rollback.created.solicitud = [id]
  saveRB()
  const got = await at('GET', `${T.solicitudes}/${id}`)
  const codigo = got.fields.codigo_solicitud
  console.log('SOLICITUD creada:', id, '· codigo:', codigo)

  // --- FASE 1b: esperar AT01 (regla_aplicada) ---
  let regla = null, estadoAT01 = 'creada'
  for (let i = 0; i < 12; i++) {
    await sleep(5000)
    const r = await at('GET', `${T.solicitudes}/${id}`)
    estadoAT01 = r.fields.estado
    if (Array.isArray(r.fields.regla_aplicada) && r.fields.regla_aplicada.length) { regla = r.fields.regla_aplicada[0]; break }
    if (estadoAT01 === 'requiere_atencion') break
    console.log(`  espera AT01 ${i + 1}/12 · estado=${estadoAT01}`)
  }
  console.log('AT01 → regla_aplicada:', regla, '· estado:', estadoAT01)
  if (!regla) { console.error('AT01 no fijó regla_aplicada — diagnosticar antes de seguir (estado=' + estadoAT01 + ')'); process.exit(3) }

  // --- FASE 2: hijos (solo ENTRADAS) ---
  const seedChild = async (key, tbl, rows) => {
    rollback.created[key] = await createRows(tbl, rows)
    saveRB()
    console.log(`  ${key}: ${rollback.created[key].length}`)
  }
  // RN-37: avaluo_fiscal_clp viaja null → se OMITE (campo vacío); el flag y el raw sí viajan.
  const d = sinNulos(E.datosTasacion)
  await seedChild('datosTasacion', T.datosTasacion, [{ ...d, solicitud: [id] }])

  await seedChild('items', T.items, E.items.map((it) => ({
    clave_natural: `${codigo}|ITEM-${String(it.item_id).padStart(2, '0')}`,
    orden: it.item_id, tipo_item: it.tipo_item, nombre_item: it.nombre_item, descripcion: it.nombre_item,
    rol_sii: it.rol_sii,
    sup_m2: it.sup_m2, uf_m2_unitario: it.uf_m2_unitario, uf_m2_aplicado: it.uf_m2_unitario * it.factor_aplicado,
    factor_aplicado: it.factor_aplicado, uf_total_item: it.valor_uf,
    situacion_municipal: it.situacion_municipal, valoracion_por: it.valoracion_por, solicitud: [id],
  })))

  await seedChild('comparables', T.comparables, E.comparables.map((c) => ({
    clave_natural: `${codigo}|COMP-${String(c.comp_id).padStart(2, '0')}`,
    tipo_referencia: c.tipo_referencia, direccion: c.direccion,
    comuna_comparable: c.comuna_comparable, anio: c.anio, telefono_contacto: c.telefono_contacto,
    precio_uf: c.precio_uf, sup_construccion_m2: c.sup_construccion_m2, oo_cc_uf: c.oo_cc_uf,
    uf_m2_construccion: c.uf_m2_construccion, fecha_publicacion: c.fecha_publicacion, solicitud: [id],
  })))

  await seedChild('habitaciones', T.habitaciones, E.habitaciones.map((h, i) => ({
    clave_habitacion: `${codigo}|HAB-${String(i + 1).padStart(2, '0')}`,
    nivel: h.nivel, tipo_recinto: h.tipo_recinto, cantidad: h.cantidad, solicitud: [id],
  })))

  const L = E.legales
  await seedChild('docLegales', T.docLegales, [{
    clave_doc_legal: `${codigo}|LEGAL`,
    permiso_edificacion_numero: L.permiso_edificacion_numero, permiso_edificacion_fecha: L.permiso_edificacion_fecha,
    recepcion_final_numero: L.recepcion_final_numero, recepcion_final_fecha: L.recepcion_final_fecha, solicitud: [id],
  }])

  await seedChild('adjuntos', T.adjuntos, F.fotos.map((f) => ({
    nombre_archivo: `caso5_${f.categoria}_${f.orden}.jpg`, tipo_adjunto: 'foto_interior',
    subido_por: 'Tasador', descripcion: f.categoria, orden: f.orden,
    estado_extraccion: 'listo', mime_type: 'image/jpeg', thumbnail_url: f.dataUri, solicitud: [id],
  })))

  // H_PreciosUF 2026-05-12 (tabla compartida · patrón check-create: si existe NO se toca)
  const uf = E.preciosUf
  const existUf = await listAll(T.preciosUf, `DATETIME_FORMAT({fecha},'YYYY-MM-DD')="${uf.fecha}"`)
  if (existUf.length) {
    const cur = existUf[0].fields
    rollback.preciosUf = { accion: 'preexistente', id: existUf[0].id, valor_clp: cur.valor_clp, tipo_cambio_usd: cur.tipo_cambio_usd }
    if (Number(cur.valor_clp) !== uf.valor_clp || Number(cur.tipo_cambio_usd) !== uf.tipo_cambio_usd) {
      console.log(`⚠ H_PreciosUF ${uf.fecha} EXISTE con otros valores — NO se toca (tabla compartida):`, JSON.stringify(cur))
    } else console.log(`H_PreciosUF ${uf.fecha} ya existe con los mismos valores:`, existUf[0].id)
  } else {
    const ufRes = await at('POST', T.preciosUf, { records: [{ fields: { fecha: uf.fecha, valor_clp: uf.valor_clp, tipo_cambio_usd: uf.tipo_cambio_usd } }], typecast: false })
    rollback.preciosUf = { accion: 'creado', id: ufRes.records[0].id }
    console.log(`H_PreciosUF ${uf.fecha} creado:`, ufRes.records[0].id)
  }
  saveRB()

  // --- FASE 3: disparar el MOTOR: creada → asignada → visitada ---
  await at('PATCH', T.solicitudes, { records: [{ id, fields: { estado: 'asignada' } }], typecast: false })
  console.log('estado → asignada')
  await sleep(4000)
  await at('PATCH', T.solicitudes, { records: [{ id, fields: { estado: 'visitada' } }], typecast: false })
  console.log('estado → visitada (AT03 disparado)')

  // --- FASE 4: esperar AT03 → calculada + TX_Calculos ---
  let estadoFin = 'visitada', calc = []
  for (let i = 0; i < 36; i++) {
    await sleep(10000)
    const r = await at('GET', `${T.solicitudes}/${id}`)
    estadoFin = r.fields.estado
    calc = await listAll(T.calculos, `{solicitud_codigo}="${codigo}"`)
    console.log(`  poll ${i + 1}/36 · estado=${estadoFin} · TX_Calculos=${calc.length}`)
    if (estadoFin === 'calculada' && calc.length > 0) break
  }
  const vals = Object.fromEntries(calc.map((r) => [r.fields.variable_output, r.fields.resultado]))

  // --- FASE 5: A_Eventos recientes (aborts H3/H5/H6/H7 + dag_completo) ---
  let eventos = []
  try {
    const evs = await listAll(T.eventos, `DATETIME_DIFF(NOW(),CREATED_TIME(),'minutes')<30`)
    eventos = evs.map((e) => ({ id: e.id, tipo: e.fields.tipo_evento, desc: String(e.fields.descripcion || e.fields.mensaje || '').slice(0, 160) }))
    for (const e of eventos) console.log('  EVENTO:', e.tipo, '·', e.desc)
  } catch (e) { console.log('  WARN lectura A_Eventos:', e.message) }

  writeFileSync(join(__dir, 'seed-result-caso5.json'), JSON.stringify({
    id, codigo, estadoFin, regla, calculos: calc.length, vals,
    camposComputados: [...COMPUTADOS], eventos,
  }, null, 2))
  console.log('\n=== SEED CASO5 (motor) ===')
  console.log('record:', id, '· codigo:', codigo, '· estado:', estadoFin, '· regla:', regla)
  console.log('TX_Calculos escritas por AT03:', calc.length)
  console.log('vals:', JSON.stringify(vals))
  console.log('hijos:', Object.fromEntries(Object.entries(rollback.created).map(([k, v]) => [k, v.length])))
  console.log('campos computados auto-stripeados:', [...COMPUTADOS].join(', ') || '(ninguno)')
}
main().catch((e) => { console.error('FALLO SEED:', e.message); process.exit(1) })
