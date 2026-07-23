import { z } from "zod"

/**
 * Schemas zod de las acciones server-side sobre una solicitud existente
 * (asignar tasador · editar). Compartidos entre los Route Handlers y, cuando
 * corresponda, la UI. Nomenclatura camelCase (convención del repo, ver E-046).
 *
 * REGLA A (asignar): la solicitud se asigna con un tasador; el motivo es
 * opcional. La transición de estado y el envío del correo los ejecuta Make
 * (SC-Asignar), no este validador.
 * REGLA B (contrato de error): cuando un payload falla, el Route Handler
 * traduce los issues de zod al contrato `{ error: 'validacion', campos: [...] }`.
 */

export const asignarSolicitudSchema = z.object({
  tasadorId: z.string().min(1, "Selecciona un tasador."),
  /** Nota opcional del ejecutivo (override fuera de cobertura, etc.). */
  motivo: z.string().max(200, "El motivo no puede superar 200 caracteres.").optional(),
})
export type AsignarSolicitudPayload = z.infer<typeof asignarSolicitudSchema>

/**
 * REGLA C (edición parcial): en estado `creada` la ejecutiva puede modificar
 * todo. El detalle de validación de negocio de cada campo vive en el formulario
 * (REGLA B); aquí sólo exigimos un objeto con al menos un campo a modificar.
 * El Route Handler valida además, de forma defensiva, que el estado siga siendo
 * `creada` antes de reenviar a Make.
 */
export const editarSolicitudSchema = z
  .record(z.string(), z.unknown())
  .refine((o) => Object.keys(o).length > 0, "No hay cambios para guardar.")
export type EditarSolicitudPayload = z.infer<typeof editarSolicitudSchema>

/**
 * Traduce los issues de un `safeParse` fallido al contrato de error REGLA B.
 * `path` de zod (ej. `['unidades', 1, 'supConstruida']`) se aplana a
 * `unidades.1.supConstruida` para que el frontend lo mapee a una etiqueta.
 */
export function issuesToCampos(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
): { campo: string; motivo: string }[] {
  return issues.map((i) => ({
    campo: i.path.map(String).join(".") || "(payload)",
    motivo: i.message,
  }))
}
