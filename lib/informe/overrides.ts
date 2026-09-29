/**
 * Overrides locales del contexto — módulo **server-only** (usa `fs`).
 *
 * Tanda T-PDF-IDENTICO-20260927 · plan §5-B1c. Los datos del gold master que
 * hoy **no tienen columna en Airtable** (Hoja 3 cualitativa P1-1/P1-2, textos
 * fijos, UF/m²T de los comparables si faltara, etc.) se alimentan al render
 * desde `docs/_artefactos/carbone/overrides_met6283.json`, con esta forma:
 *
 * ```json
 * { "codigo": "VP-2026-0067", "contexto": { "cualitativa": { … } } }
 * ```
 *
 * El merge se aplica al FINAL del ensamblado y sólo si `codigo` coincide con
 * `meta.codigo` de la solicitud — cualquier otra solicitud queda intacta.
 * Sin archivo o con JSON ilegible el ensamblado sigue sin overrides (se
 * loggea, no se rompe). ⚠ Es el mecanismo puente de la tanda: cada clave del
 * JSON marca una columna pendiente para el flujo vivo (ver cierre).
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { InformeContexto } from './tipos'

const RUTA_OVERRIDES = 'docs/_artefactos/carbone/overrides_met6283.json'

function esObjetoPlano(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Deep-merge de `override` sobre `base`:
 * - objeto ∧ objeto → merge recursivo por clave;
 * - array ∧ array → reemplazo **por índice** (los índices que el override no
 *   trae conservan la fila base; los extra se agregan);
 * - cualquier otro par → gana el override (incluido `null` explícito, que
 *   permite vaciar una ranura). `undefined` en el override no pisa nada.
 */
export function fusionar(base: unknown, override: unknown): unknown {
  if (override === undefined) return base
  if (Array.isArray(base) && Array.isArray(override)) {
    const resultado = [...base]
    override.forEach((v, i) => {
      resultado[i] = fusionar(resultado[i], v)
    })
    return resultado
  }
  if (esObjetoPlano(base) && esObjetoPlano(override)) {
    const resultado: Record<string, unknown> = { ...base }
    for (const [k, v] of Object.entries(override)) {
      resultado[k] = fusionar(resultado[k], v)
    }
    return resultado
  }
  return override
}

/**
 * Aplica los overrides locales si el archivo existe y su `codigo` coincide.
 * Nunca lanza: el informe sin overrides es preferible a un 500.
 */
export function aplicarOverridesLocales(contexto: InformeContexto): InformeContexto {
  let crudo: string
  try {
    crudo = readFileSync(join(process.cwd(), RUTA_OVERRIDES), 'utf8')
  } catch {
    return contexto // sin archivo — el caso normal fuera del espejo
  }
  try {
    const json = JSON.parse(crudo) as { codigo?: string; contexto?: unknown }
    if (json.codigo !== contexto.meta.codigo || !esObjetoPlano(json.contexto)) {
      return contexto
    }
    return fusionar(contexto, json.contexto) as InformeContexto
  } catch (err) {
    console.error('[overrides] JSON ilegible — se ensambla sin overrides', err)
    return contexto
  }
}
