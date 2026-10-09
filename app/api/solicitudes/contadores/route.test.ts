import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * A-03 · contador «sin fecha de visita · más de 24 h hábiles» (§5.2.8).
 *
 * Lo que se protege: la entrada nueva mide exactamente la consulta que hace la
 * bandeja con `?sin_fecha_visita=1` sobre `todas`, degrada a 0 sin tumbar el
 * resto cuando falla, y no pisa las claves que ya existían (las pestañas y el
 * indicador del header dependen de ellas).
 */

const auth = vi.fn()
const fetchSolicitudes = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({ auth: () => auth() }))

vi.mock('@/lib/solicitudes', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/solicitudes')>()
  return {
    ...real,
    fetchSolicitudes: (...args: unknown[]) => fetchSolicitudes(...args),
  }
})

// Import estático — mismo patrón que `asignar/route.test.ts`.
import { CLAVE_CARTERA_ROJO, GET } from './route'
import { VISTAS_VALIDAS } from '@/lib/solicitudes'
import { CLAVE_CONTADOR_SIN_FECHA_VISITA } from '@/lib/sin-fecha-visita'

/** Fabrica `n` filas: el handler sólo mira `data.length`. */
function filas(n: number) {
  return { data: Array.from({ length: n }, (_, i) => ({ id: `rec${i}` })) }
}

/** ¿Es la llamada del contador A-03? */
function esLlamadaSinFecha(args: unknown[]): boolean {
  const filtros = args[2] as { sin_fecha_visita?: string } | undefined
  return filtros?.sin_fecha_visita === '1'
}

async function llamar(): Promise<Record<string, number>> {
  const res = await GET({} as never)
  const json = (await res.json()) as { contadores: Record<string, number> }
  return json.contadores
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.mockResolvedValue({ userId: 'user_123' })
  fetchSolicitudes.mockImplementation(async (...args: unknown[]) => {
    if (esLlamadaSinFecha(args)) return filas(4)
    const filtros = args[2] as { sla?: string } | undefined
    if (filtros?.sla === 'rojo') return filas(2)
    return filas(7)
  })
})

describe('contador sin_fecha_visita_24h (A-03)', () => {
  it('cuenta la consulta de la bandeja con ?sin_fecha_visita=1 sobre todas', async () => {
    const contadores = await llamar()
    expect(CLAVE_CONTADOR_SIN_FECHA_VISITA).toBe('sin_fecha_visita_24h')
    expect(contadores[CLAVE_CONTADOR_SIN_FECHA_VISITA]).toBe(4)

    const llamada = fetchSolicitudes.mock.calls.find(esLlamadaSinFecha)
    expect(llamada).toBeDefined()
    expect(llamada?.[0]).toBe('todas')
    expect(llamada?.[1]).toBeUndefined()
    expect(llamada?.[2]).toEqual({ sin_fecha_visita: '1' })
  })

  it('si su consulta falla, cuenta 0 y el resto de los contadores sigue', async () => {
    fetchSolicitudes.mockImplementation(async (...args: unknown[]) => {
      if (esLlamadaSinFecha(args)) throw new Error('Airtable caído')
      const filtros = args[2] as { sla?: string } | undefined
      if (filtros?.sla === 'rojo') return filas(2)
      return filas(7)
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const contadores = await llamar()
    expect(contadores[CLAVE_CONTADOR_SIN_FECHA_VISITA]).toBe(0)
    for (const vista of VISTAS_VALIDAS) expect(contadores[vista]).toBe(7)
    expect(contadores[CLAVE_CARTERA_ROJO]).toBe(2)

    errorSpy.mockRestore()
  })

  it('no pisa las claves existentes: una por vista y mi_cartera_rojo', async () => {
    const contadores = await llamar()
    expect(Object.keys(contadores).sort()).toEqual(
      [...VISTAS_VALIDAS, CLAVE_CARTERA_ROJO, CLAVE_CONTADOR_SIN_FECHA_VISITA].sort()
    )
    for (const vista of VISTAS_VALIDAS) expect(contadores[vista]).toBe(7)
    expect(contadores[CLAVE_CARTERA_ROJO]).toBe(2)
  })

  it('no depende de la sesión: sin usuario Clerk también cuenta', async () => {
    auth.mockResolvedValue({ userId: null })
    const contadores = await llamar()
    expect(contadores[CLAVE_CONTADOR_SIN_FECHA_VISITA]).toBe(4)
    expect(contadores[CLAVE_CARTERA_ROJO]).toBe(0)
  })
})
