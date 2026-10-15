import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * AT03-Ext v5 · consolidación por precedencia (T-SUPERFICIES-CONSOLIDADAS-20261014).
 *
 * El script vive en Airtable Scripting (`docs/_artefactos/airtable/AT03-Ext_script.js`)
 * y no es importable por `@/`. A diferencia de los tests de PORT del motor, aquí no
 * se replica la lógica: se extrae del archivo el bloque `<consolidacion-puro>` —sin
 * dependencias de Airtable— y se ejecuta tal cual. Si alguien cambia el script, este
 * test prueba el cambio; no hay copia que pueda quedar desfasada.
 */

const RUTA_SCRIPT = resolve(__dirname, "../../docs/_artefactos/airtable/AT03-Ext_script.js")
const fuente = readFileSync(RUTA_SCRIPT, "utf8")

type Candidato = {
  prioridad: number
  fechaSubida?: string
  adjuntoId?: string
  codigoTipo?: string
  valor: unknown
}
type Decision = "skip_tipeado" | "escribir" | "sin_cambios" | "skip_origen_desconocido"
type Puro = {
  numeroConsolidable: (v: unknown) => number | null
  elegirGanador: (c: Candidato[]) => (Candidato & { valor: number }) | null
  decidirConsolidacion: (origen: unknown, actual: unknown, nuevo: number) => Decision
  itemsDeAtributos: (raw: string) => Array<{ codigo_atributo: string; valor: unknown }>
}

function cargarBloquePuro(): Puro {
  const inicio = fuente.indexOf("// <consolidacion-puro>")
  const fin = fuente.indexOf("// </consolidacion-puro>")
  if (inicio < 0 || fin < inicio) throw new Error("No está el bloque <consolidacion-puro> en AT03-Ext_script.js")
  const bloque = fuente.slice(inicio, fin)
  return new Function(
    `${bloque}\nreturn { numeroConsolidable, elegirGanador, decidirConsolidacion, itemsDeAtributos }`,
  )() as Puro
}

const { numeroConsolidable, elegirGanador, decidirConsolidacion, itemsDeAtributos } = cargarBloquePuro()

/** Prioridades aprobadas por Sergio el 14-oct-2026 (D_TipoDocumentoAtributo.prioridad_destino). */
const P = {
  cuadro_superficies: 10,
  foto_plano_cuadro_superficies: 20,
  certificado_recepcion_final: 30,
  permiso_edificacion: 40,
  consulta_antecedentes_bien_raiz: 50,
} as const

/** Lo que leyó la IA en VP-2026-0079 (TX_Adjuntos.atributos_obtenidos, 14-oct-2026). */
const VP0079: Candidato[] = [
  { prioridad: P.certificado_recepcion_final, fechaSubida: "2026-10-14T18:48:00.000Z", adjuntoId: "rec0wJpV72OjIXu5D", codigoTipo: "certificado_recepcion_final", valor: 249.31 },
  { prioridad: P.permiso_edificacion, fechaSubida: "2026-10-14T18:47:00.000Z", adjuntoId: "recHHXRgtheOwKPhp", codigoTipo: "permiso_edificacion", valor: 249.91 },
  { prioridad: P.cuadro_superficies, fechaSubida: "2026-10-14T18:53:00.000Z", adjuntoId: "recCjcimhqQMFrQjM", codigoTipo: "cuadro_superficies", valor: 249.91 },
]

describe("AT03-Ext v5 · el script completo compila", () => {
  it("parsea como cuerpo de función async (top-level await y return de Airtable)", () => {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
    expect(() => new AsyncFunction(fuente)).not.toThrow()
  })
})

describe("numeroConsolidable · qué cuenta como superficie leída", () => {
  it.each([
    [249.91, 249.91],
    ["249.91", 249.91],
    ["249,91", 249.91],
    ["1.402,35", 1402.35],
    ["249,91 m²", 249.91],
    ["5024.86 m2", 5024.86],
  ])("%s → %s", (entrada, esperado) => {
    expect(numeroConsolidable(entrada)).toBe(esperado)
  })

  it.each([["NO REGISTRA"], [""], [0], [-3], [null], [undefined], ["s/i"], [Number.NaN], [true]])(
    "%s → null (no compite)",
    (entrada) => {
      expect(numeroConsolidable(entrada)).toBeNull()
    },
  )
})

describe("elegirGanador · precedencia", () => {
  it("VP-2026-0079: gana el cuadro (249.91) aunque la recepción final haya leído 249.31", () => {
    const g = elegirGanador(VP0079)
    expect(g?.valor).toBe(249.91)
    expect(g?.codigoTipo).toBe("cuadro_superficies")
  })

  it("el resultado no depende del orden en que se leyeron los documentos", () => {
    const permutaciones = [
      [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
    ].map((orden) => orden.map((i) => VP0079[i]))
    const ganadores = permutaciones.map((c) => elegirGanador(c)?.adjuntoId)
    expect(new Set(ganadores)).toEqual(new Set(["recCjcimhqQMFrQjM"]))
  })

  it("sin cuadro, el orden aprobado decide: recepción (30) antes que permiso (40)", () => {
    expect(elegirGanador(VP0079.filter((c) => c.codigoTipo !== "cuadro_superficies"))?.valor).toBe(249.31)
  })

  it("un documento prioritario sin número válido no bloquea: pasa al siguiente", () => {
    const g = elegirGanador([
      { prioridad: P.foto_plano_cuadro_superficies, adjuntoId: "recPlano", valor: "NO REGISTRA" },
      { prioridad: P.permiso_edificacion, adjuntoId: "recPermiso", valor: "180,5" },
    ])
    expect(g?.adjuntoId).toBe("recPermiso")
    expect(g?.valor).toBe(180.5)
  })

  it("dos documentos del mismo tipo: gana el subido más reciente", () => {
    const g = elegirGanador([
      { prioridad: 10, fechaSubida: "2026-10-01T10:00:00.000Z", adjuntoId: "recViejo", valor: 200 },
      { prioridad: 10, fechaSubida: "2026-10-14T10:00:00.000Z", adjuntoId: "recNuevo", valor: 210 },
    ])
    expect(g?.valor).toBe(210)
  })

  it("ningún documento trae número → null (no se escribe ni se borra nada)", () => {
    expect(elegirGanador([])).toBeNull()
    expect(elegirGanador([{ prioridad: 10, valor: "NO REGISTRA" }])).toBeNull()
  })
})

describe("decidirConsolidacion · idempotencia y no pisar al tasador", () => {
  it("campo vacío → escribir", () => {
    expect(decidirConsolidacion("extraido_rf09", null, 249.91)).toBe("escribir")
    expect(decidirConsolidacion("", undefined, 249.91)).toBe("escribir")
  })

  it("fila guardada por el tasador (origen_dato=tipeado) → nunca se toca", () => {
    expect(decidirConsolidacion("tipeado", null, 249.91)).toBe("skip_tipeado")
    expect(decidirConsolidacion("Tipeado", 120, 249.91)).toBe("skip_tipeado")
  })

  it("mismo valor → sin_cambios (re-leer no escribe)", () => {
    expect(decidirConsolidacion("extraido_rf09", 249.91, 249.91)).toBe("sin_cambios")
    expect(decidirConsolidacion("extraido_rf09", 249.914, 249.91)).toBe("sin_cambios")
  })

  it("valor distinto que escribió la propia lectura → se corrige al ganador", () => {
    expect(decidirConsolidacion("extraido_rf09", 249.31, 249.91)).toBe("escribir")
  })

  it("valor distinto de origen desconocido (fila antigua sin origen_dato) → no se pisa", () => {
    expect(decidirConsolidacion("", 120, 249.91)).toBe("skip_origen_desconocido")
    expect(decidirConsolidacion(null, 120, 249.91)).toBe("skip_origen_desconocido")
  })

  it("dos corridas seguidas sobre el mismo conjunto de documentos: escribe una vez y después nada", () => {
    let fila: { origen: string; valor: number | null } = { origen: "extraido_rf09", valor: null }
    const escrituras: number[] = []
    for (let corrida = 0; corrida < 2; corrida++) {
      const g = elegirGanador(VP0079)!
      if (decidirConsolidacion(fila.origen, fila.valor, g.valor) === "escribir") {
        fila = { origen: "extraido_rf09", valor: g.valor }
        escrituras.push(g.valor)
      }
    }
    expect(escrituras).toEqual([249.91])
    expect(fila.valor).toBe(249.91)
  })
})

describe("itemsDeAtributos · forma real de TX_Adjuntos.atributos_obtenidos", () => {
  it("lee el {items:[…]} que guarda SC-RF09 (cuadro de VP-2026-0079)", () => {
    const raw = JSON.stringify({
      items: [
        { codigo_atributo: "superficie_primer_piso_m2", valor: 249.91, confianza: 1, fila: 1 },
        { codigo_atributo: "superficie_construida_m2", valor: 249.91, confianza: 1, fila: 1 },
      ],
      no_extraidos: ["superficie_bodega_m2"],
    })
    expect(itemsDeAtributos(raw).map((i) => i.codigo_atributo)).toEqual([
      "superficie_primer_piso_m2",
      "superficie_construida_m2",
    ])
  })

  it("array plano también; JSON inválido o vacío → []", () => {
    expect(itemsDeAtributos('[{"codigo_atributo":"x","valor":1}]')).toHaveLength(1)
    expect(itemsDeAtributos("{no es json")).toEqual([])
    expect(itemsDeAtributos("")).toEqual([])
  })
})
