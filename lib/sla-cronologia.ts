/**
 * Cronología de las siete etapas (RF-53 · Spec v1.9.8 §5.2.4 · plan §9.6.2 · Tanda E).
 *
 * Módulo **puro y apto para el cliente**: sin `fetch`, sin Airtable, sin Clerk.
 * Es lo que permite que `components/console/solicitud-detail.tsx` —que es
 * `"use client"`— formatee la cronología sin arrastrar el cliente de Airtable al
 * bundle del navegador, que es la misma razón por la que `SLA_ETAPA_FILTROS`
 * vive en `lib/console-data.ts` y no en `lib/solicitudes.ts`.
 *
 * ## Qué decide y qué no
 *
 * **No decide colores.** El tono de la etapa vigente lo emite `sla_semaforo_etapa`
 * (fórmula de Airtable) y llega ya leído en `Solicitud.slaEtapa.tono`. Este
 * módulo lo recibe y lo usa; no lo recalcula comparando `venceTs` contra `NOW()`,
 * porque eso sería la segunda fuente de verdad que RO-05 prohíbe y que
 * divergiría de la bandeja el día que la fórmula cambie.
 *
 * **Las etapas cerradas no llevan tono.** La fórmula sólo habla de la etapa
 * vigente: para una etapa ya terminada no existe semáforo en la base, y pintarla
 * verde o roja comparando sus minutos contra los umbrales sería inventar un
 * segundo semáforo. Lo que sí se muestra es el hecho crudo —"3h 20m de 2h / 3h"—
 * que deja ver el desborde sin fabricar un color que nadie escribió.
 *
 * **No inventa tiempos.** Sin `inicioTs` no hay minutos, sin `venceTs` no hay
 * literal de alerta, y sin ninguna etapa instrumentada la sección lo dice con
 * todas sus letras (`MSG_SIN_CRONOLOGIA`) en vez de mostrar siete verdes.
 */

import { partesEnSantiago, ZONA_VPROPERTY } from './sla-habil'

// ---------------------------------------------------------------------------
// Contrato de `GET /api/solicitudes/[id]/sla` (Tanda C)
// ---------------------------------------------------------------------------

export type EstadoEtapa = 'completada' | 'en_curso' | 'pendiente'

/** Una de las siete entradas que el endpoint devuelve **siempre**. */
export interface EtapaCronologia {
  numero: 1 | 2 | 3 | 4 | 5 | 6 | 7
  etapaKey: string
  nombre: string
  responsable: string | null
  slaIdealHoras: number
  slaMaxHoras: number
  inicioTs: string | null
  finTs: string | null
  /** Minutos hábiles consumidos (§5.2.1). `null` en las que no empezaron. */
  minutosHabiles: number | null
  alertaTs: string | null
  venceTs: string | null
  estado: EstadoEtapa
}

export interface CronologiaSla {
  solicitudId: string
  etapaActual: number | null
  /** Clave de la fila de `C_SLA` que resolvió el par. Auditoría. */
  slaClave: string | null
  etapas: EtapaCronologia[]
}

// ---------------------------------------------------------------------------
// Literales (§9.6.1 · propuestos, ver §13 del plan)
// ---------------------------------------------------------------------------

export const MSG_SIN_CRONOLOGIA =
  'Todavía no hay cronología de etapas para esta solicitud.'

export const MSG_ERROR_CRONOLOGIA =
  'No pudimos cargar la cronología de etapas. Intenta nuevamente en unos segundos.'

export const ETIQUETA_ESTADO: Record<EstadoEtapa, string> = {
  completada: 'Completada',
  en_curso: 'En curso',
  pendiente: 'Pendiente',
}

/**
 * Los cuatro actores de §5.2.3, por la **clave** con que `C_SLA_Etapas.responsable`
 * los guarda.
 *
 * La tabla almacena `control_seguimiento` / `tasador` / `visado`: identificadores,
 * no copy. Escribirlos tal cual en la alerta daría *"Responsable:
 * control_seguimiento."*, que es un error técnico expuesto al usuario y lo que
 * §6.1 prohíbe. Los nombres son los de §5.2.3, literales.
 *
 * Esto **no** contradice "cero hardcodeos de §5.2.4": lo que vive en la tabla y
 * nunca se duplica acá son los catorce umbrales y los nombres de las siete
 * etapas. Esto es el rótulo humano de un enum cerrado de cuatro, la misma
 * familia que `ESTADO_LABELS` y `PRIORIDAD_LABELS`.
 */
export const RESPONSABLE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  control_seguimiento: 'Control y Seguimiento',
  tasador: 'Tasador',
  visado: 'Visado',
  cliente: 'Cliente',
})

/**
 * Rótulo del área responsable. Una clave desconocida se devuelve **tal cual**:
 * si mañana aparece un quinto actor en la tabla, la pantalla lo muestra feo y
 * eso es una señal. Traducirlo a "—" o a "Sin responsable" lo escondería, y el
 * responsable de una etapa en rojo es justo el dato que no se puede perder.
 */
export function etiquetaResponsable(responsable: string | null): string | null {
  if (!responsable) return null
  return RESPONSABLE_LABELS[responsable] ?? responsable
}

// ---------------------------------------------------------------------------
// Formato de duraciones
// ---------------------------------------------------------------------------

/**
 * `"1d 3h"` · `"4h 10m"` · `"12m"`. Dos unidades como máximo: más es ruido.
 *
 * Vive acá y no en `lib/solicitudes.ts` —de donde salió— porque la píldora de la
 * bandeja (server-side) y la cronología del detalle (cliente) tienen que
 * escribir la misma duración con el mismo formato. Dos implementaciones del
 * mismo formateador divergen en el primer caso borde (RO-05).
 */
export function duracionCorta(minutosTotales: number): string {
  const minutos = Math.max(0, Math.round(minutosTotales))
  const dias = Math.floor(minutos / 1440)
  const horas = Math.floor((minutos % 1440) / 60)
  const mins = minutos % 60
  if (dias > 0) return horas > 0 ? `${dias}d ${horas}h` : `${dias}d`
  if (horas > 0) return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`
  return `${mins}m`
}

/**
 * Umbral en horas hábiles, tal como lo escribe `C_SLA_Etapas`, pasado a texto.
 * Los umbrales de §5.2.4 incluyen fracciones —la etapa 7 vale `0.5`— y "0.5h"
 * se lee mal en una fila; `duracionCorta` lo resuelve como "30m".
 */
export function horasHabilesCortas(horas: number): string {
  return duracionCorta(horas * 60)
}

/**
 * `"1h 40m de 2h / 3h"` — consumido contra el par ideal/máximo de §5.2.4.
 *
 * `null` cuando la etapa no empezó: no hay consumo que mostrar y el estado ya lo
 * dice. Cero minutos **sí** se muestra ("0m de 2h / 3h"): la etapa arrancó y eso
 * es distinto de no haber arrancado.
 */
export function resumenTiempoEtapa(etapa: EtapaCronologia): string | null {
  if (etapa.minutosHabiles === null) return null
  return (
    `${duracionCorta(etapa.minutosHabiles)} de ` +
    `${horasHabilesCortas(etapa.slaIdealHoras)} / ${horasHabilesCortas(etapa.slaMaxHoras)}`
  )
}

// ---------------------------------------------------------------------------
// Formato de instantes
// ---------------------------------------------------------------------------

const FORMATO_FECHA_CORTA = new Intl.DateTimeFormat('es-CL', {
  timeZone: ZONA_VPROPERTY,
  day: 'numeric',
  month: 'short',
})

const FORMATO_HORA = new Intl.DateTimeFormat('es-CL', {
  timeZone: ZONA_VPROPERTY,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const FORMATO_MES_LARGO = new Intl.DateTimeFormat('es-CL', {
  timeZone: ZONA_VPROPERTY,
  day: 'numeric',
  month: 'long',
})

/**
 * Todo se formatea en `America/Santiago` explícito, no en la zona del navegador.
 *
 * La ventana hábil de §5.2.1 está declarada en hora de Santiago: una etapa que
 * vence "a las 18:00" tiene que decir 18:00 aunque el navegador esté en otra
 * zona, o el texto contradice al reloj que lo produjo. Es la misma razón por la
 * que `lib/sla-habil.ts` no usa `Date.getHours()`.
 */
function fecha(iso: string): Date | null {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** `"10 ago 09:10"`. Formato de la fila de cronología (§9.6.1). */
export function instanteCorto(iso: string | null): string | null {
  if (!iso) return null
  const d = fecha(iso)
  if (!d) return null
  return `${FORMATO_FECHA_CORTA.format(d)} ${FORMATO_HORA.format(d)}`
}

/**
 * `{ fecha: "11 de agosto", hora: "15:30" }` para los dos literales de alerta.
 *
 * El año sólo aparece cuando difiere del año en curso. En una alerta de plazo
 * —que casi siempre habla de hoy o de ayer— el año es ruido; en una etapa que
 * viene desbordada desde el año pasado, omitirlo sería engañoso.
 */
export function partesFechaHora(
  iso: string,
  ahora: Date = new Date()
): { fecha: string; hora: string } | null {
  const d = fecha(iso)
  if (!d) return null
  const anioInstante = partesEnSantiago(d).anio
  const anioActual = partesEnSantiago(ahora).anio
  const base = FORMATO_MES_LARGO.format(d)
  return {
    fecha: anioInstante === anioActual ? base : `${base} de ${anioInstante}`,
    hora: FORMATO_HORA.format(d),
  }
}

/** `"10 ago 09:10 → 10 ago 11:40"` · `"10 ago 11:40 → en curso"` · `null`. */
export function rangoEtapa(etapa: EtapaCronologia): string | null {
  const inicio = instanteCorto(etapa.inicioTs)
  const fin = instanteCorto(etapa.finTs)
  if (!inicio && !fin) return null
  // Una etapa con fin y sin inicio existe: el backfill de A-5 dejó filas así, y
  // el endpoint las devuelve como `completada`. Se muestra lo que hay.
  if (!inicio) return `sin registro de entrada → ${fin}`
  return `${inicio} → ${fin ?? 'en curso'}`
}

// ---------------------------------------------------------------------------
// Derivaciones de la cronología
// ---------------------------------------------------------------------------

/**
 * `false` cuando ninguna de las siete etapas tiene un solo timestamp — el caso
 * normal en v1.9 para la cartera que nunca pasó por el motor. La sección se
 * sigue mostrando entera con las siete pendientes; lo que cambia es que lo
 * declara (`MSG_SIN_CRONOLOGIA`) en vez de dejar creer que el reloj corre.
 */
export function tieneCronologia(etapas: readonly EtapaCronologia[]): boolean {
  return etapas.some((e) => e.estado !== 'pendiente')
}

/**
 * Los dos literales de §9.6.1, con la fecha y la hora del **vencimiento
 * máximo** (`venceTs`) en ambos casos: en ámbar es el plazo que todavía no se
 * cumple, en rojo es el que ya se pasó. Son el mismo instante contado desde
 * lados opuestos.
 *
 * @param tono El que emitió `sla_semaforo_etapa`, sin recalcular. Sólo `ambar` y
 *   `rojo` producen alerta: `verde` no interrumpe y `sin_dato` no afirma nada.
 * @returns `null` si no hay nada honesto que decir — sin `venceTs` no hay fecha
 *   que poner, y una alerta con la fecha en blanco es peor que ninguna alerta.
 */
export function mensajeAlertaEtapa(
  tono: 'verde' | 'ambar' | 'rojo' | 'sin_dato',
  etapa: Pick<EtapaCronologia, 'numero' | 'nombre' | 'responsable' | 'venceTs'>,
  ahora: Date = new Date()
): string | null {
  if (tono !== 'ambar' && tono !== 'rojo') return null
  if (!etapa.venceTs) return null
  const partes = partesFechaHora(etapa.venceTs, ahora)
  if (!partes) return null

  const encabezado = `La etapa ${etapa.numero} · ${etapa.nombre}`
  if (tono === 'ambar') {
    return `${encabezado} alcanzó su plazo ideal. Vence el ${partes.fecha} a las ${partes.hora}.`
  }

  // El literal de §9.6.1 cierra con "Responsable: {área}." — el **área** de
  // §5.2.3, no la clave con que la tabla la guarda. `C_SLA_Etapas` tiene
  // responsable en las siete filas, pero si algún día llegara vacío se omite la
  // frase en vez de escribir "Responsable: —": una alerta que nombra un
  // responsable inexistente manda a nadie.
  const area = etiquetaResponsable(etapa.responsable)
  const cola = area ? ` Responsable: ${area}.` : ''
  return (
    `${encabezado} superó su plazo máximo el ${partes.fecha} a las ${partes.hora}.` + cola
  )
}
