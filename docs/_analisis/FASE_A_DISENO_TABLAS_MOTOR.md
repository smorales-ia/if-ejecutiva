# Fase A · Diseño de tablas del motor (OCC + Terreno) — MET-6283

> **Entregable de diseño. No es ejecución.** No se tocó `C_Formulas` ni Airtable (R5).
> No se propone infraestructura nueva más allá de tablas + campos (R7).
> Objetivo: reproducir **1:1** el cálculo del xlsm, no solo el caso MET-6283.
> **Fuentes:** `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` (hoja `Portada`,
> filas 50-78, auditada celda por celda) · schema real Airtable base `app9G7lLkIV3CpeLa` vía MCP
> (`get_table_schema`, 2026-09-18) · `docs/_analisis/AUDITORIA_XLSM_MET6283_OCC_TERRENO.md` ·
> `docs/_analisis/PROPUESTA_MOTOR_v32_fix_MET6283.md` (v2).

---

## Sección 1 — Hallazgos del xlsm (evidencia por celda)

### 1.1 · El motor es un solo "Cuadro de Valoración" (`Portada!B50:BI58`)

El xlsm **no** tiene tablas separadas para terreno y OCC. Tiene **un único cuadro** de 8 filas
(51-58) donde cada fila es un ítem, discriminado por la columna `B` ("Item"). Terreno, Edificación,
Piscina, OO.CC., Bodega y Estacionamientos son **valores del mismo desplegable**, no tablas distintas.

**Encabezados reales (fila 50) y rol de cada columna:**

| Col | Encabezado | Rol | ¿Input o derivado? |
|---|---|---|---|
| `B` | Item | Tipo de bien (discriminador) | input · lista |
| `G` | Detalle Item valorado | Glosa libre | input |
| `O` | Rol SII | Rol del ítem | input |
| `T` | Año | Año construcción | input |
| `V` | Tipo | Materialidad (código) | input · lista |
| `Y` | Situación Municipal | Regularización | input · lista |
| `AE` | Estado | Estado conservación (código) | input · lista |
| `AG` | Grntía. | Garantía (N/D · D) | input · lista |
| `AJ` | Origen Super. | Origen de la superficie | input · lista |
| `AN` | Superficie m² | Superficie / cantidad | input |
| `AT` | UF/m² Nuevo | Valor unitario | input |
| `AX` | D. F. | Factor depreciación | input |
| `BA` | F. M. | Factor mercado | input |
| `BD` | UF/m² | `= BA*AX*AT` | **derivado** |
| `BH`/`BI` | Valor total UF | `= BD*AN` (con guardas) | **derivado** |
| `BN`/`BO` | Valor Seguro | por cliente/tipo | **derivado** |
| `BV` | Valor Liquidación | `= BI * AU78` | **derivado** |
| `BZ`/`CA`/`CB` | Bienes no garantía | por situación/estado/garantía | **derivado** |

### 1.2 · Listas de validación (definen los dominios de los inputs) — evidencia directa

Extraídas de las *data validations* del rango `B51:BA58`:

- **`B` (Item):** `Edificación, Terreno, Estac. Cub, Estac. Desc, Estac. U/Goce, Bodega, Piscina, OO.CC`.
- **`Y` (Situación Municipal):** `$CF$48:$CF$50` = `Regularizado`, `S/Reg, Regularizable`, `S/Reg, No Regularizable`.
- **`AE` (Estado):** `E, B, N, D, M, OG, TE`.
- **`AG` (Grntía.):** `N/D, D`.
- **`AJ` (Origen Super.):** `Escritura, M. Laser, Plano Muni., Plano Prop.`.
- **`V` (Tipo/materialidad):** `AC, HA, AL, PI, MA, AD, BA, CA, CE, SA, SB, TA, W`.
- `AT`, `AX`, `BA`, `T`: numéricos (sin lista).

### 1.3 · Fórmulas terminales del cuadro (traducidas)

```
BD[i] = BA * AX * AT                          UF/m² efectivo por fila
BI[i]  (Terreno)     = BD * AN                 sin guarda de situación
BI[i]  (Edif./OCC)   = IF(Y="S/Reg, No Regularizable","0,00", BD*AN)
BO[i]  (Seguro)      = IF(OR(B="Estac. U/Goce", B="Estac. Desc", B="Terreno",
                             Y="S/Reg, No Regularizable"), 0, BI * factor_cliente_tipo)
BV[i]  (Liquidación) = IF(Y="S/Reg, No Regularizable", 0, BI * AU78)   ; AU78=0,825 (velocidad venta)
BZ[i]  (No garantía) = IF(OR(Y="S/Reg, No Regularizable", AE="M", AG="D"), 1)
```

**Agregados por exclusión (SUMIF sobre la columna `B`):**
```
TOTAL EDIFICACION  BI59 = SUMIF(B,"Edificación",BI) + SUMIF(B,"Ampl No Reg.",BI)   = 8.157,06
TOTAL TERRENO      BI61 = SUMIF(B,"Terreno",BI)                                     = 11.218,80
TOTAL OCC          BI60 = SUM(BI51:BI58) - BI59 - BI61                              = 750
UF/m² terreno efec BD61 = BI61 / AN61  = 11.218,80 / 5.024,86                        = 2,2327
VALOR COMERCIAL    BI62 = BI59 + BI60 + BI61                                         = 20.125,86
```

### 1.4 · Caso MET-6283 en el cuadro (constantes tipeadas por el tasador)

| Fila | B | G | AN | AT | AX | BA | BI |
|---|---|---|---|---|---|---|---|
| 51 | Terreno | Terreno | 1.402,35 | 8,00 | 1 | 1 | 11.218,80 |
| 52 | Terreno | Servidumbre | 3.622,51 | 0,00 | 1 | 1 | 0 |
| 53 | Edificación | Piso 1 | 249,91 | 34 | 0,96 | 1 | 8.157,06 |
| 54 | Piscina | Piscina | 1 | 350 | 1 | 1 | 350 |
| 55 | OO.CC | Quincho, terrazas, bodega | 1 | 250 | 1 | 1 | 250 |
| 56 | OO.CC | Cierros, pavimento exterior | 1 | 150 | 1 | 1 | 150 |

El **corte útil vs. excedente del terreno son dos filas** (útil @8, excedente @0), tipeadas a mano.
No hay lookup ni regla automática (confirmado por Héctor/Óscar 2026-09-18). El "2,23 UF/m²" es un
promedio derivado, no un input.

### 1.5 · HALLAZGO CRÍTICO — la base ya tiene el cuadro 1:1: `TX_ItemsCuadroValoracion`

`TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`) **es** el Cuadro de Valoración del xlsm, reproducido
campo por campo y fórmula por fórmula. Verificado vía `get_table_schema` (2026-09-18). Campos activos
(referenciados por las fórmulas de la tabla):

| FIELD_ID | Rol (≈ col xlsm) | Tipo / dominio |
|---|---|---|
| `fld5HVdWpMY0jWqkx` | tipo_bien (`B`) | singleSelect: Edificacion · Terreno · OO.CC. · Piscina · Estac. U/Goce · Estac. Desc · Bodega · Terraza · Subterraneo · Otro |
| `fldH2znpRjC3LYrVe` | detalle/glosa (`G`) | singleLineText |
| `fldSoAHz4I7MPTUBN` | superficie (`AN`) | number (2) |
| `fldVxo2PfoG7aQ33s` | uf_m2 (`AT`) | number (2) |
| `fld7WgYgsicMa42yv` | factor (`AX`·`BA`) | number (4) |
| `flds7AFUnTJkeUIER` | situacion_municipal (`Y`) | singleSelect: Regularizado · S/Reg Regularizable · S/Reg No Regularizable · No Aplica |
| `fldSEXp1n6hjJKWlf` | estado (`AE`) | singleSelect: B · R · M |
| `fldhJDTXUEV6tUe0H` | garantia (`AG`) | singleSelect: A · D |
| `fldZyiYfG9wcRDpsN` | unidad_medida | singleSelect: **m2 · unidad** |
| `fldbE6UeloY9opfoJ` | orden | number (0) |
| `fldAJmNknr5HImlXr` | materialidad (`V`) | singleSelect: Hormigon armado · Albanileria · Acero · Madera · Mixto |
| `fld8atIwbxSbOlsgq` | solicitud | link → `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`) |
| `fldLWZnO0qUGcbaay` | unidad | link → `TX_Unidades` (`tbl2QDLvJDyy3Rg2I`) |

**Fórmulas — traducción literal del xlsm:**

| FIELD_ID | Fórmula real Airtable | = xlsm |
|---|---|---|
| `fld1F3u5J5NlnJUjY` valor_total_uf | `IF(tipo='Terreno', sup*ufm2, IF(tipo='Terraza', sup*ufm2*0.5, sup*ufm2*factor))` | `BI` (terreno sin depreciar · terraza ×0,5 · resto ×factor) |
| `flds449tIBMhA6oPs` es_bien_no_garantia | `IF(OR(sit='S/Reg No Regularizable', estado='M', garantia='D'), TRUE, FALSE)` | `BZ` |
| `fldkUZahgn9GNAocp` glosa_no_garantia | `IF(es_bien_no_garantia, CONCATENATE(tipo,' ',detalle), '-')` | `CB` |
| `fldxzIzT0kakMUbss` valor_seguro_base | `IF(OR(tipo='Estac. U/Goce', tipo='Estac. Desc', tipo='Terreno', sit='S/Reg No Regularizable'), 0, valor_total_uf)` | `BO` (exclusiones por tipo/situación) |

**Consecuencia:** el término `factor` de la tabla **colapsa `AX` y `BA` en un solo número**
(`fld7WgYgsicMa42yv`, precisión 4). Como `BA` (F.M.) es 1 en el xlsm salvo excepción, es fiel al
caso real; si algún día `BA≠1`, se multiplica dentro de `factor`. Para terreno la fórmula **no aplica
factor** (igual que el xlsm, donde el suelo no se deprecia).

**Ruido a limpiar (no bloqueante):** la tabla arrastra campos **legacy duplicados** que NO están
cableados a las fórmulas: `flddcT2wvPX38pHrE` (tipo viejo con "OOCC"/"OO.CC." mezclados),
`flddveB4mZ6sovdeR` (situación vieja), `fldMsoEuBe5IN5y1S` (estado Bueno/Regular/Malo). Fase B debe
confirmar cuáles quedan y despublicar los legacy para evitar doble fuente.

### 1.6 · Estado de `TX_ObrasComplementarias` (`tblQ1fXM06bzSQ84w`) — schema real

Verificado vía `get_table_schema`. Es una tabla **simple y paralela**, no el cuadro:

| FIELD_ID | Rol | Tipo / dominio |
|---|---|---|
| `fldZ26gSOH5t1Jbg0` | tipo_obra | singleSelect: Piscina · Quincho · Cierre perimetral · Pavimentos · Porton electrico · Otro · Cierre Perimetral *(dup)* |
| `fldNP1CweZwIGkp2q` | **valor_uf** | number (3) |
| `fldZJYjrRIuzWNbzM` | **se_deprecia** | checkbox |
| `fldMYcfh5GTnXESOZ` | fuente | singleSelect: tasador · claude · Inspeccion visual |
| `fldYTKukcjY2m09BB` | estado | singleSelect: B · R · M |
| `fldeOzrLJGT6nItcc` | (number, 0) | posible orden/cantidad |
| `fldzaBNsO7NKfCzDi` | solicitud | link → `TX_Solicitudes` |

**No tiene** `superficie`, `uf_m2` ni `factor` numérico: guarda el `valor_uf` **ya calculado** (= `BI`)
y un `se_deprecia` **booleano** (no puede representar el `AX=0,96` continuo del xlsm). Es una
proyección **lossy** del cuadro.

---

## Sección 2 — Esquema definitivo para tramos de terreno

### 2.A · Recomendación del equipo (arquitecto + motor + auditor): **NO crear `TX_TerrenoTramos`**

El xlsm modela el terreno como **filas del cuadro** con `B='Terreno'`. La base ya tiene ese cuadro
(`TX_ItemsCuadroValoracion`), con los campos y las fórmulas exactas. Crear una tabla nueva sería
**duplicar el cuadro y alejarse del xlsm**, no acercarse. La solución 1:1 es:

> **Un tramo de terreno = una fila en `TX_ItemsCuadroValoracion` con `tipo_bien='Terreno'` y
> `unidad_medida='m2'`.**

**Mapeo de columnas (terreno):**

| Necesidad (col xlsm) | Campo `TX_ItemsCuadroValoracion` | Default / validación |
|---|---|---|
| Glosa (`G`) — "Terreno" / "Servidumbre" / "Excedente" | `fldH2znpRjC3LYrVe` detalle | texto libre |
| Superficie (`AN`) | `fldSoAHz4I7MPTUBN` superficie | number (2), obligatorio |
| UF/m² (`AT`) — criterio del tasador; 0 en excedente | `fldVxo2PfoG7aQ33s` uf_m2 | number (2), default 0 |
| Situación municipal (`Y`) | `flds7AFUnTJkeUIER` | default `Regularizado` |
| Origen superficie (`AJ`) | *(no existe hoy; ver 2.C)* | opcional |
| Orden (fila 51,52) | `fldbE6UeloY9opfoJ` orden | number |
| Dueño | `fld8atIwbxSbOlsgq` solicitud | link, obligatorio |
| `factor` (`AX`·`BA`) | `fld7WgYgsicMa42yv` | **ignorado para terreno** (la fórmula no lo aplica) |

**Derivados (ya existen o se agregan como rollup en `TX_Solicitudes`):**
- `valor_tramo_uf` = `fld1F3u5J5NlnJUjY` (ya calcula `sup*ufm2` para terreno). ✅ existe.
- `F_ValorTerreno` = `SUM(valor_tramo_uf)` sobre filas `tipo_bien='Terreno'` de la solicitud (rollup).
- `uf_m2_terreno_efectivo` = `F_ValorTerreno / SUM(superficie[Terreno])` (derivado, **nunca input**).

**Ejemplo poblado — MET-6283 (2 tramos):**

| solicitud | tipo_bien | detalle | superficie | uf_m2 | valor_tramo_uf |
|---|---|---|---|---|---|
| VP-2026-0066 | Terreno | Terreno | 1.402,35 | 8,00 | 11.218,80 |
| VP-2026-0066 | Terreno | Servidumbre | 3.622,51 | 0,00 | 0 |

→ `F_ValorTerreno = 11.218,80` · `uf_m2_terreno_efectivo = 11.218,80 / 5.024,86 = 2,2327`.

**Segundo caso distinto (regla visible en el cuadro, no en MET-6283):** la fórmula
`fld1F3u5J5NlnJUjY` tiene rama **`tipo='Terraza' → sup*ufm2*0.5`** (la terraza se valora al 50 %),
que en el xlsm corresponde a `BI52` con `IF(AND(G="Terraza",AU3="Departamento"),…)`. Es un tramo
tipo `Terraza` con superficie y uf_m2 que aplica el 0,5 automáticamente — demuestra que el modelo de
filas del cuadro ya cubre variantes que una `TX_TerrenoTramos` plana no tendría.

### 2.B · ¿El corte útil/excedente requiere un campo adicional? — **No**

El corte lo hace el tasador creando **dos filas** y poniendo `uf_m2=0` en el excedente. No requiere
un flag `es_excedente` ni un campo nuevo: `detalle` + `uf_m2` lo capturan. Confirmado por
Héctor/Óscar (siempre criterio del tasador, sin tabla). El único campo con impacto de cálculo que
conviene poblar es `situacion_municipal` (`flds7AFUnTJkeUIER`), porque afecta liquidación y la
clasificación de bienes-no-garantía (fórmulas `BV`/`BZ`); para terreno regularizado va `Regularizado`.

### 2.C · Único gap de esquema detectado

`TX_ItemsCuadroValoracion` **no tiene** `origen_superficie` (col `AJ`: Escritura · M. Laser · Plano
Muni. · Plano Prop.). Es un input informativo del cuadro. **Sugerencia (opcional):** agregar
`origen_superficie` singleSelect con ese dominio. No bloquea el cálculo (no entra en ninguna fórmula
de valor); solo mejora la fidelidad del informe.

### 2.D · Fallback si el equipo IGUAL exige una tabla dedicada

Si por razones de UI de IF-02 se decide una tabla propia (contra la recomendación), el esquema mínimo
1:1 sería `TX_TerrenoTramos` (link `solicitud`, `glosa`, `superficie_m2`, `uf_m2`,
`situacion_municipal`, `origen_superficie`, `orden`; derivado `valor_tramo_uf = superficie_m2*uf_m2`).
**Se desaconseja**: duplica `TX_ItemsCuadroValoracion` y obliga a mantener dos cuadros.

---

## Sección 3 — Veredicto `TX_ObrasComplementarias`

### 3.1 · Comparación contra el xlsm

En el xlsm, una OCC es una fila del cuadro idéntica a las demás: `BI = AN(cantidad) × AT(unitario) ×
AX(dep) × BA(fm)`, con `unidad = "unidad"` (lump-sum, `AN=1`) o `m²`. En MET-6283 las 3 OCC van
`1 × valor × 1 × 1`. `TX_ObrasComplementarias` guarda solo `valor_uf` (el `BI` ya cocinado) y
`se_deprecia` (booleano). **Pierde** el factor continuo `AX`, el desglose `cantidad × unitario` y la
unidad de medida — cosas que `TX_ItemsCuadroValoracion` **sí** tiene (`superficie`, `uf_m2`, `factor`,
`unidad_medida`).

### 3.2 · Veredicto: **MIGRAR** — consolidar OCC en `TX_ItemsCuadroValoracion`

La solución **más idéntica al xlsm** no es ni "mantener valor_uf+se_deprecia" ni "agregarle columnas
a `TX_ObrasComplementarias`": es **usar el mismo cuadro** que el resto de los ítems. Una OCC es una
fila de `TX_ItemsCuadroValoracion` con `tipo_bien ∈ {OO.CC., Piscina, Bodega, Estac. U/Goce, Estac.
Desc}` y `unidad_medida='unidad'`. Así:
- El desglose `cantidad × unitario × factor` ya está (`superficie` × `uf_m2` × `factor`).
- `se_deprecia` booleano se reemplaza por `factor` numérico (0,96, 0,80, …), fiel al `AX` del xlsm.
- Seguro y no-garantía salen de las mismas fórmulas (`BO`/`BZ`) que ya exclusen Estac. y aplican
  situación municipal — sin lógica aparte.

**Esquema final (OCC dentro de `TX_ItemsCuadroValoracion`) — reutiliza los campos de 1.5:**

| Necesidad | Campo | Ejemplo MET-6283 |
|---|---|---|
| tipo_bien | `fld5HVdWpMY0jWqkx` | Piscina / OO.CC. |
| detalle | `fldH2znpRjC3LYrVe` | "Piscina" / "Quincho, terrazas, bodega" |
| cantidad/superficie | `fldSoAHz4I7MPTUBN` | 1 |
| valor unitario | `fldVxo2PfoG7aQ33s` | 350 / 250 / 150 |
| factor (dep·fm) | `fld7WgYgsicMa42yv` | 1 |
| unidad_medida | `fldZyiYfG9wcRDpsN` | unidad |
| solicitud | `fld8atIwbxSbOlsgq` | VP-2026-0066 |
| valor_total_uf (derivado) | `fld1F3u5J5NlnJUjY` | 350 / 250 / 150 |

→ `F_ValorOCC = SUM(valor_total_uf)` sobre filas `tipo_bien ∈ OCC` = **750**.

### 3.3 · Rol residual de `TX_ObrasComplementarias`

Puede seguir como **captura rápida de IF-02** (checklist del tasador), pero **no** como fuente del
motor: el DAG debe leer `TX_ItemsCuadroValoracion`. Si se conserva, documentarla como *input de UI que
se proyecta a filas del cuadro*. Si no aporta a la UI, marcarla **deprecada**. Decisión ejecutiva para
Fase B; ambas opciones dejan el motor leyendo el cuadro único (1:1 con el xlsm).

---

## Sección 4 — Diferencias vs. la Propuesta v2

| Punto v2 | Qué cambia en v3 | Por qué |
|---|---|---|
| **P4.b: crear `TX_TerrenoTramos` (tabla nueva)** | **Se elimina.** Los tramos de terreno son filas de `TX_ItemsCuadroValoracion` (`tipo_bien='Terreno'`). | El xlsm tiene un solo cuadro; la base ya lo replica 1:1 (fórmulas `BI`/`BZ`/`BO`). Crear otra tabla duplica y diverge. |
| **P4.a: `TX_ObrasComplementarias` como fuente OCC del motor** | OCC pasan a `TX_ItemsCuadroValoracion` (`tipo_bien ∈ OCC`); `TX_ObrasComplementarias` queda como captura o se deprecia. | `valor_uf`+`se_deprecia` es proyección lossy; el cuadro tiene el desglose y las fórmulas exactas. |
| **P1: `F_ValorComercialUF = F_ValorEdificacion + F_ValorTerreno + F_ValorOCC`** | Igual, pero los 3 agregados son **rollups/SUMIF sobre `TX_ItemsCuadroValoracion`** por `tipo_bien`, replicando `BI59/BI60/BI61`. | Fuente única = el cuadro. |
| **P2/P3** | Sin cambio de fórmula; sus insumos (`F_ValorOCC`, edificación depreciada) salen del cuadro. | — |
| **`uf_m2_terreno_efectivo` como derivado** | Confirmado: `= F_ValorTerreno / Σ superficie[Terreno]` (rollup), nunca campo de `TX_DatosTasacion`. | Idéntico a `BD61`. |
| **P5 (velocidad de venta) · P6 (sub-lotes)** | P5 sin cambio; **P6 se resuelve por `TX_ItemsCuadroValoracion`** (filas de terreno), no por tabla nueva. | — |

---

## Sección 5 — Checklist para Fase B (cambios exactos)

**Airtable (base `app9G7lLkIV3CpeLa`) — requiere aprobación explícita antes de ejecutar:**

1. [ ] Confirmar nombres reales de los FIELD_IDs de `TX_ItemsCuadroValoracion` listados en §1.5 vía
   `list_tables_for_base` (aquí se referencian por ID, que es estable — convención del repo).
2. [ ] Despublicar / marcar legacy los campos duplicados no cableados: `flddcT2wvPX38pHrE`,
   `flddveB4mZ6sovdeR`, `fldMsoEuBe5IN5y1S` (evitar doble fuente de tipo/estado/situación).
3. [ ] (Opcional) Agregar `origen_superficie` (singleSelect: Escritura · M. Laser · Plano Muni. ·
   Plano Prop.) a `TX_ItemsCuadroValoracion` — §2.C.
4. [ ] **No crear `TX_TerrenoTramos`.**
5. [ ] Decidir destino de `TX_ObrasComplementarias`: captura de UI (proyecta a cuadro) **o** deprecar.
   No usarla como fuente del motor.

**`C_Formulas` / DAG (`AT03_Calculos_DAG.js`) — Fase B, no ahora:**

6. [ ] `F_ValorTerreno` = `SUMIF(TX_ItemsCuadroValoracion.valor_total_uf, tipo_bien='Terreno')` por solicitud.
7. [ ] `F_ValorOCC` = `SUMIF(valor_total_uf, tipo_bien ∈ {OO.CC., Piscina, Bodega, Estac. U/Goce, Estac. Desc})`.
   (Definir OCC "por exclusión" = total − edificación − terreno, replicando `BI60`, si se prefiere el patrón del xlsm.)
8. [ ] `F_ValorEdificacion` = `SUMIF(valor_total_uf, tipo_bien='Edificacion')`.
9. [ ] `uf_m2_terreno_efectivo` (derivado) = `F_ValorTerreno / SUMIF(superficie, tipo_bien='Terreno')`.
10. [ ] Migrar el lector de OCC del DAG: de `TX_ObrasComplementarias` a `TX_ItemsCuadroValoracion`.
11. [ ] Aplicar P1/P2/P3 (propuesta v3 §2) consumiendo los rollups anteriores. Bumpear versión.

**Datos (Fase C):**

12. [ ] Retrocargar el cuadro de MET-6283 (VP-2026-0066): 2 filas Terreno + 1 Edificación + 3 OCC (§1.4).

**Regresión (Fase D):**

13. [ ] `SUM(valor_total_uf)` de las 6 filas = 20.125,86 UF; terreno 11.218,80; OCC 750; efectivo 2,2327.

---

**Estado:** Fase A cerrada (diseño). Sin cambios en Airtable ni `C_Formulas` (R5). Sin infraestructura
nueva propuesta (R7): la recomendación es **reutilizar** `TX_ItemsCuadroValoracion`, no crear tablas.
