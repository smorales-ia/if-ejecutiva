"use client"

import { Plus, Trash2, Info } from "lucide-react"
import type { InformeData, ItemValoracion } from "@/lib/tasaciones"
import { OPCIONES } from "@/lib/tasaciones"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TextField, SelectField, SwitchField } from "./fields"
import type { SetForm } from "./seccion-propiedad"

let itemUid = 0
function nuevoItem(): ItemValoracion {
  return {
    id: `it-new-${++itemUid}`,
    descripcion: "",
    subtipo: "edificacion",
    rolSii: "",
    anioItem: "",
    tipo: "ha-muni",
    situacionMunicipal: "regularizado",
    estado: "bueno",
    aportaGarantia: true,
    origenSuperficie: "plano-municipal",
    superficieM2: "",
    materialItem: "",
  }
}

export function SeccionValoracion({
  form,
  set,
}: {
  form: InformeData
  set: SetForm
}) {
  const items = form.items

  const updateItem = (id: string, patch: Partial<ItemValoracion>) =>
    set(
      "items",
      items.map((it) => {
        if (it.id !== id) return it
        const next = { ...it, ...patch }
        // RN-09: terraza no aporta a garantía
        if (next.subtipo === "terraza") next.aportaGarantia = false
        return next
      }),
    )

  const removeItem = (id: string) =>
    set("items", items.filter((it) => it.id !== id))

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <p className="text-sm text-vp-text-secondary">
          Sin ítems. Agrega el primer ítem del cuadro de valoración.
        </p>
      )}

      {items.map((it, idx) => {
        const esTerraza = it.subtipo === "terraza"
        return (
          <div key={it.id} className="rounded-lg border border-border p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Ítem {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                aria-label={`Eliminar ítem ${idx + 1}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-vp-danger hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <TextField
                label="Descripción"
                value={it.descripcion}
                onChange={(v) => updateItem(it.id, { descripcion: v })}
                placeholder="Ej: Departamento N° 102"
              />
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Subtipo"
                  value={it.subtipo}
                  onChange={(v) => updateItem(it.id, { subtipo: v })}
                  opciones={OPCIONES.subtipoItem}
                />
                <TextField
                  label="Rol SII"
                  value={it.rolSii}
                  onChange={(v) => updateItem(it.id, { rolSii: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Año"
                  type="number"
                  value={it.anioItem}
                  onChange={(v) => updateItem(it.id, { anioItem: v })}
                />
                <SelectField
                  label="Tipo"
                  value={it.tipo}
                  onChange={(v) => updateItem(it.id, { tipo: v })}
                  opciones={OPCIONES.tipoItem}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Situación municipal"
                  value={it.situacionMunicipal}
                  onChange={(v) => updateItem(it.id, { situacionMunicipal: v })}
                  opciones={OPCIONES.situacionMunicipal}
                />
                <SelectField
                  label="Estado"
                  value={it.estado}
                  onChange={(v) => updateItem(it.id, { estado: v })}
                  opciones={OPCIONES.estadoConservacion}
                />
              </div>
              <SelectField
                label="Origen de superficie"
                value={it.origenSuperficie}
                onChange={(v) => updateItem(it.id, { origenSuperficie: v })}
                opciones={OPCIONES.origenSuperficie}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Superficie (m²)"
                  type="number"
                  value={it.superficieM2}
                  onChange={(v) => updateItem(it.id, { superficieM2: v })}
                />
                <TextField
                  label="Material (opcional)"
                  value={it.materialItem}
                  onChange={(v) => updateItem(it.id, { materialItem: v })}
                />
              </div>

              {esTerraza ? (
                <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
                    Aporta a garantía
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span
                            aria-label="Regla RN-09"
                            className="inline-flex cursor-help"
                          />
                        }
                      >
                        <Info className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        RN-09: la terraza no aporta a garantía.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="text-sm font-semibold text-amber-800">NO</span>
                </div>
              ) : (
                <SwitchField
                  label="Aporta a garantía"
                  checked={it.aportaGarantia}
                  onChange={(v) => updateItem(it.id, { aportaGarantia: v })}
                />
              )}
            </div>
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() => set("items", [...items, nuevoItem()])}
        className="min-h-11 w-full border-dashed border-vp-primary text-sm font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark"
      >
        <Plus className="h-4 w-4" />
        Agregar ítem
      </Button>
    </div>
  )
}
