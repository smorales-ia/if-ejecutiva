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
