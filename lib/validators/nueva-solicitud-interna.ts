import { z } from "zod"
import {
  validarRut,
  CANALES_ORIGEN,
  PRODUCTOS_CON_BANCO,
} from "@/lib/console-data"

/**
 * Schema de validación del formulario "Nueva solicitud interna" (IF-02).
 * La ejecutiva ingresa todos los datos que en el flujo externo capturaba
 * el solicitante. Mensajes en español de Chile, sin tecnicismos.
 */
const CANALES_ORIGEN_VALUES = CANALES_ORIGEN.map((c) => c.value)

// Mensajes literales §6 Blueprint / §8 diseno.md — no admiten variación.
const MSG_RUT_INVALIDO =
  "Necesitamos el RUT del propietario con su dígito verificador. Ej.: 12.345.678-9."
const MSG_EMAIL_INVALIDO =
  "Revisa el email de contacto: debe ser de la forma nombre@dominio.cl."
const MSG_DIRECCION_INCOMPLETA =
  "Ingresa la dirección con calle y número. Ej.: Av. Apoquindo 5230."

/** Mín. calle + número (RN de diseno.md §5 Tab Datos): exige al menos un dígito. */
function tieneCalleYNumero(direccion: string): boolean {
  return /\d/.test(direccion) && direccion.trim().split(/\s+/).length >= 2
}

export const nuevaSolicitudInternaSchema = z
  .object({
    // Sección A · Origen de la solicitud
    canal: z.enum(CANALES_ORIGEN_VALUES, "Selecciona el canal de origen."),
    cliente: z.string().min(1, "Selecciona un cliente."),
    tipoInforme: z.string().min(1, "Selecciona el tipo de informe."),
    banco_id: z.string().min(1, "Selecciona un banco."),
    sucursal_originadora: z.string().optional(),
    ejecutivo_solicitante: z.string().optional(),
    n_operacion_cliente: z
      .string()
      .min(1, "Necesitamos el N° de operación del banco.")
      .max(20),

    // Sección B · Datos de la propiedad
    direccion: z
      .string()
      .min(1, MSG_DIRECCION_INCOMPLETA)
      .refine(tieneCalleYNumero, MSG_DIRECCION_INCOMPLETA),
    region: z.string().min(1, "Selecciona una región."),
    comuna: z.string().min(1, "Selecciona una comuna."),
    tipoPropiedad: z.string().min(1, "Selecciona el tipo de propiedad."),
    valorUf: z.string().optional(),

    // Sección C · Datos del solicitante final
    rut: z
      .string()
      .min(1, MSG_RUT_INVALIDO)
      .refine((v) => validarRut(v), MSG_RUT_INVALIDO),
    nombre: z.string().min(3, "Ingresa el nombre completo."),
    telefono: z.string().optional(),
    email: z.string().min(1, MSG_EMAIL_INVALIDO).email(MSG_EMAIL_INVALIDO),

    // Sección D · Producto y observaciones
    producto: z.string().min(1, "Selecciona un producto."),
    banco: z.string().optional(),
    observaciones: z.string().optional(),

    // Sección E · Documentos requeridos (checklist)
    // `tipo_id` es el record id (`recXXX`) de D_TipoDocumento en Airtable —
    // sólo se valida la forma del item, sin lista cerrada de códigos.
    documentos: z
      .array(
        z.object({
          tipo_id: z.string(),
          codigo: z.string(),
          requerido_por_ejecutiva: z.boolean(),
          archivo: z
            .object({
              nombre: z.string(),
              tamanio_kb: z.number(),
              mime_type: z.string(),
              url_local: z.string(),
            })
            .nullable(),
        })
      )
      .refine(
        (docs) =>
          docs.every((d) => !d.requerido_por_ejecutiva || d.archivo !== null),
        { message: "Faltan documentos marcados sin archivo" }
      ),
  })
  .refine(
    (data) =>
      !PRODUCTOS_CON_BANCO.includes(data.producto) ||
      (data.banco && data.banco.length > 0),
    {
      message: "Selecciona el banco financista.",
      path: ["banco"],
    }
  )

export type NuevaSolicitudInternaValues = z.infer<
  typeof nuevaSolicitudInternaSchema
>

export const nuevaSolicitudInternaDefaults: NuevaSolicitudInternaValues = {
  // "" representa "sin seleccionar" en el Select; no pertenece al enum de
  // CANALES_ORIGEN, por eso el cast — el resolver igual exige un valor
  // válido del enum antes de poder enviar el formulario.
  canal: "" as NuevaSolicitudInternaValues["canal"],
  cliente: "",
  tipoInforme: "",
  banco_id: "",
  sucursal_originadora: "",
  ejecutivo_solicitante: "",
  n_operacion_cliente: "",
  direccion: "",
  region: "",
  comuna: "",
  tipoPropiedad: "",
  valorUf: "",
  rut: "",
  nombre: "",
  telefono: "",
  email: "",
  producto: "",
  banco: "",
  observaciones: "",
  // El checklist real se construye en NewRequestSheet a partir del prop
  // `tiposDocumento` (Airtable D_TipoDocumento vía fetchTiposDocumento()).
  documentos: [],
}
