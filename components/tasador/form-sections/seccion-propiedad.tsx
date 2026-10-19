"use client"

import type { InformeData } from "@/lib/tasador/tasaciones"
import { OPCIONES } from "@/lib/tasador/tasaciones"
import { opcionesConValorVigente } from "@/lib/tasador/defaults-propiedad"
import type { ZonaCatalogo } from "@/lib/tasador/zona"
import {
  TextField,
  SelectField,
  SwitchField,
  MultiChipField,
} from "./fields"
import { ZonaField } from "./zona-field"

export type SetForm = <K extends keyof InformeData>(
  key: K,
  value: InformeData[K],
) => void

export function SeccionPropiedad({
  form,
  set,
  tipo,
  prellenados = [],
  comuna = "",
  zonas = [],
}: {
  form: InformeData
  set: SetForm
  tipo: string
  /** Claves cuyo valor es un default del servidor (`DatosCaptura.prellenados`). */
  prellenados?: readonly (keyof InformeData)[]
  /** Comuna de la solicitud: el informe la agrega al código de zona. */
  comuna?: string
  /** Zonas de `M_Zonificacion` de esa comuna (§2.8.1). */
  zonas?: readonly ZonaCatalogo[]
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
          type="number" entero
          value={form.anioConstruccion}
          onChange={(v) => set("anioConstruccion", v)}
        />
        {/* Lista y default de la planilla del cliente [Excel: Antecedentes!Z15]. */}
        <SelectField
          label="Estado conservación"
          value={form.estadoConservacion}
          onChange={(v) => set("estadoConservacion", v)}
          opciones={opcionesConValorVigente(
            OPCIONES.estadoConservacionInmueble,
            form.estadoConservacion,
          )}
          prellenado={prellenados.includes("estadoConservacion")}
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

      {/* Lista y default de la planilla del cliente [Excel: Antecedentes!H19].
          Reemplaza a las estrellas 1–5 (14-oct-2026). */}
      <SelectField
        label="Calidad de construcción"
        value={form.calidadConstruccion}
        onChange={(v) => set("calidadConstruccion", v)}
        opciones={opcionesConValorVigente(
          OPCIONES.calidadConstruccion,
          form.calidadConstruccion,
        )}
        prellenado={prellenados.includes("calidadConstruccion")}
      />

      <div className="grid grid-cols-3 gap-3">
        {esDepto && (
          <TextField
            label="Piso"
            type="number" entero
            value={form.piso}
            onChange={(v) => set("piso", v)}
          />
        )}
        <TextField
          label="N° pisos"
          type="number" entero
          value={form.pisosPropiedad}
          onChange={(v) => set("pisosPropiedad", v)}
        />
        <TextField
          label="Subterráneos"
          type="number" entero
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
        type="number" entero
        value={form.numAscensores}
        onChange={(v) => set("numAscensores", v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Dormitorios"
          type="number" entero
          value={form.dormitorios}
          onChange={(v) => set("dormitorios", v)}
        />
        <TextField
          label="Baños"
          type="number" entero
          value={form.banos}
          onChange={(v) => set("banos", v)}
        />
        <TextField
          label="Medios baños"
          type="number" entero
          value={form.mediosBanos}
          onChange={(v) => set("mediosBanos", v)}
        />
        <TextField
          label="Baño de servicio"
          type="number" entero
          value={form.banoServicio}
          onChange={(v) => set("banoServicio", v)}
        />
      </div>

      <TextField
        label="Estacionamientos"
        type="number" entero
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
        type="number" entero
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
        prellenado={prellenados.includes("velocidadVenta")}
      />
      {/*
        Lista de las zonas de la comuna leída de `M_Zonificacion`, que admite
        escribir otra [Excel: Portada!AA21 · ZoneVal]. Se guarda el código en
        `tipo_zona_descripcion` y el servidor resuelve el Link `zonificacion`;
        el PDF imprime «CODIGO(Comuna)» [Excel: Impresion!X15]. Spec §2.8.1.
      */}
      <ZonaField
        value={form.tipoZona}
        onChange={(v) => set("tipoZona", v)}
        comuna={comuna}
        zonas={zonas}
      />
    </div>
  )
}
