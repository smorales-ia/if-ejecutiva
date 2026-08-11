"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  solicitudSeleccionada,
}: {
  solicitudes: Solicitud[]
  vistaActiva?: Vista
  total?: number
  page?: number
  pageSize?: number
  degraded?: boolean
  motivo?: FetchResult['motivo']
  /** Record ID de `?solicitud=` — deep link al detalle (D-01). */
  solicitudSeleccionada?: string
}) {
  const router = useRouter()

  // El deep link sólo decide el estado inicial. Se valida contra la página
  // servida: un ID de otra vista, de otra página o inexistente cae al primer
  // resultado en vez de dejar el panel vacío.
  const [selectedId, setSelectedId] = useState(
    () =>
      solicitudes.find((s) => s.id === solicitudSeleccionada)?.id ??
      solicitudes[0]?.id ??
      ""
  )
  const selected = solicitudes.find((s) => s.id === selectedId) ?? solicitudes[0]

  // Refleja la selección en la URL sin navegar. `router.replace` volvería a
  // ejecutar el Server Component y con él la consulta a Airtable en cada clic
  // de la lista; `history.replaceState` sólo reescribe la barra de direcciones,
  // que es todo lo que hace falta para que el enlace sea compartible. Ningún
  // componente lee `?solicitud=` con `useSearchParams`, así que no hay desync.
  const handleSelect = (id: string) => {
    setSelectedId(id)
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.set("solicitud", id)
    window.history.replaceState(null, "", url)
  }

  /**
   * Alta confirmada: refrescar la bandeja y abrir la solicitud nueva (Tarea 1).
   *
   * ## Por qué se limpian los filtros
   *
   * La solicitud recién creada nace en `estado = creada` y sin tasador. Si la
   * bandeja estaba en `?vista=aprobadas`, o con un filtro de cliente o un rango
   * de fechas puesto, la fila nueva **no entra en el conjunto** y el panel
   * seguiría mostrando otra cosa: el usuario acaba de crear algo y la pantalla
   * le respondería que no existe. Navegar a `/consola?solicitud=<id>` sin más
   * parámetros garantiza que la fila esté en la vista por defecto.
   *
   * Perder la selección de filtros es el precio, y es el correcto: acabas de
   * crear una solicitud, verla es lo que querías.
   *
   * ## Por qué `push` y además `refresh`
   *
   * `push` cambia la URL y vuelve a ejecutar el Server Component con los
   * parámetros limpios. Pero si la bandeja ya estaba en `/consola` sin
   * parámetros, la URL destino coincide con la actual y el Router Cache podría
   * servir el árbol anterior —sin la fila nueva—. `refresh` invalida esa caché.
   * Los dos juntos cubren ambos casos sin tener que adivinar en cuál estamos.
   *
   * ## Sin `solicitudId` sólo se refresca
   *
   * SC01 puede responder sin el record ID (escenario degradado). La solicitud
   * existe igual, así que la bandeja tiene que reflejarla; lo único que no se
   * puede es seleccionarla, y se dice en vez de dejar al usuario buscándola.
   */
  const handleSolicitudCreada = (
    solicitudId: string | null,
    codigoExt: string | null
  ) => {
    if (solicitudId) {
      setSelectedId(solicitudId)
      router.push(`/consola?solicitud=${encodeURIComponent(solicitudId)}`)
    } else {
      router.push("/consola")
      toast.info(
        codigoExt
          ? `La solicitud ${codigoExt} se creó, pero no pudimos abrirla. Búscala en la bandeja.`
          : "La solicitud se creó, pero no pudimos abrirla. Búscala en la bandeja."
      )
    }
    router.refresh()
  }

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
            onSelect={handleSelect}
            onSolicitudCreada={handleSolicitudCreada}
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
