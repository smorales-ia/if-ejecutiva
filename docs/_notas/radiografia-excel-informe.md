# Radiografía · `Formato Informe VProperty Enero2026.xlsm`

> **Fecha de extracción** — 21-ago-2026.
> **Fuente** — `docs/_md/archivo_ejemplo/Formato Informe VProperty Enero2026.xlsm` (4,3 MB, 21 hojas).
> **Método** — `openpyxl` 3.1.5 en modo `data_only=False` (conserva fórmulas y macro-libro).
> **Propósito** — Insumo de trabajo para integrar los audios del cliente en la documentación de
> SLA + UI Tasador. **No es especificación.** Toda cita hacia los documentos normativos usa el
> formato `[Excel: hoja!celda]`.
> **Alcance** — Nota operativa con fecha, según la convención de `docs/_notas/`. No sustituye a
> `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md`.

---

## 1. Inventario de hojas y rol funcional

| # | Hoja | Estado | Dimensión | Validaciones | Rol funcional |
|---|---|---|---|---|---|
| 1 | `FICHA SOLIC` | visible | A1:AMK376 | 15 | **Ficha de solicitud**: el alta que hoy hace Control y Seguimiento. Equivalente Excel de IF-02 §1.5. Alberga además los catálogos maestros (clientes, comunas, tasadores, tipos de propiedad). |
| 2 | `Portada` | visible | A1:AMP85 | 53 | **Cuadro de valoración, referencias y análisis de sector**. Es el corazón del cálculo. |
| 3 | `Antecedentes` | visible | A1:CW83 | 43 | **Hoja de antecedentes**: características técnicas y constructivas. **Es la hoja que el audio `p8` describe como pre-llenada.** Fuente de los defaults constructivos. |
| 4 | `Impresion` | visible | A1:FB560 | 22 | Composición del informe imprimible. Espeja `Portada` y `Antecedentes` por referencia. |
| 5 | `Zonificacion` | **oculta** | A1:AE2744 | 17 | Tabla de referencia territorial (784 filas de datos). La consultan las fórmulas de `Antecedentes!Z7:Z13` por `VLOOKUP`. |
| 6 | `Fotos propiedad` / `(2)` | visible | — | 1 | Placas fotográficas. |
| 7 | `Referencias` | visible | A1:CC72 | 0 | Fichas de los comparables con foto. |
| 8 | `ReferenciasPre` | **oculta** | — | 0 | Referencias pre-cargadas. |
| 9 | `Estado Conservación` | **oculta** | A1:AMJ48 | 4 | **Anexo de inspección de estado de conservación**, pre-llenado íntegro. |
| 10 | `Anexo` / `Anexo (2)` | visible | — | 0 | Anexos documentales. |
| 11 | `Hoja Resumen` | **oculta** | A1:AMJ64 | 0 | **Resumen ejecutivo** — corresponde al perfil de entregable "Con resumen ejecutivo" de la spec §5.2.6. |
| 12 | `UF` | visible | A1:B130 | 0 | Serie histórica del valor de la UF por fecha. |
| 13 | `VISADOR` | visible | B3:H31 | 0 | Instrucciones y links de trabajo del visador; reglas por cliente. |
| 14 | `ULH` | visible | B1:K37 | 0 | **Planilla de Unidad Leasing Habitacional** — corresponde al tercer perfil de entregable de §5.2.6. |
| 15 | `Tapa` | visible | A1:AMN57 | 0 | Carátula del informe. |
| 16 | `Tasador` | visible | A1 | 0 | Vacía (marcador). |
| 17 | `Bien Común` | visible | B2:O27 | 0 | Metodología de prorrateo de bien común para departamentos ULH. |
| 18 | `Logos Instituciones` | visible | A1 | 0 | Vacía (contenedor de imágenes). |
| 19 | `CCES` | visible | A1:B44 | 0 | Planilla de salida para el cliente **Concreces** (44 campos mapeados por fórmula). |

**Nombres definidos:** 68. Los relevantes para la UI Tasador son `tipoPropiedad`
(`'FICHA SOLIC'!K35`), `estadoUso` (`'FICHA SOLIC'!K36`), `anoPropiedad` (`Portada!AE8`),
`tipoEstructuraCell` (`Antecedentes!H37`), `ListaClientes`, `ListaComunas`,
`ListaTipoPropiedad`, `ListaTasadores`, `OrientacionList`.

---

## 2. El hallazgo central — `Antecedentes` es la fuente de los defaults constructivos

El audio `p8` describe exactamente esta hoja: *"la hoja de antecedentes tiene campos
predeterminados y ahí los puedes ir editando… esa parte siempre el tasador la recibe completa…
nunca lo mandamos en blanco, sino que lo mandamos como está ahí, es lo más característico de las
propiedades, y así el tasador mira rápido y dice voy a cambiar ésta, pero no parte de cero"*.

**Los defaults no son constantes sueltas: son fórmulas condicionadas por dos interruptores.**

| Interruptor | Celda | Valores | Efecto |
|---|---|---|---|
| Tipo de propiedad | `[Excel: FICHA SOLIC!K35]` (`tipoPropiedad`) | 8 valores de `ListaTipoPropiedad` | Casi todos los defaults ramifican por `= "Departamento"` vs. el resto. |
| Estado de uso | `[Excel: FICHA SOLIC!K36]` (`estadoUso`) | `Nuevo` · `Usado` | Gobierna calidad y estado de conservación. |

### 2.1 Características constructivas principales `[Excel: Antecedentes!B36:BP44]`

| Campo | Celda | Default (Departamento) | Default (resto) | Catálogo |
|---|---|---|---|---|
| Estructura Soportante | `H37` | `HORMIGON ARMADO` (constante, sin rama) | idem | `[Excel: Antecedentes!BZ45:BZ80]` · 36 valores |
| Divisiones Interiores | `H38` | `ACERO VOLCANITA` | `ACERO VOLCANITA` | mismo catálogo |
| Entrepisos | `H39` | `LOSA DE HORMIGON ARMADO` | vacío si Casa de 1 piso; si no `LOSA DE HORMIGON ARMADO` | lista literal de 6 valores |
| Cubierta | `H40` | `FE GALVANIZADO` | `PLANCHA METALICA` | `[Excel: Antecedentes!CE45:CE63]` · 19 valores |
| Revestimiento exterior | `H41` | `ESTUCO Y PINTURA` | `ESTUCO Y PINTURA` | `[Excel: Antecedentes!CH45:CH54]` · 10 valores |
| Cierros exteriores | `H42` | `REJA METALICA` | `REJA METALICA` | **sin catálogo — texto libre** ⚠ ver nota |
| O. Complementarias | `H43` | `PISCINA` | *(vacío)* | `[Excel: Antecedentes!CK45:CK50]` · 6 valores |

> ⚠ **Corrección in-place (22-ago-2026 · P0.5.C-TAS).** Esta tabla atribuía `CK45:CK50` a *cierros
> exteriores* y dejaba a *obras complementarias* como "mismo catálogo". Es al revés: la lectura de
> las `dataValidation` del `.xlsm` muestra `H43:X43 → $CK$45:$CK$50` y **ninguna validación sobre
> `H42`**, que por lo tanto es texto libre. La spec §2.8.1 arrastra la misma atribución invertida y
> queda anotada para su próximo bump. El sembrado de `C_DefaultsAntecedentes` siguió el archivo
> real (R1), no esta tabla.
| Construcción anexo | `H44` | *(vacío)* | *(vacío)* | — |

**Calidad** (`Y37:Y44`) y **Estado** (`AF37:AF44`) se derivan de `estadoUso`: calidad `BUENA` en
ambas ramas; estado `BUENO` si Usado, `NUEVO S/USO` si Nuevo. Catálogo de calidad:
`DEFICIENTE · INFERIOR · REGULAR · CORRIENTE · BUENA · SUPERIOR`. Catálogo de estado:
`MUY BUENO · NUEVO S/USO · BUENO · REGULAR · DEFICIENTE · OBRA GUESA · TERMINACIONES`.

### 2.2 Otros elementos constructivos `[Excel: Antecedentes!AL37:BE44]`

| Campo | Celda | Default | Catálogo |
|---|---|---|---|
| Aire Acondicionado | `AR37` | `NO PRESENTA` | `NO PRESENTA · RADIADOR MURAL · RADIADOR AEREO` |
| Calefacción | `AR38` | `LOSA RADIANTE` si `AB22="SI"`, si no `NO PRESENTA` | 8 valores literales |
| Closet Mural | `AR39` | `MELAMINA` | — |
| Muebles de cocina | `AR40` | `MELAMINA Y POSTFORMADO` (constante) | `[Excel: Antecedentes!CO44:CO56]` · 13 valores |
| Sanitarios | `AR41` | `LOSA NACIONAL CORRIENTE` | — |
| Grifería | `AR42` | `NACIONAL CORRIENTE` | — |
| Puerta Principal | `AR43` | `MADERA` | `[Excel: Antecedentes!BV54:BV62]` · 9 valores |
| Ventanas | `AR44` | `ALUMINIO` | `[Excel: Antecedentes!BX54:BX64]` · 11 valores |

### 2.3 Terminaciones por recinto `[Excel: Antecedentes!B45:BE50]`

Cinco recintos fijos: **Estar · Dormitorios · Espacios de circulación · Cocina · Baños**.
Cuatro atributos por recinto, todos pre-llenados:

| Recinto | Pavimento (`H`) | Material/Marca (`W`) | Revest. muros (`AI`) | Cielo (`AS`) | Iluminación (`BE`) |
|---|---|---|---|---|---|
| Estar | `PISO FLOTANTE` | derivado | `ESMALTE` | `ENLUCIDO / PINTURA` | `BUENA` |
| Dormitorios | `PISO FLOTANTE` | derivado | `ESMALTE` | `ENLUCIDO / PINTURA` | `BUENA` |
| Circulación | `PISO FLOTANTE` | derivado | `ESMALTE` | `ENLUCIDO / PINTURA` | `BUENA` |
| Cocina | `CERAMICO` | derivado | `CERAMICO` | `ENLUCIDO / PINTURA` | `BUENA` |
| Baños | `CERAMICO` | derivado | `CERAMICO` | `ENLUCIDO / PINTURA` | `BUENA` |

Esto corrobora literalmente el audio `p8`: *"en general los baños tienen cerámicos"*.

**`Material/Marca` es derivado, no capturado** `[Excel: Antecedentes!W46:W50]`: una cadena de
`IF` sobre el pavimento elegido (`PISO FLOTANTE → TIPO LAMINADO`, `CERAMICO → TIPO CORDILLERA`,
`ALFOMBRA → ALFOMBRA`, `ENMADERADO → MADERA`, …). No es un campo de captura.

Catálogos: pavimento `[Excel: Antecedentes!H46:H50 · lista literal]` 17 valores; revestimiento
de muros 14 valores; cielo 7 valores.

### 2.4 Emplazamiento y comodidades `[Excel: Antecedentes!B14:AK24]`

Defaults por fórmula sobre `tipoPropiedad`: Diseño Arquitectónico `TIPICO`, Utilidad Funcional
`ADECUADA`, Tipo Adosamiento `EDIF DPTO` (Departamento) / `AISLADA` (resto), Calidad
constructiva `BUENA`, Predio y/o vista `BUENO`, Relación Terr/Constr `ADECUADO`, Iluminación
natural `ADECUADA`, Orientación construcción `NOROESTE` (constante literal
`[Excel: Antecedentes!Z17]`), Estado de conservación `BUENO` si Usado / `NUEVO - S/USO` si Nuevo
`[Excel: Antecedentes!Z15]`.

**Regularización** `[Excel: Antecedentes!B6:H13]` — Permiso Edificación `SI`, Recepción Final
`SI`, Plano de la propiedad `SI`, Condiciones previas `NO`, Certificado Hipoteca `NO`,
Servidumbres terreno `NO`. Certificado de Expropiación es derivado de `Portada!BL25`.

**Propiedad acogida a** `[Excel: Antecedentes!AH7:AT10]` — DFL 2 se calcula
(`SUM('FICHA SOLIC'!K38:N38) < 140 → SI`); Ley 6071 se calcula (Departamento o Condominio con
`anoPropiedad < 1995`); Ley 9135 `NO` constante; Ley 19537 es el complemento de DFL 2.

### 2.5 Anexo de estado de conservación `[Excel: Estado Conservación!A7:W46]`

38 filas de inspección, **todas pre-llenadas** con la misma terna:
**Estado Actual = `Bueno` · Daños = `Ninguno` · Operabilidad = `Funcionando`**. La columna
"Materialidad / Tipo" se hereda por referencia desde `Antecedentes`. Catálogos:
`Bueno · Normal · Regular · Deficiente · Malo` / `Ninguno · Leve · Mediano · Grave · Total` /
`Funcionando · Media Función · No Operativo`.

Es la segunda evidencia de la regla del audio `p8`: la hoja se despacha completa, nunca en blanco.

---

## 3. Catálogos maestros

| Catálogo | Ubicación | Cardinalidad | Observación |
|---|---|---|---|
| **Comunas** | `[Excel: FICHA SOLIC!AB26:AB376]` | **345** | Con región asociada en la columna contigua (`E37 = VLOOKUP(E36, AB26:AC376, 2, 0)`). Responde al audio `r22`. |
| **Clientes** | `[Excel: FICHA SOLIC!V25:V64]` | **40** | Con número correlativo (`W`) y abreviatura (`X`). Responde al audio `r21`. |
| **Tipos de propiedad** | `[Excel: FICHA SOLIC!AD25:AD32]` | 8 | `Casa · Casa Piloto · Departamento · Departamento Piloto · Local Comercial · Oficina · Sitio · Terreno` |
| **Tasadores / Revisores** | `[Excel: FICHA SOLIC!Y25:Y40]` | 15 | Nombres propios; `ListaRevisor` es el subconjunto `Y25:Y26`. |
| **Destino según SII** | `[Excel: FICHA SOLIC!AE25:AE40]` | 16 | `HABITACIONAL` es el default `[Excel: FICHA SOLIC!K40]`. |
| **Objetivo del informe** | `[Excel: FICHA SOLIC!E27]` | 3 | `Crédito Hipotecario · Valor de Propiedad · Refinanciamiento`, con default calculado: Refinanciamiento si solicitante = propietario. |
| **Estado del ocupante** | `[Excel: FICHA SOLIC!E42]` | 3 | `Habitado · No habitado · Arrendado` |
| **Estado de uso** | `[Excel: FICHA SOLIC!K36]` | 2 | `Nuevo · Usado` |
| **Códigos abreviados** | `[Excel: FICHA SOLIC!S5:S15]` | **11** | `BIC · CIM · CIT · HCS · HLC · LCH · MET · PAR · PEN · SIM · VAL` — **segunda lista de abreviaturas, distinta de la columna `X`**. Ver §5. |

---

## 4. Reglas de plazo embebidas en el Excel

Dos celdas del libro fijan plazos operativos, y **coinciden con lo que el cliente dice en los
audios `p6` y `revision 1`**:

| Regla | Celda | Contenido | Lectura |
|---|---|---|---|
| Fecha/hora de visita | `[Excel: FICHA SOLIC!K10 · N10]` | fecha + `09:00:00` | La visita se agenda con hora; el default de hora es 09:00. |
| **Entrega del informe** | `[Excel: FICHA SOLIC!K11]` | `=WORKDAY(K10, 2)` | **El informe vence 2 días hábiles después de la visita**, a las 09:00 `[Excel: FICHA SOLIC!N11]`. Cómputo en días hábiles, coherente con la ventana de la spec §5.2.1. |

`WORKDAY` sin argumento de feriados: el Excel excluye fin de semana pero **no** feriados
chilenos. La spec §5.2.1 sí los excluye (vía `C_Feriados`), de modo que el sistema es más
estricto que la planilla, no menos.

---

## 5. Divergencias y vacíos detectados en el Excel

| # | Hallazgo | Evidencia | Consecuencia |
|---|---|---|---|
| 1 | **Dos listas de abreviatura de cliente, incompatibles** | `[Excel: FICHA SOLIC!X25:X64]` (40 valores: `HIPOTECARIA SECURITY`, `METLIFE`, `ULH`, `HEV`…) vs. `[Excel: FICHA SOLIC!S5:S19]` (códigos de 3 letras: `MET`, `PAR`, `PEN`…) | El audio `r21` pide agregar "el código del cliente" al código de solicitud, pero no dice cuál de las dos listas. |
| 2 | **La abreviatura no es única** | `[Excel: FICHA SOLIC!X38]` = `BCH` (Bice Hipotecaria) y `[Excel: FICHA SOLIC!X40]` = `BCH` (Banco de Chile) | Una abreviatura duplicada no puede ser parte de una clave de código. |
| 3 | **No existe campo "precio de venta"** | Barrido completo del libro: sólo `Avalúo Fiscal` `[Excel: FICHA SOLIC!K41]` y los `Total UF` de los comparables `[Excel: Portada!AD29:AD33]` | El audio `r21` pide incorporarlo. No tiene celda de origen en la planilla. |
| 4 | **Un solo teléfono de contacto** | `[Excel: FICHA SOLIC!J20]` = "FONO CONTACTO:" | Los audios `r21` y `revision 1` piden `fono 1` (celular) y `fono 2` (fijo). |
| 5 | **Los factores de homogeneización de A-18 no existen en el Excel** | El cuadro de comparables `[Excel: Portada!B28:AX44]` calcula `UF/m² C.` directamente: `=(Total UF − UF/m²T × Sup.Terreno − OO.CC.) / Sup.Constr.` Sin columnas de `factor_sup`, `factor_edad` ni `factor_distancia`. | El Excel **no** cierra A-18. Lo que sí tiene son otros dos factores, en el cuadro de valoración. |
| 6 | **Los factores reales del Excel son `D.F.` y `F.M.`, ambos con default `1`** | `[Excel: Portada!AX50 · BA50]`, valores `[Excel: Portada!AX51:AX53 · BA51:BA53]` = `1`; se aplican en `[Excel: Portada!BD51]` = `F.M. × D.F. × UF/m² Nuevo` | Dos factores multiplicativos neutros por defecto, cuyo nombre completo no está escrito en la planilla. |
| 7 | **`Orientación construcción` es constante literal, no fórmula** | `[Excel: Antecedentes!Z17]` = `NOROESTE` | Es el único default constructivo que no ramifica. Probablemente residuo de la última propiedad tasada, no una regla. |
| 8 | **Materialidad principal se resuelve con un catálogo de 12 códigos que no está en `Antecedentes`** | `[Excel: ULH!J1:K12]` — `AC/Acero`, `HA/Hormigón Armado`, `AL/Albañilería Ladrillo`, `PI/Piedra`, `MA/Madera`, `AD/Adobe`, `BA`, `CA`, `CE`, `SA`, `SB`, `W/Piscina` | Tercera codificación de materialidad, sólo para la planilla ULH. |

---

## 6. Qué del Excel alimenta qué documento

| Insumo del Excel | Documento destino | Sección |
|---|---|---|
| `Antecedentes` §2.1–2.4 · `Estado Conservación` §2.5 | Especificación · plan UI Tasador | Defaults de la sección E del formulario (A-14) |
| `FICHA SOLIC!K11` (`WORKDAY(+2)`) | Especificación · SLA Negocio | Matriz de etapa 5 |
| Catálogo de comunas (345) | plan IF-02 | Carga de `M_Comunas` |
| Catálogo de clientes (40) | plan IF-02 | Carga de `M_Clientes` |
| `Hoja Resumen` · `ULH` · `CCES` | Especificación | Perfiles de entregable §5.2.6 |
| Divergencias §5 | Registro de ambigüedades | Ambigüedades nuevas |

---

*Nota operativa con fecha. No es fuente normativa; la fuente normativa del producto sigue siendo
`docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md`.*
