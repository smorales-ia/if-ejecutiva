"use client"

import { useCallback, useMemo, useState } from "react"
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
import { type Tasacion, type InformeData } from "@/lib/tasador/tasaciones"
import { useEstadoTasador } from "@/lib/tasador/use-estado-tasador"
import { clearPayload, leerMeta, readPayload, writePayload } from "@/lib/tasador/tasador-store"
import { leyendaGuardado, useGuardado } from "@/lib/tasador/use-guardado"
import {
  combinarConBorrador,
  debeOfrecerRecuperacion,
  soloClavesDeBorrador,
} from "@/lib/tasador/recuperacion-borrador"
import { BannerRecuperacion } from "@/components/tasador/banner-recuperacion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
/**
 * Un dato obligatorio que falta.
 *
 * `label` es el rótulo corto que va a la lista (§8.3: los faltantes se nombran
 * por su rótulo visible). `detalle` es opcional y sólo lo llevan los faltantes
 * cuya acción correctiva no es evidente desde el rótulo — hoy el de la sección
 * D, donde el tasador **no puede** agregar el dato que falta (A-13) y hay que
 * decirle cuál es la acción que sí tiene.
 */
type Faltante = { label: string; seccion: Seccion; detalle?: string }

export function TasacionForm({
  tasacion,
  informeInicial,
}: {
  tasacion: Tasacion
  /**
   * Estado inicial del formulario, hidratado server-side por la página
   * (P7-TAS.A.1): defaults de `resolverInforme` con lo guardado en Airtable
   * encima. Llega como prop y no se resuelve acá para que el primer render ya
   * traiga los datos del tasador, sin carrera entre hidratación y tecleo.
   */
  informeInicial: InformeData
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consulta = searchParams.get("modo") === "consulta"

  /* El sondeo va apagado: esta pantalla no espera un cambio de estado, sólo
     necesita disparar la transición. La de avance (P8-TAS) sí lo enciende. */
  const { enviarParaCalculo } = useEstadoTasador(tasacion.id, false)
  const d = tasacion.datos

  /**
   * El borrador se lee **una sola vez** y alimenta tanto el estado inicial como
   * la decisión del banner: dos lecturas podrían devolver cosas distintas si
   * otra pestaña escribe en medio, y el formulario quedaría mostrando una cosa
   * y ofreciendo otra.
   *
   * ⚠ Se lee en el inicializador de `useState`, que corre también en el render
   * de servidor, donde `localStorage` no existe y `readPayload` devuelve
   * `null`. No produce desajuste de hidratación porque este componente **no se
   * renderiza en el servidor**: usa `useSearchParams()` bajo un `<Suspense>`
   * (`app/tasaciones/[id]/page.tsx`), lo que lo saca del render de servidor.
   * Es una dependencia implícita y frágil, y se prefiere igual: moverlo a un
   * efecto post-montaje reintroduce el parpadeo que P7-TAS.A.1 vino a matar.
   */
  const borradorInicial = useMemo(() => readPayload(tasacion.id), [tasacion.id])

  /**
   * Regla de arranque corregida (P7-TAS.A.3). Hasta .A.2 era
   * `readPayload(id) ?? informeInicial`, donde el borrador tapaba lo hidratado
   * siempre que existiera — y existe casi siempre, porque `fotos-screen`
   * siembra uno en blanco antes de que esta pantalla se abra. Ahora el servidor
   * manda en A–H y el borrador sólo en las fotos. Ver el docblock de
   * `lib/tasador/recuperacion-borrador.ts`.
   */
  const [form, setForm] = useState<InformeData>(
    () => combinarConBorrador(informeInicial, borradorInicial),
  )
  const [calculando, setCalculando] = useState(false)

  /** ¿Hay trabajo local sin enviar que valga la pena ofrecer? */
  const [ofrecerRecuperacion, setOfrecerRecuperacion] = useState(
    () =>
      !consulta &&
      debeOfrecerRecuperacion({
        meta: leerMeta(tasacion.id),
        informeInicial,
        borrador: borradorInicial,
      }),
  )

  /* Autoguardado local cada 30 s + envío bajo demanda. En modo consulta va
     apagado: no hay nada que guardar y escribir pisaría el borrador real. */
  const guardado = useGuardado(tasacion.id, form, { activo: !consulta })

  const recuperarBorrador = useCallback(() => {
    if (borradorInicial) setForm(borradorInicial)
    setOfrecerRecuperacion(false)
  }, [borradorInicial])

  /**
   * Descarta las secciones A–H y vuelve a lo hidratado, **resembrando lo que
   * ninguna lectura repone**.
   *
   * Hasta .A.3 eso eran las fotos, que no estaban en ninguna otra parte. Desde
   * .A.4 las fotos vienen hidratadas en `informeInicial` y `CLAVES_SOLO_BORRADOR`
   * se redujo a `documentosCargados` — la mecánica no cambia, sólo qué
   * sobrevive al descarte.
   */
  const descartarBorrador = useCallback(() => {
    const soloBorrador = borradorInicial ? soloClavesDeBorrador(borradorInicial) : {}
    const limpio = { ...informeInicial, ...soloBorrador }

    clearPayload(tasacion.id)
    writePayload(tasacion.id, limpio)
    setForm(limpio)
    setOfrecerRecuperacion(false)
  }, [borradorInicial, informeInicial, tasacion.id])

  // Estado blocked (§5.5): el workflow ya pasó a visitada/calculada.
  const bloqueadoCalculo =
    tasacion.estado === "visitada" || tasacion.estado === "calculada"

  // Secciones abiertas (controlado). En consulta abrimos todas para poder revisar.
  const [openSections, setOpenSections] = useState<Record<Seccion, boolean>>(() =>
    consulta
      ? { A: true, B: true, C: true, D: true, F: true, G: true }
      : { A: true, B: false, C: false, D: false, F: false, G: false },
  )

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
    /*
     * D. Comparables: mínimo 3 (RF-12), **con el sujeto cambiado** por A-13.
     * Se cuentan las filas que la extracción leyó del cuadro, no las que el
     * tasador completó: la sección es de sólo lectura y no hay captura que
     * validar. Filtrar por campos llenos, como se hacía cuando la grilla era
     * editable, castigaría al tasador por una columna que la foto cortó — y la
     * corrección de eso es la misma con tres campos vacíos o con uno.
     */
    const compLeidos = form.comparables.length
    if (compLeidos < 3)
      m.push({
        label: `Comparables del cuadro (${compLeidos}/3)`,
        seccion: "D",
        detalle: `Del cuadro se leyeron ${compLeidos} de 3 comparables. Vuelve a fotografiar el cuadro completo desde Editar fotos.`,
      })
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
    const first = faltantes.find((f) => f.detalle) ?? faltantes[0]
    if (!first) return
    setOpenSections((prev) => ({ ...prev, [first.seccion]: true }))
    setTimeout(() => {
      const sec = document.getElementById(`seccion-${first.seccion}`)
      const campo = sec?.querySelector<HTMLElement>('[data-faltante="true"]')
      const target = campo ?? sec
      target?.scrollIntoView({ behavior: "smooth", block: "center" })
      if (campo) {
        campo.focus({ preventScroll: true })
        campo.classList.add("ring-2", "ring-danger", "ring-offset-2")
        setTimeout(
          () => campo.classList.remove("ring-2", "ring-danger", "ring-offset-2"),
          2200,
        )
      }
    }, 140)
  }

  const handleCalcular = async () => {
    if (consulta || bloqueadoCalculo || calculando) return
    if (!puedeCalcular) {
      toast.error(`Faltan ${faltantes.length} datos para calcular`, {
        description: faltantes.map((f) => `• ${f.label}`).join("\n"),
      })
      scrollAFaltante()
      return
    }

    /*
     * El v0 llamaba `marcarVisitada()` **y** `enviarParaCalculo()`. Contra el
     * backend real las dos golpean `POST /calcular`: la primera haría la
     * transición y la segunda recibiría el 409 del guard de RF-TAS-07. Queda
     * una sola, la del hook, que además refresca el estado que sondea la
     * pantalla de avance.
     */
    setCalculando(true)
    try {
      /*
       * «Calcular Tasación» cumple la función de *guardar y calcular* (§2.8), y
       * el orden importa: si el PATCH falla, **no se calcula**. `POST /calcular`
       * hace la transición `asignada → visitada` y dispara AT03 contra lo que
       * haya en Airtable; calcular sin haber guardado produciría un informe
       * sobre datos viejos, en silencio y con el estado ya avanzado.
       * `guardarAhora()` relanza el error, así que el `catch` de abajo corta el
       * flujo antes de `enviarParaCalculo()`.
       */
      await guardado.guardarAhora()
      await enviarParaCalculo()
      router.push(`/tasaciones/${tasacion.id}/estado`)
    } catch (err) {
      // No se navega: la solicitud sigue donde estaba y el borrador está a salvo.
      toast.error(
        err instanceof Error
          ? err.message
          : "No pudimos completar la acción. Intenta nuevamente en unos segundos.",
      )
    } finally {
      // Obligatorio en `finally` (Regla D): en `catch` un fallo fuera de él
      // dejaría el botón muerto por el resto de la sesión.
      setCalculando(false)
    }
  }

  const setOpen = (s: Seccion) => (v: boolean) =>
    setOpenSections((prev) => ({ ...prev, [s]: v }))

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-muted">
      <header className="sticky top-0 z-30 bg-background">
        <div className="flex items-start justify-between gap-3 px-3 py-3">
          <div className="flex items-start gap-2">
            <Link
              href={`/tasaciones/${tasacion.id}/fotos`}
              aria-label="Volver a fotos"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-foreground">
                {tasacion.codigo}
              </span>
            </div>
          </div>
          <span className="pr-1 pt-1 text-base font-semibold text-brand">
            {progreso}%
          </span>
        </div>
        <Progress
          value={progreso}
          className="block [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:rounded-none [&_[data-slot=progress-track]]:bg-border [&_[data-slot=progress-indicator]]:bg-brand"
        />
        {/* Borrador local sin enviar (P7-TAS.A.3) */}
        {ofrecerRecuperacion && (
          <BannerRecuperacion
            onRecuperar={recuperarBorrador}
            onDescartar={descartarBorrador}
          />
        )}
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
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cliente: {d.cliente.valor}
          </p>

          {/* Chip: fotos gestionadas en la pantalla anterior (§5.6) */}
          <Link
            href={`/tasaciones/${tasacion.id}/fotos`}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-blue-50 px-3 py-1.5 text-sm font-medium text-brand hover:bg-blue-100"
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
                ? "bg-emerald-50 text-success"
                : "bg-amber-50 text-warning",
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
                /* Único default real del formulario (Regla T-B): la pone la
                   Ejecutiva en la coordinación y el tasador la ajusta. */
                prellenado
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
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
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
            <SeccionComparables form={form} />
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
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-warning">
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
            {/*
              * Mismo criterio que el tooltip: gana el faltante que sabe explicar
              * su propia corrección. Sin `detalle` en ninguno, cae al primero en
              * orden de sección, que es lo que §8.1 pide del pie.
              */}
            {faltantes.find((f) => f.detalle)?.detalle ?? faltantes[0]?.label}
            {faltantes.length > 1 ? ` · +${faltantes.length - 1} más` : ""}
          </div>
        )}
        <div className="flex items-center gap-3 px-4 pb-3 pt-3">
          <Link
            href={`/tasaciones/${tasacion.id}/fotos`}
            className="flex h-14 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-brand px-4 text-sm font-semibold text-brand hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a fotos
          </Link>
          <BotonCalcular
            /*
             * `calculando` entra por "blocked", que ya es exactamente el estado
             * que pide la Regla D: botón inerte, spinner visible y el literal
             * "Cálculo en curso". Un cuarto estado habría duplicado ese render
             * para decir lo mismo.
             */
            estado={
              consulta || bloqueadoCalculo || calculando
                ? "blocked"
                : puedeCalcular
                  ? "enabled"
                  : "disabled"
            }
            faltantes={faltantes}
            onClick={handleCalcular}
          />
        </div>
        <p className="pb-3 text-center text-xs text-muted-foreground">
          {consulta ? "Modo consulta · solo lectura" : leyendaGuardado(guardado)}
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
  faltantes: Faltante[]
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
            className={cn(base, "w-full cursor-wait bg-brand text-white opacity-60")}
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
        {/*
          * El tooltip explica cuando **algún** faltante trae `detalle` —hoy sólo
          * el de la sección D— y cuenta cuando ninguno. Un «Faltan N datos»
          * sobre el bloqueo de RF-12 le pediría implícitamente al tasador que
          * capture algo que A-13 le quitó; el detalle nombra la acción que sí
          * tiene.
          *
          * ⚠ Busca por todo el arreglo, **no mira sólo el primero**. El criterio
          * de §8.3 pide tooltip explicativo *«con menos de 3 comparables»*, sin
          * condicionarlo a que ése sea el faltante más urgente — y en la práctica
          * casi nunca lo es: la fecha real de visita y los cinco campos de la
          * sección B se resuelven antes en el orden de la lista. Con `[0]` el
          * literal no aparecía nunca.
          */}
        <TooltipContent>
          {faltantes.find((f) => f.detalle)?.detalle ?? `Faltan ${faltantes.length} datos`}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(base, "bg-brand text-white hover:bg-brand/90")}
    >
      Calcular Tasación
      <ArrowRight className="h-5 w-5" />
    </button>
  )
}
