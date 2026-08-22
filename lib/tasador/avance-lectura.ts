/**
 * Traducción de `TX_Adjuntos.estado_extraccion` al avance de la Pantalla 4.
 *
 * RF-TAS-15 · plan IF-03 §7.1 y §7.2 paso 3. Creado en **P6-TAS**.
 *
 * ## Por qué existe, y por qué es una función pura en `lib/`
 *
 * §7.2 pide mapear los **siete** valores del pipeline a los **tres** pasos del
 * stepper «en una función explícita». Hasta P6-TAS ese mapeo **no existía**: la
 * rama `lectura` de `estado-procesando.tsx` avanzaba con dos `setTimeout` de 4 y
 * 8 segundos, así que el stepper llegaba a «Datos listos» aunque no hubiera
 * terminado nada — y habilitaba «Continuar».
 *
 * Vive en `lib/` y no dentro del componente porque es la pieza que decide si el
 * tasador puede avanzar, y eso se prueba sin montar React. No importa nada de
 * servidor (RO-19): lo consume un componente cliente.
 *
 * ## Terminal no es lo mismo que «puede continuar»
 *
 * Cinco de los siete estados son terminales, pero sólo tres autorizan a seguir.
 * La distinción es el corazón del criterio de §7.3: *«`error` y
 * `delegado_visador` tienen tratamiento propio y no habilitan el botón»*.
 *
 * | Estado | ¿Terminal? | ¿Deja continuar? | Qué significa |
 * |---|---|---|---|
 * | `idle` | no | no | subido, sin procesar todavía |
 * | `extrayendo` | no | no | en curso |
 * | `listo` | sí | **sí** | datos obtenidos |
 * | `skipped` | sí | **sí** | no había nada que leer en este documento |
 * | `no_corresponde` | sí | **sí** | el documento no aplica a esta tasación |
 * | `error` | sí | **no** | falló la lectura |
 * | `delegado_visador` | sí | **no** | quedó para que lo resuelva el visador |
 *
 * `skipped` y `no_corresponde` dejan pasar a propósito: son desenlaces normales
 * —«acá no había nada que leer»— y bloquear por ellos dejaría al tasador
 * atascado sin nada que pueda hacer al respecto.
 */

/** Los siete valores del `singleSelect`, verificados vía meta API el 05-ago-2026. */
export const ESTADOS_EXTRACCION = [
  'idle',
  'extrayendo',
  'listo',
  'error',
  'skipped',
  'no_corresponde',
  'delegado_visador',
] as const

export type EstadoExtraccion = (typeof ESTADOS_EXTRACCION)[number]

/** Estados en los que ya no queda trabajo pendiente sobre ese adjunto. */
const TERMINALES: ReadonlySet<string> = new Set([
  'listo',
  'error',
  'skipped',
  'no_corresponde',
  'delegado_visador',
])

/**
 * Terminales que **no** autorizan a continuar. Es la lista corta y explícita
 * que exige §7.3; cualquier estado nuevo que aparezca en Airtable se comporta
 * por omisión como «deja continuar», que es la degradación segura: bloquear por
 * un valor que nadie definió dejaría la pantalla muerta sin diagnóstico.
 */
const BLOQUEANTES: ReadonlySet<string> = new Set(['error', 'delegado_visador'])

/** Conteo por estado tal como lo devuelve `GET /api/tasaciones/[id]/lectura`. */
export type ConteoPorEstado = Partial<Record<EstadoExtraccion, number>> &
  Record<string, number | undefined>

export interface AvanceLectura {
  /** Fase del stepper: 0 procesando · 1 casi listo · 2 completo. */
  fase: 0 | 1 | 2
  /** Todos los adjuntos alcanzaron un estado terminal. */
  completo: boolean
  /**
   * Habilita «Continuar con datos de la visita».
   *
   * Es `completo` **menos** los terminales bloqueantes. Nunca se deriva de un
   * temporizador ni del tiempo transcurrido.
   */
  puedeContinuar: boolean
  hayError: boolean
  hayDelegado: boolean
  total: number
  terminados: number
  pendientes: number
  /** Porcentaje real de avance, 0-100. Sin adjuntos es 100. */
  progreso: number
}

function sumar(conteo: ConteoPorEstado, claves: ReadonlySet<string>): number {
  let n = 0
  for (const [estado, cantidad] of Object.entries(conteo)) {
    if (claves.has(estado)) n += cantidad ?? 0
  }
  return n
}

/**
 * Resuelve el avance a partir del conteo por estado.
 *
 * **Sin adjuntos el avance es completo.** No hay nada que esperar, y dejar el
 * stepper girando para siempre sería peor que avanzar — mismo criterio que ya
 * aplica el Route Handler.
 */
export function resolverAvanceLectura(conteo: ConteoPorEstado): AvanceLectura {
  const total = Object.values(conteo).reduce<number>((a, n) => a + (n ?? 0), 0)
  const terminados = sumar(conteo, TERMINALES)
  const pendientes = Math.max(0, total - terminados)

  const hayError = (conteo.error ?? 0) > 0
  const hayDelegado = (conteo.delegado_visador ?? 0) > 0
  const bloqueados = sumar(conteo, BLOQUEANTES)

  const completo = total === 0 || terminados === total

  return {
    fase: completo ? 2 : terminados > 0 ? 1 : 0,
    completo,
    puedeContinuar: completo && bloqueados === 0,
    hayError,
    hayDelegado,
    total,
    terminados,
    pendientes,
    progreso: total === 0 ? 100 : Math.round((terminados / total) * 100),
  }
}

/** ¿Este valor de `estado_extraccion` cuenta como terminado? */
export function esTerminal(estado: string): boolean {
  return TERMINALES.has(estado)
}
