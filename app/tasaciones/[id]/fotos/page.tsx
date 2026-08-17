import { notFound } from "next/navigation"
import { getTasacion } from "@/lib/tasaciones"
import { FotosScreen } from "@/components/fotos-screen"

export default async function FotosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = getTasacion(id)
  if (!tasacion) notFound()

  return <FotosScreen tasacion={tasacion} />
}
