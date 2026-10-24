"use client"

import { Sparkles } from "lucide-react"
import type { InformeData } from "@/lib/tasador/tasaciones"
import { OPCIONES } from "@/lib/tasador/tasaciones"
import { TextField, SelectField } from "./fields"
import type { SetForm } from "./seccion-propiedad"

export function SeccionDocumentos({
  form,
  set,
  prellenados = [],
}: {
  form: InformeData
  set: SetForm
  /**
   * Claves que llegan de la lectura de los documentos o de una sugerencia del
   * sistema (`DatosCaptura.prellenados` · spec §2.8.3). Llevan el badge
   * «Pre-llenado · editable» hasta que el tasador las cambia.
   */
  prellenados?: readonly (keyof InformeData)[]
}) {
  const p = (clave: keyof InformeData) => prellenados.includes(clave)

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

          15-oct-2026 (spec §2.8.3): la sección ya llega con lo que traen los
          documentos adjuntos; el texto lo dice sin nombrar el medio.
        */}
        <span>Llega completa con lo que traen los documentos adjuntos. Revisa, corrige o completa lo que falte.</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TextField label="CBR Foja" campoId="cbrFoja" value={form.cbrFoja} onChange={(v) => set("cbrFoja", v)} prellenado={p("cbrFoja")} />
        <TextField label="CBR Número" campoId="cbrNumero" value={form.cbrNumero} onChange={(v) => set("cbrNumero", v)} prellenado={p("cbrNumero")} />
        <TextField label="CBR Año" type="number" entero campoId="cbrAnio" value={form.cbrAnio} onChange={(v) => set("cbrAnio", v)} prellenado={p("cbrAnio")} />
      </div>

      {/* Comprador, Notaría y Repertorio se retiraron el 15-oct-2026: la planilla
          del cliente (MET-6283) no los usa y no tenían dónde guardarse (spec §2.8.3). */}
      <TextField label="Vendedor" value={form.vendedor} onChange={(v) => set("vendedor", v)} />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="N° permiso edificación"
          value={form.nPermisoEdificacion}
          onChange={(v) => set("nPermisoEdificacion", v)}
          prellenado={p("nPermisoEdificacion")}
        />
        <TextField
          label="Fecha permiso edif."
          type="date"
          value={form.fechaPermisoEdif}
          onChange={(v) => set("fechaPermisoEdif", v)}
          prellenado={p("fechaPermisoEdif")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="N° recepción final"
          value={form.nRecepcionFinal}
          onChange={(v) => set("nRecepcionFinal", v)}
          prellenado={p("nRecepcionFinal")}
        />
        <TextField
          label="Fecha recepción final"
          type="date"
          value={form.fechaRecepcionFinal}
          onChange={(v) => set("fechaRecepcionFinal", v)}
          prellenado={p("fechaRecepcionFinal")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Sello SEC"
          value={form.selloSec}
          onChange={(v) => set("selloSec", v)}
          opciones={OPCIONES.selloSec}
          prellenado={p("selloSec")}
        />
        <TextField label="ID sello SEC" value={form.selloSecId} onChange={(v) => set("selloSecId", v)} prellenado={p("selloSecId")} />
      </div>
      <TextField
        label="Vencimiento sello SEC"
        type="date"
        value={form.selloSecVencimiento}
        onChange={(v) => set("selloSecVencimiento", v)}
        prellenado={p("selloSecVencimiento")}
      />

      {/* «Afecto a expropiación» pasó a la sección I el 23-oct-2026 (I.1, junto a
          la fuente de información): este switch no tenía dónde guardarse (CI-023). */}
      <TextField
        label="N° certificado no expropiación"
        value={form.nCertificadoNoExpropiacion}
        onChange={(v) => set("nCertificadoNoExpropiacion", v)}
        prellenado={p("nCertificadoNoExpropiacion")}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Coordenadas Lat"
          type="number"
          negativo
          campoId="coordenadasLat"
          value={form.coordenadasLat}
          onChange={(v) => set("coordenadasLat", v)}
          prellenado={p("coordenadasLat")}
        />
        <TextField
          label="Coordenadas Lng"
          type="number"
          negativo
          campoId="coordenadasLng"
          value={form.coordenadasLng}
          onChange={(v) => set("coordenadasLng", v)}
          prellenado={p("coordenadasLng")}
        />
      </div>
    </div>
  )
}
