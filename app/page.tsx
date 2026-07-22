"use client"

import { useState } from "react"
import { AppHeader } from "@/components/console/app-header"
import { SolicitudList } from "@/components/console/solicitud-list"
import { SolicitudDetail } from "@/components/console/solicitud-detail"
import { SOLICITUDES } from "@/lib/console-data"

export default function Page() {
  const [selectedId, setSelectedId] = useState(SOLICITUDES[0].id)
  const selected =
    SOLICITUDES.find((s) => s.id === selectedId) ?? SOLICITUDES[0]

  return (
    <div className="flex h-screen min-w-[1280px] flex-col overflow-hidden">
      <AppHeader />
      <main className="flex min-h-0 flex-1">
        <div className="w-2/5 max-w-[480px] min-w-[380px]">
          <SolicitudList
            solicitudes={SOLICITUDES}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <div className="min-w-0 flex-1">
          <SolicitudDetail solicitud={selected} />
        </div>
      </main>
    </div>
  )
}
