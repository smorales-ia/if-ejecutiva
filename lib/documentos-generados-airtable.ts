import { listRecords } from '@/lib/airtable-client'
import {
  mapDocumentoGenerado,
  ordenarVersiones,
  type DocumentoGeneradoFields,
  type VersionInformeGenerado,
} from '@/lib/documentos-generados'

// TX_DocumentosGenerados verificada vía REST contra el schema vivo (11-ago-2026).
export const TX_DOCUMENTOS_GENERADOS = 'tbl5sYnGPZXgYCBSY'

/**
 * Versiones del informe de una solicitud (§1.3.4 · RN-56).
 *
 * ## Por qué se filtra por dos vías y no por el Link
 *
 * La tabla tiene un campo Link `solicitud`, pero **la única fila que existe hoy
 * en la base lo tiene vacío**: su referencia a la solicitud vive dentro de
 * `clave_natural` (`"METLIFE-6283|doc|preliminar|v1"`). Es el mismo patrón que
 * `A_DecisionesMotor`. Filtrar sólo por el Link devolvería cero filas siempre y
 * el fallo sería silencioso: cero filas se lee como "no hay informes".
 *
 * Se consultan las dos vías con un `OR`: `ARRAYJOIN({solicitud})` —que dentro de
 * una fórmula se evalúa contra el primary field, o sea el código (E-076)— y la
 * subcadena del código dentro de `clave_natural`, delimitada por la barra que
 * usa esa clave para separar sus segmentos. La delimitación importa por la misma
 * razón que en `A_Eventos`: sin ella, `VP-2026-0054` matchearía dentro de
 * `VP-2026-00541` el día que el correlativo crezca.
 *
 * Devuelve `[]` cuando el pipeline PDF todavía no generó nada, que es el caso de
 * prácticamente toda la cartera. El consumidor debe distinguirlo de un fallo.
 */
export async function fetchVersionesInforme(
  codigoSolicitud: string
): Promise<VersionInformeGenerado[]> {
  if (!codigoSolicitud || codigoSolicitud.includes('"')) return []

  const codigo = codigoSolicitud.replace(/"/g, '\\"')
  const formula =
    `OR(` +
    `ARRAYJOIN({solicitud})="${codigo}",` +
    `FIND("${codigo}|", {clave_natural})=1` +
    `)`

  const records = await listRecords<DocumentoGeneradoFields>(
    TX_DOCUMENTOS_GENERADOS,
    {
      filterByFormula: formula,
      fields: [
        'version_doc',
        'version',
        'generado_en',
        'fecha_generacion',
        'motivo_regeneracion',
        'url_pdf',
        'url_dropbox',
        'es_vigente',
        'paginas_count',
        'clave_natural',
        'solicitud',
      ],
    }
  )

  return ordenarVersiones(
    records.map((r) => mapDocumentoGenerado(r.id, r.fields))
  )
}
