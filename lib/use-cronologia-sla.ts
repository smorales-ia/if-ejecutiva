"use client"

import * as React from "react"

import { esRespuestaDeClerkSinSesion } from "@/lib/clerk-response"
import type { CronologiaSla, EtapaCronologia } from "@/lib/sla-cronologia"

/**
 * Hook cliente para la cronología de las siete etapas
 * (`GET /api/solicitudes/[id]/sla` · Tanda C · §9.6.2 · E-2).
 *
 * ## Por qué se lee siempre y no sólo al abrir "Historial"
 *
 * A diferencia de `useAdjuntosSolicitud`, que espera a que el sheet se abra,
 * este dato alimenta **dos** consumidores: la sección de cronología de la
 * pestaña Historial y el `Alert` de etapa desbordada, que va sobre las pestañas
 * y tiene que verse sin que la Ejecutiva navegue a ninguna parte. Diferirlo
 * escondería justo la alerta que la sección existe para dar.
 *
 * ## Sólo para record IDs reales
 *
 * La ruta `/` sirve un detalle de demostración con ids que no son `rec…`. Ahí el
 * endpoint devolvería 404, así que el hook no dispara nada y la sección muestra
 * su estado vacío. El discriminante lo pasa el llamador (`activo`), que es quien
 * conoce la regla `ES_RECORD_ID`.
 *
 * ## Contrato de fallo
 *
 * Sin datos, `cronologia` queda `null` y `error` en `true`. El consumidor debe
 * distinguirlo de "esta solicitud no tiene etapas instrumentadas": el endpoint
 * devuelve **siempre** siete entradas, así que un `null` nunca significa
 * "ninguna etapa" — significa que no pudimos leer.
 */

export interface EstadoCronologia {
  cronologia: CronologiaSla | null
  cargando: boolean
  error: boolean
  /** El fallo fue de sesión, no de datos. Ver `lib/clerk-response.ts`. */
  sesionExpirada: boolean
}

function esEtapa(valor: unknown): valor is EtapaCronologia {
  if (typeof valor !== "object" || valor === null) return false
  const e = valor as Record<string, unknown>
  return typeof e.numero === "number" && e.numero >= 1 && e.numero <= 7
}

export function useCronologiaSla(
  solicitudId: string,
  activo: boolean,
): EstadoCronologia {
  const [cronologia, setCronologia] = React.useState<CronologiaSla | null>(null)
  const [cargando, setCargando] = React.useState(activo)
  const [error, setError] = React.useState(false)
  const [sesionExpirada, setSesionExpirada] = React.useState(false)

  React.useEffect(() => {
    if (!activo || !solicitudId) {
      // Cambiar de una solicitud real a una de demo tiene que limpiar el dato
      // anterior: sin esto, la cronología de la solicitud previa se quedaría
      // pintada sobre otra ficha.
      setCronologia(null)
      setCargando(false)
      setError(false)
      setSesionExpirada(false)
      return
    }

    let vivo = true
    setCargando(true)

    fetch(`/api/solicitudes/${solicitudId}/sla`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) {
          const deClerk = esRespuestaDeClerkSinSesion(res)
          if (vivo) setSesionExpirada(deClerk)
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/sla → ${res.status}` +
              (deClerk
                ? " · respuesta de Clerk (sin sesión), el Route Handler no llegó a ejecutarse"
                : ""),
          )
        }
        const body = (await res.json()) as { data?: CronologiaSla }
        const data = body.data
        // El contrato del endpoint es "siempre siete entradas". Si llegara otra
        // cosa se trata como fallo de lectura y no como una cronología corta:
        // pintar tres etapas de siete se leería como "las otras cuatro no
        // existen", que es una afirmación que nadie hizo.
        if (!data || !Array.isArray(data.etapas) || !data.etapas.every(esEtapa)) {
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/sla devolvió un cuerpo fuera de contrato`,
          )
        }
        return data
      })
      .then((data) => {
        if (!vivo) return
        setCronologia(data)
        setError(false)
        setSesionExpirada(false)
      })
      .catch((err) => {
        console.error("[useCronologiaSla]", err)
        if (!vivo) return
        setCronologia(null)
        setError(true)
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
    }
  }, [solicitudId, activo])

  return { cronologia, cargando, error, sesionExpirada }
}
