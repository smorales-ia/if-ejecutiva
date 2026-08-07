import type { Unidad } from '@/lib/console-data'

/**
 * Destino Dropbox de un adjunto: la lógica compartida por los dos bloques que
 * suben archivos a una solicitud —el checklist de documentos requeridos y la
 * zona de adjuntos libres—.
 *
 * Vive en `lib/` y no dentro de un componente por dos razones. La primera es
 * que duplicarla garantizaría que divergiera, y `etiquetaUnidad` en particular
 * **tiene que coincidir con el backend**: si la UI dice "Estacionamiento 2" y
 * el path acaba en `estacionamiento_3`, el archivo no se encuentra y nadie lo
 * nota hasta la auditoría de RF-51. La segunda es que así se puede testear sin
 * montar React.
 *
 * El componente de UI que consume esto es
 * `components/console/selector-destino-unidad.tsx`.
 */

/**
 * Sentinel del destino «común a todas las unidades». No es un record ID: viaja
 * al backend como `carpeta: "comun"` y aterriza en la carpeta hermana `comun/`
 * de §8.1, la de los documentos que cubren varias unidades a la vez.
 */
export const DESTINO_COMUN = '__comun__'

/**
 * Etiqueta visible del destino «común». Se declara acá y no en el componente
 * porque la consumen **dos** renders del mismo `Select`: la opción de la lista
 * abierta y el valor del trigger cerrado. Con el literal escrito a mano en cada
 * sitio, los dos pueden divergir sin que nada falle.
 */
export const ETIQUETA_COMUN = 'Común a todas las unidades'

/**
 * Destino de un adjunto: el record ID de una unidad de `TX_Unidades` o el
 * sentinel `DESTINO_COMUN`. La cadena vacía es "sin decidir" y bloquea la
 * subida.
 */
export type DestinoUnidad = string

/**
 * Literal de la validación de cinturón y tirantes. Tuteo chileno por §6.1
 * —segunda persona singular, sin signos de exclamación—, igual que el resto de
 * los mensajes del producto.
 */
export const MSG_SIN_DESTINO = 'Selecciona una unidad de destino antes de subir.'

/** `true` cuando hay ambigüedad real y por tanto hay que preguntar. */
export function requiereSeleccion(unidades: Unidad[]): boolean {
  return unidades.length >= 2
}

/**
 * Destino inicial de una solicitud.
 *
 * Con una sola unidad se auto-selecciona esa —caso (a) de §9.1— y no se muestra
 * ningún control. Con dos o más arranca en **«Común a todas»** y no en la
 * primera unidad de la lista: elegir una unidad concreta por el operador sería
 * el default silencioso que CI-003b revirtió, y quedaría congelado en un path
 * que ya no se recalcula (CI-004). `comun/` es un destino legítimo de §8.1, la
 * Ejecutiva lo ve escrito en el selector y puede afinarlo.
 *
 * Sin unidades declaradas devuelve `''`: no hay nada que elegir y el backend
 * deriva `_ingreso/`.
 */
export function destinoInicial(unidades: Unidad[]): DestinoUnidad {
  if (unidades.length === 1) return unidades[0].id
  if (unidades.length >= 2) return DESTINO_COMUN
  return ''
}

/**
 * Traduce un destino de UI a los campos que entiende `POST /api/adjuntos/upload`.
 *
 * Los dos campos son **mutuamente excluyentes por construcción**: ésta es la
 * única función que los produce, así que no existe forma de emitir un
 * `unidad_id` y una `carpeta` a la vez, ni de mandar un destino a medias. Con
 * cero unidades declaradas no se manda ninguno de los dos y el backend deriva
 * `_ingreso/`, que es exactamente su definición en §8.1: adjuntos cargados
 * antes de que existan unidades.
 */
export function destinoAPayload(
  destino: DestinoUnidad,
  hayUnidades: boolean
): { unidad_id?: string; carpeta?: 'comun' } {
  if (!hayUnidades) return {}
  if (destino === DESTINO_COMUN) return { carpeta: 'comun' }
  return { unidad_id: destino }
}

/**
 * Etiqueta legible de una unidad, con la **misma cascada de identificadores**
 * que usa el backend para el segmento `{Unidad}` del path (CI-003b):
 * `numero_unidad` → `rol_sii` → ordinal dentro del grupo de mismo tipo.
 *
 * `Unidad.ubicacion` es `numero_unidad` (`fldJGXS8jGDKZDdWM`) y `Unidad.rolSii`
 * es `rol_sii` (`fldC5yUYC2wTTLJBV`) — los mismos dos campos, en el mismo
 * orden, que `sufijoDesambiguacion()` de `lib/dropbox-path.ts`.
 */
export function etiquetaUnidad(unidad: Unidad, todas: Unidad[]): string {
  const tipo = unidad.tipoBien || 'Unidad'
  if (unidad.ubicacion) return `${tipo} ${unidad.ubicacion}`
  if (unidad.rolSii) return `${tipo} · rol ${unidad.rolSii}`

  const delMismoTipo = todas.filter((u) => u.tipoBien === unidad.tipoBien)
  if (delMismoTipo.length < 2) return tipo
  return `${tipo} ${delMismoTipo.findIndex((u) => u.id === unidad.id) + 1}`
}

/**
 * Etiqueta de un **destino** —lo que muestra el trigger cerrado del `Select`—,
 * a diferencia de `etiquetaUnidad`, que etiqueta una unidad concreta.
 *
 * `Select.Value` de `@base-ui/react` renderiza el `value` crudo si no se le pasa
 * una función de formato. Como acá el `value` es un record ID o el sentinel
 * `__comun__`, el trigger mostraba `recTzdOaalt8Doa5L` o `__comun__` mientras la
 * lista abierta mostraba las etiquetas correctas. El resto de los `Select` del
 * repo no lo notaron nunca porque en todos ellos el `value` **es** la etiqueta.
 *
 * Devuelve `''` cuando el destino no corresponde a ninguna unidad de la lista.
 * El componente lo traduce a su placeholder, que invita a reelegir. No es un
 * caso hipotético: pasa con un id temporal `u-…` de una unidad sin guardar, y
 * pasa después de cada guardado, porque SC-Edicion borra y recrea las unidades y
 * cambia todos sus record IDs.
 */
export function etiquetaDestino(destino: DestinoUnidad, unidades: Unidad[]): string {
  if (destino === DESTINO_COMUN) return ETIQUETA_COMUN
  const unidad = unidades.find((u) => u.id === destino)
  return unidad ? etiquetaUnidad(unidad, unidades) : ''
}
