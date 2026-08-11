"use client"

import * as React from "react"
import Link from "next/link"

/**
 * Indicador de cartera del header: "En tu cartera: X activas · Y en SLA rojo"
 * (§1.2 · RN-04).
 *
 * ## Qué cambió respecto de la maqueta
 *
 * Los dos números estaban escritos a mano en el JSX —"12 activas · 3 en SLA
 * rojo"— y no venían de ninguna parte. Ahora salen de
 * `GET /api/solicitudes/contadores`, el mismo endpoint que alimenta los
 * contadores de las pestañas, de modo que la cifra del header y la de la
 * pestaña no pueden discrepar (RO-05).
 *
 * ## El número y su destino miden lo mismo
 *
 * "Y en SLA rojo" enlaza a `/consola?vista=mi_cartera&sla=rojo`, que es
 * literalmente la consulta que produjo Y. La alternativa —enlazar a la pestaña
 * global "SLA en riesgo"— haría que la ejecutiva viera un 3 y aterrizara en una
 * lista de doce, porque esa pestaña no filtra por cartera propia y además
 * incluye el ámbar.
 *
 * ## Silencio mientras carga y ante el fallo
 *
 * No se pinta nada hasta tener cifras. Un "0 activas · 0 en SLA rojo" mientras
 * llega la respuesta es una afirmación falsa sobre la carga de trabajo de la
 * persona, y en el caso del rojo es justo la que haría bajar la guardia.
 */

const CLAVE_CARTERA = "mi_cartera"
const CLAVE_CARTERA_ROJO = "mi_cartera_rojo"

export function IndicadorCartera() {
  const [contadores, setContadores] = React.useState<Record<
    string,
    number
  > | null>(null)

  React.useEffect(() => {
    let vivo = true
    fetch("/api/solicitudes/contadores", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (vivo && j?.contadores) setContadores(j.contadores)
      })
      .catch(() => {
        // Un indicador informativo que falla no merece un banner: se calla.
        // El dato real está a un clic, en las pestañas de la bandeja.
      })
    return () => {
      vivo = false
    }
  }, [])

  if (!contadores) return null

  const activas = contadores[CLAVE_CARTERA] ?? 0
  const rojas = contadores[CLAVE_CARTERA_ROJO] ?? 0

  return (
    <span className="hidden text-xs text-muted-foreground xl:inline">
      En tu cartera:{" "}
      <Link
        href="/consola?vista=mi_cartera"
        className="font-medium text-foreground hover:underline"
      >
        {activas} activa{activas === 1 ? "" : "s"}
      </Link>
      {" · "}
      {/* Sin solicitudes en rojo no hay a dónde ir: el enlace llevaría a una
          lista vacía. Se muestra el cero en gris, sin acción, que además es la
          lectura correcta —no hay nada urgente— en vez de una alarma apagada. */}
      {rojas > 0 ? (
        <Link
          href="/consola?vista=mi_cartera&sla=rojo"
          className="font-medium text-[#b91c1c] hover:underline"
        >
          {rojas} en SLA rojo
        </Link>
      ) : (
        <span className="font-medium text-foreground">0 en SLA rojo</span>
      )}
    </span>
  )
}
