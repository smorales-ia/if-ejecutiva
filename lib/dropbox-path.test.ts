import { describe, expect, it, vi } from 'vitest'

import {
  componerCarpetaDropbox,
  componerPathDropbox,
  derivarSegmentoAnio,
  normalizarCliente,
  normalizarSubtipo,
  RAIZ_DROPBOX,
  type CasoPath,
} from './dropbox-path'

/**
 * Contexto base de los tests de composición: la solicitud VP-2026-0053 de
 * AFIANZA, que es la que usa la spec como ejemplo en §8.1.
 */
const AFIANZA = {
  clienteNombre: 'AFIANZA',
  fechaSolicitud: new Date('2026-07-29T04:00:00.000Z'),
  codigoSolicitud: 'VP-2026-0053',
}

describe('normalizarCliente · §8.5', () => {
  // Los seis casos declarados como "verificados contra datos reales" en §8.5.
  it.each([
    ['AFIANZA', 'AFIANZA'],
    ['Afianza', 'AFIANZA'],
    ['VALÓN Hipotecaria', 'VALON_HIPOTECARIA'],
    ['Banco Estado', 'BANCO_ESTADO'],
    ['M&V', 'M_Y_V'],
    ['La Construcción Hipotecaria', 'LA_CONSTRUCCION_HIPOTECARIA'],
  ])('%s → %s', (entrada, esperado) => {
    expect(normalizarCliente(entrada)).toBe(esperado)
  })

  it('borra los puntos en vez de sustituirlos', () => {
    expect(normalizarCliente('Inmobiliaria S.A.')).toBe('INMOBILIARIA_SA')
  })

  it('colapsa dobles guiones bajos y recorta los bordes', () => {
    expect(normalizarCliente('  Banco   Estado  ')).toBe('BANCO_ESTADO')
    expect(normalizarCliente('& Mutuaria &')).toBe('Y_MUTUARIA_Y')
  })

  it('colapsa los registros duplicados de M_Clientes (consecuencia aceptada §8.5)', () => {
    expect(normalizarCliente('AFIANZA')).toBe(normalizarCliente('Afianza'))
    expect(normalizarCliente('VALÓN Hipotecaria')).toBe(normalizarCliente('Valon Hipotecaria'))
  })
})

describe('normalizarSubtipo · tabla cerrada §8.1', () => {
  // Las once opciones reales del singleSelect `fldNU8ee30AvvRWHZ`.
  it.each([
    ['Departamento', 'departamento'],
    ['Casa', 'casa'],
    ['Bodega', 'bodega'],
    ['Estacionamiento', 'estacionamiento'],
    ['Terreno', 'terreno'],
    ['Local', 'local'],
    ['Terraza', 'terraza'],
    ['Piscina', 'piscina'],
    ['OO.CC.', 'oo_cc'],
    ['Servidumbre', 'servidumbre'],
    ['Edificacion', 'edificacion'],
  ])('%s → %s', (entrada, esperado) => {
    expect(normalizarSubtipo(entrada)).toBe(esperado)
  })

  it('vacío, nulo o indefinido → sin_subtipo, sin warning (es un estado legítimo)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(normalizarSubtipo('')).toBe('sin_subtipo')
    expect(normalizarSubtipo('   ')).toBe('sin_subtipo')
    expect(normalizarSubtipo(null)).toBe('sin_subtipo')
    expect(normalizarSubtipo(undefined)).toBe('sin_subtipo')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('un subtipo fuera de la tabla cae a sin_subtipo y avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(normalizarSubtipo('Loteo')).toBe('sin_subtipo')
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('ninguna opción normaliza a una carpeta reservada', () => {
    const reservadas = new Set(['informe', 'comun', '_ingreso'])
    for (const subtipo of ['Departamento', 'Casa', 'Bodega', 'Estacionamiento', 'Terreno', 'Local', 'Terraza', 'Piscina', 'OO.CC.', 'Servidumbre', 'Edificacion']) {
      expect(reservadas.has(normalizarSubtipo(subtipo))).toBe(false)
    }
  })
})

describe('derivarSegmentoAnio · zona America/Santiago §8.5', () => {
  it('usa el año calendario local, no el UTC', () => {
    // 31-dic-2026 23:30 en Santiago (UTC-3 en verano austral) es 01-ene-2027
    // 02:30 UTC. Sin la conversión de zona la carpeta sería INFORMES_2027.
    expect(derivarSegmentoAnio(new Date('2026-12-31T23:30:00-03:00'))).toBe('INFORMES_2026')
    expect(derivarSegmentoAnio(new Date('2027-01-01T02:30:00.000Z'))).toBe('INFORMES_2026')
  })

  it('el primer instante del año local ya cuenta como año nuevo', () => {
    expect(derivarSegmentoAnio(new Date('2027-01-01T00:00:00-03:00'))).toBe('INFORMES_2027')
  })

  it('caso normal', () => {
    expect(derivarSegmentoAnio(new Date('2026-07-29T04:00:00.000Z'))).toBe('INFORMES_2026')
  })

  it('una fecha inválida no produce un path silenciosamente roto', () => {
    expect(() => derivarSegmentoAnio(new Date('no es una fecha'))).toThrow(/inválida/)
  })
})

describe('componerPathDropbox · plantilla §8.1', () => {
  it('unidad única del subtipo: sin sufijo', () => {
    const caso: CasoPath = {
      tipo: 'unidad',
      subtipoUnidad: 'Departamento',
      numeroUnidad: '411',
      totalDelMismoSubtipo: 1,
    }
    expect(componerPathDropbox({ ...AFIANZA, caso, nombreArchivo: 'cert_avaluo.pdf' })).toBe(
      '/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/departamento/cert_avaluo.pdf'
    )
  })

  it('dos unidades del mismo subtipo: sufijo _{numero_unidad}', () => {
    const base = { tipo: 'unidad', subtipoUnidad: 'Estacionamiento', totalDelMismoSubtipo: 2 } as const
    expect(
      componerCarpetaDropbox({ ...AFIANZA, caso: { ...base, numeroUnidad: '1' } })
    ).toBe('/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/estacionamiento_1')
    expect(
      componerCarpetaDropbox({ ...AFIANZA, caso: { ...base, numeroUnidad: '2' } })
    ).toBe('/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/estacionamiento_2')
  })

  it('numero_unidad de texto libre se sanea a snake_case', () => {
    expect(
      componerCarpetaDropbox({
        ...AFIANZA,
        caso: {
          tipo: 'unidad',
          subtipoUnidad: 'Departamento',
          numeroUnidad: 'D 402',
          totalDelMismoSubtipo: 2,
        },
      })
    ).toBe('/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/departamento_d_402')
  })

  // Cascada de desambiguación CI-003b: numero_unidad → rol_sii → ordinal.
  it('sin numero_unidad usa rol_sii, que identifica de forma estable', () => {
    expect(
      componerCarpetaDropbox({
        ...AFIANZA,
        caso: {
          tipo: 'unidad',
          subtipoUnidad: 'Bodega',
          numeroUnidad: null,
          rolSii: '1234-56',
          totalDelMismoSubtipo: 2,
          ordinalEnGrupo: 1,
        },
      })
    ).toBe('/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/bodega_1234_56')
  })

  it('numero_unidad tiene precedencia sobre rol_sii', () => {
    expect(
      componerCarpetaDropbox({
        ...AFIANZA,
        caso: {
          tipo: 'unidad',
          subtipoUnidad: 'Bodega',
          numeroUnidad: '7',
          rolSii: '1234-56',
          totalDelMismoSubtipo: 2,
        },
      })
    ).toBe('/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/bodega_7')
  })

  it('sin numero_unidad ni rol_sii cae al ordinal, y avisa de que es posicional', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const base = {
      tipo: 'unidad',
      subtipoUnidad: 'Bodega',
      numeroUnidad: null,
      rolSii: null,
      totalDelMismoSubtipo: 2,
    } as const
    expect(componerCarpetaDropbox({ ...AFIANZA, caso: { ...base, ordinalEnGrupo: 1 } })).toBe(
      '/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/bodega_1'
    )
    expect(componerCarpetaDropbox({ ...AFIANZA, caso: { ...base, ordinalEnGrupo: 2 } })).toBe(
      '/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/bodega_2'
    )
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it('los tres escalones de la cascada producen carpetas distintas entre hermanas', () => {
    const hermanas = [
      { numeroUnidad: '1', rolSii: null, ordinalEnGrupo: 1 },
      { numeroUnidad: null, rolSii: '999-1', ordinalEnGrupo: 2 },
    ].map((u) =>
      componerCarpetaDropbox({
        ...AFIANZA,
        caso: { tipo: 'unidad', subtipoUnidad: 'Estacionamiento', totalDelMismoSubtipo: 2, ...u },
      })
    )
    expect(new Set(hermanas).size).toBe(2)
  })

  it('con una sola unidad del subtipo no hay sufijo aunque haya rol_sii', () => {
    expect(
      componerCarpetaDropbox({
        ...AFIANZA,
        caso: {
          tipo: 'unidad',
          subtipoUnidad: 'Casa',
          numeroUnidad: '3',
          rolSii: '1234-56',
          totalDelMismoSubtipo: 1,
        },
      })
    ).toBe('/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/casa')
  })

  it('unidad sin subtipo declarado → sin_subtipo', () => {
    expect(
      componerCarpetaDropbox({
        ...AFIANZA,
        caso: { tipo: 'unidad', subtipoUnidad: null, totalDelMismoSubtipo: 1 },
      })
    ).toBe('/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/sin_subtipo')
  })

  it.each([
    ['comun', 'comun', 'escritura.pdf'],
    ['ingreso', '_ingreso', 'prevision.pdf'],
    ['informe', 'informe', 'informe_final.pdf'],
  ] as const)('carpeta hermana reservada %s', (tipo, carpeta, archivo) => {
    expect(componerPathDropbox({ ...AFIANZA, caso: { tipo }, nombreArchivo: archivo })).toBe(
      `/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/${carpeta}/${archivo}`
    )
  })

  it('el path siempre arranca en la raíz literal, con / inicial', () => {
    const path = componerPathDropbox({
      ...AFIANZA,
      caso: { tipo: 'ingreso' },
      nombreArchivo: 'x.pdf',
    })
    expect(path.startsWith(`${RAIZ_DROPBOX}/`)).toBe(true)
    expect(path.startsWith('/Test_ValueProperty/')).toBe(true)
  })

  it('normaliza el cliente dentro del path', () => {
    expect(
      componerCarpetaDropbox({
        ...AFIANZA,
        clienteNombre: 'VALÓN Hipotecaria',
        caso: { tipo: 'comun' },
      })
    ).toBe('/Test_ValueProperty/INFORMES_2026/VALON_HIPOTECARIA/VP-2026-0053/comun')
  })

  it('la carpeta no incluye el nombre del archivo (es lo que Make pone en `path`)', () => {
    const entrada = { ...AFIANZA, caso: { tipo: 'comun' } as CasoPath }
    expect(componerPathDropbox({ ...entrada, nombreArchivo: 'a.pdf' })).toBe(
      `${componerCarpetaDropbox(entrada)}/a.pdf`
    )
  })

  it('falla antes de componer un path incompleto', () => {
    expect(() =>
      componerCarpetaDropbox({ ...AFIANZA, clienteNombre: '   ', caso: { tipo: 'comun' } })
    ).toThrow(/cliente/)
    expect(() =>
      componerCarpetaDropbox({ ...AFIANZA, codigoSolicitud: '', caso: { tipo: 'comun' } })
    ).toThrow(/codigo_solicitud/)
    expect(() =>
      componerPathDropbox({ ...AFIANZA, caso: { tipo: 'comun' }, nombreArchivo: ' ' })
    ).toThrow(/nombre_archivo/)
  })
})
