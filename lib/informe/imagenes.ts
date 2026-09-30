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
 * ## Grilla de 16 fotos (`fotos.fotos[]`) — origen único (T-VP0067-IMAGENES §4)
 *
 * 1. **Fotos reales primero**: si el bloque 7 canónico trae filas
 *    (`TX_Adjuntos` con `tipo_adjunto` prefijo `foto`), la grilla se
 *    construye DESDE ELLAS: ordenadas por `orden` asc (null al final, orden
 *    de llegada estable), `url` = `thumbnail_url` (data-URI JPEG o URL
 *    http(s)) con caída a la `url` de la foto si es http(s) — Carbone
 *    descarga URLs públicas tal cual, no hace falta bajarlas acá —, caption
 *    (`categoria`) = **label** de `CATEGORIAS_FOTO` cuando la categoría es
 *    uno de los 8 ids, o el nombre custom tal cual. Foto sin fuente
 *    renderizable → **se omite** (con warn): una ranura sin imagen no aporta
 *    nada al PDF y la plantilla imprime por índice. Máximo 16 (posiciones
 *    fijas de la plantilla): sobrantes fuera, con warn.
 * 2. **Fallback de tanda (assets del repo)** — ⚠ transitorio del espejo,
 *    SOLO cuando el bloque 7 viene vacío (pre-siembra): para VP-2026-0067
 *    las imágenes extraídas del PDF de referencia MET-6283 viven en
 *    `docs/_artefactos/carbone/assets_met6283/` (MANIFEST.md) y se emiten
 *    como data-URI con el caption del gold master. Muere cuando la siembra
 *    D de la tanda puebla las 16 filas reales.
 *
 * ## Ranuras fijas (`ImagenesInforme`, 20 tags `{d.imagenes.*}`)
 *
 * Sin cambio de comportamiento en esta tanda: para el flujo vivo falta el
 * mecanismo de captura/columna (firma en M_Tasadores, mapas P1-4, escaneados
 * de anexos), así que el espejo sigue saliendo del fallback repo. El fallback
 * está **acotado por `codigo_solicitud`** (`ASSETS_POR_CODIGO`): cualquier
 * otra solicitud recibe `null` en cada ranura — ranura vacía honesta, nunca
 * la foto de otra propiedad.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CATEGORIAS_FOTO } from '@/lib/tasador/tasaciones'
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
 * ⚠ TRANSITORIO DEL ESPEJO (pre-siembra): grillas 2×4 de las Hojas 4-5,
 * archivo + caption EXACTO del gold master (MANIFEST.md — la banda gris bajo
 * cada foto). «Planificación» reutiliza el plano del Anexo 1: misma imagen en
 * ambas ranuras del PDF de referencia. Es el **último recurso** cuando la
 * solicitud espejo aún no tiene fotos reales en `TX_Adjuntos`; con bloque 7
 * poblado, la grilla sale SIEMPRE de las fotos reales.
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

/** La plantilla tiene 16 posiciones fijas `{d.fotos.fotos[i=0..15]}`. */
const MAX_FOTOS_GRILLA = 16

/**
 * Caption por categoría: label oficial de `CATEGORIAS_FOTO` cuando la
 * categoría es uno de los 8 ids; el nombre custom pasa tal cual. Única fuente
 * de labels (RO-05) — acá no se duplica ningún string de la UI.
 */
const LABEL_POR_CATEGORIA: ReadonlyMap<string, string> = new Map(
  CATEGORIAS_FOTO.map((c) => [c.id, c.label]),
)

/**
 * ¿Fuente que Carbone v4 puede renderizar? URL `http(s)` descargable
 * (attachment público — se deja pasar tal cual, Carbone la baja solo) o
 * data-URI de imagen (contrato `thumbnail_url` §4). Un path Dropbox no lo es.
 */
function fuenteRenderizable(url: string | null | undefined): url is string {
  return typeof url === 'string' && /^(https?:\/\/|data:image\/)/.test(url)
}

/**
 * Grilla construida desde las fotos reales del bloque 7 (origen único §4):
 * orden asc con null al final (sort estable = orden de llegada), caption por
 * label, fuente = thumbnail con caída a la url http(s). Foto sin fuente
 * renderizable se OMITE (warn); si hay más de 16, entran las primeras 16.
 */
function grillaDesdeFotosReales(
  codigo: string,
  fotosCanonicas: FotosInforme,
): FotosInforme {
  const ordenadas = [...fotosCanonicas.fotos].sort(
    (a, b) =>
      (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER),
  )

  const renderizables = ordenadas.flatMap((f) => {
    const url = fuenteRenderizable(f.thumbnailUrl)
      ? f.thumbnailUrl
      : fuenteRenderizable(f.url)
        ? f.url
        : null
    if (url === null) {
      console.warn(
        '[imagenes] foto sin fuente renderizable — se omite de la grilla',
        codigo,
        f.id,
        f.nombre,
      )
      return []
    }
    /* Forma explícita, sin `...f`: el data-URI ya viaja en `url`; repetirlo en
       `thumbnailUrl` duplicaba ~1,3 MB del payload a Carbone (límite del
       webhook Make: 5 MB). `orden` tampoco se emite: la posición es el índice. */
    return [
      {
        id: f.id,
        nombre: f.nombre,
        url,
        categoria: LABEL_POR_CATEGORIA.get(f.categoria) ?? f.categoria,
      },
    ]
  })

  if (renderizables.length > MAX_FOTOS_GRILLA) {
    console.warn(
      `[imagenes] ${renderizables.length} fotos para ${MAX_FOTOS_GRILLA} posiciones — se imprimen las primeras ${MAX_FOTOS_GRILLA} por orden`,
      codigo,
    )
  }
  const fotos = renderizables.slice(0, MAX_FOTOS_GRILLA)

  const porCategoria: Record<string, number> = {}
  for (const f of fotos) porCategoria[f.categoria] = (porCategoria[f.categoria] ?? 0) + 1

  return { total: fotos.length, porCategoria, fotos }
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
 * `fotosCanonicas` es el bloque 7 del modelo canónico. Con filas reales, la
 * grilla sale SIEMPRE de ellas (`grillaDesdeFotosReales` — origen único §4).
 * Con el bloque vacío y el fallback del espejo activo, la grilla se puebla
 * con los 16 assets del gold master (transitorio pre-siembra) para que el
 * render sea idéntico al PDF de referencia. Las 20 ranuras fijas
 * (`ImagenesInforme`) no cambian: assets del espejo o `null`.
 */
export function resolverImagenes(
  codigo: string,
  fotosCanonicas: FotosInforme,
): { imagenes: ImagenesInforme; fotos: FotosInforme } {
  const dir = ASSETS_POR_CODIGO[codigo]

  const imagenes = dir
    ? (Object.fromEntries(
        (Object.entries(ARCHIVO_POR_RANURA) as [keyof ImagenesInforme, string][]).map(
          ([ranura, archivo]) => [ranura, dataUri(dir, archivo)],
        ),
      ) as unknown as ImagenesInforme)
    : { ...RANURAS_VACIAS }

  // Fotos reales primero: el bloque 7 no vacío manda, espejo o no.
  if (fotosCanonicas.fotos.length > 0) {
    return { imagenes, fotos: grillaDesdeFotosReales(codigo, fotosCanonicas) }
  }

  if (!dir) {
    // Sin fotos reales ni assets del caso: grilla vacía honesta.
    return { imagenes, fotos: { total: 0, porCategoria: {}, fotos: [] } }
  }

  // ⚠ Último recurso — espejo pre-siembra: grilla del gold master.
  const fotos = GRILLA_FOTOS.map(({ archivo, categoria }, i) => ({
    id: `asset-${i + 1}`,
    nombre: archivo,
    categoria,
    url: dataUri(dir, archivo) ?? '',
  })).filter((f) => f.url !== '')

  const porCategoria: Record<string, number> = {}
  for (const f of fotos) porCategoria[f.categoria] = (porCategoria[f.categoria] ?? 0) + 1

  return { imagenes, fotos: { total: fotos.length, porCategoria, fotos } }
}
