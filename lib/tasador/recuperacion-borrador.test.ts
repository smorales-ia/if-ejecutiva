import { describe, expect, it } from 'vitest'

/**
 * P7-TAS.A.3 · el reparto servidor/borrador y el predicado del banner.
 *
 * Los dos candados que este archivo protege, y que son la razón de que .A.3
 * exista:
 *
 * 1. **`sólo difieren las fotos → no hay diferencia`.** Si las claves del
 *    reparto entraran en la comparación, el predicado sería verdadero siempre
 *    —el servidor no manda fotos— y el banner aparecería en cada apertura hasta
 *    que el tasador aprendiera a ignorarlo.
 * 2. **El borrador en blanco de `fotos-screen` no pisa lo hidratado ni se
 *    ofrece.** Es el fallo real que .A.1 dejó abierto: la pantalla de fotos
 *    siembra un `InformeData` vacío antes de que el formulario se abra, y con
 *    la regla vieja (`readPayload(id) ?? informeInicial`) ese vacío tapaba los
 *    datos de Airtable. Ese borrador **sí difiere** de lo hidratado, así que
 *    no basta con comparar: hace falta exigir contenido. La distinción se
 *    descubrió escribiendo estos tests y obligó a añadir
 *    `borradorAportaContenido`.
 */

import {
  CLAVES_SOLO_BORRADOR,
  borradorAportaContenido,
  combinarConBorrador,
  debeOfrecerRecuperacion,
  difiereEnSecciones,
  soloClavesDeBorrador,
} from './recuperacion-borrador'
import { VERSION_BORRADOR, type MetaBorrador } from './tasador-store'
import type { InformeData } from './tasaciones'

/* -------------------------------------------------------------------------
 * Andamiaje
 * ---------------------------------------------------------------------- */

/** Lo que devuelve `leerDatosCaptura` + `resolverInforme`: A–H con datos, fotos vacías. */
function servidor(cambios: Record<string, unknown> = {}): InformeData {
  return {
    fechaVisitaReal: '2026-08-20',
    supTerreno: '5024.86',
    supConstruida: '249.91',
    anioConstruccion: '1994',
    items: [{ id: 'it-1', descripcion: 'Casa principal', superficieM2: '120' }],
    niveles: { n1: { living: 1, cocina: 1 } },
    fotosPredefinidas: { cocina: [], banos: [] },
    categoriasCustom: [],
    ...cambios,
  } as unknown as InformeData
}

/** Lo que `fotos-screen` siembra: `resolverInforme` en blanco + las fotos subidas. */
function borradorEnBlancoConFotos(): InformeData {
  return {
    fechaVisitaReal: '',
    supTerreno: '',
    supConstruida: '',
    anioConstruccion: '',
    items: [],
    niveles: { n1: { living: 0, cocina: 0 } },
    fotosPredefinidas: { cocina: [{ id: 'f-1' }], banos: [{ id: 'f-2' }] },
    categoriasCustom: [],
  } as unknown as InformeData
}

const meta = (
  guardadoTs: string,
  sincronizadoTs: string | null,
): MetaBorrador => ({ version: VERSION_BORRADOR, guardadoTs, sincronizadoTs })

const SIN_SINCRONIZAR = meta('2026-08-20T10:00:00.000Z', null)
const SINCRONIZADO = meta('2026-08-20T10:00:00.000Z', '2026-08-20T10:05:00.000Z')

/* -------------------------------------------------------------------------
 * soloClavesDeBorrador
 * ---------------------------------------------------------------------- */

describe('soloClavesDeBorrador', () => {
  it('extrae únicamente las claves del reparto', () => {
    const solo = soloClavesDeBorrador(borradorEnBlancoConFotos())
    expect(Object.keys(solo).sort()).toEqual(['categoriasCustom', 'fotosPredefinidas'])
  })

  it('omite `documentosCargados` cuando no está', () => {
    // Es opcional en `InformeData`: ausente no es lo mismo que vacío, e
    // inyectarlo como `undefined` lo haría aparecer en `Object.keys`.
    expect('documentosCargados' in soloClavesDeBorrador(servidor())).toBe(false)
  })

  it('lo incluye cuando sí está', () => {
    const con = servidor({ documentosCargados: { escritura: [1] } })
    expect(soloClavesDeBorrador(con).documentosCargados).toEqual({ escritura: [1] })
  })

  it('las tres claves declaradas son las del reparto', () => {
    expect([...CLAVES_SOLO_BORRADOR]).toEqual([
      'fotosPredefinidas',
      'categoriasCustom',
      'documentosCargados',
    ])
  })
})

/* -------------------------------------------------------------------------
 * combinarConBorrador
 * ---------------------------------------------------------------------- */

describe('combinarConBorrador', () => {
  it('sin borrador devuelve lo hidratado tal cual', () => {
    const inicial = servidor()
    expect(combinarConBorrador(inicial, null)).toBe(inicial)
  })

  it('las secciones A–H las manda el servidor', () => {
    const combinado = combinarConBorrador(servidor(), borradorEnBlancoConFotos())

    expect(combinado.supTerreno).toBe('5024.86')
    expect(combinado.anioConstruccion).toBe('1994')
    expect(combinado.items).toHaveLength(1)
  })

  it('las fotos las manda el borrador', () => {
    const combinado = combinarConBorrador(servidor(), borradorEnBlancoConFotos())

    expect(combinado.fotosPredefinidas.cocina).toHaveLength(1)
    expect(combinado.fotosPredefinidas.banos).toHaveLength(1)
  })

  it('CANDADO · el borrador en blanco de `fotos-screen` no pisa lo hidratado', () => {
    // Con la regla vieja —`readPayload(id) ?? informeInicial`— acá se perdía
    // todo lo que el tasador había guardado en la visita anterior.
    const combinado = combinarConBorrador(servidor(), borradorEnBlancoConFotos())

    expect(combinado.fechaVisitaReal).toBe('2026-08-20')
    expect(combinado.supConstruida).toBe('249.91')
  })
})

/* -------------------------------------------------------------------------
 * difiereEnSecciones
 * ---------------------------------------------------------------------- */

describe('difiereEnSecciones', () => {
  it('sin borrador no hay diferencia', () => {
    expect(difiereEnSecciones(servidor(), null)).toBe(false)
  })

  it('dos formularios idénticos no difieren', () => {
    expect(difiereEnSecciones(servidor(), servidor())).toBe(false)
  })

  it('CANDADO · si sólo difieren las fotos, no hay diferencia', () => {
    const conFotos = servidor({
      fotosPredefinidas: { cocina: [{ id: 'f-1' }], banos: [] },
    })
    expect(difiereEnSecciones(servidor(), conFotos)).toBe(false)
  })

  it('un escalar distinto es diferencia', () => {
    expect(difiereEnSecciones(servidor(), servidor({ supTerreno: '600' }))).toBe(true)
  })

  it('detecta diferencias anidadas en una colección', () => {
    const otro = servidor({
      items: [{ id: 'it-1', descripcion: 'Casa principal', superficieM2: '999' }],
    })
    expect(difiereEnSecciones(servidor(), otro)).toBe(true)
  })

  it('detecta diferencias en un objeto anidado', () => {
    const otro = servidor({ niveles: { n1: { living: 2, cocina: 1 } } })
    expect(difiereEnSecciones(servidor(), otro)).toBe(true)
  })

  it('detecta un array de distinta longitud', () => {
    expect(difiereEnSecciones(servidor(), servidor({ items: [] }))).toBe(true)
  })

  it('una clave de más en el borrador es diferencia', () => {
    // Se recorre la unión de claves, no sólo las del servidor.
    expect(difiereEnSecciones(servidor(), servidor({ motivoOverride: 'x' }))).toBe(true)
  })

  it('no se deja engañar por el orden de las claves', () => {
    const alReves = {
      categoriasCustom: [],
      fotosPredefinidas: { banos: [], cocina: [] },
      niveles: { n1: { cocina: 1, living: 1 } },
      items: [{ superficieM2: '120', descripcion: 'Casa principal', id: 'it-1' }],
      anioConstruccion: '1994',
      supConstruida: '249.91',
      supTerreno: '5024.86',
      fechaVisitaReal: '2026-08-20',
    } as unknown as InformeData

    // Es lo que `JSON.stringify` habría reportado como distinto.
    expect(difiereEnSecciones(servidor(), alReves)).toBe(false)
  })
})

/* -------------------------------------------------------------------------
 * debeOfrecerRecuperacion
 * ---------------------------------------------------------------------- */

describe('debeOfrecerRecuperacion', () => {
  const caso = (
    borrador: InformeData | null,
    m: MetaBorrador | null,
    informeInicial = servidor(),
  ) => debeOfrecerRecuperacion({ meta: m, informeInicial, borrador })

  it('no ofrece si no hay borrador', () => {
    expect(caso(null, SIN_SINCRONIZAR)).toBe(false)
  })

  it('no ofrece sin metadatos', () => {
    expect(caso(servidor({ supTerreno: '600' }), null)).toBe(false)
  })

  it('no ofrece si el borrador ya se sincronizó', () => {
    expect(caso(servidor({ supTerreno: '600' }), SINCRONIZADO)).toBe(false)
  })

  it('no ofrece si no hay nada distinto que ofrecer', () => {
    expect(caso(servidor(), SIN_SINCRONIZAR)).toBe(false)
  })

  it('ofrece con cambios locales distintos de lo hidratado', () => {
    expect(caso(servidor({ supTerreno: '600' }), SIN_SINCRONIZAR)).toBe(true)
  })

  it('CANDADO · no ofrece recuperar el borrador en blanco de `fotos-screen`', () => {
    // Cumple «hay cambios sin sincronizar» **y** difiere de lo hidratado, así
    // que `difiereEnSecciones` sola lo habría dejado pasar. Ofrecerlo sería
    // proponer pisar los datos reales de Airtable con un formulario vacío.
    expect(difiereEnSecciones(servidor(), borradorEnBlancoConFotos())).toBe(true)
    expect(caso(borradorEnBlancoConFotos(), SIN_SINCRONIZAR)).toBe(false)
  })
})

/* -------------------------------------------------------------------------
 * borradorAportaContenido — la diferencia con `difiereEnSecciones`
 * ---------------------------------------------------------------------- */

describe('borradorAportaContenido', () => {
  it('sin borrador no aporta', () => {
    expect(borradorAportaContenido(servidor(), null)).toBe(false)
  })

  it('un borrador idéntico no aporta', () => {
    expect(borradorAportaContenido(servidor(), servidor())).toBe(false)
  })

  it('un valor tecleado aporta', () => {
    expect(borradorAportaContenido(servidor(), servidor({ supTerreno: '600' }))).toBe(true)
  })

  it('una colección con filas aporta', () => {
    const conItem = servidor({ items: [{ id: 'it-2', descripcion: 'Bodega' }] })
    expect(borradorAportaContenido(servidor({ items: [] }), conItem)).toBe(true)
  })

  it('un campo vaciado NO aporta · coste declarado', () => {
    // El borrado no se ofrece para recuperación. El formulario ya muestra el
    // valor del servidor y el tasador puede volver a borrarlo; ofrecer
    // cualquier diferencia reintroduce el fallo del borrador en blanco.
    expect(borradorAportaContenido(servidor(), servidor({ supTerreno: '' }))).toBe(false)
  })

  it('ceros y `false` no son contenido', () => {
    const enCero = servidor({ niveles: { n1: { living: 0, cocina: 0 } } })
    expect(borradorAportaContenido(servidor(), enCero)).toBe(false)
  })

  it('una diferencia sólo en las fotos no aporta', () => {
    const otrasFotos = servidor({ fotosPredefinidas: { cocina: [{ id: 'f-9' }], banos: [] } })
    expect(borradorAportaContenido(servidor(), otrasFotos)).toBe(false)
  })
})
