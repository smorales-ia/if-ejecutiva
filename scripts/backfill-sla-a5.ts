/**
 * A-5 · Backfill de SLA sobre las solicitudes existentes (plan §9.6.2 · Tanda A).
 *
 * ## Qué escribe
 *
 * Por cada fila de `TX_Solicitudes`:
 *
 * - `sla_e1_inicio_ts = fecha_solicitud` — el hito de §5.2.2 para la cartera
 *   histórica. Se escribe **el valor crudo**, sin normalizar a la ventana
 *   hábil: así el dato queda auditable contra un campo que se ve en la UI. La
 *   normalización la hace el motor al calcular los umbrales, que es donde
 *   corresponde (`sumarHorasHabiles` llama a `proximoInstanteHabil`).
 * - `sla_e1_fin_ts = sla_e2_inicio_ts = <instante de asignación>` cuando la
 *   solicitud fue realmente asignada. Qué cuenta como "realmente asignada" lo
 *   fija `MODO_ASIGNACION` (ver abajo).
 * - `sla_etapa_actual`, `sla_etapa_alerta_ts`, `sla_etapa_vence_ts` y
 *   `sla_recalculado_ts` — derivados por `recalcularSla()` sobre la fila
 *   **proyectada**, en modo `persistir: false`. El motor no escribe: este
 *   script junta todo en un único PATCH por fila.
 *
 * Nunca escribe `sla_semaforo_etapa`: es fórmula, y se deriva sola de los dos
 * timestamps anteriores.
 *
 * ## Idempotencia
 *
 * Una fila que ya tiene `sla_e1_inicio_ts` se salta, salvo `--force`. Volver a
 * correr el backfill no corre el reloj hacia adelante.
 *
 * ## Uso
 *
 *   pnpm build:script:a5 && node --env-file=.env.local <out>/scripts/backfill-sla-a5.js
 *
 * Sin flags es **dry-run**: imprime el plan fila por fila y no toca Airtable.
 * Con `--apply` escribe. Con `--force` reescribe filas ya instrumentadas.
 */

import { listRecords, updateRecord } from '@/lib/airtable-client'
import { desdeSantiago } from '@/lib/sla-habil'
import {
  CAMPOS_SLA_LECTURA,
  recalcularSla,
  type NumeroEtapa,
} from '@/lib/sla-etapas'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

/**
 * Criterio para dar por cerrada la etapa 1 (decisión de Sergio · 10-ago-2026).
 *
 * Sólo cierra e1 una solicitud en `estado = 'asignada'`. La fuente del instante
 * es, en este orden:
 *
 * 1. `fecha_asignacion_ts` (dateTime · America/Santiago) — el campo canónico.
 * 2. `fecha_asignacion` (date · **DEPRECATED** §21.4-d) — fallback para las 9
 *    filas históricas anteriores a la creación del `_ts`. Al ser un `date` sin
 *    hora, se ancla a las **17:00 de Santiago**: cierre de la jornada hábil, que
 *    es la hipótesis conservadora (una asignación fechada ese día ocurrió en
 *    algún momento de la jornada, no a medianoche).
 *
 * `estado = 'creada'` con `fecha_asignacion_ts` poblado es un **timestamp
 * huérfano** (VP-2026-0043: sin tasador, sin visador, sin fecha de visita). No
 * cierra ninguna etapa y este backfill **no lo toca** — queda como CI-009.
 */
const APLICAR = process.argv.includes('--apply')
const FORZAR = process.argv.includes('--force')

/** Hora de Santiago a la que se ancla un `date` sin hora. */
const HORA_CIERRE_JORNADA = 17

interface FilaSolicitud {
  codigo_ext?: string
  estado?: string
  fecha_solicitud?: string
  fecha_asignacion?: string
  fecha_asignacion_ts?: string
  [campo: string]: unknown
}

/** De dónde salió el instante que cierra e1. Se reporta en el resumen. */
type CriterioCierre = 'ts' | 'fallback_date' | 'ninguno'

interface Cierre {
  instante: string | null
  criterio: CriterioCierre
}

/**
 * Ancla un `date` de Airtable (`YYYY-MM-DD`, sin hora) a las 17:00 de Santiago.
 */
function aInstanteFinJornada(valor: string): string {
  const [anio, mes, dia] = valor.split('-').map((n) => Number.parseInt(n, 10))
  return desdeSantiago(anio, mes, dia, HORA_CIERRE_JORNADA, 0).toISOString()
}

function cierreDeEtapa1(f: FilaSolicitud): Cierre {
  if (f.estado !== 'asignada') return { instante: null, criterio: 'ninguno' }
  if (f.fecha_asignacion_ts) {
    return { instante: f.fecha_asignacion_ts, criterio: 'ts' }
  }
  if (f.fecha_asignacion) {
    return { instante: aInstanteFinJornada(f.fecha_asignacion), criterio: 'fallback_date' }
  }
  return { instante: null, criterio: 'ninguno' }
}

async function main(): Promise<void> {
  const registros = await listRecords<FilaSolicitud>(TX_SOLICITUDES, {
    fields: [
      'codigo_ext',
      'estado',
      'fecha_solicitud',
      'fecha_asignacion',
      'fecha_asignacion_ts',
      ...CAMPOS_SLA_LECTURA,
    ],
  })

  console.log(
    `A-5 · ${registros.length} filas en TX_Solicitudes · ` +
      `${APLICAR ? 'APLICAR' : 'DRY-RUN'}${FORZAR ? ' · FORCE' : ''}\n`
  )

  let escritas = 0
  let saltadas = 0
  let sinFecha = 0
  const porEtapa = new Map<NumeroEtapa | 'ninguna', number>()
  const porCriterio = new Map<CriterioCierre, number>()

  for (const registro of registros) {
    const f = registro.fields
    const codigo = f.codigo_ext ?? registro.id

    if (!f.fecha_solicitud) {
      console.log(`  ⚠ ${codigo}  sin fecha_solicitud — no se toca`)
      sinFecha += 1
      continue
    }

    if (f.sla_e1_inicio_ts && !FORZAR) {
      console.log(`  ⏭ ${codigo}  ya instrumentada (e1_inicio=${f.sla_e1_inicio_ts})`)
      saltadas += 1
      continue
    }

    const e1Inicio = f.fecha_solicitud
    const { instante: asignacion, criterio } = cierreDeEtapa1(f)
    porCriterio.set(criterio, (porCriterio.get(criterio) ?? 0) + 1)

    const campos: Record<string, unknown> = { sla_e1_inicio_ts: e1Inicio }
    const proyectada: Record<string, unknown> = { ...f, sla_e1_inicio_ts: e1Inicio }

    if (asignacion) {
      campos.sla_e1_fin_ts = asignacion
      campos.sla_e2_inicio_ts = asignacion
      proyectada.sla_e1_fin_ts = asignacion
      proyectada.sla_e2_inicio_ts = asignacion
    }

    const recalculo = await recalcularSla(registro.id, {
      persistir: false,
      deps: { leerSolicitud: async () => proyectada },
    })
    Object.assign(campos, recalculo.campos)

    const etapa = recalculo.etapaActual ?? 'ninguna'
    porEtapa.set(etapa, (porEtapa.get(etapa) ?? 0) + 1)

    const detalle =
      `[${f.estado}] e1_inicio=${e1Inicio}` +
      (asignacion ? ` · e1_fin=e2_inicio=${asignacion} (${criterio})` : '') +
      ` · etapa=${etapa}` +
      ` · alerta=${recalculo.alertaTs ?? '—'}` +
      ` · vence=${recalculo.venceTs ?? '—'}`

    if (APLICAR) {
      await updateRecord(TX_SOLICITUDES, registro.id, campos)
      console.log(`  ✓ ${codigo}  ${detalle}`)
    } else {
      console.log(`  · ${codigo}  ${detalle}`)
    }
    escritas += 1
  }

  console.log(
    `\nResumen · ${APLICAR ? 'escritas' : 'a escribir'}: ${escritas} · ` +
      `saltadas: ${saltadas} · sin fecha_solicitud: ${sinFecha}`
  )
  console.log('\n  Cierre de e1 por criterio:')
  console.log(`    con fecha_asignacion_ts .......... ${porCriterio.get('ts') ?? 0}`)
  console.log(`    con fallback fecha_asignacion .... ${porCriterio.get('fallback_date') ?? 0}`)
  console.log(`    sin cierre (e1 abierta) .......... ${porCriterio.get('ninguno') ?? 0}`)

  console.log('\n  Etapa vigente resultante:')
  for (const [etapa, n] of [...porEtapa.entries()].sort()) {
    console.log(`    etapa ${etapa}: ${n}`)
  }
  if (!APLICAR) console.log('\nDry-run: no se tocó Airtable. Repetir con --apply.')
}

main().catch((error) => {
  console.error('A-5 falló:', error)
  process.exit(1)
})
