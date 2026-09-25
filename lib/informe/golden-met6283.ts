/**
 * Golden del caso VP-2026-0066 (mapeo de MET-6283) — valores esperados del
 * contexto ensamblado, ruta a ruta.
 *
 * Tanda T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 4 (golden +
 * harness Etapa A). Fuentes, en orden de autoridad:
 *
 * 1. **PDF gold master** (`docs/_referencias/Informe FRANCISCO VERGARA
 *    UNDURRAGA_Met6283.pdf`) vía la columna `valor_en_pdf_ref` del Excel
 *    gemelo `docs/_analisis/PARIDAD_informe_UI_20260924.xlsx` — cifras a 2
 *    decimales tal como se imprimen.
 * 2. **Registros reales de la base** leídos vía MCP el 25-sep-2026 (record
 *    ids citados por valor). Cuando el PDF redondea, el golden guarda el
 *    valor del PDF y el harness compara con tolerancia 0,01; cuando el PDF
 *    trunca a entero (CLP), se guarda el valor exacto de la base para que la
 *    tolerancia 0,01 siga siendo honesta.
 *
 * ⚠ Dos divergencias documentadas entre PDF y base — el golden sigue a la
 * BASE porque el harness valida el ensamblador contra los registros reales:
 *
 * - `propiedad.anioConstruccion`: el PDF imprime 2024; la base (y los
 *   `inputs_json` del motor) traen **2020** (`TX_DatosTasacion`
 *   `recfgslxbCJN5oAoD`).
 * - `comparablesInforme.filas`: el PDF trae 7 referencias; la base trae **0**
 *   filas en `TX_Comparables` para 0066 — es el sandbox de valores tipeados
 *   (guard `origen_dato=tipeado`; el flujo RF-09 se valida con 0067, ROADMAP
 *   §2 riesgos). Mismo motivo por el que fotos/anexos/recintos/legales están
 *   vacíos en este caso.
 */

/** Un valor esperado del golden. */
export interface EntradaGolden {
  /** Ruta dentro de `InformeContexto` (sintaxis de `leerRuta`). */
  ruta: string
  /** Valor esperado. Numéricos se comparan con tolerancia 0,01. */
  esperado: number | string
  /** `conteo`: se compara `length` del array resuelto, no el valor. */
  modo?: 'conteo'
  /** De dónde salió el valor (PDF/record id) — trazabilidad del golden. */
  fuente: string
}

export const GOLDEN_MET6283: readonly EntradaGolden[] = Object.freeze([
  /* --- Identificación y partes ------------------------------------- */
  {
    ruta: 'meta.codigo',
    esperado: 'VP-2026-0066',
    fuente: 'TX_Solicitudes recNiwM4s1ibr3sbO · codigo_solicitud',
  },
  {
    ruta: 'clienteInforme.nombre',
    esperado: 'MetLife',
    fuente: 'Link cliente → M_Clientes recIg8NtVhptXkEUJ (canónico)',
  },
  {
    ruta: 'partes.propietario',
    esperado: 'FRANCISCO JOSE VERGARA UNDURRAGA',
    fuente: 'PDF portada · TX_Solicitudes.cliente_final_nombre',
  },
  {
    ruta: 'partes.rut',
    esperado: '16.610.203-0',
    fuente: 'PDF identificación · TX_Solicitudes.cliente_final_rut',
  },
  {
    ruta: 'partes.fechaVisita',
    esperado: '2026-04-13',
    fuente: 'PDF «13 de abril de 2026» · TX_Solicitudes.fecha_visita',
  },
  {
    ruta: 'partes.tasador.nombre',
    esperado: 'Sergio (nutricionsaludketo)',
    fuente: 'Link tasador → M_Tasadores recTJcV3BIvdcG4em (sandbox; el PDF dice M.E. Soto)',
  },
  /* --- Propiedad ---------------------------------------------------- */
  {
    ruta: 'propiedad.direccion',
    esperado: 'LOS EUCALIPTUS 2100',
    fuente: 'PDF «LOS EUCALIPTUS N°2100» · TX_Solicitudes.direccion',
  },
  {
    ruta: 'propiedad.comuna',
    esperado: 'Colina',
    fuente: 'Link comuna → M_Comunas recKT9mUJkeq3YuBu',
  },
  {
    ruta: 'propiedad.region',
    esperado: 'Metropolitana de Santiago',
    fuente: 'TX_Solicitudes.region',
  },
  {
    ruta: 'propiedad.tipoPropiedad',
    esperado: 'Casa',
    fuente: 'Link tipo_propiedad → M_TiposPropiedad recrXDAjlVCe59XBW',
  },
  {
    ruta: 'propiedad.objetivo',
    esperado: 'Refinanciamiento',
    fuente: 'Link tipo_informe → M_TiposInforme recreojxTjoAWOEHa',
  },
  {
    ruta: 'propiedad.supTerrenoM2',
    esperado: 5024.86,
    fuente: 'PDF «5.024,86 m²» · TX_DatosTasacion recfgslxbCJN5oAoD.sup_terreno_m2',
  },
  {
    ruta: 'propiedad.supConstruccionM2',
    esperado: 249.91,
    fuente: 'PDF «249,91 m²» · TX_DatosTasacion.sup_construccion_m2',
  },
  {
    ruta: 'propiedad.anioConstruccion',
    esperado: 2020,
    fuente: 'TX_DatosTasacion.anio_construccion (⚠ PDF imprime 2024 — divergencia documentada)',
  },
  {
    ruta: 'propiedad.materialPredominante',
    esperado: 'ALBAÑILERÍA LADRILLO',
    fuente: 'TX_DatosTasacion.material_predominante · inputs_json del motor',
  },
  {
    ruta: 'propiedad.velocidadVentaEstimada',
    esperado: '8 a 10 meses',
    fuente: 'PDF «8 A 10 MESES» · TX_DatosTasacion.velocidad_venta_estimada',
  },
  /* --- SII ----------------------------------------------------------- */
  {
    ruta: 'sii.rolSii',
    esperado: '00882-00040',
    fuente: 'PDF «N°882-40» · TX_Solicitudes.rol_sii (formato con ceros de la base)',
  },
  /* --- Cuadro de valoración (E-87..98) ------------------------------- */
  {
    ruta: 'cuadro.totalUf',
    esperado: 20125.86,
    fuente: 'PDF «20.125,86 UF» · Σ valor_uf de las 6 filas TX_ItemsCuadroValoracion (11218,80+0+8157,0624+350+250+150)',
  },
  {
    ruta: 'cuadro.items',
    esperado: 6,
    modo: 'conteo',
    fuente: 'TX_ItemsCuadroValoracion: 6 filas linkeadas a recNiwM4s1ibr3sbO',
  },
  /* --- Terminales (TX_Calculos · motor AT03 v11.1.1_v32b0) ----------- */
  {
    ruta: 'terminales.valorComercialUf',
    esperado: 20125.86,
    fuente: 'PDF «UF 20.125,86» · TX_Calculos recmDmE6cw2u12ugE (F_ValorComercialUF = 20125.8624)',
  },
  {
    ruta: 'terminales.valorComercialClp',
    esperado: 802913431.36,
    fuente: 'PDF «$802.913.431» · TX_Calculos rec9nGq6D2VZeWVgN (F_ValorComercialCLP = 802913431.3616639)',
  },
  {
    ruta: 'terminales.valorReposicionUf',
    esperado: 9246.94,
    fuente: 'PDF «9.246,94» · TX_Calculos recYiJGtIVbP6gwPd (F_ValorReposicionUF)',
  },
  {
    ruta: 'terminales.seguroIncendioUf',
    esperado: 8907.06,
    fuente: 'PDF «8.907,06» · TX_Calculos rec60mmxjQdoBYrpP (F_SeguroIncendioUF = 8907.0624)',
  },
  {
    ruta: 'terminales.avaluoFiscalUf',
    esperado: 8517.68,
    fuente: 'PDF «8.517,68» · TX_Calculos rec16bw1QmBhoNUS9 (F_AvaluoFiscalUF = 8517.67767625752)',
  },
  {
    ruta: 'terminales.valorRemateUf',
    esperado: 13081.81,
    fuente: 'PDF «13.081,81» · TX_Calculos recuNUco8TOqqLJAe (F_ValorRemateUF = 13081.81056)',
  },
  {
    ruta: 'terminales.valorLiquidacionUf',
    esperado: 16603.84,
    fuente: 'PDF «16.603,84» · TX_Calculos recDTR0ntj50Z9K8E (F_ValorLiquidacionUF = 16603.83648)',
  },
  {
    ruta: 'terminales.rentaPerpetuaClp',
    esperado: 806666666.67,
    fuente: 'PDF «$806.666.667» · TX_Calculos recUbCf2jpMg7RL1E (F_RentaPerpetuaCLP = 806666666.6666667)',
  },
  {
    ruta: 'terminales.ufDia',
    esperado: 39894.61,
    fuente: 'PDF «1UF= $39.894,61» · H_PreciosUF recbnHFtlFHQnyEM9 (fecha 2026-04-13, valor_clp)',
  },
  {
    ruta: 'terminales.usdDia',
    esperado: 890.33,
    fuente: 'PDF «1US$= $890,33» · H_PreciosUF recbnHFtlFHQnyEM9 (tipo_cambio_usd, seed manual 13-abr)',
  },
  /* --- Rentabilidad --------------------------------------------------- */
  {
    ruta: 'rentabilidad.arriendoBrutoMensualClp',
    esperado: 3300000,
    fuente: 'PDF «$3.300.000» · TX_DatosTasacion.arriendo_bruto_mensual_clp',
  },
  {
    ruta: 'rentabilidad.gastoAnualClp',
    esperado: 3300000,
    fuente: 'PDF «$3.300.000» · TX_DatosTasacion.gasto_anual_clp',
  },
  {
    ruta: 'rentabilidad.ingresoLiquidoAnualClp',
    esperado: 36300000,
    fuente: 'PDF «$36.300.000» · TX_Calculos recadqk2BU4ME6kSh (F_IngresoLiquidoAnualCLP)',
  },
  {
    ruta: 'rentabilidad.tasaCapRate',
    esperado: 0.045,
    fuente: 'PDF «4,5%» · TX_DatosTasacion.tasa_cap_rate (tipeado 0.045 — guard H5 pendiente de cascada)',
  },
  /* --- Comparables (vacíos en 0066 — sandbox tipeado) ----------------- */
  {
    ruta: 'comparablesInforme.filas',
    esperado: 0,
    modo: 'conteo',
    fuente: 'TX_Comparables sin filas para 0066 (el flujo RF-09 se valida con 0067 — ROADMAP §2)',
  },
])
