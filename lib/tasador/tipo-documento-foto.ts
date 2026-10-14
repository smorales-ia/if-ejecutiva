/**
 * Mapa categoría de foto → `codigo` de `D_TipoDocumento` (que se persiste en
 * `TX_Adjuntos.clave_adjunto`, `fldaLLtzAaEn1O8IW`).
 *
 * La foto del cuadro de comparables (categoría `datos_comparables`, «Datos de
 * Comparables») es la única foto de la visita que, además de foto, es un
 * **documento a extraer**:
 * debe llevar el código `foto_ofertas_comparables` (spec §8.6.1) en
 * `clave_adjunto`, porque esa es la llave por la que `AT-RF09-Trigger` decide
 * disparar RF-09. Sin ella la automation salta la extracción por RN-25 («sin
 * tipo declarado»), el webhook de `SC-RF09-ExtraccionClaude` nunca se llama,
 * `TX_Comparables` no se puebla y la sección D queda en «0 de 3 comparables
 * leídos del cuadro».
 *
 * ## Quién lo consume
 *
 * Sólo el **servidor** (`app/api/tasaciones/[id]/fotos/route.ts`): tras
 * categorizar escribe `clave_adjunto` y repone `estado_extraccion = idle`
 * directo en Airtable, y eso dispara `AT-RF09-Trigger-Update`. Hasta el
 * 14-oct-2026 el cliente también lo mandaba como `tipo_documento` al subir; se
 * retiró porque activaba la unicidad por tipo (RN-60) de `SC-Adjuntos-Upload` y
 * una foto nueva borraba a la anterior (ver `subirFotoDeVisita`).
 *
 * ## Por qué ya no es `ofertas_comparables` (14-oct-2026, tarde)
 *
 * En `ofertas_comparables` conviven las 3 fachadas de referencia con el cuadro:
 * mapearla hacía que cada fachada corriera una extracción sin datos, que además
 * podía pisar los comparables ya leídos del cuadro. El cuadro tiene ahora su
 * propia categoría y las referencias quedan como fotos puras.
 */
export const TIPO_DOCUMENTO_POR_CATEGORIA_FOTO: Record<string, string> = {
  datos_comparables: "foto_ofertas_comparables",
}

/**
 * Código de `D_TipoDocumento` para una categoría de foto, o `undefined` si esa
 * categoría no dispara extracción (la mayoría: son fotos de registro).
 */
export function claveAdjuntoDeCategoria(categoria: string): string | undefined {
  return TIPO_DOCUMENTO_POR_CATEGORIA_FOTO[categoria]
}
