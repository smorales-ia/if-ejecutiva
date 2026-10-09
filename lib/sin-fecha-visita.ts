/**
 * Filtro «sin fecha de visita · más de 24 h hábiles» (Actividad A-03 · Spec
 * v1.9.17 §5.2.8 y §5.2.9).
 *
 * Módulo **puro** y seguro para el cliente: sólo depende de la aritmética hábil
 * de `lib/sla-habil.ts` y de tipos de `lib/console-data.ts`. No importa
 * `lib/solicitudes.ts` a propósito —arrastraría el cliente de Airtable al bundle
 * del navegador— y no lee feriados: los recibe, igual que `sla-habil`. Quien
 * llama desde el servidor los obtiene con `obtenerFeriados()`.
 *
 * ## Qué es y qué no es
 *
 * §5.2.8 fija un **tope de respuesta al cliente**: VProperty se compromete a
 * darle al ejecutivo del cliente una fecha de visita dentro de las 24 horas
 * hábiles desde el ingreso. No es una etapa de la matriz de §5.2.4, así que no
 * vive en `C_SLA_Etapas` ni en `lib/sla-etapas.ts`.
 *
 * D-18 (A-23) decide que el tope **no tiene alerta en pantalla**: ni píldora,
 * ni banner, ni badge de "24 h". Lo que sí pide §5.2.9 es un filtro de la
 * bandeja que liste las solicitudes sin `fecha_visita_programada` que lo
 * superaron. Este módulo es el predicado de ese filtro y nada más.
 */

import { proximoInstanteHabil, sumarHorasHabiles } from './sla-habil'
import type { EstadoSolicitud } from './console-data'

/**
 * Tope de respuesta al cliente con fecha de visita, en horas hábiles (Spec
 * v1.9.17 §5.2.8 · «Tope de respuesta al cliente»). Única declaración del
 * número en el repo: el filtro, su contador y su etiqueta lo leen de acá.
 */
export const TOPE_RESPUESTA_CLIENTE_HORAS_HABILES = 24

/**
 * Estados en los que el tope ya no aplica: la solicitud salió del flujo
 * operativo. No hay una definición canónica de "activas" en el repo, así que la
 * lista es conservadora — sólo los tres estados terminales. `pausada` no existe
 * en el enum de `EstadoSolicitud`.
 */
export const ESTADOS_FUERA_DEL_TOPE: readonly EstadoSolicitud[] = [
  'entregada',
  'cerrada',
  'cancelada',
]

/** Parámetro de URL del filtro en la bandeja (`?sin_fecha_visita=1`). */
export const PARAM_SIN_FECHA_VISITA = 'sin_fecha_visita'

/** Único valor que activa el filtro. Cualquier otro se ignora. */
export const VALOR_SIN_FECHA_VISITA = '1'

/** Clave del contador en `GET /api/solicitudes/contadores`. */
export const CLAVE_CONTADOR_SIN_FECHA_VISITA = 'sin_fecha_visita_24h'

/** Rótulo del filtro en el panel de la bandeja. Neutro: no es una alerta (D-18). */
export const ETIQUETA_SIN_FECHA_VISITA = `Sin fecha de visita · más de ${TOPE_RESPUESTA_CLIENTE_HORAS_HABILES} h hábiles`

/** Lo mínimo que el predicado necesita de una solicitud. */
export interface EntradaSinFechaVisita {
  estado: string
  /**
   * Instante de ingreso en ISO 8601: `sla_e1_inicio_ts` (hito de §5.2.2) o su
   * respaldo. Sin él no se puede medir, y el predicado responde `false`.
   */
  ingresoTs?: string | null
  /** `fecha_visita_programada` tal como llega; cualquier texto no vacío cuenta. */
  fechaVisitaProgramada?: string | null
}

/**
 * ¿La solicitud superó el tope de 24 h hábiles sin fecha de visita?
 *
 * Orden de evaluación:
 *
 * 1. Estado terminal → `false`: el tope ya no aplica.
 * 2. Con fecha de visita → `false`: el compromiso está cumplido, sin importar
 *    cuánto tardó.
 * 3. Sin instante de ingreso válido → `false`. No se fabrica antigüedad: una
 *    fila que no se puede medir no se lista como incumplida.
 * 4. Si no, vence en `ingreso + 24 h hábiles`, normalizado a la ventana, y la
 *    solicitud entra cuando `ahora` es **estrictamente** posterior. Ingresar un
 *    sábado no consume horas hasta la apertura del lunes, porque
 *    `sumarHorasHabiles` normaliza el punto de partida.
 *
 * @param s Solicitud reducida a estado, ingreso y fecha de visita.
 * @param ahora Instante de referencia (inyectado para poder testear).
 * @param feriados Fechas `YYYY-MM-DD` no hábiles, desde `obtenerFeriados()`.
 */
export function sinFechaVisitaVencida(
  s: EntradaSinFechaVisita,
  ahora: Date,
  feriados: ReadonlySet<string>
): boolean {
  if ((ESTADOS_FUERA_DEL_TOPE as readonly string[]).includes(s.estado)) return false
  if ((s.fechaVisitaProgramada ?? '').trim() !== '') return false

  const crudo = (s.ingresoTs ?? '').trim()
  if (crudo === '') return false
  const ingreso = new Date(crudo)
  if (Number.isNaN(ingreso.getTime())) return false

  const vence = proximoInstanteHabil(
    sumarHorasHabiles(ingreso, TOPE_RESPUESTA_CLIENTE_HORAS_HABILES, feriados),
    feriados
  )
  return ahora.getTime() > vence.getTime()
}
