import { describe, expect, it } from 'vitest'
import { OPCIONES } from './tasaciones'
import {
  CALIDAD_CONSTRUCCION_POR_DEFECTO,
  calidadConstruccionGuardada,
  estadoConservacionGuardado,
  estadoConservacionPorDefecto,
  opcionesConValorVigente,
} from './defaults-propiedad'

/**
 * Candado de los dos catálogos contra la planilla del cliente (14-oct-2026).
 * Las listas son copia literal de las data validations de
 * `[Excel: Antecedentes!Z15]` y `[Excel: Antecedentes!H19]` del libro de
 * MET-6283, en el mismo orden. Si alguien «limpia» un literal, rompe acá.
 */
describe('catálogos de la sección B = listas de la planilla', () => {
  it('estado de conservación: Antecedentes!Z15', () => {
    expect(OPCIONES.estadoConservacionInmueble.map((o) => o.v)).toEqual([
      'NUEVO - S/USO',
      'BUENO',
      'NORMAL',
      'MALO',
      'DEFICIENTE',
    ])
  })

  it('calidad de construcción: Antecedentes!H19', () => {
    expect(OPCIONES.calidadConstruccion.map((o) => o.v)).toEqual([
      'DEFICIENTE',
      'INFERIOR',
      'REGULAR',
      'CORRIENTE',
      'BUENA',
      'SUPERIOR',
    ])
  })

  it('lo que se ve es lo que se guarda (v = l, sin divergencia RO-08)', () => {
    for (const o of [...OPCIONES.estadoConservacionInmueble, ...OPCIONES.calidadConstruccion]) {
      expect(o.l).toBe(o.v)
    }
  })

  it('los dos defaults pertenecen a su catálogo', () => {
    const estados = OPCIONES.estadoConservacionInmueble.map((o) => o.v)
    expect(estados).toContain(estadoConservacionPorDefecto('usada'))
    expect(estados).toContain(estadoConservacionPorDefecto('nueva'))
    expect(OPCIONES.calidadConstruccion.map((o) => o.v)).toContain(CALIDAD_CONSTRUCCION_POR_DEFECTO)
  })
})

describe('estadoConservacionPorDefecto · [Excel: Antecedentes!Z15]', () => {
  it('usada → BUENO', () => {
    expect(estadoConservacionPorDefecto('usada')).toBe('BUENO')
  })

  it('nueva → NUEVO - S/USO (tolera mayúsculas y espacios)', () => {
    expect(estadoConservacionPorDefecto('nueva')).toBe('NUEVO - S/USO')
    expect(estadoConservacionPorDefecto(' Nueva ')).toBe('NUEVO - S/USO')
  })

  it('no declarado o fuera de eje → BUENO (no declarado → usada, CI-069)', () => {
    expect(estadoConservacionPorDefecto(undefined)).toBe('BUENO')
    expect(estadoConservacionPorDefecto('')).toBe('BUENO')
    expect(estadoConservacionPorDefecto('nuevo')).toBe('BUENO')
  })

  it('la calidad no ramifica: siempre BUENA', () => {
    expect(CALIDAD_CONSTRUCCION_POR_DEFECTO).toBe('BUENA')
  })
})

describe('lectura de lo guardado', () => {
  it('lleva la grafía del catálogo viejo a la de la planilla', () => {
    expect(estadoConservacionGuardado('Bueno')).toBe('BUENO')
    expect(estadoConservacionGuardado(' malo ')).toBe('MALO')
    expect(calidadConstruccionGuardada('Buena')).toBe('BUENA')
  })

  it('conserva un valor histórico fuera del catálogo en vez de descartarlo', () => {
    expect(estadoConservacionGuardado('Muy Bueno')).toBe('Muy Bueno')
  })

  it('vacío, null o número (estrella heredada) → vacío', () => {
    expect(estadoConservacionGuardado(undefined)).toBe('')
    expect(estadoConservacionGuardado('  ')).toBe('')
    expect(calidadConstruccionGuardada(null)).toBe('')
    expect(calidadConstruccionGuardada(4)).toBe('')
  })
})

describe('opcionesConValorVigente', () => {
  it('no toca el catálogo si el valor pertenece a él o está vacío', () => {
    expect(opcionesConValorVigente(OPCIONES.calidadConstruccion, 'BUENA')).toBe(
      OPCIONES.calidadConstruccion
    )
    expect(opcionesConValorVigente(OPCIONES.calidadConstruccion, '')).toBe(
      OPCIONES.calidadConstruccion
    )
  })

  it('agrega al final un valor histórico para que se vea en la lista', () => {
    const opciones = opcionesConValorVigente(OPCIONES.estadoConservacionInmueble, 'Muy Bueno')
    expect(opciones).toHaveLength(OPCIONES.estadoConservacionInmueble.length + 1)
    expect(opciones.at(-1)).toEqual({ v: 'Muy Bueno', l: 'Muy Bueno' })
  })
})
