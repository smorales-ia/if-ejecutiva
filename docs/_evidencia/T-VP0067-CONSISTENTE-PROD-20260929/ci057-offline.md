# CI-057 · Validación OFFLINE de la aritmética corregida — VP-2026-0067

Tanda **T-VP0067-CONSISTENTE-PROD-20260929** · FASE 2 · Agente C (OLA 1) · 29-sep-2026.
Corrida 100 % local: cero llamadas a Airtable/Make, cero escrituras a producción.

## 1. Harness / script usado

No se ejecutó `at03-harness-dry.mjs` (requiere red contra Airtable; el mandato de esta
corrida es offline). En su lugar:

- **Script ad-hoc**: `/tmp/ci057-offline.mjs` (fuera del repo, Node — misma semántica
  IEEE-754 double que el motor). Transcribe **fiel** la aritmética del motor real:
  - `sumComparables` de `docs/_artefactos/airtable/AT03_Calculos_DAG.js` (líneas
    1044-1089): homologación `ufm2C = (precio − uf_m2_terreno_f × sup_terreno − oo_cc) / sup_construccion`,
    promedio **por bloque** (Oferta / CBR).
  - `uf_m2_construccion_tasacion = cuadro.edif / sup_construccion` (líneas 1258-1259).
  - Las 4 expresiones corregidas de C_Formulas, carácter a carácter desde los snapshots
    post-fix (`docs/_evidencia/T-CIERRE-FINAL-20260929/snap-formula-*-post.json`,
    `ultima_modificacion` 2026-09-29T15:17Z).
- **Oráculo de contraste**: la corrida en seco del motor REAL post-fix
  (`docs/_evidencia/T-CIERRE-FINAL-20260929/harness-motor-output.txt`, 29-sep 15:19,
  escrituras interceptadas) y el criterio del ensamblador
  (`lib/informe/ensamblador.ts` + `lib/informe/fila-tasacion.ts`, `promedioSinCeros`
  XLSM `Portada!AX34/AX42`).

## 2. Datos de entrada (espejo MET-6283, TX_Comparables reales)

Fuente: `docs/_evidencia/T-PDF-IDENTICO-20260927/contexto-real-v2.json` (los 7
comparables reales de VP-2026-0067, con terreno — el enunciado sólo traía UF/supC/OOCC).

| # | tipo | precio UF | sup T | sup C | UF/m² T | OO.CC. | ufm2C homologado |
|---|---|---|---|---|---|---|---|
| 1 | Oferta | 20000 | 5051 | 239 | 2.2 | 750 | 34.049372384937236 |
| 2 | Oferta | 24900 | 5077 | 239 | 3.1 | 750 | 35.19372384937238 |
| 3 | Oferta | 19500 | 5001 | 252 | 2.0 | 500 | 35.70634920634921 |
| 4 | Oferta | 23900 | 5012 | 258 | 3.0 | 750 | 31.449612403100776 |
| 5 | Oferta | 18900 | 5000 | 264 | 2.0 | 500 | 31.818181818181817 |
| 6 | CBR | 20500 | 5002 | 250 | 2.7 | 700 | 25.178399999999993 |
| 7 | CBR | 18000 | 5013 | 360 | 1.8 | 700 | 22.990555555555556 |

Los 7 `ufm2C` reproducen exactamente los `uf_m2_construccion_f` que Airtable calcula
por fórmula (columna `ufM2Construccion` del contexto real) — el criterio de homologación
coincide entre motor, fórmula Airtable y ensamblador.

Cuadro de valoración: `edif = 8157.0624` UF (edificación depreciada, `Portada!BD59`) ·
`sup_construccion_m2 = 249.91` → `uf_m2_construccion_tasacion = 32.64` (exacto en double).
**Control del bug viejo**: `valor_comercial_uf / sup = 20125.8624 / 249.91 = 80.5324…`,
que contra el promedio combinado stale 30.9123 da el 160.52 erróneo — confirmada la
causa del valor stale.

## 3. Números obtenidos (contraste dígito a dígito)

| Fórmula | Offline (/tmp/ci057-offline.mjs) | Motor real en seco (29-sep 15:19) | Match |
|---|---|---|---|
| F_UFm2_promedio (`promedio_uf_m2_ofertas`) | 33.643447932388284 | 33.643447932388284 | ✅ bit a bit |
| F_DesviacionVsPromedio | -2.9825954058123494 | -2.9825954058123494 | ✅ bit a bit |
| F_UFm2_promedio_CBR (control) | 24.084477777777774 | 24.084477777777774 | ✅ bit a bit |
| F_DesviacionVsPromedioCBR (control) | 35.52297168808127 | 35.52297168808127 | ✅ bit a bit |

Redondeos del enunciado: 33.6434 (4 dec) ✅ · -2.98 (2 dec) ✅ · 24.0845 ✅ · 35.52 ✅.

**Nota de redondeo (importante para el patch)**: las filas de TX_Calculos guardan el
float **completo**, no el redondeado — la fila stale tiene
`resultado = 30.912313602499562` (15+ dígitos). Los valores a escribir son por tanto
**33.643447932388284** y **-2.9825954058123494**; «33,6434» y «-2,98» son sólo el
render a 4/2 decimales. Escribir los redondeados rompería la coherencia
`resultado ↔ notas ↔ inputs_json.__resultado__`.

## 4. Payload PATCH recomendado por fila

Tabla `TX_Calculos` = `tblFz37KSvn5pLKDR`. Un PATCH por registro
(`PATCH https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblFz37KSvn5pLKDR/{recordId}`).
Los valores salen **verbatim** de lo que el motor real habría escrito (DRY-WRITE 3 y 18
del harness en seco post-fix); `calculado_en` conserva el timestamp de esa corrida para
trazabilidad. No se tocan `solicitud`, `formula`, `formula_nombre`, `variable_output`
(sigue `promedio_uf_m2_muestra` / `desviacion_vs_promedio_pct` — así quedó la fórmula
post-fix), `solicitud_codigo`, `version_motor` ni `calculo_id`.

### Fila 1 — `recJBJQdcuodR7Kxd` (F_UFm2_promedio)

```json
{
  "fields": {
    "resultado": 33.643447932388284,
    "valor_calculado": 33.643447932388284,
    "numero_resultado": 33.643447932388284,
    "formula_version": "v3.3",
    "formula_expresion_snapshot": "n_ofertas > 0 ? promedio_uf_m2_ofertas : (n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna)",
    "notas": "RES=33.643447932388284|nota=eval_ok|expr=n_ofertas > 0 ? promedio_uf_m2_ofertas : (n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna)",
    "inputs_json": "{\"anio_actual\":2026,\"anio_construccion\":2024,\"sup_construccion_m2\":249.91,\"sup_terreno_m2\":5024.86,\"material\":\"ALBAÑILERÍA LADRILLO\",\"calidad\":\"BUENA\",\"velocidad_venta_estimada\":\"8 a 10 meses\",\"coef_estado\":0.95,\"coef_tipo\":1,\"factor_seguro\":1,\"factor_garantia\":0.8,\"tasa_cap_rate_efectivo\":0.045,\"uf_m2_terreno_comuna\":17,\"lookup_precio_unitario\":22,\"lookup_vida_util\":70,\"lookup_factor_remate\":0.65,\"override_tasa_cap_rate\":0,\"override_vida_util\":70,\"override_valor_final\":0,\"override_valor_reposicion\":0,\"override_valor_garantia\":0,\"__resultado__\":33.643447932388284}",
    "calculado_en": "2026-09-29T15:19:52.122Z"
  }
}
```

### Fila 2 — `recOQzPNt1uZEmSls` (F_DesviacionVsPromedio)

```json
{
  "fields": {
    "resultado": -2.9825954058123494,
    "valor_calculado": -2.9825954058123494,
    "numero_resultado": -2.9825954058123494,
    "formula_version": "v2.0",
    "formula_expresion_snapshot": "(n_ofertas > 0 && promedio_uf_m2_ofertas > 0 && uf_m2_construccion_tasacion > 0) ? (uf_m2_construccion_tasacion / promedio_uf_m2_ofertas - 1) * 100 : 0",
    "notas": "RES=-2.9825954058123494|nota=eval_ok|expr=(n_ofertas > 0 && promedio_uf_m2_ofertas > 0 && uf_m2_construccion_tasacion > 0) ? (uf_m2_construccion_tasacion / promedio_uf_m2_ofertas - 1) * 100 : 0",
    "inputs_json": "{\"anio_actual\":2026,\"anio_construccion\":2024,\"sup_construccion_m2\":249.91,\"sup_terreno_m2\":5024.86,\"material\":\"ALBAÑILERÍA LADRILLO\",\"calidad\":\"BUENA\",\"velocidad_venta_estimada\":\"8 a 10 meses\",\"coef_estado\":0.95,\"coef_tipo\":1,\"factor_seguro\":1,\"factor_garantia\":0.8,\"tasa_cap_rate_efectivo\":0.045,\"uf_m2_terreno_comuna\":17,\"lookup_precio_unitario\":22,\"lookup_vida_util\":70,\"lookup_factor_remate\":0.65,\"override_tasa_cap_rate\":0,\"override_vida_util\":70,\"override_valor_final\":0,\"override_valor_reposicion\":0,\"override_valor_garantia\":0,\"__resultado__\":-2.9825954058123494}",
    "calculado_en": "2026-09-29T15:19:52.179Z"
  }
}
```

## 5. Observaciones para el orquestador

1. **Drift de inputs_json**: las filas stale (27-sep) traen `anio_construccion: 2020` y
   `override_vida_util: 0`; la base al 29-sep tiene `2024` y `70` (así lo leyó el motor
   en seco). El `inputs_json` recomendado refleja la base actual — si se prefiere no
   tocar esos dos campos del snapshot, alternativa mínima: dejar `inputs_json` viejo y
   solo actualizar `__resultado__`, pero quedaría incoherente con lo que el motor
   escribiría hoy. Recomendación: usar los payloads de arriba tal cual.
2. `ultima_modificacion` es lastModifiedTime (se actualiza solo); `calculo_id` es
   autonumber (no tocar).
3. Las expresiones de los snapshots stale (`n_comparables > 0 ? promedio_uf_m2_muestra …`
   y la de `valor_comercial_uf / sup_construccion_m2`) quedan reemplazadas por las v3.3/v2.0
   — sin eso la fila diría una aritmética que ya no produce su `resultado`.
4. Quedan además **sin fila** en TX_Calculos los dos cálculos nuevos del fix
   (F_UFm2_promedio_CBR = 24.084477777777774 · F_DesviacionVsPromedioCBR =
   35.52297168808127): patchear las 2 filas stale deja consistente lo existente, pero no
   materializa los CBR — decisión del orquestador si crearlas (el motor en seco las
   habría creado como filas nuevas).
