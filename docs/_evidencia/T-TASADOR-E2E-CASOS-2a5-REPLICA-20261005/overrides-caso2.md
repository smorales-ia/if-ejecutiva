# OVERRIDES · CASO 2 (AGH-1548) · ¿el motor cuadró solo? · 2026-10-05

**Respuesta corta: el motor cuadró 12 de 13 terminales SIN overrides. Hizo falta UN (1)
override numérico** (`valor_reposicion_override = 1115.2`). Cada override/decisión = gap:

## 1. `valor_reposicion_override = 1115.2` — GAP DE FÓRMULA (v32 vs XLSM)

- El XLSM (las 5 instituciones, verificado en AGH y MetLife) calcula
  **Reposición = factor_garantía (0.8) × edificación a-nuevo + OO.CC.** (AGH: 0.8×41×34 =
  1115,2 · Portada BG72; MetLife caso 1: 0.8×4080+100 = 3364).
- `F_ValorReposicionUF` v32 calcula **a-nuevo SIN el factor**: `valor_edificacion_nuevo_items_uf
  + valor_occ_items_uf` → habría dado **1394**.
- No es un gap de dato maestro (M_Clientes.factor_garantia=0.8 está bien): es la **fórmula** la
  que no aplica el factor. **Afecta a los casos 3–5 igual** → o se corrige C_Formulas
  (F_ValorReposicionUF × factor_garantia) o cada caso necesitará este override.
- Auditoría: `override_motivo` y `override_autor` poblados en la solicitud.

## 2. Seguro/garantía ×1.0: NO necesitó override (hallazgo a favor)

La hipótesis de entrada era que M_Clientes AGH (factor_seguro=0.8) chocaría con el oráculo
(seguro = 1.0×VC, Portada DB51=1.0). **No chocó**: con cuadro poblado, `F_SeguroIncendioUF`
usa `valor_seguro_base_items_uf` (fórmula `valor_seguro_item_uf` de TX_ItemsCuadroValoracion
= valor del ítem salvo Terreno/Estac/S-Reg) = 1394, ignorando `factor_seguro` del cliente.
El factor 0.8 de M_Clientes solo jugaría en el fallback sin cuadro.

## 3. Decisiones de dato (no numéricas) que fueron necesarias — gaps de ruteo/maestros

| Decisión | Por qué | Gap |
|---|---|---|
| `tipo_informe = Refinanciamiento` (recreojxTjoAWOEHa) y no "Crédito Hipotecario" (el PDF oráculo) ni "Mutuo Hipotecario" (lo que usó el Caso 1) | AT01 solo rutea a las reglas **V32** (13 terminales que consume el ensamblador) si el tipo matchea `REGLA_REFI_*_V32`. Con Mutuo Hipotecario cae a `Regla_Wildcard_Default` → set **v31** (`valor_seguro_uf`, `renta_perpetua_uf`, sin `*_clp`) y el informe quedaría sin terminales. VP-0067 (el camino probado) también es Refinanciamiento. | **GAP DE RUTEO**: "Crédito Hipotecario" no existe en M_TiposInforme ni tiene regla V32. Sistémico para los casos 3–5: usar Refinanciamiento (casos 2,4,5) / revisar Leasing (caso 3: `Regla_AustralLeasing…` existe pero apunta al set v31 y exige tipo_propiedad Casa). |
| Cliente `recX80z73mCtC4BBo` (Agencia Habitacional) y no el que linkea la solicitud vieja VP-2026-0004 (`rec8K5fUpTEoxD9yS` = "AGENCIA", fs=0.825 fg=0.8 tasa=0.045) | El legacy "AGENCIA" tiene la tasa mal (4,5% vs 6,0% del oráculo) y el nombre de portada incorrecto. | **GAP DE MAESTRO**: M_Clientes tiene un duplicado legacy de AGH. No se tocó ninguno de los dos. |
| `nro_interno` se dejó VACÍO | AT03 escribe `TX_Calculos.solicitud_codigo = nro_interno \|\| codigo_solicitud` y el ensamblador busca por `codigo_solicitud`. Si se pobla `nro_interno` (p.ej. "AGH -1548"), el informe NO encuentra los terminales. | **TRAMPA DE CONTRATO** a respetar en los casos 3–5 (el Nº interno del PDF sale de `numero_solicitud`, no de `nro_interno`). |
| `vida_util_override = 40` | Vida útil remanente del oráculo (BJ37). Solo alimenta la vista/informe; ninguna fórmula V32 la consume. | Menor. |

## 4. Hallazgo adicional: AT03 desplegado ≠ artefacto del repo (per-block comparables)

Las filas `desviacion_vs_promedio_pct`, `desviacion_vs_promedio_cbr_pct` y
`promedio_uf_m2_cbr_out` que escribió el motor valen **0**, y `promedio_uf_m2_muestra` salió
**35.0812** (promedio COMBINADO de los 7 comparables, no 35.7637 del bloque ofertas). Eso
indica que el AT03 desplegado en Airtable es anterior al v32-b1 del repo
(`docs/_artefactos/airtable/AT03_Calculos_DAG.js`, que separa ofertas/CBR — CI-057): en el
SCOPE desplegado `n_ofertas`/`promedio_uf_m2_ofertas` no existen y evalúan 0.
**No afecta al PDF** (el ensamblador calcula los % por bloque desde TX_Comparables: −4,93% y
+1,87% correctos), pero esas filas de TX_Calculos quedan inservibles. Sistémico casos 3–5;
candidato a re-paste del script en la UI de Airtable (paso manual de Sergio).
