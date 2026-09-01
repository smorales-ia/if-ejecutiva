/**
 * Contrato de la coordinación de visita (**RF-TAS-05** · §1.3.2 · Frente C · C3).
 *
 * ## Por qué este módulo no toca Airtable
 *
 * Lo consumen dos lados: el reader server-side (`lib/coordinacion-airtable.ts`)
 * y el bloque de la pestaña Datos, que es `"use client"`. Si acá se importara
 * `lib/airtable-client.ts`, el cliente REST y su lectura de `AIRTABLE_TOKEN`
 * viajarían al bundle del navegador. Misma separación que `lib/decision-motor.ts`
 * frente a `lib/decision-motor-airtable.ts`: acá viven los tipos, los literales
 * de pantalla y el mapeo puro; la lectura vive en el módulo `-airtable`.
 *
 * Los dos tipos del contrato nacieron en `lib/coordinacion-airtable.ts` (C2) y
 * se movieron acá en C3 por esa razón. Ese módulo los re-exporta, así que los
 * llamadores server-side no cambiaron.
 */

import type { CoordinacionVisita, EstadoCoordinacion } from '@/lib/tasaciones'
import { partesEnSantiago, ZONA_VPROPERTY } from '@/lib/sla-habil'

/* -------------------------------------------------------------------------
 * Contrato de `GET /api/solicitudes/[id]/coordinacion`
 * ---------------------------------------------------------------------- */

/**
 * Un intento tal como lo sirve IF-02.
 *
 * Es `CoordinacionVisita` de `lib/tasaciones.ts` con **un solo cambio**:
 * `estado` admite `null`. El tipo de P4-TAS describe lo que IF-03 *escribe* —y
 * IF-03 sólo escribe los dos literales del contrato—, mientras que acá se
 * describe lo que la base *devuelve*, que incluye el caso de un
 * `estado_coordinacion` fuera de dominio (una opción agregada a mano en la UI
 * de Airtable, una fila migrada). Ese caso no se descarta ni se disfraza de
 * desenlace: la fila viaja con `estado: null` y no fija `coordinacionVigente`.
 */
export interface IntentoCoordinacion extends Omit<CoordinacionVisita, 'estado'> {
  estado: EstadoCoordinacion | null
}

export interface CoordinacionSolicitud {
  /** Desenlace del intento más reciente. `null` si no hay intentos (RO-34). */
  coordinacionVigente: EstadoCoordinacion | null
  /** Todos los intentos, del más reciente al más antiguo. */
  intentos: IntentoCoordinacion[]
}

/* -------------------------------------------------------------------------
 * Literales de pantalla (§6.1)
 * ---------------------------------------------------------------------- */

/**
 * Los dos literales viven acá y no en el componente para que el módulo que
 * produce el dato y el que lo muestra no puedan divergir en cómo nombran la
 * ausencia y el fallo (RO-05), igual que `MSG_SIN_DECISION` /
 * `MSG_ERROR_DECISION` en `lib/decision-motor.ts`.
 *
 * La distinción entre los dos importa y es **RO-34**: "todavía no se coordinó"
 * es el curso normal de una solicitud recién asignada, y "no pudimos leer" es un
 * fallo que hay que reintentar. Pintarlos igual los vuelve indistinguibles
 * siendo operativamente opuestos.
 */
export const MSG_SIN_COORDINACION =
  'La visita todavía no se ha coordinado con el propietario.'

export const MSG_ERROR_COORDINACION =
  'No pudimos cargar la coordinación de la visita. Intenta nuevamente en unos segundos.'

/** Lo que se muestra donde no hay dato. Nunca un valor por defecto (RO-34). */
const VACIO = '—'

/* -------------------------------------------------------------------------
 * Resumen para pantalla
 * ---------------------------------------------------------------------- */

/**
 * Las tres variantes visuales del bloque.
 *
 * ⚠ Es un catálogo cerrado **de la UI**, no de Airtable, y por eso no choca con
 * A-17: los dominios que Airtable posee —`motivo`, sobre todo— viajan como
 * `string` sin traducir. Lo único que se decide acá es cuál de las tres caras
 * pinta la sección.
 */
export type VarianteCoordinacion = 'confirmada' | 'rechazada' | 'sin_coordinar'

/** Todo ya resuelto para pintar: el componente no decide nada. */
export interface ResumenCoordinacion {
  variante: VarianteCoordinacion
  /** Literal del badge (§6.1). */
  etiqueta: string
  /** Clases del badge, mismo vocabulario que `ESTADO_CORREO_CLASSES`. */
  tonoClases: string
  /** El intento más reciente, o `null` si no hay ninguno. */
  ultimo: IntentoCoordinacion | null
  /** Ordinal del último intento, o `null`. */
  intentoNumero: number | null
  /** Formateadas para pantalla, o `"—"`. Nunca una fecha inventada (RO-34). */
  fechaRespuesta: string
  fechaVisita: string
  /** Passthrough desde Airtable, sin catálogo local (A-17), o `"—"`. */
  motivo: string
  detalle: string
  nota: string
  /** Cuántos intentos hubo en total. `0` en `sin_coordinar`. */
  totalIntentos: number
}

/**
 * Paleta del badge. Verde y rojo son los del semáforo operacional (§4.4-5); el
 * ámbar de `sin_coordinar` es el **operacional `#d97706`**, no el naranja de
 * marca `#F5A213`, que §4.4 prohíbe colisionar.
 */
const CLASES: Record<VarianteCoordinacion, string> = {
  confirmada: 'bg-green-50 text-[#15803d] border-green-200',
  rechazada: 'bg-red-50 text-[#b91c1c] border-red-200',
  sin_coordinar: 'bg-amber-50 text-[#d97706] border-amber-200',
}

const ETIQUETAS: Record<VarianteCoordinacion, string> = {
  confirmada: 'Confirmada',
  rechazada: 'Rechazada',
  sin_coordinar: 'Sin coordinar',
}

const FORMATO_FECHA_HORA = new Intl.DateTimeFormat('es-CL', {
  timeZone: ZONA_VPROPERTY,
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const

/**
 * `fecha_respuesta` es un `dateTime` ISO: un instante absoluto, que se muestra
 * en el reloj de pared de Santiago y no en la zona del navegador. Misma razón
 * que `lib/sla-cronologia.ts`: la hora en que el tasador llamó tiene que decir
 * lo mismo desde cualquier máquina.
 *
 * `partesEnSantiago` se usa para decidir si el año es ruido —una coordinación
 * casi siempre es de este año— o información —una del año pasado sin el año
 * sería engañosa—.
 */
function instanteVisible(iso: string | undefined, ahora: Date = new Date()): string {
  if (!iso) return VACIO
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return VACIO

  const base = FORMATO_FECHA_HORA.format(d)
  const anio = partesEnSantiago(d).anio
  return anio === partesEnSantiago(ahora).anio ? base : `${base} · ${anio}`
}

/**
 * `fecha_visita_propuesta` es un `date` puro (`"2026-08-25"`): **no es un
 * instante**, es una fecha de calendario, y se formatea partiendo el string.
 *
 * ⚠ **Nunca pasarla por `new Date()`.** `new Date("2026-08-25")` la interpreta
 * como medianoche UTC, que en Santiago (GMT−4/−3) es el **24 a las 20:00**: la
 * visita se mostraría un día antes de la acordada. Es el mismo desfase que
 * `_fechaVisible` de `lib/tasador/lectura-tasacion.ts` documenta en IF-03, y en
 * una fecha de visita el error no es cosmético — manda al tasador el día
 * equivocado.
 */
function fechaCalendarioVisible(valor: string | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor?.trim() ?? '')
  if (!m) return null

  const mes = Number(m[2])
  if (mes < 1 || mes > 12) return null

  return `${Number(m[3])} ${MESES_CORTOS[mes - 1]} ${m[1]}`
}

function textoVisible(valor: string | undefined): string {
  const v = valor?.trim()
  return v ? v : VACIO
}

/**
 * Proyecta la respuesta del endpoint a lo que la sección pinta.
 *
 * ## La variante sale del último intento, no del historial
 *
 * `coordinacionVigente` ya es el estado del intento más reciente —el reader lo
 * define así y lo ordena— y acá sólo se traduce a una de las tres caras. Un
 * último intento con estado fuera de dominio cae a `sin_coordinar` y **no
 * hereda** el `confirmada` de un intento anterior: heredar sería inventar que
 * la visita sigue en pie cuando el dato dice que no se sabe.
 *
 * ## Ausencia
 *
 * `null` de entrada —el hook todavía no resolvió, o falló— devuelve el mismo
 * `sin_coordinar` sin reventar, para que el componente pueda llamar a esta
 * función antes de tener datos. Que la sección distinga *no coordinado* de
 * *no pudimos leer* es responsabilidad del componente, que tiene `error` a mano
 * y los dos literales de arriba.
 */
export function resumirCoordinacion(
  datos: CoordinacionSolicitud | null,
  ahora: Date = new Date()
): ResumenCoordinacion {
  const ultimo = datos?.intentos[0] ?? null
  const variante: VarianteCoordinacion = datos?.coordinacionVigente ?? 'sin_coordinar'

  return {
    variante,
    etiqueta: ETIQUETAS[variante],
    tonoClases: CLASES[variante],
    ultimo,
    intentoNumero: ultimo?.intentoNumero ?? null,
    fechaRespuesta: instanteVisible(ultimo?.fechaRespuesta, ahora),
    // Las dos ramas no se cruzan: una confirmada no muestra motivo y una
    // rechazada no muestra fecha de visita. El reader ya no los puebla, pero
    // filtrar por variante evita que una fila mixta —de una migración, de una
    // edición a mano en Airtable— pinte las dos ramas a la vez.
    fechaVisita:
      variante === 'confirmada'
        ? (fechaCalendarioVisible(ultimo?.fechaVisita) ?? VACIO)
        : VACIO,
    nota: variante === 'confirmada' ? textoVisible(ultimo?.nota) : VACIO,
    motivo: variante === 'rechazada' ? textoVisible(ultimo?.motivo) : VACIO,
    detalle: variante === 'rechazada' ? textoVisible(ultimo?.detalle) : VACIO,
    totalIntentos: datos?.intentos.length ?? 0,
  }
}

/* -------------------------------------------------------------------------
 * Redacción del ítem del timeline (C4 · §1.3.3)
 * ---------------------------------------------------------------------- */

/**
 * Primera línea del ítem de coordinación en el riel del Historial.
 *
 * ## Por qué la redacción vive acá y no en `lib/historial.ts`
 *
 * El conocimiento de qué es una coordinación —sus dos ramas, su `motivo`
 * passthrough, su fecha de calendario que no admite `new Date()`— ya está en
 * este módulo. Duplicarlo del lado del historial sería la segunda fuente de
 * verdad que RO-05 prohíbe: el día que cambie la redacción de una rama,
 * cambiaría en un sitio y no en el otro. `lib/historial.ts` sólo aprende que
 * existe un tercer origen.
 *
 * ## Las tres ausencias no se colapsan (RO-34)
 *
 * - Confirmada **sin** `fecha_visita_propuesta` → `"Visita confirmada"` a secas.
 *   No se inventa una fecha, y menos la de hoy: en el riel se leería como un
 *   compromiso que nadie tomó.
 * - Rechazada **sin** `motivo` → `"Coordinación rechazada"`. El desenlace se
 *   conoce; la causa no, y no se rellena.
 * - `estado: null` (fuera del dominio de Airtable) → título neutro que **no
 *   afirma** ni confirmada ni rechazada. Es lo que el reader ya hace del otro
 *   lado al no fijar `coordinacionVigente`.
 *
 * ## A-17
 *
 * `motivo` entra por concatenación directa, sin catálogo local ni traducción:
 * un motivo agregado hoy desde la UI de Airtable aparece en el riel sin deploy.
 */
export function tituloDeCoordinacion(intento: IntentoCoordinacion): string {
  const base = tituloBase(intento)

  // El ordinal sólo aparece a partir del segundo intento: en una solicitud que
  // se coordinó al primer llamado sería ruido, y en una con tres llamados sin
  // él las filas se leen como duplicados en vez de como intentos distintos.
  return intento.intentoNumero > 1 ? `${base} (intento ${intento.intentoNumero})` : base
}

function tituloBase(intento: IntentoCoordinacion): string {
  if (intento.estado === 'confirmada') {
    const fecha = fechaCalendarioVisible(intento.fechaVisita)
    return fecha ? `Visita confirmada para el ${fecha}` : 'Visita confirmada'
  }

  if (intento.estado === 'rechazada') {
    const motivo = intento.motivo?.trim()
    return motivo ? `Coordinación rechazada · ${motivo}` : 'Coordinación rechazada'
  }

  return 'Intento de coordinación registrado'
}

/**
 * Cuerpo expandible del ítem: el texto libre que dejó el tasador.
 *
 * Es `detalle` en la rama rechazada y `nota` en la confirmada — los dos campos
 * son `multilineText` y sólo uno existe por rama. `undefined` cuando ninguno
 * está poblado, para que el desplegable **no aparezca vacío**: un "Ver detalle"
 * que abre en blanco es peor que no ofrecerlo.
 *
 * ⚠ El sustantivo con que se ofrece este texto lo elige el componente, y para
 * la coordinación **no es "correo"**: es un llamado telefónico. Ver la tercera
 * vía de `DetalleCorreo` en `solicitud-detail.tsx`.
 */
export function detalleDeCoordinacion(intento: IntentoCoordinacion): string | undefined {
  // Con el estado fuera de dominio no se sabe qué rama es, así que se muestra
  // el texto que exista en vez de descartarlo: la fila ya perdió su desenlace
  // en el título, y tirar además lo único legible que trae sería perder dos
  // veces el mismo dato.
  const crudo =
    intento.estado === 'rechazada'
      ? intento.detalle
      : intento.estado === 'confirmada'
        ? intento.nota
        : (intento.nota ?? intento.detalle)

  const v = crudo?.trim()
  return v ? v : undefined
}
