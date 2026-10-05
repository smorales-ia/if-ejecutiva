# CIERRE · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005

**Fecha:** 2026-10-05 · **Objetivo:** corregir en la fuente de verdad las 2 fórmulas del motor que la tanda de réplica dejó como gaps (G-1 reposición ×0,8 · G-2 seguro × factor_seguro) y probar el arreglo re-corriendo los 4 casos sandbox sin sus overrides compensatorios.
**Resultado global:** **FIX APLICADO Y PROBADO. 4/4 casos re-corridos OK (ejecutores) y 4/4 OK del auditor ciego. Ningún rollback.**

**LA PREGUNTA CLAVE — con los 2 arreglos, ¿el motor reproduce los oráculos sin los overrides de reposición/seguro?**
- **Reposición: SÍ, 4/4** — el override dejó de hacer falta en los cuatro casos; la fórmula nueva calcula el valor exacto del oráculo (verificado por flags del evento, `inputs_json` y descomposición aritmética).
- **Seguro: SÍ en la FÓRMULA; 1/4 en la corrida real** (C5 Evoluciona, punta a punta sin override). En C2/C3/C4 el override de seguro **sigue, pero ya no por la fórmula**: es por **datos erróneos en M_Clientes** (G-7 + errata RB-53), fuera del alcance de esta tanda (M_Clientes intocable). Los auditores verificaron aritméticamente que la fórmula nueva con el factor CORRECTO da el valor del oráculo exacto en los 3.

---

## 1 · Tabla resumen

| Caso | % con fix, sin override (auditor ciego) | Reposición | Seguro | Veredicto |
|---|---|---|---|---|
| C2 · VP-2026-0074 · AGH | **15/15 = 100%** | **FÓRMULA** (1.394×0,8=1.115,2) | override 1.394 — DATO maestro (fs=0,8 vs 1,0 whitelist oráculo) | **OK** |
| C3 · VP-2026-0075 · ALH | **6/6 = 100%** | **FÓRMULA** (1.280×0,8=1.024) | override 1.024 — DATO maestro (fs=0,8 vs 1,0 whitelist) | **OK** |
| C4 · VP-2026-0076 · Security | **13/13 = 100%** | **FÓRMULA** (1.128,6×0,8=902,88) | override 857,736 — DATO maestro (fs=0,825 errata vs 0,8 oráculo) | **OK** |
| C5 · VP-2026-0077 · Evoluciona | **6/6 = 100%** | **FÓRMULA** (0,8×3.458,91+400=3.167,128) | **FÓRMULA** (base 3.858,91×0,8=3.087,128, descomposición por ítems verificada) | **OK** |

Overrides legítimos conservados: `vida_util_override` (4/4, dato del tasador) y `tasa_cap_rate_override=0.055` (C4, NRB-01). Corridas post-fix 20:24–20:30Z, motor `AT03_v11.2.0_v32b1`, 17/17 fórmulas, cero aborts en los 4.

## 2 · Qué cambió (y qué no)

**Cambió — 2 records de Airtable (el fix completo):**
- `C_Formulas` (`tblNFa454fBbqRB3t`) · `reckDXGPbkDVjzPjY` **F_ValorReposicionUF v3.3** → la rama con cuadro castiga la edificación a-nuevo ×0,8 **solo sin terreno**: `(sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8)` + OO.CC. a valor pleno. Espejo exacto del XLSM `BG72=IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)` (idéntico en los 5 libros).
- `C_Formulas` · `recZTfJX0MJ0r1tHP` **F_SeguroIncendioUF v3.3** → rama con cuadro: `valor_seguro_base_items_uf * factor_seguro` (lo que el spec ya exigía: Motor v2.7:761, RB-35, RN-11 — el motor lo violaba).
- ANTES/DESPUÉS textual completo en `fix-aplicado.md`; snapshot pre-cambio en `rollback-fix.json` + restauración de un paso en `rollback-fix.mjs`.

**Cambió — solo las 4 solicitudes sandbox:** swap de overrides (reposición vaciado 4/4; seguro vaciado en C5, mantenido con motivo sandbox-G-7 en C2/C3/C4) + recálculo AT03.

**NO cambió:** código del repo (cero), script AT03 desplegado (el fix es data-driven: el script evalúa el texto de C_Formulas con safeEval en cada corrida — probado porque los `formula_expresion_snapshot` de las corridas son idénticos carácter a carácter a las expresiones nuevas), fórmulas de campo del cuadro y sus exclusiones (R6), fórmulas v3.1 de rutas legacy/Leasing, M_Clientes, VP-0067, Caso 1 patrón, solicitudes reales, oráculos.

## 3 · Estado sincronía repo↔Airtable

- **El fix no abre ninguna brecha nueva**: vive en datos (C_Formulas) que el script desplegado lee en runtime. No requiere re-paste, ni deploy, ni commit de código.
- **La deuda preexistente G-6 sigue tal cual** (script AT03 desplegado = build `c93620f`, pre-CI-057): solo afecta filas analíticas internas (desviaciones=0, promedio combinado), el PDF imprime bien. Saneo aparte (re-paste manual del script por Sergio), sin urgencia y sin relación con este fix.
- **Pendiente de spec (bump futuro):** (a) el ×0,8 condicional de reposición no está en ningún spec (RN-14 solo dice "sin terreno") — documentarlo; (b) la errata RB-53 "factor seguro (0.825)" (0,825 es el factor de LIQUIDACIÓN) — corregirla: es la causa probable de los fs=0,825 cargados en M_Clientes.

## 4 · Regresión "no rompe" (detalle en `regresion-no-rompe.md`)

- **Caso 1 patrón (VP-2026-0073)**: intacto — record y 15 filas TX_Calculos con `ultima_modificacion` 14:28Z, seis horas ANTES del fix (20:23Z); además el ×0,8 es condicional: una Casa con terreno queda fuera por diseño.
- **Controles factor 1,0 (C2/C3)**: seguro sin cambio (1.394 / 1.024). Para factor 1,0 la fórmula nueva es inocua por construcción (base×1,0=base).
- **Todos los demás terminales** de los 4 casos: idénticos a la réplica auditada; solo cambió el ORIGEN de reposición (4/4) y seguro (C5): de override a fórmula.

## 5 · Hallazgos nuevos de esta tanda

1. **No existe `factor_seguro_override` en TX_Solicitudes** y AT03 lee `factor_seguro` SOLO de M_Clientes (script l.791-799): mientras los maestros estén mal, el seguro de esos clientes necesita `valor_seguro_override`. Decisión de producto pendiente: sanear maestros (preferida) o crear el override de factor.
2. **Errata RB-53 confirmada en producción**: el Security linkeado (`recVTKsZLNSDNInky`) trae fs=0,825; su duplicado (`recXVtuMT2wjIVzz2`) trae el 0,8 correcto. Trampa numérica documentada: base×0,825 = exactamente el valor de liquidación (82,5%) — si alguien retira el override sin sanear el maestro, el error se disfraza.
3. **Causa raíz plausible de G-7** (auditor C3): en AGH/ALH se confundió `factor_garantia` (0,8, que el oráculo SÍ usa en depreciación) con `factor_seguro` (1,0 por whitelist).
4. **Validación anti-casualidad**: en C5 el total del seguro salía igual por dos rutas distintas; la descomposición por ítems (no por total) fue lo que probó la ruta correcta. Patrón a repetir.
5. **`ultima_modificacion` de C_Formulas la bumpean los links de TX_Calculos** — para probar qué texto evaluó una corrida, el `formula_expresion_snapshot` es la evidencia, no el timestamp.
6. Menor: `inputs_json` del motor no registra los rollups de ítems (`valor_seguro_base_items_uf`) — gap de observabilidad.

## 6 · Paralelismo real

Diagnóstico: 2 carriles en paralelo (~10-14 min). Fix+piloto: secuencial por diseño (~8 min). Fan-out C3/C4/C5: 3 carriles en paralelo (~4-10 min, vs ~21 en serie). Auditores ciegos: 4 en paralelo (~4-6 min, vs ~19 en serie). Ahorro total ≈ 35 min.

## 7 · Qué sigue (fuera de esta tanda)

1. **Sanear M_Clientes con Héctor**: AGH→fs 1,0 · ALH→fs 1,0 · Security→fs 0,8 (y resolver el duplicado) · cargar los 12 clientes sin parámetros (lista en CIERRE de la réplica §3). Después, **retirar los 3 `valor_seguro_override` sandbox** y re-correr para confirmar 4/4 solos.
2. Bump de spec: documentar el ×0,8 condicional y corregir la errata RB-53.
3. Re-paste del script AT03 (G-6, analíticas) — saneo aparte.
4. Tanda de plantilla (8 páginas, "NO REGISTRA", propietario≠solicitante) — ya prevista.
5. Decisión de Héctor sobre AT04 — sin urgencia.
