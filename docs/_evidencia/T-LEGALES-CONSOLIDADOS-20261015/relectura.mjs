// T-LEGALES-CONSOLIDADOS-20261015 · relectura en VP-2026-0079 tras pegar AT03-Ext v6, aprobada por
// Sergio en el chat de la sesión (15-oct-2026). Sólo escribe en dos TX_Adjuntos:
//   (1) escritura rec2p6QpeesQ0w2SW → estado_extraccion = idle (la relee SC-RF09 con los atributos nuevos)
//   (2) mapa SII recyCKnUjft9WilnL → atributos_obtenidos con el mismo contenido (re-dispara AT03-Ext)
// y lee el resultado. Uso: node relectura.mjs <corrida>   (deja corrida-<n>.json junto a este archivo)
import fs from 'node:fs'

const AQUI = new URL('.', import.meta.url)
const env = fs.readFileSync(new URL('../../../.env.local', AQUI), 'utf8')
const TOKEN = env.match(/^AIRTABLE_TOKEN=(.*)$/m)[1].trim().replace(/^"|"$/g, '')
const BASE = 'app9G7lLkIV3CpeLa'
const T = { adj: 'tblur71x1oItbmKZc', leg: 'tbl7qIg5x4Y0tOiLk', dt: 'tblMoK3mFuwN8Yr1A', log: 'tblR4VWpUHw1CSyIS' }
const ESCRITURA = 'rec2p6QpeesQ0w2SW'
const MAPA = 'recyCKnUjft9WilnL'
const corrida = process.argv[2] || '1'
const releer = process.argv.includes('--releer-escritura')

async function api(metodo, ruta, cuerpo) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`${metodo} ${ruta}: ${JSON.stringify(j)}`)
  return j
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const filtro = (f) => `filterByFormula=${encodeURIComponent(f)}`

async function estado() {
  const leg = (await api('GET', `${T.leg}?${filtro("{solicitud}='VP-2026-0079'")}`)).records[0]
  const dt = (await api('GET', `${T.dt}?${filtro("{solicitud}='VP-2026-0079'")}`)).records[0]
  const l = leg.fields
  const d = dt.fields
  return {
    legales: {
      fojas: l.fojas, numero_inscripcion: l.numero_inscripcion, ano_inscripcion: l.ano_inscripcion,
      permiso: [l.permiso_edificacion_numero, l.permiso_edificacion_fecha],
      recepcion: [l.recepcion_final_numero, l.recepcion_final_fecha],
      origen_dato: l.origen_dato,
    },
    datos: { n_cert_no_expropiacion: d.n_cert_no_expropiacion, lat: d.lat, long: d.long, origen_dato: d.origen_dato },
  }
}
async function adjunto(id) {
  return (await api('GET', `${T.adj}/${id}`)).fields
}

const t0 = new Date().toISOString()
const pre = await estado()

if (releer) {
  await api('PATCH', T.adj, { records: [{ id: ESCRITURA, fields: { estado_extraccion: 'idle' } }] })
  // idle → extrayendo → listo (~15 s en la tanda de superficies); se espera hasta 3 min.
  for (let i = 0; i < 36; i++) {
    await dormir(5000)
    const e = (await adjunto(ESCRITURA)).estado_extraccion
    if (i > 1 && (e === 'listo' || e === 'error')) break
  }
} else {
  // Sin relectura: re-disparo de AT03-Ext de la escritura con el mismo contenido (idempotencia).
  const raw = (await adjunto(ESCRITURA)).atributos_obtenidos || ''
  await api('PATCH', T.adj, { records: [{ id: ESCRITURA, fields: { atributos_obtenidos: raw.endsWith(' ') ? raw.trimEnd() : `${raw} ` } }] })
}
await dormir(20000)

// Mapa SII: mismo JSON (un espacio al final, o sin él) para que cuente como cambio y dispare AT03-Ext.
const rawMapa = (await adjunto(MAPA)).atributos_obtenidos || ''
await api('PATCH', T.adj, { records: [{ id: MAPA, fields: { atributos_obtenidos: rawMapa.endsWith(' ') ? rawMapa.trimEnd() : `${rawMapa} ` } }] })
await dormir(25000)

const post = await estado()
const esc = await adjunto(ESCRITURA)
const logs = (await api('GET', `${T.log}?${filtro(`AND(IS_AFTER(CREATED_TIME(), '${t0}'), OR(FIND('${ESCRITURA}', {Detalle}), FIND('${MAPA}', {Detalle})))`)}`))
  .records.map((r) => ({ creado: r.createdTime, titulo: r.fields['Titulo Log'], estado: r.fields.Estado, detalle: r.fields.Detalle }))
  .sort((a, b) => a.creado.localeCompare(b.creado))

const salida = {
  corrida,
  t0,
  releer,
  pre,
  post,
  escritura: { estado_extraccion: esc.estado_extraccion, atributos_obtenidos: esc.atributos_obtenidos },
  logs,
}
fs.writeFileSync(new URL(`corrida-${corrida}.json`, AQUI), JSON.stringify(salida, null, 1))
console.log(JSON.stringify({ pre, post, escritura: salida.escritura.estado_extraccion, logs: logs.map((l) => l.titulo) }, null, 1))
