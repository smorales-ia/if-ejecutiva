"use client"

import { useState } from "react"
import { Plus, Trash2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InformeData, Comparable } from "@/lib/tasaciones"
import { nuevoComparable, ufHomogeneizada } from "@/lib/factores-default"
import type { SetForm } from "./seccion-propiedad"

const MAX_COMPARABLES = 10

/** Celda de input inline para la grilla. */
function CeldaInput({
  value,
  onChange,
  type = "text",
  ancho = "w-24",
  requerido = false,
  disabled = false,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  ancho?: string
  requerido?: boolean
  disabled?: boolean
}) {
  const vacioRequerido = requerido && !value
  return (
    <input
      type={type}
      inputMode={type === "number" ? "decimal" : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      data-comparable-requerido={requerido ? "true" : undefined}
      data-vacio={vacioRequerido ? "true" : undefined}
      className={cn(
        "min-h-10 rounded-md border bg-background px-2 py-1 text-sm text-foreground",
        "focus:border-vp-primary focus:outline-none focus:ring-1 focus:ring-vp-primary",
        "disabled:cursor-not-allowed disabled:opacity-60",
        ancho,
        vacioRequerido ? "border-vp-danger" : "border-border",
      )}
    />
  )
}

/** UF/m² de un comparable: precio_uf / sup_construccion_m2. */
function ufM2(c: Comparable): number | null {
  const precio = Number(c.totalUf)
  const sup = Number(c.supConstruida)
  if (!c.totalUf || !c.supConstruida || Number.isNaN(precio) || sup === 0) return null
  return precio / sup
}

/** Promedio homogeneizado UF/m²: media de (ufHomogeneizada / sup_construida) válidos. */
function promedioHomogeneizado(comparables: Comparable[]): number | null {
  const valores = comparables
    .map((c) => {
      const homo = ufHomogeneizada(c)
      const sup = Number(c.supConstruida)
      if (homo == null || !sup) return null
      return homo / sup
    })
    .filter((v): v is number => v != null)
  if (valores.length === 0) return null
  return valores.reduce((a, b) => a + b, 0) / valores.length
}

const fmt = (n: number | null, dec = 2) =>
  n == null ? "—" : n.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec })

export function SeccionComparables({
  form,
  set,
  disabled = false,
  readOnly = false,
}: {
  form: InformeData
  set: SetForm
  disabled?: boolean
  /** Vista de solo lectura para el informe (§7.1 bloque 6): oculta acciones y "Agregar". */
  readOnly?: boolean
}) {
  const comparables = form.comparables
  const total = comparables.length
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const inputsOff = disabled || readOnly

  // ¿algún comparable es oferta / cbr? → columnas condicionales
  const hayOferta = comparables.some((c) => c.fuente === "oferta")
  const hayCbr = comparables.some((c) => c.fuente === "cbr")

  const update = (id: string, patch: Partial<Comparable>) =>
    set(
      "comparables",
      comparables.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )

  const remove = (id: string) => {
    set("comparables", comparables.filter((c) => c.id !== id))
    setConfirmando(null)
  }

  const promedio = promedioHomogeneizado(comparables)
  const cols = 12 + (hayOferta ? 1 : 0) + (hayCbr ? 2 : 0) + (readOnly ? 0 : 1) // +1 acciones

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-vp-text-secondary">
          {total} de mínimo 3 comparables
        </span>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-lg border border-border">
        <table className="w-max border-collapse text-left">
          <thead>
            <tr className="bg-vp-surface text-xs font-semibold text-vp-text-secondary">
              <th className="sticky left-0 z-10 min-w-44 bg-vp-surface px-2 py-2">
                N° · Dirección <span className="text-vp-danger">*</span>
              </th>
              <th className="px-2 py-2">Comuna</th>
              <th className="px-2 py-2">Sup. terreno</th>
              <th className="whitespace-nowrap px-2 py-2">
                Sup. const. <span className="text-vp-danger">*</span>
              </th>
              <th className="whitespace-nowrap px-2 py-2">
                Precio UF <span className="text-vp-danger">*</span>
              </th>
              <th className="whitespace-nowrap px-2 py-2">UF/m²</th>
              <th className="px-2 py-2">
                Año <span className="text-vp-danger">*</span>
              </th>
              <th className="px-2 py-2">Tipo</th>
              <th className="whitespace-nowrap px-2 py-2">Factor sup.</th>
              <th className="whitespace-nowrap px-2 py-2">Factor edad</th>
              <th className="whitespace-nowrap px-2 py-2">Factor dist.</th>
              {hayOferta && <th className="whitespace-nowrap px-2 py-2">Teléfono</th>}
              {hayCbr && <th className="px-2 py-2">Foja</th>}
              {hayCbr && <th className="px-2 py-2">Número</th>}
              {!readOnly && (
                <th className="sticky right-0 z-10 bg-vp-surface px-2 py-2" aria-label="Acciones" />
              )}
            </tr>
          </thead>
          <tbody>
            {comparables.map((c, idx) => (
              <tr key={c.id} className="border-t border-border align-top">
                <td className="sticky left-0 z-10 min-w-44 bg-background px-2 py-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 text-xs font-bold text-vp-text-secondary">{idx + 1}</span>
                    <CeldaInput
                      value={c.direccionReferencia}
                      onChange={(v) => update(c.id, { direccionReferencia: v })}
                      ancho="w-36"
                      requerido
                      disabled={inputsOff}
                    />
                  </div>
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.comuna}
                    onChange={(v) => update(c.id, { comuna: v })}
                    disabled={inputsOff}
                  />
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.supTerreno}
                    onChange={(v) => update(c.id, { supTerreno: v })}
                    type="number"
                    ancho="w-20"
                    disabled={inputsOff}
                  />
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.supConstruida}
                    onChange={(v) => update(c.id, { supConstruida: v })}
                    type="number"
                    ancho="w-20"
                    requerido
                    disabled={inputsOff}
                  />
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.totalUf}
                    onChange={(v) => update(c.id, { totalUf: v })}
                    type="number"
                    ancho="w-24"
                    requerido
                    disabled={inputsOff}
                  />
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-sm tabular-nums text-vp-text-secondary">
                  {fmt(ufM2(c))}
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.anio}
                    onChange={(v) => update(c.id, { anio: v })}
                    type="number"
                    ancho="w-16"
                    requerido
                    disabled={inputsOff}
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex overflow-hidden rounded-md border border-border">
                    {(["oferta", "cbr"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        disabled={inputsOff}
                        onClick={() => update(c.id, { fuente: f })}
                        className={cn(
                          "min-h-10 px-2 text-xs font-semibold capitalize disabled:cursor-not-allowed",
                          c.fuente === f
                            ? "bg-vp-primary text-white"
                            : "bg-background text-foreground",
                        )}
                      >
                        {f === "oferta" ? "Oferta" : "CBR"}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.factorSup}
                    onChange={(v) => update(c.id, { factorSup: v })}
                    type="number"
                    ancho="w-16"
                    disabled={inputsOff}
                  />
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.factorEdad}
                    onChange={(v) => update(c.id, { factorEdad: v })}
                    type="number"
                    ancho="w-16"
                    disabled={inputsOff}
                  />
                </td>
                <td className="px-2 py-2">
                  <CeldaInput
                    value={c.factorDistancia}
                    onChange={(v) => update(c.id, { factorDistancia: v })}
                    type="number"
                    ancho="w-16"
                    disabled={inputsOff}
                  />
                </td>
                {hayOferta && (
                  <td className="px-2 py-2">
                    {c.fuente === "oferta" ? (
                      <CeldaInput
                        value={c.telefonoContacto}
                        onChange={(v) => update(c.id, { telefonoContacto: v })}
                        ancho="w-32"
                        disabled={inputsOff}
                      />
                    ) : (
                      <span className="text-sm text-vp-text-secondary">—</span>
                    )}
                  </td>
                )}
                {hayCbr && (
                  <td className="px-2 py-2">
                    {c.fuente === "cbr" ? (
                      <CeldaInput
                        value={c.foja}
                        onChange={(v) => update(c.id, { foja: v })}
                        ancho="w-20"
                        disabled={inputsOff}
                      />
                    ) : (
                      <span className="text-sm text-vp-text-secondary">—</span>
                    )}
                  </td>
                )}
                {hayCbr && (
                  <td className="px-2 py-2">
                    {c.fuente === "cbr" ? (
                      <CeldaInput
                        value={c.numero}
                        onChange={(v) => update(c.id, { numero: v })}
                        ancho="w-20"
                        disabled={inputsOff}
                      />
                    ) : (
                      <span className="text-sm text-vp-text-secondary">—</span>
                    )}
                  </td>
                )}
                {!readOnly && (
                <td className="sticky right-0 z-10 bg-background px-2 py-2">
                  {confirmando === c.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        aria-label="Confirmar eliminación"
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-vp-danger"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmando(null)}
                        aria-label="Cancelar eliminación"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-vp-text-secondary hover:bg-vp-surface"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={inputsOff}
                      onClick={() => setConfirmando(c.id)}
                      aria-label={`Eliminar comparable ${idx + 1}`}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-vp-danger hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
                )}
              </tr>
            ))}

            {/* Fila de cierre: promedio homogeneizado */}
            <tr className="border-t border-border bg-vp-surface font-semibold text-foreground">
              <td className="sticky left-0 z-10 bg-vp-surface px-2 py-2 text-sm">
                Promedio homogeneizado UF/m²
              </td>
              <td className="px-2 py-2 text-sm tabular-nums" colSpan={cols - 1}>
                {fmt(promedio)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button
          type="button"
          disabled={disabled || total >= MAX_COMPARABLES}
          onClick={() => set("comparables", [...comparables, nuevoComparable()])}
          className={cn(
            "flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-vp-primary text-sm font-semibold text-vp-primary transition-colors hover:bg-blue-50",
            "disabled:cursor-not-allowed disabled:border-border disabled:text-vp-text-secondary disabled:hover:bg-transparent",
          )}
        >
          <Plus className="h-4 w-4" />
          {total >= MAX_COMPARABLES ? "Máximo 10 comparables" : "Agregar comparable"}
        </button>
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
        ok ? "bg-emerald-50 text-vp-success" : "bg-red-50 text-vp-danger",
      )}
    >
      {total} / 3
    </span>
  )
}
