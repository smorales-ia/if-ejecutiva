/**
 * Capa 4 de todo Route Handler de mutación: auditoría en `A_Cambios`.
 *
 * Tanda P2-TAS · plan §3.1. **IF-03 escribe `A_Cambios`**; IF-02 tiene prohibido
 * hacerlo y escribe `A_Eventos` (§0.4 nota 2 del plan). No confundir las dos.
 *
 * ## ⚠ El schema documentado de esta tabla está mal — CI-011
 *
 * `docs/schema-airtable.md` §10 documenta nueve campos, de los cuales **dos no
 * existen** y **tres tienen otro nombre o tipo**. El más caro es `solicitud`
 * (Link → `TX_Solicitudes`): §10 lo declara la FK de la tabla y **no existe
 * ninguna columna Link en `A_Cambios`**.
 *
 * Este módulo escribe contra el **schema real**, verificado vía REST el
 * 11-ago-2026 y ya en uso en producción por `lib/historial-airtable.ts:118-139`,
 * que es el lector del otro lado:
 *
 * | Documentado en §10 | Real | Nota |
 * |---|---|---|
 * | `tabla_afectada` (texto) | **`tabla_origen`** (singleSelect) | otro nombre y otro tipo |
 * | `solicitud` (Link) | **no existe** | la FK es el par `tabla_origen` + `registro_id` |
 * | `autor` | **`modificado_por_email`** | el campo vacío se llama `actor`, no `autor` — CI-011 se equivoca en el nombre |
 * | `motivo` | **`razon_cambio`** | `motivo` existe pero está vacío en 9/9 filas |
 * | `timestamp` (Created time) | `timestamp` (**dateTime editable**) | hay que escribirlo |
 *
 * Escribir en `actor` o en `motivo` no daría error y **no lo leería nadie**: el
 * timeline de §1.3.3 lee los campos reales. Ése es el fallo silencioso que
 * CI-011 documenta.
 *
 * ## Se escribe por nombre, con los IDs como contrato
 *
 * Los FIELD_IDs están en `FIELD_IDS_CAMBIOS` (levantados en P2-TAS). El I/O va
 * **por nombre** —Airtable acepta ambos y el nombre se lee mejor—, siguiendo el
 * precedente de `lib/sla-etapas.ts:60`: los IDs quedan como lo estable contra
 * un renombrado en la UI de Airtable.
 */

import { createRecord } from '@/lib/airtable-client'
import { TABLA_ORIGEN, TABLE_IDS } from './field-ids'
import { getUsuarioTasador } from './mock-user'

/**
 * Valor de `A_Cambios.tabla_origen` para las filas de solicitudes.
 *
 * Coincide **exactamente** con el que usa `lib/historial-airtable.ts:16`; si
 * divergieran, IF-03 escribiría filas que el timeline de IF-02 no encuentra.
 * Verificado además contra el dominio real del `singleSelect`, que incluye
 * `TX_Solicitudes` — un valor fuera de la lista se crearía solo por `typecast`
 * y la divergencia pasaría inadvertida.
 */
export const TABLA_ORIGEN_SOLICITUDES = TABLA_ORIGEN.solicitudes

export interface CambioAuditado {
  /** recordId del registro modificado. Va a `registro_id` — es la FK real. */
  registroId: string
  /** Nombre legible del registro. Normalmente `codigo_solicitud`. */
  registroNombre?: string
  campo: string
  valorAnterior?: unknown
  valorNuevo?: unknown
  /** Por qué se hizo el cambio. Va a `razon_cambio`, no a `motivo`. */
  razon?: string
  /** Tabla auditada. Por defecto `TX_Solicitudes`. */
  tablaOrigen?: string
}

/** Serializa un valor de campo a texto plano para `valor_anterior` / `valor_nuevo`. */
function aTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'string') return valor
  if (Array.isArray(valor)) return valor.join(', ')
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}

/**
 * Escribe una fila de auditoría por cada campo modificado.
 *
 * **No lanza.** Una auditoría que falla no debe tumbar una mutación que ya se
 * aplicó: dejaría al usuario con un error y el dato escrito, que es el peor de
 * los dos mundos. El fallo se loguea y la ruta sigue. Devuelve cuántas filas se
 * escribieron para que el llamador pueda reportarlo si le importa.
 */
export async function auditar(cambios: CambioAuditado[]): Promise<number> {
  if (cambios.length === 0) return 0

  const usuario = getUsuarioTasador()
  const ahora = new Date().toISOString()
  let escritas = 0

  for (const c of cambios) {
    try {
      await createRecord(TABLE_IDS.cambios, {
        tabla_origen: c.tablaOrigen ?? TABLA_ORIGEN_SOLICITUDES,
        registro_id: c.registroId,
        registro_nombre: c.registroNombre ?? '',
        campo_modificado: c.campo,
        valor_anterior: aTexto(c.valorAnterior),
        valor_nuevo: aTexto(c.valorNuevo),
        modificado_por_email: usuario.usuarioId,
        razon_cambio: c.razon ?? '',
        timestamp: ahora,
      })
      escritas++
    } catch (err) {
      console.error('[auditoria] no se pudo auditar el cambio', {
        registro: c.registroId,
        campo: c.campo,
        err,
      })
    }
  }

  return escritas
}

/**
 * Deriva la lista de cambios comparando el estado previo con el payload nuevo.
 *
 * Sólo emite los campos que **realmente** cambiaron: auditar un campo que se
 * reenvía igual llena la tabla de ruido y hace ilegible el timeline. La
 * comparación es sobre la forma serializada, que es lo que se persiste.
 */
export function derivarCambios(
  registroId: string,
  antes: Record<string, unknown>,
  despues: Record<string, unknown>,
  opciones: { registroNombre?: string; razon?: string; tablaOrigen?: string } = {}
): CambioAuditado[] {
  const cambios: CambioAuditado[] = []

  for (const [campo, valorNuevo] of Object.entries(despues)) {
    const valorAnterior = antes[campo]
    if (aTexto(valorAnterior) === aTexto(valorNuevo)) continue

    cambios.push({
      registroId,
      registroNombre: opciones.registroNombre,
      campo,
      valorAnterior,
      valorNuevo,
      razon: opciones.razon,
      tablaOrigen: opciones.tablaOrigen,
    })
  }

  return cambios
}
