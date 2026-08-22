/**
 * Reparto de las fotos persistidas entre las categorías del organizador.
 *
 * Plan IF-03 §6.1 · RF-TAS-14. Creado en **P5-TAS (B2)**.
 *
 * Vive en `lib/` y no dentro de `FotosScreen` por dos razones: es una
 * transformación pura sobre datos, y es **la** pieza de la hidratación que puede
 * equivocarse en silencio —una foto mal repartida no lanza, sólo aparece en la
 * categoría equivocada o en ninguna—. Acá se puede probar sin montar React.
 *
 * No importa `airtable-client` ni nada de servidor (RO-19): lo consume un
 * componente cliente.
 */

import {
  CATEGORIAS_FOTO,
  type CategoriaFotoId,
  type FotoAdjunta,
  type FotoCategoriaCustom,
} from '@/lib/tasaciones'

const FOTO_IDS = CATEGORIAS_FOTO.map((c) => c.id)
const ES_PREDEFINIDA = new Set<string>(FOTO_IDS)

export type FotosPorCategoriaId = Record<CategoriaFotoId, FotoAdjunta[]>

export interface RepartoFotos {
  fotosPredefinidas: FotosPorCategoriaId
  categoriasCustom: FotoCategoriaCustom[]
}

/** Las ocho categorías del catálogo, todas vacías. */
export function fotosPorCategoriaVacias(): FotosPorCategoriaId {
  return Object.fromEntries(
    FOTO_IDS.map((id) => [id, [] as FotoAdjunta[]]),
  ) as FotosPorCategoriaId
}

/**
 * Reparte las fotos entre las ocho categorías del catálogo y las
 * personalizadas.
 *
 * ## Qué decide a qué bucket va cada foto
 *
 * `TX_Adjuntos.descripcion` guarda el **`id`** de la categoría cuando es una de
 * las ocho (`cocina`, `banos`…) y el **nombre** cuando es personalizada. Es lo
 * que permite distinguirlas sin un campo aparte: el id es un identificador
 * estable que el tasador no puede teclear, así que una categoría creada en
 * terreno nunca puede colisionar con una del catálogo aunque se llame igual.
 *
 * ## El servidor manda, pero no borra categorías vacías
 *
 * Una categoría personalizada recién creada todavía no tiene fotos, así que no
 * aparece en `GET /fotos`. Se parte de las que ya están en el borrador y se les
 * vacía el contenido, en vez de reconstruir la lista sólo con lo que el servidor
 * conoce: de otro modo, crear una categoría y que la pantalla se refrescara la
 * haría desaparecer delante del tasador.
 *
 * Una categoría que **sí** viene del servidor y no existe localmente se crea —el
 * caso de reabrir la tasación en otro dispositivo—, con el mínimo cero que
 * RF-TAS-14 exige para las personalizadas.
 *
 * El orden de llegada se conserva dentro de cada categoría: `GET /fotos` ya
 * ordena por `orden` y este reparto no reordena nada.
 */
export function repartirFotos(
  fotos: readonly FotoAdjunta[],
  customPrevio: readonly FotoCategoriaCustom[],
): RepartoFotos {
  const fotosPredefinidas = fotosPorCategoriaVacias()
  const categoriasCustom: FotoCategoriaCustom[] = customPrevio.map((c) => ({
    ...c,
    fotos: [],
  }))

  for (const foto of fotos) {
    if (ES_PREDEFINIDA.has(foto.categoria)) {
      fotosPredefinidas[foto.categoria as CategoriaFotoId].push(foto)
      continue
    }

    const existente = categoriasCustom.find((c) => c.nombre === foto.categoria)
    if (existente) {
      existente.fotos.push(foto)
      continue
    }

    categoriasCustom.push({
      id: `cat-srv-${foto.categoria}`,
      nombre: foto.categoria,
      minimo: 0,
      fotos: [foto],
    })
  }

  return { fotosPredefinidas, categoriasCustom }
}
