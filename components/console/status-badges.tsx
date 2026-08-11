import { cn } from "@/lib/utils"
import {
  ESTADO_CLASSES,
  ESTADO_LABELS,
  PRIORIDAD_CLASSES,
  PRIORIDAD_LABELS,
  SLA_CLASSES,
  slaLabel,
  slaTone,
  toneDeEtapa,
  type EstadoSolicitud,
  type Prioridad,
  type SlaEtapaSolicitud,
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

/**
 * Los dos relojes de §5.2, en un solo componente y en modos excluyentes.
 *
 * - **Modo agregado** (`dias` + `total`) — RF-08 · RN-04. Píldora **rellena**
 *   con los días restantes. Es el que existía.
 * - **Modo etapa** (`etapa`) — RF-53 · §5.2.4. Píldora **neutra** con punto de
 *   color y prefijo `E{n}`.
 *
 * La unión discriminada no es decoración de tipos: los dos modos responden
 * preguntas distintas —*cuándo vence* contra *dónde se está atrasando ahora*— y
 * pasar los dos a la vez no significa nada. `never` en las ramas cruzadas hace
 * que el compilador lo impida en vez de que la píldora elija en silencio.
 *
 * Una etapa en rojo con el agregado en verde es la lectura correcta de ambos, no
 * una inconsistencia (§9.6.1), y por eso las dos píldoras conviven en la misma
 * fila sin parecerse.
 */
export type SLABadgeProps =
  | { dias: number; total: number; etapa?: never; className?: string }
  | {
      etapa: Pick<SlaEtapaSolicitud, "numero" | "nombre" | "tono" | "etiqueta">
      dias?: never
      total?: never
      className?: string
    }

export function SLABadge(props: SLABadgeProps) {
  if (props.etapa) return <EtapaPill etapa={props.etapa} className={props.className} />

  const { dias, total, className } = props
  const tone = slaTone(dias, total)
  return (
    <span
      className={cn(pillBase, SLA_CLASSES[tone], "tabular-nums", className)}
    >
      {slaLabel(dias)}
    </span>
  )
}

/**
 * Píldora de etapa. Recibe el tono **tal como lo emitió Airtable**
 * (`SlaTonoEtapa`) y traduce acá, con `toneDeEtapa`, en vez de exigir que cada
 * llamador traduzca: la regla de "sin dato no se pinta" queda en un solo sitio y
 * no puede divergir entre la bandeja y el detalle (RO-05).
 *
 * `sin_dato` **no renderiza nada**. Una píldora gris repetida en cada fila de la
 * bandeja es ruido, y el dato ya está en el detalle (§9.6.1). Es también la
 * degradación honesta del repo: nunca un verde que la base no respalda.
 *
 * El color vive sólo en el punto, sobre fondo neutro. `SLA_CLASSES` aporta el
 * hex del semáforo operacional (§4.4) vía `text-*`, y `bg-current` lo usa para
 * rellenar el punto — así la paleta sigue siendo una sola y no se declara un
 * segundo juego de colores para esta píldora.
 */
function EtapaPill({
  etapa,
  className,
}: {
  etapa: Pick<SlaEtapaSolicitud, "numero" | "nombre" | "tono" | "etiqueta">
  className?: string
}) {
  const tone = toneDeEtapa(etapa.tono)
  if (!tone) return null

  return (
    <span
      title={`Etapa ${etapa.numero} · ${etapa.nombre} · ${etapa.etiqueta}`}
      className={cn(
        pillBase,
        "gap-1.5 border-border bg-muted text-foreground tabular-nums",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(SLA_CLASSES[tone], "size-1.5 shrink-0 rounded-full bg-current")}
      />
      E{etapa.numero} · {etapa.etiqueta}
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
