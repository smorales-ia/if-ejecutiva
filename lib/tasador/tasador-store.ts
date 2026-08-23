"use client"

/**
 * Borrador local del formulario de captura.
 *
 * El tasador llena las ocho secciones en terreno, donde la conectividad es
 * mala: perder lo tecleado por un refresco o un túnel sin señal significa
 * volver a medir la propiedad. Este módulo guarda el `InformeData` en
 * `localStorage` para que la pantalla sobreviva a eso.
 *
 * ## No es la fuente de verdad
 *
 * La autoridad es `GET · PATCH /api/tasaciones/[id]/datos`, que persiste en
 * `TX_DatosTasacion` y sus tablas hijas. Esto es un **caché de escritura del
 * lado del navegador**, no un modo offline: nada de lo que viva sólo acá
 * existe para el resto del sistema.
 *
 * ⚠ Por eso el borrador **no se borra al guardar** desde este módulo. Quien
 * confirma que el PATCH llegó es quien puede descartarlo, con `clearPayload()`.
 * Borrarlo acá al escribir dejaría al tasador sin red justo en el caso que este
 * módulo existe para cubrir: el guardado que falló.
 *
 * ## Aislamiento por solicitud
 *
 * La clave lleva el id. Un tasador con dos tasaciones abiertas en dos pestañas
 * no puede pisar una con la otra — el bug clásico de una clave global.
 *
 * ## v2 · el borrador sabe si llegó al servidor (P7-TAS.A.2)
 *
 * El envoltorio v1 sólo registraba **cuándo se guardó local**. Con eso no se
 * puede responder la pregunta que la pantalla necesita hacer —«¿esto que tengo
 * acá ya está en Airtable?»— y por lo tanto tampoco se puede ofrecer una
 * recuperación honesta ni decidir cuándo descartar el borrador. v2 agrega
 * `sincronizadoTs`: la marca del último `PATCH /datos` confirmado, que escribe
 * `marcarSincronizado()` y lee `hayCambiosSinSincronizar()`.
 *
 * ⚠ **La subida de versión NO invalida los borradores v1.** La rama original
 * `if (version !== VERSION) removeItem()` está pensada para un cambio de forma
 * de `InformeData`, donde rehidratar es peor que descartar. Acá la forma de
 * `datos` **no cambió**: sólo se agregó un campo al sobre. Descartar por eso
 * borraría las ocho secciones medidas en terreno de todo tasador con una visita
 * a medio cargar en el teléfono — exactamente el desastre que este módulo
 * existe para evitar. `migrarEnvoltorio()` migra: conserva `datos` y asume
 * `sincronizadoTs: null`, que es la lectura conservadora («nunca sincronizó»).
 *
 * La migración ocurre **al leer** y no se reescribe sola; el siguiente
 * `writePayload()` deja el sobre en v2. Un borrador que sólo se lee y nunca se
 * escribe se queda en v1 en disco, y se sigue migrando en cada lectura. Es
 * barato y evita escribir en un `getItem`.
 */

import { normalizarFotosBorrador, type InformeData } from "@/lib/tasador/tasaciones"

const PREFIJO = "vp.tasador.informe."

/**
 * Versión del formato del **sobre**. Subirla no descarta nada por sí sola: qué
 * hacer con una versión vieja lo decide `migrarEnvoltorio()`, caso por caso.
 * Una versión **desconocida** —mayor que ésta, de un despliegue más nuevo en
 * otra pestaña— sí se descarta: no se puede migrar hacia atrás algo cuya forma
 * este código no conoce.
 */
export const VERSION_BORRADOR = 2

/** Lo que se sabe del borrador sin leer el formulario entero. */
export interface MetaBorrador {
  version: number
  /** ISO del último `writePayload()`. */
  guardadoTs: string
  /** ISO del último `PATCH /datos` confirmado. `null` si nunca sincronizó. */
  sincronizadoTs: string | null
}

interface Envoltorio extends MetaBorrador {
  datos: InformeData
}

function clave(id: string): string {
  return `${PREFIJO}${id}`
}

/** `localStorage` no existe en el servidor, y puede estar bloqueado por el navegador. */
function almacen(): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    // Modo privado de Safari, cookies de terceros bloqueadas, etc.
    return null
  }
}

/** Sobre v1: el de P5-TAS, sin `sincronizadoTs`. */
const VERSION_V1 = 1

/**
 * Convierte lo que hay en disco en un envoltorio v2 utilizable.
 *
 * **Función pura** —recibe la cadena cruda y no toca `localStorage`— porque es
 * donde viven todas las decisiones de este módulo y es lo único que se puede
 * probar sin un navegador (no hay `jsdom` en el proyecto, y no se agrega).
 *
 * Devuelve `null` cuando no hay nada, cuando el JSON está corrupto, cuando
 * falta `datos` o cuando la versión es desconocida. Es tolerante a basura por
 * la misma razón que `normalizarFotosBorrador`: un borrador manipulado a mano
 * no debe poder tumbar la pantalla.
 */
export function migrarEnvoltorio(crudo: string | null): Envoltorio | null {
  if (!crudo) return null

  let plano: unknown
  try {
    plano = JSON.parse(crudo)
  } catch {
    return null
  }

  if (!plano || typeof plano !== "object") return null

  const sobre = plano as Partial<Envoltorio>
  if (!sobre.datos || typeof sobre.datos !== "object") return null

  /*
   * Un sobre sin `guardadoTs` legible se fecha en el epoch en vez de en «ahora»:
   * fecharlo ahora lo haría parecer recién guardado y podría ganarle a una
   * sincronización real posterior en la comparación de abajo.
   */
  const guardadoTs =
    typeof sobre.guardadoTs === "string" ? sobre.guardadoTs : new Date(0).toISOString()

  const datos = normalizarFotosBorrador(sobre.datos as InformeData)

  // v1 → v2: se conserva todo y se asume que nunca llegó al servidor.
  if (sobre.version === VERSION_V1) {
    return { version: VERSION_BORRADOR, guardadoTs, sincronizadoTs: null, datos }
  }

  if (sobre.version !== VERSION_BORRADOR) return null

  return {
    version: VERSION_BORRADOR,
    guardadoTs,
    sincronizadoTs: typeof sobre.sincronizadoTs === "string" ? sobre.sincronizadoTs : null,
    datos,
  }
}

/**
 * ¿El borrador local tiene algo que el servidor todavía no vio?
 *
 * **Función pura.** La comparación es lexicográfica sobre dos ISO-8601 UTC
 * producidos ambos por `new Date().toISOString()`, donde el orden de cadena y
 * el cronológico coinciden. No se construyen `Date` para no pagar dos parseos
 * en cada render.
 *
 * Sin `sincronizadoTs` la respuesta es `true`: un borrador que nunca se
 * sincronizó tiene, por definición, todo pendiente.
 */
export function hayCambiosSinSincronizar(meta: MetaBorrador | null): boolean {
  if (!meta) return false
  if (!meta.sincronizadoTs) return true
  return meta.guardadoTs > meta.sincronizadoTs
}

/**
 * Lee el borrador de una solicitud.
 *
 * Devuelve `null` cuando no hay nada guardado, cuando el formato es
 * irrecuperable o cuando el contenido está corrupto. **El llamador decide el
 * arranque** —desde P7-TAS.A.1, el `informeInicial` hidratado server-side—,
 * porque acá no hay `Tasacion` desde la que construir un formulario en blanco.
 *
 * Las fotos se sanean en `migrarEnvoltorio` vía `normalizarFotosBorrador`:
 * cambiaron de forma en P5-TAS (`number[]` → `FotoAdjunta[]`) y los valores
 * viejos no valían nada. Ver el docblock de esa función.
 */
export function readPayload(id: string): InformeData | null {
  const ls = almacen()
  if (!ls || !id) return null

  const crudo = ls.getItem(clave(id))
  if (!crudo) return null

  const envoltorio = migrarEnvoltorio(crudo)
  if (!envoltorio) {
    // Un borrador ilegible es peor que ninguno: se descarta en vez de
    // propagar el fallo a la pantalla.
    console.warn("[tasador-store] borrador ilegible o de versión desconocida, se descarta", id)
    ls.removeItem(clave(id))
    return null
  }

  return envoltorio.datos
}

/**
 * Guarda el borrador.
 *
 * Nunca lanza: se llama desde el autoguardado de 30 s, y un fallo de cuota no
 * puede tumbar el formulario que el tasador está llenando.
 *
 * **Conserva `sincronizadoTs`.** Escribir local no deshace una sincronización
 * previa; sólo hace que `guardadoTs` la adelante, que es justo lo que
 * `hayCambiosSinSincronizar()` necesita ver para reportar trabajo pendiente.
 */
export function writePayload(id: string, datos: InformeData): void {
  const ls = almacen()
  if (!ls || !id) return

  const previo = migrarEnvoltorio(ls.getItem(clave(id)))

  const envoltorio: Envoltorio = {
    version: VERSION_BORRADOR,
    guardadoTs: new Date().toISOString(),
    sincronizadoTs: previo?.sincronizadoTs ?? null,
    datos,
  }

  try {
    ls.setItem(clave(id), JSON.stringify(envoltorio))
  } catch (err) {
    // QuotaExceededError con muchas fotos en base64, típicamente.
    console.warn("[tasador-store] no se pudo guardar el borrador", id, err)
  }
}

/**
 * Marca que el borrador actual llegó al servidor.
 *
 * Lo llama `useGuardado` **después** de que `PATCH /datos` respondió 200, nunca
 * antes: la marca dice «esto está en Airtable» y adelantarla convertiría un
 * guardado fallido en un borrador que se cree a salvo.
 *
 * No toca `datos`. Si no hay borrador en disco no hace nada — no hay nada que
 * marcar, y fabricar un sobre vacío acá crearía un borrador sin formulario.
 */
export function marcarSincronizado(id: string, ts = new Date().toISOString()): void {
  const ls = almacen()
  if (!ls || !id) return

  const previo = migrarEnvoltorio(ls.getItem(clave(id)))
  if (!previo) return

  try {
    ls.setItem(clave(id), JSON.stringify({ ...previo, sincronizadoTs: ts }))
  } catch (err) {
    console.warn("[tasador-store] no se pudo marcar el borrador como sincronizado", id, err)
  }
}

/**
 * Descarta el borrador. Lo llama quien confirmó que el PATCH a `/datos` llegó.
 * Ver la nota del encabezado sobre por qué `writePayload` no lo hace solo.
 *
 * ⚠ **Sigue sin consumidor a propósito.** Quién y cuándo lo llama depende de
 * qué se hace con los campos que el servidor acepta y no persiste (**CI-023**);
 * esa decisión es de P7-TAS.A.3 y no se anticipa acá.
 */
export function clearPayload(id: string): void {
  const ls = almacen()
  if (!ls || !id) return
  ls.removeItem(clave(id))
}

/**
 * Metadatos del borrador, sin traerse el formulario entero.
 *
 * Reemplaza a `ultimoGuardado()` de v1, que devolvía sólo `guardadoTs` y no
 * tenía consumidores. La pantalla necesita las dos marcas juntas para decidir
 * qué decir —«guardado hace X» y «pendiente de enviar»—, y pedirlas por
 * separado obligaría a parsear el sobre dos veces.
 */
export function leerMeta(id: string): MetaBorrador | null {
  const ls = almacen()
  if (!ls || !id) return null

  const envoltorio = migrarEnvoltorio(ls.getItem(clave(id)))
  if (!envoltorio) return null

  const { version, guardadoTs, sincronizadoTs } = envoltorio
  return { version, guardadoTs, sincronizadoTs }
}
