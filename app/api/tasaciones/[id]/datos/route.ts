/**
 * `GET · PATCH /api/tasaciones/[id]/datos` — secciones A a H del formulario de
 * captura (RF-TAS-16 · RF-TAS-17).
 *
 * Tanda P2-TAS.A · plan §3.1. Es la ruta más grande de IF-03: toca **seis
 * tablas** y es la única que escribe la captura de terreno.
 *
 * | Tabla | Qué lleva | Cómo |
 * |---|---|---|
 * | `TX_DatosTasacion` | 26 escalares de A, B, F y H | upsert por Link `solicitud` |
 * | `TX_Solicitudes` | 2 fechas (Regla T-B) + 4 overrides de G | update acotado |
 * | `TX_DocumentosLegales` | 7 escalares de F | upsert por Link `solicitud` |
 * | `TX_ItemsCuadroValoracion` | sección C | sync destructivo por `clave_natural` |
 * | `TX_Ampliaciones` | sección E.1 | sync destructivo por `clave_ampliacion` |
 * | `TX_HabitacionesPorNivel` | sección E.2 | sync destructivo por `clave_habitacion` |
 * | `TX_TerminacionesPorRecinto` | sección E.3 | sync destructivo por `clave_terminacion` |
 *
 * La sección D (comparables) **no se toca acá**: tiene ruta propia.
 *
 * ## Sync destructivo por `clave_*` — contraste deliberado con `/comparables`
 *
 * Las cuatro hijas se sincronizan borrando: las filas de esta solicitud cuya
 * clave ya no viene en el payload se **eliminan** (`DELETE` real, vía
 * `lib/tasador/airtable-writes.ts`). `/comparables` hace lo contrario — desliga
 * vaciando el Link y conserva la fila.
 *
 * **Justificación: pertenencia a la solicitud vs histórico compartido.** Un
 * comparable alimenta `aporta_a_historico` y le sirve a *otras* tasaciones;
 * borrarlo destruiría un dato ajeno. Una ampliación, un nivel o un recinto
 * pertenecen sólo a esta solicitud, y una fila huérfana sería basura permanente
 * que AT03 leería como dato vigente. La regla general quedó como **RO-31**.
 *
 * ⚠ **La clave es determinista y se deriva server-side.** Nunca se usa el `id`
 * que manda el cliente: el v0 emite identificadores locales y efímeros
 * (`it-new-1`, `amp-3`, `rc-2`) que no son record ids. El formato es
 * `{codigo_solicitud}-{discriminador}`. **Es tentativo**: los campos `clave_*`
 * no están documentados en ninguna parte y parecen ser la clave natural de
 * deduplicación de AT03. Si AT03 espera otro formato, este upsert duplicará
 * filas. Verificar en P7-TAS — anotado en **CI-023 · Notas**.
 *
 * ## Lo que esta ruta NO valida
 *
 * Los obligatorios de negocio —la fecha real de visita (Regla T-B), el mínimo
 * de 3 comparables (RF-12), los 20 caracteres del motivo de override— **no son
 * requeridos acá**. El formulario autoguarda cada 30 s y por sección: durante
 * una visita está a medio llenar casi todo el tiempo, y un autoguardado que
 * rebota por un campo de otra sección es inservible. Esos mínimos se validan en
 * `POST /calcular`, que es la transición donde importan.
 *
 * ## Lo que esta ruta NO persiste — CI-023
 *
 * 23 identificadores de primer nivel de `InformeData` llegan y no se guardan
 * —CI-023 §1 lista 26 huérfanos; cinco son sub-campos de una colección y no
 * claves del payload, ver `CAMPOS_SIN_DESTINO`—, porque no tienen
 * columna destino en ninguna de las seis tablas. Se devuelven en
 * **`noPersistidos[]`**, intersecados con lo que realmente vino en el cuerpo,
 * para que la UI pueda decirlo. La lista vive en `CAMPOS_SIN_DESTINO`
 * (`lib/tasador/validators`). Rechazarlos con 400 rompería el autoguardado, que
 * manda el `InformeData` entero; ignorarlos en silencio es el fallo que CI-023
 * documenta. Se acepta y se declara.
 *
 * Tres casos merecen nombre propio:
 *
 * - **`dfl2` tiene columna pero es una fórmula** (`IF({sup_construida_total} <
 *   140, 'SI', 'NO')`). Un PATCH contra ella devuelve 422. Sale en el GET como
 *   derivado de sólo lectura y entra en `noPersistidos` si el cliente la manda.
 * - **`Recinto.estado` no va a `calidad`.** El v0 lo llena con
 *   `OPCIONES.estadoConservacion` (`Bueno · Regular · Malo`) y `calidad` tiene
 *   dominio `Alto · Medio · Basico`: son ajenos, y `typecast: true` crearía
 *   "Bueno" como opción nueva. Se deja sin escribir.
 * - **La sección H va a `arriendo_mensual` + `gasto_anual`**, no a los campos
 *   homónimos con sufijo `_clp`. La fórmula `ingreso_liquido_anual` usa los
 *   primeros; escribir en los segundos la dejaría en cero en silencio.
 *   **CI-023 §4.**
 *
 * ## Auditoría
 *
 * Toda mutación deja fila en `A_Cambios`. Las colecciones hijas se auditan
 * **contra la solicitud**, con el nombre de la colección en `campo_modificado`:
 * `A_Cambios.tabla_origen` es un `singleSelect` de dominio cerrado que no
 * contiene ninguna tabla hija, y escribir su nombre la crearía por `typecast`.
 * Es **RO-32**, y el precedente es `/comparables`.
 *
 * ## I/O por nombre de campo
 *
 * Se escribe por nombre, no por FIELD_ID, siguiendo el precedente de
 * `/comparables` y de `lib/tasador/auditoria.ts`. Los FIELD_IDs viven en
 * `lib/tasador/field-ids.ts` como contrato estable frente a un renombrado en la
 * UI de Airtable; acá no hay riesgo de colisión porque los homónimos tienen
 * **nombres distintos** (`anio_construccion` vs `anno_construccion`), que es
 * justo lo que los hace peligrosos de elegir y no de escribir.
 */

import type { NextRequest } from 'next/server'
import { type AirtableRecord, createRecord, listRecords, updateRecord } from '@/lib/airtable-client'
import { deleteRecords } from '@/lib/tasador/airtable-writes'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { auditar, derivarCambios, type CambioAuditado } from '@/lib/tasador/auditoria'
import { OPCIONES_CAPTURA, TABLA_ORIGEN, TABLE_IDS } from '@/lib/tasador/field-ids'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'
import {
  CAMPOS_SIN_DESTINO,
  type DatosPatch,
  datosPatchSchema,
  parsearCuerpo,
} from '@/lib/tasador/validators'

export const dynamic = 'force-dynamic'

type Fields = Record<string, unknown>

/* -------------------------------------------------------------------------
 * Lectura de las tablas hijas
 * ---------------------------------------------------------------------- */

/**
 * Filas de una tabla hija que cuelgan de esta solicitud.
 *
 * El Link `solicitud` se evalúa contra el primary field de `TX_Solicitudes`
 * (`codigo_solicitud`), no contra el record id — mismo patrón que
 * `/comparables`. Con `codigo` vacío no se consulta: un `filterByFormula` con
 * cadena vacía devolvería la tabla entera.
 */
async function filasDeSolicitud<T extends Fields>(
  tableId: string,
  codigo: string
): Promise<AirtableRecord<T>[]> {
  if (!codigo) return []
  return listRecords<T>(tableId, {
    filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
  })
}

/* -------------------------------------------------------------------------
 * Sync destructivo · RO-31
 * ---------------------------------------------------------------------- */

interface FilaDeseada {
  clave: string
  fields: Fields
}

interface ResultadoSync {
  creadas: number
  actualizadas: number
  borradas: number
}

/**
 * Deja la tabla hija exactamente con las filas que describe el payload.
 *
 * Crea las claves nuevas, actualiza las que persisten y **borra** las que
 * desaparecieron. El borrado es el punto delicado: ver el docblock del módulo.
 *
 * Las filas existentes sin clave (`clave_*` vacío) se tratan como sobrantes y
 * se borran. Son filas que este endpoint no pudo haber escrito —siempre pone
 * clave— así que o vienen de una carga manual o de un pipeline con otro
 * formato; en ambos casos el sync no puede casarlas y dejarlas vivas las
 * duplicaría en el próximo guardado.
 */
async function sincronizarHijas(
  tableId: string,
  campoClave: string,
  existentes: AirtableRecord<Fields>[],
  deseadas: FilaDeseada[]
): Promise<ResultadoSync> {
  const porClave = new Map<string, AirtableRecord<Fields>>()
  for (const fila of existentes) {
    const clave = String(fila.fields[campoClave] ?? '')
    if (clave) porClave.set(clave, fila)
  }

  const clavesDeseadas = new Set(deseadas.map((d) => d.clave))
  let creadas = 0
  let actualizadas = 0

  for (const fila of deseadas) {
    const existente = porClave.get(fila.clave)
    if (existente) {
      await updateRecord(tableId, existente.id, fila.fields)
      actualizadas++
    } else {
      await createRecord(tableId, { ...fila.fields, [campoClave]: fila.clave })
      creadas++
    }
  }

  const sobrantes = existentes
    .filter((f) => !clavesDeseadas.has(String(f.fields[campoClave] ?? '')))
    .map((f) => f.id)

  const borradas = await deleteRecords(tableId, sobrantes)

  return { creadas, actualizadas, borradas }
}

/* -------------------------------------------------------------------------
 * Mapeos de dominio
 * ---------------------------------------------------------------------- */

/**
 * `NivelHabitaciones` (10 claves del v0) → `TX_HabitacionesPorNivel.tipo_recinto`
 * (dominio cerrado de 11 valores).
 *
 * ⚠ `walkIn` no tiene equivalente y cae en `Otro`; para no perder qué era, el
 * campo libre `nombre` conserva la etiqueta. `loggia` va a `Lavadero`, que es
 * lo que una logia es en la práctica chilena.
 */
const TIPO_RECINTO: Record<string, { valor: string; etiqueta: string }> = {
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
const CATEGORIAS_RECINTO = [
  { campo: 'pavimento', categoria: OPCIONES_CAPTURA.categoriaTerminacion.pisos },
  { campo: 'revestimientoMuros', categoria: OPCIONES_CAPTURA.categoriaTerminacion.muros },
  { campo: 'terminacionCielo', categoria: OPCIONES_CAPTURA.categoriaTerminacion.cielos },
] as const

/** Sufijo de clave estable: sin acentos, sin espacios, apto para un texto corto. */
function slug(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/* -------------------------------------------------------------------------
 * GET
 * ---------------------------------------------------------------------- */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const codigo = String(guard.fields.codigo_solicitud ?? '')

  try {
    const [datos, legales, items, ampliaciones, habitaciones, terminaciones] = await Promise.all([
      filasDeSolicitud<Fields>(TABLE_IDS.datosTasacion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.documentosLegales, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.itemsCuadroValoracion, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.ampliaciones, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.habitacionesPorNivel, codigo),
      filasDeSolicitud<Fields>(TABLE_IDS.terminacionesPorRecinto, codigo),
    ])

    const d = datos[0]?.fields ?? {}
    const l = legales[0]?.fields ?? {}
    const s = guard.fields as Fields

    const texto = (v: unknown) => (v === null || v === undefined ? '' : String(v))

    /* Niveles: se reconstruye el Record<NivelId, NivelHabitaciones> del v0
       recorriendo las filas y volcando cada `cantidad` en su casilla. */
    const niveles: Record<string, Record<string, number>> = {}
    for (const [idNivel, valorNivel] of Object.entries(OPCIONES_CAPTURA.nivel)) {
      const casillas: Record<string, number> = {}
      for (const [clave, mapa] of Object.entries(TIPO_RECINTO)) {
        const fila = habitaciones.find(
          (h) => h.fields.nivel === valorNivel && h.fields.tipo_recinto === mapa.valor
        )
        casillas[clave] = Number(fila?.fields.cantidad ?? 0)
      }
      niveles[idNivel] = casillas
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

    return ok({
      id,
      codigo,
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
      /* --- E --- */
      ampliaciones: ampliaciones.map((a) => ({
        id: a.id,
        nPe: '',
        fechaRecepcion: texto(a.fields.anno_regularizacion),
        m2: texto(a.fields.sup_m2),
        destino: texto(a.fields.descripcion),
      })),
      niveles,
      recintos: [...porRecinto.values()],
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

      /**
       * Campos calculados por Airtable. **La UI no los edita**: son fórmulas y
       * un PATCH contra ellas devuelve 422. Van agrupados y no sueltos entre
       * los editables justamente para que no se confundan. CI-023 §2.
       */
      derivados: {
        dfl2: texto(d.dfl2),
        supConstruidaTotal: texto(d.sup_construida_total),
        ingresoLiquidoAnual: texto(d.ingreso_liquido_anual),
      },
    })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/datos', err)
  }
}

/* -------------------------------------------------------------------------
 * PATCH
 * ---------------------------------------------------------------------- */

/** Campos de `TX_DatosTasacion` que se derivan del payload, omitiendo ausentes. */
function camposDatosTasacion(b: DatosPatch): Fields {
  const f: Fields = {}
  const poner = (campo: string, valor: unknown) => {
    if (valor !== undefined) f[campo] = valor
  }

  poner('observaciones_tasador', b.observacionesTasador)
  poner('sup_terreno_m2', b.supTerreno)
  poner('sup_construccion_m2', b.supConstruida)
  poner('sup_primer_piso_m2', b.supPrimerPiso)
  poner('anio_construccion', b.anioConstruccion)
  poner('estado_conservacion', b.estadoConservacion)
  poner('agrupacion_propiedad', b.agrupacionPropiedad)
  poner('material_predominante', b.materialPredominante)
  poner('calidad_construccion', b.calidadConstruccion)
  poner('pisos', b.pisosPropiedad)
  // ⚠ singleSelect: sólo cabe un valor y el v0 permite N. Se persiste el
  // primero. Que el control pase a selección única —o el campo a
  // multipleSelects— lo decide P7-TAS. CI-023 §5.
  poner('orientacion', b.orientacion?.[0])
  poner('num_ascensores', b.numAscensores)
  poner('dormitorios', b.dormitorios)
  poner('banos', b.banos)
  poner('estacionamientos', b.estacionamientos)
  poner('roles_estacionamientos', b.rolesEstacionamientos)
  poner('bodegas', b.bodegas)
  poner('roles_bodegas', b.rolesBodegas)
  poner('servidumbre_m2', b.servidumbreM2)
  poner('velocidad_venta_estimada', b.velocidadVenta)
  poner('tipo_zona_descripcion', b.tipoZona)
  poner('n_cert_no_expropiacion', b.nCertificadoNoExpropiacion)
  poner('lat', b.coordenadasLat)
  poner('long', b.coordenadasLng)
  // ⚠ NO `arriendo_bruto_clp` / `gasto_anual_clp`. CI-023 §4.
  poner('arriendo_mensual', b.arriendoBrutoClp)
  poner('gasto_anual', b.gastoAnualClp)

  return f
}

/** Campos de `TX_Solicitudes`: las dos fechas de la Regla T-B y los 4 overrides. */
function camposSolicitud(b: DatosPatch): Fields {
  const f: Fields = {}
  const poner = (campo: string, valor: unknown) => {
    if (valor !== undefined) f[campo] = valor
  }

  // Regla T-B: son dos campos distintos y no se colapsan nunca.
  poner('fecha_visita_programada', b.fechaPlanificadaVisita)
  poner('fecha_visita', b.fechaVisitaReal)

  poner('tasa_cap_rate_override', b.tasaCapRateOverride)
  poner('vida_util_override', b.vidaUtilOverride)
  // ⚠ el identificador dice `valorSugerido`; la columna es `valor_final_override`.
  poner('valor_final_override', b.valorSugeridoOverride)
  poner('override_motivo', b.motivoOverride)

  return f
}

/** Campos de `TX_DocumentosLegales` (sección F). */
function camposDocLegales(b: DatosPatch): Fields {
  const f: Fields = {}
  const poner = (campo: string, valor: unknown) => {
    if (valor !== undefined) f[campo] = valor
  }

  poner('fojas', b.cbrFoja)
  poner('numero_inscripcion', b.cbrNumero)
  poner('ano_inscripcion', b.cbrAnio)
  poner('permiso_edificacion_numero', b.nPermisoEdificacion)
  poner('permiso_edificacion_fecha', b.fechaPermisoEdif)
  poner('recepcion_final_numero', b.nRecepcionFinal)
  poner('recepcion_final_fecha', b.fechaRecepcionFinal)

  return f
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const cuerpo = await parsearCuerpo(request, datosPatchSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)

  const b = cuerpo.datos
  const codigo = String(guard.fields.codigo_solicitud ?? '')
  const tocadas: string[] = []
  const cambios: CambioAuditado[] = []

  try {
    /* --- TX_DatosTasacion · upsert ------------------------------------- */
    const camposDatos = camposDatosTasacion(b)
    if (Object.keys(camposDatos).length > 0) {
      const existentes = await filasDeSolicitud<Fields>(TABLE_IDS.datosTasacion, codigo)
      const fila = existentes[0]

      if (fila) {
        await updateRecord(TABLE_IDS.datosTasacion, fila.id, camposDatos)
        cambios.push(
          ...derivarCambios(fila.id, fila.fields, camposDatos, {
            registroNombre: codigo,
            razon: 'Captura de visita desde IF-03 (RF-TAS-17)',
            tablaOrigen: TABLA_ORIGEN.datosTasacion,
          })
        )
      } else {
        const creada = await createRecord<Fields>(TABLE_IDS.datosTasacion, {
          ...camposDatos,
          solicitud: [id],
          origen_dato: OPCIONES_CAPTURA.origenDatoTasacion,
        })
        cambios.push({
          registroId: creada.id,
          registroNombre: codigo,
          campo: 'datos_tasacion',
          valorAnterior: '',
          valorNuevo: 'alta de la fila de captura',
          razon: 'Primera captura de visita desde IF-03 (RF-TAS-17)',
          tablaOrigen: TABLA_ORIGEN.datosTasacion,
        })
      }
      tocadas.push('TX_DatosTasacion')
    }

    /* --- TX_Solicitudes · update acotado ------------------------------- */
    const camposSol = camposSolicitud(b)
    if (Object.keys(camposSol).length > 0) {
      await updateRecord(TABLE_IDS.solicitudes, id, camposSol)
      cambios.push(
        ...derivarCambios(id, guard.fields as Fields, camposSol, {
          registroNombre: codigo,
          razon: 'Captura de visita desde IF-03 (RF-TAS-16)',
          tablaOrigen: TABLA_ORIGEN.solicitudes,
        })
      )
      tocadas.push('TX_Solicitudes')
    }

    /* --- TX_DocumentosLegales · upsert --------------------------------- */
    const camposLeg = camposDocLegales(b)
    if (Object.keys(camposLeg).length > 0) {
      const existentes = await filasDeSolicitud<Fields>(TABLE_IDS.documentosLegales, codigo)
      const fila = existentes[0]

      if (fila) {
        await updateRecord(TABLE_IDS.documentosLegales, fila.id, camposLeg)
      } else {
        await createRecord(TABLE_IDS.documentosLegales, {
          ...camposLeg,
          solicitud: [id],
          clave_doc_legal: `${codigo}-legal`,
          nombre: `Antecedentes legales · ${codigo}`,
        })
      }
      // RO-32: se audita contra la solicitud; el dominio de `tabla_origen` no
      // incluye TX_DocumentosLegales y escribirlo lo crearía por typecast.
      cambios.push({
        registroId: id,
        registroNombre: codigo,
        campo: 'documentosLegales',
        valorAnterior: '',
        valorNuevo: Object.keys(camposLeg).join(', '),
        razon: 'Captura de antecedentes legales desde IF-03 (RF-TAS-16)',
        tablaOrigen: TABLA_ORIGEN.solicitudes,
      })
      tocadas.push('TX_DocumentosLegales')
    }

    /* --- C · TX_ItemsCuadroValoracion ---------------------------------- */
    if (b.items) {
      const existentes = await filasDeSolicitud<Fields>(
        TABLE_IDS.itemsCuadroValoracion,
        codigo
      )
      const deseadas: FilaDeseada[] = b.items.map((item, i) => ({
        clave: `${codigo}-item-${i + 1}`,
        fields: {
          solicitud: [id],
          orden: i + 1,
          descripcion: item.descripcion ?? '',
          subtipo: item.subtipo,
          rol_sii: item.rolSii ?? '',
          sup_m2: item.superficieM2,
          tipo_item: item.tipo,
          anno_construccion: item.anioItem,
          situacion_municipal: item.situacionMunicipal,
          aporta_a_garantia: Boolean(item.aportaGarantia),
          material: item.materialItem,
          // ⚠ `flag_estado`, no `estado_conservacion`: la tabla tiene los dos,
          // con dominios incompatibles (`Bueno·Regular·Malo` vs `B·R·M`).
          flag_estado: item.estado,
          origen_dato: OPCIONES_CAPTURA.origenDatoItem,
          nombre_item: item.descripcion ?? '',
        },
      }))

      const r = await sincronizarHijas(
        TABLE_IDS.itemsCuadroValoracion,
        'clave_natural',
        existentes,
        deseadas
      )
      cambios.push({
        registroId: id,
        registroNombre: codigo,
        campo: 'items',
        valorAnterior: `${existentes.length} ítems`,
        valorNuevo: `${deseadas.length} ítems · +${r.creadas} ~${r.actualizadas} -${r.borradas}`,
        razon: 'Cuadro de valoración desde IF-03 (RF-TAS-16 · sección C)',
        tablaOrigen: TABLA_ORIGEN.solicitudes,
      })
      tocadas.push('TX_ItemsCuadroValoracion')
    }

    /* --- E.1 · TX_Ampliaciones ----------------------------------------- */
    if (b.ampliaciones) {
      const existentes = await filasDeSolicitud<Fields>(TABLE_IDS.ampliaciones, codigo)
      const deseadas: FilaDeseada[] = b.ampliaciones.map((a, i) => ({
        clave: `${codigo}-amp-${i + 1}`,
        fields: {
          solicitud: [id],
          nombre: a.destino || `Ampliación ${i + 1}`,
          descripcion: a.destino ?? '',
          sup_m2: a.m2,
          // ⚠ la columna es `number` (el año) y el v0 manda texto de fecha:
          // se extraen los 4 dígitos del año, o se omite si no los hay.
          anno_regularizacion: /(\d{4})/.exec(a.fechaRecepcion ?? '')?.[1],
        },
      }))

      const r = await sincronizarHijas(
        TABLE_IDS.ampliaciones,
        'clave_ampliacion',
        existentes,
        deseadas
      )
      cambios.push({
        registroId: id,
        registroNombre: codigo,
        campo: 'ampliaciones',
        valorAnterior: `${existentes.length} ampliaciones`,
        valorNuevo: `${deseadas.length} · +${r.creadas} ~${r.actualizadas} -${r.borradas}`,
        razon: 'Ampliaciones desde IF-03 (RF-TAS-16 · sección E.1)',
        tablaOrigen: TABLA_ORIGEN.solicitudes,
      })
      tocadas.push('TX_Ampliaciones')
    }

    /* --- E.2 · TX_HabitacionesPorNivel --------------------------------- */
    if (b.niveles) {
      const existentes = await filasDeSolicitud<Fields>(
        TABLE_IDS.habitacionesPorNivel,
        codigo
      )
      const deseadas: FilaDeseada[] = []

      for (const [idNivel, casillas] of Object.entries(b.niveles)) {
        const valorNivel = OPCIONES_CAPTURA.nivel[idNivel as keyof typeof OPCIONES_CAPTURA.nivel]
        if (!valorNivel || !casillas) continue

        for (const [clave, cantidad] of Object.entries(casillas)) {
          const mapa = TIPO_RECINTO[clave]
          // Sólo se persisten los conteos > 0: una casilla en cero no es un
          // recinto, y crear la fila la volvería indistinguible de una real.
          if (!mapa || !cantidad) continue

          deseadas.push({
            clave: `${codigo}-${valorNivel}-${mapa.valor}`,
            fields: {
              solicitud: [id],
              nombre: `${valorNivel} · ${mapa.etiqueta}`,
              nivel: valorNivel,
              tipo_recinto: mapa.valor,
              cantidad,
            },
          })
        }
      }

      const r = await sincronizarHijas(
        TABLE_IDS.habitacionesPorNivel,
        'clave_habitacion',
        existentes,
        deseadas
      )
      cambios.push({
        registroId: id,
        registroNombre: codigo,
        campo: 'niveles',
        valorAnterior: `${existentes.length} recintos`,
        valorNuevo: `${deseadas.length} · +${r.creadas} ~${r.actualizadas} -${r.borradas}`,
        razon: 'Habitaciones por nivel desde IF-03 (RF-TAS-16 · sección E.2)',
        tablaOrigen: TABLA_ORIGEN.solicitudes,
      })
      tocadas.push('TX_HabitacionesPorNivel')
    }

    /* --- E.3 · TX_TerminacionesPorRecinto ------------------------------ */
    if (b.recintos) {
      const existentes = await filasDeSolicitud<Fields>(
        TABLE_IDS.terminacionesPorRecinto,
        codigo
      )
      const deseadas: FilaDeseada[] = []

      for (const recinto of b.recintos) {
        const nombre = recinto.nombre?.trim()
        if (!nombre) continue

        for (const { campo, categoria } of CATEGORIAS_RECINTO) {
          const descripcion = recinto[campo]
          if (!descripcion) continue

          deseadas.push({
            clave: `${codigo}-${slug(nombre)}-${categoria}`,
            fields: {
              solicitud: [id],
              nombre,
              categoria,
              descripcion,
              // `calidad` se deja sin escribir a propósito: ver el docblock.
            },
          })
        }
      }

      const r = await sincronizarHijas(
        TABLE_IDS.terminacionesPorRecinto,
        'clave_terminacion',
        existentes,
        deseadas
      )
      cambios.push({
        registroId: id,
        registroNombre: codigo,
        campo: 'recintos',
        valorAnterior: `${existentes.length} terminaciones`,
        valorNuevo: `${deseadas.length} · +${r.creadas} ~${r.actualizadas} -${r.borradas}`,
        razon: 'Terminaciones por recinto desde IF-03 (RF-TAS-16 · sección E.3)',
        tablaOrigen: TABLA_ORIGEN.solicitudes,
      })
      tocadas.push('TX_TerminacionesPorRecinto')
    }

    /* --- Auditoría ------------------------------------------------------ */
    // `auditar` no lanza: una auditoría fallida no tumba una mutación ya
    // aplicada. Ver el docblock de `lib/tasador/auditoria.ts`.
    const auditadas = await auditar(cambios)

    /* --- Lo que no se guardó ------------------------------------------- */
    const enviados = new Set(Object.keys(b))
    const noPersistidos = CAMPOS_SIN_DESTINO.filter((c) => enviados.has(c))

    return ok({
      id,
      codigo,
      tablasActualizadas: tocadas,
      cambiosAuditados: auditadas,
      /**
       * Campos que llegaron y no se guardaron por no tener columna destino
       * (CI-023). Vacío es lo esperable una vez P7-TAS resuelva dónde
       * persisten; hasta entonces, la UI puede usarlo para no prometer al
       * tasador que guardó algo que no guardó.
       */
      noPersistidos,
    })
  } catch (err) {
    return desdeExcepcion('PATCH /api/tasaciones/[id]/datos', err)
  }
}
