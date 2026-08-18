import { Suspense } from "react"
import { ColaTasaciones } from "@/components/tasador/cola-tasaciones"
import { leerCola } from "@/lib/tasador/lectura-tasacion"

/**
 * Pantalla 1 · cola personal del tasador (RF-TAS-01 · RF-TAS-02).
 *
 * Server Component: la lista se lee en el servidor con `AIRTABLE_TOKEN` y llega
 * al navegador ya resuelta. Es la convención de IF-02 —`consola/page.tsx` llama
 * `fetchSolicitudes` directo, no su propia ruta HTTP— y evita el salto de red
 * extra que supondría que el cliente llamara a `GET /api/tasaciones` para
 * pintar la primera vez.
 *
 * El `Suspense` envuelve al hijo porque usa `useSearchParams`.
 */
export default async function TasacionesPage() {
  const tasaciones = await leerCola()

  return (
    <Suspense fallback={null}>
      <ColaTasaciones tasaciones={tasaciones} />
    </Suspense>
  )
}
