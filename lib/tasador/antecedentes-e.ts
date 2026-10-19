/**
 * Sección E del formulario del tasador, tal como la arma la hoja «Antecedentes»
 * de la planilla del cliente (`Formato-Informe-VProperty-Enero2026.xlsm`,
 * pedido de Sergio del 19-oct-2026).
 *
 * Este módulo replica lo que la hoja **calcula**: los catálogos de sus listas
 * desplegables (`Antecedentes!BV45:CO80` y las validaciones de datos), sus
 * fórmulas y las **dependencias** entre celdas (el «Material/Marca/Origen» que
 * sigue al «Tipo de Pavimento», la calefacción que sigue a la comodidad, los
 * estados que siguen al estado de conservación…). Los valores **fijos** no
 * viven acá: llegan de `C_DefaultsAntecedentes` (ver `DefaultsTabla`).
 * Funciones puras: se prueban sin React y las usan por igual el servidor
 * (precarga) y la pantalla (dependencias en vivo).
 *
 * Las celdas citadas son de la plantilla Enero 2026; la estructura es la misma
 * en el libro de MET-6283, que se usó para contrastar.
 *
 * Los literales se copian **tal cual** de la planilla, con sus erratas
 * («PREFABICADO», «ESTRUTURA», «OBRA GUESA»): son los que imprime el informe.
 */

/* -------------------------------------------------------------------------
 * Catálogos (listas desplegables de la hoja)
 * ---------------------------------------------------------------------- */

/** `H19 · Y37:Y44 · BE37:BE50` */
export const CALIDADES = ['DEFICIENTE', 'INFERIOR', 'REGULAR', 'CORRIENTE', 'BUENA', 'SUPERIOR'] as const

/** `AF37:AJ44 · BL37:BP38` */
export const ESTADOS_ELEMENTO = [
  'MUY BUENO',
  'NUEVO S/USO',
  'BUENO',
  'REGULAR',
  'DEFICIENTE',
  'OBRA GUESA',
  'TERMINACIONES',
] as const

/** `Z15` — el estado de conservación de la sección B, que heredan varias celdas. */
export const ESTADOS_CONSERVACION = ['NUEVO - S/USO', 'BUENO', 'NORMAL', 'MALO', 'DEFICIENTE'] as const

/** `H7:H13 · H21:AM24` */
export const SI_NO = ['SI', 'NO'] as const

/** `BZ45:BZ80` — estructura soportante y divisiones interiores. */
export const ESTRUCTURAS = [
  'ACERO',
  'ACERO ALBAÑILERIA',
  'ACERO FIBROCEMENTO',
  'ACERO HORMIGON ARMADO',
  'ACERO MADERA',
  'ACERO P.V.C.',
  'ACERO VOLCANITA',
  'ADOBE  O ADOBILLO',
  'ADOBE CON ESTRUCTURA DE MADERA',
  'ADOBE CON ESTRUCTURA METALICA',
  'ADOBE CON PILARES Y CADENAS DE H.A.',
  'ALBAÑILERIA BLOQUES',
  'ALBAÑILERIA BLOQUES PILARES Y CADENAS H.A.',
  'ALBAÑILERIA BLOQUES, ESTRUCTURA METALICA',
  'ALBAÑILERIA LADRILLO',
  'ALBAÑILERIA LADRILLO PILARES Y CADENAS H.A.',
  'ALBAÑILERIA LADRILLO, ESTRUCTURA METALICA',
  'ALBAÑILERIA PIEDRA',
  'ALBAÑILERIA PIEDRA PILARES Y CADENAS H.A.',
  'ALBAÑILERIA PIEDRA, ESTRUCTURA METALICA',
  'HORMIGON ARMADO',
  'HORMIGON ARMADO Y ESTRUCTURA MADERA',
  'HORMIGON ARMADO Y ESTRUCTURA METALICA',
  'MADERA',
  'MADERA CON PANEL CONGLOMERADO',
  'MADERA FIBROCEMENTO',
  'MADERA P.V.C.',
  'MADERA VOLCANITA',
  'MADERA Y ESTRUTURA METALICA',
  'PANELES DE HORMIGON LIVIANO',
  'POLIESTIRENO MALLA METALICA Y MORTERO',
  'PREFABICADO METALICO Y PANELES DE MADERA',
  'PREFABRICADO DE HORMIGON LIVIANO',
  'PREFABRICADO DE MADERA',
  'PREFABRICADO P.V.C.',
  'TABIQUERÍA ACERO',
] as const

/** `H39` */
export const ENTREPISOS = [
  'NO APLICA',
  'LOSA DE HORMIGON ARMADO',
  'ENTRAMADO DE MADERA',
  'PERFILES DE ACERO',
  'MIXTO (H. ARMADO - ENTRAMADO)',
  'PLACAS METALICAS',
] as const

/** `CE45:CE63` */
export const CUBIERTAS = [
  'COIRON',
  'EMBALLETADO',
  'FE GALVANIZADO',
  'LOSA DE HORMIGON ARMADO',
  'MEMBRANA ASFALTICA',
  'PIZARREÑO',
  'PLANCHA FIBROCEMENTO',
  'PLANCHA METALICA',
  'PLANCHA P.V.C.',
  'PLASTICOS ONDULADOS',
  'POLICARBONATO',
  'TEJA ARCILLA',
  'TEJA ASFALTICA',
  'TEJA CEMENTO',
  'TEJA FIBROCEMENTO',
  'TEJA MADERA',
  'TEJA P.V.C.',
  'TEJA PIEDRA',
  'VIDRIO',
] as const

/** `CH45:CH54` */
export const REVESTIMIENTOS_EXTERIORES = [
  'ENCHAPE DE LADRILLOS',
  'ESTUCO Y PINTURA',
  'LADRILLO A LA VISTA',
  'LADRILLO A LA VISTA PINTADO',
  'FACHADA VIDRIADA',
  'SIN TERMINACION',
  'INTERNIT',
  'OSB',
  'PLANCHA DE MADERA',
  'TINGLADO',
] as const

/** `CK45:CK50` */
export const OBRAS_COMPLEMENTARIAS = [
  'AMPLIACIÓN',
  'TERRAZA',
  'ESTACIONAMIENTO TECHADO',
  'JACUZZI',
  'PISCINA',
  'QUINCHO',
] as const

/** `AR37` */
export const AIRES_ACONDICIONADOS = ['NO PRESENTA', 'RADIADOR MURAL', 'RADIADOR AEREO'] as const

/** `AR38` */
export const CALEFACCIONES = [
  'NO PRESENTA',
  'LOSA RADIANTE',
  'PISO RADIANTE',
  'PANELES MURALES',
  'RADIADOR MURAL',
  'CHIMENEA',
  'BOSCA',
  'ESTUFA',
] as const

/** `CO44:CO56` */
export const MUEBLES_COCINA = [
  'MADERA',
  'MADERA Y CERÁMICA',
  'MADERA Y CUARZO',
  'MADERA Y GRANITO',
  'MADERA Y POSTFORMADO',
  'MADERA Y SILESTONE',
  'MELAMINA Y ACERO INOXIDABLE',
  'MELAMINA Y CERÁMICA',
  'MELAMINA Y CUARZO',
  'MELAMINA Y GRANITO',
  'MELAMINA Y MADERA',
  'MELAMINA Y POSTFORMADO',
  'MELAMINA Y SILESTONE',
] as const

/** `BV54:BV62` */
export const PUERTAS = [
  'MADERA',
  'MADERA NOBLE',
  'METALICA',
  'ALUMINIO',
  'MAMPARA',
  'MAMPARA ALUMINIO',
  'MAMPARA METALICA',
  'PVC',
  'NO TIENE',
] as const

/** `BX54:BX64` */
export const VENTANAS = [
  'MADERA',
  'MADERA NOBLE',
  'METALICA',
  'ALUMINIO',
  'ALUMINIO ANODIZADO',
  'ALUMINIO ELECTROPINTADO',
  'MADERA TERMOPANEL',
  'ALUMINIO TERMO PANEL',
  'PVC',
  'PVC TERMOPANEL',
  'NO TIENE',
] as const

/** `H46:H50` */
export const PAVIMENTOS = [
  'PISO FLOTANTE',
  'ENMADERADO',
  'CERAMICO',
  'ALFOMBRA',
  'CUBREPISO',
  'FLEXIT',
  'BATUCO',
  'PIEDRA',
  'MARMOL',
  'ADOQUIN',
  'LADRILLO',
  'VINILICO',
  'VIDRIO',
  'METALICO',
  'SUELO CEMENTO',
  'AFINADO CEMENTO',
  'SIN TERMINACION',
] as const

/** `AI46:AI50` */
export const REVESTIMIENTOS_MUROS = [
  'OLEO',
  'LATEX',
  'ESMALTE',
  'VINILICO',
  'CERAMICO',
  'MADERA',
  'LADRILLO A LA VISTA',
  'PIEDRA',
  'PAPEL',
  'CARPENTER',
  'TELA',
  'VIDRIADO',
  'METALICO',
  'SIN TERMINACION',
] as const

/** `AS46:AS50` */
export const TERMINACIONES_CIELO = [
  'ENTABLADO NATURAL',
  'ENTABLADO / PINTURA',
  'ENLUCIDO / PINTURA',
  'EMPASTE / PINTURA',
  'CIELO FALSO',
  'VIGAS A LA VISTA',
  'SIN TERMINACION',
] as const

/* -------------------------------------------------------------------------
 * Estructura de la hoja
 * ---------------------------------------------------------------------- */

/** `B21:AL24` — matriz 4×4 de comodidades, en el orden de la hoja (por columna). */
export const COMODIDADES_E = [
  { id: 'mueblesCocina', label: 'Muebles de cocina' },
  { id: 'comedorDiario', label: 'Comedor de diario' },
  { id: 'patioServicio', label: 'Patio de servicio' },
  { id: 'estacionamiento', label: 'Estacionamiento' },
  { id: 'piscina', label: 'Piscina' },
  { id: 'gimnasio', label: 'Gimnasio' },
  { id: 'sauna', label: 'Sauna' },
  { id: 'bodega', label: 'Bodega' },
  { id: 'jardinConformado', label: 'Jardín conformado' },
  { id: 'calefaccion', label: 'Calefacción' },
  { id: 'alarma', label: 'Alarma' },
  { id: 'proteccionesRejas', label: 'Protecciones / rejas' },
  { id: 'aspiracionCentral', label: 'Aspiración central' },
  { id: 'climatizacion', label: 'Climatización' },
  { id: 'purificadorAire', label: 'Purificador de aire' },
  { id: 'corrientesDebiles', label: 'Corrientes débiles' },
] as const

export type ComodidadE = (typeof COMODIDADES_E)[number]['id']
export type SiNo = '' | (typeof SI_NO)[number]

/** `B29:BF33` — 14 tipos de recinto en el orden de la hoja. */
export const TIPOS_HABITACION = [
  { id: 'comedor', label: 'Comedor' },
  { id: 'living', label: 'Living' },
  { id: 'estar', label: 'Estar' },
  { id: 'hall', label: 'Hall' },
  { id: 'suite', label: 'Suite' },
  { id: 'dormSimple', label: 'D. simple' },
  { id: 'dormServicio', label: 'D. servicio' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'escritorio', label: 'Escritorio' },
  { id: 'banos', label: 'Baños' },
  { id: 'medioBano', label: '½ baño' },
  { id: 'banoServicio', label: 'Baño servicio' },
  { id: 'loggia', label: 'Loggia' },
  { id: 'otros', label: 'Otros' },
] as const

export type TipoHabitacion = (typeof TIPOS_HABITACION)[number]['id']

/** `B30:B33` — los cuatro niveles de la hoja. */
export const NIVELES_E = [
  { id: 'subterraneo', label: 'Subterráneo' },
  { id: 'n1', label: '1 nivel' },
  { id: 'n2', label: '2 nivel' },
  { id: 'n3', label: '3 nivel' },
] as const

export type NivelE = (typeof NIVELES_E)[number]['id']

export interface NivelHabitacionesE {
  /** Cantidad por tipo; ausente o 0 = no hay. */
  cantidades: Partial<Record<TipoHabitacion, number>>
  /** `BK30:BK33` — superficie del nivel, texto numérico como el resto del formulario. */
  superficieM2: string
}

/** `B37:B44 · AL37:AL44` — los 16 elementos, fundamentales primero. */
export const ELEMENTOS_E = [
  { id: 'estructuraSoportante', label: 'Estructura soportante', grupo: 'fundamental', opciones: ESTRUCTURAS },
  { id: 'divisionesInteriores', label: 'Divisiones interiores', grupo: 'fundamental', opciones: ESTRUCTURAS },
  { id: 'entrepisos', label: 'Entrepisos', grupo: 'fundamental', opciones: ENTREPISOS },
  { id: 'cubierta', label: 'Cubierta', grupo: 'fundamental', opciones: CUBIERTAS },
  { id: 'revestimientoExterior', label: 'Revestimiento exterior', grupo: 'fundamental', opciones: REVESTIMIENTOS_EXTERIORES },
  { id: 'cierrosExteriores', label: 'Cierros exteriores', grupo: 'fundamental', opciones: null },
  { id: 'obrasComplementarias', label: 'Obras complementarias', grupo: 'fundamental', opciones: OBRAS_COMPLEMENTARIAS },
  { id: 'construccionAnexo', label: 'Construcción anexo', grupo: 'fundamental', opciones: null },
  { id: 'aireAcondicionado', label: 'Aire acondicionado', grupo: 'otro', opciones: AIRES_ACONDICIONADOS },
  { id: 'calefaccion', label: 'Calefacción', grupo: 'otro', opciones: CALEFACCIONES },
  { id: 'closetMural', label: 'Closet mural', grupo: 'otro', opciones: null },
  { id: 'mueblesCocina', label: 'Muebles de cocina', grupo: 'otro', opciones: MUEBLES_COCINA },
  { id: 'sanitarios', label: 'Sanitarios', grupo: 'otro', opciones: null },
  { id: 'griferia', label: 'Grifería', grupo: 'otro', opciones: null },
  { id: 'puertaPrincipal', label: 'Puerta principal', grupo: 'otro', opciones: PUERTAS },
  { id: 'ventanas', label: 'Ventanas', grupo: 'otro', opciones: VENTANAS },
] as const

export type ElementoE = (typeof ELEMENTOS_E)[number]['id']

export interface ElementoValor {
  materialidad: string
  calidad: string
  estado: string
}

/** `B46:B50` — los cinco recintos fijos de terminaciones. */
export const RECINTOS_E = [
  { id: 'estar', label: 'Estar' },
  { id: 'dormitorios', label: 'Dormitorios' },
  { id: 'circulacion', label: 'Espacios de circulación' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'banos', label: 'Baños' },
] as const

export type RecintoE = (typeof RECINTOS_E)[number]['id']

export interface TerminacionValor {
  pavimento: string
  material: string
  muros: string
  cielo: string
  iluminacion: string
  estado: string
}

/** `B26:BH28` — tres filas de ampliación. */
export interface AmpliacionE {
  regulado: SiNo
  pe: string
  rif: string
  regulacion: string
  m2: string
}

export const FILAS_AMPLIACION = 3

/** Todo lo que la sección E captura. */
export interface SeccionE {
  comodidades: Record<ComodidadE, SiNo>
  ampliaciones: AmpliacionE[]
  habitaciones: Record<NivelE, NivelHabitacionesE>
  elementos: Record<ElementoE, ElementoValor>
  terminaciones: Record<RecintoE, TerminacionValor>
}

/* -------------------------------------------------------------------------
 * Contexto: lo que las fórmulas de la hoja leen de otras hojas
 * ---------------------------------------------------------------------- */

export interface ContextoE {
  /** `tipoPropiedad` ('FICHA SOLIC'!K35): Departamento, Casa, … */
  tipoPropiedad: string
  /** `estadoUso` ('FICHA SOLIC'!K36): la propiedad es nueva. Sin dato → usada. */
  nueva: boolean
  /** `Z15` — estado de conservación de la sección B. */
  estadoConservacion: string
  /** `numeroPisos` (Portada!BK5). */
  pisos: string
  supConstruida: string
  supPrimerPiso: string
  /** Cantidades de la sección B, que en departamento deciden H24/P24. */
  estacionamientos: string
  bodegas: string
}

/** Campos de la sección B que las fórmulas de la hoja leen. */
export interface CamposBParaE {
  estadoConservacion: string
  pisosPropiedad: string
  supConstruida: string
  supPrimerPiso: string
  estacionamientos: string
  bodegas: string
}

/** Contexto de las fórmulas a partir de la solicitud (`tipo`, nueva/usada) y la sección B. */
export function contextoE(solicitud: { tipo: string; nueva: boolean }, b: CamposBParaE): ContextoE {
  return {
    tipoPropiedad: solicitud.tipo,
    nueva: solicitud.nueva,
    estadoConservacion: b.estadoConservacion,
    pisos: b.pisosPropiedad,
    supConstruida: b.supConstruida,
    supPrimerPiso: b.supPrimerPiso,
    estacionamientos: b.estacionamientos,
    bodegas: b.bodegas,
  }
}

/** Claves de la sección B que, al cambiar, mueven celdas de E (`reaplicarContexto`). */
export const CLAVES_B_PARA_E: readonly (keyof CamposBParaE)[] = [
  'estadoConservacion',
  'pisosPropiedad',
  'supConstruida',
  'supPrimerPiso',
  'estacionamientos',
  'bodegas',
]

const esDepto = (c: ContextoE) => c.tipoPropiedad.trim().toLowerCase() === 'departamento'
const esCasa = (c: ContextoE) => c.tipoPropiedad.trim().toLowerCase() === 'casa'
const numero = (v: string) => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/* -------------------------------------------------------------------------
 * Valores fijos: vienen de `C_DefaultsAntecedentes`, no de este archivo
 * ---------------------------------------------------------------------- */

/**
 * Atributos de `C_DefaultsAntecedentes.atributo`.
 *
 * RF-TAS-08 y RF-TAS-23: los valores por defecto **fijos** de la hoja (la
 * materialidad de la estructura, la calidad `BUENA`, el pavimento de cada
 * recinto…) viven en esa tabla, por tipo de propiedad × estado de uso, y se
 * editan en Airtable sin deploy. Una combinación sin fila deja el campo vacío.
 * Lo que la hoja **calcula** —el estado que copia `Z15`, entrepisos según los
 * pisos, la calefacción según la comodidad, el material según el pavimento, la
 * calidad y el estado de los elementos opcionales— son las fórmulas de abajo.
 */
export type AtributoDefault =
  | 'materialidad'
  | 'calidad'
  | 'estado'
  | 'pavimento'
  | 'revestimiento_muros'
  | 'cielo'
  | 'iluminacion'

/** Filas de `C_DefaultsAntecedentes` para un tipo × estado de uso: `campo_destino` → atributo → valor. */
export type DefaultsTabla = Partial<Record<string, Partial<Record<AtributoDefault, string>>>>

/** `C_DefaultsAntecedentes.campo_destino` de cada elemento y recinto. */
export const CAMPO_DESTINO: Record<ElementoE | RecintoE, string> = {
  estructuraSoportante: 'estructura_soportante',
  divisionesInteriores: 'divisiones_interiores',
  entrepisos: 'entrepisos',
  cubierta: 'cubierta',
  revestimientoExterior: 'revestimiento_exterior',
  cierrosExteriores: 'cierros_exteriores',
  obrasComplementarias: 'obras_complementarias',
  construccionAnexo: 'construccion_anexo',
  aireAcondicionado: 'aire_acondicionado',
  calefaccion: 'calefaccion',
  closetMural: 'closet_mural',
  mueblesCocina: 'muebles_cocina',
  sanitarios: 'sanitarios',
  griferia: 'griferia',
  puertaPrincipal: 'puerta_principal',
  ventanas: 'ventanas',
  estar: 'estar',
  dormitorios: 'dormitorios',
  circulacion: 'espacios_circulacion',
  cocina: 'cocina',
  banos: 'banos',
}

const deTabla = (t: DefaultsTabla, id: ElementoE | RecintoE, atributo: AtributoDefault): string | undefined =>
  t[CAMPO_DESTINO[id]]?.[atributo]

/* -------------------------------------------------------------------------
 * Fórmulas de la hoja (cada una cita su celda)
 * ---------------------------------------------------------------------- */

/** `BE37:BE38 · Y43:Y44` — calidad de un elemento opcional presente. */
const CALIDAD_OPCIONAL = 'BUENA'

/**
 * `Y43:AF44 · BE37:BL38` — calidad y estado de un elemento **opcional**
 * (obras complementarias, construcción anexo, aire, calefacción): vacíos si no
 * hay materialidad; si la hay, `BUENA` y `IF(estadoUso="Nuevo","NUEVO S/USO","BUENA")`.
 * El «BUENA» como estado de una propiedad usada es de la planilla (no está en
 * su lista de estados) y se conserva tal cual: es lo que imprime el informe.
 */
function calidadEstadoOpcional(presente: boolean, c: ContextoE): Pick<ElementoValor, 'calidad' | 'estado'> {
  if (!presente) return { calidad: '', estado: '' }
  return { calidad: CALIDAD_OPCIONAL, estado: c.nueva ? 'NUEVO S/USO' : 'BUENA' }
}

/** Elementos cuya calidad/estado dependen de que haya materialidad. */
const OPCIONALES: ReadonlySet<ElementoE> = new Set([
  'obrasComplementarias',
  'construccionAnexo',
  'aireAcondicionado',
  'calefaccion',
])

/** ¿La materialidad de un elemento opcional cuenta como presente? */
function presente(id: ElementoE, materialidad: string): boolean {
  const m = materialidad.trim()
  if (id === 'aireAcondicionado' || id === 'calefaccion') return m !== '' && m !== 'NO PRESENTA'
  return m !== ''
}

/** Elementos «otros» cuyo estado es `=+Z15` (estado de conservación). */
const ESTADO_DE_Z15: ReadonlySet<ElementoE> = new Set([
  'closetMural',
  'mueblesCocina',
  'sanitarios',
  'griferia',
  'puertaPrincipal',
  'ventanas',
])

/** `AR38` — `IF(AB22="SI","LOSA RADIANTE","NO PRESENTA")`. */
export function calefaccionPorComodidad(comodidad: SiNo): string {
  return comodidad === 'SI' ? 'LOSA RADIANTE' : 'NO PRESENTA'
}

/** `H39` — entrepisos según tipo y pisos. */
export function entrepisoPorDefecto(c: ContextoE): string {
  if (esDepto(c)) return 'LOSA DE HORMIGON ARMADO'
  if (esCasa(c) && numero(c.pisos) === 1) return ''
  return 'LOSA DE HORMIGON ARMADO'
}

/**
 * Materialidad por defecto de un elemento (`H37:H44 · AR37:AR44`): la de la
 * tabla, salvo calefacción (`AR38`, sigue a la comodidad) y entrepisos sin fila
 * (`H39`, casa de un piso → vacío; si no, losa).
 */
function materialidadPorDefecto(
  id: ElementoE,
  c: ContextoE,
  comodidades: Record<ComodidadE, SiNo>,
  tabla: DefaultsTabla,
): string {
  if (id === 'calefaccion') return calefaccionPorComodidad(comodidades.calefaccion)
  const fila = deTabla(tabla, id, 'materialidad')
  if (id === 'entrepisos' && fila === undefined) return entrepisoPorDefecto(c)
  return fila ?? ''
}

/**
 * Elemento por defecto: materialidad, calidad y estado. Los opcionales siguen
 * la fórmula de presencia; los «otros» con `=+Z15` toman el estado de
 * conservación; el resto, calidad y estado de la tabla.
 */
function elementoPorDefecto(
  id: ElementoE,
  c: ContextoE,
  comodidades: Record<ComodidadE, SiNo>,
  tabla: DefaultsTabla,
): ElementoValor {
  const materialidad = materialidadPorDefecto(id, c, comodidades, tabla)
  if (OPCIONALES.has(id)) return { materialidad, ...calidadEstadoOpcional(presente(id, materialidad), c) }
  const calidad = deTabla(tabla, id, 'calidad') ?? ''
  if (ESTADO_DE_Z15.has(id)) return { materialidad, calidad, estado: c.estadoConservacion }
  return { materialidad, calidad, estado: deTabla(tabla, id, 'estado') ?? '' }
}

/**
 * `W46:W50` — «Material/Marca/Origen» según el tipo de pavimento.
 *
 * La hoja usa el mismo `IF` anidado en las cinco filas, salvo el valor final
 * para un pavimento sin equivalencia (METALICO, SIN TERMINACION): en «Estar»
 * es `SIN TERMINACION` y en las otras cuatro, `TIPO LAMINADO`. Se replica así.
 */
const MATERIAL_POR_PAVIMENTO: Record<string, string> = {
  'PISO FLOTANTE': 'TIPO LAMINADO',
  CERAMICO: 'TIPO CORDILLERA',
  ALFOMBRA: 'ALFOMBRA',
  ENMADERADO: 'MADERA',
  CUBREPISO: 'CUBREPISO',
  FLEXIT: 'FLEXIT',
  BATUCO: 'BATUCO',
  PIEDRA: 'PIEDRA',
  MARMOL: 'MARMOL',
  ADOQUIN: 'ADOQUIN',
  LADRILLO: 'LADRILLO',
  VINILICO: 'VINILICO',
  VIDRIO: 'VIDRIO',
  'SUELO CEMENTO': 'CEMENTO',
  'AFINADO CEMENTO': 'CEMENTO',
}

export function materialPorPavimento(recinto: RecintoE, pavimento: string): string {
  return (
    MATERIAL_POR_PAVIMENTO[pavimento.trim()] ??
    (recinto === 'estar' ? 'SIN TERMINACION' : 'TIPO LAMINADO')
  )
}

/**
 * `H46:BL50` — terminaciones por defecto de un recinto: pavimento, muros, cielo
 * e iluminación de la tabla; el material sale del pavimento (`W46:W50`) y el
 * estado es `=+Z15`.
 */
function terminacionPorDefecto(recinto: RecintoE, c: ContextoE, tabla: DefaultsTabla): TerminacionValor {
  const pavimento = deTabla(tabla, recinto, 'pavimento') ?? ''
  return {
    pavimento,
    material: pavimento ? materialPorPavimento(recinto, pavimento) : '',
    muros: deTabla(tabla, recinto, 'revestimiento_muros') ?? '',
    cielo: deTabla(tabla, recinto, 'cielo') ?? '',
    iluminacion: deTabla(tabla, recinto, 'iluminacion') ?? '',
    estado: c.estadoConservacion,
  }
}

/**
 * `H24 · P24` — en departamento, estacionamiento y bodega salen de los OO.CC.
 * de la solicitud; en otro tipo quedan en blanco.
 */
function comodidadPorOoCc(cantidad: string, c: ContextoE): SiNo {
  if (!esDepto(c)) return ''
  return numero(cantidad) > 0 ? 'SI' : 'NO'
}

/**
 * `BK30:BK33` — superficie por nivel. La hoja la toma de la superficie por piso
 * de la ficha (subterráneo, 1°, 2°, 3°, mansarda); la app guarda superficie
 * construida y de primer piso, así que: departamento → todo en el 1 nivel;
 * casa → el primer piso en el 1 nivel y el resto en el 2 nivel cuando hay más
 * de un piso.
 */
export function superficiesPorNivel(c: ContextoE): Record<NivelE, string> {
  const vacio = { subterraneo: '', n1: '', n2: '', n3: '' }
  const construida = numero(c.supConstruida)
  if (esDepto(c)) return { ...vacio, n1: c.supConstruida.trim() }
  const primer = numero(c.supPrimerPiso)
  if (primer <= 0) return { ...vacio, n1: c.supConstruida.trim() }
  const resto = Math.round((construida - primer) * 100) / 100
  return {
    ...vacio,
    n1: c.supPrimerPiso.trim(),
    n2: numero(c.pisos) > 1 && resto > 0 ? String(resto) : '',
  }
}

/* -------------------------------------------------------------------------
 * Sección E por defecto y dependencias en vivo
 * ---------------------------------------------------------------------- */

/**
 * La sección E como la deja la hoja para una solicitud: los valores fijos de
 * `C_DefaultsAntecedentes` (`tabla`, ya filtrada por tipo × estado de uso) más
 * las fórmulas.
 */
export function seccionEPorDefecto(c: ContextoE, tabla: DefaultsTabla): SeccionE {
  const comodidades = Object.fromEntries(COMODIDADES_E.map((x) => [x.id, ''])) as Record<ComodidadE, SiNo>
  comodidades.estacionamiento = comodidadPorOoCc(c.estacionamientos, c)
  comodidades.bodega = comodidadPorOoCc(c.bodegas, c)

  const elementos = Object.fromEntries(
    ELEMENTOS_E.map(({ id }) => [id, elementoPorDefecto(id, c, comodidades, tabla)]),
  ) as Record<ElementoE, ElementoValor>

  const terminaciones = Object.fromEntries(
    RECINTOS_E.map(({ id }) => [id, terminacionPorDefecto(id, c, tabla)]),
  ) as Record<RecintoE, TerminacionValor>

  const superficies = superficiesPorNivel(c)
  const habitaciones = Object.fromEntries(
    NIVELES_E.map(({ id }) => [id, { cantidades: {}, superficieM2: superficies[id] }]),
  ) as Record<NivelE, NivelHabitacionesE>

  const ampliaciones: AmpliacionE[] = Array.from({ length: FILAS_AMPLIACION }, () => ({
    regulado: '',
    pe: '',
    rif: '',
    regulacion: '',
    m2: '',
  }))

  return { comodidades, ampliaciones, habitaciones, elementos, terminaciones }
}

/**
 * Completa una sección E guardada (o de un borrador viejo) con los defaults de
 * lo que falte. Lo guardado gana siempre; sólo se rellenan claves ausentes.
 */
export function completarSeccionE(
  guardada: Partial<SeccionE> | undefined,
  c: ContextoE,
  tabla: DefaultsTabla,
): SeccionE {
  const base = seccionEPorDefecto(c, tabla)
  if (!guardada) return base
  return {
    comodidades: { ...base.comodidades, ...(guardada.comodidades ?? {}) },
    ampliaciones: base.ampliaciones.map((a, i) => ({ ...a, ...(guardada.ampliaciones?.[i] ?? {}) })),
    habitaciones: Object.fromEntries(
      NIVELES_E.map(({ id }) => [
        id,
        {
          cantidades: { ...(guardada.habitaciones?.[id]?.cantidades ?? {}) },
          superficieM2: guardada.habitaciones?.[id]?.superficieM2 ?? base.habitaciones[id].superficieM2,
        },
      ]),
    ) as Record<NivelE, NivelHabitacionesE>,
    elementos: Object.fromEntries(
      ELEMENTOS_E.map(({ id }) => [id, { ...base.elementos[id], ...(guardada.elementos?.[id] ?? {}) }]),
    ) as Record<ElementoE, ElementoValor>,
    terminaciones: Object.fromEntries(
      RECINTOS_E.map(({ id }) => [id, { ...base.terminaciones[id], ...(guardada.terminaciones?.[id] ?? {}) }]),
    ) as Record<RecintoE, TerminacionValor>,
  }
}

/* --- Cambios con dependencias (lo que en la hoja recalcula una fórmula) --- */

/** Cambia el pavimento de un recinto y, con él, su «Material/Marca/Origen» (`W46:W50`). */
export function cambiarPavimento(e: SeccionE, recinto: RecintoE, pavimento: string): SeccionE {
  return {
    ...e,
    terminaciones: {
      ...e.terminaciones,
      [recinto]: { ...e.terminaciones[recinto], pavimento, material: materialPorPavimento(recinto, pavimento) },
    },
  }
}

/** Cambia una comodidad; la de calefacción arrastra la materialidad de calefacción (`AR38`). */
export function cambiarComodidad(e: SeccionE, id: ComodidadE, valor: SiNo, c: ContextoE): SeccionE {
  const sig: SeccionE = { ...e, comodidades: { ...e.comodidades, [id]: valor } }
  if (id !== 'calefaccion') return sig
  return cambiarMaterialidad(sig, 'calefaccion', calefaccionPorComodidad(valor), c)
}

/**
 * Cambia la materialidad de un elemento. En los opcionales (obras
 * complementarias, anexo, aire, calefacción) la calidad y el estado aparecen o
 * se vacían con ella, como en `Y43:AF44 · BE37:BL38`.
 */
export function cambiarMaterialidad(e: SeccionE, id: ElementoE, materialidad: string, c: ContextoE): SeccionE {
  const previo = e.elementos[id]
  let valor: ElementoValor = { ...previo, materialidad }
  if (OPCIONALES.has(id)) {
    const antes = presente(id, previo.materialidad)
    const ahora = presente(id, materialidad)
    if (antes !== ahora) valor = { materialidad, ...calidadEstadoOpcional(ahora, c) }
  }
  return { ...e, elementos: { ...e.elementos, [id]: valor } }
}

/**
 * Lo que cambia en E cuando cambia algo de la sección B que la hoja lee
 * (`Z15`, pisos, superficies, estacionamientos, bodegas). Sólo se mueven las
 * celdas que **todavía** tienen el valor que la fórmula daba con el contexto
 * anterior: lo que el tasador cambió a mano no se toca.
 */
export function reaplicarContexto(e: SeccionE, antes: ContextoE, ahora: ContextoE): SeccionE {
  let sig = e

  if (antes.estadoConservacion !== ahora.estadoConservacion) {
    const elementos = { ...sig.elementos }
    for (const id of ESTADO_DE_Z15) {
      if (elementos[id].estado === antes.estadoConservacion) {
        elementos[id] = { ...elementos[id], estado: ahora.estadoConservacion }
      }
    }
    const terminaciones = { ...sig.terminaciones }
    for (const { id } of RECINTOS_E) {
      if (terminaciones[id].estado === antes.estadoConservacion) {
        terminaciones[id] = { ...terminaciones[id], estado: ahora.estadoConservacion }
      }
    }
    sig = { ...sig, elementos, terminaciones }
  }

  if (antes.pisos !== ahora.pisos) {
    const previo = entrepisoPorDefecto(antes)
    if (sig.elementos.entrepisos.materialidad === previo) {
      sig = cambiarMaterialidad(sig, 'entrepisos', entrepisoPorDefecto(ahora), ahora)
    }
  }

  if (
    antes.supConstruida !== ahora.supConstruida ||
    antes.supPrimerPiso !== ahora.supPrimerPiso ||
    antes.pisos !== ahora.pisos
  ) {
    const previas = superficiesPorNivel(antes)
    const nuevas = superficiesPorNivel(ahora)
    const habitaciones = { ...sig.habitaciones }
    for (const { id } of NIVELES_E) {
      if (habitaciones[id].superficieM2 === previas[id]) {
        habitaciones[id] = { ...habitaciones[id], superficieM2: nuevas[id] }
      }
    }
    sig = { ...sig, habitaciones }
  }

  for (const [id, campo] of [
    ['estacionamiento', 'estacionamientos'],
    ['bodega', 'bodegas'],
  ] as const) {
    if (antes[campo] !== ahora[campo]) {
      const previo = comodidadPorOoCc(antes[campo], antes)
      if (sig.comodidades[id] === previo) {
        sig = { ...sig, comodidades: { ...sig.comodidades, [id]: comodidadPorOoCc(ahora[campo], ahora) } }
      }
    }
  }

  return sig
}

/* -------------------------------------------------------------------------
 * Precarga con lo que la base ya sabe (19-oct-2026, pedido de Sergio)
 * ---------------------------------------------------------------------- */

/**
 * Datos de la solicitud que completan la sección E por encima de los defaults
 * de la hoja. Los arma el servidor (`hidratarSeccionE`) **sólo con datos**: la
 * sección B, los ítems de la sección C, los atributos que la lectura de
 * documentos obtuvo y `TX_Unidades`. Las fotos no se usan.
 */
export interface EvidenciasE {
  /**
   * Textos que nombran obras complementarias o comodidades: descripción, subtipo
   * y tipo de los ítems de la sección C, el atributo `oc` del SII y el subtipo
   * de las unidades.
   */
  textos: readonly string[]
  /** Material de la estructura, en orden de precedencia (documento, SII, sección B). */
  materiales: readonly string[]
  /** Sección B (con el respaldo del plano cuando B está vacía). */
  dormitorios: string
  banos: string
  mediosBanos: string
  banoServicio: string
  /** Ampliaciones declaradas en otra parte (ítems de la sección C). */
  ampliaciones: readonly AmpliacionE[]
}

/** Sin tildes, mayúsculas, espacios simples: para comparar textos libres. */
function plano(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Lleva un material escrito de cualquier forma («albanileria», «Albañilería»,
 * «HORMIGÓN ARMADO») al literal de la lista de estructura de la hoja
 * (`BZ45:BZ80`), o `''` si no se reconoce.
 */
export function estructuraDesdeMaterial(texto: string): string {
  const t = plano(texto)
  if (t === '') return ''
  const exacto = ESTRUCTURAS.find((x) => plano(x) === t)
  if (exacto) return exacto
  if (t.includes('ALBA')) {
    if (t.includes('BLOQUE')) return 'ALBAÑILERIA BLOQUES'
    if (t.includes('PIEDRA')) return 'ALBAÑILERIA PIEDRA'
    return 'ALBAÑILERIA LADRILLO'
  }
  if (t.includes('HORMIG')) return 'HORMIGON ARMADO'
  if (t.includes('ADOBE')) return 'ADOBE  O ADOBILLO'
  if (t.includes('MADERA')) return 'MADERA'
  if (t.includes('ACERO') || t.includes('METAL')) return 'ACERO'
  return ''
}

/** Palabras que, en un texto de evidencia, declaran una obra complementaria de `CK45:CK50`. */
const OBRA_POR_PALABRA: readonly [RegExp, (typeof OBRAS_COMPLEMENTARIAS)[number]][] = [
  [/TERRAZA/, 'TERRAZA'],
  [/QUINCHO/, 'QUINCHO'],
  [/PISCINA/, 'PISCINA'],
  [/JACUZZI/, 'JACUZZI'],
  [/ESTAC.*TECHAD|TECHAD.*ESTAC/, 'ESTACIONAMIENTO TECHADO'],
]

/** Palabras que declaran una comodidad de `B21:AL24`. */
const COMODIDAD_POR_PALABRA: readonly [RegExp, ComodidadE][] = [
  [/MUEBLES? DE COCINA/, 'mueblesCocina'],
  [/COMEDOR DE DIARIO/, 'comedorDiario'],
  [/PATIO DE SERVICIO/, 'patioServicio'],
  [/ESTAC/, 'estacionamiento'],
  [/PISCINA/, 'piscina'],
  [/GIMNASIO/, 'gimnasio'],
  [/SAUNA/, 'sauna'],
  [/BODEGA/, 'bodega'],
  [/JARDIN/, 'jardinConformado'],
  [/CALEFACC/, 'calefaccion'],
  [/ALARMA/, 'alarma'],
  [/REJA|PROTECCION/, 'proteccionesRejas'],
  [/ASPIRACION/, 'aspiracionCentral'],
  [/CLIMATIZ|AIRE ACOND/, 'climatizacion'],
  [/PURIFICADOR/, 'purificadorAire'],
  [/CORRIENTES? DEBILES/, 'corrientesDebiles'],
]

const esVivienda = (c: ContextoE) => esCasa(c) || esDepto(c)

/**
 * Completa la sección E por defecto con lo que la base ya sabe, para que el
 * tasador la reciba **entera** y sólo revise:
 *
 * - **Estructura soportante**: el primer material reconocible (documento,
 *   SII, sección B) llevado al catálogo de la hoja.
 * - **Obras complementarias**: las que nombren las evidencias, unidas con «+»
 *   como en la planilla (MET-6283: «TERRAZA DESCUBIERTA+QUINCHO+PISCINA+BODEGA»),
 *   más las que ya traía el default (piscina en departamento).
 * - **Comodidades**: SI cuando una evidencia o un elemento las declara (muebles
 *   de cocina con materialidad, aire o calefacción presentes, estacionamientos
 *   o bodegas en la sección B); **NO** en el resto, para que ninguna quede en
 *   blanco. La comodidad Calefacción arrastra el elemento como en `AR38`.
 * - **Habitaciones**: si no hay ninguna cargada, en el 1 nivel de una vivienda:
 *   comedor, living y cocina (1 c/u), dormitorios simples, baños, ½ baños y
 *   baño de servicio según la sección B. La suite y el resto quedan en 0: no hay
 *   dato que los distinga.
 * - **Ampliaciones**: las que declaren otras secciones, en las filas libres.
 */
export function aplicarEvidencias(e: SeccionE, ev: EvidenciasE, c: ContextoE): SeccionE {
  let sig = e
  const textos = ev.textos.map(plano).filter(Boolean)
  const nombra = (re: RegExp) => textos.some((t) => re.test(t))

  // Estructura soportante.
  const estructura = ev.materiales.map(estructuraDesdeMaterial).find((m) => m !== '')
  if (estructura) sig = cambiarMaterialidad(sig, 'estructuraSoportante', estructura, c)

  // Ampliaciones declaradas en otra parte.
  if (ev.ampliaciones.length > 0) {
    const libres = sig.ampliaciones.map((a) => !a.regulado && !a.pe && !a.rif && !a.regulacion && !a.m2)
    const pendientes = [...ev.ampliaciones]
    sig = {
      ...sig,
      ampliaciones: sig.ampliaciones.map((a, i) => (libres[i] && pendientes.length > 0 ? pendientes.shift()! : a)),
    }
  }

  // Obras complementarias.
  const previas = sig.elementos.obrasComplementarias.materialidad
    .split('+')
    .map((x) => x.trim())
    .filter(Boolean)
  const obras = new Set(previas)
  for (const [re, obra] of OBRA_POR_PALABRA) if (nombra(re)) obras.add(obra)
  if (sig.ampliaciones.some((a) => a.m2 || a.pe || a.rif)) obras.add('AMPLIACIÓN')
  if (obras.size > previas.length) {
    sig = cambiarMaterialidad(sig, 'obrasComplementarias', [...obras].join('+'), c)
  }

  // Comodidades: SI con evidencia, NO en el resto.
  const si = new Set<ComodidadE>()
  for (const [re, id] of COMODIDAD_POR_PALABRA) if (nombra(re)) si.add(id)
  if (sig.elementos.mueblesCocina.materialidad.trim()) si.add('mueblesCocina')
  if (presente('aireAcondicionado', sig.elementos.aireAcondicionado.materialidad)) si.add('climatizacion')
  if (presente('calefaccion', sig.elementos.calefaccion.materialidad)) si.add('calefaccion')
  if (numero(c.estacionamientos) > 0) si.add('estacionamiento')
  if (numero(c.bodegas) > 0) si.add('bodega')
  for (const { id } of COMODIDADES_E) {
    if (sig.comodidades[id] !== '') continue
    const valor: SiNo = si.has(id) ? 'SI' : 'NO'
    sig = id === 'calefaccion' ? cambiarComodidad(sig, id, valor, c) : { ...sig, comodidades: { ...sig.comodidades, [id]: valor } }
  }

  // Habitaciones del 1 nivel en una vivienda sin nada cargado.
  const vacias = NIVELES_E.every(({ id }) => Object.values(sig.habitaciones[id].cantidades).every((n) => !n))
  if (vacias && esVivienda(c)) {
    const medios = numero(ev.mediosBanos)
    const cantidades: Partial<Record<TipoHabitacion, number>> = { comedor: 1, living: 1, cocina: 1 }
    const poner = (tipo: TipoHabitacion, n: number) => {
      if (n > 0) cantidades[tipo] = Math.trunc(n)
    }
    poner('dormSimple', numero(ev.dormitorios))
    poner('banos', Math.max(0, numero(ev.banos) - medios))
    poner('medioBano', medios)
    poner('banoServicio', numero(ev.banoServicio))
    sig = { ...sig, habitaciones: { ...sig.habitaciones, n1: { ...sig.habitaciones.n1, cantidades } } }
  }

  return sig
}

/* --- Totales de la hoja (`L34:BK34`) --- */

export function totalesHabitaciones(e: SeccionE) {
  let total = 0
  const por: Partial<Record<TipoHabitacion, number>> = {}
  for (const { id } of NIVELES_E) {
    for (const [tipo, n] of Object.entries(e.habitaciones[id].cantidades)) {
      const k = Number(n) || 0
      total += k
      por[tipo as TipoHabitacion] = (por[tipo as TipoHabitacion] ?? 0) + k
    }
  }
  const de = (...t: TipoHabitacion[]) => t.reduce((a, x) => a + (por[x] ?? 0), 0)
  return {
    total,
    /** `Y34 = SUM(U30:AB33)` — suite + dormitorio simple. */
    dormitorios: de('suite', 'dormSimple'),
    /** `AG34 = SUM(AP30:AV33)` — baños + ½ baño. */
    banos: de('banos', 'medioBano'),
    dormServicio: de('dormServicio'),
    banoServicio: de('banoServicio'),
  }
}

/** `BK34` — superficie de los niveles más la de las ampliaciones. */
export function superficieTotalE(e: SeccionE): number {
  const suma = (xs: string[]) => xs.reduce((a, v) => a + numero(v), 0)
  const total =
    suma(NIVELES_E.map(({ id }) => e.habitaciones[id].superficieM2)) + suma(e.ampliaciones.map((a) => a.m2))
  return Math.round(total * 100) / 100
}
