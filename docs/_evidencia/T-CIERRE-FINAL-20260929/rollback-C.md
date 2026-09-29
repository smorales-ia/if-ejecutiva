# Rollback Agente C — fix motor CI-057 en C_Formulas (29-sep-2026)

Tabla: `C_Formulas` (`tblNFa454fBbqRB3t`) · Base `app9G7lLkIV3CpeLa`.
Estado leído por API el 29-sep-2026 ANTES de escribir (coincide 1:1 con los
snapshots del 28-sep `docs/_evidencia/T-PDF-IDENTICO-20260927/snap-formula-*-pre.json`).

## Estado original de las 2 filas a PATCHear

### recFcpOeKjXNunBlj — F_UFm2_promedio (formula_id 108)

- `version`: `v3.2`
- `expresion`:
  ```
  n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna
  ```
- `ultima_modificacion` pre: `2026-09-27T17:09:13.000Z`

### recliyqVJAGatkDw0 — F_DesviacionVsPromedio (formula_id 143)

- `version`: `v1.0`
- `expresion`:
  ```
  (n_comparables > 0 && promedio_uf_m2_muestra > 0 && sup_construccion_m2 > 0) ? ((valor_comercial_uf / sup_construccion_m2) / promedio_uf_m2_muestra - 1) * 100 : 0
  ```
- `ultima_modificacion` pre: `2026-09-27T17:09:22.000Z`

## Plan de revert

1. **PATCH** a cada fila restaurando `expresion` y `version` con los valores de arriba:
   ```
   PATCH https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblNFa454fBbqRB3t/{recId}
   { "fields": { "expresion": "<valor original>", "version": "<valor original>" } }
   ```
2. **DELETE** de las 2 filas nuevas creadas por este fix (IDs anotados abajo al crearlas):
   ```
   DELETE https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblNFa454fBbqRB3t/{recId}
   ```
   Alternativa mínima: PATCH `activa: false`.
3. La regla activa `recYEf9XepX4SmLnH` (C_ReglasNegocio) **no fue modificada** — nada
   que revertir ahí.

## Record IDs de las filas NUEVAS (anotar inmediatamente tras el CREATE)

- `F_DesviacionVsPromedioCBR` v1.0: **`recJvE7OEFjVoPbKN`**
- `F_UFm2_promedio_CBR` v1.0: **`recRN9jkhgc6UvfIR`**

Aplicado el 29-sep-2026: los 2 PATCH y los 2 CREATE respondieron 200.
Snapshots post: `snap-formula-{promedio,desviacion,desviacion-cbr,promedio-cbr}-post.json`
(expresiones verificadas EXACTAS contra fix-motor-preparado.md §2).

## Nota sobre la regla activa (recYEf9XepX4SmLnH)

`C_Formulas.C_ReglasNegocio` es el link **simétrico inverso** de
`C_ReglasNegocio.formulas_resultado`. Al crear las 2 filas nuevas con los mismos 9
links de regla que la fila 143 (prescrito por el fix), Airtable las agregó sola a
`formulas_resultado` de las 9 reglas, incluida la activa (verificado por API: n=17).
La regla NO se editó directamente y el revert es automático: el DELETE de las filas
nuevas las quita del link.
