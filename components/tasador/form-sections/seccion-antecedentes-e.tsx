"use client"

import { useContext } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { opcionesConValorVigente } from "@/lib/tasador/defaults-propiedad"
import { normalizarNumeroTecleado } from "@/lib/tasador/numero-tecleado"
import {
  CALIDADES,
  COMODIDADES_E,
  ELEMENTOS_E,
  ESTADOS_CONSERVACION,
  ESTADOS_ELEMENTO,
  NIVELES_E,
  PAVIMENTOS,
  RECINTOS_E,
  REVESTIMIENTOS_MUROS,
  SI_NO,
  TERMINACIONES_CIELO,
  TIPOS_HABITACION,
  cambiarComodidad,
  cambiarMaterialidad,
  cambiarPavimento,
  superficieTotalE,
  totalesHabitaciones,
  type AmpliacionE,
  type ContextoE,
  type ElementoE,
  type ElementoValor,
  type NivelE,
  type RecintoE,
  type SeccionE,
  type SiNo,
  type TerminacionValor,
  type TipoHabitacion,
} from "@/lib/tasador/antecedentes-e"
import { FormModoConsultaContext, SelectField, SubSection, TextField, type Opcion } from "./fields"

/**
 * Sección E · «Antecedentes» del informe (19-oct-2026, pedido de Sergio).
 *
 * Replica la hoja «Antecedentes» de la planilla del cliente: comodidades,
 * ampliaciones, habitaciones por nivel, características constructivas
 * principales y terminaciones, en ese orden. Llega **pre-llenada** con los
 * valores que dejan las fórmulas de la hoja y el tasador revisa y corrige. Las
 * reglas y las dependencias (pavimento → material, comodidad calefacción →
 * calefacción, materialidad → calidad y estado) viven en
 * `lib/tasador/antecedentes-e.ts`; acá sólo se llaman.
 */

const aOpciones = (xs: readonly string[]): Opcion[] => xs.map((v) => ({ v, l: v }))
const conVigente = (xs: readonly string[], valor: string) => opcionesConValorVigente(aOpciones(xs), valor)

/** SI / NO de la hoja: tocar el valor activo lo deja en blanco, como borrar la celda. */
function SiNoField({ label, value, onChange }: { label: string; value: SiNo; onChange: (v: SiNo) => void }) {
  const consulta = useContext(FormModoConsultaContext)
  return (
    <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex gap-1" role="group" aria-label={label}>
        {SI_NO.map((op) => (
          <button
            key={op}
            type="button"
            disabled={consulta}
            aria-pressed={value === op}
            onClick={() => onChange(value === op ? "" : op)}
            className={cn(
              "h-9 min-w-11 rounded-md border px-2 text-sm font-semibold disabled:opacity-60",
              value === op
                ? "border-brand bg-brand text-white"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Cantidad de un tipo de recinto en un nivel: se escribe, vacío = 0. */
function CantidadField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const consulta = useContext(FormModoConsultaContext)
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        disabled={consulta}
        value={value > 0 ? String(value) : ""}
        onChange={(e) => onChange(Number(normalizarNumeroTecleado(e.target.value, { entero: true })) || 0)}
        className="h-9 w-16 text-center text-base tabular-nums"
      />
    </label>
  )
}

export function SeccionAntecedentesE({
  value: e,
  onChange,
  ctx,
  prellenada,
}: {
  value: SeccionE
  onChange: (e: SeccionE) => void
  /** Lo que las fórmulas de la hoja leen de la solicitud y de la sección B. */
  ctx: ContextoE
  /** La sección llega con los defaults de la hoja (no hay nada guardado). */
  prellenada: boolean
}) {
  const setAmpliacion = (i: number, patch: Partial<AmpliacionE>) =>
    onChange({ ...e, ampliaciones: e.ampliaciones.map((a, j) => (j === i ? { ...a, ...patch } : a)) })

  const setCantidad = (nivel: NivelE, tipo: TipoHabitacion, n: number) =>
    onChange({
      ...e,
      habitaciones: {
        ...e.habitaciones,
        [nivel]: { ...e.habitaciones[nivel], cantidades: { ...e.habitaciones[nivel].cantidades, [tipo]: n } },
      },
    })

  const setSuperficie = (nivel: NivelE, superficieM2: string) =>
    onChange({ ...e, habitaciones: { ...e.habitaciones, [nivel]: { ...e.habitaciones[nivel], superficieM2 } } })

  const setElemento = (id: ElementoE, patch: Partial<ElementoValor>) =>
    onChange({ ...e, elementos: { ...e.elementos, [id]: { ...e.elementos[id], ...patch } } })

  const setTerminacion = (id: RecintoE, patch: Partial<TerminacionValor>) =>
    onChange({ ...e, terminaciones: { ...e.terminaciones, [id]: { ...e.terminaciones[id], ...patch } } })

  const totales = totalesHabitaciones(e)

  return (
    <div className="flex flex-col gap-3">
      {prellenada && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-brand">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Llega completa con los datos de la solicitud y los valores habituales del informe. Revisa y corrige lo que no calce con la propiedad.</span>
        </div>
      )}

      {/* E.1 · B21:AL24 */}
      <SubSection titulo="E.1 Comodidades" defaultOpen>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {COMODIDADES_E.map((c) => (
            <SiNoField
              key={c.id}
              label={c.label}
              value={e.comodidades[c.id]}
              onChange={(v) => onChange(cambiarComodidad(e, c.id, v, ctx))}
            />
          ))}
        </div>
      </SubSection>

      {/* E.2 · B26:BH28 */}
      <SubSection titulo="E.2 Ampliaciones">
        <div className="flex flex-col gap-3">
          {e.ampliaciones.map((a, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3">
              <SiNoField label={`Ampliación ${i + 1} · Regulada`} value={a.regulado} onChange={(v) => setAmpliacion(i, { regulado: v })} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="P.E." value={a.pe} onChange={(v) => setAmpliacion(i, { pe: v })} />
                <TextField label="RIF" value={a.rif} onChange={(v) => setAmpliacion(i, { rif: v })} />
                <TextField label="Regulación" value={a.regulacion} onChange={(v) => setAmpliacion(i, { regulacion: v })} />
                <TextField label="m²" type="number" value={a.m2} onChange={(v) => setAmpliacion(i, { m2: v })} />
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      {/* E.3 · B29:BP34 */}
      <SubSection titulo="E.3 Habitaciones por nivel">
        <Tabs defaultValue="n1">
          <TabsList className="w-full">
            {NIVELES_E.map((n) => (
              <TabsTrigger key={n.id} value={n.id}>
                {n.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {NIVELES_E.map((n) => (
            <TabsContent key={n.id} value={n.id} className="mt-3 flex flex-col gap-2">
              <TextField
                label="Superficie del nivel (m²)"
                type="number"
                value={e.habitaciones[n.id].superficieM2}
                onChange={(v) => setSuperficie(n.id, v)}
                prellenado={prellenada && e.habitaciones[n.id].superficieM2 !== ""}
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TIPOS_HABITACION.map((t) => (
                  <CantidadField
                    key={t.id}
                    label={t.label}
                    value={e.habitaciones[n.id].cantidades[t.id] ?? 0}
                    onChange={(v) => setCantidad(n.id, t.id, v)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-background p-3 text-sm sm:grid-cols-3">
          {[
            ["Total habitaciones", totales.total],
            ["Dormitorios", totales.dormitorios],
            ["Baños", totales.banos],
            ["Dorm. servicio", totales.dormServicio],
            ["Baño servicio", totales.banoServicio],
            ["Superficie total (m²)", superficieTotalE(e).toLocaleString("es-CL")],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-semibold tabular-nums text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </SubSection>

      {/* E.4 · B35:BP44 */}
      <SubSection titulo="E.4 Características constructivas principales">
        <div className="flex flex-col gap-4">
          {(["fundamental", "otro"] as const).map((grupo) => (
            <div key={grupo} className="flex flex-col gap-3">
              <Label className="text-sm font-semibold">
                {grupo === "fundamental" ? "Elementos fundamentales" : "Otros"}
              </Label>
              {ELEMENTOS_E.filter((x) => x.grupo === grupo).map((x) => {
                const v = e.elementos[x.id]
                return (
                  <div key={x.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3">
                    {x.opciones ? (
                      <SelectField
                        label={x.label}
                        value={v.materialidad}
                        onChange={(m) => onChange(cambiarMaterialidad(e, x.id, m, ctx))}
                        opciones={conVigente(x.opciones, v.materialidad)}
                        prellenado={prellenada && v.materialidad !== ""}
                      />
                    ) : (
                      <TextField
                        label={x.label}
                        value={v.materialidad}
                        onChange={(m) => onChange(cambiarMaterialidad(e, x.id, m, ctx))}
                        prellenado={prellenada && v.materialidad !== ""}
                      />
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField
                        label="Calidad"
                        value={v.calidad}
                        onChange={(calidad) => setElemento(x.id, { calidad })}
                        opciones={conVigente(CALIDADES, v.calidad)}
                      />
                      <SelectField
                        label="Estado"
                        value={v.estado}
                        onChange={(estado) => setElemento(x.id, { estado })}
                        opciones={conVigente(ESTADOS_ELEMENTO, v.estado)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </SubSection>

      {/* E.5 · B45:BP50 */}
      <SubSection titulo="E.5 Terminaciones">
        <div className="flex flex-col gap-3">
          {RECINTOS_E.map((r) => {
            const t = e.terminaciones[r.id]
            return (
              <div key={r.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3">
                <span className="text-sm font-semibold">{r.label}</span>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Tipo de pavimento"
                    value={t.pavimento}
                    onChange={(p) => onChange(cambiarPavimento(e, r.id, p))}
                    opciones={conVigente(PAVIMENTOS, t.pavimento)}
                    prellenado={prellenada}
                  />
                  <TextField
                    label="Material / marca / origen"
                    value={t.material}
                    onChange={(material) => setTerminacion(r.id, { material })}
                  />
                  <SelectField
                    label="Revestimiento de muros"
                    value={t.muros}
                    onChange={(muros) => setTerminacion(r.id, { muros })}
                    opciones={conVigente(REVESTIMIENTOS_MUROS, t.muros)}
                  />
                  <SelectField
                    label="Terminación de cielo"
                    value={t.cielo}
                    onChange={(cielo) => setTerminacion(r.id, { cielo })}
                    opciones={conVigente(TERMINACIONES_CIELO, t.cielo)}
                  />
                  <SelectField
                    label="Iluminación"
                    value={t.iluminacion}
                    onChange={(iluminacion) => setTerminacion(r.id, { iluminacion })}
                    opciones={conVigente(CALIDADES, t.iluminacion)}
                  />
                  <SelectField
                    label="Estado"
                    value={t.estado}
                    onChange={(estado) => setTerminacion(r.id, { estado })}
                    opciones={conVigente(ESTADOS_CONSERVACION, t.estado)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </SubSection>
    </div>
  )
}
