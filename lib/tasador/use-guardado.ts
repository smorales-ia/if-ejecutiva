"use client"

/**
 * Guardado del formulario de captura: borrador local cada 30 s y envío a
 * Airtable bajo demanda.
 *
 * Tanda P7-TAS.A.2. Cierra **CI-054**: `PATCH /api/tasaciones/[id]/datos`
 * existe desde P2-TAS —con Zod, guard de pertenencia, auditoría en `A_Cambios`
 * y sync de las cuatro tablas hijas— y **no tenía un solo consumidor**. Lo que
 * el tasador medía en terreno vivía sólo en `localStorage`. Este hook es el
 * consumidor; P7-TAS.A.3 lo cablea en «Calcular Tasación».
 *
 * ## Las dos velocidades, y por qué no son la misma
 *
 * | | Cada 30 s | `guardarAhora()` |
 * |---|---|---|
 * | Destino | `localStorage` | `PATCH /datos` → Airtable |
 * | Lo dispara | el temporizador | «Calcular Tasación» (A.3) |
 * | Si falla | se loguea y sigue | lanza, y el llamador lo muestra |
 *
 * El autoguardado de 30 s **no toca el servidor**, y eso es deliberado por tres
 * razones que apuntan al mismo lado:
 *
 * 1. Es lo que dice la spec §2.8 — *«autosave localStorage cada 30 s»*— y
 *    reserva el servidor para «Calcular Tasación», que *«cumple la función de
 *    guardar y calcular»*.
 * 2. El tasador está en terreno con mala señal. Un PATCH cada 30 s sería, sobre
 *    todo, un generador de errores.
 * 3. **La razón fuerte:** el PATCH ejecuta **sync destructivo (RO-31)**. Borra
 *    las filas de `TX_ItemsCuadroValoracion`, `TX_Ampliaciones`,
 *    `TX_HabitacionesPorNivel` y `TX_TerminacionesPorRecinto` cuya clave no
 *    venga en el cuerpo. Dispararlo en bucle contra un formulario a medio
 *    llenar significa borrar y recrear filas hijas cien veces por visita.
 *
 * ## Se manda el `InformeData` entero
 *
 * `datosPatchSchema` es `.partial()` y **no** `.strict()`, así que zod descarta
 * en silencio lo que no declara —`fotosPredefinidas`, `categoriasCustom`,
 * `comparables`, `documentosCargados`—. Su docblock dice explícitamente que el
 * autoguardado «manda el `InformeData` entero»: está diseñado para esto, y
 * seguir qué sección está sucia sería complejidad sin comprador.
 *
 * Consecuencia a tener presente al leer `noPersistidos`: se calcula sobre el
 * cuerpo **ya parseado**, de modo que las claves que zod descartó nunca
 * aparecen ahí. Sólo salen los 23 de `CAMPOS_SIN_DESTINO` (**CI-023**).
 *
 * ## Lo que este hook NO hace
 *
 * - **No llama `clearPayload()`.** Cuándo se descarta el borrador depende de qué
 *   se hace con los campos huérfanos de CI-023, y esa decisión es de P7-TAS.A.3.
 * - **No decide nada con `noPersistidos`.** Lo expone y punto.
 * - **No toca el formulario.** Recibe `datos` y devuelve estado.
 *
 * ## Sobre las pruebas
 *
 * El hook no tiene test unitario propio: no hay `jsdom` ni
 * `@testing-library/react` en el proyecto y no se agregan (CLAUDE.md). La
 * mitigación es de diseño — **todas las decisiones viven en las funciones puras
 * de `tasador-store.ts`**, que sí se prueban (`tasador-store.test.ts`). Acá
 * quedan el temporizador, el `fetch` y las transiciones de estado: mecánica,
 * no reglas.
 */

import * as React from "react"
import { llamarApi, type InformeData } from "@/lib/tasador/tasaciones"
import {
  leerMeta,
  marcarSincronizado,
  writePayload,
} from "@/lib/tasador/tasador-store"

/** Cuerpo de `PATCH /api/tasaciones/[id]/datos`. */
interface RespuestaGuardado {
  id: string
  codigo: string
  tablasActualizadas: string[]
  cambiosAuditados: number
  noPersistidos: string[]
}

export type EstadoGuardado = "inactivo" | "guardando" | "guardado" | "error"

export interface Guardado {
  /** Estado del último envío al servidor. El autoguardado local no lo mueve. */
  estado: EstadoGuardado
  /** ISO del último borrador escrito en `localStorage`. */
  guardadoLocalTs: string | null
  /** ISO del último `PATCH /datos` confirmado. `null` si nunca sincronizó. */
  sincronizadoTs: string | null
  /**
   * Campos que el servidor aceptó y no persistió por no tener columna destino
   * (**CI-023**). Se expone para que la pantalla no le prometa al tasador que
   * guardó algo que no guardó.
   */
  noPersistidos: string[]
  /** Escribe el borrador y lo envía a Airtable ahora. */
  guardarAhora: () => Promise<void>
}

/** La cadencia la fija la spec §2.8. No es un parámetro. */
const INTERVALO_MS = 30_000

export function useGuardado(
  id: string,
  datos: InformeData,
  opciones?: { activo?: boolean },
): Guardado {
  const activo = opciones?.activo ?? true

  const [estado, setEstado] = React.useState<EstadoGuardado>("inactivo")
  const [guardadoLocalTs, setGuardadoLocalTs] = React.useState<string | null>(null)
  const [sincronizadoTs, setSincronizadoTs] = React.useState<string | null>(null)
  const [noPersistidos, setNoPersistidos] = React.useState<string[]>([])

  /**
   * El formulario cambia en cada tecla y el temporizador no puede reiniciarse
   * con cada cambio — nunca llegaría a los 30 s. `datos` viaja por ref y el
   * efecto del temporizador sólo depende de `id` y `activo`.
   */
  const datosRef = React.useRef(datos)
  datosRef.current = datos

  /** Evita escribir estado después de desmontar (navegar a /estado, por ejemplo). */
  const montado = React.useRef(true)
  React.useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])

  /** Marcas que ya existían en disco de una sesión anterior. */
  React.useEffect(() => {
    if (!id) return
    const meta = leerMeta(id)
    setGuardadoLocalTs(meta?.guardadoTs ?? null)
    setSincronizadoTs(meta?.sincronizadoTs ?? null)
  }, [id])

  const guardarLocal = React.useCallback(() => {
    if (!id) return
    writePayload(id, datosRef.current)
    if (montado.current) setGuardadoLocalTs(leerMeta(id)?.guardadoTs ?? null)
  }, [id])

  /* Autoguardado local. `activo` lo apaga en modo consulta, donde no hay nada
     que guardar y escribir el borrador pisaría el del propio tasador. */
  React.useEffect(() => {
    if (!id || !activo) return
    const intervalo = setInterval(guardarLocal, INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [id, activo, guardarLocal])

  const guardarAhora = React.useCallback(async () => {
    if (!id) return

    // Se congela lo que se va a enviar: el tasador puede seguir tecleando
    // mientras el PATCH viaja, y `marcarSincronizado` debe referirse a esto.
    const enviado = datosRef.current

    setEstado("guardando")
    try {
      writePayload(id, enviado)
      if (montado.current) setGuardadoLocalTs(leerMeta(id)?.guardadoTs ?? null)

      const respuesta = await llamarApi<RespuestaGuardado>(
        `/api/tasaciones/${id}/datos`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enviado),
        },
      )

      const ts = new Date().toISOString()
      marcarSincronizado(id, ts)

      if (!montado.current) return
      setSincronizadoTs(ts)
      setNoPersistidos(respuesta?.noPersistidos ?? [])
      setEstado("guardado")
    } catch (err) {
      if (montado.current) setEstado("error")
      /*
       * Se relanza a propósito. Regla D: quien pintó el spinner es quien cierra
       * el ciclo mostrando el fallo, y `llamarApi` ya trae el literal humano de
       * §6.5. Tragarlo acá dejaría a «Calcular Tasación» navegando como si
       * hubiera guardado.
       */
      throw err
    }
  }, [id])

  return { estado, guardadoLocalTs, sincronizadoTs, noPersistidos, guardarAhora }
}
