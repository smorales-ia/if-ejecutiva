"use client"

import * as React from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  ImageIcon,
  MoreHorizontal,
  Pause,
  Pencil,
  Plus,
  PlusCircle,
  RotateCcw,
  UserCog,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileUploadZone } from "@/components/console/file-upload-zone"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  PriorityChip,
  SLABadge,
  StateBadge,
} from "@/components/console/status-badges"
import type { Solicitud, TipoDocumento } from "@/lib/console-data"
import type { Evento, IconoEvento } from "@/lib/eventos"
import type { Adjunto } from "@/lib/adjuntos"
import { uploadConReintentos } from "@/lib/adjuntos-uploader"

const historialIcons: Record<IconoEvento, typeof CheckCircle2> = {
  check: CheckCircle2,
  plus: PlusCircle,
  alert: AlertTriangle,
  eye: Eye,
}

/** Item local optimista, agregado antes de que el próximo fetch lo confirme. */
type AdjuntoLocal = Adjunto

export function SolicitudDetail({
  solicitud,
  tiposDocumento,
}: {
  solicitud: Solicitud
  tiposDocumento: TipoDocumento[]
}) {
  const s = solicitud

  const [historialBase, setHistorialBase] = React.useState<Evento[]>([])
  const [historialLoading, setHistorialLoading] = React.useState(true)
  const [historialError, setHistorialError] = React.useState(false)

  const [adjuntosExtra, setAdjuntosExtra] = React.useState<AdjuntoLocal[]>([])
  const [adjuntosBase, setAdjuntosBase] = React.useState<Adjunto[]>([])
  const [adjuntosLoading, setAdjuntosLoading] = React.useState(true)
  const [adjuntosError, setAdjuntosError] = React.useState(false)

  // Resetea el estado local optimista cuando cambia la solicitud seleccionada.
  const prevId = React.useRef(s.id)
  if (prevId.current !== s.id) {
    prevId.current = s.id
    setAdjuntosExtra([])
  }

  React.useEffect(() => {
    let cancelado = false
    setHistorialLoading(true)
    setHistorialError(false)
    fetch(`/api/solicitudes/${s.id}/eventos`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch eventos falló")
        return res.json() as Promise<{ data: Evento[] }>
      })
      .then((json) => {
        if (!cancelado) setHistorialBase(json.data)
      })
      .catch(() => {
        if (!cancelado) setHistorialError(true)
      })
      .finally(() => {
        if (!cancelado) setHistorialLoading(false)
      })
    return () => {
      cancelado = true
    }
  }, [s.id])

  React.useEffect(() => {
    let cancelado = false
    setAdjuntosLoading(true)
    setAdjuntosError(false)
    fetch(`/api/solicitudes/${s.id}/adjuntos`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch adjuntos falló")
        return res.json() as Promise<{ data: Adjunto[] }>
      })
      .then((json) => {
        if (!cancelado) setAdjuntosBase(json.data)
      })
      .catch(() => {
        if (!cancelado) setAdjuntosError(true)
      })
      .finally(() => {
        if (!cancelado) setAdjuntosLoading(false)
      })
    return () => {
      cancelado = true
    }
  }, [s.id])

  function handleAdjuntoSubido(nuevo: AdjuntoLocal) {
    setAdjuntosExtra((prev) => [nuevo, ...prev])
  }

  const historialCompleto = historialBase
  const adjuntosCompleto = [...adjuntosExtra, ...adjuntosBase]

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Detail header */}
      <div className="flex flex-col gap-3 border-b border-border bg-card px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {s.codigoExt}
          </h1>
          <StateBadge estado={s.estado} />
          <SLABadge dias={s.slaDias} total={s.slaTotal} />
          <PriorityChip prioridad={s.prioridad} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <p>
            Modificado {s.modificado} por {s.modificadoPor}
          </p>
          <p>
            Decisión del motor:{" "}
            <span className="font-medium text-foreground">
              {s.reglaAplicada}
            </span>
          </p>
        </div>

        {/* Action bar — mock deshabilitado, disponible recién en Paso 5 (RF-06) */}
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton icon={Pencil} label="Editar" />
          <ActionButton icon={UserCog} label="Reasignar tasador" />
          <ActionButton label="Cambiar prioridad" />
          <ActionButton icon={Pause} label="Pausar" />
          <ActionButton icon={MoreHorizontal} label="Más opciones" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="datos" className="min-h-0 flex-1 gap-0">
        <div className="border-b border-border bg-card px-6">
          <TabsList variant="line" className="h-11">
            <TabsTrigger value="datos">Datos</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TabsContent value="datos">
            <DatosTab
              solicitud={s}
              tiposDocumento={tiposDocumento}
              adjuntos={adjuntosCompleto}
              adjuntosLoading={adjuntosLoading}
            />
          </TabsContent>
          <TabsContent value="historial">
            <HistorialTab
              eventos={historialCompleto}
              loading={historialLoading}
              error={historialError}
            />
          </TabsContent>
          <TabsContent value="adjuntos">
            <AdjuntosTab
              solicitud={s}
              adjuntos={adjuntosCompleto}
              loading={adjuntosLoading}
              error={adjuntosError}
              onSubido={handleAdjuntoSubido}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
}: {
  icon?: React.ComponentType
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex">
            <Button
              size="sm"
              variant="outline"
              disabled
              className="pointer-events-none"
            >
              {Icon && <Icon data-icon="inline-start" />}
              {label}
            </Button>
          </span>
        }
      />
      <TooltipContent>Disponible en Paso 5</TooltipContent>
    </Tooltip>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  )
}

function DataRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  )
}

/**
 * Espejo 1:1 de NewRequestSheet (RF-05 detalle, Paso 3): mismas 4 secciones
 * y labels literales del formulario de alta interna, más Documentos
 * requeridos/Adjuntos (resumen) y Asignación y Gestión (no está en el Sheet;
 * es del expediente).
 */
function DatosTab({
  solicitud: s,
  tiposDocumento,
  adjuntos,
  adjuntosLoading,
}: {
  solicitud: Solicitud
  tiposDocumento: TipoDocumento[]
  adjuntos: Adjunto[]
  adjuntosLoading: boolean
}) {
  const adjuntosRequeridos = adjuntos.filter((a) => a.requeridoPorEjecutiva)

  return (
    <div className="flex flex-col gap-6">
      <Section title="Origen de la solicitud">
        <DataRow label="Canal de origen">{s.canalOrigen}</DataRow>
        <DataRow label="Cliente">{s.cliente}</DataRow>
        <DataRow label="Tipo de informe">{s.tipoInforme}</DataRow>
        <DataRow label="Banco">{s.banco}</DataRow>
        <DataRow label="N° de operación cliente">{s.nOperacionCliente}</DataRow>
        <DataRow label="Sucursal originadora">{s.sucursalOriginadora}</DataRow>
        <DataRow label="Ejecutivo solicitante">{s.ejecutivoSolicitante}</DataRow>
      </Section>

      <Separator />

      <Section title="Datos de la propiedad">
        <DataRow label="Dirección">{s.direccion}</DataRow>
        <DataRow label="Región">{s.region}</DataRow>
        <DataRow label="Comuna">{s.comuna}</DataRow>
        <DataRow label="Tipo de propiedad">{s.tipoPropiedad}</DataRow>
        <DataRow label="Valor estimado (UF)">{s.montoUf}</DataRow>
      </Section>

      <Separator />

      <Section title="Solicitante final">
        <DataRow label="Nombre completo">{s.propietario}</DataRow>
        <DataRow label="RUT">{s.rut}</DataRow>
        <DataRow label="Teléfono">{s.telefono}</DataRow>
        <DataRow label="Email">{s.email}</DataRow>
      </Section>

      <Separator />

      <Section title="Producto y observaciones">
        <DataRow label="Producto">{s.producto}</DataRow>
        <div className="col-span-1 flex flex-col gap-0.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground">Observaciones</span>
          <p className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
            {s.observaciones || "—"}
          </p>
        </div>
      </Section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Documentos requeridos
        </h2>
        <p className="text-xs text-muted-foreground">
          Catálogo vigente al momento de crear la solicitud. Airtable aún no
          vincula cada adjunto a un documento específico del catálogo
          (decisión pendiente, ver <code>docs/schema-airtable.md</code> §8) —
          se muestra el catálogo de referencia y, por separado, los adjuntos
          que la ejecutiva marcó como parte del checklist obligatorio.
        </p>
        <ul className="flex flex-col gap-1.5">
          {tiposDocumento.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {t.nombre}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {t.entidad_emisora}
                </span>
              </div>
              {t.vigencia_dias != null && (
                <Badge variant="secondary" className="shrink-0 text-muted-foreground">
                  Vigencia {t.vigencia_dias} días
                </Badge>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Marcados como requeridos en este expediente ({adjuntosRequeridos.length})
          </span>
          {adjuntosLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : adjuntosRequeridos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ningún adjunto marcado todavía.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {adjuntosRequeridos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate text-foreground">{a.nombre}</span>
                  {a.urlDropbox ? (
                    <a
                      href={a.urlDropbox}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-medium text-brand hover:underline"
                    >
                      Ver enlace
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Sin enlace
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Adjuntos
        </h2>
        <p className="text-sm text-foreground">
          {adjuntosLoading
            ? "Cargando…"
            : `${adjuntos.length} adjunto${adjuntos.length === 1 ? "" : "s"} en el expediente`}{" "}
          <span className="text-muted-foreground">— ver pestaña Adjuntos.</span>
        </p>
      </section>

      <Separator />

      <Section title="Asignación y gestión">
        <DataRow label="Tasador asignado">{s.tasador}</DataRow>
        <DataRow label="Visador">{s.visador}</DataRow>
        <DataRow label="Fecha estimada de visita">{s.fechaVisita}</DataRow>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Prioridad</span>
          <PriorityChip prioridad={s.prioridad} className="w-fit" />
        </div>
        <DataRow label="Ejecutiva asignada">{s.ejecutivaAsignada}</DataRow>
        <DataRow label="Notas para el tasador">{s.notasTasador}</DataRow>
        <DataRow label="Notas para el visador">{s.notasVisador}</DataRow>
        <div className="col-span-1 flex flex-col gap-0.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground">
            Observaciones internas
          </span>
          <p className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
            {s.observaciones || "—"}
          </p>
        </div>
      </Section>
    </div>
  )
}

function HistorialTab({
  eventos,
  loading,
  error,
}: {
  eventos: Evento[]
  loading: boolean
  error: boolean
}) {
  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Cargando historial…
      </p>
    )
  }

  if (error) {
    return (
      <p className="py-6 text-center text-sm text-destructive">
        No pudimos completar la acción. Intenta nuevamente en unos segundos.
      </p>
    )
  }

  if (eventos.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sin eventos registrados todavía.
      </p>
    )
  }

  return (
    <ol className="flex flex-col">
      {eventos.map((ev, idx) => {
        const Icon = historialIcons[ev.icono]
        const last = idx === eventos.length - 1
        return (
          <li key={ev.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                <Icon className="size-4" />
              </span>
              {!last && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className="flex flex-col gap-0.5 pb-6">
              <p className="text-sm leading-snug text-foreground">
                {ev.titulo}
              </p>
              <span className="text-xs text-muted-foreground">{ev.hace}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

interface SubidaDirectaItem {
  id: string
  file: File
  nombre: string
  tamanioKb: number
  progreso: number
  error?: string
  controller: AbortController
}

function AdjuntosTab({
  solicitud,
  adjuntos,
  loading,
  error,
  onSubido,
}: {
  solicitud: Solicitud
  adjuntos: Adjunto[]
  loading: boolean
  error: boolean
  onSubido: (nuevo: Adjunto) => void
}) {
  const [subiendo, setSubiendo] = React.useState<SubidaDirectaItem[]>([])

  function subirArchivo(file: File) {
    const id = `${file.name}-${file.size}-${Date.now()}`
    const controller = new AbortController()
    setSubiendo((prev) => [
      ...prev,
      {
        id,
        file,
        nombre: file.name,
        tamanioKb: Math.round(file.size / 1024),
        progreso: 0,
        controller,
      },
    ])

    void uploadConReintentos({
      file,
      solicitud_id: solicitud.id,
      codigo_ext: solicitud.codigoExt,
      signal: controller.signal,
      onProgress: (pct) =>
        setSubiendo((prev) =>
          prev.map((it) => (it.id === id ? { ...it, progreso: pct } : it))
        ),
    }).then((resultado) => {
      if (resultado.ok) {
        setSubiendo((prev) => prev.filter((it) => it.id !== id))
        onSubido({
          id: String(resultado.adjunto_id ?? id),
          nombre: resultado.nombre_archivo ?? file.name,
          tipo: "—",
          detalle: "subido hace unos segundos",
          urlDropbox: resultado.url_dropbox ?? "",
          requeridoPorEjecutiva: false,
        })
        toast.success("Documento subido correctamente.", { duration: 3000 })
      } else if (resultado.error === "Subida cancelada.") {
        setSubiendo((prev) => prev.filter((it) => it.id !== id))
      } else {
        setSubiendo((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, error: resultado.error ?? "No se pudo subir." } : it
          )
        )
      }
    })
  }

  function reintentar(id: string) {
    const item = subiendo.find((it) => it.id === id)
    if (!item) return
    setSubiendo((prev) =>
      prev.map((it) => (it.id === id ? { ...it, error: undefined, progreso: 0 } : it))
    )
    subirArchivo(item.file)
    setSubiendo((prev) => prev.filter((it) => it.id !== id))
  }

  function cancelar(id: string) {
    subiendo.find((it) => it.id === id)?.controller.abort()
    setSubiendo((prev) => prev.filter((it) => it.id !== id))
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plus className="size-4" />
          <h2 className="text-xs font-semibold tracking-wide uppercase">
            Subir nuevos adjuntos
          </h2>
        </div>
        <FileUploadZone value={[]} onFilesChange={(files) => files.forEach(subirArchivo)} />

        {subiendo.length > 0 && (
          <ul className="flex flex-col gap-2">
            {subiendo.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-3 rounded-lg border bg-card p-3 ${
                  item.error ? "border-destructive/60" : "border-border"
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                    item.error
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.error ? <AlertCircle className="size-4" /> : <FileText className="size-4" />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.nombre}
                  </span>
                  {item.error ? (
                    <span className="text-xs font-medium text-destructive">{item.error}</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Progress value={item.progreso} className="flex-1" />
                      <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                        {item.progreso}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {item.error && (
                    <Button variant="outline" size="sm" onClick={() => reintentar(item.id)}>
                      <RotateCcw data-icon="inline-start" />
                      Reintentar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Cancelar"
                    onClick={() => cancelar(item.id)}
                  >
                    <X />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Documentos del expediente ({adjuntos.length})
        </h2>

        {loading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Cargando adjuntos…
          </p>
        )}

        {!loading && error && (
          <p className="py-4 text-center text-sm text-destructive">
            No pudimos completar la acción. Intenta nuevamente en unos segundos.
          </p>
        )}

        {!loading && !error && adjuntos.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sin documentos adjuntos todavía.
          </p>
        )}

        {!loading && !error && adjuntos.length > 0 && (
          <ul className="flex flex-col gap-2">
            {adjuntos.map((a) => {
              const isPdf = a.nombre.toLowerCase().endsWith(".pdf")
              const Icon = isPdf ? FileText : ImageIcon
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {a.nombre}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {a.tipo} · {a.detalle}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!a.urlDropbox}
                    render={
                      a.urlDropbox ? (
                        <a
                          href={a.urlDropbox}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ) : undefined
                    }
                  >
                    <Download data-icon="inline-start" />
                    Descargar
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
