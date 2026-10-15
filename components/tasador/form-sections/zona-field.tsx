"use client"

import { useContext, useId } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormModoConsultaContext } from "./fields"
import {
  comunaUtil,
  componerZona,
  zonaEnCatalogo,
  type ZonaCatalogo,
} from "@/lib/tasador/zona"

/**
 * «Tipo de zona» de la sección B (spec §2.8.1 · 14-oct-2026).
 *
 * Replica la celda `[Excel: Portada!AA21]`: una lista con las zonas de la
 * comuna de la solicitud (`M_Zonificacion`, nombre `ZoneVal` de la planilla)
 * que **admite escribir otra**, porque el catálogo no está completo —Colina no
 * trae `IPB`—. Por eso es un `<input list>` y no un `Select`: el `datalist`
 * nativo sugiere y filtra mientras se escribe, sin impedir un valor nuevo.
 *
 * El tasador escribe sólo el código; la comuna la agrega el informe. La línea
 * de abajo muestra lo que se imprimirá. Si el código está o no en el catálogo
 * lo decide el servidor al guardar (Link `zonificacion`); acá sólo se avisa.
 */
export function ZonaField({
  value,
  onChange,
  comuna,
  zonas,
}: {
  value: string
  onChange: (v: string) => void
  comuna: string
  zonas: readonly ZonaCatalogo[]
}) {
  const base = useId()
  const id = `zona-${base}`
  const listaId = `zonas-${base}`
  const consulta = useContext(FormModoConsultaContext)

  const nombreComuna = comunaUtil(comuna)
  const codigo = value.trim()
  const enCatalogo = zonaEnCatalogo(codigo, zonas) !== null

  let ayuda: string
  if (codigo !== "") {
    ayuda = `Se imprime: ${componerZona(codigo, nombreComuna)}`
    if (!enCatalogo && zonas.length > 0) {
      ayuda += ` · No está en la lista de ${nombreComuna}; se guarda tal como la escribiste.`
    }
  } else if (zonas.length > 0) {
    ayuda = `Elige una de las ${zonas.length} zonas de ${nombreComuna} o escribe otra. La comuna se agrega sola en el informe.`
  } else {
    ayuda = "No hay zonas cargadas para esta comuna. Escribe la zona del Certificado de Informaciones Previas."
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        Tipo de zona
      </Label>
      <Input
        id={id}
        list={zonas.length > 0 ? listaId : undefined}
        value={value}
        placeholder={zonas[0] ? `Ej.: ${zonas[0].zona}` : "Ej.: IPB"}
        autoComplete="off"
        disabled={consulta}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 text-base"
      />
      {zonas.length > 0 && (
        <datalist id={listaId}>
          {zonas.map((z) => (
            <option key={z.id} value={z.zona} />
          ))}
        </datalist>
      )}
      <p className="text-xs text-muted-foreground">{ayuda}</p>
    </div>
  )
}
