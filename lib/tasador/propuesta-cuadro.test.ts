import { describe, expect, it } from "vitest"
import {
  itemsSinUfM2,
  proponerCuadro,
  type EntradaPropuestaCuadro,
  type UnidadPropuesta,
} from "./propuesta-cuadro"

function unidad(over: Partial<UnidadPropuesta> = {}): UnidadPropuesta {
  return {
    subtipo: "Casa",
    rolSii: "882-40",
    supM2: "249.91",
    anioConstruccion: "2024",
    tipoMaterial: "albanileria",
    origenSuperficie: "plano",
    numeroUnidad: "Casa N°2100",
    detalleItem: "",
    conRolOUsoYGoce: "con_rol",
    esPrincipal: false,
    ...over,
  }
}

/** VP-2026-0079 (réplica MET-6283) tal como lo proyecta `lectura-datos.ts` el 14-oct-2026. */
function vp0079(over: Partial<EntradaPropuestaCuadro> = {}): EntradaPropuestaCuadro {
  return {
    supTerreno: "5024.86",
    servidumbreM2: "3622.51",
    supConstruida: "249.91",
    supPrimerPiso: "249.91",
    pisos: "",
    anioConstruccion: "2024",
    materialPredominante: "Albañilería",
    estadoConservacion: "BUENO",
    recepcionFinalNumero: "210-2024",
    unidades: [unidad()],
    ...over,
  }
}

describe("proponerCuadro · VP-2026-0079 (MET-6283)", () => {
  const items = proponerCuadro(vp0079())

  it("propone Terreno, Servidumbre y Piso 1, en el orden de la planilla", () => {
    expect(items.map((i) => [i.descripcion, i.subtipo, i.tipo, i.superficieM2])).toEqual([
      ["Terreno", "Terreno", "Terreno", "1402.35"],
      ["Servidumbre", "Terreno", "Terreno", "3622.51"],
      ["Piso 1", "Edificacion", "Edificacion", "249.91"],
    ])
  })

  it("trae rol, situación y origen de los documentos; año, estado y material sólo en la edificación", () => {
    for (const i of items) {
      expect(i.rolSii).toBe("882-40")
      expect(i.situacionMunicipal).toBe("Regularizado")
      expect(i.origenSuperficie).toBe("plano")
      expect(i.aportaGarantia).toBe(true)
      expect(i.factorAplicado).toBe("1")
    }
    const [terreno, , piso1] = items
    expect([terreno.anioItem, terreno.estado, terreno.materialItem]).toEqual(["", "", ""])
    expect([piso1.anioItem, piso1.estado, piso1.materialItem]).toEqual(["2024", "Bueno", "Albanileria"])
  })

  it("no inventa el UF/m²: es criterio del tasador", () => {
    expect(items.every((i) => i.ufM2Unitario === "")).toBe(true)
  })

  it("es determinista: dos aperturas dan el mismo cuadro, con los mismos ids", () => {
    expect(proponerCuadro(vp0079())).toEqual(items)
    expect(items.map((i) => i.id)).toEqual(["it-prop-1", "it-prop-2", "it-prop-3"])
  })
})

describe("proponerCuadro · variantes", () => {
  it("sin servidumbre, una sola fila de terreno con la superficie completa", () => {
    const items = proponerCuadro(vp0079({ servidumbreM2: "" }))
    expect(items.filter((i) => i.tipo === "Terreno").map((i) => [i.descripcion, i.superficieM2])).toEqual([
      ["Terreno", "5024.86"],
    ])
  })

  it("casa de dos pisos: Piso 1 con la de primer piso y Piso 2 con el resto", () => {
    const items = proponerCuadro(vp0079({ supConstruida: "180", supPrimerPiso: "100", pisos: "2" }))
    expect(items.filter((i) => i.tipo === "Edificacion").map((i) => [i.descripcion, i.superficieM2])).toEqual([
      ["Piso 1", "100"],
      ["Piso 2", "80"],
    ])
  })

  it("sin recepción final no afirma la situación municipal", () => {
    expect(proponerCuadro(vp0079({ recepcionFinalNumero: "" })).every((i) => i.situacionMunicipal === "")).toBe(true)
  })

  it("estado del inmueble fuera del catálogo del ítem queda vacío", () => {
    const piso1 = proponerCuadro(vp0079({ estadoConservacion: "NUEVO - S/USO" })).find((i) => i.descripcion === "Piso 1")
    expect(piso1?.estado).toBe("")
  })

  it("departamento con bodega y estacionamiento de uso y goce: sin terreno, una fila por unidad", () => {
    const items = proponerCuadro(
      vp0079({
        supTerreno: "1200",
        servidumbreM2: "",
        supConstruida: "72.5",
        supPrimerPiso: "",
        materialPredominante: "",
        unidades: [
          unidad({ subtipo: "Departamento", numeroUnidad: "Departamento N° 102", rolSii: "1200-12", tipoMaterial: "hormigon", esPrincipal: true, supM2: "70" }),
          unidad({ subtipo: "Bodega", numeroUnidad: "", rolSii: "1200-80", supM2: "4.2" }),
          unidad({ subtipo: "Estacionamiento", numeroUnidad: "E-15", rolSii: "", supM2: "12.5", conRolOUsoYGoce: "uso_y_goce" }),
        ],
      }),
    )
    expect(items.map((i) => [i.descripcion, i.subtipo, i.tipo, i.rolSii, i.superficieM2])).toEqual([
      ["Departamento N° 102", "Edificacion", "Edificacion", "1200-12", "72.5"],
      ["Bodega", "Bodega", "Bodega", "1200-80", "4.2"],
      ["E-15", "Estac U/Goce", "Estac. U/Goce", "", "12.5"],
    ])
    expect(items[0].materialItem).toBe("Hormigon armado")
  })

  it("las unidades de terreno o servidumbre no duplican las filas que salen de la sección B", () => {
    const items = proponerCuadro(
      vp0079({ unidades: [unidad({ esPrincipal: true }), unidad({ subtipo: "Servidumbre", supM2: "3622.51" })] }),
    )
    expect(items.filter((i) => i.descripcion === "Servidumbre")).toHaveLength(1)
  })

  it("una terraza propuesta no aporta a garantía (RN-09)", () => {
    const items = proponerCuadro(vp0079({ unidades: [unidad(), unidad({ subtipo: "Terraza", supM2: "20" })] }))
    expect(items.find((i) => i.tipo === "Terraza")?.aportaGarantia).toBe(false)
  })

  it("sin superficies ni unidades no propone nada", () => {
    expect(
      proponerCuadro(vp0079({ supTerreno: "", servidumbreM2: "", supConstruida: "", unidades: [] })),
    ).toEqual([])
  })
})

describe("itemsSinUfM2", () => {
  it("nombra los ítems sin UF/m²; un 0 tipeado cuenta como completado", () => {
    expect(
      itemsSinUfM2([
        { descripcion: "Terreno", ufM2Unitario: "8" },
        { descripcion: "Servidumbre", ufM2Unitario: "0" },
        { descripcion: "Piso 1", ufM2Unitario: "" },
        { descripcion: " ", ufM2Unitario: "" },
      ]),
    ).toEqual(["Piso 1", "Ítem 4"])
  })
})
