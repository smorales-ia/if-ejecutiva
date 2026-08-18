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
 */

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
