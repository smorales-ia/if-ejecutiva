"use client"

import type { InformeData } from "@/lib/tasaciones"
import { OPCIONES } from "@/lib/tasaciones"
import {
  TextField,
  SelectField,
  SwitchField,
  StarsField,
  MultiChipField,
} from "./fields"

export type SetForm = <K extends keyof InformeData>(
  key: K,
  value: InformeData[K],
) => void

export function SeccionPropiedad({
  form,
  set,
  tipo,
}: {
  form: InformeData
  set: SetForm
  tipo: string
}) {
  const esCasa = tipo.toLowerCase().includes("casa")
  const esDepto = tipo.toLowerCase().includes("depto") || tipo.toLowerCase().includes("departamento")

  const toggleOrientacion = (o: string) =>
    set(
      "orientacion",
      form.orientacion.includes(o)
        ? form.orientacion.filter((x) => x !== o)
        : [...form.orientacion, o],
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Sup. terreno (m²)"
          type="number"
          value={form.supTerreno}
          onChange={(v) => set("supTerreno", v)}
        />
        <TextField
          label="Sup. construida (m²)"
          type="number"
          value={form.supConstruida}
          onChange={(v) => set("supConstruida", v)}
        />
      </div>

      {esCasa && (
        <TextField
          label="Sup. primer piso (m²)"
          type="number"
          value={form.supPrimerPiso}
          onChange={(v) => set("supPrimerPiso", v)}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Año construcción"
          type="number"
          value={form.anioConstruccion}
          onChange={(v) => set("anioConstruccion", v)}
        />
        <SelectField
          label="Estado conservación"
          value={form.estadoConservacion}
          onChange={(v) => set("estadoConservacion", v)}
          opciones={OPCIONES.estadoConservacion}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Agrupación"
          value={form.agrupacionPropiedad}
          onChange={(v) => set("agrupacionPropiedad", v)}
          opciones={OPCIONES.agrupacion}
        />
        <SelectField
          label="Material predominante"
          value={form.materialPredominante}
          onChange={(v) => set("materialPredominante", v)}
          opciones={OPCIONES.material}
        />
      </div>

      <StarsField
        label="Calidad de construcción"
        value={form.calidadConstruccion}
        onChange={(v) => set("calidadConstruccion", v)}
      />

      <div className="grid grid-cols-3 gap-3">
        {esDepto && (
          <TextField
            label="Piso"
            type="number"
            value={form.piso}
            onChange={(v) => set("piso", v)}
          />
        )}
        <TextField
          label="N° pisos"
          type="number"
          value={form.pisosPropiedad}
          onChange={(v) => set("pisosPropiedad", v)}
        />
        <TextField
          label="Subterráneos"
          type="number"
          value={form.subterraneos}
          onChange={(v) => set("subterraneos", v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Nombre edificio"
          value={form.edificioNombre}
          onChange={(v) => set("edificioNombre", v)}
        />
        <TextField
          label="Nombre condominio"
          value={form.condominioNombre}
          onChange={(v) => set("condominioNombre", v)}
        />
      </div>

      <MultiChipField
        label="Orientación"
        opciones={OPCIONES.orientaciones}
        seleccionadas={form.orientacion}
        onToggle={toggleOrientacion}
      />

      <TextField
        label="N° de ascensores"
        type="number"
        value={form.numAscensores}
        onChange={(v) => set("numAscensores", v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Dormitorios"
          type="number"
          value={form.dormitorios}
          onChange={(v) => set("dormitorios", v)}
        />
        <TextField
          label="Baños"
          type="number"
          value={form.banos}
          onChange={(v) => set("banos", v)}
        />
        <TextField
          label="Medios baños"
          type="number"
          value={form.mediosBanos}
          onChange={(v) => set("mediosBanos", v)}
        />
        <TextField
          label="Baño de servicio"
          type="number"
          value={form.banoServicio}
          onChange={(v) => set("banoServicio", v)}
        />
      </div>

      <TextField
        label="Estacionamientos"
        type="number"
        value={form.estacionamientos}
        onChange={(v) => set("estacionamientos", v)}
      />
      <TextField
        label="Roles SII estacionamientos"
        value={form.rolesEstacionamientos}
        onChange={(v) => set("rolesEstacionamientos", v)}
        placeholder="Ej: 1502-E1, 1502-E2"
      />

      <TextField
        label="Bodegas"
        type="number"
        value={form.bodegas}
        onChange={(v) => set("bodegas", v)}
      />
      <TextField
        label="Roles SII bodegas"
        value={form.rolesBodegas}
        onChange={(v) => set("rolesBodegas", v)}
        placeholder="Ej: 1502-B1"
      />

      <TextField
        label="Servidumbre (m²)"
        type="number"
        value={form.servidumbreM2}
        onChange={(v) => set("servidumbreM2", v)}
      />

      <SwitchField
        label="DFL2"
        checked={form.dfl2}
        onChange={(v) => set("dfl2", v)}
      />

      <SelectField
        label="Velocidad de venta estimada"
        value={form.velocidadVenta}
        onChange={(v) => set("velocidadVenta", v)}
        opciones={OPCIONES.velocidadVenta}
      />
      {/*
        Campo de texto, no select. P1-TAS **retiró `OPCIONES.tipoZona` a
        propósito** —dejando este archivo roto— porque el catálogo del v0 estaba
        mal planteado de raíz: `TX_DatosTasacion` no tiene un `singleSelect` de
        zona, tiene un Link a `M_Zonificacion` y, aparte, un
        `tipo_zona_descripcion` de texto libre. Un select hardcodeado habría
        escrito valores inventados en un Link.

        Se cablea contra el texto libre porque es lo que
        `PATCH /api/tasaciones/[id]/datos` persiste hoy (`tipo_zona_descripcion`,
        `fldbrYbbvJThBaGwC`). **P7-TAS decide** si la sección pasa al Link y, en
        ese caso, sirve el catálogo por una ruta.
      */}
      <TextField
        label="Tipo de zona"
        value={form.tipoZona}
        onChange={(v) => set("tipoZona", v)}
      />
    </div>
  )
}
