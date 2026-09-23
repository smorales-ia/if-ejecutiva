// AT01_Motor_Reglas (wflY6ytBBJSdwYskI) — script LIVE / DEPLOYED
// Captura MCP get_automation 2026-09-23 (deploymentStatus=deployed, configurationStatus=valid).
// Normalizado a LF. Rollback: si se publica algo, reimportar en UI la version previa.
// ============================================================
// AT01_v32 - Aplicar regla
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
// v32-2: Sin cambios funcionales en AT01; bump version y mensajes.
// v32-3: A_Eventos SIEMPRE recibe evento (PASS path garantizado).
// ============================================================

const tInicio = Date.now();
const AUTOMATION_ID = 'AT01';
const MOTOR_VERSION = 'AT01_v12.0_v30';

const { recordId } = input.config();

const tSolicitudes = base.getTable('TX_Solicitudes');
const tReglas      = base.getTable('C_ReglasNegocio');
const tDecisiones  = base.getTable('A_DecisionesMotor');
const tClientes    = base.getTable('M_Clientes');
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

const eventosSchema = buildSchemaIndex(tEventos);
console.log('[AT01_v27] A_Eventos schema fields=' + eventosSchema.names.length +
            ' [' + eventosSchema.names.join(',') + ']');

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
    // v25: si la opcion no existe, devolvemos null para que el campo se omita
    // (en vez de forzar y romper la creacion entera)
    return null;
}

// ============================================================
// v25: logEventoCompleto REESCRITO - estrategia "minimal-first"
// ============================================================
async function logEventoCompleto(ctx) {
    if (!tEventos) { console.log('  WARN: A_Eventos no existe'); return null; }
    const now = new Date().toISOString();
    const duracion = Date.now() - tInicio;
    const codigoStr = ctx.solicitud_codigo || ctx.solicitud_id || 'NO_COD';
    // El mensaje siempre incluye el codigo entre [COD=...] para que
    // buscar_eventos lo encuentre via blob de texto.
    const mensajeBase = '[COD=' + codigoStr + '] ' + (ctx.mensaje || '');
    const tipoEv      = ctx.tipo_evento  || 'at01_decision';
    const nombreEv    = ctx.nombre_evento || ('AT01_' + (ctx.resultado || 'evento'));
    const severidad   = ctx.severidad    || 'info';

    // --- PASO 1: write MINIMAL para garantizar que el record exista ---
    // Solo campos basicos texto + tipo_evento + severidad
    const minimalMap = {};

    // descripcion / mensaje
    const msgFld = resolveField('mensaje', eventosSchema);
    if (msgFld) {
        if (msgFld.type === 'singleLineText' || msgFld.type === 'multilineText' || msgFld.type === 'richText') {
            minimalMap[msgFld.name] = mensajeBase.substring(0, 95000);
        }
    }
    // tipo_evento (texto o singleSelect)
    const tipoFld = resolveField('tipo_evento', eventosSchema);
    if (tipoFld) {
        if (tipoFld.type === 'singleSelect') {
            const v = valueForSelect(tipoFld.name, tipoEv, eventosSchema);
            if (v) minimalMap[tipoFld.name] = v;
        } else if (tipoFld.type === 'singleLineText' || tipoFld.type === 'multilineText') {
            minimalMap[tipoFld.name] = String(tipoEv);
        }
    }
    // severidad/severity
    const sevFld = resolveField('severidad', eventosSchema);
    if (sevFld) {
        if (sevFld.type === 'singleSelect') {
            const v = valueForSelect(sevFld.name, severidad, eventosSchema);
            if (v) minimalMap[sevFld.name] = v;
        } else if (sevFld.type === 'singleLineText' || sevFld.type === 'multilineText') {
            minimalMap[sevFld.name] = String(severidad);
        }
    }
    // clave_evento (suele ser singleLineText obligatorio en algunos schemas)
    const claveFld = resolveField('clave_evento', eventosSchema);
    if (claveFld && (claveFld.type === 'singleLineText' || claveFld.type === 'multilineText')) {
        minimalMap[claveFld.name] = AUTOMATION_ID + '_' + codigoStr + '_' + Date.now();
    }
    // actor (singleLineText)
    const actorFld = resolveField('actor_nombre', eventosSchema);
    if (actorFld && (actorFld.type === 'singleLineText' || actorFld.type === 'multilineText')) {
        minimalMap[actorFld.name] = 'automation:' + AUTOMATION_ID;
    }

    let createdId = null;
    let estrategiaUsada = '';

    // Estrategia A: minimal con singleSelect resueltos
    try {
        createdId = await tEventos.createRecordAsync(minimalMap);
        estrategiaUsada = 'minimal';
        console.log('  A_Eventos[' + AUTOMATION_ID + '] OK (minimal): ' + createdId + ' fields=' + Object.keys(minimalMap).join(','));
    } catch (eA) {
        console.log('  WARN A_Eventos minimal[' + AUTOMATION_ID + ']: ' + eA.message);
        // Estrategia B: SOLO descripcion/mensaje
        const ultraMin = {};
        if (msgFld && (msgFld.type === 'singleLineText' || msgFld.type === 'multilineText' || msgFld.type === 'richText')) {
            ultraMin[msgFld.name] = mensajeBase + ' | tipo=' + tipoEv + ' | sev=' + severidad;
        }
        // Buscar cualquier campo texto disponible
        if (Object.keys(ultraMin).length === 0) {
            for (const fname of eventosSchema.names) {
                const t = eventosSchema.byName[fname];
                if (t === 'singleLineText' || t === 'multilineText' || t === 'richText') {
                    ultraMin[fname] = mensajeBase + ' | tipo=' + tipoEv;
                    break;
                }
            }
        }
        try {
            createdId = await tEventos.createRecordAsync(ultraMin);
            estrategiaUsada = 'ultramin';
            console.log('  A_Eventos[' + AUTOMATION_ID + '] OK (ultramin): ' + createdId);
        } catch (eB) {
            console.log('  ERROR FINAL A_Eventos[' + AUTOMATION_ID + ']: ' + eB.message);
            return null;
        }
    }

    // --- PASO 2: UPDATE para enriquecer con metadata adicional ---
    if (createdId) {
        const updMap = {};
        const conceptos = {
            automation_id: AUTOMATION_ID, version_motor: MOTOR_VERSION,
            usuario_ejecutor: 'automation:' + AUTOMATION_ID,
            actor_tipo: 'automation', actor_id: AUTOMATION_ID,
            actor_nombre: 'AT01_resolver_motor_reglas',
            timestamp: now, fecha_evento: now, duracion_ms: duracion,
            solicitud_id: ctx.solicitud_id,
            solicitud_codigo: codigoStr,
            estado_entrada: ctx.estado_entrada,
            estado_salida: ctx.estado_salida,
            nombre_evento: nombreEv,
            resultado: ctx.resultado,
            accion: ctx.accion,
            tabla_origen: ctx.tabla_origen || 'TX_Solicitudes',
            tabla_destino: ctx.tabla_destino,
            record_id_origen: ctx.solicitud_link,
            detalle_json: ctx.detalle_json,
            payload_json: ctx.payload_json,
            error_stack: ctx.error_stack,
        };
        for (const c of Object.keys(conceptos)) {
            const val = conceptos[c];
            if (val === null || val === undefined || val === '') continue;
            const res = resolveField(c, eventosSchema);
            if (!res) continue;
            // No reescribir lo ya enviado en minimal
            if (minimalMap[res.name] !== undefined) continue;
            let writeVal = val;
            if (res.type === 'singleSelect') {
                writeVal = valueForSelect(res.name, val, eventosSchema);
                if (!writeVal) continue;
            } else if (res.type === 'multipleSelects') {
                const v = valueForSelect(res.name, val, eventosSchema);
                if (!v) continue;
                writeVal = [v];
            } else if (res.type === 'number' || res.type === 'currency') {
                const n = parseFloat(val);
                writeVal = isNaN(n) ? null : n;
            } else if (res.type === 'checkbox') {
                writeVal = !!val;
            } else if (res.type === 'dateTime' || res.type === 'date') {
                writeVal = val;
            } else {
                writeVal = String(val).substring(0, 95000);
            }
            if (writeVal !== null && writeVal !== undefined) updMap[res.name] = writeVal;
        }
        // Links
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
            try {
                await tEventos.updateRecordAsync(createdId, updMap);
                console.log('  A_Eventos[' + AUTOMATION_ID + '] UPDATE OK +' + Object.keys(updMap).length + ' campos');
            } catch (eU) {
                // Intento 2: solo links
                const justLinks = {};
                for (const k of Object.keys(updMap)) {
                    if (LINK_TYPES.indexOf(eventosSchema.byName[k]) >= 0) justLinks[k] = updMap[k];
                }
                if (Object.keys(justLinks).length > 0) {
                    try { await tEventos.updateRecordAsync(createdId, justLinks); }
                    catch (eL) { console.log('  WARN UPDATE links: ' + eL.message); }
                }
                console.log('  WARN A_Eventos UPDATE total: ' + eU.message);
            }
        }
    }
    return createdId;
}

// ----------------------------------------------------------------
// 1. Cargar la solicitud
// ----------------------------------------------------------------
const sol = await tSolicitudes.selectRecordAsync(recordId, {
    fields: ['estado', 'nro_interno', 'codigo_solicitud',
             'tipo_informe', 'tipo_propiedad',
             'cliente', 'comuna', 'monto_estimado_uf', 'regla_aplicada']
});

if (!sol) { console.log('ERROR: Solicitud no encontrada: ' + recordId); return; }

const estadoEntrada = sol.getCellValueAsString('estado');
if (estadoEntrada !== 'creada') {
    console.log('OMITIDO: estado=' + estadoEntrada + ' (no es creada)');
    return;
}

const codigo = sol.getCellValueAsString('nro_interno')
    || sol.getCellValueAsString('codigo_solicitud') || recordId;

console.log('[AT01_v27] Procesando solicitud: ' + codigo);

// ----------------------------------------------------------------
// 2. Mapas display de cliente/comuna
// ----------------------------------------------------------------
const cliLnk = sol.getCellValue('cliente');
const comLnk = sol.getCellValue('comuna');
const cliId = (Array.isArray(cliLnk) && cliLnk.length > 0) ? cliLnk[0].id : null;
const comId = (Array.isArray(comLnk) && comLnk.length > 0) ? comLnk[0].id : null;
let clienteDisplay = '';
let comunaDisplay  = '';
if (cliId && tClientes) {
    try {
        const r = await tClientes.selectRecordAsync(cliId, { fields: ['nombre'] });
        if (r) clienteDisplay = r.getCellValueAsString('nombre') || '';
    } catch (e) {}
}
if (comId && tComunas) {
    try {
        const r = await tComunas.selectRecordAsync(comId, { fields: ['nombre'] });
        if (r) comunaDisplay = r.getCellValueAsString('nombre') || '';
    } catch (e) {}
}

const tipoInforme    = sol.getCellValueAsString('tipo_informe')    || '';
const tipoPropiedad  = sol.getCellValueAsString('tipo_propiedad')  || '';
const montoEstimado  = parseFloat(sol.getCellValue('monto_estimado_uf')) || 0;

console.log('  Contexto: tipo_informe=' + tipoInforme + ' tipo_propiedad=' + tipoPropiedad +
            ' cliente=' + clienteDisplay + ' comuna=' + comunaDisplay + ' monto=' + montoEstimado);

const ctxBase = {
    solicitud_link:   recordId,
    solicitud_id:     recordId,
    solicitud_codigo: String(codigo),
    estado_entrada:   estadoEntrada,
    cliente_link:     cliId,
    comuna_link:      comId,
};

// ----------------------------------------------------------------
// 3. Cargar reglas activas
// ----------------------------------------------------------------
const qReglas = await tReglas.selectRecordsAsync({
    fields: ['nombre', 'descripcion', 'tipo_informe', 'tipo_propiedad',
             'cliente', 'comuna', 'monto_min', 'monto_max',
             'prioridad', 'activa', 'plantilla_resultado',
             'workflow_resultado', 'formulas_resultado', 'factores_aplicables']
});
const reglasActivas = qReglas.records.filter(r => r.getCellValue('activa') === true);
console.log('  Reglas activas: ' + reglasActivas.length);

// ----------------------------------------------------------------
// 4. Calcular especificidad para cada regla
// ----------------------------------------------------------------
function matchText(reglaVal, ctxVal) {
    if (!reglaVal) return true;
    const r = String(reglaVal).toLowerCase().trim();
    const c = String(ctxVal || '').toLowerCase().trim();
    return r === c || c.indexOf(r) >= 0 || r.indexOf(c) >= 0;
}
function matchRango(mn, mx, m) {
    if (mn == null && mx == null) return true;
    const v = parseFloat(m || 0);
    if (mn != null && v < parseFloat(mn)) return false;
    if (mx != null && v > parseFloat(mx)) return false;
    return true;
}
function calcularEspecificidad(regla) {
    let score = 0;
    const detalle = [];
    const ri = regla.getCellValueAsString('tipo_informe');
    if (ri) {
        if (matchText(ri, tipoInforme)) { score += 1; detalle.push('tipo_informe'); }
        else return { match: false, score: 0, detalle: [] };
    }
    const rp = regla.getCellValueAsString('tipo_propiedad');
    if (rp) {
        if (matchText(rp, tipoPropiedad)) { score += 1; detalle.push('tipo_propiedad'); }
        else return { match: false, score: 0, detalle: [] };
    }
    const rc = regla.getCellValueAsString('cliente');
    if (rc) {
        if (matchText(rc, clienteDisplay)) { score += 1; detalle.push('cliente'); }
        else return { match: false, score: 0, detalle: [] };
    }
    const rcom = regla.getCellValueAsString('comuna');
    if (rcom) {
        if (matchText(rcom, comunaDisplay)) { score += 2; detalle.push('comuna'); }
        else return { match: false, score: 0, detalle: [] };
    }
    const mmin = regla.getCellValue('monto_min');
    const mmax = regla.getCellValue('monto_max');
    if (mmin != null || mmax != null) {
        if (matchRango(mmin, mmax, montoEstimado)) { score += 1; detalle.push('rango_monto'); }
        else return { match: false, score: 0, detalle: [] };
    }
    return { match: true, score, detalle };
}

const candidatas = [];
for (const r of reglasActivas) {
    const { match, score, detalle } = calcularEspecificidad(r);
    if (match) {
        const prioridad = parseInt(r.getCellValue('prioridad') || 0);
        candidatas.push({ regla: r, score, prioridad, detalle });
    }
}

if (candidatas.length === 0) {
    console.log('[' + codigo + '] SIN REGLA APLICABLE -> requiere_atencion');
    await tSolicitudes.updateRecordAsync(recordId, { 'estado': 'requiere_atencion' });
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida:   'requiere_atencion',
        resultado:       'sin_regla_match',
        tipo_evento:     'at01_error_critico',
        nombre_evento:   'AT01 sin regla aplicable',
        accion:          'TRANSITION',
        severidad:       'critical',
        mensaje:         'Ninguna regla activa de C_ReglasNegocio matchea. cliente=' +
                         clienteDisplay + ' tipo=' + tipoInforme + ' prop=' + tipoPropiedad +
                         ' comuna=' + comunaDisplay + ' monto=' + montoEstimado,
        tabla_destino:   'TX_Solicitudes',
    }));
    return;
}

candidatas.sort((a, b) => b.score - a.score || b.prioridad - a.prioridad);
const ganadora = candidatas[0];
const rfG = ganadora.regla;
const nombreGanadora = rfG.getCellValueAsString('nombre') || rfG.id;

console.log('  Regla ganadora: ' + nombreGanadora +
            ' (score=' + ganadora.score + ', prioridad=' + ganadora.prioridad + ')');

const top10 = candidatas.slice(0, 10).map(c => ({
    regla_id:  c.regla.id,
    nombre:    c.regla.getCellValueAsString('nombre'),
    score:     c.score,
    prioridad: c.prioridad,
    matches:   c.detalle,
}));

// ----------------------------------------------------------------
// 5. Idempotencia
// ----------------------------------------------------------------
const reglaActual = sol.getCellValue('regla_aplicada');
if (reglaActual && Array.isArray(reglaActual) && reglaActual.length > 0 &&
    reglaActual[0].id === rfG.id) {
    console.log('[' + codigo + '] regla_aplicada ya correcta -> idempotente');
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida:   estadoEntrada,
        resultado:       'idempotente_omitido',
        tipo_evento:     'at01_decision_omitida',
        nombre_evento:   'AT01 omitido (regla ya aplicada)',
        accion:          'OMITIDO',
        severidad:       'info',
        mensaje:         'regla_aplicada ya coincide con ganadora: ' + nombreGanadora,
        tabla_destino:   'TX_Solicitudes',
        regla_link:      rfG.id,
    }));
    return;
}

// ----------------------------------------------------------------
// 6. A_DecisionesMotor
// ----------------------------------------------------------------
const ahora    = new Date().toISOString();
const tiempoMs = Date.now() - tInicio;
const razon    = 'score=' + ganadora.score + ' prioridad=' + ganadora.prioridad +
                 ' matches=[' + ganadora.detalle.join(',') + ']';

const snapshotRegla = {
    regla_id:  rfG.id,
    nombre:    nombreGanadora,
    prioridad: ganadora.prioridad,
    criterios: {
        cliente:        rfG.getCellValueAsString('cliente'),
        tipo_informe:   rfG.getCellValueAsString('tipo_informe'),
        tipo_propiedad: rfG.getCellValueAsString('tipo_propiedad'),
        comuna:         rfG.getCellValueAsString('comuna'),
        monto_min:      rfG.getCellValue('monto_min'),
        monto_max:      rfG.getCellValue('monto_max'),
    },
    plantilla_resultado: rfG.getCellValueAsString('plantilla_resultado'),
    formulas_resultado:  rfG.getCellValueAsString('formulas_resultado'),
    workflow_resultado:  rfG.getCellValueAsString('workflow_resultado'),
    factores_aplicables: rfG.getCellValueAsString('factores_aplicables'),
};

try {
    await tDecisiones.createRecordAsync({
        'solicitud_codigo':        String(codigo),
        'solicitud':               [{ id: recordId }],
        'regla_ganadora_nombre':   nombreGanadora,
        'regla_ganadora':          [{ id: rfG.id }],
        'razon_ganadora':          razon,
        'timestamp_decision':      ahora,
        'tiempo_resolucion_ms':    tiempoMs,
        'motor_version':           MOTOR_VERSION,
        'reglas_candidatas_json':  JSON.stringify(top10, null, 0),
        'regla_ganadora_snapshot': JSON.stringify(snapshotRegla, null, 0),
    });
    console.log('[' + codigo + '] A_DecisionesMotor -> CREADO OK');
} catch (e) {
    console.log('  WARN A_DecisionesMotor: ' + e.message);
}

// ----------------------------------------------------------------
// 7. TX_Solicitudes.regla_aplicada
// ----------------------------------------------------------------
await tSolicitudes.updateRecordAsync(recordId, {
    'regla_aplicada': [{ id: rfG.id }]
});

// ----------------------------------------------------------------
// 8. A_Eventos
// ----------------------------------------------------------------
await logEventoCompleto(Object.assign({}, ctxBase, {
    estado_salida:   estadoEntrada,
    resultado:       'regla_aplicada_ok',
    tipo_evento:     'at01_decision',
    nombre_evento:   'AT01 regla resuelta: ' + nombreGanadora,
    accion:          'CREATE+UPDATE',
    severidad:       'info',
    mensaje:         'AT01 decision regla=' + nombreGanadora + ' score=' + ganadora.score +
                     ' prioridad=' + ganadora.prioridad + ' matches=[' + ganadora.detalle.join(',') + ']',
    tabla_destino:   'A_DecisionesMotor + TX_Solicitudes',
    regla_link:      rfG.id,
    detalle_json:    JSON.stringify({
        regla:      nombreGanadora,
        score:      ganadora.score,
        prioridad:  ganadora.prioridad,
        candidatas: candidatas.length,
        top10:      top10,
    }),
}));

console.log('[AT01_v27] FIN OK -- ' + tiempoMs + ' ms');
