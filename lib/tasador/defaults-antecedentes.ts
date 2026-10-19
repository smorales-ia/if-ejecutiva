/**
 * Valores fijos de la sección E desde `C_DefaultsAntecedentes` — **módulo
 * server-only** (importa `lib/airtable-client`).
 *
 * RF-TAS-23 · RF-TAS-08 (19-oct-2026): la hoja «Antecedentes» de la planilla
 * deja, por tipo de propiedad × estado de uso, la materialidad, calidad y
 * estado de los elementos y el pavimento, muros, cielo e iluminación de los
 * recintos. Esos valores viven en la tabla, no en el código, y se cambian en
 * Airtable sin deploy. Las fórmulas que los complementan están en
 * `antecedentes-e.ts`.
 *
 * Una combinación sin filas (p. ej. Oficina) devuelve `{}` y los campos fijos
 * quedan vacíos: no se hereda de otro tipo.
 */

import { listRecords } from '@/lib/airtable-client'
import {
  type AmpliacionE,
  aplicarEvidencias,
  type AtributoDefault,
  type CamposBParaE,
  completarSeccionE,
  contextoE,
  type DefaultsTabla,
  type EvidenciasE,
  type SeccionE,
  seccionEPorDefecto,
} from './antecedentes-e'
import type { ItemValoracion } from './tasaciones'
import { TABLE_IDS } from './field-ids'

const TTL_MS = 5 * 60 * 1000

const cache = new Map<string, { valor: DefaultsTabla; expira: number }>()

/** Invalida la caché. Sólo para tests. */
export function _resetCacheDefaultsAntecedentes(): void {
  cache.clear()
}

interface FilaDefault {
  campo_destino?: string
  atributo?: string
  valor_default?: string
}

const literal = (v: string) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

/**
 * Filas activas de un tipo × estado de uso, como `campo_destino → atributo → valor`.
 * `tipoPropiedad` es el nombre de `M_TiposPropiedad` (el Link se evalúa por su
 * primary en la fórmula).
 */
export async function leerDefaultsAntecedentes(tipoPropiedad: string, nueva: boolean): Promise<DefaultsTabla> {
  const tipo = tipoPropiedad.trim()
  if (tipo === '' || tipo === '—') return {}

  const clave = `${tipo.toLowerCase()}·${nueva ? 'nuevo' : 'usado'}`
  const ahora = Date.now()
  const enCache = cache.get(clave)
  if (enCache && enCache.expira > ahora) return enCache.valor

  const filas = await listRecords<FilaDefault>(TABLE_IDS.defaultsAntecedentes, {
    fields: ['campo_destino', 'atributo', 'valor_default'],
    filterByFormula:
      `AND({activo},{estado_uso}=${literal(nueva ? 'nuevo' : 'usado')},` +
      `LOWER(ARRAYJOIN({tipo_propiedad}))=LOWER(${literal(tipo)}))`,
  })

  const valor: DefaultsTabla = {}
  for (const { fields: f } of filas) {
    const campo = f.campo_destino?.trim()
    const atributo = f.atributo?.trim() as AtributoDefault | undefined
    if (!campo || !atributo) continue
    valor[campo] = { ...(valor[campo] ?? {}), [atributo]: (f.valor_default ?? '').trim() }
  }

  cache.set(clave, { valor, expira: ahora + TTL_MS })
  return valor
}

/**
 * La sección E con la que abre una pantalla del tasador: la guardada gana; si
 * no hay, la de la hoja con los valores fijos de la tabla y las fórmulas sobre
 * la sección B ya hidratada. Las tres páginas que arman `informeInicial`
 * (formulario, fotos, informe) la piden acá, para que un borrador sembrado en
 * una no difiera de lo que muestra otra (y no aparezca un «Recuperar» falso).
 */
export async function hidratarSeccionE(
  tasacion: { tipo: string; tipoPropiedad: string },
  informe: CamposBParaE & InformeParaEvidencias,
  guardada: SeccionE | undefined,
  extras?: { textos: readonly string[]; materiales: readonly string[] },
): Promise<{ seccionE: SeccionE; prellenada: boolean }> {
  const nueva = tasacion.tipoPropiedad === 'nueva'
  const ctx = contextoE({ tipo: tasacion.tipo, nueva }, informe)
  if (guardada) return { seccionE: completarSeccionE(guardada, ctx, {}), prellenada: false }

  const tabla = await leerDefaultsAntecedentesSinFallar(tasacion.tipo, nueva)
  return {
    seccionE: aplicarEvidencias(seccionEPorDefecto(ctx, tabla), evidenciasDe(informe, extras), ctx),
    prellenada: true,
  }
}

/** Lo que `evidenciasDe` lee del formulario ya hidratado. */
export interface InformeParaEvidencias {
  dormitorios: string
  banos: string
  mediosBanos: string
  banoServicio: string
  items: readonly Pick<ItemValoracion, 'descripcion' | 'subtipo' | 'tipo' | 'situacionMunicipal' | 'superficieM2'>[]
}

/**
 * Evidencias para completar la sección E (`aplicarEvidencias`), **sólo datos**
 * (pedido de Sergio, 19-oct-2026: nada de fotos): los ítems de la sección C
 * (guardados o propuestos desde `TX_Unidades`), los atributos de documentos y
 * unidades que trae `extras`, y los conteos de la sección B. Las ampliaciones
 * salen de los ítems cuya descripción dice «ampliación».
 */
export function evidenciasDe(
  informe: InformeParaEvidencias,
  extras?: { textos: readonly string[]; materiales: readonly string[] },
): EvidenciasE {
  const items = informe.items.flatMap((it) => [it.descripcion, it.subtipo, it.tipo])
  const ampliaciones: AmpliacionE[] = informe.items
    .filter((it) => /ampliaci/i.test(it.descripcion ?? ''))
    .slice(0, 3)
    .map((it) => ({
      regulado: it.situacionMunicipal === 'Regularizado' ? 'SI' : it.situacionMunicipal ? 'NO' : '',
      pe: '',
      rif: '',
      regulacion: it.situacionMunicipal && it.situacionMunicipal !== 'Regularizado' ? it.situacionMunicipal : '',
      m2: it.superficieM2 ?? '',
    }))
  return {
    textos: [...(extras?.textos ?? []), ...items].filter((t): t is string => Boolean(t)),
    materiales: extras?.materiales ?? [],
    dormitorios: informe.dormitorios,
    banos: informe.banos,
    mediosBanos: informe.mediosBanos,
    banoServicio: informe.banoServicio,
    ampliaciones,
  }
}

/** `leerDefaultsAntecedentes` que no lanza: sin tabla, la sección E abre sin valores fijos. */
export async function leerDefaultsAntecedentesSinFallar(tipoPropiedad: string, nueva: boolean): Promise<DefaultsTabla> {
  try {
    return await leerDefaultsAntecedentes(tipoPropiedad, nueva)
  } catch (err) {
    console.error('[defaults-antecedentes] no se pudo leer C_DefaultsAntecedentes', { tipoPropiedad, nueva, err })
    return {}
  }
}
