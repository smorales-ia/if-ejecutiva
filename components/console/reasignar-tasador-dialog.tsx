"use client"

import * as React from "react"
import { AlertTriangle, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  MOTIVOS_REASIGNACION,
  TASADORES,
  type Profesional,
  type Solicitud,
} from "@/lib/console-data"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export type ModoAsignacion = "asignar" | "reasignar"

function cargaTono(carga: number, capacidad: number) {
  const ratio = capacidad > 0 ? carga / capacidad : 0
  if (ratio >= 0.8) return "text-red-600"
  if (ratio >= 0.5) return "text-amber-600"
  return "text-emerald-600"
}

export function ReasignarTasadorDialog({
  mode,
  open,
  onOpenChange,
  solicitud,
  actual,
  onConfirmado,
}: {
  mode: ModoAsignacion
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: Solicitud
  actual: string
  /** Se invoca tras confirmar. `motivo` puede ir vacío al asignar. */
  onConfirmado: (nuevo: string, motivo: string) => void
}) {
  const esReasignar = mode === "reasignar"

  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [seleccionado, setSeleccionado] = React.useState<Profesional | null>(null)
  const [motivo, setMotivo] = React.useState("")
  const [motivoOtro, setMotivoOtro] = React.useState("")
  const [notaAsignar, setNotaAsignar] = React.useState("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [errores, setErrores] = React.useState<{
    profesional?: string
    motivo?: string
  }>({})

  // Resetea el formulario cada vez que se abre.
  React.useEffect(() => {
    if (open) {
      setSeleccionado(null)
      setMotivo("")
      setMotivoOtro("")
      setNotaAsignar("")
      setErrores({})
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
  const mismaPersona = seleccionado != null && seleccionado.nombre === actual

  function validar() {
    const next: typeof errores = {}
    if (!seleccionado) next.profesional = "Selecciona un tasador."
    else if (mismaPersona)
      next.profesional = "Ya es el tasador asignado. Elige otra persona."
    if (esReasignar) {
      if (!motivo) next.motivo = "Selecciona un motivo de reasignación."
      else if (motivo === "Otro" && motivoOtro.trim() === "")
        next.motivo = "Describe el motivo."
    }
    setErrores(next)
    return Object.keys(next).length === 0
  }

  function abrirConfirmacion() {
    if (validar()) setConfirmOpen(true)
  }

  function handleConfirmarFinal() {
    if (!seleccionado) return
    const motivoFinal = esReasignar
      ? motivo === "Otro"
        ? motivoOtro.trim()
        : motivo
      : notaAsignar.trim()
    setConfirmOpen(false)
    onOpenChange(false)
    onConfirmado(seleccionado.nombre, motivoFinal)
  }

  const titulo = esReasignar ? "Reasignar tasador" : "Asignar tasador"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            {`Solicitud ${solicitud.codigoExt} · ${solicitud.comuna}, ${solicitud.region}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Tasador actual (sólo al reasignar) */}
          {esReasignar && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
              <span className="text-xs text-muted-foreground">Tasador actual</span>
              <span className="text-sm font-medium text-foreground">
                {actual || "Sin asignar"}
              </span>
            </div>
          )}

          {/* Aviso de segunda reasignación */}
          {esReasignar && solicitud.contadorReasignaciones >= 1 && (
            <Alert>
              <AlertTriangle />
              <AlertTitle>Reasignación reiterada</AlertTitle>
              <AlertDescription>
                Esta será la segunda reasignación de esta solicitud.
              </AlertDescription>
            </Alert>
          )}

          {/* Selector de tasador */}
          <div className="flex flex-col gap-1.5">
            <Label>Tasador</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-invalid={!!errores.profesional}
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
                              setErrores((e) => ({ ...e, profesional: undefined }))
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
            {errores.profesional && (
              <p className="text-xs text-destructive">{errores.profesional}</p>
            )}
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

          {/* Motivo */}
          {esReasignar ? (
            <div className="flex flex-col gap-1.5">
              <Label>Motivo de la reasignación</Label>
              <Select
                value={motivo}
                onValueChange={(v) => {
                  setMotivo(v)
                  setErrores((e) => ({ ...e, motivo: undefined }))
                }}
              >
                <SelectTrigger aria-invalid={!!errores.motivo}>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {MOTIVOS_REASIGNACION.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {motivo === "Otro" && (
                <Textarea
                  value={motivoOtro}
                  onChange={(e) => {
                    setMotivoOtro(e.target.value)
                    setErrores((er) => ({ ...er, motivo: undefined }))
                  }}
                  placeholder="Describe el motivo…"
                  rows={2}
                />
              )}
              {errores.motivo && (
                <p className="text-xs text-destructive">{errores.motivo}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo-asignar">Motivo (opcional)</Label>
              <Textarea
                id="motivo-asignar"
                value={notaAsignar}
                onChange={(e) => setNotaAsignar(e.target.value)}
                placeholder="Contexto adicional para el equipo…"
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={abrirConfirmacion}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {esReasignar ? "Reasignar" : "Asignar"}
          </Button>
        </DialogFooter>

        {/* Confirmación anidada con consecuencias */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {esReasignar ? "Confirmar reasignación" : "Confirmar asignación"}
              </AlertDialogTitle>
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
                {esReasignar ? "Confirmar reasignación" : "Confirmar asignación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
