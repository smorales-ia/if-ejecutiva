"use client"

import { useMemo, useState } from "react"
import { Download, FileText, ImageIcon, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATEGORIAS_FOTO,
  type Tasacion,
  type InformeData,
} from "@/lib/tasaciones"
import { tipoDocumentoLabel } from "@/lib/tipos-documento"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"

const nf = new Intl.NumberFormat("es-CL")

function tamano(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1000) return `${Math.round(bytes / 1000)} KB`
  return `${bytes} B`
}

type Foto = { id: number; categoria: string }

/**
 * Expediente read-only (§7.3): lista todos los adjuntos (fotos + documentos)
 * agrupados, con preview de imagen embebido y descarga desde Dropbox.
 * NO permite alta ni baja de archivos.
 */
export function ExpedienteSheet({
  tasacion,
  payload,
  trigger,
}: {
  tasacion: Tasacion
  payload: InformeData
  trigger: React.ReactNode
}) {
  const [preview, setPreview] = useState<Foto | null>(null)

  // Fotos agrupadas por categoría (ids de placeholder).
  const gruposFoto = useMemo(() => {
    const predefinidas = CATEGORIAS_FOTO.map((c) => ({
      label: c.label,
      fotos: (payload.fotosPredefinidas[c.id] ?? []).map((id) => ({
        id,
        categoria: c.label,
      })),
    }))
    const custom = payload.categoriasCustom.map((c) => ({
      label: c.nombre,
      fotos: c.fotos.map((id) => ({ id, categoria: c.nombre })),
    }))
    return [...predefinidas, ...custom].filter((g) => g.fotos.length > 0)
  }, [payload])

  // Documentos cargados por tipo (ids de placeholder).
  const gruposDoc = useMemo(() => {
    return Object.entries(payload.documentosCargados ?? {})
      .filter(([, ids]) => ids.length > 0)
      .map(([tipo, ids]) => ({
        label: tipoDocumentoLabel(tipo),
        archivos: ids.map((id, i) => ({
          id,
          nombre: `${tipo}_${i + 1}.pdf`,
        })),
      }))
  }, [payload])

  // Adjuntos de la solicitud (Dropbox) entregados por la ejecutiva.
  const adjuntos = tasacion.adjuntosDropbox ?? []

  const totalFotos = gruposFoto.reduce((a, g) => a + g.fotos.length, 0)
  const totalArchivos =
    totalFotos + gruposDoc.reduce((a, g) => a + g.archivos.length, 0) + adjuntos.length

  const previewSrc = preview
    ? `/placeholder.svg?height=600&width=800&query=fotografia%20${encodeURIComponent(
        preview.categoria,
      )}%20tasacion%20inmueble`
    : ""

  return (
    <Sheet>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{`Expediente · ${tasacion.codigo}`}</SheetTitle>
          <SheetDescription>
            {totalArchivos} archivos · solo lectura
          </SheetDescription>
        </SheetHeader>

        {preview ? (
          /* Preview a pantalla completa dentro del sheet */
          <div className="flex flex-1 flex-col overflow-hidden">
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="flex items-center gap-2 border-b border-border px-5 py-3 text-sm font-semibold text-vp-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al expediente
            </button>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-vp-surface p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc || "/placeholder.svg"}
                alt={`Fotografía de ${preview.categoria}`}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>
            <p className="border-t border-border px-5 py-3 text-sm text-vp-text-secondary">
              {preview.categoria} · IMG_{preview.id}.jpg
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-6">
              {/* Fotografías */}
              {gruposFoto.map((g) => (
                <section key={g.label}>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <ImageIcon className="h-4 w-4 text-vp-primary" />
                    {g.label}
                    <span className="text-vp-text-secondary">({g.fotos.length})</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {g.fotos.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPreview(f)}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-vp-surface"
                        aria-label={`Ver fotografía ${f.id} de ${g.label}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/placeholder.svg?height=160&width=160&query=fotografia%20${encodeURIComponent(
                            g.label,
                          )}`}
                          alt={`Miniatura ${g.label}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              {/* Documentos cargados por el tasador */}
              {gruposDoc.map((g) => (
                <section key={g.label}>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-vp-primary" />
                    {g.label}
                    <span className="text-vp-text-secondary">({g.archivos.length})</span>
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {g.archivos.map((a) => (
                      <ArchivoRow key={a.id} nombre={a.nombre} />
                    ))}
                  </ul>
                </section>
              ))}

              {/* Adjuntos de la solicitud (Dropbox) */}
              {adjuntos.length > 0 && (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-vp-primary" />
                    Adjuntos de la solicitud
                    <span className="text-vp-text-secondary">({adjuntos.length})</span>
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {adjuntos.map((a) => (
                      <ArchivoRow
                        key={a.nombre}
                        nombre={a.nombre}
                        detalle={tamano(a.sizeBytes)}
                        url={a.url}
                      />
                    ))}
                  </ul>
                </section>
              )}

              {totalArchivos === 0 && (
                <p className="py-8 text-center text-sm text-vp-text-secondary">
                  No hay archivos en el expediente.
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

/** Fila de archivo con icono PDF, nombre y botón Descargar (abre Dropbox en nueva pestaña). */
function ArchivoRow({
  nombre,
  detalle,
  url,
}: {
  nombre: string
  detalle?: string
  url?: string
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-vp-danger">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{nombre}</p>
        {detalle ? (
          <p className="text-xs text-vp-text-secondary">{detalle}</p>
        ) : null}
      </div>
      <a
        href={url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold",
          "bg-vp-surface text-vp-primary hover:bg-blue-50",
        )}
      >
        <Download className="h-4 w-4" />
        Descargar
      </a>
    </li>
  )
}
