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
 * ⚠ **Enmienda a OV-4 (P2-TAS.B · 18-ago-2026).** OV-4 fijó esta ruta para los
 * **tipos y catálogos**, y ese sigue siendo su alcance. Pero el archivo lo
 * importan componentes cliente, así que **nada que lea Airtable puede vivir
 * acá**: arrastraría `AIRTABLE_TOKEN` y el cliente REST al bundle del
 * navegador. Las lecturas contra la base —`leerTasacion`, `leerCola`, y el
 * mapper que comparten con los Route Handlers— viven en
 * `lib/tasador/lectura-tasacion.ts`, que es server-only.
 *
 * De las funciones que el v0 importaba desde aquí, P2-TAS.B dejó las que un
 * componente cliente puede ejecutar sin riesgo: `resolverLimite` y
 * `resolverInforme` (puras), `marcarVisitada` y `guardarObservacionRechazo`
 * (`fetch` a las rutas de IF-03) y `marcarPdfListo` (**stub declarado**: no
 * existe ruta backend para esa transición). `getTasacion` se renombró a
 * `leerTasacion` al mudarse; el mock `TASACIONES` se sustituyó por `leerCola`.
 */

import type { ContactoVisita, SlaEtapaSolicitud } from './console-data'

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
 * Semáforo que muestra la card de la cola — **es el de IF-02, no uno propio**.
 *
 * P3-TAS.A retiró el `SlaStatus` de cuatro valores que traía el v0
 * (`en_plazo · por_vencer · vencido · por_coordinar`) y lo sustituyó por este
 * reexport. Tres razones, en orden de peso:
 *
 * 1. **Nadie lo producía.** `proyectarTasacion()` nunca seteaba `slaStatus` ni
 *    `horasRestantes`, así que la card caía a `?? 'en_plazo'` y `?? 0` y
 *    pintaba **"En plazo · 0h"** en todas las filas, con la cartera entera en
 *    `sla_semaforo_etapa = "rojo"`. Un verde que la base no respalda es
 *    exactamente lo que §9.6 prohíbe.
 * 2. **CI-021 manda el reloj por etapa**, y el motor ya lo materializa en
 *    `sla_etapa_actual`, `sla_semaforo_etapa`, `sla_etapa_alerta_ts` y
 *    `sla_etapa_vence_ts`. Esta forma es la que consume `SLABadge`, que R7
 *    obliga a importar de `components/console/status-badges.tsx`.
 * 3. **`por_coordinar` quedó sin objeto** con RO-29: la coordinación no se
 *    soporta por sistema. El chip homónimo sobrevive con otra definición —
 *    etapa 2 abierta, ver `lib/tasador/cola-filtros.ts`— pero no como color.
 *
 * Mismo criterio que `ContactoVisita`: es la misma fila de Airtable y el mismo
 * concepto que ya tipa IF-02. Duplicarlo habría dejado dos formas para un dato.
 */
export type { SlaEtapaSolicitud } from './console-data'

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

/**
 * Literal de `Tasacion.visita` cuando la solicitud no tiene
 * `fecha_visita_programada`.
 *
 * Es una constante y no una cadena suelta porque la card **omite la línea** de
 * visita en ese caso (§4.1 · punto 8: *«sólo cuando ya está coordinada»*), y
 * comparar contra un literal repetido a mano es la forma de que un día la línea
 * muestre "Visita: Por agendar" en producción. Mismo literal que IF-02
 * (`lib/solicitudes.ts:734`).
 */
export const SIN_FECHA_VISITA = 'Por agendar'

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
  /**
   * Teléfono del contacto de **prioridad 1** de `TX_ContactosVisita`
   * (§4.1 · punto 7), resuelto por `lib/tasador/contactos-cola.ts`.
   *
   * `null` cuando la solicitud no tiene ningún contacto con teléfono usable: la
   * card **omite la línea** en vez de renderizar un `tel:` vacío, que es lo que
   * hacía antes de P3-TAS.A. No hay respaldo a `vendedor_telefono` (CI-035):
   * mezclar dos orígenes en silencio esconde el hueco de datos en vez de
   * mostrarlo.
   */
  contactoTelefono: string | null
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

  /**
   * Semáforo y reloj que produce el motor de SLA por etapa (`lib/sla-etapas.ts`
   * + la fórmula `sla_semaforo_etapa`). **Nunca se recalcula acá** — CI-021.
   *
   * Ausente cuando el motor no resolvió etapa para la solicitud, que es un
   * resultado legítimo y no un error: en v1.9 sólo e1 y e2 tienen escritor. La
   * card lo traduce a "sin píldora", igual que la bandeja de IF-02.
   */
  slaEtapa?: SlaEtapaSolicitud

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
   * Desenlace del último intento de coordinación, o `null` si no hubo ninguno
   * (`TX_Solicitudes.coordinacion_vigente` · `fldI4Dv0jpRQvbdHl`).
   *
   * **Repuesto en P4-TAS** tras el cierre positivo de CI-012. Es el
   * discriminante del que `AccionCard` deriva sus tres variantes, y la
   * condición de activación de la excepción acotada a RN-59 (spec §1.4).
   *
   * ⚠ En Airtable **no es fórmula**: lo escribe el Route Handler de
   * coordinación en la misma operación que inserta la fila. No se recalcula
   * acá ni se deriva de `intentos` — ver `docs/schema-airtable.md` §26.6.
   */
  coordinacionVigente?: EstadoCoordinacion | null
}

/* -------------------------------------------------------------------------
 * Coordinación de visita · Pantalla 2 (§2.3)
 *
 * Repuesta en **P4-TAS** (19-ago-2026). `RO-29` había cerrado CI-012 en
 * negativo y P3-TAS.A retiró `coordinacionVigente` junto con las tres variantes
 * de la Regla T-A. La revisión de Héctor del diseño v4 —Pantalla 2, puntos 1 a
 * 4— revirtió esa decisión: **RO-29 quedó anulada** y `TX_CoordinacionVisita`
 * existe desde el 19-ago-2026 (`tblBwMErRxo57ML2r`).
 * ---------------------------------------------------------------------- */

/** Desenlace de un intento de coordinación (`estado_coordinacion`). */
export type EstadoCoordinacion = 'confirmada' | 'rechazada'

/**
 * Motivo por el que el tasador no pudo coordinar la visita.
 *
 * ⚠ **Es `string`, y no una unión de los cuatro literales del diseño, a
 * propósito.** El dominio lo posee Airtable —el `singleSelect`
 * `TX_CoordinacionVisita.motivo` (`fld0rkrlg9Xo0fFVm`)—, no este archivo. Ese
 * es el criterio de aceptación de **A-17**: agregar un motivo desde Airtable
 * tiene que llegar a la UI **sin deploy**. Una unión cerrada acá volvería a
 * atar el catálogo al build, que es exactamente lo que A-17 prohíbe.
 *
 * El alias existe igual porque nombra el rol del dato: un `string` suelto en
 * una firma no dice qué se espera. Para obtener los valores válidos en runtime,
 * usar {@link cargarMotivosDevolucion}.
 *
 * ⚠ Ver también **A-21**: dos de los cuatro motivos duplican valores de
 * `TX_ContactosVisita.estado_contacto`. Si esa ambigüedad cierra unificando los
 * catálogos, este alias es el punto donde se nota.
 */
export type MotivoNoContacto = string

/**
 * Un intento de coordinación — una fila de `TX_CoordinacionVisita`
 * (`tblBwMErRxo57ML2r`).
 *
 * Los campos opcionales lo son **por rama, no por descuido**: `fechaVisita` y
 * `nota` sólo existen cuando el desenlace es `confirmada`; `motivo` y `detalle`
 * sólo cuando es `rechazada`. El tipo no puede expresarlo sin partirse en dos,
 * y partirlo obligaría a discriminar en cada lectura para mostrar una lista.
 */
export interface CoordinacionVisita {
  /** recordId de la fila en `TX_CoordinacionVisita`. */
  id: string
  /** recordId de la solicitud (`solicitud_record_id`, leído de `[0]`). */
  solicitudId: string
  estado: EstadoCoordinacion
  /**
   * Ordinal del intento (`intento_numero` · `fldNj1SdLE6pyWvfx`).
   *
   * ⚠ **Lo escribe el Route Handler, no Airtable.** §2.12 lo declaraba como
   * fórmula `1 + COUNT(intentos previos)`, que no es implementable: una
   * fórmula de Airtable no ve registros hermanos por Link. El servidor cuenta
   * los intentos previos en el insert. RF-TAS-04 espera `2` en el segundo.
   */
  intentoNumero: number
  /** Hora de servidor de la acción del tasador, en ISO. */
  fechaRespuesta: string
  /** Fecha planificada de visita. Sólo en la rama `confirmada`. */
  fechaVisita?: string
  /** Nota opcional del tasador. Sólo en la rama `confirmada`. */
  nota?: string
  /** Motivo del catálogo. Obligatorio en la rama `rechazada`. */
  motivo?: MotivoNoContacto
  /** Detalle libre, mínimo 20 caracteres. Obligatorio en la rama `rechazada`. */
  detalle?: string
}

/**
 * Llamada a la acción de la card de la cola (**RF-TAS-11** · Regla T-A).
 *
 * Vuelve a ser una unión de **tres** variantes: P3-TAS.A la había colapsado a
 * un botón único al caer la coordinación por sistema. El discriminante es
 * {@link Tasacion.coordinacionVigente}.
 *
 * Los rótulos son literales §6 y **no admiten variación**.
 */
export type AccionCard =
  | {
      /** Sin coordinación vigente: el tasador todavía no llamó. */
      tipo: 'coordinar'
      rotulo: 'Coordinar visita'
      href: string
      variante: 'acento'
    }
  | {
      /** Coordinación confirmada: se entra a la captura. */
      tipo: 'abrir'
      rotulo: 'Abrir tasación'
      href: string
      variante: 'primario'
    }
  | {
      /**
       * Coordinación devuelta: la pelota está en la ejecutiva y el tasador no
       * puede hacer nada hasta que corrija los contactos (RF-TAS-04). La card
       * sigue visible en "Todas" para que no la pierda de vista.
       */
      tipo: 'esperando_ejecutiva'
      rotulo: 'Ver coordinación'
      deshabilitado: true
      badge: 'Esperando contacto de ejecutiva'
    }

/**
 * Deriva la llamada a la acción de la card desde el estado de coordinación.
 *
 * **Único punto de la Regla T-A.** La card no decide: lee lo que devuelve esta
 * función. Si el gate cambia, cambia acá.
 */
export function resolverAccionCard(tasacion: Tasacion): AccionCard {
  if (tasacion.coordinacionVigente === 'rechazada') {
    return {
      tipo: 'esperando_ejecutiva',
      rotulo: 'Ver coordinación',
      deshabilitado: true,
      badge: 'Esperando contacto de ejecutiva',
    }
  }

  if (tasacion.coordinacionVigente === 'confirmada') {
    return {
      tipo: 'abrir',
      rotulo: 'Abrir tasación',
      href: `/tasaciones/${tasacion.id}`,
      variante: 'primario',
    }
  }

  // `null` o `undefined`: no hay intentos registrados todavía.
  return {
    tipo: 'coordinar',
    rotulo: 'Coordinar visita',
    href: `/tasaciones/${tasacion.id}/coordinar`,
    variante: 'acento',
  }
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
  /**
   * ⚠ **Homónimo peligroso — verificado en P2-TAS.** Este campo persiste en
   * `TX_Comparables.tipo_referencia` (`fldB920e8jIKgbERM`, singleSelect
   * `Oferta · CBR`), **no** en `TX_Comparables.fuente`.
   *
   * `fuente` existe en esa tabla (`fldNYh1KpD3oO0Gmz`) con un dominio distinto y
   * ajeno: `tasador · portal_toc · historico_sistema · cliente · Portal
   * Inmobiliario · Yapo · Toctoc · Ofert. · CBR.` — de dónde salió el dato, no
   * qué clase de referencia es. Escribir `'oferta'` en `fuente` no fallaría:
   * `typecast: true` crearía la opción y ensuciaría el dominio en silencio.
   *
   * El nombre del identificador se conserva porque el v0 lo usa en 6 sitios;
   * el mapeo al FIELD_ID correcto vive en la ruta `/comparables`. Caso de
   * §22 del schema: mismo literal, dos significados.
   */
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
 * ## Verificados contra la base real (P2-TAS · 17-ago-2026)
 *
 * P1-TAS los escribió desde el diseño v0 y dejó anotado que había que
 * contrastarlos. Se contrastaron contra el schema vivo por Meta API y **casi
 * todos estaban mal** — no era sólo `origenSuperficie`. El valor `v` de cada
 * opción es ahora **el literal exacto del `singleSelect` de Airtable**, porque
 * es lo que viaja en el body de la escritura.
 *
 * | Catálogo | Campo real | Tabla |
 * |---|---|---|
 * | `agrupacion` | `agrupacion_propiedad` (`fld8ZGFpcrCuvc8gQ`) | `TX_DatosTasacion` |
 * | `estadoConservacion` | `estado_conservacion` (`fldhX4EAdJzJ32slY`) | `TX_DatosTasacion` |
 * | `material` | `material_predominante` (`fldtJbujGC89f5lFZ`) | `TX_DatosTasacion` |
 * | `velocidadVenta` | `velocidad_venta_estimada` (`fld1eyMr1XT04YgyH`) | `TX_DatosTasacion` |
 * | `orientaciones` | `orientacion` (`fldiuCRWaoknLq9Kz`) | `TX_DatosTasacion` |
 * | `subtipoItem` | `subtipo` (`flddcT2wvPX38pHrE`) | `TX_ItemsCuadroValoracion` |
 * | `tipoItem` | `tipo_item` (`fld5HVdWpMY0jWqkx`) | `TX_ItemsCuadroValoracion` |
 * | `situacionMunicipal` | `situacion_municipal` (`flds7AFUnTJkeUIER`) | `TX_ItemsCuadroValoracion` |
 * | `estadoItem` | `flag_estado` (`fldMsoEuBe5IN5y1S`) | `TX_ItemsCuadroValoracion` |
 * | `materialItem` | `material` (`fldAJmNknr5HImlXr`) | `TX_ItemsCuadroValoracion` |
 * | `tipoReferencia` | `tipo_referencia` (`fldB920e8jIKgbERM`) | `TX_Comparables` |
 *
 * ⚠ **`estadoConservacion` no era el de `TX_Solicitudes`.** P1-TAS lo derivó de
 * `TX_Solicitudes.estado_conservacion` (`flde0ExWfB1dhkp4t`), que tiene otro
 * dominio. El campo que llena este formulario vive en `TX_DatosTasacion`.
 *
 * ## Dos catálogos del v0 que estaban mal planteados
 *
 * - **`tipoZona` — RETIRADO. No es un select: es un Link.** `TX_DatosTasacion`
 *   linkea a `M_Zonificacion` (`tipo_zona`: `Urbano · Rural · Mixto · Urbana`).
 *   Un catálogo hardcodeado acá sería incorrecto de raíz, no sólo incompleto:
 *   hay que **leer la tabla**. Existe además `tipo_zona_descripcion`
 *   (`fldbrYbbvJThBaGwC`, singleLineText) para el texto libre. **P7-TAS decide**
 *   cuál de los dos usa; si necesita el catálogo, va por una ruta que lo sirva.
 *   Retirarlo rompe `seccion-propiedad.tsx:225` **a propósito**: es preferible
 *   un error de compilación a un select que escribe en un Link.
 * - **`origenSuperficie`** — no existe en `TX_ItemsCuadroValoracion`; vive en
 *   `TX_Unidades` (`fldbDPpHhkuWjOTvQ`). Se conserva **con el dominio real de
 *   esa tabla**, porque el ítem tiene Link `unidad` y lo natural es que lo
 *   herede. P7-TAS confirma el cableado.
 *
 * ⚠ **Los dominios reales traen duplicados por mayúsculas y acentos**
 * (`Edificio`/`EDIFICIO`, `Hormigon armado`/`HORMIGON ARMADO`/`Hormigon Armado`,
 * `Albanileria`/`ALBAÑILERIA LADRILLO`/`ALBAÑILERÍA LADRILLO`). Es suciedad de
 * datos de la base, no variantes con significado. Se expone **una sola** de cada
 * grupo, en capitalización normal. Escribir cualquiera de las otras es válido
 * para Airtable y ensuciaría más — por eso el `v` no se deriva, se fija.
 */
export const OPCIONES = Object.freeze({
  estadoConservacion: Object.freeze([
    { v: 'Bueno', l: 'Bueno' },
    { v: 'Muy Bueno', l: 'Muy bueno' },
    { v: 'Regular', l: 'Regular' },
    { v: 'Malo', l: 'Malo' },
    { v: 'Muy malo', l: 'Muy malo' },
    { v: 'NUEVO - S/USO', l: 'Nuevo · sin uso' },
  ]) as readonly Opcion[],

  agrupacion: Object.freeze([
    { v: 'Aislada', l: 'Aislada' },
    { v: 'Pareada', l: 'Pareada' },
    { v: 'Continua', l: 'Continua' },
    { v: 'Edificio', l: 'Edificio' },
    { v: 'Condominio', l: 'Condominio' },
    { v: 'POBLACIÓN', l: 'Población' },
  ]) as readonly Opcion[],

  material: Object.freeze([
    { v: 'Hormigon armado', l: 'Hormigón armado' },
    { v: 'Albanileria', l: 'Albañilería' },
    { v: 'Acero', l: 'Acero' },
    { v: 'Madera', l: 'Madera' },
    { v: 'Mixto', l: 'Mixto' },
  ]) as readonly Opcion[],

  velocidadVenta: Object.freeze([
    { v: '1 a 2 meses', l: '1 a 2 meses' },
    { v: '2 a 4 meses', l: '2 a 4 meses' },
    { v: '4 a 6 meses', l: '4 a 6 meses' },
    { v: '6 a 8 meses', l: '6 a 8 meses' },
    { v: '8 a 10 meses', l: '8 a 10 meses' },
    { v: '10 a 12 meses', l: '10 a 12 meses' },
    { v: '12 a 18 meses', l: '12 a 18 meses' },
    { v: '18 a 24 meses', l: '18 a 24 meses' },
    { v: 'mas de 24 meses', l: 'Más de 24 meses' },
  ]) as readonly Opcion[],

  subtipoItem: Object.freeze([
    { v: 'Edificacion', l: 'Edificación' },
    { v: 'Terreno', l: 'Terreno' },
    { v: 'OOCC', l: 'Obras complementarias' },
    { v: 'Piscina', l: 'Piscina' },
    { v: 'Terraza', l: 'Terraza' },
    { v: 'Bodega', l: 'Bodega' },
    { v: 'Estac U/Goce', l: 'Estacionamiento uso y goce' },
    { v: 'Estac Descubierto', l: 'Estacionamiento descubierto' },
    { v: 'S/Reg No Regularizable', l: 'Sin regularizar · no regularizable' },
  ]) as readonly Opcion[],

  tipoItem: Object.freeze([
    { v: 'Edificacion', l: 'Edificación' },
    { v: 'Terreno', l: 'Terreno' },
    { v: 'OO.CC.', l: 'Obras complementarias' },
    { v: 'Piscina', l: 'Piscina' },
    { v: 'Estac. U/Goce', l: 'Estacionamiento uso y goce' },
    { v: 'Estac. Desc', l: 'Estacionamiento descubierto' },
    { v: 'Bodega', l: 'Bodega' },
    { v: 'Terraza', l: 'Terraza' },
    { v: 'Subterraneo', l: 'Subterráneo' },
    { v: 'Otro', l: 'Otro' },
  ]) as readonly Opcion[],

  situacionMunicipal: Object.freeze([
    { v: 'Regularizado', l: 'Regularizado' },
    { v: 'S/Reg Regularizable', l: 'Sin regularizar · regularizable' },
    { v: 'S/Reg No Regularizable', l: 'Sin regularizar · no regularizable' },
    { v: 'No Aplica', l: 'No aplica' },
  ]) as readonly Opcion[],

  /** `flag_estado` del ítem. **Distinto** del `estadoConservacion` del inmueble. */
  estadoItem: Object.freeze([
    { v: 'Bueno', l: 'Bueno' },
    { v: 'Regular', l: 'Regular' },
    { v: 'Malo', l: 'Malo' },
  ]) as readonly Opcion[],

  materialItem: Object.freeze([
    { v: 'Hormigon armado', l: 'Hormigón armado' },
    { v: 'Albanileria', l: 'Albañilería' },
    { v: 'Acero', l: 'Acero' },
    { v: 'Madera', l: 'Madera' },
    { v: 'Mixto', l: 'Mixto' },
  ]) as readonly Opcion[],

  /** `TX_Comparables.tipo_referencia`. Ver la nota de `Comparable.fuente`. */
  tipoReferencia: Object.freeze([
    { v: 'Oferta', l: 'Oferta' },
    { v: 'CBR', l: 'CBR' },
  ]) as readonly Opcion[],

  /**
   * Dominio real de `TX_Unidades.origen_superficie` (`fldbDPpHhkuWjOTvQ`).
   * El ítem no tiene campo propio: lo hereda de su unidad. Ver el docblock.
   */
  origenSuperficie: Object.freeze([
    { v: 'carta_ficha_inmobiliaria', l: 'Carta o ficha inmobiliaria' },
    { v: 'plano', l: 'Plano' },
    { v: 'base_interna_sii', l: 'Base interna SII' },
    { v: 'certificado_avaluo', l: 'Certificado de avalúo' },
    { v: 'medicion_tasador', l: 'Medición del tasador' },
  ]) as readonly Opcion[],

  orientaciones: Object.freeze(['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']) as readonly string[],

  /** ⚠ Sin verificar: su destino en la sección E no está cableado. P7-TAS. */
  ventanas: Object.freeze([
    'Termopanel',
    'Vidrio simple',
    'Marco de aluminio',
    'Marco de PVC',
    'Marco de madera',
  ]) as readonly string[],

  /** ⚠ Sin verificar: destino en `TX_DocumentosLegales`, no cableado. P7-TAS. */
  selloSec: Object.freeze([
    { v: 'vigente', l: 'Vigente' },
    { v: 'vencido', l: 'Vencido' },
    { v: 'no_aplica', l: 'No aplica' },
  ]) as readonly Opcion[],
})

/* -------------------------------------------------------------------------
 * Capa cliente · P2-TAS.B
 *
 * Lo que sigue es lo único de este archivo que **hace** algo en runtime; el
 * resto son tipos y catálogos. Todo lo de acá tiene que poder importarse desde
 * un componente cliente, así que **nada toca Airtable**: las lecturas contra la
 * base viven en `lib/tasador/lectura-tasacion.ts` (server-only por convención).
 * Ver la enmienda a OV-4 en el docblock de ese archivo.
 * ---------------------------------------------------------------------- */

/** Forma del sobre que devuelven todas las rutas de IF-03 (`lib/tasador/respuestas.ts`). */
interface SobreApi<T> {
  data?: T
  error?: string
}

/**
 * Literal genérico de fallo (§6.5 · Blueprint). Se usa cuando la respuesta no
 * trae `error` propio: el usuario nunca ve un error técnico.
 */
const ERROR_GENERICO =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * Llama una ruta de IF-03 y desenvuelve `{ data }`.
 *
 * Lanza `Error` con el literal humano que trajo la respuesta. Los llamadores
 * son componentes cliente que ya tienen que cerrar el ciclo de la Regla D
 * (spinner → resultado), así que reciben algo que pueden mostrar tal cual.
 */
async function llamarApi<T>(url: string, init?: RequestInit): Promise<T> {
  let respuesta: Response
  try {
    respuesta = await fetch(url, { credentials: 'same-origin', ...init })
  } catch (err) {
    // Caída de red: no hay cuerpo que leer.
    console.error('[tasaciones] fallo de red', url, err)
    throw new Error(ERROR_GENERICO)
  }

  let sobre: SobreApi<T> = {}
  try {
    sobre = (await respuesta.json()) as SobreApi<T>
  } catch {
    // Respuesta sin JSON (502 de un proxy, HTML de error). Se ignora el cuerpo.
  }

  if (!respuesta.ok) {
    console.error('[tasaciones]', url, respuesta.status, sobre.error)
    throw new Error(sobre.error || ERROR_GENERICO)
  }

  return sobre.data as T
}

/**
 * Traduce el límite de una categoría de fotos a un número concreto.
 *
 * Es el **único punto de traducción** de `LimiteFoto` (A-16): si el negocio
 * decide que los mínimos son fijos y no dinámicos, se cambia acá y ninguna
 * pantalla se entera. `null` significa «sin límite», no cero.
 */
export function resolverLimite(
  limite: LimiteFoto,
  declarados: { dorm: number; banos: number; estac: number },
): number | null {
  if (limite === null) return null
  if (typeof limite === 'number') return limite

  switch (limite) {
    case 'dorm':
      return declarados.dorm
    case 'banos':
      return declarados.banos
    case 'estac':
      return declarados.estac
  }
}

/** Conteo de recintos de un nivel, todo en cero. */
function nivelVacio(): NivelHabitaciones {
  return {
    living: 0,
    estar: 0,
    cocina: 0,
    comedor: 0,
    dormitoriosSimples: 0,
    suites: 0,
    banos: 0,
    walkIn: 0,
    escritorio: 0,
    loggia: 0,
  }
}

function comodidadesVacias(): Comodidades {
  return {
    gimnasio: false,
    piscina: false,
    sauna: false,
    quincho: false,
    calefaccion: false,
    aireAcondicionado: false,
    alarma: false,
    aspiracionCentral: false,
    climatizacion: false,
    purificador: false,
    corrientesDebiles: false,
    jardinConformado: false,
    bodegaExtra: false,
    estacionamientoVisitas: false,
  }
}

function fotosVacias(): Record<CategoriaFotoId, number[]> {
  return Object.fromEntries(
    CATEGORIAS_FOTO.map((c) => [c.id, [] as number[]]),
  ) as Record<CategoriaFotoId, number[]>
}

/**
 * Formulario de captura en blanco, con lo poco que se puede pre-llenar desde
 * la solicitud.
 *
 * Es el punto de partida cuando **no** hay borrador local ni datos guardados.
 * Lo único que hereda de la solicitud es la fecha planificada de visita: los
 * demás campos de `Tasacion` (comuna, dirección, cliente) describen la
 * solicitud, no la propiedad medida en terreno, y pre-llenarlos acá los
 * duplicaría en dos formas que después divergen.
 *
 * ⚠ **Regla T-B.** `fechaPlanificadaVisita` se hereda; `fechaVisitaReal` nace
 * vacía **siempre**. Copiar una en otra es exactamente el colapso de campos que
 * la regla prohíbe: la planificada la puso la Ejecutiva, la real la registra el
 * tasador en terreno, y confundirlas falsea el cumplimiento de la visita.
 */
export function resolverInforme(tasacion: Tasacion): InformeData {
  return {
    /* A · Visita */
    fechaPlanificadaVisita: tasacion.visita,
    fechaVisitaReal: '',
    observacionesTasador: '',

    /* B · Datos de la propiedad */
    supTerreno: '',
    supConstruida: '',
    supPrimerPiso: '',
    anioConstruccion: '',
    estadoConservacion: '',
    agrupacionPropiedad: '',
    materialPredominante: '',
    calidadConstruccion: 0,
    piso: '',
    pisosPropiedad: '',
    subterraneos: '',
    edificioNombre: '',
    condominioNombre: '',
    orientacion: [],
    numAscensores: '',
    dormitorios: '',
    banos: '',
    mediosBanos: '',
    banoServicio: '',
    estacionamientos: '',
    rolesEstacionamientos: '',
    bodegas: '',
    rolesBodegas: '',
    servidumbreM2: '',
    dfl2: false,
    velocidadVenta: '',
    tipoZona: '',

    /* C · Cuadro de valoración */
    items: [],

    /* D · Comparables */
    comparables: [],

    /* E · Niveles · Terminaciones · Comodidades */
    ampliaciones: [],
    niveles: {
      subterraneo: nivelVacio(),
      n1: nivelVacio(),
      n2: nivelVacio(),
      n3: nivelVacio(),
    },
    recintos: [],
    estructuraSoportante: '',
    divisionesInteriores: '',
    entrepisos: '',
    cubierta: '',
    revestimientoExterior: '',
    cierrosExteriores: '',
    comodidades: comodidadesVacias(),
    ventanas: [],
    sanitarios: '',
    griferia: '',
    mueblesCocina: '',
    puertaPrincipal: '',
    closetMural: false,
    proteccionesRejas: false,

    /* F · Documentos legales */
    cbrFoja: '',
    cbrNumero: '',
    cbrAnio: '',
    vendedor: tasacion.vendedor?.nombre ?? '',
    comprador: '',
    notaria: '',
    repertorio: '',
    nPermisoEdificacion: '',
    fechaPermisoEdif: '',
    nRecepcionFinal: '',
    fechaRecepcionFinal: '',
    selloSec: '',
    selloSecId: '',
    selloSecVencimiento: '',
    afectoExpropiacion: false,
    nCertificadoNoExpropiacion: '',
    coordenadasLat: '',
    coordenadasLng: '',

    /* G · Overrides */
    tasaCapRateOverride: '',
    vidaUtilOverride: '',
    valorSugeridoOverride: '',
    motivoOverride: '',

    /* H · Rentabilidad */
    arriendoBrutoClp: '',
    gastoAnualClp: '',
    valorReferenciaClp: '',

    /* Fotos y documentos */
    fotosPredefinidas: fotosVacias(),
    categoriasCustom: [],
    documentosCargados: {},
  }
}

/**
 * Carga el catálogo de motivos de devolución **desde el schema de Airtable**.
 *
 * ⚠ **Esto sustituye a la constante `MOTIVOS_DEVOLUCION` que existía antes de
 * RO-29, y la sustituye a propósito.** Aquel símbolo era un array literal en
 * este archivo, y reponerlo tal cual habría incumplido el criterio de
 * aceptación de **A-17**: *un cambio en el catálogo debe reflejarse en la
 * próxima carga sin deploy*. Con la constante, agregar un motivo en Airtable no
 * llegaba nunca a la UI.
 *
 * La ruta lee las `choices` del `singleSelect`
 * `TX_CoordinacionVisita.motivo` (`fld0rkrlg9Xo0fFVm`) y devuelve sus `name` en
 * el orden en que están definidas — que es el orden en que el diseño v4 los
 * muestra en el desplegable (`p19_2.png`).
 *
 * El llamador es un componente cliente: cierra el ciclo de la Regla D como con
 * cualquier otra llamada, y si falla muestra el literal humano que suba
 * `llamarApi`. **No hay fallback a una lista local**: un fallback silencioso
 * sería la constante de vuelta, con otro nombre.
 */
export async function cargarMotivosDevolucion(): Promise<MotivoNoContacto[]> {
  return llamarApi<MotivoNoContacto[]>(
    '/api/tasaciones/config/motivos-devolucion',
  )
}

/**
 * Transición `asignada → visitada` — el botón «Calcular Tasación» (RF-TAS-22).
 *
 * Es la mutación irreversible del flujo del tasador: dispara AT03 aguas abajo y
 * no se deshace desde la UI. El 409 por estado ya avanzado lo resuelve la ruta,
 * no el cliente: dos pestañas abiertas no pueden dispararla dos veces.
 */
export async function marcarVisitada(id: string): Promise<void> {
  await llamarApi<{ id: string; estado: string }>(
    `/api/tasaciones/${id}/calcular`,
    { method: 'POST' },
  )
}

/**
 * Persiste la observación de rechazo del informe (RF-TAS-09).
 *
 * **No cambia el estado** y **no avisa al visador** (A-15): las dos cosas las
 * garantiza la ruta. Acá se documentan porque son lo que un lector esperaría
 * que pasara y no pasa.
 */
export async function guardarObservacionRechazo(
  id: string,
  observacion: string,
): Promise<void> {
  await llamarApi<{ id: string }>(`/api/tasaciones/${id}/rechazo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ observacion }),
  })
}

/**
 * ⚠ **STUB DECLARADO — no persiste nada.** El envío del informe al visador no
 * tiene ruta backend.
 *
 * P2-TAS.A construyó once rutas y **ninguna escribe esta transición**; el plan
 * §3.1 tampoco la lista. El v0 la resolvía mutando un array en memoria. Dejarla
 * cableada contra una ruta inventada habría sido peor que no cablearla: el
 * botón diría «enviado» y el informe se quedaría donde está.
 *
 * Hasta que la ruta exista, la pantalla avanza a su confirmación —el
 * comportamiento visible no cambia respecto del v0— y el gap queda en consola y
 * en su ficha CI. **La ruta se diseña fuera de P2-TAS.B.**
 */
export function marcarPdfListo(id: string): void {
  console.warn(
    `[tasaciones] marcarPdfListo(${id}) es un stub: no existe ruta backend para ` +
      'la transición de envío del informe. El estado de la solicitud NO cambió. ' +
      'Ver la ficha CI de P2-TAS.B.',
  )
}
