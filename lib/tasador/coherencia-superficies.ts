/**
 * Aviso de coherencia entre la sección B y los ítems de terreno del cuadro de
 * valoración (sección C) · T-SUPERFICIES-CONSOLIDADAS-20261014.
 *
 * «Servidumbre (m²)» y «Sup. terreno (m²)» de la sección B se llenan solos desde
 * los documentos (AT03-Ext v5, spec §4.3.4). Los ítems de la sección C siguen
 * siendo del tasador —llevan UF/m² y factor, y el motor los suma—, así que aquí
 * no se corrige nada: sólo se detecta que la superficie de los ítems no calza
 * con la de la sección B, para mostrar un aviso ámbar que no bloquea.
 *
 * Caso MET-6283: terreno 5024,86 = ítem «Terreno» 1402,35 + ítem «Servidumbre»
 * 3622,51. Los dos ítems usan el subtipo `Terreno`; el de servidumbre se
 * reconoce por su descripción (el catálogo de subtipos no tiene «Servidumbre»).
 *
 * Lógica pura, sin Airtable: importable desde el componente cliente.
 */

import type { ItemValoracion } from '@/lib/tasador/tasaciones'
import { numeroDe } from '@/lib/tasador/comparables'

/** Diferencia tolerada en m² (redondeo a 2 decimales). */
const TOLERANCIA_M2 = 0.005

export interface EntradaCoherencia {
  supTerreno: string
  servidumbreM2: string
  items: readonly Pick<ItemValoracion, 'subtipo' | 'descripcion' | 'superficieM2'>[]
}

function m2(n: number): string {
  return n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function sumaSuperficies(items: EntradaCoherencia['items']): number | null {
  const valores = items.map((i) => numeroDe(i.superficieM2)).filter((n): n is number => n !== null)
  return valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0)
}

const esTerreno = (i: EntradaCoherencia['items'][number]) => i.subtipo.trim().toLowerCase() === 'terreno'
const esServidumbre = (i: EntradaCoherencia['items'][number]) => /servidumbre/i.test(i.descripcion)

/**
 * Avisos (texto humano, segunda persona, sin exclamaciones) cuando la superficie
 * de los ítems de terreno no calza con la sección B. Sin dato en B o sin ítems
 * del tipo correspondiente no hay aviso: no hay nada que comparar.
 */
export function avisosCoherenciaTerreno({ supTerreno, servidumbreM2, items }: EntradaCoherencia): string[] {
  const avisos: string[] = []
  const terreno = numeroDe(supTerreno)
  const servidumbre = numeroDe(servidumbreM2)
  const deTerreno = items.filter(esTerreno)
  const itemsServidumbre = deTerreno.filter(esServidumbre)
  const itemsTerreno = deTerreno.filter((i) => !esServidumbre(i))

  const supServidumbreItems = sumaSuperficies(itemsServidumbre)
  if (servidumbre !== null && servidumbre > 0 && supServidumbreItems !== null &&
      Math.abs(supServidumbreItems - servidumbre) >= TOLERANCIA_M2) {
    avisos.push(
      `Revisa la superficie del ítem de servidumbre: suma ${m2(supServidumbreItems)} m² y la servidumbre de la sección B es ${m2(servidumbre)} m².`,
    )
  }

  const supTerrenoItems = sumaSuperficies(itemsTerreno)
  if (terreno !== null && terreno > 0 && supTerrenoItems !== null) {
    const esperado = terreno - (servidumbre !== null && servidumbre > 0 ? servidumbre : 0)
    if (Math.abs(supTerrenoItems - esperado) >= TOLERANCIA_M2) {
      const detalle = servidumbre !== null && servidumbre > 0
        ? `el terreno menos la servidumbre de la sección B es ${m2(esperado)} m²`
        : `el terreno de la sección B es ${m2(esperado)} m²`
      avisos.push(`Revisa la superficie del ítem de terreno: suma ${m2(supTerrenoItems)} m² y ${detalle}.`)
    }
  }

  return avisos
}
