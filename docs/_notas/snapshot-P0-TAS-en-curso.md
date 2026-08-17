# Snapshot · P0-TAS EN CURSO — cierre anticipado de sesión

> **Motivo del corte:** la sesión llegó al 91% de capacidad de contexto. No hay margen para
> completar P0-TAS. Este archivo existe para que **otra cuenta de Claude Code** retome sin
> re-derivar el diagnóstico.
>
> **Fecha del corte:** 2026-08-17
> **Rama:** `feat/tasador-ui`
> **Tanda:** P0-TAS · Inventario del repo Tasador + deduplicación de `components/tasador/ui/`
> **Plan maestro:** `docs/_md/plan_ejecucion_UItasador_v1.0.md` (2316 líneas, commiteado en `main`)
>
> ⚠ **Este snapshot NO es el archivo de aprendizajes de la tanda.** Es un estado intermedio. Se
> borra al cerrar P0-TAS (ver sección 6, paso 6).

---

## 1 · Dónde quedó P0-TAS

### Última tarea completada

**Tarea 0 (crear rama) — COMPLETADA.** Además se ejecutó el **preflight §0.1** completo y buena
parte del **diagnóstico de sólo lectura** de las Tareas 1, 2.1, 2.2 y 2.3. **Nada se escribió
todavía en disco salvo este snapshot.**

Estado tarea por tarea:

| Tarea | Estado | Nota |
|---|---|---|
| Preflight §0.1 | ✅ completado | Los 5 archivos existen y fueron leídos (ver más abajo). |
| Tarea 0 · rama | ✅ completado | `feat/tasador-ui` creada y activa. |
| Tarea 1 · inventario | ⏳ **datos recolectados, archivo NO escrito** | Todo el material está en la sección 3 de este snapshot. |
| Tarea 2.1 · diagnóstico | ✅ completado | Tabla de comparación archivo por archivo, en sección 3. |
| Tarea 2.2 · escaneo de imports | ✅ completado | Conteos y listados literales en sección 3. |
| Tarea 2.3 · compatibilidad de stack | ✅ completado | **Sin Radix en el repo.** Dedup viable. |
| Tarea 2.4 · plan de dedup escrito | ❌ pendiente | El contenido está resuelto; falta volcarlo al inventario. |
| Tarea 2.5 · ejecución de dedup | ❌ pendiente | **Nada borrado, nada movido, ningún import reescrito.** |
| Tarea 3 · cierre | ❌ pendiente | — |

### Archivos escritos en esta sesión

- `docs/_notas/snapshot-P0-TAS-en-curso.md` (**este archivo — el único**).

**No se escribió** `docs/_notas/inventario-tasador.md`. **No se modificó ningún archivo de código.**

### Comandos ejecutados

| Comando | Resultado |
|---|---|
| `git status` / `git branch --show-current` / `git log --oneline -5` | Ver sección 2. |
| `git checkout -b feat/tasador-ui` | ✅ `Switched to a new branch 'feat/tasador-ui'` |
| `find app/tasaciones -type f`, `find components/tasador -type f`, `ls components/ui/` | Árboles capturados en sección 3. |
| `grep -rn "@radix-ui" …` / `grep -rln "@base-ui" …` | Compatibilidad de stack. Sección 3. |
| `grep -rn "from ['\"]@/components/tasador/ui" …` (y variante `@/components/ui`) | 0 vs 37. Sección 3. |
| `diff -q` archivo por archivo entre `components/tasador/ui/` y `components/ui/` | Tabla 2.1. Sección 3. |
| Resolución de todos los imports `@/…` del territorio IF-03 | **28 imports rotos.** Sección 3. |
| `grep` de consumidores de los 4 módulos ausentes y de los 19 mal-prefijados | Listados literales en sección 3. |
| `git show b70117a --stat` | 47 archivos, 8329 inserciones. Sección 3. |
| `grep` de residuos CI-015 y de lenguaje de IA (Regla T-C) | Sección 3. |

**No se ejecutó `pnpm tsc --noEmit` ni `pnpm build`.** El estado rojo del build está demostrado
estáticamente (28 imports irresolubles), no medido. **La próxima sesión debería correrlos para
tener la línea base literal.**

### Qué se preguntó a Sergio y qué respondió

Se le plantearon 3 decisiones. **Rechazó el formato de pregunta y respondió con un alcance
corregido**, que es el que manda:

**Respuesta 1 · Rama:** crear `feat/tasador-ui`. ✅ ejecutado.

**Respuesta 2 · Alcance corregido de P0-TAS — `P0-TAS NO arregla el build`.** P0-TAS hace:

- **(a)** Inventario completo según §1.2 del plan.
- **(b)** Deduplicación de los **9 archivos idénticos** de `components/tasador/ui/` (borrar; no
  tienen consumidores).
- **(c)** Reescritura de los **19 imports mal-prefijados** (`@/components/X` →
  `@/components/tasador/X`).
- **(d)** **Mover** los 4 primitivos huérfanos (`card`, `collapsible`, `radio-group`, `switch`)
  desde `components/tasador/ui/` a `components/ui/`, para que sean shadcn base compartida
  (preserva R7).
- **(e)** **Conservar** los 4 "superset" (`alert`, `button`, `dialog`, `sheet`) bajo
  `components/tasador/ui/`, con nota en el inventario explicando la divergencia.
- **(f)** Documentar los 4 módulos faltantes (`use-estado-tasador`, `tasaciones`, `tasador-store`,
  `factores-default`) como deuda de P1-TAS/P2-TAS, con lista de consumidores y firma esperada de
  cada uno.

**Respuesta 3 · Criterio de aceptación revisado.** Reemplaza al del prompt original:

> En lugar de "`pnpm build` verde tras dedup", queda: **"`pnpm build` sigue igual de rojo que antes
> de P0-TAS, con la misma lista de imports irresolubles reducida sólo por los 19 mal-prefijados que
> P0-TAS sí arregla"**. El build verde queda comprometido para el cierre de **P2-TAS**.

**Respuesta 4 · Frontera R5 para el paso (d).** Sergio pidió confirmar **antes de ejecutar (d)**
que se trata de **agregar archivos nuevos** que IF-02 no tiene, y **no de modificar existentes**;
y que **si algún nombre colisiona** con un archivo ya presente en `components/ui/`, hay que
**parar y consultarle**.

→ **Verificación ya hecha en esta sesión (evidencia en sección 3, tabla 2.1): los 4 nombres NO
existen en `components/ui/`.** `components/ui/` tiene 22 archivos y ninguno se llama `card.tsx`,
`collapsible.tsx`, `radio-group.tsx` ni `switch.tsx`. **El paso (d) es alta pura, sin colisión y
sin modificación de archivos de IF-02.** La confirmación que Sergio pidió está satisfecha; queda
**re-verificarla con un `ls` en la próxima sesión** justo antes del `git mv`, por higiene.

**Respuesta 5 · Modo de trabajo:** proceder (a)→(f) **en ese orden**, y **preguntar antes de cada
comando destructivo** (borrado, `mv`).

---

## 2 · Estado de la rama (salidas literales)

### `git status`

```
On branch feat/tasador-ui
nothing to commit, working tree clean
```

> ⚠ Capturado **antes** de escribir este snapshot. Tras escribirlo, `git status` mostrará
> `?? docs/_notas/snapshot-P0-TAS-en-curso.md` como untracked. Ese es el único cambio esperado.

### `git branch --show-current`

```
feat/tasador-ui
```

### `git log --oneline -5`

```
b70117a feat(tasador): traer diseño v0 IF-03 + plan de ejecución v1.0
c20f6ad docs(costs): añade fuentes simulación API (cierra refs entrada 12-ago)
5e94f2c chore: elimina transcripción sla del negocio.txt
efe1488 docs(sync): completa shas del lote 7 en SYNC_LOG (7727c20)
7727c20 docs(cu-002): sync IF-Tasador v1.9.9 · RF-TAS-11..22 + bump de referencias
```

### `git diff --stat main`

```
(vacío)
```

`feat/tasador-ui` está exactamente en `b70117a`, igual que `main`. **Cero divergencia de código.**

---

## 3 · Hallazgos del inventario hasta acá

> Este es el material que debe volcarse a `docs/_notas/inventario-tasador.md`. Está completo para
> las secciones 1, 3, 4, 5, 6 y 7 del inventario; falta redactar la sección 2 (mapa componente →
> tanda) y la de overrides, que requieren criterio, no más `grep`.

### 3.0 · Preflight — los 5 archivos existen

| Archivo | Líneas |
|---|---|
| `docs/_md/plan_ejecucion_UItasador_v1.0.md` | 2316 |
| `docs/_notas/inventario-if02.md` | 274 |
| `docs/aprendizajes.md` | 1265 |
| `docs/schema-airtable.md` | 1235 |
| `CLAUDE.md` | 609 |

`tsconfig.json` · `paths`: `"@/*": ["./*"]` — alias único, sin mapeos especiales. Esto es lo que
hace que los imports planos del v0 no resuelvan.

### 3.1 · Bifurcación Caso A / Caso B del plan §1.1 → **CASO A**

El código v0 del Tasador **SÍ está** en el repo, traído por el commit `b70117a`
(*"feat(tasador): traer diseño v0 IF-03 + plan de ejecución v1.0"*, 47 archivos, 8329
inserciones). Esto **refuta el hallazgo previo** que el plan v1.0 registró el 17-ago-2026 (que
`app/tasaciones/**` y `components/tasador/**` no existían) y **cierra el Riesgo #1 de §17 del
plan**. Override a registrar en el inventario.

**Lo que el commit trajo:** las 7 rutas, 22 componentes y 17 primitivos.
**Lo que el commit NO trajo:** la capa de datos (`hooks/`, `lib/tasaciones.ts`,
`lib/tasador-store.ts`, `lib/factores-default.ts`). Ver 3.6.

### 3.2 · Árbol real de IF-03

`app/tasaciones/**` — **7 rutas, exactamente las 7 de §2.13 del spec** (CI-020 respetado: la raíz
`[id]/` es el formulario, no un detalle; no existen `[id]/captura/` ni `[id]/calculo/`):

```
app/tasaciones/page.tsx                      → Pantalla 1 · cola
app/tasaciones/[id]/page.tsx                 → Pantalla 5 · formulario
app/tasaciones/[id]/coordinar/page.tsx       → Pantalla 2 · coordinación
app/tasaciones/[id]/fotos/page.tsx           → Pantalla 3 · fotos
app/tasaciones/[id]/lectura/page.tsx         → Pantalla 4 · lectura
app/tasaciones/[id]/estado/page.tsx          → Pantalla 6 · cálculo
app/tasaciones/[id]/informe/page.tsx         → Pantalla 7 · preview
```

`components/tasador/**` — 15 componentes de primer nivel + 7 en `form-sections/` + 17 en `ui/`:

```
app-header · campo-prellenado · coordinar-visita · estado-badge · estado-procesando
expediente-sheet · foto-categoria-creator · fotos-categorizadas · fotos-screen
informe-preview · intentos-indicator · sheet-documentos · tasacion-card · tasacion-form
vproperty-logo
form-sections/: fields · seccion-comparables · seccion-documentos · seccion-edificacion
                seccion-overrides · seccion-propiedad · seccion-valoracion
```

`lib/tasador/` — **no existe.** `app/api/tasaciones/` — **no existe.** (Esperado: son P1-TAS y
P2-TAS.)

### 3.3 · Compatibilidad de stack UI → **COMPATIBLE, dedup viable (Tarea 2.3 ✅)**

- `grep -rn "@radix-ui"` sobre `components/tasador/` → **0 resultados**.
- `grep -n '"@radix-ui'` sobre `package.json` → **0 resultados**. **No hay Radix en el repo.**
- `components/tasador/ui/` → 13 de 17 archivos importan de `@base-ui/react`; los 4 restantes
  (`alert`, `card`, `label`, `textarea`) son puramente presentacionales y sólo usan `cn` de
  `@/lib/utils`.
- `components/ui/` (IF-02) → `@base-ui/react/{dialog,tooltip,tabs,separator,select,scroll-area,
  progress,popover,menu,input,checkbox,button,avatar,alert-dialog,use-render,merge-props}`.
- `package.json`: `"@base-ui/react": "^1.5.0"`, `class-variance-authority`, `clsx`,
  `tailwind-merge`, `lucide-react`. Helper `cn` compartido en `@/lib/utils`.

**Ambos lados sobre el mismo shadcn v4 / `@base-ui/react`. No hace falta migración.** §2.3 pasa.

### 3.4 · Tabla 2.1 — comparación `components/tasador/ui/` vs `components/ui/`

`components/ui/` (IF-02) tiene 22 archivos: `alert-dialog, alert, avatar, badge, button, checkbox,
command, dialog, dropdown-menu, input-group, input, label, popover, progress, scroll-area, select,
separator, sheet, sonner, tabs, textarea, tooltip`.

| archivo (tasador/ui) | en components/ui/ | bytes T | bytes IF-02 | equivalencia | acción (decisión de Sergio) |
|---|---|---|---|---|---|
| `badge.tsx` | sí | 1925 | 1925 | **IDÉNTICO** | **(b) borrar** |
| `input.tsx` | sí | 1040 | 1040 | **IDÉNTICO** | **(b) borrar** |
| `label.tsx` | sí | 518 | 518 | **IDÉNTICO** | **(b) borrar** |
| `progress.tsx` | sí | 1740 | 1740 | **IDÉNTICO** | **(b) borrar** |
| `select.tsx` | sí | 6655 | 6655 | **IDÉNTICO** | **(b) borrar** |
| `separator.tsx` | sí | 545 | 545 | **IDÉNTICO** | **(b) borrar** |
| `tabs.tsx` | sí | 3497 | 3497 | **IDÉNTICO** | **(b) borrar** |
| `textarea.tsx` | sí | 842 | 842 | **IDÉNTICO** | **(b) borrar** |
| `tooltip.tsx` | sí | 2846 | 2846 | **IDÉNTICO** | **(b) borrar** |
| `alert.tsx` | sí | 2048 | 2528 | divergente (8 líneas) · **IF-02 es superset** | **(e) conservar + nota** |
| `button.tsx` | sí | 3198 | 3240 | divergente (42 líneas) · **IF-02 es superset** | **(e) conservar + nota** |
| `dialog.tsx` | sí | 1904 | 4075 | divergente (177 líneas) · **IF-02 es superset** | **(e) conservar + nota** |
| `sheet.tsx` | sí | 2950 | 4433 | divergente (108 líneas) · **IF-02 es superset** | **(e) conservar + nota** |
| `card.tsx` | **NO** | 2630 | — | sólo en Tasador · `cn` de `@/lib/utils` | **(d) mover a components/ui/** |
| `collapsible.tsx` | **NO** | 658 | — | sólo en Tasador · `@base-ui/react/collapsible` | **(d) mover a components/ui/** |
| `radio-group.tsx` | **NO** | 1653 | — | sólo en Tasador · `@base-ui/react/{radio,radio-group}` | **(d) mover a components/ui/** |
| `switch.tsx` | **NO** | 1707 | — | sólo en Tasador · `@base-ui/react/switch` | **(d) mover a components/ui/** |

**Total a borrar (b):** 9 archivos ≈ **19,6 KB**.
**Total a mover (d):** 4 archivos ≈ **6,6 KB**.
**Total a conservar (e):** 4 archivos ≈ **10,1 KB**.

⚠ **Nota de riesgo para el inventario (paso (e)).** Los 4 "superset" conservados tienen **cero
consumidores** y son versiones **más pobres** que las de IF-02. Quedan como código muerto que un
futuro import por descuido podría resucitar, reintroduciendo la divergencia que esta tanda vino a
eliminar. Se conservan por decisión explícita de Sergio; la nota del inventario debe decir esto,
no sólo "divergen".

### 3.5 · Tarea 2.2 — escaneo de imports (literal)

```
grep -rn "from ['\"]@/components/tasador/ui" app/tasaciones components/tasador | wc -l   →  0
grep -rn "from ['\"]@/components/ui"        app/tasaciones components/tasador | wc -l   → 37
```

**`components/tasador/ui/` tiene CERO consumidores.** Los 37 imports apuntan a `@/components/ui/*`
(estilo plano del v0). De esos 37: **33 resuelven** contra `components/ui/` de IF-02 y **4 no**
(`card`, `collapsible`, `radio-group`, `switch`), que es precisamente lo que el paso (d) arregla.

Módulos de `@/components/ui/*` pedidos por el Tasador, con frecuencia:

```
10 button · 6 label · 4 textarea · 3 input · 2 tooltip · 2 sheet · 2 select · 2 progress
 1 tabs · 1 switch* · 1 radio-group* · 1 dialog · 1 collapsible* · 1 card*      (* = no existe hoy)
```

### 3.6 · Los 28 imports irresolubles — línea base del build rojo

| Grupo | N | Lo arregla |
|---|---|---|
| **A** · `@/components/X` → el archivo vive en `components/tasador/X` | **19** | paso **(c)** |
| **B** · `@/components/ui/{card,collapsible,radio-group,switch}` | **4** | paso **(d)** |
| **C** · módulos que **no existen en ninguna parte del repo** | **4** | ❌ **NO lo arregla P0-TAS** → deuda P1-TAS/P2-TAS |

**Tras P0-TAS el build debe pasar de 28 a 4 imports irresolubles, todos del grupo C.** Ése es el
criterio de aceptación revisado.

#### Grupo A — los 19 mal-prefijados (paso (c)), con archivo:línea literal

```
app/tasaciones/page.tsx:6                        @/components/app-header
app/tasaciones/page.tsx:7                        @/components/tasacion-card
app/tasaciones/[id]/page.tsx:4                   @/components/tasacion-form
app/tasaciones/[id]/coordinar/page.tsx:3         @/components/coordinar-visita
app/tasaciones/[id]/estado/page.tsx:3            @/components/estado-procesando
app/tasaciones/[id]/fotos/page.tsx:3             @/components/fotos-screen
app/tasaciones/[id]/informe/page.tsx:3           @/components/informe-preview
app/tasaciones/[id]/lectura/page.tsx:3           @/components/estado-procesando
components/tasador/app-header.tsx:1              @/components/vproperty-logo
components/tasador/fotos-categorizadas.tsx:13    @/components/foto-categoria-creator
components/tasador/informe-preview.tsx:24        @/components/form-sections/seccion-propiedad
components/tasador/informe-preview.tsx:25        @/components/form-sections/seccion-comparables
components/tasador/informe-preview.tsx:26        @/components/expediente-sheet
components/tasador/fotos-screen.tsx:22           @/components/fotos-categorizadas
components/tasador/fotos-screen.tsx:23           @/components/sheet-documentos
components/tasador/tasacion-form.tsx:27          @/components/intentos-indicator      ⚠ ver CI-015
components/tasador/tasacion-form.tsx:28          @/components/form-sections/fields
components/tasador/tasacion-form.tsx:29          @/components/form-sections/seccion-propiedad
components/tasador/tasacion-form.tsx:30          @/components/form-sections/seccion-valoracion
components/tasador/tasacion-form.tsx:34          @/components/form-sections/seccion-comparables
components/tasador/tasacion-form.tsx:35          @/components/form-sections/seccion-edificacion
components/tasador/tasacion-form.tsx:36          @/components/form-sections/seccion-documentos
components/tasador/tasacion-form.tsx:41          @/components/form-sections/seccion-overrides
```

Son **23 líneas** sobre **19 rutas de módulo distintas** (`estado-procesando`,
`seccion-propiedad` y `seccion-comparables` se importan dos veces cada uno). La reescritura es
mecánica: insertar `tasador/` tras `@/components/`.

⚠ **`tasacion-form.tsx:27` no debe reescribirse: debe eliminarse** junto con el componente, por
CI-015 (ver 3.8). Reescribirlo sería consolidar un residuo que el plan manda purgar.

#### Grupo C — los 4 módulos ausentes (paso (f)), con consumidores y firma esperada

**1 · `@/hooks/use-estado-tasador`** — 4 consumidores:
```
components/tasador/estado-procesando.tsx:9    useEstadoTasador
components/tasador/informe-preview.tsx:23     useEstadoTasador
components/tasador/tasacion-form.tsx:17       useEstadoTasador
components/tasador/intentos-indicator.tsx:2   MAX_INTENTOS      ⚠ CI-015 — se elimina, no se crea
```
**Firma esperada:** `useEstadoTasador()` → hook de polling sobre el estado backend
(`BORRADOR | EN_CALCULO | INFORME_DISPONIBLE`), que gobierna el bloqueo de "Calcular Tasación"
(RF-TAS-07). §2.13 del spec: *"se elimina la coletilla «y el control de 3 intentos»"*.
**`MAX_INTENTOS` NO debe recrearse** (CI-015 · decisión capital 1 de §2). Destino: **P2-TAS**
(depende de `GET /api/tasaciones/[id]/estado`).

**2 · `@/lib/tasaciones`** — **el módulo más demandado: 27 líneas de import en 18 archivos.**
Exports requeridos: `TASACIONES`, `getTasacion`, tipos `Tasacion`, `InformeData`, `Comparable`,
`ItemValoracion`, `EstadoColor`, `SlaStatus`, `FuenteDato`, constantes `OPCIONES`,
`RECINTOS_SUGERIDOS`, y la mutación `marcarVisitada`.
Consumidores (literal):
```
app/tasaciones/page.tsx:8                                 TASACIONES, type Tasacion
app/tasaciones/[id]/page.tsx:3                            getTasacion
app/tasaciones/[id]/coordinar/page.tsx:2                  getTasacion
app/tasaciones/[id]/estado/page.tsx:2                     getTasacion
app/tasaciones/[id]/fotos/page.tsx:2                      getTasacion
app/tasaciones/[id]/informe/page.tsx:2                    getTasacion
app/tasaciones/[id]/lectura/page.tsx:2                    getTasacion
components/tasador/estado-badge.tsx:2                     type EstadoColor
components/tasador/coordinar-visita.tsx:25                (destructurado)
components/tasador/campo-prellenado.tsx:3                 type FuenteDato
components/tasador/expediente-sheet.tsx:10                (destructurado)
components/tasador/fotos-categorizadas.tsx:11             (destructurado)
components/tasador/informe-preview.tsx:21                 (destructurado)
components/tasador/fotos-screen.tsx:14                    (destructurado)
components/tasador/tasacion-form.tsx:16                   type Tasacion, type InformeData, marcarVisitada
components/tasador/tasacion-card.tsx:6                    type Tasacion, type SlaStatus
components/tasador/form-sections/seccion-documentos.tsx:4,5   type InformeData · OPCIONES
components/tasador/form-sections/seccion-comparables.tsx:6    type InformeData, type Comparable
components/tasador/form-sections/seccion-overrides.tsx:5      type InformeData
components/tasador/form-sections/seccion-edificacion.tsx:11,12 (destructurado) · OPCIONES, RECINTOS_SUGERIDOS
components/tasador/form-sections/seccion-valoracion.tsx:4,5   type InformeData, type ItemValoracion · OPCIONES
components/tasador/form-sections/seccion-propiedad.tsx:3,4    type InformeData · OPCIONES
```
**Destino: P1-TAS** (los tipos) **+ P2-TAS** (los datos: `TASACIONES` y `getTasacion` son mocks del
v0 que deben pasar a leer del Route Handler). ⚠ **Conflicto de nombres a resolver en P1-TAS:** el
plan §2.1 sitúa los tipos en `lib/tasador/types.ts`, no en `lib/tasaciones.ts`. Hay que decidir si
se crea `lib/tasaciones.ts` como re-export de `lib/tasador/types.ts` o si se reescriben los 27
imports. **Recomendación: reescribir los imports en P1-TAS** — dos rutas para lo mismo es la
divergencia que esta tanda está eliminando en `ui/`.

**3 · `@/lib/tasador-store`** — 3 consumidores:
```
components/tasador/informe-preview.tsx:22     readPayload
components/tasador/fotos-screen.tsx:15        readPayload, writePayload
components/tasador/tasacion-form.tsx:18       readPayload, writePayload
```
**Firma esperada:** persistencia del borrador del formulario. Es el **autosave de §2.8** — la
**única excepción autorizada** al veto de `localStorage` (§0.2 del plan). Destino: **P7-TAS**, pero
debe existir antes para que compile; **crearlo en P1-TAS** con la implementación mínima.

**4 · `@/lib/factores-default`** — 1 consumidor:
```
components/tasador/form-sections/seccion-comparables.tsx:7   nuevoComparable, ufHomogeneizada
```
**Firma esperada:** factores de homogeneización (`factor_sup`, `factor_edad`, `factor_distancia`) y
el cálculo de UF homogeneizada. ⚠ **RF-TAS-08 prohíbe hardcodear defaults en el frontend**: este
módulo **no puede contener valores literales**; debe consumirlos de
`GET /api/tasaciones/config/defaults`. Destino: **P2-TAS** (la ruta) + **P7-TAS** (el consumo).
El nombre `factores-default` sugiere justamente lo que RF-TAS-08 prohíbe — **revisar al crearlo**.

### 3.7 · Excepción R5-E → **REFUTADA** (con evidencia)

El plan §0.2-bis declaró que el visor "Ver expediente" de RF-TAS-10 no era importable sin editar
IF-02, porque vivía como funciones privadas dentro de `components/console/solicitud-detail.tsx`.
**El v0 trajo su propia implementación**, así que la excepción no se activa:

```
components/tasador/expediente-sheet.tsx   242 líneas
  :36   export function ExpedienteSheet({
  :94   <SheetTitle>{`Expediente · ${tasacion.codigo}`}</SheetTitle>
  :96   {totalArchivos} archivos · solo lectura
  :207  /** Fila de archivo con icono PDF, nombre y botón Descargar (abre Dropbox…) */
  :238  Descargar
  :11   import { tipoDocumentoLabel } from "@/lib/tipos-documento"   ← ya reutiliza lib de IF-02
```

Cumple los cuatro requisitos literales de RF-TAS-10: título `"Expediente · VP-AAAA-NNNN"`,
declaración del número de archivos y de la condición de sólo lectura, listado con descarga desde
Dropbox, y **sin acciones de alta/reemplazo/baja**. Es sheet, no ruta.

→ **`components/console/**` NO necesita tocarse por RF-TAS-10.** R5-E queda cerrada como refutada.
**Consecuencia para el plan:** §0.2-bis y §10.1 (procedimiento R5-E de P9-TAS) quedan
desactualizados; anotarlo en el inventario y en "Archivos afectados". **Pendiente menor de P9-TAS:**
verificar que `expediente-sheet.tsx` no ofrezca ninguna acción de escritura (leer las 242 líneas
completas — en esta sesión sólo se leyeron los `grep` de encabezado).

### 3.8 · CI-015 → **CONFIRMADA**, con dos residuos exactos

**Residuo 1 · contador de intentos:**
```
components/tasador/intentos-indicator.tsx        (34 líneas — el componente entero)
  :2   import { MAX_INTENTOS } from "@/hooks/use-estado-tasador"
  :5   export function IntentosIndicator({ intentos }: { intentos: number })
  :10  Array.from({ length: MAX_INTENTOS })
  :30  {intentos} de {MAX_INTENTOS} usados
components/tasador/tasacion-form.tsx
  :27  import { IntentosIndicator } from "@/components/intentos-indicator"
  :192 <IntentosIndicator intentos={intentosEnvio} />
```
**Acción (P7-TAS):** borrar `intentos-indicator.tsx`, la línea 27 y la 192 de `tasacion-form.tsx`,
y no recrear `MAX_INTENTOS`. También revisar `intentosEnvio` y `bloqueadoCalculo`
(`tasacion-form.tsx:57,159,400,417`): `bloqueadoCalculo` **sí** es legítimo (RF-TAS-07),
`intentosEnvio` **no**.

**Residuo 2 · lenguaje de IA (viola Regla T-C · R8):**
```
components/tasador/form-sections/seccion-documentos.tsx:20
  <span>Prellenado por IA cuando los PDFs estén adjuntos (SC07). Editable.</span>
```
**Acción:** reemplazar por texto sin medio técnico. Es la **única** ocurrencia en todo el
territorio IF-03 — el `grep` de `\bIA\b|\bAI\b|Claude|OCR|inteligencia artificial` no encontró
nada más.

### 3.9 · Componentes de IF-02 importables (catálogo §0.2-bis verificado)

| Componente | Ruta real | Línea de export | Estado |
|---|---|---|---|
| `FileUploadZone` | `components/console/file-upload-zone.tsx` | 143 | ✅ verificado |
| `SLABadge` | `components/console/status-badges.tsx` | 59 | ✅ verificado |
| `StateBadge` | `components/console/status-badges.tsx` | 19 | ✅ verificado · ⚠ el spec §2.13 lo llama `EstadoBadge`; **manda el repo** |
| `PriorityChip` | `components/console/status-badges.tsx` | 116 | ✅ verificado |
| `DocumentosAdjuntosSheet` | `components/console/documentos-adjuntos-sheet.tsx` | 84 (props en 72) | ✅ verificado |
| Motor SLA por etapa (RF-53) | `lib/sla-etapas.ts` | `etapaVigente`, `umbralesDeEtapa`, `recalcularSla`, `obtenerMatrizEtapas`, `C_SLA_ETAPAS = tbl05zu5RLhH3u6pl` | ✅ verificado |
| Cliente Airtable REST | `lib/airtable-client.ts` | `getRecord`, `updateRecord`, `AirtableError`, `isValidRecordId` | ✅ verificado · falta `createRecord`/`listRecords` → P2-TAS |
| Historial / cronología | `lib/historial.ts`, `lib/historial-airtable.ts`, `lib/use-historial-solicitud.ts`, `lib/sla-cronologia.ts`, `lib/use-cronologia-sla.ts` | — | ✅ existen |
| `tipoDocumentoLabel` | `lib/tipos-documento.ts` | — | ✅ **ya lo usa** `expediente-sheet.tsx:11` |

⚠ **El Tasador tiene sus propios `estado-badge.tsx` y `tasacion-card.tsx`.** `estado-badge.tsx`
(41 líneas) duplica conceptualmente a `StateBadge` de IF-02. **No se resolvió en esta sesión** si
se reemplaza por el de IF-02 o se conserva: es decisión de **P3-TAS** y debe quedar como override
abierto en el inventario. Nota: CI-018 dice que la card del tasador lleva badge **de SLA**, no de
estado, así que `estado-badge.tsx` podría no tener lugar en la Pantalla 1.

### 3.10 · Overrides al plan detectados hasta ahora

| # | Override |
|---|---|
| **OV-1** | **Caso A, no Caso B.** El v0 está en el repo (`b70117a`). El plan §1.1 y §17·Riesgo 1 asumían lo contrario. P3-TAS→P9-TAS **extienden in-place**, no construyen desde cero. |
| **OV-2** | **`EstadoBadge` no existe; el repo exporta `StateBadge`** (`status-badges.tsx:19`). Manda el repo, sin alias. |
| **OV-3** | **R5-E refutada.** `components/tasador/expediente-sheet.tsx` cumple RF-TAS-10 sin tocar IF-02. §0.2-bis y §10.1 del plan quedan desactualizados. |
| **OV-4** | **El plan sitúa los tipos en `lib/tasador/types.ts`; el v0 los importa de `@/lib/tasaciones`.** P1-TAS debe reescribir 27 imports o crear un re-export. Recomendado: reescribir. |
| **OV-5** | **`components/ui/` recibe 4 archivos nuevos** (paso (d)). R5 tal como está redactado en §0.2 limita la escritura de IF-03 a 4 directorios y **no incluye `components/ui/`**. Sergio autorizó explícitamente esta alta. **El texto de R5 en el plan debería anotarlo** — es alta pura, sin modificación de archivos de IF-02. |
| **OV-6** | **`lib/factores-default` tiene un nombre que sugiere lo que RF-TAS-08 prohíbe.** Revisar al crearlo (P2-TAS/P7-TAS): los defaults vienen del API, no del módulo. |
| **OV-7** | **El build de `main` está rojo.** §0.7 paso 7 del plan exige build verde antes de arrancar una tanda; aquí no se cumple y la causa es territorio IF-03 (§14.4 → lo arregla IF-03). El criterio revisado de Sergio difiere el verde a **P2-TAS**. |

---

## 4 · Qué falta hacer para cerrar P0-TAS

Numerado, con la tarea del prompt original al lado. **El orden (a)→(f) que fijó Sergio manda sobre
el orden del prompt.**

1. **Falta Tarea 1 · paso (a)** — escribir `docs/_notas/inventario-tasador.md` con las 7 secciones
   de §1.1 del plan. **Casi todo el material está en la sección 3 de este snapshot**; falta
   redactar la sección 2 del inventario (mapa componente → tanda) y consolidar la de overrides
   (base en 3.10) y la lista negra de R5 (base en §0.2-bis del plan + 3.9).
2. **Falta Tarea 2.4** — volcar al inventario la sección "Plan de deduplicación" con la tabla de
   3.4, los conteos de 3.5 y el total de KB liberados.
3. **Falta Tarea 2.5 · paso (b)** — **borrar los 9 idénticos** de `components/tasador/ui/`:
   `badge, input, label, progress, select, separator, tabs, textarea, tooltip`. ⚠ **Comando
   destructivo: preguntar antes.**
4. **Falta Tarea 2.5 · paso (c)** — reescribir los **19 imports mal-prefijados** (23 líneas) de la
   tabla de 3.6·A, insertando `tasador/` tras `@/components/`. ⚠ **Excepción: `tasacion-form.tsx:27`
   NO se reescribe** (CI-015; se elimina en P7-TAS, o aquí si Sergio lo autoriza — **preguntar**).
5. **Falta Tarea 2.5 · paso (d)** — `git mv` de `card.tsx`, `collapsible.tsx`, `radio-group.tsx`,
   `switch.tsx` desde `components/tasador/ui/` a `components/ui/`. ⚠ **Comando destructivo:
   preguntar antes.** ⚠ **Re-verificar con `ls components/ui/` que los 4 nombres siguen sin existir**
   (ya verificado en esta sesión: no colisionan). Estos 4 imports **no** se reescriben: ya apuntan a
   `@/components/ui/*` y el movimiento los hace resolver.
6. **Falta Tarea 2.5 · paso (e)** — conservar `alert, button, dialog, sheet` bajo
   `components/tasador/ui/` y escribir la nota de divergencia en el inventario, **incluyendo la
   advertencia de código muerto de 3.4**.
7. **Falta Tarea 2.5 · paso (f)** — escribir en el inventario la sección de deuda con los 4 módulos
   ausentes, sus consumidores y su firma esperada. **El contenido está listo en 3.6·C**; sólo hay
   que volcarlo.
8. **Falta la línea base del build** — correr `pnpm tsc --noEmit` (y `pnpm build`) **antes** de
   tocar nada, para tener la lista literal de errores; y **de nuevo al final**, para demostrar que
   pasó de 28 a 4 imports irresolubles. ⚠ **Comando de terminal: preguntar antes** (contrato 🟡).
9. **Falta Tarea 3** — generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0-TAS.md` con timestamp
   real, según la plantilla de §14.2 del plan, **incluidos los dos bloques obligatorios**
   (ambigüedades declaradas · verificación de la frontera R5).
10. **Falta Tarea 3 · verificación R5** — `git diff --stat main -- components/console app/api/solicitudes "app/(ejecutiva)"`
    debe devolver **vacío**. ⚠ **Ojo:** el paso (d) toca `components/ui/`, que **no** está en esa
    lista de rutas; el comando dará vacío igualmente. **La verificación honesta debe incluir
    `components/ui/` y declarar los 4 archivos nuevos como alta autorizada (OV-5).**
11. **Falta borrar este snapshot** — ver sección 6, paso 6.

---

## 5 · Contenido pendiente para el inventario

**`docs/_notas/inventario-tasador.md` NO se empezó.** No existe en disco. No hay borrador parcial
que recuperar ni preservar.

Todo el material recolectado para él está en la **sección 3 de este snapshot**, ya estructurado
por secciones del inventario:

| Sección del inventario (§1.1 del plan) | Material listo en este snapshot |
|---|---|
| 1 · Árbol real | 3.2 (+ bifurcación Caso A en 3.1) |
| 2 · Mapa componente → tanda | ⚠ **falta redactar** — requiere criterio, no `grep` |
| 3 · Rutas API existentes | 3.2 → `app/api/tasaciones/` **AUSENTE**; set a crear en P2-TAS |
| 4 · Types existentes | 3.6·C·2 → todos los tipos viven en el ausente `@/lib/tasaciones` |
| 5 · Catálogo de reuso verificado | 3.9 (completo, con línea de export) |
| 6 · Frontera R5 · lista negra | ⚠ **falta consolidar** — base en §0.2-bis del plan + 3.9 + OV-5 |
| 7 · Overrides al plan | 3.10 (7 overrides; falta cubrir P0.5-TAS→P12-TAS una por una) |
| + · Plan de deduplicación (Tarea 2.4) | 3.3, 3.4, 3.5 (completo) |
| + · Deuda de módulos ausentes (paso (f)) | 3.6·C (completo) |
| + · Riesgos | 3.6 (build rojo), 3.4 (código muerto de (e)), 3.7 (R5-E), 3.8 (CI-015) |

---

## 6 · Instrucción literal para la próxima sesión

> **Próxima sesión (otra cuenta de Claude Code):**
> 1. `cd` al repo `if-ejecutiva`.
> 2. `git status` y `git branch --show-current` para confirmar que estás en `feat/tasador-ui` con los cambios del snapshot presentes.
> 3. Leer `docs/_md/plan_ejecucion_UItasador_v1.0.md` completo.
> 4. Leer `docs/_notas/snapshot-P0-TAS-en-curso.md` completo (este archivo).
> 5. Retomar P0-TAS desde el punto marcado en la sección 4, siguiendo el prompt original que Sergio pegará.
> 6. Al terminar P0-TAS, **borrar este snapshot** (`git rm docs/_notas/snapshot-P0-TAS-en-curso.md`) y generar el `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0-TAS.md` definitivo que reemplaza al snapshot.
