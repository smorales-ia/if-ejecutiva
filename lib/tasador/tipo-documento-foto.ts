/**
 * Mapa categoría de foto → `codigo` de `D_TipoDocumento` (que se persiste en
 * `TX_Adjuntos.clave_adjunto`, `fldaLLtzAaEn1O8IW`).
 *
 * La foto del cuadro de comparables (categoría `ofertas_comparables`) es hoy la
 * única foto de la visita que, además de foto, es un **documento a extraer**:
 * debe llevar el código `foto_ofertas_comparables` (spec §8.6.1) en
 * `clave_adjunto`, porque esa es la llave por la que `AT-RF09-Trigger` decide
 * disparar RF-09. Sin ella la automation salta la extracción por RN-25 («sin
 * tipo declarado»), el webhook de `SC-RF09-ExtraccionClaude` nunca se llama,
 * `TX_Comparables` no se puebla y la sección D queda en «0 de 3 comparables
 * leídos del cuadro».
 *
 * ## Por qué este módulo NO es "use client"
 *
 * Lo consumen dos lados, a propósito:
 *
 * - **Cliente** (`lib/tasador/fotos.ts`): lo manda como `tipo_documento` en el
 *   payload de subida, para que `SC-Adjuntos-Upload` escriba `clave_adjunto` en
 *   el mismo `create` de la fila (así el trigger `recordCreated` ya la ve).
 * - **Servidor** (`app/api/tasaciones/[id]/fotos/route.ts`): lo reescribe
 *   directo en Airtable vía `updateRecord` tras categorizar. Es la vía robusta
 *   que **no depende de que Make parsee `tipo_documento`** ni de que el cliente
 *   corra el bundle más reciente: aunque la fila se cree con `clave_adjunto`
 *   vacío, el PATCH la deja correcta.
 */
export const TIPO_DOCUMENTO_POR_CATEGORIA_FOTO: Record<string, string> = {
  ofertas_comparables: "foto_ofertas_comparables",
}

/**
 * Código de `D_TipoDocumento` para una categoría de foto, o `undefined` si esa
 * categoría no dispara extracción (la mayoría: son fotos de registro).
 */
export function claveAdjuntoDeCategoria(categoria: string): string | undefined {
  return TIPO_DOCUMENTO_POR_CATEGORIA_FOTO[categoria]
}
