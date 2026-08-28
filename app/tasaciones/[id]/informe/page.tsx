import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { leerDatosCaptura } from "@/lib/tasador/lectura-datos"
import { leerFotosCaptura, repartoDeCaptura } from "@/lib/tasador/lectura-fotos"
import { lecturaInforme } from "@/lib/tasador/lectura-informe"
import { resolverInforme } from "@/lib/tasador/tasaciones"
import { InformePreview } from "@/components/tasador/informe-preview"

export default async function InformePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  /**
   * Las cuatro lecturas van en paralelo y **cada una revalida la autorización
   * por su cuenta**: todas llaman `autorizarSolicitud` internamente, de modo que
   * la página paga varios `getRecord` de más. Es el mismo trato que ya aceptan
   * `app/tasaciones/[id]/page.tsx` y `.../fotos/page.tsx` desde .A.4 —compartir
   * el guard exigiría cambiar firmas y queda fuera del alcance— y el paralelo es
   * más rápido en tiempo de pared que encadenarlas.
   *
   * La cuarta, `lecturaInforme`, es el **modelo canónico** que P9-TAS cablea
   * para cerrar CI-063 (ver abajo).
   */
  const [tasacion, guardados, fotos, resInforme] = await Promise.all([
    leerTasacion(id),
    leerDatosCaptura(id),
    leerFotosCaptura(id),
    lecturaInforme(id),
  ])
  if (!tasacion) notFound()

  /**
   * Hidratación server-side del preview (decisión **D-1 · opción A**, P7-TAS.A.5).
   * Espejo exacto de `app/tasaciones/[id]/page.tsx`: `resolverInforme` da los
   * defaults, la captura de `leerDatosCaptura` los pisa, y las fotos entran al
   * final porque son la fuente autoritativa de `fotosPredefinidas` /
   * `categoriasCustom` y ninguna de las otras dos las proyecta.
   *
   * Este modelo cliente sigue alimentando **todos los bloques del preview salvo
   * el 2**: cabecera, antecedentes, cuadro, comparables (grilla simple),
   * fotográfico y observaciones. El bloque 2 pasa al canónico — ver abajo.
   */
  const informeInicial = {
    ...resolverInforme(tasacion),
    ...(guardados?.datos ?? {}),
    ...repartoDeCaptura(fotos),
  }

  /**
   * ## Bloque 2 (valor + cap rate) desde el modelo canónico — CI-063
   *
   * Hasta P9-TAS el preview calculaba el cap rate como
   * `(arriendo·12 − gasto) / valorReferenciaClp`, cuyo denominador
   * `valorReferenciaClp` **no tiene columna destino** (`CAMPOS_SIN_DESTINO` ·
   * **CI-023 §1**): `leerDatosCaptura` no lo proyecta, el denominador quedaba 0
   * y el cap rate salía «—».
   *
   * Ahora el bloque 2 se alimenta de `lecturaInforme`, que trae el cap rate
   * **almacenado** (`tasa_cap_rate_override ?? tasa_cap_rate`) sin necesitar
   * `valorReferenciaClp`. Si el guard del canónico falla, se pasa `null` y el
   * preview cae a su estado vacío.
   *
   * ## Alcance acotado (frente CI-063 · MÍNIMO)
   *
   * Sólo el **bloque 2** se cablea al canónico en esta tanda. Los bloques 4
   * (avalúo SII) y 8 (antecedentes legales) siguen desde el modelo cliente y su
   * migración queda para **P9-TAS.B**. El bloque 6 (comparables) mantiene su
   * grilla de promedio simple de forma **deliberada**: alinearlo al homogeneizado
   * del canónico es **CI-057**, abierta y condicionada a **A-44** (Héctor).
   */
  const valorCanonico = resInforme.ok ? resInforme.informe.valorDestacado : null

  return (
    <InformePreview
      tasacion={tasacion}
      informeInicial={informeInicial}
      valorCanonico={valorCanonico}
    />
  )
}
