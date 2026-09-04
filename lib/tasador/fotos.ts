"use client"

/**
 * Persistencia de las fotos de la visita — el camino punta a punta de §2.6.
 *
 * Plan IF-03 §6.1 · RF-TAS-14. Creado en **P5-TAS (B3)**, tras el cierre de
 * **CI-052**.
 *
 * ## La cadena, y quién es dueño de qué
 *
 * ```
 *   File  ──▶  POST /api/adjuntos/upload  ──▶  Make (SC-Adjuntos-Upload)  ──▶  Dropbox
 *                                                      │
 *                                                      └─▶ crea la fila en TX_Adjuntos
 *                                                          y devuelve adjunto_id
 *
 *   adjunto_id  ──▶  PATCH /api/tasaciones/[id]/fotos  ──▶  escribe la categoría
 * ```
 *
 * **El pipeline de adjuntos es el dueño de la fila** (opción (a) de CI-052). La
 * segunda llamada no crea nada: pinta la categoría sobre el registro que Make
 * acaba de crear. Encadenarlas al revés —que cada extremo creara su fila— era
 * el defecto que CI-052 documenta, y dejaba dos registros por foto.
 *
 * ## Dos cosas que se hacen acá y no en el componente
 *
 * **1 · `subido_por: 'Tasador'`, exacto.** `uploadUnArchivo` lo tiene por
 * defecto en `'Ejecutivo'`, y el `GET` de fotos filtra por ese literal: sin
 * esto, la foto sube, se guarda y **no vuelve nunca** a la pantalla. El Route
 * Handler lo reescribe server-side además de esto, por el riesgo de `typecast`
 * con la opción `tasador` en minúscula que ya existe en la tabla.
 *
 * **2 · Ningún destino de unidad.** No se manda `unidad_id` ni `carpeta`: el
 * backend auto-deriva `_ingreso/` sin unidades y la única unidad si hay una
 * (CI-003b). Es el mismo precedente que fijó B5 para el sheet documental
 * (`unidadesParaPath()` devuelve `[]`), y por la misma razón: Pantalla 3 no
 * tiene selector de unidad. **Con dos o más unidades el backend responde 422** y
 * el tasador ve el literal humano de esa respuesta. Comportamiento declarado,
 * no accidente.
 *
 * ## El sub-nivel `{seccion}/` no llega a Dropbox
 *
 * §6.1 pide guardar en `{Unidad}/{seccion}/`. `componerCarpetaDropbox()` no
 * tiene segmento de sección y quien compone el path es el endpoint de subida,
 * así que la foto cae en la carpeta de unidad. La sección sobrevive en
 * `TX_Adjuntos.descripcion`. Anotado en **CI-051**, misma raíz que el campo
 * `seccion` ausente.
 */

import { uploadConReintentos, type UploadResult } from "@/lib/adjuntos-uploader"
import type { FotoAdjunta } from "@/lib/tasador/tasaciones"

/** Literal §6.1 para el fallo que no sabemos explicar al usuario. */
const MSG_ERROR_RED =
  "No pudimos completar la acción. Intenta nuevamente en unos segundos."

/**
 * `subido_por` con la capitalización exacta que espera el `GET` de fotos.
 *
 * El `singleSelect` de `TX_Adjuntos` tiene hoy `Tasador` **y** `tasador`; con
 * `typecast` la minúscula se escribe sin error y la foto desaparece del listado
 * sin dejar rastro. No se escribe este literal a mano en ningún otro sitio.
 */
export const SUBIDO_POR_TASADOR = "Tasador"

/**
 * Categorías de foto que son en realidad un **documento a extraer**, no una
 * foto de registro.
 *
 * La foto del cuadro de comparables (`ofertas_comparables`) es hoy la única: al
 * subirla debe viajar como `tipo_documento` el `codigo` de `D_TipoDocumento`
 * (`foto_ofertas_comparables`, spec §8.6.1), que `SC-Adjuntos-Upload` persiste
 * en `TX_Adjuntos.clave_adjunto` (`fldaLLtzAaEn1O8IW`).
 *
 * **Sin ese código la extracción no corre.** `AT-RF09-Trigger` exige
 * `clave_adjunto` no vacío (RN-25): si llega vacío marca la foto como
 * `estado_extraccion = 'skipped'` y retorna **sin llamar al webhook de RF-09**,
 * por lo que el escenario `SC-RF09-ExtraccionClaude` no registra ninguna
 * ejecución, `TX_Comparables` no se puebla y la sección D queda en «0 de 3
 * comparables leídos del cuadro». Las demás categorías son fotos de registro y
 * no disparan extracción: para ellas el valor es `undefined` y `tipo_documento`
 * se omite, igual que antes.
 */
const TIPO_DOCUMENTO_POR_CATEGORIA: Record<string, string> = {
  ofertas_comparables: "foto_ofertas_comparables",
}

export interface DatosSolicitudFoto {
  /** Record ID de `TX_Solicitudes`. */
  solicitudId: string
  /** `codigo_ext` / `codigo_solicitud` (VP-AAAA-NNNN). */
  codigoExt: string
}

export interface ParametrosSubida extends DatosSolicitudFoto {
  file: File
  categoria: string
  /** Posición dentro de su categoría, para el orden estable del listado. */
  orden?: number
  signal?: AbortSignal
  onProgress?: (pct: number) => void
}

export type ResultadoSubida =
  | { ok: true; foto: FotoAdjunta }
  | { ok: false; mensaje: string; reintentable: boolean }

/** Respuesta de `GET /api/tasaciones/[id]/fotos`. */
interface FotoServidor {
  id: string
  categoria: string
  nombre: string
  url: string | null
  thumbnailUrl: string | null
  hashMd5: string | null
}

function falloDeSubida(resultado: UploadResult): ResultadoSubida {
  return {
    ok: false,
    mensaje: resultado.error ?? MSG_ERROR_RED,
    // `reintentable` ausente se trata como reintentable: el caso conocido de
    // fallo definitivo (413, 422 de path) siempre lo manda explícito en `false`.
    reintentable: resultado.reintentable !== false,
  }
}

/**
 * Escribe la categoría sobre un adjunto ya creado por el pipeline.
 *
 * Se exporta aparte de {@link subirFotoDeVisita} porque es también la operación
 * de **recategorizar** una foto que ya está en Dropbox, que no necesita volver a
 * subir nada.
 */
export async function categorizarFoto(
  solicitudId: string,
  adjuntoId: string,
  categoria: string,
  orden?: number,
): Promise<{ ok: boolean; mensaje?: string; reintentable?: boolean }> {
  try {
    const res = await fetch(`/api/tasaciones/${solicitudId}/fotos`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adjuntoId, categoria, orden }),
    })

    if (!res.ok) {
      const cuerpo = (await res.json().catch(() => ({}))) as { error?: string }
      console.error("[categorizarFoto] PATCH /fotos falló", {
        adjuntoId,
        status: res.status,
      })
      // CI-061: 404 de categorización es determinista (autoNumber vs recXXX) —
      // no reintentable hasta que entre el fix aditivo de adjunto_record_id.
      return {
        ok: false,
        mensaje: cuerpo.error ?? MSG_ERROR_RED,
        reintentable: res.status !== 404,
      }
    }

    return { ok: true }
  } catch (err) {
    console.error("[categorizarFoto]", err)
    return { ok: false, mensaje: MSG_ERROR_RED }
  }
}

/**
 * Sube una foto y la categoriza.
 *
 * ## El caso raro que importa: la subida sale bien y la categorización no
 *
 * La foto queda en Dropbox y su fila en `TX_Adjuntos`, pero sin categoría. **No
 * se intenta compensar borrándola**: el archivo ya está a salvo, que es lo caro
 * de recuperar en terreno, y un borrado automático ante un fallo de red destruye
 * justo lo que el tasador acaba de tomar. Se devuelve el fallo como
 * reintentable, y reintentar es barato: la subida se deduplica por `hash_md5`
 * (no vuelve a viajar el binario) y el `PATCH` es idempotente.
 *
 * **Excepción CI-061:** un 404 de categorización no es reintentable. Es
 * determinista (el id no resuelve a una fila de esta solicitud) y reintentarlo
 * sólo cuelga la cola offline sobre algo que nunca va a cambiar. Ese caso viaja
 * como `reintentable: false` desde {@link categorizarFoto}.
 */
export async function subirFotoDeVisita(
  p: ParametrosSubida,
): Promise<ResultadoSubida> {
  const subida = await uploadConReintentos({
    file: p.file,
    solicitud_id: p.solicitudId,
    codigo_ext: p.codigoExt,
    // Declara el tipo de documento sólo para la foto del cuadro de comparables,
    // que es lo que dispara RF-09 vía `clave_adjunto`. Para el resto de las
    // categorías es `undefined` y el campo se omite (ver
    // TIPO_DOCUMENTO_POR_CATEGORIA).
    tipo_documento: TIPO_DOCUMENTO_POR_CATEGORIA[p.categoria],
    subido_por: SUBIDO_POR_TASADOR,
    signal: p.signal,
    onProgress: p.onProgress,
  })

  if (!subida.ok || !subida.adjunto_id) return falloDeSubida(subida)

  const adjuntoId = String(subida.adjunto_id)

  const categorizada = await categorizarFoto(
    p.solicitudId,
    adjuntoId,
    p.categoria,
    p.orden,
  )
  if (!categorizada.ok) {
    return {
      ok: false,
      mensaje: categorizada.mensaje ?? MSG_ERROR_RED,
      // CI-061: el 404 viaja como reintentable:false desde categorizarFoto; el
      // resto (red, 5xx) conserva la política reintentable por defecto.
      reintentable: categorizada.reintentable !== false,
    }
  }

  return {
    ok: true,
    foto: {
      id: adjuntoId,
      categoria: p.categoria,
      nombre: subida.nombre_archivo ?? p.file.name,
      url: subida.url_dropbox ?? null,
      thumbnailUrl: null,
      // El hash lo calculó el uploader y no lo devuelve. Llega en la
      // rehidratación desde `GET /fotos`, que es lo que corre tras cada subida.
      hashMd5: null,
    },
  }
}

/**
 * Lee las fotos ya persistidas de una tasación.
 *
 * Es la **fuente de verdad** del listado: el estado local es una proyección de
 * esto, no al revés. Por eso se vuelve a llamar tras cada subida y cada
 * borrado, en vez de mantener dos verdades sincronizadas a mano.
 */
export async function leerFotosDeVisita(solicitudId: string): Promise<FotoAdjunta[]> {
  const res = await fetch(`/api/tasaciones/${solicitudId}/fotos`, {
    credentials: "same-origin",
  })
  if (!res.ok) {
    throw new Error(`GET /api/tasaciones/${solicitudId}/fotos → ${res.status}`)
  }

  const cuerpo = (await res.json()) as { data?: { fotos?: FotoServidor[] } }
  return (cuerpo.data?.fotos ?? []).map((f) => ({
    id: f.id,
    categoria: f.categoria,
    nombre: f.nombre,
    url: f.url,
    thumbnailUrl: f.thumbnailUrl,
    hashMd5: f.hashMd5,
  }))
}

/**
 * Borra una foto de verdad — Dropbox y `TX_Adjuntos` — vía
 * `DELETE /api/adjuntos/[id]` → `SC-Adjuntos-Delete` (RF-52 · §8.6.3).
 *
 * Se reutiliza el endpoint de IF-02 tal cual (R7): el borrado de un adjunto no
 * cambia porque quien lo pida sea el tasador.
 *
 * `hashMd5` es la salvaguarda de integridad de §8.6.3 y **tiene que venir de la
 * lectura de Airtable**, no de un valor que el cliente arrastre desde la subida:
 * es precisamente la divergencia entre ambos lo que detecta. Una foto recién
 * subida todavía no lo tiene, y por eso el llamador rehidrata antes de ofrecer
 * el borrado.
 */
export async function eliminarFotoDeVisita(
  p: DatosSolicitudFoto & { adjuntoId: string; hashMd5: string | null },
): Promise<boolean> {
  // Sin hash no se intenta: el endpoint lo exige (`min(1)`) y respondería 400.
  // Cortar acá evita una llamada que ya sabemos perdida y, sobre todo, deja
  // claro que la salvaguarda no es opcional.
  if (!p.hashMd5) {
    console.error("[eliminarFotoDeVisita] falta hash_md5, no se intenta borrar", {
      adjuntoId: p.adjuntoId,
    })
    return false
  }

  try {
    const res = await fetch(`/api/adjuntos/${p.adjuntoId}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        solicitud_id: p.solicitudId,
        codigo_ext: p.codigoExt,
        hash_md5: p.hashMd5,
        subido_por: SUBIDO_POR_TASADOR,
      }),
    })

    const cuerpo = (await res.json().catch(() => ({}))) as { ok?: boolean }
    if (!res.ok || !cuerpo.ok) {
      console.error("[eliminarFotoDeVisita]", {
        adjuntoId: p.adjuntoId,
        status: res.status,
      })
      return false
    }
    return true
  } catch (err) {
    console.error("[eliminarFotoDeVisita]", err)
    return false
  }
}
