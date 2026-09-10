/**
 * Cascade genérico de limpieza de data derivada al borrar un adjunto
 * (P14-TAS-CASCADE · generalizado en Tarea 5 · Fase A · patrones a/c en Fase B).
 *
 * ## Qué resuelve
 *
 * Al eliminar un adjunto (`DELETE /api/adjuntos/[id]` → `SC-Adjuntos-Delete`), el
 * archivo desaparece de Airtable y Dropbox, pero los **datos que ese adjunto
 * pobló** quedaban huérfanos. Este módulo los purga en cascada.
 *
 * ## Tres patrones (§28 · registro por FIELD_ID/nombre)
 *
 * - **(b) — provenance por adjunto.** Tablas hijas con un Link de vuelta al
 *   adjunto que creó cada fila. Hoy sólo `TX_Comparables` (`adjunto_origen`). Se
 *   **borra** la fila, o se **desliga** si aporta al histórico (RO-31). Es la
 *   única entrada declarada a mano en {@link CASCADE_REGISTRY}.
 * - **(a) — satélite 1:1 por solicitud.** `TX_DatosTasacion` /
 *   `TX_DocumentosLegales`: una fila por solicitud. Se **limpian campos a null**,
 *   la fila se conserva.
 * - **(c) — merge por unidad.** `TX_Unidades`: N filas por solicitud, la fila la
 *   crea el intake. Se **limpian los campos SII a null**, nunca se borra la fila
 *   (Q2 · conserva `rol_sii` y demás datos de intake).
 *
 * Las entradas (a)/(c) se **derivan** del mapa client-safe
 * `lib/adjuntos-doc-campos.ts` (`CAMPOS_DERIVADOS`, espejo curado de §28), para
 * que la lista de campos sea una sola —la misma que ve el usuario en el diálogo
 * de confirmación (Q3)— y no dos que puedan divergir.
 *
 * ## Provenance por TIPO, no por campo (Fase B · hallazgo)
 *
 * (a)/(c) no tienen Link de vuelta al adjunto, pero **sí** tienen la clave del
 * tipo: `TX_Adjuntos.clave_adjunto` (`fldaLLtzAaEn1O8IW`) guarda el `codigo` de
 * `D_TipoDocumento` declarado al subir (RN-25). El cascade lee esa clave del
 * adjunto vivo y limpia los campos que ese tipo pobló. Con la decisión Q1 de
 * Héctor —limpiar todo lo que el documento pobló, aunque un campo lo compartan
 * dos tipos o lo haya editado el tasador a mano— no hace falta provenance por
 * campo: el tipo basta.
 *
 * ## Por qué DOS funciones y no una que busque tras el borrado
 *
 * Cuando Make borra el adjunto, **Airtable retira automáticamente ese record del
 * link de provenance** de las filas (b). Buscar *después* del borrado encontraría
 * cero filas —un no-op silencioso— y el huérfano quedaría. Por eso:
 *
 *   1. {@link capturarDerivadosDeAdjunto} — READ, **antes** de llamar a Make, con
 *      el adjunto aún vivo: lee su `clave_adjunto` y obtiene las filas a purgar.
 *   2. {@link purgarDerivadosCapturados} — WRITE, **sólo tras `data.ok`**: borra,
 *      desliga o limpia por id. Si Make no borró nada (mismatch), no se purga.
 *
 * ## R7 · esto NO es Make
 *
 * El cascade escribe directo a Airtable server-side (misma vía que IF-03 para el
 * sync destructivo de sus tablas hijas). Es limpieza de data derivada, no una
 * transición de la máquina de estados —esa sigue en Make—. Autorizado por Sergio.
 */

import { getRecord, listRecords, updateRecord } from '@/lib/airtable-client'
import { deleteRecords } from '@/lib/tasador/airtable-writes'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { CAMPOS_DERIVADOS } from '@/lib/adjuntos-doc-campos'

/**
 * Contexto de una solicitud que las `scopeFormula` necesitan. `codigoExt` es
 * idéntico en valor a `codigo_solicitud` (§19.1), que es el primary contra el
 * que un Link se evalúa en `filterByFormula`; `solicitudId` es el record id, más
 * robusto para el lookup `solicitud_record_id` de `TX_Unidades` (§23).
 */
export interface CascadeCtx {
  codigoExt: string
  solicitudId: string
}

/**
 * (b) Tabla hija con provenance por adjunto. Todos los campos van por **nombre**:
 * `listRecords` sin `returnFieldsByFieldId` devuelve las celdas por nombre y
 * `filterByFormula` sólo acepta nombres entre llaves.
 */
export interface CascadeEntryProvenance {
  patron: 'b'
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
  scopeFormula: (ctx: CascadeCtx) => string
}

/**
 * (a)/(c) Limpieza de campos por tipo de documento. Nunca borra la fila.
 * Los `campos` son **FIELD_IDs** (`fld…`): el PATCH los usa como claves, más
 * estables que el nombre y a prueba del homónimo `anno_construccion` de
 * `TX_DatosTasacion` (ver `lib/adjuntos-doc-campos.ts`).
 */
export interface CascadeEntryCampos {
  patron: 'a' | 'c'
  /** `clave_adjunto` (= codigo `D_TipoDocumento`) que dispara esta limpieza. */
  tipoDocumento: string
  tabla: string
  /** FIELD_IDs a poner a null. */
  campos: string[]
  scopeFormula: (ctx: CascadeCtx) => string
}

export type CascadeEntry = CascadeEntryProvenance | CascadeEntryCampos

/** Scope de un satélite 1:1 (a): el Link `solicitud` contra el primary (= codigoExt). */
const scopeSolicitud = (ctx: CascadeCtx) => `{solicitud}=${JSON.stringify(ctx.codigoExt)}`

/**
 * Scope de `TX_Unidades` (c): el lookup del record id, no el Link. Un Link se
 * evalúa contra el primary de la tabla destino; el lookup sí devuelve `rec…`
 * (§23 · misma lección que E-076/E-077).
 */
const scopeUnidades = (ctx: CascadeCtx) =>
  `ARRAYJOIN({solicitud_record_id})=${JSON.stringify(ctx.solicitudId)}`

/**
 * Entradas (a)/(c) derivadas del mapa curado. Una por (tipoDocumento, tabla):
 * `foto_fuente_sii` genera tres (TX_DatosTasacion, TX_DocumentosLegales,
 * TX_Unidades), `certificado_avaluo_fiscal` dos, `escritura_compraventa` una.
 */
const ENTRADAS_CAMPOS: CascadeEntryCampos[] = Object.entries(CAMPOS_DERIVADOS).flatMap(
  ([tipoDocumento, tablas]) =>
    tablas.map((t) => ({
      patron: t.patron,
      tipoDocumento,
      tabla: t.tabla,
      campos: t.campos.map((c) => c.fieldId),
      scopeFormula: t.patron === 'c' ? scopeUnidades : scopeSolicitud,
    }))
)

/**
 * Registry de tablas derivadas. La entrada (b) de `TX_Comparables` se declara a
 * mano (tiene provenance por adjunto y política RO-31); las (a)/(c) se agregan
 * derivadas de `CAMPOS_DERIVADOS`.
 */
export const CASCADE_REGISTRY: CascadeEntry[] = [
  {
    patron: 'b',
    tabla: TABLE_IDS.comparables,
    linkField: 'adjunto_origen',
    historicoField: 'aporta_a_historico',
    desligarField: 'solicitud',
    // El scope va por `clave_natural` (`{codigoExt}|COMP-NN`) porque el filtro por
    // `{solicitud}` no es fiable en esta tabla: el primary de `TX_Solicitudes` es
    // una fórmula y la comparación de Link contra texto devuelve vacío. La
    // precisión por adjunto la da el filtro en memoria sobre el `linkField`, que
    // no puede dar falsos positivos aunque el `SEARCH` sobre-devuelva.
    scopeFormula: (ctx) => `SEARCH(${JSON.stringify(ctx.codigoExt)}, {clave_natural})`,
  },
  ...ENTRADAS_CAMPOS,
]

/** Una fila derivada candidata a la baja, ya resuelto su destino. */
export type DerivadoCascade =
  /** (b) borrar o desligar según RO-31. */
  | { op: 'baja'; id: string; tabla: string; aportaHistorico: boolean }
  /** (a)/(c) PATCH de estos FIELD_IDs a null; la fila se conserva. */
  | { op: 'limpiar'; id: string; tabla: string; campos: string[] }

/** Recuento de la purga, para el log del route. */
export interface ResultadoCascade {
  borrados: number
  desligados: number
  limpiados: number
  errores: number
}

/** Lee el link de provenance de una fila como array de record ids. */
function idsDeLink(valor: unknown): string[] {
  return Array.isArray(valor) ? (valor as string[]) : []
}

/**
 * Captura, recorriendo el {@link CASCADE_REGISTRY}, las filas derivadas de este
 * adjunto. **Debe llamarse ANTES de que Make borre el adjunto** (ver docblock).
 *
 * Primero lee `TX_Adjuntos.clave_adjunto` del adjunto vivo (el tipo de
 * documento): sin él no se puede decidir qué entradas (a)/(c) aplican. Luego:
 *
 * - (b): filas cuyo `linkField` apunta a `adjuntoId` → baja.
 * - (a)/(c): sólo las entradas cuyo `tipoDocumento === clave_adjunto`; cada fila
 *   en scope → limpiar.
 *
 * Propaga cualquier fallo de lectura: el route lo captura, lo registra y continúa
 * el borrado sin cascade. No degrada a lista vacía por su cuenta.
 */
export async function capturarDerivadosDeAdjunto(
  adjuntoId: string,
  ctx: CascadeCtx
): Promise<DerivadoCascade[]> {
  const derivados: DerivadoCascade[] = []

  const adjunto = await getRecord<{ clave_adjunto?: string }>(TABLE_IDS.adjuntos, adjuntoId)
  const claveAdjunto = adjunto?.fields.clave_adjunto?.trim() ?? ''

  for (const entry of CASCADE_REGISTRY) {
    if (entry.patron === 'b') {
      const fields = entry.historicoField
        ? [entry.linkField, entry.historicoField]
        : [entry.linkField]

      const filas = await listRecords<Record<string, unknown>>(entry.tabla, {
        filterByFormula: entry.scopeFormula(ctx),
        fields,
      })

      for (const f of filas) {
        if (!idsDeLink(f.fields[entry.linkField]).includes(adjuntoId)) continue
        derivados.push({
          op: 'baja',
          id: f.id,
          tabla: entry.tabla,
          aportaHistorico: entry.historicoField
            ? Boolean(f.fields[entry.historicoField])
            : false,
        })
      }
      continue
    }

    // (a)/(c): sólo si el adjunto es del tipo que pobló esta tabla.
    if (entry.tipoDocumento !== claveAdjunto) continue

    const filas = await listRecords<Record<string, unknown>>(entry.tabla, {
      filterByFormula: entry.scopeFormula(ctx),
    })

    for (const f of filas) {
      derivados.push({ op: 'limpiar', id: f.id, tabla: entry.tabla, campos: entry.campos })
    }
  }

  return derivados
}

/**
 * Ejecuta la baja/limpieza de las filas capturadas. **Sólo debe llamarse tras
 * `data.ok` de Make** (el adjunto realmente se borró).
 *
 * - `op:'baja'` + `aportaHistorico=false` → DELETE (troceo de 10 en
 *   `deleteRecords`); `=true` → PATCH vaciando el `desligarField` (RO-31).
 * - `op:'limpiar'` → PATCH poniendo cada FIELD_ID a null; la fila se conserva.
 *
 * **No re-lanza.** Cualquier fallo de Airtable se registra con el prefijo
 * grep-eable `[ADJUNTOS-CASCADE-ORPHAN]` y se cuenta en `errores`: el adjunto ya
 * se borró, así que fallar aquí no debe romper el 200 del route; un huérfano
 * potencial queda logueado y auditable, nunca peor que antes de este cascade.
 *
 * Idempotente: lista vacía → `{0,0,0,0}` sin tocar Airtable.
 */
export async function purgarDerivadosCapturados(
  derivados: DerivadoCascade[]
): Promise<ResultadoCascade> {
  let borrados = 0
  let desligados = 0
  let limpiados = 0
  let errores = 0

  const porTabla = new Map<string, DerivadoCascade[]>()
  for (const d of derivados) {
    const acumuladas = porTabla.get(d.tabla)
    if (acumuladas) acumuladas.push(d)
    else porTabla.set(d.tabla, [d])
  }

  for (const [tabla, items] of porTabla) {
    const entry = CASCADE_REGISTRY.find((e) => e.tabla === tabla)
    const desligarField =
      entry && entry.patron === 'b' ? entry.desligarField ?? 'solicitud' : 'solicitud'

    const aBorrar = items
      .filter((c): c is Extract<DerivadoCascade, { op: 'baja' }> => c.op === 'baja' && !c.aportaHistorico)
      .map((c) => c.id)
    const aDesligar = items.filter(
      (c): c is Extract<DerivadoCascade, { op: 'baja' }> => c.op === 'baja' && c.aportaHistorico
    )
    const aLimpiar = items.filter(
      (c): c is Extract<DerivadoCascade, { op: 'limpiar' }> => c.op === 'limpiar'
    )

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

    for (const c of aLimpiar) {
      try {
        await updateRecord(tabla, c.id, Object.fromEntries(c.campos.map((f) => [f, null])))
        limpiados++
      } catch (err) {
        errores++
        console.error('[ADJUNTOS-CASCADE-ORPHAN] fallo al limpiar campos derivados', {
          tabla,
          id: c.id,
          campos: c.campos,
          detalle: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  return { borrados, desligados, limpiados, errores }
}
