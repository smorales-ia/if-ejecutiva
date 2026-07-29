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

/** Contacto de visita tal como viaja a SC-Edicion (snake_case ya mapeado). */
const contactoVisitaSchema = z
  .object({
    nombre: z.string().min(1, "El contacto necesita un nombre."),
    telefono: z.string(),
    email: z.string(),
    rol: z.string(),
    orden_prioridad: z.number().int().positive(),
    estado_contacto: z.string(),
  })
  .strict()

/** Número que puede llegar como texto desde un `<input>`; "" ⇒ ausente. */
const numeroOpcional = z.union([z.number(), z.string()]).optional()

/**
 * REGLA C (edición parcial): en estado `creada` la ejecutiva puede modificar
 * todo. El detalle de validación de negocio de cada campo vive en el formulario
 * (REGLA B); aquí se valida la **forma** del payload. El Route Handler verifica
 * además, de forma defensiva, que el estado siga siendo `creada`.
 *
 * ⚠ Hasta la Tanda D-02 esto era `z.record(z.string(), z.unknown())`, que
 * aceptaba **cualquier** clave con **cualquier** valor y sólo rechazaba el
 * objeto vacío. Consecuencia: una clave mal escrita —o puesta en el nivel de
 * anidamiento equivocado— pasaba la validación, viajaba a Make, el mapper la
 * ignoraba por desconocida, Airtable no cambiaba, y la ruta devolvía 200 con
 * toast verde. El *silent 200*. `.strict()` es la pieza que lo convierte en un
 * 422 con `{campo, motivo}`, que es el contrato que la UI ya sabe mostrar.
 *
 * Las claves son exactamente las que el escenario SC-Edicion desplegado lee
 * como `{{1.cambios.X}}` (45, verificadas contra el blueprint el 29-jul-2026).
 * Añadir una clave aquí sin añadirla en Make la hace viajar y ser ignorada en
 * silencio; el orden correcto es Make primero.
 */
export const editarSolicitudSchema = z
  .object({
    // Identificación y operación
    nOperacionCliente: numeroOpcional,
    sucursalOriginadora: z.string().optional(),
    correoClienteRef: z.string().optional(),
    ejecutivoSolicitante: z.string().optional(),
    ejecutivoFormalizador: z.string().optional(),
    emailThreadId: z.string().optional(),
    modoCreacion: z.string().optional(),
    tipoClienteOrigen: z.string().optional(),
    origenCanal: z.string().optional(),
    canal: z.string().optional(),
    prioridad: z.string().optional(),
    fechaAsignacion: z.string().optional(),

    // Cliente final / comprador
    cliente: z.string().optional(),
    clienteFinalNombre: z.string().optional(),
    clienteFinalRut: z.string().optional(),
    emailContacto: z.string().optional(),
    solicitanteNombre: z.string().optional(),
    solicitanteTelefono: z.string().optional(),

    // Propiedad
    direccion: z.string().optional(),
    comuna: z.string().optional(),
    region: z.string().optional(),
    origenDireccion: z.string().optional(),
    tipoPropiedad: z.string().optional(),
    tipoPropiedadNuevoUsado: z.string().optional(),
    estadoConservacion: z.string().optional(),

    // Producto / banco
    tipoInforme: z.string().optional(),
    producto: z.string().optional(),
    bancoId: z.string().optional(),
    bancoFinancista: z.string().optional(),
    montoEstimadoUf: numeroOpcional,

    // Vendedor
    vendedorTipoPersona: z.string().optional(),
    vendedorRazonSocialONombre: z.string().optional(),
    vendedorRut: z.string().optional(),
    vendedorEmail: z.string().optional(),
    vendedorTelefono: z.string().optional(),
    vendedorOrigenDato: z.string().optional(),

    // Financiero
    financieroValorTotalUf: numeroOpcional,
    financieroSubsidioUf: numeroOpcional,
    financieroAhorroUf: numeroOpcional,
    financieroMutuoUf: numeroOpcional,
    financieroPagoContadoUf: numeroOpcional,
    financieroBonoCaptacionUf: numeroOpcional,
    financieroBonoIntegracionUf: numeroOpcional,
    financieroPrecioVentaUf: numeroOpcional,

    // Libre
    observaciones: z.string().optional(),

    // Contactos de visita. Viajan **fuera** de `cambios` hacia Make (ver el
    // Route Handler), pero entran por aquí y por eso se validan aquí.
    contactosVisita: z.array(contactoVisitaSchema).optional(),
    contactosVisitaJson: z.string().optional(),
  })
  .strict()
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
