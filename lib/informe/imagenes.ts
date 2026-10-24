/**
 * Resolutor de las ranuras de imagen del informe (`ImagenesInforme` +
 * `fotos.fotos[]`) — funciones **puras**, sin red ni disco.
 *
 * Tanda T-PDF-E3-GENERICOS-20260930 · plan §4. Carbone v4 sustituye cada
 * placeholder de imagen de la plantilla por el binario referido en el tag:
 * el valor debe ser una **URL pública** alcanzable por api.carbone.io o un
 * **data-URI base64**. La única fuente renderizable de la base es
 * `TX_Adjuntos.thumbnail_url` (data-URI JPEG ≤95k chars o URL http(s)) —
 * `url_dropbox` es un path interno, no descargable — más la firma del
 * tasador en `M_Tasadores.firma_url`.
 *
 * ## Contrato ranura → fuente viva (plan §4 · sin hardcode por caso)
 *
 * - **Ranuras fotográficas** ({@link RANURAS_FOTO}): salen de las fotos del
 *   bloque 7 canónico por categoría (`TX_Adjuntos.descripcion`) y `orden`
 *   asc — 1ª de `mapa_ubicacion`, 1ª de `fachada_exterior`, 1ª de
 *   `mapa_referencias` y las 3 primeras de `ofertas_comparables`.
 * - **Ranuras de anexo** ({@link RANURAS_ANEXO}): salen del riel documental —
 *   el adjunto no-foto cuyo `clave_adjunto` case con el código
 *   `D_TipoDocumento` de la ranura y que tenga `thumbnail_url` renderizable.
 *   El mapeo código→ranura es la **constante compartida** que también
 *   proyecta la UI (`lib/tasador/lectura-informe.ts` → preview): un solo
 *   origen, cero reglas duplicadas.
 * - **Firma**: `M_Tasadores.firma_url` del tasador asignado, leída una sola
 *   vez por el modelo canónico y pasada acá ya resuelta.
 *
 * Ranura sin fuente → `null` (vacío honesto — nunca la imagen de otra
 * propiedad, nunca romper el render). El fallback por-código a assets del
 * repo del caso espejo **se eliminó del camino vivo** en esta tanda: el
 * seed de datos cubre al caso espejo por el mismo riel que cualquier
 * solicitud.
 *
 * ## Grilla de 16 fotos (`fotos.fotos[]`) — origen único (T-VP0067-IMAGENES §4)
 *
 * Sin cambio: si el bloque 7 canónico trae filas, la grilla se construye
 * DESDE ELLAS (orden asc, caption por `labelInforme` de `CATEGORIAS_FOTO`, fuente =
 * thumbnail con caída a URL http(s)); sin filas, grilla vacía honesta.
 */

import { CATEGORIAS_FOTO } from '@/lib/tasador/tasaciones'
import type { FotosInforme, ImagenesInforme } from './tipos'

/**
 * Ranura fotográfica → categoría del organizador (`CATEGORIAS_FOTO`) y
 * posición dentro de ella (por `orden` asc). Constante compartida del
 * contrato §4 — la consume `resolverImagenes` y cualquier proyección de UI
 * que necesite saber qué foto alimenta cada ranura.
 */
export const RANURAS_FOTO = Object.freeze({
  mapaUbicacion: { categoria: 'mapa_ubicacion', indice: 0 },
  fachada: { categoria: 'fachada_exterior', indice: 0 },
  refMapa: { categoria: 'mapa_referencias', indice: 0 },
  ref1: { categoria: 'ofertas_comparables', indice: 0 },
  ref2: { categoria: 'ofertas_comparables', indice: 1 },
  ref3: { categoria: 'ofertas_comparables', indice: 2 },
} as const satisfies Partial<
  Record<keyof ImagenesInforme, { categoria: string; indice: number }>
>)

/** Id de una ranura de anexo (las 13 documentales de `ImagenesInforme`). */
export type RanuraAnexoId =
  | 'anexo1Plano'
  | 'anexo1Esquema'
  | 'anexo1CuadroSup'
  | 'anexo1Emplazamiento'
  | 'anexo1Aerea'
  | 'anexo1MapaSii'
  | 'anexo1InfoSii'
  | 'anexo2RolAvaluo'
  | 'anexo2Permiso'
  | 'anexo2Escritura'
  | 'anexo2NoExpropiacion'
  | 'anexo2Recepcion'
  | 'anexo2Tgr'

/**
 * Mapeo ranura de anexo → código de `D_TipoDocumento` (lo que
 * `SC-Adjuntos-Upload` persiste en `TX_Adjuntos.clave_adjunto`) + label
 * humano para la UI. **Constante compartida** (plan §4): la usan el payload
 * Carbone (vía {@link resolverImagenes}) y el preview del tasador (vía la
 * proyección `anexosRanuras` del modelo canónico). El orden del array es el
 * orden de impresión/listado (Anexo N°1 → Anexo N°2).
 */
export const RANURAS_ANEXO: readonly {
  ranura: RanuraAnexoId
  codigo: string
  label: string
}[] = Object.freeze([
  { ranura: 'anexo1Plano', codigo: 'foto_plano_cuadro_superficies', label: 'Plano / cuadro de superficies' },
  { ranura: 'anexo1Esquema', codigo: 'esquema_superficies', label: 'Esquema de superficies' },
  { ranura: 'anexo1CuadroSup', codigo: 'cuadro_superficies', label: 'Cuadro de superficies' },
  { ranura: 'anexo1Emplazamiento', codigo: 'planta_emplazamiento', label: 'Planta de emplazamiento' },
  { ranura: 'anexo1Aerea', codigo: 'foto_aerea', label: 'Foto aérea' },
  { ranura: 'anexo1MapaSii', codigo: 'mapa_sii', label: 'Mapa SII' },
  { ranura: 'anexo1InfoSii', codigo: 'foto_fuente_sii', label: 'Información SII' },
  { ranura: 'anexo2RolAvaluo', codigo: 'certificado_avaluo_fiscal', label: 'Certificado de avalúo fiscal' },
  { ranura: 'anexo2Permiso', codigo: 'permiso_edificacion', label: 'Permiso de edificación' },
  { ranura: 'anexo2Escritura', codigo: 'escritura_compraventa', label: 'Escritura de compraventa' },
  { ranura: 'anexo2NoExpropiacion', codigo: 'informe_no_expropiacion_serviu', label: 'Informe de no expropiación (SERVIU)' },
  { ranura: 'anexo2Recepcion', codigo: 'certificado_recepcion_final', label: 'Certificado de recepción final' },
  { ranura: 'anexo2Tgr', codigo: 'certificado_deuda_tgr', label: 'Certificado de deuda TGR' },
])

const CODIGOS_ANEXO: ReadonlySet<string> = new Set(RANURAS_ANEXO.map((r) => r.codigo))

/**
 * ¿Esta fila de `TX_Adjuntos` es documento de anexo? Lo es si no es foto, **o**
 * si su `clave_adjunto` es el código de una ranura de anexo aunque también esté
 * categorizada como foto: cuando el tasador sube como foto el mismo archivo de
 * un documento, `SC-Adjuntos-Upload` reutiliza la fila por hash y la
 * recategoriza como foto, y el anexo quedaba vacío (réplica MET-6283: el plano
 * reutilizado por la foto «Planificación», 19-oct-2026).
 */
export function esDocumentoDeAnexo(tipoAdjunto: string, claveAdjunto: string): boolean {
  return !tipoAdjunto.startsWith('foto') || CODIGOS_ANEXO.has(claveAdjunto.trim())
}

/**
 * Un adjunto documental (no-foto) de `TX_Adjuntos`, reducido a lo que el
 * resolutor necesita: su código de tipo y su fuente renderizable.
 */
export interface DocumentoAnexo {
  /** `clave_adjunto` — código de `D_TipoDocumento` declarado al subir. */
  codigo: string
  /** `nombre_archivo`. */
  nombre: string
  /** `thumbnail_url` (data-URI JPEG o URL http(s)), o `null`. */
  thumbnailUrl: string | null
}

/**
 * Una ranura de anexo ya resuelta contra el riel documental. `nombre` y
 * `thumbnailUrl` en `null` = ranura sin documento (vacío honesto). La
 * consume el PDF (vía `resolverImagenes`) y la UI (sección «Anexos del
 * informe» del preview) — mismas fuentes, misma resolución.
 */
export interface AnexoResuelto {
  ranura: RanuraAnexoId
  codigo: string
  label: string
  nombre: string | null
  thumbnailUrl: string | null
}

/** La plantilla tiene 16 posiciones fijas `{d.fotos.fotos[i=0..15]}`. */
const MAX_FOTOS_GRILLA = 16

/**
 * Categorías que no entran a la grilla de fotos. `datos_comparables` (14-oct-2026)
 * es la foto del cuadro de comparables: un documento que lee RF-09, no una foto
 * de la propiedad. Como su sección va arriba en la pantalla, si entrara a la
 * grilla ocuparía la primera posición cuando el tasador la sube primero.
 */
const FUERA_DE_GRILLA: ReadonlySet<string> = new Set([
  'datos_comparables',
  /* El mapa de referencias y las fotos de las 3 referencias tienen sus ranuras
     en la Hoja 2 (`refMapa` · `ref1..3`); el original MET-6283 no las repite en
     las Hojas 4 y 5, y en la grilla desplazaban fotos de la propiedad fuera de
     las 16 posiciones (réplica 23-oct-2026: se perdía «Planificación»). */
  'mapa_referencias',
  'ofertas_comparables',
])

/**
 * La misma imagen con bytes distintos. Carbone inserta una sola vez cada imagen
 * repetida y le aplica el tamaño de una de sus casillas: la fachada y el mapa
 * de la Hoja 1 (también en la grilla) salían con el alto de las fotos (167 pt
 * en vez de 119 y 113) y empujaban la firma a otra página (réplica MET-6283,
 * 23-oct-2026). Un comentario dentro del JPEG/PNG la hace única sin alterarla;
 * una URL http(s) recibe un fragmento, que no viaja al servidor.
 */
export function imagenUnica(url: string | null, marca: string): string | null {
  if (url === null) return null
  const m = /^data:(image\/(?:jpeg|jpg|png));base64,([\s\S]*)$/.exec(url)
  if (!m) return /^https?:\/\//.test(url) ? `${url.split('#')[0]}#${marca}` : url
  let bin: string
  try {
    bin = atob(m[2])
  } catch {
    return url
  }
  const texto = `vp:${marca}`
  if (m[1] === 'image/png') {
    const fin = bin.lastIndexOf('IEND') - 4
    if (fin < 8) return url
    const cuerpo = `Comment\0${texto}`
    const tipoYCuerpo = `tEXt${cuerpo}`
    const bloque = u32(cuerpo.length) + tipoYCuerpo + u32(crc32(tipoYCuerpo))
    return `data:${m[1]};base64,${btoa(bin.slice(0, fin) + bloque + bin.slice(fin))}`
  }
  if (!bin.startsWith('\xFF\xD8')) return url
  const largo = texto.length + 2
  const com = '\xFF\xFE' + String.fromCharCode(largo >> 8, largo & 0xff) + texto
  return `data:${m[1]};base64,${btoa(bin.slice(0, 2) + com + bin.slice(2))}`
}

/** Entero de 32 bits big-endian como cadena binaria. */
function u32(n: number): string {
  return String.fromCharCode((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff)
}

/** CRC-32 (el de PNG) de una cadena binaria. */
function crc32(s: string): number {
  let c = 0xffffffff
  for (let i = 0; i < s.length; i++) {
    c ^= s.charCodeAt(i)
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
  }
  return (c ^ 0xffffffff) >>> 0
}

/**
 * Caption por categoría: `labelInforme` de `CATEGORIAS_FOTO` cuando la
 * categoría es uno de los ids del catálogo; el nombre custom pasa tal cual.
 * Única fuente de labels (RO-05) — acá no se duplica ningún string de la UI.
 *
 * Es `labelInforme` y no `label` desde T-TEMAS1: los rótulos de pantalla
 * cambiaron («Fachada», «Dormitorios»…) y el PDF debe seguir imprimiendo los
 * mismos pies de foto (decisión Q1 · 14-oct-2026).
 */
const LABEL_POR_CATEGORIA: ReadonlyMap<string, string> = new Map(
  CATEGORIAS_FOTO.map((c) => [c.id, c.labelInforme]),
)

/**
 * ¿Fuente que Carbone v4 (y un `<img>`) puede renderizar? URL `http(s)`
 * descargable — se deja pasar tal cual, Carbone la baja solo — o data-URI de
 * imagen (contrato `thumbnail_url` §4). Un path Dropbox no lo es.
 */
export function fuenteRenderizable(url: string | null | undefined): url is string {
  return typeof url === 'string' && /^(https?:\/\/|data:image\/)/.test(url)
}

/**
 * Resuelve las 13 ranuras de anexo contra los adjuntos documentales: para
 * cada ranura, el primer adjunto cuyo `codigo` case y traiga thumbnail
 * renderizable (RN-60 garantiza a lo sumo un archivo por tipo; si hubiera
 * más de uno, gana el primero). Sin candidato → ranura vacía honesta. Un
 * documento subido como PDF no tiene thumbnail (deuda P2) y cae aquí igual.
 */
export function resolverAnexos(documentos: DocumentoAnexo[]): AnexoResuelto[] {
  return RANURAS_ANEXO.map(({ ranura, codigo, label }) => {
    const doc = documentos.find(
      (d) => d.codigo === codigo && fuenteRenderizable(d.thumbnailUrl),
    )
    return {
      ranura,
      codigo,
      label,
      nombre: doc ? doc.nombre : null,
      thumbnailUrl: doc ? doc.thumbnailUrl : null,
    }
  })
}

type Foto = FotosInforme['fotos'][number]

/** Orden asc con null al final (sort estable = orden de llegada). */
function ordenarPorOrden(fotos: readonly Foto[]): Foto[] {
  return [...fotos].sort(
    (a, b) =>
      (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER),
  )
}

/** Fuente renderizable de una foto: thumbnail primero, caída a URL http(s). */
function fuenteDeFoto(f: Foto): string | null {
  if (fuenteRenderizable(f.thumbnailUrl)) return f.thumbnailUrl
  if (fuenteRenderizable(f.url)) return f.url
  return null
}

/**
 * Grilla construida desde las fotos reales del bloque 7 (origen único §4):
 * orden asc con null al final, caption por label, fuente = thumbnail con
 * caída a la url http(s). Foto sin fuente renderizable se OMITE (warn); si
 * hay más de 16, entran las primeras 16.
 */
function grillaDesdeFotosReales(
  codigo: string,
  fotosCanonicas: FotosInforme,
): FotosInforme {
  const ordenadas = ordenarPorOrden(
    fotosCanonicas.fotos.filter((f) => !FUERA_DE_GRILLA.has(f.categoria)),
  )

  const renderizables = ordenadas.flatMap((f) => {
    const url = fuenteDeFoto(f)
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
 * Resuelve las 20 ranuras de imagen y la grilla de fotos para una solicitud,
 * 100 % desde fuentes vivas (plan §4):
 *
 * - `fotosCanonicas`: bloque 7 del modelo canónico (categoría cruda de
 *   `TX_Adjuntos.descripcion` + `orden` + `thumbnail_url`) → ranuras
 *   {@link RANURAS_FOTO} y grilla de 16.
 * - `anexos`: las 13 ranuras documentales ya resueltas por
 *   {@link resolverAnexos} — las produce el modelo canónico
 *   (`InformeCanonico.anexosRanuras`) para que UI y PDF lean el MISMO objeto.
 * - `firmaUrl`: `M_Tasadores.firma_url` del tasador asignado
 *   (`InformeCanonico.firmaTasadorUrl`), data-URI o URL https; no
 *   renderizable → `null`.
 *
 * Cualquier ranura sin fuente queda en `null` — nunca rompe el render.
 */
export function resolverImagenes(
  codigo: string,
  fotosCanonicas: FotosInforme,
  anexos: readonly AnexoResuelto[],
  firmaUrl: string | null,
): { imagenes: ImagenesInforme; fotos: FotosInforme } {
  /* Ranuras fotográficas: fuentes renderizables por categoría, en orden. */
  const fuentesPorCategoria = new Map<string, string[]>()
  for (const f of ordenarPorOrden(fotosCanonicas.fotos)) {
    const url = fuenteDeFoto(f)
    if (url === null) continue
    const lista = fuentesPorCategoria.get(f.categoria)
    if (lista) lista.push(url)
    else fuentesPorCategoria.set(f.categoria, [url])
  }
  const fotoRanura = (r: keyof typeof RANURAS_FOTO): string | null => {
    const { categoria, indice } = RANURAS_FOTO[r]
    return fuentesPorCategoria.get(categoria)?.[indice] ?? null
  }

  /* Ranuras documentales: proyección directa de la resolución compartida. */
  const anexoPorRanura = Object.fromEntries(
    anexos.map((a) => [a.ranura, imagenUnica(a.thumbnailUrl, a.ranura)]),
  ) as Record<RanuraAnexoId, string | null | undefined>

  /* `imagenUnica`: la fachada y el mapa de ubicación también van en la grilla
     (y un plano puede ser foto y anexo); sin variante, Carbone los insertaría
     con el tamaño de otra casilla. */
  const imagenes: ImagenesInforme = {
    mapaUbicacion: imagenUnica(fotoRanura('mapaUbicacion'), 'mapaUbicacion'),
    fachada: imagenUnica(fotoRanura('fachada'), 'fachada'),
    firma: fuenteRenderizable(firmaUrl) ? firmaUrl : null,
    refMapa: fotoRanura('refMapa'),
    ref1: fotoRanura('ref1'),
    ref2: fotoRanura('ref2'),
    ref3: fotoRanura('ref3'),
    anexo1Plano: anexoPorRanura.anexo1Plano ?? null,
    anexo1Esquema: anexoPorRanura.anexo1Esquema ?? null,
    anexo1CuadroSup: anexoPorRanura.anexo1CuadroSup ?? null,
    anexo1Emplazamiento: anexoPorRanura.anexo1Emplazamiento ?? null,
    anexo1Aerea: anexoPorRanura.anexo1Aerea ?? null,
    anexo1MapaSii: anexoPorRanura.anexo1MapaSii ?? null,
    anexo1InfoSii: anexoPorRanura.anexo1InfoSii ?? null,
    anexo2RolAvaluo: anexoPorRanura.anexo2RolAvaluo ?? null,
    anexo2Permiso: anexoPorRanura.anexo2Permiso ?? null,
    anexo2Escritura: anexoPorRanura.anexo2Escritura ?? null,
    anexo2NoExpropiacion: anexoPorRanura.anexo2NoExpropiacion ?? null,
    anexo2Recepcion: anexoPorRanura.anexo2Recepcion ?? null,
    anexo2Tgr: anexoPorRanura.anexo2Tgr ?? null,
  }

  const fotos =
    fotosCanonicas.fotos.length > 0
      ? grillaDesdeFotosReales(codigo, fotosCanonicas)
      : { total: 0, porCategoria: {}, fotos: [] }

  return { imagenes, fotos }
}
