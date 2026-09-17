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
import { FIELD_IDS_DATOS_TASACION, FIELD_IDS_DOC_LEGALES, TABLE_IDS } from '@/lib/tasador/field-ids'

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

  it('certificado_recepcion_final → DocumentosLegales 2 (a): sólo el par recepción final (scope mínimo)', () => {
    const t = tablasDerivadasDe('certificado_recepcion_final')
    expect(t).toHaveLength(1)
    expect(t[0].patron).toBe('a')
    expect(t[0].campos).toHaveLength(2)
    expect(t[0].campos.map((c) => c.fieldId)).toEqual([
      FIELD_IDS_DOC_LEGALES.recepcionFinalNumero,
      FIELD_IDS_DOC_LEGALES.recepcionFinalFecha,
    ])
  })

  it('certificado_recepcion_final y escritura_compraventa comparten el par recepción final (Q1)', () => {
    const camposDe = (tipo: string) =>
      tablasDerivadasDe(tipo)
        .filter((t) => t.patron === 'a')
        .flatMap((t) => t.campos.map((c) => c.fieldId))
    const certificado = camposDe('certificado_recepcion_final')
    const escritura = camposDe('escritura_compraventa')
    for (const f of [
      FIELD_IDS_DOC_LEGALES.recepcionFinalNumero,
      FIELD_IDS_DOC_LEGALES.recepcionFinalFecha,
    ]) {
      expect(certificado).toContain(f)
      expect(escritura).toContain(f)
    }
  })

  it('tipos sin destino (Q5) y clave vacía/nula → sin campos (no-op)', () => {
    // certificado_deuda_tgr (H1) está catalogado pero deliberadamente sin destino
    expect(tablasDerivadasDe('certificado_deuda_tgr')).toEqual([])
    expect(tablasDerivadasDe('foto_ofertas_comparables')).toEqual([]) // es patrón b, no vive aquí
    expect(tablasDerivadasDe('')).toEqual([])
    expect(tablasDerivadasDe(null)).toEqual([])
    expect(tablasDerivadasDe(undefined)).toEqual([])
  })

  it('consulta_antecedentes_bien_raiz (H2) → DatosTasacion 3 (a): avaluo_total · destino_sii · calidad_sii', () => {
    const t = tablasDerivadasDe('consulta_antecedentes_bien_raiz')
    expect(t).toHaveLength(1)
    expect(t[0].patron).toBe('a')
    expect(t[0].tabla).toBe(TABLE_IDS.datosTasacion)
    expect(t[0].campos.map((c) => c.fieldId)).toEqual([
      FIELD_IDS_DATOS_TASACION.avaluoTotal,
      FIELD_IDS_DATOS_TASACION.destinoSii,
      FIELD_IDS_DATOS_TASACION.calidadSii,
    ])
  })

  it('informe_no_expropiacion_serviu (H3) → DatosTasacion 3 (a): n_cert · lat · long', () => {
    const t = tablasDerivadasDe('informe_no_expropiacion_serviu')
    expect(t).toHaveLength(1)
    expect(t[0].patron).toBe('a')
    expect(t[0].tabla).toBe(TABLE_IDS.datosTasacion)
    expect(t[0].campos.map((c) => c.fieldId)).toEqual([
      FIELD_IDS_DATOS_TASACION.nCertNoExpropiacion,
      FIELD_IDS_DATOS_TASACION.lat,
      FIELD_IDS_DATOS_TASACION.long,
    ])
  })

  it('inscripcion_dominio_cbr (H4) → DocumentosLegales 3 (a): terna de dominio, compartida con foto_fuente_sii (Q1)', () => {
    const t = tablasDerivadasDe('inscripcion_dominio_cbr')
    expect(t).toHaveLength(1)
    expect(t[0].patron).toBe('a')
    expect(t[0].tabla).toBe(TABLE_IDS.documentosLegales)
    const terna = [
      FIELD_IDS_DOC_LEGALES.fojas,
      FIELD_IDS_DOC_LEGALES.numeroInscripcion,
      FIELD_IDS_DOC_LEGALES.anoInscripcion,
    ]
    expect(t[0].campos.map((c) => c.fieldId)).toEqual(terna)
    // Q1: la misma terna la limpia foto_fuente_sii (bloque dominio)
    const sii = tablasDerivadasDe('foto_fuente_sii')
      .find((x) => x.tabla === TABLE_IDS.documentosLegales)!
      .campos.map((c) => c.fieldId)
    for (const f of terna) expect(sii).toContain(f)
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
    expect(grupoCamposLimpiables('certificado_deuda_tgr')).toEqual([])
  })

  it('permiso_edificacion → lista el par permiso en el diálogo Q3', () => {
    expect(grupoCamposLimpiables('permiso_edificacion')).toEqual([
      {
        tablaLabel: 'Documentos legales',
        labels: ['N° permiso de edificación', 'Fecha permiso de edificación'],
      },
    ])
  })

  it('certificado_recepcion_final → lista el par recepción final en el diálogo Q3', () => {
    expect(grupoCamposLimpiables('certificado_recepcion_final')).toEqual([
      {
        tablaLabel: 'Documentos legales',
        labels: ['N° recepción final', 'Fecha recepción final'],
      },
    ])
  })
})
