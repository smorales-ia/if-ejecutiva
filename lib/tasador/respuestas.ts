/**
 * Helpers de respuesta HTTP para los Route Handlers de IF-03.
 *
 * Existen para que las once rutas no repitan el mapeo error → status ni el
 * formato del body, y para que **ningún error técnico llegue al usuario**
 * (§6.5). El detalle crudo va siempre a `console.error`.
 *
 * Forma del body, estable en todas las rutas:
 * - éxito → `{ data: T }`
 * - error → `{ error: string }` con un literal de `MENSAJES`
 *
 * Esa estabilidad es lo que permite a la UI cerrar el ciclo de la Regla D
 * (spinner → resultado) sin conocer la ruta concreta.
 */

import { NextResponse } from 'next/server'
import { AirtableError } from '@/lib/airtable-client'
import { MENSAJES } from './mensajes'
import type { ResultadoGuard } from './auth-guard'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function error(mensaje: string, status: number) {
  return NextResponse.json({ error: mensaje }, { status })
}

/** Traduce un guard fallido a su respuesta. Nunca se llama con `ok: true`. */
export function desdeGuard(resultado: Extract<ResultadoGuard, { ok: false }>) {
  return error(resultado.mensaje, resultado.status)
}

/**
 * Cierra el `catch` de una ruta.
 *
 * `AirtableError` → **502**: el fallo es de un sistema aguas abajo, no del
 * cliente ni nuestro. Cualquier otra cosa → 500. En ambos casos el usuario ve
 * el mismo literal; la distinción existe para los logs y el monitoreo.
 */
export function desdeExcepcion(contexto: string, err: unknown) {
  console.error(`[${contexto}]`, err)
  return error(MENSAJES.errorGenerico, err instanceof AirtableError ? 502 : 500)
}
