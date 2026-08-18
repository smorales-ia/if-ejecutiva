/**
 * Literales que IF-03 devuelve al usuario desde la capa server.
 *
 * §6.1 y §6.5 del Blueprint: segunda persona del singular, sin signos de
 * exclamación, sin culpar al usuario y **sin exponer errores técnicos**. El
 * error crudo va al `console.error`, nunca al body de la respuesta.
 *
 * ⚠ **Regla T-C.** Ningún literal nombra el medio técnico con que se resuelve
 * una operación. Nada de "IA", "modelo", "OCR" ni "Claude".
 *
 * Viven acá y no repartidos por las rutas para que el barrido de P12-TAS pueda
 * verificarlos en un solo archivo, y para que dos rutas no digan lo mismo de
 * dos formas distintas.
 */

export const MENSAJES = Object.freeze({
  /**
   * Único mensaje para «no existe», «no es tuya» y «id con forma inválida».
   *
   * Es deliberado: distinguirlos le confirmaría a un tercero que una solicitud
   * ajena existe. Ver `auth-guard.ts`.
   */
  solicitudNoDisponible: 'No encontramos esta solicitud entre las tuyas.',

  /** Fallo de red, de Airtable o inesperado. Literal fijado por el CLAUDE.md. */
  errorGenerico: 'No pudimos completar la acción. Intenta nuevamente en unos segundos.',

  /** Cuerpo que no pasa el schema Zod. El detalle por campo va aparte. */
  datosInvalidos: 'Revisa los datos: hay campos que no podemos guardar así.',

  /** `POST /calcular` sobre una solicitud que ya salió de `asignada` (RF-TAS-07). */
  calculoYaIniciado: 'Esta tasación ya fue enviada a cálculo.',

  /** Estado de la solicitud incompatible con la acción pedida. */
  estadoNoPermite: 'El estado de esta solicitud no permite esta acción.',

  /** La observación de rechazo del informe (RF-TAS-09 · A-15). */
  observacionCorta: 'Describe con un poco más de detalle qué necesitas resolver.',
} as const)

/** Mínimo de caracteres de la observación de rechazo (RF-TAS-09) y del motivo de override. */
export const MIN_CARACTERES_OBSERVACION = 20
