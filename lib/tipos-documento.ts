import { listRecords } from '@/lib/airtable-client'
import type { TipoDocumento } from '@/lib/console-data'

// D_TipoDocumento verified via MCP 2026-07-08
export const D_TIPO_DOCUMENTO = 'tblkPhBnpdDmUWOl3'

export interface FetchTiposDocumentoResult {
  data: TipoDocumento[]
  degraded: boolean
}

type RawFields = {
  codigo?: string
  nombre?: string
  entidad_emisora?: string
  vigencia_dias?: string
}

const TIPO_DOCUMENTO_FIELDS: string[] = [
  'codigo',
  'nombre',
  'entidad_emisora',
  'vigencia_dias',
]

function mapRecord(id: string, f: RawFields): TipoDocumento {
  return {
    id,
    codigo: f.codigo ?? '',
    nombre: f.nombre ?? '',
    entidad_emisora: f.entidad_emisora ?? '',
    vigencia_dias: f.vigencia_dias ? Number(f.vigencia_dias) : null,
  }
}

/**
 * Sin `revalidate` propio: reutiliza el mismo patrón sin caché (`cache: 'no-store'`)
 * de `lib/airtable-client.ts` que ya usa `fetchSolicitudes` en `lib/solicitudes.ts` —
 * consistente con el resto de la app y más que suficiente para un catálogo
 * paramétrico de 9 filas que casi no cambia.
 */
export async function fetchTiposDocumento(): Promise<FetchTiposDocumentoResult> {
  try {
    const records = await listRecords<RawFields>(D_TIPO_DOCUMENTO, {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      filterByFormula: '{activo} = TRUE()',
      'sort[0][field]': 'nombre',
      'sort[0][direction]': 'asc',
      fields: TIPO_DOCUMENTO_FIELDS,
    })
    return { data: records.map((r) => mapRecord(r.id, r.fields)), degraded: false }
  } catch (err) {
    console.error('[fetchTiposDocumento]', err)
    return { data: [], degraded: true }
  }
}
