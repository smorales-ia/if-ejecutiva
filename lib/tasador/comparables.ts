/**
 * Aritmética de la sección D · comparables de mercado (RF-12).
 *
 * ## Espeja el cuadro `[Excel: Portada!B28:AX44]` cuadro-a-cuadro (P13-TAS)
 *
 * El tasador **fotografía** el cuadro de la plantilla operativa —ejemplo
 * canónico en `docs/_referencias/ejemplo-comparables-cuadro.JPG`— y esta capa
 * reproduce sus renglones de resumen sin inventar números. El cuadro trae dos
 * bloques (REF. OFERTAS · REF. C.B.R.), cada uno con tres renglones:
 * `PROMEDIO DE LA MUESTRA`, `TASACION` y `TASACION V/S PROMEDIO DE LA MUESTRA`.
 *
 * ## Todo es promedio simple, sin homogeneización
 *
 * `PROMEDIO DE LA MUESTRA` es el promedio **simple columna-a-columna** de las
 * filas del bloque. No hay factores de homogeneización en este flujo: el cuadro
 * fotografiado —única entrada de comparables desde A-13— no los trae (**A-44**)
 * y P13-TAS los sacó del modelo de IF-03 (**R-COMP-1**). Los UF/m² que se
 * promedian son los **valores crudos** de las columnas `UF/m² T.` y `UF/m² C.`
 * del cuadro, que ya vienen calculados de la fuente con la fórmula directa
 * `(total UF − UF/m² terreno × sup. terreno − OO.CC.) / sup. construida`
 * `[Excel: Portada!AX29]`. Unitarizar aquí como `precio / sup` daría un número
 * distinto al que muestra el cuadro.
 *
 * `TASACION` son los valores del **inmueble sujeto**, que produce el motor
 * AT03; esta capa **no los calcula**. `TASACION V/S PROMEDIO` es su cociente
 * contra el promedio del bloque, y sólo se puede formar cuando la tasación del
 * sujeto está disponible.
 */

import type { Comparable } from '@/lib/tasador/tasaciones'

/**
 * Lee un campo numérico crudo (todo llega como `string`, D-5). Devuelve `null`
 * ante vacío o no-numérico —la señal de «falta el dato», distinta de un `0`
 * legítimo—.
 */
export function numeroDe(valor: string): number | null {
  const limpio = valor.trim()
  if (limpio === '') return null

  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

/**
 * UF/m² de construcción de un comparable, **tal como vino del cuadro**
 * (`uf_m2_construccion_f`). Es el valor que el tasador contrasta contra su foto;
 * no se recalcula desde `precio / sup` (ver docblock del módulo). `null` si la
 * celda vino vacía o ilegible.
 */
export function ufM2Construccion(c: Comparable): number | null {
  return numeroDe(c.ufM2ConstruccionF)
}

/** UF/m² de terreno crudo del comparable (`uf_m2_terreno_f`). */
export function ufM2Terreno(c: Comparable): number | null {
  return numeroDe(c.ufM2TerrenoF)
}

/**
 * Las seis columnas numéricas que el renglón `PROMEDIO DE LA MUESTRA` promedia,
 * en el orden del cuadro. Cada selector devuelve el valor crudo de la columna.
 */
const COLUMNAS_PROMEDIO = {
  totalUf: (c: Comparable) => numeroDe(c.totalUf),
  supTerreno: (c: Comparable) => numeroDe(c.supTerreno),
  supConstruida: (c: Comparable) => numeroDe(c.supConstruida),
  ooCcUf: (c: Comparable) => numeroDe(c.ooCcUf),
  ufM2Terreno,
  ufM2Construccion,
} as const

export type PromedioMuestra = Record<keyof typeof COLUMNAS_PROMEDIO, number | null>

/** Promedio simple de una columna; los valores ausentes quedan fuera. `null` si ninguno es calculable. */
function promedioSimple(comparables: Comparable[], selector: (c: Comparable) => number | null): number | null {
  const valores = comparables
    .map(selector)
    .filter((v): v is number => v !== null)

  if (valores.length === 0) return null

  return valores.reduce((a, b) => a + b, 0) / valores.length
}

/**
 * `PROMEDIO DE LA MUESTRA` de un bloque: promedio simple de cada columna sobre
 * las filas del bloque. Las filas que el cuadro trajo incompletas siguen
 * listadas pero no arrastran su columna vacía al promedio.
 */
export function promedioMuestra(comparables: Comparable[]): PromedioMuestra {
  const salida = {} as PromedioMuestra
  for (const clave of Object.keys(COLUMNAS_PROMEDIO) as (keyof typeof COLUMNAS_PROMEDIO)[]) {
    salida[clave] = promedioSimple(comparables, COLUMNAS_PROMEDIO[clave])
  }
  return salida
}

/**
 * `TASACION V/S PROMEDIO DE LA MUESTRA`: `(tasacion − promedio) / promedio`, en
 * fracción (la UI lo pinta como porcentaje). `null` si falta cualquiera de los
 * dos o el promedio es `0` —sin base contra la que comparar—.
 */
export function tasacionVsPromedio(tasacion: number | null, promedio: number | null): number | null {
  if (tasacion === null || promedio === null || promedio === 0) return null
  return (tasacion - promedio) / promedio
}
