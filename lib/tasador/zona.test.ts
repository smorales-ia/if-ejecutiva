import { describe, expect, it } from 'vitest'
import { codigoDeZona, componerZona, zonaEnCatalogo, type ZonaCatalogo } from './zona'

/**
 * Zona de la propiedad (spec §2.8.1 · 14-oct-2026). Casos tomados de la
 * planilla de MET-6283 (`AA21 = IPB`, `Impresion!X15 = IPB(Colina)`) y de las
 * filas reales de `TX_DatosTasacion` / `M_Zonificacion`.
 */

const COLINA: ZonaCatalogo[] = [
  { id: 'recA1', zona: 'A1' },
  { id: 'recE2a', zona: 'E2a' },
]
const SAN_JOSE: ZonaCatalogo[] = [
  { id: 'recZAP', zona: 'ZAP (San José de Maipo)' },
  { id: 'recZAPObra', zona: 'ZAP (La Obra)' },
]

describe('componerZona · lo que imprime el informe', () => {
  it('CODIGO(Comuna) sin espacio, como Impresion!X15', () => {
    expect(componerZona('IPB', 'Colina')).toBe('IPB(Colina)')
  })

  it('sin código → vacío; sin comuna o con el placeholder → el código solo', () => {
    expect(componerZona('', 'Colina')).toBe('')
    expect(componerZona('  ', 'Colina')).toBe('')
    expect(componerZona('IPB', '')).toBe('IPB')
    expect(componerZona('IPB', '—')).toBe('IPB')
    expect(componerZona('IPB', null)).toBe('IPB')
  })

  it('no recorta: un código del catálogo que ya nombra su comuna imprime como el Excel', () => {
    expect(componerZona('ZAP (San José de Maipo)', 'San José de Maipo')).toBe(
      'ZAP (San José de Maipo)(San José de Maipo)',
    )
  })
})

describe('codigoDeZona · lo que se guarda y se muestra en el campo', () => {
  it('toma la grafía del catálogo sin distinguir mayúsculas ni tildes', () => {
    expect(codigoDeZona(' e2A ', 'Colina', COLINA)).toBe('E2a')
  })

  it('una zona fuera del catálogo queda tal como se escribió', () => {
    expect(codigoDeZona(' IPB ', 'Colina', COLINA)).toBe('IPB')
  })

  it('filas viejas: quita «(Comuna)» final cuando es la comuna, con o sin espacio y tildes', () => {
    expect(codigoDeZona('IPB (Estación Central)', 'Estación Central')).toBe('IPB')
    expect(codigoDeZona('IPB(estacion central)', 'Estación Central')).toBe('IPB')
    expect(codigoDeZona('A1 (Colina)', 'Colina', COLINA)).toBe('A1')
  })

  it('no recorta un paréntesis que no es la comuna', () => {
    expect(codigoDeZona('ZH2 (El Melocotón)', 'San José de Maipo')).toBe('ZH2 (El Melocotón)')
    expect(codigoDeZona('E(c)2', 'San José de Maipo')).toBe('E(c)2')
    expect(codigoDeZona('Rural - IPB Colina', 'Colina')).toBe('Rural - IPB Colina')
  })

  it('no recorta un código del catálogo que termina en el nombre de su comuna', () => {
    expect(codigoDeZona('ZAP (San José de Maipo)', 'San José de Maipo', SAN_JOSE)).toBe(
      'ZAP (San José de Maipo)',
    )
  })

  it('sin comuna conocida no recorta nada', () => {
    expect(codigoDeZona('IPB (Colina)', '—')).toBe('IPB (Colina)')
    expect(codigoDeZona('IPB (Colina)', '')).toBe('IPB (Colina)')
  })

  it('vacío o nulo → vacío', () => {
    expect(codigoDeZona(undefined, 'Colina')).toBe('')
    expect(codigoDeZona('   ', 'Colina', COLINA)).toBe('')
  })

  it('es idempotente con componerZona: guardar lo impreso vuelve al código', () => {
    const impreso = componerZona('IPB', 'Colina')
    expect(codigoDeZona(impreso, 'Colina', COLINA)).toBe('IPB')
  })
})

describe('zonaEnCatalogo', () => {
  it('encuentra por código normalizado y devuelve la fila', () => {
    expect(zonaEnCatalogo('a1', COLINA)).toEqual({ id: 'recA1', zona: 'A1' })
  })

  it('null para código vacío o ausente', () => {
    expect(zonaEnCatalogo('', COLINA)).toBeNull()
    expect(zonaEnCatalogo('IPB', COLINA)).toBeNull()
  })
})
