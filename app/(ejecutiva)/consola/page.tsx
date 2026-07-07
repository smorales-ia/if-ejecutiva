import { ConsoleShell } from '@/components/console/console-shell'
import { fetchSolicitudes, type Vista } from '@/lib/solicitudes'

export default async function ConsolaPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>
}) {
  const sp = await searchParams
  const vista = (sp.vista ?? 'activas') as Vista
  const { data: solicitudes, degraded } = await fetchSolicitudes(vista)
  return <ConsoleShell solicitudes={solicitudes} vistaActiva={vista} degraded={degraded} />
}
