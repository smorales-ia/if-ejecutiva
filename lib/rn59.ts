import { getRecord } from '@/lib/airtable-client'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

/**
 * RN-59 · Modo consulta activado por estado y tasador asignado.
 *
 * ## Por qué existe este archivo
 *
 * §8.6.6 de la Especificación v1.9.5 abre la construcción de RF-52 con una
 * decisión pendiente: «No existe hoy en el repositorio un helper de
 * editabilidad ni constante equivalente, pese a que la guía de construcción lo
 * cita como si existiera. Debe decidirse si se implementa el helper o si el
 * guard se resuelve leyendo estado y tasador en cada Route Handler.»
 *
 * Se implementa el helper. El motivo es que la regla tiene **dos condiciones
 * que se evalúan juntas** —estado ≠ `creada` **Y** tasador asignado— y la
 * postcondición de RN-59 insiste en que no depende de una sola de las dos. Un
 * guard replicado a mano en cada handler es exactamente la forma en que esa
 * conjunción termina degradando a `estado !== 'creada'` en el tercer copiado:
 * el bug sería invisible (bloquea de más, nunca de menos) y sólo aparecería
 * como «no puedo borrar el adjunto de una solicitud que sí es editable».
 *
 * ## Excepción acotada (v1.9.4) — fuera de alcance aquí
 *
 * La excepción de `TX_ContactosVisita` con `coordinacion_vigente = rechazada`
 * (§1.4, §2.5) cubre **exclusivamente** contactos de visita. Los adjuntos no
 * entran: en modo consulta quedan bloqueados subir, reemplazar y desmarcar
 * (§8.6.5). Por eso este helper no la evalúa.
 *
 * ## Dos capas, no una
 *
 * La interfaz deshabilita controles como feedback rápido; esto es el control de
 * acceso real. §8.6.5: «deshabilitar un botón es feedback, no control de
 * acceso».
 */

/**
 * Evalúa RN-59 sobre valores ya leídos. `tasador` llega como texto porque los
 * handlers leen `TX_Solicitudes` con `cellFormat: 'string'` (un
 * `multipleRecordLinks` en JSON llegaría como array de record IDs).
 */
export function esModoConsulta(
  estado: string | undefined,
  tasador: string | undefined
): boolean {
  const tieneTasador = (tasador ?? '').trim() !== ''
  return (estado ?? '').trim() !== 'creada' && tieneTasador
}

export type ResultadoRN59 =
  | { tipo: 'ok' }
  | { tipo: 'no_encontrada' }
  | { tipo: 'modo_consulta'; estado: string; tasador: string }

/**
 * Lee `estado` y `tasador` de la solicitud y decide si admite mutaciones.
 *
 * Lanza `AirtableError` si Airtable falla — el llamador decide si eso es un 502
 * o un fallo silencioso. Nunca devuelve `ok` ante un error de lectura: fallar
 * abierto en un guard de borrado destructivo sería peor que devolver 502.
 */
export async function verificarRN59(solicitudId: string): Promise<ResultadoRN59> {
  // Airtable exige timeZone + userLocale junto a `cellFormat: 'string'` o
  // responde 422 (mismo patrón que `app/api/solicitudes/[id]/asignar/route.ts`).
  const record = await getRecord<Record<string, string | undefined>>(
    TX_SOLICITUDES,
    solicitudId,
    {
      cellFormat: 'string',
      timeZone: 'America/Santiago',
      userLocale: 'es-CL',
      fields: ['tasador', 'estado'],
    }
  )

  if (!record) return { tipo: 'no_encontrada' }

  const estado = (record.fields['estado'] ?? '').trim()
  const tasador = (record.fields['tasador'] ?? '').trim()

  if (esModoConsulta(estado, tasador)) {
    return { tipo: 'modo_consulta', estado, tasador }
  }
  return { tipo: 'ok' }
}
