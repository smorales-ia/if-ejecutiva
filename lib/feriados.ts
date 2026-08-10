/**
 * Lectura de `C_Feriados` para el motor de SLA (plan §9.6.2 · B-2).
 *
 * `C_Feriados` es el nombre canónico de la tabla (§9.6-R1 · CI-007): la spec la
 * menciona como `H_Feriados`, pero en la base real —y por lo tanto en todo el
 * código— es `C_Feriados`. No crear la otra.
 *
 * Single source del calendario: `lib/sla-habil.ts` es puro y recibe el `Set`
 * que este módulo produce. Nadie más lee esta tabla.
 */

import { listRecords } from './airtable-client'

export const C_FERIADOS = 'tblJVh2kPd4uMgxpb'

/** Doce horas: el calendario de feriados no cambia dentro de una jornada. */
const TTL_MS = 12 * 60 * 60 * 1000

interface CamposFeriado {
  fecha?: string
  activo?: boolean
}

// Cache en memoria de proceso, sin persistencia — se pierde en cada
// redeploy/restart. Mismo patrón que `ejecutivaCache` en lib/solicitudes.ts.
let cache: { data: Set<string>; expiresAt: number } | null = null

/**
 * Devuelve el conjunto de fechas no hábiles en formato `YYYY-MM-DD`.
 *
 * Filtra por dos condiciones, no una:
 *
 * 1. `activo = TRUE` — un feriado desactivado no debe frenar el reloj.
 * 2. `fecha` no vacía — `C_Feriados` tiene una fila basura (`recdfwWtdHFcm05sb`,
 *    un encabezado de CSV importado como dato) sin fecha. Sin este segundo
 *    filtro entraría un `undefined` al `Set` y el motor trataría como feriado
 *    cualquier fecha que no pudiera formatear. El filtro se **conserva** aunque
 *    M-12 borre la fila: el dato malo puede volver por otra importación.
 *
 * @param opciones.forzar Ignora la cache y relee Airtable.
 * @returns Set de fechas `YYYY-MM-DD` en las que el SLA no corre.
 */
export async function obtenerFeriados(
  opciones: { forzar?: boolean } = {}
): Promise<Set<string>> {
  if (!opciones.forzar && cache && cache.expiresAt > Date.now()) return cache.data

  const registros = await listRecords<CamposFeriado>(C_FERIADOS, {
    fields: ['fecha', 'activo'],
  })

  const fechas = new Set<string>()
  for (const registro of registros) {
    const { fecha, activo } = registro.fields
    if (!fecha) continue
    if (activo !== true) continue
    fechas.add(String(fecha).slice(0, 10))
  }

  cache = { data: fechas, expiresAt: Date.now() + TTL_MS }
  return fechas
}

/** Invalida la cache. Para tests y para el día en que M-12 sanee la tabla. */
export function invalidarCacheFeriados(): void {
  cache = null
}
