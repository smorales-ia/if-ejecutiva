/**
 * Chips de la cola personal y su filtrado — **lógica pura, sin Airtable**.
 *
 * Tanda P3-TAS.A · RF-TAS-01 · CI-019 · A-12.
 *
 * ## Por qué salió del componente
 *
 * Hasta P3-TAS.A esto vivía dentro de `cola-tasaciones.tsx`, y traía dos
 * literales de plazo —`< 24` para "Hoy" y `< 4` para "Por coordinar"— que el
 * criterio de aceptación de §4.3 prohíbe expresamente: *«`grep` no encuentra
 * umbrales hardcodeados en `components/tasador/`»*. **IF-03 no define plazos**
 * (RF-53 · CI-021): los catorce umbrales viven en `C_SLA_Etapas` y el motor los
 * materializa en `sla_etapa_vence_ts`.
 *
 * El otro motivo es que sea testeable: el repo no tiene `@testing-library` ni
 * `jsdom` —y `CLAUDE.md` cierra la puerta a agregarlos—, así que la única forma
 * de cubrir el paso 7 de §4.2 con vitest es que la decisión no esté dentro
 * de un `.tsx`.
 *
 * ⚠ **Sólo tipos importados.** Este módulo lo consume un componente cliente:
 * nada de lo que entre acá puede tocar `lib/airtable-client`.
 */

import type { Tasacion } from '@/lib/tasaciones'

/** Los tres chips de CI-019. **No existe** "SLA en riesgo" — no se crea ni como stub. */
export type ChipCola = 'todas' | 'hoy' | 'por_coordinar'

/**
 * Los chips que de verdad filtran.
 *
 * `hoy` queda fuera **por tipo**, no por convención: A-12 sigue abierta y el
 * chip se renderiza deshabilitado. Que `filtrarCola` no lo acepte es lo que
 * impide que alguien le escriba una rama de filtrado "provisional" — que es
 * exactamente lo que había: `horasDesde(fechaAsignacion) < 24`, una agenda del
 * día inventada sobre un umbral que nadie definió.
 */
export type ChipActivo = Exclude<ChipCola, 'hoy'>

export const CHIP_POR_DEFECTO: ChipActivo = 'todas'

export interface DefinicionChip {
  key: ChipCola
  label: string
  /** A-12: visible, no accionable. */
  deshabilitado?: true
  /** Literal §6.1 del tooltip cuando está deshabilitado. Regla T-C: sin lenguaje de IA. */
  tooltip?: string
}

export const CHIPS: readonly DefinicionChip[] = [
  { key: 'todas', label: 'Todas' },
  {
    key: 'hoy',
    label: 'Hoy',
    deshabilitado: true,
    tooltip: 'La agenda del día está pendiente de definición.',
  },
  { key: 'por_coordinar', label: 'Por coordinar' },
]

export function esChipActivo(valor: unknown): valor is ChipActivo {
  return valor === 'todas' || valor === 'por_coordinar'
}

/**
 * Cola visible del tasador: `asignada · visitada · calculada`.
 *
 * `pdf_listo` en adelante ya salió de sus manos y `creada` todavía no llegó.
 * El contador "N en curso" de la cabecera mide esto, no el chip activo.
 */
export function enColaVisible(t: Pick<Tasacion, 'estado'>): boolean {
  return t.estado === 'asignada' || t.estado === 'visitada' || t.estado === 'calculada'
}

/**
 * "Por coordinar" — **redefinido por RO-29** (decisión de Sergio · 19-ago-2026).
 *
 * La definición original (§4.1) era *sin coordinación vigente, `asignada`, y
 * `now() - fecha_asignacion < 4h`*. Dejó de ser computable: la coordinación no
 * se soporta por sistema y `TX_CoordinacionVisita` no existe.
 *
 * La definición vigente es **`asignada` con la etapa 2 abierta**. Dice lo
 * mismo en el vocabulario que sí tiene respaldo: la etapa 2 de §5.2.4 es
 * justamente la del primer contacto (RN-53), la abre el motor al asignar y se
 * cierra cuando el contacto se registra. Cero aritmética de horas acá: el chip
 * pregunta por la etapa, no por el reloj.
 *
 * ⚠ Mientras nadie escriba `sla_e2_fin_ts` —pendiente con Héctor—, una
 * solicitud `asignada` no sale nunca de este chip. Es un hueco del backend, no
 * de este predicado: fabricar acá una salida por tiempo sería reintroducir el
 * umbral que se acaba de quitar.
 */
export function esPorCoordinar(t: Pick<Tasacion, 'estado' | 'slaEtapa'>): boolean {
  return t.estado === 'asignada' && t.slaEtapa?.numero === 2
}

/** Instante de vencimiento en ms. Sin dato → al final del orden, nunca al principio. */
function vencimiento(t: Pick<Tasacion, 'slaEtapa'>): number {
  const iso = t.slaEtapa?.venceTs
  if (!iso) return Number.POSITIVE_INFINITY
  const ms = new Date(iso).getTime()
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms
}

/**
 * Aplica el chip activo. **No muta** la lista recibida.
 *
 * En "Por coordinar" el orden es por `sla_etapa_vence_ts` ascendente —lo que
 * vence antes, primero—, que es el "menor tiempo restante" de §4.1 leído sobre
 * el instante que el motor ya materializó, en vez de recalculado en el cliente.
 */
export function filtrarCola<T extends Pick<Tasacion, 'estado' | 'slaEtapa'>>(
  tasaciones: readonly T[],
  chip: ChipActivo
): T[] {
  const visibles = tasaciones.filter(enColaVisible)
  if (chip === 'todas') return visibles

  return visibles.filter(esPorCoordinar).sort((a, b) => vencimiento(a) - vencimiento(b))
}
