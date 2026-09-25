/**
 * Fila TASACIÓN del cuadro de comparables (F-2 · P1-8) — aritmética única.
 *
 * RO-05: una sola fuente por número. Estas dos funciones son la ÚNICA
 * aritmética de la fila `TASACION` y del renglón `TASACION V/S PROMEDIO DE LA
 * MUESTRA`; las consumen:
 *
 * - `lib/informe/ensamblador.ts` (server): `tasacionUfM2` / `tasacionVsPct`
 *   del `InformeContexto` — puente hasta que el motor AT03 persista
 *   `promedio_uf_m2_muestra` / `desviacion_vs_promedio_pct` (P1-8 · T2).
 * - `components/tasador/informe-preview.tsx` (cliente) vía
 *   `SeccionComparables`: el sujeto de la fila TASACIÓN del preview.
 *
 * Módulo puro y client-safe: sin imports de Airtable ni de módulos server-only.
 *
 * El porcentaje delega en `tasacionVsPromedio` (`lib/tasador/comparables.ts`),
 * que ya es la fuente del cociente `(tasación − promedio) / promedio` en la
 * grilla — acá sólo se escala a puntos porcentuales. La divergencia de
 * promedios simple vs homogeneizado (CI-057 · A-44) NO se toca: contra qué
 * promedio se compara lo decide cada llamador.
 */

import { tasacionVsPromedio } from '@/lib/tasador/comparables'

/**
 * UF/m² del inmueble sujeto: `valorUf / supConstruccionM2`.
 *
 * `null` si falta el valor de tasación o si la superficie construida viene
 * ausente o `0` (división sin sentido) — mismo criterio `null = ausente` del
 * modelo canónico, nunca `0` inventado.
 */
export function filaTasacionUfM2(
  valorUf: number | null,
  supConstruccionM2: number | null,
): number | null {
  if (valorUf === null || !supConstruccionM2) return null
  return valorUf / supConstruccionM2
}

/**
 * `TASACION V/S PROMEDIO DE LA MUESTRA` en puntos porcentuales:
 * `(tasacionUfM2 / promedioUfM2 − 1) × 100`.
 *
 * `null` si falta cualquiera de los dos o el promedio es `0` — sin base contra
 * la que comparar (delegado en `tasacionVsPromedio`).
 */
export function filaTasacionVsPct(
  tasacionUfM2: number | null,
  promedioUfM2: number | null,
): number | null {
  const fraccion = tasacionVsPromedio(tasacionUfM2, promedioUfM2)
  return fraccion === null ? null : fraccion * 100
}
