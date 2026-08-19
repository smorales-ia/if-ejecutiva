/**
 * `GET /api/tasaciones/config/motivos-devolucion` — RF-TAS-12 · **A-17**.
 *
 * Sirve el catálogo de motivos de devolución **leyéndolo del schema de
 * Airtable**, no de una constante del repositorio. Es la mitad server del
 * criterio de aceptación de A-17: *un motivo agregado desde Airtable llega a la
 * UI sin deploy*. La otra mitad es que el cliente no tenga lista local, y la
 * cumple `cargarMotivosDevolucion()` en `lib/tasaciones.ts`.
 *
 * ## Por qué no lleva guard de solicitud
 *
 * `autorizarSolicitud` valida la pertenencia de **una** solicitud a un tasador,
 * y acá no hay solicitud: es configuración de dominio, igual para todos. Lo que
 * sí la protege es el `middleware.ts` de Clerk, que cubre todo salvo
 * `/sign-in` y `/api/health`. Un catálogo de cuatro motivos tampoco es
 * información sensible.
 *
 * ## Por qué no degrada a lista vacía
 *
 * Un `200 []` le diría a la UI «no hay motivos», que es falso y deja al tasador
 * ante un desplegable vacío sin explicación. Ante fallo se responde **502 con
 * literal humano** y el select muestra su mensaje de error. Mentir barato es
 * más caro que fallar visible.
 */

import { opcionesDeSingleSelect } from '@/lib/tasador/schema-airtable'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { error, ok } from '@/lib/tasador/respuestas'
import { TABLE_IDS } from '@/lib/tasador/field-ids'

export const dynamic = 'force-dynamic'

/** `TX_CoordinacionVisita.motivo`, creado en P4-TAS bloque 1. */
const CAMPO_MOTIVO = 'fld0rkrlg9Xo0fFVm'

export async function GET() {
  try {
    const motivos = await opcionesDeSingleSelect(
      TABLE_IDS.coordinacionVisita,
      CAMPO_MOTIVO,
    )
    return ok(motivos)
  } catch (err) {
    console.error('[GET /api/tasaciones/config/motivos-devolucion]', err)
    return error(MENSAJES.catalogoNoDisponible, 502)
  }
}
