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
  },
]

export interface EventoHistorial {
  id: string
  titulo: string
  hace: string
  icono: "check" | "plus" | "alert" | "eye"
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
      "Prioridad cambiada de Normal a Urgente · Motivo: cliente VIP presiona",
    hace: "hace 1 hora",
    icono: "alert",
  },
  {
    id: "h3",
    titulo:
      "Asignación automática completada · Tasador: Javier Mora · Visador: Ana Contreras",
    hace: "hace 2 horas",
    icono: "check",
  },
  {
    id: "h4",
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

export interface TipoDocumento {
  id: number
  codigo: string
  nombre: string
  entidad_emisora: string
  vigencia_dias: number | null
}

/**
 * Catálogo de tipos de documento requeridos (CSV literal).
 * El id=1 viene ausente del origen; se conserva tal cual.
 */
export const TIPOS_DOCUMENTO: readonly TipoDocumento[] = [
  {
    id: 2,
    codigo: "certificado_recepcion_final",
    nombre: "Certificado de Recepción Definitiva de Obras",
    entidad_emisora: "Dirección de Obras Municipales",
    vigencia_dias: null,
  },
  {
    id: 3,
    codigo: "permiso_edificacion",
    nombre: "Permiso de Edificación",
    entidad_emisora: "Dirección de Obras Municipales",
    vigencia_dias: null,
  },
  {
    id: 4,
    codigo: "certificado_avaluo_fiscal",
    nombre: "Certificado de Avalúo Fiscal",
    entidad_emisora: "Servicio de Impuestos Internos",
    vigencia_dias: 90,
  },
  {
    id: 5,
    codigo: "consulta_antecedentes_bien_raiz",
    nombre: "Consulta de Antecedentes de Bien Raíz",
    entidad_emisora: "Servicio de Impuestos Internos",
    vigencia_dias: 90,
  },
  {
    id: 6,
    codigo: "certificado_deuda_tgr",
    nombre: "Certificado de Deuda de Contribuciones",
    entidad_emisora: "Tesorería General de la República",
    vigencia_dias: 30,
  },
  {
    id: 7,
    codigo: "sello_verde_sec",
    nombre: "Sello SEC de Inspección Periódica de Gas",
    entidad_emisora: "Superintendencia de Electricidad y Combustibles",
    vigencia_dias: 730,
  },
  {
    id: 8,
    codigo: "informe_no_expropiacion_serviu",
    nombre: "Informe de No Expropiación",
    entidad_emisora: "SERVIU",
    vigencia_dias: 180,
  },
  {
    id: 9,
    codigo: "inscripcion_dominio_cbr",
    nombre: "Inscripción de Dominio CBR",
    entidad_emisora: "Conservador de Bienes Raíces",
    vigencia_dias: null,
  },
  {
    id: 10,
    codigo: "plano_cuadro_superficies",
    nombre: "Plano y Cuadro de Superficies",
    entidad_emisora: "Inmobiliaria o Arquitecto",
    vigencia_dias: null,
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

// ──────────────────────────────────────────────────────────────────────────
// Tasadores y visadores (mock) para reasignación
// ──────────────────────────────────────────────────────────────────────────

export interface Profesional {
  id: string
  nombre: string
  rut: string
  /** Solicitudes activas asignadas. */
  carga: number
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
    cobertura: ["Las Condes", "Providencia", "Vitacura"],
    rol: "tasador",
  },
  {
    id: "t2",
    nombre: "Carolina Reyes",
    rut: "14.222.333-4",
    carga: 5,
    cobertura: ["Providencia", "Ñuñoa", "Santiago"],
    rol: "tasador",
  },
  {
    id: "t3",
    nombre: "Diego Salinas",
    rut: "15.333.444-5",
    carga: 3,
    cobertura: ["La Florida", "Puente Alto", "Maipú"],
    rol: "tasador",
  },
  {
    id: "t4",
    nombre: "Valentina Olivares",
    rut: "16.444.555-6",
    carga: 6,
    cobertura: ["Las Condes", "Vitacura", "Lo Barnechea"],
    rol: "tasador",
  },
  {
    id: "t5",
    nombre: "Rodrigo Pizarro",
    rut: "12.555.666-7",
    carga: 2,
    cobertura: ["Maipú", "Estación Central", "Pudahuel"],
    rol: "tasador",
  },
  {
    id: "t6",
    nombre: "Francisca Bravo",
    rut: "17.666.777-8",
    carga: 9,
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
    cobertura: ["Las Condes", "Providencia", "Vitacura", "Ñuñoa"],
    rol: "visador",
  },
  {
    id: "v2",
    nombre: "Diego Salinas",
    rut: "15.333.444-5",
    carga: 4,
    cobertura: ["La Florida", "Maipú", "Puente Alto"],
    rol: "visador",
  },
  {
    id: "v3",
    nombre: "Pamela Tapia",
    rut: "10.888.999-0",
    carga: 7,
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
