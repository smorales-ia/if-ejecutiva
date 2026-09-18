# Auditoría motor xlsm — MET-6283 · OCC y UF/m² terreno

> **Documento de referencia formal para la tanda P##-MOTOR.**
> Fuente única de verdad sobre cómo el xlsm original resuelve las Obras Complementarias (OCC)
> y el UF/m² efectivo del terreno. Reemplaza cualquier suposición previa sobre Q1 y Q2.
> **Diseño CERRADO** — confirmado por Héctor/Óscar el 2026-09-18 (ver sección al final).

**Archivo auditado:** `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm`
**Fecha auditoría:** 2026-09-18
**Estado:** solo diagnóstico. No se ejecutó ningún cambio en Airtable ni en `C_Formulas`.
**Equipo:** Arquitecto de Datos · Auditor Excel/VBA · Ingeniero de Motor · Analista de Negocio (Tasaciones).
**Método:** lectura del `.xlsm` con openpyxl (fórmulas + valores cacheados), verificación aritmética
celda por celda de los 13 valores del oráculo.

El motor completo vive en `Portada!B51:CB78` (el "Cuadro de Valoración"). Todo el cuadro
—ítem, superficie y UF/m²— se **tipea a mano** en la hoja Portada; las celdas de entrada
(`B`, `G`, `AN`, `AT`, `AX`, `BA`) son valores constantes, no fórmulas ni links. Confirmado
celda por celda. Las hojas `FICHA SOLIC` y `Zonificacion` NO alimentan el UF/m²: `FICHA SOLIC`
aporta cliente, superficies totales y rol; `Zonificacion` es una tabla maestra descriptiva
(Zona → Normativa/Demanda/Tendencia/Densidad) usada solo para el texto del informe.

---

## TAREA 1 — Ruta real del ingreso de OCC (Q1)

**Dónde se ingresa:** directamente en el Cuadro de Valoración de Portada, filas 54-56
(NO hay hoja de entrada de OCC; los campos `ooccBD/ooccAdBXC` de `FICHA SOLIC` filas 31-33
son solo los Rol SII de bodegas/box, no la valoración). El cuadro tiene 8 slots (filas 51-58)
compartidos por Terreno + Edificación + OCC; en MET-6283 las filas 57-58 quedan vacías.

**Ítems OCC de MET-6283:**

| Fila | B (tipo) | G (detalle) | AN (cant.) | AT (UF/m² ó UF unit.) | AX (D.F.) | BA (F.M.) | BD | BI (valor UF) |
|---|---|---|---|---|---|---|---|---|
| 54 | Piscina | Piscina | 1 | 350 | 1 | 1 | 350 | **350** |
| 55 | OO.CC | Quincho, terrazas, bodega | 1 | 250 | 1 | 1 | 250 | **250** |
| 56 | OO.CC | Cierros, pavimento exterior | 1 | 150 | 1 | 1 | 150 | **150** |

**Cómo se suma en Portada (BI60 = 750):** el total OCC se define **por exclusión**, no por
un SUMIF de "OCC". Es el total del cuadro menos Edificación menos Terreno:

```
BD[i]          Portada!BD54 = BA54 * AX54 * AT54            (350)
OCC_item_uf[i] Portada!BI54 = BD54 * AN54                   (= 350; idem 55→250, 56→150)
OCC_total_uf   Portada!BI60 = SUM(BI51:BI58) - BI59 - BI61  (= 750)
                              [ = total − TOTAL EDIFICACION − TOTAL TERRENO ]
```

Es decir: **cualquier fila cuyo tipo (col B) no sea "Edificación"/"Ampl No Reg." ni "Terreno"
cae en OCC.** El "AT60 = 250 UF/m²" que muestra la fila TOTAL OBRAS COMPLEMENTARIAS es
`BI60/AN60 = 750/3` y es un artefacto de despliegue (las OCC van con cantidad=1, no tienen
m² reales) — no usarlo como dato.

**Seguros OCC (BO60 = 750):** el factor de seguro NO es por ítem; es una mega-fórmula por
cliente en la columna `BO`. Para MetLife (`ClienteN = 2`) el default sería ×0,8, pero como
`tipoPropiedad = "Casa"` entra la condición `OR(ClienteN=8, tipoPropiedad="Casa")` y el factor
queda en **×1** → seguro OCC = 750.

```
OCC_seguro_uf[i] Portada!BO54 = BI54 * factor_seguro_cliente   (Casa ⇒ ×1)
OCC_seguro_total Portada!BO60 = SUM(BO51:BO58) - BO59 - BO61    (= 750)
```

**Liquidación OCC (BV60 = 618,75):** factor **global único**, no por ítem. Sale de la tabla
"Velocidad de venta" (`Portada!BZ62:CB71`) según `BF70 = "8 A 10 MESES"`:

```
factor_liq_global  Portada!AU78 = VLOOKUP(BF70, BZ62:CB71, 3, 0)   (= 0,825)
OCC_liquidacion[i] Portada!BV54 = BI54 * $AU$78                     (350 × 0,825 = 288,75)
OCC_liq_total      Portada!BV60 = SUM(BV51:BV58) - BV59 - BV61      (750 × 0,825 = 618,75)
```

**Validaciones:** no hay listas desplegables ni tope de ítems para OCC; se tipea libre en
las 8 filas. Solo hay validaciones de coherencia de Rol SII en `FICHA SOLIC` (fórmulas
`O31/O32` marcan "ERROR" si el nº de bodegas no calza con el nº de roles).

### Recomendación Airtable (Q1)
Hogar de datos: **`TX_ObrasComplementarias`** (`tblQ1fXM06bzSQ84w`, **ya existe** — campos
`tipo_obra`, `valor_uf`, `se_deprecia`, `solicitud`; el DAG ya la lee para
`sum_obras_complementarias_uf`). El gap no era de esquema sino de **poblado**.

- `valor_uf` guarda el valor UF del ítem tal como se tipea en la col AT del xlsm (las OCC son
  montos lump-sum con cantidad = 1, no requieren m² ni UF unitaria separada).
- `se_deprecia` cubre el factor D.F.; en MET-6283 las 3 OCC van sin depreciar.
- `F_ValorOCC` (agregación por solicitud) = `SUM(valor_uf)` de las filas de la solicitud → 750.
- **Seguro y liquidación NO se guardan por ítem**: seguro = valor × factor_cliente (mega-IF por
  cliente/tipo propiedad); liquidación = valor × 0,825 (factor global de velocidad de venta).
  Van como fórmulas del motor, no columnas de la tabla.

---

## TAREA 2 — Ruta real del UF/m² terreno (Q2)

**Las dos filas de Terreno (Portada 51-52):**

| Fila | G | AN (m²) | AT (UF/m²) | AX | BA | BD | BI (UF) |
|---|---|---|---|---|---|---|---|
| 51 | Terreno | 1.402,35 | **8,00** | 1 | 1 | 8 | **11.218,80** |
| 52 | Servidumbre | 3.622,51 | **0,00** | 1 | 1 | 0 | **0** |

**De dónde salen los 8,00 y 0,00:** ingreso **manual** del tasador en `AT51`/`AT52`
(valores constantes, sin lookup ni tabla). El total de terreno `supTerreno = 5.024,86`
viene de `FICHA SOLIC!K39` como **un solo número**; el tasador lo **parte a mano** en Portada
en dos tramos: superficie útil valorizada (1.402,35 @ 8) y excedente/servidumbre no valorizado
(3.622,51 @ 0). No hay regla dominio/plan-regulador en el xlsm que haga ese corte
automáticamente — es criterio del tasador.

**Rol de las columnas:** `AT` = UF/m² nuevo (input); `AX` = D.F. depreciación (input);
`BA` = F.M. factor de mercado/ajuste (input); `BD` = UF/m² efectivo por fila = `BA*AX*AT`;
`BI` = valor UF de la fila = `BD*AN`.

**El UF/m² efectivo (2,2327) es un promedio ponderado**, no un input:

```
Terreno_fila1_uf   Portada!BI51 = AN51 * (BA51*AX51*AT51)  = 1402,35 × 8 = 11.218,80
Terreno_fila2_uf   Portada!BI52 = AN52 * (BA52*AX52*AT52)  = 3622,51 × 0 = 0
Terreno_total_uf   Portada!BI61 = SUMIF(B51:B58,"Terreno",BI51:BI58) = 11.218,80
Terreno_sup_total  Portada!AN61 = SUMIF(B51:B58,"Terreno",AN51:AN58) = 5.024,86
Terreno_ufm2_efect Portada!BD61 = BI61 / AN61 = 11.218,80 / 5.024,86 = 2,2327
```

`Zonificacion` no interviene en este número (verificado: solo alimenta texto del informe vía
`ZoneVal`, basado en la comuna `AU8 = Colina`).

### Recomendación de arquitectura (Q2) — **opción (b)**

- **(a) input directo `uf_m2_terreno_efectivo`**: descartada. Guardaría el 2,2327 ya cocinado
  y perdería la trazabilidad de los tramos; no reproduce el xlsm, que primero valoriza cada
  tramo y luego promedia. Además el efectivo cambia si cambia cualquier tramo.
- **(c) homogeneización por comparables**: descartada (el xlsm no la usa).
- **(b) tabla de tramos** ✅: replica exactamente el comportamiento del xlsm (valorizar por
  tramo → sumar → dividir por superficie total).

**Esquema `TX_TerrenoTramos`** (nueva tabla, una fila por tramo, enlazada a `TX_Solicitudes`):

| Campo | Tipo | Origen xlsm |
|---|---|---|
| `solicitud` | link → TX_Solicitudes | — |
| `glosa` | singleLineText (Terreno / Servidumbre / Excedente) | Portada col G |
| `superficie_m2` | number | Portada col AN |
| `uf_m2` | number | Portada col AT |
| `factor_df` | number (def. 1) | Portada col AX |
| `factor_fm` | number (def. 1) | Portada col BA |
| `orden` | number | fila 51,52 |

- `valor_tramo_uf` (por fila) = `superficie_m2 × uf_m2 × factor_df × factor_fm`.
- `F_ValorTerreno` (por solicitud) = `SUM(valor_tramo_uf)`  → 11.218,80.
- `uf_m2_terreno_efectivo` (derivado, no input) = `SUM(valor_tramo_uf) / SUM(superficie_m2)` → 2,2327.

---

## TAREA 3 — Hallazgos complementarios

- **Factor de depreciación `f_df` (col AX):** es **manual** (0,96 en la edificación fila 53,
  1 en terreno/OCC). No hay tabla edad/vida-útil que lo produzca. La hoja "Estado Conservación"
  es una inspección **cualitativa** (Bueno/Ninguno/Funcionando), no numérica; no calcula el 0,96.
  Es juicio del tasador. → En Airtable dejar `factor_df` como input por ítem/tramo, default 1.
- **UF/m² nuevo edificación (34):** también input manual en `AT53`. El "Nuevo Capital / valor
  de reposición" se reconstruye con `CC70 = SUMIF(Edificación, AN×AT) = 249,91×34 = 8.496,94`
  (sin depreciar) y de ahí `AT59 = CC70/AN59 = 34`.
- **Factor Cliente (MetLife):** `ClienteN` se resuelve en `FICHA SOLIC!K9` vía VLOOKUP de la
  lista `V25:W63` (MetLife = **2**). El único punto donde el cliente entra al cálculo es la
  columna `BO` (Valor Seguro): mega-IF que aplica ×1 a una lista de clientes (y a cualquier
  "Casa") y ×0,8 al resto (ese 0,8 = factor garantía). Los factores 0,825 (liquidación) y 0,65
  (remate) NO son "del cliente": salen de la tabla Velocidad de Venta (`AU78`, `AU77`) por el
  plazo `BF70 = "8 A 10 MESES"`. La tasa 4,5% no aparece en el motor del xlsm (es dato de
  originación del crédito, no de la tasación).
- **Sobretasas SII (0,025% / 0,275%):** no forman parte de la cadena de valor de Portada. El
  motor solo referencia el avalúo fiscal (`FICHA SOLIC!K41 = 339.809.429`, llevado a UF en
  `BG74`) y la deuda de contribuciones como dato informativo. Las sobretasas son texto del
  informe, no entran en `BI62`.
- **Cadena de valor final (verificada):** `BI62 VALOR COMERCIAL = BI59 + BI60 + BI61 =
  8.157,06 + 750 + 11.218,80 = 20.125,86 UF`. Seguro `BO62 = 8.907,06`. Liquidación
  `BV62 = 16.603,84`.
- **VBA:** confirmado, solo UI/impresión. No hay cálculo de valor en macros.

---

## Confirmaciones Héctor/Óscar (2026-09-18)

Ambas preguntas de diseño quedaron **cerradas** con la respuesta de Héctor y Óscar:

- **Q1 (OCC):** **SE MANTIENE COMO HOY.** El factor de seguro se resuelve por cliente/tipo de
  propiedad (mega-IF de la columna `BO`: ×1 para "Casa" y lista de clientes, ×0,8 el resto).
  El factor de liquidación es **0,825**, obtenido por velocidad de venta
  (`VLOOKUP(BF70, BZ62:CB71, 3, 0)` → `Portada!AU78`, plazo "8 A 10 MESES"). No se toca la lógica.
- **Q2 (Terreno):** **SIEMPRE CRITERIO DEL TASADOR.** No hay tabla ni regla automática. El corte
  útil vs. excedente es decisión del profesional; no existe lookup por plano ni por plan
  regulador. Por eso el modelo debe guardar los tramos tal como el tasador los define, sin
  intentar derivarlos.

Mensaje enviado a Héctor/Óscar el 2026-09-18 (para trazabilidad):

> Héctor, Óscar: leímos el xlsm de MET-6283 (Los Eucaliptus 2100). Con eso cerramos las dos
> dudas: **Q1 (OCC)** las tipean directo en el cuadro de Portada (Piscina 350, Quincho 250,
> Cierros 150), el total 750 es "todo el cuadro menos Edificación menos Terreno", seguro ×1 por
> ser Casa y liquidación 750 × 0,825 (velocidad de venta "8 a 10 meses"). **Q2 (terreno)** el
> 2,23 UF/m² es promedio (11.218,80 ÷ 5.024,86); ustedes parten el terreno en dos tramos
> (1.402,35 @ 8 + 3.622,51 @ 0) a criterio. Lo replicamos con tramos de terreno. ¿Confirman que
> el factor de seguro/liquidación quedan como hoy y que el corte útil/excedente es siempre
> criterio del tasador?

---

## Impacto en Propuesta P1-P6

Con Q1 y Q2 resueltos, la propuesta del motor (`PROPUESTA_MOTOR_v32_fix_MET6283.md`) se reformula así:

- **P1 · `F_ValorComercialUF`:** reformular para consumir **`F_ValorTerreno`** (agregado de
  `TX_TerrenoTramos`) y **`F_ValorOCC`** (agregado de `TX_ObrasComplementarias`), en lugar de un
  `uf_m2_terreno_efectivo` escalar y una OCC lump-sum.
  `F_ValorComercialUF = F_ValorEdificacion + F_ValorTerreno + F_ValorOCC`.
- **P2 · `F_ValorReposicionUF`:** agregar **`F_ValorOCC`** (edificación a nuevo, sin depreciar,
  + OCC). En MET-6283: 8.496,94 + 750 = 9.246,94.
- **P3 · `F_SeguroIncendioUF`:** **excluye terreno**, suma **edificación depreciada + `F_ValorOCC`**
  y aplica el **factor de seguro por cliente/tipo** (mega-IF col BO). En MET-6283: 8.157,06 + 750
  = 8.907,06 (× factor 1 por ser Casa).
- **P4 · Inputs/catálogos:** `uf_m2_terreno_efectivo` **YA NO existe como campo de
  `TX_DatosTasacion`** — queda como **derivado calculado** (`F_ValorTerreno / Σ superficie_m2`).
  Se necesita el esquema real de **`TX_TerrenoTramos`** (tabla nueva) y validar que
  `TX_ObrasComplementarias` (ya existe) quede poblada.
- **P5 · Remate/Liquidación:** sigue **table-driven por velocidad de venta** (factor liquidación
  0,825 confirmado; no se hardcodea).
- **P6 · Terreno por sub-lotes:** **RESUELTO** por `TX_TerrenoTramos`. La deuda de modelo (predios
  con excedente valorado a 0) queda cerrada.

---

**Estado global:** diseño cerrado. Solo documento de referencia. NO se tocó Airtable ni `C_Formulas`.
