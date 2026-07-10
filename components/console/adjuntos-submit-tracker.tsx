"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type AdjuntoSubmitEstado =
  | "pendiente"
  | "subiendo"
  | "listo"
  | "error"
  | "cancelado"

export interface AdjuntoSubmitItem {
  id: string
  nombre: string
  tamanioKb: number
  estado: AdjuntoSubmitEstado
  progreso: number
  error?: string
  esImagen?: boolean
}

interface AdjuntosSubmitTrackerProps {
  codigoExt: string
  items: AdjuntoSubmitItem[]
  onCancelarArchivo: (id: string) => void
  onCancelarTodo: () => void
  onReintentarFaltantes: () => void
  onContinuarSinFaltantes: () => void
  onCerrar: () => void
  className?: string
}

function formatearTamano(kb: number): string {
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function AdjuntosSubmitTracker({
  codigoExt,
  items,
  onCancelarArchivo,
  onCancelarTodo,
  onReintentarFaltantes,
  onContinuarSinFaltantes,
  onCerrar,
  className,
}: AdjuntosSubmitTrackerProps) {
  const enCurso = items.filter(
    (i) => i.estado === "pendiente" || i.estado === "subiendo"
  )
  const listos = items.filter((i) => i.estado === "listo")
  const conError = items.filter((i) => i.estado === "error")
  const terminado = enCurso.length === 0

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          Solicitud {codigoExt} creada <CheckCircle2 className="inline size-4 text-(--color-op-green)" />
        </p>
        <p className="text-xs text-muted-foreground">
          {terminado
            ? `Subieron ${listos.length} de ${items.length} documento${items.length === 1 ? "" : "s"}.`
            : `Subiendo ${items.length - enCurso.length}/${items.length} documentos…`}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.esImagen ? ImageIcon : FileText
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-card p-3",
                item.estado === "error" ? "border-destructive/60" : "border-border"
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md",
                  item.estado === "error"
                    ? "bg-destructive/10 text-destructive"
                    : item.estado === "listo"
                      ? "bg-(--color-op-green)/10 text-(--color-op-green)"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {item.estado === "error" && <AlertCircle className="size-4" />}
                {item.estado === "listo" && <CheckCircle2 className="size-4" />}
                {(item.estado === "subiendo" || item.estado === "pendiente") && (
                  <Icon className="size-4" />
                )}
                {item.estado === "cancelado" && <X className="size-4" />}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.nombre}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatearTamano(item.tamanioKb)}
                  </span>
                </div>

                {item.estado === "error" ? (
                  <span className="text-xs font-medium text-destructive">
                    {item.error ?? "No se pudo subir."}
                  </span>
                ) : item.estado === "subiendo" ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
                    <Progress value={item.progreso} className="flex-1" />
                    <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                      {item.progreso}%
                    </span>
                  </div>
                ) : item.estado === "listo" ? (
                  <span className="text-xs text-muted-foreground">Subido correctamente</span>
                ) : item.estado === "cancelado" ? (
                  <span className="text-xs text-muted-foreground">Cancelado</span>
                ) : (
                  <span className="text-xs text-muted-foreground">En espera…</span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {item.estado === "error" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancelarArchivo(item.id)}
                  >
                    <RotateCcw data-icon="inline-start" />
                    Reintentar
                  </Button>
                )}
                {(item.estado === "subiendo" || item.estado === "pendiente") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Cancelar subida"
                    onClick={() => onCancelarArchivo(item.id)}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-end gap-2">
        {!terminado && (
          <Button variant="outline" onClick={onCancelarTodo}>
            Cancelar todo
          </Button>
        )}
        {terminado && conError.length > 0 && (
          <>
            <Button variant="outline" onClick={onContinuarSinFaltantes}>
              Continuar sin ellos
            </Button>
            <Button
              onClick={onReintentarFaltantes}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Reintentar los faltantes
            </Button>
          </>
        )}
        {terminado && conError.length === 0 && (
          <Button onClick={onCerrar} className="bg-brand text-brand-foreground hover:bg-brand/90">
            Cerrar
          </Button>
        )}
      </div>
    </div>
  )
}
