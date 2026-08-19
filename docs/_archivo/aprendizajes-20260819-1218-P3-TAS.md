# Aprendizajes P3-TAS — Pantalla 1 · Cola personal

- **Interfaz:** IF-03 · Tasador
- **Fecha:** 2026-08-19
- **Sub-tandas:** **P3-TAS.A** (contrato de datos) · **P3-TAS.B** (pantalla)
- **Modo Claude Code usado:** `accept edits on`
- **Contrato aplicado:** 🔴 pausa-total antes de escribir Airtable, tocar `package.json` o crear/borrar archivos fuera del plan · 🟡 `tsc`/`build`/`test`/lectura local sin confirmación
- **Build antes:** tsc ✅ 0 · test ✅ 325 · build ✅
- **Build después:** tsc ✅ 0 · test ✅ **375** · build ✅
- **Estado de la tanda:** **completada**
- **Commit asociado:** (Sergio lo agrega tras commit)

---

## Resumen ejecutivo

- **La Pantalla 1 pasó de maqueta cableada a pantalla con datos reales.** Los tres pendientes que
  P2-TAS.B dejó anotados están cerrados, y con ellos **CI-035**.
- **Tres defectos que el compilador no veía**, todos con consecuencia visible para el tasador: un
  semáforo verde inventado en toda la cartera, un teléfono vacío bajo el enlace `tel:` en el 100 %
  de la cola real, y una fecha de visita mostrada **un día antes** de la real.
- **50 tests nuevos** en tres archivos (325 → 375), sin tocar ninguno de los 325 anteriores.
- **Una ficha cerrada (CI-035), una nueva (CI-036), una regla nueva (RO-36).**
- **Seed de verificación sembrado en Airtable** con autorización explícita: 3 solicitudes + 4
  contactos, marcados `ejecutivo_solicitante = "SEED P3-TAS"`.

---

## Ambigüedades / inconsistencias declaradas en esta tanda

| Ficha | Qué | Estado |
|---|---|---|
| **CI-035** | El teléfono de la card sale de `TX_ContactosVisita`, no de `vendedor_telefono` | **cerrada** |
| **CI-036** | Las pantallas de IF-03 exigen sesión Clerk mientras su identidad es un mock | abierta · decisión de P11-TAS |
| **A-12** | Chip "Hoy" · sigue sin definir, se construyó como stub deshabilitado con tooltip | abierta · respetada |
| **CI-018 · CI-019** | Contenido de la card y tres chips · aplicadas tal como quedaron en la doc | aplicadas |
| **CI-027** | Parte documental (árbol de 6 rutas) · **no** se tocó en esta tanda | abierta |

---

## Decisiones técnicas

1. **El semáforo de la cola es el de IF-02, no uno propio.** Se retiró `SlaStatus`
   (`en_plazo · por_vencer · vencido · por_coordinar`) y se reexportó `SlaEtapaSolicitud`. No es
   preferencia estética: **nadie poblaba** `slaStatus` ni `horasRestantes`, así que el `??` de la
   card producía "En plazo · 0h" con la cartera entera en `sla_semaforo_etapa = "rojo"`. El tipo
   compartido obliga a que la píldora del tasador y la de la bandeja digan lo mismo del mismo dato.

2. **El chip "Por coordinar" se redefinió por etapa, no por reloj.** Su definición original —sin
   coordinación vigente y dentro de una ventana de 4 h— murió con RO-29. La vigente es `asignada`
   **con la etapa 2 abierta**, ordenada por `sla_etapa_vence_ts` ascendente. Dice lo mismo en el
   vocabulario que sí tiene respaldo, y **no reintroduce ningún umbral**: los catorce viven en
   `C_SLA_Etapas`.

3. **El filtrado salió del `.tsx`.** `lib/tasador/cola-filtros.ts` es puro y no importa nada de
   Airtable. Dos motivos: el repo no tiene `@testing-library` ni `jsdom` —y `CLAUDE.md` prohíbe
   agregarlos—, así que era la única forma de cubrir §4.2 paso 7; y es donde el candado contra los
   umbrales puede vivir como test.

4. **"Hoy" queda fuera del filtrado por tipo, no por convención.** `ChipActivo = Exclude<ChipCola,
   'hoy'>` y `filtrarCola` sólo acepta `ChipActivo`. Que el compilador lo impida es lo que evita
   que alguien le escriba una rama "provisional" — que es exactamente lo que había.

5. **Sin respaldo a `vendedor_telefono`.** Si no hay contacto usable, la card **omite la línea**.
   Mezclar dos orígenes en silencio esconde el hueco de datos en vez de mostrarlo.

6. **Se descarta el contacto marcado `telefono_erroneo`** y se cae al siguiente por prioridad. Es
   el estado que el campo existe para registrar; ponerlo bajo un `tel:` es mandar al tasador a una
   llamada perdida.

7. **El chip vive en el estado y en la URL, con el estado mandando.** El filtro se aplica sobre la
   lista ya en memoria —cambiar de chip es instantáneo y no recarga la ruta (§4.1)— y la URL se
   escribe después con `router.replace` (no `push`: el chip no es un paso de navegación). El chip
   por defecto no ensucia la URL.

8. **`AppHeader.userName` pasó a obligatorio sin default.** Traía `= "Roberto Pérez"` escrito a
   mano en la única parte de la pantalla que dice de quién es la sesión. Un default plausible es
   peor que ninguno: nadie lo nota hasta que alguien confía en él.

9. **La Regla T-A colapsó a un botón y no se tipó `AccionCard`.** Una unión discriminada de una
   sola variante no discrimina nada.

---

## Overrides aplicados (rutas reales vs plan)

- **OV-14 · árbol de componentes: 3 archivos, no los 4 de §4.1.** No existe `accion-card.tsx`; el
  botón único vive en la card. Causa: RO-29.
- **OV-15 · `SlaStatus` retirado en favor de `SlaEtapaSolicitud`** (R7 + CI-021). §4.1 describía un
  badge propio del tasador; el correcto es el de la consola.
- **OV-16 · los criterios de §4.3 sobre las tres variantes de botón y la "coordinación rechazada"
  quedan sin objeto.** Se documentan aquí por **RO-33**, igual que la cadena 15 → 11 rutas de
  P2-TAS.A. No es incumplimiento: es alcance recortado por una decisión de producto posterior.
- **OV-17 · `?tab=` → `?chip=`.** El `?tab=devueltas` del v0 referenciaba un estado deprecado
  (§0.4 nota 6).
- **La frontera .A/.B se movió.** Quitar `coordinacionVigente` del tipo rompe la card en el mismo
  commit, y dejar el árbol rojo entre sub-tandas no era opción porque Sergio commitea en el medio.
  La card, el colapso de T-A y el stub del chip entraron en **.A**; .B se quedó con la separación
  de `chips-cola.tsx`, la URL, el tooltip como componente, `loading.tsx` y la cabecera.
- **Un archivo de test más de los previstos:** `lib/tasador/lectura-tasacion.test.ts`. Declarado y
  aceptado por Sergio.

---

## Verificación de la frontera R5

`git status --porcelain` al cierre — **19 entradas, ninguna fuera del territorio de IF-03** salvo
la excepción autorizada y los dos documentos:

```
 M app/api/tasaciones/route.ts             ?? app/tasaciones/loading.tsx
 M app/tasaciones/page.tsx                 ?? components/tasador/chips-cola.tsx
 M components/tasador/app-header.tsx       ?? lib/tasador/cola-filtros.ts
 M components/tasador/cola-tasaciones.tsx  ?? lib/tasador/cola-filtros.test.ts
 M components/tasador/tasacion-card.tsx    ?? lib/tasador/contactos-cola.ts
 M lib/tasaciones.ts                       ?? lib/tasador/contactos-cola.test.ts
 M lib/tasador/lectura-tasacion.ts         ?? lib/tasador/lectura-tasacion.test.ts
 M lib/tasador/mock-user.ts                ?? docs/_archivo/aprendizajes-20260819-1218-P3-TAS.md
 M docs/CODE_INCONSISTENCIES.md
 M docs/aprendizajes.md
 M lib/solicitudes.ts   ← R5-E autorizado: una palabra
```

- **`lib/solicitudes.ts`**: `function etiquetaEtapa` → `export function etiquetaEtapa` (línea 613).
  Autorización explícita de Sergio, alcance declarado "sólo agregar la palabra export". Se usa para
  que el rótulo del badge del tasador y el de la bandeja **no puedan divergir**.
- **Sin cambios** en `app/api/solicitudes/**`, `components/console/**`, `app/(ejecutiva)/**` ni
  `middleware.ts`.
- **`package.json` intacto: cero dependencias nuevas.**
- `components/console/status-badges.tsx`, `lib/contactos-visita.ts` y `lib/tasadores.ts` se
  **importan, no se editan** (R5-E).

---

## Bugs / obstáculos y resolución

### 1 · Tres defectos que compilaban y mentían

Ninguno lo señala el compilador, y los tres tienen consecuencia visible para el tasador.

- **El semáforo verde inventado.** `slaStatus` y `horasRestantes` eran opcionales, nadie los
  escribía, y el `?? "en_plazo"` / `?? 0` de la card producía **"En plazo · 0h"** en toda la
  cartera. **Lección:** un campo opcional que nadie escribe **más** un `??` en el consumidor son,
  juntos, un valor inventado con apariencia de dato. Cuando el `??` aporta un valor de negocio
  —color, plazo, estado—, la pregunta no es si compila sino **quién lo escribe**.
- **El `tel:` vacío.** `contactoTelefono` salía de `vendedor_telefono`, que está vacío en la única
  solicitud real de la cola. La ficha CI-035 declaraba la asunción y ponía el coste como motivo del
  descarte de `TX_ContactosVisita`; el coste resultó ser **una lectura, no N**, gracias al lookup
  `solicitud_record_id`. **Lección:** cuando una asunción se declara con un coste como
  justificación, verificar el coste antes de heredarlo — puede haber cambiado o no haber sido
  cierto nunca.
- **La fecha de visita un día antes.** Ver §2.

### 2 · El bug que sólo se ve mirando un dato conocido

Se sembró VP-2026-0062 con `fecha_visita_programada = 2026-08-18` y la cola mostró **17-08-2026**.
`fecha_visita_programada` es un campo `date`, llega como `"2026-08-18"`, y `new Date()` lo lee como
medianoche **UTC**: en huso chileno, el día anterior.

Arreglado anclando a `T12:00:00` local, la misma solución que `parseDate` de `lib/solicitudes.ts`
en IF-02 desde hace meses. Se auditaron los otros tres `new Date(...)` de IF-03: los dos restantes
leen instantes `_ts` con hora real y son correctos. Regla nueva: **RO-36**.

**Lo importante no es el arreglo, es cómo apareció.** Ningún test previo lo habría cazado: todos
los fixtures usaban fechas con hora. Salió de comparar un dato **sembrado a propósito** con lo que
la pantalla mostraba. Sembrar datos con valores conocidos y contrastarlos uno a uno es una
verificación distinta de correr la suite, y encuentra otra clase de defectos.

### 3 · Clerk devuelve 404, y eso no significa que la ruta no exista

`curl http://localhost:3000/tasaciones` → **404**. La ruta existe, compila y aparece en el build
como `ƒ /tasaciones`. Lo que falta es la sesión: `middleware.ts` protege todo salvo `/sign-in` y
`/api/health`, y `auth.protect()` responde 404 —no un redirect— a peticiones no interactivas.

Ficha **CI-036**. La verificación visual se sustituyó por dos scripts en el scratchpad, fuera del
repo, corridos con `vitest --config` y un symlink a `node_modules`: uno ejecuta `leerCola()` contra
Airtable real, otro renderiza las `TasacionCard` con `renderToStaticMarkup`. Cubren markup,
contenido, orden y `href`; **no** píxeles.

### 4 · Un `Infinity` como centinela que se comía un teléfono

Primera versión de `telefonosPrioritarios`: `if (prioridad < (elegida ?? SIN_PRIORIDAD + 1))`, con
`SIN_PRIORIDAD = Infinity`. Como `Infinity + 1 === Infinity`, una solicitud cuyo **único** contacto
no tuviera `orden_prioridad` se quedaba sin teléfono teniéndolo. Se cambió por una comprobación
explícita de `undefined`. Hay test.

**Lección:** un centinela numérico que se pretende "mayor que todo" deja de funcionar en cuanto se
le hace aritmética. La ausencia se comprueba como ausencia (`undefined`), no como un número grande
— que es la misma idea que **RO-34** en otro disfraz.

---

## Deuda técnica para tandas siguientes

| Para | Qué |
|---|---|
| **Sergio · fuera de tanda** | **Q5 con Héctor:** nadie escribe `sla_e2_fin_ts`. Mientras siga así, una solicitud `asignada` **no sale nunca** del chip "Por coordinar" y su semáforo termina en rojo. El chip está bien construido; lo que falta es quién cierra la etapa. |
| **Sergio · limpieza** | Borrar el seed cuando deje de hacer falta: `ejecutivo_solicitante = "SEED P3-TAS"` (3 solicitudes + 4 contactos). Los tonos envejecen: en unos días los tres estarán en rojo. |
| **P11-TAS** | **CI-036** · reconciliar el guard de Clerk con la identidad mock · borrar `lib/tasador/mock-user.ts` entero, incluida `nombreVisibleTasador()`. |
| **P7-TAS** | Lo que ya traía: precarga de factores cuando A-18 cierre · `tipoZona` → Link `M_Zonificacion` · CI-029 · CI-034 · rename de `factores-default` (OV-6) · los huérfanos de CI-023. |
| **P9-TAS** | CI-028 y CI-024, sin cambios. |
| **Documental** | **CI-027** sigue abierta: actualizar CI-020 y el Blueprint al árbol real de 6 rutas. **A-12** sigue abierta y el chip sigue siendo un stub. |
| **Sin dueño** | `test:e2e` sigue huérfano — y ahora hay un motivo concreto para atenderlo: sin navegador no hay verificación visual, y CI-036 la hace depender de una sesión manual. |

---

## Reglas nuevas → MIGRAR a `docs/aprendizajes.md`

Ya escrita en el archivo vivo:

- **RO-36 · Un día del calendario no es un instante: se ancla al mediodía local.** Los campos
  `date` de Airtable llegan sin hora y `new Date("YYYY-MM-DD")` es medianoche UTC, que retrocede un
  día en todo huso al oeste de Greenwich. Fecha de calendario → `T12:00:00` sin `Z`; instante
  (`*_ts`) → tal cual. Precedente doble: `parseDate` de IF-02 ya lo resolvía, y IF-03 repitió el
  error igual.

Candidatas observadas, **no promovidas** (un caso cada una):

- Un campo opcional que nadie escribe más un `??` en el consumidor equivalen a un valor inventado.
  Se solapa con la familia de RO-34 (ausencia ≠ neutro) y quizá corresponda refundirlas.
- Cuando una ficha declara una asunción **justificada por un coste**, verificar el coste antes de
  heredar la asunción.
