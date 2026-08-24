"use client"

import { createContext, useContext, useId, useState } from "react"
import { ChevronDown, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type Opcion = { v: string; l: string }

/**
 * Modo solo-lectura del formulario (§6.1 consulta). Cuando es true, los campos
 * se muestran deshabilitados y sin badge "Pre-llenado · editable".
 */
export const FormModoConsultaContext = createContext(false)

/* ---------- Sección colapsable principal ---------- */
export function Section({
  letra,
  titulo,
  badge,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  id,
  children,
}: {
  letra: string
  titulo: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  id?: string
  children: React.ReactNode
}) {
  const [openInterno, setOpenInterno] = useState(defaultOpen)
  const open = openProp ?? openInterno
  const setOpen = (v: boolean) => {
    setOpenInterno(v)
    onOpenChange?.(v)
  }
  return (
    <Collapsible
      id={id}
      open={open}
      onOpenChange={setOpen}
      className="scroll-mt-24 w-full min-w-0 rounded-xl border border-border bg-background"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left">
        <span className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              !open && "-rotate-90",
            )}
            aria-hidden="true"
          />
          {letra}. {titulo}
        </span>
        {badge}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-hidden px-4 pb-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/* ---------- Sub-acordeón interno ---------- */
export function SubSection({
  titulo,
  defaultOpen = false,
  children,
}: {
  titulo: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border border-border bg-muted/50"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left">
        <span className="text-sm font-semibold text-foreground">{titulo}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            !open && "-rotate-90",
          )}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function useFieldId(prefix: string) {
  // useId es estable entre servidor y cliente (evita mismatches de hidratación).
  return `${prefix}-${useId()}`
}

/**
 * Badge neutro "Pre-llenado · editable" (§5.1).
 *
 * **Privado a propósito** (P7-TAS.A.3-bis). Sólo lo renderiza `TextField`, y
 * sólo cuando su prop `prellenado` lo declara. Exportarlo invita a pintarlo
 * suelto, que es saltarse el contrato de abajo: el badge afirma el **origen**
 * del valor, y esa afirmación la hace quien construye el valor, no quien lo
 * muestra.
 */
function PrellenadoBadge() {
  return (
    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      Pre-llenado · editable
    </span>
  )
}

/* ---------- Campo de texto / número ---------- */
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  requerido = false,
  disabled = false,
  prellenado = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: "text" | "number" | "date"
  placeholder?: string
  hint?: string
  requerido?: boolean
  disabled?: boolean
  /**
   * El valor es una **sugerencia del sistema** —un default real—, no un dato
   * que el tasador escribió. Lo declara quien construye el valor; **no se
   * infiere de que el campo llegue con algo**.
   *
   * ## Por qué es una prop y no un cálculo (P7-TAS.A.3-bis · Regla T-B)
   *
   * Hasta esta tanda el badge salía de `useState(value)` en el montaje: el
   * predicado era «vino con valor», que antes de P7-TAS.A.1 sólo podía ser
   * cierto para un default. Desde que el formulario se hidrata server-side, el
   * dato que el tasador midió en la visita anterior **también** llega con valor
   * en el primer render, y el badge se colgaba encima marcándolo como
   * sugerencia del sistema. Un dato que el tasador guardó es suyo.
   *
   * El default es `false` a propósito: de los 67 `TextField` del formulario,
   * hoy **uno solo** es un default real —la fecha planificada de visita, que
   * pone la Ejecutiva en la coordinación (§2.3)—. Los demás no se tocan.
   *
   * ⚠ Es **estático**: declara que el valor *nació* default, no que lo siga
   * siendo. Sobrescribir un default y guardar hace que en la apertura
   * siguiente vuelva con badge. Hoy es irrelevante con un único default; se
   * decide al construir la precarga de la sección E. **CI-055.**
   */
  prellenado?: boolean
}) {
  const id = useFieldId("f")
  const consulta = useContext(FormModoConsultaContext)
  const deshabilitado = disabled || consulta
  const [editado, setEditado] = useState(false)
  // El badge lo declara el llamador; acá sólo se decide si toca mostrarlo.
  const mostrarPrellenado = prellenado && !editado && !deshabilitado
  const vacioRequerido = requerido && value.trim() === ""

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {requerido && <span className="ml-0.5 text-danger">*</span>}
        </Label>
        {mostrarPrellenado && <PrellenadoBadge />}
      </div>
      <Input
        id={id}
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        placeholder={placeholder}
        disabled={deshabilitado}
        data-faltante={vacioRequerido ? "true" : undefined}
        onChange={(e) => {
          setEditado(true)
          onChange(e.target.value)
        }}
        className={cn(
          "min-h-12 text-base",
          vacioRequerido && "data-[faltante=true]:border-danger",
        )}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/* ---------- Select ---------- */
export function SelectField({
  label,
  value,
  onChange,
  opciones,
  placeholder = "Seleccionar…",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  opciones: readonly Opcion[]
  placeholder?: string
}) {
  const id = useFieldId("s")
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {/*
        `@base-ui` tipa el handler como `(value: string | null, …) => void`: el
        `null` es su forma de decir «se deseleccionó». Los consumidores de este
        campo trabajan con `string`, así que la conversión se hace una vez acá y
        no en cada uno de los ~40 `SelectField` del formulario.
      */}
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger id={id} className="min-h-12 w-full text-base">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {opciones.map((o) => (
            <SelectItem key={o.v} value={o.v} className="text-base">
              {o.l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/* ---------- Switch SÍ/NO ---------- */
export function SwitchField({
  label,
  checked,
  onChange,
  disabled,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  hint?: string
}) {
  const id = useFieldId("sw")
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <div className="flex flex-col">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

/* ---------- Rating de estrellas 1–5 ---------- */
export function StarsField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} de 5`}
            onClick={() => onChange(n)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <Star
              className={cn(
                "h-6 w-6",
                n <= value ? "fill-accent-orange text-accent-orange" : "text-border",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Multi-select de chips ---------- */
export function MultiChipField({
  label,
  opciones,
  seleccionadas,
  onToggle,
}: {
  label: string
  opciones: readonly string[]
  seleccionadas: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activo = seleccionadas.includes(o)
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-medium transition-all",
                activo
                  ? "border-brand bg-blue-50 text-brand"
                  : "border-border bg-background text-foreground",
              )}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}
