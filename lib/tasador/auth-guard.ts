/**
 * Capas 1 y 2 de todo Route Handler de IF-03: identidad y autorización (RF-09).
 *
 * Tanda P2-TAS · plan §3.1. **Una sola implementación**; ninguna ruta reimplementa
 * el guard ni lee la identidad por otro camino.
 *
 * ## Fuente de identidad
 *
 * Desde P11-TAS la identidad sale de la sesión Clerk resuelta contra
 * `M_Tasadores` (`getUsuarioTasador`). El guard ya existía y funcionaba antes
 * del cierre de R2: la tanda sustituyó de dónde sale el usuario, no inventó la
 * comprobación. Si la capa hubiera nacido con Clerk, entre medio cualquier ruta
 * habría servido solicitudes ajenas.
 *
 * ## Qué comprueba
 *
 * `TX_Solicitudes.tasador` (`fldlgriK1jP5906wE`, Link → `M_Tasadores`) contiene
 * el recordId del usuario. Es un `multipleRecordLinks`, así que el valor que
 * llega es un array de recordIds — la comprobación es de pertenencia, no de
 * igualdad.
 *
 * ## Qué NO filtra
 *
 * Ante una solicitud ajena se devuelve **403 con un cuerpo idéntico al de una
 * solicitud inexistente**. Distinguir «no existe» de «no es tuya» le confirmaría
 * a un tercero que el código existe, que es la fuga que RF-09 quiere evitar.
 */

import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { getUsuarioTasador } from './usuario'
import { TABLE_IDS } from './field-ids'
import { MENSAJES } from './mensajes'

/** Campos de `TX_Solicitudes` que el guard necesita leer. */
export interface SolicitudFields {
  tasador?: string[]
  estado?: string
  codigo_solicitud?: string
  [campo: string]: unknown
}

export type ResultadoGuard =
  | { ok: true; solicitudId: string; fields: SolicitudFields; usuarioRecordId: string }
  | { ok: false; status: 400 | 403 | 404 | 500 | 502; mensaje: string }

/**
 * Resuelve identidad y autorización para una solicitud.
 *
 * Devuelve el registro ya leído para que la ruta no vuelva a pedirlo: el guard
 * cuesta una lectura y esa lectura se aprovecha.
 */
export async function autorizarSolicitud(id: string): Promise<ResultadoGuard> {
  if (!isValidRecordId(id)) {
    // Un id con forma inválida no llega a Airtable. Mismo mensaje que el 403:
    // ver la nota de arriba sobre no filtrar existencia.
    return { ok: false, status: 404, mensaje: MENSAJES.solicitudNoDisponible }
  }

  const usuario = await getUsuarioTasador()

  if (!usuario) {
    // Sesión válida pero sin tasador vinculado (o identidad irresoluble). Es un
    // no-acceso, no un fallo de sistema: mismo cuerpo que una solicitud ajena,
    // sin filtrar si existe. Denegar ante la duda es la postura de RF-09.
    return { ok: false, status: 403, mensaje: MENSAJES.solicitudNoDisponible }
  }

  let registro
  try {
    registro = await getRecord<SolicitudFields>(TABLE_IDS.solicitudes, id)
  } catch (err) {
    console.error('[auth-guard] fallo al leer la solicitud', id, err)
    return {
      ok: false,
      status: err instanceof AirtableError ? 502 : 500,
      mensaje: MENSAJES.errorGenerico,
    }
  }

  if (!registro) {
    return { ok: false, status: 404, mensaje: MENSAJES.solicitudNoDisponible }
  }

  const asignados = registro.fields.tasador
  const pertenece = Array.isArray(asignados) && asignados.includes(usuario.recordId)

  if (!pertenece) {
    // No se loguea el recordId del tasador dueño: el log tampoco necesita saber
    // de quién es la solicitud ajena.
    console.warn('[auth-guard] acceso denegado a solicitud ajena', {
      solicitud: id,
      usuario: usuario.recordId,
    })
    return { ok: false, status: 403, mensaje: MENSAJES.solicitudNoDisponible }
  }

  return {
    ok: true,
    solicitudId: id,
    fields: registro.fields,
    usuarioRecordId: usuario.recordId,
  }
}
