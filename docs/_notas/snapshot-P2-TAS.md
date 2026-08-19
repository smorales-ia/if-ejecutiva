# Snapshot · P2-TAS — API Routes directas a Airtable

> ## ⚠ TANDA EN CURSO — abierta el 2026-08-17
>
> Este snapshot se abre **al inicio** de la tanda, no al cierre, porque contiene una decisión de
> producto canónica que no debe depender de que la sesión llegue a su fin.
>
> **Mientras no exista `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2-TAS.md`, esta tanda está a
> medias** y aplica §0.7 · paso 6 del plan: retomar P2-TAS leyendo este archivo. Al cerrar, se
> completan §3 en adelante y se genera el archivo de aprendizajes.
>
> **Rama:** `feat/tasador-ui` · **Contrato:** 🟡 pausa-en-comandos · **Modo:** `accept edits on`

---

## 0 · Decisiones de arranque de la tanda (Sergio · 17-ago-2026)

### 0.1 · La tanda se parte en dos

| Sub-tanda | Alcance | Cierre |
|---|---|---|
| **P2-TAS.A** · capa server | Las 13 filas de rutas (**12 archivos `route.ts`**) + `auth-guard.ts` + `auditoria.ts` + validadores Zod + tests de vitest | Snapshot y commit **antes** de arrancar B |
| **P2-TAS.B** · capa cliente | Las 8 funciones de `lib/tasaciones.ts`, `lib/tasador-store.ts`, `use-estado-tasador`, `factores-default` | Cierra el **build verde** de OV-7 |

⚠ **13 filas ≠ 13 archivos.** La tabla de §3.1 del plan cuenta una fila por método: `/fotos` junta
GET+POST, `/datos` GET+PATCH y `/comparables` GET+POST+DELETE. Son **12 `route.ts`**. Es el mismo
error de conteo que OV-12 advierte para las secciones del formulario: verificar sobre el contrato,
no sobre el árbol.

**OV-7 se corre a P2-TAS.B.** El build sigue rojo al cerrar A, y eso es lo esperado.

### 0.2 · Ajuste puntual del contrato 🟡 — sólo para esta tanda

**No modifica RO-03 ni el contrato 🟡 del plan en general.** Vale para P2-TAS.A y P2-TAS.B:

| Sin confirmación | Con confirmación previa |
|---|---|
| `pnpm tsc` · `pnpm build` · `pnpm test` | Cualquier `curl` |
| `ls`, `grep` y demás lectura local | Cualquier comando que toque Airtable, **incluida la Meta API de sólo lectura** |
| Ediciones de archivo | Cualquier comando `git` |

El criterio es la frontera del repo: lo que no sale de él y no muta nada fuera, corre solo.

### 0.3 · Checkpoint obligatorio antes de `/config/defaults`

Antes de escribir la ruta hay que **leer el schema real de `C_VariablesCliente`**
(`tblgrY8j4ugFzS7v9`) por Meta API —sólo GET— y **mostrar a Sergio los campos encontrados**.

> **Condición de parada explícita:** si **no** existen literalmente `factor_sup`, `factor_edad` y
> `factor_distancia` —o equivalentes evidentes—, **se para y se reporta**. No se inventan nombres
> ni se adivinan mapeos.

Los campos encontrados se documentan en `docs/schema-airtable.md` como parte del cierre.

---

## 1 · DECISIÓN CANÓNICA — la coordinación no se soporta por sistema

**Sergio, 2026-08-17. Cerrada. No se vuelve a consultar.**

> La coordinación **ejecutiva ↔ tasador** y **tasador ↔ visador** **NO se soporta por sistema**.
> Es manejo manual fuera de plataforma. **`TX_CoordinacionVisita` no existe ni existirá.**
> Esto cierra **CI-012** por decisión de producto.

### 1.1 · Dónde quedó registrada

| Lugar | Forma | Estado |
|---|---|---|
| `docs/aprendizajes.md` | **RO-29**, al final de *Reglas operativas aprendidas* (antes de *Bitácora reciente*) | ✅ escrita |
| `docs/CODE_INCONSISTENCIES.md` | Ficha **CI-012**: `Resolución` reescrita, `Dueño` y `Fecha objetivo` actualizados, `Estado` → **cerrada**, y 4 notas nuevas | ✅ cerrada |
| `docs/_notas/snapshot-P2-TAS.md` | Este §1 | ✅ |

**Correlativo verificado antes de asignar (RO-25):** el último RO vivo era **RO-28**
(`docs/aprendizajes.md:264`). El nuevo es **RO-29**. La nota de la entrada del 11-ago-2026 que dice
*«último vivo RO-26»* es histórica: RO-27 y RO-28 se agregaron el 13-ago-2026.

**No hay tabla índice de CIs** en `CODE_INCONSISTENCIES.md` — el estado vive sólo en el campo
`Estado` de cada ficha, así que no hay un segundo lugar que actualizar.

### 1.2 · Qué queda ejecutado y qué queda pendiente

**Ya ejecutado por las tandas anteriores** (nada que rehacer):

- **P0.5-TAS** no creó `TX_CoordinacionVisita`, ni `coordinacion_vigente`, ni las dos plantillas de
  correo de coordinación (`docs/schema-airtable.md` §26.2 y §26.5).
- **P1-TAS** no tipó `CoordinacionVisita`, `EstadoCoordinacion`, `MotivoNoContacto`,
  `MOTIVOS_DEVOLUCION`, `intento_numero` ni `AccionCard`.

**Pendiente de ejecución — es tarea documental, ya no decisión:**

> 🚫 **SIN OBJETO desde el 19-ago-2026.** Las cuatro filas de abajo derivaban de **RO-29**,
> que quedó **anulada**: CI-012 se cerró en sentido opuesto por la revisión de Héctor del
> diseño v4 (Pantalla 2, puntos 1-4). **No se retira nada.** RF-TAS-04 y RF-TAS-05 quedaron
> **desbloqueados** en la spec v1.9.10, §1.3.2 y §1.3.3 recuperaron el encargo de leer la
> coordinación, y P4-TAS **vuelve a la secuencia oficial** en lugar de retirarse de ella. La
> tabla se conserva como registro de lo que se planificó el 18-ago-2026, no como trabajo
> vigente. La ruta `…_v1_9_9.md` que cita también se deja intacta por lo mismo.

| Qué | Dónde | Cuándo |
|---|---|---|
| Retirar RF-TAS-04 y RF-TAS-05, §2.11 y §2.12 | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` | Próximo bump normativo |
| Quitar el encargo a IF-02 de leer la coordinación | Spec §1.3.2 y §1.3.3 | Próximo bump normativo |
| **Reescribir la Regla T-A**: colapsa de 3 variantes de botón a 1 («Abrir tasación»), sin gate de coordinación | `docs/_md/plan_ejecucion_UItasador_v1.0.md` §0.3 | Próximo bump del plan |
| Retirar P4-TAS de la secuencia oficial de §0.7 | Plan de IF-03 | Próximo bump del plan |
| Borrar o dejar inertes `components/tasador/coordinar-visita.tsx` (512 l.) y `app/tasaciones/[id]/coordinar/page.tsx` | Código | **Decisión de Sergio pendiente** — borrarlos deja 6 rutas contra las 7 de CI-020 |
| Crear `AccionCard` en su forma colapsada, o no crearla | `lib/tasaciones.ts` | **P3-TAS** · lleva `TODO(P3-TAS)` |

### 1.3 · Efecto sobre el set de rutas de esta tanda

**El plan §3.1 lista 15 rutas. Se construyen 13.** Las dos que no se construyen:

| Método | Ruta | Motivo |
|---|---|---|
| GET | `/api/tasaciones/[id]/coordinacion` | RO-29 · sin tabla origen |
| POST | `/api/tasaciones/[id]/coordinacion` | RO-29 · sin tabla destino |

→ **El criterio de aceptación de §3.3 («Las 15 rutas existen») se lee como 13.** No es
incumplimiento: es el alcance recortado por RO-29. Cae con ellas la *unicidad blanda* del POST
(409 por doble tap, mitigación R-2), que era una regla específica de la ruta de coordinación, y su
test correspondiente de §3.2 · paso 8.

---

## 2 · Otro hallazgo de arranque: `A_Cambios` está documentada mal

**El plan §3.1 · capa 4 acierta y `docs/schema-airtable.md` §10 se equivoca.** La capa de auditoría
escribe con el par `tabla_origen` + `registro_id`, tal como manda el plan; §10 documenta
`tabla_afectada` y un Link `solicitud` que **no existe en la tabla real**.

No hizo falta consultar Airtable para resolverlo: **CI-011** ya verificó el schema vivo vía REST el
11-ago-2026 (14 campos, `tbl6Yd0c7MRqNeC0x`) y `lib/historial-airtable.ts:118-139` ya lee la tabla
por sus campos reales en producción.

Campos reales que usa la auditoría de IF-03:

| Campo | Nota |
|---|---|
| `tabla_origen` | singleSelect — **no** `tabla_afectada`, y no es texto libre |
| `registro_id` | singleLineText · **es la FK real** (poblado 9/9) |
| `registro_nombre` | poblado 9/9 |
| `campo_modificado` · `valor_anterior` · `valor_nuevo` | multilineText los dos últimos |
| `modificado_por_email` | **es el autor real** (9/9). El campo `autor` existe pero está vacío 9/9 |
| `razon_cambio` | **es el motivo real** (6/9). El campo `motivo` existe pero está vacío 9/9 |
| `timestamp` | dateTime **editable**, no Created time |

⚠ `A_Cambios` **no tiene FIELD_IDs documentados**. Se referencia por nombre, igual que
`lib/historial-airtable.ts`, que funciona en producción. Queda anotado como deuda.

---

## 2.bis · Deudas de P1-TAS cerradas con el schema bajado

La bajada de schema por Meta API resolvió gratis dos deudas que P1-TAS había dejado abiertas.

### 2.bis.1 · Los 9 FIELD_IDs pendientes — CERRADO

`FIELD_IDS_PENDIENTES` queda **vacío**. Los nueve se resolvieron y viven en `FIELD_IDS_SOLICITUD`:

| Campo | FIELD_ID | Tipo |
|---|---|---|
| `tasador` | `fldlgriK1jP5906wE` | Link → M_Tasadores — **es el campo del guard RF-09** |
| `direccion` | `fldKP0yxwQkSdrFuZ` | singleLineText |
| `rol_sii` | `fldznAL2SuCpfUUtg` | singleLineText |
| `comuna` | `fldJTjjzCPBHMOWZv` | Link → M_Comunas |
| `producto` | `fldp64U99lsLf7HlV` | Link → M_Productos |
| `tipo_informe` | `fldJO4JtsDEeMmjdi` | Link → M_TiposInforme |
| `pdf_final_url` | `fldASzRV9aQNFExpY` | url |
| `cliente_final_nombre` | `fld7jxcbmMYz6kmbj` | singleLineText |
| `cliente_final_rut` | `fldwNEPL8fXkWwUBd` | singleLineText |

Se sumaron además los 9 FIELD_IDs de **`A_Cambios`** (`FIELD_IDS_CAMBIOS`), que CI-011 daba por
indocumentados.

### 2.bis.2 · Los dominios de `OPCIONES` — CERRADO, y estaban casi todos mal

P1-TAS los escribió desde el v0 y anotó que había que contrastarlos. **El riesgo se materializó:**

| Catálogo | Lo que escribió P1-TAS | Dominio real |
|---|---|---|
| `estadoConservacion` | `nuevo·sin_uso·bueno·normal·malo·deficiente` | `Bueno · Muy Bueno · Regular · Malo · Muy malo · NUEVO - S/USO` — y **el campo no era el de `TX_Solicitudes`** sino el de `TX_DatosTasacion` |
| `agrupacion` | minúsculas | `Aislada · Pareada · Continua · Edificio · Condominio · POBLACIÓN` |
| `material` | incluía `metalcon`, que **no existe** | `Hormigon armado · Albanileria · Acero · Madera · Mixto` |
| `velocidadVenta` | `rapida·normal·lenta` | **nueve rangos en meses** (`1 a 2 meses` … `mas de 24 meses`) |
| `subtipoItem` | slugs inventados | `Edificacion · Terreno · OOCC · Piscina · Terraza · Bodega · Estac U/Goce · Estac Descubierto · S/Reg No Regularizable` |
| `tipoItem` | `ha-muni`, `ha-no-muni`… **inventados enteros** | `Edificacion · Terreno · OO.CC. · Piscina · Estac. U/Goce · Estac. Desc · Bodega · Terraza · Subterraneo · Otro` |
| `situacionMunicipal` | `regularizado·regularizable·no-regularizable` | `Regularizado · S/Reg Regularizable · S/Reg No Regularizable · No Aplica` |
| `origenSuperficie` | 4 slugs inventados | `carta_ficha_inmobiliaria · plano · base_interna_sii · certificado_avaluo · medicion_tasador`, y **en `TX_Unidades`**, no en el ítem |
| `orientaciones` | `N·NE·E·SE·S·SO·O·NO` | ✅ **el único que estaba bien** |

Se agregaron `estadoItem` (`flag_estado`: `Bueno·Regular·Malo` — distinto del estado del inmueble),
`materialItem` y `tipoReferencia`.

**`tipoZona` se retiró.** No es un select: `TX_DatosTasacion` **linkea a `M_Zonificacion`**. Un
catálogo hardcodeado sería incorrecto de raíz. Retirarlo rompe `seccion-propiedad.tsx:226` **a
propósito** — es preferible un error de compilación a un select que escribe en un Link. **P7-TAS**
decide si usa el Link o el campo libre `tipo_zona_descripcion` (`fldbrYbbvJThBaGwC`).

### 2.bis.3 · `Comparable.fuente` es un homónimo peligroso

El campo persiste en `TX_Comparables.tipo_referencia` (`fldB920e8jIKgbERM`, `Oferta · CBR`), **no**
en `TX_Comparables.fuente` (`fldNYh1KpD3oO0Gmz`), que existe con dominio ajeno: `tasador ·
portal_toc · historico_sistema · cliente · Portal Inmobiliario · Yapo · Toctoc · Ofert. · CBR.` —
de dónde salió el dato, no qué clase de referencia es.

⚠ Escribir `'oferta'` en `fuente` **no fallaría**: `typecast: true` crearía la opción y ensuciaría
el dominio en silencio. El identificador se conserva (6 usos en el v0) y el mapeo al FIELD_ID
correcto vive en la ruta `/comparables`.

### 2.bis.4 · Los dominios reales están sucios

Traen duplicados por mayúsculas y acentos: `Edificio`/`EDIFICIO`, `Hormigon armado`/`HORMIGON
ARMADO`/`Hormigon Armado`, `Albanileria`/`ALBAÑILERIA LADRILLO`/`ALBAÑILERÍA LADRILLO`,
`Urbano`/`Urbana`, y `C_Factores.tipo_factor` incluye el literal `tipo_factor` como opción. No son
variantes con significado: es suciedad de datos. `OPCIONES` expone **una sola** de cada grupo, en
capitalización normal, con el `v` fijado a mano y no derivado.

→ **No es deuda de IF-03**: es limpieza de la base, con sign-off de negocio. Anotado, no tocado.

---

## 3 · Qué se construyó

### 3.1 · Capas compartidas (P2-TAS.A) — hechas

| Archivo | Capa | Contenido |
|---|---|---|
| `lib/tasador/auth-guard.ts` | 1 + 2 | `autorizarSolicitud(id)` · identidad por `getUsuarioTasador()` + guard RF-09 contra `TX_Solicitudes.tasador`. Devuelve el registro leído para que la ruta no lo relea |
| `lib/tasador/mensajes.ts` | — | Literales §6.1 en un solo archivo, para que P12-TAS los barra de una pasada |
| `lib/tasador/auditoria.ts` | 4 | `auditar()` y `derivarCambios()` contra el schema **real** de `A_Cambios` |

**Tres decisiones de diseño que conviene no revertir sin leer el porqué:**

1. **El 403 y el 404 devuelven el mismo cuerpo.** Distinguir «no existe» de «no es tuya» le
   confirma a un tercero que el código existe. Es la fuga que RF-09 evita.
2. **`auditar()` no lanza.** Una auditoría fallida no debe tumbar una mutación ya aplicada: dejaría
   al usuario con un error en pantalla y el dato escrito. Loguea y sigue.
3. **`derivarCambios()` sólo emite lo que cambió de verdad.** Auditar un campo reenviado igual
   llena `A_Cambios` de ruido y hace ilegible el timeline de §1.3.3.

### 3.2 · Las 11 rutas — completas

```
app/api/tasaciones/route.ts                      GET          cola personal
app/api/tasaciones/[id]/route.ts                 GET          detalle
app/api/tasaciones/[id]/estado/route.ts          GET          polling de estado
app/api/tasaciones/[id]/calcular/route.ts        POST         asignada → visitada
app/api/tasaciones/[id]/rechazo/route.ts         POST         observacion_rechazo_tasador
app/api/tasaciones/[id]/expediente/route.ts      GET          adjuntos sólo lectura
app/api/tasaciones/[id]/lectura/route.ts         GET          avance de extracción
app/api/tasaciones/[id]/comparables/route.ts     GET·POST·DELETE
app/api/tasaciones/[id]/fotos/route.ts           GET·POST
app/api/tasaciones/[id]/datos/route.ts           GET·PATCH    ← 18-ago · 8 tablas
app/api/tasaciones/[id]/informe/route.ts         GET          ← 18-ago · 8 bloques
```

Seis capas compartidas (era cinco; el DELETE agregó una):

```
lib/tasador/auth-guard.ts        capas 1+2 · identidad y RF-09
lib/tasador/auditoria.ts         capa 4 · A_Cambios contra el schema REAL
lib/tasador/mensajes.ts          literales §6.1 en un solo archivo
lib/tasador/respuestas.ts        ok() · error() · desdeGuard() · desdeExcepcion()
lib/tasador/validators/index.ts  capa 3 · Zod + parsearCuerpo() + CAMPOS_SIN_DESTINO
lib/tasador/airtable-writes.ts   deleteRecords() ← 18-ago · revisión de OV-8
```

### 3.3 · Los tres tests — 39 casos, no 3

```
app/api/tasaciones/[id]/calcular/route.test.ts   10 casos
app/api/tasaciones/[id]/rechazo/route.test.ts     9 casos
app/api/tasaciones/[id]/datos/route.test.ts      20 casos
```

**Suite completa: 325 verdes en 13 archivos** (286 previos + 39). Ninguno de los 286 anteriores
se movió.

Cada archivo cubre el caso que el plan pedía **más los flancos que ese caso deja abiertos**:

| Archivo | Lo pedido | Lo que se agregó y por qué |
|---|---|---|
| `/calcular` | el 409 | Cada rechazo afirma que `updateRecord` **no** se llamó — un 409 que igual escribió es un 409 inútil y el status no lo delata. Y el **doble tap real**: primera llamada transiciona, el guard relee `visitada`, segunda da 409, y al final hay **una** escritura. Es la garantía de que AT03 corre una vez. |
| `/rechazo` | los 20 caracteres | Los bordes se afirman con `toHaveLength` contra `MIN_CARACTERES_OBSERVACION`, así que cambiar el mínimo falla diciendo la verdad. El `.trim()` tiene caso propio: 19 caracteres entre espacios miden 25 en bruto y sin el recorte pasarían. Y una sección **«lo que la ruta NO hace»** que afirma que `estado` no aparece en el update y que hay una sola escritura (A-15). |
| `/datos` | el guard 403 | Los tres modos de fallo × GET y PATCH. La aserción central: ante un guard fallido, `deleteRecords`, `updateRecord`, `createRecord`, `listRecords` y `getRecord` tienen **cero** llamadas. Más dos **controles negativos**, sin los cuales todo lo anterior pasaría trivialmente si la ruta estuviera rota. |

### 3.4 · El criterio de §3.3 dice «15 rutas». Son 11, y la cadena es ésta

**No es incumplimiento. Es alcance recortado por tres decisiones legítimas, cada una con causa
registrada.** La cadena se escribe acá porque sin ella el conteo final parece un déficit:

| | De | A | Causa |
|---|---|---|---|
| 1 | 15 | **13** | **RO-29** · la coordinación no se soporta por sistema. Caen `GET` y `POST /coordinacion`; `TX_CoordinacionVisita` no existe ni existirá. Cierra CI-012 en negativo. |
| 2 | 13 | **12** | **A-18** · ninguna tabla de la base puede servir un factor de homogeneización hoy (`valor_referencia` vacío en las 15 filas de `C_FactoresHomogeneizacion`). `GET /config/defaults` no se construye porque **devolvería `null`**, y suplirlo con constantes es lo que RF-TAS-08 prohíbe. |
| 3 | 12 filas | **11 archivos** | Aritmética, no recorte: la tabla de §3.1 cuenta **una fila por método** y tres rutas agrupan varios (`/comparables` GET·POST·DELETE, `/datos` GET·PATCH, `/fotos` GET·POST). |

Con el recorte 1 cae también su test (la unicidad blanda del POST de coordinación), y por eso los
tests del plan son **3** y no 4.

---

## 4 · Estado del build

| | Al abrir la tanda | Al cerrar |
|---|---|---|
| `pnpm tsc --noEmit` | 🔴 41 → 42 errores | 🔴 **42 errores** — sin movimiento |
| Errores en lo escrito en P2-TAS.A | — | **0** ✓ |
| `pnpm test` | 286 verdes | ✅ **325 verdes** (13 archivos) |
| `pnpm build` | 🔴 `Module not found` | 🔴 igual — **esperado**, cierra en P2-TAS.B |

Los 42 son deuda ya inventariada y ninguno es de esta tanda: 13 del huérfano
`coordinar-visita.tsx`, ~20 de los módulos de P2-TAS.B (`lib/tasador-store`, `use-estado-tasador`,
`factores-default`), 5 de OV-10, 2 del `Select` de `@base-ui`, 1 del residuo CI-015, y 1 el
`tipoZona` retirado a propósito en P1-TAS.

**El verde del build sigue diferido a P2-TAS.B por OV-7.** Es lo esperado y no bloquea el cierre.

---

## 5 · Criterios de aceptación de §3.3

| Criterio | Estado |
|---|---|
| Las 15 rutas existen bajo `app/api/tasaciones/**` | ✅ **como 11** — cadena en §3.4 |
| Cero Make (`grep -rniE "make\|postToMake\|MAKE_WEBHOOK\|X-VP-Signature"`) | ✅ sin coincidencias |
| Las cuatro capas en orden en toda ruta | ✅ toda ruta importa `auth-guard`; las de mutación, un validador Zod |
| GET a solicitud ajena → 403 sin filtrar | ✅ **probado** · 20 casos en `datos/route.test.ts` |
| Dos POST a `/coordinacion` → 1 fila y un 409 | ⛔ **N/A** — cae con RO-29 |
| `POST /calcular` sobre `visitada` → 409 sin escribir | ✅ **probado** · 4 casos |
| `POST /rechazo` deja `estado` idéntico | ✅ **probado** · 3 casos |
| Toda mutación deja fila en `A_Cambios` con `tabla_origen` + `registro_id` | ✅ · las colecciones hijas contra la solicitud, por **RO-32** |
| SLA desde `lib/sla-etapas.ts`, sin literales de plazo | ✅ |
| `package.json` sin dependencias nuevas | ✅ **cero** — vitest ya estaba |
| `pnpm tsc`, `pnpm build` y `pnpm test` verdes | ⚠ **test sí; tsc y build no** — OV-7, diferido a P2-TAS.B |
| `git status` sin cambios en `app/api/solicitudes/**`, `components/console/**`, `app/(ejecutiva)/**` | ✅ verificado |
| Archivo de aprendizajes creado | ✅ `docs/_archivo/aprendizajes-20260818-1550-P2-TAS.md` |

---

## 6 · Qué falta, y para quién

### 6.1 · Inmediato — P2-TAS.B

Capa cliente: las 8 funciones de `lib/tasaciones.ts`, `lib/tasador-store.ts`,
`use-estado-tasador` y `factores-default`. **Cierra el build verde de OV-7.**

⚠ `factores-default` depende de **A-18**, que sigue bloqueante: no hay valor por defecto que
precargar. Ver **OV-6** — el nombre del módulo sugiere lo que RF-TAS-08 prohíbe.

### 6.2 · Deuda que esta tanda deja escrita

| Ficha | Qué queda | Para quién |
|---|---|---|
| **CI-023** | **24 campos de `InformeData` sin columna destino.** Decidir si se crean en Airtable, se retiran del tipo, o se consolidan en los `multilineText` existentes | **P7-TAS** |
| **CI-023 · Notas** | El formato de `clave_*` (`{codigo}-{discriminador}`) es **tentativo**: si AT03 espera otro, el upsert de las 4 hijas duplicará filas | **P7-TAS** o quien toque AT03 |
| **CI-024** | El pipeline PDF debe poblar el Link `solicitud` de `TX_DocumentosGenerados`, o la cabecera del preview nunca mostrará versión | dueño de E1/E2/E3 · verifica **P9-TAS** |
| **CI-025** | Los 9 campos SII inexistentes: corregir `schema-airtable.md` §20.6 o crearlos. **Y auditar el alcance de §21**, que declara una verificación que no los cubrió | dueño del bloque SII · **Héctor** |
| **CI-026** | Uniformar el status del guard a 404, o corregir el docblock que declara la mitigación completa | **Héctor** + seguridad · natural en **P11-TAS** |
| **A-18** | Sigue **bloqueante**. Ninguna tabla puede servir un factor de homogeneización | Héctor y Óscar |
| **OV-13** | `coordinar-visita.tsx` sigue huérfano y aporta 13 de los 42 errores. Con RO-29, ese archivo no tiene destino | decisión de Sergio |

### 6.3 · Lo que NO queda pendiente, y conviene que se sepa

- **Los FIELD_IDs de las 6 tablas de captura ya están levantados** y viven en `field-ids.ts`. No
  hay que volver a consultarlos.
- **`deleteRecords` existe** en `lib/tasador/airtable-writes.ts`. La próxima tanda que necesite
  borrar no tiene que resolver de nuevo el roce con R5.
- **vitest está instalado y configurado.** El `CLAUDE.md` decía «cuando esté» y era falso; se
  corrigió en esta tanda. Hay tres precedentes de test de Route Handler en IF-03 además de los dos
  de IF-02.
