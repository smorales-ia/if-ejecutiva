"use client"

import { useMemo } from "react"
import type { Dispatch, SetStateAction } from "react"
import { FileText, Upload, X, Check, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTiposDocumento, type TipoDocumento } from "@/lib/use-tipos-documento"
import {
  desdeTipoPropiedadNuevoUsado,
  documentoAplicaA,
} from "@/lib/tasador/tipo-propiedad"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export type DocsPorTipo = Record<string, number[]>

let docUid = 5000

/** Zona de carga reutilizable (equivalente a FileUploadZone de la ejecutiva). */
function FileUploadZone({
  doc,
  archivos,
  onAdd,
  onRemove,
}: {
  doc: TipoDocumento
  archivos: number[]
  onAdd: () => void
  onRemove: (n: number) => void
}) {
  const cargado = archivos.length > 0
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        cargado ? "border-vp-success/40 bg-emerald-50/50" : "border-dashed border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText
            className={cn(
              "h-4 w-4 shrink-0",
              cargado ? "text-vp-success" : "text-vp-text-secondary",
            )}
            aria-hidden="true"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{doc.nombre}</span>
            {/*
              El v0 mostraba acá "Obligatorio" / "Opcional". **Ese campo no
              existe**: `D_TipoDocumento` no tiene `obligatorio`, y lo más
              parecido —`requerido_por_ejecutiva`— es del checklist de la
              Ejecutiva, no del Tasador. Inventar la distinción habría sido
              mezclar dos dominios; se muestra el emisor, que sí es un dato
              real del catálogo. Ver la ficha CI abierta en P2-TAS.B.
            */}
            {doc.entidad_emisora && (
              <span className="text-xs text-vp-text-secondary">{doc.entidad_emisora}</span>
            )}
          </div>
        </div>
        {cargado && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-vp-success">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {archivos.length}
          </span>
        )}
      </div>

      {cargado && (
        <ul className="mt-2 flex flex-col gap-1">
          {archivos.map((n, i) => (
            <li
              key={n}
              className="flex items-center justify-between gap-2 rounded-md bg-background px-2 py-1.5 text-xs"
            >
              <span className="flex items-center gap-1.5 truncate text-foreground">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-vp-text-secondary" aria-hidden="true" />
                {doc.id}_{i + 1}.pdf
              </span>
              <button
                type="button"
                onClick={() => onRemove(n)}
                aria-label={`Quitar archivo ${i + 1} de ${doc.nombre}`}
                className="flex h-6 w-6 items-center justify-center rounded-md text-vp-danger hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="mt-2 min-h-9 w-full border-vp-primary text-sm font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark"
      >
        <Upload className="h-4 w-4" />
        {cargado ? "Agregar otro" : "Subir archivo"}
      </Button>
    </div>
  )
}

function Grupo({
  titulo,
  docs,
  value,
  onAdd,
  onRemove,
}: {
  titulo: string
  docs: TipoDocumento[]
  value: DocsPorTipo
  onAdd: (id: string) => void
  onRemove: (id: string, n: number) => void
}) {
  if (docs.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-vp-text-secondary">
        {titulo}
      </h3>
      {docs.map((d) => (
        <FileUploadZone
          key={d.id}
          doc={d}
          archivos={value[d.id] ?? []}
          onAdd={() => onAdd(d.id)}
          onRemove={(n) => onRemove(d.id, n)}
        />
      ))}
    </div>
  )
}

export function SheetDocumentos({
  codigo,
  tipoPropiedad,
  docs,
  setDocs,
}: {
  codigo: string
  tipoPropiedad: "nuevo" | "usado" | undefined
  docs: DocsPorTipo
  setDocs: Dispatch<SetStateAction<DocsPorTipo>>
}) {
  /*
   * El catálogo viene del API (`/api/tipos-documento`), no de un enum en el
   * cliente: es la misma lectura que usa la consola de la Ejecutiva, así que
   * los dos checklists no pueden divergir.
   */
  const { tipos, cargando, error } = useTiposDocumento()

  /*
   * P-5 · el filtro cruza dos dominios con géneros distintos
   * (`nuevo · usado` en `TX_Solicitudes` contra `nueva · usada · ambas` en
   * `D_TipoDocumento`). La traducción vive en un solo módulo; acá no se
   * compara ningún literal a mano.
   */
  const aplicables = useMemo(() => {
    const condicion = desdeTipoPropiedadNuevoUsado(tipoPropiedad)
    return tipos.filter((d) => documentoAplicaA(d.tipo_propiedad, condicion))
  }, [tipos, tipoPropiedad])

  // Mock: la carga agrega un archivo placeholder al tipo indicado.
  const addArchivo = (id: string) =>
    setDocs((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), docUid++] }))

  const remove = (id: string, n: number) =>
    setDocs((prev) => ({ ...prev, [id]: (prev[id] ?? []).filter((x) => x !== n) }))

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full border-vp-primary text-base font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark"
          />
        }
      >
        <FileText className="h-4 w-4" />
        Cargar documentos de la propiedad
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Documentos de la propiedad</SheetTitle>
          <SheetDescription>
            {codigo} · {tipoPropiedad === "nuevo" ? "Propiedad nueva" : "Propiedad usada"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-5">
            {/*
              Cargando, error y catálogo vacío se dicen distinto a propósito: un
              checklist en blanco sin aviso se lee como «esta propiedad no
              requiere documentos», que es la conclusión equivocada.
            */}
            {cargando && (
              <p className="py-6 text-center text-sm text-vp-text-secondary">
                Cargando documentos…
              </p>
            )}
            {!cargando && error && (
              <p className="py-6 text-center text-sm text-vp-danger">
                No pudimos cargar la lista de documentos. Intenta nuevamente en unos
                segundos.
              </p>
            )}
            {!cargando && !error && aplicables.length === 0 && (
              <p className="py-6 text-center text-sm text-vp-text-secondary">
                No hay documentos declarados para esta propiedad.
              </p>
            )}
            {!cargando && !error && aplicables.length > 0 && (
              <Grupo
                titulo="Documentos"
                docs={aplicables}
                value={docs}
                onAdd={addArchivo}
                onRemove={remove}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
