/**
 * H4 · Gating de la sección H · Rentabilidad por `tipo_informe`
 * (T-AUDIT-CLOSE-20260923 · paso C3 · Opción 1 confirmada por Sergio).
 *
 * La regla vive en Airtable: el checkbox `requiere_rentabilidad` de
 * `M_TiposInforme`. La UI sólo proyecta y obedece — cero valores de negocio en
 * código, mismo criterio A-17 que `MotivoNoContacto`: marcar/desmarcar un tipo
 * en Airtable llega a la UI sin deploy.
 *
 * Este módulo es **client-safe** (puro, sin Airtable): lo importa
 * `tasacion-form.tsx`. La lectura del flag vive en `lectura-tasacion.ts`.
 */

/**
 * Estado del flag proyectado a la UI.
 *
 * - `true`  → el tipo de informe exige rentabilidad: sección visible y sus dos
 *   campos entran a los obligatorios de "Calcular".
 * - `false` → no la exige (checkbox desmarcado): sección oculta.
 * - `null`  → **dato no disponible** — sin `tipo_informe` vinculado, maestro
 *   ilegible (p. ej. el campo aún no existe en la base) o tipo fuera del mapa.
 *   Fail-safe: comportarse como antes de C3 — sección visible y opcional —
 *   para no romper la captura por un problema de lectura.
 */
export type FlagRentabilidad = boolean | null

/** ¿Se renderiza la sección H? Sólo el `false` explícito la oculta. */
export function seccionRentabilidadVisible(flag: FlagRentabilidad): boolean {
  return flag !== false
}

/** ¿Arriendo bruto y gasto anual cuentan como obligatorios? Sólo con `true`. */
export function rentabilidadObligatoria(flag: FlagRentabilidad): boolean {
  return flag === true
}

/**
 * Resuelve el Link `TX_Solicitudes.tipo_informe` contra el mapa
 * recordId → `requiere_rentabilidad` de `M_TiposInforme`.
 *
 * `mapa === null` significa que el maestro no se pudo leer (la degradación de
 * `leerMaestros`); un Link vacío o un recordId que el mapa no conoce también
 * caen a `null`. En los tres casos la UI aplica el fail-safe de arriba.
 */
export function resolverFlagRentabilidad(
  link: unknown,
  mapa: ReadonlyMap<string, boolean> | null,
): FlagRentabilidad {
  if (mapa === null) return null
  if (!Array.isArray(link) || link.length === 0) return null
  const id = link[0]
  if (typeof id !== 'string') return null
  return mapa.get(id) ?? null
}
