/**
 * ============================================================================
 * AT08_Alertas_SLA — Barrido diario de SLA (RF-08 agregado + RF-53 por etapa)
 * ============================================================================
 *
 * PROPÓSITO
 *   Recorre una vez al día la cartera viva de TX_Solicitudes, calcula los DOS
 *   semáforos que conviven en la Spec v1.9.9 §5.2 y deja constancia de los que
 *   caen fuera de verde:
 *     · Agregado (RF-08 · RN-04) — días hábiles desde el hito de §5.2.2 contra
 *       los umbrales de C_SLA.
 *     · Por etapa (RF-53 · §5.2.4) — horas hábiles de la etapa vigente contra
 *       la matriz de C_SLA_Etapas.
 *   Emite notificación SÓLO en rojo (§5.2.8 y decisión de §9.6: el ámbar vive
 *   en la bandeja y en el resumen diario; mandar correo en ámbar convierte la
 *   alerta roja en ruido de fondo en dos semanas).
 *
 * TRIGGER
 *   At scheduled time · Daily · 08:00 · America/Santiago.
 *
 * TABLAS QUE LEE
 *   TX_Solicitudes          tblaHTyMHYfmy7Fg6
 *   C_SLA                   tblsPZokEK5aoinTn
 *   C_SLA_Etapas            tbl05zu5RLhH3u6pl
 *   C_Feriados              tblJVh2kPd4uMgxpb   (nombre canónico · §9.6-R1)
 *   C_NotificacionesConfig  tbluB662ulWDaxqUY
 *
 * TABLAS QUE ESCRIBE
 *   TX_Notificaciones       tbldgLQgjdgsOSZnt   (una fila por solicitud en rojo;
 *                                                Make la observa y envía · SC13)
 *   A_Eventos               tblMKmDg2KrO5fMn8   (cronología de la alerta)
 *   LogEscenarios           tblR4VWpUHw1CSyIS   (resumen de la corrida)
 *
 * NO ESCRIBE TX_Solicitudes. Los campos sla_* los puebla el motor TS
 * (lib/sla-etapas.ts · Tanda B/C del plan §9.6). AT08 sólo observa.
 *
 * DISPARO DE SC13 — patrón vigente: se escribe la fila en TX_Notificaciones y
 * Make la observa. Nada de HTTP directo desde el script (no hay secreto HMAC
 * dentro de una Airtable Automation, y §9.6 exige que el envío pase por Make).
 *
 * PRECONDICIONES (ver el bloque de instrucciones al final del archivo)
 *   · Filas de C_NotificacionesConfig para sla_alerta_roja        → M-17
 *   · Opción AT08_SLA en LogEscenarios.Escenario                  → M-17
 *   · Fórmula sla_semaforo_etapa en TX_Solicitudes                → M-13
 *     (este script NO la necesita: recalcula por su cuenta. La fórmula es para
 *      la vista y el filtro de la bandeja.)
 *
 * ESTADO: NO ACTIVAR EN ESTA ITERACIÓN. Se crea en borrador (M-16), se prueba
 * en M-18 y recién ahí se activa.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

const TZ = 'America/Santiago';

/** Ventana hábil de §5.2.1: lunes a viernes, 09:00-18:00. */
const HORA_APERTURA = 9;
const HORA_CIERRE = 18;

/**
 * Estados que consumen SLA. Los tres excluidos son terminales: una solicitud
 * entregada, cerrada o cancelada no tiene reloj que correr.
 */
const ESTADOS_ACTIVOS = new Set([
  'creada',
  'asignada',
  'visitada',
  'calculada',
  'pdf_listo',
  'devuelta',
  'aprobada',
  'pendiente_final',
  'requiere_atencion',
]);

/** Tope defensivo: si la cartera crece, el script no debe agotar el runtime. */
const MAX_NOTIFICACIONES_POR_CORRIDA = 40;

// ---------------------------------------------------------------------------
// Calendario hábil — una sola implementación, dos usos (§5.2.1)
// ---------------------------------------------------------------------------

const _fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/**
 * Convierte un instante real a "milisegundos de reloj de pared de Santiago":
 * el mismo número que tendría ese reloj si Santiago fuera UTC. Todo el cómputo
 * hábil vive en ese espacio, así sumar 86.400.000 ms siempre cae a la misma
 * hora del día siguiente sin pelear con el horario de verano.
 *
 * Salvedad honesta: un intervalo que cruza un cambio de horario de verano puede
 * desviarse hasta 60 minutos. Con umbrales de 2 h a 48 h el efecto es tolerable
 * y la alternativa —aritmética de zona completa dentro de un Script Action— no
 * cabe en el runtime.
 */
function aRelojSantiago(fecha) {
  const p = {};
  for (const parte of _fmt.formatToParts(fecha)) {
    if (parte.type !== 'literal') p[parte.type] = parseInt(parte.value, 10);
  }
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

function isoDelDia(relojMs) {
  return new Date(relojMs).toISOString().slice(0, 10);
}

function medianoche(relojMs) {
  return Math.floor(relojMs / 86400000) * 86400000;
}

function esDiaHabil(relojMs, feriados) {
  const dia = new Date(relojMs).getUTCDay(); // 0 = domingo, 6 = sábado
  if (dia === 0 || dia === 6) return false;
  return !feriados.has(isoDelDia(relojMs));
}

/** Minutos hábiles entre dos instantes ya convertidos a reloj de Santiago. */
function minutosHabilesEntre(desde, hasta, feriados) {
  if (!(hasta > desde)) return 0;
  let total = 0;
  let cursor = medianoche(desde);
  const tope = medianoche(hasta);
  while (cursor <= tope) {
    if (esDiaHabil(cursor, feriados)) {
      const abre = cursor + HORA_APERTURA * 3600000;
      const cierra = cursor + HORA_CIERRE * 3600000;
      const ini = Math.max(desde, abre);
      const fin = Math.min(hasta, cierra);
      if (fin > ini) total += (fin - ini) / 60000;
    }
    cursor += 86400000;
  }
  return Math.round(total);
}

/**
 * Días hábiles transcurridos para el semáforo agregado (RN-04). El día de
 * ingreso es el día 0: una solicitud ingresada hoy no lleva ningún día.
 */
function diasHabilesEntre(desde, hasta, feriados) {
  if (!(hasta > desde)) return 0;
  let dias = 0;
  let cursor = medianoche(desde) + 86400000;
  const tope = medianoche(hasta);
  while (cursor <= tope) {
    if (esDiaHabil(cursor, feriados)) dias += 1;
    cursor += 86400000;
  }
  return dias;
}

// ---------------------------------------------------------------------------
// Carga de catálogos
// ---------------------------------------------------------------------------

const tSolicitudes = base.getTable('TX_Solicitudes');
const tSla = base.getTable('C_SLA');
const tEtapas = base.getTable('C_SLA_Etapas');
const tFeriados = base.getTable('C_Feriados');
const tNotifConfig = base.getTable('C_NotificacionesConfig');
const tNotificaciones = base.getTable('TX_Notificaciones');
const tEventos = base.getTable('A_Eventos');
const tLog = base.getTable('LogEscenarios');

const arrancoEn = Date.now();
const ahora = new Date();
const ahoraReloj = aRelojSantiago(ahora);
const hoyISO = isoDelDia(ahoraReloj);

/**
 * Feriados. Se filtra por activo Y por fecha no vacía: la fila basura de
 * C_Feriados (encabezado de CSV importado como dato) no tiene fecha y rompería
 * el Set con un undefined silencioso.
 */
async function cargarFeriados() {
  const q = await tFeriados.selectRecordsAsync({ fields: ['fecha', 'activo'] });
  const set = new Set();
  for (const r of q.records) {
    const fecha = r.getCellValue('fecha');
    if (!fecha) continue;
    if (r.getCellValue('activo') !== true) continue;
    set.add(String(fecha).slice(0, 10));
  }
  return set;
}

/** Matriz por etapa (§5.2.4). Los catorce números viven acá, no en el código. */
async function cargarMatriz() {
  const q = await tEtapas.selectRecordsAsync({
    fields: ['etapa_key', 'orden', 'nombre_etapa', 'responsable', 'sla_ideal_horas', 'sla_max_horas', 'activo'],
  });
  const matriz = {};
  for (const r of q.records) {
    if (r.getCellValue('activo') !== true) continue;
    const key = r.getCellValue('etapa_key');
    if (!key) continue;
    const responsable = r.getCellValue('responsable');
    matriz[key] = {
      etapaKey: key,
      orden: r.getCellValue('orden'),
      nombre: r.getCellValue('nombre_etapa'),
      responsable: responsable ? responsable.name : null,
      idealHoras: r.getCellValue('sla_ideal_horas'),
      maxHoras: r.getCellValue('sla_max_horas'),
    };
  }
  return matriz;
}

/**
 * Filas de C_SLA. Devuelve la fila comodín (los tres links vacíos) y las filas
 * específicas. La convención de comodín es el campo vacío, no un literal "*":
 * cliente / tipo_informe / tipo_propiedad son multipleRecordLinks (§9.6-R4).
 */
async function cargarSla() {
  const q = await tSla.selectRecordsAsync({
    fields: [
      'clave_natural', 'cliente', 'tipo_informe', 'tipo_propiedad',
      'dias_totales', 'dias_alerta_amarilla', 'dias_alerta_roja',
      'sla_revision_horas', 'activo', 'activo_desde',
    ],
  });
  const filas = [];
  let porDefecto = null;
  for (const r of q.records) {
    if (r.getCellValue('activo') !== true) continue;
    const fila = {
      id: r.id,
      clave: r.getCellValue('clave_natural'),
      cliente: idsDe(r.getCellValue('cliente')),
      tipoInforme: idsDe(r.getCellValue('tipo_informe')),
      tipoPropiedad: idsDe(r.getCellValue('tipo_propiedad')),
      diasTotales: r.getCellValue('dias_totales'),
      diasAmbar: r.getCellValue('dias_alerta_amarilla'),
      diasRojo: r.getCellValue('dias_alerta_roja'),
      revisionHoras: r.getCellValue('sla_revision_horas'),
      activoDesde: r.getCellValue('activo_desde'),
    };
    const esComodin =
      fila.cliente.length === 0 && fila.tipoInforme.length === 0 && fila.tipoPropiedad.length === 0;
    if (esComodin) porDefecto = fila;
    else filas.push(fila);
  }
  return { filas, porDefecto };
}

function idsDe(valorLink) {
  return Array.isArray(valorLink) ? valorLink.map((x) => x.id) : [];
}

/**
 * Resolución de §9.6-R4: gana la fila más específica que empareje; si no hay
 * ninguna, la comodín. Y cada campo vacío de la fila ganadora se resuelve
 * contra la comodín, campo a campo. Por eso MetLife conserva sus 4 días de
 * compromiso y hereda el ámbar sin que nadie complete su fila.
 */
function resolverSla(solicitud, catalogo) {
  const cli = idsDe(solicitud.getCellValue('cliente'));
  const ti = idsDe(solicitud.getCellValue('tipo_informe'));
  const tp = idsDe(solicitud.getCellValue('tipo_propiedad'));

  let mejor = null;
  let mejorPuntaje = -1;
  for (const fila of catalogo.filas) {
    let puntaje = 0;
    if (fila.cliente.length) {
      if (!fila.cliente.some((id) => cli.includes(id))) continue;
      puntaje += 4;
    }
    if (fila.tipoInforme.length) {
      if (!fila.tipoInforme.some((id) => ti.includes(id))) continue;
      puntaje += 2;
    }
    if (fila.tipoPropiedad.length) {
      if (!fila.tipoPropiedad.some((id) => tp.includes(id))) continue;
      puntaje += 1;
    }
    if (puntaje > mejorPuntaje) {
      mejor = fila;
      mejorPuntaje = puntaje;
    }
  }

  const base_ = catalogo.porDefecto || {};
  const ganadora = mejor || base_;
  const oNull = (v) => (v === null || v === undefined || v === '' ? null : v);
  return {
    clave: ganadora.clave || null,
    diasTotales: oNull(ganadora.diasTotales) ?? oNull(base_.diasTotales),
    diasAmbar: oNull(ganadora.diasAmbar) ?? oNull(base_.diasAmbar),
    // El rojo hereda el compromiso de SU PROPIA fila, no el de la comodín:
    // una fila con 4 días de compromiso no puede ponerse roja a los 3.
    diasRojo: oNull(ganadora.diasRojo) ?? oNull(ganadora.diasTotales) ?? oNull(base_.diasRojo),
    revisionHoras: oNull(ganadora.revisionHoras) ?? oNull(base_.revisionHoras),
  };
}

// ---------------------------------------------------------------------------
// Cálculo de los dos semáforos
// ---------------------------------------------------------------------------

const CAMPOS_ETAPA = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  n,
  key: `e${n}`,
  inicio: `sla_e${n}_inicio_ts`,
  fin: `sla_e${n}_fin_ts`,
}));

/**
 * Etapa vigente = la de mayor orden con inicio poblado y fin vacío. Si ninguna
 * cumple, la solicitud queda en sin_dato: no se fabrica un valor que la base no
 * respalda. En v1.9 sólo e1 y e2 tienen escritor, así que la mayoría de la
 * cartera vive legítimamente en sin_dato.
 */
function etapaVigente(solicitud) {
  let vigente = null;
  for (const campo of CAMPOS_ETAPA) {
    const ini = solicitud.getCellValue(campo.inicio);
    const fin = solicitud.getCellValue(campo.fin);
    if (ini && !fin) vigente = { ...campo, inicioTs: ini };
  }
  return vigente;
}

function semaforoEtapa(solicitud, matriz, sla, feriados) {
  const etapa = etapaVigente(solicitud);
  if (!etapa) return { estado: 'sin_dato' };

  const def = matriz[etapa.key];
  if (!def) return { estado: 'sin_dato', motivo: `C_SLA_Etapas sin fila ${etapa.key}` };

  // §9.6-R3: sla_revision_horas es override del umbral de la etapa 7 y de
  // ninguna otra. Vacío → e7 usa la matriz.
  let idealHoras = def.idealHoras;
  let maxHoras = def.maxHoras;
  if (etapa.key === 'e7' && sla.revisionHoras !== null && sla.revisionHoras !== undefined) {
    idealHoras = sla.revisionHoras;
    maxHoras = sla.revisionHoras;
  }
  if (idealHoras === null || maxHoras === null) return { estado: 'sin_dato' };

  const inicioReloj = aRelojSantiago(new Date(etapa.inicioTs));
  const pausa = solicitud.getCellValue('sla_pausa_habil_min') || 0;
  const consumidos = Math.max(0, minutosHabilesEntre(inicioReloj, ahoraReloj, feriados) - pausa);

  let estado = 'verde';
  if (consumidos > maxHoras * 60) estado = 'rojo';
  else if (consumidos >= idealHoras * 60) estado = 'ambar';

  return {
    estado,
    etapaKey: etapa.key,
    etapaOrden: def.orden,
    etapaNombre: def.nombre,
    responsable: def.responsable,
    minutosConsumidos: consumidos,
    idealHoras,
    maxHoras,
  };
}

function semaforoAgregado(solicitud, sla, feriados) {
  // El reloj arranca en el hito de §5.2.2 (sla_e1_inicio_ts). fecha_solicitud
  // es el respaldo para la cartera anterior al backfill de A-5.
  const inicio = solicitud.getCellValue('sla_e1_inicio_ts') || solicitud.getCellValue('fecha_solicitud');
  if (!inicio) return { estado: 'sin_dato' };
  if (sla.diasAmbar === null && sla.diasRojo === null) return { estado: 'sin_dato' };

  const dias = diasHabilesEntre(aRelojSantiago(new Date(inicio)), ahoraReloj, feriados);
  let estado = 'verde';
  if (sla.diasRojo !== null && dias >= sla.diasRojo) estado = 'rojo';
  else if (sla.diasAmbar !== null && dias >= sla.diasAmbar) estado = 'ambar';

  return { estado, diasHabiles: dias, diasAmbar: sla.diasAmbar, diasRojo: sla.diasRojo };
}

// ---------------------------------------------------------------------------
// Destinatarios (§5.3 · C_NotificacionesConfig es la fuente única)
// ---------------------------------------------------------------------------

/**
 * M-17 crea una fila por área responsable, nombradas
 * sla_alerta_roja_control_seguimiento / _tasador / _visado. El ruteo por
 * responsable implementa §5.2.8: "el semáforo de una etapa en rojo escala al
 * responsable de esa área, no al dueño de la solicitud completa".
 */
async function cargarConfigNotificaciones() {
  const q = await tNotifConfig.selectRecordsAsync({
    fields: ['nombre', 'evento', 'destinatarios_to', 'destinatarios_cc', 'canal',
             'plantilla_asunto', 'plantilla_cuerpo', 'activa'],
  });
  const porResponsable = {};
  let generica = null;
  for (const r of q.records) {
    if (r.getCellValue('activa') !== true) continue;
    const evento = r.getCellValue('evento');
    if (!evento || evento.name !== 'sla_alerta_roja') continue;
    const canal = r.getCellValue('canal');
    const cfg = {
      id: r.id,
      nombre: r.getCellValue('nombre') || '',
      to: r.getCellValue('destinatarios_to') || '',
      cc: r.getCellValue('destinatarios_cc') || '',
      canal: canal ? canal.name : 'email',
      asunto: r.getCellValue('plantilla_asunto') || '',
      cuerpo: r.getCellValue('plantilla_cuerpo') || '',
    };
    let asignada = false;
    for (const area of ['control_seguimiento', 'tasador', 'visado']) {
      if (cfg.nombre.indexOf(area) !== -1) {
        porResponsable[area] = cfg;
        asignada = true;
      }
    }
    if (!asignada && !generica) generica = cfg;
  }
  return { porResponsable, generica };
}

function render(plantilla, vars) {
  let salida = plantilla || '';
  for (const clave of Object.keys(vars)) {
    salida = salida.split(`{{${clave}}}`).join(vars[clave] === null ? '' : String(vars[clave]));
  }
  return salida;
}

// ---------------------------------------------------------------------------
// Guard de idempotencia
// ---------------------------------------------------------------------------

/**
 * Una alerta por (solicitud, etapa, día). Una segunda corrida el mismo día no
 * genera un segundo correo — es exactamente lo que M-18 verifica. Cambiar de
 * etapa sí vuelve a alertar: es una escalación distinta, a otra área.
 */
function claveAlerta(solicitudId, etapaKey) {
  return `AT08:${solicitudId}:${etapaKey || 'agregado'}:${hoyISO}`;
}

async function cargarClavesEmitidas() {
  const q = await tNotificaciones.selectRecordsAsync({ fields: ['clave_natural'] });
  const set = new Set();
  for (const r of q.records) {
    const clave = r.getCellValue('clave_natural');
    if (clave && String(clave).startsWith('AT08:')) set.add(String(clave));
  }
  return set;
}

// ---------------------------------------------------------------------------
// Barrido
// ---------------------------------------------------------------------------

const CAMPOS_SOLICITUD = [
  'codigo_ext', 'estado', 'cliente', 'tipo_informe', 'tipo_propiedad',
  'tasador', 'visador', 'ejecutiva_asignada', 'fecha_solicitud',
  'sla_pausa_habil_min', 'sla_etapa_actual',
].concat(CAMPOS_ETAPA.map((c) => c.inicio)).concat(CAMPOS_ETAPA.map((c) => c.fin));

const feriados = await cargarFeriados();
const matriz = await cargarMatriz();
const catalogoSla = await cargarSla();
const config = await cargarConfigNotificaciones();
const yaEmitidas = await cargarClavesEmitidas();

const consulta = await tSolicitudes.selectRecordsAsync({ fields: CAMPOS_SOLICITUD });

const resumen = {
  revisadas: 0,
  activas: 0,
  agregado: { verde: 0, ambar: 0, rojo: 0, sin_dato: 0 },
  etapa: { verde: 0, ambar: 0, rojo: 0, sin_dato: 0 },
  notificadas: 0,
  omitidas_por_guard: 0,
  sin_destinatario: [],
  topeAlcanzado: false,
};

const notificacionesNuevas = [];
const eventosNuevos = [];

for (const solicitud of consulta.records) {
  resumen.revisadas += 1;

  const estado = solicitud.getCellValue('estado');
  if (!estado || !ESTADOS_ACTIVOS.has(estado.name)) continue;
  resumen.activas += 1;

  const sla = resolverSla(solicitud, catalogoSla);
  const agregado = semaforoAgregado(solicitud, sla, feriados);
  const etapa = semaforoEtapa(solicitud, matriz, sla, feriados);

  resumen.agregado[agregado.estado] += 1;
  resumen.etapa[etapa.estado] += 1;

  const enRojo = agregado.estado === 'rojo' || etapa.estado === 'rojo';
  if (!enRojo) continue;

  const clave = claveAlerta(solicitud.id, etapa.estado === 'rojo' ? etapa.etapaKey : null);
  if (yaEmitidas.has(clave)) {
    resumen.omitidas_por_guard += 1;
    continue;
  }
  if (notificacionesNuevas.length >= MAX_NOTIFICACIONES_POR_CORRIDA) {
    resumen.topeAlcanzado = true;
    continue;
  }

  const area = etapa.estado === 'rojo' ? etapa.responsable : 'control_seguimiento';
  const cfg = config.porResponsable[area] || config.generica;
  const codigo = solicitud.getCellValue('codigo_ext') || solicitud.name || solicitud.id;

  if (!cfg) {
    resumen.sin_destinatario.push(String(codigo));
    continue;
  }

  const vars = {
    codigo_ext: codigo,
    estado: estado.name,
    etapa_numero: etapa.etapaOrden || '',
    etapa_nombre: etapa.etapaNombre || '',
    responsable: area,
    horas_consumidas: etapa.minutosConsumidos ? (etapa.minutosConsumidos / 60).toFixed(1) : '',
    sla_max_horas: etapa.maxHoras === undefined ? '' : etapa.maxHoras,
    dias_habiles: agregado.diasHabiles === undefined ? '' : agregado.diasHabiles,
    sla_dias_rojo: agregado.diasRojo === undefined ? '' : agregado.diasRojo,
    semaforo_agregado: agregado.estado,
    semaforo_etapa: etapa.estado,
  };

  const asunto = cfg.asunto
    ? render(cfg.asunto, vars)
    : `SLA en rojo · ${codigo}`;
  const cuerpo = cfg.cuerpo
    ? render(cfg.cuerpo, vars)
    : [
        `Solicitud ${codigo} en rojo al ${hoyISO}.`,
        `Semáforo agregado: ${agregado.estado} (${vars.dias_habiles} días hábiles de ${vars.sla_dias_rojo}).`,
        `Semáforo por etapa: ${etapa.estado}` +
          (etapa.etapaKey ? ` · etapa ${vars.etapa_numero} ${vars.etapa_nombre} · ${vars.horas_consumidas} h de ${vars.sla_max_horas} h` : ''),
        `Responsable: ${area}.`,
      ].join('\n');

  notificacionesNuevas.push({
    fields: {
      clave_natural: clave,
      evento: { name: 'sla_alerta_roja' },
      canal: { name: cfg.canal },
      destinatarios_to: cfg.to,
      destinatarios_cc: cfg.cc,
      asunto,
      cuerpo_renderizado: cuerpo,
      estado_envio: { name: 'Pendiente' },
      solicitud: [{ id: solicitud.id }],
      config_origen: [{ id: cfg.id }],
    },
  });
  yaEmitidas.add(clave);

  eventosNuevos.push({
    fields: {
      tipo_evento: 'sla_alerta_roja',
      timestamp: ahora.toISOString(),
      actor_tipo: { name: 'Automatizacion' },
      actor_nombre: 'AT08_Alertas_SLA',
      severidad: { name: 'WARN' },
      tabla_origen: { name: 'TX_Solicitudes' },
      record_id_origen: solicitud.id,
      solicitud: [{ id: solicitud.id }],
      descripcion: `SLA en rojo · agregado=${agregado.estado} · etapa=${etapa.estado}${etapa.etapaKey ? ` (${etapa.etapaKey})` : ''} · responsable=${area}`,
      detalle_json: JSON.stringify({ agregado, etapa, sla_aplicado: sla.clave }),
    },
  });
}

// ---------------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------------

async function crearEnLotes(tabla, filas) {
  let creados = 0;
  for (let i = 0; i < filas.length; i += 50) {
    const lote = filas.slice(i, i + 50);
    await tabla.createRecordsAsync(lote);
    creados += lote.length;
  }
  return creados;
}

resumen.notificadas = await crearEnLotes(tNotificaciones, notificacionesNuevas);
await crearEnLotes(tEventos, eventosNuevos);

const huboProblema =
  resumen.sin_destinatario.length > 0 || resumen.topeAlcanzado || !catalogoSla.porDefecto;

const filaLog = {
  'Titulo Log': `AT08 · barrido SLA ${hoyISO}`,
  'Fecha / Hora': ahora.toISOString(),
  Estado: { name: huboProblema ? '⚠ Parcial' : '✓ OK' },
  Trigger: `Cron 08:00 ${TZ}`,
  Detalle: JSON.stringify(resumen, null, 2),
  'Duracion ms': Date.now() - arrancoEn,
};

// La opción AT08_SLA la agrega M-17. Si todavía no existe, el log se escribe
// igual sin el campo Escenario: perder la corrida entera por una opción de
// select ausente sería el peor de los dos males.
try {
  await tLog.createRecordsAsync([
    { fields: Object.assign({}, filaLog, { Escenario: { name: 'AT08_SLA' } }) },
  ]);
} catch (e) {
  await tLog.createRecordsAsync([
    {
      fields: Object.assign({}, filaLog, {
        Detalle: `[Escenario AT08_SLA no existe todavía en LogEscenarios — pendiente M-17]\n${filaLog.Detalle}`,
      }),
    },
  ]);
}

if (!catalogoSla.porDefecto) {
  console.log('AVISO: C_SLA no tiene fila comodín (los tres links vacíos). El semáforo agregado queda sin respaldo para los pares no cubiertos.');
}
console.log(JSON.stringify(resumen, null, 2));

/**
 * ============================================================================
 * INSTRUCCIONES PARA SERGIO — UI de Airtable Automations
 * ============================================================================
 *
 * 1. Airtable → Automations → Create automation. Nombre exacto, en TitleCase:
 *
 *        AT08_Alertas_SLA
 *
 *    NO usar AT08_alertas_sla (minúscula), que es lo que trae hoy la fila de
 *    inventario C_AutomationsAirtable · recxWkj3x8tzqzHmo. Esa fila se corrige
 *    en F-5 · M-17 (§9.6-R2); el nombre canónico es el de arriba.
 *
 * 2. Trigger: "At scheduled time" · Daily · 08:00 · zona America/Santiago.
 *
 * 3. Action: "Run script". Pegar el contenido de este archivo COMPLETO, desde
 *    la primera línea hasta la última. No requiere Input variables: el script
 *    resuelve todas las tablas por nombre con base.getTable().
 *
 * 4. Precondiciones antes de activar — ninguna es opcional:
 *
 *    a) M-17 · C_NotificacionesConfig: crear las 3 filas de evento
 *       sla_alerta_roja, una por área responsable, con estos nombres exactos
 *       (el ruteo del script busca el slug del área dentro de `nombre`):
 *           sla_alerta_roja_control_seguimiento
 *           sla_alerta_roja_tasador
 *           sla_alerta_roja_visado
 *       Con `activa = true`, `canal = email` y los destinatarios reales en
 *       destinatarios_to. Si falta la fila de un área, el script no inventa
 *       destinatario: registra la solicitud en `sin_destinatario` del resumen
 *       y la corrida queda en "⚠ Parcial".
 *
 *       Variables disponibles en plantilla_asunto y plantilla_cuerpo:
 *           {{codigo_ext}} {{estado}} {{etapa_numero}} {{etapa_nombre}}
 *           {{responsable}} {{horas_consumidas}} {{sla_max_horas}}
 *           {{dias_habiles}} {{sla_dias_rojo}} {{semaforo_agregado}}
 *           {{semaforo_etapa}}
 *       Sin plantilla, el script arma un cuerpo por defecto legible.
 *
 *    b) M-17 · LogEscenarios: agregar la opción `AT08_SLA` al select
 *       `Escenario`. Las opciones viejas "Alerta SLA 2d" y "Alerta SLA 3d"
 *       se dejan como están (RO-14: alias, no rename).
 *
 *    c) M-13 · TX_Solicitudes: pegar la fórmula `sla_semaforo_etapa`. AT08 no
 *       la necesita —recalcula por su cuenta—, pero la vista y el filtro de la
 *       bandeja sí, y sin ella la Tanda C entrega cero filas en silencio.
 *
 * 5. Dejar la Automation en **Inactivo**. No activar en esta iteración.
 *    El orden es: M-16 (crear en borrador) → M-18 (correr en modo prueba con
 *    una solicitud en rojo y verificar que llega UN correo, que
 *    TX_Notificaciones tiene UNA fila y que una segunda corrida no genera un
 *    segundo correo) → recién ahí activar y recién ahí poner
 *    `estado = Activo` en la fila de registro de C_AutomationsAirtable.
 *
 * Nota sobre el ámbar: no notifica por correo, por decisión de §9.6. Aparece
 * en el resumen de LogEscenarios y en la bandeja. Si en algún momento se pide
 * correo en ámbar, el cambio es agregar la fila sla_alerta_amarilla en
 * C_NotificacionesConfig y ampliar el filtro `enRojo` de este script — no
 * tocar el motor de cálculo.
 * ============================================================================
 */
