/**
 * Formato único de fechas para todas las UI: **dd/mm/yyyy** y, con hora,
 * **dd/mm/yyyy HH:mm** (24 h, reloj de Santiago).
 *
 * PRD «Temas 1» R4/R5 (`docs/_planes/PRD_T-TEMAS1-ORDEN-FOTOS-DOCS-FECHAS-20261014.md`).
 * Reemplaza a las rutinas sueltas que convivían con seis formatos distintos
 * («5 ago 2026», «05-08-2026», «21 ago 14:30», «10 de agosto de 2025»…).
 *
 * Reglas:
 * - Lo que se guarda **no cambia**: Airtable, Make y los payloads siguen en ISO.
 *   Este módulo sólo da formato para mostrar y convierte lo que el usuario
 *   escribe.
 * - Una fecha de calendario (`YYYY-MM-DD`) se formatea partiendo el texto, nunca
 *   con `new Date(...)`: eso la interpreta como medianoche UTC y en Santiago se
 *   vería el día anterior.
 * - Un instante (con hora) se lleva al reloj de `America/Santiago` con `Intl`,
 *   que conoce los cambios de horario de Chile. El separador por defecto de
 *   `es-CL` es «-», por eso se arma con `formatToParts`.
 *
 * Módulo puro: importable desde componentes cliente.
 */

export const SIN_FECHA = '—'

const ZONA = 'America/Santiago'

const PARTES_SANTIAGO = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const RE_FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const RE_INSTANTE = /^\d{4}-\d{2}-\d{2}T/
/**
 * Medianoche UTC exacta: así entrega Airtable las fórmulas de tipo fecha y los
 * `date` vía algunas lecturas (`fecha_limite_entrega` = `2026-04-15T00:00:00.000Z`).
 * Es una fecha de calendario, no un instante: llevarla a Santiago la mostraría
 * el día anterior. Mismo criterio que el `parseDate` histórico de
 * `lib/solicitudes.ts`, que tomaba los 10 primeros caracteres.
 */
const RE_MEDIANOCHE_UTC = /^(\d{4})-(\d{2})-(\d{2})T00:00(?::00(?:\.0+)?)?Z$/
const RE_FECHA_USUARIO = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

/**
 * Reloj de pared de Santiago, como lo entrega Airtable con `cellFormat: 'string'`
 * (ver el docblock de `parseInstante` en `lib/solicitudes.ts`, verificado contra
 * la base el 11-ago-2026): `"2026-08-11 14:00"`, `"2026-07-27 12:00am"`,
 * `"12-08-2026 13:00"`, `"12/08/2026"`. Ya está en hora de Santiago, así que se
 * reordena el texto sin convertir zona.
 */
const RE_PARED_ISO =
  /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{2})(?::\d{2})?\s*(?:([ap])\.?\s?m\.?)?$/i
const RE_PARED_CL =
  /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[,]?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*(?:([ap])\.?\s?m\.?)?)?$/i

/** Partes de un texto de reloj de pared, o `null` si no lo es o la fecha no existe. */
function partesPared(s: string): (PartesReloj & { conHora: boolean }) | null {
  let anio: string, mes: string, dia: string
  let hora: string | undefined, minuto: string | undefined, meridiano: string | undefined
  const iso = RE_PARED_ISO.exec(s)
  const cl = iso ? null : RE_PARED_CL.exec(s)
  if (iso) [, anio, mes, dia, hora, minuto, meridiano] = iso
  else if (cl) [, dia, mes, anio, hora, minuto, meridiano] = cl
  else return null
  if (!esFechaValida(Number(anio), Number(mes), Number(dia))) return null

  let h = hora === undefined ? 0 : Number(hora)
  if (meridiano) {
    const pm = meridiano.toLowerCase() === 'p'
    if (h === 12) h = pm ? 12 : 0
    else if (pm) h += 12
  }
  return {
    dia: pad2(dia),
    mes: pad2(mes),
    anio,
    hora: pad2(h),
    minuto: minuto ?? '00',
    conHora: hora !== undefined,
  }
}

interface PartesReloj {
  dia: string
  mes: string
  anio: string
  hora: string
  minuto: string
}

function partesSantiago(d: Date): PartesReloj | null {
  if (Number.isNaN(d.getTime())) return null
  const p: Record<string, string> = {}
  for (const { type, value } of PARTES_SANTIAGO.formatToParts(d)) p[type] = value
  return { dia: p.day, mes: p.month, anio: p.year, hora: p.hour, minuto: p.minute }
}

function pad2(n: number | string): string {
  return String(n).padStart(2, '0')
}

/** true si día/mes/año forman una fecha de calendario real (31/02 no pasa). */
export function esFechaValida(anio: number, mes: number, dia: number): boolean {
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || !Number.isInteger(dia)) return false
  if (anio < 1000 || anio > 9999 || mes < 1 || mes > 12 || dia < 1) return false
  const d = new Date(Date.UTC(anio, mes - 1, dia))
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
}

/**
 * Fecha para mostrar en `dd/mm/yyyy`.
 *
 * Acepta `YYYY-MM-DD` (fecha de calendario), un instante ISO con hora (se lleva
 * a Santiago), un `Date`, o un `dd/mm/yyyy` ya formateado (se normaliza con
 * ceros). Vacío → `fallback`. Un texto que no es fecha se devuelve tal cual,
 * para no esconder un dato raro detrás de un guion.
 */
export function formatearFecha(valor: unknown, fallback: string = SIN_FECHA): string {
  if (valor === null || valor === undefined) return fallback
  if (valor instanceof Date) {
    const p = partesSantiago(valor)
    return p ? `${p.dia}/${p.mes}/${p.anio}` : fallback
  }
  const s = String(valor).trim()
  if (s === '') return fallback

  const iso = RE_FECHA_ISO.exec(s) ?? RE_MEDIANOCHE_UTC.exec(s)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`

  if (RE_INSTANTE.test(s)) {
    const p = partesSantiago(new Date(s))
    return p ? `${p.dia}/${p.mes}/${p.anio}` : s
  }

  const p = partesPared(s)
  if (p) return `${p.dia}/${p.mes}/${p.anio}`

  return s
}

/**
 * Fecha con hora para mostrar en `dd/mm/yyyy HH:mm` (24 h, Santiago).
 * Una fecha de calendario sin hora se muestra sólo como `dd/mm/yyyy`.
 */
export function formatearFechaHora(valor: unknown, fallback: string = SIN_FECHA): string {
  if (valor === null || valor === undefined) return fallback
  const s = valor instanceof Date ? '' : String(valor).trim()
  const d =
    valor instanceof Date
      ? valor
      : RE_INSTANTE.test(s) && !RE_MEDIANOCHE_UTC.test(s)
        ? new Date(s)
        : null
  if (!d) {
    const pared = partesPared(s)
    if (pared?.conHora) return `${pared.dia}/${pared.mes}/${pared.anio} ${pared.hora}:${pared.minuto}`
    return formatearFecha(valor, fallback)
  }
  const p = partesSantiago(d)
  return p ? `${p.dia}/${p.mes}/${p.anio} ${p.hora}:${p.minuto}` : fallback
}

/** Sólo la hora `HH:mm` (24 h, Santiago) de un instante. */
export function formatearHora(valor: unknown, fallback: string = SIN_FECHA): string {
  if (valor === null || valor === undefined || valor === '') return fallback
  const d = valor instanceof Date ? valor : new Date(String(valor))
  const p = partesSantiago(d)
  return p ? `${p.hora}:${p.minuto}` : fallback
}

/**
 * Lo que el usuario escribió (`dd/mm/yyyy`) → `YYYY-MM-DD`, o `null` si está
 * incompleto o no es una fecha real.
 */
export function fechaUsuarioAIso(texto: string): string | null {
  const m = RE_FECHA_USUARIO.exec(texto.trim())
  if (!m) return null
  const dia = Number(m[1])
  const mes = Number(m[2])
  const anio = Number(m[3])
  if (!esFechaValida(anio, mes, dia)) return null
  return `${anio}-${pad2(mes)}-${pad2(dia)}`
}

/**
 * Máscara de un campo `dd/mm/aaaa` mientras se escribe: deja sólo dígitos,
 * inserta las barras y corta en 8 dígitos. Si el usuario escribe la barra tras
 * un solo dígito («1/4/2026»), ese tramo se completa con cero. No inserta una
 * barra final: así el retroceso borra dígitos y no se traba en la barra.
 */
export function enmascararFecha(texto: string): string {
  const tramos = texto.split('/')
  const digitos = tramos
    .map((t, i) => {
      const d = t.replace(/\D/g, '')
      // Tramo de día o mes cerrado con barra y de un dígito → cero a la izquierda.
      return i < 2 && i < tramos.length - 1 && d.length === 1 ? `0${d}` : d
    })
    .join('')
    .slice(0, 8)
  let r = digitos.slice(0, 2)
  if (digitos.length > 2) r += `/${digitos.slice(2, 4)}`
  if (digitos.length > 4) r += `/${digitos.slice(4)}`
  return r
}

/** Máscara de un campo `HH:mm` (24 h) mientras se escribe. */
export function enmascararHora(texto: string): string {
  const tramos = texto.split(':')
  const digitos = tramos
    .map((t, i) => {
      const d = t.replace(/\D/g, '')
      return i === 0 && tramos.length > 1 && d.length === 1 ? `0${d}` : d
    })
    .join('')
    .slice(0, 4)
  return digitos.length > 2 ? `${digitos.slice(0, 2)}:${digitos.slice(2)}` : digitos
}

/** `HH:mm` válido en 24 h, o `null`. */
export function horaValida(texto: string): string | null {
  const m = /^(\d{2}):(\d{2})$/.exec(texto.trim())
  if (!m) return null
  return Number(m[1]) <= 23 && Number(m[2]) <= 59 ? `${m[1]}:${m[2]}` : null
}

/** `YYYY-MM-DD` (o un instante, tomando su día en Santiago) → `dd/mm/yyyy`; vacío → `''`. */
export function isoAFechaUsuario(iso: string | null | undefined): string {
  if (!iso) return ''
  const r = formatearFecha(iso, '')
  return RE_FECHA_USUARIO.test(r) ? r : ''
}
