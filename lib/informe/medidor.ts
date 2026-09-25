/**
 * Medidor de paridad del informe — funciones **puras**, sin Airtable ni red.
 *
 * Tanda T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 4 (harness Etapa
 * A). Dado un `InformeContexto` ensamblado y la matriz de tags, produce el
 * **score de paridad**: la métrica regresionable que toda tanda futura (T2,
 * T4, T5…) debe subir y nunca bajar.
 *
 * ## Criterio EXACTO del score (para que el número sea reproducible)
 *
 * Sea `total` la suma de E-ids de la matriz (228), `plantilla` los E-ids con
 * estado `PLANTILLA` (texto estático del `.docx`: no son datos y no se miden
 * como datos) y `conValor` los E-ids cuya entrada tiene estado `OK` **y**
 * cuya `ruta` resuelve a un valor presente en el contexto (ver
 * `valorPresente`).
 *
 * - **`score` (score de datos)** `= conValor / (total − plantilla) × 100`,
 *   redondeado a 1 decimal. Mide qué fracción de los elementos que SÍ son
 *   datos llega con valor real. Es el número que se asierta en el harness.
 * - **`scoreTotal228`** `= (conValor + plantilla) / total × 100` — la vista
 *   «cuánto del gold master queda cubierto» contando los PLANTILLA como
 *   cubiertos-por-plantilla. Se reporta, no se asierta.
 *
 * Un E-id `OK` sin valor en el caso concreto (p. ej. VP-2026-0066 no tiene
 * filas en TX_Comparables porque es el sandbox tipeado) **no** suma: el score
 * mide datos presentes, no caminos teóricos. Por eso el baseline medido contra
 * 0066 queda por debajo del 43% «de camino» de la auditoría — la diferencia
 * son exactamente los grupos OK cuyo caso de referencia está vacío.
 *
 * ## `leerRuta` — resolución de rutas del contrato
 *
 * Soporta `a.b.c` y segmentos de array `a[].b`:
 * - `a.b.c` → descenso simple; si una clave intermedia no existe → `undefined`
 *   (ruta rota: la matriz y los tipos divergen — lo caza el test).
 * - `a[].b` → proyecta `b` sobre las filas del array **descartando**
 *   `null`/`undefined`; presente si quedan filas. Con el array vacío devuelve
 *   `[]` (ruta válida, sin valor).
 */

import { MATRIZ_TAGS, type EntradaMatriz, type EstadoMatriz } from './matriz-tags'
import type { InformeContexto } from './tipos'

/** Resuelve `ruta` sobre `objeto`. `undefined` = la ruta no existe. */
export function leerRuta(objeto: unknown, ruta: string): unknown {
  if (!ruta) return undefined
  const segmentos = ruta.split('.')
  let actual: unknown = objeto

  for (let i = 0; i < segmentos.length; i++) {
    const seg = segmentos[i]

    if (seg.endsWith('[]')) {
      const clave = seg.slice(0, -2)
      if (actual === null || actual === undefined || typeof actual !== 'object') {
        return undefined
      }
      const arr = (actual as Record<string, unknown>)[clave]
      if (!Array.isArray(arr)) return undefined
      const resto = segmentos.slice(i + 1).join('.')
      if (!resto) return arr
      return arr
        .map((fila) => leerRuta(fila, resto))
        .filter((v) => v !== null && v !== undefined)
    }

    if (actual === null || actual === undefined || typeof actual !== 'object') {
      return undefined
    }
    actual = (actual as Record<string, unknown>)[seg]
  }

  return actual
}

/**
 * ¿Hay dato? `null`/`undefined`, cadena vacía (o sólo espacios) y array sin
 * filas cuentan como ausencia. El `0` numérico y el `false` **sí** son valor:
 * «0 bodegas» es un dato, no un hueco.
 */
export function valorPresente(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false
  if (typeof valor === 'string') return valor.trim() !== ''
  if (Array.isArray(valor)) return valor.length > 0
  return true
}

/** Una entrada de la matriz que no aporta al score, con su porqué. */
export interface FaltanteParidad {
  eIds: string[]
  ruta: string
  estado: EstadoMatriz
  pId: string | null
}

export interface ResultadoParidad {
  /** Suma de E-ids de la matriz (228). */
  total: number
  /** E-ids con estado OK (camino digital declarado). */
  ok: number
  /** E-ids OK cuya ruta tiene valor presente en el contexto. */
  conValor: number
  /** E-ids cubiertos por texto estático de plantilla (fuera del score de datos). */
  plantilla: number
  /** `conValor / (total − plantilla) × 100`, 1 decimal. El número asertado. */
  score: number
  /** `(conValor + plantilla) / total × 100`, 1 decimal. Sólo reporte. */
  scoreTotal228: number
  /** E-ids por estado de la matriz. */
  porEstado: Record<EstadoMatriz, number>
  /** Entradas que no sumaron: OK-sin-valor, HUECO y METLIFE_ONLY. */
  faltantes: FaltanteParidad[]
}

const redondear1 = (n: number): number => Math.round(n * 10) / 10

/**
 * Mide la paridad de un contexto ensamblado contra la matriz de tags.
 * Pura: mismos argumentos → mismo resultado.
 */
export function medirParidad(
  contexto: InformeContexto,
  matriz: readonly EntradaMatriz[] = MATRIZ_TAGS,
): ResultadoParidad {
  const porEstado: Record<EstadoMatriz, number> = {
    OK: 0,
    HUECO: 0,
    METLIFE_ONLY: 0,
    PLANTILLA: 0,
  }
  const faltantes: FaltanteParidad[] = []
  let total = 0
  let conValor = 0

  for (const entrada of matriz) {
    const n = entrada.eIds.length
    total += n
    porEstado[entrada.estado] += n

    if (entrada.estado === 'PLANTILLA') continue

    const presente =
      entrada.estado === 'OK' && valorPresente(leerRuta(contexto, entrada.ruta))

    if (presente) {
      conValor += n
    } else {
      faltantes.push({
        eIds: entrada.eIds,
        ruta: entrada.ruta,
        estado: entrada.estado,
        pId: entrada.pId,
      })
    }
  }

  const plantilla = porEstado.PLANTILLA
  const base = total - plantilla

  return {
    total,
    ok: porEstado.OK,
    conValor,
    plantilla,
    score: base > 0 ? redondear1((conValor / base) * 100) : 0,
    scoreTotal228: total > 0 ? redondear1(((conValor + plantilla) / total) * 100) : 0,
    porEstado,
    faltantes,
  }
}
