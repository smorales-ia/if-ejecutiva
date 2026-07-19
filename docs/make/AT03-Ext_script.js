/**
 * AT03-Ext · Airtable Automation Script — "Run a script" action
 * ---------------------------------------------------------------
 * RF-09 · Extracción con Claude API
 *   Enrutamiento genérico data-driven a tablas destino, por cardinalidad.
 *
 * v2 (17-jul-2026) — reescrito contra el dominio D_ consolidado de
 * Especificación v1.8.2 / blueprint v8.2 / Capa Datos v2.6.3: el dominio D_
 * pasó de 8 tablas EAV a solo 2 (D_TipoDocumento + D_TipoDocumentoAtributo),
 * confirmado ya migrado en la base real vía MCP (docs/schema-airtable.md §18).
 * D_Atributo, D_TipoDato, D_Catalogo, D_CatalogoValor, D_Documento y
 * D_DocumentoValorAtributo YA NO EXISTEN — este script ya no hace fan-out EAV,
 * ni crea filas en D_Documento. El resultado de Claude vive directo en
 * TX_Adjuntos.atributos_obtenidos (JSON, escrito por el blueprint Make antes
 * de disparar esta automation) y este script solo enruta por cardinalidad.
 * v1 (13-jul-2026, EAV) queda en el historial de git para referencia.
 *
 * Trigger de la Automation que contiene este script: "When record updated"
 *   Tabla: TX_Adjuntos · Campo observado: atributos_obtenidos
 *   Input variable configurada en el trigger → pasar el record id como
 *   "adjuntoId" en input.config() (Dynamic Reference al record disparador).
 *
 * Por qué esta automation existe separada del escenario Make: Make NO tiene
 * módulo nativo para "ejecutar un Airtable Script" — esa acción solo existe
 * dentro de Airtable Automations. El blueprint SC-RF09-ExtraccionClaude
 * escribe TX_Adjuntos.atributos_obtenidos (rama Éxito, módulo 22) y esa
 * escritura dispara ESTA automation. Ver docs/aprendizajes.md E-033, E-039.
 *
 * Guard de entrada: si estado_extraccion quedó en "no_corresponde" o
 * "delegado_visador" (rama Mismatch del blueprint), este script no propaga
 * nada — sale de inmediato.
 *
 * Forma esperada de atributos_obtenidos (JSON array, escrita por el módulo 22
 * del blueprint como `{{25.items}}`):
 *   [{ "codigo_atributo": "rol_sii", "valor": <string|number|bool>, "confianza": <number> }, ...]
 *
 * ESTADO: escrito pero no probado contra Airtable real. Verificar antes de
 * activar la automation:
 *   1. Que TX_DatosTasacion acepte crear una fila solo con `solicitud` + los
 *      campos que llegan aquí (no se auditaron los 83 campos completos).
 *   2. Que uso_campo_destino/uso_campo_link_unidad (texto libre en
 *      D_TipoDocumentoAtributo) coincidan EXACTO con el nombre real del
 *      campo destino.
 *   3. Probar con el caso real HEV-3183 (patrón NO REGISTRA, §4.3.1 Spec
 *      v1.8.2) y con un caso de dos unidades (depto + estacionamiento) del
 *      mismo tipo de documento.
 */

const TABLES = {
  TX_ADJUNTOS: 'TX_Adjuntos', // tblur71x1oItbmKZc
  TX_SOLICITUDES: 'TX_Solicitudes', // tblaHTyMHYfmy7Fg6
  TX_DATOS_TASACION: 'TX_DatosTasacion', // tblMoK3mFuwN8Yr1A
  TX_UNIDADES: 'TX_Unidades', // tbl2QDLvJDyy3Rg2I
  D_TIPO_DOCUMENTO: 'D_TipoDocumento', // tblkPhBnpdDmUWOl3
  D_TIPO_DOCUMENTO_ATRIBUTO: 'D_TipoDocumentoAtributo', // tbldI86ieVKpjpL7E
  LOG_ESCENARIOS: 'LogEscenarios', // tblR4VWpUHw1CSyIS
}

// Estados terminales de la solicitud — precondición 1 de propagación. NO
// incluye "anulada": no es opción real de TX_Solicitudes.estado (ver E-033).
const ESTADOS_TERMINALES = ['cerrada', 'cancelada']

const PENDIENTE = 'PENDIENTE_VALIDACION'
const NO_REGISTRA = 'NO REGISTRA'

/** Devuelve el Field del `table` cuyo nombre coincide, o null si no existe. */
function getFieldByName(table, name) {
  return table.fields.find((f) => f.name === name) || null
}

/**
 * Formatea `valor` al formato de escritura que exige un campo select.
 *
 * CRÍTICO: el Scripting API de Airtable NO acepta un string plano en campos
 * singleSelect/multipleSelects — exige un objeto {id} o {name}. Escribir el
 * string desnudo lanza "Field <fldId> cannot accept the provided value", que
 * NO distingue entre "opción inexistente" y "formato equivocado", y además
 * congela el resto de la corrida. (El REST API sí acepta strings; de ahí la
 * confusión.) Se escribe por {id} porque evita cualquier ambigüedad de
 * normalización Unicode en el nombre de la opción.
 *
 * Devuelve {ok:true, value} o {ok:false, motivo}.
 */
function valorParaSelect(field, valor) {
  const choices = (field.options && field.options.choices) || []
  const v = String(valor)
  const choice = choices.find((c) => c.name === v)
  if (!choice) {
    return {
      ok: false,
      motivo: `opción "${v}" no existe en el desplegable ${field.name} (válidas: ${choices.map((c) => c.name).join(', ') || '—'})`,
    }
  }
  return { ok: true, value: field.type === 'multipleSelects' ? [{ id: choice.id }] : { id: choice.id } }
}

async function logEscenario(table, { titulo, estado, solicitudCodigo, detalle }) {
  try {
    // Construir el payload campo por campo: LogEscenarios.Estado y .Escenario
    // son selects, y aplican la misma regla de formato que arriba. Si un campo
    // no existe o su opción no está declarada, se omite ESE campo en vez de
    // perder el registro completo del log.
    const payload = {}
    const setCampo = (nombre, valor) => {
      const f = getFieldByName(table, nombre)
      if (!f) return
      if (f.type === 'singleSelect' || f.type === 'multipleSelects') {
        const r = valorParaSelect(f, valor)
        if (r.ok) payload[nombre] = r.value
        else console.warn(`AT03-Ext: LogEscenarios.${nombre} — ${r.motivo}; campo omitido en el log.`)
      } else {
        payload[nombre] = String(valor)
      }
    }
    setCampo('Titulo Log', titulo)
    setCampo('Escenario', 'SC-RF09-ExtraccionClaude')
    setCampo('Estado', estado) // '✓ OK' | '✗ Error' | '⚠ Parcial' | '⏭ Omitido'
    setCampo('Solicitud', solicitudCodigo || '')
    setCampo('Detalle', detalle)
    await table.createRecordAsync(payload)
  } catch (e) {
    console.warn(`AT03-Ext: no se pudo escribir en LogEscenarios: ${e.message}`)
  }
}

/** true si `valor` es el literal "NO REGISTRA" (RN-37), sin distinguir mayúsculas/tildes. */
function esNoRegistra(valor) {
  return typeof valor === 'string' && valor.trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '') === NO_REGISTRA
}

// --- 0. Input y guard de entrada -------------------------------------------

const input_ = input.config()
const adjuntoId = input_.adjuntoId
if (!adjuntoId) {
  console.error('AT03-Ext: falta adjuntoId en input.config(). Revisar la configuración del trigger.')
  return
}

const tAdjuntos = base.getTable(TABLES.TX_ADJUNTOS)
const adjunto = await tAdjuntos.selectRecordAsync(adjuntoId)
if (!adjunto) {
  console.error(`AT03-Ext: no se encontró TX_Adjuntos ${adjuntoId} (¿se borró el record?).`)
  return
}

const estadoActual = adjunto.getCellValueAsString('estado_extraccion')
if (estadoActual === 'no_corresponde' || estadoActual === 'delegado_visador') {
  console.log(`AT03-Ext: adjunto ${adjuntoId} en estado '${estadoActual}' (mismatch) — sin propagación, salir.`)
  return
}

const atributosObtenidosRaw = adjunto.getCellValueAsString('atributos_obtenidos')
if (!atributosObtenidosRaw) {
  console.log(`AT03-Ext: adjunto ${adjuntoId} sin atributos_obtenidos — nada que hacer, salir.`)
  return
}

let atributosObtenidos
try {
  atributosObtenidos = JSON.parse(atributosObtenidosRaw)
} catch (e) {
  console.error(`AT03-Ext: atributos_obtenidos de ${adjuntoId} no es JSON válido: ${e.message}`)
  return
}
// El blueprint SC-RF09 (módulo 22) guarda el JSON crudo devuelto por Claude,
// con forma {items:[...], no_extraidos:[...]}. Extraer `items` si viene así.
if (!Array.isArray(atributosObtenidos) && atributosObtenidos && Array.isArray(atributosObtenidos.items)) {
  atributosObtenidos = atributosObtenidos.items
}
if (!Array.isArray(atributosObtenidos)) {
  console.error(`AT03-Ext: atributos_obtenidos de ${adjuntoId} no es un array ni {items:[...]} — salir.`)
  return
}

// El blueprint solo escribe items EXTRAÍDOS en atributos_obtenidos (el módulo
// 22 mapea `{{25.items}}`, no `no_extraidos`) — a diferencia de v1 (EAV), no
// hace falta filtrar por valor !== null aquí; ya vienen filtrados.
const conValor = atributosObtenidos.filter((a) => a && a.valor !== null && a.valor !== undefined && a.codigo_atributo)
if (conValor.length === 0) {
  console.log(`AT03-Ext: atributos_obtenidos vacío o sin items válidos para ${adjuntoId} — nada que propagar.`)
  return
}

// Resolver la solicitud enlazada al adjunto (necesaria para propagación).
const solicitudLink = adjunto.getCellValue('solicitud')
const solicitudId = Array.isArray(solicitudLink) && solicitudLink[0] ? solicitudLink[0].id : null

const tSolicitudes = base.getTable(TABLES.TX_SOLICITUDES)
let solicitudRecord = null
let solicitudCodigoExt = ''
let estadoSolicitud = null
if (solicitudId) {
  solicitudRecord = await tSolicitudes.selectRecordAsync(solicitudId)
  if (solicitudRecord) {
    solicitudCodigoExt = solicitudRecord.getCellValueAsString('codigo_ext')
    estadoSolicitud = solicitudRecord.getCellValueAsString('estado')
  }
}

if (!solicitudId || !solicitudRecord) {
  console.log('AT03-Ext: adjunto sin solicitud enlazada — no se propaga.')
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: 'listo' })
  return
}
if (estadoSolicitud && ESTADOS_TERMINALES.includes(estadoSolicitud)) {
  console.log(`AT03-Ext: solicitud en estado terminal "${estadoSolicitud}" — no se propaga.`)
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: 'listo' })
  return
}

// --- 1. Resolver tipo_documento (D_TipoDocumento) por clave_adjunto --------

const claveAdjunto = adjunto.getCellValueAsString('clave_adjunto')
const tTipoDocumento = base.getTable(TABLES.D_TIPO_DOCUMENTO)
const tipoDocQuery = await tTipoDocumento.selectRecordsAsync({ fields: ['codigo'] })
const tipoDocRecord = tipoDocQuery.records.find((r) => r.getCellValueAsString('codigo') === claveAdjunto)
if (!tipoDocRecord) {
  console.error(`AT03-Ext: D_TipoDocumento con codigo="${claveAdjunto}" no encontrado (adjunto ${adjuntoId}). RN-25 debería haber bloqueado esto antes en AT-RF09-Trigger.`)
  return
}

// --- 2. Cargar D_TipoDocumentoAtributo (fuente única desde v1.6) -----------
// Ya no hay D_Atributo/D_TipoDato que dereferenciar: tipo_dato, uso_tabla_destino,
// uso_campo_destino, uso_cardinalidad_destino y uso_campo_link_unidad viven
// directo en cada fila. Una sola query, filtrada por tipo_documento.

const tTipoDocAtributo = base.getTable(TABLES.D_TIPO_DOCUMENTO_ATRIBUTO)
const tdaQuery = await tTipoDocAtributo.selectRecordsAsync({
  fields: [
    'codigo_atributo',
    'tipo_documento',
    'uso_tabla_destino',
    'uso_campo_destino',
    'uso_cardinalidad_destino',
    'uso_campo_link_unidad',
  ],
})
const tdaPorCodigoAtributo = new Map() // codigo_atributo -> D_TipoDocumentoAtributo record
for (const r of tdaQuery.records) {
  const tipoDocLink = r.getCellValue('tipo_documento')
  const perteneceAEsteTipo = Array.isArray(tipoDocLink) && tipoDocLink.some((l) => l.id === tipoDocRecord.id)
  if (!perteneceAEsteTipo) continue
  const codigoAtributo = r.getCellValueAsString('codigo_atributo')
  if (codigoAtributo) tdaPorCodigoAtributo.set(codigoAtributo, r)
}

// ===========================================================================
// --- 3. PROPAGACIÓN GENÉRICA data-driven ------------------------------------
// ===========================================================================
// NO hardcodear nombres de tabla más allá de la convención `solicitud` como
// nombre del link 1:1 hacia TX_Solicitudes (verificado en TX_DatosTasacion vía
// MCP 17-jul-2026). Toda la demás lógica se rige por
// D_TipoDocumentoAtributo.uso_tabla_destino / uso_campo_destino /
// uso_cardinalidad_destino / uso_campo_link_unidad. Agregar nuevas tablas
// destino se hace en Airtable, no aquí.
//
// Cardinalidades soportadas (Especificación v1.8.2 §4):
//   - una_por_solicitud → TX_DatosTasacion, resuelta/creada 1:1 por `solicitud`.
//   - una_por_unidad    → TX_Unidades, resuelta por uso_campo_link_unidad
//                          (ej. "TX_Unidades.rol_sii") contra el propio batch
//                          de items extraídos, o por TX_Adjuntos.unidad si ya
//                          viene ligado.
//   - muchas_por_solicitud / PENDIENTE_VALIDACION → sin semántica definida
//     todavía (real en el schema pero no en la Especificación) — se omite.
//
// Política de conflicto: sobrescribir SOLO si el destino está vacío (salvo
// NO REGISTRA, que siempre setea avaluo_no_registra + avaluo_total_raw).
// Auditoría: si la tabla destino tiene campo `origen_dato`, se setea a
// "extraido_rf09"; si no existe, warning y se continúa.

const propLog = []
let propOk = 0
let propSkip = 0
let propError = 0

const tDatosTasacion = base.getTable(TABLES.TX_DATOS_TASACION)
const tUnidades = base.getTable(TABLES.TX_UNIDADES)

/** Coerciona `valor` al tipo del `field` destino. */
function coercionar(field, valor) {
  switch (field.type) {
    case 'number':
    case 'currency':
    case 'percent':
    case 'rating':
    case 'duration': {
      const n = Number(valor)
      if (Number.isNaN(n)) return { ok: false, motivo: `valor "${valor}" no es numérico para campo ${field.type}` }
      return { ok: true, value: n }
    }
    case 'singleLineText':
    case 'multilineText':
    case 'richText':
    case 'phoneNumber':
    case 'email':
    case 'url':
    case 'barcode':
      return { ok: true, value: String(valor) }
    case 'singleSelect':
    case 'multipleSelects':
      // Formato objeto {id} — NO string. Ver valorParaSelect().
      return valorParaSelect(field, valor)
    case 'checkbox': {
      const s = String(valor).trim().toLowerCase()
      return { ok: true, value: s === 'true' || s === '1' || s === 'si' || s === 'sí' }
    }
    case 'date':
    case 'dateTime':
      return { ok: true, value: valor }
    case 'multipleRecordLinks':
      return { ok: false, motivo: 'campo destino es Link; la propagación genérica no resuelve records vinculados' }
    default:
      return { ok: true, value: valor }
  }
}

/** Escribe `campoDestino` = `valor` en `destRow` de `destTable`, respetando
 *  conflicto (solo si vacío) y auditoría (origen_dato si existe). */
async function escribirDestino(destTable, tablaDestinoNombre, destRow, campoDestino, item) {
  const destField = getFieldByName(destTable, campoDestino)
  if (!destField) {
    propLog.push(`${item.codigo_atributo}: campo destino "${tablaDestinoNombre}.${campoDestino}" no existe — skip`)
    propError++
    return
  }

  const noRegistra = esNoRegistra(item.valor)
  const valorAEscribir = noRegistra ? null : item.valor

  const valorActual = destRow.getCellValue(campoDestino)
  const tieneValor =
    valorActual !== null &&
    valorActual !== undefined &&
    !(typeof valorActual === 'string' && valorActual.trim() === '') &&
    !(Array.isArray(valorActual) && valorActual.length === 0)
  if (tieneValor && !noRegistra) {
    propLog.push(`${item.codigo_atributo}: ${tablaDestinoNombre}.${campoDestino} ya tiene valor — skip`)
    propSkip++
    return
  }

  const updateFields = {}
  if (noRegistra) {
    // RN-37: no escribir el literal en el campo numérico/tipado; preservar el
    // texto crudo y marcar el flag. avaluo_no_registra/avaluo_total_raw solo
    // existen en TX_DatosTasacion (verificado vía MCP 17-jul-2026).
    if (getFieldByName(destTable, 'avaluo_no_registra') && getFieldByName(destTable, 'avaluo_total_raw')) {
      updateFields.avaluo_no_registra = true
      updateFields.avaluo_total_raw = String(item.valor)
      propLog.push(`${item.codigo_atributo}: NO REGISTRA → avaluo_no_registra=TRUE, avaluo_total_raw guardado (RN-37)`)
    } else {
      propLog.push(`${item.codigo_atributo}: valor NO REGISTRA pero "${tablaDestinoNombre}" no tiene avaluo_no_registra/avaluo_total_raw — se omite sin escribir`)
      propSkip++
      return
    }
  } else {
    const c = coercionar(destField, valorAEscribir)
    if (!c.ok) {
      propLog.push(`${item.codigo_atributo}: ${tablaDestinoNombre}.${campoDestino} ${c.motivo} — skip`)
      propSkip++
      return
    }
    updateFields[campoDestino] = c.value
  }

  // Auditoría: si el destino tiene campo `origen_dato`, escribirlo también.
  // Si es un select, aplica la misma regla de formato objeto {id} y la misma
  // precaución: un valor mal formado o una opción faltante hace fallar EL
  // UPDATE COMPLETO (no solo ese campo) y Airtable culpa al primer campo del
  // batch en el mensaje de error. Ante duda, se omite la auditoría antes que
  // perder el dato principal.
  const origenField = getFieldByName(destTable, 'origen_dato')
  if (origenField) {
    if (origenField.type === 'singleSelect' || origenField.type === 'multipleSelects') {
      const o = valorParaSelect(origenField, 'extraido_rf09')
      if (o.ok) {
        updateFields.origen_dato = o.value
      } else {
        propLog.push(`(aviso: ${tablaDestinoNombre}.origen_dato — ${o.motivo}; se omite la auditoría)`)
      }
    } else {
      updateFields.origen_dato = 'extraido_rf09'
    }
  }

  try {
    await destTable.updateRecordAsync(destRow.id, updateFields)
    propOk++
    propLog.push(`${item.codigo_atributo} → ${tablaDestinoNombre}.${campoDestino} = "${item.valor}"`)
    console.log(`AT03-Ext: propagado ${item.codigo_atributo} → ${tablaDestinoNombre}.${campoDestino} = "${item.valor}".`)
  } catch (e) {
    propError++
    // Log EXTENDIDO: incluir tipo del campo, opciones si las tiene, Y todos los
    // campos del batch. Airtable rechaza el update entero por un campo malo
    // pero solo reporta un fldId — sin ver todo el batch no se puede saber
    // cuál es el real culpable.
    const opts = destField.options && destField.options.choices ? destField.options.choices.map((c) => c.name).join(', ') : ''
    const detalle = `tipo=${destField.type}${opts ? ` · opciones=[${opts}]` : ''} · valor_recibido="${item.valor}"`
    const batch = Object.keys(updateFields).map((k) => `${k}=${JSON.stringify(updateFields[k])}`).join(' | ')
    propLog.push(`${item.codigo_atributo}: error al escribir ${tablaDestinoNombre}.${campoDestino} (${detalle}): ${e.message} — batch enviado: {${batch}} — skip`)
    console.warn(`AT03-Ext: error al escribir ${tablaDestinoNombre}.${campoDestino} (${detalle}): ${e.message}`)
    console.warn(`AT03-Ext: batch enviado: {${batch}}`)
  }
}

// --- 3a. una_por_solicitud → TX_DatosTasacion (fila 1:1 por `solicitud`) ---

let filaDatosTasacion = null
async function resolverFilaDatosTasacion() {
  if (filaDatosTasacion !== undefined && filaDatosTasacion !== null) return filaDatosTasacion
  const q = await tDatosTasacion.selectRecordsAsync({ fields: ['solicitud'] })
  const existente = q.records.find((r) => {
    const link = r.getCellValue('solicitud')
    return Array.isArray(link) && link.some((l) => l.id === solicitudId)
  })
  if (existente) {
    filaDatosTasacion = existente
  } else {
    const nuevaId = await tDatosTasacion.createRecordAsync({ solicitud: [{ id: solicitudId }] })
    filaDatosTasacion = await tDatosTasacion.selectRecordAsync(nuevaId)
    propLog.push(`(creada fila TX_DatosTasacion ${nuevaId} para la solicitud)`)
  }
  return filaDatosTasacion
}

// --- 3b. una_por_unidad → TX_Unidades, resuelta por uso_campo_link_unidad --

const unidadCache = new Map() // uso_campo_link_unidad -> recordId | null

function valorDeItemPorCodigo(codigo) {
  const item = conValor.find((it) => it.codigo_atributo === codigo)
  return item ? item.valor : undefined
}

async function resolverUnidad(campoLinkUnidad) {
  if (unidadCache.has(campoLinkUnidad)) return unidadCache.get(campoLinkUnidad)

  // Si el adjunto ya viene ligado a una unidad específica, preferirla.
  const unidadLink = adjunto.getCellValue('unidad')
  if (Array.isArray(unidadLink) && unidadLink[0]) {
    unidadCache.set(campoLinkUnidad, unidadLink[0].id)
    return unidadLink[0].id
  }

  const partes = campoLinkUnidad.split('.')
  const campoClave = partes[partes.length - 1] // "TX_Unidades.rol_sii" -> "rol_sii"
  const valorClave = valorDeItemPorCodigo(campoClave)
  if (valorClave === undefined) {
    console.log(`AT03-Ext: no se encontró valor extraído para la clave de unidad "${campoClave}".`)
    unidadCache.set(campoLinkUnidad, null)
    return null
  }

  // Comparar con getCellValueAsString: si campoClave es un select o un link,
  // getCellValue devuelve un objeto y String() lo convierte en
  // "[object Object]" — nunca haría match y crearía unidades duplicadas.
  const q = await tUnidades.selectRecordsAsync({ fields: [campoClave, 'solicitud'] })
  const match = q.records.find((r) => {
    const enSolicitud = (r.getCellValue('solicitud') || []).some((l) => l.id === solicitudId)
    return enSolicitud && r.getCellValueAsString(campoClave) === String(valorClave)
  })

  let unidadId
  if (match) {
    unidadId = match.id
  } else {
    // Coercionar también aquí: si campoClave es un select, el string plano
    // falla igual que en el update (ver valorParaSelect).
    const nuevaFila = { solicitud: [{ id: solicitudId }] }
    const fieldClave = getFieldByName(tUnidades, campoClave)
    if (fieldClave) {
      const c = coercionar(fieldClave, valorClave)
      if (!c.ok) {
        propLog.push(`(no se pudo crear TX_Unidades: ${campoClave} ${c.motivo})`)
        unidadCache.set(campoLinkUnidad, null)
        return null
      }
      nuevaFila[campoClave] = c.value
    } else {
      propLog.push(`(no se pudo crear TX_Unidades: el campo clave "${campoClave}" no existe en la tabla)`)
      unidadCache.set(campoLinkUnidad, null)
      return null
    }
    unidadId = await tUnidades.createRecordAsync(nuevaFila)
    propLog.push(`(creada fila TX_Unidades ${unidadId} para ${campoClave}=${valorClave})`)
  }
  unidadCache.set(campoLinkUnidad, unidadId)
  return unidadId
}

// --- 3c. Loop principal ------------------------------------------------------
// TODO el cuerpo del loop va dentro de un try/catch porque Airtable Scripts, al
// rechazar un valor en updateRecordAsync, deshabilita TODAS las siguientes
// requests de la corrida ("Request processing is disabled due to earlier
// failed request"). Sin este wrap, un rechazo hace crash del script y perdemos
// los items que sí eran válidos y aún no se habían escrito. Con el wrap,
// simplemente saltamos ese item y seguimos — los que fallen quedarán
// registrados en propLog para diagnóstico.

for (const item of conValor) {
  try {
    const fila = tdaPorCodigoAtributo.get(item.codigo_atributo)
    if (!fila) {
      propLog.push(`${item.codigo_atributo}: no declarado en D_TipoDocumentoAtributo para "${claveAdjunto}" — skip`)
      propSkip++
      continue
    }

    const tablaDestino = (fila.getCellValueAsString('uso_tabla_destino') || '').trim()
    const campoDestino = (fila.getCellValueAsString('uso_campo_destino') || '').trim()
    const cardinalidadCell = fila.getCellValue('uso_cardinalidad_destino')
    const cardinalidad = cardinalidadCell ? cardinalidadCell.name : ''
    const campoLinkUnidad = (fila.getCellValueAsString('uso_campo_link_unidad') || '').trim()

    if (!tablaDestino || !campoDestino || !cardinalidad || cardinalidad === PENDIENTE) {
      // Set B puro (solo interfaces de negocio) o metadata pendiente: sin
      // propagación adicional, el valor ya vive en TX_Adjuntos.atributos_obtenidos.
      propLog.push(`${item.codigo_atributo}: sin destino declarado o PENDIENTE_VALIDACION — solo atributos_obtenidos`)
      propSkip++
      continue
    }

    if (cardinalidad === 'una_por_solicitud') {
      if (tablaDestino !== TABLES.TX_DATOS_TASACION) {
        propLog.push(`${item.codigo_atributo}: uso_tabla_destino="${tablaDestino}" con cardinalidad una_por_solicitud no es TX_DatosTasacion — revisar fila en D_TipoDocumentoAtributo`)
        propError++
        continue
      }
      const destRow = await resolverFilaDatosTasacion()
      await escribirDestino(tDatosTasacion, TABLES.TX_DATOS_TASACION, destRow, campoDestino, item)
    } else if (cardinalidad === 'una_por_unidad') {
      if (tablaDestino !== TABLES.TX_UNIDADES || !campoLinkUnidad) {
        propLog.push(`${item.codigo_atributo}: cardinalidad una_por_unidad mal configurada (uso_tabla_destino/uso_campo_link_unidad) — skip`)
        propError++
        continue
      }
      const unidadId = await resolverUnidad(campoLinkUnidad)
      if (!unidadId) {
        propLog.push(`${item.codigo_atributo}: no se pudo resolver la unidad destino — skip`)
        propError++
        continue
      }
      const unidadRow = await tUnidades.selectRecordAsync(unidadId)
      await escribirDestino(tUnidades, TABLES.TX_UNIDADES, unidadRow, campoDestino, item)
    } else {
      propLog.push(`${item.codigo_atributo}: cardinalidad "${cardinalidad}" sin semántica definida (muchas_por_solicitud/PENDIENTE_VALIDACION) — skip`)
      propSkip++
    }
  } catch (e) {
    // "Request processing is disabled..." aparece aquí cuando el update de un
    // item anterior ya congeló la corrida: no podemos hacer más writes ni reads.
    // Registrar y salir del loop — no tiene sentido seguir intentando.
    propError++
    propLog.push(`${item.codigo_atributo}: fallo runtime — ${e.message}`)
    console.warn(`AT03-Ext: item ${item.codigo_atributo} falló: ${e.message}`)
    if (String(e.message).includes('Request processing is disabled')) {
      propLog.push('(Airtable congeló la corrida por un update anterior rechazado; se omite el resto de items)')
      console.warn('AT03-Ext: Airtable congeló la corrida — se omite el resto de items.')
      break
    }
  }
}

const propEstado = propError > 0 ? '⚠ Parcial' : '✓ OK'
await logEscenario(base.getTable(TABLES.LOG_ESCENARIOS), {
  titulo: `AT03-Ext · propagación (${propOk} ok · ${propSkip} skip · ${propError} err)`,
  estado: propEstado,
  solicitudCodigo: solicitudCodigoExt,
  detalle: `adjunto_id=${adjuntoId} · tipo_documento=${claveAdjunto} · ${propLog.join(' | ')}`,
})

console.log(`AT03-Ext: propagación terminada — ${propOk} ok, ${propSkip} skip, ${propError} error.`)

// --- 4. Cerrar ---------------------------------------------------------------
// estado_extraccion ya quedó en "listo" (lo puso el módulo 22 del blueprint
// antes de disparar esta automation) — no hace falta volver a escribirlo.

output.set('propagados', propOk)
output.set('propagacionSkip', propSkip)
output.set('propagacionError', propError)
