import { describe, it, expect } from "vitest"

/**
 * Tests de PORT (T-AUDIT-CLOSE-20260923) — guards H5/H6/H7.
 *
 * El motor vive en Airtable Scripting (`docs/_artefactos/airtable/AT03_Calculos_DAG.js`),
 * NO importable por `@/`. Aquí se replican FIELMENTE los tres guards fail-ruidoso
 * introducidos en esta tanda (bloques cliente `:757-…` y comuna `:783-…`, molde H3
 * `:999-1031`) y se verifica que:
 *   1. lanzan cuando el dato de negocio está ausente (sin degradar a default),
 *   2. el `Error.message` es exactamente el `tipo_evento` que se escribe en A_Eventos,
 *   3. NO lanzan para MetLife/Colina (invariante que mantiene la regresión 13/13).
 *
 * INVARIANTE DE REGRESIÓN: MetLife (tasa_cap_rate=0.045, factor_seguro=1,
 * factor_garantia=0.8) y Colina (uf_m2 17/42/42) deben pasar sin throw.
 */

type Cliente = {
  tasa_cap_rate?: number | string | null
  factor_seguro?: number | string | null
  factor_garantia?: number | string | null
}
type Comuna = {
  uf_m2_terreno?: number | string | null
  uf_m2_construccion?: number | string | null
  uf_m2_promedio_residencial?: number | string | null
}

/* ---- Port fiel del guard H5/H6 (AT03_Calculos_DAG.js bloque cliente) -------- */
// El Error.message porta el tipo_evento escrito en A_Eventos.
function guardCliente(
  cliId: string | null,
  cli: Cliente | null,
  tasaCapRateOverride = 0,
): { factorSeguro: number; factorGarantia: number; tasaCapRateCliente: number } {
  let factorSeguro = 1.0,
    factorGarantia = 0.8,
    tasaCapRateCliente = 0.045
  let cliTasaNaN = false,
    cliSeguroNaN = false,
    cliGarantiaNaN = false
  if (cliId && cli) {
    const fs = parseFloat(String(cli.factor_seguro))
    const fg = parseFloat(String(cli.factor_garantia))
    const tc = parseFloat(String(cli.tasa_cap_rate))
    cliSeguroNaN = Number.isNaN(fs)
    cliGarantiaNaN = Number.isNaN(fg)
    cliTasaNaN = Number.isNaN(tc)
    if (!Number.isNaN(fs)) factorSeguro = fs
    if (!Number.isNaN(fg)) factorGarantia = fg
    if (!Number.isNaN(tc)) tasaCapRateCliente = tc
  }
  // H5
  if (cliId && cliTasaNaN && !(tasaCapRateOverride > 0)) {
    throw new Error("cliente_sin_tasa_cap_rate")
  }
  // H6
  if (cliId && (cliSeguroNaN || cliGarantiaNaN)) {
    throw new Error("cliente_sin_factor_seguro_garantia")
  }
  return { factorSeguro, factorGarantia, tasaCapRateCliente }
}

/* ---- Port fiel del guard H7 (AT03_Calculos_DAG.js bloque comuna) ------------ */
function guardComuna(
  comId: string | null,
  com: Comuna | null,
): { ufM2Terreno: number; ufM2Construccion: number; ufM2PromedioResid: number } {
  let ufM2Terreno = 20,
    ufM2Construccion = 40,
    ufM2PromedioResid = 45
  let comTerrNaN = false,
    comConsNaN = false,
    comPromNaN = false,
    comLeida = false
  if (comId && com) {
    comLeida = true
    const a = parseFloat(String(com.uf_m2_terreno))
    const b = parseFloat(String(com.uf_m2_construccion))
    const c = parseFloat(String(com.uf_m2_promedio_residencial))
    comTerrNaN = Number.isNaN(a)
    comConsNaN = Number.isNaN(b)
    comPromNaN = Number.isNaN(c)
    if (!Number.isNaN(a)) ufM2Terreno = a
    if (!Number.isNaN(b)) ufM2Construccion = b
    if (!Number.isNaN(c)) ufM2PromedioResid = c
  }
  if (comId && comLeida && comTerrNaN && comConsNaN && comPromNaN) {
    throw new Error("comuna_sin_precios_unitarios")
  }
  return { ufM2Terreno, ufM2Construccion, ufM2PromedioResid }
}

const METLIFE: Cliente = { tasa_cap_rate: 0.045, factor_seguro: 1, factor_garantia: 0.8 }
const COLINA: Comuna = {
  uf_m2_terreno: 17,
  uf_m2_construccion: 42,
  uf_m2_promedio_residencial: 42,
}

describe("H5 · guard cliente sin tasa_cap_rate (fail-ruidoso)", () => {
  it("U-H5-01: MetLife (0.045) → NO lanza, conserva 0.045 (invariante regresión)", () => {
    expect(guardCliente("recCli", METLIFE).tasaCapRateCliente).toBe(0.045)
  })
  it("U-H5-02: cliente vinculado sin tasa_cap_rate y sin override → lanza, sin default 0.045", () => {
    expect(() =>
      guardCliente("recCli", { factor_seguro: 1, factor_garantia: 0.8, tasa_cap_rate: null }),
    ).toThrow("cliente_sin_tasa_cap_rate")
  })
  it("U-H5-03: override>0 tiene precedencia → sin tasa del cliente NO aborta", () => {
    expect(() =>
      guardCliente(
        "recCli",
        { factor_seguro: 1, factor_garantia: 0.8, tasa_cap_rate: null },
        0.05,
      ),
    ).not.toThrow()
  })
})

describe("H6 · guard cliente sin factor_seguro/garantia (fail-ruidoso)", () => {
  it("U-H6-01: MetLife (1 / 0.8) → NO lanza (invariante regresión)", () => {
    const r = guardCliente("recCli", METLIFE)
    expect(r.factorSeguro).toBe(1)
    expect(r.factorGarantia).toBe(0.8)
  })
  it("U-H6-02: falta factor_seguro → lanza, sin default 1.0", () => {
    expect(() =>
      guardCliente("recCli", { tasa_cap_rate: 0.045, factor_seguro: null, factor_garantia: 0.8 }),
    ).toThrow("cliente_sin_factor_seguro_garantia")
  })
  it("U-H6-03: falta factor_garantia → lanza, sin default 0.8", () => {
    expect(() =>
      guardCliente("recCli", { tasa_cap_rate: 0.045, factor_seguro: 1, factor_garantia: null }),
    ).toThrow("cliente_sin_factor_seguro_garantia")
  })
})

describe("H7 · guard comuna sin uf_m2_* (fail-ruidoso)", () => {
  it("U-H7-01: Colina (17/42/42) → NO lanza, conserva uf_m2_terreno=17 (invariante regresión)", () => {
    expect(guardComuna("recCom", COLINA).ufM2Terreno).toBe(17)
  })
  it("U-H7-02: comuna vinculada sin NINGÚN uf_m2_* → lanza, sin default 20/40/45", () => {
    expect(() =>
      guardComuna("recCom", {
        uf_m2_terreno: null,
        uf_m2_construccion: null,
        uf_m2_promedio_residencial: null,
      }),
    ).toThrow("comuna_sin_precios_unitarios")
  })
  it("U-H7-03: con al menos uno presente → NO lanza (default por-campo se conserva)", () => {
    const r = guardComuna("recCom", {
      uf_m2_terreno: 17,
      uf_m2_construccion: null,
      uf_m2_promedio_residencial: null,
    })
    expect(r.ufM2Terreno).toBe(17)
    expect(r.ufM2Construccion).toBe(40) // default por-campo, no aborta
  })
})

describe("U-H567-EVT · cada guard porta su tipo_evento exacto de A_Eventos", () => {
  it("los tres nombres de evento coinciden con los escritos en el DAG", () => {
    const msg = (fn: () => unknown): string => {
      try {
        fn()
      } catch (e) {
        return (e as Error).message
      }
      return "NO_THROW"
    }
    expect(msg(() => guardCliente("r", { tasa_cap_rate: null }))).toBe("cliente_sin_tasa_cap_rate")
    expect(
      msg(() => guardCliente("r", { tasa_cap_rate: 0.045, factor_seguro: null })),
    ).toBe("cliente_sin_factor_seguro_garantia")
    expect(
      msg(() =>
        guardComuna("r", {
          uf_m2_terreno: null,
          uf_m2_construccion: null,
          uf_m2_promedio_residencial: null,
        }),
      ),
    ).toBe("comuna_sin_precios_unitarios")
  })
})
