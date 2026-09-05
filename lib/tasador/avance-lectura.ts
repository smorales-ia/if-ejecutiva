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
 * ## Terminal habilita continuar · el desenlace sólo informa (D-2026-09-04)
 *
 * Todo estado terminal deja continuar. `error` y `delegado_visador` ya no
 * bloquean el botón: **surfacean un aviso** («puedes completar esos datos a
 * mano» / «los completa el visador») pero el tasador decide seguir con lo que
 * hay. Es la corrección de una contradicción real de la pantalla: mostraba
 * «Datos listos» + «puedes completar a mano» y a la vez el botón gris, dejando
 * al tasador atrapado sin salida.
 *
 * | Estado | ¿Terminal? | ¿Deja continuar? | Qué significa |
 * |---|---|---|---|
 * | `idle` | no | no | subido, sin procesar todavía |
 * | `extrayendo` | no | no | en curso |
 * | `listo` | sí | **sí** | datos obtenidos |
 * | `skipped` | sí | **sí** | no había nada que leer en este documento |
 * | `no_corresponde` | sí | **sí** | el documento no aplica a esta tasación |
 * | `error` | sí | **sí** (con aviso) | falló la lectura; se completa a mano |
 * | `delegado_visador` | sí | **sí** (con aviso) | lo resuelve el visador |
 *
 * `error`/`delegado_visador` siguen exponiéndose por `hayError`/`hayDelegado`
 * para que el componente pinte el aviso ámbar; lo que cambió es que ya no
 * cierran el botón. **Diverge de §7.3** (que pedía bloquear): decisión de
 * producto del 04-09-2026, pendiente de reconciliar en la spec.
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

/** Conteo por estado tal como lo devuelve `GET /api/tasaciones/[id]/lectura`. */
export type ConteoPorEstado = Partial<Record<EstadoExtraccion, number>> &
  Record<string, number | undefined>

export interface AvanceLectura {
  /** Fase del stepper: 0 procesando · 1 casi listo · 2 completo. */
  fase: 0 | 1 | 2
  /** Todos los adjuntos alcanzaron un estado terminal. */
  completo: boolean
  /**
   * Habilita «Continuar con datos de la visita». Es **igual a `completo`**
   * (D-2026-09-04): en cuanto ningún adjunto sigue en curso, el tasador puede
   * avanzar —aun con `error`/`delegado_visador`, que sólo avisan—. Nunca se
   * deriva de un temporizador ni del tiempo transcurrido.
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

  const completo = total === 0 || terminados === total

  return {
    fase: completo ? 2 : terminados > 0 ? 1 : 0,
    completo,
    puedeContinuar: completo,
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
