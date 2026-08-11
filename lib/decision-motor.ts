/**
 * Contrato de la decisión del motor de reglas (§5.1 · AT01 · RF-22 · RN-19).
 *
 * ## Por qué este módulo no toca Airtable
 *
 * Lo consumen dos lados: el Route Handler (server) y el bloque de la pestaña
 * Datos (cliente). Si acá se importara `lib/airtable-client.ts`, el cliente REST
 * y su lectura de `AIRTABLE_TOKEN` viajarían al bundle del navegador. Misma
 * separación que `lib/sla-cronologia.ts` (contrato, cliente-safe) frente a
 * `lib/sla-etapas.ts` (Airtable): acá viven el tipo, los literales de pantalla y
 * el mapeo puro; la lectura vive en `lib/decision-motor-airtable.ts`.
 */

/** Una regla que compitió por la solicitud y perdió. */
export interface ReglaCandidata {
  nombre: string
  /** Motivo del descarte, ya redactado en lenguaje de usuario. */
  motivo: string
}

export interface DecisionMotor {
  /** Nombre de la regla que ganó la evaluación. */
  reglaGanadora: string
  /** Por qué ganó, en lenguaje de usuario (§6.1). */
  razon: string
  /** Las que compitieron y perdieron, con su motivo. */
  candidatasDescartadas: ReglaCandidata[]
  /** Qué resolvió el motor: plantilla, fórmulas y workflow. Nunca un profesional. */
  plantilla?: string
  formulas: string[]
  workflow?: string
  /** Cuándo se evaluó, ya formateado para pantalla. */
  evaluadaEl?: string
  /** Versión del script AT01 que produjo la decisión. */
  motorVersion?: string
}

/**
 * Literales de pantalla del bloque (§6.1). Viven acá y no en el componente para
 * que el módulo que produce el dato y el que lo muestra no puedan divergir en
 * cómo nombran la ausencia y el fallo (RO-05), igual que `MSG_SIN_CRONOLOGIA` /
 * `MSG_ERROR_CRONOLOGIA` en `lib/sla-cronologia.ts`.
 *
 * La distinción entre los dos importa: "todavía no evaluó" es el curso normal
 * de una solicitud recién creada —AT01 se dispara con `estado = creada`— y "no
 * pudimos leer" es un fallo que hay que reintentar. Pintarlos igual los vuelve
 * indistinguibles siendo operativamente opuestos.
 */
export const MSG_SIN_DECISION =
  'El motor de reglas todavía no ha evaluado esta solicitud.'

export const MSG_ERROR_DECISION =
  'No pudimos cargar la decisión del motor de reglas. Intenta nuevamente en unos segundos.'

/** Forma de cada elemento de `reglas_candidatas_json`, tal como AT01 lo escribe. */
export interface CandidataCruda {
  regla_id?: string
  nombre?: string
  /** Especificidad de RF-22: cuántos filtros no-wildcard coincidieron. */
  score?: number
  /** Desempate de RN-19. Gana el número mayor (Capa de Datos §7.5). */
  prioridad?: number
  matches?: string[]
}

/** Forma de `regla_ganadora_snapshot`, tal como AT01 lo escribe. */
export interface SnapshotCrudo {
  nombre?: string
  prioridad?: number
  plantilla_resultado?: string
  formulas_resultado?: string
  workflow_resultado?: string
}

/** Campos de `A_DecisionesMotor` que consume este mapeo. */
export interface DecisionMotorFields {
  regla_ganadora_nombre?: string
  razon_ganadora?: string
  reglas_candidatas_json?: string
  regla_ganadora_snapshot?: string
  timestamp_decision?: string
  motor_version?: string
}

/**
 * Nombres de las cinco dimensiones de contexto (§5.1) en lenguaje de usuario.
 * Las claves son las que AT01 emite dentro de `matches[]`.
 */
const DIMENSIONES: Record<string, string> = {
  cliente: 'cliente',
  tipo_informe: 'tipo de informe',
  tipo_propiedad: 'tipo de propiedad',
  banco: 'banco',
  comuna: 'comuna',
  monto: 'monto',
}

function etiquetaDimension(clave: string): string {
  return DIMENSIONES[clave] ?? clave.replace(/_/g, ' ')
}

/** "a, b y c" — enumeración en castellano, sin coma antes de la "y". */
function enumerar(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || raw.trim() === '') return null
  try {
    return JSON.parse(raw) as T
  } catch {
    // El campo es texto libre: una fila mal escrita no puede tumbar el bloque.
    return null
  }
}

/**
 * Traduce el porqué de la victoria.
 *
 * `razon_ganadora` llega como `"score=2 prioridad=10 matches=[tipo_informe,tipo_propiedad]"`,
 * que es jerga del script y no se le muestra a la Ejecutiva (§6.1). Se
 * reconstruye la frase desde la candidata ganadora, que trae los mismos datos ya
 * estructurados. Si esa candidata no aparece —fila vieja, JSON roto— se cae al
 * literal de regla por defecto en vez de exponer el string crudo.
 */
export function redactarRazon(ganadora: CandidataCruda | undefined): string {
  const matches = (ganadora?.matches ?? []).filter(Boolean)

  if (matches.length === 0) {
    return 'Ninguna regla específica coincidió con esta solicitud, así que se aplicó la regla por defecto.'
  }

  const dims = enumerar(matches.map(etiquetaDimension))
  return matches.length === 1
    ? `Es la regla más específica que coincide con esta solicitud: coincide en ${dims}.`
    : `Es la regla más específica que coincide con esta solicitud: coincide en ${dims} (${matches.length} coincidencias).`
}

/**
 * Redacta por qué se descartó una candidata, comparándola con la ganadora.
 *
 * Las dos razones posibles son las de RF-22 · RN-19, en ese orden: menor
 * especificidad primero, y menor prioridad sólo cuando la especificidad empata.
 */
export function motivoDescarte(
  candidata: CandidataCruda,
  ganadora: CandidataCruda | undefined
): string {
  const score = candidata.score ?? 0
  const scoreGanadora = ganadora?.score ?? 0

  if (score < scoreGanadora) {
    const propias = (candidata.matches ?? []).length
    return propias === 0
      ? 'Menos específica: no coincide en ninguna dimensión de la solicitud.'
      : `Menos específica: coincide en ${propias} de ${scoreGanadora} dimensiones.`
  }

  if (score === scoreGanadora) {
    return 'Igual de específica, pero con menor prioridad configurada.'
  }

  // No debería ocurrir si AT01 resolvió bien; se informa sin inventar una causa.
  return 'Descartada por el motor de reglas.'
}

/** `formulas_resultado` viene como lista separada por comas en un solo string. */
function parseFormulas(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f !== '')
}

function formatearInstante(iso: string | undefined): string | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  if (isNaN(d.getTime())) return undefined
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santiago',
  })
}

/**
 * Traduce una fila de `A_DecisionesMotor` al contrato de pantalla.
 *
 * Devuelve `null` cuando la fila no nombra regla ganadora: sin ese dato no dice
 * nada útil y es mejor tratarla como ausencia de decisión que pintar un bloque
 * de encabezados vacíos.
 */
export function mapDecisionMotor(f: DecisionMotorFields): DecisionMotor | null {
  const candidatas = parseJson<CandidataCruda[]>(f.reglas_candidatas_json) ?? []
  const snapshot = parseJson<SnapshotCrudo>(f.regla_ganadora_snapshot)

  const nombreGanadora =
    f.regla_ganadora_nombre?.trim() || snapshot?.nombre?.trim() || ''
  if (!nombreGanadora) return null

  const ganadora = candidatas.find((c) => c.nombre === nombreGanadora)

  return {
    reglaGanadora: nombreGanadora,
    razon: redactarRazon(ganadora),
    candidatasDescartadas: candidatas
      .filter((c) => c.nombre && c.nombre !== nombreGanadora)
      .map((c) => ({
        nombre: c.nombre as string,
        motivo: motivoDescarte(c, ganadora),
      })),
    plantilla: snapshot?.plantilla_resultado?.trim() || undefined,
    formulas: parseFormulas(snapshot?.formulas_resultado),
    workflow: snapshot?.workflow_resultado?.trim() || undefined,
    evaluadaEl: formatearInstante(f.timestamp_decision),
    motorVersion: f.motor_version?.trim() || undefined,
  }
}
