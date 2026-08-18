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
 * Campos que IF-03 necesita y cuyo FIELD_ID **no está documentado**:
 * `docs/schema-airtable.md` §2 los lista con `—`.
 *
 * No se inventa ninguno. **P2-TAS los resuelve** contra el schema real (Meta
 * API REST, no MCP) antes de la primera lectura o escritura, y actualiza tanto
 * este módulo como el §2 del schema doc en el mismo movimiento.
 *
 * Mientras tanto, referenciarlos por nombre de datos es aceptable **sólo** si
 * el nombre no es homónimo en la base (§22.4).
 */
export const FIELD_IDS_PENDIENTES: readonly string[] = Object.freeze([
  'direccion',
  'rol_sii',
  'comuna',
  'producto',
  'tasador',
  'pdf_final_url',
  'cliente_final_nombre',
  'cliente_final_rut',
])
