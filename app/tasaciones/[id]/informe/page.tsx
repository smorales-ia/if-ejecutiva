import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { InformePreview } from "@/components/tasador/informe-preview"

export default async function InformePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = await leerTasacion(id)
  if (!tasacion) notFound()

  return <InformePreview tasacion={tasacion} />
}
