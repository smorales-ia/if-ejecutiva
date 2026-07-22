"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  FolderOpen,
  ImageIcon,
  Info,
  Mail,
  PlusCircle,
  RotateCcw,
  UserCog,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  PriorityChip,
  SLABadge,
  StateBadge,
} from "@/components/console/status-badges"
import {
  ReasignarTasadorDialog,
  type ModoAsignacion,
} from "@/components/console/reasignar-tasador-dialog"
import { DocumentosAdjuntosSheet } from "@/components/console/documentos-adjuntos-sheet"
import { cn } from "@/lib/utils"
import {
  ESTADO_CORREO_CLASSES,
  ESTADO_CORREO_LABELS,
  HISTORIAL,
  mockAntecedentesLegales,
  mockDatosSii,
  mockDecisionMotor,
  mockEmailAsignacion,
  mockVersionesInforme,
  type EstadoCorreo,
  type EstadoSolicitud,
  type EventoHistorial,
  type Solicitud,
} from "@/lib/console-data"

const historialIcons = {
  check: CheckCircle2,
  plus: PlusCircle,
  alert: AlertTriangle,
  eye: Eye,
  mail: Mail,
  upload: Download,
}

const SIN_TASADOR = "Sin asignar"

/** Evalúa RN-44: datos mínimos para poder asignar tasador. */
function datosMinimosFaltantes(s: Solicitud): string[] {
  const faltan: string[] = []
  if (!s.direccion || s.direccion.trim() === "") faltan.push("Dirección de la propiedad")
  const hayContactoConTelefono = s.contactosVisita.some(
    (c) => c.telefono && c.telefono.trim() !== "",
  )
  if (!hayContactoConTelefono)
    faltan.push("Al menos un contacto de visita con teléfono")

  const esNuevo = s.tipoPropiedadNuevoUsado === "nuevo"
  const rolPendiente = s.unidades.some(
    (u) => u.conRol && !u.rolSii && !(u.rolEnTramite && esNuevo),
  )
  if (s.unidades.length === 0 || rolPendiente)
    faltan.push(
      esNuevo
        ? "Rol SII de cada unidad (o marca “En trámite”)"
        : "Rol SII de cada unidad con rol",
    )
  return faltan
}

export function SolicitudDetail({ solicitud }: { solicitud: Solicitud }) {
  const s = solicitud

  // Estado local que se refresca tras asignar/reasignar o consultar.
  const [tasador, setTasador] = React.useState(s.tasador)
  const [estado, setEstado] = React.useState<EstadoSolicitud>(s.estado)
  const [estadoCorreo, setEstadoCorreo] = React.useState<EstadoCorreo>(
    s.estadoCorreo ?? "pendiente",
  )
  const [fechaAsignacion, setFechaAsignacion] = React.useState(
    s.fechaAsignacion ?? "",
  )
  const [historialExtra, setHistorialExtra] = React.useState<EventoHistorial[]>(
    [],
  )
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [docsOpen, setDocsOpen] = React.useState(false)
  const [emailOpen, setEmailOpen] = React.useState(false)

  // Resetea el estado local cuando cambia la solicitud seleccionada.
  const prevId = React.useRef(s.id)
  if (prevId.current !== s.id) {
    prevId.current = s.id
    setTasador(s.tasador)
    setEstado(s.estado)
    setEstadoCorreo(s.estadoCorreo ?? "pendiente")
    setFechaAsignacion(s.fechaAsignacion ?? "")
    setHistorialExtra([])
    setDialogOpen(false)
    setDocsOpen(false)
  }

  const tieneTasador = tasador !== SIN_TASADOR && tasador.trim() !== ""
  const mode: ModoAsignacion = tieneTasador ? "reasignar" : "asignar"
  const estadoPermite = estado !== "cancelada" && estado !== "cerrada"
  // RN-59: modo consulta cuando ya no está "creada" y hay tasador.
  const soloLectura = estado !== "creada" && tieneTasador
  const faltantes = datosMinimosFaltantes(s)
  const puedeAsignar = faltantes.length === 0

  function handleConfirmado(nuevo: string, motivo: string) {
    const anterior = tieneTasador ? tasador : ""
    const ahora = new Date().toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    setTasador(nuevo)
    if (estado === "creada") setEstado("asignada")
    setFechaAsignacion(ahora)
    setEstadoCorreo("enviado")

    const esReasig = anterior !== ""
    setHistorialExtra((prev) => [
      {
        id: `email-${Date.now()}`,
        titulo: `Correo de ${
          esReasig ? "reasignación" : "asignación"
        } enviado al tasador · Asunto: Nueva asignación ${s.codigoExt}`,
        hace: "hace unos segundos",
        icono: "mail",
        detalle: mockEmailAsignacion(s, nuevo),
      },
      {
        id: `asig-${Date.now()}`,
        titulo: esReasig
          ? `Reasignación manual · ${anterior} → ${nuevo}${
              motivo ? ` · Motivo: ${motivo}` : ""
            } · por María Espinoza`
          : `Asignación manual de tasador · ${nuevo}${
              motivo ? ` · Nota: ${motivo}` : ""
            } · por María Espinoza`,
        hace: "hace unos segundos",
        icono: "check",
      },
      ...prev,
    ])

    toast.success(
      esReasig
        ? `Solicitud reasignada a ${nuevo}.`
        : `Solicitud asignada a ${nuevo}.`,
      { duration: 3500 },
    )
  }

  function reenviarCorreo() {
    setEstadoCorreo("enviado")
    setHistorialExtra((prev) => [
      {
        id: `reenvio-${Date.now()}`,
        titulo: `Reenvío de correo de asignación a ${tasador}`,
        hace: "hace unos segundos",
        icono: "mail",
        detalle: mockEmailAsignacion(s, tasador),
      },
      ...prev,
    ])
    toast.success("Correo reenviado al tasador.", { duration: 3000 })
  }

  const historialCompleto = [...historialExtra, ...HISTORIAL]

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Detail header */}
      <div className="flex flex-col gap-3 border-b border-border bg-card px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {s.codigoExt}
          </h1>
          <StateBadge estado={estado} />
          <SLABadge dias={s.slaDias} total={s.slaTotal} />
          <PriorityChip prioridad={s.prioridad} />
        </div>
        <p className="text-xs text-muted-foreground">
          Modificado {s.modificado} por {s.modificadoPor}
        </p>

        {/* Action bar — exactamente 2 botones */}
        <div className="flex flex-wrap items-center gap-2">
          {mode === "asignar" ? (
            <AssignPrimaryButton
              disabled={!puedeAsignar}
              faltantes={faltantes}
              onClick={() => setDialogOpen(true)}
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={!estadoPermite}
              onClick={() => setDialogOpen(true)}
            >
              <UserCog data-icon="inline-start" />
              Reasignar Tasador
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setDocsOpen(true)}
          >
            <FolderOpen data-icon="inline-start" />
            Documentos y Adjuntos
          </Button>
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
              tasador={tasador}
              estado={estado}
              estadoCorreo={estadoCorreo}
              fechaAsignacion={fechaAsignacion}
              soloLectura={soloLectura}
              onVerEmail={() => setEmailOpen(true)}
              onReenviar={reenviarCorreo}
            />
          </TabsContent>
          <TabsContent value="historial">
            <HistorialTab eventos={historialCompleto} />
          </TabsContent>
          <TabsContent value="adjuntos">
            <AdjuntosTab solicitud={s} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Diálogo de asignación / reasignación */}
      <ReasignarTasadorDialog
        mode={mode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        solicitud={s}
        actual={tieneTasador ? tasador : ""}
        onConfirmado={handleConfirmado}
      />

      {/* Sheet lateral de documentos y adjuntos */}
      <DocumentosAdjuntosSheet
        open={docsOpen}
        onOpenChange={setDocsOpen}
        solicitud={{ ...s, estado }}
      />

      {/* Visor del correo de asignación (SC13) */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Correo de asignación</DialogTitle>
            <DialogDescription>
              Vista previa del correo enviado al tasador (SC13).
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {mockEmailAsignacion(s, tieneTasador ? tasador : "el tasador")}
          </pre>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                reenviarCorreo()
                setEmailOpen(false)
              }}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <RotateCcw data-icon="inline-start" />
              Reenviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AssignPrimaryButton({
  disabled,
  faltantes,
  onClick,
}: {
  disabled: boolean
  faltantes: string[]
  onClick: () => void
}) {
  if (!disabled) {
    return (
      <Button
        size="sm"
        onClick={onClick}
        className="bg-brand text-brand-foreground hover:bg-brand/90"
      >
        <UserPlus data-icon="inline-start" />
        Asignar Tasador
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
              disabled
              className="pointer-events-none bg-brand text-brand-foreground"
            >
              <UserPlus data-icon="inline-start" />
              Asignar Tasador
            </Button>
          </span>
        }
      />
      <TooltipContent className="max-w-xs">
        <p className="mb-1 font-medium">Faltan datos mínimos (RN-44):</p>
        <ul className="list-disc pl-4">
          {faltantes.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}

function Section({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h2>
        {action}
      </div>
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
  estado,
  estadoCorreo,
  fechaAsignacion,
  soloLectura,
  onVerEmail,
  onReenviar,
}: {
  solicitud: Solicitud
  tasador: string
  estado: EstadoSolicitud
  estadoCorreo: EstadoCorreo
  fechaAsignacion: string
  soloLectura: boolean
  onVerEmail: () => void
  onReenviar: () => void
}) {
  const esNuevo = s.tipoPropiedadNuevoUsado === "nuevo"
  const sii = mockDatosSii(s)
  const legales = mockAntecedentesLegales(s)
  const motor = mockDecisionMotor(s)
  const tieneTasador = tasador !== SIN_TASADOR && tasador.trim() !== ""

  return (
    <div className="flex flex-col gap-6">
      {soloLectura && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-[#d97706]" />
          <p className="text-sm text-[#92400e]">
            Solicitud asignada. Para modificar datos, reasigna el tasador.
          </p>
        </div>
      )}

      <Section title="Cliente y tipo">
        <DataRow label="Cliente">{s.cliente}</DataRow>
        <DataRow label="Tipo de informe">{s.tipoInforme}</DataRow>
        <DataRow label="Tipo de propiedad">
          {s.tipoPropiedad} · {esNuevo ? "Nuevo" : "Usado"}
        </DataRow>
        <DataRow label="Banco">{s.banco}</DataRow>
        <DataRow label="Producto">{s.producto}</DataRow>
        <DataRow label="Canal de origen">{s.canal}</DataRow>
      </Section>

      <Separator />

      <Section title="Propiedad">
        {s.proyecto && (
          <DataRow label="Proyecto o condominio">{s.proyecto}</DataRow>
        )}
        <DataRow label="Dirección">{s.direccion}</DataRow>
        <DataRow label="Comuna">{s.comuna}</DataRow>
        <DataRow label="Región">{s.region}</DataRow>
        <DataRow label="Estado de conservación">
          {s.estadoConservacion ?? "—"}
        </DataRow>
      </Section>

      <Separator />

      <Section title="Comprador (cliente final evaluado)">
        <DataRow label="Nombre">{s.comprador.nombre}</DataRow>
        <DataRow label="RUT">{s.comprador.rut}</DataRow>
        <DataRow label="Email">{s.comprador.email}</DataRow>
        <DataRow label="Teléfono">{s.comprador.telefono}</DataRow>
      </Section>

      <Separator />

      <Section title="Vendedor">
        {s.vendedor.esInmobiliaria ? (
          <>
            <DataRow label="Razón social">{s.vendedor.razonSocial}</DataRow>
            <DataRow label="RUT inmobiliaria">
              {s.vendedor.rutInmobiliaria}
            </DataRow>
          </>
        ) : (
          <>
            <DataRow label="Nombre">{s.vendedor.nombre}</DataRow>
            <DataRow label="RUT">{s.vendedor.rut}</DataRow>
          </>
        )}
        <DataRow label="Correo">{s.vendedor.correo}</DataRow>
        <DataRow label="Teléfono">{s.vendedor.telefono}</DataRow>
        <DataRow label="Origen del dato">{s.vendedor.origenDato}</DataRow>
      </Section>

      <Separator />

      {/* Unidades (tabla) */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Unidades ({s.unidades.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Ubicación</th>
                <th className="px-3 py-2 font-medium">Tipo de bien</th>
                <th className="px-3 py-2 font-medium">Rol SII</th>
                <th className="px-3 py-2 font-medium text-right">Constr. m²</th>
                <th className="px-3 py-2 font-medium text-right">Terraza</th>
                <th className="px-3 py-2 font-medium text-right">Terreno</th>
                <th className="px-3 py-2 font-medium">Año</th>
                <th className="px-3 py-2 font-medium">Material</th>
                <th className="px-3 py-2 font-medium">Origen</th>
                <th className="px-3 py-2 font-medium">Respaldo</th>
              </tr>
            </thead>
            <tbody>
              {s.unidades.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium text-foreground">
                    {u.ubicacion}
                  </td>
                  <td className="px-3 py-2 text-foreground">{u.tipoBien}</td>
                  <td className="px-3 py-2 text-foreground">
                    {u.conRol
                      ? u.rolEnTramite
                        ? "En trámite"
                        : u.rolSii || "—"
                      : "Uso y goce"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">
                    {u.supConstruida}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {u.supTerraza ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {u.supTerreno ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {u.anioConstruccion}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {u.material}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {u.origenSuperficie}
                  </td>
                  <td className="px-3 py-2">
                    {u.respaldo ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-brand hover:underline"
                      >
                        <FileText className="size-3.5" />
                        <span className="max-w-32 truncate">{u.respaldo}</span>
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Contactos de visita */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Contactos de visita ({s.contactosVisita.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {s.contactosVisita.map((c, idx) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-card p-3"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {c.nombre}
                </span>
                {idx === 0 && (
                  <Badge className="bg-brand/10 text-brand">Principal</Badge>
                )}
              </span>
              <span className="text-xs text-muted-foreground">{c.rol}</span>
              <span className="text-xs text-foreground">{c.telefono}</span>
              <span className="text-xs text-muted-foreground">{c.email}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "ml-auto",
                  c.estado !== "Válido" && "text-[#b45309]",
                )}
              >
                {c.estado}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      {/* Asignación */}
      <Section
        title="Asignación"
        action={
          tieneTasador ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onVerEmail}>
                <Mail data-icon="inline-start" />
                Ver email enviado
              </Button>
              <Button variant="ghost" size="sm" onClick={onReenviar}>
                <RotateCcw data-icon="inline-start" />
                Reenviar
              </Button>
            </div>
          ) : undefined
        }
      >
        <DataRow label="Tasador asignado">
          {tieneTasador ? (
            <span className="inline-flex items-center gap-2">
              {tasador}
              <Badge className="bg-indigo-50 text-indigo-700">Asignado</Badge>
            </span>
          ) : (
            <span className="text-muted-foreground">Sin asignar</span>
          )}
        </DataRow>
        <DataRow label="Fecha y hora de asignación">
          {fechaAsignacion || "—"}
        </DataRow>
        <DataRow label="Estado del correo">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium",
              ESTADO_CORREO_CLASSES[estadoCorreo],
            )}
          >
            {ESTADO_CORREO_LABELS[estadoCorreo]}
          </span>
        </DataRow>
      </Section>

      <Separator />

      {/* Datos SII */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Datos SII
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <DataRow label="Destino principal">{sii.destinoPrincipal}</DataRow>
          <DataRow label="Avalúo fiscal total">{sii.avaluoTotal}</DataRow>
          <DataRow label="Contribución anual">{sii.contribucionAnual}</DataRow>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Unidad</th>
                <th className="px-3 py-2 font-medium">Destino</th>
                <th className="px-3 py-2 font-medium">Código SII</th>
                <th className="px-3 py-2 font-medium text-right">Avalúo fiscal</th>
              </tr>
            </thead>
            <tbody>
              {sii.unidades.map((u) => (
                <tr key={u.unidadId} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{u.ubicacion}</td>
                  <td className="px-3 py-2 text-muted-foreground">{u.destino}</td>
                  <td className="px-3 py-2 text-muted-foreground">{u.codigoSii}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">
                    {u.avaluoFiscal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Antecedentes legales */}
      <Section title="Antecedentes legales">
        <DataRow label="Permiso de edificación">
          {legales.permisoEdificacion}
        </DataRow>
        <DataRow label="Fecha del permiso">{legales.fechaPermiso}</DataRow>
        <DataRow label="Recepción final">{legales.recepcionFinal}</DataRow>
        <DataRow label="Fojas">{legales.fojas}</DataRow>
        <DataRow label="N° inscripción">{legales.numeroInscripcion}</DataRow>
        <DataRow label="Año inscripción">{legales.anioInscripcion}</DataRow>
      </Section>

      {/* Financiero — sólo en propiedades nuevas */}
      {esNuevo && s.financiero && (
        <>
          <Separator />
          <Section title="Financiero">
            <DataRow label="Valor total UF">
              {s.financiero.valorTotalUf ?? "—"}
            </DataRow>
            <DataRow label="Precio de venta">
              {s.financiero.precioVenta ?? "—"}
            </DataRow>
            <DataRow label="Subsidio">{s.financiero.subsidio ?? "—"}</DataRow>
            <DataRow label="Ahorro">{s.financiero.ahorro ?? "—"}</DataRow>
            <DataRow label="Mutuo hipotecario">
              {s.financiero.mutuo ?? "—"}
            </DataRow>
            <DataRow label="Pago contado">
              {s.financiero.pagoContado ?? "—"}
            </DataRow>
            <DataRow label="Bono captación">
              {s.financiero.bonoCaptacion ?? "—"}
            </DataRow>
            <DataRow label="Bono integración">
              {s.financiero.bonoIntegracion ?? "—"}
            </DataRow>
          </Section>
        </>
      )}

      <Separator />

      {/* Decisión del motor */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Decisión del motor de asignación
        </h2>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-sm font-medium text-foreground">
            {motor.reglaGanadora}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {motor.descripcion}
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Reglas candidatas descartadas
            </span>
            {motor.candidatasDescartadas.map((c) => (
              <div
                key={c.regla}
                className="flex flex-wrap items-center gap-x-2 text-xs"
              >
                <span className="font-medium text-foreground">{c.regla}</span>
                <span className="text-muted-foreground">· {c.motivo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Observaciones
        </h2>
        <p className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
          {s.observaciones}
        </p>
      </section>

      <span className="sr-only">{`Estado actual: ${estado}`}</span>
    </div>
  )
}

function HistorialTab({ eventos }: { eventos: EventoHistorial[] }) {
  return (
    <ol className="flex flex-col">
      {eventos.map((ev, idx) => (
        <HistorialItem
          key={ev.id}
          evento={ev}
          last={idx === eventos.length - 1}
        />
      ))}
    </ol>
  )
}

function HistorialItem({
  evento: ev,
  last,
}: {
  evento: EventoHistorial
  last: boolean
}) {
  const [abierto, setAbierto] = React.useState(false)
  const Icon = historialIcons[ev.icono]
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <Icon className="size-4" />
        </span>
        {!last && <span className="w-px flex-1 bg-border" />}
      </div>
      <div className="flex flex-col gap-0.5 pb-6">
        <p className="text-sm leading-snug text-foreground">{ev.titulo}</p>
        <span className="text-xs text-muted-foreground">{ev.hace}</span>
        {ev.detalle && (
          <>
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  abierto && "rotate-180",
                )}
              />
              {abierto ? "Ocultar correo" : "Ver correo"}
            </button>
            {abierto && (
              <pre className="mt-2 max-w-xl overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                {ev.detalle}
              </pre>
            )}
          </>
        )}
      </div>
    </li>
  )
}

function AdjuntosTab({ solicitud: s }: { solicitud: Solicitud }) {
  const versiones = mockVersionesInforme(s)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Vista de sólo lectura, agrupada por versión del informe. Para cargar
          documentos usa <strong>Documentos y Adjuntos</strong> en la barra de
          acciones.
        </p>
      </div>

      {versiones.map((v) => (
        <section
          key={v.numero}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-brand/10 text-brand">
                Versión {v.numero}
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {v.valorUf}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{v.fechaEnvio}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Motivo del cambio: {v.motivoCambio}
          </p>
          <ul className="flex flex-col gap-2">
            {v.archivos.map((a) => {
              const Icon = a.esImagen ? ImageIcon : FileText
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {a.nombre}
                  </span>
                  <Button variant="outline" size="sm">
                    <Download data-icon="inline-start" />
                    Descargar
                  </Button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
