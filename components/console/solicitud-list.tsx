"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { NewRequestSheet } from "@/components/console/new-request-sheet"
import {
  PriorityChip,
  SLABadge,
  StateBadge,
} from "@/components/console/status-badges"
import type { Solicitud, TipoDocumento } from "@/lib/console-data"
import type { Vista } from "@/lib/solicitudes"

const tabs: { id: Vista; label: string }[] = [
  { id: "cartera",    label: "Mi cartera" },
  { id: "sla_riesgo", label: "SLA en riesgo" },
  { id: "reasignar",  label: "Por reasignar" },
  { id: "pausadas",   label: "Pausadas" },
  { id: "aprobadas",  label: "Aprobadas" },
  { id: "activas",    label: "Todas" },
]

export function SolicitudList({
  solicitudes,
  selectedId,
  onSelect,
  vistaActiva,
  degraded,
  tiposDocumento,
}: {
  solicitudes: Solicitud[]
  selectedId: string
  onSelect: (id: string) => void
  vistaActiva: Vista
  degraded?: boolean
  tiposDocumento: TipoDocumento[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  function handleTabClick(tabId: Vista) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('vista', tabId)
    router.push(`/consola?${params.toString()}`, { scroll: false })
  }

  const showDegradedMessage = degraded === true && vistaActiva === 'cartera'

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      {/* View tabs */}
      <div className="flex flex-wrap gap-1 px-3 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
              vistaActiva === tab.id
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter toggle + actions */}
      <div className="flex flex-col gap-2 px-3 py-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <SlidersHorizontal className="size-3.5" />
            Filtros
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                showFilters && "rotate-180"
              )}
            />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Orden:</span>
            <Select defaultValue="sla-desc">
              <SelectTrigger size="sm" className="h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="sla-desc">SLA descendente</SelectItem>
                  <SelectItem value="sla-asc">SLA ascendente</SelectItem>
                  <SelectItem value="fecha">Fecha solicitud</SelectItem>
                  <SelectItem value="prioridad">Prioridad</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-2.5">
            <FilterSelect label="Cliente" placeholder="Todos" />
            <FilterSelect label="Tasador" placeholder="Todos" />
            <FilterSelect label="Estado" placeholder="Todos" />
            <FilterSelect label="Prioridad" placeholder="Todas" />
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Fecha solicitud
              </span>
              <input
                type="text"
                placeholder="01 jun 2026 – 30 jun 2026"
                className="h-8 w-full rounded-md border border-input bg-card px-2.5 text-xs outline-none focus-visible:border-ring"
              />
            </div>
          </div>
        )}

        <NewRequestSheet tiposDocumento={tiposDocumento} />
      </div>

      <Separator />

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {showDegradedMessage ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Aún no está configurada la asignación por ejecutiva. Pídeselo al administrador de Airtable.
          </p>
        ) : (
          <>
            <ul className="flex flex-col">
              {solicitudes.map((s) => {
                const isSelected = s.id === selectedId
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      className={cn(
                        "flex w-full flex-col gap-1.5 border-l-2 border-b border-b-border px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "border-l-brand bg-brand/5"
                          : "border-l-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold tracking-tight text-foreground">
                          {s.codigoExt}
                        </span>
                        <SLABadge dias={s.slaDias} total={s.slaTotal} />
                      </div>

                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {s.cliente}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {s.comuna}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <StateBadge estado={s.estado} />
                        <PriorityChip prioridad={s.prioridad} />
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{s.tasador}</span>
                        <span className="shrink-0">Límite {s.fechaLimite}</span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className="px-4 py-3 text-center text-[11px] text-muted-foreground">
              Mostrando {solicitudes.length} solicitudes
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  placeholder,
}: {
  label: string
  placeholder: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <Select>
        <SelectTrigger size="sm" className="h-8 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="todos">{placeholder}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
