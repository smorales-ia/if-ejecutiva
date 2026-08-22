"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function FotoCategoriaCreator({
  nombresExistentes,
  onCrear,
}: {
  /** nombres ya usados (predefinidas + custom), para validar duplicados */
  nombresExistentes: string[]
  onCrear: (nombre: string) => void
}) {
  const [nombre, setNombre] = useState("")
  const [error, setError] = useState("")

  const normalizar = (s: string) => s.trim().toLowerCase()

  const handleCrear = () => {
    const limpio = nombre.trim()
    if (!limpio) {
      setError("Ingresa un nombre.")
      return
    }
    const dup = nombresExistentes.some((n) => normalizar(n) === normalizar(limpio))
    if (dup) {
      setError("Ya existe una categoría con ese nombre")
      return
    }
    onCrear(limpio)
    setNombre("")
    setError("")
  }

  return (
    <div className="rounded-lg border border-dashed border-brand/60 bg-muted/50 p-3">
      <p className="text-sm font-semibold text-foreground">Categoría personalizada</p>
      <div className="mt-2 flex flex-col gap-2">
        <Input
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (error) setError("")
          }}
          placeholder="Ej: Quincho, Sala de máquinas…"
          className="min-h-12 text-base"
          aria-label="Nombre de la categoría"
        />
        {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
        <Button
          type="button"
          variant="outline"
          onClick={handleCrear}
          className="min-h-11 w-full border-brand text-sm font-semibold text-brand hover:bg-blue-50 hover:text-brand/90"
        >
          <Plus className="h-4 w-4" />
          Crear categoría
        </Button>
      </div>
    </div>
  )
}
