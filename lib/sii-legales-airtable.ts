/**
 * Lectura server-side de «Datos SII» y «Antecedentes legales» para la consola.
 *
 * server-only: usa el cliente REST de Airtable (token en el servidor). Las tres
 * tablas se filtran por el Link `solicitud`, cuyo valor primario es el código
 * (`VP-AAAA-NNNN`) — mismo filtro que `filasDeSolicitud` en
 * `lib/tasador/lectura-informe.ts`.
 */

import { listRecords } from '@/lib/airtable-client'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import {
  construirSiiLegales,
  type FilaDatosSii,
  type FilaLegales,
  type FilaUnidadSii,
  type SiiLegales,
} from '@/lib/sii-legales'

function porSolicitud(codigo: string) {
  return { filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"` }
}

export async function fetchSiiLegales(codigo: string): Promise<SiiLegales> {
  const [unidades, datos, legales] = await Promise.all([
    listRecords<Omit<FilaUnidadSii, 'id'>>(TABLE_IDS.unidades, porSolicitud(codigo)),
    listRecords<FilaDatosSii>(TABLE_IDS.datosTasacion, porSolicitud(codigo)),
    listRecords<FilaLegales>(TABLE_IDS.documentosLegales, porSolicitud(codigo)),
  ])

  return construirSiiLegales(
    unidades.map((r) => ({ id: r.id, ...r.fields })),
    datos[0]?.fields ?? null,
    legales[0]?.fields ?? null,
  )
}
