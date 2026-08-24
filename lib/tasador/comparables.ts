/**
 * Aritmética de la sección D · comparables de mercado (RF-12).
 *
 * ## Sucesor del módulo de factores, purgado en CI-056 (cierra OV-6 · CI-031)
 *
 * El módulo al que reemplaza existía para dos cosas —fabricar un comparable en
 * blanco y homogeneizar por tres factores— y **A-13 se llevó las dos**: con la
 * sección D de sólo lectura no hay alta que fabricar, y con el cuadro
 * fotografiado sin columnas de factor no hay nada que homogeneizar en este
 * flujo (**A-44**). La ficha **CI-056** tiene el detalle y el nombre del
 * archivo retirado.
 *
 * El nombre importa, y era el defecto de fondo: aquél prometía defaults que
 * nunca tuvo —**OV-6**, y RF-TAS-08 los prohíbe— y factores que A-18 disolvió.
 * Este archivo dice lo que hace: aritmética de comparables. Cero valores por
 * defecto, cero lectura de configuración, cero red.
 *
 * ## Por qué el promedio es simple y no homogeneizado
 *
 * La plantilla operativa vigente calcula el unitario de cada comparable **sin
 * multiplicar por coeficientes** `[Excel: Portada!AX29]`, y el cuadro que el
 * tasador fotografía no trae los tres factores que D-21 ratificó (**A-44**).
 * Homogeneizar acá inventaría un número que el cuadro de origen no contiene.
 *
 * ⚠ **Divergencia conocida · CI-057.** `app/api/tasaciones/[id]/informe/route.ts`
 * sí homogeneiza: multiplica por `factor_sup × factor_edad × factor_distancia`
 * leídos de Airtable, tratando el factor ausente como `1`. Los dos promedios
 * pueden diferir para la misma solicitud. Está registrado como deuda técnica y
 * **no se resuelve desde acá**: alinearlos es una decisión de producto sobre
 * qué hacer con los factores ya almacenados en filas históricas.
 */

import type { Comparable } from '@/lib/tasador/tasaciones'

/**
 * Lee un campo numérico del comparable.
 *
 * Todo llega como `string`: la hidratación de `lectura-datos.ts` normaliza a
 * texto lo que Airtable devuelve como `number | null` (**D-5**), de modo que
 * este módulo ve un solo tipo. Devuelve `null` ante vacío o no-numérico —la
 * señal de «falta el dato», distinta de un `0` legítimo—.
 */
function numero(valor: string): number | null {
  const limpio = valor.trim()
  if (limpio === '') return null

  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

/**
 * UF/m² construido de un comparable: `precio_uf / sup_construccion_m2`.
 *
 * Devuelve `null` si falta cualquiera de los dos, y también si la superficie es
 * `0`: dividir por cero daría `Infinity`, que se propagaría al promedio y lo
 * volvería `Infinity` entero. Un comparable sin superficie no es un comparable
 * de valor infinito; es un comparable que no se puede unitarizar.
 */
export function ufM2(c: Comparable): number | null {
  const precio = numero(c.totalUf)
  const sup = numero(c.supConstruida)

  if (precio === null || sup === null || sup === 0) return null

  return precio / sup
}

/**
 * Promedio simple de los UF/m² que se pueden calcular.
 *
 * Los comparables sin precio o sin superficie **quedan fuera del promedio pero
 * siguen listados** en la grilla: son filas que el cuadro trajo incompletas, y
 * ocultarlas escondería justamente la evidencia de que la foto salió mal. Con
 * ninguno calculable devuelve `null`, que la grilla pinta como «—».
 */
export function promedioUfM2(comparables: Comparable[]): number | null {
  const valores = comparables
    .map(ufM2)
    .filter((v): v is number => v !== null)

  if (valores.length === 0) return null

  return valores.reduce((a, b) => a + b, 0) / valores.length
}
