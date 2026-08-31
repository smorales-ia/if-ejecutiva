/**
 * Normalización de género para `tipo_propiedad` — **paliativo del punto abierto P-5**.
 *
 * ## El problema
 *
 * El mismo concepto vive con dos dominios incompatibles en la base:
 *
 * | Alias de código (§22.2) | Nombre de datos | Tabla | Dominio real |
 * |---|---|---|---|
 * | `tipoPropiedadNuevoUsado` | `tipo_propiedad_nuevo_usado` | `TX_Solicitudes` | `nueva` · `usada` (femenino, desde CI-070 Fase 2) |
 * | `condicionPropiedadAplicable` | `tipo_propiedad` | `D_TipoDocumento` | `nueva` · `usada` · `ambas` (femenino) |
 *
 * RF-TAS-06 los compara para filtrar el checklist documental.
 *
 * ## Estado tras CI-070 Fase 2 (cutover 31-ago-2026)
 *
 * Héctor unificó el sistema en **femenino** y se renombraron las opciones de
 * `TX_Solicitudes` (`nuevo`→`nueva`, `usado`→`usada`), así que **ambos dominios
 * ya coinciden**: el desajuste de género que originó P-5 quedó cerrado. Este
 * módulo se conserva porque sigue centralizando la lectura tolerante
 * (`normalizarTipoPropiedad`) y la forma canónica neutra; su simplificación /
 * retiro es trabajo de **Fase 3**. La lectura sigue tolerando ambos géneros para
 * cubrir cualquier fila histórica que no haya migrado.
 */

/** Dominio de `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`). */
export type TipoPropiedadNuevoUsado = 'nueva' | 'usada'

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
  // Se apoya en `normalizarTipoPropiedad` para tolerar ambos géneros: el DTO
  // llega en femenino tras CI-070 Fase 2, pero una fila histórica podría venir
  // aún en masculino. `ambas` no aplica a una propiedad → cae a `null`.
  switch (normalizarTipoPropiedad(valor)) {
    case 'nueva':
      return 'nueva_construccion'
    case 'usada':
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
