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

/** Contacto de coordinación de visita. El primero es el contacto principal. */
export interface ContactoVisita {
  id: string
  rol: string
  nombre: string
  telefono: string
  email: string
  estado: string
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
  supConstruida: number
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
  canal: string
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
  estado = "Válido",
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
    canal: "WhatsApp",
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
      origenDato: "Correo",
    },
    unidades: unidadesDepto("s1"),
    contactosVisita: [
      contacto("s1-c1", "Propietario", "Roberto Fuentes Díaz", "+56 9 8123 4567", "rfuentes@gmail.com"),
      contacto("s1-c2", "Conserje", "Turno edificio", "+56 2 2345 6789", "conserjeria@edificio.cl", "No contesta"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "24 jun 2026 · 10:12",
    estadoCorreo: "enviado",
    estadoConservacion: "Bueno",
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
    canal: "Email",
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
      origenDato: "Ficha",
    },
    unidades: unidadUnica("s2", "Edificación", 145),
    contactosVisita: [
      contacto("s2-c1", "Propietario", "Patricia Soto Vera", "+56 9 6543 2100", "psoto@outlook.com"),
    ],
    contadorReasignaciones: 1,
    fechaAsignacion: "17 jun 2026 · 09:30",
    estadoCorreo: "enviado",
    estadoConservacion: "Normal",
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
    canal: "Portal web",
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
      origenDato: "Correo",
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
      contacto("s3-c1", "Corredor", "Sofía Martínez", "+56 9 4321 0987", "smartinez@andes.cl"),
    ],
    contadorReasignaciones: 0,
    estadoConservacion: "Nuevo",
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
    canal: "WhatsApp",
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
      origenDato: "Correo",
    },
    unidades: unidadesDepto("s4"),
    contactosVisita: [
      contacto("s4-c1", "Propietario", "Luis Tapia Rojas", "+56 9 3210 9876", "ltapia@gmail.com"),
      contacto("s4-c2", "Arrendatario", "Pedro Núñez", "+56 9 1098 7654", "pnunez@gmail.com"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "22 jun 2026 · 15:40",
    estadoCorreo: "enviado",
    estadoConservacion: "Bueno",
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
    canal: "Email",
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
      origenDato: "Certificado de avalúo",
    },
    unidades: unidadUnica("s5", "Edificación", 320),
    contactosVisita: [
      contacto("s5-c1", "Propietario", "Fernanda Vidal Pérez", "+56 9 9876 5432", "fvidal@empresa.cl"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "21 jun 2026 · 11:05",
    estadoCorreo: "enviado",
    estadoConservacion: "Bueno",
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
    canal: "Portal web",
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
      origenDato: "Correo",
    },
    unidades: unidadesDepto("s6"),
    contactosVisita: [
      contacto("s6-c1", "Corredor", "Andrea Pinto", "+56 9 6666 7777", "apinto@mirador.cl"),
      contacto("s6-c2", "Conserje", "Recepción torre", "+56 2 2333 4444", "recepcion@mirador.cl"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "20 jun 2026 · 16:20",
    estadoCorreo: "pendiente",
    estadoConservacion: "Nuevo",
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
    canal: "WhatsApp",
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
      origenDato: "Ficha",
    },
    unidades: unidadUnica("s7", "Edificación", 55),
    contactosVisita: [
      contacto("s7-c1", "Propietario", "Andrés Lillo Bravo", "+56 9 5555 6666", "alillo@gmail.com"),
    ],
    contadorReasignaciones: 0,
    estadoConservacion: "Normal",
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
    canal: "Email",
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
      origenDato: "Correo",
    },
    unidades: unidadUnica("s8", "Edificación", 98),
    contactosVisita: [
      contacto("s8-c1", "Propietario", "Rosa Mella Cárdenas", "+56 9 3333 4444", "rmella@hotmail.com"),
    ],
    contadorReasignaciones: 0,
    fechaAsignacion: "22 jun 2026 · 08:50",
    estadoCorreo: "enviado",
    estadoConservacion: "Bueno",
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

export const CANALES_ORIGEN = [
  "WhatsApp",
  "Email",
  "Teléfono",
  "Presencial",
  "Otro",
] as const

export const CLIENTES = [
  "Banco Santander",
  "Banco de Chile",
  "BCI",
  "Banco Estado",
  "Scotiabank",
  "Itaú",
] as const

/** Tipos de cliente de origen (Sección A). */
export const TIPOS_CLIENTE_ORIGEN = [
  "Banco",
  "Inmobiliaria",
  "Persona natural",
  "Corredora de propiedades",
  "Otro",
] as const

/** Tipos de informe disponibles por cliente. */
export const TIPOS_INFORME_POR_CLIENTE: Record<string, string[]> = {
  "Banco Santander": [
    "Tasación hipotecaria",
    "Revisión de tasación",
    "Tasación comercial",
  ],
  "Banco de Chile": ["Tasación hipotecaria", "Tasación comercial"],
  BCI: ["Tasación comercial", "Tasación judicial", "Tasación hipotecaria"],
  "Banco Estado": ["Tasación hipotecaria"],
  Scotiabank: ["Tasación hipotecaria", "Revisión de tasación"],
  Itaú: ["Tasación hipotecaria", "Tasación comercial"],
}

/** Productos disponibles por cliente. */
export const PRODUCTOS_POR_CLIENTE: Record<string, string[]> = {
  "Banco Santander": ["hipotecario", "refinanciamiento", "comercial"],
  "Banco de Chile": ["hipotecario", "comercial"],
  BCI: ["comercial", "hipotecario", "leasing"],
  "Banco Estado": ["hipotecario", "refinanciamiento"],
  Scotiabank: ["hipotecario", "refinanciamiento"],
  Itaú: ["hipotecario", "comercial"],
}

export const PRODUCTO_LABELS: Record<string, string> = {
  hipotecario: "Crédito hipotecario",
  refinanciamiento: "Refinanciamiento",
  comercial: "Crédito comercial",
  leasing: "Leasing inmobiliario",
}

/** Productos que requieren banco financista. */
export const PRODUCTOS_CON_BANCO = ["hipotecario", "refinanciamiento"]

/** Productos donde el vendedor coincide con el comprador (Sección C). */
export const PRODUCTOS_VENDEDOR_COINCIDE = ["refinanciamiento"]

export const BANCOS = [
  "Banco Santander",
  "Banco de Chile",
  "BCI",
  "Banco Estado",
  "Scotiabank",
  "Itaú",
  "Banco BICE",
  "Banco Falabella",
  "Banco Security",
] as const

export const TIPOS_PROPIEDAD = [
  "Casa",
  "Departamento",
  "Oficina",
  "Local comercial",
  "Terreno",
  "Bodega",
  "Estacionamiento",
] as const

/** Estado de conservación (catálogo cerrado de 6). */
export const ESTADOS_CONSERVACION = [
  "Nuevo",
  "Sin uso",
  "Bueno",
  "Normal",
  "Malo",
  "Deficiente",
] as const

/** Tipo de bien de una unidad (catálogo cerrado de 8). */
export const TIPOS_BIEN = [
  "Edificación",
  "Terreno",
  "Estacionamiento cubierto",
  "Estacionamiento descubierto",
  "Estacionamiento uso y goce",
  "Bodega",
  "Piscina",
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

/** Origen de la dirección declarada. */
export const ORIGENES_DIRECCION = [
  "Ficha del cliente",
  "Certificado de avalúo",
  "Certificado de número",
] as const

/** Origen del dato del vendedor. */
export const ORIGENES_DATO_VENDEDOR = [
  "Correo",
  "Ficha",
  "Certificado de avalúo",
] as const

/** Roles de contacto de visita (catálogo cerrado de 5). */
export const ROLES_CONTACTO_VISITA = [
  "Propietario",
  "Corredor",
  "Arrendatario",
  "Conserje",
  "Otro",
] as const

/** Estado del contacto de visita. */
export const ESTADOS_CONTACTO = [
  "Válido",
  "No contesta",
  "Teléfono erróneo",
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

// Tipos derivados de catálogos cerrados ya existentes (labels como valores).
export type CanalOrigen = (typeof CANALES_ORIGEN)[number]
export type TipoClienteOrigen = (typeof TIPOS_CLIENTE_ORIGEN)[number]
export type TipoBien = (typeof TIPOS_BIEN)[number]
export type OrigenSuperficie = (typeof ORIGENES_SUPERFICIE)[number]
export type EstadoConservacion = (typeof ESTADOS_CONSERVACION)[number]
export type Material = (typeof MATERIALES)[number]
export type OrigenDireccion = (typeof ORIGENES_DIRECCION)[number]
export type OrigenDatoVendedor = (typeof ORIGENES_DATO_VENDEDOR)[number]
export type RolContacto = (typeof ROLES_CONTACTO_VISITA)[number]
export type EstadoContacto = (typeof ESTADOS_CONTACTO)[number]
export type MotivoReasignacion = (typeof MOTIVOS_REASIGNACION)[number]

export interface TipoDocumento {
  id: string
  codigo: string
  nombre: string
  entidad_emisora: string
  vigencia_dias: number | null
}

/**
 * Catálogo de tipos de documento requeridos (15 items).
 * El id=1 viene ausente del origen; se conserva la numeración tal cual.
 */
export const TIPOS_DOCUMENTO: readonly TipoDocumento[] = [
  {
    id: "2",
    codigo: "certificado_recepcion_final",
    nombre: "Certificado de Recepción Definitiva de Obras",
    entidad_emisora: "Dirección de Obras Municipales",
    vigencia_dias: null,
  },
  {
    id: "3",
    codigo: "permiso_edificacion",
    nombre: "Permiso de Edificación",
    entidad_emisora: "Dirección de Obras Municipales",
    vigencia_dias: null,
  },
  {
    id: "4",
    codigo: "certificado_avaluo_fiscal",
    nombre: "Certificado de Avalúo Fiscal",
    entidad_emisora: "Servicio de Impuestos Internos",
    vigencia_dias: 90,
  },
  {
    id: "5",
    codigo: "consulta_antecedentes_bien_raiz",
    nombre: "Consulta de Antecedentes de Bien Raíz",
    entidad_emisora: "Servicio de Impuestos Internos",
    vigencia_dias: 90,
  },
  {
    id: "6",
    codigo: "certificado_deuda_tgr",
    nombre: "Certificado de Deuda de Contribuciones",
    entidad_emisora: "Tesorería General de la República",
    vigencia_dias: 30,
  },
  {
    id: "7",
    codigo: "sello_verde_sec",
    nombre: "Sello SEC de Inspección Periódica de Gas",
    entidad_emisora: "Superintendencia de Electricidad y Combustibles",
    vigencia_dias: 730,
  },
  {
    id: "8",
    codigo: "informe_no_expropiacion_serviu",
    nombre: "Informe de No Expropiación",
    entidad_emisora: "SERVIU",
    vigencia_dias: 180,
  },
  {
    id: "9",
    codigo: "inscripcion_dominio_cbr",
    nombre: "Inscripción de Dominio CBR",
    entidad_emisora: "Conservador de Bienes Raíces",
    vigencia_dias: null,
  },
  {
    id: "10",
    codigo: "plano_cuadro_superficies",
    nombre: "Plano y Cuadro de Superficies",
    entidad_emisora: "Inmobiliaria o Arquitecto",
    vigencia_dias: null,
  },
  {
    id: "11",
    codigo: "escritura_compraventa",
    nombre: "Escritura de Compraventa",
    entidad_emisora: "Notaría",
    vigencia_dias: null,
  },
  {
    id: "12",
    codigo: "certificado_numero",
    nombre: "Certificado de Número Municipal",
    entidad_emisora: "Municipalidad",
    vigencia_dias: 90,
  },
  {
    id: "13",
    codigo: "certificado_hipotecas_gravamenes",
    nombre: "Certificado de Hipotecas y Gravámenes",
    entidad_emisora: "Conservador de Bienes Raíces",
    vigencia_dias: 30,
  },
  {
    id: "14",
    codigo: "certificado_dominio_vigente",
    nombre: "Certificado de Dominio Vigente",
    entidad_emisora: "Conservador de Bienes Raíces",
    vigencia_dias: 60,
  },
  {
    id: "15",
    codigo: "certificado_deuda_gastos_comunes",
    nombre: "Certificado de Deuda de Gastos Comunes",
    entidad_emisora: "Administración del Condominio",
    vigencia_dias: 30,
  },
  {
    id: "16",
    codigo: "certificado_informaciones_previas",
    nombre: "Certificado de Informaciones Previas",
    entidad_emisora: "Dirección de Obras Municipales",
    vigencia_dias: 180,
  },
]

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
  const unidades = s.unidades.map((u, i) => ({
    unidadId: u.id,
    ubicacion: u.ubicacion,
    destino: u.tipoBien === "Edificación" ? "Habitacional" : "Complementario",
    codigoSii: u.rolSii || `S/R-${i + 1}`,
    avaluoFiscal: `${(1200 + i * 350).toLocaleString("es-CL")} UF`,
  }))
  return {
    destinoPrincipal: "Habitacional",
    unidades,
    avaluoTotal: `${(1200 * s.unidades.length + 400).toLocaleString("es-CL")} UF`,
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

/** Cuerpo del correo de asignación (SC13) simulado. */
export function mockEmailAsignacion(s: Solicitud, tasador: string): string {
  return [
    `Para: ${tasador.toLowerCase().replace(/\s+/g, "")}@vproperty.cl`,
    `Asunto: Nueva asignación ${s.codigoExt}`,
    "",
    `Estimado/a ${tasador},`,
    "",
    `Se te ha asignado la solicitud ${s.codigoExt} ubicada en ${s.direccion}, ${s.comuna}.`,
    `Cliente: ${s.cliente}. SLA aplicable: ${s.slaAplicable}.`,
    "",
    "Por favor coordina la visita dentro de las próximas 4 horas con los contactos indicados en el expediente.",
    "",
    "Saludos,",
    "Consola VProperty",
  ].join("\n")
}
