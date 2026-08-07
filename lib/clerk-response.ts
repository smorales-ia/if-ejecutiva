/**
 * Detección de respuestas que Clerk cortó por falta de sesión.
 *
 * ## El problema que resuelve
 *
 * Clerk no responde 401 a una petición sin sesión: `auth.protect()`
 * **reescribe a un 404 de HTML**. Ese 404 es indistinguible, mirando el body,
 * de "la ruta no existe" o "el registro no existe", y costó seis turnos de
 * diagnóstico repartidos en dos sesiones (02-ago-2026 y 06-ago-2026): se revisó
 * el regex de `isValidRecordId`, la existencia del archivo de ruta y su
 * registro en el manifiesto, cuando el Route Handler simplemente nunca llegaba
 * a ejecutarse.
 *
 * La implementación anterior discriminaba por `content-type`: «si no es JSON,
 * no lo emitió la app, luego es Clerk». La segunda inferencia no se sigue de la
 * primera —un 404 de routing de Next.js tampoco es JSON y tampoco lo emitió la
 * app—, así que la heurística confundía las dos causas justamente en el caso
 * que pretendía distinguir.
 *
 * ## El signal fiable
 *
 * `clerkMiddleware` agrega `x-clerk-auth-status` a **toda** respuesta que pasa
 * por él; un 404 de routing puro de Next.js no lo lleva. El header discrimina
 * en los dos sentidos, que es lo que el `content-type` no hacía:
 *
 * - Sin sesión → `signed-out`, y el handler nunca corrió.
 * - Con sesión y ruta inexistente → `signed-in`, y el 404 es real.
 *
 * El matcher de `middleware.ts` cubre `/(api|trpc)(.*)`, así que todas las
 * peticiones de la consola pasan por ahí y llevan el header.
 *
 * ## Por qué el header es legible desde el cliente
 *
 * Las peticiones que consumen esto son **same-origin** (`fetch("/api/…")` con
 * `credentials: "same-origin"`), y en same-origin el navegador expone todos los
 * headers de respuesta a JavaScript.
 *
 * ⚠ Si algún día la consola llamara a estos endpoints **cross-origin** —otro
 * dominio, un BFF separado—, `res.headers.get()` devolvería `null` para este
 * header aunque el servidor lo emita: CORS sólo expone una lista blanca de
 * headers seguros. Habría que añadir
 * `Access-Control-Expose-Headers: x-clerk-auth-status` en el middleware, o esta
 * detección volvería a fallar en silencio y en la dirección peor —todo se leería
 * como "no es Clerk"—.
 */

/** Header que `clerkMiddleware` agrega a toda respuesta que pasa por él. */
export const HEADER_CLERK_AUTH_STATUS = 'x-clerk-auth-status'

/**
 * Único valor que significa "hay sesión". Los otros estados documentados de
 * Clerk son `signed-out` (sin token) y `handshake` (token expirado, Clerk aún
 * no sabe si hay sesión); los dos son sesión inválida a efectos de la UI.
 */
export const CLERK_STATUS_SIGNED_IN = 'signed-in'

/**
 * `true` cuando la respuesta la cortó Clerk por falta de sesión.
 *
 * La condición está **por negación** —header presente y distinto de
 * `signed-in`— y no contra una lista de valores inválidos. Así `handshake` y
 * cualquier estado que Clerk agregue en el futuro caen del lado seguro sin
 * tener que enumerarlos, y el código depende de un solo literal, el mejor
 * establecido de los tres.
 *
 * Ausencia de header = no pasó por `clerkMiddleware` = **no** es un problema de
 * sesión, sea cual sea el `content-type` del body.
 */
export function esRespuestaDeClerkSinSesion(res: Response): boolean {
  const status = res.headers.get(HEADER_CLERK_AUTH_STATUS)
  if (status === null) return false
  // `trim().toLowerCase()` es defensa barata: un `Signed-In` con otra
  // capitalización se leería como sesión inválida y mandaría a la Ejecutiva a
  // recargar la página sin motivo.
  return status.trim().toLowerCase() !== CLERK_STATUS_SIGNED_IN
}
