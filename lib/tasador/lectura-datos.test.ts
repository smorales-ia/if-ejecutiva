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

import { aComparable, comparablesDeSolicitud, proyectarDatosCaptura } from './lectura-datos'
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
   * A-18 y A-44: las columnas existen y se leen, pero el cuadro fotografiado no
   * las trae y la grilla no las pinta. El test fija que se proyectan —no que
   * tengan valor—, que es lo que D-5 decidió conservar.
   */
  it('proyecta los tres factores aunque la sección D no los muestre', () => {
    const c = aComparable('rec1', { factor_sup: 1.05, factor_edad: 0.9 })

    expect(c.factorSup).toBe('1.05')
    expect(c.factorEdad).toBe('0.9')
    expect(c.factorDistancia).toBe('')
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
