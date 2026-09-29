#!/usr/bin/env node
/**
 * Harness DRY-RUN T-CIERRE-FINAL-20260929 (derivado de T-PDF-BASE-20260927 · T4) — ejecuta el script REAL de AT03_Calculos_DAG
 * (docs/_artefactos/airtable/AT03_Calculos_DAG.js, v11.2.0_v32b1, sin modificar)
 * contra la base productiva vía REST, con un shim del API de scripting de Airtable.
 * Uso: node at03-harness.mjs <recordId TX_Solicitudes>
 * Contexto: AT03 (automation) está DESACTIVADA por Sergio; esta corrida local es la
 * prueba de integración autorizada sobre el registro de prueba VP-2026-0067.
 * Escribe LO MISMO que escribiría la automation: TX_Calculos, A_Eventos y el
 * estado de la solicitud. Rollback: ver rollback.md.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dir, '..', '..', '..');
const TOKEN = readFileSync(join(REPO, '.env.local'), 'utf8').match(/^AIRTABLE_TOKEN=(.*)$/m)[1].trim();
const BASE = 'app9G7lLkIV3CpeLa';
const API = `https://api.airtable.com/v0/${BASE}`;
const recordId = process.argv[2];
if (!recordId || !/^rec/.test(recordId)) { console.error('uso: node at03-harness.mjs <recordId>'); process.exit(1); }

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function rest(method, path, body, params) {
  // ─── DRY-RUN (T-CIERRE-FINAL-20260929 · Agente C): intercepta TODA escritura ───
  if (method.toUpperCase() !== 'GET') {
    globalThis.__DRY = (globalThis.__DRY || 0) + 1;
    console.log(`[DRY-WRITE ${globalThis.__DRY}] ${method} ${path} :: ${JSON.stringify(body ?? params ?? {}).slice(0, 1500)}`);
    if (method.toUpperCase() === 'POST') {
      if (body && Array.isArray(body.records)) return { records: body.records.map((r, i) => ({ id: `recDRY${globalThis.__DRY}x${i}`, fields: r.fields })) };
      return { id: `recDRY${globalThis.__DRY}`, fields: body?.fields ?? {} };
    }
    return {};
  }
  const url = new URL(path.startsWith('https://') ? path : `${API}/${path}`);
  if (params) for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k, x));
    else url.searchParams.set(k, v);
  }
  for (let intento = 0; intento < 5; intento++) {
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) { await sleep(1200); continue; }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
    await sleep(210); // ~4.7 req/s, bajo el límite de 5
    return json;
  }
  throw new Error(`429 persistente en ${path}`);
}

const meta = (await rest('GET', `https://api.airtable.com/v0/meta/bases/${BASE}/tables`)).tables;
const metaByName = Object.fromEntries(meta.map(t => [t.name, t]));

// nombres primarios de records linkeados (para link.name y getCellValueAsString)
const NAME_BY_ID = {};
async function prefetchPrimaries(tableName) {
  const t = metaByName[tableName];
  if (!t) return;
  const primary = t.fields.find(f => f.id === t.primaryFieldId)?.name;
  let offset;
  do {
    const page = await rest('GET', t.id, null, { 'fields[]': primary, pageSize: 100, ...(offset ? { offset } : {}) });
    for (const r of page.records) NAME_BY_ID[r.id] = r.fields[primary] ?? r.id;
    offset = page.offset;
  } while (offset);
}
for (const tn of ['C_Formulas', 'C_ReglasNegocio', 'C_Plantillas', 'M_Clientes', 'M_Comunas',
  'M_TiposInforme', 'M_TiposPropiedad', 'M_Tasadores', 'M_Visadores', 'M_Bancos', 'M_Productos',
  'TX_Solicitudes', 'C_Factores', 'C_VidaUtil', 'C_PreciosUnitarios', 'C_TramosBienComun', 'H_PreciosUF']) {
  await prefetchPrimaries(tn);
}
console.log(`[harness] primarios cacheados: ${Object.keys(NAME_BY_ID).length} records`);

function cellToScripting(fieldMeta, raw) {
  if (raw === undefined || raw === null) return null;
  const t = fieldMeta?.type;
  if (t === 'multipleRecordLinks') return raw.map(id => ({ id, name: NAME_BY_ID[id] ?? String(id) }));
  if (t === 'singleSelect') return typeof raw === 'string' ? { name: raw } : raw;
  if (t === 'multipleSelects') return raw.map(n => (typeof n === 'string' ? { name: n } : n));
  if (t === 'checkbox') return raw === true ? true : null;
  if (t === 'singleCollaborator' || t === 'multipleCollaborators') return raw;
  return raw;
}
function cellToString(fieldMeta, raw) {
  if (raw === undefined || raw === null) return '';
  const t = fieldMeta?.type;
  if (t === 'multipleRecordLinks') return raw.map(id => NAME_BY_ID[id] ?? id).join(', ');
  if (t === 'multipleSelects') return raw.join(', ');
  if (Array.isArray(raw)) return raw.map(x => (x && x.name) ? x.name : String(x)).join(', ');
  if (typeof raw === 'object' && raw.name) return String(raw.name);
  return String(raw);
}
function fieldsToRest(fieldsObj) {
  const out = {};
  for (const [k, v] of Object.entries(fieldsObj)) {
    if (v === undefined) continue;
    if (v === null) { out[k] = null; continue; }
    if (Array.isArray(v)) {
      out[k] = v.map(x => (x && typeof x === 'object') ? (x.id ?? x.name ?? x) : x);
    } else if (typeof v === 'object' && (v.name !== undefined || v.id !== undefined)) {
      out[k] = v.id ?? v.name;
    } else out[k] = v;
  }
  return out;
}

class RecordShim {
  constructor(tableMeta, rec) {
    this._t = tableMeta;
    this._f = rec.fields;
    this.id = rec.id;
    const primary = tableMeta.fields.find(f => f.id === tableMeta.primaryFieldId)?.name;
    this.name = cellToString(tableMeta.fields.find(f => f.name === primary), rec.fields[primary]);
  }
  _fm(field) { return this._t.fields.find(f => f.name === field || f.id === field); }
  getCellValue(field) { const fm = this._fm(field); return cellToScripting(fm, this._f[fm?.name ?? field]); }
  getCellValueAsString(field) {
    // ─── DRY-RUN: spoof de estado SOLO en lectura y SOLO para el record objetivo,
    // para pasar el guard (estado real hoy: pdf_listo; el registro NO se modifica) ───
    if (this.id === recordId && (field === 'estado' || field === 'fldF3AnZ3CN0RfaGF')) return 'visitada';
    const fm = this._fm(field); return cellToString(fm, this._f[fm?.name ?? field]);
  }
}

class TableShim {
  constructor(tableMeta) {
    this._m = tableMeta;
    this.id = tableMeta.id;
    this.name = tableMeta.name;
    this.fields = tableMeta.fields.map(f => ({ id: f.id, name: f.name, type: f.type, options: f.options }));
  }
  async selectRecordAsync(id, _opts) {
    try {
      const rec = await rest('GET', `${this._m.id}/${id}`);
      return new RecordShim(this._m, rec);
    } catch (e) {
      if (String(e.message).includes('404')) return null;
      throw e;
    }
  }
  async selectRecordsAsync(_opts) {
    const recs = [];
    let offset;
    do {
      const page = await rest('GET', this._m.id, null, { pageSize: 100, ...(offset ? { offset } : {}) });
      recs.push(...page.records);
      offset = page.offset;
    } while (offset);
    // refrescar cache de primarios con lo leído
    const primary = this._m.fields.find(f => f.id === this._m.primaryFieldId)?.name;
    for (const r of recs) if (r.fields[primary] !== undefined) NAME_BY_ID[r.id] = r.fields[primary];
    return { records: recs.map(r => new RecordShim(this._m, r)) };
  }
  async createRecordAsync(fieldsObj) {
    const res = await rest('POST', this._m.id, { fields: fieldsToRest(fieldsObj), typecast: true });
    return res.id;
  }
  async createRecordsAsync(arr) {
    const ids = [];
    for (let i = 0; i < arr.length; i += 10) {
      const res = await rest('POST', this._m.id, { records: arr.slice(i, i + 10).map(r => ({ fields: fieldsToRest(r.fields ?? r) })), typecast: true });
      ids.push(...res.records.map(r => r.id));
    }
    return ids;
  }
  async updateRecordAsync(id, fieldsObj) {
    await rest('PATCH', `${this._m.id}/${id}`, { fields: fieldsToRest(fieldsObj), typecast: true });
  }
  async deleteRecordsAsync(ids) {
    for (let i = 0; i < ids.length; i += 10) {
      await rest('DELETE', this._m.id, null, { 'records[]': ids.slice(i, i + 10) });
    }
  }
}

const base = {
  getTable(name) {
    const m = metaByName[name];
    if (!m) throw new Error(`tabla no encontrada: ${name}`);
    return new TableShim(m);
  },
};
const input = { config: () => ({ recordId }) };
const output = { set: () => {} };

const src = readFileSync(join(REPO, 'docs', '_artefactos', 'airtable', 'AT03_Calculos_DAG.js'), 'utf8');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const t0 = Date.now();
console.log(`[harness] ejecutando AT03 real sobre ${recordId} …`);
try {
  await new AsyncFunction('input', 'base', 'output', src)(input, base, output);
  console.log(`[harness] FIN OK en ${((Date.now() - t0) / 1000).toFixed(1)}s`);
} catch (e) {
  console.error(`[harness] ERROR: ${e.stack || e.message}`);
  process.exit(2);
}
