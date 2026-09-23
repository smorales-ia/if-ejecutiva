// AT02_Asignar_Tasador (wflgFmIovhugw4q5x) — script LIVE draft
// Captura MCP get_automation 2026-09-23 (deploymentStatus=UNDEPLOYED, configurationStatus=valid).
// Trigger: recordMatchesConditions en TX_Solicitudes (estado=creada AND regla_aplicada isNotEmpty).
// FUERA DE ALCANCE IF-02 (REGLA A · D-15): la asignacion en IF-02 es manual via SC-Asignar (Make);
// IF-02 NO invoca AT02. Este volcado es documental (undeployed). Normalizado a LF.
// ============================================================
// AT02_v32 - Asignar tasador
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
// v32-2: Sin cambios funcionales en AT02; bump version y mensajes.
// v32-3: A_Eventos SIEMPRE recibe evento (PASS path garantizado).
// ============================================================

const tInicio = Date.now();
const AUTOMATION_ID = 'AT02';
const MOTOR_VERSION = 'AT02_v11.0_v32';

const { recordId } = input.config();

const tSolicitudes = base.getTable('TX_Solicitudes');
const tTasadores   = base.getTable('M_Tasadores');
const tComunas     = base.getTable('M_Comunas');
let   tEventos     = null;
try { tEventos = base.getTable('A_Eventos'); } catch (e) { tEventos = null; }

const FIELD_CANDIDATES = {
    automation_id     : ['automation_id', 'automation', 'auto_id', 'at_id'],
    version_motor     : ['version_motor', 'motor_version', 'version', 'script_version'],
    usuario_ejecutor  : ['usuario_ejecutor', 'usuario', 'ejecutor', 'user'],
    actor_tipo        : ['actor_tipo', 'tipo_actor', 'actor_kind'],
    actor_id          : ['actor_id', 'id_actor'],
    actor_nombre      : ['actor_nombre', 'nombre_actor', 'actor_name', 'actor'],
    timestamp         : ['timestamp', 'fecha_evento', 'fecha', 'created_at', 'fecha_creacion'],
    fecha_evento      : ['fecha_evento', 'timestamp', 'fecha'],
    duracion_ms       : ['duracion_ms', 'duracion', 'tiempo_ms', 'ms_duracion'],
    solicitud_link    : ['solicitud', 'TX_Solicitudes', 'solicitud_ref', 'link_solicitud', 'sol'],
    solicitud_id      : ['solicitud_id', 'record_id_solicitud', 'sol_id'],
    solicitud_codigo  : ['solicitud_codigo', 'nro_interno', 'codigo_solicitud', 'codigo'],
    estado_entrada    : ['estado_entrada', 'estado_in', 'estado_previo'],
    estado_salida     : ['estado_salida', 'estado_out', 'estado_nuevo'],
    tipo_evento       : ['tipo_evento', 'tipo', 'event_type', 'evento_tipo'],
    nombre_evento     : ['nombre_evento', 'nombre', 'evento', 'event_name', 'clave_evento'],
    resultado         : ['resultado', 'outcome', 'status'],
    severidad         : ['severidad', 'severity', 'nivel'],
    accion            : ['accion', 'action', 'operacion'],
    tabla_origen      : ['tabla_origen', 'origen', 'source_table'],
    tabla_destino     : ['tabla_destino', 'destino', 'target_table'],
    record_id_origen  : ['record_id_origen', 'record_id', 'source_id'],
    cliente_link      : ['cliente', 'M_Clientes', 'cliente_ref', 'link_cliente'],
    comuna_link       : ['comuna', 'M_Comunas', 'comuna_ref', 'link_comuna'],
    tasador_link      : ['tasador', 'M_Tasadores', 'tasador_ref', 'link_tasador'],
    regla_link        : ['regla_aplicada', 'regla', 'C_ReglasNegocio', 'link_regla'],
    mensaje           : ['descripcion', 'mensaje', 'message', 'detail', 'detalle'],
    detalle_json      : ['detalle_json', 'detalle', 'detail_json'],
    payload_json      : ['payload_json', 'payload', 'input_json'],
    error_stack       : ['error_stack', 'error', 'stack_trace'],
    clave_evento      : ['clave_evento'],
};

const COMPUTED_TYPES = ['formula','rollup','count','lookup','multipleLookupValues',
                        'createdTime','lastModifiedTime','createdBy','lastModifiedBy','autoNumber'];
const LINK_TYPES     = ['multipleRecordLinks'];
const SELECT_TYPES   = ['singleSelect', 'multipleSelects'];

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
const eventosSchema   = buildSchemaIndex(tEventos);
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
    return null; // v25: si la choice no existe -> omitimos campo
}

// v25: logEventoCompleto "minimal-first"
async function logEventoCompleto(ctx) {
    if (!tEventos) return null;
    const now = new Date().toISOString();
    const duracion = Date.now() - tInicio;
    const codigoStr = ctx.solicitud_codigo || ctx.solicitud_id || 'NO_COD';
    const mensajeBase = '[COD=' + codigoStr + '] ' + (ctx.mensaje || '');
    const tipoEv      = ctx.tipo_evento  || 'at02_tasador';
    const nombreEv    = ctx.nombre_evento || ('AT02_' + (ctx.resultado || 'evento'));
    const severidad   = ctx.severidad    || 'info';

    const minimalMap = {};
    const msgFld = resolveField('mensaje', eventosSchema);
    if (msgFld && (msgFld.type === 'singleLineText' || msgFld.type === 'multilineText' || msgFld.type === 'richText')) {
        minimalMap[msgFld.name] = mensajeBase.substring(0, 95000);
    }
    const tipoFld = resolveField('tipo_evento', eventosSchema);
    if (tipoFld) {
        if (tipoFld.type === 'singleSelect') {
            const v = valueForSelect(tipoFld.name, tipoEv, eventosSchema);
            if (v) minimalMap[tipoFld.name] = v;
        } else if (tipoFld.type === 'singleLineText' || tipoFld.type === 'multilineText') {
            minimalMap[tipoFld.name] = String(tipoEv);
        }
    }
    const sevFld = resolveField('severidad', eventosSchema);
    if (sevFld) {
        if (sevFld.type === 'singleSelect') {
            const v = valueForSelect(sevFld.name, severidad, eventosSchema);
            if (v) minimalMap[sevFld.name] = v;
        } else if (sevFld.type === 'singleLineText' || sevFld.type === 'multilineText') {
            minimalMap[sevFld.name] = String(severidad);
        }
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
        console.log('  A_Eventos[AT02] OK minimal -> ' + createdId);
    } catch (e1) {
        const ultraMin = {};
        for (const fname of eventosSchema.names) {
            const t = eventosSchema.byName[fname];
            if (t === 'singleLineText' || t === 'multilineText' || t === 'richText') {
                ultraMin[fname] = mensajeBase + ' | tipo=' + tipoEv;
                break;
            }
        }
        try {
            createdId = await tEventos.createRecordAsync(ultraMin);
            console.log('  A_Eventos[AT02] OK ultramin -> ' + createdId);
        } catch (e2) {
            console.log('  ERROR A_Eventos[AT02]: ' + e2.message);
            return null;
        }
    }
    if (createdId) {
        const updMap = {};
        const conceptos = {
            automation_id: AUTOMATION_ID, version_motor: MOTOR_VERSION,
            usuario_ejecutor: 'automation:' + AUTOMATION_ID,
            actor_tipo: 'automation', actor_id: AUTOMATION_ID,
            actor_nombre: 'AT02_asignar_tasador',
            timestamp: now, fecha_evento: now, duracion_ms: duracion,
            solicitud_id: ctx.solicitud_id, solicitud_codigo: codigoStr,
            estado_entrada: ctx.estado_entrada, estado_salida: ctx.estado_salida,
            nombre_evento: nombreEv,
            resultado: ctx.resultado, accion: ctx.accion,
            tabla_origen: ctx.tabla_origen || 'TX_Solicitudes',
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
        const links = {
            solicitud_link: ctx.solicitud_link, cliente_link: ctx.cliente_link,
            comuna_link: ctx.comuna_link, tasador_link: ctx.tasador_link, regla_link: ctx.regla_link,
        };
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
// 1. Cargar solicitud
// ----------------------------------------------------------------
const sol = await tSolicitudes.selectRecordAsync(recordId, {
    fields: ['estado', 'nro_interno', 'codigo_solicitud', 'cliente', 'comuna',
             'tasador', 'tipo_informe', 'regla_aplicada']
});
if (!sol) { console.log('ERROR: Solicitud no encontrada: ' + recordId); return; }

const estadoEntrada = sol.getCellValueAsString('estado');
if (estadoEntrada !== 'creada') {
    console.log('OMITIDO: estado=' + estadoEntrada + ' (no es creada)');
    return;
}

const codigo = sol.getCellValueAsString('nro_interno') || sol.getCellValueAsString('codigo_solicitud') || recordId;
console.log('[AT02_v27] Procesando: ' + codigo);

const cliLnk = sol.getCellValue('cliente');
const comLnk = sol.getCellValue('comuna');
const cliId  = (Array.isArray(cliLnk) && cliLnk.length > 0) ? cliLnk[0].id : null;
const comId  = (Array.isArray(comLnk) && comLnk.length > 0) ? comLnk[0].id : null;
const regAct = sol.getCellValue('regla_aplicada');
const regId  = (Array.isArray(regAct) && regAct.length > 0) ? regAct[0].id : null;

const ctxBase = {
    solicitud_link: recordId, solicitud_id: recordId, solicitud_codigo: String(codigo),
    estado_entrada: estadoEntrada, cliente_link: cliId, comuna_link: comId, regla_link: regId,
};

// Prerequisito AT01
if (!regAct || (Array.isArray(regAct) && regAct.length === 0)) {
    console.log('OMITIDO: regla_aplicada vacio -> AT01 aun no completo');
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida: estadoEntrada, resultado: 'omitido_at01_pendiente',
        tipo_evento: 'at02_tasador_omitido', nombre_evento: 'AT02 omitido (espera AT01)',
        accion: 'OMITIDO', severidad: 'warning',
        mensaje: 'AT02 no puede asignar tasador porque AT01 no ha resuelto regla',
    }));
    return;
}

// Override manual
const tasadorActual = sol.getCellValue('tasador');
if (tasadorActual && Array.isArray(tasadorActual) && tasadorActual.length > 0) {
    const tasadorIdManual = tasadorActual[0].id;
    console.log('[' + codigo + '] Tasador ya asignado (override manual)');
    const updates = { 'estado': 'asignada' };
    const FECHA_CANDIDATES = ['fecha_asignacion', 'fecha_asignado', 'asignacion_timestamp', 'timestamp_asignacion'];
    for (const fc of FECHA_CANDIDATES) {
        if (solicitudSchema.names.indexOf(fc) >= 0 && COMPUTED_TYPES.indexOf(solicitudSchema.byName[fc]) < 0) {
            updates[fc] = new Date().toISOString(); break;
        }
    }
    await tSolicitudes.updateRecordAsync(recordId, updates);
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida: 'asignada', resultado: 'tasador_asignacion_manual',
        tipo_evento: 'at02_tasador_asignado', nombre_evento: 'AT02 Tasador asignado (override manual)',
        accion: 'TRANSITION', severidad: 'info',
        mensaje: 'Tasador previo respetado (override manual)',
        tabla_destino: 'TX_Solicitudes', tasador_link: tasadorIdManual,
        detalle_json: JSON.stringify({ tasador_id: tasadorIdManual, modo: 'manual' }),
    }));
    return;
}

// Sin comuna
if (!comLnk || (Array.isArray(comLnk) && comLnk.length === 0)) {
    await tSolicitudes.updateRecordAsync(recordId, { 'estado': 'requiere_atencion' });
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida: 'requiere_atencion', resultado: 'sin_comuna',
        tipo_evento: 'at02_tasador_error', nombre_evento: 'AT02 sin comuna',
        accion: 'TRANSITION', severidad: 'critical',
        mensaje: 'Solicitud sin comuna: imposible buscar tasadores por zona.',
    }));
    return;
}

const comunaRec = await tComunas.selectRecordAsync(comId, { fields: ['nombre'] });
const comunaNombre = comunaRec ? comunaRec.getCellValueAsString('nombre') : '';
console.log('  Comuna: ' + comunaNombre);

function normalize(s) {
    if (!s) return '';
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}
const comunaNorm = normalize(comunaNombre);

const qTasadores = await tTasadores.selectRecordsAsync({
    fields: ['nombre', 'zonas_cobertura', 'capacidad_activa', 'activo', 'tasaciones_mes']
});
const candidatos = [];
for (const t of qTasadores.records) {
    if (t.getCellValue('activo') === false) continue;
    const zonas = t.getCellValueAsString('zonas_cobertura') || '';
    if (!zonas) continue;
    const partes = zonas.split(/[,;]/).map(s => normalize(s));
    if (partes.some(z => z === comunaNorm)) {
        candidatos.push({
            id: t.id, nombre: t.getCellValueAsString('nombre'),
            capacidad: parseInt(t.getCellValue('capacidad_activa') || 20),
            tasaciones_mes: parseInt(t.getCellValue('tasaciones_mes') || 0),
        });
    }
}
console.log('  Candidatos para "' + comunaNombre + '": ' + candidatos.length);

if (candidatos.length === 0) {
    await tSolicitudes.updateRecordAsync(recordId, { 'estado': 'requiere_atencion' });
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida: 'requiere_atencion', resultado: 'sin_tasador_disponible',
        tipo_evento: 'at02_tasador_error', nombre_evento: 'AT02 sin tasador para ' + comunaNombre,
        accion: 'TRANSITION', severidad: 'critical',
        mensaje: 'Ningun tasador activo cubre la comuna ' + comunaNombre,
        detalle_json: JSON.stringify({ comuna: comunaNombre, tasadores_evaluados: qTasadores.records.length }),
    }));
    return;
}

candidatos.sort((a, b) => a.tasaciones_mes - b.tasaciones_mes || b.capacidad - a.capacidad);
const elegido = candidatos[0];
console.log('  Tasador elegido: ' + elegido.nombre + ' (carga=' + elegido.tasaciones_mes + ')');

const ahora = new Date().toISOString();
const updates = { 'tasador': [{ id: elegido.id }], 'estado': 'asignada' };
const FECHA_CANDIDATES = ['fecha_asignacion', 'fecha_asignado', 'asignacion_timestamp', 'timestamp_asignacion'];
let fechaFieldWritten = null;
for (const fc of FECHA_CANDIDATES) {
    if (solicitudSchema.names.indexOf(fc) >= 0 && COMPUTED_TYPES.indexOf(solicitudSchema.byName[fc]) < 0) {
        updates[fc] = ahora; fechaFieldWritten = fc; break;
    }
}
await tSolicitudes.updateRecordAsync(recordId, updates);

await logEventoCompleto(Object.assign({}, ctxBase, {
    estado_salida: 'asignada', resultado: 'tasador_asignado_ok',
    tipo_evento: 'at02_tasador_asignado', nombre_evento: 'AT02 Tasador asignado: ' + elegido.nombre,
    accion: 'UPDATE+TRANSITION', severidad: 'info',
    mensaje: 'AT02 asignacion tasador ' + elegido.nombre + ' a comuna ' + comunaNombre +
             ' (carga=' + elegido.tasaciones_mes + '/' + elegido.capacidad + ')',
    tabla_destino: 'TX_Solicitudes', tasador_link: elegido.id,
    detalle_json: JSON.stringify({
        tasador_id: elegido.id, tasador_nombre: elegido.nombre,
        comuna: comunaNombre, candidatos_total: candidatos.length,
        carga_actual: elegido.tasaciones_mes, capacidad: elegido.capacidad,
        fecha_field: fechaFieldWritten, modo: 'automatica_zona',
    }),
    payload_json: JSON.stringify({
        comuna: comunaNombre,
        candidatos_top3: candidatos.slice(0, 3).map(c => ({
            id: c.id, nombre: c.nombre, carga: c.tasaciones_mes, capacidad: c.capacidad,
        })),
    }),
}));

console.log('[AT02_v27] FIN OK -- ' + (Date.now() - tInicio) + ' ms');
