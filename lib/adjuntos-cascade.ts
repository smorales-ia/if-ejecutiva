/**
 * Cascade genérico de limpieza de data derivada al borrar un adjunto
 * (P14-TAS-CASCADE · generalizado en Tarea 5 · Fase A).
 *
 * ## Qué resuelve
 *
 * Al eliminar un adjunto (`DELETE /api/adjuntos/[id]` → `SC-Adjuntos-Delete`), el
 * archivo desaparece de Airtable y Dropbox, pero los **datos que ese adjunto
 * pobló** quedaban huérfanos. Este módulo los purga en cascada.
 *
 * ## Por qué un REGISTRY y no código por-tabla
 *
 * La funcionalidad de adjuntos es **genérica/compartida** por todas las UIs
 * (Ejecutiva, Tasador, Visador, futuras), y todas borran por el mismo endpoint.
 * El cascade vive en esta capa común. El {@link CASCADE_REGISTRY} declara, por
 * tabla derivada, cómo encontrar sus filas y cómo darlas de baja; agregar una
 * tabla nueva es una entrada de datos, no lógica nueva.
 *
 * ## Alcance real hoy: SOLO el patrón (b) — tablas hijas con provenance
 *
 * El registry sólo puede purgar tablas donde existe **provenance por adjunto**:
 * un Link que apunte de vuelta al adjunto que creó la fila. Hoy la única tabla
 * que la tiene es `TX_Comparables` (`adjunto_origen` · `fld4i271GJA1VHu6a`), que
 * AT03-Ext escribe al crear cada comparable (patrón b · muchas_por_solicitud).
 *
 * Los patrones (a) —campos en satélites 1:1 como `TX_DatosTasacion` /
 * `TX_DocumentosLegales`— y (c) —merges por unidad en `TX_Unidades`— **no tienen
 * provenance por campo**, y varios campos los comparten dos tipos de documento
 * (p. ej. `avaluo_exento`, `contribucion_anual`, `destino_sii`, `calidad_sii`
 * salen de `foto_fuente_sii` Y de `certificado_avaluo_fiscal`). Limpiarlos a
 * ciegas destruiría dato humano o multi-fuente, así que quedan **deferidos a la
 * Fase B** (decisión de Héctor + probable cambio de schema/pipeline). El mapa
 * completo `tipoDocumento → tabla/campo/patrón` está en `docs/schema-airtable.md`.
 *
 * ## Por qué DOS funciones y no una que busque tras el borrado
 *
 * Cuando Make borra el adjunto, **Airtable retira automáticamente ese record del
 * link de provenance** de las filas derivadas. Buscar *después* del borrado
 * encontraría cero filas —un no-op silencioso— y el huérfano quedaría. Por eso:
 *
 *   1. {@link capturarDerivadosDeAdjunto} — READ, **antes** de llamar a Make, con
 *      el adjunto aún vivo: obtiene los ids a purgar.
 *   2. {@link purgarDerivadosCapturados} — WRITE, **sólo tras `data.ok`**: borra o
 *      desliga por id. Si Make no borró nada (mismatch), no se purga.
 *
 * ## RO-31 · borrar vs desligar
 *
 * Cuando la entrada declara `historicoField`, una fila con ese campo en `true`
 * alimenta datos compartidos por *otras* tasaciones: borrarla destruiría dato
 * ajeno, así que se **desliga** vaciando su Link a la solicitud
 * (`desligarField`, `solicitud` por defecto) y la fila sobrevive. En `false` —o
 * sin `historicoField`— la fila es hija pura del padre y se **borra**.
 *
 * ## R7 · esto NO es Make
 *
 * El cascade escribe directo a Airtable server-side (misma vía que IF-03 para el
 * sync destructivo de sus tablas hijas). Es limpieza de data derivada, no una
 * transición de la máquina de estados —esa sigue en Make—. Autorizado por Sergio.
 */

import { listRecords, updateRecord } from '@/lib/airtable-client'
import { deleteRecords } from '@/lib/tasador/airtable-writes'
import { TABLE_IDS } from '@/lib/tasador/field-ids'

/**
 * Una tabla derivada purgable por el cascade. Todos los campos van por **nombre**
 * (no FIELD_ID): `listRecords` sin `returnFieldsByFieldId` devuelve las celdas por
 * nombre, y `filterByFormula` sólo acepta nombres entre llaves.
 */
export interface CascadeEntry {
  /** TABLE_ID de la tabla derivada. */
  tabla: string
  /**
   * Nombre del campo Link → `TX_Adjuntos` que da la provenance. La REST API lo
   * devuelve como array de record ids (`["recXXX"]`).
   */
  linkField: string
  /**
   * Nombre del checkbox que decide borrar vs desligar (RO-31). Ausente ⇒ la fila
   * es hija pura y siempre se borra.
   */
  historicoField?: string
  /**
   * Nombre del Link a la solicitud a vaciar cuando se desliga. Sólo se usa si
   * `historicoField` existe. Por defecto `solicitud`.
   */
  desligarField?: string
  /** Filtro server-side que acota la lectura a la solicitud del adjunto. */
  scopeFormula: (codigoExt: string) => string
}

/**
 * Registry de tablas derivadas. **Hoy tiene una sola entrada** (TX_Comparables);
 * las demás tablas del mapa documental no tienen provenance por adjunto y esperan
 * a la Fase B. Agregar una entrada aquí es todo lo que hace falta para sumar una
 * tabla al cascade.
 */
export const CASCADE_REGISTRY: CascadeEntry[] = [
  {
    tabla: TABLE_IDS.comparables,
    linkField: 'adjunto_origen',
    historicoField: 'aporta_a_historico',
    desligarField: 'solicitud',
    // El scope va por `clave_natural` (`{codigoExt}|COMP-NN`) porque el filtro por
    // `{solicitud}` no es fiable en esta tabla: el primary de `TX_Solicitudes` es
    // una fórmula y la comparación de Link contra texto devuelve vacío. La
    // precisión por adjunto la da el filtro en memoria sobre el `linkField`, que
    // no puede dar falsos positivos aunque el `SEARCH` sobre-devuelva.
    scopeFormula: (codigoExt) => `SEARCH(${JSON.stringify(codigoExt)}, {clave_natural})`,
  },
]

/** Una fila derivada candidata a la baja, ya resuelto su destino por RO-31. */
export interface DerivadoCascade {
  id: string
  /** TABLE_ID de la tabla a la que pertenece (para agrupar la purga). */
  tabla: string
  aportaHistorico: boolean
}

/** Recuento de la purga, para el log del route. */
export interface ResultadoCascade {
  borrados: number
  desligados: number
  errores: number
}

/** Lee el link de provenance de una fila como array de record ids. */
function idsDeLink(valor: unknown): string[] {
  return Array.isArray(valor) ? (valor as string[]) : []
}

/**
 * Captura, recorriendo el {@link CASCADE_REGISTRY}, las filas derivadas cuyo
 * `linkField` apunta a `adjuntoId`. **Debe llamarse ANTES de que Make borre el
 * adjunto** (ver docblock del módulo).
 *
 * Propaga cualquier fallo de lectura: el route lo captura, lo registra y continúa
 * el borrado sin cascade. No degrada a lista vacía por su cuenta.
 */
export async function capturarDerivadosDeAdjunto(
  adjuntoId: string,
  codigoExt: string
): Promise<DerivadoCascade[]> {
  const derivados: DerivadoCascade[] = []

  for (const entry of CASCADE_REGISTRY) {
    const fields = entry.historicoField
      ? [entry.linkField, entry.historicoField]
      : [entry.linkField]

    const filas = await listRecords<Record<string, unknown>>(entry.tabla, {
      filterByFormula: entry.scopeFormula(codigoExt),
      fields,
    })

    for (const f of filas) {
      if (!idsDeLink(f.fields[entry.linkField]).includes(adjuntoId)) continue
      derivados.push({
        id: f.id,
        tabla: entry.tabla,
        aportaHistorico: entry.historicoField
          ? Boolean(f.fields[entry.historicoField])
          : false,
      })
    }
  }

  return derivados
}

/**
 * Ejecuta la baja de las filas capturadas, agrupadas por tabla. **Sólo debe
 * llamarse tras `data.ok` de Make** (el adjunto realmente se borró).
 *
 * RO-31: `aportaHistorico=false` → DELETE (troceo de 10 en `deleteRecords`);
 * `=true` → PATCH vaciando el `desligarField` (la fila sobrevive).
 *
 * **No re-lanza.** Cualquier fallo de Airtable se registra con el prefijo
 * grep-eable `[ADJUNTOS-CASCADE-ORPHAN]` y se cuenta en `errores`: el adjunto ya
 * se borró, así que fallar aquí no debe romper el 200 del route; un huérfano
 * potencial queda logueado y auditable, nunca peor que antes de este cascade.
 *
 * Idempotente: lista vacía → `{0,0,0}` sin tocar Airtable.
 */
export async function purgarDerivadosCapturados(
  derivados: DerivadoCascade[]
): Promise<ResultadoCascade> {
  let borrados = 0
  let desligados = 0
  let errores = 0

  const porTabla = new Map<string, DerivadoCascade[]>()
  for (const d of derivados) {
    const acumuladas = porTabla.get(d.tabla)
    if (acumuladas) acumuladas.push(d)
    else porTabla.set(d.tabla, [d])
  }

  for (const [tabla, items] of porTabla) {
    const entry = CASCADE_REGISTRY.find((e) => e.tabla === tabla)
    const desligarField = entry?.desligarField ?? 'solicitud'

    const aBorrar = items.filter((c) => !c.aportaHistorico).map((c) => c.id)
    const aDesligar = items.filter((c) => c.aportaHistorico)

    if (aBorrar.length > 0) {
      try {
        borrados += await deleteRecords(tabla, aBorrar)
      } catch (err) {
        errores++
        console.error('[ADJUNTOS-CASCADE-ORPHAN] fallo al borrar filas derivadas', {
          tabla,
          ids: aBorrar,
          detalle: err instanceof Error ? err.message : String(err),
        })
      }
    }

    for (const c of aDesligar) {
      try {
        await updateRecord(tabla, c.id, { [desligarField]: [] })
        desligados++
      } catch (err) {
        errores++
        console.error('[ADJUNTOS-CASCADE-ORPHAN] fallo al desligar fila derivada', {
          tabla,
          id: c.id,
          detalle: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  return { borrados, desligados, errores }
}
