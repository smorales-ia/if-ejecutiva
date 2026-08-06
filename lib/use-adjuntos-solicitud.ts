"use client"

import * as React from "react"

import type { Adjunto } from "@/lib/adjuntos"

/**
 * Hook cliente para los adjuntos ya persistidos de una solicitud
 * (`GET /api/solicitudes/[id]/adjuntos` → `TX_Adjuntos`).
 *
 * ## Por qué no espeja `use-catalogos.ts`
 *
 * `useCatalogos` y `useTiposDocumento` cachean una promesa a nivel de módulo
 * porque sirven un catálogo global e inmutable durante la sesión. Aquí el dato
 * es **por solicitud** y **muta**: cada subida agrega una fila en
 * `TX_Adjuntos`. Una promesa compartida devolvería la lista vieja al reabrir
 * el sheet. Por eso: fetch por `solicitudId` y `recargar()` explícito.
 *
 * ## Por qué `activo`
 *
 * El sheet vive montado dentro del detalle aunque esté cerrado. Sin este flag,
 * seleccionar una solicitud en la lista dispararía la lectura de adjuntos de
 * cada una, aunque la Ejecutiva nunca abra el panel de documentos.
 *
 * ## Contrato de fallo
 *
 * Si la lectura falla, `adjuntos` queda vacío y `error` en `true`. El
 * consumidor debe distinguirlo de "esta solicitud no tiene adjuntos": son
 * estados visualmente idénticos y operativamente opuestos.
 */

export interface EstadoAdjuntos {
  adjuntos: Adjunto[]
  cargando: boolean
  error: boolean
  /**
   * `true` cuando el fallo fue de sesión, no de datos.
   *
   * Clerk no responde 401 a una petición sin sesión: `auth.protect()`
   * **reescribe a un 404 de HTML** (`x-clerk-auth-reason: protect-rewrite`,
   * `x-clerk-auth-status: signed-out`). Ese 404 es indistinguible de "la ruta
   * no existe" o de "la solicitud no existe", y costó tres rondas de
   * diagnóstico el 02-ago-2026: se revisó el regex de `isValidRecordId`, la
   * existencia del archivo de ruta y su registro en el manifiesto, cuando el
   * handler simplemente nunca se ejecutaba.
   *
   * Se distingue por el `content-type`: los errores propios de la app viajan
   * como JSON; el de Clerk, como `text/html`.
   */
  sesionExpirada: boolean
  /** Vuelve a leer desde Airtable. Se llama tras cada subida confirmada. */
  recargar: () => void
  /**
   * Borrado real del adjunto (RF-52 · §8.6.3): `DELETE /api/adjuntos/[id]` →
   * `SC-Adjuntos-Delete` → Dropbox + `TX_Adjuntos`.
   *
   * Devuelve `true` sólo si la relectura posterior confirma que la fila
   * desapareció. §8.6.4 lo exige: «En el desmarcado, el tipo sólo se marca como
   * vacío si la relectura confirma la desaparición». No se confía en el estado
   * local — si el borrado fue parcial, el checklist debe reflejar la verdad de
   * la base y no el optimismo del cliente.
   */
  eliminar: (adjuntoRecordId: string, codigoExt: string) => Promise<boolean>
  /** Record ID del adjunto que se está borrando ahora mismo, o `null`. */
  eliminandoId: string | null
}

/** `true` si la respuesta de error no es JSON — es decir, no la emitió la app. */
function esRespuestaDeClerk(res: Response): boolean {
  return !(res.headers.get('content-type') ?? '').includes('application/json')
}

export function useAdjuntosSolicitud(
  solicitudId: string,
  activo: boolean,
): EstadoAdjuntos {
  const [adjuntos, setAdjuntos] = React.useState<Adjunto[]>([])
  // Arranca en `true` si el sheet ya está abierto: con `false`, entre el primer
  // render y el efecto hay un frame con `adjuntos = []` y `cargando = false`,
  // que el sheet pinta como "checklist sin nada marcado" — visualmente idéntico
  // a "esta solicitud no tiene documentos". En la segunda apertura, con el
  // catálogo ya cacheado, ese frame es el único estado visible.
  const [cargando, setCargando] = React.useState(activo)
  const [error, setError] = React.useState(false)
  const [sesionExpirada, setSesionExpirada] = React.useState(false)
  const [version, setVersion] = React.useState(0)
  const [eliminandoId, setEliminandoId] = React.useState<string | null>(null)

  const recargar = React.useCallback(() => setVersion((v) => v + 1), [])

  // Espejo de `adjuntos` en un ref para poder releer dentro de `eliminar` sin
  // que el callback dependa del array (y se recree en cada render).
  const adjuntosRef = React.useRef<Adjunto[]>(adjuntos)
  adjuntosRef.current = adjuntos

  const eliminar = React.useCallback(
    async (adjuntoRecordId: string, codigoExt: string): Promise<boolean> => {
      const previo = adjuntosRef.current.find((a) => a.id === adjuntoRecordId)
      setEliminandoId(adjuntoRecordId)
      try {
        const res = await fetch(`/api/adjuntos/${adjuntoRecordId}`, {
          method: "DELETE",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            solicitud_id: solicitudId,
            codigo_ext: codigoExt,
            // La salvaguarda de §8.6.3 sólo sirve si el hash sale de la lectura
            // de Airtable, no de un valor que el cliente arrastre desde la
            // subida: es precisamente la divergencia entre ambos lo que detecta.
            hash_md5: previo?.hashMd5 ?? "",
          }),
        })

        const body = (await res.json().catch(() => ({}))) as { ok?: boolean }
        if (!res.ok || !body.ok) {
          console.error("[useAdjuntosSolicitud.eliminar]", {
            adjuntoRecordId,
            status: res.status,
          })
          return false
        }

        // Relectura obligatoria: el retorno describe la base, no la respuesta.
        const relectura = await fetch(`/api/solicitudes/${solicitudId}/adjuntos`, {
          credentials: "same-origin",
        })
        if (!relectura.ok) {
          setVersion((v) => v + 1)
          return false
        }
        const data = ((await relectura.json()) as { data?: Adjunto[] }).data ?? []
        setAdjuntos(data)
        setError(false)
        setSesionExpirada(false)
        return !data.some((a) => a.id === adjuntoRecordId)
      } catch (err) {
        console.error("[useAdjuntosSolicitud.eliminar]", err)
        return false
      } finally {
        // Regla D: el reset va en `finally`, nunca sólo en el `catch`. Un throw
        // síncrono o un fallo de parseo dejaría la fila muerta el resto de la
        // sesión.
        setEliminandoId(null)
      }
    },
    [solicitudId],
  )

  React.useEffect(() => {
    if (!activo || !solicitudId) return

    let vivo = true
    setCargando(true)

    fetch(`/api/solicitudes/${solicitudId}/adjuntos`, {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) {
          const deClerk = esRespuestaDeClerk(res)
          if (vivo) setSesionExpirada(deClerk)
          throw new Error(
            `GET /api/solicitudes/${solicitudId}/adjuntos → ${res.status}` +
              (deClerk
                ? ' · respuesta de Clerk (sin sesión), el Route Handler no llegó a ejecutarse'
                : ''),
          )
        }
        const body = (await res.json()) as { data?: Adjunto[] }
        return body.data ?? []
      })
      .then((data) => {
        if (!vivo) return
        setAdjuntos(data)
        setError(false)
        setSesionExpirada(false)
      })
      .catch((err) => {
        console.error("[useAdjuntosSolicitud]", err)
        if (!vivo) return
        setAdjuntos([])
        setError(true)
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })

    return () => {
      vivo = false
    }
  }, [solicitudId, activo, version])

  return {
    adjuntos,
    cargando,
    error,
    sesionExpirada,
    recargar,
    eliminar,
    eliminandoId,
  }
}
