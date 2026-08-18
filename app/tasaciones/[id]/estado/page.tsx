import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { EstadoProcesando } from "@/components/tasador/estado-procesando"

export default async function EstadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = await leerTasacion(id)
  if (!tasacion) notFound()

  return <EstadoProcesando id={tasacion.id} variante="calculo" />
}
