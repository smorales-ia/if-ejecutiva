import { describe, expect, it } from 'vitest'

import { nuevaSolicitudInternaDefaults } from '../validators/nueva-solicitud-interna'
import { toMakeSnakePayload } from './crear-solicitud'

/**
 * Tanda C · C-7 — el hito de §5.2.2 en el contrato de SC01.
 *
 * `sla_e1_inicio_ts` es el instante en que Control y Seguimiento abre el correo
 * e ingresa la solicitud, no el del `Create` de Airtable. Si la clave no viaja,
 * SC01 no escribe el campo y la solicitud nace en `sin_dato` — que es la
 * degradación correcta, pero hay que distinguirla de que el mapper la esté
 * perdiendo por un renombre.
 */

const HITO = '2026-08-10T13:10:00.000Z'

function payload(extra: Record<string, unknown> = {}) {
  return toMakeSnakePayload(
    { ...nuevaSolicitudInternaDefaults, slaInicioTs: HITO, ...extra } as never,
    { ejecutivaClerkId: 'user_123' },
  )
}

describe('toMakeSnakePayload · reloj por etapa', () => {
  it('envía el hito con el nombre del campo destino de TX_Solicitudes', () => {
    // El módulo 7 de SC01 lo mapea directo como `{{1.sla_e1_inicio_ts}}`, sin
    // Search ni transformación: la clave del payload y el campo se llaman igual
    // a propósito.
    expect(payload().sla_e1_inicio_ts).toBe(HITO)
  })

  it('declara que el alta nace en la etapa 1', () => {
    // Constante y no cálculo: la aritmética hábil de §5.2.1 no cabe en Make, y
    // los umbrales los materializa el Route Handler antes de postear.
    expect(payload().sla_etapa_actual).toBe(1)
  })

  it('omite la clave del hito cuando el wizard no alcanzó a estamparlo', () => {
    // Omitir no es lo mismo que mandar "": con `""` el módulo de Airtable puede
    // escribir basura en un campo `date` (regla 1 de la cabecera del mapper).
    const p = payload({ slaInicioTs: '' })
    expect('sla_e1_inicio_ts' in p).toBe(false)
  })

  it('no inventa un instante cuando falta: prefiere sin_dato', () => {
    const p = payload({ slaInicioTs: '   ' })
    expect('sla_e1_inicio_ts' in p).toBe(false)
  })
})

describe('regresión · el contrato previo sigue intacto', () => {
  it('conserva las constantes de canal y autoría', () => {
    const p = payload()
    expect(p.origen_canal).toBe('ingreso_manual')
    expect(p.ejecutiva_clerk_id).toBe('user_123')
  })
})
