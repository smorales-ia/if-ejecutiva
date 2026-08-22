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
 */

import { normalizarFotosBorrador, type InformeData } from "@/lib/tasaciones"

const PREFIJO = "vp.tasador.informe."

/**
 * Versión del formato del borrador. Si `InformeData` cambia de forma, subirla
 * invalida los borradores viejos en vez de rehidratar una forma que ya no
 * existe y romper la pantalla con un campo ausente.
 */
const VERSION = 1

interface Envoltorio {
  version: number
  guardadoTs: string
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

/**
 * Lee el borrador de una solicitud.
 *
 * Devuelve `null` cuando no hay nada guardado, cuando el formato es de otra
 * versión o cuando el contenido está corrupto. **El llamador decide el
 * arranque** —normalmente `resolverInforme(tasacion)`—, porque acá no hay
 * `Tasacion` desde la que construir un formulario en blanco.
 */
export function readPayload(id: string): InformeData | null {
  const ls = almacen()
  if (!ls || !id) return null

  const crudo = ls.getItem(clave(id))
  if (!crudo) return null

  try {
    const envoltorio = JSON.parse(crudo) as Envoltorio
    if (envoltorio.version !== VERSION) {
      ls.removeItem(clave(id))
      return null
    }
    if (!envoltorio.datos) return null

    /*
     * Las fotos cambiaron de forma en P5-TAS (`number[]` → `FotoAdjunta[]`) y
     * este borrador puede traer la vieja. No se sube `VERSION` porque eso
     * descartaría el formulario entero —las ocho secciones medidas en terreno—
     * para arreglar dos arrays cuyo contenido, además, no vale nada: eran
     * identificadores de un contador en memoria, sin archivo ni fila detrás.
     * Se descartan y la hidratación desde `GET /fotos` repone las reales.
     */
    return normalizarFotosBorrador(envoltorio.datos)
  } catch (err) {
    // Un borrador ilegible es peor que ninguno: se descarta en vez de
    // propagar el fallo a la pantalla.
    console.warn("[tasador-store] borrador ilegible, se descarta", id, err)
    ls.removeItem(clave(id))
    return null
  }
}

/**
 * Guarda el borrador.
 *
 * Nunca lanza: se llama desde el autoguardado por sección, y un fallo de cuota
 * no puede tumbar el formulario que el tasador está llenando.
 */
export function writePayload(id: string, datos: InformeData): void {
  const ls = almacen()
  if (!ls || !id) return

  const envoltorio: Envoltorio = {
    version: VERSION,
    guardadoTs: new Date().toISOString(),
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
 * Descarta el borrador. Lo llama quien confirmó que el PATCH a `/datos` llegó.
 * Ver la nota del encabezado sobre por qué `writePayload` no lo hace solo.
 */
export function clearPayload(id: string): void {
  const ls = almacen()
  if (!ls || !id) return
  ls.removeItem(clave(id))
}

/** Marca de tiempo del último guardado local, para un «guardado hace X». */
export function ultimoGuardado(id: string): string | null {
  const ls = almacen()
  if (!ls || !id) return null

  const crudo = ls.getItem(clave(id))
  if (!crudo) return null

  try {
    return (JSON.parse(crudo) as Envoltorio).guardadoTs ?? null
  } catch {
    return null
  }
}
