"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Paperclip,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

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
import type { Adjunto } from "@/lib/adjuntos"
import type { TipoDocumento } from "@/lib/tipos-documento"
import { cn } from "@/lib/utils"

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"]
const EXT_PERMITIDAS = [".pdf", ".jpg", ".jpeg", ".png"]
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

/** Literales §6 · §8.6.4. No admiten variación. */
const MSG_ELIMINADO = "Documento eliminado"
const MSG_REEMPLAZADO = "Documento reemplazado"
const MSG_ERROR_RED =
  "No pudimos completar la acción. Intenta nuevamente en unos segundos."

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
  /**
   * Fila real de `TX_Adjuntos` para este tipo, casada por `clave_adjunto`, o
   * `null` si el tipo aún no tiene archivo persistido.
   *
   * Es la **única** fuente del record ID `rec…` y del `hash_md5` que exige el
   * borrado (§8.6.3). El `adjunto_id` que devuelve la subida es el autoNumber
   * (`fldVt7Lk1ptvmgbtT`) y `ActionDeleteRecord` no lo acepta: por eso la fila
   * del checklist debe casarse contra el adjunto persistido antes de poder
   * borrar, y por eso los controles destructivos sólo aparecen cuando este
   * objeto existe.
   */
  persistido: Adjunto | null
  solicitudId: string
  codigoExt: string
  usuarioActual: string
  /** RN-59 · modo consulta: oculta —no deshabilita— subir, reemplazar y eliminar. */
  readOnly: boolean
  /** `true` mientras el hook tiene un borrado en vuelo para este adjunto. */
  eliminando: boolean
  onToggle: (codigo: string, marcado: boolean) => void
  onArchivo: (codigo: string, archivo: DocumentoArchivo | null) => void
  /**
   * Desmarca el tipo y le quita el archivo en **una sola** actualización.
   *
   * Encadenar `onArchivo(...)` y `onToggle(...)` no funciona: ambos derivan el
   * array nuevo del mismo `value` capturado en este render, así que el segundo
   * pisa al primero y el tipo queda desmarcado pero conservando el archivo.
   */
  onQuitar: (codigo: string) => void
  /** Se invoca tras una subida confirmada, para releer `TX_Adjuntos`. */
  onSubido: () => void
  /** Borrado real. Resuelve `true` sólo si la relectura confirma la desaparición. */
  onEliminar: (adjuntoRecordId: string) => Promise<boolean>
}

function DocumentRow({
  item,
  meta,
  persistido,
  solicitudId,
  codigoExt,
  usuarioActual,
  readOnly,
  eliminando,
  onToggle,
  onArchivo,
  onQuitar,
  onSubido,
  onEliminar,
}: DocumentRowProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  const [estado, setEstado] = React.useState<EstadoCarga>("idle")
  const [progreso, setProgreso] = React.useState(0)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = React.useState(false)
  const [confirmarReemplazo, setConfirmarReemplazo] = React.useState(false)

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const marcado = item.requerido_por_ejecutiva
  const tieneArchivo = item.archivo !== null
  const ocupado = estado === "uploading" || eliminando

  /**
   * Sube el archivo declarando `tipo_documento = item.codigo` (RN-25: el tipo
   * se declara al upload, no se infiere).
   *
   * El reemplazo es **backend-driven** (§8.6.2 · RN-60): no hay flag en el
   * payload. El cliente manda una subida normal y `SC-Adjuntos-Upload v1.2`
   * decide el desenlace —alta, reutilización o reemplazo— buscando por
   * (hash, solicitud) primero y por (solicitud, clave_adjunto) después. Aquí
   * sólo se lee el `modo` que vuelve para elegir el toast.
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

    // Si el usuario acabó eligiendo el mismo binario, el backend responde
    // `reused` y no se reemplazó nada: la confirmación habrá sido innecesaria
    // pero nunca engañosa (§8.6.4). Sin toast de reemplazo en ese caso.
    if (resultado.modo === "reemplazo") toast.success(MSG_REEMPLAZADO)

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

  /**
   * Abre el selector de archivo. Si el tipo ya tiene adjunto, antes pide
   * confirmación: §8.6.4 exige que el diálogo aparezca **antes** del selector y
   * que se dispare por *tener adjunto previo*, no por *saber que el hash
   * difiere* — el cliente no conoce el hash hasta que el usuario elige archivo.
   */
  function pedirArchivo() {
    if (persistido) {
      setConfirmarReemplazo(true)
      return
    }
    inputRef.current?.click()
  }

  function confirmarReemplazar() {
    setConfirmarReemplazo(false)
    inputRef.current?.click()
  }

  async function eliminarAdjunto() {
    if (!persistido) return
    try {
      const borrado = await onEliminar(persistido.id)
      if (!borrado) {
        toast.error(MSG_ERROR_RED)
        return
      }
      // El tipo sólo se marca vacío si la relectura confirmó la desaparición
      // (§8.6.4): no se confía en el estado local.
      onQuitar(item.codigo)
      setEstado("idle")
      setErrorMsg(null)
      toast.success(MSG_ELIMINADO)
    } finally {
      // Regla D: reset en `finally`, nunca sólo en el `catch`.
      setConfirmarBorrado(false)
    }
  }

  function handleCheckedChange(next: boolean) {
    // Desmarcar un tipo con archivo persistido ya no es un cambio de UI: borra
    // el binario y la fila. Confirmar primero (RF-52).
    if (!next && persistido) {
      setConfirmarBorrado(true)
      return
    }
    if (!next) {
      // Archivo sólo local (subida en curso abortada, o sin persistir todavía).
      setEstado("idle")
      setErrorMsg(null)
      onQuitar(item.codigo)
      return
    }
    onToggle(item.codigo, next)
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
        disabled={ocupado || readOnly}
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
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={pedirArchivo}
              >
                Reintentar
              </Button>
            )}
          </div>
        ) : tieneArchivo ? (
          <div className="flex items-center justify-end gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-brand">
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="truncate">{truncar(item.archivo!.nombre)}</span>
            </span>
            {/* RN-59: en modo consulta los controles destructivos no se
                deshabilitan — no se renderizan. */}
            {!readOnly && persistido && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={ocupado}
                  onClick={pedirArchivo}
                >
                  <RefreshCw data-icon="inline-start" />
                  Reemplazar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar documento"
                  disabled={ocupado}
                  onClick={() => setConfirmarBorrado(true)}
                >
                  {eliminando ? <Loader2 className="animate-spin" /> : <Trash2 />}
                </Button>
              </>
            )}
          </div>
        ) : (
          !readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={pedirArchivo}
            >
              <Paperclip data-icon="inline-start" />
              Subir archivo
            </Button>
          )
        )}
      </div>

      {/* Diálogo de desmarcado · RF-52 §8.6.4 */}
      <AlertDialog open={confirmarBorrado} onOpenChange={setConfirmarBorrado}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este documento?</AlertDialogTitle>
            <AlertDialogDescription>
              El archivo será eliminado permanentemente de la solicitud y del
              almacenamiento. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={eliminando}
              onClick={() => void eliminarAdjunto()}
            >
              {eliminando && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {eliminando ? "Eliminando…" : "Eliminar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de reemplazo · RN-60 §8.6.4 */}
      <AlertDialog open={confirmarReemplazo} onOpenChange={setConfirmarReemplazo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Este tipo de documento ya tiene un archivo cargado
            </AlertDialogTitle>
            <AlertDialogDescription>
              El documento {meta.nombre} ya tiene un archivo cargado (
              {persistido?.nombre ?? item.archivo?.nombre}). Si continúas con un
              archivo distinto, se reemplazará el anterior de forma permanente.
              Solo se conserva un archivo por tipo de documento. ¿Deseas
              continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmarReemplazar}>
              Reemplazar
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
  /** Filas reales de `TX_Adjuntos` de esta solicitud (`useAdjuntosSolicitud`). */
  adjuntos: Adjunto[]
  solicitudId: string
  codigoExt: string
  usuarioActual?: string
  /** RN-59 · modo consulta. Oculta todo control de escritura. */
  readOnly?: boolean
  /** Record ID del adjunto con borrado en vuelo, o `null`. */
  eliminandoId?: string | null
  onSubido: () => void
  onEliminar: (adjuntoRecordId: string) => Promise<boolean>
}

export function DocumentChecklist({
  value,
  onChange,
  tipos,
  adjuntos,
  solicitudId,
  codigoExt,
  usuarioActual = "Ejecutivo",
  readOnly = false,
  eliminandoId = null,
  onSubido,
  onEliminar,
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

  function handleQuitar(codigo: string) {
    onChange(
      value.map((d) =>
        d.codigo === codigo
          ? { ...d, requerido_por_ejecutiva: false, archivo: null }
          : d
      )
    )
  }

  /**
   * Índice de adjuntos por `clave_adjunto` (`fldaLLtzAaEn1O8IW`). Es el único
   * campo que `SC-Adjuntos-Upload` escribe con el tipo declarado, y la vía por
   * la que cada fila del checklist obtiene el record ID y el `hash_md5` que
   * necesita para borrar (§8.6.3).
   */
  const porClave = React.useMemo(() => {
    const mapa = new Map<string, Adjunto>()
    for (const a of adjuntos) {
      if (a.claveAdjunto && !mapa.has(a.claveAdjunto)) mapa.set(a.claveAdjunto, a)
    }
    return mapa
  }, [adjuntos])

  /**
   * Orden alfabético por nombre del tipo (§1.5.1.1). El catálogo llega en el
   * orden en que Airtable devuelve las filas, que no es estable ni alfabético;
   * sin este `sort` el checklist se reordena solo entre sesiones.
   */
  const ordenados = React.useMemo(() => {
    return value
      .map((item) => ({ item, meta: tipos.find((t) => t.codigo === item.codigo) }))
      .filter(
        (fila): fila is { item: DocumentoChecklistItem; meta: TipoDocumento } =>
          fila.meta != null
      )
      .sort((a, b) => a.meta.nombre.localeCompare(b.meta.nombre, "es"))
  }, [value, tipos])

  return (
    <div className="flex flex-col gap-2">
      {ordenados.map(({ item, meta }) => {
        const persistido = porClave.get(item.codigo) ?? null
        return (
          <DocumentRow
            key={item.tipo_id}
            item={item}
            meta={meta}
            persistido={persistido}
            solicitudId={solicitudId}
            codigoExt={codigoExt}
            usuarioActual={usuarioActual}
            readOnly={readOnly}
            eliminando={persistido != null && eliminandoId === persistido.id}
            onToggle={handleToggle}
            onArchivo={handleArchivo}
            onQuitar={handleQuitar}
            onSubido={onSubido}
            onEliminar={onEliminar}
          />
        )
      })}
    </div>
  )
}
