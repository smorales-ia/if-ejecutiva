"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  Copy,
  Paperclip,
  PhoneCall,
  PhoneOff,
  ChevronDown,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  confirmarCoordinacion,
  devolverCoordinacion,
  MOTIVOS_DEVOLUCION,
  type Tasacion,
} from "@/lib/tasaciones"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Resultado = "exitoso" | "no_contactado" | ""

const DETALLE_MIN = 20

function formatearTamano(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

/** Tarjeta de resumen colapsable (abierta por defecto). */
function TarjetaResumen({
  titulo,
  defaultOpen = true,
  children,
}: {
  titulo: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-background [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-vp-surface px-4 py-3 text-sm font-bold uppercase tracking-wide text-vp-text-secondary">
        {titulo}
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-4 py-3">{children}</div>
    </details>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col py-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-vp-text-secondary">
        {label}
      </span>
      <span className="text-base text-foreground">{children}</span>
    </div>
  )
}

export function CoordinarVisita({ tasacion }: { tasacion: Tasacion }) {
  const router = useRouter()
  const d = tasacion.datosEjecutiva
  const esNuevo = tasacion.tipoPropiedad === "nuevo"
  const reabrible =
    tasacion.coordinacionVigente === "rechazada" &&
    tasacion.contactosEditadosPorEjecutiva === true
  const unidades = tasacion.unidades ?? []
  const contactos = [...(tasacion.contactos ?? [])].sort((a, b) => a.prioridad - b.prioridad)
  const contactoPrincipal = contactos[0]
  const adjuntos = tasacion.adjuntosDropbox ?? []

  const [resultado, setResultado] = useState<Resultado>("")
  const [fechaVisita, setFechaVisita] = useState("")
  const [notas, setNotas] = useState("")
  const [motivo, setMotivo] = useState("")
  const [detalle, setDetalle] = useState("")

  const puedeConfirmar = useMemo(() => {
    if (resultado === "exitoso") return fechaVisita.trim().length > 0
    if (resultado === "no_contactado")
      return motivo.length > 0 && detalle.trim().length >= DETALLE_MIN
    return false
  }, [resultado, fechaVisita, motivo, detalle])

  function copiarCodigo() {
    navigator.clipboard?.writeText(tasacion.codigo).then(
      () => toast.success("Código copiado"),
      () => {},
    )
  }

  function handleConfirmar() {
    if (!puedeConfirmar) return
    if (resultado === "exitoso") {
      confirmarCoordinacion(tasacion.id, fechaVisita, notas.trim() || undefined)
      toast.success("Coordinación confirmada. Se notificó por email a la ejecutiva.")
      router.push(`/tasaciones/${tasacion.id}/fotos`)
    } else {
      devolverCoordinacion(tasacion.id, motivo, detalle.trim())
      toast.success("Se devolvió la coordinación a la ejecutiva con tu motivo.")
      router.push("/tasaciones")
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background px-4 py-3">
        <Link
          href="/tasaciones"
          aria-label="Volver a mis tasaciones"
          className="flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-vp-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col">
          <span className="text-xs text-vp-text-secondary">Coordinar visita</span>
          <span className="font-mono text-base font-semibold text-foreground">
            {tasacion.codigo}
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-32 pt-4">
        {reabrible && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-[#eff6ff] p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-vp-primary" aria-hidden="true" />
            <p className="text-sm font-medium text-vp-primary">
              La ejecutiva actualizó los contactos. Puedes intentar coordinar nuevamente.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Tarjeta 1 · Encabezado */}
          <TarjetaResumen titulo="Encabezado">
            <div className="divide-y divide-border">
              <Campo label="Empresa">{tasacion.cliente}</Campo>
              {tasacion.fechaSolicitud && (
                <Campo label="Fecha de solicitud">{tasacion.fechaSolicitud}</Campo>
              )}
              <div className="flex items-center justify-between gap-3 py-1.5">
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wide text-vp-text-secondary">
                    Código VP
                  </span>
                  <span className="font-mono text-base font-semibold text-foreground">
                    {tasacion.codigo}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copiarCodigo}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-vp-primary hover:bg-vp-surface"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </button>
              </div>
            </div>
          </TarjetaResumen>

          {/* Tarjeta 2 · Propiedad */}
          <TarjetaResumen titulo="Propiedad">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  esNuevo ? "bg-vp-accent text-white" : "bg-muted text-foreground",
                )}
              >
                {esNuevo ? "Nuevo" : "Usado"}
              </span>
            </div>
            <div className="divide-y divide-border">
              <Campo label="Dirección">{tasacion.direccion}</Campo>
              <Campo label="Comuna">{tasacion.comuna}</Campo>
              {typeof tasacion.valorEstimadoUf === "number" && (
                <Campo label="Valor estimado">
                  {tasacion.valorEstimadoUf.toLocaleString("es-CL")} UF
                </Campo>
              )}
              {esNuevo && tasacion.proyecto && (
                <Campo label="Proyecto">{tasacion.proyecto}</Campo>
              )}
            </div>

            {/* Unidades con sus Roles SII */}
            <div className="mt-3">
              <span className="text-xs font-medium uppercase tracking-wide text-vp-text-secondary">
                {unidades.length > 1 ? "Unidades y Roles SII" : "Unidad y Rol SII"}
              </span>
              {unidades.length > 1 ? (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-vp-text-secondary">
                        <th className="py-1.5 pr-3 font-medium">N°</th>
                        <th className="py-1.5 pr-3 font-medium">Dirección</th>
                        <th className="py-1.5 pr-3 font-medium">Rol SII</th>
                        <th className="py-1.5 font-medium">Sup. m²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {unidades.map((u) => (
                        <tr key={u.numero}>
                          <td className="py-2 pr-3 text-foreground">{u.numero}</td>
                          <td className="py-2 pr-3 text-foreground">{u.direccion ?? "—"}</td>
                          <td className="py-2 pr-3 font-mono text-foreground">{u.rolSii}</td>
                          <td className="py-2 text-foreground">{u.superficieM2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : unidades.length === 1 ? (
                <p className="mt-1 text-base text-foreground">
                  {unidades[0].direccion ? `${unidades[0].direccion} · ` : ""}
                  <span className="font-mono">{unidades[0].rolSii}</span> ·{" "}
                  {unidades[0].superficieM2} m²
                </p>
              ) : (
                <p className="mt-1 text-base text-foreground">
                  <span className="font-mono">{d.rolSii}</span>
                </p>
              )}
            </div>
          </TarjetaResumen>

          {/* Tarjeta 3 · Personas */}
          <TarjetaResumen titulo="Personas">
            {tasacion.vendedor && (
              <div className="border-b border-border pb-3">
                <span className="text-xs font-medium uppercase tracking-wide text-vp-text-secondary">
                  Vendedor
                </span>
                <p className="text-base text-foreground">{tasacion.vendedor.nombre}</p>
                <p className="text-sm text-vp-text-secondary">RUT {tasacion.vendedor.rut}</p>
              </div>
            )}

            <div className="pt-3">
              <span className="text-xs font-medium uppercase tracking-wide text-vp-text-secondary">
                Contactos de visita
              </span>
              <ol className="mt-2 flex flex-col gap-3">
                {contactos.map((c) => (
                  <li
                    key={c.prioridad}
                    className="flex gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-vp-primary text-xs font-bold text-white">
                      {c.prioridad}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-foreground">
                          {c.nombre}
                        </span>
                        {c.prioridad === 1 && (
                          <span className="rounded-full bg-vp-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Prioridad 1
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-vp-text-secondary">{c.rol}</span>
                      <a
                        href={`tel:${c.telefono.replace(/\s+/g, "")}`}
                        className="flex w-fit items-center gap-1.5 text-sm font-medium text-vp-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {c.telefono}
                      </a>
                      <a
                        href={`mailto:${c.email}`}
                        className="flex w-fit items-center gap-1.5 text-sm text-vp-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {c.email}
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {tasacion.observaciones && (
              <div className="mt-3 border-t border-border pt-3">
                <span className="text-xs font-medium uppercase tracking-wide text-vp-text-secondary">
                  Observaciones
                </span>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {tasacion.observaciones}
                </p>
              </div>
            )}
          </TarjetaResumen>

          {/* Tarjeta 4 · Adjuntos */}
          <TarjetaResumen titulo="Adjuntos">
            {adjuntos.length === 0 ? (
              <p className="text-sm text-vp-text-secondary">Sin archivos adjuntos.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {adjuntos.map((a) => (
                  <li key={a.nombre}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 hover:bg-vp-surface"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-vp-primary">
                        <Paperclip className="h-4 w-4 shrink-0" />
                        <span className="truncate">{a.nombre}</span>
                      </span>
                      <span className="shrink-0 text-xs text-vp-text-secondary">
                        {formatearTamano(a.sizeBytes)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </TarjetaResumen>
        </div>

        {/* Resultado del contacto */}
        <section className="mt-6">
          <h2 className="text-base font-bold text-foreground">Resultado del contacto</h2>
          <p className="mt-1 text-sm text-vp-text-secondary">
            Llama al contacto de prioridad 1
            {contactoPrincipal ? ` (${contactoPrincipal.nombre})` : ""} y registra el resultado.
          </p>

          <RadioGroup
            value={resultado}
            onValueChange={(v) => setResultado(v as Resultado)}
            className="mt-3 gap-3"
          >
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                resultado === "exitoso"
                  ? "border-vp-primary bg-blue-50"
                  : "border-border hover:bg-vp-surface",
              )}
            >
              <RadioGroupItem value="exitoso" className="mt-1" />
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <PhoneCall className="h-4 w-4 text-vp-success" />
                  Contacto exitoso
                </span>
                <span className="text-sm text-vp-text-secondary">
                  Coordiné la fecha de visita
                </span>
              </div>
            </label>

            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                resultado === "no_contactado"
                  ? "border-vp-danger bg-red-50"
                  : "border-border hover:bg-vp-surface",
              )}
            >
              <RadioGroupItem value="no_contactado" className="mt-1" />
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <PhoneOff className="h-4 w-4 text-vp-danger" />
                  No pude contactar
                </span>
                <span className="text-sm text-vp-text-secondary">Devolver a la ejecutiva</span>
              </div>
            </label>
          </RadioGroup>

          {/* Sub-formulario: exitoso */}
          {resultado === "exitoso" && (
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border p-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fecha-visita" className="text-sm font-medium">
                  Fecha planificada de visita <span className="text-vp-danger">*</span>
                </Label>
                <Input
                  id="fecha-visita"
                  type="date"
                  value={fechaVisita}
                  onChange={(e) => setFechaVisita(e.target.value)}
                  className="min-h-12 text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notas" className="text-sm font-medium">
                  Nota de la coordinación{" "}
                  <span className="text-vp-text-secondary">(opcional)</span>
                </Label>
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Portero autoriza acceso 10-13h"
                  className="min-h-20 text-base"
                />
              </div>
            </div>
          )}

          {/* Sub-formulario: no contactado */}
          {resultado === "no_contactado" && (
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="motivo-devolucion" className="text-sm font-medium">
                  Motivo <span className="text-vp-danger">*</span>
                </Label>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger id="motivo-devolucion" className="min-h-12 w-full text-base">
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTIVOS_DEVOLUCION.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="text-base">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="detalle" className="text-sm font-medium">
                  Detalle <span className="text-vp-danger">*</span>
                </Label>
                <Textarea
                  id="detalle"
                  value={detalle}
                  onChange={(e) => setDetalle(e.target.value)}
                  placeholder="Describe qué ocurrió para que la ejecutiva pueda corregir los datos con el cliente."
                  className="min-h-24 text-base"
                />
                <span
                  className={cn(
                    "text-xs",
                    detalle.trim().length >= DETALLE_MIN
                      ? "text-vp-success"
                      : "text-vp-text-secondary",
                  )}
                >
                  {detalle.trim().length}/{DETALLE_MIN} caracteres mínimos
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer sticky */}
      <footer className="sticky bottom-0 z-20 border-t border-border bg-background px-4 py-3">
        {resultado === "" ? (
          <Button
            disabled
            className="min-h-12 w-full bg-vp-primary text-base font-semibold text-white opacity-50"
          >
            Selecciona un resultado
          </Button>
        ) : resultado === "exitoso" ? (
          <Button
            onClick={handleConfirmar}
            disabled={!puedeConfirmar}
            className="min-h-12 w-full bg-vp-primary text-base font-semibold text-white hover:bg-vp-primary-dark disabled:opacity-50"
          >
            Confirmar coordinación
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirmar}
            disabled={!puedeConfirmar}
            className="min-h-12 w-full bg-vp-danger text-base font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Devolver a ejecutiva
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </footer>
    </div>
  )
}
