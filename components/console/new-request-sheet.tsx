"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const canales = ["WhatsApp", "Email", "Portal web", "Teléfono"]
const clientes = [
  "Banco Santander",
  "Banco de Chile",
  "BCI",
  "Banco Estado",
  "Scotiabank",
  "Itaú",
]
const tiposInforme = [
  "Tasación hipotecaria",
  "Tasación comercial",
  "Tasación judicial",
  "Revisión de tasación",
]

export function NewRequestSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
            <Plus data-icon="inline-start" />
            Nueva solicitud interna
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Nueva solicitud interna</SheetTitle>
          <SheetDescription>
            Registra una solicitud recibida por un canal externo.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="canal">Canal de origen</Label>
            <Select defaultValue="WhatsApp">
              <SelectTrigger id="canal" className="w-full">
                <SelectValue placeholder="Selecciona un canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {canales.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente">Cliente</Label>
            <Select>
              <SelectTrigger id="cliente" className="w-full">
                <SelectValue placeholder="Buscar cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clientes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Tipo de informe</Label>
            <Select>
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {tiposInforme.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" placeholder="Calle, número, depto / oficina" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rut">RUT propietario</Label>
            <Input id="rut" placeholder="12.345.678-9" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="correo@dominio.cl" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="obs">Observaciones</Label>
            <Textarea
              id="obs"
              rows={3}
              placeholder="Notas de coordinación, accesos, contactos..."
            />
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <SheetClose
            render={
              <Button variant="outline" className="flex-none">
                Cancelar
              </Button>
            }
          />
          <Button className="flex-none bg-brand text-brand-foreground hover:bg-brand/90">
            Crear solicitud
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
