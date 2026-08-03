import { listRecords } from '@/lib/airtable-client'

/**
 * Dominio D_ · catálogo paramétrico documental (Tanda 1, 02-ago-2026).
 *
 * ## Por qué este archivo existe aparte de `lib/catalogos.ts`
 *
 * `lib/catalogos.ts` es dueño de los 5 catálogos maestros que alimentan un
 * `Search Records` de SC01 (cliente · tipo de informe · tipo de propiedad ·
 * producto · banco). `D_TipoDocumento` no alimenta ningún Search de SC01: es
 * la cabecera del **dominio paramétrico documental**, que la Capa de Datos
 * v2.6.5 dejó reducido a dos tablas tras la consolidación v1.6 —
 * `D_TipoDocumento` (catálogo de tipos) y `D_TipoDocumentoAtributo`
 * (`tbldI86ieVKpjpL7E`, 19 campos: qué extraer de cada tipo, con qué ejemplo
 * guiar a Claude, a qué tabla/campo va el resultado y con qué cardinalidad).
 *
 * RN-33 mantiene el dominio D_ sin links hacia M_/C_/TX_/A_/H_/Z_. Ese
 * aislamiento se refleja aquí: el módulo no importa nada de `catalogos.ts` ni
 * al revés.
 *
 * ## Qué depende de esta lectura
 *
 * RN-25 (Especificación v1.9.4 §4.2) — el sistema **no infiere** el tipo de un
 * documento, se declara. La declaración ocurre "al momento del upload
 * (dropdown filtrado por `D_TipoDocumento`)", que es exactamente el checklist
 * del sheet "Documentos y Adjuntos". Lo que se declare aquí es la clave con la
 * que RF-09 leerá después `D_TipoDocumentoAtributo`.
 *
 * ## Reglas que no son obvias
 *
 * 1. **`activo = TRUE()` es normativo, no una convención de estilo.** Capa de
 *    Datos v2.6.5, campo `activo` de `D_TipoDocumento`: "Default true. Solo
 *    activos se ofrecen al ejecutivo (soft-delete)". Una fila desactivada no
 *    se borra: deja de ofrecerse. Al 02-ago-2026 las 20 filas están activas,
 *    así que el filtro no descarta nada — existe para el día en que sí.
 * 2. **Se ordena por `nombre`, no por `codigo`.** `D_TipoDocumento` no tiene
 *    campo `orden` (el `orden` de presentación vive en
 *    `D_TipoDocumentoAtributo`, un nivel más abajo). El checklist lo lee una
 *    persona, así que gana el nombre legible sobre el slug.
 * 3. **`vigencia_dias` vacío significa "sin vencimiento"**, no cero — de ahí
 *    `number | null` y no `number`. Sólo 4 de las 20 filas lo tienen (90, 30,
 *    180, 730). El checklist sólo pinta el badge de vigencia cuando no es null.
 * 4. **Caché en memoria de 5 minutos**, mismo criterio que `lib/catalogos.ts`:
 *    es un catálogo paramétrico que cambia cuando alguien edita Airtable a
 *    mano, no en caliente. La caché es por proceso; en Railway con varias
 *    réplicas cada una tiene la suya, y el peor caso es ver el catálogo 5
 *    minutos desactualizado.
 * 5. **Sin `cellFormat: 'string'`.** La versión previa de este archivo lo usaba
 *    copiando a `fetchSolicitudes`, donde sí hace falta por fórmulas y fechas.
 *    Aquí convertía `vigencia_dias` (number) y `activo` (checkbox) en texto, y
 *    obligaba a un `Number()` de vuelta. Con JSON nativo ambos llegan tipados.
 *
 * @see docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md §4.1 · §4.2 (RN-25)
 * @see docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_5.md — dominio D_
 * @see docs/schema-airtable.md §18 — FIELD_IDs verificados vía MCP
 */

/** `D_TipoDocumento` — verificada vía MCP el 02-ago-2026 (20 filas activas). */
const TABLA_TIPOS_DOCUMENTO = 'tblkPhBnpdDmUWOl3'

const TTL_MS = 5 * 60 * 1000

/**
 * Condición de propiedad a la que aplica un documento. Espeja el `singleSelect`
 * `tipo_propiedad` (`fldIfdcjsr8KeNRCx`), derivado de la columna "Cuándo" de la
 * Especificación §4.2.1.
 */
export type CondicionPropiedad = 'nueva' | 'usada' | 'ambas'

/**
 * Un tipo de documento del catálogo. `codigo` es la PK natural (snake_case) y
 * el valor que viaja como `tipo_documento` a `/api/adjuntos/upload`; el `id`
 * (record ID de Airtable) se usa como `key` de React y como futura clave de
 * lectura contra `D_TipoDocumentoAtributo`.
 */
export interface TipoDocumento {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  entidad_emisora: string
  vigencia_dias: number | null
  tipo_propiedad: CondicionPropiedad | null
  activo: boolean
}

/** Forma cruda de la fila en Airtable. Todo opcional: Airtable omite vacíos. */
interface FilaTipoDocumento {
  codigo?: string
  nombre?: string
  descripcion?: string
  entidad_emisora?: string
  vigencia_dias?: number
  tipo_propiedad?: CondicionPropiedad
  activo?: boolean
}

let cache: { valor: TipoDocumento[]; expira: number } | null = null

/**
 * Lee el catálogo de tipos de documento activos.
 *
 * Propaga el error en vez de devolver `[]`: un checklist vacío es
 * indistinguible de "esta solicitud no requiere documentos", y esa ambigüedad
 * es peor que un fallo visible. El consumidor decide cómo degradar.
 */
export async function getTiposDocumento(): Promise<TipoDocumento[]> {
  const ahora = Date.now()
  if (cache && cache.expira > ahora) return cache.valor

  const registros = await listRecords<FilaTipoDocumento>(TABLA_TIPOS_DOCUMENTO, {
    fields: [
      'codigo',
      'nombre',
      'descripcion',
      'entidad_emisora',
      'vigencia_dias',
      'tipo_propiedad',
      'activo',
    ],
    filterByFormula: '{activo} = TRUE()',
  })

  const tipos: TipoDocumento[] = []

  for (const r of registros) {
    // `codigo` es el primary field y la clave del contrato con Make/RF-09.
    // Una fila sin código no es representable aguas abajo: se descarta.
    const codigo = r.fields.codigo?.trim()
    if (!codigo) continue

    tipos.push({
      id: r.id,
      codigo,
      nombre: r.fields.nombre?.trim() || codigo,
      descripcion: r.fields.descripcion?.trim() ?? '',
      entidad_emisora: r.fields.entidad_emisora?.trim() ?? '',
      vigencia_dias:
        typeof r.fields.vigencia_dias === 'number' ? r.fields.vigencia_dias : null,
      tipo_propiedad: r.fields.tipo_propiedad ?? null,
      activo: r.fields.activo ?? false,
    })
  }

  tipos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  cache = { valor: tipos, expira: ahora + TTL_MS }
  return tipos
}

// TODO (RF-09 · Fase Adjuntos 2): `getAtributosPorTipo(codigo)` contra
// `D_TipoDocumentoAtributo` (`tbldI86ieVKpjpL7E`). Devuelve los atributos
// declarados para un tipo con sus 10 campos consolidados (codigo_atributo,
// nombre_atributo, tipo_dato, unidad_medida, obligatorio, ejemplo_atributo,
// uso_tabla_destino, uso_campo_destino, uso_cardinalidad_destino,
// uso_campo_link_unidad) — la lectura única que RN-25 pide para construir el
// prompt de Claude y enrutar el resultado por cardinalidad. No implementar
// hasta que RF-09 esté en alcance: hoy no hay consumidor.

/** Invalida la caché. Sólo para tests. */
export function _resetCacheTiposDocumento(): void {
  cache = null
}
