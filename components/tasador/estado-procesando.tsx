"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useEstadoTasador } from "@/lib/tasador/use-estado-tasador"

type Fase = 0 | 1 | 2 // 0: procesando, 1: casi listo, 2: completado
type Variante = "lectura" | "calculo"

const COPY: Record<
  Variante,
  {
    tituloProceso: string
    tituloListo: string
    subtitulo: (fase: Fase) => string
    pasos: [string, string, string]
    volverHref: (id: string) => string
    volverLabel: string
    continuarHref: (id: string) => string
    continuarLabel: string
  }
> = {
  lectura: {
    tituloProceso: "Leyendo datos de la visita",
    tituloListo: "Datos listos",
    subtitulo: (f) =>
      f === 0
        ? "Procesando archivos de la visita…"
        : f === 1
          ? "Casi listo…"
          : "Los datos están listos para completar el formulario",
    pasos: ["Archivos listos", "Procesando archivos", "Datos listos"],
    volverHref: (id) => `/tasaciones/${id}/fotos`,
    volverLabel: "Volver",
    continuarHref: (id) => `/tasaciones/${id}`,
    continuarLabel: "Continuar con datos de la visita",
  },
  calculo: {
    tituloProceso: "Datos enviados",
    tituloListo: "Informe listo",
    subtitulo: (f) =>
      f === 0
        ? "Calculando la tasación…"
        : f === 1
          ? "Casi listo…"
          : "Tu informe está listo para revisión",
    pasos: ["Datos listos", "Calculando tasación", "Informe listo"],
    // Vuelve al formulario en modo consulta (solo lectura) mientras el cálculo corre.
    volverHref: (id) => `/tasaciones/${id}?modo=consulta`,
    volverLabel: "Volver atrás",
    continuarHref: (id) => `/tasaciones/${id}/informe`,
    continuarLabel: "Continuar a vista previa",
  },
}

export function EstadoProcesando({
  id,
  variante = "calculo",
}: {
  id: string
  variante?: Variante
}) {
  const copy = COPY[variante]
  const esCalculo = variante === "calculo"

  /* Ésta es la pantalla de espera: el sondeo va encendido. */
  const { estado } = useEstadoTasador(id)

  /*
   * ⚠ **El v0 disparaba el cálculo desde acá** si llegaba en `BORRADOR`, para
   * cubrir una recarga directa de la URL. Contra el backend real eso convierte
   * un refresco de página —o un enlace compartido, o el botón atrás— en la
   * transición `asignada → visitada`, que dispara AT03 y no se deshace desde la
   * UI. Un efecto de montaje no puede ser el disparador de una escritura
   * irreversible: quien la ordena es el botón «Calcular Tasación» del
   * formulario, con la validación de las once secciones ya hecha.
   *
   * Quien caiga acá sin haber pasado por el botón ve el stepper en su fase
   * inicial y no avanza, que es la lectura correcta de la realidad: no hay
   * ningún cálculo corriendo.
   */

  // Fase local para la simulación visual (lectura) y como respaldo del stepper.
  const [fase, setFase] = useState<Fase>(0)
  useEffect(() => {
    const t1 = setTimeout(() => setFase(1), 4000)
    const t2 = setTimeout(() => setFase(2), 8000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  /*
   * Los literales del v0 (`INFORME_DISPONIBLE`, `APROBADO`, `EN_CALCULO`) eran
   * de su store en memoria y no existen en la máquina de estados real. El
   * backend responde con los derivados que la ruta `/estado` calcula sobre
   * `visitada · calculada · pdf_listo`.
   */
  const calculoListo = estado?.informeDisponible ?? false
  const enCalculo = (estado?.bloqueadoParaEdicion ?? false) && !calculoListo
  const completado = esCalculo ? calculoListo : fase === 2

  // Fase efectiva mostrada en el stepper/subtítulo.
  const faseEfectiva: Fase = esCalculo
    ? calculoListo
      ? 2
      : enCalculo
        ? 1
        : 0
    : fase

  const pasos: { label: string; estado: "done" | "active" | "pending" }[] = [
    { label: copy.pasos[0], estado: "done" },
    { label: copy.pasos[1], estado: faseEfectiva === 0 ? "active" : "done" },
    {
      label: copy.pasos[2],
      estado: faseEfectiva === 2 ? "done" : faseEfectiva === 1 ? "active" : "pending",
    },
  ]

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      {/* Círculo de estado */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full text-white transition-all duration-500",
          completado ? "h-28 w-28 bg-success" : "h-24 w-24 bg-brand",
        )}
      >
        {completado ? (
          <Check className="h-16 w-16 transition-all duration-500" strokeWidth={3} />
        ) : (
          <Loader2 className="h-12 w-12 animate-spin" />
        )}
      </div>

      <h1 className="mt-6 text-2xl font-bold text-foreground">
        {completado ? copy.tituloListo : copy.tituloProceso}
      </h1>
      <p className="mt-2 text-base text-muted-foreground">{copy.subtitulo(faseEfectiva)}</p>

      {/* Stepper horizontal */}
      <div className="mt-8 flex w-full items-start justify-between">
        {pasos.map((paso, i) => (
          <div key={paso.label} className="flex flex-1 items-start">
            <div className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                  paso.estado === "done" && "bg-success text-white",
                  paso.estado === "active" && "bg-brand text-white",
                  paso.estado === "pending" && "bg-border text-muted-foreground",
                )}
              >
                {paso.estado === "active" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
                )}
                {paso.estado === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : paso.estado === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              <span
                className={cn(
                  "px-1 text-xs font-medium leading-tight text-balance",
                  paso.estado === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {paso.label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div
                className={cn(
                  "mt-4 h-0.5 flex-1 transition-colors duration-300",
                  pasos[i].estado === "done" && pasos[i + 1].estado !== "pending"
                    ? "bg-success"
                    : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card tiempo estimado */}
      {!completado && (
        <div className="mt-8 w-full rounded-xl bg-muted p-4">
          <p className="text-base text-foreground">
            Tiempo estimado: <span className="font-semibold">15 segundos</span>
          </p>
          <Progress
            value={faseEfectiva === 1 ? 75 : 35}
            className="mt-3 block [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-border [&_[data-slot=progress-indicator]]:animate-pulse [&_[data-slot=progress-indicator]]:bg-brand [&_[data-slot=progress-indicator]]:transition-all"
          />
        </div>
      )}

      {/* Botones */}
      <div className="mt-8 flex w-full flex-col gap-3">
        {completado ? (
          <Button
            render={<Link href={copy.continuarHref(id)} />}
            nativeButton={false}
            className="min-h-12 w-full bg-brand text-base font-semibold text-white hover:bg-brand/90"
          >
            {copy.continuarLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled
            className="min-h-12 w-full cursor-wait bg-[#9CA3AF] text-base font-semibold text-white"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            {copy.continuarLabel}
          </Button>
        )}
        <Button
          render={<Link href={copy.volverHref(id)} />}
          nativeButton={false}
          variant="outline"
          className="min-h-12 w-full border-brand text-base font-semibold text-brand hover:bg-blue-50 hover:text-brand/90"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.volverLabel}
        </Button>
      </div>
    </main>
  )
}
