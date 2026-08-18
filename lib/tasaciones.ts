/**
 * Tipos de dominio y catálogos de IF-03 · Interfaz Tasador (CU-003).
 *
 * Tanda P1-TAS del plan `docs/_md/plan_ejecucion_UItasador_v1.0.md` §2.
 *
 * ⚠ **Ubicación — override OV-4.** El plan §2.1 sitúa estos tipos en
 * `lib/tasador/types.ts`. Decisión de Sergio (17-ago-2026): viven en
 * `@/lib/tasaciones`, que es la ruta que el código v0 ya importa en 26 líneas
 * de 18 archivos. Una sola ruta canónica; no existe re-export paralelo.
 *
 * Las formas de este archivo se derivaron **leyendo los consumidores reales**
 * bajo `app/tasaciones/**` y `components/tasador/**`, no del plan ni de la
 * spec. Los FIELD_IDs de Airtable viven en `lib/tasador/field-ids.ts`.
 *
 * Este módulo es **sólo tipos y catálogos**. Las ocho funciones que el v0
 * importa desde aquí (`getTasacion`, `marcarVisitada`, `marcarPdfListo`,
 * `guardarObservacionRechazo`, `resolverInforme`, `resolverLimite`, y el mock
 * `TASACIONES`) son territorio de **P2-TAS**: nacen contra Route Handlers, no
 * como mocks en memoria.
 */

import type { ContactoVisita } from './console-data'

/* -------------------------------------------------------------------------
 * Estado y semáforo
 * ---------------------------------------------------------------------- */

/**
 * Dominio de `TX_Solicitudes.estado` (`fld2H2r0GMeVfNO26`, singleSelect).
 *
 * `devuelta` **no se incluye a propósito**: está deprecado (§0.4 nota 6 del
 * plan · RF-17). Una devolución del visador reingresa la solicitud como
 * `asignada`, y ninguna pantalla de IF-03 renderiza `devuelta`.
 */
export type EstadoBackend =
  | 'creada'
  | 'asignada'
  | 'visitada'
  | 'calculada'
  | 'pdf_listo'
  | 'aprobada'
  | 'pendiente_final'
  | 'entregada'
  | 'cerrada'
  | 'cancelada'
  | 'requiere_atencion'

/**
 * Semáforo que muestra la card de la cola.
 *
 * ⚠ El valor lo produce el motor de SLA por etapa (`lib/sla-etapas.ts`), que
 * IF-03 consume server-side. **IF-03 no calcula SLA** (CI-021): este tipo es
 * el resultado que le llega, no una fórmula propia.
 *
 * ⚠ `por_coordinar` queda **en retirada**: con CI-012 cerrado en sentido
 * negativo la coordinación ocurre por teléfono, fuera del sistema. Se conserva
 * mientras `tasacion-card.tsx` lo indexe en su `Record<SlaStatus, …>`; P3-TAS
 * lo elimina junto con el chip homónimo.
 */
export type SlaStatus = 'en_plazo' | 'por_vencer' | 'vencido' | 'por_coordinar'

/** Paleta del badge de estado (`components/tasador/estado-badge.tsx`). */
export type EstadoColor = 'verde' | 'ambar' | 'rojo' | 'azul' | 'naranja'

/**
 * Procedencia de un dato pre-llenado, para el badge "Pre-llenado · {fuente} ·
 * editable" de `campo-prellenado.tsx`.
 *
 * ⚠ **Regla T-C.** Ningún valor nombra el medio técnico. El literal visible es
 * la procedencia del dato, nunca cómo se obtuvo.
 *
 * ⚠ Asunción a confirmar en P7-TAS: la spec no fija este dominio. Se derivó de
 * los tres orígenes que la UI distingue hoy.
 */
export type FuenteDato = 'solicitud' | 'documentos' | 'visita'

/** Valor de un campo que llega pre-llenado desde la solicitud. */
export interface DatoPrellenado {
  valor: string
  fuente?: FuenteDato
}

/* -------------------------------------------------------------------------
 * Tasación (solicitud vista desde la cola del tasador · §2.1)
 * ---------------------------------------------------------------------- */

/**
 * Contacto de la propiedad (`TX_ContactosVisita` · `tblW3SSbKo6vRjwBJ`).
 *
 * **Se importa de IF-02, no se redefine** (R7): es la misma tabla y el mismo
 * concepto, y `lib/console-data.ts:56` ya lo tipa. Duplicarlo habría dejado dos
 * formas para una sola fila de Airtable. Se ordena por `ordenPrioridad` — ése
 * es el nombre del campo, no `prioridad`.
 */
export type { ContactoVisita } from './console-data'

/** Unidad SII de la solicitud (`TX_Unidades`). */
export interface UnidadSii {
  numero: string
  rolSii: string
  superficieM2: number
}

/** Adjunto de la solicitud alojado en Dropbox, entregado por la Ejecutiva. */
export interface AdjuntoDropbox {
  nombre: string
  sizeBytes: number
  url: string
}

/** Datos que la Ejecutiva dejó cargados en la solicitud. */
export interface DatosEjecutiva {
  contactoTelefono: string
  rolSii: string
}

/**
 * Una solicitud tal como la ve el tasador.
 *
 * Origen: `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`) más sus tablas hijas. El
 * mapeo campo a campo lo hace P2-TAS usando `lib/tasador/field-ids.ts`.
 */
export interface Tasacion {
  /** recordId de `TX_Solicitudes`. */
  id: string
  /** `codigo_solicitud` · patrón `VP-AAAA-NNNN`. Read-only (formula). */
  codigo: string
  estado: EstadoBackend
  comuna: string
  /** Clase de inmueble (`tipo_propiedad` → `M_TiposPropiedad`). Ej.: "Casa". */
  tipo: string
  /** Condición de la propiedad (`tipo_propiedad_nuevo_usado`). Ver P-5. */
  tipoPropiedad: 'nuevo' | 'usado'
  direccion: string
  cliente: string
  producto: string
  /** Fecha planificada de visita, formateada para lectura (Regla T-B). */
  visita: string
  version: number
  datos: {
    comuna: DatoPrellenado
    tipo: DatoPrellenado
    direccion: DatoPrellenado
    cliente: DatoPrellenado
  }
  datosEjecutiva: DatosEjecutiva

  /** Semáforo y reloj que produce el motor de SLA por etapa. Nunca se recalcula acá. */
  slaStatus?: SlaStatus
  horasRestantes?: number

  /** `fecha_asignacion_ts` en ISO. Alimenta los filtros de la cola. */
  fechaAsignacion?: string
  fechaSolicitud?: string
  proyecto?: string
  observaciones?: string
  valorEstimadoUf?: number
  pdfUrl?: string
  contactos?: ContactoVisita[]
  unidades?: UnidadSii[]
  vendedor?: { nombre: string; rut: string }
  adjuntosDropbox?: AdjuntoDropbox[]

  /**
   * ⚠ **Campos en retirada — CI-012 cerrado (17-ago-2026).** La coordinación
   * de visitas se hace por teléfono, fuera del sistema: `TX_CoordinacionVisita`
   * no existe y no se creará (schema §26.5).
   *
   * Se conservan porque `app/tasaciones/page.tsx` y `tasacion-card.tsx` los
   * leen hoy, y quitarlos ahora fabricaría errores de compilación en archivos
   * que **P3-TAS reescribe de todos modos** al colapsar la Regla T-A a un solo
   * botón. Ninguna entidad de coordinación se tipa: no hay `CoordinacionVisita`,
   * ni `MotivoNoContacto`, ni `MOTIVOS_DEVOLUCION`, ni `intentoNumero`.
   *
   * P3-TAS los elimina.
   */
  coordinacionVigente?: 'confirmada' | 'rechazada' | null
  /** @deprecated Ver `coordinacionVigente`. Se elimina en P3-TAS. */
  contactosEditadosPorEjecutiva?: boolean
}

/* -------------------------------------------------------------------------
 * Formulario de captura · secciones A–H (§2.8)
 * ---------------------------------------------------------------------- */

/** Ítem del cuadro de valoración (sección C · `TX_ItemsCuadroValoracion`). */
export interface ItemValoracion {
  id: string
  descripcion: string
  subtipo: string
  rolSii: string
  anioItem: string
  tipo: string
  situacionMunicipal: string
  estado: string
  /** RN-09: una terraza nunca aporta a garantía. La regla la aplica la UI al editar. */
  aportaGarantia: boolean
  origenSuperficie: string
  superficieM2: string
  materialItem: string
}

/** Comparable de mercado (sección D · `TX_Comparables`). RF-12 exige mínimo 3 válidos. */
export interface Comparable {
  id: string
  direccionReferencia: string
  comuna: string
  supTerreno: string
  supConstruida: string
  totalUf: string
  anio: string
  fuente: 'oferta' | 'cbr'
  factorSup: string
  factorEdad: string
  factorDistancia: string
  /** Sólo aplica cuando `fuente === 'oferta'`. */
  telefonoContacto: string
  /** Sólo aplican cuando `fuente === 'cbr'`. */
  foja: string
  numero: string
}

/** Ampliación declarada (sección E.1 · `TX_Ampliaciones`). */
export interface Ampliacion {
  id: string
  nPe: string
  fechaRecepcion: string
  m2: string
  destino: string
}

/** Niveles de la edificación (sección E.2 · `TX_HabitacionesPorNivel`). */
export type NivelId = 'subterraneo' | 'n1' | 'n2' | 'n3'

/**
 * Conteo de recintos por nivel.
 *
 * Se declara como interface con claves explícitas —y no como `Record<string,
 * number>`— para que `keyof NivelHabitaciones` sea una unión de strings. Con un
 * índice genérico incluiría `symbol`, que no es una `React.Key` válida: ese era
 * el TS2322 de `seccion-edificacion.tsx:219` y `:293`.
 */
export interface NivelHabitaciones {
  living: number
  estar: number
  cocina: number
  comedor: number
  dormitoriosSimples: number
  suites: number
  banos: number
  walkIn: number
  escritorio: number
  loggia: number
}

/** Terminaciones de un recinto (sección E.3 · `TX_TerminacionesPorRecinto`). */
export interface Recinto {
  id: string
  nombre: string
  pavimento: string
  material: string
  revestimientoMuros: string
  terminacionCielo: string
  iluminacion: string
  estado: string
}

/**
 * Comodidades de la propiedad (sección E.5).
 *
 * ⚠ **Sin tabla destino.** `TX_Amenities` no existe en la base (schema §26.4) y
 * no se creó: CLAUDE.md exige aprobación explícita para tablas nuevas.
 * **P7-TAS debe resolver dónde persiste** antes de dar la sección E por cerrada.
 */
export interface Comodidades {
  gimnasio: boolean
  piscina: boolean
  sauna: boolean
  quincho: boolean
  calefaccion: boolean
  aireAcondicionado: boolean
  alarma: boolean
  aspiracionCentral: boolean
  climatizacion: boolean
  purificador: boolean
  corrientesDebiles: boolean
  jardinConformado: boolean
  bodegaExtra: boolean
  estacionamientoVisitas: boolean
}

/** Categoría personalizada de fotos creada por el tasador en terreno (§2.6). */
export interface FotoCategoriaCustom {
  id: string
  nombre: string
  minimo: number
  /** Identificadores locales de las fotos, previos a la subida. */
  fotos: number[]
}

/**
 * Payload completo del formulario de captura (§2.8 · secciones A a H).
 *
 * Los campos numéricos viajan como `string` porque son el `value` de un input
 * controlado; la conversión y validación de forma ocurren server-side (Zod) en
 * P2-TAS, no acá.
 */
export interface InformeData {
  /* --- A · Visita (Regla T-B: dos fechas que nunca se colapsan) --- */
  /** Llega pre-llenada desde `fecha_visita_programada`. */
  fechaPlanificadaVisita: string
  /** La registra el tasador en terreno. Obligatoria — persiste en `fecha_visita`. */
  fechaVisitaReal: string
  observacionesTasador: string

  /* --- B · Datos de la propiedad --- */
  supTerreno: string
  supConstruida: string
  supPrimerPiso: string
  anioConstruccion: string
  estadoConservacion: string
  agrupacionPropiedad: string
  materialPredominante: string
  calidadConstruccion: number
  piso: string
  pisosPropiedad: string
  subterraneos: string
  edificioNombre: string
  condominioNombre: string
  orientacion: string[]
  numAscensores: string
  dormitorios: string
  banos: string
  mediosBanos: string
  banoServicio: string
  estacionamientos: string
  rolesEstacionamientos: string
  bodegas: string
  rolesBodegas: string
  servidumbreM2: string
  dfl2: boolean
  velocidadVenta: string
  tipoZona: string

  /* --- C · Cuadro de valoración --- */
  items: ItemValoracion[]

  /* --- D · Comparables --- */
  comparables: Comparable[]

  /* --- E · Niveles · Terminaciones · Comodidades --- */
  ampliaciones: Ampliacion[]
  niveles: Record<NivelId, NivelHabitaciones>
  recintos: Recinto[]
  estructuraSoportante: string
  divisionesInteriores: string
  entrepisos: string
  cubierta: string
  revestimientoExterior: string
  cierrosExteriores: string
  comodidades: Comodidades
  ventanas: string[]
  sanitarios: string
  griferia: string
  mueblesCocina: string
  puertaPrincipal: string
  closetMural: boolean
  proteccionesRejas: boolean

  /* --- F · Documentos legales (`TX_DocumentosLegales`) --- */
  cbrFoja: string
  cbrNumero: string
  cbrAnio: string
  vendedor: string
  comprador: string
  notaria: string
  repertorio: string
  nPermisoEdificacion: string
  fechaPermisoEdif: string
  nRecepcionFinal: string
  fechaRecepcionFinal: string
  selloSec: string
  selloSecId: string
  selloSecVencimiento: string
  afectoExpropiacion: boolean
  nCertificadoNoExpropiacion: string
  coordenadasLat: string
  coordenadasLng: string

  /* --- G · Overrides (CU-007) --- */
  tasaCapRateOverride: string
  vidaUtilOverride: string
  valorSugeridoOverride: string
  /** Obligatorio si hay algún override: mínimo 20 caracteres. */
  motivoOverride: string

  /* --- H · Rentabilidad (opcional) --- */
  arriendoBrutoClp: string
  gastoAnualClp: string
  /** Denominador del cap rate. */
  valorReferenciaClp: string

  /* --- Fotos y documentos de la visita (§2.6) --- */
  fotosPredefinidas: Record<CategoriaFotoId, number[]>
  categoriasCustom: FotoCategoriaCustom[]
  /** Clave: `tipo_documento`. Valor: identificadores locales de los archivos. */
  documentosCargados?: Record<string, number[]>
}

/* -------------------------------------------------------------------------
 * Catálogos
 * ---------------------------------------------------------------------- */

/** Opción de un `SelectField` (`components/tasador/form-sections/fields.tsx`). */
export interface Opcion {
  v: string
  l: string
}

/** Las ocho categorías predefinidas del organizador de fotos (RF-TAS-14 · §2.6). */
export type CategoriaFotoId =
  | 'ofertas_comparables'
  | 'habitaciones'
  | 'banos'
  | 'estacionamientos'
  | 'mapa_ubicacion'
  | 'fachada_exterior'
  | 'cocina'
  | 'living_comedor'

/** Contador declarado en la sección B del que cuelga un mínimo dinámico. */
export type OrigenMinimoFoto = 'dorm' | 'banos' | 'estac'

/**
 * Límite de fotos de una categoría: un número fijo, el nombre de un contador
 * declarado, o `null` cuando no hay límite.
 *
 * `resolverLimite()` (P2-TAS) lo traduce a `number | null`. Ese es el **único
 * punto de cambio** si A-16 se resuelve a favor de mínimos fijos.
 */
export type LimiteFoto = number | OrigenMinimoFoto | null

export interface CategoriaFoto {
  id: CategoriaFotoId
  label: string
  min: LimiteFoto
  max: LimiteFoto
}

/**
 * Catálogo de categorías de fotos (spec §2.6 · RF-TAS-14).
 *
 * ⚠ **A-16 abierta.** La spec declara que los mínimos de Habitaciones, Baños y
 * Estacionamientos van ligados a lo declarado en la sección B; el diseño v4
 * muestra 2 · 2 · 1, que son los de la propiedad de ejemplo. Se implementa el
 * **mínimo dinámico** por ser la regla escrita, como asunción reversible.
 *
 * `max` es `null` en las ocho: la spec no declara ningún máximo, y no se
 * inventa uno.
 */
export const CATEGORIAS_FOTO: readonly CategoriaFoto[] = Object.freeze([
  { id: 'ofertas_comparables', label: 'Ofertas / Comparables', min: 3, max: null },
  { id: 'habitaciones', label: 'Habitaciones', min: 'dorm', max: null },
  { id: 'banos', label: 'Baños', min: 'banos', max: null },
  { id: 'estacionamientos', label: 'Estacionamientos', min: 'estac', max: null },
  { id: 'mapa_ubicacion', label: 'Mapa de Ubicación', min: 1, max: null },
  { id: 'fachada_exterior', label: 'Fachada / Exterior', min: 1, max: null },
  { id: 'cocina', label: 'Cocina', min: 1, max: null },
  { id: 'living_comedor', label: 'Living / Comedor', min: 1, max: null },
] as const)

/** Recintos que la sección E.3 ofrece como atajo para crear terminaciones. */
export const RECINTOS_SUGERIDOS: readonly string[] = Object.freeze([
  'Living',
  'Comedor',
  'Cocina',
  'Dormitorio principal',
  'Dormitorio 2',
  'Baño principal',
  'Baño 2',
  'Logia',
  'Terraza',
  'Hall',
])

/**
 * Dominios de los selects del formulario.
 *
 * `estadoConservacion` reproduce el dominio real de
 * `TX_Solicitudes.estado_conservacion` (`flde0ExWfB1dhkp4t`, singleSelect),
 * verificado en `docs/schema-airtable.md` §21.2.
 *
 * ⚠ Los demás dominios provienen del diseño v0: `docs/schema-airtable.md` no
 * documenta los campos de `TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`) ni
 * de `TX_Comparables` (`tbllbTuhb0waWIbRo`) a nivel de campo. **P2-TAS debe
 * contrastarlos contra la base antes de escribir**; en particular
 * `origenSuperficie`, cuyo homónimo en `TX_Unidades` usa otras etiquetas
 * (`plano`, `certificado_avaluo`, `medicion_tasador`…).
 */
export const OPCIONES = Object.freeze({
  estadoConservacion: Object.freeze([
    { v: 'nuevo', l: 'Nuevo' },
    { v: 'sin_uso', l: 'Sin uso' },
    { v: 'bueno', l: 'Bueno' },
    { v: 'normal', l: 'Normal' },
    { v: 'malo', l: 'Malo' },
    { v: 'deficiente', l: 'Deficiente' },
  ]) as readonly Opcion[],

  agrupacion: Object.freeze([
    { v: 'aislada', l: 'Aislada' },
    { v: 'pareada', l: 'Pareada' },
    { v: 'continua', l: 'Continua' },
  ]) as readonly Opcion[],

  material: Object.freeze([
    { v: 'albanileria', l: 'Albañilería' },
    { v: 'hormigon', l: 'Hormigón armado' },
    { v: 'madera', l: 'Madera' },
    { v: 'metalcon', l: 'Metalcon' },
    { v: 'mixto', l: 'Mixto' },
  ]) as readonly Opcion[],

  velocidadVenta: Object.freeze([
    { v: 'rapida', l: 'Rápida' },
    { v: 'normal', l: 'Normal' },
    { v: 'lenta', l: 'Lenta' },
  ]) as readonly Opcion[],

  tipoZona: Object.freeze([
    { v: 'residencial', l: 'Residencial' },
    { v: 'comercial', l: 'Comercial' },
    { v: 'industrial', l: 'Industrial' },
    { v: 'mixta', l: 'Mixta' },
    { v: 'agricola', l: 'Agrícola' },
  ]) as readonly Opcion[],

  subtipoItem: Object.freeze([
    { v: 'edificacion', l: 'Edificación' },
    { v: 'terreno', l: 'Terreno' },
    { v: 'terraza', l: 'Terraza' },
    { v: 'estacionamiento', l: 'Estacionamiento' },
    { v: 'bodega', l: 'Bodega' },
    { v: 'obra_complementaria', l: 'Obra complementaria' },
  ]) as readonly Opcion[],

  tipoItem: Object.freeze([
    { v: 'ha-muni', l: 'Habitable municipal' },
    { v: 'ha-no-muni', l: 'Habitable no municipal' },
    { v: 'no-ha-muni', l: 'No habitable municipal' },
    { v: 'no-ha-no-muni', l: 'No habitable no municipal' },
  ]) as readonly Opcion[],

  situacionMunicipal: Object.freeze([
    { v: 'regularizado', l: 'Regularizado' },
    { v: 'regularizable', l: 'Regularizable' },
    { v: 'no-regularizable', l: 'No regularizable' },
  ]) as readonly Opcion[],

  origenSuperficie: Object.freeze([
    { v: 'plano-municipal', l: 'Plano municipal' },
    { v: 'certificado-avaluo', l: 'Certificado de avalúo' },
    { v: 'medicion-tasador', l: 'Medición del tasador' },
    { v: 'base-interna-sii', l: 'Base interna SII' },
  ]) as readonly Opcion[],

  selloSec: Object.freeze([
    { v: 'vigente', l: 'Vigente' },
    { v: 'vencido', l: 'Vencido' },
    { v: 'no_aplica', l: 'No aplica' },
  ]) as readonly Opcion[],

  orientaciones: Object.freeze(['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']) as readonly string[],

  ventanas: Object.freeze([
    'Termopanel',
    'Vidrio simple',
    'Marco de aluminio',
    'Marco de PVC',
    'Marco de madera',
  ]) as readonly string[],
})
