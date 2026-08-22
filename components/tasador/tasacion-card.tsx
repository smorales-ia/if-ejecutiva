import Link from "next/link"
import { ArrowRight, MapPin, CalendarDays, Phone, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SLABadge } from "@/components/console/status-badges"
import {
  resolverAccionCard,
  SIN_FECHA_VISITA,
  type AccionCard,
  type Tasacion,
} from "@/lib/tasaciones"

/**
 * Card de la cola personal · RF-TAS-11 · CI-018.
 *
 * ## Regla T-A · el botón único contextual (gate §2.4)
 *
 * §0.3 fija tres variantes excluyentes —"Abrir tasación", "Coordinar visita" y
 * "Ver coordinación" deshabilitado con badge "Esperando contacto de
 * ejecutiva"—, y el gate entre ellas es el estado de la coordinación.
 *
 * La card **no decide**: llama a `resolverAccionCard()` (único punto de la
 * Regla T-A, en `lib/tasaciones.ts`) y renderiza la variante que devuelve. El
 * `switch` sobre `AccionCard` es **exhaustivo por tipo** —el `default: never`
 * hace fallar `tsc` si el union crece sin cubrirse acá—, que es la garantía de
 * que nunca aparezcan dos variantes ni falte una.
 *
 * P3-TAS.A había colapsado el botón a uno solo —"Abrir tasación" incondicional—
 * porque **RO-29** dejó el gate sin objeto (la coordinación no se soportaba por
 * sistema). **RO-29 fue anulada el 19-ago-2026** y P4-TAS repuso el dato
 * (`coordinacion_vigente`, `fldI4Dv0jpRQvbdHl`) y `resolverAccionCard()`.
 * Cablearlos acá es **CI-046**, y es lo que hace este bloque: sin el gate una
 * solicitud sin coordinar entraba al formulario igual.
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
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          {tasacion.direccion}
        </p>

        {/* 5 · rol SII — la línea se omite si la solicitud no lo tiene */}
        {tieneRolSii && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <FileText aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
            Rol: {rolSii}
          </p>
        )}

        {/* 6 · cliente institucional · producto */}
        <p className="mt-2 text-sm text-muted-foreground">
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
            className="mt-1 flex w-fit items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
            {contactoTelefono}
          </a>
        )}

        {/* 8 · fecha de visita — sólo cuando ya está coordinada */}
        {visitaCoordinada && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0" />
            Visita: {tasacion.visita}
          </p>
        )}

        {/* Regla T-A · botón único contextual, altura táctil ≥44 px (R9) */}
        <AccionCardBoton accion={resolverAccionCard(tasacion)} />
      </div>
    </Card>
  )
}

/**
 * Renderiza **exactamente una** de las tres variantes de la Regla T-A.
 *
 * El `switch` es exhaustivo por construcción: el `default` asigna `accion` a
 * `never`, así que agregar una variante a `AccionCard` sin darle un `case` acá
 * es un error de compilación, no un fallo en runtime.
 */
function AccionCardBoton({ accion }: { accion: AccionCard }) {
  switch (accion.tipo) {
    case "abrir":
      return (
        <Button
          render={<Link href={accion.href} />}
          nativeButton={false}
          className="mt-4 min-h-12 w-full bg-brand text-base font-semibold text-white hover:bg-brand/90"
        >
          {accion.rotulo}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )
    case "coordinar":
      // A-24: color de acento = naranja VProperty (--accent-orange · #f5a213).
      return (
        <Button
          render={<Link href={accion.href} />}
          nativeButton={false}
          className="mt-4 min-h-12 w-full bg-accent-orange text-base font-semibold text-white hover:bg-accent-orange/90"
        >
          {accion.rotulo}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )
    case "esperando_ejecutiva":
      // A-23: la salida de este estado (reabrir la coordinación) es IF-02, diferida en CI-043.
      return (
        <div className="mt-4 space-y-2">
          <Button disabled variant="secondary" className="min-h-12 w-full text-base font-semibold">
            {accion.rotulo}
          </Button>
          <Badge variant="secondary" className="h-auto w-full justify-center py-1.5 text-sm">
            {accion.badge}
          </Badge>
        </div>
      )
    default: {
      const _exhaustivo: never = accion
      return _exhaustivo
    }
  }
}
