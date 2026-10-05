# DIAGNÓSTICO ORÁCULO · FASE 1 · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005

**Fecha:** 2026-10-05 · **Rol:** DIAG-ORACLE (solo lectura, cero escrituras en Airtable/código)
**Insumos:** 5 XLSM de `docs/_referencias/5tasaciones/` (openpyxl 3.1.5, abiertos con `data_only=False` para fórmulas y `data_only=True` para valores), spec `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_7.md` y `docs/_md/VProperty_Especificacion_Proyecto_v1_9_17.md`, evidencia `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/` (overrides/auditor por caso) y `docs/_analisis/CIERRE_T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005.md`, artefactos del repo (`docs/_artefactos/airtable/AT03_Calculos_DAG.js`, `docs/_analisis/PROPUESTA_MOTOR_v32_fix_MET6283.md`, `docs/_analisis/FASE_A_DISENO_TABLAS_MOTOR.md`).

**Veredicto corto:**
1. **G-1 · El 0,8 de reposición es una CONSTANTE literal de la plantilla XLSM** (texto `0.8` dentro de la fórmula de `Portada!BG72`), idéntica en los 5 libros, **condicionada a "sin terreno"** (`AN61=0`) y aplicada **solo al término de edificación a-nuevo, nunca a las OO.CC.** No referencia ninguna celda-parámetro ni ningún dato del cliente. **No es `factor_garantia`** — la coincidencia numérica con el 0,8 de M_Clientes es casual (prueba: los oráculos de AGH/ALH exigen garantía ×1,0 — G-7 — y aun así su reposición lleva ×0,8).
2. **G-2 · El factor del seguro es POR CLIENTE (y tipo de propiedad), cableado como whitelist de `ClienteN` dentro de la fórmula por-ítem `BO`**: ×1,0 si el cliente está en la lista o si `tipoPropiedad="Casa"`; ×0,8 para el resto. Multiplica el **valor comercial depreciado** de cada ítem. Ítems excluidos (van a 0): `Terreno`, `Estac. U/Goce`, `Estac. Desc` y situación `S/Reg, No Regularizable`. El **estacionamiento cubierto (`Estac. Cub`) SÍ se asegura** (C5) y las OO.CC. también.

---

## 1 · Fórmulas literales en los XLSM oráculo (verificadas libro por libro)

### 1.1 Valor de Reposición — `Portada!BG72` (etiqueta en `AN72` = "Valor de Reposición")

Fórmula **textualmente idéntica en los 5 libros** (los 4 pedidos + La Marina/C1, verificado como refuerzo):

```
=IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)
```

donde (mismas fórmulas en los 5 libros):
- `AN61 = SUMIF(B51:D58,"Terreno",AN51:AS58)` → **superficie de terreno del cuadro**. `AN61=0` ⇔ propiedad sin terreno propio (departamentos). Con terreno (casas, p. ej. MET-6283) **NO se aplica el 0,8**.
- `CD37 = SUMIF(B51:D58,"Edificación",CC37:CC44)` con `CC37..CC44 = +AN5x*AT5x` → **edificación a-nuevo** (superficie × UF/m² nuevo, SIN D.F./F.M.). Incluye la terraza cuando está clasificada como "Edificación" (C4, C5).
- `CC46 = CC45−CD37−CD38−CD39−CD40` (con `CC45=SUM(CC37:CC44)`, `CD38=Terreno`, `CD39=Box U/Goce`, `CD40=Box Desc`) → **OO.CC. a-nuevo**: todo lo que no es Edificación/Terreno/Box (incluye estacionamientos, piscina, "Ampl No Reg."). **Este término NO lleva 0,8.**

**El `0.8` es un literal dentro de la fórmula.** No apunta a ninguna celda, no hay celda-parámetro, no varía entre libros, y no depende del cliente (el mismo libro con cliente distinto daría el mismo 0,8).

| Libro (caso) | `BG72` valor | `CD37` (edif a-nuevo) | `CC46` (OO.CC.) | `AN61` | Aritmética |
|---|---|---|---|---|---|
| `AG 1548.xlsm` (C2 · AGH) | **1.115,2** | 1.394 | 0 | 0 | 0,8×1394+0 |
| `caspana 310 dp 14, quilicura.xlsm` (C3 · ALH) | **1.024** | 1.280 | 0 | 0 | 0,8×1280+0 |
| `…Las Rejas Norte 65 dp 211 P.xlsm` (C4 · Security) | **902,88** | 1.128,6 (=27×38 + 5,4×19) | 0 | 0 | 0,8×1128,6+0 |
| `HEV3183.xlsm` (C5 · Evoluciona) | **3.167,128** | 3.458,91 (=41,08×78 + 6,53×39) | 400 (Estac. Cub a-nuevo) | 0 | 0,8×3458,91+400 |
| `…La Marina 1176 dp 102 bd 13.xlsm` (C1 · MetLife, refuerzo) | **3.364** | 4.080 | 100 | 0 | 0,8×4080+100 |

Contraste con el caso Casa: en MET-6283 (golden del motor) el terreno existe (`AN61>0`) → rama sin 0,8: `CD37+CC46 = 8.496,94+750 = 9.246,94`, que es exactamente lo que la `F_ValorReposicionUF` v3.2/v3.3 actual calcula. **El gap G-1 es la rama `AN61=0` (sin terreno) que el motor no tiene.**

### 1.2 Seguro de Incendio — `Portada!BG73` (etiqueta `AN73` = "Seguro Incendio y otros")

- C2/C3/C5: `BG73 = =BO62` con `BO62 = =SUM(BO59:BU61)`.
- C4 y C1: `BG73 = =BO62` con `BO62 = =+IF(VALUE('FICHA SOLIC'!K9)=13,FIXED(Portada!DB68,0),Portada!DB68)` y `DB68 = =SUM(BO59:BU61)` — **la misma suma**, con un desvío de formato solo para `ClienteN=13`. En los 5 libros existe además el validador `DB63 = =+BO62-BG73` = 0 ("TIENE QUE SER CERO").

La suma se compone de `BO59` (ítems "Edificación"+"Ampl No Reg."), `BO60` (resto = OO.CC./estacionamientos asegurables) y `BO61` (terreno, forzado a "0,00"). La celda que decide todo es la **fórmula por-ítem `BO51..BO58`**, textualmente idéntica en los 5 libros:

```
=IF(OR(B51="Estac. U/Goce",B51="Estac. Desc",B51="Terreno",Y51="S/Reg, No Regularizable"),"0,00",
  IF(OR(ClienteN=8,tipoPropiedad="Casa"),+BI51,
    IF(ClienteN=3,+BI51*1, IF(ClienteN=5,+BI51*1, IF(ClienteN=6,+BI51*1, IF(ClienteN=7,+BI51*1,
    IF(ClienteN=9,+BI51*1, IF(ClienteN=12,+BI51*1, IF(ClienteN=15,+BI51*1, IF(ClienteN=18,+BI51*1,
    IF(ClienteN=20,+BI51*1, IF(ClienteN=21,+BI51*1, IF(ClienteN=23,+BI51*1, IF(ClienteN=28,+BI51*1,
    IF(ClienteN=29,+BI51*1, IF(ClienteN=41,+BI51*1, IF(ClienteN=43,+BI51*1, IF(ClienteN=44,+BI51*1,
    IF(ClienteN=45,+BI51*1, IF(ClienteN=46,+BI51*1, IF(ClienteN=13,+BI51*1, IF(ClienteN=34,+BI51*1,
    IF(ClienteN=8,+BI51*1, +BI51*0.8)))))))))))))))))))))))
```

Lectura de la fórmula:
- **Qué suma:** `BI5x` = valor comercial **depreciado** del ítem (`BI = BD×AN`, `BD = BA×AX×AT` — con D.F. y F.M. aplicados). No el a-nuevo.
- **Qué excluye (0):** `Terreno`, `Estac. U/Goce`, `Estac. Desc`, situación `S/Reg, No Regularizable`. **Incluye** terraza (clasificada Edificación), OO.CC. y `Estac. Cub` (C5: `BO53=320=0,8×400`).
- **Por qué factor multiplica:** ×1,0 si `tipoPropiedad="Casa"` **o** `ClienteN ∈ {3,5,6,7,8,9,12,13,15,18,20,21,23,28,29,34,41,43,44,45,46}`; **×0,8 para cualquier otro cliente** (rama final). Es un **parámetro por cliente embebido como whitelist constante en la fórmula** — conceptualmente el `factor_seguro` del cliente, NO el 0,8 de reposición (son dos 0,8 de origen distinto).
- `ClienteN` = nombre definido → `'FICHA SOLIC'!$K$9` (`=VLOOKUP(K8,V25:W63,2,0)`, número de cliente).

Factor efectivo por libro (validador `DB51 = =+BO51/BI51`, bloque "VALIDADOR SEGURO" `DB49`):

| Libro | `ClienteN` | Factor efectivo (`DB51`) | `BG73` valor | Aritmética |
|---|---|---|---|---|
| C2 · AGH | 7 (en whitelist) | **1,0** | **1.394** | 1,0×1394 |
| C3 · ALH | 20 (en whitelist) | **1,0** | **1.024** | 1,0×1024 |
| C4 · Security | 1 (NO en whitelist) | **0,8** | **857,736** | 0,8×(974,7+97,47)=0,8×1072,17 |
| C5 · Evoluciona | 4 (NO en whitelist) | **0,8** | **3.087,128** | 0,8×(3204,24+254,67+400)=0,8×3858,91 |
| C1 · MetLife (refuerzo) | 2 (NO en whitelist) | **0,8** | **2.658,56** | 0,8×3323,2 |

Nota C5: el seguro incluye el estacionamiento **cubierto** (BO53=320) porque su etiqueta `B53="Estac. Cub"` no matchea las exclusiones `Estac. U/Goce`/`Estac. Desc`. La base del seguro de C5 es el cuadro completo menos nada = 3.858,91 (coincide con el valor comercial porque no hay terreno ni estac. descubierto).

**Respuesta a la pregunta "¿el mismo 0,8 en los 4?":** sí para reposición (constante única 0,8, 5/5 libros). Para seguro, el "0,8" es la rama default por-cliente: efectivo 1,0 en C2/C3 y 0,8 en C4/C5/C1.

---

## 2 · Qué dice el spec (y dónde diverge)

### 2.1 Seguro de incendio — el spec SÍ define el factor por cliente

- **Motor v2.7** (`docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_7.md`):
  - Línea 761, cadena de cálculo: `5 valor_seguro_uf — valor_edificacion · factor_seguro` → **el factor_seguro es parte de la fórmula del seguro según spec**. El motor desplegado (rama `hay_cuadro` de `F_SeguroIncendioUF` v3.3) lo omite — el gap G-2 es una violación del propio spec.
  - Línea 848, **RB-35**: *"Factor seguro (0.8 o 1.0) depende del cliente_n y el tipo de propiedad"* → espejo exacto del mega-IF de `BO` (whitelist por `ClienteN` + excepción Casa).
  - Línea 851, **RB-53**: *"Factor garantía (0.8) y factor seguro (0.825) son campos independientes en M_Clientes"* — ⚠ el "(0.825)" de esta línea **contradice** al glosario del spec principal (1,0 o 0,8) y al oráculo (ningún libro asegura a 0,825). 0,825 es el **factor de liquidación** por velocidad de venta (`Portada!AU78`); sospecha razonable de que esta línea es el origen de los `factor_seguro=0.825` que contaminan M_Clientes (Security canónico, legacy AGENCIA/LEASING AUSTRAL). Reportar como errata de spec al carril que corresponda.
- **Spec v1.9.17** (`docs/_md/VProperty_Especificacion_Proyecto_v1_9_17.md`):
  - Línea 6822, **RN-11**: *"Factor de seguro de incendio por cliente y tipo de propiedad"*.
  - Línea 7241, glosario: *"Factor de seguro: Multiplicador (1.0 o 0.8) usado en el cálculo del valor para seguro de incendio (RN-11)"*.
  - Línea 6825, **RN-12**: factor de garantía **independiente** del factor de seguro (línea 7232: garantía default 0,8).

**Conclusión seguro:** spec y oráculo COINCIDEN (factor por cliente y tipo de propiedad, 1,0 o 0,8). El divergente es el motor desplegado. El fix de fórmula es ejecutar lo ya especificado.

### 2.2 Valor de reposición — el spec NO define el 0,8; el oráculo sí lo exige

- **Motor v2.7**, línea 763: `6 valor_reposicion_uf — valor_edificacion · OO.CC. · terreno` — solo lista dependencias, **sin mencionar el castigo 0,8** ni la condición sin-terreno.
- **Spec v1.9.17**, línea 6830, **RN-14**: *"Reposición sin terreno"* — solo nombra la regla (el terreno se excluye de la reposición); no desarrolla el ×0,8. Grep exhaustivo de `0.8`/`0,8`/`80%` en ambos documentos: ninguna aparición asociada a reposición.
- **DIVERGENCIA (spec incompleto, no contradictorio):** el oráculo prueba empíricamente (5/5 libros, fórmula literal idéntica) que la reposición de propiedades **sin terreno** castiga la edificación a-nuevo con ×0,8 y suma OO.CC. a valor pleno, y que **con terreno** no hay castigo. El spec no dice lo contrario — simplemente no lo dice. Manda el spec, pero el spec está mudo: la prueba empírica del oráculo es la única fuente del número. Recomendación para el cierre de tanda: bump de spec (Motor v2.7 §cadena de cálculo o RN-14) documentando `reposicion = (sin_terreno ? 0,8 : 1) × edif_a_nuevo + occ_a_nuevo`.

---

## 3 · Consolidación de la evidencia previa (aritmética por caso)

Fuentes: `overrides-caso{2..5}.md`, `auditor-caso{2..5}.md`, `CIERRE_T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005.md` §1-§2. "Motor sin fix" = lo que `F_ValorReposicionUF`/`F_SeguroIncendioUF` v3.3 habrían dado sin override (documentado por ejecutor y verificado por auditor ciego).

### 3.1 Reposición (gap G-1 · 4/4 casos)

| Caso · VP | Motor sin fix (a-nuevo + OO.CC.) | Override aplicado | Oráculo (`BG72`) |
|---|---|---|---|
| C2 · VP-2026-0074 (AGH) | 1.394 | `valor_reposicion_override=1115.2` | **1.115,2** |
| C3 · VP-2026-0075 (ALH) | 1.280 | `valor_reposicion_override=1024` | **1.024** |
| C4 · VP-2026-0076 (Security) | 1.128,6 | `valor_reposicion_override=902.88` | **902,88** |
| C5 · VP-2026-0077 (Evoluciona) | 3.858,91 | `valor_reposicion_override=3167.128` | **3.167,128** |

### 3.2 Seguro (gap G-2 · visible en 2/4, latente en los otros 2)

| Caso | Motor sin fix (`valor_seguro_base_items_uf`, sin factor) | Override | Oráculo (`BG73`) | Factor oráculo |
|---|---|---|---|---|
| C2 | 1.394 | — (cuadró por coincidencia) | **1.394** | 1,0 |
| C3 | 1.024 | — (cuadró por coincidencia) | **1.024** | 1,0 |
| C4 | 1.072,17 | `valor_seguro_override=857.736` | **857,736** | 0,8 |
| C5 | 3.858,91 (estac. sembrado como `OO.CC.` → entra a la base) | `valor_seguro_override=3087.128` | **3.087,128** | 0,8 |

Overrides legítimos que NO son gaps (se conservan): `tasa_cap_rate_override=0.055` en C4 (NRB-01) y `vida_util_override` 40/40/65/70 (dato del tasador, solo vista/informe).

Factores de M_Clientes citados por la evidencia (NO se releyó Airtable en esta fase; otro carril los verifica): AGH canónico `recX80z73mCtC4BBo` fs=0,8 (oráculo pide 1,0) · ALH canónico `recU6gfHmmCWZN5Mm` fs=0,8 (oráculo pide 1,0) · Security canónico `recVTKsZLNSDNInky` fs=0,825 (oráculo pide 0,8; el duplicado `recXVtuMT2wjIVzz2` tiene fs=0,8) · Evoluciona `recPDwixzybwHlJaQ` fs=0,8 (ya coincide).

---

## 4 · Contrato de validación FASE 2 — valores esperados POST-FIX, sin overrides numéricos

**Definición del fix numérico que estos valores suponen:**
- **G-1:** `F_ValorReposicionUF = valor_reposicion_override > 0 ? override : ( SIN_TERRENO ? 0.8 × valor_edificacion_nuevo_items_uf + valor_occ_items_uf : valor_edificacion_nuevo_items_uf + valor_occ_items_uf )`, con `SIN_TERRENO` espejo de `AN61=0` (recomendado: superficie de ítems `tipo_bien='Terreno'` = 0; la variante por valor también funciona en los 6 casos conocidos, pero la superficie es el predicado literal del XLSM — cubre terrenos valorados en 0 como servidumbres). El 0,8 va **hardcodeado como constante** (es constante de plantilla, no dato de cliente).
- **G-2:** rama `hay_cuadro` de `F_SeguroIncendioUF` pasa de `valor_seguro_base_items_uf` a `valor_seguro_base_items_uf × factor_seguro_efectivo`, donde `factor_seguro_efectivo = (tipo_propiedad='Casa' ? 1 : factor_seguro del cliente)` (RB-35/RN-11). **Sin cambiar las exclusiones de ítems** de `valor_seguro_base` (hoy: 0 si `Estac. U/Goce`/`Estac. Desc`/`Terreno`/`S/Reg No Regularizable` — ya es el espejo correcto del `BO`).
- **Prerrequisito de maestros (carril Airtable):** `factor_seguro` AGH 0,8→**1,0** · ALH 0,8→**1,0** · Security canónico 0,825→**0,8** · Evoluciona 0,8 (sin cambio). Sin esto, los esperados de abajo NO se cumplen (ver §5-R4).
- **Prerrequisito operativo:** retirar `valor_reposicion_override` y `valor_seguro_override` de las 4 solicitudes sandbox y re-correr AT03 — con los overrides puestos, la precedencia los enmascara y el fix es invisible.

### 4.1 Valores que DEBEN salir del motor (sin overrides) con el fix puesto

UF del día por caso: C2/C5 = 40.290,47 · C3 = 40.213,45 · C4 = 39.841,72.

| Caso · VP | `valor_reposicion_uf` | `valor_reposicion_clp` | `seguro_incendio_uf` | `seguro_incendio_clp` | ¿Seguro cambia vs hoy? |
|---|---|---|---|---|---|
| C2 · VP-2026-0074 | **1.115,2** (0,8×1394+0) | 44.931.932,144 | **1.394** (1394×**1,0**) | 56.164.915,18 | **NO** — control negativo (factor 1,0) |
| C3 · VP-2026-0075 | **1.024** (0,8×1280+0) | 41.178.572,8 | **1.024** (1024×**1,0**) | 41.178.572,8 | **NO** — control negativo (factor 1,0) |
| C4 · VP-2026-0076 | **902,88** (0,8×1128,6+0) | 35.972.292,1536 | **857,736** (1072,17×**0,8**) | 34.173.677,54592 | SÍ (hoy vía override) |
| C5 · VP-2026-0077 | **3.167,128** (0,8×3458,91+**400 sin 0,8**) | 127.605.075,67016 | **3.087,128** (3858,91×**0,8**, base incluye estac.-OO.CC.) | 124.381.838,07016 | SÍ (hoy vía override) |

Confirmación de los casos factor 1,0 pedida por la misión: **sí, son C2 y C3** — verificado en los XLSM (`DB51=1,0`, `ClienteN` 7 y 20 en whitelist) y en la evidencia (cuadraron sin override de seguro). Con los maestros corregidos a 1,0, el fix del factor es un **no-op exacto** en ambos; si su seguro cambia, el fix está mal calibrado.

### 4.2 Terminales que NO deben cambiar (tomados de `auditor-casoN.md` §3 — regresión obligatoria)

| Terminal | C2 | C3 | C4 | C5 |
|---|---|---|---|---|
| `valor_comercial_uf` (tasación) | 1.394 | 1.024 | 1.072,17 | 3.858,91 |
| `valor_comercial_clp` | 56.164.915,18 | 41.178.572,8 | 42.717.096,9324 | 155.477.297,5877 |
| `valor_remate_uf` (65%) | 906,1 | 665,6 | 696,9105 | 2.508,2915 |
| `valor_remate_clp` | 36.507.194,867 | 26.766.072,32 | 27.766.113,00606 | 101.060.243,432005 |
| `valor_liquidacion_uf` (82,5%) | 1.150,05 | 844,8 | 884,54025 | 3.183,60075 |
| `valor_liquidacion_clp` | 46.336.055,0235 | 33.972.322,56 | 35.241.604,96923 | 128.268.770,50985 |
| `avaluo_fiscal_uf` | 1.256,2748213163063 | 411,5815728 | 678,4269102839937 | 0 ("NO REGISTRA") |
| `ingreso_liquido_anual_clp` | 3.520.000 | 2.200.000 | 2.750.000 | 7.040.000 |
| `renta_perpetua_clp` | 58.666.666,67 | 48.888.888,89 | 50.000.000 | 156.444.444,44 |

(Los CLP de reposición/seguro de §4.1 sí cambian respecto del motor-sin-override actual, pero deben quedar idénticos a los que hoy produce la vía override — los auditores ya los validaron contra `BL72`/`BL73`.)

Nota sobre "garantía": el set v32 de 13 terminales que consume el ensamblador no incluye un terminal de garantía separado (ver tablas de los auditores); la garantía del oráculo sale del cuadro. No hay celda de garantía que vigilar en FASE 2 más allá de que el cuadro (`TX_ItemsCuadroValoracion`) no se toca.

### 4.3 Regresión del golden MET-6283 (obligatoria — es el caso CON terreno y Casa)

- `F_ValorReposicionUF` = **9.246,94** (rama sin 0,8: 8.496,94+750) — anclas en `lib/informe/golden-met6283.ts:158`, `lib/informe/ensamblador.test.ts:218`, `lib/tasador/motor-ports-t-mc-p0.test.ts:199`.
- `F_SeguroIncendioUF` = **8.907,0624** (base 8.157,06+750 × factor **1,0 por Casa**) — anclas en `golden-met6283.ts:163`, `ensamblador.test.ts:219`, `motor-ports-t-mc-p0.test.ts:205`.
- Bonus C1 (VP-2026-0073 · La Marina · MetLife · depto): post-fix sin overrides debería dar reposición **3.364** y seguro **2.658,56** — requiere `factor_seguro` MetLife = 0,8 para departamentos (verificar en el carril Airtable qué tiene hoy; el oráculo C1 lo fija en 0,8 vía `DB51`).

Tolerancia sugerida para FASE 2: igualdad a 6 decimales (los oráculos arrastran floats tipo 3.087,1279999999997; los auditores ya compararon así).

---

## 5 · Predicción de riesgo — dónde un fix mal calibrado rompe lo que hoy cuadra

- **R1 · Reposición sin la condición de terreno (×0,8 incondicional):** rompe el golden MET-6283 (9.246,94 → 7.547,552) y toda Casa futura. La condición `AN61=0` es parte del contrato, no un detalle.
- **R2 · Reposición usando `factor_garantia` del cliente en vez de la constante 0,8:** hoy coincidiría (todos los clientes de los 5 casos tienen fg=0,8), pero el G-7 pide corregir fg de AGH/ALH a 1,0 — hecho eso, C2 daría 1.394 (✗ 1.115,2) y C3 1.280 (✗ 1.024). La fórmula `BG72` del XLSM **no referencia al cliente**: usar la constante. Este es exactamente el "no confundir los dos 0,8" de la misión, ahora con prueba.
- **R3 · Aplicar el 0,8 también al término OO.CC.:** C5 daría 0,8×3.858,91 = 3.087,128 — que **casualmente es el valor del SEGURO de C5**, no de su reposición (3.167,128). Trampa de verificación cruzada: si FASE 2 ve 3.087,128 en reposición, el 0,8 está mal colocado. C1 también lo detecta (daría 3.284 ✗ 3.364).
- **R4 · Fix del factor de seguro SIN corregir los maestros (atómico con el carril Airtable):** con los fs actuales, C2 daría 1.394×0,8=1.115,2 (✗ — y además igual a su reposición, otra colisión confundidora), C3 819,2 (✗) y C4 1.072,17×0,825=884,54 (✗ 857,736). **Dos casos que HOY cuadran (C2/C3) pasarían a fallar.** El orden seguro es: primero maestros, después fórmula (o ambos en la misma ventana sin re-correr AT03 en medio).
- **R5 · Factor de seguro sin la excepción Casa:** si MetLife queda con fs=0,8 (lo que exige C1-depto), el golden MET-6283 (Casa) caería a 8.907,0624×0,8=7.125,65 (✗). La excepción `tipo_propiedad='Casa' → ×1` del mega-IF (RB-35) debe viajar con el fix — en la fórmula o en cómo AT03 resuelve `factorSeguro` efectivo.
- **R6 · Cambiar QUÉ ítems suma la base del seguro:** no hacerlo. La fórmula actual de `valor_seguro_base` (`fldxzIzT0kakMUbss`: 0 si `Estac. U/Goce`/`Estac. Desc`/`Terreno`/`S/Reg No Regularizable`) ya es el espejo correcto del `BO`, **siempre que los estacionamientos cubiertos se siembren como `OO.CC.`** (convención del C5; el select `tipo_item` no tiene 'Estac. Cub' — hueco de vocabulario G-11). Si se "corrigiera" excluyendo OO.CC./estacionamiento de la base, C5 daría 0,8×3.458,91=2.767,128 (✗). Riesgo residual documentado: un estacionamiento **descubierto** sembrado como OO.CC. se aseguraría indebidamente — es un problema de vocabulario del select, no de esta fórmula.
- **R7 · Overrides enmascaran la validación:** si FASE 2 re-corre AT03 sin vaciar `valor_reposicion_override`/`valor_seguro_override` de las 4 sandbox, todo "cuadrará" sin probar nada. Vaciar, re-correr, comparar contra §4.1/§4.2.
- **R8 · Señal de éxito limpia:** C2 y C3 son los controles negativos del seguro (factor 1,0 → valor idéntico) y los 4 casos comparten que **solo** reposición (+sus CLP) y, en C4/C5, seguro (+CLP) pueden moverse. Cualquier otro terminal que cambie = regresión del fix.

---
*Todos los valores de celdas provienen de lectura directa de los XLSM con openpyxl (fórmulas con `data_only=False`, valores con `data_only=True`); ningún archivo oráculo fue modificado. Ninguna lectura/escritura de Airtable en esta fase.*
