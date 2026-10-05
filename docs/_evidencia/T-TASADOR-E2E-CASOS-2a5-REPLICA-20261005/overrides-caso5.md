# OVERRIDES · CASO 5 (HEV-3183) · ¿el motor cuadró solo? · 2026-10-05

**Respuesta corta: el motor cuadró 11 de 13 terminales SIN overrides. Hicieron falta DOS (2)
overrides numéricos**: `valor_reposicion_override = 3167.128` (gap CONOCIDO del Caso 2) y
`valor_seguro_override = 3087.128` (gap NUEVO, destapado por este caso). Cada override = gap:

## 1. `valor_reposicion_override = 3167.128` — GAP CONOCIDO (fórmula v32 vs XLSM)

- El XLSM calcula **Reposición = factor_garantía (0.8) × edificación a-nuevo + OO.CC.**
  (HEV: 0.8×3458,91 + 400 = 3167,128 · Portada BG72). Idéntico al AGH del Caso 2
  (0.8×1394=1115,2) y al MetLife del Caso 1 (0.8×4080+100=3364).
- `F_ValorReposicionUF` v32 calcula `valor_edificacion_nuevo_items_uf + valor_occ_items_uf`
  **sin el factor** → habría dado **3858,91**.
- Es EL MISMO gap de fórmula del Caso 2 (overrides-caso2.md §1), tercera confirmación:
  o se corrige C_Formulas (× factor_garantia en el término de edificación) o cada caso
  necesita este override. M_Clientes.factor_garantia=0.8 está bien (no es gap de maestro).

## 2. `valor_seguro_override = 3087.128` — GAP NUEVO (seguro con factor ≠ 1 y cuadro con Estac.)

- El XLSM aplica **DB51 = factor_seguro = 0.8 a TODO el cuadro, incluido el
  estacionamiento**: Seguro = 0.8 × VC total = 0.8 × 3858,91 = **3087,128** (Portada BG73;
  por fila: BO51=2563,392 · BO52=203,736 · BO53=320).
- El motor con cuadro poblado usa `valor_seguro_base_items_uf` = Σ `valor_seguro_item_uf`
  (fórmula de TX_ItemsCuadroValoracion: **0 si tipo ∈ {Estac. U/Goce, Estac. Desc, Terreno}
  o S/Reg No Regularizable; si no, el valor del ítem SIN factor**). Con el estacionamiento
  sembrado como `OO.CC.` habría dado **3858,91**; como `Estac. *`, 3458,91. Ninguno = oráculo.
- **Por qué no se vio en el Caso 2**: allí DB51=1.0 y el cuadro era 1 ítem Edificación →
  `valor_seguro_item_uf` coincidía por coincidencia (1394=1394). La lección del piloto
  («con cuadro poblado el motor ignora factor_seguro de M_Clientes») sigue siendo cierta —
  y es exactamente el problema cuando el factor del cliente NO es 1.0: ni la fórmula de la
  tabla ni `F_SeguroIncendioUF` lo aplican. Candidato a fix genérico en C_Formulas
  (× factor_seguro del cliente sobre la base del cuadro), sistémico para todo cliente con
  factor_seguro ≠ 1 (p.ej. Hipotecaria Security).
- Auditoría: `override_motivo` (ambos gaps) y `override_autor` poblados en la solicitud.

## 2b. Avalúo fiscal "NO REGISTRA" (RN-37) — el motor NO lo maltrata; el RENDER sí lo pierde

- **Entrada (RN-37, validada)**: `avaluo_fiscal_clp` vacío + `avaluo_no_registra=TRUE` +
  `avaluo_total_raw="NO REGISTRA"` (+ `avaluo_fiscal_texto`). Sin error de escritura.
- **Motor**: no aborta; el DAG hace `|| 0` → `avaluo_fiscal_uf = 0` — EXACTAMENTE lo que
  imprime la Portada del XLSM en la columna UF (BG74=0). El `|| 0` silencioso ya está
  tipificado como HP-B (PLAN §6); aquí es además el comportamiento correcto del espejo.
- **Ensamblador/plantilla — GAP**: el contexto solo expone `avaluoFiscalUf` (0) y
  `avaluoFiscalUsd` (null); **nadie lee `avaluo_no_registra` ni `avaluo_total_raw`**
  (grep en `lib/`: cero usos). El PDF nuestro imprime `Avalúo fiscal propiedad : 0,00`
  con las columnas US$/$ vacías; el oráculo imprime **"NO REGISTRA"** en la columna $
  (BL74/BN75). Gap de render P2: exponer el flag RN-37 en `InformeContexto` y mapearlo en
  la plantilla. No se tocó código ni plantilla (prohibido en este carril).

## 3. Decisiones de dato (no numéricas) necesarias — gaps de ruteo/maestros/contrato

| Decisión | Por qué | Gap |
|---|---|---|
| `tipo_informe = Refinanciamiento` (recreojxTjoAWOEHa) y no "Crédito Hipotecario" (el PDF oráculo) | Mismo ruteo del Caso 2: solo `REGLA_REFI_DEPTO_V32` produce los 13 terminales v32 que consume el ensamblador. AT01 la aplicó sola (regla `rec2QYP8yjMW1Smsm`). | **GAP DE RUTEO conocido** (overrides-caso2.md §3): "Crédito Hipotecario" no existe en M_TiposInforme ni tiene regla V32. |
| Cliente `recPDwixzybwHlJaQ` (Hipotecaria Evoluciona) y no el que linkea la vieja VP-2026-0006 (`rec8QDoxN3LGvYLcm` = "EVOLUCIONA") | El legacy tiene LOS MISMOS parámetros (fs=0.8 · fg=0.8 · tasa=0.045) — sin gap numérico — pero nombre de portada incorrecto ("EVOLUCIONA") y prefijo HEV duplicado. | **GAP DE MAESTRO**: M_Clientes tiene un duplicado legacy de Hipotecaria Evoluciona (como el "AGENCIA" del Caso 2, aunque aquí sin divergencia de parámetros). No se tocó ninguno de los dos. |
| `nro_interno` se dejó VACÍO | Trampa de contrato del piloto: si se pobla, `TX_Calculos.solicitud_codigo` deja de ser `codigo_solicitud` y el informe pierde los terminales. El Nº interno del PDF sale de `numero_solicitud`. | **TRAMPA CONOCIDA** respetada. |
| Terraza sembrada como `tipo_item='Edificacion'` (uf_m2=39) y NO como 'Terraza' | La fórmula `valor_uf` de TX_ItemsCuadroValoracion aplica **×0.5 extra** al tipo 'Terraza'; el XLSM ya trae la mitad en el precio unitario (39 = 78/2) y clasifica la fila como Edificación (Portada B52). Con 'Terraza' habría dado 127,34 en vez de 254,67 y el total/UF-m² de TASACIÓN se rompían. | **TRAMPA DE FÓRMULA nueva** a respetar en réplicas: el select 'Terraza' NO es un espejo del XLSM — asume precio unitario completo. |
| Estacionamiento sembrado como `tipo_item='OO.CC.'` y no `Estac. U/Goce`/`Estac. Desc` | (a) El XLSM lo suma en TOTAL OBRAS COMPLEMENTARIAS (BI60=400); (b) el ensamblador llena la columna OO.CC. de la fila TASACIÓN sumando tipos Piscina/OO.CC. (AR35=400 ✓); (c) no existe opción 'Estac. Cub'. Con `Estac. *` la columna OO.CC. del informe quedaba vacía. | **Hueco de vocabulario** del select `tipo_item` (sin 'Estac. Cub') + dependencia del mapeo OO.CC. del ensamblador. |
| `n_operacion_cliente = 25678` (FICHA K13) | La Portada del PDF oráculo SÍ imprime el folio del mandante ("N° SOLICITUD : 25678", p.2) además del Nº interno. (La vieja VP-2026-0006 tenía 4 = el "Nº CLIENTE" del XLSM — dato equivocado.) | Menor (precisión de espejo). |
| `vida_util_override = 70` | Vida útil remanente del oráculo (BJ37). Solo vista/informe. | Menor. |

## 3b. GAP NUEVO de ensamblador: Propietario ≠ solicitante se pierde en el informe

El oráculo distingue **Cliente/solicitante** (Carlos Andrés Cortes Pérez, RUT impreso 0) de
**Propietario** (Inmobiliaria Exequiel Fernández Torre Tres SpA · 77.294.373-3, Portada p.2).
Los datos se sembraron bien separados (`cliente_final_*` en TX_Solicitudes;
`propietario_nombre/propietario_rut` en TX_DatosTasacion). Pero
`construirInformeContexto` llena `partes.propietario`/`partes.rut` **solo** desde
`cliente_final_nombre`/`cliente_final_rut` y nunca lee `propietario_*` de TX_DatosTasacion
→ nuestra Portada imprime "Propietario: Carlos Andrés Cortes Pérez · RUT Prop.: 0" donde el
oráculo dice "Inmobiliaria Exequiel Fernández Torre Tres SpA · 77.294.373-3". Invisible en
los Casos 1-2 (solicitante = propietario); P2 de ensamblador (exponer `propietario_*` y
mapear las dos líneas de la plantilla). No se tocó código.

## 4. Corrección de ENTRADA post-seed (no es override): `sup_construida_piso1 = 47.61`

El primer render imprimió `DFL-2: NO` (oráculo: SI). Causa: `dfl2` es fórmula de
TX_DatosTasacion sobre `sup_construida_total` = piso1+piso2+subterráneo, y el seed solo
había poblado `sup_construccion_m2`. Se parchó la ENTRADA (Antecedentes!31: superficie
nivel 1 = 47,61 — dato real del oráculo) y se re-renderizó: `DFL-2: SI` ✓. Lección para
réplicas: `sup_construccion_m2` NO alimenta `dfl2`; hay que sembrar también
`sup_construida_piso1`.

## 5. Hallazgo repetido: AT03 desplegado ≠ artefacto del repo (per-block comparables)

Igual que en el Caso 2: las filas `desviacion_vs_promedio_pct`, `desviacion_vs_promedio_cbr_pct`
y `promedio_uf_m2_cbr_out` del motor valen **0**, y `promedio_uf_m2_muestra` salió **73.8372**
(promedio COMBINADO de los 6 comparables, no 75.3354 del bloque ofertas) → el AT03 desplegado
es anterior al v32-b1 del repo (CI-057). **No afecta al PDF** (el ensamblador calcula los %
por bloque: −3,56% y +9,50% correctos → −4%/+10% impresos). Candidato a re-paste del script
en la UI de Airtable (paso manual de Sergio). Tercera confirmación, sistémico.
