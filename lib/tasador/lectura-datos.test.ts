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

  it('con genéricos vacíos, rellena B desde cg/TX_Unidades', async () => {
    airtableConDatosYUnidades(
      { cg: 37, calidad_sii: 'media inferior' },
      [fila('recU00000000001', { sup_terreno_m2: 162, anio_construccion: 1972, tipo_material: 'albanileria' })],
    )

    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.supConstruida).toBe('37')
    expect(datos.supTerreno).toBe('162')
    expect(datos.anioConstruccion).toBe('1972')
    expect(datos.materialPredominante).toBe('Albañilería')
    // calidad_sii ya no se traduce: la planilla no la deriva del SII (H19 = BUENA).
    expect(datos.calidadConstruccion).toBe('BUENA')
  })

  it('cuando la columna genérica trae dato, gana el genérico (el tasador editó)', async () => {
    airtableConDatosYUnidades(
      {
        sup_construccion_m2: 120,
        sup_terreno_m2: 500,
        anio_construccion: 2010,
        material_predominante: 'Hormigón',
        calidad_construccion: 'CORRIENTE',
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
    expect(datos.calidadConstruccion).toBe('CORRIENTE')
  })
})

describe('sección B · estado de conservación y calidad con defaults de la planilla', () => {
  /**
   * 14-oct-2026. El formulario abre con los valores de la planilla del cliente
   * —`[Excel: Antecedentes!Z15 · H19]`— cuando la columna está vacía, y los
   * declara en `prellenados` para el badge. Lo guardado gana siempre.
   */
  function airtableConDatos(datos: Record<string, unknown>) {
    listRecords.mockImplementation(async (tableId: string) =>
      tableId === TABLE_IDS.datosTasacion ? [fila('recDatos00000001', datos)] : []
    )
  }

  it('sin captura previa en usada: BUENO y BUENA, ambos pre-llenados', async () => {
    airtableConDatos({})

    const { datos, prellenados } = await proyectarDatosCaptura({
      codigo_solicitud: CODIGO,
      tipo_propiedad_nuevo_usado: 'usada',
    })

    expect(datos.estadoConservacion).toBe('BUENO')
    expect(datos.calidadConstruccion).toBe('BUENA')
    expect(prellenados).toEqual(['estadoConservacion', 'calidadConstruccion', 'velocidadVenta'])
  })

  it('en nueva el estado cae a NUEVO - S/USO; la calidad sigue en BUENA', async () => {
    airtableConDatos({})

    const { datos } = await proyectarDatosCaptura({
      codigo_solicitud: CODIGO,
      tipo_propiedad_nuevo_usado: 'nueva',
    })

    expect(datos.estadoConservacion).toBe('NUEVO - S/USO')
    expect(datos.calidadConstruccion).toBe('BUENA')
  })

  it('sin fila de datos ni estado de uso declarado: BUENO (no declarado → usada)', async () => {
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.estadoConservacion).toBe('BUENO')
    expect(datos.calidadConstruccion).toBe('BUENA')
  })

  it('lo guardado gana y no se marca como pre-llenado', async () => {
    airtableConDatos({
      estado_conservacion: 'NORMAL',
      calidad_construccion: 'SUPERIOR',
      velocidad_venta_estimada: '4 a 6 meses',
    })

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.estadoConservacion).toBe('NORMAL')
    expect(datos.calidadConstruccion).toBe('SUPERIOR')
    expect(datos.velocidadVenta).toBe('4 a 6 meses')
    expect(prellenados).toEqual([])
  })

  it('sin velocidad de venta guardada parte de «8 a 10 meses», pre-llenada', async () => {
    airtableConDatos({})

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.velocidadVenta).toBe('8 a 10 meses')
    expect(prellenados).toContain('velocidadVenta')
  })

  it('el «Bueno» del catálogo anterior se lee con la grafía de la planilla', async () => {
    airtableConDatos({ estado_conservacion: 'Bueno' })

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.estadoConservacion).toBe('BUENO')
    expect(prellenados).not.toContain('estadoConservacion')
  })

  it('una estrella numérica heredada no se muestra: cae al default BUENA', async () => {
    airtableConDatos({ calidad_construccion: 4 })

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.calidadConstruccion).toBe('BUENA')
    expect(prellenados).toContain('calidadConstruccion')
  })
})

describe('sección B · pisos, dormitorios y baños desde los documentos (19-oct-2026)', () => {
  const ADJUNTOS = [
    fila('recAdj000000001', {
      clave_adjunto: 'foto_plano_cuadro_superficies',
      atributos_obtenidos: JSON.stringify({
        items: [
          { codigo_atributo: 'numero_dormitorios', valor: '4' },
          { codigo_atributo: 'numero_banos', valor: '4' },
          { codigo_atributo: 'superficie_terraza_m2', valor: 'NO REGISTRA' },
        ],
      }),
    }),
    fila('recAdj000000002', {
      clave_adjunto: 'permiso_edificacion',
      atributos_obtenidos: JSON.stringify({ items: [{ codigo_atributo: 'numero_pisos', valor: '1' }] }),
    }),
    fila('recAdj000000003', {
      clave_adjunto: 'foto_ofertas_comparables',
      atributos_obtenidos: JSON.stringify({ items: [{ codigo_atributo: 'numero_pisos', valor: '3' }] }),
    }),
  ]

  function airtableCon(datos: Record<string, unknown>) {
    listRecords.mockImplementation(async (tableId: string) =>
      tableId === TABLE_IDS.adjuntos
        ? ADJUNTOS
        : tableId === TABLE_IDS.datosTasacion
          ? [fila('recDatos00000001', datos)]
          : []
    )
  }

  it('sin valor guardado toma el plano y el permiso, pre-llenados', async () => {
    airtableCon({})

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.dormitorios).toBe('4')
    expect(datos.banos).toBe('4')
    expect(datos.pisosPropiedad).toBe('1') // no el «3» de un comparable
    expect(prellenados).toEqual(expect.arrayContaining(['dormitorios', 'banos', 'pisosPropiedad']))
  })

  it('lo guardado gana y no se marca', async () => {
    airtableCon({ dormitorios: 5, banos: 2, pisos: 2 })

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.dormitorios).toBe('5')
    expect(datos.pisosPropiedad).toBe('2')
    expect(prellenados).not.toContain('dormitorios')
  })
})

describe('sección A · fecha real heredada de la planificada (RF-TAS-17 · 19-oct-2026)', () => {
  it('sin fecha real guardada muestra la planificada, pre-llenada', async () => {
    const { datos, prellenados } = await proyectarDatosCaptura({
      codigo_solicitud: CODIGO,
      fecha_visita_programada: '2026-04-13',
    })

    expect(datos.fechaPlanificadaVisita).toBe('2026-04-13')
    expect(datos.fechaVisitaReal).toBe('2026-04-13')
    expect(prellenados).toContain('fechaVisitaReal')
  })

  it('la fecha real guardada gana y no se marca como pre-llenada', async () => {
    const { datos, prellenados } = await proyectarDatosCaptura({
      codigo_solicitud: CODIGO,
      fecha_visita_programada: '2026-04-13',
      fecha_visita: '2026-04-15',
    })

    expect(datos.fechaVisitaReal).toBe('2026-04-15')
    expect(prellenados).not.toContain('fechaVisitaReal')
  })

  it('sin planificada ni real queda vacía y sigue faltando', async () => {
    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.fechaVisitaReal).toBe('')
    expect(prellenados).not.toContain('fechaVisitaReal')
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

  /* §2.8.1 (14-oct-2026) retira el fallback del item 2a: el campo es el código
     de zona del plan regulador y «urbano» no lo es. */
  it('tipo de zona · tipo_zona_descripcion vacío → vacío, sin caer a ubicacion_urbano_rural', async () => {
    airtableCon({ datos: { ubicacion_urbano_rural: 'urbano' } })
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })
    expect(datos.tipoZona).toBe('')
  })

  it('tipo de zona · devuelve el código guardado tal cual', async () => {
    airtableCon({ datos: { tipo_zona_descripcion: 'IPB', ubicacion_urbano_rural: 'urbano' } })
    const { datos } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })
    expect(datos.tipoZona).toBe('IPB')
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

describe('sección C · cuadro de valoración propuesto (spec §2.8.2)', () => {
  /** VP-2026-0079 tal como estaba en Airtable el 14-oct-2026 (réplica MET-6283). */
  function airtableVp0079(items: ReturnType<typeof fila>[] = []) {
    listRecords.mockImplementation(async (tableId: string) => {
      if (tableId === TABLE_IDS.datosTasacion) {
        return [fila('recr34Am4gXsVyQrI', { sup_construccion_m2: 249.91, sup_primer_piso_m2: 249.91, servidumbre_m2: 3622.51 })]
      }
      if (tableId === TABLE_IDS.unidades) {
        return [fila('receXRGWbpYBg26xl', {
          subtipo: 'Casa', rol_sii: '882-40', sup_m2: 249.91, sup_terreno_m2: 5024.86, anio_construccion: 2024,
          tipo_material: 'albanileria', origen_superficie: 'plano', orden: 1, con_rol_o_uso_y_goce: 'con_rol',
        })]
      }
      if (tableId === TABLE_IDS.documentosLegales) return [fila('rec4zGgDXFD4Ry7oH', { recepcion_final_numero: '210-2024' })]
      if (tableId === TABLE_IDS.itemsCuadroValoracion) return items
      return []
    })
  }

  it('sin filas guardadas propone Terreno, Servidumbre y Piso 1 y lo declara pre-llenado', async () => {
    airtableVp0079()

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO, tipo_propiedad_nuevo_usado: 'usada' })

    expect(datos.items?.map((i) => [i.descripcion, i.tipo, i.superficieM2, i.rolSii, i.ufM2Unitario])).toEqual([
      ['Terreno', 'Terreno', '1402.35', '882-40', ''],
      ['Servidumbre', 'Terreno', '3622.51', '882-40', ''],
      ['Piso 1', 'Edificacion', '249.91', '882-40', ''],
    ])
    expect(prellenados).toContain('items')
  })

  it('con filas guardadas no propone nada: muestra las del tasador y no las marca', async () => {
    airtableVp0079([fila('recItem000000001', { descripcion: 'Terreno', tipo_item: 'Terreno', sup_m2: 1402.35, uf_m2_unitario: 8 })])

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.items?.map((i) => [i.id, i.ufM2Unitario])).toEqual([['recItem000000001', '8']])
    expect(prellenados).not.toContain('items')
  })
})

describe('proyección sección F · documentos legales desde la lectura (spec §2.8.3 · 15-oct-2026)', () => {
  /** VP-2026-0079 tras consolidar: escritura 2020, permiso, recepción, SERVIU y mapa SII. */
  const LEGALES_0079 = {
    fojas: '3312',
    numero_inscripcion: '4663',
    ano_inscripcion: 2020,
    permiso_edificacion_numero: '319-2020',
    permiso_edificacion_fecha: '2020-09-09',
    recepcion_final_numero: '210-2024',
    recepcion_final_fecha: '2024-07-18',
  }
  const DATOS_0079 = { n_cert_no_expropiacion: '3444743', lat: -33.23458, long: -70.675087 }

  function airtableF(legales: Record<string, unknown>, datos: Record<string, unknown>, subtipo = 'Casa') {
    listRecords.mockImplementation(async (tableId: string) => {
      if (tableId === TABLE_IDS.documentosLegales) return [fila('recLegal00000001', legales)]
      if (tableId === TABLE_IDS.datosTasacion) return [fila('recDatos00000001', datos)]
      if (tableId === TABLE_IDS.unidades) return [fila('recUnidad0000001', { subtipo, es_principal: true, orden: 1 })]
      return []
    })
  }

  it('lo escrito por la lectura llega con valor y con badge; el Sello SEC de una casa, «No aplica»', async () => {
    airtableF({ ...LEGALES_0079, origen_dato: 'extraido_rf09' }, { ...DATOS_0079, origen_dato: 'extraido_rf09' })

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect([datos.cbrFoja, datos.cbrNumero, datos.cbrAnio]).toEqual(['3312', '4663', '2020'])
    expect([datos.nPermisoEdificacion, datos.fechaPermisoEdif]).toEqual(['319-2020', '2020-09-09'])
    expect([datos.nRecepcionFinal, datos.fechaRecepcionFinal]).toEqual(['210-2024', '2024-07-18'])
    expect([datos.nCertificadoNoExpropiacion, datos.coordenadasLat, datos.coordenadasLng]).toEqual([
      '3444743',
      '-33.23458',
      '-70.675087',
    ])
    expect(datos.selloSec).toBe('no_aplica')
    expect(prellenados).toEqual(
      expect.arrayContaining(['cbrFoja', 'cbrAnio', 'nPermisoEdificacion', 'coordenadasLat', 'nCertificadoNoExpropiacion', 'selloSec']),
    )
    // Campos vacíos no se marcan: no hay nada que revisar.
    expect(prellenados).not.toContain('selloSecId')
  })

  it('desde que el tasador guarda (tipeado), los valores son suyos: sin badge', async () => {
    airtableF(
      { ...LEGALES_0079, origen_dato: 'tipeado', sello_sec: 'vigente' },
      { ...DATOS_0079, origen_dato: 'tipeado' },
    )

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.cbrFoja).toBe('3312')
    expect(datos.selloSec).toBe('vigente')
    for (const clave of ['cbrFoja', 'nPermisoEdificacion', 'coordenadasLat', 'selloSec'] as const) {
      expect(prellenados).not.toContain(clave)
    }
  })

  it('un departamento sin sello leído no recibe sugerencia de Sello SEC', async () => {
    airtableF({ origen_dato: 'extraido_rf09' }, {}, 'Departamento')

    const { datos, prellenados } = await proyectarDatosCaptura({ codigo_solicitud: CODIGO })

    expect(datos.selloSec).toBe('')
    expect(prellenados).not.toContain('selloSec')
  })
})
