import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P5-TAS · B3 — el `PATCH` de categorización de fotos (RF-TAS-14 · §2.6), que
 * es la implementación de la **opción (a) de CI-052**.
 *
 * Lo que estos tests protegen no es sólo lo que la ruta hace, sino **lo que
 * dejó de hacer**: no crear una fila en `TX_Adjuntos`. Ésa era la duplicación
 * que CI-052 documenta, y reintroducirla no rompería ningún otro test —la fila
 * extra no falla, sólo aparece dos veces en los contadores—. Sin una aserción
 * que lo niegue, el defecto vuelve en la primera refactorización.
 */

const autorizarSolicitud = vi.fn()
const getRecord = vi.fn()
const updateRecord = vi.fn()
const createRecord = vi.fn()
const listRecords = vi.fn()
const auditar = vi.fn()

vi.mock('@/lib/tasador/auth-guard', () => ({
  autorizarSolicitud: (...args: unknown[]) => autorizarSolicitud(...args),
}))

vi.mock('@/lib/airtable-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/airtable-client')>()
  return {
    ...real,
    getRecord: (...args: unknown[]) => getRecord(...args),
    updateRecord: (...args: unknown[]) => updateRecord(...args),
    createRecord: (...args: unknown[]) => createRecord(...args),
    listRecords: (...args: unknown[]) => listRecords(...args),
  }
})

vi.mock('@/lib/tasador/auditoria', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/tasador/auditoria')>()
  return { ...real, auditar: (...args: unknown[]) => auditar(...args) }
})

import { GET, PATCH } from './route'
import { MENSAJES } from '@/lib/tasador/mensajes'

const ID = 'recAAAAAAAAAAAAAA'
const OTRA = 'recBBBBBBBBBBBBBB'
const ADJUNTO = 'recFOTO1234567890'.slice(0, 17)
const CODIGO = 'VP-2026-0060'
const TABLA_ADJUNTOS = 'tblur71x1oItbmKZc'

function guardOk(fields: Record<string, unknown> = {}) {
  return {
    ok: true,
    solicitudId: ID,
    usuarioRecordId: 'recSR3RxY6rsLb8k7',
    fields: { codigo_solicitud: CODIGO, estado: 'asignada', ...fields },
  }
}

function adjuntoDe(solicitudes: string[], fields: Record<string, unknown> = {}) {
  return {
    id: ADJUNTO,
    createdTime: '',
    fields: { nombre_archivo: 'IMG_1.jpg', solicitud: solicitudes, ...fields },
  }
}

function patch(body: unknown, id = ID) {
  const request = { json: async () => body } as never
  return PATCH(request, { params: Promise.resolve({ id }) })
}

function get(id = ID) {
  return GET({} as never, { params: Promise.resolve({ id }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  autorizarSolicitud.mockResolvedValue(guardOk())
  getRecord.mockResolvedValue(adjuntoDe([ID]))
  updateRecord.mockResolvedValue({ id: ADJUNTO, createdTime: '', fields: {} })
  auditar.mockResolvedValue(1)
  listRecords.mockResolvedValue([])
})

describe('CI-052 · la ruta actualiza, no crea', () => {
  it('nunca llama a createRecord', async () => {
    const res = await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    expect(res.status).toBe(200)
    expect(createRecord).not.toHaveBeenCalled()
    expect(updateRecord).toHaveBeenCalledTimes(1)
  })

  it('escribe la categoría sobre el adjunto que creó el pipeline', async () => {
    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    expect(updateRecord).toHaveBeenCalledWith(
      TABLA_ADJUNTOS,
      ADJUNTO,
      expect.objectContaining({ descripcion: 'cocina' }),
    )
  })

  it('no pisa los campos que son del pipeline de subida', async () => {
    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    const [, , campos] = updateRecord.mock.calls[0]
    for (const propiedad of [
      'solicitud',
      'nombre_archivo',
      'url_dropbox',
      'tamanio_kb',
      'mime_type',
      'hash_md5',
      'subido_en',
    ]) {
      expect(campos).not.toHaveProperty(propiedad)
    }
  })
})

describe('guard de pertenencia', () => {
  it('rechaza un adjunto que cuelga de otra solicitud', async () => {
    getRecord.mockResolvedValue(adjuntoDe([OTRA]))

    const res = await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({
      error: MENSAJES.adjuntoNoDisponible,
    })
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('rechaza un adjunto inexistente con el mismo mensaje', async () => {
    getRecord.mockResolvedValue(null)

    const res = await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({
      error: MENSAJES.adjuntoNoDisponible,
    })
  })

  it('un id sin forma de record ID ni de autoNumber no llega a Airtable', async () => {
    const res = await patch({ adjuntoId: 'no-es-un-record-id', categoria: 'cocina' })

    expect(res.status).toBe(404)
    expect(getRecord).not.toHaveBeenCalled()
    expect(listRecords).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('no se ejecuta nada si el guard de la solicitud falla', async () => {
    autorizarSolicitud.mockResolvedValue({
      ok: false,
      status: 403,
      mensaje: MENSAJES.solicitudNoDisponible,
    })

    const res = await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    expect(res.status).toBe(403)
    expect(getRecord).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
  })
})

describe('[PUENTE CI-061] autoNumber → record ID', () => {
  it('resuelve un adjunto_id autoNumber a su record ID y categoriza', async () => {
    // Mientras SC-Adjuntos-Upload v1.4 no esté en Make, la subida devuelve el
    // autoNumber ("40"); el puente lo resuelve por filterByFormula.
    listRecords.mockResolvedValue([adjuntoDe([ID])])

    const res = await patch({ adjuntoId: '40', categoria: 'cocina' })

    expect(res.status).toBe(200)
    const [, params] = listRecords.mock.calls[0]
    expect(params.filterByFormula).toContain('{adjunto_id} = 40')
    // Escribe sobre el record ID resuelto, nunca sobre el autoNumber.
    expect(updateRecord).toHaveBeenCalledWith(
      TABLA_ADJUNTOS,
      ADJUNTO,
      expect.objectContaining({ descripcion: 'cocina' }),
    )
  })

  it('404 si el autoNumber no existe en la tabla', async () => {
    listRecords.mockResolvedValue([])

    const res = await patch({ adjuntoId: '999', categoria: 'cocina' })

    expect(res.status).toBe(404)
    expect(getRecord).not.toHaveBeenCalled()
    expect(updateRecord).not.toHaveBeenCalled()
  })
})

describe('clave_adjunto · llave de RF-09 para la foto de comparables', () => {
  it('escribe clave_adjunto=foto_ofertas_comparables server-side para el cuadro', async () => {
    await patch({ adjuntoId: ADJUNTO, categoria: 'ofertas_comparables' })

    // Sin esta llave AT-RF09-Trigger salta la extracción (RN-25) y la sección D
    // queda en «0 de 3 comparables leídos». Se escribe directo en Airtable, sin
    // depender de que Make/el cliente hayan mandado tipo_documento en la subida.
    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos.clave_adjunto).toBe('foto_ofertas_comparables')
  })

  it('no escribe clave_adjunto para una foto de registro normal', async () => {
    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos).not.toHaveProperty('clave_adjunto')
  })

  it('rescata el skipped: repone estado_extraccion=idle al reponer la llave', async () => {
    // El disparo en recordCreated dejó la fila en `skipped` (RN-25, sin llave).
    // Reponer clave_adjunto no basta: `skipped` es terminal. Hay que devolverla
    // a `idle` para que recordUpdated re-evalúe con la llave ya poblada.
    getRecord.mockResolvedValue(adjuntoDe([ID], { estado_extraccion: 'skipped' }))

    await patch({ adjuntoId: ADJUNTO, categoria: 'ofertas_comparables' })

    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos.clave_adjunto).toBe('foto_ofertas_comparables')
    expect(campos.estado_extraccion).toBe('idle')
  })

  it('no toca estado_extraccion si la foto de comparables no venía en skipped', async () => {
    // La fila ya se creó con la llave (recordCreated la vio) y quedó en `listo`.
    // No la pisamos: reactivar una extracción ya resuelta sería un falso reintento.
    getRecord.mockResolvedValue(adjuntoDe([ID], { estado_extraccion: 'listo' }))

    await patch({ adjuntoId: ADJUNTO, categoria: 'ofertas_comparables' })

    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos).not.toHaveProperty('estado_extraccion')
  })

  it('no repone estado_extraccion para una categoría que no dispara RF-09', async () => {
    // `skipped` en una foto de registro normal es su desenlace correcto: no hay
    // nada que extraer. Sin clave_adjunto no se rescata.
    getRecord.mockResolvedValue(adjuntoDe([ID], { estado_extraccion: 'skipped' }))

    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos).not.toHaveProperty('estado_extraccion')
  })
})

describe('subido_por · la bisagra del GET', () => {
  it('se reescribe siempre con la capitalización exacta', async () => {
    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    const [, , campos] = updateRecord.mock.calls[0]
    // `Tasador`, no `tasador`: el singleSelect tiene las dos opciones y con
    // typecast la minúscula se escribe sin error, dejando la foto fuera del GET.
    expect(campos.subido_por).toBe('Tasador')
  })

  it('el GET filtra por ese mismo literal', async () => {
    await get()

    const [, params] = listRecords.mock.calls[0]
    expect(params.filterByFormula).toContain('{subido_por}="Tasador"')
  })
})

describe('categoría libre y campos opcionales', () => {
  it('acepta una categoría personalizada que no está en el catálogo', async () => {
    const res = await patch({ adjuntoId: ADJUNTO, categoria: 'Quincho techado' })

    expect(res.status).toBe(200)
    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos.descripcion).toBe('Quincho techado')
    // El dominio de `tipo_adjunto` es cerrado: la categoría libre nunca va ahí.
    expect(campos.tipo_adjunto).toBe('foto_interior')
  })

  it('rechaza una categoría vacía', async () => {
    const res = await patch({ adjuntoId: ADJUNTO, categoria: '   ' })

    expect(res.status).toBe(400)
    expect(updateRecord).not.toHaveBeenCalled()
  })

  it('omite las claves opcionales ausentes en vez de mandarlas vacías', async () => {
    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos).not.toHaveProperty('orden')
    expect(campos).not.toHaveProperty('thumbnail_url')
  })

  it('escribe `orden` cuando viene', async () => {
    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina', orden: 3 })

    const [, , campos] = updateRecord.mock.calls[0]
    expect(campos.orden).toBe(3)
  })
})

describe('auditoría', () => {
  it('registra el cambio con la categoría anterior y la nueva', async () => {
    getRecord.mockResolvedValue(adjuntoDe([ID], { descripcion: 'banos' }))

    await patch({ adjuntoId: ADJUNTO, categoria: 'cocina' })

    expect(auditar).toHaveBeenCalledTimes(1)
    const [[cambio]] = auditar.mock.calls[0]
    expect(cambio.registroId).toBe(ID)
    expect(cambio.valorAnterior).toBe('banos')
    expect(cambio.valorNuevo).toContain('cocina')
  })
})

describe('GET · lo que la pantalla necesita para borrar', () => {
  it('expone el hash de cada foto', async () => {
    listRecords.mockResolvedValue([
      {
        id: ADJUNTO,
        createdTime: '',
        fields: {
          nombre_archivo: 'IMG_1.jpg',
          descripcion: 'cocina',
          hash_md5: 'abc123',
        },
      },
    ])

    const res = await get()
    const cuerpo = (await res.json()) as {
      data: { fotos: { hashMd5: string | null; categoria: string }[] }
    }

    // Sin el hash, `DELETE /api/adjuntos/[id]` responde 400: la pantalla podría
    // listar fotos pero no borrarlas (§8.6.3).
    expect(cuerpo.data.fotos[0].hashMd5).toBe('abc123')
    expect(cuerpo.data.fotos[0].categoria).toBe('cocina')
  })
})
