/**
 * Contrato de las versiones del informe (§1.3.4 · RN-56).
 *
 * ## Qué es una "versión" y qué no
 *
 * La operación real produce un Excel de cálculo y hasta tres PDF sucesivos por
 * tasación, y el negocio necesita comparar entre versiones. Esas versiones viven
 * en **`TX_DocumentosGenerados`** —una fila por PDF generado, con su
 * `version_doc`— y las escribe el pipeline PDF (E1/E2/E3), no IF-02.
 *
 * **`TX_Adjuntos` no tiene ningún campo de versión** y no lo tendrá: sus filas
 * son antecedentes *de entrada* (certificados, planos, escrituras) que no
 * pertenecen a ninguna versión del informe. Agrupar los adjuntos "por versión"
 * exigiría inventar la pertenencia. Por eso la pestaña muestra dos secciones
 * separadas y no una agrupación forzada.
 *
 * ## Por qué este módulo no toca Airtable
 *
 * Lo consumen el Route Handler (server) y la pestaña (cliente). Misma
 * separación que `lib/decision-motor.ts` / `lib/decision-motor-airtable.ts`.
 */

export interface VersionInformeGenerado {
  id: string
  /** `version_doc`, o `version` como respaldo. */
  numero: number
  /** Fecha de generación, ya formateada. */
  generadoEl?: string
  /** `motivo_regeneracion` — por qué se rehízo respecto de la versión previa. */
  motivoCambio?: string
  /** Enlace al PDF (Dropbox o el `url_pdf` directo). */
  urlPdf?: string
  /** `es_vigente` — la versión que está en circulación. */
  vigente: boolean
  /** Número de páginas, cuando el pipeline lo registró. */
  paginas?: number
}

export const MSG_SIN_VERSIONES =
  'Todavía no se ha generado ningún informe para esta solicitud.'

export const MSG_ERROR_VERSIONES =
  'No pudimos cargar las versiones del informe. Intenta nuevamente en unos segundos.'

/** Campos de `TX_DocumentosGenerados` que consume este mapeo. */
export interface DocumentoGeneradoFields {
  version_doc?: number
  version?: number
  generado_en?: string
  fecha_generacion?: string
  motivo_regeneracion?: string
  url_pdf?: string
  url_dropbox?: string
  es_vigente?: boolean
  paginas_count?: number
  clave_natural?: string
  solicitud?: string[]
}

function formatearInstante(valor: string | undefined): string | undefined {
  if (!valor) return undefined
  const d = new Date(valor)
  if (isNaN(d.getTime())) return undefined
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santiago',
  })
}

/**
 * Traduce una fila de `TX_DocumentosGenerados` al contrato de pantalla.
 *
 * ⚠ **El valor en UF por versión no se mapea, y es deliberado.** §1.3.4 lo pide,
 * pero `TX_DocumentosGenerados` no tiene ninguna columna que lo guarde: el valor
 * vive en `TX_Solicitudes`/`TX_Calculos` y refleja el estado *actual*, no el que
 * tenía la solicitud cuando se emitió la versión 1. Mostrar el valor de hoy
 * junto a la versión de hace un mes sería afirmar algo falso —justo lo contrario
 * de lo que RN-56 quiere, que es comparar el valor informado entre versiones—.
 * Recuperarlo exige un campo nuevo en esa tabla, que es decisión de Sergio.
 */
export function mapDocumentoGenerado(
  id: string,
  f: DocumentoGeneradoFields
): VersionInformeGenerado {
  return {
    id,
    numero: f.version_doc ?? f.version ?? 0,
    generadoEl: formatearInstante(f.generado_en ?? f.fecha_generacion),
    motivoCambio: f.motivo_regeneracion?.trim() || undefined,
    urlPdf: f.url_pdf?.trim() || f.url_dropbox?.trim() || undefined,
    vigente: Boolean(f.es_vigente),
    paginas: typeof f.paginas_count === 'number' ? f.paginas_count : undefined,
  }
}

/** Versiones de la más reciente a la más antigua. */
export function ordenarVersiones(
  versiones: VersionInformeGenerado[]
): VersionInformeGenerado[] {
  return versiones.slice().sort((a, b) => b.numero - a.numero)
}
