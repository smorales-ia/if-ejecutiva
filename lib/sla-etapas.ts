/**
 * Motor de las siete etapas de SLA (RF-53 · Spec v1.9.9 §5.2.4 · plan §9.6.2 B-3).
 *
 * ## Qué hace y qué no
 *
 * Materializa, para la etapa vigente de una solicitud, los dos **instantes de
 * pared** contra los que después se compara `NOW()`: `sla_etapa_alerta_ts` (SLA
 * ideal, umbral ámbar) y `sla_etapa_vence_ts` (SLA máximo, umbral rojo). Ese es
 * el truco que hace barato todo lo demás: la aritmética hábil corre unas siete
 * veces en la vida de una solicitud, no una vez por render.
 *
 * **No calcula el semáforo.** `sla_semaforo_etapa` es una fórmula de Airtable
 * que se deriva sola de esos dos timestamps. Este módulo nunca la escribe.
 *
 * **No escribe `A_Eventos`.** La cronología la escribe la capa de Route Handler
 * (Tanda C), que es la que conoce al actor. Separación de responsabilidades.
 *
 * **Cero umbrales hardcodeados.** Los catorce números de §5.2.4 viven en
 * `C_SLA_Etapas` y llegan como parámetro. Si esta tabla está vacía, el motor
 * falla con `SlaConfigFaltante` en vez de inventar un default.
 *
 * ## Sobre la persistencia
 *
 * El plan §9.6 · C-5 es explícito: en el flujo de asignación **el motor calcula
 * y Make persiste** — la UI no escribe Airtable. Por eso toda función que
 * escribe acepta `persistir: false`, y en ese modo devuelve el payload de
 * campos listo para que el Route Handler lo agregue al webhook de Make sin que
 * este módulo toque la base. El default es `persistir: true`, para los flujos
 * que no pasan por un escenario (pausa, reanudación, recálculo periódico).
 */

import { getRecord, listRecords, updateRecord } from './airtable-client'
import { obtenerFeriados } from './feriados'
import {
  minutosHabilesEntre,
  proximoInstanteHabil,
  sumarHorasHabiles,
} from './sla-habil'
import { TX_SOLICITUDES } from './solicitudes'

export const C_SLA = 'tblsPZokEK5aoinTn'
export const C_SLA_ETAPAS = 'tbl05zu5RLhH3u6pl'

// ---------------------------------------------------------------------------
// Contrato de campos
// ---------------------------------------------------------------------------

export type NumeroEtapa = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const ETAPAS: readonly NumeroEtapa[] = [1, 2, 3, 4, 5, 6, 7]

/**
 * FIELD_IDs de los campos SLA de `TX_Solicitudes`, verificados vía MCP el
 * 10-ago-2026. El módulo hace I/O **por nombre** —Airtable acepta ambos y el
 * nombre se lee mejor en el código—, pero los IDs quedan acá porque son lo
 * estable: si alguien renombra un campo en la UI, el test de contrato que
 * compara este mapa contra el schema real es lo que lo detecta. Un nombre roto
 * degrada en silencio; ese es el fallo de `ejecutiva_asignada` (E-018/E-019).
 */
export const FIELD_IDS_SLA: Readonly<Record<string, string>> = Object.freeze({
  sla_e1_inicio_ts: 'fldPZ7ReQbC1UbIMu',
  sla_e1_fin_ts: 'fldhjG9m8HQPIg7fU',
  sla_e2_inicio_ts: 'fld9aaxAutxDJD9kI',
  sla_e2_fin_ts: 'fldE3gNPlgcsFMW6Y',
  sla_e3_inicio_ts: 'fldGs8M0M3kjTuMiX',
  sla_e3_fin_ts: 'fldFVy311G4edZt8h',
  sla_e4_inicio_ts: 'fldKUTLGV3HAjFkKT',
  sla_e4_fin_ts: 'fldtDSgTMWu1DYM9l',
  sla_e5_inicio_ts: 'fldmSHiYM8kC6c1cp',
  sla_e5_fin_ts: 'fldH0OPVttx6ah3hA',
  sla_e6_inicio_ts: 'fldFCiX5U0xb2iZ7N',
  sla_e6_fin_ts: 'fldjRvRJEgul5CBDT',
  sla_e7_inicio_ts: 'fld1pqSpWrCbDZlIK',
  sla_e7_fin_ts: 'fldmX8vgc6HT4pjxH',
  sla_etapa_actual: 'fldYpHiAosqbxL85b',
  sla_etapa_alerta_ts: 'fldLfFftNm0Kvvu08',
  sla_etapa_vence_ts: 'fldLJdanpV0FANjKS',
  sla_recalculado_ts: 'fldXG2TODJfP6Snq6',
  sla_pausa_inicio_ts: 'fldvAYI6s6H60xuj6',
  sla_pausa_habil_min: 'fldw01pFmlJ3Ccmcv',
  /** Fórmula. Sólo lectura: el motor nunca la escribe. */
  sla_semaforo_etapa: 'fldB6gJ3clZUPgaZk',
})

export function campoInicio(etapa: NumeroEtapa): string {
  return `sla_e${etapa}_inicio_ts`
}

export function campoFin(etapa: NumeroEtapa): string {
  return `sla_e${etapa}_fin_ts`
}

/** Campos que el motor lee de `TX_Solicitudes`. */
export const CAMPOS_SLA_LECTURA: readonly string[] = [
  ...ETAPAS.map(campoInicio),
  ...ETAPAS.map(campoFin),
  'sla_etapa_actual',
  'sla_etapa_alerta_ts',
  'sla_etapa_vence_ts',
  'sla_recalculado_ts',
  'sla_pausa_inicio_ts',
  'sla_pausa_habil_min',
  'cliente',
  'tipo_informe',
  'tipo_propiedad',
]

// ---------------------------------------------------------------------------
// Errores tipificados
// ---------------------------------------------------------------------------

export class SolicitudNoEncontrada extends Error {
  constructor(public readonly solicitudId: string) {
    super(`No existe la solicitud ${solicitudId} en TX_Solicitudes.`)
    this.name = 'SolicitudNoEncontrada'
  }
}

export class EtapaInvalida extends Error {
  constructor(public readonly etapa: unknown) {
    super(`Etapa fuera del rango 1-7 de §5.2.4: ${String(etapa)}.`)
    this.name = 'EtapaInvalida'
  }
}

export class SlaConfigFaltante extends Error {
  constructor(motivo: string) {
    super(`Configuración de SLA incompleta: ${motivo}`)
    this.name = 'SlaConfigFaltante'
  }
}

// ---------------------------------------------------------------------------
// Tipos de dominio
// ---------------------------------------------------------------------------

/** Una fila de `C_SLA_Etapas`. Los umbrales están en horas hábiles. */
export interface DefinicionEtapa {
  etapaKey: string
  orden: NumeroEtapa
  nombre: string
  responsable: string | null
  idealHoras: number
  maxHoras: number
}

export type MatrizEtapas = Readonly<Record<string, DefinicionEtapa>>

/** Umbrales del par (cliente, tipo_informe, tipo_propiedad) leídos de `C_SLA`. */
export interface SlaDelPar {
  clave: string | null
  /** Override del umbral de la etapa 7 y de ninguna otra (§9.6-R3). */
  revisionHoras: number | null
}

export interface ResultadoRecalculo {
  solicitudId: string
  /** `null` cuando ninguna etapa tiene inicio sin fin: sin datos, no verde. */
  etapaActual: NumeroEtapa | null
  alertaTs: string | null
  venceTs: string | null
  recalculadoTs: string
  /** Minutos hábiles ya consumidos por la etapa vigente. */
  minutosConsumidos: number | null
  /** Payload listo para `PATCH` o para el webhook de Make. */
  campos: Record<string, unknown>
  persistido: boolean
}

/**
 * Puertos de I/O del motor. Se inyectan en los tests con fixtures; en
 * producción se resuelven a Airtable. Mantenerlos explícitos es lo que permite
 * testear la aritmética de negocio sin red.
 */
export interface SlaDeps {
  leerSolicitud(solicitudId: string): Promise<Record<string, unknown> | null>
  escribirSolicitud(solicitudId: string, campos: Record<string, unknown>): Promise<void>
  leerMatriz(): Promise<MatrizEtapas>
  leerSlaDelPar(solicitud: Record<string, unknown>): Promise<SlaDelPar>
  leerFeriados(): Promise<ReadonlySet<string>>
  ahora(): Date
}

export interface OpcionesEscritura {
  /** `false` → no toca Airtable; devuelve el payload para que Make lo persista. */
  persistir?: boolean
  deps?: Partial<SlaDeps>
}

// ---------------------------------------------------------------------------
// Implementación Airtable de los puertos
// ---------------------------------------------------------------------------

const TTL_CATALOGO_MS = 12 * 60 * 60 * 1000

let cacheMatriz: { data: MatrizEtapas; expiresAt: number } | null = null
let cacheSla: { data: FilaSla[]; expiresAt: number } | null = null

interface FilaSla {
  clave: string | null
  clienteIds: string[]
  tipoInformeIds: string[]
  tipoPropiedadIds: string[]
  revisionHoras: number | null
}

function idsDe(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []
  return valor.filter((v): v is string => typeof v === 'string')
}

function esOrdenValido(orden: unknown): orden is NumeroEtapa {
  return typeof orden === 'number' && Number.isInteger(orden) && orden >= 1 && orden <= 7
}

async function leerMatrizAirtable(): Promise<MatrizEtapas> {
  if (cacheMatriz && cacheMatriz.expiresAt > Date.now()) return cacheMatriz.data

  const registros = await listRecords<{
    etapa_key?: string
    orden?: number
    nombre_etapa?: string
    responsable?: string
    sla_ideal_horas?: number
    sla_max_horas?: number
    activo?: boolean
  }>(C_SLA_ETAPAS, {
    fields: [
      'etapa_key',
      'orden',
      'nombre_etapa',
      'responsable',
      'sla_ideal_horas',
      'sla_max_horas',
      'activo',
    ],
  })

  const matriz: Record<string, DefinicionEtapa> = {}
  for (const registro of registros) {
    const f = registro.fields
    if (f.activo !== true) continue
    if (!f.etapa_key || !esOrdenValido(f.orden)) continue
    if (typeof f.sla_ideal_horas !== 'number' || typeof f.sla_max_horas !== 'number') continue
    matriz[f.etapa_key] = {
      etapaKey: f.etapa_key,
      orden: f.orden,
      nombre: f.nombre_etapa ?? '',
      responsable: f.responsable ?? null,
      idealHoras: f.sla_ideal_horas,
      maxHoras: f.sla_max_horas,
    }
  }

  if (Object.keys(matriz).length === 0) {
    throw new SlaConfigFaltante(
      'C_SLA_Etapas no devolvió ninguna fila activa con umbrales. El motor no ' +
        'tiene default: los catorce números de §5.2.4 viven en la tabla.'
    )
  }

  cacheMatriz = { data: matriz, expiresAt: Date.now() + TTL_CATALOGO_MS }
  return matriz
}

async function leerFilasSla(): Promise<FilaSla[]> {
  if (cacheSla && cacheSla.expiresAt > Date.now()) return cacheSla.data

  const registros = await listRecords<{
    clave_natural?: string
    cliente?: string[]
    tipo_informe?: string[]
    tipo_propiedad?: string[]
    sla_revision_horas?: number
    activo?: boolean
  }>(C_SLA, {
    fields: [
      'clave_natural',
      'cliente',
      'tipo_informe',
      'tipo_propiedad',
      'sla_revision_horas',
      'activo',
    ],
  })

  const filas: FilaSla[] = []
  for (const registro of registros) {
    const f = registro.fields
    if (f.activo !== true) continue
    filas.push({
      clave: f.clave_natural ?? null,
      clienteIds: idsDe(f.cliente),
      tipoInformeIds: idsDe(f.tipo_informe),
      tipoPropiedadIds: idsDe(f.tipo_propiedad),
      revisionHoras: typeof f.sla_revision_horas === 'number' ? f.sla_revision_horas : null,
    })
  }

  cacheSla = { data: filas, expiresAt: Date.now() + TTL_CATALOGO_MS }
  return filas
}

/**
 * Resuelve la fila de `C_SLA` aplicable según §9.6-R4: gana la más específica
 * que empareje; si ninguna empareja, la comodín (los tres links vacíos). El
 * comodín **no** se escribe con un literal `*`: `cliente`, `tipo_informe` y
 * `tipo_propiedad` son links y su forma de decir "cualquiera" es estar vacíos.
 */
export function resolverSlaDelPar(
  solicitud: Record<string, unknown>,
  filas: readonly FilaSla[]
): SlaDelPar {
  const cliente = idsDe(solicitud.cliente)
  const tipoInforme = idsDe(solicitud.tipo_informe)
  const tipoPropiedad = idsDe(solicitud.tipo_propiedad)

  let comodin: FilaSla | null = null
  let mejor: FilaSla | null = null
  let mejorPuntaje = -1

  for (const fila of filas) {
    const esComodin =
      fila.clienteIds.length === 0 &&
      fila.tipoInformeIds.length === 0 &&
      fila.tipoPropiedadIds.length === 0
    if (esComodin) {
      comodin = fila
      continue
    }

    let puntaje = 0
    if (fila.clienteIds.length) {
      if (!fila.clienteIds.some((id) => cliente.includes(id))) continue
      puntaje += 4
    }
    if (fila.tipoInformeIds.length) {
      if (!fila.tipoInformeIds.some((id) => tipoInforme.includes(id))) continue
      puntaje += 2
    }
    if (fila.tipoPropiedadIds.length) {
      if (!fila.tipoPropiedadIds.some((id) => tipoPropiedad.includes(id))) continue
      puntaje += 1
    }
    if (puntaje > mejorPuntaje) {
      mejor = fila
      mejorPuntaje = puntaje
    }
  }

  const ganadora = mejor ?? comodin
  if (!ganadora) return { clave: null, revisionHoras: null }

  // Resolución campo a campo (§9.6-R4): un campo vacío en la fila específica se
  // completa con el de la comodín.
  return {
    clave: ganadora.clave,
    revisionHoras: ganadora.revisionHoras ?? comodin?.revisionHoras ?? null,
  }
}

const DEPS_AIRTABLE: SlaDeps = {
  async leerSolicitud(solicitudId) {
    const registro = await getRecord<Record<string, unknown>>(TX_SOLICITUDES, solicitudId)
    return registro ? registro.fields : null
  },
  async escribirSolicitud(solicitudId, campos) {
    await updateRecord(TX_SOLICITUDES, solicitudId, campos)
  },
  leerMatriz: leerMatrizAirtable,
  async leerSlaDelPar(solicitud) {
    return resolverSlaDelPar(solicitud, await leerFilasSla())
  },
  leerFeriados: obtenerFeriados,
  ahora: () => new Date(),
}

function resolverDeps(parciales?: Partial<SlaDeps>): SlaDeps {
  return parciales ? { ...DEPS_AIRTABLE, ...parciales } : DEPS_AIRTABLE
}

/** Invalida las caches de catálogo. Para tests y para después de M-11/M-12. */
export function invalidarCachesSla(): void {
  cacheMatriz = null
  cacheSla = null
}

/**
 * Lectura pública de la matriz de §5.2.4 (Tanda C · §9.6.2 C-2/C-4).
 *
 * Es el mismo lector cacheado que usa `DEPS_AIRTABLE.leerMatriz`, expuesto sin
 * cambiarle nada. Existe porque la Tanda C necesita los **nombres y
 * responsables** de las siete etapas en dos sitios —el mapper de la bandeja y
 * `GET /api/solicitudes/[id]/sla`— y la alternativa era escribir un segundo
 * lector de `C_SLA_Etapas` en `lib/solicitudes.ts`. Dos lectores del mismo
 * catálogo divergen, y es justo lo que **RO-05** prohíbe.
 *
 * Aditivo puro: no cambia ninguna firma ni comportamiento del motor.
 */
export function obtenerMatrizEtapas(): Promise<MatrizEtapas> {
  return leerMatrizAirtable()
}

/**
 * Resuelve la fila de `C_SLA` aplicable a una solicitud ya leída, con la
 * precedencia de §9.6-R4. Misma razón de ser que `obtenerMatrizEtapas`: el
 * override de e7 (`sla_revision_horas` · §9.6-R3) lo necesita el endpoint de
 * cronología, y `leerFilasSla` es privado.
 */
export async function obtenerSlaDelPar(
  solicitud: Record<string, unknown>
): Promise<SlaDelPar> {
  return resolverSlaDelPar(solicitud, await leerFilasSla())
}

// ---------------------------------------------------------------------------
// Lógica de etapas
// ---------------------------------------------------------------------------

function validarEtapa(etapa: unknown): NumeroEtapa {
  if (!esOrdenValido(etapa)) throw new EtapaInvalida(etapa)
  return etapa
}

function leerFecha(solicitud: Record<string, unknown>, campo: string): Date | null {
  const valor = solicitud[campo]
  if (typeof valor !== 'string' || valor.length === 0) return null
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

/**
 * Etapa vigente: la de mayor orden con inicio poblado y fin vacío.
 *
 * Devuelve `null` si ninguna cumple, y eso es un resultado legítimo, no un
 * error: en v1.9 sólo e1 y e2 tienen escritor, así que buena parte de la
 * cartera vive en "sin datos de etapa". Nunca se fabrica un verde que la base
 * no respalda.
 *
 * @example
 * // e1 cerrada, e2 abierta → 2
 * etapaVigente({ sla_e1_inicio_ts: '…', sla_e1_fin_ts: '…', sla_e2_inicio_ts: '…' })
 */
export function etapaVigente(solicitud: Record<string, unknown>): NumeroEtapa | null {
  let vigente: NumeroEtapa | null = null
  for (const etapa of ETAPAS) {
    const inicio = leerFecha(solicitud, campoInicio(etapa))
    const fin = leerFecha(solicitud, campoFin(etapa))
    if (inicio && !fin) vigente = etapa
  }
  return vigente
}

/**
 * Umbrales aplicables a una etapa, en horas hábiles, aplicando la precedencia
 * de §9.6-R3: `C_SLA.sla_revision_horas` es override del umbral de la **etapa
 * 7 y de ninguna otra**. Vacío → manda `C_SLA_Etapas`. Poblado → sustituye
 * *ambos* umbrales de e7 para ese par.
 *
 * @throws {SlaConfigFaltante} Si la matriz no tiene fila para la etapa.
 */
export function umbralesDeEtapa(
  etapa: NumeroEtapa,
  matriz: MatrizEtapas,
  sla: SlaDelPar,
  override?: number
): { idealHoras: number; maxHoras: number; definicion: DefinicionEtapa } {
  const definicion = matriz[`e${etapa}`]
  if (!definicion) {
    throw new SlaConfigFaltante(`C_SLA_Etapas no tiene fila activa para la etapa e${etapa}.`)
  }

  const ultimaEtapa = ETAPAS[ETAPAS.length - 1]
  const revision = override ?? sla.revisionHoras
  if (etapa === ultimaEtapa && typeof revision === 'number') {
    return { idealHoras: revision, maxHoras: revision, definicion }
  }

  return { idealHoras: definicion.idealHoras, maxHoras: definicion.maxHoras, definicion }
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export interface OpcionesRecalculo extends OpcionesEscritura {
  /** Fuerza el override de e7 sin leer `C_SLA`. Para pruebas y correcciones. */
  slaRevisionHorasOverride?: number
}

/**
 * Recalcula los umbrales de la etapa vigente y los persiste.
 *
 * Determina la etapa actual a partir de los timestamps ya escritos, convierte
 * los umbrales en horas hábiles a instantes de pared con `sumarHorasHabiles`
 * desde el `sla_eN_inicio_ts` correspondiente, y descuenta el tiempo ya
 * acumulado en `sla_pausa_habil_min` corriendo los dos umbrales hacia adelante
 * (RN-54).
 *
 * Si no hay etapa vigente, limpia `sla_etapa_alerta_ts` y `sla_etapa_vence_ts`
 * para que la fórmula devuelva `sin_dato` en vez de arrastrar los umbrales de
 * una etapa ya cerrada.
 *
 * @param solicitudId Record ID de `TX_Solicitudes`.
 * @param opciones `persistir: false` devuelve el payload sin tocar Airtable
 *   (§9.6 · C-5: en el flujo de asignación persiste Make, no el motor).
 * @throws {SolicitudNoEncontrada} Si el record ID no existe.
 * @throws {SlaConfigFaltante} Si la matriz de etapas no cubre la etapa vigente.
 */
export async function recalcularSla(
  solicitudId: string,
  opciones: OpcionesRecalculo = {}
): Promise<ResultadoRecalculo> {
  const deps = resolverDeps(opciones.deps)
  const solicitud = await deps.leerSolicitud(solicitudId)
  if (!solicitud) throw new SolicitudNoEncontrada(solicitudId)

  const ahora = deps.ahora()
  const recalculadoTs = ahora.toISOString()
  const etapa = etapaVigente(solicitud)

  if (etapa === null) {
    const campos: Record<string, unknown> = {
      sla_etapa_actual: null,
      sla_etapa_alerta_ts: null,
      sla_etapa_vence_ts: null,
      sla_recalculado_ts: recalculadoTs,
    }
    const persistido = opciones.persistir !== false
    if (persistido) await deps.escribirSolicitud(solicitudId, campos)
    return {
      solicitudId,
      etapaActual: null,
      alertaTs: null,
      venceTs: null,
      recalculadoTs,
      minutosConsumidos: null,
      campos,
      persistido,
    }
  }

  const [matriz, sla, feriados] = await Promise.all([
    deps.leerMatriz(),
    deps.leerSlaDelPar(solicitud),
    deps.leerFeriados(),
  ])

  const { idealHoras, maxHoras } = umbralesDeEtapa(
    etapa,
    matriz,
    sla,
    opciones.slaRevisionHorasOverride
  )

  const inicio = leerFecha(solicitud, campoInicio(etapa))
  if (!inicio) {
    throw new SlaConfigFaltante(
      `La etapa e${etapa} figura vigente pero ${campoInicio(etapa)} no es una fecha válida.`
    )
  }

  const pausaBruta = solicitud.sla_pausa_habil_min
  const pausaMin = typeof pausaBruta === 'number' && pausaBruta > 0 ? pausaBruta : 0
  const pausaHoras = pausaMin / 60

  const alerta = sumarHorasHabiles(inicio, idealHoras + pausaHoras, feriados)
  const vence = sumarHorasHabiles(inicio, maxHoras + pausaHoras, feriados)
  const consumidos = Math.max(0, minutosHabilesEntre(inicio, ahora, feriados) - pausaMin)

  const campos: Record<string, unknown> = {
    sla_etapa_actual: etapa,
    sla_etapa_alerta_ts: alerta.toISOString(),
    sla_etapa_vence_ts: vence.toISOString(),
    sla_recalculado_ts: recalculadoTs,
  }

  const persistido = opciones.persistir !== false
  if (persistido) await deps.escribirSolicitud(solicitudId, campos)

  return {
    solicitudId,
    etapaActual: etapa,
    alertaTs: alerta.toISOString(),
    venceTs: vence.toISOString(),
    recalculadoTs,
    minutosConsumidos: consumidos,
    campos,
    persistido,
  }
}

export interface OpcionesMarcaEtapa extends OpcionesEscritura {
  /** Sobrescribe un timestamp ya presente. Por defecto la marca es idempotente. */
  forzar?: boolean
  /** Evita el recálculo encadenado. Para agrupar varias marcas en un PATCH. */
  omitirRecalculo?: boolean
}

/**
 * Escribe `sla_eN_inicio_ts` y recalcula los umbrales de la etapa.
 *
 * **Idempotente:** si el campo ya tiene timestamp, no lo pisa —salvo `forzar`—.
 * Volver a llamarla no corre el reloj hacia adelante, que es exactamente lo que
 * un reintento de webhook haría sin este guard.
 *
 * El instante se normaliza a la ventana hábil (§5.2.1): un inicio registrado un
 * viernes a las 22:00 se guarda como el lunes a las 09:00, porque el reloj no
 * puede empezar a correr fuera de jornada (§5.2.2).
 *
 * @param solicitudId Record ID de `TX_Solicitudes`.
 * @param etapa Etapa 1–7.
 * @param instante Instante de entrada. Por defecto, ahora.
 * @throws {EtapaInvalida} Si la etapa no está en 1–7.
 * @throws {SolicitudNoEncontrada} Si el record ID no existe.
 */
export async function marcarInicioEtapa(
  solicitudId: string,
  etapa: NumeroEtapa,
  instante?: Date,
  opciones: OpcionesMarcaEtapa = {}
): Promise<ResultadoRecalculo | null> {
  const numero = validarEtapa(etapa)
  const deps = resolverDeps(opciones.deps)
  const solicitud = await deps.leerSolicitud(solicitudId)
  if (!solicitud) throw new SolicitudNoEncontrada(solicitudId)

  const campo = campoInicio(numero)
  if (!opciones.forzar && leerFecha(solicitud, campo)) return null

  const feriados = await deps.leerFeriados()
  const normalizado = proximoInstanteHabil(instante ?? deps.ahora(), feriados)

  const persistir = opciones.persistir !== false
  if (persistir) {
    await deps.escribirSolicitud(solicitudId, { [campo]: normalizado.toISOString() })
  }
  if (opciones.omitirRecalculo) return null

  // El recálculo trabaja sobre la solicitud **proyectada**, no sobre una
  // relectura. Dos razones: en modo `persistir: false` la marca no está en la
  // base, y en modo persistente una relectura inmediata puede no verla todavía.
  // Proyectar es correcto en ambos casos y no depende de la consistencia de
  // Airtable.
  const proyectada: Record<string, unknown> = {
    ...solicitud,
    [campo]: normalizado.toISOString(),
  }

  const resultado = await recalcularSla(solicitudId, {
    persistir,
    deps: { ...(opciones.deps ?? {}), leerSolicitud: async () => proyectada },
  })
  return {
    ...resultado,
    campos: { ...resultado.campos, [campo]: normalizado.toISOString() },
  }
}

/**
 * Escribe `sla_eN_fin_ts` y, si la etapa no es la última, abre la siguiente.
 *
 * El encadenamiento implementa las transiciones "De → A" de §5.2.4: cerrar una
 * etapa es abrir la próxima. `sla_eN_fin_ts` y `sla_e(N+1)_inicio_ts` quedan en
 * el mismo instante en el flujo feliz, pero se guardan por separado a propósito:
 * la etapa siguiente puede arrancar tarde, y esa brecha es lo que los reportes
 * de §5.2.9 tienen que poder ver.
 *
 * @param solicitudId Record ID de `TX_Solicitudes`.
 * @param etapa Etapa 1–7 que se cierra.
 * @param instante Instante de salida. Por defecto, ahora.
 * @throws {EtapaInvalida} Si la etapa no está en 1–7.
 * @throws {SolicitudNoEncontrada} Si el record ID no existe.
 */
export async function marcarFinEtapa(
  solicitudId: string,
  etapa: NumeroEtapa,
  instante?: Date,
  opciones: OpcionesMarcaEtapa = {}
): Promise<ResultadoRecalculo | null> {
  const numero = validarEtapa(etapa)
  const deps = resolverDeps(opciones.deps)
  const solicitud = await deps.leerSolicitud(solicitudId)
  if (!solicitud) throw new SolicitudNoEncontrada(solicitudId)

  const campo = campoFin(numero)
  if (!opciones.forzar && leerFecha(solicitud, campo)) return null

  const feriados = await deps.leerFeriados()
  const cierre = proximoInstanteHabil(instante ?? deps.ahora(), feriados)
  const persistir = opciones.persistir !== false

  if (persistir) {
    await deps.escribirSolicitud(solicitudId, { [campo]: cierre.toISOString() })
  }

  const solicitudProyectada: Record<string, unknown> = {
    ...solicitud,
    [campo]: cierre.toISOString(),
  }

  const ultimaEtapa = ETAPAS[ETAPAS.length - 1]
  if (numero === ultimaEtapa) {
    if (opciones.omitirRecalculo) return null
    // Cerrada la última etapa no queda ninguna vigente: el recálculo limpia los
    // umbrales y la fórmula pasa a `sin_dato`, que es lo correcto —no hay etapa
    // que pueda estar atrasada—.
    const resultado = await recalcularSla(solicitudId, {
      persistir,
      deps: { ...(opciones.deps ?? {}), leerSolicitud: async () => solicitudProyectada },
    })
    return { ...resultado, campos: { ...resultado.campos, [campo]: cierre.toISOString() } }
  }

  const siguiente = (numero + 1) as NumeroEtapa
  const campoSiguiente = campoInicio(siguiente)

  const resultado = await marcarInicioEtapa(solicitudId, siguiente, cierre, {
    ...opciones,
    forzar: false,
    // El encadenado ve la solicitud con el fin ya aplicado, tanto si se
    // persistió como si no: en ambos casos ése es el estado real de negocio.
    deps: { ...(opciones.deps ?? {}), leerSolicitud: async () => solicitudProyectada },
  })

  if (!resultado) return null
  return {
    ...resultado,
    campos: {
      ...resultado.campos,
      [campo]: cierre.toISOString(),
      [campoSiguiente]: resultado.campos[campoSiguiente] ?? cierre.toISOString(),
    },
  }
}

export type MotivoPausa = 'contacto_no_logrado' | 'otro'

/**
 * Detiene el reloj por estado de la solicitud (RN-54).
 *
 * No confundir con la pausa por calendario de §5.2.1, que aplica siempre y no
 * necesita marca: el tiempo fuera de ventana nunca entra al cómputo. Ésta es
 * excepcional y depende del estado.
 *
 * **No-op si ya está pausada.** Volver a pausar reiniciaría el inicio de la
 * pausa y regalaría el tiempo transcurrido.
 *
 * @param solicitudId Record ID de `TX_Solicitudes`.
 * @param motivo Motivo de la pausa. Se devuelve al llamador para que lo
 *   registre en `A_Eventos`; este módulo no escribe la cronología.
 * @returns `true` si pausó, `false` si ya estaba pausada.
 */
export async function pausar(
  solicitudId: string,
  motivo: MotivoPausa,
  opciones: OpcionesEscritura = {}
): Promise<{ pausada: boolean; motivo: MotivoPausa; campos: Record<string, unknown> }> {
  const deps = resolverDeps(opciones.deps)
  const solicitud = await deps.leerSolicitud(solicitudId)
  if (!solicitud) throw new SolicitudNoEncontrada(solicitudId)

  if (leerFecha(solicitud, 'sla_pausa_inicio_ts')) {
    return { pausada: false, motivo, campos: {} }
  }

  const campos = { sla_pausa_inicio_ts: deps.ahora().toISOString() }
  if (opciones.persistir !== false) await deps.escribirSolicitud(solicitudId, campos)
  return { pausada: true, motivo, campos }
}

/**
 * Reanuda el reloj: acumula los minutos hábiles de la pausa en
 * `sla_pausa_habil_min`, limpia `sla_pausa_inicio_ts` y recalcula los umbrales
 * de la etapa vigente, que se corren hacia adelante exactamente por el tiempo
 * hábil pausado.
 *
 * La duración de la pausa se mide **con la misma** `minutosHabilesEntre` que
 * usa el resto del motor, de modo que las noches y los feriados dentro de la
 * pausa no se descuentan dos veces: ya no estaban contados.
 *
 * @param solicitudId Record ID de `TX_Solicitudes`.
 * @returns Minutos hábiles agregados y el recálculo resultante. `reanudada:
 *   false` si no estaba pausada.
 */
export async function reanudar(
  solicitudId: string,
  opciones: OpcionesEscritura = {}
): Promise<{
  reanudada: boolean
  minutosPausa: number
  pausaAcumuladaMin: number
  recalculo: ResultadoRecalculo | null
  campos: Record<string, unknown>
}> {
  const deps = resolverDeps(opciones.deps)
  const solicitud = await deps.leerSolicitud(solicitudId)
  if (!solicitud) throw new SolicitudNoEncontrada(solicitudId)

  const inicioPausa = leerFecha(solicitud, 'sla_pausa_inicio_ts')
  const previo = solicitud.sla_pausa_habil_min
  const acumuladoPrevio = typeof previo === 'number' && previo > 0 ? previo : 0

  if (!inicioPausa) {
    return {
      reanudada: false,
      minutosPausa: 0,
      pausaAcumuladaMin: acumuladoPrevio,
      recalculo: null,
      campos: {},
    }
  }

  const feriados = await deps.leerFeriados()
  const ahora = deps.ahora()
  const minutosPausa = minutosHabilesEntre(inicioPausa, ahora, feriados)
  const acumulado = acumuladoPrevio + minutosPausa

  const campos: Record<string, unknown> = {
    sla_pausa_inicio_ts: null,
    sla_pausa_habil_min: acumulado,
  }

  const persistir = opciones.persistir !== false
  if (persistir) await deps.escribirSolicitud(solicitudId, campos)

  const solicitudProyectada: Record<string, unknown> = {
    ...solicitud,
    sla_pausa_inicio_ts: null,
    sla_pausa_habil_min: acumulado,
  }

  const recalculo = await recalcularSla(solicitudId, {
    persistir,
    deps: { ...(opciones.deps ?? {}), leerSolicitud: async () => solicitudProyectada },
  })

  return {
    reanudada: true,
    minutosPausa,
    pausaAcumuladaMin: acumulado,
    recalculo,
    campos: { ...campos, ...recalculo.campos },
  }
}
