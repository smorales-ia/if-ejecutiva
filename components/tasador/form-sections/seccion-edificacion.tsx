"use client"

import { Plus, Trash2, Minus } from "lucide-react"
import type {
  InformeData,
  Ampliacion,
  Recinto,
  NivelId,
  NivelHabitaciones,
  Comodidades,
} from "@/lib/tasador/tasaciones"
import { OPCIONES, RECINTOS_SUGERIDOS } from "@/lib/tasador/tasaciones"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SubSection, TextField, SelectField, SwitchField, MultiChipField } from "./fields"
import type { SetForm } from "./seccion-propiedad"

let ampUid = 0
let rcUid = 0

const NIVELES: { id: NivelId; label: string }[] = [
  { id: "subterraneo", label: "Subt." },
  { id: "n1", label: "Nivel 1" },
  { id: "n2", label: "Nivel 2" },
  { id: "n3", label: "Nivel 3" },
]

const CONTADORES: { key: keyof NivelHabitaciones; label: string }[] = [
  { key: "living", label: "Living" },
  { key: "estar", label: "Estar" },
  { key: "cocina", label: "Cocina" },
  { key: "comedor", label: "Comedor" },
  { key: "dormitoriosSimples", label: "Dorm. simples" },
  { key: "suites", label: "Suites" },
  { key: "banos", label: "Baños" },
  { key: "walkIn", label: "Walk-in" },
  { key: "escritorio", label: "Escritorio" },
  { key: "loggia", label: "Loggia" },
]

const COMODIDADES: { key: keyof Comodidades; label: string }[] = [
  { key: "gimnasio", label: "Gimnasio" },
  { key: "piscina", label: "Piscina" },
  { key: "sauna", label: "Sauna" },
  { key: "quincho", label: "Quincho" },
  { key: "calefaccion", label: "Calefacción" },
  { key: "aireAcondicionado", label: "Aire acond." },
  { key: "alarma", label: "Alarma" },
  { key: "aspiracionCentral", label: "Aspiración central" },
  { key: "climatizacion", label: "Climatización" },
  { key: "purificador", label: "Purificador" },
  { key: "corrientesDebiles", label: "Corrientes débiles" },
  { key: "jardinConformado", label: "Jardín conformado" },
  { key: "bodegaExtra", label: "Bodega extra" },
  { key: "estacionamientoVisitas", label: "Estac. visitas" },
]

function Counter({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Disminuir ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground disabled:opacity-40"
          disabled={value <= 0}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-brand text-brand"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function SeccionEdificacion({
  form,
  set,
}: {
  form: InformeData
  set: SetForm
}) {
  /* E.1 Ampliaciones */
  const addAmpliacion = () =>
    set("ampliaciones", [
      ...form.ampliaciones,
      { id: `amp-${++ampUid}`, nPe: "", fechaRecepcion: "", m2: "", destino: "" },
    ])
  const updateAmp = (id: string, patch: Partial<Ampliacion>) =>
    set(
      "ampliaciones",
      form.ampliaciones.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    )
  const removeAmp = (id: string) =>
    set("ampliaciones", form.ampliaciones.filter((a) => a.id !== id))

  /* E.2 Niveles */
  const setNivel = (nivel: NivelId, key: keyof NivelHabitaciones, value: number) =>
    set("niveles", {
      ...form.niveles,
      [nivel]: { ...form.niveles[nivel], [key]: value },
    })

  /* E.3 Recintos */
  const addRecinto = (nombre: string) =>
    set("recintos", [
      ...form.recintos,
      {
        id: `rc-${++rcUid}`,
        nombre,
        pavimento: "",
        material: "",
        revestimientoMuros: "",
        terminacionCielo: "",
        iluminacion: "",
        estado: "bueno",
      },
    ])
  const updateRecinto = (id: string, patch: Partial<Recinto>) =>
    set(
      "recintos",
      form.recintos.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    )
  const removeRecinto = (id: string) =>
    set("recintos", form.recintos.filter((r) => r.id !== id))

  /* E.5 Comodidades */
  const setComodidad = (key: keyof Comodidades, value: boolean) =>
    set("comodidades", { ...form.comodidades, [key]: value })

  /* E.6 Ventanas */
  const toggleVentana = (v: string) =>
    set(
      "ventanas",
      form.ventanas.includes(v)
        ? form.ventanas.filter((x) => x !== v)
        : [...form.ventanas, v],
    )

  return (
    <div className="flex flex-col gap-3">
      {/* E.1 Ampliaciones */}
      <SubSection titulo="E.1 Ampliaciones">
        <div className="flex flex-col gap-3">
          {form.ampliaciones.map((a, idx) => (
            <div key={a.id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Ampliación {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAmp(a.id)}
                  aria-label="Eliminar ampliación"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="N° PE" value={a.nPe} onChange={(v) => updateAmp(a.id, { nPe: v })} />
                <TextField
                  label="Fecha recepción"
                  type="date"
                  value={a.fechaRecepcion}
                  onChange={(v) => updateAmp(a.id, { fechaRecepcion: v })}
                />
                <TextField label="m²" type="number" value={a.m2} onChange={(v) => updateAmp(a.id, { m2: v })} />
                <TextField label="Destino" value={a.destino} onChange={(v) => updateAmp(a.id, { destino: v })} />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addAmpliacion}
            className="min-h-11 w-full border-dashed border-brand text-sm font-semibold text-brand hover:bg-blue-50 hover:text-brand/90"
          >
            <Plus className="h-4 w-4" />
            Agregar ampliación
          </Button>
        </div>
      </SubSection>

      {/* E.2 Habitaciones por nivel */}
      <SubSection titulo="E.2 Habitaciones por nivel">
        <Tabs defaultValue="n1">
          <TabsList className="w-full">
            {NIVELES.map((n) => (
              <TabsTrigger key={n.id} value={n.id}>
                {n.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {NIVELES.map((n) => (
            <TabsContent key={n.id} value={n.id} className="mt-3">
              <div className="grid grid-cols-1 gap-2">
                {CONTADORES.map((c) => (
                  <Counter
                    key={c.key}
                    label={c.label}
                    value={form.niveles[n.id][c.key]}
                    onChange={(v) => setNivel(n.id, c.key, v)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SubSection>

      {/* E.3 Terminaciones por recinto */}
      <SubSection titulo="E.3 Terminaciones por recinto">
        <div className="flex flex-col gap-3">
          {form.recintos.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">{r.nombre}</span>
                <button
                  type="button"
                  onClick={() => removeRecinto(r.id)}
                  aria-label={`Eliminar recinto ${r.nombre}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Pavimento" value={r.pavimento} onChange={(v) => updateRecinto(r.id, { pavimento: v })} />
                <TextField label="Material" value={r.material} onChange={(v) => updateRecinto(r.id, { material: v })} />
                <TextField label="Revest. muros" value={r.revestimientoMuros} onChange={(v) => updateRecinto(r.id, { revestimientoMuros: v })} />
                <TextField label="Term. cielo" value={r.terminacionCielo} onChange={(v) => updateRecinto(r.id, { terminacionCielo: v })} />
                <TextField label="Iluminación" value={r.iluminacion} onChange={(v) => updateRecinto(r.id, { iluminacion: v })} />
                <SelectField label="Estado" value={r.estado} onChange={(v) => updateRecinto(r.id, { estado: v })} opciones={OPCIONES.estadoConservacion} />
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Agregar recinto</Label>
            <div className="flex flex-wrap gap-2">
              {RECINTOS_SUGERIDOS.map((nombre) => (
                <button
                  key={nombre}
                  type="button"
                  onClick={() => addRecinto(nombre)}
                  className="inline-flex min-h-10 items-center gap-1 rounded-full border border-dashed border-brand px-3 text-sm font-medium text-brand hover:bg-blue-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SubSection>

      {/* E.4 Elementos constructivos */}
      <SubSection titulo="E.4 Elementos constructivos">
        <div className="flex flex-col gap-3">
          <TextField label="Estructura soportante" value={form.estructuraSoportante} onChange={(v) => set("estructuraSoportante", v)} />
          <TextField label="Divisiones interiores" value={form.divisionesInteriores} onChange={(v) => set("divisionesInteriores", v)} />
          <TextField label="Entrepisos" value={form.entrepisos} onChange={(v) => set("entrepisos", v)} />
          <TextField label="Cubierta" value={form.cubierta} onChange={(v) => set("cubierta", v)} />
          <TextField label="Revestimiento exterior" value={form.revestimientoExterior} onChange={(v) => set("revestimientoExterior", v)} />
          <TextField label="Cierros exteriores" value={form.cierrosExteriores} onChange={(v) => set("cierrosExteriores", v)} />
        </div>
      </SubSection>

      {/* E.5 Comodidades */}
      <SubSection titulo="E.5 Comodidades">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {COMODIDADES.map((c) => (
            <SwitchField
              key={c.key}
              label={c.label}
              checked={form.comodidades[c.key]}
              onChange={(v) => setComodidad(c.key, v)}
            />
          ))}
        </div>
      </SubSection>

      {/* E.6 Detalles */}
      <SubSection titulo="E.6 Detalles">
        <div className="flex flex-col gap-3">
          <MultiChipField
            label="Ventanas"
            opciones={OPCIONES.ventanas}
            seleccionadas={form.ventanas}
            onToggle={toggleVentana}
          />
          <TextField label="Sanitarios" value={form.sanitarios} onChange={(v) => set("sanitarios", v)} />
          <TextField label="Grifería" value={form.griferia} onChange={(v) => set("griferia", v)} />
          <TextField label="Muebles de cocina" value={form.mueblesCocina} onChange={(v) => set("mueblesCocina", v)} />
          <TextField label="Puerta principal" value={form.puertaPrincipal} onChange={(v) => set("puertaPrincipal", v)} />
          <SwitchField label="Closet mural" checked={form.closetMural} onChange={(v) => set("closetMural", v)} />
          <SwitchField label="Protecciones / rejas" checked={form.proteccionesRejas} onChange={(v) => set("proteccionesRejas", v)} />
        </div>
      </SubSection>
    </div>
  )
}
