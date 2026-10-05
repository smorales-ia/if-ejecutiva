# REGRESIÓN · CASO 4 (HIPOTECARIA SECURITY -6073) · espejo VÍA MOTOR · 2026-10-05

**Solicitud sandbox:** `rectnGOaHvEioXZw3` · `VP-2026-0076` ·
`numero_solicitud="HIPOTECARIA SECURITY -6073"` · estado final **`calculada`**
(transicionado por AT03, no a mano) · regla aplicada por AT01: `rec2QYP8yjMW1Smsm`
(REGLA_REFI_DEPTO_V32, set de 13 terminales v32 + promedios).
**TX_Calculos: 17 filas escritas por el motor** (evento `at03_dag_completo`
"[COD=VP-2026-0076] AT03_v31 EJECUTOR 17/17 OK. overrides[final=0 repo=902.88 gar=0
tasa=0.055]"; cero aborts H3/H5/H6/H7). Motor calculó al **primer poll** (~14 s).

**Entradas sembradas (nada calculado):** 1 solicitud + 1 datosTasacion + 2 ítems
del cuadro (Depto 27 m² ×38 UF/m² + Terraza 5,4 m² ×19 UF/m², D.F. 0,95 ambos) +
6 comparables (5 ofertas + 1 CBR) + 6 habitaciones + 1 doc legal + 16 fotos +
H_PreciosUF 2026-03-13 (creado: `rec7I9BGQMsNzsRBe` · 39841.72 / 909.94).

## Auditoría dato-por-dato (contexto in-process `construirInformeContexto` vs oráculo XLSM/PDF)

Resultado: **37/37 PASS = 100% igualdad** (`caso4-audit.json`). Terminales leídos de
las filas que escribió AT03.

| Check | Esperado (oráculo) | Obtenido (motor/ensamblador) | Delta | OK |
|---|---|---|---|---|
| Nº interno | HIPOTECARIA SECURITY -6073 | HIPOTECARIA SECURITY -6073 | 0 | ✅ |
| Cliente (mandante) | Hipotecaria Security S.A. | Hipotecaria Security S.A. | 0 | ✅ |
| Cliente final · RUT | PATRICIO ADRIAN TORO NIEVAS · 13.918.055-0 | idem | 0 | ✅ (la propietaria IRMA ELENA ALZAMORA RIVEROS · 7.922.771-4 quedó en TX_DatosTasacion — ver desviacion-caso4.md) |
| Comuna / Tipo | Estación Central / Departamento | idem | 0 | ✅ |
| Rol SII | 7038-11 | 7038-11 | 0 | ✅ |
| Sup. construcción | 32,4 m² (27 + 5,4) | 32.4 | 0 | ✅ |
| Año construcción | 2015 (Portada AE8/T51) | 2015 | 0 | ✅ |
| Vida útil | 65 (BJ37) | 65 | 0 | ✅ |
| Valor comercial UF (AP69) | 1.072,17 | 1072.17 | 0 | ✅ (suma de los 2 ítems del cuadro — SIN override) |
| Valor comercial CLP (AY69) | 42.717.096,9324 | 42717096.9324 | 0 | ✅ |
| Valor reposición UF (BG72) | 902,88 | 902.88 | 0 | ✅ (vía `valor_reposicion_override` — gap v3.3, ver overrides-caso4.md) |
| Valor reposición CLP (BL72) | 35.972.292,1536 | 35972292.1536 | 0 | ✅ |
| Seguro incendio UF (BG73 · DB51=0.8) | 857,736 | 857.736 | 0 | ✅ (vía `valor_seguro_override` — gap v3.3 nuevo, ver overrides-caso4.md §2) |
| Seguro incendio CLP (BL73) | 34.173.677,54592 | 34173677.54592 | 0 | ✅ |
| Avalúo fiscal UF (BG74) | 678,4269 | 678.4269102839937 | 0 | ✅ |
| Valor remate UF (BG77 · 0.65) | 696,9105 | 696.9105 | 0 | ✅ |
| Valor remate CLP (BL77) | 27.766.113,00606 | 27766113.00606 | 0 | ✅ |
| Liquidación UF (BG78 · 0.825) | 884,54025 | 884.54025 | 0 | ✅ |
| Liquidación CLP (BL78) | 35.241.604,96923 | 35241604.96923 | 0 | ✅ |
| UF día (AQ71) | 39.841,72 | 39841.72 | 0 | ✅ |
| Dólar día (BO71) | 909,94 | 909.94 | 0 | ✅ |
| Cuadro total UF / ítems | 1.072,17 / 2 | 1072.17 / 2 | 0 | ✅ (974,7 + 97,47; uf_total es fórmula de la tabla) |
| Renta perpetua (BJ44 · tasa 5,5% NRB-01) | 50.000.000 | 50000000 | 0 | ✅ (vía `tasa_cap_rate_override=0.055` — override LEGÍTIMO, no gap) |
| Ingreso líquido anual (BJ43) | 2.750.000 | 2750000 | 0 | ✅ |
| Promedio UF/m² ofertas (AX34) | 38,8691 | 38.86906053021876 | 0 | ✅ |
| Promedio UF/m² CBR (AX42) | 29,6296 | 29.62962962962963 | 0 | ✅ |
| Ajuste ofertas (AX36) | −14,86% | −14.8637 | ~0 | ✅ |
| Ajuste CBR (AX44) | +11,68% | +11.6844 | ~0 | ✅ |
| Nº comparables | 6 (5 Of + 1 CBR) | 6 | 0 | ✅ |
| Fotos grilla / ranuras | 16 · fachada/ref1/mapaUbicacion | 16 · set | 0 | ✅ |

Bonus (no en la tabla de checks, verificado en `caso4-contexto.json`): los 5 USD
terminales calzan EXACTO con Portada AZ72/AZ73/AZ74/AZ77/AZ78 (39532.598 /
37555.968 / 29704.920 / 30514.224 / 38729.592).

## PDF (render directo Carbone v5, patrón probado de los Casos 1–2)

- `pdf-caso4.pdf` · **11 páginas** · 750 KB · **0 marcadores `{d.}` sin resolver**.
- Valores clave presentes en el texto: HIPOTECARIA SECURITY -6073, Hipotecaria
  Security S.A., PATRICIO ADRIAN TORO NIEVAS, 13.918.055-0, MARIA ROZAS VELASQUEZ,
  ALAMEDA URBANO, Estación Central, 7038-11, 1.072,17 / 42.717.097 (CLP redondeado
  a peso por el formato de la plantilla) / 902,88 / 857,74 / 884,54 / 696,91,
  UF 39.841,72, US$ 909,94, 2.750.000, 50.000.000, **"TASACION V/S PROMEDIO −15%"**
  y **"+12%"** (idénticos al PDF oráculo), ítems "Depto Nº 211 P" y "Terraza".
- ⚠ **11 pp vs 8 pp del oráculo**: mismo spill de la sección de fotos documentado
  en Casos 1 y 2 (layout de la plantilla v5, no contenido — sistémico, no se arregla).
- Cadena E2→E3: E2 aceptó el payload (webhook 200) pero E3 no escribió
  `pdf_final_url` en la ventana de 3 min (DocGen=0) — **igual que Casos 1–2**. No
  bloqueante: el render directo es el espejo. No se tocaron escenarios Make.

## Visibilidad UI (paso 9)

- Asignada a **nutricionsaludketo** (`recTJcV3BIvdcG4em` — "Sergio (nutricionsaludketo)"
  en el contexto) desde el alta; visador Héctor Martínez C. (= PDF oráculo); estado
  `calculada` → `informeDisponible` ✓ (V4/V5/V6; sin `pdfUrl` V6 cae a
  `window.print()`, hueco conocido PLAN §4).
- URL informe (producción): `https://if-ejecutiva-production.up.railway.app/tasaciones/rectnGOaHvEioXZw3/informe`
