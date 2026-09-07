import { cn } from "@/lib/utils"
import type { Comparable, InformeData } from "@/lib/tasador/tasaciones"
/*
 * A-13 cerró el 23-ago-2026: **la sección D es de sólo lectura**. El tasador no
 * captura comparables, los fotografía —el cuadro `[Excel: Portada!B28:AX44]`,
 * ejemplo canónico en `docs/_referencias/ejemplo-comparables-cuadro.JPG`—, la
 * extracción de P6-TAS puebla `TX_Comparables` y esta grilla los muestra.
 *
 * ## P13-TAS · la grilla espeja el cuadro cuadro-a-cuadro
 *
 * El cuadro trae **dos bloques** —REF. OFERTAS y REF. C.B.R.—, cada uno con sus
 * filas de muestra y tres renglones de cierre: `PROMEDIO DE LA MUESTRA`,
 * `TASACION` y `TASACION V/S PROMEDIO DE LA MUESTRA`. Este componente reproduce
 * esa estructura. Las columnas espejan el cuadro: Fecha, Dirección, Año,
 * Teléfono (ofertas) / Foja y Número (CBR), Total UF, Sup. Terreno, Sup.
 * Constr., OO.CC., UF/m² T. y UF/m² C.
 *
 * Los dos UF/m² se muestran **crudos**, tal como vinieron de la foto
 * (`uf_m2_terreno_f` · `uf_m2_construccion_f`): el cuadro los calcula de forma
 * directa `[Excel: Portada!AX29]`, no como `precio / sup`, así que el
 * componente **no recalcula** —lo hace `lib/tasador/comparables.ts`—.
 *
 * Con la grilla editable cayeron, en CI-056: el botón de alta, el borrado por
 * fila y el módulo de factores de homogeneización (**A-18** · **A-44** ·
 * **OV-6** · **CI-031**). En P13-TAS los factores `factor_*` salieron por
 * completo del modelo de IF-03 (**R-COMP-1**): no se usan, no se muestran, no se
 * calculan. La columna `comuna`, que el cuadro no trae, dejó de pintarse (sigue
 * viva en el modelo y en el informe · R-COMP-6).
 *
 * ⚠ **Este componente ya no recibe `set`.** No hay nada que escribir. Si algún
 * día vuelve la captura, lo que revive primero es A-18 —no este archivo—.
 */
import {
  numeroDe,
  promedioMuestra,
  tasacionVsPromedio,
  ufM2Construccion,
  ufM2Terreno,
  type PromedioMuestra,
} from "@/lib/tasador/comparables"

const fmt = (n: number | null, dec = 2) =>
  n == null ? "—" : n.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec })

/** Porcentaje con signo para la fila `TASACION V/S PROMEDIO`, o «—» si no hay base. */
const fmtPct = (fraccion: number | null) =>
  fraccion == null
    ? "—"
    : `${fraccion > 0 ? "+" : ""}${(fraccion * 100).toLocaleString("es-CL", { maximumFractionDigits: 0 })}%`

/**
 * Pinta un campo de texto del comparable tal como vino del cuadro. Un vacío se
 * muestra como «—» para que la celda faltante se vea: es la señal de que la foto
 * salió incompleta.
 */
const texto = (v: string) => (v.trim() === "" ? "—" : v.trim())

/** `Foja y Número` del CBR unidas como `foja-numero`; sólo el que exista si falta uno. */
function fojaNumero(c: Comparable) {
  const partes = [c.foja.trim(), c.numero.trim()].filter((p) => p !== "")
  return partes.length === 0 ? "—" : partes.join("-")
}

/**
 * Columnas numéricas comunes a los dos bloques, en el orden del cuadro. `dec`
 * fija los decimales de la columna (Total UF y OO.CC. enteros; superficies y
 * UF/m² con dos). El renglón `PROMEDIO DE LA MUESTRA` promedia justamente estas
 * seis columnas.
 */
const COLS_NUM: { key: keyof PromedioMuestra; label: string; dec: number; valor: (c: Comparable) => number | null }[] = [
  { key: "totalUf", label: "Total UF", dec: 0, valor: (c) => numeroDe(c.totalUf) },
  { key: "supTerreno", label: "Sup. Terreno", dec: 2, valor: (c) => numeroDe(c.supTerreno) },
  { key: "supConstruida", label: "Sup. Constr.", dec: 2, valor: (c) => numeroDe(c.supConstruida) },
  { key: "ooCcUf", label: "OO.CC.", dec: 0, valor: (c) => numeroDe(c.ooCcUf) },
  { key: "ufM2Terreno", label: "UF/m² T.", dec: 2, valor: ufM2Terreno },
  { key: "ufM2Construccion", label: "UF/m² C.", dec: 2, valor: ufM2Construccion },
]

const TH = "whitespace-nowrap px-2 py-2 text-right"
const TD_NUM = "whitespace-nowrap px-2 py-2 text-right text-sm tabular-nums text-foreground"
const TD_TXT = "whitespace-nowrap px-2 py-2 text-sm text-foreground"

/**
 * Un bloque del cuadro (OFERTAS o CBR): cabecera, filas de muestra y los tres
 * renglones de resumen. `contacto` decide la columna condicional —Teléfono en
 * ofertas, Foja y Número en CBR—.
 */
function BloqueComparables({
  titulo,
  filas,
  contacto,
  tasacion,
}: {
  titulo: string
  filas: Comparable[]
  contacto: "telefono" | "foja"
  tasacion: PromedioMuestra | null
}) {
  const promedio = promedioMuestra(filas)
  const contactoLabel = contacto === "telefono" ? "Teléfono" : "Foja y Número"
  // Columnas: N°·Dirección (sticky) + Fecha + Año + contacto + 6 numéricas.
  const colsAntesDeNum = 3 // Fecha, Año, contacto (entre la sticky y las numéricas)

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-max border-collapse text-left">
        <thead>
          <tr className="bg-brand/10 text-xs font-bold uppercase tracking-wide text-brand">
            <th className="sticky left-0 z-10 min-w-44 bg-brand/10 px-2 py-2 text-left" colSpan={1 + colsAntesDeNum + COLS_NUM.length}>
              {titulo}
            </th>
          </tr>
          <tr className="bg-muted text-xs font-semibold text-muted-foreground">
            <th className="sticky left-0 z-10 min-w-44 bg-muted px-2 py-2 text-left">N° · Dirección</th>
            <th className="whitespace-nowrap px-2 py-2 text-left">Fecha</th>
            <th className="px-2 py-2 text-left">Año</th>
            <th className="whitespace-nowrap px-2 py-2 text-left">{contactoLabel}</th>
            {COLS_NUM.map((col) => (
              <th key={col.key} className={TH}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((c, idx) => (
            <tr key={c.id} className="border-t border-border align-top">
              <td className="sticky left-0 z-10 min-w-44 bg-background px-2 py-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                  <span className="text-sm text-foreground">{texto(c.direccionReferencia)}</span>
                </div>
              </td>
              <td className={TD_TXT}>{texto(c.fechaPublicacion)}</td>
              <td className={TD_TXT}>{texto(c.anio)}</td>
              <td className={TD_TXT}>{contacto === "telefono" ? texto(c.telefonoContacto) : fojaNumero(c)}</td>
              {COLS_NUM.map((col) => (
                <td key={col.key} className={TD_NUM}>
                  {fmt(col.valor(c), col.dec)}
                </td>
              ))}
            </tr>
          ))}

          {/* PROMEDIO DE LA MUESTRA — promedio simple columna a columna. */}
          <tr className="border-t border-border bg-muted font-semibold text-foreground">
            <td className="sticky left-0 z-10 bg-muted px-2 py-2 text-sm">Promedio de la muestra</td>
            <td className="bg-muted px-2 py-2" />
            <td className="bg-muted px-2 py-2" />
            <td className="bg-muted px-2 py-2" />
            {COLS_NUM.map((col) => (
              <td key={col.key} className={cn(TD_NUM, "bg-muted")}>
                {fmt(promedio[col.key], col.dec)}
              </td>
            ))}
          </tr>

          {/* TASACION — valores del inmueble sujeto (motor AT03). Ver nota F-2. */}
          <tr className="border-t border-border font-semibold text-foreground">
            <td className="sticky left-0 z-10 bg-background px-2 py-2 text-sm">Tasación</td>
            <td className="px-2 py-2" />
            <td className="px-2 py-2" />
            <td className="px-2 py-2" />
            {COLS_NUM.map((col) => (
              <td key={col.key} className={TD_NUM}>
                {fmt(tasacion?.[col.key] ?? null, col.dec)}
              </td>
            ))}
          </tr>

          {/* TASACION V/S PROMEDIO DE LA MUESTRA — cociente sobre UF/m² C. */}
          <tr className="border-t border-border text-sm font-semibold text-muted-foreground">
            <td className="sticky left-0 z-10 bg-background px-2 py-2">Tasación v/s promedio de la muestra</td>
            <td className="px-2 py-2" colSpan={colsAntesDeNum + COLS_NUM.length - 1} />
            <td className={cn(TD_NUM, "text-foreground")}>
              {fmtPct(tasacionVsPromedio(tasacion?.ufM2Construccion ?? null, promedio.ufM2Construccion))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function SeccionComparables({ form }: { form: InformeData }) {
  const comparables = form.comparables
  const total = comparables.length

  const ofertas = comparables.filter((c) => c.fuente === "oferta")
  const cbr = comparables.filter((c) => c.fuente === "cbr")

  /*
   * F-2 (P13-TAS · Opción A): las filas `TASACION` y `TASACION V/S PROMEDIO`
   * muestran los valores del inmueble sujeto, que produce el motor AT03. Hoy
   * `InformeData` **no** trae esos campos —Total UF, OO.CC. y UF/m² T./C. del
   * sujeto—, así que ambas filas se pintan con «—». La superficie de terreno y
   * construida del sujeto sí existen (`form.supTerreno` / `form.supConstruida`),
   * pero se mantienen fuera hasta que la fila entera tenga fuente de motor, para
   * no mezclar dato capturado con dato calculado en el mismo renglón.
   *
   * Cuando una tanda futura cablee los valores del sujeto en `InformeData`
   * (p.ej. `tasacionTotalUf`, `tasacionOoCcUf`, `tasacionUfM2Terreno`,
   * `tasacionUfM2Construccion`), construir aquí `tasacionSujeto: PromedioMuestra`
   * y las dos filas se pintan solas, sin tocar el layout. **La UI muestra, no
   * calcula el valor del sujeto.**
   */
  const tasacionSujeto: PromedioMuestra | null = null

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {total} de 3 comparables leídos del cuadro
        </span>
      </div>

      {total === 0 ? (
        /*
         * Sin filas no se pinta la tabla. El literal nombra la única acción que
         * el tasador tiene: volver a fotografiar (§6.1 · RF-12). No captura, no
         * corrige, no borra.
         */
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay comparables. Vuelve a fotografiar el cuadro desde Editar fotos.
        </p>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-4">
          {ofertas.length > 0 && (
            <BloqueComparables titulo="Ref. Ofertas" filas={ofertas} contacto="telefono" tasacion={tasacionSujeto} />
          )}
          {cbr.length > 0 && (
            <BloqueComparables titulo="Ref. C.B.R." filas={cbr} contacto="foja" tasacion={tasacionSujeto} />
          )}
        </div>
      )}
    </div>
  )
}

/** Badge X/3 para el header de la sección. */
export function ComparablesBadge({ total }: { total: number }) {
  const ok = total >= 3
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        ok ? "bg-emerald-50 text-success" : "bg-red-50 text-danger",
      )}
    >
      {total} / 3
    </span>
  )
}
