/**
 * Verificación local punta a punta — T-PDF-IDENTICO-20260927 (B-RECON).
 *
 * Ensambla el InformeContexto REAL de VP-2026-0067 contra Airtable (misma
 * ruta de código que /api/tasaciones/[id]/generar-pdf), lo guarda como
 * `contexto-real-v2.json`, chequea que las rutas tagueadas en la plantilla
 * v2 resuelvan a valor no-null, y renderiza directo contra Carbone
 * (templateId de .env.local) → `render-local-contexto-real.pdf`.
 *
 * Uso (oneshot, patrón contexto-0067.oneshot.mts de T-PDF-IMPRENTA):
 *   set -a; source .env.local; set +a
 *   pnpm vitest run docs/_evidencia/T-PDF-IDENTICO-20260927/verificacion-local.test.mts
 *
 * Sólo lecturas de Airtable; el render Carbone es efímero (no toca Make ni
 * la solicitud). NUNCA imprime tokens.
 */
import { writeFileSync } from 'node:fs'
import { it, expect } from 'vitest'

import { construirInformeContexto } from '@/lib/informe/ensamblador'

const ID = 'recmMzeu3eWGxyXsf'
const EVIDENCIA = 'docs/_evidencia/T-PDF-IDENTICO-20260927'

/** Rutas de dato (sin loops) que la plantilla v2 taguea y deben venir con valor. */
const RUTAS_CRITICAS = [
  'meta.numeroSolicitudCliente',
  'meta.nOperacionCliente',
  'clienteInforme.nombre',
  'partes.propietario',
  'partes.rut',
  'partes.ejecutivo',
  'partes.tasador.nombre',
  'partes.tasador.firmaUrl',
  'partes.visador.nombre',
  'partes.fechaVisita',
  'partes.fechaVisado',
  'propiedad.direccion',
  'propiedad.comuna',
  'propiedad.region',
  'propiedad.anioConstruccion',
  'propiedad.vidaUtil',
  'propiedad.velocidadVentaEstimada',
  'propiedad.dfl2',
  'propiedad.proyectoCondominio',
  'sii.rolSii',
  'sii.destinoSii',
  'sii.avaluoTotal',
  'legales.permisoEdificacion',
  'legales.recepcionFinal',
  'terminales.ufDia',
  'terminales.usdDia',
  'terminales.valorComercialUf',
  'terminales.valorReposicionUsd',
  'terminales.seguroIncendioUsd',
  'terminales.avaluoFiscalUsd',
  'terminales.valorRemateUsd',
  'terminales.valorLiquidacionUsd',
  'comparablesInforme.ofertas.promedio.ufM2Construccion',
  'comparablesInforme.cbr.promedio.ufM2Construccion',
  'comparablesInforme.ofertas.tasacionVsPct',
  'comparablesInforme.cbr.tasacionVsPct',
  'comparablesInforme.tasacionFila.ufM2Construccion',
  'rentabilidad.arriendoBrutoMensualClp',
  'rentabilidad.arriendoUfMes',
  'rentabilidad.tiempoRentaAnios',
  'recintos.totalRecintos',
  'textosIA.sintesisPropiedad',
  'textosIA.descripcionSector',
  'textosIA.textoExpropiacion',
  'imagenes.mapaUbicacion',
  'imagenes.fachada',
  'imagenes.firma',
  'imagenes.refMapa',
  'imagenes.ref1',
  'imagenes.ref2',
  'imagenes.ref3',
  'imagenes.anexo1Plano',
  'imagenes.anexo1Esquema',
  'imagenes.anexo1CuadroSup',
  'imagenes.anexo1Emplazamiento',
  'imagenes.anexo1Aerea',
  'imagenes.anexo1MapaSii',
  'imagenes.anexo1InfoSii',
  'imagenes.anexo2RolAvaluo',
  'imagenes.anexo2Permiso',
  'imagenes.anexo2Escritura',
  'imagenes.anexo2NoExpropiacion',
  'imagenes.anexo2Recepcion',
  'imagenes.anexo2Tgr',
  'cualitativa.normativa.supPredialMinimo',
  'cualitativa.sector.arteriaPrincipal',
  'cualitativa.sector.pctCondominios',
  'cualitativa.geometriaTerreno.frente',
  'cualitativa.emplazamiento.tipoAdosamiento',
  'cualitativa.constructivas.obrasComplementarias',
  'cualitativa.servicios.alcantarillado',
  'cualitativa.comodidades.corrientesDebiles',
  'cualitativa.detallePropiedad.casaNumero',
]

function valorEn(obj: unknown, ruta: string): unknown {
  return ruta.split('.').reduce<unknown>(
    (acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
    obj,
  )
}

/* Oneshot: sin credenciales cargadas (pnpm test normal) se salta — sólo corre
   en la invocación explícita con `source .env.local` (ver docblock). */
it.skipIf(!process.env.AIRTABLE_TOKEN || !process.env.CARBONE_TEMPLATE_ID)(
  'contexto real VP-2026-0067 completo + render Carbone local', async () => {
  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/tblaHTyMHYfmy7Fg6/${ID}`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } },
  )
  const rec = (await res.json()) as { fields: Record<string, unknown> }
  const contexto = await construirInformeContexto(ID, rec.fields)
  writeFileSync(`${EVIDENCIA}/contexto-real-v2.json`, JSON.stringify(contexto, null, 1))

  const nulas = RUTAS_CRITICAS.filter((r) => {
    const v = valorEn(contexto, r)
    return v === null || v === undefined || v === ''
  })
  // eslint-disable-next-line no-console
  if (nulas.length > 0) console.error('RUTAS NULL:', nulas)

  const c = contexto as unknown as Record<string, any>
  expect(c.comparablesInforme.ofertas.filas).toHaveLength(5)
  expect(c.comparablesInforme.cbr.filas).toHaveLength(2)
  expect(c.comparablesInforme.cbr.filas[0].fojaNumero).toBe('40132-55521')
  expect(c.comparablesInforme.ofertas.filas[0].fecha).toBe('abr-26')
  expect(c.fotos.fotos).toHaveLength(16)
  expect(c.cuadro.items.map((i: any) => i.descripcion)).toEqual([
    'Terreno',
    'Servidumbre',
    'Piso 1',
    'Piscina',
    'Quincho, terrazas, bodega',
    'Cierros, pavimento exterior',
  ])
  expect(c.recintos.totalRecintos).toBe(16)
  expect(c.recintos.terminacionesPorRecinto).toHaveLength(2)
  expect(
    c.recintos.habitacionesPorNivel.find(
      (h: any) => h.nivel === 'Piso1' && h.tipoRecinto === 'Sala',
    )?.cantidad,
  ).toBe(1)

  // Render local directo contra Carbone (mismo templateId que usará E2).
  const render = await fetch(
    `${process.env.CARBONE_API_URL}/render/${process.env.CARBONE_TEMPLATE_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CARBONE_API_TOKEN_PROD}`,
        'carbone-version': '4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: contexto, convertTo: 'pdf', lang: 'es-cl' }),
    },
  )
  const renderJson = (await render.json()) as { success: boolean; data?: { renderId: string } }
  expect(renderJson.success, JSON.stringify(renderJson).slice(0, 300)).toBe(true)

  const pdf = await fetch(
    `${process.env.CARBONE_API_URL}/render/${renderJson.data!.renderId}`,
    { headers: { 'carbone-version': '4' } },
  )
  const buf = Buffer.from(await pdf.arrayBuffer())
  expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
  writeFileSync(`${EVIDENCIA}/render-local-contexto-real.pdf`, buf)

  expect(nulas).toEqual([])
}, 300000)
