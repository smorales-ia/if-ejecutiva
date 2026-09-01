/**
 * Identidad del tasador en sesión — **Clerk** (P11-TAS · cierre de R2).
 *
 * Único punto de todo IF-03 que sabe quién es el usuario. Resuelve la sesión
 * server-side de Clerk (`auth()`) y la mapea a `M_Tasadores` por el campo
 * `clerk_user_id` (`fldIu5izeAtkFXMJO`), la **llave real de RF-09**. El `email`
 * de `M_Tasadores` NO sirve de llave: es un placeholder repetido en masa
 * (`njaimes@valueproperty.cl` en todo el padrón) — ver `docs/schema-airtable.md`.
 *
 * Reemplaza al antiguo módulo de identidad simulada, retirado en esta tanda.
 * La firma pública
 * `getUsuarioTasador()` se conserva, con dos matices forzados por Clerk: ahora
 * es `async` (la sesión se lee de forma asíncrona) y puede devolver `null`
 * cuando la cuenta autenticada no corresponde a ningún tasador. Los cuatro
 * consumidores tratan ese `null` denegando (guard, rutas) o degradando (cola
 * vacía, rótulo genérico).
 *
 * server-only: usa el cliente REST de Airtable. Importarlo desde un componente
 * cliente rompe el build al arrastrar el cliente REST — la garantía deseada.
 */

import { auth } from '@clerk/nextjs/server'
import { listRecords } from '@/lib/airtable-client'
import { M_TASADORES } from '@/lib/tasadores'

export interface UsuarioTasador {
  /** `clerk_user_id` de la sesión: identidad en el proveedor de autenticación. */
  usuarioId: string
  /** recordId del tasador en `M_Tasadores` (`tblEi5jp18c1j00bQ`). */
  recordId: string
  nombre: string
}

interface TasadorFila {
  nombre?: string
  clerk_user_id?: string
}

/**
 * Devuelve el tasador en sesión, o `null` si no hay sesión o si la cuenta
 * autenticada no está vinculada a ningún registro de `M_Tasadores`.
 *
 * Nunca lanza: un fallo de lectura contra Airtable se registra y devuelve
 * `null`, de modo que el llamador deniegue (guard) o degrade (cola vacía) sin
 * tumbar la pantalla. **Denegar ante la duda es la postura correcta de RF-09.**
 */
export async function getUsuarioTasador(): Promise<UsuarioTasador | null> {
  const { userId } = await auth()
  if (!userId) return null

  // Los IDs de Clerk no llevan comillas; se escapa igual, por defensa en
  // profundidad, antes de interpolar en la fórmula de Airtable.
  const idSeguroFormula = userId.replace(/'/g, "\\'")

  let filas
  try {
    filas = await listRecords<TasadorFila>(M_TASADORES, {
      filterByFormula: `{clerk_user_id}='${idSeguroFormula}'`,
      maxRecords: '1',
    })
  } catch (err) {
    console.error('[usuario] no se pudo resolver clerk_user_id contra M_Tasadores', err)
    return null
  }

  const fila = filas[0]
  if (!fila) {
    // Autenticado pero sin tasador vinculado: no es un fallo de sistema, es un
    // no-acceso. El guard lo traduce a 403 sin filtrar existencia.
    console.warn('[usuario] la sesión Clerk no corresponde a ningún tasador')
    return null
  }

  return {
    usuarioId: userId,
    recordId: fila.id,
    nombre: fila.fields.nombre?.trim() || 'Tasador',
  }
}

/**
 * Nombre del tasador para la cabecera de la app.
 *
 * Con la identidad ya resuelta desde `M_Tasadores`, el nombre viene dentro de
 * `getUsuarioTasador()`; esta función sólo aporta la degradación a un rótulo
 * genérico cuando no hay tasador. Una cabecera genérica es un detalle; una
 * pantalla caída por no poder leer un rótulo, no.
 */
export async function nombreVisibleTasador(): Promise<string> {
  const usuario = await getUsuarioTasador()
  return usuario?.nombre ?? 'Tasador'
}
