"use client"

import { Suspense, useState } from "react"
import { SolicitudList } from "@/components/console/solicitud-list"
import { SolicitudDetail } from "@/components/console/solicitud-detail"
import type { Solicitud } from "@/lib/console-data"
import type { FetchResult, Vista } from "@/lib/solicitudes"

export function ConsoleShell({
  solicitudes,
  vistaActiva = 'todas',
  total = solicitudes.length,
  page = 1,
  pageSize = 20,
  degraded,
  motivo,
}: {
  solicitudes: Solicitud[]
  vistaActiva?: Vista
  total?: number
  page?: number
  pageSize?: number
  degraded?: boolean
  motivo?: FetchResult['motivo']
}) {
  const [selectedId, setSelectedId] = useState(solicitudes[0]?.id ?? "")
  const selected = solicitudes.find((s) => s.id === selectedId) ?? solicitudes[0]

  const isDegraded = degraded === true && vistaActiva === 'mi_cartera'
  const isEjecutivaNoEncontrada =
    motivo === 'ejecutiva_no_encontrada' && vistaActiva === 'mi_cartera'
  const sinResultados = !isDegraded && !isEjecutivaNoEncontrada && total === 0

  return (
    <main className="flex min-h-0 flex-1">
      <div className="w-2/5 max-w-[480px] min-w-[380px]">
        <Suspense fallback={null}>
          <SolicitudList
            solicitudes={solicitudes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            vistaActiva={vistaActiva}
            total={total}
            page={page}
            pageSize={pageSize}
            degraded={isDegraded}
            ejecutivaNoEncontrada={isEjecutivaNoEncontrada}
          />
        </Suspense>
      </div>
      {selected && !sinResultados ? (
        <div className="min-w-0 flex-1">
          <SolicitudDetail solicitud={selected} />
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">
            Selecciona una solicitud para ver su detalle.
          </p>
        </div>
      )}
    </main>
  )
}
