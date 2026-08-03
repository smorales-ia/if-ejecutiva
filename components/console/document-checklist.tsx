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
import { Progress } from "@/components/ui/progress"
import { uploadConReintentos } from "@/lib/adjuntos-uploader"
import type { TipoDocumento } from "@/lib/tipos-documento"
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
  /** Record ID de `TX_Adjuntos` cuando el archivo ya está persistido. */
  adjunto_id?: string
  /** `true` si vino de Airtable y no de una subida de esta sesión. */
  persistido?: boolean
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
  /**
   * Metadatos del tipo desde `D_TipoDocumento`. El lookup lo hace el padre —
   * antes esta fila lo resolvía contra el mock `TIPOS_DOCUMENTO`, que ya no
   * existe como fuente (Tanda 1, 02-ago-2026).
   */
  meta: TipoDocumento
  solicitudId: string
  codigoExt: string
  usuarioActual: string
  onToggle: (codigo: string, marcado: boolean) => void
  onArchivo: (codigo: string, archivo: DocumentoArchivo | null) => void
  /** Se invoca tras una subida confirmada, para releer `TX_Adjuntos`. */
  onSubido: () => void
}

function DocumentRow({
  item,
  meta,
  solicitudId,
  codigoExt,
  usuarioActual,
  onToggle,
  onArchivo,
  onSubido,
}: DocumentRowProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  const [estado, setEstado] = React.useState<EstadoCarga>("idle")
  const [progreso, setProgreso] = React.useState(0)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const marcado = item.requerido_por_ejecutiva
  const tieneArchivo = item.archivo !== null

  /**
   * Sube el archivo declarando `tipo_documento = item.codigo` (RN-25: el tipo
   * se declara al upload, no se infiere). Antes esto era un `setInterval` que
   * fingía progreso y guardaba un `URL.createObjectURL` que moría con la
   * pestaña.
   */
  async function subir(file: File) {
    const abort = new AbortController()
    abortRef.current = abort

    setEstado("uploading")
    setProgreso(0)
    setErrorMsg(null)

    const resultado = await uploadConReintentos({
      file,
      solicitud_id: solicitudId,
      codigo_ext: codigoExt,
      tipo_documento: item.codigo,
      subido_por: usuarioActual,
      signal: abort.signal,
      onProgress: setProgreso,
    })

    abortRef.current = null

    if (!resultado.ok) {
      setEstado("error")
      setErrorMsg(resultado.error ?? "No se pudo subir.")
      return
    }

    setEstado("idle")
    onArchivo(item.codigo, {
      nombre: resultado.nombre_archivo ?? file.name,
      tamanio_kb: resultado.tamanio_kb ?? Math.round(file.size / 1024),
      mime_type: file.type || "application/octet-stream",
      url_local: resultado.url_dropbox ?? "",
      adjunto_id: resultado.adjunto_id ? String(resultado.adjunto_id) : undefined,
      persistido: true,
    })
    onSubido()
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
    void subir(file)
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
        disabled={estado === "uploading"}
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
          <div className="flex items-center justify-end gap-2">
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            <Progress value={progreso} className="w-24" />
            <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {progreso}%
            </span>
          </div>
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
            {/* El archivo ya subido NO se borra: no existe escenario Make de
                borrado y las escrituras a Airtable nunca salen de la UI. Se
                quita la marca del checklist; el adjunto sigue en la solicitud. */}
            <AlertDialogDescription>
              {item.archivo?.persistido
                ? "Deja de exigirse en el checklist. El archivo ya subido se mantiene en los adjuntos de la solicitud."
                : "Quitar este documento elimina el archivo cargado. ¿Continuar?"}
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
  /** Catálogo real de `D_TipoDocumento` (`useTiposDocumento`). */
  tipos: TipoDocumento[]
  solicitudId: string
  codigoExt: string
  usuarioActual?: string
  onSubido: () => void
}

export function DocumentChecklist({
  value,
  onChange,
  tipos,
  solicitudId,
  codigoExt,
  usuarioActual = "Ejecutivo",
  onSubido,
}: DocumentChecklistProps) {
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
      {value.map((item) => {
        const meta = tipos.find((t) => t.codigo === item.codigo)
        if (!meta) return null
        return (
          <DocumentRow
            key={item.tipo_id}
            item={item}
            meta={meta}
            solicitudId={solicitudId}
            codigoExt={codigoExt}
            usuarioActual={usuarioActual}
            onToggle={handleToggle}
            onArchivo={handleArchivo}
            onSubido={onSubido}
          />
        )
      })}
    </div>
  )
}
