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

/** Un ítem del cuadro de valoración reducido a lo que la fila TASACIÓN necesita. */
export interface ItemParaFilaTasacion {
  /** `tipo_item` («Edificacion», «Terreno», «OO.CC.»…). */
  tipo: string
  supM2: number | null
  /** UF del ítem (sup × UF/m² × factor). */
  ufTotal: number | null
}

/**
 * UF/m² de construcción de la fila TASACIÓN, como la planilla (`Portada!AX35`):
 * UF de los ítems de edificación ÷ su superficie (= UF/m² nuevo × factor de
 * depreciación). Sin ítems de edificación cae al puente valor total ÷ sup.
 * construida (`filaTasacionUfM2`). Única regla para el PDF (ensamblador) y la
 * vista previa: hasta el 19-oct-2026 la vista previa usaba sólo el puente e
 * imprimía 80,53 donde el PDF y el original dicen 32,64 (MET-6283).
 */
export function ufM2ConstruccionTasacion(
  items: readonly ItemParaFilaTasacion[],
  valorUf: number | null,
  supConstruccionM2: number | null,
): number | null {
  const edificacion = items.filter((i) => i.tipo.trim().toLowerCase() === 'edificacion')
  const sup = edificacion.reduce((s, i) => s + (i.supM2 ?? 0), 0)
  if (edificacion.length > 0 && sup > 0) {
    return edificacion.reduce((s, i) => s + (i.ufTotal ?? 0), 0) / sup
  }
  return filaTasacionUfM2(valorUf, supConstruccionM2)
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

/**
 * «PROMEDIO DE LA MUESTRA» de una columna del cuadro de comparables —
 * aritmética exacta del XLSM (`Portada!AX34`):
 * `SUM(rango) / COUNTIF(rango, ">0")`, es decir el promedio de los valores
 * **mayores que cero** de la columna, por bloque (ofertas y CBR por
 * separado). Los `0` del Excel son «sin dato» y no diluyen el promedio; acá
 * además `null` es ausente. Sin valores positivos → `null`, nunca un 0
 * inventado (CI-057).
 */
export function promedioSinCeros(
  valores: ReadonlyArray<number | null>,
): number | null {
  const positivos = valores.filter((v): v is number => typeof v === 'number' && v > 0)
  if (positivos.length === 0) return null
  return positivos.reduce((a, b) => a + b, 0) / positivos.length
}
