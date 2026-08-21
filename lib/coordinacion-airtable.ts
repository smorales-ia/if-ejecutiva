import { isValidRecordId, listRecords } from '@/lib/airtable-client'
import type { CoordinacionSolicitud, IntentoCoordinacion } from '@/lib/coordinacion'
import { FIELD_IDS_COORDINACION_VISITA, TABLE_IDS } from '@/lib/tasador/field-ids'
import type { EstadoCoordinacion } from '@/lib/tasaciones'

/**
 * Lectura server-side de `TX_CoordinacionVisita` para IF-02 (**RF-TAS-05** ·
 * Frente C · bloque C2).
 *
 * La tabla la **escribe IF-03** (`POST /api/tasaciones/[id]/coordinacion`, una
 * fila por intento del tasador). Este módulo es el lado de sólo lectura: IF-02
 * no inserta, no actualiza y no deriva estado de negocio a partir de los
 * intentos — la UI muestra, nunca decide.
 *
 * ⚠ **No confundir con `TX_Solicitudes.coordinacion_vigente`**
 * (`fldI4Dv0jpRQvbdHl`), que es el campo que el Route Handler de IF-03 escribe
 * en el mismo PATCH que cierra el intento y que `lectura-tasacion.ts` lee para
 * el gate §2.4. El `coordinacionVigente` que devuelve este módulo se deriva del
 * **riel de intentos** y sirve para pintar el bloque de coordinación de IF-02;
 * son dos caminos al mismo desenlace y por diseño coinciden. Si alguna vez
 * divergen, el campo de la solicitud es el que manda (RO-05: una sola fuente de
 * verdad para el gate) y esta divergencia es un síntoma a investigar, no algo
 * que este módulo deba reconciliar por su cuenta.
 */

/**
 * Los dos tipos del contrato **viven en `lib/coordinacion.ts`** desde C3, y se
 * re-exportan acá para no romper a los llamadores server-side que ya los
 * importaban desde este módulo (`route.ts`, `route.test.ts`).
 *
 * Se mudaron porque también los consume el bloque de la pestaña Datos, que es
 * `"use client"`: dejarlos en este archivo obligaba al componente a importar —
 * aunque fuera con `import type`— un módulo que hace
 * `import { listRecords } from '@/lib/airtable-client'`. Es la misma separación
 * que `lib/decision-motor.ts` frente a `lib/decision-motor-airtable.ts`.
 */
export type { CoordinacionSolicitud, IntentoCoordinacion } from '@/lib/coordinacion'

const F = FIELD_IDS_COORDINACION_VISITA

/** Resultado vacío. Es el mismo objeto conceptual en los tres caminos de salida. */
const SIN_COORDINACION: CoordinacionSolicitud = { coordinacionVigente: null, intentos: [] }

/**
 * Filtro por el lookup `solicitud_record_id`, con el patrón de comas de
 * `contactos-cola.ts` (E-018): delimitar a ambos lados exige match de token
 * exacto, mientras que un `FIND` suelto haría que un `rec…` matcheara dentro de
 * otro que lo contenga como prefijo.
 *
 * ⚠ El filtro **no puede** ir contra el Link `solicitud`: dentro de un
 * `filterByFormula` un Link se evalúa contra el primary field de la tabla
 * destino —`codigo_solicitud`—, nunca contra el record ID (E-076/E-077).
 * Interpolar un `rec…` ahí devuelve cero filas siempre, sin error.
 *
 * Va por **nombre** de campo y no por FIELD_ID porque las fórmulas de Airtable
 * no aceptan `fld…`; es la única parte de este módulo que depende del nombre.
 */
function filtroPorSolicitud(solicitudId: string): string {
  return `FIND(",${solicitudId},", "," & ARRAYJOIN({solicitud_record_id}, ",") & ",") > 0`
}

function texto(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined
  const v = valor.trim()
  return v === '' ? undefined : v
}

/**
 * Normalización **cerrada** de `estado_coordinacion`, mismo criterio que
 * `coordinacionVigente()` en `lib/tasador/lectura-tasacion.ts`: sólo los dos
 * literales del contrato pasan; vacío, ausente o cualquier otra cosa → `null`.
 * Un valor fuera del contrato es "no hay dato", no un estado inventado.
 */
function normalizarEstado(valor: unknown): EstadoCoordinacion | null {
  return valor === 'confirmada' || valor === 'rechazada' ? valor : null
}

/** El lookup devuelve un array de record IDs; se lee `[0]`. */
function primerRecordId(valor: unknown): string {
  if (Array.isArray(valor)) return texto(valor[0]) ?? ''
  return texto(valor) ?? ''
}

function proyectar(id: string, fields: Record<string, unknown>): IntentoCoordinacion {
  const numero = fields[F.intentoNumero]

  return {
    id,
    solicitudId: primerRecordId(fields[F.solicitudRecordId]),
    estado: normalizarEstado(fields[F.estadoCoordinacion]),
    // `intento_numero` lo escribe el Route Handler de IF-03 contando intentos
    // previos, así que una fila sin él es una fila anómala. Se sirve como `0`
    // —valor imposible para un ordinal que arranca en 1— en vez de omitirse:
    // el tipo lo declara obligatorio y un `0` visible es preferible a un hueco
    // que la UI tendría que interpretar.
    intentoNumero: typeof numero === 'number' ? numero : 0,
    fechaRespuesta: texto(fields[F.fechaRespuesta]) ?? '',
    fechaVisita: texto(fields[F.fechaVisitaPropuesta]),
    nota: texto(fields[F.nota]),
    motivo: texto(fields[F.motivo]),
    detalle: texto(fields[F.detalle]),
  }
}

/**
 * Intentos de coordinación de una solicitud, del más reciente al más antiguo.
 *
 * ## Identidad del parámetro
 *
 * `solicitudId` es el **record ID** (`rec…`) de la solicitud, no su código: el
 * campo por el que se filtra es el lookup `solicitud_record_id`, que devuelve
 * record IDs. Es el criterio de `A_Cambios`, no el de `A_Eventos`.
 *
 * ## Orden
 *
 * El orden lo impone **este módulo**, en memoria, y no `sort[0][field]` de
 * Airtable. `coordinacionVigente` se define como el estado de `intentos[0]`, de
 * modo que el orden es parte del contrato y no un detalle de presentación: si
 * dependiera de un parámetro de la query, una fila con `fecha_respuesta` vacía
 * —o un cambio de nombre del campo, que el sort tampoco acepta por ID— podría
 * mover el primer elemento sin que nada fallara. El desempate por
 * `intentoNumero` descendente cubre el caso de dos filas con el mismo instante,
 * que la ventana de idempotencia de IF-03 hace improbable pero no imposible.
 *
 * ## Ausencia
 *
 * Cero filas devuelve `{ coordinacionVigente: null, intentos: [] }` — **RO-34**:
 * "todavía no se coordinó" no es un desenlace neutro. `null` significa que no
 * hay dato, y quien lo consuma tiene que distinguirlo de `rechazada`.
 *
 * ## Errores
 *
 * Un fallo de lectura **se propaga**; no degrada a lista vacía. Mismo criterio
 * que `historial-airtable.ts`: un riel incompleto que se ve completo es peor
 * que un error visible, porque la Ejecutiva no tendría forma de saber que le
 * falta la mitad de la secuencia.
 */
export async function fetchCoordinacionSolicitud(
  solicitudId: string
): Promise<CoordinacionSolicitud> {
  // Un id fuera de formato no puede tener intentos, y además es el único vector
  // de inyección en la fórmula: se corta antes de gastar la lectura.
  if (!isValidRecordId(solicitudId)) return { ...SIN_COORDINACION }

  const records = await listRecords<Record<string, unknown>>(
    TABLE_IDS.coordinacionVisita,
    {
      // Formato JSON (sin `cellFormat: 'string'`) a propósito: `fecha_respuesta`
      // tiene que llegar en ISO para poder ordenar y para que el cliente la
      // formatee en el huso de la Ejecutiva.
      returnFieldsByFieldId: 'true',
      fields: [
        F.estadoCoordinacion,
        F.solicitudRecordId,
        F.intentoNumero,
        F.fechaRespuesta,
        F.fechaVisitaPropuesta,
        F.nota,
        F.motivo,
        F.detalle,
      ],
      filterByFormula: filtroPorSolicitud(solicitudId),
    }
  )

  const intentos = records
    .map((r) => proyectar(r.id, r.fields))
    .sort((a, b) => {
      if (a.fechaRespuesta !== b.fechaRespuesta) {
        return a.fechaRespuesta < b.fechaRespuesta ? 1 : -1
      }
      return b.intentoNumero - a.intentoNumero
    })

  return {
    coordinacionVigente: intentos[0]?.estado ?? null,
    intentos,
  }
}
