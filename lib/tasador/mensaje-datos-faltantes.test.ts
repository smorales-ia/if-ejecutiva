import { describe, expect, it } from 'vitest'
import { mensajeDatosFaltantes } from './mensaje-datos-faltantes'

describe('mensajeDatosFaltantes', () => {
  it('sin faltantes devuelve null: no se pinta línea', () => {
    expect(mensajeDatosFaltantes([])).toBeNull()
  })

  it('un único dato', () => {
    expect(mensajeDatosFaltantes(['N° Permiso de Edificación'])).toBe(
      'Sin los datos: N° Permiso de Edificación. Completar a mano.'
    )
  })

  it('varios datos van separados por coma, en el orden recibido', () => {
    // Caso real VP-2026-0060 · Escritura de Compraventa.
    expect(
      mensajeDatosFaltantes([
        'N° Permiso de Edificación',
        'Fecha Permiso de Edificación',
        'N° Recepción Final',
        'Fecha Recepción Final',
      ])
    ).toBe(
      'Sin los datos: N° Permiso de Edificación, Fecha Permiso de Edificación, N° Recepción Final, Fecha Recepción Final. Completar a mano.'
    )
  })

  it('usa los nombres verbatim: no transforma snake_case ni acentos', () => {
    expect(mensajeDatosFaltantes(['N° Recepción Final'])).toContain('N° Recepción Final')
  })
})
