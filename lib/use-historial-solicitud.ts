"use client"

import * as React from "react"

import { esRespuestaDeClerkSinSesion } from "@/lib/clerk-response"
import type { ItemHistorial } from "@/lib/historial"

/**
 * Hook cliente para el timeline de §1.3.3
 * (`GET /api/solicitudes/[id]/eventos` → `A_Eventos` + `A_Cambios`).
 *
 * ## Por qué se lee de entrada y no al abrir la pestaña
 *
 * Se leía nada: la pestaña pintaba el mock `HISTORIAL`. Al cablearla, la opción
 * de diferir la lectura hasta que la Ejecutiva pulse "Historial" tiene un coste
 * concreto —la pestaña aparece vacía y luego salta— y un beneficio nulo: la
 * lectura ya corre en paralelo con la de cronología, que tampoco se difiere
 * (`useCronologiaSla`). Mismo criterio, misma latencia percibida.
 *
 * ## `recargar` existe por la asignación
 *
 * Tras asignar tasador, SC-Asignar escribe dos filas en `A_Eventos`. El detalle
 * las muestra al instante con un update optimista, pero necesita releer para
 * quedarse con las de verdad —con su id y su timestamp de servidor— en vez de
 * con las fabricadas en el navegador.
 *
 * ## Contrato de fallo
 *
 * Sin datos, `items` queda vacío y `error` en `true`. El consumidor debe
 * distinguirlo de "esta solicitud no tiene eventos": son visualmente idénticos y
 * operativamente opuestos.
 */

export interface EstadoHistorial {
  items: ItemHistorial[]
  cargando: boolean
  error: boolean
  /** El fallo fue de sesión, no de datos. Ver `lib/clerk-response.ts`. */
  sesionExpirada: boolean
  recargar: () => void
}

export function useHistorialSolicitud(
  solicitudId: string,
  activo: boolean,
): EstadoHistorial {
  const [items, setItems] = React.useState<ItemHistorial[]>([])
  const [cargando, setCargando] = React.useState(activo)
  const [error, setError] = React.useState(false)
  const [sesionExpirada, setSesionExpirada] = React.useState(false)
  const [nonce, setNonce] = React.useState(0)

  const recargar = React.useCallback(() => setNonce((n) => n + 1), [])

  React.useEffect(() => {
    if (!activo || !solicitudId) {
      // Cambiar de solicitud tiene que limpiar la anterior: sin esto, el
      // historial de la ficha previa se quedaría pintado sobre otra.
      setItems([])
      setCargando(false)
      setError(false)
      setSesionExpirada(false)
      return
    }

    let vivo = true
    setCargando(true)

    fetch(`/api/solicitudes/${solicitudId}/eventos`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) {
          const deClerk = esRespuestaDeClerkSinSesion(res)
          if (vivo) setSesionExpirada(deClerk)
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/eventos → ${res.status}` +
              (deClerk
                ? " · respuesta de Clerk (sin sesión), el Route Handler no llegó a ejecutarse"
                : ""),
          )
        }
        const body = (await res.json()) as { data?: ItemHistorial[] }
        if (!Array.isArray(body.data)) {
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/eventos devolvió un cuerpo fuera de contrato`,
          )
        }
        return body.data
      })
      .then((data) => {
        if (!vivo) return
        setItems(data)
        setError(false)
        setSesionExpirada(false)
      })
      .catch((err) => {
        console.error("[useHistorialSolicitud]", err)
        if (!vivo) return
        setItems([])
        setError(true)
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
    }
  }, [solicitudId, activo, nonce])

  return { items, cargando, error, sesionExpirada, recargar }
}
