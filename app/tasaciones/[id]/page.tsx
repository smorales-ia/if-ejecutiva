import { Suspense } from "react"
import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { leerDatosCaptura } from "@/lib/tasador/lectura-datos"
import { leerFotosCaptura, repartoDeCaptura } from "@/lib/tasador/lectura-fotos"
import { resolverInforme } from "@/lib/tasador/tasaciones"
import { codigoDeZona } from "@/lib/tasador/zona"
import { hidratarAntecedentes } from "@/lib/tasador/defaults-antecedentes"
import { zonasDeComunaSinFallar } from "@/lib/tasador/zonificacion"
import { TasacionForm } from "@/components/tasador/tasacion-form"

export default async function TasacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  /**
   * Las tres lecturas van en paralelo y **cada una revalida la autorización por
   * su cuenta**: `leerTasacion` ya llama `autorizarSolicitud` internamente y
   * `leerDatosCaptura` y `leerFotosCaptura` vuelven a llamarlo, de modo que la
   * página paga dos `getRecord` de más. Cambiar la firma de `leerTasacion` para
   * compartir el guard quedó fuera del alcance de P7-TAS.A.1 y sigue fuera del
   * de .A.4; el paralelo es además más rápido en tiempo de pared que
   * encadenarlas.
   */
  const [tasacion, guardados, fotos] = await Promise.all([
    leerTasacion(id),
    leerDatosCaptura(id),
    leerFotosCaptura(id),
  ])
  if (!tasacion) notFound()

  /**
   * Hidratación server-side: lo que el tasador guardó pisa a los defaults de
   * `resolverInforme`. Sin captura previa —primera apertura, o guard en rojo—
   * `guardados` es `null` y el formulario abre con los defaults, que es el
   * comportamiento que ya tenía.
   *
   * **Las fotos entran acá desde .A.4** (decisión D-1) y son la razón por la que
   * `CLAVES_SOLO_BORRADOR` se pudo vaciar: hasta entonces `fotosPredefinidas` y
   * `categoriasCustom` **no tenían otra fuente que el borrador local**, así que
   * `combinarConBorrador` tenía que dejárselas ganar para que el chip no dijera
   * «0 fotos ingresadas» justo después de que el tasador subió doce. Ahora las
   * manda Airtable, igual que el resto del formulario.
   */
  const informeInicial = {
    ...resolverInforme(tasacion),
    ...(guardados?.datos ?? {}),
    ...repartoDeCaptura(fotos),
  }

  /**
   * Zonas del plan regulador de la comuna para «Tipo de zona» (spec §2.8.1).
   * Va después del `Promise.all` porque necesita la comuna; tiene caché de
   * 5 min y no lanza: sin catálogo el tasador igual escribe la zona a mano.
   * El código guardado se normaliza contra el catálogo y pierde el
   * «(Comuna)» que traían las filas tecleadas antes de esta tanda.
   */
  const zonas = await zonasDeComunaSinFallar(tasacion.comuna)
  informeInicial.tipoZona = codigoDeZona(informeInicial.tipoZona, tasacion.comuna, zonas)

  /**
   * Secciones E e I y síntesis (19 y 23-oct-2026): lo guardado gana; si no hay,
   * los valores fijos de `C_DefaultsAntecedentes` para este tipo × estado de uso
   * (RF-TAS-23) y las fórmulas de la planilla evaluadas sobre la sección B ya
   * hidratada y el SII. Las síntesis vacías parten de un borrador con los datos.
   */
  const a = await hidratarAntecedentes(tasacion, informeInicial, guardados)
  informeInicial.seccionE = a.seccionE
  informeInicial.seccionI = a.seccionI
  informeInicial.sintesisPropiedad = a.sintesisPropiedad
  informeInicial.descripcionSector = a.descripcionSector
  const prellenados = [...(guardados?.prellenados ?? []), ...a.prellenados]

  return (
    <Suspense fallback={null}>
      <TasacionForm
        tasacion={tasacion}
        informeInicial={informeInicial}
        prellenados={prellenados}
        zonas={zonas}
        siiI={guardados?.contextoI}
      />
    </Suspense>
  )
}
