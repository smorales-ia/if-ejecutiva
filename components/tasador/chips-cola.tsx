"use client"

/**
 * Los tres chips de la cola personal · RF-TAS-01 · CI-019 · A-12.
 *
 * Presentacional puro: recibe cuál está activo y avisa cuál se pulsó. No sabe
 * de Airtable, ni de la URL, ni de qué filtra cada uno — eso vive en
 * `lib/tasador/cola-filtros.ts` y en el shell. Separarlo de `cola-tasaciones`
 * es lo que pedía §4.1, y lo que permite que el estado del chip se pruebe sin
 * montar la pantalla entera.
 *
 * ## El stub de "Hoy" y por qué el tooltip necesita dos elementos
 *
 * Un `<button disabled>` **no emite eventos de puntero**, así que un tooltip
 * colgado directamente de él no aparecería nunca: el usuario vería un chip
 * apagado sin explicación, que es peor que no tenerlo. El envoltorio con
 * `aria-disabled` + `pointer-events-none` sobre el hijo, y el hover sobre el
 * `<span>` de fuera, es el patrón que ya usa `components/console/nav-principal.tsx`
 * para lo mismo (R7: se copia el patrón, no se inventa otro).
 *
 * `TooltipProvider` no se monta acá: ya envuelve toda la app en
 * `app/layout.tsx`.
 */

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CHIPS, esChipActivo, type ChipActivo } from "@/lib/tasador/cola-filtros"

const CLASES_BASE =
  "flex min-h-12 shrink-0 items-center rounded-lg border px-4 text-base font-medium transition-all duration-200"

const CLASES_ACTIVO = "border-brand bg-brand text-white"

const CLASES_INACTIVO =
  "border-border bg-background text-foreground hover:bg-muted"

export function ChipsCola({
  activo,
  onSeleccionar,
}: {
  activo: ChipActivo
  onSeleccionar: (chip: ChipActivo) => void
}) {
  return (
    <div
      role="group"
      aria-label="Filtros de la cola"
      // Los chips scrollean en horizontal si no caben; el body nunca (R9).
      className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {CHIPS.map((chip) =>
        chip.deshabilitado ? (
          <Tooltip key={chip.key}>
            <TooltipTrigger
              render={
                <span className="inline-flex shrink-0">
                  <span
                    aria-disabled="true"
                    className={cn(
                      CLASES_BASE,
                      CLASES_INACTIVO,
                      "pointer-events-none opacity-50",
                    )}
                  >
                    {chip.label}
                  </span>
                </span>
              }
            />
            <TooltipContent>{chip.tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          <button
            key={chip.key}
            type="button"
            onClick={() => esChipActivo(chip.key) && onSeleccionar(chip.key)}
            aria-pressed={activo === chip.key}
            className={cn(
              CLASES_BASE,
              activo === chip.key ? CLASES_ACTIVO : CLASES_INACTIVO,
            )}
          >
            {chip.label}
          </button>
        ),
      )}
    </div>
  )
}
