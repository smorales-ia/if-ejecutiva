# Snapshot · pausa de sesión a mitad de P2-TAS.A

> ## ⚠ LEER PRIMERO — esta sub-tanda **SÍ** quedó a medias
>
> A diferencia del `snapshot-P0.5-TAS-en-curso.md` de la sesión anterior, acá el sufijo
> `-en-curso` es literal: **P2-TAS.A está incompleta**. Faltan 2 rutas y los 4 tests.
>
> **No existe** `docs/_archivo/aprendizajes-*-P2-TAS.md`, así que §0.7 · paso 6 del plan aplica
> correctamente: **retomar P2-TAS**, no avanzar a P3-TAS.
>
> **Fecha de la pausa:** 2026-08-17, fin de jornada · **Rama:** `feat/tasador-ui`
> **Este archivo se borra al cerrar P2-TAS.A**, cuando se escriba el snapshot definitivo.
>
> El snapshot permanente de la tanda es `docs/_notas/snapshot-P2-TAS.md`, que **se conserva** y ya
> contiene §0 (decisiones de arranque), §1 (RO-29), §2 (`A_Cambios`) y §2.bis (deudas de P1-TAS
> cerradas). Este archivo sólo cubre lo ocurrido después.

---

## 1 · Dónde quedó — 9 de 11 rutas

**El set final de P2-TAS.A es de 11 rutas, no 13.** Dos recortes, ambos con causa registrada:

| Recorte | De | A | Motivo |
|---|---|---|---|
| Coordinación (GET + POST) | 13 | 11 | **RO-29** · CI-012 cerrada: la coordinación no se soporta por sistema |
| `GET /config/defaults` | 12 | 11 | **A-18** · ninguna tabla puede servir un factor de homogeneización hoy |

### 1.1 · Hechas y compilando limpias

```
app/api/tasaciones/route.ts                      GET     cola personal
app/api/tasaciones/[id]/route.ts                 GET     detalle
app/api/tasaciones/[id]/estado/route.ts          GET     polling de estado
app/api/tasaciones/[id]/calcular/route.ts        POST    asignada → visitada
app/api/tasaciones/[id]/rechazo/route.ts         POST    observacion_rechazo_tasador
app/api/tasaciones/[id]/expediente/route.ts      GET     adjuntos sólo lectura
app/api/tasaciones/[id]/lectura/route.ts         GET     avance de extracción
app/api/tasaciones/[id]/comparables/route.ts     GET·POST·DELETE
app/api/tasaciones/[id]/fotos/route.ts           GET·POST
```

Capas compartidas, completas:

```
lib/tasador/auth-guard.ts     capas 1+2 · identidad y RF-09
lib/tasador/auditoria.ts      capa 4 · A_Cambios contra el schema REAL
lib/tasador/mensajes.ts       literales §6.1 en un solo archivo
lib/tasador/respuestas.ts     ok() · error() · desdeGuard() · desdeExcepcion()
lib/tasador/validators/index.ts   capa 3 · Zod + parsearCuerpo()
```

### 1.2 · Falta

1. **`GET · PATCH /api/tasaciones/[id]/datos`** — la más grande. Mapea los **68 campos** de
   `InformeData` sobre `TX_DatosTasacion` (`tblMoK3mFuwN8Yr1A`, 83 campos) **más cuatro tablas
   hijas**: `TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`), `TX_Ampliaciones`
   (`tblpAtUq4p6o1vofo`), `TX_HabitacionesPorNivel` (`tblBITpPb8WuqsatM`) y
   `TX_TerminacionesPorRecinto` (`tbleQ7pcLxYx9NbCi`).
2. **`GET /api/tasaciones/[id]/informe`** — los 8 bloques del preview + versión vigente
   (`TX_DocumentosGenerados`).
3. **Los 4 tests de vitest** de §3.2 · paso 8, **menos uno**: la unicidad blanda del POST de
   coordinación cae con RO-29. Quedan **tres**: el guard 403, el 409 de `/calcular`, y la
   validación de los 20 caracteres de `/rechazo`.

---

## 2 · Las tres decisiones de hoy — **no volver a preguntarlas**

### 2.1 · `DELETE /comparables` desliga, no borra

`TX_Comparables` alimenta el histórico de mercado (campo `aporta_a_historico`). Un `DELETE` real
destruiría un dato que le sirve a **otras** tasaciones. La ruta vacía el Link `solicitud` y la
grilla del tasador deja de verlo, que es lo que RF-12 pide.

Además **relee el comparable antes de tocarlo** para verificar que pertenece a *esta* solicitud:
sin esa comprobación, un `comparableId` válido de otra solicitud pasaría el guard —que sólo mira
la solicitud de la URL— y desligaría un comparable ajeno.

### 2.2 · La categoría de foto va en `descripcion`, no en `tipo_adjunto`

`TX_Adjuntos.tipo_adjunto` tiene dominio cerrado (`foto_exterior · foto_interior · plano · cbr ·
escritura · cert_no_expropiacion · otro`), pero §2.6 permite al tasador **crear categorías
personalizadas en terreno**. Escribirlas en `tipo_adjunto` las crearía como opciones nuevas por
`typecast: true` y ensuciaría el dominio en silencio.

La categoría libre va en `descripcion` (texto) y `tipo_adjunto` queda en `foto_interior`.
El `GET` lee `descripcion || tipo_adjunto || 'otro'`.

### 2.3 · `TX_Adjuntos` **no tiene** campo `seccion`

El plan §2.6 afirma que *"el campo `TX_Adjuntos.seccion` se sigue escribiendo aunque la sección ya
aparezca en el path"*. **Ese campo no existe**: la tabla tiene 26 campos, verificados vía Meta API
el 17-ago-2026. → **P5-TAS** debe decidir si se crea (requiere aprobación explícita) o si la
sección se deriva del path de Dropbox. Anotado en el docblock de `/fotos`.

---

## 3 · A-18 — bloqueante escalado a Héctor y Óscar

**`GET /api/tasaciones/config/defaults` no se construye.** RF-TAS-08 exige precargar los factores
de homogeneización desde la capa de configuración y prohíbe hardcodearlos. Se leyeron las tres
tablas candidatas contra la base y **ninguna puede servir un valor hoy**:

| Tabla | Filas | Veredicto |
|---|---|---|
| `C_FactoresHomogeneizacion` `tblep24N9gPMrDPIN` | 15 | La correcta en estructura, pero **`valor_referencia` vacío en las 15**. 10 filas `FH-` son cáscaras; 5 filas `FH_` sólo traen rangos min/max |
| `C_Factores` `tblNHze3ZZYJblJ7S` | 27 | Poblada y sana, pero **es otra cosa**: coeficientes del motor de valoración (`Cap_Rate` 0.045 · `Remate` ×9 · `Seguro` · `Garantia`). **Cero filas de homogeneización** |
| `C_VariablesCliente` `tblgrY8j4ugFzS7v9` | 1 | `Vars_METLIFE_default` con `valor` vacío. **Es la que nombran la spec y el plan** |

Las cuatro preguntas de A-18: quién fija el valor por defecto de cada factor · `Edad` o
`Antiguedad` (el enum ofrece las dos, las filas usan `Antiguedad`, RF-TAS-08 pide `factor_edad`) ·
qué pasa con las 10 cáscaras `FH-` · si la canónica es `C_FactoresHomogeneizacion` o hay que
consolidar con `C_Factores`.

⚠ **No se puede rodear.** Una ruta contra la tabla actual devolvería `valorReferencia: null` y el
criterio de aceptación de RF-TAS-08 —*"un cambio se refleja sin deploy"*— sería inverificable
porque no hay dato que cambiar. Suplirlo con constantes es justo lo que el requisito prohíbe.

`C_Factores` **sí** es la fuente de los overrides de la sección G (cap rate, vida útil). Recordarlo
en **P7-TAS**.

---

## 4 · Estado de las fichas

| Ficha | Estado al pausar |
|---|---|
| **CI-011** (`A_Cambios` documentada mal) | **abierta**, con tres notas nuevas: `actor` ≠ `autor` (la ficha se equivocaba en el nombre) · los **14 FIELD_IDs** que daba por indocumentados, ya levantados y en `FIELD_IDS_CAMBIOS` · el dominio cerrado de `tabla_origen` |
| **CI-012** (`TX_CoordinacionVisita`) | **cerrada** por decisión de producto → **RO-29** |
| **CI-022** (tablas de factores sin documentar) | **cerrada** · parte documental ejecutada, decisión de negocio escalada a **A-18** |
| **A-18** (ninguna tabla sirve un factor) | **abierta · BLOQUEANTE** · dueños Héctor y Óscar |
| **RO-29** (`docs/aprendizajes.md`) | escrita · última regla operativa viva |

---

## 5 · Ajuste de contrato 🟡 vigente

Acordado para P2-TAS.A y P2-TAS.B. **No modifica RO-03 ni el contrato del plan en general.**

| Sin confirmación | Con confirmación previa |
|---|---|
| `pnpm tsc` · `pnpm build` · `pnpm test` | Cualquier `curl` |
| `ls`, `grep`, lectura local, ediciones de archivo | Cualquier cosa que toque Airtable, **incluida la Meta API de sólo lectura** |
| | Cualquier comando `git` |

El criterio es la frontera del repo: lo que no sale de él y no muta nada fuera, corre solo.

**`TASADOR_MOCK_RECORD_ID`** está definida en `.env.local` = `recSR3RxY6rsLb8k7` (María Eugenia
Soto). `mockTasadorConfigurado()` devuelve `true`. No hace falta volver a verificarlo.

**Schema completo de la base** cacheado en el scratchpad de la sesión de hoy
(`meta-schema.json`, 67 tablas, 244 KB). ⚠ **El scratchpad es por sesión: mañana no estará.** Si
hace falta el schema de una tabla nueva, se vuelve a bajar por Meta API — con confirmación.

---

## 6 · Instrucción para retomar

> 1. `git status` y `git branch --show-current` → confirmar `feat/tasador-ui`.
> 2. Verificar si Sergio commiteó lo de §7. Si sigue pendiente, **no commitear** — lo hace él.
> 3. Leer, en este orden: este archivo · `docs/_notas/snapshot-P2-TAS.md` (el permanente, §0 a
>    §3) · `docs/_md/plan_ejecucion_UItasador_v1.0.md` §3 · `CLAUDE.md`.
> 4. **Arrancar por `GET · PATCH /api/tasaciones/[id]/datos`.** Es la ruta grande: 68 campos de
>    `InformeData` sobre `TX_DatosTasacion` + 4 tablas hijas. Va primero porque es la que puede
>    obligar a revisar decisiones de mapeo.
> 5. Después `GET /api/tasaciones/[id]/informe`.
> 6. Después los **3** tests de vitest (el cuarto cayó con RO-29): guard 403 · 409 de `/calcular` ·
>    los 20 caracteres de `/rechazo`.
> 7. `pnpm tsc --noEmit && pnpm build && pnpm test` — sin confirmación, por §5.
> 8. Cerrar P2-TAS.A: completar §3 a §6 de `snapshot-P2-TAS.md`, generar
>    `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2-TAS.md`, y **borrar este archivo**.
> 9. Recién entonces P2-TAS.B (capa cliente · cierra el build verde de OV-7).
>
> ⚠ **Al escribir contra Airtable, el `v` de `OPCIONES` es el literal exacto del `singleSelect`.**
> Los dominios están sucios (duplicados por mayúsculas y acentos) y `typecast: true` crea la opción
> que no exista. No derivar valores: usar los de `lib/tasaciones.ts`.

---

## 7 · Estado de la rama (salidas literales)

### `git status`

```
On branch feat/tasador-ui
Your branch is up to date with 'origin/feat/tasador-ui'.

Changes not staged for commit:
	modified:   docs/CODE_INCONSISTENCIES.md
	modified:   docs/_sync_ifTasador_v1/gap/_ambiguedades.md
	modified:   docs/aprendizajes.md
	modified:   lib/tasaciones.ts
	modified:   lib/tasador/field-ids.ts

Untracked files:
	app/api/tasaciones/
	docs/_notas/snapshot-P2-TAS.md
	lib/tasador/auditoria.ts
	lib/tasador/auth-guard.ts
	lib/tasador/mensajes.ts
	lib/tasador/respuestas.ts
	lib/tasador/validators/
```

> ⚠ Capturado **antes** de escribir este archivo. Después aparece además
> `?? docs/_notas/snapshot-P2-TAS-A-en-curso.md`. Es el único cambio adicional esperado.

### `git branch --show-current`

```
feat/tasador-ui
```

### `git log --oneline -5`

```
00330f0 feat(tasador): P1-TAS · types TypeScript de IF-03
2a4ebcd wip(tasador): P0.5-TAS completa · snapshot + aprendizajes
a2934bf feat(tasador): P0-TAS completo · dedup + inventario
1cec282 wip(tasador): P0-TAS incompleto · sin snapshot
b70117a feat(tasador): traer diseño v0 IF-03 + plan de ejecución v1.0
```

**Commit pendiente · lo hace Sergio (R12), por GitHub Desktop.** Sugerencia de mensaje:

```
wip(tasador): P2-TAS.A · 9 de 11 rutas + capas compartidas

Capas: auth-guard (RF-09), auditoria (A_Cambios schema real),
mensajes (§6.1), respuestas, validators (Zod).

9 rutas: cola, [id], estado, calcular, rechazo, expediente,
lectura, comparables, fotos. Faltan /datos e /informe + 3 tests.

Cierra deudas de P1-TAS con schema real: los 9 FIELD_IDs pendientes,
los dominios de OPCIONES (casi todos estaban mal) y el homónimo
fuente vs tipo_referencia en TX_Comparables.

Docs: RO-29 (coordinación fuera del sistema), CI-012 y CI-022
cerradas, A-18 abierta como bloqueante de RF-TAS-08, CI-011 anotada.

Refs: P2-TAS.A · RO-29 · CI-011 · CI-012 · CI-022 · A-18 · RF-09 · RF-12
```

⚠ **El push dispara redeploy en Railway y el build sigue rojo** (42 errores · el verde está
diferido a P2-TAS.B por OV-7). Es lo esperado. IF-02 en `main` no se ve afectado.

---

## 8 · Estado del build al pausar

| | Valor |
|---|---|
| `pnpm tsc --noEmit` | 🔴 **42 errores** |
| Errores en lo escrito hoy | **0** — las 9 rutas y las 5 capas compilan limpias |
| Movimiento del día | 41 → 42. **El +1 es deliberado**: retirar `OPCIONES.tipoZona` rompe `seccion-propiedad.tsx:226` a propósito, porque el campo es un Link a `M_Zonificacion` y un select hardcodeado sería incorrecto de raíz. Lo arregla **P7-TAS** |
| `pnpm build` | 🔴 falla · `Module not found` de los 3 módulos de P2-TAS.B |

Los 42 son deuda ya inventariada: 13 del huérfano `coordinar-visita.tsx`, ~20 de los módulos y
funciones de P2-TAS.B, 5 de OV-10, 2 del `Select` de `@base-ui`, 1 del residuo CI-015, 1 el
`tipoZona` deliberado.
