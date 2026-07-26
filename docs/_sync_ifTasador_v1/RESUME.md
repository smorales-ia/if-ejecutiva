# Punto de retoma · sync IF-Tasador v1.9.3

> Documento de handoff. Escrito el 25-jul-2026 al pausar la sesión.
> **Actualizado el 25-jul-2026 al cierre del lote 2.**
> Está dirigido a una sesión futura de Claude Code **sin memoria de la conversación original**.
> Léelo completo antes de ejecutar cualquier cosa.

---

## Estado actual

- **Rama activa:** `docs/sync-ifTasador-v193`
- **Último commit de contenido:** `<sha lote 2>` (lote 2). El lote 0 es `196c1e1`.
- **Lotes completados:** **0** (bump de versión) y **2** (spec v1.9.4 · 5 correcciones internas)
- **Lote 1:** 🔴 **BLOQUEADO por A-10. No ejecutar hasta decisión humana.**
- **Lote 3:** 🟡 **PARCIAL** (25-jul-2026). Se ejecutaron **(ii)** §22 de `schema-airtable.md`
  —registro expandible de alias, cierra A-05— y **(iii)** `docs/CODE_INCONSISTENCIES.md` con
  CI-001. **(i) el delta §2.12 sigue BLOQUEADO por A-09**: `TX_CoordinacionVisita` no existe
  en Airtable, no hay TABLE_ID ni FIELD_IDs que documentar. Mismo criterio que A-10: trabajo
  fuera del repo, ningún archivo se toca hasta la decisión.
  ⏳ CI-001 quedó **sin Dueño ni Fecha objetivo** a propósito — los rellena el usuario.
- **Próximo lote posible:** **4** (Blueprint v2.10 + Arquitectura v2.9) o **5** (operativos).
  ⚠ Verificar antes: el lote 4 incluye `TX_CoordinacionVisita` en entradas/salidas del
  Blueprint y las 8 rutas de IF-03 — la parte de rutas y vocabulario ("Enviar visita" →
  "Calcular Tasación", `devuelta` DEPRECATED) **no** depende de A-09; la parte de schema sí.
  **Requiere confirmación humana al retomar.**

### Qué dejó hecho el lote 2 (25-jul-2026 · `<sha lote 2>`)

Adelantado sobre el lote 1 por autorización explícita del usuario, dejando A-10 abierto.
Toca **un solo archivo**, `docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md`, y **ninguna
ocurrencia de `SC05`/`SC08`/`SC13`** — la decisión de A-10 no queda condicionada y el lote 1
puede ejecutarse después sin conflicto con este commit.

Las cinco correcciones internas, todas justificadas por la tabla §2.14 del propio spec:

| # | Sección | Qué se corrigió |
|---|---|---|
| 1 | §1.4 · ficha RN-59 · §1.9.1 · §13 | Excepción acotada a RN-59: `TX_ContactosVisita` editable en `asignada` sólo cuando `coordinacion_vigente = rechazada`. Se amplió a §1.9.1 (FUT-EJ-06 y FUT-EJ-07), que afirmaban lo contrario y que §2.14 fila 10 también nombra |
| 2 | §4.2.1 | Campo `tipo_propiedad` `{nuevo, usado, ambos}` en `D_TipoDocumento`; corregida la lectura de la columna `cuándo` (no es proxy de tipo de propiedad); poblado inicial registrado como **asunción P-4**, no como decisión |
| 3 | §6.2 | `AT03_ejecutar_dag_formulas`: `estado=capturada` → `estado=visitada`. Era la única violación literal de vocabulario del archivo |
| 4 | §1.3.2 · §1.3.3 | Lectura de `TX_CoordinacionVisita` en IF-02: bloque *Coordinación* de sólo lectura en Datos, eventos de coordinación en el timeline de Historial |
| 5 | §2.8 | Cita `Origen de Datos del Informe v1.0 §3.3` → `v1.1 §3.3` (C-9) |

Más la nota al pie de §2.14 con el comando de recuperación de v1.9.2 (mitigación A-04) y la
celda de versión de portada, que seguía diciendo **1.9.2** dentro de un archivo v1.9.4.

⚠ **Pendientes que este lote dejó abiertos a propósito** (son de lotes 3–4, no olvidos):
`tipo_propiedad` falta en `docs/schema-airtable.md` y en la Capa de Datos; el sheet documental
filtrado falta en el Blueprint. El spec ya los declara.

### Qué dejó hecho el lote 0

Cuatro documentos nuevos (copias byte a byte, cero cambios de contenido) y sus cuatro
predecesores marcados `[SUPERSEDED]` y congelados:

| Nuevo (se edita en lotes 2–5) | Predecesor congelado |
|---|---|
| `VProperty_Especificacion_Proyecto_v1_9_4.md` | `…_v1_9_3.md` |
| `VProperty_Blueprint_Interfaces_v2_10.md` | `…_v2_9.md` |
| `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_5.md` | `…_v2_6_4.md` |
| `Arquitectura_Enterprise_VProperty_v2_9.md` | `…_v2_8.md` |

⚠ **Todas las ediciones de los lotes 2–5 van sobre los archivos NUEVOS.** Los predecesores
no se tocan más: quedan como registro histórico y excluidos de los greps de regresión §6.1.

⚠ **Cuidado con la nomenclatura:** la Arquitectura pasó a **v2.9**, mismo número que el
Blueprint tiene en su versión vieja (`VProperty_Blueprint_Interfaces_v2_9.md`). Son
documentos distintos con numeraciones independientes. Cita siempre el nombre completo,
nunca sólo "v2.9".

---

## Ambigüedad crítica A-10 (bloquea lote 1)

Descubrimiento hecho en esta sesión **antes** de ejecutar el lote 1. Ningún archivo fue
modificado por el lote 1.

El renombre planeado **"SC05 → SC08"** del prompt original **NO es aplicable como
find/replace masivo.** Razones:

**(a) `SC05` en el repo tiene dos roles distintos, no uno:**

- **Rol A — notificar al tasador al asignar.** 34 ocurrencias.
  El spec v1.9.3 **§1.7 y §1.6.3 lo llaman `SC13`**, no SC08.
  (§1.7: *"SC13 · Envío de notificaciones · … al tasador con la plantilla
  `email_asignacion_tasador`"*; §1.6.3 se titula *"Correo de asignación al tasador (SC13)"*.)
- **Rol B — cadena DAG → AT03.** 4 ocurrencias.
  El spec v1.9.3 **§2.11 lo llama `SC08`**.

**(b) `SC08` YA está ocupado en el repo con un tercer rol:**

- **Rol C — validar rangos de valor calculado → AT04.** 2 ocurrencias
  (`Arquitectura_…v2_9.md:3189` y `Capa_Datos_…v2_6_5.md:5961`).
- El spec v1.9.3 dice que este rol es **AT04 sin escenario Make**.

Aplicar el renombre dejaría **dos filas `SC08` consecutivas** en la tabla de Arquitectura
(líneas 3186 y 3189), apuntando a AT03 y AT04 respectivamente.

**(c) Inconsistencia preexistente en Arquitectura Enterprise** (anterior a este sync, no
introducida por él): la tabla define `SC08 = validar rangos` (línea 3189), pero la narrativa
dice *"SC08 aplica las 4 fórmulas"* (3838) y *"SC07 y SC08 procesan"* en estado `visitada`
(3764). Ya se usa con el significado del motor de cálculo dentro del mismo documento.

**(d) Cifra corregida: son 38 ocurrencias de `SC05`, no 22.**
La cifra 22 del prompt original venía de sumar SC02/SC04/SC05/SC15 en una sola métrica de
`grep -c`. Desglose real: Blueprint 11 · `CLAUDE.md` 7 · `diseno.md` 6 ·
`schema-airtable.md` 4 · Capa de Datos 3 · `construccion.md` 3 · `README.md` 2 ·
Arquitectura 2.

---

## Mapeo canónico según spec v1.9.3

| Rol | Hoy en repo | Canónico spec v1.9.3 |
|---|---|---|
| Notificar tasador al asignar | `SC05` ×34 | `SC13` |
| Cadena DAG → AT03 | `SC05` ×4 | `SC08` |
| Validar rangos → AT04 | `SC08` ×2 | `AT04`, sin escenario Make |

---

## Dato que desataría A-10

`Z_EscenariosMake` está **vacía** (`docs/schema-airtable.md:119` — *"⚠ Vacía al 04-jul-2026;
poblar al importar SC01/SC05"*).

**§2.11 del spec encarga explícitamente al Data Engineer** *"validar la numeración canónica
contra `Z_EscenariosMake` existente antes del próximo prompt v0.dev"*. Esa validación **no se
ha hecho** y es la que permitiría cerrar A-10 sin renumerar identificadores históricos.

TABLE_ID de la tabla: `tblYfmDoaq7Z3Vh6P` (base `app9G7lLkIV3CpeLa`).

---

## Decisiones pendientes al retomar

### A-10 · criterio de numeración SC — requiere sign-off Data Engineer

| # | Opción | Costo |
|---|---|---|
| 1 | Renombrar `SC05`→`SC13` (34) y `SC05`→`SC08` (4); mover el `SC08` actual a "AT04 sin escenario Make" | **Rompe la regla de oro §1.2** (no renumerar históricos) 34 veces |
| 2 | Congelar la numeración actual del repo y actualizar el spec v1.9.3 para que refleje la realidad | **Invierte la jerarquía documental** (el spec es fuente única) |
| 3 | Poblar `Z_EscenariosMake` primero como fuente de verdad operacional y resolver el mapeo desde ahí | **Opción que el propio spec indica** (§2.11) · requiere trabajo fuera del repo |

### Otras ambigüedades abiertas

- **A-01, A-02** — fuentes externas ausentes (`VProperty_ADR_IF_Tasador_v3_v2.md`,
  `Imagenes_IF_Tasador_v3.docx`). **Sin acción.** Registradas por completitud.
- **A-05** — ✅ **RESUELTA en el lote 3 (ii)**, 25-jul-2026. Se cerró con el registro §22 de
  `docs/schema-airtable.md`: tres capas de nombre (nombre de datos Airtable · FIELD_ID ·
  alias de código único), sin renombrar nada en Airtable. Alias finales: `tipoPropiedad` y
  `tipoPropiedadNuevoUsado` —**adoptados** del código, que ya los usaba— y
  `condicionPropiedadAplicable`, **acuñado** para `D_TipoDocumento.tipo_propiedad`
  (`fldIfdcjsr8KeNRCx`), el único homónimo que quedaba vivo. §22.4 fija el procedimiento
  para agregar entradas nuevas: el registro es expandible, no una tabla cerrada.
  ⚠ Dos hechos que la ficha original de A-05 tenía mal: la colisión en `TX_Solicitudes` ya
  estaba resuelta desde el 24-jul (`tipo_propiedad_nuevo_usado`, §21.4-a), y el campo de
  `D_TipoDocumento` **ya existía** — §2.12 lo declara como alta nueva y no lo es.
  **Queda abierto P-5**, que es otro problema: el género del dominio.
- **A-09** — 🔴 **ELEVADA A BLOQUEANTE del lote 3** el 25-jul-2026. Ficha completa en
  `gap/_ambiguedades.md` (hasta esa fecha existía sin encabezado, arrastrada al final de
  A-10). Texto original conservado abajo:
- **A-09 (enunciado original)** — `TX_CoordinacionVisita` no existe aún en Airtable; `intento_numero` y la
  constraint blanda no son primitivas de Airtable. **Reaparece en el lote 3.**
- **A-07 (P-4)** y **A-08 (P-3)** — fuera de alcance por §7 del prompt. **No decidir.**
- **P-5 · género del dominio de `tipo_propiedad`** *(nuevo · 25-jul-2026)*. `D_TipoDocumento`
  lo tiene en femenino (`nueva/usada/ambas`, `fldIfdcjsr8KeNRCx`) y `TX_Solicitudes` en
  masculino (`nuevo/usado`, `fldHxx1P1ao33PWrl`). RF-TAS-06 los compara: **hoy nunca
  coinciden y el sheet documental sale vacío.** Detrás hay una decisión de vocabulario de
  negocio sin tomar ("propiedad nueva/usada" vs "inmueble nuevo/usado"). Mismo criterio que
  A-09 y A-10: **trabajo fuera del repo**, decisión del usuario. Registrado en §2.15 y
  §4.2.1 del spec v1.9.4. Impacto alto — bloquea la implementación de RF-TAS-06.

### Ya cerradas (no reabrir)

- **A-03** — `VProperty_Maquina_Estados.html`: confirmado autoconsistente con §2.11.
  Fuente única *leída*, no editada. Sin acción.
- **A-04** — spec v1.9.2: **no se restaura**. Desviación consciente de §1.3/§4.2 autorizada.
  Recuperable con `git show 03e8053:docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md`.
- **A-06** — `A_Eventos.visita_completada` **conserva su literal** (decisión D-C).

---

## Correcciones ya registradas al plan original

> Bloque aprobado por el usuario al inicio de la Fase 1. Copia textual.
> Detalle ampliado en `00b_correcciones_al_prompt.md`.

**CORRECCIONES DE RUTA Y VERSIONES**

- Insumo autoritativo real: `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md`
  (no `docs/spec/`). Actualiza todas las referencias.
- Versiones reales del repo (usa estas, no las del prompt):
  Arquitectura v2.8 · Capa de Datos v2.6.4 · Blueprint v2.9 · Motor v2.6 · Origen v1.1.
  El "Blueprint v2.8" del prompt original es anterior a v2.9 del repo. Trata las
  versiones del repo como la verdad; el prompt cede.

**AMPLIACIÓN DE SCOPE (crítico)**

- El propio v1.9.3 no se autoaplicó §2.14 en su §1.4, §4.2.1 ni en la línea 2974
  (AT03 estado=capturada). Esto entra al sync como caso especial:
  produce v1.9.4 del spec con esas 3 correcciones internas aplicadas
  y marca v1.9.3 como SUPERSEDED con puntero a v1.9.4. Regla de oro:
  el spec no puede contradecirse consigo mismo.

**FUENTES EXTERNAS AUSENTES**

- `VProperty_Maquina_Estados.html`: confirmado como autoconsistente con §2.11 del
  spec (vocabulario visitada, sin capturada, devuelta preservada como en spec).
  Sin acción en Fase 3; sirve como fuente única leída, no editada.
- `VProperty_ADR_IF_Tasador_v3_v2.md`: registrar en `gap/_ambiguedades.md` como
  A-01 "fuente externa no versionada, congelada por §2 del spec".
  No bloquea el sync; no hay que marcarlo SUPERSEDED porque no existe en el repo.
- `Imagenes_IF_Tasador_v3.docx`: A-02 mismo tratamiento; es referencial.

**PRIORIZACIÓN EN FASE 3**

- SC05 es la mayor superficie real (22 ocurrencias en 8 archivos vivos):
  Blueprint, Capa de Datos, Arquitectura, `CLAUDE.md`, `README.md`, `diseno.md`,
  `construccion.md`, `schema-airtable.md`. Trabajarlo como primer lote de Fase 3
  con especial cuidado (renombrar a SC08 con nota histórica, sin borrar).
- Falsos positivos confirmados no tocar: WhatsApp como canal de origen de
  solicitud en IF-02, y "3 intentos" en `diseno.md:207,227` (backoff D-14.2).

> ⚠ **Nota posterior:** la cifra "22 ocurrencias" de este bloque quedó **corregida a 38**,
> y la instrucción "renombrar a SC08" resultó **inaplicable** — es lo que motiva A-10.
> El resto del bloque sigue vigente.

### Correcciones adicionales surgidas después (C-7 a C-9)

- **C-7** — término obsoleto adicional no previsto por el prompt: **"Enviar visita"**, la
  acción primaria de IF-03 en el Blueprint (líneas 554, 906, 1130, 2425 de v2.9 · +8 en v2.10)
  y en `diseno.md:43`. Debe pasar a **"Calcular Tasación"**. Agregado a los greps de regresión.
  **`"Iniciar captura"` NO es obsoleto** — es navegación legítima de §2.4, no dispara transición.
- **C-8** — v1.9.2 no se restaura (ver A-04).
- **C-9** — el spec cita *"Origen de Datos del Informe v1.0 §3.3"* cuando el repo tiene **v1.1**.
  **Verificado 25-jul-2026: el contrato se mantiene** (v1.1 §3.3 tiene las mismas 7 secciones,
  sin categoría "Documentos" en fotos, campos de comparables coincidentes). Única corrección:
  la cita de versión. Es la **quinta** edición interna del lote 2.

### Nomenclatura de ramas

El esquema del prompt §4.1 (`docs/sync-ifTasador-v193/spec-proyecto`) **es irrealizable en git**:
un ref no puede ser archivo y directorio a la vez cuando ya existe `docs/sync-ifTasador-v193`.
Se usan guiones: `docs/sync-ifTasador-v193-lote0-versionado`, `-lote1-sc05-sc08`, etc.

---

## Ediciones obligatorias §5.1 que ya están cumplidas (no buscar trabajo ahí)

Verificado en Fase 1 — **cero ocurrencias vivas** de las cuatro:

- Eliminar el "AlertDialog dual" → sólo aparece en §2 del spec, que ya lo niega.
- Eliminar "franja roja" / "3 re-visitas" / "último intento" → ídem.
- Eliminar lenguaje de IA en UI → el único hit es la prohibición correctamente enunciada.
- Eliminar la categoría "Documentos" del organizador de fotos → no existe en ningún doc;
  `Origen_Datos_v1.1` §3.3 Sección 2 ya lista 22 categorías sin ella.

**AT03 con trigger `estado = visitada`** ya está correcto en el Motor de Cálculo v2.6
(líneas 36, 157, 678, 688). La única violación viva estaba en **§6.2 del spec, línea 2974**,
y **quedó corregida en el lote 2** (`<sha lote 2>`). Ya no hay ocurrencias vivas de `capturada`
en el spec: las que restan son enunciados de su deprecación, la fila §2.14 que la ordena, la
nota histórica bajo la tabla de §6.2 y el falso positivo "fotos capturadas".

---

## Cómo retomar

1. Leer este archivo completo.
2. Leer `SYNC_LOG.md` para confirmar el sha del último commit.
3. Verificar que `git status` esté limpio y en la rama `docs/sync-ifTasador-v193`.
4. Consultar al humano cuál de las 3 opciones de A-10 se aplica, o si se avanza con el
   lote 3 mientras A-10 queda abierto.
5. **NO ejecutar el lote 1 hasta que A-10 esté resuelto.**

**Sobre el lote 3, si es el siguiente.** Es el de mayor riesgo del sync: toca la Capa de
Datos y `docs/schema-airtable.md`, del que `CLAUDE.md` obliga a derivar los tipos TS. Regla
innegociable: **jamás inventar un TABLE_ID ni un FIELD_ID**. `TX_CoordinacionVisita` no existe
en Airtable (A-09), así que todas sus altas van marcadas *"pendiente de creación · declarado
en spec v1.9.3 §2.12 · no verificado en Airtable al 25-jul-2026"*. Reabre además A-05 y
obliga al cuidado del `SC15` homónimo (UF vs. backups nocturnos — sólo se retira el del UF).

Lectura de apoyo, en este orden: `02_plan_fase3.md` (lotes y decisiones D-A a D-D) ·
`gap/_ambiguedades.md` (A-01 a A-10) · la ficha de brecha del documento que toque el lote.

---

## Reglas de oro (recordatorio)

- Fuente única **§2 spec v1.9.3**.
- **Cero renumeración** de identificadores históricos (RF · RNF · RN · RT · RR · SP · D · SC · AT · IF).
- **Cero pérdida de contenido:** DEPRECATED/SUPERSEDED, no borrar.
- **Un commit por lote**, con diff revisado por humano.
- **Máquina de estados oficial:**
  `creada → asignada → visitada → calculada → pdf_listo → aprobada → (pendiente_final?) → entregada → cerrada`
  Excepciones: `cancelada`, `requiere_atencion`. `devuelta` **deprecado** (el visador devuelve
  con transición directa `pdf_listo → asignada`).
- **Botón único de disparo:** "Calcular Tasación" (no "Capturar", no "Enviar visita",
  no "Finalizar visita").
- **Sin lenguaje de IA** en textos de UI ("Lectura de datos", "Cálculo en curso", "Generando informe").
- **Make es puro transporte** — ninguna lógica de negocio dentro de un escenario.
- **RN-59 con excepción acotada:** `TX_ContactosVisita` editable en estado `asignada`
  **exclusivamente** cuando `coordinacion_vigente = rechazada`. Sólo contactos de visita;
  nunca cliente, propiedad, RUT ni datos financieros.
- **Separación estricta fotos ↔ datos.**
- **Trazabilidad hacia atrás:** cada modificación cita la sección del spec que la justifica.
- **Esta tarea es sólo de documentación.** Ningún cambio en `.ts/.tsx/.jsx`; las
  inconsistencias con código van a `CODE_INCONSISTENCIES.md`.
