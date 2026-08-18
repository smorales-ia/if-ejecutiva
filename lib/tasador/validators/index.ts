/**
 * Capa 3 de los Route Handlers de IF-03: validación Zod de todo cuerpo entrante.
 *
 * Tanda P2-TAS · plan §3.1. **Nada se escribe con datos sin validar.**
 *
 * ## Los mensajes son humanos, no de Zod
 *
 * `parsearCuerpo()` nunca devuelve el error crudo de Zod al cliente: §6.5 lo
 * prohíbe explícitamente. Devuelve un literal de `MENSAJES` más, cuando sirve,
 * la lista de campos afectados — que es accionable sin ser técnica.
 *
 * ## Por qué los números viajan como string
 *
 * El formulario de captura los tiene como `value` de inputs controlados. Los
 * schemas aceptan `string` y convierten acá, en el borde, que es donde RO-17
 * manda normalizar: un campo que entra por dos rutas se normaliza una vez.
 */

import { z } from 'zod'
import { MENSAJES, MIN_CARACTERES_OBSERVACION } from '../mensajes'

/* -------------------------------------------------------------------------
 * Piezas reutilizables
 * ---------------------------------------------------------------------- */

/** Número que llega como string desde un input. Vacío → `undefined`, no 0. */
export const numeroDeInput = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') return undefined
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : undefined
  })

/** Fecha `YYYY-MM-DD`. Es el formato que emiten los `<input type="date">`. */
export const fechaIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'formato de fecha')
  .optional()

/* -------------------------------------------------------------------------
 * Schemas por ruta de mutación
 * ---------------------------------------------------------------------- */

/**
 * `POST /api/tasaciones/[id]/rechazo` — RF-TAS-09.
 *
 * El mínimo de 20 caracteres es la única regla de negocio del endpoint. **No
 * toca `estado`** y **no emite aviso al visador** (A-15): eso no se valida acá,
 * se garantiza por lo que la ruta no hace.
 */
export const rechazoSchema = z.object({
  observacion: z
    .string()
    .trim()
    .min(MIN_CARACTERES_OBSERVACION, MENSAJES.observacionCorta),
})

/**
 * `POST /api/tasaciones/[id]/calcular` — RF-TAS-22.
 *
 * Cuerpo vacío a propósito: la transición no lleva parámetros. El schema existe
 * para que la ruta pase por la capa 3 como todas las demás, y para rechazar un
 * cuerpo con basura en vez de ignorarlo.
 */
export const calcularSchema = z.object({}).strict()

/** Un comparable de la grilla de la sección D (RF-12). */
export const comparableSchema = z.object({
  direccionReferencia: z.string().trim().min(1),
  comuna: z.string().trim().optional(),
  supTerreno: numeroDeInput,
  supConstruida: numeroDeInput,
  totalUf: numeroDeInput,
  anio: numeroDeInput,
  /** Se persiste en `tipo_referencia`, **no** en `fuente`. Ver `Comparable.fuente`. */
  fuente: z.enum(['oferta', 'cbr']),
  factorSup: numeroDeInput,
  factorEdad: numeroDeInput,
  factorDistancia: numeroDeInput,
  telefonoContacto: z.string().trim().optional(),
  foja: z.string().trim().optional(),
  numero: z.string().trim().optional(),
})

export const comparableCrearSchema = comparableSchema
export const comparableBorrarSchema = z.object({
  comparableId: z.string().regex(/^rec[a-zA-Z0-9]{14}$/, 'record id'),
})

/* -------------------------------------------------------------------------
 * Parseo
 * ---------------------------------------------------------------------- */

export type ResultadoParseo<T> =
  | { ok: true; datos: T }
  | { ok: false; mensaje: string; campos: string[] }

/**
 * Parsea el body de una `Request` contra un schema.
 *
 * Un JSON malformado se trata igual que un JSON inválido: el usuario no
 * distingue los dos casos y el mensaje es el mismo.
 */
export async function parsearCuerpo<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<ResultadoParseo<z.infer<T>>> {
  let crudo: unknown
  try {
    crudo = await request.json()
  } catch {
    return { ok: false, mensaje: MENSAJES.datosInvalidos, campos: [] }
  }

  const resultado = schema.safeParse(crudo)
  if (resultado.success) return { ok: true, datos: resultado.data }

  const campos = resultado.error.issues.map((i) => i.path.join('.')).filter(Boolean)

  // Un schema con un solo campo y mensaje propio (rechazo) merece decir el suyo:
  // "Describe con más detalle…" es más útil que "Revisa los datos".
  const primero = resultado.error.issues[0]
  const mensaje =
    resultado.error.issues.length === 1 && primero.message.length > 20
      ? primero.message
      : MENSAJES.datosInvalidos

  return { ok: false, mensaje, campos }
}
