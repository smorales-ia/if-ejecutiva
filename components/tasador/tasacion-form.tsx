"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  TriangleAlert,
  CircleCheck,
  Loader2,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Tasacion, type InformeData, marcarVisitada } from "@/lib/tasaciones"
import { useEstadoTasador } from "@/hooks/use-estado-tasador"
import { readPayload, writePayload } from "@/lib/tasador-store"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IntentosIndicator } from "@/components/tasador/intentos-indicator"
import { Section, TextField, FormModoConsultaContext } from "@/components/tasador/form-sections/fields"
import { SeccionPropiedad, type SetForm } from "@/components/tasador/form-sections/seccion-propiedad"
import { SeccionValoracion } from "@/components/tasador/form-sections/seccion-valoracion"
import {
  SeccionComparables,
  ComparablesBadge,
} from "@/components/tasador/form-sections/seccion-comparables"
import { SeccionEdificacion } from "@/components/tasador/form-sections/seccion-edificacion"
import { SeccionDocumentos } from "@/components/tasador/form-sections/seccion-documentos"
import {
  SeccionOverrides,
  hayOverride,
  overridesValidos,
} from "@/components/tasador/form-sections/seccion-overrides"

type Seccion = "A" | "B" | "C" | "D" | "F" | "G"
type Faltante = { label: string; seccion: Seccion }

export function TasacionForm({ tasacion }: { tasacion: Tasacion }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consulta = searchParams.get("modo") === "consulta"

  const { intentosEnvio, enviarParaCalculo } = useEstadoTasador(tasacion.id)
  const d = tasacion.datos

  const [form, setForm] = useState<InformeData>(() => readPayload(tasacion.id))

  // Estado blocked (§5.5): el workflow ya pasó a visitada/calculada.
  const bloqueadoCalculo =
    tasacion.estado === "visitada" || tasacion.estado === "calculada"

  // Secciones abiertas (controlado). En consulta abrimos todas para poder revisar.
  const [openSections, setOpenSections] = useState<Record<Seccion, boolean>>(() =>
    consulta
      ? { A: true, B: true, C: true, D: true, F: true, G: true }
      : { A: true, B: false, C: false, D: false, F: false, G: false },
  )

  // Mantener el store en sync para que el informe lea los datos reales.
  useEffect(() => {
    if (!consulta) writePayload(tasacion.id, form)
  }, [tasacion.id, form, consulta])

  const set: SetForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const totalFotos = useMemo(() => {
    const pre = Object.values(form.fotosPredefinidas).reduce(
      (a, arr) => a + arr.length,
      0,
    )
    const custom = form.categoriasCustom.reduce((a, c) => a + c.fotos.length, 0)
    return pre + custom
  }, [form.fotosPredefinidas, form.categoriasCustom])

  // ---- Validación de datos mínimos obligatorios (CU calcular) ----
  const faltantes = useMemo<Faltante[]>(() => {
    const m: Faltante[] = []
    // A. Visita
    if (!form.fechaVisitaReal.trim())
      m.push({ label: "Fecha real de visita", seccion: "A" })
    // B. Datos de la propiedad
    if (!form.supConstruida.trim())
      m.push({ label: "Superficie construida", seccion: "B" })
    if (!form.anioConstruccion.trim())
      m.push({ label: "Año de construcción", seccion: "B" })
    if (!form.estadoConservacion.trim())
      m.push({ label: "Estado de conservación", seccion: "B" })
    if (!form.agrupacionPropiedad.trim())
      m.push({ label: "Agrupación de la propiedad", seccion: "B" })
    if (!form.materialPredominante.trim())
      m.push({ label: "Material predominante", seccion: "B" })
    // C. Cuadro de valoración: al menos 1 ítem completo
    const itemOk = form.items.some(
      (i) => i.descripcion.trim() && i.subtipo.trim() && i.superficieM2.trim(),
    )
    if (!itemOk)
      m.push({ label: "1 ítem de valoración completo", seccion: "C" })
    // D. Comparables: mínimo 3 válidos
    const compValidos = form.comparables.filter(
      (c) =>
        c.direccionReferencia.trim() &&
        c.anio.trim() &&
        c.totalUf.trim() &&
        c.supConstruida.trim(),
    )
    if (compValidos.length < 3)
      m.push({ label: `Comparables válidos (${compValidos.length}/3)`, seccion: "D" })
    // F. Documentos legales
    if (!form.cbrFoja.trim() || !form.cbrNumero.trim() || !form.cbrAnio.trim())
      m.push({ label: "CBR: foja, número y año", seccion: "F" })
    if (!form.coordenadasLat.trim() || !form.coordenadasLng.trim())
      m.push({ label: "Coordenadas (lat / lng)", seccion: "F" })
    // Override activo debe tener motivo válido
    if (hayOverride(form) && !overridesValidos(form))
      m.push({ label: "Motivo del override (mín. 20 caracteres)", seccion: "G" })
    return m
  }, [form])

  const puedeCalcular = faltantes.length === 0

  const progreso = useMemo(() => {
    const TOTAL = 11
    const cubiertos = Math.max(0, TOTAL - faltantes.length)
    return Math.round((cubiertos / TOTAL) * 100)
  }, [faltantes.length])

  // Scroll suave + foco en el primer campo faltante (§5.5).
  const scrollAFaltante = () => {
    const first = faltantes[0]
    if (!first) return
    setOpenSections((prev) => ({ ...prev, [first.seccion]: true }))
    setTimeout(() => {
      const sec = document.getElementById(`seccion-${first.seccion}`)
      const campo = sec?.querySelector<HTMLElement>('[data-faltante="true"]')
      const target = campo ?? sec
      target?.scrollIntoView({ behavior: "smooth", block: "center" })
      if (campo) {
        campo.focus({ preventScroll: true })
        campo.classList.add("ring-2", "ring-vp-danger", "ring-offset-2")
        setTimeout(
          () => campo.classList.remove("ring-2", "ring-vp-danger", "ring-offset-2"),
          2200,
        )
      }
    }, 140)
  }

  const handleCalcular = () => {
    if (consulta || bloqueadoCalculo) return
    if (!puedeCalcular) {
      toast.error(`Faltan ${faltantes.length} datos para calcular`, {
        description: faltantes.map((f) => `• ${f.label}`).join("\n"),
      })
      scrollAFaltante()
      return
    }
    writePayload(tasacion.id, form)
    marcarVisitada(tasacion.id) // asignada → visitada (mock SC06 → SC08)
    enviarParaCalculo()
    router.push(`/tasaciones/${tasacion.id}/estado`)
  }

  const setOpen = (s: Seccion) => (v: boolean) =>
    setOpenSections((prev) => ({ ...prev, [s]: v }))

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-vp-surface">
      <header className="sticky top-0 z-30 bg-background">
        <div className="flex items-start justify-between gap-3 px-3 py-3">
          <div className="flex items-start gap-2">
            <Link
              href={`/tasaciones/${tasacion.id}/fotos`}
              aria-label="Volver a fotos"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-vp-surface"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-foreground">
                {tasacion.codigo}
              </span>
              <IntentosIndicator intentos={intentosEnvio} />
            </div>
          </div>
          <span className="pr-1 pt-1 text-base font-semibold text-vp-primary">
            {progreso}%
          </span>
        </div>
        <Progress
          value={progreso}
          className="block [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:rounded-none [&_[data-slot=progress-track]]:bg-border [&_[data-slot=progress-indicator]]:bg-vp-primary"
        />
        {/* Banner de modo consulta (§6.1) */}
        {consulta && (
          <div className="flex items-center gap-2 bg-[#FEF3C7] px-4 py-2.5 text-sm font-medium text-amber-800">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            Cálculo en curso. No puedes editar hasta que termine.
          </div>
        )}
      </header>

      <main className="px-4 pb-44 pt-4">
        <div className="rounded-xl bg-background p-4">
          <p className="text-base font-medium text-foreground">
            {d.comuna.valor} · {d.tipo.valor}
          </p>
          <p className="mt-0.5 text-base text-foreground">{d.direccion.valor}</p>
          <p className="mt-0.5 text-sm text-vp-text-secondary">
            Cliente: {d.cliente.valor}
          </p>

          {/* Chip: fotos gestionadas en la pantalla anterior (§5.6) */}
          <Link
            href={`/tasaciones/${tasacion.id}/fotos`}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-vp-primary/30 bg-blue-50 px-3 py-1.5 text-sm font-medium text-vp-primary hover:bg-blue-100"
          >
            <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {totalFotos} fotos ingresadas
            <span className="font-semibold">· Editar fotos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Contador de datos obligatorios */}
        {!consulta && (
          <div
            className={cn(
              "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              puedeCalcular
                ? "bg-emerald-50 text-vp-success"
                : "bg-amber-50 text-vp-warning",
            )}
          >
            {puedeCalcular ? (
              <>
                <CircleCheck className="h-4 w-4 shrink-0" />
                Todos los datos listos
              </>
            ) : (
              <>
                <TriangleAlert className="h-4 w-4 shrink-0" />
                Faltan {faltantes.length}{" "}
                {faltantes.length === 1 ? "dato obligatorio" : "datos obligatorios"}
              </>
            )}
          </div>
        )}

        {/* Provider + fieldset deshabilitan todos los campos en modo consulta (§6.1) */}
        <FormModoConsultaContext.Provider value={consulta}>
          <fieldset disabled={consulta} className="mt-4 flex min-w-0 flex-col gap-3 border-0 p-0">
          {/* A. Visita */}
          <Section
            letra="A"
            titulo="Visita"
            id="seccion-A"
            open={openSections.A}
            onOpenChange={setOpen("A")}
          >
            <div className="flex flex-col gap-4">
              <TextField
                label="Fecha planificada de visita"
                type="date"
                value={form.fechaPlanificadaVisita}
                onChange={(v) => set("fechaPlanificadaVisita", v)}
                disabled={consulta}
              />
              <TextField
                label="Fecha real de visita"
                type="date"
                value={form.fechaVisitaReal}
                onChange={(v) => set("fechaVisitaReal", v)}
                requerido
                disabled={consulta}
              />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="obs-tasador" className="text-sm font-medium">
                  Observaciones del tasador
                </Label>
                <Textarea
                  id="obs-tasador"
                  rows={4}
                  value={form.observacionesTasador}
                  onChange={(e) => set("observacionesTasador", e.target.value)}
                  placeholder="Notas libres de la visita…"
                  className="text-base"
                />
              </div>
            </div>
          </Section>

          {/* B. Datos de la propiedad */}
          <Section
            letra="B"
            titulo="Datos de la propiedad"
            id="seccion-B"
            open={openSections.B}
            onOpenChange={setOpen("B")}
          >
            <SeccionPropiedad form={form} set={set} tipo={tasacion.tipo} />
          </Section>

          {/* C. Cuadro de valoración */}
          <Section
            letra="C"
            titulo="Cuadro de valoración"
            id="seccion-C"
            open={openSections.C}
            onOpenChange={setOpen("C")}
            badge={
              <span className="rounded-full bg-vp-surface px-2.5 py-1 text-xs font-semibold text-vp-text-secondary">
                {form.items.length} ítems
              </span>
            }
          >
            <SeccionValoracion form={form} set={set} />
          </Section>

          {/* D. Comparables */}
          <Section
            letra="D"
            titulo="Comparables"
            id="seccion-D"
            open={openSections.D}
            onOpenChange={setOpen("D")}
            badge={<ComparablesBadge total={form.comparables.length} />}
          >
            <SeccionComparables form={form} set={set} disabled={consulta} />
          </Section>

          {/* E. Edificación */}
          <Section letra="E" titulo="Niveles · Terminaciones · Comodidades">
            <SeccionEdificacion form={form} set={set} />
          </Section>

          {/* F. Documentos legales */}
          <Section
            letra="F"
            titulo="Documentos legales"
            id="seccion-F"
            open={openSections.F}
            onOpenChange={setOpen("F")}
          >
            <SeccionDocumentos form={form} set={set} />
          </Section>

          {/* G. Overrides */}
          <Section
            letra="G"
            titulo="Overrides (CU-007)"
            id="seccion-G"
            open={openSections.G}
            onOpenChange={setOpen("G")}
            badge={
              hayOverride(form) ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-vp-warning">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Activo
                </span>
              ) : undefined
            }
          >
            <SeccionOverrides form={form} set={set} />
          </Section>

          {/* H. Rentabilidad */}
          <Section letra="H" titulo="Rentabilidad (opcional)">
            <div className="flex flex-col gap-3">
              <TextField
                label="Arriendo bruto mensual (CLP)"
                type="number"
                value={form.arriendoBrutoClp}
                onChange={(v) => set("arriendoBrutoClp", v)}
                disabled={consulta}
              />
              <TextField
                label="Gasto anual (CLP)"
                type="number"
                value={form.gastoAnualClp}
                onChange={(v) => set("gastoAnualClp", v)}
                disabled={consulta}
              />
            </div>
          </Section>
        </fieldset>
        </FormModoConsultaContext.Provider>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl border-t border-border bg-background shadow-lg">
        {!consulta && !bloqueadoCalculo && !puedeCalcular && (
          <div className="flex items-center gap-2 bg-[#FEF3C7] px-4 py-2.5 text-sm font-medium text-amber-800">
            <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            {faltantes[0]?.label}
            {faltantes.length > 1 ? ` · +${faltantes.length - 1} más` : ""}
          </div>
        )}
        <div className="flex items-center gap-3 px-4 pb-3 pt-3">
          <Link
            href={`/tasaciones/${tasacion.id}/fotos`}
            className="flex h-14 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-vp-primary px-4 text-sm font-semibold text-vp-primary hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a fotos
          </Link>
          <BotonCalcular
            estado={
              consulta || bloqueadoCalculo
                ? "blocked"
                : puedeCalcular
                  ? "enabled"
                  : "disabled"
            }
            faltantes={faltantes.length}
            onClick={handleCalcular}
          />
        </div>
        <p className="pb-3 text-center text-xs text-vp-text-secondary">
          {consulta ? "Modo consulta · solo lectura" : "✓ Autosave hace 22 s"}
        </p>
      </footer>
    </div>
  )
}

/** Botón único "Calcular Tasación" con 3 estados (§5.5). */
function BotonCalcular({
  estado,
  faltantes,
  onClick,
}: {
  estado: "enabled" | "disabled" | "blocked"
  faltantes: number
  onClick: () => void
}) {
  const base =
    "flex h-14 flex-1 items-center justify-center gap-2 rounded-lg text-base font-bold uppercase tracking-wide transition-all duration-200"

  if (estado === "blocked") {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />} className="flex-1">
          <button
            type="button"
            aria-disabled="true"
            className={cn(base, "w-full cursor-wait bg-vp-primary text-white opacity-60")}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            Calcular Tasación
          </button>
        </TooltipTrigger>
        <TooltipContent>Cálculo en curso</TooltipContent>
      </Tooltip>
    )
  }

  if (estado === "disabled") {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />} className="flex-1">
          {/* aria-disabled (no `disabled`) para poder disparar el toast al pulsar */}
          <button
            type="button"
            aria-disabled="true"
            onClick={onClick}
            className={cn(base, "w-full cursor-not-allowed bg-[#9CA3AF] text-white")}
          >
            Calcular Tasación
          </button>
        </TooltipTrigger>
        <TooltipContent>Faltan {faltantes} datos</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(base, "bg-vp-primary text-white hover:bg-vp-primary-dark")}
    >
      Calcular Tasación
      <ArrowRight className="h-5 w-5" />
    </button>
  )
}
