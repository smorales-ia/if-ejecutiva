import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { FotosScreen } from "@/components/tasador/fotos-screen"

export default async function FotosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = await leerTasacion(id)
  if (!tasacion) notFound()

  return <FotosScreen tasacion={tasacion} />
}
