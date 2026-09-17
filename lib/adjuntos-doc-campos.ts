/**
 * Mapa `tipo de documento → tablas/campos derivados` para el cascade de borrado
 * de adjuntos (Tarea 5 · Fase B).
 *
 * ## Qué es
 *
 * Cuando se borra un adjunto, los datos que ese documento pobló en Airtable
 * deben limpiarse (decisión Q1/Q2 de Héctor). Este módulo declara, por
 * `tipo de documento` (= `TX_Adjuntos.clave_adjunto` = `codigo` de
 * `D_TipoDocumento`, RN-25), **qué campos de qué tablas** se ponen a null.
 *
 * Lo consumen dos lados a propósito:
 *
 * - **Servidor** — `lib/adjuntos-cascade.ts` deriva de aquí las entradas (a)/(c)
 *   del `CASCADE_REGISTRY` y ejecuta los PATCH.
 * - **Cliente** — `components/shared/confirmar-borrado-adjunto-dialog.tsx` lista
 *   al usuario los datos que se van a limpiar antes de confirmar (Q3).
 *
 * Por eso el módulo es **client-safe**: importa sólo constantes (`TABLE_IDS`,
 * FIELD_IDs de `lib/tasador/field-ids.ts`, todas `Object.freeze`), nunca el
 * cliente de Airtable ni nada de servidor.
 *
 * ## Fuente canónica y espejo curado
 *
 * La fuente normativa del mapa documental es **`D_TipoDocumentoAtributo`**
 * (`tbldI86ieVKpjpL7E`) — la misma tabla que `AT03-Ext` usa para POBLAR estos
 * campos. Este archivo es su **espejo curado**: hardcodeado a propósito (ver
 * `docs/schema-airtable.md` §28 y el cierre de Fase 1) porque
 *
 *   1. el diálogo Q3 necesita las etiquetas de forma síncrona en cliente, sin un
 *      endpoint extra;
 *   2. el mapa es diminuto y estable (cambia sólo si cambia `AT03-Ext`);
 *   3. la curaduría por **FIELD_ID** evita el homónimo `anno_construccion` de
 *      `TX_DatosTasacion` y el rename `numero_inscripcion ← numero_dominio`, que
 *      una lectura por nombre del campo destino no distingue.
 *
 * **Obligación de sincronía:** si `AT03-Ext` cambia qué campos poblar, este mapa
 * y §28 se actualizan en el mismo commit. Un campo de más aquí limpia dato que
 * el documento no pobló; uno de menos deja un huérfano.
 *
 * ## Por qué FIELD_ID y no nombre
 *
 * El cascade PATCHea con estas claves. Airtable acepta tanto nombre como
 * FIELD_ID en el body de un update; se usa FIELD_ID por la regla del repo (más
 * estable) y porque un nombre equivocado por homónimo limpiaría la columna
 * incorrecta en silencio. Un FIELD_ID inexistente, en cambio, devuelve 422 y el
 * cascade lo cuenta como error sin destruir nada.
 */

import { TABLE_IDS, FIELD_IDS_DATOS_TASACION, FIELD_IDS_UNIDADES, FIELD_IDS_DOC_LEGALES } from '@/lib/tasador/field-ids'

/** Un campo a vaciar: su FIELD_ID (clave del PATCH) y su etiqueta humana (Q3). */
export interface CampoLimpiable {
  /** FIELD_ID (`fld…`) — clave del `updateRecord`. */
  fieldId: string
  /** Texto que ve el usuario en el diálogo de confirmación. */
  label: string
}

/**
 * Un destino derivado de un tipo de documento: una tabla y los campos que hay
 * que limpiar en ella, más el patrón de borrado (§28).
 */
export interface TablaDerivada {
  /** TABLE_ID de la tabla derivada. */
  tabla: string
  /** Encabezado del grupo en el diálogo Q3. */
  tablaLabel: string
  /**
   * Patrón de §28:
   * - `a` — satélite 1:1 por solicitud (una fila, o ninguna).
   * - `c` — merge por unidad: N filas de `TX_Unidades`, se conservan.
   *
   * (El patrón `b` —tablas hijas con provenance por adjunto, `TX_Comparables`—
   * no vive aquí: no limpia campos, borra/desliga filas, y su entrada sigue
   * declarada a mano en `CASCADE_REGISTRY`.)
   */
  patron: 'a' | 'c'
  campos: CampoLimpiable[]
}

/**
 * Mapa `tipoDocumento → TablaDerivada[]`. Derivado literal de
 * `docs/schema-airtable.md` §28.
 *
 * Los tipos sin destino (`certificado_deuda_tgr`, `certificado_dominio_vigente`,
 * etc. · los de §28 sin `uso_tabla_destino` · Q5) simplemente no están:
 * `camposLimpiablesDe()` los devuelve como lista vacía y el cascade no purga nada
 * para ellos (no-op).
 *
 * ⚠ El par **recepción final** (`recepcion_final_numero` · `recepcion_final_fecha`)
 * y el par **permiso** (`permiso_edificacion_numero` · `permiso_edificacion_fecha`)
 * en `TX_DocumentosLegales` tienen cada uno más de un documento-fuente legítimo
 * (Origen v1.6 §2.1):
 *   - `escritura_compraventa` puebla **ambos** pares (cláusulas 2ª y 3ª).
 *   - `permiso_edificacion` puebla el par permiso.
 *   - `certificado_recepcion_final` puebla el par recepción final.
 * Borrar cualquiera de esos documentos limpia el par que ese tipo pudo poblar: es
 * la política Q1 de Héctor (limpiar todo lo que el tipo pudo poblar), consistente
 * con cómo ya se comportan los campos SII compartidos por `foto_fuente_sii` y
 * `certificado_avaluo_fiscal`.
 */
export const CAMPOS_DERIVADOS: Record<string, TablaDerivada[]> = {
  foto_fuente_sii: [
    {
      tabla: TABLE_IDS.datosTasacion,
      tablaLabel: 'Datos de tasación (SII)',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DATOS_TASACION.rolSii, label: 'Rol SII' },
        { fieldId: FIELD_IDS_DATOS_TASACION.codSiiComuna, label: 'Código SII comuna' },
        { fieldId: FIELD_IDS_DATOS_TASACION.codSiiManzana, label: 'Código SII manzana' },
        { fieldId: FIELD_IDS_DATOS_TASACION.codSiiPredio, label: 'Código SII predio' },
        { fieldId: FIELD_IDS_DATOS_TASACION.calidadSii, label: 'Calidad SII' },
        { fieldId: FIELD_IDS_DATOS_TASACION.destinoSii, label: 'Destino SII' },
        { fieldId: FIELD_IDS_DATOS_TASACION.ubicacionUrbanoRural, label: 'Ubicación urbano/rural' },
        { fieldId: FIELD_IDS_DATOS_TASACION.avaluoFiscalClp, label: 'Avalúo fiscal (CLP)' },
        { fieldId: FIELD_IDS_DATOS_TASACION.avaluoExento, label: 'Avalúo exento' },
        { fieldId: FIELD_IDS_DATOS_TASACION.contribucionAnual, label: 'Contribución anual' },
        { fieldId: FIELD_IDS_DATOS_TASACION.cg, label: 'CG' },
        { fieldId: FIELD_IDS_DATOS_TASACION.ociv, label: 'OCIV' },
        { fieldId: FIELD_IDS_DATOS_TASACION.oc, label: 'OC' },
        { fieldId: FIELD_IDS_DATOS_TASACION.g, label: 'G' },
      ],
    },
    {
      tabla: TABLE_IDS.documentosLegales,
      tablaLabel: 'Documentos legales (dominio)',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DOC_LEGALES.numeroInscripcion, label: 'Número de inscripción (dominio)' },
        { fieldId: FIELD_IDS_DOC_LEGALES.fojas, label: 'Fojas (dominio)' },
        { fieldId: FIELD_IDS_DOC_LEGALES.anoInscripcion, label: 'Año de inscripción (dominio)' },
      ],
    },
    {
      tabla: TABLE_IDS.unidades,
      tablaLabel: 'Unidades',
      patron: 'c',
      campos: [
        { fieldId: FIELD_IDS_UNIDADES.tipoMaterial, label: 'Tipo de material' },
        { fieldId: FIELD_IDS_UNIDADES.anioConstruccion, label: 'Año de construcción' },
        { fieldId: FIELD_IDS_UNIDADES.supM2, label: 'Superficie construida (m²)' },
        { fieldId: FIELD_IDS_UNIDADES.supTerrenoM2, label: 'Superficie de terreno (m²)' },
      ],
    },
  ],

  certificado_avaluo_fiscal: [
    {
      tabla: TABLE_IDS.datosTasacion,
      tablaLabel: 'Datos de tasación (SII)',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DATOS_TASACION.avaluoExento, label: 'Avalúo exento' },
        { fieldId: FIELD_IDS_DATOS_TASACION.contribucionAnual, label: 'Contribución anual' },
        { fieldId: FIELD_IDS_DATOS_TASACION.destinoSii, label: 'Destino SII' },
        { fieldId: FIELD_IDS_DATOS_TASACION.calidadSii, label: 'Calidad SII' },
        { fieldId: FIELD_IDS_DATOS_TASACION.materialPredominante, label: 'Material predominante' },
      ],
    },
    {
      tabla: TABLE_IDS.unidades,
      tablaLabel: 'Unidades',
      patron: 'c',
      campos: [
        { fieldId: FIELD_IDS_UNIDADES.rolSii, label: 'Rol SII' },
        { fieldId: FIELD_IDS_UNIDADES.supM2, label: 'Superficie construida (m²)' },
        { fieldId: FIELD_IDS_UNIDADES.anioConstruccion, label: 'Año de construcción' },
        { fieldId: FIELD_IDS_UNIDADES.avaluoUf, label: 'Avalúo (UF)' },
      ],
    },
  ],

  escritura_compraventa: [
    {
      tabla: TABLE_IDS.documentosLegales,
      tablaLabel: 'Documentos legales',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DOC_LEGALES.permisoEdificacionNumero, label: 'N° permiso de edificación' },
        { fieldId: FIELD_IDS_DOC_LEGALES.permisoEdificacionFecha, label: 'Fecha permiso de edificación' },
        { fieldId: FIELD_IDS_DOC_LEGALES.recepcionFinalNumero, label: 'N° recepción final' },
        { fieldId: FIELD_IDS_DOC_LEGALES.recepcionFinalFecha, label: 'Fecha recepción final' },
      ],
    },
  ],

  // Documento canónico del par permiso (Origen v1.6 §2.1). Scope mínimo spec-fiel:
  // sólo `permiso_edificacion_numero` · `permiso_edificacion_fecha` tienen destino
  // real en `D_TipoDocumentoAtributo`; el resto del PDF (tipo_obra, superficie,
  // DFL2, propietario…) quedó catalogado sin destino (brecha · ver el xlsx de
  // diagnóstico). Comparte el par con `escritura_compraventa` (ver docblock ⚠).
  permiso_edificacion: [
    {
      tabla: TABLE_IDS.documentosLegales,
      tablaLabel: 'Documentos legales',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DOC_LEGALES.permisoEdificacionNumero, label: 'N° permiso de edificación' },
        { fieldId: FIELD_IDS_DOC_LEGALES.permisoEdificacionFecha, label: 'Fecha permiso de edificación' },
      ],
    },
  ],

  // Documento canónico del par recepción final (Origen v1.6 §2.1). Scope mínimo
  // spec-fiel: sólo `recepcion_final_numero` · `recepcion_final_fecha` tienen
  // destino real en `D_TipoDocumentoAtributo` (cableado vía MCP · TANDA B); el
  // resto del PDF (rol_sii, superficie, destino, propietario…) quedó catalogado
  // sin destino (brecha · ver docs/_analisis/lectura_datos_certificado_recepcion_final_v1.xlsx).
  // Comparte el par recepción final con `escritura_compraventa` (ver docblock ⚠).
  certificado_recepcion_final: [
    {
      tabla: TABLE_IDS.documentosLegales,
      tablaLabel: 'Documentos legales',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DOC_LEGALES.recepcionFinalNumero, label: 'N° recepción final' },
        { fieldId: FIELD_IDS_DOC_LEGALES.recepcionFinalFecha, label: 'Fecha recepción final' },
      ],
    },
  ],

  // H2 · Consulta de Antecedentes de Bien Raíz (SII). Scope mínimo spec-fiel: de
  // los 15 atributos sólo tres SII descriptivos tienen destino real cableado en
  // `D_TipoDocumentoAtributo` — `avaluo_total`, `destino_sii`, `calidad_sii`
  // (TX_DatosTasacion, una_por_solicitud, política "solo si vacío"). Comparte
  // `destino_sii`/`calidad_sii` con `foto_fuente_sii` y `certificado_avaluo_fiscal`
  // (política Q1). El resto (rol/avalúo_afecto/contribución/detalle edificación…)
  // quedó sin destino: `foto_fuente_sii` es el tipo canónico del bloque SII, y la
  // contribución del documento viene rotulada trimestral/semestral (conversión
  // pendiente, no se auto-escribe). Ver docs/_analisis/lectura_datos_consulta_antecedentes_bien_raiz_v1.xlsx.
  consulta_antecedentes_bien_raiz: [
    {
      tabla: TABLE_IDS.datosTasacion,
      tablaLabel: 'Datos de tasación (SII)',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DATOS_TASACION.avaluoTotal, label: 'Avalúo total (SII)' },
        { fieldId: FIELD_IDS_DATOS_TASACION.destinoSii, label: 'Destino SII' },
        { fieldId: FIELD_IDS_DATOS_TASACION.calidadSii, label: 'Calidad SII' },
      ],
    },
  ],

  // H3 · Informe de No Expropiación SERVIU. Scope mínimo spec-fiel: número de
  // certificado + coordenadas, todos en TX_DatosTasacion (una_por_solicitud) y
  // leídos por la UI (`nCertificadoNoExpropiacion`, `coordenadasLat/Lng` en
  // lectura-datos.ts). `afecto_expropiacion` no tiene columna persistente en el
  // modelo (la UI lo captura como flag, no se hidrata), así que queda sin destino
  // (brecha documentada). Ver docs/_analisis/lectura_datos_informe_no_expropiacion_serviu_v1.xlsx.
  informe_no_expropiacion_serviu: [
    {
      tabla: TABLE_IDS.datosTasacion,
      tablaLabel: 'Datos de tasación',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DATOS_TASACION.nCertNoExpropiacion, label: 'N° certificado no expropiación' },
        { fieldId: FIELD_IDS_DATOS_TASACION.lat, label: 'Latitud' },
        { fieldId: FIELD_IDS_DATOS_TASACION.long, label: 'Longitud' },
      ],
    },
  ],

  // H4 · Inscripción de Dominio CBR — documento canónico de titularidad. Scope
  // mínimo spec-fiel: la terna de dominio (foja/número/año) → TX_DocumentosLegales
  // (una_por_solicitud), leída por la UI (`cbrFoja/cbrNumero/cbrAnio` en
  // lectura-datos.ts). Comparte la terna con `foto_fuente_sii` (dominio) — política Q1.
  // ⚠ DECISIÓN H4 (doble destino vendedor/comprador): el destino canónico de
  // vendedor/comprador es `TX_Solicitudes.vendedor_*`, poblado en el intake; el CBR
  // queda como ORIGEN_DATO de verificación y NO se rutea (evita doble escritura y
  // el resolver 1:1 de AT03-Ext no alcanza TX_Solicitudes). `notaria`/`repertorio`
  // no tienen columna → brecha. Ver docs/_analisis/lectura_datos_inscripcion_dominio_cbr_v1.xlsx.
  inscripcion_dominio_cbr: [
    {
      tabla: TABLE_IDS.documentosLegales,
      tablaLabel: 'Documentos legales (dominio)',
      patron: 'a',
      campos: [
        { fieldId: FIELD_IDS_DOC_LEGALES.fojas, label: 'Fojas (dominio)' },
        { fieldId: FIELD_IDS_DOC_LEGALES.numeroInscripcion, label: 'Número de inscripción (dominio)' },
        { fieldId: FIELD_IDS_DOC_LEGALES.anoInscripcion, label: 'Año de inscripción (dominio)' },
      ],
    },
  ],
}

/**
 * Destinos derivados de un tipo de documento, o `[]` si ese tipo no purga nada
 * (los 8 sin `uso_tabla_destino` · Q5, o cualquier `clave_adjunto` desconocida /
 * vacía, como un adjunto suelto).
 */
export function tablasDerivadasDe(tipoDocumento: string | null | undefined): TablaDerivada[] {
  if (!tipoDocumento) return []
  return CAMPOS_DERIVADOS[tipoDocumento] ?? []
}

/**
 * Todas las etiquetas de campo que un borrado de este tipo limpiaría, agrupadas
 * por tabla, para pintar la lista del diálogo Q3. Vacío ⇒ el diálogo no muestra
 * lista, sólo la confirmación.
 */
export function grupoCamposLimpiables(
  tipoDocumento: string | null | undefined
): { tablaLabel: string; labels: string[] }[] {
  return tablasDerivadasDe(tipoDocumento).map((t) => ({
    tablaLabel: t.tablaLabel,
    labels: t.campos.map((c) => c.label),
  }))
}

/* ---------------------------------------------------------------------------
 * Changelog
 * - v1.3 (17-sep-2026): alta de tres tipos-fuente H2/H3/H4 (TANDA H1-H4 · Met_6283).
 *   `consulta_antecedentes_bien_raiz` → 3 campos SII en TX_DatosTasacion
 *   (`avaluo_total`·`destino_sii`·`calidad_sii`, patrón a; comparte destino/calidad
 *   con foto_fuente_sii y certificado_avaluo_fiscal · Q1). `informe_no_expropiacion_serviu`
 *   → 3 campos en TX_DatosTasacion (`n_cert_no_expropiacion`·`lat`·`long`, patrón a).
 *   `inscripcion_dominio_cbr` → terna de dominio en TX_DocumentosLegales
 *   (`fojas`·`numero_inscripcion`·`ano_inscripcion`, patrón a; comparte terna con
 *   foto_fuente_sii · Q1). H1 `certificado_deuda_tgr` NO se cabló (sin destino
 *   canónico). H4 vendedor/comprador sin destino (canónico = TX_Solicitudes.vendedor_*).
 *   CASCADE_REGISTRY: 9 → 12.
 * - v1.2 (11-sep-2026): alta de `certificado_recepcion_final` → limpia el par
 *   recepción final (`recepcion_final_numero` · `recepcion_final_fecha`, patrón a)
 *   en `TX_DocumentosLegales`. Espejo del alta de `permiso_edificacion`. El par lo
 *   comparte con `escritura_compraventa` (política Q1). CASCADE_REGISTRY: 8 → 9.
 * - v1.1 (10-sep-2026): alta de `permiso_edificacion` (par permiso).
 * - v1.0 (09-sep-2026): mapa inicial derivado de §28 (Tarea 5 · Fase B).
 * ------------------------------------------------------------------------- */
