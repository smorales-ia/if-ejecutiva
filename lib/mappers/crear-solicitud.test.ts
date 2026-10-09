import { describe, expect, it } from 'vitest'

import {
  nuevaSolicitudInternaDefaults,
  nuevaSolicitudInternaSchema,
} from '../validators/nueva-solicitud-interna'
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

/**
 * A-01 · C-08 — el precio de venta es referencia para valorizar y se captura
 * en nueva y en usada. El resto del bloque financiero sigue siendo sólo de
 * propiedades nuevas.
 */

const FIN7 = {
  valorTotalUf: '4.200',
  subsidio: '100',
  ahorro: '50',
  mutuo: '3.000',
  pagoContado: '10',
  bonoCaptacion: '5',
  bonoIntegracion: '5',
}

const CLAVES_SOLO_NUEVA = [
  'financiero_valor_total_uf',
  'financiero_subsidio_uf',
  'financiero_ahorro_uf',
  'financiero_mutuo_uf',
  'financiero_pago_contado_uf',
  'financiero_bono_captacion_uf',
  'financiero_bono_integracion_uf',
  'valor_uf',
] as const

describe('toMakeSnakePayload · precio de venta (A-01)', () => {
  it('envía el precio normalizado en una usada', () => {
    const p = payload({ tipoPropiedadNuevoUsado: 'usada', precioVenta: '2.800' })
    expect(p.financiero_precio_venta_uf).toBe('2800')
  })

  it('omite la clave cuando la usada no trae precio, sin romper el armado', () => {
    let p: Record<string, unknown> = {}
    expect(() => {
      p = payload({ tipoPropiedadNuevoUsado: 'usada', precioVenta: '' })
    }).not.toThrow()
    expect('financiero_precio_venta_uf' in p).toBe(false)
  })

  it('el schema no rechaza un precio de venta vacío', () => {
    const r = nuevaSolicitudInternaSchema.safeParse({
      ...nuevaSolicitudInternaDefaults,
      precioVenta: '',
    })
    const issues = r.success ? [] : r.error.issues
    expect(issues.some((i) => i.path[0] === 'precioVenta')).toBe(false)
  })

  it('en una usada no arrastra el resto del financiero, pero sí el precio', () => {
    const p = payload({
      tipoPropiedadNuevoUsado: 'usada',
      ...FIN7,
      precioVenta: '2.800',
    })
    for (const clave of CLAVES_SOLO_NUEVA) {
      expect(clave in p).toBe(false)
    }
    expect(p.financiero_precio_venta_uf).toBe('2800')
  })

  it('en una nueva envía las 9 claves normalizadas', () => {
    const p = payload({
      tipoPropiedadNuevoUsado: 'nueva',
      proyecto: 'Condominio Los Andes',
      ...FIN7,
      precioVenta: '2.800',
    })
    expect(p.financiero_valor_total_uf).toBe('4200')
    expect(p.financiero_subsidio_uf).toBe('100')
    expect(p.financiero_ahorro_uf).toBe('50')
    expect(p.financiero_mutuo_uf).toBe('3000')
    expect(p.financiero_pago_contado_uf).toBe('10')
    expect(p.financiero_bono_captacion_uf).toBe('5')
    expect(p.financiero_bono_integracion_uf).toBe('5')
    expect(p.valor_uf).toBe('4200')
    expect(p.financiero_precio_venta_uf).toBe('2800')
  })
})
