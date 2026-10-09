import { describe, expect, it } from 'vitest'

import { SOLICITUDES, type Solicitud } from '@/lib/console-data'
import { mapearEdicionSolicitud } from './editar-solicitud'

/**
 * A-01 · C-08 — `financieroPrecioVentaUf` viaja siempre a SC-Edicion, en nueva
 * y en usada. El resto del financiero sigue detrás del guard de propiedad nueva.
 */

const USADA = SOLICITUDES[0]
const NUEVA = SOLICITUDES[2]

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
  'financieroValorTotalUf',
  'financieroSubsidioUf',
  'financieroAhorroUf',
  'financieroMutuoUf',
  'financieroPagoContadoUf',
  'financieroBonoCaptacionUf',
  'financieroBonoIntegracionUf',
] as const

function editar(base: Solicitud, cambios: Partial<Solicitud>) {
  return mapearEdicionSolicitud({ ...base, ...cambios }, base)
}

describe('mapearEdicionSolicitud · precio de venta (A-01)', () => {
  it('los fixtures cubren una usada y una nueva', () => {
    expect(USADA.tipoPropiedadNuevoUsado).toBe('usada')
    expect(NUEVA.tipoPropiedadNuevoUsado).toBe('nueva')
    expect(NUEVA.financiero?.precioVenta).toBe('12.500')
  })

  it('envía el precio normalizado en una usada', () => {
    const p = editar(USADA, { financiero: { precioVenta: '2.800' } })
    expect(p.financieroPrecioVentaUf).toBe('2800')
  })

  it('omite la clave cuando el precio viene vacío', () => {
    const p = editar(USADA, { financiero: { precioVenta: '' } })
    expect('financieroPrecioVentaUf' in p).toBe(false)
  })

  it('omite la clave cuando el precio es undefined', () => {
    const p = editar(USADA, { financiero: { precioVenta: undefined } })
    expect('financieroPrecioVentaUf' in p).toBe(false)
  })

  it('omite la clave cuando no hay bloque financiero', () => {
    const p = editar(USADA, { financiero: undefined })
    expect('financieroPrecioVentaUf' in p).toBe(false)
  })

  it('en una usada no arrastra el resto del financiero, pero sí el precio', () => {
    const p = editar(USADA, { financiero: { ...FIN7, precioVenta: '2.800' } })
    for (const clave of CLAVES_SOLO_NUEVA) {
      expect(clave in p).toBe(false)
    }
    expect(p.financieroPrecioVentaUf).toBe('2800')
  })

  it('en una nueva envía las 8 claves normalizadas', () => {
    const p = editar(NUEVA, { financiero: { ...FIN7, precioVenta: '2.800' } })
    expect(p.financieroValorTotalUf).toBe('4200')
    expect(p.financieroSubsidioUf).toBe('100')
    expect(p.financieroAhorroUf).toBe('50')
    expect(p.financieroMutuoUf).toBe('3000')
    expect(p.financieroPagoContadoUf).toBe('10')
    expect(p.financieroBonoCaptacionUf).toBe('5')
    expect(p.financieroBonoIntegracionUf).toBe('5')
    expect(p.financieroPrecioVentaUf).toBe('2800')
  })

  it('conserva el precio del fixture nuevo al guardar sin tocarlo', () => {
    const p = mapearEdicionSolicitud(NUEVA, NUEVA)
    expect(p.financieroPrecioVentaUf).toBe('12500')
  })
})
