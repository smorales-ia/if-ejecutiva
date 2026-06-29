import { z } from "zod"
import { validarRut, PRODUCTOS_CON_BANCO } from "@/lib/console-data"

/**
 * Schema de validación del formulario "Nueva solicitud interna" (IF-02).
 * La ejecutiva ingresa todos los datos que en el flujo externo capturaba
 * el solicitante. Mensajes en español de Chile, sin tecnicismos.
 */
export const nuevaSolicitudInternaSchema = z
  .object({
    // Sección A · Origen de la solicitud
    canal: z.string().min(1, "Selecciona el canal de origen."),
    cliente: z.string().min(1, "Selecciona un cliente."),
    tipoInforme: z.string().min(1, "Selecciona el tipo de informe."),

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
  canal: "",
  cliente: "",
  tipoInforme: "",
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
}
