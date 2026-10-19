import { describe, expect, it } from 'vitest'
import { normalizarNumeroTecleado as n } from './numero-tecleado'

describe('normalizarNumeroTecleado', () => {
  it('decimal: respeta el punto decimal', () => {
    expect(n('3622.51')).toBe('3622.51')
  })

  it('decimal: la coma es el decimal y los puntos son de miles', () => {
    expect(n('3622,51')).toBe('3622.51')
    expect(n('3.622,51')).toBe('3622.51')
  })

  it('decimal: tecleando «3.622» y luego «,» el punto pasa a ser de miles', () => {
    expect(n('3.622,')).toBe('3622.')
  })

  it('decimal: un segundo separador no se acepta', () => {
    expect(n('3.62.2')).toBe('3.622')
  })

  it('no acepta negativos ni letras salvo que se pida', () => {
    expect(n('-5')).toBe('5')
    expect(n('12a')).toBe('12')
  })

  it('entero: descarta los separadores de miles', () => {
    expect(n('3.300.000', { entero: true })).toBe('3300000')
    expect(n('2024', { entero: true })).toBe('2024')
  })

  it('coordenada: conserva el signo menos inicial', () => {
    expect(n('-33.234583', { negativo: true })).toBe('-33.234583')
    expect(n('-', { negativo: true })).toBe('-')
    expect(n('3-3', { negativo: true })).toBe('33')
  })

  it('vacío queda vacío', () => {
    expect(n('')).toBe('')
  })
})
