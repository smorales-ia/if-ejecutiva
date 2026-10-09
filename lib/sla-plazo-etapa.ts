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
 * Es una condición de presentación, no un número de SLA. El emparejamiento
 * estado↔etapa evita destacar etapas que no corresponden al estado: por
 * ejemplo, una e2 sin cerrar en una solicitud ya `visitada`. Ojo: una fila
 * anterior al Frente C (RF-TAS-05) que siga `asignada` con e2 abierta **sí** se
 * destaca —si está roja, como «Vencida hace …»—, porque para el sistema el
 * llamado nunca se registró.
 *
 * Además, un **rojo** sólo se destaca si la etapa tiene escritor de cierre
 * (`ETAPAS_CON_CIERRE_ESCRITO`): sin escritor, «Vencida hace …» podría ser un
 * vencimiento falso (Spec §8: si la etapa no es computable, caer al
 * comportamiento actual, nunca inventar datos). Hoy lo tienen e1 y e2. e1 la
 * cierra SC-Asignar vía `marcarFinEtapa(id, 1…)` en
 * `app/api/solicitudes/[id]/asignar/route.ts`; e2 la cierra el registro del
 * resultado del llamado en IF-03 (`marcarFinEtapa(id, 2…)` en
 * `app/api/tasaciones/[id]/coordinacion/route.ts`, Frente C · RF-TAS-05). Por
 * eso una `asignada` con e2 roja es un llamado vencido real que no se
 * registró, y se destaca como «Vencida hace … hábiles».
 *
 * En cualquier otro caso, `plazoEtapaDestacado` devuelve `null` y la UI se ve
 * exactamente igual que antes.
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

/**
 * Etapas cuyo fin tiene escritor hoy; sólo para ellas un rojo es un
 * vencimiento verificable.
 *
 * - e1 la cierra SC-Asignar (`marcarFinEtapa(id, 1…)` en
 *   `app/api/solicitudes/[id]/asignar/route.ts`).
 * - e2 la cierra el registro del resultado del llamado en IF-03
 *   (`marcarFinEtapa(id, 2…)` en `app/api/tasaciones/[id]/coordinacion/route.ts`,
 *   Frente C · RF-TAS-05). La ficha CI-037 de `docs/CODE_INCONSISTENCIES.md`
 *   está desactualizada respecto de e2 desde el Frente C.
 * - e3–e7 no tienen escritor de fin destacable aquí (CI-037). e3 se cierra en
 *   el mismo `updateRecord` que e2 y la solicitud pasa a e4, que no es
 *   destacable para ningún estado (`ETAPA_DESTACABLE_POR_ESTADO`).
 *
 * Se mantiene como constante aunque hoy cubra todas las etapas destacables:
 * cuando se agreguen etapas futuras al emparejamiento, su rojo sólo se
 * destacará si tienen escritor (CI-005/CI-037). Condición de presentación, no
 * número de SLA (RO-05).
 */
export const ETAPAS_CON_CIERRE_ESCRITO: ReadonlySet<SlaEtapaSolicitud['numero']> = new Set<
  SlaEtapaSolicitud['numero']
>([1, 2])

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
 * falta `venceTs` o `minutosHabilesAlVence`, si la etapa no es la del estado,
 * si un rojo llega en una etapa sin escritor de cierre
 * (`ETAPAS_CON_CIERRE_ESCRITO`; hoy e1 y e2 lo tienen, así que esta rama sólo
 * filtra etapas futuras), o si un verde/ámbar llega con minutos ≤ 0.
 *
 * Una `asignada` con e2 roja sí se destaca: es un llamado vencido que el
 * tasador no registró en `app/api/tasaciones/[id]/coordinacion/route.ts`.
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
    if (!ETAPAS_CON_CIERRE_ESCRITO.has(etapa.numero)) return null
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
