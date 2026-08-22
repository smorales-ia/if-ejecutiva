import { VPropertyLogo } from "@/components/tasador/vproperty-logo"

/**
 * Cabecera sticky de IF-03 · logo + identidad de la sesión.
 *
 * `userName` es **obligatorio y sin valor por defecto**. Hasta P3-TAS.B el
 * componente traía `= "Roberto Pérez"` escrito a mano: un nombre que no es el
 * de nadie, en la única parte de la pantalla que le dice al tasador de quién es
 * la sesión que está mirando. Un default plausible es peor que ninguno —nadie
 * lo nota hasta que alguien confía en él—, así que ahora el nombre lo resuelve
 * `nombreVisibleTasador()` desde `M_Tasadores` y quien monte la cabecera sin
 * pasarlo no compila.
 */
export function AppHeader({ userName }: { userName: string }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <VPropertyLogo />
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-medium text-foreground sm:inline">{userName}</span>
        <span
          aria-label={userName}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
        >
          {initials}
        </span>
      </div>
    </header>
  )
}
