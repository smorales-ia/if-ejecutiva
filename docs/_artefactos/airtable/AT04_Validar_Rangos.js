// AT04_Validar_Rangos (wflNt78DONF9kZi9K) — script LIVE draft
// Captura MCP get_automation 2026-09-23 (deploymentStatus=UNDEPLOYED, configurationStatus=valid).
// Trigger: recordCreated en TX_Calculos (tblFz37KSvn5pLKDR). Normalizado a LF.
// ============================================================
// AT04_v32 - Validar rangos
// Version    : 11.0 (v32)
//
// CAMBIOS v31 -> v32
// -------------------------------------------------------
// v32-1: Compatible con C_Formulas_v32 (13 formulas terminales)
//        y schema TX_Solicitudes reducido a 5 campos override:
//          - valor_final_override       (Valor Comercial UF)
//          - valor_reposicion_override  (Valor de Reposicion UF)
//          - valor_seguro_override      (Seguro Incendio UF)
//          - override_motivo, override_autor (audit)
// v32-2: Sin cambios funcionales en AT04; bump version y mensajes.
// v32-3: A_Eventos SIEMPRE recibe evento (PASS path garantizado).
// ============================================================

const tInicio = Date.now();
const AUTOMATION_ID = 'AT04';
const MOTOR_VERSION = 'AT04_v11.0_v32';

const { recordId } = input.config();

const tSolicitudes = base.getTable('TX_Solicitudes');
const tCalculos    = base.getTable('TX_Calculos');
let tComunas = null, tClientes = null, tEventos = null;
try { tComunas  = base.getTable('M_Comunas'); } catch (e) {}
try { tClientes = base.getTable('M_Clientes'); } catch (e) {}
try { tEventos  = base.getTable('A_Eventos'); } catch (e) {}

const FIELD_CANDIDATES = {
    automation_id: ['automation_id','automation','auto_id','at_id'],
    version_motor: ['version_motor','motor_version','version','script_version'],
    usuario_ejecutor: ['usuario_ejecutor','usuario','ejecutor','user'],
    actor_tipo: ['actor_tipo','tipo_actor','actor_kind'],
    actor_id: ['actor_id','id_actor'],
    actor_nombre: ['actor_nombre','nombre_actor','actor_name','actor'],
    timestamp: ['timestamp','fecha_evento','fecha','created_at','fecha_creacion'],
    fecha_evento: ['fecha_evento','timestamp','fecha'],
    duracion_ms: ['duracion_ms','duracion','tiempo_ms','ms_duracion'],
    solicitud_link: ['solicitud','TX_Solicitudes','solicitud_ref','link_solicitud','sol'],
    solicitud_id: ['solicitud_id','record_id_solicitud','sol_id'],
    solicitud_codigo: ['solicitud_codigo','nro_interno','codigo_solicitud','codigo'],
    estado_entrada: ['estado_entrada','estado_in','estado_previo'],
    estado_salida: ['estado_salida','estado_out','estado_nuevo'],
    tipo_evento: ['tipo_evento','tipo','event_type','evento_tipo'],
    nombre_evento: ['nombre_evento','nombre','evento','event_name','clave_evento'],
    resultado: ['resultado','outcome','status'],
    severidad: ['severidad','severity','nivel'],
    accion: ['accion','action','operacion'],
    tabla_origen: ['tabla_origen','origen','source_table'],
    tabla_destino: ['tabla_destino','destino','target_table'],
    record_id_origen: ['record_id_origen','record_id','source_id'],
    cliente_link: ['cliente','M_Clientes','cliente_ref','link_cliente'],
    comuna_link: ['comuna','M_Comunas','comuna_ref','link_comuna'],
    tasador_link: ['tasador','M_Tasadores','tasador_ref','link_tasador'],
    regla_link: ['regla_aplicada','regla','C_ReglasNegocio','link_regla'],
    mensaje: ['descripcion','mensaje','message','detail','detalle'],
    detalle_json: ['detalle_json','detalle','detail_json'],
    payload_json: ['payload_json','payload','input_json'],
    error_stack: ['error_stack','error','stack_trace'],
    clave_evento: ['clave_evento'],
};

const COMPUTED_TYPES = ['formula','rollup','count','lookup','multipleLookupValues',
    'createdTime','lastModifiedTime','createdBy','lastModifiedBy','autoNumber'];
const LINK_TYPES = ['multipleRecordLinks'];
const SELECT_TYPES = ['singleSelect','multipleSelects'];

function buildSchemaIndex(table) {
    const idx = { names: [], byName: {}, options: {} };
    if (!table) return idx;
    for (const f of table.fields) {
        idx.names.push(f.name);
        idx.byName[f.name] = f.type;
        if (SELECT_TYPES.indexOf(f.type) >= 0) {
            const choices = (f.options && f.options.choices) ? f.options.choices : [];
            idx.options[f.name] = choices.map(c => String(c.name).trim());
        }
    }
    return idx;
}
const eventosSchema = buildSchemaIndex(tEventos);
const solicitudSchema = buildSchemaIndex(tSolicitudes);

function resolveField(concept, schemaIdx) {
    const candidates = FIELD_CANDIDATES[concept] || [concept];
    for (const c of candidates) {
        if (schemaIdx.names.indexOf(c) >= 0) {
            const t = schemaIdx.byName[c];
            if (COMPUTED_TYPES.indexOf(t) >= 0) continue;
            return { name: c, type: t };
        }
    }
    return null;
}
function valueForSelect(field, value, schemaIdx) {
    if (value == null) return null;
    const choices = schemaIdx.options[field] || [];
    if (choices.length === 0) return String(value);
    const valStr = String(value).trim();
    if (choices.indexOf(valStr) >= 0) return valStr;
    const lc = valStr.toLowerCase();
    for (const c of choices) if (c.toLowerCase() === lc) return c;
    return null;
}

async function logEventoCompleto(ctx) {
    if (!tEventos) return null;
    const now = new Date().toISOString();
    const duracion = Date.now() - tInicio;
    const codigoStr = ctx.solicitud_codigo || ctx.solicitud_id || 'NO_COD';
    const mensajeBase = '[COD=' + codigoStr + '] ' + (ctx.mensaje || '');
    const tipoEv = ctx.tipo_evento || 'at04_validacion';
    const nombreEv = ctx.nombre_evento || 'AT04_evento';
    const severidad = ctx.severidad || 'info';

    const minimalMap = {};
    const msgFld = resolveField('mensaje', eventosSchema);
    if (msgFld && (msgFld.type === 'singleLineText' || msgFld.type === 'multilineText' || msgFld.type === 'richText')) {
        minimalMap[msgFld.name] = mensajeBase.substring(0, 95000);
    }
    const tipoFld = resolveField('tipo_evento', eventosSchema);
    if (tipoFld) {
        if (tipoFld.type === 'singleSelect') { const v = valueForSelect(tipoFld.name, tipoEv, eventosSchema); if (v) minimalMap[tipoFld.name] = v; }
        else if (tipoFld.type === 'singleLineText' || tipoFld.type === 'multilineText') minimalMap[tipoFld.name] = String(tipoEv);
    }
    const sevFld = resolveField('severidad', eventosSchema);
    if (sevFld) {
        if (sevFld.type === 'singleSelect') { const v = valueForSelect(sevFld.name, severidad, eventosSchema); if (v) minimalMap[sevFld.name] = v; }
        else if (sevFld.type === 'singleLineText' || sevFld.type === 'multilineText') minimalMap[sevFld.name] = String(severidad);
    }
    const claveFld = resolveField('clave_evento', eventosSchema);
    if (claveFld && (claveFld.type === 'singleLineText' || claveFld.type === 'multilineText')) {
        minimalMap[claveFld.name] = AUTOMATION_ID + '_' + codigoStr + '_' + Date.now();
    }
    const actorFld = resolveField('actor_nombre', eventosSchema);
    if (actorFld && (actorFld.type === 'singleLineText' || actorFld.type === 'multilineText')) {
        minimalMap[actorFld.name] = 'automation:' + AUTOMATION_ID;
    }

    let createdId = null;
    try {
        createdId = await tEventos.createRecordAsync(minimalMap);
        console.log('  A_Eventos[AT04] OK minimal -> ' + createdId);
    } catch (e1) {
        const ultraMin = {};
        for (const fname of eventosSchema.names) {
            const t = eventosSchema.byName[fname];
            if (t === 'singleLineText' || t === 'multilineText' || t === 'richText') {
                ultraMin[fname] = mensajeBase + ' | tipo=' + tipoEv; break;
            }
        }
        try { createdId = await tEventos.createRecordAsync(ultraMin); }
        catch (e2) { console.log('  ERROR A_Eventos[AT04]: ' + e2.message); return null; }
    }
    if (createdId) {
        const updMap = {};
        const conceptos = {
            automation_id: AUTOMATION_ID, version_motor: MOTOR_VERSION,
            usuario_ejecutor: 'automation:' + AUTOMATION_ID,
            actor_tipo: 'automation', actor_id: AUTOMATION_ID,
            actor_nombre: 'AT04_validar_rangos_valor',
            timestamp: now, fecha_evento: now, duracion_ms: duracion,
            solicitud_id: ctx.solicitud_id, solicitud_codigo: codigoStr,
            estado_entrada: ctx.estado_entrada, estado_salida: ctx.estado_salida,
            nombre_evento: nombreEv, resultado: ctx.resultado, accion: ctx.accion,
            tabla_origen: ctx.tabla_origen || 'TX_Calculos',
            tabla_destino: ctx.tabla_destino, record_id_origen: ctx.solicitud_link,
            detalle_json: ctx.detalle_json, payload_json: ctx.payload_json,
        };
        for (const c of Object.keys(conceptos)) {
            const val = conceptos[c];
            if (val === null || val === undefined || val === '') continue;
            const res = resolveField(c, eventosSchema);
            if (!res) continue;
            if (minimalMap[res.name] !== undefined) continue;
            let writeVal = val;
            if (res.type === 'singleSelect') { const v = valueForSelect(res.name, val, eventosSchema); if (!v) continue; writeVal = v; }
            else if (res.type === 'multipleSelects') { const v = valueForSelect(res.name, val, eventosSchema); if (!v) continue; writeVal = [v]; }
            else if (res.type === 'number' || res.type === 'currency') { const n = parseFloat(val); writeVal = isNaN(n) ? null : n; }
            else if (res.type === 'checkbox') writeVal = !!val;
            else if (res.type === 'dateTime' || res.type === 'date') writeVal = val;
            else writeVal = String(val).substring(0, 95000);
            if (writeVal !== null && writeVal !== undefined) updMap[res.name] = writeVal;
        }
        const links = { solicitud_link: ctx.solicitud_link, cliente_link: ctx.cliente_link,
                        comuna_link: ctx.comuna_link, tasador_link: ctx.tasador_link, regla_link: ctx.regla_link };
        for (const c of Object.keys(links)) {
            const recId = links[c];
            if (!recId) continue;
            const res = resolveField(c, eventosSchema);
            if (!res) continue;
            if (LINK_TYPES.indexOf(res.type) >= 0) updMap[res.name] = [{ id: recId }];
        }
        if (Object.keys(updMap).length > 0) {
            try { await tEventos.updateRecordAsync(createdId, updMap); }
            catch (e) {
                const justLinks = {};
                for (const k of Object.keys(updMap)) if (LINK_TYPES.indexOf(eventosSchema.byName[k]) >= 0) justLinks[k] = updMap[k];
                if (Object.keys(justLinks).length > 0) {
                    try { await tEventos.updateRecordAsync(createdId, justLinks); } catch (e2) {}
                }
            }
        }
    }
    return createdId;
}

// ----------------------------------------------------------------
// 1. Detectar trigger source
// ----------------------------------------------------------------
const VARS_TERMINAL = [
    // v32 variables (C_Formulas_v32.csv)
    'valor_comercial_uf', 'valor_comercial_clp',
    'valor_reposicion_uf', 'valor_reposicion_clp',
    'seguro_incendio_uf', 'seguro_incendio_clp',
    'avaluo_fiscal_uf',
    'valor_remate_uf', 'valor_remate_clp',
    'valor_liquidacion_uf', 'valor_liquidacion_clp',
    'ingreso_liquido_anual_clp', 'renta_perpetua_clp',
    // v31 legados
    'valor_calculado_uf', 'valor_garantia_uf', 'renta_perpetua_uf',
    'valor_seguro_uf', 'valor_edificacion_uf',
];

let triggerSource = 'unknown';
let solId = null;
let valoresAEvaluar = [];
let solRec = null;
let calcRec = null;
let triggeredVar = '';

try {
    calcRec = await tCalculos.selectRecordAsync(recordId, {
        fields: ['solicitud', 'solicitud_codigo', 'formula_nombre', 'variable_output', 'resultado']
    });
} catch (e) {}

if (calcRec) {
    triggerSource = 'TX_Calculos';
    triggeredVar = calcRec.getCellValueAsString('variable_output');
    const formula = calcRec.getCellValueAsString('formula_nombre');
    const resultado = parseFloat(calcRec.getCellValue('resultado')) || 0;
    const solLink = calcRec.getCellValue('solicitud');
    if (!solLink || !Array.isArray(solLink) || solLink.length === 0) {
        console.log('ERROR: TX_Calculos sin solicitud'); return;
    }
    solId = solLink[0].id;
    valoresAEvaluar.push({ variable: triggeredVar, resultado, calc_id: recordId, formula });
    solRec = await tSolicitudes.selectRecordAsync(solId, {
        fields: ['estado', 'nro_interno', 'codigo_solicitud', 'cliente', 'comuna',
                 'monto_estimado_uf', 'tipo_propiedad', 'tasador', 'regla_aplicada']
    });
    console.log('[AT04_v32] Trigger TX_Calculos var=' + triggeredVar + ' valor=' + resultado);
} else {
    try {
        solRec = await tSolicitudes.selectRecordAsync(recordId, {
            fields: ['estado', 'nro_interno', 'codigo_solicitud', 'cliente', 'comuna',
                     'monto_estimado_uf', 'tipo_propiedad', 'tasador', 'regla_aplicada']
        });
    } catch (e) {}
    if (solRec) {
        triggerSource = 'TX_Solicitudes';
        solId = recordId;
        const estadoSol = solRec.getCellValueAsString('estado');
        if (estadoSol !== 'calculada' && estadoSol !== 'revision') {
            console.log('OMITIDO: TX_Solicitudes.estado=' + estadoSol); return;
        }
        const allCalc = await tCalculos.selectRecordsAsync({
            fields: ['solicitud', 'solicitud_codigo', 'formula_nombre', 'variable_output', 'resultado']
        });
        for (const c of allCalc.records) {
            const link = c.getCellValue('solicitud');
            if (!(link && Array.isArray(link) && link.some(s => s.id === solId))) continue;
            const v = c.getCellValueAsString('variable_output');
            if (VARS_TERMINAL.indexOf(v) < 0) continue;
            valoresAEvaluar.push({
                variable: v, resultado: parseFloat(c.getCellValue('resultado')) || 0, calc_id: c.id,
            });
        }
        console.log('[AT04_v32] Trigger TX_Solicitudes (fallback). ' + valoresAEvaluar.length + ' valores.');
    } else {
        console.log('ERROR: recordId no es TX_Calculos ni TX_Solicitudes'); return;
    }
}

if (!solRec) { console.log('ERROR: solicitud no encontrada'); return; }

// ----------------------------------------------------------------
// 2. Contexto
// ----------------------------------------------------------------
const codigo = solRec.getCellValueAsString('nro_interno') || solRec.getCellValueAsString('codigo_solicitud') || solId;
const estadoEntrada = solRec.getCellValueAsString('estado');
const cliLnk = solRec.getCellValue('cliente');
const comLnk = solRec.getCellValue('comuna');
const tasLnk = solRec.getCellValue('tasador');
const regLnk = solRec.getCellValue('regla_aplicada');
const cliId = (Array.isArray(cliLnk) && cliLnk.length > 0) ? cliLnk[0].id : null;
const comId = (Array.isArray(comLnk) && comLnk.length > 0) ? comLnk[0].id : null;
const tasId = (Array.isArray(tasLnk) && tasLnk.length > 0) ? tasLnk[0].id : null;
const regId = (Array.isArray(regLnk) && regLnk.length > 0) ? regLnk[0].id : null;

const ctxBase = {
    solicitud_link: solId, solicitud_id: solId, solicitud_codigo: String(codigo),
    estado_entrada: estadoEntrada, cliente_link: cliId, comuna_link: comId,
    tasador_link: tasId, regla_link: regId, tabla_origen: triggerSource,
};

// v25-3: aunque sea trigger no-terminal, registramos evento de tracking
if (valoresAEvaluar.length === 0 || (triggerSource === 'TX_Calculos' && VARS_TERMINAL.indexOf(triggeredVar) < 0)) {
    console.log('[AT04_v32] Sin variables terminales aun. Evento informativo.');
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida: estadoEntrada, resultado: 'omitido_variable_no_terminal',
        tipo_evento: 'at04_validacion_omitida',
        nombre_evento: 'AT04 validacion omitida (' + triggeredVar + ')',
        accion: 'OMITIDO', severidad: 'info',
        mensaje: 'AT04 trigger por TX_Calculos[' + triggeredVar + '] no terminal. Esperando ' + VARS_TERMINAL.join(','),
        detalle_json: JSON.stringify({ trigger_source: triggerSource, triggered_var: triggeredVar }),
    }));
    return;
}

console.log('[AT04_v32] Validando ' + codigo + ' (trigger=' + triggerSource + ' valores=' + valoresAEvaluar.length + ')');

// ----------------------------------------------------------------
// 3. Cargar rangos comuna + umbral cliente
// ----------------------------------------------------------------
let rango_min = null, rango_max = null, comunaNombre = '';
if (tComunas && comId) {
    try {
        const comRec = await tComunas.selectRecordAsync(comId, {
            fields: ['rango_min_uf_m2', 'rango_max_uf_m2', 'uf_m2_promedio_residencial', 'nombre']
        });
        if (comRec) {
            rango_min = parseFloat(comRec.getCellValue('rango_min_uf_m2'));
            rango_max = parseFloat(comRec.getCellValue('rango_max_uf_m2'));
            comunaNombre = comRec.getCellValueAsString('nombre');
        }
    } catch (e) {}
}
let monto_umbral = null, clienteNombre = '';
if (tClientes && cliId) {
    try {
        const cliRec = await tClientes.selectRecordAsync(cliId, {
            fields: ['monto_umbral_uf', 'nombre']
        });
        if (cliRec) {
            monto_umbral = parseFloat(cliRec.getCellValue('monto_umbral_uf'));
            clienteNombre = cliRec.getCellValueAsString('nombre');
        }
    } catch (e) {}
}
const monto = parseFloat(solRec.getCellValue('monto_estimado_uf')) || 0;
console.log('  comuna=' + comunaNombre + ' rango=[' + rango_min + ',' + rango_max + ']' +
            ' | cliente=' + clienteNombre + ' umbral=' + monto_umbral + ' monto=' + monto);

// ----------------------------------------------------------------
// 4. Evaluar valores
// ----------------------------------------------------------------
let fuera_de_rango = false;
const detalleValidacion = [];

for (const v of valoresAEvaluar) {
    let dentro = true;
    if (!isNaN(rango_min) && !isNaN(rango_max) && rango_min > 0 && rango_max > 0) {
        if (v.variable === 'valor_comercial_uf' || v.variable === 'valor_calculado_uf') {
            const limInf = rango_min * 30;
            const limSup = rango_max * 500;
            if (v.resultado < limInf || v.resultado > limSup) { dentro = false; fuera_de_rango = true; }
        }
    }
    detalleValidacion.push({ variable: v.variable, resultado: v.resultado, dentro_rango: dentro });
}

let requiere_aprobacion_final = false;
if (!isNaN(monto_umbral) && monto_umbral > 0 && monto > monto_umbral) requiere_aprobacion_final = true;
console.log('  fuera_de_rango=' + fuera_de_rango + ' requiere_aprob=' + requiere_aprobacion_final);

// ----------------------------------------------------------------
// 5. Escribir flags en TX_Solicitudes
// ----------------------------------------------------------------
const updates = {};
const writableFlag = (n) => solicitudSchema.names.indexOf(n) >= 0 &&
                            COMPUTED_TYPES.indexOf(solicitudSchema.byName[n]) < 0;

if (writableFlag('fuera_de_rango'))            updates['fuera_de_rango'] = fuera_de_rango;
if (writableFlag('flag_revision'))             updates['flag_revision'] = fuera_de_rango;
if (writableFlag('requiere_aprobacion_final')) updates['requiere_aprobacion_final'] = requiere_aprobacion_final;
if (writableFlag('at04_validado'))             updates['at04_validado'] = true;

const TS_CANDIDATES = ['at04_timestamp', 'at04_ts', 'fecha_at04', 'validacion_timestamp'];
for (const tsc of TS_CANDIDATES) {
    if (writableFlag(tsc)) { updates[tsc] = new Date().toISOString(); break; }
}

let estadoSalida = estadoEntrada;
// v32: si el trigger es TX_Calculos con la primer variable terminal Y el estado
//      sigue siendo 'visitada' o 'asignada', avanzamos a 'calculada'. Esto cierra
//      la cascada AT01 → AT02 → AT03 → AT04 (que era el FALLO en v31).
if (writableFlag('estado')) {
    if (fuera_de_rango && estadoEntrada === 'calculada') {
        updates['estado'] = 'revision'; estadoSalida = 'revision';
    } else if ((estadoEntrada === 'visitada' || estadoEntrada === 'asignada') &&
               triggerSource === 'TX_Calculos' && VARS_TERMINAL.indexOf(triggeredVar) >= 0 &&
               !fuera_de_rango) {
        updates['estado'] = 'calculada'; estadoSalida = 'calculada';
    }
}

if (Object.keys(updates).length > 0) {
    try {
        await tSolicitudes.updateRecordAsync(solId, updates);
        console.log('  TX_Solicitudes update OK: ' + JSON.stringify(updates));
    } catch (e) { console.log('  WARN updateSolicitud: ' + e.message); }
}

const tiempoMs = Date.now() - tInicio;
const resultadoLabel = fuera_de_rango ? 'fuera_de_rango' :
                       (requiere_aprobacion_final ? 'requiere_aprobacion_final' : 'aprobado');

// ----------------------------------------------------------------
// 6. A_Eventos COMPLETO (SIEMPRE)
// ----------------------------------------------------------------
await logEventoCompleto(Object.assign({}, ctxBase, {
    estado_salida: estadoSalida, resultado: resultadoLabel,
    tipo_evento: 'at04_validacion',
    nombre_evento: 'AT04 validacion (' + resultadoLabel + ')',
    accion: 'UPDATE' + (estadoSalida !== estadoEntrada ? '+TRANSITION' : ''),
    severidad: fuera_de_rango ? 'warning' : 'info',
    mensaje: 'AT04 validacion ' + resultadoLabel + ' trigger=' + triggerSource +
             ' valores=' + valoresAEvaluar.length + ' fuera_rango=' + fuera_de_rango +
             ' aprob=' + requiere_aprobacion_final +
             ' (var=' + triggeredVar + ' val=' + (valoresAEvaluar[0] ? valoresAEvaluar[0].resultado : 'n/a') + ')',
    tabla_destino: 'TX_Solicitudes',
    detalle_json: JSON.stringify({
        trigger_source: triggerSource, triggered_var: triggeredVar,
        valores: detalleValidacion, rango_min, rango_max,
        monto, monto_umbral, fuera_de_rango, requiere_aprobacion_final,
        comuna: comunaNombre, cliente: clienteNombre,
        campos_escritos: Object.keys(updates),
    }),
    payload_json: JSON.stringify({
        valores_evaluados: valoresAEvaluar.length,
        flags_escritos: Object.keys(updates),
    }),
}));

console.log('[AT04_v32] FIN OK -- ' + tiempoMs + ' ms -- ' + resultadoLabel);
