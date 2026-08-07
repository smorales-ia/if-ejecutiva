import { describe, expect, it } from 'vitest'

import {
  DESTINO_COMUN,
  destinoAPayload,
  destinoInicial,
  etiquetaUnidad,
  MSG_SIN_DESTINO,
  requiereSeleccion,
} from './adjuntos-destino'
import type { Unidad } from './console-data'

/** Unidad mínima: sólo los campos que la etiqueta y el destino miran. */
function unidad(parcial: Partial<Unidad> & { id: string }): Unidad {
  return {
    ubicacion: '',
    tipoBien: 'Departamento',
    conRol: true,
    rolSii: '',
    rolEnTramite: false,
    supConstruida: null,
    anioConstruccion: '',
    material: '',
    origenSuperficie: '',
    respaldo: null,
    ...parcial,
  }
}

describe('requiereSeleccion · cuándo hay ambigüedad real', () => {
  it('cero y una unidad no preguntan; dos o más sí', () => {
    expect(requiereSeleccion([])).toBe(false)
    expect(requiereSeleccion([unidad({ id: 'rec1' })])).toBe(false)
    expect(requiereSeleccion([unidad({ id: 'rec1' }), unidad({ id: 'rec2' })])).toBe(true)
  })
})

describe('destinoInicial · default por cantidad de unidades', () => {
  it('sin unidades no hay destino: el backend deriva _ingreso/', () => {
    expect(destinoInicial([])).toBe('')
  })

  it('con una sola unidad se auto-selecciona esa (§9.1 caso a)', () => {
    expect(destinoInicial([unidad({ id: 'recUNICA' })])).toBe('recUNICA')
  })

  it('con dos o más arranca en «común», nunca en la primera unidad', () => {
    const dos = [unidad({ id: 'rec1' }), unidad({ id: 'rec2' })]
    expect(destinoInicial(dos)).toBe(DESTINO_COMUN)
    // La regresión que esto previene es CI-003b: un default silencioso que
    // atribuye el adjunto a una unidad que nadie eligió, en un path inmutable.
    expect(destinoInicial(dos)).not.toBe('rec1')
  })
})

describe('destinoAPayload · contrato con /api/adjuntos/upload', () => {
  it('unidad concreta viaja como unidad_id', () => {
    expect(destinoAPayload('recABC12345678xy', true)).toEqual({
      unidad_id: 'recABC12345678xy',
    })
  })

  it('«común a todas» viaja como carpeta: comun, nunca como unidad_id', () => {
    expect(destinoAPayload(DESTINO_COMUN, true)).toEqual({ carpeta: 'comun' })
  })

  it('sin unidades declaradas no viaja ningún campo de destino', () => {
    expect(destinoAPayload('', false)).toEqual({})
    // Ni siquiera con un destino residual de otra solicitud en el estado.
    expect(destinoAPayload(DESTINO_COMUN, false)).toEqual({})
    expect(destinoAPayload('recVIEJA12345678', false)).toEqual({})
  })

  it('unidad_id y carpeta son mutuamente excluyentes en todos los casos', () => {
    const entradas: Array<[string, boolean]> = [
      ['recABC12345678xy', true],
      [DESTINO_COMUN, true],
      ['', true],
      ['', false],
      [DESTINO_COMUN, false],
    ]
    for (const [destino, hayUnidades] of entradas) {
      const payload = destinoAPayload(destino, hayUnidades)
      expect('unidad_id' in payload && 'carpeta' in payload).toBe(false)
    }
  })
})

describe('etiquetaUnidad · misma cascada que el path (CI-003b)', () => {
  it('usa numero_unidad cuando existe', () => {
    const u = unidad({ id: 'rec1', tipoBien: 'Departamento', ubicacion: '411' })
    expect(etiquetaUnidad(u, [u])).toBe('Departamento 411')
  })

  it('cae a rol_sii cuando no hay numero_unidad', () => {
    const u = unidad({ id: 'rec1', tipoBien: 'Bodega', rolSii: '1234-56' })
    expect(etiquetaUnidad(u, [u])).toBe('Bodega · rol 1234-56')
  })

  it('numero_unidad tiene precedencia sobre rol_sii', () => {
    const u = unidad({
      id: 'rec1',
      tipoBien: 'Bodega',
      ubicacion: '7',
      rolSii: '1234-56',
    })
    expect(etiquetaUnidad(u, [u])).toBe('Bodega 7')
  })

  it('sin ninguno de los dos, ordinal dentro del grupo de mismo tipo', () => {
    const a = unidad({ id: 'recA', tipoBien: 'Estacionamiento' })
    const b = unidad({ id: 'recB', tipoBien: 'Estacionamiento' })
    expect(etiquetaUnidad(a, [a, b])).toBe('Estacionamiento 1')
    expect(etiquetaUnidad(b, [a, b])).toBe('Estacionamiento 2')
  })

  it('sin ordinal si es el único de su tipo', () => {
    const depto = unidad({ id: 'recA', tipoBien: 'Departamento' })
    const bodega = unidad({ id: 'recB', tipoBien: 'Bodega' })
    expect(etiquetaUnidad(depto, [depto, bodega])).toBe('Departamento')
  })

  it('las etiquetas de una solicitud real son todas distintas', () => {
    const unidades = [
      unidad({ id: 'recA', tipoBien: 'Departamento', ubicacion: '411' }),
      unidad({ id: 'recB', tipoBien: 'Estacionamiento', ubicacion: '105' }),
      unidad({ id: 'recC', tipoBien: 'Estacionamiento' }),
      unidad({ id: 'recD', tipoBien: 'Bodega', rolSii: '999-1' }),
    ]
    const etiquetas = unidades.map((u) => etiquetaUnidad(u, unidades))
    expect(new Set(etiquetas).size).toBe(unidades.length)
  })

  it('sin tipoBien declarado no produce una etiqueta vacía', () => {
    const u = unidad({ id: 'rec1', tipoBien: '' })
    expect(etiquetaUnidad(u, [u])).toBe('Unidad')
  })
})

describe('literales §6.1', () => {
  it('el mensaje de destino sin definir está en tuteo, no en voseo', () => {
    expect(MSG_SIN_DESTINO).toBe('Selecciona una unidad de destino antes de subir.')
    expect(MSG_SIN_DESTINO).not.toContain('Seleccioná')
    expect(MSG_SIN_DESTINO).not.toContain('!')
  })
})
