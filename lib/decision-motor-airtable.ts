import { listRecords } from '@/lib/airtable-client'
import {
  mapDecisionMotor,
  type DecisionMotor,
  type DecisionMotorFields,
} from '@/lib/decision-motor'

// A_DecisionesMotor verificada vía REST API contra el schema vivo (11-ago-2026).
//
// ⚠ `docs/schema-airtable.md` **no documenta esta tabla**, y el diseño de la
// Capa de Datos v2.6.5 §A_DecisionesMotor nombra tres de sus campos distinto de
// como están en la base: `reglas_candidatas` (real: `reglas_candidatas_json`),
// `resultado_aplicado` (real: `resultado_aplicado_json`) y ningún
// `regla_ganadora_nombre`, que sí existe. Los nombres de abajo salen del schema
// real, no del documento. Ver la entrada CI correspondiente.
export const A_DECISIONES_MOTOR = 'tbluQQtXUI0Zd8jiN'

/**
 * Decisión del motor de reglas (AT01) para una solicitud.
 *
 * ⚠ Recibe el **código** (`VP-2026-0042`), no el record ID: en las 43 filas de
 * la tabla el Link `solicitud` está **vacío** y la única columna poblada que
 * identifica la solicitud es `solicitud_codigo`, un `singleLineText`. Por eso el
 * filtro es una igualdad literal sobre texto y no un `ARRAYJOIN` sobre el link,
 * que devolvería cero filas siempre — el modo de fallo silencioso de E-076/E-077
 * y de `fetchEventosPorSolicitud`.
 *
 * Devuelve `null` cuando no hay decisión registrada. Es un desenlace legítimo y
 * frecuente: AT01 se dispara con `estado = creada` y puede no haber corrido
 * todavía. El consumidor debe distinguirlo de un fallo de lectura.
 *
 * Si hubiera más de una fila para la misma solicitud —reevaluación del motor— se
 * devuelve la más reciente por `timestamp_decision`.
 */
export async function fetchDecisionMotor(
  codigoSolicitud: string
): Promise<DecisionMotor | null> {
  // Sin código no hay filtro posible. Devolver null es preferible a emitir una
  // fórmula que matchee toda la tabla.
  if (!codigoSolicitud || codigoSolicitud.includes('"')) return null

  const registros = await listRecords<DecisionMotorFields>(A_DECISIONES_MOTOR, {
    filterByFormula: `{solicitud_codigo}="${codigoSolicitud.replace(/"/g, '\\"')}"`,
    'sort[0][field]': 'timestamp_decision',
    'sort[0][direction]': 'desc',
    maxRecords: '5',
    fields: [
      'regla_ganadora_nombre',
      'razon_ganadora',
      'reglas_candidatas_json',
      'regla_ganadora_snapshot',
      'timestamp_decision',
      'motor_version',
    ],
  })

  const fila = registros[0]
  if (!fila) return null

  return mapDecisionMotor(fila.fields)
}
