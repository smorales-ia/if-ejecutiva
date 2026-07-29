"use client"

import * as React from "react"
import { AlertTriangle, Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { type Solicitud } from "@/lib/console-data"

/**
 * Candidato tal como lo devuelve `GET /api/tasadores/candidatos` — datos reales
 * de `M_Tasadores`, no el mock `TASADORES` de `lib/console-data` que este
 * diálogo usó hasta la tanda de cierre (29-jul-2026, retiro de H-05).
 *
 * Diferencias con el mock que obligan a adaptar la ficha: no hay `rut` ni
 * `carga` (M_Tasadores no tiene `casos_en_curso`), y la cobertura llega como
 * nombres de comuna resueltos desde el link `zonas_cobertura`.
 */
interface Candidato {
  id: string
  nombre: string
  email: string
  capacidadActiva: number
  zonas: string[]
  zonaPrincipal: string
  /** `true` sólo si declara zonas y una coincide con la comuna de la solicitud. */
  cubreComuna: boolean
}
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// `cargaTono` se retiró con el mock: coloreaba la razón carga/capacidad, y
// `M_Tasadores` no tiene `casos_en_curso`, así que no hay carga real que
// colorear. Volverá cuando exista ese campo (resto vivo de H-05).

export function AsignarTasadorDialog({
  open,
  onOpenChange,
  solicitud,
  onConfirmado,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: Solicitud
  /**
   * Se invoca tras confirmar la asignación. `nota` es opcional.
   *
   * Puede devolver una promesa: si lo hace, el diálogo la espera con el botón
   * en "Asignando…" antes de cerrarse (Regla D · CLAUDE.md). Hasta la tanda
   * D-03 el diálogo cerraba antes de que el POST terminara, así que la
   * asignación —que tarda ~2,4 s contra Make— no tenía ningún feedback de
   * progreso y admitía doble click.
   */
  onConfirmado: (
    tasadorId: string,
    nombre: string,
    nota: string,
  ) => void | Promise<void>
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [seleccionado, setSeleccionado] = React.useState<Candidato | null>(null)
  const [candidatos, setCandidatos] = React.useState<Candidato[]>([])
  const [cargando, setCargando] = React.useState(false)
  const [nota, setNota] = React.useState("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  /** POST /asignar en vuelo (Regla D). */
  const [asignando, setAsignando] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>()

  // Resetea el formulario cada vez que se abre.
  React.useEffect(() => {
    if (open) {
      setSeleccionado(null)
      setNota("")
      setError(undefined)
      setConfirmOpen(false)
    }
  }, [open])

  // Carga los candidatos reales al abrir. Se pide en cada apertura y no una
  // sola vez: entre dos aperturas puede haberse dado de baja un tasador o
  // haber cambiado su capacidad, y la lista es corta.
  React.useEffect(() => {
    if (!open) return
    let vivo = true
    setCargando(true)
    fetch(`/api/tasadores/candidatos?comuna=${encodeURIComponent(solicitud.comuna)}`)
      .then((r) => (r.ok ? r.json() : { candidatos: [] }))
      .then((j) => {
        if (vivo) setCandidatos(j.candidatos ?? [])
      })
      .catch(() => {
        if (vivo) setCandidatos([])
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })
    return () => {
      vivo = false
    }
  }, [open, solicitud.comuna])

  // Los que cubren la comuna primero; dentro de cada grupo, mayor capacidad
  // primero. No se filtra por cobertura: ~la mitad del padrón no declara zonas
  // y filtrar los ocultaría por un dato faltante, dejando la lista vacía sin
  // explicación (decisión de Sergio, 29-jul-2026).
  const ordenados = React.useMemo(() => {
    return [...candidatos].sort(
      (a, b) =>
        Number(b.cubreComuna) - Number(a.cubreComuna) ||
        b.capacidadActiva - a.capacidadActiva ||
        a.nombre.localeCompare(b.nombre),
    )
  }, [candidatos])

  const fueraDeCobertura = seleccionado != null && !seleccionado.cubreComuna

  function abrirConfirmacion() {
    if (!seleccionado) {
      setError("Selecciona un tasador.")
      return
    }
    setConfirmOpen(true)
  }

  async function handleConfirmarFinal() {
    if (!seleccionado || asignando) return
    setAsignando(true)
    try {
      await onConfirmado(seleccionado.id, seleccionado.nombre, nota.trim())
    } finally {
      // `finally`, no `catch`: si `onConfirmado` lanza (throw síncrono, red que
      // no se captura arriba), sin esto el botón queda muerto y hay que
      // refrescar la página. Ver Regla D en CLAUDE.md.
      setAsignando(false)
    }
    // Cerrar después de resolver, no antes: es lo que permite mostrar el
    // progreso. El resultado lo comunica el contenedor por toast (Regla B).
    setConfirmOpen(false)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && asignando) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar tasador</DialogTitle>
          <DialogDescription>
            {`Solicitud ${solicitud.codigoExt} · ${solicitud.comuna}, ${solicitud.region}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Selector de tasador */}
          <div className="flex flex-col gap-1.5">
            <Label>Tasador</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-invalid={!!error}
                    className="w-full justify-between font-normal"
                  >
                    <span
                      className={cn(
                        "truncate",
                        !seleccionado && "text-muted-foreground",
                      )}
                    >
                      {seleccionado ? seleccionado.nombre : "Buscar tasador…"}
                    </span>
                    <ChevronsUpDown data-icon="inline-end" className="opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-(--anchor-width) p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por nombre o RUT…" />
                  <CommandList>
                    <CommandEmpty>
                      {cargando ? "Cargando tasadores…" : "Sin resultados."}
                    </CommandEmpty>
                    <CommandGroup>
                      {ordenados.map((p) => {
                        // Tres estados, no dos: cubre / no cubre / no declaró
                        // zonas. El tercero no puede presentarse como "fuera de
                        // cobertura" porque no lo sabemos — sólo sabemos que el
                        // dato falta.
                        const sinZonas = p.zonas.length === 0
                        return (
                          <CommandItem
                            key={p.id}
                            value={`${p.nombre} ${p.email}`}
                            onSelect={() => {
                              setSeleccionado(p)
                              setPickerOpen(false)
                              setError(undefined)
                            }}
                          >
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium">
                                {p.nombre}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                {p.zonaPrincipal || p.email} · capacidad{" "}
                                {p.capacidadActiva}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "ml-2 shrink-0 text-[11px] font-medium",
                                p.cubreComuna
                                  ? "text-emerald-600"
                                  : sinZonas
                                    ? "text-muted-foreground"
                                    : "text-amber-600",
                              )}
                            >
                              {p.cubreComuna
                                ? "En cobertura"
                                : sinZonas
                                  ? "Sin zonas"
                                  : "Fuera"}
                            </span>
                            <Check
                              className={cn(
                                "ml-2 size-4 shrink-0",
                                seleccionado?.id === p.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Ficha del tasador seleccionado */}
          {seleccionado && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-col gap-0.5">
                {/* `M_Tasadores` no tiene `casos_en_curso`, así que no hay carga
                    real que mostrar (lo que queda vivo de H-05). Se muestra la
                    capacidad declarada, que sí existe, sin inventar un
                    denominador de casos activos que nadie está contando. */}
                <span className="text-xs text-muted-foreground">Capacidad</span>
                <span className="text-sm font-semibold text-foreground">
                  {seleccionado.capacidadActiva}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Cobertura</span>
                <span className="text-sm font-medium text-foreground">
                  {seleccionado.zonas.length > 0
                    ? `${seleccionado.zonas.length} comuna${seleccionado.zonas.length === 1 ? "" : "s"}`
                    : "Sin zonas declaradas"}
                </span>
              </div>
            </div>
          )}

          {/* Aviso fuera de cobertura (no bloqueante) */}
          {fueraDeCobertura && (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>Fuera de cobertura territorial</AlertTitle>
              <AlertDescription>
                {`${seleccionado?.nombre} no cubre ${solicitud.comuna}. Puedes continuar, pero la asignación quedará marcada como excepción.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Nota opcional */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nota-asignar">Nota (opcional)</Label>
            <Textarea
              id="nota-asignar"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Contexto adicional para el equipo…"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={abrirConfirmacion}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Asignar
          </Button>
        </DialogFooter>

        {/* Confirmación anidada con consecuencias */}
        <AlertDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            // Regla D: mientras el POST viaja no se puede descartar el diálogo
            // por Escape ni por backdrop; se cerraría el único lugar donde se
            // ve el progreso.
            if (!next && asignando) return
            setConfirmOpen(next)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar asignación</AlertDialogTitle>
              <AlertDialogDescription>
                Al confirmar se aplicarán los siguientes cambios:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ul className="flex flex-col gap-1.5 text-sm text-foreground">
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                La solicitud pasará a estado <strong>asignada</strong>.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                Se registrará la fecha y hora de asignación.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                Se enviará el correo de asignación al tasador.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                Los datos quedarán en modo consulta.
              </li>
            </ul>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={asignando}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmarFinal}
                disabled={asignando}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {asignando && (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                )}
                {asignando ? "Asignando…" : "Confirmar asignación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
