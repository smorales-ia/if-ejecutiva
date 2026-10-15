"use client"

import { Plus, Trash2, Info, AlertTriangle } from "lucide-react"
import type { InformeData, ItemValoracion } from "@/lib/tasador/tasaciones"
import { OPCIONES } from "@/lib/tasador/tasaciones"
import { avisosCoherenciaTerreno } from "@/lib/tasador/coherencia-superficies"
import { FACTOR_DF_PLANILLA, itemsSinUfM2 } from "@/lib/tasador/propuesta-cuadro"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TextField, SelectField, SwitchField } from "./fields"
import type { SetForm } from "./seccion-propiedad"

/** Literal exacto del singleSelect `subtipo` (ver `OPCIONES.subtipoItem`). */
const SUBTIPO_TERRAZA = "Terraza"

let itemUid = 0
/** Ítem en blanco con valores del dominio real de los selects (antes traía slugs del v0 que no existían). */
function nuevoItem(): ItemValoracion {
  return {
    id: `it-new-${++itemUid}`,
    descripcion: "",
    subtipo: "Edificacion",
    rolSii: "",
    anioItem: "",
    tipo: "Edificacion",
    situacionMunicipal: "Regularizado",
    estado: "Bueno",
    aportaGarantia: true,
    origenSuperficie: "plano",
    superficieM2: "",
    ufM2Unitario: "",
    factorAplicado: FACTOR_DF_PLANILLA,
    materialItem: "",
  }
}

export function SeccionValoracion({
  form,
  set,
  prellenado = false,
}: {
  form: InformeData
  set: SetForm
  /** El servidor propuso el cuadro: no había filas guardadas (spec §2.8.2). */
  prellenado?: boolean
}) {
  const items = form.items

  const updateItem = (id: string, patch: Partial<ItemValoracion>) =>
    set(
      "items",
      items.map((it) => {
        if (it.id !== id) return it
        const next = { ...it, ...patch }
        // RN-09: terraza no aporta a garantía
        if (next.subtipo === SUBTIPO_TERRAZA) next.aportaGarantia = false
        return next
      }),
    )

  // Lo que el tasador debe completar: sin UF/m² el ítem vale 0.
  const sinUfM2 = itemsSinUfM2(items)

  const removeItem = (id: string) =>
    set("items", items.filter((it) => it.id !== id))

  // Aviso ámbar, no bloqueante: los ítems de terreno no calzan con la sección B
  // (terreno y servidumbre llegan solos desde los documentos · spec §4.3.4).
  const avisosTerreno = avisosCoherenciaTerreno({
    supTerreno: form.supTerreno,
    servidumbreM2: form.servidumbreM2,
    items,
  })

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sin ítems. Agrega el primer ítem del cuadro de valoración.
        </p>
      )}

      {prellenado && items.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div className="flex flex-col gap-1 text-sm text-foreground">
            <p>
              Cuadro pre-llenado con las superficies y las unidades de la
              propiedad. Revísalo y agrega las obras complementarias que
              veas en terreno.
            </p>
            {sinUfM2.length > 0 && (
              <p>Falta el UF/m² de: {sinUfM2.join(" · ")}.</p>
            )}
            <p className="text-muted-foreground">
              El factor D.F. viene en 1, el valor por defecto de la planilla:
              ajústalo en la edificación según su depreciación.
            </p>
          </div>
        </div>
      )}

      {items.map((it, idx) => {
        const esTerraza = it.subtipo === SUBTIPO_TERRAZA
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
                className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-red-50"
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
                  opciones={OPCIONES.estadoItem}
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
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="UF/m² unitario"
                  type="number"
                  value={it.ufM2Unitario}
                  onChange={(v) => updateItem(it.id, { ufM2Unitario: v })}
                />
                <TextField
                  label="Factor D.F. (opcional)"
                  type="number"
                  value={it.factorAplicado}
                  onChange={(v) => updateItem(it.id, { factorAplicado: v })}
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

      {avisosTerreno.length > 0 && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
          <div className="flex flex-col gap-1 text-sm text-amber-800">
            {avisosTerreno.map((aviso) => (
              <p key={aviso}>{aviso}</p>
            ))}
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => set("items", [...items, nuevoItem()])}
        className="min-h-11 w-full border-dashed border-brand text-sm font-semibold text-brand hover:bg-blue-50 hover:text-brand/90"
      >
        <Plus className="h-4 w-4" />
        Agregar ítem
      </Button>
    </div>
  )
}
