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
  // Paso 3 (RF-05 detalle) — espejo 1:1 de NewRequestSheet + sección Asignación y Gestión.
  /** Canal de origen elegido por la ejecutiva (`canal_contacto_original`), distinto de `canal` (`origen_canal`, fijo `ingreso_manual`). */
  canalOrigen: string
  nOperacionCliente: string
  sucursalOriginadora: string
  ejecutivoSolicitante: string
  telefono: string
  ejecutivaAsignada: string
  /** ⚙ Pendiente de creación en Airtable (D-08) — degrada a "—". */
  notasTasador: string
  /** ⚙ Pendiente de creación en Airtable (D-08) — degrada a "—". */
  notasVisador: string
  /** `regla_aplicada` — regla ganadora escrita por AT01. */
  reglaAplicada: string
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
  normal: "bg-slate-100 text-slate-600 border-slate-200",
  // Ámbar operacional (#D97706) — nunca el naranja de marca (#F5A213).
  urgente: "bg-amber-50 text-[#d97706] border-amber-200",
  critico: "bg-red-50 text-[#b91c1c] border-red-200",
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

/**
 * Canal de origen de la solicitud. `value` es el enum canónico que viaja al
 * payload de SC01 (Make) y al campo `canal_contacto_original` de Airtable;
 * `label` es solo para mostrar en el Select (Tanda B refinado, 08-jul-2026).
 */
export const CANALES_ORIGEN = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "telefono", label: "Teléfono" },
  { value: "presencial", label: "Presencial" },
  { value: "web", label: "Web" },
  { value: "ingreso_manual", label: "Ingreso manual" },
  { value: "otro", label: "Otro" },
] as const

export const CLIENTES = [
  "Santander Hipotecaria",
  "Banco de Chile",
  "BCI Mutuos",
  "Banco Estado",
  "Scotiabank",
  "Banco Itaú",
] as const

/**
 * Tipos de informe reales de M_TiposInforme (Airtable, verificado vía MCP).
 * Sin criterio de negocio para filtrar por cliente todavía (pendiente,
 * ver docs/_notas/reinicio_construccion_5.md) — se ofrecen los 8 a todos.
 */
const TIPOS_INFORME_DISPONIBLES = [
  "Pericial",
  "Compraventa",
  "Mutuo Hipotecario",
  "Comercial",
  "Leasing Habitacional",
  "Piloto",
  "Refinanciamiento",
  "Seguro",
]

/** Tipos de informe disponibles por cliente. */
export const TIPOS_INFORME_POR_CLIENTE: Record<string, string[]> = {
  "Santander Hipotecaria": TIPOS_INFORME_DISPONIBLES,
  "Banco de Chile": TIPOS_INFORME_DISPONIBLES,
  "BCI Mutuos": TIPOS_INFORME_DISPONIBLES,
  "Banco Estado": TIPOS_INFORME_DISPONIBLES,
  Scotiabank: TIPOS_INFORME_DISPONIBLES,
  "Banco Itaú": TIPOS_INFORME_DISPONIBLES,
}

/**
 * Productos reales de M_Productos (Airtable, verificado vía MCP).
 * "Credito Hipotecario" sin tilde — así está en Airtable real.
 * Sin criterio de negocio para filtrar por cliente todavía (pendiente,
 * ver docs/_notas/reinicio_construccion_5.md) — se ofrecen los 7 a todos.
 */
const PRODUCTOS_DISPONIBLES = [
  "Refinanciamiento",
  "Pericial Judicial",
  "Leasing Habitacional",
  "Compraventa",
  "Seguro Incendio",
  "Credito Hipotecario",
  "Refinanciamiento Hipotecario",
]

/** Productos disponibles por cliente. */
export const PRODUCTOS_POR_CLIENTE: Record<string, string[]> = {
  "Santander Hipotecaria": PRODUCTOS_DISPONIBLES,
  "Banco de Chile": PRODUCTOS_DISPONIBLES,
  "BCI Mutuos": PRODUCTOS_DISPONIBLES,
  "Banco Estado": PRODUCTOS_DISPONIBLES,
  Scotiabank: PRODUCTOS_DISPONIBLES,
  "Banco Itaú": PRODUCTOS_DISPONIBLES,
}

export const PRODUCTO_LABELS: Record<string, string> = {
  hipotecario: "Crédito hipotecario",
  refinanciamiento: "Refinanciamiento",
  comercial: "Crédito comercial",
  leasing: "Leasing inmobiliario",
}

/** Productos que requieren banco financista. */
export const PRODUCTOS_CON_BANCO = ["Credito Hipotecario", "Refinanciamiento Hipotecario"]

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
 * `id` = `nombre` (nombre real de M_Bancos en Airtable) para que el valor que
 * viaja en el Select sea directamente el texto a persistir en
 * TX_Solicitudes.banco (texto libre) — sin transformación en el servidor.
 * "Banco Estado" y "Banco Security" no existen en M_Bancos real (pendiente,
 * ver docs/_notas/reinicio_construccion_5.md); el resto está verificado vía MCP.
 */
export const M_BANCOS = [
  { id: "Banco Estado", nombre: "Banco Estado" },
  { id: "Banco Santander", nombre: "Banco Santander" },
  { id: "Banco BCI", nombre: "Banco BCI" },
  { id: "Banco de Chile", nombre: "Banco de Chile" },
  { id: "Banco Itau", nombre: "Banco Itau" },
  { id: "Scotiabank Chile", nombre: "Scotiabank Chile" },
  { id: "Banco Security", nombre: "Banco Security" },
  { id: "BICE Hipotecaria", nombre: "BICE Hipotecaria" },
  { id: "Banco Falabella", nombre: "Banco Falabella" },
  { id: "Banco Ripley", nombre: "Banco Ripley" },
] as const

/**
 * `id` es `string` (record id `recXXX` de Airtable `D_TipoDocumento`), no
 * autonumber — cambiado de `number` a `string` al conectar `fetchTiposDocumento()`
 * en `lib/tipos-documento.ts` (Fase 2, gap de persistencia).
 */
export interface TipoDocumento {
  id: string
  codigo: string
  nombre: string
  entidad_emisora: string
  vigencia_dias: number | null
}

/**
 * Catálogo de tipos de documento requeridos (CSV literal).
 * El id=1 viene ausente del origen; se conserva tal cual.
 *
 * @deprecated Reemplazado por fetchTiposDocumento() en lib/tipos-documento.ts.
 * Mantener temporalmente hasta que ningún consumidor lo importe. Eliminar en
 * tanda siguiente.
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
  Biobío: ["Concepción", "Talcahuano", "San Pedro de La Paz"],
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
