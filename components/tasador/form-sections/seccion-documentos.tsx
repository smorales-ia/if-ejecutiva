"use client"

import { Sparkles } from "lucide-react"
import type { InformeData } from "@/lib/tasaciones"
import { OPCIONES } from "@/lib/tasaciones"
import { TextField, SelectField, SwitchField } from "./fields"
import type { SetForm } from "./seccion-propiedad"

export function SeccionDocumentos({
  form,
  set,
}: {
  form: InformeData
  set: SetForm
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        {/*
          Regla T-C · ningún literal visible nombra el medio técnico. El texto
          anterior lo nombraba, y además exponía el código interno del escenario
          de extracción, que al tasador no le dice nada. Incumplía la regla dos
          veces; el original queda en el historial de git.

          Corregido en **P6-TAS**, donde T-C es el criterio dominante y el grep
          de auditoría de §7.2 paso 8 no podía dar cero con esta línea viva. El
          inventario asignaba la purga a P7-TAS: **ya está hecha, no rehacerla**.
        */}
        <span>Se completa con los datos de la visita cuando los documentos estén adjuntos. Editable.</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TextField label="CBR Foja" value={form.cbrFoja} onChange={(v) => set("cbrFoja", v)} />
        <TextField label="CBR Número" value={form.cbrNumero} onChange={(v) => set("cbrNumero", v)} />
        <TextField label="CBR Año" type="number" value={form.cbrAnio} onChange={(v) => set("cbrAnio", v)} />
      </div>

      <TextField label="Vendedor" value={form.vendedor} onChange={(v) => set("vendedor", v)} />
      <TextField label="Comprador" value={form.comprador} onChange={(v) => set("comprador", v)} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Notaría" value={form.notaria} onChange={(v) => set("notaria", v)} />
        <TextField label="Repertorio" value={form.repertorio} onChange={(v) => set("repertorio", v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField label="N° permiso edificación" value={form.nPermisoEdificacion} onChange={(v) => set("nPermisoEdificacion", v)} />
        <TextField label="Fecha permiso edif." type="date" value={form.fechaPermisoEdif} onChange={(v) => set("fechaPermisoEdif", v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField label="N° recepción final" value={form.nRecepcionFinal} onChange={(v) => set("nRecepcionFinal", v)} />
        <TextField label="Fecha recepción final" type="date" value={form.fechaRecepcionFinal} onChange={(v) => set("fechaRecepcionFinal", v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Sello SEC" value={form.selloSec} onChange={(v) => set("selloSec", v)} opciones={OPCIONES.selloSec} />
        <TextField label="ID sello SEC" value={form.selloSecId} onChange={(v) => set("selloSecId", v)} />
      </div>
      <TextField label="Vencimiento sello SEC" type="date" value={form.selloSecVencimiento} onChange={(v) => set("selloSecVencimiento", v)} />

      <SwitchField label="Afecto a expropiación" checked={form.afectoExpropiacion} onChange={(v) => set("afectoExpropiacion", v)} />
      <TextField label="N° certificado no expropiación" value={form.nCertificadoNoExpropiacion} onChange={(v) => set("nCertificadoNoExpropiacion", v)} />

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Coordenadas Lat" type="number" value={form.coordenadasLat} onChange={(v) => set("coordenadasLat", v)} />
        <TextField label="Coordenadas Lng" type="number" value={form.coordenadasLng} onChange={(v) => set("coordenadasLng", v)} />
      </div>
    </div>
  )
}
