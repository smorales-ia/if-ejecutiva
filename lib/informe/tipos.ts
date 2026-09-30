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
  /* Columna US$ del cuadro de valores (XLSM `= $ ÷ BO71`): cada CLP terminal
     dividido por `usdDia`. `null` si falta el CLP o el dólar del día. */
  valorReposicionUsd: number | null
  seguroIncendioUsd: number | null
  avaluoFiscalUsd: number | null
  valorRemateUsd: number | null
  valorLiquidacionUsd: number | null
}

/** Una fila de la muestra de referencias (bloque 6 · TX_Comparables). */
export interface FilaComparableInforme {
  id: string
  /** `numero` de la foto del cuadro; si falta, correlativo dentro del bloque. */
  numero: number | null
  direccion: string
  comuna: string
  supTerreno: number | null
  supConstruida: number | null
  precioUf: number | null
  anio: number | null
  tipoReferencia: string
  /** `fecha_publicacion` de la oferta («abr-26» en el gold master). */
  fecha: string
  /** `telefono_contacto` — la ficha de referencia de Hoja 2 lo imprime. */
  telefono: string
  /** Columna «Foja y Número» de las referencias CBR: `foja`-`numero` («40132-55521»). */
  fojaNumero: string
  /** Columna «Comentarios» de REF.OFERTAS (vacía en el gold master). */
  comentarios: string
  /** `uf_m2_terreno_f` — INPUT del tasador, columna independiente del UF/m²C. */
  ufM2Terreno: number | null
  /** `oo_cc_uf` — obras complementarias descontadas en la homologación. */
  oocc: number | null
  /** UF/m² de construcción — fórmula directa A-44 del modelo canónico. */
  ufM2Construccion: number | null
}

/**
 * Promedio por columna de un bloque de la muestra — el renglón «PROMEDIO DE
 * LA MUESTRA» del cuadro (XLSM `Portada!AD34..AX34` / `AD42..AX42`): promedio
 * de los valores `> 0` de cada columna, por bloque (ofertas y CBR por
 * separado), nunca combinado. También tipa la fila TASACIÓN (`AD35..AX35`).
 */
export interface ColumnasComparables {
  totalUf: number | null
  supTerreno: number | null
  supConstruida: number | null
  oocc: number | null
  ufM2Terreno: number | null
  ufM2Construccion: number | null
}

/** Un bloque de la muestra (REF. OFERTAS o REF. C.B.R.) con sus agregados. */
export interface BloqueComparablesInforme {
  filas: FilaComparableInforme[]
  promedio: ColumnasComparables
  /** `(tasacionFila.ufM2Construccion / promedio.ufM2Construccion − 1) × 100`. */
  tasacionVsPct: number | null
}

/**
 * Comparables + los agregados de la muestra (E-61..75).
 *
 * Desde T-PDF-IDENTICO-20260927 el cuadro se agrega **por bloque** (`ofertas`
 * / `cbr`), replicando la aritmética del XLSM: el promedio combinado que
 * imprimía 30,91/161% era el bug CI-057 de esta capa. `tasacionFila` sale del
 * cuadro de valoración (UF/m²C homologado = edificación ÷ superficie, no el
 * valor comercial total ÷ superficie). Los campos planos (`promedioUfM2` ·
 * `tasacionUfM2` · `tasacionVsPct`) quedan como espejo del bloque de ofertas
 * y de la fila TASACIÓN para los consumidores previos; los nuevos deben usar
 * los bloques. Nada persiste aún (P1-8 — puente hasta T2).
 */
export interface ComparablesInforme {
  filas: FilaComparableInforme[]
  /** Bloque REF. OFERTAS (tipo_referencia «Oferta»). */
  ofertas: BloqueComparablesInforme
  /** Bloque REF. C.B.R. (tipo_referencia «CBR»). */
  cbr: BloqueComparablesInforme
  /** Fila TASACIÓN del cuadro (XLSM `AD35..AX35`) — sale del cuadro de valoración. */
  tasacionFila: ColumnasComparables
  /** Espejo de `ofertas.promedio.ufM2Construccion` (compat pre-v2). */
  promedioUfM2: number | null
  usadosEnPromedio: number
  /** RF-12 exige mínimo 3. Se informa; no se bloquea acá. */
  cumpleMinimo: boolean
  /** Espejo de `tasacionFila.ufM2Construccion` (compat pre-v2). */
  tasacionUfM2: number | null
  /** Espejo de `ofertas.tasacionVsPct` (compat pre-v2). */
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
  /**
   * Matriz de la Hoja 3. `tipoRecinto`/`nivel` viajan en el vocabulario que
   * la plantilla filtra (`Sala`, `Bano`, `MedioBano`, `BanoServicio`,
   * `Lavadero`, `Piso1`…) — el ensamblador normaliza los rótulos de captura.
   */
  habitacionesPorNivel: {
    id: string
    nivel: string
    tipoRecinto: string
    cantidad: number | null
  }[]
  /** Σ cantidades — celda «Cantidad Total de Recintos» de la matriz. */
  totalRecintos: number | null
  terminacionesPorRecinto: {
    id: string
    nombre: string
    categoria: string
    descripcion: string
    calidad: string
    /** Columnas extra de la tabla impresa — sin columna Airtable hoy. */
    revMuros?: string
    cielo?: string
    iluminacion?: string
  }[]
}

/** Registro fotográfico (bloque 7 · E-58/99 · E-210/211). */
export interface FotosInforme {
  total: number
  porCategoria: Record<string, number>
  fotos: {
    id: string
    nombre: string
    categoria: string
    url: string
    /**
     * Fuente renderizable que viaja con la fila (`TX_Adjuntos.thumbnail_url`):
     * data-URI JPEG o URL http(s). Contrato de origen único T-VP0067-IMAGENES
     * §4 — mientras el server no lea Dropbox, la imagen de la grilla sale de
     * acá. Opcional: el fallback del espejo no lo produce.
     */
    thumbnailUrl?: string | null
    /** Posición global en la grilla 16 (`TX_Adjuntos.orden`); null = al final. */
    orden?: number | null
  }[]
}

/** Anexos 1-2: adjuntos no-foto que la plantilla insertará (E-214..223). */
export interface AnexosInforme {
  documentos: { id: string; nombre: string; tipo: string; url: string }[]
}

/**
 * Ranuras de imagen del informe (contrato §3.3 del plan T-PDF-IDENTICO):
 * cada valor es una **URL pública o un data-URI base64** que Carbone v4
 * inserta sobre el placeholder correspondiente de la plantilla, o `null`
 * (ranura vacía). Los produce `lib/informe/imagenes.ts`: primero desde un
 * adjunto Airtable con URL http(s) utilizable; si no, desde los assets del
 * repo del caso espejo (fallback de tanda — columna nueva pendiente para el
 * flujo vivo).
 */
export interface ImagenesInforme {
  /** Hoja 1 · recuadro «Ubicación» (arriba-derecha). */
  mapaUbicacion: string | null
  /** Hoja 1 · FOTO FACHADA. */
  fachada: string | null
  /** Hoja 1 · firma manuscrita del tasador (también en `partes.tasador.firmaUrl`). */
  firma: string | null
  /** Hoja 2 · mapa de ubicación de referencias (banda superior). */
  refMapa: string | null
  /** Hoja 2 · fotos de las referencias 1-3 (= ofertas 1-3). */
  ref1: string | null
  ref2: string | null
  ref3: string | null
  /* Anexo N°1 — 7 ranuras. */
  anexo1Plano: string | null
  anexo1Esquema: string | null
  anexo1CuadroSup: string | null
  anexo1Emplazamiento: string | null
  anexo1Aerea: string | null
  anexo1MapaSii: string | null
  anexo1InfoSii: string | null
  /* Anexo N°2 — 6 escaneados (incluye la escritura «Fojas 3312»). */
  anexo2RolAvaluo: string | null
  anexo2Permiso: string | null
  anexo2Escritura: string | null
  anexo2NoExpropiacion: string | null
  anexo2Recepcion: string | null
  anexo2Tgr: string | null
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
  /** Ranuras de imagen del informe (T-PDF-IDENTICO · plantilla v2). */
  imagenes: ImagenesInforme
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
