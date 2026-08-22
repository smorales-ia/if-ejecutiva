"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Camera, FileText } from "lucide-react"
import {
  resolverInforme,
  CATEGORIAS_FOTO,
  type Tasacion,
  type InformeData,
  type FotoCategoriaCustom,
} from "@/lib/tasaciones"
import { readPayload, writePayload } from "@/lib/tasador/tasador-store"
import { Button } from "@/components/ui/button"
import {
  FotosCategorizadas,
  evaluarCategorias,
  evaluarCustom,
  type FotosPorCategoria,
} from "@/components/tasador/fotos-categorizadas"
import { DocumentosAdjuntosSheet } from "@/components/console/documentos-adjuntos-sheet"
import { aSolicitudParaSheet } from "@/lib/tasador/adaptador-solicitud"
import {
  desdeTipoPropiedadNuevoUsado,
  documentoAplicaA,
} from "@/lib/tasador/tipo-propiedad"
import { useAdjuntosSolicitud } from "@/lib/use-adjuntos-solicitud"
import type { TipoDocumento } from "@/lib/use-tipos-documento"

const FOTO_IDS = CATEGORIAS_FOTO.map((c) => c.id)

function toFull(parcial: Record<string, number[]>): FotosPorCategoria {
  const full = {} as FotosPorCategoria
  for (const id of FOTO_IDS) full[id] = parcial[id] ?? []
  return full
}

export function FotosScreen({ tasacion }: { tasacion: Tasacion }) {
  const router = useRouter()
  const d = tasacion.datos

  const [form, setForm] = useState<InformeData>(
    () => readPayload(tasacion.id) ?? resolverInforme(tasacion),
  )

  // Sincroniza los cambios de fotos con el store compartido.
  useEffect(() => {
    writePayload(tasacion.id, form)
  }, [tasacion.id, form])

  const fotos = useMemo(() => toFull(form.fotosPredefinidas), [form.fotosPredefinidas])
  const setFotos: Dispatch<SetStateAction<FotosPorCategoria>> = useCallback((action) => {
    setForm((prev) => {
      const current = toFull(prev.fotosPredefinidas)
      const next =
        typeof action === "function"
          ? (action as (p: FotosPorCategoria) => FotosPorCategoria)(current)
          : action
      return { ...prev, fotosPredefinidas: next }
    })
  }, [])
  const setCustom: Dispatch<SetStateAction<FotoCategoriaCustom[]>> = useCallback(
    (action) => {
      setForm((prev) => {
        const next =
          typeof action === "function"
            ? (action as (p: FotoCategoriaCustom[]) => FotoCategoriaCustom[])(
                prev.categoriasCustom,
              )
            : action
        return { ...prev, categoriasCustom: next }
      })
    },
    [],
  )

  /**
   * Sheet documental de la ejecutiva, **reutilizado tal cual** (R7 · RF-TAS-06).
   * Hasta P5-TAS esta pantalla abría una copia de 242 líneas en
   * `components/tasador/sheet-documentos.tsx`, que se eliminó.
   */
  const [docsOpen, setDocsOpen] = useState(false)

  /**
   * Conteo real de documentos para el "N docs" de la cabecera.
   *
   * `activo = !docsOpen` no es un truco: hace que la lectura ocurra al montar y
   * **se repita cuando el sheet se cierra**, que es justo cuando el número pudo
   * cambiar. Mientras el sheet está abierto, el suyo es el que manda; duplicar
   * la consulta ahí sólo sumaría presión sobre el límite de 5 req/s de Airtable
   * que ya documenta `GET /api/solicitudes/[id]/adjuntos`.
   */
  const { adjuntos } = useAdjuntosSolicitud(tasacion.id, !docsOpen)
  const totalDocumentos = adjuntos.length

  /**
   * Filtro de RF-TAS-06: sólo los documentos cuyo `tipo_propiedad` case con la
   * condición de la solicitud, o sea `ambas`.
   *
   * El predicado vive en `lib/tasador/tipo-propiedad.ts` — **paliativo de P-5**,
   * porque los dos dominios de Airtable difieren en género (`nuevo`/`usado` en
   * `TX_Solicitudes`, `nueva`/`usada`/`ambas` en `D_TipoDocumento`) y la
   * comparación literal no casa nunca. Ningún literal de género aparece acá.
   */
  const condicion = useMemo(
    () => desdeTipoPropiedadNuevoUsado(tasacion.tipoPropiedad),
    [tasacion.tipoPropiedad],
  )
  const filtroTipos = useCallback(
    (t: TipoDocumento) => documentoAplicaA(t.tipo_propiedad, condicion),
    [condicion],
  )

  const solicitudParaSheet = useMemo(() => aSolicitudParaSheet(tasacion), [tasacion])

  const declarados = useMemo(
    () => ({
      dorm: Number(form.dormitorios) || 0,
      banos: Number(form.banos) || 0,
      estac: Number(form.estacionamientos) || 0,
    }),
    [form.dormitorios, form.banos, form.estacionamientos],
  )

  const estadosFoto = evaluarCategorias(fotos, declarados)
  const estadosCustom = evaluarCustom(form.categoriasCustom)
  const todas = [...estadosFoto, ...estadosCustom]
  const totalFotos = todas.reduce((a, e) => a + e.count, 0)
  const faltan = todas.filter((e) => !e.completa)
  const completas = faltan.length === 0

  const continuar = () => {
    writePayload(tasacion.id, form)
    router.push(`/tasaciones/${tasacion.id}/lectura`)
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-vp-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/tasaciones"
              aria-label="Volver a mis tasaciones"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-vp-surface"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {tasacion.codigo}
              </span>
              <span className="text-xs text-vp-text-secondary">Fotos de la visita</span>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              completas ? "bg-emerald-50 text-vp-success" : "bg-amber-50 text-vp-warning"
            }`}
          >
            {totalFotos} fotos · {totalDocumentos} docs
          </span>
        </div>
      </header>

      <main className="px-4 pb-32 pt-4">
        <div className="rounded-xl bg-background p-4">
          <p className="text-base font-medium text-foreground">
            {d.comuna.valor} · {d.tipo.valor}
          </p>
          <p className="mt-0.5 text-base text-foreground">{d.direccion.valor}</p>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDocsOpen(true)}
            className="min-h-12 w-full border-vp-primary text-base font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark"
          >
            <FileText className="h-4 w-4" />
            Cargar documentos de la propiedad
          </Button>
          {/* `readOnly={false}` es obligatorio y no redundante: sin él, el sheet
              degrada a consulta con cualquier estado distinto de `creada`, y una
              tasación siempre está en `asignada` o posterior — el tasador vería
              el checklist sin poder subir nada. */}
          <DocumentosAdjuntosSheet
            open={docsOpen}
            onOpenChange={setDocsOpen}
            solicitud={solicitudParaSheet}
            readOnly={false}
            filtroTipos={filtroTipos}
          />
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-sm text-vp-text-secondary">
          <Camera className="h-4 w-4 shrink-0" aria-hidden="true" />
          Cada foto se asocia a una categoría. Mínimos según lo declarado.
        </p>

        <div className="mt-3">
          <FotosCategorizadas
            fotos={fotos}
            setFotos={setFotos}
            declarados={declarados}
            custom={form.categoriasCustom}
            setCustom={setCustom}
          />
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl items-center gap-3 border-t border-border bg-background px-4 py-3 shadow-lg">
        <Button
          render={<Link href="/tasaciones" />}
          nativeButton={false}
          variant="outline"
          className="min-h-12 border-vp-primary px-4 text-base font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button
          type="button"
          onClick={continuar}
          className="min-h-12 flex-1 bg-vp-primary text-base font-semibold text-white hover:bg-vp-primary-dark"
        >
          Continuar con datos de la visita
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  )
}
