import { describe, expect, it } from 'vitest'

/**
 * Tarea 5 · Fase B — mapa curado `tipo de documento → campos derivados`.
 *
 * Función pura: se verifican los conteos y la política de campos compartidos (Q1)
 * sin tocar Airtable ni React. Es el guardarraíl de que el diálogo (Q3) y el
 * cascade (que derivan del mismo mapa) listen exactamente lo que §28 declara.
 */

import {
  CAMPOS_DERIVADOS,
  tablasDerivadasDe,
  grupoCamposLimpiables,
} from '@/lib/adjuntos-doc-campos'
import { FIELD_IDS_DATOS_TASACION, FIELD_IDS_DOC_LEGALES } from '@/lib/tasador/field-ids'

describe('CAMPOS_DERIVADOS · conteos de §28', () => {
  it('foto_fuente_sii → 3 tablas (DatosTasacion 14 · DocumentosLegales 3 · Unidades 4)', () => {
    const t = tablasDerivadasDe('foto_fuente_sii')
    expect(t).toHaveLength(3)
    const porLabel = Object.fromEntries(t.map((x) => [x.tablaLabel, x]))
    expect(porLabel['Datos de tasación (SII)'].campos).toHaveLength(14)
    expect(porLabel['Datos de tasación (SII)'].patron).toBe('a')
    expect(porLabel['Documentos legales (dominio)'].campos).toHaveLength(3)
    expect(porLabel['Documentos legales (dominio)'].patron).toBe('a')
    expect(porLabel['Unidades'].campos).toHaveLength(4)
    expect(porLabel['Unidades'].patron).toBe('c')
  })

  it('certificado_avaluo_fiscal → DatosTasacion 5 (a) · Unidades 4 (c)', () => {
    const t = tablasDerivadasDe('certificado_avaluo_fiscal')
    expect(t).toHaveLength(2)
    const dt = t.find((x) => x.patron === 'a')!
    expect(dt.campos).toHaveLength(5)
    const un = t.find((x) => x.patron === 'c')!
    expect(un.campos).toHaveLength(4)
  })

  it('escritura_compraventa → DocumentosLegales 4 (a), sin Unidades', () => {
    const t = tablasDerivadasDe('escritura_compraventa')
    expect(t).toHaveLength(1)
    expect(t[0].patron).toBe('a')
    expect(t[0].campos).toHaveLength(4)
  })

  it('permiso_edificacion → DocumentosLegales 2 (a): sólo el par permiso (scope mínimo)', () => {
    const t = tablasDerivadasDe('permiso_edificacion')
    expect(t).toHaveLength(1)
    expect(t[0].patron).toBe('a')
    expect(t[0].campos).toHaveLength(2)
    expect(t[0].campos.map((c) => c.fieldId)).toEqual([
      FIELD_IDS_DOC_LEGALES.permisoEdificacionNumero,
      FIELD_IDS_DOC_LEGALES.permisoEdificacionFecha,
    ])
  })

  it('permiso_edificacion y escritura_compraventa comparten el par permiso (Q1)', () => {
    const camposDe = (tipo: string) =>
      tablasDerivadasDe(tipo)
        .filter((t) => t.patron === 'a')
        .flatMap((t) => t.campos.map((c) => c.fieldId))
    const permiso = camposDe('permiso_edificacion')
    const escritura = camposDe('escritura_compraventa')
    for (const f of [
      FIELD_IDS_DOC_LEGALES.permisoEdificacionNumero,
      FIELD_IDS_DOC_LEGALES.permisoEdificacionFecha,
    ]) {
      expect(permiso).toContain(f)
      expect(escritura).toContain(f)
    }
  })

  it('tipos sin destino (Q5) y clave vacía/nula → sin campos (no-op)', () => {
    expect(tablasDerivadasDe('consulta_antecedentes_bien_raiz')).toEqual([])
    expect(tablasDerivadasDe('foto_ofertas_comparables')).toEqual([]) // es patrón b, no vive aquí
    expect(tablasDerivadasDe('')).toEqual([])
    expect(tablasDerivadasDe(null)).toEqual([])
    expect(tablasDerivadasDe(undefined)).toEqual([])
  })
})

describe('política Q1 · campos compartidos por dos tipos', () => {
  it('los 4 campos SII compartidos salen tanto de foto_fuente_sii como de certificado_avaluo_fiscal', () => {
    const compartidos = [
      FIELD_IDS_DATOS_TASACION.avaluoExento,
      FIELD_IDS_DATOS_TASACION.contribucionAnual,
      FIELD_IDS_DATOS_TASACION.destinoSii,
      FIELD_IDS_DATOS_TASACION.calidadSii,
    ]
    const camposDe = (tipo: string) =>
      tablasDerivadasDe(tipo)
        .filter((t) => t.patron === 'a')
        .flatMap((t) => t.campos.map((c) => c.fieldId))

    const sii = camposDe('foto_fuente_sii')
    const cert = camposDe('certificado_avaluo_fiscal')
    for (const f of compartidos) {
      expect(sii).toContain(f)
      expect(cert).toContain(f)
    }
  })

  it('todos los campos declaran FIELD_ID (fld…) y label no vacío', () => {
    for (const tablas of Object.values(CAMPOS_DERIVADOS)) {
      for (const t of tablas) {
        for (const c of t.campos) {
          expect(c.fieldId).toMatch(/^fld/)
          expect(c.label.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('grupoCamposLimpiables · forma para el diálogo Q3', () => {
  it('agrupa por tabla con labels legibles', () => {
    const g = grupoCamposLimpiables('escritura_compraventa')
    expect(g).toEqual([
      {
        tablaLabel: 'Documentos legales',
        labels: [
          'N° permiso de edificación',
          'Fecha permiso de edificación',
          'N° recepción final',
          'Fecha recepción final',
        ],
      },
    ])
  })

  it('tipo sin datos → lista vacía (el diálogo no muestra sección de campos)', () => {
    expect(grupoCamposLimpiables('certificado_recepcion_final')).toEqual([])
  })

  it('permiso_edificacion → lista el par permiso en el diálogo Q3', () => {
    expect(grupoCamposLimpiables('permiso_edificacion')).toEqual([
      {
        tablaLabel: 'Documentos legales',
        labels: ['N° permiso de edificación', 'Fecha permiso de edificación'],
      },
    ])
  })
})
