"use client"

import { useRef } from "react"
import { Camera, Check, CloudOff, Loader2, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATEGORIAS_FOTO,
  type CategoriaFotoId,
  type FotoAdjunta,
  type FotoCategoriaCustom,
} from "@/lib/tasador/tasaciones"
import {
  minimoCategoriaPersonalizada,
  resolverMaximo,
  resolverMinimo,
  type DeclaradosSeccionB,
} from "@/lib/tasador/minimos-fotos"
import { Button } from "@/components/ui/button"
import { FotoCategoriaCreator } from "@/components/tasador/foto-categoria-creator"

export type FotosPorCategoria = Record<CategoriaFotoId, FotoAdjunta[]>

export type EstadoCategoria = {
  id: string
  label: string
  count: number
  min: number
  max: number | null
  completa: boolean
  faltan: number
}

/**
 * Estado de las ocho categorías del catálogo.
 *
 * **Ningún mínimo se calcula acá** (§6.3): `resolverMinimo` y `resolverMaximo`
 * viven en `lib/tasador/minimos-fotos.ts`, que es el punto único de **A-16**.
 */
export function evaluarCategorias(
  fotos: FotosPorCategoria,
  declarados: DeclaradosSeccionB,
): EstadoCategoria[] {
  return CATEGORIAS_FOTO.map((c) => {
    const min = resolverMinimo(c.id, declarados)
    const max = resolverMaximo(c.id, declarados)
    const count = fotos[c.id]?.length ?? 0
    const faltan = Math.max(0, min - count)
    return { id: c.id, label: c.label, count, min, max, completa: count >= min, faltan }
  })
}

/**
 * Estado de las categorías personalizadas.
 *
 * **No exigen mínimo** (spec §2.6 · criterio de RF-TAS-14): están `completa`
 * desde que se crean, incluso con cero fotos. Antes de P5-TAS se creaban con
 * `minimo: 1`, de modo que una categoría recién creada aparecía marcada como
 * incompleta y contaba contra el estado global de la pantalla — lo contrario de
 * lo que pide el requisito.
 *
 * `c.minimo` se sigue leyendo del dato por compatibilidad con los borradores ya
 * guardados en `localStorage`, que lo traen en `1`; `minimoCategoriaPersonalizada()`
 * lo sobrescribe para que un borrador viejo no reviva la exigencia.
 */
export function evaluarCustom(custom: FotoCategoriaCustom[]): EstadoCategoria[] {
  const min = minimoCategoriaPersonalizada()
  return custom.map((c) => {
    const count = c.fotos.length
    return {
      id: c.id,
      label: c.nombre,
      count,
      min,
      max: null,
      completa: count >= min,
      faltan: Math.max(0, min - count),
    }
  })
}

type Target =
  | { kind: "pre"; id: CategoriaFotoId }
  | { kind: "custom"; id: string }
  | null

/**
 * Miniatura de una foto ya persistida.
 *
 * `url` **no se usa como `src`**: `TX_Adjuntos.url_dropbox` guarda el
 * `path_display` de Dropbox —una ruta, no un enlace de imagen— y ponerlo en un
 * `<img>` daría un 404 contra el dominio de la app. Sólo `thumbnailUrl`, cuando
 * existe, es una URL renderizable; si no, se pinta el icono.
 */
function Miniatura({
  foto,
  label,
  primeraPalabra,
  borrando,
  onBorrar,
}: {
  foto: FotoAdjunta
  label: string
  primeraPalabra: string
  borrando: boolean
  onBorrar: () => void
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
      {foto.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={foto.thumbnailUrl}
          alt={`Foto de ${label}: ${foto.nombre}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Camera className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      <span
        className={cn(
          "absolute bottom-0 left-0 flex max-w-full items-center gap-1 truncate rounded-tr-md px-1.5 py-0.5 text-xs text-white",
          foto.pendiente ? "bg-warning" : "bg-brand",
        )}
      >
        {foto.pendiente && <CloudOff className="h-3 w-3 shrink-0" aria-hidden="true" />}
        {foto.pendiente ? "Pendiente" : primeraPalabra}
      </span>

      <button
        type="button"
        onClick={onBorrar}
        disabled={borrando}
        aria-label={`Borrar foto de ${label}`}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-white disabled:opacity-60"
      >
        {borrando ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}

function Bloque({
  label,
  count,
  min,
  max,
  completa,
  fotos,
  primeraPalabra,
  subiendo,
  borrandoId,
  onAdd,
  onBorrar,
  onEliminarCategoria,
}: {
  label: string
  count: number
  min: number
  max: number | null
  completa: boolean
  fotos: FotoAdjunta[]
  primeraPalabra: string
  subiendo: boolean
  borrandoId: string | null
  onAdd: () => void
  onBorrar: (foto: FotoAdjunta) => void
  onEliminarCategoria?: () => void
}) {
  const maxAlcanzado = max !== null && count >= max
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              completa ? "text-success" : "text-danger",
            )}
          >
            {count}/{min}
            {max && max !== min ? ` (máx ${max})` : ""}
            {completa ? (
              <Check className="h-3.5 w-3.5" aria-label="completa" />
            ) : (
              <X className="h-3.5 w-3.5" aria-label="incompleta" />
            )}
          </span>
          {onEliminarCategoria && (
            <button
              type="button"
              onClick={onEliminarCategoria}
              aria-label={`Eliminar categoría ${label}`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-danger hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {fotos.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {fotos.map((f) => (
            <Miniatura
              key={f.id}
              foto={f}
              label={label}
              primeraPalabra={primeraPalabra}
              borrando={borrandoId === f.id}
              onBorrar={() => onBorrar(f)}
            />
          ))}
        </div>
      )}

      {/*
        Regla D · el botón que dispara la subida se deshabilita, muestra spinner
        y cambia al gerundio mientras la operación está en vuelo. El reset lo
        garantiza el `finally` del handler en `FotosScreen`, no este componente:
        acá `subiendo` es sólo la proyección de ese estado.
      */}
      <Button
        type="button"
        variant="outline"
        disabled={maxAlcanzado || subiendo}
        onClick={onAdd}
        className="mt-3 min-h-10 w-full border-dashed border-brand text-sm font-semibold text-brand hover:bg-blue-50 hover:text-brand/90 disabled:opacity-50"
      >
        {subiendo ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {subiendo ? "Subiendo…" : maxAlcanzado ? "Máximo alcanzado" : `Agregar a ${label}`}
      </Button>
    </div>
  )
}

export function FotosCategorizadas({
  fotos,
  declarados,
  custom,
  setCustom,
  onAgregar,
  onBorrarFoto,
  onEliminarCategoria,
  subiendoEn,
  borrandoId,
}: {
  fotos: FotosPorCategoria
  declarados: DeclaradosSeccionB
  custom: FotoCategoriaCustom[]
  setCustom: React.Dispatch<React.SetStateAction<FotoCategoriaCustom[]>>
  /**
   * Sube y persiste una foto. `categoria` es el valor que viaja a
   * `TX_Adjuntos.descripcion`: el **`id`** de la categoría para las ocho del
   * catálogo —estable ante un cambio de etiqueta— y el **nombre** para las
   * personalizadas, que no tienen otro identificador de negocio.
   */
  onAgregar: (categoria: string, file: File) => Promise<void>
  onBorrarFoto: (categoria: string, foto: FotoAdjunta) => Promise<void>
  onEliminarCategoria: (categoriaId: string) => Promise<void>
  /** Categoría con una subida en vuelo, o `null`. Regla D. */
  subiendoEn: string | null
  /** Id de la foto que se está borrando ahora mismo, o `null`. Regla D. */
  borrandoId: string | null
}) {
  const targetRef = useRef<Target>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const estados = evaluarCategorias(fotos, declarados)
  const estadosCustom = evaluarCustom(custom)

  /** Valor que se persiste como categoría. Ver la prop `onAgregar`. */
  const claveDe = (t: NonNullable<Target>): string =>
    t.kind === "pre" ? t.id : (custom.find((c) => c.id === t.id)?.nombre ?? t.id)

  const abrirSelector = (t: Target) => {
    targetRef.current = t
    requestAnimationFrame(() => fileRef.current?.click())
  }

  const handleFile = async () => {
    const t = targetRef.current
    const file = fileRef.current?.files?.[0]
    targetRef.current = null
    if (fileRef.current) fileRef.current.value = ""
    if (!t || !file) return

    if (t.kind === "pre") {
      const max = resolverMaximo(t.id, declarados)
      if (max !== null && (fotos[t.id]?.length ?? 0) >= max) return
    }

    await onAgregar(claveDe(t), file)
  }

  const crearCategoria = (nombre: string) =>
    setCustom((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, nombre, minimo: minimoCategoriaPersonalizada(), fotos: [] },
    ])

  const eliminarCategoria = async (id: string) => {
    const cat = custom.find((c) => c.id === id)
    if (cat && cat.fotos.length > 0) {
      const ok = window.confirm(
        `La categoría "${cat.nombre}" tiene ${cat.fotos.length} foto(s). ¿Eliminarla de todos modos?`,
      )
      if (!ok) return
    }
    await onEliminarCategoria(id)
  }

  const nombresExistentes = [
    ...CATEGORIAS_FOTO.map((c) => c.label),
    ...custom.map((c) => c.nombre),
  ]

  return (
    <div className="flex flex-col gap-4">
      {/*
        Regla D · el input se deshabilita mientras hay una subida en vuelo, para
        que no se pueda encolar una segunda foto sobre la misma operación.
      */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={subiendoEn !== null}
        className="sr-only"
        onChange={handleFile}
        tabIndex={-1}
      />

      <div className="flex flex-col gap-4">
        {estados.map((e) => (
          <Bloque
            key={e.id}
            label={e.label}
            count={e.count}
            min={e.min}
            max={e.max}
            completa={e.completa}
            fotos={fotos[e.id as CategoriaFotoId] ?? []}
            primeraPalabra={e.label.split(" ")[0]}
            subiendo={subiendoEn === e.id}
            borrandoId={borrandoId}
            onAdd={() => abrirSelector({ kind: "pre", id: e.id as CategoriaFotoId })}
            onBorrar={(foto) => void onBorrarFoto(e.id, foto)}
          />
        ))}

        {estadosCustom.map((e) => {
          const cat = custom.find((c) => c.id === e.id)!
          return (
            <Bloque
              key={e.id}
              label={e.label}
              count={e.count}
              min={e.min}
              max={null}
              completa={e.completa}
              fotos={cat.fotos}
              primeraPalabra={e.label.split(" ")[0]}
              subiendo={subiendoEn === cat.nombre}
              borrandoId={borrandoId}
              onAdd={() => abrirSelector({ kind: "custom", id: e.id })}
              onBorrar={(foto) => void onBorrarFoto(cat.nombre, foto)}
              onEliminarCategoria={() => void eliminarCategoria(e.id)}
            />
          )
        })}
      </div>

      <FotoCategoriaCreator
        nombresExistentes={nombresExistentes}
        onCrear={crearCategoria}
      />
    </div>
  )
}
