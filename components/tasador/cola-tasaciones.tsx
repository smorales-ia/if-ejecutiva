"use client"

/**
 * Cola personal del tasador · Pantalla 1 (RF-TAS-01 · RF-TAS-02).
 *
 * Salió de `app/tasaciones/page.tsx` en P2-TAS.B por una razón mecánica: la
 * página pasó a Server Component para leer la cola desde Airtable, y los chips
 * necesitan estado y `useSearchParams`. Un archivo es cliente o servidor, no
 * los dos, así que la parte interactiva vive acá y recibe la lista ya resuelta.
 *
 * **P3-TAS.A** le sacó las decisiones: el filtrado vive en
 * `lib/tasador/cola-filtros.ts`, que es puro y testeable. Acá quedaban dos
 * ventanas de horas escritas a mano —una para "Hoy" y otra para "Por
 * coordinar"— que §4.3 prohíbe expresamente, y que además implementaban una
 * agenda del día que **A-12 declara sin definir**. El detalle de qué medía cada
 * una está en el docblock de `cola-filtros.ts`.
 *
 * **P3-TAS.B** le sacó el render de los chips (`chips-cola.tsx`) y le puso la
 * sincronía con la URL. Lo que queda acá es el armazón: cabecera, título,
 * contador y lista.
 *
 * ## Por qué el chip vive en el estado Y en la URL
 *
 * El estado local es el que manda para pintar: el filtro se aplica sobre la
 * lista que ya está en memoria, así que cambiar de chip es instantáneo y **no
 * recarga la ruta** (§4.1). La URL se escribe después, con `router.replace`
 * —no `push`: el chip no es un paso de navegación y no debería llenar el
 * historial de "atrás"—, y sirve para una sola cosa: que volver desde una
 * pantalla interior reactive el chip con el que se salió.
 *
 * Leer la URL como única fuente habría hecho que cada click esperara al
 * servidor antes de repintar, y en la pantalla que más se abre del flujo eso se
 * nota.
 */

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/tasador/app-header"
import { ChipsCola } from "@/components/tasador/chips-cola"
import { TasacionCard } from "@/components/tasador/tasacion-card"
import {
  CHIP_POR_DEFECTO,
  enColaVisible,
  esChipActivo,
  filtrarCola,
  type ChipActivo,
} from "@/lib/tasador/cola-filtros"
import type { Tasacion } from "@/lib/tasaciones"

export function ColaTasaciones({
  tasaciones: todas,
  nombreTasador,
}: {
  tasaciones: Tasacion[]
  nombreTasador: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [chip, setChip] = useState<ChipActivo>(CHIP_POR_DEFECTO)

  // Volver desde una pantalla interior reactiva el chip que traía la URL.
  useEffect(() => {
    const desdeUrl = searchParams.get("chip")
    if (esChipActivo(desdeUrl)) setChip(desdeUrl)
  }, [searchParams])

  const seleccionar = useCallback(
    (nuevo: ChipActivo) => {
      setChip(nuevo)

      // El chip por defecto no ensucia la URL: `/tasaciones` y
      // `/tasaciones?chip=todas` son la misma pantalla.
      const query = nuevo === CHIP_POR_DEFECTO ? "" : `?chip=${nuevo}`
      router.replace(`${pathname}${query}`, { scroll: false })
    },
    [pathname, router],
  )

  const tasaciones = filtrarCola(todas, chip)
  const enCurso = todas.filter(enColaVisible).length

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-background">
      <AppHeader userName={nombreTasador} />

      <main className="px-4 pb-12 pt-5">
        <h1 className="text-2xl font-bold text-foreground">Mis tasaciones</h1>
        <p className="mt-1 text-base text-muted-foreground">{enCurso} en curso</p>

        <ChipsCola activo={chip} onSeleccionar={seleccionar} />

        <div className="mt-5 flex flex-col gap-4">
          {tasaciones.map((t) => (
            <TasacionCard key={t.id} tasacion={t} />
          ))}
          {tasaciones.length === 0 && (
            <p className="py-12 text-center text-base text-muted-foreground">
              No hay tasaciones en esta categoría.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
