/**
 * Capa 3 de los Route Handlers de IF-03: validación Zod de todo cuerpo entrante.
 *
 * Tanda P2-TAS · plan §3.1. **Nada se escribe con datos sin validar.**
 *
 * ## Los mensajes son humanos, no de Zod
 *
 * `parsearCuerpo()` nunca devuelve el error crudo de Zod al cliente: §6.5 lo
 * prohíbe explícitamente. Devuelve un literal de `MENSAJES` más, cuando sirve,
 * la lista de campos afectados — que es accionable sin ser técnica.
 *
 * ## Por qué los números viajan como string
 *
 * El formulario de captura los tiene como `value` de inputs controlados. Los
 * schemas aceptan `string` y convierten acá, en el borde, que es donde RO-17
 * manda normalizar: un campo que entra por dos rutas se normaliza una vez.
 */

import { z } from 'zod'
import { MENSAJES, MIN_CARACTERES_OBSERVACION } from '../mensajes'

/* -------------------------------------------------------------------------
 * Piezas reutilizables
 * ---------------------------------------------------------------------- */

/** Número que llega como string desde un input. Vacío → `undefined`, no 0. */
export const numeroDeInput = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') return undefined
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : undefined
  })

/** Fecha `YYYY-MM-DD`. Es el formato que emiten los `<input type="date">`. */
export const fechaIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'formato de fecha')
  .optional()

/* -------------------------------------------------------------------------
 * Schemas por ruta de mutación
 * ---------------------------------------------------------------------- */

/**
 * `POST /api/tasaciones/[id]/rechazo` — RF-TAS-09.
 *
 * El mínimo de 20 caracteres es la única regla de negocio del endpoint. **No
 * toca `estado`** y **no emite aviso al visador** (A-15): eso no se valida acá,
 * se garantiza por lo que la ruta no hace.
 */
export const rechazoSchema = z.object({
  observacion: z
    .string()
    .trim()
    .min(MIN_CARACTERES_OBSERVACION, MENSAJES.observacionCorta),
})

/**
 * `POST /api/tasaciones/[id]/calcular` — RF-TAS-22.
 *
 * Cuerpo vacío a propósito: la transición no lleva parámetros. El schema existe
 * para que la ruta pase por la capa 3 como todas las demás, y para rechazar un
 * cuerpo con basura en vez de ignorarlo.
 */
export const calcularSchema = z.object({}).strict()

/** Un comparable de la grilla de la sección D (RF-12). */
export const comparableSchema = z.object({
  direccionReferencia: z.string().trim().min(1),
  comuna: z.string().trim().optional(),
  supTerreno: numeroDeInput,
  supConstruida: numeroDeInput,
  totalUf: numeroDeInput,
  anio: numeroDeInput,
  /** Se persiste en `tipo_referencia`, **no** en `fuente`. Ver `Comparable.fuente`. */
  fuente: z.enum(['oferta', 'cbr']),
  factorSup: numeroDeInput,
  factorEdad: numeroDeInput,
  factorDistancia: numeroDeInput,
  telefonoContacto: z.string().trim().optional(),
  foja: z.string().trim().optional(),
  numero: z.string().trim().optional(),
})

export const comparableCrearSchema = comparableSchema
export const comparableBorrarSchema = z.object({
  comparableId: z.string().regex(/^rec[a-zA-Z0-9]{14}$/, 'record id'),
})

/* -------------------------------------------------------------------------
 * `PATCH /api/tasaciones/[id]/datos` — secciones A a H (RF-TAS-16 · RF-TAS-17)
 * ---------------------------------------------------------------------- */

/**
 * ## Por qué **todo** es opcional
 *
 * El formulario de captura autoguarda cada 30 s (§2.8) y lo hace por sección:
 * un PATCH que trae sólo la sección B es legítimo y frecuente. Un schema con
 * campos requeridos rechazaría el autoguardado de una sección mientras las
 * otras están a medio llenar, que es el estado normal durante una visita.
 *
 * Los obligatorios de negocio —la fecha real de visita (Regla T-B), el mínimo
 * de 3 comparables (RF-12), el motivo de override de 20 caracteres— **no se
 * validan acá**: se validan al pedir el cálculo, que es la transición donde
 * importan. `/calcular` es su lugar, no el autoguardado.
 *
 * ## Lo que este schema deliberadamente **no** rechaza
 *
 * Acepta los 23 identificadores de `CAMPOS_SIN_DESTINO`. Rechazarlos rompería
 * el autoguardado del formulario, que manda el `InformeData` entero. La ruta
 * los descarta y los devuelve en `noPersistidos[]`, para que la UI pueda
 * decir qué no se guardó. Es la diferencia entre ignorar en silencio y
 * declarar: lo primero es el fallo que CI-023 documenta, lo segundo es esto.
 */

/** Ítem del cuadro de valoración (sección C). */
export const itemValoracionSchema = z.object({
  id: z.string().optional(),
  descripcion: z.string().trim().optional(),
  subtipo: z.string().trim().optional(),
  rolSii: z.string().trim().optional(),
  anioItem: numeroDeInput,
  tipo: z.string().trim().optional(),
  situacionMunicipal: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  aportaGarantia: z.boolean().optional(),
  /** ⚠ Sin columna destino — CI-023 §1. Se acepta y no se persiste. */
  origenSuperficie: z.string().trim().optional(),
  superficieM2: numeroDeInput,
  materialItem: z.string().trim().optional(),
})

/** Ampliación declarada (sección E.1). */
export const ampliacionSchema = z.object({
  id: z.string().optional(),
  /** ⚠ Sin columna destino — CI-023 §1. */
  nPe: z.string().trim().optional(),
  fechaRecepcion: z.string().trim().optional(),
  m2: numeroDeInput,
  destino: z.string().trim().optional(),
})

/** Terminaciones de un recinto (sección E.3). Se expande a 3 filas — RO-31. */
export const recintoSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().trim().optional(),
  pavimento: z.string().trim().optional(),
  revestimientoMuros: z.string().trim().optional(),
  terminacionCielo: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  /** ⚠ Los dos sin categoría destino — CI-023 §3. */
  material: z.string().trim().optional(),
  iluminacion: z.string().trim().optional(),
})

/** Conteo de recintos de un nivel (sección E.2). */
export const nivelHabitacionesSchema = z.object({
  living: numeroDeInput,
  estar: numeroDeInput,
  cocina: numeroDeInput,
  comedor: numeroDeInput,
  dormitoriosSimples: numeroDeInput,
  suites: numeroDeInput,
  banos: numeroDeInput,
  walkIn: numeroDeInput,
  escritorio: numeroDeInput,
  loggia: numeroDeInput,
})

export const datosPatchSchema = z
  .object({
    /* --- A · Visita · Regla T-B: dos fechas que nunca se colapsan --- */
    fechaPlanificadaVisita: fechaIso,
    fechaVisitaReal: fechaIso,
    observacionesTasador: z.string().trim().optional(),

    /* --- B · Datos de la propiedad --- */
    supTerreno: numeroDeInput,
    supConstruida: numeroDeInput,
    supPrimerPiso: numeroDeInput,
    anioConstruccion: numeroDeInput,
    estadoConservacion: z.string().trim().optional(),
    agrupacionPropiedad: z.string().trim().optional(),
    materialPredominante: z.string().trim().optional(),
    calidadConstruccion: numeroDeInput,
    pisosPropiedad: numeroDeInput,
    orientacion: z.array(z.string()).optional(),
    numAscensores: numeroDeInput,
    dormitorios: numeroDeInput,
    banos: numeroDeInput,
    estacionamientos: numeroDeInput,
    rolesEstacionamientos: z.string().trim().optional(),
    bodegas: numeroDeInput,
    rolesBodegas: z.string().trim().optional(),
    servidumbreM2: numeroDeInput,
    velocidadVenta: z.string().trim().optional(),
    tipoZona: z.string().trim().optional(),
    /** ⚠ Fórmula read-only en Airtable — CI-023 §2. Se acepta y se descarta. */
    dfl2: z.boolean().optional(),
    /** ⚠ Los seis sin columna destino — CI-023 §1. */
    piso: z.string().trim().optional(),
    subterraneos: z.string().trim().optional(),
    edificioNombre: z.string().trim().optional(),
    condominioNombre: z.string().trim().optional(),
    mediosBanos: z.string().trim().optional(),
    banoServicio: z.string().trim().optional(),

    /* --- C · Cuadro de valoración --- */
    items: z.array(itemValoracionSchema).optional(),

    /* --- E · Niveles · Terminaciones · Comodidades --- */
    ampliaciones: z.array(ampliacionSchema).optional(),
    niveles: z.record(z.string(), nivelHabitacionesSchema).optional(),
    recintos: z.array(recintoSchema).optional(),
    /** ⚠ Los seis sin categoría destino — CI-023 §1. */
    estructuraSoportante: z.string().trim().optional(),
    divisionesInteriores: z.string().trim().optional(),
    entrepisos: z.string().trim().optional(),
    cubierta: z.string().trim().optional(),
    revestimientoExterior: z.string().trim().optional(),
    cierrosExteriores: z.string().trim().optional(),
    /** ⚠ Sin tabla destino desde P1-TAS (`TX_Amenities` no existe). */
    comodidades: z.record(z.string(), z.boolean()).optional(),
    ventanas: z.array(z.string()).optional(),
    sanitarios: z.string().trim().optional(),
    griferia: z.string().trim().optional(),
    mueblesCocina: z.string().trim().optional(),
    puertaPrincipal: z.string().trim().optional(),
    closetMural: z.boolean().optional(),
    proteccionesRejas: z.boolean().optional(),

    /* --- F · Documentos legales --- */
    cbrFoja: z.string().trim().optional(),
    cbrNumero: z.string().trim().optional(),
    cbrAnio: numeroDeInput,
    nPermisoEdificacion: z.string().trim().optional(),
    fechaPermisoEdif: fechaIso,
    nRecepcionFinal: z.string().trim().optional(),
    fechaRecepcionFinal: fechaIso,
    nCertificadoNoExpropiacion: z.string().trim().optional(),
    coordenadasLat: numeroDeInput,
    coordenadasLng: numeroDeInput,
    /** ⚠ Los ocho sin columna destino — CI-023 §1. */
    vendedor: z.string().trim().optional(),
    comprador: z.string().trim().optional(),
    notaria: z.string().trim().optional(),
    repertorio: z.string().trim().optional(),
    selloSec: z.string().trim().optional(),
    selloSecId: z.string().trim().optional(),
    selloSecVencimiento: z.string().trim().optional(),
    afectoExpropiacion: z.boolean().optional(),

    /* --- G · Overrides (CU-007) --- */
    tasaCapRateOverride: numeroDeInput,
    vidaUtilOverride: numeroDeInput,
    /** Persiste en `valor_final_override`, no en un campo homónimo. */
    valorSugeridoOverride: numeroDeInput,
    motivoOverride: z.string().trim().optional(),

    /* --- H · Rentabilidad --- */
    /** Mensual. Persiste en `arriendo_mensual` — CI-023 §4. */
    arriendoBrutoClp: numeroDeInput,
    gastoAnualClp: numeroDeInput,
    /** ⚠ Sin columna destino — CI-023 §1. Denominador del cap rate. */
    valorReferenciaClp: numeroDeInput,
  })
  .partial()

export type DatosPatch = z.infer<typeof datosPatchSchema>

/**
 * Campos que el schema acepta y la ruta **no** persiste, porque no tienen
 * columna destino en ninguna de las seis tablas (**CI-023 §1**).
 *
 * ## El número: 23 acá, 26 en la ficha. No es una discrepancia
 *
 * CI-023 §1 lista **26 identificadores** huérfanos. Cinco de ellos son
 * **sub-campos** de una colección —`Recinto.material`, `Recinto.iluminacion`,
 * `Recinto.estado`, `Ampliacion.nPe` e `ItemValoracion.origenSuperficie`— y no
 * son claves de primer nivel del payload, así que no pueden aparecer en una
 * lista que se cruza contra `Object.keys(body)`. Quedan 21, más `dfl2` (tiene
 * columna, pero es fórmula) y `comodidades` (sin tabla destino desde P1-TAS):
 * **23**.
 *
 * ⚠ Si esta lista y la ficha vuelven a discrepar, contar **identificadores**,
 * no filas de tabla: la fila `selloSec` de CI-023 agrupa tres en una línea, y
 * ése fue el origen del conteo equivocado que la ficha arrastró.
 *
 * Se declaran acá, en un solo lugar, y la ruta los devuelve en
 * `noPersistidos[]` intersecándolos con lo que realmente vino en el cuerpo.
 * Cuando P7-TAS resuelva dónde persisten, esta lista se vacía y la ruta no
 * cambia de forma.
 *
 * ⚠ `dfl2` está acá por otra razón: sí tiene columna, pero es una **fórmula**.
 * El efecto para el cliente es el mismo —no se guarda lo que mandó— así que se
 * reporta por el mismo canal.
 */
export const CAMPOS_SIN_DESTINO: readonly string[] = Object.freeze([
  // Sección B
  'piso',
  'subterraneos',
  'edificioNombre',
  'condominioNombre',
  'mediosBanos',
  'banoServicio',
  'dfl2',
  // Sección E
  'estructuraSoportante',
  'divisionesInteriores',
  'entrepisos',
  'cubierta',
  'revestimientoExterior',
  'cierrosExteriores',
  'comodidades',
  // Sección F
  'vendedor',
  'comprador',
  'notaria',
  'repertorio',
  'selloSec',
  'selloSecId',
  'selloSecVencimiento',
  'afectoExpropiacion',
  // Sección H
  'valorReferenciaClp',
])

/* -------------------------------------------------------------------------
 * Parseo
 * ---------------------------------------------------------------------- */

export type ResultadoParseo<T> =
  | { ok: true; datos: T }
  | { ok: false; mensaje: string; campos: string[] }

/**
 * Parsea el body de una `Request` contra un schema.
 *
 * Un JSON malformado se trata igual que un JSON inválido: el usuario no
 * distingue los dos casos y el mensaje es el mismo.
 */
export async function parsearCuerpo<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<ResultadoParseo<z.infer<T>>> {
  let crudo: unknown
  try {
    crudo = await request.json()
  } catch {
    return { ok: false, mensaje: MENSAJES.datosInvalidos, campos: [] }
  }

  const resultado = schema.safeParse(crudo)
  if (resultado.success) return { ok: true, datos: resultado.data }

  const campos = resultado.error.issues.map((i) => i.path.join('.')).filter(Boolean)

  // Un schema con un solo campo y mensaje propio (rechazo) merece decir el suyo:
  // "Describe con más detalle…" es más útil que "Revisa los datos".
  const primero = resultado.error.issues[0]
  const mensaje =
    resultado.error.issues.length === 1 && primero.message.length > 20
      ? primero.message
      : MENSAJES.datosInvalidos

  return { ok: false, mensaje, campos }
}
