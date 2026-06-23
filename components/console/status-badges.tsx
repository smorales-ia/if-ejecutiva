import { cn } from "@/lib/utils"
import {
  ESTADO_CLASSES,
  ESTADO_LABELS,
  PRIORIDAD_CLASSES,
  PRIORIDAD_LABELS,
  SLA_CLASSES,
  slaLabel,
  slaTone,
  type EstadoSolicitud,
  type Prioridad,
} from "@/lib/console-data"

const pillBase =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap"

export function StateBadge({
  estado,
  className,
}: {
  estado: EstadoSolicitud
  className?: string
}) {
  return (
    <span className={cn(pillBase, ESTADO_CLASSES[estado], className)}>
      {ESTADO_LABELS[estado]}
    </span>
  )
}

export function SLABadge({
  dias,
  total,
  className,
}: {
  dias: number
  total: number
  className?: string
}) {
  const tone = slaTone(dias, total)
  return (
    <span
      className={cn(pillBase, SLA_CLASSES[tone], "tabular-nums", className)}
    >
      {slaLabel(dias)}
    </span>
  )
}

export function PriorityChip({
  prioridad,
  className,
}: {
  prioridad: Prioridad
  className?: string
}) {
  return (
    <span className={cn(pillBase, PRIORIDAD_CLASSES[prioridad], className)}>
      {PRIORIDAD_LABELS[prioridad]}
    </span>
  )
}
