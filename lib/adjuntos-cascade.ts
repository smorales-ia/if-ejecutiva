/**
 * Cascade de limpieza de data derivada al borrar un adjunto (P14-TAS-CASCADE).
 *
 * ## Qué resuelve
 *
 * Al eliminar un adjunto (`DELETE /api/adjuntos/[id]` → `SC-Adjuntos-Delete`), el
 * archivo desaparece de Airtable y Dropbox, pero los **comparables** que RF-09
 * extrajo de esa foto (`TX_Comparables`) quedaban huérfanos: un PDF de tasación
 * con datos de mercado sin respaldo documental. Este módulo los purga en cascada,
 * acotado con precisión por `TX_Comparables.adjunto_origen`
 * (`fld4i271GJA1VHu6a`, link → `TX_Adjuntos`), que AT03-Ext escribe al crear cada
 * comparable.
 *
 * ## Por qué DOS funciones y no una que busque tras el borrado
 *
 * Cuando Make borra el adjunto, **Airtable retira automáticamente ese record del
 * link `adjunto_origen`** de los comparables. Buscar por `adjunto_origen` *después*
 * del borrado encontraría cero filas —un no-op silencioso— y el huérfano quedaría.
 * Por eso el trabajo se parte en dos y se ordena alrededor de Make:
 *
 *   1. `capturarComparablesDeAdjunto()` — READ, **antes** de llamar a Make, con el
 *      adjunto aún vivo: obtiene los ids a purgar.
 *   2. `purgarComparablesCapturados()` — WRITE, **sólo tras `data.ok`**: borra o
 *      desliga por id. Si Make no borró nada (mismatch), no se purga.
 *
 * Capturar-antes es correcto haya o no auto-clear, así que es la opción segura.
 *
 * ## RO-31 · borrar vs desligar
 *
 * Un comparable con `aporta_a_historico = false` es hijo puro de la solicitud: se
 * **borra**. Uno con `aporta_a_historico = true` alimenta el histórico de mercado
 * de *otras* tasaciones; borrarlo destruiría dato ajeno, así que se **desliga**
 * vaciando el Link `solicitud` y la fila sobrevive.
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
 * Forma cruda de la fila leída de `TX_Comparables`. El link `adjunto_origen`
 * llega como **array de record ids** (`["recXXX"]`) desde la REST API, no como
 * objetos —igual que `solicitud?: string[]` en el resto del código—.
 */
interface ComparableFields {
  clave_natural?: string
  adjunto_origen?: string[]
  aporta_a_historico?: boolean
}

/** Un comparable candidato a la baja, ya resuelto su destino por RO-31. */
export interface ComparableCascade {
  id: string
  aportaHistorico: boolean
}

/** Recuento de la purga, para el log del route. */
export interface ResultadoCascade {
  borrados: number
  desligados: number
  errores: number
}

/**
 * Captura los comparables cuyo `adjunto_origen` apunta a `adjuntoId`. **Debe
 * llamarse ANTES de que Make borre el adjunto** (ver docblock del módulo).
 *
 * El scope server-side va por `clave_natural` (`{codigoExt}|COMP-NN`) porque el
 * filtro por `{solicitud}` no es fiable en esta tabla: el primary de
 * `TX_Solicitudes` es una fórmula y la comparación de link contra texto devuelve
 * vacío. La **precisión** por adjunto la da el filtro en memoria sobre
 * `adjunto_origen`, que no puede dar falsos positivos aunque el `SEARCH` de
 * `clave_natural` sobre-devuelva.
 */
export async function capturarComparablesDeAdjunto(
  adjuntoId: string,
  codigoExt: string
): Promise<ComparableCascade[]> {
  const filas = await listRecords<ComparableFields>(TABLE_IDS.comparables, {
    filterByFormula: `SEARCH(${JSON.stringify(codigoExt)}, {clave_natural})`,
    fields: ['clave_natural', 'adjunto_origen', 'aporta_a_historico'],
  })

  return filas
    .filter((f) => (f.fields.adjunto_origen ?? []).includes(adjuntoId))
    .map((f) => ({ id: f.id, aportaHistorico: Boolean(f.fields.aporta_a_historico) }))
}

/**
 * Ejecuta la baja de los comparables capturados. **Sólo debe llamarse tras
 * `data.ok` de Make** (el adjunto realmente se borró).
 *
 * RO-31: `aporta_a_historico=false` → DELETE; `=true` → PATCH vaciando el link
 * `solicitud` (la fila sobrevive como dato de mercado).
 *
 * **No re-lanza.** Cualquier fallo de Airtable se registra con el prefijo
 * grep-eable `[ADJUNTOS-CASCADE-ORPHAN]` y se cuenta en `errores`: el adjunto ya
 * se borró, así que fallar aquí no debe romper el 200 del route; un huérfano
 * potencial queda logueado y auditable, nunca peor que antes de este cascade.
 *
 * Idempotente: lista vacía → `{0,0,0}` sin tocar Airtable.
 */
export async function purgarComparablesCapturados(
  comparables: ComparableCascade[]
): Promise<ResultadoCascade> {
  const aBorrar = comparables.filter((c) => !c.aportaHistorico).map((c) => c.id)
  const aDesligar = comparables.filter((c) => c.aportaHistorico)

  let borrados = 0
  let desligados = 0
  let errores = 0

  if (aBorrar.length > 0) {
    try {
      borrados = await deleteRecords(TABLE_IDS.comparables, aBorrar)
    } catch (err) {
      errores++
      console.error('[ADJUNTOS-CASCADE-ORPHAN] fallo al borrar comparables', {
        ids: aBorrar,
        detalle: err instanceof Error ? err.message : String(err),
      })
    }
  }

  for (const c of aDesligar) {
    try {
      await updateRecord(TABLE_IDS.comparables, c.id, { solicitud: [] })
      desligados++
    } catch (err) {
      errores++
      console.error('[ADJUNTOS-CASCADE-ORPHAN] fallo al desligar comparable', {
        id: c.id,
        detalle: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { borrados, desligados, errores }
}
