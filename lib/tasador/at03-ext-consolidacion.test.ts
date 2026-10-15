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
type Valor = string | number | null
type Tipo = "numero" | "texto" | "fecha"
type CandidatoGrupo = {
  prioridad: number
  fechaSubida?: string
  adjuntoId?: string
  codigoTipo?: string
  valores: Record<string, Valor>
}
type Declaracion = { codigoTipo: string; codigoAtributo: string; campo: string; prioridad: number }
type AdjuntoLeido = { id: string; clave: string; fechaSubida: string; items: Array<{ codigo_atributo: string; valor: unknown }> }
type Puro = {
  numeroConsolidable: (v: unknown) => number | null
  elegirGanador: (c: Candidato[]) => (Candidato & { valor: number }) | null
  decidirConsolidacion: (origen: unknown, actual: unknown, nuevo: number) => Decision
  itemsDeAtributos: (raw: string) => Array<{ codigo_atributo: string; valor: unknown }>
  fechaLeida: (v: unknown) => string | null
  tipoConsolidacion: (tipoCampo: string) => Tipo | null
  valorConsolidable: (tipo: Tipo, campo: string, v: unknown) => Valor
  elegirGanadorGrupo: (
    c: CandidatoGrupo[],
    campoVigencia: string | null,
  ) => (CandidatoGrupo & { vigencia: string | null }) | null
  decidirGrupo: (
    origen: unknown,
    actuales: Record<string, unknown>,
    nuevos: Record<string, Valor>,
    tolerancias?: Record<string, number>,
  ) => Decision
  toleranciaDePrecision: (p: unknown) => number
  candidatosDeGrupo: (a: AdjuntoLeido[], d: Declaracion[], t: Record<string, Tipo>) => CandidatoGrupo[]
}

const EXPORTADAS = [
  "numeroConsolidable",
  "elegirGanador",
  "decidirConsolidacion",
  "itemsDeAtributos",
  "fechaLeida",
  "tipoConsolidacion",
  "valorConsolidable",
  "elegirGanadorGrupo",
  "decidirGrupo",
  "toleranciaDePrecision",
  "candidatosDeGrupo",
]

function cargarBloquePuro(): Puro {
  const inicio = fuente.indexOf("// <consolidacion-puro>")
  const fin = fuente.indexOf("// </consolidacion-puro>")
  if (inicio < 0 || fin < inicio) throw new Error("No está el bloque <consolidacion-puro> en AT03-Ext_script.js")
  const bloque = fuente.slice(inicio, fin)
  return new Function(`${bloque}\nreturn { ${EXPORTADAS.join(", ")} }`)() as Puro
}

const {
  numeroConsolidable,
  elegirGanador,
  decidirConsolidacion,
  itemsDeAtributos,
  fechaLeida,
  tipoConsolidacion,
  valorConsolidable,
  elegirGanadorGrupo,
  decidirGrupo,
  toleranciaDePrecision,
  candidatosDeGrupo,
} = cargarBloquePuro()

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

/* ===========================================================================
 * v6 · grupos y vigencia (T-LEGALES-CONSOLIDADOS-20261015 · sección F)
 * ========================================================================= */

describe("v6 · valores leídos normalizados por tipo del campo destino", () => {
  it("tipo del campo Airtable → tipo de consolidación", () => {
    expect(tipoConsolidacion("number")).toBe("numero")
    expect(tipoConsolidacion("singleLineText")).toBe("texto")
    expect(tipoConsolidacion("date")).toBe("fecha")
    expect(tipoConsolidacion("singleSelect")).toBeNull()
    expect(tipoConsolidacion("multipleRecordLinks")).toBeNull()
  })

  it.each([
    ["2020-09-09", "2020-09-09"],
    ["09/09/2020", "2020-09-09"],
    ["9-9-2020", "2020-09-09"],
    ["18.07.2024", "2024-07-18"],
    ["2024-07-18T00:00:00.000Z", "2024-07-18"],
  ])("fecha %s → %s", (entrada, esperado) => {
    expect(fechaLeida(entrada)).toBe(esperado)
  })

  it.each([["31/13/2020"], ["2020"], [""], [20200909], ["s/f"]])("fecha %s → null", (entrada) => {
    expect(fechaLeida(entrada)).toBeNull()
  })

  it("texto: número → texto, vacío y NO REGISTRA no compiten", () => {
    expect(valorConsolidable("texto", "fojas", 3312)).toBe("3312")
    expect(valorConsolidable("texto", "fojas", " 3312 ")).toBe("3312")
    expect(valorConsolidable("texto", "fojas", "")).toBeNull()
    expect(valorConsolidable("texto", "fojas", "NO REGISTRA")).toBeNull()
  })

  it("coordenadas: negativas válidas en rango; UTM o cero no compiten", () => {
    expect(valorConsolidable("numero", "lat", -33.23458)).toBe(-33.23458)
    expect(valorConsolidable("numero", "long", "-70,675087")).toBe(-70.675087)
    expect(valorConsolidable("numero", "lat", 6322500)).toBeNull()
    expect(valorConsolidable("numero", "long", 0)).toBeNull()
  })

  it("los demás números siguen exigiendo > 0 (superficies, años)", () => {
    expect(valorConsolidable("numero", "ano_inscripcion", "2020")).toBe(2020)
    expect(valorConsolidable("numero", "sup_construccion_m2", -3)).toBeNull()
  })

  it("tolerancia de igualdad = media unidad de la precisión del campo", () => {
    expect(toleranciaDePrecision(2)).toBeCloseTo(0.005)
    expect(toleranciaDePrecision(6)).toBeCloseTo(0.0000005)
    expect(toleranciaDePrecision(undefined)).toBe(0.005)
  })
})

/** Declaraciones propuestas en DISENO.md §2.1 (prioridad_destino · grupo_destino · vigencia_destino). */
const INSCRIPCION: Declaracion[] = [
  { codigoTipo: "certificado_dominio_vigente", codigoAtributo: "foja", campo: "fojas", prioridad: 10 },
  { codigoTipo: "certificado_dominio_vigente", codigoAtributo: "numero", campo: "numero_inscripcion", prioridad: 10 },
  { codigoTipo: "certificado_dominio_vigente", codigoAtributo: "ano", campo: "ano_inscripcion", prioridad: 10 },
  { codigoTipo: "inscripcion_dominio_cbr", codigoAtributo: "foja_cbr", campo: "fojas", prioridad: 20 },
  { codigoTipo: "inscripcion_dominio_cbr", codigoAtributo: "numero_cbr", campo: "numero_inscripcion", prioridad: 20 },
  { codigoTipo: "inscripcion_dominio_cbr", codigoAtributo: "ano_inscripcion_cbr", campo: "ano_inscripcion", prioridad: 20 },
  { codigoTipo: "escritura_compraventa", codigoAtributo: "foja_inscripcion", campo: "fojas", prioridad: 30 },
  { codigoTipo: "escritura_compraventa", codigoAtributo: "numero_inscripcion", campo: "numero_inscripcion", prioridad: 30 },
  { codigoTipo: "escritura_compraventa", codigoAtributo: "ano_inscripcion", campo: "ano_inscripcion", prioridad: 30 },
  { codigoTipo: "foto_fuente_sii", codigoAtributo: "foja_dominio", campo: "fojas", prioridad: 40 },
  { codigoTipo: "foto_fuente_sii", codigoAtributo: "numero_dominio", campo: "numero_inscripcion", prioridad: 40 },
  { codigoTipo: "foto_fuente_sii", codigoAtributo: "anio_dominio", campo: "ano_inscripcion", prioridad: 40 },
]
const TIPOS_INSCRIPCION: Record<string, Tipo> = { fojas: "texto", numero_inscripcion: "texto", ano_inscripcion: "numero" }

/** VP-2026-0079: lo que leyó la foto SII (14-oct) y lo que trae la escritura «Fojas 3312» al releerla. */
const FOTO_SII_0079: AdjuntoLeido = {
  id: "recaUNfATRbxSYdnS",
  clave: "foto_fuente_sii",
  fechaSubida: "2026-10-14T18:44:51.000Z",
  items: [
    { codigo_atributo: "numero_dominio", valor: "21565" },
    { codigo_atributo: "foja_dominio", valor: "13291" },
    { codigo_atributo: "anio_dominio", valor: 2006 },
    { codigo_atributo: "destino_sii", valor: "Sitio Eriazo" },
  ],
}
const ESCRITURA_0079: AdjuntoLeido = {
  id: "rec2p6QpeesQ0w2SW",
  clave: "escritura_compraventa",
  fechaSubida: "2026-10-14T18:43:27.000Z",
  items: [
    { codigo_atributo: "foja_inscripcion", valor: "3312" },
    { codigo_atributo: "numero_inscripcion", valor: "4663" },
    { codigo_atributo: "ano_inscripcion", valor: 2020 },
  ],
}

function ganadorInscripcion(adjuntos: AdjuntoLeido[]) {
  return elegirGanadorGrupo(candidatosDeGrupo(adjuntos, INSCRIPCION, TIPOS_INSCRIPCION), "ano_inscripcion")
}

describe("v6 · inscripción de dominio vigente (grupo foja · número · año)", () => {
  it("VP-2026-0079: la escritura 2020 vence a la foto SII 2006 aunque la foto tenga otra prioridad y se haya subido después", () => {
    const g = ganadorInscripcion([FOTO_SII_0079, ESCRITURA_0079])
    expect(g?.codigoTipo).toBe("escritura_compraventa")
    expect(g?.valores).toEqual({ fojas: "3312", numero_inscripcion: "4663", ano_inscripcion: 2020 })
  })

  it("el resultado no depende del orden de los adjuntos", () => {
    expect(ganadorInscripcion([ESCRITURA_0079, FOTO_SII_0079])?.adjuntoId).toBe("rec2p6QpeesQ0w2SW")
  })

  it("sólo la foto SII: queda la inscripción que trae (lo de hoy)", () => {
    expect(ganadorInscripcion([FOTO_SII_0079])?.valores).toEqual({
      fojas: "13291",
      numero_inscripcion: "21565",
      ano_inscripcion: 2006,
    })
  })

  it("los tres campos salen de UN documento: nunca la foja de uno con el año de otro", () => {
    const escrituraSinNumero: AdjuntoLeido = {
      ...ESCRITURA_0079,
      items: ESCRITURA_0079.items.filter((i) => i.codigo_atributo !== "numero_inscripcion"),
    }
    const g = ganadorInscripcion([FOTO_SII_0079, escrituraSinNumero])
    expect(g?.valores).toEqual({ fojas: "3312", numero_inscripcion: null, ano_inscripcion: 2020 })
  })

  it("mismo año: decide la naturaleza del documento (certificado de dominio vigente > CBR > escritura > SII)", () => {
    const cbr: AdjuntoLeido = {
      id: "recCbr",
      clave: "inscripcion_dominio_cbr",
      fechaSubida: "2026-10-01T00:00:00.000Z",
      items: [
        { codigo_atributo: "foja_cbr", valor: "3312" },
        { codigo_atributo: "numero_cbr", valor: "4663" },
        { codigo_atributo: "ano_inscripcion_cbr", valor: 2020 },
      ],
    }
    expect(ganadorInscripcion([ESCRITURA_0079, cbr])?.codigoTipo).toBe("inscripcion_dominio_cbr")
  })

  it("un documento sin año compite después de los que sí lo traen", () => {
    const sinAnio: AdjuntoLeido = {
      id: "recCert",
      clave: "certificado_dominio_vigente",
      fechaSubida: "2026-10-15T00:00:00.000Z",
      items: [{ codigo_atributo: "foja", valor: "9999" }],
    }
    expect(ganadorInscripcion([sinAnio, FOTO_SII_0079])?.adjuntoId).toBe("recaUNfATRbxSYdnS")
  })

  it("un documento con una inscripción más reciente actualiza el grupo (la fila la escribió la lectura)", () => {
    const actual = { fojas: "13291", numero_inscripcion: "21565", ano_inscripcion: 2006 }
    const g = ganadorInscripcion([FOTO_SII_0079, ESCRITURA_0079])!
    expect(decidirGrupo("extraido_rf09", actual, g.valores)).toBe("escribir")
  })

  it("re-disparar con el mismo conjunto de documentos no escribe", () => {
    const g = ganadorInscripcion([FOTO_SII_0079, ESCRITURA_0079])!
    const guardado = { fojas: "3312", numero_inscripcion: "4663", ano_inscripcion: 2020 }
    expect(decidirGrupo("extraido_rf09", guardado, g.valores)).toBe("sin_cambios")
  })

  it("lo que guardó el tasador no se toca", () => {
    const g = ganadorInscripcion([FOTO_SII_0079, ESCRITURA_0079])!
    expect(decidirGrupo("tipeado", { fojas: "1", numero_inscripcion: "2", ano_inscripcion: 2001 }, g.valores)).toBe(
      "skip_tipeado",
    )
  })

  it("fila sin origen_dato: rellena vacíos, pero no contradice lo que ya tiene", () => {
    const g = ganadorInscripcion([FOTO_SII_0079, ESCRITURA_0079])!
    expect(decidirGrupo("", { fojas: null, numero_inscripcion: "", ano_inscripcion: null }, g.valores)).toBe("escribir")
    expect(decidirGrupo("", { fojas: "3312", numero_inscripcion: null, ano_inscripcion: 2020 }, g.valores)).toBe(
      "escribir",
    )
    expect(
      decidirGrupo("", { fojas: "13291", numero_inscripcion: "21565", ano_inscripcion: 2006 }, g.valores),
    ).toBe("skip_origen_desconocido")
  })
})

describe("v6 · permiso de edificación (grupo número · fecha, vigencia = fecha)", () => {
  const PERMISO: Declaracion[] = [
    { codigoTipo: "permiso_edificacion", codigoAtributo: "numero_permiso", campo: "permiso_edificacion_numero", prioridad: 10 },
    { codigoTipo: "permiso_edificacion", codigoAtributo: "fecha_permiso", campo: "permiso_edificacion_fecha", prioridad: 10 },
    { codigoTipo: "escritura_compraventa", codigoAtributo: "numero_permiso_edificacion", campo: "permiso_edificacion_numero", prioridad: 20 },
    { codigoTipo: "escritura_compraventa", codigoAtributo: "fecha_permiso_edificacion", campo: "permiso_edificacion_fecha", prioridad: 20 },
  ]
  const TIPOS: Record<string, Tipo> = { permiso_edificacion_numero: "texto", permiso_edificacion_fecha: "fecha" }
  const permiso0079: AdjuntoLeido = {
    id: "recHHXRgtheOwKPhp",
    clave: "permiso_edificacion",
    fechaSubida: "2026-10-14T18:47:06.000Z",
    items: [
      { codigo_atributo: "numero_permiso", valor: "319-2020" },
      { codigo_atributo: "fecha_permiso", valor: "2020-09-09" },
    ],
  }

  it("VP-2026-0079: queda el permiso leído; la fecha en formato Airtable", () => {
    const g = elegirGanadorGrupo(candidatosDeGrupo([permiso0079], PERMISO, TIPOS), "permiso_edificacion_fecha")
    expect(g?.valores).toEqual({ permiso_edificacion_numero: "319-2020", permiso_edificacion_fecha: "2020-09-09" })
    expect(
      decidirGrupo(
        "",
        { permiso_edificacion_numero: "319-2020", permiso_edificacion_fecha: "2020-09-09" },
        g!.valores,
      ),
    ).toBe("sin_cambios")
  })

  it("un permiso posterior (p. ej. una modificación) es el dato vigente", () => {
    const modificacion: AdjuntoLeido = {
      id: "recMod",
      clave: "escritura_compraventa",
      fechaSubida: "2026-10-01T00:00:00.000Z",
      items: [
        { codigo_atributo: "numero_permiso_edificacion", valor: "88" },
        { codigo_atributo: "fecha_permiso_edificacion", valor: "15/03/2022" },
      ],
    }
    const g = elegirGanadorGrupo(candidatosDeGrupo([permiso0079, modificacion], PERMISO, TIPOS), "permiso_edificacion_fecha")
    expect(g?.valores).toEqual({ permiso_edificacion_numero: "88", permiso_edificacion_fecha: "2022-03-15" })
  })
})

describe("v6 · coordenadas (grupo lat · long, sin vigencia)", () => {
  const COORD: Declaracion[] = [
    { codigoTipo: "mapa_sii", codigoAtributo: "latitud", campo: "lat", prioridad: 10 },
    { codigoTipo: "mapa_sii", codigoAtributo: "longitud", campo: "long", prioridad: 10 },
    { codigoTipo: "informe_no_expropiacion_serviu", codigoAtributo: "latitud", campo: "lat", prioridad: 20 },
    { codigoTipo: "informe_no_expropiacion_serviu", codigoAtributo: "longitud", campo: "long", prioridad: 20 },
  ]
  const TIPOS: Record<string, Tipo> = { lat: "numero", long: "numero" }
  const mapa0079: AdjuntoLeido = {
    id: "recyCKnUjft9WilnL",
    clave: "mapa_sii",
    fechaSubida: "2026-10-14T18:57:23.000Z",
    items: [
      { codigo_atributo: "rol_predial", valor: "882-40" },
      { codigo_atributo: "latitud", valor: -33.23458 },
      { codigo_atributo: "longitud", valor: -70.675087 },
    ],
  }
  const serviu0079: AdjuntoLeido = {
    id: "rec59FVpgAcoYv5Mq",
    clave: "informe_no_expropiacion_serviu",
    fechaSubida: "2026-10-14T18:49:55.000Z",
    items: [{ codigo_atributo: "numero_documento", valor: "3444743" }],
  }

  it("VP-2026-0079: las del mapa SII; el informe SERVIU no las trae y no compite", () => {
    const g = elegirGanadorGrupo(candidatosDeGrupo([serviu0079, mapa0079], COORD, TIPOS), null)
    expect(g?.valores).toEqual({ lat: -33.23458, long: -70.675087 })
  })

  it("con precisión 6 la idempotencia es exacta; un cambio de ~100 m sí actualiza", () => {
    const tol = { lat: toleranciaDePrecision(6), long: toleranciaDePrecision(6) }
    const nuevos = { lat: -33.23458, long: -70.675087 }
    expect(decidirGrupo("extraido_rf09", { lat: -33.23458, long: -70.675087 }, nuevos, tol)).toBe("sin_cambios")
    expect(decidirGrupo("extraido_rf09", { lat: -33.2337, long: -70.675087 }, nuevos, tol)).toBe("escribir")
  })

  it("un documento con coordenadas UTM en vez de grados no compite", () => {
    const utm: AdjuntoLeido = {
      ...serviu0079,
      items: [
        { codigo_atributo: "latitud", valor: 6322500 },
        { codigo_atributo: "longitud", valor: 345000 },
      ],
    }
    expect(elegirGanadorGrupo(candidatosDeGrupo([utm], COORD, TIPOS), null)).toBeNull()
  })
})
