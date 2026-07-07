"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  ImageIcon,
  Pause,
  Pencil,
  Plus,
  PlusCircle,
  UserCog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  FileUploadZone,
  type ArchivoSubido,
} from "@/components/console/file-upload-zone"
import { ReasignarTasadorDialog } from "@/components/console/reasignar-tasador-dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PriorityChip,
  SLABadge,
  StateBadge,
} from "@/components/console/status-badges"
import type { Solicitud } from "@/lib/console-data"
import type { Evento, IconoEvento } from "@/lib/eventos"
import type { Adjunto } from "@/lib/adjuntos"

const historialIcons: Record<IconoEvento, typeof CheckCircle2> = {
  check: CheckCircle2,
  plus: PlusCircle,
  alert: AlertTriangle,
  eye: Eye,
}

/** Item local optimista, agregado antes de que el próximo fetch lo confirme. */
type AdjuntoLocal = Adjunto & { urlDropbox: string }

export function SolicitudDetail({ solicitud }: { solicitud: Solicitud }) {
  const s = solicitud
  const editable = s.estado !== "cancelada" && s.estado !== "cerrada"

  // Estado local que se refresca tras reasignar o adjuntar.
  const [tasador, setTasador] = React.useState(s.tasador)
  const [visador, setVisador] = React.useState(s.visador)
  const [historialExtra, setHistorialExtra] = React.useState<Evento[]>([])
  const [adjuntosExtra, setAdjuntosExtra] = React.useState<AdjuntoLocal[]>([])

  const [historialBase, setHistorialBase] = React.useState<Evento[]>([])
  const [historialLoading, setHistorialLoading] = React.useState(true)
  const [historialError, setHistorialError] = React.useState(false)

  const [adjuntosBase, setAdjuntosBase] = React.useState<Adjunto[]>([])
  const [adjuntosLoading, setAdjuntosLoading] = React.useState(true)
  const [adjuntosError, setAdjuntosError] = React.useState(false)

  // Resetea el estado local cuando cambia la solicitud seleccionada.
  const prevId = React.useRef(s.id)
  if (prevId.current !== s.id) {
    prevId.current = s.id
    setTasador(s.tasador)
    setVisador(s.visador)
    setHistorialExtra([])
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

  function handleReasignado(anterior: string, nuevo: string) {
    setTasador(nuevo)
    setHistorialExtra((prev) => [
      {
        id: `reasig-${prev.length}`,
        titulo: `Reasignación manual de tasador · ${
          anterior || "Sin asignar"
        } → ${nuevo} · por María Espinoza`,
        hace: "hace unos segundos",
        icono: "check",
      },
      ...prev,
    ])
  }

  function handleAdjuntos(nuevos: ArchivoSubido[]) {
    setAdjuntosExtra((prev) => [
      ...nuevos.map((n) => ({
        id: n.id,
        nombre: n.nombre,
        detalle: n.detalle,
        urlDropbox: "",
      })),
      ...prev,
    ])
  }

  const historialCompleto = [...historialExtra, ...historialBase]
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
        <p className="text-xs text-muted-foreground">
          Modificado {s.modificado} por {s.modificadoPor}
        </p>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton
            icon={Pencil}
            label="Editar"
            enabled={editable}
            primary
          />
          {editable ? (
            <ReasignarTasadorDialog
              role="tasador"
              solicitud={s}
              actual={tasador}
              onReasignado={handleReasignado}
            />
          ) : (
            <ActionButton
              icon={UserCog}
              label="Reasignar tasador"
              enabled={false}
            />
          )}
          <ActionButton label="Cambiar prioridad" enabled={editable} />
          <ActionButton icon={Pause} label="Pausar" enabled={editable} />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  Más opciones
                  <ChevronDown data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>Duplicar solicitud</DropdownMenuItem>
                <DropdownMenuItem>Exportar expediente</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  Cancelar solicitud
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <DatosTab solicitud={s} tasador={tasador} visador={visador} />
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
              adjuntos={adjuntosCompleto}
              loading={adjuntosLoading}
              error={adjuntosError}
              onUploaded={handleAdjuntos}
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
  enabled,
  primary,
}: {
  icon?: React.ComponentType
  label: string
  enabled: boolean
  primary?: boolean
}) {
  if (enabled) {
    return (
      <Button
        size="sm"
        variant={primary ? "default" : "outline"}
        className={
          primary
            ? "bg-brand text-brand-foreground hover:bg-brand/90"
            : undefined
        }
      >
        {Icon && <Icon data-icon="inline-start" />}
        {label}
      </Button>
    )
  }

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
      <TooltipContent>Bloqueado · estado no permite edición</TooltipContent>
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

function DatosTab({
  solicitud: s,
  tasador,
  visador,
}: {
  solicitud: Solicitud
  tasador: string
  visador: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Cliente y tipo">
        <DataRow label="Cliente">{s.cliente}</DataRow>
        <DataRow label="Tipo de informe">{s.tipoInforme}</DataRow>
        <DataRow label="Tipo de propiedad">{s.tipoPropiedad}</DataRow>
        <DataRow label="Banco">{s.banco}</DataRow>
        <DataRow label="Producto">{s.producto}</DataRow>
      </Section>

      <Separator />

      <Section title="Propiedad">
        <DataRow label="Dirección">{s.direccion}</DataRow>
        <DataRow label="Comuna">{s.comuna}</DataRow>
        <DataRow label="Región">{s.region}</DataRow>
        <DataRow label="Monto estimado">{s.montoUf}</DataRow>
      </Section>

      <Separator />

      <Section title="Propietario / Solicitante final">
        <DataRow label="Nombre">{s.propietario}</DataRow>
        <DataRow label="RUT">{s.rut}</DataRow>
        <DataRow label="Email">{s.email}</DataRow>
      </Section>

      <Separator />

      <Section title="Asignaciones">
        <DataRow label="Tasador">
          <span className="inline-flex items-center gap-2">
            {tasador}
            {tasador !== "Sin asignar" && (
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                Asignado
              </span>
            )}
          </span>
        </DataRow>
        <DataRow label="Visador">{visador}</DataRow>
        <DataRow label="Fecha visita">{s.fechaVisita}</DataRow>
      </Section>

      <Separator />

      <Section title="SLA">
        <DataRow label="SLA aplicable">{s.slaAplicable}</DataRow>
        <DataRow label="Fecha límite entrega">{s.fechaLimite}</DataRow>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Días restantes</span>
          <SLABadge dias={s.slaDias} total={s.slaTotal} className="w-fit" />
        </div>
      </Section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Observaciones
        </h2>
        <p className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
          {s.observaciones}
        </p>
      </section>
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

function AdjuntosTab({
  adjuntos,
  loading,
  error,
  onUploaded,
}: {
  adjuntos: Adjunto[]
  loading: boolean
  error: boolean
  onUploaded: (archivos: ArchivoSubido[]) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plus className="size-4" />
          <h2 className="text-xs font-semibold tracking-wide uppercase">
            Subir nuevos adjuntos
          </h2>
        </div>
        <FileUploadZone onUploaded={onUploaded} />
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
                      {a.detalle}
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
