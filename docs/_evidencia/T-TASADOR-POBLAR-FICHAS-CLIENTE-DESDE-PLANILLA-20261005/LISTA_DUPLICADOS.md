# LISTA_DUPLICADOS — destilado para Héctor (recomendaciones, nada ejecutado)

**Tanda:** T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005 · CONSOLIDACIÓN · 2026-10-05
**Fuente:** `mapa-registros.md` + `backup-mclientes.json` (92 records). "Vigente" = solicitud
con estado distinto de `cancelada`. **No se depuró ni se escribió nada**: esto es la propuesta.

**Resumen:** 25 grupos con más de un record por cliente + 1 fila basura + 2 sandbox.
Patrón general: import 06-04 en MAYÚSCULAS (`Hoja planilla`="Importado desde madre.xlsm hoja
Variables") vs seed 06-08 con nombre largo; los activos reales son casi todos del 06-06.

## A · Grupos con record ACTIVO claro (6) — recomendación firme

| Grupo | CONSERVAR (vigentes) | Depurar / absorber | Nota |
|---|---|---|---|
| MetLife | **recIg8NtVhptXkEUJ** "MetLife" (05-31 · fs=1 · **3 vigentes**: 0066 asignada, 0067 pdf_listo, 0073 calculada) | recimE810cuyWIR9q "METLIFE" (06-04, vacío, 0 links) · recwxQlPhJTXgig93 "MetLife Chile S.A." (06-06, seed 0,825, **único rd=2 de la base** — rescatar ese dato antes de depurar si vale algo) | El fs=1 del activo es la rama Casa (ver mapeo.md N=2) |
| Agencia Habitacional | **recX80z73mCtC4BBo** (06-06 · **0074 calculada**) | rec8K5fUpTEoxD9yS "AGENCIA" (06-04, seed 0,825, solo 0004 cancelada) | |
| Austral Leasing | **recU6gfHmmCWZN5Mm** (06-06 · **0075 calculada**) | recklwpIt0Cv4eqk1 "LEASING AUSTRAL" (06-04, seed 0,825, 0 links) | |
| Hipotecaria Security | **recVTKsZLNSDNInky** "Hipotecaria Security S.A." (06-06 · **0076 calculada** · sin `codigo`) | recXVtuMT2wjIVzz2 "Hipotecaria Security" (06-08, fs=0,8, cod=SEC, 0 links) · recSi2XsxHtByImuI "SECURITY PRINCIPAL" (06-04, seed 0,825, cod=PRI) | Si SECURITY PRINCIPAL fuese cliente aparte, confirmar; todo indica mismo grupo. Al activo le falta `codigo` |
| Evoluciona | **recPDwixzybwHlJaQ** "Hipotecaria Evoluciona" (06-06 · **0077 calculada**) | rec8QDoxN3LGvYLcm "EVOLUCIONA" (06-04, 6 links **todas canceladas** 0006/0038/0040–0043) | No dejarse engañar por el conteo bruto: el historial es cancelado |
| 4Life | **receWMWb6Qwe1gsnC** "4 LIFE" (06-08 · **0062 visitada**, resto canceladas) | recngf122DQ5Tevtu "4LIFE" (06-04, vacío, 0059 cancelada) | |

## B · Pares sin vigentes — recomendación tentativa (confirmar con Héctor cuál queda)

Criterio sugerido: conservar el record con parámetros más defendibles y nombre canónico;
los esqueletos 06-04 vacíos no aportan nada salvo historial cancelado (que puede re-linkearse).

| Grupo | Candidato a conservar | Candidato a depurar | Nota |
|---|---|---|---|
| Afianza | rec9RA23ezRX6gi4o "Afianza" (06-08, seed) | rec6ulVTTtCUeD8QO "AFIANZA" (06-04, vacío, 2 canceladas) | |
| Banco de Chile | reciyPPDIgLcyIH07 "Banco de Chile" (06-08, fs=1 ⚠ contradice template 0,8) | recOfiHWwHEUzgPCw "BANCO DE CHILE" (06-04, vacío, **10 canceladas** — historial masivo) | Decidir el fs antes de depurar |
| Valor Presente | recdldMS9TYs9sv39 "Valor Presente (VP)" (06-08) | rec9UF0Fj4er7OVA0 "VALOR PRESENTE (VLP)" (06-04, vacío) | |
| ServiHabit | recAzjyjZW8RqzR6Z "ServiHabit (SVH)" (06-08) | reco6l8flOx08T4bg "SERVIHABIT" (06-04, vacío) | |
| Credihome | recwDkXSzFG1alEhr "Credihome (CRD)" (06-08, 0,8/0,8/0,06) | recb9KnrD9wYvCp22 "CREDIHOME" (06-04, vacío) | Template propone 1,0 (whitelist) |
| VALÓN | rec4rTNuxSjucS6XM (06-08) | recIXx6xMAGnOZT7T (06-09) | **Par 100% idéntico** (mismo nombre, mismos params); difiere solo createdTime — depurar el más nuevo |
| Andes | recW7rw9EpxapRVFj "Administradora Andes S.A." (06-08, 1 cancelada) | recKaRXnwtqbM0qkJ "ANDES" (06-04, vacío) | |
| CrediTú | recJExaBnlEVlyeuZ "CrediTú" (06-08) | recBVAW5lqBLGqQmy "CREDITU" (06-04, seed) | Params idénticos en ambos |
| Chilevivienda | recDhiwPgxjpEyX4d "Chilevivienda" (06-08, fs=1) | recqlmHfjwAsyJVNU "CHILE VIVIENDA" (06-04, vacío) | |
| Concreces | recPSVC4X8ConYKi2 "Concreces Leasing" (06-08, cap=0,06 ✓ template) | recWvXIiwahdV7otI "CONCRECES" (06-04, seed 0,045) | |
| ICGE | recphwp4pgfkgNChn "ICGE Internacional" (06-08, cap=0,06) **ó** recucWvNTRDw8QISS "ICGE" (06-04) | el otro | Depende del conflicto de tasa (LISTA_FALTANTES §5) y de si son el mismo cliente |
| La Construcción | a decidir: recxEg7RiBxtqRCfY "HIPOTECARIA LA CONSTRUCCION" (06-04, hoja HLCO real) vs rec6ETMQtes5VR7Kh "La Construcción Hipotecaria" (06-08, fs=1) | — | SIN-FUENTE en el template; ver además "HLC Hipotecaria Continental" (¿tercer nombre del mismo?) |
| M&V | reclREZKDnYh5BQTI "M&V (Munita y Vergara)" (06-08) | recH4CU7AI1eYPVM3 "M&V" (06-04, seed) | |
| Más Leasing | recYY0ebDMrZ2Qu1c "Másleasing" (06-08, cap=0,06 ✓ template) | recRC2WEkLfXkMO50 "MAS LEASING" (06-04, seed 0,045) | |
| Nuevo Capital | recfwJelCHYjuHWy4 "Nuevo Capital Mutuos Hipotecarios" (06-08) | rec532kYmluOreV3m "NUEVO CAPITAL" (06-04, vacío) | |
| Particulares | recbrHmj9YUJ01BY5 "Particular" (06-08) | recFZ9Nvbo2EICHPS "PARTICULARES" (06-04, vacío) | Colisión de código `PAR` con "Paris Crédito Hipotecario" |
| Penta | rectvgirk94PmIUKm "Penta Hipotecario" (06-04, nombre = hoja planilla) **ó** recYAAxUCRqhCDgyn "Penta Hipotecaria" (06-08, fs=1) | el otro | "Penta Vida" (rec3fQVp2hbjpsyXb) es cliente DISTINTO (N=30): no tocar |
| TESSI | rec9emcQ2xagiCyzp "TESSI Servicios" (06-08, cap=0,06 ✓ BJ41) | reckDh71r8Lm2Kv2s "TESSI" (06-04, seed 0,045) | |
| ULH / BICE | a decidir entre: rec9AnivjtqivJcEB "UNIDAD LEASING HABITACIONAL" (06-04, vacío, 0060 cancelada) · recXFlArdmTAJvvYl "ULH (BICE) Leasing" (06-08, 1,0/0,06 ✓ template) · recCveeu7mJ0Vl0Un "BICE Hipotecaria" · recb5h4CuyLp3D9c7 "BICE Leasing" · recFZQQE4RIjyHbR6 "BICE MUTUOS" (06-04) | — | El nudo más enredado de la base: hasta 5 records para 2 clientes del template (N=3 ULH y N=14 Bice). Requiere a Héctor sí o sí |

## C · Basura y sandbox (3 records)

| record_id | Qué es | Recomendación |
|---|---|---|
| **recYGkxnFlATx7Nv5** | Fila basura confirmada: nombre literal "nombre" (con BOM U+FEFF), `codigo`="codigo" — la **cabecera del CSV importada como fila** el 06-04; único 06-04 sin `activo` | **Eliminar** (cuando Héctor apruebe la depuración; 0 links) |
| recLVk6eAbYMmS3xW | SANDBOX_SinFactores_T-AUDIT-CLOSE (09-23) | Conservar o eliminar según T-AUDIT-CLOSE; **jamás poblar** |
| recQ9aR23JNI5qg5h | SANDBOX_TAUDITCLOSE_Cliente_Sin_Factores (09-23) | Ídem |

## D · Con uso histórico pero sin duplicado (constancia)

`rec5fsRjNbLt9VcFt` Banco Estado (6 links, todas canceladas) · `recF3UI4qlah44VrN` BCI Mutuos
(4, todas canceladas). No requieren depuración, solo se anotan para que el conteo de links no
confunda.

## Advertencia operativa para la depuración futura

Antes de eliminar cualquier record 06-04 con links (AGENCIA, EVOLUCIONA, BANCO DE CHILE,
AFIANZA, 4LIFE, UNIDAD LEASING HABITACIONAL), decidir qué pasa con las solicitudes canceladas
que lo linkean: re-linkear al record canónico o aceptar perder el vínculo histórico. Eso es
una tanda propia con backup y aprobación, no un efecto colateral de esta.
