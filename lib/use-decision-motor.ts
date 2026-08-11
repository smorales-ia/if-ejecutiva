"use client"

import * as React from "react"

import { esRespuestaDeClerkSinSesion } from "@/lib/clerk-response"
import type { DecisionMotor } from "@/lib/decision-motor"

/**
 * Hook cliente para la decisión del motor de reglas
 * (`GET /api/solicitudes/[id]/decision-motor` → `A_DecisionesMotor`).
 *
 * ## Los tres desenlaces son distintos y la UI los distingue
 *
 * - `decision` con datos → AT01 evaluó y hay regla ganadora.
 * - `decision === null` sin `error` → **el motor todavía no evaluó** esta
 *   solicitud. Es normal: AT01 se dispara con `estado = creada` y puede no
 *   haber corrido. No es un fallo.
 * - `error === true` → no pudimos leer.
 *
 * Colapsar los dos últimos en un mismo estado vacío es el error clásico de este
 * bloque: son visualmente idénticos y operativamente opuestos, igual que en
 * `useCronologiaSla` y `useAdjuntosSolicitud`.
 *
 * ## Sólo para record IDs reales
 *
 * `/` sirve un detalle de demostración con ids que no son `rec…`; ahí el
 * endpoint devolvería 404. El discriminante lo pasa el llamador (`activo`), que
 * es quien conoce la regla `ES_RECORD_ID`.
 */

export interface EstadoDecisionMotor {
  decision: DecisionMotor | null
  cargando: boolean
  error: boolean
  /** El fallo fue de sesión, no de datos. Ver `lib/clerk-response.ts`. */
  sesionExpirada: boolean
}

export function useDecisionMotor(
  solicitudId: string,
  activo: boolean,
): EstadoDecisionMotor {
  const [decision, setDecision] = React.useState<DecisionMotor | null>(null)
  const [cargando, setCargando] = React.useState(activo)
  const [error, setError] = React.useState(false)
  const [sesionExpirada, setSesionExpirada] = React.useState(false)

  React.useEffect(() => {
    if (!activo || !solicitudId) {
      // Cambiar de solicitud tiene que limpiar la anterior: sin esto, la
      // decisión de la ficha previa se quedaría pintada sobre otra.
      setDecision(null)
      setCargando(false)
      setError(false)
      setSesionExpirada(false)
      return
    }

    let vivo = true
    setCargando(true)

    fetch(`/api/solicitudes/${solicitudId}/decision-motor`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) {
          const deClerk = esRespuestaDeClerkSinSesion(res)
          if (vivo) setSesionExpirada(deClerk)
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/decision-motor → ${res.status}` +
              (deClerk
                ? " · respuesta de Clerk (sin sesión), el Route Handler no llegó a ejecutarse"
                : ""),
          )
        }
        const body = (await res.json()) as { data?: DecisionMotor | null }
        return body.data ?? null
      })
      .then((data) => {
        if (!vivo) return
        setDecision(data)
        setError(false)
        setSesionExpirada(false)
      })
      .catch((err) => {
        console.error("[useDecisionMotor]", err)
        if (!vivo) return
        setDecision(null)
        setError(true)
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
    }
  }, [solicitudId, activo])

  return { decision, cargando, error, sesionExpirada }
}
