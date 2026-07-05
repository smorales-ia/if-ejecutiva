"use client"

import { useState } from "react"
import { SolicitudList } from "@/components/console/solicitud-list"
import { SolicitudDetail } from "@/components/console/solicitud-detail"
import type { Solicitud } from "@/lib/console-data"

export function ConsoleShell({ solicitudes }: { solicitudes: Solicitud[] }) {
  const [selectedId, setSelectedId] = useState(solicitudes[0]?.id ?? "")
  const selected = solicitudes.find((s) => s.id === selectedId) ?? solicitudes[0]

  if (!solicitudes.length || !selected) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">No hay solicitudes activas.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-0 flex-1">
      <div className="w-2/5 max-w-[480px] min-w-[380px]">
        <SolicitudList
          solicitudes={solicitudes}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <div className="min-w-0 flex-1">
        <SolicitudDetail solicitud={selected} />
      </div>
    </main>
  )
}
