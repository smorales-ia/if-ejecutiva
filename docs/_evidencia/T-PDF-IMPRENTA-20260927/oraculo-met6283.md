# ORÁCULO T-PDF-IMPRENTA-20260927 · FASE 1 — Informe MET-6283 (PDF 8 pág. + XLSM) · Agente 4

**Fuentes:** `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` (texto + render vía pymupdf) y `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` (openpyxl, con y sin `data_only`).

**Arquitectura del XLSM:** la hoja **`Impresion`** es la única con print area (`$A$1:$BW$554`) y genera las páginas 2–8 del PDF; la página 1 sale de la hoja **`Tapa`**. Casi toda celda de `Impresion` es un espejo `=Portada!…` o `='FICHA SOLIC'!…`; la aritmética real vive en **`Portada`**. Mapeo de páginas: PDF p.2 = Impresion filas 1–85 (Hoja N°1) · p.3 = filas 86–142 (Hoja N°2) · p.4 = filas 144–217 (Hoja N°3) · p.5 = filas 219–302 (Hoja N°4) · p.6 = filas 303–386 (Hoja N°5) · p.7 = filas 387–470 (Hoja N°6) · p.8 = filas 471–554 (Hoja N°7).

---

## 3. H-T4b RESUELTO — la fórmula del −3%

**Celda impresa:** `Impresion!AY38` (formato `0%`) `=Portada!AX36`.

**Fórmula real:** `Portada!AX36 = =+IF(AX34=0,0,AX35/AX34-1)`

El −3% **compara exclusivamente la columna "UF/m² C." (UF por m² construido homologado)**:

- `Portada!AX35` (UF/m² C. de la TASACIÓN) `= +BD59` = Valor edificación ÷ superficie edificada = 8.157,0624 / 249,91 = **32,64**
- `Portada!AX34` (UF/m² C. PROMEDIO DE LA MUESTRA) `= SUM(AX29:AZ33)/COUNTIF(AX29:AZ33,">0")` = **33,64344793…**
- Cada `AX29…AX33` es la **homologación por resta de terreno y OO.CC.**: `=+IF(AM29=0,0,((AD29-(AU29*AH29)-AR29)/AM29))` → **UF/m²C ref = (Total UF − UF/m²T × Sup.Terreno − OO.CC.) ÷ Sup.Constr.**

| Ref | Cálculo | UF/m² C. |
|---|---|---|
| 1 | (20.000 − 2,2×5.051 − 750) / 239 | 34,049372 |
| 2 | (24.900 − 3,1×5.077 − 750) / 239 | 35,193724 |
| 3 | (19.500 − 2,0×5.001 − 500) / 252 | 35,706349 |
| 4 | (23.900 − 3,0×5.012 − 750) / 258 | 31,449612 |
| 5 | (18.900 − 2,0×5.000 − 500) / 264 | 31,818182 |
| Promedio | (suma de las 5) / 5 | **33,643448** |

**−3% = 32,64 / 33,643448 − 1 = −0,0298259540581235** → formato `0%` redondea a **"-3%"** (el valor real es −2,98%).

Análogo C.B.R.: `Impresion!AY46 = Portada!AX44` = 32,64/24,084478 − 1 = 0,3552297 → **"36%"**.

**Nota clave:** la TASACIÓN homologada (32,64) es `Portada!BD59` = UF/m² de la fila TOTAL EDIFICACION del cuadro (34,00 × 0,96), y el promedio usa SOLO las 5 ofertas (no CBR) en el bloque ofertas, y SOLO las 2 CBR en el bloque CBR. El motor actual (AT03 b1) homogeneiza las 7 juntas y compara contra valor_comercial/sup (80,53) — dos diferencias de base.

---

## 1. ORÁCULO DE DATOS

### Página 1 — Portada (hoja `Tapa`)

| Dato | Valor impreso EXACTO | Celda origen | Tipo |
|---|---|---|---|
| Título barra superior | `INFORME DE TASACION` | Tapa!B4 | texto (blanco s/ azul) |
| Logo | logo VALUE PROPERTY · Tasaciones Bienes Raíces | imagen embebida (única en Tapa) | imagen |
| Título 2ª barra | `ANTECEDENTES` | Tapa!B35 | texto |
| Numero Solicitud: | `METLIFE -6283` (espacio antes del guión) | Tapa!E39 | texto |
| Institución: | `MetLife` | Tapa!E40 | texto |
| Nombre Cliente: | `FRANCISCO JOSÉ VERGARA UNDURRAGA` | Tapa!E41 | texto |
| Rut: | `16.610.203-0` | Tapa!E42 | texto |
| Dirección Propiedad: | `LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO` | Tapa!E43 | texto |
| Comuna: | `Colina` | Tapa!E46 | texto |
| Región  : | `Metropolitana de Santiago` | Tapa!E47 | texto |
| Pie caja izquierda | `www.valueproperty.cl` / `Mail: info@valueproperty.cl` | Tapa!B50 / B52 | texto |
| Pie caja derecha | `Dirección: Santa Magdalena 75 Of 310, Providencia - Santiago` / `Fono: 22 500 0366` | Tapa!E50 / E52 | texto |

### Página 2 · Hoja N°1 — Identificación (Impresion filas 5–19)

Banda azul: `Nº Interno  :  METLIFE -6283` + `Hoja N°1` (BQ5).

| Etiqueta | Valor impreso | Celda impresa (origen) |
|---|---|---|
| Cliente | FRANCISCO JOSÉ VERGARA UNDURRAGA | I7 (=Portada!F3) |
| RUT Cliente | 16.610.203-0 | I8 |
| Propietario | FRANCISCO JOSÉ VERGARA UNDURRAGA | I9 (='FICHA SOLIC'!K21) |
| RUT Prop. | 16.610.203-0 | I10 |
| Ejecutivo | MONICA REYES PINTO | I11 |
| Tasador | Maria Eugenia Soto | I12 |
| Objetivo | Refinanciamiento | I13 |
| Tipo Prop. | Casa | I14 |
| Fecha Tasación | `13-04-2026` | I15 |
| Destino SII | HABITACIONAL | I16 |
| Ejecutivo (2ª) / Formalizador | (vacíos) | I17 |
| N° SOLICITUD | 900159638 | I19 |
| Dirección | LOS EUCALIPTUS | AC7 |
| Casa Nº | N°2100 | AC8 |
| Comuna | Colina | AC9 |
| Region | Metropolitana de Santiago | AC10 |
| Rol | N°882-40 | AC11 |
| Condominio | LAS BRISAS DE CHICUREO | AC12 |
| Pisos Propiedad : 1 · Subterraneos : 0 | 1 / 0 | AA13 / AL13 |
| Sitio/Lote | `A 40` | AH14 |
| Zona | `IPB(Colina)` | X15 |
| Manzana | 0 | AH15 |
| Estacionamientos Asociados / Asignados / Bodegas | 0 / 0 / 0 | AE16-18 |
| Mansarda | No | AE19 |
| DFL-2 | NO | AZ7 |
| Año Construccion | 2024 | AZ8 |
| Vida util | 70 | AZ9 |
| Permiso | `N°319  09/09/2020` | AZ10 |
| Recepcion | `N°210  18/07/2024` | AZ11 |
| Ampliación | No | AZ12 |
| Estado conservacion | BUENO | AZ13 |
| Sello SEC | `No Aplica` (celeste, Arial Narrow Bold) | AZ14 |
| Afecto a expropi. | NO | AZ15 |
| Fuente Información | DOM, Plano Catastro | AZ16 |
| Descripcion Expropiación | `De acuerdo al DOM, Plano Catastro de la Municipalidad de Colina la propiedad NO cuenta con expropiación.` | AQ18 |
| Mini-mapa "Ubicación/Empresa" | recorte de mapa con pin | imagen |

### Página 2 — Texto 1: Síntesis de la Prop. (Impresion!C22 = Portada!D12) — COMPLETO

> El bien es una vivienda que se encuentra en el Condominio LAS BRISAS DE CHICUREO, ubicado en LOS EUCALIPTUS N°2100. La propiedad tiene 5024,86 m² de terreno. La vivienda original tiene un piso construido en ALBAÑILERÍA LADRILLO. El primer piso Tiene 249,91 m² y cuenta con hall, baño de visitas, living, comedor, cocina, logia, dormitorio y baño de servicio, sala de estar familiar, 3 dormitorios simples, dormitorio principal en suite con walk in closet, 3 baños completos, el baño principal con jacuzzi. El exterior cuenta con antejardín abierto al norte con estacionamiento descubierto para 4 vehículos, patio lateral poniente de paso con bodega en construcción, patio lateral oriente con patio de servicio descubierto, patio trasero al sur con 2 terrazas descubiertas, quincho en una de las terrazas, áreas verdes, piscina.

*("5024,86 m²" sin punto de miles y "Tiene" con mayúscula — así en la celda y así se imprime.)*

### Página 2 — Texto 2: Sector (Impresion!C28 = Portada!D18) — ⚠ TRUNCADO EN EL PDF

Texto completo de la celda:

> El sector es de carácter mixto. El cual se compone de viviendas de baja densidad, viviendas aisladas de diseño particular, agrupadas generalmente en condominios. Conectividad a través de Autopista Los Libertadores, Las Brisas. Sector de parcelaciones rurales. Centros educacionales medianamente cerca. Comercio local por Las Brisas. Los servicios en general se encuentran en el centro de la comuna de Colina. El comercio, el transporte y los servicios se encuentran en la avenida más cercana: Caletera Oriente Gral. San Martín.

**En el PDF impreso el párrafo se corta al final de la 2ª línea, en "…El comercio, el transporte y"** (la altura de fila de Excel recorta el resto).

### Página 2 — REF. OFERTAS (Impresion filas 30–38 ← Portada 28–36)

Columnas: N° · (fecha) · Tipo · Dirección referencias · Año · Teléfono · Total UF · Sup. Terreno. · Sup. Constr. · OO.CC. · UF/m² T. · UF/m² C. · Comentarios Relevantes (vacía).

| N° | fecha | Tipo | Dirección | Año | Teléfono | Total UF | Sup. Terreno. | Sup. Constr. | OO.CC. | UF/m² T. | UF/m² C. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `abr-26` | Ofert. | Las Brisas de Chicureo - Los Boldos | 2015 | 979998714 | `20.000` | `5.051,00` | `239,00` | `750` | `2,20` | `34,05` |
| 2 | `abr-26` | Ofert. | Las Brisas de Chicureo - La Viña 1060 | 2016 | 989225642 | `24.900` | `5.077,00` | `239,00` | `750` | `3,10` | `35,19` |
| 3 | `abr-26` | Ofert. | La Viña & La Vendimia | 2017 | 936820393 | `19.500` | `5.001,00` | `252,00` | `500` | `2,00` | `35,71` |
| 4 | `abr-26` | Ofert. | Las Brisas 1-300 | 2005 | 995394000 | `23.900` | `5.012,00` | `258,00` | `750` | `3,00` | `31,45` |
| 5 | `abr-26` | Ofert. | Liray - Lo Pinto | 2023 | 942182983 | `18.900` | `5.000,00` | `264,00` | `500` | `2,00` | `31,82` |

- **PROMEDIO DE LA MUESTRA**: `21.440` · `5.028` · `250` · `650` · `2,46` · `33,64`
- **TASACION**: `20.126` · `5.025` · `250` · `750` · `2,23` · `32,64` (Portada!AD35=+BI62, AX35=+BD59)
- **TASACION V/S PROMEDIO DE LA MUESTRA**: **`-3%`** (solo columna UF/m² C.)

### Página 2 — REF. C.B.R. (filas 39–46)

| N° | fecha | Tipo | Dirección | Año | Foja y Número | Total UF | Sup. Terreno. | Sup. Constr. | OO.CC. | UF/m² T. | UF/m² C. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 6 | `mar-25` | CBR. | Chicureo 3 LT 40 | 1996 | 40132-55521 | `20.500` | `5.002,00` | `250,00` | `700` | `2,70` | `25,18` |
| 7 | `may-25` | CBR. | Las Brisas 3 MZ A LT 12 | 2004 | 47523-66056 | `18.000` | `5.013,00` | `360,00` | `700` | `1,80` | `22,99` |
| 8-9 | | CBR. | — | | | `-` | `-` | `-` | | `-` | (guiones formato contable) |

- **PROMEDIO**: `19.250` · `5.008` · `305` · `700` · `2,25` · `24,08` · **TASACION**: ídem · **V/S**: **`36%`**

### Página 2 — ANALISIS DE RENTABILIDAD

| Dato | Valor impreso | Fórmula real (Portada) |
|---|---|---|
| Vida Util Remanente Años | `70 años` | BJ37: escalera IF sobre año 2024 → 70 |
| Arriendo Bruto $ / mes | `$ 3.300.000` | BJ38 input |
| UF/ mes | `UF 82,7` | BJ39 = 3.300.000/39.894,61 |
| Gasto Anual $ | `$ 3.300.000` | BJ40 =+BJ38 |
| Tasa Exigida Proyecto | `4,5%` | BJ41 string |
| Tiempo Renta (años) | `65 años` | BJ42 =+BJ37-5 |
| Ingreso Líquido Anual | `$ 36.300.000` | BJ43 =BJ38*12-BJ40 |
| Renta Perpetua | `$ 806.666.667` | BJ44 =BJ43/BJ41 |

### Página 2 — Texto 3: ANÁLISIS DE LAS REFERENCIAS — COMPLETO

> Las muestras fueron seleccionadas por ser propiedades que comparten características similares en cuanto a dimensiones, programa, tipología de edificación, sector y se homologa en función a sus características propias como; diseño constructivo, calidad de sus materiales, calidad de sus revestimientos interiores y estado de mantención.

### Página 2 — CUADRO DE VALORACION (filas 53–66)

Columnas: Item · Nº · Detalle Item valorado · Rol SII · Año · Tipo · Situación Municipal · Estado · Grntía. · Origen Super. · Superficie m² · UF/m² Nuevo · D. F. · UF/m² · Valor Comercial UF · Valor Seguros UF · Valor Liquidación UF.

| Item | Nº | Detalle | Rol SII | Año | Tipo | Sit.Mun. | Est. | Grn. | Origen | Sup. m² | UF/m² Nvo | D.F. | UF/m² | V.Comercial | V.Seguros | V.Liquid. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Terreno | 1 | Terreno | N°882-40 | | | Regularizado | | N/D | Plano Muni. | `1.402,35` | `8,00` | `1,00` | `8,00` | `11.218,80` | `0,00` | `9.255,51` |
| Terreno | 2 | Servidumbre | N°882-40 | 2024 | | Regularizado | | N/D | Plano Muni. | `3.622,51` | | `1,00` | | | `0,00` | |
| Edificación | 1 | Piso 1 | N°882-40 | 2024 | AL | Regularizado | B | N/D | Plano Muni. | `249,91` | `34,00` | `0,96` | `32,64` | `8.157,06` | `8.157,06` | `6.729,58` |
| Piscina | 1 | Piscina | | | | | | N/D | | `1,00` | `350,00` | `1,00` | `350,00` | `350,00` | `350,00` | `288,75` |
| OO.CC | 1 | Quincho, terrazas, bodega | | | | | | N/D | | `1,00` | `250,00` | `1,00` | `250,00` | `250,00` | `250,00` | `206,25` |
| OO.CC | 2 | Cierros, pavimento exterior | | | | | | N/D | | `1,00` | `150,00` | `1,00` | `150,00` | `150,00` | `150,00` | `123,75` |

| Totales | Valores impresos |
|---|---|
| TOTAL EDIFICACION | Año `2024` · `249,91` · `34,00` · `0,96` · `32,64` · UF `8.157,06` · `8.157,06` · `6.729,58` |
| TOTAL OBRAS COMPLEMENTARIAS | `3,00` · `250,00` · `750,00` · `750,00` · `618,75` |
| TOTAL TERRENO | `5.024,86` · `2,23` · UF **`11218,80`** · `0,00` · **`9255,51`** (⚠ sin punto de miles — quirk del gold master) |
| VALOR COMERCIAL NORMAL : | UF **`20.125,86`** · Seguros `8.907,06` · Liquid. `16.603,84` |
| BIENES NO CONSIDERADOS GARANTIA : | (vacío) |

### Página 2 — VALOR TASACIÓN (caja celeste) — 13 valores + UF/USD

| Dato | Valor impreso EXACTO |
|---|---|
| VALOR TASACIÓN — UF / $ / al | `UF  20.125,86` · `$  802.913.431` · `13-04-2026` |
| Velocidad de venta normal : | `8 A 10 MESES` |
| 1UF = / 1US$ = | `$ 39.894,61` / `$ 890,33` (constantes tipeadas a mano en Portada!AQ71/BO71) |
| Valor de Reposición — US$/UF/$ | `414.344` / `9.246,94` / `368.903.065` |
| Seguro Incendio y otros | `399.115` / `8.907,06` / `355.343.781` |
| Avalúo fiscal propiedad | `381.667` / `8.517,68` / `339.809.429` |
| Valor a Remate 65% | `586.180` / `13.081,81` / `521.893.730` (fila destacada) |
| Liquid. Normal 82,5% | `743.998` / `16.603,84` / `662.403.581` |

### Página 2 — pie: firma y declaración

| Dato | Valor impreso |
|---|---|
| Tasador : | Maria Eugenia Soto |
| Visador : | Héctor Martínez C. |
| Firma : | imagen firma manuscrita azul |
| Fecha visita : | `13 de abril de 2026` |
| Fecha Visado : | `15 de abril de 2026` |
| REVISOR | `MetLife` |
| Fecha revisión : | (vacío) |
| FOTO FACHADA | foto de la fachada |
| Declaración | "El profesional que firma declara que no tiene hoy, ni espera tener en el futuro, interés en la propiedad tasada ni ningún impedimento para llevar a cabo este trabajo. No tiene personal interés ni participación en los usos que se hagan de la tasación ni con las personas que participen en la operación. Ha inspeccionado la vivienda y la información que en esta fecha presenta es totalmente verdadera, y no ha olvidado nada de importancia. Los inconvenientes y limitaciones que pueda tener la vivienda y su vecindario están mencionados. Por otra parte se mantendrá un nivel de confidencialidad de la información obtenida, acorde a las exigencias de la Institución, que desde ya declara conocer y aceptar." |

### Página 3 · Hoja N°2

Cabecera repetida (pág. 3–8): `Nombre Cliente FRANCISCO JOSÉ VERGARA UNDURRAGA` · `RUT 16.610.203-0` · `Dirección LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO` · `Nº Interno METLIFE -6283` + `Hoja N°2`.

- Título: `Mapa de ubicación de referencias`. Mapa grande con pines 1/2/3, `Propiedad`, `CBR`.
- 3 fotos `Fachada`.

| Campo | Ref Nº 1 | Ref Nº 2 | Ref Nº 3 |
|---|---|---|---|
| Tipo: | Ofert. | Ofert. | Ofert. |
| Dirección: | Las Brisas de Chicureo - Los Boldos | Las Brisas de Chicureo - La Viña 1060 | La Viña & La Vendimia |
| Valor UF: | `20.000` | `24.900` | `19.500` |
| Año: | **`2.015`** | **`2.016`** | **`2.017`** (⚠ con punto de miles — quirk) |
| Sup const: | `239,00 m²` | `239,00 m²` | `252,00 m²` |
| Terreno: | `5.051,00 m²` | `5.077,00 m²` | `5.001,00 m²` |
| Telefono: | 979998714 | 989225642 | 936820393 |

### Página 4 · Hoja N°3 — cualitativa (valores impresos completos)

**Exigencias:** Superf. Predial Mínimo `PRMS` m² · Frente Predial Mínimo `PRMS` mts. · % Ocupación Suelo `PRMS` % · Sistema Agrupamiento `OGUC` · Coef Máx Constructibidad `PRMS` · Altura Edificación `OGUC` mts. · Distancia medianero `OGUC` mts. **PROPIEDAD ACOGIDA A:** D.F.L. 2 `NO` · LEY 6071 `NO` · LEY 9135 `NO` · LEY 19537 `SI`. **CUMPLE PLAN REGULADOR VIGENTE:** uso actual `SI` · tipo construcción `SI` · Uso más probable `HABITACIONAL` · Cambios `NO CONTEMPLA`.

**Sector:** Demanda `Medio` · Tendencia `Estable` · Densidad `Baja` · Mercado `Estrato Medio Alto` · ABC1 `SI/No Homogéneo`. Destino barrio `Habitacional` · Tipo zona `Rural` · Calzada `Asfalto` · Acera `Tierra` · Solera `Solerilla` · Antejardin `Sí` · Red Eléctrica `Red Subterránea` · Agua Potable `Matriz Pública` · Gas `Red Pública` · Proy. Uso Terrenos `Estacionario`. **Uso de terrenos:** Casas `10 %` · Deptos. `0 %` · Condominios `45 %` · Equip. Comer `1 %` · Industrial `0 %` · Comercial `1 %` · Sitios Eriazos `35 %` · Otros `8 %`.

**Arteria:** `Caletera Oriente Gral San Martín`.

**Terreno:** Superficie `5.024,86 m²` · Forma `REGULAR` · Pendiente `PLANO` · Orientación `NORTE` · Frente `29,95` · Contrafrente `29,95` · NORTE `50` · SUR `50` · ratio 0,599.

**Emplazamiento:** Tipo agrupamiento `CONDOMINIO` · Diseño `TIPICO` · Utilidad Funcional `ADECUADA` · Adosamiento `AISLADA` · Calidad constructiva `BUENA` · Estado `BUENO` · Predio y/o vista `BUENO` · Orientación construcción `NORTE` · Relación Terr/Constr `ADECUADO` · Iluminación natural `ADECUADA`.

**Características Constructivas:** Estructura Soportante `ALBAÑILERÍA LADRILLO` BUENA/BUENO · Divisiones Interiores `ACERO VOLCANITA` · Entrepisos (—) · Cubierta `PLANCHA METALICA` · Rev. exterior `ESTUCO Y PINTURA` · Cierros `REJA METALICA` · O. Complementarias `TERRAZA DESCUBIERTA+QUINCHO+PISCINA+BODEGA` · Construcción anexo (—). **Otros:** Aire Acondicionado `RADIADOR MURAL` · Calefacción `NO PRESENTA` · Closet Mural `MELAMINA` · Muebles cocina `MELAMINA Y CUARZO` · Sanitarios `LOSA NACIONAL CORRIENTE` · Grifería `NACIONAL CORRIENTE` · Puerta Principal `MADERA` · Ventanas `PVC TERMOPANEL`.

**Terminaciones:** Estar/Dormitorios/Circulación: `ENMADERADO` · `TIPO PISO DE INGENIERÍA` · `ESMALTE` · `ENLUCIDO / PINTURA` · BUENA · BUENO; Cocina/Baños: `CERAMICO` · `TIPO PORCELANATO` · `CERAMICO` · `ENLUCIDO / PINTURA`. Alcantarillado `Colector` · Agua `Matriz Pública` · Electricidad `Red Subterránea` · Gas `Red Pública`.

**Habitaciones (Nivel 1):** Comedor 1 · Living 1 · Estar 1 · Hall 1 · Suite 1 · D. Simple 3 · D. Serv 1 · Cocina 1 · Escritorio 0 · Baños 3 · 1/2 Baño 1 · Bñ Serv 1 · Loggia 1 · Otros 0 · Superficie `249,91`. **Totales:** Total Recintos `16` · Dormitorios `4` · Baños `4` · Dorm Serv. `1` · Baño Serv. `1` · Total `249,91 m²`.

**Comodidades:** Muebles de Cocina `SI` · Comedor de Diario `SI` · Patio de servicio `SI` · Estacionamiento `SI` · Piscina `SI` · Gimnasio `NO` · Sauna `NO` · Bodega `SI` · Jardin conformado `SI` · Calefacción `NO` · Alarma `NO` · Protecciones/Rejas `NO` · Aspiración central `NO` · Climatización `NO` · Purificador de aire `NO` · Corrientes. Débiles `SI`.

**Ampliaciones:** 3 filas vacías.

### Páginas 5-6 — Fotos (grilla 2×4 ×2)

P.5 rótulos: `Ubicación` · `Planificación` · `Fachada` · `Sector` · `Living ` · `Comedor` · `Cocina` · `Baño de visitas`. P.6: `Dormitorio Principal ` · `Baño Principal` · `Dormitorio` · `Dormitorio ` · `Sala de estar` · `Piscina` · `Terraza + Quincho` · `Fachada posterior - Patio trasero`.

### Páginas 7-8 — Anexos

P.7 `ANEXO N°1`: `PLANO` · lámina CUADRO DE SUPERFICIE (A…N, TOTAL PRIMER PISO 249,91 / SERVIDUMBRE 3622,51 / SUPERFICIE TERRENO 5024,86) + PLANTA DE EMPLAZAMIENTO · `ESQUEMA DE SUPERFICIES` · `INFORMACION DE SII` + aérea. Todo imagen.
P.8 `ANEXO N°2`: `ROL - AVALUO` · `RECEPCION FINAL` · certificado TGR · `PERMISO DE EDIFICACIÓN` (×2) · `NO EXPROPIACIÓN SERVIU`. Todo imagen.

---

## 2. ORÁCULO DE DISEÑO

**Constantes:** A4 595,32×841,92 pt. Fuentes embebidas: **Calibri**, **Calibri Bold**, **Arial Narrow Bold** (solo "No Aplica"). Paleta: **azul `#095085`** (fill exacto del XLSM — NO el azul consola `#075899`), **celeste `#8DB4E2`**, azul secundario `#1F497D`, **gris `#D4D4D4`**, blanco, negro. Bordes hairline negros.

**P.1 Portada:** barra azul y≈75-105 `INFORME DE TASACION` Calibri 18 blanco centrado · recuadro borde azul centrado con logo 281×165 pt · barra `ANTECEDENTES` · ficha 7 pares (etiquetas x≈125, valores x≈245) Calibri Bold 10,8 · pie 2×2 borde azul. Sin folio ni pie de página.

**P.2 Hoja N°1:** tipografía 4,8-7,2 pt. Barra azul superior · banda `Nº Interno :` + `Hoja N°1` · sidebars verticales azules (x≈22-30) texto rotado blanco: `Identificación`, `Síntesis de la Prop.`, `Referencias y Mercado`, `Valores y Firma` · bloque identificación 3 columnas de pares + mini-mapa sup. der. (116×122) · celda `No Aplica` celeste · 2 párrafos justificados · tablas REF. con cabecera gris `#D4D4D4` bold, filas agregadas celestes bold · ANALISIS DE RENTABILIDAD titulo gris · CUADRO 17 col cabecera gris, totales bold · mitad inferior 2 col: FOTO FACHADA (235×118) + firma / caja VALOR TASACIÓN celeste (título Calibri Bold 10,8; valores bold 8,4-9,6) · declaración justificada ~5 pt. Marco exterior negro grueso.

**P.3 Hoja N°2:** cabecera estándar · banda título · mapa 538×212 · 3 tarjetas (ancho ≈151): `Fachada` + foto + `Referencia Nº X` + 6 pares. Dos tercios inferiores en blanco.

**P.4 Hoja N°3:** formulario compacto tipo grilla; sidebar con rótulos de sección; recuadros con borde negro, tablas de pares (valores bold), cabeceras gris claro; títulos `PROPIEDAD ACOGIDA A:` / `CUMPLE PLAN REGULADOR VIGENTE`. HABITACIONES 16 col × 4 niveles + Totales.

**P.5-6:** cabecera + banda `Fotos de la Propiedad` · grilla 2×4 (fotos ≈258×166, gutter ≈23) rótulo centrado en banda gris bajo cada foto.

**P.7-8:** cabecera + `ANEXO N°1/2` en banda · collage de imágenes de documentos en 2 columnas con rótulo en franja gris.

**Numeración:** sin pie; `Hoja N°1`…`Hoja N°7` arriba a la derecha (páginas 2-8).

---

### Notas finales para la validación de Fase 2

1. Quirks del gold master que un generador "correcto" tendería a no reproducir: (a) sector truncado en "…el transporte y"; (b) `11218,80`/`9255,51` sin punto de miles en TOTAL TERRENO; (c) años `2.015/2.016/2.017` con punto de miles en pág. 3. Decidir si se replican o corrigen (decisión tomada: se corrigen — E-124 años sin miles; los otros dos se normalizan).
2. El −3% impreso es −2,98% real; el comparador debe tolerar el redondeo `0%`.
3. UF (`$ 39.894,61`) y USD (`$ 890,33`) son constantes tipeadas a mano en el XLSM.
4. Imágenes embebidas: `Impresion` 38 · `Tapa` 1 (logo).
