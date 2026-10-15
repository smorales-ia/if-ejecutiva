import { describe, it, expect } from 'vitest'
import { avisosCoherenciaTerreno } from '@/lib/tasador/coherencia-superficies'

const item = (subtipo: string, descripcion: string, superficieM2: string) => ({ subtipo, descripcion, superficieM2 })

/** Cuadro de valoración de MET-6283 (guía de réplica, ítems 1 a 3). */
const MET6283 = [
  item('Terreno', 'Terreno', '1402.35'),
  item('Terreno', 'Servidumbre', '3622.51'),
  item('Edificacion', 'Piso 1', '249.91'),
]

describe('avisosCoherenciaTerreno · sección B vs ítems de terreno de la sección C', () => {
  it('MET-6283 cuadra: terreno 5024,86 = 1402,35 + servidumbre 3622,51 → sin avisos', () => {
    expect(avisosCoherenciaTerreno({ supTerreno: '5024.86', servidumbreM2: '3622.51', items: MET6283 })).toEqual([])
  })

  it('ítem de servidumbre distinto de la sección B → aviso con ambas cifras', () => {
    const items = [item('Terreno', 'Terreno', '1402.35'), item('Terreno', 'SERVIDUMBRE de tránsito', '3600')]
    const avisos = avisosCoherenciaTerreno({ supTerreno: '5024.86', servidumbreM2: '3622.51', items })
    expect(avisos).toHaveLength(1)
    expect(avisos[0]).toContain('3.600,00 m²')
    expect(avisos[0]).toContain('3.622,51 m²')
  })

  it('ítem de terreno que no descuenta la servidumbre → aviso con el terreno útil esperado', () => {
    const items = [item('Terreno', 'Terreno', '5024.86'), item('Terreno', 'Servidumbre', '3622.51')]
    const avisos = avisosCoherenciaTerreno({ supTerreno: '5024.86', servidumbreM2: '3622.51', items })
    expect(avisos).toEqual([
      'Revisa la superficie del ítem de terreno: suma 5.024,86 m² y el terreno menos la servidumbre de la sección B es 1.402,35 m².',
    ])
  })

  it('sin servidumbre, el ítem de terreno se compara contra el terreno completo', () => {
    expect(avisosCoherenciaTerreno({ supTerreno: '320', servidumbreM2: '', items: [item('Terreno', 'Lote', '320')] })).toEqual([])
    expect(avisosCoherenciaTerreno({ supTerreno: '320', servidumbreM2: '', items: [item('terreno', 'Lote', '300')] })).toHaveLength(1)
  })

  it('sin dato en B o sin ítems de terreno no hay nada que comparar', () => {
    expect(avisosCoherenciaTerreno({ supTerreno: '', servidumbreM2: '', items: MET6283 })).toEqual([])
    expect(avisosCoherenciaTerreno({ supTerreno: '5024.86', servidumbreM2: '3622.51', items: [] })).toEqual([])
    expect(avisosCoherenciaTerreno({ supTerreno: '5024.86', servidumbreM2: '3622.51', items: [item('Terreno', 'Terreno', '')] })).toEqual([])
  })

  it('diferencias de redondeo menores a 0,005 m² no avisan', () => {
    expect(avisosCoherenciaTerreno({ supTerreno: '5024.86', servidumbreM2: '3622.51', items: [item('Terreno', 'Terreno', '1402.352')] })).toEqual([])
  })
})
