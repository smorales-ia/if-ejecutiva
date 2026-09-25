/***********************************************************************
 * CRON "UF diaria" — puebla H_PreciosUF desde mindicador.cl (UF + dólar)
 * =====================================================================
 * T-AUDIT-CLOSE-20260923 · paso M4. Prerequisito OPERATIVO del guard H3
 * de AT03_Calculos_DAG (T-MC-P0): sin fila de UF para `fecha_visita`,
 * el motor aborta fail-ruidoso (`uf_no_cargada_para_fecha`). Este cron
 * es el escritor que mantiene la tabla al día.
 *
 * T-ARREGLOS-DOCS-20260925 · P1-3 (roadmap §2-T2): se amplía para
 * escribir también `tipo_cambio_usd` (fldlFxWDnK67OajaE — el informe
 * imprime "1US$=", E-103) y para emitir alerta crítica a 2 fallos.
 *
 * MOTOR:    Airtable Automation · trigger "At a scheduled time" (diario).
 *           NO es Make: no necesita webhook/HMAC y vive junto a AT01/AT03/
 *           AT08 en el mismo catálogo de automations de la base.
 * FUENTE:   mindicador.cl (API pública, sin key) — GET /api/uf/dd-mm-yyyy
 *           y GET /api/dolar/dd-mm-yyyy.
 * CONTRATO: H_PreciosUF · campos `fecha` (date, match exacto yyyy-mm-dd en
 *           AT03 `:1056-1064`), `valor_clp` (number > 0), `tipo_cambio_usd`
 *           (number > 0, opcional), `fuente` (singleSelect · 'mindicador'),
 *           `notas` (multilineText · traza del arrastre de dólar).
 *
 * COMPORTAMIENTO:
 *  · Idempotente: solo crea filas para fechas que NO existen (re-runs y
 *    solapamientos de ventana no duplican). Filas existentes SIN dólar
 *    dentro de la ventana se backfillean (rama UPDATE) — nunca se pisa
 *    un `tipo_cambio_usd` ya cargado.
 *  · Self-healing: cubre hoy + LOOKBACK_DIAS hacia atrás, para reponer
 *    huecos si el cron falló días anteriores.
 *  · Si el fetch de UF falla o la API no trae valor: NO escribe nada,
 *    loguea y deja evento `uf_fetch_fallido` en A_Eventos. Consecuencia
 *    deliberada (plan §12-Q3, comportamiento recomendado): H3 aborta las
 *    tasaciones de esa fecha hasta que la UF exista — jamás un default
 *    silencioso.
 *  · Si ≥2 fechas de la ventana siguen sin UF al final de la corrida
 *    (equivale a "falló ayer y volvió a fallar hoy": el lookback las
 *    acumula), se emite además `uf_fetch_fallido_critico` con severidad
 *    CRITICO. Ambos eventos usan SOLO campos reales de A_Eventos
 *    (`tipo_evento` · `descripcion` · `detalle_json` · `severidad`) —
 *    aprendizaje 2026-09-23: NO existe campo `mensaje`.
 *
 * REGLA DE FIN DE SEMANA / FERIADO PARA EL DÓLAR (decisión P1-3):
 *  El dólar interbancario NO se publica sábados, domingos ni feriados
 *  (mindicador devuelve serie vacía esos días). Para esas fechas se usa
 *  el último valor hábil DISPONIBLE dentro de la propia ventana (hasta
 *  LOOKBACK_DIAS hacia atrás desde la fecha), dejando la traza en
 *  `notas` ("dolar de yyyy-mm-dd (ultimo habil disponible)"). El informe
 *  imprime "1US$=" del día de referencia; arrastrar el último hábil es
 *  la convención bancaria estándar. Si mindicador no responde para una
 *  fecha ni con este arrastre: la fila queda SIN dólar (no se inventa,
 *  no hay default) y la próxima corrida la backfillea. La UF NO se
 *  bloquea por falta de dólar: la fila se crea igual con `valor_clp`.
 *
 * DEPLOY: ver docs/_artefactos/airtable/CRON_UF_Diaria_DEPLOY.md.
 * ROLLBACK (plan §9): desactivar la automation; H_PreciosUF es aditiva —
 * borrar a mano las filas de fechas erróneas si las hubiera.
 ***********************************************************************/

// Días hacia atrás a verificar/reponer además de hoy. Para un backfill
// puntual (visitas antiguas sin fila), subirlo temporalmente y correr una vez.
const LOOKBACK_DIAS = 7;

const tPrecios = base.getTable('H_PreciosUF');
let tEventos = null;
try { tEventos = base.getTable('A_Eventos'); } catch (e) {}

// ── 0. Helpers ──────────────────────────────────────────────────────────
// Resta n días a una fecha yyyy-mm-dd. Ancla a mediodía UTC para que la
// aritmética de 86400000 ms nunca cruce de día por redondeos.
function isoMenosDias(fechaIso, n) {
    return new Date(Date.parse(fechaIso + 'T12:00:00Z') - n * 86400000)
        .toISOString().slice(0, 10);
}

// Fetch genérico a mindicador: devuelve el valor del indicador para la
// fecha EXACTA, o NaN si la API no trae dato / el fetch falla.
async function fetchIndicador(indicador, fecha) {
    const [y, m, d] = fecha.split('-');
    try {
        const resp = await fetch(`https://mindicador.cl/api/${indicador}/${d}-${m}-${y}`);
        const json = await resp.json();
        const serie = (json && Array.isArray(json.serie)) ? json.serie : [];
        // La serie puede traer más de un punto: casar por fecha exacta.
        const fila = serie.find((s) => String(s.fecha || '').slice(0, 10) === fecha);
        const v = fila ? parseFloat(fila.valor) : NaN;
        return (!isNaN(v) && v > 0) ? v : NaN;
    } catch (eFetch) {
        console.log(`  ERROR fetch ${indicador} ${fecha}: ${eFetch.message}`);
        return NaN;
    }
}

// Dólar con regla de último hábil (ver JSDoc). Cache por fecha para no
// repetir fetches cuando varias fechas del lookback caen al mismo hábil.
const dolarCache = new Map(); // fecha yyyy-mm-dd → number | NaN
async function resolverDolar(fecha) {
    for (let i = 0; i <= LOOKBACK_DIAS; i++) {
        const f = isoMenosDias(fecha, i);
        if (!dolarCache.has(f)) dolarCache.set(f, await fetchIndicador('dolar', f));
        const v = dolarCache.get(f);
        if (!isNaN(v) && v > 0) return { valor: v, fechaOrigen: f };
    }
    return null; // sin dato en toda la ventana: la fila queda sin dólar
}

// Evento a A_Eventos con SOLO campos reales del schema (2026-09-23).
async function emitirEvento(tipo, severidad, descripcion, detalle) {
    if (!tEventos) return;
    try {
        await tEventos.createRecordAsync({
            'tipo_evento': tipo,
            'descripcion': descripcion,
            'detalle_json': JSON.stringify(detalle),
            'severidad': { name: severidad }, // singleSelect: {name:v} (CI-071)
        });
    } catch (eEv) {
        console.log(`  ERROR A_Eventos[${tipo}]: ${eEv.message}`);
    }
}

// ── 1. Fechas objetivo (yyyy-mm-dd) ─────────────────────────────────────
// El trigger corre en horario de la base (America/Santiago, ver DEPLOY);
// toISOString es UTC, pero a la hora programada (08:00 -03/-04) la fecha
// UTC coincide con la chilena, así que el slice es estable.
const hoy = new Date(Date.now()).toISOString().slice(0, 10);
const fechasObjetivo = [];
for (let i = 0; i <= LOOKBACK_DIAS; i++) {
    fechasObjetivo.push(isoMenosDias(hoy, i));
}

// ── 2. Filas existentes (idempotencia + candidatas a backfill de dólar) ─
const q = await tPrecios.selectRecordsAsync({ fields: ['fecha', 'tipo_cambio_usd', 'notas'] });
const filaPorFecha = new Map(); // fecha → { id, tieneDolar, notas }
for (const r of q.records) {
    const f = String(r.getCellValueAsString('fecha') || '').slice(0, 10);
    if (!f) continue; // filas sin fecha (huérfanas) se ignoran — limpiarlas es paso manual
    filaPorFecha.set(f, {
        id: r.id,
        tieneDolar: !!r.getCellValue('tipo_cambio_usd'),
        notas: r.getCellValueAsString('notas') || '',
    });
}

const pendientesUF = fechasObjetivo.filter((f) => !filaPorFecha.has(f));
const pendientesDolar = fechasObjetivo.filter(
    (f) => filaPorFecha.has(f) && !filaPorFecha.get(f).tieneDolar
);
console.log(`UF-diaria: objetivo=${fechasObjetivo.length} · ya cargadas=${fechasObjetivo.length - pendientesUF.length} · a buscar UF=${pendientesUF.length} · backfill dolar=${pendientesDolar.length}`);

// ── 3. Altas: fetch de UF + dólar y creación de filas nuevas ────────────
const fallidasUF = [];
const sinDolar = [];
let nuevas = 0;
for (const fecha of pendientesUF) {
    const uf = await fetchIndicador('uf', fecha);

    if (isNaN(uf)) {
        // Sin valor UF: no se escribe nada. H3 abortará las tasaciones con esta
        // fecha_visita hasta que la fila exista — ese es el diseño (plan §12-Q3).
        fallidasUF.push(fecha);
        console.log(`  SIN-VALOR UF ${fecha} (API sin dato o fetch fallido) — no se escribe`);
        continue;
    }

    const campos = {
        'fecha': fecha,
        'valor_clp': uf,
        'fuente': { name: 'mindicador' },
    };
    const dolar = await resolverDolar(fecha);
    if (dolar) {
        campos['tipo_cambio_usd'] = dolar.valor;
        if (dolar.fechaOrigen !== fecha) {
            campos['notas'] = `dolar de ${dolar.fechaOrigen} (ultimo habil disponible)`;
        }
    } else {
        sinDolar.push(fecha); // la fila se crea igual; el backfill la completará
    }

    await tPrecios.createRecordAsync(campos);
    nuevas++;
    console.log(`  OK ${fecha} → UF ${uf}${dolar ? ` · USD ${dolar.valor} (${dolar.fechaOrigen})` : ' · sin dolar'}`);
}

// ── 4. Backfill: filas existentes de la ventana sin tipo_cambio_usd ─────
let backfilleadas = 0;
for (const fecha of pendientesDolar) {
    const fila = filaPorFecha.get(fecha);
    const dolar = await resolverDolar(fecha);
    if (!dolar) {
        sinDolar.push(fecha);
        console.log(`  SIN-DOLAR ${fecha} — se reintenta en la próxima corrida`);
        continue;
    }
    const campos = {
        'tipo_cambio_usd': dolar.valor,
        'fuente': { name: 'mindicador' },
    };
    if (dolar.fechaOrigen !== fecha) {
        const nota = `dolar de ${dolar.fechaOrigen} (ultimo habil disponible)`;
        campos['notas'] = fila.notas ? `${fila.notas}\n${nota}` : nota;
    }
    await tPrecios.updateRecordAsync(fila.id, campos);
    backfilleadas++;
    console.log(`  BACKFILL ${fecha} → USD ${dolar.valor} (${dolar.fechaOrigen})`);
}

// ── 5. Eventos ruidosos si quedó alguna fecha sin UF ────────────────────
if (fallidasUF.length > 0) {
    await emitirEvento(
        'uf_fetch_fallido',
        'ERROR',
        `CRON_UF_Diaria: sin valor UF para ${fallidasUF.join(', ')}. H3 abortará las tasaciones con esas fechas de visita hasta que la fila exista.`,
        { fechas_fallidas: fallidasUF, lookback_dias: LOOKBACK_DIAS, sin_dolar: sinDolar }
    );
}
if (fallidasUF.length >= 2) {
    // Fallo repetido: el lookback arrastra las fechas no resueltas de corridas
    // anteriores, así que ≥2 fechas sin UF ⇒ el problema persiste (ayer + hoy).
    await emitirEvento(
        'uf_fetch_fallido_critico',
        'CRITICO',
        `CRON_UF_Diaria: ${fallidasUF.length} fechas de la ventana siguen sin UF (fallo repetido). Revisar mindicador.cl o cargar valor_clp a mano en H_PreciosUF.`,
        { fechas_fallidas: fallidasUF, lookback_dias: LOOKBACK_DIAS }
    );
}

console.log(`UF-diaria: fin · nuevas=${nuevas} · backfill_dolar=${backfilleadas} · sin_dolar=${sinDolar.length} · fallidas_uf=${fallidasUF.length}`);
