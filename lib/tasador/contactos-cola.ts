/**
 * Teléfono del contacto prioritario de una o varias solicitudes — **módulo
 * server-only** (misma convención que `lectura-tasacion.ts`).
 *
 * Tanda P3-TAS.A · cierra **CI-035**.
 *
 * ## Por qué existe
 *
 * Hasta P2-TAS.B, `datosEjecutiva.contactoTelefono` salía de
 * `TX_Solicitudes.vendedor_telefono`. Era una aproximación declarada —el
 * vendedor suele ser quien abre la puerta— y se descartó `TX_ContactosVisita`
 * por su coste: una tabla hija resuelta fila a fila serían N lecturas en la
 * pantalla que más se abre del flujo.
 *
 * El coste no era el que se creyó. `TX_ContactosVisita` tiene el lookup
 * **`solicitud_record_id`** (`fldYNKk5cyfWLxwqD`), que expone el recordId de la
 * solicitud como texto: toda la cola se resuelve en **un** request, no en N.
 * Y la aproximación estaba fallando en el único caso real: la solicitud de la
 * cola del tasador mock (VP-2026-0058) **no tiene `vendedor_telefono`** y sí
 * tiene contacto de prioridad 1 con teléfono, así que la card renderizaba un
 * `href="tel:"` vacío teniendo el número en la base.
 *
 * El teléfono es el dato operativo más importante de la card: el tasador
 * **llama** al contacto de prioridad 1 y sólo después registra el resultado en
 * la Pantalla 2. Que la coordinación se registre en el sistema no cambia eso —
 * cambia dónde queda constancia del desenlace, no cómo se hace el contacto—.
 * Sale de la tabla que lo modela.
 *
 * ⚠ Este párrafo justificaba el teléfono con **RO-29** —*"la coordinación
 * queda en manos del teléfono, fuera del sistema"*— hasta el 19-ago-2026.
 * **RO-29 fue anulada**: la coordinación sí va por sistema desde P4-TAS. El
 * teléfono sigue siendo el dato importante, por la razón de arriba.
 *
 * ## Contrato
 *
 * - Devuelve **sólo** teléfonos de `TX_ContactosVisita`. **Sin respaldo a
 *   `vendedor_telefono`**: mezclar dos orígenes en silencio esconde el hueco de
 *   datos en vez de mostrarlo, y la card sabe omitir la línea (§4.1).
 * - Ausencia → la clave no aparece en el mapa. `null` lo pone el llamador.
 * - Un fallo de Airtable degrada a **mapa vacío**, nunca a excepción: la cola
 *   entera no se cae porque no se pudo resolver un teléfono.
 */

import { listRecords } from '@/lib/airtable-client'

/** `TX_ContactosVisita`. Mismo TABLE_ID que usa `lib/contactos-visita.ts` (IF-02). */
export const TX_CONTACTOS_VISITA = 'tblW3SSbKo6vRjwBJ'

/**
 * Campos que se piden. `solicitud_record_id` es el **lookup** del recordId de
 * la solicitud, no el Link: el Link se resuelve al primary field de la tabla
 * destino y obligaría a casar por `codigo_solicitud` (lección E-018/E-076).
 */
const CAMPOS = ['telefono', 'orden_prioridad', 'estado_contacto', 'solicitud_record_id']

interface ContactoFields {
  telefono?: string
  orden_prioridad?: number
  estado_contacto?: string
  /** Lookup: array de una sola entrada con el recordId de la solicitud. */
  solicitud_record_id?: string[]
}

/**
 * Un teléfono marcado como erróneo no es el número que se le pone al tasador
 * bajo un enlace `tel:`. Ese es justamente el estado que el campo existe para
 * registrar, y honrarlo es la diferencia entre una llamada y una llamada
 * perdida. Si es el único que hay, la solicitud queda sin teléfono — y eso se
 * ve, que es lo correcto.
 */
const ESTADO_INUTILIZABLE = 'telefono_erroneo'

/** El contacto sin `orden_prioridad` va al final, no al principio. */
const SIN_PRIORIDAD = Number.POSITIVE_INFINITY

function recordIdDeLookup(valor: unknown): string | null {
  if (Array.isArray(valor)) {
    const primero = valor.find((v) => typeof v === 'string' && v.startsWith('rec'))
    return typeof primero === 'string' ? primero : null
  }
  return typeof valor === 'string' && valor.startsWith('rec') ? valor : null
}

/**
 * recordId de solicitud → teléfono del contacto de menor `orden_prioridad`.
 *
 * Una sola llamada a Airtable para todas las solicitudes recibidas. Las que no
 * tengan contacto utilizable **no aparecen** en el mapa.
 *
 * El filtro delimita el recordId con comas a ambos lados, igual que
 * `hydrateContactos` de IF-02: un `FIND` suelto haría match parcial el día que
 * dos identificadores compartan prefijo.
 */
export async function telefonosPrioritarios(
  solicitudIds: readonly string[]
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()

  const ids = [...new Set(solicitudIds)].filter((id) => id.startsWith('rec'))
  if (ids.length === 0) return mapa

  let registros
  try {
    registros = await listRecords<ContactoFields>(TX_CONTACTOS_VISITA, {
      fields: CAMPOS,
      filterByFormula: `OR(${ids
        .map(
          (id) =>
            `FIND(",${id},", "," & ARRAYJOIN({solicitud_record_id}, ",") & ",") > 0`
        )
        .join(', ')})`,
    })
  } catch (err) {
    console.error(
      '[telefonosPrioritarios] no se pudo leer TX_ContactosVisita; la cola va sin teléfono',
      err
    )
    return mapa
  }

  /** Prioridad ya elegida por solicitud, para quedarse con la menor. */
  const prioridadElegida = new Map<string, number>()

  for (const { fields } of registros) {
    const solicitudId = recordIdDeLookup(fields.solicitud_record_id)
    if (!solicitudId) continue

    const telefono = (fields.telefono ?? '').trim()
    if (telefono === '') continue
    if (fields.estado_contacto === ESTADO_INUTILIZABLE) continue

    const prioridad =
      typeof fields.orden_prioridad === 'number' ? fields.orden_prioridad : SIN_PRIORIDAD

    /**
     * `undefined` y no un centinela: con `SIN_PRIORIDAD` como valor por defecto,
     * `Infinity < Infinity` es `false` y una solicitud cuyo único contacto no
     * tenga `orden_prioridad` se quedaría sin teléfono teniéndolo.
     */
    const yaElegida = prioridadElegida.get(solicitudId)
    if (yaElegida === undefined || prioridad < yaElegida) {
      prioridadElegida.set(solicitudId, prioridad)
      mapa.set(solicitudId, telefono)
    }
  }

  return mapa
}
