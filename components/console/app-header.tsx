import { Suspense } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BuscadorSolicitudes } from "@/components/console/buscador-solicitudes"
import { IndicadorCartera } from "@/components/console/indicador-cartera"
import { NavPrincipal } from "@/components/console/nav-principal"

/**
 * Cáscara del header. Sigue siendo Server Component: las tres piezas que
 * necesitan estado o URL —navegación, buscador e indicador de cartera— son
 * componentes cliente propios.
 *
 * `NavPrincipal` y `BuscadorSolicitudes` usan `useSearchParams`, que obliga a
 * envolverlos en `Suspense`: sin él, Next fuerza el render dinámico de toda la
 * ruta que monte este header. Cada uno lleva el suyo para que la suspensión de
 * uno no borre al otro, y con un fallback de la misma altura para que la barra
 * no salte al hidratar.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-6 border-b border-border bg-card px-5">
      {/* Brand + nav */}
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold tracking-tight text-brand">
          VProperty
        </span>
        <Suspense fallback={<div className="hidden h-8 lg:block" />}>
          <NavPrincipal />
        </Suspense>
      </div>

      {/* Buscador global (§1.1). */}
      <div className="mx-auto w-full max-w-xl">
        <Suspense fallback={<div className="h-9" />}>
          <BuscadorSolicitudes destino="/consola" />
        </Suspense>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <IndicadorCartera />
        <Avatar className="size-8">
          <AvatarFallback className="bg-brand text-xs font-semibold text-brand-foreground">
            ME
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
