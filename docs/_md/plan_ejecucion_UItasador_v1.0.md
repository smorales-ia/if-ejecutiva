# Plan de Ejecución IF-03 · UI Tasador v1.0 — Guía maestra para Claude Code

> **Versión del plan: v1.0** (17-ago-2026). Primera emisión. Gobierna la construcción de
> **IF-03 · Interfaz Tasador** (CU-003) dentro del repositorio `if-ejecutiva`, **en paralelo** a
> IF-02 (Consola Ejecutiva), que sigue en curso bajo `docs/_md/plan-ejecucion-if02-v1_9.md`.
>
> **Este archivo replica la estructura del plan de IF-02 deliberadamente.** Mismo §0 Preflight,
> misma convención de Tandas, mismos contratos de comportamiento 🟢🟡🔴, mismo mecanismo de
> autoejecución, mismo cierre. Un ejecutor que ya corrió tandas de IF-02 no tiene que aprender
> nada nuevo: sólo cambia el sufijo `-TAS` de los archivos de aprendizajes y el conjunto de
> rutas sobre las que puede escribir.
>
> **Tres divergencias respecto de IF-02, declaradas por adelantado** (desarrolladas en §0.4):
> **(1)** IF-03 **no usa Make** para escrituras de negocio — escribe directo a Airtable desde
> Route Handlers; **(2)** la autenticación real es la **penúltima** tanda, no la primera —
> hasta P11-TAS se trabaja con `mockUserTasador`; **(3)** IF-03 es **mobile-first** (375×812),
> mientras IF-02 es una consola de escritorio.
>
> **Precedencia.** Ante contradicción con `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md`
> u otros documentos, mandan las **Reglas T-A, T-B y T-C** de §0.3 y las **Reglas duras R1–R12**
> de §0.2 de este archivo. Ante contradicción con el plan de IF-02, manda el plan de IF-02 en
> todo lo que sea código ya construido de la Ejecutiva: IF-03 **no gobierna** ese territorio.
>
> **Uso.** Claude Code lee este archivo al iniciar cada sesión de IF-03, detecta la última tanda
> completada por los archivos `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}-TAS.md` y ejecuta la
> siguiente **sin que Sergio le pase el prompt** (§0.7). Sergio sólo confirma que la tanda quedó
> ok y da señal para avanzar.

---

## §0 Preflight — Lectura obligatoria al iniciar cada sesión

### §0.1 Archivos a leer al iniciar sesión (en este orden)

1. `docs/_md/plan_ejecucion_UItasador_v1.0.md` (este archivo, completo)
2. `docs/_notas/inventario-tasador.md` (generado en P0-TAS — **obligatorio a partir de P1-TAS**)
3. `docs/_notas/inventario-if02.md` (inventario del rol Ejecutiva — **fuente de las rutas reales
   de todo lo que IF-03 reutiliza**; se lee, nunca se edita)
4. `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md` — **§2 completa** (§2.1 a §2.16). Es la
   fuente normativa de todos los RF-TAS.
5. `docs/schema-airtable.md`
6. `docs/aprendizajes.md`
7. `docs/CODE_INCONSISTENCIES.md` — **CI-012 a CI-021** (las nueve inconsistencias de §2)
8. `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` — **A-12 a A-17** (las seis ambigüedades abiertas)
9. `CLAUDE.md`
10. Último `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}-TAS.md` disponible (dónde quedó la sesión
    anterior).
11. Último `docs/_notas/snapshot-P{n}-TAS.md` disponible.

**No se leen** `docs/diseno.md` ni `docs/construccion.md` como fuente de IF-03: ambos describen
IF-02 y no tienen sección de Tasador. Se consultan sólo cuando una tanda de IF-03 necesita
entender un componente de la Ejecutiva que va a reutilizar.

### §0.2 Convenciones no negociables — Reglas duras R1 a R12

- **Repo:** `/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva` (WSL2)
- **Stack:** Next.js 16.2.6 App Router · React 19.2.4 · TS 5.7 · pnpm · Tailwind v4 (`@theme` en
  `app/globals.css`, **sin `tailwind.config.js`**) · shadcn/ui v4 sobre `@base-ui/react` 1.5
  (**nunca Radix**, nunca `asChild` — usar `render` prop) · react-hook-form + zod 4 · sonner ·
  lucide-react
- **Complete files only.** Cuando un archivo cambia, entregar la versión completa nueva; nada de
  patches ni adendas.
- **Reuse before create.** Antes de crear un componente/función/tipo, buscar con `grep -r` si ya
  existe. Si existe, **se importa**; no se duplica (ver R7 y su matiz importar-vs-editar).
- **Sin `localStorage` / `sessionStorage` para datos de negocio**, con **una excepción única y
  declarada**: el autosave del formulario de captura de §2.8 (Pantalla 5), que la propia
  especificación fija en 30 s. Esa excepción cubre **sólo** el borrador del formulario; ningún
  otro dato de negocio toca almacenamiento del navegador. La cola offline de fotos (§2.6) usa
  **IndexedDB**, no `localStorage`, y también está declarada en la spec.
- **Cero lógica de negocio en la UI** para todo lo que IF-03 **reutiliza** de IF-02 (SLA, motor
  de cálculo, semáforo, reglas del checklist documental): la UI consume, no recalcula. Lo que
  IF-03 **sí** resuelve en su capa server es la validación de forma (Zod) y el blindaje de
  autorización (RF-09).
- **Idioma:** UI en español (Chile); comentarios de código en español; identificadores en inglés.

**Índice de las reglas duras.** Se enuncian aquí y se aplican en toda tanda:

| ID | Regla | Dónde se verifica |
|---|---|---|
| **R1** | **Patrón.** Este archivo replica la estructura de `plan-ejecucion-if02-v1_9.md`: encabezado con versión y changelog, §0 Preflight (§0.1–§0.7), una sección por tanda con Diseño / Construcción / Criterios de aceptación, §-cierre post-ejecución, índice de reglas activas y archivos afectados. Misma numeración de tandas (P0, P0.5, P1…) y mismos contratos 🟢🟡🔴. | Estructura de este archivo |
| **R2** | **Autenticación al final.** Clerk + `clerk_user_id` + validación server-side de RF-09 se ejecutan en **P11-TAS**, la última tanda antes del deploy. Todas las tandas previas usan `mockUserTasador` en `lib/tasador/mock-user.ts`. Ninguna tanda anterior puede introducir dependencia dura de Clerk en IF-03. | P1-TAS a P10-TAS · cierre en P11-TAS |
| **R3** | **Escritura directa a Airtable, sin Make.** Todas las mutaciones de IF-03 (`TX_CoordinacionVisita`, `TX_DatosTasacion`, `TX_Adjuntos`, `TX_Solicitudes`, `A_Cambios` y tablas hijas de captura) se hacen desde Route Handlers de Next.js contra la API REST de Airtable. Los correos de coordinación se disparan por **Automation de Airtable** observando `email_enviado_status = pendiente`. Desarrollo completo en §0.4. | P2-TAS · verificado en P12-TAS |
| **R4** | **Documentación consistente.** La sección final "Archivos afectados" lista cada documento del repo que queda desalineado por la creación de IF-03, **sin editarlo**. Es lista para que Sergio decida cuándo alinear, no tarea de ninguna tanda. | §16 |
| **R5** | **No tocar lo construido.** Prohibido **modificar** `components/console/**`, `app/api/solicitudes/**`, `app/(ejecutiva)/**`, `lib/*.ts` de IF-02 y cualquier ruta de IF-02 (Ejecutiva) o IF-04 (Visador). Las tandas de IF-03 escriben **sólo** bajo `app/tasaciones/**`, `app/api/tasaciones/**`, `components/tasador/**` y `lib/tasador/**`. Ver el matiz importar-vs-editar en R7. | Toda tanda · criterio de aceptación explícito |
| **R6** | **Construcción en paralelo con IF-02.** Cada tanda declara al inicio la verificación previa: `pnpm tsc --noEmit && pnpm build` verdes **antes** de empezar y **después** de terminar. Si una tanda de IF-03 rompe el build de IF-02, **se aborta la tanda, se revierte lo escrito y se reporta**; no se "arregla" IF-02 para que IF-03 pase. Rama de trabajo: `feat/tasador-ui` (nombre a confirmar por Sergio en la primera sesión). | Toda tanda |
| **R7** | **Reuso obligatorio antes de crear.** Los componentes y módulos de IF-02 listados en §0.2-bis se **importan**, nunca se re-crean bajo `components/tasador/`. | Toda tanda de UI |
| **R8** | **Cero lenguaje de IA en la UI.** Ningún texto visible dice "AI", "IA", "Claude", "modelo", "OCR", "inteligencia artificial" ni nombra el medio técnico. Los literales correctos son "Leyendo datos de la visita", "Procesando archivos de la visita…", "Calculando tasación". Es política transversal del proyecto (§2.7, §2.9) y se eleva a **Regla T-C**. | P6-TAS, P8-TAS · grep en P12-TAS |
| **R9** | **Mobile-first.** IF-03 es la app móvil del tasador. Base de diseño **375×812**; el layout de escritorio es secundario y nunca dicta decisiones. shadcn/ui v4 sobre `@base-ui/react`, nunca Radix. | Toda tanda de UI |
| **R10** | **Respeto a ambigüedades e inconsistencias abiertas.** Detalle en §0.4-bis: CI-012 bloquea RF-TAS-04 y RF-TAS-05 y mantiene P4-TAS sin liberar a producción; A-12 deja el chip "Hoy" como stub deshabilitado; A-13 a A-17 se declaran al inicio de la tanda que dependa de ellas y no se implementan hasta su cierre. | P3-TAS, P4-TAS, P5-TAS, P7-TAS, P9-TAS |
| **R11** | **Ejecución dirigida por el propio plan.** Claude Code detecta la última tanda completada por los archivos `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}-TAS.md` y ejecuta la siguiente. Sergio no pasa prompt por tanda. | §0.7 |
| **R12** | **Commits los hace Sergio.** Claude Code **nunca** ejecuta `git commit` ni `git push`. Tampoco `git checkout -b`, `git merge` ni `git revert` sin pedirlo explícitamente. | Toda tanda |

### §0.2-bis Catálogo de reuso obligatorio (R7) — con ruta real verificada

Verificado contra el árbol real el 17-ago-2026. **Ninguno de estos se re-crea bajo
`components/tasador/` ni bajo `lib/tasador/`.**

| Qué | Ruta real en el repo | Cómo lo consume IF-03 |
|---|---|---|
| **`FileUploadZone`** | `components/console/file-upload-zone.tsx` (export nombrado, línea 143) | Importado tal cual en P5-TAS (organizador de fotos, §2.6 · RF-TAS-14). |
| **`SLABadge`** | `components/console/status-badges.tsx` (export nombrado, línea 59) | Importado en P3-TAS para el badge de la card (RF-TAS-02 · RF-TAS-11). |
| **`StateBadge`** | `components/console/status-badges.tsx` (export nombrado, línea 19) | ⚠ **La spec §2.13 lo llama `EstadoBadge`; el repo lo llama `StateBadge`.** Manda el repo. Override registrado en P0-TAS. |
| **Sheet documental + checklist** | `components/console/documentos-adjuntos-sheet.tsx` · `components/console/document-checklist.tsx` | Importado en P5-TAS para el botón "Cargar documentos de la propiedad" (§2.6 · RF-TAS-06). |
| **Motor SLA por etapa (RF-53)** | `lib/sla-etapas.ts` · `lib/sla-habil.ts` · `lib/feriados.ts` | Consumido server-side en P2-TAS y verificado en P10-TAS. Las etapas del tasador son la **2** (Coordinación · 4 h ideal / 6 h máx.) y la **5** (Visita y envío · 24 h / 48 h). IF-03 **no define umbrales propios**. |
| **Cliente Airtable REST** | `lib/airtable-client.ts` (`getRecord`, `updateRecord`, `AirtableError`, `isValidRecordId`) | Base de todas las escrituras de P2-TAS. **No se agrega la dependencia `airtable` a `package.json`** — ver §0.4 · nota 3. |
| **Timeline / historial (datos)** | `lib/historial.ts` · `lib/historial-airtable.ts` · `lib/use-historial-solicitud.ts` | Reutilizables directamente: son `lib/`, no componentes de IF-02. |
| **Cronología SLA (datos)** | `lib/sla-cronologia.ts` · `lib/use-cronologia-sla.ts` | Idem. |
| **Lector de documentos (SC07 · RF-09 extracción)** | `docs/_artefactos/make/SC-RF09-ExtraccionClaude.blueprint.json` · `app/api/adjuntos/upload/route.ts` · `TX_Adjuntos.estado_extraccion` (`fld54epvDJ7YdJIYD`) | P6-TAS **dispara y consulta** el pipeline existente; no escribe uno nuevo. |
| **Motor de correo (plantillas)** | `C_NotificacionesConfig` (`tbluB662ulWDaxqUY`) + artefactos en `docs/_artefactos/airtable/` | ⚠ Divergencia con la spec: §2.12 ubica las dos plantillas de coordinación en `C_Plantillas`, pero **`C_Plantillas` no tiene ningún campo donde quepa un cuerpo HTML** — la fuente de runtime probada en IF-02 es `C_NotificacionesConfig`. Se resuelve en P0.5-TAS. |

**⚠ Excepción R5-E · el visor "Ver expediente" no es importable hoy.** RF-TAS-10 exige reutilizar
el visor de adjuntos de sólo lectura de IF-02. Ese visor **no existe como componente exportado**:
la pestaña Adjuntos de §1.3.4 vive como funciones privadas (`HistorialTab`, `HistorialItem` y el
bloque de adjuntos) dentro de `components/console/solicitud-detail.tsx`, y
`documentos-adjuntos-sheet.tsx` es de lectura **y escritura**. Extraerlo a un módulo compartido
exigiría **editar** `components/console/**`, que R5 prohíbe. Regla operativa:

- **Importar de `components/console/**` está permitido. Editar, no.**
- Si un reuso obligatorio de R7 exige editar un archivo de IF-02, la tanda **se detiene**, escribe
  el hallazgo en su snapshot y **pide autorización explícita a Sergio**. No se resuelve
  duplicando el componente bajo `components/tasador/` (eso viola R7) ni editando IF-02 por
  iniciativa propia (eso viola R5).
- P9-TAS es la tanda donde esto se materializa. Lleva la excepción declarada en su diseño.

### §0.3 Reglas T-A, T-B, T-C — Fuente de verdad UI de IF-03 (precedencia absoluta)

Estas tres reglas son a IF-03 lo que las Reglas A, B y C son a IF-02: se derivan de §2.1 a §2.11
de la spec y **ganan** ante cualquier otra redacción.

**REGLA T-A — Una sola card por solicitud; el botón contextual es único.**
- La cola (§2.1) muestra **una card por solicitud**, nunca dos entradas para el mismo código.
- Cada card cierra con **exactamente un** botón, cuyo rótulo y estilo dependen del estado de la
  coordinación. Las tres variantes son **mutuamente excluyentes**:
  1. **"Coordinar visita"** (color de acento) — mientras falte coordinación vigente.
  2. **"Abrir tasación"** (color primario) — una vez la coordinación está confirmada.
  3. **"Ver coordinación"** deshabilitado + badge **"Esperando contacto de ejecutiva"** — cuando
     la coordinación fue devuelta y la ejecutiva aún no actualiza los contactos.
- Ninguna card presenta dos variantes a la vez. Ninguna card presenta un menú de acciones.
- En la variante 3, la solicitud **permanece visible** en el chip "Todas": el tasador no la pierde
  de vista aunque no pueda actuar sobre ella.
- El **gate de coordinación** vive aquí y sólo aquí: mientras la coordinación no esté confirmada,
  no se entra a la captura. No existe pantalla "Detalle de solicitud" con botón "Iniciar captura"
  (§2.4 · CI-020).

**REGLA T-B — La fecha real de visita es obligatoria y distinta de la planificada.**
- La sección A del formulario (§2.8) distingue **dos** fechas que no se colapsan nunca:
  - **Fecha planificada de visita** — llega pre-llenada desde la coordinación (§2.3) con badge
    "Pre-llenado · editable".
  - **Fecha real de visita** — la registra el tasador en terreno y es **obligatoria**.
- Se persisten **por separado** (`TX_CoordinacionVisita.fecha_visita_propuesta` y
  `TX_Solicitudes.fecha_real_visita`). El informe declara la **real**.
- La ausencia de fecha real cuenta entre los obligatorios faltantes y **bloquea "Calcular
  Tasación"**.
- Consecuencia: ninguna pantalla, tipo TS ni Route Handler puede tratar "la fecha de visita" como
  un solo campo. Si aparece un identificador `fechaVisita` a secas en código de IF-03, es un bug.

**REGLA T-C — Cero lenguaje de IA en la UI.**
- Ningún texto visible al tasador menciona el medio técnico con que se resuelve una operación.
  Prohibidos: "AI", "IA", "Claude", "modelo", "LLM", "OCR", "inteligencia artificial",
  "prellenado por IA", "algoritmo".
- Literales canónicos de las pantallas de progreso: **"Leyendo datos de la visita"**,
  **"Procesando archivos de la visita…"**, **"Datos listos"**, **"Calculando tasación"**,
  **"Informe listo"**.
- Alcance: **toda** la UI de IF-03, no sólo las pantallas de progreso. Incluye tooltips, textos de
  ayuda, mensajes de error y badges.
- El motor de cálculo es **AT03, un DAG determinista**; nombrarlo como "IA" además de violar la
  política es falso.
- CI-015 registra dos residuos concretos que deben desaparecer si el código v0 llega al repo: el
  texto *"Prellenado por IA … (SC07)"* en `seccion-documentos.tsx` y el indicador
  `IntentosIndicator` / `MAX_INTENTOS`.

### §0.4 Consecuencias derivadas (aplican a todas las tandas)

**1 · IF-03 no usa Make para escrituras de negocio (R3) — divergencia declarada con IF-02.**

IF-02 escribe a Airtable a través de escenarios Make (SC01, SC-Edicion, SC-Asignar,
SC-Adjuntos-Upload) firmados con HMAC-SHA256. **IF-03 no.** Todas sus mutaciones van desde el
Route Handler directo a la API REST de Airtable, con el token `AIRTABLE_TOKEN` server-side:

| Tabla | Operación de IF-03 | Vía |
|---|---|---|
| `TX_CoordinacionVisita` | insert (1 fila por intento) | Route Handler → Airtable REST |
| `TX_DatosTasacion` y tablas hijas de captura | upsert | Route Handler → Airtable REST |
| `TX_Adjuntos` | insert/update (fotos y documentos) | Route Handler → Airtable REST *(el binario sigue subiendo por el pipeline existente de adjuntos)* |
| `TX_Solicitudes` | update acotado (`estado`, `fecha_real_visita`, `observacion_rechazo_tasador`, campos de override) | Route Handler → Airtable REST |
| `A_Cambios` | insert de auditoría por cada mutación | Route Handler → Airtable REST |

**Los correos de coordinación no los envía IF-03.** El Route Handler escribe la fila con
`email_enviado_status = pendiente` y **una Automation de Airtable** observa ese valor, envía el
correo con la plantilla correspondiente y marca `email_enviado_status = enviado` +
`email_enviado_at`. IF-03 **nunca** llama a Make ni a un proveedor de correo.

*Nota sobre la spec.* §2.11 atribuye estos dos correos a **SC13** (Make). R3 los reasigna a una
Automation de Airtable. La divergencia es deliberada y queda registrada en §16 para el próximo
bump normativo. El efecto observable es idéntico: mismo par de plantillas, mismo hilo
`email_thread_id` (RN-52), misma idempotencia por `email_enviado_status`.

*Nota sobre HMAC.* La firma `X-VP-Signature` de `lib/make-client.ts` protege el canal Next.js →
Make. **IF-03 no tiene ese canal**, de modo que en v1.0 no hay firma HMAC que emitir. El blindaje
real de IF-03 son otras dos capas, y ésas sí son obligatorias en P2-TAS: **validación Zod** de
todo cuerpo entrante y **autorización server-side** (`clerk_user_id === TX_Solicitudes.tasador`),
esta última con `mockUserTasador` hasta P11-TAS. Si en el futuro un endpoint de IF-03 queda
expuesto a un consumidor externo, se le agrega HMAC con el helper existente; hoy no aplica.

**2 · Auditoría en `A_Cambios`, no en `A_Eventos`.** IF-02 tiene prohibido escribir `A_Cambios`
(era el override de AT02) y escribe `A_Eventos`. **IF-03 escribe `A_Cambios`** — así lo declara
§2.16 de la spec en su lista de tablas escritas. `A_Eventos` lo siguen escribiendo las
automatizaciones backend (SC06/SC08/SC09), no la UI del tasador. Consecuencia práctica: el filtro
de `A_Cambios` es por `tabla_origen` + `registro_id`, porque **la tabla no tiene Link a la
solicitud** (CI-011).

**3 · No se agrega el paquete `airtable` a `package.json`.** El enunciado de R3 habla de "SDK de
Airtable"; el repo **no tiene** ese paquete y sí tiene `lib/airtable-client.ts`, un cliente REST
propio ya probado en producción con `getRecord`, `updateRecord` y manejo de errores tipado.
Agregar el SDK duplicaría la capa de acceso y violaría "reuse before create". **P2-TAS extiende
`lib/airtable-client.ts`** con lo que le falte (`createRecord`, `listRecords` con paginación) y no
instala nada. Si esa extensión exigiera **editar** `lib/airtable-client.ts` —archivo de IF-02—,
aplica la excepción R5-E: se pide autorización a Sergio antes de tocarlo, y la alternativa
preferente es un módulo `lib/tasador/airtable-writes.ts` que lo importe y lo envuelva.

**4 · Siete rutas, no ocho.** El árbol de §2.13 fija siete rutas y `app/tasaciones/[id]/` **es el
formulario de captura**, no un detalle. Las rutas `[id]/captura/` y `[id]/calculo/` de versiones
anteriores **no se crean** (CI-020).

**5 · La coordinación no agrega estados a la máquina backend.** Ocurre íntegramente dentro de
`asignada`. Los estados `confirmada`/`rechazada` viven en `TX_CoordinacionVisita`, nunca en
`TX_Solicitudes.estado` (§2.11).

**6 · El estado `devuelta` está deprecado.** Una devolución del visador reingresa la solicitud como
`asignada`, sin franja roja, sin contador de intentos y sin notificación in-app (RF-17 · §2.11).
Ninguna pantalla de IF-03 renderiza `devuelta`.

### §0.4-bis Ambigüedades e inconsistencias abiertas — tratamiento por tanda (R10)

**Ninguna tanda decide una de éstas por criterio propio.** Cada una declara al inicio la que le
aplica, construye lo que no depende de ella y deja el resto explícitamente fuera.

| ID | Qué está abierto | Efecto sobre el plan | Tanda que lo declara |
|---|---|---|---|
| **CI-012** | La coordinación por sistema: la spec §2.3 la describe, §1 la retira, y `TX_CoordinacionVisita` no existe en la base. Decisión de negocio Héctor/Óscar, consulta enviada el 11-ago-2026. | **RF-TAS-04 y RF-TAS-05 no se construyen.** P4-TAS construye RF-TAS-03, RF-TAS-12 y RF-TAS-13 **detrás de un flag apagado** y queda marcada **"bloqueada · pendiente decisión Héctor/Óscar"**: **no se libera a producción** hasta el cierre. | **P0.5-TAS** (crea la tabla) · **P4-TAS** (construye y no libera) |
| **A-12** | Qué entra en el chip "Hoy" (la agenda del día del tasador). | La Pantalla 1 se construye con **"Todas"** y **"Por coordinar"** únicamente. **"Hoy" queda como stub deshabilitado**, visible pero no accionable, con tooltip que declara que su definición está pendiente. | **P3-TAS** |
| **A-13** | De dónde salen los comparables si la sección D pasa a sólo lectura. | La **captura manual sigue vigente** y RF-12 conserva su validación de mínimo 3. La grilla se construye editable. **No se implementa** ninguna variante de sólo lectura. | **P7-TAS** |
| **A-14** | Qué tabla de configuración alberga los defaults constructivos. | El **subconjunto constructivo de RF-TAS-08 no se implementa**: sección E sin precarga de defaults. Los factores de homogeneización (`C_VariablesCliente` / tabla de factores) **sí** se precargan, porque esos ya tienen origen. Prohibido hardcodear cualquiera de los dos. | **P7-TAS** |
| **A-15** | Si el rechazo del informe emite aviso al visador. | Se implementa **sólo** lo que RF-TAS-09 declara: persistir la observación y mostrar el mensaje que dirige al canal habitual. **Ningún aviso, ninguna notificación, ningún evento adicional.** El texto del diálogo no promete un aviso que el sistema no hace. | **P9-TAS** |
| **A-16** | Si los mínimos de fotos de Habitaciones, Baños y Estacionamientos son fijos o dinámicos. | Se implementa el **mínimo dinámico** que declara §2.6 (ligado a lo declarado en la sección B), porque es la regla escrita en la spec; los valores 2·2·1 del diseño se tratan como los de la propiedad de ejemplo. La decisión se declara como **asunción reversible** en el snapshot, con el punto de cambio aislado en una función. | **P5-TAS** |
| **A-17** | Si el catálogo de motivos de contacto no logrado es paramétrico o fijo. | `TX_CoordinacionVisita.motivo` se crea como **`singleSelect` con los cuatro valores del catálogo cerrado**, que es la realización que §2.12 declara. Si el negocio lo quiere paramétrico, migra a Link después. La UI lee el catálogo desde el API, **no** desde un enum hardcodeado en el cliente, de modo que la migración no toque la UI. | **P0.5-TAS** (schema) · **P4-TAS** (UI) |
| **P-5** | El dominio de `tipo_propiedad` está en femenino en `D_TipoDocumento` (`nueva·usada·ambas`) y en masculino en `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`nuevo·usado`). **Con los dominios actuales la comparación literal de RF-TAS-06 nunca coincide y el sheet documental sale vacío.** | **RF-TAS-06 no se puede dar por implementado.** P5-TAS construye la apertura del sheet y **normaliza el género en una única función server-side** (`lib/tasador/tipo-propiedad.ts`) como paliativo declarado, dejando constancia de que la corrección real es alinear el dominio en Airtable, fuera del repo. | **P5-TAS** |
| **CI-013** | Ya resuelta en la doc: "Continuar" bloqueado hasta "Datos listos". | Se construye **bloqueado**, según RF-TAS-15. "Volver" no cancela el proceso en background. | **P6-TAS** |
| **CI-014** | Ya resuelta en la doc: el formulario tiene **ocho** secciones, no siete. | P7-TAS construye **A a H**. La sección G (Overrides · CU-007) es la que se cae si alguien cuenta siete: se verifica explícitamente en el criterio de aceptación. | **P7-TAS** |
| **CI-015** | Traza legacy del contador "N de 3 usados" y del texto "Prellenado por IA". | Si el código v0 llega al repo, la tanda que toque ese archivo **elimina** `IntentosIndicator`, `MAX_INTENTOS`, las ramas muertas del hook (`confirmar`, `rechazar`, `intentosRestantes`, `bloqueado`, `PENDIENTE_VISADOR`) y el texto de IA. Si no llega, no se escriben nunca. | **P0-TAS** (detección) · **P7-TAS** (limpieza) |
| **CI-016** | Ya resuelta en la doc: no hay `window.print()` de respaldo. | "Descargar PDF" **siempre** viene de Carbone con la plantilla asignada. Si el PDF no está, se informa la espera. **Prohibido** implementar impresión alternativa. | **P9-TAS** |
| **CI-017** | Ya resuelta en la doc: diálogo previo + acuse con botón, sin temporizador. | Se construye el diálogo "¿Enviar este informe al visador?" y la pantalla de acuse con "Volver al inicio". **Ningún `setTimeout` de redirección.** | **P9-TAS** |
| **CI-018** | Ya resuelta en la doc: contenido real de la card. | P3-TAS construye el contenido de RF-TAS-11 (badge de SLA, no de estado; sin versión del informe). | **P3-TAS** |
| **CI-019** | Ya resuelta en la doc: tres chips, sin "SLA en riesgo". | P3-TAS construye tres chips; el tercero ("Hoy") como stub por A-12. **No se crea** chip "SLA en riesgo". | **P3-TAS** |
| **CI-020** | Ya resuelta en la doc: siete rutas, sin pantalla de detalle. | Ver §0.4 · nota 4. | **P0-TAS** · **P3-TAS** |
| **CI-021** | El SLA del tasador se lee del plazo **por etapa** (RF-53 · §5.2.4), no del agregado en días. Falta la contraparte: §5.2.4 no declara su contrato de lectura. Ligada a CI-005. | P2-TAS expone las etapas 2 y 5 desde `lib/sla-etapas.ts`. **P10-TAS verifica** que el número que muestra la card coincide con el que calcula el motor sobre la ventana hábil. IF-03 **no** implementa aritmética propia. | **P2-TAS** · **P10-TAS** |

### §0.5 Modos de Claude Code por tanda

Claude Code tiene 3 modos que Sergio cicla con **Shift+Tab** en la terminal:

| Modo | Comportamiento |
|---|---|
| `default` | Pregunta antes de cada edición de archivo **y** cada comando de terminal. |
| `accept edits on` | Edita archivos libre. Pregunta antes de ejecutar comandos de terminal. |
| `auto mode on` | Hace todo sin preguntar. |

**Modo recomendado por tanda** (Sergio lo activa **antes** de arrancar):

| Tanda | Nombre | Modo recomendado | Razón |
|---|---|---|---|
| P0-TAS | Inventario del repo Tasador | `auto mode on` | Sólo lee y genera 1 doc. Riesgo cero. |
| P0.5-TAS | Schema Airtable IF-03 | `default` | Muta schema real. Cada `create_table`/`create_field` requiere confirmación, y una de las creaciones materializa una decisión de negocio abierta (CI-012). |
| P1-TAS | Types TypeScript | `auto mode on` | Sólo tipos TS. Los errores los atrapa `tsc`. |
| P2-TAS | API Routes directas a Airtable | `accept edits on` | Backend con escritura real. Que edite, pero pare en comandos. |
| P3-TAS | Pantalla 1 · Cola personal | `accept edits on` | UI de lectura pura. Bajo riesgo. |
| P4-TAS | Pantalla 2 · Coordinar visita | `default` | Escribe filas reales y **dispara correos a la ejecutiva** por Automation. Bloqueada por CI-012. |
| P5-TAS | Pantalla 3 · Ingreso de fotos | `accept edits on` | Sube binarios a Dropbox por el pipeline existente. |
| P6-TAS | Pantalla 4 · Avance lectura de datos | `accept edits on` | Dispara SC07 existente; UI de polling. |
| P7-TAS | Pantalla 5 · Formulario 8 secciones | `accept edits on` | La tanda más grande del plan. Edición libre, pausa obligatoria en comandos. |
| P8-TAS | Pantalla 6 · Avance cálculo | `default` | Dispara la transición `asignada → visitada` y con ella AT03. Irreversible desde la UI. |
| P9-TAS | Pantalla 7 · Preview del informe | `default` | Envía el informe al visador (transición irreversible desde IF-03). Además, es donde se materializa la excepción R5-E. |
| P10-TAS | Reutilización cruzada e integración SLA | `accept edits on` | Verificación y ajuste; toca poco código. |
| P11-TAS | Autenticación y blindaje server-side | `default` | Reemplaza el mock por Clerk y cierra RF-09. Un error aquí abre acceso a solicitudes ajenas. |
| P12-TAS | Deploy a Railway | `default` | Deploy a producción con IF-02 e IF-04 vivos en el mismo despliegue. |

**Regla de comportamiento textual — red de seguridad.** Cada tanda declara al arrancar su
**contrato de comportamiento**. Claude Code lo respeta **incluso si el modo real es más
permisivo**: aunque Sergio olvide cambiar a `default` en P8-TAS, si el plan dice "pregunta antes
de cada comando", Claude Code pregunta.

**Contratos posibles:**

- 🟢 **libre**: puede editar y ejecutar comandos sin preguntar.
- 🟡 **pausa-en-comandos**: edita libre, pero antes de ejecutar cualquier comando de terminal
  (`pnpm`, `bash`, scripts) muestra el comando y pide confirmación con "¿ejecuto? (s/n)".
- 🔴 **pausa-total**: antes de cada edición Y de cada comando, muestra qué va a hacer y pide
  confirmación.

### §0.6 Convención Tanda y aprendizajes

Cada tanda (incluida P0-TAS) es una unidad independiente. Al terminar cada una:

1. Claude Code genera **automáticamente** un archivo de aprendizajes en:
   ```
   docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}-TAS.md
   ```
   con timestamp real del sistema (ej.: `aprendizajes-20260818-1435-P0-TAS.md`). **El sufijo
   `-TAS` es obligatorio**: es lo que separa la secuencia de IF-03 de la de IF-02 en el mismo
   directorio, y lo que hace funcionar la detección de §0.7.

2. Ese archivo contiene: encabezado con tanda/fecha/hora/duración; resumen de qué se construyó;
   decisiones técnicas; overrides aplicados (rutas reales vs plan); bugs y su resolución; deuda
   técnica para tandas siguientes; y reglas nuevas que deberían migrar a `docs/aprendizajes.md`
   (marcadas con `→ MIGRAR`). Plantilla completa en §14.2.

3. Sergio hace commit + push desde GitHub Desktop (**R12**).
4. Sergio confirma en el chat maestro que la tanda quedó ok.
5. Recién ahí se avanza a la siguiente.

`docs/aprendizajes.md` **no se modifica automáticamente** por ninguna tanda: es la base consolidada
de reglas activas del repo, compartida con IF-02. Sólo cuando Sergio pide expresamente migrar una
lección desde el archivo timestamped, Claude Code la mueve.

### §0.7 Autoejecución — Claude Code decide qué tanda correr (R11)

**Sergio no le pasa el prompt de cada tanda.** Al iniciar sesión, Claude Code sigue este
algoritmo:

1. Lee todos los archivos de §0.1.
2. Lista `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P*-TAS.md` ordenados por timestamp. **Filtra
   por el sufijo `-TAS`**: los archivos sin ese sufijo son de IF-02 y no cuentan para esta
   secuencia.
3. Detecta la **última tanda completada**: la del archivo más reciente con timestamp válido y
   contenido no vacío.
4. La siguiente tanda sigue la **secuencia oficial**:
   ```
   P0-TAS → P0.5-TAS → P1-TAS → P2-TAS → P3-TAS → P4-TAS → P5-TAS → P6-TAS
          → P7-TAS → P8-TAS → P9-TAS → P10-TAS → P11-TAS → P12-TAS
   ```
   **No usar aritmética `+1`:** `P0.5-TAS` es una tanda nominal, no fraccional. Si la última
   completada es `P0-TAS`, la siguiente es `P0.5-TAS`; si es `P0.5-TAS`, la siguiente es `P1-TAS`.
5. Si no hay archivos previos con sufijo `-TAS`: la tanda a ejecutar es **P0-TAS**.
6. Si existe `docs/_notas/snapshot-P{n}-TAS.md` pero **no** existe el archivo de aprendizajes
   correspondiente, esa tanda quedó a medias → **retomar P{n}-TAS** desde donde quedó (leer el
   snapshot para conocer el estado).
7. **Antes de arrancar**, Claude Code verifica R6 (`pnpm tsc --noEmit && pnpm build` verdes) y
   muestra un mensaje breve:
   ```
   📋 Detecté que la última tanda completada es P{n-1}-TAS.
   Voy a ejecutar P{n}-TAS — {Nombre}.
   Modo recomendado: {modo} · Contrato: 🟡 pausa-en-comandos.
   Build previo: tsc ✅ · build ✅
   Cambia el modo con Shift+Tab si aún no lo hiciste. ¿Empiezo? (s / n / P{otra})
   ```
8. Sergio responde:
   - `s` (o cualquier confirmación) → arranca la tanda.
   - `n` → espera instrucciones.
   - `P{otra}-TAS` → ejecuta esa tanda en lugar de la detectada.

**Si Sergio dice "sigue" o "continúa" sin más contexto:** Claude Code aplica el algoritmo anterior
y arranca la tanda siguiente.

**Si el build previo sale rojo:** no se arranca ninguna tanda. Se reporta qué está roto y se
espera instrucción — puede ser deuda de IF-02, que **no es de IF-03 arreglar** (R6).

---

## §1 · P0-TAS — Inventario del repo Tasador

> **⚙ Modo recomendado:** `auto mode on`
> **🟢 Contrato de comportamiento:** **libre**. No hay cambios de código; sólo lectura del repo y
> generación de 1 archivo doc. Cero riesgo.

> **Regla dura:** ninguna tanda posterior (P1-TAS en adelante) puede ejecutarse si
> `docs/_notas/inventario-tasador.md` no existe o está desactualizado. Cada tanda consulta el
> inventario para resolver rutas reales antes de crear archivos nuevos.

### §1.1 Diseño

**Objetivo.** Antes de tocar código, inventariar qué hay realmente bajo el territorio de IF-03 y
qué se reutiliza de IF-02, para que las tandas siguientes trabajen sobre **nombres y rutas reales
del repo**, no sobre nombres propuestos en este plan.

**⚠ Hallazgo previo que esta tanda debe verificar y no dar por sentado.** Al redactarse este plan
(17-ago-2026), el barrido del árbol arrojó que **`app/tasaciones/**` y `components/tasador/**` no
existen en el repositorio**, y que las ramas remotas `origin/v0/nutricionsaludketo-8075-ac1268a2`
y `origin/v0/nutricionsaludketo-8075-fc4f5482` contienen el repo v0 de la **Ejecutiva**
(`components/console/*`), no el del Tasador. Es decir: **el insumo "repositorio v0 del Tasador ya
traído al monorepo" no está presente.** P0-TAS **verifica** este hecho antes que nada y bifurca:

- **Caso A · el código v0 del Tasador está** (alguien lo trajo entre la redacción del plan y la
  ejecución). Se inventaría igual que hizo P0 con IF-02: árbol, exports, mapa componente → tanda,
  overrides, y detección de los residuos de CI-015.
- **Caso B · el código v0 del Tasador no está.** El inventario se produce igualmente, pero su
  sección 1 declara el árbol como **vacío** y su sección de overrides declara que **todas** las
  tandas de UI (P3-TAS a P9-TAS) construyen desde cero. Esto **no bloquea el plan** —las siete
  pantallas están íntegramente especificadas en §2 de la spec— pero **cambia el tamaño de cada
  tanda de UI** y hay que decirlo antes, no descubrirlo en P3-TAS. El inventario lo declara como
  riesgo #1 y Sergio decide si importa el v0 antes de P3-TAS o si se construye directo.

**Producto.** Un solo archivo: `docs/_notas/inventario-tasador.md`.

**Contenido del inventario (siete secciones, paralelas a las de `inventario-if02.md`):**

1. **Árbol real** de `app/tasaciones/`, `components/tasador/`, `lib/tasador/` y
   `app/api/tasaciones/` (2 niveles). Si están vacíos, decirlo explícitamente con la palabra
   **AUSENTE** y la fecha de verificación.
2. **Mapa componente → tanda**: por cada componente/carpeta detectado, a qué tanda le corresponde
   extenderlo. En Caso B, la tabla lista las **siete pantallas de §2.13** con la ruta que cada una
   debe ocupar y la tanda que la crea.
3. **Rutas API existentes bajo `app/api/tasaciones/`**: método, path, propósito, si escribe directo
   o vía pipeline. En Caso B: AUSENTE, y se lista el set que P2-TAS debe crear.
4. **Types existentes**: qué entidades del dominio Tasador ya están tipadas (`Tasacion`,
   `CoordinacionVisita`, `DatoTasacion`, `Comparable`) y cuáles faltan. Verificar si alguna ya vive
   en `lib/console-data.ts` (IF-02) y **no puede reutilizarse sin importarla**.
5. **Catálogo de reuso verificado**: confirmar una por una las rutas de §0.2-bis con `grep`, y
   **corregir** este plan si alguna no coincide. Verificación mínima obligatoria:
   ```bash
   grep -rn "export function FileUploadZone" components/console/file-upload-zone.tsx
   grep -rn "export function SLABadge\|export function StateBadge" components/console/status-badges.tsx
   grep -rn "^export" lib/sla-etapas.ts | head -40
   grep -rn "^export" lib/airtable-client.ts
   grep -rn "^export" lib/historial.ts lib/sla-cronologia.ts
   ```
6. **Frontera R5 · lista negra explícita**: enumerar los directorios y archivos que las tandas de
   IF-03 **no pueden modificar**, con su ruta real, para que el criterio de aceptación de cada
   tanda pueda verificarse con `git status`.
7. **Overrides al plan**: por cada tanda (P0.5-TAS a P12-TAS), 1-3 overrides si hay divergencia
   entre lo que este plan propone y lo que el repo tiene. Si no hay divergencia:
   `P{n}-TAS: sin overrides, el plan aplica tal cual`.

**Ejemplo de override esperado:**

```
Plan §0.2-bis dice reutilizar "EstadoBadge".
Repo exporta "StateBadge" en components/console/status-badges.tsx:19.
Decisión: P3-TAS importa StateBadge. El nombre EstadoBadge de la spec §2.13 no existe
y no se crea un alias.
```

### §1.2 Construcción — Pasos para Claude Code

1. Verificar la bifurcación Caso A / Caso B:
   ```bash
   ls -la app/tasaciones components/tasador lib/tasador app/api/tasaciones 2>&1
   git branch -a
   ```
2. Árbol y exports del territorio IF-03 (si existe):
   ```bash
   find app/tasaciones components/tasador lib/tasador app/api/tasaciones -type f 2>/dev/null | sort
   grep -rn "export default\|export function\|export const" components/tasador/ 2>/dev/null | head -100
   ```
3. Detectar los residuos de **CI-015** si hay código v0:
   ```bash
   grep -rn "IntentosIndicator\|MAX_INTENTOS\|intentosRestantes\|PENDIENTE_VISADOR" app/ components/ lib/
   grep -rniE "\bIA\b|\bAI\b|Claude|OCR|inteligencia artificial|prellenado por" app/tasaciones components/tasador 2>/dev/null
   ```
4. Verificar el catálogo de reuso de §0.2-bis con los `grep` de la sección 5 de §1.1.
5. Componer la lista negra de R5:
   ```bash
   ls components/console/ app/api/solicitudes/ "app/(ejecutiva)/"
   ls lib/*.ts | head -60
   ```
6. Escribir `docs/_notas/inventario-tasador.md` con las siete secciones.
7. Checklist final de riesgos, encabezado por el resultado de la bifurcación:
   - Archivos que el plan propone crear y que ya existen con otro nombre.
   - Dependencias mencionadas en el plan que faltan en `package.json` (verificar explícitamente
     que **no** aparece `airtable` y que **no** debe agregarse — §0.4 nota 3).
   - Rutas API mencionadas que faltan y hay que crear en P2-TAS.
   - Componentes de R7 que **no son importables sin editar IF-02** (excepción R5-E).
8. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0-TAS.md` con timestamp real, según §14.2.

### §1.3 Criterios de aceptación

- [ ] `docs/_notas/inventario-tasador.md` existe y tiene las **siete** secciones.
- [ ] La bifurcación Caso A / Caso B está resuelta y declarada en la primera línea del archivo, con
      fecha de verificación.
- [ ] La sección "Overrides al plan" cubre **P0.5-TAS a P12-TAS** (aunque sea con "sin overrides").
- [ ] El catálogo de reuso de §0.2-bis está verificado línea por línea con `grep`, y toda ruta que
      no coincida quedó corregida en el inventario.
- [ ] La lista negra de R5 está enumerada con rutas reales.
- [ ] La excepción **R5-E** (visor "Ver expediente" no exportado) está confirmada o refutada con
      evidencia.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0-TAS.md` creado con timestamp real.
- [ ] **No se modificó ningún archivo de código en esta tanda.** Sólo lectura + 2 archivos doc.
      Verificable con `git status --porcelain` (sólo dos ficheros bajo `docs/`).

---

## §1.5 · P0.5-TAS — Schema Airtable IF-03

> **⚙ Modo recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total** para toda operación de escritura
> (`create_table`, `create_field`, `update_table`, sembrado de filas). Las lecturas
> (`list_tables_for_base`, `get_table_schema`, `search_records`) son 🟢 libres. Antes de cada
> mutación, mostrar en una línea qué se va a crear y pedir `s/n`.

> **Regla dura:** P1-TAS (Types) **no puede ejecutarse** si esta tanda no está completa. P1-TAS
> deriva los tipos desde `docs/schema-airtable.md`; si el schema no refleja los campos de IF-03,
> los tipos quedan desalineados con la base real.

> **⚠ Compuerta de negocio antes de la primera creación.** Crear `TX_CoordinacionVisita`
> **materializa la opción (a) de CI-012** ("crear la tabla y habilitar §2.3"), que es una decisión
> de negocio abierta con consulta enviada a Héctor/Óscar el 11-ago-2026. La opción (b) es retirar
> la coordinación de la spec. **Esta tanda no decide por ellos**: pregunta a Sergio explícitamente
> antes del primer `create_table`, con el enunciado de las dos opciones, y sólo procede con su
> confirmación. Si Sergio confirma, la creación queda registrada como una anticipación consciente,
> no como el cierre de CI-012 — que sigue abierta y sigue bloqueando RF-TAS-04 y RF-TAS-05.

### §1.5.1 Diseño

**Rol operativo:** Airtable Engineer + Data Designer.
**Base:** `app9G7lLkIV3CpeLa`.
**Fuente:** spec v1.9.9 **§2.12 · Delta de schema**.

**Objetivo.** Dejar el schema de Airtable completo para IF-03 — 1 tabla nueva, 3 campos nuevos en
`TX_Solicitudes`, 1 campo en `D_TipoDocumento` y 2 plantillas de correo. **Ningún cambio de UI ni
de código en esta tanda.**

**Producto.**
1. Schema actualizado en `app9G7lLkIV3CpeLa`.
2. `docs/schema-airtable.md` actualizado con TABLE_ID y FIELD_IDs reales *(única excepción a R4:
   este archivo **sí** se toca aquí, porque P1-TAS y los Route Handlers lo leen como fuente)*.
3. `docs/_notas/snapshot-P0.5-TAS.md` con el estado post-tanda.
4. Tabla-resumen impresa al final: `{tabla, campo, accion: creado | existía_ok | conflicto}`.

**Reglas duras de verificación previa:**
- Antes de crear cualquier tabla o campo, verificar con `list_tables_for_base` /
  `get_table_schema`. Si ya existe con el mismo tipo y dominio → **no re-crear**, sólo confirmar.
- Si un `singleSelect` existe con opciones distintas → **no modificar**, reportar conflicto y pedir
  instrucciones a Sergio.
- Orden cross-system estricto: **Airtable schema (esta tanda) → tipos TS (P1-TAS) → Route Handlers
  (P2-TAS) → UI (P3-TAS+)**.
- **Jamás inventar un TABLE_ID ni un FIELD_ID.** Si una creación falla, se marca
  `pendiente_ui_manual` en el snapshot y se avisa a Sergio para creación manual en Airtable.

**Alcance — TABLA NUEVA: `TX_CoordinacionVisita`** (13 campos de §2.12)

| # | Campo | Tipo | Notas de realización |
|---|---|---|---|
| 1 | `id` | — | §2.12 dice "PK auto". Airtable no expone PK numérica editable. **Realización:** se usa el `recordId` nativo como identidad y se crea un `autoNumber` llamado `numero` sólo si Sergio lo pide. No se crea un campo llamado `id`. |
| 2 | `solicitud` | `multipleRecordLinks` → `TX_Solicitudes` | §2.12 lo llama `solicitud_id`. **Se nombra `solicitud`**, por consistencia con el resto de la base (`TX_Adjuntos.solicitud`). ⚠ El Link se evalúa contra el **primary field** `codigo_solicitud`, no contra el record ID (E-018 · §19.1 del schema). |
| 3 | `estado_coordinacion` | `singleSelect` | `confirmada` · `rechazada` |
| 4 | `motivo` | `singleSelect` | Catálogo cerrado de **A-17**: `Teléfono no contesta` · `Teléfono equivocado` · `Cliente rechaza visita` · `Otro`. Obligatorio si `rechazada`, vacío si `confirmada` (la obligatoriedad la valida el Route Handler, no Airtable). |
| 5 | `detalle` | `multilineText` | Obligatorio si `rechazada`, mínimo 20 caracteres (validado en Zod, P2-TAS). |
| 6 | `nota` | `multilineText` | Opcional si `confirmada`. |
| 7 | `fecha_visita_propuesta` | `date` | Obligatorio si `confirmada`. `timeZone = America/Santiago`. |
| 8 | `fecha_respuesta` | `dateTime` | Hora de servidor. `timeZone = America/Santiago` — **nunca `client`** (lección de la Tanda A de §9.6 en IF-02). |
| 9 | `autor_clerk_id` | `singleLineText` | `clerk_user_id` del tasador. Hasta P11-TAS lo escribe `mockUserTasador`. |
| 10 | `email_thread_id` | `lookup` desde `TX_Solicitudes` | Preserva RN-52. Si el lookup no se puede crear vía API, se crea `singleLineText` y el Route Handler lo copia; **se documenta cuál de las dos quedó**. |
| 11 | `email_enviado_at` | `dateTime` | Lo escribe la Automation de correo (R3), nullable. |
| 12 | `email_enviado_status` | `singleSelect` | `pendiente` · `enviado` · `error`. **Es el disparador de la Automation** (§0.4 · nota 1). |
| 13 | `intento_numero` | `number` (integer) | ⚠ §2.12 lo declara `formula` = `1 + COUNT(intentos previos)`. **Airtable no permite contar registros hermanos de la misma tabla sin un rollup intermedio en `TX_Solicitudes`.** **Realización:** campo `number` escrito por el Route Handler, que cuenta los intentos previos antes del insert. La divergencia se documenta en `schema-airtable.md`. |

**Constraint blanda de unicidad** `(solicitud, fecha_respuesta truncada al minuto)` — mitigación
R-2 contra doble tap. **Airtable no tiene unicidad como primitiva.** Se implementa **en el Route
Handler de P2-TAS**: antes del insert, busca un intento de la misma solicitud con
`fecha_respuesta` dentro del minuto en curso; si existe, devuelve 409 sin escribir. Esta tanda
sólo deja el schema que lo permite; no crea vista ni fórmula de control.

**Alcance — CAMPOS NUEVOS EN `TX_Solicitudes`** (`tblaHTyMHYfmy7Fg6`)

| Campo | Tipo | Notas |
|---|---|---|
| `coordinacion_vigente` | `formula` | §2.12: último `estado_coordinacion` por `fecha_respuesta DESC`, o vacío si no hay intentos. ⚠ Airtable no tiene `LAST(... ORDER BY ...)`. **Realización:** rollup `MAX(fecha_respuesta)` + fórmula, o rollup del `estado_coordinacion` del intento más reciente. La expresión exacta se decide contra la base y **se transcribe literal** en `schema-airtable.md`. `isValid: true` dice que compila, no qué cadena emite: **se verifica el valor real** sobre una fila sembrada de prueba. Alimenta el chip "Por coordinar" y el badge "Esperando contacto de ejecutiva" (Regla T-A). |
| `observacion_rechazo_tasador` | `multilineText` | Nullable. Lo escribe RF-TAS-09 (P9-TAS). |
| `fecha_real_visita` | `date` | `timeZone = America/Santiago`. **Obligatorio para calcular** (Regla T-B · RF-TAS-17). Distinto de `fecha_visita_programada` (`fldPUFd9YuQdkcrOI`), que ya existe y es la planificada por la ejecutiva. |

**Campo que NO se crea:** `horas_restantes`. Retirado en v1.9.9 (CI-021): derivaba horas del plazo
agregado en días y producía una cifra irreproducible. El badge se alimenta de `lib/sla-etapas.ts`.

**Alcance — CAMPO EN `D_TipoDocumento`** (`tblkPhBnpdDmUWOl3`)

`tipo_propiedad` (`fldIfdcjsr8KeNRCx`) **ya existe** — verificado el 25-jul-2026 (A-05). §2.12 lo
declara como alta nueva y **no lo es**. Lo que esta tanda hace es:
- **Confirmar** que existe y **no re-crearlo**.
- Registrar que su dominio real está en **femenino** (`nueva · usada · ambas`) contra el masculino
  que declara la spec, y contra `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`),
  que está en masculino. **Es el punto abierto P-5 y bloquea RF-TAS-06** (§0.4-bis).
- **No renombrar ni alinear el dominio.** Eso es trabajo en Airtable con sign-off de negocio, fuera
  del alcance de esta tanda. P5-TAS aplica el paliativo de normalización server-side.
- Verificar el poblado de `tipo_propiedad` sobre las filas del catálogo (P-4: `Reproceso`,
  `Cliente tipo 2`, `Depto con gas` y `---` → `ambas`, como asunción declarada).

**Alcance — PLANTILLAS DE CORREO** (2)

`email_coordinacion_confirmada` y `email_coordinacion_rechazada`. **⚠ Divergencia a resolver en
esta tanda:** §2.12 las ubica en `C_Plantillas` (`tblcYtNeJBD545hLw`), pero IF-02 ya descubrió que
**`C_Plantillas` no tiene ningún campo donde quepa un cuerpo HTML**, y que la fuente de runtime
real es `C_NotificacionesConfig` (`tbluB662ulWDaxqUY`). Procedimiento:

1. Leer el schema de ambas tablas y **decidir con evidencia**, no con la spec.
2. Crear las dos plantillas donde el cuerpo HTML quepa, siguiendo el patrón del artefacto ya
   probado `C_NotificacionesConfig__email_asignacion_tasador__v1_20260803.html`.
3. **Contenido mínimo obligatorio (RF-TAS-13):** confirmada → fecha de visita acordada + nota del
   tasador si existe; rechazada → motivo del catálogo + detalle escrito. Ambas identifican la
   solicitud por su código `VP-AAAA-NNNN` y la propiedad por su dirección.
4. Registrar en `schema-airtable.md` **dónde quedaron realmente**, y anotar la divergencia con la
   spec en §16 de este plan.

**Automation de correo (R3).** Se declara aquí y **se construye en P4-TAS**, no en ésta: observa
`TX_CoordinacionVisita.email_enviado_status = pendiente`, envía con la plantilla que corresponda al
`estado_coordinacion`, y marca `enviado` + `email_enviado_at`. Esta tanda sólo deja el schema que
la habilita. **No se enciende ninguna Automation en P0.5-TAS.**

**Tablas de captura que ya existen y NO se crean** (verificadas en `schema-airtable.md`):

| Tabla | TABLE_ID | Uso en IF-03 |
|---|---|---|
| `TX_DatosTasacion` | `tblMoK3mFuwN8Yr1A` | Write de la captura (§2.8) |
| `TX_Comparables` | `tbllbTuhb0waWIbRo` | Write de la sección D |
| `TX_ItemsCuadroValoracion` | `tblCxnMtOETK2ulD0` | Write de la sección C |
| `TX_Unidades` | `tbl2QDLvJDyy3Rg2I` | Read/write de superficies (RN-45) |
| `TX_ContactosVisita` | *(verificar en la tanda)* | Read en §2.3 |
| `TX_Adjuntos` | `tblur71x1oItbmKZc` | Write de fotos y documentos |
| `A_Cambios` | `tbl6Yd0c7MRqNeC0x` | Write de auditoría |
| `C_SLA_Etapas` | `tbl05zu5RLhH3u6pl` | Read del plazo por etapa (RF-53) |
| `C_SLA` | `tblsPZokEK5aoinTn` | Read del plazo agregado |

Las tablas hijas que §2.16 nombra y esta tanda **verifica sin crear**:
`TX_ObrasComplementarias`, `TX_Ampliaciones`, `TX_HabitacionesPorNivel`,
`TX_TerminacionesPorRecinto`, `TX_Amenities`, `TX_DocumentosLegales`. Si alguna **no existe**, se
reporta como hallazgo y **no se crea sin autorización de Sergio** (CLAUDE.md exige aprobación
explícita para tablas nuevas).

### §1.5.2 Construcción — Pasos para Claude Code

1. **Compuerta CI-012**: plantear a Sergio las dos opciones y esperar confirmación explícita.
2. Inventario previo de sólo lectura: listar tablas de la base y verificar cuáles de las de arriba
   existen. Imprimir el resultado **antes** de crear nada.
3. Crear `TX_CoordinacionVisita` con sus 13 campos, uno a uno, pidiendo `s/n` en cada uno.
4. Crear los 3 campos de `TX_Solicitudes`. Para `coordinacion_vigente`, sembrar una fila de prueba
   y **verificar el valor emitido**, no sólo `isValid`.
5. Confirmar `D_TipoDocumento.tipo_propiedad` y registrar la divergencia de género (P-5).
6. Resolver `C_Plantillas` vs `C_NotificacionesConfig` con evidencia y crear las dos plantillas.
7. Verificar (sin crear) las tablas de captura y las hijas.
8. Actualizar `docs/schema-airtable.md`: sección nueva para IF-03 con TABLE_ID y todos los
   FIELD_IDs reales, más las **cuatro notas de realización** (`id`, `intento_numero`,
   `coordinacion_vigente`, unicidad blanda).
9. Escribir `docs/_notas/snapshot-P0.5-TAS.md` y la tabla-resumen.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.5-TAS.md`.

### §1.5.3 Criterios de aceptación

- [ ] Sergio confirmó explícitamente la compuerta CI-012 **antes** del primer `create_table`, y la
      confirmación está registrada en el snapshot.
- [ ] `TX_CoordinacionVisita` existe con sus 13 campos y su TABLE_ID está en
      `docs/schema-airtable.md`.
- [ ] Los 3 campos nuevos de `TX_Solicitudes` existen con sus FIELD_IDs documentados.
- [ ] `coordinacion_vigente` fue verificada **por su valor emitido** sobre una fila de prueba, no
      sólo por `isValid`.
- [ ] `horas_restantes` **no** fue creado.
- [ ] `D_TipoDocumento.tipo_propiedad` fue confirmado como preexistente y **no** re-creado; la
      divergencia de género (P-5) está registrada.
- [ ] Las dos plantillas existen, y `docs/schema-airtable.md` dice **en qué tabla** quedaron y por
      qué.
- [ ] **Ninguna Automation quedó encendida** en esta tanda.
- [ ] **Ninguna tabla nueva además de `TX_CoordinacionVisita`** fue creada.
- [ ] La tabla-resumen `{tabla, campo, accion}` está impresa y en el snapshot.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.5-TAS.md` creado.
- [ ] **Cero cambios en código.** `git status` sólo muestra archivos bajo `docs/`.

---

## §2 · P1-TAS — Types TypeScript

> **⚙ Modo recomendado:** `auto mode on`
> **🟢 Contrato de comportamiento:** **libre**. Sólo tipos TS; los errores los atrapa `tsc`.

> **Regla dura:** los tipos se derivan de `docs/schema-airtable.md` **tal como quedó tras
> P0.5-TAS**, con los FIELD_IDs reales. Ningún tipo se inventa desde este plan ni desde la spec.

### §2.1 Diseño

**Ubicación:** `lib/tasador/types.ts` (+ los módulos que se listan abajo). **Territorio IF-03
exclusivamente** — no se toca `lib/console-data.ts`, que es de IF-02 (R5).

**Estructura propuesta** (verificar contra el inventario de P0-TAS antes de crear):

```
lib/tasador/
├── types.ts                # Tipos de dominio del Tasador
├── field-ids.ts            # Mapa FIELD_ID → nombre lógico, congelado con Object.freeze
├── mock-user.ts            # mockUserTasador (R2) — se retira en P11-TAS
└── tipo-propiedad.ts       # Normalización de género masculino↔femenino (P-5)
```

**Entidades a tipar:**

```ts
// Solicitud vista desde la cola del tasador (§2.1)
export interface Tasacion {
  id: string;                       // recordId de TX_Solicitudes
  codigo: string;                   // codigo_solicitud · VP-AAAA-NNNN
  estado: EstadoBackend;            // asignada | visitada | calculada | ...
  comuna: string | null;
  tipoPropiedad: string | null;     // catálogo M_TiposPropiedad
  tipoPropiedadNuevoUsado: 'nuevo' | 'usado' | null;  // alias §22 schema
  direccion: string | null;
  rolSii: string | null;            // se omite la línea si es null (RF-TAS-11)
  clienteInstitucional: string | null;
  producto: string | null;
  telefonoContactoPrioridad1: string | null;  // enlace tel: accionable
  fechaVisitaPlanificada: string | null;      // Regla T-B — NUNCA "fechaVisita"
  fechaRealVisita: string | null;             // Regla T-B
  coordinacionVigente: EstadoCoordinacion | null;
  sla: SlaEtapaTasador;             // viene del motor, no se recalcula
}

export type EstadoBackend =
  | 'creada' | 'asignada' | 'visitada' | 'calculada' | 'pdf_listo'
  | 'aprobada' | 'pendiente_final' | 'entregada' | 'cerrada'
  | 'cancelada' | 'requiere_atencion';
// 'devuelta' NO se incluye: deprecado (§0.4 nota 6).

export type EstadoCoordinacion = 'confirmada' | 'rechazada';

export type MotivoNoContacto =
  | 'Teléfono no contesta' | 'Teléfono equivocado'
  | 'Cliente rechaza visita' | 'Otro';

export interface CoordinacionVisita {
  id: string;
  solicitudId: string;
  estadoCoordinacion: EstadoCoordinacion;
  motivo: MotivoNoContacto | null;      // obligatorio si rechazada
  detalle: string | null;               // obligatorio si rechazada, ≥20 chars
  nota: string | null;                  // opcional si confirmada
  fechaVisitaPropuesta: string | null;  // obligatorio si confirmada
  fechaRespuesta: string;               // hora de servidor
  autorClerkId: string;
  emailThreadId: string | null;
  emailEnviadoAt: string | null;
  emailEnviadoStatus: 'pendiente' | 'enviado' | 'error';
  intentoNumero: number;
}

export interface DatoTasacion { /* secciones A–H de §2.8 */ }
export interface Comparable { /* columnas de la grilla de §2.8 */ }

// Variante única del botón de la card (Regla T-A)
export type AccionCard =
  | { tipo: 'coordinar' }                       // acento
  | { tipo: 'abrir' }                           // primario
  | { tipo: 'esperando_ejecutiva' };            // deshabilitado + badge
```

**Tres decisiones de tipado que hacen cumplir las Reglas T:**

1. **Regla T-A se codifica en el tipo.** `AccionCard` es una **unión discriminada**, no tres
   booleanos. Un tipo que permita `{ puedeCoordinar: true, puedeAbrir: true }` deja que la Regla
   T-A se rompa en tiempo de ejecución; la unión lo hace imposible en tiempo de compilación.
2. **Regla T-B se codifica en el nombre.** Existen `fechaVisitaPlanificada` y `fechaRealVisita`.
   **No existe** ningún identificador `fechaVisita` a secas en todo IF-03.
3. **`SlaEtapaTasador` no lleva aritmética.** Es el resultado que devuelve `lib/sla-etapas.ts`
   (semáforo + horas restantes + etapa vigente). No hay campo que IF-03 pueda calcular por su
   cuenta (CI-021).

**`mockUserTasador` (R2).** Módulo `lib/tasador/mock-user.ts` con una función
`getUsuarioTasador()` que hasta P11-TAS devuelve un objeto fijo con `clerkUserId` y `recordId` de
un tasador real de `M_Tasadores`. **Es el único punto de todo IF-03 que sabe quién es el usuario**:
ninguna otra parte del código lee la identidad por otro camino, de modo que P11-TAS sea un cambio
de una sola función y no una cacería. El módulo lleva un comentario `// TODO(P11-TAS)` en su
primera línea.

### §2.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P1-TAS en `docs/_notas/inventario-tasador.md`.
2. Leer `docs/schema-airtable.md` **post-P0.5-TAS** y extraer los FIELD_IDs reales.
3. Crear `lib/tasador/field-ids.ts` con el mapa congelado (`Object.freeze`), siguiendo el patrón de
   `FIELD_IDS_SLA` en `lib/sla-etapas.ts:60`.
4. Crear `lib/tasador/types.ts` con las entidades de §2.1.
5. Crear `lib/tasador/mock-user.ts` con `getUsuarioTasador()` y su `TODO(P11-TAS)`.
6. Crear `lib/tasador/tipo-propiedad.ts` con la normalización de género (P-5), acompañada de un
   comentario que declare que es un **paliativo** y que la corrección real es alinear el dominio en
   Airtable.
7. Verificar que **ningún** tipo duplica uno de `lib/console-data.ts`; si hay solape real
   (`Adjunto`, `Comuna`), **importar** el de IF-02 en vez de redefinirlo.
8. `pnpm tsc --noEmit`.
9. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P1-TAS.md`.

### §2.3 Criterios de aceptación

- [ ] `lib/tasador/{types,field-ids,mock-user,tipo-propiedad}.ts` existen.
- [ ] Todos los FIELD_IDs provienen de `docs/schema-airtable.md`; **ninguno inventado**. Verificable:
      cada `fld…` del archivo aparece en el schema doc.
- [ ] `AccionCard` es una unión discriminada; no existe ninguna variante con dos acciones activas.
- [ ] `grep -rn "fechaVisita\b" lib/tasador/` **no devuelve nada** (Regla T-B).
- [ ] `EstadoBackend` **no** incluye `devuelta`.
- [ ] `mockUserTasador` es el único punto que resuelve identidad. Verificable:
      `grep -rn "clerk\|Clerk" lib/tasador/` sólo aparece en `mock-user.ts` como comentario.
- [ ] Ningún tipo duplica uno de `lib/console-data.ts`.
- [ ] `pnpm tsc --noEmit` pasa. `pnpm build` verde (R6).
- [ ] `git status` no muestra cambios fuera de `lib/tasador/` y `docs/`.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P1-TAS.md` creado.

---

## §3 · P2-TAS — API Routes directas a Airtable

> **⚙ Modo recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Es la primera tanda que escribe a la
> base productiva. Edición libre; confirmación obligatoria antes de cualquier comando que ejecute
> una escritura real.

> **Regla dura:** todas las mutaciones son **directas a Airtable** (R3). **Cero llamadas a Make**
> desde `app/api/tasaciones/**`. Verificable con `grep -rn "make\|MAKE_WEBHOOK\|postToMake"`.

### §3.1 Diseño

**Ubicación:** `app/api/tasaciones/**` exclusivamente. La lógica compartida vive en
`lib/tasador/`. **No se toca `app/api/solicitudes/**`** (R5).

**Set de rutas** (verificar contra el inventario antes de crear):

| Método | Ruta | Propósito | RF |
|---|---|---|---|
| GET | `/api/tasaciones` | Cola del tasador: `TX_Solicitudes.tasador = usuario` y `estado ∈ {asignada, visitada, calculada}`, con el SLA por etapa resuelto | RF-09 · RF-TAS-01 · RF-TAS-02 |
| GET | `/api/tasaciones/[id]` | Datos de la solicitud para las pantallas 2, 5 y 7 | RF-09 |
| GET | `/api/tasaciones/[id]/coordinacion` | Último intento + historial de intentos | RF-TAS-03 |
| POST | `/api/tasaciones/[id]/coordinacion` | Inserta 1 fila en `TX_CoordinacionVisita` con `email_enviado_status = pendiente` | RF-TAS-03 · RF-TAS-12 |
| GET | `/api/tasaciones/[id]/fotos` | Fotos por categoría + contadores | RF-TAS-14 |
| POST | `/api/tasaciones/[id]/fotos` | Alta de foto → `TX_Adjuntos` (binario por el pipeline existente) | RF-TAS-14 |
| GET | `/api/tasaciones/[id]/lectura` | Estado de la extracción para el stepper (polling) | RF-TAS-15 |
| GET · PATCH | `/api/tasaciones/[id]/datos` | Lee y persiste las secciones A–H sobre `TX_DatosTasacion` y tablas hijas | RF-TAS-16 · RF-TAS-17 |
| GET · POST · DELETE | `/api/tasaciones/[id]/comparables` | Grilla de la sección D | RF-12 |
| GET | `/api/tasaciones/[id]/estado` | Estado backend para el polling de P8-TAS y el bloqueo de RF-TAS-07 | RF-TAS-07 · RF-TAS-19 |
| POST | `/api/tasaciones/[id]/calcular` | Transición `asignada → visitada` (dispara SC06 → SC08 → AT03) | RF-TAS-22 |
| GET | `/api/tasaciones/[id]/informe` | Datos de los 8 bloques del preview + versión vigente | RF-TAS-20 |
| GET | `/api/tasaciones/[id]/expediente` | Adjuntos de sólo lectura para "Ver expediente" | RF-TAS-10 |
| POST | `/api/tasaciones/[id]/rechazo` | Persiste `observacion_rechazo_tasador` **sin cambiar estado** | RF-TAS-09 |
| GET | `/api/tasaciones/config/defaults` | Factores de homogeneización y coeficientes desde la capa de configuración | RF-TAS-08 |

**Las cuatro capas obligatorias de cada Route Handler**, en este orden:

1. **Identidad** — `getUsuarioTasador()` de `lib/tasador/mock-user.ts` (R2). Nunca se lee la
   identidad de otro modo.
2. **Autorización (RF-09)** — antes de tocar nada, verificar que la solicitud pertenece al tasador:
   `TX_Solicitudes.tasador` contiene el registro del usuario. Si no, **403** sin filtrar
   información sobre la solicitud ajena. Hasta P11-TAS la comparación usa el mock, pero **la capa
   se escribe ahora y funciona**: P11-TAS sustituye la fuente de identidad, no inventa el guard.
3. **Validación Zod** — todo cuerpo entrante se parsea con un schema de
   `lib/tasador/validators/`. Nada se escribe con datos sin validar. Mensajes de error humanos
   (§6.1 del Blueprint), nunca el error crudo de Zod.
4. **Escritura + auditoría** — mutación vía `lib/airtable-client.ts` (o el wrapper
   `lib/tasador/airtable-writes.ts` si hubo que envolverlo, §0.4 nota 3) **seguida de** un insert en
   `A_Cambios` con `tabla_origen` + `registro_id`, porque la tabla **no tiene Link a la solicitud**
   (CI-011).

**Reglas específicas de tres rutas:**

- **`POST /coordinacion`** — antes del insert, aplicar la **unicidad blanda**: buscar un intento de
  la misma solicitud con `fecha_respuesta` dentro del minuto en curso; si existe, devolver **409**
  sin escribir (mitigación R-2 · doble tap). Calcular `intento_numero` contando los intentos
  previos. Escribir `email_enviado_status = pendiente` — **es el único disparo del correo**; la
  ruta **no** envía nada.
- **`POST /calcular`** — rechazar con 409 si el estado ya es `visitada` o `calculada`
  (RF-TAS-07). La transición se escribe en un solo update. Es la mutación más delicada del plan:
  dispara AT03 aguas abajo y no se puede deshacer desde la UI.
- **`POST /rechazo`** — persiste la observación y **no toca `estado`** bajo ninguna circunstancia
  (RF-TAS-09). No emite aviso al visador (A-15).

**SLA (CI-021).** `GET /api/tasaciones` resuelve el semáforo llamando a `lib/sla-etapas.ts`
(etapas **2** y **5**), no con aritmética propia. Si el motor no puede resolver una solicitud
(configuración faltante, `SlaConfigFaltante`), la card recibe `sla: null` y la UI muestra el badge
en estado neutro — **nunca** un número inventado.

**Feedback de progreso (Regla D del `CLAUDE.md`).** Cada ruta de mutación devuelve una respuesta
que permita a la UI cerrar el ciclo spinner → resultado. Los literales en gerundio y el `finally`
obligatorio se implementan en las tandas de UI, pero el contrato de respuesta se fija aquí.

### §3.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P2-TAS en el inventario.
2. Auditar lo existente antes de crear:
   ```bash
   ls app/api/tasaciones 2>/dev/null
   grep -rn "^export" lib/airtable-client.ts
   ```
3. Si `lib/airtable-client.ts` **no** expone `createRecord` / `listRecords` con paginación: crear
   `lib/tasador/airtable-writes.ts` que lo **importe y envuelva**. **No editar
   `lib/airtable-client.ts`** sin autorización de Sergio (R5-E).
4. Crear `lib/tasador/validators/` con un schema Zod por ruta de mutación.
5. Crear `lib/tasador/auth-guard.ts` con la capa 2 (autorización RF-09), consumiendo
   `getUsuarioTasador()`. **Una sola implementación** que todas las rutas importan.
6. Crear `lib/tasador/auditoria.ts` con el insert a `A_Cambios`.
7. Crear las 15 rutas de la tabla de §3.1.
8. Tests unitarios (vitest) de: el guard 403, la unicidad blanda del POST de coordinación (409), el
   409 de `/calcular`, y la validación de los 20 caracteres del detalle.
9. `pnpm tsc --noEmit && pnpm build && pnpm test`.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2-TAS.md`.

### §3.3 Criterios de aceptación

- [ ] Las 15 rutas existen bajo `app/api/tasaciones/**`.
- [ ] **Cero Make.** `grep -rniE "make|postToMake|MAKE_WEBHOOK|X-VP-Signature" app/api/tasaciones/`
      no devuelve nada (R3).
- [ ] Toda ruta pasa por las cuatro capas en orden. Verificable: cada `route.ts` importa
      `auth-guard` y un validador Zod.
- [ ] Un GET a una solicitud que no pertenece al usuario devuelve **403** y no filtra datos.
- [ ] Dos POST a `/coordinacion` en el mismo minuto producen **una fila y un 409**, no dos filas.
- [ ] `POST /calcular` sobre una solicitud ya `visitada` devuelve **409** sin escribir.
- [ ] `POST /rechazo` deja `TX_Solicitudes.estado` idéntico antes y después.
- [ ] Toda mutación deja su fila en `A_Cambios` con `tabla_origen` + `registro_id`.
- [ ] El SLA de `GET /api/tasaciones` proviene de `lib/sla-etapas.ts`. Verificable: **no hay ningún
      literal numérico de plazo** (`4`, `6`, `24`, `48`) en `app/api/tasaciones/**` fuera de tests.
- [ ] `package.json` **no** ganó la dependencia `airtable` ni ninguna otra (§0.4 nota 3).
- [ ] `pnpm tsc --noEmit`, `pnpm build` y `pnpm test` verdes (R6).
- [ ] `git status` no muestra cambios en `app/api/solicitudes/**`, `components/console/**` ni
      `app/(ejecutiva)/**` (R5).
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2-TAS.md` creado.

---

## §4 · P3-TAS — Pantalla 1 · Cola personal

> **⚙ Modo recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. UI de lectura pura; no cambia estado
> real. Edición libre, confirmación antes de comandos.

> **Ambigüedad declarada: A-12.** El chip "Hoy" **no se implementa**. Se renderiza como stub
> deshabilitado. **CI-018, CI-019 y CI-020** ya están resueltas en la documentación y esta tanda
> las aplica tal como quedaron.

### §4.1 Diseño

**Ruta:** `app/tasaciones/page.tsx` (§2.13). **Viewport base 375×812** (R9).

**Estructura:**

```
app/tasaciones/
├── page.tsx                     # Server Component: fetch de la cola
└── loading.tsx

components/tasador/
├── tasador-shell.tsx            # Header sticky + título + contador + chips
├── chips-cola.tsx               # 3 chips, uno de ellos stub (A-12)
├── tasacion-card.tsx            # La card completa (RF-TAS-11)
└── accion-card.tsx              # El botón único contextual (Regla T-A)
```

**Header sticky** — logo VPROPERTY + nombre y avatar del usuario (desde `mockUserTasador` hasta
P11-TAS). Bajo el header: título **"Mis tasaciones"** con el contador **"N en curso"**.

**Los tres chips** (§2.1 · RF-TAS-01 · CI-019), mutuamente excluyentes:

| Chip | Estado | Comportamiento |
|---|---|---|
| **Todas** | ✅ Activo por defecto | Cola completa: `estado ∈ {asignada, visitada, calculada}`. |
| **Hoy** | 🚫 **Stub deshabilitado (A-12)** | Se renderiza visible pero no accionable, con `disabled` y tooltip: *"La agenda del día está pendiente de definición."* **No filtra nada.** No se le escribe lógica: cuando A-12 cierre, se implementa entonces. |
| **Por coordinar** | ✅ Activo | Sin coordinación vigente, `estado = asignada` y `now() - fecha_asignacion < 4h`, ordenadas por **menor tiempo restante**. Una solicitud con coordinación **rechazada** sale de este chip (su reloj se detiene) y **permanece en "Todas"**. |

**No existe el chip "SLA en riesgo"** (CI-019). No se crea ni como stub.

El chip activo se refleja en la **URL** (`?chip=todas|por-coordinar`), de modo que volver desde una
pantalla interior lo reactiva. El cambio de chip **no recarga la ruta**.

**Contenido de la card** (RF-TAS-11 · CI-018), en este orden exacto:

1. Código `VP-AAAA-NNNN`.
2. **Badge de SLA** con punto de color y etiqueta: "En plazo · 20h", "Por vencer · 5h",
   "Por coordinar · 3h", "Vencido". **Es badge de SLA, no de estado.** Se importa `SLABadge` de
   `components/console/status-badges.tsx` (R7).
3. Comuna · tipo de propiedad.
4. Dirección.
5. Rol SII — **la línea se omite** si la solicitud no lo tiene; no se muestra vacía.
6. Cliente institucional · producto.
7. Teléfono del contacto de prioridad 1 como **enlace `tel:` accionable**. Pulsarlo abre el marcador
   del dispositivo sin salir de la app. No es cosmético: la etapa 2 mide 4 h desde la asignación
   hasta el primer contacto y la card es el punto desde donde se llama.
8. Fecha de visita — **sólo** cuando ya está coordinada; se omite si no.

**La card NO muestra la versión del informe** (CI-018): en esta pantalla no aporta decisión.

**El botón único contextual (Regla T-A).** `accion-card.tsx` recibe el tipo `AccionCard` de
P1-TAS —unión discriminada— y renderiza **exactamente una** de las tres variantes. El componente
**no acepta** props booleanas que permitan dos a la vez; si la unión no cubre un caso, el
`switch` es exhaustivo y `tsc` lo detecta.

**SLA (RF-TAS-02 · CI-021).** La card **no calcula nada**: consume el objeto que devuelve
`GET /api/tasaciones`, que a su vez viene de `lib/sla-etapas.ts` sobre las etapas 2 y 5. Si el
motor devolvió `null`, el badge se renderiza neutro.

**Mobile-first (R9).** Columna única a 375 px. Las cards ocupan el ancho completo con padding
lateral. El header es sticky. Los chips scrollean horizontalmente si no caben, sin que el body
scrollee en horizontal. El botón de acción es de altura táctil (≥44 px).

### §4.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P3-TAS en el inventario. Si P0-TAS resolvió **Caso B**, esta tanda
   construye las cuatro piezas desde cero; si **Caso A**, extiende lo que trajo v0 **in-place**.
2. Verificar que `SLABadge` es importable y su firma de props:
   ```bash
   sed -n '40,115p' components/console/status-badges.tsx
   ```
3. Crear `app/tasaciones/page.tsx` como **Server Component** que llama al Route Handler y pasa los
   datos a `TasadorShell`. Sólo `chips-cola.tsx` y `accion-card.tsx` son `"use client"` (tienen
   estado/eventos).
4. Crear las cuatro piezas de §4.1.
5. Cablear el chip activo a la URL con `useSearchParams` + `router.replace` (sin recarga).
6. Implementar el stub del chip "Hoy" con `disabled` + tooltip. **Sin rama de filtrado.**
7. Tests: las tres variantes del botón son excluyentes; una card sin Rol SII omite la línea; una
   solicitud con coordinación rechazada no aparece en "Por coordinar" y sí en "Todas".
8. Verificar a 375×812 antes de cerrar.
9. `pnpm tsc --noEmit && pnpm build && pnpm test`.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P3-TAS.md`.

### §4.3 Criterios de aceptación

- [ ] `/tasaciones` renderiza la cola con el chip "Todas" activo por defecto.
- [ ] Hay **tres** chips. "Hoy" está deshabilitado con tooltip y **no filtra**. **No existe**
      "SLA en riesgo".
- [ ] El chip activo viaja en la URL y volver desde una pantalla interior lo reactiva. Cambiar de
      chip **no** recarga la ruta.
- [ ] Cada card muestra los 8 elementos en el orden de §4.1, y **no** muestra versión del informe.
- [ ] Una card sin Rol SII o sin fecha de visita **omite** esa línea (no la muestra vacía).
- [ ] Pulsar el teléfono abre el marcador (`href="tel:…"`).
- [ ] **Regla T-A:** ninguna card presenta dos variantes de botón. Verificable por tipo: el `switch`
      sobre `AccionCard` es exhaustivo.
- [ ] Una solicitud con coordinación rechazada muestra "Ver coordinación" deshabilitado + badge
      "Esperando contacto de ejecutiva", sale de "Por coordinar" y sigue en "Todas".
- [ ] El badge de SLA proviene del API. **`grep -rn "4\|6\|24\|48"` no encuentra umbrales
      hardcodeados** en `components/tasador/`.
- [ ] `SLABadge` se **importa** de `components/console/status-badges.tsx`; **no** existe una copia
      bajo `components/tasador/` (R7).
- [ ] Verificado a **375×812** sin scroll horizontal del body (R9).
- [ ] `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes. `git status` limpio fuera del
      territorio IF-03 (R5, R6).
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P3-TAS.md` creado.

---

## §5 · P4-TAS — Pantalla 2 · Coordinar visita ⛔ **BLOQUEADA · pendiente decisión Héctor/Óscar**

> **⚙ Modo recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Escribe filas reales y **dispara correos a la
> ejecutiva** por Automation. Antes de cada edición y cada comando, mostrar qué se va a hacer.

> ## ⛔ ESTADO DE LA TANDA: BLOQUEADA POR CI-012
>
> **CI-012 · pendiente de decisión de negocio (Héctor/Óscar · consulta enviada el 11-ago-2026).**
> La spec §2.3 describe la coordinación por sistema; §1.3.2, §1.3.3, §1.4 y RN-59 la retiran y la
> devuelven al canal manual. Las dos posiciones no se sostienen a la vez y **el documento no las
> reconcilia**.
>
> **Qué significa exactamente para esta tanda (R10):**
>
> | | |
> |---|---|
> | **RF-TAS-03, RF-TAS-12, RF-TAS-13** | ✅ **Se construyen**, detrás de un flag de entorno **apagado** (`TASADOR_COORDINACION_ENABLED=false`). |
> | **RF-TAS-04** (reapertura para segundo intento) | ⛔ **NO se construye.** Depende de la excepción a RN-59 que §1.4 retiró en v1.9.9: no tiene vía de habilitación en IF-02, y construirla sería escribir una rama muerta. |
> | **RF-TAS-05** (visibilidad para la ejecutiva en IF-02) | ⛔ **NO se construye.** Además exigiría **editar `components/console/**`**, que R5 prohíbe. Doble bloqueo. |
> | **Liberación a producción** | ⛔ **NO.** El flag queda apagado en Railway en P12-TAS. La pantalla existe en el código y no es alcanzable por el tasador. |
>
> **Al cerrarse CI-012** se enciende el flag (si la decisión fue la opción (a)) o se retira la
> tanda completa junto con la tabla (si fue la opción (b)). Ninguna de las dos cosas la decide
> Claude Code.

> **Ambigüedad declarada adicional: A-17.** El catálogo de motivos se lee **desde el API**, nunca
> desde un enum hardcodeado en el cliente, para que una eventual migración a paramétrico no toque
> la UI.

### §5.1 Diseño

**Ruta:** `app/tasaciones/[id]/coordinar/page.tsx` (§2.13).

**Estructura:**

```
app/tasaciones/[id]/coordinar/page.tsx
components/tasador/coordinacion/
├── resumen-coordinacion.tsx      # Los 4 bloques colapsables
├── bloque-encabezado.tsx         # + copiar código al portapapeles
├── bloque-propiedad.tsx          # tabla de unidades con Rol SII POR UNIDAD
├── bloque-personas.tsx           # vendedor + contactos por prioridad
├── bloque-adjuntos.tsx           # enlaces a Dropbox
└── registro-resultado.tsx        # el registro en dos pasos
```

**Los cuatro bloques colapsables** (§2.3), alimentados por los mismos datos que hoy entrega el
correo de asignación (§1.6.3):

| Bloque | Contenido |
|---|---|
| **Encabezado** | Empresa (cliente institucional), fecha de solicitud y código `VP-AAAA-NNNN` **con acción de copiar al portapapeles**. |
| **Propiedad** | Marca Nuevo/Usado, dirección, comuna, valor estimado y **tabla de unidades** con N°, dirección, **Rol SII y superficie en m² por unidad** — un Rol SII por unidad, **no uno por solicitud** (es criterio de aceptación de RF-TAS-03). |
| **Personas** | Vendedor con su RUT; contactos de visita **ordenados por prioridad**, cada uno con número de orden, nombre, rol, teléfono y email; observaciones de la solicitud. |
| **Adjuntos** | Los de `TX_Adjuntos`, con nombre y tamaño, como enlace a Dropbox. |

**El registro del resultado es en dos pasos, no en dos botones sueltos.** El tasador **elige
primero un desenlace** y sólo entonces se le piden los datos de ese desenlace. Mientras no haya
elegido, el botón de envío está **deshabilitado con el rótulo "Selecciona un resultado"**.

**Desenlace 1 · "Contacto exitoso · Coordiné la fecha de visita"**
- Despliega **"Fecha planificada de visita"** (obligatoria) y **"Nota de la coordinación"**
  (opcional).
- Confirma con **"Confirmar coordinación"**.
- Persiste `estado_coordinacion = confirmada`, `fecha_visita_propuesta`, `nota`.

**Desenlace 2 · "No pude contactar · Devolver a la ejecutiva"**
- Despliega **"Motivo"** (obligatorio, catálogo cerrado leído del API · A-17) y **"Detalle"**
  (obligatorio, **mínimo 20 caracteres, con contador visible** que refleja el largo real en cada
  pulsación).
- Confirma con **"Devolver a ejecutiva"**, en **color destructivo**.
- Persiste `estado_coordinacion = rechazada`, `motivo`, `detalle`.

**Lo que la coordinación NO hace** (§2.3 · §2.11):
- **No cambia el estado backend.** La solicitud permanece `asignada` antes, durante y después. El
  único cambio de estado lo produce "Calcular Tasación" (§2.8).
- **No envía el correo desde la UI ni desde el Route Handler.** El handler escribe
  `email_enviado_status = pendiente`; la **Automation de Airtable** hace el resto (R3).

**Automation de correo (R3) — se construye en esta tanda.** Observa
`TX_CoordinacionVisita.email_enviado_status = pendiente`, elige la plantilla según
`estado_coordinacion` (`email_coordinacion_confirmada` / `email_coordinacion_rechazada`), envía
dentro del hilo `email_thread_id` de la solicitud (RN-52) y marca `enviado` + `email_enviado_at`.
Si falla, marca `error` sin reintento infinito. **Se deja creada pero apagada** mientras el flag de
CI-012 esté en `false`; encenderla es parte del cierre de CI-012, no de esta tanda.

**Regla D (feedback de progreso).** Ambos botones: `disabled` durante el envío, `<Loader2
data-icon="inline-start" className="animate-spin" />`, gerundio (**"Confirmando…"** /
**"Devolviendo…"**), inputs deshabilitados, reset en `finally`. Puntos suspensivos con `…`
(U+2026), no `...`.

**Mobile-first (R9).** Los cuatro bloques nacen **colapsados** salvo el primero. El registro de
resultado queda al final del scroll, con el botón de envío inline (§4.4 del Blueprint prohíbe
sticky bottom bar donde conviven portales `Select`, y aquí hay uno para el motivo).

### §5.2 Construcción — Pasos para Claude Code

1. **Verificar el estado de CI-012 antes de escribir una línea.** Si Sergio informa que cerró con
   la opción (b), **esta tanda no se ejecuta**: se salta a P5-TAS y se registra en el snapshot.
2. Consultar overrides de P4-TAS en el inventario.
3. Crear el flag `TASADOR_COORDINACION_ENABLED` (default `false`) y la guarda de ruta que devuelve
   404 cuando está apagado.
4. Crear los seis componentes de §5.1 y la página.
5. Cablear `POST /api/tasaciones/[id]/coordinacion` de P2-TAS con la Regla D completa.
6. Crear la Automation de correo en Airtable — **pausa-total**, confirmando con Sergio cada paso, y
   **dejarla apagada**.
7. Tests: el botón de envío está deshabilitado sin desenlace elegido; "Devolver a ejecutiva" está
   deshabilitado hasta los 20 caracteres y el contador refleja el largo real; el motivo persistido
   es uno de los cuatro del catálogo y ningún texto libre entra en ese campo.
8. Verificar a 375×812.
9. `pnpm tsc --noEmit && pnpm build && pnpm test`.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P4-TAS.md`, **encabezado con el estado
    bloqueado de la tanda**.

### §5.3 Criterios de aceptación

- [ ] La ruta `/tasaciones/[id]/coordinar` existe y devuelve **404 con el flag apagado**.
- [ ] Con el flag encendido en local, los cuatro bloques colapsables renderizan su contenido.
- [ ] El código `VP-AAAA-NNNN` se copia al portapapeles.
- [ ] La tabla de unidades muestra **un Rol SII por unidad**, no uno por solicitud.
- [ ] El botón de envío está deshabilitado con el rótulo **"Selecciona un resultado"** mientras no
      haya desenlace elegido.
- [ ] "Devolver a ejecutiva" está deshabilitado hasta que motivo esté elegido **y** el detalle
      alcance 20 caracteres; el contador refleja el largo real en cada pulsación.
- [ ] Cada acción crea **exactamente una** fila en `TX_CoordinacionVisita` con
      `estado_coordinacion` correcto, `autor_clerk_id`, `fecha_respuesta` en hora de servidor y
      `email_enviado_status = pendiente`.
- [ ] El estado de `TX_Solicitudes` es **idéntico** antes y después de coordinar.
- [ ] El catálogo de motivos se lee del API; `grep -rn "Teléfono no contesta" components/tasador/`
      **no devuelve nada** (A-17).
- [ ] La Automation existe y está **apagada**.
- [ ] **RF-TAS-04 y RF-TAS-05 no fueron construidos**, y el archivo de aprendizajes lo declara.
- [ ] Regla D aplicada en ambos botones, con `…` (U+2026) y reset en `finally`.
- [ ] `git status` no muestra cambios en `components/console/**` (R5 · confirma que RF-TAS-05 no se
      intentó).
- [ ] `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P4-TAS.md` creado, encabezado con **"TANDA
      BLOQUEADA · no liberada a producción · CI-012"**.

---

## §6 · P5-TAS — Pantalla 3 · Ingreso de fotos

> **⚙ Modo recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Sube binarios reales a Dropbox por el
> pipeline existente.

> **Ambigüedades declaradas: A-16 y P-5.** A-16 (mínimos fijos o dinámicos) se resuelve
> **construyendo el mínimo dinámico** que declara §2.6, aislado en una función para que revertirlo
> sea de una línea, y **declarándolo como asunción reversible** en el snapshot. P-5 (género del
> dominio `tipo_propiedad`) **impide dar RF-TAS-06 por implementado**: se construye la apertura del
> sheet con normalización server-side y se declara el paliativo.

### §6.1 Diseño

**Ruta:** `app/tasaciones/[id]/fotos/page.tsx` (§2.13).

**Cabecera.** Comuna · tipo y dirección de la propiedad. El header agrega el total consolidado en la
forma **"N fotos · N docs"**. Bajo la cabecera, la pantalla recuerda que cada foto se asocia a una
categoría y que los mínimos siguen lo declarado.

**Las ocho categorías del catálogo** (§2.6 · RF-TAS-14), cada una con contador "X/N", acción
**"Agregar a {categoría}"** y marca visible mientras el mínimo no se cumple:

| Categoría | Mínimo | Origen del mínimo |
|---|---|---|
| Ofertas / Comparables | 3 | **Fijo.** Coincide con el mínimo de comparables de RF-12. |
| Habitaciones | dinámico | Dormitorios declarados en la sección B (**A-16**) |
| Baños | dinámico | Baños declarados en la sección B (**A-16**) |
| Estacionamientos | dinámico | Estacionamientos declarados en la sección B (**A-16**) |
| Mapa de Ubicación | 1 | Fijo |
| Fachada / Exterior | 1 | Fijo |
| Cocina | 1 | Fijo |
| Living / Comedor | 1 | Fijo |

**Tratamiento de A-16.** Los mínimos dinámicos se resuelven en **una sola función**
`lib/tasador/minimos-fotos.ts`, que recibe lo declarado en la sección B y devuelve el mínimo por
categoría. Si el negocio decide que son fijos (2·2·1), se cambia esa función y nada más. Los
valores del diseño v4 se tratan como los de la propiedad de ejemplo, que es la lectura que la
propia ficha A-16 califica de más probable — pero **es una asunción, no una decisión**, y así se
registra.

**Categorías personalizadas.** El tasador puede crear una escribiendo un nombre y pulsando
**"Crear categoría"**. Aparece en el listado **inmediatamente** y admite fotos **sin exigir
mínimo**.

**"Cargar documentos de la propiedad" (RF-TAS-06).** Botón **sobre** el listado de categorías que
abre **el sheet documental de la ejecutiva reutilizado tal cual** (R7):
`components/console/documentos-adjuntos-sheet.tsx` + `document-checklist.tsx`. Hereda su checklist
de §1.5.1.1 (entidad emisora, vigencia por defecto, marca "No incluido", contador "N/N con
archivo"), su `FileUploadZone` y sus tres comportamientos de subida (alta, reutilización y
reemplazo con confirmación explícita), incluido el invariante de **único archivo por tipo**.
**La categoría "Documentos" del organizador se elimina** — no existe.

**El filtro por `tipo_propiedad` y el bloqueo P-5.** El sheet debe listar sólo documentos cuyo
`D_TipoDocumento.tipo_propiedad` coincida con el de la solicitud o sea "ambas". Con los dominios
actuales (**femenino** en `D_TipoDocumento`, **masculino** en
`TX_Solicitudes.tipo_propiedad_nuevo_usado`) **la comparación literal nunca coincide y el sheet
sale vacío**. Tratamiento:

- Se implementa la normalización en **`lib/tasador/tipo-propiedad.ts`** (creada en P1-TAS),
  server-side, con un comentario que declara que es un **paliativo de P-5** y que la corrección
  real es alinear el dominio en Airtable con sign-off de negocio.
- **RF-TAS-06 no se declara implementado** en el archivo de aprendizajes: se declara
  *"construido con paliativo · pendiente P-5"*.
- Los documentos con `cuándo = Reproceso`, `Cliente tipo 2` o `Depto con gas` **no** deben
  filtrarse incorrectamente: la columna `cuándo` **no se usa** como proxy de tipo de propiedad.

**Guardado.** Por Route Handler con **retry offline (cola local IndexedDB)** hacia
`{Unidad}/{seccion}/` — el subnivel de sección va **dentro** de la carpeta de la unidad, no en un
árbol `/captura/` paralelo (§8). Las tomas que no pertenecen a una unidad habitable (fachada, áreas
comunes) van a `edificacion` u `oo_cc`, a criterio del tasador en terreno. `TX_Adjuntos.seccion` se
escribe **aunque la sección ya aparezca en el path**: es lo que permite filtrar en Airtable sin
parsear el string.

**Pie:** "Volver" y **"Continuar con datos de la visita"**.

### §6.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P5-TAS en el inventario.
2. Verificar la firma de props de `FileUploadZone` y del sheet documental:
   ```bash
   sed -n '120,200p' components/console/file-upload-zone.tsx
   grep -rn "export function\|interface.*Props" components/console/documentos-adjuntos-sheet.tsx
   ```
3. **Si el sheet documental no admite ser abierto desde fuera de IF-02 sin editarlo**, aplicar
   R5-E: detener, registrar y pedir autorización a Sergio. **No duplicarlo.**
4. Crear `lib/tasador/minimos-fotos.ts` con la resolución dinámica (A-16) y su comentario de
   asunción.
5. Crear la pantalla, el grid de categorías, el contador por categoría y el total del header.
6. Cablear "Cargar documentos de la propiedad" al sheet reutilizado, con el filtro normalizado.
7. Implementar la cola offline con IndexedDB (**no `localStorage`** — §0.2).
8. Tests: el contador de categoría y el total del header se actualizan en la misma interacción en
   que se agrega o elimina una foto; una categoría personalizada aparece de inmediato y no exige
   mínimo; la normalización de género devuelve coincidencias no vacías.
9. Verificar a 375×812.
10. `pnpm tsc --noEmit && pnpm build && pnpm test`.
11. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P5-TAS.md`.

### §6.3 Criterios de aceptación

- [ ] Las **ocho** categorías del catálogo renderizan con su contador "X/N" y su acción
      "Agregar a {categoría}".
- [ ] **No existe** categoría "Documentos" en el organizador.
- [ ] El header muestra el total en la forma **"N fotos · N docs"** y se actualiza en la misma
      interacción en que se agrega o elimina una foto.
- [ ] Una categoría personalizada aparece **inmediatamente** tras crearse y **no exige mínimo**.
- [ ] "Cargar documentos de la propiedad" abre **el mismo componente** que abre IF-02. Verificable:
      `grep -rn "documentos-adjuntos-sheet" components/tasador/` encuentra un **import**, y **no
      existe** ninguna copia bajo `components/tasador/` (R7).
- [ ] El sheet abierto desde IF-03 **no sale vacío**: la normalización de P-5 produce coincidencias.
- [ ] Documentos con `cuándo = Reproceso`, `Cliente tipo 2` o `Depto con gas` **no** se filtran
      incorrectamente.
- [ ] Los mínimos dinámicos se resuelven **sólo** en `lib/tasador/minimos-fotos.ts`. Verificable:
      no hay literales `2`/`1` de mínimo en los componentes.
- [ ] `TX_Adjuntos.seccion` se escribe en cada alta, además del path.
- [ ] La cola offline usa **IndexedDB**; `grep -rn "localStorage" components/tasador/ lib/tasador/`
      no devuelve nada en esta tanda.
- [ ] El archivo de aprendizajes declara **RF-TAS-06 como "construido con paliativo · pendiente
      P-5"**, y A-16 como **asunción reversible**.
- [ ] Verificado a 375×812. `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes. `git status`
      limpio fuera del territorio IF-03.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P5-TAS.md` creado.

---

## §7 · P6-TAS — Pantalla 4 · Avance lectura de datos

> **⚙ Modo recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Dispara el pipeline de extracción
> existente; la UI es de polling.

> **Inconsistencia declarada: CI-013**, ya resuelta en la documentación. Esta tanda construye el
> comportamiento **bloqueante** que fija RF-TAS-15, no el permisivo de versiones anteriores.
> **Regla T-C (R8) es el criterio dominante de esta pantalla.**

### §7.1 Diseño

**Ruta:** `app/tasaciones/[id]/lectura/page.tsx` (§2.13).

**Stepper de tres pasos:** *Archivos listos → Procesando archivos → Datos listos*.

**Mientras procesa:** indicador de actividad, stepper con el paso en curso resaltado, tiempo
estimado y barra de avance. *(El "15 segundos" que muestra el diseño v4 es del prototipo, **no** un
compromiso normativo: el tiempo estimado se calcula o se omite, no se hardcodea como promesa.)*

**Al terminar:** el título cambia a **"Datos listos"** con el mensaje **"Los datos están listos
para completar el formulario"**, y el stepper queda íntegramente completo.

**Botón "Continuar con datos de la visita"** — **deshabilitado** mientras el stepper no llegue a
"Datos listos". No accionable **ni por teclado ni por doble toque**. A partir de ahí abre §2.8
(P7-TAS). Se habilita **sin recargar la pantalla**.

**Botón "Volver"** — regresa a Fotos en cualquier momento. **La extracción sigue en background y no
se cancela desde la UI.** Volver y regresar encuentra el progreso **donde estaba, no reiniciado**.

**Origen del progreso.** Polling sobre `GET /api/tasaciones/[id]/lectura`, que lee
`TX_Adjuntos.estado_extraccion` (`fld54epvDJ7YdJIYD`) del pipeline existente
(`SC-RF09-ExtraccionClaude`). **IF-03 no escribe un pipeline nuevo** (R7). Los datos extraídos se
pueblan según `D_TipoDocumentoAtributo` (§4 del spec).

**Regla T-C · el punto crítico de esta tanda.** Ningún texto menciona el medio técnico. Literales
canónicos: **"Leyendo datos de la visita"**, **"Procesando archivos de la visita…"**, **"Datos
listos"**. Prohibidos: "IA", "AI", "Claude", "modelo", "OCR", "extracción automática",
"inteligencia artificial". Esto **incluye** los estados de error: un fallo se comunica con
*"No pudimos leer los datos. Intenta nuevamente en unos segundos."*, nunca con el error del
proveedor.

### §7.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P6-TAS en el inventario.
2. Verificar el contrato del pipeline existente:
   ```bash
   grep -rn "estado_extraccion" lib/ app/api/ docs/schema-airtable.md | head -20
   ```
   Valores conocidos: `idle · extrayendo · listo · error · skipped · no_corresponde ·
   delegado_visador` (7 opciones, verificadas el 05-ago-2026).
3. Mapear los 7 valores del pipeline a los **3 pasos** del stepper, en una función explícita. Los
   estados terminales que no son `listo` (`error`, `delegado_visador`) tienen su propio tratamiento
   de UI y **no** dejan el botón habilitado.
4. Crear la pantalla con el stepper, la barra y los dos botones.
5. Implementar el polling con intervalo razonable y **cancelación al desmontar** (no al pulsar
   "Volver": el proceso backend sigue).
6. Persistir el avance de modo que "Volver" y regresar **no reinicie** el stepper.
7. Tests: el botón de continuar no es accionable por teclado ni por doble toque durante el proceso;
   se habilita al completarse el tercer paso sin recargar; volver y regresar recupera el progreso.
8. **Auditoría de Regla T-C:**
   ```bash
   grep -rniE "\bIA\b|\bAI\b|Claude|OCR|modelo|inteligencia artificial|autom[áa]tic" app/tasaciones components/tasador
   ```
   Debe devolver **cero** coincidencias en texto visible.
9. Verificar a 375×812.
10. `pnpm tsc --noEmit && pnpm build && pnpm test`.
11. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P6-TAS.md`.

### §7.3 Criterios de aceptación

- [ ] El stepper muestra tres pasos y avanza según el **estado backend**, no un temporizador local.
- [ ] Con la extracción en curso, "Continuar con datos de la visita" **no es accionable ni por
      teclado ni por doble toque**.
- [ ] Al completarse el tercer paso, el botón queda habilitado **sin recargar** la pantalla.
- [ ] "Volver" está disponible en todo momento y **no cancela** el proceso; regresar encuentra el
      progreso donde estaba.
- [ ] Los 7 valores de `estado_extraccion` están mapeados explícitamente; `error` y
      `delegado_visador` tienen tratamiento propio y no habilitan el botón.
- [ ] **Regla T-C:** la auditoría `grep` de §7.2 paso 8 devuelve **cero** coincidencias en texto
      visible. Los literales son los canónicos de §7.1.
- [ ] El error se comunica con el mensaje humano, sin exponer el error técnico.
- [ ] **No se escribió ningún pipeline de extracción nuevo**: la pantalla consume el existente (R7).
- [ ] Verificado a 375×812. `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes. `git status`
      limpio fuera del territorio IF-03.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P6-TAS.md` creado.

---

## §8 · P7-TAS — Pantalla 5 · Formulario de 8 secciones

> **⚙ Modo recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Es la tanda más grande del plan y el
> punto más frágil de IF-03: edición libre, pausa obligatoria antes de cualquier comando.

> **Ambigüedades e inconsistencias declaradas:** **A-13** (origen de los comparables) · **A-14**
> (dónde viven los defaults constructivos) · **CI-014** (ocho secciones, no siete) · **CI-015**
> (traza legacy del contador de intentos). **Regla T-B** es el criterio dominante de esta pantalla.

### §8.1 Diseño

**Ruta:** `app/tasaciones/[id]/page.tsx` — **la raíz del identificador ES el formulario de
captura**, no un detalle (§2.13 · CI-020). Las rutas `[id]/captura/` y `[id]/calculo/` **no se
crean**.

**Cabecera de la pantalla.** Código `VP-AAAA-NNNN`; **porcentaje de completitud** con su barra de
avance; bloque con comuna · tipo, dirección y cliente institucional; y acceso directo
**"N fotos ingresadas · Editar fotos"** que devuelve a §2.6 **sin perder lo capturado**.

Bajo la cabecera, una **alerta ámbar** enumera cuántos datos obligatorios faltan. El **pie** repite
el primero de ellos junto al recuento de los restantes, de modo que el tasador conoce su deuda
desde cualquier punto del scroll.

**Las ocho secciones colapsables (A–H)** — CI-014 fija que son **ocho**, no siete. La que se cae si
alguien cuenta siete es **G (Overrides)**, que es la que materializa la Capacidad C-7:

| Sección | Contenido | Notas |
|---|---|---|
| **A · Visita** | Fecha planificada de visita, **fecha real de visita** y observaciones del tasador | **Regla T-B.** Ver abajo. |
| **B · Datos de la propiedad** | Superficies, año, materialidad, calidad, estado de conservación y recintos | RN-45 (origen + adjunto de respaldo por superficie), RN-49 (estado heredado a recintos). Alimenta los mínimos dinámicos de P5-TAS. |
| **C · Cuadro de valoración** | Ítems con sus m² y su aporte a garantía, **con contador de ítems** | Persiste en `TX_ItemsCuadroValoracion`. |
| **D · Comparables** | Grilla con contador **"N/3"** | **A-13** · ver abajo. |
| **E · Niveles · Terminaciones · Comodidades** | Características constructivas, terminaciones por recinto y amenities | **A-14** · ver abajo. |
| **F · Documentos legales** | Antecedentes legales con lo extraído de los documentos cargados | Se puebla desde el pipeline de P6-TAS. |
| **G · Overrides (CU-007)** | Ajustes manuales del tasador sobre el resultado del motor, **con su motivo** | La sección que CI-014 protege. |
| **H · Rentabilidad (opcional)** | Cap rate y datos de renta | **No bloquea el cálculo** y **no incide en el porcentaje de obligatorios**. |

**Sección A y la Regla T-B — el punto que no se puede colapsar.**
- **Fecha planificada de visita**: pre-llenada desde la coordinación (§2.3) con badge
  **"Pre-llenado · editable"**.
- **Fecha real de visita**: la registra el tasador en terreno, **es obligatoria**, y es la que
  declara el informe. Las visitas se reprograman en terreno con frecuencia.
- Se persisten **por separado**. Una solicitud reprogramada conserva **dos fechas distintas**.
- La ausencia de fecha real **cuenta entre los obligatorios faltantes y bloquea "Calcular
  Tasación"**.

**Sección D · Comparables (§8.1 del ADR) — se construye editable (A-13).**
- Grilla **tabular densa**, no formulario acordeón. Una fila por comparable (3 a 10), columnas por
  atributo.
- **Header fijo y scroll horizontal en móvil**, con la primera columna (N° / dirección) **sticky**.
  El scroll horizontal vive **dentro de la grilla**; el body de la página nunca scrollea en
  horizontal (R9).
- Orden de columnas: N°, dirección, comuna, `sup_terreno_m2`, `sup_construccion_m2`, `precio_uf`,
  `uf_m2` (calculado), año, tipo de referencia (badge Oferta / CBR), `factor_sup`, `factor_edad`,
  `factor_distancia`.
- Campos condicionales: en **Oferta** se muestra `telefono_contacto`; en **CBR**, `foja` y `numero`.
- **Fila resumen final** con el promedio homogeneizado de `uf_m2_construccion` que alimenta el
  cálculo.
- Botón **"Agregar comparable"** y acción de eliminar por fila. Validación de **mínimo 3** antes de
  habilitar "Calcular Tasación" (**RF-12**).
- **A-13:** el diseño v4 anota que esta categoría *"debe ser cambiado su diseño, por sólo mostrar
  datos, antes leídos"*, pero **no dice de dónde salen**. Mientras no se responda, **la captura
  manual sigue vigente**. No se construye ninguna variante de sólo lectura.

**Valores por defecto (§8.4 del ADR · RF-TAS-08) — dos conjuntos con distinto destino:**

1. **Factores de homogeneización y coeficientes de la tabla de referencia** (`factor_sup`,
   `factor_edad`, `factor_distancia`). **SÍ se precargan**, desde la capa de configuración
   (`C_VariablesCliente` / tabla de factores) vía `GET /api/tasaciones/config/defaults`. Badge
   **"Pre-llenado · editable"**. **Ningún valor por defecto vive en el código de IF-03, ni siquiera
   de forma transitoria.**
2. **Defaults de características constructivas y terminaciones** (sección E: materialidad y estado
   de estructura soportante, divisiones interiores, entrepisos, cubierta, revestimientos, cierros,
   obras complementarias, construcción anexa; aire acondicionado, calefacción, clóset mural,
   muebles de cocina, sanitarios, grifería, puerta principal, ventanas; terminaciones por recinto).
   **NO se implementan (A-14):** ninguna tabla actual los alberga y RF-TAS-08 prohíbe
   hardcodearlos. La sección E se construye **con los campos capturables y sin precarga**. Cuando
   A-14 cierre, se conecta la fuente; el punto de conexión queda aislado en el mismo módulo que
   consume el conjunto 1.

**Autosave — la excepción declarada de §0.2.** `localStorage` cada 30 s, **exclusivamente** para el
borrador del formulario. Es lo que cumple la función de "sólo guardar" sin cambio de estado: **no
hay `AlertDialog` dual** de guardar/calcular. "Calcular Tasación" cumple la función de "guardar y
calcular".

**Validación de obligatorios (RF-TAS-18).**
- Todo dato que consume el motor se marca con **asterisco (\*)**.
- Al pulsar "Calcular Tasación" —**o cualquier acción que abra el informe**— con obligatorios
  pendientes: alerta **enumerada (destructiva)** que lista **exactamente** qué falta, nombrando los
  campos **por su rótulo visible, no por su nombre de base**, y el foco **salta al primero en orden
  de aparición**, **abriendo la sección que lo contiene** si estaba colapsada.
- El botón permanece deshabilitado mientras falte alguno.

**Bloqueo durante cálculo (RF-TAS-07).** "Calcular Tasación" queda **bloqueado** mientras el estado
backend sea `visitada` o `calculada`, con tooltip **"Cálculo en curso"**. La comprobación es por
**polling sobre el estado backend** (`GET /api/tasaciones/[id]/estado`), no por estado local. Un
doble tap **no** produce doble ejecución de AT03; volver a la Pantalla 5 durante el cálculo
encuentra el botón bloqueado.

**Limpieza de CI-015.** Si el código v0 llegó al repo, esta tanda **elimina**: el componente
`IntentosIndicator` y su render en la cabecera, la constante `MAX_INTENTOS`, las ramas muertas del
hook `use-estado-tasador` (`confirmar`, `rechazar`, `intentosRestantes`, `bloqueado`, estado
`PENDIENTE_VISADOR`) y el texto **"Prellenado por IA … (SC07)"** de `seccion-documentos.tsx`. Si no
llegó, **nunca se escriben**. El contador de tres re-visitas fue retirado por la decisión capital 1
de §2: mostrarlo sugiere un límite de reenvíos que no existe.

**Estructura propuesta:**

```
app/tasaciones/[id]/page.tsx
components/tasador/formulario/
├── index.tsx                     # Contenedor RHF + zod + autosave
├── cabecera-formulario.tsx       # % completitud + acceso a fotos
├── alerta-faltantes.tsx          # Alerta ámbar + pie con el primero
├── seccion-a-visita.tsx          # Regla T-B
├── seccion-b-propiedad.tsx
├── seccion-c-valoracion.tsx
├── seccion-d-comparables.tsx     # Grilla densa
├── seccion-e-terminaciones.tsx   # Sin precarga (A-14)
├── seccion-f-legales.tsx
├── seccion-g-overrides.tsx       # CU-007 — la que CI-014 protege
├── seccion-h-rentabilidad.tsx    # Opcional
└── validators.ts                 # zod por sección
```

### §8.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P7-TAS en el inventario.
2. Buscar y purgar los residuos de CI-015 si existen (ver comandos de §1.2 paso 3).
3. Crear el contenedor RHF + zod con el autosave de 30 s (`localStorage`, excepción declarada).
4. Crear las **ocho** secciones. **Contarlas explícitamente antes de cerrar la tanda.**
5. Sección A: los dos campos de fecha, con `fechaVisitaPlanificada` y `fechaRealVisita` como
   identificadores. **Prohibido `fechaVisita` a secas** (Regla T-B).
6. Sección D: grilla densa con header fijo, primera columna sticky y scroll horizontal **contenido**.
7. Precargar el conjunto 1 de defaults desde `GET /api/tasaciones/config/defaults`; **no** precargar
   el conjunto 2 (A-14) y dejar el punto de conexión aislado y comentado.
8. Implementar la validación enumerada con salto al primer faltante y apertura de su sección.
9. Cablear el polling de estado para el bloqueo de RF-TAS-07.
10. Tests: el porcentaje y el recuento se recalculan sin recargar; volver desde "Editar fotos"
    recupera lo escrito; la sección H no incide en el porcentaje; con <3 comparables el botón está
    deshabilitado con tooltip; sin fecha real el botón está deshabilitado; el listado de faltantes
    usa rótulos visibles; doble tap no dispara dos cálculos.
11. Verificar a 375×812, con atención a la grilla D.
12. `pnpm tsc --noEmit && pnpm build && pnpm test`.
13. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P7-TAS.md`.

### §8.3 Criterios de aceptación

- [ ] **Las secciones son OCHO (A–H).** La sección **G · Overrides (CU-007) existe** (CI-014).
- [ ] `app/tasaciones/[id]/page.tsx` **es** el formulario. **No existen** `[id]/captura/` ni
      `[id]/calculo/` (CI-020).
- [ ] **Regla T-B:** existen dos campos de fecha distintos y persistidos por separado. Una solicitud
      reprogramada conserva las dos con valores distintos.
      `grep -rn "fechaVisita\b" components/tasador/ lib/tasador/` **no devuelve nada**.
- [ ] Sin fecha real de visita, "Calcular Tasación" está deshabilitado y la fecha aparece entre los
      faltantes.
- [ ] El porcentaje de completitud y el recuento de faltantes se recalculan **en la misma
      interacción**, sin recargar.
- [ ] La **sección H no incide** en el porcentaje de obligatorios.
- [ ] Volver desde "Editar fotos" recupera el formulario **con lo escrito**, no en blanco.
- [ ] Con menos de 3 comparables el botón está deshabilitado **con tooltip explicativo** (RF-12).
- [ ] La alerta de faltantes nombra los campos **por su rótulo visible**; el foco aterriza en el
      primero en orden de aparición **con su sección desplegada**.
- [ ] Durante `visitada`/`calculada` el botón está bloqueado con tooltip "Cálculo en curso"; un
      doble tap **no** produce doble ejecución de AT03.
- [ ] **A-14 respetado:** la sección E **no** precarga defaults constructivos y **no** los
      hardcodea. Verificable: no hay literales de materialidad/terminación en
      `components/tasador/formulario/`.
- [ ] **A-13 respetado:** la sección D es **editable** con captura manual; no existe variante de
      sólo lectura.
- [ ] **CI-015 cerrado:** `grep -rn "IntentosIndicator\|MAX_INTENTOS\|intentosRestantes\|
      PENDIENTE_VISADOR"` sobre todo el repo devuelve **cero**; la auditoría de Regla T-C también.
- [ ] `localStorage` aparece **sólo** en el autosave del formulario, y en ningún otro punto de
      IF-03.
- [ ] La grilla D scrollea horizontalmente **dentro de sí misma**; el body no scrollea en
      horizontal a 375 px.
- [ ] `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes. `git status` limpio fuera del
      territorio IF-03.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P7-TAS.md` creado.

---

## §9 · P8-TAS — Pantalla 6 · Avance cálculo

> **⚙ Modo recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Dispara la transición `asignada → visitada` y
> con ella AT03 (DAG de ~15 cálculos). **No se puede deshacer desde la UI.**

> **Regla T-C (R8) vuelve a ser criterio dominante.** Y una precisión de negocio que esta pantalla
> no puede desmentir: **el motor es AT03, un DAG determinista.** Llamarlo "IA" además de violar la
> política sería falso.

### §9.1 Diseño

**Ruta:** `app/tasaciones/[id]/estado/page.tsx` — **no** `[id]/calculo/` (§2.13 · CI-020).

**Stepper de tres pasos:** *Datos listos → Calculando tasación → Informe listo*.

**Mientras calcula:**
- **Skeletons con animación `pulse`** durante `EN_CALCULO` (§2.5.4 del spec).
- El stepper **avanza siguiendo el estado backend, no un temporizador local**: una **recarga**
  durante el cálculo recupera el **paso real**.

**Al completarse:** el título pasa a **"Informe listo"** con el mensaje **"Tu informe está listo
para revisión"** y el stepper queda íntegramente completo.

**Exactamente dos acciones:**
- **"Continuar a vista previa"** — acción **primaria**. **Deshabilitada** hasta que el estado
  transite a `INFORME_DISPONIBLE` (`calculada` o `pdf_listo`). No accionable antes.
- **"Volver atrás"** — devuelve a la Pantalla 5 **en modo consulta**. **AT03 sigue corriendo y no
  se cancela desde la UI.**

**El botón "Calcular Tasación" de la Pantalla 5 queda bloqueado durante toda esta pantalla**
(RF-TAS-07).

**Mapeo de estados** (§2.11), implementado en una función explícita:

| UI local | Backend |
|---|---|
| `BORRADOR` | `asignada` |
| Click "Calcular Tasación" | Transición a `visitada` (dispara SC06 → SC08 → AT03) |
| `EN_CALCULO` | Backend transita `visitada → calculada` |
| `INFORME_DISPONIBLE` | `calculada` o `pdf_listo` |

**Ruta de excepción.** AT04 valida rangos de valor contra `M_Comunas` y puede marcar
`flag_revision` y llevar a `requiere_atencion`. Si el polling encuentra ese estado, la pantalla lo
comunica con un mensaje humano y **no** deja "Continuar a vista previa" habilitado. No se inventa
una pantalla nueva para ese caso: mensaje en la misma, y la solicitud sigue en la cola.

**Regla T-C.** Literales canónicos: **"Calculando tasación"**, **"Informe listo"**, **"Tu informe
está listo para revisión"**. Prohibido nombrar AT03, SC08, "el motor", "IA" o cualquier medio
técnico en texto visible.

### §9.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P8-TAS en el inventario.
2. Crear la pantalla con el stepper, los skeletons `pulse` y las dos acciones.
3. Implementar el polling sobre `GET /api/tasaciones/[id]/estado`, derivando el paso del stepper
   **del estado backend** y no de un contador local.
4. Manejar el estado de excepción `requiere_atencion` con mensaje humano.
5. Cablear "Volver atrás" al formulario **en modo consulta** (campos de sólo lectura), sin
   cancelar el proceso.
6. Tests: una **recarga** durante el cálculo recupera el paso real; "Continuar a vista previa" no es
   accionable antes de `INFORME_DISPONIBLE`; "Volver atrás" no cancela nada.
7. Auditoría de Regla T-C con el `grep` de §7.2 paso 8.
8. Verificar a 375×812.
9. `pnpm tsc --noEmit && pnpm build && pnpm test`.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P8-TAS.md`.

### §9.3 Criterios de aceptación

- [ ] La ruta es `app/tasaciones/[id]/estado/` (**no** `[id]/calculo/`).
- [ ] El stepper avanza **siguiendo el estado backend**: una recarga durante el cálculo recupera el
      paso real, no reinicia.
- [ ] Hay **exactamente dos** acciones. "Continuar a vista previa" no es accionable antes de
      `INFORME_DISPONIBLE`.
- [ ] "Volver atrás" devuelve al formulario **en modo consulta** y **no cancela** el cálculo.
- [ ] Durante toda esta pantalla, "Calcular Tasación" de la Pantalla 5 está bloqueado (RF-TAS-07).
- [ ] Los skeletons usan animación `pulse` durante `EN_CALCULO`.
- [ ] `requiere_atencion` se comunica con mensaje humano y **no** habilita el avance.
- [ ] **Regla T-C:** la auditoría `grep` devuelve **cero** coincidencias. No se nombra AT03, SC08
      ni "el motor" en texto visible.
- [ ] Verificado a 375×812. `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes. `git status`
      limpio fuera del territorio IF-03.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P8-TAS.md` creado.

---

## §10 · P9-TAS — Pantalla 7 · Preview del informe

> **⚙ Modo recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Envía el informe al visador — **irreversible
> desde IF-03**. Además, es la tanda donde se materializa la **excepción R5-E**.

> **Ambigüedad declarada: A-15** (si el rechazo emite aviso al visador). **Inconsistencias
> declaradas: CI-016** (sin `window.print()` de respaldo) y **CI-017** (diálogo previo + acuse, sin
> temporizador), ambas ya resueltas en la documentación.

### §10.1 Diseño

**Ruta:** `app/tasaciones/[id]/informe/page.tsx` (§2.13).

**Cabecera fija:** rótulo **"INFORME DE TASACIÓN"** con el código `VP-AAAA-NNNN` y la **versión del
informe** (`v1`, `v2`, …), que debe coincidir con la del registro vigente de
`TX_DocumentosGenerados` para esa solicitud. Mientras el estado local sea `EN_CALCULO`, la vista
muestra **skeletons**; al transitar a `INFORME_DISPONIBLE`, aparecen los datos definitivos.

**Los ocho bloques canónicos, numerados y rotulados** (§8.2 del ADR · RF-TAS-20). El orden y la
numeración **son parte del requisito**: el tasador debe poder referirse a un bloque por su número
al hablar con el visador.

1. **Cabecera** — marca Nuevo/Usado, código, cliente institucional, dirección, comuna y fecha de
   visita.
2. **Valor de tasación destacado** — monto en UF en tipografía grande, con **cap rate** justo
   debajo. Usa el **override manual del tasador si existe**; si no, el valor de referencia del
   motor.
3. **Antecedentes de la propiedad** — superficies (terreno, construida, primer piso), año,
   materialidad, calidad, estado de conservación, dormitorios, baños y estacionamientos.
4. **Datos SII / avalúo** — códigos SII, avalúo fiscal por unidad y total, contribución.
5. **Cuadro de valoración** — ítems con sus m² y su aporte a garantía.
6. **Comparables** — la grilla de §2.8 y el promedio homogeneizado UF/m².
7. **Registro fotográfico** — total de fotografías y **conteo real por categoría**.
8. **Observaciones y overrides** — ajustes manuales con su motivo; **con estado vacío explícito**
   cuando no hay ninguno.

Se permite colapsar bloques densos en acordeones **siempre que se preserven el orden de lectura y
la numeración visible**. Los bloques sin contenido **muestran estado vacío explícito**, no se
omiten.

**Footer de cuatro acciones fijas**, visibles desde cualquier punto del scroll:

**1 · Descargar PDF (RF-TAS-21 · CI-016).** Genera el informe con **Carbone**, usando la plantilla
que el motor de reglas asignó a esa solicitud (§7). **No hay impresión alternativa.** Si el PDF
todavía no está depositado, la acción **informa la espera**; **no** produce un documento sin la
plantilla del cliente. **Prohibido `window.print()`** en cualquier forma: un documento con el
maquetado del navegador puede salir de la organización pareciendo un informe de tasación.

**2 · Ver expediente (RF-TAS-10) — ⚠ aquí vive la excepción R5-E.** Modal/sheet lateral, **no ruta
nueva**. Se titula **"Expediente · VP-AAAA-NNNN"**, declara el número de archivos y su condición de
**sólo lectura**, y lista los adjuntos de `TX_Adjuntos` vinculados con nombre, tamaño y acción de
descarga desde Dropbox. **No permite alta, reemplazo ni baja.** Cerrarlo devuelve el preview **en la
misma posición de scroll**.

> **Procedimiento obligatorio de R5-E.** El visor de sólo lectura que RF-TAS-10 manda reutilizar
> **no existe hoy como componente exportado**: la pestaña Adjuntos de IF-02 vive dentro de
> `components/console/solicitud-detail.tsx` (funciones privadas) y
> `documentos-adjuntos-sheet.tsx` es de lectura **y escritura**. Orden de intentos:
> 1. **Importar** `documentos-adjuntos-sheet.tsx` y desactivar sus acciones por prop, **si su API
>    ya lo permite**. Preferente: cero cambios en IF-02.
> 2. Si no lo permite: **detener la tanda**, registrar el hallazgo en `snapshot-P9-TAS.md` y
>    **pedir a Sergio autorización explícita** para extraer el visor a un módulo compartido
>    (`components/shared/expediente-viewer.tsx`), lo que **modifica IF-02** y por tanto viola R5
>    sin su permiso.
> 3. **Prohibido**: duplicar el visor bajo `components/tasador/` (viola R7) o editar
>    `components/console/**` por iniciativa propia (viola R5).

**3 · Rechazar (rojo) — RF-TAS-09 · A-15.** Semántica: *"no envío este informe, sigo en
borrador"*. Abre el diálogo **"Rechazar borrador"**, que explica que el informe quedará como
borrador hasta resolverlo con el visador y que la observación queda registrada, y pide bajo el
rótulo **"¿Qué necesitas resolver?"** un texto de **al menos 20 caracteres con contador visible**.
Se confirma con **"Guardar observación"** o se descarta con **"Cancelar"**. Al confirmar:
(a) persiste en `TX_Solicitudes.observacion_rechazo_tasador`; (b) muestra el mensaje que dirige al
tasador a comunicarse con el visador **por el canal habitual**; (c) **no cambia el estado**.

> **A-15 · qué NO se construye.** El diseño v4 dice que al tasador *"se le hará saber al
> visador"*; §2.10 y RF-TAS-09 dicen que **no** hay notificación in-app. Las dos no pueden ser
> ciertas. **Se implementa lo que dice el RF**: ningún aviso, ninguna notificación, ningún evento
> adicional. Y **el texto del diálogo no promete un aviso que el sistema no hace** — ése es el modo
> de fallo peor de los dos, porque deja al tasador esperando una gestión que nadie ejecuta.

**4 · Confirmar (verde) — RF-TAS-22 · CI-017.** Abre el diálogo **"¿Enviar este informe al
visador?"**, que advierte que una vez enviado el informe pasará a revisión del visador y **dejará de
aparecer en la lista de tasaciones**, con las acciones **"Cancelar"** y **"Enviar informe"**. Al
confirmar: la solicitud transita a `visitada` (y luego automáticamente a `calculada → pdf_listo`),
sale del filtro `{asignada, visitada, calculada}` al llegar a `pdf_listo`, y la app muestra una
**pantalla de acuse** — **"Informe enviado"**, con el mensaje de que el visador lo revisará y ya no
aparecerá en su lista — cuya **única acción es "Volver al inicio"**.

**No hay redirección automática.** **Prohibido cualquier `setTimeout` de navegación**: el acuse
espera al tasador, porque una redirección por temporizador roba el foco mientras lee (CI-017).

**Idempotencia.** Un doble toque en "Enviar informe" produce **exactamente una** transición. Regla D
completa en ambos diálogos: `disabled`, spinner, gerundio (**"Enviando…"** / **"Guardando…"**),
reset en `finally`.

### §10.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P9-TAS en el inventario.
2. **Resolver R5-E antes de construir "Ver expediente"**, siguiendo el orden de intentos de §10.1.
   Si hay que detenerse, se detiene: es una compuerta, no una sugerencia.
3. Crear el preview con los ocho bloques numerados, con skeletons en `EN_CALCULO`.
4. Implementar el footer de cuatro acciones.
5. "Descargar PDF": consumir el PDF de Carbone; si no está, informar la espera. **Verificar que no
   existe ninguna llamada a `window.print()`.**
6. Diálogo "Rechazar borrador" con contador de 20 caracteres, sin prometer aviso al visador.
7. Diálogo "¿Enviar este informe al visador?" + pantalla de acuse con "Volver al inicio".
8. Tests: los ocho bloques aparecen siempre en el mismo orden y número; un informe sin
   observaciones muestra el bloque 8 con su estado vacío; "Guardar observación" está deshabilitado
   hasta los 20 caracteres; el estado backend es idéntico antes y después del rechazo; cancelar el
   diálogo de envío deja la solicitud sin cambio; confirmarlo dos veces produce **una** transición;
   el acuse permanece hasta que se pulse "Volver al inicio"; cerrar el expediente devuelve el
   preview en la misma posición de scroll.
9. Verificar a 375×812.
10. `pnpm tsc --noEmit && pnpm build && pnpm test`.
11. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P9-TAS.md`, declarando **cómo se resolvió
    R5-E**.

### §10.3 Criterios de aceptación

- [ ] Los **ocho** bloques aparecen siempre en el mismo orden y con el mismo número, colapsados o no.
- [ ] Un informe sin observaciones ni overrides muestra el **bloque 8 con su texto de estado vacío**.
- [ ] La versión de la cabecera coincide con la del registro vigente de `TX_DocumentosGenerados`.
- [ ] **CI-016:** `grep -rn "window.print\|@media print" app/tasaciones components/tasador` devuelve
      **cero**. "Descargar PDF" siempre proviene de Carbone; si no está, informa la espera.
- [ ] **"Ver expediente"** abre un modal/sheet, **no una ruta**, sin librerías nuevas, **sin
      ninguna acción de alta, reemplazo ni baja**. Cerrarlo devuelve el preview en la misma posición
      de scroll.
- [ ] **R5-E documentada:** el archivo de aprendizajes declara cuál de los tres caminos se tomó. Si
      fue el 2, consta la autorización de Sergio.
- [ ] **A-15:** el diálogo de rechazo **no promete** aviso al visador; no se emite notificación ni
      evento. `TX_Solicitudes.estado` es idéntico antes y después.
- [ ] "Guardar observación" está deshabilitado hasta los 20 caracteres y el contador refleja el
      largo real.
- [ ] **CI-017:** existe el diálogo previo de envío y la pantalla de acuse con "Volver al inicio".
      `grep -rn "setTimeout" components/tasador/` **no devuelve ninguna redirección**.
- [ ] Un doble toque en "Enviar informe" produce **exactamente una** transición.
- [ ] Tras el acuse, la solicitud ya **no figura** en la cola del tasador.
- [ ] Regla D aplicada en ambos diálogos, con `…` (U+2026) y reset en `finally`.
- [ ] `git status` no muestra cambios en `components/console/**` **salvo** que R5-E se haya
      resuelto por el camino 2 **con autorización registrada**.
- [ ] Verificado a 375×812. `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P9-TAS.md` creado.

---

## §11 · P10-TAS — Reutilización cruzada e integración con SLA

> **⚙ Modo recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Tanda de verificación y ajuste fino;
> toca poco código y no crea pantallas.

> **Inconsistencias declaradas: CI-021** (el SLA del tasador se lee del plazo por etapa, no del
> agregado) y **CI-005** (el reloj del SLA arranca donde no debe). **CI-021 no se puede cerrar sin
> CI-005**: cerrarla sola daría al tasador una cifra correcta en su forma y errada en su origen.

### §11.1 Diseño

**Objetivo.** Verificar —y ajustar donde no cuadre— que IF-03 **consume** lo que IF-02 ya construyó,
en vez de haberlo reimplementado en paralelo. Es la tanda que convierte R7 de intención en hecho
verificado.

**Verificación 1 · Reutilización efectiva (R7).** Auditar, componente por componente del catálogo
de §0.2-bis, que IF-03 lo **importa** y que **no existe una copia** bajo `components/tasador/` ni
bajo `lib/tasador/`:

```bash
grep -rn "from \"@/components/console/\|from '@/components/console/" components/tasador/ app/tasaciones/
grep -rn "from \"@/lib/sla-etapas\|from \"@/lib/airtable-client\|from \"@/lib/historial" app/api/tasaciones/ lib/tasador/
```

Y la contraprueba, que es la que de verdad importa:

```bash
# Ninguno de estos nombres debe existir DEFINIDO bajo territorio IF-03
grep -rn "function SLABadge\|function StateBadge\|function FileUploadZone" components/tasador/ lib/tasador/
```

**Verificación 2 · SLA por etapa (RF-53 · RF-TAS-02 · CI-021).** El badge de la card debe mostrar
**el mismo color y las mismas horas** que `lib/sla-etapas.ts` calcula para la etapa vigente de esa
solicitud, sobre la ventana hábil de §5.2.1 (lunes a viernes, 9:00–18:00, excluidos feriados). Las
etapas del tasador son:

| Etapa | Nombre | Ideal | Máximo |
|---|---|---|---|
| **2** | Coordinación de visita | 4 h | 6 h |
| **5** | Visita y envío de informe | 24 h | 48 h |

**El caso de prueba que hace visible el bug que CI-021 describe:** una solicitud cuya etapa vigente
vence el **viernes a las 17:00**. La derivación antigua (plazo agregado en días convertido a horas)
diría "12h restantes"; el reloj por etapa dice **2 h hábiles**, porque la ventana cierra a las 18:00
y no reabre hasta el lunes. **Si la card muestra 12h, la integración está mal.** Este caso es
obligatorio en el test de la tanda.

**Verificación 3 · Los eventos del tasador llegan al Historial de IF-02.** Confirmar que lo que
IF-03 escribe aparece en la pestaña Historial de la Ejecutiva **con latencia menor a un minuto**.
Alcance honesto de lo que se puede verificar hoy:

- ✅ **`A_Cambios`** — lo escribe IF-03 (§0.4 nota 2). Verificable: una mutación de IF-03 aparece en
  la pestaña Historial de IF-02 en menos de un minuto. El filtro es por `tabla_origen` +
  `registro_id`, **no** por Link (CI-011).
- ✅ **`A_Eventos`** de las automatizaciones backend (SC06/SC08/SC09) disparadas por la transición
  de P8-TAS.
- ⛔ **Los eventos de coordinación NO se verifican**: dependen de RF-TAS-05, que **no se
  construyó** (CI-012). §1.3.3 de la spec ya declara explícitamente que quedan fuera *por falta de
  origen de datos*, para que la omisión no se lea como bug. **Esta tanda no intenta cerrarlo ni
  toca `components/console/**` para lograrlo** (R5).

**Verificación 4 · Frontera R5 sobre todo el trabajo acumulado.** `git diff --stat` desde el inicio
de la rama, confirmando que **ningún** archivo de IF-02 o IF-04 fue modificado (salvo la excepción
R5-E de P9-TAS, si se autorizó).

**Ajustes permitidos en esta tanda.** Sólo bajo territorio IF-03, y sólo para corregir lo que las
cuatro verificaciones encuentren mal: sustituir una reimplementación por el import correcto,
corregir el consumo del SLA, arreglar el filtro de `A_Cambios`. **No se construye funcionalidad
nueva.**

### §11.2 Construcción — Pasos para Claude Code

1. Ejecutar las verificaciones 1 y 4 (son puro `grep` / `git`) y **listar hallazgos antes de tocar
   nada**.
2. Escribir el test del caso "viernes 17:00" contra `lib/sla-etapas.ts` y contra lo que devuelve
   `GET /api/tasaciones`. Comparar ambos números.
3. Corregir el consumo del SLA si divergen. **La corrección va siempre del lado de IF-03**: si el
   motor está mal, es deuda de IF-02 y se reporta, no se parchea (R6).
4. Probar end-to-end una mutación de IF-03 y verificar su aparición en la pestaña Historial de
   IF-02, cronometrando la latencia.
5. Corregir los imports que la verificación 1 encuentre duplicados.
6. Escribir en el archivo de aprendizajes el **alcance honesto**: qué quedó verificado, qué quedó
   fuera y por qué (los eventos de coordinación, por CI-012).
7. `pnpm tsc --noEmit && pnpm build && pnpm test`.
8. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P10-TAS.md`.

### §11.3 Criterios de aceptación

- [ ] **R7 verificado:** ningún componente del catálogo de §0.2-bis está **definido** bajo
      `components/tasador/` o `lib/tasador/`; todos se importan.
- [ ] **CI-021 verificado:** el color y las horas de la card coinciden con lo que `lib/sla-etapas.ts`
      calcula para la etapa vigente, sobre la ventana hábil y excluyendo feriados.
- [ ] **El caso "viernes 17:00" pasa**: la card muestra las horas **hábiles**, no la conversión del
      plazo agregado.
- [ ] IF-03 **no define umbrales propios**: `grep` de literales `4|6|24|48` en
      `app/api/tasaciones/` y `components/tasador/` no encuentra umbrales fuera de tests.
- [ ] Una mutación de IF-03 aparece en la pestaña **Historial** de IF-02 en **menos de un minuto**.
- [ ] El filtro de `A_Cambios` es por `tabla_origen` + `registro_id` (CI-011), no por Link.
- [ ] **R5 verificado sobre todo el acumulado:** `git diff --stat` contra el punto de partida de la
      rama **no** muestra archivos de IF-02 ni IF-04, salvo la excepción R5-E autorizada.
- [ ] El archivo de aprendizajes declara explícitamente que **los eventos de coordinación quedaron
      fuera por CI-012**, y que eso **no es un bug**.
- [ ] No se construyó funcionalidad nueva en esta tanda.
- [ ] `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P10-TAS.md` creado.

---

## §12 · P11-TAS — Autenticación y blindaje server-side

> **⚙ Modo recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Un error aquí abre acceso a solicitudes
> ajenas. Antes de cada edición y cada comando, mostrar qué se va a hacer.

> **Ésta es la tanda que cierra R2.** Toda la construcción anterior corrió sobre `mockUserTasador`
> precisamente para que este cambio fuera **de una sola función**, y no una cacería por todo el
> código.

### §12.1 Diseño

**Objetivo.** Sustituir el mock por Clerk, cerrar **RF-09** con validación server-side real, y
**retirar todo acceso mock** del código y del despliegue.

**RF-09 · el requisito literal.** *"El tasador inicia sesión con Clerk (Google o email) y accede
únicamente a las solicitudes asignadas a su `clerk_user_id` en `TX_Solicitudes.tasador`. Cualquier
intento de acceso a otra solicitud devuelve 403."* Criterio de aceptación: **pruebas con dos
tasadores distintos** confirman que ninguno puede listar ni abrir solicitudes ajenas. **La
validación se hace server-side en la API Route, no en el cliente.**

**Las cuatro piezas del cambio:**

**1 · Ruta protegida.** `app/tasaciones/**` pasa a estar bajo protección de Clerk, con el mismo
patrón que `app/(ejecutiva)/layout.tsx` usa para la consola. Si la estructura de route groups lo
exige, se crea `app/(tasador)/` **sin tocar** `app/(ejecutiva)/`.

**2 · Resolución de identidad real.** `lib/tasador/mock-user.ts` se **reemplaza** por
`lib/tasador/usuario.ts`, que obtiene el `clerk_user_id` de la sesión server-side y lo resuelve
contra `M_Tasadores`. **La firma de la función se conserva** (`getUsuarioTasador()`), de modo que
ningún consumidor cambie. El archivo del mock **se borra**, no se deja "por si acaso": un mock
vivo en producción es exactamente el agujero que esta tanda cierra.

**3 · El guard de autorización pasa a ser real.** `lib/tasador/auth-guard.ts` (escrito en P2-TAS
con la capa ya funcionando) deja de comparar contra el mock. La comparación es
`clerk_user_id === TX_Solicitudes.tasador`, resuelta **server-side**. El 403 **no filtra
información** sobre la solicitud ajena: mismo cuerpo de respuesta que un 404, sin códigos,
direcciones ni nombres.

**4 · Verificación de superficie.** Ninguna decisión de autorización queda en el cliente. Un
componente puede **ocultar** un botón por conveniencia visual, pero el servidor **siempre**
revalida. La prueba real es la que se hace con `curl` contra la API, no la que se hace en el
navegador.

**El plan de pruebas con dos tasadores (obligatorio).** Se necesitan **dos** registros reales de
`M_Tasadores` con sus respectivos `clerk_user_id`, y al menos **una solicitud asignada a cada
uno**. Matriz mínima:

| # | Actor | Acción | Esperado |
|---|---|---|---|
| 1 | Tasador A | `GET /api/tasaciones` | Sólo sus solicitudes. Ninguna de B. |
| 2 | Tasador A | `GET /api/tasaciones/{id-de-B}` | **403**, sin filtrar datos. |
| 3 | Tasador A | `PATCH /api/tasaciones/{id-de-B}/datos` | **403**, y **nada escrito** en Airtable. |
| 4 | Tasador A | `POST /api/tasaciones/{id-de-B}/calcular` | **403**, y estado de B **sin cambio**. |
| 5 | Sin sesión | Cualquier ruta de `/api/tasaciones/**` | **401/redirect**, nunca 200. |
| 6 | Tasador B | Repetir 1–4 en espejo | Simétrico. |

Los casos 3 y 4 son los que importan de verdad: un 403 que **igual escribió** es peor que no tener
guard, porque da una falsa sensación de blindaje. **Se verifica en Airtable que no hubo escritura**,
no sólo que el código HTTP fue 403.

**Variables de entorno** (ya presentes por IF-02, se verifican): `CLERK_PUBLISHABLE_KEY`,
`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`.

### §12.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P11-TAS en el inventario.
2. Verificar el patrón de protección de IF-02 **leyendo, sin editar**:
   ```bash
   grep -rn "auth\|clerkMiddleware\|currentUser" "app/(ejecutiva)/layout.tsx" middleware.ts 2>/dev/null
   grep -rn "^export" lib/clerk-response.ts
   ```
3. Crear `lib/tasador/usuario.ts` con `getUsuarioTasador()` real, conservando la firma.
4. **Borrar** `lib/tasador/mock-user.ts` y corregir todos sus imports.
5. Proteger la ruta `app/tasaciones/**`.
6. Endurecer `lib/tasador/auth-guard.ts` y verificar que el 403 no filtra información.
7. Preparar los datos de prueba: dos tasadores con `clerk_user_id`, una solicitud cada uno.
8. Ejecutar la matriz de 6 casos. **Verificar en Airtable** que los casos 3 y 4 no escribieron nada.
9. Barrido final de accesos mock:
   ```bash
   grep -rniE "mock|fixture|fake|dummy" app/tasaciones app/api/tasaciones components/tasador lib/tasador
   ```
   Cero coincidencias fuera de archivos `.test.ts`.
10. `pnpm tsc --noEmit && pnpm build && pnpm test`.
11. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P11-TAS.md` con la **matriz de pruebas y su
    resultado real**, no un resumen.

### §12.3 Criterios de aceptación

- [ ] `lib/tasador/mock-user.ts` **no existe**. `grep -rn "mockUserTasador"` sobre todo el repo
      devuelve **cero**.
- [ ] `app/tasaciones/**` está protegida por Clerk; sin sesión, ninguna ruta devuelve 200.
- [ ] **Los 6 casos de la matriz pasan**, con evidencia registrada (código HTTP + verificación en
      Airtable para los casos 3 y 4).
- [ ] Los casos 3 y 4 **no escribieron nada** en Airtable. Verificado en la base, no inferido del
      código de respuesta.
- [ ] El 403 **no filtra** código, dirección ni nombre de la solicitud ajena.
- [ ] La validación es **server-side**: existe al menos una prueba con `curl` (sin navegador) que
      confirma el 403.
- [ ] El barrido de accesos mock devuelve **cero** fuera de tests.
- [ ] La firma de `getUsuarioTasador()` se conservó: **ningún consumidor** de P2-TAS a P10-TAS tuvo
      que cambiar más allá del path del import.
- [ ] `git status` limpio fuera del territorio IF-03 (salvo la excepción R5-E ya autorizada).
- [ ] `pnpm tsc --noEmit`, `pnpm build`, `pnpm test` verdes.
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P11-TAS.md` creado con la matriz completa.

---

## §13 · P12-TAS — Deploy a Railway

> **⚙ Modo recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Deploy a producción **con IF-02 e IF-04 vivos
> en el mismo despliegue**. Cualquier error se propaga a usuarios que no son el tasador.

> **R12 sigue vigente hasta el final:** Claude Code **no ejecuta `git push`**. El deploy lo dispara
> el push de Sergio desde GitHub Desktop. Esta tanda prepara, verifica y acompaña; no empuja.

### §13.1 Diseño

**Objetivo.** Poner IF-03 en producción sin romper IF-02 ni IF-04, y confirmarlo con evidencia.

**Pre-deploy · checklist de variables de entorno.** Verificar en Railway que existen y son
correctas. IF-03 **no agrega ninguna nueva de Make**, coherente con R3:

| Variable | Estado esperado |
|---|---|
| `AIRTABLE_TOKEN` · `AIRTABLE_BASE_ID` | Ya existen (IF-02). IF-03 las usa para sus escrituras directas. |
| `CLERK_PUBLISHABLE_KEY` · `CLERK_SECRET_KEY` · `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Ya existen. Verificadas en P11-TAS. |
| `TASADOR_COORDINACION_ENABLED` | **`false`** — el flag de CI-012 se despliega **apagado** (R10). |
| `MAKE_WEBHOOK_URL_*` · `MAKE_HMAC_SECRET` | Sin cambios. **IF-03 no las usa.** |

**Smoke tests end-to-end con un tasador real.** Con una solicitud real asignada, recorrer el
camino completo y verificar cada punto **en Airtable**, no sólo en pantalla:

| # | Paso | Verificación |
|---|---|---|
| 1 | Login como tasador | Sólo ve sus solicitudes (RF-09). |
| 2 | Cola (`/tasaciones`) | Tres chips, "Hoy" deshabilitado; badge de SLA con horas hábiles; un solo botón por card. |
| 3 | Coordinar visita | **Ruta devuelve 404** (flag apagado · CI-012). Es el resultado **correcto**. |
| 4 | Fotos | Subida real a Dropbox; `TX_Adjuntos` con `seccion`; sheet documental no sale vacío. |
| 5 | Lectura de datos | Stepper avanza con el pipeline real; "Continuar" bloqueado hasta el final. |
| 6 | Formulario | Ocho secciones; autosave; alerta de faltantes; sin fecha real no deja calcular. |
| 7 | Calcular | Transición `asignada → visitada`; AT03 corre; doble tap no duplica. |
| 8 | Avance cálculo | Stepper por estado backend; recarga recupera el paso real. |
| 9 | Preview | Ocho bloques numerados; "Ver expediente" de sólo lectura; PDF desde Carbone. |
| 10 | Rechazar | Observación persistida; **estado sin cambio**; sin aviso al visador (A-15). |
| 11 | Confirmar | Una transición; acuse con "Volver al inicio"; la solicitud sale de la cola. |

**Verificación de no-regresión de IF-02 e IF-04 — la parte que no se puede omitir.** El despliegue
es compartido: si IF-03 rompió algo, lo rompió para la Ejecutiva y el Visador, que están en
producción. Mínimo obligatorio:

1. `/consola` carga y lista solicitudes.
2. Crear una solicitud interna funciona end-to-end (SC01).
3. Asignar tasador funciona y envía el correo (SC05).
4. El sheet de documentos y el checklist funcionan **desde IF-02** — es el componente que IF-03
   reutilizó, y el punto más probable de regresión.
5. Los badges de SLA de la bandeja de IF-02 siguen mostrando lo mismo que antes del deploy.
6. La pestaña Historial del detalle carga.

**Si algo de IF-02 o IF-04 se rompió: se revierte el deploy.** No se parchea IF-02 desde esta
tanda (R5, R6).

**Post-deploy.** `docs/_notas/snapshot-P12-TAS.md` con: URL de producción, resultado de los 11
smoke tests, resultado de las 6 verificaciones de no-regresión, y la **lista de deuda abierta** que
IF-03 deja al cerrar (que no es poca: CI-012, A-12 a A-17, P-5, CI-005/CI-021).

### §13.2 Construcción — Pasos para Claude Code

1. Consultar overrides de P12-TAS en el inventario.
2. Verificar el checklist de variables de entorno en Railway **antes** de que Sergio empuje.
3. Confirmar que `TASADOR_COORDINACION_ENABLED=false` en producción.
4. `pnpm build` local limpio. **Si falla, no se despliega.**
5. Barrido final de reglas duras sobre todo el territorio IF-03:
   ```bash
   grep -rniE "\bIA\b|\bAI\b|Claude|OCR|inteligencia artificial" app/tasaciones components/tasador   # R8 · T-C
   grep -rn "@radix-ui" package.json app/ components/                                                # §4.4
   grep -rniE "make|postToMake|MAKE_WEBHOOK" app/api/tasaciones/                                     # R3
   grep -rn "localStorage" components/tasador/ lib/tasador/                                          # sólo autosave
   grep -rn "mockUserTasador" .                                                                       # R2
   git diff --stat main -- components/console app/api/solicitudes "app/(ejecutiva)"                  # R5
   ```
6. **Avisar a Sergio que puede hacer push.** No empujar (R12).
7. Tras el redeploy: ejecutar los 11 smoke tests con un tasador real.
8. Ejecutar las 6 verificaciones de no-regresión de IF-02/IF-04.
9. Escribir `docs/_notas/snapshot-P12-TAS.md`.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P12-TAS.md`.

### §13.3 Criterios de aceptación

- [ ] `pnpm build` local limpio antes del push.
- [ ] Los 6 barridos de reglas duras devuelven lo esperado (cero coincidencias donde corresponde).
- [ ] `TASADOR_COORDINACION_ENABLED=false` en Railway; `/tasaciones/[id]/coordinar` devuelve **404**
      en producción.
- [ ] **IF-03 no agregó ninguna variable de entorno de Make.**
- [ ] Los **11 smoke tests** pasan con un tasador real, con verificación en Airtable donde
      corresponde.
- [ ] Las **6 verificaciones de no-regresión** de IF-02/IF-04 pasan.
- [ ] `docs/_notas/snapshot-P12-TAS.md` existe, con la URL de producción, los dos conjuntos de
      resultados y la lista de deuda abierta.
- [ ] **Claude Code no ejecutó `git push` ni `git commit`** (R12).
- [ ] `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P12-TAS.md` creado.

---

## §14 · Cierre — Post-ejecución de cada tanda

### §14.1 Flujo por tanda (Sergio no pasa prompt)

1. Sergio abre Claude Code y dice `"sigue"` (o simplemente empieza la sesión).
2. Claude Code aplica el algoritmo de §0.7: lee los archivos de §0.1 + inventario + snapshots +
   aprendizajes previos con sufijo `-TAS`.
3. Claude Code verifica **R6** (`pnpm tsc --noEmit && pnpm build` verdes) y muestra el mensaje de
   arranque de §0.7 paso 7.
4. Sergio confirma con `s` o corrige.
5. Claude Code ejecuta la tanda siguiendo el **modo** y el **contrato** declarados en su sección.
6. Al terminar, Claude Code verifica **R6 de salida** y genera automáticamente
   `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}-TAS.md` con timestamp real del sistema.
7. Claude Code muestra un resumen numerado (máx. 8 líneas) + la ruta del archivo de aprendizajes.
8. **Sergio hace commit + push en GitHub Desktop** (R12).
9. Sergio dice `"sigue"` de nuevo → Claude Code detecta la próxima tanda y repite.

### §14.2 Plantilla del archivo de aprendizajes por tanda

Cada `aprendizajes-YYYYMMDD-HHMM-P{n}-TAS.md` sigue esta estructura:

```markdown
# Aprendizajes P{n}-TAS — {NombreTanda}

- **Interfaz:** IF-03 · Tasador
- **Fecha:** YYYY-MM-DD
- **Hora inicio → fin:** HH:MM → HH:MM
- **Duración:** N minutos
- **Modo Claude Code usado:** {default | accept edits on | auto mode on}
- **Contrato aplicado:** {🟢 libre | 🟡 pausa-en-comandos | 🔴 pausa-total}
- **Build antes:** tsc {✅/❌} · build {✅/❌}
- **Build después:** tsc {✅/❌} · build {✅/❌}
- **Estado de la tanda:** {completada | completada-bloqueada | abortada}
- **Commit asociado:** (Sergio lo agrega tras commit)

## Resumen ejecutivo
Bullet points de qué se construyó (máx. 6 líneas).

## Ambigüedades / inconsistencias declaradas en esta tanda
- A-XX / CI-XXX: qué se construyó, qué NO, y por qué.

## Decisiones técnicas
- Decisión 1 y por qué.

## Overrides aplicados (rutas reales vs plan)
- Plan proponía X → Se usó Y (razón).

## Verificación de la frontera R5
- `git diff --stat` contra el punto de partida: archivos tocados fuera del territorio IF-03
  (debe ser **ninguno**, salvo excepción R5-E autorizada — indicar cuál y quién autorizó).

## Bugs / obstáculos y resolución
- Problema → Solución.

## Deuda técnica para tandas siguientes
- Ítem 1 → asignado a P{n+k}-TAS.

## Reglas nuevas → MIGRAR a docs/aprendizajes.md
- E-XXX: enunciado corto para consolidar en el archivo activo (Sergio decide cuándo mover).
```

**Dos campos que no están en la plantilla de IF-02 y que aquí son obligatorios:** el bloque de
**ambigüedades declaradas** (porque IF-03 se construye sobre seis decisiones de negocio abiertas y
hay que saber en cada tanda qué se dejó fuera) y la **verificación de la frontera R5** (porque IF-03
comparte repositorio con dos interfaces en producción).

### §14.3 Archivos de continuidad

Al terminar cada tanda (antes del commit), Claude Code también actualiza:

- `docs/_notas/snapshot-P{n}-TAS.md` — estado del código, decisiones clave, ambigüedades que
  siguen abiertas y siguiente paso.
- `docs/_notas/inventario-tasador.md` — **sólo** si la tanda creó archivos que el inventario debe
  reflejar para la siguiente. No se reescribe entero; se agrega.

`docs/aprendizajes.md` **no se toca automáticamente** — es la base consolidada de reglas activas,
**compartida con IF-02**. Sólo se actualiza cuando Sergio pide expresamente migrar una regla.

**`docs/construccion.md` NO se actualiza desde IF-03.** Es el documento de construcción de IF-02
(R5 · R4). El avance de IF-03 se registra en sus propios snapshots.

### §14.4 Si algo se rompe entre tandas

Al iniciar la siguiente tanda, Claude Code:

1. Lee `docs/_notas/snapshot-P{n-1}-TAS.md` y `docs/_notas/inventario-tasador.md`.
2. Verifica que `pnpm tsc --noEmit` y `pnpm build` estén verdes.
3. **Si están rojos, diagnostica de quién es la rotura antes de tocar nada:**
   - **Si la rompió IF-03** (archivos bajo territorio IF-03): la arregla **antes** de comenzar la
     tanda nueva.
   - **Si la rompió IF-02 o IF-04** (archivos fuera del territorio IF-03, típicamente por una tanda
     paralela de la Ejecutiva): **no la arregla**. Reporta qué está roto, quién lo rompió y espera
     instrucción de Sergio. Arreglar IF-02 desde una sesión de IF-03 viola R5 y además pisa el
     trabajo de la otra línea (R6).
4. **Si una tanda de IF-03 rompió el build de IF-02 durante su ejecución: se aborta la tanda, se
   revierte lo escrito y se reporta.** No se "arregla" IF-02 para que IF-03 pase. Esta es la regla
   que hace posible construir en paralelo sin que una línea sabotee a la otra.

---

## §15 · Índice rápido de reglas activas

| ID | Regla | Aplica en |
|---|---|---|
| **T-A** | Una sola card por solicitud; el botón contextual es único, con tres variantes excluyentes. El gate de coordinación vive en ese botón. | P1-TAS, **P3-TAS** |
| **T-B** | Fecha real de visita obligatoria y distinta de la planificada; se persisten por separado; el informe declara la real. | P1-TAS, P4-TAS, **P7-TAS**, P9-TAS |
| **T-C** | Cero lenguaje de IA en toda la UI, incluidos tooltips, errores y badges. | **P6-TAS**, **P8-TAS**, P7-TAS, P12-TAS |
| **R1** | Patrón estructural heredado del plan de IF-02. | Este archivo |
| **R2** | Autenticación en la penúltima tanda; `mockUserTasador` hasta entonces. | P1-TAS → P10-TAS · cierre en **P11-TAS** |
| **R3** | Escritura directa a Airtable, sin Make; correos por Automation sobre `email_enviado_status`. | **P2-TAS**, P4-TAS, P12-TAS |
| **R4** | Documentación consistente: se lista lo desalineado, no se edita. | **§16** |
| **R5** | No tocar lo construido de IF-02/IF-04; escribir sólo en el territorio IF-03. Importar sí, editar no (**R5-E**). | Todas · crítico en **P9-TAS**, P10-TAS |
| **R6** | Build verde antes y después de cada tanda; si IF-03 rompe IF-02, se aborta. | Todas |
| **R7** | Reuso obligatorio antes de crear, con ruta real verificada (§0.2-bis). | Todas de UI · verificado en **P10-TAS** |
| **R8** | Cero lenguaje de IA (elevada a **Regla T-C**). | P6-TAS, P8-TAS |
| **R9** | Mobile-first 375×812; shadcn sobre `@base-ui/react`, nunca Radix. | Todas de UI |
| **R10** | Respeto a ambigüedades e inconsistencias abiertas; nada se decide por criterio propio. | Todas · matriz en **§0.4-bis** |
| **R11** | Ejecución dirigida por el propio plan (detección por archivos `-TAS`). | §0.7 |
| **R12** | Commits y push los hace Sergio. | Todas |
| **RF-09** | Acceso sólo a las solicitudes propias; 403 server-side; probado con dos tasadores. | P2-TAS (capa) · **P11-TAS** (cierre) |
| **RF-53** | SLA por etapa en horas hábiles; el tasador consume las etapas 2 y 5; IF-03 no define umbrales. | P2-TAS, P3-TAS, **P10-TAS** |
| **RF-12** | Mínimo 3 comparables antes de habilitar el cálculo. | **P7-TAS** |
| **RN-45** | Toda superficie exige origen + adjunto de respaldo. | P7-TAS (sección B) |
| **RN-49** | Estado de conservación heredado a recintos. | P7-TAS (sección B) |
| **RN-50** | Ampliaciones con marca de regularizable. | P7-TAS (sección B) |
| **RN-52** | Un solo hilo de correo por solicitud (`email_thread_id`). | P0.5-TAS, **P4-TAS** |
| **RN-53** | Política de primer contacto (4 h) — es la etapa 2 del SLA. | P3-TAS, P4-TAS |
| **RN-59** | Modo consulta. Su **excepción acotada** para contactos de visita fue **retirada** de §1.4 en v1.9.9, y por eso RF-TAS-04 no es implementable. | P4-TAS (declarativo) |
| **RN-31** | Alta de catálogo sin DDL ni deploy. | P0.5-TAS |
| **Regla D** | Feedback de progreso en toda mutación: `disabled` + spinner + gerundio + reset en `finally`, con `…` (U+2026). | P4-TAS, P5-TAS, P7-TAS, **P9-TAS** |
| **CI-012** | Coordinación por sistema — **decisión de negocio abierta**. Bloquea RF-TAS-04 y RF-TAS-05 y mantiene P4-TAS sin liberar. | P0.5-TAS, **P4-TAS**, P10-TAS, P12-TAS |
| **CI-021 · CI-005** | El SLA del tasador se lee del plazo por etapa, no del agregado. CI-021 no cierra sin CI-005. | P2-TAS, **P10-TAS** |
| **A-12 … A-17 · P-5** | Seis ambigüedades de negocio + el género del dominio `tipo_propiedad`. Tratamiento por tanda en §0.4-bis. | Según la matriz de §0.4-bis |

---

## §16 · Archivos afectados (no modificados en esta iteración) — R4

La creación de IF-03 desalinea varios documentos del repositorio. **Ninguno se editó al redactar
este plan.** Quedan listados para que Sergio decida cuáles corregir y cuándo.

| Archivo | Qué queda desalineado |
|---|---|
| `docs/schema-airtable.md` | No tiene `TX_CoordinacionVisita`, ni los 3 campos nuevos de `TX_Solicitudes` (`coordinacion_vigente`, `observacion_rechazo_tasador`, `fecha_real_visita`), ni las dos plantillas de coordinación. **Excepción declarada:** este archivo **sí se actualiza dentro de P0.5-TAS** (paso 8), porque P1-TAS y los Route Handlers lo leen como fuente. Queda listado para que la corrección quede visible, no para diferirla. Corresponde además anotar las **cuatro notas de realización** que la spec no anticipa: `id` (no hay PK numérica editable), `intento_numero` (no puede ser fórmula sin rollup intermedio), `coordinacion_vigente` (no existe `LAST(... ORDER BY ...)`) y la unicidad blanda (no es primitiva de Airtable, vive en el Route Handler). |
| `CLAUDE.md` | Es un documento **de IF-02** (`# CLAUDE.md — VProperty · Consola Ejecutiva (IF-02)`) y no contempla un segundo rol en el mismo repositorio. Queda desalineado en cinco puntos: **(1)** *"Ruta base de la app: `/consola`"* — IF-03 agrega `/tasaciones`. **(2)** *"Escrituras de negocio: webhook Make server-side, no directas a Airtable"* — **R3 lo contradice frontalmente** para IF-03; la regla necesita un alcance por interfaz. **(3)** La tabla de TABLE_IDs no tiene `TX_CoordinacionVisita`. **(4)** *"`A_Cambios` **no se escribe desde IF-02**"* sigue siendo cierto, pero **IF-03 sí la escribe** y eso no está dicho en ningún lado. **(5)** La sección "Cosas que Claude Code NO debe hacer" prohíbe escribir directo a Airtable, sin distinguir cliente de Route Handler ni interfaz. |
| `docs/construccion.md` | Guía de construcción **por RF de IF-02**. No tiene ninguna sección para los RF-TAS, y su tabla de avance no contempla la secuencia `P{n}-TAS`. Si se quiere una vista única del avance del proyecto, hay que decidir si IF-03 entra ahí o mantiene sus snapshots aparte (este plan opta por lo segundo: §14.3). |
| `docs/diseno.md` | Diseño funcional **de IF-02**. Su §3 describe la bandeja y el detalle de la Ejecutiva sin mencionar que dos de sus componentes (`FileUploadZone` y el sheet documental) pasan a tener un segundo consumidor. Más relevante: no registra que el visor de adjuntos de §1.3.4 **no está extraído como componente reutilizable**, que es la causa de la excepción R5-E. |
| `docs/aprendizajes.md` | Bitácora de sólo-append **compartida**. A partir de P0-TAS convivirán dos secuencias de tandas en `docs/_archivo/`, distinguidas sólo por el sufijo `-TAS`. Conviene una nota al inicio que lo declare, para que quien busque "la última tanda" sepa que hay dos respuestas. El archivo ya está cerca del umbral de archivado que fija `CLAUDE.md` (~1500 líneas): archivarlo es una tanda propia y **no** debe hacerse a mitad de una sesión de IF-03. |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md` | Fuente canónica, **no editable**. Cinco divergencias que este plan introduce o hereda, a registrar en el próximo bump normativo: **(1)** §2.11 atribuye los correos de coordinación a **SC13 (Make)**; **R3 los reasigna a una Automation de Airtable**. **(2)** §2.12 ubica las dos plantillas en `C_Plantillas`, que **no tiene campo para cuerpo HTML** — la fuente de runtime real es `C_NotificacionesConfig` (misma divergencia que IF-02 ya registró para SC05). **(3)** §2.12 declara `intento_numero` como fórmula y `coordinacion_vigente` con `LAST(... ORDER BY ...)`: ninguna de las dos es expresable en Airtable tal como está escrita. **(4)** §2.12 declara `D_TipoDocumento.tipo_propiedad` como alta nueva y **ya existía** desde antes del 25-jul-2026 (A-05). **(5)** §2.13 nombra `EstadoBadge`; el repo exporta `StateBadge`. |
| `docs/CODE_INCONSISTENCIES.md` | **CI-012** cambia de naturaleza al abrirse IF-03: deja de ser deuda documental y pasa a ser bloqueante activo con una tanda detenida por su causa (P4-TAS). Corresponde actualizar su estado y su fecha objetivo, que hoy dice *"condicional a la apertura de la tanda de IF-03"* — la tanda queda abierta con este plan. **CI-013 a CI-020** están declaradas "pendientes en el código de IF-03"; cada una queda cubierta por la tanda que indica §0.4-bis y su estado debería seguir el avance. **CI-021** sigue abierta y **no cierra sin CI-005**. |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | **A-09** (`TX_CoordinacionVisita` no existe) se resuelve materialmente en P0.5-TAS, pero **no por decisión de negocio**: la tabla se crea y CI-012 sigue abierta. Corresponde anotar esa distinción para que nadie lea la existencia de la tabla como el cierre de la ambigüedad. **A-12 a A-17** siguen abiertas y este plan las respeta una por una; sus fichas podrían anotar qué tanda las declara. |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md` | Registra `DEP-EXT:A-09` como *"pendiente creación Airtable · no verificada 2026-07-25"*. Tras P0.5-TAS deja de ser exacto. Conviene además verificar si replica el **árbol de ocho rutas** que CI-020 corrigió a siete; **no se verificó** al redactar este plan. |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md` | Misma marca `DEP-EXT:A-09` en la línea 1280. Y, más de fondo: describe el patrón de escritura del proyecto como "vía Make", sin contemplar que IF-03 escribe directo (R3). |
| `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md` | Su §3.3 agrupa los overrides y da **siete** secciones donde el diseño v4 tiene **ocho** (CI-014). La verificación pendiente es la parte accionable de esa entrada: **si ese documento sigue diciendo siete, la contradicción se traslada, no se resuelve**. |
| `docs/_notas/inventario-if02.md` | Marca `file-upload-zone.tsx` y `status-badges.tsx` como *"Transversal"* dentro de IF-02. Tras IF-03 son transversales **entre interfaces**, que es una categoría distinta: cambiarlos ya no afecta sólo a la consola. Conviene anotarlo antes de que alguien los modifique creyendo que el radio de impacto es una sola UI. |
| `C_AutomationsAirtable` *(dato, no documento)* | No tendrá fila para la Automation de correo de coordinación que P4-TAS crea. IF-02 ya aprendió (§9.6-R2) que el registro de inventario y la Automation real divergen con facilidad. **No se corrige desde IF-03** —es tabla de gobierno del proyecto— pero queda anotado. |
| `Z_EscenariosMake` *(dato, no documento)* | Sigue sin registrar SC06/SC07/SC08/SC09 con la numeración canónica que §2.11 fija. §2.11 pide expresamente *"validar la numeración canónica contra `Z_EscenariosMake` existente"*, y esa validación **no forma parte de ninguna tanda de este plan**. |
| `components/console/solicitud-detail.tsx` *(referencia — **no** se toca)* | Contiene el visor de adjuntos de sólo lectura que RF-TAS-10 manda reutilizar, encapsulado en funciones privadas. Mientras no se extraiga a un módulo compartido, RF-TAS-10 sólo puede cumplirse por el camino 1 de R5-E (importar `documentos-adjuntos-sheet.tsx` y desactivar sus acciones por prop) o pidiendo autorización para el camino 2. **La extracción es la solución limpia y es trabajo de IF-02, no de IF-03.** |
| `middleware.ts` *(referencia — se toca en P11-TAS)* | Si la protección de `app/tasaciones/**` exige tocar el middleware raíz, ese archivo **no pertenece a ninguna interfaz en exclusiva**: es infraestructura compartida. P11-TAS es la única tanda autorizada a modificarlo, y sólo para agregar el matcher de `/tasaciones`, nunca para cambiar el de `/consola`. |

---

## §17 · Riesgos conocidos de este plan

Se listan porque callarlos no los elimina.

1. **El repo v0 del Tasador no está en el monorepo** (verificado el 17-ago-2026). Las siete
   pantallas están íntegramente especificadas en §2, así que el plan es ejecutable de todos modos,
   pero **P3-TAS a P9-TAS construyen desde cero** y su tamaño real es mayor que el de sus
   equivalentes en IF-02. P0-TAS lo confirma y lo declara como riesgo #1.
2. **P7-TAS es desproporcionadamente grande.** Ocho secciones, una grilla densa, autosave,
   validación con salto al primer faltante y polling de bloqueo, en una sola tanda. Si al ejecutarla
   se desborda, **partirla en P7.1-TAS (secciones A–D) y P7.2-TAS (secciones E–H + validación)** es
   una decisión legítima: se registra en el archivo de aprendizajes y se agrega a la secuencia de
   §0.7 con el mismo criterio con que IF-02 insertó P8.5 y P8.6.
3. **CI-012 puede cerrarse por la opción (b)** —retirar la coordinación de la spec—, y en ese caso
   P4-TAS se retira completa junto con `TX_CoordinacionVisita`. El plan lo soporta: la tanda está
   aislada tras un flag y su tabla es de uso exclusivo.
4. **Seis ambigüedades de negocio abiertas** (A-12 a A-17) más P-5 y CI-005. IF-03 se puede
   construir con todas ellas abiertas —así está diseñado este plan— pero **no se puede declarar
   completo**: al cerrar P12-TAS quedan RF-TAS-01 (chip "Hoy"), RF-TAS-04, RF-TAS-05, RF-TAS-06 y
   el subconjunto constructivo de RF-TAS-08 sin cumplir del todo. El snapshot de P12-TAS lo declara
   explícitamente.
5. **El despliegue es compartido con dos interfaces en producción.** R6 y la verificación de
   no-regresión de P12-TAS son la única red; si se omiten, un error de IF-03 llega a la Ejecutiva y
   al Visador.

---

*Última actualización: 17-ago-2026 · **v1.0 del plan** (primera emisión · 14 tandas P0-TAS a
P12-TAS · reglas duras R1–R12 y Reglas T-A/T-B/T-C en §0 · matriz de ambigüedades abiertas en
§0.4-bis · excepción R5-E declarada para el visor "Ver expediente" · divergencia R3 con IF-02
—escritura directa a Airtable, correos por Automation— declarada en §0.4 · archivos desalineados
listados sin editar en §16 · riesgos conocidos en §17) · Base: Especificación v1.9.9 §2 ·
Patrón: `docs/_md/plan-ejecucion-if02-v1_9.md` v1.12*

