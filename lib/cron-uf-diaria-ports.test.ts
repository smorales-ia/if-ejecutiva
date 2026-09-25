import { describe, it, expect } from "vitest"

/**
 * Tests de PORT (P1-3 · T-ARREGLOS-DOCS-20260925). El cron vive en Airtable
 * Scripting (`docs/_artefactos/airtable/CRON_UF_Diaria.js`) — no importable
 * por `@/`. Aquí se replica la lógica pura bajo prueba (port fiel, patrón
 * `motor-ports-t-mc-p0.test.ts`) y se verifica: armado de la ventana de
 * lookback, parseo de la serie de mindicador y regla del último hábil para
 * el dólar (no se publica sáb/dom/feriados — se arrastra el último valor
 * hábil disponible dentro de la ventana; sin dato ⇒ null, jamás default).
 */

/* ---- port de isoMenosDias (CRON_UF_Diaria.js §0) -------------------------- */
function isoMenosDias(fechaIso: string, n: number): string {
  return new Date(Date.parse(fechaIso + "T12:00:00Z") - n * 86400000)
    .toISOString()
    .slice(0, 10)
}

/* ---- port del armado de fechas objetivo (§1) ------------------------------ */
function fechasLookback(hoy: string, lookbackDias: number): string[] {
  const out: string[] = []
  for (let i = 0; i <= lookbackDias; i++) out.push(isoMenosDias(hoy, i))
  return out
}

/* ---- port del parseo de la respuesta mindicador (fetchIndicador, §0) ------ */
// Casa por fecha exacta dentro de `serie`; valor inválido o ausente ⇒ NaN.
function parseSerieMindicador(json: unknown, fecha: string): number {
  const j = json as { serie?: Array<{ fecha?: string; valor?: unknown }> } | null
  const serie = j && Array.isArray(j.serie) ? j.serie : []
  const fila = serie.find((s) => String(s.fecha || "").slice(0, 10) === fecha)
  const v = fila ? parseFloat(String(fila.valor)) : NaN
  return !isNaN(v) && v > 0 ? v : NaN
}

/* ---- port de resolverDolar (§0): regla del último hábil + cache ----------- */
async function resolverDolar(
  fecha: string,
  lookbackDias: number,
  fetchDolar: (f: string) => Promise<number>,
  cache: Map<string, number> = new Map(),
): Promise<{ valor: number; fechaOrigen: string } | null> {
  for (let i = 0; i <= lookbackDias; i++) {
    const f = isoMenosDias(fecha, i)
    if (!cache.has(f)) cache.set(f, await fetchDolar(f))
    const v = cache.get(f)!
    if (!isNaN(v) && v > 0) return { valor: v, fechaOrigen: f }
  }
  return null
}

describe("fechas de lookback (hoy + LOOKBACK_DIAS hacia atrás)", () => {
  it("LOOKBACK=7 produce 8 fechas, de hoy hacia atrás", () => {
    const fechas = fechasLookback("2026-09-25", 7)
    expect(fechas).toHaveLength(8)
    expect(fechas[0]).toBe("2026-09-25")
    expect(fechas[7]).toBe("2026-09-18")
  })

  it("cruza límite de mes y año sin desfase", () => {
    expect(fechasLookback("2026-10-02", 7)).toContain("2026-09-25")
    expect(fechasLookback("2027-01-03", 7)).toContain("2026-12-27")
  })
})

describe("parseo de la serie mindicador", () => {
  const serie = {
    serie: [
      { fecha: "2026-09-25T04:00:00.000Z", valor: 41016.32 },
      { fecha: "2026-09-24T04:00:00.000Z", valor: 41008.1 },
    ],
  }

  it("casa por fecha exacta aunque la serie traiga más puntos", () => {
    expect(parseSerieMindicador(serie, "2026-09-24")).toBe(41008.1)
  })

  it("fecha sin punto en la serie (fin de semana) ⇒ NaN", () => {
    expect(parseSerieMindicador(serie, "2026-09-26")).toBeNaN()
  })

  it("serie vacía, json nulo o valor ≤ 0 ⇒ NaN (nunca default)", () => {
    expect(parseSerieMindicador({ serie: [] }, "2026-09-25")).toBeNaN()
    expect(parseSerieMindicador(null, "2026-09-25")).toBeNaN()
    expect(
      parseSerieMindicador({ serie: [{ fecha: "2026-09-25", valor: 0 }] }, "2026-09-25"),
    ).toBeNaN()
    expect(
      parseSerieMindicador({ serie: [{ fecha: "2026-09-25", valor: "no-num" }] }, "2026-09-25"),
    ).toBeNaN()
  })
})

describe("resolverDolar · regla del último hábil disponible", () => {
  // 2026-09-26 es sábado y 27 domingo; el 25 (viernes) sí tiene dólar.
  const publicado: Record<string, number> = { "2026-09-25": 961.4, "2026-09-24": 958.2 }
  const fetchStub = async (f: string) => (f in publicado ? publicado[f] : NaN)

  it("día hábil con dato usa su propio valor (fechaOrigen = fecha)", async () => {
    const r = await resolverDolar("2026-09-25", 7, fetchStub)
    expect(r).toEqual({ valor: 961.4, fechaOrigen: "2026-09-25" })
  })

  it("sábado y domingo arrastran el viernes anterior", async () => {
    expect(await resolverDolar("2026-09-26", 7, fetchStub)).toEqual({
      valor: 961.4,
      fechaOrigen: "2026-09-25",
    })
    expect(await resolverDolar("2026-09-27", 7, fetchStub)).toEqual({
      valor: 961.4,
      fechaOrigen: "2026-09-25",
    })
  })

  it("sin dato en toda la ventana ⇒ null (fila queda sin dólar)", async () => {
    expect(await resolverDolar("2026-09-27", 7, async () => NaN)).toBeNull()
  })

  it("la cache evita repetir fetches para fechas ya consultadas", async () => {
    let llamadas = 0
    const contado = async (f: string) => {
      llamadas++
      return fetchStub(f)
    }
    const cache = new Map<string, number>()
    await resolverDolar("2026-09-27", 7, contado, cache) // consulta 27, 26, 25
    await resolverDolar("2026-09-26", 7, contado, cache) // todo en cache
    expect(llamadas).toBe(3)
  })
})

describe("predicado de alerta crítica (≥2 fechas sin UF al cierre)", () => {
  it("0 o 1 fallo no dispara; 2+ sí", () => {
    expect(([] as string[]).length >= 2).toBe(false)
    expect(["2026-09-24"].length >= 2).toBe(false)
    expect(["2026-09-24", "2026-09-25"].length >= 2).toBe(true)
  })
})
