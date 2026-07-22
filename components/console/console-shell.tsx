"use client"

import { Suspense, useState } from "react"
import { SolicitudList } from "@/components/console/solicitud-list"
import { SolicitudDetail } from "@/components/console/solicitud-detail"
import type { Solicitud } from "@/lib/console-data"
import type { FetchResult, Vista } from "@/lib/solicitudes"

export function ConsoleShell({
  solicitudes,
  vistaActiva = 'activas',
  degraded,
  motivo,
}: {
  solicitudes: Solicitud[]
  vistaActiva?: Vista
  degraded?: boolean
  motivo?: FetchResult['motivo']
}) {
  const [selectedId, setSelectedId] = useState(solicitudes[0]?.id ?? "")
  const selected = solicitudes.find((s) => s.id === selectedId) ?? solicitudes[0]

  const isDegraded = degraded === true && vistaActiva === 'cartera'
  const isEjecutivaNoEncontrada = motivo === 'ejecutiva_no_encontrada' && vistaActiva === 'cartera'

  if (!isDegraded && !isEjecutivaNoEncontrada && (!solicitudes.length || !selected)) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">No hay solicitudes en esta vista.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-0 flex-1">
      <div className="w-2/5 max-w-[480px] min-w-[380px]">
        <Suspense fallback={null}>
          <SolicitudList
            solicitudes={solicitudes}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </Suspense>
      </div>
      {selected && (
        <div className="min-w-0 flex-1">
          <SolicitudDetail solicitud={selected} />
        </div>
      )}
    </main>
  )
}
