/**
 * `POST /api/tasaciones/[id]/coordinacion` — RF-TAS-03 · RF-TAS-12 · RF-TAS-13.
 *
 * Registra el resultado del llamado del tasador al contacto de visita: una fila
 * en `TX_CoordinacionVisita` (`tblBwMErRxo57ML2r`) por intento, en cualquiera
 * de sus dos ramas. Es la materialización de los puntos 1 a 4 de Pantalla 2 del
 * diseño v4, que revirtieron RO-29 y cerraron **CI-012** en sentido positivo.
 *
 * ## Lo que esta ruta deliberadamente NO hace
 *
 * - **No toca `estado`.** Bajo ninguna circunstancia. §2.3 es explícito: *"la
 *   coordinación no cambia el estado backend: la solicitud permanece
 *   `asignada` antes, durante y después"*. La única transición del flujo del
 *   tasador vive en `/calcular`, que es la que gatilla **AT03**.
 *   **Que no haya código para eso es la implementación del requisito, no una
 *   omisión**: si alguien agrega aquí un cambio de estado, rompe §2.3 y hace
 *   que una coordinación dispare el motor de cálculo. Hay un test negativo que
 *   lo bloquea.
 * - **No envía el correo.** Lo manda SC13 leyendo `email_enviado_status =
 *   pendiente`. Por eso los toasts del cliente no prometen el envío.
 *
 * ## Idempotencia — ventana deslizante de 10 s
 *
 * Airtable **no tiene constraints de unicidad ni transacciones**, así que la
 * mitigación **R-2** (doble disparo por doble tap) vive acá. §2.12 la planteaba
 * como clave `(solicitud, fecha_respuesta truncada al minuto)`; se implementa
 * como **ventana deslizante** porque la truncación falla justo en el caso que
 * dice cubrir: dos taps a las `10:00:59` y `10:01:01` caen en buckets distintos
 * y los dos pasarían.
 *
 * Si ya hay una fila de esta solicitud dentro de los últimos
 * {@link VENTANA_IDEMPOTENCIA_MS}, se devuelve **esa** con `200` en vez de
 * crear otra. El falso positivo es imposible en la práctica: un segundo intento
 * legítimo exige que la ejecutiva corrija los contactos primero, y eso nunca
 * ocurre en diez segundos.
 *
 * ⚠ **Limitación conocida: la carrera residual no se cierra.** Entre la lectura
 * de la ventana y el `createRecord` hay ~100-300 ms en los que dos requests
 * genuinamente concurrentes ven ambos "sin filas recientes" y ambos insertan.
 * No es evitable sin unicidad en el motor de datos. Cubre el caso realista
 * —doble tap, reintento, refresh— y no el de dos pestañas disparando en el
 * mismo instante. Registrado en la ficha CI del bloque.
 */

import type { NextRequest } from 'next/server'
import { createRecord, listRecords, updateRecord } from '@/lib/airtable-client'
import { marcarFinEtapa } from '@/lib/sla-etapas'
import { auditar } from '@/lib/tasador/auditoria'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'
import { opcionesDeSingleSelect } from '@/lib/tasador/schema-airtable'
import { coordinacionSchema, parsearCuerpo } from '@/lib/tasador/validators'
import { getUsuarioTasador } from '@/lib/tasador/mock-user'

export const dynamic = 'force-dynamic'

/** Ventana de idempotencia. Ver la nota de arriba. */
const VENTANA_IDEMPOTENCIA_MS = 10_000

/** `TX_CoordinacionVisita.motivo`. Su dominio se lee en runtime (A-17). */
const CAMPO_MOTIVO = 'fld0rkrlg9Xo0fFVm'

/** El único estado desde el que se coordina una visita (§2.3). */
const ESTADO_COORDINABLE = 'asignada'

interface FilaCoordinacion {
  coordinacion_key?: string
  estado_coordinacion?: string
  intento_numero?: number
  fecha_respuesta?: string
  solicitud_record_id?: string[]
}

/** Filtro por el lookup, mismo patrón de comas que `contactos-cola.ts` (E-018). */
function filtroPorSolicitud(solicitudId: string): string {
  return `FIND(",${solicitudId},", "," & ARRAYJOIN({solicitud_record_id}, ",") & ",") > 0`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  /**
   * §2.3 · coordinar una solicitud que ya salió de `asignada` no tiene sentido:
   * la visita ya ocurrió o el cálculo ya corrió. **409**, no 400: el cuerpo es
   * válido, lo que no encaja es el estado del recurso.
   */
  if (guard.fields.estado !== ESTADO_COORDINABLE) {
    return error(MENSAJES.coordinacionNoAplica, 409)
  }

  const cuerpo = await parsearCuerpo(request, coordinacionSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)
  const datos = cuerpo.datos

  try {
    /**
     * Una sola lectura sirve a las dos cosas que hacen falta antes de escribir:
     * el ordinal del intento y la ventana de idempotencia.
     */
    const previas = await listRecords<FilaCoordinacion>(TABLE_IDS.coordinacionVisita, {
      fields: [
        'coordinacion_key',
        'estado_coordinacion',
        'intento_numero',
        'fecha_respuesta',
        'solicitud_record_id',
      ],
      filterByFormula: filtroPorSolicitud(id),
    })

    const ahora = Date.now()
    const reciente = previas.find(({ fields }) => {
      const ts = fields.fecha_respuesta ? Date.parse(fields.fecha_respuesta) : NaN
      return Number.isFinite(ts) && ahora - ts < VENTANA_IDEMPOTENCIA_MS
    })

    if (reciente) {
      console.warn(
        '[POST /api/tasaciones/[id]/coordinacion] replay dentro de la ventana de ' +
          'idempotencia; se devuelve la fila existente sin crear otra',
        { solicitudId: id, coordinacionId: reciente.id },
      )
      return ok({
        id: reciente.id,
        intentoNumero: reciente.fields.intento_numero ?? previas.length,
        estadoCoordinacion: reciente.fields.estado_coordinacion ?? null,
        estado: guard.fields.estado ?? null,
        replay: true,
      })
    }

    /**
     * `motivo` se comprueba **contra el schema real de Airtable**, no contra un
     * enum del repositorio: es el criterio de A-17. Un valor fuera del catálogo
     * se rechaza acá y no llega a `createRecord`, donde `typecast: true` lo
     * habría **creado como opción nueva** en silencio — el modo de fallo que
     * `A_Cambios.tabla_origen` ya enseñó a evitar.
     */
    if (datos.resultado === 'rechazada') {
      const catalogo = await opcionesDeSingleSelect(
        TABLE_IDS.coordinacionVisita,
        CAMPO_MOTIVO,
      )
      if (!catalogo.includes(datos.motivo)) {
        return error(MENSAJES.motivoNoValido, 400)
      }
    }

    const codigo = String(guard.fields.codigo_solicitud ?? '')
    const intentoNumero = previas.length + 1
    const usuario = getUsuarioTasador()

    /**
     * `fecha_respuesta` es un **instante** y va en ISO completo (RO-36).
     * `fecha_visita_propuesta`, en cambio, es una **fecha de calendario** y
     * viaja como el string `YYYY-MM-DD` que entregó el `<input type="date">`:
     * no se construye ningún `Date` en el camino de escritura, así que no hay
     * conversión de huso que pueda correr el día.
     */
    const camposFila: Record<string, unknown> = {
      coordinacion_key: `${codigo} · intento ${intentoNumero}`,
      solicitud: [id],
      estado_coordinacion: datos.resultado,
      intento_numero: intentoNumero,
      fecha_respuesta: new Date(ahora).toISOString(),
      /**
       * ⚠ **`usuario.usuarioId`, y NO `usuario.recordId`. No es un bug de
       * tipo: no lo "arregles".**
       *
       * El campo registra **quién actuó** —la identidad del usuario en el
       * proveedor de autenticación—, no **qué tasador es** en `M_Tasadores`.
       * Son dos cosas distintas y las dos son strings, así que el compilador no
       * distingue una de otra: el error sería silencioso.
       *
       * Que la solicitud pertenece a este tasador ya lo garantizó
       * `autorizarSolicitud`, y ese vínculo vive en `TX_Solicitudes.tasador`.
       * Duplicarlo acá no aportaría nada y **perdería el único dato que esta
       * fila puede aportar a la auditoría**: cuál de las cuentas humanas
       * registró el resultado del llamado.
       *
       * El nombre del campo dice `clerk_id` porque desde **P11-TAS** lo poblará
       * la sesión real de Clerk. Hasta entonces lo puebla `mockUserTasador`
       * (**R2**), y `getUsuarioTasador()` conserva esta firma justamente para
       * que el cambio no toque este sitio.
       */
      autor_clerk_id: usuario.usuarioId,
      email_enviado_status: 'pendiente',
    }

    if (datos.resultado === 'confirmada') {
      camposFila.fecha_visita_propuesta = datos.fechaVisita
      if (datos.nota) camposFila.nota = datos.nota
    } else {
      camposFila.motivo = datos.motivo
      camposFila.detalle = datos.detalle
    }

    const fila = await createRecord<FilaCoordinacion>(
      TABLE_IDS.coordinacionVisita,
      camposFila,
    )

    /**
     * Bloque 5 · **cierre de e2 y e3 en el mismo evento**.
     *
     * Q5 (Héctor, 19-ago-2026) fijó que la etapa 2 la cierra el tasador al
     * registrar el resultado del llamado, y que el "informe post-llamado" de
     * 0.5 h —la etapa 3— **queda absorbido por e2 en la UX**. El motor conserva
     * las siete filas de `C_SLA_Etapas`; lo que se funde es el escritor. No
     * existe ni existirá una segunda interacción que cierre e3 por separado.
     *
     * Se encadenan dos `marcarFinEtapa` con `persistir: false` y se acumulan
     * sus campos en un único `updateRecord`, igual que hace
     * `solicitudes/[id]/asignar/route.ts`. Un fallo del motor **no bloquea la
     * coordinación**: el reloj es instrumentación y registrar el resultado del
     * llamado es la operación de negocio. Se loguea con prefijo greppable para
     * poder auditar qué filas quedaron sin instrumentar.
     */
    let camposSla: Record<string, unknown> = {}
    try {
      const finE2 = await marcarFinEtapa(id, 2, undefined, { persistir: false })
      if (finE2) camposSla = { ...camposSla, ...finE2.campos }

      const finE3 = await marcarFinEtapa(id, 3, undefined, { persistir: false })
      if (finE3) camposSla = { ...camposSla, ...finE3.campos }

      if (!finE2 && !finE3) {
        console.warn(
          '[POST /api/tasaciones/[id]/coordinacion] [SLA-ETAPA] e2 y e3 ya tenían ' +
            'fin; no se recalcula',
          { solicitudId: id },
        )
      }
    } catch (err) {
      console.error(
        '[POST /api/tasaciones/[id]/coordinacion] [SLA-ETAPA] el motor no pudo ' +
          'calcular las transiciones e2→e3→e4; la coordinación continúa sin campos de SLA',
        { solicitudId: id, error: err },
      )
    }

    /**
     * `coordinacion_vigente` y los campos de SLA van en **un solo** `PATCH`.
     * Ninguno de los dos es fórmula: los escribe el servidor
     * (`docs/schema-airtable.md` §26.6). `estado` **no aparece** en este
     * payload, y no debe aparecer nunca.
     */
    await updateRecord(TABLE_IDS.solicitudes, id, {
      coordinacion_vigente: datos.resultado,
      ...camposSla,
    })

    await auditar([
      {
        registroId: id,
        registroNombre: codigo,
        campo: 'coordinacion_vigente',
        valorAnterior: guard.fields.coordinacion_vigente,
        valorNuevo: datos.resultado,
        razon: `Resultado de coordinación registrado por el tasador · intento ${intentoNumero} (RF-TAS-03)`,
      },
    ])

    // Se devuelve `estado` sin tocar, para que el test de aceptación tenga qué
    // comparar y la UI pueda comprobar que la coordinación no lo movió.
    return ok({
      id: fila.id,
      intentoNumero,
      estadoCoordinacion: datos.resultado,
      estado: guard.fields.estado ?? null,
      replay: false,
    })
  } catch (err) {
    return desdeExcepcion('POST /api/tasaciones/[id]/coordinacion', err)
  }
}
