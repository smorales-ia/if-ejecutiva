/**
 * Normalización de género para `tipo_propiedad` — **paliativo del punto abierto P-5**.
 *
 * ## El problema
 *
 * El mismo concepto vive con dos dominios incompatibles en la base:
 *
 * | Alias de código (§22.2) | Nombre de datos | Tabla | Dominio real |
 * |---|---|---|---|
 * | `tipoPropiedadNuevoUsado` | `tipo_propiedad_nuevo_usado` | `TX_Solicitudes` | `nuevo` · `usado` (masculino) |
 * | `condicionPropiedadAplicable` | `tipo_propiedad` | `D_TipoDocumento` | `nueva` · `usada` · `ambas` (femenino) |
 *
 * RF-TAS-06 los compara para filtrar el checklist documental. **Con los
 * dominios actuales la comparación literal nunca coincide y el sheet
 * documental sale vacío** (`docs/schema-airtable.md` §26.4).
 *
 * ## Qué es esto y qué no es
 *
 * Esto es un **paliativo declarado**, no la solución. La corrección real es
 * alinear el dominio en Airtable, que es trabajo fuera del repo y requiere
 * sign-off de negocio. Mientras tanto, este módulo concentra la traducción en
 * **un solo lugar server-side**, de modo que alinear el dominio después sea
 * borrar este archivo y no perseguir comparaciones sueltas por el árbol.
 *
 * Ninguna comparación de género ocurre en el cliente. Ningún componente
 * hardcodea `'nueva'` ni `'usado'`.
 */

/** Dominio de `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`). */
export type TipoPropiedadNuevoUsado = 'nuevo' | 'usado'

/** Dominio de `D_TipoDocumento.tipo_propiedad` (`fldIfdcjsr8KeNRCx`). */
export type CondicionPropiedadAplicable = 'nueva' | 'usada' | 'ambas'

/**
 * Forma canónica interna. Es deliberadamente **neutra en género**: no adopta ni
 * el masculino de una tabla ni el femenino de la otra, para que ninguno de los
 * dos dominios de Airtable parezca el correcto.
 */
export type CondicionPropiedad = 'nueva_construccion' | 'usada_construccion'

/**
 * Lleva el valor de `TX_Solicitudes` a la forma canónica.
 *
 * Devuelve `null` ante un valor desconocido o vacío: la solicitud puede no
 * tener la condición declarada, y en ese caso el llamador decide qué hacer en
 * vez de recibir una condición inventada.
 */
export function desdeTipoPropiedadNuevoUsado(
  valor: string | null | undefined,
): CondicionPropiedad | null {
  switch (normalizar(valor)) {
    case 'nuevo':
      return 'nueva_construccion'
    case 'usado':
      return 'usada_construccion'
    default:
      return null
  }
}

/**
 * **Puente CI-070 · Fase 1 (lectura tolerante).** Lleva cualquier valor del eje
 * nuevo/usado —venga en masculino (`TX_Solicitudes`, dominio actual) o en
 * femenino (`D_TipoDocumento`, y `TX_Solicitudes` tras el cutover de Fase 2)— a
 * la forma **femenina** que Héctor fijó como canónica del sistema el
 * 30-ago-2026 (`nueva` · `usada` · `ambas`).
 *
 * Su única razón de ser es que las **lecturas** comparen sin depender del género
 * que Airtable tenga en cada momento, ANTES de renombrar las opciones (Fase 2).
 * **No** cambia con qué género el sistema **escribe** el campo: la escritura
 * sigue en masculino hasta el cutover. Cuando ambos dominios queden en femenino,
 * esta tolerancia y buena parte de este archivo se retiran en Fase 3.
 *
 * Acepta `unknown` a propósito: los `singleSelect` de Airtable llegan tipados de
 * forma laxa (`SolicitudFields` los expone como `unknown`). Cualquier no-string,
 * `null`, vacío, sólo-espacios o valor fuera del eje → `null`.
 */
export function normalizarTipoPropiedad(
  valor: unknown,
): 'nueva' | 'usada' | 'ambas' | null {
  switch (typeof valor === 'string' ? normalizar(valor) : '') {
    case 'nuevo':
    case 'nueva':
      return 'nueva'
    case 'usado':
    case 'usada':
      return 'usada'
    case 'ambos':
    case 'ambas':
      return 'ambas'
    default:
      return null
  }
}

/**
 * ¿Aplica este tipo de documento a la condición de la propiedad?
 *
 * Es el predicado que RF-TAS-06 necesita para filtrar el checklist documental.
 * `ambas` aplica siempre; un valor desconocido en `D_TipoDocumento` **no**
 * aplica, para no colar documentos que nadie pidió.
 *
 * Cuando la condición de la solicitud es `null` —no declarada— se devuelve
 * `true` sólo para los documentos marcados `ambas`: sin saber si la propiedad
 * es nueva o usada, lo único seguro es lo que aplica a las dos.
 */
export function documentoAplicaA(
  condicionDelDocumento: string | null | undefined,
  condicionDeLaPropiedad: CondicionPropiedad | null,
): boolean {
  const doc = normalizar(condicionDelDocumento)

  if (doc === 'ambas') return true
  if (condicionDeLaPropiedad === null) return false

  if (doc === 'nueva') return condicionDeLaPropiedad === 'nueva_construccion'
  if (doc === 'usada') return condicionDeLaPropiedad === 'usada_construccion'

  return false
}

/**
 * Etiqueta para la UI. Se mantiene acá y no en el componente para que el
 * literal visible no dependa del dominio crudo de ninguna de las dos tablas.
 */
export function etiquetaCondicion(condicion: CondicionPropiedad | null): string {
  if (condicion === 'nueva_construccion') return 'Nueva'
  if (condicion === 'usada_construccion') return 'Usada'
  return 'Sin declarar'
}

/** Minúsculas, sin espacios de borde. Los `singleSelect` de Airtable llegan tal cual se escribieron. */
function normalizar(valor: string | null | undefined): string {
  return (valor ?? '').trim().toLowerCase()
}
