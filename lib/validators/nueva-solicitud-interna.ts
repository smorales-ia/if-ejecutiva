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
export const nuevaSolicitudInternaSchema = z
  .object({
    // Sección A · Origen de la solicitud
    canal: z.enum(CANALES_ORIGEN, "Selecciona el canal de origen."),
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
    direccion: z.string().min(3, "Ingresa la dirección de la propiedad."),
    region: z.string().min(1, "Selecciona una región."),
    comuna: z.string().min(1, "Selecciona una comuna."),
    tipoPropiedad: z.string().min(1, "Selecciona el tipo de propiedad."),
    valorUf: z.string().optional(),

    // Sección C · Datos del solicitante final
    rut: z
      .string()
      .min(1, "Ingresa el RUT del propietario.")
      .refine((v) => validarRut(v), "RUT inválido"),
    nombre: z.string().min(3, "Ingresa el nombre completo."),
    telefono: z.string().optional(),
    email: z.string().min(1, "Ingresa el email.").email("Email inválido"),

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
