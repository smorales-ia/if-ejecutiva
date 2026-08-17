import { cn } from "@/lib/utils"
import type { EstadoColor } from "@/lib/tasaciones"

const STYLES: Record<EstadoColor, string> = {
  verde: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ambar: "bg-amber-50 text-amber-700 border-amber-200",
  rojo: "bg-red-50 text-red-700 border-red-200",
  azul: "bg-blue-50 text-vp-primary border-blue-200",
  naranja: "bg-orange-50 text-orange-700 border-orange-200",
}

const DOT: Record<EstadoColor, string> = {
  verde: "bg-vp-success",
  ambar: "bg-vp-warning",
  rojo: "bg-vp-danger",
  azul: "bg-vp-primary",
  naranja: "bg-vp-accent",
}

export function EstadoBadge({
  estado,
  texto,
  className,
}: {
  estado: EstadoColor
  texto: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        STYLES[estado],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", DOT[estado])} />
      {texto}
    </span>
  )
}
