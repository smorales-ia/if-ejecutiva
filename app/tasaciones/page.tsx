"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import { TasacionCard } from "@/components/tasacion-card"
import { TASACIONES, type Tasacion } from "@/lib/tasaciones"

type Filtro = "todas" | "hoy" | "por_coordinar"

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "hoy", label: "Hoy" },
  { key: "por_coordinar", label: "Por coordinar" },
]

/** Cola visible del tasador: solo asignada / visitada / calculada (nunca pdf_listo). */
function enColaVisible(t: Tasacion) {
  return t.estado === "asignada" || t.estado === "visitada" || t.estado === "calculada"
}

function horasDesde(iso?: string): number {
  if (!iso) return Number.POSITIVE_INFINITY
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60)
}

function coincide(t: Tasacion, filtro: Filtro) {
  if (!enColaVisible(t)) return false
  if (filtro === "todas") return true
  if (filtro === "hoy") return horasDesde(t.fechaAsignacion) < 24
  // por_coordinar: sin coordinación vigente, asignada y dentro de la ventana de 4 h
  return (
    t.coordinacionVigente == null &&
    t.estado === "asignada" &&
    horasDesde(t.fechaAsignacion) < 4
  )
}

function TasacionesContent() {
  const searchParams = useSearchParams()
  const [filtro, setFiltro] = useState<Filtro>("todas")

  // Permite volver con un tab activo (ej. tras devolver: ?tab=devueltas)
  useEffect(() => {
    const tab = searchParams.get("tab") as Filtro | null
    if (tab && FILTROS.some((f) => f.key === tab)) setFiltro(tab)
  }, [searchParams])

  let tasaciones = TASACIONES.filter((t) => coincide(t, filtro))
  // En "Por coordinar", ordenar por menor tiempo restante primero.
  if (filtro === "por_coordinar") {
    tasaciones = [...tasaciones].sort(
      (a, b) => (a.horasRestantes ?? Infinity) - (b.horasRestantes ?? Infinity),
    )
  }
  const enCurso = TASACIONES.filter(enColaVisible).length

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-background">
      <AppHeader />

      <main className="px-4 pb-12 pt-5">
        <h1 className="text-2xl font-bold text-foreground">Mis tasaciones</h1>
        <p className="mt-1 text-base text-vp-text-secondary">{enCurso} en curso</p>

        {/* Filtros */}
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTROS.map((f) => {
            const active = filtro === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFiltro(f.key)}
                aria-pressed={active}
                className={cn(
                  "min-h-12 shrink-0 rounded-lg border px-4 text-base font-medium transition-all duration-200",
                  active
                    ? "border-vp-primary bg-vp-primary text-white"
                    : "border-border bg-background text-foreground hover:bg-vp-surface",
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Lista */}
        <div className="mt-5 flex flex-col gap-4">
          {tasaciones.map((t) => (
            <TasacionCard key={t.id} tasacion={t} />
          ))}
          {tasaciones.length === 0 && (
            <p className="py-12 text-center text-base text-vp-text-secondary">
              No hay tasaciones en esta categoría.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default function TasacionesPage() {
  return (
    <Suspense fallback={null}>
      <TasacionesContent />
    </Suspense>
  )
}
