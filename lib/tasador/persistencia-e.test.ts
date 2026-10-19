import { describe, expect, it } from 'vitest'
import { seccionEPorDefecto, type ContextoE, type SeccionE } from './antecedentes-e'
import {
  filasAmpliaciones,
  filasHabitaciones,
  filasTerminaciones,
  normalizarSeccionE,
  TIPO_RECINTO_AIRTABLE,
} from './persistencia-e'

const CTX: ContextoE = {
  tipoPropiedad: 'Casa',
  nueva: false,
  estadoConservacion: 'BUENO',
  pisos: '1',
  supConstruida: '249.91',
  supPrimerPiso: '249.91',
  estacionamientos: '0',
  bodegas: '0',
}

const TABLA = {
  estar: { pavimento: 'PISO FLOTANTE', revestimiento_muros: 'ESMALTE', cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA' },
}

function conHabitaciones(base: SeccionE): SeccionE {
  return {
    ...base,
    habitaciones: {
      ...base.habitaciones,
      n1: { ...base.habitaciones.n1, cantidades: { dormSimple: 3, medioBano: 1, escritorio: 1, banos: 0 } },
    },
  }
}

describe('normalizarSeccionE', () => {
  it('deja sólo las claves de la hoja y descarta conteos en cero o inválidos', () => {
    const e = normalizarSeccionE({
      ...(conHabitaciones(seccionEPorDefecto(CTX, TABLA)) as object),
      intrusa: 'x',
      comodidades: { piscina: 'SI', inventada: 'SI' },
    } as never)

    expect(Object.keys(e).sort()).toEqual(['ampliaciones', 'comodidades', 'elementos', 'habitaciones', 'terminaciones'])
    expect(e.comodidades.piscina).toBe('SI')
    expect('inventada' in e.comodidades).toBe(false)
    expect(e.habitaciones.n1.cantidades).toEqual({ dormSimple: 3, medioBano: 1, escritorio: 1 })
  })

  it('es idempotente: normalizar dos veces da lo mismo', () => {
    const una = normalizarSeccionE(seccionEPorDefecto(CTX, TABLA))
    expect(normalizarSeccionE(una)).toEqual(una)
  })
})

describe('TX_HabitacionesPorNivel', () => {
  it('una fila por tipo con cantidad, con opciones existentes del singleSelect', () => {
    const filas = filasHabitaciones(normalizarSeccionE(conHabitaciones(seccionEPorDefecto(CTX, TABLA))), 'VP-2026-0079')

    expect(filas).toEqual([
      {
        clave: 'VP-2026-0079-Piso1-D.Simple',
        fields: { nombre: 'Piso1 · D. simple', nivel: 'Piso1', tipo_recinto: 'D.Simple', cantidad: 3 },
      },
      {
        clave: 'VP-2026-0079-Piso1-Estudio',
        fields: { nombre: 'Piso1 · Escritorio', nivel: 'Piso1', tipo_recinto: 'Estudio', cantidad: 1 },
      },
      {
        clave: 'VP-2026-0079-Piso1-1/2 Baño',
        fields: { nombre: 'Piso1 · ½ baño', nivel: 'Piso1', tipo_recinto: '1/2 Baño', cantidad: 1 },
      },
    ])
  })

  it('los 14 tipos van a opciones distintas', () => {
    const valores = Object.values(TIPO_RECINTO_AIRTABLE)
    expect(new Set(valores).size).toBe(14)
  })
})

describe('TX_Ampliaciones', () => {
  it('sólo las filas con datos, clave por fila de la hoja y año sacado del RIF', () => {
    const base = seccionEPorDefecto(CTX, TABLA)
    const e: SeccionE = {
      ...base,
      ampliaciones: [
        base.ampliaciones[0],
        { regulado: 'SI', pe: '123', rif: '45 / 2019', regulacion: '', m2: '18.5' },
        base.ampliaciones[2],
      ],
    }

    expect(filasAmpliaciones(e, 'VP-1')).toEqual([
      {
        clave: 'VP-1-amp-2',
        fields: {
          nombre: 'Ampliación 2',
          descripcion: 'Regulada: SI · P.E. 123 · RIF 45 / 2019',
          sup_m2: 18.5,
          anno_regularizacion: 2019,
        },
      },
    ])
  })
})

describe('TX_TerminacionesPorRecinto', () => {
  it('formato largo Pisos · Muros · Cielos, sólo con valor', () => {
    const filas = filasTerminaciones(seccionEPorDefecto(CTX, TABLA), 'VP-1')
    expect(filas).toEqual([
      { clave: 'VP-1-estar-Pisos', fields: { nombre: 'Estar', categoria: 'Pisos', descripcion: 'PISO FLOTANTE' } },
      { clave: 'VP-1-estar-Muros', fields: { nombre: 'Estar', categoria: 'Muros', descripcion: 'ESMALTE' } },
      { clave: 'VP-1-estar-Cielos', fields: { nombre: 'Estar', categoria: 'Cielos', descripcion: 'ENLUCIDO / PINTURA' } },
    ])
  })
})
