/**
 * Sección I «Sector, terreno y normativa» (23-oct-2026). Los valores esperados
 * son los de MET-6283 (`docs/_referencias/1951-MET 6283-…xlsm`, hojas
 * «Antecedentes» y «Portada»), que es la réplica en curso sobre VP-2026-0079.
 */

import { describe, expect, it } from 'vitest'

import { seccionEPorDefecto, contextoE } from './antecedentes-e'
import {
  borradorDescripcionSector,
  borradorSintesisPropiedad,
  cambiarLey6071,
  casaNumeroDeDireccion,
  completarSeccionI,
  contextoI,
  cualitativaDeSeccionI,
  datosSintesisPropiedad,
  ley6071PorDefecto,
  normalizarSeccionI,
  pctOtros,
  reaplicarContextoI,
  seccionIPorDefecto,
  textoExpropiacion,
  type ContextoI,
} from './antecedentes-i'

/** Filas de `C_DefaultsAntecedentes` sembradas el 23-oct-2026 para Casa · usado. */
const TABLA_CASA = {
  diseno_arquitectonico: { valor: 'TIPICO' },
  utilidad_funcional: { valor: 'ADECUADA' },
  tipo_adosamiento: { valor: 'AISLADA' },
  predio_vista: { valor: 'BUENO' },
  relacion_terreno_construccion: { valor: 'ADECUADO' },
  iluminacion_natural: { valor: 'ADECUADA' },
  cumple_uso_actual: { valor: 'SI' },
  cumple_tipo_construccion: { valor: 'SI' },
  cambios_plan_regulador: { valor: 'NO CONTEMPLA' },
  ley_9135: { valor: 'NO' },
  alcantarillado: { valor: 'Colector' },
  afecto_expropiacion: { valor: 'NO' },
  fuente_informacion: { valor: 'DOM, Plano Catastro' },
}

const CTX_6283: ContextoI = contextoI(
  { tipo: 'Casa', nueva: false, destinoSii: 'Habitacional', ubicacionUrbanoRural: 'rural' },
  { agrupacionPropiedad: 'Condominio', anioConstruccion: '2024', orientacion: ['N'] },
)

describe('seccionIPorDefecto · MET-6283 (Casa usada en condominio, 2024)', () => {
  const i = seccionIPorDefecto(CTX_6283, TABLA_CASA)

  it('emplazamiento: agrupamiento desde la sección B y fijos de la tabla', () => {
    expect(i.emplazamiento).toEqual({
      tipoAgrupamiento: 'CONDOMINIO',
      disenoArquitectonico: 'TIPICO',
      utilidadFuncional: 'ADECUADA',
      tipoAdosamiento: 'AISLADA',
      predioVista: 'BUENO',
      orientacionConstruccion: 'NORTE',
      relacionTerrenoConstruccion: 'ADECUADO',
      iluminacionNatural: 'ADECUADA',
    })
  })

  it('normativa: OGUC sin zona, leyes por fórmula y plan regulador de la tabla', () => {
    expect(i.normativa).toMatchObject({
      supPredialMinimo: 'OGUC',
      sistemaAgrupamiento: 'OGUC',
      ley6071: 'NO',
      ley9135: 'NO',
      ley19537: 'SI',
      cumpleUsoActual: 'SI',
      cumpleTipoConstruccion: 'SI',
      usoMasProbable: 'HABITACIONAL',
      cambiosPlanRegulador: 'NO CONTEMPLA',
    })
  })

  it('sector: tipo de zona desde el SII y gas por tipo de propiedad; el resto lo carga el tasador', () => {
    expect(i.sector.tipoZona).toBe('Rural')
    expect(i.sector.gas).toBe('Licuado')
    expect(i.sector.demanda).toBe('')
    expect(i.sector.arteriaPrincipal).toBe('')
  })

  it('terreno, instalaciones y detalle', () => {
    expect(i.terreno.orientacion).toBe('NORTE')
    expect(i.instalaciones.alcantarillado).toBe('Colector')
    expect(i.detalle).toEqual({
      sitioLote: '',
      mansarda: 'No',
      afectoExpropiacion: 'NO',
      fuenteInformacion: 'DOM, Plano Catastro',
    })
  })

  it('sin tabla (combinación sin filas) los fijos quedan vacíos, no se heredan', () => {
    const vacia = seccionIPorDefecto(CTX_6283, {})
    expect(vacia.emplazamiento.disenoArquitectonico).toBe('')
    expect(vacia.detalle.fuenteInformacion).toBe('')
    // Las fórmulas siguen corriendo.
    expect(vacia.emplazamiento.tipoAgrupamiento).toBe('CONDOMINIO')
  })
})

describe('fórmulas de la planilla', () => {
  it('Ley 6071 (AT8): departamento o condominio anterior a 1995', () => {
    const base = { ...CTX_6283 }
    expect(ley6071PorDefecto({ ...base, anioConstruccion: '1990' })).toBe('SI')
    expect(ley6071PorDefecto({ ...base, tipoPropiedad: 'Departamento', agrupacion: '', anioConstruccion: '1980' })).toBe('SI')
    expect(ley6071PorDefecto({ ...base, agrupacion: 'Individual', anioConstruccion: '1980' })).toBe('NO')
    // Sin año no hay cómo saberlo: NO (la planilla compararía vacío < 1995).
    expect(ley6071PorDefecto({ ...base, anioConstruccion: '' })).toBe('NO')
  })

  it('Ley 19537 (AT10) sigue a la 6071 al cambiarla', () => {
    const i = seccionIPorDefecto(CTX_6283, TABLA_CASA)
    expect(cambiarLey6071(i, 'SI').normativa.ley19537).toBe('NO')
    expect(cambiarLey6071(i, 'NO').normativa.ley19537).toBe('SI')
  })

  it('departamento: gas «Red Pública», sin mansarda, adosamiento de su tabla', () => {
    const ctx = contextoI(
      { tipo: 'Departamento', nueva: false, destinoSii: '', ubicacionUrbanoRural: 'urbano' },
      { agrupacionPropiedad: 'Edificio', anioConstruccion: '2010', orientacion: ['NO'] },
    )
    const i = seccionIPorDefecto(ctx, { tipo_adosamiento: { valor: 'EDIF DPTO' } })
    expect(i.sector.gas).toBe('Red Pública')
    expect(i.sector.tipoZona).toBe('Urbana')
    expect(i.detalle.mansarda).toBe('')
    expect(i.emplazamiento.tipoAdosamiento).toBe('EDIF DPTO')
    expect(i.emplazamiento.orientacionConstruccion).toBe('NOROESTE')
  })

  it('«Otros» del uso de terrenos (AX26) = 100 − suma; sin datos, nada', () => {
    const u = {
      casas: '10',
      deptos: '0',
      condominios: '45',
      equipComercial: '1',
      industrial: '0',
      comercial: '1',
      sitiosEriazos: '35',
    }
    expect(pctOtros(u)).toBe(8)
    expect(pctOtros({ ...u, casas: '', deptos: '', condominios: '', equipComercial: '', industrial: '', comercial: '', sitiosEriazos: '' })).toBeNull()
  })

  it('texto de expropiación (BB29) con el literal de MET-6283', () => {
    expect(textoExpropiacion({ fuenteInformacion: 'DOM, Plano Catastro', afectoExpropiacion: 'NO' }, 'Colina')).toBe(
      'De acuerdo al DOM, Plano Catastro de la Municipalidad de Colina la propiedad NO cuenta con expropiación.',
    )
    expect(textoExpropiacion({ fuenteInformacion: 'Certif. Exprop.', afectoExpropiacion: 'NO' }, 'Colina')).toBe(
      'De acuerdo al Certif. Exprop., se adjunta en anexo, de la Municipalidad de Colina la propiedad NO cuenta con expropiación.',
    )
    expect(textoExpropiacion({ fuenteInformacion: '', afectoExpropiacion: 'NO' }, 'Colina')).toBe('')
  })
})

describe('dependencias en vivo con la sección B', () => {
  it('mueve lo que todavía tiene el valor de la fórmula', () => {
    const i = seccionIPorDefecto(CTX_6283, TABLA_CASA)
    const ahora = { ...CTX_6283, agrupacion: 'Villa', orientacion: 'S' }
    const sig = reaplicarContextoI(i, CTX_6283, ahora)
    expect(sig.emplazamiento.tipoAgrupamiento).toBe('VILLA')
    expect(sig.terreno.orientacion).toBe('SUR')
    expect(sig.emplazamiento.orientacionConstruccion).toBe('SUR')

    // Un condominio de 1990 pasa a Ley 6071, y la 19537 lo sigue.
    const antiguo = reaplicarContextoI(i, CTX_6283, { ...CTX_6283, anioConstruccion: '1990' })
    expect(antiguo.normativa.ley6071).toBe('SI')
    expect(antiguo.normativa.ley19537).toBe('NO')
  })

  it('no toca lo que el tasador cambió a mano', () => {
    const i = seccionIPorDefecto(CTX_6283, TABLA_CASA)
    const manual = { ...i, emplazamiento: { ...i.emplazamiento, tipoAgrupamiento: 'PARCELACION' } }
    const sig = reaplicarContextoI(manual, CTX_6283, { ...CTX_6283, agrupacion: 'Villa' })
    expect(sig.emplazamiento.tipoAgrupamiento).toBe('PARCELACION')
  })
})

describe('normalizar y completar', () => {
  it('normalizar descarta claves desconocidas y deja todo como texto', () => {
    const n = normalizarSeccionI({ sector: { demanda: 'Medio', inventada: 'x' }, usoTerrenos: { casas: 10 }, otraCosa: {} })
    expect(n.sector.demanda).toBe('Medio')
    expect(n.sector).not.toHaveProperty('inventada')
    expect(n.usoTerrenos.casas).toBe('10')
    expect(n).not.toHaveProperty('otraCosa')
    expect(n.terreno.forma).toBe('')
  })

  it('completar: lo guardado gana, incluso vacío; lo ausente sale de la fórmula', () => {
    const c = completarSeccionI({ emplazamiento: { tipoAgrupamiento: '' }, sector: { demanda: 'Medio' } }, CTX_6283, {})
    expect(c.emplazamiento.tipoAgrupamiento).toBe('')
    expect(c.sector.demanda).toBe('Medio')
    expect(c.sector.gas).toBe('Licuado')
  })
})

describe('proyección a la plantilla (cualitativaDeSeccionI)', () => {
  const i = {
    ...seccionIPorDefecto(CTX_6283, TABLA_CASA),
    sector: {
      ...seccionIPorDefecto(CTX_6283, TABLA_CASA).sector,
      demanda: 'Medio',
      abc1: 'SI',
      homogeneidad: 'No Homogéneo',
      aguaPotable: 'Matriz Pública',
      redElectrica: 'Red Subterránea',
      gas: 'Red Pública',
      arteriaPrincipal: 'Caletera Oriente Gral San Martín',
    },
    usoTerrenos: { casas: '10', deptos: '0', condominios: '45', equipComercial: '1', industrial: '0', comercial: '1', sitiosEriazos: '35' },
    terreno: { forma: 'REGULAR', pendiente: 'PLANO', orientacion: 'NORTE', frente: '29.95', contrafrente: '29.95', deslindeNorte: '50', deslindeSur: '50' },
    detalle: { sitioLote: 'A 40', mansarda: 'No', afectoExpropiacion: 'NO', fuenteInformacion: 'DOM, Plano Catastro' },
  }
  const c = cualitativaDeSeccionI(i, {
    comuna: 'Colina',
    calidadConstructiva: 'BUENA',
    estadoConservacion: 'BUENO',
    dfl2: 'NO',
    subterraneos: '',
    zona: 'IPB(Colina)',
    casaNumero: 'N°2100',
    ampliacion: 'No',
    selloSec: 'No Aplica',
  })

  it('normativa con el DFL-2 de la sección B', () => {
    expect(c.normativa).toMatchObject({ dfl2: 'NO', ley6071: 'NO', ley19537: 'SI', usoMasProbable: 'HABITACIONAL' })
  })

  it('sector: ABC1 compuesto y porcentajes numéricos con «Otros» calculado', () => {
    expect(c.sector).toMatchObject({ abc1: 'SI/No Homogéneo', pctCasas: 10, pctCondominios: 45, pctOtros: 8 })
  })

  it('terreno con coma decimal, como la planilla', () => {
    expect(c.geometriaTerreno).toMatchObject({ frente: '29,95', contrafrente: '29,95', deslindeNorte: '50' })
  })

  it('emplazamiento con calidad y estado de la sección B; servicios desde el sector', () => {
    expect(c.emplazamiento).toMatchObject({ calidadConstructiva: 'BUENA', estadoConservacion: 'BUENO' })
    expect(c.servicios).toEqual({
      alcantarillado: 'Colector',
      aguaPotable: 'Matriz Pública',
      electricidad: 'Red Subterránea',
      gas: 'Red Pública',
      otros: '',
    })
  })

  it('detalle de la Hoja 1 y texto de expropiación', () => {
    expect(c.detallePropiedad).toEqual({
      casaNumero: 'N°2100',
      sitioLote: 'A 40',
      zona: 'IPB(Colina)',
      subterraneos: '',
      mansarda: 'No',
      selloSec: 'No Aplica',
      afectoExpropiacion: 'NO',
      fuenteInformacion: 'DOM, Plano Catastro',
      ampliacion: 'No',
    })
    expect(c.textoExpropiacion).toBe(
      'De acuerdo al DOM, Plano Catastro de la Municipalidad de Colina la propiedad NO cuenta con expropiación.',
    )
  })
})

describe('casaNumeroDeDireccion', () => {
  it('toma el número de la unidad de la dirección compuesta', () => {
    expect(casaNumeroDeDireccion('LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO')).toBe('N°2100')
    expect(casaNumeroDeDireccion('Av. Apoquindo 5230, Depto: 1203')).toBe('1203')
    expect(casaNumeroDeDireccion('Av. Apoquindo 5230')).toBe('')
  })
})

describe('borradores de la síntesis (sólo con datos del formulario)', () => {
  const e = seccionEPorDefecto(
    contextoE(
      { tipo: 'Casa', nueva: false },
      { estadoConservacion: 'BUENO', pisosPropiedad: '1', supConstruida: '249.91', supPrimerPiso: '249.91', estacionamientos: '0', bodegas: '0' },
    ),
    {},
  )
  e.elementos.estructuraSoportante.materialidad = 'ALBAÑILERÍA LADRILLO'
  e.elementos.obrasComplementarias.materialidad = 'TERRAZA DESCUBIERTA+QUINCHO+PISCINA'
  e.habitaciones.n1.cantidades = { living: 1, comedor: 1, dormSimple: 3, banos: 3 }

  it('arma la síntesis de MET-6283 sin cifras que no estén cargadas', () => {
    const texto = borradorSintesisPropiedad(
      datosSintesisPropiedad(
        { tipo: 'Casa', direccion: 'LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO', proyecto: 'LAS BRISAS DE CHICUREO' },
        { agrupacionPropiedad: 'Condominio', supTerreno: '5024.86', pisosPropiedad: '1', supPrimerPiso: '249.91' },
        e,
      ),
    )
    expect(texto).toContain('El bien es una vivienda que se encuentra en el Condominio LAS BRISAS DE CHICUREO, ubicado en LOS EUCALIPTUS N°2100.')
    expect(texto).toContain('La propiedad tiene 5.024,86 m² de terreno.')
    expect(texto).toContain('La vivienda tiene 1 piso construido en ALBAÑILERÍA LADRILLO.')
    // Orden de la planilla, con nombres en prosa.
    expect(texto).toContain(
      'El primer piso tiene 249,91 m² y cuenta con comedor, living, 3 dormitorios simples y 3 baños completos.',
    )
    expect(texto).toContain('El exterior cuenta con terraza descubierta, quincho y piscina.')
    // Ninguna cifra que no venga de los datos.
    const cifras = texto.match(/\d+(?:[.,]\d+)*/g) ?? []
    for (const c of cifras) expect(['2100', '5.024,86', '1', '249,91', '3']).toContain(c)
  })

  it('el sector se arma con lo cargado y queda vacío sin datos', () => {
    const vacio = seccionIPorDefecto(CTX_6283, {}).sector
    expect(borradorDescripcionSector({ ...vacio, gas: '', tipoZona: '' })).toBe('')
    const texto = borradorDescripcionSector({
      ...vacio,
      destinoBarrio: 'Habitacional',
      densidad: 'Baja',
      demanda: 'Medio',
      tendencia: 'Estable',
      mercado: 'Estrato Medio Alto',
      arteriaPrincipal: 'Caletera Oriente Gral San Martín',
    })
    expect(texto).toBe(
      'El sector es de carácter habitacional y de densidad baja. Presenta demanda medio y tendencia estable, en un mercado estrato medio alto. El comercio, el transporte y los servicios se encuentran en la avenida más cercana: Caletera Oriente Gral San Martín.',
    )
  })
})
