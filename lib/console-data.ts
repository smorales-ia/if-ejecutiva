export type EstadoSolicitud =
  | "creada"
  | "asignada"
  | "visitada"
  | "calculada"
  | "pdf_listo"
  | "aprobada"
  | "devuelta"
  | "pendiente_final"
  | "entregada"
  | "cerrada"
  | "cancelada"
  | "requiere_atencion"

export type Prioridad = "normal" | "urgente" | "critico"

/** Catálogo cerrado de prioridades (para filtros P5). */
export const PRIORIDAD = ["normal", "urgente", "critico"] as const

/** Clasificación estructural de la propiedad. Controla la forma del formulario. */
export type NuevoUsado = "nuevo" | "usado"

/** Estado del correo de asignación (SC13). */
export type EstadoCorreo = "enviado" | "pendiente" | "error"

/** Comprador / cliente final evaluado. */
export interface Comprador {
  rut: string
  nombre: string
  email: string
  telefono: string
}

/**
 * Vendedor de la operación. Persona natural (usado) o inmobiliaria (nuevo).
 * `esInmobiliaria` decide qué campos aplican.
 */
export interface Vendedor {
  esInmobiliaria: boolean
  razonSocial?: string
  rutInmobiliaria?: string
  nombre?: string
  rut?: string
  correo: string
  telefono: string
  origenDato: string
}

/**
 * Contacto de coordinación de visita. El primero es el contacto principal.
 *
 * Respaldo real: `TX_ContactosVisita` (`tblW3SSbKo6vRjwBJ`). El orden lo
 * resuelve Airtable por `orden_prioridad` asc — la UI nunca reordena.
 * `estado` mapea el campo `estado_contacto` del schema real.
 */
export interface ContactoVisita {
  id: string
  rol: string
  nombre: string
  telefono: string
  email: string
  estado: string
  /** `orden_prioridad` asc. Opcional: los mocks y el formulario no lo definen. */
  ordenPrioridad?: number
}

/** Unidad tasable dentro de una solicitud (depto, estacionamiento, bodega, etc.). */
export interface Unidad {
  id: string
  /** Depto / Torre / Piso. */
  ubicacion: string
  /** Sólo aplica en propiedades nuevas. */
  modelo?: string
  tipoBien: string
  /** true = con rol SII, false = uso y goce. */
  conRol: boolean
  rolSii: string
  rolEnTramite: boolean
  /**
   * `null` = superficie no declarada. No es lo mismo que 0 (C-3, 30-jul-2026):
   * `hydrateUnidades` leía un `sup_m2` vacío como 0 y el guardado siguiente lo
   * escribía en Airtable como una superficie real de cero metros.
   */
  supConstruida: number | null
  supTerraza?: number
  supTerreno?: number
  anioConstruccion: string
  material: string
  /** Sólo aplica en usado. */
  m2Ampliacion?: number
  regularizable?: boolean
  origenSuperficie: string
  /** Nombre del archivo de respaldo (obligatorio en el formulario). */
  respaldo: string | null
  /** Requerido sólo si tipoBien === "Obras complementarias". */
  detalleItem?: string
  /** Sub-ítems secundarios asociados a la misma unidad. */
  subItems?: { id: string; tipoBien: string; detalle: string }[]
}

/** Bloque financiero (sólo propiedades nuevas). */
export interface Financiero {
  valorTotalUf?: string
  subsidio?: string
  ahorro?: string
  mutuo?: string
  pagoContado?: string
  bonoCaptacion?: string
  bonoIntegracion?: string
  precioVenta?: string
}

export interface Solicitud {
  id: string
  codigoExt: string
  cliente: string
  comuna: string
  estado: EstadoSolicitud
  /** Días restantes de SLA. Negativo = vencido. */
  slaDias: number
  /** Total de días hábiles del SLA aplicable. */
  slaTotal: number
  prioridad: Prioridad
  tasador: string
  visador: string
  fechaLimite: string
  fechaSolicitud: string
  modificado: string
  modificadoPor: string
  // Datos extendidos para el detalle
  tipoInforme: string
  tipoPropiedad: string
  /** Nuevo / Usado — determina qué campos y bloques se muestran. */
  tipoPropiedadNuevoUsado: NuevoUsado
  banco: string
  producto: string
  direccion: string
  region: string
  montoUf: string
  propietario: string
  rut: string
  email: string
  fechaVisita: string
  slaAplicable: string
  observaciones: string
  /**
   * Canal por el que el cliente hizo el contacto original
   * (`canal_contacto_original`, catálogo `CANALES_ORIGEN`). Editable.
   */
  canal: string
  /**
   * Canal por el que la fila entró al sistema (`origen_canal`:
   * `ingreso_manual` · `tally_externo` · `api` · `migracion_inicial`). No es
   * editable, pero SC-Edicion lo reescribe en cada ejecución, así que hay que
   * devolvérselo intacto. Opcional porque los mocks no lo definen.
   */
  origenCanal?: string
  // Datos de la operación (v1.9)
  comprador: Comprador
  vendedor: Vendedor
  unidades: Unidad[]
  contactosVisita: ContactoVisita[]
  /** Número de reasignaciones ya realizadas sobre esta solicitud. */
  contadorReasignaciones: number
  fechaAsignacion?: string
  estadoCorreo?: EstadoCorreo
  financiero?: Financiero
  proyecto?: string
  estadoConservacion?: string
  // Campos v1.9 (opcionales para no romper mocks existentes) — ver P1
  /** Ejecutivo formalizador (Sección A · nuevo v1.9). */
  ejecFormalizador?: string
  /**
   * Ejecutivo comercializador (Sección A · §1.4 "Origen").
   * Espeja `TX_Solicitudes.ejecutivo_comercializador` (`fldDP232hBLsZ0PWJ`,
   * singleLineText), creado el 30-jul-2026 para cerrar el bloqueo V-4: §1.4
   * pedía el control pero no existía campo destino en el schema.
   */
  ejecutivoComercializador?: string
  /** Modo con el que se creó la solicitud. */
  modoCreacion?: ModoCreacion
  /** Tipo de cliente de origen (catálogo TIPOS_CLIENTE_ORIGEN). */
  tipoClienteOrigen?: string
  /** Origen de la dirección declarada (RN-46). */
  origenDireccion?: OrigenDireccion
  /** Hilo único de correo por solicitud (RN-52). */
  emailThreadId?: string
  /** Nivel de SLA en español (verde/ámbar/rojo) — deriva de slaTone(). */
  nivelSla?: NivelSLA

  // ── Campos operacionales de TX_Solicitudes (Tanda D-02, 29-jul-2026) ──────
  // Todos opcionales: el tipo lo construyen también los 8 mocks de este archivo
  // y el formulario de alta, que no los conocen. Se excluyen deliberadamente
  // los ~17 `*_override` (motor AT01–AT10, fuera de CU-002) y los 8 `fin_*_uf`
  // (duplicado histórico de `financiero_*_uf`, deuda ya registrada).

  /** `n_operacion_cliente` — número de operación del cliente. Es `number` en
   *  Airtable y texto en el formulario; aquí se conserva como number. */
  nOperacionCliente?: number
  /** `sucursal_originadora` — ⚠ el campo real tiene un espacio final en
   *  Airtable (D-08), por eso se lee por FIELD_ID y no por nombre. */
  sucursalOriginadora?: string
  correoClienteRef?: string
  /** `nro_interno` — folio interno del cliente. */
  nroInterno?: string
  /** `numero_solicitud` — distinto de `codigo_solicitud`; texto libre. */
  numeroSolicitud?: string
  /** `rol_sii` a nivel de solicitud (las unidades tienen el suyo propio). */
  rolSii?: string
  /** `notas` — nota genérica; no confundir con `observaciones_internas`. */
  notas?: string
  solicitanteNombre?: string
  solicitanteTelefono?: string
  profesionSolicitante?: string
  /** `banco_financista` (link) — distinto del `banco` de texto plano. */
  bancoFinancista?: string
  origenDato?: string
  velocidadVenta?: string
  supTerrenoM2?: number
  supConstruccionM2?: number
  anioConstruccion?: number
  valorComercialUf?: number
  avaluoFiscalClp?: number
  comisionOv?: number
  ufDiaVisita?: number
  /** `fecha_visita` — la real, distinta de `fecha_visita_programada`. */
  fechaVisitaReal?: string
  fechaEntrega?: string
  fechaCierre?: string
  pdfFinalUrl?: string
  tienePendientesVisador?: boolean
  /** `dias_desde_solicitud` — formula, read-only. */
  diasDesdeSolicitud?: number
  /** `fecha_creacion` (createdTime) — read-only, distinta de `fecha_solicitud`. */
  fechaCreacion?: string
  /** `ultima_modificacion` (lastModifiedTime) — read-only. */
  ultimaModificacion?: string
}

export const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
  creada: "Creada",
  asignada: "Asignada",
  visitada: "Visitada",
  calculada: "Calculada",
  pdf_listo: "PDF listo",
  aprobada: "Aprobada",
  devuelta: "Devuelta",
  pendiente_final: "Pendiente final",
  entregada: "Entregada",
  cerrada: "Cerrada",
  cancelada: "Cancelada",
  requiere_atencion: "Requiere atención",
}

/** Clases Tailwind (bg / text / border) por estado. */
export const ESTADO_CLASSES: Record<EstadoSolicitud, string> = {
  creada: "bg-blue-50 text-blue-700 border-blue-200",
  asignada: "bg-indigo-50 text-indigo-700 border-indigo-200",
  visitada: "bg-teal-50 text-teal-700 border-teal-200",
  calculada: "bg-purple-50 text-purple-700 border-purple-200",
  pdf_listo: "bg-violet-50 text-violet-700 border-violet-200",
  aprobada: "bg-green-50 text-green-700 border-green-200",
  devuelta: "bg-orange-50 text-orange-700 border-orange-200",
  pendiente_final: "bg-yellow-50 text-yellow-800 border-yellow-200",
  entregada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cerrada: "bg-gray-100 text-gray-600 border-gray-200",
  cancelada: "bg-red-50 text-red-700 border-red-200",
  requiere_atencion: "bg-amber-50 text-amber-700 border-amber-200",
}

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  normal: "Normal",
  urgente: "Urgente",
  critico: "Crítico",
}

export const PRIORIDAD_CLASSES: Record<Prioridad, string> = {
  normal: "bg-gray-100 text-gray-600 border-gray-200",
  urgente: "bg-orange-50 text-[#b45309] border-orange-200",
  critico: "bg-red-50 text-red-700 border-red-200",
}

export type SlaTone = "green" | "amber" | "red"

export function slaTone(dias: number, total: number): SlaTone {
  if (dias < 0) return "red"
  const ratio = total > 0 ? dias / total : 0
  if (ratio > 0.4) return "green"
  return "amber"
}

export const SLA_CLASSES: Record<SlaTone, string> = {
  green: "bg-green-50 text-[#15803d] border-green-200",
  amber: "bg-amber-50 text-[#d97706] border-amber-200",
  red: "bg-red-50 text-[#b91c1c] border-red-200",
}

export function slaLabel(dias: number): string {
  if (dias < 0) return `${dias} días`
  if (dias === 1) return "1 día"
  return `${dias} días`
}

export const ESTADO_CORREO_LABELS: Record<EstadoCorreo, string> = {
  enviado: "Enviado",
  pendiente: "Pendiente",
  error: "Con error",
}

export const ESTADO_CORREO_CLASSES: Record<EstadoCorreo, string> = {
  enviado: "bg-green-50 text-[#15803d] border-green-200",
  pendiente: "bg-amber-50 text-[#d97706] border-amber-200",
  error: "bg-red-50 text-[#b91c1c] border-red-200",
}

// ──────────────────────────────────────────────────────────────────────────
// Datos de operación de ejemplo (helpers para mantener el mock legible)
// ──────────────────────────────────────────────────────────────────────────

const compradorDe = (
  nombre: string,
  rut: string,
  email: string,
  telefono: string,
): Comprador => ({ nombre, rut, email, telefono })

/** Solicitud enriquecida con unidades múltiples: depto + estacionamiento + bodega. */
function unidadesDepto(prefijo: string): Unidad[] {
  return [
    {
      id: `${prefijo}-u1`,
      ubicacion: "Torre B · Piso 7 · Depto 72",
      tipoBien: "Edificación",
      conRol: true,
      rolSii: "2451-18",
      rolEnTramite: false,
      supConstruida: 68,
      supTerraza: 8,
      anioConstruccion: "2019",
      material: "Hormigón",
      origenSuperficie: "Plano",
      respaldo: "plano_depto_72.pdf",
    },
    {
      id: `${prefijo}-u2`,
      ubicacion: "Subterráneo -2 · E-118",
      tipoBien: "Estacionamiento cubierto",
      conRol: true,
      rolSii: "2451-45",
      rolEnTramite: false,
      supConstruida: 12,
      anioConstruccion: "2019",
      material: "Hormigón",
      origenSuperficie: "Plano",
      respaldo: "plano_estac_118.pdf",
    },
    {
      id: `${prefijo}-u3`,
      ubicacion: "Subterráneo -2 · B-54",
      tipoBien: "Bodega",
      conRol: false,
      rolSii: "",
      rolEnTramite: false,
      supConstruida: 4,
      anioConstruccion: "2019",
      material: "Hormigón",
      origenSuperficie: "Plano",
      respaldo: "plano_bodega_54.pdf",
    },
  ]
}

/** Unidad única (casa o local). */
function unidadUnica(prefijo: string, tipoBien: string, sup: number): Unidad[] {
  return [
    {
      id: `${prefijo}-u1`,
      ubicacion: "Unidad principal",
      tipoBien,
      conRol: true,
      rolSii: "1204-7",
      rolEnTramite: false,
      supConstruida: sup,
      supTerreno: sup + 60,
      anioConstruccion: "2008",
      material: "Albañilería",
      origenSuperficie: "Certificado de avalúo",
      respaldo: "certificado_avaluo.pdf",
    },
  ]
}

function contacto(
  id: string,
  rol: string,
  nombre: string,
  telefono: string,
  email: string,
  // `rol` y `estado` son los slugs de `TX_ContactosVisita`, igual que en los
  // datos reales — las etiquetas se resuelven al pintar con `etiquetaCatalogo`.
  estado = "valido",
): ContactoVisita {
  return { id, rol, nombre, telefono, email, estado }
}

export const SOLICITUDES: Solicitud[] = [
  {
    id: "1",
    codigoExt: "VP-2024-0081",
    cliente: "Banco Santander",
    comuna: "Las Condes",
    estado: "asignada",
    slaDias: 2,
    slaTotal: 5,
    prioridad: "urgente",
    tasador: "Javier Mora",
    visador: "Ana Contreras",
    fechaLimite: "28 jun 2026",
    fechaSolicitud: "23 jun 2026",
    modificado: "hace 2 horas",
    modificadoPor: "María Espinoza",
    tipoInforme: "Tasación hipotecaria",
    tipoPropiedad: "Departamento",
    tipoPropiedadNuevoUsado: "usado",
    banco: "Banco Santander",
    producto: "Crédito hipotecario",
    direccion: "Av. Apoquindo 3500, Dpto 72-B",
    region: "Metropolitana",
    montoUf: "4.200 UF",
    propietario: "Roberto Fuentes Díaz",
    rut: "12.456.789-3",
    email: "rfuentes@gmail.com",
    fechaVisita: "27 jun 2026",
    slaAplicable: "5 días hábiles",
    observaciones:
      "Propiedad con acceso restringido, coordinar con conserje al menos 24 hrs antes.",
    canal: "whatsapp",
    comprador: compradorDe(
      "Roberto Fuentes Díaz",
      "12.456.789-3",
      "rfuentes@gmail.com",
      "+56 9 8123 4567",
    ),
    vendedor: {
      esInmobiliaria: false,
      nombre: "Marta Gálvez Ruiz",
      rut: "8.765.432-1",
      correo: "mgalvez@gmail.com",
      telefono: "+56 9 7654 3210",
      origenDato: "correo",
    },
    unidades: unidadesDepto("s1"),
    contactosVisita: [
      contacto("s1-c1", "propietario","Roberto Fuentes Díaz", "+56 9 8123 4567", "rfuentes@gmail.com"),
      contacto("s1-c2", "conserje","Turno edificio", "+56 2 2345 6789", "conserjeria@edificio.cl", "no_contesta"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "24 jun 2026 · 10:12",
    estadoCorreo: "enviado",
    estadoConservacion: "bueno",
  },
  {
    id: "2",
    codigoExt: "VP-2024-0079",
    cliente: "Banco de Chile",
    comuna: "Providencia",
    estado: "requiere_atencion",
    slaDias: -2,
    slaTotal: 5,
    prioridad: "critico",
    tasador: "Carolina Reyes",
    visador: "Ana Contreras",
    fechaLimite: "21 jun 2026",
    fechaSolicitud: "16 jun 2026",
    modificado: "hace 5 horas",
    modificadoPor: "María Espinoza",
    tipoInforme: "Tasación hipotecaria",
    tipoPropiedad: "Casa",
    tipoPropiedadNuevoUsado: "usado",
    banco: "Banco de Chile",
    producto: "Crédito hipotecario",
    direccion: "Los Leones 1240",
    region: "Metropolitana",
    montoUf: "8.900 UF",
    propietario: "Patricia Soto Vera",
    rut: "9.876.543-2",
    email: "psoto@outlook.com",
    fechaVisita: "19 jun 2026",
    slaAplicable: "5 días hábiles",
    observaciones: "Cliente reclama demora. Escalar con jefatura.",
    canal: "email",
    comprador: compradorDe(
      "Patricia Soto Vera",
      "9.876.543-2",
      "psoto@outlook.com",
      "+56 9 6543 2100",
    ),
    vendedor: {
      esInmobiliaria: false,
      nombre: "Hernán Ríos Pino",
      rut: "7.654.321-0",
      correo: "hrios@gmail.com",
      telefono: "+56 9 5432 1098",
      origenDato: "ficha",
    },
    unidades: unidadUnica("s2", "Edificación", 145),
    contactosVisita: [
      contacto("s2-c1", "propietario","Patricia Soto Vera", "+56 9 6543 2100", "psoto@outlook.com"),
    ],
    contadorReasignaciones: 1,
    fechaAsignacion: "17 jun 2026 · 09:30",
    estadoCorreo: "enviado",
    estadoConservacion: "normal",
  },
  {
    id: "3",
    codigoExt: "VP-2024-0083",
    cliente: "BCI",
    comuna: "Ñuñoa",
    estado: "creada",
    slaDias: 4,
    slaTotal: 5,
    prioridad: "normal",
    tasador: "Sin asignar",
    visador: "Sin asignar",
    fechaLimite: "30 jun 2026",
    fechaSolicitud: "23 jun 2026",
    modificado: "hace 1 hora",
    modificadoPor: "María Espinoza",
    tipoInforme: "Tasación comercial",
    tipoPropiedad: "Local comercial",
    tipoPropiedadNuevoUsado: "nuevo",
    banco: "BCI",
    producto: "Crédito comercial",
    direccion: "Av. Irarrázaval 4521",
    region: "Metropolitana",
    montoUf: "12.500 UF",
    propietario: "Inmobiliaria Andes SpA",
    rut: "76.123.456-7",
    email: "contacto@andes.cl",
    fechaVisita: "Por agendar",
    slaAplicable: "5 días hábiles",
    observaciones: "Requiere coordinación con administración del edificio.",
    canal: "web",
    proyecto: "Edificio Andes Center",
    comprador: compradorDe(
      "Comercial Ñuñoa Ltda.",
      "77.888.999-0",
      "gerencia@comercialnunoa.cl",
      "+56 2 2987 6543",
    ),
    vendedor: {
      esInmobiliaria: true,
      razonSocial: "Inmobiliaria Andes SpA",
      rutInmobiliaria: "76.123.456-7",
      correo: "ventas@andes.cl",
      telefono: "+56 2 2456 7890",
      origenDato: "correo",
    },
    unidades: [
      {
        id: "s3-u1",
        ubicacion: "Local 3 · Nivel calle",
        modelo: "Local tipo B",
        tipoBien: "Edificación",
        conRol: true,
        rolSii: "3120-9",
        rolEnTramite: true,
        supConstruida: 210,
        anioConstruccion: "2025",
        material: "Hormigón",
        origenSuperficie: "Carta o ficha inmobiliaria",
        respaldo: "ficha_local_3.pdf",
      },
    ],
    contactosVisita: [
      contacto("s3-c1", "corredor","Sofía Martínez", "+56 9 4321 0987", "smartinez@andes.cl"),
    ],
    contadorReasignaciones: 0,
    estadoConservacion: "nuevo",
    financiero: {
      valorTotalUf: "12.500",
      subsidio: "0",
      ahorro: "2.500",
      mutuo: "9.000",
      pagoContado: "1.000",
      precioVenta: "12.500",
    },
  },
  {
    id: "4",
    codigoExt: "VP-2024-0080",
    cliente: "Banco Estado",
    comuna: "Maipú",
    estado: "visitada",
    slaDias: 3,
    slaTotal: 6,
    prioridad: "normal",
    tasador: "Javier Mora",
    visador: "Diego Salinas",
    fechaLimite: "29 jun 2026",
    fechaSolicitud: "22 jun 2026",
    modificado: "hace 3 horas",
    modificadoPor: "Javier Mora",
    tipoInforme: "Tasación hipotecaria",
    tipoPropiedad: "Departamento",
    tipoPropiedadNuevoUsado: "usado",
    banco: "Banco Estado",
    producto: "Crédito hipotecario",
    direccion: "Av. Pajaritos 2890, Dpto 304",
    region: "Metropolitana",
    montoUf: "3.100 UF",
    propietario: "Luis Tapia Rojas",
    rut: "15.234.567-8",
    email: "ltapia@gmail.com",
    fechaVisita: "23 jun 2026",
    slaAplicable: "6 días hábiles",
    observaciones: "Visita realizada sin observaciones.",
    canal: "whatsapp",
    comprador: compradorDe(
      "Luis Tapia Rojas",
      "15.234.567-8",
      "ltapia@gmail.com",
      "+56 9 3210 9876",
    ),
    vendedor: {
      esInmobiliaria: false,
      nombre: "Claudia Vega Soto",
      rut: "10.345.678-9",
      correo: "cvega@gmail.com",
      telefono: "+56 9 2109 8765",
      origenDato: "correo",
    },
    unidades: unidadesDepto("s4"),
    contactosVisita: [
      contacto("s4-c1", "propietario","Luis Tapia Rojas", "+56 9 3210 9876", "ltapia@gmail.com"),
      contacto("s4-c2", "Arrendatario", "Pedro Núñez", "+56 9 1098 7654", "pnunez@gmail.com"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "22 jun 2026 · 15:40",
    estadoCorreo: "enviado",
    estadoConservacion: "bueno",
  },
  {
    id: "5",
    codigoExt: "VP-2024-0077",
    cliente: "Scotiabank",
    comuna: "Vitacura",
    estado: "aprobada",
    slaDias: 1,
    slaTotal: 5,
    prioridad: "urgente",
    tasador: "Carolina Reyes",
    visador: "Ana Contreras",
    fechaLimite: "27 jun 2026",
    fechaSolicitud: "20 jun 2026",
    modificado: "hace 1 día",
    modificadoPor: "Ana Contreras",
    tipoInforme: "Tasación hipotecaria",
    tipoPropiedad: "Casa",
    tipoPropiedadNuevoUsado: "usado",
    banco: "Scotiabank",
    producto: "Crédito hipotecario",
    direccion: "Alonso de Córdova 4100",
    region: "Metropolitana",
    montoUf: "21.000 UF",
    propietario: "Fernanda Vidal Pérez",
    rut: "13.789.012-4",
    email: "fvidal@empresa.cl",
    fechaVisita: "24 jun 2026",
    slaAplicable: "5 días hábiles",
    observaciones: "Informe aprobado por visador. Pendiente entrega final.",
    canal: "email",
    comprador: compradorDe(
      "Fernanda Vidal Pérez",
      "13.789.012-4",
      "fvidal@empresa.cl",
      "+56 9 9876 5432",
    ),
    vendedor: {
      esInmobiliaria: false,
      nombre: "Ignacio Larraín Court",
      rut: "6.543.210-9",
      correo: "ilarrain@gmail.com",
      telefono: "+56 9 8765 4321",
      origenDato: "cert_avaluo",
    },
    unidades: unidadUnica("s5", "Edificación", 320),
    contactosVisita: [
      contacto("s5-c1", "propietario","Fernanda Vidal Pérez", "+56 9 9876 5432", "fvidal@empresa.cl"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "21 jun 2026 · 11:05",
    estadoCorreo: "enviado",
    estadoConservacion: "bueno",
  },
  {
    id: "6",
    codigoExt: "VP-2024-0075",
    cliente: "Banco Santander",
    comuna: "La Florida",
    estado: "asignada",
    slaDias: 1,
    slaTotal: 5,
    prioridad: "normal",
    tasador: "Diego Salinas",
    visador: "Ana Contreras",
    fechaLimite: "27 jun 2026",
    fechaSolicitud: "20 jun 2026",
    modificado: "hace 6 horas",
    modificadoPor: "María Espinoza",
    tipoInforme: "Tasación hipotecaria",
    tipoPropiedad: "Departamento",
    tipoPropiedadNuevoUsado: "nuevo",
    banco: "Banco Santander",
    producto: "Crédito hipotecario",
    direccion: "Av. Vicuña Mackenna 7100, Dpto 1502",
    region: "Metropolitana",
    montoUf: "2.800 UF",
    propietario: "Camila Núñez Lagos",
    rut: "18.456.789-0",
    email: "cnunez@gmail.com",
    fechaVisita: "26 jun 2026",
    slaAplicable: "5 días hábiles",
    observaciones: "Sin observaciones.",
    canal: "web",
    proyecto: "Condominio Mirador La Florida",
    comprador: compradorDe(
      "Camila Núñez Lagos",
      "18.456.789-0",
      "cnunez@gmail.com",
      "+56 9 7777 8888",
    ),
    vendedor: {
      esInmobiliaria: true,
      razonSocial: "Inmobiliaria Mirador SpA",
      rutInmobiliaria: "76.999.111-2",
      correo: "ventas@mirador.cl",
      telefono: "+56 2 2111 2222",
      origenDato: "correo",
    },
    unidades: unidadesDepto("s6"),
    contactosVisita: [
      contacto("s6-c1", "corredor","Andrea Pinto", "+56 9 6666 7777", "apinto@mirador.cl"),
      contacto("s6-c2", "conserje","Recepción torre", "+56 2 2333 4444", "recepcion@mirador.cl"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "20 jun 2026 · 16:20",
    estadoCorreo: "pendiente",
    estadoConservacion: "nuevo",
    financiero: {
      valorTotalUf: "2.800",
      subsidio: "500",
      ahorro: "300",
      mutuo: "1.900",
      pagoContado: "100",
      bonoIntegracion: "80",
      precioVenta: "2.800",
    },
  },
  {
    id: "7",
    codigoExt: "VP-2024-0072",
    cliente: "Itaú",
    comuna: "Providencia",
    estado: "cancelada",
    slaDias: 0,
    slaTotal: 5,
    prioridad: "normal",
    tasador: "Carolina Reyes",
    visador: "Diego Salinas",
    fechaLimite: "25 jun 2026",
    fechaSolicitud: "18 jun 2026",
    modificado: "hace 2 días",
    modificadoPor: "María Espinoza",
    tipoInforme: "Tasación hipotecaria",
    tipoPropiedad: "Departamento",
    tipoPropiedadNuevoUsado: "usado",
    banco: "Itaú",
    producto: "Crédito hipotecario",
    direccion: "Av. Providencia 2330, Dpto 88",
    region: "Metropolitana",
    montoUf: "3.600 UF",
    propietario: "Andrés Lillo Bravo",
    rut: "16.321.654-9",
    email: "alillo@gmail.com",
    fechaVisita: "Cancelada",
    slaAplicable: "5 días hábiles",
    observaciones: "Cliente desistió de la operación de crédito.",
    canal: "whatsapp",
    comprador: compradorDe(
      "Andrés Lillo Bravo",
      "16.321.654-9",
      "alillo@gmail.com",
      "+56 9 5555 6666",
    ),
    vendedor: {
      esInmobiliaria: false,
      nombre: "Rosa Díaz Fuentes",
      rut: "9.111.222-3",
      correo: "rdiaz@gmail.com",
      telefono: "+56 9 4444 5555",
      origenDato: "ficha",
    },
    unidades: unidadUnica("s7", "Edificación", 55),
    contactosVisita: [
      contacto("s7-c1", "propietario","Andrés Lillo Bravo", "+56 9 5555 6666", "alillo@gmail.com"),
    ],
    contadorReasignaciones: 0,
    estadoConservacion: "normal",
  },
  {
    id: "8",
    codigoExt: "VP-2024-0070",
    cliente: "Banco de Chile",
    comuna: "San Miguel",
    estado: "visitada",
    slaDias: 2,
    slaTotal: 5,
    prioridad: "normal",
    tasador: "Javier Mora",
    visador: "Ana Contreras",
    fechaLimite: "28 jun 2026",
    fechaSolicitud: "21 jun 2026",
    modificado: "hace 4 horas",
    modificadoPor: "Javier Mora",
    tipoInforme: "Tasación hipotecaria",
    tipoPropiedad: "Casa",
    tipoPropiedadNuevoUsado: "usado",
    banco: "Banco de Chile",
    producto: "Crédito hipotecario",
    direccion: "Gran Avenida 5400",
    region: "Metropolitana",
    montoUf: "4.900 UF",
    propietario: "Rosa Mella Cárdenas",
    rut: "11.234.567-1",
    email: "rmella@hotmail.com",
    fechaVisita: "23 jun 2026",
    slaAplicable: "5 días hábiles",
    observaciones: "Pendiente cálculo y generación de informe.",
    canal: "email",
    comprador: compradorDe(
      "Rosa Mella Cárdenas",
      "11.234.567-1",
      "rmella@hotmail.com",
      "+56 9 3333 4444",
    ),
    vendedor: {
      esInmobiliaria: false,
      nombre: "Jorge Peña Silva",
      rut: "8.222.333-4",
      correo: "jpena@gmail.com",
      telefono: "+56 9 2222 3333",
      origenDato: "correo",
    },
    unidades: unidadUnica("s8", "Edificación", 98),
    contactosVisita: [
      contacto("s8-c1", "propietario","Rosa Mella Cárdenas", "+56 9 3333 4444", "rmella@hotmail.com"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "22 jun 2026 · 08:50",
    estadoCorreo: "enviado",
    estadoConservacion: "bueno",
  },
]

export interface EventoHistorial {
  id: string
  titulo: string
  hace: string
  icono: "check" | "plus" | "alert" | "eye" | "mail" | "upload"
  /** Cuerpo expandible (emails de asignación/reasignación). */
  detalle?: string
}

export const HISTORIAL: EventoHistorial[] = [
  {
    id: "h1",
    titulo: "Acceso al detalle por María Espinoza",
    hace: "hace 30 min",
    icono: "eye",
  },
  {
    id: "h2",
    titulo:
      "Correo de asignación enviado al tasador · Asunto: Nueva asignación VP-2024-0081",
    hace: "hace 1 hora",
    icono: "mail",
    detalle:
      "Para: jmora@vproperty.cl\nAsunto: Nueva asignación VP-2024-0081\n\nEstimado Javier, se te ha asignado la solicitud VP-2024-0081 (Las Condes). Coordina la visita dentro de las próximas 4 horas.",
  },
  {
    id: "h3",
    titulo: "Documento adjuntado: certificado_avaluo.pdf",
    hace: "hace 1 hora",
    icono: "upload",
  },
  {
    id: "h4",
    titulo:
      "Asignación automática completada · Tasador: Javier Mora · Visador: Ana Contreras",
    hace: "hace 2 horas",
    icono: "check",
  },
  {
    id: "h5",
    titulo: "Solicitud creada (canal: WhatsApp) por María Espinoza",
    hace: "hace 2 horas",
    icono: "plus",
  },
]

// ──────────────────────────────────────────────────────────────────────────
// Catálogos maestros (mock) para formularios de la consola
// ──────────────────────────────────────────────────────────────────────────

/**
 * Catálogos que espejan un `singleSelect` de Airtable (27-jul-2026).
 *
 * ## Por qué `{ value, label }` y no un array de strings
 *
 * Hasta la Tanda D estos catálogos eran arrays de etiquetas y los `<SelectItem>`
 * usaban `value={etiqueta}`. Esa etiqueta viajaba intacta por el mapper hasta
 * el módulo 7 de SC01, que la escribía en un `singleSelect` de `TX_Solicitudes`
 * cuyas opciones son slugs. Airtable respondía
 * `[422] Insufficient permissions to create new select option ""Banco""`
 * y el alta completa se perdía. El primer campo ofensor abortaba el create, así
 * que los otros tres mismatches ni siquiera llegaban a manifestarse.
 *
 * **Regla desde el 27-jul-2026**: si un catálogo tiene contraparte
 * `singleSelect` en Airtable, `value` es el nombre EXACTO de la opción y
 * `label` es lo único que ve la Ejecutiva. El mapper no traduce vocabulario:
 * traduce forma (camelCase → snake_case). Ver `lib/mappers/crear-solicitud.ts`.
 *
 * Los `value` de abajo están verificados uno a uno contra el schema vía MCP.
 * Al agregar una opción, créala primero en Airtable — un `value` inventado
 * reproduce exactamente el 422 de arriba.
 */

/** Espeja `TX_Solicitudes.canal_contacto_original` (`fldca1Uza4eicBXL4`). */
export const CANALES_ORIGEN = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "telefono", label: "Teléfono" },
  { value: "presencial", label: "Presencial" },
  // `web` existe en Airtable y los mocks ya lo usaban como "Portal web", pero
  // no era seleccionable en el formulario. Se expone para cerrar esa brecha.
  { value: "web", label: "Portal web" },
  { value: "otro", label: "Otro" },
] as const

/**
 * Tipos de cliente de origen (Sección A). Espeja
 * `TX_Solicitudes.tipo_cliente_origen` (`fldbxZh45lFTB7yVJ`).
 *
 * Los 5 slugs los creó Sergio a mano en Airtable el 27-jul-2026, después de que
 * la Tanda D muriera con `Insufficient permissions to create new select option
 * ""Banco""`: el catálogo describía el **tipo de entidad** del cliente y el
 * select sólo admitía `correo_texto` · `correo_ficha` · `extranet`, que
 * describen **por dónde llegó el caso**. Se decidió conservar la semántica del
 * negocio y ampliar el schema.
 *
 * ⚠ Las 3 opciones viejas siguen existiendo en Airtable —hay filas históricas
 * que las usan— pero **no se exponen en el formulario a propósito**. Si
 * aparecen en un registro antiguo, `etiquetaCatalogo()` las muestra tal cual en
 * vez de dejar el campo en blanco.
 */
/**
 * Espeja las 8 opciones reales de `TX_Solicitudes.tipo_cliente_origen`
 * (`fldbxZh45lFTB7yVJ`), verificadas vía `get_table_schema` el 30-jul-2026.
 *
 * Faltaban `correo_texto`, `correo_ficha` y `extranet` (V-2). Mismo patrón que
 * `TIPOS_BIEN` en C-2: un valor presente en Airtable pero ausente del catálogo
 * de UI hace que el `<Select>` renderice vacío, y al ser este campo editable
 * desde esta tanda, ese vacío se guardaría.
 */
export const TIPOS_CLIENTE_ORIGEN = [
  { value: "banco", label: "Banco" },
  { value: "inmobiliaria", label: "Inmobiliaria" },
  { value: "persona_natural", label: "Persona natural" },
  { value: "corredora", label: "Corredora" },
  { value: "correo_texto", label: "Correo (texto)" },
  { value: "correo_ficha", label: "Correo (ficha)" },
  { value: "extranet", label: "Extranet" },
  { value: "otro", label: "Otro" },
] as const

// ──────────────────────────────────────────────────────────────────────────
// Catálogos migrados a Airtable (Tanda E, 27-jul-2026)
//
// `CLIENTES`, `TIPOS_INFORME_POR_CLIENTE`, `PRODUCTOS_POR_CLIENTE`,
// `PRODUCTO_LABELS`, `BANCOS` y `TIPOS_PROPIEDAD` vivían aquí como listas
// hardcodeadas heredadas del mock v0. Los 5 campos que alimentan divergieron de
// las tablas maestras (`M_Clientes` no tiene "Banco Santander";
// `M_TiposInforme` no tiene "Tasación hipotecaria"; `M_Productos` no tiene
// "hipotecario"), y el `Search Records` de SC01 fallaba en silencio dejando los
// links vacíos en `TX_Solicitudes`.
//
// Ahora se leen en runtime: `lib/catalogos.ts` (server) → `/api/catalogos` →
// `useCatalogos()` (cliente). El desglose por cliente desapareció a propósito:
// ni `M_TiposInforme` ni `M_Productos` tienen relación con `M_Clientes` en el
// schema real (el link `M_Clientes.productos` está poblado en 1 de 90 filas),
// así que el filtrado por cliente era una regla inventada por la UI. RN-XX no
// lo exige y el principio rector es que la UI no decide.
// ──────────────────────────────────────────────────────────────────────────

/**
 * Productos que requieren banco financista.
 *
 * Nombres EXACTOS de `M_Productos.nombre` (verificados vía MCP el 27-jul-2026).
 * Antes eran los slugs inventados `hipotecario` / `refinanciamiento`, que no
 * correspondían a ninguna fila: la condición nunca se cumplía con datos reales
 * y el campo "Banco financista" no llegaba a mostrarse.
 *
 * Sigue siendo lógica de presentación (mostrar u ocultar un campo), no una
 * transición de estado: la validación de negocio vive en `C_ReglasNegocio`.
 */
export const PRODUCTOS_CON_BANCO = [
  "Credito Hipotecario",
  "Refinanciamiento",
  "Refinanciamiento Hipotecario",
]

/** Productos donde el vendedor coincide con el comprador (Sección C). */
export const PRODUCTOS_VENDEDOR_COINCIDE = [
  "Refinanciamiento",
  "Refinanciamiento Hipotecario",
]

/**
 * Compara un nombre de producto contra uno de los dos catálogos de arriba.
 *
 * Case-insensitive y sin espacios de borde a propósito: el nombre viene de una
 * fila de Airtable que se edita a mano, y un `"Refinanciamiento "` con espacio
 * final no debería apagar el campo de banco financista.
 */
export function productoEnLista(
  producto: string | undefined | null,
  lista: readonly string[],
): boolean {
  if (!producto) return false
  const p = producto.trim().toLocaleUpperCase("es")
  return lista.some((x) => x.trim().toLocaleUpperCase("es") === p)
}

/**
 * Estado de conservación (catálogo cerrado de 6). Espeja
 * `TX_Solicitudes.estado_conservacion` (`flde0ExWfB1dhkp4t`).
 */
export const ESTADOS_CONSERVACION = [
  { value: "nuevo", label: "Nuevo" },
  { value: "sin_uso", label: "Sin uso" },
  { value: "bueno", label: "Bueno" },
  { value: "normal", label: "Normal" },
  { value: "malo", label: "Malo" },
  { value: "deficiente", label: "Deficiente" },
] as const

/**
 * Tipo de bien de una unidad — etiquetas de UI de las 11 opciones reales de
 * `TX_Unidades.subtipo` (`fldNU8ee30AvvRWHZ`), verificadas vía
 * `get_table_schema` el 30-jul-2026.
 *
 * Hasta esta tanda la lista tenía 8 entradas y le faltaban 5 opciones que sí
 * existen en Airtable: `Departamento`, `Casa`, `Local`, `Terraza` y
 * `Servidumbre` (C-2). El efecto era silencioso y grave: una unidad con
 * `subtipo = "Departamento"` hidrataba a un `<Select>` que no tenía ese
 * `SelectItem`, así que **la pantalla mostraba el campo vacío** y el guardado
 * materializaba ese vacío. VP-2026-0053 se vació así.
 *
 * El orden importa: `vocabulario-unidades.ts` colapsa las tres variantes de
 * estacionamiento al slug `Estacionamiento` y la vuelta usa la primera
 * declarada. Mantener `cubierto` antes que las otras dos.
 */
export const TIPOS_BIEN = [
  "Departamento",
  "Casa",
  "Edificación",
  "Terreno",
  "Local",
  "Terraza",
  "Estacionamiento cubierto",
  "Estacionamiento descubierto",
  "Estacionamiento uso y goce",
  "Bodega",
  "Piscina",
  "Servidumbre",
  "Obras complementarias",
] as const

/** Origen de la superficie declarada (catálogo cerrado de 5). */
export const ORIGENES_SUPERFICIE = [
  "Carta o ficha inmobiliaria",
  "Plano",
  "Base interna SII",
  "Certificado de avalúo",
  "Medición del tasador",
] as const

/** Material predominante de la edificación. */
export const MATERIALES = [
  "Albañilería",
  "Madera",
  "Hormigón",
  "Mixto",
  "Perfiles metálicos",
] as const

/**
 * Origen de la dirección declarada (RN-46). Espeja
 * `TX_Solicitudes.origen_direccion` (`fldiwBMHujptXHr2D`).
 */
export const ORIGENES_DIRECCION = [
  { value: "ficha_cliente", label: "Ficha del cliente" },
  { value: "cert_avaluo", label: "Certificado de avalúo" },
  { value: "cert_numero", label: "Certificado de número" },
] as const

/**
 * Origen del dato del vendedor. Espeja
 * `TX_Solicitudes.vendedor_origen_dato` (`fldcjrl80Vv1WBmmY`).
 */
export const ORIGENES_DATO_VENDEDOR = [
  { value: "correo", label: "Correo" },
  { value: "ficha", label: "Ficha" },
  { value: "cert_avaluo", label: "Certificado de avalúo" },
] as const

/**
 * Roles de contacto de visita. Espeja `TX_ContactosVisita.rol`
 * (`fldeTuIlU6uxDYwHY`, singleSelect).
 *
 * Los `value` son los slugs reales del campo, en minúscula y sin tilde. Antes
 * eran las etiquetas capitalizadas y viajaban así hasta el módulo 18 de SC01,
 * que crea el contacto con `typecast: true`. Con typecast Airtable **no falla**:
 * inventa la opción que falta. Por eso la limpieza del schema es parte de este
 * arreglo — ver la nota de `ESTADOS_CONTACTO`.
 */
export const ROLES_CONTACTO_VISITA = [
  { value: "propietario", label: "Propietario" },
  { value: "corredor", label: "Corredor" },
  { value: "arrendatario", label: "Arrendatario" },
  { value: "conserje", label: "Conserje" },
  { value: "otro", label: "Otro" },
] as const

/**
 * Estado del contacto de visita. Espeja `TX_ContactosVisita.estado_contacto`
 * (`fldMerAz4OCNhwn4X`, singleSelect).
 *
 * ⚠ **Deuda de schema abierta (27-jul-2026)**: `rol` y `estado_contacto` tienen
 * hoy dos opciones basura cada uno, con el JSON completo de un contacto como
 * nombre de la opción (`{"nombre":"Carolina Andrea Chandía Muñoz",…}`). Las
 * creó una corrida vieja de SC01 que mapeaba el bundle entero del Iterator en
 * vez de `{{17.rol}}`, aprovechando el `typecast: true` del módulo 18. Borrarlas
 * requiere aprobación explícita (regla de CU-002 sobre cambios de schema).
 */
export const ESTADOS_CONTACTO = [
  { value: "valido", label: "Válido" },
  { value: "no_contesta", label: "No contesta" },
  { value: "telefono_erroneo", label: "Teléfono erróneo" },
] as const

/** Motivos de reasignación (catálogo cerrado). */
export const MOTIVOS_REASIGNACION = [
  "Indisponibilidad del tasador",
  "Contacto no logrado reiterado",
  "Fuera de cobertura",
  "Sin respuesta del tasador dentro de las 4 h",
  "Solicitud del cliente",
  "Otro",
] as const

/**
 * Bancos originadores (M_BANCOS) para el campo "Banco" de ORIGEN DE LA SOLICITUD.
 * El valor persistido en TX_Solicitudes.banco es el `id`.
 */
export const M_BANCOS = [
  { id: "banco_estado", nombre: "BancoEstado" },
  { id: "santander", nombre: "Santander" },
  { id: "bci", nombre: "BCI" },
  { id: "banco_chile", nombre: "Banco de Chile" },
  { id: "itau", nombre: "Itaú" },
  { id: "scotiabank", nombre: "Scotiabank" },
  { id: "security", nombre: "Security" },
  { id: "bice", nombre: "BICE" },
  { id: "falabella", nombre: "Falabella" },
  { id: "ripley", nombre: "Ripley" },
] as const

// ──────────────────────────────────────────────────────────────────────────
// Catálogos cerrados v1.9 sin array previo + tipos derivados (P1)
//
// Los tipos de unión se derivan de los `as const` existentes con
// `(typeof ARRAY)[number]`, respetando la convención camelCase del repo y sin
// alterar los valores (labels) que ya consumen list/detail/form. Las entidades
// (`Unidad.tipoBien`, `ContactoVisita.rol`, etc.) siguen tipadas como `string`
// para no romper el mapeo del formulario; estas uniones quedan disponibles para
// que P4/P5 las adopten donde convenga.
// ──────────────────────────────────────────────────────────────────────────

/** Modo de creación del wizard (Fase 1). */
export const MODO_CREACION = ["documentos", "manual"] as const
export type ModoCreacion = (typeof MODO_CREACION)[number]

/** Tipo de persona del vendedor (jurídica = inmobiliaria, natural = usado). */
export const TIPO_PERSONA = ["juridica", "natural"] as const
export type TipoPersona = (typeof TIPO_PERSONA)[number]

/**
 * Nivel de SLA en español. Se alinea con `SlaFiltro` de `lib/solicitudes.ts`.
 * Mapea a `SlaTone` (green/amber/red) vía UI.
 */
export const NIVEL_SLA = ["verde", "ambar", "rojo"] as const
export type NivelSLA = (typeof NIVEL_SLA)[number]

/** Orden de la lista de solicitudes (P5). */
export const ORDEN_SOLICITUDES = [
  "sla_desc",
  "sla_asc",
  "fecha_solicitud_desc",
  "prioridad",
] as const
export type OrdenSolicitudes = (typeof ORDEN_SOLICITUDES)[number]

// Tipos derivados de catálogos cerrados ya existentes.
//
// Los que espejan un `singleSelect` de Airtable derivan del `value` (el slug),
// nunca del `label`: el tipo describe lo que se persiste, no lo que se ve. Los
// que siguen siendo arrays de strings todavía no tienen campo destino.
export type OpcionCatalogo = { readonly value: string; readonly label: string }

export type CanalOrigen = (typeof CANALES_ORIGEN)[number]["value"]
export type TipoClienteOrigen = (typeof TIPOS_CLIENTE_ORIGEN)[number]["value"]
export type TipoBien = (typeof TIPOS_BIEN)[number]
export type OrigenSuperficie = (typeof ORIGENES_SUPERFICIE)[number]
export type EstadoConservacion = (typeof ESTADOS_CONSERVACION)[number]["value"]
export type Material = (typeof MATERIALES)[number]
export type OrigenDireccion = (typeof ORIGENES_DIRECCION)[number]["value"]
export type OrigenDatoVendedor = (typeof ORIGENES_DATO_VENDEDOR)[number]["value"]

/**
 * Traduce un slug persistido a su etiqueta legible. Lo usan las vistas de sólo
 * lectura, que reciben el valor crudo de Airtable y no pasan por un `<Select>`.
 *
 * Devuelve el propio valor si no está en el catálogo: un slug viejo o escrito
 * desde otra interfaz se muestra tal cual en vez de desaparecer.
 */
export function etiquetaCatalogo(
  catalogo: readonly OpcionCatalogo[],
  valor: string | undefined | null,
): string {
  if (!valor) return "—"
  return catalogo.find((o) => o.value === valor)?.label ?? valor
}
export type RolContacto = (typeof ROLES_CONTACTO_VISITA)[number]["value"]
export type EstadoContacto = (typeof ESTADOS_CONTACTO)[number]["value"]
export type MotivoReasignacion = (typeof MOTIVOS_REASIGNACION)[number]


/** Regiones (subconjunto representativo) y sus comunas. */
export const COMUNAS_POR_REGION: Record<string, string[]> = {
  Metropolitana: [
    "Las Condes",
    "Providencia",
    "Vitacura",
    "Ñuñoa",
    "Santiago",
    "La Florida",
    "Maipú",
    "San Miguel",
    "Puente Alto",
  ],
  Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué", "Concón"],
  Biobío: ["Concepción", "Talcahuano", "San Pedro de la Paz"],
  "O'Higgins": ["Rancagua", "Machalí", "San Fernando"],
}

export const REGIONES = Object.keys(COMUNAS_POR_REGION)

/**
 * Deriva la región a partir de la comuna usando el mismo catálogo del Sheet
 * (`COMUNAS_POR_REGION`), ya que `TX_Solicitudes` no guarda la región propia.
 * `COMUNAS_POR_REGION` es un subconjunto representativo — comunas fuera de él
 * devuelven "—" (RF-05 detalle, Paso 3).
 */
export function regionDeComuna(comuna: string): string {
  for (const [region, comunas] of Object.entries(COMUNAS_POR_REGION)) {
    if (comunas.includes(comuna)) return region
  }
  return "—"
}

// ──────────────────────────────────────────────────────────────────────────
// Tasadores y visadores (mock) para reasignación
// ──────────────────────────────────────────────────────────────────────────

export interface Profesional {
  id: string
  nombre: string
  rut: string
  /** Solicitudes activas asignadas. */
  carga: number
  /** Capacidad activa máxima. */
  capacidad: number
  /** Comunas que cubre territorialmente. */
  cobertura: string[]
  rol: "tasador" | "visador"
}

export const TASADORES: Profesional[] = [
  {
    id: "t1",
    nombre: "Javier Mora",
    rut: "13.111.222-3",
    carga: 8,
    capacidad: 12,
    cobertura: ["Las Condes", "Providencia", "Vitacura"],
    rol: "tasador",
  },
  {
    id: "t2",
    nombre: "Carolina Reyes",
    rut: "14.222.333-4",
    carga: 5,
    capacidad: 12,
    cobertura: ["Providencia", "Ñuñoa", "Santiago"],
    rol: "tasador",
  },
  {
    id: "t3",
    nombre: "Diego Salinas",
    rut: "15.333.444-5",
    carga: 3,
    capacidad: 10,
    cobertura: ["La Florida", "Puente Alto", "Maipú"],
    rol: "tasador",
  },
  {
    id: "t4",
    nombre: "Valentina Olivares",
    rut: "16.444.555-6",
    carga: 6,
    capacidad: 12,
    cobertura: ["Las Condes", "Vitacura", "Lo Barnechea"],
    rol: "tasador",
  },
  {
    id: "t5",
    nombre: "Rodrigo Pizarro",
    rut: "12.555.666-7",
    carga: 2,
    capacidad: 10,
    cobertura: ["Maipú", "Estación Central", "Pudahuel"],
    rol: "tasador",
  },
  {
    id: "t6",
    nombre: "Francisca Bravo",
    rut: "17.666.777-8",
    carga: 9,
    capacidad: 12,
    cobertura: ["San Miguel", "La Cisterna", "Ñuñoa"],
    rol: "tasador",
  },
]

export const VISADORES: Profesional[] = [
  {
    id: "v1",
    nombre: "Ana Contreras",
    rut: "11.777.888-9",
    carga: 12,
    capacidad: 18,
    cobertura: ["Las Condes", "Providencia", "Vitacura", "Ñuñoa"],
    rol: "visador",
  },
  {
    id: "v2",
    nombre: "Diego Salinas",
    rut: "15.333.444-5",
    carga: 4,
    capacidad: 12,
    cobertura: ["La Florida", "Maipú", "Puente Alto"],
    rol: "visador",
  },
  {
    id: "v3",
    nombre: "Pamela Tapia",
    rut: "10.888.999-0",
    carga: 7,
    capacidad: 14,
    cobertura: ["Santiago", "San Miguel", "Providencia"],
    rol: "visador",
  },
]

/**
 * Valida un RUT chileno usando el algoritmo de módulo 11.
 * Acepta formatos con o sin puntos y guion.
 */
export function validarRut(rut: string): boolean {
  const limpio = rut.replace(/[.\s]/g, "").replace(/-/g, "").toUpperCase()
  if (limpio.length < 2) return false
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false

  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number.parseInt(cuerpo[i], 10) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  const resto = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto)
  return dv === dvEsperado
}

/** Formatea un RUT agregando puntos y guion mientras se escribe. */
export function formatearRut(valor: string): string {
  const limpio = valor.replace(/[^0-9kK]/g, "").toUpperCase()
  if (limpio.length === 0) return ""
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  if (limpio.length === 1) return limpio
  const cuerpoFormateado = cuerpo
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${cuerpoFormateado}-${dv}`
}

export interface Adjunto {
  id: string
  nombre: string
  detalle: string
}

export const ADJUNTOS: Adjunto[] = [
  {
    id: "a1",
    nombre: "captura_whatsapp_rfuentes.jpg",
    detalle: "Subido hace 2 horas por María Espinoza",
  },
  {
    id: "a2",
    nombre: "email_solicitud_bsantander.pdf",
    detalle: "Subido hace 2 horas por María Espinoza",
  },
]

// ──────────────────────────────────────────────────────────────────────────
// Mock de bloques de sólo lectura del detalle (SII, legales, motor, versiones)
// ──────────────────────────────────────────────────────────────────────────

export interface DatosSiiUnidad {
  unidadId: string
  ubicacion: string
  destino: string
  codigoSii: string
  avaluoFiscal: string
}

export interface DatosSii {
  destinoPrincipal: string
  unidades: DatosSiiUnidad[]
  avaluoTotal: string
  contribucionAnual: string
}

export function mockDatosSii(s: Solicitud): DatosSii {
  // Avalúo numérico por unidad (base para el total, RN-48).
  const avaluos = s.unidades.map((_u, i) => 1200 + i * 350)
  const unidades = s.unidades.map((u, i) => ({
    unidadId: u.id,
    ubicacion: u.ubicacion,
    destino: u.tipoBien === "Edificación" ? "Habitacional" : "Complementario",
    codigoSii: u.rolSii || `S/R-${i + 1}`,
    avaluoFiscal: `${avaluos[i].toLocaleString("es-CL")} UF`,
  }))
  // RN-48: el avalúo fiscal total es la suma de los avalúos de las unidades.
  const avaluoTotal = avaluos.reduce((acc, v) => acc + v, 0)
  return {
    destinoPrincipal: "Habitacional",
    unidades,
    avaluoTotal: `${avaluoTotal.toLocaleString("es-CL")} UF`,
    contribucionAnual: "18,4 UF",
  }
}

export interface AntecedentesLegales {
  permisoEdificacion: string
  fechaPermiso: string
  recepcionFinal: string
  fojas: string
  numeroInscripcion: string
  anioInscripcion: string
}

export function mockAntecedentesLegales(s: Solicitud): AntecedentesLegales {
  return {
    permisoEdificacion: s.tipoPropiedadNuevoUsado === "nuevo" ? "N° 214-2024" : "N° 108-2009",
    fechaPermiso: s.tipoPropiedadNuevoUsado === "nuevo" ? "12 mar 2024" : "05 ago 2009",
    recepcionFinal: s.tipoPropiedadNuevoUsado === "nuevo" ? "Pendiente" : "N° 76-2010",
    fojas: "12.345",
    numeroInscripcion: "8.901",
    anioInscripcion: s.tipoPropiedadNuevoUsado === "nuevo" ? "2024" : "2010",
  }
}

export interface DecisionMotor {
  reglaGanadora: string
  descripcion: string
  candidatasDescartadas: { regla: string; motivo: string }[]
}

export function mockDecisionMotor(s: Solicitud): DecisionMotor {
  return {
    reglaGanadora: "R-07 · Cobertura territorial + menor carga",
    descripcion: `Asignación sugerida por cobertura de ${s.comuna} y balance de carga entre tasadores disponibles.`,
    candidatasDescartadas: [
      { regla: "R-02 · Round robin puro", motivo: "No respeta cobertura territorial" },
      { regla: "R-11 · Especialidad comercial", motivo: "Tipo de informe no coincide" },
    ],
  }
}

export interface VersionInforme {
  numero: number
  fechaEnvio: string
  valorUf: string
  motivoCambio: string
  archivos: { id: string; nombre: string; esImagen: boolean }[]
}

export function mockVersionesInforme(s: Solicitud): VersionInforme[] {
  return [
    {
      numero: 2,
      fechaEnvio: "26 jun 2026 · 14:20",
      valorUf: s.montoUf,
      motivoCambio: "Ajuste de superficie construida tras visita",
      archivos: [
        { id: `${s.id}-v2-1`, nombre: "informe_tasacion_v2.pdf", esImagen: false },
        { id: `${s.id}-v2-2`, nombre: "fotos_fachada.jpg", esImagen: true },
      ],
    },
    {
      numero: 1,
      fechaEnvio: "24 jun 2026 · 09:05",
      valorUf: s.montoUf,
      motivoCambio: "Versión inicial",
      archivos: [
        { id: `${s.id}-v1-1`, nombre: "informe_tasacion_v1.pdf", esImagen: false },
        { id: `${s.id}-v1-2`, nombre: "certificado_avaluo.pdf", esImagen: false },
      ],
    },
  ]
}

/** Cuerpo del correo de asignación (SC13) simulado — refleja plantilla real en Airtable. */
export function mockEmailAsignacion(s: Solicitud, tasador: string): string {
  return [
    `Para: ${tasador.toLowerCase().replace(/\s+/g, "")}@vproperty.cl`,
    `Asunto: Nueva tasación asignada · ${s.codigoExt} · ${s.comuna} — ${s.direccion}`,
    "",
    `Estimado/a ${tasador},`,
    "",
    "Por medio de la presente adjunto información para realizar la tasación de la referencia.",
    "",
    `Solicitud: ${s.codigoExt} · Cliente: ${s.cliente} · SLA: ${s.slaAplicable}`,
    `Dirección: ${s.direccion}, ${s.comuna}`,
    "",
    "Reglas de trabajo:",
    "  1. Coordinación de la visita: llamar al contacto dentro de las siguientes 4 horas.",
    "  2. Confección y envío del informe: dentro de los 2 días siguientes a la visita.",
    "  3. Si la propiedad es usada: obtener permiso de edificación y recepción final.",
    "",
    "Saluda atentamente,",
    "Tasaciones Value Property Ltda.",
    "Área de Control y Seguimiento",
    "Fono: 22 500 0366 · tasadores@valueproperty.cl",
  ].join("\n")
}
