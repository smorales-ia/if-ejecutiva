"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useEstadoTasador } from "@/lib/tasador/use-estado-tasador"
import {
  MSG_LECTURA_FALLIDA,
  useAvanceLectura,
} from "@/lib/tasador/use-avance-lectura"

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

  /**
   * Avance real de la extracción documental (P6-TAS · RF-TAS-15).
   *
   * Sólo lo usa la variante `lectura`. El hook sondea igual en las dos —montar
   * un hook condicionalmente rompe las reglas de React—, pero en `calculo` su
   * resultado se ignora por completo y manda `useEstadoTasador`, que es lo que
   * esa pantalla siempre usó. **Parametrizar, no bifurcar**: el inventario
   * marca este componente como compartido con P8-TAS y cualquier cambio en una
   * rama no debe alcanzar a la otra.
   */
  const { avance, error: errorLectura, agotado } = useAvanceLectura(id)

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

  /*
   * ⚠ **Acá vivía la simulación, y era el defecto central de esta pantalla.**
   * Hasta P6-TAS la fase de la variante `lectura` la movían dos `setTimeout` de
   * 4 y 8 segundos: el stepper llegaba a «Datos listos» y habilitaba
   * «Continuar» pasaran ocho segundos y nada más, con la extracción todavía
   * corriendo —o fallada—. §7.3 lo pide al revés: el stepper avanza *según el
   * estado backend*, nunca según un temporizador local.
   *
   * El progreso ya no se guarda en estado local, y por eso volver a Fotos y
   * regresar lo encuentra donde estaba: vive en Airtable, no en este componente
   * (§7.2 paso 6). No hay nada que persistir del lado del cliente.
   */

  /*
   * Los literales del v0 (`INFORME_DISPONIBLE`, `APROBADO`, `EN_CALCULO`) eran
   * de su store en memoria y no existen en la máquina de estados real. El
   * backend responde con los derivados que la ruta `/estado` calcula sobre
   * `visitada · calculada · pdf_listo`.
   */
  const calculoListo = estado?.informeDisponible ?? false
  const enCalculo = (estado?.bloqueadoParaEdicion ?? false) && !calculoListo

  /**
   * `completado` mueve el aspecto de la pantalla; `puedeContinuar` habilita el
   * botón. En la variante `lectura` ahora **coinciden** (D-2026-09-04): en
   * cuanto todo llegó a un estado terminal el tasador puede seguir, aun con
   * `error`/`delegado_visador` —esos ya no bloquean, sólo pintan el aviso ámbar
   * de abajo—. Antes bloqueaban (§7.3) y la pantalla se contradecía: «Datos
   * listos» + «completa a mano» + botón gris. En `calculo` coinciden desde
   * siempre.
   */
  const completado = esCalculo ? calculoListo : (avance?.completo ?? false)
  const puedeContinuar = esCalculo ? calculoListo : (avance?.puedeContinuar ?? false)

  // Fase efectiva mostrada en el stepper/subtítulo.
  const faseEfectiva: Fase = esCalculo
    ? calculoListo
      ? 2
      : enCalculo
        ? 1
        : 0
    : (avance?.fase ?? 0)

  /** Aviso humano de la variante `lectura`. Regla T-C: nunca el error técnico. */
  const avisoLectura = !esCalculo
    ? errorLectura || agotado
      ? MSG_LECTURA_FALLIDA
      : avance?.hayError
        ? "No pudimos leer algunos documentos. Puedes completar esos datos a mano."
        : avance?.hayDelegado
          ? "Algunos datos quedaron para que los complete el visador."
          : null
    : null

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

      {/*
        Card de avance.

        ⚠ **El «Tiempo estimado: 15 segundos» se retiró en P6-TAS.** §7.1 lo
        marca como valor del prototipo v4 y **no** un compromiso normativo: *«el
        tiempo estimado se calcula o se omite, no se hardcodea como promesa»*.
        No hay forma de estimarlo —depende de cuántos documentos y de lo que
        tarde el pipeline—, así que se omite y en su lugar se dice cuántos van,
        que es un dato cierto.

        En la variante `calculo` no hay conteo que mostrar y la barra conserva
        su avance por fase, igual que antes de esta tanda.
      */}
      {!completado && (
        <div className="mt-8 w-full rounded-xl bg-muted p-4">
          {!esCalculo && avance && avance.total > 0 && (
            <p className="text-base text-foreground">
              {avance.terminados} de {avance.total}{" "}
              {avance.total === 1 ? "archivo procesado" : "archivos procesados"}
            </p>
          )}
          <Progress
            value={esCalculo ? (faseEfectiva === 1 ? 75 : 35) : (avance?.progreso ?? 0)}
            className="mt-3 block [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-border [&_[data-slot=progress-indicator]]:animate-pulse [&_[data-slot=progress-indicator]]:bg-brand [&_[data-slot=progress-indicator]]:transition-all"
          />
        </div>
      )}

      {/*
        Aviso de la variante `lectura`. Regla T-C: dice qué pasó y qué hacer, sin
        nombrar el medio técnico ni exponer el error del proveedor.
      */}
      {avisoLectura && (
        <p className="mt-6 w-full rounded-xl bg-amber-50 px-4 py-3 text-sm text-warning">
          {avisoLectura}
        </p>
      )}

      {/* Botones */}
      <div className="mt-8 flex w-full flex-col gap-3">
        {/*
          «Continuar» **no es accionable ni por teclado ni por doble toque**
          mientras el proceso siga corriendo. Se renderiza como `<button
          disabled>` y no como enlace: un `<a>` deshabilitado no existe —sigue
          siendo focalizable y activable con Enter—, así que la variante cerrada
          tiene que ser un botón nativo. El gate es `puedeContinuar`, que en
          `lectura` equivale a `completado` (D-2026-09-04): sólo se cierra
          mientras haya algo en `idle`/`extrayendo`. Con `error`/`delegado_visador`
          el proceso terminó y el botón se abre —el aviso ámbar informa qué
          completar—.
        */}
        {puedeContinuar ? (
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
            aria-disabled="true"
            className="min-h-12 w-full cursor-wait bg-muted-foreground text-base font-semibold text-white"
          >
            {!completado && <Loader2 className="h-4 w-4 animate-spin" />}
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
