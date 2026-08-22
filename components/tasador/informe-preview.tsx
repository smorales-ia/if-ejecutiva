"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Files,
  Loader2,
  Check,
  X,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATEGORIAS_FOTO,
  marcarPdfListo,
  guardarObservacionRechazo,
  resolverInforme,
  type Tasacion,
  type InformeData,
} from "@/lib/tasaciones"
import { readPayload } from "@/lib/tasador/tasador-store"
import { useEstadoTasador } from "@/lib/tasador/use-estado-tasador"
import type { SetForm } from "@/components/tasador/form-sections/seccion-propiedad"
import { SeccionComparables } from "@/components/tasador/form-sections/seccion-comparables"
import { ExpedienteSheet } from "@/components/tasador/expediente-sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const MIN_OBS = 20

const nfUf = new Intl.NumberFormat("es-CL", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
const nf = new Intl.NumberFormat("es-CL")

function clp(v: string | number) {
  const n = typeof v === "string" ? Number(v.replace(/\D/g, "")) : v
  if (!n || Number.isNaN(n)) return "—"
  return `$${nf.format(n)}`
}
function num(v: string) {
  if (!v) return "—"
  const n = Number(v)
  return Number.isNaN(n) ? v : nf.format(n)
}
function txt(v: string | undefined) {
  return v && v.trim() ? v : "—"
}

/* ---------- Bloques de presentación ---------- */

function ReportSection({
  titulo,
  numero,
  listo,
  children,
}: {
  titulo: string
  numero: number
  listo: boolean
  children: React.ReactNode
}) {
  return (
    <section className="print-block rounded-xl border border-border bg-background p-4">
      <h2 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-bold uppercase tracking-wide text-brand">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-[11px] text-brand">
          {numero}
        </span>
        {titulo}
      </h2>
      {listo ? (
        <div className="mt-3">{children}</div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-3 animate-pulse rounded bg-muted",
                i === 2 ? "w-2/3" : "w-full",
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function DataGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
}

function Dato({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="truncate text-sm font-medium text-foreground">{v}</dd>
    </div>
  )
}

const noopSet: SetForm = () => {}

export function InformePreview({ tasacion }: { tasacion: Tasacion }) {
  const router = useRouter()
  const { estado } = useEstadoTasador(tasacion.id)

  const [rechazoOpen, setRechazoOpen] = useState(false)
  const [confirmarOpen, setConfirmarOpen] = useState(false)
  const [rechazoOkOpen, setRechazoOkOpen] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [obs, setObs] = useState("")

  /*
   * Solo se bloquea mientras el cálculo sigue corriendo (§7.2). Al llegar a esta
   * pantalla el informe ya está disponible para revisar.
   *
   * El v0 comparaba `estado === "EN_CALCULO"`, un literal de su store en
   * memoria que no existe en el backend: la máquina de estados real usa
   * `visitada · calculada · pdf_listo` (§0.4 · nota 6). Quien decide es
   * `informeDisponible`, que la ruta `/estado` deriva del estado real. Mientras
   * la primera lectura está en vuelo (`estado === null`) **no** se bloquea:
   * asumir cálculo en curso mostraría un spinner en la pantalla de un informe
   * que ya está listo.
   */
  const enCalculo = estado !== null && !estado.informeDisponible
  const disponible = !enCalculo
  const listo = !enCalculo
  const obsValida = obs.trim().length >= MIN_OBS

  /*
   * Sin borrador local no hay nada que previsualizar todavía: se cae al
   * formulario en blanco en vez de reventar. El preview con datos del servidor
   * es de P9-TAS, que lo lee de `GET /api/tasaciones/[id]/informe`.
   */
  const d: InformeData = readPayload(tasacion.id) ?? resolverInforme(tasacion)
  const esNuevo = tasacion.tipoPropiedad === "nuevo"

  /* Valor de tasación (UF) y cap rate */
  const overrideUf = Number(d.valorSugeridoOverride.replace(/[^\d.]/g, "")) || 0
  const valorUf = overrideUf || tasacion.valorEstimadoUf || 0
  const arriendoMensual = Number(d.arriendoBrutoClp.replace(/\D/g, "")) || 0
  const gastoAnual = Number(d.gastoAnualClp.replace(/\D/g, "")) || 0
  const valorReferenciaClp = Number(d.valorReferenciaClp.replace(/\D/g, "")) || 0
  const netoAnual = arriendoMensual * 12 - gastoAnual
  const capRate =
    valorReferenciaClp > 0 ? ((netoAnual / valorReferenciaClp) * 100).toFixed(2) : null

  /* Unidades / SII */
  const unidades = tasacion.unidades ?? []
  const supTotalUnidades = unidades.reduce((a, u) => a + (u.superficieM2 || 0), 0)

  /* Fotos */
  const totalFotos =
    Object.values(d.fotosPredefinidas).reduce((a, b) => a + b.length, 0) +
    d.categoriasCustom.reduce((a, c) => a + c.fotos.length, 0)

  /* ---- Acciones ---- */
  const handleDescargarPDF = () => {
    if (tasacion.pdfUrl) {
      window.open(tasacion.pdfUrl, "_blank", "noopener,noreferrer")
    } else if (typeof window !== "undefined") {
      window.print()
    }
  }

  const handleGuardarObservacion = () => {
    if (!obsValida) return
    guardarObservacionRechazo(tasacion.id, obs.trim())
    setRechazoOpen(false)
    setRechazoOkOpen(true)
  }

  const handleEnviar = () => {
    marcarPdfListo(tasacion.id)
    setConfirmarOpen(false)
    setEnviado(true)
    setTimeout(() => router.push("/tasaciones"), 2500)
  }

  /* ---- Pantalla de agradecimiento (§7.5) ---- */
  if (enviado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted px-6 text-center">
        <CheckCircle2 className="h-20 w-20" style={{ color: "#059669" }} />
        <h1 className="text-2xl font-bold text-foreground">Informe enviado</h1>
        <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
          Gracias. El visador revisará este informe. Ya no aparecerá en tu lista.
        </p>
        <Button
          type="button"
          onClick={() => router.push("/tasaciones")}
          className="mt-2 min-h-12 bg-brand px-6 text-base font-semibold text-white hover:brightness-95"
        >
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-muted">
      {/* Header */}
      <header className="no-print sticky top-0 z-30 border-b border-border bg-brand text-white">
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={() => router.push(`/tasaciones/${tasacion.id}`)}
            aria-label="Volver al formulario"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold uppercase tracking-wide">
              Informe de Tasación
            </p>
            <p className="truncate text-xs text-white/80">
              {tasacion.codigo} · v{tasacion.version}
            </p>
          </div>
        </div>
      </header>

      <main className="print-area px-4 pb-40 pt-4">
        {/* Encabezado del documento (visible al imprimir) */}
        <div className="mb-4 hidden print:block">
          <h1 className="text-lg font-bold text-brand">
            Informe de Tasación · {tasacion.codigo}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tasacion.direccion}, {tasacion.comuna} · v{tasacion.version}
          </p>
        </div>

        {enCalculo && (
          <div className="no-print mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand" />
            <div>
              <p className="text-base font-semibold text-brand">
                Generando informe…
              </p>
              <p className="text-sm text-muted-foreground">
                El cálculo tarda unos segundos. Esta vista se actualizará sola.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* 1 · Cabecera */}
          <ReportSection titulo="Cabecera" numero={1} listo={listo}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    esNuevo
                      ? "bg-blue-50 text-brand"
                      : "bg-amber-50 text-warning",
                  )}
                >
                  {esNuevo ? "Nuevo" : "Usado"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tasacion.codigo}
                </span>
              </div>
              <DataGrid>
                <Dato k="Cliente institucional" v={txt(tasacion.cliente)} />
                <Dato k="Dirección" v={txt(tasacion.direccion)} />
                <Dato k="Comuna" v={txt(tasacion.comuna)} />
                <Dato k="Fecha de visita" v={txt(d.fechaVisitaReal)} />
              </DataGrid>
            </div>
          </ReportSection>

          {/* 2 · Valor de tasación destacado */}
          <ReportSection titulo="Valor de tasación" numero={2} listo={listo}>
            <div className="rounded-lg bg-brand/5 p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Valor de tasación
              </p>
              <p className="mt-1 text-5xl font-bold text-brand">
                {valorUf ? nfUf.format(valorUf) : "—"}
                <span className="ml-2 text-2xl font-semibold">UF</span>
              </p>
              <p className="mt-2 text-base font-medium text-muted-foreground">
                Cap rate:{" "}
                {capRate ? (
                  <span className="text-success">{capRate}%</span>
                ) : (
                  "—"
                )}
              </p>
              {overrideUf > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ajuste manual del tasador
                  {d.motivoOverride ? `: ${d.motivoOverride}` : ""}
                </p>
              )}
            </div>
          </ReportSection>

          {/* 3 · Antecedentes de la propiedad */}
          <ReportSection titulo="Antecedentes de la propiedad" numero={3} listo={listo}>
            <DataGrid>
              <Dato k="Sup. terreno" v={`${num(d.supTerreno)} m²`} />
              <Dato k="Sup. construida" v={`${num(d.supConstruida)} m²`} />
              <Dato k="Sup. primer piso" v={`${num(d.supPrimerPiso)} m²`} />
              <Dato k="Año construcción" v={txt(d.anioConstruccion)} />
              <Dato k="Materialidad" v={txt(d.materialPredominante)} />
              <Dato k="Calidad construcción" v={d.calidadConstruccion ? `${d.calidadConstruccion}/5` : "—"} />
              <Dato k="Estado conservación" v={txt(d.estadoConservacion)} />
              <Dato k="Dormitorios" v={txt(d.dormitorios)} />
              <Dato k="Baños" v={txt(d.banos)} />
              <Dato k="Estacionamientos" v={txt(d.estacionamientos)} />
            </DataGrid>
          </ReportSection>

          {/* 4 · Datos SII / avalúo */}
          <ReportSection titulo="Datos SII / avalúo" numero={4} listo={listo}>
            {unidades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-2 pr-3 font-semibold">Unidad</th>
                      <th className="py-2 pr-3 font-semibold">Rol SII</th>
                      <th className="py-2 text-right font-semibold">Sup. (m²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidades.map((u) => (
                      <tr key={u.rolSii} className="border-b border-border/60">
                        <td className="py-2 pr-3 font-medium text-foreground">
                          {txt(u.numero)}
                        </td>
                        <td className="py-2 pr-3 tabular-nums text-foreground">
                          {txt(u.rolSii)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-foreground">
                          {nf.format(u.superficieM2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold text-foreground">
                      <td className="py-2 pr-3" colSpan={2}>
                        Total
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {nf.format(supTotalUnidades)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin unidades registradas.
              </p>
            )}
          </ReportSection>

          {/* 5 · Cuadro de valoración */}
          <ReportSection titulo="Cuadro de valoración" numero={5} listo={listo}>
            {d.items.length ? (
              <ul className="flex flex-col divide-y divide-border">
                {d.items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {txt(it.descripcion)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {txt(it.subtipo)} ·{" "}
                        {it.aportaGarantia ? "Aporta garantía" : "No aporta"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {num(it.superficieM2)} m²
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin ítems registrados.
              </p>
            )}
          </ReportSection>

          {/* 6 · Comparables (grilla §5.2 read-only) */}
          <ReportSection titulo="Comparables" numero={6} listo={listo}>
            <SeccionComparables form={d} set={noopSet} readOnly />
          </ReportSection>

          {/* 7 · Registro fotográfico */}
          <ReportSection titulo="Registro fotográfico" numero={7} listo={listo}>
            <div className="mb-3 text-sm text-foreground">
              <span className="font-semibold">{totalFotos}</span> fotografías
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {CATEGORIAS_FOTO.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate text-muted-foreground">
                    {c.label}
                  </span>
                  <span className="font-medium text-foreground">
                    {d.fotosPredefinidas[c.id]?.length ?? 0}
                  </span>
                </div>
              ))}
              {d.categoriasCustom.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate text-muted-foreground">
                    {c.nombre}
                  </span>
                  <span className="font-medium text-foreground">
                    {c.fotos.length}
                  </span>
                </div>
              ))}
            </div>
          </ReportSection>

          {/* 8 · Observaciones y overrides */}
          <ReportSection titulo="Observaciones y overrides" numero={8} listo={listo}>
            <div className="flex flex-col gap-3">
              {d.observacionesTasador ? (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Observaciones del tasador
                  </p>
                  <p className="whitespace-pre-line text-sm text-foreground">
                    {d.observacionesTasador}
                  </p>
                </div>
              ) : null}
              {overrideUf > 0 || d.tasaCapRateOverride || d.vidaUtilOverride ? (
                <DataGrid>
                  {overrideUf > 0 && (
                    <Dato k="Valor sugerido (override)" v={`${nfUf.format(overrideUf)} UF`} />
                  )}
                  {d.tasaCapRateOverride && (
                    <Dato k="Cap rate (override)" v={`${d.tasaCapRateOverride}%`} />
                  )}
                  {d.vidaUtilOverride && (
                    <Dato k="Vida útil (override)" v={`${d.vidaUtilOverride} años`} />
                  )}
                  {d.motivoOverride && <Dato k="Motivo del ajuste" v={txt(d.motivoOverride)} />}
                </DataGrid>
              ) : null}
              {!d.observacionesTasador &&
                overrideUf === 0 &&
                !d.tasaCapRateOverride &&
                !d.vidaUtilOverride && (
                  <p className="text-sm text-muted-foreground">
                    Sin observaciones ni ajustes manuales.
                  </p>
                )}
            </div>
          </ReportSection>
        </div>
      </main>

      {/* Footer sticky: 4 acciones (§7.2) */}
      <footer className="no-print fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl border-t border-border bg-background shadow-lg">
        <div className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDescargarPDF}
            className="min-h-12 border-border bg-transparent text-sm font-semibold text-foreground"
          >
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>

          <ExpedienteSheet
            tasacion={tasacion}
            payload={d}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="min-h-12 border-border bg-transparent text-sm font-semibold text-foreground"
              >
                <Files className="h-4 w-4" />
                Ver expediente
              </Button>
            }
          />

          <Button
            type="button"
            disabled={!disponible}
            onClick={() => setRechazoOpen(true)}
            className="min-h-12 bg-danger text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Rechazar
          </Button>

          <Button
            type="button"
            disabled={!disponible}
            onClick={() => setConfirmarOpen(true)}
            className="min-h-12 bg-success text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Confirmar
          </Button>
        </div>
      </footer>

      {/* Dialog · Rechazar borrador (§7.4) */}
      <Dialog open={rechazoOpen} onOpenChange={setRechazoOpen}>
        <DialogContent>
          <DialogTitle>Rechazar borrador</DialogTitle>
          <DialogDescription>
            Este informe quedará como borrador hasta que resuelvas con el visador.
            Tu observación queda registrada.
          </DialogDescription>
          <div className="mt-4">
            <label
              htmlFor="obs-rechazo"
              className="text-sm font-semibold text-foreground"
            >
              ¿Qué necesitas resolver?
            </label>
            <Textarea
              id="obs-rechazo"
              rows={4}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Describe qué debes resolver con el visador (mínimo 20 caracteres)…"
              className="mt-2 text-base"
            />
            <p
              className={cn(
                "mt-1 text-xs",
                obsValida ? "text-success" : "text-muted-foreground",
              )}
            >
              {obs.trim().length}/{MIN_OBS} caracteres mínimos
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRechazoOpen(false)}
              className="min-h-11 border-border bg-transparent font-semibold text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!obsValida}
              onClick={handleGuardarObservacion}
              className="min-h-11 bg-danger font-semibold text-white hover:brightness-95 disabled:opacity-50"
            >
              Guardar observación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog · Confirmación neutra tras guardar observación (§7.4) */}
      <Dialog open={rechazoOkOpen} onOpenChange={setRechazoOkOpen}>
        <DialogContent>
          <DialogTitle>Observación registrada</DialogTitle>
          <DialogDescription>
            Tu observación quedó registrada. Para resolver este informe,
            comunícate con el visador por los canales habituales.
          </DialogDescription>
          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              onClick={() => setRechazoOkOpen(false)}
              className="min-h-11 bg-brand font-semibold text-white hover:brightness-95"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog · Confirmar envío (§7.5) */}
      <Dialog open={confirmarOpen} onOpenChange={setConfirmarOpen}>
        <DialogContent>
          <DialogTitle>¿Enviar este informe al visador?</DialogTitle>
          <DialogDescription>
            Una vez enviado, el informe pasará a revisión del visador y ya no
            aparecerá en tu lista de tasaciones.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmarOpen(false)}
              className="min-h-11 border-border bg-transparent font-semibold text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleEnviar}
              className="min-h-11 bg-success font-semibold text-white hover:brightness-95"
            >
              Enviar informe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
