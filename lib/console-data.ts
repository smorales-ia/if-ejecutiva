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
