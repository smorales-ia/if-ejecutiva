import { auth } from '@clerk/nextjs/server'
import { ConsoleShell } from '@/components/console/console-shell'
import { hydrateContactos } from '@/lib/contactos-visita'
import {
  fetchSolicitudes,
  ORDENES_VALIDOS,
  VISTA_DEFAULT,
  VISTAS_VALIDAS,
  type OrdenParam,
  type SolicitudesFiltros,
  type Vista,
} from '@/lib/solicitudes'

const PAGE_SIZE = 20

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
    tasador?: string
    prioridad?: string
    q?: string
    orden?: string
    page?: string
  }>
}) {
  const sp = await searchParams
  const vista: Vista = VISTAS_VALIDAS.includes(sp.vista as Vista)
    ? (sp.vista as Vista)
    : VISTA_DEFAULT

  // D-07: filtros de FiltrosBar persistidos como URL params (P5).
  const filtros: SolicitudesFiltros = {
    cliente: sp.cliente,
    estado: sp.estado,
    sla: sp.sla,
    desde: sp.desde,
    hasta: sp.hasta,
    tasador: sp.tasador,
    prioridad: sp.prioridad,
    q: sp.q,
  }

  const orden: OrdenParam | undefined = ORDENES_VALIDOS.includes(sp.orden as OrdenParam)
    ? (sp.orden as OrdenParam)
    : undefined

  const page = Math.max(1, Number(sp.page ?? 1) || 1)

  // "Mi cartera" es la única vista que necesita el userId de Clerk (D-02).
  let userId: string | undefined
  if (vista === 'mi_cartera') {
    const { userId: clerkUserId } = await auth()
    userId = clerkUserId ?? undefined
  }

  const { data, degraded, motivo } = await fetchSolicitudes(vista, userId, filtros, orden)
  const total = data.length
  const pagina = data.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE)

  // Contactos de visita hidratados server-side sobre la página ya recortada:
  // el detalle recibe `contactosVisita` por prop, sin fetch propio. Necesario
  // porque RN-44 (solicitud-detail.tsx) evalúa los contactos de forma síncrona
  // para habilitar "Asignar tasador"; resolverlos en cliente haría parpadear
  // el botón. Degrada silenciosamente a `[]` si Airtable falla.
  const solicitudes = await hydrateContactos(pagina)

  return (
    <ConsoleShell
      solicitudes={solicitudes}
      vistaActiva={vista}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      degraded={degraded}
      motivo={motivo}
    />
  )
}
