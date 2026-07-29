/**
 * AT-RF09-Trigger · Airtable Automation Script — "Run a script" action
 * ---------------------------------------------------------------------
 * RF-09 · Extracción con Claude API — Validación + disparo del webhook Make
 *
 * Trigger de la Automation que contiene este script: "When record created"
 *   en TX_Adjuntos, O "When record updated" watching estado_extraccion
 *   (para capturar el 2do intento, cuando SC-Adjuntos-Reemplazar resetea
 *   estado_extraccion a 'idle' tras reemplazar el archivo — Tanda D).
 *   Input variable: pasar el record id disparador como "adjuntoId" en
 *   input.config() (Dynamic Reference del trigger).
 *
 * Reemplaza el diseño de docs/_notas/rf09_diseno.md (que proponía un
 * Route Handler Next.js POST /api/extraccion/iniciar como disparador) — el
 * prompt de la sesión de construcción decidió que el trigger vive
 * enteramente en Airtable Automations, sin Next.js de por medio. Ver
 * docs/aprendizajes.md E-033.
 *
 * Variables de entorno de Airtable Automations a configurar antes de
 * activar esta automation (Automation → ⚙ → Secrets, no hardcodear):
 *   MAKE_WEBHOOK_URL_RF09
 *   MAKE_RF09_HMAC_SECRET
 *
 * FIXES 14-jul-2026:
 *  1) Reemplazado crypto.subtle.* por implementación pura JS de HMAC-SHA256:
 *     el runtime de Airtable Automation Scripts no expone `crypto`.
 *  2) singleSelect en updateRecordAsync/createRecordAsync ahora se pasa
 *     como { name: 'valor' }, no string simple — Airtable Scripts es
 *     estricto y rechaza el string con "Field XXX cannot accept the
 *     provided value" (visto en TX_Adjuntos.estado_extraccion).
 *  3) Se marca TX_Adjuntos.estado_extraccion = 'extrayendo' antes del POST
 *     al webhook — así el badge de la UI refleja el estado real y evita
 *     re-disparos si el trigger vuelve a leer el record antes de que
 *     Make/Claude respondan. Estaba en el diseño original de rf09_diseno.md,
 *     faltaba implementarlo.
 */

const TABLES = {
  TX_ADJUNTOS: 'TX_Adjuntos', // tblur71x1oItbmKZc
  TX_SOLICITUDES: 'TX_Solicitudes', // tblaHTyMHYfmy7Fg6
  D_TIPO_DOCUMENTO: 'D_TipoDocumento', // tblkPhBnpdDmUWOl3
  LOG_ESCENARIOS: 'LogEscenarios', // tblR4VWpUHw1CSyIS
}

// Blacklist RN de la sesión RF-09 — CORREGIDA en Fase 0 (13-jul-2026): el
// prompt original pedía {cerrada, cancelada, anulada}, pero "anulada" NO
// es una opción real de TX_Solicitudes.estado (verificado vía MCP
// get_table_schema — las 12 opciones reales son: creada, asignada,
// visitada, calculada, pdf_listo, devuelta, aprobada, pendiente_final,
// entregada, cerrada, cancelada, requiere_atencion). "anulado" sí existe
// pero como opción de D_Documento.estado, una tabla distinta — fácil de
// confundir. `aprobada` SÍ procesa (decisión 3 del prompt de sesión).
const ESTADOS_TERMINALES_BLACKLIST = ['cerrada', 'cancelada']

// ---------------------------------------------------------------------------
// HMAC-SHA256 en JavaScript puro (sin dependencia de crypto / Web Crypto API)
// ---------------------------------------------------------------------------
// Airtable Automation Scripts NO expone `crypto` ni `crypto.subtle`. Esta
// implementación es autocontenida y solo depende de Uint8Array + TextEncoder
// (ambos disponibles en el runtime de Airtable Scripts). Verificado contra
// vectores de prueba RFC 4231.

function _sha256(bytes) {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ])

  const len = bytes.length
  const bitLen = len * 8
  const padLen = (56 - ((len + 1) % 64) + 64) % 64
  const totalLen = len + 1 + padLen + 8
  const padded = new Uint8Array(totalLen)
  padded.set(bytes)
  padded[len] = 0x80
  const dv = new DataView(padded.buffer)
  // Longitud como entero de 64 bits big-endian (asumimos bitLen < 2^32,
  // lo que es cierto para cualquier payload realista de este script).
  dv.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000))
  dv.setUint32(totalLen - 4, bitLen >>> 0)

  const W = new Uint32Array(64)

  for (let chunk = 0; chunk < totalLen; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = dv.getUint32(chunk + i * 4)
    }
    for (let i = 16; i < 64; i++) {
      const s0 = ((W[i - 15] >>> 7) | (W[i - 15] << 25)) ^ ((W[i - 15] >>> 18) | (W[i - 15] << 14)) ^ (W[i - 15] >>> 3)
      const s1 = ((W[i - 2] >>> 17) | (W[i - 2] << 15)) ^ ((W[i - 2] >>> 19) | (W[i - 2] << 13)) ^ (W[i - 2] >>> 10)
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0
    }

    let a = H[0], b = H[1], c = H[2], d = H[3]
    let e = H[4], f = H[5], g = H[6], h = H[7]

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
      const mj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + mj) >>> 0
      h = g
      g = f
      f = e
      e = (d + t1) >>> 0
      d = c
      c = b
      b = a
      a = (t1 + t2) >>> 0
    }

    H[0] = (H[0] + a) >>> 0
    H[1] = (H[1] + b) >>> 0
    H[2] = (H[2] + c) >>> 0
    H[3] = (H[3] + d) >>> 0
    H[4] = (H[4] + e) >>> 0
    H[5] = (H[5] + f) >>> 0
    H[6] = (H[6] + g) >>> 0
    H[7] = (H[7] + h) >>> 0
  }

  const result = new Uint8Array(32)
  const resultDv = new DataView(result.buffer)
  for (let i = 0; i < 8; i++) resultDv.setUint32(i * 4, H[i])
  return result
}

function firmarHmacSha256(secret, payload) {
  const enc = new TextEncoder()
  const blockSize = 64
  let key = enc.encode(secret)
  if (key.length > blockSize) key = _sha256(key)
  if (key.length < blockSize) {
    const padded = new Uint8Array(blockSize)
    padded.set(key)
    key = padded
  }
  const ipad = new Uint8Array(blockSize)
  const opad = new Uint8Array(blockSize)
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5c
  }
  const msgBytes = enc.encode(payload)
  const inner = new Uint8Array(blockSize + msgBytes.length)
  inner.set(ipad)
  inner.set(msgBytes, blockSize)
  const innerHash = _sha256(inner)
  const outer = new Uint8Array(blockSize + 32)
  outer.set(opad)
  outer.set(innerHash, blockSize)
  const finalHash = _sha256(outer)
  return Array.from(finalHash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function logEscenario(table, { titulo, estado, solicitudCodigo, detalle }) {
  // singleSelect en Airtable Scripts requiere formato { name: 'valor' },
  // no string simple. Aplica a los campos Escenario y Estado.
  await table.createRecordAsync({
    'Titulo Log': titulo,
    Escenario: { name: 'SC-RF09-ExtraccionClaude' },
    Estado: { name: estado },
    Solicitud: solicitudCodigo || '',
    Detalle: detalle,
  })
}

// --- 0. Input ----------------------------------------------------------------

const input_ = input.config()
const adjuntoId = input_.adjuntoId
if (!adjuntoId) {
  console.error('AT-RF09-Trigger: falta adjuntoId en input.config(). Revisar configuración del trigger.')
  return
}

const tAdjuntos = base.getTable(TABLES.TX_ADJUNTOS)
const tSolicitudes = base.getTable(TABLES.TX_SOLICITUDES)
const tTipoDocumento = base.getTable(TABLES.D_TIPO_DOCUMENTO)
const tLog = base.getTable(TABLES.LOG_ESCENARIOS)

const adjunto = await tAdjuntos.selectRecordAsync(adjuntoId)
if (!adjunto) {
  console.error(`AT-RF09-Trigger: TX_Adjuntos ${adjuntoId} no encontrado.`)
  return
}

// --- 1. Solo procesar si estado_extraccion === 'idle' -------------------------

const estadoExtraccion = adjunto.getCellValueAsString('estado_extraccion')
if (estadoExtraccion !== 'idle') {
  console.log(`AT-RF09-Trigger: adjunto ${adjuntoId} tiene estado_extraccion="${estadoExtraccion}" (no 'idle') — exit sin acción.`)
  return
}

const claveAdjunto = adjunto.getCellValueAsString('clave_adjunto')
const solicitudLink = adjunto.getCellValue('solicitud')
const solicitudId = Array.isArray(solicitudLink) && solicitudLink[0] ? solicitudLink[0].id : null
const intentosCarga = adjunto.getCellValue('intentos_carga') ?? 1 // Airtable no soporta default real — tratar null como 1

let solicitudCodigoExt = ''
let solicitudRecord = null
if (solicitudId) {
  solicitudRecord = await tSolicitudes.selectRecordAsync(solicitudId)
  solicitudCodigoExt = solicitudRecord ? solicitudRecord.getCellValueAsString('codigo_ext') : ''
}

// --- 2. RN-25: validación de tipo declarado ------------------------------------

if (!claveAdjunto) {
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: { name: 'skipped' } })
  await logEscenario(tLog, {
    titulo: 'AT-RF09-Trigger · skipped sin tipo',
    estado: '⏭ Omitido',
    solicitudCodigo: solicitudCodigoExt,
    detalle: `adjunto_id=${adjuntoId} · razon=sin tipo declarado (clave_adjunto vacío)`,
  })
  console.log(`AT-RF09-Trigger: adjunto ${adjuntoId} sin clave_adjunto — skipped.`)
  return
}

const tipoDocQuery = await tTipoDocumento.selectRecordsAsync({ fields: ['codigo'] })
const tipoDocRecord = tipoDocQuery.records.find((r) => r.getCellValueAsString('codigo') === claveAdjunto)
if (!tipoDocRecord) {
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: { name: 'error' } })
  await logEscenario(tLog, {
    titulo: 'AT-RF09-Trigger · error tipo no reconocido',
    estado: '✗ Error',
    solicitudCodigo: solicitudCodigoExt,
    detalle: `adjunto_id=${adjuntoId} · clave_adjunto="${claveAdjunto}" · razon=tipo no reconocido en D_TipoDocumento`,
  })
  console.error(`AT-RF09-Trigger: clave_adjunto "${claveAdjunto}" no existe en D_TipoDocumento (adjunto ${adjuntoId}) — error.`)
  return
}

// --- 3. Filtro por estado de la solicitud (blacklist) ---------------------------

const estadoSolicitud = solicitudRecord ? solicitudRecord.getCellValueAsString('estado') : null
if (estadoSolicitud && ESTADOS_TERMINALES_BLACKLIST.includes(estadoSolicitud)) {
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: { name: 'skipped' } })
  await logEscenario(tLog, {
    titulo: 'AT-RF09-Trigger · skipped solicitud terminal',
    estado: '⏭ Omitido',
    solicitudCodigo: solicitudCodigoExt,
    detalle: `adjunto_id=${adjuntoId} · solicitud.estado="${estadoSolicitud}" · razon=solicitud terminal (blacklist: ${ESTADOS_TERMINALES_BLACKLIST.join(', ')})`,
  })
  console.log(`AT-RF09-Trigger: solicitud en estado terminal "${estadoSolicitud}" — skipped (adjunto ${adjuntoId}).`)
  return
}

// --- 4. Disparo: POST a Make con firma HMAC --------------------------------------

const webhookUrl = input_.MAKE_WEBHOOK_URL_RF09 // configurar como Secret de la Automation
const hmacSecret = input_.MAKE_RF09_HMAC_SECRET // configurar como Secret de la Automation

if (!webhookUrl || !hmacSecret) {
  console.error('AT-RF09-Trigger: faltan MAKE_WEBHOOK_URL_RF09 / MAKE_RF09_HMAC_SECRET en la configuración de secrets de la Automation.')
  await logEscenario(tLog, {
    titulo: 'AT-RF09-Trigger · error config',
    estado: '✗ Error',
    solicitudCodigo: solicitudCodigoExt,
    detalle: `adjunto_id=${adjuntoId} · razon=faltan secrets MAKE_WEBHOOK_URL_RF09/MAKE_RF09_HMAC_SECRET`,
  })
  return
}

const payload = {
  adjunto_id: adjuntoId,
  solicitud_id: solicitudId,
  tipo_documento_codigo: claveAdjunto,
  url_dropbox: adjunto.getCellValueAsString('url_dropbox'),
  mime_type: adjunto.getCellValueAsString('mime_type'),
  intentos_carga: intentosCarga,
}
const payloadStr = JSON.stringify(payload)
const firma = firmarHmacSha256(hmacSecret, payloadStr)

// Marcar 'extrayendo' ANTES del fetch (según diseño rf09_diseno.md):
// evita re-disparos si el trigger vuelve a leer el record antes de que
// Make/Claude respondan, y refleja el estado real en la UI.
await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: { name: 'extrayendo' } })

let respuestaOk = false
let detalleRespuesta = ''
try {
  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-VP-Signature': firma },
    body: payloadStr,
  })
  respuestaOk = resp.ok
  detalleRespuesta = `HTTP ${resp.status}`
} catch (e) {
  detalleRespuesta = `fetch error: ${e.message}`
}

if (respuestaOk) {
  await logEscenario(tLog, {
    titulo: 'AT-RF09-Trigger · webhook disparado',
    estado: '✓ OK',
    solicitudCodigo: solicitudCodigoExt,
    detalle: `adjunto_id=${adjuntoId} · tipo_documento=${claveAdjunto} · intentos_carga=${intentosCarga} · ${detalleRespuesta}`,
  })
  console.log(`AT-RF09-Trigger: webhook RF-09 disparado OK para adjunto ${adjuntoId} (${detalleRespuesta}).`)
} else {
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: { name: 'error' } })
  await logEscenario(tLog, {
    titulo: 'AT-RF09-Trigger · error al disparar webhook',
    estado: '✗ Error',
    solicitudCodigo: solicitudCodigoExt,
    detalle: `adjunto_id=${adjuntoId} · ${detalleRespuesta}`,
  })
  console.error(`AT-RF09-Trigger: fallo al disparar webhook RF-09 para adjunto ${adjuntoId} (${detalleRespuesta}).`)
}
