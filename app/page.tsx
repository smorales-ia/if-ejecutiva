import { AppHeader } from "@/components/console/app-header"
import { ConsoleShell } from "@/components/console/console-shell"
import { fetchSolicitudes } from "@/lib/solicitudes"
import type { Solicitud } from "@/lib/console-data"

export default async function Page() {
  let solicitudes: Solicitud[] = []
  try {
    solicitudes = await fetchSolicitudes()
  } catch (err) {
    console.error("[Page] fetchSolicitudes failed:", err)
  }

  return (
    <div className="flex h-screen min-w-[1280px] flex-col overflow-hidden">
      <AppHeader />
      <ConsoleShell solicitudes={solicitudes} />
    </div>
  )
}
