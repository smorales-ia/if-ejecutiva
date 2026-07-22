import { auth } from '@clerk/nextjs/server'
import { ConsoleShell } from '@/components/console/console-shell'
import { fetchSolicitudes, type SolicitudesFiltros, type Vista } from '@/lib/solicitudes'

export default async function ConsolaPage({
  searchParams,
}: {
  searchParams: Promise<{
    vista?: string
    cliente?: string
    estado?: string
    sla?: string
    desde?: string
    hasta?: string
  }>
}) {
  const sp = await searchParams
  const vista = (sp.vista ?? 'activas') as Vista
  // D-07: filtros de FiltrosBar persistidos como URL params.
  const filtros: SolicitudesFiltros = {
    cliente: sp.cliente,
    estado: sp.estado,
    sla: sp.sla,
    desde: sp.desde,
    hasta: sp.hasta,
  }

  // Fix "Mi cartera": sólo se necesita el userId de Clerk para esa vista (D-02).
  let userId: string | undefined
  if (vista === 'cartera') {
    const { userId: clerkUserId } = await auth()
    userId = clerkUserId ?? undefined
  }

  const { data: solicitudes, degraded, motivo } = await fetchSolicitudes(vista, userId, filtros)
  return (
    <ConsoleShell
      solicitudes={solicitudes}
      vistaActiva={vista}
      degraded={degraded}
      motivo={motivo}
    />
  )
}
