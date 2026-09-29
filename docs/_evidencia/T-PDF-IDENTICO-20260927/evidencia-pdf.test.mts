/**
 * Evidencia binaria del PDF v2 — T-PDF-IDENTICO-20260927 · Bloque 2.
 *
 * El binario de la corrida real quedó en Dropbox (E3 descargó el render y
 * Carbone lo borra tras la primera descarga: GET /render/{renderId} → 404).
 * Para la evidencia local se re-renderiza el MISMO contexto (mismo código de
 * ensamblado, misma plantilla `CARBONE_TEMPLATE_ID`) y se guarda como
 * `PDF_generado_VP0067_v2.pdf`. El contexto usado queda en
 * `contexto-corrida-v2.json` (sin tokens).
 *
 * Uso: set -a; source .env.local; set +a
 *      pnpm vitest run docs/_evidencia/T-PDF-IDENTICO-20260927/evidencia-pdf.test.mts
 */
import { writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'

import { construirInformeContexto } from '@/lib/informe/ensamblador'

const ID = 'recmMzeu3eWGxyXsf'
const EVIDENCIA = 'docs/_evidencia/T-PDF-IDENTICO-20260927'

it.skipIf(!process.env.AIRTABLE_TOKEN || !process.env.CARBONE_TEMPLATE_ID)(
  're-render de evidencia con el contexto real',
  async () => {
    const rec = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/tblaHTyMHYfmy7Fg6/${ID}`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
    ).then((r) => r.json() as Promise<{ fields: Record<string, unknown> }>)
    const contexto = await construirInformeContexto(ID, rec.fields)
    writeFileSync(`${EVIDENCIA}/contexto-corrida-v2.json`, JSON.stringify(contexto, null, 1))

    const carbone = {
      Authorization: `Bearer ${process.env.CARBONE_API_TOKEN_PROD}`,
      'carbone-version': '4',
    }
    const render = await fetch(
      `${process.env.CARBONE_API_URL}/render/${process.env.CARBONE_TEMPLATE_ID}`,
      {
        method: 'POST',
        headers: { ...carbone, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: contexto, convertTo: 'pdf', lang: 'es-cl' }),
      }
    ).then((r) => r.json() as Promise<{ success: boolean; data?: { renderId: string } }>)
    expect(render.success, 'render Carbone falló').toBe(true)

    const pdf = await fetch(`${process.env.CARBONE_API_URL}/render/${render.data!.renderId}`, {
      headers: carbone,
    })
    expect(pdf.status).toBe(200)
    const buf = Buffer.from(await pdf.arrayBuffer())
    expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
    writeFileSync(`${EVIDENCIA}/PDF_generado_VP0067_v2.pdf`, buf)
    // eslint-disable-next-line no-console
    console.log('PDF v2 evidencia:', buf.length, 'bytes')
  },
  180_000
)
