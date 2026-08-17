"use client"

import { useRef, useState } from "react"
import { Camera, Plus, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATEGORIAS_FOTO,
  resolverLimite,
  type CategoriaFotoId,
  type FotoCategoriaCustom,
} from "@/lib/tasaciones"
import { Button } from "@/components/ui/button"
import { FotoCategoriaCreator } from "@/components/foto-categoria-creator"

export type FotosPorCategoria = Record<CategoriaFotoId, number[]>

export type EstadoCategoria = {
  id: string
  label: string
  count: number
  min: number
  max: number | null
  completa: boolean
  faltan: number
}

export function evaluarCategorias(
  fotos: FotosPorCategoria,
  declarados: { dorm: number; banos: number; estac: number },
): EstadoCategoria[] {
  return CATEGORIAS_FOTO.map((c) => {
    const min = resolverLimite(c.min, declarados) ?? 0
    const max = resolverLimite(c.max, declarados)
    const count = fotos[c.id]?.length ?? 0
    const faltan = Math.max(0, min - count)
    return { id: c.id, label: c.label, count, min, max, completa: count >= min, faltan }
  })
}

export function evaluarCustom(custom: FotoCategoriaCustom[]): EstadoCategoria[] {
  return custom.map((c) => {
    const count = c.fotos.length
    const faltan = Math.max(0, c.minimo - count)
    return {
      id: c.id,
      label: c.nombre,
      count,
      min: c.minimo,
      max: null,
      completa: count >= c.minimo,
      faltan,
    }
  })
}

let uid = 1000

type Target =
  | { kind: "pre"; id: CategoriaFotoId }
  | { kind: "custom"; id: string }
  | null

function Bloque({
  label,
  count,
  min,
  max,
  completa,
  fotos,
  primeraPalabra,
  onAdd,
  onBorrar,
  onEliminarCategoria,
}: {
  label: string
  count: number
  min: number
  max: number | null
  completa: boolean
  fotos: number[]
  primeraPalabra: string
  onAdd: () => void
  onBorrar: (n: number) => void
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
              completa ? "text-vp-success" : "text-vp-danger",
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
              className="flex h-7 w-7 items-center justify-center rounded-md text-vp-danger hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {fotos.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {fotos.map((n) => (
            <div
              key={n}
              className="relative aspect-square overflow-hidden rounded-lg bg-vp-surface"
            >
              <div className="flex h-full w-full items-center justify-center">
                <Camera className="h-5 w-5 text-vp-text-secondary" aria-hidden="true" />
              </div>
              <span className="absolute bottom-0 left-0 max-w-full truncate rounded-tr-md bg-vp-primary px-1.5 py-0.5 text-xs text-white">
                {primeraPalabra}
              </span>
              <button
                type="button"
                onClick={() => onBorrar(n)}
                aria-label={`Borrar foto de ${label}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={maxAlcanzado}
        onClick={onAdd}
        className="mt-3 min-h-10 w-full border-dashed border-vp-primary text-sm font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {maxAlcanzado ? "Máximo alcanzado" : `Agregar a ${label}`}
      </Button>
    </div>
  )
}

export function FotosCategorizadas({
  fotos,
  setFotos,
  declarados,
  custom,
  setCustom,
}: {
  fotos: FotosPorCategoria
  setFotos: React.Dispatch<React.SetStateAction<FotosPorCategoria>>
  declarados: { dorm: number; banos: number; estac: number }
  custom: FotoCategoriaCustom[]
  setCustom: React.Dispatch<React.SetStateAction<FotoCategoriaCustom[]>>
}) {
  const targetRef = useRef<Target>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const estados = evaluarCategorias(fotos, declarados)
  const estadosCustom = evaluarCustom(custom)

  const abrirSelector = (t: Target) => {
    targetRef.current = t
    requestAnimationFrame(() => fileRef.current?.click())
  }

  const handleFile = () => {
    const t = targetRef.current
    if (!t) return
    if (t.kind === "pre") {
      const max = resolverLimite(
        CATEGORIAS_FOTO.find((c) => c.id === t.id)!.max,
        declarados,
      )
      setFotos((prev) => {
        const actuales = prev[t.id] ?? []
        if (max !== null && actuales.length >= max) return prev
        return { ...prev, [t.id]: [...actuales, uid++] }
      })
    } else {
      setCustom((prev) =>
        prev.map((c) => (c.id === t.id ? { ...c, fotos: [...c.fotos, uid++] } : c)),
      )
    }
    targetRef.current = null
    if (fileRef.current) fileRef.current.value = ""
  }

  const borrarPre = (cat: CategoriaFotoId, n: number) =>
    setFotos((prev) => ({ ...prev, [cat]: prev[cat].filter((x) => x !== n) }))

  const borrarCustom = (id: string, n: number) =>
    setCustom((prev) =>
      prev.map((c) => (c.id === id ? { ...c, fotos: c.fotos.filter((x) => x !== n) } : c)),
    )

  const crearCategoria = (nombre: string) =>
    setCustom((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, nombre, minimo: 1, fotos: [] },
    ])

  const eliminarCategoria = (id: string) => {
    const cat = custom.find((c) => c.id === id)
    if (cat && cat.fotos.length > 0) {
      const ok = window.confirm(
        `La categoría "${cat.nombre}" tiene ${cat.fotos.length} foto(s). ¿Eliminarla de todos modos?`,
      )
      if (!ok) return
    }
    setCustom((prev) => prev.filter((c) => c.id !== id))
  }

  const nombresExistentes = [
    ...CATEGORIAS_FOTO.map((c) => c.label),
    ...custom.map((c) => c.nombre),
  ]

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
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
            onAdd={() => abrirSelector({ kind: "pre", id: e.id as CategoriaFotoId })}
            onBorrar={(n) => borrarPre(e.id as CategoriaFotoId, n)}
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
              onAdd={() => abrirSelector({ kind: "custom", id: e.id })}
              onBorrar={(n) => borrarCustom(e.id, n)}
              onEliminarCategoria={() => eliminarCategoria(e.id)}
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
