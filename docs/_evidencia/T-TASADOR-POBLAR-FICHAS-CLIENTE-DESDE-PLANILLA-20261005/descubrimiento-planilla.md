# Descubrimiento de la planilla maestra — T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005 · BLOQUE 0

**Fecha:** 2026-10-05 · **Agente:** DESCUBRIR-PLANILLA (solo lectura)
**Archivo analizado:** `docs/_referencias/NUEVA_VERSION_PLANILLA MARZO 2026.xlsm` (8,2 MB, 33 hojas, openpyxl 3.1.5, `data_only=True` y `False`)

---

## HALLAZGO PRINCIPAL (condición de detención del punto 5 del mandato)

**La planilla maestra NO contiene parámetros de cálculo por cliente.** No existe en ella
`factor_garantia`, `factor_seguro`, `tasa_cap_rate` ni `redondeo_decimales` — ni como tabla,
ni como fórmula, ni como nombre definido, ni en el VBA. Es el **libro operativo de
registro/bandeja de solicitudes** de VProperty (una hoja-log por cliente + honorarios de
tasadores + listas de apoyo), no el libro de cálculo.

Los parámetros por cliente viven en **otro** libro: el template de cálculo por caso
(`Formato-Informe-VProperty-Enero2026.xlsm` y sus instancias), hardcodeados en fórmulas de
`Portada` sobre el número interno `ClienteN` definido en `FICHA SOLIC!V25:W64`. De ahí SÍ se
pudo derivar la tabla completa (sección 4), con los 4 controles del Gate en verde (sección 6).

**La tanda, tal como está formulada ("poblar desde la planilla maestra"), se detiene: la
fuente indicada no tiene los datos.** La alternativa factible es poblar desde el template de
cálculo — decisión del orquestador/Héctor (sección 7).

---

## 1. Estructura del libro

33 hojas, **todas visibles** (ninguna oculta; verificado `sheet_state` en las 33). Sin
`chartsheets` ni `macrosheets` adicionales (zip: 33 `xl/worksheets/sheet*.xml`).

| Hoja | Dimensión | Rol |
|---|---|---|
| `Inicio` | A2:V5906 | Panel: instrucciones de formato de direcciones, contadores por tasador (P. Visita / P. Entrega / Total Mes), flag Testing (`Inicio!U8`), `UFValor`=`Inicio!U2` |
| `GENERAL` | A1:XFD30147 | Log consolidado de solicitudes (todas las carteras) |
| `Informes` | A1:V296 | Apoyo de generación de informes (`fechaInforme`, `tasadorInforme`, `diasInforme`) |
| 27 hojas de cliente: `LEASING AUSTRAL`, `PRI`, `ANDES`, `HEV`, `MET`, `MAS LEASING`, `AG`, `ULH`, `PAR`, `M&V`, `CHILE VIVIENDA`, `CREDIHOME`, `CONCRECES`, `4LIFE`, `BMU`, `CREDITU`, `VLP`, `AFZ`, `ICGE ` (con espacio final), `HLCO`, `CHI`, `TESSI`, `BCH`, `Penta Hipotecario`, `SERVIH`, `NCH`, `EXTERIOR`, `FINANCIERA Y HABITACIONAL` | varias | **Log de casos por cliente**. Cabecera idéntica en todas (`MET!A1:U1`): CODIGO · DIRECCIÓN · COMUNA · FECHA SOLICITUD · FECHA VISITA · HORA · TASADOR · CLIENTE · VALOR · RUT · TIPO · ENVÌO INFORME · EJECUTIVO FORMALIZADOR · EJECUTIVO · N° SOLICITUD · OBSERVACION · FECHA FINAL · ESTADO · NOMBRE CONTACTO · FONO 1 · FONO 2. "CLIENTE" aquí es el **solicitante persona**, no el banco. |
| `Honorarios` | A1:T75 | Liquidación de honorarios de tasadores (snapshot dic-2020): dirección, código, fechas, `Hon Tasador`, retención 10%, UF |
| `Variables` | A1:BV359 | Listas de apoyo: tasadores (A:C), feriados (F), **Empresa↔Hoja (G:H)**, tipo (I: Nuevo/Usado/Repetido), comunas (K, L), ejecutivos formalizadores/comerciales por cliente (M:BV) |

### Qué se buscó y no apareció (evidencia del punto 5)

- **Barrido de rótulos** en las 33 hojas (hasta fila 6500, 80 columnas) con regex
  `garant|seguro|cap rate|redonde|factor|liquidac|reposici|deprec|\btasa\b`: solo falsos
  positivos (razones sociales "METLIFE CHILE SEGUROS DE VIDA S.A.", observaciones de casos,
  emails `@capitalseguro.cl`, direcciones "PORTO SEGURO 4210"). **Cero rótulos de parámetro.**
- **Celdas numéricas en `Variables`** (359×74): **cero** celdas numéricas fuera de las fechas
  de feriados (col F). No hay ninguna tabla de factores.
- **Nombres definidos** (25): `Feriados`, `UFValor`, `listaEmpresaNombre`→`Variables!$G$2:$G$100`,
  `listaHojaNombre`→`Variables!$H$2:$H$100`, `listaTasadores`, `listaComunas`, `listaEjec`,
  `tipoPropiedad`→`Variables!$I$2:$I$4` (= Nuevo/Usado/Repetido, **no** Casa/Depto),
  `honorarioMes`, `testing`, etc. **Ninguno apunta a parámetros de cálculo.**
- **VBA** (`xl/vbaProject.bin`, 349 696 bytes, strings ASCII y UTF-16): un solo hit y es el
  prompt "Esta seguro que quiere enviar los correos masivos?". El VBA es de envío de correos
  y registro, **sin factores**.

---

## 2. La única información "por cliente" que SÍ tiene la planilla

`Variables!G2:H29` — mapeo **Empresa ↔ nombre de hoja** (29 filas; nombres definidos
`listaEmpresaNombre` / `listaHojaNombre`):

| Fila | Empresa (`Variables!G`) | Hoja (`Variables!H`) |
|---|---|---|
| 2 | METLIFE | MET |
| 3 | SECURITY PRINCIPAL | PRI |
| 4 | PARTICULARES | PAR |
| 5 | UNIDAD LEASING HABITACIONAL | ULH |
| 6 | AFIANZA | AFZ |
| 7 | M&V | M&V |
| 8 | HIPOTECARIA LA CONSTRUCCION | HLCO |
| 9 | VALOR PRESENTE | VLP |
| 10 | EXTERIOR | EXTERIOR |
| 11 | CHILE VIVIENDA | CHILE VIVIENDA |
| 12 | BICE MUTUOS | BMU |
| 13 | CENTRAL HIPOTECARIA | CHI |
| 14 | BANCO DE CHILE | BCH |
| 15 | CREDIHOME | CREDIHOME |
| 16 | EVOLUCIONA | HEV |
| 17 | FINANCIERA Y HABITACIONAL | FINANCIERA Y HABITACIONAL |
| 18 | NUEVO CAPITAL␣ | NCH |
| 19 | SERVIHABIT | SERVIH |
| 20 | TESSI | TESSI |
| 21 | AGENCIA | AG |
| 22 | Penta Hipotecario | Penta Hipotecario |
| 23 | MAS LEASING | MAS LEASING |
| 24 | ICGE␣ | ICGE␣ |
| 25 | CONCRECES | CONCRECES |
| 26 | ANDES | ANDES |
| 27 | 4LIFE | 4LIFE |
| 28 | LEASING AUSTRAL | LEASING AUSTRAL |
| 29 | CREDITU | CREDITU |

(␣ = espacio final real en la celda — mismo patrón que `sucursal_originadora` en Airtable.)

**Importante:** el orden de esta lista NO coincide con el `ClienteN` del template de cálculo
(aquí METLIFE es la fila 1ª; en el template MetLife es `ClienteN=2` y Security es `1`). La
planilla maestra **no define ni usa `ClienteN`**.

---

## 3. Dónde viven realmente los parámetros (template de cálculo)

Verificado en `docs/_referencias/Formato-Informe-VProperty-Enero2026.xlsm` (template
canónico) y `docs/_referencias/5tasaciones/caspana 310 dp 14, quilicura.xlsm` (instancia):
**fórmulas idénticas** en ambos. Coherente con
`docs/_analisis/DESCUBRIMIENTO_REGLAS_PLANTILLAS_COMPARABLES_20261005.md`.

### 3.1 `ClienteN` — lista numerada de clientes

`FICHA SOLIC!V25:X64` ("LISTA DE CLIENTES" / "NUMEROS DE CLIENTE" / "PREFIJOS BANCO",
rótulos en `V24:X24`). `ClienteN` se calcula en `FICHA SOLIC!K9 = VLOOKUP(K8,V25:W63,2,0)`
sobre el **nombre textual** del cliente elegido en `K8`. 40 clientes, N=1…40 (tabla completa
en sección 4 y en `extraccion-planilla.json`).

### 3.2 Factor seguro/garantía — whitelist en `Portada!BO51` (fórmula textual)

```
=IF(OR(B51="Estac. U/Goce",B51="Estac. Desc",B51="Terreno",Y51="S/Reg, No Regularizable"),"0,00",
 IF(OR(ClienteN=8,tipoPropiedad="Casa"),+BI51,
 IF(ClienteN=3,+BI51*1,IF(ClienteN=5,+BI51*1,IF(ClienteN=6,+BI51*1,IF(ClienteN=7,+BI51*1,
 IF(ClienteN=9,+BI51*1,IF(ClienteN=12,+BI51*1,IF(ClienteN=15,+BI51*1,IF(ClienteN=18,+BI51*1,
 IF(ClienteN=20,+BI51*1,IF(ClienteN=21,+BI51*1,IF(ClienteN=23,+BI51*1,IF(ClienteN=28,+BI51*1,
 IF(ClienteN=29,+BI51*1,IF(ClienteN=41,+BI51*1,IF(ClienteN=43,+BI51*1,IF(ClienteN=44,+BI51*1,
 IF(ClienteN=45,+BI51*1,IF(ClienteN=46,+BI51*1,IF(ClienteN=13,+BI51*1,IF(ClienteN=34,+BI51*1,
 IF(ClienteN=8,+BI51*1,+BI51*0.8)))))))))))))))))))))))
```

- **Whitelist ×1,0:** ClienteN ∈ {3, 5, 6, 7, 8, 9, 12, 13, 15, 18, 20, 21, 23, 28, 29, 34, 41, 43, 44, 45, 46}. El resto: **×0,8**.
- **Condición transversal:** `tipoPropiedad="Casa"` → ×1,0 **sea cual sea el cliente** (no aplanar).
- `Portada!DB51 = BO51/BI51` es el ratio-validador (1 ó 0,8).
- **Un solo terminal para garantía y seguro:** el template no distingue `factor_garantia` de
  `factor_seguro` — ambos salen de `BO51`. En el JSON se pobla el mismo valor en ambos campos.
- Anomalías: `ClienteN=8` aparece dos veces (rama corta y rama muerta al final); la whitelist
  referencia **N=41,43,44,45,46 que no existen** en la lista actual (máx 40) — restos de una
  lista más larga o reserva a futuro.

### 3.3 Tasa (cap rate) — `Portada!BJ41` (fórmula textual)

```
=IF(OR('FICHA SOLIC'!K8="Unidad Leasing Habitacional",'FICHA SOLIC'!K8="ICGE Gestión Empresa",
 'FICHA SOLIC'!K8="Concreces",'FICHA SOLIC'!K8="ICGE Gestión Empresa",
 'FICHA SOLIC'!K8="Agencia Habitacional",'FICHA SOLIC'!K8="Credihome",
 'FICHA SOLIC'!K8="Másleasing",'FICHA SOLIC'!K8="TESSI"),"6,0%","4,5%")
```

- 6,0% para {ULH, Concreces, Agencia Habitacional, CrediHome, MásLeasing, Tessi} (la
  comparación `=` de Excel es case-insensitive, por eso "Credihome"/"TESSI" matchean).
- **Rama muerta:** `"ICGE Gestión Empresa"` (duplicada además) nunca matchea el nombre de
  lista `"ICGE"` → **ICGE queda hoy en 4,5%** aunque la intención aparente era 6,0%.
- **Override manual por caso:** en "Las Rejas Norte 65" (Security) `BJ41` está sobrescrita a
  5,5% literal (ver DESCUBRIMIENTO 20261005, caso 3) — la celda es editable por el tasador.

### 3.4 Redondeo

**No existe** regla de redondeo por cliente estable: en el template canónico Enero2026
`Portada!BI62='=SUM(BI59:BM61)'` (sin `FIXED`). El `FIXED(…,0)` si `ClienteN=13` se observó
solo en instancias (DESCUBRIMIENTO 20261005 §tabla de reglas) → **drift entre instancias**, no
parámetro maestro. `redondeo_decimales = null` para todos.

---

## 4. Tabla cliente → parámetros (derivada del TEMPLATE, no de la planilla maestra)

`fs base` = factor seguro/garantía base (`BO51`); todo cliente con base 0,8 pasa a **1,0 si
la propiedad es Casa**. `tasa` = `BJ41` salvo override manual por caso. Hoja planilla =
match contra `Variables!G2:H29` (**INFERIDO por nombre**; `—` = sin hoja en la planilla maestra).

| N | Cliente (FICHA SOLIC!V) | Prefijo (X) | Hoja planilla | fs base | tasa |
|---|---|---|---|---|---|
| 1 | Hipotecaria Security S.A. | HIPOTECARIA SECURITY | PRI | 0,8 | 4,5% |
| 2 | MetLife | METLIFE | MET | 0,8 | 4,5% |
| 3 | Unidad Leasing Habitacional | ULH | ULH | 1,0 | 6,0% |
| 4 | Hipotecaria Evoluciona | HEV | HEV | 0,8 | 4,5% |
| 5 | M&V | M&V | M&V | 1,0 | 4,5% |
| 6 | MásLeasing | MLS | MAS LEASING | 1,0 | 6,0% |
| 7 | Agencia Habitacional | AGH | AG | 1,0 | 6,0% |
| 8 | Administradora Andes S.A. | ANDES | ANDES | 1,0 | 4,5% |
| 9 | Afianza | AFZ | AFZ | 1,0 | 4,5% |
| 10 | Particular | PART | PAR | 0,8 | 4,5% |
| 11 | 4 LIFE | 4Life | 4LIFE | 0,8 | 4,5% |
| 12 | Chile Vivienda | CHV | CHILE VIVIENDA | 1,0 | 4,5% |
| 13 | Concreces | CCES | CONCRECES | 1,0 | 6,0% |
| 14 | Bice Hipotecaria | BCH | BMU (ambiguo, ver §5) | 0,8 | 4,5% |
| 15 | CrediHome | CRDH | CREDIHOME | 1,0 | 6,0% |
| 16 | Banco de Chile | BCH | BCH | 0,8 | 4,5% |
| 17 | ServiHabit | SVH | SERVIH | 0,8 | 4,5% |
| 18 | Credicasa Del Maule SPA | Credicasa | — | 1,0 | 4,5% |
| 19 | Copeuch | COPE | — | 0,8 | 4,5% |
| 20 | Austral Leasing Habitacional | ALH | LEASING AUSTRAL | 1,0 | 4,5% |
| 21 | Tu Hipotecaria Chile | THCH | — | 1,0 | 4,5% |
| 22 | ICGE | ICGE | ICGE␣ | 0,8 | 4,5% (rama muerta 6,0%, ver §3.3) |
| 23 | Casa Pronta | CP | — | 1,0 | 4,5% |
| 24 | Leasing Urbano | LU | — | 0,8 | 4,5% |
| 25 | Ohio National | OHNA | — | 0,8 | 4,5% |
| 26 | Penta Hipotecario | PENH | Penta Hipotecario | 0,8 | 4,5% |
| 27 | Banco Estado | BECH | — | 0,8 | 4,5% |
| 28 | Su Casa Hoy | SCAH | — | 1,0 | 4,5% |
| 29 | Casa Nuestra | CN | — | 1,0 | 4,5% |
| 30 | Penta Vida | PENV | — | 0,8 | 4,5% |
| 31 | Valor Presente | VP | VLP | 0,8 | 4,5% |
| 32 | Espacio Nuestro | EN | — | 0,8 | 4,5% |
| 33 | Nuevo Capital Mutuos Hipotecarios | NCH | NCH | 0,8 | 4,5% |
| 34 | Central Mutuos | CM | CHI (inferido) | 1,0 | 4,5% |
| 35 | Tessi | TESSI | TESSI | 0,8* | 6,0% |
| 36 | CrediTú | CrediTú | CREDITU | 0,8 | 4,5% |
| 37 | Banco Santander-Chile | BSAN | — | 0,8 | 4,5% |
| 38 | BCI | BCI | — | 0,8 | 4,5% |
| 39 | Consorcio | Consorcio | — | 0,8 | 4,5% |
| 40 | Scotiabank | SCTB | — | 0,8 | 4,5% |

\* Tessi (N=35) no está en la whitelist de `BO51` pero sí en la lista 6,0% de `BJ41` — los dos
ejes son independientes.

Hojas de la planilla maestra **sin cliente en el template**: `HLCO` (Hipotecaria La
Construcción), `EXTERIOR`, `FINANCIERA Y HABITACIONAL` — no son seleccionables en
`FICHA SOLIC!K8`; si se tasan, lo hacen bajo otro nombre (p. ej. "Particular") o con lista
desactualizada. Señal de drift entre libros.

---

## 5. Clave de cruce contra `M_Clientes`

- **Clave natural recomendada:** `M_Clientes.'Hoja planilla'` ↔ nombre de hoja de la planilla
  maestra (= `Variables!H2:H29`). Es la única clave que la planilla maestra conoce de sí misma.
- **Para los parámetros** (que vienen del template): la clave del template es el **nombre
  textual** `FICHA SOLIC!V25:V64` (es lo que consume el `VLOOKUP` de `K9`); el **prefijo**
  `FICHA SOLIC!X` debería corresponder a `M_Clientes.'Prefijo codigo'`. `ClienteN` es un índice
  interno del template: útil como columna de control, **no** como clave de negocio (depende de
  la posición en la lista y cambió históricamente — la whitelist referencia N>40 inexistentes).
- **Trampas de matching:** espacios finales reales en `ICGE ` y `NUEVO CAPITAL ` (planilla);
  nombres divergentes entre libros (SECURITY PRINCIPAL↔Hipotecaria Security S.A.,
  EVOLUCIONA↔Hipotecaria Evoluciona, AGENCIA↔Agencia Habitacional, LEASING AUSTRAL↔Austral
  Leasing Habitacional, BICE MUTUOS↔Bice Hipotecaria, CENTRAL HIPOTECARIA↔Central Mutuos);
  **prefijo `BCH` duplicado** en el template (Bice Hipotecaria N=14 y Banco de Chile N=16) —
  si `Prefijo codigo` se usa como clave, esos dos colisionan.

---

## 6. Validación de control (Gate)

Contra la regla `BO51` + lista `FICHA SOLIC` del template:

| Cliente control | Valor esperado | `ClienteN` | Derivado de `BO51` | Resultado |
|---|---|---|---|---|
| Agencia Habitacional | 1,0 | 7 | en whitelist → **1,0** | ✅ |
| Austral Leasing | 1,0 | 20 | en whitelist → **1,0** | ✅ |
| Hipotecaria Security | 0,8 | 1 | fuera de whitelist → **0,8** | ✅ |
| MetLife | 1,0 | 2 | fuera de whitelist → base **0,8**, con condición Casa→1,0 | ✅ con matiz |

**Matiz MetLife (no aplanar):** el informe que validó 1,0 es el caso
`1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm`, donde `FICHA SOLIC!K8='MetLife'`, `K9=2` y
`FICHA SOLIC!K35='Casa'` (verificado en este análisis). El 1,0 proviene de la **rama
`tipoPropiedad="Casa"`**, no del cliente. El factor-base de MetLife es **0,8**: un informe
MetLife de departamento usa 0,8 (caso "La Marina 1176", `DB51=0.8`, DESCUBRIMIENTO 20261005
caso 1). 4/4 controles consistentes con la regla.

---

## 7. Conclusión y advertencias para el Gate

1. **DETIENE la tanda tal como está formulada:** la planilla maestra
   `NUEVA_VERSION_PLANILLA MARZO 2026.xlsm` no es fuente de parámetros por cliente (evidencia §1).
   Si Héctor dijo que esa planilla es "la fuente de verdad de los parámetros", o se refería a
   otro archivo, o se refería al **template de cálculo** (`Formato-Informe-VProperty-Enero2026.xlsm`).
   Confirmar con él antes de poblar nada.
2. Si se decide poblar desde el **template**, la tabla de §4 / `extraccion-planilla.json` está
   lista, con estas advertencias:
   - `factor_seguro` es **condicional** (Casa→1,0 siempre): en Airtable hay que almacenar el
     **factor-base** y la condición vive en el motor, no en `M_Clientes`.
   - `factor_garantia` y `factor_seguro` salen del **mismo terminal** (`BO51`) — si Airtable
     los modela como dos campos, hoy valen lo mismo; cualquier divergencia sería invento.
   - `tasa_cap_rate`: rama muerta de ICGE (¿4,5% o 6,0%? — decisión de Héctor) y override
     manual observado (Security 5,5%): el campo maestro sería el default, no un invariante.
   - `redondeo_decimales`: **no poblar** — no hay fuente estable (solo drift en instancias).
   - Default silencioso ×0,8 para cliente nuevo no listado (ya levantado como P0 en
     DESCUBRIMIENTO 20261005 §brechas).
   - Whitelist con `ClienteN` 41–46 inexistentes y `ClienteN=8` duplicado en `BO51`: la fórmula
     tiene herrumbre; no tratar `ClienteN` como clave estable.

**Archivos citados:**
`docs/_referencias/NUEVA_VERSION_PLANILLA MARZO 2026.xlsm` ·
`docs/_referencias/Formato-Informe-VProperty-Enero2026.xlsm` ·
`docs/_referencias/5tasaciones/caspana 310 dp 14, quilicura.xlsm` ·
`docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` ·
`docs/_analisis/DESCUBRIMIENTO_REGLAS_PLANTILLAS_COMPARABLES_20261005.md`
