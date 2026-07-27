import { listRecords } from '@/lib/airtable-client'
import type { ContactoVisita, Solicitud } from '@/lib/console-data'

// TX_ContactosVisita verificado vía MCP
export const TX_CONTACTOS_VISITA = 'tblW3SSbKo6vRjwBJ'

const CONTACTO_FIELDS = [
  'nombre',
  'telefono',
  'email',
  'rol',
  'orden_prioridad',
  'estado_contacto',
  'solicitud',
]

type RawFields = {
  nombre?: string
  telefono?: string
  email?: string
  rol?: string
  orden_prioridad?: number
  estado_contacto?: string
  /** Link a TX_Solicitudes. En formato JSON llega como array de record IDs. */
  solicitud?: string[]
}

function mapContacto(id: string, f: RawFields): ContactoVisita {
  return {
    id,
    rol: f.rol ?? '',
    nombre: f.nombre ?? '',
    // Cadena vacía y NO un placeholder tipo "—": RN-44 (solicitud-detail.tsx)
    // evalúa si existe algún contacto con teléfono para habilitar la asignación;
    // un placeholder contaría como teléfono válido y abriría el botón en falso.
    telefono: f.telefono ?? '',
    email: f.email ?? '',
    estado: f.estado_contacto ?? '—',
    ordenPrioridad: f.orden_prioridad,
  }
}

/**
 * Hidrata `contactosVisita` de un lote de solicitudes desde TX_ContactosVisita.
 *
 * Sólo lectura: toda escritura sigue viajando por Make (SC-Edicion). Se resuelve
 * en un único request para la página ya paginada (≤ 20 solicitudes) en vez de
 * uno por fila, y el orden lo decide Airtable vía `orden_prioridad` asc — la UI
 * nunca reordena, sólo asume que el primer elemento es el principal.
 *
 * `solicitud` es un link field, y dentro de un `filterByFormula` un link se
 * resuelve al **primary field** de la tabla destino — no al record ID (E-076 y
 * `schema-airtable.md` §137). El primary de `TX_Solicitudes` es
 * `codigo_solicitud`, funcionalmente idéntico a `codigo_ext`, así que se filtra
 * por `codigoExt`. El molde sigue siendo `fetchEventosPorSolicitud`
 * (`lib/eventos.ts`), corrigiendo ese detalle.
 *
 * Degradación silenciosa: si Airtable falla, se loguea y se devuelven las
 * solicitudes intactas (con el `contactosVisita: []` que ya trae `mapRecord`),
 * de modo que el detalle nunca se rompe por este bloque.
 */
export async function hydrateContactos(solicitudes: Solicitud[]): Promise<Solicitud[]> {
  // Se filtra por código y NO por record ID (ver doc de arriba). Se descartan
  // comillas dobles: romperían la fórmula. `codigo_ext` nunca las contiene.
  const codigos = solicitudes
    .map((s) => s.codigoExt)
    .filter((c) => c && !c.includes('"'))
  if (codigos.length === 0) return solicitudes

  try {
    // Se delimita con comas a ambos lados para exigir match exacto de token: un
    // FIND suelto haría que "VP-2026-0042" matchee dentro de "VP-2026-00421" el
    // día que `solicitud_id` pase de 4 dígitos.
    const formula = `OR(${codigos
      .map((c) => `FIND(",${c},", "," & ARRAYJOIN({solicitud}, ",") & ",") > 0`)
      .join(', ')})`

    const records = await listRecords<RawFields>(TX_CONTACTOS_VISITA, {
      filterByFormula: formula,
      'sort[0][field]': 'orden_prioridad',
      'sort[0][direction]': 'asc',
      fields: CONTACTO_FIELDS,
    })

    // El orden asc que devolvió Airtable se preserva al agrupar: el primer
    // contacto acumulado de cada solicitud es el de menor `orden_prioridad`.
    const porSolicitud = new Map<string, ContactoVisita[]>()
    for (const r of records) {
      const contacto = mapContacto(r.id, r.fields)
      for (const solicitudId of r.fields.solicitud ?? []) {
        const acumulados = porSolicitud.get(solicitudId)
        if (acumulados) acumulados.push(contacto)
        else porSolicitud.set(solicitudId, [contacto])
      }
    }

    return solicitudes.map((s) => {
      const contactos = porSolicitud.get(s.id)
      return contactos ? { ...s, contactosVisita: contactos } : s
    })
  } catch (err) {
    console.error('[hydrateContactos]', err)
    return solicitudes
  }
}
