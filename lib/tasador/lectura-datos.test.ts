import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Hidratación server-side de la sección D — CI-056, cierre de A-13.
 *
 * ## Por qué este test nace ahora y sólo cubre el bloque D
 *
 * `proyectarDatosCaptura` proyecta ocho secciones y no tenía test propio: su
 * contrato estaba cubierto de rebote por `datos/route.test.ts`, que compara la
 * respuesta del `GET` con la del `PATCH`. El bloque D es distinto porque **es
 * el único que la pantalla no puede recuperar de ninguna otra fuente**: con la
 * sección de sólo lectura, si la proyección no trae los comparables, la grilla
 * queda vacía para siempre y RF-12 no se destraba nunca. Es una regresión muda
 * —ninguna excepción, ningún 500, sólo una tabla vacía— y por eso lleva
 * candado.
 *
 * El resto de las secciones queda como estaba: ampliarlo a las ocho es un test
 * de otra tanda, no un peaje de ésta.
 */

const listRecords = vi.fn()

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return { ...real, listRecords: (...args: unknown[]) => listRecords(...args) }
})

import {
  aComparable,
  calidadSiiANumero,
  comparablesDeSolicitud,
  materialSiiAPredominante,
  proyectarDatosCaptura,
} from './lectura-datos'
import { TABLE_IDS } from './field-ids'

const CODIGO = 'VP-2026-0060'

function fila(id: string, fields: Record<string, unknown>) {
  return { id, createdTime: '', fields }
}

/**
 * `listRecords` responde por tabla. Las seis tablas que no interesan devuelven
 * vacío; `TX_Comparables` devuelve lo que el caso pida.
 */
function airtableCon(comparables: ReturnType<typeof fila>[]) {
  listRecords.mockImplementation(async (tableId: string) =>
    tableId === TABLE_IDS.comparables ? comparables : []
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  airtableCon([])
})

describe('aComparable · una fila de TX_Comparables → Comparable', () => {
  it('normaliza los numéricos a string (D-5)', () => {
    const c = aComparable('rec00000000000001', {
      sup_terreno_m2: 320,
      sup_construccion_m2: 180.5,
      precio_uf: 12500,
      anio: 2015,
    })

    expect(c.supTerreno).toBe('320')
    expect(c.supConstruida).toBe('180.5')
    expect(c.totalUf).toBe('12500')
    expect(c.anio).toBe('2015')
  })

  it('convierte los campos ausentes en cadena vacía, nunca en null', () => {
    const c = aComparable('rec00000000000001', {})

    for (const valor of Object.values(c)) {
      expect(typeof valor).toBe('string')
    }
    expect(c.direccionReferencia).toBe('')
    expect(c.foja).toBe('')
  })

  /**
   * ⚠ El discriminador vive en `tipo_referencia`, **no** en el campo `fuente`
   * de la tabla, que tiene un dominio ajeno. Escribir en el equivocado no
   * fallaría: `typecast` crearía la opción en silencio. Por eso se prueba.
   */
  it('traduce tipo_referencia y no el homónimo `fuente` de la tabla', () => {
    expect(aComparable('rec1', { tipo_referencia: 'Oferta' }).fuente).toBe('oferta')
    expect(aComparable('rec1', { tipo_referencia: 'CBR' }).fuente).toBe('cbr')
    expect(aComparable('rec1', { fuente: 'CBR.' }).fuente).toBe('oferta')
  })

  it('conserva el record id de Airtable como identidad', () => {
    expect(aComparable('rec00000000000009', {}).id).toBe('rec00000000000009')
  })

  /**
   * P13-TAS: la grilla espeja el cuadro cuadro-a-cuadro. La proyección lee las
   * columnas crudas de la foto —fecha, OO.CC. y los dos UF/m² sin recalcular— y
   * las normaliza a texto (D-5). Ausentes → cadena vacía, no `null`.
   */
  it('proyecta las columnas crudas del cuadro', () => {
    const c = aComparable('rec1', {
      fecha_publicacion: '2026-04-01',
      oo_cc_uf: 750,
      uf_m2_terreno_f: 2.2,
      uf_m2_construccion_f: 34.05,
    })

    expect(c.fechaPublicacion).toBe('2026-04-01')
    expect(c.ooCcUf).toBe('750')
    expect(c.ufM2TerrenoF).toBe('2.2')
    expect(c.ufM2ConstruccionF).toBe('34.05')
  })

  it('deja en vacío las columnas crudas que la foto no trajo', () => {
    const c = aComparable('rec1', {})

    expect(c.ooCcUf).toBe('')
    expect(c.ufM2ConstruccionF).toBe('')
  })
})

describe('comparablesDeSolicitud', () => {
  it('no consulta Airtable con el código vacío', async () => {
    expect(await comparablesDeSolicitud('')).toEqual([])
    expect(listRecords).not.toHaveBeenCalled()
  })

  it('filtra por el código de la solicitud', async () => {
    airtableCon([fila('rec00000000000001', {})])

    await comparablesDeSolicitud(CODIGO)

    const [tableId, opciones] = listRecords.mock.calls[0]
    expect(tableId).toBe(TABLE_IDS.comparables)
    expect(opciones.filterByFormula).toContain(CODIGO)
  })
})

describe('candado CI-056 · la sección D llega hidratada a la pantalla', () => {
  /**
   * El candado. Antes de esta tanda `proyectarDatosCaptura` leía seis tablas
   * hijas y `TX_Comparables` no era una de ellas: el formulario abría con
   * `comparables: []` y no se notaba porque el tasador podía teclearlos. Con la
   * grilla de sólo lectura, esa misma ausencia es la sección rota.
   */
  it('devuelve los comparables leídos del cuadro', async () => {
    airtableCon([
      fila('rec00000000000001', {
        direccion: 'Av. Apoquindo 5230',
        precio_uf: 12500,
        sup_construccion_m2: 180,
        tipo_referencia: 'Oferta',
      }),
      fila('rec00000000000002', {
        direccion: 'Los Militares 4600',
        tipo_referencia: 'CBR',
        foja: '1234',
        numero: '567',
      }),
      fila('rec00000000000003', { direccion: 'Isidora Goyenechea 3000' }),
    ])

    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.comparables).toHaveLength(3)
    expect(datos.comparables?.[0].direccionReferencia).toBe('Av. Apoquindo 5230')
    expect(datos.comparables?.[0].totalUf).toBe('12500')
    expect(datos.comparables?.[1].fuente).toBe('cbr')
    expect(datos.comparables?.[1].foja).toBe('1234')
  })

  it('devuelve un arreglo vacío cuando el cuadro no dejó filas', async () => {
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.comparables).toEqual([])
  })

  it('consulta TX_Comparables entre las tablas hijas de la solicitud', async () => {
    await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    const tablas = listRecords.mock.calls.map(([tableId]) => tableId)
    expect(tablas).toContain(TABLE_IDS.comparables)
  })
})

describe('proyección sección H · candado del cap rate', () => {
  /**
   * P7-TAS.A.5 · D-1 · opción A. El preview hidratado (`informe-preview.tsx`)
   * arma el bloque 2 —valor destacado y cap rate— con estas tres claves. El
   * candado fija las dos mitades del hueco de CI-023:
   *
   * - El **numerador** (`arriendo_mensual`, `gasto_anual`) y el **override**
   *   (`valor_final_override`) **sí** se proyectan: tienen columna destino.
   * - El **denominador** `valorReferenciaClp` **no** se proyecta: está en
   *   `CAMPOS_SIN_DESTINO` (CI-023 §1), sin columna en `TX_DatosTasacion`, así
   *   que `proyectarDatosCaptura` no lo emite y el cap rate del preview queda en
   *   «—» a propósito. Si algún día gana columna, este test rompe y obliga a
   *   revisar el preview (deuda registrada en **CI-063**).
   */
  function airtableConDatos(datos: Record<string, unknown>) {
    listRecords.mockImplementation(async (tableId: string) =>
      tableId === TABLE_IDS.datosTasacion ? [fila('recDatos00000001', datos)] : []
    )
  }

  it('proyecta arriendo_mensual y gasto_anual (numerador del cap rate)', async () => {
    airtableConDatos({ arriendo_mensual: 850000, gasto_anual: 1200000 })

    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.arriendoBrutoClp).toBe('850000')
    expect(datos.gastoAnualClp).toBe('1200000')
  })

  it('proyecta valor_final_override de la solicitud a valorSugeridoOverride', async () => {
    const { datos } = await proyectarDatosCaptura({
      codigo_solicitud: CODIGO,
      valor_final_override: 5200,
    })

    expect(datos.valorSugeridoOverride).toBe('5200')
  })

  it('deja valorReferenciaClp sin proyectar: no tiene columna (CI-023 §1 · candado CI-063)', async () => {
    airtableConDatos({ arriendo_mensual: 850000, gasto_anual: 1200000 })

    const { datos } = await proyectarDatosCaptura({
      codigo_solicitud: CODIGO,
      // Aunque la solicitud trajera un valor de referencia, no hay ruta que lo
      // proyecte: la clave no aparece en la salida.
      valor_referencia: 90000000,
    })

    expect('valorReferenciaClp' in datos).toBe(false)
  })
})

describe('P16-TAS · mapeos SII de sección B', () => {
  it('calidad_sii "media inferior" → 2 (case-insensitive, trim)', () => {
    expect(calidadSiiANumero('media inferior')).toBe(2)
    expect(calidadSiiANumero('  Media Inferior ')).toBe(2)
    expect(calidadSiiANumero('superior')).toBe(4)
    expect(calidadSiiANumero('muy superior')).toBe(5)
  })

  it('calidad_sii fuera de dominio o vacía → 0', () => {
    expect(calidadSiiANumero('excelentísima')).toBe(0)
    expect(calidadSiiANumero('')).toBe(0)
  })

  it('tipo_material "albanileria" → "Albañilería" (case-insensitive)', () => {
    expect(materialSiiAPredominante('albanileria')).toBe('Albañilería')
    expect(materialSiiAPredominante('HORMIGON')).toBe('Hormigón')
  })

  it('tipo_material fuera de dominio o vacío → ""', () => {
    expect(materialSiiAPredominante('ladrillo cocido')).toBe('')
    expect(materialSiiAPredominante('')).toBe('')
  })
})

describe('P16-TAS · fallback de sección B a fuentes SII', () => {
  /**
   * `listRecords` responde con `datos` para TX_DatosTasacion y `unidades` para
   * TX_Unidades; el resto de tablas hijas devuelve vacío.
   */
  function airtableConDatosYUnidades(
    datos: Record<string, unknown>,
    unidades: ReturnType<typeof fila>[],
  ) {
    listRecords.mockImplementation(async (tableId: string) => {
      if (tableId === TABLE_IDS.datosTasacion) return [fila('recDatos00000001', datos)]
      if (tableId === TABLE_IDS.unidades) return unidades
      return []
    })
  }

  it('con genéricos vacíos, rellena B desde cg/calidad_sii/TX_Unidades', async () => {
    airtableConDatosYUnidades(
      { cg: 37, calidad_sii: 'media inferior' },
      [fila('recU00000000001', { sup_terreno_m2: 162, anio_construccion: 1972, tipo_material: 'albanileria' })],
    )

    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.supConstruida).toBe('37')
    expect(datos.supTerreno).toBe('162')
    expect(datos.anioConstruccion).toBe('1972')
    expect(datos.materialPredominante).toBe('Albañilería')
    expect(datos.calidadConstruccion).toBe(2)
  })

  it('cuando la columna genérica trae dato, gana el genérico (el tasador editó)', async () => {
    airtableConDatosYUnidades(
      {
        sup_construccion_m2: 120,
        sup_terreno_m2: 500,
        anio_construccion: 2010,
        material_predominante: 'Hormigón',
        calidad_construccion: 4,
        // fuentes SII presentes pero NO deben usarse
        cg: 37,
        calidad_sii: 'media inferior',
      },
      [fila('recU00000000001', { sup_terreno_m2: 162, anio_construccion: 1972, tipo_material: 'madera' })],
    )

    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.supConstruida).toBe('120')
    expect(datos.supTerreno).toBe('500')
    expect(datos.anioConstruccion).toBe('2010')
    expect(datos.materialPredominante).toBe('Hormigón')
    expect(datos.calidadConstruccion).toBe(4)
  })
})

describe('P17-TAS · fixes de lectura (DFL2, tipo de zona, fecha planificada)', () => {
  /** Mock por tabla: datos → TX_DatosTasacion; coordinaciones → TX_CoordinacionVisita. */
  function airtableCon({
    datos = {},
    coordinaciones = [],
  }: {
    datos?: Record<string, unknown>
    coordinaciones?: ReturnType<typeof fila>[]
  }) {
    listRecords.mockImplementation(async (tableId: string) => {
      if (tableId === TABLE_IDS.datosTasacion) return [fila('recDatos00000001', datos)]
      if (tableId === TABLE_IDS.coordinacionVisita) return coordinaciones
      return []
    })
  }

  it('item 1 · dfl2="SI" en Airtable → datos.dfl2 === true', async () => {
    airtableCon({ datos: { dfl2: 'SI' } })
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })
    expect(datos.dfl2).toBe(true)
  })

  it('item 1 · dfl2="NO" o ausente → datos.dfl2 === false', async () => {
    airtableCon({ datos: { dfl2: 'NO' } })
    expect((await proyectarDatosCaptura({ codigo_solicitud: CODIGO })).datos.dfl2).toBe(false)
    airtableCon({ datos: {} })
    expect((await proyectarDatosCaptura({ codigo_solicitud: CODIGO })).datos.dfl2).toBe(false)
  })

  it('item 2a · tipo_zona_descripcion vacío → cae a ubicacion_urbano_rural', async () => {
    airtableCon({ datos: { ubicacion_urbano_rural: 'urbano' } })
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })
    expect(datos.tipoZona).toBe('urbano')
  })

  it('item 2a · tipo_zona_descripcion con dato gana sobre ubicacion_urbano_rural', async () => {
    airtableCon({ datos: { tipo_zona_descripcion: 'Zona típica', ubicacion_urbano_rural: 'urbano' } })
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })
    expect(datos.tipoZona).toBe('Zona típica')
  })

  it('item 3 · fecha_visita_programada vacía → cae a la coordinación confirmada', async () => {
    airtableCon({
      coordinaciones: [
        fila('recCoord0000001', {
          estado_coordinacion: 'confirmada',
          fecha_visita_propuesta: '2026-09-05',
          intento_numero: 1,
        }),
      ],
    })
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })
    expect(datos.fechaPlanificadaVisita).toBe('2026-09-05')
  })

  it('item 3 · toma la confirmada de mayor intento e ignora las no confirmadas', async () => {
    airtableCon({
      coordinaciones: [
        fila('recCoord0000001', {
          estado_coordinacion: 'confirmada',
          fecha_visita_propuesta: '2026-09-05',
          intento_numero: 1,
        }),
        fila('recCoord0000002', {
          estado_coordinacion: 'rechazada',
          fecha_visita_propuesta: '2026-09-09',
          intento_numero: 2,
        }),
        fila('recCoord0000003', {
          estado_coordinacion: 'confirmada',
          fecha_visita_propuesta: '2026-09-12',
          intento_numero: 3,
        }),
      ],
    })
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })
    expect(datos.fechaPlanificadaVisita).toBe('2026-09-12')
  })

  it('item 3 · fecha_visita_programada de la solicitud gana sobre la coordinación', async () => {
    airtableCon({
      coordinaciones: [
        fila('recCoord0000001', {
          estado_coordinacion: 'confirmada',
          fecha_visita_propuesta: '2026-09-05',
          intento_numero: 1,
        }),
      ],
    })
    const { datos } = await proyectarDatosCaptura({
      codigo_solicitud: CODIGO,
      fecha_visita_programada: '2026-08-30',
    })
    expect(datos.fechaPlanificadaVisita).toBe('2026-08-30')
  })
})
