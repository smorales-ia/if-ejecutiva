# Snapshot · P0.5.C-TAS — sembrado de `C_DefaultsAntecedentes`

> **Fecha** — 22-ago-2026. **Rama** — `feat/tasador-ui`. **Base** — `app9G7lLkIV3CpeLa`.
> **Estado** — ✅ **TANDA COMPLETA.** Fases 1, 2 y 3 cerradas.
> **Airtable**: `C_DefaultsAntecedentes` (`tblOj7nXcjeouPy09`) con **212 filas**, verificadas.
>
> Este archivo sucede a `snapshot-P0.5.C-TAS-fase1-en-curso.md`, del que conserva el mapeo de
> Fase 1 sin cambios (§3, §4, §5). Lo que se reescribió es el estado: las cuatro preguntas del
> Gate 1 están respondidas y el sembrado ocurrió.

---

## 1 · Contexto de la tanda

**P0.5.C-TAS siembra las filas de defaults** en `C_DefaultsAntecedentes`, la tabla que P0.5-TAS
creó vacía (R5 de aquella tanda dejó el sembrado para ésta). Los valores salen de
`Formato Informe VProperty Enero2026.xlsm`, hoja `Antecedentes`, y la especificación es
`VProperty_Especificacion_Proyecto_v1_9_14.md` §2.8.1 (RF-TAS-23).

Arrancó una vez que **P0.5.B-TAS cerró A-37** saneando `M_TiposPropiedad`: sin eso, no había fila
canónica de la que colgar cada default.

## 2 · Decisiones ya tomadas por Sergio

**Decisión 1 · Se siembran SÓLO las 4 combinaciones que la plantilla distingue.** Las 16 lógicas
(8 tipos × 2 estados) tienen 12 sin datos reales, y según §2.8.1 una fila vacía y una fila ausente
se comportan igual: la UI muestra vacío. Las 4 son:

| # | tipo_propiedad | record ID | estado_uso |
|---|---|---|---|
| 1 | `Casa` | `recrXDAjlVCe59XBW` | `nuevo` |
| 2 | `Casa` | `recrXDAjlVCe59XBW` | `usado` |
| 3 | `Departamento` | `recf9hz8TbkQ6wsus` | `nuevo` |
| 4 | `Departamento` | `recf9hz8TbkQ6wsus` | `usado` |

**Decisión 2 · A-38 (catálogos de valores admisibles) NO se resuelve en esta tanda.** No se crea
tabla hermana. `catalogo_ref` lleva la cita del rango del Excel como referencia; P7-TAS se
implementa con dropdowns estáticos o texto libre editable, y la tabla de catálogos se evalúa
cuando haya conocimiento real de uso. **A-38 sigue abierta, no bloqueante.**

---

## 3 · Mapeo · Bloque `elementos_fundamentales` — COMPLETO

| campo_destino | atributo | Casa·nuevo | Casa·usado | Depto·nuevo | Depto·usado | origen | catalogo_ref |
|---|---|---|---|---|---|---|---|
| `estructura_soportante` | materialidad | HORMIGON ARMADO | HORMIGON ARMADO | HORMIGON ARMADO | HORMIGON ARMADO | `Antecedentes!H37` | `Antecedentes!BZ45:BZ80` |
| `divisiones_interiores` | materialidad | ACERO VOLCANITA | ACERO VOLCANITA | ACERO VOLCANITA | ACERO VOLCANITA | `Antecedentes!H38` | `Antecedentes!BZ45:BZ80` |
| `entrepisos` | materialidad | *(no se siembra · **A-41**)* | *(no se siembra · **A-41**)* | LOSA DE HORMIGON ARMADO | LOSA DE HORMIGON ARMADO | `Antecedentes!H39` | inline (6 val.) |
| `cubierta` | materialidad | **PLANCHA METALICA** | **PLANCHA METALICA** | **FE GALVANIZADO** | **FE GALVANIZADO** | `Antecedentes!H40` | `Antecedentes!CE45:CE63` |
| `revestimiento_exterior` | materialidad | ESTUCO Y PINTURA | ESTUCO Y PINTURA | ESTUCO Y PINTURA | ESTUCO Y PINTURA | `Antecedentes!H41` | `Antecedentes!CH45:CH54` |
| `cierros_exteriores` | materialidad | REJA METALICA | REJA METALICA | REJA METALICA | REJA METALICA | `Antecedentes!H42` | *(vacío — texto libre)* |
| `obras_complementarias` | materialidad | *(no se siembra)* | *(no se siembra)* | **PISCINA** | **PISCINA** | `Antecedentes!H43` | `Antecedentes!CK45:CK50` |
| los 6 primeros | calidad | BUENA | BUENA | BUENA | BUENA | `Antecedentes!Y37:Y42` | inline (6 val.) |
| los 6 primeros | estado | **NUEVO S/USO** | **BUENO** | **NUEVO S/USO** | **BUENO** | `Antecedentes!AF37:AF42` | inline (7 val.) |
| `obras_complementarias` | calidad | — | — | BUENA | BUENA | `Antecedentes!Y43` | inline (6 val.) |
| `obras_complementarias` | estado | — | — | NUEVO S/USO | **BUENA** ⚠ **A-42** | `Antecedentes!AF43` | inline (7 val.) |

`construccion_anexo` **no se siembra en ninguna combinación**: `H44` está vacío y sus fórmulas de
calidad y estado devuelven `""` por depender de él.

## 4 · Mapeo · Bloque `elementos_otros` — COMPLETO · idéntico en las 4 combinaciones

| campo_destino | materialidad | calidad | origen | catalogo_ref |
|---|---|---|---|---|
| `aire_acondicionado` | NO PRESENTA | *(no se siembra)* | `Antecedentes!AR37` | inline (3 val.) |
| `calefaccion` | NO PRESENTA ⚠ **A-41** | *(no se siembra)* | `Antecedentes!AR38` | inline (8 val.) |
| `closet_mural` | MELAMINA | BUENA | `Antecedentes!AR39` | *(vacío)* |
| `muebles_cocina` | MELAMINA Y POSTFORMADO | BUENA | `Antecedentes!AR40` | `Antecedentes!CO44:CO56` |
| `sanitarios` | LOSA NACIONAL CORRIENTE | BUENA | `Antecedentes!AR41` | *(vacío)* |
| `griferia` | NACIONAL CORRIENTE | BUENA | `Antecedentes!AR42` | *(vacío)* |
| `puerta_principal` | MADERA | BUENA | `Antecedentes!AR43` | `Antecedentes!BV54:BV62` |
| `ventanas` | ALUMINIO | BUENA | `Antecedentes!AR44` | `Antecedentes!BX54:BX64` |

La calidad de `aire_acondicionado` y `calefaccion` **no se siembra**: `BE37`/`BE38` devuelven `""`
cuando la materialidad es `NO PRESENTA`, que es el caso por defecto.

## 5 · Mapeo · Bloque `terminaciones_recinto` — COMPLETO · idéntico en las 4 combinaciones

> **Nota de reanudación.** La instrucción que originó este snapshot pedía marcar este bloque como
> "PENDIENTE de mapear". **Ya estaba mapeado** al momento de escribirlo, así que se deja completo:
> marcarlo pendiente obligaría a rehacer trabajo terminado en la próxima sesión. **No queda nada
> por mapear en Fase 1.**

| recinto (`campo_destino`) | pavimento | revestimiento_muros | cielo | iluminacion |
|---|---|---|---|---|
| `estar` | PISO FLOTANTE | ESMALTE | ENLUCIDO / PINTURA | BUENA |
| `dormitorios` | PISO FLOTANTE | ESMALTE | ENLUCIDO / PINTURA | BUENA |
| `espacios_circulacion` | PISO FLOTANTE | ESMALTE | ENLUCIDO / PINTURA | BUENA |
| `cocina` | CERAMICO | CERAMICO | ENLUCIDO / PINTURA | BUENA |
| `banos` | CERAMICO | CERAMICO | ENLUCIDO / PINTURA | BUENA |

`origen`: `Antecedentes!H46:H50` (pavimento) · `AI46:AI50` (muros) · `AS46:AS50` (cielo) ·
`BE46:BE50` (iluminación). Los cuatro con catálogo inline.

**`material_o_marca` no se siembra**: es derivado del pavimento (`Antecedentes!W46:W50`,
`PISO FLOTANTE → TIPO LAMINADO`, `CERAMICO → TIPO CORDILLERA`) y el `singleSelect` `atributo` no
lo contempla — decisión ya tomada en P0.5-TAS.

## Total de filas sembradas: **212** ✅

| Combinación | `elementos_fundamentales` | `elementos_otros` | `terminaciones_recinto` | Total |
|---|---|---|---|---|
| `Casa` × `nuevo` | 17 | 14 | 20 | **51** |
| `Casa` × `usado` | 17 | 14 | 20 | **51** |
| `Departamento` × `nuevo` | 21 | 14 | 20 | **55** |
| `Departamento` × `usado` | 21 | 14 | 20 | **55** |

Subiría a **214** si A-41 se resolviera sembrando `entrepisos` en Casa. Sergio decidió que no.

---

## 6 · Ambigüedades detectadas — **resueltas por decisión, registradas como abiertas**

> Las tres se registraron en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` el 22-ago-2026. Que la
> tanda haya decidido **qué sembrar** no cierra la pregunta de fondo, que es de negocio.

**A-41 · Dos defaults dependen de interruptores que no son parte de la clave de partición.**

- **`entrepisos` en Casa** `[Excel: Antecedentes!H39]`:
  `=IF(tipoPropiedad="Departamento","LOSA…",IF(AND(tipoPropiedad="Casa",numeroPisos=1),"","LOSA…"))`.
  Depende de **`numeroPisos`** (`Portada!BK5`), un tercer eje ajeno a la clave. Una casa de un piso
  no tiene entrepisos; una de dos, sí. **DECIDIDO: no se siembra** (Sergio, 22-ago-2026) — las dos ramas son igual de
  plausibles y elegir mal pone una losa donde no la hay.
- **`calefaccion`** `[Excel: Antecedentes!AR38]`: `=IF(AB22="SI","LOSA RADIANTE","NO PRESENTA")`.
  Depende de que la propiedad declare calefacción en el bloque de comodidades. Con la plantilla en
  blanco, `AB22` está vacío → `NO PRESENTA`. **DECIDIDO: se sembró `NO PRESENTA`**, que es lo
  que la plantilla despacha en blanco — exactamente el caso que el pre-llenado modela.

**A-42 · `BUENA` como valor de estado, fuera de su propio catálogo.**

> ⚠ **Corrección respecto de la instrucción que originó este snapshot**: el caso es
> **Departamento·usado**, no Casa·usado. En Casa no se siembra `obras_complementarias` en absoluto,
> porque `H43` devuelve `""` para todo lo que no sea Departamento.

`AF43` = `=IF(H43<>"",IF(estadoUso="Nuevo","NUEVO S/USO","BUENA"),"")`. En **Departamento·usado**
devuelve `BUENA`, que pertenece al catálogo de **calidad**
(`DEFICIENTE·INFERIOR·REGULAR·CORRIENTE·BUENA·SUPERIOR`) y **no** al de estado
(`MUY BUENO·NUEVO S/USO·BUENO·REGULAR·DEFICIENTE·OBRA GUESA·TERMINACIONES`). Es un error de la
plantilla; lo esperable sería `BUENO`. **DECIDIDO: se sembró `BUENA` tal cual** (Sergio, 22-ago-2026 · R1: gana el
Excel), con la excepción anotada en el campo `notas` de la fila, en vez de corregirla por cuenta
propia. **A-42 queda registrada como ambigüedad abierta.**

**A-43 · Defaults de `Casa Piloto` y `Departamento Piloto`** — ver §7.

---

## 7 · `Casa Piloto` / `Departamento Piloto` (R5)

**El Excel los distingue en la lista, pero sus fórmulas no.** `ListaTipoPropiedad`
`[Excel: FICHA SOLIC!AD25:AD32]` los declara como valores propios —verificado: `Casa`,
`Casa Piloto`, `Departamento`, `Departamento Piloto`, `Local Comercial`, `Oficina`, `Sitio`,
`Terreno`— y las fórmulas comparan por **igualdad exacta** contra `"Casa"` y `"Departamento"`.

| Valor | Cómo lo trata la plantilla |
|---|---|
| `Casa Piloto` | Cae en la rama "resto" — **igual que Casa**, salvo `entrepisos`, donde `AND(tipoPropiedad="Casa",…)` es falso y devuelve `LOSA DE HORMIGON ARMADO` |
| `Departamento Piloto` | Cae en la rama "resto" — **se comporta como Casa**: cubierta `PLANCHA METALICA` en vez de `FE GALVANIZADO`, y sin `PISCINA` |

Lo segundo es casi con certeza no deseado: un departamento piloto es un departamento. Es el mismo
patrón de fallo silencioso de **P-5** y **A-37** — comparación por literal exacto contra un dominio
que creció.

**DECIDIDO: opción (a), no se sembraron** (Sergio, 22-ago-2026). Sus combinaciones quedan sin filas y la UI
muestra vacío, que es correcto según §2.8.1. La opción (b) —datos idénticos a la raíz— exigiría
decidir *cuál* raíz, y para `Departamento Piloto` la plantilla dice "Casa", que es justamente lo que
parece estar mal. Las dos filas existen en `M_TiposPropiedad` desde P0.5.B-TAS
(`recoCHaCWolPWtgeW`, `reck6cHbNAcmJPj8X`) y no estorban vacías.

---

## 8 · Hallazgo · la mayoría de las ramificaciones del Excel son cosméticas

Al resolver las fórmulas apareció un patrón que **reduce el volumen real de datos** y conviene no
perder: la mayoría tiene **las dos ramas idénticas**.

```
=IF(tipoPropiedad="Departamento","ACERO VOLCANITA","ACERO VOLCANITA")
=IF('FICHA SOLIC'!K36="USADO","BUENA","BUENA")
=IF(tipoPropiedad="Departamento","ENLUCIDO / PINTURA","ENLUCIDO / PINTURA")
```

Son ramas **vestigiales**: alguien dejó la estructura por si algún día divergen. De los ~21 campos
mapeados, **sólo 3 ramifican de verdad por tipo de propiedad** —`cubierta`, `entrepisos` y
`obras_complementarias`— y **sólo 1 atributo ramifica por estado de uso** —`estado`, que vale
`NUEVO S/USO` en nuevo y `BUENO` en usado—.

**Por qué importa para el diseño**: la partición por tipo × estado de uso (A-27) **sigue siendo
correcta** —esos 4 puntos de divergencia son reales y una clave global los aplanaría—, pero explica
por qué 212 filas contienen mucha repetición. También advierte contra "optimizar" el modelo
colapsando combinaciones: las ramas hoy idénticas existen para poder divergir, y la partición es
justamente lo que permite que diverjan sin cambio de estructura.

---

## 9 · Ejecución de la Fase 2 · los 12 batches

**OK Gate 1 recibido el 22-ago-2026.** Las cuatro preguntas quedaron respondidas: A-41 sin sembrar,
A-42 `BUENA` tal cual, A-43 sin sembrar, y `catalogo_ref` inline citando la celda portadora en el
formato `Antecedentes!<celda> · lista inline`.

El sembrado corrió con `create_records_for_table` del MCP Airtable, un batch por
(combinación × bloque). Ningún batch superó el límite de 50 registros por request.

| # | Combinación | Bloque | Filas | `actionId` |
|---|---|---|---|---|
| B1 | `Casa · nuevo` | `elementos_fundamentales` | 17 | `actl8pysCNlGwyHkD` |
| B2 | `Casa · nuevo` | `elementos_otros` | 14 | `actj062ZWQ1uMqxit` |
| B3 | `Casa · nuevo` | `terminaciones_recinto` | 20 | `act0BYfsuh9khhjoE` |
| B4 | `Casa · usado` | `elementos_fundamentales` | 17 | `acthQ7bLKwlShQ4F1` |
| B5 | `Casa · usado` | `elementos_otros` | 14 | `actxt1qppZLBXlumo` |
| B6 | `Casa · usado` | `terminaciones_recinto` | 20 | `actEvmPj1ZK7qy3ZV` |
| B7 | `Departamento · nuevo` | `elementos_fundamentales` | 21 | `actrokccBmabFKTd1` |
| B8 | `Departamento · nuevo` | `elementos_otros` | 14 | `actMN7YMM8PbaSH3c` |
| B9 | `Departamento · nuevo` | `terminaciones_recinto` | 20 | `actLNhQqvPCJhJgrY` |
| B10 | `Departamento · usado` | `elementos_fundamentales` | 21 | `actwQxkpSVZz4d8AJ` |
| B11 | `Departamento · usado` | `elementos_otros` | 14 | `actd4vsxHTvqKtX9I` |
| B12 | `Departamento · usado` | `terminaciones_recinto` | 20 | `act6Vuh9GFYTcSWX2` |
| | | **Total** | **212** | |

**Cero rechazos, cero reintentos.** Cada respuesta devolvió exactamente los registros del payload.

### Verificación final (lecturas independientes, post-sembrado)

| Comprobación | Método | Resultado |
|---|---|---|
| Total de filas | `totalRecordCount` sobre la tabla | **212** ✅ |
| Filas huérfanas | filtro `isEmpty` sobre `tipo_propiedad` (`fldNZVhxeoIMGCMiZ`) | **0** ✅ |
| `activo = FALSE` | filtro `= false` sobre `fldTRdqlHaNJeRrLi` | **0** ✅ |
| `Casa · nuevo` | filtro Link + `estado_uso` | **51** ✅ |
| `Casa · usado` | filtro Link + `estado_uso` | **51** ✅ |
| `Departamento · nuevo` | filtro Link + `estado_uso` | **55** ✅ |
| `Departamento · usado` | filtro Link + `estado_uso` | **55** ✅ |
| Filas con `notas` | filtro `isNotEmpty` sobre `fldHRmQCMEOpqGgbo` | **13** ✅ |

Las **13 notas**: 4 de `entrepisos` calidad/estado en Casa (A-41) · 4 de `calefaccion` (A-41) ·
4 de `cierros_exteriores` (el hallazgo del catálogo, abajo) · 1 de A-42.

**Un comportamiento de Airtable que conviene anotar.** El string vacío **no se guarda**: las filas
con `catalogo_ref: ""` vuelven de la API **sin la clave**, no con `""`. El efecto observable es el
mismo —celda vacía, que es lo que significa "texto libre"— pero un cliente que espere la clave
presente debe tolerar su ausencia. Afecta a `cierros_exteriores`, `closet_mural`, `sanitarios` y
`griferia` en las 4 combinaciones.

---

## 10 · Hallazgo de Fase 2 · la spec y la radiografía invierten dos catálogos

Al verificar el mapeo contra el `.xlsm` real —leyendo los bloques `dataValidation` del XML de
`xl/worksheets/sheet3.xml`, sin `openpyxl`— apareció una discrepancia entre los documentos y el
archivo:

| Celda | Campo | Lo que dicen spec §2.8.1 y `radiografia-excel-informe.md` | Lo que dice el `.xlsm` |
|---|---|---|---|
| `H42` | Cierros exteriores | catálogo de 6 valores `[Antecedentes!CK45:CK50]` | **ninguna `dataValidation`** → texto libre |
| `H43` | Obras complementarias | "mismo catálogo" (por herencia de la fila anterior) | **`H43:X43 → $CK$45:$CK$50`** |

El rango existe y tiene sus 6 valores; lo que está mal es a qué campo se le atribuye. El mapeo de
Fase 1 ya lo tenía bien, de modo que **el sembrado es correcto** y no hubo que rehacer nada.

Un segundo hallazgo del mismo barrido: **`iluminacion` comparte la `dataValidation` de `calidad`**
—`BE46:BE50` y `Y37:Y44` están en la misma declaración, con el catálogo
`DEFICIENTE · INFERIOR · REGULAR · CORRIENTE · BUENA · SUPERIOR`—. La decisión 4 del Gate 1 no la
había incluido en su lista de campos inline; Sergio aprobó incorporarla el 22-ago-2026, de modo que
sus 20 filas llevan `catalogo_ref` inline y no vacío.

**Corregido in-place** en `docs/_notas/radiografia-excel-informe.md` §2.1, sin bump de versión.
**La spec arrastra la misma inversión** en §2.8.1 y **no se tocó**: es documento normativo y su
corrección corresponde a un bump propio. Queda anotada acá y en la nota de las 4 filas afectadas.

---

## 11 · Estado final de la tanda

| Ítem | Estado |
|---|---|
| Fase 1 · mapeo | ✅ completa — 3 bloques, 212 filas |
| Fase 1 · verificación contra Excel real (R1) | ✅ completa |
| **OK Gate 1 de Sergio** | ✅ **recibido** — las 4 preguntas respondidas |
| Fase 2 · sembrado | ✅ **completa** — 12/12 batches, 212/212 filas |
| Fase 2 · verificación post-sembrado | ✅ completa — 8 comprobaciones, todas verdes |
| Fase 3 · documentación | ✅ completa |
| **Airtable** | ✅ `C_DefaultsAntecedentes` con **212 filas** |
| Git | rama `feat/tasador-ui`, cambios sin commitear (commitea Sergio) |

### Reglas de la tanda · cumplimiento

| Regla | Cumplimiento |
|---|---|
| **R1** · verificación contra Excel real | ✅ Fase 1 y re-verificado en Fase 2 sobre el XML del `.xlsm` |
| **R2** · toda fila lleva `origen [Excel: hoja!celda]` | ✅ 212/212 |
| **R3** · `catalogo_ref` para los que tienen lista | ✅ ampliado a los inline por decisión del Gate 1 |
| **R4** · no tocar código | ✅ cero archivos de `app/`, `lib/` o `components/` |
| **R5** · Piloto no se siembra sin decisión | ✅ decisión tomada: no se siembran (A-43) |
| **R6** · sin fallback ni herencia entre combinaciones | ✅ las 12 combinaciones sin datos quedan sin filas |
| **R7** · anexo de estado de conservación fuera (A-39) | ✅ no se tocó |

### Qué queda abierto

- **A-18** — el valor por defecto de cada factor de homogeneización. Sigue siendo la única
  bloqueante de `GET /api/tasaciones/config/defaults`. Ajena a esta tanda.
- **A-38** — dónde se materializan los catálogos de valores admisibles. Sin cambios: esta tanda los
  referenció por `catalogo_ref` y no creó tabla hermana.
- **A-39** — dónde vive el anexo de estado de conservación.
- **A-40** — si `Bodega` es tipo de propiedad o tipo de bien.
- **A-41 · A-42 · A-43** *(nuevas)* — las tres de esta tanda. Ninguna bloquea a P7-TAS.
- **La inversión de catálogos en spec §2.8.1** — corregir en el próximo bump de la normativa.

### Próximo paso

**P7-TAS puede construir la sección E con precarga efectiva.** La tabla tiene datos para las 4
combinaciones que la operación usa; el resto presenta campos vacíos, que es el comportamiento
declarado en §2.8.1 y no un error a reportar. Los dos ejes de lectura son `tipo_propiedad`
(`fldNZVhxeoIMGCMiZ`, **Link** — el join es por record ID, nunca por literal) y `estado_uso`
(`fldnXKVSv2xbPWi2j`, `nuevo`/`usado` en minúscula).

Dos cosas que la UI debe tolerar desde el día uno: el valor `BUENA` en un campo de estado (A-42) y
la ausencia de la clave `catalogo_ref` en las filas de texto libre.
