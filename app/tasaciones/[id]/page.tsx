import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTasacion } from "@/lib/tasaciones"
import { TasacionForm } from "@/components/tasacion-form"

export default async function TasacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasacion = getTasacion(id)
  if (!tasacion) notFound()

  return (
    <Suspense fallback={null}>
      <TasacionForm tasacion={tasacion} />
    </Suspense>
  )
}
