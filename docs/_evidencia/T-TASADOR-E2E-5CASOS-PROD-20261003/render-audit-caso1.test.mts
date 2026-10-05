/**
 * Render real (E2→Carbone v5→E3→Dropbox+Airtable) + AUDITOR CIEGO del Caso 1.
 * T-TASADOR-E2E-5CASOS-PROD-20261003 · Fase 2.
 *
 * 1) Ensambla el InformeContexto in-process (= lo que verían V4/V5 y lo que
 *    recibe Carbone) y lo audita dato-por-dato vs el oráculo (caso1-oraculo.json).
 * 2) Dispara E2 con el MISMO payload que POST /generar-pdf.
 * 3) Espera pdf_final_url + fila nueva en TX_DocumentosGenerados y baja el PDF.
 *
 * Uso: set -a; source .env.local; set +a; pnpm vitest run <este archivo>
 * NUNCA imprime secretos.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { construirInformeContexto } from '@/lib/informe/ensamblador'
import { postToMake } from '@/lib/make-client'

/* --- carga robusta de .env.local (evita el `source` que rompe en líneas con
   valores no-shell) + retry global de fetch (la red del sandbox es intermitente
   y lib/airtable-client no reintenta). No toca código productivo. --- */
const envTxt = readFileSync('.env.local', 'utf8')
for (const line of envTxt.split('\n')) {
  const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const _fetch = globalThis.fetch
globalThis.fetch = (async (url: any, opts: any) => {
  let last: any
  for (let a = 1; a <= 6; a++) {
    try { return await _fetch(url, opts) }
    catch (e) { last = e; await new Promise((r) => setTimeout(r, 800 * a)) }
  }
  throw last
}) as typeof fetch

const EV = 'docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003'
const O = JSON.parse(readFileSync(`${EV}/caso1-oraculo.json`, 'utf8'))
const R = JSON.parse(readFileSync(`${EV}/seed-result.json`, 'utf8'))
const ID = R.id
const CODIGO = R.codigo
const TBL_SOL = 'tblaHTyMHYfmy7Fg6'
const TBL_DOC = 'tbl5sYnGPZXgYCBSY'

async function at(path: string): Promise<any> {
  const r = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  })
  return r.json()
}
const near = (a: any, b: number, tol = 1) => Math.abs(Number(a) - b) <= tol
const audit: any = { codigo: CODIGO, checks: [], render: {} }
function check(nombre: string, got: any, esperado: any, ok: boolean) {
  audit.checks.push({ nombre, got, esperado, ok })
}

it('CASO 1 · ensamblado + auditoría dato-por-dato vs oráculo', async () => {
  const rec = await at(`${TBL_SOL}/${ID}`)
  const ctx = await construirInformeContexto(ID, rec.fields)
  writeFileSync(`${EV}/caso1-contexto.json`, JSON.stringify(ctx, (k, v) =>
    (typeof v === 'string' && v.startsWith('data:image')) ? `«dataURI ${v.length}»` : v, 2))

  const t = ctx.terminales, c = ctx.comparablesInforme
  check('meta.codigo', ctx.meta.codigo, CODIGO, ctx.meta.codigo === CODIGO)
  check('cliente', ctx.clienteInforme.nombre, 'MetLife', ctx.clienteInforme.nombre === 'MetLife')
  check('propietario', ctx.partes.propietario, O.solicitud.cliente_final_nombre, ctx.partes.propietario === O.solicitud.cliente_final_nombre)
  check('rut', ctx.partes.rut, O.solicitud.cliente_final_rut, ctx.partes.rut === O.solicitud.cliente_final_rut)
  check('comuna', ctx.propiedad.comuna, 'San Miguel', ctx.propiedad.comuna === 'San Miguel')
  check('tipoPropiedad', ctx.propiedad.tipoPropiedad, 'Departamento', ctx.propiedad.tipoPropiedad === 'Departamento')
  check('supConstruccion', ctx.propiedad.supConstruccionM2, 102, near(ctx.propiedad.supConstruccionM2, 102, 0.1))
  check('anioConstruccion', ctx.propiedad.anioConstruccion, 1998, ctx.propiedad.anioConstruccion === 1998)
  check('vidaUtil', ctx.propiedad.vidaUtil, 55, ctx.propiedad.vidaUtil === 55)
  check('valorComercialUf', t.valorComercialUf, 3323.2, near(t.valorComercialUf, 3323.2, 0.5))
  check('valorComercialClp', t.valorComercialClp, 132402004, near(t.valorComercialClp, 132402004, 2000))
  check('valorReposicionUf', t.valorReposicionUf, 3364, near(t.valorReposicionUf, 3364, 1))
  check('seguroIncendioUf', t.seguroIncendioUf, 2658.56, near(t.seguroIncendioUf, 2658.56, 1))
  check('avaluoFiscalUf', t.avaluoFiscalUf, 2898.01, near(t.avaluoFiscalUf, 2898.01, 1))
  check('valorRemateUf', t.valorRemateUf, 2160.08, near(t.valorRemateUf, 2160.08, 1))
  check('valorLiquidacionUf', t.valorLiquidacionUf, 2741.64, near(t.valorLiquidacionUf, 2741.64, 1))
  check('ufDia', t.ufDia, 39841.72, near(t.ufDia, 39841.72, 1))
  check('usdDia', t.usdDia, 922.17, near(t.usdDia, 922.17, 0.5))
  check('cuadro.totalUf', ctx.cuadro.totalUf, 3323.2, near(ctx.cuadro.totalUf, 3323.2, 1))
  check('ofertas.promedioUfM2', c.ofertas.promedio.ufM2Construccion, 45.3, near(c.ofertas.promedio.ufM2Construccion, 45.3, 0.5))
  check('cbr.promedioUfM2', c.cbr.promedio.ufM2Construccion, 38.25, near(c.cbr.promedio.ufM2Construccion, 38.25, 0.5))
  check('ajusteOfertas%', c.ofertas.tasacionVsPct, -30, near(c.ofertas.tasacionVsPct, -30.25, 1))
  check('ajusteCBR%', c.cbr.tasacionVsPct, -17, near(c.cbr.tasacionVsPct, -17.39, 1))
  check('rentaPerpetua', ctx.rentabilidad.rentaPerpetuaClp, 173555556, near(ctx.rentabilidad.rentaPerpetuaClp, 173555556, 2000))
  check('ingresoLiquidoAnual', ctx.rentabilidad.ingresoLiquidoAnualClp, 7810000, near(ctx.rentabilidad.ingresoLiquidoAnualClp, 7810000, 100))
  check('comparables#', ctx.comparablesInforme.filas.length, 6, ctx.comparablesInforme.filas.length === 6)
  check('fotos grilla#', ctx.fotos.total, 16, ctx.fotos.total >= 14)
  check('ranura fachada', ctx.imagenes.fachada ? 'set' : 'null', 'set', !!ctx.imagenes.fachada)
  check('ranura ref1', ctx.imagenes.ref1 ? 'set' : 'null', 'set', !!ctx.imagenes.ref1)
  check('ranura mapaUbicacion', ctx.imagenes.mapaUbicacion ? 'set' : 'null', 'set', !!ctx.imagenes.mapaUbicacion)

  const pass = audit.checks.filter((x: any) => x.ok).length
  audit.resumen = `${pass}/${audit.checks.length}`
  // eslint-disable-next-line no-console
  console.log('AUDIT', audit.resumen)
  for (const x of audit.checks) if (!x.ok) console.log('  FAIL', x.nombre, 'got', x.got, 'esp', x.esperado)
  writeFileSync(`${EV}/caso1-audit.json`, JSON.stringify(audit, null, 2))
  expect(ctx.meta.codigo).toBe(CODIGO)

  // --- disparo E2 (render real) ---
  if (!process.env.MAKE_WEBHOOK_E2) { console.log('SIN MAKE_WEBHOOK_E2 — skip render'); return }
  const res = await postToMake(process.env.MAKE_WEBHOOK_E2!, { solicitud_id: ID, solicitud_codigo: CODIGO, contexto: ctx },
    { escenario: 'E2_Carbone_Render', solicitudId: CODIGO, timeoutMs: 30000 })
  // eslint-disable-next-line no-console
  console.log('E2 webhook status:', res.status)
  audit.render.e2Status = res.status
  expect(res.ok).toBe(true)

  // --- espera pdf_final_url / DocGen ---
  let pdfUrl: string | null = null
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 10_000))
    const sol = await at(`${TBL_SOL}/${ID}`)
    if (sol.fields.pdf_final_url) { pdfUrl = String(sol.fields.pdf_final_url); break }
    const docs = await at(`${TBL_DOC}?filterByFormula=${encodeURIComponent(`FIND("${CODIGO}",ARRAYJOIN({solicitud}))`)}`)
    if ((docs.records ?? []).length) { console.log(`poll ${i + 1}: DocGen=${docs.records.length}, aún sin pdf_final_url`) }
    else console.log(`poll ${i + 1}/24`)
  }
  audit.render.pdfUrl = pdfUrl ? pdfUrl.slice(0, 80) : null
  const estado = (await at(`${TBL_SOL}/${ID}`)).fields.estado
  audit.render.estadoFinal = estado
  writeFileSync(`${EV}/caso1-audit.json`, JSON.stringify(audit, null, 2))
  // eslint-disable-next-line no-console
  console.log('RENDER pdf_final_url:', pdfUrl ? 'SET' : 'null', '· estado:', estado)
  expect(pdfUrl, 'E3 no escribió pdf_final_url').toBeTruthy()
}, 300_000)
