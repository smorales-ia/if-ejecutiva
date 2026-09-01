import { NextRequest, NextResponse } from 'next/server'
import { AirtableError, isValidRecordId } from '@/lib/airtable-client'
import { fetchCoordinacionSolicitud } from '@/lib/coordinacion-airtable'

export const dynamic = 'force-dynamic'

/**
 * GET /api/solicitudes/[id]/coordinacion — intentos de coordinación de la
 * visita (**RF-TAS-05** · Frente C · bloque C2).
 *
 * Sirve el riel de `TX_CoordinacionVisita` que IF-03 escribe, para que IF-02
 * pueda mostrar cómo fue la coordinación. **Sólo lectura**: cero escrituras,
 * cero efectos (RO-35). La fusión de estos intentos en el timeline del
 * Historial y el bloque de la pestaña Datos son tandas posteriores (C3/C4);
 * esta ruta no toca ningún componente.
 *
 * ## `[id]` es el record ID de la solicitud
 *
 * No el código. El campo por el que se filtra la tabla es el lookup
 * `solicitud_record_id`, que devuelve `rec…`. Es el criterio de `A_Cambios`, no
 * el de `A_Eventos` —los hermanos de esta carpeta mezclan ambos— y por eso el
 * `[id]` no se traduce a `codigo_solicitud` como sí hacen `eventos/` y
 * `decision-motor/`. Antes de cablear la UI hay que confirmar qué pasa
 * `solicitud-detail.tsx` como `s.id`.
 *
 * ## Sin lectura previa de la solicitud
 *
 * A diferencia de `eventos/` y `decision-motor/`, no se lee `TX_Solicitudes`
 * antes: no hace falta el código para filtrar, así que una lectura extra sólo
 * serviría para distinguir "solicitud inexistente" de "solicitud sin intentos".
 * Esa distinción no cambia nada de lo que la UI puede mostrar —en los dos casos
 * no hay coordinación que pintar— y costaría un round-trip por cada apertura
 * del detalle. Un `[id]` mal formado sí se rechaza con 404, antes de tocar
 * Airtable.
 *
 * ## Contrato
 *
 * `{ data: { coordinacionVigente, intentos } }` — el mismo envoltorio `{ data }`
 * de los hermanos de esta carpeta (`eventos/`, `sla/`, `decision-motor/`), de
 * modo que el hook de C4 puede reusar el desenvoltorio de
 * `use-historial-solicitud.ts` tal cual. El envoltorio lo pone **esta ruta**:
 * `fetchCoordinacionSolicitud` sigue devolviendo el payload al ras, que es lo
 * que cualquier consumidor server-side quiere.
 *
 * Los intentos van del más reciente al más antiguo. Cero filas devuelve
 * `coordinacionVigente: null` y `intentos: []` — **RO-34**: la ausencia de
 * coordinación no es un desenlace neutro, y el consumidor tiene que poder
 * distinguirla de `rechazada`.
 *
 * Un fallo de lectura sale por el 502 y **no** degrada a lista vacía: un riel
 * vacío que en realidad falló es indistinguible de "no se coordinó todavía".
 * El cuerpo de error lleva `error` y **no** `data`, igual que los hermanos.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // TODO(auth) · sin gate de Clerk, igual que `eventos/` y `decision-motor/` —
  // `sla/` sí lo tiene. La asimetría de `app/api/solicitudes/**` se resuelve
  // entera en la tanda de auth uniforme con Óscar, no ruta por ruta.

  if (!isValidRecordId(id)) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }

  try {
    return NextResponse.json({ data: await fetchCoordinacionSolicitud(id) })
  } catch (err) {
    console.error('[GET /api/solicitudes/[id]/coordinacion]', err)
    return NextResponse.json(
      { error: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.' },
      { status: err instanceof AirtableError ? 502 : 500 }
    )
  }
}
