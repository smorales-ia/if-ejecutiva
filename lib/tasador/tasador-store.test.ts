import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P7-TAS.A.2 · el sobre v2 del borrador y su migración desde v1.
 *
 * ## Por qué se prueba este módulo y no el hook
 *
 * `useGuardado` no es testeable en este proyecto: no hay `jsdom`,
 * `happy-dom` ni `@testing-library/react`, `vitest.config.mts` no declara
 * `environment` —corre en node— y CLAUDE.md cierra la puerta a agregar
 * dependencias de testing. La respuesta no fue resignar cobertura sino mover
 * las decisiones: `migrarEnvoltorio` y `hayCambiosSinSincronizar` son **puras**
 * y concentran todo lo que este subsistema decide. Lo que queda en el hook
 * —temporizador, `fetch`, transiciones de estado— es mecánica.
 *
 * ## El `localStorage` falso
 *
 * `almacen()` de `tasador-store` mira `typeof window`, que en node es
 * `undefined`. Se define un `window` mínimo con un `Storage` en memoria: eso
 * permite probar el ciclo completo `write → read → marcar → clear` contra el
 * código real, sin navegador y sin dependencias nuevas.
 *
 * ## El candado que importa
 *
 * `migra un borrador v1 con las ocho secciones llenas` no es un test más. La
 * subida de `VERSION_BORRADOR` a 2 pasa por la misma rama que en v1 descartaba
 * los borradores de otra versión, y "arreglar" la migración volviendo a
 * `removeItem` borraría el trabajo de terreno de todo tasador con una visita a
 * medio cargar. El test existe para que ese cambio falle en CI y no en un
 * teléfono.
 */

import {
  VERSION_BORRADOR,
  clearPayload,
  hayCambiosSinSincronizar,
  leerMeta,
  marcarSincronizado,
  migrarEnvoltorio,
  readPayload,
  writePayload,
  type MetaBorrador,
} from './tasador-store'
import type { InformeData } from './tasaciones'

/* -------------------------------------------------------------------------
 * Andamiaje
 * ---------------------------------------------------------------------- */

function crearStorage(): Storage {
  const mapa = new Map<string, string>()
  return {
    get length() {
      return mapa.size
    },
    clear: () => mapa.clear(),
    getItem: (k: string) => mapa.get(k) ?? null,
    key: (i: number) => [...mapa.keys()][i] ?? null,
    removeItem: (k: string) => {
      mapa.delete(k)
    },
    setItem: (k: string, v: string) => {
      mapa.set(k, v)
    },
  } as unknown as Storage
}

let almacen: Storage

beforeEach(() => {
  almacen = crearStorage()
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: almacen },
    configurable: true,
    writable: true,
  })
})

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'window')
  vi.restoreAllMocks()
})

const ID = 'recAAAAAAAAAAAAAA'
const OTRO_ID = 'recBBBBBBBBBBBBBB'

function clave(id: string): string {
  return `vp.tasador.informe.${id}`
}

/**
 * Formulario de terreno con las ocho secciones tocadas. No es un `InformeData`
 * completo —tiene decenas de claves— pero sí lleva una de cada sección, que es
 * lo que el candado de la migración necesita comprobar.
 */
function ochoSecciones(): InformeData {
  return {
    /* A */ fechaVisitaReal: '2026-08-20',
    /* B */ supTerreno: '5024.86',
    /* C */ items: [{ id: 'it-1', descripcion: 'Casa principal' }],
    /* D */ comparables: [{ id: 'cmp-1' }],
    /* E */ recintos: [{ id: 'Cocina', nombre: 'Cocina', pavimento: 'Ceramica' }],
    /* F */ cbrFoja: '1234',
    /* G */ motivoOverride: 'Ajuste por estado de conservación observado en terreno',
    /* H */ arriendoBrutoClp: '850000',
  } as unknown as InformeData
}

function sobreV1(datos: InformeData, guardadoTs = '2026-08-20T10:00:00.000Z') {
  return JSON.stringify({ version: 1, guardadoTs, datos })
}

/* -------------------------------------------------------------------------
 * migrarEnvoltorio — función pura
 * ---------------------------------------------------------------------- */

describe('migrarEnvoltorio', () => {
  it('migra un sobre v1 a v2 conservando los datos', () => {
    const env = migrarEnvoltorio(sobreV1(ochoSecciones()))

    expect(env?.version).toBe(VERSION_BORRADOR)
    expect(env?.guardadoTs).toBe('2026-08-20T10:00:00.000Z')
    expect(env?.datos.supTerreno).toBe('5024.86')
  })

  it('un sobre v1 se lee como nunca sincronizado', () => {
    // Es la lectura conservadora: v1 no sabía si el PATCH había llegado.
    expect(migrarEnvoltorio(sobreV1(ochoSecciones()))?.sincronizadoTs).toBeNull()
  })

  it('fecha en el epoch un sobre sin `guardadoTs` legible', () => {
    const crudo = JSON.stringify({ version: 1, datos: ochoSecciones() })
    // Fecharlo "ahora" lo haría parecer recién guardado y le ganaría a una
    // sincronización real posterior.
    expect(migrarEnvoltorio(crudo)?.guardadoTs).toBe(new Date(0).toISOString())
  })

  it('deja pasar un sobre v2 con su `sincronizadoTs`', () => {
    const crudo = JSON.stringify({
      version: 2,
      guardadoTs: '2026-08-20T10:00:00.000Z',
      sincronizadoTs: '2026-08-20T10:05:00.000Z',
      datos: ochoSecciones(),
    })

    expect(migrarEnvoltorio(crudo)?.sincronizadoTs).toBe('2026-08-20T10:05:00.000Z')
  })

  it('devuelve null ante JSON corrupto', () => {
    expect(migrarEnvoltorio('{"version":2,')).toBeNull()
  })

  it('devuelve null cuando no hay nada guardado', () => {
    expect(migrarEnvoltorio(null)).toBeNull()
    expect(migrarEnvoltorio('')).toBeNull()
  })

  it('devuelve null ante una versión desconocida', () => {
    // Un despliegue más nuevo en otra pestaña: no se puede migrar hacia atrás
    // algo cuya forma este código no conoce.
    const crudo = JSON.stringify({ version: 3, guardadoTs: 'x', datos: ochoSecciones() })
    expect(migrarEnvoltorio(crudo)).toBeNull()
  })

  it('devuelve null si el sobre no trae `datos`', () => {
    expect(migrarEnvoltorio(JSON.stringify({ version: 2, guardadoTs: 'x' }))).toBeNull()
  })

  it('devuelve null si el contenido no es un objeto', () => {
    expect(migrarEnvoltorio('42')).toBeNull()
    expect(migrarEnvoltorio('"hola"')).toBeNull()
  })

  it('normaliza las fotos de la forma vieja de P5-TAS', () => {
    const datos = { ...ochoSecciones(), fotosPredefinidas: { cocina: [1, 2, 3] } }
    const env = migrarEnvoltorio(JSON.stringify({ version: 1, guardadoTs: 'x', datos }))

    // Los `number` eran identificadores de un contador en memoria, sin archivo
    // detrás: se descartan en vez de fabricar `FotoAdjunta` que nunca existieron.
    expect(env?.datos.fotosPredefinidas.cocina).toEqual([])
  })
})

/* -------------------------------------------------------------------------
 * hayCambiosSinSincronizar — función pura
 * ---------------------------------------------------------------------- */

describe('hayCambiosSinSincronizar', () => {
  const meta = (guardadoTs: string, sincronizadoTs: string | null): MetaBorrador => ({
    version: VERSION_BORRADOR,
    guardadoTs,
    sincronizadoTs,
  })

  it('es false sin borrador', () => {
    expect(hayCambiosSinSincronizar(null)).toBe(false)
  })

  it('es true si nunca sincronizó', () => {
    expect(hayCambiosSinSincronizar(meta('2026-08-20T10:00:00.000Z', null))).toBe(true)
  })

  it('es true si se guardó después de sincronizar', () => {
    expect(
      hayCambiosSinSincronizar(
        meta('2026-08-20T10:05:00.000Z', '2026-08-20T10:00:00.000Z'),
      ),
    ).toBe(true)
  })

  it('es false si se sincronizó después de guardar', () => {
    expect(
      hayCambiosSinSincronizar(
        meta('2026-08-20T10:00:00.000Z', '2026-08-20T10:05:00.000Z'),
      ),
    ).toBe(false)
  })

  it('es false con marcas idénticas', () => {
    const ts = '2026-08-20T10:00:00.000Z'
    expect(hayCambiosSinSincronizar(meta(ts, ts))).toBe(false)
  })
})

/* -------------------------------------------------------------------------
 * Ciclo completo contra el `localStorage` falso
 * ---------------------------------------------------------------------- */

describe('ciclo write · read · marcar · clear', () => {
  it('lo escrito se recupera', () => {
    writePayload(ID, ochoSecciones())
    expect(readPayload(ID)?.supTerreno).toBe('5024.86')
  })

  it('escribe en v2 y sin sincronizar', () => {
    writePayload(ID, ochoSecciones())
    const meta = leerMeta(ID)

    expect(meta?.version).toBe(VERSION_BORRADOR)
    expect(meta?.sincronizadoTs).toBeNull()
    expect(hayCambiosSinSincronizar(meta)).toBe(true)
  })

  it('`writePayload` no borra una sincronización previa', () => {
    writePayload(ID, ochoSecciones())
    marcarSincronizado(ID, '2026-08-20T10:00:00.000Z')
    writePayload(ID, { ...ochoSecciones(), supTerreno: '600' })

    // Sigue marcada: lo que cambia es que `guardadoTs` la adelanta.
    expect(leerMeta(ID)?.sincronizadoTs).toBe('2026-08-20T10:00:00.000Z')
    expect(hayCambiosSinSincronizar(leerMeta(ID))).toBe(true)
  })

  it('`marcarSincronizado` no toca los datos', () => {
    writePayload(ID, ochoSecciones())
    marcarSincronizado(ID, '2026-08-20T11:00:00.000Z')

    expect(readPayload(ID)?.cbrFoja).toBe('1234')
    expect(leerMeta(ID)?.sincronizadoTs).toBe('2026-08-20T11:00:00.000Z')
  })

  it('`marcarSincronizado` no fabrica un borrador si no hay ninguno', () => {
    marcarSincronizado(ID, '2026-08-20T11:00:00.000Z')

    expect(leerMeta(ID)).toBeNull()
    expect(readPayload(ID)).toBeNull()
  })

  it('`clearPayload` descarta el borrador', () => {
    writePayload(ID, ochoSecciones())
    clearPayload(ID)

    expect(readPayload(ID)).toBeNull()
    expect(leerMeta(ID)).toBeNull()
  })

  it('dos solicitudes no se pisan', () => {
    writePayload(ID, ochoSecciones())
    writePayload(OTRO_ID, { ...ochoSecciones(), supTerreno: '99' })

    expect(readPayload(ID)?.supTerreno).toBe('5024.86')
    expect(readPayload(OTRO_ID)?.supTerreno).toBe('99')
  })

  it('un borrador ilegible se descarta del almacén', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    almacen.setItem(clave(ID), '{"version":2,')

    expect(readPayload(ID)).toBeNull()
    expect(almacen.getItem(clave(ID))).toBeNull()
  })

  it('sin `window` no lanza y devuelve vacío', () => {
    Reflect.deleteProperty(globalThis, 'window')

    expect(() => writePayload(ID, ochoSecciones())).not.toThrow()
    expect(readPayload(ID)).toBeNull()
    expect(leerMeta(ID)).toBeNull()
  })
})

/* -------------------------------------------------------------------------
 * El candado · la subida a v2 no puede destruir trabajo de terreno
 * ---------------------------------------------------------------------- */

describe('candado · la migración v1→v2 no es destructiva', () => {
  it('un borrador v1 con las ocho secciones llenas sobrevive a `readPayload`', () => {
    almacen.setItem(clave(ID), sobreV1(ochoSecciones()))

    const datos = readPayload(ID)

    expect(datos).not.toBeNull()
    expect(datos?.fechaVisitaReal).toBe('2026-08-20') // A
    expect(datos?.supTerreno).toBe('5024.86') // B
    expect(datos?.items).toHaveLength(1) // C
    expect(datos?.comparables).toHaveLength(1) // D
    expect(datos?.recintos).toHaveLength(1) // E
    expect(datos?.cbrFoja).toBe('1234') // F
    expect(datos?.motivoOverride).toContain('Ajuste por estado') // G
    expect(datos?.arriendoBrutoClp).toBe('850000') // H
  })

  it('un borrador v1 sigue en el almacén después de leerlo', () => {
    almacen.setItem(clave(ID), sobreV1(ochoSecciones()))
    readPayload(ID)

    // La migración es de lectura: no se descarta ni se reescribe sola.
    expect(almacen.getItem(clave(ID))).not.toBeNull()
  })

  it('el primer `writePayload` deja el sobre en v2', () => {
    almacen.setItem(clave(ID), sobreV1(ochoSecciones()))
    writePayload(ID, ochoSecciones())

    expect(leerMeta(ID)?.version).toBe(VERSION_BORRADOR)
  })
})
