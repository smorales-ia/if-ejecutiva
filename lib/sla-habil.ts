/**
 * Aritmética del calendario hábil de VProperty (Spec v1.9.9 §5.2.1).
 *
 * Módulo **puro**: sin I/O, sin Airtable, sin fetch. Los feriados llegan como
 * `Set<'YYYY-MM-DD'>` desde `lib/feriados.ts`, que es quien habla con la base.
 * Así el motor se testea sin red y sin mocks (plan §9.6.2 · B-1).
 *
 * ## La ventana
 *
 * Lunes a viernes, de 09:00 a 18:00 hora de Santiago, excluidos los feriados
 * chilenos. Nueve horas hábiles por día — no ocho. El tiempo fuera de la
 * ventana **no se descuenta**: simplemente nunca entra al cómputo, que es lo
 * que §5.2.1 llama "pausa del reloj" y no es una pausa en el sentido de RN-54.
 *
 * ## Por qué todo pasa por `Intl.DateTimeFormat`
 *
 * `Date.getHours()` devuelve la hora del proceso. En Railway el proceso corre
 * en UTC, así que un instante de las 10:00 de Santiago se leería como 14:00 y
 * la ventana quedaría corrida cuatro horas. Un offset fijo tampoco sirve:
 * Chile tiene horario de verano y el offset alterna entre −04:00 y −03:00 dos
 * veces al año (en 2026, el 5 de abril y el 6 de septiembre). La única fuente
 * correcta sin agregar dependencias es la base de datos de zonas horarias de
 * ICU, que `Intl` expone.
 *
 * La conversión inversa —de componentes de reloj de pared a instante— se hace
 * con `desdeSantiago()`, que resuelve el offset iterando dos veces sobre el
 * propio `Intl` en lugar de asumirlo.
 */

/** Ventana hábil declarada en §5.2.1. */
export interface VentanaHabil {
  /** Hora de apertura en reloj de Santiago. */
  horaInicio: number
  /** Hora de cierre en reloj de Santiago. */
  horaFin: number
  /** Días de la semana hábiles, con 0 = domingo (`Date.getUTCDay()`). */
  diasSemana: readonly number[]
}

/** Lunes a viernes, 09:00–18:00 (§5.2.1). No es configurable por cliente. */
export const VENTANA_VPROPERTY: VentanaHabil = {
  horaInicio: 9,
  horaFin: 18,
  diasSemana: [1, 2, 3, 4, 5],
}

/** Minutos hábiles que rinde un día completo de la ventana. */
export const MINUTOS_POR_DIA_HABIL =
  (VENTANA_VPROPERTY.horaFin - VENTANA_VPROPERTY.horaInicio) * 60

export const ZONA_VPROPERTY = 'America/Santiago'

const MS_POR_MINUTO = 60_000
const MS_POR_DIA = 86_400_000

// ---------------------------------------------------------------------------
// Conversión instante ↔ reloj de Santiago
// ---------------------------------------------------------------------------

const FORMATO_PARTES = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_VPROPERTY,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

/** Componentes del reloj de pared de Santiago para un instante dado. */
export interface PartesSantiago {
  anio: number
  mes: number
  dia: number
  hora: number
  minuto: number
  segundo: number
}

/**
 * Descompone un instante en los componentes que marcaría un reloj colgado en
 * la pared de la oficina de Santiago.
 *
 * @param instante Instante absoluto (cualquier `Date`).
 * @returns Año, mes (1–12), día, hora (0–23), minuto y segundo locales.
 * @example
 * // Con horario de invierno (GMT−4):
 * partesEnSantiago(new Date('2026-08-04T14:00:00Z')) // → { hora: 10, ... }
 */
export function partesEnSantiago(instante: Date): PartesSantiago {
  const bruto: Record<string, number> = {}
  for (const parte of FORMATO_PARTES.formatToParts(instante)) {
    if (parte.type !== 'literal') bruto[parte.type] = Number.parseInt(parte.value, 10)
  }
  return {
    anio: bruto.year,
    mes: bruto.month,
    dia: bruto.day,
    hora: bruto.hour,
    minuto: bruto.minute,
    segundo: bruto.second,
  }
}

/**
 * Offset de Santiago en el instante dado, en milisegundos, expresado como
 * *cuánto hay que sumarle al reloj de pared leído como si fuera UTC para
 * recuperar el instante real*. En invierno vale +4 h; en verano, +3 h.
 *
 * @param instante Instante absoluto.
 * @returns Offset en ms (positivo, porque Chile está al oeste de Greenwich).
 */
function offsetMs(instante: Date): number {
  const p = partesEnSantiago(instante)
  const relojComoUtc = Date.UTC(p.anio, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo)
  return instante.getTime() - relojComoUtc
}

/**
 * Construye el instante absoluto que corresponde a una lectura del reloj de
 * pared de Santiago. Es la inversa de `partesEnSantiago`.
 *
 * Asume que el offset se resuelve en dos pasadas: se estima con el offset del
 * instante candidato y se corrige con el offset del resultado. Dos pasadas
 * bastan porque el error inicial nunca excede las cuatro horas y los saltos de
 * horario de verano son de una hora.
 *
 * @param anio Año en reloj de Santiago.
 * @param mes Mes 1–12.
 * @param dia Día del mes.
 * @param hora Hora 0–23.
 * @param minuto Minuto 0–59.
 * @returns Instante absoluto correspondiente.
 * @example
 * desdeSantiago(2026, 8, 4, 10, 0).toISOString() // → '2026-08-04T14:00:00.000Z'
 */
export function desdeSantiago(
  anio: number,
  mes: number,
  dia: number,
  hora: number,
  minuto: number
): Date {
  const relojComoUtc = Date.UTC(anio, mes - 1, dia, hora, minuto, 0)
  const primeraEstimacion = relojComoUtc + offsetMs(new Date(relojComoUtc))
  const corregido = relojComoUtc + offsetMs(new Date(primeraEstimacion))
  return new Date(corregido)
}

// ---------------------------------------------------------------------------
// Índice de fecha: aritmética de días inmune al horario de verano
// ---------------------------------------------------------------------------

/**
 * Un "índice de fecha" es la fecha civil de Santiago reducida a un número:
 * `Date.UTC(anio, mes-1, dia)`. Avanzar un día es sumar 86.400.000 ms, y eso
 * es exacto **porque el índice no lleva hora**: no hay horario de verano que
 * pueda desviarlo. Sumar un día a un instante, en cambio, sí se desvía.
 */
type IndiceFecha = number

function indiceDe(p: PartesSantiago): IndiceFecha {
  return Date.UTC(p.anio, p.mes - 1, p.dia)
}

function indiceDeInstante(instante: Date): IndiceFecha {
  return indiceDe(partesEnSantiago(instante))
}

/** Fecha civil del índice en formato `YYYY-MM-DD`, que es el de `C_Feriados`. */
export function fechaISODeIndice(indice: IndiceFecha): string {
  return new Date(indice).toISOString().slice(0, 10)
}

/** Día de la semana del índice, 0 = domingo. */
function diaSemanaDeIndice(indice: IndiceFecha): number {
  return new Date(indice).getUTCDay()
}

/**
 * ¿Es día hábil esta fecha civil? Lunes a viernes y no feriado. No mira la
 * hora: para eso está `esHabil`.
 *
 * @param indice Índice de fecha.
 * @param feriados Fechas `YYYY-MM-DD` no hábiles.
 */
function esDiaHabil(indice: IndiceFecha, feriados: ReadonlySet<string>): boolean {
  if (!VENTANA_VPROPERTY.diasSemana.includes(diaSemanaDeIndice(indice))) return false
  return !feriados.has(fechaISODeIndice(indice))
}

/** Apertura de la jornada (09:00 Santiago) del día del índice. */
function aperturaDe(indice: IndiceFecha): Date {
  const d = new Date(indice)
  return desdeSantiago(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    VENTANA_VPROPERTY.horaInicio,
    0
  )
}

/** Cierre de la jornada (18:00 Santiago) del día del índice. */
function cierreDe(indice: IndiceFecha): Date {
  const d = new Date(indice)
  return desdeSantiago(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    VENTANA_VPROPERTY.horaFin,
    0
  )
}

/** Primer día hábil en el índice dado o después de él. */
function primerDiaHabilDesde(
  indice: IndiceFecha,
  feriados: ReadonlySet<string>
): IndiceFecha {
  let cursor = indice
  // Cota defensiva: dos semanas cubren cualquier racha real de feriados.
  for (let i = 0; i < 14; i += 1) {
    if (esDiaHabil(cursor, feriados)) return cursor
    cursor += MS_POR_DIA
  }
  throw new Error(
    `sla-habil: no se encontró día hábil en 14 días desde ${fechaISODeIndice(indice)}. ` +
      'Revisar C_Feriados: probablemente tiene un rango cargado por error.'
  )
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * ¿Cae este instante dentro de la ventana hábil de §5.2.1?
 *
 * Un instante exactamente en la apertura (09:00) **es** hábil; uno exactamente
 * en el cierre (18:00) **no**, porque a esa hora ya no queda tiempo por
 * consumir ese día. Esa asimetría es deliberada y es la que hace que
 * `minutosHabilesEntre` no cuente dos veces el borde entre dos jornadas.
 *
 * @param instante Instante a evaluar.
 * @param feriados Fechas `YYYY-MM-DD` no hábiles, de `C_Feriados`.
 * @returns `true` si es lunes a viernes, dentro de 09:00–18:00, y no feriado.
 * @example
 * esHabil(desdeSantiago(2026, 8, 4, 10, 0), new Set())  // → true  (martes 10:00)
 * esHabil(desdeSantiago(2026, 8, 8, 10, 0), new Set())  // → false (sábado)
 * esHabil(desdeSantiago(2026, 8, 4, 18, 0), new Set())  // → false (cierre)
 */
export function esHabil(instante: Date, feriados: ReadonlySet<string>): boolean {
  const p = partesEnSantiago(instante)
  if (!esDiaHabil(indiceDe(p), feriados)) return false
  const minutos = p.hora * 60 + p.minuto
  return (
    minutos >= VENTANA_VPROPERTY.horaInicio * 60 && minutos < VENTANA_VPROPERTY.horaFin * 60
  )
}

/**
 * Normaliza un instante a la ventana hábil: si ya es hábil lo devuelve tal
 * cual; si no, devuelve la apertura de la siguiente jornada hábil.
 *
 * Es el hito de §5.2.2 hecho función. Un correo que entra un viernes a las
 * 22:00 no consume SLA hasta el lunes a las 09:00, y esta función es la que lo
 * afirma en código.
 *
 * @param instante Instante a normalizar.
 * @param feriados Fechas `YYYY-MM-DD` no hábiles.
 * @returns El mismo instante si es hábil, o la próxima apertura hábil.
 * @example
 * // Viernes 22:00 → lunes 09:00 (§5.2.2)
 * proximoInstanteHabil(desdeSantiago(2026, 8, 7, 22, 0), new Set())
 * // → 2026-08-10 09:00 Santiago
 */
export function proximoInstanteHabil(instante: Date, feriados: ReadonlySet<string>): Date {
  if (esHabil(instante, feriados)) return new Date(instante.getTime())

  const p = partesEnSantiago(instante)
  const indiceHoy = indiceDe(p)
  const minutos = p.hora * 60 + p.minuto

  // Antes de abrir, en un día hábil: la apertura de hoy mismo.
  if (esDiaHabil(indiceHoy, feriados) && minutos < VENTANA_VPROPERTY.horaInicio * 60) {
    return aperturaDe(indiceHoy)
  }

  // Cerrado por hora, o día no hábil: la apertura del próximo día hábil.
  const desde = esDiaHabil(indiceHoy, feriados) ? indiceHoy + MS_POR_DIA : indiceHoy
  return aperturaDe(primerDiaHabilDesde(desde, feriados))
}

/**
 * Alias de `proximoInstanteHabil` con el nombre que usa el plan en §9.6.1.
 * Se mantienen los dos para que ni el plan ni los llamadores queden mintiendo.
 */
export const normalizarAVentana = proximoInstanteHabil

/**
 * Suma horas hábiles a un instante, saltando noches, fines de semana y
 * feriados. Es el núcleo del motor: convierte un umbral en horas de la matriz
 * de §5.2.4 en un **instante de pared** contra el que después basta comparar
 * `NOW()`.
 *
 * Acepta fracciones de hora, que es lo que exigen las etapas de media hora.
 * Si el instante de partida cae fuera de ventana se normaliza primero con
 * `proximoInstanteHabil`: el reloj no puede empezar a correr un domingo.
 *
 * Si la suma cae exactamente en el cierre, devuelve el cierre —no rueda a la
 * apertura siguiente—. Un vencimiento "a las 18:00" es un vencimiento de ese
 * día, y rodarlo regalaría una jornada entera de holgura.
 *
 * @param desde Instante de partida.
 * @param horas Horas hábiles a sumar. Admite decimales. Cero o negativo
 *   devuelve el instante normalizado, sin avanzar.
 * @param feriados Fechas `YYYY-MM-DD` no hábiles.
 * @returns Instante resultante.
 * @example
 * // Viernes 16:00 + 4 h hábiles → lunes 11:00
 * sumarHorasHabiles(desdeSantiago(2026, 8, 7, 16, 0), 4, new Set())
 */
export function sumarHorasHabiles(
  desde: Date,
  horas: number,
  feriados: ReadonlySet<string>
): Date {
  const cursorInicial = proximoInstanteHabil(desde, feriados)
  let restante = Math.round(horas * 60)
  if (restante <= 0) return cursorInicial

  let cursor = cursorInicial
  // Cota defensiva: el umbral más largo de la matriz son unas pocas jornadas.
  for (let vueltas = 0; vueltas < 5_000; vueltas += 1) {
    const p = partesEnSantiago(cursor)
    const indice = indiceDe(p)
    const minutosAhora = p.hora * 60 + p.minuto
    const disponibles = VENTANA_VPROPERTY.horaFin * 60 - minutosAhora

    if (restante <= disponibles) {
      return new Date(cursor.getTime() + restante * MS_POR_MINUTO)
    }

    restante -= disponibles
    cursor = aperturaDe(primerDiaHabilDesde(indice + MS_POR_DIA, feriados))
  }

  throw new Error(
    `sla-habil: sumarHorasHabiles no converge para ${horas} h desde ${desde.toISOString()}.`
  )
}

/**
 * Minutos hábiles transcurridos entre dos instantes. El tiempo fuera de la
 * ventana no cuenta, de modo que un intervalo que abarca un fin de semana
 * completo rinde lo mismo que si el fin de semana no existiera.
 *
 * Alimenta `sla_pausa_habil_min` (RN-54) y los reportes de §5.2.9. Es también
 * la inversa exacta de `sumarHorasHabiles`, invariante que los tests verifican
 * para las siete etapas.
 *
 * @param desde Inicio del intervalo.
 * @param hasta Fin del intervalo. Si es anterior a `desde`, devuelve 0.
 * @param feriados Fechas `YYYY-MM-DD` no hábiles.
 * @returns Minutos hábiles, redondeados al minuto.
 * @example
 * // Viernes 17:00 a lunes 10:00 → 60 (viernes) + 60 (lunes) = 120
 * minutosHabilesEntre(
 *   desdeSantiago(2026, 8, 7, 17, 0),
 *   desdeSantiago(2026, 8, 10, 10, 0),
 *   new Set()
 * ) // → 120
 */
export function minutosHabilesEntre(
  desde: Date,
  hasta: Date,
  feriados: ReadonlySet<string>
): number {
  if (hasta.getTime() <= desde.getTime()) return 0

  let total = 0
  const indiceFin = indiceDeInstante(hasta)
  let indice = indiceDeInstante(desde)

  while (indice <= indiceFin) {
    if (esDiaHabil(indice, feriados)) {
      const abre = aperturaDe(indice).getTime()
      const cierra = cierreDe(indice).getTime()
      const ini = Math.max(desde.getTime(), abre)
      const fin = Math.min(hasta.getTime(), cierra)
      if (fin > ini) total += (fin - ini) / MS_POR_MINUTO
    }
    indice += MS_POR_DIA
  }

  return Math.round(total)
}
