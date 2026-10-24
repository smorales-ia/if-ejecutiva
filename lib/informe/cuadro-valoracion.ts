/**
 * Columnas por fila y renglones de totales del CUADRO DE VALORACION (Hoja 1).
 *
 * Réplica MET-6283 (23-oct-2026). La especificación es la planilla del cliente,
 * `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm`, hoja
 * `Portada` filas 50–62 (la hoja `Impresion` sólo las copia). Cada función cita
 * la celda que replica.
 *
 * Módulo puro y client-safe: sin imports de Airtable. Las cifras no se
 * inventan: los valores por fila salen de `TX_ItemsCuadroValoracion` (sus
 * fórmulas `valor_uf` y `valor_seguro_item_uf`), del factor de seguro del
 * cliente que usa el motor (`M_Clientes.factor_seguro`) y de la razón
 * liquidación ÷ comercial de los terminales del motor (`TX_Calculos`). Acá sólo
 * se agrupan, se suman y se dividen como la planilla.
 */

import { OPCIONES } from '@/lib/tasador/tasaciones'
import { ufM2ConstruccionTasacion } from './fila-tasacion'
import type { ItemCuadroInforme, TotalCuadroInforme, TotalesCuadroInforme } from './tipos'

function sinTildes(valor: string): string {
  return valor.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

/**
 * Columna «Tipo»: código de material de la planilla (`Portada!V51`, lista
 * `CV2:CW14`: «AL : Albañilería Ladrillo», «HA : Hormigón Armado»…). Recibe el
 * `material` del ítem (`Hormigon armado · Albanileria · Acero · Madera · Mixto`).
 * «Mixto» no tiene un código único en la lista (BA/CA/CE dependen de la mezcla):
 * queda vacío antes que adivinar.
 */
const CODIGO_MATERIAL: Record<string, string> = {
  'hormigon armado': 'HA',
  albanileria: 'AL',
  'albanileria ladrillo': 'AL',
  acero: 'AC',
  madera: 'MA',
  piedra: 'PI',
  adobe: 'AD',
}

export function codigoMaterialPlanilla(material: string): string {
  return CODIGO_MATERIAL[sinTildes(material)] ?? ''
}

/**
 * Columna «Estado» (`Portada!AE51`): la inicial del `flag_estado` del ítem
 * (`Bueno · Regular · Malo` → `B · R · M`), el mismo dominio que la columna
 * gemela `estado_conservacion` de la tabla.
 */
export function codigoEstadoPlanilla(flagEstado: string): string {
  switch (sinTildes(flagEstado)) {
    case 'bueno':
      return 'B'
    case 'regular':
      return 'R'
    case 'malo':
      return 'M'
    default:
      return ''
  }
}

/**
 * Columna «Grntía.» (`Portada!AG51`, lista `N/D,D`): `D` descuenta el ítem de
 * la garantía (lo usa `BZ51` para «bienes no considerados garantía»); `N/D` no
 * descuenta. Sale de `aporta_a_garantia`, lo que escribe la sección C.
 */
export function garantiaPlanilla(aportaAGarantia: boolean): 'N/D' | 'D' {
  return aportaAGarantia ? 'N/D' : 'D'
}

/**
 * Columna «Origen Super.» (`Portada!AJ51`, lista `Escritura · M. Laser · Plano
 * Muni. · Plano Prop.`). El ítem no tiene campo propio: hereda el
 * `origen_superficie` de su unidad (`TX_Unidades`). Los orígenes sin
 * equivalente en la lista se imprimen con su rótulo de la consola.
 */
const ORIGEN_PLANILLA: Record<string, string> = {
  plano: 'Plano Muni.',
  medicion_tasador: 'M. Laser',
}

export function origenSuperficiePlanilla(origen: string): string {
  const v = origen.trim()
  if (v === '') return ''
  return ORIGEN_PLANILLA[v] ?? OPCIONES.origenSuperficie.find((o) => o.v === v)?.l ?? v
}

/**
 * Rol comparable: sin espacios, sin «N°» y sin ceros a la izquierda en cada
 * parte (`00882-00040` y `N°882-40` → `882-40`). Sólo para casar ítem y unidad.
 */
export function normalizarRol(rol: string): string {
  return rol
    .replace(/^\s*n\s*[°º.]?\s*/i, '')
    .replace(/\s+/g, '')
    .split('-')
    .map((p) => p.replace(/^0+(?=\d)/, ''))
    .join('-')
}

/** Columna «Rol SII» como la planilla (`Portada!O51`: «N°882-40»); vacía sin rol. */
export function rolImpreso(rol: string): string {
  const r = normalizarRol(rol)
  return r === '' ? '' : `N°${r}`
}

/**
 * Columna «Item» con los rótulos de la lista de la planilla (`Portada!B51`:
 * «Edificación», «OO.CC»…). Los valores del `tipo_item` sin equivalente pasan
 * tal cual.
 */
const TIPO_PLANILLA: Record<string, string> = {
  Edificacion: 'Edificación',
  'OO.CC.': 'OO.CC',
  Subterraneo: 'Subterráneo',
}

export function tipoItemImpreso(tipoItem: string): string {
  return TIPO_PLANILLA[tipoItem] ?? tipoItem
}

/**
 * Columna «N°» (`Portada!F51 = COUNTIF($B$51:B51, B51)`): correlativo dentro de
 * su tipo, en el orden del cuadro (Terreno 1, Terreno 2, Edificación 1…).
 */
export function numerosPorTipo(tipos: readonly string[]): number[] {
  const vistos = new Map<string, number>()
  return tipos.map((t) => {
    const n = (vistos.get(t) ?? 0) + 1
    vistos.set(t, n)
    return n
  })
}

/** Columna «UF/m²» (`Portada!BD51 = F.M. × D.F. × UF/m² nuevo`; F.M. es 1). */
export function ufM2Valorado(ufM2Nuevo: number | null, factor: number | null): number | null {
  return ufM2Nuevo === null || factor === null ? null : ufM2Nuevo * factor
}

/**
 * Columna «Valor Seguros UF» (`Portada!BO51`): la base de seguro del ítem por el
 * factor de seguro del cliente — la misma cuenta que `F_SeguroIncendioUF`
 * (`valor_seguro_base_items_uf × factor_seguro`) hace sobre la suma. La base es
 * la fórmula `valor_seguro_item_uf` de la tabla (0 en terreno y estacionamientos).
 * Sin base o sin factor: `null`, nunca un 1,0 supuesto (el motor aborta en H6).
 */
export function valorSeguroItem(base: number | null, factorSeguro: number | null): number | null {
  return base === null || factorSeguro === null ? null : base * factorSeguro
}

/**
 * Factor de liquidación que aplicó el motor: `valor_liquidacion_uf ÷
 * valor_comercial_uf` de `TX_Calculos` (`F_ValorLiquidacionUF`; 0,825 en
 * MET-6283 = `Portada!AU78`). Se toma de sus terminales para no repetir la
 * constante en código.
 */
export function factorLiquidacion(
  valorLiquidacionUf: number | null,
  valorComercialUf: number | null,
): number | null {
  if (valorLiquidacionUf === null || !valorComercialUf) return null
  return valorLiquidacionUf / valorComercialUf
}

/** Columna «Valor Liquidación UF» (`Portada!BV51 = BI51 × AU78`). */
export function valorLiquidacionItem(ufTotal: number | null, factor: number | null): number | null {
  return ufTotal === null || factor === null ? null : ufTotal * factor
}

const esTipo = (i: ItemCuadroInforme, tipo: string) =>
  sinTildes(i.tipoItem) === sinTildes(tipo)

/**
 * Suma de una columna. Un grupo sin ítems suma 0 (la planilla imprime «0,00»);
 * un grupo cuyos ítems no traen el dato da `null`, nunca un 0 inventado.
 */
function sumar(
  items: readonly ItemCuadroInforme[],
  campo: (i: ItemCuadroInforme) => number | null,
): number | null {
  const valores = items.map(campo)
  if (valores.length > 0 && valores.every((v) => v === null)) return null
  return valores.reduce<number>((s, v) => s + (v ?? 0), 0)
}

/** Cociente; `null` si falta un término o el divisor es 0 (la planilla deja la celda vacía). */
function cociente(a: number | null, b: number | null): number | null {
  return a === null || !b ? null : a / b
}

function totalBase(items: readonly ItemCuadroInforme[]): TotalCuadroInforme {
  return {
    cantidad: items.length,
    anio: null,
    supM2: sumar(items, (i) => i.supM2),
    ufM2Nuevo: null,
    factor: null,
    ufM2: null,
    ufTotal: sumar(items, (i) => i.ufTotalItem),
    seguroUf: sumar(items, (i) => i.valorSeguroUf),
    liquidacionUf: sumar(items, (i) => i.valorLiquidacionUf),
  }
}

/**
 * Renglones TOTAL EDIFICACION / TOTAL OBRAS COMPLEMENTARIAS / TOTAL TERRENO
 * (`Portada!B59:BV61`). Obras complementarias es todo lo que no es edificación
 * ni terreno (`AN60 = SUM − AN59 − AN61`), así que incluye la piscina.
 *
 * - Edificación: año = `MIN(T51:U58)` (el menor año de todo el cuadro, como la
 *   planilla); UF/m² nuevo = Σ(sup × UF/m² nuevo) ÷ Σ sup (`AT59 = CC70/AN59`);
 *   UF/m² = Σ UF ÷ Σ sup (`BD59`, la misma regla que la fila TASACIÓN de los
 *   comparables); D.F. = UF/m² ÷ UF/m² nuevo (`AX59`).
 * - Obras complementarias: UF/m² nuevo = Σ UF ÷ Σ sup (`AT60`).
 * - Terreno: UF/m² = Σ UF ÷ Σ sup (`BD61`).
 *
 * Las celdas que la planilla deja vacías o en 0 en cada renglón quedan `null`.
 */
export function totalesCuadro(items: readonly ItemCuadroInforme[]): TotalesCuadroInforme {
  const edif = items.filter((i) => esTipo(i, 'Edificacion'))
  const terr = items.filter((i) => esTipo(i, 'Terreno'))
  const oocc = items.filter((i) => !esTipo(i, 'Edificacion') && !esTipo(i, 'Terreno'))

  const anios = items.map((i) => i.anio).filter((a): a is number => a !== null && a > 0)
  const edificacion = totalBase(edif)
  const nuevoEdif = sumar(edif, (i) =>
    i.supM2 === null || i.ufM2Aplicado === null ? null : i.supM2 * i.ufM2Aplicado,
  )
  edificacion.anio = anios.length > 0 ? Math.min(...anios) : null
  edificacion.ufM2Nuevo = cociente(nuevoEdif, edificacion.supM2)
  edificacion.ufM2 = ufM2ConstruccionTasacion(
    edif.map((i) => ({ tipo: 'Edificacion', supM2: i.supM2, ufTotal: i.ufTotalItem })),
    null,
    null,
  )
  edificacion.factor =
    edificacion.ufM2 !== null && edificacion.ufM2Nuevo ? edificacion.ufM2 / edificacion.ufM2Nuevo : null

  const obrasComplementarias = totalBase(oocc)
  obrasComplementarias.ufM2Nuevo = cociente(obrasComplementarias.ufTotal, obrasComplementarias.supM2)

  const terreno = totalBase(terr)
  terreno.ufM2 = cociente(terreno.ufTotal, terreno.supM2)

  return { edificacion, obrasComplementarias, terreno }
}
