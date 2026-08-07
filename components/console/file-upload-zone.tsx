"use client"

import * as React from "react"
import {
  AlertCircle,
  FileText,
  ImageIcon,
  RotateCcw,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SelectorDestinoUnidad } from "@/components/console/selector-destino-unidad"
import {
  destinoAPayload,
  destinoInicial,
  MSG_SIN_DESTINO,
  requiereSeleccion,
  type DestinoUnidad,
} from "@/lib/adjuntos-destino"
import { uploadConReintentos } from "@/lib/adjuntos-uploader"
import type { Unidad } from "@/lib/console-data"
import { cn } from "@/lib/utils"

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"]
const EXT_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"]
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

/** Literal §6.1 para el fallo que no sabemos explicar al usuario. */
const MSG_ERROR_RED =
  "No pudimos completar la acción. Intenta nuevamente en unos segundos."

export type UploadStatus = "uploading" | "success" | "error"

export interface UploadItem {
  id: string
  file: File
  name: string
  size: number
  status: UploadStatus
  progress: number
  errorMsg?: string
  esImagen: boolean
  /** Permite cancelar la subida en vuelo desde el botón X. */
  abort?: AbortController
}

export interface ArchivoSubido {
  id: string
  nombre: string
  detalle: string
  /** Record ID de `TX_Adjuntos`. Sólo en modo inmediato. */
  adjuntoId?: string
  /** `path_display` de Dropbox. Sólo en modo inmediato. */
  urlDropbox?: string
  /** El `File` original. Lo necesita la Opción C para subir tras crear el alta. */
  file?: File
}

interface FileUploadZoneProps {
  variant?: "default" | "compact"
  /** Permite seleccionar varios archivos (ignorado en compact, que es de 1). */
  multiple?: boolean
  /** Se invoca cuando uno o más archivos terminan de subir con éxito. */
  onUploaded?: (archivos: ArchivoSubido[]) => void
  className?: string
  usuarioActual?: string
  /**
   * Record ID de la solicitud. Junto con `codigoExt` activa el **modo
   * inmediato**: el archivo sube de verdad a Dropbox vía
   * `/api/adjuntos/upload` → Make.
   */
  solicitudId?: string
  codigoExt?: string
  /**
   * `codigo` de `D_TipoDocumento` declarado para estos archivos (RN-25: el
   * tipo se declara, no se infiere). Vacío = adjunto suelto.
   */
  tipoDocumento?: string
  /**
   * Unidades declaradas de la solicitud. Resuelven el segmento `{Unidad}` del
   * path Dropbox (§8.1). Con dos o más aparece el selector de destino; con cero
   * o una no se renderiza nada y el comportamiento es el de siempre.
   *
   * Sólo aplica en modo inmediato: en modo diferido no hay subida que dirigir.
   */
  unidades?: Unidad[]
  disabled?: boolean
}

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function esImagenArchivo(name: string, type: string): boolean {
  if (type.startsWith("image/")) return true
  return /\.(jpe?g|png)$/i.test(name)
}

function validar(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
  const tipoOk =
    TIPOS_PERMITIDOS.includes(file.type) || EXT_PERMITIDAS.includes(ext)
  if (!tipoOk) return "Formato no permitido"
  if (file.size > MAX_BYTES) return "Archivo excede 10MB"
  return null
}

/**
 * Zona de carga de archivos con dos modos.
 *
 * ## Modo inmediato (`solicitudId` + `codigoExt`)
 *
 * Sube de verdad: `uploadConReintentos()` → `POST /api/adjuntos/upload` →
 * Make (`SC-Adjuntos-Upload`) → Dropbox → fila en `TX_Adjuntos`. El progreso
 * es real (`XMLHttpRequest.upload.onprogress`; `fetch` no lo expone), con 3
 * reintentos y backoff 0s/2s/5s heredados de D-14.2, e idempotencia por
 * `hash_md5` resuelta en el escenario Make (D-14.4).
 *
 * ## Modo diferido (sin `solicitudId`)
 *
 * Captura local sin red. Existe porque `NewRequestSheet` monta esta zona
 * **antes** de que la solicitud exista, y D-12 (Opción C) dejó `solicitud_id`
 * como obligatorio en el Route Handler: no hay a qué asociar el archivo
 * todavía. El `File` viaja en `ArchivoSubido.file` para que el padre lo suba
 * después de crear el alta.
 *
 * Hasta el 02-ago-2026 este componente simulaba la subida con `setInterval` y
 * emitía un toast verde sin haber escrito nada — el patrón que E-082 prohíbe.
 *
 * ## Destino Dropbox
 *
 * A diferencia del checklist, los adjuntos libres no tienen filas fijas a las
 * que colgar un override: los archivos entran y salen de la lista en cada
 * tanda. Por eso hay **un solo selector** y se aplica a todo lo que se suba
 * mientras esté puesto. Cambiarlo no reubica lo ya subido —el path es un
 * snapshot inmutable (§8, CI-004)—, sólo dirige lo siguiente.
 */
export function FileUploadZone({
  variant = "default",
  multiple = true,
  onUploaded,
  className,
  usuarioActual = "Ejecutivo",
  solicitudId,
  codigoExt,
  tipoDocumento,
  unidades = [],
  disabled = false,
}: FileUploadZoneProps) {
  const compact = variant === "compact"
  const permiteMultiple = compact ? false : multiple
  const modoInmediato = Boolean(solicitudId && codigoExt)

  const [items, setItems] = React.useState<UploadItem[]>([])
  const [dragActivo, setDragActivo] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const inicial = React.useMemo(() => destinoInicial(unidades), [unidades])
  const [destino, setDestino] = React.useState<DestinoUnidad>(inicial)

  // Cambiar de solicitud (o que lleguen sus unidades) reinicia el destino: los
  // record IDs de la anterior ya no existen en esta lista.
  React.useEffect(() => {
    setDestino(inicial)
  }, [solicitudId, inicial])

  /**
   * El selector sólo aparece cuando hay ambigüedad real **y** la subida es de
   * verdad. Con cero unidades el backend deriva `_ingreso/`, con una sola no
   * hay nada que elegir (§9.1 caso a), y en modo diferido no hay subida que
   * dirigir todavía. En los tres casos la zona se ve exactamente igual que
   * antes de esta tanda.
   */
  const eligeDestino = modoInmediato && requiereSeleccion(unidades)
  const destinoDefinido = !eligeDestino || destino !== ""

  // Aborta lo que quede en vuelo si el componente se desmonta (la Ejecutiva
  // cierra el sheet a mitad de subida).
  const itemsRef = React.useRef<UploadItem[]>([])
  itemsRef.current = items
  React.useEffect(() => {
    return () => {
      itemsRef.current.forEach((i) => i.abort?.abort())
    }
  }, [])

  const subiendo = items.filter((i) => i.status === "uploading")
  const totalEnLote = items.length

  function actualizar(id: string, cambios: Partial<UploadItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...cambios } : it)))
  }

  /**
   * Regla D · el estado de progreso no puede quedar encendido por ninguna vía.
   *
   * Mientras un item está en `uploading`, `subiendo.length > 0` deshabilita el
   * selector de destino. Sin el `catch`, una excepción entre el `actualizar` de
   * entrada y el de salida —un callback del padre que lanza, un fallo de parseo,
   * cualquier cosa que `uploadConReintentos` no resuelva— dejaba el item en
   * `uploading` para siempre, y con él el selector muerto hasta recargar la
   * página. Es el bug que la propia Regla D describe.
   *
   * **Asimetría deliberada con `document-checklist.tsx`, que sí usa `finally`.**
   * Acá el reset va en el `catch` y no en un `finally` porque el camino de éxito
   * **elimina el item de la lista**: un `finally` que escribiera
   * `status: "error"` resucitaría una fila recién borrada. La garantía de Regla
   * D se mantiene igual, porque las tres salidas escriben estado terminal —éxito
   * borra el item, error y `catch` escriben `status: "error"`—. En el checklist
   * el estado terminal del éxito (`"idle"`) se escribe antes de los callbacks,
   * así que ahí el `finally` es limpio y se usa el patrón estándar.
   *
   * Sin test unitario: el handler es un closure interno del componente, y
   * probarlo exige `@testing-library/react` y jsdom, dependencias fuera del
   * stack aprobado. La invariante se protege por diseño —todas las salidas
   * escriben estado terminal—, no por test.
   */
  async function subir(item: UploadItem) {
    const abort = new AbortController()
    actualizar(item.id, {
      status: "uploading",
      progress: 0,
      errorMsg: undefined,
      abort,
    })

    try {
      const resultado = await uploadConReintentos({
        file: item.file,
        solicitud_id: solicitudId!,
        codigo_ext: codigoExt!,
        tipo_documento: tipoDocumento,
        subido_por: usuarioActual,
        signal: abort.signal,
        onProgress: (pct) => actualizar(item.id, { progress: pct }),
        ...destinoAPayload(destino, unidades.length > 0),
      })

      if (resultado.ok) {
        // Sólo aquí hay toast: la escritura está confirmada por el Route Handler,
        // que a su vez exige `adjunto_id` en la respuesta de Make (E-082).
        setItems((prev) => prev.filter((c) => c.id !== item.id))
        onUploaded?.([
          {
            id: String(resultado.adjunto_id ?? item.id),
            nombre: resultado.nombre_archivo ?? item.name,
            detalle: resultado.reused
              ? `Ya estaba subido · por ${usuarioActual}`
              : `Subido recién · por ${usuarioActual}`,
            adjuntoId: resultado.adjunto_id ? String(resultado.adjunto_id) : undefined,
            urlDropbox: resultado.url_dropbox,
            file: item.file,
          },
        ])
        toast.success(
          resultado.reused
            ? "Este archivo ya estaba adjunto"
            : "Archivo adjuntado correctamente",
          { duration: 3000 },
        )
        return
      }

      actualizar(item.id, {
        status: "error",
        progress: 0,
        errorMsg: resultado.error ?? "No se pudo subir.",
        abort: undefined,
      })
    } catch (err) {
      console.error("[FileUploadZone.subir]", err)
      actualizar(item.id, {
        status: "error",
        progress: 0,
        errorMsg: MSG_ERROR_RED,
        abort: undefined,
      })
    }
  }

  function agregarArchivos(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || disabled) return

    /**
     * Cinturón y tirantes sobre el destino. Con el default no debería poder
     * dispararse —la zona de arrastre ya está deshabilitada—, pero el drop
     * nativo no respeta el `disabled` de un `<button>` en todos los navegadores
     * y el path que produce esta subida es un snapshot inmutable (§8, CI-004):
     * un archivo mal archivado no se recoloca después.
     */
    if (!destinoDefinido) {
      toast.error(MSG_SIN_DESTINO, { duration: 4000 })
      return
    }

    const archivos = permiteMultiple
      ? Array.from(fileList)
      : Array.from(fileList).slice(0, 1)

    const nuevos: UploadItem[] = archivos.map((file) => {
      const error = validar(file)
      return {
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        name: file.name,
        size: file.size,
        status: error ? "error" : "uploading",
        progress: 0,
        errorMsg: error ?? undefined,
        esImagen: esImagenArchivo(file.name, file.type),
      }
    })

    setItems((prev) => (permiteMultiple ? [...prev, ...nuevos] : nuevos))

    if (nuevos.some((n) => n.status === "error")) {
      toast.error("Algunos archivos no se pudieron adjuntar.", { duration: 3000 })
    }

    const validos = nuevos.filter((n) => n.status === "uploading")

    if (!modoInmediato) {
      // Captura diferida: no hay red, así que no hay progreso que mostrar ni
      // nada que celebrar. Se entrega al padre y se limpia la zona.
      setItems((prev) => prev.filter((p) => !validos.some((v) => v.id === p.id)))
      if (validos.length > 0) {
        onUploaded?.(
          validos.map((v) => ({
            id: v.id,
            nombre: v.name,
            detalle: `${formatearTamano(v.size)} · pendiente de subir`,
            file: v.file,
          })),
        )
      }
      return
    }

    validos.forEach((item) => void subir(item))
  }

  function cancelar(id: string) {
    const item = items.find((i) => i.id === id)
    item?.abort?.abort()
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function reintentar(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    // Reintento real sobre el `File` original — no un placeholder.
    if (validar(item.file)) return
    void subir(item)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Selector de destino · sólo en modo inmediato con dos o más unidades */}
      {eligeDestino && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex flex-col gap-0.5">
            <label
              htmlFor="destino-adjuntos-libres"
              className="text-sm font-medium text-foreground"
            >
              Unidad de destino
            </label>
            <p className="text-xs text-muted-foreground">
              Se aplica a todos los archivos que subas ahora. No cambia los ya
              subidos.
            </p>
          </div>
          <SelectorDestinoUnidad
            id="destino-adjuntos-libres"
            value={destino}
            onValueChange={setDestino}
            unidades={unidades}
            // Regla D · punto 4: los inputs se deshabilitan mientras hay una
            // mutación en vuelo. Cambiar el destino a mitad del lote dejaría
            // unos archivos en una carpeta y otros en otra.
            disabled={disabled || subiendo.length > 0}
            className="w-full sm:max-w-xs"
            aria-label="Unidad de destino de los adjuntos libres"
          />
          {!destinoDefinido && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-[#b91c1c]">
              <AlertCircle className="size-3.5 shrink-0" />
              {MSG_SIN_DESTINO}
            </p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={EXT_PERMITIDAS.join(",")}
        multiple={permiteMultiple}
        className="sr-only"
        disabled={disabled || !destinoDefinido}
        onChange={(e) => {
          agregarArchivos(e.target.files)
          e.target.value = ""
        }}
      />

      {/* Estado IDLE / zona drag-and-drop */}
      <button
        type="button"
        disabled={disabled || !destinoDefinido}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && destinoDefinido) setDragActivo(true)
        }}
        onDragLeave={() => setDragActivo(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActivo(false)
          agregarArchivos(e.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 text-center transition-colors hover:border-brand/50 hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          compact ? "px-3 py-4" : "px-4 py-8",
          dragActivo && "border-brand bg-brand/5"
        )}
        aria-label="Seleccionar archivos para adjuntar"
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
            compact ? "size-8" : "size-10"
          )}
        >
          <Upload className={compact ? "size-4" : "size-5"} />
        </span>
        <span className="text-sm font-medium text-foreground">
          {compact
            ? "Adjuntar captura o email"
            : "Arrastra archivos aquí o haz clic para seleccionar"}
        </span>
        {!compact && (
          <span className="text-xs text-muted-foreground">
            PDF, JPG, PNG · máx 10MB por archivo
          </span>
        )}
      </button>

      {/* Estado UPLOADING / ERROR / lista de transferencias */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {subiendo.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground">
              {`Subiendo ${subiendo.length} de ${totalEnLote} ${
                totalEnLote === 1 ? "archivo" : "archivos"
              }…`}
            </p>
          )}

          {items.map((item) => {
            const Icon = item.esImagen ? ImageIcon : FileText
            const enError = item.status === "error"
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-card p-3",
                  enError ? "border-destructive/60" : "border-border"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md",
                    enError
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {enError ? (
                    <AlertCircle className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatearTamano(item.size)}
                    </span>
                  </div>

                  {enError ? (
                    <span className="text-xs font-medium text-destructive">
                      {item.errorMsg}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.progress}
                        className="flex-1"
                      />
                      <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                        {item.progress}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {enError && !validar(item.file) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!destinoDefinido}
                      onClick={() => reintentar(item.id)}
                    >
                      <RotateCcw data-icon="inline-start" />
                      Reintentar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={enError ? "Descartar archivo" : "Cancelar subida"}
                    onClick={() => cancelar(item.id)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
