import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { AirtableError, getRecord, isValidRecordId } from '@/lib/airtable-client'
import { obtenerFeriados } from '@/lib/feriados'
import {
  campoFin,
  campoInicio,
  ETAPAS,
  obtenerMatrizEtapas,
  obtenerSlaDelPar,
  umbralesDeEtapa,
  type NumeroEtapa,
} from '@/lib/sla-etapas'
import { minutosHabilesEntre } from '@/lib/sla-habil'
import { TX_SOLICITUDES } from '@/lib/solicitudes'

export const dynamic = 'force-dynamic'

const MSG_RED = 'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/**
 * El `[id]` de la ruta se valida con zod, como pide C-4, pero el **formato** lo
 * sigue definiendo `isValidRecordId` (`lib/airtable-client.ts`): el `refine`
 * delega en él en vez de repetir el regex. Dos definiciones del formato de un
 * record ID divergirían la primera vez que Airtable cambie el largo del sufijo,
 * y la que quedara vieja rechazaría IDs válidos con un 404 indistinguible de
 * "no existe".
 */
const paramsSchema = z.object({
  id: z
    .string()
    .refine(isValidRecordId, 'El identificador de solicitud no tiene el formato esperado.'),
})

/** Estado de una etapa en la cronología. `pendiente` = todavía no empezó. */
type EstadoEtapa = 'completada' | 'en_curso' | 'pendiente'

interface EtapaCronologia {
  numero: NumeroEtapa
  etapaKey: string
  nombre: string
  responsable: string | null
  slaIdealHoras: number
  slaMaxHoras: number
  inicioTs: string | null
  finTs: string | null
  /** Minutos hábiles consumidos (§5.2.1). `null` en las que no empezaron. */
  minutosHabiles: number | null
  /** Instante de pared en que alcanza el SLA ideal. `null` sin inicio. */
  alertaTs: string | null
  /** Instante de pared en que supera el SLA máximo. `null` sin inicio. */
  venceTs: string | null
  estado: EstadoEtapa
}

function leerFecha(fields: Record<string, unknown>, campo: string): Date | null {
  const valor = fields[campo]
  if (typeof valor !== 'string' || valor.trim() === '') return null
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

/**
 * GET /api/solicitudes/[id]/sla — Cronología de las siete etapas (RF-53).
 *
 * ## Contrato
 *
 * Devuelve **siempre las siete entradas**, en orden, aunque la solicitud no
 * tenga ni un timestamp: las no instrumentadas salen con `estado: 'pendiente'`
 * y sus campos de tiempo en `null`. Es deliberado y es lo que la Tanda E
 * necesita para pintar el riel completo sin inventar filas: de las siete etapas
 * de §5.2.4, IF-02 sólo es dueña de los límites de e1 y e2 (§9.6.1 · *Quién
 * escribe cada etapa*), así que en v1.9 lo normal es ver dos con datos y cinco
 * pendientes. Devolver sólo las pobladas haría que "no empezó" y "no existe"
 * se vieran igual.
 *
 * ## Sólo lectura
 *
 * Cero escrituras a Airtable. No llama a `recalcularSla()` ni siquiera en modo
 * `persistir: false`: los umbrales que muestra los deriva de los timestamps ya
 * guardados, de modo que abrir la pestaña Historial no puede alterar el estado
 * de una solicitud. Un GET que recalcula es un GET que muta el día que alguien
 * le quite el flag.
 *
 * ## Horas hábiles
 *
 * `minutosHabiles` se mide con `minutosHabilesEntre` (§5.2.1: L-V 9:00–18:00,
 * feriados de `C_Feriados` fuera), no con una resta de reloj. Para la etapa en
 * curso se mide contra ahora; para las cerradas, contra su `fin`. Los umbrales
 * salen de `C_SLA_Etapas` y del override de e7 (`sla_revision_horas` · §9.6-R3):
 * este handler no conoce ningún número de §5.2.4.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsed = paramsSchema.safeParse(await params)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
  }
  const { id } = parsed.data

  // La autorización va antes de tocar Airtable: sin sesión no se gasta una
  // lectura ni se revela si el record existe.
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    // Formato JSON (sin `cellFormat: 'string'`) a propósito: los `dateTime`
    // llegan en ISO y los links como array de record IDs, que es justo lo que
    // `obtenerSlaDelPar` espera para resolver el par de `C_SLA` (§9.6-R4).
    const record = await getRecord<Record<string, unknown>>(TX_SOLICITUDES, id)
    if (!record) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }

    const [matriz, sla, feriados] = await Promise.all([
      obtenerMatrizEtapas(),
      obtenerSlaDelPar(record.fields),
      obtenerFeriados(),
    ])

    const ahora = new Date()
    const etapas: EtapaCronologia[] = ETAPAS.map((numero) => {
      const { idealHoras, maxHoras, definicion } = umbralesDeEtapa(numero, matriz, sla)
      const inicio = leerFecha(record.fields, campoInicio(numero))
      const fin = leerFecha(record.fields, campoFin(numero))

      // Tres estados, y el orden de las condiciones importa: una etapa con fin
      // está completada aunque le falte el inicio (pasa en el backfill de A-5),
      // y una sin inicio nunca está "en curso" por mucho que las anteriores lo
      // estén — no se infiere progreso que la base no respalde.
      const estado: EstadoEtapa = fin ? 'completada' : inicio ? 'en_curso' : 'pendiente'

      const hasta = fin ?? ahora
      const minutosHabiles = inicio ? minutosHabilesEntre(inicio, hasta, feriados) : null

      return {
        numero,
        etapaKey: definicion.etapaKey,
        nombre: definicion.nombre,
        responsable: definicion.responsable,
        slaIdealHoras: idealHoras,
        slaMaxHoras: maxHoras,
        inicioTs: inicio ? inicio.toISOString() : null,
        finTs: fin ? fin.toISOString() : null,
        minutosHabiles,
        // Los dos umbrales materializados de la etapa **vigente** viven en la
        // fila (`sla_etapa_alerta_ts` / `sla_etapa_vence_ts`) y son los que la
        // fórmula compara contra NOW(). Se devuelven sólo para la etapa en
        // curso: copiarlos a las demás sugeriría que aplican a todas.
        alertaTs:
          estado === 'en_curso' ? (leerFecha(record.fields, 'sla_etapa_alerta_ts')?.toISOString() ?? null) : null,
        venceTs:
          estado === 'en_curso' ? (leerFecha(record.fields, 'sla_etapa_vence_ts')?.toISOString() ?? null) : null,
        estado,
      }
    })

    const etapaActual = etapas.find((e) => e.estado === 'en_curso')?.numero ?? null

    return NextResponse.json({
      data: {
        solicitudId: id,
        etapaActual,
        /** Clave de la fila de `C_SLA` que resolvió el par. Auditoría. */
        slaClave: sla.clave,
        etapas,
      },
    })
  } catch (err) {
    if (err instanceof AirtableError && err.status === 404) {
      return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    }
    console.error('[GET /api/solicitudes/[id]/sla]', err)
    return NextResponse.json({ error: MSG_RED }, { status: 502 })
  }
}
