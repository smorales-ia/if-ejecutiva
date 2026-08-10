import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listRecords } from '@/lib/airtable-client'
import { toMakeSnakePayload } from '@/lib/mappers/crear-solicitud'
import { postToMake } from '@/lib/make-client'
import { recalcularSla } from '@/lib/sla-etapas'
import { nuevaSolicitudInternaSchema } from '@/lib/validators/nueva-solicitud-interna'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

const MENSAJE_ERROR_RED = 'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * Fase 2 · Paso 4B · Endpoint real de alta interna.
 *
 * ## Contrato de nombres (RF-04 · Tanda B, 27-jul-2026)
 *
 * El payload que viaja a Make es **snake_case sin excepciones**; el schema zod
 * permanece en camelCase. La traducción vive en `toMakeSnakePayload()`
 * (`lib/mappers/crear-solicitud.ts`), función pura, y ocurre justo antes del
 * POST. Hasta esta tanda el handler enviaba el `...spread` literal de
 * `parsed.data`, así que el módulo 7 de SC01 escribía ~30 campos vacíos.
 *
 * Precondición de despliegue: este contrato exige el blueprint importado en
 * Make.com el 27-jul-2026. Contra el escenario anterior, los 5 campos
 * renombrados llegan vacíos. Ver `docs/_notas/DELTA-SC01_20260727.md`.
 *
 * ## Notas de contrato que siguen vigentes
 *
 *  - `documentos[]` del formulario NO viaja — el upload de adjuntos es una
 *    fase posterior (`/api/adjuntos/upload`).
 *  - El formulario distingue banco originador (`banco_id`, slug de M_BANCOS,
 *    obligatorio) de banco financista (`banco`, nombre visible, condicional).
 *    Ambos viajan con su nombre de origen: el módulo 7 escribe `banco_id` en
 *    el campo de texto `banco`, y el Search del módulo 9 resuelve `banco` al
 *    link `banco_financista`. No son el mismo dato.
 *  - `ejecutiva_clerk_id` se agrega server-side desde la sesión Clerk activa,
 *    nunca desde el cliente — Make resuelve `ejecutiva_asignada` con un
 *    Search Records contra `AUTH_Usuarios.clerk_user_id`.
 *  - Fase Adjuntos 1 (D-12, Opción C, 10-jul-2026): SC01 devuelve
 *    `{ id, codigo_ext }` en el body del webhook. Este endpoint los propaga
 *    como `solicitud_id`/`codigo_ext` — el frontend los necesita para subir
 *    los adjuntos después de crear la solicitud. Si Make no los trae, la
 *    respuesta sigue siendo `{ ok: true }` sin esos campos: la solicitud ya se
 *    creó igual, sólo no se pueden subir adjuntos hasta que la Ejecutiva
 *    reintente desde el detalle. `codigo_ext` es el nombre canónico del campo
 *    (formula `fldSuJx1fDNYYwDcD`) — nunca `codigo_solicitud`.
 */

/**
 * Escapa un valor para interpolarlo en un `filterByFormula` de Airtable.
 * Dentro de comillas simples, `\` y `'` son los dos caracteres que rompen la
 * expresión. Sin esto, un N° de operación con apóstrofo convertiría el filtro
 * en una fórmula arbitraria.
 */
function escaparFormula(valor: string): string {
  return valor.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/**
 * Resultado del pre-chequeo de duplicados. `indeterminado` es un tercer estado
 * de primera clase: significa "Airtable no respondió", que es distinto de
 * "no hay duplicado" y se trata como no bloqueante.
 */
type ChequeoDuplicado =
  | { estado: 'duplicado'; codigoExt: string | null }
  | { estado: 'libre' }
  | { estado: 'indeterminado' }

/**
 * Busca una solicitud existente con el mismo N° de operación de cliente.
 *
 * Es una **lectura**, no una regla de negocio en la UI: la verdad sale de
 * Airtable, no del navegador. Reemplaza al `Set` en memoria que simulaba el
 * duplicado en `new-request-sheet.tsx`.
 *
 * `n_operacion_cliente` (`fldb1vmKk7y3hi4uY`) es de tipo `number` en el schema
 * real, mientras el formulario lo captura como texto. `& ''` fuerza la
 * coerción a string en la fórmula y evita depender de que ambos lados sean
 * numéricos.
 *
 * Nunca lanza: un fallo de Airtable devuelve `indeterminado` y el alta
 * continúa. Bloquear una creación legítima porque la lectura de control falló
 * sería peor que dejar pasar un duplicado ocasional — pero el bypass se
 * registra con `console.warn` para poder auditar después qué duplicados
 * entraron durante una caída.
 */
async function chequearDuplicado(
  nOperacion: string,
): Promise<ChequeoDuplicado> {
  try {
    const registros = await listRecords<{ codigo_ext?: string }>(
      TX_SOLICITUDES,
      {
        filterByFormula: `({n_operacion_cliente} & '') = '${escaparFormula(nOperacion)}'`,
        maxRecords: '1',
        fields: ['codigo_ext'],
      },
    )

    if (registros.length === 0) return { estado: 'libre' }
    return {
      estado: 'duplicado',
      codigoExt: registros[0].fields.codigo_ext ?? null,
    }
  } catch (err) {
    console.warn(
      '[POST /api/webhooks/crear-solicitud] el pre-chequeo de duplicados falló; ' +
        'se continúa con el alta sin validar (bypass auditable)',
      { n_operacion_cliente: nOperacion, error: err },
    )
    return { estado: 'indeterminado' }
  }
}

export async function POST(request: NextRequest) {
  // La autorización va primero: sin sesión no se procesa el body ni se revela
  // nada sobre la forma del contrato.
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 400 })
  }

  const parsed = nuevaSolicitudInternaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Revisa el formulario: hay campos obligatorios sin completar o con errores.',
      },
      { status: 400 }
    )
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_SC01
  const hmacSecret = process.env.MAKE_HMAC_SECRET
  if (!webhookUrl || !hmacSecret) {
    console.error('[POST /api/webhooks/crear-solicitud] faltan variables MAKE_* en el entorno')
    return NextResponse.json(
      { ok: false, error: 'Falta configurar variables MAKE_* en el entorno' },
      { status: 500 }
    )
  }

  // Conflicto de dato, no de forma: se responde 409 con el campo señalado para
  // que el formulario lo marque en su propia superficie de error (§1.5.1).
  const nOperacion = parsed.data.n_operacion_cliente.trim()
  const duplicado = await chequearDuplicado(nOperacion)
  if (duplicado.estado === 'duplicado') {
    return NextResponse.json(
      {
        ok: false,
        campo: 'n_operacion_cliente',
        error: `Ya existe una solicitud con el N° de operación ${nOperacion}.`,
        codigo_ext: duplicado.codigoExt,
      },
      { status: 409 }
    )
  }

  const payload = toMakeSnakePayload(parsed.data, { ejecutivaClerkId: userId })

  // ── Umbrales de la etapa 1 · RF-53 (§9.6.2 · C-6/C-7) ─────────────────────
  //
  // `sla_e1_inicio_ts` y `sla_etapa_actual = 1` los pone el mapper, pero los dos
  // instantes de pared —alerta y vencimiento— **no puede calcularlos Make**: la
  // aritmética hábil de §5.2.1 (L-V 9:00-18:00, feriados de `C_Feriados`, dos
  // cambios de huso al año) no cabe en una fórmula de Airtable ni en una
  // expresión del mapper. El motor los calcula aquí y Make los persiste, que es
  // exactamente el reparto de C-5: **el motor calcula, Make persiste** (RT-03).
  //
  // Se hace con `recalcularSla` en modo `persistir: false` y con la solicitud
  // **inyectada en memoria**: la fila todavía no existe en Airtable, así que no
  // hay nada que leer ni nada que escribir. `deps.leerSolicitud` devuelve el
  // registro sintético con el hito, y el resto de puertos (matriz, feriados,
  // `C_SLA`) resuelven contra la base como siempre.
  //
  // Sin hito no hay reloj: si el wizard no estampó `sla_e1_inicio_ts` se omite
  // el cálculo entero en vez de anclarlo a `now`, que sería fabricar el dato que
  // §5.2.2 define con precisión.
  const hito = payload.sla_e1_inicio_ts
  if (typeof hito === 'string' && hito !== '') {
    try {
      const { campos } = await recalcularSla('rec_alta_sin_persistir', {
        persistir: false,
        deps: {
          leerSolicitud: async () => ({
            sla_e1_inicio_ts: hito,
            // Los tres links viajan vacíos a propósito: en el alta todavía son
            // nombres, no record IDs, así que `resolverSlaDelPar` cae en la fila
            // comodín `SLA_DEFAULT_GLOBAL` (§9.6-R4). Da igual para e1 — el
            // único override por par es el de e7 (§9.6-R3) —, y forzar una
            // resolución con datos que aún no son links daría un falso positivo.
            cliente: [],
            tipo_informe: [],
            tipo_propiedad: [],
          }),
        },
      })
      payload.sla_etapa_alerta_ts = campos.sla_etapa_alerta_ts
      payload.sla_etapa_vence_ts = campos.sla_etapa_vence_ts
      payload.sla_recalculado_ts = campos.sla_recalculado_ts
    } catch (err) {
      // Mismo criterio que en `asignar/route.ts`: el reloj es instrumentación y
      // el alta es la operación de negocio. Un catálogo que no responde no
      // puede impedir crear una solicitud; queda el prefijo greppable para
      // auditar qué filas nacieron sin umbrales.
      console.error(
        '[POST /api/webhooks/crear-solicitud] [SLA-ETAPA] no se pudieron materializar los ' +
          'umbrales de e1; el alta continúa sin ellos',
        err,
      )
    }
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payload, {
      escenario: 'SC01',
      timeoutMs: 15000,
    })
  } catch (err) {
    console.error('[POST /api/webhooks/crear-solicitud] error de red/timeout hacia Make SC01', err)
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 502 })
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/webhooks/crear-solicitud] Make SC01 respondió con error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 502 })
  }

  const makeBody = (await makeRes.json().catch(() => ({}))) as {
    id?: string
    codigo_ext?: string
  }

  return NextResponse.json(
    {
      ok: true,
      solicitud_id: makeBody.id ?? null,
      codigo_ext: makeBody.codigo_ext ?? null,
    },
    { status: 200 }
  )
}
