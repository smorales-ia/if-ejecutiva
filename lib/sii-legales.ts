/**
 * Bloques «Datos SII» y «Antecedentes legales» de la pestaña Datos de la consola
 * (IF-02) — **lógica pura, sin Airtable**.
 *
 * Reemplaza a `mockDatosSii` / `mockAntecedentesLegales`, que inventaban los
 * valores («1.200 UF», «N° 108-2009», «Fojas 12.345») y los mostraban como si
 * fueran de la solicitud (hallazgo VP-2026-0079, PRD R3 ·
 * `docs/_planes/PRD_T-UNIDADES-SII-REGLA-20261014.md`). Aquí sólo se da formato a
 * lo que existe; donde no hay dato se muestra «—». La lectura vive en
 * `lib/sii-legales-airtable.ts` (server-only).
 *
 * Importable desde componentes cliente: no toca `lib/airtable-client`.
 */

import { formatearFecha } from "@/lib/fechas"

export const SIN_DATO = "—"

/** RN-37: el SII no registra avalúo para el predio. */
export const NO_REGISTRA = "NO REGISTRA"

export interface DatosSiiUnidad {
  unidadId: string
  ubicacion: string
  /** `TX_Unidades.subtipo` (Casa, Departamento, Estacionamiento…). */
  tipo: string
  codigoSii: string
  /** `TX_Unidades.avaluo_clp`, en pesos como lo imprime el certificado. */
  avaluoFiscal: string
}

export interface DatosSii {
  destinoPrincipal: string
  unidades: DatosSiiUnidad[]
  avaluoTotal: string
  contribucionAnual: string
  /**
   * `TX_DatosTasacion.sup_construccion_m2`: la fuente única de la superficie
   * construida (T-SUPERFICIES-CONSOLIDADAS-20261014). La llena la lectura de
   * documentos (AT03-Ext v5) y la corrige el tasador; formulario, motor y PDF
   * leen la misma. `null` sin dato.
   */
  supConstruccionM2: number | null
}

export interface AntecedentesLegales {
  permisoEdificacion: string
  fechaPermiso: string
  recepcionFinal: string
  fechaRecepcion: string
  fojas: string
  numeroInscripcion: string
  anioInscripcion: string
}

export interface SiiLegales {
  sii: DatosSii
  legales: AntecedentesLegales
}

/** Fila cruda de `TX_Unidades` con los campos que usa este bloque. */
export interface FilaUnidadSii {
  id: string
  numero_unidad?: unknown
  subtipo?: unknown
  rol_sii?: unknown
  avaluo_clp?: unknown
  orden?: unknown
}

/** Fila cruda de `TX_DatosTasacion` (1:1 por solicitud). */
export interface FilaDatosSii {
  destino_sii?: unknown
  contribucion_anual?: unknown
  avaluo_fiscal_clp?: unknown
  avaluo_total?: unknown
  avaluo_no_registra?: unknown
  sup_construccion_m2?: unknown
}

/** Fila cruda de `TX_DocumentosLegales` (1:1 por solicitud). */
export interface FilaLegales {
  permiso_edificacion_numero?: unknown
  permiso_edificacion_fecha?: unknown
  recepcion_final_numero?: unknown
  recepcion_final_fecha?: unknown
  fojas?: unknown
  numero_inscripcion?: unknown
  ano_inscripcion?: unknown
}

function texto(v: unknown): string {
  if (v === null || v === undefined) return SIN_DATO
  const s = String(v).trim()
  return s === "" ? SIN_DATO : s
}

function numero(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

/** Número > 0, o `null` (cero cuenta como «sin dato»: así lo deja el alta antigua). */
function positivo(v: unknown): number | null {
  const n = numero(v)
  return n !== null && n > 0 ? n : null
}

/**
 * Superficie construida que muestra la consola: la de `TX_DatosTasacion` (fuente
 * única, la misma del formulario del tasador, el motor y el PDF) y, si aún no
 * hay, la columna antigua `TX_Solicitudes.sup_construccion_m2` —que ya no tiene
 * escritor y sólo trae dato en solicitudes viejas—.
 */
export function superficieConstruidaVigente(
  sii: Pick<DatosSii, "supConstruccionM2">,
  legadoSolicitud: number | null | undefined,
): number | null {
  if (sii.supConstruccionM2 !== null) return sii.supConstruccionM2
  return legadoSolicitud != null && legadoSolicitud > 0 ? legadoSolicitud : null
}

/** Pesos chilenos sin decimales: `$339.809.429`. Cero o vacío → «—». */
export function formatoPesos(v: unknown): string {
  const n = numero(v)
  if (n === null || n === 0) return SIN_DATO
  return `$${Math.round(n).toLocaleString("es-CL")}`
}

/** `2020-09-09` → `09/09/2020` (formato único de fecha, PRD «Temas 1» R4). */
export function formatoFecha(v: unknown): string {
  if (typeof v !== "string") return SIN_DATO
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v.trim())
  return m ? formatearFecha(`${m[1]}-${m[2]}-${m[3]}`) : SIN_DATO
}

/**
 * Arma los dos bloques a partir de las filas reales. Sin filas, todo queda en
 * «—»: no se inventa nada.
 *
 * Avalúo total (RN-48 · spec §4.3.1): la suma de los avalúos de las unidades
 * cuando al menos una lo tiene («manda el certificado»); si no, el de la
 * solicitud (`avaluo_fiscal_clp`, entrada del motor) y en último caso
 * `avaluo_total` de la consulta de antecedentes. Con `avaluo_no_registra`
 * (RN-37) se muestra el literal «NO REGISTRA».
 */
export function construirSiiLegales(
  unidades: readonly FilaUnidadSii[],
  datos: FilaDatosSii | null,
  legales: FilaLegales | null,
): SiiLegales {
  const ordenadas = [...unidades].sort(
    (a, b) =>
      (numero(a.orden) ?? Number.POSITIVE_INFINITY) -
      (numero(b.orden) ?? Number.POSITIVE_INFINITY),
  )

  const avaluosUnidades = ordenadas
    .map((u) => numero(u.avaluo_clp))
    .filter((n): n is number => n !== null && n > 0)
  const sumaUnidades = avaluosUnidades.reduce((acc, n) => acc + n, 0)

  let avaluoTotal: string
  if (datos?.avaluo_no_registra === true) {
    avaluoTotal = NO_REGISTRA
  } else if (sumaUnidades > 0) {
    avaluoTotal = formatoPesos(sumaUnidades)
  } else if (numero(datos?.avaluo_fiscal_clp)) {
    avaluoTotal = formatoPesos(datos?.avaluo_fiscal_clp)
  } else {
    avaluoTotal = formatoPesos(datos?.avaluo_total)
  }

  const anio = numero(legales?.ano_inscripcion)

  return {
    sii: {
      destinoPrincipal: texto(datos?.destino_sii),
      unidades: ordenadas.map((u) => ({
        unidadId: u.id,
        ubicacion: texto(u.numero_unidad),
        tipo: texto(u.subtipo),
        codigoSii: texto(u.rol_sii),
        avaluoFiscal: formatoPesos(u.avaluo_clp),
      })),
      avaluoTotal,
      contribucionAnual: formatoPesos(datos?.contribucion_anual),
      supConstruccionM2: positivo(datos?.sup_construccion_m2),
    },
    legales: {
      permisoEdificacion: texto(legales?.permiso_edificacion_numero),
      fechaPermiso: formatoFecha(legales?.permiso_edificacion_fecha),
      recepcionFinal: texto(legales?.recepcion_final_numero),
      fechaRecepcion: formatoFecha(legales?.recepcion_final_fecha),
      fojas: texto(legales?.fojas),
      numeroInscripcion: texto(legales?.numero_inscripcion),
      anioInscripcion: anio !== null ? String(anio) : SIN_DATO,
    },
  }
}

/** Bloques vacíos: lo que se pinta mientras carga, sin datos o en el detalle demo. */
export const SII_LEGALES_VACIO: SiiLegales = construirSiiLegales([], null, null)
