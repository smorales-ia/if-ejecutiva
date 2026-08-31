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
  type Tasacion,
  type InformeData,
} from "@/lib/tasador/tasaciones"
import { readPayload } from "@/lib/tasador/tasador-store"
import type {
  ValorDestacado,
  DatosSii,
  ObservacionesBloque,
} from "@/lib/tasador/lectura-informe"
import { combinarConBorrador } from "@/lib/tasador/recuperacion-borrador"
import { useEstadoTasador } from "@/lib/tasador/use-estado-tasador"
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
/** Número canónico (`number | null`) → texto, o «—» si es null (RO-34). */
function numN(v: number | null, dec?: number) {
  if (v == null) return "—"
  return dec != null
    ? v.toLocaleString("es-CL", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      })
    : nf.format(v)
}
/** Un override canónico con su unidad según el campo (P9-TAS.B). */
function fmtOverride(campo: string, valor: number) {
  if (campo === "Tasa cap rate") return `${valor}%`
  if (campo === "Vida útil") return `${valor} años`
  if (campo === "Valor final") return `${nfUf.format(valor)} UF`
  return String(valor)
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

export function InformePreview({
  tasacion,
  informeInicial,
  valorCanonico,
  siiCanonico,
  observacionesCanonico,
}: {
  tasacion: Tasacion
  /**
   * El informe ya hidratado desde Airtable por el Server Component: secciones
   * A–H de `leerDatosCaptura` más las fotos repartidas (P7-TAS.A.5 · D-1).
   *
   * No es opcional a propósito, mismo criterio que `FotosScreen`: un default a
   * `resolverInforme(tasacion)` dejaría vivo y silencioso el camino viejo —el
   * preview sólo con borrador local— si una página futura olvidara pasarlo.
   */
  informeInicial: InformeData
  /**
   * Bloque 2 (valor + cap rate) desde el modelo **canónico** de `lecturaInforme`
   * (P9-TAS · **CI-063**). `null` si el guard del canónico falló → estado vacío.
   *
   * ## Por qué sólo el bloque 2 y no todo el informe
   *
   * El frente CI-063 tiene alcance **mínimo**: sólo se cablea acá el valor
   * destacado y el cap rate, cuyo cómputo cliente estaba roto —el denominador
   * `valorReferenciaClp` no tiene columna (CI-023 §1) y el cap rate salía «—»—.
   * El resto del preview sigue con el modelo cliente `d`, salvo:
   *
   * - Bloques 4 (avalúo SII) y 8 (antecedentes legales), cableados al canónico
   *   en **P9-TAS.B** vía `siiCanonico` / `observacionesCanonico`.
   * - Bloque 6 (comparables): la grilla `SeccionComparables` mantiene su promedio
   *   **simple** de forma **deliberada**. No se alinea al homogeneizado del
   *   canónico porque esa divergencia es **CI-057**, abierta y condicionada a
   *   **A-44** (Héctor).
   */
  valorCanonico: ValorDestacado | null
  /**
   * Bloque 4 (SII/avalúo) desde el modelo canónico (P9-TAS.B). `null` si el
   * guard del canónico falló → estado vacío. Reemplaza el origen cliente
   * `tasacion.unidades`, que sólo traía la grilla de unidades sin el avalúo.
   */
  siiCanonico: DatosSii | null
  /**
   * Bloque 8 (observaciones + overrides + antecedentes legales) desde el modelo
   * canónico (P9-TAS.B). `null` si el guard falló. Los antecedentes legales sólo
   * existen acá: el modelo cliente nunca los proyectó.
   */
  observacionesCanonico: ObservacionesBloque | null
}) {
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
   * Estado inicial hidratado desde Airtable (P7-TAS.A.5 · D-1). Se parte de
   * `informeInicial` y el borrador local sólo aporta lo que no tiene otra
   * fuente —tras vaciar `CLAVES_SOLO_BORRADOR` en .A.4, eso es
   * `documentosCargados` y nada más—. Es el **mismo** `combinarConBorrador` que
   * usan `tasacion-form` y `fotos-screen`: tres pantallas que leen el mismo
   * almacén no pueden aplicar tres reglas de precedencia distintas.
   *
   * El preview no muta `d`, así que no necesita `useState`; `readPayload`
   * devuelve `null` en el render de servidor (no hay `localStorage`), que es
   * exactamente `informeInicial` tal cual.
   */
  const d: InformeData = combinarConBorrador(
    informeInicial,
    readPayload(tasacion.id),
  )
  const esNuevo = tasacion.tipoPropiedad === "nueva"

  /*
   * Bloque 2 · valor destacado + cap rate — desde el modelo CANÓNICO (CI-063).
   *
   * Hasta P9-TAS este bloque calculaba el cap rate en el cliente como
   * `(arriendo·12 − gasto) / valorReferenciaClp`. Ese denominador está en
   * `CAMPOS_SIN_DESTINO` (CI-023 §1): nunca se hidrataba, quedaba 0 y el cap rate
   * salía «—». Ahora llega ya resuelto desde `lecturaInforme` —cap rate
   * ALMACENADO (`tasa_cap_rate_override ?? tasa_cap_rate`)— vía `valorCanonico`.
   * El cómputo cliente (`netoAnual` / `valorReferenciaClp`) se retiró por completo.
   */
  const valorUf = valorCanonico?.valorUf ?? null
  const capRate =
    valorCanonico?.capRate != null ? valorCanonico.capRate.toFixed(2) : null
  const esOverrideValor = valorCanonico?.esOverride ?? false

  /* Bloque 4 · unidades + avalúo SII — canónico (P9-TAS.B). Reemplaza el origen
   * cliente `tasacion.unidades`, que sólo traía la grilla sin el avalúo. */
  const unidadesSii = siiCanonico?.porUnidad ?? []
  const supTotalUnidades = unidadesSii.reduce((a, u) => a + (u.supM2 ?? 0), 0)

  /* Bloque 8 · observaciones + overrides + antecedentes legales — canónico
   * (P9-TAS.B). Los overrides ya vienen filtrados a los no nulos desde el lib. */
  const overrides = observacionesCanonico?.overrides ?? []
  const obsTasador = observacionesCanonico?.observacionesTasador ?? ""
  const obsRechazo = observacionesCanonico?.observacionRechazo ?? ""
  const legales = observacionesCanonico?.antecedentesLegales ?? null

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
                  {esNuevo ? "Nueva" : "Usada"}
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
              {esOverrideValor && (
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

          {/* 4 · Datos SII / avalúo — canónico (P9-TAS.B) */}
          <ReportSection titulo="Datos SII / avalúo" numero={4} listo={listo}>
            <div className="flex flex-col gap-4">
              <DataGrid>
                {/* Rol SII ya trae el sentinel «Rol SII pendiente» del productor
                    (CI-067): no aplicar el fallback «—» de txt(). */}
                <Dato k="Rol SII" v={siiCanonico?.rolSii ?? "Rol SII pendiente"} />
                <Dato k="Avalúo total" v={numN(siiCanonico?.avaluoTotal ?? null)} />
                <Dato k="Avalúo fiscal (UF)" v={numN(siiCanonico?.avaluoFiscalUf ?? null, 2)} />
                <Dato k="Avalúo exento" v={numN(siiCanonico?.avaluoExento ?? null)} />
                <Dato k="Contribución anual" v={numN(siiCanonico?.contribucionAnual ?? null)} />
                <Dato k="Calidad SII" v={txt(siiCanonico?.calidadSii)} />
                <Dato k="Destino SII" v={txt(siiCanonico?.destinoSii)} />
              </DataGrid>

              {/* Sin unidades: no se renderiza la tabla ni el mensaje «Sin
                  unidades registradas»; sólo queda el rol de bloque (CI-067). */}
              {unidadesSii.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="py-2 pr-3 font-semibold">Unidad</th>
                        <th className="py-2 pr-3 font-semibold">Rol SII</th>
                        <th className="py-2 pr-3 font-semibold">Subtipo</th>
                        <th className="py-2 pr-3 text-right font-semibold">Sup. (m²)</th>
                        <th className="py-2 text-right font-semibold">Avalúo (UF)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unidadesSii.map((u) => (
                        <tr key={u.id} className="border-b border-border/60">
                          <td className="py-2 pr-3 font-medium text-foreground">
                            {txt(u.numeroUnidad)}
                          </td>
                          <td className="py-2 pr-3 tabular-nums text-foreground">
                            {u.rolSii}
                          </td>
                          <td className="py-2 pr-3 text-foreground">{txt(u.subtipo)}</td>
                          <td className="py-2 pr-3 text-right tabular-nums text-foreground">
                            {numN(u.supM2)}
                          </td>
                          <td className="py-2 text-right tabular-nums text-foreground">
                            {numN(u.avaluoUf, 2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold text-foreground">
                        <td className="py-2 pr-3" colSpan={3}>
                          Total
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {nf.format(supTotalUnidades)}
                        </td>
                        <td className="py-2" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
            <SeccionComparables form={d} />
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

          {/* 8 · Observaciones y overrides — canónico (P9-TAS.B) */}
          <ReportSection titulo="Observaciones y overrides" numero={8} listo={listo}>
            <div className="flex flex-col gap-4">
              {obsTasador ? (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Observaciones del tasador
                  </p>
                  <p className="whitespace-pre-line text-sm text-foreground">
                    {obsTasador}
                  </p>
                </div>
              ) : null}
              {obsRechazo ? (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Observación de rechazo
                  </p>
                  <p className="whitespace-pre-line text-sm text-foreground">
                    {obsRechazo}
                  </p>
                </div>
              ) : null}
              {overrides.length > 0 ? (
                <DataGrid>
                  {overrides.map((o) => (
                    <Dato
                      key={o.campo}
                      k={`${o.campo} (override)`}
                      v={fmtOverride(o.campo, o.valor)}
                    />
                  ))}
                  {observacionesCanonico?.motivoOverride && (
                    <Dato
                      k="Motivo del ajuste"
                      v={txt(observacionesCanonico.motivoOverride)}
                    />
                  )}
                  {observacionesCanonico?.autorOverride && (
                    <Dato k="Autor del ajuste" v={txt(observacionesCanonico.autorOverride)} />
                  )}
                </DataGrid>
              ) : null}

              {/* Antecedentes legales — siempre visible, «—» donde falte (§10.1 · RO-34). */}
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  Antecedentes legales
                </p>
                <DataGrid>
                  <Dato k="Fojas" v={txt(legales?.fojas)} />
                  <Dato k="N° inscripción" v={txt(legales?.numeroInscripcion)} />
                  <Dato
                    k="Año inscripción"
                    v={legales?.anoInscripcion != null ? String(legales.anoInscripcion) : "—"}
                  />
                  <Dato k="Permiso de edificación" v={txt(legales?.permisoEdificacion)} />
                  <Dato k="Recepción final" v={txt(legales?.recepcionFinal)} />
                </DataGrid>
              </div>
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
