/**
 * Genera el `InformeContexto` real de VP-2026-0079 (rec6XubOR92X6gnOH) con el
 * ensamblador del repo y lo guarda en `contexto-0079.json`, para el render
 * directo de la plantilla v8 contra Carbone. Sólo LEE Airtable.
 *
 * Apagado por defecto (lee red y escribe un archivo): una corrida normal de
 * `vitest run` lo salta. Para generarlo:
 *   GENERAR_CONTEXTO_0079=1 ./node_modules/.bin/vitest run docs/_evidencia/T-INFORME-IDENTICO-XLSM-20261024
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { construirInformeContexto } from '@/lib/informe/ensamblador'

const EV = 'docs/_evidencia/T-INFORME-IDENTICO-XLSM-20261024'
const ID = 'rec6XubOR92X6gnOH'

it.skipIf(!process.env.GENERAR_CONTEXTO_0079)('VP-2026-0079 · contexto real del informe', async () => {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
  const rec = await (
    await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/tblaHTyMHYfmy7Fg6/${ID}`, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
    })
  ).json()
  const ctx = await construirInformeContexto(ID, rec.fields)
  expect(ctx.meta.codigo).toBe('VP-2026-0079')
  writeFileSync(`${EV}/contexto-0079.json`, JSON.stringify(ctx))
  // Sólo el cuadro, legible, para revisar sin abrir el contexto completo (3+ MB).
  writeFileSync(`${EV}/cuadro-0079.json`, JSON.stringify(ctx.cuadro, null, 2))
}, 180_000)
