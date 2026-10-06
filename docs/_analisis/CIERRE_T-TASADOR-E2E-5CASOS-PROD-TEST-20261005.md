# CIERRE · T-TASADOR-E2E-5CASOS-PROD-TEST-20261005

**Fecha:** 2026-10-05 · **Objetivo:** dejar los 5 casos LISTOS PARA PROBAR en producción, cada uno espejo de su PDF de referencia, con las 6 vistas del tasador (V1..V6) como VP-2026-0067.
**Resultado global:** **5/5 casos APROBADOS por auditor ciego en V1–V5 con 100% de terminales vs oráculo. V6 (PDF descargable) queda BLOQUEADA uniformemente por una sola causa externa: E3 inactivo — con el destrabe empaquetado (paso manual de Sergio) y el disparo listo en un comando.** Ningún rollback (Bloque 4 sin acción).

---

## 1 · Qué faltaba y qué hizo esta tanda

La reconciliación (Bloque 0) mostró que las tandas previas (E2E 20261003 · RÉPLICA 2a5 · FIX-MOTOR) ya habían dejado los 5 casos en `calculada`, asignados a la cuenta de prueba, con datos, fotos y cálculos auditados espejo. El gap uniforme era:

- **V2 vacía (y V1 incompleta):** 0 adjuntos `subido_por=Sistema` (documentos fuente con extracción) en los 5 casos.
- **V6 bloqueada:** 0 `TX_DocumentosGenerados` y `pdf_final_url` vacío en los 5.

Esta tanda sembró, por caso, las **8 filas Sistema patrón VP-0067** (permiso edificación · fuente SII · ofertas comparables · deuda TGR · recepción final · antecedentes bien raíz · no expropiación SERVIU · dominio CBR), con `atributos_esperados` tomados verbatim del patrón y `atributos_obtenidos` construidos desde los **datos ya auditados del propio caso** (TX_DatosTasacion + TX_Comparables + solicitud — ninguna invención), `estado_extraccion=listo` y `no_extraidos=[]`. 40 filas en total (8×5), reversibles (ids en `escrituras-casoN.json`).

## 2 · Tabla resumen (dictamen del auditor ciego, cómputo propio)

| Caso | Cliente · Nº interno | VP · record | % igualdad terminales | V1–V5 | V6 | ¿Override nuevo? |
|---|---|---|---|---|---|---|
| 1 | MetLife · METLIFE-6280 | VP-2026-0073 · `reczuns8NHdI45Owp` | **15/15 = 100%** (al decimal, incl. desviación −30,2489…) | **OK** | PENDIENTE E3 | NO |
| 2 | Agencia Habitacional · AGH-1548 | VP-2026-0074 · `recconVQfAc8LSGJf` | **13/13 = 100%** (reposición 1.115,2 por FÓRMULA, sin override) | **OK** | PENDIENTE E3 | NO |
| 3 | Austral Leasing · ALH-335 | VP-2026-0075 · `recE1LwwH2xbcCHti` | **13/13 = 100%** | **OK** | PENDIENTE E3 | NO |
| 4 | Hip. Security · SECURITY-6073 | VP-2026-0076 · `rectnGOaHvEioXZw3` | **13/13 = 100%** (ruido float ≤7,5e−9) | **OK** | PENDIENTE E3 | NO |
| 5 | Hip. Evoluciona · HEV-3183 | VP-2026-0077 · `recoZcwmgCBVKQMxF` | **13/13 = 100%** (avalúo "NO REGISTRA" fiel) | **OK** | PENDIENTE E3 | NO |

Común a los 5: estado `calculada` · tasador `recTJcV3BIvdcG4em` (nutricionsaludketo) · visador `recrjQDympldI186S` · V1 con 24–26 adjuntos todos `listo` · V2 con 8/8 JSON válidos y valores del caso · producción protegida (404 a curl plano, 307→handshake Clerk con headers de navegador — sin fuga anónima). Overrides: solo los heredados y ya auditados (vida útil 5/5 legítimos; tasa 5,5% C4 legítimo NRB-01; seguro C2/C3/C4 por dato maestro erróneo G-7/RB-53 — no por fórmula).

Residuo conocido que NO es de esta tanda: filas analíticas `desviacion_*`=0 / promedios (G-6, script AT03 desplegado pre-v32-b1) — **el informe y el PDF imprimen los porcentajes correctos** porque el ensamblador los recalcula (verificado contra los PDFs por los auditores de la réplica).

## 3 · V6 — la única pieza bloqueada (causa única, destrabe empaquetado)

- **Causa:** E3 (`E3_Carbone_Download_Dropbox v2.2`, scenario 5791413) está `isActive=false` desde el 30-sep (409 "Share link already exists" sin error-handler → Make lo desactivó). E2 sigue ACTIVO en v5. Verificado hoy vía Make API (GET, solo lectura).
- **Por qué no se disparó E2 igual:** con E3 caído, el render se encola y expira (lección "E2 200 ≠ PDF materializado"); además re-procesar la cola sin el fix repetiría el 409. Decisión del equipo: no disparar a ciegas.
- **Destrabe (paso manual de Sergio, ya existente):** `bash docs/_evidencia/T-PDF-E3-GENERICOS-20260930/fix-e3-apply.sh` (agrega idempotencia al módulo share-link y reactiva E3) o los pasos UI de `fix-e3-pasos-manuales.md`.
- **Disparo listo (1 comando, idempotente, los 5 casos):**
  `pnpm vitest run docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-TEST-20261005/disparar-e2-5casos.test.mts`
  Por caso: E2(v5)→Carbone→E3→Dropbox share-link→`pdf_final_url` + `estado=pdf_listo` + fila TX_DocumentosGenerados. Omite casos que ya tengan PDF.
- Los PDFs espejo de cada caso YA existen como render real auditado (`caso1-PROD.pdf`, `pdf-caso2..5.pdf` en las evidencias previas); lo que falta es solo materializar el link Dropbox en la UI.

## 4 · Recorrido para Sergio (VISTA→ESTADO→URL)

En `docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-TEST-20261005/vistas-casoN.md` (uno por caso) y en `claude-out.txt`. Clave: **no hay que cambiar ningún estado** — en `calculada` las 6 vistas son navegables (V3 en solo-lectura, igual que el patrón). No retroceder estados (re-entrar a `visitada` re-dispara AT03).

## 5 · Clientes reales SIN parámetros en M_Clientes (hallazgo vigente, para cargar con Héctor)

Sin cambios desde la réplica (M_Clientes intocable en esta tanda): **NUEVO CAPITAL · AFIANZA · UNIDAD LEASING HABITACIONAL · VALOR PRESENTE · PARTICULARES · BANCO DE CHILE · ANDES · CREDIHOME · METLIFE (duplicado en mayúsculas) · CHILE VIVIENDA · 4LIFE · SERVIHABIT** (+ fila basura `recYGkxnFlATx7Nv5`). Más las correcciones pendientes: Agencia/Austral `factor_seguro` 0,8→1,0 (G-7) y Security 0,825→0,8 (errata RB-53). Todo esto ya está en manos de Héctor vía `docs/_analisis/LISTA_HECTOR_Fichas_Clientes_20261005.xlsx` (tanda EXCEL-HECTOR de hoy).

## 6 · Paralelismo real

Bloque 0 secuencial + **3 agentes de reconocimiento en paralelo** (~4–7 min c/u). Piloto secuencial por diseño (GATE S1). Fan-out casos 2–5: **4 carriles paralelos** (~15 s c/u). **Bloque 3: 5 auditores ciegos en paralelo** (~3–7 min c/u; en serie ~25 min). Ahorro ≈ 30–35 min.

## 7 · Invariantes y reversibilidad

Oráculos intactos · VP-0067 intacto (solo lectura como patrón) · M_Clientes solo lectura · escenarios Make solo consultados (GET) · cero cambios de código del repo (el `.test.mts` nuevo es harness de evidencia, no app) · sin commit/push · sin secretos impresos. **Todo lo escrito es reversible en un paso por caso:** `rollback-casoN.md` + `snapshot-pre-tanda.json` + ids exactos en `escrituras-casoN.json` (40 filas TX_Adjuntos, nada más se escribió).

## 8 · Qué sigue

1. **Sergio:** correr `fix-e3-apply.sh` → luego `disparar-e2-5casos.test.mts` → V6 verde en los 5 (y VP-0073…0077 pasan a `pdf_listo`).
2. Click-through visual de las 6 vistas con la cuenta de prueba (guion en claude-out.txt).
3. Carga de parámetros reales de clientes con las respuestas de Héctor (desbloquea retirar los 3 `valor_seguro_override`).
4. Tanda de plantilla (8 páginas, "NO REGISTRA", propietario≠solicitante) — ya prevista, fuera de esta.
5. Re-paste script AT03 (G-6, analíticas) — saneo aparte sin urgencia.
