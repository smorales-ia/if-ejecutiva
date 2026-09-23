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
