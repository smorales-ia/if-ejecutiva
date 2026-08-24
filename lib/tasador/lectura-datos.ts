/**
 * Lectura de la captura de terreno —secciones A a H— en la forma
 * `Partial<InformeData>`. **Módulo server-only.**
 *
 * Tanda P7-TAS.A.1. Nace de extraer la proyección del `GET
 * /api/tasaciones/[id]/datos` para que el Server Component de
 * `app/tasaciones/[id]/page.tsx` la consuma **directo**, sin dar el rodeo por
 * HTTP contra su propia app. Es el precedente que fijó
 * `lib/tasador/lectura-tasacion.ts` (CI-030): una sola proyección con dos
 * consumidores —la pantalla y el Route Handler— de modo que no puedan divergir.
 *
 * ⚠ El `server-only` es **convención, no `import 'server-only'`**: ese paquete
 * no está en `package.json`. Ver el docblock de `lectura-tasacion.ts`. Quien
 * importe esto desde un componente cliente rompe el build al arrastrar
 * `lib/airtable-client`.
 *
 * ## La forma devuelta es estructurada, no plana
 *
 * `{ codigo, datos, derivados }` y no un objeto único, porque aplanarlo acá
 * obligaría a mentir en el tipo: `derivados.dfl2` vale `'SI'`/`'NO'` mientras
 * `InformeData.dfl2` es `boolean`, y ni `id` ni `codigo` son claves de
 * `InformeData`. El Route Handler aplana al serializar, que es donde el
 * contrato HTTP —ya publicado— lo exige.
 *
 * ## Tensión de nombre, declarada
 *
 * Un módulo llamado `lectura-datos` exporta dos constantes —`TIPO_RECINTO` y
 * `CATEGORIAS_RECINTO`— que el `PATCH` de la ruta usa para **escribir**. Son
 * tablas de mapeo compartidas por las dos direcciones: el mismo diccionario que
 * traduce Airtable → `InformeData` al leer es el que traduce al revés al
 * escribir, y duplicarlo es exactamente cómo lectura y escritura se
 * desincronizan. `lectura-tasacion.ts` sentó el precedente alojando sus
 * catálogos junto a la proyección. Queda dicho acá; no se resuelve con un
 * archivo más.
 */

import { type AirtableRecord, listRecords } from '@/lib/airtable-client'
import type {
  Comparable,
  InformeData,
  NivelHabitaciones,
  NivelId,
  Recinto,
} from '@/lib/tasador/tasaciones'
import { autorizarSolicitud, type SolicitudFields } from './auth-guard'
import { OPCIONES_CAPTURA, TABLE_IDS } from './field-ids'

type Fields = Record<string, unknown>

/**
 * Filas de una tabla hija que cuelgan de esta solicitud.
 *
 * El Link `solicitud` se evalúa contra el primary field de `TX_Solicitudes`
 * (`codigo_solicitud`), no contra el record id — mismo patrón que
 * `/comparables`. Con `codigo` vacío no se consulta: un `filterByFormula` con
 * cadena vacía devolvería la tabla entera.
 */
export async function filasDeSolicitud<T extends Fields>(
  tableId: string,
  codigo: string
): Promise<AirtableRecord<T>[]> {
  if (!codigo) return []
  return listRecords<T>(tableId, {
    filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
  })
}

/* -------------------------------------------------------------------------
 * Sección D · comparables (RF-12 · A-13)
 * ---------------------------------------------------------------------- */

/**
 * Las columnas de `TX_Comparables` que la sección D muestra.
 *
 * La firma de índice no es decorativa: `filasDeSolicitud<T extends Fields>`
 * exige `Record<string, unknown>`, y sin ella este tipo no satisface la
 * restricción. Deja además pasar las demás columnas de la tabla —`fuente`,
 * `aporta_a_historico`, `oo_cc`— que la proyección ignora a propósito.
 */
export interface ComparableFields {
  [clave: string]: unknown
  direccion?: unknown
  comuna_comparable?: unknown
  sup_terreno_m2?: unknown
  sup_construccion_m2?: unknown
  precio_uf?: unknown
  anio?: unknown
  tipo_referencia?: unknown
  factor_sup?: unknown
  factor_edad?: unknown
  factor_distancia?: unknown
  telefono_contacto?: unknown
  foja?: unknown
  numero?: unknown
}

/**
 * `TX_Comparables.tipo_referencia` (`Oferta` · `CBR`) → `Comparable.fuente`.
 *
 * ⚠ **No es `TX_Comparables.fuente`.** Ese campo existe con un dominio ajeno
 * —de dónde salió el dato, no qué clase de referencia es—. Ver el docblock de
 * `Comparable.fuente` en `tasaciones.ts` y el de la ruta `/comparables`.
 */
const DESDE_TIPO_REFERENCIA: Record<string, Comparable['fuente']> = {
  Oferta: 'oferta',
  CBR: 'cbr',
}

/**
 * Una fila de `TX_Comparables` → `Comparable`.
 *
 * ## Todo sale como `string` (D-5)
 *
 * `Comparable` declara sus numéricos `string` porque nació de inputs
 * controlados del v0. Airtable los devuelve `number`. Antes de CI-056 la ruta
 * `/comparables` devolvía los `number` tal cual **sin estar tipada contra
 * `Comparable`**, de modo que TS no veía el desajuste y nadie lo notaba: la
 * grilla era editable y leía de su propio estado, no de esta proyección. Al
 * hidratar la grilla desde acá el desajuste sí llegaría a la UI, así que la
 * normalización ocurre en este borde, una sola vez.
 *
 * ## Los tres factores se leen aunque no se muestren
 *
 * `factorSup`, `factorEdad` y `factorDistancia` siguen en el tipo por **D-5** y
 * se proyectan por completitud, pero **la sección D no los pinta** (A-18 ·
 * A-44) y el cuadro fotografiado no los trae, así que en la práctica llegan
 * vacíos. Quien los quiera vivos, que reabra A-18 primero.
 *
 * ## `fuente` ante un valor desconocido
 *
 * Cae en `'oferta'`, que es el caso mayoritario, porque el tipo no admite
 * `null`. `tipo_referencia` es un singleSelect de dos opciones: un valor fuera
 * de dominio significa dato roto, no un tercer tipo de referencia. La
 * consecuencia visible es que la fila muestra la columna de teléfono en vez de
 * foja y número — no se pierde ningún dato, se pierde una etiqueta.
 */
export function aComparable(id: string, f: ComparableFields): Comparable {
  const texto = (v: unknown) => (v === null || v === undefined ? '' : String(v))

  return {
    id,
    direccionReferencia: texto(f.direccion),
    comuna: texto(f.comuna_comparable),
    supTerreno: texto(f.sup_terreno_m2),
    supConstruida: texto(f.sup_construccion_m2),
    totalUf: texto(f.precio_uf),
    anio: texto(f.anio),
    fuente: DESDE_TIPO_REFERENCIA[texto(f.tipo_referencia)] ?? 'oferta',
    factorSup: texto(f.factor_sup),
    factorEdad: texto(f.factor_edad),
    factorDistancia: texto(f.factor_distancia),
    telefonoContacto: texto(f.telefono_contacto),
    foja: texto(f.foja),
    numero: texto(f.numero),
  }
}

/**
 * Comparables de una solicitud, ya en la forma que la grilla consume.
 *
 * Dos consumidores —la hidratación de la pantalla y el `GET /comparables`—
 * sobre una sola proyección, mismo criterio que fijó CI-030. Con `codigo`
 * vacío devuelve `[]` sin consultar: ver `filasDeSolicitud`.
 */
export async function comparablesDeSolicitud(codigo: string): Promise<Comparable[]> {
  const filas = await filasDeSolicitud<ComparableFields>(TABLE_IDS.comparables, codigo)
  return filas.map((r) => aComparable(r.id, r.fields))
}

/**
 * `NivelHabitaciones` (10 claves del v0) → `TX_HabitacionesPorNivel.tipo_recinto`
 * (dominio cerrado de 11 valores).
 *
 * ⚠ `walkIn` no tiene equivalente y cae en `Otro`; para no perder qué era, el
 * campo libre `nombre` conserva la etiqueta. `loggia` va a `Lavadero`, que es
 * lo que una logia es en la práctica chilena.
 */
export const TIPO_RECINTO: Record<string, { valor: string; etiqueta: string }> = {
  living: { valor: 'Living', etiqueta: 'Living' },
  estar: { valor: 'Sala', etiqueta: 'Sala de estar' },
  cocina: { valor: 'Cocina', etiqueta: 'Cocina' },
  comedor: { valor: 'Comedor', etiqueta: 'Comedor' },
  dormitoriosSimples: { valor: 'D.Simple', etiqueta: 'Dormitorio simple' },
  suites: { valor: 'Suite', etiqueta: 'Suite' },
  banos: { valor: 'Bano', etiqueta: 'Baño' },
  walkIn: { valor: 'Otro', etiqueta: 'Walk-in closet' },
  escritorio: { valor: 'Estudio', etiqueta: 'Escritorio' },
  loggia: { valor: 'Lavadero', etiqueta: 'Logia' },
}

/** Las tres categorías de `TX_TerminacionesPorRecinto` que `/datos` escribe. */
export const CATEGORIAS_RECINTO = [
  { campo: 'pavimento', categoria: OPCIONES_CAPTURA.categoriaTerminacion.pisos },
  { campo: 'revestimientoMuros', categoria: OPCIONES_CAPTURA.categoriaTerminacion.muros },
  { campo: 'terminacionCielo', categoria: OPCIONES_CAPTURA.categoriaTerminacion.cielos },
] as const

/**
 * Campos calculados por Airtable. **La UI no los edita**: son fórmulas y un
 * PATCH contra ellas devuelve 422. Van agrupados y no sueltos entre los
 * editables justamente para que no se confundan. CI-023 §2.
 */
export interface DerivadosCaptura {
  dfl2: string
  supConstruidaTotal: string
  ingresoLiquidoAnual: string
}

export interface DatosCaptura {
  codigo: string
  datos: Partial<InformeData>
  derivados: DerivadosCaptura
}

/**
 * Proyecta la captura de terreno a partir de la solicitud ya autorizada.
 *
 * Recibe los `fields` que el guard leyó para no volver a pedir el registro: el
 * guard cuesta una lectura y esa lectura se aprovecha (mismo criterio que
 * `autorizarSolicitud`).
 */
export async function proyectarDatosCaptura(fields: SolicitudFields): Promise<DatosCaptura> {
  const codigo = String(fields.codigo_solicitud ?? '')

  const [datos, legales, items, ampliaciones, habitaciones, terminaciones, comparables] =
    await Promise.all([
      filasDeSolicitud<Fields>(TABLE_IDS.datosTasacion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.documentosLegales, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.itemsCuadroValoracion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.ampliaciones, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.habitacionesPorNivel, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.terminacionesPorRecinto, codigo),
      comparablesDeSolicitud(codigo),
    ])

  const d = datos[0]?.fields ?? {}
  const l = legales[0]?.fields ?? {}
  const s = fields as Fields

  const texto = (v: unknown) => (v === null || v === undefined ? '' : String(v))

  /* Niveles: se reconstruye el Record<NivelId, NivelHabitaciones> del v0
     recorriendo las filas y volcando cada `cantidad` en su casilla. */
  const niveles = {} as Record<NivelId, NivelHabitaciones>
  for (const [idNivel, valorNivel] of Object.entries(OPCIONES_CAPTURA.nivel)) {
    const casillas: Record<string, number> = {}
    for (const [clave, mapa] of Object.entries(TIPO_RECINTO)) {
      const fila = habitaciones.find(
        (h) => h.fields.nivel === valorNivel && h.fields.tipo_recinto === mapa.valor
      )
      casillas[clave] = Number(fila?.fields.cantidad ?? 0)
    }
    niveles[idNivel as NivelId] = casillas as unknown as NivelHabitaciones
  }

  /* Recintos: la tabla es larga (una fila por categoría) y el v0 los quiere
     anchos (un objeto por recinto). Se reagrupa por `nombre`. */
  const porRecinto = new Map<string, Record<string, string>>()
  for (const t of terminaciones) {
    const nombre = texto(t.fields.nombre)
    if (!porRecinto.has(nombre)) porRecinto.set(nombre, { id: nombre, nombre })
    const destino = CATEGORIAS_RECINTO.find((c) => c.categoria === t.fields.categoria)
    if (destino) porRecinto.get(nombre)![destino.campo] = texto(t.fields.descripcion)
  }

  return {
    codigo,
    datos: {
      /* --- A --- */
      fechaPlanificadaVisita: texto(s.fecha_visita_programada),
      fechaVisitaReal: texto(s.fecha_visita),
      observacionesTasador: texto(d.observaciones_tasador),
      /* --- B --- */
      supTerreno: texto(d.sup_terreno_m2),
      supConstruida: texto(d.sup_construccion_m2),
      supPrimerPiso: texto(d.sup_primer_piso_m2),
      anioConstruccion: texto(d.anio_construccion),
      estadoConservacion: texto(d.estado_conservacion),
      agrupacionPropiedad: texto(d.agrupacion_propiedad),
      materialPredominante: texto(d.material_predominante),
      calidadConstruccion: Number(d.calidad_construccion ?? 0),
      pisosPropiedad: texto(d.pisos),
      orientacion: d.orientacion ? [String(d.orientacion)] : [],
      numAscensores: texto(d.num_ascensores),
      dormitorios: texto(d.dormitorios),
      banos: texto(d.banos),
      estacionamientos: texto(d.estacionamientos),
      rolesEstacionamientos: texto(d.roles_estacionamientos),
      bodegas: texto(d.bodegas),
      rolesBodegas: texto(d.roles_bodegas),
      servidumbreM2: texto(d.servidumbre_m2),
      velocidadVenta: texto(d.velocidad_venta_estimada),
      tipoZona: texto(d.tipo_zona_descripcion),
      /* --- C --- */
      items: items.map((i) => ({
        id: i.id,
        descripcion: texto(i.fields.descripcion),
        subtipo: texto(i.fields.subtipo),
        rolSii: texto(i.fields.rol_sii),
        anioItem: texto(i.fields.anno_construccion),
        tipo: texto(i.fields.tipo_item),
        situacionMunicipal: texto(i.fields.situacion_municipal),
        estado: texto(i.fields.flag_estado),
        aportaGarantia: Boolean(i.fields.aporta_a_garantia),
        superficieM2: texto(i.fields.sup_m2),
        materialItem: texto(i.fields.material),
        origenSuperficie: '',
      })),
      /*
       * --- D ---
       * Sección de **sólo lectura** desde A-13: la pantalla no captura
       * comparables, los recibe ya proyectados y los muestra. Antes de CI-056
       * esta clave no se hidrataba y el formulario abría con `[]`; mientras la
       * grilla era editable eso no se notaba porque el tasador los tecleaba.
       * Sin esta línea, la grilla de sólo lectura quedaría vacía para siempre y
       * RF-12 no se destrabaría nunca.
       */
      comparables,
      /* --- E --- */
      ampliaciones: ampliaciones.map((a) => ({
        id: a.id,
        nPe: '',
        fechaRecepcion: texto(a.fields.anno_regularizacion),
        m2: texto(a.fields.sup_m2),
        destino: texto(a.fields.descripcion),
      })),
      niveles,
      /**
       * ⚠ Las filas vienen **incompletas respecto de `Recinto`**: `material`,
       * `iluminacion` y `estado` no tienen columna en
       * `TX_TerminacionesPorRecinto` —`estado` es el caso con nombre propio de
       * CI-023— así que el objeto sale sin esas claves. La aserción declara lo
       * que el contrato HTTP ya devuelve hoy; rellenarlas con `''` cambiaría la
       * respuesta de la ruta, que debe quedar byte a byte idéntica.
       */
      recintos: [...porRecinto.values()] as unknown as Recinto[],
      /* --- F --- */
      cbrFoja: texto(l.fojas),
      cbrNumero: texto(l.numero_inscripcion),
      cbrAnio: texto(l.ano_inscripcion),
      nPermisoEdificacion: texto(l.permiso_edificacion_numero),
      fechaPermisoEdif: texto(l.permiso_edificacion_fecha),
      nRecepcionFinal: texto(l.recepcion_final_numero),
      fechaRecepcionFinal: texto(l.recepcion_final_fecha),
      nCertificadoNoExpropiacion: texto(d.n_cert_no_expropiacion),
      coordenadasLat: texto(d.lat),
      coordenadasLng: texto(d.long),
      /* --- G --- */
      tasaCapRateOverride: texto(s.tasa_cap_rate_override),
      vidaUtilOverride: texto(s.vida_util_override),
      valorSugeridoOverride: texto(s.valor_final_override),
      motivoOverride: texto(s.override_motivo),
      /* --- H --- */
      arriendoBrutoClp: texto(d.arriendo_mensual),
      gastoAnualClp: texto(d.gasto_anual),
    },
    derivados: {
      dfl2: texto(d.dfl2),
      supConstruidaTotal: texto(d.sup_construida_total),
      ingresoLiquidoAnual: texto(d.ingreso_liquido_anual),
    },
  }
}

/**
 * Captura de terreno de una solicitud, autorización incluida.
 *
 * Devuelve `null` ante cualquier fallo —guard en rojo o excepción de
 * Airtable—, **mismo contrato que `leerTasacion`**: la pantalla renderiza el
 * formulario con lo que resuelva `resolverInforme` y el tasador no queda ante
 * un error por no tener captura previa, que es el caso normal en la primera
 * apertura.
 */
export async function leerDatosCaptura(id: string): Promise<DatosCaptura | null> {
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) {
    if (guard.status === 500 || guard.status === 502) {
      console.error('[leerDatosCaptura] fallo de infraestructura al leer', id, guard.status)
    }
    return null
  }

  try {
    return await proyectarDatosCaptura(guard.fields)
  } catch (err) {
    console.error('[leerDatosCaptura] no se pudo proyectar la captura de', id, err)
    return null
  }
}
