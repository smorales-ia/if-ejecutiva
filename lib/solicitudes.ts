import { listRecords, AirtableError } from '@/lib/airtable-client'
import {
  ESTADO_LABELS,
  PRIORIDAD,
  SLA_AGREGADO_FILTROS,
  SLA_ETAPA_FILTROS,
  regionDeComuna,
  type EstadoSolicitud,
  type Prioridad,
  type SlaAgregadoFiltro,
  type SlaEtapaFiltro,
  type SlaEtapaSolicitud,
  type SlaTonoEtapa,
  type Solicitud,
} from '@/lib/console-data'
// `duracionCorta` es del módulo de cronología (Tanda E) y se importa en vez de
// redeclararse: la píldora de la bandeja y las filas del detalle tienen que
// escribir la misma duración con el mismo formato (RO-05).
import { duracionCorta } from '@/lib/sla-cronologia'
import { desdeSantiago } from '@/lib/sla-habil'
// `lib/sla-etapas.ts` importa `TX_SOLICITUDES` de este módulo, así que esto
// cierra un ciclo de imports. Es seguro y deliberado: ninguno de los dos lados
// evalúa un binding del otro en tiempo de carga —`TX_SOLICITUDES` se lee dentro
// de los métodos de `DEPS_AIRTABLE`, y `obtenerMatrizEtapas` se llama dentro de
// `fetchSolicitudes`—, de modo que el orden de inicialización no importa. La
// alternativa era duplicar el lector de `C_SLA_Etapas` acá, que es peor: dos
// lectores del mismo catálogo divergen (RO-05).
import { obtenerMatrizEtapas, type MatrizEtapas } from '@/lib/sla-etapas'

// TX_Solicitudes verified via MCP 2026-07-04
export const TX_SOLICITUDES = 'tblaHTyMHYfmy7Fg6'

// AUTH_Usuarios verified via MCP 2026-07-07 (RF-52)
const AUTH_USUARIOS = 'tblbX3hPD2uhqhl5v'

// Enum de vistas reconciliado a las 5 del plan v1.9 (P5). Se eliminaron
// 'reasignar' (REGLA A quita la reasignación) y 'pausadas' (estado inexistente
// en el enum). 'mi_cartera' reemplaza al antiguo 'cartera'; 'todas' al 'activas'.
export type Vista = 'mi_cartera' | 'sla_riesgo' | 'por_asignar' | 'aprobadas' | 'todas'

export const VISTAS_VALIDAS: Vista[] = [
  'mi_cartera',
  'sla_riesgo',
  'por_asignar',
  'aprobadas',
  'todas',
]

export const VISTA_DEFAULT: Vista = 'todas'

/**
 * Valores admitidos por `?sla=` — el semáforo agregado en días (RF-08).
 *
 * La lista canónica se declara en `lib/console-data.ts` y se reexporta acá con
 * los nombres que este módulo ya venía exponiendo, exactamente igual que
 * `SlaEtapaFiltro` justo abajo: el selector de la bandeja es un componente
 * cliente y si importara el valor desde este archivo se llevaría el cliente de
 * Airtable al bundle del navegador. Una lista, dos consumidores (RO-05).
 */
export type SlaFiltro = SlaAgregadoFiltro

export const SLA_FILTROS_VALIDOS: SlaFiltro[] = SLA_AGREGADO_FILTROS

/**
 * Traduce el vocabulario de la UI al que emite realmente la fórmula
 * `semaforo_sla` de Airtable. Ver la nota extensa en `buildVistaFormula`.
 * Una solicitud ya entregada emite "… Entregado" y no cae en ninguno de los
 * tres: filtrar por `verde` no la devuelve, que es el comportamiento deseado
 * (verde = en plazo y viva, no = cerrada sin incidencias).
 */
const SEMAFORO_POR_SLA: Record<SlaFiltro, string> = {
  verde: 'OK',
  ambar: 'EN RIESGO',
  rojo: 'VENCIDO',
}

/**
 * Valores admitidos por `?sla_etapa=` (RF-53 · §9.6.2 C-3).
 *
 * La lista canónica se declara en `lib/console-data.ts` y se reexporta acá con
 * el nombre que este módulo ya venía exponiendo. El motivo del traslado es el
 * selector de la bandeja (D-3): es un componente cliente, y si importara el
 * valor desde este archivo se llevaría el cliente de Airtable al bundle del
 * navegador. Una lista, dos consumidores (RO-05).
 */
export type { SlaEtapaFiltro }

export const SLA_ETAPA_FILTROS_VALIDOS: SlaEtapaFiltro[] = SLA_ETAPA_FILTROS

// D-07: filtros de FiltrosBar persistidos como URL params (RF-05 Subtarea C · P5).
export interface SolicitudesFiltros {
  cliente?: string
  estado?: string
  sla?: string
  /**
   * Semáforo **por etapa** (RF-53). Deliberadamente separado de `sla`, que
   * sigue significando el agregado en días (RF-08): son dos relojes que
   * conviven y no se sustituyen (§5.2). La clave lleva el mismo nombre que el
   * parámetro de URL, como el resto de este objeto.
   */
  sla_etapa?: string
  desde?: string // YYYY-MM-DD
  hasta?: string // YYYY-MM-DD
  /** Nombre del tasador, o 'sin_asignar' para las que no tienen tasador. */
  tasador?: string
  prioridad?: string
  /** Búsqueda: código VP, RUT del comprador o dirección. */
  q?: string
}

// Orden de la lista (P5). Mapea a un sort de Airtable.
export type OrdenParam = 'sla_desc' | 'sla_asc' | 'fecha_solicitud_desc' | 'prioridad'

export const ORDENES_VALIDOS: OrdenParam[] = [
  'sla_desc',
  'sla_asc',
  'fecha_solicitud_desc',
  'prioridad',
]

function escapeFormulaString(value: string): string {
  return value.replace(/"/g, '\\"')
}

/**
 * `ejecutivaNombre`: el *primary field* (nombre) del registro de AUTH_Usuarios
 * ya resuelto — NUNCA el clerk_user_id ni el recordId. Ver E-018/E-019 en
 * docs/aprendizajes.md: un campo Link, dentro de una fórmula de Airtable, se
 * evalúa contra el primary field del registro vinculado, no contra su
 * recordId (verificado en vivo). La resolución clerk_user_id → nombre vive en
 * `resolveEjecutiva()`, más abajo.
 */
function buildVistaFormula(vista: Vista, ejecutivaNombre?: string): string {
  switch (vista) {
    case 'todas':
      return 'TRUE()'
    case 'sla_riesgo':
      // Unión de los dos relojes (§9.6.1 · C-3). La pregunta que la vista
      // responde es "¿qué tengo que mirar hoy?", y tanto un vencimiento
      // agregado (RF-08) como una etapa desbordada (RF-53) califican; filtrar
      // por uno solo escondería casos reales.
      //
      // Los dos términos se escriben distinto **a propósito**:
      //
      // - `semaforo_sla` NO emite "rojo"/"ámbar"/"verde": eso es lo que
      //   documenta `schema-airtable.md:160`, no lo que calcula la fórmula
      //   real. Verificada vía `get_table_schema` el 29-jul-2026, emite cuatro
      //   literales con emoji de prefijo — "… Entregado", "… VENCIDO",
      //   "… EN RIESGO", "… OK" — y el emoji llega mangleado a "?" según el
      //   cliente que lea el campo. Por eso se busca la subcadena: el prefijo no
      //   es confiable, la palabra sí. Ninguno de los cuatro literales contiene
      //   a otro como subcadena, así que no hay solapamiento.
      //   ⚠ Deuda: esa fórmula de Airtable no se tocó (D-01).
      // - `sla_semaforo_etapa` (`fldB6gJ3clZUPgaZk`) se compara por **igualdad**
      //   y eso no contradice RO-13, lo aplica: RO-13 obliga a filtrar por el
      //   formato real que emite la fórmula, y esta fórmula la escribimos
      //   nosotros en M-13 precisamente para que emita cuatro literales en
      //   minúscula, sin emoji ni adornos (§9.6-R5). Usar `FIND` aquí sería
      //   arrastrar una defensa que ya no protege de nada y, peor, haría que
      //   "verde" no se distinguiera de un futuro "verde_claro".
      return (
        'OR(FIND("VENCIDO",{semaforo_sla})>0,FIND("EN RIESGO",{semaforo_sla})>0,' +
        '{sla_semaforo_etapa}="ambar",{sla_semaforo_etapa}="rojo")'
      )
    case 'por_asignar':
      // Sin tasador asignado y en un estado que aún admite asignación.
      return 'AND(OR({estado}="creada",{estado}="requiere_atencion"),ARRAYJOIN({tasador})="")'
    case 'aprobadas':
      return '{estado}="aprobada"'
    case 'mi_cartera':
      return `FIND("${escapeFormulaString(ejecutivaNombre ?? '')}", ARRAYJOIN({ejecutiva_asignada}))`
  }
}

const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/

// Cada valor se valida contra una lista cerrada antes de interpolarse en la
// fórmula Airtable — nunca se inyecta texto libre del usuario (RF-05 D-07).
function buildFiltrosClauses(filtros?: SolicitudesFiltros): string[] {
  if (!filtros) return []
  const clauses: string[] = []

  // El cliente ya no se valida contra una lista cerrada en código: la lista
  // vive en `M_Clientes` y tiene ~90 filas que cambian sin tocar el repo. La
  // protección contra inyección es el escape, no el allowlist — mismo criterio
  // que `mi_cartera` con el nombre de la ejecutiva.
  if (filtros.cliente) {
    clauses.push(`{cliente}="${escapeFormulaString(filtros.cliente)}"`)
  }
  if (filtros.estado && filtros.estado in ESTADO_LABELS) {
    clauses.push(`{estado}="${filtros.estado}"`)
  }
  if (filtros.sla && SLA_FILTROS_VALIDOS.includes(filtros.sla as SlaFiltro)) {
    // Mismo desajuste de vocabulario que `sla_riesgo`, arriba: la UI habla
    // verde/ámbar/rojo y la fórmula emite OK/EN RIESGO/VENCIDO. La traducción
    // vive aquí y no en la UI para que el contrato de la URL (`?sla=rojo`) no
    // dependa de cómo esté redactada la fórmula de Airtable hoy.
    clauses.push(`FIND("${SEMAFORO_POR_SLA[filtros.sla as SlaFiltro]}",{semaforo_sla})>0`)
  }
  if (
    filtros.sla_etapa &&
    SLA_ETAPA_FILTROS_VALIDOS.includes(filtros.sla_etapa as SlaEtapaFiltro)
  ) {
    // Sin traducción de vocabulario, a diferencia de `sla`: la fórmula
    // `sla_semaforo_etapa` emite exactamente estos literales, así que la URL y
    // el campo hablan el mismo idioma. Igualdad, no `FIND` — ver la nota de
    // `buildVistaFormula`. El valor ya pasó por la lista cerrada de arriba, y el
    // escape se aplica igual porque la protección no debe depender de que la
    // lista siga siendo cerrada mañana (RF-05 · D-07).
    clauses.push(`{sla_semaforo_etapa}="${escapeFormulaString(filtros.sla_etapa)}"`)
  }
  if (filtros.desde && FECHA_VALIDA.test(filtros.desde)) {
    clauses.push(`NOT(IS_BEFORE({fecha_solicitud},DATETIME_PARSE("${filtros.desde}","YYYY-MM-DD")))`)
  }
  if (filtros.hasta && FECHA_VALIDA.test(filtros.hasta)) {
    // `fecha_solicitud` es **dateTime**, no date (divergencia §19.2 del schema).
    // Comparar contra `DATETIME_PARSE(hasta)` mide contra la medianoche de ese
    // día, así que cualquier solicitud creada durante el propio día `hasta`
    // quedaba excluida — el caso más común es "hasta hoy", que escondía justo
    // las altas recientes. Se compara contra la medianoche del día siguiente.
    clauses.push(
      `IS_BEFORE({fecha_solicitud},DATEADD(DATETIME_PARSE("${filtros.hasta}","YYYY-MM-DD"),1,"days"))`
    )
  }
  if (filtros.prioridad && (PRIORIDAD as readonly string[]).includes(filtros.prioridad)) {
    clauses.push(`{prioridad}="${filtros.prioridad}"`)
  }
  if (filtros.tasador) {
    // 'sin_asignar' = sin tasador; cualquier otro valor = por nombre. Un campo
    // Link, dentro de una fórmula, se evalúa contra su primary field (E-018).
    clauses.push(
      filtros.tasador === 'sin_asignar'
        ? 'ARRAYJOIN({tasador})=""'
        : `FIND("${escapeFormulaString(filtros.tasador)}",ARRAYJOIN({tasador}))`
    )
  }
  if (filtros.q && filtros.q.trim() !== '') {
    // Búsqueda case-insensitive sobre código VP, RUT del comprador y dirección.
    const q = escapeFormulaString(filtros.q.trim().toUpperCase())
    clauses.push(
      `OR(FIND("${q}",UPPER({codigo_ext})),FIND("${q}",UPPER({cliente_final_rut})),FIND("${q}",UPPER({direccion})))`
    )
  }

  return clauses
}

export function buildFormula(vista: Vista, ejecutivaNombre?: string, filtros?: SolicitudesFiltros): string {
  const vistaFormula = buildVistaFormula(vista, ejecutivaNombre)
  const filtrosClauses = buildFiltrosClauses(filtros)
  if (filtrosClauses.length === 0) return vistaFormula
  return `AND(${vistaFormula},${filtrosClauses.join(',')})`
}

export interface FetchResult {
  data: Solicitud[]
  degraded?: boolean
  /** "Mi cartera" sin match en AUTH_Usuarios para el clerk_user_id de la sesión. */
  motivo?: 'ejecutiva_no_encontrada'
}

interface EjecutivaResuelta {
  recordId: string
  nombre: string
}

const EJECUTIVA_CACHE_TTL_MS = 5 * 60 * 1000
// Cache en memoria de proceso, sin persistencia — se pierde en cada redeploy/restart.
const ejecutivaCache = new Map<string, { data: EjecutivaResuelta | null; expiresAt: number }>()

/**
 * Resuelve un clerk_user_id (ej. `user_3GBF...`) al registro de AUTH_Usuarios
 * correspondiente. Cachea en memoria de proceso por 5 min. `null` si no hay
 * fila con ese `clerk_user_id` (caso legítimo: usuario nunca sincronizado).
 */
export async function resolveEjecutiva(clerkUserId: string): Promise<EjecutivaResuelta | null> {
  const cached = ejecutivaCache.get(clerkUserId)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  const records = await listRecords<{ nombre?: string }>(AUTH_USUARIOS, {
    filterByFormula: `{clerk_user_id}="${escapeFormulaString(clerkUserId)}"`,
    fields: ['nombre'],
  })
  const data: EjecutivaResuelta | null = records[0]
    ? { recordId: records[0].id, nombre: records[0].fields.nombre ?? '' }
    : null
  ejecutivaCache.set(clerkUserId, { data, expiresAt: Date.now() + EJECUTIVA_CACHE_TTL_MS })
  return data
}

// Airtable returns all values as strings when cellFormat=string.
// Linked record fields return comma-separated primary field values.
type RawFields = Record<string, string | undefined>

export const SOLICITUD_FIELDS: string[] = [
  'codigo_ext',
  'estado',
  'prioridad',
  'cliente',
  'tasador',
  'visador',
  'comuna',
  'tipo_informe',
  'tipo_propiedad',
  'banco',
  'producto',
  'fecha_solicitud',
  'fecha_limite_entrega',
  'fecha_visita_programada',
  'observaciones_internas',
  // Dos campos distintos que la consola confundía en uno solo (E-089):
  // `canal_contacto_original` es por dónde contactó el cliente (whatsapp ·
  // email · telefono · …) y es lo que la Ejecutiva edita; `origen_canal` es por
  // dónde entró la fila al sistema (ingreso_manual · tally_externo · …) y es de
  // sólo lectura.
  'canal_contacto_original',
  'origen_canal',
  'ejecutivo_solicitante',
  'cliente_final_nombre',
  'cliente_final_rut',
  'semaforo_sla',
  'direccion',
  'monto_estimado_uf',
  'solicitante_telefono',
  'email_contacto',

  // ── Ampliación Tanda D-02 (29-jul-2026) ─────────────────────────────────
  // El detalle mostraba 25 campos de los ~55 operacionales de TX_Solicitudes;
  // el resto lo rellenaba `mapRecord` con '—', [] o constantes, así que era
  // invisible en pantalla **y** inaccesible para la edición. Se excluyen a
  // propósito los ~17 `*_override` (motor AT01–AT10, fuera de CU-002) y los 8
  // `fin_*_uf` (duplicado histórico de `financiero_*_uf`).
  'n_operacion_cliente',
  // ⚠ El nombre real termina en espacio (D-08, verificado vía MCP 29-jul-2026).
  // Sin el espacio Airtable responde 422 "Unknown field names".
  'sucursal_originadora ',
  'correo_cliente_ref',
  'nro_interno',
  'numero_solicitud',
  'rol_sii',
  'notas',
  'solicitante_nombre',
  'profesion_solicitante',
  'banco_financista',
  'origen_dato',
  'origen_direccion',
  'tipo_cliente_origen',
  'modo_creacion',
  'tipo_propiedad_nuevo_usado',
  'estado_conservacion',
  'proyecto_condominio',
  'ejecutivo_formalizador',
  'ejecutivo_comercializador',
  'email_thread_id',
  'region',
  'velocidad_venta',
  'sup_terreno_m2',
  'sup_construccion_m2',
  'anio_construccion',
  'valor_comercial_uf',
  'avaluo_fiscal_clp',
  'comision_ov',
  'uf_dia_visita',
  'fecha_asignacion_ts',
  'fecha_visita',
  'fecha_entrega',
  'fecha_cierre',
  'fecha_creacion',
  'ultima_modificacion',
  'dias_desde_solicitud',
  'pdf_final_url',
  'tiene_pendientes_visador',
  // Bloque financiero (`financiero_*_uf`), que el tipo `Solicitud` declaraba
  // como `financiero?` y `mapRecord` nunca poblaba.
  'financiero_valor_total_uf',
  'financiero_subsidio_uf',
  'financiero_ahorro_uf',
  'financiero_mutuo_uf',
  'financiero_pago_contado_uf',
  'financiero_bono_captacion_uf',
  'financiero_bono_integracion_uf',
  'financiero_precio_venta_uf',
  // Bloque vendedor, que `mapRecord` devolvía hardcodeado a '—'.
  'vendedor_razon_social_o_nombre',
  'vendedor_rut',
  'vendedor_nombre',
  'vendedor_email',
  'vendedor_telefono',
  'vendedor_tipo_persona',
  'vendedor_origen_dato',

  // ── Reloj por etapa · RF-53 (Tanda C · §9.6.2 C-2) ───────────────────────
  // Estos cinco van por **FIELD_ID** y no por nombre, a diferencia de los ~90
  // de arriba. Tres razones, en este orden:
  //
  // 1. Son campos recién creados (Tanda A, 10-ago-2026) y todavía no están en
  //    `docs/schema-airtable.md`; el `fld…` es lo único verificado.
  // 2. El prefijo `sla_` es ancho —hay 21 campos— y un rename en la UI de
  //    Airtable dejaría la lectura devolviendo `undefined` en silencio, que es
  //    exactamente el fallo de `ejecutiva_asignada` (E-018/E-019).
  // 3. Los IDs coinciden uno a uno con `FIELD_IDS_SLA` de `lib/sla-etapas.ts`,
  //    que es la declaración canónica: si divergen, hay un solo sitio que mirar.
  //
  // ⚠ Airtable acepta IDs en `fields[]` pero **devuelve las claves por nombre**
  // salvo `returnFieldsByFieldId`, que este cliente no envía. Por eso `mapRecord`
  // sigue leyendo `f['sla_etapa_actual']` y no `f['fldYpHiAosqbxL85b']`: se pide
  // por lo estable y se lee por lo legible.
  'fldPZ7ReQbC1UbIMu', // sla_e1_inicio_ts   — hito §5.2.2 (REGLA C: editable en `creada`)
  'fldYpHiAosqbxL85b', // sla_etapa_actual   — number 1-7, lo escribe el motor
  'fldLfFftNm0Kvvu08', // sla_etapa_alerta_ts — SLA ideal (umbral ámbar)
  'fldLJdanpV0FANjKS', // sla_etapa_vence_ts  — SLA máximo (umbral rojo)
  'fldB6gJ3clZUPgaZk', // sla_semaforo_etapa  — fórmula, sólo lectura (M-13)
]

function parseDate(str: string | undefined): Date | null {
  if (!str) return null
  // ISO: 2026-07-05T...
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(`${str.substring(0, 10)}T12:00:00`)
    return isNaN(d.getTime()) ? null : d
  }
  // DD/MM/YYYY (es-CL locale from Airtable cellFormat=string)
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

function formatDisplay(str: string | undefined, fallback = '—'): string {
  if (!str) return fallback
  const d = parseDate(str)
  if (!d) return str
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function computeSlaDias(fechaLimite: string | undefined, semaforo: string | undefined): number {
  const limit = parseDate(fechaLimite)
  if (limit) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.round((limit.getTime() - today.getTime()) / 86_400_000)
  }
  // Fallback cuando `fecha_limite_entrega` no es parseable — que es el caso de
  // toda alta nueva, porque vale #ERROR (ver la nota de `ordenToSort`). Se
  // deriva del semáforo, con los literales que la fórmula emite de verdad
  // ("… VENCIDO" / "… EN RIESGO" / "… OK"), no con "rojo"/"ámbar", que no
  // existen y hacían caer siempre en el `return 3` (Tanda D-01/D-02).
  const s = semaforo ?? ''
  if (s.includes('VENCIDO')) return -1
  if (s.includes('EN RIESGO')) return 2
  return 3
}

function formatMontoUf(str: string | undefined): string {
  if (!str) return '—'
  const n = Number(str)
  return Number.isNaN(n) ? `${str} UF` : `${n.toLocaleString('es-CL')} UF`
}

/**
 * Con `cellFormat: 'string'` **todo** llega como texto, incluidos los campos
 * `number`. Devuelve `undefined` —y no 0— cuando el campo está vacío o no es
 * numérico: un 0 fabricado se mostraría como un valor real en el detalle.
 * Tolera el separador de miles de es-CL ("1.234,5").
 */
function num(str: string | undefined): number | undefined {
  if (!str || str.trim() === '') return undefined
  const limpio = str.trim().replace(/\./g, '').replace(',', '.')
  const n = Number(limpio)
  return Number.isFinite(n) ? n : undefined
}

/** Checkbox en `cellFormat: 'string'` llega como "true"/"checked"/"1" o vacío. */
function bool(str: string | undefined): boolean {
  return /^(true|checked|1|s[ií])$/i.test((str ?? '').trim())
}

/** Texto que degrada a `undefined` en vez de a '—', para campos opcionales. */
function txt(str: string | undefined): string | undefined {
  const v = (str ?? '').trim()
  return v === '' ? undefined : v
}

// ── Reloj por etapa · helpers server-side (RF-53 · §9.6.2 C-2) ─────────────

/**
 * Convierte a instante absoluto lo que Airtable devuelve en un campo
 * `dateTime`, venga en el formato que venga.
 *
 * Hace falta porque esta capa lee con `cellFormat: 'string'` —necesario para
 * que los campos Link lleguen como texto legible—, y con ese formato un
 * `dateTime` **no llega en ISO con `T`**. El endpoint de cronología, en cambio,
 * lee en JSON y recibe ISO de verdad. Sin normalizar, el mismo campo tendría dos
 * formas según por dónde entró y `slaEtapa.venceTs` significaría cosas distintas
 * en cada ruta (RO-05).
 *
 * ## Los tres formatos, y cuál manda Airtable de verdad
 *
 * Verificado contra `tblaHTyMHYfmy7Fg6` el 11-ago-2026, con los mismos
 * parámetros que usa `fetchSolicitudes`:
 *
 * | Origen | Ejemplo real | Semántica |
 * |---|---|---|
 * | JSON (`GET …/sla`) | `"2026-08-11T18:00:00.000Z"` | instante absoluto |
 * | `cellFormat: 'string'`, campo con formato ISO | `"2026-08-11 14:00"` · `"2026-07-27 12:00am"` | **reloj de pared de Santiago** |
 * | `cellFormat: 'string'`, campo con formato local | `"12-08-2026 13:00"` | reloj de pared de Santiago |
 *
 * El segundo es el que emiten los 21 campos `sla_` creados en la Tanda A, y es
 * el que esta función **no** reconocía: la rama ISO exigía la `T` y la de reloj
 * de pared empieza por día, no por año. El resultado era `null` silencioso —
 * "Sin datos de etapa" sobre solicitudes que sí tenían plazo—. `parseDate`, dos
 * funciones más arriba, nunca lo sufrió porque comprueba el prefijo
 * `^\d{4}-\d{2}-\d{2}` sin exigir separador.
 *
 * **El mismo prefijo, dos semánticas opuestas.** Con `T` y `Z` el texto es
 * absoluto y se lee tal cual; con espacio no trae zona, y la hora es la de
 * Santiago porque es la que se pidió en `timeZone`. Por eso las dos ramas de
 * reloj de pared pasan por `desdeSantiago` y nunca por `new Date`, que las
 * leería en la zona del proceso —UTC en Railway— y correría cada vencimiento
 * cuatro horas. Un offset fijo tampoco sirve: Chile alterna −03/−04 dos veces
 * al año.
 *
 * @returns El instante, o `null` si el texto no es una fecha reconocible. Nunca
 *   una fecha inventada: sin dato, el llamador degrada a "sin plazo".
 */
function parseInstante(valor: string | undefined): Date | null {
  const v = (valor ?? '').trim()
  if (v === '') return null

  // ISO con `T` — formato JSON de Airtable. Absoluto: se lee tal cual.
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  }
  // ISO sin hora: se ancla a medianoche de Santiago, no de UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [a, m, d] = v.split('-').map(Number)
    return desdeSantiago(a, m, d, 0, 0)
  }

  // Reloj de pared en orden ISO: "2026-08-11 14:00" · "2026-07-27 12:00am".
  // Es el formato real de los campos `sla_` (ver la tabla del docblock).
  const isoConEspacio = v.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})(?::\d{2})?\s*(?:([ap])\.?\s?m\.?)?$/i
  )
  if (isoConEspacio) {
    return instanteDePartes(
      Number(isoConEspacio[3]),
      Number(isoConEspacio[2]),
      Number(isoConEspacio[1]),
      Number(isoConEspacio[4]),
      Number(isoConEspacio[5]),
      isoConEspacio[6]
    )
  }

  // Reloj de pared es-CL: D/M/YYYY o D-M-YYYY, con hora opcional y am/pm opcional.
  const m = v.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[,]?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap])\.?\s?m\.?)?/i
  )
  const mSinMeridiano = v.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[,]?\s+(\d{1,2}):(\d{2})(?::\d{2})?)?$/
  )
  const partes = m && m[6] ? m : mSinMeridiano
  if (!partes) return null

  return instanteDePartes(
    Number(partes[1]),
    Number(partes[2]),
    Number(partes[3]),
    partes[4] === undefined ? 0 : Number(partes[4]),
    partes[5] === undefined ? 0 : Number(partes[5]),
    partes[6]
  )
}

/**
 * Componentes de reloj de pared → instante, con la normalización am/pm y la
 * validación de rango en un solo sitio. Las dos ramas de reloj de pared de
 * `parseInstante` la comparten: duplicar la conversión de meridiano era
 * garantizar que una de las dos se arreglara sin la otra.
 */
function instanteDePartes(
  dia: number,
  mes: number,
  anio: number,
  horaBruta: number,
  minuto: number,
  meridianoBruto?: string
): Date | null {
  const meridiano = meridianoBruto?.toLowerCase()
  let hora = horaBruta
  if (meridiano === 'p' && hora < 12) hora += 12
  if (meridiano === 'a' && hora === 12) hora = 0
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || hora > 23 || minuto > 59) return null

  return desdeSantiago(anio, mes, dia, hora, minuto)
}

/**
 * Etiqueta de la píldora de etapa, derivada **server-side** (§9.6.2 C-2).
 *
 * Mide contra `sla_etapa_vence_ts`, que es un **instante de pared** ya
 * materializado por el motor: la aritmética hábil corrió una vez al entrar a la
 * etapa, y desde ahí la distancia a `NOW()` es una resta de reloj. Por eso
 * "Vence en 4h 10m" es literalmente cierto y no una aproximación —no dice horas
 * hábiles, dice cuánto falta para ese instante—.
 *
 * Sin `venceTs` no se fabrica nada: el texto lo dice y la UI no pinta color.
 */
export function etiquetaEtapa(vence: Date | null, ahora: Date): string {
  if (!vence) return 'Sin datos de etapa'
  const minutos = (vence.getTime() - ahora.getTime()) / 60_000
  if (minutos >= 0) return `Vence en ${duracionCorta(minutos)}`
  return `Vencida hace ${duracionCorta(-minutos)}`
}

const TONOS_ETAPA: readonly SlaTonoEtapa[] = ['verde', 'ambar', 'rojo', 'sin_dato']

/**
 * Lee el tono **tal cual** lo emitió `sla_semaforo_etapa`, por igualdad literal
 * contra los cuatro valores del contrato (RO-13 · §9.6-R5). No normaliza, no
 * baja a minúsculas y no recalcula: si algún día la fórmula emitiera otra cosa,
 * lo correcto es que se note aquí como `sin_dato` y no que el mapper la
 * disimule. Recalcular el tono en el cliente sería la segunda fuente de verdad
 * que RO-05 prohíbe.
 */
function tonoEtapaDeFormula(valor: string | undefined): SlaTonoEtapa {
  const v = (valor ?? '').trim()
  return (TONOS_ETAPA as readonly string[]).includes(v) ? (v as SlaTonoEtapa) : 'sin_dato'
}

function esNumeroEtapa(n: number | undefined): n is SlaEtapaSolicitud['numero'] {
  return n !== undefined && Number.isInteger(n) && n >= 1 && n <= 7
}

/**
 * Nombres de las siete etapas indexados por `orden`, leídos de `C_SLA_Etapas`.
 *
 * No hay ningún nombre hardcodeado en el repo: §5.2.4 vive en la tabla, igual
 * que los catorce umbrales. Si la lectura falla —tabla vacía, Airtable caído—
 * el llamador degrada a `Etapa {n}`, que es feo pero honesto; tumbar la bandeja
 * entera porque no se pudo leer un catálogo de rótulos sería peor.
 */
export function nombresDeEtapas(matriz: MatrizEtapas): Map<number, string> {
  const nombres = new Map<number, string>()
  for (const definicion of Object.values(matriz)) {
    if (definicion.nombre) nombres.set(definicion.orden, definicion.nombre)
  }
  return nombres
}

export function relativeTime(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return 'hace menos de 1 hora'
  if (h < 24) return `hace ${h} hora${h !== 1 ? 's' : ''}`
  const d = Math.floor(h / 24)
  return `hace ${d} día${d !== 1 ? 's' : ''}`
}

/**
 * @param nombresEtapa Rótulos de §5.2.4 por número de etapa, leídos de
 *   `C_SLA_Etapas` una vez por request (ver `nombresDeEtapas`). Opcional: sin
 *   él la etapa se rotula `Etapa {n}` en vez de tumbar la lectura.
 */
export function mapRecord(
  id: string,
  createdTime: string,
  f: Record<string, string | undefined>,
  nombresEtapa?: ReadonlyMap<number, string>
): Solicitud {
  // ── Reloj por etapa (RF-53) ──────────────────────────────────────────────
  // `sla_etapa_actual` es la señal de "hay dato de etapa", no el semáforo: lo
  // escribe el motor y sólo cuando hay una etapa abierta. Sin él, `slaEtapa`
  // queda **ausente** y la bandeja no pinta píldora — que es el caso de casi
  // toda la cartera en v1.9, donde sólo e1 y e2 tienen escritor.
  //
  // Cuando sí hay etapa pero los umbrales no están materializados, el campo
  // viaja con `tono: 'sin_dato'` en vez de omitirse: "estoy en la etapa 3 y no
  // sé su plazo" es información distinta de "no sé nada de esta solicitud", y
  // fabricar un verde ahí es justo lo que §9.6 prohíbe.
  const numeroEtapa = num(f['sla_etapa_actual'])
  let slaEtapa: SlaEtapaSolicitud | undefined
  if (esNumeroEtapa(numeroEtapa)) {
    const alerta = parseInstante(f['sla_etapa_alerta_ts'])
    const vence = parseInstante(f['sla_etapa_vence_ts'])
    slaEtapa = {
      numero: numeroEtapa,
      nombre: nombresEtapa?.get(numeroEtapa) ?? `Etapa ${numeroEtapa}`,
      tono: tonoEtapaDeFormula(f['sla_semaforo_etapa']),
      etiqueta: etiquetaEtapa(vence, new Date()),
      alertaTs: alerta ? alerta.toISOString() : null,
      venceTs: vence ? vence.toISOString() : null,
    }
  }
  const e1Inicio = parseInstante(f['sla_e1_inicio_ts'])

  return {
    id,
    codigoExt: f['codigo_ext'] ?? id,
    cliente: f['cliente'] ?? '—',
    comuna: f['comuna'] ?? '—',
    estado: (f['estado'] as EstadoSolicitud) ?? 'creada',
    slaDias: computeSlaDias(f['fecha_limite_entrega'], f['semaforo_sla']),
    slaTotal: 5,
    prioridad: (f['prioridad'] as Prioridad) ?? 'normal',
    tasador: f['tasador'] || 'Sin asignar',
    visador: f['visador'] || 'Sin asignar',
    fechaLimite: formatDisplay(f['fecha_limite_entrega']),
    // D-C3 (Fase 3): fecha_solicitud es el dato de negocio real (poblado por
    // SC01 desde Fase 2); createdTime queda solo como fallback para filas
    // legacy creadas antes del fix del bug VP-NaN-XXXX.
    fechaSolicitud: formatDisplay(f['fecha_solicitud'] || createdTime),
    modificado: relativeTime(createdTime),
    modificadoPor: f['ejecutivo_solicitante'] ?? '—',
    tipoInforme: f['tipo_informe'] ?? '—',
    tipoPropiedad: f['tipo_propiedad'] ?? '—',
    // `tipo_propiedad_nuevo_usado` (fldHxx1P1ao33PWrl) sí existe desde el
    // 24-jul-2026 (§21.4 del schema). El hardcode a 'usado' venía de cuando no
    // existía y falseaba la forma del formulario en las propiedades nuevas.
    tipoPropiedadNuevoUsado: f['tipo_propiedad_nuevo_usado'] === 'nuevo' ? 'nuevo' : 'usado',
    banco: f['banco'] ?? '—',
    producto: f['producto'] ?? '—',
    direccion: f['direccion'] ?? '—',
    region: regionDeComuna(f['comuna'] ?? ''),
    montoUf: formatMontoUf(f['monto_estimado_uf']),
    propietario: f['cliente_final_nombre'] ?? '—',
    rut: f['cliente_final_rut'] ?? '—',
    email: f['email_contacto'] ?? '—',
    fechaVisita: f['fecha_visita_programada']
      ? formatDisplay(f['fecha_visita_programada'])
      : 'Por agendar',
    slaAplicable: '5 días hábiles',
    observaciones: f['observaciones_internas'] ?? '',
    // `canal` es el canal de contacto editable; `origenCanal` es el canal de
    // ingreso, que la pantalla no edita pero SC-Edicion reescribe en cada
    // ejecución y por eso hay que devolverle intacto (E-089).
    canal: f['canal_contacto_original'] ?? '—',
    origenCanal: f['origen_canal'] ?? '—',
    comprador: {
      rut: f['cliente_final_rut'] ?? '—',
      nombre: f['cliente_final_nombre'] ?? '—',
      email: f['email_contacto'] ?? '—',
      telefono: f['solicitante_telefono'] ?? '—',
    },
    // El vendedor vive como campos planos en TX_Solicitudes — `TX_Vendedor` no
    // existe (§21 del schema). Hasta D-02 esto devolvía '—' fijo.
    // `esInmobiliaria` se deriva de `vendedor_tipo_persona`: "juridica" (con o
    // sin tilde) = inmobiliaria; cualquier otro valor, natural.
    vendedor: {
      esInmobiliaria: /jur[ií]dica/i.test(f['vendedor_tipo_persona'] ?? ''),
      razonSocial: txt(f['vendedor_razon_social_o_nombre']),
      rutInmobiliaria: /jur[ií]dica/i.test(f['vendedor_tipo_persona'] ?? '')
        ? txt(f['vendedor_rut'])
        : undefined,
      nombre: txt(f['vendedor_nombre']),
      rut: txt(f['vendedor_rut']),
      correo: f['vendedor_email'] || '—',
      telefono: f['vendedor_telefono'] || '—',
      origenDato: f['vendedor_origen_dato'] || '—',
    },
    // `unidades` las hidrata `hydrateUnidades` (lib/unidades.ts) desde
    // TX_Unidades, y `contactosVisita` las hidrata `hydrateContactos`, ambas
    // en app/(ejecutiva)/consola/page.tsx. Aquí sólo se declara el valor
    // neutro. ⚠ Mientras `unidades` quedó en [] de forma permanente, RN-44
    // evaluaba siempre "faltan unidades" y el botón "Asignar Tasador" nunca se
    // habilitaba (Regla A, Tanda D-02).
    unidades: [],
    contactosVisita: [],
    contadorReasignaciones: 0,

    // ── Reloj por etapa · RF-53 (Tanda C) ──────────────────────────────────
    // `slaEtapa` puede quedar `undefined` a propósito; ver el bloque de arriba.
    slaEtapa,
    // Hito §5.2.2 normalizado a ISO para que el formulario de edición lo pueda
    // poner en un `<input type="datetime-local">` sin volver a parsear es-CL.
    slaE1InicioTs: e1Inicio ? e1Inicio.toISOString() : undefined,

    // ── Campos operacionales (Tanda D-02) ──────────────────────────────────
    nOperacionCliente: num(f['n_operacion_cliente']),
    sucursalOriginadora: txt(f['sucursal_originadora ']),
    correoClienteRef: txt(f['correo_cliente_ref']),
    nroInterno: txt(f['nro_interno']),
    numeroSolicitud: txt(f['numero_solicitud']),
    rolSii: txt(f['rol_sii']),
    notas: txt(f['notas']),
    solicitanteNombre: txt(f['solicitante_nombre']),
    solicitanteTelefono: txt(f['solicitante_telefono']),
    profesionSolicitante: txt(f['profesion_solicitante']),
    bancoFinancista: txt(f['banco_financista']),
    origenDato: txt(f['origen_dato']),
    velocidadVenta: txt(f['velocidad_venta']),
    supTerrenoM2: num(f['sup_terreno_m2']),
    supConstruccionM2: num(f['sup_construccion_m2']),
    anioConstruccion: num(f['anio_construccion']),
    valorComercialUf: num(f['valor_comercial_uf']),
    avaluoFiscalClp: num(f['avaluo_fiscal_clp']),
    comisionOv: num(f['comision_ov']),
    ufDiaVisita: num(f['uf_dia_visita']),
    fechaVisitaReal: txt(f['fecha_visita']),
    fechaEntrega: txt(f['fecha_entrega']),
    fechaCierre: txt(f['fecha_cierre']),
    fechaCreacion: txt(f['fecha_creacion']),
    ultimaModificacion: txt(f['ultima_modificacion']),
    diasDesdeSolicitud: num(f['dias_desde_solicitud']),
    pdfFinalUrl: txt(f['pdf_final_url']),
    tienePendientesVisador: bool(f['tiene_pendientes_visador']),
    fechaAsignacion: txt(f['fecha_asignacion_ts']),
    proyecto: txt(f['proyecto_condominio']),
    estadoConservacion: txt(f['estado_conservacion']),
    ejecFormalizador: txt(f['ejecutivo_formalizador']),
    ejecutivoComercializador: txt(f['ejecutivo_comercializador']),
    emailThreadId: txt(f['email_thread_id']),
    origenDireccion: f['origen_direccion'] as Solicitud['origenDireccion'],
    tipoClienteOrigen: txt(f['tipo_cliente_origen']),
    modoCreacion: f['modo_creacion'] as Solicitud['modoCreacion'],
    // Bloque financiero: el tipo lo declaraba como `financiero?` y nadie lo
    // poblaba. Se mantiene el shape de strings del modelo de UI.
    financiero: {
      valorTotalUf: txt(f['financiero_valor_total_uf']),
      subsidio: txt(f['financiero_subsidio_uf']),
      ahorro: txt(f['financiero_ahorro_uf']),
      mutuo: txt(f['financiero_mutuo_uf']),
      pagoContado: txt(f['financiero_pago_contado_uf']),
      bonoCaptacion: txt(f['financiero_bono_captacion_uf']),
      bonoIntegracion: txt(f['financiero_bono_integracion_uf']),
      precioVenta: txt(f['financiero_precio_venta_uf']),
    },
  }
}

/**
 * Traduce el orden de la UI a un sort de Airtable (campo + direccion).
 *
 * El default es `fecha_solicitud desc` desde la tanda D-01 (29-jul-2026). Antes
 * era `fecha_limite_entrega asc`, que es un estado inválido y no una
 * preferencia: `fecha_limite_entrega` es `DATEADD({fldpTBzjfbAw5FSYI},2,'days')`
 * sobre un campo date que SC01 no puebla, así que vale `#ERROR` en **toda alta
 * nueva** y la posición que Airtable les da en el sort es indefinida. Ordenar
 * por `fecha_solicitud desc` deja además lo recién creado arriba, que es lo
 * esperable de una bandeja operativa.
 *
 * `sla_desc` y `sla_asc` **ya no ordenan en Airtable**: se resuelven en memoria
 * sobre `slaDias` (ver `ordenarPorSla`). Airtable recibe un orden neutro y
 * estable, `fecha_solicitud desc`, para que el resultado sea determinista antes
 * del reordenamiento.
 */
function ordenToSort(orden?: OrdenParam): { field: string; direction: 'asc' | 'desc' } {
  switch (orden) {
    case 'prioridad':
      return { field: 'prioridad', direction: 'desc' }
    case 'sla_asc':
    case 'sla_desc':
    case 'fecha_solicitud_desc':
    default:
      return { field: 'fecha_solicitud', direction: 'desc' }
  }
}

/**
 * Reordena por urgencia de SLA en memoria.
 *
 * Antes esto era un `sort` de Airtable sobre `fecha_limite_entrega`, que es
 * `DATEADD({fecha_visita},2,'days')` sobre un campo vacío en toda alta nueva:
 * valía `#ERROR` y la posición que Airtable le da a un valor errado es
 * indefinida (deuda D-01 · ítem 6).
 *
 * `slaDias` ya codifica la urgencia y siempre tiene valor: sale de la fecha
 * límite cuando es parseable y, si no, del semáforo (`VENCIDO` → -1,
 * `EN RIESGO` → 2, resto → 3). Ordenar por él no requiere ningún campo nuevo
 * en Airtable ni depende de la fórmula.
 *
 * `sla_desc` = "SLA descendente" en la UI = **lo más urgente primero**, o sea
 * `slaDias` ascendente. El empate se rompe por código para que el orden sea
 * estable entre recargas.
 */
function ordenarPorSla(data: Solicitud[], orden: OrdenParam): Solicitud[] {
  const signo = orden === 'sla_desc' ? 1 : -1
  return [...data].sort(
    (a, b) => signo * (a.slaDias - b.slaDias) || a.codigoExt.localeCompare(b.codigoExt)
  )
}

export async function fetchSolicitudes(
  vista: Vista = VISTA_DEFAULT,
  userId?: string,
  filtros?: SolicitudesFiltros,
  orden?: OrdenParam
): Promise<FetchResult> {
  // "Mi cartera": resolver clerk_user_id -> AUTH_Usuarios ANTES de armar la
  // fórmula. Sin esto, {ejecutiva_asignada} nunca puede matchear un
  // clerk_user_id (E-018/E-019 en docs/aprendizajes.md).
  let ejecutivaNombre: string | undefined
  if (vista === 'mi_cartera') {
    if (!userId) return { data: [], motivo: 'ejecutiva_no_encontrada' }
    const ejecutiva = await resolveEjecutiva(userId)
    if (!ejecutiva) return { data: [], motivo: 'ejecutiva_no_encontrada' }
    ejecutivaNombre = ejecutiva.nombre
  }

  const formula = buildFormula(vista, ejecutivaNombre, filtros)
  const sort = ordenToSort(orden)

  // Los rótulos de §5.2.4 se leen una vez por request y van cacheados 12 h en
  // `lib/sla-etapas.ts`. La lectura es **tolerante a fallo a propósito**: si
  // `C_SLA_Etapas` no responde, la bandeja se sirve igual con `Etapa {n}` como
  // rótulo. Un catálogo de nombres no puede tumbar la cartera entera; los
  // umbrales sí son bloqueantes, pero esos no se leen acá.
  let nombresEtapa: ReadonlyMap<number, string> | undefined
  try {
    nombresEtapa = nombresDeEtapas(await obtenerMatrizEtapas())
  } catch (err) {
    console.warn('[fetchSolicitudes] no se pudo leer C_SLA_Etapas; etapas sin rótulo', err)
  }

  try {
    const records = await listRecords<RawFields>(TX_SOLICITUDES, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      filterByFormula: formula,
      'sort[0][field]': sort.field,
      'sort[0][direction]': sort.direction,
      fields: SOLICITUD_FIELDS,
    })
    const data = records.map((r) => mapRecord(r.id, r.createdTime, r.fields, nombresEtapa))
    // El orden por SLA se resuelve aquí y no en Airtable (ver `ordenarPorSla`).
    // Es seguro hacerlo en memoria porque esta función ya devuelve el conjunto
    // completo y la paginación se aplica después, sobre el array ordenado.
    return {
      data:
        orden === 'sla_desc' || orden === 'sla_asc' ? ordenarPorSla(data, orden) : data,
    }
  } catch (err) {
    // ejecutiva_asignada not yet created in TX_Solicitudes (D-08 pending)
    if (
      err instanceof AirtableError &&
      vista === 'mi_cartera' &&
      (err.message.includes('ejecutiva_asignada') || err.message.includes('Unknown field names'))
    ) {
      return { data: [], degraded: true }
    }
    throw err
  }
}
