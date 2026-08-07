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
  ETIQUETA_COMUN,
  etiquetaDestino,
  etiquetaUnidad,
  type DestinoUnidad,
} from "@/lib/adjuntos-destino"
import type { Unidad } from "@/lib/console-data"

/** Texto del trigger cuando no hay destino elegido, o cuando el elegido ya no existe. */
const PLACEHOLDER = "Elige la unidad"

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
 *
 * ## Por qué `SelectValue` lleva función de formato
 *
 * `Select.Value` de `@base-ui/react` renderiza el `value` **crudo** salvo que se
 * le pase `children` como función. Sin ella, el trigger cerrado mostraba
 * `recTzdOaalt8Doa5L` o `__comun__` mientras la lista abierta mostraba las
 * etiquetas bien. Los demás `Select` del repo no exhiben el defecto porque en
 * todos ellos el `value` coincide con la etiqueta; éste es el primero donde no.
 *
 * El `placeholder` queda anulado por `children` —así lo documenta el tipo de
 * base-ui—, por eso la función lo devuelve explícitamente cuando no hay etiqueta
 * que mostrar.
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
        <SelectValue placeholder={PLACEHOLDER}>
          {(valor) => etiquetaDestino(String(valor ?? ""), unidades) || PLACEHOLDER}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {unidades.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {etiquetaUnidad(u, unidades)}
            </SelectItem>
          ))}
          {/* Siempre al final de la lista: es el destino que no es una unidad.
              La etiqueta sale de la constante compartida para que la opción y el
              trigger cerrado no puedan mostrar textos distintos. */}
          <SelectItem value={DESTINO_COMUN}>{ETIQUETA_COMUN}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
