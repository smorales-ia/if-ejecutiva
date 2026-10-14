import { describe, expect, it } from 'vitest'
import {
  SIN_FECHA,
  enmascararFecha,
  enmascararHora,
  esFechaValida,
  horaValida,
  fechaUsuarioAIso,
  formatearFecha,
  formatearFechaHora,
  formatearHora,
  isoAFechaUsuario,
} from '@/lib/fechas'

describe('formatearFecha · dd/mm/yyyy (PRD «Temas 1» R4)', () => {
  it('fecha de calendario: parte el texto, sin correr el día', () => {
    expect(formatearFecha('2026-04-13')).toBe('13/04/2026')
    expect(formatearFecha('2026-01-01')).toBe('01/01/2026')
  })

  it('medianoche UTC exacta (fórmulas de Airtable) es fecha de calendario', () => {
    expect(formatearFecha('2026-04-15T00:00:00.000Z')).toBe('15/04/2026')
    expect(formatearFecha('2026-04-15T00:00:00Z')).toBe('15/04/2026')
  })

  it('instante: día en Santiago (invierno UTC-4 y verano UTC-3)', () => {
    // 25-ago 03:30Z = 24-ago 23:30 en Santiago (UTC-4).
    expect(formatearFecha('2026-08-25T03:30:00.000Z')).toBe('24/08/2026')
    // 13-oct 03:00Z = 13-oct 00:00 en Santiago (UTC-3).
    expect(formatearFecha('2026-10-13T03:00:00.000Z')).toBe('13/10/2026')
  })

  it('normaliza dd/mm/yyyy y respeta texto que no es fecha', () => {
    expect(formatearFecha('5/8/2026')).toBe('05/08/2026')
    expect(formatearFecha('24 jun 2026 · 10:12')).toBe('24 jun 2026 · 10:12')
  })

  it('vacío → fallback', () => {
    expect(formatearFecha(undefined)).toBe(SIN_FECHA)
    expect(formatearFecha('')).toBe(SIN_FECHA)
    expect(formatearFecha(null, 'Sin fecha')).toBe('Sin fecha')
  })
})

describe('formatearFechaHora · dd/mm/yyyy HH:mm en Santiago', () => {
  it('instante en invierno y verano', () => {
    expect(formatearFechaHora('2026-08-25T03:30:00.000Z')).toBe('24/08/2026 23:30')
    expect(formatearFechaHora('2026-10-13T21:14:33.653Z')).toBe('13/10/2026 18:14')
  })

  it('cambio de horario de Chile (6-sep-2026, 00:00 → 01:00)', () => {
    expect(formatearFechaHora('2026-09-06T03:59:00.000Z')).toBe('05/09/2026 23:59')
    expect(formatearFechaHora('2026-09-06T04:00:00.000Z')).toBe('06/09/2026 01:00')
  })

  it('fecha sin hora se muestra sin hora', () => {
    expect(formatearFechaHora('2026-04-13')).toBe('13/04/2026')
    expect(formatearFechaHora('2026-04-15T00:00:00.000Z')).toBe('15/04/2026')
  })

  it('hora sola en 24 h', () => {
    expect(formatearHora('2026-10-13T21:14:33.653Z')).toBe('18:14')
  })
})

describe('ingreso dd/mm/yyyy ↔ ISO (R5)', () => {
  it('convierte fechas válidas', () => {
    expect(fechaUsuarioAIso('13/04/2026')).toBe('2026-04-13')
    expect(fechaUsuarioAIso('1/2/2026')).toBe('2026-02-01')
    expect(fechaUsuarioAIso('29/02/2028')).toBe('2028-02-29')
  })

  it('rechaza fechas imposibles o incompletas', () => {
    expect(fechaUsuarioAIso('31/02/2026')).toBeNull()
    expect(fechaUsuarioAIso('29/02/2026')).toBeNull()
    expect(fechaUsuarioAIso('13/13/2026')).toBeNull()
    expect(fechaUsuarioAIso('13/04/26')).toBeNull()
    expect(fechaUsuarioAIso('2026-04-13')).toBeNull()
    expect(esFechaValida(2026, 4, 31)).toBe(false)
  })

  it('ISO → dd/mm/yyyy para precargar un campo', () => {
    expect(isoAFechaUsuario('2026-04-13')).toBe('13/04/2026')
    expect(isoAFechaUsuario('')).toBe('')
    expect(isoAFechaUsuario(undefined)).toBe('')
  })
})

describe('reloj de pared de Airtable con cellFormat string (auditoría D1)', () => {
  // Formatos reales documentados en `parseInstante` (lib/solicitudes.ts), verificados
  // contra la base el 11-ago-2026. Ya son hora de Santiago: no se convierte zona.
  it('fecha de asignación «2026-08-11 14:00» → dd/mm/yyyy HH:mm, sin correr la hora', () => {
    expect(formatearFechaHora('2026-08-11 14:00')).toBe('11/08/2026 14:00')
    expect(formatearFecha('2026-08-11 14:00')).toBe('11/08/2026')
  })

  it('am/pm de 12 horas', () => {
    expect(formatearFechaHora('2026-07-27 12:00am')).toBe('27/07/2026 00:00')
    expect(formatearFechaHora('2026-07-27 12:30pm')).toBe('27/07/2026 12:30')
    expect(formatearFechaHora('2026-07-27 1:05pm')).toBe('27/07/2026 13:05')
  })

  it('formato local «12-08-2026 13:00» y fechas sin hora', () => {
    expect(formatearFechaHora('12-08-2026 13:00')).toBe('12/08/2026 13:00')
    expect(formatearFecha('12-08-2026')).toBe('12/08/2026')
    expect(formatearFechaHora('12-08-2026')).toBe('12/08/2026')
    expect(formatearFecha('5/8/2026')).toBe('05/08/2026')
  })

  it('una fecha imposible no se disfraza de válida', () => {
    expect(formatearFecha('31-02-2026')).toBe('31-02-2026')
  })
})

describe('máscara del campo de fecha y hora (R5)', () => {
  it('inserta las barras mientras se escriben dígitos', () => {
    expect(enmascararFecha('1')).toBe('1')
    expect(enmascararFecha('13')).toBe('13')
    expect(enmascararFecha('130')).toBe('13/0')
    expect(enmascararFecha('1304')).toBe('13/04')
    expect(enmascararFecha('13042026')).toBe('13/04/2026')
  })

  it('corta en 8 dígitos y descarta lo que no es dígito', () => {
    expect(enmascararFecha('13/04/20261')).toBe('13/04/2026')
    expect(enmascararFecha('13-04-2026')).toBe('13/04/2026')
    expect(enmascararFecha('ab13')).toBe('13')
  })

  it('completa con cero un día o mes de un dígito cerrado con barra', () => {
    expect(enmascararFecha('1/')).toBe('01')
    expect(enmascararFecha('1/4/2026')).toBe('01/04/2026')
    expect(enmascararFecha('13/4/')).toBe('13/04')
  })

  it('el retroceso sobre la barra no se traba (sin barra final)', () => {
    expect(enmascararFecha('13/04/')).toBe('13/04')
    expect(enmascararFecha('13/')).toBe('13')
  })

  it('hora en 24 h', () => {
    expect(enmascararHora('0930')).toBe('09:30')
    expect(enmascararHora('9:30')).toBe('09:30')
    expect(enmascararHora('233')).toBe('23:3')
    expect(horaValida('23:59')).toBe('23:59')
    expect(horaValida('24:00')).toBeNull()
    expect(horaValida('9:30')).toBeNull()
  })
})
