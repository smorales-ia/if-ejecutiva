# REGRESIÓN · CASO 5 (HEV-3183) · espejo VÍA MOTOR · 2026-10-05

**Solicitud sandbox:** `recoZcwmgCBVKQMxF` · `VP-2026-0077` · `numero_solicitud="HEV -3183"` ·
estado final **`calculada`** (transicionado por AT03, no a mano) · regla aplicada por AT01:
`rec2QYP8yjMW1Smsm` (REGLA_REFI_DEPTO_V32, set de 13 terminales v32 + promedios).
**TX_Calculos: 17 filas escritas por el motor** (evento `at03_dag_completo`
"AT03_v31 EJECUTOR 17/17 OK" en A_Eventos; **cero aborts** H3/H5/H6/H7).

Se sembraron SOLO ENTRADAS (1 solicitud + 1 datosTasacion + 3 ítems del cuadro + 6 comparables
[5 Of + 1 CBR] + 6 habitaciones + 1 doc legal + 16 fotos). H_PreciosUF 2026-05-12 ya existía
(la creó el Caso 2 con los mismos valores 40290.47/894.25 — misma fecha de visita) y NO se tocó.

**Casos de borde propios de este caso (vs. el piloto):**
- **Avalúo fiscal "NO REGISTRA" (RN-37)**: se sembró `avaluo_fiscal_clp` VACÍO +
  `avaluo_no_registra=TRUE` + `avaluo_total_raw="NO REGISTRA"` (+ `avaluo_fiscal_texto`).
  El motor NO se cayó: `avaluo_fiscal_uf = 0` (|| 0 del DAG), igual que la Portada del
  XLSM (BG74=0). El render imprime `0,00` donde el oráculo imprime el literal
  "NO REGISTRA" — gap de render documentado en overrides-caso5.md §2.
- **Seguro ≠ VC**: DB51=0.8 en el XLSM → seguro = 0.8×VC (3087,128), necesitó
  `valor_seguro_override` (gap NUEVO, overrides-caso5.md §2).
- **Cuadro con 3 ítems** incl. Terraza (trampa del ×0.5 de la fórmula `valor_uf`, evitada
  sembrándola como Edificación igual que el XLSM) y Estacionamiento como `OO.CC.`.
- **Propietario ≠ solicitante** (Inmobiliaria Exequiel Fernández Torre Tres SpA vs Carlos
  Andrés Cortes Pérez) — destapó un gap de ensamblador (overrides-caso5.md §3).

## Auditoría dato-por-dato (contexto in-process `construirInformeContexto` vs oráculo XLSM/PDF)

Resultado: **42/42 PASS = 100% igualdad** (`caso5-audit.json`). Terminales leídos de las filas
que escribió AT03.

| Check | Esperado (oráculo) | Obtenido (motor/ensamblador) | Delta | OK |
|---|---|---|---|---|
| Nº interno | HEV -3183 (Portada BH2) | HEV -3183 | 0 | ✅ |
| N° solicitud mandante | 25678 (FICHA K13, impreso en Portada) | 25678 | 0 | ✅ |
| Cliente | Hipotecaria Evoluciona | Hipotecaria Evoluciona | 0 | ✅ |
| Solicitante · RUT | Carlos Andrés Cortes Pérez · 0 (hueco de oráculo: PDF imprime 0) | idem | 0 | ✅ |
| Comuna / Tipo | La Florida / Departamento | idem | 0 | ✅ |
| Rol SII | 31-516 | 31-516 | 0 | ✅ |
| Sup. construcción | 47,61 m² (41,08 + 6,53) | 47.61 | 0 | ✅ |
| Año construcción | 2026 (nuevo) | 2026 | 0 | ✅ |
| Estado conservación | NUEVO - S/USO | NUEVO - S/USO | 0 | ✅ |
| Vida útil | 70 (BJ37) | 70 | 0 | ✅ |
| Valor comercial UF (AP69) | 3.858,91 | 3858.91 | 0 | ✅ |
| Valor comercial CLP (AY69) | 155.477.297,5877 | 155477297.5877 | 0 | ✅ |
| Valor reposición UF (BG72) | 3.167,128 | 3167.128 | 0 | ✅ (vía `valor_reposicion_override` — gap CONOCIDO del Caso 2) |
| Valor reposición CLP (BL72) | 127.605.075,67 | 127605075.67016001 | 0 | ✅ |
| Seguro incendio UF (BG73 · DB51=0.8) | 3.087,128 | 3087.128 | 0 | ✅ (vía `valor_seguro_override` — gap NUEVO) |
| Seguro incendio CLP (BL73) | 124.381.838,07 | 124381838.07016002 | ~0 | ✅ |
| Avalúo fiscal UF (BG74 · NO REGISTRA) | 0 | 0 | 0 | ✅ |
| Avalúo fiscal USD (RN-37 → null) | null | null | 0 | ✅ |
| Valor remate UF (BG77 · 0.65) | 2.508,2915 | 2508.2915 | 0 | ✅ |
| Valor remate CLP (BL77) | 101.060.243,432 | 101060243.43200499 | ~0 | ✅ |
| Liquidación UF (BG78 · 0.825) | 3.183,60075 | 3183.6007499999996 | 0 | ✅ |
| Liquidación CLP (BL78) | 128.268.770,51 | 128268770.50985248 | 0 | ✅ |
| UF día (AQ71) | 40.290,47 | 40290.47 | 0 | ✅ |
| Dólar día (BO71) | 894,25 | 894.25 | 0 | ✅ |
| Cuadro total UF / nº ítems | 3.858,91 / 3 | 3858.91 / 3 | 0 | ✅ (valor_uf es fórmula de la tabla: 41,08×78 + 6,53×39 + 1×400) |
| Renta perpetua (BJ44 · tasa 4,5%) | 156.444.444,44 | 156444444.44444445 | 0 | ✅ |
| Ingreso líquido anual (BJ43) | 7.040.000 | 7040000 | 0 | ✅ |
| TASACIÓN UF/m² (AX35, excl. OO.CC.) | 72,6509 | 72.65091367359798 | 0 | ✅ |
| OO.CC. fila TASACIÓN (AR35) | 400 | 400 | 0 | ✅ |
| Promedio UF/m² ofertas (AX34) | 75,3354 | 75.33539653491272 | 0 | ✅ |
| Promedio UF/m² CBR (AX42) | 66,3462 | 66.34615384615384 | 0 | ✅ |
| Ajuste ofertas (AX36) | −3,56% | −3.5634 | ~0 | ✅ |
| Ajuste CBR (AX44) | +9,50% | +9.5028 | ~0 | ✅ |
| Nº comparables | 6 (5 Of + 1 CBR) | 6 | 0 | ✅ |
| Fotos grilla / ranuras | 16 · fachada/ref1/mapaUbicacion | 16 · set | 0 | ✅ |

## PDF (render directo Carbone v5, patrón probado de los Casos 1-2)

- `pdf-caso5.pdf` · **11 páginas** · 793 KB · **0 marcadores `{d.}` sin resolver**.
- Valores clave presentes en el texto: HEV -3183, Hipotecaria Evoluciona, Carlos Andrés
  Cortes Pérez, 25678, Exequiel Fernandez, La Florida, 31-516, 3.858 / 155.477 / 3.167 /
  3.087 / 2.508 / 3.183, UF 40.290,47, US$ 894,25, NUEVO - S/USO, DFL-2 SI,
  **"TASACION V/S PROMEDIO −4%"** y **"+10%"** (idénticos a los redondeos del PDF oráculo),
  renta perpetua 156.444.444 e ingreso 7.040.000.
- ⚠ **11 pp vs 8 pp del oráculo**: mismo spill de la sección de fotos de los Casos 1-2
  (layout de la plantilla v5, no contenido — sistémico, no se arregla aquí).
- ⚠ Dos líneas de Portada difieren del oráculo por gaps de render (no de datos):
  Propietario/RUT Prop. y el literal "NO REGISTRA" del avalúo — ver overrides-caso5.md §2-3.
- Cadena E2→E3: E2 aceptó el payload (webhook OK) pero E3 no escribió `pdf_final_url` en
  ~170 s de poll (DocGen=0) — **igual que Casos 1 y 2**. No bloqueante: el render directo
  es el espejo. No se tocaron escenarios Make.

## Visibilidad UI (paso 9)

- Asignada a **nutricionsaludketo** (`recTJcV3BIvdcG4em`) desde el alta; visador Héctor
  Martínez C. (`recrjQDympldI186S`, el del PDF oráculo); estado `calculada` →
  `informeDisponible` ✓.
- URL informe (producción): `https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF/informe`
  — sin sesión Clerk responde 404 (misma respuesta que la URL del Caso 2 ya validada en UI:
  la ruta `app/tasaciones/[id]/informe/page.tsx` existe y exige la cuenta del tasador §12).
