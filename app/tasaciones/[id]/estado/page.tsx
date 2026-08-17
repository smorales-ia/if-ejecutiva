import { notFound } from "next/navigation"
import { getTasacion } from "@/lib/tasaciones"
import { EstadoProcesando } from "@/components/estado-procesando"

export default async function EstadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = getTasacion(id)
  if (!tasacion) notFound()

  return <EstadoProcesando id={tasacion.id} variante="calculo" />
}
