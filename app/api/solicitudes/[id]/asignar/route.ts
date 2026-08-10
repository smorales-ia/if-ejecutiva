import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { TX_SOLICITUDES } from '@/lib/solicitudes'
import { postToMake } from '@/lib/make-client'
import { marcarFinEtapa } from '@/lib/sla-etapas'
import { asignarSolicitudSchema, issuesToCampos } from '@/lib/validators/acciones-solicitud'

export const dynamic = 'force-dynamic'

const MSG_RED = 'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * POST /api/solicitudes/[id]/asignar — Asigna un tasador (REGLA A).
 *
 * La transición `creada → asignada`, el registro de `fecha_asignacion`, los
 * eventos de `A_Eventos` y el envío del correo los ejecuta Make (SC-Asignar);
 * este handler sólo valida, verifica idempotencia y reenvía firmado (HMAC).
 *
 * Idempotencia REGLA A: si la solicitud ya tiene tasador, responde 409 (el
 * botón no debería estar visible, pero el server es la última línea de defensa).
 *
 * Deuda: la validación server-side de RN-44 (datos mínimos) queda pendiente
 * hasta que `unidades`/`contactos_visita` existan en Airtable — hoy el
 * read-layer los degrada a `[]`, así que validarlos aquí bloquearía toda
 * asignación. Mientras tanto la precondición vive client-side en
 * `solicitud-detail.tsx` (RN-44). TODO P6/P9: mover a server cuando exista schema.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!isValidRecordId(id)) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: MSG_RED }, { status: 400 })
  }

  const parsed = asignarSolicitudSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validacion', campos: issuesToCampos(parsed.error.issues) },
      { status: 422 }
    )
  }

  // Idempotencia + estado terminal: releer el registro real antes de asignar.
  try {
    // `tasador` es multipleRecordLinks: se mantiene `cellFormat: 'string'` para
    // leerlo como texto legible (en json llegaría como array de record ids).
    // Airtable exige timeZone + userLocale junto a ese formato o responde 422.
    const record = await getRecord<Record<string, string | undefined>>(TX_SOLICITUDES, id, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      fields: ['tasador', 'estado'],
    })
    if (!record) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    const tasadorActual = (record.fields['tasador'] ?? '').trim()
    if (tasadorActual !== '') {
      return NextResponse.json(
        {
          error: 'conflicto_negocio',
          campo: 'tasador',
          motivo: `La solicitud ya tiene tasador asignado (${tasadorActual}).`,
        },
        { status: 409 }
      )
    }
    const estado = (record.fields['estado'] ?? '').trim()
    if (estado === 'cancelada' || estado === 'cerrada') {
      return NextResponse.json(
        {
          error: 'conflicto_negocio',
          campo: 'estado',
          motivo: `No se puede asignar una solicitud en estado ${estado}.`,
        },
        { status: 409 }
      )
    }
  } catch (err) {
    if (err instanceof AirtableError && err.status === 404) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    console.error('[POST /api/solicitudes/[id]/asignar] error leyendo solicitud', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  // ── Reloj por etapa · RF-53 (§9.6.2 · C-5) ────────────────────────────────
  //
  // La asignación es la transición e1 → e2 de §5.2.4: cierra "Ingreso de
  // solicitud" y abre "Coordinación de visita". El motor calcula los seis
  // campos que eso implica —`sla_e1_fin_ts`, `sla_e2_inicio_ts`,
  // `sla_etapa_actual = 2`, `sla_etapa_alerta_ts`, `sla_etapa_vence_ts` y
  // `sla_recalculado_ts`— y **no escribe nada**: `persistir: false` devuelve el
  // payload y quien persiste es Make, en el mismo `Update` que ya escribe
  // estado y tasador (RT-03). Un `PATCH` desde aquí adelantaría a SC-Asignar y
  // dejaría dos escritores para la misma fila.
  //
  // Va **antes** del webhook por una razón de orden, no de estilo: si el motor
  // fallara después de disparar Make, la solicitud quedaría asignada y sin
  // reloj, y nadie se enteraría. Calculando primero, el peor caso es una
  // asignación sin campos de SLA, que es lo que ya pasa hoy y es recuperable
  // con un recálculo posterior.
  //
  // El fallo del motor **no bloquea la asignación**. Es una decisión explícita:
  // el reloj es instrumentación, la asignación es la operación de negocio, y
  // negarle a la Ejecutiva la acción principal porque `C_SLA_Etapas` no
  // respondió sería el bloqueo desproporcionado que CI-003b enseñó a evitar. Se
  // registra con prefijo greppable para poder auditar qué filas quedaron sin
  // instrumentar.
  let camposSla: Record<string, unknown> = {}
  try {
    // `marcarFinEtapa(1)` encadena la apertura de e2 y su recálculo (§5.2.4
    // "De → A"). Devuelve `null` si e1 ya estaba cerrada: es el guard de
    // idempotencia del motor, que aquí no debería dispararse nunca porque el
    // 409 de más arriba ya rechazó la doble asignación, pero si se disparara lo
    // correcto es no volver a correr el reloj hacia adelante.
    const resultado = await marcarFinEtapa(id, 1, undefined, { persistir: false })
    if (resultado) {
      camposSla = resultado.campos
    } else {
      console.warn(
        '[POST /api/solicitudes/[id]/asignar] [SLA-ETAPA] e1 ya tenía fin; no se recalcula',
        { solicitudId: id }
      )
    }
  } catch (err) {
    console.error(
      '[POST /api/solicitudes/[id]/asignar] [SLA-ETAPA] el motor no pudo calcular la ' +
        'transición e1→e2; la asignación continúa sin campos de SLA',
      { solicitudId: id, error: err }
    )
  }

  const payload = {
    solicitudId: id,
    tasadorId: parsed.data.tasadorId,
    motivo: parsed.data.motivo ?? null,
    ejecutivaClerkId: userId,
    // Claves snake_case, iguales a los nombres de campo de `TX_Solicitudes`:
    // el blueprint las lee como `{{1.sla_e1_fin_ts}}` y compararlas contra el
    // schema no exige traducir nada. Se hace *spread* para que, cuando el motor
    // no pudo calcular, las claves **no viajen** en vez de viajar vacías — el
    // módulo de Airtable trata distinto "ausente" de `""` (misma regla que
    // `toMakeSnakePayload`).
    ...camposSla,
  }

  // Sin webhook no hay persistencia. Hasta la tanda de cierre (29-jul-2026)
  // esta rama devolvía `200 {ok:true}`, que para el cliente es indistinguible
  // de una asignación real: la UI mostraba el toast verde, hacía desaparecer el
  // botón "Asignar Tasador" y en Airtable no había pasado nada. Es exactamente
  // el silent-200 de [[E-078]], que ya se había corregido en el PATCH de
  // `[id]/route.ts` pero no aquí.
  //
  // Ahora se distingue el entorno: en producción es un fallo de configuración
  // (503) y en desarrollo un 202 explícito que la UI no puede confundir con un
  // guardado real.
  const webhookUrl = process.env.MAKE_WEBHOOK_URL_SC_ASIGNAR
  if (!webhookUrl || !process.env.MAKE_HMAC_SECRET) {
    console.warn('[POST /api/solicitudes/[id]/asignar] MAKE_WEBHOOK_URL_SC_ASIGNAR sin configurar — no se persiste')
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: MSG_RED }, { status: 503 })
    }
    return NextResponse.json({ ok: false, pendiente_make: true }, { status: 202 })
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'SC-Asignar',
      solicitudId: id,
      timeoutMs: 15000,
    })
  } catch (err) {
    console.error('[POST /api/solicitudes/[id]/asignar] error de red hacia Make', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/solicitudes/[id]/asignar] Make respondió error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
