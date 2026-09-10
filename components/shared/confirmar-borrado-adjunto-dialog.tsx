"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { grupoCamposLimpiables } from "@/lib/adjuntos-doc-campos"

/**
 * Diálogo de confirmación de borrado de un adjunto, **compartido** por las tres
 * UIs que borran adjuntos: el checklist de la Ejecutiva y del Tasador
 * (`document-checklist.tsx`) y las fotos de la visita (`fotos-screen.tsx`).
 *
 * ## Por qué existe (Q3 · Tarea 5 · Fase B)
 *
 * El borrado de un adjunto ya no sólo quita el archivo: dispara el cascade que
 * **limpia los datos que ese documento pobló** en Airtable (SII, dominio,
 * unidades…). Como Airtable no tiene undo, la decisión de Héctor (Q3) es mostrar
 * antes qué datos se van a limpiar y exigir una confirmación explícita.
 *
 * ## Comportamiento (P-A · el diálogo aparece SIEMPRE)
 *
 * Se muestra en toda eliminación, tenga o no datos derivados. Cuando el tipo de
 * documento no purga nada (los 8 sin destino de §28, un adjunto suelto, o una
 * foto de registro), la **lista de campos no aparece** —sólo la confirmación y
 * el aviso de irreversibilidad—. La lista sale de `grupoCamposLimpiables`, la
 * misma fuente que usa el cascade: no pueden divergir.
 *
 * ## Regla D
 *
 * `eliminando` deshabilita ambos botones y pone spinner + gerundio en el
 * destructivo. El reset del estado vive en el consumidor (en su `finally`), no
 * aquí: este componente sólo refleja el `eliminando` que le pasan.
 */
export interface ConfirmarBorradoAdjuntoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Nombre del archivo, para que el usuario sepa cuál borra. */
  nombreAdjunto?: string | null
  /** Nombre humano del tipo de documento (`D_TipoDocumento.nombre`), si se conoce. */
  tipoDocumentoLabel?: string | null
  /**
   * `clave_adjunto` (= codigo de `D_TipoDocumento`). Determina qué campos se
   * listan como "se van a limpiar". Vacío/desconocido ⇒ sin lista.
   */
  tipoDocumentoCodigo?: string | null
  /** Regla D: borrado en vuelo. */
  eliminando: boolean
  /** Dispara el borrado real. El consumidor cierra el diálogo tras resolver. */
  onConfirmar: () => void
}

export function ConfirmarBorradoAdjuntoDialog({
  open,
  onOpenChange,
  nombreAdjunto,
  tipoDocumentoLabel,
  tipoDocumentoCodigo,
  eliminando,
  onConfirmar,
}: ConfirmarBorradoAdjuntoDialogProps) {
  const grupos = React.useMemo(
    () => grupoCamposLimpiables(tipoDocumentoCodigo),
    [tipoDocumentoCodigo]
  )
  const hayDatos = grupos.length > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este documento?</AlertDialogTitle>
          <AlertDialogDescription>
            {nombreAdjunto ? (
              <>
                Vas a eliminar <span className="font-medium">{nombreAdjunto}</span>
                {tipoDocumentoLabel ? <> · {tipoDocumentoLabel}</> : null}.
              </>
            ) : (
              <>Vas a eliminar este adjunto.</>
            )}{" "}
            El archivo se elimina de la solicitud y del almacenamiento. Esta acción
            no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hayDatos && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm">
            <p className="font-medium text-[#92400e]">
              También se limpiarán los datos que este documento aportó:
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {grupos.map((g) => (
                <div key={g.tablaLabel}>
                  <p className="text-xs font-medium text-[#92400e]">{g.tablaLabel}</p>
                  <ul className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#92400e]/90">
                    {g.labels.map((label) => (
                      <li key={label} className="list-inside list-disc">
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={eliminando}
            onClick={onConfirmar}
          >
            {eliminando && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {eliminando ? "Eliminando…" : "Eliminar definitivamente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
