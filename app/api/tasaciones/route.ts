/**
 * `GET /api/tasaciones` — cola personal del tasador.
 *
 * RF-09 · RF-TAS-01 · RF-TAS-02. Tanda P2-TAS · plan §3.1.
 *
 * ## Autorización sin guard por id
 *
 * Ésta es la única ruta sin `[id]`, así que no puede usar `autorizarSolicitud()`.
 * El equivalente es **el propio filtro**: sólo se materializan las solicitudes
 * cuyo `tasador` es el usuario. Una solicitud ajena no llega a la respuesta, que
 * es una garantía más fuerte que filtrarla después.
 *
 * ## SLA (CI-021)
 *
 * El semáforo lo produce `lib/sla-etapas.ts` sobre la ventana hábil. **IF-03 no
 * hace aritmética de plazos**: no hay ningún literal de horas en este archivo.
 *
 * Desde **P3-TAS.A** el cuerpo trae `slaEtapa` en la forma `SlaEtapaSolicitud`
 * de IF-02 —número, nombre de `C_SLA_Etapas`, tono de la fórmula y los dos
 * instantes ya materializados—, que es lo que consume `SLABadge`. Antes era
 * sólo el número de etapa, y la card no tenía con qué pintar: caía a un
 * "En plazo · 0h" que ningún campo respaldaba. Si el motor no resuelve etapa, la
 * clave viaja **ausente** y la UI no pinta píldora — nunca un número inventado.
 *
 * ## Proyección compartida — ensanchada en P2-TAS.B
 *
 * El cuerpo lo arma `proyectarTasacion()` de `lib/tasador/lectura-tasacion.ts`,
 * el mismo mapper que consumen los Server Components. Antes esta ruta devolvía
 * 12 claves planas que **no** satisfacían el tipo `Tasacion`: le faltaban
 * `comuna`, `tipo`, `cliente`, `producto`, `visita`, `version`, `datos` y
 * `datosEjecutiva`, todos no-opcionales. La UI compilaba contra un tipo que el
 * API no servía. Unificar el mapeo es lo que impide que vuelvan a divergir.
 */

import { MENSAJES } from '@/lib/tasador/mensajes'
import { getUsuarioTasador } from '@/lib/tasador/usuario'
import { desdeExcepcion, error, ok } from '@/lib/tasador/respuestas'
import { leerCola } from '@/lib/tasador/lectura-tasacion'

export const dynamic = 'force-dynamic'

export async function GET() {
  /**
   * La comprobación se repite acá aunque `leerCola()` también la haga, porque
   * las dos capas degradan distinto: el Server Component necesita una cola
   * vacía —una excepción tumbaría la pantalla entera— y el API necesita un 403
   * visible cuando la cuenta autenticada no está vinculada a ningún tasador.
   * Sin esto, esa cuenta vería un 200 con cero solicitudes, indistinguible de
   * una cola legítimamente vacía.
   */
  if (!(await getUsuarioTasador())) {
    return error(MENSAJES.solicitudNoDisponible, 403)
  }

  try {
    return ok(await leerCola())
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones', err)
  }
}
