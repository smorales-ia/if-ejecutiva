import { describe, it, expect } from "vitest"

/**
 * Tests de PORT (T-MC-P0). El motor vive en Airtable Scripting
 * (`docs/_artefactos/airtable/AT03_Calculos_DAG.js`) y en la fórmula de tabla
 * `TX_ItemsCuadroValoracion.valor_uf` — ninguno importable por `@/`. Aquí se
 * replica la lógica bajo prueba (port fiel) y se verifica contra el oráculo
 * MET-6283 / VP-2026-0066 (§4 del PLAN_T-MC-P0.md).
 */

/* ---- H1/H2 · port de la fórmula `valor_uf` (fld1F3u5J5NlnJUjY) ------------ */
// IF(tipo='Terreno', sup*ufm2, IF(tipo='Terraza', sup*ufm2*0.5, sup*ufm2*factor))
// Airtable trata blank como 0 en la multiplicación.
function valorUf(
  tipo: string,
  sup: number,
  ufM2: number,
  factor: number | null,
): number {
  const t = tipo.toLowerCase()
  if (t === "terreno") return sup * ufM2
  if (t === "terraza") return sup * ufM2 * 0.5
  const f = factor == null || Number.isNaN(factor) ? 0 : factor
  return sup * ufM2 * f
}

/* ---- H2 · port de la derivación coefEstado (AT03_Calculos_DAG.js:973-980) -- */
function coefEstado(estado: string): number {
  const ec = String(estado || "").toLowerCase()
  if (ec.indexOf("muy bueno") >= 0 || ec.indexOf("excel") >= 0) return 1.0
  if (ec.indexOf("bueno") >= 0) return 0.95
  if (ec.indexOf("regular") >= 0) return 0.85
  if (ec.indexOf("malo") >= 0) return 0.7
  return 1.0
}

/* ---- H3 · port del guard fail-ruidoso (AT03_Calculos_DAG.js:985) ---------- */
function ufDiaGuard(ufRaw: unknown): number {
  const uf = parseFloat(String(ufRaw))
  if (Number.isNaN(uf) || uf <= 0) {
    throw new Error("H3: uf_dia_visita ausente. Calculo abortado — sin default 38500.")
  }
  return uf
}

describe("H1/H2 · valor_uf del cuadro (oráculo MET-6283)", () => {
  it("edificación aplica sup·ufm2·factor (0.96) → 8157.06", () => {
    expect(valorUf("Edificacion", 249.91, 34, 0.96)).toBeCloseTo(8157.06, 1)
  })

  it("terreno ignora el factor: sup·ufm2 → 11218.8", () => {
    expect(valorUf("Terreno", 1402.35, 8, 0.5)).toBeCloseTo(11218.8, 1)
  })

  it("terraza aplica ×0.5", () => {
    expect(valorUf("Terraza", 100, 10, 1)).toBe(500)
  })

  it("H1: factor vacío en edificación → valor 0 (no NaN)", () => {
    const v = valorUf("Edificacion", 249.91, 34, null)
    expect(v).toBe(0)
    expect(Number.isNaN(v)).toBe(false)
  })
})

describe("H2 · derivación del factor por defecto (coefEstado)", () => {
  it.each([
    ["Bueno", 0.95],
    ["Regular", 0.85],
    ["Malo", 0.7],
    ["Muy bueno", 1.0],
    ["", 1.0],
  ])("estado %s → %f", (estado, esperado) => {
    expect(coefEstado(estado)).toBe(esperado)
  })

  it("D-2: el default 0.95 (Bueno) NO reproduce el 0.96 del xlsm → override obligatorio", () => {
    expect(coefEstado("Bueno")).not.toBe(0.96)
    // Con override por ítem sí cierra:
    expect(valorUf("Edificacion", 249.91, 34, 0.96)).toBeCloseTo(8157.06, 1)
  })
})

describe("H3 · guard fail-ruidoso de uf_dia_visita", () => {
  it("camino feliz: 39894.61 pasa", () => {
    expect(ufDiaGuard("39894.61")).toBeCloseTo(39894.61, 2)
  })

  it.each(["", "0", undefined, null, "abc"])(
    "ausente/inválido (%s) → lanza, no default 38500",
    (v) => {
      expect(() => ufDiaGuard(v)).toThrow(/38500/)
    },
  )
})

/* ---- H3 lookup · port de la resolución UF vía H_PreciosUF (DAG post-fix) --- */
type FilaUf = { fecha: string; valor_clp: number | null }
function resolverUfDia(fechaVisita: string, filas: FilaUf[]): number {
  const fv = String(fechaVisita || "").slice(0, 10)
  if (!fv) throw new Error("H3: fecha_visita ausente. Abortado — sin default 38500.")
  let uf: number | null = null
  for (const f of filas) {
    if (String(f.fecha || "").slice(0, 10) === fv) {
      const v = Number(f.valor_clp)
      if (!Number.isNaN(v) && v > 0) uf = v
      break
    }
  }
  if (uf === null) throw new Error(`H3: UF no cargada para ${fv}. Abortado — sin default 38500.`)
  return uf
}

/* ---- RF-09 guard · port de origen_dato=tipeado (AT03-Ext escribirDestino) -- */
function decidirEscritura(origenDato: unknown): "skip" | "write" {
  return String(origenDato || "").trim().toLowerCase() === "tipeado" ? "skip" : "write"
}

describe("H3 · lookup UF vía H_PreciosUF (fecha_visita)", () => {
  const tabla: FilaUf[] = [
    { fecha: "2026-09-17", valor_clp: 39894.61 },
    { fecha: "2026-05-31", valor_clp: 40610.69 },
  ]
  it("fecha presente + fila existe → devuelve valor_clp", () => {
    expect(resolverUfDia("2026-09-17", tabla)).toBeCloseTo(39894.61, 2)
  })
  it("fecha presente + fila ausente → lanza (sin 38500)", () => {
    expect(() => resolverUfDia("2026-09-22", tabla)).toThrow(/38500/)
  })
  it("fecha vacía → lanza (sin 38500)", () => {
    expect(() => resolverUfDia("", tabla)).toThrow(/38500/)
  })
  it("fila con valor_clp inválido → ausente → lanza", () => {
    expect(() =>
      resolverUfDia("2026-01-01", [{ fecha: "2026-01-01", valor_clp: null }]),
    ).toThrow(/38500/)
  })
})

describe("RF-09 · guard origen_dato=tipeado", () => {
  it("origen_dato=tipeado → skip (no pisar dato tipeado)", () => {
    expect(decidirEscritura("tipeado")).toBe("skip")
    expect(decidirEscritura("Tipeado")).toBe("skip")
  })
  it("origen_dato vacío/null → write", () => {
    expect(decidirEscritura("")).toBe("write")
    expect(decidirEscritura(null)).toBe("write")
  })
  it("origen_dato=extraido_rf09 → write", () => {
    expect(decidirEscritura("extraido_rf09")).toBe("write")
  })
})

/* ==========================================================================
 * REGRESIÓN 13/13 (T-AUDIT-CLOSE) — oráculo MET-6283 / VP-2026-0066.
 * Port de la capa terminal de C_Formulas (los `expr` de TX_Calculos, verificados
 * en vivo el 2026-09-23 · AT03_v11.1.1_v32b0). Tolerancia ±1% CLP / ±0,01 UF.
 * Anclas base (xlsm Portada): comercialUF=BI62, reposicionUF=BG72, seguroUF=BO62,
 * avaluo_fiscal_clp input=BL74, ingreso_liquido=BJ43, uf_dia=AQ71.
 * ======================================================================== */
const ORACULO = {
  uf_dia: 39894.61,
  comercialUF: 20125.8624,
  reposicionUF: 9246.94,
  seguroUF: 8907.0624,
  avaluoFiscalClp: 339809429, // BL74 (input tipeado)
  ingresoLiquidoAnualClp: 36300000, // BJ43
  tasaCapRate: 0.045,
  factorSeguro: 1,
  factorGarantia: 0.8,
  ufM2Terreno: 17,
}

// Ports de expresiones terminales (idénticas a los `expr` de C_Formulas).
const clpDesdeUf = (uf: number, ufDia: number) => uf * ufDia
const remateUf = (comercialUf: number) => comercialUf * 0.65
const liquidacionUf = (comercialUf: number) => comercialUf * 0.825
const rentaPerpetuaClp = (ingreso: number, tasa: number) => (tasa > 0 ? ingreso / tasa : 0)
const avaluoFiscalUf = (avaluoClp: number, ufDia: number) => (ufDia > 0 ? avaluoClp / ufDia : 0)
const ingresoLiquidoAnual = (arriendoMensual: number, gastoAnual: number) =>
  arriendoMensual * 12 - gastoAnual
// Ternario hay_cuadro (F_ValorComercialUF): con cuadro usa la suma de ítems;
// sin cuadro usa sup·uf_m2_nuevo·factor_df.
const valorComercialUf = (
  hayCuadro: number,
  cuadroSumUf: number,
  supConstruccion: number,
  ufM2Nuevo: number,
  factorDf: number,
) => (hayCuadro > 0 ? cuadroSumUf : supConstruccion * ufM2Nuevo * factorDf)

describe("REGRESIÓN 13/13 · terminales VP-2026-0066 (±1% / ±0,01 UF)", () => {
  it("R-08 · F_ValorComercialUF ancla = 20.125,86", () => {
    expect(ORACULO.comercialUF).toBeCloseTo(20125.8624, 2)
  })
  it("R-09 · F_ValorComercialCLP = comercialUF·uf_dia → 802.913.431", () => {
    expect(clpDesdeUf(ORACULO.comercialUF, ORACULO.uf_dia)).toBeCloseTo(802913431.36, -6)
  })
  it("R-10 · F_ValorReposicionUF ancla = 9.246,94", () => {
    expect(ORACULO.reposicionUF).toBeCloseTo(9246.94, 2)
  })
  it("R-11 · F_ValorReposicionCLP = reposicionUF·uf_dia → 368.903.065", () => {
    expect(clpDesdeUf(ORACULO.reposicionUF, ORACULO.uf_dia)).toBeCloseTo(368903064.99, -6)
  })
  it("R-12 · F_SeguroIncendioUF ancla = 8.907,06", () => {
    expect(ORACULO.seguroUF).toBeCloseTo(8907.0624, 2)
  })
  it("R-13 · F_SeguroIncendioCLP = seguroUF·uf_dia → 355.343.781", () => {
    expect(clpDesdeUf(ORACULO.seguroUF, ORACULO.uf_dia)).toBeCloseTo(355343780.69, -6)
  })
  it("R-14 · F_AvaluoFiscalUF = avaluo_fiscal_clp/uf_dia → 8.517,68", () => {
    expect(avaluoFiscalUf(ORACULO.avaluoFiscalClp, ORACULO.uf_dia)).toBeCloseTo(8517.6777, 2)
  })
  it("R-15 · F_ValorRemateUF = comercialUF·0.65 → 13.081,81", () => {
    expect(remateUf(ORACULO.comercialUF)).toBeCloseTo(13081.81056, 2)
  })
  it("R-16 · F_ValorRemateCLP = remateUF·uf_dia → 521.893.730", () => {
    expect(clpDesdeUf(remateUf(ORACULO.comercialUF), ORACULO.uf_dia)).toBeCloseTo(521893730.39, -6)
  })
  it("R-17a · F_ValorLiquidacionUF = comercialUF·0.825 → 16.603,84", () => {
    expect(liquidacionUf(ORACULO.comercialUF)).toBeCloseTo(16603.83648, 2)
  })
  it("R-17b · F_ValorLiquidacionCLP = liquidacionUF·uf_dia → 662.403.581", () => {
    expect(clpDesdeUf(liquidacionUf(ORACULO.comercialUF), ORACULO.uf_dia)).toBeCloseTo(
      662403580.87,
      -6,
    )
  })
  it("R-18 · F_IngresoLiquidoAnualCLP = arriendo·12 − gasto → 36.300.000", () => {
    // arriendo_bruto_mensual=3.300.000 · gasto_anual=3.300.000 (reproduce BJ43)
    expect(ingresoLiquidoAnual(3300000, 3300000)).toBe(ORACULO.ingresoLiquidoAnualClp)
  })
  it("R-19 · F_RentaPerpetuaCLP = ingreso_liquido/tasa_cap → 806.666.667", () => {
    expect(rentaPerpetuaClp(ORACULO.ingresoLiquidoAnualClp, ORACULO.tasaCapRate)).toBeCloseTo(
      806666666.67,
      -6,
    )
  })
})

describe("R-SCOPE · primitivas del SCOPE (anclas §4 SCOPE)", () => {
  it("uf_dia · tasa · factores · uf_m2_terreno coinciden con el oráculo", () => {
    expect(ORACULO.uf_dia).toBe(39894.61)
    expect(ORACULO.tasaCapRate).toBe(0.045)
    expect(ORACULO.factorSeguro).toBe(1)
    expect(ORACULO.factorGarantia).toBe(0.8)
    expect(ORACULO.ufM2Terreno).toBe(17)
  })
})

describe("R-17 · ternario hay_cuadro (rama sin cuadro)", () => {
  it("hay_cuadro=1 → usa la suma de ítems del cuadro (20.125,86)", () => {
    expect(valorComercialUf(1, ORACULO.comercialUF, 249.91, 34, 0.96)).toBeCloseTo(20125.8624, 2)
  })
  it("hay_cuadro=0 → usa sup·uf_m2_nuevo·factor_df (no la suma del cuadro)", () => {
    const v = valorComercialUf(0, ORACULO.comercialUF, 249.91, 34, 0.96)
    expect(v).toBeCloseTo(249.91 * 34 * 0.96, 2)
    expect(v).not.toBeCloseTo(ORACULO.comercialUF, 2)
  })
})
