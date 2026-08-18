/**
 * `GET /api/tasaciones/[id]/informe` — los 8 bloques del preview del informe
 * más la versión vigente (RF-TAS-20 · RN-56).
 *
 * Tanda P2-TAS.A · plan §3.1 y §10.1.
 *
 * ## Es GET puro. No hay PATCH y no debe haberlo
 *
 * El informe lo produce **AT03** (motor determinista) y el PDF lo deposita el
 * pipeline **Carbone** (E1/E2/E3). `TX_DocumentosGenerados` la escribe ese
 * pipeline, **nunca IF-03**. Las dos acciones del preview que sí escriben
 * tienen ruta propia: el rechazo del informe es `POST /rechazo`, y "Descargar
 * PDF" sólo lee. Si alguien necesita editar un dato del preview, el lugar es
 * `PATCH /datos` y después recalcular — no un PATCH acá, que dejaría el
 * documento y sus datos divergiendo.
 *
 * ## Lee 8 tablas
 *
 * `TX_Solicitudes` · `TX_DatosTasacion` · `TX_Unidades` ·
 * `TX_ItemsCuadroValoracion` · `TX_Comparables` · `TX_Adjuntos` ·
 * `TX_DocumentosGenerados` · `TX_DocumentosLegales`. Un preview que leyera sólo
 * `TX_DocumentosGenerados` mostraría la versión y ningún dato: esa tabla aporta
 * la cabecera, no el contenido.
 *
 * ## Los ocho bloques son un contrato, no una sugerencia
 *
 * §10.1: *«El orden y la numeración son parte del requisito: el tasador debe
 * poder referirse a un bloque por su número al hablar con el visador.»* Por eso
 * la respuesta es un **array ordenado** con `numero` explícito, y no un objeto
 * cuyas claves el consumidor pueda reordenar sin darse cuenta.
 *
 * Cada bloque lleva `vacio: boolean`. Los bloques sin contenido **se muestran
 * vacíos, no se omiten** (§10.1) — de ahí que el flag viaje en el contrato y no
 * se deduzca en la UI contando propiedades nulas.
 *
 * ## Dos degradaciones declaradas
 *
 * - **`versionVigente: null` cuando no hay fila en `TX_DocumentosGenerados`.**
 *   El Link `solicitud` está vacío en la única fila existente y su
 *   `clave_natural` usa un identificador de otro namespace (`METLIFE-6283` vs
 *   `VP-2026-NNNN`), así que hoy ninguna fila casa. Se lee por el Link, que es
 *   el contrato correcto, y se degrada; **no** se parsea `clave_natural` para
 *   adivinar, que sería derivar un contrato de una fila de demostración y
 *   arriesgar mostrar la versión de otro informe. **CI-024.**
 * - **Códigos SII vacíos.** `cod_sii_comuna`, `cod_sii_manzana` y
 *   `cod_sii_predio` no existen en la base pese a que `schema-airtable.md`
 *   §20.6 los declara creados. El resto del bloque 4 —avalúo por unidad, total
 *   y contribución— sale completo. **No se derivan del `rol_sii`**: partir un
 *   rol para fabricar tres campos que el negocio no definió pondría un dato
 *   inventado con apariencia de oficial en un documento que sale de la
 *   organización. **CI-025.**
 *
 * ## Tres decisiones que no son obvias al leer el código
 *
 * **1 · El valor destacado prefiere el override y nunca cae a cero.** §10.1
 * manda usar el override manual del tasador si existe y, si no, el valor de
 * referencia del motor. Cuando **ambos** faltan —hoy `valor_comercial_uf` está
 * vacío en la mayoría de las filas— el bloque va con `valorUf: null` y
 * `vacio: true`. Un `0` se renderizaría como «0 UF», que es una tasación de
 * cero pesos, no un dato ausente. La distinción entre «no hay valor» y «el
 * valor es cero» tiene que sobrevivir hasta la UI.
 *
 * **2 · El registro fotográfico cuenta por `descripcion || tipo_adjunto`.**
 * `TX_Adjuntos.tipo_adjunto` tiene dominio cerrado, pero §2.6 deja al tasador
 * crear categorías propias en terreno, y ésas se persisten en `descripcion`
 * (decisión de P2-TAS.A · ruta `/fotos`). Contar sólo por `tipo_adjunto`
 * agruparía todas las categorías personalizadas bajo `foto_interior` y el
 * «conteo real por categoría» que pide §10.1 sería falso.
 *
 * **3 · El promedio homogeneizado del bloque 6 se calcula acá, no en la UI.**
 * Es aritmética de presentación sobre factores **ya almacenados** por
 * comparable, no una regla de negocio nueva. Vive server-side para que el
 * preview y el PDF no puedan mostrar números distintos: dos implementaciones
 * del mismo promedio divergen en cuanto una cambia. ⚠ Si AT03 llega a publicar
 * su propio promedio homogeneizado, **esta ruta debe deferir a ése y dejar de
 * calcularlo** — el motor manda sobre la presentación.
 */

import type { NextRequest } from 'next/server'
import { listRecords } from '@/lib/airtable-client'
import { autorizarSolicitud } from '@/lib/tasador/auth-guard'
import { TABLE_IDS } from '@/lib/tasador/field-ids'
import { desdeExcepcion, desdeGuard, ok } from '@/lib/tasador/respuestas'

export const dynamic = 'force-dynamic'

type Fields = Record<string, unknown>

/** Bloque del preview. `numero` y el orden del array son parte del requisito. */
interface Bloque {
  numero: number
  id: string
  titulo: string
  vacio: boolean
  datos: Record<string, unknown>
}

async function filasDeSolicitud<T extends Fields>(tableId: string, codigo: string) {
  if (!codigo) return []
  return listRecords<T>(tableId, {
    filterByFormula: `{solicitud}="${codigo.replace(/"/g, '\\"')}"`,
  })
}

/** `null` para ausente. **Nunca** `0`: ver la decisión 1 del docblock. */
function numeroONull(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function texto(valor: unknown): string {
  return valor === null || valor === undefined ? '' : String(valor)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const guard = await autorizarSolicitud(id)
  if (!guard.ok) return desdeGuard(guard)

  const s = guard.fields as Fields
  const codigo = String(s.codigo_solicitud ?? '')

  try {
    const [datos, unidades, items, comparables, adjuntos, generados, legales] =
      await Promise.all([
        filasDeSolicitud<Fields>(TABLE_IDS.datosTasacion, codigo),
        filasDeSolicitud<Fields>(TABLE_IDS.unidades, codigo),
        filasDeSolicitud<Fields>(TABLE_IDS.itemsCuadroValoracion, codigo),
        filasDeSolicitud<Fields>(TABLE_IDS.comparables, codigo),
        filasDeSolicitud<Fields>(TABLE_IDS.adjuntos, codigo),
        filasDeSolicitud<Fields>(TABLE_IDS.documentosGenerados, codigo),
        filasDeSolicitud<Fields>(TABLE_IDS.documentosLegales, codigo),
      ])

    const d = datos[0]?.fields ?? {}
    const l = legales[0]?.fields ?? {}

    /* --- Versión vigente · CI-024 -------------------------------------- */
    // `es_vigente` es el flag poblado; `estado` y `status_envio_cliente` están
    // vacíos en la base. Si ninguna fila lo trae, se toma la de mayor versión.
    // La caída `version_doc ?? version` y `url_pdf ?? url_dropbox` existe
    // porque la conclusión sale de UNA fila: si el pipeline puebla la otra
    // pareja, el preview sigue funcionando. Ver CI-024 §3.
    const vigente =
      generados.find((g) => g.fields.es_vigente === true) ??
      [...generados].sort(
        (a, b) =>
          Number(b.fields.version_doc ?? b.fields.version ?? 0) -
          Number(a.fields.version_doc ?? a.fields.version ?? 0)
      )[0]

    const versionVigente = vigente
      ? {
          version: numeroONull(vigente.fields.version_doc ?? vigente.fields.version),
          urlPdf: texto(vigente.fields.url_pdf || vigente.fields.url_dropbox) || null,
          generadoEn: texto(vigente.fields.generado_en || vigente.fields.fecha_generacion),
          plantillaVersion: texto(vigente.fields.plantilla_version),
        }
      : null

    /* --- Bloque 2 · valor destacado ------------------------------------ */
    const valorUf =
      numeroONull(s.valor_final_override) ?? numeroONull(s.valor_comercial_uf)
    const capRate =
      numeroONull(s.tasa_cap_rate_override) ?? numeroONull(d.tasa_cap_rate)

    /* --- Bloque 6 · comparables y promedio homogeneizado --------------- */
    const filasComparables = comparables.map((c) => {
      const f = c.fields
      const supConstruida = numeroONull(f.sup_construccion_m2)
      const precioUf = numeroONull(f.precio_uf)
      const ufM2 = supConstruida && precioUf ? precioUf / supConstruida : null

      // Los tres factores se aplican multiplicativamente sobre el UF/m² crudo.
      // Un factor ausente vale 1 — no anula el comparable.
      const factor =
        (numeroONull(f.factor_sup) ?? 1) *
        (numeroONull(f.factor_edad) ?? 1) *
        (numeroONull(f.factor_distancia) ?? 1)

      return {
        id: c.id,
        direccion: texto(f.direccion),
        comuna: texto(f.comuna_comparable),
        supTerreno: numeroONull(f.sup_terreno_m2),
        supConstruida,
        precioUf,
        anio: numeroONull(f.anio),
        tipoReferencia: texto(f.tipo_referencia),
        ufM2,
        ufM2Homogeneizado: ufM2 === null ? null : ufM2 * factor,
      }
    })

    const homogeneizados = filasComparables
      .map((c) => c.ufM2Homogeneizado)
      .filter((v): v is number => v !== null)

    const promedioUfM2 =
      homogeneizados.length > 0
        ? homogeneizados.reduce((a, b) => a + b, 0) / homogeneizados.length
        : null

    /* --- Bloque 7 · conteo real por categoría -------------------------- */
    // `descripcion || tipo_adjunto`: la categoría libre que el tasador crea en
    // terreno vive en `descripcion`. Ver la decisión 2 del docblock.
    const fotos = adjuntos.filter((a) => texto(a.fields.tipo_adjunto).startsWith('foto'))
    const porCategoria: Record<string, number> = {}
    for (const foto of fotos) {
      const categoria =
        texto(foto.fields.descripcion) || texto(foto.fields.tipo_adjunto) || 'otro'
      porCategoria[categoria] = (porCategoria[categoria] ?? 0) + 1
    }

    /* --- Bloque 8 · overrides ------------------------------------------ */
    const overrides = [
      { campo: 'Tasa cap rate', valor: numeroONull(s.tasa_cap_rate_override) },
      { campo: 'Vida útil', valor: numeroONull(s.vida_util_override) },
      { campo: 'Valor final', valor: numeroONull(s.valor_final_override) },
    ].filter((o) => o.valor !== null)

    const bloques: Bloque[] = [
      {
        numero: 1,
        id: 'cabecera',
        titulo: 'Cabecera',
        vacio: false,
        datos: {
          codigo,
          codigoExt: texto(s.codigo_ext),
          nuevoUsado: texto(s.tipo_propiedad_nuevo_usado),
          cliente: s.cliente ?? [],
          direccion: texto(s.direccion),
          comuna: s.comuna ?? [],
          // Regla T-B: el informe declara la fecha REAL, no la planificada.
          fechaVisita: texto(s.fecha_visita),
          version: versionVigente?.version ?? null,
        },
      },
      {
        numero: 2,
        id: 'valor',
        titulo: 'Valor de tasación',
        vacio: valorUf === null,
        datos: {
          valorUf,
          capRate,
          /** `true` si el monto mostrado es el override manual del tasador. */
          esOverride: numeroONull(s.valor_final_override) !== null,
          ufDiaVisita: numeroONull(s.uf_dia_visita),
        },
      },
      {
        numero: 3,
        id: 'antecedentes',
        titulo: 'Antecedentes de la propiedad',
        vacio: datos.length === 0,
        datos: {
          supTerrenoM2: numeroONull(d.sup_terreno_m2),
          supConstruccionM2: numeroONull(d.sup_construccion_m2),
          supPrimerPisoM2: numeroONull(d.sup_primer_piso_m2),
          supConstruidaTotal: numeroONull(d.sup_construida_total),
          anioConstruccion: numeroONull(d.anio_construccion),
          materialPredominante: texto(d.material_predominante),
          calidadConstruccion: numeroONull(d.calidad_construccion),
          estadoConservacion: texto(d.estado_conservacion),
          agrupacion: texto(d.agrupacion_propiedad),
          dormitorios: numeroONull(d.dormitorios),
          banos: numeroONull(d.banos),
          estacionamientos: numeroONull(d.estacionamientos),
          bodegas: numeroONull(d.bodegas),
          dfl2: texto(d.dfl2),
        },
      },
      {
        numero: 4,
        id: 'sii',
        titulo: 'Datos SII y avalúo',
        vacio: unidades.length === 0 && datos.length === 0,
        datos: {
          /**
           * ⚠ Vacío por CI-025: `cod_sii_comuna`, `cod_sii_manzana` y
           * `cod_sii_predio` no existen en la base. Se emite la clave con
           * `null` —y no se omite— para que la UI muestre el estado vacío que
           * §10.1 exige en lugar de dejar de renderizar el sub-bloque.
           */
          codigosSii: { comuna: null, manzana: null, predio: null },
          rolSii: texto(s.rol_sii),
          avaluoTotal: numeroONull(d.avaluo_total),
          avaluoFiscalUf: numeroONull(d.avaluo_fiscal_uf),
          avaluoExento: numeroONull(d.avaluo_exento),
          contribucionAnual: numeroONull(d.contribucion_anual),
          calidadSii: texto(d.calidad_sii),
          destinoSii: texto(d.destino_sii),
          porUnidad: unidades.map((u) => ({
            id: u.id,
            numeroUnidad: texto(u.fields.numero_unidad),
            rolSii: texto(u.fields.rol_sii),
            subtipo: texto(u.fields.subtipo),
            supM2: numeroONull(u.fields.sup_m2),
            avaluoUf: numeroONull(u.fields.avaluo_uf),
          })),
        },
      },
      {
        numero: 5,
        id: 'valoracion',
        titulo: 'Cuadro de valoración',
        vacio: items.length === 0,
        datos: {
          items: items.map((i) => ({
            id: i.id,
            orden: numeroONull(i.fields.orden),
            descripcion: texto(i.fields.descripcion),
            tipoItem: texto(i.fields.tipo_item),
            supM2: numeroONull(i.fields.sup_m2),
            ufM2Aplicado: numeroONull(i.fields.uf_m2_aplicado),
            ufTotalItem: numeroONull(i.fields.uf_total_item),
            aportaAGarantia: Boolean(i.fields.aporta_a_garantia),
            situacionMunicipal: texto(i.fields.situacion_municipal),
          })),
          totalUf: items.reduce((suma, i) => suma + (numeroONull(i.fields.uf_total_item) ?? 0), 0),
        },
      },
      {
        numero: 6,
        id: 'comparables',
        titulo: 'Comparables',
        vacio: filasComparables.length === 0,
        datos: {
          comparables: filasComparables,
          promedioUfM2Homogeneizado: promedioUfM2,
          /**
           * Cuántos comparables entraron en el promedio. Puede ser menor que
           * el total: los que no tienen superficie o precio quedan fuera del
           * cálculo pero **sí** se listan en la grilla.
           */
          usadosEnPromedio: homogeneizados.length,
          /** RF-12 exige un mínimo de 3. Se informa; no se bloquea acá. */
          cumpleMinimo: filasComparables.length >= 3,
        },
      },
      {
        numero: 7,
        id: 'fotografico',
        titulo: 'Registro fotográfico',
        vacio: fotos.length === 0,
        datos: {
          total: fotos.length,
          porCategoria,
          fotos: fotos.map((f) => ({
            id: f.id,
            nombre: texto(f.fields.nombre_archivo),
            categoria: texto(f.fields.descripcion) || texto(f.fields.tipo_adjunto),
            url: texto(f.fields.url_dropbox),
          })),
        },
      },
      {
        numero: 8,
        id: 'observaciones',
        titulo: 'Observaciones y overrides',
        vacio: overrides.length === 0 && !texto(d.observaciones_tasador),
        datos: {
          observacionesTasador: texto(d.observaciones_tasador),
          observacionRechazo: texto(s.observacion_rechazo_tasador),
          overrides,
          motivoOverride: texto(s.override_motivo),
          autorOverride: texto(s.override_autor),
          antecedentesLegales: {
            fojas: texto(l.fojas),
            numeroInscripcion: texto(l.numero_inscripcion),
            anoInscripcion: numeroONull(l.ano_inscripcion),
            permisoEdificacion: texto(l.permiso_edificacion_numero),
            recepcionFinal: texto(l.recepcion_final_numero),
          },
        },
      },
    ]

    return ok({
      id,
      codigo,
      estado: texto(s.estado),
      versionVigente,
      bloques,
    })
  } catch (err) {
    return desdeExcepcion('GET /api/tasaciones/[id]/informe', err)
  }
}
