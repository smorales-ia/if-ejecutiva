/**
 * AT03-Ext · Airtable Automation Script — "Run a script" action
 * ---------------------------------------------------------------
 * RF-09 · Extracción con Claude API
 *   Fase 1: Guardado EAV (D_Documento + D_DocumentoValorAtributo)
 *   Fase 2: PROPAGACIÓN GENÉRICA data-driven a tablas destino
 *
 * Trigger de la Automation que contiene este script: "When record updated"
 *   Tabla: TX_Adjuntos
 *   Campo observado: atributos_obtenidos
 *   Input variable configurada en el trigger → pasar el record id como
 *   "adjuntoId" en input.config() (Airtable Automations expone el id del
 *   record disparador vía Dynamic Reference al configurar el script).
 *
 * Por qué esta automation existe separada del escenario Make:
 * Make NO tiene un módulo nativo para "ejecutar un Airtable Script" — esa
 * acción sólo existe dentro de Airtable Automations. El blueprint
 * SC-RF09-ExtraccionClaude.blueprint.json escribe TX_Adjuntos.atributos_obtenidos
 * (rama Éxito, módulo 22) y esa escritura dispara ESTA automation, que hace
 * el trabajo de fan-out EAV y la propagación. Ver nota del módulo 22 en el
 * blueprint y docs/aprendizajes.md E-033.
 *
 * Guard de entrada: si TODOS los valores de atributos_obtenidos son null
 * (rama Mismatch del blueprint, que también escribe este campo antes de
 * marcar no_corresponde/delegado_visador), este script no debe crear nada
 * — sale de inmediato. El guardado EAV y la propagación sólo aplican a
 * extracciones con al menos 1 valor real.
 *
 * Forma esperada de atributos_obtenidos (JSON array):
 *   [{ "atributo_id": "recXXX", "valor": <string|number|bool|null> }, ...]
 */

const TABLES = {
  TX_ADJUNTOS: 'TX_Adjuntos', // tblur71x1oItbmKZc
  TX_SOLICITUDES: 'TX_Solicitudes', // tblaHTyMHYfmy7Fg6
  D_TIPO_DOCUMENTO: 'D_TipoDocumento', // tblkPhBnpdDmUWOl3
  D_TIPO_DOCUMENTO_ATRIBUTO: 'D_TipoDocumentoAtributo', // tbldI86ieVKpjpL7E
  D_ATRIBUTO: 'D_Atributo', // tblOI0Su3ogySNeHm
  D_TIPO_DATO: 'D_TipoDato', // tble0Na4Neon7Vz3z
  D_CATALOGO_VALOR: 'D_CatalogoValor', // tbliFo74Rge2yBsZ5
  D_DOCUMENTO: 'D_Documento', // tblbGI2g0md8x3wCC
  D_DOCUMENTO_VALOR_ATRIBUTO: 'D_DocumentoValorAtributo', // tblGcU6ZG7bf49mCO
  LOG_ESCENARIOS: 'LogEscenarios', // tblR4VWpUHw1CSyIS
}

// Estados terminales de la solicitud — precondición 1 de propagación. NO
// incluye "anulada": no es opción real de TX_Solicitudes.estado (ver E-033).
const ESTADOS_TERMINALES = ['cerrada', 'cancelada']

async function logEscenario(table, { titulo, estado, solicitudCodigo, detalle }) {
  try {
    await table.createRecordAsync({
      'Titulo Log': titulo,
      Escenario: 'SC-RF09-ExtraccionClaude',
      Estado: estado, // '✓ OK' | '✗ Error' | '⚠ Parcial' | '⏭ Omitido'
      Solicitud: solicitudCodigo || '',
      Detalle: detalle,
    })
  } catch (e) {
    console.warn(`AT03-Ext: no se pudo escribir en LogEscenarios: ${e.message}`)
  }
}

/** Devuelve el Field del `table` cuyo nombre coincide, o null si no existe. */
function getFieldByName(table, name) {
  return table.fields.find((f) => f.name === name) || null
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
  console.log(`AT03-Ext: adjunto ${adjuntoId} en estado '${estadoActual}' (mismatch) — sin fan-out EAV ni propagación, salir.`)
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
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: 'error' })
  return
}

const conValor = atributosObtenidos.filter((a) => a.valor !== null && a.valor !== undefined)
if (conValor.length === 0) {
  console.log(`AT03-Ext: 100% de atributos_obtenidos son null para ${adjuntoId} — mismatch, sin fan-out (Make ya debería haber marcado no_corresponde/delegado_visador; si no, revisar el blueprint).`)
  return
}

const huboParcial = conValor.length < atributosObtenidos.length

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

// --- 1. Resolver tipo_documento (D_TipoDocumento) por clave_adjunto ---------

const claveAdjunto = adjunto.getCellValueAsString('clave_adjunto')
const tTipoDocumento = base.getTable(TABLES.D_TIPO_DOCUMENTO)
const tipoDocQuery = await tTipoDocumento.selectRecordsAsync({ fields: ['codigo'] })
const tipoDocRecord = tipoDocQuery.records.find((r) => r.getCellValueAsString('codigo') === claveAdjunto)
if (!tipoDocRecord) {
  console.error(`AT03-Ext: D_TipoDocumento con codigo="${claveAdjunto}" no encontrado (adjunto ${adjuntoId}). RN-25 debería haber bloqueado esto antes en AT-RF09-Trigger.`)
  await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: 'error' })
  return
}

// --- 2. Crear D_Documento ----------------------------------------------------

const tDocumento = base.getTable(TABLES.D_DOCUMENTO)
const nombreArchivo = adjunto.getCellValueAsString('nombre_archivo')
const urlDropbox = adjunto.getCellValueAsString('url_dropbox')
const hashMd5 = adjunto.getCellValueAsString('hash_md5')
const codigoDocumento = `${claveAdjunto}__${adjuntoId}__${Date.now()}`

const documentoId = await tDocumento.createRecordAsync({
  codigo_documento: codigoDocumento,
  tipo_documento: [{ id: tipoDocRecord.id }],
  nombre_archivo: nombreArchivo,
  ruta_archivo: urlDropbox,
  fecha_carga: new Date().toISOString(),
  estado: 'vigente',
  hash_archivo: hashMd5,
  extraccion_incompleta: huboParcial,
})

console.log(`AT03-Ext: D_Documento creado ${documentoId} (extraccion_incompleta=${huboParcial})`)

// --- 3. Precargar D_TipoDocumentoAtributo + tablas del dominio D_ ------------
//     (una sola pasada para no hacer N queries por atributo)

const tTipoDocAtributo = base.getTable(TABLES.D_TIPO_DOCUMENTO_ATRIBUTO)
const tdaQuery = await tTipoDocAtributo.selectRecordsAsync({
  fields: ['codigo', 'tipo_documento', 'atributo'],
})
const tdaPorAtributoId = new Map()
for (const r of tdaQuery.records) {
  const tipoDocLink = r.getCellValue('tipo_documento')
  const perteneceAEsteTipo = Array.isArray(tipoDocLink) && tipoDocLink.some((l) => l.id === tipoDocRecord.id)
  if (!perteneceAEsteTipo) continue
  const atributoLink = r.getCellValue('atributo')
  const atributoId = Array.isArray(atributoLink) && atributoLink[0] ? atributoLink[0].id : null
  if (atributoId) tdaPorAtributoId.set(atributoId, r)
}

const tAtributo = base.getTable(TABLES.D_ATRIBUTO)
const tTipoDato = base.getTable(TABLES.D_TIPO_DATO)
const tCatalogoValor = base.getTable(TABLES.D_CATALOGO_VALOR)

const tipoDatoCache = new Map() // D_TipoDato recordId -> codigo
async function resolverTipoDatoCodigo(atributoRecord) {
  const tipoDatoLink = atributoRecord.getCellValue('tipo_dato')
  const tipoDatoId = Array.isArray(tipoDatoLink) && tipoDatoLink[0] ? tipoDatoLink[0].id : null
  if (!tipoDatoId) return null
  if (tipoDatoCache.has(tipoDatoId)) return tipoDatoCache.get(tipoDatoId)
  const rec = await tTipoDato.selectRecordAsync(tipoDatoId)
  const codigo = rec ? rec.getCellValueAsString('codigo') : null
  tipoDatoCache.set(tipoDatoId, codigo)
  return codigo
}

// Cache de D_Atributo records para reusar en la propagación (Fase 2) sin
// re-consultar por atributo.
const atributoRecordCache = new Map() // atributo_id -> D_Atributo record

// --- 4. Fan-out EAV: una fila D_DocumentoValorAtributo por atributo ----------

const tDocValorAtributo = base.getTable(TABLES.D_DOCUMENTO_VALOR_ATRIBUTO)
let filasCreadas = 0

for (const item of conValor) {
  const atributoRecord = await tAtributo.selectRecordAsync(item.atributo_id)
  if (!atributoRecord) {
    console.warn(`AT03-Ext: D_Atributo ${item.atributo_id} no existe — se omite este valor.`)
    continue
  }
  atributoRecordCache.set(item.atributo_id, atributoRecord)

  const tdaRecord = tdaPorAtributoId.get(item.atributo_id)
  if (!tdaRecord) {
    console.warn(`AT03-Ext: no se encontró D_TipoDocumentoAtributo para atributo=${item.atributo_id} + tipo_documento=${claveAdjunto} — se omite.`)
    continue
  }

  const tipoDatoCodigo = await resolverTipoDatoCodigo(atributoRecord)
  const versionAtributo = atributoRecord.getCellValue('version') ?? 1

  // RN-32: exactamente 1 de las 5 columnas de valor poblada, según D_TipoDato.codigo
  const fields = {
    documento: [{ id: documentoId }],
    tipo_documento_atributo: [{ id: tdaRecord.id }],
    // Snapshot de D_Atributo.version (RN-28) embebido en `codigo` — NO existe
    // un campo dedicado de snapshot en D_DocumentoValorAtributo (gap de schema
    // detectado en la sesión de diseño, no se creó campo nuevo sin aprobación
    // explícita de Sergio; ver docs/aprendizajes.md E-033).
    codigo: `${tdaRecord.getCellValueAsString('codigo')}__v${versionAtributo}`,
  }

  switch (tipoDatoCodigo) {
    case 'texto':
    case 'rut':
      fields.valor_texto = String(item.valor)
      break
    case 'numero_entero':
    case 'numero_decimal':
      fields.valor_numero = Number(item.valor)
      break
    case 'fecha':
      fields.valor_fecha = item.valor
      break
    case 'booleano':
      fields.valor_booleano = Boolean(item.valor)
      break
    case 'catalogo': {
      const catalogoQuery = await tCatalogoValor.selectRecordsAsync({ fields: ['valor'] })
      const match = catalogoQuery.records.find((r) => r.getCellValueAsString('valor') === String(item.valor))
      if (match) {
        fields.catalogo_valor = [{ id: match.id }]
      } else {
        console.warn(`AT03-Ext: valor de catálogo "${item.valor}" no encontrado en D_CatalogoValor para atributo ${item.atributo_id} — se guarda como valor_texto de respaldo.`)
        fields.valor_texto = String(item.valor)
      }
      break
    }
    default:
      console.warn(`AT03-Ext: tipo_dato desconocido ("${tipoDatoCodigo}") para atributo ${item.atributo_id} — se guarda como valor_texto de respaldo (RN-32 no pudo tipar la columna).`)
      fields.valor_texto = String(item.valor)
  }

  await tDocValorAtributo.createRecordAsync(fields)
  filasCreadas++
}

console.log(`AT03-Ext: ${filasCreadas} filas creadas en D_DocumentoValorAtributo para documento ${documentoId}.`)

// ===========================================================================
// --- 5. PROPAGACIÓN GENÉRICA data-driven ------------------------------------
// ===========================================================================
// PROPAGACIÓN GENÉRICA. NO hardcodear nombres de tabla. Toda la lógica
// se rige por D_Atributo.uso_tabla_destino, uso_campo_destino,
// uso_cardinalidad_destino, uso_campo_link_solicitud. Agregar nuevas
// tablas destino se hace en Airtable, no aquí.
//
// Precondiciones (ver docs/construccion.md §8):
//   1. La solicitud debe estar en estado NO terminal ({cerrada, cancelada}).
//   2. El valor extraído debe ser no-null (ya filtrado en `conValor`).
//   3. uso_tabla_destino, uso_campo_destino y uso_cardinalidad_destino deben
//      tener valor real y != "PENDIENTE_VALIDACION".
//   4. Si la cardinalidad requiere uso_campo_link_solicitud y está vacío →
//      loggear "metadata incompleta" y saltar.
//   5. Política de conflicto (decisión A): sobrescribir SOLO si el destino
//      está vacío. Si ya tiene valor → skip.
//   6. Auditoría (decisión C): si la tabla destino tiene campo `origen_dato`,
//      se setea a "extraido_rf09"; si no existe, warning y se continúa.

const PENDIENTE = 'PENDIENTE_VALIDACION'
const propLog = [] // líneas de detalle para el log resumen
let propOk = 0
let propSkip = 0
let propError = 0

// Precondición 1: solicitud en estado terminal → no propagar (solo D_).
if (!solicitudId || !solicitudRecord) {
  propLog.push('sin solicitud enlazada al adjunto — propagación omitida')
  console.log('AT03-Ext: adjunto sin solicitud enlazada — no se propaga.')
} else if (estadoSolicitud && ESTADOS_TERMINALES.includes(estadoSolicitud)) {
  propLog.push(`solicitud en estado terminal "${estadoSolicitud}" — propagación omitida (precondición 1)`)
  console.log(`AT03-Ext: solicitud en estado terminal "${estadoSolicitud}" — no se propaga (solo D_).`)
} else {
  // Cache de tablas destino y de filas 1:1 ya resueltas (por tabla+solicitud).
  const tablaDestinoCache = new Map() // nombre -> Table | null
  const filaUnaPorSolicitudCache = new Map() // `${tabla}` -> record | null (resuelto/creado 1 vez)

  function resolverTablaDestino(nombre) {
    if (tablaDestinoCache.has(nombre)) return tablaDestinoCache.get(nombre)
    let t = null
    try {
      t = base.getTable(nombre)
    } catch (e) {
      t = null
    }
    tablaDestinoCache.set(nombre, t)
    return t
  }

  /** Coerciona `valor` al tipo del `field` destino. Devuelve
   *  { ok:true, value } o { ok:false, motivo } si el tipo no es propagable
   *  genéricamente (ej. multipleRecordLinks). */
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
        // La opción debe existir; si no, updateRecordAsync lanzará y se captura.
        return { ok: true, value: String(valor) }
      case 'multipleSelects':
        return { ok: true, value: [String(valor)] }
      case 'checkbox': {
        const s = String(valor).trim().toLowerCase()
        return { ok: true, value: s === 'true' || s === '1' || s === 'si' || s === 'sí' }
      }
      case 'date':
      case 'dateTime':
        return { ok: true, value: valor }
      case 'multipleRecordLinks':
        return { ok: false, motivo: 'campo destino es Link; la propagación genérica no resuelve records vinculados (requiere metadata/lookup adicional)' }
      default:
        return { ok: true, value: valor }
    }
  }

  for (const item of conValor) {
    const atributoRecord =
      atributoRecordCache.get(item.atributo_id) || (await tAtributo.selectRecordAsync(item.atributo_id))
    if (!atributoRecord) {
      propLog.push(`${item.atributo_id}: D_Atributo inexistente — skip`)
      propSkip++
      continue
    }

    const codigoAtributo = atributoRecord.getCellValueAsString('codigo') || item.atributo_id
    const tablaDestino = (atributoRecord.getCellValueAsString('uso_tabla_destino') || '').trim()
    const campoDestino = (atributoRecord.getCellValueAsString('uso_campo_destino') || '').trim()
    const cardinalidad = (atributoRecord.getCellValueAsString('uso_cardinalidad_destino') || '').trim()
    const campoLink = (atributoRecord.getCellValueAsString('uso_campo_link_solicitud') || '').trim()

    // Precondición 3: metadata de destino completa y != PENDIENTE.
    if (!tablaDestino || !campoDestino || !cardinalidad ||
        tablaDestino === PENDIENTE || campoDestino === PENDIENTE || cardinalidad === PENDIENTE) {
      propLog.push(`${codigoAtributo}: sin destino declarado (tabla/campo/cardinalidad vacío o PENDIENTE) — solo D_`)
      propSkip++
      continue
    }

    // Cardinalidad muchas_por_solicitud → decisión B: saltar hasta IF-04.
    if (cardinalidad === 'muchas_por_solicitud') {
      propLog.push(`${codigoAtributo}: cardinalidad muchas_por_solicitud (1:N) — skip, pendiente IF-04 (decisión B)`)
      propSkip++
      continue
    }

    // Precondición 4: cardinalidades 1:1 requieren el campo Link.
    if (cardinalidad === 'una_por_solicitud' && !campoLink) {
      propLog.push(`${codigoAtributo}: metadata incompleta (una_por_solicitud sin uso_campo_link_solicitud) — skip`)
      console.warn(`AT03-Ext: metadata incompleta en D_Atributo ${codigoAtributo}: falta uso_campo_link_solicitud.`)
      propError++
      continue
    }

    const destTable = resolverTablaDestino(tablaDestino)
    if (!destTable) {
      propLog.push(`${codigoAtributo}: tabla destino "${tablaDestino}" no existe en la base — skip`)
      propError++
      continue
    }

    const destField = getFieldByName(destTable, campoDestino)
    if (!destField) {
      propLog.push(`${codigoAtributo}: campo destino "${tablaDestino}.${campoDestino}" no existe — skip`)
      propError++
      continue
    }

    // Resolver la fila destino según cardinalidad.
    let destRow = null
    try {
      if (cardinalidad === 'directo_solicitud') {
        // La tabla destino ES la de solicitudes; la fila es la solicitud del adjunto.
        destRow = await destTable.selectRecordAsync(solicitudId)
        if (!destRow) {
          propLog.push(`${codigoAtributo}: directo_solicitud pero la solicitud ${solicitudId} no está en "${tablaDestino}" — skip`)
          propError++
          continue
        }
      } else {
        // una_por_solicitud: buscar fila donde el Link apunte a la solicitud; crear si no existe.
        if (filaUnaPorSolicitudCache.has(tablaDestino)) {
          destRow = filaUnaPorSolicitudCache.get(tablaDestino)
        } else {
          const q = await destTable.selectRecordsAsync({ fields: [campoLink] })
          destRow =
            q.records.find((r) => {
              const link = r.getCellValue(campoLink)
              return Array.isArray(link) && link.some((l) => l.id === solicitudId)
            }) || null
          if (!destRow) {
            const nuevaId = await destTable.createRecordAsync({ [campoLink]: [{ id: solicitudId }] })
            destRow = await destTable.selectRecordAsync(nuevaId)
            propLog.push(`(creada fila ${tablaDestino} ${nuevaId} para la solicitud)`)
          }
          filaUnaPorSolicitudCache.set(tablaDestino, destRow)
        }
        if (!destRow) {
          propLog.push(`${codigoAtributo}: no se pudo resolver/crear fila en "${tablaDestino}" — skip`)
          propError++
          continue
        }
      }
    } catch (e) {
      propLog.push(`${codigoAtributo}: error al resolver fila destino en "${tablaDestino}": ${e.message} — skip`)
      propError++
      continue
    }

    // Precondición 5 (decisión A): sobrescribir SOLO si el destino está vacío.
    const valorActual = destRow.getCellValue(campoDestino)
    const tieneValor =
      valorActual !== null &&
      valorActual !== undefined &&
      !(typeof valorActual === 'string' && valorActual.trim() === '') &&
      !(Array.isArray(valorActual) && valorActual.length === 0)
    if (tieneValor) {
      propLog.push(`${codigoAtributo}: ${tablaDestino}.${campoDestino} ya tiene valor — skip (decisión A)`)
      propSkip++
      continue
    }

    // Coerción por tipo real del campo destino (data-driven).
    const c = coercionar(destField, item.valor)
    if (!c.ok) {
      propLog.push(`${codigoAtributo}: ${tablaDestino}.${campoDestino} ${c.motivo} — skip`)
      propSkip++
      continue
    }

    // Armar update. Auditoría origen_dato (decisión C) si el campo existe.
    const updateFields = { [campoDestino]: c.value }
    const origenField = getFieldByName(destTable, 'origen_dato')
    if (origenField) {
      updateFields.origen_dato = 'extraido_rf09'
    } else {
      console.warn(`AT03-Ext: tabla destino "${tablaDestino}" sin campo origen_dato — se escribe sin auditoría.`)
      propLog.push(`(aviso: ${tablaDestino} sin campo origen_dato)`)
    }

    try {
      await destTable.updateRecordAsync(destRow.id, updateFields)
      propOk++
      propLog.push(`${codigoAtributo} → ${tablaDestino}.${campoDestino} = "${item.valor}" [${cardinalidad}]`)
      console.log(`AT03-Ext: propagado ${codigoAtributo} → ${tablaDestino}.${campoDestino} = "${item.valor}".`)
    } catch (e) {
      // Ej.: opción de singleSelect inexistente, tipo incompatible, etc.
      propError++
      propLog.push(`${codigoAtributo}: error al escribir ${tablaDestino}.${campoDestino}: ${e.message} — skip`)
      console.warn(`AT03-Ext: error al escribir ${tablaDestino}.${campoDestino}: ${e.message}`)
    }
  }
}

const propEstado = propError > 0 ? '⚠ Parcial' : '✓ OK'
await logEscenario(tLog_or_default(), {
  titulo: `AT03-Ext · propagación (${propOk} ok · ${propSkip} skip · ${propError} err)`,
  estado: propEstado,
  solicitudCodigo: solicitudCodigoExt,
  detalle: `adjunto_id=${adjuntoId} · documento=${documentoId} · eav=${filasCreadas} · ${propLog.join(' | ')}`,
})

function tLog_or_default() {
  return base.getTable(TABLES.LOG_ESCENARIOS)
}

console.log(`AT03-Ext: propagación terminada — ${propOk} ok, ${propSkip} skip, ${propError} error.`)

// --- 6. Cerrar: estado_extraccion = listo -----------------------------------

await tAdjuntos.updateRecordAsync(adjuntoId, { estado_extraccion: 'listo' })
console.log(`AT03-Ext: TX_Adjuntos ${adjuntoId} → estado_extraccion = listo (${filasCreadas} atributos EAV, extraccion_incompleta=${huboParcial}, propagados=${propOk}).`)

output.set('documentoId', documentoId)
output.set('filasCreadas', filasCreadas)
output.set('extraccionIncompleta', huboParcial)
output.set('propagados', propOk)
output.set('propagacionSkip', propSkip)
output.set('propagacionError', propError)
