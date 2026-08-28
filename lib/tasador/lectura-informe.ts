/**
 * Modelo **canónico** del informe — los 8 bloques de §10.1 más la versión
 * vigente (RF-TAS-20 · RN-56). Módulo server-only.
 *
 * ## Origen · P9-TAS · CI-063
 *
 * Este productor se **extrajo** de `app/api/tasaciones/[id]/informe/route.ts`
 * (donde vivía inline desde P2-TAS.A) para que tenga **dos** consumidores sin
 * duplicar la aritmética: el propio route (que sigue exponiendo el mismo JSON)
 * y `app/tasaciones/[id]/informe/page.tsx`, que hidrata el preview server-side.
 * El route ahora delega acá; su contrato de respuesta es **idéntico** (mismas 5
 * claves: `id · codigo · estado · versionVigente · bloques`).
 *
 * La razón de la extracción es **CI-063**: `informe-preview.tsx` armaba el cap
 * rate con el modelo *cliente* (`(arriendo·12 − gasto) / valorReferenciaClp`),
 * cuyo denominador `valorReferenciaClp` **no tiene columna destino** (CI-023 §1 ·
 * `CAMPOS_SIN_DESTINO`) y quedaba «—». El modelo canónico trae el cap rate
 * **almacenado** (`tasa_cap_rate_override ?? tasa_cap_rate`), de modo que el
 * preview lo puede mostrar sin depender de que CI-023 dé columna a nada.
 *
 * ## Acotación de la tanda P9-TAS (frente CI-063 · alcance MÍNIMO)
 *
 * De todo el modelo canónico, la tanda que introdujo este módulo cablea al
 * preview **sólo el bloque 2** (`valorDestacado`: cap rate + valor UF). El resto
 * de los bloques sigue rindiéndose en `informe-preview.tsx` desde el modelo
 * cliente. En concreto:
 *
 * - **Bloques 4 (avalúo SII) y 8 (antecedentes legales)** quedan **fuera de
 *   scope** de CI-063 y se migran al canónico en un frente posterior,
 *   **P9-TAS.B** (construcción visual completa §10.3). El productor los calcula
 *   igual —son parte del contrato del route— pero el preview aún no los consume.
 * - **Bloque 6 (comparables)**: el preview lo mantiene con su grilla de promedio
 *   **simple** de forma **deliberada**. No se cablea al promedio homogeneizado
 *   que este módulo calcula, porque esa divergencia es **CI-057**, abierta y
 *   condicionada a **A-44** (Héctor). Alinearlos sin esa respuesta cambiaría el
 *   número que el visador firma sobre una duda abierta.
 *
 * ## No proyecta `valorReferenciaClp` (CI-023 §1)
 *
 * Coherente con `lib/tasador/lectura-datos.ts`: `valorReferenciaClp` no existe
 * en ninguna de las tablas y no se inventa. El cap rate canónico no lo necesita.
 *
 * ## Lee 8 tablas
 *
 * `TX_Solicitudes` (vía guard) · `TX_DatosTasacion` · `TX_Unidades` ·
 * `TX_ItemsCuadroValoracion` · `TX_Comparables` · `TX_Adjuntos` ·
 * `TX_DocumentosGenerados` · `TX_DocumentosLegales`.
 *
 * ## Los ocho bloques son un contrato, no una sugerencia
 *
 * §10.1: el orden y la numeración son parte del requisito. Por eso `bloques` es
 * un **array ordenado** con `numero` explícito. Cada bloque lleva `vacio`; los
 * bloques sin contenido se muestran vacíos, no se omiten.
 *
 * ## Degradaciones declaradas
 *
 * - `versionVigente: null` cuando no hay fila en `TX_DocumentosGenerados` que
 *   case por el Link `solicitud` (**CI-024**).
 * - Códigos SII vacíos: `cod_sii_*` no existen en la base (**CI-025**). Se emite
 *   la clave con `null` y no se omite.
 * - Valor destacado prefiere el override y **nunca cae a cero**: `0` sería «0 UF»
 *   (una tasación de cero pesos), no un dato ausente.
 * - Registro fotográfico cuenta por `descripcion || tipo_adjunto`.
 * - El promedio homogeneizado del bloque 6 se calcula acá, no en la UI. ⚠ Si
 *   AT03 publica su propio promedio, este módulo debe deferir a ése.
 */

import { listRecords } from '@/lib/airtable-client'
import { autorizarSolicitud, type ResultadoGuard } from '@/lib/tasador/auth-guard'
import { TABLE_IDS } from '@/lib/tasador/field-ids'

type Fields = Record<string, unknown>

/** Bloque del preview. `numero` y el orden del array son parte del requisito. */
export interface Bloque {
  numero: number
  id: string
  titulo: string
  vacio: boolean
  datos: Record<string, unknown>
}

/** Versión vigente del documento (RN-56). `null` si ninguna fila casa (CI-024). */
export interface VersionVigente {
  version: number | null
  urlPdf: string | null
  generadoEn: string
  plantillaVersion: string
}

/**
 * Bloque 2 tipado para el consumidor del preview (CI-063 · alcance mínimo).
 * Es exactamente `bloques[1].datos`, expuesto aparte para que la page no dependa
 * del índice del array.
 */
export interface ValorDestacado {
  valorUf: number | null
  capRate: number | null
  esOverride: boolean
  ufDiaVisita: number | null
}

export interface InformeCanonico {
  id: string
  codigo: string
  estado: string
  versionVigente: VersionVigente | null
  /** Bloque 2 tipado. Lo que CI-063 cablea al preview en esta tanda. */
  valorDestacado: ValorDestacado
  bloques: Bloque[]
}

/** La rama de fallo del guard, que es lo que `desdeGuard` traduce a HTTP. */
type GuardFallido = Extract<ResultadoGuard, { ok: false }>

export type ResultadoInforme =
  | { ok: false; guard: GuardFallido }
  | { ok: true; informe: InformeCanonico }

async function filasDeSolicitud<T extends Fields>(tableId: string, codigo: string) {
  if (!codigo) return []
  return listRecords<T>(tableId, {
    filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
  })
}

/** `null` para ausente. **Nunca** `0`: ver la degradación del valor destacado. */
function numeroONull(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function texto(valor: unknown): string {
  return valor === null || valor === undefined ? '' : String(valor)
}

/**
 * Productor puro: dada la solicitud ya autorizada, arma el modelo canónico. No
 * hace guard —eso es `lecturaInforme`— para que el test lo ejercite mockeando
 * sólo `listRecords`, igual que el candado de `lectura-datos.test.ts`.
 */
export async function construirInforme(id: string, s: Fields): Promise<InformeCanonico> {
  const codigo = String(s.codigo_solicitud ?? '')

  const [datos, unidades, items, comparables, adjuntos, generados, legales] =
    await Promise.all([
      filasDeSolicitud<Fields>(TABLE_IDS.datosTasacion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.unidades, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.itemsCuadroValoracion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.comparables, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.adjuntos, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.documentosGenerados, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.documentosLegales, codigo),
    ])

  const d = datos[0]?.fields ?? {}
  const l = legales[0]?.fields ?? {}

  /* --- Versión vigente · CI-024 -------------------------------------- */
  const vigente =
    generados.find((g) => g.fields.es_vigente === true) ??
    [...generados].sort(
      (a, b) =>
        Number(b.fields.version_doc ?? b.fields.version ?? 0) -
        Number(a.fields.version_doc ?? a.fields.version ?? 0)
    )[0]

  const versionVigente: VersionVigente | null = vigente
    ? {
        version: numeroONull(vigente.fields.version_doc ?? vigente.fields.version),
        urlPdf: texto(vigente.fields.url_pdf || vigente.fields.url_dropbox) || null,
        generadoEn: texto(vigente.fields.generado_en || vigente.fields.fecha_generacion),
        plantillaVersion: texto(vigente.fields.plantilla_version),
      }
    : null

  /* --- Bloque 2 · valor destacado ------------------------------------ */
  // Cap rate ALMACENADO: override manual del tasador o el que trae la captura.
  // NO se computa desde `valorReferenciaClp` (CI-023 §1 · CI-063).
  const valorUf =
    numeroONull(s.valor_final_override) ?? numeroONull(s.valor_comercial_uf)
  const capRate =
    numeroONull(s.tasa_cap_rate_override) ?? numeroONull(d.tasa_cap_rate)
  const valorDestacado: ValorDestacado = {
    valorUf,
    capRate,
    esOverride: numeroONull(s.valor_final_override) !== null,
    ufDiaVisita: numeroONull(s.uf_dia_visita),
  }

  /* --- Bloque 6 · comparables y promedio homogeneizado --------------- */
  const filasComparables = comparables.map((c) => {
    const f = c.fields
    const supConstruida = numeroONull(f.sup_construccion_m2)
    const precioUf = numeroONull(f.precio_uf)
    const ufM2 = supConstruida && precioUf ? precioUf / supConstruida : null

    const factor =
      (numeroONull(f.factor_sup) ?? 1) *
      (numeroONull(f.factor_edad) ?? 1) *
      (numeroONull(f.factor_distancia) ?? 1)

    return {
      id: c.id,
      direccion: texto(f.direccion),
      comuna: texto(f.comuna_comparable),
      supTerreno: numeroONull(f.sup_terreno_m2),
      supConstruida,
      precioUf,
      anio: numeroONull(f.anio),
      tipoReferencia: texto(f.tipo_referencia),
      ufM2,
      ufM2Homogeneizado: ufM2 === null ? null : ufM2 * factor,
    }
  })

  const homogeneizados = filasComparables
    .map((c) => c.ufM2Homogeneizado)
    .filter((v): v is number => v !== null)

  const promedioUfM2 =
    homogeneizados.length > 0
      ? homogeneizados.reduce((a, b) => a + b, 0) / homogeneizados.length
      : null

  /* --- Bloque 7 · conteo real por categoría -------------------------- */
  const fotos = adjuntos.filter((a) => texto(a.fields.tipo_adjunto).startsWith('foto'))
  const porCategoria: Record<string, number> = {}
  for (const foto of fotos) {
    const categoria =
      texto(foto.fields.descripcion) || texto(foto.fields.tipo_adjunto) || 'otro'
    porCategoria[categoria] = (porCategoria[categoria] ?? 0) + 1
  }

  /* --- Bloque 8 · overrides ------------------------------------------ */
  const overrides = [
    { campo: 'Tasa cap rate', valor: numeroONull(s.tasa_cap_rate_override) },
    { campo: 'Vida útil', valor: numeroONull(s.vida_util_override) },
    { campo: 'Valor final', valor: numeroONull(s.valor_final_override) },
  ].filter((o) => o.valor !== null)

  const bloques: Bloque[] = [
    {
      numero: 1,
      id: 'cabecera',
      titulo: 'Cabecera',
      vacio: false,
      datos: {
        codigo,
        codigoExt: texto(s.codigo_ext),
        nuevoUsado: texto(s.tipo_propiedad_nuevo_usado),
        cliente: s.cliente ?? [],
        direccion: texto(s.direccion),
        comuna: s.comuna ?? [],
        // Regla T-B: el informe declara la fecha REAL, no la planificada.
        fechaVisita: texto(s.fecha_visita),
        version: versionVigente?.version ?? null,
      },
    },
    {
      numero: 2,
      id: 'valor',
      titulo: 'Valor de tasación',
      vacio: valorUf === null,
      datos: {
        valorUf,
        capRate,
        /** `true` si el monto mostrado es el override manual del tasador. */
        esOverride: numeroONull(s.valor_final_override) !== null,
        ufDiaVisita: numeroONull(s.uf_dia_visita),
      },
    },
    {
      numero: 3,
      id: 'antecedentes',
      titulo: 'Antecedentes de la propiedad',
      vacio: datos.length === 0,
      datos: {
        supTerrenoM2: numeroONull(d.sup_terreno_m2),
        supConstruccionM2: numeroONull(d.sup_construccion_m2),
        supPrimerPisoM2: numeroONull(d.sup_primer_piso_m2),
        supConstruidaTotal: numeroONull(d.sup_construida_total),
        anioConstruccion: numeroONull(d.anio_construccion),
        materialPredominante: texto(d.material_predominante),
        calidadConstruccion: numeroONull(d.calidad_construccion),
        estadoConservacion: texto(d.estado_conservacion),
        agrupacion: texto(d.agrupacion_propiedad),
        dormitorios: numeroONull(d.dormitorios),
        banos: numeroONull(d.banos),
        estacionamientos: numeroONull(d.estacionamientos),
        bodegas: numeroONull(d.bodegas),
        dfl2: texto(d.dfl2),
      },
    },
    {
      numero: 4,
      id: 'sii',
      titulo: 'Datos SII y avalúo',
      vacio: unidades.length === 0 && datos.length === 0,
      datos: {
        /**
         * ⚠ Vacío por CI-025: `cod_sii_comuna`, `cod_sii_manzana` y
         * `cod_sii_predio` no existen en la base. Se emite la clave con
         * `null` —y no se omite— para que la UI muestre el estado vacío que
         * §10.1 exige en lugar de dejar de renderizar el sub-bloque.
         */
        codigosSii: { comuna: null, manzana: null, predio: null },
        rolSii: texto(s.rol_sii),
        avaluoTotal: numeroONull(d.avaluo_total),
        avaluoFiscalUf: numeroONull(d.avaluo_fiscal_uf),
        avaluoExento: numeroONull(d.avaluo_exento),
        contribucionAnual: numeroONull(d.contribucion_anual),
        calidadSii: texto(d.calidad_sii),
        destinoSii: texto(d.destino_sii),
        porUnidad: unidades.map((u) => ({
          id: u.id,
          numeroUnidad: texto(u.fields.numero_unidad),
          rolSii: texto(u.fields.rol_sii),
          subtipo: texto(u.fields.subtipo),
          supM2: numeroONull(u.fields.sup_m2),
          avaluoUf: numeroONull(u.fields.avaluo_uf),
        })),
      },
    },
    {
      numero: 5,
      id: 'valoracion',
      titulo: 'Cuadro de valoración',
      vacio: items.length === 0,
      datos: {
        items: items.map((i) => ({
          id: i.id,
          orden: numeroONull(i.fields.orden),
          descripcion: texto(i.fields.descripcion),
          tipoItem: texto(i.fields.tipo_item),
          supM2: numeroONull(i.fields.sup_m2),
          ufM2Aplicado: numeroONull(i.fields.uf_m2_aplicado),
          ufTotalItem: numeroONull(i.fields.uf_total_item),
          aportaAGarantia: Boolean(i.fields.aporta_a_garantia),
          situacionMunicipal: texto(i.fields.situacion_municipal),
        })),
        totalUf: items.reduce((suma, i) => suma + (numeroONull(i.fields.uf_total_item) ?? 0), 0),
      },
    },
    {
      numero: 6,
      id: 'comparables',
      titulo: 'Comparables',
      vacio: filasComparables.length === 0,
      datos: {
        comparables: filasComparables,
        promedioUfM2Homogeneizado: promedioUfM2,
        /**
         * Cuántos comparables entraron en el promedio. Puede ser menor que
         * el total: los que no tienen superficie o precio quedan fuera del
         * cálculo pero **sí** se listan en la grilla.
         */
        usadosEnPromedio: homogeneizados.length,
        /** RF-12 exige un mínimo de 3. Se informa; no se bloquea acá. */
        cumpleMinimo: filasComparables.length >= 3,
      },
    },
    {
      numero: 7,
      id: 'fotografico',
      titulo: 'Registro fotográfico',
      vacio: fotos.length === 0,
      datos: {
        total: fotos.length,
        porCategoria,
        fotos: fotos.map((f) => ({
          id: f.id,
          nombre: texto(f.fields.nombre_archivo),
          categoria: texto(f.fields.descripcion) || texto(f.fields.tipo_adjunto),
          url: texto(f.fields.url_dropbox),
        })),
      },
    },
    {
      numero: 8,
      id: 'observaciones',
      titulo: 'Observaciones y overrides',
      vacio: overrides.length === 0 && !texto(d.observaciones_tasador),
      datos: {
        observacionesTasador: texto(d.observaciones_tasador),
        observacionRechazo: texto(s.observacion_rechazo_tasador),
        overrides,
        motivoOverride: texto(s.override_motivo),
        autorOverride: texto(s.override_autor),
        antecedentesLegales: {
          fojas: texto(l.fojas),
          numeroInscripcion: texto(l.numero_inscripcion),
          anoInscripcion: numeroONull(l.ano_inscripcion),
          permisoEdificacion: texto(l.permiso_edificacion_numero),
          recepcionFinal: texto(l.recepcion_final_numero),
        },
      },
    },
  ]

  return {
    id,
    codigo,
    estado: texto(s.estado),
    versionVigente,
    valorDestacado,
    bloques,
  }
}

/**
 * Lectura autorizada del informe canónico. Hace el guard de RF-09
 * (`clerk_user_id === TX_Solicitudes.tasador`, con `mockUserTasador` hasta
 * P11-TAS) y delega en `construirInforme`. El route traduce `{ ok: false }` a la
 * respuesta HTTP con `desdeGuard`; la page trata el fallo como ausencia.
 */
export async function lecturaInforme(id: string): Promise<ResultadoInforme> {
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return { ok: false, guard }
  const informe = await construirInforme(id, guard.fields as Fields)
  return { ok: true, informe }
}
