// TODO(P11-TAS): reemplazar por Clerk. Este módulo entero desaparece.
/**
 * Identidad del tasador en sesión — **mock** hasta P11-TAS (Regla R2).
 *
 * Éste es el **único punto de todo IF-03 que sabe quién es el usuario**. Ningún
 * otro módulo, Route Handler o componente resuelve la identidad por otro
 * camino. La razón es operativa: P11-TAS reemplaza el mock por Clerk y
 * `clerk_user_id`, y debe ser el cambio de una función, no una cacería por el
 * árbol.
 *
 * ⚠ **No importar `@clerk/*` desde acá ni desde ningún módulo de IF-03 antes de
 * P11-TAS** (R2). La única mención de Clerk en `lib/tasador/` es este comentario.
 *
 * ⚠ Desde P3-TAS.B este módulo **toca Airtable** (`nombreVisibleTasador`), así
 * que es server-only por convención, igual que `lectura-tasacion.ts`. Quien lo
 * importe desde un componente cliente rompe el build al arrastrar el cliente
 * REST — que es exactamente la garantía que se quiere.
 */

import { getRecord } from '@/lib/airtable-client'
import { M_TASADORES } from '@/lib/tasadores'

export interface UsuarioTasador {
  /** Identificador del usuario en el proveedor de autenticación. */
  usuarioId: string
  /** recordId del tasador en `M_Tasadores` (`tblEi5jp18c1j00bQ`). */
  recordId: string
  nombre: string
}

/**
 * recordId real de `M_Tasadores` con el que trabajan las tandas P2-TAS a
 * P10-TAS. Se lee del entorno porque **no hay ningún recordId de tasador
 * documentado en el repo** y P1-TAS no consulta la base de producción.
 *
 * Sergio debe definir `TASADOR_MOCK_RECORD_ID` en `.env.local` antes de que
 * P2-TAS haga su primera lectura. Sin él, `getUsuarioTasador()` devuelve un
 * `recordId` vacío y las lecturas fallan de forma visible — que es lo
 * preferible frente a un ID inventado que apunte a un registro ajeno.
 */
const RECORD_ID_MOCK = process.env.TASADOR_MOCK_RECORD_ID ?? ''

const USUARIO_ID_MOCK = process.env.TASADOR_MOCK_USUARIO_ID ?? 'mock-tasador'

/**
 * Devuelve el tasador en sesión.
 *
 * Hasta P11-TAS es un objeto fijo. Desde P11-TAS resuelve la sesión real y
 * conserva esta firma, de modo que ningún consumidor cambie.
 */
export function getUsuarioTasador(): UsuarioTasador {
  return {
    usuarioId: USUARIO_ID_MOCK,
    recordId: RECORD_ID_MOCK,
    nombre: 'Tasador de pruebas',
  }
}

/**
 * `true` cuando el mock tiene un `recordId` utilizable.
 *
 * P2-TAS lo consulta antes de llamar a Airtable para poder emitir un error
 * accionable en vez de una consulta vacía.
 */
export function mockTasadorConfigurado(): boolean {
  return RECORD_ID_MOCK.startsWith('rec') && RECORD_ID_MOCK.length === 17
}

/* -------------------------------------------------------------------------
 * Nombre visible · P3-TAS.B
 * ---------------------------------------------------------------------- */

const TTL_NOMBRE_MS = 5 * 60 * 1000

let cacheNombre: { valor: string; expira: number } | null = null

/**
 * Nombre del tasador para la cabecera de la app.
 *
 * Hasta P3-TAS.B el header mostraba **"Roberto Pérez" escrito a mano** en
 * `app-header.tsx`: un nombre que no es el de nadie, en la única parte de la
 * pantalla que le dice al usuario de quién es la sesión. Con el mock apuntando
 * a un registro real de `M_Tasadores`, el nombre real está a una lectura.
 *
 * Vive acá y no en el componente porque **éste es el único módulo de IF-03 que
 * sabe quién es el usuario** (R2). Cuando P11-TAS reemplace el mock por Clerk,
 * esta función se borra con el resto del archivo y la cabecera no se entera.
 *
 * Degradación en cascada, nunca excepción: sin `recordId` configurado, con la
 * fila ilegible o sin `nombre`, devuelve el literal de `getUsuarioTasador()`.
 * Una cabecera con un nombre genérico es un detalle; una pantalla caída porque
 * no se pudo leer un rótulo, no.
 */
export async function nombreVisibleTasador(): Promise<string> {
  const usuario = getUsuarioTasador()
  if (!mockTasadorConfigurado()) return usuario.nombre

  const ahora = Date.now()
  if (cacheNombre && cacheNombre.expira > ahora) return cacheNombre.valor

  try {
    const fila = await getRecord<{ nombre?: string }>(M_TASADORES, usuario.recordId)
    const nombre = fila?.fields.nombre?.trim()
    const valor = nombre && nombre !== '' ? nombre : usuario.nombre

    cacheNombre = { valor, expira: ahora + TTL_NOMBRE_MS }
    return valor
  } catch (err) {
    console.warn('[nombreVisibleTasador] no se pudo leer M_Tasadores', err)
    return usuario.nombre
  }
}

/** Invalida la caché del nombre. Sólo para tests. */
export function _resetCacheNombre(): void {
  cacheNombre = null
}
