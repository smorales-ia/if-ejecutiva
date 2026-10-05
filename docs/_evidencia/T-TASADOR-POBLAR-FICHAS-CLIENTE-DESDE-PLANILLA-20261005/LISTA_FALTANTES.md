# LISTA_FALTANTES — clientes sin valores utilizables o con cruce pendiente

**Tanda:** T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005 · CONSOLIDACIÓN · 2026-10-05
**Formato:** cliente → qué falta → qué preguntar a Héctor. Nada de esto se escribió en Airtable.

## 1 · Sin fuente en ninguna de las dos planillas (3)

Hojas de la planilla maestra que **no existen** como cliente en el template de cálculo
(`FICHA SOLIC!K8` no las ofrece): si se tasan, lo hacen bajo otro nombre o con lista
desactualizada (drift entre libros).

| Cliente (hoja planilla) | Qué falta | Pregunta a Héctor |
|---|---|---|
| HIPOTECARIA LA CONSTRUCCION (HLCO) | fs/fg, cap y redondeo — sin fila en el template | ¿Sigue operativa? ¿Con qué nombre se tasa hoy (¿"Particular"?) y qué factor/tasa le corresponde? ¿Su record es HLCO (06-04) o "La Construcción Hipotecaria" (06-08, fs=1)? |
| EXTERIOR | Todo — sin fila en el template | ¿Qué cliente es "EXTERIOR"? ¿Activo? ¿Factores? |
| FINANCIERA Y HABITACIONAL | Todo — sin fila en el template | Ídem: ¿activo, bajo qué nombre del template se tasa, con qué factores? |

## 2 · Los 12 records sin parámetros — verificados contra `backup-mclientes.json`: **los 12 siguen vacíos**

Precisión: 11 de los 12 pertenecen a **grupos que SÍ tienen propuesta en el template** (vía su
record hermano o el match por nombre) — lo que falta no es la fuente sino la **decisión de qué
record del grupo poblar/conservar**. Son los esqueletos del import 06-04.

| Record vacío (06-04) | record_id | ¿Propuesta en template? | Pregunta a Héctor |
|---|---|---|---|
| NUEVO CAPITAL | rec532kYmluOreV3m | Sí (N=33, 0,8 base) | ¿Conservar este o "Nuevo Capital Mutuos Hipotecarios"? (nota: la planilla trae `NUEVO CAPITAL␣` con espacio final) |
| AFIANZA | rec6ulVTTtCUeD8QO | Sí (N=9, 1,0) | ¿Activo es este (con historial cancelado) o "Afianza" 06-08? |
| UNIDAD LEASING HABITACIONAL | rec9AnivjtqivJcEB | Sí (N=3, 1,0 · 6,0%) | ¿ULH es lo mismo que "ULH (BICE) Leasing"? ¿Y qué relación con los records BICE? |
| VALOR PRESENTE (VLP) | rec9UF0Fj4er7OVA0 | Sí (N=31, 0,8 base) | ¿Conservar este o "Valor Presente (VP)"? |
| PARTICULARES | recFZ9Nvbo2EICHPS | Sí (N=10, 0,8 base) | ¿Conservar este o "Particular"? Ojo colisión de código `PAR` con "Paris Crédito Hipotecario" |
| BANCO DE CHILE | recOfiHWwHEUzgPCw | Sí (N=16, 0,8 base) | Tiene 10 solicitudes históricas (todas canceladas); el 06-08 tiene fs=1 que contradice el template (0,8 base). ¿Cuál vale y cuál record queda? Además prefijo `BCH` duplicado con Bice en el template |
| ANDES | recKaRXnwtqbM0qkJ | Sí (N=8, 1,0) | ¿Conservar este o "Administradora Andes S.A."? |
| CREDIHOME | recb9KnrD9wYvCp22 | Sí (N=15, 1,0 · 6,0%) | ¿Conservar este o "Credihome (CRD)"? |
| METLIFE | recimE810cuyWIR9q | Sí (N=2, 0,8 base + Casa→1,0) | Esqueleto puro; el ACTIVO es recIg8NtVhptXkEUJ. ¿Depurar? |
| CHILE VIVIENDA | recqlmHfjwAsyJVNU | Sí (N=12, 1,0) | ¿Conservar este o "Chilevivienda"? |
| 4LIFE | recngf122DQ5Tevtu | Sí (N=11, 0,8 base) | Esqueleto; el ACTIVO es "4 LIFE" receWMWb6Qwe1gsnC. ¿Depurar? |
| SERVIHABIT | reco6l8flOx08T4bg | Sí (N=17, 0,8 base) | ¿Conservar este o "ServiHabit (SVH)"? |

## 3 · Records de M_Clientes sin contraparte en template NI en planilla (17)

Quedarían con su seed actual (mayoría `fs=0,825` sospechoso o `fs=1` sin respaldo) aunque se
aprobara poblar desde el template. Ninguno tiene solicitudes vigentes.

| Record (06-08 salvo nota) | Seed actual fg·fs·cap | Pregunta a Héctor |
|---|---|---|
| Aseguradora Continental (ASE) | 0,8 · 1 · 0,045 | ¿Cliente real de tasaciones? ¿De dónde salió el fs=1? |
| BBVA Hipotecaria (BBV) | 0,8 · 1 · 0,045 | ¿Vigente? (BBVA Chile no existe desde 2018) |
| Banco Falabella (FAL) | 0,8 · 0,8 · 0,045 | ¿Vigente? ¿Factor confirmado? |
| Banco Itaú (CIT) | 0,8 · 1 · 0,045 | ¿Vigente? ¿fs=1 real? |
| Banco Ripley (RIP) | 0,8 · 0,8 · 0,045 | ¿Vigente? |
| Citi Mutuos (CIM) | 0,8 · 1 · 0,045 | ¿Vigente? |
| Eurocapital (EUR) | 0,8 · 0,8 · 0,045 | ¿Vigente? |
| HCS / Hipotecaria Compass (HCS) | 0,8 · 1 · 0,045 | ¿Vigente? |
| HLC Hipotecaria Continental (HLC) | 0,8 · 1 · 0,045 | ¿Relación con HLCO/La Construcción? (tres nombres parecidos) |
| Mi Hipoteca (MIH) | 0,8 · 1 · 0,045 | ¿Vigente? |
| Mutuosa (MUT) | 0,8 · 0,8 · 0,045 | ¿Vigente? |
| Paris Crédito Hipotecario (PAR) | 0,8 · 1 · 0,045 | ¿Vigente? Código `PAR` colisiona con PARTICULARES |
| Sim Hipotecaria (SIM) | 0,8 · 1 · 0,045 | ¿Vigente? |
| VALÓN Hipotecaria (VAL) ×2 — rec4rTNuxSjucS6XM (06-08) y recIXx6xMAGnOZT7T (06-09) | 0,8 · 1 · 0,045 (idénticos) | Par idéntico: ¿cuál sobra? ¿Cliente vigente? |
| Vivienda Plus (VIV) | 0,8 · 1 · 0,045 | ¿Vigente? |
| Scotia Crédito Hipotecario (SCO) | 0,8 · 1 · 0,045 | ¿Es lo mismo que "Scotiabank" (SCB) / "Scotiabank" del template (SCTB)? |

## 4 · MATCH-DUDOSO — cruces que hay que confirmar antes de escribir (17 renglones de mapeo.md)

| Cliente template | Ambigüedad | Pregunta a Héctor |
|---|---|---|
| Bice Hipotecaria (N=14) ↔ Banco de Chile (N=16) | **Prefijo `BCH` duplicado en el template** para ambos; en M_Clientes conviven BICE MUTUOS / BICE Hipotecaria / BICE Leasing / ULH (BICE) Leasing | ¿Qué record representa a "Bice Hipotecaria" del template? ¿BICE Leasing y ULH (BICE) son líneas de negocio distintas con factores propios? |
| ICGE (N=22) | Hoja `ICGE␣` con **espacio final**; par ICGE / ICGE Internacional; tasa en disputa (ver §5) | ¿ICGE e ICGE Internacional son el mismo cliente? ¿Tasa 4,5% (fórmula vigente) o 6,0% (intención de la rama muerta + record ICGE Internacional)? |
| Nuevo Capital (N=33) | Empresa `NUEVO CAPITAL␣` con **espacio final** en la planilla | Al cruzar por nombre, ¿normalizamos el trim? (mismo patrón que `sucursal_originadora` en Airtable) |
| Copeuch (N=19) | Template "Copeuch" vs record "Coopeuch" (COR vs COPE) | ¿Mismo cliente (la cooperativa Coopeuch)? |
| Central Mutuos (N=34) | Hoja CHI **inferida**; record "CENTRAL HIPOTECARIA" vs "Central Mutuos" | ¿CENTRAL HIPOTECARIA = Central Mutuos? |
| Banco Santander-Chile (N=37) | Solo existe "Santander Hipotecaria" (SAH); prefijo BSAN sin record | ¿Mismo cliente o dos? |
| Scotiabank (N=40) | Dos records (Scotiabank SCB / Scotia Crédito Hipotecario SCO); prefijo SCTB sin record | ¿Cuál es el bueno? |
| M&V (N=5) · MásLeasing (N=6) · Andes (N=8) · Particular (N=10) · Chile Vivienda (N=12) · Concreces (N=13) · Penta Hipotecario (N=26) · Tessi (N=35) · CrediTú (N=36) · ULH (N=3) | Par MAYÚSCULAS 06-04 vs nombre largo 06-08, ninguno con solicitudes vigentes | Por cada par: ¿cuál record queda como canónico? (propuesta en `LISTA_DUPLICADOS.md`) |

## 5 · Conflictos de valor (2) — requieren decisión, no solo confirmación

| Cliente | Conflicto | Pregunta a Héctor |
|---|---|---|
| ICGE | Fórmula BJ41 vigente da **4,5%** (la rama `"ICGE Gestión Empresa"` jamás matchea `"ICGE"`); la intención aparente y el record ICGE Internacional dicen **6,0%** | ¿Cuál es la tasa correcta de ICGE? Si es 6,0%, el template también está mal y habría que corregir la fórmula |
| Leasing Urbano | Record vigente tiene **cap=0,06** pero el template NO lo lista en 6,0% → daría **4,5%** | ¿0,06 del seed es correcto (y el template está desactualizado) o al revés? |

## 6 · Asimetría de universos (constancia)

- **15 clientes del template sin hoja en la planilla maestra** (N=18, 19, 21, 23, 24, 25, 27,
  28, 29, 30, 32, 37, 38, 39, 40): tienen parámetros propuestos, solo que la planilla operativa
  no les lleva log. No bloquea nada; se anota por el 40-vs-28.
- **3 hojas de la planilla sin cliente en el template**: las de §1 (estas sí bloquean).
- La planilla maestra aporta 28 empresas (`Variables!G2:H29`, filas 2–29); el descubrimiento
  las cita como "29 filas" — la diferencia es la fila de cabecera, no un cliente perdido.
- **Redondeo**: `redondeo_decimales` queda sin fuente para TODOS los clientes (solo drift
  entre instancias; único record poblado: MetLife Chile S.A. rd=2, origen desconocido).
  Pregunta a Héctor: ¿existe una regla de redondeo por cliente o se abandona el campo?
