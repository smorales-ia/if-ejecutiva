/**
 * Lectura de las fotos de la visita desde `TX_Adjuntos`. **Módulo server-only.**
 *
 * Tanda P7-TAS.A.4 · decisión **D-1 · opción A**. Nace de extraer la proyección
 * del `GET /api/tasaciones/[id]/fotos` para que los Server Components de
 * `app/tasaciones/[id]/fotos/page.tsx` y `app/tasaciones/[id]/page.tsx` la
 * consuman **directo**, sin dar el rodeo por HTTP contra su propia app.
 *
 * Es el tercer módulo de la familia que abrió `lectura-tasacion.ts` (CI-030) y
 * continuó `lectura-datos.ts` (P7-TAS.A.1): **una sola proyección con dos
 * consumidores** —la pantalla y el Route Handler— de modo que no puedan
 * divergir. El `GET` sigue existiendo y sigue devolviendo lo mismo byte a byte;
 * lo que deja de existir es la segunda implementación.
 *
 * ⚠ El `server-only` es **convención, no `import 'server-only'`**: ese paquete
 * no está en `package.json`. Ver el docblock de `lectura-tasacion.ts`. Quien
 * importe esto desde un componente cliente rompe el build al arrastrar
 * `lib/airtable-client`.
 *
 * ## Qué cierra
 *
 * - **H-4** · la pantalla de fotos no se hidrataba desde el servidor: montaba
 *   vacía y esperaba al `useEffect`. Con el reparto ya resuelto en el server, el
 *   primer render ya trae las fotos.
 * - **H-5** · `fotos-screen` inicializaba su estado con
 *   `readPayload(id) ?? resolverInforme(tasacion)` y **sembraba un borrador en
 *   blanco** que tapaba la hidratación del formulario. Ver el docblock de
 *   `recuperacion-borrador.ts`.
 * - **H-1** · sin secciones A–H hidratadas, `dormitorios` valía `''` y
 *   `resolverMinimo('habitaciones')` devolvía **0**: una casa de 5 dormitorios
 *   se daba por completa sin una sola foto. Lo cierra la página al componer
 *   `informeInicial`, pero es esta proyección la que lo hace posible sin un
 *   segundo viaje.
 *
 * ## Tensión de nombre, declarada
 *
 * Un módulo llamado `lectura-fotos` exporta `SUBIDO_POR_TASADOR`, que el `PATCH`
 * de la ruta usa para **escribir**. Es deliberado y es la misma razón que
 * `lectura-datos.ts` declara para `TIPO_RECINTO`: el literal es la **bisagra**
 * entre las dos direcciones —el `GET` filtra por él y el `PATCH` lo reescribe— y
 * duplicarlo es exactamente cómo lectura y escritura se desincronizan. Acá el
 * riesgo está documentado en el propio literal: hay dos opciones en el
 * `singleSelect` que sólo difieren en la mayúscula, y escribir la equivocada
 * hace desaparecer la foto sin error.
 */

import { listRecords } from '@/lib/airtable-client'
import type { InformeData } from '@/lib/tasador/tasaciones'
import { repartirFotos } from '@/lib/tasador/reparto-fotos'
import { autorizarSolicitud, type SolicitudFields } from './auth-guard'
import { TABLE_IDS } from './field-ids'

/**
 * Valor de `TX_Adjuntos.subido_por` que marca una foto como del tasador.
 *
 * **La capitalización no es cosmética.** La proyección de abajo filtra por este
 * literal exacto, y el `singleSelect` de Airtable tiene hoy **dos** opciones que
 * sólo difieren en la mayúscula —`Tasador` y `tasador`, esta última ya presente
 * en filas reales—. Con `typecast: true`, escribir la minúscula no da error:
 * crea (o reutiliza) la otra opción y la foto **desaparece de la lectura para
 * siempre**, sin señal de que algo salió mal.
 *
 * Por eso el `PATCH` de la ruta lo reescribe server-side en vez de confiar en el
 * `subido_por` que el cliente mandó al endpoint de subida, cuyo valor por
 * defecto es además `'Ejecutivo'` (`lib/adjuntos-uploader.ts`).
 */
export const SUBIDO_POR_TASADOR = 'Tasador'

/** Las columnas de `TX_Adjuntos` que la proyección lee. */
export interface AdjuntoFotoFields {
  nombre_archivo?: string
  tipo_adjunto?: string
  /**
   * `clave_adjunto` (`fldaLLtzAaEn1O8IW`) — el `codigo` de `D_TipoDocumento`.
   * Es la llave con la que `AT-RF09-Trigger` decide disparar la extracción
   * RF-09; el `PATCH` la reescribe server-side para la foto del cuadro de
   * comparables (ver la ruta de fotos y `tipo-documento-foto.ts`).
   */
  clave_adjunto?: string
  /**
   * `estado_extraccion` (`fld54epvDJ7YdJIYD`) — avance del pipeline RF-09.
   * El `PATCH` lo repone a `idle` cuando rescata una foto de comparables que el
   * disparo en `recordCreated` dejó en `skipped` (ver la ruta de fotos).
   */
  estado_extraccion?: string
  descripcion?: string
  url_dropbox?: string
  thumbnail_url?: string
  orden?: number
  subido_por?: string
  subido_en?: string
  hash_md5?: string
  solicitud?: string[]
}

/**
 * Una foto ya proyectada. **Es el contrato HTTP del `GET /fotos`**, no una
 * forma nueva: la ruta serializa este objeto tal cual.
 *
 * Es un supertipo estructural de `FotoAdjunta` —añade `orden` y `subidoEn`—, de
 * modo que `repartirFotos` la acepta sin conversión.
 */
export interface FotoProyectada {
  id: string
  categoria: string
  nombre: string
  url: string | null
  thumbnailUrl: string | null
  orden: number | null
  subidoEn: string | null
  /**
   * Se expone porque es la **salvaguarda de integridad del borrado**
   * (§8.6.3): `DELETE /api/adjuntos/[id]` la reenvía a `SC-Adjuntos-Delete`,
   * que se niega a destruir nada si el registro apuntado por el record ID ya no
   * tiene ese hash. Sin él la pantalla puede listar fotos pero no borrarlas.
   */
  hashMd5: string | null
}

export interface FotosCaptura {
  fotos: FotoProyectada[]
  porCategoria: Record<string, number>
  total: number
}

/**
 * Una fila de `TX_Adjuntos` → `FotoProyectada`.
 *
 * ## El fallback a `'otro'` es un candado, no un adorno — CI-061
 *
 * La categoría real vive en `descripcion` cuando es personalizada; el
 * vocabulario cerrado de `tipo_adjunto` no admite nombres libres. Pero hay filas
 * reales con **los tres campos vacíos**: el binario llegó a Dropbox y el `PATCH`
 * de categorización nunca se aplicó (`recY2P0Ju0n5FAN62`, VP-2026-0061).
 *
 * Ante eso la foto cae en `'otro'` y **sigue en la lista**. Dejarla fuera
 * convertiría un fallo de categorización en una pérdida aparente de evidencia,
 * que es mucho peor de diagnosticar en terreno: el tasador ve que su foto no
 * está y la vuelve a tomar, sin saber que ya subió. `'otro'` no es ninguna de
 * las ocho categorías del catálogo, así que `repartirFotos` la trata como
 * personalizada y le crea su bucket — visible, con nombre, y sin mínimo.
 */
export function aFotoProyectada(id: string, f: AdjuntoFotoFields): FotoProyectada {
  return {
    id,
    categoria: f.descripcion || f.tipo_adjunto || 'otro',
    nombre: f.nombre_archivo ?? '',
    url: f.url_dropbox ?? null,
    thumbnailUrl: f.thumbnail_url ?? null,
    orden: f.orden ?? null,
    subidoEn: f.subido_en ?? null,
    hashMd5: f.hash_md5 ?? null,
  }
}

/**
 * Proyecta las fotos de la visita a partir de la solicitud ya autorizada.
 *
 * Recibe los `fields` que el guard leyó para no volver a pedir el registro: el
 * guard cuesta una lectura y esa lectura se aprovecha (mismo criterio que
 * `proyectarDatosCaptura`).
 *
 * Con `codigo` vacío devuelve la captura vacía **sin consultar**: el Link
 * `solicitud` se evalúa contra el primary field de `TX_Solicitudes`, así que un
 * `filterByFormula` con cadena vacía traería la tabla entera.
 *
 * El orden lo pone Airtable (`orden ASC`) y nadie lo vuelve a tocar: el reparto
 * conserva el orden de llegada dentro de cada categoría.
 */
export async function proyectarFotosCaptura(
  fields: SolicitudFields
): Promise<FotosCaptura> {
  const codigo = String(fields.codigo_solicitud ?? '')
  if (!codigo) return { fotos: [], porCategoria: {}, total: 0 }

  const registros = await listRecords<AdjuntoFotoFields>(TABLE_IDS.adjuntos, {
    filterByFormula: `AND({solicitud}="${codigo.replace(/"/g, '\\"')}",{subido_por}="${SUBIDO_POR_TASADOR}")`,
    'sort[0][field]': 'orden',
    'sort[0][direction]': 'asc',
  })

  const fotos = registros.map((r) => aFotoProyectada(r.id, r.fields))

  const porCategoria = fotos.reduce<Record<string, number>>((acc, f) => {
    acc[f.categoria] = (acc[f.categoria] ?? 0) + 1
    return acc
  }, {})

  return { fotos, porCategoria, total: fotos.length }
}

/**
 * Fotos de la visita de una solicitud, autorización incluida.
 *
 * Devuelve `null` ante cualquier fallo —guard en rojo o excepción de Airtable—,
 * **mismo contrato que `leerTasacion` y `leerDatosCaptura`**: la pantalla abre
 * con el organizador vacío y el `useEffect` de `FotosScreen` vuelve a intentarlo
 * por HTTP. Una tasación sin fotos todavía es el caso normal en la primera
 * apertura, y no puede presentarse como un error.
 */
export async function leerFotosCaptura(id: string): Promise<FotosCaptura | null> {
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) {
    if (guard.status === 500 || guard.status === 502) {
      console.error('[leerFotosCaptura] fallo de infraestructura al leer', id, guard.status)
    }
    return null
  }

  try {
    return await proyectarFotosCaptura(guard.fields)
  } catch (err) {
    console.error('[leerFotosCaptura] no se pudieron proyectar las fotos de', id, err)
    return null
  }
}

/**
 * La captura, ya en las dos claves de `InformeData` que la pantalla consume.
 *
 * Existe para que las páginas no tengan que conocer `repartirFotos` ni pasarle
 * el `[]` de categorías previas, que server-side es siempre vacío: no hay
 * borrador local en el servidor, así que **toda** categoría personalizada que
 * llegue acá viene de una foto real de Airtable.
 *
 * Con `null` devuelve las ocho categorías vacías —no `undefined`— para que el
 * spread sobre `resolverInforme` sea siempre una sustitución y nunca un hueco.
 */
export function repartoDeCaptura(
  captura: FotosCaptura | null
): Pick<InformeData, 'fotosPredefinidas' | 'categoriasCustom'> {
  return repartirFotos(captura?.fotos ?? [], [])
}
