import { describe, expect, it } from 'vitest'
import { aSolicitudParaSheet } from './adaptador-solicitud'
import { documentoAplicaA, desdeTipoPropiedadNuevoUsado } from './tipo-propiedad'
import type { Tasacion } from '@/lib/tasaciones'

/**
 * R7 · RF-TAS-06. El sheet documental de IF-02 se **reutiliza**, no se copia, y
 * para eso hacen falta dos piezas: el adaptador de vocabulario y el filtro de
 * `tipo_propiedad` que sortea **P-5**.
 */

const tasacion = (over: Partial<Tasacion> = {}): Tasacion =>
  ({
    id: 'recABC12345678x',
    codigo: 'VP-2026-0042',
    estado: 'asignada',
    comuna: 'Providencia',
    tipo: 'Departamento',
    tipoPropiedad: 'usado',
    direccion: 'Av. Siempre Viva 742',
    cliente: 'Banco de Chile',
    producto: 'Refinanciamiento',
    visita: 'Por agendar',
    version: 1,
    datos: {
      comuna: { valor: 'Providencia', prellenado: true },
      tipo: { valor: 'Departamento', prellenado: true },
      direccion: { valor: 'Av. Siempre Viva 742', prellenado: true },
      cliente: { valor: 'Banco de Chile', prellenado: true },
    },
    datosEjecutiva: {},
    ...over,
  }) as unknown as Tasacion

describe('aSolicitudParaSheet · adaptador Tasacion → sheet de IF-02', () => {
  it('mapea los cinco campos que el sheet realmente lee', () => {
    const s = aSolicitudParaSheet(tasacion())
    expect(s.id).toBe('recABC12345678x')
    expect(s.codigoExt).toBe('VP-2026-0042')
    expect(s.cliente).toBe('Banco de Chile')
    expect(s.estado).toBe('asignada')
  })

  it('entrega `unidades` vacío para que el backend derive `_ingreso/` (CI-003b)', () => {
    // Con dos o más unidades el checklist exigiría elegir destino, y el tasador
    // no tiene ese dato en Pantalla 3. Vacío no es una omisión: es la decisión.
    expect(aSolicitudParaSheet(tasacion()).unidades).toEqual([])
  })

  it('no inventa campos: sólo expone lo que el tipo declara', () => {
    const s = aSolicitudParaSheet(tasacion())
    expect(Object.keys(s).sort()).toEqual(
      ['cliente', 'codigoExt', 'estado', 'id', 'unidades'].sort(),
    )
  })
})

describe('filtro de RF-TAS-06 · el sheet no debe salir vacío (P-5)', () => {
  /** El predicado tal como lo arma `FotosScreen`. */
  const filtro = (tipoPropiedad: 'nuevo' | 'usado') => {
    const condicion = desdeTipoPropiedadNuevoUsado(tipoPropiedad)
    return (tipoDocumento: string | null) => documentoAplicaA(tipoDocumento, condicion)
  }

  it('una propiedad usada ve los documentos `usada` y los `ambas`', () => {
    const aplica = filtro('usado')
    expect(aplica('usada')).toBe(true)
    expect(aplica('ambas')).toBe(true)
    expect(aplica('nueva')).toBe(false)
  })

  it('una propiedad nueva ve los documentos `nueva` y los `ambas`', () => {
    const aplica = filtro('nuevo')
    expect(aplica('nueva')).toBe(true)
    expect(aplica('ambas')).toBe(true)
    expect(aplica('usada')).toBe(false)
  })

  it('produce coincidencias no vacías pese al desajuste de género de P-5', () => {
    // Éste es el criterio de §6.3: sin la normalización, `'usado' === 'usada'`
    // es falso y el sheet saldría vacío para toda solicitud.
    const catalogo = ['nueva', 'usada', 'ambas', null]
    const visibles = catalogo.filter(filtro('usado'))
    expect(visibles.length).toBeGreaterThan(0)
    expect(visibles).toEqual(['usada', 'ambas'])
  })

  it('un documento sin condición declarada no se cuela', () => {
    expect(filtro('usado')(null)).toBe(false)
    expect(filtro('usado')('')).toBe(false)
  })
})
