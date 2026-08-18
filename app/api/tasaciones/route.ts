/**
 * `GET /api/tasaciones` — cola personal del tasador.
 *
 * RF-09 · RF-TAS-01 · RF-TAS-02. Tanda P2-TAS · plan §3.1.
 *
 * ## Autorización sin guard por id
 *
 * Ésta es la única ruta sin `[id]`, así que no puede usar `autorizarSolicitud()`.
 * El equivalente es **el propio filtro**: `filterByFormula` exige que el
 * `tasador` de la solicitud sea el usuario. Una solicitud ajena no llega a
 * materializarse en la respuesta, que es una garantía más fuerte que filtrarla
 * después.
 *
 * ## SLA (CI-021)
 *
 * El semáforo lo produce `lib/sla-etapas.ts` sobre la ventana hábil. **IF-03 no
 * hace aritmética de plazos**: no hay ningún literal de horas en este archivo.
 * Si el motor no puede resolver una solicitud, la card recibe `sla: null` y la
 * UI la pinta neutra — nunca un número inventado.
 */

import { listRecords } from '@/lib/airtable-client'
import { etapaVigente } from '@/lib/sla-etapas'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { getUsuarioTasador, mockTasadorConfigurado } from '@/lib/tasador/mock-user'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { desdeExcepcion, error, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

/**
 * Estados que el tasador ve en su cola.
 *
 * `pdf_listo` en adelante ya salió de sus manos; `creada` todavía no llegó.
 * `devuelta` no se incluye: está deprecado (§0.4 nota 6) y ninguna pantalla de
 * IF-03 lo renderiza.
 */
const ESTADOS_EN_COLA = ['asignada', 'visitada', 'calculada'] as const

interface SolicitudCola {
  tasador?: string[]
  estado?: string
  codigo_solicitud?: string
  direccion?: string
  rol_sii?: string
  comuna?: string[]
  producto?: string[]
  cliente?: string[]
  fecha_visita_programada?: string
  fecha_visita?: string
  fecha_asignacion_ts?: string
  tipo_propiedad_nuevo_usado?: string
  monto_estimado_uf?: number
  [campo: string]: unknown
}

export async function GET() {
  const usuario = getUsuarioTasador()

  if (!mockTasadorConfigurado()) {
    console.error(
      '[GET /api/tasaciones] TASADOR_MOCK_RECORD_ID no está definida. ' +
        'Definirla en .env.local con un registro real de M_Tasadores.'
    )
    return error(MENSAJES.errorGenerico, 500)
  }

  try {
    // El Link `tasador` se evalúa dentro de una fórmula contra el primary field
    // de M_Tasadores, no contra el recordId (misma lección que E-018). Por eso
    // se filtra por estado en Airtable y la pertenencia se comprueba acá sobre
    // el array de recordIds, que es exacto.
    const filtroEstados = ESTADOS_EN_COLA.map((e) => `{estado}="${e}"`).join(',')

    const registros = await listRecords<SolicitudCola>(TABLE_IDS.solicitudes, {
      filterByFormula: `OR(${filtroEstados})`,
      'sort[0][field]': 'fecha_asignacion_ts',
      'sort[0][direction]': 'desc',
    })

    const mias = registros.filter(
      (r) => Array.isArray(r.fields.tasador) && r.fields.tasador.includes(usuario.recordId)
    )

    const data = mias.map((r) => ({
      id: r.id,
      codigo: r.fields.codigo_solicitud ?? '',
      estado: r.fields.estado ?? null,
      direccion: r.fields.direccion ?? null,
      rolSii: r.fields.rol_sii ?? null,
      tipoPropiedad: r.fields.tipo_propiedad_nuevo_usado ?? null,
      fechaVisitaPlanificada: r.fields.fecha_visita_programada ?? null,
      fechaVisitaReal: r.fields.fecha_visita ?? null,
      fechaAsignacion: r.fields.fecha_asignacion_ts ?? null,
      valorEstimadoUf: r.fields.monto_estimado_uf ?? null,
      /**
       * Etapa vigente según el motor. `null` = el motor no pudo resolverla, y
       * la UI muestra el badge neutro. La conversión etapa → semáforo y horas
       * restantes la cierra P10-TAS, que es donde CI-021 se verifica de punta
       * a punta contra la ventana hábil.
       */
      slaEtapa: etapaVigente(r.fields),
    }))

    return ok(data)
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones', err)
  }
}
