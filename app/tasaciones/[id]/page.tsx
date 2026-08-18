import { Suspense } from "react"
import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { TasacionForm } from "@/components/tasador/tasacion-form"

export default async function TasacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = await leerTasacion(id)
  if (!tasacion) notFound()

  return (
    <Suspense fallback={null}>
      <TasacionForm tasacion={tasacion} />
    </Suspense>
  )
}
