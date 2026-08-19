import Link from "next/link"
import { ArrowRight, MapPin, CalendarDays, Phone, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SLABadge } from "@/components/console/status-badges"
import { SIN_FECHA_VISITA, type Tasacion } from "@/lib/tasaciones"

/**
 * Card de la cola personal · RF-TAS-11 · CI-018.
 *
 * ## Regla T-A, colapsada a un botón (P3-TAS.A · decisión de Sergio 19-ago-2026)
 *
 * §0.3 fijaba tres variantes excluyentes —"Coordinar visita", "Abrir tasación",
 * "Ver coordinación" deshabilitado—, y el gate entre ellas era el estado de la
 * coordinación. **RO-29** dejó ese gate sin objeto: la coordinación no se
 * soporta por sistema. Queda **una** variante, "Abrir tasación", para
 * `asignada · visitada · calculada`, y por eso no se tipó `AccionCard`: una
 * unión discriminada de una sola variante no discrimina nada.
 *
 * ## Lo que la card no hace
 *
 * **No calcula SLA** (CI-021). El semáforo es `SLABadge`, importado de la
 * consola de IF-02 (R7) y alimentado con la etapa que resolvió el motor. No hay
 * copia local de la píldora ni un `Record<…>` de colores propio: hasta P3-TAS.A
 * había uno, y como nadie poblaba `slaStatus`, pintaba "En plazo · 0h" en toda
 * la cartera. Sin `slaEtapa` no se pinta nada — nunca un verde inventado.
 *
 * ## Los ocho elementos de §4.1, y los tres que se omiten
 *
 * Rol SII, teléfono y fecha de visita **desaparecen si no hay dato**, no se
 * muestran vacíos. Antes el Rol y el teléfono se condicionaban al estado de la
 * coordinación —así que una solicitud ya coordinada escondía el teléfono— y la
 * visita se mostraba siempre, con el literal "Por agendar" cuando no la había.
 */
export function TasacionCard({ tasacion }: { tasacion: Tasacion }) {
  const { rolSii, contactoTelefono } = tasacion.datosEjecutiva
  const tieneRolSii = rolSii !== "" && rolSii !== "—"
  const visitaCoordinada = tasacion.visita !== "" && tasacion.visita !== SIN_FECHA_VISITA

  return (
    <Card className="overflow-hidden rounded-xl border-border p-0 shadow-sm transition-all duration-200 active:scale-[0.99]">
      <div className="p-4">
        {/* 1 · código · 2 · semáforo de SLA (no de estado) */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-semibold text-foreground">{tasacion.codigo}</p>
          {tasacion.slaEtapa && <SLABadge etapa={tasacion.slaEtapa} />}
        </div>

        {/* 3 · comuna · tipo de propiedad */}
        <p className="mt-2 text-base font-medium text-foreground">
          {tasacion.comuna} · {tasacion.tipo}
        </p>

        {/* 4 · dirección */}
        <p className="mt-1 flex items-start gap-1.5 text-base text-foreground">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-vp-text-secondary" />
          {tasacion.direccion}
        </p>

        {/* 5 · rol SII — la línea se omite si la solicitud no lo tiene */}
        {tieneRolSii && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <FileText aria-hidden="true" className="h-4 w-4 shrink-0 text-vp-text-secondary" />
            Rol: {rolSii}
          </p>
        )}

        {/* 6 · cliente institucional · producto */}
        <p className="mt-2 text-sm text-vp-text-secondary">
          {tasacion.cliente} · {tasacion.producto}
        </p>

        {/*
          7 · teléfono del contacto de prioridad 1, accionable.
          No es cosmético: la etapa 2 de §5.2.4 mide, en horas hábiles, desde la
          asignación hasta el primer contacto — y ésta es la pantalla desde donde
          se llama. El umbral vive en `C_SLA_Etapas`, nunca acá.
        */}
        {contactoTelefono && (
          <a
            href={`tel:${contactoTelefono.replace(/\s+/g, "")}`}
            className="mt-1 flex w-fit items-center gap-1.5 text-sm font-medium text-vp-primary hover:underline"
          >
            <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
            {contactoTelefono}
          </a>
        )}

        {/* 8 · fecha de visita — sólo cuando ya está coordinada */}
        {visitaCoordinada && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-vp-text-secondary">
            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0" />
            Visita: {tasacion.visita}
          </p>
        )}

        {/* Regla T-A · botón único, altura táctil ≥44 px (R9) */}
        <Button
          render={<Link href={`/tasaciones/${tasacion.id}`} />}
          nativeButton={false}
          className="mt-4 min-h-12 w-full bg-vp-primary text-base font-semibold text-white hover:bg-vp-primary-dark"
        >
          Abrir tasación
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
