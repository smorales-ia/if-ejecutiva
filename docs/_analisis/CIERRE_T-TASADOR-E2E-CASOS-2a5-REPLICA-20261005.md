# CIERRE · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005

**Fecha de cierre:** 2026-10-05 (tanda ejecutada y pausada el 2026-10-05; retomada y cerrada el mismo día)
**Objetivo:** replicar los Casos 2–5 como espejos de sus oráculos **vía el motor** (sembrar entrada + parámetros de cliente → AT03 calcula → PDF → comparación dato-por-dato), en sandbox aislado sobre solicitudes nuevas.
**Resultado global:** **4/4 casos replicados y auditados OK por auditor ciego. Ningún rollback ejecutado (Bloque 4 sin acción).**

**LA PREGUNTA CLAVE — ¿el motor cuadra los 4 casos solo?** Calcula solo (4/4 llegaron a `calculada` por AT03, 17/17 filas TX_Calculos cada uno, cero aborts H3/H5/H6/H7), pero **ningún caso cuadró su oráculo sin al menos un override numérico**: los 4 necesitaron `valor_reposicion_override` (gap sistémico del ×0,8) y 2 de 4 además `valor_seguro_override` (gap del factor de cliente en el seguro). Los overrides no son atajos: son los hallazgos G-1 y G-2 de abajo, con fix candidato en `C_Formulas`.

---

## 1 · Tabla resumen

| Caso | Cliente · Nº interno | VP · record | Igualdad (ejecutor) | Igualdad (auditor ciego, cómputo propio) | ¿Override para cuadrar? | Veredicto auditor | PDF |
|---|---|---|---|---|---|---|---|
| 2 (piloto) | Agencia Habitacional · AGH-1548 | VP-2026-0074 · `recconVQfAc8LSGJf` | 36/36 (100%) | **20/20 terminales = 100%** (20/24 global; los 4 miss son filas analíticas internas) | SÍ — `valor_reposicion_override=1115.2` (gap G-1) · `vida_util_override=40` (legítimo, dato del tasador) | **OK** | 11 págs |
| 3 | Austral Leasing Hab. · ALH-335 | VP-2026-0075 · `recE1LwwH2xbcCHti` | 37/37 (100%) | **19/20 = 95%** (miss único: desviación=0 en TX_Calculos; el PDF imprime −7% correcto) | SÍ — `valor_reposicion_override=1024` (gap G-1) · `vida_util_override=40` (legítimo) | **OK** | 10 págs |
| 4 | Hipotecaria Security · SECURITY-6073 | VP-2026-0076 · `rectnGOaHvEioXZw3` | 37/37 (100%) | **19/19 terminales = 100%** (19/22 global; 3 miss analíticos) | SÍ — `tasa_cap_rate_override=0.055` (legítimo NRB-01) · `valor_reposicion_override=902.88` (gap G-1) · `valor_seguro_override=857.736` (gap G-2) · `vida_util_override=65` (legítimo, redundante con lookup) | **OK** | 11 págs |
| 5 | Hipotecaria Evoluciona · HEV-3183 | VP-2026-0077 · `recoZcwmgCBVKQMxF` | 42/42 (100%) | **24/25 = 96%** (11 terminales UF/$ exactos XLSM↔Airtable↔PDF; miss analíticos) | SÍ — `valor_reposicion_override=3167.128` (gap G-1) · `valor_seguro_override=3087.128` (gap G-2) · `vida_util_override=70` (legítimo) | **OK** | 11 págs |

Común a los 4: estado `calculada` alcanzado por AT03 (motor `AT03_v11.2.0_v32b1`, trigger `visitada`), evento `at03_dag_completo` "17/17 OK, 0 errores", tasador sandbox `recTJcV3BIvdcG4em` (nutricionsaludketo), visador Héctor Martínez. Todos los overrides con `override_motivo`/`override_autor` poblados y verificados por el auditor contra las celdas del XLSM (motivos fieles).

**Diffs residuales transversales (del auditor ciego, ninguno sustantivo):**
- Las filas analíticas de TX_Calculos (promedio UF/m² muestra, `desviacion_*`) promedian ofertas+CBR juntos y/o devuelven 0 (AT03 desplegado pre-v32-b1, hallazgo G-6); **el PDF imprime los valores correctos** porque el ensamblador los recalcula.
- Propietario impreso = cliente final en los 4 PDFs (gap G-4, `ensamblador.ts:587`); el dato correcto SÍ está en TX_DatosTasacion.
- `Objetivo: Refinanciamiento` vs "Crédito Hipotecario" del histórico (gap de ruteo G-3, por diseño de la réplica).
- DFL-2 "NO" vs "SI" del oráculo en C2/C3/C4 (el seed no cargó `sup_construida_piso*`; trampa G-11c).
- C5: avalúo fiscal imprime "0,00" donde el oráculo dice "NO REGISTRA" (gap G-5).
- Maquetado 10–11 págs vs 8 del oráculo (spill fotos/anexos de PLANTILLA_MET_v5 — tanda de plantilla aparte).
- Menores: `TX_DatosTasacion.avaluo_fiscal_uf` guarda CLP en campo UF (C3/C4); `numero_solicitud` "ALH -335" con espacio (C3); rol estacionamiento 31-516 vs 31-800 (C5); campos de ficha en blanco (zona, fuente, pisos).

Evidencia completa por caso en `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/`: `auditor-casoN.md` (Bloque 3) + los entregables del ejecutor (`regresion-`, `overrides-`, `desviacion-`, `rollback-`, `seed-`, `pdf-casoN.pdf`).

---

## 2 · Hallazgos (gaps del motor y del modelo — el valor real de la tanda)

1. **G-1 · GAP FÓRMULA (sistémico, 4/4): `F_ValorReposicionUF` v32 omite el ×0,8** de edificación a-nuevo (XLSM: `Reposición = 0,8×edif_a_nuevo + OO.CC.`). Los 4 casos necesitaron `valor_reposicion_override`. Fix candidato: `C_Formulas`. Confirmado por auditor ciego con aritmética celda a celda (p. ej. C3: CC62=1280 → BG72=1024=0,8×1280).
2. **G-2 · GAP FÓRMULA (sistémico para factor≠1, C4 y C5): `F_SeguroIncendioUF` con cuadro poblado usa `valor_seguro_base_items_uf` sin aplicar el factor del cliente** (y difiere del XLSM en qué ítems incluye — C5: estacionamiento). Invisible cuando el factor es 1,0 (C2/C3 cuadraron "solos" por coincidencia del dato).
3. **G-3 · GAP RUTEO: solo `tipo_informe=Refinanciamiento` llega a REGLA_REFI_DEPTO_V32** (la única cuyos terminales lee el informe). "Crédito Hipotecario" no existe; la ruta Leasing está rota 2× (regla Austral exige Casa + set v31). Los 4 casos se replicaron vía Refinanciamiento.
4. **G-4 · GAP MODELO: solicitante ≠ propietario no representable** — el ensamblador proyecta `partes.propietario ← cliente_final_nombre` (`ensamblador.ts:587`) y nunca lee `TX_DatosTasacion.propietario_*`. Visible en los 4 PDFs de la réplica.
5. **G-5 · GAP RENDER: avalúo "NO REGISTRA" (RN-37)** — la entrada funciona (flag + raw + motor no aborta), pero ensamblador/plantilla imprimen "0,00" donde el oráculo imprime el literal (C5).
6. **G-6 · AT03 desplegado ≠ repo (pre-v32-b1):** filas per-block `desviacion_*`=0 y promedio combinado ofertas+CBR. No afecta el PDF (el ensamblador calcula los % él mismo). Candidato a re-paste del script en Airtable.
7. **G-7 · M_Clientes con datos erróneos para el oráculo:** Agencia Habitacional y Austral tienen `factor_garantia=0.8` y sus oráculos exigen ×1.0 (no necesitó override solo porque garantía/seguro salen del cuadro cuando el factor es 1,0 — ver G-2).
8. **G-8 · Duplicados en M_Clientes:** "AGENCIA" (tasa 4,5% — la vieja VP-2026-0004 linkea ese), "LEASING AUSTRAL", "EVOLUCIONA" (la vieja VP-2026-0006 linkea el legacy), y triple Security (`recXVtuMT2wjIVzz2` / `recVTKsZLNSDNInky` / `recSi2XsxHtByImuI`).
9. **G-9 · E3 no persiste `pdf_final_url`** (E2 acepta 200) — igual que Caso 1; el render directo Carbone basta para la evidencia.
10. **G-10 · Maquetado:** 10–11 páginas vs 8 del oráculo (spill de firma/fotos de PLANTILLA_MET_v5) — tanda de plantilla aparte, ya prevista.
11. **G-11 · Trampas operativas documentadas:** (a) `nro_interno` debe quedar vacío al crear (si no, AT03 pisa `solicitud_codigo`); (b) `tipo_item='Terraza'` aplica ×0,5 extra — sembrar terraza como Edificación con el uf_m2 que corresponda; (c) `dfl2` depende de `sup_construida_piso1`, no de `sup_construccion_m2`; (d) desviación tasación-vs-promedio por caso (control blando, documentado, sin frenar): C2 −4,93%/+1,87% · C3 −7,06%/— · C4 −14,86%/+11,68% · C5 −3,56%/+9,50%.

---

## 3 · Clientes reales SIN parámetros en M_Clientes (verificado 2026-10-05, solo lectura)

Sin `factor_garantia`, `tasa_cap_rate` ni `factor_seguro` — para cargar después con Héctor:

**NUEVO CAPITAL · AFIANZA · UNIDAD LEASING HABITACIONAL · VALOR PRESENTE · PARTICULARES · BANCO DE CHILE · ANDES · CREDIHOME · METLIFE (fila duplicada en mayúsculas) · CHILE VIVIENDA · 4LIFE · SERVIHABIT** (+ fila basura `recYGkxnFlATx7Nv5` con nombre "nombre").

Además: corregir `factor_garantia`/`factor_seguro` de Agencia Habitacional y Austral Leasing (0.8 → 1.0 según sus oráculos, G-7) y depurar los duplicados de G-8.

---

## 4 · Paralelismo real

- **Bloque 0** (snapshot + resolución de ambigüedad del seguro): secuencial, ~15 min.
- **Bloque 1 · Ola 1** (piloto Caso 2): ~34 min.
- **Bloque 1 · Ola 2** (fan-out Casos 3/4/5): **3 carriles en paralelo**, ~28–42 min (el más largo, Caso 5, 42 min).
- **Ahorro ≈ 62 min** vs ejecución en serie (~104 min sumados de los 3 carriles del fan-out).
- **Bloque 3** (retoma 2026-10-05): **4 auditores ciegos en paralelo**, ~5–8 min cada uno (el más largo ~7,7 min); en serie habrían sido ~25 min.

---

## 5 · Bloques 3 y 4 (retoma post-pausa)

- **Bloque 3 · Auditor ciego:** 4 agentes independientes (uno por caso), sin acceso a los logs ni entregables de los ejecutores (solo Airtable vía GET, oráculos de `docs/_referencias/5tasaciones/` y el `pdf-casoN.pdf`). Cada uno recalculó su propio % de igualdad, verificó motor/eventos/overrides y spot-checkeó el PDF. **Veredictos: OK · OK · OK · OK.** Informes: `auditor-caso2.md` … `auditor-caso5.md`.
- **Bloque 4 · Rollback condicional:** **sin acción** (ningún FAIL). Las 4 solicitudes sandbox quedan como están; los scripts `rollback-casoN.mjs` quedan disponibles si Sergio quiere limpiar el sandbox más adelante (ojo: los H_PreciosUF de fechas compartidas — `2026-05-12` reutilizado por C2 y C5 — solo se revierten si ninguna otra solicitud los usa).

**Invariantes respetados:** M_Clientes intacto (solo lectura) · VP-0067 y solicitudes viejas intactas · oráculos intactos · escenarios Make intactos (solo invocados) · sin commit/push · sin código modificado · sin secretos impresos.

---

## 6 · Qué sigue (fuera de esta tanda)

1. **Fix de fórmulas en `C_Formulas`**: G-1 (×0,8 reposición) y G-2 (factor cliente en seguro) — con eso, la expectativa es que los 4 casos cuadren **sin** overrides numéricos.
2. **Re-paste del script AT03** en Airtable (G-6) para alinear las filas analíticas con el repo.
3. **Tanda de plantilla**: maquetado a 8 páginas (G-10) + literal "NO REGISTRA" (G-5) + propietario ≠ solicitante (G-4).
4. **Carga de parámetros de clientes reales** con Héctor (§3) + corrección 0.8→1.0 de Agencia/Austral + depuración de duplicados.
5. **Decisión de Héctor sobre AT04** (corte automático vs rango) — sigue diferida, el control blando operó bien en los 4 casos.
