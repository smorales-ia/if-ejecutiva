import { z } from "zod"
import { validarRut, PRODUCTOS_CON_BANCO } from "@/lib/console-data"

/**
 * Schema de validación del formulario "Nueva solicitud interna" (IF-02, v1.9).
 * 4 secciones: A · Origen y cliente, B · Propiedad (con N unidades),
 * C · Personas de la operación, D · Producto y observaciones.
 * Mensajes en español de Chile.
 *
 * IMPORTANTE: no usamos `.default()` ni `.optional()` en los campos de texto.
 * Eso mantiene idénticos los tipos de entrada y salida del schema y evita el
 * conflicto de genéricos entre `useForm`, `zodResolver` y `Control`. Los campos
 * verdaderamente opcionales se modelan como `z.string()` (se permite "").
 */

/** Archivo de respaldo (compartido con DocumentoArchivo de file-upload/checklist). */
const archivoSchema = z.object({
  nombre: z.string(),
  tamanio_kb: z.number(),
  mime_type: z.string(),
  url_local: z.string(),
})

export type ArchivoFormulario = z.infer<typeof archivoSchema>

/** Sub-ítem secundario de una unidad. */
const subItemSchema = z.object({
  id: z.string(),
  tipoBien: z.string().min(1, "Selecciona el tipo de bien."),
  detalle: z.string(),
})

/** Unidad tasable (bloque repetible dentro de la Sección B). */
export const unidadSchema = z
  .object({
    id: z.string(),
    ubicacion: z.string().min(1, "Indica depto / torre / piso."),
    modelo: z.string(),
    tipoBien: z.string().min(1, "Selecciona el tipo de bien."),
    // "con_rol" | "uso_goce"
    rolModo: z.enum(["con_rol", "uso_goce"]),
    rolSii: z.string(),
    rolEnTramite: z.boolean(),
    supConstruida: z.string().min(1, "Ingresa la superficie construida."),
    supTerraza: z.string(),
    supTerreno: z.string(),
    anioConstruccion: z.string(),
    material: z.string().min(1, "Selecciona el material predominante."),
    m2Ampliacion: z.string(),
    regularizable: z.enum(["si", "no", ""]),
    origenSuperficie: z.string().min(1, "Selecciona el origen de la superficie."),
    respaldo: archivoSchema.nullable(),
    detalleItem: z.string(),
    subItems: z.array(subItemSchema),
  })
  .superRefine((u, ctx) => {
    if (u.rolModo === "con_rol" && !u.rolEnTramite && u.rolSii.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa el rol SII o marca “En trámite”.",
        path: ["rolSii"],
      })
    }
    if (u.respaldo === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Adjunta el respaldo de esta unidad.",
        path: ["respaldo"],
      })
    }
    if (u.tipoBien === "Obras complementarias" && u.detalleItem.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Detalla el ítem de obras complementarias.",
        path: ["detalleItem"],
      })
    }
  })

export type UnidadFormulario = z.infer<typeof unidadSchema>

/** Contacto de visita (bloque repetible dentro de la Sección C). */
export const contactoVisitaSchema = z.object({
  id: z.string(),
  rol: z.string().min(1, "Selecciona el rol."),
  nombre: z.string().min(1, "Ingresa el nombre."),
  telefono: z.string(),
  email: z.string(),
  estado: z.string().min(1, "Selecciona el estado del contacto."),
})

export type ContactoVisitaFormulario = z.infer<typeof contactoVisitaSchema>

export const nuevaSolicitudInternaSchema = z
  .object({
    // ── Contexto del wizard ──────────────────────────────────────────────
    tipoPropiedadNuevoUsado: z.enum(["nuevo", "usado"]),

    // ── Sección A · Origen y cliente ─────────────────────────────────────
    canal: z.string().min(1, "Selecciona el canal de origen."),
    cliente: z.string().min(1, "Selecciona un cliente."),
    tipoClienteOrigen: z.string().min(1, "Selecciona el tipo de cliente."),
    tipoInforme: z.string().min(1, "Selecciona el tipo de informe."),
    banco_id: z.string().min(1, "Selecciona un banco."),
    sucursal_originadora: z.string(),
    ejecutivo_solicitante: z.string(),
    ejec_comercializador: z.string(),
    ejec_formalizador: z.string(),
    n_operacion_cliente: z
      .string()
      .min(1, "Necesitamos el N° de operación del banco.")
      .max(20),

    // ── Sección B · Propiedad ────────────────────────────────────────────
    proyecto: z.string(),
    direccion: z.string().min(3, "Ingresa la dirección de la propiedad."),
    origenDireccion: z.string().min(1, "Selecciona el origen de la dirección."),
    region: z.string().min(1, "Selecciona una región."),
    comuna: z.string().min(1, "Selecciona una comuna."),
    tipoPropiedad: z.string().min(1, "Selecciona el tipo de propiedad."),
    estadoConservacion: z.string().min(1, "Selecciona el estado de conservación."),

    // B.2 · Vendedor (datos de la propiedad)
    vendedorRazonSocial: z.string(),
    vendedorRutInmobiliaria: z.string(),
    vendedorNombre: z.string(),
    vendedorRut: z.string(),
    vendedorCorreo: z.string(),
    vendedorTelefono: z.string(),
    vendedorOrigenDato: z.string().min(1, "Selecciona el origen del dato."),

    // B.3 · Unidades
    unidades: z.array(unidadSchema).min(1, "Agrega al menos una unidad."),

    // ── Sección C · Personas de la operación ─────────────────────────────
    compradorRut: z
      .string()
      .min(1, "Ingresa el RUT del comprador.")
      .refine((v) => validarRut(v), "RUT inválido"),
    compradorNombre: z.string().min(3, "Ingresa el nombre completo."),
    compradorEmail: z
      .string()
      .min(1, "Ingresa el email.")
      .email("Email inválido"),
    compradorTelefono: z.string(),
    vendedorCoincideComprador: z.boolean(),
    contactosVisita: z
      .array(contactoVisitaSchema)
      .min(1, "Agrega al menos un contacto de visita."),

    // ── Sección D · Producto y observaciones ─────────────────────────────
    producto: z.string().min(1, "Selecciona un producto."),
    banco: z.string(),
    observaciones: z.string(),

    // Bloque financiero (sólo nuevo)
    valorTotalUf: z.string(),
    subsidio: z.string(),
    ahorro: z.string(),
    mutuo: z.string(),
    pagoContado: z.string(),
    bonoCaptacion: z.string(),
    bonoIntegracion: z.string(),
    precioVenta: z.string(),
  })
  .superRefine((data, ctx) => {
    // Banco financista requerido para hipotecario / refinanciamiento.
    if (
      PRODUCTOS_CON_BANCO.includes(data.producto) &&
      (!data.banco || data.banco.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona el banco financista.",
        path: ["banco"],
      })
    }

    // Proyecto obligatorio en propiedades nuevas.
    if (
      data.tipoPropiedadNuevoUsado === "nuevo" &&
      data.proyecto.trim() === ""
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa el nombre del proyecto o condominio.",
        path: ["proyecto"],
      })
    }

    // Al menos un contacto de visita con teléfono.
    const algunTelefono = data.contactosVisita.some(
      (c) => (c.telefono ?? "").trim() !== "",
    )
    if (!algunTelefono) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Al menos un contacto de visita debe tener teléfono.",
        path: ["contactosVisita"],
      })
    }
  })

export type NuevaSolicitudInternaValues = z.infer<
  typeof nuevaSolicitudInternaSchema
>

let unidadSeq = 0
let contactoSeq = 0

/** Crea una unidad vacía para el bloque repetible. */
export function nuevaUnidad(): UnidadFormulario {
  unidadSeq += 1
  return {
    id: `unidad-${Date.now()}-${unidadSeq}`,
    ubicacion: "",
    modelo: "",
    tipoBien: "",
    rolModo: "con_rol",
    rolSii: "",
    rolEnTramite: false,
    supConstruida: "",
    supTerraza: "",
    supTerreno: "",
    anioConstruccion: "",
    material: "",
    m2Ampliacion: "",
    regularizable: "",
    origenSuperficie: "",
    respaldo: null,
    detalleItem: "",
    subItems: [],
  }
}

/** Crea un contacto de visita vacío para el bloque repetible. */
export function nuevoContacto(): ContactoVisitaFormulario {
  contactoSeq += 1
  return {
    id: `contacto-${Date.now()}-${contactoSeq}`,
    rol: "",
    nombre: "",
    telefono: "",
    email: "",
    estado: "Válido",
  }
}

export const nuevaSolicitudInternaDefaults: NuevaSolicitudInternaValues = {
  tipoPropiedadNuevoUsado: "usado",
  canal: "",
  cliente: "",
  tipoClienteOrigen: "",
  tipoInforme: "",
  banco_id: "",
  sucursal_originadora: "",
  ejecutivo_solicitante: "",
  ejec_comercializador: "",
  ejec_formalizador: "",
  n_operacion_cliente: "",
  proyecto: "",
  direccion: "",
  origenDireccion: "",
  region: "",
  comuna: "",
  tipoPropiedad: "",
  estadoConservacion: "",
  vendedorRazonSocial: "",
  vendedorRutInmobiliaria: "",
  vendedorNombre: "",
  vendedorRut: "",
  vendedorCorreo: "",
  vendedorTelefono: "",
  vendedorOrigenDato: "",
  unidades: [nuevaUnidad()],
  compradorRut: "",
  compradorNombre: "",
  compradorEmail: "",
  compradorTelefono: "",
  vendedorCoincideComprador: false,
  contactosVisita: [nuevoContacto()],
  producto: "",
  banco: "",
  observaciones: "",
  valorTotalUf: "",
  subsidio: "",
  ahorro: "",
  mutuo: "",
  pagoContado: "",
  bonoCaptacion: "",
  bonoIntegracion: "",
  precioVenta: "",
}
