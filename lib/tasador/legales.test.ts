import { describe, it, expect } from 'vitest'
import { componerNumeroYFecha, selloSecGuardado, selloSecPorDefecto } from './legales'
import { OPCIONES } from './tasaciones'

describe('Sello SEC · sugerencia cuando no hay nada guardado (RN-58)', () => {
  const HOY = '2026-10-15'

  it('VP-2026-0079 (casa, sin sello): «No aplica»', () => {
    expect(selloSecPorDefecto({ subtipoPrincipal: 'Casa', vencimiento: '', hoy: HOY })).toBe('no_aplica')
  })

  it('un departamento queda para el tasador (puede ser full eléctrico o no)', () => {
    expect(selloSecPorDefecto({ subtipoPrincipal: 'Departamento', vencimiento: '', hoy: HOY })).toBe('')
  })

  it('con vencimiento leído del sello: vigente o vencido según la fecha', () => {
    expect(selloSecPorDefecto({ subtipoPrincipal: 'Departamento', vencimiento: '2027-03-01', hoy: HOY })).toBe('vigente')
    expect(selloSecPorDefecto({ subtipoPrincipal: 'Departamento', vencimiento: HOY, hoy: HOY })).toBe('vigente')
    expect(selloSecPorDefecto({ subtipoPrincipal: 'Casa', vencimiento: '2025-01-31', hoy: HOY })).toBe('vencido')
  })

  it('lo guardado se respeta sólo si es del dominio de la lista', () => {
    expect(selloSecGuardado('vencido')).toBe('vencido')
    expect(selloSecGuardado('Vigente')).toBe('')
    expect(selloSecGuardado(null)).toBe('')
  })

  it('el dominio coincide con las opciones del formulario', () => {
    for (const v of ['vigente', 'vencido', 'no_aplica']) {
      expect(OPCIONES.selloSec.map((o) => o.v)).toContain(v)
      expect(selloSecGuardado(v)).toBe(v)
    }
  })
})

describe('componerNumeroYFecha · como lo imprime la planilla de MET-6283', () => {
  it('VP-2026-0079: permiso y recepción con dos espacios y sin el sufijo de año', () => {
    expect(componerNumeroYFecha('319-2020', '2020-09-09')).toBe('N°319  09/09/2020')
    expect(componerNumeroYFecha('210-2024', '2024-07-18')).toBe('N°210  18/07/2024')
  })

  it('número sin sufijo, o con barra', () => {
    expect(componerNumeroYFecha('319', '2020-09-09')).toBe('N°319  09/09/2020')
    expect(componerNumeroYFecha('319/2020', '2020-09-09')).toBe('N°319  09/09/2020')
  })

  it('un sufijo que no es el año de la fecha no se toca', () => {
    expect(componerNumeroYFecha('9408/2024', '2020-09-09')).toBe('N°9408/2024  09/09/2020')
  })

  it('lo que no empieza con dígito se imprime tal cual (filas antiguas, textos)', () => {
    expect(componerNumeroYFecha('N°319  09/09/2020', '2020-09-09')).toBe('N°319  09/09/2020')
    expect(componerNumeroYFecha('N°19 // 23-01-2014', '2014-01-23')).toBe('N°19 // 23-01-2014')
    expect(componerNumeroYFecha('S/I', null)).toBe('S/I')
    expect(componerNumeroYFecha('Año 1994', null)).toBe('Año 1994')
    expect(componerNumeroYFecha('PE-88', '2020-09-09')).toBe('PE-88')
  })

  it('sin fecha imprime sólo el número; sin número no imprime nada', () => {
    expect(componerNumeroYFecha('319', null)).toBe('N°319')
    expect(componerNumeroYFecha('', '2020-09-09')).toBe('')
    expect(componerNumeroYFecha(null, null)).toBe('')
  })
})
