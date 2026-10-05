# OVERRIDES · CASO 3 (ALH -335) · ¿el motor cuadró solo? · 2026-10-05

**Respuesta corta: el motor cuadró 12 de 13 terminales SIN overrides. Hizo falta UN (1)
override numérico** (`valor_reposicion_override = 1024`) — el MISMO gap conocido del
Caso 2, ninguno nuevo. Cada override/decisión = gap:

## 1. `valor_reposicion_override = 1024` — GAP DE FÓRMULA conocido (v32 vs XLSM)

- El XLSM calcula **Reposición = factor_garantía (0.8) × edificación a-nuevo**
  (ALH: 0.8 × (40 m² × 32 UF/m²) = 0.8 × 1280 = **1024** · Portada BG72; en este caso la
  cifra coincide numéricamente con el valor comercial porque el D.F. del cuadro también
  es 0.8 — son dos factores distintos que valen lo mismo).
- `F_ValorReposicionUF` v32 calcula **a-nuevo SIN el factor**: habría dado **1280**.
- Es el **mismo gap de fórmula documentado en overrides-caso2.md §1** (no de dato
  maestro: M_Clientes.factor_garantia=0.8 está bien). Confirmado sistémico: 2 de 2 casos
  vía motor lo necesitaron. O se corrige C_Formulas (F_ValorReposicionUF ×
  factor_garantia) o cada caso necesitará este override.
- Auditoría: `override_motivo` y `override_autor` poblados en la solicitud. El evento
  `at03_dag_completo` registró `overrides[final=0 repo=1024 gar=0 tasa=0]`.

## 2. Seguro/garantía ×1.0: NO necesitó override (replica el hallazgo del Caso 2)

Hipótesis de entrada: M_Clientes ALH (factor_seguro=0.8) chocaría con el oráculo
(seguro = 1.0×VC, Portada DB51=1.0). **No chocó**: con cuadro poblado,
`F_SeguroIncendioUF` usa `valor_seguro_base_items_uf` (= `valor_seguro_item_uf` de
TX_ItemsCuadroValoracion) = 1024, ignorando el `factor_seguro` del cliente. **Garantía
también cuadró sola** por la misma vía. El 0.8 del maestro solo jugaría en el fallback
sin cuadro.

## 3. Tasa 4,5%: NO necesitó override

El canónico `recU6gfHmmCWZN5Mm` trae `tasa_cap_rate=0.045` = oráculo (BJ41=4,5%) →
renta perpetua 48.888.888,89 exacta. (En el Caso 2 la tasa correcta también venía del
canónico; aquí además coincide con el legacy.)

## 4. Decisiones de dato (no numéricas) — gaps de ruteo/maestros/contrato

| Decisión | Por qué | Gap |
|---|---|---|
| `tipo_informe = Refinanciamiento` (recreojxTjoAWOEHa) y no "Leasing Habitacional" (recaBCLUiDNs3CRkq) ni "Crédito Hipotecario" (el PDF oráculo, FICHA E27) | **Diagnóstico del ruteo Leasing (alerta específica de este caso):** la ruta Leasing SÍ existe — tipo "Leasing Habitacional" + `Regla_AustralLeasing_Habitacional_Casa` (recIEZ7F3FGUF0l44, especificidad 3, prioridad 200, activa) — pero está **doblemente rota para este caso**: (a) exige `tipo_propiedad=Casa` (recrXDAjlVCe59XBW) y el caso es Departamento → AT01 la descarta por match excluyente y caería a `Regla_Wildcard_Default` (v31); (b) aunque matcheara, sus `formulas_resultado` apuntan al set **v31** (`valor_seguro_uf`, `renta_perpetua_uf`, sin `*_clp`), cuyos terminales el ensamblador NO lee. "Crédito Hipotecario" sigue sin existir en M_TiposInforme. Con Refinanciamiento + Departamento AT01 eligió `REGLA_REFI_DEPTO_V32` (score 2 > score 1 del default refi), el único set que alimenta el informe. | **GAP DE RUTEO LEASING** (hallazgo de este caso): para servir Leasing-Departamento vía motor faltan (a) una regla LH-Departamento y (b) que las reglas LH apunten al set v32. Efecto colateral menor: el PDF imprime objetivo "Refinanciamiento" donde el oráculo dice "Crédito Hipotecario". |
| Cliente `recU6gfHmmCWZN5Mm` (Austral Leasing Habitacional, canónico) y no el legacy "LEASING AUSTRAL" (recklwpIt0Cv4eqk1 · fs=0.825) | El canónico tiene el nombre correcto de portada y la tasa 4,5% del oráculo; **la solicitud vieja VP-2026-0005 (recPx0yiK9k4oPG4V) también linkea el canónico** (verificado, solo lectura), así que aquí no hubo ambigüedad real. | GAP DE MAESTRO (duplicado legacy) ya conocido del Caso 2; no se tocó ninguno de los dos. |
| `nro_interno` se dejó VACÍO | AT03 escribe `TX_Calculos.solicitud_codigo = nro_interno \|\| codigo_solicitud` y el ensamblador busca por `codigo_solicitud`. La vieja VP-2026-0005 tiene `nro_interno="SOL-ALH-335"` — confirma que el campo existe y habría roto los terminales. | TRAMPA DE CONTRATO del Caso 2, respetada (el Nº interno del PDF sale de `numero_solicitud="ALH -335"`). |
| `cliente_final_nombre = "Miguenson Rameau"` (solicitante) y propietario real "Víctor Leónidas González Moreno" en `TX_DatosTasacion.propietario_nombre` | La portada del PDF oráculo imprime "Nombre Cliente: Miguenson Rameau"; el ensamblador proyecta `partes.propietario = cliente_final_nombre` (ensamblador.ts:587) y **no proyecta `TX_DatosTasacion.propietario_nombre` al contexto** → la fila "Propietario: Víctor…" de la Hoja 1 del oráculo no es reproducible hoy. Ambos RUT son 9.588.043-6 (inconsistencia del propio oráculo, PLAN §5). | **Hallazgo nuevo (menor)**: cuando solicitante ≠ propietario, el informe no puede imprimir ambos — `propietario_nombre` del tasador no llega al contexto. En los Casos 1-2 era invisible (misma persona). |
| `vida_util_override = 40` | Vida útil remanente del oráculo (BJ37). Solo vista/informe. | Menor. |

## 5. Hallazgos replicados del Caso 2 (sin cambios)

- **AT03 desplegado ≠ repo (per-block):** `desviacion_vs_promedio_pct=0` y
  `promedio_uf_m2_cbr_out=0` en TX_Calculos; `promedio_uf_m2_muestra=27.5435` (aquí
  coincide con el promedio de ofertas porque no hay CBR — con CBR habría salido
  combinado). No afecta al PDF: el ensamblador calcula el −7,06% por bloque desde
  TX_Comparables. Candidato a re-paste del script (paso manual de Sergio).
- **E3 no persiste `pdf_final_url`** (E2 aceptó 200): igual que Casos 1-2, no bloqueante.
- **Plantilla v5 no imprime la celda "Zona"** (tipo_zona_descripcion viaja en el
  contexto y no se renderiza) — también pasa en el Caso 2; anotado en regresion-caso3.md.
