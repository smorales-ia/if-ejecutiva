import { Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { FuenteDato } from "@/lib/tasaciones"

/**
 * Wrapper de campo de formulario que muestra un badge sutil
 * "Pre-llenado · editable" cuando el dato viene de la BD simulada.
 */
export function CampoPrellenado({
  id,
  label,
  prellenado,
  fuente,
  children,
}: {
  id: string
  label: string
  prellenado: boolean
  fuente?: FuenteDato
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      {prellenado && (
        <span className="inline-flex w-fit items-center gap-1 text-xs font-medium text-brand">
          <Sparkles aria-hidden="true" className="h-3 w-3" />
          Pre-llenado{fuente ? ` · ${fuente}` : ""} · editable
        </span>
      )}
      {children}
    </div>
  )
}
