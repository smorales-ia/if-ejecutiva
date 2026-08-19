# Plan de Ejecución IF-02 v1.12 — Guía maestra para Claude Code

> **Versión del plan: v1.12** (10-ago-2026). Cambio respecto de v1.11: **el criterio de
> aceptación de la Tanda B se corrige y sus entregables se completan**. La Tanda B cerró con 186
> tests verdes, y al ejecutar su propio criterio de aceptación se descubrió que el `grep` estaba
> mal escrito: barría también los `.test.ts`, donde los catorce números de §5.2.4 aparecen
> **legítimamente** como fixtures. Un criterio que falla sobre código correcto no mide lo que
> dice medir. Queda registrado como reconciliación greppable **§9.6-R6**, con el `grep` corregido
> —exclusión explícita de tests— en el criterio de la Tanda B.
>
> Se ratifican además **dos entregables que la Tanda B produjo y que v1.11 no declaraba**:
> `vitest.config.mts` (el alias `@/` de `tsconfig` no llegaba al runner) y `updateRecord` en
> `lib/airtable-client.ts` (no existía patrón `PATCH` en el repo). Ambos son infraestructura
> real de la tanda, no efectos colaterales, y omitirlos de la lista dejaría la próxima sesión
> creyendo que hay que escribirlos.
>
> **La Tanda B no se reabre.** Está cerrada y committeada: v1.12 corrige su criterio de
> aceptación y completa el listado de lo que entregó. Sin campos nuevos, sin tandas nuevas, sin
> checkpoints nuevos.
>
> **v1.11** (10-ago-2026). Cambio respecto de v1.10: **el plan alcanza a la
> base**. La Tanda A se ejecutó —`C_SLA_Etapas` (`tbl05zu5RLhH3u6pl`) creada y sembrada con las 7
> filas de §5.2.4, los 3 campos nuevos de `C_SLA`, los 20 campos SLA de `TX_Solicitudes` con
> `timeZone = America/Santiago` verificado uno a uno, y la fila `SLA_DEFAULT_GLOBAL`
> (`recAoOl35rFwEuM8u`)— y esta versión corrige las tres cosas que ese pase dejó desalineadas:
>
> **1 · `sla_revision_horas` se declara con 1 decimal, no 2.** El valor más fino que puede tomar
> es `0.5`; el segundo decimal no representa nada. Alinea el plan con el campo real
> `fldyi1guWZwwhvbkF`.
>
> **2 · M-13 queda cerrado.** `sla_semaforo_etapa` (`fldB6gJ3clZUPgaZk`) se creó **por MCP**
> durante A-3, con el texto literal de §9.6.1 y `isValid: true`. Deja de ser un turno manual de
> UI y deja de bloquear la Tanda C. La **verificación de los cuatro literales** sigue viva y se
> hace en el E2E de la Tanda C: `isValid` dice que compila, no qué cadena emite.
>
> **3 · `matriz_etapas` de la fila default vuelve a estar vacío.** Se había linkeado a las 7
> filas globales; un override que apunta a la matriz global es un no-op semántico que quema la
> señal de §9.6-R4. Revertido el mismo día.
>
> Reconciliación greppable nueva: **§9.6-R5** — *el MCP sí crea fórmulas* (`create_field` acepta
> `type: "formula"`), contra lo que v1.10 afirmaba. La regla que deja: antes de declarar en el
> plan que el MCP no puede algo, probarlo; una incapacidad supuesta cuesta un turno manual que
> nadie necesitaba y se copia de versión en versión como si fuera un hecho verificado. Las dos
> incapacidades **sí** verificadas siguen en pie: el MCP no borra campos y no lee el estado de una
> Airtable Automation.
>
> Sin campos nuevos, sin tandas nuevas, sin checkpoints nuevos.
>
> **v1.10** (10-ago-2026). Cambio respecto de v1.9: se incorporan las **tres
> decisiones de negocio** que faltaban para que M-11 dejara de ser una elicitación abierta. No
> cambia la estructura de §9.6 —ni un campo nuevo, ni una tanda nueva, ni un checkpoint nuevo—:
> cambia **el contenido que se carga** y **el orden en que M-11 puede correr**.
>
> **Decisión 1 · la matriz por etapa se carga literal, no se elicita.** Los catorce números de
> §5.2.4 son datos cerrados por Héctor. Se cargan tal cual en `C_SLA_Etapas` y se ratifican en
> **M-11.b**; nadie tiene que definirlos.
>
> **Decisión 2 · el SLA agregado tiene baseline.** Una **única fila global default** en `C_SLA`
> con 3 días de compromiso (rojo), ámbar a los 2 y verde de 0 a 1, y `sla_revision_horas` vacío.
> M-11 pasa de "pedirle umbrales a Héctor/Óscar" a "cargar una fila y borrar la familia
> perdedora": **deja de ser una compuerta de tiempo de respuesta ajeno** y puede ejecutarse el
> mismo día. Héctor y Óscar quedan como **validadores post-carga**, no como bloqueadores.
>
> **Decisión 3 · el reproceso sigue diferido.** La matriz R1–R3 y RN-55 (§5.2.5) **no entran en
> ninguna tanda** de esta iteración. v1.9 ya lo declaraba en §9.6.1 · *Reglas de reproceso*; aquí
> se **ratifica sin duplicar**, con una línea de anclaje en ese mismo bloque.
>
> La traducción de la Decisión 2 al schema real obligó a una cuarta reconciliación greppable,
> **§9.6-R4**: los nombres `sla_dias` / `umbral_ambar_dias` / `umbral_verde_dias` con que llegó
> la decisión **no son los del schema** —el primero es la familia que M-11 borra y los otros dos
> no existen—, así que se cargan sobre la familia superviviente conservando los valores exactos.
> Ahí queda fijada también la convención de la fila comodín (los tres links **vacíos**, porque
> `cliente`/`tipo_informe`/`tipo_propiedad` son `multipleRecordLinks` y no admiten un literal
> `*`) y la precedencia campo a campo frente a la fila `SLA_METLIFE_Refinanciamiento` existente.
>
> Reverificación MCP del 10-ago-2026 (sólo lectura, previa a este pase): `C_SLA` sigue con **1
> fila**, la familia `sla_dias`/`sla_dias_alerta`/`sla_dias_vencido` sigue **vacía en 1 de 1**,
> `C_SLA_Etapas` **sigue sin existir** (66 tablas) y `TX_Solicitudes` sigue con **135 campos** y
> cero con prefijo `sla_`. **Sin cambios de esquema desde v1.9.**
>
> **v1.9** (10-ago-2026). Cambio respecto de v1.8: se reconcilian las tres
> divergencias entre §9.6 y la base real, releída campo por campo contra `app9G7lLkIV3CpeLa` el
> 10-ago-2026, y quedan registradas como decisiones greppables **§9.6-R1** (`C_Feriados` es el
> nombre canónico y la spec es la que se corrige), **§9.6-R2** (`AT08_Alertas_SLA` se **crea**;
> lo que existe es su fila de inventario, que se **actualiza**, no se duplica) y **§9.6-R3**
> (`sla_revision_horas` es el nombre canónico del sub-SLA del visador, y es un **override del
> umbral de la etapa 7**, no una segunda fuente del mismo número).
>
> La reverificación además **corrige tres afirmaciones de v1.8** que resultaron inexactas: las
> filas de 2026 sin `anno` en `C_Feriados` son **5, no 8**; **AT08 sí tiene fila** en
> `C_AutomationsAirtable` (`estado = Inventariado`), aunque la Automation no exista; y AT02/AT04
> figuran **`Activo`** en ese registro, no "sin desplegar" — lo que obliga a una verificación
> manual de AT02 en M-9, porque la REGLA A · D-15 depende de que esté apagada y ninguna API puede
> confirmarlo. Cuatro hallazgos nuevos: el par de campos `nombre`/`nombre_feriado` de
> `C_Feriados` está **duplicado y divergente**; la fila basura **contaminó el select `tipo`** con
> una opción homónima; `fecha_solicitud` quedó con `timeZone = client`, que los 14 timestamps
> nuevos no deben heredar; y el caso **E2E-12** describía mal el calendario (19-sep-2026 es
> sábado, no un segundo feriado hábil) — se conserva el caso, corregidos su descripción y su
> resultado esperado, ahora calculado a mano en el propio criterio.
>
> Sin campos nuevos respecto de v1.8. Sin checkpoints nuevos: se amplían M-9, M-11, M-12, M-16,
> M-17 y M-18, y se agrega el paso **F-5** a la Tanda F.
>
> **v1.8** (10-ago-2026). Cambio respecto de v1.7: se inserta
> **§9.6 · P8.6 — Control de SLA en IF-02 (RF-08 agregado + RF-53 por etapa)** entre P8.5 y P9,
> con el diseño de datos, el motor de cómputo hábil, la UI de los dos semáforos convivientes y
> las siete tandas A–G con checkpoints M-9 a M-18. Se corrige la **secuencia oficial de §0.7**,
> que nunca incorporó P8.5, y se agregan sus dos filas a la tabla de modos de §0.5. Reproceso
> (§5.2.5) **sigue diferido** en §1.9 · FUT-EJ-08. Filas nuevas en §12 y §13.
>
> **v1.7** (08-ago-2026). Logo corporativo del pie de SC05 como adjunto inline por CID,
> checkpoints M-7 y M-8, y caso E2E-9. *(Este bump se registró sólo en el pie del archivo; la
> entrada de encabezado se agrega aquí en v1.8 para que ambas versiones coincidan.)*
>
> **v1.6** (06-ago-2026). Cambio respecto de v1.5: realineamiento a la
> Especificación v1.9.6 (reestructura de §8 · path Dropbox). Cambio de ubicación del archivo
> a `docs/_md/` (pasa a ser normativo). Precisión de comportamiento del checklist P8:
> desmarcar un tipo con archivo borra la fila y el binario (RF-52), no sólo desvincula.
> Nueva nota de diseño sobre el nivel Unidad en el sheet P8 (§9.1). Resueltas dos deudas
> previas de §1.5.1 P0.5 (`superficie_terreno_m2` y `tipo_bien`, ambas marcadas
> "verificar existencia"). Tres filas nuevas en §13.
>
> **v1.5** (31-jul-2026). Cambio respecto de v1.4: se inserta
> **§9.5 · P8.5 — Correo de asignación al tasador (SC05)** entre P8 y P9, y se corrigen las
> referencias a "SC13" en §8.1, §10.4.1 y §10.4.3. Nuevo §13 con archivos afectados.
>
> **Uso.** Este archivo es la referencia única para construir IF-02. Claude Code lo lee al iniciar cada sesión, detecta la última P completada y ejecuta la siguiente **sin que Sergio le pase el prompt**. Sergio solo confirma que la P quedó ok y da señal para avanzar.
>
> **Precedencia.** Ante cualquier contradicción con `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md` u otros docs, mandan las **Reglas A, B, C** de este archivo (§0.3): son la fuente de verdad de la UI implementada. *(La ruta canónica es `v1_9_9`; el nombre de archivo de este plan conserva `v1_9` por compatibilidad con §0.1 — no renombrar.)*

---

## §0 Preflight — Lectura obligatoria al iniciar cada sesión

### §0.1 Archivos a leer al iniciar sesión (en este orden)

1. `docs/_md/plan-ejecucion-if02-v1_9.md` (este archivo, completo)
2. `docs/_notas/inventario-if02.md` (generado en P0 — obligatorio a partir de P1)
3. `docs/aprendizajes.md`
4. `docs/schema-airtable.md`
5. `docs/diseno.md`
6. `docs/construccion.md`
7. Último `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}.md` disponible (para saber dónde quedó la sesión anterior).
8. Último `docs/_notas/snapshot-P{n}.md` disponible.

### §0.2 Convenciones no negociables

- **Repo:** `/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva` (WSL2)
- **Stack:** Next.js 16 App Router · React 19 · TS 5.7 · pnpm · Tailwind v4 (`@theme` en `globals.css`, sin `tailwind.config.js`) · shadcn/ui v4 sobre `@base-ui/react` (nunca Radix) · react-hook-form + zod · sonner · cmdk · lucide-react
- **Cero lógica de negocio en UI.** Toda escritura a Airtable pasa por Make o Airtable Automations.
- **Reuse before create.** Antes de crear un componente/función/tipo, buscar con `grep -r` si ya existe. **Si existe, se extiende; no se duplica.**
- **Complete files only.** Cuando un archivo cambia, entregar la versión completa nueva; nada de patches ni adendas.
- **Sin `localStorage` / `sessionStorage`** para datos de negocio.
- **Commits los hace Sergio en GitHub Desktop.** Claude Code nunca ejecuta `git commit` ni `git push`.
- **Idioma:** UI en español (Chile); comentarios de código en español; identificadores en inglés.

### §0.3 Reglas A, B, C — Fuente de verdad UI (precedencia absoluta)

**REGLA A — Asignación de tasador**
- Solicitud se crea sin tasador (estado `creada`, badge "Sin asignar").
- Existe **solo** el botón "Asignar Tasador". **No existe "Reasignar Tasador"** en la barra de acciones.
- Botón visible **solo** cuando: sin tasador asignado + estado permite (no `cancelada`, no `cerrada`).
- Al asignar, el botón **desaparece**.
- Habilitación: requiere `datosMinimosFaltantes = []`. Si faltan datos, botón deshabilitado + tooltip con la lista.
- Al confirmar: fija tasador, estado `creada → asignada`, registra `fecha_asignacion`, marca correo como enviado, agrega 2 eventos a `A_Eventos` (`correo_asignacion_enviado`, `asignacion_manual`).

**REGLA B — Validación al crear solicitud**
- Si algún dato impide crear, **no se crea** y se informa en **dos superficies simultáneas**:
  1. **Toast (sonner):** encabezado con "N campos con problema" + detalle de los primeros (formato `campo: motivo`) + contador "+N más".
  2. **Alert destructivo** al inicio del formulario: lista **todos** los campos fallidos con etiqueta legible y motivo. Bloques repetibles se nombran con precisión: `"Unidad 2 · Superficie construida: obligatoria"`, `"Contacto 1 · Teléfono: formato inválido"`.
- **Conflicto de negocio:** si el N° de operación ya existe, `setError` en ese campo con motivo específico (no se mezcla con validaciones de forma).

**REGLA C — Modificación de datos**
- Editable **solo** en estado `creada`. En ese estado la ejecutiva puede modificar **todo**, incluyendo cambiar el tasador ya asignado (si lo hubo, aunque en el flujo normal no lo habrá).
- Botón "Editar solicitud" visible **solo** en estado `creada`.
- **Modo consulta (RN-59):** cuando estado ≠ `creada` **y** hay tasador asignado, todos los datos quedan en solo lectura.
- Al guardar edición: actualiza datos, registra `datos_modificados` en `A_Eventos`, toast de éxito, vuelve a modo consulta.

### §0.4 Consecuencias derivadas (aplican a todos los P)

- `AT02` está fuera del alcance de IF-02: **cero llamadas** a AT02 desde código Next.js.
- **No hay endpoint** `/api/solicitudes/[id]/reasignar`. Solo `/api/solicitudes/[id]/asignar`.
- **No hay diálogo** de reasignación con catálogo de motivos.
- El correo `email_asignacion_tasador` se envía **una sola vez** por asignación (más el botón "Reenviar" del bloque Asignación).

### §0.5 Modos de Claude Code por P

Claude Code tiene 3 modos que Sergio cicla con **Shift+Tab** en la terminal:

| Modo | Comportamiento |
|---|---|
| `default` | Pregunta antes de cada edición de archivo **y** cada comando de terminal. |
| `accept edits on` | Edita archivos libre. Pregunta antes de ejecutar comandos de terminal. |
| `auto mode on` | Hace todo sin preguntar. |

**Modo recomendado por P** (Sergio activa con Shift+Tab **antes** de arrancar cada P):

| P | Nombre | Modo recomendado | Razón |
|---|---|---|---|
| P0 | Inventario | `auto mode on` | Solo lee y genera 1 doc. Riesgo cero. |
| P0.5 | Schema Airtable IF-02 | `default` | Muta schema real vía MCP Airtable. Cada `create_table` / `create_field` requiere confirmación. |
| P1 | Types | `auto mode on` | Solo tipos TS. Errores los atrapa `tsc`. |
| P2 | API Routes | `accept edits on` | Backend + HMAC. Que edite, pero pare en comandos. |
| P3 | Wizard | `accept edits on` | UI nueva con shadcn. Bajo riesgo. |
| P4 | Formulario | `accept edits on` | REGLA B — punto frágil. Que edite, pare en comandos. |
| P5 | Panel lista + filtros + búsqueda | `accept edits on` | UI de lectura pura, no cambia estado real. |
| P6 | Panel detalle | `accept edits on` | REGLAS A y C. Igual que P4. |
| P7 | Diálogo asignación | `default` | Cambia estado real (`creada → asignada`) y dispara correo. |
| P8 | Sheet documentos | `accept edits on` | Sube archivos a Dropbox. Bajo riesgo si RF-09 va bien. |
| P8.5 | Correo de asignación (SC05) | `default` | Envía correo real a un tercero. Blueprints Make + plantilla en Airtable. |
| P8.6 | Control de SLA (RF-08 + RF-53) | `default` | Muta schema Airtable (tabla + 21 campos + fórmula), toca dos blueprints ya en producción y crea una Automation con cron. |
| P9 | Deploy | `default` | Deploy a producción. Cualquier error se propaga. |

**Regla de comportamiento textual — red de seguridad:**

Cada P al arrancar declara su **contrato de comportamiento** (siguiente sección). Claude Code lo respeta **incluso si el modo real es más permisivo**. Es decir: aunque Sergio olvide cambiar a `default` en P7, si el plan dice "pregunta antes de cada comando", Claude Code pregunta.

**Contratos posibles:**

- 🟢 **libre**: puede editar y ejecutar comandos sin preguntar.
- 🟡 **pausa-en-comandos**: edita libre, pero antes de ejecutar cualquier comando de terminal (`pnpm`, `bash`, scripts, etc.) muestra el comando y pide confirmación con "¿ejecuto? (s/n)".
- 🔴 **pausa-total**: antes de cada edición Y de cada comando, muestra qué va a hacer y pide confirmación.

### §0.6 Convención Tanda y aprendizajes

Cada P (incluido P0) es una **Tanda** independiente. Al terminar cada tanda:

1. Claude Code genera **automáticamente** un archivo de aprendizajes en:
   ```
   docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}.md
   ```
   con timestamp real del sistema (ej: `aprendizajes-20260722-1435-P0.md`).

2. Ese archivo contiene:
   - Encabezado con P, fecha, hora, duración estimada de la tanda.
   - Resumen de qué se construyó (bullet points).
   - Decisiones técnicas relevantes.
   - Overrides aplicados (rutas reales vs plan).
   - Bugs encontrados y cómo se resolvieron.
   - Deuda técnica que queda para P siguientes.
   - Nuevas reglas que deberían migrar a `docs/aprendizajes.md` como reglas activas (marcadas con `→ MIGRAR`).

3. Sergio hace commit + push desde GitHub Desktop.
4. Sergio confirma en el chat maestro (VProperty) que la tanda quedó ok.
5. Recién ahí se avanza a la siguiente P.

`docs/aprendizajes.md` **no se modifica automáticamente** por cada P: es la base consolidada de reglas activas. Solo cuando Sergio pide expresamente migrar una lección desde el archivo timestamped, Claude Code la mueve.

### §0.7 Autoejecución — Claude Code decide qué P correr

**Sergio no le pasa el prompt de cada P.** Al iniciar sesión, Claude Code sigue este algoritmo:

1. Lee todos los archivos de §0.1.
2. Lista `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P*.md` ordenados por timestamp.
3. Detecta la **última P completada**: la del archivo más reciente con timestamp válido y contenido no vacío.
4. La siguiente P a ejecutar sigue la **secuencia oficial**: `P0 → P0.5 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P8.5 → P8.6 → P9`. Ejemplo: si la última completada es `P0`, la siguiente es `P0.5`; si es `P0.5`, la siguiente es `P1`. (No usar aritmética `+1`: `P0.5`, `P8.5` y `P8.6` son P nominales, no fraccionales. La secuencia de v1.5 a v1.7 omitía `P8.5` por descuido de la inserción de §9.5; corregido en v1.8 junto con la entrada de `P8.6`.)
5. Si no hay archivos previos: la P a ejecutar es **P0**.
6. Si el último snapshot `docs/_notas/snapshot-P{n}.md` existe pero el archivo de aprendizajes correspondiente **no existe**, esa P quedó a medias → **retomar P{n}** desde donde quedó (leer el snapshot para saber estado).
7. **Antes de arrancar**, Claude Code muestra un mensaje breve:
   ```
   📋 Detecté que la última P completada es P{n-1}.
   Voy a ejecutar P{n} — {Nombre}.
   Modo Claude Code recomendado: {modo} · Contrato: 🟡 pausa-en-comandos.
   Cambia el modo con Shift+Tab si aún no lo hiciste. ¿Empiezo? (s / n / P{otro})
   ```
8. Sergio responde:
   - `s` (o cualquier confirmación) → arranca la P.
   - `n` → espera instrucciones.
   - `P{otro}` → ejecuta esa P en lugar de la detectada (útil si hay que repetir o saltar).

**Si Sergio dice "sigue" o "continúa" sin más contexto:** Claude Code aplica el algoritmo anterior y arranca la siguiente P.

---

## §1 · P0 — Inventario y alineación con lo existente

> **⚙ Modo Claude Code recomendado:** `auto mode on`
> **🟢 Contrato de comportamiento:** **libre**. No hay cambios de código; solo lectura del repo y generación de 1 archivo doc. Cero riesgo.

> **Regla dura:** ninguna P posterior (P1 en adelante) puede ejecutarse si `docs/_notas/inventario-if02.md` no existe o está desactualizado. Cada P referencia el inventario para resolver rutas reales antes de crear archivos nuevos.

### §1.1 Diseño

**Objetivo.** Antes de tocar código, Claude Code inventaría lo que la base v0.dev ya generó, para que las Ps siguientes se ejecuten sobre nombres y rutas **reales del repo**, no sobre nombres inventados en este plan. Esto elimina el riesgo de crear estructura duplicada.

**Producto.** Un solo archivo: `docs/_notas/inventario-if02.md`

**Contenido del inventario:**

1. **Árbol real** de `components/console/`, `components/ui/`, `app/`, `app/api/`, `lib/types/`, `lib/validators/`, `lib/console-data.ts` (2 niveles de profundidad).
2. **Mapa componente → P**: por cada componente/carpeta relevante, indicar a qué P le corresponde extenderlo (o si es reutilizable transversal).
3. **Rutas API existentes**: método, path, propósito inferido, si escribe vía Make o directo.
4. **Types existentes**: qué entidades ya están tipadas, cuáles faltan.
5. **Componentes reutilizables detectados**: `RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `FileUploadZone`, `SLABadge`, `StateBadge`, `EventTimeline`, etc. Con su ruta real.
6. **Reglas A, B, C ya implementadas**: dónde vive hoy en el código (archivo + líneas) la lógica de visibilidad del botón "Asignar Tasador", el Alert destructivo, el modo consulta.
7. **Overrides al plan**: sección final con formato `Plan dice X → Repo usa Y → P{n} debe apuntar a Y`. Esta sección es la que hace que P1-P9 respeten lo construido.

**Ejemplo de override esperado:**

```
Plan §5.1 propone crear "components/console/form-solicitud/".
Repo ya tiene "components/console/nueva-solicitud-form.tsx" (archivo único).
Decisión: P4 extiende ese archivo dividiéndolo en 4 secciones dentro de la misma carpeta,
NO crea "components/console/form-solicitud/" nuevo.
```

### §1.2 Construcción — Pasos para Claude Code

1. Ejecutar:
   ```bash
   tree -L 3 -I 'node_modules|.next|.git' components/ app/ lib/ > /tmp/tree.txt
   cat /tmp/tree.txt
   ```
2. Ejecutar:
   ```bash
   grep -rn "export default\|export function\|export const" components/console/ | head -100
   ls app/api/ && find app/api -name "route.ts"
   ls lib/types/ 2>/dev/null && grep -l "interface\|type " lib/types/*.ts 2>/dev/null
   grep -rn "console-data\|mock" lib/ components/ | head -30
   ```
3. Detectar dónde vive la lógica de las Reglas A, B, C hoy:
   ```bash
   grep -rn "Asignar Tasador\|asignar.*tasador\|puedeAsignar" components/ app/
   grep -rn "readOnly\|modoConsulta\|read-only" components/console/
   grep -rn "setError\|Alert.*destructive\|toast\.error" components/console/
   ```
4. Detectar componentes del panel lista existentes (para P5):
   ```bash
   grep -rn "Tabs\|TabsList\|TabsTrigger\|filtros\|Filtros" components/console/
   grep -rn "SolicitudCard\|SolicitudRow\|SolicitudItem" components/console/
   grep -rn "useSearchParams\|SearchParams" app/ components/
   ```
5. Componer `docs/_notas/inventario-if02.md` con las 7 secciones de §1.1.
6. **Sección crítica — Overrides al plan:** por cada P del plan (P1 a P9), agregar 1-3 overrides si detecta divergencia entre lo que el plan propone y lo que el repo ya tiene. Si no hay divergencia para una P, escribir `P{n}: sin overrides, el plan aplica tal cual`.
7. Al final, un checklist de riesgos:
   - Archivos que el plan propone crear y que ya existen con otro nombre.
   - Dependencias mencionadas en el plan que faltan en `package.json`.
   - Rutas API mencionadas que faltan y hay que crear en P2.
8. Generar el archivo de aprendizajes de esta tanda: `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.md` con timestamp real, siguiendo la plantilla de §10.2.

### §1.3 Criterios de aceptación

- [ ] `docs/_notas/inventario-if02.md` existe y tiene las 7 secciones.
- [ ] La sección "Overrides al plan" cubre P1 a P9 (aunque sea con "sin overrides").
- [ ] Los componentes reutilizables (RUTField, StateBadge, etc.) están listados con su ruta real.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.md` creado con timestamp real.
- [ ] **No se modificó ningún archivo de código en esta P.** Solo lectura + generación de 2 archivos doc.

---

## §1.5 · P0.5 — Schema Airtable IF-02

> **⚙ Modo Claude Code recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total** para operaciones de escritura (`create_table`, `create_field`, `update_table`, sembrado de filas). Las operaciones de lectura MCP (`list_tables_for_base`, `get_table_schema`, `search_records`) son 🟢 libres. Antes de cada mutación, Claude Code muestra en una línea qué va a crear y pide `s/n`.

> **Regla dura:** P1 (Types) NO puede ejecutarse si esta P no está completa. P1 lee `docs/schema-airtable.md` como fuente de verdad; si el schema no refleja los campos v1.9, los tipos TS quedarán desalineados con la base real.

### §1.5.1 Diseño

**Rol operativo:** Airtable Engineer + Data Designer.
**MCP:** Airtable · **Base:** `app9G7lLkIV3CpeLa`.
**Fuente:** `docs/_md/VProperty_Especificacion_Proyecto_v1_9_1.md` §1.5.1 "Dependencias de schema".

**Objetivo.** Dejar el schema Airtable completo para IF-02 v1.9 — 2 tablas nuevas obligatorias, 1 tabla condicional, y campos nuevos en `TX_Solicitudes` y `TX_Unidades`. **Ningún cambio de UI ni de Make en esta tanda.**

**Producto.**
1. Schema actualizado en la base `app9G7lLkIV3CpeLa`.
2. `docs/schema-airtable.md` actualizado con IDs reales de tablas y campos.
3. `docs/_notas/snapshot-P0.5.md` con estado post-tanda.
4. Tabla-resumen impresa al final: `{tabla, campo, accion: creado | existía_ok | conflicto}`.

**Reglas duras (verificación previa obligatoria):**
- Antes de crear cualquier tabla o campo, verificar con `list_tables_for_base` / `get_table_schema`. Si ya existe con el mismo tipo y dominio → **NO re-crear**, solo confirmar.
- Si un `singleSelect` existe con opciones distintas → **NO modificar**, reportar conflicto y pedir instrucciones a Sergio antes de continuar.
- Orden cross-system estricto: **Airtable schema (esta P) → Make blueprint (P2+) → Next.js code (P1+)**.
- **MCP no puede crear columnas en algunas tablas existentes** (aprendizaje E-XXX). Si `create_field` falla en `TX_Solicitudes` o `TX_Unidades`, marcar el campo como `pendiente_ui_manual` en el snapshot y avisar a Sergio para creación manual en Airtable UI.

**Alcance — TABLAS NUEVAS**

**1) `TX_ContactosVisita`** — relación 1:N con `TX_Solicitudes`.

| Campo | Tipo | Opciones / Notas |
|---|---|---|
| `nombre` | singleLine (primary) | — |
| `telefono` | phone | — |
| `email` | email | — |
| `rol` | singleSelect | `propietario, corredor, arrendatario, conserje, otro` |
| `orden_prioridad` | number (integer) | — |
| `estado_contacto` | singleSelect | `valido, no_contesta, telefono_erroneo` |
| `solicitud` | linkedRecord | → `TX_Solicitudes` |

**2) `M_TiposDeBien`** — catálogo cerrado.

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | singleLine (primary) | — |
| `codigo` | singleLine | — |
| `activo` | checkbox | default `true` |

**Sembrar 8 filas:** Edificación · Terreno · Estacionamiento cubierto · Estacionamiento descubierto · Estacionamiento uso y goce · Bodega · Piscina · Obras complementarias.

**3) `TX_DocumentosLegales`** — **crear solo si no existe.** Link 1:N a `TX_Solicitudes`. Ver campos en la sección "Campos nuevos" más abajo.

**Alcance — CAMPOS NUEVOS EN `TX_Solicitudes`** (23 campos)

- `ejecutivo_formalizador` (singleLine)
- `tipo_propiedad` (singleSelect: `nuevo, usado`) ← **verificar existencia**
- `modo_creacion` (singleSelect: `documentos, manual`)
- `tipo_cliente_origen` (singleSelect: `correo_texto, correo_ficha, extranet`)
- `email_thread_id` (singleLine)
- `correo_cliente_ref` (singleLine)
- `estado_conservacion` (singleSelect: `nuevo, sin_uso, bueno, normal, malo, deficiente`)
- `origen_direccion` (singleSelect: `ficha_cliente, certificado_avaluo, certificado_numero`)
- `fecha_asignacion` (dateTime)
- `vendedor_tipo_persona` (singleSelect: `juridica, natural`)
- `vendedor_razon_social_o_nombre` (singleLine)
- `vendedor_rut` (singleLine)
- `vendedor_email` (email)
- `vendedor_telefono` (phone)
- `vendedor_origen_dato` (singleSelect: `correo, ficha, certificado_avaluo`)
- `financiero_valor_total_uf` (number, 2 dec)
- `financiero_subsidio_uf` (number, 2 dec)
- `financiero_ahorro_uf` (number, 2 dec)
- `financiero_mutuo_uf` (number, 2 dec)
- `financiero_pago_contado_uf` (number, 2 dec)
- `financiero_bono_captacion_uf` (number, 2 dec)
- `financiero_bono_integracion_uf` (number, 2 dec)
- `financiero_precio_venta_uf` (number, 2 dec)

**Nota de diseño:** Vendedor va como campos planos en `TX_Solicitudes` (decisión del equipo, evita crear `TX_Vendedor` porque la relación es 1:1).

**Alcance — CAMPOS NUEVOS EN `TX_Unidades`** (11 campos)

- `modelo` (singleLine)
- `superficie_terraza_m2` (number, 2 dec)
- `superficie_terreno_m2` (number, 2 dec) ← **descartado el 24-jul-2026: se usa `sup_terreno_m2` (`fld6lgF0KxUh9oPCB`)**
- `con_rol_o_uso_y_goce` (singleSelect: `con_rol, uso_y_goce`)
- `rol_sii_en_tramite` (checkbox)
- `ampliacion_m2` (number, 2 dec)
- `ampliacion_regularizable` (singleSelect: `si, no, no_aplica`)
- `origen_superficie` (singleSelect: `carta_ficha_inmobiliaria, plano, base_interna_sii, certificado_avaluo, medicion_tasador`)
- `respaldo_adjunto` (linkedRecord → `TX_Adjuntos`)
- `detalle_item` (multilineText)
- `tipo_bien` (linkedRecord → `M_TiposDeBien`) ← **verificado: existe (`fldHHo0iPek3vM77p`)**

**Alcance — CAMPOS EN `TX_DocumentosLegales`** (9 campos; crear tabla si no existe con link 1:N a `TX_Solicitudes`)

- `permiso_edificacion_numero` (singleLine)
- `permiso_edificacion_fecha` (date)
- `recepcion_final_numero` (singleLine)
- `recepcion_final_fecha` (date)
- `fojas` (singleLine)
- `numero_inscripcion` (singleLine)
- `ano_inscripcion` (number, integer)
- `lineas_edificacion` (multilineText)
- `certificado_numero` (singleLine)

**FUERA DE ALCANCE — NO crear en esta P:**
- `fecha_visita`, `fecha_envio_informe`
- Tabla `TX_Reprocesos`
- Flag/motivo de bloqueo por contacto no logrado
- `M_Tasadores.notificar_whatsapp`
- Nuevos plazos en `C_SLA`

### §1.5.2 Construcción — Pasos para Claude Code

1. **Autenticar MCP Airtable** si aparece banner amarillo: ejecutar la tool `mcp__airtable__authenticate` ahora.
2. **Consultar overrides P0.5 del inventario:** leer `docs/_notas/inventario-if02.md` sección "Overrides al plan · P0.5" (si existe). Ajustar nombres/IDs según el inventario.
3. **Inventario previo del schema:**
   - Ejecutar `list_tables_for_base` sobre `app9G7lLkIV3CpeLa`.
   - Para cada tabla afectada (`TX_Solicitudes`, `TX_Unidades`, `TX_Adjuntos`, y `TX_DocumentosLegales` si existe), ejecutar `get_table_schema` y volcar campos existentes.
4. **Comparar contra §1.5.1 y clasificar cada ítem** como `EXISTE_OK` (mismo tipo y dominio), `CREAR` (no existe) o `CONFLICTO` (existe con tipo u opciones distintas).
   - **⛔ Si aparece cualquier `CONFLICTO`: DETENER y consultar a Sergio antes de continuar.** No modificar el campo existente sin autorización.
5. **Crear `M_TiposDeBien`** (si no existe) con sus 3 campos y sembrar las 8 filas del catálogo.
6. **Crear `TX_ContactosVisita`** (si no existe) con sus 7 campos, incluyendo el `linkedRecord` a `TX_Solicitudes`.
7. **Crear `TX_DocumentosLegales`** solo si no existe, con link 1:N a `TX_Solicitudes` y los 9 campos.
8. **Agregar campos nuevos** a `TX_Solicitudes` (23) y `TX_Unidades` (11) con `create_field`, saltando los marcados `EXISTE_OK`.
   - Si `create_field` falla por limitación MCP: marcar el campo como `pendiente_ui_manual` en snapshot y notificar a Sergio.
9. **Actualizar `docs/schema-airtable.md`:**
   - Agregar sección por tabla nueva con IDs reales de tabla y campo (formato `tblXXXX` / `fldXXXX`).
   - Agregar los campos nuevos bajo las tablas existentes con su ID de campo.
10. **Generar `docs/_notas/snapshot-P0.5.md`** con:
    - IDs reales de las tablas nuevas.
    - IDs de campo relevantes (base para P1 Types y P2 API Routes).
    - Tabla-resumen final `{tabla, campo, accion}`.
    - Lista de campos `pendiente_ui_manual` si hubo alguno.
11. **Generar archivo de aprendizajes** `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.5.md` con timestamp real, siguiendo la plantilla de §11.2.
12. **Imprimir en consola la tabla-resumen** y **PARAR**. No tocar UI, no tocar Make, no tocar Next.js.

### §1.5.3 Criterios de aceptación

- [ ] `TX_ContactosVisita` existe con sus 7 campos y link a `TX_Solicitudes`.
- [ ] `M_TiposDeBien` existe con sus 3 campos y las 8 filas sembradas.
- [ ] `TX_DocumentosLegales` existe con sus 9 campos y link 1:N a `TX_Solicitudes`.
- [ ] Los 23 campos nuevos de `TX_Solicitudes` existen con el tipo y opciones especificados (o quedan documentados como `pendiente_ui_manual`).
- [ ] Los 11 campos nuevos de `TX_Unidades` existen con el tipo y opciones especificados (o `pendiente_ui_manual`).
- [ ] Cero conflictos silenciosos: cualquier `singleSelect` con opciones distintas fue reportado a Sergio en el chat maestro.
- [ ] `docs/schema-airtable.md` refleja el nuevo estado con IDs reales.
- [ ] `docs/_notas/snapshot-P0.5.md` existe con la tabla-resumen `{tabla, campo, accion}`.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.5.md` creado con timestamp real.
- [ ] **Cero cambios en código Next.js, cero cambios en escenarios Make.**

---

## §2 · P1 — Types TypeScript (v1.9)

> **⚙ Modo Claude Code recomendado:** `auto mode on`
> **🟢 Contrato de comportamiento:** **libre**. Solo agrega tipos TS + corre `pnpm tsc --noEmit`. Los errores los atrapa el compilador.

### §2.1 Diseño

**Objetivo.** Tipar todas las entidades del schema v1.9 antes de tocar API routes o UI, para que el compilador atrape cualquier campo mal referenciado.

**Fuente de verdad:** `docs/schema-airtable.md` (sección TX_ y M_ actualizada) + rutas reales del inventario P0.

**Entidades a tipar** (los archivos destino se resuelven contra el inventario P0; si `lib/types/` no existe con esa estructura, se ajusta):

| Archivo esperado | Entidades |
|---|---|
| `lib/types/solicitud.ts` | `Solicitud`, `EstadoSolicitud`, `ModoCreacion`, `TipoPropiedad`, `TipoClienteOrigen`, `EstadoConservacion`, `OrigenDireccion`, `Prioridad`, `NivelSLA` |
| `lib/types/unidad.ts` | `Unidad`, `TipoBien`, `OrigenSuperficie`, `EstadoUnidad` |
| `lib/types/contacto-visita.ts` | `ContactoVisita`, `RolContacto`, `EstadoContacto` |
| `lib/types/vendedor.ts` | `Vendedor`, `TipoPersona` |
| `lib/types/tasador.ts` | `Tasador` (ya existe — verificar) |
| `lib/types/adjunto.ts` | `Adjunto`, `TipoDocumento`, `EstadoExtraccion` (ya existe — verificar) |
| `lib/types/evento.ts` | `Evento`, `EventoTipo` (agregar tipos v1.9) |
| `lib/types/filtros.ts` | `FiltrosSolicitudes`, `VistaSolicitudes`, `OrdenSolicitudes` (para P5) |
| `lib/types/index.ts` | Re-export barrel |

**Catálogos cerrados (const arrays con `as const`):**

```ts
export const TIPOS_BIEN = [
  'edificacion', 'terreno', 'estacionamiento_cubierto',
  'estacionamiento_descubierto', 'estacionamiento_uso_goce',
  'bodega', 'piscina', 'obras_complementarias'
] as const;

export const ORIGEN_SUPERFICIE = [
  'carta_inmobiliaria', 'plano', 'base_sii',
  'certificado_avaluo', 'medicion_tasador'
] as const;

export const ESTADO_CONSERVACION = [
  'nuevo', 'sin_uso', 'bueno', 'normal', 'malo', 'deficiente'
] as const;

export const ROL_CONTACTO = [
  'propietario', 'corredor', 'arrendatario', 'conserje', 'otro'
] as const;

export const ESTADO_CONTACTO = [
  'valido', 'no_contesta', 'telefono_erroneo'
] as const;

export const MODO_CREACION = ['documentos', 'manual'] as const;
export const TIPO_PROPIEDAD = ['nuevo', 'usado'] as const;
export const TIPO_CLIENTE_ORIGEN = ['correo_texto', 'correo_ficha', 'extranet'] as const;
export const ESTADO_UNIDAD = ['nueva', 'usada'] as const;
export const TIPO_PERSONA = ['juridica', 'natural'] as const;

// Para P5
export const VISTAS_SOLICITUDES = ['mi_cartera', 'sla_riesgo', 'por_asignar', 'aprobadas', 'todas'] as const;
export const ORDEN_SOLICITUDES = ['sla_desc', 'sla_asc', 'fecha_solicitud_desc', 'prioridad'] as const;
export const PRIORIDAD = ['normal', 'urgente', 'critico'] as const;
export const NIVEL_SLA = ['verde', 'ambar', 'rojo'] as const;
```

**Extensiones críticas a `Solicitud`:**

```ts
export interface Solicitud {
  // ...campos existentes (verificar contra inventario P0)
  ejec_formalizador?: string;
  tipo_propiedad: TipoPropiedad;
  modo_creacion: ModoCreacion;
  tipo_cliente_origen?: TipoClienteOrigen;
  estado_conservacion?: EstadoConservacion;
  origen_direccion?: OrigenDireccion;
  fecha_asignacion?: string; // ISO datetime
  email_thread_id?: string;
  prioridad: Prioridad;
  nivel_sla: NivelSLA;
  sla_dias_restantes: number;
  fecha_vencimiento?: string;
  unidades: Unidad[];
  contactos_visita: ContactoVisita[];
  vendedor?: Vendedor;
}
```

### §2.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P1 del inventario:** leer `docs/_notas/inventario-if02.md` sección "Overrides al plan · P1". Ajustar rutas de destino según lo que diga el inventario.
2. **Auditar lo existente:**
   ```bash
   grep -r "interface Solicitud\|type Solicitud" lib/types/ components/
   ```
   Listar qué ya existe. **No duplicar.** Ampliar.
3. Crear/actualizar los archivos en `lib/types/` según §2.1 (o donde el inventario indique).
4. Actualizar `lib/types/index.ts` con re-exports.
5. Correr `pnpm tsc --noEmit` y arreglar cualquier error de tipo derivado.
6. Si algún componente rompe por el nuevo campo obligatorio, marcar el campo como opcional temporalmente con comentario `// TODO P{n}: obligatorio tras migrar`.
7. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P1.md` con timestamp real.

### §2.3 Criterios de aceptación

- [ ] `pnpm tsc --noEmit` pasa sin errores.
- [ ] Cada catálogo cerrado tiene su `const array` + su `type` derivado.
- [ ] Ningún `type` usa `any` en los campos del schema.
- [ ] `Solicitud.unidades` es `Unidad[]` (no `any[]`).
- [ ] No se duplicaron entidades ya existentes (verificado contra inventario P0).
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P1.md` creado.

---

## §3 · P2 — API Routes nuevas y actualizadas

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Antes de ejecutar `pnpm install`, `pnpm dev` o cualquier script que llame a Airtable/Make, Claude Code muestra el comando y pide confirmación explícita ("¿ejecuto? s/n"). Edición de archivos libre.

### §3.1 Diseño

**Principio.** Toda ruta escribe **solo** vía webhook Make o Airtable Automation. Lecturas van directas a Airtable REST con SDK (`airtable` npm) o vía fetch server-side.

**Rutas a crear/actualizar** (verificar contra inventario P0 qué ya existe):

| Ruta | Método | Propósito | Escribe vía |
|---|---|---|---|
| `/api/solicitudes` | GET | Listar con filtros + búsqueda + orden + paginación (para P5) | Airtable directo |
| `/api/solicitudes` | POST | Crear solicitud (REGLA B aplicada) | Make SC01 |
| `/api/solicitudes/[id]` | GET | Leer solicitud + hijos | Airtable directo |
| `/api/solicitudes/[id]` | PATCH | Editar solicitud (REGLA C) | Make SC-Edicion |
| `/api/solicitudes/[id]/asignar` | POST | Asignar tasador (REGLA A) | Make SC-Asignar |
| `/api/solicitudes/[id]/unidades` | POST/PATCH/DELETE | CRUD de unidades | Make SC-Unidades |
| `/api/solicitudes/[id]/contactos` | POST/PATCH/DELETE | CRUD de contactos | Make SC-Contactos |
| `/api/solicitudes/[id]/vendedor` | POST/PATCH | Upsert vendedor | Make SC-Vendedor |
| `/api/solicitudes/contadores` | GET | Contadores por vista (mi_cartera, sla_riesgo, por_asignar, aprobadas) | Airtable directo |
| `/api/tasadores/candidatos?comuna=X` | GET | Listar tasadores con comuna en cobertura, con carga actual | Airtable directo |
| `/api/catalogos/tipos-bien` | GET | Leer `M_TiposDeBien` | Airtable directo |
| `/api/catalogos/clientes` | GET | Leer `M_Clientes` (para filtro P5) | Airtable directo |
| `/api/catalogos/tasadores` | GET | Leer `M_Tasadores` (para filtro P5) | Airtable directo |

**Rutas a NO crear (por REGLA A):**
- ❌ `/api/solicitudes/[id]/reasignar` — no existe reasignación formal.

**Query params de `GET /api/solicitudes` (para P5):**

```
vista        = mi_cartera | sla_riesgo | por_asignar | aprobadas | todas
cliente_id   = string (opcional, filtro)
tasador_id   = string (opcional, filtro)
estado       = EstadoSolicitud (opcional, filtro)
prioridad    = normal | urgente | critico (opcional, filtro)
fecha_desde  = YYYY-MM-DD (opcional)
fecha_hasta  = YYYY-MM-DD (opcional)
q            = string (búsqueda: código VP, RUT comprador, dirección)
orden        = sla_desc | sla_asc | fecha_solicitud_desc | prioridad
page         = number (default 1)
pageSize     = number (default 20)
```

**Response:**
```ts
{
  solicitudes: Solicitud[],
  total: number,
  page: number,
  pageSize: number
}
```

**Contrato de respuesta de error (REGLA B):**

```ts
// 422 Unprocessable Entity
{
  error: 'validacion',
  campos: [
    { campo: 'rut_comprador', motivo: 'RUT inválido (dígito verificador)' },
    { campo: 'unidades.1.sup_construida_m2', motivo: 'Obligatoria si tipo_bien=edificacion' },
    { campo: 'contactos_visita.0.telefono', motivo: 'Formato inválido' }
  ]
}

// 409 Conflict
{
  error: 'conflicto_negocio',
  campo: 'numero_operacion',
  motivo: 'N° de operación 12345 ya existe en solicitud VP-2026-0087'
}
```

**Variables de entorno requeridas** (Railway y `.env.local`):

```
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa
MAKE_WEBHOOK_URL_SC01=
MAKE_WEBHOOK_URL_SC_ASIGNAR=
MAKE_WEBHOOK_URL_SC_EDICION=
MAKE_WEBHOOK_URL_SC_UNIDADES=
MAKE_WEBHOOK_URL_SC_CONTACTOS=
MAKE_WEBHOOK_URL_SC_VENDEDOR=
MAKE_HMAC_SECRET=
CLERK_SECRET_KEY=
```

### §3.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P2 del inventario.** Listar qué rutas API ya existen y su comportamiento actual.
2. **Auditar lo existente:**
   ```bash
   ls -R app/api/
   ```
3. Crear helper `lib/airtable/client.ts` con instancia única de Airtable REST (si no existe según inventario).
4. Crear helper `lib/make/webhook.ts` con firma HMAC-SHA256 (mismo patrón de RF-09).
5. Crear cada ruta según §3.1. En cada `POST/PATCH`:
   - Validar payload con zod.
   - Si zod falla → responder 422 con contrato `{error, campos}`.
   - Verificar unicidad (`numero_operacion`) contra Airtable → si duplica, responder 409.
   - Firmar payload con HMAC y disparar webhook Make.
   - Devolver `{ok: true, id}` o esperar respuesta síncrona según diseño Make.
6. Rutas GET leen directo con `airtable` SDK, no vía Make.
7. Para `GET /api/solicitudes` (P5): implementar filtros server-side, búsqueda con `filterByFormula` de Airtable, paginación con `offset`, ordenamiento con `sort`.
8. Crear archivo `lib/validators/solicitud.zod.ts` con schemas zod compartidos entre form y API.
9. Añadir env vars faltantes a `.env.example` con comentario del origen.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2.md` con timestamp real.

**No implementar todavía los scenarios de Make en este P.** Los webhooks devuelven mocks temporales; la conexión real se cierra en P9.

### §3.3 Criterios de aceptación

- [ ] Todas las rutas de §3.1 responden con status coherente en curl / Postman.
- [ ] Error 422 sigue exactamente el contrato de REGLA B.
- [ ] Ninguna ruta usa Airtable SDK para **escribir** (solo lectura).
- [ ] `GET /api/solicitudes` acepta y aplica todos los query params.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Rutas existentes se extendieron; no se duplicaron con otro nombre.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2.md` creado.

---

## §4 · P3 — Wizard de creación (3 fases)

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Edición libre. Antes de correr `pnpm dev` o instalar dependencias nuevas, pide confirmación.

### §4.1 Diseño

**Ubicación esperada:** `components/console/wizard-nueva-solicitud/` — **verificar contra inventario P0**. Si el repo tiene el wizard en otra ruta o como archivo único, ajustar.

**Estructura:**

```
wizard-nueva-solicitud/
├── index.tsx                    # Contenedor con estado del wizard
├── fase-1-modo-creacion.tsx     # Radio: documentos | manual
├── fase-2-tipo-propiedad.tsx    # Radio: nuevo | usado
├── fase-3-formulario.tsx        # Delega a components/console/form-solicitud
└── stepper.tsx                  # Indicador visual 1-2-3
```

**Trigger:** botón "Nueva solicitud" en el header de la Consola Ejecutiva → abre `Sheet` lateral (shadcn/ui `sheet`) con el wizard.

**Fase 1 — Modo de creación:**
- 2 `RadioGroup` cards grandes:
  - **En base a documentos adjuntos** → habilita `FileUploadZone` justo debajo. Al subir docs, ejecuta SC07 (RF-09) y pre-llena el formulario en Fase 3.
  - **Manual** → Fase 3 empieza en blanco.
- Botón "Continuar" habilitado siempre; si eligió documentos y no subió nada, avisa con `AlertDialog` "¿Continuar sin documentos?".

**Fase 2 — Tipo de propiedad:**
- 2 `RadioGroup` cards grandes: **Nuevo** / **Usado**.
- Este dato es interruptor de todo el flujo (afecta bloque Vendedor, campo "Modelo" en Unidades, sección Financiero, marca "en trámite" en Rol SII).
- Botón "Continuar" deshabilitado hasta elegir.

**Fase 3 — Formulario:**
- Renderiza `<FormSolicitud modo={modo} tipoPropiedad={tipoPropiedad} preLlenado={datosExtraidos} />`.
- Este componente vive en P4.

**Estado del wizard:**

```ts
type WizardState = {
  fase: 1 | 2 | 3;
  modo?: ModoCreacion;
  tipoPropiedad?: TipoPropiedad;
  datosExtraidos?: Partial<Solicitud>;
  archivosSubidos: Adjunto[];
};
```

Mantener en `useState` local del componente contenedor. **No usar `localStorage`.**

**Navegación:**
- Botón "Atrás" en Fase 2 y Fase 3 preserva selecciones previas.
- Cerrar el Sheet en cualquier fase → `AlertDialog` "¿Descartar la solicitud en curso?".

### §4.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P3 del inventario.**
2. **Auditar existente:**
   ```bash
   grep -r "wizard\|nueva-solicitud\|NuevaSolicitud" components/ app/
   ```
3. Crear los 5 archivos de §4.1 con shadcn `Sheet`, `RadioGroup`, `Button`, `AlertDialog`. **Si ya existe algo funcional, extenderlo en su ruta actual.**
4. Componente `Stepper` reutiliza tokens de `globals.css` (colores `--vp-blue`, `--vp-orange`).
5. Cablear botón "Nueva solicitud" del header con estado de apertura del Sheet.
6. En Fase 1 modo `documentos`: reutilizar `FileUploadZone` existente (ruta según inventario). Cada archivo dispara `POST /api/adjuntos` (ya existe de RF-09).
7. Cuando SC07 devuelve extracción exitosa (polling o webhook), guardar `datosExtraidos` en el estado del wizard.
8. Fase 3: renderiza `FormSolicitud` (placeholder que se completa en P4).
9. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P3.md` con timestamp real.

### §4.3 Criterios de aceptación

- [ ] Click en "Nueva solicitud" abre el Sheet en Fase 1.
- [ ] Selección de modo persiste al ir a Fase 2 y volver.
- [ ] "Nuevo" en Fase 2 hace que Fase 3 muestre bloque Vendedor con "Razón social" (jurídica).
- [ ] "Usado" en Fase 2 hace que Fase 3 muestre bloque Vendedor con "Nombre completo" (natural).
- [ ] Cerrar el Sheet pide confirmación si hay datos capturados.
- [ ] Si ya existía un flujo de creación previo, se extendió, no se duplicó.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P3.md` creado.

---

## §5 · P4 — Formulario 4 secciones con bloques repetibles

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. REGLA B (validaciones) es el punto más frágil de todo IF-02: edición libre pero pausa obligatoria antes de cualquier comando de terminal.

### §5.1 Diseño

**Ubicación esperada:** `components/console/form-solicitud/` — **verificar contra inventario P0**.

**Estructura:**

```
form-solicitud/
├── index.tsx                          # Contenedor RHF + zod
├── seccion-a-origen.tsx               # Origen y contactos
├── seccion-b-propiedad.tsx            # Propiedad y unidades
├── seccion-c-personas.tsx             # Comprador y vendedor
├── seccion-d-producto.tsx             # Producto y financiero
├── bloque-unidad.tsx                  # Fila repetible de unidad
├── bloque-contacto.tsx                # Fila repetible de contacto
├── alert-errores.tsx                  # Alert destructivo REGLA B
└── validators.ts                      # zod schemas por sección
```

**Sección A — Origen**
- Banco originador (M_BANCOS lookup)
- N° de operación cliente
- Sucursal originadora
- Ejecutivo solicitante
- Canal (email / teléfono / WhatsApp / presencial)
- Ejec. Comercializador
- **Ejec. Formalizador** (nuevo v1.9, opcional)
- **Tipo de cliente de origen** (nuevo v1.9): correo_texto / correo_ficha / extranet
- Bloque repetible **Contactos de visita** (mínimo 1):
  - Rol (propietario / corredor / arrendatario / conserje / otro)
  - Nombre
  - Teléfono
  - Email
  - Estado del contacto (valido / no_contesta / telefono_erroneo)
  - Orden = índice + 1

**Sección B — Propiedad**
- Proyecto o condominio (obligatorio si `tipoPropiedad=nuevo`)
- Dirección (Google Places)
- **Origen de la dirección** (RN-46): ficha_cliente / certificado_avaluo / certificado_numero
- Región → Comuna (cascade sobre M_Comunas)
- Tipo de propiedad (M_TiposPropiedad)
- **Estado de conservación** (nuevo, sin_uso, bueno, normal, malo, deficiente)
- Bloque repetible **Unidades** (mínimo 1):
  - Depto / Torre / Piso
  - Modelo (solo si `tipoPropiedad=nuevo`)
  - Tipo de bien (M_TiposDeBien, 8 valores)
  - Con rol / Uso y goce (aplica a estacionamiento, bodega, terreno)
  - Rol SII (obligatorio si "con rol"; marca "en trámite" solo si nuevo)
  - Sup. construida m² + **origen** + adjunto respaldo
  - Sup. terraza m² + **origen** + adjunto respaldo
  - Sup. terreno m² + **origen** + adjunto respaldo
  - Ampliación m² + regularizable (checkbox)
  - Año construcción · Material

**Sección C — Personas de la operación**
- Comprador: RUT (módulo 11), nombre completo, email, teléfono
- Vendedor:
  - Si nuevo: Razón social, RUT, contacto, email, teléfono (jurídica)
  - Si usado: Nombre completo, RUT, contacto, email, teléfono (natural)
  - Origen del dato (RN-47): correo / ficha / certificado_avaluo

**Sección D — Producto y observaciones**
- Cliente institucional
- Tipo de informe (filtrado por `M_Clientes.tipos_informe_permitidos`)
- Banco financista (obligatorio si producto ∈ {Hipotecario, Refinanciamiento})
- Observaciones
- **Bloque Financiero** (colapsado por defecto, visible solo si `tipoPropiedad=nuevo`):
  - Valor total UF
  - Subsidio habitacional
  - Ahorro
  - Mutuo hipotecario
  - Pago contado
  - Bono captación
  - Bono integración
  - Precio de venta

**Validación — REGLA B**

Al hacer submit:
1. RHF valida con zod → si hay errores, `handleSubmit` no dispara el onSubmit.
2. En el `onError` de RHF, construir la lista de errores con etiquetas legibles:
   ```ts
   const errores = flattenErrors(formState.errors, {
     'unidades.0.sup_construida_m2': 'Unidad 1 · Superficie construida',
     // ...
   });
   ```
3. Disparar toast con los primeros 3 + "+N más".
4. Setear estado `alertErrores = errores` para renderizar `<AlertErrores />` al inicio del form.
5. Scroll al primer error.
6. Si zod pasó pero POST /api/solicitudes devuelve 422 → mismo tratamiento con `campos` del response.
7. Si POST devuelve 409 (`numero_operacion` duplicado) → `setError('numero_operacion', ...)` + toast específico + Alert.

### §5.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P4 del inventario.**
2. **Auditar:**
   ```bash
   grep -r "form-solicitud\|FormSolicitud\|useForm" components/console/
   ```
3. Crear los 9 archivos según §5.1 (o extender los existentes según inventario).
4. Contenedor `index.tsx`:
   - `useForm({ resolver: zodResolver(solicitudSchema), defaultValues: preLlenado })`
   - `useFieldArray` para `unidades` y `contactos_visita`
   - `onSubmit` → `POST /api/solicitudes` → si ok, cerrar wizard + toast éxito + navegar a `/solicitudes/[id]`
5. `AlertErrores`: componente shadcn `Alert` variant destructive con lista de campos + motivo.
6. `validators.ts`: schemas zod separados por sección + schema compuesto.
7. Los mensajes de zod están en español y son legibles para no-técnicos.
8. Bloques repetibles: botón `+ Agregar unidad` / `+ Agregar contacto`; botón `🗑 Eliminar` con `AlertDialog` si es el último.
9. Reutilizar componentes existentes según inventario: `RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `FileUploadZone`.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P4.md` con timestamp real.

### §5.3 Criterios de aceptación

- [ ] Submit con campos vacíos muestra toast **Y** Alert destructivo con nombres precisos ("Unidad 2 · Sup. construida" etc.).
- [ ] `numero_operacion` duplicado dispara error específico en ese campo + toast + Alert.
- [ ] Cambiar `tipoPropiedad` en Fase 2 y volver al form muestra/oculta bloque Financiero.
- [ ] Rol SII permite "en trámite" solo si `tipoPropiedad=nuevo`.
- [ ] Cada superficie exige `origen` + `adjunto_respaldo` (RN-45).
- [ ] Submit válido crea solicitud (mock ok), cierra wizard, navega al detalle.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P4.md` creado.

---

## §6 · P5 — Panel lista + vistas + filtros + búsqueda + orden

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. UI de lectura pura (no cambia estado de solicitudes). Edición libre, pausa en comandos de terminal.

### §6.1 Diseño

**Contexto.** Es el panel izquierdo del layout P2 Lista + Detalle (patrón v0.dev). Es la puerta de entrada a la app: sin él no hay forma de encontrar una solicitud salvo por URL directa. Consume `GET /api/solicitudes` con filtros server-side.

**Ubicación esperada:** `components/console/panel-lista/` — **verificar contra inventario P0**.

**Estructura:**

```
panel-lista/
├── index.tsx                       # Contenedor del panel izquierdo
├── tabs-vistas.tsx                 # 5 tabs con contadores
├── buscador.tsx                    # Input de búsqueda global (debounce 300ms)
├── filtros.tsx                     # Fila colapsable con 5 selectores
├── selector-orden.tsx              # DropdownMenu con 4 opciones
├── fila-solicitud.tsx              # Card por solicitud
├── paginacion.tsx                  # Prev/Next + info
└── hooks/
    ├── use-solicitudes.ts          # Fetch a /api/solicitudes con SWR o similar
    └── use-filtros-url.ts          # Sync estado ↔ query params
```

**Layout visual (basado en captura de referencia):**

```
┌───────────────────────────────────────────────────┐
│ Header VProperty          [🔍 Buscar por VP, RUT...] │
├───────────────────────────────────────────────────┤
│ [Mi cartera] [SLA riesgo ●3] [Por asignar ●1]    │
│ [Aprobadas] [Todas]                               │
├───────────────────────────────────────────────────┤
│ ⚙ Filtros ▲                    Orden: [SLA desc ▼]│
│ ┌─────────────┬─────────────┐                    │
│ │ Cliente     │ Tasador     │                    │
│ │ [Todos ▼]   │ [Todos ▼]   │                    │
│ ├─────────────┼─────────────┤                    │
│ │ Estado      │ Prioridad   │                    │
│ │ [Todos ▼]   │ [Todas ▼]   │                    │
│ ├─────────────┴─────────────┤                    │
│ │ Fecha solicitud            │                    │
│ │ [01 jun 2026 - 30 jun 2026]│                    │
│ └───────────────────────────┘                    │
├───────────────────────────────────────────────────┤
│ ▪ VP-2024-0081 · Banco Santander · Providencia   │
│   [Asignada] [SLA ●] [Normal] · María Espinoza   │
│ ▪ VP-2024-0080 · BCI · Las Condes                │
│   [Creada] [SLA ●] [Urgente] · Sin asignar       │
│ ...                                               │
├───────────────────────────────────────────────────┤
│ [◀ Anterior]  Página 1 de 4  [Siguiente ▶]       │
└───────────────────────────────────────────────────┘
```

**Tabs de vistas (con contadores):**

| Tab | Filtro server-side | Contador |
|---|---|---|
| Mi cartera | `ejec_comercializador = user.email` OR `ejec_formalizador = user.email` | Count |
| SLA en riesgo | `nivel_sla IN ('ambar', 'rojo')` | Badge rojo con count |
| Por asignar | `tasador_id IS NULL AND estado IN ('creada', 'requiere_atencion')` | Badge naranja con count |
| Aprobadas | `estado = 'aprobada'` | Count |
| Todas | sin filtro | Count |

Los contadores vienen de `GET /api/solicitudes/contadores` (ejecución paralela al fetch de la lista).

**Buscador (top-right, global):**
- Placeholder: `"Buscar por código VP-AAAA-NNNN, RUT o dirección"`.
- Ícono `Search` (lucide) a la izquierda.
- Debounce 300ms antes de disparar fetch.
- Query se envía como `?q=...` al endpoint.
- Server-side: `filterByFormula` de Airtable con `OR(FIND(q, codigo_vp), FIND(q, rut_comprador), FIND(q, direccion))`.
- Enter → dispara inmediatamente sin esperar debounce.
- Botón X para limpiar (aparece cuando hay texto).

**Filtros (colapsables, cerrados por defecto en móvil, abiertos en desktop):**
- Cliente: `Select` con `M_Clientes` (opción "Todos" al inicio).
- Tasador: `Select` con `M_Tasadores` (opción "Todos" + "Sin asignar" como opción especial).
- Estado: `Select` con enum `EstadoSolicitud`.
- Prioridad: `Select` con `PRIORIDAD` (Normal / Urgente / Crítico).
- Fecha solicitud: `DateRangePicker` de shadcn.
- Botón "Limpiar filtros" al final (visible cuando hay ≥1 filtro activo).

**Selector de orden (DropdownMenu):**
- SLA descendente (por defecto) — más urgentes primero
- SLA ascendente
- Fecha solicitud (más recientes primero)
- Prioridad (crítico → urgente → normal)

**Fila de solicitud (`FilaSolicitud`):**
- Código `VP-AAAA-NNNN` (link a `/solicitudes/[id]`)
- Cliente + comuna en 2ª línea
- `StateBadge` (reutilizar existente)
- `SLABadge` verde/ámbar/rojo con días restantes
- Badge de prioridad
- Nombre del tasador o "Sin asignar" (badge gris)
- Fecha vencimiento (formato relativo: "vence en 3 días")
- Fila **resaltada** cuando `params.id === solicitud.id` (patrón P2 Lista + Detalle: al hacer click, el panel derecho muestra el detalle P6).

**URL sync (`useFiltrosUrl`):**

Todos los filtros, orden, vista, búsqueda y página se sincronizan con `searchParams` de Next.js:

```
/solicitudes?vista=por_asignar&estado=creada&orden=sla_desc&q=VP-2024&page=2
```

Ventaja: la URL es compartible y el back/forward del navegador funciona. Usar `useRouter` + `useSearchParams` de `next/navigation`.

**Paginación:**
- Server-side: 20 filas por página (configurable).
- Botones "Anterior" / "Siguiente" + info "Página X de Y".
- No cargar todo al inicio.

### §6.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P5 del inventario.**
2. **Auditar:**
   ```bash
   grep -rn "TabsList\|TabsTrigger" components/console/
   grep -rn "SolicitudCard\|SolicitudRow\|SolicitudItem" components/console/
   grep -rn "DateRangePicker\|Calendar" components/ui/
   grep -rn "useSearchParams" app/ components/
   ```
3. Verificar que shadcn tenga instalados: `Tabs`, `Select`, `DropdownMenu`, `Command` (para el buscador si se hace command palette), `Calendar` + `DateRangePicker`, `Popover`.
4. Crear los archivos de §6.1 (o extender los existentes según inventario).
5. Hook `useSolicitudes`:
   - Fetch a `GET /api/solicitudes` con query params derivados del estado.
   - Refetch automático al cambiar filtros.
   - Loading skeleton mientras carga.
6. Hook `useFiltrosUrl`:
   - Lee `useSearchParams` al montar.
   - Al cambiar filtro, hace `router.push(?params)` sin recargar.
   - Exporta getters y setters tipados.
7. Buscador: implementar debounce 300ms con `useDeferredValue` o custom hook.
8. Cablear la vista `Mi cartera` con el email del usuario Clerk (`useUser().user.emailAddresses[0]`).
9. `FilaSolicitud` es un `Link` de Next.js a `/solicitudes/[id]` — cuando se hace click, el detalle (P6) aparece en el panel derecho.
10. Contadores de tabs: fetch paralelo a `GET /api/solicitudes/contadores` con SWR o `useEffect`.
11. Estado vacío: si `total === 0`, mostrar mensaje "No hay solicitudes que coincidan" + botón "Limpiar filtros".
12. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P5.md` con timestamp real.

### §6.3 Criterios de aceptación

- [ ] Click en tab cambia vista, actualiza URL (`?vista=...`), refresca lista.
- [ ] Contadores en tabs "SLA en riesgo" y "Por asignar" coinciden con el conteo real de Airtable.
- [ ] Buscar por código `VP-2024` filtra correctamente (debounce 300ms).
- [ ] Buscar por RUT del comprador funciona.
- [ ] Filtrar por Cliente + Prioridad se ve reflejado en la URL.
- [ ] Cambiar orden a "Fecha solicitud" reordena la lista.
- [ ] Rango de fechas filtra correctamente.
- [ ] Click en fila navega a `/solicitudes/[id]` y resalta la fila seleccionada.
- [ ] Recargar la página con `?vista=por_asignar&estado=creada` restaura el estado exacto.
- [ ] Paginación funciona (siguiente/anterior).
- [ ] Estado vacío se ve bien cuando no hay resultados.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P5.md` creado.

---

## §7 · P6 — Panel detalle (2 botones, 3 pestañas)

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. REGLAS A y C viven acá — edición libre, pausa obligatoria en comandos.

### §7.1 Diseño

**Ruta esperada:** `app/solicitudes/[id]/page.tsx` — **verificar contra inventario P0**.

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ Cabecera: VP-2026-XXXX · StateBadge · SLA · P  │
│ [Asignar Tasador]  [Documentos y Adjuntos]     │  ← REGLA A
│ [Editar solicitud]                              │  ← REGLA C (solo estado=creada)
├─────────────────────────────────────────────────┤
│ Tabs: [Datos] [Historial] [Adjuntos]           │
└─────────────────────────────────────────────────┘
```

**Barra de acciones — Lógica de visibilidad (REGLAS A + C):**

```ts
const puedeAsignar =
  !solicitud.tasador_id &&
  !['cancelada', 'cerrada'].includes(solicitud.estado);

const puedeEditar = solicitud.estado === 'creada';

const modoConsulta =
  solicitud.estado !== 'creada' && !!solicitud.tasador_id;
```

- **"Asignar Tasador"** visible solo si `puedeAsignar`. Deshabilitado con tooltip si `datosMinimosFaltantes.length > 0`.
- **"Documentos y Adjuntos"** siempre visible tras crear solicitud.
- **"Editar solicitud"** visible solo si `puedeEditar`.

**Cálculo de `datosMinimosFaltantes` (RN-44):**

```ts
function calcularFaltantes(s: Solicitud): string[] {
  const f: string[] = [];
  if (!s.direccion) f.push('Dirección de la propiedad');
  if (!s.contactos_visita.some(c => c.telefono)) f.push('Al menos 1 contacto con teléfono');
  const rolValido = s.unidades.every(u =>
    !u.con_rol || u.rol_sii || (u.rol_sii_en_tramite && s.tipo_propiedad === 'nuevo')
  );
  if (!rolValido) f.push('Rol SII (o "en trámite" si es Nuevo)');
  return f;
}
```

**Pestaña Datos (10 bloques según §1.3.2 spec v1.9):**

1. Origen y cliente
2. Asignación (tasador, fecha, correo, botones Ver email / Reenviar)
3. Propiedad
4. Vendedor
5. Unidades (tabla)
6. Personas de la operación
7. Contactos de visita
8. Datos SII
9. Antecedentes legales
10. Producto y financiero
11. Decisión del motor (opcional 11º)

Cada bloque es un componente `<BloqueXxx solicitud={s} readOnly={modoConsulta} />`.

**Pestaña Historial:** timeline que renderiza `A_Eventos` + `A_Cambios` con `EventTimeline` (ya existente según inventario).

**Pestaña Adjuntos:** listado readonly de `TX_Adjuntos` con visor embebido. Sin subida (esa vive en el Sheet del botón).

### §7.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P6 del inventario.** Si `BarraAcciones` ya existe con lógica de Reglas A/C, extenderla; no rehacerla.
2. **Auditar:**
   ```bash
   ls app/solicitudes/
   grep -r "BarraAcciones\|action-bar" components/console/
   ```
3. Crear `app/solicitudes/[id]/page.tsx` como server component que hace fetch a `/api/solicitudes/[id]`.
4. Crear `components/console/detalle-solicitud/` (o ruta según inventario):
   ```
   ├── index.tsx                # Client component con Tabs
   ├── barra-acciones.tsx       # 2-3 botones con lógica de visibilidad
   ├── tab-datos.tsx            # 10 bloques
   ├── tab-historial.tsx        # EventTimeline
   ├── tab-adjuntos.tsx         # ListadoAdjuntos readonly
   ├── bloques/
   │   ├── bloque-origen.tsx
   │   ├── bloque-asignacion.tsx
   │   ├── bloque-propiedad.tsx
   │   ├── bloque-vendedor.tsx
   │   ├── bloque-unidades.tsx
   │   ├── bloque-personas.tsx
   │   ├── bloque-contactos.tsx
   │   ├── bloque-sii.tsx
   │   ├── bloque-legales.tsx
   │   └── bloque-producto.tsx
   └── hooks/
       └── use-datos-minimos.ts # Calcula faltantes + retorna tooltip
   ```
5. `BarraAcciones` incluye tooltip con lista de faltantes cuando "Asignar Tasador" está deshabilitado.
6. `Editar solicitud` abre el mismo Sheet del wizard pero directo en Fase 3 con `defaultValues=solicitud`. Endpoint PATCH.
7. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P6.md` con timestamp real.

### §7.3 Criterios de aceptación

- [ ] Solicitud sin tasador en estado `creada`: muestra "Asignar Tasador" + "Editar solicitud" + "Documentos y Adjuntos".
- [ ] Solicitud con tasador en estado `asignada`: solo muestra "Documentos y Adjuntos". Todo en modo consulta.
- [ ] Falta la dirección: "Asignar Tasador" deshabilitado con tooltip "Falta: Dirección de la propiedad".
- [ ] Solicitud cancelada: "Asignar Tasador" no aparece.
- [ ] Pestaña Historial muestra eventos ordenados por fecha desc.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P6.md` creado.

---

## §8 · P7 — Diálogo de asignación (cmdk + RN-44/RN-59)

> **⚙ Modo Claude Code recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Es el único P que cambia el **estado real** de una solicitud (`creada → asignada`) y dispara correo al tasador. Antes de cada edición **y** cada comando, Claude Code muestra qué va a hacer y pide confirmación explícita.

### §8.1 Diseño

**Ubicación esperada:** `components/console/dialogo-asignacion/` — **verificar contra inventario P0**.

**Estructura:**

```
├── index.tsx                    # Dialog contenedor 2 pasos
├── paso-1-buscador.tsx          # cmdk con lista de tasadores
├── paso-2-confirmacion.tsx      # Enunciado de consecuencias
└── item-tasador.tsx             # Card en el buscador
```

**Paso 1 — Buscador (cmdk):**
- `Command` de cmdk con `CommandInput` (buscar por nombre o RUT).
- `CommandList` con dos grupos:
  - **En cobertura** (comuna de solicitud ∈ `tasador.zonas_cobertura`): ordenados por carga ascendente.
  - **Fuera de cobertura** (los demás): con badge ámbar `⚠ Fuera de cobertura`.
- Cada `CommandItem` muestra:
  - Nombre · RUT
  - Carga: `casos_en_curso / capacidad_activa` con barra visual
  - Badges: comunas cubiertas, activo
- Al seleccionar → habilita botón "Siguiente".
- Campo `motivo` (opcional, textarea 200 chars).

**Paso 2 — Confirmación (REGLA A):**
- Título: "Confirmar asignación de tasador"
- Cuerpo: enunciado explícito:
  > Al confirmar:
  > - La solicitud pasará al estado **asignada**.
  > - Se registrará la fecha y hora de asignación.
  > - Se enviará el correo de asignación al tasador.
  > - Los datos de la solicitud quedarán en **modo consulta**.
- Si el tasador está fuera de cobertura: `Alert` ámbar "Override informado: fuera de cobertura".
- 2 botones: `[Cancelar]` `[Confirmar asignación]`.

**Al confirmar (secuencia atómica):**
1. `POST /api/solicitudes/[id]/asignar` con `{ tasador_id, motivo? }`.
2. Backend valida `datosMinimosFaltantes = []` en server (defensivo). Si no, 422.
3. Backend dispara webhook Make SC-Asignar (que hace):
   - `TX_Solicitudes.tasador_id` = X
   - `TX_Solicitudes.fecha_asignacion` = NOW
   - `TX_Solicitudes.estado` = `asignada`
   - Insert en `A_Eventos`: `asignacion_manual`
   - Dispara **SC05** (envío del correo · **§9.5**), que es quien escribe
     `correo_asignacion_enviado` **sólo si el correo salió de verdad**
4. Front recibe 200 → toast éxito + refresh del detalle → botón "Asignar Tasador" desaparece (REGLA A).

**Fetch de candidatos:**
- Al abrir el diálogo: `GET /api/tasadores/candidatos?comuna=X` devuelve todos ordenados (cobertura primero, luego carga).

### §8.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P7 del inventario.**
2. **Auditar:**
   ```bash
   grep -r "cmdk\|Command\b\|dialogo-asignacion" components/
   ```
3. Verificar que `cmdk` esté en `package.json` (venía de v0.dev).
4. Crear los 4 archivos según §8.1 (o extender los existentes según inventario).
5. Cablear con `BarraAcciones` de P6: `onClick={() => setDialogoAbierto(true)}`.
6. En el `POST /api/solicitudes/[id]/asignar` (creado en P2), validar server-side:
   - `datosMinimosFaltantes = []`
   - `!solicitud.tasador_id` (idempotencia REGLA A: si ya tiene, 409)
   - `estado ∈ {creada, requiere_atencion}`
7. Al éxito: `router.refresh()` o re-fetch del detalle.
8. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P7.md` con timestamp real.

### §8.3 Criterios de aceptación

- [ ] Diálogo abre con Paso 1. Buscador filtra por nombre y RUT.
- [ ] Grupo "En cobertura" aparece arriba, con carga visible.
- [ ] Elegir tasador fuera de cobertura muestra Alert ámbar en Paso 2.
- [ ] Confirmación cambia estado a `asignada`, oculta botón "Asignar Tasador", muestra bloque Asignación con datos.
- [ ] Segundo intento de asignar (si por error se muestra el botón) devuelve 409.
- [ ] Historial muestra evento `asignacion_manual`. El `correo_asignacion_enviado` lo aporta
      SC05 (§9.5) y sólo aparece si el correo salió — su ausencia con SC05 sin provisionar es
      el comportamiento correcto, no un fallo de P7.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P7.md` creado.

---

## §9 · P8 — Sheet Documentos y Adjuntos

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Sube archivos a Dropbox. Bajo riesgo si RF-09 ya funciona. Pausa antes de cualquier comando.

### §9.1 Diseño

**Ubicación esperada:** `components/console/sheet-documentos/` — **verificar contra inventario P0**.

**Estructura:**

```
├── index.tsx              # Sheet lateral
├── checklist.tsx          # 15 tipos de documento
├── zona-carga.tsx         # FileUploadZone reutilizado
└── item-documento.tsx     # Fila del checklist
```

**Trigger:** botón "Documentos y Adjuntos" de la barra de acciones (P6).

**Layout del Sheet:**

```
┌─────────────────────────────────────┐
│ Documentos y Adjuntos               │
│ Solicitud VP-2026-XXXX              │
├─────────────────────────────────────┤
│ ▸ Checklist (15 tipos)              │
│   ☐ Ficha del cliente               │
│     ├─ (archivo o botón "Subir")    │
│   ☐ Certificado avalúo fiscal        │
│     ├─ (archivo o botón "Subir")    │
│   ... 15 filas                       │
├─────────────────────────────────────┤
│ ▸ Zona de carga libre                │
│   [FileUploadZone]                   │
└─────────────────────────────────────┘
```

**Fuente del checklist:** `D_TipoDocumento` filtrando `activo=true` → 15 tipos operativos (§4.2.1 spec v1.9).

Cada fila muestra:
- Checkbox marcado (adjunto declarado)
- Nombre del tipo
- Entidad emisora
- Vigencia por defecto
- Si hay archivo asociado: mini-preview + botón "Ver" + botón "Reemplazar" + botón "Eliminar"
- Si no hay archivo: botón "Subir archivo"

**Comportamiento:**
- Marcar un tipo sin archivo → estado "requerido, no subido" (no bloquea nada).
- Subir archivo → `POST /api/adjuntos` (ya existe RF-09) con `tipo_documento_id`.
- Desmarcar un tipo con archivo → `AlertDialog` de confirmación. Al confirmar, el sistema **borra la fila de `TX_Adjuntos` y elimina el binario de Dropbox** vía `SC-Adjuntos-Delete` (RF-52 · §8.6 de la Especificación). No es una desvinculación: el archivo desaparece. El confirm del `AlertDialog` es la única barrera, así que su redacción debe decir que se elimina, no que se descarta un vínculo.
- **Modo consulta si `modoConsulta=true`:** solo visor y descarga, sin subir ni editar.

> **Nota de diseño (v1.6) — Nivel Unidad en el path Dropbox.**
> Con la reestructura §8 de spec v1.9.6 el path incorpora un nivel `{Unidad}`. En el sheet
> del checklist P8 se resuelve así:
> (a) si la solicitud tiene UNA sola unidad, se auto-deriva (`TX_Adjuntos.unidad` = esa única
> unidad);
> (b) si tiene DOS O MÁS, aparece un selector por fila con las unidades declaradas + opción
> "común" (documentos multi-unidad, carpeta hermana `comun/` de v1.9.6 D8);
> (c) documentos subidos por IF-01 o Fase 1 del wizard antes de declarar unidades caen en
> `_ingreso/` de forma permanente (v1.9.6 D10).
> La implementación de esta captura de unidad depende de CI-003 (migración del path
> implementado). Hasta CI-003, el sheet opera sin capturar unidad; ver §13.

### §9.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P8 del inventario.**
2. **Auditar:**
   ```bash
   grep -r "sheet-documentos\|Checklist\|D_TipoDocumento" components/ lib/
   ```
3. Crear los 4 archivos según §9.1 (o extender los existentes).
4. Reutilizar `FileUploadZone` existente (ruta según inventario).
5. `GET /api/catalogos/tipos-documento` para llenar el checklist (crear si no existe).
6. Estado del checklist deriva de `solicitud.adjuntos` — no requiere endpoint extra.
7. Cablear con `BarraAcciones`: `<SheetDocumentos solicitud={s} readOnly={modoConsulta} />`.
8. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P8.md` con timestamp real.

### §9.3 Criterios de aceptación

- [ ] Sheet abre con 15 tipos de documento listados.
- [ ] Subir archivo lo asocia al tipo correcto y muestra preview.
- [ ] Desmarcar tipo con archivo pide confirmación.
- [ ] En modo consulta: no aparecen botones de subir/eliminar; solo Ver/Descargar.
- [ ] Cerrar Sheet no pierde archivos ya subidos.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P8.md` creado.
- [ ] Desmarcar un tipo con archivo confirma el `AlertDialog` y produce borrado real: la fila de `TX_Adjuntos` deja de existir y el binario ya no está en Dropbox (verificable en Airtable y en Dropbox por `url_dropbox`).

---

## §9.5 · P8.5 — Correo de asignación al tasador (SC05)

> **⚙ Modo Claude Code recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. P8.5 emite comunicación real hacia fuera de la organización. Un error aquí no se ve en la consola: se ve en la bandeja de un tasador. Antes de cada edición y cada comando, Claude Code muestra qué va a hacer y pide confirmación.
> **Posición.** Va después de P8 y antes de P9 por dependencia dura: el correo lleva los adjuntos de `TX_Adjuntos` como enlace a Dropbox (§1.6.3 de la Especificación), y esos adjuntos se guardan de forma confiable recién en P8. Mismo criterio con que P0.5 se insertó entre P0 y P1.

### §9.5.1 Diseño

#### Nombre del escenario y resolución de una contradicción documental

La Especificación v1.9.4 titula §1.6.3 *"Correo de asignación al tasador (SC13)"*, pero
`CLAUDE.md` declara **SC13 fuera de alcance de CU-002** y asigna a **SC05** la notificación
al tasador; `docs/diseno.md` §278 y §546 dicen lo mismo. No es una contradicción real: el
SC13 que CLAUDE.md excluye es el de **reasignación, prioridad y pausa**, flujos que v1.9 no
tiene (§1.6: *"No hay trigger de reasignación"*). El correo de **primera asignación** sí está
en alcance.

**Decisión: el escenario se llama `SC05`.** Se conserva `SC13` únicamente como referencia
cruzada en el texto de la Especificación. Toda mención a "SC13" en este plan que se refiera
al correo de asignación queda corregida a SC05 (§8.1, §10.4.1, §10.4.3).

#### Trigger — escenario propio encadenado desde SC-Asignar

Tres opciones evaluadas:

| Opción | A favor | En contra |
|---|---|---|
| Inline al final de SC-Asignar | Un solo escenario, un solo import | **Acopla la transición de estado al envío.** Si Gmail falla, SC-Asignar aborta; el rollback de Make **no deshace** el `Update` de Airtable ya ejecutado (m2), y la solicitud queda `asignada` con el webhook respondiendo error. La consola muestra fallo sobre una asignación que sí ocurrió. |
| Webhook desde la UI post-asignación | Control fino del reintento | Dos llamadas de red desde Next para una sola acción de negocio, y la UI pasa a orquestar. Contradice *"la UI muestra y captura; nunca decide"* y la regla de que las escrituras van por Make. |
| **Escenario propio SC05, invocado por SC-Asignar como último paso** ✅ | La asignación **nunca** falla porque el correo falló. Da un segundo punto de entrada gratis para el *Reenviar* manual de §1.6.3 sin tener que "asignar de nuevo". Aísla la conexión de correo del escenario que toca el estado. | Un webhook y un import más. |

**Elegida la tercera.** SC-Asignar gana un módulo `HTTP · Make a request` al final que hace
`POST` al webhook de SC05 y **no espera** el resultado del envío (timeout corto, error
tolerado por el `maxErrors: 3` del escenario). El webhook y el scenario ID de SC-Asignar
**no se tocan** — sólo se agregan y quitan módulos dentro del blueprint existente.

#### Deuda que P8.5 corrige en SC-Asignar

`SC-Asignar.blueprint.json` **m4** crea hoy un `A_Eventos` con
`tipo_evento = correo_asignacion_enviado` y descripción *"Correo de asignación enviado al
tasador {{1.tasadorId}}"* — **sin que exista ningún módulo de correo en el escenario**. El
evento se escribe siempre, aunque no se haya enviado nada. Es exactamente el patrón que
`docs/aprendizajes.md` prohíbe: un registro de éxito indistinguible de un éxito real.

**m4 se elimina de SC-Asignar y su evento se reemite desde SC05, condicionado al envío
efectivo.** m3 (`asignacion_manual`) se conserva sin cambios.

#### Origen de los datos — verificado vía MCP contra `app9G7lLkIV3CpeLa`

**Cero campos nuevos.** Todo lo que el correo necesita ya existe en el schema:

| Bloque §1.6.3 | Campo real | Tabla · FIELD_ID |
|---|---|---|
| Empresa (cliente institucional) | `cliente` → link | `TX_Solicitudes.fldttL5myzLohDwHv` → `M_Clientes` |
| N° Interno | `nro_interno` | `fldVmmYBH2Ierbs9N` |
| N° Solicitud | `numero_solicitud` | `fldISkFfKlfP4BLhv` |
| Fecha de Solicitud | `fecha_solicitud` | `fldvkn9CsORy4eU0Z` |
| Código VP | `codigo_ext` (formula) | `fldSuJx1fDNYYwDcD` |
| Dirección | `direccion` | `fldKP0yxwQkSdrFuZ` |
| Proyecto (sólo si Nuevo) | `proyecto_condominio` | `fldbmGmyMHOtfX2Az` |
| Marca Nuevo/Usado | `nuevo_usado` · `tipo_propiedad_nuevo_usado` | `fld24mFTP2pmh2qDK` · `fldHxx1P1ao33PWrl` |
| Comuna | `comuna` → link | `fldJTjjzCPBHMOWZv` → `M_Comunas` |
| Valor estimado | `monto_estimado_uf` | `fldKZW799xIqMFN1I` |
| Tabla de unidades con roles | `TX_Unidades` | `numero_unidad` `fldJGXS8jGDKZDdWM` · `subtipo` `fldNU8ee30AvvRWHZ` · `rol_sii` `fldC5yUYC2wTTLJBV` |
| Comprador y RUT | `cliente_final_nombre` · `cliente_final_rut` | `fld7jxcbmMYz6kmbj` · `fldwNEPL8fXkWwUBd` |
| Vendedor y RUT | `vendedor_razon_social_o_nombre` (fallback `vendedor_nombre`) · `vendedor_rut` | `fldNkFwB5p3Mljtrg` · `fldfUXb9vzxklu8ES` · `fldrITDFkbk95Da00` |
| Ejec. Formalizador | `ejecutivo_formalizador` | `fldM9ELuMvgRwbmUn` |
| Ejec. Comercializador | `ejecutivo_comercializador` | `fldDP232hBLsZ0PWJ` |
| Contactos de visita | `TX_ContactosVisita` ordenados por `orden_prioridad` | `nombre` `fldOTpkaWOkkxzJoc` · `telefono` `fld8Rai7BCgfKS8F8` · `email` `fldHTPcQgIvAP6QlP` · `rol` `fldeTuIlU6uxDYwHY` · `orden_prioridad` `fldL93B1kOZZ1pNFs` |
| Observaciones | `observaciones_internas` | `fldjmx9pLOyJKx1Mw` |
| Adjuntos (enlace Dropbox) | `TX_Adjuntos.url_dropbox` | `fldEccoUrOjV7oKZ5` · filtrar por `solicitud` `fldZTVpXDRtXXPjyv` |
| Hilo de correo (RN-52) | `email_thread_id` **ya existe** | `TX_Solicitudes.fldhy81fNSE5CF2Tc` |

**Destinatario — corrección a un supuesto habitual.** El email del tasador **no** requiere
saltar a `AUTH_Usuarios`: vive directo en **`M_Tasadores.email` (`fldsUu1pJ92HdYQUD`, tipo
`email`)**. `M_Tasadores` **no tiene link a `AUTH_Usuarios`** (18 campos verificados, ninguno
apunta a `tblbX3hPD2uhqhl5v`). `AUTH_Usuarios` es la tabla de la **Ejecutiva**
(`clerk_user_id`), y se usa sólo para poblar el actor del evento — como ya hace m24 de
SC-Edicion.

**Si el tasador no tiene email cargado** (campo vacío): **no se envía y no se miente**.
`TX_Notificaciones` con `estado_envio = Error` y `mensaje_error = "Tasador sin email en
M_Tasadores"`; `A_Eventos` con `correo_asignacion_fallido`; `LogEscenarios` con
`Estado = ⚠ Parcial`. **La asignación queda firme** — es una falla de dato maestro, no de la
acción de la Ejecutiva. La consola lo muestra según §9.5.1 · UI.

#### Plantilla — vive en Airtable, no en el blueprint

La Especificación §1.6.3 dice que la plantilla `email_asignacion_tasador` se registra en
`C_Plantillas` y se refiere desde `C_NotificacionesConfig` (§5.3). **Divergencia detectada:**
`C_Plantillas` está modelada para documentos Carbone/DOCX (`url_dropbox`,
`template_id_carbone`, `formato_salida`) — no tiene ningún campo donde quepa un cuerpo HTML.
`C_NotificacionesConfig` **sí**: `plantilla_asunto` (`fldU5XOoslBPz2NFj`) y `plantilla_cuerpo`
(`fldQro7jvi3RlxDs0`, multilineText).

**Decisión: la fuente de runtime es `C_NotificacionesConfig`.** SC05 lee de ahí. Si Sergio
quiere honrar la letra de la Especificación, se agrega una fila espejo en `C_Plantillas` con
`codigo = email_asignacion_tasador` que apunte a la config — pero SC05 no la lee. Queda
registrado como divergencia a documentar en `docs/schema-airtable.md`.

**Asunto (es-CL):**

```
Nueva tasación asignada · {codigo_ext} · {comuna} — {direccion}
```

**Cuerpo:** HTML simple, sin CSS externo ni imágenes remotas (los clientes de correo los
bloquean), tablas para el bloque de unidades y el de contactos. Voz en segunda persona
singular, sin signos de exclamación, según §6.1 del Blueprint. Las **siete respuestas de la
llamada** quedan nombradas sin enumerar mientras §15 · D-11 siga abierto — la plantilla trae
el literal *"Siete respuestas de la llamada (pendiente de definición con el cliente)"*.

Variables dinámicas: `{{codigo_ext}}`, `{{empresa}}`, `{{nro_interno}}`,
`{{numero_solicitud}}`, `{{fecha_solicitud}}`, `{{direccion}}`, `{{proyecto}}`, `{{comuna}}`,
`{{monto_estimado_uf}}`, `{{nuevo_usado}}`, `{{tabla_unidades}}`, `{{comprador}}`,
`{{comprador_rut}}`, `{{vendedor}}`, `{{vendedor_rut}}`, `{{ejec_formalizador}}`,
`{{ejec_comercializador}}`, `{{tabla_contactos}}`, `{{observaciones}}`,
`{{lista_adjuntos}}`, `{{tasador_nombre}}`.

#### Logo corporativo del pie — imagen embebida por CID

El pie de `plantilla_cuerpo` cierra con la línea `www.valueproperty.cl` y debajo lleva el
logo de la empresa. La imagen **no se referencia por URL**: viaja dentro del propio mensaje
como adjunto inline con `Content-ID`, y el HTML la invoca con `src="cid:logo-vproperty"`.

Tres alternativas evaluadas:

| Alternativa | A favor | En contra |
|---|---|---|
| URL pública (`<img src="https://…/logo.png">` o link directo de Dropbox) | Cero cambios en el blueprint; se edita sólo la plantilla | Introduce una **dependencia de red permanente en cada apertura del correo**, fuera de nuestro control y para siempre: si el hosting cae o el link de Dropbox rota, todos los correos ya enviados quedan con la imagen rota, incluidos los del archivo histórico. Outlook de escritorio bloquea imágenes externas por defecto en remitentes no confiables. Contradice el criterio ya fijado en esta misma sección — *"sin CSS externo ni imágenes remotas"* |
| **Adjunto inline por CID, con el binario embebido en base64 en el blueprint** ✅ | Se renderiza en Gmail, Outlook de escritorio, Outlook web y clientes móviles **sin pedir permiso**, porque la imagen es parte del mensaje y no un recurso externo. Sobrevive a cualquier caída de hosting. El correo queda autocontenido y sigue siendo legible dentro de diez años | El blueprint carga ~30 KB de base64; hay que regenerarlo si el logo cambia (operación de minutos, una vez) |
| `data:` URI en el `src` del `<img>` | Sin adjunto y sin red | **Gmail lo bloquea sin excepción**, web y móvil, y Outlook de escritorio lo descarta. Descartada de entrada |

**Elegida la segunda, y sin módulo de descarga.** El punto que decide no es la
compatibilidad —CID y URL empatan en Gmail— sino **dónde vive el riesgo**. Con URL, el riesgo
es de runtime, recurrente y ajeno: cada correo depende de que un host responda. Con CID, el
riesgo es de configuración y se agota en la primera prueba de envío: el `data` del adjunto es
una constante, así que si el primer correo sale bien, salen todos.

Por la misma razón **no se agrega un `http:ActionGetFile` ni un módulo de Dropbox** para
traer el binario en tiempo de envío. Un fetch previo al módulo Gmail devolvería el riesgo de
runtime por la puerta de atrás y, con `maxErrors: 1` y sin auto-retry (ver *Política de
reintento* más abajo), **un logo que no descarga cancelaría la notificación al tasador**. Un
elemento decorativo no puede tener poder de veto sobre el mensaje: es el mismo principio con
el que SC05 se separó de SC-Asignar.

**Contrato en el módulo Gmail (m19).** `google-email:ActionSendEmail` v2 expone en su
`attachments` los tres campos necesarios — `fileName` (`filename`), `data` (`buffer`) y
**`cid` (`text`)** —, verificado contra el `expect` del módulo. El `mapper` queda:

```json
"attachments": [
  {
    "cid": "logo-vproperty",
    "data": "{{toBinary('__LOGO_BASE64__'; 'base64')}}",
    "fileName": "logo-vproperty.png"
  }
]
```

`__LOGO_BASE64__` es un marcador: se reemplaza por el base64 real del PNG **antes de
importar** (checkpoint M-7). `toBinary(valor; 'base64')` es la conversión texto→buffer de
Make; el campo `data` no acepta el base64 crudo.

**Bloque HTML del pie**, a insertar en `plantilla_cuerpo` inmediatamente después del `</p>`
que cierra la línea de `www.valueproperty.cl` y antes del párrafo *"Este correo se generó de
forma automática…"*:

```html
<p style="margin:10px 0 0">
  <img src="cid:logo-vproperty" alt="Tasaciones Value Property" width="160"
       style="display:block;width:160px;max-width:160px;height:auto;border:0;outline:none;text-decoration:none" />
</p>
```

El `width` como **atributo HTML** además del `style` no es redundante: el motor de renderizado
de Outlook de escritorio es Word y sólo respeta el atributo. El `alt` cubre la degradación —
si la imagen no carga, el pie sigue diciendo quién firma— y `display:block` evita la franja
de espaciado que los clientes agregan bajo las imágenes inline.

**Plan B documentado.** Si M-8 revelara que `toBinary` no produce un buffer válido en el
módulo Gmail de esta instancia, la caída es a la alternativa de URL pública: se vacía
`attachments` y el `<img>` pasa a `src="https://www.valueproperty.cl/img/logo-vproperty.png"`.
Se registra entonces como degradación en `docs/aprendizajes.md`, con su dependencia de
hosting explícita. **No** se cae a un módulo de descarga previo, por el motivo de arriba.

#### Proveedor de envío — verificar antes de crear

**Ninguna conexión de correo existe en los blueprints del repo.** Barrido de los 5
blueprints: `airtable` ×46 (conexión `8847431`), `dropbox` ×2 (conexión `7553318`),
`gateway`, `builtin`, `json`, `util`, `http`. Cero módulos de email.

Pero hay dos señales de que **sí existe una conexión de correo en la org 1594725**, fuera del
repo: `LogEscenarios.Escenario` tiene la opción **`E4_Notificacion_Email`** (parte del
pipeline PDF E1/E2/E3 que está ACTIVO), y la única fila de `C_NotificacionesConfig`
(`Notif_PDF_Listo_METLIFE`) declara `canal = gmail` con destinatario `info@valueproperty.cl`.

**Decisión: módulo Gmail · "Send an Email", reutilizando la conexión que ya usa E4.**
Motivo técnico decisivo: **RN-52 exige persistir `email_thread_id`**, y el módulo Gmail
devuelve `Thread ID` en su salida. Un módulo SMTP genérico no lo devuelve — con SMTP,
RN-52 quedaría degradada al `Message-ID`, que no agrupa hilo.

> **Checkpoint bloqueante para Sergio (A-1).** Verificar en la UI de Make, org 1594725, qué
> conexión de correo existe y de qué tipo. **No crear una conexión nueva antes de mirar.**
> Si no hay Gmail sino SMTP, se usa SMTP y RN-52 se marca como parcialmente cumplida en
> `docs/aprendizajes.md` — no se inventa un thread id.

#### Idempotencia — clave natural en `TX_Notificaciones`

`TX_Notificaciones` ya tiene todo lo necesario (21 campos verificados): `clave_notif`
(`fldtXBuomgmFyvW2o`), `evento` (`fldBjsSHZCSWe6PSK`, con la opción **`solicitud_asignada`**
ya existente), `canal` (`fldCEWGR5NOqqsEws`, con `email` y `gmail`), `destinatarios_to`,
`asunto`, `cuerpo_renderizado`, `enviado_en`, `estado_envio` (`Pendiente` · `Enviado` ·
`Error` · `Reintentando`), `intentos`, `mensaje_error`, `solicitud`, `config_origen`.

```
clave_notif = {codigo_ext}::solicitud_asignada::v1        ← envío automático
clave_notif = {codigo_ext}::solicitud_asignada::reenvio-{n}  ← reenvío manual
```

SC05 **abre** con un `Search Records` sobre `TX_Notificaciones` por `clave_notif`. Si existe
con `estado_envio = Enviado` → **no envía**, escribe `LogEscenarios` con `Estado = ⏭ Omitido`
y responde 200. Eso cubre los tres vectores de doble envío: reintento de Make, doble POST de
SC-Asignar, y doble clic de la Ejecutiva.

> **Trampa conocida.** La fórmula del `Search` **no** puede comparar contra el link
> `solicitud`: un campo Link se evalúa contra el *primary field* de la tabla destino, no
> contra el record ID (`docs/aprendizajes.md` E-076). Por eso la clave es un
> `singleLineText` propio y la fórmula compara texto contra texto.

#### Manejo de errores y reintentos

| Superficie | Éxito | Sin email del tasador | Fallo del proveedor |
|---|---|---|---|
| `TX_Notificaciones` | `estado_envio = Enviado`, `enviado_en = now`, `intentos +1` | `Error` + `mensaje_error` | `Error` + `mensaje_error` + `intentos +1` |
| `A_Eventos` | `correo_asignacion_enviado` | `correo_asignacion_fallido` | `correo_asignacion_fallido` |
| `LogEscenarios` | `Escenario = Email tasador`, `Estado = ✓ OK` | `⚠ Parcial` | `✗ Error` |
| `TX_Solicitudes` | `email_thread_id` ← Thread ID | sin cambio | sin cambio |

**`LogEscenarios.Escenario` ya tiene la opción `Email tasador` (`selj0DlOlp4kvZjnF`) y
`Estado` ya tiene `✓ OK` · `✗ Error` · `⚠ Parcial` · `⏭ Omitido`.** No hay que crear
opciones — lo que importa porque `typecast: true` sobre una opción inexistente **intenta
crearla** y revienta con `Insufficient permissions to create new select option` si el token
no tiene scope de schema (`docs/aprendizajes.md` E-088/E-089).

**Política de reintento: ninguno automático.** `maxErrors` del escenario en 1 y sin
auto-retry. Un correo reintentado por Make sin control es un correo duplicado en la bandeja
del tasador. El reintento es **manual y explícito** vía el botón *Reenviar* de §1.6.3, que
incrementa el sufijo de `clave_notif`.

#### UI — no es 100% backend

Dos cosas obligan a tocar UI, y ninguna es cosmética:

1. **Degradación honesta.** Si el correo no salió, la consola tiene que decirlo. Sin esto, la
   Ejecutiva cree que el tasador fue notificado cuando no lo fue — el mismo defecto que m4 de
   SC-Asignar introdujo en Airtable, trasladado a la pantalla.
2. **§1.6.3 exige un trigger manual de reenvío** en el bloque Asignación (§1.3.2).

**Alcance mínimo (Tanda C), dentro del bloque Asignación ya existente del detalle:**

- Badge de estado del correo: `Enviado {fecha}` (verde `#15803D`) · `No enviado` (ámbar
  operacional `#D97706`, nunca el naranja de marca) · `Sin email del tasador` (ámbar, con el
  motivo en tooltip).
- Botón **Reenviar correo** — Regla D completa: `disabled` durante la operación,
  `<Loader2 data-icon="inline-start" className="animate-spin" />`, texto a `"Reenviando…"`
  con `…` U+2026, reset en `finally`.
- Regla B en el resultado: toast sonner en éxito, `Alert` destructive en error, con el
  literal §6 **"No pudimos completar la acción. Intenta nuevamente en unos segundos."**

**Dependencia con D-09.** El *Panel Asignar Tasador* (D-09) está postergado sin fecha
(`docs/construccion.md` §89). Tanda C **no lo desbloquea ni lo anticipa**: se limita al bloque
Asignación que ya existe. Si D-09 se retoma después, el badge y el botón se mueven con él.
**Si Sergio prefiere no tocar UI en esta iteración, Tandas A y B son entregables por sí
solas** — el correo sale y queda auditado; lo único que falta es que la consola lo muestre.

**Lectura del estado:** `GET /api/solicitudes/[id]` se extiende para devolver
`correo_asignacion: { estado, enviado_en, motivo_error }` leyendo `TX_Notificaciones` por
`clave_notif`. Token Airtable **server-side**, como todo el resto.

### §9.5.2 Construcción — Tandas

#### Tanda A · Preparación (sin código)

1. **A-1 · Verificar la conexión de correo en Make** (Sergio, bloqueante). Org 1594725 →
   Connections. Anotar tipo (Gmail / SMTP / otro) y nombre exacto. Si es Gmail, anotar el
   `__IMTCONN__` para el blueprint.
2. **A-2 · Crear la fila de configuración en `C_NotificacionesConfig`** (vía MCP, es dato, no
   schema): `nombre = Notif_Asignacion_Tasador`, `evento = solicitud_asignada`,
   `canal = gmail` (o `email` según A-1), `destinatarios_to_modo = campo_cliente`,
   `destinatario_campo = M_Tasadores.email`, `activa = true`, más `plantilla_asunto` y
   `plantilla_cuerpo` de A-3.
3. **A-3 · Redactar asunto y cuerpo HTML** en es-CL según §9.5.1, con las siete respuestas
   nombradas sin enumerar (§15 · D-11 abierto). El pie cierra con el bloque `<img>` de
   `cid:logo-vproperty` definido en *Logo corporativo del pie*.
4. **A-4 · Confirmar que no hace falta ningún campo nuevo.** Ya verificado vía MCP:
   `email_thread_id`, `TX_Notificaciones.*` y la opción `Email tasador` de `LogEscenarios`
   existen. Re-verificar sólo si el schema cambió desde el 31-jul-2026.

**Criterios de aceptación de Tanda A:** conexión identificada y anotada; una fila en
`C_NotificacionesConfig` con `activa = true`; cero campos nuevos creados en Airtable.

#### Tanda B · Construcción (blueprints)

5. **B-1 · `docs/_artefactos/make/SC05-EmailTasador.blueprint.json`**, escenario nuevo:

```
m1  Webhook (hook nuevo)                     ← { solicitudId, codigoSolicitud, tasadorId,
                                                 ejecutivaClerkId, reenvio? }
m2  Search TX_Notificaciones por clave_notif  → guard idempotencia
m3  Search TX_Solicitudes (campos del correo)
m4  Search M_Tasadores (nombre + email)
m5  Search TX_ContactosVisita  → Aggregator (orden_prioridad ASC)
m6  Search TX_Unidades         → Aggregator
m7  Search TX_Adjuntos         → Aggregator (url_dropbox)
m8  Search C_NotificacionesConfig (evento = solicitud_asignada, activa = true)
m9  Router
    ├ ruta 1 · sin email del tasador   → TX_Notificaciones(Error) + A_Eventos(fallido) + Log(⚠)
    ├ ruta 2 · ya enviado              → Log(⏭ Omitido)
    └ ruta 3 · envío
        m10 Gmail · Send an Email
        m11 Update TX_Solicitudes.email_thread_id ← {{m10.threadId}}   (RN-52)
        m12 Create TX_Notificaciones (Enviado)
        m13 Create A_Eventos (correo_asignacion_enviado)
        m14 Create LogEscenarios (Email tasador · ✓ OK)
m15 WebhookRespond 200
```

6. **B-2 · Modificar `SC-Asignar.blueprint.json`** — aditivo, sin tocar hook `3441086`:
   - **Eliminar m4** (el `A_Eventos` de correo que miente).
   - **Agregar** `http:ActionSendData` al final, `POST` a `MAKE_WEBHOOK_URL_SC05` con el
     payload de B-1 y firma HMAC (D-03), timeout corto, error tolerado.
   - Bump del `name` a `SC-Asignar v2.0 - Asignacion de tasador`.

7. **B-3 · Verificación de integridad del blueprint antes de entregar**, con el
   procedimiento que cerró F-1: contrastar las **claves del `mapper`** de cada módulo Airtable
   contra un hermano de la misma app y misma `version` probado en producción (`id` para el
   record ID en `ActionUpdateRecords` y `ActionDeleteRecord`; `record` como collection en
   `ActionCreateRecord`), y verificar el **namespace de los operadores** de todo filtro
   (`text:notequal`, `number:equal`; `exist` es la única excepción sin namespace).

8. **B-4 · `pnpm tsc --noEmit` y `pnpm build` limpios** antes de cerrar la tanda.

**Criterios de aceptación de Tanda B:** los dos `.json` existen y parsean; `SC-Asignar`
conserva hook `3441086` y conexión `8847431`; no queda ningún `A_Eventos` de correo fuera de
SC05; B-3 documentado en el reporte de la tanda.

#### Tanda C · UI (condicionada — ver §9.5.1 · UI)

9. **C-1 · Extender `GET /api/solicitudes/[id]`** con `correo_asignacion`.
10. **C-2 · Badge de estado** en el bloque Asignación del detalle.
11. **C-3 · Botón "Reenviar correo"** con Regla D completa y Regla B en el resultado.
12. **C-4 · `POST /api/solicitudes/[id]/reenviar-correo`** → SC05 con `reenvio: true`.
    Degradación fuera del rango de éxito: **503 en producción, 202 en desarrollo** — nunca un
    200 con bandera, que es indistinguible de un envío real (`docs/aprendizajes.md`, cierre
    de la tanda D).

**Criterios de aceptación de Tanda C:** el badge refleja los tres estados; el botón cumple
Regla D; el endpoint no devuelve 2xx cuando no pudo encolar.

#### Checkpoints manuales de Sergio

| # | Acción | Cuándo |
|---|---|---|
| M-1 | Verificar la conexión de correo en Make org 1594725 y reportar tipo | **Antes** de Tanda B |
| M-2 | Importar `SC05-EmailTasador.blueprint.json` en eu1 y anotar la URL del webhook | Tras B-1 |
| M-3 | Reimportar `SC-Asignar.blueprint.json` v2.0 | Tras B-2 |
| M-4 | Configurar `MAKE_WEBHOOK_URL_SC05` en Railway y en `.env.local` | Tras M-2 |
| M-5 | Verificar en la UI de Make que el módulo Gmail tiene la conexión resuelta y el destinatario mapeado a `M_Tasadores.email` | Antes del E2E |
| M-6 | Activar SC05 en Make | Antes del E2E, **después** de M-8 |
| M-7 | Reemplazar `__LOGO_BASE64__` en `SC05-EmailTasador.blueprint.json` por el base64 real del logo, y pegar el bloque `<img>` del pie en `C_NotificacionesConfig.plantilla_cuerpo` (`rec5t6dBeYQkGsw4F`) | **Antes** de M-2 |
| M-8 | Envío de prueba en modo *Run once*: confirmar que el logo se ve bajo `www.valueproperty.cl` **y** que el correo no lo lista como adjunto suelto | Tras M-2, antes de M-6 |

> **M-5 no es opcional.** Es la verificación barata que cerró F-1: un campo obligatorio que
> aparece vacío en el diseñador significa que la clave del mapper no es la que el módulo
> espera. Cuesta treinta segundos y ahorra una corrida fallida.

> **M-7 va antes de M-2, no después.** Importar el blueprint con `__LOGO_BASE64__` sin
> reemplazar deja un adjunto con datos basura, y el módulo Gmail falla en el envío entero —
> no sólo en la imagen. Y el orden inverso entre plantilla y blueprint también importa: si la
> plantilla ya trae `cid:logo-vproperty` y el blueprint todavía no adjunta nada, los correos
> salen con la imagen rota. Los dos lados del CID se mueven juntos o no se mueve ninguno.

### §9.5.3 Prueba end-to-end y criterios de aceptación

**Preparación:** un tasador de prueba en `M_Tasadores` con `email` apuntando a una casilla
controlada por Sergio, `activo = true`. Una solicitud en `creada` con los tres datos mínimos
de RN-44, al menos un contacto de visita, una unidad y un adjunto en Dropbox.

- [ ] **E2E-1 · Envío feliz.** Asignar desde la consola. El correo llega en menos de un
      minuto. Asunto y cuerpo corresponden a la plantilla, en es-CL, con los cinco bloques de
      §1.6.3 poblados y el enlace de Dropbox abriendo el adjunto.
- [ ] **E2E-2 · Trazas.** `TX_Notificaciones` con una fila `Enviado`, `enviado_en` poblado,
      `intentos = 1`. `A_Eventos` con `asignacion_manual` **y** `correo_asignacion_enviado` —
      exactamente uno de cada uno. `LogEscenarios` con `Email tasador · ✓ OK`.
- [ ] **E2E-3 · RN-52.** `TX_Solicitudes.email_thread_id` quedó poblado con el Thread ID de
      Gmail. (Si A-1 resolvió SMTP: el campo queda vacío y la degradación está documentada.)
- [ ] **E2E-4 · Idempotencia.** Reenviar el mismo payload al webhook de SC05.
      **No llega un segundo correo.** `LogEscenarios` registra `⏭ Omitido`.
      `TX_Notificaciones` sigue con una sola fila.
- [ ] **E2E-5 · Tasador sin email.** Vaciar `M_Tasadores.email` y asignar otra solicitud.
      **La asignación se completa** (estado `asignada`, botón desaparece).
      `TX_Notificaciones` con `Error` y motivo. `LogEscenarios` con `⚠ Parcial`. La consola
      muestra el badge ámbar (si Tanda C está construida).
- [ ] **E2E-6 · Fallo del proveedor.** Desconectar la cuenta de correo en Make y asignar.
      **La asignación se completa igual.** `LogEscenarios` con `✗ Error`. Ningún
      `correo_asignacion_enviado` en `A_Eventos`.
- [ ] **E2E-7 · Reenvío manual** (si Tanda C está construida). El botón cumple Regla D. Llega
      un segundo correo. `TX_Notificaciones` suma una fila con `clave_notif` sufijo
      `reenvio-1`.
- [ ] **E2E-8 · Regresión de SC-Asignar.** El evento `correo_asignacion_enviado` **ya no** se
      escribe cuando SC05 no envió. Verificar contra una solicitud del caso E2E-6.
- [ ] **E2E-9 · Logo del pie.** Abrir el correo de E2E-1 en **Gmail web, Gmail móvil y Outlook
      de escritorio**. El logo aparece bajo `www.valueproperty.cl` en los tres, **sin pulsar
      "mostrar imágenes"** — si hiciera falta pulsarlo, la imagen se está sirviendo por URL y
      no por CID. Confirmar además que el mensaje **no** muestra `logo-vproperty.png` como
      adjunto descargable junto a los enlaces de Dropbox: si aparece, el módulo Gmail no
      construyó el `multipart/related` y hay que revisar el campo `cid` de m19.

---

## §9.6 · P8.6 — Control de SLA en IF-02 (RF-08 agregado + RF-53 por etapa)

> **⚙ Modo Claude Code recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total** para toda mutación de schema Airtable y
> para los dos blueprints ya en producción (SC01, SC-Asignar). Las lecturas MCP y la escritura
> de código TS/UI son 🟡 **pausa-en-comandos**.

> **Regla dura:** la Tanda A es bloqueante para todas las demás. El motor (Tanda B) se puede
> escribir y testear sin Airtable —es aritmética pura—, pero **no se cablea nada** a la API ni a
> la UI mientras `C_SLA_Etapas` no exista sembrada y los campos de `TX_Solicitudes` no estén
> creados. Construir la UI contra campos inexistentes reproduce el bug de `mi_cartera` con
> `ejecutiva_asignada` (E-018/E-019): degradación silenciosa que se lee como "no hay casos".

### §9.6.1 Diseño

#### El requerimiento en una frase

La spec v1.9.9 §5.2 declara **dos relojes que conviven y no se sustituyen**: el **plazo
agregado** por par (cliente, tipo_informe), en días, que gobierna el semáforo de bandeja
(RF-08 · RN-04 · `C_SLA`), y el **plazo por etapa** del workflow —siete tramos entre la
recepción del correo y el envío del informe visado, en **horas hábiles**— que gobierna el
control diario del área (RF-53 · §5.2.4). El primero responde *cuándo vence la solicitud*; el
segundo, *dónde se está atrasando ahora*. Una etapa en rojo con el agregado en verde es la
lectura correcta de ambos, no una inconsistencia. P8.6 construye el segundo y sanea el primero.

#### Estado real verificado (10-ago-2026) — nada de esto se asume

> **Reverificación de v1.9.** La tabla de abajo se releyó entera contra `app9G7lLkIV3CpeLa` el
> 10-ago-2026 antes de reconciliar las tres divergencias. Tres afirmaciones de v1.8 resultaron
> **inexactas** y quedan corregidas aquí, no en una adenda: el recuento de filas sin `anno` en
> `C_Feriados` (eran 5 de 2026, no 8), la inexistencia total de AT08 (la *Automation* no existe,
> pero **sí existe su fila de inventario** en `C_AutomationsAirtable`), y el estado de despliegue
> de AT02/AT04, que el registro declara `Activo`. Las filas afectadas van marcadas **⚠ corrige v1.8**.
>
> **Reverificación de v1.10 (10-ago-2026, sólo lectura).** Antes de incorporar las tres
> decisiones de negocio se releyeron los cuatro objetos que ellas tocan. **Nada cambió respecto
> de v1.9 y ninguna fila de esta tabla se corrige:** `C_SLA` (`tblsPZokEK5aoinTn`) sigue con
> **1 fila** (`recePRZ2pxuYimNoe`, `dias_totales = 4`, `activo = true`) y **12 campos**, con la
> familia `sla_dias`/`sla_dias_alerta`/`sla_dias_vencido` **vacía en 1 de 1 filas** —la evidencia
> que M-11 exige para borrarla sigue siendo válida—; `C_SLA_Etapas` **sigue sin existir** (66
> tablas en la base, ninguna con ese nombre), de modo que **A-1 sigue siendo su creador y M-11.b
> depende de él**; `TX_Solicitudes` sigue con **135 campos** y **cero** con prefijo `sla_` (el
> único campo con "sla" en el nombre es la fórmula `semaforo_sla`); y `C_SLA` **sigue sin**
> `sla_revision_horas`, `matriz_etapas` y `activo_desde`. Sin cambios de esquema desde v1.9.

| Objeto | Estado real | Consecuencia para P8.6 |
|---|---|---|
| `C_SLA` (`tblsPZokEK5aoinTn`) | **1 sola fila** (`recePRZ2pxuYimNoe` · `SLA_METLIFE_Refinanciamiento`, `dias_totales = 4`, `activo = true`) con `cliente`/`tipo_informe`/`tipo_propiedad` poblados pero **sin umbrales de alerta**. Tiene **dos familias de campos duplicadas**: `dias_totales`/`dias_alerta_amarilla`/`dias_alerta_roja` (poblada **sólo** en `dias_totales`) y `sla_dias`/`sla_dias_alerta`/`sla_dias_vencido` (**vacía en el 100 % de las filas: 0 de 1**). **No existe `sla_revision`** ni ningún campo equivalente, pese a que §5.2.4 · etapa 7 y §3.2 lo dan por existente. Tampoco existen `matriz_etapas` ni `activo_desde`. | Tanda A · M-11.a y M-9. RF-08 hoy **no está parametrizado**: el código no lee `C_SLA` en ningún punto. El borrado de la familia perdedora que exige M-11.a ya tiene su evidencia: 0 filas no vacías. La fila `SLA_METLIFE_Refinanciamiento` **se conserva** y convive con la default de la Decisión 2, resolviéndose campo a campo (**§9.6-R4**). Ver **§9.6-R3** y **§9.6-R4**. |
| Campos por etapa en `C_SLA` | **Cero.** No hay ningún campo en horas. `C_SLA_Etapas` **no existe** en la base (66 tablas listadas, ninguna con ese nombre). | Se crean en `C_SLA_Etapas` (tabla nueva), no como 14 columnas en `C_SLA` — ver *Dónde vive la matriz*. |
| `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`, 135 campos) | **Cero campos con prefijo `sla_`** (verificado por barrido del schema completo). Tiene `fecha_solicitud` (dateTime, **tz `client`**), `fecha_asignacion` (date) **y** `fecha_asignacion_ts` (dateTime, tz `America/Santiago`), `fecha_visita`, `fecha_visita_programada`, `fecha_entrega`, `fecha_cierre` (todas date, sin hora). **Ningún timestamp de entrada/salida de etapa.** | Se crean los 14 + 7 derivados de *Modelo de datos*. Las fechas existentes **no sirven**: son `date`, y una matriz en horas necesita hora. **M-9:** los 14 nuevos se crean con `timeZone = America/Santiago` explícito, no `client` — `fecha_solicitud` quedó en `client` y es la trampa que el motor no debe heredar. |
| `semaforo_sla` (`fldW4oUq7LvQUZq7W`) | Fórmula leída en vivo: cuenta días desde **`{fecha_visita}`** (`fldpTBzjfbAw5FSYI`), no desde el ingreso, y emite `Entregado` / `Sin visita` / `VENCIDO` / `EN RIESGO` / `OK`. No lee `C_SLA`, no usa `WORKDAY`, no excluye feriados. `fecha_limite_entrega` (`fldoT1LOSgVRo32TC`) = `DATEADD({fecha_visita}, 2, 'days')`. | Es **CI-005**. P8.6 la corrige en M-13 y deja el agregado leyendo `C_SLA` de verdad. |
| `H_Feriados` | **No existe, y no se va a crear.** La tabla real es **`C_Feriados`** (`tblJVh2kPd4uMgxpb`), 18 filas. | **CI-007** · RO-15 · **§9.6-R1**: manda la base real. Todo el código y los blueprints dicen `C_Feriados`. |
| Contenido de `C_Feriados` | 15 feriados de 2026 con fecha correcta; **una fila basura** (`recdfwWtdHFcm05sb`: sin `fecha`, `nombre = "nombre_feriado"`, `tipo = "tipo"`, `activo = false` — un encabezado de CSV importado como dato); **2027-01-01 duplicado** (`recGB2eUtwWs3cIuM`, `activo = true`, `nombre` poblado · `reckuUbALWocT4kWX`, `activo = false`, **`nombre` vacío**); **5 filas de 2026 sin `anno`** ⚠ *corrige v1.8, que decía 8*; y 2027 con **un solo** feriado cargado. | Tanda A · M-12. Una fila sin fecha rompe el `Set` de feriados del motor si no se filtra por `activo` **y** `fecha` no vacía. |
| Campos de `C_Feriados` | Tiene **dos campos de nombre**: `nombre` (`fld6tq4XCFdjr36YX`, **primary**) y `nombre_feriado` (`fldHb2bjnIpyuRqoR`), redundantes, **divergentes** (`recwAPk3zbnLgctHn`: `nombre = "Dia del Trabajo"` vs `nombre_feriado = "Dia del Trabajador"`) y desparejos (`nombre_feriado` vacío en 6 filas). Además, la fila basura **contaminó el select** `tipo` con una opción literal `"tipo"`. | **Hallazgo nuevo de v1.9.** El motor no lee ninguno de los dos —sólo `fecha` y `activo`—, así que no bloquea; entra en M-12 como saneamiento. Ver **§9.6-R1**. |
| `A_Eventos` (`tblMKmDg2KrO5fMn8`) | `tipo_evento` es `singleLineText` (vocabulario abierto), con `timestamp`, `actor_*`, `detalle_json`, `clave_evento` y link `solicitud`. El filtro va contra el **primary field** de `TX_Solicitudes`, nunca contra el `rec…` (E-076/E-077, ya resuelto en `lib/eventos.ts`). | Patrón vigente: cada transición de etapa escribe un `A_Eventos`. No se crea vocabulario nuevo de tabla. |
| `C_NotificacionesConfig` (`tbluB662ulWDaxqUY`) | `evento` (`fldrjziUXyYzkBunb`) **ya tiene** las opciones `sla_alerta_amarilla` y `sla_alerta_roja`. Sin filas para ninguna de las dos. | Tanda F · M-17: se crean filas, **no** opciones de select. |
| `LogEscenarios` (`tblR4VWpUHw1CSyIS`) | `Escenario` (`fldPktGeTzNCRQ319`) tiene 19 opciones, entre ellas `Alerta SLA 2d` y `Alerta SLA 3d` (vocabulario viejo, en días). **No hay opción para AT08.** | Tanda F · M-17: agregar la opción `AT08_SLA`. Las dos viejas se dejan (RO-14: alias, no rename). |
| `TX_Notificaciones` (`tbldgLQgjdgsOSZnt`) | Tiene `clave_notif`, `estado_envio`, `intentos`, `mensaje_error` — el mismo juego que hace idempotente a SC05. | Se reutiliza tal cual. Cero campos nuevos. |
| **AT08 · fila de inventario** | ⚠ **corrige v1.8.** `C_AutomationsAirtable` (`tblYYtKEaPgH7GfY0`) **sí tiene** la fila `recxWkj3x8tzqzHmo`: `codigo = AT08`, `nombre_automation = AT08_alertas_sla` (minúscula), `tipo = Script_Scheduled`, `disparador = "Cron 08:00 diario"`, `tablas_lee = "TX_Solicitudes, C_SLA"`, `tablas_escribe = "TX_Notificaciones"`, `descripcion = "…dispara SC13"`, **`estado = Inventariado`**. | La fila es un **inventario de diseño**, no una automatización desplegada. Sigue siendo **creación**, no extensión — ver **§9.6-R2**. M-17 **actualiza** esta fila; no crea una segunda fila AT08. |
| Airtable Automations (desplegadas) | El registro `C_AutomationsAirtable` marca `estado = Activo` para `AT01_Motor_Reglas`, `AT02_Asignar_Tasador`, `AT03_Calculos_DAG` y `AT04_Validar_Rangos`; `Inventariado` para AT05–AT10. **`AT08` no está desplegada.** ⚠ *corrige v1.8, que daba AT02 y AT04 por no desplegadas.* | Tanda F crea AT08 desde cero. **Lo de AT02 hay que mirarlo aparte** — ver el aviso inmediatamente debajo de esta tabla. |

> **⚠ AT02 aparece `Activo` en el registro, y eso no es una constatación de runtime.**
> `C_AutomationsAirtable` es una tabla de inventario que alguien mantiene a mano: dice lo que se
> diseñó, no lo que está encendido. El MCP y la API de metadata **no pueden leer el estado real
> de una Airtable Automation** (`CLAUDE.md` · alcance conocido del MCP), así que ni v1.8 ni v1.9
> pueden afirmar si AT02 corre. Importa porque la **REGLA A · D-15** exige que AT02 esté apagada:
> encendida con disparador `estado = creada`, asignaría un tasador por su cuenta y chocaría con
> el guard 409 de `asignar/route.ts`. **Queda como verificación manual de Sergio dentro de M-9**
> —abrir Airtable → Automations → confirmar que `AT02_Asignar_Tasador` está en *off*— y **no**
> como un supuesto de este plan en ninguna dirección. No bloquea P8.6; bloquea la tranquilidad
> sobre P7.

#### Las tres divergencias, reconciliadas

Las tres se resuelven **dentro** de §9.6, sin adenda y sin tocar la spec (RO-15: la spec se
corrige en su propio bump, con changelog). Quedan con identificador greppable.

**§9.6-R1 · `C_Feriados` es el nombre canónico. Se corrige el plan, no la tabla.**
La spec la llama `H_Feriados` en 8 puntos y el `Blueprint v2.10` arrastra el mismo nombre; la
tabla real es `C_Feriados` (`tblJVh2kPd4uMgxpb`) y está poblada y en uso. Gana la base real por
**RO-15**, y además el prefijo `C_` es el correcto por dominio: es un catálogo paramétrico, no un
histórico. Renombrar la tabla en Airtable sólo para complacer al documento rompería lo que ya
funciona y no arregla nada. **Ningún artefacto de P8.6 escribe `H_Feriados`**: `lib/feriados.ts`,
los blueprints y el script de AT08 usan `C_Feriados` y su `tbl…`. La corrección de la spec sigue
siendo **CI-007**, con dueño Sergio y fecha objetivo el próximo bump normativo.
*Ubicación del trabajo:* **Tanda A · A-4** (auditoría) y **M-12** (saneamiento). No genera
checkpoint nuevo: el saneamiento de datos ya era M-12, sólo se amplía su alcance.
*Impacto en campos declarados en §9.6:* **ninguno.** No se agrega, quita ni renombra un solo
campo. Lo que cambia es el alcance de la limpieza (el par `nombre`/`nombre_feriado` y la opción
`"tipo"` del select) y el recuento de filas sin `anno`, que era 8 y es **5**.

**§9.6-R2 · `AT08_Alertas_SLA` se crea. La fila de inventario se actualiza, no se duplica.**
La divergencia real no era "existe vs no existe", sino que había **dos objetos distintos con el
mismo código**: la *Automation* desplegada —que no existe— y la *fila de inventario* en
`C_AutomationsAirtable` —que sí existe, en `estado = Inventariado`, desde el 03-jun-2026—. La
tanda F sigue siendo **creación** en el sentido que importa: hay que escribir el script, crear la
automatización y activarla. Lo que v1.8 no contemplaba es que crearla obliga a **cerrar el ciclo
del registro**, y que ese registro trae dos datos desalineados que hay que corregir en el mismo
turno: el nombre está en minúscula (`AT08_alertas_sla`) contra la convención de las cuatro
desplegadas (`AT01_Motor_Reglas`, `AT02_Asignar_Tasador`, `AT03_Calculos_DAG`,
`AT04_Validar_Rangos`), y la `descripcion` dice *"dispara SC13"*, escenario que en este repo no
existe y que §9.5.1 ya resolvió como alias (**RO-14**).
*Nombre canónico:* **`AT08_Alertas_SLA`** — TitleCase, igual que las cuatro desplegadas. El
`codigo` sigue siendo `AT08` y la fila sigue siendo `recxWkj3x8tzqzHmo`: se **actualiza**, no se
crea una segunda.
*Ubicación del trabajo:* **Tanda F**, con paso nuevo **F-5** y ampliación de **M-16** y **M-17**.
No hay checkpoint nuevo.
*Impacto en campos declarados en §9.6:* **ninguno en `TX_Solicitudes` ni en `C_SLA`.** El cambio
es de datos en `C_AutomationsAirtable` (3 celdas de una fila existente) y de nomenclatura.

**§9.6-R3 · `sla_revision_horas` es el nombre canónico, y su regla de consumo queda fijada.**
`sla_revision` no existe en `C_SLA` — verificado campo por campo — y la spec lo da por existente
en dos lugares (§3.2 y §5.2.4 · etapa 7). Se crea, pero **no** con el nombre de la spec: toda
`C_SLA` está en días y este sub-SLA vale **30 minutos** (§5.2.4 · etapa 7), de modo que un campo
llamado `sla_revision` junto a `dias_totales` se lee como días y produce un error de 48× que
ninguna validación atraparía. El sufijo de unidad es la corrección barata. *(§3.2 nombra además
un `sla_aplicable` global que tampoco existe; no se crea nada por él —el agregado ya vive en
`dias_totales`— y se anota junto a CI-007 para el bump de la spec.)*
*Regla de consumo —lo que v1.8 dejaba sin decidir y es la única pregunta de diseño real:*
`C_SLA_Etapas.e7` y `C_SLA.sla_revision_horas` describen el mismo plazo, y dos fuentes para el
mismo número es exactamente lo que **RO-05** prohíbe. Se resuelve por precedencia, no por
duplicación: **`sla_revision_horas` es un override por par (cliente, tipo_informe,
tipo_propiedad) del umbral de la etapa 7, y sólo de esa etapa.** Cuando está vacío —el caso de
v1.9, donde nadie lo puebla— la etapa 7 usa `sla_ideal_horas`/`sla_max_horas` de `C_SLA_Etapas`,
que valen `0.5` y `0.5`. Cuando está poblado, sustituye **ambos** umbrales de e7 para esa fila de
`C_SLA` y para ninguna otra etapa. `recalcularSla()` recibe el override como parámetro opcional
junto a la matriz; el motor no sabe de dónde salió y no conoce ningún número de §5.2.4. Es la
misma mecánica que `matriz_etapas`, un peldaño más fino.
*Ubicación del trabajo:* **Tanda A · A-3** (crear el campo) y **Tanda B · B-3** (el parámetro en
`recalcularSla`). El poblado sería **M-11.a**, pero la Decisión 2 lo fija **vacío**: la fila
default no lo puebla y ningún par tiene override de e7 en v1.9.
No hay checkpoint nuevo.
*Impacto en campos declarados en §9.6:* **cero campos nuevos respecto de v1.8.** Los tres campos
de `C_SLA` siguen siendo `sla_revision_horas`, `matriz_etapas` y `activo_desde`, y los 21 de
`TX_Solicitudes` no se tocan. Lo que se agrega es la **semántica de precedencia**, que antes no
estaba escrita, más una firma de `recalcularSla()` con un parámetro opcional.

---

**§9.6-R4 · El baseline del SLA agregado se carga sobre la familia superviviente. Los nombres
con que llegó la decisión no son los del schema.**

La Decisión 2 fija el baseline en términos de negocio —**3 días de compromiso (umbral rojo), 2
días de ámbar, 0 a 1 día de verde**— y lo expresó con los nombres `sla_dias`,
`umbral_ambar_dias` y `umbral_verde_dias`. **Ninguno de los tres sirve tal cual**, y esto no es
una objeción al contenido sino a la etiqueta:

- `sla_dias` **es la familia que M-11 borra.** Cargarlo y borrarlo en el mismo checkpoint es
  contradictorio: el borrado de `sla_dias`/`sla_dias_alerta`/`sla_dias_vencido` ya está decidido
  en v1.9 sobre la evidencia de 0 filas no vacías, y la familia superviviente es
  `dias_totales`/`dias_alerta_amarilla`/`dias_alerta_roja`.
- `umbral_ambar_dias` y `umbral_verde_dias` **no existen** en `C_SLA` (12 campos, verificados
  uno a uno). Crearlos sería estructura nueva, y la Decisión 2 es explícita en que cambia el
  contenido cargado y no la estructura.

*Resolución —se conservan los valores, se traducen los nombres:*

| Decisión 2 dice | Se carga en | Valor | Por qué |
|---|---|---|---|
| `sla_dias = 3` | **`dias_totales`** | `3` | Es el compromiso total del par y el umbral rojo. Familia superviviente. |
| `umbral_ambar_dias = 2` | **`dias_alerta_amarilla`** | `2` | Mismo concepto, nombre real. El vocabulario amarillo/rojo del campo coincide con RN-04. |
| — | **`dias_alerta_roja`** | `3` | El rojo **es** el compromiso: se carga igual a `dias_totales`, no se deja vacío. Vacío significaría "sin umbral" y el semáforo nunca llegaría a rojo. |
| `umbral_verde_dias = 1` | **ningún campo** | — | Es **derivado**, no un dato: verde = todo lo que está por debajo de `dias_alerta_amarilla`, es decir 0 a 1 día. Un cuarto campo para almacenar `ámbar − 1` sería la duplicación que **RO-05** prohíbe. |
| `sla_revision_horas` vacío | `sla_revision_horas` | *(vacío)* | Sin override: la etapa 7 usa los `0.5`/`0.5` de `C_SLA_Etapas` (**§9.6-R3**). Es lo que v1.9 ya esperaba. |

*La fila comodín no lleva `*` en ninguna parte.* `cliente`, `tipo_informe` y `tipo_propiedad`
son `multipleRecordLinks` a `M_Clientes`, `M_TiposInforme` y `M_TiposPropiedad`: no aceptan un
literal `"*"`. **La convención de comodín es el campo vacío.** La fila default se crea con los
tres links **sin vincular**, `clave_natural = SLA_DEFAULT_GLOBAL`, `nombre` igual,
`activo = true` y `activo_desde` = fecha de carga.

*Precedencia de resolución —campo a campo, no fila a fila.* Tras M-11 conviven **dos** filas: la
default y la `SLA_METLIFE_Refinanciamiento` preexistente, que tiene `dias_totales = 4` y **sus
dos umbrales vacíos**. La regla que evita el hueco: para un par dado se toma la fila **más
específica que empareje** (los tres links coincidiendo; si no hay, la default), y **cada campo
vacío en esa fila se resuelve contra la default**. Consecuencia concreta y deliberada: MetLife ·
Refinanciamiento · Casa conserva sus **4 días** de compromiso y hereda **ámbar a los 2** y
**rojo a los 4** —el rojo hereda el compromiso de su propia fila, no el 3 de la default—;
cualquier otro par lee 3 / 2 / 3. Nadie tiene que completar la fila de MetLife para que el
semáforo funcione, y por eso esta decisión **no genera una nueva pregunta de negocio**.

*Ubicación del trabajo:* **M-11.a** (la carga) y **Tanda C/D** (el consumo, cuando el lector de
`C_SLA` se escriba: hoy el código no lee la tabla en ningún punto). *Impacto en campos
declarados en §9.6:* **cero campos nuevos.** Se pobla lo que ya existe y se borra lo que v1.9 ya
había decidido borrar.

*Corolario ejecutado el 10-ago-2026:* `matriz_etapas` de `SLA_DEFAULT_GLOBAL` quedó **vacío**.
Durante la carga se linkeó a las 7 filas globales y se revirtió en el mismo día: un override que
apunta a la matriz global es un no-op semántico que quema la señal. La invariante que el motor
lee —**vacío = matriz global, poblado = override de este par**— sólo sirve si nadie la usa como
enlace de navegación. Para recorrer la matriz desde `C_SLA` está el link inverso `C_SLA` de
`C_SLA_Etapas` (`fldxb9ztHRyYfyXWX`), que Airtable creó solo y no significa nada.

---

**§9.6-R5 · El MCP sí crea fórmulas. M-13 no era un turno manual.**

v1.10 declaraba, en la fila M-13 de la tabla de checkpoints, que *"el MCP no crea ni modifica
fórmulas"*, y sobre esa premisa M-13 quedaba como un paso de UI a cargo de Sergio, bloqueante
antes de la Tanda C. **La premisa era falsa:** `create_field` de este MCP acepta
`type: "formula"` con `options.formula`, y devuelve el campo con `isValid`,
`referencedFieldIds` y `result.type` resueltos.

*Ejecutado:* `sla_semaforo_etapa` = **`fldB6gJ3clZUPgaZk`**, creado el 10-ago-2026 con el texto
literal de este §9.6.1, `isValid: true`, referenciando `sla_etapa_vence_ts`
(`fldLJdanpV0FANjKS`) y `sla_etapa_alerta_ts` (`fldLfFftNm0Kvvu08`), con `result.type`
`singleLineText`. Airtable normalizó los nombres de campo a FIELD_IDs dentro de la expresión, que
es lo que queremos: la fórmula sobrevive a un rename.

*Lo que esto cierra y lo que no.* Cierra **M-13 como compuerta de ejecución**: no hay que esperar
un turno de UI y la Tanda C deja de depender de una acción humana. **No cierra la verificación de
contrato.** `isValid: true` sólo afirma que la expresión compila; no dice qué cadena emite. Los
cuatro literales `verde`/`ambar`/`rojo`/`sin_dato` se verifican mirando filas reales en el E2E de
la Tanda C, y esa parte de M-13 sigue viva.

*Regla que queda para el resto del plan:* antes de declarar en el plan que el MCP **no** puede
algo, probarlo. Una incapacidad supuesta cuesta un turno manual que nadie necesitaba, y —peor—
se copia de versión en versión como si fuera un hecho verificado. Las demás fórmulas que este
plan pueda necesitar se crean por MCP salvo prueba en contrario. La incapacidad que **sí** está
verificada es otra: el MCP **no borra campos** (los tres de la familia perdedora de `C_SLA` en
M-11.a siguen siendo trabajo de UI) y **no lee el estado activo/inactivo de una Airtable
Automation** (de ahí la verificación manual de AT02 en M-9).

*Impacto en campos declarados en §9.6:* **ninguno.** El campo ya estaba declarado en el *Modelo
de datos*; cambia quién lo crea, no qué es.

---

**§9.6-R6 · Un criterio de aceptación por `grep` declara sus exclusiones. Un literal en un
fixture es correcto.**

El criterio de la Tanda B pedía *«cero constantes de §5.2.4 en el código»* y lo verificaba con
`grep -n "\b48\b\|\b0\.5\b"` sobre `lib/sla-*.ts`. El glob `lib/sla-*.ts` **incluye
`lib/sla-habil.test.ts` y `lib/sla-etapas.test.ts`**, y ahí los catorce números de §5.2.4
aparecen a propósito: un test que verifica que una etapa de `0.5` h vence donde debe **tiene**
que escribir `0.5`. El criterio, corrido literalmente sobre la Tanda B cerrada, devolvía
coincidencias y declaraba incumplida una tanda que sí cumple.

*El fallo no es del código: es del criterio.* Lo que la regla protege es que el **motor** no
lleve umbrales hardcodeados —viven en `C_SLA_Etapas` y llegan como parámetro—. Un fixture no es
una constante de negocio: es el valor esperado contra el que se compara, y si se lo reemplazara
por una lectura de la tabla el test dejaría de probar nada.

*Dos correcciones, no una.* La primera versión de este criterio —`| grep -v '\.test\.ts$'`— se
escribió y se probó, y **no excluía nada**: `$` ancla al final de la *línea*, y las líneas que
`grep` emite son `lib/sla-etapas.test.ts:  e5: { … }`, o sea terminan en el contenido, no en el
nombre del archivo. Colaba las 106 coincidencias de los tests intactas. La exclusión correcta
ancla en el separador que `grep` pone después del nombre: `'\.test\.ts:'`.

Con esa exclusión ya funcionando aparece el segundo problema, de fondo: **cuatro de los siete
literales de §5.2.4 tienen usos legítimos en el motor y siempre los tendrán**. `2`, `3`, `4` y
`6` aparecen en `export type NumeroEtapa = 1 | 2 | 3 | 4 | 5 | 6 | 7`, en `ETAPAS`, en los
puntajes de `resolverSlaDelPar` y en `diasSemana: [1,2,3,4,5]` de la ventana hábil. Son números
de etapa y de día de la semana, no plazos. Un criterio que los prohíbe exige borrar el tipo que
hace seguro al motor.

Los que **sí** son inequívocos son tres: `0.5`, `24` y `48`. Ninguno tiene otro significado
posible en estos módulos, y son exactamente los que delatarían un umbral hardcodeado.

*Criterio corregido (el que rige desde v1.12):*

```bash
grep -nE '\b(0\.5|24|48)\b' lib/sla-*.ts \
  | grep -v '\.test\.ts:' \
  | grep -vE '^[^:]+:[0-9]+: *(//|\*|/\*)'
```

Debe salir **vacío**. Los tres filtros son parte del criterio: el primero busca sólo los
literales inequívocos, el segundo excluye los fixtures y el tercero excluye las líneas de
comentario, donde `§5.2.4` y frases como *«24 h hábiles»* aparecen para explicar justamente la
regla que el criterio protege. La misma tubería, con `-r … app/api --include='*.ts'`, es la que
verifica la Tanda C.

*Regla general que deja, en dos mitades:*

1. **Todo criterio de aceptación basado en `grep` declara sus exclusiones en el propio comando,
   y el comando se corre antes de escribirlo en el plan.** Un `grep` sin exclusión sobre un glob
   que incluye tests mide la suma de dos poblaciones con reglas opuestas —producción, donde el
   literal es un defecto; tests, donde es el instrumento— y por construcción no puede dar verde.
   Es **RO-02** por el otro extremo: allí el `grep` era la fuente de verdad de la cobertura y el
   riesgo era no correrlo; aquí se corre y lo que falla es su definición. El corolario lo probó
   este mismo bump: la primera corrección se escribió sin ejecutarla y el ancla `$` la dejó
   inerte. Un criterio de aceptación es código y se prueba como código.
2. **Un criterio se escribe sobre las señales inequívocas, no sobre todas las señales.** Meter
   `2`, `3`, `4` y `6` en el patrón no lo hace más estricto: lo hace inservible, porque obliga a
   ignorarlo todos los días. Un criterio que grita siempre no distingue nada, y el hábito de
   saltárselo es lo que hace que el día que grite de verdad tampoco se mire.

*Ubicación del trabajo:* **Tanda B**, criterio de aceptación. La tanda **no se reabre** —está
cerrada y committeada con 186 tests verdes—; lo que cambia es el comando con que se verifica, y
la verificación se repite en la Tanda C extendiendo el mismo `grep` a `app/api/**/*.ts` con la
misma exclusión.
*Impacto en campos declarados en §9.6:* **ninguno.** No se toca ni un campo, ni un artefacto, ni
una línea de `lib/sla-*.ts`.

#### Modelo de datos

**Dónde vive la matriz por etapa — decisión del panel.** §5.2.4 declara **una** matriz de siete
etapas, igual para todos los clientes. `C_SLA` está indexada por (cliente, tipo_informe,
tipo_propiedad). Meter ahí 14 columnas en horas replicaría los mismos catorce números en cada
fila del par y garantizaría deriva el día que se agregue el segundo cliente. Por eso la matriz
va en tabla propia, `C_SLA_Etapas`, con siete filas, y `C_SLA` recibe **sólo lo que es
genuinamente por par**: el sub-SLA de revisión del visador que §5.2.4 · etapa 7 nombra
explícitamente, más el enlace opcional a una matriz alternativa para el día que un cliente
negocie plazos distintos. La alternativa —14 campos en `C_SLA`— se evaluó y se descarta: el
único caso que resolvería mejor es el override por cliente, que el enlace ya cubre sin
denormalizar.

**Tabla nueva `C_SLA_Etapas`** — catálogo, 7 filas sembradas desde §5.2.4.

| Campo | Tipo | Notas |
|---|---|---|
| `etapa_key` | singleLineText (primary) | `e1` … `e7`. Es la clave que usa el código; el nombre es para humanos. |
| `orden` | number (entero) | 1–7. |
| `nombre_etapa` | singleLineText | Literal de §5.2.4. |
| `responsable` | singleSelect | `control_seguimiento` · `tasador` · `visado` (§5.2.3). Destinatario de la alerta roja. |
| `de_a` | singleLineText | Columna "De → A" de §5.2.4. Documental. |
| `sla_ideal_horas` | number (2 dec) | Horas hábiles. `0.5` para las etapas de 30 min. |
| `sla_max_horas` | number (2 dec) | Idem. |
| `activo` | checkbox | Default `true`. |

Siembra literal desde §5.2.4 — **estos catorce números son la única fuente**; el código no los
lleva hardcodeados. **Son datos cerrados por Héctor (Decisión 1 · v1.10): se cargan literales y
no se elicitan.** No hay nada que preguntar sobre esta tabla; lo único que se hace con ella es
copiarla sin redondear ni convertir de unidad, y ratificar la copia en **M-11.b**:

| `etapa_key` | `nombre_etapa` | `responsable` | `sla_ideal_horas` | `sla_max_horas` |
|---|---|---|---|---|
| `e1` | Ingreso de solicitud | `control_seguimiento` | 2 | 3 |
| `e2` | Coordinación de visita (llamado) | `tasador` | 4 | 6 |
| `e3` | Informe post-llamado | `tasador` | 0.5 | 0.5 |
| `e4` | Aviso de coordinación al cliente | `control_seguimiento` | 2 | 3 |
| `e5` | Visita y envío de informe | `tasador` | 24 | 48 |
| `e6` | Disponible para visado | `control_seguimiento` | 2 | 3 |
| `e7` | Visación y envío final | `visado` | 0.5 | 0.5 |

**Campos nuevos en `C_SLA`** (3, más una limpieza):

| Campo | Tipo | Notas |
|---|---|---|
| `sla_revision_horas` | number (**1 dec**) | Sub-SLA de revisión del visador (**§9.6-R3**). *(Un decimal, no dos: el valor más fino que este campo puede tomar es `0.5` —los 30 min de e7— y el segundo decimal no representa nada. Así quedó creado el campo real `fldyi1guWZwwhvbkF`.)* §5.2.4 · etapa 7 y §3.2 lo dan por existente bajo el nombre `sla_revision`; **no existe**. Se crea con sufijo de unidad para que nadie lo confunda con días, que es la unidad del resto de la tabla. **Es un override del umbral de la etapa 7 y de ninguna otra**: vacío → e7 usa `C_SLA_Etapas` (`0.5` / `0.5`); poblado → sustituye los dos umbrales de e7 para ese par. Nadie lo puebla en v1.9. |
| `matriz_etapas` | multipleRecordLinks → `C_SLA_Etapas` | Vacío = matriz global de §5.2.4. Poblado = override del par. En esta iteración **nadie lo puebla**; existe para que el override futuro no exija migración. |
| `activo_desde` | date | RF-35 exige que modificar un SLA no altere solicitudes en curso. Sin esta fecha la regla no es verificable. La solicitud adopta la fila vigente a su `sla_e1_inicio_ts`. |

*Limpieza (M-11.a, decisión tomada):* de las dos familias duplicadas se conserva
**`dias_totales` / `dias_alerta_amarilla` / `dias_alerta_roja`** —es la poblada y su vocabulario
coincide con el amarillo/rojo de RN-04— y se eliminan `sla_dias`, `sla_dias_alerta` y
`sla_dias_vencido`, previa verificación de que están vacías en las filas que existan al momento
de borrarlas. Es la deuda (1) de CI-005 y es prerrequisito de todo lo demás.

*Baseline del agregado (M-11.a · Decisión 2 · **§9.6-R4**):* además de la limpieza, `C_SLA`
recibe **una sola fila nueva**, la global default, con los tres links vacíos como comodín:

| Campo | Valor |
|---|---|
| `clave_natural` · `nombre` | `SLA_DEFAULT_GLOBAL` |
| `cliente` · `tipo_informe` · `tipo_propiedad` | *(vacíos = comodín · **§9.6-R4**)* |
| `dias_totales` | `3` — compromiso y umbral rojo |
| `dias_alerta_amarilla` | `2` |
| `dias_alerta_roja` | `3` |
| `sla_revision_horas` | *(vacío — sin override de e7 · **§9.6-R3**)* |
| `matriz_etapas` | *(vacío — matriz global de §5.2.4)* |
| `activo` · `activo_desde` | `true` · fecha de carga |

Verde no tiene campo: es todo lo que queda por debajo de `dias_alerta_amarilla`, o sea **0 a 1
día**. Con esta fila RF-08 queda parametrizado para **todos** los pares, incluidos los que
todavía no existen en `M_Clientes`, y ninguna solicitud puede quedar sin umbral.

**Campos nuevos en `TX_Solicitudes`** (21: 20 de datos + 1 fórmula). Todos con prefijo `sla_`
para que un `grep sla_` los liste completos, y todos `dateTime` **con hora**, en
`America/Santiago`:

| Campo | Tipo | Escrito por | Notas |
|---|---|---|---|
| `sla_e1_inicio_ts` … `sla_e7_inicio_ts` (7) | dateTime | ver *Quién escribe cada etapa* | Entrada a la etapa. |
| `sla_e1_fin_ts` … `sla_e7_fin_ts` (7) | dateTime | idem | Salida de la etapa. `sla_eN_fin_ts` y `sla_e(N+1)_inicio_ts` son el mismo instante en el flujo feliz, pero se guardan por separado: la etapa siguiente puede arrancar tarde, y esa brecha es justamente lo que los reportes de §5.2.9 tienen que poder ver. |
| `sla_etapa_actual` | number (entero) | motor | 1–7. Vacío = sin datos de etapa. |
| `sla_etapa_alerta_ts` | dateTime | motor | Instante de pared en que la etapa vigente alcanza su **SLA ideal**. |
| `sla_etapa_vence_ts` | dateTime | motor | Instante de pared en que la etapa vigente supera su **SLA máximo**. |
| `sla_recalculado_ts` | dateTime | motor | Auditoría: cuándo corrió el motor por última vez sobre esta fila. |
| `sla_pausa_inicio_ts` | dateTime | — (RN-54) | **Declarado y sin escritor en esta iteración.** |
| `sla_pausa_habil_min` | number (entero) | — (RN-54) | Minutos hábiles ya consumidos por pausas cerradas. El motor lo lee y lo resta; hoy lee 0. |
| `sla_semaforo_etapa` | **formula** | Airtable | `verde` · `ambar` · `rojo` · `sin_dato`. Ver *El truco que hace barato todo lo demás*. |

**El hito de inicio de §5.2.2, sin tocar el disparador de creación.** El reloj arranca cuando
Control y Seguimiento **abre el correo e ingresa la solicitud**, no cuando el correo llega al
buzón. Eso se captura sin cambiar nada del flujo actual: el wizard de creación (§4 · P3)
registra `new Date().toISOString()` al **montar la Fase 1** en un campo oculto del formulario,
y ese valor viaja como una clave más en el payload que ya se envía a SC01. `sla_e1_inicio_ts`
**es** el hito —no se crea un campo aparte para el mismo instante— y queda editable desde
"Editar solicitud" mientras el estado siga `creada` (REGLA C), para el caso real de la ejecutiva
que abrió el correo a las 9:10 y terminó de cargar la solicitud a las 11:40. El disparador de
SC01, su hook y su ID **no cambian**: el cambio es aditivo en el mapeo.

**Derivados: fórmula, script o rollup.** `sla_semaforo_etapa` es **fórmula**, y es la única de
las tres opciones que funciona. Un rollup no puede: no hay tabla hija por etapa. Un script
tendría que correr por cron y dejaría el semáforo desactualizado entre corridas. La fórmula sí,
porque lo único que compara es `NOW()` contra dos timestamps ya calculados:

```
IF(
  OR({sla_etapa_vence_ts} = BLANK(), {sla_etapa_alerta_ts} = BLANK()),
  "sin_dato",
  IF(
    IS_AFTER(NOW(), {sla_etapa_vence_ts}), "rojo",
    IF(IS_AFTER(NOW(), {sla_etapa_alerta_ts}), "ambar", "verde")
  )
)
```

`sla_etapa_actual`, en cambio, **no** es fórmula: es un valor escrito por el motor, porque
deducir la etapa vigente exige recorrer catorce campos y la matriz de umbrales.

#### Motor de cálculo

**El truco que hace barato todo lo demás.** La tentación es calcular "horas hábiles
transcurridas" en cada lectura y compararlas contra el umbral. No hace falta: basta convertir
**una sola vez**, al entrar a la etapa, el umbral en horas hábiles a un **instante de pared**
(`sla_etapa_alerta_ts`, `sla_etapa_vence_ts`). Desde ahí el semáforo es una comparación contra
`NOW()`, que Airtable hace nativamente en una fórmula, que la UI hace en el cliente sin lógica
de negocio, y que un `filterByFormula` puede filtrar y ordenar sin campos materializados ni
cron de refresco. La aritmética hábil corre unas siete veces por solicitud en toda su vida, no
una vez por render.

**Dónde vive el motor: TypeScript server-side.** Se descartan las otras tres:

- **Airtable Formula** — imposible. `WORKDAY` opera en días, no en horas; ninguna fórmula puede
  recorrer las filas de `C_Feriados`; y no hay forma de expresar "9:00–18:00 L-V" sin
  literalizar el calendario dentro de la fórmula.
- **Airtable Script (AT)** — posible pero equivocado como fuente: obligaría a mantener la misma
  aritmética dos veces (script + TS para la UI), que es exactamente lo que **RO-05** prohíbe.
  Los scripts de este plan quedan como *consumidores* del motor, no como copias de él.
- **Make** — un escenario por recálculo agrega latencia, coste operacional y una dependencia de
  red en un cómputo que es aritmética pura sobre datos ya presentes.
- **Route Handler / `lib/` en Next.js** ✅ — función pura, testeable con el `vitest 4.1.10` que
  el repo ya tiene, sin IO más allá de leer `C_Feriados` una vez y cachearla, y en el mismo
  lugar donde `lib/solicitudes.ts` ya deriva `slaDias`. Los umbrales llegan como parámetro desde
  `C_SLA_Etapas`: el motor no conoce ningún número de §5.2.4.

**`lib/sla-habil.ts`** — aritmética de calendario, sin dependencias:

```ts
export interface VentanaHabil { horaInicio: number; horaFin: number; diasSemana: number[] }
export const VENTANA_VPROPERTY: VentanaHabil = { horaInicio: 9, horaFin: 18, diasSemana: [1,2,3,4,5] }

/** Si `ts` cae fuera de ventana, devuelve la apertura hábil siguiente (§5.2.1). */
export function normalizarAVentana(ts: Date, feriados: Set<string>, v?: VentanaHabil): Date

/** Minutos hábiles entre dos instantes, descontando noches, fines de semana y feriados. */
export function minutosHabilesEntre(desde: Date, hasta: Date, feriados: Set<string>, v?: VentanaHabil): number

/** Instante de pared resultante de consumir `horas` hábiles desde `desde`. */
export function sumarHorasHabiles(desde: Date, horas: number, feriados: Set<string>, v?: VentanaHabil): Date
```

> **Zona horaria — la trampa que hay que evitar.** Chile cambia de huso dos veces al año
> (−03/−04). Todo el cómputo se hace descomponiendo el instante en `America/Santiago` con
> `Intl.DateTimeFormat(..., { timeZone })`, **nunca** sumando o restando un offset fijo. Un
> `-3` hardcodeado produce solicitudes que vencen una hora antes o después durante cuatro meses
> al año, y el error es invisible en desarrollo porque el bug sólo aparece cruzando el cambio de
> horario. Es el mismo tipo de fallo silencioso que RO-13.

**`lib/sla-etapas.ts`** — dominio, sobre el motor anterior:

```ts
export interface EtapaSla {
  key: 'e1'|'e2'|'e3'|'e4'|'e5'|'e6'|'e7'
  orden: number; nombre: string; responsable: Responsable
  slaIdealHoras: number; slaMaxHoras: number
  inicioTs?: string; finTs?: string
  estado: 'completada' | 'en_curso' | 'pendiente'
  tono?: 'green' | 'amber' | 'red'      // sólo en 'en_curso' y 'completada'
  minutosHabiles?: number
}
/** `overrideE7Horas` implementa §9.6-R3: si viene, sustituye ideal y máximo de la etapa 7
 *  —y sólo de la 7—. Llega desde `C_SLA.sla_revision_horas` de la fila vigente del par.
 *  El motor no sabe de dónde salió y sigue sin conocer ningún número de §5.2.4. */
export function recalcularSla(fila, matriz, feriados, overrideE7Horas?: number): {
  etapaActual?: number; alertaTs?: string; venceTs?: string; etapas: EtapaSla[]
}
```

**La pausa de RN-54 no duplica la pausa por calendario.** Son dos cosas distintas y se resuelven
en niveles distintos, que es justo lo que impide la duplicación:

- La **pausa por calendario** (§5.2.1) no es una pausa: es la definición misma de
  `minutosHabilesEntre`. El tiempo fuera de ventana nunca entra al cómputo, así que no hay nada
  que restar.
- La **pausa por estado** (RN-54, contacto no logrado) es un intervalo explícito
  `[sla_pausa_inicio_ts, reanudación]`. Al reanudar, su duración se mide **con la misma
  función** `minutosHabilesEntre` —de modo que las noches y los feriados dentro de la pausa no
  se descuentan dos veces— se acumula en `sla_pausa_habil_min`, y el motor desplaza
  `sla_etapa_alerta_ts` y `sla_etapa_vence_ts` hacia adelante con `sumarHorasHabiles`. Una sola
  implementación de calendario, dos usos.

RN-54 sigue **diferida** (§1.9 · FUT-EJ-07): los dos campos se crean y el motor los soporta,
pero en v1.9 nadie los escribe y `sla_pausa_habil_min` vale 0.

**Separación entre RF-08 y RF-53 — cómputo y pantalla.** No se pisan porque no comparten ni una
sola línea:

| | RF-08 · agregado | RF-53 · por etapa |
|---|---|---|
| Unidad | días hábiles | horas hábiles con ventana 9–18 |
| Parámetro | `C_SLA` por (cliente, tipo_informe, tipo_propiedad) | `C_SLA_Etapas`, matriz global |
| Origen del cómputo | `semaforo_sla` (fórmula Airtable) | `sla_semaforo_etapa` (fórmula sobre timestamps del motor TS) |
| Campo en el tipo `Solicitud` | `slaDias` · `slaTotal` (ya existen) | `slaEtapa` (nuevo, opcional) |
| Superficie visual | píldora con "N días", a la derecha del código | píldora con "● E{n} · {tiempo}", en la línea de badges |
| Qué responde | cuándo vence la solicitud | dónde se está atrasando ahora |

#### Quién escribe cada etapa — y el alcance honesto de esta iteración

De las siete etapas, **IF-02 sólo es dueña de dos límites**. Las demás pertenecen a interfaces
que no existen todavía. Instrumentar los catorce campos igual es correcto —son aditivos, y el
día que IF-03 los escriba el histórico no se pierde—, pero el plan lo declara sin adornos en vez
de prometer un tablero completo:

| Etapa | Escritor del `inicio` | Escritor del `fin` | Estado en v1.9 |
|---|---|---|---|
| e1 · Ingreso | **SC01** (hito §5.2.2 desde el wizard) | **SC-Asignar** | ✅ **operativa en P8.6** |
| e2 · Coordinación | **SC-Asignar** | IF-03 · §2.3 | ⏳ inicio sí, fin no |
| e3 · Informe post-llamado | IF-03 | IF-03 | ⏳ FUT-EJ-06 |
| e4 · Aviso al cliente | IF-03 (al cerrar e3) | IF-02 · acción futura | ⏳ sin origen en v1.9 |
| e5 · Visita e informe | IF-03 | IF-03 | ⏳ |
| e6 · Disponible para visado | RF-09-repo (subida del informe) | IF-04 | ⏳ |
| e7 · Visación y envío | IF-04 | IF-04 | ⏳ |

Consecuencia visible: la cronología del detalle muestra e1 y e2 con datos y las cinco restantes
como **pendientes**, no como atrasadas. `sla_semaforo_etapa` vale `sin_dato` mientras
`sla_etapa_vence_ts` esté vacío, y la píldora dice "Sin datos de etapa". Es el mismo criterio de
degradación honesta de todo el repo: nunca fabricar un valor que la base no respalda.

#### UI en IF-02

**Bandeja (§1.1, §1.2) — los dos semáforos conviviendo.** Sin componentes nuevos: `SLABadge`
(`components/console/status-badges.tsx:31`) se **extiende** con un modo etapa, y `StateBadge`
queda intacto. La regla visual que impide confundirlos es que **no se parecen**: el agregado es
una píldora rellena con días; la etapa es una píldora neutra con punto de color y prefijo `E{n}`.

```
┌──────────────────────────────────────────────────────────┐
│ VP-2026-0081                              [ 3 días ]     │  ← agregado (RF-08, existente)
│ MetLife                              Providencia         │
│ [Asignada] [Normal] [● E2 · 4h 10m]                      │  ← etapa (RF-53, nuevo)
│ María Espinoza                        Límite 12 ago      │
└──────────────────────────────────────────────────────────┘
```

Firma extendida, con unión discriminada para que el compilador impida pasar los dos modos a la
vez:

```tsx
type SLABadgeProps =
  | { dias: number; total: number; etapa?: never; className?: string }
  | { etapa: { numero: number; tono: SlaTone; etiqueta: string }; dias?: never; total?: never; className?: string }
```

En modo etapa reutiliza `SLA_CLASSES[tono]` **sólo para el punto**, sobre fondo neutro. Cuando
la solicitud no tiene datos de etapa, la píldora no se renderiza: una píldora gris que dice
"sin datos" en cada fila de la bandeja es ruido, y el dato ya está en el detalle.

**Vista "SLA en riesgo" — criterio: unión.** La pregunta que la vista responde es "¿qué tengo
que mirar hoy?", y tanto un vencimiento agregado como una etapa desbordada califican. Filtrar
sólo por uno de los dos escondería casos reales. La fórmula extiende la que ya vive en
`lib/solicitudes.ts:99`:

```
OR(
  FIND("VENCIDO",{semaforo_sla})>0,
  FIND("EN RIESGO",{semaforo_sla})>0,
  {sla_semaforo_etapa}="ambar",
  {sla_semaforo_etapa}="rojo"
)
```

Se agrega un filtro nuevo en la URL, `?sla_etapa=ambar|rojo`, para aislar el reloj por etapa sin
tocar el contrato de `?sla=`, que sigue significando el agregado. El contador de la pestaña
(`/api/solicitudes/contadores`) cuenta la unión, que es lo que la pestaña muestra.

> **`sla_semaforo_etapa` se compara por igualdad, no por `FIND`, y eso es deliberado.** RO-13
> obliga a filtrar por el formato real que emite la fórmula. Esta fórmula la escribimos nosotros
> en M-13 y emite exactamente cuatro literales en minúscula, sin emoji ni adornos —precisamente
> para no repetir el problema de `semaforo_sla`, cuyos literales con emoji obligaron a filtrar
> por subcadena—. El contrato queda fijado en el criterio de aceptación de M-13, que sigue
> exigiendo verlos salir aunque el campo ya exista (**§9.6-R5**).

**Detalle (§1.3) — cronología de las siete etapas.** Va en la pestaña **Historial**, arriba del
listado de `A_Eventos`, como sección propia "Cronología de etapas (SLA)". No se crea un
componente de timeline nuevo: se **generaliza `HistorialItem`**
(`components/console/solicitud-detail.tsx:1062`) para aceptar `tono?: SlaTone`, `subtitulo?` y
un icono ya presente en el repo, y el riel vertical existente se reutiliza tal cual. Cada etapa
muestra: número y nombre, responsable (§5.2.3), entrada y salida con hora, tiempo hábil
consumido contra el par ideal/máximo, y estado.

```
● 1 · Ingreso de solicitud            Control y Seguimiento    ✅ 1h 40m de 2h / 3h
│   10 ago 09:10 → 10 ago 11:40
● 2 · Coordinación de visita          Tasador                  🟡 4h 10m de 4h / 6h
│   10 ago 11:40 → en curso
○ 3 · Informe post-llamado            Tasador                  Pendiente
○ 4 · Aviso de coordinación al cliente  Control y Seguimiento  Pendiente
…
```

**Alertas visuales en el detalle.** Cuando la etapa vigente está en ámbar o rojo, se muestra un
`Alert` (`components/ui/alert.tsx`, ya existente) sobre las pestañas, en la variante que
corresponda, y la píldora de etapa acompaña a `SLABadge` en la cabecera. Literales propuestos,
en el estilo de §6.1 —segunda persona, sin signos de exclamación, sin culpar al usuario, sin
error técnico—:

- Ámbar: **"La etapa {n} · {nombre} alcanzó su plazo ideal. Vence el {fecha} a las {hora}."**
- Rojo: **"La etapa {n} · {nombre} superó su plazo máximo el {fecha} a las {hora}. Responsable: {área}."**

> Estos dos literales **no están en §6 del Blueprint**: son nuevos y quedan propuestos, no
> ratificados. Se implementan tal cual están escritos y se listan en §13 para que se incorporen
> al catálogo de mensajes canónicos en el próximo bump. Ninguna otra pantalla los reutiliza
> mientras tanto.

#### Alertas y notificaciones

**AT08 · Alertas SLA — hay que crearla (§9.6-R2).** La *Automation* no existe. Lo que sí existe
es su **fila de inventario** en `C_AutomationsAirtable` (`recxWkj3x8tzqzHmo`, `estado =
Inventariado`, del 03-jun-2026): un apunte de diseño, no algo desplegado. Por eso la Tanda F es
**creación y no extensión** —hay que escribir el script, crear la automatización y activarla—,
con la obligación añadida de **cerrar el ciclo del registro** en el mismo turno (F-5 · M-17), y
no de crear una segunda fila `AT08`. Se crea como `AT08_Alertas_SLA` —TitleCase, como las cuatro
desplegadas; el registro dice `AT08_alertas_sla` y se corrige—, trigger `cron` 08:00 diario, y
hace todo dentro de Airtable, sin depender de que Railway esté arriba: busca las solicitudes con
`sla_semaforo_etapa` en (`ambar`, `rojo`) **o** con el agregado en riesgo, arma el resumen que
§1.7 pide ("visible en la Vista de SLA"), y por cada solicitud **en rojo** encola la notificación
al responsable de área. Puede hacerlo sin recalcular nada porque el semáforo es una fórmula
viva: ésa es la ventaja de haber materializado los dos instantes en vez del color.

**Notificación de rojo por área (§5.2.8).**

- **Canal:** correo, el único canal de v1.9 (§5.3; WhatsApp es FUT-EJ-10).
- **Destinatario:** por área, desde `C_NotificacionesConfig`, tres filas nuevas con
  `evento = sla_alerta_roja` —la opción ya existe en el select— y `destinatarios_to_modo`
  `lista_fija` para Control y Seguimiento y Visado, y `campo_cliente` con
  `destinatario_campo = M_Tasadores.email` para las etapas del tasador. La escalada va **al
  responsable de la etapa**, no al dueño de la solicitud (§5.2.3).
- **Plantilla:** en `C_NotificacionesConfig.plantilla_asunto` / `plantilla_cuerpo`, igual que
  SC05 y por la misma razón: `C_Plantillas` no tiene ningún campo donde quepa un cuerpo HTML
  (§9.5.1).
- **Envío:** escenario Make nuevo **`SC-SLA-Alertas`**. Es el único camino: la app no tiene
  librería de correo y P8.6 no agrega dependencias. Crear un escenario nuevo **exige aprobación
  explícita de Sergio** (`CLAUDE.md`) — es el checkpoint M-15, y es una compuerta, no un aviso.
  El nombre no es SC13: se sigue el precedente de §9.5.1, donde el escenario que la spec llama
  SC13 se construyó como SC05 y el alias quedó documentado (RO-14).
- **Idempotencia:** `TX_Notificaciones.clave_notif = "{codigo_solicitud}-sla-rojo-{etapa_key}"`.
  Una alerta por solicitud y por etapa, para siempre: si la etapa 2 sigue roja cinco días, el
  responsable recibe **un** correo, no cinco. Es la misma clave natural que hace idempotente a
  SC05 y se verifica con el mismo guard antes de insertar.
- **Ámbar no notifica por correo.** §5.2.8 pide indicador visual en ámbar y *notificación* en
  rojo. El ámbar vive en la bandeja, en el detalle y en el resumen diario de AT08. Mandar correo
  en ámbar convertiría la alerta roja en ruido de fondo en dos semanas.

**Alerta de fin de jornada para reprocesos abiertos (§5.2.5).** **Queda diferida** junto con todo
el reproceso — ver abajo. No hay nada que alertar mientras no exista la marca de reproceso.

#### Reglas de reproceso

**El reproceso de §5.2.5 (matriz R1–R3 y regla "reproceso limpio" · RN-55) queda diferido en
§1.9 · FUT-EJ-08.** No entra en ninguna tanda de P8.6. La propia spec lo declara así en §5.2.5
("la marca de reproceso, el catálogo cerrado de motivos y la tabla `TX_Reprocesos` siguen
diferidos; en v1.9 el reproceso se gestiona fuera del sistema, en el hilo de correo original") y
§5.2.5 existe para fijar el compromiso de servicio, no para pedir implementación. Implementarlo
ahora exigiría una tabla nueva, un catálogo cerrado de motivos que nadie ha elicitado y una marca
de estado que la máquina de estados de §2.11 no contempla. La alerta de fin de jornada de §5.2.8
se difiere con él, por dependencia directa.

**Ratificado en v1.10 (Decisión 3), sin cambios.** El diferimiento se revisó al incorporar las
decisiones de negocio y se confirma tal cual: **ni la matriz R1–R3 ni RN-55 entran en ninguna
tanda de esta iteración**, y `FUT-EJ-08` sigue siendo su único domicilio. Este párrafo es el
anclaje greppable de la ratificación; el diferimiento en sí no se reescribe ni se duplica en
otra sección.

#### Impacto en documentos vigentes (se listan, no se editan)

- **`docs/diseno.md`** — la nota de §3 dice "El reloj por etapa **no está implementado**
  (CI-005) y su UI no está diseñada". Tras P8.6 queda diseñada y parcialmente implementada. El
  bloque TabsVistas (vista 2, "SLA en riesgo") pasa a ser unión. §216 lista `semaforo_sla` entre
  los campos de sólo lectura sin mencionar `sla_semaforo_etapa`.
- **`docs/construccion.md`** — §5 documenta el filtro de "SLA en riesgo" con sus literales; §9
  (paso 7) afirma que "AT08 actualiza `semaforo_sla` en `TX_Solicitudes`", que no es lo que AT08
  hará: el semáforo es fórmula y AT08 sólo resume y notifica. §85 lista "AT08 activo en Airtable"
  como prerrequisito de un paso ya construido.
- **`docs/aprendizajes.md`** — sólo-append. Al cerrar P8.6 corresponde una entrada nueva; y hay
  al menos dos candidatas a regla activa: la trampa de zona horaria con DST y el patrón
  "materializar el instante, no el color" que hace innecesario el cron de refresco.
- **`docs/CODE_INCONSISTENCIES.md`** — **CI-005** se cierra parcialmente con P8.6: los pasos (2),
  (3) y (4) de su resolución quedan cubiertos; el (1) —poblar `C_SLA`— es de negocio y depende de
  M-11. **CI-007** (`H_Feriados` vs `C_Feriados`) sigue abierta y P8.6 la respeta usando el
  nombre real: **§9.6-R1** no la cierra, la ratifica. Conviene además anotar en CI-007 que el
  saneamiento de datos de la tabla (fila basura, duplicado, `anno`, el par
  `nombre`/`nombre_feriado`) es **M-12** de este plan, para que la corrección de la spec y la de
  los datos no se confundan: son dos trabajos distintos sobre el mismo objeto.
- **`C_AutomationsAirtable`** *(dato, no documento)* — la fila `recxWkj3x8tzqzHmo` describe un
  AT08 que dispara "SC13" y se llama `AT08_alertas_sla`. Ninguna de las dos cosas será cierta al
  cerrar la Tanda F. Se corrige en **F-5 · M-17** (**§9.6-R2**), no aquí.
- **`docs/schema-airtable.md`** — no refleja `C_SLA_Etapas` ni los 21 campos nuevos. Se actualiza
  **dentro** de la Tanda A, no después: P1/Types y los Route Handlers lo leen como fuente.
- **`CLAUDE.md`** — la tabla de escenarios Make no tiene fila para `SC-SLA-Alertas`; la lista de
  `C_SLA` menciona las dos familias duplicadas de campos sin decir cuál gana.
- **`docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md`** — **no requiere cambios**: es la
  fuente normativa y P8.6 la implementa sin desviarse. Las dos divergencias que P8.6 encuentra
  son de la spec hacia la base, ya registradas y sin editar aquí: `H_Feriados` no existe
  (CI-007 · **§9.6-R1**) y `sla_revision` en `C_SLA` tampoco (§5.2.4 · etapa 7 y §3.2 lo dan por
  existente · **§9.6-R3**). Se suma una tercera, menor, detectada en la reverificación de v1.9:
  §3.2 nombra un `sla_aplicable` global que tampoco existe —el agregado vive en `dias_totales`—.
  Las tres se corrigen en el próximo bump normativo, con su changelog, no dentro de esta tanda
  (RO-15).

### §9.6.2 Construcción — Tandas

#### Tanda A · Preparación de datos

**Precondición:** ninguna. Es la primera y bloquea a todas.
**Actor:** Sergio (Airtable UI) + Claude Code (MCP para datos y documentación).
**Entregable:** schema Airtable listo, matriz sembrada, `C_Feriados` limpia,
`docs/schema-airtable.md` actualizado con IDs reales.

1. **A-1 · Crear `C_SLA_Etapas`** con sus 8 campos. **La tabla no existe** (reverificado el
   10-ago-2026: 66 tablas, ninguna con ese nombre), así que A-1 es su creador y **M-11.b no
   puede correr antes**. Vía MCP si `create_table` lo permite; si falla, queda para M-9 en la
   UI. Sembrar las 7 filas de §5.2.4 **copiando la tabla de §9.6.1**, sin redondear ni
   convertir: `0.5` es media hora, no 30. Los catorce números son **dato cerrado (Decisión 1)**:
   A-1 los carga, M-10 los verifica contra la spec y M-11.b los ratifica como negocio. Ninguno
   de los tres pasos abre una elicitación.
2. **A-2 · Crear los 20 campos de datos en `TX_Solicitudes`** (14 timestamps + 4 derivados + 2
   de pausa). El MCP no siempre puede crear campos en `TX_Solicitudes` (aprendizaje ya conocido
   de P0.5): cada fallo se marca `pendiente_ui_manual` y pasa a M-9.
3. **A-3 · Crear los 3 campos nuevos de `C_SLA`** (`sla_revision_horas` · **§9.6-R3**,
   `matriz_etapas`, `activo_desde`) y **reportar** —sin borrar— el estado de las dos familias
   duplicadas. El recuento ya está hecho en la reverificación de v1.9 y da **0 filas no vacías**
   en `sla_dias` / `sla_dias_alerta` / `sla_dias_vencido` sobre un total de 1 fila: se vuelve a
   correr al momento de ejecutar la tanda —la tabla puede haber crecido— y se entrega la salida
   literal, no el número recordado (**RO-02**), porque es la evidencia con la que **M-11.a**
   ejecuta el borrado. La reverificación del 10-ago-2026 la volvió a confirmar: **0 de 1**.
   `activo_desde` se crea aquí porque la fila default de M-11.a lo puebla (**§9.6-R4**).
   **A-3 crea además `sla_semaforo_etapa` en `TX_Solicitudes`** —la fórmula de M-13, por MCP:
   `create_field` acepta `type: "formula"` (**§9.6-R5**)—, de modo que A-2 y A-3 juntos dejan los
   21 campos del *Modelo de datos* y M-13 queda cerrado dentro de la Tanda A.
4. **A-4 · Auditar `C_Feriados`** (**§9.6-R1**) y entregar la lista exacta de correcciones, que
   la reverificación de v1.9 ya dejó cerrada:
   - la fila basura `recdfwWtdHFcm05sb` (sin `fecha`, `nombre = "nombre_feriado"`, `tipo = "tipo"`);
   - el duplicado de 2027-01-01: se conserva **`recGB2eUtwWs3cIuM`** (`activo = true`, `nombre`
     poblado) y se borra **`reckuUbALWocT4kWX`**, que además tiene el **primary field vacío** y
     ya está en `activo = false` —o sea, el motor hoy no lo ve, y por eso esto es higiene y no un
     bug latente—;
   - las **5** filas de 2026 sin `anno` — `recTAX7ivrtBMsBJy` (Sábado Santo), `recUnyg8a9Lz9fTKj`
     (Asunción), `recYGijUy3oAQUtRk` (Glorias del Ejército), `recA6Z458pK6M6kOv` (Iglesias
     Evangélicas), `recipUaWrj6Wy461y` (Todos los Santos). **v1.8 decía 8; son 5** (la sexta sin
     `anno` es la fila basura, que se borra);
   - la opción huérfana **`"tipo"`** en el select `tipo` (`fldoep4CBwmSObgBx`), que dejó la fila
     basura al importarse;
   - el par redundante **`nombre` / `nombre_feriado`**, divergente en `recwAPk3zbnLgctHn`
     (`"Dia del Trabajo"` vs `"Dia del Trabajador"`) y con `nombre_feriado` vacío en 6 filas;
   - los feriados de **2027 faltantes** (hoy sólo está Año Nuevo).

   **No ejecutar ningún borrado ni rename**: todo es M-12. El motor lee sólo `fecha` y `activo`,
   así que nada de esto bloquea la Tanda B.
5. **A-5 · Backfill de las solicitudes existentes** (~54 filas), vía MCP, sólo datos: para cada
   fila, `sla_e1_inicio_ts = fecha_solicitud`; y si `fecha_asignacion_ts` está poblada,
   `sla_e1_fin_ts = sla_e2_inicio_ts = fecha_asignacion_ts`. Sin backfill, toda la cartera
   histórica queda en `sin_dato` y el E2E no tiene contra qué correr. Se ejecuta **después** de
   M-9 y se reporta fila por fila.
6. **A-6 · Actualizar `docs/schema-airtable.md`** con la tabla nueva y los 21 campos, con sus
   `tbl…`/`fld…` reales.

**Checkpoints:** **M-9** (bloqueante), **M-10**, **M-11.a** (bloqueante) y **M-11.b**, **M-12**,
**M-13** (~~bloqueante~~ · **cerrado el 10-ago-2026** vía MCP en A-3 · **§9.6-R5**).

**Criterio de aceptación de Tanda A:** `C_SLA_Etapas` existe con 7 filas cuyos catorce valores
coinciden uno a uno con §5.2.4; los 21 campos existen en `TX_Solicitudes` con el tipo declarado
y `timeZone = America/Santiago` en los 14 timestamps (o están listados como
`pendiente_ui_manual`); `C_SLA` tiene `sla_revision_horas`, `matriz_etapas` y `activo_desde`, su
fila `SLA_DEFAULT_GLOBAL` cargada con 3 / 2 / 3 y los tres links vacíos, y **ya no tiene** los
campos `sla_dias`, `sla_dias_alerta` ni `sla_dias_vencido`;
`C_Feriados` devuelve 15 filas de 2026 y las de 2027 sin duplicados ni filas sin fecha;
**cero ocurrencias de `H_Feriados`** en los artefactos de P8.6 (verificable con
`grep -rn "H_Feriados" lib/ app/ docs/_artefactos/`, que debe salir vacío · **§9.6-R1** ·
**RO-02**); `docs/schema-airtable.md` refleja todo con IDs reales.

#### Tanda B · Motor de cálculo

**Precondición:** Tanda A cerrada hasta A-1 (la matriz sembrada). El motor no toca Airtable, así
que puede escribirse en paralelo a M-11.a/M-11.b/M-12.
**Actor:** Claude Code.
**Entregable:** `lib/sla-habil.ts`, `lib/sla-etapas.ts`, `lib/feriados.ts` y sus tests, más los
dos artefactos de infraestructura que la tanda tuvo que producir para que lo anterior corriera
(ratificados en **v1.12**; la tanda ya está cerrada, sólo se completa el listado):

- **`vitest.config.mts`** — el alias `@/` vivía sólo en `tsconfig.compilerOptions.paths`, que
  Next resuelve por su cuenta y el runner no lee. Los tres tests previos del repo no lo notaban
  porque sólo importan módulos hoja por ruta relativa; `sla-etapas.test.ts` es el primero que
  alcanza un módulo de `lib/` con dependencias transitivas y falló con
  `Cannot find package '@/lib/airtable-client'`. Extensión **`.mts`**, no `.ts`: con `.ts` Vite
  lo carga como CommonJS y `import.meta.url` emite un warning de sintaxis ESM en cada corrida.
- **`updateRecord` en `lib/airtable-client.ts`** — el repo no tenía patrón `PATCH`; `postRequest`
  pasó a aceptar el método. Es lo que permite el modo `persistir: true` del motor. Queda acotado
  por contrato a **datos derivados server-side**: las escrituras de negocio siguen pasando por
  Make (RT-03), y esta función no es la puerta trasera para saltárselo.

7. **B-1 · `lib/sla-habil.ts`** con las tres funciones de §9.6.1, sin dependencias nuevas y con
   la descomposición horaria vía `Intl.DateTimeFormat` en `America/Santiago`.
8. **B-2 · `lib/feriados.ts`** — lee `C_Feriados` server-side con el token de `.env`, filtra
   `activo = TRUE` **y** `fecha` no vacía (la fila basura de A-4 obliga a este segundo filtro,
   que se conserva aunque M-12 la borre: el dato malo puede volver), y devuelve un
   `Set<'YYYY-MM-DD'>` cacheado en memoria de proceso con TTL de 12 h, con el mismo patrón que
   `ejecutivaCache` en `lib/solicitudes.ts:190`.
9. **B-3 · `lib/sla-etapas.ts`** — `recalcularSla()` sobre la matriz leída de `C_SLA_Etapas`, sin
   ningún umbral hardcodeado.
10. **B-4 · Tests (`vitest`)**, como mínimo: dentro de ventana; arranque fuera de ventana
    (viernes 22:00 → lunes 09:00, §5.2.2); cruce de fin de semana; cruce de feriado
    (18-sep-2026); cruce del **cambio de horario chileno**, que es el caso que un offset fijo
    falla; etapa de 0.5 h; y la invariante estructural de que
    `minutosHabilesEntre(t, sumarHorasHabiles(t, h)) === h * 60` para las siete etapas y varias
    fechas de partida (**RO-06**).

**Criterio de aceptación de Tanda B:** `pnpm test` verde con los seis escenarios; `pnpm typecheck`
limpio; cero umbrales de §5.2.4 hardcodeados en el **código de producción** —los catorce números
viven en `C_SLA_Etapas` y llegan como parámetro—, verificable con:

```bash
grep -nE '\b(0\.5|24|48)\b' lib/sla-*.ts \
  | grep -v '\.test\.ts:' \
  | grep -vE '^[^:]+:[0-9]+: *(//|\*|/\*)'
```

que debe salir **vacío**. Los tres filtros son el criterio, no una licencia: se buscan sólo los
literales que no tienen otro significado posible (`2`, `3`, `4` y `6` son números de etapa y de
día de la semana en el propio motor), se excluyen los fixtures —donde el literal de §5.2.4 es el
valor esperado y su presencia es correcta— y se excluyen los comentarios. Ver **§9.6-R6**, que
documenta las dos versiones falladas de este comando y por qué.

#### Tanda C · API y contratos

**Precondición:** Tandas A y B cerradas. M-13 aplicado (la fórmula existe).
**Actor:** Claude Code + Sergio (M-14).
**Entregable:** el semáforo por etapa expuesto server-side, y los dos blueprints que escriben
los timestamps de e1 y e2.

11. **C-1 · Extender el tipo `Solicitud`** (`lib/console-data.ts:113`) con
    `slaEtapa?: { numero, nombre, tono, etiqueta, alertaTs, venceTs }`, opcional para no romper
    los 8 mocks del archivo ni el formulario de alta.
12. **C-2 · `SOLICITUD_FIELDS` y `mapRecord`** (`lib/solicitudes.ts:218` y `:394`) incorporan
    `sla_etapa_actual`, `sla_etapa_alerta_ts`, `sla_etapa_vence_ts` y `sla_semaforo_etapa`. El
    tono **no se recalcula en el mapper**: llega de la fórmula. La etiqueta de tiempo restante sí
    se deriva ahí, server-side.
13. **C-3 · Vista y filtro:** `buildVistaFormula('sla_riesgo')` pasa a la unión de §9.6.1; se
    agrega `sla_etapa` a `SolicitudesFiltros` con su lista cerrada de valores, escapado como el
    resto (RF-05 · D-07).
14. **C-4 · `GET /api/solicitudes/[id]/sla`** — devuelve las 7 etapas con nombre, responsable,
    timestamps, minutos hábiles consumidos, umbrales y estado. Es la fuente del timeline de la
    Tanda E. Sólo lectura, token server-side.
15. **C-5 · `POST /api/solicitudes/[id]/asignar`** (existente) calcula, **antes** de llamar a
    SC-Asignar, `sla_e1_fin_ts`, `sla_e2_inicio_ts`, `sla_etapa_actual = 2`,
    `sla_etapa_alerta_ts`, `sla_etapa_vence_ts` y `sla_recalculado_ts`, y los agrega al payload.
    La escritura la sigue haciendo Make: **la UI no escribe Airtable y el motor no escribe
    Airtable** — el motor calcula, Make persiste.
16. **C-6 · Blueprints, aditivos y sin tocar hooks:**
    - `SC01 - Crear solicitud.blueprint.json` → mapea `sla_e1_inicio_ts` (hito §5.2.2 desde el
      wizard), `sla_etapa_actual = 1`, `sla_etapa_alerta_ts`, `sla_etapa_vence_ts`. Bump de
      `name`.
    - `SC-Asignar.blueprint.json` → **v2.1**, agrega los seis campos de C-5 al `record` del
      `ActionUpdateRecords` que ya existe. Hook `3441086` y conexión `8847431` **intactos**.
    - Verificación B-3 de §9.5.2 antes de entregar: claves del `mapper` contrastadas contra un
      módulo hermano probado, y namespace de los operadores de todo filtro.
17. **C-7 · Wizard:** campo oculto `slaInicioTs` inicializado al montar la Fase 1, y su clave en
    el payload de creación. En "Editar solicitud" el campo es editable mientras el estado sea
    `creada` (REGLA C).

**Checkpoint:** **M-14**.

**Criterio de aceptación de Tanda C:** `GET /api/solicitudes` devuelve `slaEtapa` poblado para
una solicitud con etapa en curso y ausente para una sin datos; `GET /api/solicitudes/[id]/sla`
devuelve siete entradas siempre, con `estado: 'pendiente'` en las no instrumentadas; los dos
`.json` parsean y conservan sus hooks; `pnpm build` limpio.

#### Tanda D · UI de bandeja

**Precondición:** Tanda C cerrada.
**Actor:** Claude Code.
**Entregable:** píldora de etapa en la fila y filtro "SLA en riesgo" extendido.

18. **D-1 · Extender `SLABadge`** con la unión discriminada de §9.6.1. `StateBadge` y
    `PriorityChip` no se tocan. Cero componentes nuevos.
19. **D-2 · `FilaSolicitud`** (`components/console/solicitud-list.tsx:450`) renderiza la píldora
    de etapa en la línea de badges, después de `PriorityChip`, y sólo cuando hay dato.
20. **D-3 · Pestaña "SLA en riesgo"** con el contador de la unión, y selector de filtro
    `?sla_etapa=` junto a los que ya existen, con su sincronización a la URL como el resto.
21. **D-4 · Cabecera del detalle** (`solicitud-detail.tsx:309`): la píldora de etapa acompaña a
    `SLABadge`, con el mismo criterio de no renderizar sin dato.

**Criterio de aceptación de Tanda D:** con una solicitud cuya etapa está en ámbar, la fila
muestra las dos píldoras y se distinguen a simple vista; la pestaña "SLA en riesgo" la incluye
aunque su agregado esté verde; recargar con `?vista=sla_riesgo&sla_etapa=rojo` restaura el estado
exacto; `pnpm typecheck` limpio.

#### Tanda E · UI de detalle

**Precondición:** Tanda C cerrada. Puede ir en paralelo a D.
**Actor:** Claude Code.
**Entregable:** cronología de las 7 etapas y alertas visuales, sin librerías nuevas.

22. **E-1 · Generalizar `HistorialItem`** con `tono?` y `subtitulo?`, sin cambiar su
    comportamiento actual para los eventos de `A_Eventos`.
23. **E-2 · Sección "Cronología de etapas (SLA)"** al inicio de la pestaña Historial, alimentada
    por `GET /api/solicitudes/[id]/sla`, con el layout de §9.6.1: número, nombre, responsable,
    entrada/salida con hora, tiempo hábil consumido contra ideal/máximo y estado.
24. **E-3 · `Alert` ámbar/rojo** sobre las pestañas cuando la etapa vigente lo amerite, con los
    dos literales propuestos de §9.6.1.
25. **E-4 · Estado vacío honesto:** sin datos de etapa, la sección dice "Todavía no hay
    cronología de etapas para esta solicitud." y lista las siete como pendientes. No se inventan
    tiempos ni se muestra verde por defecto.

**Criterio de aceptación de Tanda E:** una solicitud recién creada muestra e1 en curso y seis
pendientes; una asignada muestra e1 completada con su tiempo hábil real y e2 en curso; una
solicitud del backfill sin `fecha_asignacion_ts` no muestra ningún ámbar fabricado;
`pnpm build` limpio.

#### Tanda F · Alertas

**Precondición:** Tandas A–E cerradas y verificadas en pantalla. **M-15 aprobado.**
**Actor:** Sergio (Airtable Automations UI, Make UI) + Claude Code (script y blueprint).
**Entregable:** `AT08_Alertas_SLA` + `SC-SLA-Alertas` + configuración de destinatarios.

26. **F-1 · `docs/_artefactos/airtable/AT08-AlertasSLA.js`** con el encabezado que exige
    §10.4.2 (tabla destino, trigger, inputs, outputs). Lógica: buscar ámbar/rojo por etapa y en
    riesgo agregado → componer resumen → por cada solicitud **en rojo**, verificar
    `TX_Notificaciones.clave_notif` y, si no existe, crear la fila y postear a `SC-SLA-Alertas` →
    escribir `LogEscenarios` con `Escenario = AT08_SLA`.
27. **F-2 · `docs/_artefactos/make/SC-SLA-Alertas.blueprint.json`**: webhook → validación HMAC
    (D-03) → `Search C_NotificacionesConfig` (`evento = sla_alerta_roja`, `activa = true`,
    área) → router (sin destinatario → `TX_Notificaciones(Error)` + `Log(⚠ Parcial)`; ya enviado
    → `Log(⏭ Omitido)`; envío → correo + `TX_Notificaciones(Enviado)` + `A_Eventos` +
    `Log(✓ OK)`) → respond 200. Mismo esqueleto que SC05, misma conexión de correo verificada en
    M-1.
28. **F-3 · Filas de `C_NotificacionesConfig`** para las tres áreas, con asunto y cuerpo en
    es-CL siguiendo §6.1.
29. **F-4 · Env var** `MAKE_WEBHOOK_URL_SC_SLA` en `.env.example` y en Railway.
30. **F-5 · Cerrar el ciclo del registro (§9.6-R2).** Actualizar la fila existente
    `recxWkj3x8tzqzHmo` de `C_AutomationsAirtable` — **no crear una segunda fila `AT08`**:
    `nombre_automation` → `AT08_Alertas_SLA` (TitleCase, como las cuatro desplegadas);
    `estado` → `Activo` **sólo después de M-18**, nunca antes; `descripcion` → reemplazar
    *"dispara SC13"* por *"dispara SC-SLA-Alertas"* (RO-14: SC13 es el nombre de la spec, el
    escenario real es SC-SLA-Alertas); `tablas_lee` → `TX_Solicitudes, C_SLA, C_SLA_Etapas`;
    `tablas_escribe` → `TX_Notificaciones, LogEscenarios`. Es el paso que evita que el inventario
    quede mintiendo justo sobre la automatización que este plan crea.

**Checkpoints:** **M-15** (compuerta de aprobación), **M-16**, **M-17**, **M-18**.

**Criterio de aceptación de Tanda F:** AT08 existe con trigger cron 08:00 y queda **sin activar**
hasta pasar el E2E; el `.js` y el `.json` existen y no contienen datos inventados; hay tres filas
en `C_NotificacionesConfig` con `activa = true`; `LogEscenarios.Escenario` tiene la opción
`AT08_SLA`; `C_AutomationsAirtable` tiene **exactamente una** fila con `codigo = AT08`, es
`recxWkj3x8tzqzHmo`, y su `nombre_automation` dice `AT08_Alertas_SLA`.

#### Tanda G · QA end-to-end

**Precondición:** Tandas A–F cerradas. AT08 activada (M-16 tras M-18).
**Actor:** Sergio (ejecución) + Claude Code (preparación de datos y lectura de trazas).
**Entregable:** los nueve casos de §9.6.3 verificados con evidencia.

31. **G-1 · Preparar el juego de datos** de §9.6.3 con MCP.
32. **G-2 · Ejecutar los nueve casos** y capturar la evidencia: fila de `TX_Solicitudes` con sus
    timestamps, `LogEscenarios`, `TX_Notificaciones`, `A_Eventos` y la pantalla.
33. **G-3 · `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P8.6.md`** con la plantilla de §11.2, y
    `docs/_notas/snapshot-P8.6.md`.

**Criterio de aceptación de Tanda G:** los nueve casos de §9.6.3 en verde, cada uno con su
evidencia citada, no con un "verificado" sin respaldo (**RO-02**).

#### Checkpoints manuales de Sergio

La numeración continúa la serie de §9.5 (M-1 … M-8) para que ningún nombre se repita dentro del
plan.

| # | Acción | Cuándo |
|---|---|---|
| M-9 | Crear en la UI de Airtable lo que el MCP no haya podido: `C_SLA_Etapas` y/o los campos de `TX_Solicitudes` marcados `pendiente_ui_manual`. Confirmar tipo `dateTime` **con hora** en los 14 timestamps y **`timeZone = America/Santiago`**, no `client` (así quedó `fecha_solicitud`, y es la trampa que el motor no debe heredar). **Además, y sin relación con SLA:** abrir Airtable → Automations y confirmar que **`AT02_Asignar_Tasador` está apagada**. El registro `C_AutomationsAirtable` la marca `Activo` y ninguna API puede desmentirlo; encendida rompe la REGLA A · D-15 y choca con el guard 409 de `asignar/route.ts` | **Antes** de A-5 · bloqueante para todo P8.6 |
| M-10 | Verificar las 7 filas de `C_SLA_Etapas` contra §5.2.4 leyendo la spec, no el plan | Tras A-1 |
| M-11.a | **Cargar el baseline del SLA agregado** (Decisión 2 · **§9.6-R4**). Crear en `C_SLA` la fila global default `SLA_DEFAULT_GLOBAL` con `cliente`/`tipo_informe`/`tipo_propiedad` **vacíos** (el comodín no se escribe `*`: son links), `dias_totales = 3`, `dias_alerta_amarilla = 2`, `dias_alerta_roja = 3`, `sla_revision_horas` **vacío** (sin override de e7 · **§9.6-R3**), `activo = true`, `activo_desde` = fecha de carga. Verde no se carga: es 0 a 1 día, derivado del ámbar. Y **borrar la familia perdedora** `sla_dias`/`sla_dias_alerta`/`sla_dias_vencido` tras reconfirmar con la salida literal de A-3 que están vacías en las filas existentes (al 10-ago-2026: **0 de 1**). **Ya no se elicita nada**: Héctor y Óscar son validadores post-carga si quieren revisar la fila default, no bloqueadores | **Antes** de Tanda C · bloqueante para RF-08 |
| M-11.b | **Cargar y ratificar la matriz por etapa** (Decisión 1). Las 7 filas de §5.2.4 en `C_SLA_Etapas` con sus valores literales: e1 `2`/`3` · e2 `4`/`6` · e3 `0.5`/`0.5` · e4 `2`/`3` · e5 `24`/`48` · e6 `2`/`3` · e7 `0.5`/`0.5` (por informe). Son **datos cerrados por Héctor**: se cargan, no se definen. La carga material la ejecuta **A-1** y la verificación contra la spec es **M-10**; M-11.b es el visto bueno de negocio sobre esa copia. **Depende de A-1 / M-9** (la tabla no existe todavía) | Tras M-10 · no bloquea a M-11.a |
| M-12 | Limpiar `C_Feriados` (**§9.6-R1**) con la lista cerrada de A-4: borrar la fila basura `recdfwWtdHFcm05sb`; borrar el duplicado `reckuUbALWocT4kWX` y conservar `recGB2eUtwWs3cIuM`; borrar la opción `"tipo"` del select `tipo` una vez que no quede fila usándola; completar `anno` en las **5** filas de 2026 que lo tienen vacío; decidir el par `nombre`/`nombre_feriado` —lo natural es dejar `nombre` (es el primary) y vaciar o eliminar `nombre_feriado`, revisando antes la divergencia de `recwAPk3zbnLgctHn`—; y cargar 2027 completo | Tras A-4 |
| M-13 | ✅ **CERRADO el 10-ago-2026 — creado vía MCP durante A-3, sin turno manual** (**§9.6-R5**). `sla_semaforo_etapa` = `fldB6gJ3clZUPgaZk`, `isValid: true`, `referencedFieldIds` = `sla_etapa_vence_ts` + `sla_etapa_alerta_ts`, `result.type` = `singleLineText`. Queda pendiente **sólo la verificación de contrato**: con una fila de cada caso, confirmar que emite exactamente `verde`/`ambar`/`rojo`/`sin_dato`, en minúscula y sin emoji. Eso se hace en el E2E de la Tanda C, no en un turno propio de UI | ~~Antes de Tanda C~~ · hecho |
| M-14 | Reimportar `SC01` y `SC-Asignar` v2.1 en eu1 y **pausar la versión anterior en el mismo turno** (RO-10). Verificar en el diseñador que los seis campos SLA llegan mapeados y ninguno aparece vacío | Tras C-6 |
| M-15 | **Aprobar la creación del escenario `SC-SLA-Alertas`** en Make. Sin este `sí` explícito, la Tanda F no arranca | **Antes** de F-2 |
| M-16 | Crear `AT08_Alertas_SLA` en Airtable Automations con trigger cron 08:00 y el script de F-1, y **dejarla en borrador**. Usar ese nombre exacto en TitleCase (**§9.6-R2**), no el `AT08_alertas_sla` que trae el registro | Tras F-1, **antes** de M-18 |
| M-17 | Crear las 3 filas de `C_NotificacionesConfig`; agregar la opción `AT08_SLA` a `LogEscenarios.Escenario`; y **actualizar la fila `recxWkj3x8tzqzHmo` de `C_AutomationsAirtable`** según F-5 — sin crear una segunda fila `AT08`, y dejando `estado = Inventariado` hasta que M-18 pase | Antes de M-18 |
| M-18 | Correr AT08 en modo prueba con una solicitud en rojo y verificar: llega **un** correo al área correcta, `TX_Notificaciones` tiene **una** fila, y una segunda corrida no genera un segundo correo. Recién ahí activar AT08 y recién ahí poner `estado = Activo` en su fila de registro | Tras M-16 |

> **M-13 está creado, pero su contrato sigue sin verificarse (v1.11).** El campo existe y
> Airtable lo dio por válido (`fldB6gJ3clZUPgaZk`, `isValid: true`), así que ya no hay un turno
> manual bloqueando la Tanda C. Lo que **no** cambió es por qué el checkpoint existía: toda la
> vista "SLA en riesgo", el filtro y el contador se apoyan en los literales que emite esa
> fórmula, y si emite algo distinto de lo acordado —una mayúscula, un emoji, un acento en
> "ámbar"— el filtro devuelve **cero filas para toda la tabla**, que se lee como "no hay casos" y
> no como "el filtro está mal". `isValid` sólo dice que la sintaxis compila, no qué cadena sale.
> La verificación de los cuatro literales se hace con una fila de cada caso en el E2E de la
> Tanda C (E2E-13, E2E-14, E2E-15), cuesta treinta segundos y sigue siendo obligatoria. Es el
> fallo silencioso de RO-13.

> **M-11 dejó de ser una compuerta de tiempo ajeno (v1.10).** Hasta v1.9, M-11 esperaba que
> Héctor y Óscar definieran umbrales, y ese tiempo de respuesta no lo controlaba el equipo
> técnico: era el único punto del plan que podía quedar detenido indefinidamente. Con las
> Decisiones 1 y 2 **ya no hay nada que preguntar** —la matriz por etapa es dato cerrado y el
> agregado tiene baseline 3 / 2 / 1—, así que M-11 pasa a ser **una carga ejecutable el mismo
> día**, en dos mitades: **M-11.a** (fila default en `C_SLA` + borrado de la familia perdedora),
> que sólo necesita A-3 y es la que sigue bloqueando RF-08 y la Tanda C; y **M-11.b** (matriz de
> 7 filas), que **depende de A-1 / M-9** porque `C_SLA_Etapas` todavía no existe. Sigue siendo
> el checkpoint que hay que atacar el primer día, pero por precedencia en el grafo, no por
> riesgo de espera. La validación de Héctor y Óscar ocurre **después** de la carga y no bloquea
> ninguna tanda: si quieren mover el baseline, se edita una fila.

### §9.6.3 Prueba end-to-end y criterios de aceptación

**Preparación:** una solicitud creada un **martes a las 10:00** (dentro de ventana), otra creada
un **viernes a las 22:00** (fuera de ventana), y una tercera creada el **jueves 17-sep-2026 a las
16:00** (víspera del feriado del viernes 18, que arrastra el fin de semana). `C_SLA_Etapas`
sembrada, `C_Feriados` limpia, AT08 en borrador.

> **Corrección de calendario respecto de v1.8.** v1.8 describía este caso como "dos feriados
> consecutivos, 18 y 19 de septiembre". **19-sep-2026 cae sábado**, así que no aporta nada al
> cómputo: ya era día no hábil. Lo que hace fuerte al caso es otra cosa —un feriado **en viernes**
> encadenado con el fin de semana produce **cuatro días corridos** sin consumo de SLA (vie 18 a
> dom 20), que es el hueco más largo del calendario 2026 y el que rompe cualquier aritmética que
> asuma "restar 24 h de reloj"—. El caso se conserva; lo que se corrige es su descripción y el
> resultado esperado.

- [ ] **E2E-10 · Dentro de ventana.** La solicitud del martes 10:00 tiene
      `sla_etapa_alerta_ts = martes 12:00` y `sla_etapa_vence_ts = martes 13:00` (2 h y 3 h de la
      etapa 1). `sla_semaforo_etapa` = `verde`.
- [ ] **E2E-11 · Fuera de ventana (§5.2.2).** La solicitud del viernes 22:00 **no** consume SLA
      el fin de semana: su alerta cae el **lunes a las 11:00** y su vencimiento el **lunes a las
      12:00**. Un correo que entra el viernes por la noche no empieza a correr hasta que abre la
      jornada.
- [ ] **E2E-12 · Cruce de feriado en viernes.** La del jueves 17-sep 16:00 con la etapa 5 (24 h
      ideales / 48 h máximas) cuenta sólo horas hábiles: el **viernes 18** no suma por feriado y
      el **sábado 19 / domingo 20** no suman por fin de semana. El cálculo a mano, que es contra
      lo que se verifica —no contra lo que devuelve el código—: jue 17 aporta 2 h (16:00→18:00),
      lun 21 y mar 22 aportan 9 h cada uno, y las 4 h que faltan caen el mié 23 de 9:00 a 13:00,
      de modo que **`sla_etapa_alerta_ts` = miércoles 23-sep-2026 13:00**. Siguiendo igual hasta
      48 h: mié 23 aporta 5 h más, jue 24 y vie 25 nueve cada uno, y la hora restante cae el lun
      28 a las 9:00, de modo que **`sla_etapa_vence_ts` = lunes 28-sep-2026 10:00**. Ambos valores
      se escriben en el reporte de la tanda **antes** de correr el código.
- [ ] **E2E-13 · Transición a ámbar.** Adelantando `sla_e1_inicio_ts` para cruzar el umbral
      ideal, la fila aparece en la pestaña "SLA en riesgo" **aunque su semáforo agregado siga
      verde**, la píldora de etapa se pone ámbar y el detalle muestra el `Alert` con el literal
      de §9.6.1.
- [ ] **E2E-14 · Transición a rojo y notificación.** Cruzado el máximo, `sla_semaforo_etapa` pasa
      a `rojo`; AT08 en modo prueba encola **un** correo al responsable del área de esa etapa
      —no al dueño de la solicitud—; `TX_Notificaciones` queda con una fila
      `{codigo}-sla-rojo-e1`; `LogEscenarios` con `AT08_SLA · ✓ OK`.
- [ ] **E2E-15 · Idempotencia de la alerta.** Segunda corrida de AT08 con la misma solicitud
      todavía en rojo: **no llega un segundo correo**, `TX_Notificaciones` sigue con una sola
      fila, `LogEscenarios` registra `⏭ Omitido`.
- [ ] **E2E-16 · Los dos relojes no se pisan.** Una solicitud con etapa en rojo y agregado en
      verde muestra las dos píldoras con colores distintos y **ninguna de las dos cambia por la
      otra**. Es la lectura correcta según §5.2, y el caso existe para que nadie la "arregle"
      más adelante.
- [ ] **E2E-17 · Degradación honesta.** Una solicitud del backfill sin `fecha_asignacion_ts`
      muestra e1 en curso y seis etapas **pendientes**; ninguna píldora de etapa en la bandeja;
      cero ámbar fabricado. `sla_semaforo_etapa` = `sin_dato`.
- [ ] **E2E-18 · Regresión de lo ya construido.** Crear, editar y asignar siguen funcionando
      end-to-end tras el bump de SC01 y SC-Asignar v2.1: el correo al tasador (§9.5) sale igual,
      `A_Eventos` recibe `asignacion_manual` y `correo_asignacion_enviado` exactamente una vez
      cada uno, y ningún campo previo quedó pisado por los seis nuevos del payload.

---

## §10 · P9 — Deploy y validación en Railway

> **⚙ Modo Claude Code recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Cualquier error se propaga a producción. Antes de cada edición y cada comando (`pnpm build`, `pnpm lint`, push, etc.), Claude Code muestra qué va a hacer y pide confirmación explícita.

### §10.1 Diseño

**Objetivo.** Reemplazar cualquier mock restante, conectar Make scenarios reales, validar en Railway, dejar la app en verde.

### §10.2 Construcción — Pasos para Claude Code

1. **Barrido de mocks:**
   ```bash
   grep -rn "mock\|MOCK\|fake\|TODO P9\|placeholder" app/ components/ lib/
   ```
   Listar y reemplazar cada uno.
2. **Env vars Railway** — Sergio los ingresa en el dashboard de Railway; Claude Code solo actualiza `.env.example`:
   ```
   AIRTABLE_API_KEY
   AIRTABLE_BASE_ID
   MAKE_WEBHOOK_URL_SC01
   MAKE_WEBHOOK_URL_SC_ASIGNAR
   MAKE_WEBHOOK_URL_SC_EDICION
   MAKE_WEBHOOK_URL_SC_UNIDADES
   MAKE_WEBHOOK_URL_SC_CONTACTOS
   MAKE_WEBHOOK_URL_SC_VENDEDOR
   MAKE_HMAC_SECRET
   CLERK_SECRET_KEY
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   ```
3. **Health check:** crear `app/api/health/route.ts` que valida conectividad a Airtable.
4. **Build local:**
   ```bash
   pnpm build
   ```
   Arreglar cualquier warning de tipos, imports no usados o `use client` faltante.
5. **Lint:**
   ```bash
   pnpm lint
   ```
6. **Smoke test manual (Sergio en local):**
   - Ver panel lista → aplica filtros → busca por VP → resultados correctos.
   - Crear solicitud manual → verifica que llega a Airtable y aparece en la lista.
   - Editar la solicitud en estado `creada` → cambios se reflejan.
   - Asignar tasador → estado pasa a `asignada`, botón desaparece, botón "Editar" desaparece, correo se envía.
   - Intentar editar tras asignar → botón "Editar" ya no está; datos en modo consulta.
7. **Push a Railway** (Sergio hace commit + push; Railway despliega solo).
8. **Smoke test en producción:** repetir los pasos anteriores en la URL Railway.
9. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P9.md` con timestamp real.

### §10.3 Criterios de aceptación

- [ ] `pnpm build` completa sin errores ni warnings.
- [ ] `pnpm lint` limpio.
- [ ] Zero `mock` / `MOCK` / `TODO P9` en el código.
- [ ] Health check devuelve 200 con Airtable OK.
- [ ] Panel lista con filtros funciona end-to-end en Railway con datos reales.
- [ ] Crear + Editar + Asignar funciona end-to-end en Railway.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P9.md` creado.

### §10.4 · Artefactos para importar/pegar (pre-checklist manual)

> **Regla dura:** el checklist manual no se genera si estos artefactos no están listos. Sin artefactos, el checklist es solo texto.

**Objetivo.** Generar los archivos concretos que Sergio va a importar en Make y pegar en Airtable Automations el día del smoke test manual.

#### §10.4.1 Blueprints Make (`.json` para importar en eu1)

Ubicación: `docs/_artefactos/make/`

- `SC01 - Crear solicitud.blueprint.json`
- `SC-Asignar.blueprint.json` (**v2.0** tras §9.5 · B-2)
- `SC-Edicion.blueprint.json` (**v3.4** · F-1 cerrado 31-jul-2026)
- `SC05-EmailTasador.blueprint.json` (§9.5 · B-1)
- `SC-Adjuntos-Upload.blueprint.json` (**v1.2** · reemplazo backend-driven · en producción sigue corriendo **v1.1**, ver export en `docs/_artefactos/produccion-actual/`)
- `SC-Adjuntos-Delete.blueprint.json` (**v1.0** · creado en Tanda 3 · RF-52)
- `SC-RF09-ExtraccionClaude.blueprint.json`

Cada blueprint debe incluir:
- Webhook trigger.
- Módulo `Search Records` en Airtable con patrón `UPPER({field}) = UPPER("{{webhookField}}")`.
- Módulos de escritura (`Update Records` / `Create Records`) — usar `ActionUpdateRecords` conforme aprendizajes.
- Módulo de validación HMAC.
- El módulo de correo **no** va en `SC-Asignar` sino en `SC05-EmailTasador`, por las razones
  de §9.5.1 (una asignación no puede fallar porque falló un correo).
- Correcciones ya documentadas: `base64`, `dropbox:getFile v5` si aplica.

Si algún módulo no se conoce con certeza, dejar TODO explícito en el JSON — mejor un blueprint parcial válido que uno inventado que falle al importar.

#### §10.4.2 Scripts Airtable Automations (`.js` para pegar)

Ubicación: `docs/_artefactos/airtable/`

- `AT01-ResolverMotorReglas.js` — si aplica al alcance de CU-002; si no, marcar como *"diferido a CU siguiente"*.
- Cualquier otro AT trigger necesario para SC01 / SC-Asignar / SC-Edicion.

Cada `.js` debe llevar en el encabezado (comentario):
- Tabla destino y dónde pegarlo.
- Trigger type y condiciones exactas.
- Inputs esperados desde la Automation.
- Outputs para el siguiente paso.

#### §10.4.3 Checklist manual — `docs/_notas/checklist-P9-manual.md`

Estructura: 6 secciones ya propuestas **con estas dos ampliaciones**:

- **Sección 2 (Make):** para cada escenario, indicar nombre del archivo `.blueprint.json` y su ubicación en el repo. Agregar sub-bloque explícito **"Envío de correo al tasador (SC05 · §9.5)"** con: módulo Gmail y su conexión (verificada en el checkpoint M-1, **no creada a ciegas**), plantilla en `C_NotificacionesConfig` (no en `C_Plantillas` — ver §9.5.1), destinatario desde **`M_Tasadores.email`** (no `AUTH_Usuarios`), adjuntos desde Dropbox, y verificación en `A_Eventos` + `TX_Notificaciones` + `LogEscenarios`.
- **Sección 2 bis (Airtable Automations):** para cada `.js`, nombre del archivo, tabla destino, trigger type, condiciones exactas y variables a mapear en Input variables.
- **Sección 5 (Smoke test):** sub-verificación explícita del correo al tasador — bandeja del tasador de prueba, asunto, cuerpo, registro en `A_Eventos`. Los ocho casos E2E están en **§9.5.3**; los dos que no se pueden omitir son **E2E-4** (idempotencia: reenviar el payload no genera un segundo correo) y **E2E-5** (tasador sin email: la asignación se completa igual).

Todo lo demás del checklist queda tal cual la propuesta original.

#### §10.4.4 Criterios de aceptación de §10.4

- [ ] Los blueprints listados en §10.4.1 existen en `docs/_artefactos/make/`.
- [ ] Los `.js` de Automations existen en `docs/_artefactos/airtable/` (o marcados como diferidos con justificación).
- [ ] `docs/_notas/checklist-P9-manual.md` existe con las 6 secciones + ampliaciones 2, 2 bis y 5.
- [ ] Ningún artefacto contiene datos inventados; TODOs claros donde falte información.

---

## §11 · Cierre — Post-ejecución de cada P

### §11.1 Flujo por tanda (Sergio no pasa prompt)

1. Sergio abre Claude Code y dice: `"sigue"` (o simplemente empieza la sesión).
2. Claude Code aplica algoritmo de §0.7: lee este archivo + inventario + snapshots + aprendizajes previos.
3. Claude Code detecta la P a ejecutar y muestra el mensaje de arranque de §0.7 (paso 7).
4. Sergio confirma con `s` o corrige.
5. Claude Code ejecuta la P siguiendo el modo + contrato declarados en el archivo.
6. Al terminar la P, Claude Code genera automáticamente `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}.md` con timestamp real del sistema.
7. Claude Code muestra un resumen numerado (máx. 8 líneas) + ruta del archivo de aprendizajes creado.
8. Sergio hace commit + push en GitHub Desktop.
9. Sergio dice `"sigue"` de nuevo → Claude Code detecta la próxima P automáticamente y repite.

### §11.2 Plantilla del archivo de aprendizajes por P

Cada `aprendizajes-YYYYMMDD-HHMM-P{n}.md` sigue esta estructura:

```markdown
# Aprendizajes P{n} — {NombreP}

- **Fecha:** YYYY-MM-DD
- **Hora inicio → fin:** HH:MM → HH:MM
- **Duración:** N minutos
- **Modo Claude Code usado:** {default | accept edits on | auto mode on}
- **Commit asociado:** (Sergio lo agrega tras commit)

## Resumen ejecutivo
Bullet points de qué se construyó (máx. 6 líneas).

## Decisiones técnicas
- Decisión 1 y por qué.
- Decisión 2 y por qué.

## Overrides aplicados (rutas reales vs plan)
- Plan proponía X → Se usó Y (razón).

## Bugs / obstáculos y resolución
- Problema → Solución.

## Deuda técnica para P siguientes
- Ítem 1 → asignado a P{n+k}.

## Reglas nuevas → MIGRAR a docs/aprendizajes.md
- E-XXX: enunciado corto para consolidar en el archivo activo (Sergio decide cuándo mover).
```

### §11.3 Archivos de continuidad

Al terminar cada P (antes del commit), Claude Code también actualiza:
- `docs/construccion.md` → marca P como ✅ con fecha.
- `docs/_notas/snapshot-P{n}.md` → snapshot con estado del código, decisiones clave y siguiente paso.

`docs/aprendizajes.md` **no se toca automáticamente** — es la base consolidada de reglas activas. Solo se actualiza cuando Sergio pide expresamente migrar una regla desde un archivo timestamped.

### §11.4 Si algo se rompe entre P

Al iniciar la siguiente P, Claude Code:
1. Lee `docs/_notas/snapshot-P{n-1}.md` y `docs/_notas/inventario-if02.md`.
2. Verifica que `pnpm tsc --noEmit` y `pnpm build` estén verdes.
3. Si no, arregla ANTES de comenzar la nueva P.

---

## §12 · Índice rápido de reglas activas

| ID | Regla | Aplica en |
|---|---|---|
| A | Botón único "Asignar Tasador" que desaparece al asignar | P6, P7 |
| B | Toast + Alert destructivo con campos + N° operación como conflicto | P2, P4 |
| C | Editar solo en estado `creada`; permite cambiar tasador | P2, P6 |
| RN-44 | 3 datos mínimos para asignar (dirección, contacto con tel, rol SII) | P6, P7 |
| RN-45 | Toda superficie exige origen + adjunto de respaldo | P4 |
| RN-46 | Jerarquía dirección: ficha → certificado avalúo → certificado número | P4 |
| RN-47 | Jerarquía vendedor: correo → ficha → certificado avalúo | P4 |
| RN-48 | Avalúo fiscal total = suma de avalúos de unidades | P6 |
| RN-49 | Estado de conservación se hereda a recintos | P4 |
| RN-52 | Un solo hilo de correo por solicitud (email_thread_id) | P2, P7, **P8.5** |
| RN-59 | Modo consulta: estado ≠ creada Y tasador asignado | P5, P6 |
| D | Feedback de progreso en toda mutación (spinner + gerundio + `finally`) | P3, P4, P7, **P8.5** |
| RN-04 | SLA agregado por par (cliente, tipo_informe) en días, sobre `C_SLA` y `C_Feriados` | P5, **P8.6** |
| RF-53 | SLA por etapa en horas hábiles 9–18 L-V; siete etapas de §5.2.4; semáforo propio e independiente del agregado | **P8.6** |
| RN-54 | El reloj se detiene por contacto no logrado — campos creados, **sin escritor en v1.9** (FUT-EJ-07) | **P8.6** (declarativo) |
| RN-55 | Reproceso con SLA propio — **diferido** en §1.9 · FUT-EJ-08, fuera de las tandas | — |

---

## §13 · Archivos afectados (no modificados en esta iteración)

La inserción de §9.5 y de §9.6 genera desalineaciones en otros documentos. **Ninguno se editó**;
quedan listados para que Sergio decida cuáles corregir y cuándo. Las filas marcadas **(§9.6)**
son las que agrega el control de SLA en v1.8 del plan.

| Archivo | Qué queda desalineado |
|---|---|
| `docs/diseno.md` **(§9.6)** | La nota de §3 afirma que el reloj por etapa *"no está implementado (CI-005) y su UI no está diseñada"*: tras §9.6 queda diseñada, y e1/e2 quedan implementadas. La vista 2 de TabsVistas (§3) define "SLA en riesgo" como `semaforo_sla = ámbar o rojo`; pasa a ser la **unión** con `sla_semaforo_etapa`. §216 lista los campos de sólo lectura sin `sla_semaforo_etapa`. §519 asume que AT08 ya existe. |
| `docs/construccion.md` **(§9.6)** | §85 lista *"AT08 activo en Airtable"* como prerrequisito de un paso ya construido, cuando AT08 **no existe** en la base. §160 documenta el filtro de "SLA en riesgo" sin el término de etapa. §510 afirma que *"AT08 actualiza `semaforo_sla` en `TX_Solicitudes`"*: con §9.6 el semáforo es fórmula viva y AT08 sólo resume y notifica, no lo escribe. |
| `docs/schema-airtable.md` **(§9.6)** | No tiene `C_SLA_Etapas` ni los 21 campos `sla_*` de `TX_Solicitudes`. **Excepción:** este archivo sí se actualiza dentro de la Tanda A (paso A-6), porque P1/Types y los Route Handlers lo leen como fuente. Queda listado para que la corrección quede visible, no para diferirla. |
| `CLAUDE.md` **(§9.6)** | La tabla de escenarios Make no tiene fila para `SC-SLA-Alertas`. La entrada de `C_SLA` lista las dos familias de campos duplicadas sin decir cuál gana: gana `dias_totales`/`dias_alerta_amarilla`/`dias_alerta_roja` y la otra desaparece en M-11.a (**§9.6-R4**), así que tras P8.6 esa fila queda desactualizada. La sección de SLA operacional dice *"Nada de esto está implementado todavía — ver CI-005"*, que deja de ser exacto al cerrar §9.6. |
| `docs/CODE_INCONSISTENCIES.md` **(§9.6)** | **CI-005** queda cubierta en sus pasos (2), (3) y (4); el (1) —poblar `C_SLA`— queda cubierto por **M-11.a** con la fila default de la Decisión 2 (**§9.6-R4**), así que deja de depender de una elicitación pendiente. Corresponde actualizar su estado, no cerrarla. **CI-007** (`H_Feriados` vs `C_Feriados`) sigue abierta y §9.6 la respeta usando el nombre real (**§9.6-R1**); conviene anotarle que el saneamiento de datos de la tabla es M-12 de este plan y no forma parte de la corrección de la spec. |
| `C_AutomationsAirtable` **(§9.6 · dato, no documento)** | La fila `recxWkj3x8tzqzHmo` (`codigo = AT08`) dice `nombre_automation = AT08_alertas_sla`, `estado = Inventariado` y `descripcion = "…dispara SC13"`. Al cerrar la Tanda F ninguna de las tres es cierta. **Sí se corrige** —es el único ítem de esta tabla que no queda diferido—, en **F-5 · M-17** (**§9.6-R2**). |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md` **(§9.6)** | Fuente canónica, **no editable** y **sin cambios requeridos**: §9.6 la implementa sin desviarse. Tres divergencias spec→base a corregir en el próximo bump normativo, con su changelog (RO-15): (1) §5.2 y §5.2.1 nombran `H_Feriados`, que no existe (CI-007 · **§9.6-R1**); (2) §5.2.4 · etapa 7 y §3.2 dan por existente `sla_revision` en `C_SLA`, que tampoco existe — §9.6 lo crea como `sla_revision_horas` (**§9.6-R3**); (3) §3.2 nombra además un `sla_aplicable` global inexistente, cuyo equivalente real es `dias_totales`. |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md` **(§9.6)** | §6 no incluye los dos literales de alerta de etapa (ámbar y rojo) que §9.6.1 propone. Se implementan tal cual quedaron escritos y esperan ratificación en el catálogo de mensajes canónicos. Arrastra además el nombre `H_Feriados` (CI-007). |
| `docs/_notas/checklist-P9-manual.md` **(§9.6)** | Sin sección para `SC-SLA-Alertas` ni para `AT08_Alertas_SLA`. §10.4.1 y §10.4.2 de este plan tampoco listan todavía el blueprint y el `.js` de la Tanda F. |
| `CLAUDE.md` | La tabla de escenarios Make marca `SC05` como *"❌ por provisionar (BQ-3) · verificar código libre (H-03)"*. Tras §9.5 el código deja de estar libre: SC05 es el correo de asignación. Falta también la fila de `SC-Asignar` (hook `3441086`), que existe pero no está en la tabla. |
| `docs/diseno.md` | §269 y §546 dicen que SC05 se dispara desde AT02. **D-15 dejó AT02 fuera de alcance de IF-02** y §278 ya lo corrige — pero §269/§546 conservan la redacción vieja. Con §9.5, SC05 se dispara desde SC-Asignar. |
| `docs/construccion.md` | §316 afirma *"SC05 se dispara desde AT02 al pasar a `asignada`, no desde la UI directamente"*. Misma corrección que arriba. §343 conserva el diagrama con AT02. |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md` | Fuente canónica, **no editable**. Dos divergencias a registrar en otro lado: (1) §1.6.3 llama SC13 al escenario que este plan llama SC05; (2) §1.6.3 ubica la plantilla en `C_Plantillas`, que no tiene ningún campo donde quepa un cuerpo HTML — la fuente de runtime es `C_NotificacionesConfig`. |
| `docs/schema-airtable.md` | Conviene anotar que `M_Tasadores.email` (`fldsUu1pJ92HdYQUD`) es el destinatario del correo, que `M_Tasadores` **no** tiene link a `AUTH_Usuarios`, y la divergencia `C_Plantillas` / `C_NotificacionesConfig`. |
| `docs/_notas/checklist-P9-manual.md` | §10.4.3 ya quedó actualizado en este archivo; el checklist en sí todavía dice SC13 y "módulo de correo en SC-Asignar". |
| `docs/_artefactos/make/SC-Adjuntos-Upload.blueprint.json` · `lib/adjuntos.ts` | Producen `/VProperty/Tasaciones/{codigo}/…` en vez de la plantilla de spec v1.9.6 `/Test_ValueProperty/INFORMES_{AAAA}/{Cliente}/{codigo}/{Unidad}/…`. Migración diferida — registrada como **CI-003** en `docs/CODE_INCONSISTENCIES.md`. **No bloquea P8**: los archivos se guardan y recuperan bien; lo que falla es la conformidad con la norma, no la operación. |
| *(norma · sin archivo específico)* | `TX_Adjuntos.dropbox_path` no se recompone si `TX_Unidades.subtipo` se edita después de la subida: el binario no se mueve y el path envejece en silencio. Deuda conocida, documentada como nota de diseño en §8 de spec v1.9.6 y registrada como **CI-004**. |
| `components/console/document-checklist.tsx` *(referencia — **no** se toca en esta tanda)* | El sheet no captura la unidad a la que pertenece cada adjunto, dato que el path de v1.9.6 necesita para componer el nivel `{Unidad}`. El comportamiento previsto está descrito en la nota de diseño de §9.1. Se implementará junto con CI-003. |

---

*Última actualización: 10-ago-2026 · **v1.12 del plan** (corrección del criterio de aceptación de
la Tanda B y ratificación de sus dos entregables de infraestructura: reconciliación nueva
**§9.6-R6** — un criterio por `grep` declara sus exclusiones y se **corre** antes de escribirse, y
un literal de §5.2.4 dentro de un `.test.ts` es un fixture correcto, no una constante
hardcodeada; el comando pasa a `grep -nE '\b(0\.5|24|48)\b' lib/sla-*.ts` filtrado por
`grep -v '\.test\.ts:'` y por la exclusión de comentarios —sólo los tres literales inequívocos,
porque `2`/`3`/`4`/`6` son números de etapa y de día de la semana en el propio motor, y el ancla
`$` de la primera corrección no excluía nada— · entregables de la
Tanda B completados con `vitest.config.mts` y `updateRecord` de `lib/airtable-client.ts` · la
Tanda B **no se reabre**: cerrada con 186 tests verdes, sólo cambia cómo se la verifica · sin
campos, tandas ni checkpoints nuevos) · v1.11 (Tanda A ejecutada contra la base: `C_SLA_Etapas` `tbl05zu5RLhH3u6pl` con sus 7 filas, 3 campos nuevos en `C_SLA`, 21 campos SLA en `TX_Solicitudes`, fila `SLA_DEFAULT_GLOBAL` `recAoOl35rFwEuM8u` · `sla_revision_horas` pasa a 1 decimal · **M-13 CERRADO**: `sla_semaforo_etapa` `fldB6gJ3clZUPgaZk` creado por MCP en A-3, queda viva sólo la verificación de los cuatro literales en el E2E de la Tanda C · `matriz_etapas` de la fila default revertido a vacío para preservar §9.6-R4 · reconciliación nueva **§9.6-R5**: el MCP sí crea fórmulas) · v1.10 (tres decisiones de negocio incorporadas: **Decisión 1** matriz por etapa de §5.2.4 como dato cerrado, se carga literal y se ratifica en **M-11.b** · **Decisión 2** baseline del agregado, fila global default en `C_SLA` con 3 / 2 / verde 0-1 y `sla_revision_horas` vacío, en **M-11.a**, que además borra la familia perdedora · **Decisión 3** reproceso §5.2.5 ratificado como diferido en FUT-EJ-08 · reconciliación nueva **§9.6-R4** con la traducción de nombres al schema real, la convención de comodín por link vacío y la precedencia campo a campo frente a `SLA_METLIFE_Refinanciamiento` · M-11 se parte en M-11.a/M-11.b y deja de ser compuerta de tiempo ajeno · sin campos ni tandas nuevas) · v1.9 (reconciliación de las tres divergencias entre §9.6 y la base real: **§9.6-R1** `C_Feriados` canónico · **§9.6-R2** `AT08_Alertas_SLA` se crea y su fila de inventario se actualiza · **§9.6-R3** `sla_revision_horas` con regla de override sobre la etapa 7 · paso F-5 nuevo · M-9/M-11/M-12/M-16/M-17/M-18 ampliados · E2E-12 con el calendario corregido) · v1.8: P8.6 · Control de SLA en IF-02: RF-08 agregado + RF-53 por etapa · tandas A-G · checkpoints M-9 a M-18 · reproceso diferido en FUT-EJ-08 · v1.7: logo corporativo del pie de SC05 por adjunto inline CID · checkpoints M-7/M-8 · caso E2E-9 · v1.6: realineamiento a spec v1.9.6 · path Dropbox con nivel Unidad · borrado real en el checklist P8 · archivo movido a `docs/_md/` · v1.5: P8.5 Correo de asignación al tasador · SC05, insertada entre P8 y P9 · v1.4: P0.5 Schema Airtable IF-02 insertada entre P0 y P1 · Base: Especificación v1.9.6*
