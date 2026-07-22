"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Paperclip,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TIPOS_DOCUMENTO } from "@/lib/console-data"
import { cn } from "@/lib/utils"

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"]
const EXT_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"]
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

/** Representación de un archivo cargado, según el schema zod. */
export interface DocumentoArchivo {
  nombre: string
  tamanio_kb: number
  mime_type: string
  url_local: string
}

/** Item del array `documentos` controlado por react-hook-form. */
export interface DocumentoChecklistItem {
  tipo_id: string
  codigo: string
  requerido_por_ejecutiva: boolean
  archivo: DocumentoArchivo | null
}

type EstadoCarga = "idle" | "uploading" | "error"

function truncar(nombre: string, max = 24): string {
  if (nombre.length <= max) return nombre
  return `${nombre.slice(0, max - 1)}…`
}

function validar(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
  const tipoOk =
    TIPOS_PERMITIDOS.includes(file.type) || EXT_PERMITIDAS.includes(ext)
  if (!tipoOk) return "Sólo PDF, JPG o PNG"
  if (file.size > MAX_BYTES) return "Archivo supera 10 MB"
  return null
}

interface DocumentRowProps {
  item: DocumentoChecklistItem
  onToggle: (codigo: string, marcado: boolean) => void
  onArchivo: (codigo: string, archivo: DocumentoArchivo | null) => void
}

function DocumentRow({ item, onToggle, onArchivo }: DocumentRowProps) {
  const meta = TIPOS_DOCUMENTO.find((t) => t.codigo === item.codigo)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const [estado, setEstado] = React.useState<EstadoCarga>("idle")
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!meta) return null

  const marcado = item.requerido_por_ejecutiva
  const tieneArchivo = item.archivo !== null

  function simularSubida(file: File) {
    if (timerRef.current) clearInterval(timerRef.current)
    let progreso = 0
    setEstado("uploading")
    timerRef.current = setInterval(() => {
      progreso = Math.min(progreso + 25, 100)
      if (progreso >= 100) {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        setEstado("idle")
        onArchivo(item.codigo, {
          nombre: file.name,
          tamanio_kb: Math.round(file.size / 1024),
          mime_type: file.type || "application/octet-stream",
          url_local: URL.createObjectURL(file),
        })
      }
    }, 200)
  }

  function seleccionar(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    const error = validar(file)
    if (error) {
      setEstado("error")
      setErrorMsg(error)
      return
    }
    setErrorMsg(null)
    simularSubida(file)
  }

  function handleCheckedChange(next: boolean) {
    // Si se desmarca un documento con archivo cargado, confirmar primero.
    if (!next && tieneArchivo) {
      setConfirmOpen(true)
      return
    }
    if (!next) {
      setEstado("idle")
      setErrorMsg(null)
    }
    onToggle(item.codigo, next)
  }

  function confirmarQuitar() {
    onArchivo(item.codigo, null)
    onToggle(item.codigo, false)
    setEstado("idle")
    setErrorMsg(null)
    setConfirmOpen(false)
  }

  function removerArchivo() {
    onArchivo(item.codigo, null)
    setEstado("idle")
    setErrorMsg(null)
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center",
        item.requerido_por_ejecutiva &&
          !tieneArchivo &&
          estado !== "uploading" &&
          "border-amber-200 bg-amber-50/40"
      )}
    >
      {/* Zona 1 · Checkbox */}
      <Checkbox
        id={`doc-${item.tipo_id}`}
        checked={marcado}
        onCheckedChange={handleCheckedChange}
        className="mt-0.5 sm:mt-0"
      />

      {/* Zona 2 · Label + meta */}
      <div className="flex min-w-0 flex-col gap-0.5">
        <label
          htmlFor={`doc-${item.tipo_id}`}
          className="cursor-pointer text-sm leading-snug font-medium text-foreground"
        >
          {meta.nombre}
        </label>
        <span className="text-xs text-muted-foreground">
          {meta.entidad_emisora}
        </span>
      </div>

      {/* Zona 3 · Badge de vigencia */}
      <div className="row-start-1 col-start-3 justify-self-end sm:row-auto sm:col-auto">
        {meta.vigencia_dias != null && (
          <Badge variant="secondary" className="text-muted-foreground">
            Vigencia {meta.vigencia_dias} días
          </Badge>
        )}
      </div>

      {/* Zona 4 · Slot de carga */}
      <div className="col-span-3 sm:col-span-1 sm:col-start-4 sm:justify-self-end">
        <input
          ref={inputRef}
          type="file"
          accept={EXT_PERMITIDAS.join(",")}
          className="sr-only"
          onChange={(e) => {
            seleccionar(e.target.files)
            e.target.value = ""
          }}
        />

        {!marcado ? (
          <span className="block text-right text-xs text-muted-foreground/70">
            No incluido
          </span>
        ) : estado === "uploading" ? (
          <span className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Subiendo…
          </span>
        ) : estado === "error" ? (
          <div className="flex items-center justify-end gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#b91c1c]">
              <AlertCircle className="size-4" />
              {errorMsg}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Reintentar
            </Button>
          </div>
        ) : tieneArchivo ? (
          <div className="flex items-center justify-end gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-brand">
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="truncate">{truncar(item.archivo!.nombre)}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar archivo"
              onClick={removerArchivo}
            >
              <X />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Paperclip data-icon="inline-start" />
            Subir archivo
          </Button>
        )}
      </div>

      {/* Confirmación al desmarcar un documento con archivo */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar este documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Quitar este documento elimina el archivo cargado. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Conservar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmarQuitar}
            >
              Quitar documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface DocumentChecklistProps {
  value: DocumentoChecklistItem[]
  onChange: (next: DocumentoChecklistItem[]) => void
}

export function DocumentChecklist({ value, onChange }: DocumentChecklistProps) {
  function handleToggle(codigo: string, marcado: boolean) {
    onChange(
      value.map((d) =>
        d.codigo === codigo
          ? { ...d, requerido_por_ejecutiva: marcado }
          : d
      )
    )
  }

  function handleArchivo(codigo: string, archivo: DocumentoArchivo | null) {
    onChange(
      value.map((d) => (d.codigo === codigo ? { ...d, archivo } : d))
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((item) => (
        <DocumentRow
          key={item.tipo_id}
          item={item}
          onToggle={handleToggle}
          onArchivo={handleArchivo}
        />
      ))}
    </div>
  )
}
