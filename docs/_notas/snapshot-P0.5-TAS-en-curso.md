# Snapshot · pausa de sesión tras P0.5-TAS

> ## ⚠ LEER PRIMERO — P0.5-TAS **NO** quedó a medias
>
> **Pese al sufijo `-en-curso` del nombre, la tanda P0.5-TAS está COMPLETA.** Este archivo es un
> **handoff de pausa de sesión**, no un estado intermedio de tanda.
>
> **Ojo con la detección de §0.7 · paso 6 del plan.** Esa regla dice: *«Si existe
> `snapshot-P{n}-TAS.md` pero **no** existe el archivo de aprendizajes correspondiente, esa tanda
> quedó a medias → retomar P{n}-TAS»*. Acá **existen los dos**:
>
> - `docs/_notas/snapshot-P0.5-TAS.md` ✅ (snapshot de cierre)
> - `docs/_archivo/aprendizajes-20260817-1838-P0.5-TAS.md` ✅ (aprendizajes de cierre)
>
> → **La condición de "a medias" NO se cumple. No re-ejecutar P0.5-TAS.**
> La secuencia oficial dice que la siguiente es **P1-TAS**, sujeto a la decisión pendiente de §3.1.
>
> **Fecha de la pausa:** 2026-08-17 18:45 (-04) · **Rama:** `feat/tasador-ui`
> **Este archivo se borra al retomar** (ver §4, paso 5).

---

## 1 · Dónde quedó · última decisión tomada

**Última decisión de Sergio, ya ejecutada:** *«Opción 1. Reutilizar `fecha_visita`. Procedé con el
POST de `observacion_rechazo_tasador`.»*

Ambas partes se ejecutaron y se verificaron:

1. **`fecha_real_visita` NO se creó.** Se reutiliza el campo preexistente `fecha_visita`
   (`fldpTBzjfbAw5FSYI`), que ya era la fecha real del dato en producción.
2. **`observacion_rechazo_tasador` SÍ se creó** — `fldAccib5yNYaOmJc`, `multilineText`, HTTP 200.
   Verificado por diff completo del schema: `TX_Solicitudes` 156 → 157 campos, **exactamente 1
   cambio**, sin daño colateral.

**Estado de las dos tandas corridas en esta sesión:**

| Tanda | Estado | Commit |
|---|---|---|
| **P0-TAS** · Inventario + dedup | ✅ completa | `a2934bf` (ya commiteada) |
| **P0.5-TAS** · Schema Airtable | ✅ completa | ❌ **sin commitear** — ver §2 |

**Escrituras en Airtable de esta sesión: 1 campo.** No hay nada a medio aplicar en la base. No se
encendió ninguna Automation. No se creó ninguna tabla.

---

## 2 · Estado de la rama (salidas literales)

### `git status`

```
On branch feat/tasador-ui
Your branch is up to date with 'origin/feat/tasador-ui'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   docs/schema-airtable.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	docs/_archivo/aprendizajes-20260817-1838-P0.5-TAS.md
	docs/_notas/snapshot-P0.5-TAS.md

no changes added to commit (use "git add" and/or "git commit -a")
```

> ⚠ Capturado **antes** de escribir este archivo. Tras escribirlo aparece además
> `?? docs/_notas/snapshot-P0.5-TAS-en-curso.md` como untracked. Ese es el único cambio adicional
> esperado.

### `git branch --show-current`

```
feat/tasador-ui
```

### `git log --oneline -5`

```
a2934bf feat(tasador): P0-TAS completo · dedup + inventario
1cec282 wip(tasador): P0-TAS incompleto · sin snapshot
b70117a feat(tasador): traer diseño v0 IF-03 + plan de ejecución v1.0
c20f6ad docs(costs): añade fuentes simulación API (cierra refs entrada 12-ago)
5e94f2c chore: elimina transcripción sla del negocio.txt
```

**Los 3 archivos pendientes son todos de `docs/`. Cero cambios en código** — criterio de aceptación
§1.5.3 cumplido y verificado.

---

## 3 · Qué falta hacer

### 3.1 · ⚠ BLOQUEANTE de producto — replanificación por el cierre de CI-012

**No es tarea de una tanda: es decisión de Sergio.** El cierre de CI-012 («la coordinación se hace
por teléfono, fuera del sistema») invalida bastante más que P0.5-TAS. Nada de esto se tocó.

| # | Qué queda desalineado | Decisión pendiente |
|---|---|---|
| 1 | **P4-TAS queda sin objeto** — era la tanda entera de coordinación | ¿Se elimina de la secuencia oficial de §0.7? |
| 2 | `components/tasador/coordinar-visita.tsx` (512 l.) y `app/tasaciones/[id]/coordinar/page.tsx` quedan huérfanos | ¿Se borran o quedan inertes? Borrarlos deja **6 rutas**, contra las **7** que declara CI-020 |
| 3 | **Regla T-A** colapsa de 3 variantes de botón a 1 ("Abrir tasación"); desaparece el «gate de coordinación» | Reescribir T-A en §0.3 del plan |
| 4 | **El chip "Por coordinar" desaparece** (P3-TAS). Con "Hoy" en stub por A-12, quedaría 1 solo chip usable, contra las 3 de CI-019 | ¿Qué chips lleva la Pantalla 1? |
| 5 | **RF-TAS-03, 04, 05, 12, 13** y **§2.12** de la spec | Retirar/reescribir en el próximo bump normativo |
| 6 | **A-17** (catálogo de motivos) | Se cierra por irrelevancia — confirmar |

**Por qué bloquea P1-TAS:** decide si se tipan o no las entidades de coordinación
(`CoordinacionVisita`, `estado_coordinacion`, `motivo`, `intento_numero`).
**Recomendación de P0.5-TAS: NO tiparlas** — no existen en la base y no existirán.

### 3.2 · Commit pendiente (lo hace Sergio · R12)

Los 3 archivos de §2. Sugerencia de mensaje:

```
feat(tasador): P0.5-TAS · schema IF-03 (1 campo) + delta §26

Crea TX_Solicitudes.observacion_rechazo_tasador (fldAccib5yNYaOmJc).
No se crea TX_CoordinacionVisita (CI-012 cerrado) ni fecha_real_visita
(ya existe como fecha_visita · fldpTBzjfbAw5FSYI).

Refs: P0.5-TAS · CI-012 · CI-021 · P-5 · RO-05
```

⚠ **El push dispara redeploy en Railway y el build sigue rojo** (102 errores, 4 módulos del grupo
C). Es lo esperado — el verde está diferido a P2-TAS por decisión previa. Si Railway tiene deploy
atado a esta rama, el despliegue va a fallar; IF-02 en `main` no se ve afectado.

### 3.3 · Deuda abierta que hereda la próxima tanda

- **OV-4** (inventario §10): decidir entre `lib/tasador/types.ts` y reescribir los 26 imports de
  `@/lib/tasaciones`. **Recomendación vigente: reescribir.**
- **OV-9**: `hooks/` no existe y R5 no lo autoriza → poner el hook en `lib/tasador/`.
- **`TX_Amenities` no existe.** La sección E consume un tipo `Comodidades` sin tabla destino.
  **P7-TAS debe resolver dónde persiste.** No se creó (requiere aprobación explícita).
- **P-5 abierto**: dominio femenino (`D_TipoDocumento.tipo_propiedad`) vs masculino
  (`TX_Solicitudes.tipo_propiedad_nuevo_usado`). Paliativo server-side en P5-TAS.
- **`C_Plantillas` vs `C_NotificacionesConfig`**: divergencia **sin resolver** — al caer las
  plantillas de coordinación, nada la forzó. Se reabre cuando alguna tanda necesite una plantilla.
- **Build rojo**: 102 errores. Se cierra en **P2-TAS**.

### 3.4 · Lo que NO falta (para que nadie lo rehaga)

- ❌ No re-ejecutar P0.5-TAS. Está completa, con snapshot y aprendizajes.
- ❌ No crear `TX_CoordinacionVisita`. CI-012 está cerrado en sentido negativo.
- ❌ No crear `fecha_real_visita`. Se reutiliza `fecha_visita` (`fldpTBzjfbAw5FSYI`).
- ❌ No crear `horas_restantes`. Retirado en v1.9.9 (CI-021).
- ❌ No re-crear `D_TipoDocumento.tipo_propiedad`. Ya existe.

---

## 4 · Instrucción para retomar

> **Próxima sesión:**
>
> 1. `cd` al repo `if-ejecutiva`. `git status` y `git branch --show-current` → confirmar
>    `feat/tasador-ui`.
> 2. **Verificar si Sergio ya commiteó** los 3 archivos de §2. Si siguen pendientes, no commitear
>    (R12) — sólo avisarle.
> 3. Leer, en este orden: `docs/_md/plan_ejecucion_UItasador_v1.0.md`,
>    `docs/_notas/inventario-tasador.md`, `docs/_notas/snapshot-P0.5-TAS.md` (el de cierre, **no**
>    éste), `docs/schema-airtable.md` **§26**, `docs/aprendizajes.md`, `CLAUDE.md`.
> 4. **Plantear a Sergio la decisión de §3.1 antes de arrancar P1-TAS.** Es la única cosa que
>    bloquea. Si él prefiere avanzar igual, arrancar P1-TAS **sin tipar coordinación**.
> 5. **Borrar este archivo** al retomar:
>    `git rm docs/_notas/snapshot-P0.5-TAS-en-curso.md`. No sustituye a
>    `docs/_notas/snapshot-P0.5-TAS.md`, que es el cierre permanente de la tanda y **se conserva**.
> 6. Siguiente tanda de la secuencia oficial: **P1-TAS · Types TypeScript** · modo `auto mode on` ·
>    contrato 🟢 libre.

---

## 5 · Referencias rápidas de esta sesión

| Dato | Valor |
|---|---|
| Campo creado | `TX_Solicitudes.observacion_rechazo_tasador` = `fldAccib5yNYaOmJc` |
| Fecha real de visita (reutilizada) | `TX_Solicitudes.fecha_visita` = `fldpTBzjfbAw5FSYI` |
| Fecha planificada de visita | `TX_Solicitudes.fecha_visita_programada` = `fldPUFd9YuQdkcrOI` |
| `TX_Solicitudes` | `tblaHTyMHYfmy7Fg6` · **157** campos |
| Base | `app9G7lLkIV3CpeLa` · **67** tablas |
| Vía de escritura | Airtable **Meta API REST** (`schema.bases:write` confirmado). **MCP no autenticado, no usado.** |
| Build | 🔴 102 errores · 34 líneas TS2307 · 4 módulos del grupo C |
