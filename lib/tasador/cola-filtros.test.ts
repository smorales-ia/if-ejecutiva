import { describe, expect, it } from 'vitest'
import {
  CHIPS,
  CHIP_POR_DEFECTO,
  enColaVisible,
  esChipActivo,
  esPorCoordinar,
  filtrarCola,
} from './cola-filtros'
import type {
  EstadoBackend,
  EstadoCoordinacion,
  SlaEtapaSolicitud,
  Tasacion,
} from '@/lib/tasador/tasaciones'

/**
 * P3-TAS.A · §4.2 paso 7 — chips de la cola (RF-TAS-01 · CI-019 · A-12).
 *
 * ## Por qué estos tests existen y no son de componente
 *
 * El repo no tiene `@testing-library` ni `jsdom`, y `CLAUDE.md` prohíbe agregar
 * dependencias de testing. Sacar la decisión del `.tsx` es lo que permite
 * cubrirla; lo que queda en el componente es render.
 *
 * ## Lo que se afirma, y por qué cada cosa
 *
 * El caso central es el **candado sobre los umbrales**: hasta P3-TAS.A el chip
 * "Por coordinar" filtraba por `horasDesde(fecha_asignacion) < 4` y "Hoy" por
 * `< 24`. Los dos umbrales están prohibidos por §4.3 y ninguno de los dos tenía
 * respaldo — el de 4 h existe, pero en `C_SLA_Etapas` y en horas **hábiles**,
 * de modo que la resta de reloj daba otro número. Por eso hay un test que fija
 * una tasación asignada con la etapa 2 abierta y **`fecha_asignacion` de hace
 * un mes**: si alguien reintroduce la ventana de tiempo, ese caso se cae.
 */

const ETAPA_2: SlaEtapaSolicitud = {
  numero: 2,
  nombre: 'Coordinación de visita',
  tono: 'ambar',
  etiqueta: 'Vence en 2h',
  alertaTs: '2026-08-19T12:00:00.000Z',
  venceTs: '2026-08-19T14:00:00.000Z',
}

type TasacionDeCola = Pick<Tasacion, 'id' | 'estado' | 'slaEtapa' | 'coordinacionVigente'>

/**
 * `coordinacionVigente` por defecto en `null` (sin coordinación aún): es el
 * caso "por coordinar", el que los tests de orden por `venceTs` esperan de una
 * fila `asignada`.
 */
function tasacion(
  id: string,
  estado: EstadoBackend,
  slaEtapa?: Partial<SlaEtapaSolicitud>,
  coordinacionVigente: EstadoCoordinacion | null = null
): TasacionDeCola {
  return {
    id,
    estado,
    slaEtapa: slaEtapa ? { ...ETAPA_2, ...slaEtapa } : undefined,
    coordinacionVigente,
  }
}

describe('CHIPS · CI-019 y A-12', () => {
  it('son tres y no existe "SLA en riesgo"', () => {
    expect(CHIPS).toHaveLength(3)
    expect(CHIPS.map((c) => c.key)).toEqual(['todas', 'hoy', 'por_coordinar'])
    expect(CHIPS.some((c) => /sla/i.test(c.label))).toBe(false)
  })

  it('rotula "Todas" y no "Toda mi cola", y arranca en ese chip', () => {
    expect(CHIPS[0].label).toBe('Todas')
    expect(CHIP_POR_DEFECTO).toBe('todas')
  })

  it('"Hoy" es el único deshabilitado y lleva tooltip que declara A-12', () => {
    const deshabilitados = CHIPS.filter((c) => c.deshabilitado)
    expect(deshabilitados.map((c) => c.key)).toEqual(['hoy'])
    expect(deshabilitados[0].tooltip).toBe('La agenda del día está pendiente de definición.')
  })

  it('"Hoy" no es un chip activable — el tipo lo excluye y el guard también', () => {
    expect(esChipActivo('hoy')).toBe(false)
    expect(esChipActivo('todas')).toBe(true)
    expect(esChipActivo('por_coordinar')).toBe(true)
    expect(esChipActivo('sla_en_riesgo')).toBe(false)
    expect(esChipActivo(undefined)).toBe(false)
  })

  /**
   * Regla T-C: ningún texto visible nombra el medio técnico. El tooltip del
   * stub es texto visible, y es el único literal nuevo de esta tanda.
   */
  it('ningún rótulo ni tooltip usa lenguaje de IA (Regla T-C)', () => {
    const textos = CHIPS.map((c) => `${c.label} ${c.tooltip ?? ''}`).join(' ')
    expect(textos).not.toMatch(/\b(IA|AI|Claude|LLM|OCR|modelo|algoritmo)\b/i)
  })
})

describe('enColaVisible', () => {
  it('deja pasar asignada, visitada y calculada', () => {
    for (const estado of ['asignada', 'visitada', 'calculada'] as const) {
      expect(enColaVisible({ estado })).toBe(true)
    }
  })

  it('excluye lo que todavía no llegó al tasador y lo que ya salió de sus manos', () => {
    for (const estado of ['creada', 'pdf_listo', 'aprobada', 'entregada', 'cerrada'] as const) {
      expect(enColaVisible({ estado })).toBe(false)
    }
  })

  /** §0.4 nota 6: `devuelta` está deprecado y ninguna pantalla lo renderiza. */
  it('no renderiza el estado deprecado devuelta', () => {
    expect(enColaVisible({ estado: 'devuelta' as EstadoBackend })).toBe(false)
  })
})

describe('esPorCoordinar · asignada sin coordinación vigente (CI-045 · CI-048)', () => {
  /**
   * La membresía es por el dato directo, no por la etapa de SLA ni por una cota
   * horaria. La cota `now() - fecha_asignacion < 4h` de §2.1 **no se implementa**
   * (A-22 · CI-048): un `asignada` sin coordinación es "por coordinar" por más
   * viejo que sea. Por eso ninguno de estos casos toca `slaEtapa` ni el reloj.
   */
  it('asignada + coordinacionVigente=null → true', () => {
    expect(esPorCoordinar(tasacion('a', 'asignada', undefined, null))).toBe(true)
  })

  it('asignada + coordinacionVigente=undefined → true (== null cubre ambos)', () => {
    expect(esPorCoordinar({ estado: 'asignada', coordinacionVigente: undefined })).toBe(true)
  })

  it('asignada + coordinacionVigente=confirmada → false (ya pasó a la captura)', () => {
    expect(esPorCoordinar(tasacion('a', 'asignada', undefined, 'confirmada'))).toBe(false)
  })

  it('asignada + coordinacionVigente=rechazada → false (espera a la ejecutiva)', () => {
    expect(esPorCoordinar(tasacion('a', 'asignada', undefined, 'rechazada'))).toBe(false)
  })

  it('visitada + coordinacionVigente=null → false', () => {
    expect(esPorCoordinar(tasacion('a', 'visitada', undefined, null))).toBe(false)
  })

  it('calculada + coordinacionVigente=null → false', () => {
    expect(esPorCoordinar(tasacion('a', 'calculada', undefined, null))).toBe(false)
  })
})

describe('filtrarCola', () => {
  const cola: TasacionDeCola[] = [
    tasacion('creada', 'creada', {}),
    tasacion('asignada-e2', 'asignada', { venceTs: '2026-08-19T14:00:00.000Z' }),
    tasacion('asignada-e2-urgente', 'asignada', { venceTs: '2026-08-19T09:00:00.000Z' }),
    tasacion('visitada', 'visitada', { numero: 5 }),
    tasacion('pdf', 'pdf_listo', {}),
  ]

  it('"Todas" es la cola visible completa, sin los estados de fuera', () => {
    expect(filtrarCola(cola, 'todas').map((t) => t.id)).toEqual([
      'asignada-e2',
      'asignada-e2-urgente',
      'visitada',
    ])
  })

  it('"Por coordinar" ordena por vencimiento de la etapa: lo que vence antes, primero', () => {
    expect(filtrarCola(cola, 'por_coordinar').map((t) => t.id)).toEqual([
      'asignada-e2-urgente',
      'asignada-e2',
    ])
  })

  it('sin venceTs la fila va al final, nunca al principio', () => {
    const conSinDato = [tasacion('sin-vence', 'asignada', { venceTs: null }), ...cola]
    expect(filtrarCola(conSinDato, 'por_coordinar').map((t) => t.id)).toEqual([
      'asignada-e2-urgente',
      'asignada-e2',
      'sin-vence',
    ])
  })

  it('no muta la lista recibida', () => {
    const original = [...cola]
    filtrarCola(cola, 'por_coordinar')
    expect(cola).toEqual(original)
  })

  /**
   * El candado de §4.3 · CI-048. Una asignada sin coordinación pertenece al chip
   * aunque se haya asignado hace un mes: el chip pregunta por la coordinación, no
   * por el reloj (la cota de 4h de §2.1 se dropea de la pertenencia). Si vuelve
   * una ventana de horas, este caso se cae.
   */
  it('no aplica ninguna ventana de tiempo sobre la fecha de asignación', () => {
    const vieja = {
      ...tasacion('vieja', 'asignada', {}),
      fechaAsignacion: '2026-07-19T12:00:00.000Z',
    }
    expect(filtrarCola([vieja], 'por_coordinar').map((t) => t.id)).toEqual(['vieja'])
  })

  /** Control negativo: sin él, todo lo de arriba pasaría con un filtro que devuelve []. */
  it('una cola sin nada que coordinar devuelve vacío y no la lista entera', () => {
    const sinCoordinar = [tasacion('v', 'visitada', { numero: 5 })]
    expect(filtrarCola(sinCoordinar, 'por_coordinar')).toEqual([])
    expect(filtrarCola(sinCoordinar, 'todas')).toHaveLength(1)
  })
})
