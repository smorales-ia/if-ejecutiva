/**
 * FIELD_IDs y TABLE_IDs de Airtable que consume IF-03 · Tasador.
 *
 * Tanda P1-TAS · sigue el patrón de `FIELD_IDS_SLA` en `lib/sla-etapas.ts:60`.
 *
 * **Por qué IDs y no nombres.** Un nombre de campo se renombra desde la UI de
 * Airtable sin avisar y el código degrada en silencio — ése fue el fallo de
 * `ejecutiva_asignada` (E-018/E-019). El FIELD_ID es la identidad estable.
 * §22.3 del schema lo convierte en obligación para los campos homónimos.
 *
 * **Regla dura de la tanda:** ningún `fld…` de este archivo se inventó. Todos
 * aparecen literalmente en `docs/schema-airtable.md`. Los campos que la tabla
 * de §2 documenta con `—` en la columna FIELD_ID **no están acá**: se listan al
 * final como pendientes, y P2-TAS los resuelve leyendo el schema real antes de
 * usarlos.
 */

/* -------------------------------------------------------------------------
 * TABLE_IDs
 * ---------------------------------------------------------------------- */

export const TABLE_IDS = Object.freeze({
  solicitudes: 'tblaHTyMHYfmy7Fg6',
  tasadores: 'tblEi5jp18c1j00bQ',
  datosTasacion: 'tblMoK3mFuwN8Yr1A',
  comparables: 'tbllbTuhb0waWIbRo',
  itemsCuadroValoracion: 'tblCxnMtOETK2ulD0',
  unidades: 'tbl2QDLvJDyy3Rg2I',
  contactosVisita: 'tblW3SSbKo6vRjwBJ',
  ampliaciones: 'tblpAtUq4p6o1vofo',
  habitacionesPorNivel: 'tblBITpPb8WuqsatM',
  terminacionesPorRecinto: 'tbleQ7pcLxYx9NbCi',
  obrasComplementarias: 'tblQ1fXM06bzSQ84w',
  documentosLegales: 'tbl7qIg5x4Y0tOiLk',
  adjuntos: 'tblur71x1oItbmKZc',
  cambios: 'tbl6Yd0c7MRqNeC0x',
  tipoDocumento: 'tblkPhBnpdDmUWOl3',
  tipoDocumentoAtributo: 'tbldI86ieVKpjpL7E',
  sla: 'tblsPZokEK5aoinTn',
  slaEtapas: 'tbl05zu5RLhH3u6pl',
} as const)

/* -------------------------------------------------------------------------
 * TX_Solicitudes
 * ---------------------------------------------------------------------- */

/**
 * Campos de `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`) que IF-03 lee o escribe.
 *
 * Las claves son **alias de código** en el sentido de §22 del schema: nombre
 * único en todo el repo, distinto del nombre de datos de Airtable.
 */
export const FIELD_IDS_SOLICITUD = Object.freeze({
  /** `codigo_solicitud` · formula, primary field. Read-only. */
  codigo: 'fldDXEE1ejMNVDlpB',
  /** `codigo_ext` · formula. Read-only. */
  codigoExt: 'fldSuJx1fDNYYwDcD',
  /** `fecha_solicitud` · dateTime. */
  fechaSolicitud: 'fldvkn9CsORy4eU0Z',
  /** `cliente` · Link → M_Clientes. */
  cliente: 'fldttL5myzLohDwHv',
  /** `estado` · singleSelect. Ver `EstadoBackend`. */
  estado: 'fld2H2r0GMeVfNO26',
  /** `visador` · Link → M_Visadores. IF-03 no lo escribe. */
  visador: 'fldhm86amyekWsEFY',
  /** `ejecutiva_asignada` · Link → AUTH_Usuarios. */
  ejecutivaAsignada: 'fldv1XDfP7EgYC3km',

  /**
   * Regla T-B · las dos fechas de visita, que **nunca se colapsan**.
   * Ver `docs/schema-airtable.md` §26.3.
   */
  /** `fecha_visita_programada` · date. La escribe la Ejecutiva desde IF-02. */
  fechaVisitaPlanificada: 'fldPUFd9YuQdkcrOI',
  /** `fecha_visita` · date. **La fecha real.** La escribe el Tasador desde IF-03. */
  fechaVisitaReal: 'fldpTBzjfbAw5FSYI',

  /** `fecha_asignacion_ts` · dateTime. Alimenta los filtros de la cola. */
  fechaAsignacionTs: 'fldf8BS8nv2vtOmu0',
  /** `fecha_asignacion` · date. ⚠ DEPRECATED (§21.4-d): usar `fechaAsignacionTs`. */
  fechaAsignacionDeprecated: 'fldiaj4mwd17g25n1',

  /** `observacion_rechazo_tasador` · multilineText. Creado en P0.5-TAS. RF-TAS-09. */
  observacionRechazoTasador: 'fldAccib5yNYaOmJc',

  /** `tipo_propiedad` · Link → M_TiposPropiedad. Alias §22.2. */
  tipoPropiedad: 'fld701TB0LXovvQmt',
  /** `tipo_propiedad_nuevo_usado` · singleSelect `nuevo · usado`. Alias §22.2. */
  tipoPropiedadNuevoUsado: 'fldHxx1P1ao33PWrl',
  /** `estado_conservacion` · singleSelect. No confundir con `estado`. */
  estadoConservacion: 'flde0ExWfB1dhkp4t',

  /** `semaforo_sla` · formula. Read-only. */
  semaforoSla: 'fldW4oUq7LvQUZq7W',
  /** `prioridad` · singleSelect. */
  prioridad: 'fld9FKZ9siAeSsH54',
  /** `origen_canal` · singleSelect. */
  origenCanal: 'fldPphw1FWfYdZI2Z',

  /** `monto_estimado_uf` · number. */
  montoEstimadoUf: 'fldKZW799xIqMFN1I',
  /** `observaciones_internas` · multilineText. */
  observacionesInternas: 'fldjmx9pLOyJKx1Mw',
  /** `proyecto_condominio` · singleLineText. Sólo se muestra si la propiedad es nueva. */
  proyectoCondominio: 'fldbmGmyMHOtfX2Az',
  /** `email_thread_id` · singleLineText. RN-52. */
  emailThreadId: 'fldhy81fNSE5CF2Tc',

  /** Vendedor — vive como campos de `TX_Solicitudes`; `TX_Vendedor` no existe (§21). */
  vendedorNombre: 'fldNkFwB5p3Mljtrg',
  vendedorRut: 'fldrITDFkbk95Da00',
  vendedorEmail: 'flduBKof3x45EpTNW',
  vendedorTelefono: 'flduslI2FNAdcPchK',

  /**
   * Resueltos en P2-TAS contra la Meta API (17-ago-2026). `docs/schema-airtable.md`
   * §2 los documenta con `—`; estos IDs son los reales de la base.
   */
  /** `tasador` · Link → M_Tasadores. **Es el campo del guard de autorización (RF-09).** */
  tasador: 'fldlgriK1jP5906wE',
  direccion: 'fldKP0yxwQkSdrFuZ',
  rolSii: 'fldznAL2SuCpfUUtg',
  comuna: 'fldJTjjzCPBHMOWZv',
  producto: 'fldp64U99lsLf7HlV',
  tipoInforme: 'fldJO4JtsDEeMmjdi',
  pdfFinalUrl: 'fldASzRV9aQNFExpY',
  clienteFinalNombre: 'fld7jxcbmMYz6kmbj',
  clienteFinalRut: 'fldwNEPL8fXkWwUBd',
} as const)

/* -------------------------------------------------------------------------
 * Otras tablas
 * ---------------------------------------------------------------------- */

export const FIELD_IDS_UNIDADES = Object.freeze({
  /** `sup_terreno_m2` · number precision 0. Decisión de panel 24-jul (§21.4-e). */
  supTerrenoM2: 'fld6lgF0KxUh9oPCB',
  /** `rol_sii` · singleLineText. */
  rolSii: 'fldC5yUYC2wTTLJBV',
  /** `numero_unidad` · singleLineText. ⚠ Texto libre, vacío en la mayoría de las filas. */
  numeroUnidad: 'fldJGXS8jGDKZDdWM',
} as const)

export const FIELD_IDS_TIPO_DOCUMENTO = Object.freeze({
  /**
   * `tipo_propiedad` de `D_TipoDocumento` · singleSelect `nueva · usada · ambas`.
   *
   * Alias `condicionPropiedadAplicable`, acuñado en §22.2 del schema para
   * separarlo del homónimo de `TX_Solicitudes`. Es el lado femenino de P-5.
   */
  condicionPropiedadAplicable: 'fldIfdcjsr8KeNRCx',
} as const)

/**
 * `A_Cambios` (`tbl6Yd0c7MRqNeC0x`) — levantados en P2-TAS vía Meta API.
 *
 * ⚠ **CI-011 documenta esta tabla mal y además se equivoca en un nombre**: dice
 * que el campo vacío se llama `autor`; el real es **`actor`**. Los dos campos
 * que CI-011 marca como inservibles —`actor` y `motivo`— existen, y los que de
 * verdad se usan son `modificado_por_email` y `razon_cambio`.
 *
 * `tabla_origen` es un `singleSelect` con dominio cerrado: `M_Clientes ·
 * M_Tasadores · M_Visadores · M_Comunas · C_ReglasNegocio · C_Formulas ·
 * C_Factores · TX_Solicitudes · TX_DatosTasacion · Otro`. Escribir un valor
 * fuera de esa lista lo **crearía** por `typecast: true` y rompería en silencio
 * el filtro del timeline de IF-02.
 */
export const FIELD_IDS_CAMBIOS = Object.freeze({
  tablaOrigen: 'fldqRCXSY692mzaT4',
  registroId: 'fldRdyudnUcjSf1Zf',
  registroNombre: 'fldB3GDfua7fnXbXT',
  campoModificado: 'fldbpKuwR2RfbT41G',
  valorAnterior: 'fldxCiiMpGSsTyNka',
  valorNuevo: 'fld4d9hQefakIQpJ3',
  /** El autor real. **No** `actor`, que existe y está vacío. */
  modificadoPorEmail: 'fldTUGG0jtsO47m1a',
  /** El motivo real. **No** `motivo`, que existe y está vacío. */
  razonCambio: 'fldDlPfFZa1dtA2Xv',
  timestamp: 'fldCyzAD9TPrEWr2x',
} as const)

/** Valores válidos de `A_Cambios.tabla_origen` que IF-03 usa. */
export const TABLA_ORIGEN = Object.freeze({
  solicitudes: 'TX_Solicitudes',
  datosTasacion: 'TX_DatosTasacion',
} as const)

export const FIELD_IDS_ADJUNTOS = Object.freeze({
  /** `estado_extraccion` · alimenta el pipeline RF-09. */
  estadoExtraccion: 'fld54epvDJ7YdJIYD',
  /** `atributos_obtenidos` · Long text con el JSON extraído. */
  atributosObtenidos: 'fldeCH15RrL8f4TZk',
} as const)

/* -------------------------------------------------------------------------
 * Pendientes
 * ---------------------------------------------------------------------- */

/**
 * ✅ **Cerrado en P2-TAS (17-ago-2026).** Los 9 campos que P1-TAS dejó sin
 * FIELD_ID —porque `docs/schema-airtable.md` §2 los documenta con `—`— se
 * resolvieron contra la Meta API de Airtable y viven arriba, en
 * `FIELD_IDS_SOLICITUD`. Ninguno se inventó.
 *
 * Se conserva la constante vacía a propósito: es el marcador de que la deuda
 * existió y se cerró. Si vuelve a aparecer un campo sin ID documentado, entra
 * acá y **no** se referencia por nombre hasta resolverlo.
 */
export const FIELD_IDS_PENDIENTES: readonly string[] = Object.freeze([])
