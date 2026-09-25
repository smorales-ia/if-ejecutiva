/**
 * `InformeContexto` — el contrato del JSON canónico del informe de tasación.
 *
 * Tanda T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 2 · Spec §7
 * (RF-30/31/32/33/39). Es el payload que la «imprenta» (SC09 → Carbone)
 * consumirá en la Tanda 5, y lo que hoy mide el harness de paridad contra el
 * gold master MET-6283 (VP-2026-0066).
 *
 * ## Superset de `InformeCanonico` — extiende, no reescribe
 *
 * El modelo canónico de `lib/tasador/lectura-informe.ts` (8 bloques §10.1)
 * sigue siendo la fuente de los bloques 1-8; este contrato lo **embebe** en
 * `canonico` y lo reorganiza en grupos con nombre estable para la matriz de
 * tags (`lib/informe/matriz-tags.ts`): un tag Carbone `{d.cuadro.totalUf}`
 * necesita una ruta que no dependa del índice de un array de bloques.
 *
 * ## Regla de los huecos — `null` explícito, nunca omisión
 *
 * Todo dato del gold master que hoy **no tiene fuente digital** (auditoría
 * PARIDAD 228 E-ids: P0-2 textos IA, P1-1/P1-2 Hoja 3 cualitativa, P1-3 dólar,
 * P1-4 mapa, P1-5 logo/revisor, P1-9 firma/visado/vida útil) existe igual en
 * el contrato, tipado `| null`, y su ausencia queda **declarada** en
 * `huecos[]` con trazabilidad al P-id del roadmap. Un consumidor (plantilla,
 * harness, SC09) nunca adivina: o hay valor, o hay hueco con nombre.
 *
 * ## Qué NO decide este módulo
 *
 * Cero lógica de negocio: los valores terminales vienen de `TX_Calculos`
 * (motor AT03), la UF/dólar de `H_PreciosUF` (cron), el cuadro de
 * `TX_ItemsCuadroValoracion`. Los únicos campos *calculados* por el
 * ensamblador son los promedios/fila TASACIÓN de comparables
 * (`tasacionUfM2` · `tasacionVsPct`), puente explícito hasta que T2 los
 * persista en el motor (P1-8 · F-2) — así lo manda el ROADMAP §3 bloque 2.
 */

import type {
  AntecedentesLegales,
  DatosSii,
  InformeCanonico,
} from '@/lib/tasador/lectura-informe'

/**
 * Un dato del gold master sin fuente digital hoy, trazado a su pendiente.
 * `eIds` usa el formato de la auditoría (`E-59`); `pId` el del roadmap
 * (`P0-2`, `P1-1`…).
 */
export interface Hueco {
  /** Ruta dentro de `InformeContexto` donde el dato viviría (`a.b.c`). */
  ruta: string
  /** E-ids de la auditoría PARIDAD que dependen de este dato. */
  eIds: string[]
  /** Pendiente del roadmap que lo cierra (`P0-2`, `P1-1`, …). */
  pId: string
  /** Por qué no hay valor — en una frase, para humanos. */
  motivo: string
}

/** Identificadores del documento (E-04/05/17/31 · encabezados Hojas 2-7). */
export interface MetaInforme {
  /** `codigo_solicitud` — el N° interno («VP-2026-0066»). */
  codigo: string
  /** `codigo_ext` (fórmula, read-only). */
  codigoExt: string
  /** `n_operacion_cliente` (`fldb1vmKk7y3hi4uY`, number). */
  nOperacionCliente: number | null
  /** `numero_solicitud` — el código que usa el cliente («METLIFE-6283»). */
  numeroSolicitudCliente: string | null
  /** Estado backend de la solicitud (informativo para el orquestador). */
  estado: string
  /** Versión vigente del documento (RN-56) — `null` sin fila (CI-024). */
  version: number | null
  /** `generado_en` de la versión vigente. `null` hasta que SC09 exista. */
  fechaEmision: string | null
}

/** Marca e institución del cliente en portada (E-02 · E-114 · H9). */
export interface ClienteInforme {
  /** Nombre del cliente (Link `cliente` resuelto contra `M_Clientes`). */
  nombre: string | null
  /** `C_VariablesCliente.logo_url` — hoy sin clientes reales (P1-5 · H9). */
  logoUrl: string | null
  /** `C_VariablesCliente.nombre_revisor` — hoy sin valor (P1-5 · H9). */
  nombreRevisor: string | null
}

/** Personas del informe: propietario, ejecutivo, tasador, visador. */
export interface PartesInforme {
  /** `cliente_final_nombre` — el propietario tasado. */
  propietario: string
  /** `cliente_final_rut`. */
  rut: string
  /** `ejecutivo_solicitante` (texto libre del alta). */
  ejecutivo: string | null
  tasador: {
    /** Nombre resuelto del Link `tasador` → `M_Tasadores`. */
    nombre: string | null
    /** Imagen de firma manuscrita — sin mecanismo hoy (P1-9 · E-111). */
    firmaUrl: string | null
  }
  visador: {
    /** Nombre resuelto del Link `visador` → `M_Visadores`. */
    nombre: string | null
  }
  /** `fecha_visita` — la fecha **real** (regla T-B), no la planificada. */
  fechaVisita: string
  /** Fecha de visado — IF-04 no existe (P1-9 · E-113). */
  fechaVisado: string | null
}

/**
 * Bloque 3 + sección B: la propiedad tal como la capturó el tasador.
 * Nombres alineados a `TX_DatosTasacion`/`TX_Solicitudes` (schema real).
 */
export interface PropiedadInforme {
  direccion: string
  /** Nombre de la comuna (Link resuelto contra `M_Comunas`). */
  comuna: string | null
  region: string
  /** Nombre del tipo de propiedad (Link → `M_TiposPropiedad`). */
  tipoPropiedad: string | null
  /** Objetivo de la tasación = nombre del `tipo_informe` (E-25). */
  objetivo: string | null
  /** `tipo_propiedad_nuevo_usado` (`nueva · usada`). */
  nuevoUsado: string
  proyectoCondominio: string
  supTerrenoM2: number | null
  supConstruccionM2: number | null
  supPrimerPisoM2: number | null
  supConstruidaTotal: number | null
  anioConstruccion: number | null
  materialPredominante: string
  calidadConstruccion: number | null
  estadoConservacion: string
  agrupacion: string
  /** singleSelect — persiste sólo la primera opción (CI-023 §5). */
  orientacion: string
  pisos: number | null
  dormitorios: number | null
  banos: number | null
  estacionamientos: number | null
  bodegas: number | null
  /** Fórmula `IF(sup_construida_total < 140…)` — read-only. */
  dfl2: string
  velocidadVentaEstimada: string
  tipoZonaDescripcion: string
  /** Vida útil / remanente — `F_VidaUtil` fuera de la regla (P1-9 · E-48). */
  vidaUtil: number | null
}

/** Una fila del cuadro de valoración (bloque 5 · sección C). */
export interface ItemCuadroInforme {
  id: string
  /** `orden`, con caída a `item_id` (las filas del motor no traen `orden`). */
  orden: number | null
  /** `descripcion`, con caída a `nombre_item` (ídem). */
  descripcion: string
  tipoItem: string
  supM2: number | null
  /** `uf_m2_aplicado` con caída a `uf_m2_unitario` (pareja vieja/nueva). */
  ufM2Aplicado: number | null
  factorAplicado: number | null
  /** `uf_total_item` con caída a la fórmula `valor_uf` (pareja vieja/nueva). */
  ufTotalItem: number | null
  aportaAGarantia: boolean
  situacionMunicipal: string
}

/** Cuadro de valoración completo (E-87..98). */
export interface CuadroInforme {
  items: ItemCuadroInforme[]
  /** Suma de `ufTotalItem`. `null` sin ítems (nunca un 0 inventado). */
  totalUf: number | null
}

/**
 * Los valores terminales del motor AT03 (filas de `TX_Calculos`, una por
 * fórmula v32: `variable_output` → `resultado`) más las paridades del día
 * (`H_PreciosUF` por `fecha_visita`).
 */
export interface TerminalesInforme {
  valorComercialUf: number | null
  valorComercialClp: number | null
  valorReposicionUf: number | null
  valorReposicionClp: number | null
  seguroIncendioUf: number | null
  seguroIncendioClp: number | null
  /** `F_AvaluoFiscalUF` (E-106) — avalúo fiscal expresado en UF. */
  avaluoFiscalUf: number | null
  valorRemateUf: number | null
  valorRemateClp: number | null
  valorLiquidacionUf: number | null
  valorLiquidacionClp: number | null
  rentaPerpetuaClp: number | null
  ingresoLiquidoAnualClp: number | null
  /** «1UF=» — `H_PreciosUF.valor_clp` del día de la visita (E-102). */
  ufDia: number | null
  /** «1US$=» — `tipo_cambio_usd`; sin escritor automático (P1-3 · E-103). */
  usdDia: number | null
  /** Fecha de la fila de `H_PreciosUF` usada (= `fecha_visita`). */
  fechaUf: string | null
}

/** Una fila de la muestra de referencias (bloque 6 · TX_Comparables). */
export interface FilaComparableInforme {
  id: string
  direccion: string
  comuna: string
  supTerreno: number | null
  supConstruida: number | null
  precioUf: number | null
  anio: number | null
  tipoReferencia: string
  /** UF/m² de construcción — fórmula directa A-44 del modelo canónico. */
  ufM2Construccion: number | null
}

/**
 * Comparables + los agregados de la muestra (E-61..75).
 *
 * `tasacionUfM2` y `tasacionVsPct` son los **únicos campos calculados por el
 * ensamblador** (no persisten en ninguna tabla): cablean la fila TASACIÓN que
 * hoy pinta «—» (F-2) como puente hasta que T2 los persista en el motor
 * (P1-8). Fórmulas documentadas en `ensamblador.ts`.
 */
export interface ComparablesInforme {
  filas: FilaComparableInforme[]
  /** Promedio UF/m² de la muestra (modelo canónico, A-44). */
  promedioUfM2: number | null
  usadosEnPromedio: number
  /** RF-12 exige mínimo 3. Se informa; no se bloquea acá. */
  cumpleMinimo: boolean
  /** Fila TASACIÓN: `valorComercialUf / supConstruccionM2`. Calculado. */
  tasacionUfM2: number | null
  /** Desviación % de la tasación vs el promedio de la muestra. Calculado. */
  tasacionVsPct: number | null
}

/** Sección H + fórmulas de rentabilidad del motor (E-77..83). */
export interface RentabilidadInforme {
  /** `arriendo_bruto_mensual_clp` (el campo que lee el motor). */
  arriendoBrutoMensualClp: number | null
  /** `gasto_anual_clp` (ídem). */
  gastoAnualClp: number | null
  /** `F_IngresoLiquidoAnualCLP` del motor. */
  ingresoLiquidoAnualClp: number | null
  /** `F_RentaPerpetuaCLP` del motor. */
  rentaPerpetuaClp: number | null
  /** Cap rate efectivo (override ?? almacenado) — cascada de CI-063. */
  tasaCapRate: number | null
  /** Arriendo UF/mes — `F_IngresoLiquido` fuera de la regla (P2-3 · E-78). */
  arriendoUfMes: number | null
}

/** Textos redactados — sin productor hoy (P0-2 · RF-32 · E-59/60). */
export interface TextosIaInforme {
  sintesisPropiedad: string | null
  descripcionSector: string | null
  /** Párrafo de expropiación — plantilla con variables, depende de la
   *  columna `afecto_expropiacion` que no existe (P1-1 · E-57). */
  textoExpropiacion: string | null
}

/**
 * La mitad cualitativa de la Hoja 3 — **sin captura ni columnas hoy**
 * (P1-1/P1-2). Cada grupo se tipa como bolsa abierta porque su forma la
 * definirá T4 al crear columnas; mientras tanto el contrato sólo garantiza
 * que la clave existe y es `null`.
 */
export type GrupoCualitativo = Record<string, unknown>

export interface CualitativaInforme {
  /** Exigencias normativas y plan regulador (E-125..140 · P1-2). */
  normativa: GrupoCualitativo | null
  /** Mercado y sector (E-141..157 · P1-2). */
  sector: GrupoCualitativo | null
  /** Forma/pendiente/frente/deslindes del terreno (E-159..165 · P1-2). */
  geometriaTerreno: GrupoCualitativo | null
  /** Emplazamiento cualitativo (E-167..175 · P1-2). */
  emplazamiento: GrupoCualitativo | null
  /** Características constructivas — la UI captura y descarta (E-176..191 · P1-1). */
  constructivas: GrupoCualitativo | null
  /** Servicios de la propiedad (E-197..201 · P1-2). */
  servicios: GrupoCualitativo | null
  /** Comodidades 16 SI/NO — la UI captura 14 switches y descarta (E-207 · P1-1). */
  comodidades: GrupoCualitativo | null
  /** Condominio/sitio/zona/mansarda/subterráneos/fuente + sello SEC +
   *  afecto expropiación — capturados y descartados (E-37.. · E-54/55 · P1-1). */
  detallePropiedad: GrupoCualitativo | null
}

/** Sección E: ampliaciones, habitaciones por nivel, terminaciones. */
export interface RecintosInforme {
  ampliaciones: {
    id: string
    descripcion: string
    supM2: number | null
    /** ⚠ number (sólo el año), no fecha completa (P2-3). */
    annoRegularizacion: number | null
  }[]
  habitacionesPorNivel: {
    id: string
    nivel: string
    tipoRecinto: string
    cantidad: number | null
  }[]
  terminacionesPorRecinto: {
    id: string
    nombre: string
    categoria: string
    descripcion: string
    calidad: string
  }[]
}

/** Registro fotográfico (bloque 7 · E-58/99 · E-210/211). */
export interface FotosInforme {
  total: number
  porCategoria: Record<string, number>
  fotos: { id: string; nombre: string; categoria: string; url: string }[]
}

/** Anexos 1-2: adjuntos no-foto que la plantilla insertará (E-214..223). */
export interface AnexosInforme {
  documentos: { id: string; nombre: string; tipo: string; url: string }[]
}

/** Mapa de referencias (E-120 · P1-4). */
export interface MapaInforme {
  /** Google Static Maps — sin implementación ni API key (P1-4). */
  staticMapUrl: string | null
  lat: number | null
  long: number | null
}

/**
 * El contrato completo. Cada grupo está trazado a E-ids por
 * `lib/informe/matriz-tags.ts`; la cobertura se mide con
 * `lib/informe/medidor.ts`.
 */
export interface InformeContexto {
  meta: MetaInforme
  clienteInforme: ClienteInforme
  partes: PartesInforme
  propiedad: PropiedadInforme
  /** Bloque 4 reutilizado tal cual del modelo canónico. */
  sii: DatosSii
  cuadro: CuadroInforme
  terminales: TerminalesInforme
  comparablesInforme: ComparablesInforme
  rentabilidad: RentabilidadInforme
  textosIA: TextosIaInforme
  cualitativa: CualitativaInforme
  recintos: RecintosInforme
  fotos: FotosInforme
  anexos: AnexosInforme
  mapa: MapaInforme
  /** Bloque 8 · antecedentes legales reutilizados del modelo canónico. */
  legales: AntecedentesLegales
  /** Huecos declarados, cada uno con su P-id. Nunca se omiten en silencio. */
  huecos: Hueco[]
  /**
   * El modelo canónico completo embebido (superset por composición): los
   * consumidores que ya hablan el contrato de 8 bloques (`/informe`, preview)
   * no necesitan re-mapear.
   */
  canonico: InformeCanonico
}
