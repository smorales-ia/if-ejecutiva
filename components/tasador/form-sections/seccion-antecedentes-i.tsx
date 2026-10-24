"use client"

import { Info, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { opcionesConValorVigente } from "@/lib/tasador/defaults-propiedad"
import {
  ABC1,
  ACERAS,
  ADECUACIONES,
  ADOSAMIENTOS,
  AFECTOS_EXPROPIACION,
  AGUAS_POTABLES,
  ANTEJARDINES,
  CALZADAS,
  CAMBIOS_PLAN,
  CUMPLE_PLAN,
  DEMANDAS,
  DENSIDADES,
  DESTINOS_BARRIO,
  DISENOS,
  FORMAS_TERRENO,
  FUENTES_INFORMACION,
  GASES,
  HOMOGENEIDAD,
  MANSARDAS,
  MERCADOS,
  ORIENTACIONES_TERRENO,
  PENDIENTES,
  PREDIOS_VISTA,
  PROYECCIONES_USO,
  REDES_ELECTRICAS,
  RELACIONES_TERRENO,
  RUMBOS,
  SI_NO_I,
  SOLERAS,
  TENDENCIAS,
  TIPOS_AGRUPAMIENTO,
  TIPOS_ZONA_SECTOR,
  cambiarLey6071,
  pctOtros,
  textoExpropiacion,
  type SeccionI,
} from "@/lib/tasador/antecedentes-i"
import { SelectField, SubSection, TextField, type Opcion } from "./fields"

/**
 * Sección I · «Sector, terreno y normativa» (23-oct-2026, pedido de Sergio).
 *
 * Lo que la planilla del cliente captura para la Hoja N°3 del informe y el
 * detalle de la Hoja 1: exigencias municipales, propiedad acogida, plan
 * regulador, sector, uso de terrenos, terreno, emplazamiento e instalaciones,
 * más las dos síntesis. Llega pre-llenada con los valores fijos de
 * `C_DefaultsAntecedentes` y las fórmulas de la planilla
 * (`lib/tasador/antecedentes-i.ts`); acá sólo se llaman.
 */

const aOpciones = (xs: readonly string[]): Opcion[] => xs.map((v) => ({ v, l: v }))
const conVigente = (xs: readonly string[], valor: string) => opcionesConValorVigente(aOpciones(xs), valor)

type Bloque = Exclude<keyof SeccionI, never>

export function SeccionAntecedentesI({
  value: i,
  onChange,
  prellenada,
  comuna,
  espejo,
  sintesisPropiedad,
  descripcionSector,
  onSintesis,
  sintesisPrellenada,
  rehacerSintesisPropiedad,
  rehacerDescripcionSector,
}: {
  value: SeccionI
  onChange: (i: SeccionI) => void
  /** La sección llega con los defaults (no hay nada guardado). */
  prellenada: boolean
  /** Comuna de la solicitud, para el texto de expropiación. */
  comuna: string
  /** Lo que la Hoja N°3 imprime de otras secciones (sólo lectura acá). */
  espejo: { calidadConstructiva: string; estadoConservacion: string; supTerreno: string; dfl2: boolean }
  sintesisPropiedad: string
  descripcionSector: string
  onSintesis: (clave: "sintesisPropiedad" | "descripcionSector", valor: string) => void
  sintesisPrellenada: { propiedad: boolean; sector: boolean }
  /** Arma de nuevo el borrador con los datos actuales del formulario. */
  rehacerSintesisPropiedad: () => string
  rehacerDescripcionSector: () => string
}) {
  /** Cambia un campo de un bloque. */
  const set = <B extends Bloque>(bloque: B, campo: keyof SeccionI[B], v: string) =>
    onChange({ ...i, [bloque]: { ...i[bloque], [campo]: v } })

  /** Select de un bloque con su catálogo. */
  const sel = <B extends Bloque>(bloque: B, campo: keyof SeccionI[B], label: string, catalogo: readonly string[]) => {
    const valor = String(i[bloque][campo] ?? "")
    return (
      <SelectField
        label={label}
        value={valor}
        onChange={(v) => set(bloque, campo, v)}
        opciones={conVigente(catalogo, valor)}
        prellenado={prellenada && valor !== ""}
      />
    )
  }

  /** Texto libre (o número) de un bloque. */
  const txt = <B extends Bloque>(
    bloque: B,
    campo: keyof SeccionI[B],
    label: string,
    opts: { numero?: boolean; hint?: string } = {},
  ) => {
    const valor = String(i[bloque][campo] ?? "")
    return (
      <TextField
        label={label}
        type={opts.numero ? "number" : "text"}
        value={valor}
        onChange={(v) => set(bloque, campo, v)}
        prellenado={prellenada && valor !== ""}
        hint={opts.hint}
      />
    )
  }

  const otros = pctOtros(i.usoTerrenos)
  const expropiacion = textoExpropiacion(i.detalle, comuna)

  return (
    <div className="flex flex-col gap-3">
      {prellenada && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-brand">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Llega con los valores habituales del informe y los datos de la solicitud. El sector y el terreno
            dependen de lo que veas en la visita: complétalos y corrige lo que no calce.
          </span>
        </div>
      )}

      {/* I.1 · Portada BR6 · BK7 · BK24 · BL25 · BB29 */}
      <SubSection titulo="I.1 Detalle de la propiedad y expropiación" defaultOpen>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {txt("detalle", "sitioLote", "Sitio / Lote", { hint: "Ej.: A 40" })}
          {sel("detalle", "mansarda", "Mansarda", MANSARDAS)}
          {sel("detalle", "afectoExpropiacion", "Afecto a expropiación", AFECTOS_EXPROPIACION)}
          {sel("detalle", "fuenteInformacion", "Fuente de información", FUENTES_INFORMACION)}
        </div>
        {expropiacion && (
          <p className="mt-3 rounded-lg bg-background p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Se imprimirá: </span>
            {expropiacion}
          </p>
        )}
      </SubSection>

      {/* I.2 · Antecedentes R7:Z13 */}
      <SubSection titulo="I.2 Exigencias municipales (plan regulador)">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {txt("normativa", "supPredialMinimo", "Superficie predial mínima (m²)")}
          {txt("normativa", "frentePredialMinimo", "Frente predial mínimo (m)")}
          {txt("normativa", "ocupacionSuelo", "% ocupación de suelo")}
          {txt("normativa", "coefConstructibilidad", "Coef. máx. constructibilidad")}
          {txt("normativa", "alturaEdificacion", "Altura de edificación (m)")}
          {txt("normativa", "distanciaMedianero", "Distancia a medianero (m)")}
          {txt("normativa", "sistemaAgrupamiento", "Sistema de agrupamiento")}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          «OGUC» es lo que imprime la planilla cuando la zona no tiene normativa cargada. Si el certificado de
          informaciones previas trae otra (p. ej. «PRMS» o un valor), escríbela.
        </p>
      </SubSection>

      {/* I.3 · Antecedentes AH7:BI10 */}
      <SubSection titulo="I.3 Propiedad acogida y plan regulador">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="D.F.L. 2 (de la sección B)" value={espejo.dfl2 ? "SI" : "NO"} onChange={() => {}} disabled />
          <SelectField
            label="Ley 6071 (venta por pisos)"
            value={i.normativa.ley6071}
            onChange={(v) => onChange(cambiarLey6071(i, v))}
            opciones={conVigente(SI_NO_I, i.normativa.ley6071)}
            prellenado={prellenada && i.normativa.ley6071 !== ""}
          />
          {sel("normativa", "ley9135", "Ley 9135 (Ley Pereira)", SI_NO_I)}
          {sel("normativa", "ley19537", "Ley 19537 (copropiedad inmobiliaria)", SI_NO_I)}
          {sel("normativa", "cumpleUsoActual", "Cumple según el uso actual", CUMPLE_PLAN)}
          {sel("normativa", "cumpleTipoConstruccion", "Cumple según el tipo de construcción", CUMPLE_PLAN)}
          {txt("normativa", "usoMasProbable", "Uso más probable del bien")}
          {sel("normativa", "cambiosPlanRegulador", "Cambios en el plan regulador", CAMBIOS_PLAN)}
        </div>
      </SubSection>

      {/* I.4 · Portada F22:AE26 · Antecedentes BD19 */}
      <SubSection titulo="I.4 Sector">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sel("sector", "demanda", "Demanda", DEMANDAS)}
          {sel("sector", "tendencia", "Tendencia", TENDENCIAS)}
          {sel("sector", "densidad", "Densidad", DENSIDADES)}
          {sel("sector", "mercado", "Mercado", MERCADOS)}
          {sel("sector", "abc1", "ABC1", ABC1)}
          {sel("sector", "homogeneidad", "Homogeneidad", HOMOGENEIDAD)}
          {sel("sector", "destinoBarrio", "Destino del barrio", DESTINOS_BARRIO)}
          {sel("sector", "tipoZona", "Tipo de zona", TIPOS_ZONA_SECTOR)}
          {sel("sector", "calzada", "Calzada", CALZADAS)}
          {sel("sector", "acera", "Acera", ACERAS)}
          {sel("sector", "solera", "Solera", SOLERAS)}
          {sel("sector", "antejardin", "Antejardín", ANTEJARDINES)}
          {sel("sector", "redElectrica", "Red eléctrica", REDES_ELECTRICAS)}
          {sel("sector", "aguaPotable", "Agua potable", AGUAS_POTABLES)}
          {sel("sector", "gas", "Gas", GASES)}
          {sel("sector", "proyUsoTerrenos", "Proyección de uso de terrenos", PROYECCIONES_USO)}
        </div>
        <div className="mt-3">{txt("sector", "arteriaPrincipal", "Arteria principal", { hint: "La avenida más cercana. Ej.: Caletera Oriente Gral San Martín" })}</div>
      </SubSection>

      {/* I.5 · Portada AK22:AZ26 */}
      <SubSection titulo="I.5 Uso de terrenos del sector (%)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {txt("usoTerrenos", "casas", "Casas", { numero: true })}
          {txt("usoTerrenos", "deptos", "Deptos.", { numero: true })}
          {txt("usoTerrenos", "condominios", "Condominios", { numero: true })}
          {txt("usoTerrenos", "equipComercial", "Equip. comercial", { numero: true })}
          {txt("usoTerrenos", "industrial", "Industrial", { numero: true })}
          {txt("usoTerrenos", "comercial", "Comercial", { numero: true })}
          {txt("usoTerrenos", "sitiosEriazos", "Sitios eriazos", { numero: true })}
          <TextField label="Otros (calculado)" value={otros === null ? "" : String(otros)} onChange={() => {}} disabled />
        </div>
        {otros !== null && otros < 0 && (
          <p className="mt-2 text-sm text-warning">Los porcentajes suman más de 100.</p>
        )}
      </SubSection>

      {/* I.6 · Antecedentes AO21:BG24 */}
      <SubSection titulo="I.6 Terreno de emplazamiento">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="Superficie (m², de la sección B)" value={espejo.supTerreno} onChange={() => {}} disabled />
          {sel("terreno", "forma", "Forma", FORMAS_TERRENO)}
          {sel("terreno", "pendiente", "Pendiente", PENDIENTES)}
          {sel("terreno", "orientacion", "Orientación", ORIENTACIONES_TERRENO)}
          {txt("terreno", "frente", "Frente (m)", { numero: true })}
          {txt("terreno", "contrafrente", "Contrafrente (m)", { numero: true })}
          {txt("terreno", "deslindeNorte", "Deslinde norte (m)", { numero: true })}
          {txt("terreno", "deslindeSur", "Deslinde sur (m)", { numero: true })}
        </div>
      </SubSection>

      {/* I.7 · Antecedentes H15:Z19 */}
      <SubSection titulo="I.7 Emplazamiento">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sel("emplazamiento", "tipoAgrupamiento", "Tipo de agrupamiento", TIPOS_AGRUPAMIENTO)}
          {sel("emplazamiento", "disenoArquitectonico", "Diseño arquitectónico", DISENOS)}
          {sel("emplazamiento", "utilidadFuncional", "Utilidad funcional", ADECUACIONES)}
          {sel("emplazamiento", "tipoAdosamiento", "Tipo de adosamiento", ADOSAMIENTOS)}
          <TextField label="Calidad constructiva (de la sección B)" value={espejo.calidadConstructiva} onChange={() => {}} disabled />
          <TextField label="Estado de conservación (de la sección B)" value={espejo.estadoConservacion} onChange={() => {}} disabled />
          {sel("emplazamiento", "predioVista", "Predio y/o vista", PREDIOS_VISTA)}
          {sel("emplazamiento", "orientacionConstruccion", "Orientación de la construcción", RUMBOS)}
          {sel("emplazamiento", "relacionTerrenoConstruccion", "Relación terreno / construcción", RELACIONES_TERRENO)}
          {sel("emplazamiento", "iluminacionNatural", "Iluminación natural", ADECUACIONES)}
        </div>
      </SubSection>

      {/* I.8 · Antecedentes AH15:AN19 */}
      <SubSection titulo="I.8 Instalaciones de la propiedad">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {txt("instalaciones", "alcantarillado", "Alcantarillado", { hint: "Ej.: Colector, Fosa" })}
          <TextField label="Agua potable (del sector)" value={i.sector.aguaPotable} onChange={() => {}} disabled />
          <TextField label="Electricidad (del sector)" value={i.sector.redElectrica} onChange={() => {}} disabled />
          <TextField label="Gas (del sector)" value={i.sector.gas} onChange={() => {}} disabled />
          {txt("instalaciones", "otros", "Otros")}
        </div>
      </SubSection>

      {/* I.9 · Portada D12 · D18 */}
      <SubSection titulo="I.9 Síntesis de la propiedad y del sector">
        <div className="flex flex-col gap-4">
          <CampoSintesis
            id="sintesis-propiedad"
            label="Síntesis de la propiedad"
            valor={sintesisPropiedad}
            prellenado={sintesisPrellenada.propiedad}
            onChange={(v) => onSintesis("sintesisPropiedad", v)}
            onRehacer={() => onSintesis("sintesisPropiedad", rehacerSintesisPropiedad())}
          />
          <CampoSintesis
            id="descripcion-sector"
            label="Descripción del sector"
            valor={descripcionSector}
            prellenado={sintesisPrellenada.sector}
            onChange={(v) => onSintesis("descripcionSector", v)}
            onRehacer={() => onSintesis("descripcionSector", rehacerDescripcionSector())}
          />
          <p className="text-xs text-muted-foreground">
            El borrador se arma sólo con los datos del formulario. Complétalo con lo que viste en la visita.
          </p>
        </div>
      </SubSection>
    </div>
  )
}

function CampoSintesis({
  id,
  label,
  valor,
  prellenado,
  onChange,
  onRehacer,
}: {
  id: string
  label: string
  valor: string
  prellenado: boolean
  onChange: (v: string) => void
  onRehacer: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
          {label}
          {prellenado && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Pre-llenado · editable
            </span>
          )}
        </Label>
        <Button type="button" variant="ghost" size="sm" onClick={onRehacer}>
          <RefreshCw data-icon="inline-start" />
          Rehacer borrador
        </Button>
      </div>
      <Textarea id={id} rows={6} value={valor} onChange={(e) => onChange(e.target.value)} className="text-base" />
    </div>
  )
}
