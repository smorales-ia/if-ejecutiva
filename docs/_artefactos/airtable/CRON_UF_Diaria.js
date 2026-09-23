/***********************************************************************
 * CRON "UF diaria" — puebla H_PreciosUF desde mindicador.cl
 * =====================================================================
 * T-AUDIT-CLOSE-20260923 · paso M4. Prerequisito OPERATIVO del guard H3
 * de AT03_Calculos_DAG (T-MC-P0): sin fila de UF para `fecha_visita`,
 * el motor aborta fail-ruidoso (`uf_no_cargada_para_fecha`). Este cron
 * es el escritor que mantiene la tabla al día.
 *
 * MOTOR:    Airtable Automation · trigger "At a scheduled time" (diario).
 *           NO es Make: no necesita webhook/HMAC y vive junto a AT01/AT03/
 *           AT08 en el mismo catálogo de automations de la base.
 * FUENTE:   mindicador.cl (API pública, sin key) — GET /api/uf/dd-mm-yyyy.
 * CONTRATO: H_PreciosUF · campos `fecha` (date, match exacto yyyy-mm-dd en
 *           AT03 `:1056-1064`) y `valor_clp` (number > 0).
 *
 * COMPORTAMIENTO:
 *  · Idempotente: solo crea filas para fechas que NO existen (re-runs y
 *    solapamientos de ventana no duplican).
 *  · Self-healing: cubre hoy + LOOKBACK_DIAS hacia atrás, para reponer
 *    huecos si el cron falló días anteriores.
 *  · Si el fetch falla o la API no trae valor: NO escribe nada, loguea y
 *    deja evento `uf_fetch_fallido` en A_Eventos. Consecuencia deliberada
 *    (plan §12-Q3, comportamiento recomendado): H3 aborta las tasaciones
 *    de esa fecha hasta que la UF exista — jamás un default silencioso.
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

// ── 1. Fechas objetivo (yyyy-mm-dd) ─────────────────────────────────────
// El trigger corre en horario de la base (America/Santiago, ver DEPLOY);
// toISOString es UTC, pero a la hora programada (08:00 -03/-04) la fecha
// UTC coincide con la chilena, así que el slice es estable.
const hoyMs = Date.now();
const fechasObjetivo = [];
for (let i = 0; i <= LOOKBACK_DIAS; i++) {
    fechasObjetivo.push(new Date(hoyMs - i * 86400000).toISOString().slice(0, 10));
}

// ── 2. Fechas ya cargadas (idempotencia) ────────────────────────────────
const q = await tPrecios.selectRecordsAsync({ fields: ['fecha'] });
const existentes = new Set();
for (const r of q.records) {
    const f = String(r.getCellValueAsString('fecha') || '').slice(0, 10);
    if (f) existentes.add(f);
}

const pendientes = fechasObjetivo.filter((f) => !existentes.has(f));
console.log(`UF-diaria: objetivo=${fechasObjetivo.length} · ya cargadas=${fechasObjetivo.length - pendientes.length} · a buscar=${pendientes.length}`);

// ── 3. Fetch secuencial a mindicador.cl y alta de filas ─────────────────
const fallidas = [];
for (const fecha of pendientes) {
    const [y, m, d] = fecha.split('-');
    let valor = NaN;
    try {
        const resp = await fetch(`https://mindicador.cl/api/uf/${d}-${m}-${y}`);
        const json = await resp.json();
        const serie = (json && Array.isArray(json.serie)) ? json.serie : [];
        // La serie puede traer más de un punto: casar por fecha exacta.
        const fila = serie.find((s) => String(s.fecha || '').slice(0, 10) === fecha);
        if (fila) valor = parseFloat(fila.valor);
    } catch (eFetch) {
        console.log(`  ERROR fetch ${fecha}: ${eFetch.message}`);
    }

    if (!isNaN(valor) && valor > 0) {
        await tPrecios.createRecordAsync({ 'fecha': fecha, 'valor_clp': valor });
        console.log(`  OK ${fecha} → ${valor}`);
    } else {
        // Sin valor: no se escribe nada. H3 abortará las tasaciones con esta
        // fecha_visita hasta que la fila exista — ese es el diseño (plan §12-Q3).
        fallidas.push(fecha);
        console.log(`  SIN-VALOR ${fecha} (API sin dato o fetch fallido) — no se escribe`);
    }
}

// ── 4. Evento ruidoso si quedó alguna fecha sin UF ──────────────────────
if (fallidas.length > 0 && tEventos) {
    try {
        await tEventos.createRecordAsync({ 'tipo_evento': 'uf_fetch_fallido ' + fallidas.join(',') });
    } catch (eEv) {
        console.log('  ERROR A_Eventos[uf_fetch_fallido]: ' + eEv.message);
    }
}

console.log(`UF-diaria: fin · nuevas=${pendientes.length - fallidas.length} · fallidas=${fallidas.length}`);
