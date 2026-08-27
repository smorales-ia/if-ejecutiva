import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { leerDatosCaptura } from "@/lib/tasador/lectura-datos"
import { leerFotosCaptura, repartoDeCaptura } from "@/lib/tasador/lectura-fotos"
import { resolverInforme } from "@/lib/tasador/tasaciones"
import { InformePreview } from "@/components/tasador/informe-preview"

export default async function InformePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  /**
   * Las tres lecturas van en paralelo y **cada una revalida la autorización por
   * su cuenta**: las tres llaman `autorizarSolicitud` internamente, de modo que
   * la página paga dos `getRecord` de más. Es el mismo trato que ya aceptan
   * `app/tasaciones/[id]/page.tsx` y `.../fotos/page.tsx` desde .A.4 —compartir
   * el guard exigiría cambiar tres firmas y queda fuera del alcance de .A.5— y el
   * paralelo es más rápido en tiempo de pared que encadenarlas.
   */
  const [tasacion, guardados, fotos] = await Promise.all([
    leerTasacion(id),
    leerDatosCaptura(id),
    leerFotosCaptura(id),
  ])
  if (!tasacion) notFound()

  /**
   * Hidratación server-side del preview (decisión **D-1 · opción A**, P7-TAS.A.5).
   * Espejo exacto de `app/tasaciones/[id]/page.tsx`: `resolverInforme` da los
   * defaults, la captura de `leerDatosCaptura` los pisa, y las fotos entran al
   * final porque son la fuente autoritativa de `fotosPredefinidas` /
   * `categoriasCustom` y ninguna de las otras dos las proyecta.
   *
   * Hasta .A.5 este preview era `"use client"` puro: leía `readPayload(id) ??
   * resolverInforme(tasacion)`, así que sólo veía datos si había un borrador
   * local. Ahora arranca de Airtable como el resto del flujo del tasador.
   *
   * ## ⚠ El cap rate queda en «—» a propósito
   *
   * El bloque 2 del preview calcula el cap rate como
   * `(arriendo·12 − gasto) / valorReferenciaClp`. Numerador y override **sí** se
   * hidratan (`arriendo_mensual`, `gasto_anual`, `valor_final_override`), pero
   * **`valorReferenciaClp` NO viaja**: no tiene columna destino en ninguna tabla
   * de `TX_DatosTasacion` —está en `CAMPOS_SIN_DESTINO`, **CI-023 §1**—, así que
   * `leerDatosCaptura` no puede proyectarlo y queda `''` → denominador 0 → cap
   * rate `null` → render «—». No se le pone un fallback (`valorEstimadoUf` es UF,
   * es el *valor de tasación* y no el *de referencia*, y mentiría la cifra).
   *
   * La fuente honesta del denominador es el modelo canónico de
   * `GET /api/tasaciones/[id]/informe`, que **no se cablea en esta tanda**
   * (D-1) y queda registrado en **CI-063**. El cap rate se enciende cuando se
   * resuelva CI-023 o se conecte ese route en la construcción P9-TAS.
   */
  const informeInicial = {
    ...resolverInforme(tasacion),
    ...(guardados?.datos ?? {}),
    ...repartoDeCaptura(fotos),
  }

  return <InformePreview tasacion={tasacion} informeInicial={informeInicial} />
}
