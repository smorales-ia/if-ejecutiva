import { listRecords } from '@/lib/airtable-client'
import type { Solicitud, Unidad } from '@/lib/console-data'
import {
  aEtiqueta,
  MATERIAL,
  ORIGEN_SUPERFICIE,
  SUBTIPO,
} from '@/lib/mappers/vocabulario-unidades'

// TX_Unidades verificado vía MCP 29-jul-2026 (Tanda D-02)
export const TX_UNIDADES = 'tbl2QDLvJDyy3Rg2I'

const UNIDAD_FIELDS = [
  'numero_unidad',
  'modelo',
  'subtipo',
  'con_rol_o_uso_y_goce',
  'rol_sii',
  'rol_sii_en_tramite',
  'sup_m2',
  'superficie_terraza_m2',
  'sup_terreno_m2',
  'anio_construccion',
  'tipo_material',
  'ampliacion_m2',
  'ampliacion_regularizable',
  'origen_superficie',
  'detalle_item',
  'orden',
  'solicitud',
]

type RawFields = {
  numero_unidad?: string
  modelo?: string
  subtipo?: string
  con_rol_o_uso_y_goce?: string
  rol_sii?: string
  rol_sii_en_tramite?: boolean
  sup_m2?: number
  superficie_terraza_m2?: number
  sup_terreno_m2?: number
  anio_construccion?: number
  tipo_material?: string
  ampliacion_m2?: number
  ampliacion_regularizable?: string
  origen_superficie?: string
  detalle_item?: string
  orden?: number
  /** Link a TX_Solicitudes. En formato JSON llega como array de record IDs. */
  solicitud?: string[]
}

/**
 * `con_rol_o_uso_y_goce` es un singleSelect, no un booleano. Se interpreta por
 * texto: cualquier variante de "uso y goce" es `false`; el resto (incluido el
 * campo vacío con un rol declarado) es `true`. Se prefiere el select y sólo se
 * cae a la presencia de `rol_sii` cuando el select no está poblado, para que
 * una unidad con rol en trámite —sin número todavía— no se lea como uso y goce.
 */
function tieneRol(f: RawFields): boolean {
  const select = (f.con_rol_o_uso_y_goce ?? '').toLowerCase()
  if (select.includes('uso')) return false
  if (select.includes('rol')) return true
  return Boolean(f.rol_sii || f.rol_sii_en_tramite)
}

/**
 * `ampliacion_regularizable` es un tri-estado (`si` · `no` · `no_aplica`), no un
 * booleano. `undefined` = no declarado, que es lo que `Unidad.regularizable`
 * modela y lo que el serializador de vuelta traduce a `no_aplica`.
 */
function regularizableDesdeSlug(slug: string | undefined): boolean | undefined {
  if (slug === 'si') return true
  if (slug === 'no') return false
  return undefined
}

/**
 * Traduce una fila de `TX_Unidades` al modelo de lectura de la consola.
 *
 * Los tres `singleSelect` se **normalizan a etiqueta de UI** acá y no más
 * adelante (C-1, 30-jul-2026). Antes viajaban como slug crudo y eso rompía dos
 * cosas a la vez: el `<Select>` del formulario no encontraba un `SelectItem` con
 * ese `value` y renderizaba vacío, y el mapper de edición le aplicaba la tabla
 * etiqueta→slug, que no tiene entrada para un slug, y terminaba escribiendo `""`
 * en Airtable. Normalizar en el borde de lectura deja un solo espacio de valores
 * —el de la UI— en todo lo que está aguas arriba.
 *
 * Un slug desconocido (una opción basura que `typecast` creó antes del fix)
 * queda como `''` y el vocabulario lo loguea. `''` es "no declarado", que es lo
 * que la pantalla ya sabe mostrar.
 */
function mapUnidad(id: string, f: RawFields): Unidad {
  return {
    id,
    ubicacion: f.numero_unidad ?? '',
    modelo: f.modelo || undefined,
    tipoBien: aEtiqueta(SUBTIPO, f.subtipo) ?? '',
    conRol: tieneRol(f),
    rolSii: f.rol_sii ?? '',
    rolEnTramite: f.rol_sii_en_tramite === true,
    // `null` y no 0: un `sup_m2` vacío en Airtable es "sin declarar", y el 0
    // literal que se leía antes se reescribía como una superficie real de cero
    // metros en el siguiente guardado (C-3).
    supConstruida: f.sup_m2 ?? null,
    supTerraza: f.superficie_terraza_m2,
    supTerreno: f.sup_terreno_m2,
    // `anioConstruccion` es string en el modelo de UI (el formulario lo edita
    // como texto); Airtable lo guarda como number. Cadena vacía y no "0"
    // cuando falta: un "0" se leería como un año real en pantalla.
    anioConstruccion: f.anio_construccion != null ? String(f.anio_construccion) : '',
    material: aEtiqueta(MATERIAL, f.tipo_material) ?? '',
    m2Ampliacion: f.ampliacion_m2,
    // Tri-estado: `no_aplica` (y el campo vacío) es "no declarado" y debe quedar
    // `undefined`, no `false`. El test previo devolvía `false` para `no_aplica`,
    // lo que convertía un no-declarado en un "no" explícito al reescribir.
    regularizable: regularizableDesdeSlug(f.ampliacion_regularizable),
    origenSuperficie: aEtiqueta(ORIGEN_SUPERFICIE, f.origen_superficie) ?? '',
    // El respaldo vive en TX_Adjuntos vía `respaldo_adjunto`; resolverlo exige
    // una segunda lectura que este bloque no hace. `null` = "sin respaldo
    // conocido", que es lo que el detalle ya sabe representar.
    respaldo: null,
    detalleItem: f.detalle_item || undefined,
  }
}

/**
 * Hidrata `unidades` de un lote de solicitudes desde `TX_Unidades`.
 *
 * Mismo molde que `hydrateContactos` (`lib/contactos-visita.ts`) y por las
 * mismas razones: una sola lectura para la página ya paginada (≤20) en vez de
 * una por fila, filtro por **`codigoExt`** y no por record ID —dentro de un
 * `filterByFormula` un campo Link se evalúa contra el *primary field* de la
 * tabla destino ([[E-076]]/[[E-077]])— y agrupación por record ID, que sí es
 * autoritativo.
 *
 * Por qué importa más de lo que parece: `datosMinimosFaltantes`
 * (`solicitud-detail.tsx`) evalúa RN-44 de forma síncrona sobre `unidades` para
 * habilitar "Asignar Tasador". Mientras `mapRecord` devolvía `unidades: []`
 * fijo, esa condición era `false` para **toda** solicitud real y el botón nunca
 * se habilitaba (Tanda D-02, Regla A).
 *
 * Degradación silenciosa: si Airtable falla se loguea y se devuelven las
 * solicitudes intactas, con el `unidades: []` que ya trae `mapRecord`.
 */
export async function hydrateUnidades(solicitudes: Solicitud[]): Promise<Solicitud[]> {
  const codigos = solicitudes
    .map((s) => s.codigoExt)
    .filter((c) => c && !c.includes('"'))
  if (codigos.length === 0) return solicitudes

  try {
    // Delimitado con comas a ambos lados para exigir match de token exacto:
    // sin eso "VP-2026-0054" matchearía dentro de "VP-2026-00541".
    const formula = `OR(${codigos
      .map((c) => `FIND(",${c},", "," & ARRAYJOIN({solicitud}, ",") & ",") > 0`)
      .join(', ')})`

    const records = await listRecords<RawFields>(TX_UNIDADES, {
      filterByFormula: formula,
      'sort[0][field]': 'orden',
      'sort[0][direction]': 'asc',
      fields: UNIDAD_FIELDS,
    })

    const porSolicitud = new Map<string, Unidad[]>()
    for (const r of records) {
      const unidad = mapUnidad(r.id, r.fields)
      for (const solicitudId of r.fields.solicitud ?? []) {
        const acumuladas = porSolicitud.get(solicitudId)
        if (acumuladas) acumuladas.push(unidad)
        else porSolicitud.set(solicitudId, [unidad])
      }
    }

    return solicitudes.map((s) => {
      const unidades = porSolicitud.get(s.id)
      return unidades ? { ...s, unidades } : s
    })
  } catch (err) {
    console.error('[hydrateUnidades]', err)
    return solicitudes
  }
}
