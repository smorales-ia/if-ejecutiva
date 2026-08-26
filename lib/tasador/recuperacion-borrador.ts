/**
 * Qué se muestra cuando hay dos fuentes para el mismo formulario.
 *
 * Tanda P7-TAS.A.3. Desde .A.1 la pantalla recibe `informeInicial` hidratado
 * desde Airtable, y desde siempre existe un borrador en `localStorage`. Este
 * módulo decide **cuál gana en cada clase de campo** y **cuándo hay que
 * preguntarle al tasador**.
 *
 * `tasador-store.ts` responde «¿qué hay guardado y desde cuándo?». Esto
 * responde «¿qué le muestro?». Son preguntas distintas y por eso son módulos
 * distintos; acá no se toca `localStorage`.
 *
 * ## La regla que se corrige
 *
 * Hasta .A.2 el formulario arrancaba con `readPayload(id) ?? informeInicial`:
 * el borrador **shadoweaba** lo hidratado siempre que existiera. Y existe casi
 * siempre, por una razón que no es obvia: `components/tasador/fotos-screen.tsx`
 * escribe el `InformeData` **entero** en cada cambio, inicializándolo con
 * `readPayload(id) ?? resolverInforme(tasacion)`. Como el flujo canónico es
 * *coordinar → fotos → lectura → formulario*, la pantalla de fotos **siembra un
 * borrador en blanco** antes de que el formulario se abra por primera vez, y
 * ese blanco tapaba la hidratación completa. La hidratación de .A.1 sólo se
 * veía entrando directo a `/tasaciones/[id]` con el almacén limpio.
 *
 * ## El reparto — reducido en .A.4
 *
 * | Clase | Origen hoy | Quién gana |
 * |---|---|---|
 * | `documentosCargados` | **sólo el borrador** | el borrador |
 * | `fotosPredefinidas` · `categoriasCustom` | Airtable (`lectura-fotos.ts`) | el servidor |
 * | Secciones A–H | Airtable (`lectura-datos.ts`) | el servidor; el borrador se **ofrece** |
 *
 * Hasta .A.3 las fotos también ganaban, porque **no estaban en ninguna otra
 * parte**: `leerDatosCaptura` no las devuelve y `fotos-screen` no se hidrataba
 * server-side. Arrancar el formulario sólo con `informeInicial` habría puesto el
 * chip en «0 fotos ingresadas» justo después de que el tasador subió doce.
 *
 * **P7-TAS.A.4 cerró ese hueco** (decisión D-1): `lib/tasador/lectura-fotos.ts`
 * proyecta `TX_Adjuntos` y las dos páginas la vuelcan en `informeInicial`, así
 * que las fotos ya no necesitan que se les ceda la precedencia — y cedérsela
 * ahora sería peor que inútil: un borrador viejo taparía fotos que otra sesión
 * subió de verdad.
 *
 * ## Lo que queda, y por qué no se borró la lista entera
 *
 * `documentosCargados` sigue sin proyección: lo persiste el pipeline de adjuntos
 * de IF-02 y ninguna lectura de IF-03 lo devuelve. **Su fuente es RF-TAS-10**,
 * que todavía no está escrita. Mientras tanto el reparto conserva una entrada y
 * la maquinaria completa —`soloClavesDeBorrador`, las omisiones de
 * `difiereEnSecciones` y de `borradorAportaContenido`— sigue siendo necesaria,
 * no vestigial.
 */

import type { InformeData } from "@/lib/tasador/tasaciones"
import { hayCambiosSinSincronizar, type MetaBorrador } from "@/lib/tasador/tasador-store"

/**
 * Claves de `InformeData` cuyo único origen hoy es el borrador local.
 *
 * **Una sola desde P7-TAS.A.4** (decisión D-4). `fotosPredefinidas` y
 * `categoriasCustom` salieron de la lista porque ya tienen proyección
 * server-side (`lib/tasador/lectura-fotos.ts`) y viajan en `informeInicial`
 * como cualquier otra sección.
 *
 * `documentosCargados` se queda porque **su fuente todavía no existe**: lo
 * persiste el pipeline de adjuntos de IF-02 y ninguna lectura de IF-03 lo
 * devuelve. Sale de acá cuando **RF-TAS-10** traiga su proyección; ése es el
 * único cambio que vacía la lista, y entonces el reparto entero se puede
 * retirar.
 *
 * Sigue siendo una constante exportada y no un literal incrustado en las
 * comparaciones justamente por eso: el día que quede vacía, tiene que haber un
 * solo sitio que tocar.
 */
export const CLAVES_SOLO_BORRADOR = ["documentosCargados"] as const

type Registro = Record<string, unknown>

/**
 * Igualdad estructural.
 *
 * **No se usa `JSON.stringify`.** Depende del orden de las claves, y las dos
 * partes lo tienen distinto: `informeInicial` sale de un spread
 * (`{ ...resolverInforme(t), ...datos }`) y el borrador de un `JSON.parse` de
 * una serialización anterior. Un falso positivo ahí mostraría el banner de
 * recuperación en cada apertura, que es el peor fallo posible de esta pantalla:
 * el tasador aprende a ignorarlo y el día que importa tampoco lo lee.
 */
function iguales(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== "object" || typeof b !== "object") return false

  const arrA = Array.isArray(a)
  if (arrA !== Array.isArray(b)) return false

  if (arrA) {
    const xs = a as unknown[]
    const ys = b as unknown[]
    return xs.length === ys.length && xs.every((v, i) => iguales(v, ys[i]))
  }

  const clavesA = Object.keys(a as Registro)
  const clavesB = Object.keys(b as Registro)
  if (clavesA.length !== clavesB.length) return false

  return clavesA.every(
    (k) =>
      Object.prototype.hasOwnProperty.call(b, k) &&
      iguales((a as Registro)[k], (b as Registro)[k]),
  )
}

/**
 * ¿Este valor dice algo, o es el hueco que deja un formulario sin llenar?
 *
 * Cadena vacía, cero, `false`, array vacío y objeto con todas las hojas vacías
 * cuentan como **nada**. Es lo que separa «el tasador escribió esto» de «esto
 * viene de `resolverInforme` y nadie lo tocó», y de esa distinción depende que
 * el banner no ofrezca pisar Airtable con un formulario en blanco.
 */
function tieneContenido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false
  if (typeof valor === "string") return valor.trim() !== ""
  if (typeof valor === "number") return valor !== 0
  if (typeof valor === "boolean") return valor
  if (Array.isArray(valor)) return valor.some(tieneContenido)
  if (typeof valor === "object") return Object.values(valor as Registro).some(tieneContenido)
  return false
}

/**
 * Las claves del borrador que no tienen otra fuente.
 *
 * Lo usa «Descartar»: el botón tira las secciones A–H y **resiembra lo que
 * ninguna lectura repone**. Hasta .A.3 eso eran las fotos —descartarlas borraba
 * de la vista archivos ya subidos—; desde .A.4 las fotos vuelven solas desde
 * Airtable y lo único que hay que resembrar es `documentosCargados`.
 */
export function soloClavesDeBorrador(borrador: InformeData): Partial<InformeData> {
  const salida: Registro = {}

  for (const clave of CLAVES_SOLO_BORRADOR) {
    const valor = borrador[clave]
    // `documentosCargados` es opcional: ausente no es lo mismo que vacío.
    if (valor !== undefined) salida[clave] = valor
  }

  return salida as Partial<InformeData>
}

/**
 * Estado inicial del formulario, aplicando el reparto.
 *
 * Sin borrador devuelve `informeInicial` tal cual — el caso de la primera
 * visita, donde lo hidratado es todo lo que hay.
 */
export function combinarConBorrador(
  informeInicial: InformeData,
  borrador: InformeData | null,
): InformeData {
  if (!borrador) return informeInicial
  return { ...informeInicial, ...soloClavesDeBorrador(borrador) }
}

/**
 * ¿El borrador trae, **en las secciones A–H**, algo distinto de lo hidratado?
 *
 * Las claves del reparto se omiten a propósito: siempre difieren —el servidor
 * no las manda— y contarlas haría que el predicado fuese verdadero siempre.
 * Ése es justamente el error que convierte el banner en ruido.
 *
 * Se recorre la **unión** de claves de ambos lados, no sólo las del servidor:
 * un borrador con una clave de más también es una diferencia.
 *
 * Es la definición del reparto y nada más. **El banner no la usa**: usa
 * `borradorAportaContenido`, que es ésta más una exigencia de contenido.
 */
export function difiereEnSecciones(
  informeInicial: InformeData,
  borrador: InformeData | null,
): boolean {
  if (!borrador) return false

  const omitidas = new Set<string>(CLAVES_SOLO_BORRADOR)
  const izq = informeInicial as unknown as Registro
  const der = borrador as unknown as Registro

  for (const clave of new Set([...Object.keys(izq), ...Object.keys(der)])) {
    if (omitidas.has(clave)) continue
    if (!iguales(izq[clave], der[clave])) return true
  }

  return false
}

/**
 * ¿El borrador **aporta** algo en A–H, o sólo tiene huecos donde el servidor
 * tiene datos?
 *
 * Es `difiereEnSecciones` más una exigencia: la clave que difiere tiene que
 * traer contenido **del lado del borrador**. La diferencia entre las dos no es
 * académica, y se descubrió escribiendo el test de esta tanda:
 *
 * El borrador en blanco que siembra `fotos-screen` **sí difiere** de lo
 * hidratado —tiene `''` donde Airtable tiene `'5024.86'`— así que
 * `difiereEnSecciones` sola habría dejado pasar el banner, y «Recuperar»
 * habría reemplazado la visita anterior por un formulario vacío. Con un rótulo
 * tranquilizador.
 *
 * ⚠ **Coste aceptado:** borrar un campo a mano y salir sin enviar no se ofrece
 * para recuperación, porque un campo vaciado no aporta contenido. El formulario
 * ya muestra el valor del servidor, así que el tasador puede volver a
 * borrarlo; la alternativa —ofrecer cualquier diferencia— reintroduce el fallo
 * de arriba, que destruye datos en vez de conservar un borrado.
 */
export function borradorAportaContenido(
  informeInicial: InformeData,
  borrador: InformeData | null,
): boolean {
  if (!borrador) return false

  const omitidas = new Set<string>(CLAVES_SOLO_BORRADOR)
  const izq = informeInicial as unknown as Registro
  const der = borrador as unknown as Registro

  for (const clave of new Set([...Object.keys(izq), ...Object.keys(der)])) {
    if (omitidas.has(clave)) continue
    if (iguales(izq[clave], der[clave])) continue
    if (tieneContenido(der[clave])) return true
  }

  return false
}

/**
 * El predicado del banner de recuperación.
 *
 * Exige **las dos** condiciones, y la segunda es la que no es obvia:
 *
 * 1. `hayCambiosSinSincronizar` — el borrador es posterior al último PATCH.
 * 2. `borradorAportaContenido` — y además trae algo que el servidor no tiene.
 *
 * La segunda es deliberadamente `borradorAportaContenido` y **no**
 * `difiereEnSecciones`: ver el docblock de esa función para el caso que separa
 * a las dos, que es exactamente el borrador en blanco de `fotos-screen`.
 */
export function debeOfrecerRecuperacion({
  meta,
  informeInicial,
  borrador,
}: {
  meta: MetaBorrador | null
  informeInicial: InformeData
  borrador: InformeData | null
}): boolean {
  if (!borrador) return false
  if (!hayCambiosSinSincronizar(meta)) return false
  return borradorAportaContenido(informeInicial, borrador)
}
