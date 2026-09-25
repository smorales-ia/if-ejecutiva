import { describe, expect, it } from 'vitest'

/**
 * Validador anti-cifras RF-32 — fixtures REALES del gold master.
 *
 * Los dos párrafos de abajo son transcripción literal de la página 2 del PDF
 * `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf`
 * (extraída con pymupdf, 25-sep-2026). No se maquillaron: se conservan la
 * mayúscula intra-oración «Tiene» y el corte del párrafo del sector — la celda
 * del PDF **trunca** el texto en «El comercio, el transporte y», así viene el
 * gold master. Estos párrafos son el patrón de estilo que el prompt v1
 * (`docs/_artefactos/plantillas/prompts-textos-informe.md`) usa como few-shot,
 * y aquí son el caso de aceptación del validador: el texto real del informe
 * real DEBE validar contra el payload real de MET-6283.
 */

import { cifrasDePayload, extraerCifras, validarTexto } from './validador-cifras'

/** «Síntesis de la Prop.» — gold master MET-6283, pág. 2, transcripción literal. */
const SINTESIS_GOLD_MASTER =
  'El bien es una vivienda que se encuentra en el Condominio LAS BRISAS DE CHICUREO, ' +
  'ubicado en LOS EUCALIPTUS N°2100. La propiedad tiene 5024,86 m² de terreno. ' +
  'La vivienda original tiene un piso construido en ALBAÑILERÍA LADRILLO. ' +
  'El primer piso Tiene 249,91 m² y cuenta con hall, baño de visitas, living, comedor, ' +
  'cocina, logia, dormitorio y baño de servicio, sala de estar familiar, 3 dormitorios ' +
  'simples, dormitorio principal en suite con walk in closet, 3 baños completos, el baño ' +
  'principal con jacuzzi. El exterior cuenta con antejardín abierto al norte con ' +
  'estacionamiento descubierto para 4 vehículos, patio lateral poniente de paso con ' +
  'bodega en construcción, patio lateral oriente con patio de servicio descubierto, ' +
  'patio trasero al sur con 2 terrazas descubiertas, quincho en una de las terrazas, ' +
  'áreas verdes, piscina.'

/**
 * «Descripción del sector» — gold master MET-6283, pág. 2, transcripción
 * literal. El corte final («El comercio, el transporte y») es del PDF original.
 */
const SECTOR_GOLD_MASTER =
  'El sector es de carácter mixto. El cual se compone de viviendas de baja densidad, ' +
  'viviendas aisladas de diseño particular, agrupadas generalmente en condominios. ' +
  'Conectividad a través de Autopista Los Libertadores, Las Brisas. Sector de ' +
  'parcelaciones rurales. Centros educacionales medianamente cerca. Comercio local por ' +
  'Las Brisas. Los servicios en general se encuentran en el centro de la comuna de ' +
  'Colina. El comercio, el transporte y'

/**
 * Subconjunto del payload real de MET-6283 que respalda la síntesis: los
 * mismos valores que muestra la página 2 del gold master (terreno 5.024,86 m²,
 * primer piso 249,91 m², numeración N°2100, 1 piso). La forma imita al
 * `InformeContexto` anidado — `cifrasDePayload` debe encontrarlos a cualquier
 * profundidad y descartar los `null` de los huecos.
 */
const PAYLOAD_MET6283 = {
  solicitud: { codigo: 'MET-6283', condominio: 'LAS BRISAS DE CHICUREO' },
  propiedad: {
    direccion: 'LOS EUCALIPTUS',
    numeracion: 2100,
    supTerrenoM2: 5024.86,
    pisos: 1,
    materialidad: 'ALBAÑILERÍA LADRILLO',
  },
  niveles: [{ nivel: 1, supConstruidaM2: 249.91 }],
  huecos: { anioConstruccion: null },
}

describe('extraerCifras · formato es-CL', () => {
  it('lee miles con punto y decimal con coma', () => {
    expect(extraerCifras('La propiedad tiene 5.024,86 m² de terreno')).toEqual([5024.86])
  })

  it('lee decimal con coma sin separador de miles (como el gold master)', () => {
    expect(extraerCifras('tiene 5024,86 m² y el piso 249,91 m²')).toEqual([5024.86, 249.91])
  })

  it('lee múltiples grupos de miles sin decimal', () => {
    expect(extraerCifras('avaluado en $3.300.000')).toEqual([3300000])
  })

  it('lee la numeración detrás de N°', () => {
    expect(extraerCifras('ubicado en LOS EUCALIPTUS N°2100')).toEqual([2100])
  })

  it('lee años y enteros sueltos', () => {
    expect(extraerCifras('construida en 2024, con 3 dormitorios')).toEqual([2024, 3])
  })

  it('lee porcentajes como su número literal (4,5% → 4.5)', () => {
    expect(extraerCifras('tasa exigida de 4,5%')).toEqual([4.5])
  })

  it('corta un decimal estilo inglés en dos tokens (regla 7 documentada)', () => {
    // "34.05" no es un número es-CL válido: el punto sólo separa miles en
    // grupos de 3. Se parte en 34 y 5, y cada trozo exigirá su propio respaldo.
    expect(extraerCifras('promedio 34.05 UF/m²')).toEqual([34, 5])
  })

  it('devuelve vacío ante un texto sin cifras', () => {
    expect(extraerCifras('El sector es de carácter mixto.')).toEqual([])
  })
})

describe('validarTexto · la síntesis REAL valida contra el payload REAL (RF-32)', () => {
  it('acepta la síntesis del gold master con las cifras del payload MET-6283', () => {
    const resultado = validarTexto(SINTESIS_GOLD_MASTER, cifrasDePayload(PAYLOAD_MET6283))

    expect(resultado.valido).toBe(true)
    expect(resultado.cifrasNoRespaldadas).toEqual([])
    // Todas las cifras del párrafo, en orden y con repeticiones — incluidas
    // las estructurales (3 dormitorios · 3 baños · 4 vehículos · 2 terrazas),
    // que se admiten sin respaldo pero se reportan para el visador (F4).
    expect(resultado.cifrasEncontradas).toEqual([2100, 5024.86, 249.91, 3, 3, 4, 2])
  })

  it('con permitirEnterosHasta 0 los conteos de recintos exigen respaldo', () => {
    const resultado = validarTexto(SINTESIS_GOLD_MASTER, cifrasDePayload(PAYLOAD_MET6283), {
      permitirEnterosHasta: 0,
    })

    // 2100, 5024.86 y 249.91 siguen respaldados; 3, 4 y 2 quedan huérfanos.
    expect(resultado.valido).toBe(false)
    expect(resultado.cifrasNoRespaldadas).toEqual([3, 4, 2])
  })
})

describe('validarTexto · rechazo de cifras inventadas (RF-32: discrepancia → rechazo)', () => {
  it('rechaza una superficie inventada y la reporta en cifrasNoRespaldadas', () => {
    const textoConInvento = SINTESIS_GOLD_MASTER.replace('5024,86 m²', '6.000 m²')
    const resultado = validarTexto(textoConInvento, cifrasDePayload(PAYLOAD_MET6283))

    expect(resultado.valido).toBe(false)
    expect(resultado.cifrasNoRespaldadas).toEqual([6000])
  })

  it('reporta una cifra inventada repetida una sola vez', () => {
    const resultado = validarTexto('Vale 6.000 UF, sí, 6.000 UF.', [5024.86])

    expect(resultado.valido).toBe(false)
    expect(resultado.cifrasNoRespaldadas).toEqual([6000])
    expect(resultado.cifrasEncontradas).toEqual([6000, 6000])
  })
})

describe('validarTexto · texto sin cifras valida trivialmente', () => {
  it('acepta la descripción del sector del gold master (cero cifras)', () => {
    const resultado = validarTexto(SECTOR_GOLD_MASTER, [])

    expect(resultado.valido).toBe(true)
    expect(resultado.cifrasEncontradas).toEqual([])
    expect(resultado.cifrasNoRespaldadas).toEqual([])
  })
})

describe('validarTexto · redondeo y tolerancia', () => {
  it('el redondeo a 2 decimales casa 5024,86 del texto con 5024.859 del payload', () => {
    const resultado = validarTexto('terreno de 5.024,86 m²', [5024.859])
    expect(resultado.valido).toBe(true)
  })

  it('la tolerancia configurable admite una diferencia acotada', () => {
    expect(validarTexto('unos 249,5 m²', [249.91]).valido).toBe(false)
    expect(validarTexto('unos 249,5 m²', [249.91], { tolerancia: 0.5 }).valido).toBe(true)
  })
})

describe('cifrasDePayload · recorrido recursivo', () => {
  it('junta los number anidados y descarta null, strings y NaN', () => {
    const cifras = cifrasDePayload({
      a: 5024.86,
      b: null,
      c: '249,91', // string numérico: NO se interpreta (regla documentada)
      d: { e: [2100, null, { f: 1 }], g: Number.NaN },
    })

    expect(cifras).toEqual([5024.86, 2100, 1])
  })

  it('deduplica valores repetidos', () => {
    expect(cifrasDePayload({ a: 250, b: { c: 250 } })).toEqual([250])
  })

  it('sobrevive a referencias circulares', () => {
    const nodo: { valor: number; ciclo?: unknown } = { valor: 7 }
    nodo.ciclo = nodo

    expect(cifrasDePayload(nodo)).toEqual([7])
  })
})
