"use client"

import * as React from "react"
import { AlertTriangle, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { TASADORES, type Profesional, type Solicitud } from "@/lib/console-data"
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

function cargaTono(carga: number, capacidad: number) {
  const ratio = capacidad > 0 ? carga / capacidad : 0
  if (ratio >= 0.8) return "text-red-600"
  if (ratio >= 0.5) return "text-amber-600"
  return "text-emerald-600"
}

export function AsignarTasadorDialog({
  open,
  onOpenChange,
  solicitud,
  onConfirmado,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: Solicitud
  /** Se invoca tras confirmar la asignación. `nota` es opcional. */
  onConfirmado: (nuevo: string, nota: string) => void
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [seleccionado, setSeleccionado] = React.useState<Profesional | null>(null)
  const [nota, setNota] = React.useState("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
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

  // Tasadores con cobertura de la comuna primero.
  const ordenados = React.useMemo(() => {
    return [...TASADORES].sort((a, b) => {
      const ac = a.cobertura.includes(solicitud.comuna) ? 0 : 1
      const bc = b.cobertura.includes(solicitud.comuna) ? 0 : 1
      return ac - bc
    })
  }, [solicitud.comuna])

  const fueraDeCobertura =
    seleccionado != null && !seleccionado.cobertura.includes(solicitud.comuna)

  function abrirConfirmacion() {
    if (!seleccionado) {
      setError("Selecciona un tasador.")
      return
    }
    setConfirmOpen(true)
  }

  function handleConfirmarFinal() {
    if (!seleccionado) return
    setConfirmOpen(false)
    onOpenChange(false)
    onConfirmado(seleccionado.nombre, nota.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <CommandEmpty>Sin resultados.</CommandEmpty>
                    <CommandGroup>
                      {ordenados.map((p) => {
                        const enCobertura = p.cobertura.includes(solicitud.comuna)
                        return (
                          <CommandItem
                            key={p.id}
                            value={`${p.nombre} ${p.rut}`}
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
                                {p.rut} · carga {p.carga}/{p.capacidad}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "ml-2 shrink-0 text-[11px] font-medium",
                                enCobertura
                                  ? "text-emerald-600"
                                  : "text-amber-600",
                              )}
                            >
                              {enCobertura ? "En cobertura" : "Fuera"}
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
                <span className="text-xs text-muted-foreground">Carga actual</span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    cargaTono(seleccionado.carga, seleccionado.capacidad),
                  )}
                >
                  {seleccionado.carga} / {seleccionado.capacidad} activas
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Cobertura</span>
                <span className="text-sm font-medium text-foreground">
                  {seleccionado.cobertura.length} comunas
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
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
                Los datos quedarán en modo consulta.
              </li>
            </ul>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmarFinal}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Confirmar asignación
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
