import { describe, it, expect } from "vitest"
import {
  claveAdjuntoDeCategoria,
  TIPO_DOCUMENTO_POR_CATEGORIA_FOTO,
} from "@/lib/tasador/tipo-documento-foto"

/**
 * CI-071 (smoke) — cobertura de `clave_adjunto` por categoría de foto.
 *
 * La única foto de la visita que además es documento a extraer es el cuadro de
 * ofertas comparables (`ofertas_comparables` → `foto_ofertas_comparables`): esa
 * clave es la llave por la que `AT-RF09-Trigger` dispara RF-09 (spec §8.6.1,
 * RN-25). El resto de categorías son fotos de registro y NO deben devolver clave
 * (no disparan extracción). Import directo del módulo real (no port).
 */
describe("CI-071 · claveAdjuntoDeCategoria (cobertura de categorías)", () => {
  it("ofertas_comparables → foto_ofertas_comparables (dispara RF-09)", () => {
    expect(claveAdjuntoDeCategoria("ofertas_comparables")).toBe("foto_ofertas_comparables")
  })

  it.each(["fachada", "interior", "entorno", "plano", "", "cualquiera"])(
    "categoría de registro %s → undefined (no dispara extracción)",
    (cat) => {
      expect(claveAdjuntoDeCategoria(cat)).toBeUndefined()
    },
  )

  it("el catálogo solo declara claves para categorías que extraen (RN-25)", () => {
    const claves = Object.values(TIPO_DOCUMENTO_POR_CATEGORIA_FOTO)
    // Toda clave declarada es no vacía (sin ella el trigger salta la extracción).
    expect(claves.every((c) => typeof c === "string" && c.length > 0)).toBe(true)
    expect(TIPO_DOCUMENTO_POR_CATEGORIA_FOTO["ofertas_comparables"]).toBe("foto_ofertas_comparables")
  })
})
