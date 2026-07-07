import { listRecords } from '@/lib/airtable-client'

// M_Visadores verified via MCP 2026-07-04
export const M_VISADORES = 'tbludtgDtHWvt0Q3D'

export interface Visador {
  id: string
  nombre: string
  casosEnCola: number
}

type RawFields = {
  nombre?: string
  casos_en_cola?: string
}

/** Filtro activo=TRUE, orden por casos_en_cola ascendente (menos cargado primero). */
export async function fetchVisadores(): Promise<Visador[]> {
  const records = await listRecords<RawFields>(M_VISADORES, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: '{activo}=TRUE()',
    'sort[0][field]': 'casos_en_cola',
    'sort[0][direction]': 'asc',
    fields: ['nombre', 'casos_en_cola'],
  })

  return records.map((r) => ({
    id: r.id,
    nombre: r.fields.nombre ?? '—',
    casosEnCola: Number(r.fields.casos_en_cola ?? 0),
  }))
}
