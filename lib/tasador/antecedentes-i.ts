/**
 * Sección I del formulario del tasador · «Sector, terreno y normativa»
 * (23-oct-2026, pedido de Sergio en la réplica de MET-6283).
 *
 * Es lo que la planilla del cliente (`Formato-Informe-VProperty-Enero2026.xlsm`)
 * captura en la hoja «Antecedentes» fuera del bloque constructivo —exigencias
 * municipales, propiedad acogida, plan regulador, emplazamiento, instalaciones,
 * terreno de emplazamiento— y en la «Portada» —sector, uso de terrenos, detalle
 * de la Hoja 1 y expropiación—. Con eso se imprime la **Hoja N°3** del informe
 * y el detalle de la Hoja 1, que hasta hoy salían en blanco.
 *
 * Mismo reparto que la sección E (`antecedentes-e.ts`):
 * - los **catálogos** son las listas desplegables de la planilla, con sus
 *   literales exactos;
 * - los **valores fijos** llegan de `C_DefaultsAntecedentes` (bloques
 *   `emplazamiento`, `plan_regulador`, `instalaciones`, `detalle`, atributo
 *   `valor`), no de este archivo (RF-TAS-08);
 * - acá viven las **fórmulas** de la planilla y sus dependencias.
 *
 * Funciones puras: las usan el servidor (precarga), la pantalla (dependencias
 * en vivo) y el ensamblador del informe (proyección a la plantilla Carbone).
 */

import { TIPOS_HABITACION, type DefaultsTabla, type SeccionE, type TipoHabitacion } from './antecedentes-e'

/* -------------------------------------------------------------------------
 * Catálogos (listas desplegables de la planilla)
 * ---------------------------------------------------------------------- */

/** `Antecedentes!AT7:AT10` */
export const SI_NO_I = ['SI', 'NO'] as const
/** `Antecedentes!BI7:BI8` */
export const CUMPLE_PLAN = ['SI', 'NO', 'EN PARTE', 'SIN INFORMACION'] as const
/** `Antecedentes!BI10` */
export const CAMBIOS_PLAN = ['NO CONTEMPLA', 'EN PROCESO', 'SIN INFORMACION'] as const
/** `Portada!F22` */
export const DEMANDAS = ['Nulo', 'Débil', 'Medio', 'Fuerte'] as const
/** `Portada!F23` */
export const TENDENCIAS = ['En Disminución', 'En Aumento', 'Estable', 'Inestable'] as const
/** `Portada!F24` */
export const DENSIDADES = ['Alta', 'Media', 'Baja', 'Nula'] as const
/** `Portada!F25:L25` */
export const MERCADOS = [
  'Estrato Alto',
  'Estrato Medio Alto',
  'Estrato Medio',
  'Estrato Medio Bajo',
  'Estrato Bajo',
  'Mixto Comercial',
  'Mixto Industrial',
] as const
/** `Portada!F26` (ABC1) */
export const ABC1 = ['SI', 'NO'] as const
/** `Portada!H26:L26` */
export const HOMOGENEIDAD = ['Homogéneo', 'No Homogéneo'] as const
/** `Portada!S22` */
export const DESTINOS_BARRIO = [
  'Agrícola',
  'Agrohabitacional',
  'Habitacional',
  'Comercial',
  'ComercialHabit.',
  'Equip.y Servic.',
  'Indust. Inof',
  'Indust. Molesto',
] as const
/** `Portada!S23` */
export const TIPOS_ZONA_SECTOR = ['Urbana', 'Rural'] as const
/** `Portada!S24` */
export const CALZADAS = ['Hormigón', 'Asfalto', 'Adoquín', 'Adocreto', 'Ripio', 'Tierra', 'Micillo', 'Estabilizado'] as const
/** `Portada!S25` */
export const ACERAS = ['Pastelón', 'Baldosa', 'Tierra'] as const
/** `Portada!S26:Y26` */
export const SOLERAS = ['Solera', 'Solerilla', 'No hay'] as const
/** `Portada!AE22` */
export const ANTEJARDINES = ['Sí', 'NO'] as const
/** `Portada!AE23:AJ23` */
export const REDES_ELECTRICAS = ['Red Aérea', 'Red Subterránea', 'No Hay Red'] as const
/** `Portada!AE24` */
export const AGUAS_POTABLES = ['Matriz Pública', 'Matriz Privada', 'Sol. Particular', 'No cuenta'] as const
/** `Portada!AE25:AJ25` */
export const GASES = ['Licuado', 'Red Pública', 'Red Particular', 'Full Eléctrica', 'No existe'] as const
/** `Portada!AE26` */
export const PROYECCIONES_USO = ['Estacionario', 'Renovación', 'Creciente', 'Decreciente'] as const
/** `Antecedentes!AT22:AZ22` */
export const FORMAS_TERRENO = ['REGULAR', 'CASI REGULAR', 'IRREGULAR', 'MUY IRREGULAR'] as const
/** `Antecedentes!AT23` */
export const PENDIENTES = ['PLANO', 'SUAVE', 'ABRUPTO', 'COMBINADA'] as const
/** `Antecedentes!Z17 · CD1:CD8` — los ocho rumbos. */
export const RUMBOS = ['NORTE', 'SUR', 'ESTE', 'OESTE', 'NORESTE', 'NOROESTE', 'SURESTE', 'SUROESTE'] as const
/** `Antecedentes!AT24:AZ24` — orientación del terreno. */
export const ORIENTACIONES_TERRENO = ['NO APLICA', ...RUMBOS] as const
/** `Antecedentes!H15` */
export const TIPOS_AGRUPAMIENTO = [
  'INDIVIDUAL',
  'CONJUNTO',
  'POBLACION',
  'CONDOMINIO',
  'VILLA',
  'PARCELACION',
  'EDIFICIO',
  'CENTRO COMERCIAL',
] as const
/** `Antecedentes!H16` */
export const DISENOS = ['EXCLUSIVO', 'TIPICO', 'REPETITIVO', 'PREFABRICADO', 'MASIVO', 'SIN ASESORIA'] as const
/** `Antecedentes!H17 · Z19` */
export const ADECUACIONES = ['ADECUADA', 'INADECUADA', 'OTRO'] as const
/** `Antecedentes!H18` */
export const ADOSAMIENTOS = [
  'ADOSADA 1L',
  'ADOSADA 2L',
  'ADOSADA 3L',
  'AISLADA',
  'CONTINUA',
  'PAREADA',
  'EDIF DPTO',
  'EDIF OFICINA',
  'OTRO',
] as const
/** `Antecedentes!Z16` */
export const PREDIOS_VISTA = ['BUENO', 'NORMAL', 'REGULAR', 'MALO'] as const
/** `Antecedentes!Z18` */
export const RELACIONES_TERRENO = ['ADECUADO', 'INADECUADO', 'SUBUTILIZADO', 'SOBREUTILIZADO'] as const
/** `Portada!BK24` */
export const AFECTOS_EXPROPIACION = ['SI', 'NO', 'S/INF.'] as const
/** `Portada!BL25 ⟵ CA29:CA36` */
export const FUENTES_INFORMACION = [
  'Certif. Exprop.',
  'DOM, Inf. Verbal',
  'DOM, Plano Catastro',
  'Plano Vialidad',
  'DOM no entrega Inf.',
  'Sin Antecedentes',
] as const
/** `Portada!BK7` — sólo para casas. */
export const MANSARDAS = ['Sí', 'No'] as const

/** Fuente de información que adjunta el certificado en el anexo (`Portada!CA29`). */
const FUENTE_CERTIFICADO = 'Certif. Exprop.'

/** Lo que imprimen las siete exigencias cuando la zona no está en la hoja `Zonificacion`. */
export const EXIGENCIA_SIN_ZONA = 'OGUC'

/* -------------------------------------------------------------------------
 * Forma de la sección (lo que se guarda en `TX_DatosTasacion.antecedentes_json`)
 * ---------------------------------------------------------------------- */

export interface DetalleI {
  /** `Portada!BR6` */
  sitioLote: string
  /** `Portada!BK7` */
  mansarda: string
  /** `Portada!BK24` */
  afectoExpropiacion: string
  /** `Portada!BL25` */
  fuenteInformacion: string
}

export interface NormativaI {
  /** `Antecedentes!Z7:Z13` — exigencias municipales (PR). */
  supPredialMinimo: string
  frentePredialMinimo: string
  ocupacionSuelo: string
  coefConstructibilidad: string
  alturaEdificacion: string
  distanciaMedianero: string
  sistemaAgrupamiento: string
  /** `Antecedentes!AT8:AT10` — propiedad acogida a (el DFL-2 es el de la sección B). */
  ley6071: string
  ley9135: string
  ley19537: string
  /** `Antecedentes!BI7:BI10` — cumple plan regulador vigente. */
  cumpleUsoActual: string
  cumpleTipoConstruccion: string
  usoMasProbable: string
  cambiosPlanRegulador: string
}

export interface SectorI {
  /** `Portada!F22:H26` */
  demanda: string
  tendencia: string
  densidad: string
  mercado: string
  abc1: string
  homogeneidad: string
  /** `Portada!S22:S26` */
  destinoBarrio: string
  tipoZona: string
  calzada: string
  acera: string
  solera: string
  /** `Portada!AE22:AE26` */
  antejardin: string
  redElectrica: string
  aguaPotable: string
  gas: string
  proyUsoTerrenos: string
  /** `Antecedentes!BD19` */
  arteriaPrincipal: string
}

/** `Portada!AP23:AX25` — porcentajes; «Otros» se calcula (`AX26`). */
export interface UsoTerrenosI {
  casas: string
  deptos: string
  condominios: string
  equipComercial: string
  industrial: string
  comercial: string
  sitiosEriazos: string
}

/** `Antecedentes!AT21:BG24` — la superficie es la de la sección B. */
export interface TerrenoI {
  forma: string
  pendiente: string
  orientacion: string
  frente: string
  contrafrente: string
  deslindeNorte: string
  deslindeSur: string
}

/** `Antecedentes!H15:Z19` — calidad y estado son los de la sección B. */
export interface EmplazamientoI {
  tipoAgrupamiento: string
  disenoArquitectonico: string
  utilidadFuncional: string
  tipoAdosamiento: string
  predioVista: string
  orientacionConstruccion: string
  relacionTerrenoConstruccion: string
  iluminacionNatural: string
}

/** `Antecedentes!AN15:AN19` — agua, electricidad y gas son los del sector. */
export interface InstalacionesI {
  alcantarillado: string
  otros: string
}

export interface SeccionI {
  detalle: DetalleI
  normativa: NormativaI
  sector: SectorI
  usoTerrenos: UsoTerrenosI
  terreno: TerrenoI
  emplazamiento: EmplazamientoI
  instalaciones: InstalacionesI
}

/** Claves de cada bloque, en el orden de la planilla. Las usan el normalizador y los tests. */
export const CLAVES_I: { [B in keyof SeccionI]: readonly (keyof SeccionI[B])[] } = {
  detalle: ['sitioLote', 'mansarda', 'afectoExpropiacion', 'fuenteInformacion'],
  normativa: [
    'supPredialMinimo',
    'frentePredialMinimo',
    'ocupacionSuelo',
    'coefConstructibilidad',
    'alturaEdificacion',
    'distanciaMedianero',
    'sistemaAgrupamiento',
    'ley6071',
    'ley9135',
    'ley19537',
    'cumpleUsoActual',
    'cumpleTipoConstruccion',
    'usoMasProbable',
    'cambiosPlanRegulador',
  ],
  sector: [
    'demanda',
    'tendencia',
    'densidad',
    'mercado',
    'abc1',
    'homogeneidad',
    'destinoBarrio',
    'tipoZona',
    'calzada',
    'acera',
    'solera',
    'antejardin',
    'redElectrica',
    'aguaPotable',
    'gas',
    'proyUsoTerrenos',
    'arteriaPrincipal',
  ],
  usoTerrenos: ['casas', 'deptos', 'condominios', 'equipComercial', 'industrial', 'comercial', 'sitiosEriazos'],
  terreno: ['forma', 'pendiente', 'orientacion', 'frente', 'contrafrente', 'deslindeNorte', 'deslindeSur'],
  emplazamiento: [
    'tipoAgrupamiento',
    'disenoArquitectonico',
    'utilidadFuncional',
    'tipoAdosamiento',
    'predioVista',
    'orientacionConstruccion',
    'relacionTerrenoConstruccion',
    'iluminacionNatural',
  ],
  instalaciones: ['alcantarillado', 'otros'],
}

/* -------------------------------------------------------------------------
 * Contexto de las fórmulas
 * ---------------------------------------------------------------------- */

/** Lo que las fórmulas leen de la solicitud, del SII y de la sección B. */
export interface ContextoI {
  /** `tipoPropiedad` ('FICHA SOLIC'!K35). */
  tipoPropiedad: string
  nueva: boolean
  /** `AgrupacionProp` — agrupación de la sección B («Condominio»). */
  agrupacion: string
  /** `anoPropiedad` — año de construcción de la sección B. */
  anioConstruccion: string
  /** Orientación de la sección B (código de rumbo: «N», «NO»…). */
  orientacion: string
  /** `Portada!BK3` (uso actual) ⟵ destino SII. */
  destinoSii: string
  /** Ubicación urbano/rural del SII. */
  ubicacionUrbanoRural: string
}

/** Datos de la solicitud y del SII que la sección I lee (los resuelve el servidor). */
export interface SolicitudI {
  tipo: string
  nueva: boolean
  destinoSii: string
  ubicacionUrbanoRural: string
}

/** Campos de la sección B que las fórmulas de I leen. */
export interface CamposBParaI {
  agrupacionPropiedad: string
  anioConstruccion: string
  orientacion: readonly string[]
}

/** Claves de la sección B que, al cambiar, mueven celdas de I (`reaplicarContextoI`). */
export const CLAVES_B_PARA_I: readonly (keyof CamposBParaI)[] = ['agrupacionPropiedad', 'anioConstruccion', 'orientacion']

export function contextoI(s: SolicitudI, b: CamposBParaI): ContextoI {
  return {
    tipoPropiedad: s.tipo,
    nueva: s.nueva,
    agrupacion: b.agrupacionPropiedad,
    anioConstruccion: b.anioConstruccion,
    orientacion: b.orientacion[0] ?? '',
    destinoSii: s.destinoSii,
    ubicacionUrbanoRural: s.ubicacionUrbanoRural,
  }
}

const sinTilde = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '')
const tipoEs = (c: ContextoI, tipo: string) => sinTilde(c.tipoPropiedad).trim().toLowerCase() === tipo

/* -------------------------------------------------------------------------
 * Fórmulas de la planilla
 * ---------------------------------------------------------------------- */

/**
 * `AT8 = IF(AND(OR(tipo="Departamento", AgrupacionProp="Condominio"),
 * anoPropiedad<1995), "SI", "NO")` — Ley 6071 (venta por pisos). Sin año, la
 * comparación de la planilla con una celda vacía da verdadero (vacío < 1995);
 * acá se evita: sin año no hay cómo saberlo y queda «NO».
 */
export function ley6071PorDefecto(c: ContextoI): 'SI' | 'NO' {
  const agrupado = tipoEs(c, 'departamento') || sinTilde(c.agrupacion).trim().toLowerCase() === 'condominio'
  const anio = Number(c.anioConstruccion)
  return agrupado && Number.isFinite(anio) && anio > 0 && anio < 1995 ? 'SI' : 'NO'
}

/** `AT10 = IF(AT8="SI","NO","SI")` — Ley 19537 (copropiedad), la contraria de la 6071. */
export function ley19537De(ley6071: string): string {
  if (ley6071 === 'SI') return 'NO'
  if (ley6071 === 'NO') return 'SI'
  return ''
}

/** `H15 = UPPER(Portada!AP6)` — el tipo de agrupamiento es la agrupación de la sección B. */
export function tipoAgrupamientoDe(c: ContextoI): string {
  return sinTilde(c.agrupacion).trim().toUpperCase()
}

/** Código de rumbo de la sección B («N», «NO», «Norponiente»…) → rumbo de la planilla. */
const RUMBO_POR_CODIGO: Record<string, (typeof RUMBOS)[number]> = {
  N: 'NORTE',
  S: 'SUR',
  E: 'ESTE',
  O: 'OESTE',
  W: 'OESTE',
  NE: 'NORESTE',
  NO: 'NOROESTE',
  NW: 'NOROESTE',
  SE: 'SURESTE',
  SO: 'SUROESTE',
  SW: 'SUROESTE',
  NORTE: 'NORTE',
  SUR: 'SUR',
  ESTE: 'ESTE',
  OESTE: 'OESTE',
  PONIENTE: 'OESTE',
  ORIENTE: 'ESTE',
  NORESTE: 'NORESTE',
  NOROESTE: 'NOROESTE',
  SURESTE: 'SURESTE',
  SUROESTE: 'SUROESTE',
  NORORIENTE: 'NORESTE',
  NORPONIENTE: 'NOROESTE',
  SURORIENTE: 'SURESTE',
  SURPONIENTE: 'SUROESTE',
}

/**
 * La orientación de la sección B, como rumbo de la planilla. La usan la
 * orientación del terreno (`AT24`) y la de la construcción (`Z17`): las dos
 * son la misma en MET-6283 («NORTE»). Es un dato de la solicitud, no la
 * constante residual `NOROESTE` de la plantilla, que no se usa (spec §2.8.1).
 */
export function rumboDe(c: ContextoI): string {
  const clave = sinTilde(c.orientacion).trim().toUpperCase().replace(/[\s.-]/g, '')
  return RUMBO_POR_CODIGO[clave] ?? ''
}

/** Ubicación urbano/rural del SII → `Portada!S23` («Urbana» · «Rural»). */
export function tipoZonaSectorDe(c: ContextoI): string {
  const v = sinTilde(c.ubicacionUrbanoRural).trim().toLowerCase()
  if (v.startsWith('rural')) return 'Rural'
  if (v.startsWith('urban')) return 'Urbana'
  return ''
}

/** `Portada!AE25 = IF(tipo="CASA","Licuado",IF(tipo="Departamento","Red Pública"," "))` */
export function gasPorDefecto(c: ContextoI): string {
  if (tipoEs(c, 'casa')) return 'Licuado'
  if (tipoEs(c, 'departamento')) return 'Red Pública'
  return ''
}

/** `Portada!BK7` — en casa, «No» (la app no registra superficie de mansarda); si no, vacío. */
export function mansardaPorDefecto(c: ContextoI): string {
  return tipoEs(c, 'casa') ? 'No' : ''
}

/** `Portada!BK3` — uso actual del bien, que es el destino SII. */
export function usoMasProbableDe(c: ContextoI): string {
  return c.destinoSii.trim().toUpperCase()
}

/**
 * `Portada!AX26 = 100-(AP23+AP24+AP25+AP26+AX23+AX24+AX25)` — «Otros». Sin
 * ningún porcentaje cargado no se imprime el 100 de la planilla vacía.
 */
export function pctOtros(u: UsoTerrenosI): number | null {
  const valores = CLAVES_I.usoTerrenos.map((k) => u[k].trim())
  if (valores.every((v) => v === '')) return null
  const suma = valores.reduce((s, v) => s + (Number(v) || 0), 0)
  return Math.round((100 - suma) * 100) / 100
}

/**
 * `Portada!BB29` — descripción de la expropiación:
 * `"De acuerdo al " & BL25 & IF(BL25=CA29, ", se adjunta en anexo,") &
 * " de la Municipalidad de " & comuna & " la propiedad " & BK24 & " cuenta con
 * expropiación."` La condición que la envuelve en la planilla es siempre
 * verdadera, así que el texto sale siempre que haya fuente.
 */
export function textoExpropiacion(d: Pick<DetalleI, 'fuenteInformacion' | 'afectoExpropiacion'>, comuna: string): string {
  const fuente = d.fuenteInformacion.trim()
  if (fuente === '') return ''
  const anexo = fuente === FUENTE_CERTIFICADO ? ', se adjunta en anexo,' : ''
  return `De acuerdo al ${fuente}${anexo} de la Municipalidad de ${comuna.trim()} la propiedad ${d.afectoExpropiacion.trim()} cuenta con expropiación.`
}

/* -------------------------------------------------------------------------
 * Sección I por defecto y dependencias en vivo
 * ---------------------------------------------------------------------- */

/** Valor fijo de `C_DefaultsAntecedentes` (atributo `valor`) o `''`. */
const fijo = (tabla: DefaultsTabla, campo: string) => tabla[campo]?.valor ?? ''

/**
 * La sección I como la deja la planilla para una solicitud: los valores fijos
 * de `C_DefaultsAntecedentes` (`tabla`, ya filtrada por tipo × estado de uso)
 * más las fórmulas. Las siete exigencias van en `OGUC`, que es lo que la
 * planilla imprime cuando la zona no está en su hoja `Zonificacion`: el
 * catálogo `M_Zonificacion` todavía no sirve para leerlas (spec §2.8.1, «lo
 * que no arrastra todavía»).
 */
export function seccionIPorDefecto(c: ContextoI, tabla: DefaultsTabla): SeccionI {
  const ley6071 = ley6071PorDefecto(c)
  const rumbo = rumboDe(c)
  return {
    detalle: {
      sitioLote: '',
      mansarda: mansardaPorDefecto(c),
      afectoExpropiacion: fijo(tabla, 'afecto_expropiacion'),
      fuenteInformacion: fijo(tabla, 'fuente_informacion'),
    },
    normativa: {
      supPredialMinimo: EXIGENCIA_SIN_ZONA,
      frentePredialMinimo: EXIGENCIA_SIN_ZONA,
      ocupacionSuelo: EXIGENCIA_SIN_ZONA,
      coefConstructibilidad: EXIGENCIA_SIN_ZONA,
      alturaEdificacion: EXIGENCIA_SIN_ZONA,
      distanciaMedianero: EXIGENCIA_SIN_ZONA,
      sistemaAgrupamiento: EXIGENCIA_SIN_ZONA,
      ley6071,
      ley9135: fijo(tabla, 'ley_9135'),
      ley19537: ley19537De(ley6071),
      cumpleUsoActual: fijo(tabla, 'cumple_uso_actual'),
      cumpleTipoConstruccion: fijo(tabla, 'cumple_tipo_construccion'),
      usoMasProbable: usoMasProbableDe(c),
      cambiosPlanRegulador: fijo(tabla, 'cambios_plan_regulador'),
    },
    sector: {
      demanda: '',
      tendencia: '',
      densidad: '',
      mercado: '',
      abc1: '',
      homogeneidad: '',
      destinoBarrio: '',
      tipoZona: tipoZonaSectorDe(c),
      calzada: '',
      acera: '',
      solera: '',
      antejardin: '',
      redElectrica: '',
      aguaPotable: '',
      gas: gasPorDefecto(c),
      proyUsoTerrenos: '',
      arteriaPrincipal: '',
    },
    usoTerrenos: {
      casas: '',
      deptos: '',
      condominios: '',
      equipComercial: '',
      industrial: '',
      comercial: '',
      sitiosEriazos: '',
    },
    terreno: {
      forma: '',
      pendiente: '',
      orientacion: rumbo,
      frente: '',
      contrafrente: '',
      deslindeNorte: '',
      deslindeSur: '',
    },
    emplazamiento: {
      tipoAgrupamiento: tipoAgrupamientoDe(c),
      disenoArquitectonico: fijo(tabla, 'diseno_arquitectonico'),
      utilidadFuncional: fijo(tabla, 'utilidad_funcional'),
      tipoAdosamiento: fijo(tabla, 'tipo_adosamiento'),
      predioVista: fijo(tabla, 'predio_vista'),
      orientacionConstruccion: rumbo,
      relacionTerrenoConstruccion: fijo(tabla, 'relacion_terreno_construccion'),
      iluminacionNatural: fijo(tabla, 'iluminacion_natural'),
    },
    instalaciones: {
      alcantarillado: fijo(tabla, 'alcantarillado'),
      otros: '',
    },
  }
}

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '')

/**
 * Deja sólo las claves que la sección conoce, como texto. Es lo que se guarda
 * en el JSON: un payload con claves de más no ensucia el campo.
 */
export function normalizarSeccionI(i: unknown): SeccionI {
  const o = (i ?? {}) as Partial<Record<keyof SeccionI, Record<string, unknown>>>
  const bloque = <B extends keyof SeccionI>(b: B): SeccionI[B] =>
    Object.fromEntries(CLAVES_I[b].map((k) => [k, texto(o[b]?.[k as string])])) as unknown as SeccionI[B]
  return {
    detalle: bloque('detalle'),
    normativa: bloque('normativa'),
    sector: bloque('sector'),
    usoTerrenos: bloque('usoTerrenos'),
    terreno: bloque('terreno'),
    emplazamiento: bloque('emplazamiento'),
    instalaciones: bloque('instalaciones'),
  }
}

/**
 * Completa una sección I guardada (o de un borrador viejo) con los defaults de
 * lo que falte. Lo guardado gana siempre; sólo se rellenan claves ausentes.
 */
export function completarSeccionI(guardada: unknown, c: ContextoI, tabla: DefaultsTabla): SeccionI {
  const base = seccionIPorDefecto(c, tabla)
  if (!guardada || typeof guardada !== 'object') return base
  const g = guardada as Partial<Record<keyof SeccionI, Record<string, unknown>>>
  const bloque = <B extends keyof SeccionI>(b: B): SeccionI[B] =>
    Object.fromEntries(
      CLAVES_I[b].map((k) => {
        const v = g[b]?.[k as string]
        return [k, v === undefined || v === null ? (base[b] as unknown as Record<string, string>)[k as string] : texto(v)]
      }),
    ) as unknown as SeccionI[B]
  return {
    detalle: bloque('detalle'),
    normativa: bloque('normativa'),
    sector: bloque('sector'),
    usoTerrenos: bloque('usoTerrenos'),
    terreno: bloque('terreno'),
    emplazamiento: bloque('emplazamiento'),
    instalaciones: bloque('instalaciones'),
  }
}

/** Cambia la Ley 6071 y, con ella, la 19537 (`AT10`). */
export function cambiarLey6071(i: SeccionI, valor: string): SeccionI {
  return { ...i, normativa: { ...i.normativa, ley6071: valor, ley19537: ley19537De(valor) } }
}

/**
 * Lo que cambia en I cuando cambia algo de la sección B que la planilla lee
 * (agrupación, año, orientación). Sólo se mueven las celdas que **todavía**
 * tienen el valor que la fórmula daba con el contexto anterior: lo que el
 * tasador cambió a mano no se toca.
 */
export function reaplicarContextoI(i: SeccionI, antes: ContextoI, ahora: ContextoI): SeccionI {
  let sig = i

  const agrupAntes = tipoAgrupamientoDe(antes)
  const agrupAhora = tipoAgrupamientoDe(ahora)
  if (agrupAntes !== agrupAhora && sig.emplazamiento.tipoAgrupamiento === agrupAntes) {
    sig = { ...sig, emplazamiento: { ...sig.emplazamiento, tipoAgrupamiento: agrupAhora } }
  }

  const leyAntes = ley6071PorDefecto(antes)
  const leyAhora = ley6071PorDefecto(ahora)
  if (leyAntes !== leyAhora && sig.normativa.ley6071 === leyAntes) {
    sig = cambiarLey6071(sig, leyAhora)
  }

  const rumboAntes = rumboDe(antes)
  const rumboAhora = rumboDe(ahora)
  if (rumboAntes !== rumboAhora) {
    if (sig.terreno.orientacion === rumboAntes) {
      sig = { ...sig, terreno: { ...sig.terreno, orientacion: rumboAhora } }
    }
    if (sig.emplazamiento.orientacionConstruccion === rumboAntes) {
      sig = { ...sig, emplazamiento: { ...sig.emplazamiento, orientacionConstruccion: rumboAhora } }
    }
  }

  return sig
}

/* -------------------------------------------------------------------------
 * Proyección al informe (claves de la plantilla Carbone v5)
 * ---------------------------------------------------------------------- */

/** Lo que la Hoja N°3 y la Hoja 1 imprimen de otras secciones o de la solicitud. */
export interface ImpresionI {
  comuna: string
  /** Sección B. */
  calidadConstructiva: string
  estadoConservacion: string
  /** Fórmula `TX_DatosTasacion.dfl2` ('SI'/'NO'). */
  dfl2: string
  /** Subterráneos de la sección B. */
  subterraneos: string
  /** `CODIGO(Comuna)` ya compuesto. */
  zona: string
  /** Número de la casa/depto tomado de la dirección. */
  casaNumero: string
  /** «Sí» si la sección E declara alguna ampliación. */
  ampliacion: string
  /** Sello SEC de la sección F, ya como rótulo. */
  selloSec: string
}

/** «29.95» → «29,95», como imprime la planilla. */
const decimalCl = (v: string) => v.trim().replace('.', ',')

/** Un porcentaje de la tabla de uso de terrenos: número, o vacío. */
const pct = (v: string): number | '' => {
  const t = v.trim()
  if (t === '') return ''
  const n = Number(t)
  return Number.isFinite(n) ? n : ''
}

export interface CualitativaI {
  normativa: Record<string, string>
  sector: Record<string, string | number>
  geometriaTerreno: Record<string, string>
  emplazamiento: Record<string, string>
  servicios: Record<string, string>
  detallePropiedad: Record<string, string>
  textoExpropiacion: string
}

/** La sección I con los nombres de la plantilla (`{d.cualitativa.*}` · `{d.textosIA.textoExpropiacion}`). */
export function cualitativaDeSeccionI(i: SeccionI, p: ImpresionI): CualitativaI {
  const s = i.sector
  const abc1 = [s.abc1, s.homogeneidad].filter((x) => x.trim() !== '').join('/')
  const otros = pctOtros(i.usoTerrenos)
  const subterraneos = Number(p.subterraneos)
  return {
    normativa: {
      supPredialMinimo: i.normativa.supPredialMinimo,
      frentePredialMinimo: i.normativa.frentePredialMinimo,
      ocupacionSuelo: i.normativa.ocupacionSuelo,
      coefConstructibilidad: i.normativa.coefConstructibilidad,
      alturaEdificacion: i.normativa.alturaEdificacion,
      distanciaMedianero: i.normativa.distanciaMedianero,
      sistemaAgrupamiento: i.normativa.sistemaAgrupamiento,
      antejardin: '',
      dfl2: p.dfl2,
      ley6071: i.normativa.ley6071,
      ley9135: i.normativa.ley9135,
      ley19537: i.normativa.ley19537,
      cumpleUsoActual: i.normativa.cumpleUsoActual,
      cumpleTipoConstruccion: i.normativa.cumpleTipoConstruccion,
      usoMasProbable: i.normativa.usoMasProbable,
      cambiosPlanRegulador: i.normativa.cambiosPlanRegulador,
    },
    sector: {
      demanda: s.demanda,
      tendencia: s.tendencia,
      densidad: s.densidad,
      mercado: s.mercado,
      abc1,
      destinoBarrio: s.destinoBarrio,
      tipoZona: s.tipoZona,
      calzada: s.calzada,
      acera: s.acera,
      solera: s.solera,
      antejardin: s.antejardin,
      redElectrica: s.redElectrica,
      aguaPotable: s.aguaPotable,
      gas: s.gas,
      proyUsoTerrenos: s.proyUsoTerrenos,
      pctCasas: pct(i.usoTerrenos.casas),
      pctDeptos: pct(i.usoTerrenos.deptos),
      pctCondominios: pct(i.usoTerrenos.condominios),
      pctEquipComercial: pct(i.usoTerrenos.equipComercial),
      pctIndustrial: pct(i.usoTerrenos.industrial),
      pctComercial: pct(i.usoTerrenos.comercial),
      pctSitiosEriazos: pct(i.usoTerrenos.sitiosEriazos),
      pctOtros: otros ?? '',
      arteriaPrincipal: s.arteriaPrincipal,
    },
    geometriaTerreno: {
      forma: i.terreno.forma,
      pendiente: i.terreno.pendiente,
      orientacion: i.terreno.orientacion,
      frente: decimalCl(i.terreno.frente),
      contrafrente: decimalCl(i.terreno.contrafrente),
      deslindeNorte: decimalCl(i.terreno.deslindeNorte),
      deslindeSur: decimalCl(i.terreno.deslindeSur),
    },
    emplazamiento: {
      tipoAgrupamiento: i.emplazamiento.tipoAgrupamiento,
      disenoArquitectonico: i.emplazamiento.disenoArquitectonico,
      utilidadFuncional: i.emplazamiento.utilidadFuncional,
      tipoAdosamiento: i.emplazamiento.tipoAdosamiento,
      calidadConstructiva: p.calidadConstructiva,
      estadoConservacion: p.estadoConservacion,
      predioVista: i.emplazamiento.predioVista,
      orientacionConstruccion: i.emplazamiento.orientacionConstruccion,
      relacionTerrenoConstruccion: i.emplazamiento.relacionTerrenoConstruccion,
      iluminacionNatural: i.emplazamiento.iluminacionNatural,
    },
    servicios: {
      alcantarillado: i.instalaciones.alcantarillado,
      aguaPotable: s.aguaPotable,
      electricidad: s.redElectrica,
      gas: s.gas,
      otros: i.instalaciones.otros,
    },
    detallePropiedad: {
      casaNumero: p.casaNumero,
      sitioLote: i.detalle.sitioLote,
      zona: p.zona,
      // Sin subterráneos la Hoja 1 de MET-6283 deja la casilla en blanco.
      subterraneos: Number.isFinite(subterraneos) && subterraneos > 0 ? String(subterraneos) : '',
      mansarda: i.detalle.mansarda,
      selloSec: p.selloSec,
      afectoExpropiacion: i.detalle.afectoExpropiacion,
      fuenteInformacion: i.detalle.fuenteInformacion,
      ampliacion: p.ampliacion,
    },
    textoExpropiacion: textoExpropiacion(i.detalle, p.comuna),
  }
}

/**
 * Número de la unidad desde la dirección compuesta de la solicitud
 * («LOS EUCALIPTUS, Casa: N°2100, Condominio …» → «N°2100»), que es lo que la
 * Hoja 1 imprime en «Casa Nº» (`Portada!AU5`).
 */
export function casaNumeroDeDireccion(direccion: string): string {
  const m = /(?:casa|depto\.?|departamento|oficina|local|bodega|sitio)\s*:?\s*([^,]+)/i.exec(direccion)
  return m ? m[1].trim() : ''
}

/* -------------------------------------------------------------------------
 * Borradores de la síntesis (casilla editable mientras no exista RF-32)
 * ---------------------------------------------------------------------- */

/** Lo que el borrador de la síntesis de la propiedad lee del formulario. */
export interface DatosSintesisPropiedad {
  tipoPropiedad: string
  agrupacion: string
  condominio: string
  direccion: string
  supTerreno: string
  pisos: string
  estructura: string
  supPrimerPiso: string
  /** Recintos del 1 nivel con su cantidad, en el orden de la planilla. */
  recintosNivel1: readonly { id: TipoHabitacion; cantidad: number }[]
  obrasComplementarias: string
}

/**
 * Lo que el borrador de la síntesis de la propiedad lee: la sección B, la
 * sección E (estructura, recintos del 1 nivel, obras complementarias) y la
 * solicitud (tipo, dirección, condominio). Lo usan el servidor (precarga) y la
 * pantalla («Rehacer borrador»), así que da lo mismo en los dos lados.
 */
export function datosSintesisPropiedad(
  tasacion: { tipo: string; direccion?: string; proyecto?: string },
  b: { agrupacionPropiedad: string; supTerreno: string; pisosPropiedad: string; supPrimerPiso: string; condominioNombre?: string },
  e: SeccionE,
): DatosSintesisPropiedad {
  return {
    tipoPropiedad: tasacion.tipo,
    agrupacion: b.agrupacionPropiedad,
    condominio: b.condominioNombre?.trim() || tasacion.proyecto?.trim() || '',
    direccion: tasacion.direccion ?? '',
    supTerreno: b.supTerreno,
    pisos: b.pisosPropiedad,
    estructura: e.elementos.estructuraSoportante.materialidad,
    supPrimerPiso: b.supPrimerPiso || e.habitaciones.n1.superficieM2,
    recintosNivel1: TIPOS_HABITACION.map((t) => ({ id: t.id, cantidad: e.habitaciones.n1.cantidades[t.id] ?? 0 })),
    obrasComplementarias: e.elementos.obrasComplementarias.materialidad,
  }
}

/** Nombre en prosa de cada tipo de recinto: [singular, plural]. «Otros» no se nombra. */
const RECINTO_EN_PROSA: Partial<Record<TipoHabitacion, [string, string]>> = {
  hall: ['hall', 'halls'],
  living: ['living', 'livings'],
  comedor: ['comedor', 'comedores'],
  estar: ['sala de estar', 'salas de estar'],
  cocina: ['cocina', 'cocinas'],
  loggia: ['logia', 'logias'],
  escritorio: ['escritorio', 'escritorios'],
  suite: ['dormitorio en suite', 'dormitorios en suite'],
  dormSimple: ['dormitorio simple', 'dormitorios simples'],
  dormServicio: ['dormitorio de servicio', 'dormitorios de servicio'],
  banos: ['baño completo', 'baños completos'],
  medioBano: ['medio baño', 'medios baños'],
  banoServicio: ['baño de servicio', 'baños de servicio'],
}

const m2 = (v: string) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? `${n.toLocaleString('es-CL', { maximumFractionDigits: 2 })} m²` : ''
}

const enumerar = (xs: readonly string[]) =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`

/**
 * Borrador de «Síntesis de la propiedad» (`Portada!D12`) armado **sólo con datos
 * del formulario**: no agrega cifras que no estén cargadas (contrato de RF-32).
 * El tasador lo completa con lo que vio en terreno.
 */
export function borradorSintesisPropiedad(d: DatosSintesisPropiedad): string {
  const casa = sinTilde(d.tipoPropiedad).trim().toLowerCase() === 'casa'
  const bien = casa ? 'una vivienda' : 'una propiedad'
  const frases: string[] = []

  const donde = d.agrupacion.trim() && d.condominio.trim() ? `en el ${d.agrupacion.trim()} ${d.condominio.trim()}` : ''
  const calle = [d.direccion.split(',')[0]?.trim() ?? '', casaNumeroDeDireccion(d.direccion)].filter(Boolean).join(' ')
  const ubicacion = calle ? `${donde ? ', ubicado' : ' ubicada'} en ${calle}` : ''
  frases.push(`El bien es ${bien}${donde ? ` que se encuentra ${donde}` : ''}${ubicacion}.`)

  if (m2(d.supTerreno)) frases.push(`La propiedad tiene ${m2(d.supTerreno)} de terreno.`)

  const pisos = Number(d.pisos)
  if (Number.isFinite(pisos) && pisos > 0) {
    const material = d.estructura.trim() ? ` construido${pisos > 1 ? 's' : ''} en ${d.estructura.trim()}` : ''
    frases.push(`La ${casa ? 'vivienda' : 'propiedad'} tiene ${pisos} piso${pisos > 1 ? 's' : ''}${material}.`)
  }

  const recintos = d.recintosNivel1.flatMap((r) => {
    const nombre = RECINTO_EN_PROSA[r.id]
    if (!nombre || r.cantidad <= 0) return []
    return [r.cantidad > 1 ? `${r.cantidad} ${nombre[1]}` : nombre[0]]
  })
  if (recintos.length > 0 || m2(d.supPrimerPiso)) {
    const sup = m2(d.supPrimerPiso) ? ` tiene ${m2(d.supPrimerPiso)}` : ''
    const cuenta = recintos.length > 0 ? `${sup ? ' y' : ''} cuenta con ${enumerar(recintos)}` : ''
    frases.push(`El primer piso${sup}${cuenta}.`)
  }

  if (d.obrasComplementarias.trim()) {
    const obras = d.obrasComplementarias
      .split('+')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
    frases.push(`El exterior cuenta con ${enumerar(obras)}.`)
  }

  return frases.join(' ')
}

/**
 * Borrador de «Descripción del sector» (`Portada!D18`) con lo que el tasador
 * cargó en el sector. Sin datos de sector, vacío.
 */
export function borradorDescripcionSector(s: SectorI): string {
  const frases: string[] = []
  const rasgos = [
    s.destinoBarrio.trim() && `de carácter ${s.destinoBarrio.trim().toLowerCase()}`,
    s.densidad.trim() && `de densidad ${s.densidad.trim().toLowerCase()}`,
  ].filter(Boolean) as string[]
  if (rasgos.length > 0) frases.push(`El sector es ${enumerar(rasgos)}.`)
  const mercado = [
    s.demanda.trim() && `demanda ${s.demanda.trim().toLowerCase()}`,
    s.tendencia.trim() && `tendencia ${s.tendencia.trim().toLowerCase()}`,
  ].filter(Boolean) as string[]
  if (mercado.length > 0) frases.push(`Presenta ${enumerar(mercado)}${s.mercado.trim() ? `, en un mercado ${s.mercado.trim().toLowerCase()}` : ''}.`)
  else if (s.mercado.trim()) frases.push(`Corresponde a un mercado ${s.mercado.trim().toLowerCase()}.`)
  if (s.arteriaPrincipal.trim()) {
    frases.push(
      `El comercio, el transporte y los servicios se encuentran en la avenida más cercana: ${s.arteriaPrincipal.trim()}.`,
    )
  }
  return frases.join(' ')
}
