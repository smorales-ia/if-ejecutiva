"use client"

import * as React from "react"
import {
  AlertCircle,
  Download,
  FileText,
  ImageIcon,
  Info,
  Paperclip,
} from "lucide-react"

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
import { FileUploadZone } from "@/components/console/file-upload-zone"
import type { Adjunto } from "@/lib/adjuntos"
import { useAdjuntosSolicitud } from "@/lib/use-adjuntos-solicitud"
import { useTiposDocumento, type TipoDocumento } from "@/lib/use-tipos-documento"
import { type Solicitud } from "@/lib/console-data"

/**
 * Construye el estado del checklist cruzando el catálogo real de
 * `D_TipoDocumento` con los adjuntos ya persistidos en `TX_Adjuntos`.
 *
 * El cruce se hace por `clave_adjunto` (`fldaLLtzAaEn1O8IW`), que es el campo
 * donde `SC-Adjuntos-Upload` escribe el `tipo_documento` declarado — no por
 * `tipo`, un `singleSelect` heredado que el escenario Make nunca escribe.
 *
 * Un tipo que ya tiene adjunto queda marcado como requerido: si alguien lo
 * subió, es porque se exigía.
 */
function checklistDesdeAdjuntos(
  tipos: TipoDocumento[],
  adjuntos: Adjunto[],
): DocumentoChecklistItem[] {
  return tipos.map((t) => {
    const existente = adjuntos.find((a) => a.claveAdjunto === t.codigo)
    return {
      tipo_id: t.id,
      codigo: t.codigo,
      requerido_por_ejecutiva: existente
        ? true
        : false,
      archivo: existente
        ? {
            nombre: existente.nombre,
            tamanio_kb: 0,
            mime_type: "",
            url_local: existente.urlDropbox,
            adjunto_id: existente.id,
            persistido: true,
          }
        : null,
    }
  })
}

/**
 * Lo que este sheet **realmente** lee de la solicitud: cinco campos, no los
 * cuarenta de `Solicitud`.
 *
 * Se estrechó en **P5-TAS · R7** para que IF-03 pueda reutilizar el componente
 * sin fabricar un `Solicitud` completo. La alternativa era rellenar treinta
 * campos con `""` en un adaptador, y eso es peor que un tipo ancho: un dato
 * inventado no se distingue de uno real, y el día que este sheet lea
 * `solicitud.rut` recibiría cadena vacía en silencio.
 *
 * **No rompe a IF-02.** Un `Solicitud` completo satisface este tipo por
 * estructura, así que `solicitud-detail.tsx` sigue pasando `{...datos, estado}`
 * sin cambio alguno. Estrechar un parámetro es estrictamente más permisivo para
 * el llamador.
 *
 * Si el sheet pasa a leer un campo más, va acá — y el compilador señala a los
 * llamadores que no lo tengan, que es exactamente el aviso que se quiere.
 */
export type SolicitudParaSheetDocumentos = Pick<
  Solicitud,
  'id' | 'codigoExt' | 'cliente' | 'estado' | 'unidades'
>

interface DocumentosAdjuntosSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudParaSheetDocumentos
  /**
   * Modo consulta (RN-59). Lo calcula el detalle (`estado !== "creada" &&
   * tieneTasador`) y lo pasa aquí. Si no se provee, se degrada a la condición
   * por estado (compatibilidad con llamadores que aún no lo pasan).
   */
  readOnly?: boolean
  /**
   * Filtro opcional sobre el catálogo de `D_TipoDocumento` (**P5-TAS · R7**).
   *
   * Existe para que **IF-03 reutilice este sheet en vez de copiarlo**: RF-TAS-06
   * pide que el tasador vea sólo los documentos cuyo `tipo_propiedad` case con
   * el de la solicitud o sea `ambas`, y ese predicado vive en
   * `lib/tasador/tipo-propiedad.ts` (paliativo de **P-5**). Sin esta prop, la
   * única forma de tener el filtro era duplicar el componente, que es
   * exactamente lo que R7 prohíbe.
   *
   * **Aditiva por diseño.** Si no se pasa, no se filtra nada y el catálogo llega
   * entero: el llamador de IF-02 (`solicitud-detail.tsx`) no la pasa y su
   * comportamiento observable es idéntico al de antes de P5-TAS.
   *
   * El filtro se aplica **antes** de construir el checklist, de modo que el
   * contador "N/N con archivo" cuenta sobre lo que el usuario efectivamente ve.
   */
  filtroTipos?: (tipo: TipoDocumento) => boolean
}

export function DocumentosAdjuntosSheet({
  open,
  onOpenChange,
  solicitud,
  readOnly,
  filtroTipos,
}: DocumentosAdjuntosSheetProps) {
  // RN-59: modo consulta cuando estado ≠ "creada" Y hay tasador asignado. El
  // detalle ya lo evalúa; aquí sólo se respeta (con fallback por estado).
  const soloLectura = readOnly ?? solicitud.estado !== "creada"

  const { tipos: tiposCatalogo, cargando, error } = useTiposDocumento()

  /**
   * Catálogo efectivo. Sin `filtroTipos` es el catálogo entero — la identidad,
   * no una copia filtrada de todo, para que el llamador de IF-02 conserve
   * exactamente el comportamiento previo a P5-TAS.
   */
  const tipos = React.useMemo(
    () => (filtroTipos ? tiposCatalogo.filter(filtroTipos) : tiposCatalogo),
    [tiposCatalogo, filtroTipos],
  )

  const {
    adjuntos,
    cargando: cargandoAdjuntos,
    error: errorAdjuntos,
    sesionExpirada,
    recargar,
    eliminar,
    eliminandoId,
  } = useAdjuntosSolicitud(solicitud.id, open)

  // `eliminar` necesita el `codigo_ext` para el log del escenario; el checklist
  // sólo conoce el record ID del adjunto, así que se cierra aquí.
  const eliminarAdjunto = React.useCallback(
    (adjuntoRecordId: string) => eliminar(adjuntoRecordId, solicitud.codigoExt),
    [eliminar, solicitud.codigoExt],
  )

  const [checklist, setChecklist] = React.useState<DocumentoChecklistItem[]>([])

  // Recompone el checklist cuando cambia la solicitud, llega el catálogo o
  // cambia la lista de adjuntos (p. ej. tras una subida confirmada). Se pierden
  // las marcas que la Ejecutiva puso sin subir archivo, y es correcto: la
  // fuente de verdad de "qué se exige" es lo que hay en Airtable, no un estado
  // de UI que nadie persiste todavía.
  React.useEffect(() => {
    setChecklist(checklistDesdeAdjuntos(tipos, adjuntos))
  }, [solicitud.id, tipos, adjuntos])

  const totalMarcados = checklist.filter((d) => d.requerido_por_ejecutiva).length
  const totalConArchivo = checklist.filter((d) => d.archivo !== null).length
  const catalogoListo = !cargando && !error && tipos.length > 0

  // Adjuntos que no calzan con ningún tipo del catálogo: los sueltos.
  const codigosCatalogo = React.useMemo(
    () => new Set(tipos.map((t) => t.codigo)),
    [tipos],
  )
  const adjuntosLibres = React.useMemo(
    () => adjuntos.filter((a) => !a.claveAdjunto || !codigosCatalogo.has(a.claveAdjunto)),
    [adjuntos, codigosCatalogo],
  )

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

            {errorAdjuntos && (
              <AvisoCatalogo
                tono="error"
                mensaje={
                  sesionExpirada
                    ? "Tu sesión expiró. Recarga la página para continuar."
                    : "No pudimos cargar los adjuntos de esta solicitud. Intenta nuevamente en unos segundos."
                }
              />
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
                {catalogoListo && (
                  <Badge variant="secondary" className="shrink-0">
                    {totalConArchivo}/{totalMarcados || 0} con archivo
                  </Badge>
                )}
              </div>

              {/* Carga, error y catálogo vacío se distinguen entre sí: un
                  checklist en blanco sin aviso se lee como "no se requieren
                  documentos", que es la conclusión equivocada. */}
              {cargando || cargandoAdjuntos ? (
                <ChecklistSkeleton />
              ) : error ? (
                <AvisoCatalogo
                  tono="error"
                  mensaje="No pudimos completar la acción. Intenta nuevamente en unos segundos."
                />
              ) : tipos.length === 0 ? (
                /* Con `filtroTipos` activo hay dos causas distintas de lista
                   vacía y conviene no confundirlas: que el catálogo esté vacío
                   —problema de configuración— o que ninguno de sus tipos
                   aplique a esta propiedad, que es un resultado legítimo. */
                <AvisoCatalogo
                  tono="neutro"
                  mensaje={
                    tiposCatalogo.length === 0
                      ? "No hay tipos de documento configurados."
                      : "No hay documentos que apliquen a este tipo de propiedad."
                  }
                />
              ) : soloLectura ? (
                <ChecklistConsulta items={checklist} tipos={tipos} />
              ) : (
                <DocumentChecklist
                  value={checklist}
                  onChange={setChecklist}
                  tipos={tipos}
                  adjuntos={adjuntos}
                  // Resuelven el segmento `{Unidad}` del path Dropbox (§8.1).
                  // Con dos o más, el checklist exige elegir destino; el backend
                  // rechaza la subida si no llega (CI-003b).
                  unidades={solicitud.unidades}
                  solicitudId={solicitud.id}
                  codigoExt={solicitud.codigoExt}
                  readOnly={soloLectura}
                  eliminandoId={eliminandoId}
                  onSubido={recargar}
                  onEliminar={eliminarAdjunto}
                />
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

              {!soloLectura && (
                // Sin `tipoDocumento`: son adjuntos sueltos, sin tipo declarado.
                <FileUploadZone
                  solicitudId={solicitud.id}
                  codigoExt={solicitud.codigoExt}
                  // Mismo selector de destino que el checklist: sin esto, una
                  // solicitud multi-unidad recibe 422 `unidad_no_especificada`.
                  unidades={solicitud.unidades}
                  onUploaded={recargar}
                />
              )}

              <AdjuntosConsulta archivos={adjuntosLibres} />
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

/** Skeleton del checklist mientras carga `D_TipoDocumento`. */
function ChecklistSkeleton() {
  return (
    <ul className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
      <li className="sr-only">Cargando tipos de documento…</li>
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
          <span className="size-4 shrink-0 animate-pulse rounded bg-muted" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
            <span className="h-3 w-1/4 animate-pulse rounded bg-muted" />
          </div>
          <span className="h-8 w-24 shrink-0 animate-pulse rounded-md bg-muted" />
        </li>
      ))}
    </ul>
  )
}

/**
 * Aviso de catálogo no disponible o vacío. Sin toast: la Regla B reserva los
 * toasts para el resultado de una acción del usuario, y E-082 prohíbe celebrar
 * nada que no se haya verificado. Aquí no hubo acción — sólo una lectura que
 * no llegó.
 */
function AvisoCatalogo({
  tono,
  mensaje,
}: {
  tono: "error" | "neutro"
  mensaje: string
}) {
  if (tono === "neutro") {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        {mensaje}
      </p>
    )
  }
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[#b91c1c]/30 bg-[#b91c1c]/5 p-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#b91c1c]" />
      <p className="text-sm text-[#b91c1c]">{mensaje}</p>
    </div>
  )
}

/** Vista de sólo lectura del checklist (modo consulta · RN-59). */
function ChecklistConsulta({
  items,
  tipos,
}: {
  items: DocumentoChecklistItem[]
  tipos: TipoDocumento[]
}) {
  const marcados = items.filter((d) => d.requerido_por_ejecutiva)
  const visibles = marcados.length > 0 ? marcados : items
  return (
    <ul className="flex flex-col gap-2">
      {visibles.map((item) => {
        const meta = tipos.find((t) => t.codigo === item.codigo)
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
            {item.archivo?.url_local ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href={item.archivo.url_local}
                    target="_blank"
                    rel="noreferrer noopener"
                  />
                }
              >
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

/** Listado de adjuntos sueltos con visor/descarga. */
function AdjuntosConsulta({ archivos }: { archivos: Adjunto[] }) {
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
            {a.urlDropbox ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <a href={a.urlDropbox} target="_blank" rel="noreferrer noopener" />
                }
              >
                <Download data-icon="inline-start" />
                Descargar
              </Button>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground">
                <Paperclip className="size-3" />
              </Badge>
            )}
          </li>
        )
      })}
    </ul>
  )
}
