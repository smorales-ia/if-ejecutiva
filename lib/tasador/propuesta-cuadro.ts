/**
 * Cuadro de valoración propuesto (sección C) · spec §2.8.2 · 14-oct-2026.
 *
 * Cuando la solicitud todavía no tiene filas en `TX_ItemsCuadroValoracion`, el
 * servidor arma los ítems con lo que la base **ya sabe** de la propiedad, para
 * que el tasador abra la sección C con el cuadro hecho y sólo revise y complete.
 * Mismo criterio que §2.8.1: un campo vacío tiende a quedarse vacío.
 *
 * ## Qué se precarga y de dónde
 *
 * | Dato del ítem | Fuente |
 * |---|---|
 * | Filas «Terreno» y «Servidumbre» y sus m² | superficies de la sección B ya consolidadas (`TX_DatosTasacion`, §4.3.4): terreno − servidumbre y servidumbre |
 * | Filas de edificación y sus m² | `TX_Unidades` (una por unidad); la principal toma la sup. construida y la de primer piso de la sección B |
 * | Bodega, estacionamiento de uso y goce, piscina, OO.CC., terraza | `TX_Unidades` con ese subtipo |
 * | Rol SII · año · material · origen de superficie | la unidad (`rol_sii`, `anio_construccion`, `tipo_material`, `origen_superficie`) |
 * | Estado | estado de conservación de la sección B, cuando es la misma palabra del catálogo del ítem |
 * | Situación municipal | `Regularizado` cuando la solicitud tiene recepción final |
 * | Factor D.F. | `1`, el valor por defecto de la planilla `[Excel: Portada!AX51:AX53]` |
 *
 * ## Qué no se precarga, a propósito
 *
 * **El UF/m² de cada ítem** y **el factor D.F. distinto de 1** son criterio del
 * tasador: en la planilla son constantes tipeadas, sin tabla ni regla que las
 * produzca (confirmado por Héctor y Óscar el 18-sep-2026 ·
 * `docs/_analisis/AUDITORIA_XLSM_MET6283_OCC_TERRENO.md`). Tampoco se inventan
 * obras complementarias que ninguna fuente declara: las comodidades de E.5 no se
 * persisten (CI-023). La sección C le dice al tasador qué le falta completar.
 *
 * ## Una sola fuente para las superficies
 *
 * Las superficies se leen de la proyección de la sección B, nunca de los
 * adjuntos: la consolidación por precedencia (AT03-Ext, §4.3.4) ya eligió el
 * valor, y el aviso de coherencia de la sección C
 * (`lib/tasador/coherencia-superficies.ts`) compara contra el mismo número.
 * Las unidades de subtipo `Terreno` o `Servidumbre` no generan filas por eso.
 *
 * Lógica pura y determinista —mismo cuadro en cada apertura—, sin Airtable.
 */

import type { ItemValoracion } from '@/lib/tasador/tasaciones'
import { OPCIONES } from '@/lib/tasador/tasaciones'
import { numeroDe } from '@/lib/tasador/comparables'

/** Una fila de `TX_Unidades`, ya pasada a texto. */
export interface UnidadPropuesta {
  subtipo: string
  rolSii: string
  supM2: string
  anioConstruccion: string
  /** Dominio de `TX_Unidades.tipo_material` (`albanileria`, `hormigon`, …). */
  tipoMaterial: string
  origenSuperficie: string
  numeroUnidad: string
  detalleItem: string
  /** `con_rol` · `uso_y_goce`. */
  conRolOUsoYGoce: string
  esPrincipal: boolean
}

export interface EntradaPropuestaCuadro {
  /** Sección B, ya consolidada y con su fallback (`lectura-datos.ts`). */
  supTerreno: string
  servidumbreM2: string
  supConstruida: string
  supPrimerPiso: string
  pisos: string
  anioConstruccion: string
  materialPredominante: string
  estadoConservacion: string
  /** `TX_DocumentosLegales.recepcion_final_numero`. */
  recepcionFinalNumero: string
  /** En el orden de `TX_Unidades.orden`. */
  unidades: readonly UnidadPropuesta[]
}

/** Valor por defecto del factor D.F. en la planilla `[Excel: Portada!AX51:AX53]`. */
export const FACTOR_DF_PLANILLA = '1'

const TOLERANCIA_M2 = 0.005

const SUBTIPOS_EDIFICACION = new Set(['casa', 'departamento', 'local', 'edificacion'])
/** Unidades que llevan terreno propio en el cuadro (la de un departamento va prorrateada en su valor). */
const SUBTIPOS_CON_TERRENO = new Set(['casa'])

/** `TX_Unidades.tipo_material` → `TX_ItemsCuadroValoracion.material`. Dominios cerrados los dos. */
const MATERIAL_UNIDAD_A_ITEM: Record<string, string> = {
  albanileria: 'Albanileria',
  hormigon: 'Hormigon armado',
  madera: 'Madera',
  mixto: 'Mixto',
  perfiles_metalicos: 'Acero',
}

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

/** Opción del catálogo cuyo valor o rótulo es la misma palabra; `''` si no hay. */
function opcionIgual(valor: string, opciones: readonly { v: string; l: string }[]): string {
  const n = normalizar(valor)
  if (n === '') return ''
  return opciones.find((o) => normalizar(o.v) === n || normalizar(o.l) === n)?.v ?? ''
}

/** m² con dos decimales, sin el ruido de la resta en coma flotante. */
function m2(n: number): string {
  return String(Math.round(n * 100) / 100)
}

function materialDeUnidad(u: UnidadPropuesta, respaldo: string): string {
  return MATERIAL_UNIDAD_A_ITEM[normalizar(u.tipoMaterial)] ?? opcionIgual(respaldo, OPCIONES.materialItem)
}

/** El catálogo de origen del ítem es el de `TX_Unidades`: se copia sólo si está en él. */
function origenDeUnidad(u: UnidadPropuesta | undefined): string {
  if (!u) return ''
  return OPCIONES.origenSuperficie.some((o) => o.v === u.origenSuperficie) ? u.origenSuperficie : ''
}

type Fila = Omit<ItemValoracion, 'id'>

function filaBase(): Fila {
  return {
    descripcion: '',
    subtipo: '',
    rolSii: '',
    anioItem: '',
    tipo: '',
    situacionMunicipal: '',
    estado: '',
    aportaGarantia: true,
    origenSuperficie: '',
    superficieM2: '',
    ufM2Unitario: '',
    factorAplicado: FACTOR_DF_PLANILLA,
    materialItem: '',
  }
}

/** Subtipo y tipo del ítem para las unidades que no son edificación ni terreno. */
function clasificarOtra(u: UnidadPropuesta): { subtipo: string; tipo: string; etiqueta: string } | null {
  switch (normalizar(u.subtipo)) {
    case 'bodega':
      return { subtipo: 'Bodega', tipo: 'Bodega', etiqueta: 'Bodega' }
    case 'estacionamiento':
      // Con rol propio puede ser cubierto o descubierto: lo decide el tasador.
      return normalizar(u.conRolOUsoYGoce) === 'uso_y_goce'
        ? { subtipo: 'Estac U/Goce', tipo: 'Estac. U/Goce', etiqueta: 'Estacionamiento' }
        : { subtipo: '', tipo: '', etiqueta: 'Estacionamiento' }
    case 'piscina':
      return { subtipo: 'Piscina', tipo: 'Piscina', etiqueta: 'Piscina' }
    case 'oo.cc.':
      return { subtipo: 'OOCC', tipo: 'OO.CC.', etiqueta: 'Obras complementarias' }
    case 'terraza':
      return { subtipo: 'Terraza', tipo: 'Terraza', etiqueta: 'Terraza' }
    default:
      return null
  }
}

/**
 * Ítems propuestos para el cuadro de valoración. `[]` cuando no hay nada que
 * proponer (sin superficies ni unidades): la sección C queda como estaba.
 */
export function proponerCuadro(e: EntradaPropuestaCuadro): ItemValoracion[] {
  const filas: Fila[] = []

  const edificaciones = e.unidades.filter((u) => SUBTIPOS_EDIFICACION.has(normalizar(u.subtipo)))
  const principal = edificaciones.find((u) => u.esPrincipal) ?? edificaciones[0]
  const situacion = e.recepcionFinalNumero.trim() !== '' ? 'Regularizado' : ''
  const estado = opcionIgual(e.estadoConservacion, OPCIONES.estadoItem)

  /* --- Terreno · terreno útil y servidumbre (planilla, filas 51-52) --- */
  const terreno = numeroDe(e.supTerreno)
  const servidumbre = numeroDe(e.servidumbreM2)
  const llevaTerreno = principal !== undefined && SUBTIPOS_CON_TERRENO.has(normalizar(principal.subtipo))
  if (llevaTerreno && terreno !== null && terreno > 0) {
    const conServidumbre = servidumbre !== null && servidumbre > 0 && servidumbre < terreno
    const terrenoComun: Fila = {
      ...filaBase(),
      subtipo: 'Terreno',
      tipo: 'Terreno',
      rolSii: principal.rolSii,
      situacionMunicipal: situacion,
      origenSuperficie: origenDeUnidad(principal),
    }
    filas.push({
      ...terrenoComun,
      descripcion: 'Terreno',
      superficieM2: m2(conServidumbre ? terreno - servidumbre : terreno),
    })
    if (conServidumbre) {
      filas.push({ ...terrenoComun, descripcion: 'Servidumbre', superficieM2: m2(servidumbre) })
    }
  }

  /* --- Edificación · una fila por unidad; la principal, por piso --- */
  for (const u of edificaciones) {
    const esPrincipal = u === principal
    const comun: Fila = {
      ...filaBase(),
      subtipo: 'Edificacion',
      tipo: 'Edificacion',
      rolSii: u.rolSii,
      anioItem: u.anioConstruccion || (esPrincipal ? e.anioConstruccion : ''),
      situacionMunicipal: situacion,
      estado,
      origenSuperficie: origenDeUnidad(u),
      materialItem: materialDeUnidad(u, esPrincipal ? e.materialPredominante : ''),
    }
    const esCasa = normalizar(u.subtipo) === 'casa'
    const etiqueta = esCasa ? 'Piso 1' : u.numeroUnidad.trim() || u.subtipo

    if (!esPrincipal) {
      filas.push({ ...comun, descripcion: etiqueta, superficieM2: u.supM2 })
      continue
    }

    const total = numeroDe(e.supConstruida) ?? numeroDe(u.supM2)
    const primerPiso = numeroDe(e.supPrimerPiso)
    if (esCasa && total !== null && primerPiso !== null && primerPiso > 0 && primerPiso < total - TOLERANCIA_M2) {
      const superiores = numeroDe(e.pisos) === 2 ? 'Piso 2' : 'Pisos superiores'
      filas.push({ ...comun, descripcion: 'Piso 1', superficieM2: m2(primerPiso) })
      filas.push({ ...comun, descripcion: superiores, superficieM2: m2(total - primerPiso) })
    } else {
      filas.push({ ...comun, descripcion: etiqueta, superficieM2: total === null ? '' : m2(total) })
    }
  }

  /* --- Otras unidades con rol o uso y goce --- */
  for (const u of e.unidades) {
    const c = clasificarOtra(u)
    if (!c) continue
    filas.push({
      ...filaBase(),
      descripcion: u.detalleItem.trim() || u.numeroUnidad.trim() || c.etiqueta,
      subtipo: c.subtipo,
      tipo: c.tipo,
      rolSii: u.rolSii,
      origenSuperficie: origenDeUnidad(u),
      superficieM2: u.supM2,
      // RN-09: la terraza no aporta a garantía (la misma regla que aplica la sección C al editar).
      aportaGarantia: c.subtipo !== 'Terraza',
    })
  }

  return filas.map((f, i) => ({ id: `it-prop-${i + 1}`, ...f }))
}

/**
 * Ítems a los que les falta el UF/m² unitario, por su descripción. Es lo que la
 * sección C le pide completar al tasador: sin él, el ítem vale 0.
 */
export function itemsSinUfM2(items: readonly Pick<ItemValoracion, 'descripcion' | 'ufM2Unitario'>[]): string[] {
  return items
    .map((it, i) => ({ nombre: it.descripcion.trim() || `Ítem ${i + 1}`, falta: numeroDe(it.ufM2Unitario) === null }))
    .filter((x) => x.falta)
    .map((x) => x.nombre)
}
