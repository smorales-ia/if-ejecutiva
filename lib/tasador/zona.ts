/**
 * Zona del plan regulador de la propiedad — helpers **puros**, importables
 * desde cliente y servidor (spec §2.8.1 · «Zona de la propiedad», 14-oct-2026).
 *
 * La planilla del cliente separa el dato de su impresión: el tasador escribe
 * sólo el código de zona `[Excel: Portada!AA21]` («IPB», «A1») y la hoja de
 * impresión lo compone con la comuna de la solicitud
 * `[Excel: Impresion!X15 = CONCATENATE(Portada!AA21,"(",'FICHA SOLIC'!E36,")")]`
 * → «IPB(Colina)». Acá se replica igual: `TX_DatosTasacion.tipo_zona_descripcion`
 * guarda el **código** y el ensamblador del PDF compone con la comuna vigente.
 *
 * ## Filas viejas que ya traen la comuna
 *
 * Antes de esta tanda el tasador tecleaba el texto completo
 * («IPB (Estación Central)»). `codigoDeZona` le quita el paréntesis final
 * cuando es la comuna de la solicitud, para que al volver a guardar quede el
 * código solo. **Antes mira el catálogo**: hay códigos reales que terminan en
 * el nombre de su comuna (`ZAP (San José de Maipo)`), y ésos no se recortan.
 *
 * `componerZona` **no** recorta: concatena como la planilla. El ensamblador del
 * PDF le pasa antes el texto por `codigoDeZona` **sin catálogo**, para que una
 * fila vieja no imprima «IPB(Colina)(Colina)»; ver el comentario en
 * `lib/informe/ensamblador.ts`.
 */

/** Minúsculas, sin tildes y sin espacios sobrantes: para comparar nombres. */
export function normalizarNombre(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * La comuna sirve sólo si es un nombre: `—` es el placeholder de
 * `lectura-tasacion` para un Link irresoluble.
 */
export function comunaUtil(comuna: string | null | undefined): string {
  const c = (comuna ?? '').trim()
  return c === '—' ? '' : c
}

/** Una zona del catálogo `M_Zonificacion` para la lista del formulario. */
export interface ZonaCatalogo {
  /** recordId de `M_Zonificacion`. */
  id: string
  /** Código tal como lo imprime la planilla: «A1», «E2a». */
  zona: string
}

/**
 * Busca el código en el catálogo de la comuna, sin distinguir mayúsculas ni
 * tildes. `null` si el tasador escribió una zona que no está.
 */
export function zonaEnCatalogo(
  codigo: string,
  catalogo: readonly ZonaCatalogo[],
): ZonaCatalogo | null {
  const buscado = normalizarNombre(codigo)
  if (buscado === '') return null
  return catalogo.find((z) => normalizarNombre(z.zona) === buscado) ?? null
}

/**
 * Código de zona a partir de lo guardado o tecleado.
 *
 * 1. Si el texto está en el catálogo, sale con la grafía del catálogo
 *    («ipb» → «IPB»).
 * 2. Si no, se le quita un `(Comuna)` final cuando es la comuna de la
 *    solicitud, y se vuelve a buscar en el catálogo.
 * 3. Lo que no está en el catálogo queda tal como lo escribió el tasador.
 */
export function codigoDeZona(
  texto: string | null | undefined,
  comuna: string | null | undefined,
  catalogo: readonly ZonaCatalogo[] = [],
): string {
  const t = (texto ?? '').trim()
  if (t === '') return ''

  const exacta = zonaEnCatalogo(t, catalogo)
  if (exacta) return exacta.zona

  const c = comunaUtil(comuna)
  const m = /^(.*?)\s*\(([^()]*)\)$/.exec(t)
  if (c !== '' && m && m[1].trim() !== '' && normalizarNombre(m[2]) === normalizarNombre(c)) {
    const recortado = m[1].trim()
    return zonaEnCatalogo(recortado, catalogo)?.zona ?? recortado
  }
  return t
}

/**
 * Texto que imprime el informe: `CODIGO(Comuna)`, sin espacio, igual que la
 * planilla. Sin comuna conocida, el código solo; sin código, cadena vacía.
 */
export function componerZona(
  codigo: string | null | undefined,
  comuna: string | null | undefined,
): string {
  const z = (codigo ?? '').trim()
  const c = comunaUtil(comuna)
  if (z === '') return ''
  return c === '' ? z : `${z}(${c})`
}
