"use client"

import * as React from "react"
import { AlertTriangle, Check, ChevronsUpDown, UserCog } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  TASADORES,
  VISADORES,
  type Profesional,
  type Solicitud,
} from "@/lib/console-data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

const MOTIVOS = [
  "Sobrecarga del profesional actual",
  "Fuera de cobertura territorial",
  "Ausencia / vacaciones",
  "Solicitud del cliente",
  "Reasignación por especialidad",
  "Otro",
] as const

function cargaTono(carga: number) {
  if (carga >= 8) return "text-red-600"
  if (carga >= 5) return "text-amber-600"
  return "text-emerald-600"
}

export function ReasignarTasadorDialog({
  role,
  solicitud,
  actual,
  onReasignado,
}: {
  role: "tasador" | "visador"
  solicitud: Solicitud
  actual: string
  onReasignado: (anterior: string, nuevo: string) => void
}) {
  const roleLabel = role === "tasador" ? "tasador" : "visador"
  const pool = role === "tasador" ? TASADORES : VISADORES

  const [open, setOpen] = React.useState(false)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [seleccionado, setSeleccionado] = React.useState<Profesional | null>(
    null
  )
  const [motivo, setMotivo] = React.useState("")
  const [nota, setNota] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)
  const [errores, setErrores] = React.useState<{
    profesional?: string
    motivo?: string
  }>({})

  // Resetea el formulario cada vez que se abre.
  React.useEffect(() => {
    if (open) {
      setSeleccionado(null)
      setMotivo("")
      setNota("")
      setErrores({})
      setEnviando(false)
    }
  }, [open])

  const fueraDeCobertura =
    seleccionado != null &&
    !seleccionado.cobertura.includes(solicitud.comuna)
  const mismaPersona =
    seleccionado != null && seleccionado.nombre === actual

  function validar() {
    const next: typeof errores = {}
    if (!seleccionado) next.profesional = `Selecciona un ${roleLabel}.`
    else if (mismaPersona)
      next.profesional = `Ya es el ${roleLabel} asignado. Elige otra persona.`
    if (!motivo) next.motivo = "Selecciona un motivo de reasignación."
    setErrores(next)
    return Object.keys(next).length === 0
  }

  function handleConfirmar() {
    if (!validar() || !seleccionado) return
    setEnviando(true)
    // Simula la llamada al backend.
    setTimeout(() => {
      setEnviando(false)
      setOpen(false)
      onReasignado(actual, seleccionado.nombre)
      toast.success(`Reasignación de ${roleLabel} confirmada`, {
        description: `${solicitud.codigoExt} · ${
          actual || "Sin asignar"
        } → ${seleccionado.nombre}`,
        duration: 3000,
      })
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <UserCog data-icon="inline-start" />
            {`Reasignar ${roleLabel}`}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{`Reasignar ${roleLabel}`}</DialogTitle>
          <DialogDescription>
            {`Solicitud ${solicitud.codigoExt} · ${solicitud.comuna}, ${solicitud.region}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Profesional actual */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {`${roleLabel[0].toUpperCase()}${roleLabel.slice(1)} actual`}
            </span>
            <span className="text-sm font-medium text-foreground">
              {actual || "Sin asignar"}
            </span>
          </div>

          {/* Selector de nuevo profesional */}
          <div className="flex flex-col gap-1.5">
            <Label>{`Nuevo ${roleLabel}`}</Label>
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
                        !seleccionado && "text-muted-foreground"
                      )}
                    >
                      {seleccionado
                        ? seleccionado.nombre
                        : `Buscar ${roleLabel}…`}
                    </span>
                    <ChevronsUpDown data-icon="inline-end" className="opacity-50" />
                  </Button>
                }
              />
              <PopoverContent
                className="w-(--anchor-width) p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder={`Buscar por nombre o RUT…`} />
                  <CommandList>
                    <CommandEmpty>Sin resultados.</CommandEmpty>
                    <CommandGroup>
                      {pool.map((p) => (
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
                              {p.rut} · {p.carga} activas
                            </span>
                          </div>
                          {p.cobertura.includes(solicitud.comuna) ? (
                            <span className="ml-2 shrink-0 text-[11px] font-medium text-emerald-600">
                              En cobertura
                            </span>
                          ) : (
                            <span className="ml-2 shrink-0 text-[11px] font-medium text-amber-600">
                              Fuera
                            </span>
                          )}
                          <Check
                            className={cn(
                              "ml-2 size-4 shrink-0",
                              seleccionado?.id === p.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errores.profesional && (
              <p className="text-xs text-destructive">{errores.profesional}</p>
            )}
          </div>

          {/* Ficha del profesional seleccionado */}
          {seleccionado && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Carga actual
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    cargaTono(seleccionado.carga)
                  )}
                >
                  {seleccionado.carga} solicitudes activas
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

          {/* Aviso fuera de cobertura */}
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
          <div className="flex flex-col gap-1.5">
            <Label>Motivo de la reasignación</Label>
            <Select
              value={motivo}
              onValueChange={(v) => {
                setMotivo(v ?? '')
                setErrores((e) => ({ ...e, motivo: undefined }))
              }}
            >
              <SelectTrigger aria-invalid={!!errores.motivo}>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {MOTIVOS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errores.motivo && (
              <p className="text-xs text-destructive">{errores.motivo}</p>
            )}
          </div>

          {/* Nota opcional */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nota-reasignacion">Nota interna (opcional)</Label>
            <Textarea
              id="nota-reasignacion"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Contexto adicional para el equipo…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={enviando}>
                Cancelar
              </Button>
            }
          />
          <Button
            onClick={handleConfirmar}
            disabled={enviando}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {enviando ? "Confirmando…" : "Confirmar reasignación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
