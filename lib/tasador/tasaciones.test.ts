import { describe, expect, it } from 'vitest'
import {
  normalizarFotosBorrador,
  resolverAccionCard,
  type EstadoCoordinacion,
  type FotoAdjunta,
  type InformeData,
  type Tasacion,
} from './tasaciones'

/**
 * Bloque 2 (A · gate §2.4 · CI-046) — el único punto de la Regla T-A.
 *
 * `resolverAccionCard()` es lo que la card consume: la card no decide, sólo
 * renderiza la variante que esta función devuelve. Por eso la lógica del gate se
 * prueba acá y no en el componente —el repo no tiene `jsdom` ni
 * `@testing-library` y `CLAUDE.md` cierra la puerta a agregarlos—, y lo que
 * queda en el `.tsx` es render sobre un `switch` exhaustivo.
 *
 * Sólo se leen `id` y `coordinacionVigente`, así que el resto de `Tasacion` se
 * omite con un cast: el contrato bajo prueba es el discriminante, no la
 * proyección completa.
 */
function tasacion(id: string, coordinacionVigente?: EstadoCoordinacion | null): Tasacion {
  return { id, coordinacionVigente } as Tasacion
}

describe('resolverAccionCard · las tres variantes excluyentes de la Regla T-A', () => {
  it('sin coordinación (null) → "Coordinar visita", acento, hacia /coordinar', () => {
    expect(resolverAccionCard(tasacion('rec1', null))).toEqual({
      tipo: 'coordinar',
      rotulo: 'Coordinar visita',
      href: '/tasaciones/rec1/coordinar',
      variante: 'acento',
    })
  })

  it('sin intentos (undefined) cae en la misma rama que null', () => {
    expect(resolverAccionCard(tasacion('rec1', undefined)).tipo).toBe('coordinar')
  })

  it('confirmada → "Abrir tasación", primario, hacia la captura', () => {
    expect(resolverAccionCard(tasacion('rec2', 'confirmada'))).toEqual({
      tipo: 'abrir',
      rotulo: 'Abrir tasación',
      href: '/tasaciones/rec2',
      variante: 'primario',
    })
  })

  it('rechazada → "Ver coordinación" deshabilitado + badge, sin href', () => {
    const accion = resolverAccionCard(tasacion('rec3', 'rechazada'))
    expect(accion).toEqual({
      tipo: 'esperando_ejecutiva',
      rotulo: 'Ver coordinación',
      deshabilitado: true,
      badge: 'Esperando contacto de ejecutiva',
    })
    expect('href' in accion).toBe(false)
  })

  /**
   * Los dos href son las dos rutas del gate y no pueden colarse cruzados: sin
   * coordinar se va a coordinar, coordinado se entra a la captura. Se afirman
   * aparte para que un swap accidental de rutas rompa un test propio.
   */
  it('los href de las dos variantes con Link apuntan a rutas distintas', () => {
    const coordinar = resolverAccionCard(tasacion('rec9', null))
    const abrir = resolverAccionCard(tasacion('rec9', 'confirmada'))
    expect(coordinar.tipo === 'coordinar' && coordinar.href).toBe('/tasaciones/rec9/coordinar')
    expect(abrir.tipo === 'abrir' && abrir.href).toBe('/tasaciones/rec9')
  })
})

/**
 * P5-TAS · B2 — el saneo de las fotos de un borrador local.
 *
 * `InformeData.fotosPredefinidas` pasó de `number[]` a `FotoAdjunta[]`, y en
 * `localStorage` hay borradores con la forma vieja. El mecanismo previsto para
 * un cambio de forma es subir la `VERSION` de `tasador-store`, pero eso
 * **descartaría el formulario entero** —las ocho secciones medidas en terreno—
 * para arreglar dos arrays. Esta función los sanea y deja el resto intacto.
 *
 * Sin este saneo el fallo sería silencioso y tardío: TypeScript no ve lo que
 * sale de `JSON.parse`, así que los números sobrevivirían hasta que algo
 * intentara leerles `.id` o `.nombre` en pantalla.
 */
describe('normalizarFotosBorrador · borradores anteriores a P5-TAS', () => {
  const foto = (n: number): FotoAdjunta => ({
    id: `recF${String(n).padStart(13, '0')}`,
    categoria: 'cocina',
    nombre: `IMG_${n}.jpg`,
    url: null,
    thumbnailUrl: null,
    hashMd5: null,
  })

  /** Un borrador con la forma que se guardaba antes de esta tanda. */
  const borradorViejo = () =>
    ({
      dormitorios: '3',
      observacionesTasador: 'Piso flotante en dormitorios',
      fotosPredefinidas: { cocina: [1, 2], banos: [3] },
      categoriasCustom: [{ id: 'cat-1', nombre: 'Bodega', minimo: 1, fotos: [4, 5] }],
    }) as unknown as InformeData

  it('descarta los identificadores locales, que no referenciaban nada', () => {
    const saneado = normalizarFotosBorrador(borradorViejo())

    expect(saneado.fotosPredefinidas.cocina).toEqual([])
    expect(saneado.fotosPredefinidas.banos).toEqual([])
    expect(saneado.categoriasCustom[0].fotos).toEqual([])
  })

  it('conserva el resto del formulario, que es lo caro de rehacer', () => {
    const saneado = normalizarFotosBorrador(borradorViejo())

    expect(saneado.dormitorios).toBe('3')
    expect(saneado.observacionesTasador).toBe('Piso flotante en dormitorios')
    expect(saneado.categoriasCustom[0].nombre).toBe('Bodega')
  })

  it('deja las ocho categorías presentes aunque el borrador sólo trajera dos', () => {
    const saneado = normalizarFotosBorrador(borradorViejo())

    expect(Object.keys(saneado.fotosPredefinidas)).toHaveLength(8)
  })

  it('no toca las fotos que ya tienen la forma nueva', () => {
    const nuevo = {
      fotosPredefinidas: { cocina: [foto(1)] },
      categoriasCustom: [{ id: 'cat-1', nombre: 'Bodega', minimo: 0, fotos: [foto(2)] }],
    } as unknown as InformeData

    const saneado = normalizarFotosBorrador(nuevo)

    expect(saneado.fotosPredefinidas.cocina).toHaveLength(1)
    expect(saneado.fotosPredefinidas.cocina[0].nombre).toBe('IMG_1.jpg')
    expect(saneado.categoriasCustom[0].fotos).toHaveLength(1)
  })

  it('sobrevive a un borrador corrupto o manipulado a mano', () => {
    const roto = {
      fotosPredefinidas: null,
      categoriasCustom: 'no soy un array',
    } as unknown as InformeData

    const saneado = normalizarFotosBorrador(roto)

    expect(Object.keys(saneado.fotosPredefinidas)).toHaveLength(8)
    expect(saneado.categoriasCustom).toEqual([])
  })
})
