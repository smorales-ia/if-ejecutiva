"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  enmascararFecha,
  enmascararHora,
  fechaUsuarioAIso,
  horaValida,
  isoAFechaUsuario,
} from "@/lib/fechas"

/**
 * Campos de fecha que se escriben en `dd/mm/aaaa` (PRD «Temas 1» R5).
 *
 * Reemplazan a `<input type="date">` y `type="datetime-local"`, que muestran el
 * formato del idioma del navegador: en uno en inglés la fecha de visita se lee
 * `04/13/2026`, y esa fecha fija la UF del cálculo.
 *
 * **Hacia afuera reciben y entregan ISO** (`YYYY-MM-DD`; `YYYY-MM-DDTHH:mm` el
 * de fecha y hora), igual que el input nativo: formularios, zod, Route Handlers
 * y payloads a Make no cambian. Mientras el texto está incompleto o no es una
 * fecha real (31/02) entregan `""`, que es lo que el nativo entrega en el mismo
 * caso; el campo además lo marca y explica.
 *
 * Se pierde el calendario desplegable nativo (Q8 · sin dependencias nuevas).
 */

export const MENSAJE_FECHA_INVALIDA =
  "Revisa la fecha: debe existir y escribirse como dd/mm/aaaa. Ej.: 13/04/2026."

export const MENSAJE_HORA_INVALIDA =
  "Revisa la hora: usa el formato de 24 horas hh:mm. Ej.: 09:30."

type PropsNativas = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type"
>

/** Une los ids no vacíos de un `aria-describedby`. */
function ids(...v: (string | false | undefined)[]): string {
  return v.filter(Boolean).join(" ")
}

/**
 * Texto local de un campo, resincronizado sólo cuando el valor externo cambia a
 * algo que el texto actual no representa (un reset, una precarga). Mientras el
 * usuario escribe, el externo vale `""` o el ISO de lo escrito, y el texto a
 * medio escribir no se pisa.
 */
function useTextoSincronizado(
  valor: string,
  aTexto: (v: string) => string,
  representa: (texto: string) => string,
) {
  const [texto, setTexto] = React.useState(() => aTexto(valor))
  const [previo, setPrevio] = React.useState(valor)
  if (valor !== previo) {
    setPrevio(valor)
    if (valor !== representa(texto)) setTexto(aTexto(valor))
  }
  return [texto, setTexto] as const
}

const isoDeTexto = (t: string) => fechaUsuarioAIso(t) ?? ""

export function FechaInput({
  value,
  onChange,
  onBlur,
  className,
  wrapperClassName,
  "aria-describedby": describedBy,
  ...props
}: PropsNativas & {
  /** `YYYY-MM-DD` o `""`. */
  value: string
  /** Recibe `YYYY-MM-DD`, o `""` si el texto está vacío, incompleto o no es una fecha real. */
  onChange: (iso: string) => void
  wrapperClassName?: string
}) {
  const base = React.useId()
  const formatoId = `${base}-formato`
  const errorId = `${base}-error`
  const [texto, setTexto] = useTextoSincronizado(value, isoAFechaUsuario, isoDeTexto)
  const [salio, setSalio] = React.useState(false)

  // Completo y no es fecha real (31/02), o quedó a medias al salir del campo.
  const invalido = texto !== "" && isoDeTexto(texto) === "" && (texto.length === 10 || salio)

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-1", wrapperClassName)}>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={texto}
        aria-invalid={invalido || undefined}
        aria-describedby={ids(formatoId, invalido && errorId, describedBy)}
        onChange={(e) => {
          const t = enmascararFecha(e.target.value)
          setTexto(t)
          setSalio(false)
          const iso = isoDeTexto(t)
          if (iso !== value) onChange(iso)
        }}
        onBlur={(e) => {
          setSalio(true)
          onBlur?.(e)
        }}
        className={className}
      />
      <span id={formatoId} className="sr-only">
        Formato dd/mm/aaaa
      </span>
      {invalido && (
        <p id={errorId} className="text-xs font-medium text-danger">
          {MENSAJE_FECHA_INVALIDA}
        </p>
      )}
    </div>
  )
}

const RE_FECHA_HORA = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/

function partir(v: string): { fecha: string; hora: string } {
  const m = RE_FECHA_HORA.exec(v)
  return m ? { fecha: m[1], hora: m[2] } : { fecha: "", hora: "" }
}

function componer(fecha: string, hora: string): string {
  const h = horaValida(hora)
  return fecha && h ? `${fecha}T${h}` : ""
}

/**
 * Fecha + hora (24 h) en dos campos. El valor es el mismo texto que entregaba
 * `datetime-local` (`YYYY-MM-DDTHH:mm`, sin zona): la zona la pone quien lo
 * consume, como antes.
 */
export function FechaHoraInput({
  value,
  onChange,
  disabled,
  id,
}: {
  /** `YYYY-MM-DDTHH:mm` o `""`. */
  value: string
  /** Recibe `YYYY-MM-DDTHH:mm`, o `""` mientras falte la fecha o la hora. */
  onChange: (valor: string) => void
  disabled?: boolean
  id?: string
}) {
  const base = React.useId()
  const horaFormatoId = `${base}-hora-formato`
  const horaErrorId = `${base}-hora-error`
  const [fecha, setFecha] = React.useState(() => partir(value).fecha)
  const [hora, setHora] = React.useState(() => partir(value).hora)
  const [previo, setPrevio] = React.useState(value)
  const [salioHora, setSalioHora] = React.useState(false)

  if (value !== previo) {
    setPrevio(value)
    if (value !== componer(fecha, hora)) {
      const p = partir(value)
      setFecha(p.fecha)
      setHora(p.hora)
    }
  }

  const emitir = (f: string, h: string) => {
    const v = componer(f, h)
    if (v !== value) onChange(v)
  }

  const horaInvalida =
    hora !== "" && horaValida(hora) === null && (hora.length === 5 || salioHora)

  return (
    <div className="flex w-full min-w-0 items-start gap-2">
      <FechaInput
        id={id}
        value={fecha}
        disabled={disabled}
        onChange={(f) => {
          setFecha(f)
          emitir(f, hora)
        }}
        wrapperClassName="flex-1"
      />
      <div className="flex w-28 shrink-0 flex-col gap-1">
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="hh:mm"
          maxLength={5}
          value={hora}
          disabled={disabled}
          aria-label="Hora (24 horas)"
          aria-invalid={horaInvalida || undefined}
          aria-describedby={ids(horaFormatoId, horaInvalida && horaErrorId)}
          onChange={(e) => {
            const h = enmascararHora(e.target.value)
            setHora(h)
            setSalioHora(false)
            emitir(fecha, h)
          }}
          onBlur={() => setSalioHora(true)}
        />
        <span id={horaFormatoId} className="sr-only">
          Formato hh:mm, 24 horas
        </span>
        {horaInvalida && (
          <p id={horaErrorId} className="text-xs font-medium text-danger">
            {MENSAJE_HORA_INVALIDA}
          </p>
        )}
      </div>
    </div>
  )
}
