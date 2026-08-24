import { cn } from "@/lib/utils"
import type { Comparable, InformeData } from "@/lib/tasador/tasaciones"
/*
 * A-13 cerró el 23-ago-2026: **la sección D es de sólo lectura**. El tasador no
 * captura comparables, los fotografía —el cuadro `[Excel: Portada!B28:AX44]`,
 * ejemplo canónico en `docs/_referencias/ejemplo-comparables-cuadro.JPG`—, la
 * extracción de P6-TAS puebla `TX_Comparables` y esta grilla los muestra.
 *
 * Con la grilla editable cayeron, en la misma tanda (CI-056):
 *
 * - el botón de alta y el borrado por fila;
 * - las tres columnas de factor de homogeneización, que el cuadro de origen no
 *   trae (**A-44**) y que **A-18** disolvió como requisito;
 * - el módulo de factores de homogeneización, purgado al quedarse sin
 *   consumidor (**CI-031** · **OV-6**).
 *
 * La aritmética vive ahora en `lib/tasador/comparables.ts`, su sucesor.
 *
 * ⚠ **Este componente ya no recibe `set`.** No hay nada que escribir. Si algún
 * día vuelve la captura, lo que revive primero es A-18 —no este archivo—.
 */
import { promedioUfM2, ufM2 } from "@/lib/tasador/comparables"

const fmt = (n: number | null, dec = 2) =>
  n == null ? "—" : n.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec })

/**
 * Pinta un campo de texto del comparable tal como vino del cuadro.
 *
 * No intenta reformatear: lo que la extracción leyó es lo que el tasador debe
 * poder contrastar contra su foto. Un vacío se muestra como «—» para que la
 * celda faltante se vea, que es la señal de que la foto salió incompleta.
 */
const texto = (v: string) => (v.trim() === "" ? "—" : v.trim())

/** Formatea un campo numérico del comparable, o «—» si no vino o no es un número. */
function numerico(valor: string, dec = 0) {
  const limpio = valor.trim()
  if (limpio === "") return "—"

  const n = Number(limpio)
  return Number.isFinite(n) ? fmt(n, dec) : limpio
}

/** Badge de sólo lectura del discriminador `tipo_referencia` (Oferta · CBR). */
function BadgeFuente({ fuente }: { fuente: Comparable["fuente"] }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
        fuente === "cbr" ? "bg-blue-50 text-brand" : "bg-muted text-muted-foreground",
      )}
    >
      {fuente === "cbr" ? "CBR" : "Oferta"}
    </span>
  )
}

const CELDA = "whitespace-nowrap px-2 py-2 text-sm text-foreground"
const CELDA_NUM = "whitespace-nowrap px-2 py-2 text-sm tabular-nums text-foreground"

export function SeccionComparables({ form }: { form: InformeData }) {
  const comparables = form.comparables
  const total = comparables.length

  // ¿algún comparable es oferta / cbr? → columnas condicionales
  const hayOferta = comparables.some((c) => c.fuente === "oferta")
  const hayCbr = comparables.some((c) => c.fuente === "cbr")

  const promedio = promedioUfM2(comparables)
  const cols = 8 + (hayOferta ? 1 : 0) + (hayCbr ? 2 : 0)

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {total} de 3 comparables leídos del cuadro
        </span>
      </div>

      {total === 0 ? (
        /*
         * Sin filas no se pinta la tabla: una cabecera de ocho columnas sobre
         * el vacío no comunica nada, y la fila de promedio diría «—» sin que se
         * entienda por qué. El literal nombra la única acción que el tasador
         * tiene (§6.1 · RF-12).
         */
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay comparables. Vuelve a fotografiar el cuadro desde Editar fotos.
        </p>
      ) : (
        <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-max border-collapse text-left">
            <thead>
              <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                <th className="sticky left-0 z-10 min-w-44 bg-muted px-2 py-2">N° · Dirección</th>
                <th className="px-2 py-2">Comuna</th>
                <th className="whitespace-nowrap px-2 py-2">Sup. terreno</th>
                <th className="whitespace-nowrap px-2 py-2">Sup. const.</th>
                <th className="whitespace-nowrap px-2 py-2">Precio UF</th>
                <th className="whitespace-nowrap px-2 py-2">UF/m²</th>
                <th className="px-2 py-2">Año</th>
                <th className="px-2 py-2">Tipo</th>
                {hayOferta && <th className="whitespace-nowrap px-2 py-2">Teléfono</th>}
                {hayCbr && <th className="px-2 py-2">Foja</th>}
                {hayCbr && <th className="px-2 py-2">Número</th>}
              </tr>
            </thead>
            <tbody>
              {comparables.map((c, idx) => (
                <tr key={c.id} className="border-t border-border align-top">
                  <td className="sticky left-0 z-10 min-w-44 bg-background px-2 py-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                      <span className="text-sm text-foreground">
                        {texto(c.direccionReferencia)}
                      </span>
                    </div>
                  </td>
                  <td className={CELDA}>{texto(c.comuna)}</td>
                  <td className={CELDA_NUM}>{numerico(c.supTerreno)}</td>
                  <td className={CELDA_NUM}>{numerico(c.supConstruida)}</td>
                  <td className={CELDA_NUM}>{numerico(c.totalUf, 2)}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm tabular-nums text-muted-foreground">
                    {fmt(ufM2(c))}
                  </td>
                  <td className={CELDA_NUM}>{texto(c.anio)}</td>
                  <td className="px-2 py-2">
                    <BadgeFuente fuente={c.fuente} />
                  </td>
                  {hayOferta && (
                    <td className={CELDA}>
                      {c.fuente === "oferta" ? (
                        texto(c.telefonoContacto)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                  {hayCbr && (
                    <td className={CELDA}>
                      {c.fuente === "cbr" ? (
                        texto(c.foja)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                  {hayCbr && (
                    <td className={CELDA}>
                      {c.fuente === "cbr" ? (
                        texto(c.numero)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {/*
               * Fila de cierre: promedio **simple** de UF/m², no homogeneizado.
               * La plantilla operativa calcula el unitario sin coeficientes
               * `[Excel: Portada!AX29]` y el cuadro no trae factores (A-44).
               * Diverge del bloque 6 de `/informe` — es CI-057, deuda abierta.
               */}
              <tr className="border-t border-border bg-muted font-semibold text-foreground">
                <td className="sticky left-0 z-10 bg-muted px-2 py-2 text-sm">Promedio UF/m²</td>
                <td className="px-2 py-2 text-sm tabular-nums" colSpan={cols - 1}>
                  {fmt(promedio)}
                </td>
              </tr>
            </tbody>
          </table>
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
