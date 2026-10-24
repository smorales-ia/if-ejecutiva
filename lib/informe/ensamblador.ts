/**
 * Ensamblador del informe — produce el `InformeContexto` completo por
 * solicitud. Módulo **server-only** (usa `AIRTABLE_TOKEN` vía
 * `lib/airtable-client`; jamás se importa desde un componente cliente).
 *
 * Tanda T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 2.
 *
 * ## Extiende `construirInforme`, no lo reescribe
 *
 * El modelo canónico (`lib/tasador/lectura-informe.ts`, 8 bloques §10.1)
 * sigue siendo el productor de bloques; acá se **suma** lo que el informe
 * final necesita y el canónico no trae:
 *
 * - `TX_Calculos` (los 13 terminales del motor AT03: una fila por fórmula,
 *   `variable_output` → `resultado`).
 * - `H_PreciosUF` (UF y dólar del día de la visita — «1UF=» / «1US$=»).
 * - `TX_Ampliaciones` · `TX_HabitacionesPorNivel` · `TX_TerminacionesPorRecinto`
 *   (sección E, mismo lector `filasDeSolicitud` que usa `/datos`).
 * - Los nombres de los Links (`cliente`, `comuna`, `tasador`, `visador`,
 *   `tipo_informe`, `tipo_propiedad`): la REST API devuelve record IDs, y el
 *   informe imprime nombres. Se resuelven con `getRecord` contra el maestro
 *   (primary field `nombre` en los seis) — mismo patrón que
 *   `lib/dropbox-path-contexto.ts` usa con `M_Clientes`. Un maestro caído
 *   degrada a `null` + hueco, nunca tumba el informe.
 *
 * ## Relecturas deliberadas (y por qué)
 *
 * `construirInforme` lee `TX_DatosTasacion`, `TX_ItemsCuadroValoracion` y
 * `TX_Adjuntos` pero **no expone las filas crudas** — sólo sus proyecciones
 * por bloque. Este módulo las relee porque necesita campos que los bloques no
 * proyectan:
 *
 * - `TX_DatosTasacion`: `arriendo_bruto_mensual_clp`/`gasto_anual_clp` (los
 *   campos que lee el motor — CI-023 §4), `velocidad_venta_estimada`,
 *   `tipo_zona_descripcion`, `pisos`, `orientacion`, `lat`/`long`.
 * - `TX_ItemsCuadroValoracion`: **hallazgo de esta tanda** — las filas que
 *   escribe el motor pueblan la pareja nueva (`nombre_item` · `uf_m2_unitario`
 *   · fórmula `valor_uf`) y dejan vacía la vieja (`descripcion` ·
 *   `uf_m2_aplicado` · `uf_total_item`) que lee el canónico; con 0066 el
 *   `totalUf` canónico daría 0. Acá cada campo cae de la vieja a la nueva
 *   (misma técnica que `version_doc`/`version` en `TX_DocumentosGenerados`).
 * - `TX_Adjuntos`: los anexos son los adjuntos **no**-foto y el bloque 7 sólo
 *   proyecta fotos.
 *
 * ## Campos calculados — los únicos, y con permiso
 *
 * Los agregados del cuadro de comparables (T-PDF-IDENTICO · fix CI-057 de
 * esta capa): promedios **por bloque** (ofertas / CBR, valores > 0 —
 * `promedioSinCeros`, XLSM `Portada!AX34/AX42`), la fila TASACIÓN derivada
 * del cuadro de valoración (`ufM2Construccion` = edificación UF ÷ sup.
 * edificación = UF/m² nuevo × factor depreciación, XLSM `BD59`; el promedio
 * combinado ÷ valor total anterior imprimía 30,91/161%), y
 * `tasacionVsPct = (tasacionFila.ufM2C / promedio.ufM2C − 1) × 100` por
 * bloque. Puente hasta que T2 los persista en el motor (P1-8). La columna
 * US$ de terminales es `CLP ÷ usdDia` (XLSM `BO71`). Todo lo demás se lee,
 * no se computa. La aritmética vive en `lib/informe/fila-tasacion.ts`
 * (RO-05: una sola fuente por número — la comparte el preview del tasador).
 *
 * Columnas por fila y totales del cuadro de valoración (23-oct-2026 · réplica
 * MET-6283): UF/m² = UF/m² nuevo × D.F.; seguro = `valor_seguro_item_uf` ×
 * `M_Clientes.factor_seguro` (la cuenta de `F_SeguroIncendioUF`, por fila);
 * liquidación = UF del ítem × (`valor_liquidacion_uf ÷ valor_comercial_uf` de
 * `TX_Calculos`); y los renglones TOTAL EDIFICACION / OBRAS COMPLEMENTARIAS /
 * TERRENO como `Portada!B59:BV61`. Reglas en `lib/informe/cuadro-valoracion.ts`.
 */

import { getRecord, listRecords } from '@/lib/airtable-client'
import { autorizarSolicitud, type ResultadoGuard } from '@/lib/tasador/auth-guard'
import {
  calidadConstruccionGuardada,
  estadoConservacionGuardado,
} from '@/lib/tasador/defaults-propiedad'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { filasDeSolicitud } from '@/lib/tasador/lectura-datos'
import type { SeccionE } from '@/lib/tasador/antecedentes-e'
import {
  casaNumeroDeDireccion,
  cualitativaDeSeccionI,
  normalizarSeccionI,
  type SeccionI,
} from '@/lib/tasador/antecedentes-i'
import {
  comodidadesInforme,
  constructivasInforme,
  normalizarSeccionE,
  terminacionesInforme,
} from '@/lib/tasador/persistencia-e'
import { construirInforme, leerTerminales, type Bloque } from '@/lib/tasador/lectura-informe'
import { codigoDeZona, componerZona } from '@/lib/tasador/zona'
import {
  codigoEstadoPlanilla,
  codigoMaterialPlanilla,
  factorLiquidacion,
  garantiaPlanilla,
  normalizarRol,
  numerosPorTipo,
  origenSuperficiePlanilla,
  rolImpreso,
  tipoItemImpreso,
  totalesCuadro,
  ufM2Valorado,
  valorLiquidacionItem,
  valorSeguroItem,
} from './cuadro-valoracion'
import { filaTasacionVsPct, promedioSinCeros, ufM2ConstruccionTasacion } from './fila-tasacion'
import { esDocumentoDeAnexo, resolverImagenes, type AnexoResuelto } from './imagenes'
import { aplicarOverridesLocales } from './overrides'
import type {
  BloqueComparablesInforme,
  ColumnasComparables,
  ComparablesInforme,
  CualitativaInforme,
  FilaComparableInforme,
  FotosInforme,
  Hueco,
  InformeContexto,
  ItemCuadroInforme,
} from './tipos'

type Fields = Record<string, unknown>

/**
 * Maestros para resolver nombres de Links. Los seis tienen `nombre` como
 * primary field (verificado vía MCP el 25-sep-2026). TABLE_IDs de
 * `docs/schema-airtable.md` §1 / CLAUDE.md — ninguno se inventó.
 */
const MAESTROS = Object.freeze({
  clientes: 'tblpK7AcYBMH93apK',
  comunas: 'tblyggAfQfq682XHK',
  tasadores: TABLE_IDS.tasadores,
  visadores: 'tbludtgDtHWvt0Q3D',
  tiposInforme: 'tblOcsdiwxQLfD178',
  tiposPropiedad: 'tbl8rxZA14xFIBGU6',
} as const)

/** `null` para ausente. Nunca `0` — misma regla que el modelo canónico. */
function numeroONull(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function texto(valor: unknown): string {
  return valor === null || valor === undefined ? '' : String(valor)
}

/**
 * `TX_DatosTasacion.seccion_e_json` (19-oct-2026) ya normalizado, o `null` si
 * no hay o no se puede leer. Con él existe escritor para constructivas y
 * comodidades, y sus dos huecos P1-1 se retiran **para ese caso**; sin él (una
 * solicitud capturada antes) siguen declarados.
 */
function seccionEDelInforme(valor: unknown): SeccionE | null {
  if (typeof valor !== 'string' || valor.trim() === '') return null
  try {
    return normalizarSeccionE(JSON.parse(valor) as Partial<SeccionE>)
  } catch (err) {
    console.error('[ensamblador] seccion_e_json ilegible', err)
    return null
  }
}

/**
 * `TX_DatosTasacion.antecedentes_json` (23-oct-2026) ya normalizado, con los
 * subterráneos de la sección B que viajan en `datosB`, o `null` si no hay o no
 * se puede leer. Con él existe escritor para la Hoja N°3 (normativa, sector,
 * terreno, emplazamiento, servicios), el detalle de la Hoja 1 y el texto de
 * expropiación, y sus huecos se retiran **para ese caso**.
 */
function seccionIDelInforme(valor: unknown): { seccionI: SeccionI; subterraneos: string } | null {
  if (typeof valor !== 'string' || valor.trim() === '') return null
  try {
    const json = JSON.parse(valor) as { datosB?: { subterraneos?: unknown } }
    return { seccionI: normalizarSeccionI(json), subterraneos: texto(json.datosB?.subterraneos) }
  } catch (err) {
    console.error('[ensamblador] antecedentes_json ilegible', err)
    return null
  }
}

/** Rótulo impreso del Sello SEC (`TX_DocumentosLegales.sello_sec`), como la lista de la planilla. */
const SELLO_SEC_IMPRESO: Record<string, string> = {
  vigente: 'Vigente',
  vencido: 'Vencido',
  no_aplica: 'No Aplica',
}

/** Rutas de hueco que la sección I cierra cuando está guardada. */
const RUTAS_CERRADAS_POR_I: ReadonlySet<string> = new Set([
  'cualitativa.normativa',
  'cualitativa.sector',
  'cualitativa.geometriaTerreno',
  'cualitativa.emplazamiento',
  'cualitativa.servicios',
  'cualitativa.detallePropiedad',
  'textosIA.textoExpropiacion',
])

/**
 * Resuelve el nombre de un Link (`multipleRecordLinks` → primer record ID)
 * contra su maestro. Degrada a `null` ante link vacío, registro inexistente,
 * `nombre` vacío o fallo de red: el nombre de un maestro nunca es motivo para
 * romper el ensamblado — el hueco queda declarado por el llamador.
 */
async function nombreDeLink(tableId: string, link: unknown): Promise<string | null> {
  const id = Array.isArray(link) ? link[0] : null
  if (typeof id !== 'string' || !id) return null
  try {
    const registro = await getRecord<{ nombre?: string }>(tableId, id)
    const nombre = registro?.fields.nombre
    return typeof nombre === 'string' && nombre.trim() !== '' ? nombre : null
  } catch (err) {
    console.error('[ensamblador] maestro irresoluble', tableId, id, err)
    return null
  }
}

/**
 * El cliente del Link: su `nombre` (como `nombreDeLink`) y el `factor_seguro`
 * que lee el motor AT03 de `M_Clientes` — el seguro por fila del cuadro usa el
 * mismo factor. Una sola lectura del maestro; degrada a `null` igual que
 * `nombreDeLink`.
 */
async function clienteDeLink(
  link: unknown,
): Promise<{ nombre: string | null; factorSeguro: number | null }> {
  const id = Array.isArray(link) ? link[0] : null
  if (typeof id !== 'string' || !id) return { nombre: null, factorSeguro: null }
  try {
    const registro = await getRecord<{ nombre?: string; factor_seguro?: number }>(MAESTROS.clientes, id)
    const nombre = registro?.fields.nombre
    return {
      nombre: typeof nombre === 'string' && nombre.trim() !== '' ? nombre : null,
      factorSeguro: numeroONull(registro?.fields.factor_seguro),
    }
  } catch (err) {
    console.error('[ensamblador] maestro irresoluble', MAESTROS.clientes, id, err)
    return { nombre: null, factorSeguro: null }
  }
}

/**
 * Huecos estructurales: datos del gold master **sin productor** hoy,
 * independientes del caso. Se declaran siempre — un caso con el dato poblado
 * a mano (p. ej. el dólar del seed 13-abr) no cierra el hueco: lo cierra el
 * escritor (cron, UI, IF-04…). E-ids y P-ids de la auditoría PARIDAD /
 * ROADMAP.
 */
const HUECOS_ESTRUCTURALES: readonly Hueco[] = Object.freeze([
  {
    ruta: 'textosIA.sintesisPropiedad',
    eIds: ['E-59', 'E-60'],
    pId: 'P0-2',
    motivo: 'Textos redactados sin productor (Claude RN-25/RF-32 en SC09 · T5)',
  },
  {
    ruta: 'textosIA.descripcionSector',
    eIds: ['E-59', 'E-60'],
    pId: 'P0-2',
    motivo: 'Textos redactados sin productor (Claude RN-25/RF-32 en SC09 · T5)',
  },
  {
    ruta: 'textosIA.textoExpropiacion',
    eIds: ['E-57'],
    pId: 'P1-1',
    motivo: 'Plantilla con variables; falta la columna afecto_expropiacion',
  },
  {
    ruta: 'cualitativa.detallePropiedad',
    eIds: ['E-37', 'E-39', 'E-41', 'E-45', 'E-52', 'E-56', 'E-54', 'E-55'],
    pId: 'P1-1',
    motivo: 'La UI captura y descarta (CI-023): sin columnas destino',
  },
  {
    ruta: 'cualitativa.constructivas',
    eIds: ['E-176..E-191'],
    pId: 'P1-1',
    motivo: 'La UI captura y descarta (6 CI-023 + 7 silenciosos): sin columnas',
  },
  {
    ruta: 'cualitativa.comodidades',
    eIds: ['E-207'],
    pId: 'P1-1',
    motivo: '14 switches capturados y descartados; TX_Amenities no existe',
  },
  {
    ruta: 'cualitativa.normativa',
    eIds: ['E-125..E-140'],
    pId: 'P1-2',
    motivo: 'Sin catálogo normativo poblado ni UI (rescate M_Zonificacion en T4)',
  },
  {
    ruta: 'cualitativa.sector',
    eIds: ['E-141..E-146', 'E-148..E-157'],
    pId: 'P1-2',
    motivo: 'Mercado y sector sin UI ni columnas',
  },
  {
    ruta: 'cualitativa.geometriaTerreno',
    eIds: ['E-159..E-165'],
    pId: 'P1-2',
    motivo: 'Forma/pendiente/frente/deslindes sin UI ni columnas',
  },
  {
    ruta: 'cualitativa.emplazamiento',
    eIds: ['E-167..E-175'],
    pId: 'P1-2',
    motivo: 'Emplazamiento cualitativo sin UI ni columnas',
  },
  {
    ruta: 'cualitativa.servicios',
    eIds: ['E-197..E-201'],
    pId: 'P1-2',
    motivo: 'Servicios de la propiedad sin UI ni columnas',
  },
  {
    ruta: 'terminales.usdDia',
    eIds: ['E-103'],
    pId: 'P1-3',
    motivo: 'tipo_cambio_usd sin escritor automático (el cron UF no lo escribe; el valor de 0066 es seed manual)',
  },
  {
    ruta: 'mapa.staticMapUrl',
    eIds: ['E-120'],
    pId: 'P1-4',
    motivo: 'Google Static Maps sin implementación ni API key',
  },
  {
    ruta: 'clienteInforme.logoUrl',
    eIds: ['E-02'],
    pId: 'P1-5',
    motivo: 'C_VariablesCliente sin clientes reales (H9 — la portada MET salió con marca Austral)',
  },
  {
    ruta: 'clienteInforme.nombreRevisor',
    eIds: ['E-114'],
    pId: 'P1-5',
    motivo: 'C_VariablesCliente.nombre_revisor sin valor (H9)',
  },
  {
    ruta: 'comparablesInforme.promedioUfM2',
    eIds: ['E-66..E-68', 'E-73..E-75'],
    pId: 'P1-8',
    motivo: 'Promedios y fila TASACIÓN calculados por el ensamblador, sin persistencia (puente hasta T2)',
  },
  /* `partes.tasador.firmaUrl` dejó de ser hueco estructural en
     T-PDF-E3-GENERICOS: el mecanismo existe (`M_Tasadores.firma_url`, leído
     por el modelo canónico y resuelto en `lib/informe/imagenes.ts`). Un
     tasador sin firma cargada declara el hueco por-caso más abajo (P1-9). */
  {
    ruta: 'partes.fechaVisado',
    eIds: ['E-113'],
    pId: 'P1-9',
    motivo: 'IF-04 (visación) no existe',
  },
  {
    ruta: 'propiedad.vidaUtil',
    eIds: ['E-48', 'E-76', 'E-81'],
    pId: 'P1-9',
    motivo: 'F_VidaUtil existe pero está fuera de la regla v32',
  },
])

/**
 * El bloque 7 canónico viaja dentro de `contexto.canonico` además de alimentar
 * a `resolverImagenes`. Desde el contrato §4 (T-VP0067-IMAGENES) cada foto trae
 * su `thumbnailUrl` como data-URI (~85k chars): dejarlo también en `canonico`
 * re-embebía ~1,3 MB que la plantilla no consume — el webhook de Make capea en
 * 5 MB. Acá se reemplaza por `null` (la clave se conserva: la forma del bloque
 * es contrato, el peso no).
 *
 * Mismo trato (T-PDF-E3-GENERICOS) para lo que el canónico trae desde esta
 * tanda: los thumbnails de `anexosRanuras` y la firma (`firmaTasadorUrl`) ya
 * viajan resueltos en `imagenes.*` / `partes.tasador.firmaUrl` — repetirlos
 * dentro de `canonico` sumaría hasta ~1,3 MB más de data-URIs duplicados.
 */
function aligerarCanonico<
  T extends {
    bloques: Bloque[]
    anexosRanuras: AnexoResuelto[]
    firmaTasadorUrl: string | null
  },
>(informe: T): T {
  return {
    ...informe,
    anexosRanuras: informe.anexosRanuras.map((a) => ({ ...a, thumbnailUrl: null })),
    firmaTasadorUrl: null,
    bloques: informe.bloques.map((b) => {
      if (b.id !== 'fotografico') return b
      const fotos = Array.isArray(b.datos.fotos) ? b.datos.fotos : []
      return {
        ...b,
        datos: {
          ...b.datos,
          fotos: fotos.map((f) => ({ ...(f as Record<string, unknown>), thumbnailUrl: null })),
        },
      }
    }),
  }
}

/** La rama de fallo del guard — lo que `desdeGuard` traduce a HTTP. */
type GuardFallido = Extract<ResultadoGuard, { ok: false }>

export type ResultadoInformeContexto =
  | { ok: false; guard: GuardFallido }
  | { ok: true; contexto: InformeContexto }

/**
 * Productor puro (sin guard): dada la solicitud ya autorizada, ensambla el
 * contexto completo. El test lo ejercita sustituyendo sólo `listRecords` y
 * `getRecord` — mismo candado que `construirInforme`.
 */
export async function construirInformeContexto(
  id: string,
  s: Fields,
): Promise<InformeContexto> {
  const codigo = texto(s.codigo_solicitud)
  const fechaVisita = texto(s.fecha_visita)

  const [informe, datos, items, adjuntos, ampliaciones, habitaciones, terminaciones, t, filasUf] =
    await Promise.all([
      construirInforme(id, s),
      filasDeSolicitud<Fields>(TABLE_IDS.datosTasacion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.itemsCuadroValoracion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.adjuntos, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.ampliaciones, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.habitacionesPorNivel, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.terminacionesPorRecinto, codigo),
      /* Lector compartido de terminales del motor (CI-072): misma fuente que
         el fallback del valor destacado del preview. */
      leerTerminales(codigo),
      /* H_PreciosUF: la fila del día de la visita — mismo lookup que hace el
         guard H3 del motor. Sin fecha de visita no se consulta. `fecha` es
         dateTime en Airtable: la igualdad literal contra "YYYY-MM-DD" devuelve
         0 filas, hay que comparar sobre el día formateado. */
      fechaVisita
        ? listRecords<Fields>(TABLE_IDS.preciosUf, {
            filterByFormula: `DATETIME_FORMAT({fecha},'YYYY-MM-DD')="${fechaVisita.slice(0, 10).replace(/"/g, '\\"')}"`,
          })
        : Promise.resolve([]),
    ])

  const [cliente, comunaNombre, tasadorNombre, visadorNombre, objetivoNombre, tipoPropiedadNombre] =
    await Promise.all([
      clienteDeLink(s.cliente),
      nombreDeLink(MAESTROS.comunas, s.comuna),
      nombreDeLink(MAESTROS.tasadores, s.tasador),
      nombreDeLink(MAESTROS.visadores, s.visador),
      nombreDeLink(MAESTROS.tiposInforme, s.tipo_informe),
      nombreDeLink(MAESTROS.tiposPropiedad, s.tipo_propiedad),
    ])
  const clienteNombre = cliente.nombre

  const d = datos[0]?.fields ?? {}
  const uf = filasUf[0]?.fields ?? {}
  const usdDia = numeroONull(uf.tipo_cambio_usd)
  /** Columna US$: `clp ÷ usdDia` — null-safe (sin dólar del día no hay US$). */
  const usd = (clp: number | null): number | null =>
    clp !== null && usdDia ? clp / usdDia : null
  const ufDiaValor =
    numeroONull(uf.valor_clp) ??
    numeroONull(s.uf_dia_visita) ??
    numeroONull(d.uf_dia_visita)
  const arriendoClp =
    numeroONull(d.arriendo_bruto_mensual_clp) ?? numeroONull(d.arriendo_mensual)
  const arriendoUfMes =
    arriendoClp !== null && ufDiaValor ? arriendoClp / ufDiaValor : null

  /* --- Cuadro: pareja vieja con caída a la nueva (ver docblock) ------ */
  /* Factor de liquidación del motor y origen de superficie de cada unidad
     (por rol): insumos de las columnas por fila (`cuadro-valoracion.ts`). */
  const factorLiq = factorLiquidacion(t('valor_liquidacion_uf'), t('valor_comercial_uf'))
  const origenPorRol = new Map(
    informe.datosSii.porUnidad
      .filter((u) => u.origenSuperficie !== '')
      .map((u) => [normalizarRol(u.rolSii), u.origenSuperficie] as const),
  )
  const itemsOrdenados = items
    .map((i) => ({ i, orden: numeroONull(i.fields.orden) ?? numeroONull(i.fields.item_id) }))
    /* La plantilla imprime por índice [i=0..5]: el orden del array ES el del
       informe (Terreno, Servidumbre, Piso 1, Piscina, Quincho, Cierros —
       `orden`/`item_id` ascendente; Airtable no garantiza orden de listado). */
    .sort((a, b) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER))
  const numeros = numerosPorTipo(itemsOrdenados.map(({ i }) => texto(i.fields.tipo_item)))
  const itemsCuadro: ItemCuadroInforme[] = itemsOrdenados.map(({ i, orden }, n) => {
    const f = i.fields
    const tipoItem = texto(f.tipo_item)
    const ufM2Aplicado = numeroONull(f.uf_m2_aplicado) ?? numeroONull(f.uf_m2_unitario)
    const factorAplicado = numeroONull(f.factor_aplicado)
    const ufTotalItem = numeroONull(f.uf_total_item) ?? numeroONull(f.valor_uf)
    const aportaAGarantia = Boolean(f.aporta_a_garantia)
    const rol = texto(f.rol_sii)
    return {
      id: i.id,
      orden,
      descripcion: texto(f.descripcion) || texto(f.nombre_item),
      tipoItem,
      supM2: numeroONull(f.sup_m2),
      ufM2Aplicado,
      factorAplicado,
      ufTotalItem,
      aportaAGarantia,
      situacionMunicipal: texto(f.situacion_municipal),
      numeroEnTipo: numeros[n],
      tipoImpreso: tipoItemImpreso(tipoItem),
      rolSii: rolImpreso(rol),
      anio: numeroONull(f.anno_construccion),
      codigoMaterial: codigoMaterialPlanilla(texto(f.material)),
      codigoEstado: codigoEstadoPlanilla(texto(f.flag_estado)),
      garantia: garantiaPlanilla(aportaAGarantia),
      origenSuperficie:
        rol.trim() === '' ? '' : origenSuperficiePlanilla(origenPorRol.get(normalizarRol(rol)) ?? ''),
      ufM2: ufM2Valorado(ufM2Aplicado, factorAplicado),
      valorSeguroUf: valorSeguroItem(numeroONull(f.valor_seguro_item_uf), cliente.factorSeguro),
      valorLiquidacionUf: valorLiquidacionItem(ufTotalItem, factorLiq),
    }
  })
  const totalUf =
    itemsCuadro.length > 0
      ? itemsCuadro.reduce((suma, i) => suma + (i.ufTotalItem ?? 0), 0)
      : null

  /* --- Comparables por bloque + fila TASACIÓN (F-2 · CI-057) --------- */
  const bloqueComparables = informe.bloques.find((b) => b.id === 'comparables')!
    .datos as {
    comparables: FilaComparableInforme[]
    promedioUfM2: number | null
    usadosEnPromedio: number
    cumpleMinimo: boolean
  }
  const valorComercialUf =
    t('valor_comercial_uf') ?? informe.valorDestacado.valorUf
  const supConstruccionM2 = numeroONull(d.sup_construccion_m2)
  const supTerrenoM2 = numeroONull(d.sup_terreno_m2)

  /* Fila TASACIÓN — sale del cuadro de valoración, no de los comparables
     (XLSM `AD35..AX35`): Total = valor comercial; UF/m²T = terreno UF ÷ sup.
     terreno; OO.CC. = piscina + obras; UF/m²C = edificación UF ÷ sup.
     edificación (= UF/m² nuevo × factor depreciación — el homologado). Sin
     ítems de edificación cae al puente previo valor total ÷ sup. (F-2). */
  const esTipo = (i: ItemCuadroInforme, ...tipos: string[]) =>
    tipos.some((tp) => i.tipoItem.toLowerCase() === tp.toLowerCase())
  const sumaUf = (filtro: (i: ItemCuadroInforme) => boolean): number | null => {
    const seleccion = itemsCuadro.filter(filtro)
    if (seleccion.length === 0) return null
    return seleccion.reduce((s, i) => s + (i.ufTotalItem ?? 0), 0)
  }
  const terrenoUf = sumaUf((i) => esTipo(i, 'Terreno'))
  const ooccUf = sumaUf((i) => esTipo(i, 'Piscina', 'OO.CC.'))

  const tasacionFila: ColumnasComparables = {
    totalUf: valorComercialUf,
    supTerreno: supTerrenoM2,
    supConstruida: supConstruccionM2,
    oocc: ooccUf,
    ufM2Terreno:
      terrenoUf !== null && supTerrenoM2 ? terrenoUf / supTerrenoM2 : null,
    ufM2Construccion: ufM2ConstruccionTasacion(
      itemsCuadro.map((i) => ({ tipo: i.tipoItem, supM2: i.supM2, ufTotal: i.ufTotalItem })),
      valorComercialUf,
      supConstruccionM2,
    ),
  }

  /* Bloques ofertas / CBR: promedio POR COLUMNA sobre su bloque, valores > 0
     (XLSM `AX34`/`AX42`) — el promedio combinado era el 30,91 del CI-057. */
  const armarBloque = (filas: FilaComparableInforme[]): BloqueComparablesInforme => {
    const numeradas = filas.map((f, i) => ({ ...f, numero: f.numero ?? i + 1 }))
    const promedio: ColumnasComparables = {
      totalUf: promedioSinCeros(numeradas.map((f) => f.precioUf)),
      supTerreno: promedioSinCeros(numeradas.map((f) => f.supTerreno)),
      supConstruida: promedioSinCeros(numeradas.map((f) => f.supConstruida)),
      oocc: promedioSinCeros(numeradas.map((f) => f.oocc)),
      ufM2Terreno: promedioSinCeros(numeradas.map((f) => f.ufM2Terreno)),
      ufM2Construccion: promedioSinCeros(numeradas.map((f) => f.ufM2Construccion)),
    }
    return {
      filas: numeradas,
      promedio,
      tasacionVsPct: filaTasacionVsPct(
        tasacionFila.ufM2Construccion,
        promedio.ufM2Construccion,
      ),
    }
  }
  const ofertas = armarBloque(
    bloqueComparables.comparables.filter((f) => /^oferta/i.test(f.tipoReferencia)),
  )
  const cbr = armarBloque(
    bloqueComparables.comparables.filter((f) => /^cbr/i.test(f.tipoReferencia)),
  )

  const comparablesInforme: ComparablesInforme = {
    filas: bloqueComparables.comparables,
    ofertas,
    cbr,
    tasacionFila,
    /* Espejos de compatibilidad pre-v2 (matriz/consumidores previos). */
    promedioUfM2: ofertas.promedio.ufM2Construccion,
    usadosEnPromedio: bloqueComparables.usadosEnPromedio,
    cumpleMinimo: bloqueComparables.cumpleMinimo,
    tasacionUfM2: tasacionFila.ufM2Construccion,
    tasacionVsPct: ofertas.tasacionVsPct,
  }

  /* --- Fotos (bloque 7 canónico) y anexos (adjuntos no-foto) --------- */
  const fotosCanonicas = informe.bloques.find((b) => b.id === 'fotografico')!
    .datos as unknown as FotosInforme
  /* Ranuras de imagen + grilla, 100 % desde fuentes vivas (plan §4): fotos
     por categoría del bloque 7, anexos por `clave_adjunto` (la resolución
     compartida `informe.anexosRanuras` que también consume el preview) y
     firma del tasador (`informe.firmaTasadorUrl` — punto único de lectura).
     Ver lib/informe/imagenes.ts. */
  const { imagenes, fotos } = resolverImagenes(
    codigo,
    fotosCanonicas,
    informe.anexosRanuras,
    informe.firmaTasadorUrl,
  )
  const anexos = {
    documentos: adjuntos
      .filter((a) => esDocumentoDeAnexo(texto(a.fields.tipo_adjunto), texto(a.fields.clave_adjunto)))
      .map((a) => ({
        id: a.id,
        nombre: texto(a.fields.nombre_archivo),
        tipo: texto(a.fields.tipo_adjunto),
        url: texto(a.fields.url_dropbox),
      })),
  }

  /* --- Habitaciones: vocabulario de la matriz + total ---------------- */
  /* La plantilla filtra `[nivel='Piso1',tipoRecinto='Sala']` etc. con el
     vocabulario del gold master; la captura guarda rótulos XLSM (`Estar`,
     `Baños`, `1/2 Baño`, `B.Servicio`, `Loggia`). Se normaliza acá y se
     completan con 0 los tipos ausentes de cada nivel presente, para que la
     matriz impresa no deje celdas mudas. */
  const TIPO_RECINTO_CANONICO: Record<string, string> = {
    'Estar': 'Sala',
    'Sala': 'Sala',
    'Baños': 'Bano',
    'Bano': 'Bano',
    'Baño': 'Bano',
    '1/2 Baño': 'MedioBano',
    'MedioBano': 'MedioBano',
    'B.Servicio': 'BanoServicio',
    'BanoServicio': 'BanoServicio',
    'Loggia': 'Lavadero',
    'Lavadero': 'Lavadero',
    'Otros': 'Otro',
    'Otro': 'Otro',
    // El singleSelect no tiene «Escritorio»: la sección E lo guarda como `Estudio`.
    'Estudio': 'Escritorio',
  }
  const TIPOS_MATRIZ = [
    'Comedor', 'Living', 'Sala', 'Hall', 'Suite', 'D.Simple', 'D.Servicio',
    'Cocina', 'Escritorio', 'Bano', 'MedioBano', 'BanoServicio', 'Lavadero', 'Otro',
  ]
  const habitacionesNormalizadas = habitaciones.map((h) => {
    const crudo = texto(h.fields.tipo_recinto)
    return {
      id: h.id,
      nivel: texto(h.fields.nivel),
      tipoRecinto: TIPO_RECINTO_CANONICO[crudo] ?? crudo,
      cantidad: numeroONull(h.fields.cantidad),
    }
  })
  const nivelesPresentes = [...new Set(habitacionesNormalizadas.map((h) => h.nivel))]
  const habitacionesPorNivel = [
    ...habitacionesNormalizadas,
    ...nivelesPresentes.flatMap((nivel) =>
      TIPOS_MATRIZ.filter(
        (tp) => !habitacionesNormalizadas.some((h) => h.nivel === nivel && h.tipoRecinto === tp),
      /* Sin cantidad (null): la planilla deja la celda en blanco, no «0»
         (Hoja N°3 de MET-6283: escritorio y otros vacíos). */
      ).map((tp) => ({ id: `relleno-${nivel}-${tp}`, nivel, tipoRecinto: tp, cantidad: null })),
    ),
  ]
  const totalRecintos =
    habitacionesNormalizadas.length > 0
      ? habitacionesNormalizadas.reduce((s, h) => s + (h.cantidad ?? 0), 0)
      : null

  /* --- Sección E guardada (19-oct-2026 · seccion_e_json) ------------- */
  /* Con el JSON, constructivas, comodidades y terminaciones salen de la hoja
     «Antecedentes» capturada; sin él, quedan como antes (null y la tabla). */
  const seccionE = seccionEDelInforme(d.seccion_e_json)

  /* --- Sección I guardada (23-oct-2026 · antecedentes_json) ---------- */
  /* Hoja N°3 (normativa, sector, terreno, emplazamiento, servicios), detalle
     de la Hoja 1 y texto de expropiación. Lo que imprime de otras secciones
     (calidad, estado, DFL-2, zona, sello SEC…) se toma de su fuente, no se
     duplica en el JSON. */
  const guardadaI = seccionIDelInforme(d.antecedentes_json)
  const zonaImpresa = componerZona(codigoDeZona(texto(d.tipo_zona_descripcion), comunaNombre), comunaNombre)
  const hayAmpliacion = seccionE
    ? seccionE.ampliaciones.some((a) => a.regulado || a.pe || a.rif || a.regulacion || a.m2)
    : ampliaciones.length > 0
  const cualitativaI = guardadaI
    ? cualitativaDeSeccionI(guardadaI.seccionI, {
        comuna: comunaNombre ?? '',
        calidadConstructiva: calidadConstruccionGuardada(d.calidad_construccion),
        estadoConservacion: estadoConservacionGuardado(d.estado_conservacion),
        dfl2: texto(d.dfl2),
        subterraneos: guardadaI.subterraneos,
        zona: zonaImpresa,
        casaNumero: casaNumeroDeDireccion(texto(s.direccion)),
        ampliacion: hayAmpliacion ? 'Sí' : 'No',
        selloSec: SELLO_SEC_IMPRESO[informe.observaciones.antecedentesLegales.selloSec] ?? '',
      })
    : null

  /* --- Cualitativa: P1-1/P1-2 salvo lo que traen las secciones E e I --- */
  const cualitativa: CualitativaInforme = {
    normativa: cualitativaI?.normativa ?? null,
    sector: cualitativaI?.sector ?? null,
    geometriaTerreno: cualitativaI?.geometriaTerreno ?? null,
    emplazamiento: cualitativaI?.emplazamiento ?? null,
    constructivas: seccionE ? constructivasInforme(seccionE) : null,
    servicios: cualitativaI?.servicios ?? null,
    comodidades: seccionE ? comodidadesInforme(seccionE) : null,
    detallePropiedad: cualitativaI?.detallePropiedad ?? null,
  }

  const sintesisPropiedad = texto(d.sintesis_descriptiva) || null
  const descripcionSector = texto(d.descripcion_sector) || null

  /* --- Huecos: estructurales + los dependientes del caso ------------- */
  const huecos: Hueco[] = HUECOS_ESTRUCTURALES.filter(
    (h) =>
      (!seccionE || (h.ruta !== 'cualitativa.constructivas' && h.ruta !== 'cualitativa.comodidades')) &&
      (!guardadaI || !RUTAS_CERRADAS_POR_I.has(h.ruta)) &&
      !(h.ruta === 'textosIA.sintesisPropiedad' && sintesisPropiedad) &&
      !(h.ruta === 'textosIA.descripcionSector' && descripcionSector),
  )
  if (imagenes.firma === null) {
    /* El mecanismo existe (M_Tasadores.firma_url · T-PDF-E3-GENERICOS); si
       falta, es un dato de perfil sin cargar — hueco por-caso, no estructural. */
    huecos.push({
      ruta: 'partes.tasador.firmaUrl',
      eIds: ['E-111'],
      pId: 'P1-9',
      motivo: 'Tasador sin firma_url cargada en M_Tasadores (dato de perfil)',
    })
  }
  if (clienteNombre === null) {
    huecos.push({
      ruta: 'clienteInforme.nombre',
      eIds: ['E-05'],
      pId: 'P0-4',
      motivo: 'Link cliente vacío o maestro irresoluble (dato maestro incompleto)',
    })
  }

  const contexto: InformeContexto = {
    meta: {
      codigo,
      codigoExt: texto(s.codigo_ext),
      nOperacionCliente: numeroONull(s.n_operacion_cliente),
      numeroSolicitudCliente: texto(s.numero_solicitud) || null,
      estado: texto(s.estado),
      version: informe.versionVigente?.version ?? null,
      fechaEmision: informe.versionVigente?.generadoEn || null,
    },
    clienteInforme: {
      nombre: clienteNombre,
      logoUrl: null,
      nombreRevisor: null,
    },
    partes: {
      propietario: texto(s.cliente_final_nombre),
      rut: texto(s.cliente_final_rut),
      ejecutivo: texto(s.ejecutivo_solicitante) || null,
      tasador: { nombre: tasadorNombre, firmaUrl: imagenes.firma },
      visador: { nombre: visadorNombre },
      fechaVisita,
      fechaVisado: null,
    },
    propiedad: {
      direccion: texto(s.direccion),
      // Hoja 1: «Dirección» lleva sólo la calle; casa y condominio van en sus
      // propias casillas (Portada!AU4 · AU5 · AU6 de MET-6283).
      calle: texto(s.direccion).split(',')[0].trim(),
      // Hoja 1: «Rol» como la planilla («N°882-40»); `sii.rolSii` queda crudo.
      rolImpreso: rolImpreso(texto(informe.datosSii.rolSii)),
      comuna: comunaNombre,
      region: texto(s.region),
      tipoPropiedad: tipoPropiedadNombre,
      objetivo: objetivoNombre,
      nuevoUsado: texto(s.tipo_propiedad_nuevo_usado),
      proyectoCondominio: texto(s.proyecto_condominio),
      supTerrenoM2: numeroONull(d.sup_terreno_m2),
      supConstruccionM2,
      supPrimerPisoM2: numeroONull(d.sup_primer_piso_m2),
      supConstruidaTotal: numeroONull(d.sup_construida_total),
      anioConstruccion: numeroONull(d.anio_construccion),
      materialPredominante: texto(d.material_predominante),
      // Literales de la planilla (`OPCIONES`), ya no estrellas — 14-oct-2026.
      calidadConstruccion: calidadConstruccionGuardada(d.calidad_construccion),
      estadoConservacion: estadoConservacionGuardado(d.estado_conservacion),
      agrupacion: texto(d.agrupacion_propiedad),
      orientacion: texto(d.orientacion),
      pisos: numeroONull(d.pisos),
      dormitorios: numeroONull(d.dormitorios),
      banos: numeroONull(d.banos),
      estacionamientos: numeroONull(d.estacionamientos),
      bodegas: numeroONull(d.bodegas),
      dfl2: texto(d.dfl2),
      velocidadVentaEstimada: texto(d.velocidad_venta_estimada),
      // `CODIGO(Comuna)` como `[Excel: Impresion!X15]`: se guarda sólo el código
      // y la comuna se agrega acá (spec §2.8.1 · 14-oct-2026). `codigoDeZona`
      // quita antes un «(Comuna)» tecleado en filas viejas, para no imprimir
      // «IPB(Colina)(Colina)». Sin el catálogo a mano, eso también acorta los
      // pocos códigos que terminan en su propia comuna (`ZAP (San José de
      // Maipo)` → `ZAP(San José de Maipo)`), que es el costo aceptado.
      tipoZonaDescripcion: zonaImpresa,
      vidaUtil: numeroONull(s.vida_util_override),
    },
    sii: informe.datosSii,
    cuadro: { items: itemsCuadro, totalUf, totales: totalesCuadro(itemsCuadro) },
    terminales: {
      valorComercialUf,
      valorComercialClp: t('valor_comercial_clp'),
      valorReposicionUf: t('valor_reposicion_uf'),
      valorReposicionClp: t('valor_reposicion_clp'),
      seguroIncendioUf: t('seguro_incendio_uf'),
      seguroIncendioClp: t('seguro_incendio_clp'),
      avaluoFiscalUf: t('avaluo_fiscal_uf'),
      valorRemateUf: t('valor_remate_uf'),
      valorRemateClp: t('valor_remate_clp'),
      valorLiquidacionUf: t('valor_liquidacion_uf'),
      valorLiquidacionClp: t('valor_liquidacion_clp'),
      rentaPerpetuaClp: t('renta_perpetua_clp'),
      ingresoLiquidoAnualClp: t('ingreso_liquido_anual_clp'),
      ufDia: ufDiaValor,
      usdDia,
      fechaUf: filasUf.length > 0 ? texto(uf.fecha) || fechaVisita : null,
      /* Columna US$ (XLSM `= $ ÷ BO71`): CLP terminal ÷ dólar del día. */
      valorReposicionUsd: usd(t('valor_reposicion_clp')),
      seguroIncendioUsd: usd(t('seguro_incendio_clp')),
      avaluoFiscalUsd: usd(numeroONull(d.avaluo_fiscal_clp)),
      valorRemateUsd: usd(t('valor_remate_clp')),
      valorLiquidacionUsd: usd(t('valor_liquidacion_clp')),
    },
    comparablesInforme,
    rentabilidad: {
      /* Los campos *_clp son los que lee el motor; la pareja sin sufijo
         (`arriendo_mensual`/`gasto_anual`) alimenta la fórmula legacy de la
         tabla (CI-023 §4). Se prefiere la del motor y se cae a la otra. */
      arriendoBrutoMensualClp: arriendoClp,
      gastoAnualClp: numeroONull(d.gasto_anual_clp) ?? numeroONull(d.gasto_anual),
      ingresoLiquidoAnualClp: t('ingreso_liquido_anual_clp'),
      rentaPerpetuaClp: t('renta_perpetua_clp'),
      tasaCapRate: informe.valorDestacado.capRate,
      /* «UF/ mes» del análisis de rentabilidad: arriendo CLP ÷ UF del día
         (XLSM: 3.300.000 ÷ 39.894,61 = 82,7). */
      arriendoUfMes: arriendoUfMes,
    },
    textosIA: {
      /* Las dos columnas de TX_DatosTasacion las escribe la sección I del
         tasador (23-oct-2026) y, cuando exista, RF-32 / SC-Textos. El texto de
         expropiación es la fórmula de la planilla sobre la sección I
         (`Portada!BB29`); sin sección I guardada su hueco sigue declarado. */
      sintesisPropiedad,
      descripcionSector,
      textoExpropiacion: cualitativaI?.textoExpropiacion || null,
    },
    cualitativa,
    recintos: {
      ampliaciones: ampliaciones.map((a) => ({
        id: a.id,
        descripcion: texto(a.fields.descripcion),
        supM2: numeroONull(a.fields.sup_m2),
        annoRegularizacion: numeroONull(a.fields.anno_regularizacion),
      })),
      habitacionesPorNivel,
      totalRecintos,
      terminacionesPorRecinto: seccionE
        ? terminacionesInforme(seccionE)
        : terminaciones.map((r) => ({
            id: r.id,
            nombre: texto(r.fields.nombre),
            categoria: texto(r.fields.categoria),
            descripcion: texto(r.fields.descripcion),
            calidad: texto(r.fields.calidad),
            revMuros: texto(r.fields.rev_muros),
            cielo: texto(r.fields.cielo),
            iluminacion: texto(r.fields.iluminacion),
          })),
    },
    fotos,
    anexos,
    imagenes,
    mapa: {
      staticMapUrl: null,
      lat: numeroONull(d.lat),
      long: numeroONull(d.long),
    },
    legales: informe.observaciones.antecedentesLegales,
    huecos,
    canonico: aligerarCanonico(informe),
  }

  /* Overrides locales (datos sin columna — puente de tanda, ver overrides.ts). */
  return aplicarOverridesLocales(contexto)
}

/**
 * Lectura autorizada del contexto: guard RF-09 (`clerk_user_id ===
 * TX_Solicitudes.tasador`) y delegación en `construirInformeContexto` —
 * mismo patrón que `lecturaInforme`. El route traduce `{ ok: false }` con
 * `desdeGuard`.
 */
export async function lecturaInformeContexto(
  id: string,
): Promise<ResultadoInformeContexto> {
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return { ok: false, guard }
  const contexto = await construirInformeContexto(id, guard.fields as Fields)
  return { ok: true, contexto }
}
