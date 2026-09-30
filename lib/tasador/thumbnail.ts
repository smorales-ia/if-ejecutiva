/**
 * Generación del thumbnail de una foto de la visita — T-VP0067-IMAGENES-UI.
 *
 * ## Por qué un data-URI y no una URL de Dropbox
 *
 * `TX_Adjuntos.thumbnail_url` es la **única fuente renderizable** de la foto
 * para las pantallas y para el informe PDF: el server no puede leer Dropbox
 * (credencial rota, ver memoria `dropbox-cred-env-local-invalida`) y la
 * `url_dropbox` que guarda el pipeline es un path, no algo que un `<img>`
 * pueda pintar. El thumbnail se genera **al subir**, en el navegador del
 * tasador, que es el único lugar de la cadena que tiene el binario decodificable
 * a mano.
 *
 * ## El contrato de tamaño
 *
 * - Lado mayor ~1000 px, calidad JPEG inicial 0.72 — suficiente para el
 *   informe, no un icono.
 * - El string final debe caber en {@link MAX_CHARS_THUMBNAIL} caracteres
 *   (≤ 95.000): margen bajo el límite de 100k del tipo `url` de Airtable. Si
 *   excede, se reintenta con más compresión y, si aún no alcanza, con menos
 *   resolución.
 *
 * ## La subida NUNCA falla por el thumbnail
 *
 * Todo camino de error devuelve `null`: SSR sin `document`, navegador sin
 * canvas, imagen indecodificable, canvas tainted, o un JPEG que ni con la
 * escala mínima cabe en el techo. El caller trata `null` como «sin thumbnail»
 * y sigue — la foto queda a salvo en Dropbox igual, que es lo caro de
 * recuperar en terreno.
 */

/** Techo duro del data-URI: margen bajo el límite de 100k del campo `url`. */
export const MAX_CHARS_THUMBNAIL = 95_000

/**
 * Escalera de reintento: primero se baja la calidad, después la resolución.
 *
 * 1000 px / 0.72 es el objetivo del contrato; el resto son degradaciones que
 * sólo se tocan si el resultado no cabe en {@link MAX_CHARS_THUMBNAIL}. Una
 * foto de terreno típica (interior, 12 MP) cae holgada en el primer escalón:
 * a 1000 px y 0.72 un JPEG ronda los 100–200 KB binarios sólo en escenas muy
 * ruidosas, y base64 multiplica por 4/3.
 */
const LADOS_PX = [1000, 720, 480] as const
const CALIDADES = [0.72, 0.6, 0.5, 0.4] as const

/** Fuente dibujable + dimensiones reales, ya normalizadas entre las dos vías. */
interface ImagenDecodificada {
  fuente: CanvasImageSource
  ancho: number
  alto: number
  liberar: () => void
}

/**
 * Decodifica el `File` a algo dibujable en canvas.
 *
 * `createImageBitmap` es la vía principal (decodifica off-main-thread y
 * respeta EXIF en los navegadores actuales). El fallback por
 * `HTMLImageElement` + object URL cubre navegadores donde no existe o donde
 * falla con el formato concreto.
 */
async function decodificarImagen(file: File): Promise<ImagenDecodificada | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        fuente: bitmap,
        ancho: bitmap.width,
        alto: bitmap.height,
        liberar: () => bitmap.close(),
      }
    } catch {
      // Sigue al fallback: hay formatos que createImageBitmap rechaza y
      // el decodificador de <img> acepta.
    }
  }

  if (
    typeof Image !== "function" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return null
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        fuente: img,
        ancho: img.naturalWidth,
        alto: img.naturalHeight,
        liberar: () => undefined,
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }
    img.src = objectUrl
  })
}

/**
 * Genera el data-URI JPEG del thumbnail de una foto, o `null` si no se puede.
 *
 * - Redimensiona a lado mayor ~1000 px (nunca agranda una foto más chica).
 * - Comprime en JPEG empezando en calidad 0.72 y bajando —y, si hace falta,
 *   reduciendo también la resolución— hasta que el string quepa en
 *   {@link MAX_CHARS_THUMBNAIL}.
 * - Devuelve `null` ante cualquier imposibilidad (SSR, sin canvas, imagen
 *   corrupta, ni el último escalón cabe). **Nunca lanza**: el thumbnail es
 *   best-effort y la subida no puede fallar por él.
 */
export async function generarThumbnailDataUri(file: File): Promise<string | null> {
  // Guarda de entorno: en SSR / workers sin DOM no hay document ni canvas 2D.
  if (typeof document === "undefined" || typeof document.createElement !== "function") {
    return null
  }

  let imagen: ImagenDecodificada | null = null
  try {
    imagen = await decodificarImagen(file)
    if (!imagen || imagen.ancho <= 0 || imagen.alto <= 0) return null

    for (const lado of LADOS_PX) {
      const escala = Math.min(1, lado / Math.max(imagen.ancho, imagen.alto))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(imagen.ancho * escala))
      canvas.height = Math.max(1, Math.round(imagen.alto * escala))

      const ctx = canvas.getContext("2d")
      if (!ctx) return null
      ctx.drawImage(imagen.fuente, 0, 0, canvas.width, canvas.height)

      for (const calidad of CALIDADES) {
        const dataUri = canvas.toDataURL("image/jpeg", calidad)
        // "data:," es la respuesta de un canvas vacío/tainted; un prefijo que
        // no sea imagen tampoco sirve para <img> ni para el PDF.
        if (!dataUri.startsWith("data:image/")) return null
        if (dataUri.length <= MAX_CHARS_THUMBNAIL) return dataUri
      }
    }

    // Ni 480 px a calidad 0.4 cupo: imposible en la práctica para un JPEG
    // fotográfico, pero el contrato manda null antes que un PATCH rechazado.
    return null
  } catch {
    return null
  } finally {
    imagen?.liberar()
  }
}
