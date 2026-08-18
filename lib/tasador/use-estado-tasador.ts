"use client"

/**
 * Estado backend de una tasación, para las pantallas que lo vigilan.
 *
 * Consume `GET /api/tasaciones/[id]/estado`, la ruta mínima que P2-TAS.A
 * escribió para esto: un estado y dos derivados, barata de llamar en bucle.
 *
 * ## Dónde vive — OV-9
 *
 * El v0 lo importaba de `@/hooks/use-estado-tasador`, pero **`hooks/` no existe
 * como directorio raíz y R5 no lo autoriza**: el territorio de escritura de
 * IF-03 son `app/tasaciones/**`, `app/api/tasaciones/**`, `components/tasador/**`
 * y `lib/tasador/**`. Crear `hooks/` habría necesitado una excepción como la de
 * OV-5. IF-02 resuelve lo mismo poniendo sus hooks en `lib/use-*.ts`, así que
 * éste vive en `lib/tasador/` y los cuatro imports del v0 se reescribieron.
 *
 * ## Lo que este hook NO expone — CI-015
 *
 * El v0 exportaba `MAX_INTENTOS` y devolvía `intentosEnvio`: los tres intentos
 * de envío al visador que la spec §2 **retiró**. CI-015 es la única ficha del
 * lote 7 donde el diseño estaba equivocado y el documento tenía razón, y manda
 * corregir el código. Reponerlos acá para que `intentos-indicator.tsx`
 * compilara habría sido reconstruir a propósito la deuda que la ficha pide
 * borrar; el componente se eliminó en esta tanda.
 *
 * ## Por qué el polling no arranca solo
 *
 * `activo` lo decide el llamador. La pantalla de avance (P8-TAS) lo quiere
 * encendido mientras el cálculo corre; el preview del informe sólo necesita una
 * lectura. Un hook que sondea siempre pagaría una petición cada pocos segundos
 * en pantallas que no cambian de estado nunca.
 */

import * as React from "react"

/** Cuerpo de `GET /api/tasaciones/[id]/estado`. */
export interface EstadoBackendTasacion {
  id: string
  estado: string | null
  /** El formulario es de sólo lectura desde que la solicitud sale de `asignada` (RF-TAS-07). */
  bloqueadoParaEdicion: boolean
  /** El informe está disponible para revisar. */
  informeDisponible: boolean
}

export interface EstadoTasador {
  estado: EstadoBackendTasacion | null
  cargando: boolean
  error: boolean
  /** Vuelve a leer el estado ahora, sin esperar al siguiente ciclo. */
  refrescar: () => void
  /**
   * Dispara la transición `asignada → visitada` y refresca.
   *
   * Propaga el error para que el llamador cierre el ciclo de la Regla D: quien
   * pintó el spinner es quien tiene que mostrar el fallo.
   */
  enviarParaCalculo: () => Promise<void>
}

/** Cadencia del sondeo. La ruta de estado es deliberadamente barata. */
const INTERVALO_MS = 4000

export function useEstadoTasador(id: string, activo = true): EstadoTasador {
  const [estado, setEstado] = React.useState<EstadoBackendTasacion | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [tick, setTick] = React.useState(0)

  const refrescar = React.useCallback(() => setTick((t) => t + 1), [])

  React.useEffect(() => {
    if (!id) return

    // Evita que una respuesta lenta de un id anterior pise la del actual.
    let vigente = true

    const leer = async () => {
      try {
        const res = await fetch(`/api/tasaciones/${id}/estado`, {
          credentials: "same-origin",
        })
        const sobre = (await res.json()) as { data?: EstadoBackendTasacion }

        if (!vigente) return

        if (!res.ok || !sobre.data) {
          setError(true)
        } else {
          setEstado(sobre.data)
          setError(false)
        }
      } catch {
        if (vigente) setError(true)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    void leer()

    if (!activo) return () => {
      vigente = false
    }

    const intervalo = setInterval(leer, INTERVALO_MS)
    return () => {
      vigente = false
      clearInterval(intervalo)
    }
  }, [id, activo, tick])

  const enviarParaCalculo = React.useCallback(async () => {
    const res = await fetch(`/api/tasaciones/${id}/calcular`, {
      method: "POST",
      credentials: "same-origin",
    })

    if (!res.ok) {
      const sobre = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(
        sobre.error ||
          "No pudimos completar la acción. Intenta nuevamente en unos segundos.",
      )
    }

    refrescar()
  }, [id, refrescar])

  return { estado, cargando, error, refrescar, enviarParaCalculo }
}
