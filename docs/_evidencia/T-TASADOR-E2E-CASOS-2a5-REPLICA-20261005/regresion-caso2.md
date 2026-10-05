# REGRESIÓN · CASO 2 (AGH-1548) · espejo VÍA MOTOR · 2026-10-05

**Solicitud sandbox:** `recconVQfAc8LSGJf` · `VP-2026-0074` · `numero_solicitud="AGH -1548"` ·
estado final **`calculada`** (transicionado por AT03, no a mano) · regla aplicada por AT01:
`rec2QYP8yjMW1Smsm` (REGLA_REFI_DEPTO_V32, set de 13 terminales v32 + promedios).
**TX_Calculos: 17 filas escritas por el motor** (AT03_v31 EJECUTOR 17/17 OK, evento
`at03_dag_completo` en A_Eventos; cero aborts H3/H5/H6/H7).

**Diferencia clave vs Caso 1:** aquí NO se sembró ningún valor calculado — se sembraron solo
ENTRADAS (1 solicitud + 1 datosTasacion + 1 item del cuadro + 7 comparables + 5 habitaciones +
1 doc legal + 16 fotos + H_PreciosUF 2026-05-12) y el motor produjo las salidas.

## Auditoría dato-por-dato (contexto in-process `construirInformeContexto` vs oráculo XLSM/PDF)

Resultado: **36/36 PASS = 100% igualdad** (`caso2-audit.json`). Terminales leídos de las filas
que escribió AT03.

| Check | Esperado (oráculo) | Obtenido (motor/ensamblador) | Delta | OK |
|---|---|---|---|---|
| Nº interno | AGH -1548 | AGH -1548 | 0 | ✅ |
| Cliente | Agencia Habitacional | Agencia Habitacional | 0 | ✅ |
| Propietario · RUT | ANDRES PABLO ISRAEL AVRAM · 7.774.862-8 | idem | 0 | ✅ |
| Comuna / Tipo | Estación Central / Departamento | idem | 0 | ✅ |
| Rol SII | 694-416 | 694-416 | 0 | ✅ |
| Sup. construcción | 41 m² | 41 | 0 | ✅ |
| Año construcción | 2018 (XLSM AE8/T51; PLAN §5 decía 2017 — corregido) | 2018 | 0 | ✅ |
| Vida útil | 40 | 40 | 0 | ✅ |
| Valor comercial UF (Portada AP69) | 1.394 | 1394 | 0 | ✅ |
| Valor comercial CLP (AY69) | 56.164.915,18 | 56164915.18 | 0 | ✅ |
| Valor reposición UF (BG72) | 1.115,2 | 1115.2 | 0 | ✅ (vía `valor_reposicion_override` — ver overrides-caso2.md) |
| Valor reposición CLP (BL72) | 44.931.932,144 | 44931932.144 | 0 | ✅ |
| Seguro incendio UF (BG73 · DB51=1.0) | 1.394 | 1394 | 0 | ✅ (SIN override: sale de `valor_seguro_item_uf` del cuadro) |
| Seguro incendio CLP (BL73) | 56.164.915,18 | 56164915.18 | 0 | ✅ |
| Avalúo fiscal UF (BG74) | 1.256,2748 | 1256.2748213163063 | 0 | ✅ |
| Valor remate UF (BG77 · 0.65) | 906,1 | 906.1 | 0 | ✅ |
| Valor remate CLP (BL77) | 36.507.194,867 | 36507194.867 | 0 | ✅ |
| Liquidación UF (BG78 · 0.825) | 1.150,05 | 1150.05 | 0 | ✅ |
| Liquidación CLP (BL78) | 46.336.055,0235 | 46336055.0235 | 0 | ✅ |
| UF día (AQ71) | 40.290,47 | 40290.47 | 0 | ✅ |
| Dólar día (BO71) | 894,25 | 894.25 | 0 | ✅ |
| Cuadro total UF | 1.394 | 1394 | 0 | ✅ (valor_uf es fórmula de la tabla: 41×34×1) |
| Renta perpetua (BJ44 · tasa 6,0%) | 58.666.666,67 | 58666666.66666667 | 0 | ✅ |
| Ingreso líquido anual (BJ43) | 3.520.000 | 3520000 | 0 | ✅ |
| Promedio UF/m² ofertas (AX34) | 35,7637 | 35.763724351529234 | 0 | ✅ |
| Promedio UF/m² CBR (AX42) | 33,375 | 33.375 | 0 | ✅ |
| Ajuste ofertas (AX36) | −4,93% | −4.9316 | ~0 | ✅ |
| Ajuste CBR (AX44) | +1,87% | +1.8727 | ~0 | ✅ |
| Nº comparables | 7 (5 Of + 2 CBR) | 7 | 0 | ✅ |
| Fotos grilla / ranuras | 16 · fachada/ref1/mapaUbicacion | 16 · set | 0 | ✅ |

## PDF (render directo Carbone v5, patrón probado del Caso 1)

- `pdf-caso2.pdf` · **11 páginas** · 478 KB · **0 marcadores `{d.}` sin resolver**.
- Valores clave presentes en el texto: AGH -1548, Agencia Habitacional, ANDRES PABLO ISRAEL
  AVRAM, 7.774.862-8, Coronel Souper, Estación Central, 694-416, 1.394 / 56.164.915 /
  1.115,2 / 1.150,05 / 906,1, UF 40.290,47, US$ 894,25, **"TASACION V/S PROMEDIO −5%"** y
  **"+2%"** (idénticos al PDF oráculo).
- ⚠ **11 pp vs 8 pp del oráculo**: mismo spill de la sección de fotos ya documentado en el
  Caso 1 (AUDITOR_CIEGO_caso1: 11 pp con 18 fotos; aquí 11 pp con 16). Es layout de la
  plantilla v5, no contenido: sistémico para los casos 3–5.
- Cadena E2→E3: E2 aceptó el payload (webhook OK) pero E3 no escribió `pdf_final_url` en la
  ventana de 3 min (DocGen=0) — **igual que en el Caso 1** (su `caso1-audit.json` también
  cerró con `render:{}`). No bloqueante: el render directo es el espejo. E3 es on-demand y su
  activación es tema aparte (no se tocaron escenarios Make).

## Visibilidad UI (paso 9)

- Asignada a **nutricionsaludketo** (`recTJcV3BIvdcG4em`) desde el alta; estado `calculada`
  → `informeDisponible` ✓ (V4/V5/V6 sin `pdfUrl` → V6 cae a `window.print()`, hueco conocido §4).
- URL informe (producción): `https://if-ejecutiva-production.up.railway.app/tasaciones/recconVQfAc8LSGJf/informe`
