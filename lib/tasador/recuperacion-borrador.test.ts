import { describe, expect, it } from 'vitest'

/**
 * P7-TAS.A.3 · el reparto servidor/borrador y el predicado del banner.
 * **Actualizado en P7-TAS.A.4** (decisión D-4).
 *
 * El candado que este archivo protege, y que es la razón de que .A.3 exista:
 *
 * > **Un borrador en blanco no pisa lo hidratado ni se ofrece para
 * > recuperación.** Es el fallo real que .A.1 dejó abierto: con la regla vieja
 * > (`readPayload(id) ?? informeInicial`) un `InformeData` vacío tapaba los
 * > datos de Airtable. Ese borrador **sí difiere** de lo hidratado, así que no
 * > basta con comparar: hace falta exigir contenido. La distinción se descubrió
 * > escribiendo estos tests y obligó a añadir `borradorAportaContenido`.
 *
 * ## Qué cambió en .A.4
 *
 * `CLAVES_SOLO_BORRADOR` pasó de tres entradas a una. `fotosPredefinidas` y
 * `categoriasCustom` ya tienen proyección server-side (`lectura-fotos.ts`), así
 * que **dejaron de estar exentas**: ni ganan la precedencia ni quedan fuera de
 * la comparación. Los tests que fijaban la exención se invirtieron a propósito
 * —no se relajaron— y quedan abajo señalados como tales.
 *
 * El **origen** del borrador en blanco también desapareció: `fotos-screen` ya no
 * siembra un `resolverInforme()` vacío, arranca de `informeInicial`. El candado
 * se conserva igual, porque protege una propiedad del predicado, no una fuente
 * concreta que hoy ya no existe.
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

/**
 * Un borrador con las secciones A–H **en blanco** y las mismas fotos que el
 * servidor. Aísla el caso que el candado protege: A–H vacías frente a A–H con
 * datos, sin que las fotos metan ruido en la comparación.
 *
 * Hasta .A.4 esta forma era literalmente lo que `fotos-screen` sembraba. Ya no:
 * la pantalla arranca de `informeInicial`. Se conserva porque el predicado
 * tiene que seguir comportándose así venga de donde venga el blanco.
 */
function borradorEnBlanco(cambios: Record<string, unknown> = {}): InformeData {
  return {
    fechaVisitaReal: '',
    supTerreno: '',
    supConstruida: '',
    anioConstruccion: '',
    items: [],
    niveles: { n1: { living: 0, cocina: 0 } },
    fotosPredefinidas: { cocina: [], banos: [] },
    categoriasCustom: [],
    ...cambios,
  } as unknown as InformeData
}

/** El mismo blanco, pero con fotos que el servidor no tiene (cola offline). */
function borradorEnBlancoConFotos(): InformeData {
  return borradorEnBlanco({
    fotosPredefinidas: { cocina: [{ id: 'f-1' }], banos: [{ id: 'f-2' }] },
  })
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
  it('INVERTIDO EN .A.4 · las fotos ya no se extraen del borrador', () => {
    // Antes de .A.4 esto devolvía `['categoriasCustom', 'fotosPredefinidas']`.
    // Ahora las fotos tienen proyección server-side y viajan en
    // `informeInicial`, así que el reparto no tiene nada que resembrar salvo
    // `documentosCargados` — que este borrador no trae.
    const solo = soloClavesDeBorrador(borradorEnBlancoConFotos())
    expect(Object.keys(solo)).toEqual([])
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

  it('es la única clave que extrae', () => {
    const con = borradorEnBlancoConFotos()
    ;(con as unknown as Record<string, unknown>).documentosCargados = { escritura: [1] }

    expect(Object.keys(soloClavesDeBorrador(con))).toEqual(['documentosCargados'])
  })

  it('la lista declarada tiene una sola entrada · D-4', () => {
    // Si esto falla porque alguien añadió una clave, la pregunta es si esa clave
    // tiene proyección server-side. Si la tiene, no va acá. Si no la tiene, va
    // acá **y** necesita ficha: el reparto es deuda declarada, no un mecanismo.
    expect([...CLAVES_SOLO_BORRADOR]).toEqual(['documentosCargados'])
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
    const combinado = combinarConBorrador(servidor(), borradorEnBlanco())

    expect(combinado.supTerreno).toBe('5024.86')
    expect(combinado.anioConstruccion).toBe('1994')
    expect(combinado.items).toHaveLength(1)
  })

  it('INVERTIDO EN .A.4 · las fotos ahora las manda el servidor', () => {
    // Antes de .A.4 el borrador ganaba, porque las fotos no estaban en ninguna
    // otra parte. Ahora `lectura-fotos.ts` las proyecta y un borrador viejo
    // taparía fotos que otra sesión subió de verdad — que es peor que el
    // problema que la excepción resolvía.
    const conFotosServidor = servidor({
      fotosPredefinidas: { cocina: [{ id: 'srv-1' }], banos: [] },
    })
    const combinado = combinarConBorrador(conFotosServidor, borradorEnBlancoConFotos())

    expect(combinado.fotosPredefinidas.cocina).toEqual([{ id: 'srv-1' }])
    expect(combinado.fotosPredefinidas.banos).toEqual([])
  })

  it('`documentosCargados` sigue ganándolo el borrador · RF-TAS-10 pendiente', () => {
    const combinado = combinarConBorrador(
      servidor(),
      borradorEnBlanco({ documentosCargados: { escritura: [1] } }),
    )

    // Única excepción viva: lo persiste el pipeline de adjuntos de IF-02 y
    // ninguna lectura de IF-03 lo devuelve todavía.
    expect(combinado.documentosCargados).toEqual({ escritura: [1] })
  })

  it('CANDADO · un borrador en blanco no pisa lo hidratado', () => {
    // Con la regla vieja —`readPayload(id) ?? informeInicial`— acá se perdía
    // todo lo que el tasador había guardado en la visita anterior.
    const combinado = combinarConBorrador(servidor(), borradorEnBlanco())

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

  it('INVERTIDO EN .A.4 · las fotos ya entran en la comparación', () => {
    // Antes de .A.4 esto era `false`: las fotos estaban exentas porque el
    // servidor no las mandaba, y contarlas habría hecho el predicado verdadero
    // en cada apertura. Ahora el servidor **sí** las manda, así que una
    // diferencia en fotos es una diferencia de verdad.
    //
    // Consecuencia práctica declarada: una foto en la **cola offline** vive sólo
    // en el borrador, así que enciende el banner en el formulario. Es ruido
    // acotado y no destruye nada —«Recuperar» restaura el borrador entero, que
    // ya viene hidratado desde .A.4— y además es información correcta: hay
    // cambios locales sin sincronizar.
    const conFotos = servidor({
      fotosPredefinidas: { cocina: [{ id: 'f-1' }], banos: [] },
    })
    expect(difiereEnSecciones(servidor(), conFotos)).toBe(true)
  })

  it('`documentosCargados` sigue exento de la comparación', () => {
    const conDocs = servidor({ documentosCargados: { escritura: [1] } })
    expect(difiereEnSecciones(servidor(), conDocs)).toBe(false)
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

  it('CANDADO · no ofrece recuperar un borrador en blanco', () => {
    // Cumple «hay cambios sin sincronizar» **y** difiere de lo hidratado, así
    // que `difiereEnSecciones` sola lo habría dejado pasar. Ofrecerlo sería
    // proponer pisar los datos reales de Airtable con un formulario vacío.
    expect(difiereEnSecciones(servidor(), borradorEnBlanco())).toBe(true)
    expect(caso(borradorEnBlanco(), SIN_SINCRONIZAR)).toBe(false)
  })

  it('.A.4 · una foto sólo local sí lo enciende, y es correcto', () => {
    // Efecto declarado de vaciar `CLAVES_SOLO_BORRADOR` (D-4): las fotos entran
    // en la comparación, así que una que vive sólo en la cola offline cuenta
    // como contenido que el servidor no tiene. No destruye nada —«Recuperar»
    // restaura el borrador, que desde .A.4 ya viene hidratado en A–H— y dice la
    // verdad: hay trabajo local sin sincronizar.
    expect(caso(borradorEnBlancoConFotos(), SIN_SINCRONIZAR)).toBe(true)
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

  it('INVERTIDO EN .A.4 · una diferencia sólo en las fotos sí aporta', () => {
    // Antes de .A.4 las fotos estaban exentas. Ahora tienen proyección
    // server-side y una foto que el servidor no conoce es contenido local real.
    const otrasFotos = servidor({ fotosPredefinidas: { cocina: [{ id: 'f-9' }], banos: [] } })
    expect(borradorAportaContenido(servidor(), otrasFotos)).toBe(true)
  })

  it('una diferencia sólo en `documentosCargados` no aporta', () => {
    // La única clave exenta que queda: sigue sin proyección hasta RF-TAS-10, y
    // contarla haría el predicado verdadero cada vez que el tasador adjunta un
    // documento, que es justamente el ruido que el reparto evita.
    const conDocs = servidor({ documentosCargados: { escritura: [1] } })
    expect(borradorAportaContenido(servidor(), conDocs)).toBe(false)
  })
})
