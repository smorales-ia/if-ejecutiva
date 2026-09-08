import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P6-TAS · `GET /api/tasaciones/[id]/lectura` — el avance que consume el
 * stepper de Pantalla 4 (RF-TAS-15 · §7.1).
 *
 * El desglose `porEstado` se agregó en esta tanda. Los agregados que ya había
 * —`terminados`, `conError`— no alcanzaban para el criterio de §7.3:
 * `delegado_visador` es terminal y **sí** habilita «Continuar»
 * (RF-09/CI-013 · D-2026-09-04): dispara un aviso ámbar, no bloquea. Aun así
 * debe distinguirse de un `listo` en el desglose, porque contado dentro de
 * `terminados` era indistinguible y el aviso no tendría de dónde salir.
 *
 * La ruta **sólo observa**: R7 exige que no dispare ni reintente nada. Hay un
 * test que lo afirma, porque agregar una escritura aquí no rompería ningún otro.
 */

const autorizarSolicitud = vi.fn()
const listRecords = vi.fn()
const createRecord = vi.fn()
const updateRecord = vi.fn()
const getTiposDocumento = vi.fn()

vi.mock('@/lib/tasador/auth-guard', () => ({
  autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
}))

vi.mock('@/lib/tipos-documento', () => ({
  getTiposDocumento: (...args: unknown[]) => getTiposDocumento(...args),
}))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
    listRecords: (...args: unknown[]) => listRecords(...args),
    createRecord: (...args: unknown[]) => createRecord(...args),
    updateRecord: (...args: unknown[]) => updateRecord(...args),
  }
})

import { GET } from './route'
import { resolverAvanceLectura } from '@/lib/tasador/avance-lectura'

const ID = 'recAAAAAAAAAAAAAA'
const CODIGO = 'VP-2026-0061'

function guardOk() {
  return {
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: CODIGO, estado: 'visitada' },
  }
}

/** Un adjunto por cada estado que se le pase. */
function adjuntos(...estados: (string | undefined)[]) {
  return estados.map((estado_extraccion, i) => ({
    id: `recADJ${i}`,
    createdTime: '',
    fields: { nombre_archivo: `doc-${i}.pdf`, estado_extraccion },
  }))
}

async function llamar(id = ID) {
  const res = await GET({} as never, { params: Promise.resolve({ id }) })
  return {
    status: res.status,
    cuerpo: (await res.json()) as { data: Record<string, never> },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  autorizarSolicitud.mockResolvedValue(guardOk())
  listRecords.mockResolvedValue([])
  getTiposDocumento.mockResolvedValue([])
})

describe('desglose por estado', () => {
  it('devuelve las siete claves aunque estén en cero', async () => {
    listRecords.mockResolvedValue(adjuntos('listo'))

    const { cuerpo } = await llamar()
    const porEstado = cuerpo.data.porEstado as unknown as Record<string, number>

    expect(Object.keys(porEstado).sort()).toEqual(
      [
        'delegado_visador',
        'error',
        'extrayendo',
        'idle',
        'listo',
        'no_corresponde',
        'skipped',
      ].sort()
    )
    expect(porEstado.listo).toBe(1)
    expect(porEstado.error).toBe(0)
  })

  it('distingue `delegado_visador` de `listo` aunque ambos sean terminales', async () => {
    listRecords.mockResolvedValue(adjuntos('listo', 'delegado_visador'))

    const { cuerpo } = await llamar()
    const d = cuerpo.data as unknown as {
      terminados: number
      porEstado: Record<string, number>
    }

    // El agregado los mete en la misma bolsa…
    expect(d.terminados).toBe(2)
    // …y el desglose es lo que permite el aviso ámbar sin bloquear el botón.
    expect(d.porEstado.delegado_visador).toBe(1)
    const avance = resolverAvanceLectura(d.porEstado)
    expect(avance.puedeContinuar).toBe(true)
    expect(avance.hayDelegado).toBe(true)
  })

  it('un adjunto sin `estado_extraccion` cuenta como `idle`', async () => {
    listRecords.mockResolvedValue(adjuntos(undefined, 'listo'))

    const { cuerpo } = await llamar()
    const porEstado = cuerpo.data.porEstado as unknown as Record<string, number>

    expect(porEstado.idle).toBe(1)
    expect(cuerpo.data.completo).toBe(false as never)
  })

  it('un estado fuera del dominio aparece en el body en vez de perderse', async () => {
    listRecords.mockResolvedValue(adjuntos('un_estado_nuevo'))

    const { cuerpo } = await llamar()
    const porEstado = cuerpo.data.porEstado as unknown as Record<string, number>

    expect(porEstado.un_estado_nuevo).toBe(1)
  })
})

describe('el agregado `completo`', () => {
  it('es true sin adjuntos: no hay nada que esperar', async () => {
    const { cuerpo } = await llamar()
    expect(cuerpo.data.completo).toBe(true as never)
    expect(cuerpo.data.total).toBe(0 as never)
  })

  it('es false mientras algo siga `extrayendo`', async () => {
    listRecords.mockResolvedValue(adjuntos('listo', 'extrayendo'))
    const { cuerpo } = await llamar()
    expect(cuerpo.data.completo).toBe(false as never)
  })

  it('es true con todo terminal, incluido el desenlace que sólo avisa', async () => {
    listRecords.mockResolvedValue(adjuntos('listo', 'error'))
    const { cuerpo } = await llamar()
    expect(cuerpo.data.completo).toBe(true as never)
  })
})

describe('lectura filtrada y guard', () => {
  it('filtra por el código de la solicitud, no trae la tabla entera', async () => {
    await llamar()
    const [, params] = listRecords.mock.calls[0]
    expect(params.filterByFormula).toBe(`{solicitud}="${CODIGO}"`)
  })

  it('no consulta nada si el guard rechaza', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: false,
      status: 403,
      mensaje: 'No encontramos esta solicitud entre las tuyas.',
    })

    const { status } = await llamar()

    expect(status).toBe(403)
    expect(listRecords).not.toHaveBeenCalled()
  })
})

describe('detalle por documento · adjuntos[]', () => {
  type AdjDetalle = { id: string; codigo: string; nombre: string; estado: string }

  function detalle(cuerpo: { data: Record<string, never> }): AdjDetalle[] {
    return cuerpo.data.adjuntos as unknown as AdjDetalle[]
  }

  it('proyecta id, codigo, nombre del catálogo y estado', async () => {
    getTiposDocumento.mockResolvedValue([
      { id: 'recT1', codigo: 'permiso_edificacion', nombre: 'Permiso de Edificación' },
    ])
    listRecords.mockResolvedValue([
      {
        id: 'recADJ1',
        createdTime: '',
        fields: {
          nombre_archivo: 'permiso.pdf',
          estado_extraccion: 'listo',
          clave_adjunto: 'permiso_edificacion',
        },
      },
    ])

    const { cuerpo } = await llamar()

    expect(detalle(cuerpo)).toEqual([
      {
        id: 'recADJ1',
        codigo: 'permiso_edificacion',
        nombre: 'Permiso de Edificación',
        estado: 'listo',
      },
    ])
  })

  it('un adjunto suelto cae al nombre del archivo, con codigo vacío y sin leer el catálogo', async () => {
    listRecords.mockResolvedValue([
      {
        id: 'recADJ2',
        createdTime: '',
        fields: { nombre_archivo: 'foto.jpg', estado_extraccion: 'idle' },
      },
    ])

    const { cuerpo } = await llamar()

    expect(detalle(cuerpo)[0]).toEqual({
      id: 'recADJ2',
      codigo: '',
      nombre: 'foto.jpg',
      estado: 'idle',
    })
    // Sin `clave_adjunto` no hay nada que resolver contra el catálogo.
    expect(getTiposDocumento).not.toHaveBeenCalled()
  })

  it('el estado ausente se normaliza a idle en el detalle', async () => {
    listRecords.mockResolvedValue([
      { id: 'recADJ3', createdTime: '', fields: { nombre_archivo: 'x.pdf' } },
    ])

    const { cuerpo } = await llamar()

    expect(detalle(cuerpo)[0].estado).toBe('idle')
  })

  it('si el catálogo falla, degrada al nombre del archivo sin tumbar el avance', async () => {
    getTiposDocumento.mockRejectedValue(new Error('catálogo caído'))
    listRecords.mockResolvedValue([
      {
        id: 'recADJ4',
        createdTime: '',
        fields: {
          nombre_archivo: 'permiso.pdf',
          estado_extraccion: 'listo',
          clave_adjunto: 'permiso_edificacion',
        },
      },
    ])

    const { cuerpo, status } = await llamar()

    expect(status).toBe(200)
    expect(detalle(cuerpo)[0].nombre).toBe('permiso.pdf')
  })

  it('sin código de solicitud devuelve adjuntos vacío', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: true,
      solicitudId: ID,
      usuarioRecordId: 'recSR3RxY6rsLb8k7',
      fields: { codigo_solicitud: '', estado: 'visitada' },
    })

    const { cuerpo } = await llamar()

    expect(detalle(cuerpo)).toEqual([])
  })
})

describe('R7 · la ruta sólo observa', () => {
  it('no escribe nada en Airtable', async () => {
    listRecords.mockResolvedValue(adjuntos('idle', 'extrayendo'))

    await llamar()

    // La pantalla consume el pipeline existente; no lo dispara ni lo reintenta.
    expect(createRecord).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
  })
})
