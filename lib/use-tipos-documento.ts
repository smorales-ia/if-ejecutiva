"use client"

import * as React from "react"

import type { CondicionPropiedad, TipoDocumento } from "@/lib/tipos-documento"

/**
 * Hook cliente para el catálogo de tipos de documento de
 * `/api/tipos-documento` (`D_TipoDocumento`).
 *
 * Espeja `lib/use-catalogos.ts` deliberadamente: mismo patrón de promesa
 * compartida, mismo contrato de fallo, mismos nombres de estado. Son dos
 * catálogos de Airtable consumidos desde componentes cliente; que se lean
 * igual es lo que hace que el siguiente sea trivial de escribir.
 *
 * ## Por qué una promesa a nivel de módulo
 *
 * Hoy sólo `DocumentosAdjuntosSheet` lo consume, pero el checklist de
 * documentos vuelve a aparecer en `NewRequestSheet` cuando Tanda 2 reconecte
 * la subida real. Con un `useEffect` por componente serían dos requests
 * idénticos en cuanto ambos estén montados. La promesa compartida hace que el
 * primero que monte dispare el fetch y el segundo se cuelgue del mismo.
 *
 * Un fallo **no** se cachea: `promesa` se limpia en el `catch` para que el
 * siguiente montaje reintente. Un 502 transitorio de Airtable no debe dejar el
 * checklist vacío para toda la sesión.
 *
 * ## Contrato de fallo
 *
 * Si la lectura falla, `tipos` queda vacío y `error` en `true`. El consumidor
 * debe distinguir visualmente ese caso de "cargando" y de "catálogo vacío":
 * un checklist en blanco sin aviso se lee como "esta solicitud no requiere
 * documentos", que es exactamente la conclusión equivocada.
 */

let promesa: Promise<TipoDocumento[]> | null = null

function cargar(): Promise<TipoDocumento[]> {
  if (promesa) return promesa

  promesa = fetch("/api/tipos-documento", { credentials: "same-origin" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`GET /api/tipos-documento → ${res.status}`)
      const body = (await res.json()) as { data?: TipoDocumento[] }
      if (!body.data) throw new Error("GET /api/tipos-documento sin `data`")
      return body.data
    })
    .catch((err) => {
      promesa = null
      throw err
    })

  return promesa
}

export interface EstadoTiposDocumento {
  tipos: TipoDocumento[]
  cargando: boolean
  error: boolean
}

export function useTiposDocumento(): EstadoTiposDocumento {
  const [tipos, setTipos] = React.useState<TipoDocumento[]>([])
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let vivo = true

    cargar()
      .then((data) => {
        if (!vivo) return
        setTipos(data)
        setError(false)
      })
      .catch((err) => {
        console.error("[useTiposDocumento]", err)
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

  return { tipos, cargando, error }
}

export type { CondicionPropiedad, TipoDocumento }
