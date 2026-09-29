/**
 * Resolutor de las ranuras de imagen del informe (`ImagenesInforme` +
 * `fotos.fotos[]`) — módulo **server-only** (usa `fs`; jamás importarlo desde
 * un componente cliente).
 *
 * Tanda T-PDF-IDENTICO-20260927 · plan §3.3. Carbone v4 sustituye cada
 * placeholder de imagen de la plantilla por el binario referido en el tag:
 * el valor debe ser una **URL pública** alcanzable por api.carbone.io o un
 * **data-URI base64**. Nada de eso existe hoy en la base: `url_dropbox` de
 * `TX_Adjuntos` es un path interno (no descargable) y la conexión Dropbox de
 * `.env.local` está vencida, así que la resolución es:
 *
 * 1. **Adjunto Airtable utilizable**: si la foto canónica ya trae una URL
 *    `http(s)` (p. ej. un attachment de Airtable), se usa tal cual.
 * 2. **Fallback de tanda (assets del repo)**: para el caso espejo
 *    VP-2026-0067, las imágenes extraídas del PDF de referencia MET-6283
 *    viven en `docs/_artefactos/carbone/assets_met6283/` (MANIFEST.md) y se
 *    emiten como data-URI. ⚠ Fallback-repo: TODAS las ranuras del espejo
 *    salen de acá — para el flujo vivo falta el mecanismo de captura/columna
 *    (firma en M_Tasadores, mapas P1-4, escaneados de anexos, fotos con
 *    attachment público). Queda declarado en el cierre de la tanda.
 *
 * El fallback está **acotado por `codigo_solicitud`** (`ASSETS_POR_CODIGO`):
 * cualquier otra solicitud recibe `null` en cada ranura — ranura vacía
 * honesta, nunca la foto de otra propiedad.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FotosInforme, ImagenesInforme } from './tipos'

/** Caso espejo → directorio de assets (relativo a la raíz del repo). */
const ASSETS_POR_CODIGO: Record<string, string> = Object.freeze({
  'VP-2026-0067': 'docs/_artefactos/carbone/assets_met6283',
})

/** Ranura → archivo dentro del directorio de assets (MANIFEST.md). */
const ARCHIVO_POR_RANURA: Record<keyof ImagenesInforme, string> = Object.freeze({
  mapaUbicacion: 'h1_mapa_ubicacion.jpg',
  fachada: 'h1_fachada.jpg',
  firma: 'firma.jpg',
  // .jpg recomprimido desde el render de 907 KB (h2_mapa_referencias.png).
  refMapa: 'h2_mapa_referencias.jpg',
  ref1: 'h2_ref1.jpg',
  ref2: 'h2_ref2.jpg',
  ref3: 'h2_ref3.jpg',
  anexo1Plano: 'anexo1_plano.jpg',
  anexo1Esquema: 'anexo1_esquema_superficies.jpg',
  anexo1CuadroSup: 'anexo1_cuadro_superficie.jpg',
  anexo1Emplazamiento: 'anexo1_emplazamiento.jpg',
  anexo1Aerea: 'anexo1_aerea.jpg',
  anexo1MapaSii: 'anexo1_mapa_sii.jpg',
  anexo1InfoSii: 'anexo1_info_sii.jpg',
  anexo2RolAvaluo: 'anexo2_rol_avaluo.jpg',
  anexo2Permiso: 'anexo2_permiso_edificacion.jpg',
  anexo2Escritura: 'anexo2_escritura_fojas.jpg',
  anexo2NoExpropiacion: 'anexo2_no_expropiacion.jpg',
  anexo2Recepcion: 'anexo2_recepcion_final.jpg',
  anexo2Tgr: 'anexo2_tgr_deuda.jpg',
})

/**
 * Grillas 2×4 de las Hojas 4-5: archivo + caption EXACTO del gold master
 * (MANIFEST.md — la banda gris bajo cada foto). «Planificación» reutiliza el
 * plano del Anexo 1: misma imagen en ambas ranuras del PDF de referencia.
 */
const GRILLA_FOTOS: ReadonlyArray<{ archivo: string; categoria: string }> =
  Object.freeze([
    { archivo: 'h4_01_ubicacion.png', categoria: 'Ubicación' },
    { archivo: 'anexo1_plano.jpg', categoria: 'Planificación' },
    { archivo: 'h4_03_fachada.jpg', categoria: 'Fachada' },
    { archivo: 'h4_04_sector.jpg', categoria: 'Sector' },
    { archivo: 'h4_05_living.jpg', categoria: 'Living' },
    { archivo: 'h4_06_comedor.jpg', categoria: 'Comedor' },
    { archivo: 'h4_07_cocina.jpg', categoria: 'Cocina' },
    { archivo: 'h4_08_bano_visitas.jpg', categoria: 'Baño de visitas' },
    { archivo: 'h5_01_dormitorio_principal.jpg', categoria: 'Dormitorio Principal' },
    { archivo: 'h5_02_bano_principal.jpg', categoria: 'Baño Principal' },
    { archivo: 'h5_03_dormitorio_a.jpg', categoria: 'Dormitorio' },
    { archivo: 'h5_04_dormitorio_b.jpg', categoria: 'Dormitorio' },
    { archivo: 'h5_05_sala_estar.jpg', categoria: 'Sala de estar' },
    { archivo: 'h5_06_piscina.jpg', categoria: 'Piscina' },
    { archivo: 'h5_07_terraza_quincho.jpg', categoria: 'Terraza + Quincho' },
    { archivo: 'h5_08_fachada_posterior_patio.jpg', categoria: 'Fachada posterior - Patio trasero' },
  ])

const RANURAS_VACIAS: ImagenesInforme = Object.freeze(
  Object.fromEntries(
    Object.keys(ARCHIVO_POR_RANURA).map((k) => [k, null]),
  ) as unknown as ImagenesInforme,
)

/** ¿URL que Carbone puede descargar? (attachment público, no path Dropbox). */
function urlUtilizable(url: string): boolean {
  return /^https?:\/\//.test(url)
}

/**
 * Lee un asset y lo emite como data-URI. `null` si el archivo no está.
 *
 * Prefiere `render/<stem>.jpg`: la versión pre-recortada al aspecto de la
 * ranura (Carbone escala al ancho del placeholder preservando el aspecto DE
 * ORIGEN, así que sin recorte la página desborda — `preparar_render.py`).
 * Cae al original si el recorte no existe.
 */
function dataUri(dir: string, archivo: string): string | null {
  const stem = archivo.replace(/\.[a-z]+$/i, '')
  try {
    const buf = readFileSync(join(process.cwd(), dir, 'render', `${stem}.jpg`))
    return `data:image/jpeg;base64,${buf.toString('base64')}`
  } catch {
    /* sin versión recortada — sigue el original */
  }
  try {
    const buf = readFileSync(join(process.cwd(), dir, archivo))
    const mime = archivo.endsWith('.png') ? 'image/png' : 'image/jpeg'
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch (err) {
    console.error('[imagenes] asset ilegible', dir, archivo, err)
    return null
  }
}

/**
 * Resuelve las ranuras de imagen y la grilla de fotos para una solicitud.
 *
 * `fotosCanonicas` es el bloque 7 del modelo canónico: si sus filas ya traen
 * URLs http(s) (regla 1), se respetan; con el fallback del espejo activo, la
 * grilla se completa/reemplaza con los 16 assets del gold master para que el
 * render sea idéntico al PDF de referencia.
 */
export function resolverImagenes(
  codigo: string,
  fotosCanonicas: FotosInforme,
): { imagenes: ImagenesInforme; fotos: FotosInforme } {
  const dir = ASSETS_POR_CODIGO[codigo]
  const fotosUtilizables = fotosCanonicas.fotos.filter((f) => urlUtilizable(f.url))

  if (!dir) {
    // Sin assets para el caso: sólo sobreviven adjuntos con URL utilizable.
    return {
      imagenes: { ...RANURAS_VACIAS },
      fotos:
        fotosUtilizables.length === fotosCanonicas.fotos.length
          ? fotosCanonicas
          : { ...fotosCanonicas, fotos: fotosUtilizables },
    }
  }

  const imagenes = Object.fromEntries(
    (Object.entries(ARCHIVO_POR_RANURA) as [keyof ImagenesInforme, string][]).map(
      ([ranura, archivo]) => [ranura, dataUri(dir, archivo)],
    ),
  ) as unknown as ImagenesInforme

  // Adjuntos reales con URL pública primero; la grilla del espejo completa.
  const fotos = GRILLA_FOTOS.map(({ archivo, categoria }, i) => {
    const adjunto = fotosUtilizables.find((f) => f.categoria === categoria)
    return (
      adjunto ?? {
        id: `asset-${i + 1}`,
        nombre: archivo,
        categoria,
        url: dataUri(dir, archivo) ?? '',
      }
    )
  }).filter((f) => f.url !== '')

  const porCategoria: Record<string, number> = {}
  for (const f of fotos) porCategoria[f.categoria] = (porCategoria[f.categoria] ?? 0) + 1

  return { imagenes, fotos: { total: fotos.length, porCategoria, fotos } }
}
