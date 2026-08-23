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

import type { Tasacion } from '@/lib/tasador/tasaciones'

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
 * "Por coordinar" — **`asignada` sin coordinación vigente** (CI-045 · CI-048).
 *
 * Membresía directa por el dato que P4-TAS repuso: `estado === 'asignada'` y
 * sin desenlace de coordinación registrado (`coordinacionVigente == null`, que
 * cubre `null` y `undefined`). Una solicitud `confirmada` ya pasó a la captura y
 * una `rechazada` espera a la ejecutiva (Regla T-A): las dos **salen del chip**
 * pero siguen en "Todas".
 *
 * ⚠ **Sin cota horaria — A-22 aprobada · CI-048.** §2.1 / RF-TAS-01 pide además
 * `now() - fecha_asignacion < 4h`. Esa cota **no se implementa**: IF-03 no
 * recalcula horas hábiles sin duplicar la aritmética que CI-021 retiró
 * (`horas_restantes`), y §2.2 declara que IF-03 **consume** el control de SLA,
 * no lo recalcula. La cota se dropea de la **pertenencia**; el "menor tiempo
 * restante" de §2.1 se preserva en el **orden** de `filtrarCola` (`venceTs`
 * asc). Ficha completa en `docs/CODE_INCONSISTENCIES.md` · CI-048.
 *
 * Historia: hasta P3-TAS.A esto vivía bajo **RO-29** —coordinación no soportada
 * por sistema— y aproximaba la membresía por `slaEtapa.numero === 2`. RO-29 fue
 * anulada el 19-ago-2026 y `TX_Solicitudes.coordinacion_vigente`
 * (`fldI4Dv0jpRQvbdHl`) da hoy el dato directo.
 */
export function esPorCoordinar(t: Pick<Tasacion, 'estado' | 'coordinacionVigente'>): boolean {
  return t.estado === 'asignada' && t.coordinacionVigente == null
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
export function filtrarCola<T extends Pick<Tasacion, 'estado' | 'slaEtapa' | 'coordinacionVigente'>>(
  tasaciones: readonly T[],
  chip: ChipActivo
): T[] {
  const visibles = tasaciones.filter(enColaVisible)
  if (chip === 'todas') return visibles

  return visibles.filter(esPorCoordinar).sort((a, b) => vencimiento(a) - vencimiento(b))
}
