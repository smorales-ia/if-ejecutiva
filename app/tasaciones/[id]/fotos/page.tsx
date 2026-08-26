import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { leerDatosCaptura } from "@/lib/tasador/lectura-datos"
import { leerFotosCaptura, repartoDeCaptura } from "@/lib/tasador/lectura-fotos"
import { resolverInforme } from "@/lib/tasador/tasaciones"
import { FotosScreen } from "@/components/tasador/fotos-screen"

export default async function FotosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  /**
   * Las tres lecturas van en paralelo y **cada una revalida la autorización por
   * su cuenta**: las tres llaman `autorizarSolicitud` internamente, de modo que
   * la página paga dos `getRecord` de más. Es el mismo trato que ya acepta
   * `app/tasaciones/[id]/page.tsx` desde .A.1 —compartir el guard exigiría
   * cambiar tres firmas y queda fuera del alcance de .A.4— y el paralelo es más
   * rápido en tiempo de pared que encadenarlas.
   */
  const [tasacion, guardados, fotos] = await Promise.all([
    leerTasacion(id),
    leerDatosCaptura(id),
    leerFotosCaptura(id),
  ])
  if (!tasacion) notFound()

  /**
   * Hidratación server-side de esta pantalla (decisión **D-1 · opción A**).
   *
   * Trae **dos cosas** y las dos importan por razones distintas:
   *
   * - Las **fotos** (`repartoDeCaptura`), que es lo que la pantalla muestra.
   *   Antes de .A.4 el organizador montaba vacío y sólo se llenaba cuando
   *   respondía el `useEffect` — un parpadeo en escritorio y una espera larga
   *   con la señal de terreno (**H-4**).
   * - La **sección B** (`guardados?.datos`), que la pantalla no pinta pero de la
   *   que dependen los **mínimos dinámicos**: `resolverMinimo('habitaciones')`
   *   se resuelve contra `dormitorios`, y sin hidratar valía `''` → **0**. Una
   *   casa de cinco dormitorios se daba por completa sin una sola foto
   *   (**H-1**), que es exactamente la evidencia de terreno que el organizador
   *   existe para asegurar.
   *
   * El orden del spread no es arbitrario: las fotos van **al final** porque son
   * la fuente autoritativa de sus dos claves y ni `resolverInforme` ni
   * `leerDatosCaptura` las proyectan.
   */
  const informeInicial = {
    ...resolverInforme(tasacion),
    ...(guardados?.datos ?? {}),
    ...repartoDeCaptura(fotos),
  }

  return <FotosScreen tasacion={tasacion} informeInicial={informeInicial} />
}
