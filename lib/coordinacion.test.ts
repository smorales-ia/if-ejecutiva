import { describe, expect, it } from 'vitest'

import {
  resumirCoordinacion,
  type CoordinacionSolicitud,
  type IntentoCoordinacion,
} from './coordinacion'

/**
 * C3 · bloque 1 — contrato de `resumirCoordinacion()`.
 *
 * El módulo es puro, así que no hay mocks: lo que se prueba es que el bloque de
 * la pestaña Datos no pueda inventar un desenlace (RO-34), no pueda atar el
 * catálogo de `motivo` al build (A-17) y no pueda correr un día la fecha de la
 * visita.
 */

/** Instante fijo para que la elisión del año no dependa de cuándo corra el test. */
const AHORA = new Date('2026-08-21T20:00:00.000Z')

const SOLICITUD = 'rec9qf3DchOY5Lk2N'

function intento(extra: Partial<IntentoCoordinacion> = {}): IntentoCoordinacion {
  return {
    id: 'recE7iW1JvR6ynIig',
    solicitudId: SOLICITUD,
    estado: 'confirmada',
    intentoNumero: 1,
    fechaRespuesta: '2026-08-21T17:00:00.000Z',
    ...extra,
  }
}

function datos(
  coordinacionVigente: CoordinacionSolicitud['coordinacionVigente'],
  intentos: IntentoCoordinacion[]
): CoordinacionSolicitud {
  return { coordinacionVigente, intentos }
}

describe('rama confirmada', () => {
  // La seed `recE7iW1JvR6ynIig`: expone la fecha de visita y no filtra motivo.
  it('expone fechaVisita y nota, y deja motivo/detalle en "—"', () => {
    const r = resumirCoordinacion(
      datos('confirmada', [
        intento({ fechaVisita: '2026-08-25', nota: 'Propietario disponible en la mañana.' }),
      ]),
      AHORA
    )

    expect(r.variante).toBe('confirmada')
    expect(r.etiqueta).toBe('Confirmada')
    expect(r.fechaVisita).toBe('25 ago 2026')
    expect(r.nota).toBe('Propietario disponible en la mañana.')
    expect(r.motivo).toBe('—')
    expect(r.detalle).toBe('—')
    expect(r.intentoNumero).toBe(1)
  })
})

describe('rama rechazada', () => {
  // La rama rechazada no tiene fecha de visita: no se hereda la del intento previo.
  it('expone motivo y detalle, y deja fechaVisita en "—"', () => {
    const r = resumirCoordinacion(
      datos('rechazada', [
        intento({
          estado: 'rechazada',
          intentoNumero: 2,
          motivo: 'No contesta',
          detalle: 'Se llamó tres veces sin respuesta durante la mañana.',
        }),
      ]),
      AHORA
    )

    expect(r.variante).toBe('rechazada')
    expect(r.etiqueta).toBe('Rechazada')
    expect(r.motivo).toBe('No contesta')
    expect(r.detalle).toBe('Se llamó tres veces sin respuesta durante la mañana.')
    expect(r.fechaVisita).toBe('—')
    expect(r.nota).toBe('—')
  })
})

describe('ausencia (RO-34)', () => {
  // Cero intentos no es un desenlace neutro: es "todavía no se coordinó".
  it('sin intentos cae a sin_coordinar con totalIntentos 0 y ultimo null', () => {
    const r = resumirCoordinacion(datos(null, []), AHORA)

    expect(r.variante).toBe('sin_coordinar')
    expect(r.etiqueta).toBe('Sin coordinar')
    expect(r.totalIntentos).toBe(0)
    expect(r.ultimo).toBeNull()
    expect(r.intentoNumero).toBeNull()
    expect(r.fechaRespuesta).toBe('—')
  })

  // El componente llama a la función antes de que el hook resuelva; no puede reventar.
  it('null de entrada devuelve el mismo sin_coordinar sin lanzar', () => {
    const r = resumirCoordinacion(null, AHORA)

    expect(r.variante).toBe('sin_coordinar')
    expect(r.totalIntentos).toBe(0)
    expect(r.ultimo).toBeNull()
  })

  // Una confirmada sin fecha muestra "—", no hoy ni la fecha de respuesta.
  it('confirmada sin fecha_visita_propuesta no inventa una fecha', () => {
    const r = resumirCoordinacion(datos('confirmada', [intento({ fechaVisita: undefined })]), AHORA)

    expect(r.variante).toBe('confirmada')
    expect(r.fechaVisita).toBe('—')
  })
})

describe('estado fuera de dominio', () => {
  // El reader lo entrega con `estado: null`; heredar el desenlace previo sería
  // inventar que la visita sigue en pie.
  it('no hereda el confirmada del intento anterior', () => {
    const r = resumirCoordinacion(
      datos(null, [
        intento({ id: 'recRAROOOOOOOOOO', estado: null, intentoNumero: 2 }),
        intento({ fechaVisita: '2026-08-25' }),
      ]),
      AHORA
    )

    expect(r.variante).toBe('sin_coordinar')
    expect(r.fechaVisita).toBe('—')
    // El intento sigue en la lista: no se descarta, sólo no fija el desenlace.
    expect(r.totalIntentos).toBe(2)
    expect(r.ultimo?.id).toBe('recRAROOOOOOOOOO')
  })
})

describe('A-17', () => {
  // Un motivo agregado desde la UI de Airtable tiene que llegar sin deploy.
  it('pasa un motivo desconocido tal cual, sin mapearlo ni caer a "—"', () => {
    const inventado = 'Motivo agregado hoy en Airtable que el repo no conoce'
    const r = resumirCoordinacion(
      datos('rechazada', [
        intento({ estado: 'rechazada', motivo: inventado, detalle: 'Detalle suficientemente largo.' }),
      ]),
      AHORA
    )

    expect(r.motivo).toBe(inventado)
  })
})

describe('fechas', () => {
  // `new Date("2026-08-25")` es medianoche UTC = 24 a las 20:00 en Santiago.
  it('la fecha de visita no se corre un día por el huso', () => {
    const r = resumirCoordinacion(
      datos('confirmada', [intento({ fechaVisita: '2026-08-25' })]),
      AHORA
    )

    expect(r.fechaVisita).toBe('25 ago 2026')
    expect(r.fechaVisita).not.toContain('24')
  })

  // `fecha_respuesta` sí es un instante: se muestra en el reloj de Santiago.
  it('la fecha de respuesta se formatea en America/Santiago y elide el año en curso', () => {
    const r = resumirCoordinacion(
      datos('confirmada', [intento({ fechaRespuesta: '2026-08-21T17:00:00.000Z' })]),
      AHORA
    )

    // 17:00Z = 13:00 en Santiago (GMT−4), mismo año que `AHORA` → sin año.
    expect(r.fechaRespuesta).toContain('13:00')
    expect(r.fechaRespuesta).toContain('21 ago')
    expect(r.fechaRespuesta).not.toContain('2026')
  })
})

describe('conteo', () => {
  // `intentoNumero` es el ordinal que escribió IF-03, no el largo del array.
  it('totalIntentos cuenta las filas y intentoNumero es el del más reciente', () => {
    const r = resumirCoordinacion(
      datos('rechazada', [
        intento({ id: 'recSEGUNDOOOOOOO', estado: 'rechazada', intentoNumero: 7, motivo: 'No contesta' }),
        intento({ id: 'recPRIMEROOOOOOO' }),
      ]),
      AHORA
    )

    expect(r.totalIntentos).toBe(2)
    expect(r.intentoNumero).toBe(7)
  })
})
