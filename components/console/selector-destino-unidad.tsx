"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DESTINO_COMUN,
  etiquetaUnidad,
  type DestinoUnidad,
} from "@/lib/adjuntos-destino"
import type { Unidad } from "@/lib/console-data"

interface SelectorDestinoUnidadProps {
  value: DestinoUnidad
  onValueChange: (destino: DestinoUnidad) => void
  unidades: Unidad[]
  disabled?: boolean
  id?: string
  className?: string
  "aria-label"?: string
}

/**
 * Selector de destino Dropbox: una entrada por unidad declarada más «Común a
 * todas las unidades» al final de la lista.
 *
 * Lo comparten los dos bloques que suben adjuntos a una solicitud: el checklist
 * de documentos requeridos —donde aparece una vez como destino por defecto y
 * otra por fila, como override— y la zona de adjuntos libres, donde aparece una
 * sola vez para toda la tanda. Las opciones y su orden son idénticos en los
 * tres sitios a propósito: es el mismo dato y la misma decisión.
 */
export function SelectorDestinoUnidad({
  value,
  onValueChange,
  unidades,
  disabled,
  id,
  className,
  "aria-label": ariaLabel,
}: SelectorDestinoUnidadProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v ?? "")} disabled={disabled}>
      <SelectTrigger id={id} className={className} aria-label={ariaLabel}>
        <SelectValue placeholder="Elige la unidad" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {unidades.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {etiquetaUnidad(u, unidades)}
            </SelectItem>
          ))}
          {/* Siempre al final de la lista: es el destino que no es una unidad. */}
          <SelectItem value={DESTINO_COMUN}>Común a todas las unidades</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
