"use client"

import * as React from "react"
import { Download, FileText, ImageIcon, Info, Paperclip } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DocumentChecklist,
  type DocumentoChecklistItem,
} from "@/components/console/document-checklist"
import {
  FileUploadZone,
  type ArchivoSubido,
} from "@/components/console/file-upload-zone"
import { TIPOS_DOCUMENTO, type Solicitud } from "@/lib/console-data"

/** Construye el estado inicial del checklist a partir del catálogo maestro. */
export function checklistInicial(): DocumentoChecklistItem[] {
  return TIPOS_DOCUMENTO.map((t) => ({
    tipo_id: t.id,
    codigo: t.codigo,
    requerido_por_ejecutiva: false,
    archivo: null,
  }))
}

interface DocumentosAdjuntosSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: Solicitud
}

export function DocumentosAdjuntosSheet({
  open,
  onOpenChange,
  solicitud,
}: DocumentosAdjuntosSheetProps) {
  // RN: modo consulta cuando la solicitud dejó el estado "creada".
  const soloLectura = solicitud.estado !== "creada"

  const [checklist, setChecklist] = React.useState<DocumentoChecklistItem[]>(
    checklistInicial,
  )
  const [adjuntosLibres, setAdjuntosLibres] = React.useState<ArchivoSubido[]>([])

  // Reinicia el estado local cuando cambia la solicitud seleccionada.
  React.useEffect(() => {
    setChecklist(checklistInicial())
    setAdjuntosLibres([])
  }, [solicitud.id])

  const totalMarcados = checklist.filter((d) => d.requerido_por_ejecutiva).length
  const totalConArchivo = checklist.filter((d) => d.archivo !== null).length

  function handleUploaded(archivos: ArchivoSubido[]) {
    setAdjuntosLibres((prev) => [...prev, ...archivos])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>Documentos y adjuntos</SheetTitle>
          <SheetDescription>
            {solicitud.codigoExt} · {solicitud.cliente}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 p-4">
            {soloLectura && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-[#d97706]" />
                <p className="text-sm text-[#92400e]">
                  Solicitud asignada · modo consulta. Los documentos no pueden
                  editarse mientras exista un tasador asignado.
                </p>
              </div>
            )}

            {/* Bloque 1 · Checklist de documentos requeridos */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-medium text-foreground">
                    Checklist de documentos requeridos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Marca los documentos exigidos y adjunta el archivo cuando lo
                    tengas.
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {totalConArchivo}/{totalMarcados || 0} con archivo
                </Badge>
              </div>

              {soloLectura ? (
                <ChecklistConsulta items={checklist} />
              ) : (
                <DocumentChecklist value={checklist} onChange={setChecklist} />
              )}
            </section>

            <Separator />

            {/* Bloque 2 · Zona de carga libre */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-medium text-foreground">
                  Adjuntos libres
                </h3>
                <p className="text-xs text-muted-foreground">
                  Capturas, correos u otros archivos que no calzan con el
                  checklist.
                </p>
              </div>

              {soloLectura ? (
                <AdjuntosConsulta archivos={adjuntosLibres} />
              ) : (
                <>
                  <FileUploadZone onUploaded={handleUploaded} />
                  {adjuntosLibres.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {adjuntosLibres.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Paperclip className="size-4" />
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">
                              {a.nombre}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {a.detalle}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/** Vista de sólo lectura del checklist (modo consulta). */
function ChecklistConsulta({ items }: { items: DocumentoChecklistItem[] }) {
  const marcados = items.filter((d) => d.requerido_por_ejecutiva)
  const visibles = marcados.length > 0 ? marcados : items
  return (
    <ul className="flex flex-col gap-2">
      {visibles.map((item) => {
        const meta = TIPOS_DOCUMENTO.find((t) => t.codigo === item.codigo)
        if (!meta) return null
        return (
          <li
            key={item.tipo_id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {meta.nombre}
              </span>
              <span className="text-xs text-muted-foreground">
                {meta.entidad_emisora}
              </span>
            </div>
            {item.archivo ? (
              <Button variant="outline" size="sm">
                <Download data-icon="inline-start" />
                Descargar
              </Button>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground">
                Sin archivo
              </Badge>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Listado de adjuntos libres con visor/descarga (modo consulta). */
function AdjuntosConsulta({ archivos }: { archivos: ArchivoSubido[] }) {
  if (archivos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        No hay adjuntos libres para esta solicitud.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {archivos.map((a) => {
        const esImagen = /\.(jpe?g|png)$/i.test(a.nombre)
        const Icon = esImagen ? ImageIcon : FileText
        return (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {a.nombre}
              </span>
              <span className="text-xs text-muted-foreground">{a.detalle}</span>
            </div>
            <Button variant="outline" size="sm">
              <Download data-icon="inline-start" />
              Descargar
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
