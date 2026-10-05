/**
 * AUDITORÍA dato-por-dato del Caso 5 (HEV-3183) + disparo E2 (no bloqueante).
 * T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005. Patrón de render-audit-caso2.test.mts.
 *
 * 1) Ensambla el InformeContexto in-process (lo que ven V4/V5 y recibe Carbone)
 *    y lo audita contra salidas_esperadas de caso5-oraculo.json (que a su vez
 *    espeja el XLSM/PDF). Los terminales vienen de TX_Calculos ESCRITAS POR AT03.
 *    Caso de borde propio: avalúo fiscal "NO REGISTRA" (RN-37).
 * 2) Dispara E2 con el mismo payload que POST /generar-pdf. NO bloqueante.
 * NUNCA imprime secretos.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { construirInformeContexto } from '@/lib/informe/ensamblador'
import { postToMake } from '@/lib/make-client'

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

const EV = 'docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005'
const O = JSON.parse(readFileSync(`${EV}/caso5-oraculo.json`, 'utf8'))
const S = O.salidas_esperadas
const R = JSON.parse(readFileSync(`${EV}/seed-result-caso5.json`, 'utf8'))
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

it('CASO 5 · ensamblado + auditoría dato-por-dato vs oráculo (motor AT03)', async () => {
  const rec = await at(`${TBL_SOL}/${ID}`)
  const ctx = await construirInformeContexto(ID, rec.fields)
  writeFileSync(`${EV}/caso5-contexto.json`, JSON.stringify(ctx, (k, v) =>
    (typeof v === 'string' && v.startsWith('data:image')) ? `«dataURI ${v.length}»` : v, 2))

  const t = ctx.terminales, c = ctx.comparablesInforme
  check('meta.codigo', ctx.meta.codigo, CODIGO, ctx.meta.codigo === CODIGO)
  const nInt = (ctx.meta as any).numeroSolicitudCliente ?? rec.fields.numero_solicitud
  check('numeroSolicitud (nº interno)', nInt, 'HEV -3183', nInt === 'HEV -3183')
  check('nOperacionCliente (folio mandante)', ctx.meta.nOperacionCliente, 25678, ctx.meta.nOperacionCliente === 25678)
  check('cliente', ctx.clienteInforme.nombre, 'Hipotecaria Evoluciona', ctx.clienteInforme.nombre === 'Hipotecaria Evoluciona')
  check('nombre cliente (solicitante)', ctx.partes.propietario, O.entradas.solicitud.cliente_final_nombre, ctx.partes.propietario === O.entradas.solicitud.cliente_final_nombre)
  check('rut solicitante (PDF imprime 0)', ctx.partes.rut, '0', ctx.partes.rut === '0')
  check('comuna', ctx.propiedad.comuna, 'La Florida', ctx.propiedad.comuna === 'La Florida')
  check('tipoPropiedad', ctx.propiedad.tipoPropiedad, 'Departamento', ctx.propiedad.tipoPropiedad === 'Departamento')
  check('rol SII', (ctx.propiedad as any).rolSii ?? rec.fields.rol_sii, '31-516', ((ctx.propiedad as any).rolSii ?? rec.fields.rol_sii) === '31-516')
  check('supConstruccion', ctx.propiedad.supConstruccionM2, 47.61, near(ctx.propiedad.supConstruccionM2, 47.61, 0.01))
  check('anioConstruccion', ctx.propiedad.anioConstruccion, 2026, ctx.propiedad.anioConstruccion === 2026)
  check('estadoConservacion', ctx.propiedad.estadoConservacion, 'NUEVO - S/USO', ctx.propiedad.estadoConservacion === 'NUEVO - S/USO')
  check('vidaUtil', ctx.propiedad.vidaUtil, 70, ctx.propiedad.vidaUtil === 70)
  check('valorComercialUf', t.valorComercialUf, S.valor_comercial_uf, near(t.valorComercialUf, S.valor_comercial_uf, 0.5))
  check('valorComercialClp', t.valorComercialClp, S.valor_comercial_clp, near(t.valorComercialClp, S.valor_comercial_clp, 2000))
  check('valorReposicionUf', t.valorReposicionUf, S.valor_reposicion_uf, near(t.valorReposicionUf, S.valor_reposicion_uf, 0.5))
  check('valorReposicionClp', t.valorReposicionClp, S.valor_reposicion_clp, near(t.valorReposicionClp, S.valor_reposicion_clp, 2000))
  check('seguroIncendioUf', t.seguroIncendioUf, S.seguro_incendio_uf, near(t.seguroIncendioUf, S.seguro_incendio_uf, 0.5))
  check('seguroIncendioClp', t.seguroIncendioClp, S.seguro_incendio_clp, near(t.seguroIncendioClp, S.seguro_incendio_clp, 2000))
  check('avaluoFiscalUf (0 por NO REGISTRA)', t.avaluoFiscalUf, S.avaluo_fiscal_uf, near(t.avaluoFiscalUf, S.avaluo_fiscal_uf, 0.01))
  check('avaluoFiscalUsd (null por RN-37)', t.avaluoFiscalUsd, null, t.avaluoFiscalUsd === null || t.avaluoFiscalUsd === 0)
  check('valorRemateUf', t.valorRemateUf, S.valor_remate_uf, near(t.valorRemateUf, S.valor_remate_uf, 0.5))
  check('valorRemateClp', t.valorRemateClp, S.valor_remate_clp, near(t.valorRemateClp, S.valor_remate_clp, 2000))
  check('valorLiquidacionUf', t.valorLiquidacionUf, S.valor_liquidacion_uf, near(t.valorLiquidacionUf, S.valor_liquidacion_uf, 0.5))
  check('valorLiquidacionClp', t.valorLiquidacionClp, S.valor_liquidacion_clp, near(t.valorLiquidacionClp, S.valor_liquidacion_clp, 2000))
  check('ufDia', t.ufDia, S.uf_dia, near(t.ufDia, S.uf_dia, 0.5))
  check('usdDia', t.usdDia, S.usd_dia, near(t.usdDia, S.usd_dia, 0.5))
  check('cuadro.totalUf', ctx.cuadro.totalUf, 3858.91, near(ctx.cuadro.totalUf, 3858.91, 0.5))
  check('cuadro.items#', ctx.cuadro.items.length, 3, ctx.cuadro.items.length === 3)
  check('rentaPerpetua', ctx.rentabilidad.rentaPerpetuaClp, S.renta_perpetua_clp, near(ctx.rentabilidad.rentaPerpetuaClp, S.renta_perpetua_clp, 2000))
  check('ingresoLiquidoAnual', ctx.rentabilidad.ingresoLiquidoAnualClp, S.ingreso_liquido_anual_clp, near(ctx.rentabilidad.ingresoLiquidoAnualClp, S.ingreso_liquido_anual_clp, 100))
  check('tasacionUfM2 (72.65 excl. OO.CC.)', c.tasacionUfM2, S.tasacion_uf_m2, near(c.tasacionUfM2, S.tasacion_uf_m2, 0.05))
  check('tasacionFila.oocc (400)', c.tasacionFila.oocc, 400, near(c.tasacionFila.oocc, 400, 0.5))
  check('ofertas.promedioUfM2', c.ofertas.promedio.ufM2Construccion, S.promedio_uf_m2_ofertas, near(c.ofertas.promedio.ufM2Construccion, S.promedio_uf_m2_ofertas, 0.2))
  check('cbr.promedioUfM2', c.cbr.promedio.ufM2Construccion, S.promedio_uf_m2_cbr, near(c.cbr.promedio.ufM2Construccion, S.promedio_uf_m2_cbr, 0.2))
  check('ajusteOfertas% (-3.56)', c.ofertas.tasacionVsPct, S.desviacion_vs_promedio_pct, near(c.ofertas.tasacionVsPct, S.desviacion_vs_promedio_pct, 0.5))
  check('ajusteCBR% (+9.50)', c.cbr.tasacionVsPct, S.desviacion_vs_promedio_cbr_pct, near(c.cbr.tasacionVsPct, S.desviacion_vs_promedio_cbr_pct, 0.5))
  check('comparables#', ctx.comparablesInforme.filas.length, 6, ctx.comparablesInforme.filas.length === 6)
  check('fotos grilla#', ctx.fotos.total, 16, ctx.fotos.total >= 14)
  check('ranura fachada', ctx.imagenes.fachada ? 'set' : 'null', 'set', !!ctx.imagenes.fachada)
  check('ranura ref1', ctx.imagenes.ref1 ? 'set' : 'null', 'set', !!ctx.imagenes.ref1)
  check('ranura mapaUbicacion', ctx.imagenes.mapaUbicacion ? 'set' : 'null', 'set', !!ctx.imagenes.mapaUbicacion)

  const pass = audit.checks.filter((x: any) => x.ok).length
  audit.resumen = `${pass}/${audit.checks.length}`
  // eslint-disable-next-line no-console
  console.log('AUDIT', audit.resumen)
  for (const x of audit.checks) if (!x.ok) console.log('  FAIL', x.nombre, 'got', JSON.stringify(x.got), 'esp', x.esperado)
  writeFileSync(`${EV}/caso5-audit.json`, JSON.stringify(audit, null, 2))
  expect(ctx.meta.codigo).toBe(CODIGO)

  // --- disparo E2 (NO bloqueante: el render directo es el camino garantizado) ---
  if (!process.env.MAKE_WEBHOOK_E2) { console.log('SIN MAKE_WEBHOOK_E2 — skip render E2'); return }
  try {
    const res = await postToMake(process.env.MAKE_WEBHOOK_E2!, { solicitud_id: ID, solicitud_codigo: CODIGO, contexto: ctx },
      { escenario: 'E2_Carbone_Render', solicitudId: CODIGO, timeoutMs: 30000 })
    // eslint-disable-next-line no-console
    console.log('E2 webhook status:', res.status)
    audit.render.e2Status = res.status
    let pdfUrl: string | null = null
    for (let i = 0; i < 18; i++) {
      await new Promise((r) => setTimeout(r, 10_000))
      const sol = await at(`${TBL_SOL}/${ID}`)
      if (sol.fields.pdf_final_url) { pdfUrl = String(sol.fields.pdf_final_url); break }
      const docs = await at(`${TBL_DOC}?filterByFormula=${encodeURIComponent(`FIND("${CODIGO}",ARRAYJOIN({solicitud}))`)}`)
      console.log(`poll ${i + 1}/18 · DocGen=${(docs.records ?? []).length} · pdf_final_url aún null`)
    }
    audit.render.pdfUrl = pdfUrl ? pdfUrl.slice(0, 80) : null
    const estado = (await at(`${TBL_SOL}/${ID}`)).fields.estado
    audit.render.estadoFinal = estado
    // eslint-disable-next-line no-console
    console.log('RENDER E2→E3 pdf_final_url:', pdfUrl ? 'SET' : 'null (no bloqueante)', '· estado:', estado)
  } catch (e: any) {
    audit.render.e2Error = String(e?.message || e).slice(0, 200)
    console.log('E2 no respondió (no bloqueante):', audit.render.e2Error)
  }
  writeFileSync(`${EV}/caso5-audit.json`, JSON.stringify(audit, null, 2))
}, 300_000)
