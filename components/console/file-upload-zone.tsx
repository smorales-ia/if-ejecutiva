"use client"

import * as React from "react"
import { FileText, ImageIcon, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"]
const EXT_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"]

// D-13: límites y validaciones frontend antes de habilitar "Crear solicitud".
const MAX_BYTES_POR_ARCHIVO = 7 * 1024 * 1024 // 7 MB
const UMBRAL_ADVERTENCIA_BYTES = 40 * 1024 * 1024 // 40 MB
const UMBRAL_BLOQUEO_BYTES = 80 * 1024 * 1024 // 80 MB

const MSG_ARCHIVO_GRANDE =
  "Este archivo supera el límite de 7 MB. Comprímelo o divídelo."
const MSG_ADVERTENCIA_TOTAL = "Esto puede tardar hasta 2 minutos."
const MSG_BLOQUEO_TOTAL = "Divide la subida en tandas o comprime los planos."

interface FileUploadZoneProps {
  variant?: "default" | "compact"
  /** Permite seleccionar varios archivos (ignorado en compact, que es de 1). */
  multiple?: boolean
  /** Archivos actualmente en el state del padre (Opción C, D-12: no se suben al drop). */
  value: File[]
  /** Se invoca con la lista completa actualizada cada vez que se agrega o quita un archivo. */
  onFilesChange: (files: File[]) => void
  className?: string
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function esImagenArchivo(name: string, type: string): boolean {
  if (type.startsWith("image/")) return true
  return /\.(jpe?g|png)$/i.test(name)
}

function tipoValido(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
  return TIPOS_PERMITIDOS.includes(file.type) || EXT_PERMITIDAS.includes(ext)
}

export function FileUploadZone({
  variant = "default",
  multiple = true,
  value,
  onFilesChange,
  className,
}: FileUploadZoneProps) {
  const compact = variant === "compact"
  const permiteMultiple = compact ? false : multiple

  const [dragActivo, setDragActivo] = React.useState(false)
  const [errorArchivo, setErrorArchivo] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const totalBytes = value.reduce((sum, f) => sum + f.size, 0)
  const bloqueaPorTotal = totalBytes >= UMBRAL_BLOQUEO_BYTES
  const advierteTotal =
    !bloqueaPorTotal && totalBytes >= UMBRAL_ADVERTENCIA_BYTES

  function agregarArchivos(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const candidatos = permiteMultiple
      ? Array.from(fileList)
      : Array.from(fileList).slice(0, 1)

    const aceptados: File[] = []
    let error: string | null = null

    for (const file of candidatos) {
      if (!tipoValido(file)) {
        error = "Formato no permitido. Usa PDF, JPG o PNG."
        continue
      }
      if (file.size > MAX_BYTES_POR_ARCHIVO) {
        error = MSG_ARCHIVO_GRANDE
        continue
      }
      aceptados.push(file)
    }

    setErrorArchivo(error)

    // `permiteMultiple` sólo limita cuántos archivos se pueden elegir EN UNA
    // interacción con el selector del sistema operativo — sucesivas
    // interacciones (varios drops, o compact con selección de a uno) siempre
    // se acumulan sobre `value`, nunca lo reemplazan.
    if (aceptados.length > 0) {
      onFilesChange([...value, ...aceptados])
    }
  }

  function quitar(idx: number) {
    onFilesChange(value.filter((_, i) => i !== idx))
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
            PDF, JPG, PNG · máx 7MB por archivo
          </span>
        )}
      </button>

      {errorArchivo && (
        <p className="text-xs font-medium text-destructive">{errorArchivo}</p>
      )}

      {bloqueaPorTotal && (
        <p className="rounded-md border border-(--color-op-red)/30 bg-(--color-op-red)/10 px-3 py-2 text-xs font-medium text-(--color-op-red)">
          {MSG_BLOQUEO_TOTAL}
        </p>
      )}
      {advierteTotal && (
        <p className="rounded-md border border-(--color-op-amber)/30 bg-(--color-op-amber)/10 px-3 py-2 text-xs font-medium text-(--color-op-amber)">
          {MSG_ADVERTENCIA_TOTAL}
        </p>
      )}

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((file, idx) => {
            const Icon = esImagenArchivo(file.name, file.type) ? ImageIcon : FileText
            return (
              <li
                key={`${file.name}-${file.size}-${idx}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatearTamano(file.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar archivo"
                  onClick={() => quitar(idx)}
                >
                  <X />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
