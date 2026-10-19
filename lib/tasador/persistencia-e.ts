/**
 * Cómo se guarda la sección E (19-oct-2026, decisión de Sergio: campo JSON único).
 *
 * `TX_DatosTasacion.seccion_e_json` (`fldV7tQurz3mnxBpO`) es la **fuente** de la
 * sección E: un solo escritor (`PATCH /api/tasaciones/[id]/datos`), idempotente,
 * con la forma de `SeccionE`. Desde ese mismo payload se derivan las filas de
 * las tablas hijas que ya leen el informe y AT03 —habitaciones por nivel,
 * ampliaciones y terminaciones—, así que el dato es uno y el mismo en todas
 * partes.
 *
 * Funciones puras: la ruta les agrega el Link `solicitud` y hace el sync
 * destructivo por clave (RO-31).
 */

import {
  ELEMENTOS_E,
  FILAS_AMPLIACION,
  NIVELES_E,
  RECINTOS_E,
  TIPOS_HABITACION,
  COMODIDADES_E,
  type SeccionE,
  type SiNo,
  type TipoHabitacion,
} from './antecedentes-e'
import { OPCIONES_CAPTURA } from './field-ids'

/**
 * `TX_HabitacionesPorNivel.tipo_recinto` de cada tipo de la hoja. Todas son
 * opciones existentes del singleSelect (verificado vía meta API el
 * 19-oct-2026); el escritorio va como `Estudio`, que es la opción que hay.
 */
export const TIPO_RECINTO_AIRTABLE: Record<TipoHabitacion, string> = {
  comedor: 'Comedor',
  living: 'Living',
  estar: 'Sala',
  hall: 'Hall',
  suite: 'Suite',
  dormSimple: 'D.Simple',
  dormServicio: 'D.Servicio',
  cocina: 'Cocina',
  escritorio: 'Estudio',
  banos: 'Bano',
  medioBano: '1/2 Baño',
  banoServicio: 'B.Servicio',
  loggia: 'Lavadero',
  otros: 'Otro',
}

/** Categorías de `TX_TerminacionesPorRecinto.categoria` que se derivan (formato largo). */
const CATEGORIAS: { campo: 'pavimento' | 'muros' | 'cielo'; categoria: string }[] = [
  { campo: 'pavimento', categoria: 'Pisos' },
  { campo: 'muros', categoria: 'Muros' },
  { campo: 'cielo', categoria: 'Cielos' },
]

export interface FilaDerivada {
  clave: string
  fields: Record<string, unknown>
}

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const siNo = (v: unknown): SiNo => (v === 'SI' || v === 'NO' ? v : '')

/** Sufijo de clave estable: sin acentos ni espacios. */
function slug(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/**
 * Deja sólo las claves que la hoja conoce, con el tipo correcto. Es lo que se
 * guarda en el JSON: un payload con claves de más (o de un bundle futuro) no
 * ensucia el campo.
 */
export function normalizarSeccionE(e: Partial<SeccionE>): SeccionE {
  const cantidad = (v: unknown) => {
    const n = Math.trunc(Number(v))
    return Number.isFinite(n) && n > 0 ? n : 0
  }
  return {
    comodidades: Object.fromEntries(COMODIDADES_E.map(({ id }) => [id, siNo(e.comodidades?.[id])])) as SeccionE['comodidades'],
    ampliaciones: Array.from({ length: FILAS_AMPLIACION }, (_, i) => {
      const a = e.ampliaciones?.[i]
      return {
        regulado: siNo(a?.regulado),
        pe: texto(a?.pe),
        rif: texto(a?.rif),
        regulacion: texto(a?.regulacion),
        m2: texto(a?.m2),
      }
    }),
    habitaciones: Object.fromEntries(
      NIVELES_E.map(({ id }) => {
        const nivel = e.habitaciones?.[id]
        const cantidades: Partial<Record<TipoHabitacion, number>> = {}
        for (const { id: tipo } of TIPOS_HABITACION) {
          const n = cantidad(nivel?.cantidades?.[tipo])
          if (n > 0) cantidades[tipo] = n
        }
        return [id, { cantidades, superficieM2: texto(nivel?.superficieM2) }]
      }),
    ) as SeccionE['habitaciones'],
    elementos: Object.fromEntries(
      ELEMENTOS_E.map(({ id }) => {
        const v = e.elementos?.[id]
        return [id, { materialidad: texto(v?.materialidad), calidad: texto(v?.calidad), estado: texto(v?.estado) }]
      }),
    ) as SeccionE['elementos'],
    terminaciones: Object.fromEntries(
      RECINTOS_E.map(({ id }) => {
        const v = e.terminaciones?.[id]
        return [
          id,
          {
            pavimento: texto(v?.pavimento),
            material: texto(v?.material),
            muros: texto(v?.muros),
            cielo: texto(v?.cielo),
            iluminacion: texto(v?.iluminacion),
            estado: texto(v?.estado),
          },
        ]
      }),
    ) as SeccionE['terminaciones'],
  }
}

/** `TX_HabitacionesPorNivel`: una fila por nivel × tipo con cantidad > 0. */
export function filasHabitaciones(e: SeccionE, codigo: string): FilaDerivada[] {
  const filas: FilaDerivada[] = []
  for (const { id: nivel } of NIVELES_E) {
    const valorNivel = OPCIONES_CAPTURA.nivel[nivel]
    for (const { id: tipo, label } of TIPOS_HABITACION) {
      const cantidad = e.habitaciones[nivel].cantidades[tipo] ?? 0
      if (cantidad <= 0) continue
      const tipoRecinto = TIPO_RECINTO_AIRTABLE[tipo]
      filas.push({
        clave: `${codigo}-${valorNivel}-${tipoRecinto}`,
        fields: { nombre: `${valorNivel} · ${label}`, nivel: valorNivel, tipo_recinto: tipoRecinto, cantidad },
      })
    }
  }
  return filas
}

/** Año de cuatro dígitos de un texto (P.E., RIF), o `undefined`. */
const anio = (...xs: string[]) => {
  for (const x of xs) {
    const m = /(19|20)\d{2}/.exec(x)
    if (m) return Number(m[0])
  }
  return undefined
}

/**
 * `TX_Ampliaciones`: una fila por ampliación con algún dato. La clave es la
 * fila de la hoja (1 a 3), que es fija: vaciar la 2 no corre la 3.
 */
export function filasAmpliaciones(e: SeccionE, codigo: string): FilaDerivada[] {
  const filas: FilaDerivada[] = []
  e.ampliaciones.forEach((a, i) => {
    if (!a.regulado && !a.pe && !a.rif && !a.regulacion && !a.m2) return
    const partes = [
      a.regulado && `Regulada: ${a.regulado}`,
      a.pe && `P.E. ${a.pe}`,
      a.rif && `RIF ${a.rif}`,
      a.regulacion && `Regulación ${a.regulacion}`,
    ].filter(Boolean)
    const m2 = Number(a.m2)
    filas.push({
      clave: `${codigo}-amp-${i + 1}`,
      fields: {
        nombre: `Ampliación ${i + 1}`,
        descripcion: partes.join(' · '),
        sup_m2: a.m2 !== '' && Number.isFinite(m2) ? m2 : null,
        anno_regularizacion: anio(a.rif, a.pe, a.regulacion) ?? null,
      },
    })
  })
  return filas
}

/* -------------------------------------------------------------------------
 * Proyecciones al informe (claves de la plantilla Carbone,
 * `docs/_artefactos/carbone/generar_plantilla_met_v2.py`)
 * ---------------------------------------------------------------------- */

/** `cualitativa.constructivas.*`: clave de la plantilla de cada elemento. */
const CLAVE_PLANTILLA_ELEMENTO: Record<(typeof ELEMENTOS_E)[number]['id'], string> = {
  estructuraSoportante: 'estructura',
  divisionesInteriores: 'divisiones',
  entrepisos: 'entrepisos',
  cubierta: 'cubierta',
  revestimientoExterior: 'revestimientoExterior',
  cierrosExteriores: 'cierros',
  obrasComplementarias: 'obrasComplementarias',
  construccionAnexo: 'construccionAnexo',
  aireAcondicionado: 'aireAcondicionado',
  calefaccion: 'calefaccion',
  closetMural: 'closet',
  mueblesCocina: 'mueblesCocina',
  sanitarios: 'sanitarios',
  griferia: 'griferia',
  puertaPrincipal: 'puertaPrincipal',
  ventanas: 'ventanas',
}

/** `cualitativa.comodidades.*`: clave de la plantilla de cada comodidad. */
const CLAVE_PLANTILLA_COMODIDAD: Record<(typeof COMODIDADES_E)[number]['id'], string> = {
  mueblesCocina: 'mueblesCocina',
  comedorDiario: 'comedorDiario',
  patioServicio: 'patioServicio',
  estacionamiento: 'estacionamiento',
  piscina: 'piscina',
  gimnasio: 'gimnasio',
  sauna: 'sauna',
  bodega: 'bodega',
  jardinConformado: 'jardin',
  calefaccion: 'calefaccion',
  alarma: 'alarma',
  proteccionesRejas: 'protecciones',
  aspiracionCentral: 'aspiracion',
  climatizacion: 'climatizacion',
  purificadorAire: 'purificador',
  corrientesDebiles: 'corrientesDebiles',
}

/** `{estructura, estructuraCalidad, estructuraEstado, …}` para la hoja 3 del informe. */
export function constructivasInforme(e: SeccionE): Record<string, string> {
  const salida: Record<string, string> = {}
  for (const { id } of ELEMENTOS_E) {
    const k = CLAVE_PLANTILLA_ELEMENTO[id]
    const v = e.elementos[id]
    salida[k] = v.materialidad
    salida[`${k}Calidad`] = v.calidad
    salida[`${k}Estado`] = v.estado
  }
  return salida
}

/** `{mueblesCocina: 'SI', …}` — blanco se imprime vacío, como la celda de la hoja. */
export function comodidadesInforme(e: SeccionE): Record<string, string> {
  return Object.fromEntries(COMODIDADES_E.map(({ id }) => [CLAVE_PLANTILLA_COMODIDAD[id], e.comodidades[id]]))
}

/**
 * Terminaciones en el **formato ancho** de la tabla impresa: una fila por
 * recinto con pavimento (`categoria`), material (`descripcion`), muros, cielo,
 * iluminación y estado (`calidad`), que es lo que lee la plantilla.
 */
export function terminacionesInforme(e: SeccionE) {
  return RECINTOS_E.map(({ id, label }) => {
    const t = e.terminaciones[id]
    return {
      id: `e-${id}`,
      nombre: label,
      categoria: t.pavimento,
      descripcion: t.material,
      calidad: t.estado,
      revMuros: t.muros,
      cielo: t.cielo,
      iluminacion: t.iluminacion,
    }
  })
}

/** `TX_TerminacionesPorRecinto`: formato largo, Pisos · Muros · Cielos por recinto. */
export function filasTerminaciones(e: SeccionE, codigo: string): FilaDerivada[] {
  const filas: FilaDerivada[] = []
  for (const { id, label } of RECINTOS_E) {
    for (const { campo, categoria } of CATEGORIAS) {
      const descripcion = e.terminaciones[id][campo]
      if (!descripcion) continue
      filas.push({
        clave: `${codigo}-${slug(label)}-${categoria}`,
        fields: { nombre: label, categoria, descripcion },
      })
    }
  }
  return filas
}
