import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { isValidRecordId } from '@/lib/airtable-client'
import { componerCarpetaDropbox } from '@/lib/dropbox-path'
import {
  ErrorPathIrresoluble,
  resolverCasoPath,
  resolverContextoSolicitud,
  type MotivoPathIrresoluble,
} from '@/lib/dropbox-path-contexto'
import { postToMake } from '@/lib/make-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const MENSAJE_DEGRADADO =
  'Subida de adjuntos temporalmente no disponible. Puedes crear la solicitud sin adjuntos y agregarlos después.'
const MENSAJE_ERROR_RED =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'
const MENSAJE_ARCHIVO_GRANDE =
  'Este archivo supera el límite de 7 MB. Comprímelo o divídelo.'

const MAX_TAMANIO_KB = 7 * 1024 // 7MB, ya en KB (D-13)

/**
 * Mensajes de los tres motivos por los que el path no se puede componer
 * (CI-003b). Estilo §6.1: segunda persona, sin signos de exclamación, sin
 * exponer el error técnico y **diciendo qué hacer** — un mensaje que sólo
 * informa del bloqueo deja al usuario sin salida.
 *
 * `solicitud_irresoluble` no está en la tabla a propósito: no es un dato que la
 * Ejecutiva pueda aportar desde el diálogo de adjuntos, así que cae al mensaje
 * genérico de red y se reintenta.
 */
const MENSAJE_POR_MOTIVO: Partial<Record<MotivoPathIrresoluble, string>> = {
  cliente_sin_vincular:
    'Esta solicitud no tiene cliente asignado. Asígnalo en el detalle y vuelve a subir el documento.',
  unidad_no_especificada:
    'Esta solicitud tiene más de una unidad. Indica a qué unidad pertenece el documento antes de subirlo.',
  unidad_no_pertenece:
    'La unidad indicada ya no pertenece a esta solicitud. Vuelve a abrir el detalle y repite la subida.',
}

/**
 * Fase Adjuntos 1 (D-11 a D-14, 10-jul-2026): reescritura completa de
 * formData/Blob a JSON+base64. `solicitud_id` es OBLIGATORIO (D-12, Opción C
 * — la solicitud ya existe cuando se llama este endpoint, sin excepción; ver
 * docs/aprendizajes.md E-023 SUPERSEDED). El cliente calcula `hash_md5` antes
 * de enviar (idempotencia D-14.4, resuelta en el escenario Make).
 */
const uploadSchema = z.object({
  solicitud_id: z.string().min(1, 'Falta el identificador de la solicitud.'),
  codigo_ext: z.string().min(1, 'Falta el código de la solicitud.'),
  // Código de D_TipoDocumento (ej. "permiso_edificacion") cuando el archivo viene
  // del checklist de documentos requeridos; ausente/vacío para adjuntos sueltos.
  tipo_documento: z.string().optional(),
  /**
   * Señales del segmento `{Unidad}` del path (§8.1). Las dos son opcionales y
   * hoy **ninguna interfaz de IF-02 las manda**: el checklist todavía no
   * captura la unidad, así que el backend la auto-deriva. Se declaran ya para
   * que la tanda del selector por fila no tenga que tocar el contrato.
   *
   * `carpeta` tiene precedencia sobre `unidad_id` y sirve para los adjuntos que
   * no pertenecen a una unidad: `comun` (documento multi-unidad), `ingreso`
   * (carga previa a declarar unidades) e `informe` (PDF de Carbone, SC09).
   */
  unidad_id: z.string().optional(),
  carpeta: z.enum(['comun', 'ingreso', 'informe']).optional(),
  nombre_archivo: z.string().min(1, 'Falta el nombre del archivo.'),
  mime_type: z.string().min(1, 'Falta el tipo de archivo.'),
  tamanio_kb: z.number().positive('Tamaño de archivo inválido.'),
  hash_md5: z.string().min(1, 'Falta el hash del archivo.'),
  subido_por: z.string().min(1).default('Ejecutivo'),
  contenido_base64: z.string().min(1, 'Falta el contenido del archivo.'),
})

interface MakeAdjuntoResponse {
  ok?: boolean
  /**
   * `nuevo` · `reused` · `reemplazo` — desenlace resuelto por
   * `SC-Adjuntos-Upload v1.2` (§8.6.1). El cliente no lo decide ni lo pide: no
   * hay flag de reemplazo en el payload de subida. Si Make responde sin `modo`
   * (blueprint v1.1 todavía en Make), se deriva de `reused` para no romper.
   */
  modo?: 'nuevo' | 'reused' | 'reemplazo'
  adjunto_id?: string | number
  /** Record ID del adjunto eliminado; sólo en `modo: "reemplazo"`. */
  adjunto_previo_id?: string
  url_dropbox?: string
  nombre_archivo?: string
  tamanio_kb?: number
  reused?: boolean
  error?: string
  reintentable?: boolean
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_ADJUNTOS
  const hmacSecret = process.env.MAKE_HMAC_SECRET

  if (!webhookUrl || !hmacSecret) {
    return NextResponse.json(
      { ok: false, degraded: true, error: MENSAJE_DEGRADADO },
      { status: 200 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 400 })
  }

  const parsed = uploadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
      { status: 400 }
    )
  }

  const payload = parsed.data

  /**
   * `solicitud_id` alimenta el Link `solicitud` (`fldZTVpXDRtXXPjyv`) del
   * módulo 8 de `SC-Adjuntos-Upload`, que lo envía a Airtable como
   * `["{{1.solicitud_id}}"]`. Airtable exige ahí un record ID; cualquier otra
   * cosa revienta con `[422] Value "X" is not a valid record ID`.
   *
   * El problema es *dónde* revienta: el módulo 8 corre **después** del upload a
   * Dropbox (módulo 6), así que un id inválido deja el archivo subido y sin
   * fila en `TX_Adjuntos` — un huérfano que nadie limpia. Validar aquí corta
   * antes de tocar Dropbox.
   *
   * Es el único de los 4 endpoints que hablan con Make donde el record ID llega
   * en el *body* y no en el path: `/api/solicitudes/[id]` y
   * `/api/solicitudes/[id]/asignar` ya validan con este mismo helper, y SC01
   * crea el registro en vez de enlazarlo. Por eso este era el único hueco.
   *
   * Ocurrió de verdad el 02-ago-2026 con `solicitud_id: "3"`, el id del mock
   * `SOLICITUDES` que renderizaba la página `/` (ver `app/page.tsx`).
   */
  if (!isValidRecordId(payload.solicitud_id)) {
    console.error(
      '[POST /api/adjuntos/upload] solicitud_id no es un record ID de Airtable',
      { solicitud_id: payload.solicitud_id, codigo_ext: payload.codigo_ext }
    )
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
      { status: 400 }
    )
  }

  if (payload.tamanio_kb > MAX_TAMANIO_KB) {
    return NextResponse.json(
      { ok: false, error: MENSAJE_ARCHIVO_GRANDE, reintentable: false },
      { status: 413 }
    )
  }

  if (payload.unidad_id && !isValidRecordId(payload.unidad_id)) {
    console.error('[POST /api/adjuntos/upload] unidad_id no es un record ID de Airtable', {
      unidad_id: payload.unidad_id,
      codigo_ext: payload.codigo_ext,
    })
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: false },
      { status: 400 }
    )
  }

  /**
   * Composición del path Dropbox de spec v1.9.6 §8.1 — cierre de **CI-003**.
   *
   * Hasta este commit el path lo armaba el mapper del módulo Dropbox de
   * `SC-Adjuntos-Upload` (`/VProperty/Tasaciones/{{1.codigo_ext}}`). Ahora lo
   * compone Next.js y viaja en el payload: Make es transportista puro (RT-03) y
   * la regla vive en un único lugar testeable (`lib/dropbox-path.ts`).
   *
   * Se corta **antes** de tocar Dropbox y no se cae al path viejo: el corte es
   * limpio (sin coexistencia), así que un contexto irresoluble tiene que fallar
   * la subida y no producir un archivo fuera de la estructura normativa.
   *
   * Dos desenlaces distintos (CI-003b): si falta una señal que alguien puede
   * aportar —cliente sin vincular, unidad sin especificar— se responde **422**
   * con `code`, para que la interfaz diga qué falta y no ofrezca reintentar lo
   * mismo. Cualquier otro fallo es infraestructura: 502 reintentable. En los dos
   * casos el usuario ve un literal humano de §6.1, nunca el error técnico.
   *
   * Las solicitudes anteriores al 06-ago-2026 conservan sus adjuntos donde
   * están: no hay migración, quedan *grandfathered* por la cláusula de corte de
   * RF-51 §8.3. Lo que sí cambia es que un adjunto **nuevo** sobre una de esas
   * solicitudes va ya al árbol nuevo, y por eso una misma solicitud vieja puede
   * terminar con archivos en las dos estructuras.
   */
  let dropboxPath: string
  try {
    const contexto = await resolverContextoSolicitud(payload.solicitud_id, payload.codigo_ext)
    const caso = await resolverCasoPath({
      codigoSolicitud: contexto.codigoSolicitud,
      unidadId: payload.unidad_id,
      carpeta: payload.carpeta,
    })
    dropboxPath = componerCarpetaDropbox({ ...contexto, caso })
  } catch (err) {
    if (err instanceof ErrorPathIrresoluble) {
      const mensaje = MENSAJE_POR_MOTIVO[err.code]
      console.error('[POST /api/adjuntos/upload] falta un dato para componer el path', {
        code: err.code,
        detalle: err.message,
        codigo_ext: payload.codigo_ext,
      })
      if (mensaje) {
        return NextResponse.json(
          { ok: false, code: err.code, error: mensaje, reintentable: false },
          { status: 422 }
        )
      }
    } else {
      console.error('[POST /api/adjuntos/upload] no se pudo componer el path Dropbox', err)
    }
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status: 502 }
    )
  }

  /**
   * `dropbox_path` es la **carpeta destino**, sin el nombre del archivo:
   * `dropbox:uploadLargeFile` recibe `path` y `filename` por separado y los
   * concatena él. Mandarle el path completo haría que Dropbox creara una
   * carpeta con el nombre del archivo dentro.
   */
  const payloadMake = {
    solicitud_id: payload.solicitud_id,
    codigo_ext: payload.codigo_ext,
    tipo_documento: payload.tipo_documento,
    nombre_archivo: payload.nombre_archivo,
    mime_type: payload.mime_type,
    tamanio_kb: payload.tamanio_kb,
    hash_md5: payload.hash_md5,
    subido_por: payload.subido_por,
    contenido_base64: payload.contenido_base64,
    dropbox_path: dropboxPath,
  }

  let makeRes: Response
  try {
    makeRes = await postToMake(webhookUrl, payloadMake, {
      escenario: 'ADJUNTOS_UPLOAD',
      solicitudId: payload.codigo_ext,
      timeoutMs: 45000,
    })
  } catch (err) {
    console.error('[POST /api/adjuntos/upload] error de red/timeout hacia Make', err)
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status: 502 }
    )
  }

  if (!makeRes.ok) {
    const responseBody = await makeRes.text().catch(() => '<sin cuerpo>')
    console.error('[POST /api/adjuntos/upload] Make respondió con error', {
      status: makeRes.status,
      body: responseBody,
    })
    return NextResponse.json(
      { ok: false, error: MENSAJE_ERROR_RED, reintentable: true },
      { status: 502 }
    )
  }

  const data = (await makeRes.json().catch(() => ({}))) as MakeAdjuntoResponse

  if (!data.ok || !data.adjunto_id) {
    console.error('[POST /api/adjuntos/upload] Make respondió 200 sin adjunto_id', data)
    return NextResponse.json(
      { ok: false, error: data.error ?? MENSAJE_ERROR_RED, reintentable: data.reintentable ?? true },
      { status: 502 }
    )
  }

  const modo = data.modo ?? (data.reused ? 'reused' : 'nuevo')

  if (modo === 'reemplazo') {
    // El evento `adjunto_reemplazado` lo escribe Make en A_Eventos (§8.6.5);
    // aquí sólo queda la traza de servidor para correlacionar con Dropbox.
    console.info('[ADJUNTOS-UPLOAD] reemplazo por unicidad de tipo (RN-60)', {
      codigo_ext: payload.codigo_ext,
      tipo_documento: payload.tipo_documento,
      adjunto_previo_id: data.adjunto_previo_id,
    })
  }

  return NextResponse.json(
    {
      ok: true,
      modo,
      adjunto_id: data.adjunto_id,
      adjunto_previo_id: data.adjunto_previo_id,
      url_dropbox: data.url_dropbox ?? '',
      nombre_archivo: data.nombre_archivo ?? payload.nombre_archivo,
      tamanio_kb: data.tamanio_kb ?? payload.tamanio_kb,
      reused: data.reused ?? modo === 'reused',
    },
    { status: 200 }
  )
}
