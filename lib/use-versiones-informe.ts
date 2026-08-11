"use client"

import * as React from "react"

import { esRespuestaDeClerkSinSesion } from "@/lib/clerk-response"
import type { VersionInformeGenerado } from "@/lib/documentos-generados"

/**
 * Hook cliente para las versiones del informe
 * (`GET /api/solicitudes/[id]/versiones-informe` → `TX_DocumentosGenerados`).
 *
 * ## Se lee sólo con la pestaña Adjuntos abierta
 *
 * A diferencia de la cronología o la decisión del motor, este dato no alimenta
 * ningún aviso fuera de su pestaña, así que no hay razón para pagar la lectura
 * en cada selección de la lista. Mismo criterio que `useAdjuntosSolicitud` con
 * su sheet: el llamador decide con `activo`.
 *
 * ## Lista vacía ≠ fallo
 *
 * `versiones: []` sin `error` significa que el pipeline PDF todavía no generó
 * ningún informe — el estado normal de casi toda la cartera hoy—. Con `error` en
 * `true` significa que no pudimos leer. La pestaña los dice distinto.
 */

export interface EstadoVersionesInforme {
  versiones: VersionInformeGenerado[]
  cargando: boolean
  error: boolean
  /** El fallo fue de sesión, no de datos. Ver `lib/clerk-response.ts`. */
  sesionExpirada: boolean
}

export function useVersionesInforme(
  solicitudId: string,
  activo: boolean,
): EstadoVersionesInforme {
  const [versiones, setVersiones] = React.useState<VersionInformeGenerado[]>([])
  const [cargando, setCargando] = React.useState(activo)
  const [error, setError] = React.useState(false)
  const [sesionExpirada, setSesionExpirada] = React.useState(false)

  React.useEffect(() => {
    if (!activo || !solicitudId) {
      setVersiones([])
      setCargando(false)
      setError(false)
      setSesionExpirada(false)
      return
    }

    let vivo = true
    setCargando(true)

    fetch(`/api/solicitudes/${solicitudId}/versiones-informe`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) {
          const deClerk = esRespuestaDeClerkSinSesion(res)
          if (vivo) setSesionExpirada(deClerk)
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/versiones-informe → ${res.status}` +
              (deClerk
                ? " · respuesta de Clerk (sin sesión), el Route Handler no llegó a ejecutarse"
                : ""),
          )
        }
        const body = (await res.json()) as { data?: VersionInformeGenerado[] }
        return body.data ?? []
      })
      .then((data) => {
        if (!vivo) return
        setVersiones(data)
        setError(false)
        setSesionExpirada(false)
      })
      .catch((err) => {
        console.error("[useVersionesInforme]", err)
        if (!vivo) return
        setVersiones([])
        setError(true)
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
    }
  }, [solicitudId, activo])

  return { versiones, cargando, error, sesionExpirada }
}
