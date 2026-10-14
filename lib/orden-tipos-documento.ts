/**
 * Orden de negocio del checklist de documentos (PRD «Temas 1» R3).
 *
 * Primero los tipos con `D_TipoDocumento.orden` (ascendente): hoy foto fuente
 * SII, certificado de avalúo, contribuciones, permiso de edificación, recepción
 * definitiva y plano. Después el resto, en orden alfabético por nombre, que era
 * la regla anterior (§1.5.1.1). Un tipo nuevo sin `orden` cae al final sin tocar
 * código.
 *
 * Módulo puro, separado de `lib/tipos-documento.ts` para que el componente
 * cliente lo importe sin arrastrar el cliente REST de Airtable.
 */

export interface TipoOrdenable {
  nombre: string
  orden?: number | null
}

export function compararTiposDocumento(a: TipoOrdenable, b: TipoOrdenable): number {
  const oa = typeof a.orden === 'number' ? a.orden : null
  const ob = typeof b.orden === 'number' ? b.orden : null
  if (oa !== null && ob !== null && oa !== ob) return oa - ob
  if (oa !== null && ob === null) return -1
  if (oa === null && ob !== null) return 1
  return a.nombre.localeCompare(b.nombre, 'es')
}
