import { cn } from "@/lib/utils"
import { MAX_INTENTOS } from "@/hooks/use-estado-tasador"

/** Tres puntos ● ● ○ con texto "N de 3 usados". Naranjo cuando N >= 2. */
export function IntentosIndicator({ intentos }: { intentos: number }) {
  const alerta = intentos >= 2
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: MAX_INTENTOS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              i < intentos
                ? alerta
                  ? "bg-vp-accent"
                  : "bg-vp-primary"
                : "border border-border bg-transparent",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-xs font-medium",
          alerta ? "text-vp-accent" : "text-vp-text-secondary",
        )}
      >
        {intentos} de {MAX_INTENTOS} usados
      </span>
    </div>
  )
}
