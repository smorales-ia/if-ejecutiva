"use client"

import { TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InformeData } from "@/lib/tasaciones"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TextField } from "./fields"
import type { SetForm } from "./seccion-propiedad"

export const MIN_MOTIVO = 20

/** ¿Hay algún override con valor? */
export function hayOverride(form: InformeData): boolean {
  return (
    form.tasaCapRateOverride.trim() !== "" ||
    form.vidaUtilOverride.trim() !== "" ||
    form.valorSugeridoOverride.trim() !== ""
  )
}

/** ¿Los overrides son válidos? (si hay override, motivo ≥ 20). */
export function overridesValidos(form: InformeData): boolean {
  if (!hayOverride(form)) return true
  return form.motivoOverride.trim().length >= MIN_MOTIVO
}

export function SeccionOverrides({
  form,
  set,
}: {
  form: InformeData
  set: SetForm
}) {
  const activo = hayOverride(form)
  const motivoLen = form.motivoOverride.trim().length
  const motivoValido = !activo || motivoLen >= MIN_MOTIVO

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3">
        <TextField
          label="Tasa cap rate override (%)"
          type="number"
          value={form.tasaCapRateOverride}
          onChange={(v) => set("tasaCapRateOverride", v)}
        />
        <TextField
          label="Vida útil override (años)"
          type="number"
          value={form.vidaUtilOverride}
          onChange={(v) => set("vidaUtilOverride", v)}
        />
        <TextField
          label="Valor sugerido override (UF)"
          type="number"
          value={form.valorSugeridoOverride}
          onChange={(v) => set("valorSugeridoOverride", v)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="motivo-override" className="text-sm font-medium">
          Motivo del override{activo ? " (obligatorio)" : ""}
        </Label>
        <Textarea
          id="motivo-override"
          rows={3}
          value={form.motivoOverride}
          onChange={(e) => set("motivoOverride", e.target.value)}
          placeholder="Justifica por qué se ajusta el valor calculado (mínimo 20 caracteres)…"
          className={cn(
            "text-base",
            activo && !motivoValido && "border-danger",
          )}
        />
        {activo && (
          <p
            className={cn(
              "flex items-center gap-1.5 text-xs",
              motivoValido ? "text-success" : "text-danger",
            )}
          >
            {!motivoValido && <TriangleAlert className="h-3.5 w-3.5" />}
            {motivoLen}/{MIN_MOTIVO} caracteres mínimos
          </p>
        )}
      </div>
    </div>
  )
}
