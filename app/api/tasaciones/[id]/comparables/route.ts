/**
 * `GET · POST · DELETE /api/tasaciones/[id]/comparables` — grilla de la sección D.
 *
 * RF-12. Tanda P2-TAS · plan §3.1.
 *
 * ## ⚠ El campo se llama `tipo_referencia`, no `fuente`
 *
 * El v0 llama `fuente` al discriminador Oferta/CBR. En `TX_Comparables` ese dato
 * vive en **`tipo_referencia`** (`fldB920e8jIKgbERM`, `Oferta · CBR`). El campo
 * `fuente` **también existe** (`fldNYh1KpD3oO0Gmz`) con un dominio ajeno —
 * `tasador · portal_toc · historico_sistema · cliente · Portal Inmobiliario ·
 * Yapo · Toctoc · Ofert. · CBR.` — que describe **de dónde salió el dato**, no
 * qué clase de referencia es.
 *
 * Escribir `'oferta'` en `fuente` no daría error: `typecast: true` crearía la
 * opción y ensuciaría el dominio en silencio. La traducción ocurre acá, en el
 * borde, una sola vez (RO-17).
 *
 * ## A-13 sigue abierta
 *
 * La grilla se construye **editable** y RF-12 conserva su mínimo de 3, que es la
 * regla escrita. Si A-13 cierra a favor de sólo lectura, lo que cae es el POST y
 * el DELETE, no el GET.
 */

import type { NextRequest } from 'next/server'
import { createRecord, listRecords, updateRecord } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { auditar } from '@/lib/tasador/auditoria'
import { TABLA_ORIGEN, TABLE_IDS } from '@/lib/tasador/field-ids'
import { MENSAJES } from '@/lib/tasador/mensajes'
import { desdeExcepcion, desdeGuard, error, ok } from '@/lib/tasador/respuestas'
import {
  comparableBorrarSchema,
  comparableCrearSchema,
  parsearCuerpo,
} from '@/lib/tasador/validators'

export const dynamic = 'force-dynamic'

/** Traducción del discriminador del v0 al dominio real de `tipo_referencia`. */
const A_TIPO_REFERENCIA = { oferta: 'Oferta', cbr: 'CBR' } as const
const DESDE_TIPO_REFERENCIA: Record<string, 'oferta' | 'cbr'> = {
  Oferta: 'oferta',
  CBR: 'cbr',
}

interface ComparableFields {
  direccion?: string
  comuna_comparable?: string
  sup_terreno_m2?: number
  sup_construccion_m2?: number
  precio_uf?: number
  anio?: number
  tipo_referencia?: string
  factor_sup?: number
  factor_edad?: number
  factor_distancia?: number
  telefono_contacto?: string
  foja?: string
  numero?: string
  solicitud?: string[]
}

function aRespuesta(id: string, f: ComparableFields) {
  return {
    id,
    direccionReferencia: f.direccion ?? '',
    comuna: f.comuna_comparable ?? '',
    supTerreno: f.sup_terreno_m2 ?? null,
    supConstruida: f.sup_construccion_m2 ?? null,
    totalUf: f.precio_uf ?? null,
    anio: f.anio ?? null,
    fuente: f.tipo_referencia ? (DESDE_TIPO_REFERENCIA[f.tipo_referencia] ?? null) : null,
    factorSup: f.factor_sup ?? null,
    factorEdad: f.factor_edad ?? null,
    factorDistancia: f.factor_distancia ?? null,
    telefonoContacto: f.telefono_contacto ?? '',
    foja: f.foja ?? '',
    numero: f.numero ?? '',
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const codigo = String(guard.fields.codigo_solicitud ?? '')

  try {
    if (!codigo) return ok({ id, comparables: [], total: 0 })

    // El Link `solicitud` se evalúa contra el primary field de TX_Solicitudes.
    const registros = await listRecords<ComparableFields>(TABLE_IDS.comparables, {
      filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
    })

    const comparables = registros.map((r) => aRespuesta(r.id, r.fields))
    return ok({ id, comparables, total: comparables.length })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/comparables', err)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const cuerpo = await parsearCuerpo(request, comparableCrearSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)

  const d = cuerpo.datos

  try {
    const creado = await createRecord<ComparableFields>(TABLE_IDS.comparables, {
      solicitud: [id],
      direccion: d.direccionReferencia,
      comuna_comparable: d.comuna ?? '',
      sup_terreno_m2: d.supTerreno,
      sup_construccion_m2: d.supConstruida,
      precio_uf: d.totalUf,
      anio: d.anio,
      // Traducción explícita — ver el docblock del módulo.
      tipo_referencia: A_TIPO_REFERENCIA[d.fuente],
      factor_sup: d.factorSup,
      factor_edad: d.factorEdad,
      factor_distancia: d.factorDistancia,
      telefono_contacto: d.telefonoContacto ?? '',
      foja: d.foja ?? '',
      numero: d.numero ?? '',
    })

    await auditar([
      {
        registroId: id,
        registroNombre: String(guard.fields.codigo_solicitud ?? ''),
        campo: 'comparables',
        valorAnterior: '',
        valorNuevo: `alta ${creado.id} · ${d.direccionReferencia}`,
        razon: 'Alta de comparable desde IF-03 (RF-12)',
      },
    ])

    return ok(aRespuesta(creado.id, creado.fields), 201)
  } catch (err) {
    return desdeExcepcion('POST /api/tasaciones/[id]/comparables', err)
  }
}

/**
 * Baja de un comparable.
 *
 * **No borra la fila**: desliga el comparable de la solicitud vaciando el Link.
 * `TX_Comparables` alimenta el histórico de mercado (`aporta_a_historico`), así
 * que un `DELETE` real destruiría un dato que le sirve a otras tasaciones. La
 * grilla del tasador deja de verlo, que es lo que el requisito pide.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const cuerpo = await parsearCuerpo(request, comparableBorrarSchema)
  if (!cuerpo.ok) return error(cuerpo.mensaje, 400)

  try {
    // Se relee el comparable para comprobar que pertenece a ESTA solicitud.
    // Sin esto, un id válido de otra solicitud pasaría el guard —que sólo mira
    // la solicitud de la URL— y desligaría un comparable ajeno.
    const registros = await listRecords<ComparableFields>(TABLE_IDS.comparables, {
      filterByFormula: `RECORD_ID()="${cuerpo.datos.comparableId}"`,
      fields: ['solicitud', 'direccion'],
    })

    const comparable = registros[0]
    const pertenece =
      comparable && Array.isArray(comparable.fields.solicitud)
        ? comparable.fields.solicitud.includes(id)
        : false

    if (!pertenece) {
      return error(MENSAJES.solicitudNoDisponible, 404)
    }

    await updateRecord(TABLE_IDS.comparables, cuerpo.datos.comparableId, { solicitud: [] })

    await auditar([
      {
        registroId: id,
        registroNombre: String(guard.fields.codigo_solicitud ?? ''),
        campo: 'comparables',
        valorAnterior: `${cuerpo.datos.comparableId} · ${comparable.fields.direccion ?? ''}`,
        valorNuevo: '',
        razon: 'Baja de comparable desde IF-03 (RF-12)',
        tablaOrigen: TABLA_ORIGEN.solicitudes,
      },
    ])

    return ok({ id, comparableId: cuerpo.datos.comparableId, desligado: true })
  } catch (err) {
    return desdeExcepcion('DELETE /api/tasaciones/[id]/comparables', err)
  }
}
