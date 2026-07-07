import { listRecords } from '@/lib/airtable-client'

// M_Tasadores verified via MCP 2026-07-04
export const M_TASADORES = 'tblEi5jp18c1j00bQ'

export interface Tasador {
  id: string
  nombre: string
  capacidadActiva: number
}

type RawFields = {
  nombre?: string
  capacidad_activa?: string
}

/**
 * H-05: `disponible` y `casos_en_curso` aún no existen en M_Tasadores (04-jul-2026).
 * Fallback documentado: activo=TRUE, orden por capacidad_activa descendente.
 */
export async function fetchTasadores(): Promise<Tasador[]> {
  const records = await listRecords<RawFields>(M_TASADORES, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: '{activo}=TRUE()',
    'sort[0][field]': 'capacidad_activa',
    'sort[0][direction]': 'desc',
    fields: ['nombre', 'capacidad_activa'],
  })

  return records.map((r) => ({
    id: r.id,
    nombre: r.fields.nombre ?? '—',
    capacidadActiva: Number(r.fields.capacidad_activa ?? 0),
  }))
}
