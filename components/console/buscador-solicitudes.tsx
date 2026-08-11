"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDebounce } from "@/lib/use-debounce"

/**
 * Buscador global de solicitudes (§1.1).
 *
 * ## Por qué es un componente propio
 *
 * Vivía dentro de `solicitud-list.tsx`, y el header tenía **otro** input de
 * búsqueda que era pura decoración: sin estado, sin handler y sin sincronía con
 * la URL. Dos buscadores en pantalla, uno de los cuales no buscaba. Se unificó
 * en éste, montado en `AppHeader`, que es donde el diseño lo pone.
 *
 * ## Por qué escribe en la URL y no en un estado
 *
 * `?q=` lo lee el Server Component de `/consola`, que es quien consulta
 * Airtable: `lib/solicitudes.ts` arma
 * `OR(FIND(q, codigo_ext), FIND(q, cliente_final_rut), FIND(q, direccion))`. La
 * búsqueda es server-side de punta a punta, así que el enlace resultante es
 * compartible y el back/forward del navegador funciona sin código extra.
 *
 * ## El debounce y el Enter conviven
 *
 * 300 ms de espera para no disparar una consulta por tecla, y Enter para
 * saltarse la espera cuando la ejecutiva ya terminó de escribir. Sin el Enter,
 * pegar un código y pulsar la tecla no hace nada visible durante un tercio de
 * segundo, que se siente como que la pantalla no responde.
 */
export function BuscadorSolicitudes({
  className,
  /**
   * Ruta a la que navegar al buscar. El header vive en el layout, así que puede
   * estar montado sobre una ruta que no es la consola; por defecto se usa la
   * ruta actual para no sacar a nadie de donde está.
   */
  destino,
}: {
  className?: string
  destino?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const qParam = searchParams.get("q") ?? ""
  const [qLocal, setQLocal] = React.useState(qParam)
  const qDebounced = useDebounce(qLocal, 300)

  // La URL manda: si cambia por navegación (back/forward, un enlace con `?q=`,
  // "Limpiar filtros"), el input se alinea con ella.
  React.useEffect(() => {
    setQLocal(qParam)
  }, [qParam])

  const aplicar = React.useCallback(
    (valor: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      if (valor) params.set("q", valor)
      else params.delete("q")
      // Cambiar la búsqueda cambia el conjunto de resultados: la página y la
      // fila seleccionada del conjunto anterior dejan de ser válidas. Misma
      // regla que `updateParams` en `solicitud-list.tsx`.
      params.delete("page")
      params.delete("solicitud")
      const base = destino ?? pathname
      const qs = params.toString()
      router.push(qs ? `${base}?${qs}` : base)
    },
    [router, pathname, searchParams, destino],
  )

  React.useEffect(() => {
    if (qDebounced !== qParam) aplicar(qDebounced)
    // `aplicar` cambia en cada render porque depende de `searchParams`; incluirlo
    // dispararía el efecto en bucle. La dependencia real es el valor debounced.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced])

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={qLocal}
        onChange={(e) => setQLocal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") aplicar(qLocal)
        }}
        aria-label="Buscar solicitudes"
        placeholder="Buscar por código VP-AAAA-NNNN, RUT o dirección"
        className="h-9 w-full rounded-lg border border-input bg-background pr-9 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      />
      {qLocal && (
        <button
          type="button"
          onClick={() => {
            setQLocal("")
            aplicar("")
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
