import { notFound } from "next/navigation"
import { getTasacion } from "@/lib/tasaciones"
import { InformePreview } from "@/components/informe-preview"

export default async function InformePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = getTasacion(id)
  if (!tasacion) notFound()

  return <InformePreview tasacion={tasacion} />
}
