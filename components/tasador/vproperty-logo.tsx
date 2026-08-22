export function VPropertyLogo({ withTagline = true }: { withTagline?: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        {/* Triángulo naranja simulando el isotipo */}
        <span
          aria-hidden="true"
          className="inline-block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-accent-orange"
        />
        <span className="text-lg font-bold leading-none tracking-tight text-brand">
          VPROPERTY
        </span>
      </div>
      {withTagline && (
        <span className="mt-0.5 pl-[19px] text-xs text-muted-foreground">
          Tasaciones Bienes Raíces
        </span>
      )}
    </div>
  )
}
