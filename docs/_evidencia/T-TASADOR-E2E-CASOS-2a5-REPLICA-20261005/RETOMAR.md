# RETOMAR · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 (PAUSADA 2026-10-05)

**Motivo de la pausa:** orden de Sergio (apagado del PC) tras cerrar los 4 carriles de ejecución.
**Estado al pausar:** EJECUCIÓN COMPLETA (Bloques 0, 1 y 2) · **AUDITOR CIEGO (Bloque 3) PENDIENTE** · rollback (Bloque 4) sin acción — **NO revertir nada: las 4 solicitudes sandbox quedan como están por orden expresa.**

---

## 1 · Estado por caso (los 4 ejecutados, 100% de igualdad según sus ejecutores)

| Caso | Cliente · Nº interno | VP | record_id (TX_Solicitudes) | Igualdad (ejecutor) | PDF | Overrides en el record |
|---|---|---|---|---|---|---|
| 2 (piloto) | Agencia Habitacional · AGH-1548 | VP-2026-0074 | `recconVQfAc8LSGJf` | 36/36 (100%) | `pdf-caso2.pdf` · 11 págs | `valor_reposicion_override=1115.2` (gap fórmula) |
| 3 | Austral Leasing Hab. · ALH-335 | VP-2026-0075 | `recE1LwwH2xbcCHti` | 37/37 (100%) | `pdf-caso3.pdf` · 10 págs | `valor_reposicion_override=1024` (mismo gap) |
| 4 | Hipotecaria Security · SECURITY-6073 | VP-2026-0076 | `rectnGOaHvEioXZw3` | 37/37 (100%) | `pdf-caso4.pdf` · 11 págs | `tasa_cap_rate_override=0.055` (NRB-01 legítimo) · `valor_reposicion_override=902.88` (gap) · `valor_seguro_override=857.736` (gap nuevo) |
| 5 | Hipotecaria Evoluciona · HEV-3183 | VP-2026-0077 | `recoZcwmgCBVKQMxF` | 42/42 (100%) | `pdf-caso5.pdf` · 11 págs | `valor_reposicion_override=3167.128` (gap) · `valor_seguro_override=3087.128` (gap seguro) |

Común a los 4: estado `calculada` alcanzado POR AT03 (trigger `visitada`; 17/17 filas TX_Calculos escritas por el motor, cero aborts H3/H5/H6/H7), asignadas al tasador **nutricionsaludketo** (`recTJcV3BIvdcG4em`), visador Héctor Martínez. URLs (requieren sesión Clerk de esa cuenta):
`https://if-ejecutiva-production.up.railway.app/tasaciones/<record_id>/informe`

**Records auxiliares creados (registrados en los rollback-casoN.json — NO revertidos, no revertir):**
- H_PreciosUF `2026-05-12` → `reczzhTrUvmFf9xUM` (creado por C2; C5 lo reutilizó)
- H_PreciosUF `2026-05-07` → `recPimidugG1LeoYr` (C3)
- H_PreciosUF `2026-03-13` → `rec7I9BGQMsNzsRBe` (C4)

**Qué quedó hecho por caso (Bloque 2 completo):** rollback-casoN.{md,json,mjs} · casoN-oraculo.json · seed-casoN.mjs · regresion-casoN.md · overrides-casoN.md · desviacion-casoN.md · pdf-casoN.pdf · casoN-audit.json/casoN-contexto.json · extract-fotos/render-audit/carbone-render. Todo en este directorio.

**Invariantes respetados:** M_Clientes intacto (solo lectura) · VP-0067 y solicitudes viejas intactas · oráculos intactos · escenarios Make intactos (solo invocados) · sin commit/push · sin código modificado.

---

## 2 · Qué falta (en orden, al retomar)

### Paso 1 — BLOQUE 3 · Auditor ciego (SE DETUVO SIN ESCRIBIR NADA)
Se lanzó y se detuvo por la pausa ANTES de escribir archivo alguno (no hay `auditor-caso*.md`; no quedó nada truncado). Su avance parcial (no vinculante): los 4 records existen, `estado=calculada`, tasador correcto, overrides a la vista.

Relanzar un agente general-purpose con este mandato (esencia; el prompt completo está en la transcripción de la sesión pausada):
- **Ceguera:** NO leer los entregables de los ejecutores (regresion/overrides/desviacion/rollback/seed/\*-audit.json/\*-oraculo.json). Del directorio de evidencia solo puede usar los 4 `pdf-casoN.pdf`. Verifica desde Airtable (API REST, credenciales de `.env.local` leídas con regex línea a línea — **NO `source`**, revienta en la línea 23; nunca imprimir secretos), los oráculos de `docs/_referencias/5tasaciones/` (SOLO LECTURA) y opcionalmente `docs/_planes/PLAN_T-TASADOR-E2E-5CASOS-PROD-20261003.md` §5 (anterior a la ejecución, no es log).
- **Por caso (tabla de arriba: record_id + oráculo):** (1) solicitud existe, `calculada`, tasador `recTJcV3BIvdcG4em`; (2) motor calculó: TX_Calculos `tblFz37KSvn5pLKDR` por `solicitud_codigo` + evento `at03_dag_completo` en A_Eventos `tblMKmDg2KrO5fMn8`, sin aborts; (3) igualdad: terminales vs XLSM/PDF oráculo (extraer con python3/openpyxl/pypdf), % propio N/M; (4) overrides: todos los `*_override` no vacíos + motivo/autor, clasificar; (5) PDF: válido, nº páginas, spot-check de 4-6 valores impresos vs oráculo; (6) diffs residuales.
- **Entregables:** `auditor-caso2.md` … `auditor-caso5.md` (veredicto OK/FAIL + evidencia). Solo lectura en Airtable.

### Paso 2 — BLOQUE 4 · Rollback condicional
Solo si el auditor dictamina FAIL en algún caso: ejecutar `node rollback-casoN.mjs` de ese caso y documentar. Si todo OK: sin acción. (Ojo: los H_PreciosUF de fechas compartidas — ver §1 — solo se revierten si ninguna otra solicitud los usa.)

### Paso 3 — CIERRE
1. `docs/_analisis/CIERRE_T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005.md` con: tabla resumen (caso → cliente → % igualdad → ¿override? → diffs residuales), hallazgos (§3 abajo), lista de clientes sin parámetros (§4), y el § de paralelismo real: **Bloque 0 secuencial ~15 min · piloto ~34 min · fan-out de 3 carriles EN PARALELO ~28-42 min (el más largo, C5, 42 min) · ahorro ≈ 62 min vs serie (~104 min sumados de los 3)**.
2. Entrada en `docs/aprendizajes.md` (sólo append, formato del archivo).
3. Sobrescribir `/mnt/c/Users/Sergio/Documents/claude-out.txt` (ruta mount, NO `C:\…`) con el cierre no-técnico de 9 puntos pedido en el prompt original de la tanda.

---

## 3 · Hallazgos acumulados (insumo del cierre — la respuesta a LA PREGUNTA CLAVE)

**¿El motor cuadra los 4 casos solo? Calcula solo (4/4, cero aborts), pero NINGÚN caso cuadró su oráculo sin al menos un override numérico.** Gaps:

1. **GAP FÓRMULA (sistémico, 4/4): `F_ValorReposicionUF` v32 omite el ×0,8** de edificación a-nuevo (XLSM: `Reposición = 0,8×edif_a_nuevo + OO.CC.`). Todos los casos necesitaron `valor_reposicion_override`. Fix candidato: C_Formulas.
2. **GAP FÓRMULA (sistémico para factor≠1, C4 y C5): `F_SeguroIncendioUF` con cuadro poblado usa `valor_seguro_base_items_uf` SIN aplicar el factor del cliente** (y difiere del XLSM en qué ítems incluye — C5: estacionamiento). Invisible cuando el factor es 1,0 (C2/C3 cuadraron "solos" por coincidencia del dato).
3. **GAP RUTEO: solo `tipo_informe=Refinanciamiento` llega a REGLA_REFI_DEPTO_V32** (la única cuyos terminales lee el informe). "Crédito Hipotecario" no existe; la ruta Leasing está rota 2× (regla Austral exige Casa + set v31). Los 4 casos se replicaron vía Refinanciamiento.
4. **GAP MODELO: solicitante ≠ propietario no representable** — el ensamblador proyecta `partes.propietario ← cliente_final_nombre` (ensamblador.ts:587) y nunca lee `TX_DatosTasacion.propietario_*` (afecta C4 y C5).
5. **GAP RENDER: avalúo "NO REGISTRA" (RN-37)** — la entrada funciona (flag + raw + motor no aborta), pero ensamblador/plantilla imprimen "0,00" donde el oráculo imprime el literal (C5).
6. **AT03 desplegado ≠ repo (pre-v32-b1):** filas per-block `desviacion_*`=0 y promedio combinado. No afecta el PDF (el ensamblador calcula los % él mismo). Candidato a re-paste del script en Airtable.
7. **M_Clientes con datos erróneos para el oráculo:** Agencia Hab. y Austral tienen `factor_garantia=0.8` y el oráculo exige ×1.0 (no necesitó override solo porque garantía/seguro salen del cuadro cuando el factor es 1,0 — ver gap 2).
8. **Duplicados en M_Clientes:** "AGENCIA" (tasa 4,5% — la vieja VP-2026-0004 linkea ese), "LEASING AUSTRAL", "EVOLUCIONA" (la vieja VP-2026-0006 linkea el legacy), y triple Security (`recXVtuMT2wjIVzz2` / `recVTKsZLNSDNInky` / `recSi2XsxHtByImuI`).
9. **E3 no persiste `pdf_final_url`** (E2 acepta 200) — igual que Caso 1; render directo Carbone basta.
10. **Maquetado:** 10-11 páginas vs 8 del oráculo (spill de firma/fotos de PLANTILLA_MET_v5) — tanda de plantilla aparte, ya prevista.
11. **Trampas operativas documentadas:** `nro_interno` debe quedar vacío (si no, AT03 pisa `solicitud_codigo`); `tipo_item='Terraza'` aplica ×0,5 extra (sembrar terraza como Edificación con el uf_m2 que corresponda); `dfl2` depende de `sup_construida_piso1`, no de `sup_construccion_m2`; desviación vs muestra: C2 −4,93%/+1,87% · C3 −7,06%/— · C4 −14,86%/+11,68% · C5 −3,56%/+9,50% (control blando, documentado, sin frenar).

## 4 · Clientes reales SIN parámetros en M_Clientes (verificado 2026-10-05, solo lectura — para cargar después con Héctor)

Sin `factor_garantia`, `tasa_cap_rate` ni `factor_seguro`: **NUEVO CAPITAL · AFIANZA · UNIDAD LEASING HABITACIONAL · VALOR PRESENTE · PARTICULARES · BANCO DE CHILE · ANDES · CREDIHOME · METLIFE (fila duplicada en mayúsculas) · CHILE VIVIENDA · 4LIFE · SERVIHABIT** (+ fila basura `recYGkxnFlATx7Nv5` con nombre "nombre"). Además: corregir `factor_garantia`/`factor_seguro` de Agencia Habitacional y Austral Leasing (0.8 → 1.0 según sus oráculos) y depurar los duplicados del §3.8.

---

*Archivo escrito al pausar la tanda (2026-10-05). Ningún entregable quedó truncado: lo pendiente (auditor-caso\*.md, CIERRE, aprendizajes, claude-out definitivo) simplemente no se inició.*
