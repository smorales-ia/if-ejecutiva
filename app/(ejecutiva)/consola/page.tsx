import { ConsoleShell } from '@/components/console/console-shell'
import { fetchSolicitudes, type Vista } from '@/lib/solicitudes'
import { fetchTiposDocumento } from '@/lib/tipos-documento'

export default async function ConsolaPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>
}) {
  const sp = await searchParams
  const vista = (sp.vista ?? 'activas') as Vista
  const [{ data: solicitudes, degraded }, { data: tiposDocumento }] = await Promise.all([
    fetchSolicitudes(vista),
    fetchTiposDocumento(),
  ])
  return (
    <ConsoleShell
      solicitudes={solicitudes}
      vistaActiva={vista}
      degraded={degraded}
      tiposDocumento={tiposDocumento}
    />
  )
}
