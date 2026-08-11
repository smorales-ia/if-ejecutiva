"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Navegación principal del header.
 *
 * ## De dónde salen estos tres nombres
 *
 * "Consola", "Cola operativa" y "Expediente" vienen de la maqueta v0.dev y no
 * estaban definidos en ninguna versión de la spec hasta v1.9.7. Hasta esta
 * tanda eran tres `<a href="#">` decorativos con `active: true` escrito a mano
 * en el primero. Su propósito se fijó con Sergio el 11-ago-2026 y quedó
 * normativo en **§1.0 de la spec v1.9.8**:
 *
 * - **Consola** — la bandeja unificada de §1.1 con el detalle de §1.3, que es el
 *   patrón P2 Lista + Detalle y lo único operativo hoy.
 * - **Cola operativa** — lo que espera acción de la Ejecutiva, ordenado por
 *   urgencia. §1.1 nombraba "Por reasignar (>48 h sin actividad)" como vista
 *   pre-construida, pero la REGLA A eliminó la reasignación de v1.9; lo que
 *   queda con sentido operativo es `por_asignar`. Es un deep link a la misma
 *   pantalla, no una ruta nueva: cero lógica añadida.
 * - **Expediente** — deshabilitado. Una vista de expediente por solicitud no
 *   está especificada en ninguna sección de §1, y el detalle de §1.3 ya cubre lo
 *   que existe. Inventar la pantalla sería salirse del alcance; esconder el menú
 *   haría que la barra contradijera al diseño. Se muestra y se explica.
 *
 * ## El estado activo se calcula
 *
 * Estaba fijo (`active: true` en el primer elemento), así que "Consola" se veía
 * seleccionada aunque la bandeja estuviera filtrada por otra cosa. Ahora sale de
 * `pathname` + `useSearchParams`, que es lo que hace falta para que la barra
 * diga la verdad — y es la razón por la que este componente es cliente y el
 * header sigue siendo Server Component.
 */

const VISTA_COLA_OPERATIVA = "por_asignar"

export function NavPrincipal() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const enConsola = pathname === "/consola"
  const enColaOperativa =
    enConsola && searchParams.get("vista") === VISTA_COLA_OPERATIVA

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      <ItemNav
        href="/consola"
        label="Consola"
        // "Consola" no se marca activa cuando la vista es la cola operativa:
        // las dos apuntan a la misma ruta y sin esta resta se encenderían las
        // dos a la vez, que es peor que ninguna.
        activo={enConsola && !enColaOperativa}
      />
      <ItemNav
        href={`/consola?vista=${VISTA_COLA_OPERATIVA}&orden=sla_desc`}
        label="Cola operativa"
        activo={enColaOperativa}
      />
      <ItemNavDeshabilitado
        label="Expediente"
        motivo="No disponible en esta versión"
      />
    </nav>
  )
}

const CLASES_BASE =
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors"

function ItemNav({
  href,
  label,
  activo,
}: {
  href: string
  label: string
  activo: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={cn(
        CLASES_BASE,
        activo
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  )
}

/**
 * Elemento visible pero no navegable.
 *
 * `aria-disabled` en vez de quitar el elemento: un lector de pantalla debe poder
 * anunciar que la sección existe y que hoy no está disponible. `pointer-events-none`
 * va en el interior y el `Tooltip` cuelga del `<span>` envolvente, porque un
 * elemento sin eventos de puntero nunca dispararía el tooltip por sí mismo —
 * mismo patrón que `RadioCards` en el wizard y que `AssignPrimaryButton` en el
 * detalle.
 */
function ItemNavDeshabilitado({
  label,
  motivo,
}: {
  label: string
  motivo: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex">
            <span
              aria-disabled="true"
              className={cn(
                CLASES_BASE,
                "pointer-events-none text-muted-foreground opacity-60",
              )}
            >
              {label}
            </span>
          </span>
        }
      />
      <TooltipContent>{motivo}</TooltipContent>
    </Tooltip>
  )
}
