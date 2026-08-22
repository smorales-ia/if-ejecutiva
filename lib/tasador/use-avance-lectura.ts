"use client"

import * as React from "react"

import {
  resolverAvanceLectura,
  type AvanceLectura,
  type ConteoPorEstado,
} from "@/lib/tasador/avance-lectura"

/**
 * Sondeo del avance de la extracción documental — Pantalla 4 (RF-TAS-15).
 *
 * Consume `GET /api/tasaciones/[id]/lectura`, que lee
 * `TX_Adjuntos.estado_extraccion` del pipeline existente. **No dispara nada**
 * (R7): la extracción la corre `SC-RF09-ExtraccionClaude` y esta pantalla sólo
 * mira.
 *
 * ## Por qué existe y qué reemplaza
 *
 * Hasta P6-TAS la rama `lectura` de `estado-procesando.tsx` avanzaba con dos
 * `setTimeout` de 4 y 8 segundos. El stepper llegaba a «Datos listos» —y
 * habilitaba «Continuar»— pasaran ocho segundos y nada más, con la extracción
 * todavía corriendo o fallada. §7.3 lo dice al revés: *«el stepper avanza según
 * el estado backend, no un temporizador local»*.
 *
 * ## Volver no cancela · desmontar sí
 *
 * §7.1 es explícito: *«la extracción sigue en background y no se cancela desde
 * la UI»*. Este hook no tiene forma de cancelarla —no existe endpoint para
 * eso— y su limpieza sólo detiene el **sondeo**, no el proceso. Por eso volver a
 * Fotos y regresar encuentra el progreso donde estaba: el estado vive en
 * Airtable, no acá. Nada que persistir del lado del cliente.
 *
 * ## Se detiene solo
 *
 * Al llegar a un estado completo el intervalo se apaga: seguir preguntando por
 * algo que ya terminó gasta cuota de Airtable —5 req/s por base— sin cambiar
 * nada. Y hay un tope de intentos para el caso en que un adjunto quede colgado
 * en `extrayendo` para siempre, que de otro modo sondearía indefinidamente
 * mientras la pantalla siga abierta.
 */

/** Cadencia del sondeo. La ruta es una sola lectura filtrada por solicitud. */
const INTERVALO_MS = 4000

/**
 * Tope de sondeos, ~10 minutos a 4 s. No cancela la extracción: sólo deja de
 * preguntar y lo dice, para que el tasador no mire una rueda eterna.
 */
const MAX_INTENTOS = 150

/** Literal §6.1 · Regla T-C: no nombra el medio técnico ni el error real. */
export const MSG_LECTURA_FALLIDA =
  "No pudimos leer los datos. Intenta nuevamente en unos segundos."

interface CuerpoLectura {
  total?: number
  terminados?: number
  porEstado?: ConteoPorEstado
}

export interface EstadoAvanceLectura {
  /** Avance resuelto. `null` mientras no llegó la primera respuesta. */
  avance: AvanceLectura | null
  cargando: boolean
  /** `true` si la última lectura falló. El literal a mostrar es humano. */
  error: boolean
  /** `true` si se agotó el tope de sondeos sin que la extracción terminara. */
  agotado: boolean
}

export function useAvanceLectura(id: string): EstadoAvanceLectura {
  const [avance, setAvance] = React.useState<AvanceLectura | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [agotado, setAgotado] = React.useState(false)

  React.useEffect(() => {
    if (!id) return

    // Evita que una respuesta lenta de un id anterior pise la del actual.
    let vigente = true
    let intentos = 0
    let intervalo: ReturnType<typeof setInterval> | undefined

    const detener = () => {
      if (intervalo !== undefined) {
        clearInterval(intervalo)
        intervalo = undefined
      }
    }

    const leer = async () => {
      intentos += 1
      try {
        const res = await fetch(`/api/tasaciones/${id}/lectura`, {
          credentials: "same-origin",
        })
        const sobre = (await res.json()) as { data?: CuerpoLectura }

        if (!vigente) return

        if (!res.ok || !sobre.data) {
          setError(true)
          return
        }

        /**
         * `porEstado` llegó en P6-TAS. Un backend anterior devolvería sólo los
         * agregados, y entonces se reconstruye un conteo mínimo desde
         * `total`/`terminados` en vez de romper: no distingue el desenlace, pero
         * tampoco deja la pantalla en blanco.
         */
        const conteo: ConteoPorEstado =
          sobre.data.porEstado ??
          ({
            listo: sobre.data.terminados ?? 0,
            extrayendo: Math.max(
              0,
              (sobre.data.total ?? 0) - (sobre.data.terminados ?? 0)
            ),
          } as ConteoPorEstado)

        const resuelto = resolverAvanceLectura(conteo)
        setAvance(resuelto)
        setError(false)

        // Terminó: no hay nada más que preguntar.
        if (resuelto.completo) detener()
      } catch {
        if (vigente) setError(true)
      } finally {
        if (vigente) setCargando(false)
      }

      if (vigente && intentos >= MAX_INTENTOS) {
        setAgotado(true)
        detener()
      }
    }

    void leer()
    intervalo = setInterval(leer, INTERVALO_MS)

    /**
     * Limpieza al **desmontar** (§7.2 paso 5). Detiene el sondeo y nada más: la
     * extracción sigue corriendo en el backend, que es justo lo que §7.1 pide.
     */
    return () => {
      vigente = false
      detener()
    }
  }, [id])

  return { avance, cargando, error, agotado }
}
