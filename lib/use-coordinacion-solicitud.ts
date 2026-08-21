"use client"

import * as React from "react"

import { esRespuestaDeClerkSinSesion } from "@/lib/clerk-response"
import type { CoordinacionSolicitud } from "@/lib/coordinacion"

/**
 * Hook cliente para la coordinación de la visita
 * (`GET /api/solicitudes/[id]/coordinacion` → `TX_CoordinacionVisita`).
 *
 * ## Los tres desenlaces son distintos y la UI los distingue (RO-34)
 *
 * - `datos` con `coordinacionVigente` → el tasador ya llamó y hay desenlace.
 * - `datos` con `coordinacionVigente: null` e `intentos: []` → **todavía no se
 *   coordinó**. Es el curso normal de una solicitud recién asignada, no un fallo.
 * - `error === true` → no pudimos leer.
 *
 * Colapsar los dos últimos en un mismo estado vacío es el error clásico de este
 * bloque: son visualmente idénticos y operativamente opuestos, igual que en
 * `useDecisionMotor`, `useCronologiaSla` y `useAdjuntosSolicitud`.
 *
 * ## Sólo lectura (RO-35)
 *
 * El efecto de montaje hace un `GET` y nada más. Ninguna escritura, ninguna
 * transición de estado: abrir el expediente no puede alterar la coordinación.
 *
 * ## Sólo para record IDs reales
 *
 * `/` sirve un detalle de demostración con ids que no son `rec…`; ahí el
 * endpoint devolvería 404. El discriminante lo pasa el llamador (`activo`), que
 * es quien conoce la regla `ES_RECORD_ID`.
 */

/**
 * ⚠ **`EstadoCoordinacionUI`, no `EstadoCoordinacion`**: ese nombre ya está
 * tomado en `lib/tasaciones.ts` por el desenlace del intento
 * (`'confirmada' | 'rechazada'`), que es un dato de Airtable y no el estado de
 * una lectura. Dos cosas distintas con el mismo nombre en el mismo repo es
 * exactamente el tipo de colisión que §22 del schema obliga a evitar.
 */
export interface EstadoCoordinacionUI {
  datos: CoordinacionSolicitud | null
  cargando: boolean
  error: boolean
  /** El fallo fue de sesión, no de datos. Ver `lib/clerk-response.ts`. */
  sesionExpirada: boolean
}

export function useCoordinacionSolicitud(
  solicitudId: string,
  activo: boolean,
): EstadoCoordinacionUI {
  const [datos, setDatos] = React.useState<CoordinacionSolicitud | null>(null)
  const [cargando, setCargando] = React.useState(activo)
  const [error, setError] = React.useState(false)
  const [sesionExpirada, setSesionExpirada] = React.useState(false)

  React.useEffect(() => {
    if (!activo || !solicitudId) {
      // Cambiar de solicitud tiene que limpiar la anterior: sin esto, la
      // coordinación de la ficha previa se quedaría pintada sobre otra.
      setDatos(null)
      setCargando(false)
      setError(false)
      setSesionExpirada(false)
      return
    }

    let vivo = true
    setCargando(true)

    fetch(`/api/solicitudes/${solicitudId}/coordinacion`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) {
          const deClerk = esRespuestaDeClerkSinSesion(res)
          if (vivo) setSesionExpirada(deClerk)
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/coordinacion → ${res.status}` +
              (deClerk
                ? " · respuesta de Clerk (sin sesión), el Route Handler no llegó a ejecutarse"
                : ""),
          )
        }
        const body = (await res.json()) as { data?: CoordinacionSolicitud | null }
        return body.data ?? null
      })
      .then((data) => {
        if (!vivo) return
        setDatos(data)
        setError(false)
        setSesionExpirada(false)
      })
      .catch((err) => {
        console.error("[useCoordinacionSolicitud]", err)
        if (!vivo) return
        // `datos` vuelve a `null` y `error` a `true`: la sección tiene que poder
        // decir "no pudimos leer" y no "no se ha coordinado", que es otra cosa.
        setDatos(null)
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
