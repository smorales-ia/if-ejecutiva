# REGRESIÓN "NO ROMPE" · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005

**Fecha:** 2026-10-05 · **Pregunta:** ¿el fix de las 2 fórmulas rompió algo que ya estaba bien? **Respuesta: NO.**

## 1 · Caso patrón (VP-2026-0073 · MetLife · reczuns8NHdI45Owp) — INTACTO

Verificado por GET (solo lectura) el 2026-10-05 después de los PATCHes a C_Formulas (20:23:38Z):

- Record TX_Solicitudes: `estado=calculada`, `ultima_modificacion=2026-10-05T14:28:16Z` — **seis horas ANTES del fix**; nadie lo tocó ni lo recalculó.
- TX_Calculos: 15 filas (calculo_id 1522–1536), todas con `ultima_modificacion=2026-10-05T14:28:06Z` (pre-fix). Valores golden tal cual: `valor_comercial_uf=3323.2`, `valor_reposicion_uf=3364`, `seguro_incendio_uf=2658.56`, `valor_remate_uf=2160.08`, `valor_liquidacion_uf=2741.64`, `avaluo_fiscal_uf=2898.01`.
- Guarda estructural además de la temporal: el Caso 1 fue hand-seeded (override_motivo del record: "valores del XLSM La Marina sembrados directo, sin AT03") y AT03 solo corre en el trigger `estado='visitada'` — editar C_Formulas no dispara ningún recálculo. Y si algún día se recalculara, el ×0,8 nuevo es **condicional a sin-terreno**: una Casa con terreno queda fuera por diseño (fiel al XLSM `IF(AN61=0,…)`).

## 2 · Controles de factor 1,0 (C2 y C3) — SIN CAMBIO en el seguro

| Caso | Seguro pre-fix (réplica auditada) | Seguro post-fix | ¿Cambió? |
|---|---|---|---|
| C2 · VP-2026-0074 | 1.394 | 1.394 | NO ✅ |
| C3 · VP-2026-0075 | 1.024 | 1.024 | NO ✅ |

**Honestidad del control:** en ambos casos el valor post-fix viene de `valor_seguro_override` (no de la rama nueva), porque los maestros M_Clientes de AGH y ALH traen `factor_seguro=0.8` donde el oráculo exige 1,0 (G-7, dato erróneo — M_Clientes intocable en esta tanda y no existe `factor_seguro_override` en TX_Solicitudes). El control de que la RAMA nueva no rompe el caso factor-1,0 es entonces doble:
1. **Snapshot textual**: las filas de seguro de C2/C3 en TX_Calculos muestran la expresión NUEVA (`valor_seguro_base_items_uf * factor_seguro`) — desplegada y evaluable, cortada por la rama override que tiene precedencia (comportamiento preexistente, no alterado).
2. **Aritmética**: con el maestro saneado (fs=1,0), la rama nueva da base×1,0 = base — exactamente lo que el oráculo exige. La rama vieja daba lo mismo para factor 1,0: para estos casos el fix es inocuo por construcción.

## 3 · Lo demás que no debía moverse — NO SE MOVIÓ

- Los 17 terminales de C2/C3/C4/C5 post-fix son **idénticos** a los auditados en la réplica (tablas Esperado/Obtenido en `regresion-caso{2,3,4,5}.md`): tasación, garantía, remate, liquidación, avalúo, rentas, CLP. Lo único que cambió es el ORIGEN de reposición (4/4) y seguro (C5): antes override, ahora fórmula.
- Rutas legacy/Leasing: usan las fórmulas v3.1 (records distintos de C_Formulas) — no tocadas.
- Las fórmulas de campo del cuadro (`valor_seguro_item_uf`, exclusiones R6): no tocadas.
- M_Clientes, VP-0067, solicitudes reales: cero escrituras (solo GET).
- Deuda preexistente G-6 (desviaciones analíticas en 0, promedio combinado): sigue igual que antes del fix — no es de esta tanda y no empeoró (verificado en los 4 regresion-casoN.md).
