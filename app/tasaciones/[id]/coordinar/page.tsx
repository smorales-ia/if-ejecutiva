import { notFound } from "next/navigation"
import { getTasacion } from "@/lib/tasaciones"
import { CoordinarVisita } from "@/components/tasador/coordinar-visita"

export default async function CoordinarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = getTasacion(id)
  if (!tasacion) notFound()

  return <CoordinarVisita tasacion={tasacion} />
}
