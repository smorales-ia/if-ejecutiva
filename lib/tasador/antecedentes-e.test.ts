import { describe, expect, it } from 'vitest'
import {
  cambiarComodidad,
  cambiarMaterialidad,
  cambiarPavimento,
  completarSeccionE,
  materialPorPavimento,
  reaplicarContexto,
  seccionEPorDefecto,
  superficieTotalE,
  totalesHabitaciones,
  type ContextoE,
  type DefaultsTabla,
  type EvidenciasE,
  type SeccionE,
  aplicarEvidencias,
  estructuraDesdeMaterial,
} from './antecedentes-e'

/**
 * Sección E según la hoja «Antecedentes» (19-oct-2026). Los casos contrastan
 * contra lo que calcula la plantilla Enero 2026 y el libro de MET-6283
 * (casa usada de un piso, 249,91 m², estado de conservación BUENO).
 */

const MET6283: ContextoE = {
  tipoPropiedad: 'Casa',
  nueva: false,
  estadoConservacion: 'BUENO',
  pisos: '1',
  supConstruida: '249.91',
  supPrimerPiso: '249.91',
  estacionamientos: '0',
  bodegas: '0',
}

const DEPTO_NUEVO: ContextoE = {
  ...MET6283,
  tipoPropiedad: 'Departamento',
  nueva: true,
  estadoConservacion: 'NUEVO - S/USO',
  supConstruida: '80',
  supPrimerPiso: '',
  estacionamientos: '1',
  bodegas: '0',
}

/** Filas de C_DefaultsAntecedentes leídas el 19-oct-2026 (Casa · usado). */
const TABLA_CASA_USADO: DefaultsTabla = {
  cierros_exteriores: { calidad: 'BUENA', estado: 'BUENO', materialidad: 'REJA METALICA' },
  cubierta: { calidad: 'BUENA', estado: 'BUENO', materialidad: 'PLANCHA METALICA' },
  divisiones_interiores: { calidad: 'BUENA', estado: 'BUENO', materialidad: 'ACERO VOLCANITA' },
  entrepisos: { calidad: 'BUENA', estado: 'BUENO' },
  estructura_soportante: { calidad: 'BUENA', estado: 'BUENO', materialidad: 'HORMIGON ARMADO' },
  revestimiento_exterior: { calidad: 'BUENA', estado: 'BUENO', materialidad: 'ESTUCO Y PINTURA' },
  aire_acondicionado: { materialidad: 'NO PRESENTA' },
  calefaccion: { materialidad: 'NO PRESENTA' },
  closet_mural: { calidad: 'BUENA', materialidad: 'MELAMINA' },
  griferia: { calidad: 'BUENA', materialidad: 'NACIONAL CORRIENTE' },
  muebles_cocina: { calidad: 'BUENA', materialidad: 'MELAMINA Y POSTFORMADO' },
  puerta_principal: { calidad: 'BUENA', materialidad: 'MADERA' },
  sanitarios: { calidad: 'BUENA', materialidad: 'LOSA NACIONAL CORRIENTE' },
  ventanas: { calidad: 'BUENA', materialidad: 'ALUMINIO' },
  banos: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'CERAMICO', revestimiento_muros: 'CERAMICO' },
  cocina: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'CERAMICO', revestimiento_muros: 'CERAMICO' },
  dormitorios: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'PISO FLOTANTE', revestimiento_muros: 'ESMALTE' },
  espacios_circulacion: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'PISO FLOTANTE', revestimiento_muros: 'ESMALTE' },
  estar: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'PISO FLOTANTE', revestimiento_muros: 'ESMALTE' },
}

/** Ídem, Departamento · nuevo. */
const TABLA_DEPTO_NUEVO: DefaultsTabla = {
  cierros_exteriores: { calidad: 'BUENA', estado: 'NUEVO S/USO', materialidad: 'REJA METALICA' },
  cubierta: { calidad: 'BUENA', estado: 'NUEVO S/USO', materialidad: 'FE GALVANIZADO' },
  divisiones_interiores: { calidad: 'BUENA', estado: 'NUEVO S/USO', materialidad: 'ACERO VOLCANITA' },
  entrepisos: { calidad: 'BUENA', estado: 'NUEVO S/USO', materialidad: 'LOSA DE HORMIGON ARMADO' },
  estructura_soportante: { calidad: 'BUENA', estado: 'NUEVO S/USO', materialidad: 'HORMIGON ARMADO' },
  obras_complementarias: { calidad: 'BUENA', estado: 'NUEVO S/USO', materialidad: 'PISCINA' },
  revestimiento_exterior: { calidad: 'BUENA', estado: 'NUEVO S/USO', materialidad: 'ESTUCO Y PINTURA' },
  aire_acondicionado: { materialidad: 'NO PRESENTA' },
  calefaccion: { materialidad: 'NO PRESENTA' },
  closet_mural: { calidad: 'BUENA', materialidad: 'MELAMINA' },
  griferia: { calidad: 'BUENA', materialidad: 'NACIONAL CORRIENTE' },
  muebles_cocina: { calidad: 'BUENA', materialidad: 'MELAMINA Y POSTFORMADO' },
  puerta_principal: { calidad: 'BUENA', materialidad: 'MADERA' },
  sanitarios: { calidad: 'BUENA', materialidad: 'LOSA NACIONAL CORRIENTE' },
  ventanas: { calidad: 'BUENA', materialidad: 'ALUMINIO' },
  banos: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'CERAMICO', revestimiento_muros: 'CERAMICO' },
  cocina: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'CERAMICO', revestimiento_muros: 'CERAMICO' },
  dormitorios: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'PISO FLOTANTE', revestimiento_muros: 'ESMALTE' },
  espacios_circulacion: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'PISO FLOTANTE', revestimiento_muros: 'ESMALTE' },
  estar: { cielo: 'ENLUCIDO / PINTURA', iluminacion: 'BUENA', pavimento: 'PISO FLOTANTE', revestimiento_muros: 'ESMALTE' },
}

/** Defaults de MET-6283 y del departamento, con su tabla. */
const casa = (c: ContextoE = MET6283) => seccionEPorDefecto(c, TABLA_CASA_USADO)
const depto = () => seccionEPorDefecto(DEPTO_NUEVO, TABLA_DEPTO_NUEVO)
describe('defaults de CARACTERISTICAS CONSTRUCTIVAS PRINCIPALES', () => {
  it('casa usada (MET-6283): las fórmulas que la planilla no tipeó', () => {
    const e = casa()

    expect(e.elementos.divisionesInteriores).toEqual({ materialidad: 'ACERO VOLCANITA', calidad: 'BUENA', estado: 'BUENO' })
    // H39: casa de un piso → entrepisos en blanco.
    expect(e.elementos.entrepisos.materialidad).toBe('')
    expect(e.elementos.cubierta.materialidad).toBe('PLANCHA METALICA')
    expect(e.elementos.revestimientoExterior.materialidad).toBe('ESTUCO Y PINTURA')
    expect(e.elementos.cierrosExteriores.materialidad).toBe('REJA METALICA')
    // AR38 con la comodidad Calefacción en blanco → NO PRESENTA, sin calidad ni estado.
    expect(e.elementos.calefaccion).toEqual({ materialidad: 'NO PRESENTA', calidad: '', estado: '' })
    // BL39:BL44 = Z15.
    expect(e.elementos.closetMural).toEqual({ materialidad: 'MELAMINA', calidad: 'BUENA', estado: 'BUENO' })
    expect(e.elementos.sanitarios.materialidad).toBe('LOSA NACIONAL CORRIENTE')
    expect(e.elementos.griferia.materialidad).toBe('NACIONAL CORRIENTE')
    expect(e.elementos.puertaPrincipal.materialidad).toBe('MADERA')
    // H43 en casa: sin obras complementarias por defecto.
    expect(e.elementos.obrasComplementarias).toEqual({ materialidad: '', calidad: '', estado: '' })
  })

  it('departamento nuevo: los valores de la rama Departamento', () => {
    const e = depto()

    expect(e.elementos.estructuraSoportante).toEqual({ materialidad: 'HORMIGON ARMADO', calidad: 'BUENA', estado: 'NUEVO S/USO' })
    expect(e.elementos.entrepisos.materialidad).toBe('LOSA DE HORMIGON ARMADO')
    expect(e.elementos.cubierta.materialidad).toBe('FE GALVANIZADO')
    expect(e.elementos.obrasComplementarias).toEqual({ materialidad: 'PISCINA', calidad: 'BUENA', estado: 'NUEVO S/USO' })
    expect(e.elementos.ventanas.estado).toBe('NUEVO - S/USO')
    // H24/P24: en departamento salen de los OO.CC.
    expect(e.comodidades.estacionamiento).toBe('SI')
    expect(e.comodidades.bodega).toBe('NO')
  })

  it('en casa estacionamiento y bodega quedan en blanco', () => {
    const e = casa({ ...MET6283, estacionamientos: '2' })
    expect(e.comodidades.estacionamiento).toBe('')
  })
})

describe('terminaciones (H46:BL50)', () => {
  it('estar, dormitorios y circulación con piso flotante; cocina y baños cerámicos', () => {
    const e = casa()

    expect(e.terminaciones.estar).toEqual({
      pavimento: 'PISO FLOTANTE',
      material: 'TIPO LAMINADO',
      muros: 'ESMALTE',
      cielo: 'ENLUCIDO / PINTURA',
      iluminacion: 'BUENA',
      estado: 'BUENO',
    })
    expect(e.terminaciones.banos).toMatchObject({ pavimento: 'CERAMICO', material: 'TIPO CORDILLERA', muros: 'CERAMICO' })
  })

  it('W46:W50: el material sigue al pavimento, con el valor final de la hoja por fila', () => {
    expect(materialPorPavimento('dormitorios', 'ENMADERADO')).toBe('MADERA')
    expect(materialPorPavimento('cocina', 'AFINADO CEMENTO')).toBe('CEMENTO')
    expect(materialPorPavimento('estar', 'METALICO')).toBe('SIN TERMINACION')
    expect(materialPorPavimento('banos', 'METALICO')).toBe('TIPO LAMINADO')
  })

  it('cambiar el pavimento cambia el material', () => {
    const e = cambiarPavimento(casa(), 'estar', 'ENMADERADO')
    expect(e.terminaciones.estar).toMatchObject({ pavimento: 'ENMADERADO', material: 'MADERA' })
  })
})

describe('dependencias en vivo', () => {
  it('comodidad Calefacción SI → LOSA RADIANTE con calidad y estado; NO → NO PRESENTA y se vacían', () => {
    let e = cambiarComodidad(casa(), 'calefaccion', 'SI', MET6283)
    expect(e.elementos.calefaccion).toEqual({ materialidad: 'LOSA RADIANTE', calidad: 'BUENA', estado: 'BUENA' })

    e = cambiarComodidad(e, 'calefaccion', 'NO', MET6283)
    expect(e.elementos.calefaccion).toEqual({ materialidad: 'NO PRESENTA', calidad: '', estado: '' })
  })

  it('obras complementarias: calidad y estado aparecen con la materialidad (MET-6283 imprime BUENA / BUENA)', () => {
    const e = cambiarMaterialidad(casa(), 'obrasComplementarias', 'QUINCHO', MET6283)
    expect(e.elementos.obrasComplementarias).toEqual({ materialidad: 'QUINCHO', calidad: 'BUENA', estado: 'BUENA' })
  })

  it('cambiar la materialidad de un elemento presente no pisa su calidad ni su estado', () => {
    let e = cambiarMaterialidad(casa(), 'aireAcondicionado', 'RADIADOR MURAL', MET6283)
    e = { ...e, elementos: { ...e.elementos, aireAcondicionado: { ...e.elementos.aireAcondicionado, calidad: 'SUPERIOR' } } }
    e = cambiarMaterialidad(e, 'aireAcondicionado', 'RADIADOR AEREO', MET6283)
    expect(e.elementos.aireAcondicionado.calidad).toBe('SUPERIOR')
  })

  it('el estado de conservación (Z15) arrastra los estados que todavía lo copian', () => {
    const base = casa()
    const tocado = { ...base, terminaciones: { ...base.terminaciones, cocina: { ...base.terminaciones.cocina, estado: 'MALO' } } }

    const e = reaplicarContexto(tocado, MET6283, { ...MET6283, estadoConservacion: 'NORMAL' })

    expect(e.terminaciones.estar.estado).toBe('NORMAL')
    expect(e.elementos.ventanas.estado).toBe('NORMAL')
    expect(e.terminaciones.cocina.estado).toBe('MALO') // lo cambió el tasador
    expect(e.elementos.estructuraSoportante.estado).toBe('BUENO') // sigue al estado de uso, no a Z15
  })

  it('pasar a dos pisos llena entrepisos y reparte la superficie', () => {
    const antes = { ...MET6283, supConstruida: '200', supPrimerPiso: '120' }
    const e = reaplicarContexto(casa(antes), antes, { ...antes, pisos: '2' })

    expect(e.elementos.entrepisos.materialidad).toBe('LOSA DE HORMIGON ARMADO')
    expect(e.habitaciones.n1.superficieM2).toBe('120')
    expect(e.habitaciones.n2.superficieM2).toBe('80')
  })
})

describe('habitaciones y superficies', () => {
  it('MET-6283: 249,91 m² en el 1 nivel y totales como L34:AY34', () => {
    const base = casa()
    expect(base.habitaciones.n1.superficieM2).toBe('249.91')

    const e = {
      ...base,
      habitaciones: {
        ...base.habitaciones,
        n1: {
          ...base.habitaciones.n1,
          cantidades: { comedor: 1, living: 1, estar: 1, hall: 1, suite: 1, dormSimple: 3, dormServicio: 1, cocina: 1, banos: 3, medioBano: 1, banoServicio: 1, loggia: 1 },
        },
      },
    }
    expect(totalesHabitaciones(e)).toEqual({ total: 16, dormitorios: 4, banos: 4, dormServicio: 1, banoServicio: 1 })
    expect(superficieTotalE(e)).toBe(249.91)
  })

  it('departamento: toda la superficie en el 1 nivel', () => {
    expect(depto().habitaciones.n1.superficieM2).toBe('80')
  })
})

describe('completarSeccionE', () => {
  it('lo guardado gana; lo que falta viene de los defaults', () => {
    const e = completarSeccionE(
      { elementos: { ventanas: { materialidad: 'PVC TERMOPANEL', calidad: 'BUENA', estado: 'BUENO' } } } as never,
      MET6283,
      TABLA_CASA_USADO,
    )
    expect(e.elementos.ventanas.materialidad).toBe('PVC TERMOPANEL')
    expect(e.elementos.cubierta.materialidad).toBe('PLANCHA METALICA')
    expect(e.ampliaciones).toHaveLength(3)
  })

  it('sin nada guardado devuelve los defaults', () => {
    expect(completarSeccionE(undefined, MET6283, TABLA_CASA_USADO)).toEqual(casa())
  })
})

describe('precarga con los datos de la solicitud (aplicarEvidencias)', () => {
  const SIN_EVIDENCIA: EvidenciasE = {
    textos: [],
    materiales: [],
    dormitorios: '',
    banos: '',
    mediosBanos: '',
    banoServicio: '',
    ampliaciones: [],
  }

  it('MET-6283: estructura del SII, habitaciones de la sección B y comodidades sin blancos', () => {
    const e = aplicarEvidencias(
      casa(),
      {
        ...SIN_EVIDENCIA,
        // TX_Unidades «Casa N°2100» y el material de la sección B.
        textos: ['Casa', 'Casa N°2100', 'Terreno', 'Servidumbre', 'Piso 1', 'Edificacion'],
        materiales: ['albanileria', 'Albañilería'],
        // Plano: 4 dormitorios y 4 baños (3 + ½); baño de servicio de la sección B.
        dormitorios: '4',
        banos: '4',
        mediosBanos: '1',
        banoServicio: '1',
      },
      MET6283,
    )

    expect(e.elementos.estructuraSoportante.materialidad).toBe('ALBAÑILERIA LADRILLO')
    expect(e.habitaciones.n1.cantidades).toEqual({
      comedor: 1,
      living: 1,
      cocina: 1,
      dormSimple: 4,
      banos: 3,
      medioBano: 1,
      banoServicio: 1,
    })
    expect(Object.values(e.comodidades).every((v) => v === 'SI' || v === 'NO')).toBe(true)
    expect(e.comodidades.mueblesCocina).toBe('SI')
    expect(e.comodidades.piscina).toBe('NO')
    expect(e.elementos.obrasComplementarias.materialidad).toBe('')
  })

  it('los ítems del cuadro C declaran obras complementarias y comodidades', () => {
    const e = aplicarEvidencias(
      casa({ ...MET6283, bodegas: '1' }),
      { ...SIN_EVIDENCIA, textos: ['Piscina', 'Terraza', 'Quincho', 'Estac U/Goce'] },
      { ...MET6283, bodegas: '1' },
    )

    expect(e.elementos.obrasComplementarias).toEqual({
      materialidad: 'TERRAZA+QUINCHO+PISCINA',
      calidad: 'BUENA',
      estado: 'BUENA',
    })
    expect(e.comodidades).toMatchObject({ piscina: 'SI', estacionamiento: 'SI', bodega: 'SI', sauna: 'NO' })
  })

  it('una ampliación declarada ocupa la primera fila libre y suma AMPLIACIÓN a las obras', () => {
    const amp = { regulado: 'NO' as const, pe: '', rif: '', regulacion: 'S/Reg Regularizable', m2: '18.5' }
    const e = aplicarEvidencias(casa(), { ...SIN_EVIDENCIA, ampliaciones: [amp] }, MET6283)

    expect(e.ampliaciones[0]).toEqual(amp)
    expect(e.elementos.obrasComplementarias.materialidad).toBe('AMPLIACIÓN')
  })

  it('la comodidad Calefacción declarada arrastra el elemento (AR38)', () => {
    const e = aplicarEvidencias(casa(), { ...SIN_EVIDENCIA, textos: ['Calefacción central'] }, MET6283)
    expect(e.comodidades.calefaccion).toBe('SI')
    expect(e.elementos.calefaccion.materialidad).toBe('LOSA RADIANTE')
  })

  it('no pisa habitaciones ya cargadas ni comodidades ya decididas', () => {
    const base = casa()
    const cargada: SeccionE = {
      ...base,
      comodidades: { ...base.comodidades, piscina: 'SI' },
      habitaciones: { ...base.habitaciones, n2: { ...base.habitaciones.n2, cantidades: { suite: 1 } } },
    }
    const e = aplicarEvidencias(cargada, { ...SIN_EVIDENCIA, dormitorios: '3' }, MET6283)

    expect(e.comodidades.piscina).toBe('SI')
    expect(e.habitaciones.n1.cantidades).toEqual({})
  })

  it('estructuraDesdeMaterial reconoce las formas habituales', () => {
    expect(estructuraDesdeMaterial('ALBAÑILERÍA LADRILLO')).toBe('ALBAÑILERIA LADRILLO')
    expect(estructuraDesdeMaterial('hormigon')).toBe('HORMIGON ARMADO')
    expect(estructuraDesdeMaterial('Albañilería de bloques')).toBe('ALBAÑILERIA BLOQUES')
    expect(estructuraDesdeMaterial('Mixto')).toBe('')
  })
})

describe('RF-TAS-23 · sin filas en C_DefaultsAntecedentes', () => {
  it('los valores fijos quedan vacíos; las fórmulas siguen corriendo', () => {
    const e = seccionEPorDefecto({ ...MET6283, tipoPropiedad: 'Oficina' }, {})

    expect(e.elementos.estructuraSoportante).toEqual({ materialidad: '', calidad: '', estado: '' })
    expect(e.terminaciones.estar).toMatchObject({ pavimento: '', material: '', estado: 'BUENO' })
    // H39 y AR38 son fórmulas, no filas de la tabla.
    expect(e.elementos.entrepisos.materialidad).toBe('LOSA DE HORMIGON ARMADO')
    expect(e.elementos.calefaccion.materialidad).toBe('NO PRESENTA')
    expect(e.elementos.closetMural.estado).toBe('BUENO')
  })
})
