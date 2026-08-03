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
import { uploadConReintentos } from "@/lib/adjuntos-uploader"
import { cn } from "@/lib/utils"

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"]
const EXT_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"]
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

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
  disabled = false,
}: FileUploadZoneProps) {
  const compact = variant === "compact"
  const permiteMultiple = compact ? false : multiple
  const modoInmediato = Boolean(solicitudId && codigoExt)

  const [items, setItems] = React.useState<UploadItem[]>([])
  const [dragActivo, setDragActivo] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

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

  async function subir(item: UploadItem) {
    const abort = new AbortController()
    actualizar(item.id, {
      status: "uploading",
      progress: 0,
      errorMsg: undefined,
      abort,
    })

    const resultado = await uploadConReintentos({
      file: item.file,
      solicitud_id: solicitudId!,
      codigo_ext: codigoExt!,
      tipo_documento: tipoDocumento,
      subido_por: usuarioActual,
      signal: abort.signal,
      onProgress: (pct) => actualizar(item.id, { progress: pct }),
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
  }

  function agregarArchivos(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || disabled) return
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
      <input
        ref={inputRef}
        type="file"
        accept={EXT_PERMITIDAS.join(",")}
        multiple={permiteMultiple}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          agregarArchivos(e.target.files)
          e.target.value = ""
        }}
      />

      {/* Estado IDLE / zona drag-and-drop */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragActivo(true)
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
