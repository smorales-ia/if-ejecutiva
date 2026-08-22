# Snapshot · P0.5.C-TAS — Fase 1 · sembrado de `C_DefaultsAntecedentes`

> **Fecha** — 22-ago-2026. **Rama** — `feat/tasador-ui`. **Base** — `app9G7lLkIV3CpeLa`.
> **Estado** — ⏸ **Fase 1 completa, esperando OK Gate 1.** Fase 2 no arrancó.
> **Airtable intacto**: `C_DefaultsAntecedentes` (`tblOj7nXcjeouPy09`) sigue con **0 filas**.

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
| `entrepisos` | materialidad | ⚠ **A-41** | ⚠ **A-41** | LOSA DE HORMIGON ARMADO | LOSA DE HORMIGON ARMADO | `Antecedentes!H39` | inline (6 val.) |
| `cubierta` | materialidad | **PLANCHA METALICA** | **PLANCHA METALICA** | **FE GALVANIZADO** | **FE GALVANIZADO** | `Antecedentes!H40` | `Antecedentes!CE45:CE63` |
| `revestimiento_exterior` | materialidad | ESTUCO Y PINTURA | ESTUCO Y PINTURA | ESTUCO Y PINTURA | ESTUCO Y PINTURA | `Antecedentes!H41` | `Antecedentes!CH45:CH54` |
| `cierros_exteriores` | materialidad | REJA METALICA | REJA METALICA | REJA METALICA | REJA METALICA | `Antecedentes!H42` | *(vacío — texto libre)* |
| `obras_complementarias` | materialidad | *(no se siembra)* | *(no se siembra)* | **PISCINA** | **PISCINA** | `Antecedentes!H43` | `Antecedentes!CK45:CK50` |
| los 6 primeros | calidad | BUENA | BUENA | BUENA | BUENA | `Antecedentes!Y37:Y42` | inline (6 val.) |
| los 6 primeros | estado | **NUEVO S/USO** | **BUENO** | **NUEVO S/USO** | **BUENO** | `Antecedentes!AF37:AF42` | inline (7 val.) |
| `obras_complementarias` | calidad | — | — | BUENA | BUENA | `Antecedentes!Y43` | inline (6 val.) |
| `obras_complementarias` | estado | — | — | NUEVO S/USO | ⚠ **BUENA · A-42** | `Antecedentes!AF43` | inline (7 val.) |

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

## Total de filas a sembrar: **212**

| Combinación | `elementos_fundamentales` | `elementos_otros` | `terminaciones_recinto` | Total |
|---|---|---|---|---|
| `Casa` × `nuevo` | 17 | 14 | 20 | **51** |
| `Casa` × `usado` | 17 | 14 | 20 | **51** |
| `Departamento` × `nuevo` | 21 | 14 | 20 | **55** |
| `Departamento` × `usado` | 21 | 14 | 20 | **55** |

Sube a **214** si A-41 se resuelve sembrando `entrepisos` en Casa.

---

## 6 · Ambigüedades detectadas

**A-41 · Dos defaults dependen de interruptores que no son parte de la clave de partición.**

- **`entrepisos` en Casa** `[Excel: Antecedentes!H39]`:
  `=IF(tipoPropiedad="Departamento","LOSA…",IF(AND(tipoPropiedad="Casa",numeroPisos=1),"","LOSA…"))`.
  Depende de **`numeroPisos`** (`Portada!BK5`), un tercer eje ajeno a la clave. Una casa de un piso
  no tiene entrepisos; una de dos, sí. **Recomendación: no sembrar** — las dos ramas son igual de
  plausibles y elegir mal pone una losa donde no la hay.
- **`calefaccion`** `[Excel: Antecedentes!AR38]`: `=IF(AB22="SI","LOSA RADIANTE","NO PRESENTA")`.
  Depende de que la propiedad declare calefacción en el bloque de comodidades. Con la plantilla en
  blanco, `AB22` está vacío → `NO PRESENTA`. **Recomendación: sembrar `NO PRESENTA`**, que es lo
  que la plantilla despacha en blanco — exactamente el caso que el pre-llenado modela.

**A-42 · `BUENA` como valor de estado, fuera de su propio catálogo.**

> ⚠ **Corrección respecto de la instrucción que originó este snapshot**: el caso es
> **Departamento·usado**, no Casa·usado. En Casa no se siembra `obras_complementarias` en absoluto,
> porque `H43` devuelve `""` para todo lo que no sea Departamento.

`AF43` = `=IF(H43<>"",IF(estadoUso="Nuevo","NUEVO S/USO","BUENA"),"")`. En **Departamento·usado**
devuelve `BUENA`, que pertenece al catálogo de **calidad**
(`DEFICIENTE·INFERIOR·REGULAR·CORRIENTE·BUENA·SUPERIOR`) y **no** al de estado
(`MUY BUENO·NUEVO S/USO·BUENO·REGULAR·DEFICIENTE·OBRA GUESA·TERMINACIONES`). Es un error de la
plantilla; lo esperable sería `BUENO`. **Recomendación: sembrar `BUENA` tal cual** (R1: gana el
Excel) y registrar la ambigüedad, en vez de corregirla por cuenta propia.

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

**Recomendación: opción (a), no sembrarlos ahora.** Sus combinaciones quedan sin filas y la UI
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

## 9 · Estado de la tanda

| Ítem | Estado |
|---|---|
| Fase 1 · mapeo | ✅ **completa** — los 3 bloques mapeados, 212 filas calculadas |
| Fase 1 · verificación contra Excel real (R1) | ✅ completa · `openpyxl` con `data_only=False` |
| **OK Gate 1 de Sergio** | ⏸ **PENDIENTE** — 4 preguntas abiertas (ver §10) |
| Fase 2 · sembrado | ❌ **no arrancó** |
| Fase 3 · documentación | ❌ no arrancó |
| **Airtable** | ✅ **INTACTO** — `C_DefaultsAntecedentes` con **0 filas**, verificado |
| Git | rama `feat/tasador-ui`, sin commits nuevos |

### Las 4 preguntas que bloquean el Gate 1

1. **A-41 · `entrepisos` en Casa**: ¿sin sembrar (recomendado) o `LOSA DE HORMIGON ARMADO`?
2. **A-42 · `BUENA` como estado**: ¿sembrar el valor del Excel tal cual (recomendado, R1) o
   corregir a `BUENO`?
3. **A-43 · Piloto**: ¿se confirma la opción (a), no sembrarlos?
4. **`catalogo_ref` en catálogos inline**: R3 sólo cubre los 5 rangos ocultos y el texto libre. Para
   los ~8 campos con lista **literal inline** (entrepisos, calidad, estado, aire, calefacción,
   pavimento, muros, cielo) se propone citar la celda portadora —ej. `Antecedentes!AF37 · lista
   inline`— en vez de dejar vacío: distingue "tiene catálogo, está inline" de "es texto libre".

---

## 10 · Prompt de reanudación

> Copiar tal cual en una sesión nueva de Claude Code, sobre la rama `feat/tasador-ui`.

```
# Reanudar tanda P0.5.C-TAS · sembrado de C_DefaultsAntecedentes

## Contexto
Retomamos una tanda interrumpida. TODO el estado está en:
docs/_notas/snapshot-P0.5.C-TAS-fase1-en-curso.md

Leelo COMPLETO antes de hacer nada. La Fase 1 (mapeo) está terminada: los tres
bloques mapeados y 212 filas calculadas. NO hay que rehacer el mapeo.

## Lectura obligatoria al iniciar
1. docs/_notas/snapshot-P0.5.C-TAS-fase1-en-curso.md  (este estado)
2. docs/_md/VProperty_Especificacion_Proyecto_v1_9_14.md §2.8.1 (RF-TAS-23)
3. docs/schema-airtable.md — C_DefaultsAntecedentes (11 campos) y §7.1 M_TiposPropiedad
4. docs/_notas/radiografia-excel-informe.md
5. docs/_sync_ifTasador_v1/gap/_ambiguedades.md — A-38 abierta, A-37 cerrada

## Estado verificado al pausar
- Airtable: C_DefaultsAntecedentes (tblOj7nXcjeouPy09) con 0 filas. Intacto.
- M_TiposPropiedad saneada: Casa=recrXDAjlVCe59XBW, Departamento=recf9hz8TbkQ6wsus
- Rama feat/tasador-ui, sin commits pendientes de esta tanda salvo el snapshot.

## Modo y contrato
- Modo: default. 🔴 pausa-total para escritura MCP Airtable.
- create_records_for_table → pausa s/n por cada bloque (12 grupos: 3 bloques × 4
  combinaciones). Lecturas libres.
- Base app9G7lLkIV3CpeLa. Sin commits: Sergio commitea por GitHub Desktop.
- R4 vigente: no tocar código.

## Lo primero que hay que hacer
Presentarle a Sergio las 4 preguntas del §9 del snapshot y esperar su OK Gate 1:
  1. A-41 · entrepisos en Casa: ¿sin sembrar o LOSA DE HORMIGON ARMADO?
  2. A-42 · BUENA como estado en Departamento·usado: ¿tal cual del Excel o BUENO?
  3. A-43 · Casa Piloto / Departamento Piloto: ¿confirmar no sembrarlos?
  4. catalogo_ref en catálogos inline: ¿citar celda portadora o dejar vacío?

Con el OK, ejecutar Fase 2 (sembrado en 12 batches con pausa s/n) y Fase 3
(documentación: schema-airtable.md, snapshot final P0.5.C-TAS, registro de
ambigüedades A-41/A-42/A-43, SYNC_LOG, RESUME, plan IF-03 §8 in-place sin bump).

## Reglas duras de la tanda
R1 verificación contra Excel real · R2 toda fila lleva origen [Excel: hoja!celda]
R3 catalogo_ref para los que tienen lista · R4 no tocar código
R5 Piloto no se siembra sin decisión · R6 sin fallback ni herencia entre
combinaciones · R7 anexo de estado de conservación fuera (A-39)
```
