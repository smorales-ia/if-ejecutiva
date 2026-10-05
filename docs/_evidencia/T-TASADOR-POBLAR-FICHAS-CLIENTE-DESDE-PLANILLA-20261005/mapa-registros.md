# Mapa de registros M_Clientes — activos vs esqueleto/duplicados

**Tanda:** T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005 · BLOQUE 0 (solo GET)
**Fecha:** 2026-10-05 · **Fuente:** snapshot `backup-mclientes.json` (92 records) + GET paginado de
TX_Solicitudes `tblaHTyMHYfmy7Fg6` (55 solicitudes, campos `cliente`/`codigo_solicitud`/`estado`).

**Método del veredicto:** un record es ACTIVO si lo linkean solicitudes **vigentes** (estado
distinto de `cancelada`). Los conteos "links" incluyen canceladas; se anota el detalle cuando
importa. 3 solicitudes no linkean a ningún cliente (VP-2026-0044/0064/0065, canceladas).

**Leyenda params:** `fg`=factor_garantia · `fs`=factor_seguro · `cap`=tasa_cap_rate · `rd`=redondeo_decimales.

## Hallazgo previo que corrige al prompt de la tanda

Los "esqueletos 2026-06-04" **no están todos sin parámetros**: 16 de los 28 records creados el
06-04 (import `madre.xlsm hoja Variables`) **sí** tienen `fg=0.8 · fs=0.825 · cap=0.045` —
entre ellos AGENCIA, EVOLUCIONA (fs=0.8), SECURITY PRINCIPAL y LEASING AUSTRAL, que el prompt
daba por vacíos. Los realmente vacíos de params son 12 (+ fila basura + 2 sandbox = los 15
records con params vacíos de la base).

## 1 · Los 5 clientes piloto

### MetLife (3 records)

| record_id | nombre | created | params | links (vigentes) | veredicto |
|---|---|---|---|---|---|
| `recIg8NtVhptXkEUJ` | MetLife | 2026-05-31 | fg=0.8 fs=1 cap=0.045 | 6 (**0066 asignada · 0067 pdf_listo · 0073 calculada**) | **ACTIVO** |
| `recimE810cuyWIR9q` | METLIFE | 2026-06-04 | vacíos | 0 | ESQUELETO |
| `recwxQlPhJTXgig93` | MetLife Chile S.A. | 2026-06-06 | fg=0.8 fs=0.825 cap=0.045 **rd=2** | 0 | DUDOSO (duplicado; único record de la base con `redondeo_decimales`) |

### Agencia Habitacional (2 records)

| record_id | nombre | created | params | links (vigentes) | veredicto |
|---|---|---|---|---|---|
| `recX80z73mCtC4BBo` | Agencia Habitacional | 2026-06-06 | fg=0.8 fs=0.8 cap=0.06 | 1 (**0074 calculada**) | **ACTIVO** ✓ coincide con tandas previas |
| `rec8K5fUpTEoxD9yS` | AGENCIA | 2026-06-04 | fg=0.8 fs=0.825 cap=0.045 | 1 (solo 0004 cancelada) | ESQUELETO (con params seed, uso solo histórico) |

### Austral Leasing (2 records)

| record_id | nombre | created | params | links (vigentes) | veredicto |
|---|---|---|---|---|---|
| `recU6gfHmmCWZN5Mm` | Austral Leasing Habitacional | 2026-06-06 | fg=0.8 fs=0.8 cap=0.045 | 2 (**0075 calculada**) | **ACTIVO** ✓ |
| `recklwpIt0Cv4eqk1` | LEASING AUSTRAL | 2026-06-04 | fg=0.8 fs=0.825 cap=0.045 | 0 | ESQUELETO |

*(No confundir con ULH: `rec9AnivjtqivJcEB` "UNIDAD LEASING HABITACIONAL" y `recXFlArdmTAJvvYl` "ULH (BICE) Leasing" son otro cliente — ver §3.)*

### Hipotecaria Security (3 records)

| record_id | nombre | created | params | links (vigentes) | veredicto |
|---|---|---|---|---|---|
| `recVTKsZLNSDNInky` | Hipotecaria Security S.A. | 2026-06-06 | fg=0.8 fs=0.825 cap=0.045 · sin `codigo` | 2 (**0076 calculada**) | **ACTIVO** ✓ (el linkeado por la sandbox según tandas previas) |
| `recXVtuMT2wjIVzz2` | Hipotecaria Security | 2026-06-08 | fg=0.8 **fs=0.8** cap=0.045 · cod=SEC | 0 | DUPLICADO ✓ (el del fs=0.8 conocido) |
| `recSi2XsxHtByImuI` | SECURITY PRINCIPAL | 2026-06-04 | fg=0.8 fs=0.825 cap=0.045 · cod=PRI | 0 | ESQUELETO (probable mismo grupo "Security Principal" — DUDOSO si es cliente aparte) |

### Evoluciona (2 records)

| record_id | nombre | created | params | links (vigentes) | veredicto |
|---|---|---|---|---|---|
| `recPDwixzybwHlJaQ` | Hipotecaria Evoluciona | 2026-06-06 | fg=0.8 fs=0.8 cap=0.045 · cod=EVO | 1 (**0077 calculada**) | **ACTIVO** ✓ |
| `rec8QDoxN3LGvYLcm` | EVOLUCIONA | 2026-06-04 | fg=0.8 fs=0.8 cap=0.045 · cod=HEV | 6 — **todas canceladas** (0006, 0038, 0040–0043) | LEGACY/ESQUELETO (mucho uso histórico, ninguno vigente) |

⚠ Ojo: por conteo bruto de links EVOLUCIONA (6) supera al activo (1); el veredicto se sostiene
porque las 6 son canceladas y la única vigente (0077 calculada) linkea a `recPDwixzybwHlJaQ`.

## 2 · Demás grupos de duplicados (nombre normalizado)

| Grupo | record_id | nombre | created | params (fg/fs/cap) | links | veredicto |
|---|---|---|---|---|---|---|
| 4Life | `receWMWb6Qwe1gsnC` | 4 LIFE | 06-08 | 0.8/0.825/0.045 | 8 (**0062 visitada**, resto canceladas) | **ACTIVO** |
| | `recngf122DQ5Tevtu` | 4LIFE | 06-04 | vacíos | 1 (0059 cancelada) | ESQUELETO |
| Afianza | `rec6ulVTTtCUeD8QO` | AFIANZA | 06-04 | vacíos | 2 (ambas canceladas) | ESQUELETO (uso histórico) |
| | `rec9RA23ezRX6gi4o` | Afianza | 06-08 | 0.8/0.825/0.045 | 0 | DUDOSO (seed sin uso; sería el candidato a activo) |
| Banco de Chile | `recOfiHWwHEUzgPCw` | BANCO DE CHILE | 06-04 | vacíos | 10 — **todas canceladas** | ESQUELETO (uso histórico masivo) |
| | `reciyPPDIgLcyIH07` | Banco de Chile | 06-08 | 0.8/1/0.045 | 0 | DUDOSO (seed sin uso) |
| Valor Presente | `rec9UF0Fj4er7OVA0` | VALOR PRESENTE (VLP) | 06-04 | vacíos | 0 | ESQUELETO |
| | `recdldMS9TYs9sv39` | Valor Presente (VP) | 06-08 | 0.8/0.825/0.045 | 0 | DUDOSO |
| ServiHabit | `reco6l8flOx08T4bg` | SERVIHABIT | 06-04 | vacíos | 0 | ESQUELETO |
| | `recAzjyjZW8RqzR6Z` | ServiHabit (SVH) | 06-08 | 0.8/0.825/0.045 | 0 | DUDOSO |
| Credihome | `recb9KnrD9wYvCp22` | CREDIHOME | 06-04 | vacíos | 0 | ESQUELETO |
| | `recwDkXSzFG1alEhr` | Credihome (CRD) | 06-08 | 0.8/0.8/0.06 | 0 | DUDOSO |
| VALÓN | `rec4rTNuxSjucS6XM` | VALÓN Hipotecaria | 06-08 | 0.8/1/0.045 | 0 | DUDOSO — par idéntico |
| | `recIXx6xMAGnOZT7T` | VALÓN Hipotecaria | 06-09 | 0.8/1/0.045 | 0 | DUDOSO — par idéntico (mismo nombre y params, difiere solo created) |

## 3 · Pares por nombre parecido (normalización no exacta — revisar antes de escribir)

| Grupo probable | ESQUELETO 06-04 (links) | Contraparte 06-08 (links) |
|---|---|---|
| Andes | `recKaRXnwtqbM0qkJ` ANDES, vacíos (0) | `recW7rw9EpxapRVFj` Administradora Andes S.A. (1, cancelada) |
| CrediTú | `recBVAW5lqBLGqQmy` CREDITU, con params (0) | `recJExaBnlEVlyeuZ` CrediTú (0) |
| Chilevivienda | `recqlmHfjwAsyJVNU` CHILE VIVIENDA, vacíos (0) | `recDhiwPgxjpEyX4d` Chilevivienda (0) |
| Concreces | `recWvXIiwahdV7otI` CONCRECES, con params (0) | `recPSVC4X8ConYKi2` Concreces Leasing (0) |
| ICGE | `recucWvNTRDw8QISS` ICGE, con params (0) | `recphwp4pgfkgNChn` ICGE Internacional (0) |
| La Construcción | `recxEg7RiBxtqRCfY` HIPOTECARIA LA CONSTRUCCION, con params (0) | `rec6ETMQtes5VR7Kh` La Construcción Hipotecaria (0) |
| M&V | `recH4CU7AI1eYPVM3` M&V, con params (0) | `reclREZKDnYh5BQTI` M&V (Munita y Vergara) (0) |
| Más Leasing | `recRC2WEkLfXkMO50` MAS LEASING, con params (0) | `recYY0ebDMrZ2Qu1c` Másleasing (0) |
| Nuevo Capital | `rec532kYmluOreV3m` NUEVO CAPITAL, vacíos (0) | `recfwJelCHYjuHWy4` Nuevo Capital Mutuos Hipotecarios (0) |
| Particulares | `recFZ9Nvbo2EICHPS` PARTICULARES, vacíos (0) | `recbrHmj9YUJ01BY5` Particular (0) |
| Penta | `rectvgirk94PmIUKm` Penta Hipotecario, con params (0) | `recYAAxUCRqhCDgyn` Penta Hipotecaria (0) *(y `rec3fQVp2hbjpsyXb` Penta Vida, cliente distinto)* |
| TESSI | `reckDh71r8Lm2Kv2s` TESSI, con params (0) | `rec9emcQ2xagiCyzp` TESSI Servicios (0) |
| ULH/BICE | `rec9AnivjtqivJcEB` UNIDAD LEASING HABITACIONAL, vacíos (1, cancelada 0060) | `recXFlArdmTAJvvYl` ULH (BICE) Leasing (0) *(relación con `recCveeu7mJ0Vl0Un` BICE Hipotecaria / `recb5h4CuyLp3D9c7` BICE Leasing / `recFZQQE4RIjyHbR6` BICE MUTUOS por confirmar)* |

## 4 · Basura y sandbox

| record_id | nombre | created | nota |
|---|---|---|---|
| `recYGkxnFlATx7Nv5` | "nombre" (con BOM U+FEFF) | 06-04 | **FILA BASURA** confirmada — header del CSV importado como fila (`codigo`="codigo", `Hoja planilla`="notas"); único record 06-04 sin `activo` |
| `recLVk6eAbYMmS3xW` | SANDBOX_SinFactores_T-AUDIT-CLOSE | 09-23 | sandbox de T-AUDIT-CLOSE, sin params, no activo — NO escribir |
| `recQ9aR23JNI5qg5h` | SANDBOX_TAUDITCLOSE_Cliente_Sin_Factores | 09-23 | ídem |

## 5 · Otros records con uso (sin duplicado detectado)

`rec5fsRjNbLt9VcFt` Banco Estado (6 links, todas canceladas) · `recF3UI4qlah44VrN` BCI Mutuos
(4, todas canceladas). El resto de la base (≈40 records 06-08 de un solo ejemplar) tiene 0 links.

## 6 · Semillas dudosas (dimensión del cambio)

- `factor_seguro = 0.825` (sospecha errata RB-53): **37 records**.
- `factor_garantia = 0.8`: **77 records** (todos los no-vacíos).
- Distribuciones completas: `factor_seguro` {1: 22 · 0.825: 37 · 0.8: 18 · vacío: 15} ·
  `tasa_cap_rate` {0.045: 68 · 0.06: 9 · vacío: 15} · `redondeo_decimales` {2: 1 · vacío: 91}.

## 7 · Columnas de parámetros — veredicto de schema

| Campo | FIELD_ID | Veredicto |
|---|---|---|
| `factor_seguro` | `fldjC67OGZOfIRMEc` | **VIVA** (77/92 con valor) — es la columna a escribir ✓ FIELD_ID coincide con el esperado |
| `factor_seguro_incendio` | `fldS1GpxuH5BnCpqg` | **MUERTA** — vacía en los 92 records; NO escribir |
| `factor_garantia` | `fldbv6nAdOsR9rCQQ` | viva |
| `tasa_cap_rate` | `fldT6zd1COvckWgqq` | viva |
| `redondeo_decimales` | `fldoFQQCsBpZ7yS9L` | **existe** (number), poblada solo en `recwxQlPhJTXgig93` |
| `Hoja planilla` | `fld9M9R6nUPpdfdvA` | singleLineText — en los 06-04 dice "Importado desde madre.xlsm hoja Variables" |
| `codigo` / `Prefijo codigo` / `nombre` | `fldJIOvjLEUZOHzrX` / `fldQt36ISMJjZtLL3` / `fldDGR9WLhOtIbikW` (primary) | identificación |
