import { Suspense } from "react"
import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { leerDatosCaptura } from "@/lib/tasador/lectura-datos"
import { resolverInforme } from "@/lib/tasador/tasaciones"
import { TasacionForm } from "@/components/tasador/tasacion-form"

export default async function TasacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  /**
   * Las dos lecturas van en paralelo y **cada una revalida la autorización por
   * su cuenta**: `leerTasacion` ya llama `autorizarSolicitud` internamente y
   * `leerDatosCaptura` vuelve a llamarlo, de modo que la página paga un
   * `getRecord` de más. Cambiar la firma de `leerTasacion` para compartir el
   * guard queda fuera del alcance de P7-TAS.A.1; el paralelo es además más
   * rápido en tiempo de pared que encadenarlas.
   */
  const [tasacion, guardados] = await Promise.all([
    leerTasacion(id),
    leerDatosCaptura(id),
  ])
  if (!tasacion) notFound()

  /**
   * Hidratación server-side: lo que el tasador guardó pisa a los defaults de
   * `resolverInforme`. Sin captura previa —primera apertura, o guard en rojo—
   * `guardados` es `null` y el formulario abre con los defaults, que es el
   * comportamiento que ya tenía.
   */
  const informeInicial = { ...resolverInforme(tasacion), ...(guardados?.datos ?? {}) }

  return (
    <Suspense fallback={null}>
      <TasacionForm tasacion={tasacion} informeInicial={informeInicial} />
    </Suspense>
  )
}
