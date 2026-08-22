/**
 * `GET · PATCH /api/tasaciones/[id]/fotos` — organizador de fotos de la visita.
 *
 * RF-TAS-14 · §2.6. Tanda P2-TAS · plan §3.1. **Reescrito en P5-TAS (batch B3)
 * para cerrar CI-052.**
 *
 * ## El binario no pasa por acá, y la fila tampoco se crea acá
 *
 * Esta ruta gestiona **metadatos** en `TX_Adjuntos`. El archivo sube por el
 * pipeline existente (`app/api/adjuntos/upload/route.ts` → Make → Dropbox), que
 * IF-03 reutiliza tal cual (R7).
 *
 * Hasta P5-TAS esta ruta exponía un `POST` que hacía su propio `createRecord`
 * sobre `TX_Adjuntos`. **Eso duplicaba cada foto** (CI-052): el módulo 8 de
 * `SC-Adjuntos-Upload` ya crea la fila y devuelve su `adjunto_id`, y el
 * endpoint de subida lo trata como parte obligatoria de su contrato —responde
 * 502 si Make contesta 200 sin él—. Encadenar los dos endpoints dejaba dos
 * registros por foto: uno con el archivo y sin categoría, otro con la categoría
 * y la URL copiada.
 *
 * **Resolución (opción (a) de CI-052, aprobada el 22-ago-2026): el pipeline es
 * dueño de la fila.** Acá se **actualiza** el registro que Make ya creó,
 * escribiendo la categoría sobre el `adjunto_id` devuelto. El pipeline de IF-02
 * no se toca y la idempotencia por `hash_md5` que `SC-Adjuntos-Upload` ya
 * resuelve se conserva intacta: una subida deduplicada devuelve el record ID
 * existente y este PATCH simplemente lo recategoriza.
 *
 * ## Por qué `PATCH` y no `POST`
 *
 * El verbo dejó de ser una creación, y mantenerlo diciendo lo contrario sólo
 * invita a reintroducir el `createRecord`. `PATCH` cubre además las **dos**
 * operaciones con un solo camino: la categorización inicial tras la subida y la
 * **re-categorización posterior**, que es la más frecuente —el organizador
 * reordena y recategoriza fotos ya subidas muchas más veces de las que sube
 * archivos nuevos, y esas operaciones no deben arrastrar un multipart—.
 *
 * ## A-16 · los mínimos no se resuelven acá
 *
 * La ruta devuelve el **conteo por categoría**. Cuántas exige cada una lo decide
 * `lib/tasador/minimos-fotos.ts` en el cliente (punto único de A-16, P5-TAS).
 * El server no conoce los mínimos y por eso no hay ningún literal numérico en
 * este archivo.
 *
 * ## ⚠ `TX_Adjuntos` no tiene campo `seccion` — CI-051
 *
 * §2.6 afirma que *"el campo `TX_Adjuntos.seccion` se sigue escribiendo aunque
 * la sección ya aparezca en el path"*. **Ese campo no existe** en la tabla
 * (verificado vía Meta API el 17-ago-2026 y re-verificado vía MCP el
 * 22-ago-2026: la petición de ese nombre responde 422). La categoría se guarda
 * en `descripcion` —texto libre, que es lo que admite las categorías
 * personalizadas de §2.6— y `tipo_adjunto` lleva un valor cerrado.
 *
 * **Ni el sub-nivel `{seccion}/` del path llega hoy a Dropbox** (anotado en
 * CI-051 durante P5-TAS): `componerCarpetaDropbox()` no tiene ese segmento y
 * quien compone el path es `app/api/adjuntos/upload/route.ts`. La foto cae en la
 * carpeta de unidad como cualquier otro adjunto. La sección sobrevive sólo en
 * `descripcion`, que es justo el escenario que §2.6 quería evitar.
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getRecord, isValidRecordId, listRecords, updateRecord } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { auditar } from '@/lib/tasador/auditoria'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'
import { parsearCuerpo } from '@/lib/tasador/validators'

export const dynamic = 'force-dynamic'

/**
 * Valor de `TX_Adjuntos.subido_por` que marca una foto como del tasador.
 *
 * **La capitalización no es cosmética.** El `GET` de abajo filtra por este
 * literal exacto, y el `singleSelect` de Airtable tiene hoy **dos** opciones
 * que sólo difieren en la mayúscula —`Tasador` y `tasador`, esta última ya
 * presente en filas reales—. Con `typecast: true`, escribir la minúscula no da
 * error: crea (o reutiliza) la otra opción y la foto **desaparece del `GET`
 * para siempre**, sin señal de que algo salió mal.
 *
 * Por eso el PATCH lo reescribe server-side en vez de confiar en el
 * `subido_por` que el cliente mandó al endpoint de subida, cuyo valor por
 * defecto es además `'Ejecutivo'` (`lib/adjuntos-uploader.ts`).
 */
const SUBIDO_POR_TASADOR = 'Tasador'

/**
 * Valor de `tipo_adjunto` para toda foto del organizador.
 *
 * El dominio del `singleSelect` es cerrado y no contiene las ocho categorías de
 * §2.6 ni puede contener las personalizadas, así que la categoría real va en
 * `descripcion`. Escribirla en `tipo_adjunto` la crearía como opción nueva por
 * `typecast` y ensuciaría el dominio con una entrada por cada nombre que un
 * tasador invente en terreno.
 *
 * El prefijo `foto` importa: `GET /api/tasaciones/[id]/informe` cuenta el
 * registro fotográfico filtrando `tipo_adjunto` por `startsWith('foto')`.
 */
const TIPO_ADJUNTO_FOTO = 'foto_interior'

/**
 * Categorización de una foto **ya subida** por el pipeline de adjuntos.
 *
 * `categoria` es libre a propósito: el catálogo tiene ocho entradas fijas
 * (`CATEGORIAS_FOTO`) **más las personalizadas que el tasador crea en terreno**
 * (§2.6), así que un `enum` cerrado rechazaría precisamente lo que el requisito
 * permite.
 *
 * `adjuntoId` es el `adjunto_id` que devolvió `POST /api/adjuntos/upload`. No
 * hay forma de crear una foto por esta ruta: sin fila previa no hay nada que
 * categorizar.
 */
const categorizarSchema = z.object({
  adjuntoId: z.string().trim().min(1),
  categoria: z.string().trim().min(1),
  orden: z.number().int().nonnegative().optional(),
  thumbnailUrl: z.string().url().optional(),
})

interface AdjuntoFields {
  nombre_archivo?: string
  tipo_adjunto?: string
  descripcion?: string
  url_dropbox?: string
  thumbnail_url?: string
  tamanio_kb?: number
  orden?: number
  subido_por?: string
  subido_en?: string
  hash_md5?: string
  solicitud?: string[]
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const codigo = String(guard.fields.codigo_solicitud ?? '')

  try {
    if (!codigo) return ok({ id, fotos: [], porCategoria: {}, total: 0 })

    const registros = await listRecords<AdjuntoFields>(TABLE_IDS.adjuntos, {
      filterByFormula: `AND({solicitud}="${codigo.replace(/"/g, '\\"')}",{subido_por}="${SUBIDO_POR_TASADOR}")`,
      'sort[0][field]': 'orden',
      'sort[0][direction]': 'asc',
    })

    const fotos = registros.map((r) => ({
      id: r.id,
      // La categoría real vive en `descripcion` cuando es personalizada; el
      // vocabulario cerrado de `tipo_adjunto` no admite nombres libres.
      categoria: r.fields.descripcion || r.fields.tipo_adjunto || 'otro',
      nombre: r.fields.nombre_archivo ?? '',
      url: r.fields.url_dropbox ?? null,
      thumbnailUrl: r.fields.thumbnail_url ?? null,
      orden: r.fields.orden ?? null,
      subidoEn: r.fields.subido_en ?? null,
      /**
       * Se expone porque es la **salvaguarda de integridad del borrado**
       * (§8.6.3): `DELETE /api/adjuntos/[id]` la reenvía a
       * `SC-Adjuntos-Delete`, que se niega a destruir nada si el registro
       * apuntado por el record ID ya no tiene ese hash. Sin él la pantalla
       * puede listar fotos pero no borrarlas.
       */
      hashMd5: r.fields.hash_md5 ?? null,
    }))

    const porCategoria = fotos.reduce<Record<string, number>>((acc, f) => {
      acc[f.categoria] = (acc[f.categoria] ?? 0) + 1
      return acc
    }, {})

    return ok({ id, fotos, porCategoria, total: fotos.length })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/fotos', err)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const cuerpo = await parsearCuerpo(request, categorizarSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)

  const d = cuerpo.datos

  // Un id con forma inválida no llega a Airtable: mismo criterio que el guard
  // de solicitudes, y evita gastar la lectura.
  if (!isValidRecordId(d.adjuntoId)) {
    return error(MENSAJES.adjuntoNoDisponible, 404)
  }

  try {
    /**
     * **Guard de pertenencia.** `autorizarSolicitud` prueba que la solicitud es
     * del usuario, no que este adjunto sea de esta solicitud. Sin esta segunda
     * comprobación, cualquiera con una tasación propia podría recategorizar el
     * adjunto de otra con sólo conocer su record ID.
     *
     * Se compara contra el Link `solicitud`, que es un `multipleRecordLinks`:
     * la comprobación es de pertenencia al array, no de igualdad.
     *
     * El desenlace es el mismo para «no existe» y «no es de esta solicitud»,
     * por la misma razón que en `auth-guard.ts`: distinguirlos le confirmaría a
     * un tercero que el adjunto existe.
     */
    const adjunto = await getRecord<AdjuntoFields>(TABLE_IDS.adjuntos, d.adjuntoId)
    if (!adjunto || !(adjunto.fields.solicitud ?? []).includes(id)) {
      return error(MENSAJES.adjuntoNoDisponible, 404)
    }

    const categoriaPrevia = adjunto.fields.descripcion ?? ''

    /**
     * Sólo se escriben los campos de **categorización**. `nombre_archivo`,
     * `url_dropbox`, `tamanio_kb`, `mime_type`, `hash_md5`, `subido_en` y el
     * propio Link `solicitud` son del módulo 8 de `SC-Adjuntos-Upload`: pisarlos
     * desde acá reintroduciría por la puerta de atrás la duplicación de datos
     * que CI-052 vino a cerrar.
     *
     * Las claves opcionales se **omiten** en vez de mandarse vacías (RO-18.3):
     * un `""` sobre un campo `number` o `url` con `typecast` no es lo mismo que
     * no tocarlo.
     */
    await updateRecord<AdjuntoFields>(TABLE_IDS.adjuntos, d.adjuntoId, {
      tipo_adjunto: TIPO_ADJUNTO_FOTO,
      descripcion: d.categoria,
      subido_por: SUBIDO_POR_TASADOR,
      ...(d.orden !== undefined ? { orden: d.orden } : {}),
      ...(d.thumbnailUrl ? { thumbnail_url: d.thumbnailUrl } : {}),
    })

    const nombre = adjunto.fields.nombre_archivo ?? ''

    await auditar([
      {
        registroId: id,
        registroNombre: String(guard.fields.codigo_solicitud ?? ''),
        campo: 'fotos',
        valorAnterior: categoriaPrevia,
        valorNuevo: `${d.adjuntoId} · ${d.categoria} · ${nombre}`,
        razon: 'Categorización de foto de la visita desde IF-03 (RF-TAS-14)',
      },
    ])

    return ok({ id: d.adjuntoId, categoria: d.categoria, nombre })
  } catch (err) {
    return desdeExcepcion('PATCH /api/tasaciones/[id]/fotos', err)
  }
}
