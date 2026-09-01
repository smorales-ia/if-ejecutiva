"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Download,
  Eye,
  FileText,
  FolderOpen,
  ImageIcon,
  Info,
  Mail,
  Pencil,
  PhoneCall,
  PlusCircle,
  RotateCcw,
  UserPlus,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { AsignarTasadorDialog } from "@/components/console/asignar-tasador-dialog"
import { EditarSolicitudForm } from "@/components/console/editar-solicitud-form"
import { DocumentosAdjuntosSheet } from "@/components/console/documentos-adjuntos-sheet"
import { mapearEdicionSolicitud } from "@/lib/mappers/editar-solicitud"
import { cn } from "@/lib/utils"
import {
  ESTADO_CORREO_CLASSES,
  ESTADO_CORREO_LABELS,
  SLA_CLASSES,
  mockAntecedentesLegales,
  CANALES_ORIGEN,
  ESTADOS_CONSERVACION,
  ESTADOS_CONTACTO,
  ROLES_CONTACTO_VISITA,
  etiquetaCatalogo,
  mockDatosSii,
  mockEmailAsignacion,
  toneDeEtapa,
  type EstadoCorreo,
  type EstadoSolicitud,
  type SlaTone,
  type SlaTonoEtapa,
  type Solicitud,
} from "@/lib/console-data"
import {
  ETIQUETA_ESTADO,
  MSG_ERROR_CRONOLOGIA,
  MSG_SIN_CRONOLOGIA,
  etiquetaResponsable,
  mensajeAlertaEtapa,
  rangoEtapa,
  resumenTiempoEtapa,
  tieneCronologia,
  type EtapaCronologia,
} from "@/lib/sla-cronologia"
import {
  useCronologiaSla,
  type EstadoCronologia,
} from "@/lib/use-cronologia-sla"
import {
  MSG_ERROR_DECISION,
  MSG_SIN_DECISION,
} from "@/lib/decision-motor"
import {
  useDecisionMotor,
  type EstadoDecisionMotor,
} from "@/lib/use-decision-motor"
import {
  MSG_ERROR_COORDINACION,
  MSG_SIN_COORDINACION,
  resumirCoordinacion,
} from "@/lib/coordinacion"
import {
  useCoordinacionSolicitud,
  type EstadoCoordinacionUI,
} from "@/lib/use-coordinacion-solicitud"
import {
  MSG_ERROR_HISTORIAL,
  MSG_SIN_HISTORIAL,
  type IconoHistorial,
  type ItemHistorial,
} from "@/lib/historial"
import {
  useHistorialSolicitud,
  type EstadoHistorial,
} from "@/lib/use-historial-solicitud"
import {
  MSG_ERROR_VERSIONES,
  MSG_SIN_VERSIONES,
} from "@/lib/documentos-generados"
import {
  useVersionesInforme,
  type EstadoVersionesInforme,
} from "@/lib/use-versiones-informe"
import {
  useAdjuntosSolicitud,
  type EstadoAdjuntos,
} from "@/lib/use-adjuntos-solicitud"

const historialIcons: Record<
  IconoHistorial,
  React.ComponentType<{ className?: string }>
> = {
  check: CheckCircle2,
  plus: PlusCircle,
  alert: AlertTriangle,
  eye: Eye,
  mail: Mail,
  upload: Download,
  edit: Pencil,
  phone: PhoneCall,
}

const SIN_TASADOR = "Sin asignar"

/** Un id de /consola es un record id real de Airtable; el de la demo no. */
const ES_RECORD_ID = /^rec[a-zA-Z0-9]{14}$/

const MSG_RED =
  "No pudimos completar la acción. Intenta nuevamente en unos segundos."
const MSG_GUARDADO = "Cambios guardados en la solicitud."

/** Mismo literal que usa el sheet de documentos, para no decirlo de dos formas. */
const MSG_ERROR_ADJUNTOS =
  "No pudimos cargar los adjuntos de esta solicitud. Intenta nuevamente en unos segundos."

/**
 * `TX_Adjuntos.estado_extraccion` → etiqueta de pantalla (§4 · RF-09).
 *
 * Los siete valores son los del `singleSelect` real. Vive acá y no en
 * `lib/adjuntos.ts` porque es puramente de presentación y tiene un solo
 * consumidor: no hay ningún derivado de servidor con el que pudiera divergir.
 */
const EXTRACCION_LABELS: Record<string, string> = {
  idle: "Sin procesar",
  extrayendo: "Extrayendo datos",
  listo: "Datos extraídos",
  error: "Error de extracción",
  skipped: "Omitido",
  no_corresponde: "No corresponde",
  delegado_visador: "Delegado al visador",
}

function etiquetaExtraccion(valor: string): string {
  return EXTRACCION_LABELS[valor] ?? valor.replace(/_/g, " ")
}

/** Evalúa RN-44: datos mínimos para poder asignar tasador. */
function datosMinimosFaltantes(s: Solicitud): string[] {
  const faltan: string[] = []
  if (!s.direccion || s.direccion.trim() === "") faltan.push("Dirección de la propiedad")
  const hayContactoConTelefono = s.contactosVisita.some(
    (c) => c.telefono && c.telefono.trim() !== "",
  )
  if (!hayContactoConTelefono)
    faltan.push("Al menos un contacto de visita con teléfono")

  const esNuevo = s.tipoPropiedadNuevoUsado === "nueva"
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

  // Copia editable de los datos de negocio (mock en memoria).
  const router = useRouter()
  const [datos, setDatos] = React.useState<Solicitud>(s)
  const [editando, setEditando] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  const [tab, setTab] = React.useState("datos")

  // Estado local que se refresca tras asignar/reasignar o consultar.
  const [tasador, setTasador] = React.useState(s.tasador)
  const [estado, setEstado] = React.useState<EstadoSolicitud>(s.estado)
  const [estadoCorreo, setEstadoCorreo] = React.useState<EstadoCorreo>(
    s.estadoCorreo ?? "pendiente",
  )
  const [fechaAsignacion, setFechaAsignacion] = React.useState(
    s.fechaAsignacion ?? "",
  )
  // Entradas optimistas del historial: las que la UI muestra en el acto tras
  // asignar, antes de que SC-Asignar haya escrito sus filas en A_Eventos. Se
  // descartan solas en cuanto la relectura trae eventos de servidor iguales o
  // más nuevos — ver `historialCompleto`.
  const [historialExtra, setHistorialExtra] = React.useState<ItemHistorial[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [docsOpen, setDocsOpen] = React.useState(false)
  const [emailOpen, setEmailOpen] = React.useState(false)

  // Cronología de las siete etapas (RF-53 · E-2/E-3). Se lee de entrada, no al
  // abrir "Historial": el `Alert` de etapa desbordada va sobre las pestañas y
  // tiene que verse sin navegar. En la demo (`/`) el id no es un record id de
  // Airtable, así que no se dispara la lectura.
  const cronologiaSla = useCronologiaSla(s.id, ES_RECORD_ID.test(s.id))

  // Decisión del motor de reglas (AT01 · §5.1). Se lee junto al resto del
  // detalle y no al entrar a la pestaña Datos, que es donde se muestra: la
  // pestaña es la que abre por defecto, así que diferirlo sólo agregaría un
  // salto visual. En la demo (`/`) el id no es un record id y no se dispara.
  const decisionMotor = useDecisionMotor(s.id, ES_RECORD_ID.test(s.id))

  // Coordinación de la visita (RF-TAS-05 · §1.3.2). Se lee junto al resto del
  // detalle y no al entrar a la pestaña Datos, por el mismo motivo que la
  // decisión del motor: es la pestaña que abre por defecto. La fuente es
  // `TX_CoordinacionVisita` vía el endpoint de C2, **no**
  // `TX_Solicitudes.coordinacion_vigente`, que es redundancia del lado tasador.
  const coordinacion = useCoordinacionSolicitud(s.id, ES_RECORD_ID.test(s.id))

  // Timeline de §1.3.3: A_Eventos + A_Cambios reales. Sustituye al mock
  // `HISTORIAL` de `lib/console-data.ts`, que pintaba siempre los mismos tres
  // eventos de ejemplo en toda solicitud.
  const historial = useHistorialSolicitud(s.id, ES_RECORD_ID.test(s.id))

  // Pestaña Adjuntos (§1.3.4). Las dos lecturas se activan sólo con la pestaña
  // abierta: no alimentan ningún aviso fuera de ella, y `fetchAdjuntosPorSolicitud`
  // recorre la tabla entera en cada llamada, así que dispararla en cada
  // selección de la lista sería pagar caro por nada (ver la nota de 429 en
  // `app/api/solicitudes/[id]/adjuntos/route.ts`).
  const enAdjuntos = tab === "adjuntos" && ES_RECORD_ID.test(s.id)
  const adjuntosSolicitud = useAdjuntosSolicitud(s.id, enAdjuntos)
  const versionesInforme = useVersionesInforme(s.id, enAdjuntos)

  // Resetea el estado local cuando cambia la solicitud seleccionada.
  const prevId = React.useRef(s.id)
  if (prevId.current !== s.id) {
    prevId.current = s.id
    setDatos(s)
    setEditando(false)
    setGuardando(false)
    setTab("datos")
    setTasador(s.tasador)
    setEstado(s.estado)
    setEstadoCorreo(s.estadoCorreo ?? "pendiente")
    setFechaAsignacion(s.fechaAsignacion ?? "")
    setHistorialExtra([])
    setDialogOpen(false)
    setDocsOpen(false)
  }

  const tieneTasador = tasador !== SIN_TASADOR && tasador.trim() !== ""
  const estadoPermite = estado !== "cancelada" && estado !== "cerrada"
  // RN-59: modo consulta cuando ya no está "creada" y hay tasador.
  const soloLectura = estado !== "creada" && tieneTasador
  // La solicitud "creada" es totalmente editable por la ejecutiva.
  const puedeEditar = estado === "creada"
  const faltantes = datosMinimosFaltantes(datos)
  const puedeAsignar = faltantes.length === 0

  async function handleGuardarEdicion(actualizada: Solicitud) {
    if (guardando) return

    // Demo mock (/): el id no es un record id de Airtable → sólo estado local,
    // sin llamada de red. En /consola son ids reales y la edición se persiste
    // vía PATCH → SC-Edicion (E-078).
    if (!ES_RECORD_ID.test(s.id)) {
      setDatos(actualizada)
      setEditando(false)
      toast.success(MSG_GUARDADO, { duration: 3000 })
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`/api/solicitudes/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapearEdicionSolicitud(actualizada, s)),
      })

      // 202 = el Route Handler aceptó el payload pero no hay webhook
      // configurado: nada se persistió. No puede anunciarse como éxito.
      if (res.status === 202) {
        toast.warning(
          "Los cambios no se guardaron: falta configurar la conexión. Avisa al equipo.",
        )
        return
      }

      if (!res.ok) {
        toast.error(MSG_RED)
        return
      }
    } catch {
      toast.error(MSG_RED)
      return
    } finally {
      setGuardando(false)
    }

    setDatos(actualizada)
    setEditando(false)
    // El evento `datos_modificados` y las filas de A_Cambios las escribe
    // SC-Edicion; el historial se refresca desde el servidor, no se fabrica en
    // el cliente. `router.refresh()` recarga el Server Component (la lista y la
    // ficha); `historial.recargar()` relee el timeline, que es un fetch cliente
    // y por tanto no entra en ese refresh.
    router.refresh()
    historial.recargar()
    toast.success(MSG_GUARDADO, { duration: 3000 })
  }

  async function handleConfirmado(tasadorId: string, nuevo: string, nota: string) {
    // /consola: ids reales (recXXX) → dispara el POST real (hoy degrada a
    // pendiente_make porque Make no está provisionado). Demo mock (/): el id no
    // es record id → solo estado local, sin 404. router.refresh() se difiere a
    // P9: hoy refrescaría el registro sin cambios y borraría el update optimista.
    if (ES_RECORD_ID.test(s.id)) {
      try {
        const res = await fetch(`/api/solicitudes/${s.id}/asignar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasadorId, motivo: nota || undefined }),
        })
        // 202 = el handler aceptó el payload pero no hay webhook configurado:
        // nada se persistió. `res.ok` es true para cualquier 2xx, así que sin
        // este caso la UI marcaría la solicitud como asignada y haría
        // desaparecer el botón sobre una asignación que no ocurrió. Mismo
        // tratamiento que en `handleGuardarEdicion` (E-078).
        if (res.status === 202) {
          toast.warning(
            "La asignación no se guardó: falta configurar la conexión. Avisa al equipo.",
          )
          return
        }
        if (!res.ok) {
          toast.error(
            "No pudimos completar la acción. Intenta nuevamente en unos segundos.",
          )
          return
        }
      } catch {
        toast.error(
          "No pudimos completar la acción. Intenta nuevamente en unos segundos.",
        )
        return
      }
    }

    const instante = new Date()
    const ahora = instante.toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    const iso = instante.toISOString()
    setTasador(nuevo)
    if (estado === "creada") setEstado("asignada")
    setFechaAsignacion(ahora)
    setEstadoCorreo("enviado")

    setHistorialExtra((prev) => [
      {
        id: `email-${Date.now()}`,
        titulo: `Correo de asignación enviado al tasador · Asunto: Nueva asignación ${datos.codigoExt}`,
        timestamp: iso,
        hace: "hace unos segundos",
        origen: "evento",
        icono: "mail",
        detalle: mockEmailAsignacion(datos, nuevo),
      },
      {
        id: `asig-${Date.now()}`,
        titulo: `Asignación manual de tasador · ${nuevo}${
          nota ? ` · Nota: ${nota}` : ""
        }`,
        timestamp: iso,
        hace: "hace unos segundos",
        origen: "evento",
        icono: "check",
      },
      ...prev,
    ])

    // SC-Asignar escribe los dos eventos reales en A_Eventos. Se relee para
    // quedarse con esas filas —id y timestamp de servidor— en vez de con las
    // fabricadas acá, que desaparecen solas cuando la relectura las alcanza.
    historial.recargar()

    toast.success(`Solicitud asignada a ${nuevo}`, { duration: 3500 })
  }

  function reenviarCorreo() {
    setEstadoCorreo("enviado")
    setHistorialExtra((prev) => [
      {
        id: `reenvio-${Date.now()}`,
        titulo: `Reenvío de correo de asignación a ${tasador}`,
        timestamp: new Date().toISOString(),
        hace: "hace unos segundos",
        origen: "evento",
        icono: "mail",
        detalle: mockEmailAsignacion(datos, tasador),
      },
      ...prev,
    ])
    toast.success("Correo reenviado al tasador.", { duration: 3000 })
  }

  // Las entradas optimistas viven sólo hasta que el servidor confirma.
  //
  // `useHistorialSolicitud` devuelve la lista ordenada de más reciente a más
  // antigua, así que `items[0]` es el evento de servidor más nuevo. Si ese
  // instante alcanza al de una entrada optimista, las filas que SC-Asignar
  // escribió ya están leídas y mantener la copia fabricada en el navegador sólo
  // duplicaría el renglón. La regla es una comparación, no un temporizador: no
  // hay ventana que adivinar ni carrera que perder.
  const masNuevoDelServidor = historial.items[0]?.timestamp ?? ""
  const optimistasVigentes = historialExtra.filter(
    (e) => e.timestamp > masNuevoDelServidor,
  )
  const historialCompleto = [...optimistasVigentes, ...historial.items]

  // E-3 · Alerta de etapa desbordada.
  //
  // El tono es el que emitió `sla_semaforo_etapa` y llegó en `slaEtapa.tono`:
  // no se recalcula comparando `venceTs` contra el reloj del navegador, porque
  // eso sería un segundo semáforo que divergiría de la píldora y de la bandeja
  // (RO-05). El número, el nombre y el vencimiento salen de la misma fila; el
  // responsable es lo único que aporta la cronología, y por eso la alerta no
  // espera a que esa lectura termine: si degrada, el literal rojo sale sin la
  // frase del área en vez de no salir.
  const etapaEnCurso =
    s.slaEtapa && cronologiaSla.cronologia
      ? (cronologiaSla.cronologia.etapas.find(
          (e) => e.numero === s.slaEtapa?.numero,
        ) ?? null)
      : null
  const alertaEtapa = s.slaEtapa
    ? mensajeAlertaEtapa(s.slaEtapa.tono, {
        numero: s.slaEtapa.numero,
        nombre: s.slaEtapa.nombre,
        responsable: etapaEnCurso?.responsable ?? null,
        venceTs: s.slaEtapa.venceTs,
      })
    : null

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
          {/* D-4: la etapa acompaña al agregado, con la misma condición de
              render que en la bandeja — sin `slaEtapa` no se pinta nada, y
              `SLABadge` además descarta el tono `sin_dato`. */}
          {s.slaEtapa && <SLABadge etapa={s.slaEtapa} />}
        </div>
        <p className="text-xs text-muted-foreground">
          Modificado {s.modificado} por {s.modificadoPor}
        </p>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          {puedeEditar && !editando && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTab("datos")
                setEditando(true)
              }}
            >
              <Pencil data-icon="inline-start" />
              Editar solicitud
            </Button>
          )}

          {!tieneTasador && estadoPermite && (
            <AssignPrimaryButton
              disabled={!puedeAsignar}
              faltantes={faltantes}
              onClick={() => setDialogOpen(true)}
            />
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

      {/* E-3 · Etapa vigente en ámbar o rojo, sobre las pestañas. Los dos
          literales son los de §9.6.1 y se emiten sin variación. */}
      {alertaEtapa && (
        <div className="border-b border-border bg-card px-6 pb-4">
          <Alert variant={s.slaEtapa?.tono === "rojo" ? "destructive" : "warning"}>
            <AlertTriangle />
            <AlertDescription className="text-current">
              {alertaEtapa}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="min-h-0 flex-1 gap-0"
      >
        <div className="border-b border-border bg-card px-6">
          <TabsList variant="line" className="h-11">
            <TabsTrigger value="datos">Datos</TabsTrigger>
            <TabsTrigger value="historial" disabled={editando}>
              Historial
            </TabsTrigger>
            <TabsTrigger value="adjuntos" disabled={editando}>
              Adjuntos
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TabsContent value="datos">
            {editando ? (
              <EditarSolicitudForm
                solicitud={datos}
                onGuardar={handleGuardarEdicion}
                onCancelar={() => setEditando(false)}
                guardando={guardando}
              />
            ) : (
              <DatosTab
                solicitud={datos}
                tasador={tasador}
                estado={estado}
                estadoCorreo={estadoCorreo}
                fechaAsignacion={fechaAsignacion}
                soloLectura={soloLectura}
                motor={decisionMotor}
                coordinacion={coordinacion}
                onVerEmail={() => setEmailOpen(true)}
                onReenviar={reenviarCorreo}
              />
            )}
          </TabsContent>
          <TabsContent value="historial">
            <HistorialTab
              eventos={historialCompleto}
              estadoHistorial={historial}
              cronologia={cronologiaSla}
              tonoEtapaVigente={s.slaEtapa?.tono}
              numeroEtapaVigente={s.slaEtapa?.numero}
            />
          </TabsContent>
          <TabsContent value="adjuntos">
            <AdjuntosTab
              solicitud={datos}
              adjuntos={adjuntosSolicitud}
              versiones={versionesInforme}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Di��logo de asignación manual */}
      <AsignarTasadorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        solicitud={s}
        onConfirmado={handleConfirmado}
      />

      {/* Sheet lateral de documentos y adjuntos */}
      <DocumentosAdjuntosSheet
        open={docsOpen}
        onOpenChange={setDocsOpen}
        solicitud={{ ...datos, estado }}
        readOnly={soloLectura}
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
            {mockEmailAsignacion(datos, tieneTasador ? tasador : "el tasador")}
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
  motor,
  coordinacion,
  onVerEmail,
  onReenviar,
}: {
  solicitud: Solicitud
  tasador: string
  estado: EstadoSolicitud
  estadoCorreo: EstadoCorreo
  fechaAsignacion: string
  soloLectura: boolean
  motor: EstadoDecisionMotor
  coordinacion: EstadoCoordinacionUI
  onVerEmail: () => void
  onReenviar: () => void
}) {
  const esNuevo = s.tipoPropiedadNuevoUsado === "nueva"
  const sii = mockDatosSii(s)
  const legales = mockAntecedentesLegales(s)
  const tieneTasador = tasador !== SIN_TASADOR && tasador.trim() !== ""

  return (
    <div className="flex flex-col gap-6">
      {soloLectura && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-[#d97706]" />
          <p className="text-sm text-[#92400e]">
            Solicitud asignada. Los datos quedaron en modo consulta.
          </p>
        </div>
      )}

      {/* Identificación de la operación (D-02). Antes no se mostraba ninguno de
          estos campos: `mapRecord` no los leía, así que el detalle no podía
          conocerlos. El caso que lo destapó fue `n_operacion_cliente` — que el
          brief llamaba `numero_operacion`, nombre que no existe en el schema. */}
      <Section title="Operación">
        <DataRow label="N° de operación del cliente">
          {s.nOperacionCliente ?? "—"}
        </DataRow>
        <DataRow label="N° interno">{s.nroInterno ?? "—"}</DataRow>
        <DataRow label="N° de solicitud">{s.numeroSolicitud ?? "—"}</DataRow>
        <DataRow label="Sucursal originadora">
          {s.sucursalOriginadora ?? "—"}
        </DataRow>
        <DataRow label="Correo de referencia del cliente">
          {s.correoClienteRef ?? "—"}
        </DataRow>
        <DataRow label="Ejecutivo solicitante">{s.modificadoPor}</DataRow>
        <DataRow label="Ejecutivo formalizador">
          {s.ejecFormalizador ?? "—"}
        </DataRow>
        {/* El campo se creó el 30-jul-2026 (`ejecutivo_comercializador`,
            `fldDP232hBLsZ0PWJ`) y quedó editable y persistiéndose en la misma
            tanda, pero esta fila nunca se agregó: el dato se escribía en
            Airtable y la pantalla de lectura no lo mostraba. Simetría
            form/persist/read de §1.4. */}
        <DataRow label="Ejecutivo comercializador">
          {s.ejecutivoComercializador ?? "—"}
        </DataRow>
        <DataRow label="Modo de creación">{s.modoCreacion ?? "—"}</DataRow>
        <DataRow label="Tipo de cliente de origen">
          {s.tipoClienteOrigen ?? "—"}
        </DataRow>
        {/* `origen_canal` es de sólo lectura por definición: es por dónde entró
            la fila al sistema, no por dónde contactó el cliente (E-089). */}
        <DataRow label="Canal de ingreso">{s.origenCanal ?? "—"}</DataRow>
      </Section>

      <Separator />

      <Section title="Cliente y tipo">
        <DataRow label="Cliente">{s.cliente}</DataRow>
        <DataRow label="Tipo de informe">{s.tipoInforme}</DataRow>
        <DataRow label="Tipo de propiedad">
          {s.tipoPropiedad} · {esNuevo ? "Nueva" : "Usada"}
        </DataRow>
        <DataRow label="Banco">{s.banco}</DataRow>
        <DataRow label="Producto">{s.producto}</DataRow>
        {/* `monto_estimado_uf` (`fldKZW799xIqMFN1I`) se lee desde D-02
            (`mapRecord` vía `formatMontoUf`) y pasó a editable en V-3, pero
            ninguna vista lo mostraba. Va aquí, entre Producto y Canal, para
            espejar el orden del formulario de edición. */}
        <DataRow label="Monto estimado">{s.montoUf}</DataRow>
        <DataRow label="Canal de contacto">
          {etiquetaCatalogo(CANALES_ORIGEN, s.canal)}
        </DataRow>
      </Section>

      <Separator />

      <Section title="Propiedad">
        {/* Render incondicional: el resto del bloque muestra "—" cuando el dato
            falta, y esconder la fila hacía que un `proyecto_condominio` borrado
            fuera indistinguible de uno que nunca existió. */}
        <DataRow label="Proyecto o condominio">{s.proyecto ?? "—"}</DataRow>
        <DataRow label="Dirección">{s.direccion}</DataRow>
        <DataRow label="Comuna">{s.comuna}</DataRow>
        <DataRow label="Región">{s.region}</DataRow>
        <DataRow label="Estado de conservación">
          {etiquetaCatalogo(ESTADOS_CONSERVACION, s.estadoConservacion)}
        </DataRow>
        {/* Datos de propiedad a nivel de solicitud (D-02). No sustituyen a los
            de cada unidad en TX_Unidades: aquí viven los agregados que la
            Ejecutiva declara al dar de alta. */}
        <DataRow label="Rol SII">{s.rolSii ?? "—"}</DataRow>
        <DataRow label="Superficie de terreno">
          {s.supTerrenoM2 != null ? `${s.supTerrenoM2.toLocaleString("es-CL")} m²` : "—"}
        </DataRow>
        <DataRow label="Superficie construida">
          {s.supConstruccionM2 != null
            ? `${s.supConstruccionM2.toLocaleString("es-CL")} m²`
            : "—"}
        </DataRow>
        <DataRow label="Año de construcción">{s.anioConstruccion ?? "—"}</DataRow>
        <DataRow label="Valor comercial">
          {s.valorComercialUf != null
            ? `${s.valorComercialUf.toLocaleString("es-CL")} UF`
            : "—"}
        </DataRow>
        <DataRow label="Avalúo fiscal">
          {s.avaluoFiscalClp != null
            ? `$${s.avaluoFiscalClp.toLocaleString("es-CL")}`
            : "—"}
        </DataRow>
        <DataRow label="Origen del dato">{s.origenDato ?? "—"}</DataRow>
        <DataRow label="Origen de la dirección">{s.origenDireccion ?? "—"}</DataRow>
        <DataRow label="Velocidad de venta">{s.velocidadVenta ?? "—"}</DataRow>
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
        {s.contactosVisita.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
            Sin contactos de visita registrados
          </p>
        ) : (
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
                <span className="text-xs text-muted-foreground">
                  {etiquetaCatalogo(ROLES_CONTACTO_VISITA, c.rol)}
                </span>
                <span className="text-xs text-foreground">{c.telefono}</span>
                <span className="text-xs text-muted-foreground">{c.email}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-auto",
                    // El slug de Airtable es `valido`; la etiqueta con tilde es
                    // sólo de presentación. Comparar contra la etiqueta pintaba
                    // en ámbar a todos los contactos sanos.
                    c.estado !== "valido" && "text-[#b45309]",
                  )}
                >
                  {etiquetaCatalogo(ESTADOS_CONTACTO, c.estado)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
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

      {/* Coordinación de la visita (RF-TAS-05 · §1.3.2). Va pegada a
          "Asignación" a propósito: la coordinación es lo que ocurre justo
          después de asignar, y acá queda junto al tasador y a la fecha de
          asignación en vez de perdida entre los antecedentes legales. */}
      <CoordinacionSection estado={coordinacion} />

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

      <DecisionMotorSection estado={motor} />

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Observaciones
        </h2>
        <p className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
          {s.observaciones}
        </p>
        {s.notas && (
          <>
            {/* `notas` es un campo distinto de `observaciones_internas`: genérico,
                heredado del pipeline PDF. Sólo se muestra si trae algo, para no
                sumar una caja vacía al bloque. */}
            <span className="text-xs font-medium text-muted-foreground">
              Notas
            </span>
            <p className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
              {s.notas}
            </p>
          </>
        )}
      </section>

      <Separator />

      {/* Trazabilidad (D-02). Todo read-only por naturaleza: son campos que
          escriben Airtable (createdTime / lastModifiedTime / formulas) o los
          escenarios Make aguas abajo, nunca la Ejecutiva. */}
      <Section title="Trazabilidad">
        <DataRow label="Creada">{s.fechaCreacion ?? "—"}</DataRow>
        <DataRow label="Última modificación">
          {s.ultimaModificacion ?? "—"}
        </DataRow>
        <DataRow label="Días desde la solicitud">
          {s.diasDesdeSolicitud ?? "—"}
        </DataRow>
        <DataRow label="Fecha de visita realizada">
          {s.fechaVisitaReal ?? "—"}
        </DataRow>
        <DataRow label="Fecha de entrega">{s.fechaEntrega ?? "—"}</DataRow>
        <DataRow label="Fecha de cierre">{s.fechaCierre ?? "—"}</DataRow>
        <DataRow label="Pendientes de visador">
          {s.tienePendientesVisador ? "Sí" : "No"}
        </DataRow>
        <DataRow label="Informe PDF">
          {s.pdfFinalUrl ? (
            <a
              href={s.pdfFinalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#075899] underline underline-offset-2"
            >
              Abrir PDF
            </a>
          ) : (
            "—"
          )}
        </DataRow>
      </Section>

      <span className="sr-only">{`Estado actual: ${estado}`}</span>
    </div>
  )
}

/**
 * Decisión del motor de reglas (§5.1 · AT01 · RF-22 · RN-19).
 *
 * ## Por qué ya no dice "motor de asignación"
 *
 * El bloque se llamaba "Decisión del motor de asignación" y su mock hablaba de
 * cobertura territorial y balance de carga entre tasadores. Eso describía a
 * AT02, que **está fuera del alcance de IF-02** desde v1.9 (§1.6 · §6.2 · REGLA
 * A · D-15): en esta versión no hay asignación automática, la Ejecutiva asigna
 * a mano y una sola vez. Lo que AT01 sí decide es plantilla, fórmulas y
 * workflow — nunca un profesional. De ahí el nombre actual, que es el que usa
 * §5.1, y de ahí que aquí no se muestre ni tasador ni visador.
 *
 * ## Los tres estados no se colapsan
 *
 * "Todavía no evaluó" y "no pudimos leer" se ven iguales si se pintan iguales,
 * y significan cosas opuestas: la primera es el curso normal de una solicitud
 * recién creada, la segunda es un fallo que hay que reintentar.
 */
function DecisionMotorSection({ estado }: { estado: EstadoDecisionMotor }) {
  const { decision, cargando, error } = estado

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Decisión del motor de reglas
      </h2>

      {cargando && (
        <p className="text-sm text-muted-foreground">
          Cargando la decisión del motor…
        </p>
      )}

      {!cargando && error && (
        <p className="text-sm text-muted-foreground">{MSG_ERROR_DECISION}</p>
      )}

      {!cargando && !error && !decision && (
        <p className="text-sm text-muted-foreground">{MSG_SIN_DECISION}</p>
      )}

      {!cargando && !error && decision && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Regla aplicada</span>
            <p className="text-sm font-medium text-foreground">
              {decision.reglaGanadora}
            </p>
            <p className="text-sm text-muted-foreground">{decision.razon}</p>
          </div>

          {(decision.plantilla ||
            decision.workflow ||
            decision.formulas.length > 0) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <DataRow label="Plantilla del informe">
                  {decision.plantilla ?? "—"}
                </DataRow>
                <DataRow label="Flujo de trabajo">
                  {decision.workflow ?? "—"}
                </DataRow>
                <DataRow label="Fórmulas de cálculo">
                  {decision.formulas.length > 0
                    ? `${decision.formulas.length} fórmula${decision.formulas.length === 1 ? "" : "s"}`
                    : "—"}
                </DataRow>
              </div>
            </>
          )}

          {decision.candidatasDescartadas.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Reglas candidatas descartadas
                </span>
                {decision.candidatasDescartadas.map((c) => (
                  <div
                    key={c.nombre}
                    className="flex flex-wrap items-baseline gap-x-2 text-xs"
                  >
                    <span className="font-medium text-foreground">
                      {c.nombre}
                    </span>
                    <span className="text-muted-foreground">· {c.motivo}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {decision.evaluadaEl && (
            <p className="text-xs text-muted-foreground">
              Evaluada el {decision.evaluadaEl}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function CoordinacionSection({ estado }: { estado: EstadoCoordinacionUI }) {
  const { datos, cargando, error } = estado
  const r = resumirCoordinacion(datos)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Coordinación de la visita
        </h2>
        {!cargando && !error && (
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium",
              r.tonoClases,
            )}
          >
            {r.etiqueta}
          </span>
        )}
      </div>

      {cargando && (
        <p className="text-sm text-muted-foreground">
          Cargando la coordinación de la visita…
        </p>
      )}

      {/* Los tres desenlaces se pintan distinto (RO-34): "no pudimos leer" es un
          fallo que se reintenta y "todavía no se coordinó" es el curso normal de
          una solicitud recién asignada. Colapsarlos los volvería indistinguibles
          siendo operativamente opuestos. */}
      {!cargando && error && (
        <p className="text-sm text-muted-foreground">{MSG_ERROR_COORDINACION}</p>
      )}

      {!cargando && !error && r.variante === "sin_coordinar" && (
        <p className="text-sm text-muted-foreground">{MSG_SIN_COORDINACION}</p>
      )}

      {!cargando && !error && r.variante !== "sin_coordinar" && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {/* La rama confirmada muestra la fecha propuesta; la rechazada, el
                motivo. `resumirCoordinacion` ya dejó en "—" lo que no
                corresponde a la rama, así que acá no se decide nada. */}
            {r.variante === "confirmada" ? (
              <DataRow label="Fecha de visita propuesta">{r.fechaVisita}</DataRow>
            ) : (
              /* `motivo` es passthrough desde el singleSelect de Airtable: no hay
                 catálogo local que traducir (A-17), así que un motivo agregado
                 hoy en la base llega a esta fila sin deploy. */
              <DataRow label="Motivo">{r.motivo}</DataRow>
            )}
            <DataRow label="Respondida el">{r.fechaRespuesta}</DataRow>
            <DataRow label="Intento">
              {r.intentoNumero === null
                ? "—"
                : `N° ${r.intentoNumero}${
                    r.totalIntentos > 1 ? ` · ${r.totalIntentos} intentos` : ""
                  }`}
            </DataRow>
          </div>

          {r.variante === "rechazada" && r.detalle !== "—" && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Detalle</span>
                <p className="text-sm leading-relaxed text-foreground">
                  {r.detalle}
                </p>
              </div>
            </>
          )}

          {r.variante === "confirmada" && r.nota !== "—" && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Nota del tasador</span>
                <p className="text-sm leading-relaxed text-foreground">{r.nota}</p>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}

function HistorialTab({
  eventos,
  estadoHistorial,
  cronologia,
  tonoEtapaVigente,
  numeroEtapaVigente,
}: {
  eventos: ItemHistorial[]
  estadoHistorial: EstadoHistorial
  cronologia: EstadoCronologia
  tonoEtapaVigente?: SlaTonoEtapa
  numeroEtapaVigente?: EtapaCronologia["numero"]
}) {
  const { cargando, error } = estadoHistorial

  return (
    <div className="flex flex-col gap-6">
      <CronologiaEtapasSection
        estado={cronologia}
        tonoEtapaVigente={tonoEtapaVigente}
        numeroEtapaVigente={numeroEtapaVigente}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Historial de eventos
        </h2>

        {cargando && eventos.length === 0 && (
          <p className="text-sm text-muted-foreground">Cargando el historial…</p>
        )}

        {/* Un fallo de lectura no puede parecerse a "esta solicitud no tiene
            eventos": son estados visualmente idénticos y operativamente
            opuestos. Mismo criterio que la cronología de arriba. */}
        {!cargando && error && (
          <p className="text-sm text-muted-foreground">{MSG_ERROR_HISTORIAL}</p>
        )}

        {!cargando && !error && eventos.length === 0 && (
          <p className="text-sm text-muted-foreground">{MSG_SIN_HISTORIAL}</p>
        )}

        {eventos.length > 0 && (
          <ol className="flex flex-col">
            {eventos.map((ev, idx) => {
              const Icon = historialIcons[ev.icono]
              return (
                <HistorialItem
                  key={ev.id}
                  icono={Icon}
                  titulo={ev.titulo}
                  subtitulo={ev.autor}
                  pie={ev.hace}
                  aside={
                    // La procedencia se marca en las filas que no son hitos del
                    // ciclo de vida: las de A_Cambios son ediciones campo a
                    // campo y las de TX_CoordinacionVisita son llamados del
                    // tasador. Sin la marca las tres se leen igual. Los eventos
                    // no la llevan porque son el caso corriente y etiquetarlos
                    // todos sería ruido.
                    ev.origen === "cambio" ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Edición
                      </span>
                    ) : ev.origen === "coordinacion" ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Coordinación
                      </span>
                    ) : undefined
                  }
                  last={idx === eventos.length - 1}
                >
                  {ev.detalle && (
                    <DetalleCorreo
                      detalle={ev.detalle}
                      // Tres orígenes, tres sustantivos. La coordinación es un
                      // llamado telefónico: ofrecer "Ver correo" sobre la nota
                      // del tasador sería tan falso como ofrecerlo sobre una
                      // razón de edición, que es justo el motivo por el que este
                      // parámetro existe.
                      sustantivo={
                        ev.origen === "cambio"
                          ? "motivo"
                          : ev.origen === "coordinacion"
                            ? "detalle"
                            : "correo"
                      }
                    />
                  )}
                </HistorialItem>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}

/**
 * E-2 · Cronología de las siete etapas de §5.2.4.
 *
 * No es un componente de timeline nuevo: reutiliza `HistorialItem` y su riel
 * vertical, que es exactamente lo que el plan pide (§9.6.2 · E-1/E-2). La
 * sección se pinta **completa o no se pinta**: el endpoint devuelve siempre las
 * siete etapas, así que una lista corta significaría "las otras no existen",
 * cosa que nadie afirmó.
 *
 * Sin datos de etapa se muestran las siete como pendientes con el aviso de E-4
 * arriba. Nunca un verde por defecto.
 */
function CronologiaEtapasSection({
  estado,
  tonoEtapaVigente,
  numeroEtapaVigente,
}: {
  estado: EstadoCronologia
  tonoEtapaVigente?: SlaTonoEtapa
  numeroEtapaVigente?: EtapaCronologia["numero"]
}) {
  const { cronologia, cargando, error } = estado

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Cronología de etapas (SLA)
      </h2>

      {cargando && (
        <p className="text-sm text-muted-foreground">Cargando la cronología…</p>
      )}

      {/* Un fallo de lectura no puede parecerse a "esta solicitud no tiene
          etapas": son estados visualmente idénticos y operativamente opuestos. */}
      {!cargando && error && (
        <p className="text-sm text-muted-foreground">{MSG_ERROR_CRONOLOGIA}</p>
      )}

      {!cargando && !error && !cronologia && (
        <p className="text-sm text-muted-foreground">{MSG_SIN_CRONOLOGIA}</p>
      )}

      {!cargando && !error && cronologia && (
        <>
          {!tieneCronologia(cronologia.etapas) && (
            <p className="text-sm text-muted-foreground">{MSG_SIN_CRONOLOGIA}</p>
          )}
          <ol className="flex flex-col">
            {cronologia.etapas.map((etapa, idx) => (
              <EtapaItem
                key={etapa.etapaKey || etapa.numero}
                etapa={etapa}
                // El color sólo se aplica a la etapa que la fórmula está
                // evaluando de verdad. Si la fila y la cronología discrepan
                // sobre cuál es la vigente, no se pinta ninguna: un tono puesto
                // en la etapa equivocada es peor que ningún tono.
                tono={
                  etapa.estado === "en_curso" && etapa.numero === numeroEtapaVigente
                    ? tonoEtapaVigente
                    : undefined
                }
                last={idx === cronologia.etapas.length - 1}
              />
            ))}
          </ol>
        </>
      )}
    </section>
  )
}

/** Una etapa como fila del riel. Traduce el contrato del endpoint a props. */
function EtapaItem({
  etapa,
  tono,
  last,
}: {
  etapa: EtapaCronologia
  tono?: SlaTonoEtapa
  last: boolean
}) {
  const pendiente = etapa.estado === "pendiente"
  const tiempo = resumenTiempoEtapa(etapa)
  const tone = tono ? toneDeEtapa(tono) : null

  return (
    <HistorialItem
      icono={
        etapa.estado === "completada"
          ? CheckCircle2
          : etapa.estado === "en_curso"
            ? CircleAlert
            : undefined
      }
      tono={tone}
      apagado={pendiente}
      titulo={`${etapa.numero} · ${etapa.nombre}`}
      subtitulo={etiquetaResponsable(etapa.responsable) ?? undefined}
      pie={rangoEtapa(etapa) ?? undefined}
      aside={
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            // Mismo truco que `EtapaPill`: se reusa `SLA_CLASSES` por su
            // `text-*` y `tailwind-merge` descarta el fondo. Así el semáforo
            // sigue declarado en un solo sitio (§4.4 · RO-05).
            tone
              ? cn(SLA_CLASSES[tone], "bg-transparent")
              : "text-muted-foreground",
          )}
        >
          {tiempo ?? ETIQUETA_ESTADO[etapa.estado]}
        </span>
      }
      last={last}
    />
  )
}

/**
 * Riel + fila del historial. Generalizado en E-1 para servir a las dos
 * cronologías —los eventos de `A_Eventos` y las siete etapas de §5.2.4— sin
 * cambiar en nada lo que ya mostraba: `titulo` + `pie` + detalle desplegable era
 * su forma anterior y sigue siendo la que usa `HistorialTab`.
 *
 * Lo que se agregó es `subtitulo` (el responsable de §5.2.3), `aside` (el
 * tiempo consumido o el estado, a la derecha), `tono` (el color del punto, que
 * llega ya decidido por la fórmula) y `apagado` (las etapas que no empezaron:
 * círculo hueco y texto atenuado, para que "pendiente" no se lea como "listo").
 *
 * Es un componente sin estado: el desplegable de "Ver correo" se mudó a
 * `DetalleCorreo` y entra como `children`. Así la misma fila sirve para algo
 * que no tiene nada que desplegar.
 */
function HistorialItem({
  icono: Icon,
  titulo,
  subtitulo,
  pie,
  tono,
  apagado = false,
  aside,
  last,
  children,
}: {
  /** Sin icono se dibuja el círculo hueco de las etapas pendientes. */
  icono?: React.ComponentType<{ className?: string }>
  titulo: string
  /** Segunda línea del encabezado: el responsable del tramo (§5.2.3). */
  subtitulo?: string
  /** Línea de tiempo: "hace 2 horas" o el rango entrada → salida. */
  pie?: string
  /** Semáforo por etapa, ya resuelto. `null`/ausente = punto neutro. */
  tono?: SlaTone | null
  apagado?: boolean
  /** Contenido alineado a la derecha del título. */
  aside?: React.ReactNode
  last: boolean
  children?: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border",
            tono
              ? SLA_CLASSES[tono]
              : "border-border bg-card text-muted-foreground",
            apagado && "border-dashed bg-transparent",
          )}
        >
          {Icon && <Icon className="size-4" />}
        </span>
        {!last && <span className="w-px flex-1 bg-border" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p
            className={cn(
              "text-sm leading-snug",
              apagado ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {titulo}
          </p>
          {aside}
        </div>
        {subtitulo && (
          <span className="text-xs text-muted-foreground">{subtitulo}</span>
        )}
        {pie && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {pie}
          </span>
        )}
        {children}
      </div>
    </li>
  )
}

/**
 * Desplegable del detalle de una fila del historial. Era parte de
 * `HistorialItem` (E-1).
 *
 * `sustantivo` existe porque la fila ya no siempre despliega un correo: las
 * filas de `A_Cambios` despliegan la razón del cambio, y "Ver correo" sobre una
 * razón de edición es simplemente falso.
 */
function DetalleCorreo({
  detalle,
  sustantivo = "correo",
}: {
  detalle: string
  sustantivo?: string
}) {
  const [abierto, setAbierto] = React.useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-medium text-brand hover:underline"
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", abierto && "rotate-180")}
        />
        {abierto ? `Ocultar ${sustantivo}` : `Ver ${sustantivo}`}
      </button>
      {abierto && (
        <pre className="mt-2 max-w-xl overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
          {detalle}
        </pre>
      )}
    </>
  )
}

/**
 * Pestaña Adjuntos (§1.3.4). Sólo lectura: toda alta, reemplazo y baja vive en
 * el botón "Documentos y Adjuntos" de la barra de acciones (§1.3.1).
 *
 * ## Por qué son dos secciones y no una agrupación
 *
 * §1.3.4 pide agrupar los archivos por versión del informe (RN-56). Eso no se
 * puede hacer sobre `TX_Adjuntos`: **no tiene ningún campo de versión**, y no
 * es un olvido de schema —sus filas son antecedentes de *entrada* (certificados,
 * planos, escrituras) que no pertenecen a ninguna versión del informe—. Las
 * versiones son las filas de `TX_DocumentosGenerados`, que escribe el pipeline
 * PDF.
 *
 * Forzar una sola lista agrupada obligaría a inventar a qué versión pertenece
 * cada adjunto. Se muestran separadas: cada una dice la verdad de su tabla, y
 * la de versiones tiene estado vacío honesto mientras el pipeline no genere
 * nada — que es el caso de casi toda la cartera.
 */
function AdjuntosTab({
  solicitud: s,
  adjuntos,
  versiones,
}: {
  solicitud: Solicitud
  adjuntos: EstadoAdjuntos
  versiones: EstadoVersionesInforme
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Vista de sólo lectura. Para cargar o eliminar documentos usa{" "}
          <strong>Documentos y Adjuntos</strong> en la barra de acciones.
        </p>
      </div>

      <DocumentosSolicitudSection estado={adjuntos} />
      <Separator />
      <VersionesInformeSection estado={versiones} codigoExt={s.codigoExt} />
    </div>
  )
}

/** Los antecedentes cargados para la solicitud (`TX_Adjuntos`). */
function DocumentosSolicitudSection({ estado }: { estado: EstadoAdjuntos }) {
  const { adjuntos, cargando, error } = estado

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Documentos de la solicitud ({adjuntos.length})
      </h2>

      {cargando && (
        <p className="text-sm text-muted-foreground">Cargando los documentos…</p>
      )}

      {!cargando && error && (
        <p className="text-sm text-muted-foreground">{MSG_ERROR_ADJUNTOS}</p>
      )}

      {!cargando && !error && adjuntos.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Todavía no hay documentos cargados para esta solicitud.
        </p>
      )}

      {!cargando && !error && adjuntos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {adjuntos.map((a) => {
            const Icon = a.esImagen ? ImageIcon : FileText
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {a.nombre}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {a.detalle}
                  </span>
                </span>
                {/* `estado_extraccion` sólo se pinta cuando trae valor: hoy está
                    vacío en todo adjunto nuevo porque AT-RF09-Trigger falla al
                    disparar el webhook (CI-002). Pintar un "idle" que nadie
                    escribió sería afirmar que el pipeline corrió. */}
                {a.estadoExtraccion && (
                  <Badge variant="secondary" className="shrink-0">
                    {etiquetaExtraccion(a.estadoExtraccion)}
                  </Badge>
                )}
                {/* Sin `url_dropbox` no hay a dónde ir: un botón que no navega
                    es peor que la ausencia del botón. */}
                {a.urlDropbox ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    // §4.4: `render` prop + `nativeButton={false}`, nunca
                    // `asChild`. El `false` es obligatorio al renderizar algo
                    // que no es un `<button>`: sin él, Base UI sigue tratando
                    // al elemento como botón nativo.
                    nativeButton={false}
                    render={
                      <a
                        href={a.urlDropbox}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Download data-icon="inline-start" />
                    Abrir
                  </Button>
                ) : (
                  <Badge variant="secondary" className="shrink-0">
                    Sin enlace
                  </Badge>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** Los PDF emitidos por el pipeline (`TX_DocumentosGenerados` · RN-56). */
function VersionesInformeSection({
  estado,
  codigoExt,
}: {
  estado: EstadoVersionesInforme
  codigoExt: string
}) {
  const { versiones, cargando, error } = estado

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Versiones del informe
      </h2>

      {cargando && (
        <p className="text-sm text-muted-foreground">Cargando las versiones…</p>
      )}

      {!cargando && error && (
        <p className="text-sm text-muted-foreground">{MSG_ERROR_VERSIONES}</p>
      )}

      {!cargando && !error && versiones.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          {MSG_SIN_VERSIONES}
        </p>
      )}

      {!cargando && !error && versiones.length > 0 && (
        <ul className="flex flex-col gap-2">
          {versiones.map((v) => (
            <li
              key={v.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand/10 text-brand">
                    Versión {v.numero || "—"}
                  </Badge>
                  {v.vigente && (
                    <Badge variant="secondary">Versión vigente</Badge>
                  )}
                </div>
                {v.generadoEl && (
                  <span className="text-xs text-muted-foreground">
                    {v.generadoEl}
                  </span>
                )}
              </div>

              {v.motivoCambio && (
                <p className="text-xs text-muted-foreground">
                  Motivo del cambio: {v.motivoCambio}
                </p>
              )}

              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <FileText className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  Informe {codigoExt} · v{v.numero || "—"}
                  {v.paginas ? ` · ${v.paginas} págs.` : ""}
                </span>
                {v.urlPdf ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    nativeButton={false}
                    render={
                      <a
                        href={v.urlPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Download data-icon="inline-start" />
                    Abrir PDF
                  </Button>
                ) : (
                  <Badge variant="secondary" className="shrink-0">
                    Sin enlace
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
