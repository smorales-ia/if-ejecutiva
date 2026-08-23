"use client"

import { TriangleAlert } from "lucide-react"

/**
 * Aviso de que hay trabajo guardado en el dispositivo que todavía no llegó a
 * Airtable, con las dos salidas posibles.
 *
 * Tanda P7-TAS.A.3. Componente **tonto**: no lee el almacén ni decide si debe
 * mostrarse. Quién lo monta es `tasacion-form.tsx`, y el predicado vive en
 * `lib/tasador/recuperacion-borrador.ts` (`debeOfrecerRecuperacion`), que es
 * donde se puede probar sin navegador.
 *
 * ## Dos acciones, no tres
 *
 * Se evaluó una tercera —«ver diferencias»— y se descartó: exige un diff de 68
 * campos en 375 px, y el tasador no tiene con qué decidir mirando nombres de
 * campo. La pregunta que sí puede responder es «¿lo que escribí en el teléfono
 * vale más que lo que hay guardado?», y para eso alcanzan dos botones.
 *
 * ## Qué hace cada una — el alcance es A–H, no el borrador entero
 *
 * - **Recuperar** aplica las secciones A–H del borrador sobre el formulario.
 * - **Descartar** las tira y deja lo hidratado desde Airtable, **conservando
 *   las fotos**: hoy viven sólo en el borrador y ninguna lectura las repone
 *   hasta P7-TAS.A.4. Ver `soloClavesDeBorrador`.
 *
 * ## Estilo
 *
 * Sigue al banner de modo consulta del mismo `<header>`: `div` inline con el
 * ámbar operacional `#FEF3C7`, no el `Alert` de `components/ui`. Los dos
 * avisos de esta cabecera tienen que leerse como el mismo objeto, y el repo
 * tiene además dos `Alert` distintos —uno de ellos sin consumidores— cuya
 * unificación no es asunto de esta tanda.
 */
export function BannerRecuperacion({
  onRecuperar,
  onDescartar,
}: {
  /** Aplica las secciones A–H del borrador al formulario. */
  onRecuperar: () => void
  /** Descarta A–H y vuelve a lo hidratado, conservando las fotos. */
  onDescartar: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[#FEF3C7] px-4 py-2.5 text-sm font-medium text-amber-800">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        Tienes cambios guardados en este dispositivo que aún no se enviaron.
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onRecuperar}
          className="rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900"
        >
          Recuperar
        </button>
        <button
          type="button"
          onClick={onDescartar}
          className="rounded-lg border border-amber-800/40 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
        >
          Descartar
        </button>
      </span>
    </div>
  )
}
