/**
 * Esqueleto de la cola mientras el Server Component lee Airtable.
 *
 * Reproduce la **geometría** de la pantalla real —cabecera, título, contador,
 * fila de chips y tres cards— para que el contenido no salte al llegar. No
 * inventa datos: son bloques neutros, sin códigos ni números de muestra que
 * puedan confundirse por un instante con una cola real.
 *
 * Tres cards y no una: es el tamaño típico de la cola de un tasador, y con una
 * sola el salto al aparecer el resto sería el que este archivo existe para
 * evitar.
 *
 * `aria-hidden` con `role="status"` en el contenedor: para un lector de
 * pantalla esto es "cargando", no una lista de cinco elementos vacíos.
 */
function BloqueSkeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function LoadingCola() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-background">
      {/* Cabecera: misma altura y borde que `AppHeader` */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <BloqueSkeleton className="h-6 w-32" />
        <BloqueSkeleton className="h-10 w-10 rounded-full" />
      </header>

      <main role="status" aria-label="Cargando tus tasaciones" className="px-4 pb-12 pt-5">
        <div aria-hidden="true">
          <BloqueSkeleton className="h-8 w-52" />
          <BloqueSkeleton className="mt-2 h-5 w-24" />

          <div className="-mx-4 mt-4 flex gap-2 overflow-hidden px-4 pb-1">
            <BloqueSkeleton className="h-12 w-24 rounded-lg" />
            <BloqueSkeleton className="h-12 w-20 rounded-lg" />
            <BloqueSkeleton className="h-12 w-36 rounded-lg" />
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <BloqueSkeleton className="h-6 w-32" />
                  <BloqueSkeleton className="h-5 w-24 rounded-full" />
                </div>
                <BloqueSkeleton className="mt-3 h-5 w-44" />
                <BloqueSkeleton className="mt-2 h-5 w-56" />
                <BloqueSkeleton className="mt-2 h-4 w-40" />
                <BloqueSkeleton className="mt-4 h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
