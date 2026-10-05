# OVERRIDES · CASO 4 (HIPOTECARIA SECURITY -6073) · ¿el motor cuadró solo? · 2026-10-05

**Respuesta corta: el motor cuadró 10 de 13 terminales SIN overrides numéricos.
Hicieron falta TRES (3) overrides: UNO legítimo especificado (NRB-01, tasa) y DOS
por gaps de fórmula** (reposición — el mismo del Caso 2 — y seguro — variante nueva
del mismo defecto, visible aquí porque DB51=0,8 y no 1,0). Auditoría:
`override_motivo` y `override_autor` poblados en la solicitud; AT03 los loggeó en
`at03_dag_completo` (`overrides[... repo=902.88 ... tasa=0.055]`).

## 1. `tasa_cap_rate_override = 0.055` — OVERRIDE LEGÍTIMO (NRB-01), NO gap

- El oráculo exige **TASA 5,5%** (Portada BJ41=0.055 → renta perpetua BJ44 =
  2.750.000/0,055 = $50.000.000). El default del cliente en M_Clientes es **4,5%**
  (recVTKsZLNSDNInky.tasa_cap_rate=0.045, igual en los 2 duplicados).
- **Motor v2.7 · NRB-01** especifica exactamente este caso: *"Las Rejas: 5,5% en
  lugar de 4,5% · Auditado en A_Cambios"*. El override por-solicitud es el
  mecanismo previsto; el DAG lo aplica con precedencia override > datos_tasacion >
  cliente (AT03 línea `tasaCapRateEfectivo`) y gracias a él el guard H5 no aborta.
- Resultado: renta perpetua $50.000.000 e ingreso líquido $2.750.000 EXACTOS.
  **Comportamiento especificado — no cuenta como gap.**

## 2. `valor_seguro_override = 857.736` — GAP DE FÓRMULA (nuevo respecto del Caso 2)

- El XLSM aplica el **factor seguro 0,8 POR ÍTEM** (Portada DB51=0.8: BO51 =
  0,8×974,7 = 779,76 · BO52 = 0,8×97,47 = 77,976 · total BG73 = **857,736**).
- `F_SeguroIncendioUF` v3.3 desplegada (leída de C_Formulas, tblNFa454fBbqRB3t):
  `valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ?
  valor_seguro_base_items_uf : valor_comercial_uf * factor_seguro)` — con cuadro
  poblado usa `valor_seguro_base_items_uf` (= valor pleno de los ítems, 1072,17)
  **sin aplicar factor alguno**. Habría dado **1072,17 ≠ 857,736**.
- En el Caso 2 esto no se vio porque su DB51 era **1,0** (seguro = valor pleno) y
  el hallazgo quedó registrado como "a favor". El Caso 4 demuestra que era
  **suerte del dato, no diseño**: cuando el factor del formato es ≠1, la rama
  `hay_cuadro` lo omite. Ni siquiera usa `factor_seguro` de M_Clientes (que además
  aquí vale 0,825 en el canónico — tampoco coincidiría con el 0,8 del XLSM).
- **Gap sistémico** (candidato: `valor_seguro_base_items_uf × factor_seguro` o un
  factor por-ítem); mientras no se corrija C_Formulas, todo caso con DB51≠1
  necesitará este override.

## 3. `valor_reposicion_override = 902.88` — GAP DE FÓRMULA (EL MISMO del Caso 2)

- El XLSM calcula **Reposición = factor_garantía (0,8) × edificación a-nuevo**
  (a-nuevo CC70 = 27×38 + 5,4×19 = 1128,6 → 0,8×1128,6 = **902,88**, Portada BG72).
- `F_ValorReposicionUF` v3.3 calcula a-nuevo **sin el factor**:
  `valor_edificacion_nuevo_items_uf + valor_occ_items_uf` → habría dado **1128,6**.
- No es gap de dato maestro (factor_garantia=0.8 está bien en M_Clientes): es la
  fórmula. Idéntico al Caso 2 (AGH: 0,8×1394=1115,2) y al Caso 1 (MetLife).
  Confirmado sistémico en 3 de 3 instituciones distintas.

## 4. Decisiones de dato (no numéricas) — gaps de ruteo/maestros/modelo

| Decisión | Por qué | Gap |
|---|---|---|
| `tipo_informe = Refinanciamiento` (recreojxTjoAWOEHa) y no "Crédito Hipotecario" (el PDF oráculo) | Mismo motivo del Caso 2: AT01 solo rutea a REGLA_REFI_DEPTO_V32 (13 terminales v32 que consume el ensamblador); "Crédito Hipotecario" no existe en M_TiposInforme ni tiene regla V32. | **GAP DE RUTEO** (sistémico, ya documentado en overrides-caso2.md). |
| Cliente `recVTKsZLNSDNInky` ("Hipotecaria Security S.A.") | Es el que linkea la vieja VP-2026-0007 y su nombre coincide EXACTO con el Mandante del XLSM (Portada F5) → portada correcta. | **GAP DE MAESTRO**: M_Clientes tiene TRES records Security — "Hipotecaria Security" (recXVtuMT2wjIVzz2 · fs=0.8 fg=0.8 tasa=0.045), "Hipotecaria Security S.A." (recVTKsZLNSDNInky · fs=0.825 fg=0.8 tasa=0.045) y "SECURITY PRINCIPAL" (recSi2XsxHtByImuI · fs=0.825 fg=0.8 tasa=0.045). Duplicado triple, ninguno con la tasa 5,5% del oráculo (que es per-proyecto NRB-01, no per-cliente). No se tocó ninguno. |
| `nro_interno` se dejó VACÍO | TRAMPA del piloto: AT03 escribe `TX_Calculos.solicitud_codigo = nro_interno \|\| codigo_solicitud` y el ensamblador busca por `codigo_solicitud`. El Nº interno del PDF sale de `numero_solicitud`. | Respetada — terminales encontrados (17/17). |
| `cliente_final_nombre = PATRICIO ADRIAN TORO NIEVAS` (solicitante) y la propietaria real (IRMA ELENA ALZAMORA RIVEROS · 7.922.771-4) solo en TX_DatosTasacion | El contexto del informe tiene UN solo slot de persona (`partes.propietario ← cliente_final_nombre`; el ensamblador no lee `propietario_nombre`). El PDF oráculo distingue Cliente ≠ Propietaria (Hoja 1 fila Cliente / fila Propietario). | **GAP DE MODELO** (detalle en desviacion-caso4.md §hallazgo). |
| `vida_util_override = 65` | Vida útil remanente del oráculo (BJ37). Solo vista/informe. | Menor. |
| `datosTasacion.tasa_cap_rate = 0.055` (además del override) | Coherencia del dato almacenado con el oráculo; la precedencia v32 ya la cubría el override. | Menor. |

## 5. Hallazgo repetido: AT03 desplegado ≠ artefacto del repo (per-block comparables)

Igual que en el Caso 2: `desviacion_vs_promedio_pct`, `desviacion_vs_promedio_cbr_pct`
y `promedio_uf_m2_cbr_out` escritas por el motor valen **0**, y
`promedio_uf_m2_muestra` salió **37.3292** (promedio COMBINADO de los 6 comparables,
no 38.8691 del bloque ofertas). El AT03 desplegado es anterior al v32-b1 del repo
(CI-057). **No afecta al PDF** (el ensamblador calcula −14,86% / +11,68% por bloque
desde TX_Comparables). Candidato a re-paste del script en la UI de Airtable (paso
manual de Sergio).
