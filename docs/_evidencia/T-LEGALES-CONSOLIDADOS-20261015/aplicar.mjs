// T-LEGALES-CONSOLIDADOS-20261015 · cambios de Airtable aprobados por Sergio en el chat de la
// sesión que escribe (15-oct-2026, «Sí, aplica»). REST con AIRTABLE_TOKEN de .env.local — motivo
// RO-30: el MCP de Airtable está sin autenticar en la sesión. Idempotente: un campo o una fila que
// ya existe se salta. Uso: node aplicar.mjs   (deja el log en apply-log.txt, junto a este archivo)
import fs from 'node:fs'

const AQUI = new URL('.', import.meta.url)
const env = fs.readFileSync(new URL('../../../.env.local', AQUI), 'utf8')
const TOKEN = env.match(/^AIRTABLE_TOKEN=(.*)$/m)[1].trim().replace(/^"|"$/g, '')
const BASE = 'app9G7lLkIV3CpeLa'
const TDA = 'tbldI86ieVKpjpL7E'
const LEG = 'tbl7qIg5x4Y0tOiLk'
const log = []
const anotar = (s) => {
  log.push(s)
  console.log(s)
}

async function api(metodo, ruta, cuerpo) {
  const r = await fetch(`https://api.airtable.com/v0/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`${metodo} ${ruta}: ${JSON.stringify(j)}`)
  return j
}

try {
  /* --- 1. Campos nuevos -------------------------------------------------- */
  const tablas = (await api('GET', `meta/bases/${BASE}/tables`)).tables
  const campo = async (tabla, def) => {
    const t = tablas.find((x) => x.id === tabla)
    const ya = t.fields.find((f) => f.name === def.name)
    if (ya) return anotar(`campo ya existía: ${t.name}.${def.name} ${ya.id}`)
    const f = await api('POST', `meta/bases/${BASE}/tables/${tabla}/fields`, def)
    anotar(`campo creado: ${t.name}.${def.name} ${f.id}`)
  }
  await campo(TDA, {
    name: 'grupo_destino',
    type: 'singleLineText',
    description:
      'AT03-Ext v6: los atributos con el mismo grupo se escriben JUNTOS desde un solo documento ganador (ej. inscripcion_dominio = foja + número + año). Vacío = el campo es su propio grupo.',
  })
  await campo(TDA, {
    name: 'vigencia_destino',
    type: 'checkbox',
    options: { icon: 'check', color: 'greenBright' },
    description:
      'AT03-Ext v6: marca el atributo que fecha el grupo (año de inscripción, fecha del permiso…). Gana el documento con la vigencia más reciente; después prioridad_destino.',
  })
  await campo(LEG, {
    name: 'origen_dato',
    type: 'singleSelect',
    options: { choices: [{ name: 'tipeado' }, { name: 'extraido_rf09' }] },
    description:
      'Candado RF-09: tipeado = lo guardó el tasador (PATCH /datos) y la lectura de documentos no lo pisa; extraido_rf09 = lo escribió AT03-Ext.',
  })
  await campo(LEG, {
    name: 'sello_sec',
    type: 'singleSelect',
    options: { choices: [{ name: 'vigente' }, { name: 'vencido' }, { name: 'no_aplica' }] },
    description: 'Sello verde SEC (sección F). no_aplica explícito en casas y deptos full eléctricos (RN-58).',
  })
  await campo(LEG, { name: 'sello_sec_id', type: 'singleLineText', description: 'N° / ID del sello verde SEC (sección F).' })
  await campo(LEG, {
    name: 'sello_sec_vencimiento',
    type: 'date',
    options: { dateFormat: { name: 'local' } },
    description: 'Vencimiento del sello verde SEC (sección F).',
  })

  /* --- 2. Filas existentes: prioridad · grupo · vigencia ------------------ */
  const ACTUALIZAR = [
    // inscripción de dominio (vigencia = año)
    ['recJEpVvzbmTqPERS', 40, 'inscripcion_dominio', false], // foto SII · foja_dominio
    ['rec0N9w1ejqQqKYcP', 40, 'inscripcion_dominio', false], // foto SII · numero_dominio
    ['recWg8kNBQK17CXOv', 40, 'inscripcion_dominio', true], //  foto SII · anio_dominio
    ['recVuIHWfVAjD3whc', 20, 'inscripcion_dominio', false], // CBR · foja_cbr
    ['recGRRp4Ore6k8m4y', 20, 'inscripcion_dominio', false], // CBR · numero_cbr
    ['recE2lOP4YMmn5ESq', 20, 'inscripcion_dominio', true], //  CBR · ano_inscripcion_cbr
    // permiso de edificación (vigencia = fecha)
    ['recwptFqK4coAC8IE', 10, 'permiso_edificacion', false], // permiso · numero_permiso
    ['recY8f0sBOO9Jhrxl', 10, 'permiso_edificacion', true], //  permiso · fecha_permiso
    ['recLXURPfI88MLl9q', 20, 'permiso_edificacion', false], // escritura · numero_permiso_edificacion
    ['rec5X2DwrNhg2aiPq', 20, 'permiso_edificacion', true], //  escritura · fecha_permiso_edificacion
    // recepción final (vigencia = fecha)
    ['recarhGDsmwNrXMbP', 10, 'recepcion_final', false], // recepción · numero_recepcion
    ['recEj5KnzpLvQkihi', 10, 'recepcion_final', true], //  recepción · fecha_recepcion
    ['recxiSvoLUSQGEclB', 20, 'recepcion_final', false], // escritura · numero_recepcion_final
    ['recUoL1UHzLihqMMK', 20, 'recepcion_final', true], //  escritura · fecha_recepcion_final
    // no expropiación y coordenadas (sin vigencia)
    ['recbYuBXQswE2YTyP', 10, 'no_expropiacion', false], // SERVIU · numero_documento
    ['recwJiTQmYxb9bxVa', 20, 'coordenadas', false], //     SERVIU · latitud
    ['rec6sJ0vyimcdMqlD', 20, 'coordenadas', false], //     SERVIU · longitud
  ]
  const SELLO = [
    ['recwNHxtLHQ2sYcPY', 'sello_sec_id', false], //        sello_verde_sec · numero_sello_sec
    ['recjkRLzMyZeDkXV5', 'sello_sec_vencimiento', true], // sello_verde_sec · fecha_vencimiento
  ]
  const updates = [
    ...ACTUALIZAR.map(([id, prioridad_destino, grupo_destino, vigencia_destino]) => ({
      id,
      fields: { prioridad_destino, grupo_destino, vigencia_destino },
    })),
    ...SELLO.map(([id, uso_campo_destino, vigencia_destino]) => ({
      id,
      fields: {
        uso_tabla_destino: 'TX_DocumentosLegales',
        uso_campo_destino,
        uso_cardinalidad_destino: 'una_por_solicitud',
        prioridad_destino: 10,
        grupo_destino: 'sello_sec',
        vigencia_destino,
      },
    })),
    // Decisión del panel (15-oct-2026): el formulario ya no los pide → no son faltantes.
    { id: 'recFQMPeD6ow4ikeq', fields: { obligatorio: false } }, // CBR · notaria
    { id: 'recLMXwCxkSfOFcJe', fields: { obligatorio: false } }, // CBR · comprador
  ]
  for (let i = 0; i < updates.length; i += 10) {
    const lote = updates.slice(i, i + 10)
    await api('PATCH', `${BASE}/${TDA}`, { records: lote, typecast: false })
    anotar(`filas actualizadas: ${lote.map((u) => u.id).join(', ')}`)
  }

  /* --- 3. Filas nuevas ---------------------------------------------------- */
  const TIPO = {
    escritura_compraventa: 'recX5FJFzAzXTXpzF',
    certificado_dominio_vigente: 'recL7LO77KpGK6ies',
    mapa_sii: 'recEgGc4ysrAAHVqZ',
  }
  const NOTA_CBR =
    "de la nota o certificado de inscripción del Conservador de Bienes Raíces: 'Inscrita a fojas 3312 número 4663 del Registro de Propiedad del año 2020'"
  const inscripcion = (tipo, prioridad, ordenBase) =>
    [
      ['foja_inscripcion', 'Foja de la inscripción de dominio (CBR)', 'Foja', 'text', 'fojas', false, `3312 (${NOTA_CBR})`],
      ['numero_inscripcion', 'Número de la inscripción de dominio (CBR)', 'Número', 'text', 'numero_inscripcion', false, `4663 (${NOTA_CBR})`],
      ['ano_inscripcion', 'Año de la inscripción de dominio (CBR)', 'Año', 'number', 'ano_inscripcion', true, `2020 (${NOTA_CBR})`],
    ].map(([cod, nombre, etiqueta, tipoDato, destino, vigencia, ejemplo], i) => ({
      codigo: `${tipo}__${cod}`,
      tipo_documento: [TIPO[tipo]],
      codigo_atributo: cod,
      nombre_atributo: nombre,
      etiqueta_local: etiqueta,
      tipo_dato: tipoDato,
      ejemplo_atributo: ejemplo,
      orden: ordenBase + i,
      obligatorio: false,
      uso_interfaz_tasador: true,
      uso_tabla_destino: 'TX_DocumentosLegales',
      uso_campo_destino: destino,
      uso_cardinalidad_destino: 'una_por_solicitud',
      prioridad_destino: prioridad,
      grupo_destino: 'inscripcion_dominio',
      vigencia_destino: vigencia,
    }))
  const coordenada = (cod, nombre, destino, ejemplo, orden) => ({
    codigo: `mapa_sii__${cod}`,
    tipo_documento: [TIPO.mapa_sii],
    codigo_atributo: cod,
    nombre_atributo: nombre,
    etiqueta_local: nombre,
    tipo_dato: 'number',
    ejemplo_atributo: ejemplo,
    orden,
    obligatorio: false,
    uso_interfaz_tasador: true,
    uso_tabla_destino: 'TX_DatosTasacion',
    uso_campo_destino: destino,
    uso_cardinalidad_destino: 'una_por_solicitud',
    prioridad_destino: 10,
    grupo_destino: 'coordenadas',
    vigencia_destino: false,
  })
  const NUEVAS = [
    ...inscripcion('escritura_compraventa', 30, 10),
    ...inscripcion('certificado_dominio_vigente', 10, 1),
    coordenada('latitud', 'Latitud', 'lat', '-33.23458 (grados decimales; negativa en Chile; no UTM)', 1),
    coordenada('longitud', 'Longitud', 'long', '-70.675087 (grados decimales; negativa en Chile; no UTM)', 2),
  ]
  const vivas = new Set()
  let offset
  do {
    const p = await api('GET', `${BASE}/${TDA}?fields%5B%5D=codigo${offset ? `&offset=${offset}` : ''}`)
    for (const r of p.records) vivas.add(r.fields.codigo)
    offset = p.offset
  } while (offset)
  const aCrear = NUEVAS.filter((n) => !vivas.has(n.codigo))
  for (const n of NUEVAS.filter((n) => vivas.has(n.codigo))) anotar(`fila ya existía: ${n.codigo}`)
  for (let i = 0; i < aCrear.length; i += 10) {
    const r = await api('POST', `${BASE}/${TDA}`, { records: aCrear.slice(i, i + 10).map((fields) => ({ fields })), typecast: false })
    for (const rec of r.records) anotar(`fila creada: ${rec.id} ${rec.fields.codigo}`)
  }

  /* --- 4. Backfill origen_dato ------------------------------------------- */
  // Sólo VP-2026-0079: sus valores coinciden uno a uno con lo leído por la foto SII, el permiso y
  // la recepción final. Las demás filas traen textos tipeados o de semilla («N°19 // 23-01-2014»,
  // «S/I») y A_Cambios no registra guardados: quedan sin origen (la v6 sólo rellena vacíos).
  await api('PATCH', `${BASE}/${LEG}`, {
    records: [{ id: 'rec4zGgDXFD4Ry7oH', fields: { origen_dato: 'extraido_rf09' } }],
    typecast: false,
  })
  anotar('backfill: TX_DocumentosLegales rec4zGgDXFD4Ry7oH (VP-2026-0079) origen_dato = extraido_rf09')
} catch (e) {
  anotar(`ERROR: ${e.message}`)
  process.exitCode = 1
} finally {
  fs.appendFileSync(new URL('apply-log.txt', AQUI), `${new Date().toISOString()}\n${log.join('\n')}\n`)
}
