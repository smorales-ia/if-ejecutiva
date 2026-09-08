/**
 * Mensaje por documento cuando la extracción terminó sin sus datos obligatorios
 * (P14 · P6-TAS). Reemplaza al banner agregado «No pudimos leer algunos
 * documentos»: ahora se dice, por documento, qué datos faltan y qué hacer.
 *
 * Función pura en `lib/` para poder fijar el literal en un test sin montar
 * React. Regla T-C: nombra los datos que faltan, nunca el medio que los leyó.
 * Los `nombres` llegan ya legibles del servidor (`nombre_atributo`), así que se
 * listan verbatim, sin transformar.
 *
 * Devuelve `null` cuando no falta nada: el consumidor no pinta la línea.
 */
export function mensajeDatosFaltantes(nombres: readonly string[]): string | null {
  if (nombres.length === 0) return null
  return `Sin los datos: ${nombres.join(", ")}. Completar a mano.`
}
