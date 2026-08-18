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
  /** Versiones del informe (RN-56). La escribe el pipeline PDF; IF-03 sólo lee. */
  documentosGenerados: 'tbl5sYnGPZXgYCBSY',
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

  /**
   * Sección G del formulario de captura · overrides CU-007. Resueltos en
   * P2-TAS.A contra la Meta API (18-ago-2026).
   *
   * ⚠ `InformeData.valorSugeridoOverride` persiste en **`valor_final_override`**:
   * el nombre del identificador y el del campo no coinciden. La tabla tiene
   * otros 10 campos `*_override` que **IF-03 no escribe** — son del motor
   * AT03 y del visador (IF-04).
   */
  tasaCapRateOverride: 'fld1BmKPnzmGr330w',
  vidaUtilOverride: 'fldvqM5ISxBCZZd9N',
  valorFinalOverride: 'fldDiO58l26WwYLuv',
  overrideMotivo: 'fldHeJCF1rxJIHVkD',
  overrideAutor: 'fldAz2dcOOjOigPwi',
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
 * Captura de la visita · las seis tablas de `/datos` e `/informe`
 * ---------------------------------------------------------------------- */

/**
 * `TX_DatosTasacion` (`tblMoK3mFuwN8Yr1A`, 83 campos) — levantados en P2-TAS.A.
 *
 * Sólo están acá los campos que `/datos` lee o escribe. Los otros 55 pertenecen
 * al motor AT03, al bloque SII (§20.6 del schema) y a la extracción RF-09.
 *
 * ⚠ **CI-023** explica por qué el mapeo no cubre `InformeData` entero y por qué
 * varios de estos IDs corresponden a campos que la documentación nombra de otra
 * forma. Los comentarios `⚠ homónimo` marcan los casos en que la tabla tiene
 * **dos** columnas plausibles y ésta es la correcta: no cambiarlos sin releer
 * la ficha.
 */
export const FIELD_IDS_DATOS_TASACION = Object.freeze({
  /** Link → `TX_Solicitudes`. Es la FK por la que se localiza la fila. */
  solicitud: 'fldSz5TZa0KzJJIRS',

  /* --- A · Visita --- */
  observacionesTasador: 'fldFbVpUH11UacWZD',

  /* --- B · Datos de la propiedad --- */
  /** ⚠ `VProperty_Origen_Datos_Informe_v1.1.md` §3.3 lo llama `sup_terreno`. */
  supTerrenoM2: 'fld2s1wiRstEiMBY8',
  /** ⚠ §3.3 lo llama `sup_construida`. */
  supConstruccionM2: 'fldYC1GUSW6xWVscq',
  /** ⚠ homónimo: convive con `sup_construida_piso1` (`fldzY9k38HePg7YKa`). */
  supPrimerPisoM2: 'fldxPUVCFD7F8vC4t',
  /** ⚠ homónimo: convive con `anno_construccion` (`fldcfbrSEFvvWYslL`). */
  anioConstruccion: 'fldzhntDWwfcy5jwP',
  estadoConservacion: 'fldhX4EAdJzJ32slY',
  agrupacionPropiedad: 'fld8ZGFpcrCuvc8gQ',
  materialPredominante: 'fldtJbujGC89f5lFZ',
  calidadConstruccion: 'fldfZDyTviOWosDUj',
  pisos: 'fldoWw7njKadV01hy',
  /** ⚠ es `singleSelect` y `InformeData.orientacion` es `string[]`. CI-023 §5. */
  orientacion: 'fldiuCRWaoknLq9Kz',
  numAscensores: 'fldBCUOrk1GiSYd9K',
  dormitorios: 'fld1HKi6XkUMtIR3D',
  banos: 'fldfgde4qxICXL44y',
  estacionamientos: 'fld1aTQlFz8TBU9Bc',
  rolesEstacionamientos: 'flddHQpJXJAaTGLBO',
  bodegas: 'fldO9YwWopry9odAF',
  rolesBodegas: 'fld7IpT3putWROrfd',
  /** ⚠ homónimo: convive con `sup_servidumbre` (`fldwiF0X5Tx2gIbyf`). */
  servidumbreM2: 'fldqh74NpAK3ELh0O',
  velocidadVentaEstimada: 'fld1eyMr1XT04YgyH',
  /** El campo libre. El Link a `M_Zonificacion` es `zonificacion`; ver P7-TAS. */
  tipoZonaDescripcion: 'fldbrYbbvJThBaGwC',

  /* --- F · fragmentos que viven acá y no en TX_DocumentosLegales --- */
  nCertNoExpropiacion: 'fldXEBNjeTRMROQmW',
  lat: 'fldr9hBhVfU5CS1hw',
  long: 'fld5c96NtpQ69quhr',

  /* --- H · Rentabilidad --- */
  /**
   * ⚠ **NO son `arriendo_bruto_clp` ni `gasto_anual_clp`.** La fórmula
   * `ingreso_liquido_anual` es `{arriendo_mensual} * 12 - {gasto_anual}`:
   * escribir en los campos con sufijo `_clp` —los de nombre obvio— la dejaría
   * en cero para siempre, sin error. **CI-023 §4.**
   */
  arriendoMensual: 'fldZYdbx65RphuCWk',
  gastoAnual: 'fldl7MLJVn74uRfQh',

  /** Procedencia de la fila. `/datos` escribe `tipeado`. */
  origenDato: 'fldACst7tUEy8yPOP',
} as const)

/**
 * Fórmulas de `TX_DatosTasacion`: se **leen**, nunca se escriben.
 *
 * Están segregadas de `FIELD_IDS_DATOS_TASACION` a propósito, para que ningún
 * `updateRecord` pueda incluirlas por descuido — un PATCH contra una fórmula
 * devuelve 422. **CI-023 §2.**
 */
export const FIELD_IDS_DATOS_TASACION_READONLY = Object.freeze({
  /** `IF({sup_construida_total} < 140, 'SI', 'NO')`. El v0 lo cree editable. */
  dfl2: 'fldtyMwl3SZwTRN4h',
  /** `sup_construida_piso1 + sup_construida_piso2` — **no** `sup_construccion_m2`. */
  supConstruidaTotal: 'fldhsMeHuyoUMnvqq',
  ingresoLiquidoAnual: 'fldRXnym7cmurpEyL',
} as const)

/**
 * `TX_DocumentosLegales` (`tbl7qIg5x4Y0tOiLk`, 16 campos) — sección F.
 *
 * Los 9 campos legales se crearon el 24-jul-2026 y están documentados en
 * `docs/schema-airtable.md` §21.3. `clave_doc_legal` es la clave de sync.
 */
export const FIELD_IDS_DOC_LEGALES = Object.freeze({
  nombre: 'fldVUW2U86eLztDmu',
  claveDocLegal: 'fldwZc5rnHF0OmZ9u',
  solicitud: 'fldJ60CFZfJsHwTgA',
  /** CBR · `InformeData.cbrFoja`. */
  fojas: 'fldzTWo2GtXIFtxWR',
  /** CBR · `InformeData.cbrNumero`. */
  numeroInscripcion: 'fldCcr705pwKY1L9z',
  /** CBR · `InformeData.cbrAnio`. */
  anoInscripcion: 'fld585iijZF3oA5Rd',
  permisoEdificacionNumero: 'fld0MWeaFq3bPyOkn',
  permisoEdificacionFecha: 'fld3Vg1fQr13GUgCq',
  recepcionFinalNumero: 'fldNScUyz00oZ1aq9',
  recepcionFinalFecha: 'fldn5IBevRZI16Cyf',
} as const)

/**
 * `TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`, 37 campos) — sección C.
 *
 * `clave_natural` es el primary field y la clave de sync (RO-31). Los campos
 * monetarios (`uf_m2_aplicado`, `uf_total_item`, `valor_uf`…) los calcula el
 * motor: **IF-03 escribe sólo los inputs estructurales**.
 */
export const FIELD_IDS_ITEMS = Object.freeze({
  claveNatural: 'fldt1KqZyN2jeDFxy',
  solicitud: 'fld8atIwbxSbOlsgq',
  orden: 'fld47EqUUGVzMg685',
  descripcion: 'fldj62MBnBkzdDamY',
  subtipo: 'flddcT2wvPX38pHrE',
  rolSii: 'fldgB5CMVDpswETaa',
  supM2: 'fldSoAHz4I7MPTUBN',
  tipoItem: 'fld5HVdWpMY0jWqkx',
  annoConstruccion: 'fldbE6UeloY9opfoJ',
  situacionMunicipal: 'flds7AFUnTJkeUIER',
  aportaAGarantia: 'fldhVdyxP4Uq48K2I',
  material: 'fldAJmNknr5HImlXr',
  /**
   * ⚠ homónimo dentro de la misma tabla: `flag_estado` (`Bueno · Regular ·
   * Malo`) y `estado_conservacion` (`B · R · M`) son dos columnas distintas con
   * el mismo significado y dominios incompatibles. `InformeData.estado` va a
   * `flag_estado`, que es el poblado.
   */
  flagEstado: 'fldMsoEuBe5IN5y1S',
  origenDato: 'fldVHoeGhQe7AcywA',
} as const)

/** `TX_Ampliaciones` (`tblpAtUq4p6o1vofo`, 6 campos) — sección E.1. */
export const FIELD_IDS_AMPLIACIONES = Object.freeze({
  nombre: 'fldgFLsut0CzUqhtn',
  claveAmpliacion: 'fldEEECqeZyKsQYdo',
  descripcion: 'fldTC9BwJUAuMPArN',
  supM2: 'fldzNe9y9j3wtJqFn',
  /** ⚠ es `number` (el año), no una fecha. `Ampliacion.fechaRecepcion` es texto. */
  annoRegularizacion: 'fldtPRIziqKlq2XYk',
  solicitud: 'fld8Px5i3R2tPEH4V',
} as const)

/** `TX_HabitacionesPorNivel` (`tblBITpPb8WuqsatM`, 7 campos) — sección E.2. */
export const FIELD_IDS_HABITACIONES = Object.freeze({
  nombre: 'fldaYJC7O5Bi61d7Y',
  claveHabitacion: 'fldxdEaope1JSoTEz',
  nivel: 'flduDH2eOfQ4uPk9t',
  tipoRecinto: 'fldfRIckarh7az5g5',
  cantidad: 'fld7IIhqWQ6YCibnb',
  solicitud: 'fldsUZEEi4QCA5wOZ',
} as const)

/** `TX_TerminacionesPorRecinto` (`tbleQ7pcLxYx9NbCi`, 6 campos) — sección E.3. */
export const FIELD_IDS_TERMINACIONES = Object.freeze({
  nombre: 'fldgmhdMkGihUF9eO',
  claveTerminacion: 'fldFtNSPVzVCfSXCP',
  categoria: 'fldelZwMGr1GacMvY',
  descripcion: 'fldqLKNt0WSWC7h7w',
  calidad: 'fldygneI133w1OBFR',
  solicitud: 'fldPFMGsi6xcwtkUJ',
} as const)

/**
 * `TX_DocumentosGenerados` (`tbl5sYnGPZXgYCBSY`, 25 campos) — versión vigente
 * del informe (RF-TAS-20 · RN-56). **IF-03 sólo lee**: la escribe el pipeline
 * PDF (E1/E2/E3).
 *
 * ⚠ La tabla arrastra **dos generaciones de campos** que conviven: `version` /
 * `version_doc`, `url_pdf` / `url_dropbox`, `hash_pdf` / `hash_pdf_sha256`,
 * `estado` / `status_envio_cliente`. `/informe` lee la pareja nueva con caída a
 * la vieja, porque cuál está poblada depende de qué generación creó la fila.
 */
export const FIELD_IDS_DOCUMENTOS_GENERADOS = Object.freeze({
  solicitud: 'fldLGIn2LYIFA5MEe',
  versionDoc: 'fldMl20ZMCCI7lJ3K',
  version: 'fldvElTOE6S6ARVR7',
  esVigente: 'fldNCU6m00S1p9hv8',
  urlPdf: 'fldL1jl0ecsThRrQY',
  urlDropbox: 'fldGVz9QhnGohAFu2',
  generadoEn: 'fldoACWHnSpoIBH6N',
  fechaGeneracion: 'fldPZ9bPnSrLKKDze',
  estado: 'fldXi1pqaUB6stvQq',
  plantillaVersion: 'fldYuNO7gRIyhufcE',
} as const)

/** Dominios cerrados que `/datos` escribe. Literales exactos del `singleSelect`. */
export const OPCIONES_CAPTURA = Object.freeze({
  /** `TX_TerminacionesPorRecinto.categoria` — sólo estas tres recibe `/datos`. */
  categoriaTerminacion: { pisos: 'Pisos', muros: 'Muros', cielos: 'Cielos' },
  /** `TX_TerminacionesPorRecinto.calidad`. */
  calidadTerminacion: { alto: 'Alto', medio: 'Medio', basico: 'Basico' },
  /** `TX_HabitacionesPorNivel.nivel`. `Mansarda` existe y el v0 no la ofrece. */
  nivel: {
    subterraneo: 'Subterraneo',
    n1: 'Piso1',
    n2: 'Piso2',
    n3: 'Piso3',
  },
  /** `TX_DatosTasacion.origen_dato` y `TX_ItemsCuadroValoracion.origen_dato`. */
  origenDatoTasacion: 'tipeado',
  origenDatoItem: 'tasador',
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
