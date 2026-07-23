"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
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
import { useDebounce } from "@/lib/use-debounce"
import {
  CLIENTES,
  ESTADO_LABELS,
  PRIORIDAD,
  PRIORIDAD_LABELS,
  type EstadoSolicitud,
  type Prioridad,
  type Solicitud,
} from "@/lib/console-data"
import type { Vista } from "@/lib/solicitudes"

const TABS: { id: Vista; label: string; tono?: "rojo" | "ambar" }[] = [
  { id: "mi_cartera", label: "Mi cartera" },
  { id: "sla_riesgo", label: "SLA en riesgo", tono: "rojo" },
  { id: "por_asignar", label: "Por asignar", tono: "ambar" },
  { id: "aprobadas", label: "Aprobadas" },
  { id: "todas", label: "Todas" },
]

const ORDENES: { value: string; label: string }[] = [
  { value: "sla_desc", label: "SLA descendente" },
  { value: "sla_asc", label: "SLA ascendente" },
  { value: "fecha_solicitud_desc", label: "Fecha solicitud" },
  { value: "prioridad", label: "Prioridad" },
]

const TODOS = "__todos__"

export function SolicitudList({
  solicitudes,
  selectedId,
  onSelect,
  vistaActiva,
  total,
  page,
  pageSize,
  degraded,
  ejecutivaNoEncontrada,
}: {
  solicitudes: Solicitud[]
  selectedId: string
  onSelect: (id: string) => void
  vistaActiva: Vista
  total: number
  page: number
  pageSize: number
  degraded?: boolean
  ejecutivaNoEncontrada?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [showFilters, setShowFilters] = React.useState(false)
  const [contadores, setContadores] = React.useState<Record<string, number>>({})
  const [tasadores, setTasadores] = React.useState<{ id: string; nombre: string }[]>([])

  // Lee un filtro actual desde la URL.
  const get = (k: string) => searchParams.get(k) ?? ""

  // Aplica cambios a los query params y navega (refetch server nativo). Salvo
  // que se toque 'page', cualquier cambio resetea la paginación a 1.
  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") params.delete(k)
        else params.set(k, v)
      }
      if (!("page" in updates)) params.delete("page")
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams]
  )

  // ── Buscador con debounce (sin deps externas) ──
  const qParam = get("q")
  const [qLocal, setQLocal] = React.useState(qParam)
  const qDebounced = useDebounce(qLocal, 300)
  React.useEffect(() => {
    setQLocal(qParam)
  }, [qParam])
  React.useEffect(() => {
    if (qDebounced !== qParam) updateParams({ q: qDebounced || null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced])

  // ── Contadores por vista (independientes de los filtros) ──
  React.useEffect(() => {
    let vivo = true
    fetch("/api/solicitudes/contadores")
      .then((r) => (r.ok ? r.json() : { contadores: {} }))
      .then((j) => {
        if (vivo) setContadores(j.contadores ?? {})
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  // ── Tasadores para el filtro (endpoint existente, sin deps) ──
  React.useEffect(() => {
    let vivo = true
    fetch("/api/tasadores")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        if (vivo) setTasadores(j.data ?? [])
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  const filtrosActivos =
    !!get("cliente") ||
    !!get("tasador") ||
    !!get("estado") ||
    !!get("prioridad") ||
    !!get("desde") ||
    !!get("hasta") ||
    !!get("q")

  function limpiarFiltros() {
    setQLocal("")
    updateParams({
      cliente: null,
      tasador: null,
      estado: null,
      prioridad: null,
      desde: null,
      hasta: null,
      q: null,
    })
  }

  const totalPaginas = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      {/* Buscador global */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParams({ q: qLocal || null })
            }}
            placeholder="Buscar por código VP-AAAA-NNNN, RUT o dirección"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm outline-none focus-visible:border-ring"
          />
          {qLocal && (
            <button
              type="button"
              onClick={() => {
                setQLocal("")
                updateParams({ q: null })
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs de vista con contadores */}
      <div className="flex flex-wrap gap-1 px-3 pt-3">
        {TABS.map((tab) => {
          const activo = vistaActiva === tab.id
          const count = contadores[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateParams({ vista: tab.id })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                activo
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
              {typeof count === "number" && count > 0 && (
                <span
                  className={cn(
                    "inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                    activo
                      ? "bg-brand-foreground/20 text-brand-foreground"
                      : tab.tono === "rojo"
                        ? "bg-red-100 text-red-700"
                        : tab.tono === "ambar"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-muted-foreground/15 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filtros + orden */}
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
              className={cn("size-3.5 transition-transform", showFilters && "rotate-180")}
            />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Orden:</span>
            <Select
              value={get("orden") || "sla_desc"}
              onValueChange={(v) => updateParams({ orden: v === "sla_desc" ? null : v })}
            >
              <SelectTrigger size="sm" className="h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ORDENES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-2.5">
            <FilterSelect
              label="Cliente"
              value={get("cliente")}
              placeholder="Todos"
              options={CLIENTES.map((c) => ({ value: c, label: c }))}
              onChange={(v) => updateParams({ cliente: v })}
            />
            <FilterSelect
              label="Tasador"
              value={get("tasador")}
              placeholder="Todos"
              options={[
                { value: "sin_asignar", label: "Sin asignar" },
                ...tasadores.map((t) => ({ value: t.nombre, label: t.nombre })),
              ]}
              onChange={(v) => updateParams({ tasador: v })}
            />
            <FilterSelect
              label="Estado"
              value={get("estado")}
              placeholder="Todos"
              options={(Object.entries(ESTADO_LABELS) as [EstadoSolicitud, string][]).map(
                ([value, label]) => ({ value, label })
              )}
              onChange={(v) => updateParams({ estado: v })}
            />
            <FilterSelect
              label="Prioridad"
              value={get("prioridad")}
              placeholder="Todas"
              options={PRIORIDAD.map((p) => ({
                value: p,
                label: PRIORIDAD_LABELS[p as Prioridad],
              }))}
              onChange={(v) => updateParams({ prioridad: v })}
            />
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Fecha solicitud
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={get("desde")}
                  onChange={(e) => updateParams({ desde: e.target.value || null })}
                  className="h-8 w-full rounded-md border border-input bg-card px-2 text-xs outline-none focus-visible:border-ring"
                />
                <span className="text-xs text-muted-foreground">–</span>
                <input
                  type="date"
                  value={get("hasta")}
                  onChange={(e) => updateParams({ hasta: e.target.value || null })}
                  className="h-8 w-full rounded-md border border-input bg-card px-2 text-xs outline-none focus-visible:border-ring"
                />
              </div>
            </div>
            {filtrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        <NewRequestSheet />
      </div>

      <Separator />

      {/* Lista */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {ejecutivaNoEncontrada ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No pudimos encontrar tu usuario en AUTH_Usuarios. Verifica con el
            administrador.
          </p>
        ) : degraded ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            La vista Mi cartera aún no está disponible.
          </p>
        ) : solicitudes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay solicitudes que coincidan.
            </p>
            {filtrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-xs font-medium text-brand hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <ul className="flex flex-col">
            {solicitudes.map((s) => (
              <FilaSolicitud
                key={s.id}
                s={s}
                selected={s.id === selectedId}
                onSelect={() => onSelect(s.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Paginación */}
      {total > 0 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
            Anterior
          </button>
          <span>
            Página {page} de {totalPaginas} · {total} solicitud{total === 1 ? "" : "es"}
          </span>
          <button
            type="button"
            disabled={page >= totalPaginas}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:text-foreground disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function FilaSolicitud({
  s,
  selected,
  onSelect,
}: {
  s: Solicitud
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col gap-1.5 border-l-2 border-b border-b-border px-4 py-3 text-left transition-colors",
          selected
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
          <span className="shrink-0 text-xs text-muted-foreground">{s.comuna}</span>
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
}

function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (value: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <Select
        value={value || TODOS}
        onValueChange={(v) => onChange(v === TODOS ? null : v)}
      >
        <SelectTrigger size="sm" className="h-8 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={TODOS}>{placeholder}</SelectItem>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
