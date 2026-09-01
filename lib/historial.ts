/**
 * Contrato del timeline de la pestaña Historial (§1.3.3).
 *
 * Un solo riel cronológico que funde dos orígenes distintos:
 *
 * - **`A_Eventos`** — hitos del ciclo de vida: alta, asignación, correo de
 *   asignación, pausa, cancelación. Los escribe SC01/SC-Asignar/SC-Edicion.
 * - **`A_Cambios`** — auditoría campo a campo de las ediciones hechas mientras
 *   la solicitud estuvo en `creada` (RN-59). Las escribe SC-Edicion.
 *
 * ## Por qué este módulo no toca Airtable
 *
 * Lo consumen el Route Handler (server) y el componente de la pestaña
 * (cliente). Misma separación que `lib/decision-motor.ts` frente a
 * `lib/decision-motor-airtable.ts`: acá viven el tipo, los literales y la
 * redacción pura; la lectura vive en `lib/historial-airtable.ts`.
 */

/**
 * De qué tabla salió la fila. Determina el icono y la forma del título.
 *
 * `'coordinacion'` se agregó en C4 (RF-TAS-05): son las filas de
 * `TX_CoordinacionVisita`, que escribe IF-03 y que hasta entonces no llegaban al
 * riel. Su redacción vive en `lib/coordinacion.ts` —no acá— porque el
 * conocimiento de las dos ramas de una coordinación ya está en ese módulo.
 */
export type OrigenHistorial = 'evento' | 'cambio' | 'coordinacion'

export interface ItemHistorial {
  id: string
  /** Primera línea: qué pasó, en lenguaje de usuario (§6.1). */
  titulo: string
  /** Segunda línea opcional: quién lo hizo. */
  autor?: string
  /** ISO 8601. Sirve para ordenar; la pantalla muestra `hace`. */
  timestamp: string
  /** "hace 2 horas" — ya formateado. */
  hace: string
  origen: OrigenHistorial
  icono: IconoHistorial
  /** Cuerpo expandible (el correo de asignación). */
  detalle?: string
}

export type IconoHistorial =
  | 'check'
  | 'plus'
  | 'alert'
  | 'eye'
  | 'mail'
  | 'upload'
  | 'edit'
  /** Coordinación de la visita: es un llamado telefónico, no un correo. */
  | 'phone'

export const MSG_SIN_HISTORIAL =
  'Todavía no hay eventos registrados para esta solicitud.'

export const MSG_ERROR_HISTORIAL =
  'No pudimos cargar el historial. Intenta nuevamente en unos segundos.'

/**
 * Icono por `tipo_evento`.
 *
 * `tipo_evento` es `singleLineText` en Airtable —texto libre, no un select—, así
 * que esta tabla no puede ser exhaustiva por construcción y el `?? 'eye'` no es
 * pereza: es el único desenlace correcto para un tipo que todavía no se ha
 * visto. Los literales son los que las filas reales traen hoy.
 */
const ICONO_POR_EVENTO: Record<string, IconoHistorial> = {
  solicitud_creada: 'plus',
  tasador_asignado: 'check',
  asignacion_manual: 'check',
  reasignacion_manual: 'check',
  correo_asignacion_enviado: 'mail',
  correo_asignacion_fallido: 'alert',
  correo_enviado: 'mail',
  adjunto_agregado: 'upload',
  adjunto_reemplazado: 'upload',
  adjunto_eliminado: 'upload',
  datos_modificados: 'edit',
  cambio_prioridad: 'alert',
  solicitud_pausada: 'alert',
  solicitud_cancelada: 'alert',
}

export function iconoDeEvento(tipoEvento: string | undefined): IconoHistorial {
  return ICONO_POR_EVENTO[(tipoEvento ?? '').trim()] ?? 'eye'
}

/**
 * Título legible de un evento de `A_Eventos`.
 *
 * `descripcion` es lo que escriben los escenarios Make y ya viene redactado, así
 * que manda cuando existe. Si falta, se cae al `tipo_evento` con los guiones
 * bajos convertidos a espacios: es jerga, pero es lo único que hay, y decir
 * "Evento" a secas sería peor.
 */
export function tituloDeEvento(
  descripcion: string | undefined,
  tipoEvento: string | undefined
): string {
  const d = descripcion?.trim()
  if (d) return d

  const t = (tipoEvento ?? '').trim()
  if (!t) return 'Evento registrado'
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')
}

/**
 * Título legible de una fila de `A_Cambios`.
 *
 * El valor anterior vacío se dice como "sin valor" y no se omite: "Dirección: →
 * Av. Apoquindo 5230" se lee como un renglón roto, mientras que "de sin valor a
 * Av. Apoquindo 5230" dice exactamente lo que pasó — que el campo estaba vacío.
 *
 * Los valores largos se recortan: `valor_anterior`/`valor_nuevo` son `multilineText`
 * y un JSON de 2 KB dentro del riel destruye la lectura cronológica, que es para
 * lo que existe la pestaña.
 */
export function tituloDeCambio(
  campo: string | undefined,
  valorAnterior: string | undefined,
  valorNuevo: string | undefined
): string {
  const nombre = etiquetaCampo(campo)
  const antes = recortar(valorAnterior) || 'sin valor'
  const despues = recortar(valorNuevo) || 'sin valor'
  return `${nombre}: de ${antes} a ${despues}`
}

const MAX_VALOR = 60

function recortar(valor: string | undefined): string {
  const v = (valor ?? '').trim().replace(/\s+/g, ' ')
  if (v.length <= MAX_VALOR) return v
  return `${v.slice(0, MAX_VALOR)}…`
}

/**
 * Nombre de campo de Airtable → etiqueta de pantalla.
 *
 * Sólo los campos que la Ejecutiva edita de verdad desde IF-02 (§1.4). Para el
 * resto se convierten los guiones bajos en espacios: no es perfecto, pero
 * `sup_terreno_m2` se lee mucho mejor como "sup terreno m2" que como el
 * identificador crudo, y la lista no puede cerrarse porque `campo_modificado`
 * es texto libre.
 */
const ETIQUETA_CAMPO: Record<string, string> = {
  direccion: 'Dirección',
  comuna: 'Comuna',
  region: 'Región',
  cliente: 'Cliente',
  tasador: 'Tasador',
  visador: 'Visador',
  estado: 'Estado',
  prioridad: 'Prioridad',
  tipo_informe: 'Tipo de informe',
  tipo_propiedad: 'Tipo de propiedad',
  fecha_visita_programada: 'Fecha de visita programada',
  monto_estimado_uf: 'Monto estimado',
  proyecto_condominio: 'Proyecto o condominio',
  observaciones_internas: 'Observaciones',
  n_operacion_cliente: 'N° de operación del cliente',
  ejecutivo_solicitante: 'Ejecutivo solicitante',
  ejecutivo_comercializador: 'Ejecutivo comercializador',
  sup_terreno_m2: 'Superficie de terreno',
  sup_construccion_m2: 'Superficie construida',
  anio_construccion: 'Año de construcción',
  rol_sii: 'Rol SII',
  estado_conservacion: 'Estado de conservación',
}

export function etiquetaCampo(campo: string | undefined): string {
  const c = (campo ?? '').trim()
  if (!c) return 'Campo'
  return ETIQUETA_CAMPO[c] ?? c.replace(/_/g, ' ')
}

/**
 * Funde los dos orígenes en un riel único, más reciente primero.
 *
 * El orden es por `timestamp` y no por origen: mezclar cronológicamente es el
 * punto del §1.3.3 —"timeline único"—, porque lo que reconstruye el caso es la
 * secuencia, no la procedencia de cada fila.
 */
export function fundirHistorial(
  ...listas: readonly ItemHistorial[][]
): ItemHistorial[] {
  return listas
    .flat()
    .slice()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
