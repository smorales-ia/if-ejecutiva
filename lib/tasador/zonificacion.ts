/**
 * Catálogo de zonas del plan regulador por comuna (`M_Zonificacion`) —
 * **módulo server-only** (convención de `lectura-tasacion.ts`: importa
 * `lib/airtable-client`).
 *
 * Spec §2.8.1 · «Zona de la propiedad» (14-oct-2026). Replica la lista
 * desplegable de la planilla: `[Excel: Portada!AA21]` valida contra el nombre
 * `ZoneVal`, que es la columna «Zona» de la hoja `Zonificacion` filtrada por la
 * comuna de la solicitud.
 *
 * ## Filtro: el Link `comuna`, y `clave_zona` de respaldo
 *
 * Una fila es de la comuna si su Link `M_Zonificacion.comuna` apunta a ella
 * **o** si su clave de la planilla, `clave_zona = comuna & zona`
 * (`[Excel: Zonificacion!AE = B & C]`), empieza con el nombre de la comuna.
 *
 * - El Link es la fuente buena: el saneo T-SANEO-ZONIFICACION-20261014 lo
 *   resuelve por nombre y cubre las comunas cuya clave no calza con el nombre
 *   de `M_Comunas` (`Coihaique` → Coyhaique, `Llaillay` → Llay-Llay, `Maria
 *   Pinto`, y `Pedro Aguirre Cerda` escrito con espacio duro U+00A0).
 * - `clave_zona` queda de respaldo para filas que se carguen sin Link y para
 *   que el orden «código desplegado / saneo aplicado» no deje listas vacías.
 *   Ver `docs/schema-airtable.md` §30.
 *
 * Las localidades (Ventanas, Maitencillo, Horcón…) quedan **sin** Link a
 * propósito: copian las zonas de Puchuncaví y, enlazadas, la lista guardaría
 * el recordId de una copia elegida por el orden de Airtable.
 *
 * No se filtra por `activo`.
 */

import { listRecords } from '@/lib/airtable-client'
import { TABLE_IDS } from './field-ids'
import { codigoDeZona, normalizarNombre, type ZonaCatalogo, zonaEnCatalogo } from './zona'

const TTL_MS = 5 * 60 * 1000

const cache = new Map<string, { valor: ZonaCatalogo[]; expira: number }>()

/** Invalida la caché. Sólo para tests. */
export function _resetCacheZonificacion(): void {
  cache.clear()
}

/** Literal de cadena para `filterByFormula`: comillas dobles escapadas. */
function literal(valor: string): string {
  return `"${valor.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/** Orden de la planilla: A1, A2 … A10a, A10b, B1a — numérico dentro del texto. */
function porCodigo(a: ZonaCatalogo, b: ZonaCatalogo): number {
  return a.zona.localeCompare(b.zona, 'es', { numeric: true, sensitivity: 'base' })
}

/**
 * Zonas del catálogo para la comuna, ordenadas y sin duplicados. Comuna vacía
 * o placeholder (`—`) → lista vacía, sin consultar.
 */
export async function zonasDeComuna(comuna: string): Promise<ZonaCatalogo[]> {
  const nombre = comuna.trim()
  if (nombre === '' || nombre === '—') return []

  const clave = normalizarNombre(nombre)
  const ahora = Date.now()
  const enCache = cache.get(clave)
  if (enCache && enCache.expira > ahora) return enCache.valor

  const lit = literal(nombre)
  const registros = await listRecords<{ zona?: string }>(TABLE_IDS.zonificacion, {
    fields: ['zona'],
    filterByFormula:
      `AND({zona}!="",OR(` +
      `LOWER(ARRAYJOIN({comuna}))=LOWER(${lit}),` +
      `LOWER({clave_zona})=LOWER(${lit}&{zona})))`,
  })

  const vistos = new Set<string>()
  const valor: ZonaCatalogo[] = []
  for (const r of registros) {
    const zona = r.fields.zona?.trim()
    if (!zona) continue
    const k = normalizarNombre(zona)
    if (vistos.has(k)) continue
    vistos.add(k)
    valor.push({ id: r.id, zona })
  }
  valor.sort(porCodigo)

  cache.set(clave, { valor, expira: ahora + TTL_MS })
  return valor
}

/**
 * `zonasDeComuna` que **no lanza**: la lista es una ayuda, y sin ella el
 * tasador igual puede escribir la zona a mano.
 */
export async function zonasDeComunaSinFallar(comuna: string): Promise<ZonaCatalogo[]> {
  try {
    return await zonasDeComuna(comuna)
  } catch (err) {
    console.error('[zonificacion] no se pudo leer M_Zonificacion para', comuna, err)
    return []
  }
}

/**
 * Lo que el `PATCH` de `/datos` guarda para la zona: el código normalizado
 * (`tipo_zona_descripcion`) y el recordId de `M_Zonificacion` cuando el código
 * está en el catálogo de la comuna (`zonificacion`), o `null` si no está.
 *
 * Los dos salen del mismo texto y de la misma lectura, así que no pueden
 * contradecirse. Si el catálogo no se puede leer, **el guardado no falla**: se
 * guarda el código y `zonificacionId` sale `undefined` —«no se sabe»—, para que
 * un error transitorio no borre un Link que estaba bien.
 */
export async function resolverZona(
  texto: string,
  comuna: string,
): Promise<{ codigo: string; zonificacionId: string | null | undefined }> {
  let catalogo: ZonaCatalogo[]
  try {
    catalogo = await zonasDeComuna(comuna)
  } catch (err) {
    console.error('[zonificacion] no se pudo leer M_Zonificacion para', comuna, err)
    return { codigo: codigoDeZona(texto, comuna), zonificacionId: undefined }
  }
  const codigo = codigoDeZona(texto, comuna, catalogo)
  return { codigo, zonificacionId: zonaEnCatalogo(codigo, catalogo)?.id ?? null }
}
