"use client"

import * as React from "react"

import type { Catalogos, OpcionMaestra } from "@/lib/catalogos"

/**
 * Hook cliente para los catálogos maestros de `/api/catalogos`.
 *
 * ## Por qué una promesa a nivel de módulo
 *
 * Tres componentes distintos necesitan los mismos catálogos y pueden estar
 * montados a la vez: `SolicitudList` (filtro de cliente), `NewRequestSheet`
 * (Sección A y D del alta) y `EditarSolicitudForm`. Con un `useEffect` por
 * componente serían 3 requests idénticos. La promesa compartida hace que el
 * primero que monte dispare el fetch y los demás se cuelguen del mismo.
 *
 * Un fallo se cachea igual que un éxito **no**: `promesa` se limpia en el
 * `catch` para que el siguiente montaje reintente. Un catálogo que falló por un
 * 502 transitorio de Airtable no debe quedar vacío para toda la sesión.
 *
 * ## Contrato de fallo
 *
 * Si la lectura falla, `catalogos` queda con listas vacías y `error` en `true`.
 * Un select vacío es la degradación correcta: sin catálogo no hay forma de
 * saber qué valores existen en Airtable, y dejar que la Ejecutiva elija de una
 * lista adivinada es exactamente el bug que este módulo cierra
 * (`lib/catalogos.ts`).
 */

const VACIO: Catalogos = {
  clientes: [],
  tiposInforme: [],
  tiposPropiedad: [],
  productos: [],
  bancos: [],
}

let promesa: Promise<Catalogos> | null = null

function cargar(): Promise<Catalogos> {
  if (promesa) return promesa

  promesa = fetch("/api/catalogos", { credentials: "same-origin" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`GET /api/catalogos → ${res.status}`)
      const body = (await res.json()) as { data?: Catalogos }
      if (!body.data) throw new Error("GET /api/catalogos sin `data`")
      return body.data
    })
    .catch((err) => {
      promesa = null
      throw err
    })

  return promesa
}

export interface EstadoCatalogos {
  catalogos: Catalogos
  cargando: boolean
  error: boolean
}

export function useCatalogos(): EstadoCatalogos {
  const [catalogos, setCatalogos] = React.useState<Catalogos>(VACIO)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let vivo = true

    cargar()
      .then((data) => {
        if (!vivo) return
        setCatalogos(data)
        setError(false)
      })
      .catch((err) => {
        console.error("[useCatalogos]", err)
        if (!vivo) return
        setError(true)
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
    }
  }, [])

  return { catalogos, cargando, error }
}

export type { Catalogos, OpcionMaestra }
