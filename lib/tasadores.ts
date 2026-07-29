import { listRecords } from '@/lib/airtable-client'

// M_Tasadores verified via MCP 2026-07-04
export const M_TASADORES = 'tblEi5jp18c1j00bQ'

export interface Tasador {
  id: string
  nombre: string
  capacidadActiva: number
  email: string
  /**
   * Comunas que cubre, resueltas desde el link `zonas_cobertura` → `M_Comunas`.
   * Vacío significa **"no declarado"**, no "no cubre nada": ~la mitad del
   * padrón (los tasadores heredados, de correo personal) no la tiene poblada.
   * La UI no debe ocultarlos por eso — ver el badge "fuera de cobertura".
   */
  zonas: string[]
  /** `zona_principal`, texto libre tipo "RM Centro". Referencial. */
  zonaPrincipal: string
}

type RawFields = {
  nombre?: string
  capacidad_activa?: string
  email?: string
  zonas_cobertura?: string
  zona_principal?: string
}

/**
 * Tasadores activos, ordenados por capacidad descendente.
 *
 * H-05 (04-jul-2026) daba por inexistentes `zonas_cobertura` y `casos_en_curso`.
 * Revisado el 29-jul-2026 contra el schema real: **`zonas_cobertura` sí existe**
 * (`fldg8ftPbF22fFjMi`, link → `M_Comunas`) y `capacidad_activa` también; la
 * que no existe es `casos_en_curso`, así que el orden por carga sigue siendo
 * por capacidad y no por casos abiertos. La parte de H-05 que queda viva es
 * sólo esa.
 *
 * Con `cellFormat: 'string'` un campo Link llega como los primary fields
 * separados por coma — aquí, nombres de comuna.
 */
export async function fetchTasadores(): Promise<Tasador[]> {
  const records = await listRecords<RawFields>(M_TASADORES, {
    cellFormat: 'string',
    timeZone: 'America/Santiago',
    userLocale: 'es-CL',
    filterByFormula: '{activo}=TRUE()',
    'sort[0][field]': 'capacidad_activa',
    'sort[0][direction]': 'desc',
    fields: ['nombre', 'capacidad_activa', 'email', 'zonas_cobertura', 'zona_principal'],
  })

  return records.map((r) => ({
    id: r.id,
    nombre: r.fields.nombre ?? '—',
    capacidadActiva: Number(r.fields.capacidad_activa ?? 0),
    email: r.fields.email ?? '',
    zonas: (r.fields.zonas_cobertura ?? '')
      .split(',')
      .map((z) => z.trim())
      .filter((z) => z !== ''),
    zonaPrincipal: r.fields.zona_principal ?? '',
  }))
}
