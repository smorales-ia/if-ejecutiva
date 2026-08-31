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
 * ## Estado tras CI-070 (cerrada · Fase 3, 31-ago-2026)
 *
 * Héctor unificó el sistema en **femenino** y se renombraron las opciones de
 * `TX_Solicitudes` (`nuevo`→`nueva`, `usado`→`usada`), así que **ambos dominios
 * ya coinciden**: el desajuste de género que originó P-5 quedó cerrado. Fase 3
 * retiró la tolerancia a masculino de `normalizarTipoPropiedad` —ya no traduce
 * géneros porque todos los inputs llegan en femenino— y el helper se conserva
 * sólo como **saneamiento de entrada** (null/vacío/no-string/fuera de eje). Este
 * módulo sigue centralizando ese saneamiento y la forma canónica neutra.
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
  // Se apoya en `normalizarTipoPropiedad` para sanear la entrada (femenino
  // canónico tras CI-070; null/vacío/fuera de eje → null). `ambas` no aplica a
  // una propiedad concreta → cae a `null`.
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
 * **Saneamiento de entrada del eje nuevo/usado.** Lleva un valor a la forma
 * **femenina** canónica del sistema (`nueva` · `usada` · `ambas`), que Héctor
 * fijó el 30-ago-2026 y que —tras el cutover de CI-070 Fase 2— es la única que
 * `TX_Solicitudes` y `D_TipoDocumento` emiten.
 *
 * Ya **no traduce géneros**: desde CI-070 Fase 3 el masculino (`nuevo` · `usado`
 * · `ambos`) se rechaza como cualquier otro valor fuera del eje. El helper se
 * conserva por el saneamiento —normaliza mayúsculas y espacios de borde, y
 * colapsa lo inválido a `null`— no por la tolerancia de género que ya sobra.
 *
 * Acepta `unknown` a propósito: los `singleSelect` de Airtable llegan tipados de
 * forma laxa (`SolicitudFields` los expone como `unknown`). Cualquier no-string,
 * `null`, vacío, sólo-espacios o valor fuera del eje femenino → `null`.
 */
export function normalizarTipoPropiedad(
  valor: unknown,
): 'nueva' | 'usada' | 'ambas' | null {
  switch (typeof valor === 'string' ? normalizar(valor) : '') {
    case 'nueva':
      return 'nueva'
    case 'usada':
      return 'usada'
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
