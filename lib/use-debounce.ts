import { useEffect, useState } from "react"

/**
 * Devuelve una versión retrasada de `value` que sólo se actualiza tras `delayMs`
 * sin cambios. Se usa para el buscador de la lista (evita disparar un refetch
 * por cada tecla). Sin dependencias externas.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])

  return debounced
}
