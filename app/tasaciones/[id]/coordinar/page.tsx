import { Suspense } from "react"
import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { CoordinarVisita } from "@/components/tasador/coordinar-visita"

/**
 * Pantalla 2 · Coordinar visita (§2.3 · RF-TAS-03).
 *
 * Server Component, igual que el resto de las rutas de IF-03: la lectura corre
 * en el servidor con `AIRTABLE_TOKEN` y llega al navegador ya resuelta.
 *
 * ⚠ El v0 llamaba `getTasacion(id)`, **síncrona**, contra un array en memoria.
 * Esa función no existe desde P2-TAS.B; la lectura real es `leerTasacion(id)`,
 * asíncrona y con el guard de RF-09 aplicado. Devuelve `null` tanto si la
 * solicitud no existe como si no es del tasador, y las dos se traducen al mismo
 * `notFound()`: la pantalla no distingue una de otra, igual que las rutas HTTP.
 */
export default async function CoordinarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = await leerTasacion(id)
  if (!tasacion) notFound()

  return (
    <Suspense fallback={null}>
      <CoordinarVisita tasacion={tasacion} />
    </Suspense>
  )
}
