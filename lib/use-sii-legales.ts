"use client"

import * as React from "react"

import { esRespuestaDeClerkSinSesion } from "@/lib/clerk-response"
import { SII_LEGALES_VACIO, type SiiLegales } from "@/lib/sii-legales"

/**
 * Hook cliente para «Datos SII» y «Antecedentes legales»
 * (`GET /api/solicitudes/[id]/sii-legales`). Mismo patrón que
 * `useDecisionMotor`: `activo` es falso para los ids de demostración (no `rec…`),
 * y ahí los bloques quedan en «—» en vez de pedir un 404.
 */

export interface EstadoSiiLegales {
  datos: SiiLegales
  cargando: boolean
  error: boolean
  sesionExpirada: boolean
}

export function useSiiLegales(solicitudId: string, activo: boolean): EstadoSiiLegales {
  const [datos, setDatos] = React.useState<SiiLegales>(SII_LEGALES_VACIO)
  const [cargando, setCargando] = React.useState(activo)
  const [error, setError] = React.useState(false)
  const [sesionExpirada, setSesionExpirada] = React.useState(false)

  React.useEffect(() => {
    if (!activo || !solicitudId) {
      setDatos(SII_LEGALES_VACIO)
      setCargando(false)
      setError(false)
      setSesionExpirada(false)
      return
    }

    let vivo = true
    setCargando(true)
    // Al cambiar de solicitud no se deja pintada la anterior mientras carga.
    setDatos(SII_LEGALES_VACIO)

    fetch(`/api/solicitudes/${solicitudId}/sii-legales`, { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) {
          const deClerk = esRespuestaDeClerkSinSesion(res)
          if (vivo) setSesionExpirada(deClerk)
          throw new Error(`GET /api/solicitudes/${solicitudId}/sii-legales → ${res.status}`)
        }
        const body = (await res.json()) as { data?: SiiLegales }
        return body.data ?? SII_LEGALES_VACIO
      })
      .then((data) => {
        if (!vivo) return
        setDatos(data)
        setError(false)
        setSesionExpirada(false)
      })
      .catch((err) => {
        console.error("[useSiiLegales]", err)
        if (!vivo) return
        setDatos(SII_LEGALES_VACIO)
        setError(true)
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
    }
  }, [solicitudId, activo])

  return { datos, cargando, error, sesionExpirada }
}
