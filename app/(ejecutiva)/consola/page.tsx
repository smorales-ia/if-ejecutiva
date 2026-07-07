import { ConsoleShell } from '@/components/console/console-shell'
import { fetchSolicitudes } from '@/lib/solicitudes'
import type { Solicitud } from '@/lib/console-data'

export default async function ConsolaPage() {
  let solicitudes: Solicitud[] = []
  try {
    solicitudes = await fetchSolicitudes()
  } catch (err) {
    console.error('[ConsolaPage] fetchSolicitudes failed:', err)
  }

  return <ConsoleShell solicitudes={solicitudes} />
}
