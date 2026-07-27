import { listRecords } from '@/lib/airtable-client'

/**
 * Catálogos maestros leídos desde Airtable (RF-04 · Tanda E, 27-jul-2026).
 *
 * ## Por qué existe este archivo
 *
 * Los selects "Cliente", "Tipo de informe", "Tipo de propiedad", "Producto" y
 * "Banco financista" alimentaban sus opciones desde listas **hardcodeadas** en
 * `lib/console-data.ts`. Esas listas se escribieron desde el mock v0 y nunca se
 * contrastaron contra las tablas maestras, así que divergieron:
 *
 * | Select | Valor que enviaba la consola | Existe en Airtable |
 * |---|---|---|
 * | Cliente | `Banco Santander` | ❌ (`M_Clientes` tiene `Santander Hipotecaria`) |
 * | Tipo de informe | `Tasación hipotecaria` | ❌ (`M_TiposInforme` tiene `Mutuo Hipotecario`) |
 * | Producto | `hipotecario` | ❌ (`M_Productos` tiene `Credito Hipotecario`) |
 * | Banco financista | `BCI`, `Itaú`, `Scotiabank` | ❌ (`M_Bancos` tiene `Banco BCI`, `Banco Itau`, `Scotiabank Chile`) |
 *
 * SC01 resuelve cada uno de esos campos con un `Search Records` de fórmula
 * `UPPER({nombre}) = UPPER("{{1.<clave>}}")` y **maxRecords 1**. Cuando el
 * Search no encuentra nada, Make no falla: devuelve cero bundles y el módulo 7
 * escribe el link vacío. Por eso la solicitud VP-2026-0044 se creó con
 * `cliente`, `tipo_informe` y `producto` en blanco sin ningún error visible.
 *
 * **Decisión (27-jul-2026)**: los 5 catálogos que alimentan un Search de SC01
 * se leen de Airtable en tiempo de ejecución. Una opción que la Ejecutiva puede
 * elegir es, por construcción, una fila que existe. Lo que se sigue
 * hardcodeando en `lib/console-data.ts` son sólo los catálogos que espejan un
 * `singleSelect` (ahí el slug ES el contrato y vive en el schema del campo, no
 * en una tabla).
 *
 * ## Reglas que no son obvias
 *
 * 1. **Se devuelve el `nombre`, no el `id`.** Podría parecer más robusto mandar
 *    el `recXXX` y saltarse los Search, pero eso obliga a reescribir 5 módulos
 *    del blueprint y a que la UI conozca record IDs de Airtable. El contrato de
 *    SC01 es por nombre; este módulo se limita a garantizar que el nombre que
 *    viaja existe.
 * 2. **Se filtra por `activo = TRUE()`.** Las 5 tablas arrastran filas basura de
 *    importaciones viejas (`M_Clientes` tiene una fila literal `nombre` con el
 *    BOM del CSV). Ninguna tiene `activo` marcado.
 * 3. **Se deduplica por nombre en mayúsculas.** `M_TiposPropiedad` tiene
 *    `DEPARTAMENTO` y `Departamento` como filas distintas, y `M_Clientes` tiene
 *    ~12 pares equivalentes. Para el Search da igual cuál gane (la fórmula es
 *    `UPPER(...) = UPPER(...)` con maxRecords 1), pero un dropdown con la misma
 *    opción dos veces es un bug de cara a la Ejecutiva.
 * 4. **Caché en memoria de 5 minutos.** Abrir el panel de alta dispara 5
 *    lecturas; sin caché, cada apertura consume 5 requests del rate limit de
 *    Airtable para datos que cambian una vez al mes. La caché es por proceso —
 *    en Railway con más de una réplica cada una tiene la suya, lo que es
 *    correcto: el peor caso es ver un catálogo 5 minutos desactualizado.
 *
 * @see docs/_notas/DELTA-SC01_20260727.md — contrato de claves del webhook
 */

/** Tablas maestras que alimentan un `Search Records` de SC01. */
const TABLAS = {
  clientes: 'tblpK7AcYBMH93apK',
  tiposInforme: 'tblOcsdiwxQLfD178',
  tiposPropiedad: 'tbl8rxZA14xFIBGU6',
  productos: 'tbll6D4KQ5aDdjjaj',
  bancos: 'tblGlYuJo5AeMehhs',
} as const

export type ClaveCatalogo = keyof typeof TABLAS

/**
 * Opción de catálogo. `id` es el record ID de Airtable y sólo se usa como
 * `key` de React; el valor que viaja a Make es siempre `nombre`.
 */
export interface OpcionMaestra {
  id: string
  nombre: string
}

export type Catalogos = Record<ClaveCatalogo, OpcionMaestra[]>

interface FilaMaestra {
  nombre?: string
  activo?: boolean
}

const TTL_MS = 5 * 60 * 1000

let cache: { valor: Catalogos; expira: number } | null = null

/** Normaliza para deduplicar con el mismo criterio que la fórmula del Search. */
function claveDedupe(nombre: string): string {
  return nombre.trim().toUpperCase()
}

async function fetchTabla(tableId: string): Promise<OpcionMaestra[]> {
  const registros = await listRecords<FilaMaestra>(tableId, {
    fields: ['nombre', 'activo'],
    filterByFormula: '{activo} = TRUE()',
  })

  const vistos = new Set<string>()
  const opciones: OpcionMaestra[] = []

  for (const r of registros) {
    const nombre = r.fields.nombre?.trim()
    if (!nombre) continue

    const clave = claveDedupe(nombre)
    if (vistos.has(clave)) continue
    vistos.add(clave)

    opciones.push({ id: r.id, nombre })
  }

  return opciones.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

/**
 * Lee los 5 catálogos maestros. Las lecturas van en paralelo: son
 * independientes entre sí y el panel de alta las necesita todas antes de poder
 * renderizar la Sección A.
 *
 * Propaga el error si alguna tabla falla — un catálogo a medias es peor que
 * ninguno: la Ejecutiva elegiría de una lista incompleta creyéndola completa.
 */
export async function fetchCatalogos(): Promise<Catalogos> {
  const ahora = Date.now()
  if (cache && cache.expira > ahora) return cache.valor

  const claves = Object.keys(TABLAS) as ClaveCatalogo[]
  const listas = await Promise.all(claves.map((k) => fetchTabla(TABLAS[k])))

  const valor = Object.fromEntries(
    claves.map((k, i) => [k, listas[i]]),
  ) as Catalogos

  cache = { valor, expira: ahora + TTL_MS }
  return valor
}

/** Invalida la caché. Sólo para tests. */
export function _resetCacheCatalogos(): void {
  cache = null
}
