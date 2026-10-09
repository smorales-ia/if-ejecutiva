/**
 * Plazo de la etapa vigente en **horas hábiles**, para la bandeja y el detalle
 * de IF-02 (Actividad A-02 · RF-53 · Spec §5.2.1 y §5.2.4).
 *
 * ## Por qué existe
 *
 * La píldora de etapa (`etiquetaEtapa` en `lib/solicitudes.ts`) mide contra
 * `sla_etapa_vence_ts` con **reloj de pared**: un viernes a las 17:00 con
 * vencimiento el lunes a las 11:00 dice "Vence en 2d 18h", cuando según
 * §5.2.1 (lunes a viernes, 09:00–18:00, sin feriados) quedan tres horas
 * hábiles. Y el lugar destacado de la fila lo ocupaba el agregado "N días",
 * que en las altas nuevas es un valor de relleno (`computeSlaDias`). El
 * resultado era que la Ejecutiva leía "quedan dos días" sobre una etapa que
 * vencía esa misma mañana (C-02).
 *
 * Este módulo no cambia `etiquetaEtapa` —la usa también IF-03
 * (`lib/tasador/lectura-tasacion.ts`)— ni el agregado: sólo decide, para la
 * presentación, si la etapa puede ocupar el lugar destacado y con qué texto.
 *
 * ## Qué es y qué no es
 *
 * - **Puro y apto para cliente.** Sólo importa `minutosHabilesEntre` de
 *   `./sla-habil` (sin I/O) y tipos de `./console-data`. Los feriados no se
 *   leen acá: llegan ya calculados en `slaEtapa.minutosHabilesAlVence`, que el
 *   read-layer server-side llena con `obtenerFeriados()` (`lib/feriados.ts`).
 * - **No es un segundo semáforo.** El color sigue siendo `slaEtapa.tono`, el
 *   literal de `sla_semaforo_etapa`; aquí no se recalcula (RO-05). Por eso un
 *   verde/ámbar con minutos ≤ 0 no se destaca: el texto contradiría al color.
 * - **No contiene ningún número de SLA.** Los umbrales viven en `C_SLA_Etapas`;
 *   el motor los materializó en `sla_etapa_vence_ts`.
 *
 * ## Cuándo se destaca la etapa
 *
 * Sólo si la etapa vigente es la que corresponde al estado según §5.2.4 «De →
 * A»: `creada` ↔ e1 (Ingreso de solicitud) y `asignada` ↔ e2 (Coordinación de
 * visita, la que abre SC-Asignar en `app/api/solicitudes/[id]/asignar/route.ts`).
 * Es una condición de presentación, no un número de SLA. Evita destacar una e2
 * que quedó pegada en solicitudes ya visitadas porque las etapas 3–7 no tienen
 * escritor (CI-037). En cualquier otro caso, `plazoEtapaDestacado` devuelve
 * `null` y la UI se ve exactamente igual que antes.
 */

import { minutosHabilesEntre } from './sla-habil'
import type { EstadoSolicitud, SlaEtapaSolicitud, Solicitud } from './console-data'

/**
 * Minutos hábiles con signo entre `ahora` y el vencimiento de la etapa.
 *
 * Positivo = falta; negativo = venció hace ese tiempo hábil; `0` = vence o
 * venció fuera de horario sin que haya corrido tiempo hábil. `null` cuando
 * falta el vencimiento o los feriados: sin calendario no se fabrica un número.
 */
export function minutosHabilesAlVence(
  vence: Date | null,
  ahora: Date,
  feriados: ReadonlySet<string> | undefined
): number | null {
  if (!vence || !feriados) return null
  const minutos =
    ahora.getTime() < vence.getTime()
      ? minutosHabilesEntre(ahora, vence, feriados)
      : -minutosHabilesEntre(vence, ahora, feriados)
  return minutos === 0 ? 0 : minutos
}

/**
 * Duración hábil corta: "4h" · "3h 20m" · "45m" · "41h 5m" · "0m".
 *
 * Nunca en días: un "día" hábil son nueve horas y escribirlo como "1d" se lee
 * como veinticuatro. Un negativo se escribe "0m"; el signo lo pone el llamador.
 */
export function duracionHabil(min: number): string {
  const minutos = Math.max(0, Math.round(min))
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas > 0) return resto > 0 ? `${horas}h ${resto}m` : `${horas}h`
  return `${resto}m`
}

/**
 * Etapa que corresponde a cada estado según §5.2.4 «De → A». Condición de
 * presentación, no número de SLA (ver docblock del módulo · CI-037).
 */
export const ETAPA_DESTACABLE_POR_ESTADO: Partial<Record<EstadoSolicitud, 1 | 2>> = {
  creada: 1,
  asignada: 2,
}

export interface PlazoEtapaDestacado {
  /** Lo que consume `SLABadge`; `etiqueta` es el texto en horas hábiles. */
  etapa: Pick<SlaEtapaSolicitud, 'numero' | 'nombre' | 'tono' | 'etiqueta'>
  /** El agregado en días, que pasa al lugar secundario sin cambios. */
  agregado: { dias: number; total: number }
}

/**
 * Decide si el plazo de la etapa ocupa el lugar destacado y con qué texto.
 *
 * `null` (= la UI de antes) si no hay `slaEtapa`, si el tono es `sin_dato`, si
 * falta `venceTs` o `minutosHabilesAlVence`, si la etapa no es la del estado, o
 * si un verde/ámbar llega con minutos ≤ 0.
 */
export function plazoEtapaDestacado(
  s: Pick<Solicitud, 'estado' | 'slaEtapa' | 'slaDias' | 'slaTotal'>
): PlazoEtapaDestacado | null {
  const etapa = s.slaEtapa
  if (!etapa) return null
  if (etapa.tono === 'sin_dato') return null
  if (!etapa.venceTs) return null
  const m = etapa.minutosHabilesAlVence
  if (m === null || m === undefined) return null
  if (etapa.numero !== ETAPA_DESTACABLE_POR_ESTADO[s.estado]) return null

  let etiqueta: string
  if (etapa.tono === 'rojo') {
    etiqueta = m < 0 ? `Vencida hace ${duracionHabil(-m)} hábiles` : 'Vencida'
  } else {
    if (m <= 0) return null
    etiqueta = `Quedan ${duracionHabil(m)} hábiles`
  }

  return {
    etapa: { numero: etapa.numero, nombre: etapa.nombre, tono: etapa.tono, etiqueta },
    agregado: { dias: s.slaDias, total: s.slaTotal },
  }
}
