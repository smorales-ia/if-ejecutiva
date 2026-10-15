/**
 * Pre-llenado de «Estado conservación» y «Calidad de construcción» (sección B).
 *
 * ## De dónde salen los valores
 *
 * De la planilla con la que el cliente arma hoy el informe (libro de MET-6283,
 * `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm`, hoja
 * `Antecedentes`). Ninguna de las dos celdas llega en blanco al tasador:
 *
 * | Campo | Celda | Fórmula en la planilla | Lista |
 * |---|---|---|---|
 * | Estado de conservación | `[Excel: Antecedentes!Z15]` | `IF(FICHA SOLIC!K36 = "Usado", "BUENO", "NUEVO - S/USO")` | `OPCIONES.estadoConservacionInmueble` |
 * | Calidad constructiva | `[Excel: Antecedentes!H19]` | `IF(tipoPropiedad="Departamento","BUENA","BUENA")` — siempre `BUENA` | `OPCIONES.calidadConstruccion` |
 *
 * `FICHA SOLIC!K36` es el estado de uso (`Nuevo · Usado`), que en la base vive
 * en `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`nueva · usada`). Un valor no
 * declarado cae a `usada`, mismo criterio que `lectura-tasacion.ts` (CI-069).
 *
 * ## Por qué se resuelve acá y no en el formulario
 *
 * Spec §2.8.1: el conjunto de defaults **se resuelve server-side** y el
 * frontend recibe valores, nunca reglas. Lo consume `proyectarDatosCaptura`
 * (`lectura-datos.ts`) sólo cuando la columna de `TX_DatosTasacion` está vacía:
 * lo que el tasador ya guardó gana siempre. El default es un valor real —viaja
 * en el `PATCH` como cualquier otro—, no un placeholder.
 */

import { OPCIONES, type Opcion } from './tasaciones'
import { normalizarTipoPropiedad } from './tipo-propiedad'

/** `[Excel: Antecedentes!H19]` — la planilla no ramifica: siempre `BUENA`. */
export const CALIDAD_CONSTRUCCION_POR_DEFECTO = 'BUENA'

/** `[Excel: Antecedentes!Z15]` — `BUENO` en usada, `NUEVO - S/USO` en nueva. */
export function estadoConservacionPorDefecto(nuevoUsado: unknown): string {
  return normalizarTipoPropiedad(nuevoUsado) === 'nueva' ? 'NUEVO - S/USO' : 'BUENO'
}

/**
 * Lleva un valor guardado a la grafía del catálogo cuando sólo difiere en
 * mayúsculas o espacios (`Bueno` → `BUENO`). Lo que no está en el catálogo se
 * devuelve tal cual: es un dato del tasador y no se descarta en silencio.
 */
function aGrafiaDeCatalogo(valor: unknown, catalogo: readonly Opcion[]): string {
  if (typeof valor !== 'string') return ''
  const limpio = valor.trim()
  if (limpio === '') return ''
  const clave = limpio.toLowerCase()
  return catalogo.find((o) => o.v.toLowerCase() === clave)?.v ?? limpio
}

/**
 * `TX_DatosTasacion.estado_conservacion` tal como lo verá el select. Las filas
 * anteriores al 14-oct-2026 traen `Bueno` (catálogo viejo) además de `BUENO`.
 */
export function estadoConservacionGuardado(valor: unknown): string {
  return aGrafiaDeCatalogo(valor, OPCIONES.estadoConservacionInmueble)
}

/**
 * `TX_DatosTasacion.calidad_construccion` tal como lo verá el select.
 *
 * Un número es la escala de estrellas retirada (o el campo todavía `number`
 * antes de la migración de schema): no tiene traducción a la lista de la
 * planilla, así que cuenta como vacío y el formulario ofrece el default.
 */
export function calidadConstruccionGuardada(valor: unknown): string {
  return aGrafiaDeCatalogo(valor, OPCIONES.calidadConstruccion)
}

/**
 * Las opciones del select más el valor vigente si no pertenece al catálogo
 * (un dato histórico como `Muy Bueno`), para que se vea y no se pierda al
 * abrir la lista. Vive en `lib/` para que el trigger cerrado y la lista no
 * diverjan (RO-05 · RO-08).
 */
export function opcionesConValorVigente(
  catalogo: readonly Opcion[],
  valor: string,
): readonly Opcion[] {
  if (valor === '' || catalogo.some((o) => o.v === valor)) return catalogo
  return [...catalogo, { v: valor, l: valor }]
}
