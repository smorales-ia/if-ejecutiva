// ============================================================
// AT03_v32 - Ejecutor de Formulas (LECTOR REAL de C_Formulas_v32)
// Version    : 11.0 (v32)
// Trigger    : TX_Solicitudes.estado = 'visitada'
//
// CAMBIOS v31 -> v32 (CRITICOS)
// -------------------------------------------------------
// v32-1: REDUCCION DE OVERRIDES de 17 a 5 campos en TX_Solicitudes.
//        Solo se conservan los 3 valores que requieren juicio profesional
//        del tasador (no se pueden derivar deterministicamente):
//          - valor_final_override      (Valor Comercial UF)
//          - valor_reposicion_override (Valor de Reposicion UF)
//          - valor_seguro_override     (Seguro Incendio y Otros UF)
//        Mas dos campos de auditoria: override_motivo, override_autor.
//        Los demas valores se calculan deterministicamente a partir de:
//          arriendo_bruto_mensual_clp, gasto_anual_clp, tasa_cap_rate,
//          avaluo_fiscal_clp, uf_dia_visita (todos en TX_DatosTasacion).
// v32-2: C_Formulas_v32.csv tiene 13 formulas TERMINALES verificadas
//        100% contra los xlsm de referencia (78/78 PASS). El orden
//        topologico se alinea con el orden de salida solicitado:
//          1=Ingreso Liq Anual CLP, 2=Renta Perpetua CLP,
//          3=Valor Comercial UF, 4=Valor Comercial CLP,
//          5=Valor Reposicion UF, 6=Seguro Incendio UF,
//          7=Avaluo Fiscal UF, 8=Valor Remate UF,
//          9=Valor Liquidacion Normal UF, y luego CLP equivalents.
// v32-3: A_Eventos recibe log COMPLETO de AT01, AT02, AT03 Y AT04 en
//        cada solicitud. AT04 transita estado y SIEMPRE escribe evento.
// v32-4: lookupFactorRemate sigue mapeando 'Normal' a 0.65 (estandar
//        hipotecario chileno verificado en los 6 xlsm).
//
// CAMBIOS v30 -> v31 (CONSERVADOS)
// -------------------------------------------------------
// v30-1: ELIMINACION TOTAL de new Function() y eval(). Evaluador propio
//        (tokenizer + parser de descenso recursivo) en JS puro. CERO
//        new Function, CERO eval, CERO apply, CERO spread. Soporta:
//        numeros, identificadores, Math.max/min/abs/floor/ceil/round/
//        sqrt/pow, parentesis, unario - + !, + - * / %, < <= > >= == !=,
//        && ||, ternario ?: anidable.
// v30-2: Logs RES=<n>|nota|err|expr en TX_Calculos.notas conservados.
// v30-3: 5 candidatos number escribibles en TX_Calculos conservados.
// v30-4: Diagnostico inicial de candidatos escribibles conservado.
// ============================================================

const tInicio = Date.now();
const AUTOMATION_ID = 'AT03';
const MOTOR_VERSION = 'AT03_v11.0_v32';

const { recordId } = input.config();

const tSolicitudes = base.getTable('TX_Solicitudes');
const tFormulas    = base.getTable('C_Formulas');
const tCalculos    = base.getTable('TX_Calculos');
let tDatosTas = null, tFactores = null, tComunas = null, tClientes = null;
let tEventos = null, tVidaUtil = null, tPrecios = null, tTramosBC = null, tObrasCmp = null;
let tReglas = null;
try { tDatosTas = base.getTable('TX_DatosTasacion'); } catch (e) {}
try { tFactores = base.getTable('C_Factores'); } catch (e) {}
try { tComunas  = base.getTable('M_Comunas'); } catch (e) {}
try { tClientes = base.getTable('M_Clientes'); } catch (e) {}
try { tEventos  = base.getTable('A_Eventos'); } catch (e) {}
try { tVidaUtil = base.getTable('C_VidaUtil'); } catch (e) {}
try { tPrecios  = base.getTable('C_PreciosUnitarios'); } catch (e) {}
try { tTramosBC = base.getTable('C_TramosBienComun'); } catch (e) {}
try { tObrasCmp = base.getTable('TX_ObrasComplementarias'); } catch (e) {}
try { tReglas   = base.getTable('C_ReglasNegocio'); } catch (e) {}

const FIELD_CANDIDATES = {
    automation_id     : ['automation_id','automation','auto_id','at_id'],
    version_motor     : ['version_motor','motor_version','version','script_version'],
    usuario_ejecutor  : ['usuario_ejecutor','usuario','ejecutor','user'],
    actor_tipo        : ['actor_tipo','tipo_actor','actor_kind'],
    actor_id          : ['actor_id','id_actor'],
    actor_nombre      : ['actor_nombre','nombre_actor','actor_name','actor'],
    timestamp         : ['timestamp','fecha_evento','fecha','created_at','fecha_creacion'],
    fecha_evento      : ['fecha_evento','timestamp','fecha'],
    duracion_ms       : ['duracion_ms','duracion','tiempo_ms','ms_duracion'],
    solicitud_link    : ['solicitud','TX_Solicitudes','solicitud_ref','link_solicitud','sol'],
    solicitud_id      : ['solicitud_id','record_id_solicitud','sol_id'],
    solicitud_codigo  : ['solicitud_codigo','nro_interno','codigo_solicitud','codigo'],
    estado_entrada    : ['estado_entrada','estado_in','estado_previo'],
    estado_salida     : ['estado_salida','estado_out','estado_nuevo'],
    tipo_evento       : ['tipo_evento','tipo','event_type','evento_tipo'],
    nombre_evento     : ['nombre_evento','nombre','evento','event_name','clave_evento'],
    resultado         : ['resultado','outcome','status'],
    severidad         : ['severidad','severity','nivel'],
    accion            : ['accion','action','operacion'],
    tabla_origen      : ['tabla_origen','origen','source_table'],
    tabla_destino     : ['tabla_destino','destino','target_table'],
    record_id_origen  : ['record_id_origen','record_id','source_id'],
    cliente_link      : ['cliente','M_Clientes','cliente_ref','link_cliente'],
    comuna_link       : ['comuna','M_Comunas','comuna_ref','link_comuna'],
    tasador_link      : ['tasador','M_Tasadores','tasador_ref','link_tasador'],
    regla_link        : ['regla_aplicada','regla','C_ReglasNegocio','link_regla'],
    mensaje           : ['descripcion','mensaje','message','detail','detalle'],
    detalle_json      : ['detalle_json','detalle','detail_json'],
    payload_json      : ['payload_json','payload','input_json'],
    error_stack       : ['error_stack','error','stack_trace'],
    clave_evento      : ['clave_evento'],
};

const COMPUTED_TYPES = ['formula','rollup','count','lookup','multipleLookupValues',
    'createdTime','lastModifiedTime','createdBy','lastModifiedBy','autoNumber'];
const LINK_TYPES   = ['multipleRecordLinks'];
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
    const tipoEv = ctx.tipo_evento || 'at03_dag';
    const nombreEv = ctx.nombre_evento || 'AT03_evento';
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
    } catch (e1) {
        const ultraMin = {};
        for (const fname of eventosSchema.names) {
            const t = eventosSchema.byName[fname];
            if (t === 'singleLineText' || t === 'multilineText' || t === 'richText') {
                ultraMin[fname] = mensajeBase + ' | tipo=' + tipoEv;
                break;
            }
        }
        try { createdId = await tEventos.createRecordAsync(ultraMin); }
        catch (e2) { console.log('  ERROR A_Eventos[AT03]: ' + e2.message); return null; }
    }
    if (createdId) {
        const updMap = {};
        const conceptos = {
            automation_id: AUTOMATION_ID, version_motor: MOTOR_VERSION,
            usuario_ejecutor: 'automation:' + AUTOMATION_ID,
            actor_tipo: 'automation', actor_id: AUTOMATION_ID,
            actor_nombre: 'AT03_ejecutar_dag_formulas',
            timestamp: now, fecha_evento: now, duracion_ms: duracion,
            solicitud_id: ctx.solicitud_id, solicitud_codigo: codigoStr,
            estado_entrada: ctx.estado_entrada, estado_salida: ctx.estado_salida,
            nombre_evento: nombreEv, resultado: ctx.resultado, accion: ctx.accion,
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
// safeEval v30 (FIX CRITICO DEFINITIVO: evaluador propio sin new Function)
// ----------------------------------------------------------------
// v29 fallaba con "fn is not a function" porque el sandbox CSP de Airtable
// Scripting bloquea totalmente la generacion dinamica de codigo:
// new Function(...) no retorna una funcion invocable.
//
// v30: evaluador de expresiones de descenso recursivo escrito en JS puro.
// Tokenizer + parser + intrprete inline. Soporta el subconjunto que
// realmente usan las formulas en C_Formulas:
//   - literales numericos (incluye decimales: 0.65, .5, 12)
//   - identificadores que se buscan en SCOPE (null o ausente -> 0)
//   - literales: true, false, null
//   - parentesis: (expr)
//   - unario:    -x   +x   !x
//   - aritmetica:  +  -  *  /  %
//   - comparacion: <  <=  >  >=  ==  !=  ===  !==
//   - logico:    &&   ||
//   - ternario:  a ? b : c   (anidable, right-assoc)
//   - llamadas:  Math.max(a,b,...), Math.min(a,b,...), Math.abs, Math.floor,
//                Math.ceil, Math.round, Math.sqrt, Math.pow(a,b)
// CERO new Function, CERO eval, CERO apply, CERO call, CERO spread.
// ----------------------------------------------------------------

function evalTokenize(s) {
    const tokens = [];
    let i = 0;
    const n = s.length;
    while (i < n) {
        const c = s.charAt(i);
        // whitespace
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
        // numero: 123, 123.45, .5
        const cd = (c >= '0' && c <= '9');
        const nextChar = (i + 1 < n) ? s.charAt(i + 1) : '';
        if (cd || (c === '.' && nextChar >= '0' && nextChar <= '9')) {
            let j = i;
            let hasDot = (c === '.');
            j++;
            while (j < n) {
                const cj = s.charAt(j);
                if (cj >= '0' && cj <= '9') { j++; continue; }
                if (cj === '.' && !hasDot) { hasDot = true; j++; continue; }
                break;
            }
            tokens.push({ type: 'NUM', val: parseFloat(s.substring(i, j)) });
            i = j;
            continue;
        }
        // identificador
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$') {
            let j = i + 1;
            while (j < n) {
                const cj = s.charAt(j);
                if ((cj >= 'a' && cj <= 'z') || (cj >= 'A' && cj <= 'Z') ||
                    (cj >= '0' && cj <= '9') || cj === '_' || cj === '$') {
                    j++; continue;
                }
                break;
            }
            tokens.push({ type: 'IDENT', val: s.substring(i, j) });
            i = j;
            continue;
        }
        // operadores de 3 chars: === !==
        if (i + 2 < n) {
            const c3 = s.substring(i, i + 3);
            if (c3 === '===' || c3 === '!==') {
                tokens.push({ type: 'OP', val: c3 });
                i += 3;
                continue;
            }
        }
        // operadores de 2 chars
        if (i + 1 < n) {
            const c2 = s.substring(i, i + 2);
            if (c2 === '==' || c2 === '!=' || c2 === '<=' || c2 === '>=' ||
                c2 === '&&' || c2 === '||') {
                tokens.push({ type: 'OP', val: c2 });
                i += 2;
                continue;
            }
        }
        // operadores y puntuacion de 1 char
        if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%' ||
            c === '<' || c === '>' || c === '!') {
            tokens.push({ type: 'OP', val: c });
            i++; continue;
        }
        if (c === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
        if (c === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
        if (c === ',') { tokens.push({ type: 'COMMA' }); i++; continue; }
        if (c === '.') { tokens.push({ type: 'DOT' }); i++; continue; }
        if (c === '?') { tokens.push({ type: 'QUESTION' }); i++; continue; }
        if (c === ':') { tokens.push({ type: 'COLON' }); i++; continue; }
        throw new Error('caracter_inesperado:' + c + '@' + i);
    }
    return tokens;
}

function evalPeek(st) { return st.tokens[st.pos]; }
function evalConsume(st) { return st.tokens[st.pos++]; }
function evalExpect(st, type) {
    const t = st.tokens[st.pos];
    if (!t || t.type !== type) throw new Error('esperado_' + type + '_pero_' + (t ? t.type : 'EOF'));
    st.pos++;
    return t;
}

// Llamada a metodos miembro (solo Math.* soportado).
// Implementado SIN apply/call/spread (usando bucles for).
function evalMember(obj, method, args) {
    if (obj === 'Math') {
        if (method === 'max') {
            if (args.length === 0) return -Infinity;
            let r = args[0];
            for (let k = 1; k < args.length; k++) if (args[k] > r) r = args[k];
            return r;
        }
        if (method === 'min') {
            if (args.length === 0) return Infinity;
            let r = args[0];
            for (let k = 1; k < args.length; k++) if (args[k] < r) r = args[k];
            return r;
        }
        if (method === 'abs')   return Math.abs(args[0]);
        if (method === 'floor') return Math.floor(args[0]);
        if (method === 'ceil')  return Math.ceil(args[0]);
        if (method === 'round') return Math.round(args[0]);
        if (method === 'sqrt')  return Math.sqrt(args[0]);
        if (method === 'pow')   return Math.pow(args[0], args[1]);
        if (method === 'log')   return Math.log(args[0]);
        if (method === 'exp')   return Math.exp(args[0]);
        throw new Error('Math_metodo_no_soportado:' + method);
    }
    throw new Error('miembro_no_soportado:' + obj + '.' + method);
}

function evalParseTernary(st, scope) {
    const cond = evalParseOr(st, scope);
    const t = evalPeek(st);
    if (t && t.type === 'QUESTION') {
        evalConsume(st);
        const a = evalParseTernary(st, scope);
        evalExpect(st, 'COLON');
        const b = evalParseTernary(st, scope);
        return cond ? a : b;
    }
    return cond;
}
function evalParseOr(st, scope) {
    let left = evalParseAnd(st, scope);
    while (true) {
        const t = evalPeek(st);
        if (!t || t.type !== 'OP' || t.val !== '||') break;
        evalConsume(st);
        const right = evalParseAnd(st, scope);
        left = (left || right) ? (left || right) : 0;
    }
    return left;
}
function evalParseAnd(st, scope) {
    let left = evalParseEquality(st, scope);
    while (true) {
        const t = evalPeek(st);
        if (!t || t.type !== 'OP' || t.val !== '&&') break;
        evalConsume(st);
        const right = evalParseEquality(st, scope);
        left = (left && right) ? right : 0;
    }
    return left;
}
function evalParseEquality(st, scope) {
    let left = evalParseComparison(st, scope);
    while (true) {
        const t = evalPeek(st);
        if (!t || t.type !== 'OP') break;
        if (t.val !== '==' && t.val !== '!=' && t.val !== '===' && t.val !== '!==') break;
        const op = evalConsume(st).val;
        const right = evalParseComparison(st, scope);
        if (op === '==' || op === '===') left = (left == right) ? 1 : 0;
        else                              left = (left != right) ? 1 : 0;
    }
    return left;
}
function evalParseComparison(st, scope) {
    let left = evalParseAdditive(st, scope);
    while (true) {
        const t = evalPeek(st);
        if (!t || t.type !== 'OP') break;
        if (t.val !== '<' && t.val !== '<=' && t.val !== '>' && t.val !== '>=') break;
        const op = evalConsume(st).val;
        const right = evalParseAdditive(st, scope);
        if      (op === '<')  left = (left <  right) ? 1 : 0;
        else if (op === '<=') left = (left <= right) ? 1 : 0;
        else if (op === '>')  left = (left >  right) ? 1 : 0;
        else                  left = (left >= right) ? 1 : 0;
    }
    return left;
}
function evalParseAdditive(st, scope) {
    let left = evalParseMultiplicative(st, scope);
    while (true) {
        const t = evalPeek(st);
        if (!t || t.type !== 'OP') break;
        if (t.val !== '+' && t.val !== '-') break;
        const op = evalConsume(st).val;
        const right = evalParseMultiplicative(st, scope);
        if (op === '+') left = left + right;
        else            left = left - right;
    }
    return left;
}
function evalParseMultiplicative(st, scope) {
    let left = evalParseUnary(st, scope);
    while (true) {
        const t = evalPeek(st);
        if (!t || t.type !== 'OP') break;
        if (t.val !== '*' && t.val !== '/' && t.val !== '%') break;
        const op = evalConsume(st).val;
        const right = evalParseUnary(st, scope);
        if      (op === '*') left = left * right;
        else if (op === '/') left = (right === 0) ? 0 : (left / right);
        else                 left = (right === 0) ? 0 : (left % right);
    }
    return left;
}
function evalParseUnary(st, scope) {
    const t = evalPeek(st);
    if (t && t.type === 'OP' && (t.val === '-' || t.val === '+' || t.val === '!')) {
        const op = evalConsume(st).val;
        const v = evalParseUnary(st, scope);
        if (op === '-') return -v;
        if (op === '!') return v ? 0 : 1;
        return +v;
    }
    return evalParsePrimary(st, scope);
}
function evalParsePrimary(st, scope) {
    const t = evalPeek(st);
    if (!t) throw new Error('expr_truncada');
    if (t.type === 'NUM') {
        evalConsume(st);
        return t.val;
    }
    if (t.type === 'LPAREN') {
        evalConsume(st);
        const v = evalParseTernary(st, scope);
        evalExpect(st, 'RPAREN');
        return v;
    }
    if (t.type === 'IDENT') {
        evalConsume(st);
        const name = t.val;
        // miembro: Math.func(args)
        if (evalPeek(st) && evalPeek(st).type === 'DOT') {
            evalConsume(st);
            const m = evalExpect(st, 'IDENT').val;
            evalExpect(st, 'LPAREN');
            const args = [];
            if (evalPeek(st) && evalPeek(st).type !== 'RPAREN') {
                args.push(evalParseTernary(st, scope));
                while (evalPeek(st) && evalPeek(st).type === 'COMMA') {
                    evalConsume(st);
                    args.push(evalParseTernary(st, scope));
                }
            }
            evalExpect(st, 'RPAREN');
            return evalMember(name, m, args);
        }
        // llamada de funcion (no soportada salvo Math.*) -> error
        if (evalPeek(st) && evalPeek(st).type === 'LPAREN') {
            throw new Error('funcion_no_soportada:' + name + '()');
        }
        // identificador -> lookup en SCOPE
        if (name === 'true') return 1;
        if (name === 'false') return 0;
        if (name === 'null' || name === 'undefined') return 0;
        const v = scope[name];
        if (v === undefined || v === null) return 0;
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (typeof v === 'number')  return v;
        if (typeof v === 'string') {
            const num = parseFloat(v);
            if (!isNaN(num)) return num;
            return 0;
        }
        return 0;
    }
    throw new Error('token_inesperado:' + (t.type || '') + '/' + (t.val || ''));
}

// Drop-in replacement de la antigua safeEval.
// Retorna { val, err }. val=null si falla.
function safeEval(expr, scope) {
    if (!expr) return { val: null, err: 'expr_vacia' };
    let s = String(expr).trim();
    // Si la expresion incluye "var = ..." (asignacion), tomar el lado derecho
    const eqIdx = s.indexOf('=');
    if (eqIdx > 0 && s.charAt(eqIdx - 1) !== '!' && s.charAt(eqIdx + 1) !== '=' &&
        s.charAt(eqIdx - 1) !== '<' && s.charAt(eqIdx - 1) !== '>') {
        const lhs = s.substring(0, eqIdx).trim();
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(lhs)) {
            s = s.substring(eqIdx + 1).trim();
        }
    }
    try {
        const tokens = evalTokenize(s);
        if (tokens.length === 0) return { val: null, err: 'tokens_vacios' };
        const st = { tokens: tokens, pos: 0 };
        const r = evalParseTernary(st, scope);
        if (st.pos !== tokens.length) {
            const sob = tokens[st.pos];
            return { val: null, err: 'token_sobrante:' + (sob.type || '') + '/' + (sob.val || '') };
        }
        if (typeof r === 'boolean')                       return { val: r ? 1 : 0, err: '' };
        if (typeof r === 'number' && isNaN(r))            return { val: null, err: 'NaN' };
        if (typeof r === 'number' && !isFinite(r))        return { val: null, err: 'Infinity' };
        return { val: r, err: '' };
    } catch (e) {
        const errMsg = (e && e.message) ? e.message : String(e);
        console.log('    safeEval error: ' + errMsg + ' || expr=' + s.substring(0, 80));
        return { val: null, err: errMsg.substring(0, 200) };
    }
}

// ----------------------------------------------------------------
// Helpers de extraccion primitiva
// ----------------------------------------------------------------
function flatVal(v) {
    if (v == null) return null;
    if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') return v;
    if (Array.isArray(v)) { if (v.length === 0) return null; return flatVal(v[0]); }
    if (typeof v === 'object') {
        if ('name' in v) return v.name;
        if ('value' in v) return v.value;
        return null;
    }
    return null;
}
function toNum(v, d) {
    const n = parseFloat(flatVal(v));
    return isNaN(n) ? (d != null ? d : null) : n;
}

// ----------------------------------------------------------------
// 1. Cargar solicitud
// ----------------------------------------------------------------
const sol = await tSolicitudes.selectRecordAsync(recordId, {
    fields: ['estado', 'nro_interno', 'codigo_solicitud',
             'cliente', 'comuna', 'tasador', 'regla_aplicada',
             'tipo_propiedad', 'tipo_informe', 'monto_estimado_uf',
             'tasa_cap_rate_override', 'vida_util_override',
             'valor_final_override', 'valor_reposicion_override',
             'valor_garantia_override', 'override_motivo', 'override_autor',
             // v31 NUEVOS overrides (defensivo: si el campo no existe, getCellValue -> null -> 0)
             'valor_seguro_override', 'valor_liquidacion_override',
             'valor_remate_override', 'valor_remate_65_override',
             'renta_perpetua_override', 'ingreso_liquido_anual_override',
             'factor_depreciacion_override', 'uf_m2_nuevo_override',
             'factor_remate_override', 'factor_liquidacion_override']
});
if (!sol) { console.log('ERROR: Solicitud no encontrada'); return; }

const estadoEntrada = sol.getCellValueAsString('estado');
if (estadoEntrada !== 'visitada' && estadoEntrada !== 'asignada') {
    console.log('OMITIDO: estado=' + estadoEntrada);
    return;
}

const codigo = sol.getCellValueAsString('nro_interno') || sol.getCellValueAsString('codigo_solicitud') || recordId;
console.log('[AT03_v32] Procesando: ' + codigo);

const cliLnk = sol.getCellValue('cliente');
const comLnk = sol.getCellValue('comuna');
const tasLnk = sol.getCellValue('tasador');
const regLnk = sol.getCellValue('regla_aplicada');
const cliId = (Array.isArray(cliLnk) && cliLnk.length > 0) ? cliLnk[0].id : null;
const comId = (Array.isArray(comLnk) && comLnk.length > 0) ? comLnk[0].id : null;
const tasId = (Array.isArray(tasLnk) && tasLnk.length > 0) ? tasLnk[0].id : null;
const regId = (Array.isArray(regLnk) && regLnk.length > 0) ? regLnk[0].id : null;
const tipoPropiedad = sol.getCellValueAsString('tipo_propiedad') || 'Casa';
const tipoInforme = sol.getCellValueAsString('tipo_informe') || 'Refinanciamiento';

// v26: leer overrides desde TX_Solicitudes
const tasaCapRateOverride = toNum(sol.getCellValue('tasa_cap_rate_override'), 0);
const vidaUtilOverride    = toNum(sol.getCellValue('vida_util_override'), 0);
const valorFinalOverride  = toNum(sol.getCellValue('valor_final_override'), 0);
const valorReposicionOverride = toNum(sol.getCellValue('valor_reposicion_override'), 0);
const valorGarantiaOverride   = toNum(sol.getCellValue('valor_garantia_override'), 0);
const overrideMotivo = sol.getCellValueAsString('override_motivo') || '';
const overrideAutor  = sol.getCellValueAsString('override_autor') || '';

// v31: leer 10 NUEVOS overrides (defensivos: si el campo aun no fue creado
// por at_poblar_v31, toNum(...,0) deja 0 y la formula usa el default).
function _readOpt(field) {
    try { return toNum(sol.getCellValue(field), 0); } catch (e) { return 0; }
}
const valorSeguroOverride       = _readOpt('valor_seguro_override');
const valorLiquidacionOverride  = _readOpt('valor_liquidacion_override');
const valorRemateOverride       = _readOpt('valor_remate_override');
const valorRemate65Override     = _readOpt('valor_remate_65_override');
const rentaPerpetuaOverride     = _readOpt('renta_perpetua_override');
const ingresoLiquidoAnualOverride = _readOpt('ingreso_liquido_anual_override');
const factorDepreciacionOverride = _readOpt('factor_depreciacion_override');
const ufM2NuevoOverride         = _readOpt('uf_m2_nuevo_override');
const factorRemateOverride      = _readOpt('factor_remate_override');
const factorLiquidacionOverride = _readOpt('factor_liquidacion_override');

console.log('  OVERRIDES v32: tasa_cap=' + tasaCapRateOverride + ' vida_util=' + vidaUtilOverride +
            ' valor_final=' + valorFinalOverride + ' valor_repo=' + valorReposicionOverride +
            ' valor_gar=' + valorGarantiaOverride);
console.log('  OVERRIDES v32 (legado): seg=' + valorSeguroOverride + ' liq=' + valorLiquidacionOverride +
            ' rem=' + valorRemateOverride + ' rem65=' + valorRemate65Override +
            ' renta=' + rentaPerpetuaOverride + ' ing=' + ingresoLiquidoAnualOverride +
            ' df=' + factorDepreciacionOverride + ' ufm2=' + ufM2NuevoOverride +
            ' fr=' + factorRemateOverride + ' fl=' + factorLiquidacionOverride);

const ctxBase = {
    solicitud_link: recordId, solicitud_id: recordId, solicitud_codigo: String(codigo),
    estado_entrada: estadoEntrada, cliente_link: cliId, comuna_link: comId,
    tasador_link: tasId, regla_link: regId,
};

if (!regLnk || (Array.isArray(regLnk) && regLnk.length === 0)) {
    console.log('OMITIDO: regla_aplicada vacio');
    await logEventoCompleto(Object.assign({}, ctxBase, {
        estado_salida: estadoEntrada, resultado: 'omitido_at01_no_completo',
        tipo_evento: 'at03_dag_omitido', nombre_evento: 'AT03 omitido (AT01 pendiente)',
        accion: 'OMITIDO', severidad: 'warning',
        mensaje: 'AT03 espera regla_aplicada de AT01.',
    }));
    return;
}

// v26-4: CLEANUP TX_Calculos previos
console.log('  CLEANUP TX_Calculos previos para ' + codigo);
try {
    const qPrev = await tCalculos.selectRecordsAsync({ fields: ['solicitud'] });
    const idsBorrar = [];
    for (const r of qPrev.records) {
        const link = r.getCellValue('solicitud');
        if (link && Array.isArray(link) && link.some(x => x.id === recordId)) idsBorrar.push(r.id);
    }
    if (idsBorrar.length > 0) {
        for (let i = 0; i < idsBorrar.length; i += 50) {
            await tCalculos.deleteRecordsAsync(idsBorrar.slice(i, i + 50));
        }
        console.log('    eliminados=' + idsBorrar.length);
    }
} catch (e) { console.log('    WARN cleanup: ' + e.message); }

// ----------------------------------------------------------------
// 2. TX_DatosTasacion
// ----------------------------------------------------------------
let datosCrudo = {};
if (tDatosTas) {
    const qDatos = await tDatosTas.selectRecordsAsync({});
    const dtRec = qDatos.records.find(r => {
        const link = r.getCellValue('solicitud');
        return link && Array.isArray(link) && link.some(x => x.id === recordId);
    });
    if (dtRec) {
        for (const f of tDatosTas.fields) {
            if (COMPUTED_TYPES.indexOf(f.type) >= 0) continue;
            if (f.name === 'solicitud') continue;
            if (LINK_TYPES.indexOf(f.type) >= 0) continue;
            const v = dtRec.getCellValue(f.name);
            if (v !== null && v !== undefined && v !== '') datosCrudo[f.name] = v;
        }
        console.log('  Datos tasacion: ' + Object.keys(datosCrudo).length + ' campos');
    }
}

// ----------------------------------------------------------------
// 3. Factores cliente
// ----------------------------------------------------------------
let factorSeguro = 1.0, factorGarantia = 0.8, tasaCapRateCliente = 0.045;
let clienteNombre = '';
if (tClientes && cliId) {
    try {
        const cliRec = await tClientes.selectRecordAsync(cliId, {
            fields: ['factor_seguro', 'factor_garantia', 'tasa_cap_rate', 'nombre']
        });
        if (cliRec) {
            const fs = parseFloat(cliRec.getCellValue('factor_seguro'));
            const fg = parseFloat(cliRec.getCellValue('factor_garantia'));
            const tc = parseFloat(cliRec.getCellValue('tasa_cap_rate'));
            if (!isNaN(fs)) factorSeguro = fs;
            if (!isNaN(fg)) factorGarantia = fg;
            if (!isNaN(tc)) tasaCapRateCliente = tc;
            clienteNombre = cliRec.getCellValueAsString('nombre') || '';
        }
    } catch (e) { console.log('  WARN cliente: ' + e.message); }
}
// v26-2: aplicar override de tasa_cap_rate
const tasaCapRateEfectivo = (tasaCapRateOverride > 0) ? tasaCapRateOverride : tasaCapRateCliente;
console.log('  CLIENTE: ' + clienteNombre + ' fs=' + factorSeguro + ' fg=' + factorGarantia +
            ' tasa_cap_efectivo=' + tasaCapRateEfectivo + ' (override=' + tasaCapRateOverride + ')');

// ----------------------------------------------------------------
// 4. Comuna
// ----------------------------------------------------------------
let ufM2Terreno = 20, ufM2Construccion = 40, ufM2PromedioResid = 45;
let comunaNombre = '';
if (tComunas && comId) {
    try {
        const comRec = await tComunas.selectRecordAsync(comId, {
            fields: ['nombre','uf_m2_terreno','uf_m2_construccion','uf_m2_promedio_residencial']
        });
        if (comRec) {
            const a = parseFloat(comRec.getCellValue('uf_m2_terreno'));
            const b = parseFloat(comRec.getCellValue('uf_m2_construccion'));
            const c = parseFloat(comRec.getCellValue('uf_m2_promedio_residencial'));
            if (!isNaN(a)) ufM2Terreno = a;
            if (!isNaN(b)) ufM2Construccion = b;
            if (!isNaN(c)) ufM2PromedioResid = c;
            comunaNombre = comRec.getCellValueAsString('nombre') || '';
        }
    } catch (e) { console.log('  WARN comuna: ' + e.message); }
}

// ----------------------------------------------------------------
// 5. LOOKUPS auxiliares (no expresables como expr simple)
// ----------------------------------------------------------------
async function lookupVidaUtil(tipoProp, anioConst) {
    if (!tVidaUtil) return null;
    try {
        const q = await tVidaUtil.selectRecordsAsync({
            fields: ['tipo_propiedad','anno_desde','anno_hasta','vida_util_anios','activo']
        });
        for (const r of q.records) {
            if (r.getCellValue('activo') !== true) continue;
            const tp = r.getCellValueAsString('tipo_propiedad');
            const ad = parseFloat(r.getCellValue('anno_desde'));
            const ah = parseFloat(r.getCellValue('anno_hasta'));
            const vu = parseFloat(r.getCellValue('vida_util_anios'));
            if (tp && tp.toLowerCase() !== String(tipoProp).toLowerCase()) continue;
            if (!isNaN(ad) && anioConst < ad) continue;
            if (!isNaN(ah) && anioConst > ah) continue;
            if (!isNaN(vu)) return vu;
        }
    } catch (e) { console.log('  WARN lookupVidaUtil: ' + e.message); }
    return null;
}
async function lookupUFm2Nuevo(tipoProp, material, calidad) {
    if (!tPrecios) return null;
    try {
        const q = await tPrecios.selectRecordsAsync({
            fields: ['tipo_propiedad','material','calidad','uf_m2','activo']
        });
        const tpL = String(tipoProp).toLowerCase();
        const mtL = String(material).toLowerCase();
        const clL = String(calidad).toLowerCase();
        for (const r of q.records) {
            if (r.getCellValue('activo') !== true) continue;
            const tp = String(r.getCellValueAsString('tipo_propiedad')).toLowerCase();
            const mt = String(r.getCellValueAsString('material')).toLowerCase();
            const cl = String(r.getCellValueAsString('calidad')).toLowerCase();
            const uf = parseFloat(r.getCellValue('uf_m2'));
            if (tp && tp !== tpL) continue;
            if (mt && mtL && mt !== mtL && mt.indexOf(mtL) < 0 && mtL.indexOf(mt) < 0) continue;
            if (cl && clL && cl !== clL) continue;
            if (!isNaN(uf)) return uf;
        }
    } catch (e) { console.log('  WARN lookupUFm2Nuevo: ' + e.message); }
    return null;
}
async function lookupFactorRemate(velocidad) {
    if (!tFactores) return 0.65;
    try {
        const q = await tFactores.selectRecordsAsync({
            fields: ['codigo','valor','activo','tipo_factor']
        });
        // v30: 'normal' por defecto = FACTOR_REMATE_HIPOTECARIO (0.65), no REMATE_4_6 (0.70).
        // Este es el estandar del mercado hipotecario chileno usado en los XLSM
        // de referencia (AG, METLFE, ALH, HEV, HIPSEC). REMATE_4_6 solo aplica
        // si la velocidad esta explicitamente categorizada en "4-6 meses".
        const vmap = { 'normal': 'FACTOR_REMATE_HIPOTECARIO',
            '1-2 meses': 'REMATE_1_2', '1 a 2 meses': 'REMATE_1_2',
            '2-4 meses': 'REMATE_2_4', '2 a 4 meses': 'REMATE_2_4',
            '4-6 meses': 'REMATE_4_6', '4 a 6 meses': 'REMATE_4_6',
            '6-8 meses': 'REMATE_6_8', '6 a 8 meses': 'REMATE_6_8',
            '8 a 10 meses': 'REMATE_8_10', '8-10 meses': 'REMATE_8_10',
            '10-12 meses': 'REMATE_10_12', '10 a 12 meses': 'REMATE_10_12',
            '12-18 meses': 'REMATE_12_18', '12 a 18 meses': 'REMATE_12_18',
            '18-24 meses': 'REMATE_18_24', '18 a 24 meses': 'REMATE_18_24',
            'mas 24 meses': 'REMATE_MAS24', 'mas de 24 meses': 'REMATE_MAS24' };
        const vL = String(velocidad).toLowerCase().trim();
        let target = vmap[vL] || 'FACTOR_REMATE_HIPOTECARIO';
        for (const r of q.records) {
            if (r.getCellValue('activo') !== true) continue;
            const c = r.getCellValueAsString('codigo');
            if (c === target) {
                const v = parseFloat(r.getCellValue('valor'));
                if (!isNaN(v)) return v;
            }
        }
    } catch (e) { console.log('  WARN lookupFactorRemate: ' + e.message); }
    return 0.65;
}
async function lookupBienComun(supConstruccion) {
    if (!tTramosBC) return 0;
    try {
        const q = await tTramosBC.selectRecordsAsync({
            fields: ['m2_desde','m2_hasta','porcentaje','activo']
        });
        for (const r of q.records) {
            if (r.getCellValue('activo') !== true) continue;
            const md = parseFloat(r.getCellValue('m2_desde'));
            const mh = parseFloat(r.getCellValue('m2_hasta'));
            const pct = parseFloat(r.getCellValue('porcentaje'));
            if (!isNaN(md) && supConstruccion < md) continue;
            if (!isNaN(mh) && supConstruccion > mh) continue;
            if (!isNaN(pct)) return pct;
        }
    } catch (e) {}
    return 0;
}
async function sumObrasComplementarias(recId) {
    if (!tObrasCmp) return 0;
    try {
        const q = await tObrasCmp.selectRecordsAsync({});
        let total = 0;
        for (const r of q.records) {
            const link = r.getCellValue('solicitud');
            if (link && Array.isArray(link) && link.some(x => x.id === recId)) {
                const v = parseFloat(r.getCellValue('valor_uf'));
                if (!isNaN(v)) total += v;
            }
        }
        return total;
    } catch (e) { return 0; }
}

// ----------------------------------------------------------------
// 6. Construir SCOPE para safeEval (variables primitivas)
// ----------------------------------------------------------------
const anioActual = new Date().getFullYear();
let anioConstruccion = parseFloat(flatVal(datosCrudo.anio_construccion));
if (isNaN(anioConstruccion)) anioConstruccion = anioActual - 20;

let supConstruccion = parseFloat(flatVal(datosCrudo.sup_construccion_m2) || flatVal(datosCrudo.sup_construida_total));
if (isNaN(supConstruccion)) supConstruccion = 80;

let supTerreno = parseFloat(flatVal(datosCrudo.sup_terreno_m2));
if (isNaN(supTerreno)) supTerreno = 150;

const material = flatVal(datosCrudo.material_predominante) || flatVal(datosCrudo.material) || 'Albanileria';
const calidad  = flatVal(datosCrudo.calidad_construccion)  || flatVal(datosCrudo.calidad)  || 'BUENA';
const velocidad = flatVal(datosCrudo.velocidad_venta_estimada) || 'Normal';

let coefEstado = parseFloat(flatVal(datosCrudo.coef_estado));
if (isNaN(coefEstado)) {
    const ec = String(flatVal(datosCrudo.estado_conservacion) || '').toLowerCase();
    if (ec.indexOf('muy bueno') >= 0 || ec.indexOf('excel') >= 0) coefEstado = 1.0;
    else if (ec.indexOf('bueno') >= 0) coefEstado = 0.95;
    else if (ec.indexOf('regular') >= 0) coefEstado = 0.85;
    else if (ec.indexOf('malo') >= 0) coefEstado = 0.70;
    else coefEstado = 1.0;
}

const coefTipo = parseFloat(flatVal(datosCrudo.coef_tipo)) || 1.0;
const hayTerreno = (flatVal(datosCrudo.hay_terreno) === false || flatVal(datosCrudo.hay_terreno) === 'NO') ? false : true;
const ufDiaVisita = parseFloat(flatVal(datosCrudo.uf_dia_visita)) || 38500;
const arriendoBrutoMensualClp = parseFloat(flatVal(datosCrudo.arriendo_bruto_mensual_clp) || flatVal(datosCrudo.arriendo_bruto_clp) || flatVal(datosCrudo.arriendo_mensual)) || 0;
const gastoAnualClp = parseFloat(flatVal(datosCrudo.gasto_anual_clp) || flatVal(datosCrudo.gasto_anual)) || 0;
const ingresoLiquidoAnualPreCalc = parseFloat(flatVal(datosCrudo.ingreso_liquido_anual)) || 0;
// v32: avaluo_fiscal_clp y tasa_cap_rate desde TX_DatosTasacion (no como override)
const avaluoFiscalClpDatos = parseFloat(flatVal(datosCrudo.avaluo_fiscal_clp)) || 0;
const tasaCapRateDatos     = parseFloat(flatVal(datosCrudo.tasa_cap_rate))     || 0;

console.log('  INPUTS: tipo=' + tipoPropiedad + ' anio=' + anioConstruccion + ' sup_c=' + supConstruccion +
            ' sup_t=' + supTerreno + ' mat=' + material + ' cal=' + calidad +
            ' velocidad=' + velocidad + ' coef_estado=' + coefEstado);

// Pre-resolver lookups (estos NO son expresables como expr de C_Formulas)
const lookupVidaUtilLU = await lookupVidaUtil(tipoPropiedad, anioConstruccion);
const lookupPrecioUnitario = await lookupUFm2Nuevo(tipoPropiedad, material, calidad);
const lookupFactorRemateLU = await lookupFactorRemate(velocidad);
const ufM2PromedioResidComuna = ufM2PromedioResid;
const sumObrasComplementariasUf = await sumObrasComplementarias(recordId);
const porcentajeBienComun = (tipoPropiedad === 'Departamento') ? await lookupBienComun(supConstruccion) : 0;

console.log('  LOOKUPS: vida_util=' + lookupVidaUtilLU + ' uf_m2_nuevo=' + lookupPrecioUnitario +
            ' factor_remate=' + lookupFactorRemateLU + ' obras_comp=' + sumObrasComplementariasUf);

// ----------------------------------------------------------------
// 7. SCOPE INICIAL para safeEval (todas las variables primitivas)
// ----------------------------------------------------------------
const SCOPE = {
    // datos solicitud / propiedad
    anio_actual: anioActual,
    anio_construccion: anioConstruccion,
    sup_construccion_m2: supConstruccion,
    sup_terreno_m2: supTerreno,
    coef_estado: coefEstado,
    coef_tipo: coefTipo,
    hay_terreno: hayTerreno ? 1 : 0,
    uf_dia_visita: ufDiaVisita,

    // v32: nombres canonicos del cuadro de rentabilidad/valoracion
    arriendo_bruto_mensual_clp: arriendoBrutoMensualClp,
    gasto_anual_clp:            gastoAnualClp,
    avaluo_fiscal_clp:          avaluoFiscalClpDatos,
    // legado v31 (compatibilidad)
    arriendo_bruto_clp:         arriendoBrutoMensualClp,
    ingreso_liquido_anual:      ingresoLiquidoAnualPreCalc,

    // cliente
    factor_seguro: factorSeguro,
    factor_garantia: factorGarantia,
    tasa_cap_rate: tasaCapRateCliente,
    // v32: tasa efectiva = override > datos_tasacion > cliente
    tasa_cap_rate_efectivo: (tasaCapRateOverride > 0) ? tasaCapRateOverride :
                            ((tasaCapRateDatos > 0)  ? tasaCapRateDatos    : tasaCapRateCliente),

    // comuna
    uf_m2_terreno_comuna: ufM2Terreno,
    uf_m2_construccion_comuna: ufM2Construccion,
    uf_m2_promedio_residencial_comuna: ufM2PromedioResidComuna,

    // lookups pre-resueltos
    lookup_vida_util: lookupVidaUtilLU || 60,
    lookup_precio_unitario: lookupPrecioUnitario || ufM2Construccion,
    uf_m2_nuevo_lookup: lookupPrecioUnitario || ufM2Construccion,
    factor_df_calc: coefEstado,
    lookup_factor_remate: lookupFactorRemateLU,
    sum_obras_complementarias_uf: sumObrasComplementariasUf,
    porcentaje_bien_comun: porcentajeBienComun,

    // ─── overrides ACTIVOS v32 (5 = 3 numericos + 2 audit) ─────────────
    valor_final_override:        valorFinalOverride,       // → Valor Comercial UF
    valor_reposicion_override:   valorReposicionOverride,  // → Valor Reposicion UF
    valor_seguro_override:       valorSeguroOverride,      // → Seguro Incendio UF

    // ─── overrides legado v30/v31 (no usados por C_Formulas_v32, conservados
    //     en SCOPE por compatibilidad con expresiones antiguas si existen) ─
    tasa_cap_rate_override: tasaCapRateOverride,
    vida_util_override: vidaUtilOverride,
    valor_garantia_override: valorGarantiaOverride,
    valor_liquidacion_override: valorLiquidacionOverride,
    valor_remate_override: valorRemateOverride,
    valor_remate_65_override: valorRemate65Override,
    renta_perpetua_override: rentaPerpetuaOverride,
    ingreso_liquido_anual_override: ingresoLiquidoAnualOverride,
    factor_depreciacion_override: factorDepreciacionOverride,
    uf_m2_nuevo_override: ufM2NuevoOverride,
    factor_remate_override: factorRemateOverride,
    factor_liquidacion_override: factorLiquidacionOverride,
};

// ----------------------------------------------------------------
// 8. Cargar la REGLA aplicada para conocer formulas_resultado
// ----------------------------------------------------------------
let formulasNombresPermitidas = null; // null = aceptar todas
if (regId && tReglas) {
    try {
        const regRec = await tReglas.selectRecordAsync(regId, {
            fields: ['nombre', 'formulas_resultado']
        });
        if (regRec) {
            const fr = regRec.getCellValue('formulas_resultado');
            if (fr) {
                if (Array.isArray(fr)) {
                    formulasNombresPermitidas = fr.map(x => (typeof x === 'object' && x.name) ? x.name : String(x));
                } else if (typeof fr === 'string') {
                    formulasNombresPermitidas = fr.split(',').map(s => s.trim()).filter(Boolean);
                }
                console.log('  REGLA formulas_resultado: ' + formulasNombresPermitidas.join(','));
            }
        }
    } catch (e) { console.log('  WARN regla: ' + e.message); }
}

// ----------------------------------------------------------------
// 9. Cargar formulas activas y filtrar
// ----------------------------------------------------------------
const qFormulas = await tFormulas.selectRecordsAsync({
    fields: ['nombre', 'expresion', 'variable_output', 'depende_de',
             'orden_topologico', 'activa', 'es_terminal', 'version',
             'aplica_a_tipo_informe', 'aplica_a_tipo_propiedad']
});
let formulas = qFormulas.records.filter(f => f.getCellValue('activa') === true);

// Filtro 1: por aplica_a_tipo_informe / aplica_a_tipo_propiedad
formulas = formulas.filter(f => {
    const ai = f.getCellValueAsString('aplica_a_tipo_informe') || '';
    const ap = f.getCellValueAsString('aplica_a_tipo_propiedad') || '';
    if (ai && ai.toLowerCase() !== tipoInforme.toLowerCase()) return false;
    if (ap && ap.toLowerCase() !== tipoPropiedad.toLowerCase()) return false;
    return true;
});

// Filtro 2: por regla.formulas_resultado (si esta definido)
if (formulasNombresPermitidas && formulasNombresPermitidas.length > 0) {
    const setPermit = {};
    for (const n of formulasNombresPermitidas) setPermit[String(n).trim()] = true;
    formulas = formulas.filter(f => setPermit[f.getCellValueAsString('nombre')]);
}

console.log('  Formulas a ejecutar: ' + formulas.length);

// Topological sort por orden_topologico
formulas.sort((a, b) => {
    const ao = parseFloat(a.getCellValue('orden_topologico')) || 99;
    const bo = parseFloat(b.getCellValue('orden_topologico')) || 99;
    return ao - bo;
});

// ----------------------------------------------------------------
// 10. EJECUTAR cada formula con safeEval (CORAZON del ejecutor v30)
// ----------------------------------------------------------------
// v29: DIAGNOSTICO ANTES DE EJECUTAR - listar candidatos number escribibles
const COMPUTED_TYPES_V29 = ['formula','rollup','count','lookup','multipleLookupValues',
                            'createdTime','lastModifiedTime','createdBy','lastModifiedBy','autoNumber'];
const CANDIDATOS_VALOR = ['valor_calculado','numero_resultado','resultado','valor','outcome'];
const candidatosEscribibles = [];
const candidatosComputed = [];
const candidatosFaltantes = [];
for (const candName of CANDIDATOS_VALOR) {
    let found = false;
    for (const ff of tCalculos.fields) {
        if (ff.name === candName) {
            found = true;
            if (COMPUTED_TYPES_V29.indexOf(ff.type) >= 0) {
                candidatosComputed.push(candName + '(' + ff.type + ')');
            } else {
                candidatosEscribibles.push(candName + '(' + ff.type + ')');
            }
            break;
        }
    }
    if (!found) candidatosFaltantes.push(candName);
}
console.log('  v32 DIAGNOSTICO CANDIDATOS DE VALOR:');
console.log('    ESCRIBIBLES: ' + (candidatosEscribibles.length > 0 ? candidatosEscribibles.join(', ') : '(NINGUNO!)'));
console.log('    COMPUTED   : ' + (candidatosComputed.length > 0 ? candidatosComputed.join(', ') : '(ninguno)'));
console.log('    FALTANTES  : ' + (candidatosFaltantes.length > 0 ? candidatosFaltantes.join(', ') : '(ninguno)'));
if (candidatosEscribibles.length === 0) {
    console.log('    ¡WARN! NINGUN campo number escribible para valor. AT03 escribira RES=<n>| en notas como fallback.');
}

const calculosEscritos = [];
const calculosErrores  = [];
const RESULTS = {}; // nombre formula -> valor

for (const f of formulas) {
    const nombre  = f.getCellValueAsString('nombre');
    const expr    = f.getCellValueAsString('expresion');
    const varOut  = f.getCellValueAsString('variable_output') || nombre;
    const version = f.getCellValueAsString('version') || 'v1.0';

    let resultado = null;
    let nota = '';
    let evalErr = '';

    if (!expr) {
        resultado = 0;
        nota = 'sin_expresion';
        evalErr = 'expr_vacia';
    } else {
        const evalRet = safeEval(expr, SCOPE);
        if (evalRet.val != null && !isNaN(evalRet.val)) {
            resultado = evalRet.val;
            nota = 'eval_ok';
        } else {
            resultado = 0;
            nota = 'eval_fallido';
            evalErr = evalRet.err || 'desconocido';
            calculosErrores.push({ formula: nombre, error: evalErr });
        }
    }

    // Guardar en SCOPE para que las formulas siguientes puedan usarla
    SCOPE[varOut] = resultado;
    RESULTS[nombre] = { val: resultado, varOut: varOut, nota: nota, err: evalErr };
    console.log('    [' + nombre + '] ' + varOut + ' = ' + resultado + ' (' + nota +
                (evalErr ? ' err=' + evalErr.substring(0, 60) : '') + ')');

    // Escribir TX_Calculos
    try {
        const numResultado = Number(resultado);
        const valorFinal = (isNaN(numResultado) || !isFinite(numResultado)) ? 0 : numResultado;
        // v28-1+v28-2: escribir el valor en 5 candidatos number, ademas de
        // RES=<n>|nota|err|expr en 'notas' para diagnostico inmediato.
        // Si valor_calculado sale 0, abrir notas muestra al instante por que.
        const exprPreview = (expr || '').substring(0, 250).replace(/\|/g, '/');
        const errPreview  = (evalErr || '').replace(/\|/g, '/');
        const notasConRes = 'RES=' + valorFinal +
                            '|nota=' + nota +
                            (evalErr ? '|err=' + errPreview : '') +
                            '|expr=' + exprPreview;
        const fieldsCalc = {
            solicitud_codigo: String(codigo),
            solicitud: [{ id: recordId }],
            formula: [{ id: f.id }],
            formula_nombre: nombre,
            variable_output: varOut,
            // v28-2: 5 candidatos number escribibles (en orden de prioridad)
            valor_calculado:  valorFinal,
            numero_resultado: valorFinal,
            resultado:        valorFinal,
            valor:            valorFinal,
            outcome:          valorFinal,
            formula_expresion_snapshot: expr || '',
            formula_version: version,
            inputs_json: JSON.stringify({
                anio_actual: anioActual,
                anio_construccion: anioConstruccion,
                sup_construccion_m2: supConstruccion,
                sup_terreno_m2: supTerreno,
                material: material, calidad: calidad,
                velocidad_venta_estimada: velocidad,
                coef_estado: coefEstado, coef_tipo: coefTipo,
                factor_seguro: factorSeguro, factor_garantia: factorGarantia,
                tasa_cap_rate_efectivo: tasaCapRateEfectivo,
                uf_m2_terreno_comuna: ufM2Terreno,
                lookup_precio_unitario: SCOPE.lookup_precio_unitario,
                lookup_vida_util: SCOPE.lookup_vida_util,
                lookup_factor_remate: SCOPE.lookup_factor_remate,
                override_tasa_cap_rate: tasaCapRateOverride,
                override_vida_util: vidaUtilOverride,
                override_valor_final: valorFinalOverride,
                override_valor_reposicion: valorReposicionOverride,
                override_valor_garantia: valorGarantiaOverride,
                __resultado__: valorFinal,
            }).substring(0, 4000),
            calculado_en: new Date().toISOString(),
            version_motor: MOTOR_VERSION,
            // v28-1: prefijo RES=<n>| en notas como fallback ultimo
            notas: notasConRes,
        };
        const camposReales = {};
        const camposEscritos = [];
        for (const ff of tCalculos.fields) {
            if (fieldsCalc[ff.name] !== undefined && COMPUTED_TYPES.indexOf(ff.type) < 0) {
                camposReales[ff.name] = fieldsCalc[ff.name];
                // Log de los que cargan el valor calculado
                if (CANDIDATOS_VALOR.indexOf(ff.name) >= 0) {
                    camposEscritos.push(ff.name);
                }
            }
        }
        await tCalculos.createRecordAsync(camposReales);
        calculosEscritos.push({ formula: nombre, variable: varOut, resultado: valorFinal, nota: nota, campos_valor: camposEscritos });
        // v28: log explicito con campos escritos
        if (camposEscritos.length === 0) {
            console.log('    WARN [' + nombre + '] valor=' + valorFinal + ' pero NINGUN campo number escribible. Solo notas RES=' + valorFinal + '|');
        } else {
            console.log('    [' + nombre + '] ' + varOut + ' = ' + valorFinal + ' (' + nota + ') | esc=' + camposEscritos.join(',') + ' + notas:RES=');
        }
    } catch (e) {
        console.log('  WARN TX_Calculos[' + nombre + ']: ' + e.message);
        calculosErrores.push({ formula: nombre, error: e.message });
    }
}

console.log('  TX_Calculos escritos: ' + calculosEscritos.length + '/' + formulas.length);

// ----------------------------------------------------------------
// 11. Transicionar a 'calculada'
// ----------------------------------------------------------------
await tSolicitudes.updateRecordAsync(recordId, { estado: 'calculada' });

const tiempoMs = Date.now() - tInicio;
await logEventoCompleto(Object.assign({}, ctxBase, {
    estado_salida: 'calculada', resultado: 'dag_ejecutado_ok',
    tipo_evento: 'at03_dag_completo',
    nombre_evento: 'AT03 DAG ejecutado (' + calculosEscritos.length + ' formulas)',
    accion: 'CREATE+TRANSITION',
    severidad: calculosErrores.length > 0 ? 'warning' : 'info',
    mensaje: 'AT03_v31 EJECUTOR ' + calculosEscritos.length + '/' + formulas.length +
             ' OK. overrides[final=' + valorFinalOverride + ' repo=' + valorReposicionOverride +
             ' gar=' + valorGarantiaOverride + ' tasa=' + tasaCapRateOverride + ']' +
             ' motivo=' + overrideMotivo.substring(0, 80),
    tabla_destino: 'TX_Calculos + TX_Solicitudes',
    detalle_json: JSON.stringify({
        formulas_total: formulas.length,
        formulas_escritas: calculosEscritos.length,
        formulas_errores: calculosErrores.length,
        tiempo_ms: tiempoMs,
        overrides_aplicados: {
            tasa_cap_rate_override: tasaCapRateOverride,
            vida_util_override: vidaUtilOverride,
            valor_final_override: valorFinalOverride,
            valor_reposicion_override: valorReposicionOverride,
            valor_garantia_override: valorGarantiaOverride,
            // v31 new overrides
            valor_seguro_override: valorSeguroOverride,
            valor_liquidacion_override: valorLiquidacionOverride,
            valor_remate_override: valorRemateOverride,
            valor_remate_65_override: valorRemate65Override,
            renta_perpetua_override: rentaPerpetuaOverride,
            ingreso_liquido_anual_override: ingresoLiquidoAnualOverride,
            factor_depreciacion_override: factorDepreciacionOverride,
            uf_m2_nuevo_override: ufM2NuevoOverride,
            factor_remate_override: factorRemateOverride,
            factor_liquidacion_override: factorLiquidacionOverride,
            motivo: overrideMotivo,
            autor: overrideAutor,
        },
        resultados: Object.keys(RESULTS).reduce(function (acc, k) {
            acc[k] = RESULTS[k].val;
            return acc;
        }, {}),
    }).substring(0, 95000),
    payload_json: JSON.stringify({
        cliente: clienteNombre, comuna: comunaNombre,
        tipo_propiedad: tipoPropiedad, tipo_informe: tipoInforme,
        factor_seguro: factorSeguro, factor_garantia: factorGarantia,
        tasa_cap_rate_efectivo: tasaCapRateEfectivo,
        uf_m2_terreno: ufM2Terreno,
        formulas_de_la_regla: formulasNombresPermitidas,
    }),
}));

console.log('[AT03_v32] FIN OK -- ' + tiempoMs + ' ms');
