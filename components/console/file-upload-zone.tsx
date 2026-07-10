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
import { cn } from "@/lib/utils"

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"]
const EXT_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"]
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

export type UploadStatus = "uploading" | "success" | "error"

export interface UploadItem {
  id: string
  name: string
  size: number
  status: UploadStatus
  progress: number
  errorMsg?: string
  esImagen: boolean
}

export interface ArchivoSubido {
  id: string
  nombre: string
  detalle: string
}

interface FileUploadZoneProps {
  variant?: "default" | "compact"
  /** Permite seleccionar varios archivos (ignorado en compact, que es de 1). */
  multiple?: boolean
  /** Se invoca cuando uno o más archivos terminan de subir con éxito. */
  onUploaded?: (archivos: ArchivoSubido[]) => void
  className?: string
  usuarioActual?: string
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

export function FileUploadZone({
  variant = "default",
  multiple = true,
  onUploaded,
  className,
  usuarioActual = "María Espinoza",
}: FileUploadZoneProps) {
  const compact = variant === "compact"
  const permiteMultiple = compact ? false : multiple

  const [items, setItems] = React.useState<UploadItem[]>([])
  const [dragActivo, setDragActivo] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const timers = React.useRef<Record<string, ReturnType<typeof setInterval>>>({})
  const archivosRef = React.useRef<Record<string, File>>({})

  React.useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearInterval)
    }
  }, [])

  const subiendo = items.filter((i) => i.status === "uploading")
  const totalEnLote = items.length

  /**
   * Streaming real hacia /api/adjuntos/upload → Make → Dropbox. Mientras el
   * escenario Make de adjuntos no esté provisionado, el endpoint degrada con
   * el mensaje canónico y esta función lo deja como fila en estado error
   * (con Reintentar) — nunca bloquea el resto del formulario ni finge un
   * éxito que no ocurrió.
   */
  async function subirArchivo(id: string, file: File) {
    if (timers.current[id]) clearInterval(timers.current[id])
    timers.current[id] = setInterval(() => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === id && it.status === "uploading" && it.progress < 90
            ? {
                ...it,
                progress: Math.min(it.progress + Math.round(5 + Math.random() * 10), 90),
              }
            : it
        )
      )
    }, 280)

    let ok = false
    let mensaje = "No pudimos adjuntar el archivo. Intenta nuevamente en unos segundos."

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/adjuntos/upload", {
        method: "POST",
        body: formData,
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        degraded?: boolean
        error?: string
      }
      ok = res.ok && data.ok === true
      if (data.error) mensaje = data.error
    } catch {
      mensaje = "Sin conexión. Intenta de nuevo."
    }

    if (timers.current[id]) {
      clearInterval(timers.current[id])
      delete timers.current[id]
    }

    if (ok) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, progress: 100, status: "success" } : it))
      )
      window.setTimeout(() => {
        setItems((cur) => cur.filter((c) => c.id !== id))
        delete archivosRef.current[id]
        onUploaded?.([
          {
            id,
            nombre: file.name,
            detalle: `Subido hace unos segundos · por ${usuarioActual}`,
          },
        ])
        toast.success("Archivo adjuntado correctamente", { duration: 3000 })
      }, 350)
      return
    }

    // Adjunto no disponible (degradado) o error real: la fila queda en estado
    // error con Reintentar; el resto del formulario sigue disponible y la
    // solicitud puede crearse igual sin este adjunto.
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: "error", progress: 0, errorMsg: mensaje } : it
      )
    )
  }

  function agregarArchivos(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const archivos = permiteMultiple
      ? Array.from(fileList)
      : Array.from(fileList).slice(0, 1)

    const nuevos: UploadItem[] = archivos.map((file) => {
      const id = `${file.name}-${file.size}-${crypto.randomUUID()}`
      const error = validar(file)
      return {
        id,
        name: file.name,
        size: file.size,
        status: error ? "error" : "uploading",
        progress: 0,
        errorMsg: error ?? undefined,
        esImagen: esImagenArchivo(file.name, file.type),
      }
    })

    setItems((prev) => (permiteMultiple ? [...prev, ...nuevos] : nuevos))

    nuevos.forEach((item, idx) => {
      if (item.status === "uploading") {
        archivosRef.current[item.id] = archivos[idx]
        void subirArchivo(item.id, archivos[idx])
      }
    })

    if (nuevos.some((n) => n.status === "error")) {
      toast.error("Algunos archivos no se pudieron adjuntar.", {
        duration: 3000,
      })
    }
  }

  function cancelar(id: string) {
    if (timers.current[id]) {
      clearInterval(timers.current[id])
      delete timers.current[id]
    }
    delete archivosRef.current[id]
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function reintentar(id: string) {
    const file = archivosRef.current[id]
    if (!file) return
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "uploading", progress: 0, errorMsg: undefined }
          : i
      )
    )
    void subirArchivo(id, file)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={EXT_PERMITIDAS.join(",")}
        multiple={permiteMultiple}
        className="sr-only"
        onChange={(e) => {
          agregarArchivos(e.target.files)
          e.target.value = ""
        }}
      />

      {/* Estado IDLE / zona drag-and-drop */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActivo(true)
        }}
        onDragLeave={() => setDragActivo(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActivo(false)
          agregarArchivos(e.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 text-center transition-colors hover:border-brand/50 hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
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
                  {enError && (
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
