import { describe, it, expect } from "vitest"

/**
 * Tests de INTEGRACIÓN (PORT) — T-AUDIT-CLOSE-20260923.
 *
 * Los motores viven en Airtable Automations (AT01 desplegado; AT08 en DRAFT
 * dry-run tras esta tanda), no importables por `@/`. Se portan las decisiones
 * clave y se verifican como contrato. No hay llamadas a la base productiva
 * (regla CLAUDE.md: nunca escribir a Airtable en tests).
 */

/* ============================ AT01 · resolver motor de reglas ================
 * Port de la especificidad + idempotencia (AT01_v32 live, sección 4-6). */
type Regla = { id: string; cliente?: string; comuna?: string; prioridad: number }
type Ctx = { cliente: string; comuna: string }
const matchText = (r: string | undefined, c: string): boolean => {
  if (!r) return true
  const a = r.toLowerCase().trim()
  const b = (c || "").toLowerCase().trim()
  return a === b || b.indexOf(a) >= 0 || a.indexOf(b) >= 0
}
function especificidad(regla: Regla, ctx: Ctx): { match: boolean; score: number } {
  let score = 0
  if (regla.cliente) {
    if (matchText(regla.cliente, ctx.cliente)) score += 1
    else return { match: false, score: 0 }
  }
  if (regla.comuna) {
    if (matchText(regla.comuna, ctx.comuna)) score += 2
    else return { match: false, score: 0 }
  }
  return { match: true, score }
}
function resolver(reglas: Regla[], ctx: Ctx, reglaActual: string | null) {
  const cand = reglas
    .map((r) => ({ r, ...especificidad(r, ctx) }))
    .filter((c) => c.match)
    .sort((a, b) => b.score - a.score || b.r.prioridad - a.r.prioridad)
  if (cand.length === 0) return { estado: "requiere_atencion", ganadora: null as string | null }
  const ganadora = cand[0].r.id
  if (reglaActual && reglaActual === ganadora)
    return { estado: "idempotente_omitido", ganadora }
  return { estado: "regla_aplicada_ok", ganadora }
}

describe("I-AT01 · resolver motor de reglas (port AT01_v32)", () => {
  const reglas: Regla[] = [
    { id: "R_wild", prioridad: 0 },
    { id: "R_metlife", cliente: "MetLife", prioridad: 5 },
    { id: "R_metlife_colina", cliente: "MetLife", comuna: "Colina", prioridad: 5 },
  ]
  it("I-AT01-01: comuna suma +2 → gana la regla más específica", () => {
    const r = resolver(reglas, { cliente: "MetLife", comuna: "Colina" }, null)
    expect(r.ganadora).toBe("R_metlife_colina")
    expect(r.estado).toBe("regla_aplicada_ok")
  })
  it("I-AT01-02: sin regla que matchee → requiere_atencion", () => {
    const r = resolver([{ id: "R_x", cliente: "Banco X", prioridad: 5 }], {
      cliente: "MetLife",
      comuna: "Colina",
    }, null)
    expect(r.estado).toBe("requiere_atencion")
    expect(r.ganadora).toBeNull()
  })
  it("I-AT01-03: regla_aplicada ya == ganadora → idempotente_omitido", () => {
    const r = resolver(reglas, { cliente: "MetLife", comuna: "Colina" }, "R_metlife_colina")
    expect(r.estado).toBe("idempotente_omitido")
  })
})

/* ============================ AT08 · alertas SLA (DRAFT dry-run) =============
 * Port de las 3 correcciones de esta tanda (plan §8): clave_notif idempotente,
 * lee sla_semaforo_etapa (RO-05, no recomputa), DRY_RUN no envía. */
const claveNotif = (codigo: string, etapa: number, yyyymmdd: string) =>
  `AT08_${codigo}_${etapa}_${yyyymmdd}`

function emitirAlerta(opts: {
  dryRun: boolean
  clave: string
  emitidas: Set<string>
  slaSemaforoEtapa: string // se LEE, no se recomputa
}): { sent: boolean; reason: string } {
  const { dryRun, clave, emitidas, slaSemaforoEtapa } = opts
  if (slaSemaforoEtapa !== "ambar" && slaSemaforoEtapa !== "rojo")
    return { sent: false, reason: "verde" }
  if (emitidas.has(clave)) return { sent: false, reason: "idempotente" } // M-18
  if (dryRun) return { sent: false, reason: "dry_run" }
  return { sent: true, reason: "enviada" }
}

describe("I-AT08 · alertas SLA (clave_notif + sla_semaforo_etapa + dry-run)", () => {
  it("I-AT08-01: misma clave_notif ya emitida → idempotente (no duplica · M-18)", () => {
    const clave = claveNotif("VP-2026-0066", 2, "20260923")
    const r = emitirAlerta({
      dryRun: false,
      clave,
      emitidas: new Set([clave]),
      slaSemaforoEtapa: "ambar",
    })
    expect(r).toEqual({ sent: false, reason: "idempotente" })
  })
  it("I-AT08-02: lee sla_semaforo_etapa=verde → no alerta (RO-05, no recomputa)", () => {
    const r = emitirAlerta({
      dryRun: false,
      clave: claveNotif("VP-2026-0067", 2, "20260923"),
      emitidas: new Set(),
      slaSemaforoEtapa: "verde",
    })
    expect(r.reason).toBe("verde")
  })
  it("I-AT08-03: DRY_RUN=true con semáforo ámbar → NO envía (primer disparo)", () => {
    const r = emitirAlerta({
      dryRun: true,
      clave: claveNotif("VP-2026-0066", 2, "20260923"),
      emitidas: new Set(),
      slaSemaforoEtapa: "ambar",
    })
    expect(r).toEqual({ sent: false, reason: "dry_run" })
  })
})

/* ============================ I-CALC-409 · guard de asignación única =========
 * Port RN-59/§1.3.1: asignación única, sin reasignación; el server revalida 409
 * si ya hay tasador fijado. */
const puedeAsignar = (tasadorActual: string[] | null): boolean =>
  !(Array.isArray(tasadorActual) && tasadorActual.length > 0)

describe("I-CALC-409 · asignación única (409 si ya hay tasador)", () => {
  it("sin tasador → permite asignar; con tasador → 409", () => {
    expect(puedeAsignar(null)).toBe(true)
    expect(puedeAsignar([])).toBe(true)
    expect(puedeAsignar(["recTas1"])).toBe(false)
  })
})

/* ============================ S-H9 · C_VariablesCliente (EAV) ================
 * Smoke del dato maestro logo/revisor por cliente (tabla EAV clave/valor/link). */
type VarCliente = { clave: string; valor: string; clienteId: string }
function resolverVar(rows: VarCliente[], clienteId: string, clave: string): string | undefined {
  return rows.find((r) => r.clienteId === clienteId && r.clave === clave)?.valor
}

describe("S-H9 · logo/revisor por cliente (C_VariablesCliente EAV)", () => {
  const rows: VarCliente[] = [
    { clave: "logo_url", valor: "https://cdn/metlife.png", clienteId: "recMet" },
    { clave: "nombre_revisor", valor: "Nelcy Jaimes", clienteId: "recMet" },
  ]
  it("resuelve logo_url y nombre_revisor del cliente; clave ausente → undefined", () => {
    expect(resolverVar(rows, "recMet", "logo_url")).toBe("https://cdn/metlife.png")
    expect(resolverVar(rows, "recMet", "nombre_revisor")).toBe("Nelcy Jaimes")
    expect(resolverVar(rows, "recOtro", "logo_url")).toBeUndefined()
  })
})
