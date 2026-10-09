import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { desdeSantiago, minutosHabilesEntre } from './sla-habil'
import {
  duracionHabil,
  ETAPA_DESTACABLE_POR_ESTADO,
  ETAPAS_CON_CIERRE_ESCRITO,
  minutosHabilesAlVence,
  plazoEtapaDestacado,
} from './sla-plazo-etapa'
import type { EstadoSolicitud, SlaEtapaSolicitud, Solicitud } from './console-data'

/**
 * A-02 · plazo de etapa en horas hábiles en la bandeja y el detalle.
 *
 * Los instantes salen de `desdeSantiago` y los minutos de `minutosHabilesEntre`
 * real: nada de aritmética de reloj de pared en el fixture. Los vencimientos
 * ("a 4 h hábiles", "a 2h 15m") son datos de prueba, no umbrales: la lib no
 * contiene ningún número de SLA.
 */

const SIN_FERIADOS: ReadonlySet<string> = new Set()

type Entrada = Pick<Solicitud, 'estado' | 'slaEtapa' | 'slaDias' | 'slaTotal'>

function solicitud(
  estado: EstadoSolicitud,
  etapa: Partial<SlaEtapaSolicitud> | null,
  agregado: { slaDias?: number; slaTotal?: number } = {}
): Entrada {
  return {
    estado,
    slaDias: agregado.slaDias ?? 3,
    slaTotal: agregado.slaTotal ?? 5,
    slaEtapa:
      etapa === null
        ? undefined
        : {
            numero: 1,
            nombre: 'Ingreso de solicitud',
            tono: 'verde',
            etiqueta: 'Vence en 2d 18h',
            alertaTs: null,
            venceTs: '2026-08-10T15:00:00.000Z',
            minutosHabilesAlVence: 180,
            ...etapa,
          },
  }
}

describe('minutosHabilesAlVence', () => {
  it('cuenta sólo la ventana hábil entre viernes 17:00 y lunes 11:00', () => {
    const ahora = desdeSantiago(2026, 8, 7, 17, 0) // viernes
    const vence = desdeSantiago(2026, 8, 10, 11, 0) // lunes
    expect(minutosHabilesAlVence(vence, ahora, SIN_FERIADOS)).toBe(180)
  })

  it('no cuenta un feriado intermedio', () => {
    const ahora = desdeSantiago(2026, 8, 7, 17, 0)
    const vence = desdeSantiago(2026, 8, 10, 11, 0)
    const conLunesFeriado = new Set(['2026-08-10'])
    expect(minutosHabilesAlVence(vence, ahora, conLunesFeriado)).toBe(
      minutosHabilesEntre(ahora, vence, conLunesFeriado)
    )
    expect(minutosHabilesAlVence(vence, ahora, conLunesFeriado)).toBe(60)
  })

  it('devuelve negativo cuando el vencimiento ya pasó', () => {
    const vence = desdeSantiago(2026, 8, 11, 10, 0)
    const ahora = desdeSantiago(2026, 8, 11, 12, 5)
    expect(minutosHabilesAlVence(vence, ahora, SIN_FERIADOS)).toBe(-125)
  })

  it('devuelve 0 (no -0) si venció y desde entonces no corrió tiempo hábil', () => {
    const vence = desdeSantiago(2026, 8, 7, 18, 0) // viernes al cierre
    const ahora = desdeSantiago(2026, 8, 7, 20, 0) // fuera de horario
    const m = minutosHabilesAlVence(vence, ahora, SIN_FERIADOS)
    expect(Object.is(m, 0)).toBe(true)
  })

  it('devuelve null sin vencimiento o sin feriados', () => {
    const ahora = desdeSantiago(2026, 8, 7, 17, 0)
    expect(minutosHabilesAlVence(null, ahora, SIN_FERIADOS)).toBeNull()
    expect(minutosHabilesAlVence(desdeSantiago(2026, 8, 10, 11, 0), ahora, undefined)).toBeNull()
  })
})

describe('duracionHabil', () => {
  it('escribe horas y minutos, nunca días', () => {
    expect(duracionHabil(0)).toBe('0m')
    expect(duracionHabil(45)).toBe('45m')
    expect(duracionHabil(240)).toBe('4h')
    expect(duracionHabil(200)).toBe('3h 20m')
    expect(duracionHabil(2465)).toBe('41h 5m')
  })

  it('un negativo se escribe 0m', () => {
    expect(duracionHabil(-30)).toBe('0m')
  })
})

describe('ETAPA_DESTACABLE_POR_ESTADO', () => {
  it('sólo empareja creada↔e1 y asignada↔e2 (§5.2.4 «De → A»)', () => {
    expect(ETAPA_DESTACABLE_POR_ESTADO).toEqual({ creada: 1, asignada: 2 })
  })
})

describe('ETAPAS_CON_CIERRE_ESCRITO', () => {
  it('contiene e1 (asignar/route.ts) y e2 (coordinacion/route.ts), no e3 (CI-037)', () => {
    expect(ETAPAS_CON_CIERRE_ESCRITO.has(1)).toBe(true)
    expect(ETAPAS_CON_CIERRE_ESCRITO.has(2)).toBe(true)
    expect(ETAPAS_CON_CIERRE_ESCRITO.has(3)).toBe(false)
  })
})

describe('plazoEtapaDestacado', () => {
  it('creada/e1/verde, viernes 17:00 → lunes 11:00: «Quedan 3h hábiles», no «2d 18h»', () => {
    const m = minutosHabilesAlVence(
      desdeSantiago(2026, 8, 10, 11, 0),
      desdeSantiago(2026, 8, 7, 17, 0),
      SIN_FERIADOS
    )
    expect(m).toBe(180)
    const plazo = plazoEtapaDestacado(solicitud('creada', { minutosHabilesAlVence: m }))
    expect(plazo?.etapa.etiqueta).toBe('Quedan 3h hábiles')
    expect(plazo?.etapa.etiqueta).not.toContain('2d 18h')
  })

  it('asignada/e2/verde con vencimiento a 4 h hábiles: «Quedan 4h hábiles»', () => {
    const ahora = desdeSantiago(2026, 8, 11, 10, 0)
    const m = minutosHabilesAlVence(desdeSantiago(2026, 8, 11, 14, 0), ahora, SIN_FERIADOS)
    const plazo = plazoEtapaDestacado(
      solicitud('asignada', { numero: 2, nombre: 'Coordinación de visita (llamado)', minutosHabilesAlVence: m })
    )
    expect(plazo?.etapa.etiqueta).toBe('Quedan 4h hábiles')
  })

  it('asignada/e2/ámbar con 2h 15m: «Quedan 2h 15m hábiles», color sin recalcular', () => {
    const ahora = desdeSantiago(2026, 8, 11, 10, 0)
    const m = minutosHabilesAlVence(desdeSantiago(2026, 8, 11, 12, 15), ahora, SIN_FERIADOS)
    const plazo = plazoEtapaDestacado(
      solicitud('asignada', { numero: 2, tono: 'ambar', minutosHabilesAlVence: m })
    )
    expect(plazo?.etapa.etiqueta).toBe('Quedan 2h 15m hábiles')
    expect(plazo?.etapa.tono).toBe('ambar')
  })

  it('con el lunes feriado el texto refleja el feriado', () => {
    const conLunesFeriado = new Set(['2026-08-10'])
    const m = minutosHabilesAlVence(
      desdeSantiago(2026, 8, 10, 11, 0),
      desdeSantiago(2026, 8, 7, 17, 0),
      conLunesFeriado
    )
    const plazo = plazoEtapaDestacado(solicitud('creada', { minutosHabilesAlVence: m }))
    expect(plazo?.etapa.etiqueta).toBe('Quedan 1h hábiles')
  })

  describe('devuelve null (la UI de antes) cuando', () => {
    it('no hay slaEtapa', () => {
      expect(plazoEtapaDestacado(solicitud('creada', null))).toBeNull()
    })
    it('el tono es sin_dato', () => {
      expect(plazoEtapaDestacado(solicitud('creada', { tono: 'sin_dato' }))).toBeNull()
    })
    it('venceTs está vacío', () => {
      expect(plazoEtapaDestacado(solicitud('creada', { venceTs: null }))).toBeNull()
    })
    it('minutosHabilesAlVence no viene (sin feriados)', () => {
      expect(plazoEtapaDestacado(solicitud('creada', { minutosHabilesAlVence: undefined }))).toBeNull()
      expect(plazoEtapaDestacado(solicitud('creada', { minutosHabilesAlVence: null }))).toBeNull()
    })
    it('la etapa no corresponde al estado (CI-037)', () => {
      expect(plazoEtapaDestacado(solicitud('asignada', { numero: 3 }))).toBeNull()
      expect(plazoEtapaDestacado(solicitud('visitada', { numero: 2 }))).toBeNull()
      expect(plazoEtapaDestacado(solicitud('asignada', { numero: 1 }))).toBeNull()
    })
    it('una asignada ya coordinada (etapa 4 tras cerrar e2 y e3) no se destaca', () => {
      expect(plazoEtapaDestacado(solicitud('asignada', { numero: 4 }))).toBeNull()
      expect(
        plazoEtapaDestacado(solicitud('asignada', { numero: 4, tono: 'rojo', minutosHabilesAlVence: -60 }))
      ).toBeNull()
    })
    it('un verde o ámbar llega con minutos ≤ 0', () => {
      expect(plazoEtapaDestacado(solicitud('creada', { minutosHabilesAlVence: 0 }))).toBeNull()
      expect(plazoEtapaDestacado(solicitud('creada', { minutosHabilesAlVence: -10 }))).toBeNull()
      expect(
        plazoEtapaDestacado(solicitud('creada', { tono: 'ambar', minutosHabilesAlVence: -10 }))
      ).toBeNull()
    })
  })

  describe('vencida (rojo)', () => {
    it('−125 → «Vencida hace 2h 5m hábiles»', () => {
      const plazo = plazoEtapaDestacado(solicitud('creada', { tono: 'rojo', minutosHabilesAlVence: -125 }))
      expect(plazo?.etapa.etiqueta).toBe('Vencida hace 2h 5m hábiles')
    })
    it('−2460 → «Vencida hace 41h hábiles», sin días', () => {
      const plazo = plazoEtapaDestacado(solicitud('creada', { tono: 'rojo', minutosHabilesAlVence: -2460 }))
      expect(plazo?.etapa.etiqueta).toBe('Vencida hace 41h hábiles')
    })
    it('0 → «Vencida»', () => {
      const plazo = plazoEtapaDestacado(solicitud('creada', { tono: 'rojo', minutosHabilesAlVence: 0 }))
      expect(plazo?.etapa.etiqueta).toBe('Vencida')
    })
    it('vencida fuera de horario sin tiempo hábil corrido → «Vencida»', () => {
      const m = minutosHabilesAlVence(
        desdeSantiago(2026, 8, 7, 18, 0),
        desdeSantiago(2026, 8, 7, 20, 0),
        SIN_FERIADOS
      )
      const plazo = plazoEtapaDestacado(solicitud('creada', { tono: 'rojo', minutosHabilesAlVence: m }))
      expect(plazo?.etapa.etiqueta).toBe('Vencida')
    })

    it('regresión · e2 roja = llamado vencido no registrado; se destaca (escritor en coordinacion/route.ts)', () => {
      // e2 la cierra `marcarFinEtapa(id, 2…)` en
      // app/api/tasaciones/[id]/coordinacion/route.ts cuando el tasador registra
      // el llamado (Frente C · RF-TAS-05). Una asignada que sigue en e2 roja es
      // un llamado vencido real: el caso más accionable de C-02.
      const plazo = plazoEtapaDestacado(
        solicitud('asignada', { numero: 2, tono: 'rojo', minutosHabilesAlVence: -2460 })
      )
      expect(plazo?.etapa.etiqueta).toBe('Vencida hace 41h hábiles')
      expect(plazo?.etapa.tono).toBe('rojo')
    })
    it('asignada/e2/rojo con 0 minutos → «Vencida»', () => {
      const plazo = plazoEtapaDestacado(
        solicitud('asignada', { numero: 2, tono: 'rojo', minutosHabilesAlVence: 0 })
      )
      expect(plazo?.etapa.etiqueta).toBe('Vencida')
    })
  })

  it('conserva el agregado en días y copia numero/nombre/tono sin cambios', () => {
    const plazo = plazoEtapaDestacado(
      solicitud(
        'asignada',
        { numero: 2, nombre: 'Coordinación de visita (llamado)', tono: 'ambar', minutosHabilesAlVence: 90 },
        { slaDias: 2, slaTotal: 5 }
      )
    )
    expect(plazo?.agregado).toEqual({ dias: 2, total: 5 })
    expect(plazo?.etapa.numero).toBe(2)
    expect(plazo?.etapa.nombre).toBe('Coordinación de visita (llamado)')
    expect(plazo?.etapa.tono).toBe('ambar')
  })

  it('RO-06 · regresión C-02: no dice «quedan dos días» con reloj de pared cuando quedan 3 horas hábiles', () => {
    // El bug: la fila destacaba el agregado «2 días» (relleno de
    // `computeSlaDias`) y la píldora medía con reloj de pared («Vence en
    // 2d 18h»), cuando la etapa vencía el lunes a las 11:00 y, contado en la
    // ventana hábil de §5.2.1, quedaban tres horas.
    const m = minutosHabilesAlVence(
      desdeSantiago(2026, 8, 10, 11, 0),
      desdeSantiago(2026, 8, 7, 17, 0),
      SIN_FERIADOS
    )
    const plazo = plazoEtapaDestacado(
      solicitud('creada', { minutosHabilesAlVence: m }, { slaDias: 2, slaTotal: 5 })
    )
    expect(plazo).not.toBeNull()
    expect(plazo?.etapa.etiqueta).toBe('Quedan 3h hábiles')
    expect(plazo?.etapa.etiqueta).not.toMatch(/\d+d\b|días/)
    // El agregado sigue existiendo, pero pasa al lugar secundario.
    expect(plazo?.agregado.dias).toBe(2)
  })
})

describe('RO-05 · ningún número de SLA hardcodeado en lib/sla-plazo-etapa.ts (A-02)', () => {
  it('el código (sin comentarios) sólo contiene 0, 60 (min/h) y los números de etapa 1 y 2', () => {
    // Invariante estructural (RO-06): los umbrales viven en C_SLA_Etapas y
    // llegan materializados en sla_etapa_vence_ts. Si alguien agrega un 4, 6,
    // 240 o 360 al módulo, este test lo detecta. Lee el archivo local; sin red.
    const fuente = readFileSync(fileURLToPath(new URL('./sla-plazo-etapa.ts', import.meta.url)), 'utf8')
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    const numeros = new Set(codigo.match(/\b\d+(?:\.\d+)?\b/g) ?? [])
    expect([...numeros].sort()).toEqual(['0', '1', '2', '60'])
  })
})
