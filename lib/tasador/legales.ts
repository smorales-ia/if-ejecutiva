/**
 * Formato de los antecedentes legales tal como los imprime la planilla del
 * cliente (`[Excel: Impresion]` de MET-6283): «N°319  09/09/2020» — el número
 * sin el sufijo de año y la fecha, separados por **dos** espacios.
 *
 * Es presentación pura: lo guardado en `TX_DocumentosLegales` no cambia (el
 * número tal como lo leyó el documento o lo tipeó el tasador, y la fecha en su
 * propio campo), de modo que formulario, consola y PDF leen el mismo dato y sólo
 * el informe lo compone (T-LEGALES-CONSOLIDADOS-20261015).
 *
 * Client-safe: sin dependencias.
 */

/** `2020-09-09` → `09/09/2020`; cualquier otra cosa → `''`. */
function fechaCorta(fecha: unknown): string {
  if (typeof fecha !== 'string') return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha.trim())
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

/**
 * «N°{número}  {dd/mm/aaaa}» para el permiso de edificación y la recepción final.
 *
 * - Sin número → `''` (el informe no imprime una fecha suelta).
 * - Sólo se compone un número que **empieza con dígito**. Lo demás se imprime
 *   tal cual está guardado: un valor ya compuesto («N°319  09/09/2020»,
 *   «N°19 // 23-01-2014» de filas antiguas) o un texto que no es número
 *   («S/I», «Año 1994», «PE-2020-001»). Componerlo daría «N°N°…» o «N°S/I».
 * - El sufijo «-2020» / «/2020» se quita sólo si es el año de la fecha: es la
 *   numeración municipal «319 del año 2020», que la planilla imprime «N°319».
 *   Si el año no coincide, el número queda entero (no se adivina).
 * - Sin fecha → «N°{número}».
 */
export function componerNumeroYFecha(numero: unknown, fecha: unknown): string {
  const n = numero === null || numero === undefined ? '' : String(numero).trim()
  if (n === '') return ''
  if (!/^\d/.test(n)) return n

  const f = fechaCorta(fecha)
  const anio = f.slice(-4)
  const sufijo = /^(.+?)\s*[-/]\s*(\d{4})$/.exec(n)
  const base = sufijo && sufijo[2] === anio ? sufijo[1] : n

  return f ? `N°${base}  ${f}` : `N°${base}`
}

/* -------------------------------------------------------------------------
 * Sello verde SEC (spec §2.8.3 · RN-58)
 * ---------------------------------------------------------------------- */

/** Dominio de `TX_DocumentosLegales.sello_sec` = `OPCIONES.selloSec`. */
const SELLO_SEC = ['vigente', 'vencido', 'no_aplica'] as const

/** El valor guardado si es del dominio; `''` si no hay o no se reconoce. */
export function selloSecGuardado(valor: unknown): string {
  return typeof valor === 'string' && (SELLO_SEC as readonly string[]).includes(valor) ? valor : ''
}

/**
 * Sugerencia del Sello SEC cuando no hay nada guardado — editable, con badge:
 *
 * - Con fecha de vencimiento leída del sello: `vigente` si vence hoy o después,
 *   `vencido` si ya venció.
 * - Sin sello y la unidad principal es una **casa**: `no_aplica` (RN-58: el sello
 *   verde no aplica a casas, y se registra explícito para que la ausencia sea
 *   una decisión y no un olvido).
 * - Si no: `''`. Un departamento puede ser full eléctrico o no, y eso lo sabe
 *   el tasador en terreno.
 */
export function selloSecPorDefecto({
  subtipoPrincipal,
  vencimiento,
  hoy,
}: {
  subtipoPrincipal: string
  vencimiento: string
  hoy: string
}): string {
  const fecha = /^\d{4}-\d{2}-\d{2}/.exec(vencimiento.trim())?.[0]
  if (fecha) return fecha >= hoy ? 'vigente' : 'vencido'
  const subtipo = subtipoPrincipal.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
  return subtipo === 'casa' ? 'no_aplica' : ''
}
