import Link from "next/link"
import { ArrowRight, MapPin, CalendarDays, Phone, FileText, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Tasacion, SlaStatus } from "@/lib/tasaciones"

const SLA_META: Record<SlaStatus, { dot: string; texto: string }> = {
  en_plazo: { dot: "bg-vp-success", texto: "En plazo" },
  por_vencer: { dot: "bg-vp-warning", texto: "Por vencer" },
  vencido: { dot: "bg-vp-danger", texto: "Vencido" },
  por_coordinar: { dot: "bg-vp-accent", texto: "Por coordinar" },
}

/** Semáforo de SLA: punto de color + estado + horas restantes en una línea. */
function SlaLinea({ tasacion }: { tasacion: Tasacion }) {
  const status = tasacion.slaStatus ?? "en_plazo"
  const meta = SLA_META[status]
  const sinReloj = status === "vencido"
  const horas = tasacion.horasRestantes ?? 0

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", meta.dot)} />
      {meta.texto}
      {!sinReloj && <span className="font-medium text-vp-text-secondary">· {horas}h</span>}
    </span>
  )
}

export function TasacionCard({ tasacion }: { tasacion: Tasacion }) {
  const editada = tasacion.contactosEditadosPorEjecutiva === true
  // Rechazada sin actualización de contactos → en espera. Con actualización → reintentable.
  const enEspera = tasacion.coordinacionVigente === "rechazada" && !editada
  const reabrible = tasacion.coordinacionVigente === "rechazada" && editada
  // "Por coordinar": sin coordinación vigente, o rechazada pero con contactos actualizados.
  const porCoordinar =
    (tasacion.coordinacionVigente == null && tasacion.estado === "asignada") || reabrible

  const cta = enEspera
    ? { label: "Ver coordinación", disabled: true as const }
    : porCoordinar
      ? { label: "Coordinar visita", href: `/tasaciones/${tasacion.id}/coordinar`, tone: "accent" as const }
      : { label: "Abrir tasación", href: `/tasaciones/${tasacion.id}`, tone: "primary" as const }

  const telHref = `tel:${tasacion.datosEjecutiva.contactoTelefono.replace(/\s+/g, "")}`

  return (
    <Card className="overflow-hidden rounded-xl border-border p-0 shadow-sm transition-all duration-200 active:scale-[0.99]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-semibold text-foreground">{tasacion.codigo}</p>
          {/* SLA: en espera se detiene el reloj (ver badge inferior). */}
          {!enEspera && <SlaLinea tasacion={tasacion} />}
        </div>

        {enEspera && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-vp-text-secondary">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            Esperando contacto de ejecutiva
          </span>
        )}

        <p className="mt-2 text-base font-medium text-foreground">
          {tasacion.comuna} · {tasacion.tipo}
        </p>

        <p className="mt-1 flex items-start gap-1.5 text-base text-foreground">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-vp-text-secondary" />
          {tasacion.direccion}
        </p>

        {(porCoordinar || enEspera) && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <FileText aria-hidden="true" className="h-4 w-4 shrink-0 text-vp-text-secondary" />
            Rol: {tasacion.datosEjecutiva.rolSii}
          </p>
        )}

        <p className="mt-2 text-sm text-vp-text-secondary">
          {tasacion.cliente} · {tasacion.producto}
        </p>

        {porCoordinar || enEspera ? (
          <a
            href={telHref}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex w-fit items-center gap-1.5 text-sm font-medium text-vp-primary hover:underline"
          >
            <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
            {tasacion.datosEjecutiva.contactoTelefono}
          </a>
        ) : (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-vp-text-secondary">
            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0" />
            Visita: {tasacion.visita}
          </p>
        )}

        {cta.disabled ? (
          <button
            type="button"
            disabled
            title="Esperando que la ejecutiva actualice los contactos"
            className="mt-4 flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border bg-muted text-base font-semibold text-vp-text-secondary opacity-90"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <Button
            render={<Link href={cta.href} />}
            nativeButton={false}
            className={cn(
              "mt-4 min-h-12 w-full text-base font-semibold text-white",
              cta.tone === "accent"
                ? "bg-vp-accent hover:bg-vp-accent/90"
                : "bg-vp-primary hover:bg-vp-primary-dark",
            )}
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
