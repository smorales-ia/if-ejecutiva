/**
 * Resolución de los mínimos por categoría de fotos — **punto único de A-16**.
 *
 * Plan IF-03 §6.1 · spec §2.6 · RF-TAS-14. Creado en **P5-TAS**.
 *
 * ## Por qué existe este archivo
 *
 * Antes de P5-TAS la resolución vivía repartida en tres sitios: el catálogo
 * `CATEGORIAS_FOTO` (`lib/tasador/tasaciones.ts`), el traductor `resolverLimite()` en
 * ese mismo módulo y la evaluación en `components/tasador/fotos-categorizadas.tsx`.
 * Ninguno estaba mal, pero revertir A-16 obligaba a visitar los tres y a
 * confiar en que no hubiera un cuarto. §6.1 pide **una sola función**, y ésta
 * lo es: el criterio de aceptación de §6.3 dice *"los mínimos dinámicos se
 * resuelven **sólo** en `lib/tasador/minimos-fotos.ts`"*.
 *
 * ## TODO(A-16) · esto es una asunción, no una decisión
 *
 * Los mínimos de **habitaciones, baños y estacionamientos** son **dinámicos por
 * asunción**. §2.6 declara la regla dinámica —*"mínimos ligados a los
 * dormitorios, baños y estacionamientos declarados"*— y el diseño v4 muestra
 * `2 · 2 · 1`, que **coinciden exactamente con la propiedad de ejemplo** de su
 * cabecera. La ficha A-16 califica esa coincidencia de indicio a favor de la
 * regla dinámica, pero no la confirma.
 *
 * Lo que está en juego: con mínimos fijos, **una casa de 5 dormitorios se daría
 * por completa con 2 fotos de habitaciones**, que es justamente la evidencia de
 * terreno que el organizador existe para asegurar.
 *
 * **Si el negocio fija los mínimos, cambiar SÓLO las tres entradas de
 * `MINIMOS_DINAMICOS` a su número.** No hay otro punto de cambio: el catálogo
 * declara qué categoría es dinámica, y este módulo decide en qué se traduce.
 */

import { CATEGORIAS_FOTO, type CategoriaFotoId, type LimiteFoto } from '@/lib/tasador/tasaciones'

/**
 * Lo declarado por el tasador en la sección B del formulario (§2.8), que es de
 * donde salen los mínimos dinámicos.
 *
 * Los tres son `number` y no `number | undefined`: el llamador ya resolvió el
 * campo vacío a `0`. Un `0` significa *"la propiedad no declara ninguno"*, y su
 * categoría queda con mínimo cero — completa desde el principio, que es lo
 * correcto: no se pueden exigir fotos de un baño que no existe.
 */
export interface DeclaradosSeccionB {
  dorm: number
  banos: number
  estac: number
}

/**
 * Las tres categorías cuyo mínimo depende de lo declarado (**A-16**).
 *
 * El valor es la **clave del dato declarado**, no un número: es lo que hace que
 * fijarlos sea sustituir `'dorm'` por `2` acá y nada más.
 */
const MINIMOS_DINAMICOS = {
  habitaciones: 'dorm',
  banos: 'banos',
  estacionamientos: 'estac',
} as const satisfies Partial<Record<CategoriaFotoId, keyof DeclaradosSeccionB>>

/**
 * Traduce el límite declarado en el catálogo a un número concreto.
 *
 * `null` significa **sin límite**, no cero — la distinción importa para `max`,
 * donde la spec no declara ningún tope y no se inventa uno.
 */
export function resolverLimiteFoto(
  limite: LimiteFoto,
  declarados: DeclaradosSeccionB,
): number | null {
  if (limite === null) return null
  if (typeof limite === 'number') return limite
  return declarados[limite] ?? 0
}

/**
 * Mínimo exigible de una categoría del catálogo, ya resuelto contra lo
 * declarado. Nunca devuelve `null`: una categoría sin mínimo declarado exige
 * cero, que es un número y no una ausencia.
 */
export function resolverMinimo(
  categoriaId: CategoriaFotoId,
  declarados: DeclaradosSeccionB,
): number {
  const categoria = CATEGORIAS_FOTO.find((c) => c.id === categoriaId)
  if (!categoria) return 0
  return resolverLimiteFoto(categoria.min, declarados) ?? 0
}

/** Máximo de una categoría, o `null` si no tiene tope. */
export function resolverMaximo(
  categoriaId: CategoriaFotoId,
  declarados: DeclaradosSeccionB,
): number | null {
  const categoria = CATEGORIAS_FOTO.find((c) => c.id === categoriaId)
  if (!categoria) return null
  return resolverLimiteFoto(categoria.max, declarados)
}

/**
 * ¿El mínimo de esta categoría depende de lo declarado?
 *
 * Lo consume la UI para explicar de dónde sale el número —*"mínimos según lo
 * declarado"*— sin que el componente sepa **cuáles** son dinámicas.
 */
export function esMinimoDinamico(categoriaId: CategoriaFotoId): boolean {
  return categoriaId in MINIMOS_DINAMICOS
}

/**
 * Mínimo de una categoría **personalizada**: siempre `0`.
 *
 * Spec §2.6 —*"el diseño v4 no pide mínimo para ellas"*— y criterio de
 * aceptación de RF-TAS-14: *"una categoría personalizada aparece en el listado
 * inmediatamente después de crearse y **admite fotos sin exigir mínimo**"*.
 *
 * Es una función y no una constante suelta para que el día que el negocio pida
 * mínimo en las personalizadas haya un solo sitio donde ponerlo.
 */
export function minimoCategoriaPersonalizada(): number {
  return 0
}
