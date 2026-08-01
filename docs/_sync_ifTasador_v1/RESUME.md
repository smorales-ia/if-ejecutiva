# Punto de retoma · sync IF-Tasador v1.9.3

> Documento de handoff. Escrito el 25-jul-2026 al pausar la sesión.
> **Actualizado el 25-jul-2026 al cierre del lote 2.**
> Está dirigido a una sesión futura de Claude Code **sin memoria de la conversación original**.
> Léelo completo antes de ejecutar cualquier cosa.

---

## Estado actual

- **Rama activa:** `docs/sync-ifTasador-v193`
- **Último commit de contenido:** `ae5202e` — **contiene los lotes 2 y 3 y la bitácora,
  fusionados en un solo commit**. El lote 0 es `196c1e1`.
- **Lotes completados:** **0** (bump de versión) y **2** (spec v1.9.4 · 5 correcciones internas)
- **Lote 1:** 🔴 **BLOQUEADO por A-10. No ejecutar hasta decisión humana.**
- **Lote 3:** 🟡 **PARCIAL** (25-jul-2026). Se ejecutaron **(ii)** §22 de `schema-airtable.md`
  —registro expandible de alias, cierra A-05— y **(iii)** `docs/CODE_INCONSISTENCIES.md` con
  CI-001. **(i) el delta §2.12 sigue BLOQUEADO por A-09**: `TX_CoordinacionVisita` no existe
  en Airtable, no hay TABLE_ID ni FIELD_IDs que documentar. Mismo criterio que A-10: trabajo
  fuera del repo, ningún archivo se toca hasta la decisión.
  ✅ CI-001 completa: dueño = mantenedor de `lib/solicitudes.ts`; fecha objetivo condicional
  a RF-TAS-06 y dependiente de P-5.
- **Próximo lote posible:** **4** (Blueprint v2.10 + Arquitectura v2.9) o **5** (operativos).
  ⚠ Verificar antes: el lote 4 incluye `TX_CoordinacionVisita` en entradas/salidas del
  Blueprint y las 8 rutas de IF-03 — la parte de rutas y vocabulario ("Enviar visita" →
  "Calcular Tasación", `devuelta` DEPRECATED) **no** depende de A-09; la parte de schema sí.
  **Requiere confirmación humana al retomar.**

### Qué dejó hecho el lote 2 (25-jul-2026 · `ae5202e`)

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
y **quedó corregida en el lote 2** (`ae5202e`). Ya no hay ocurrencias vivas de `capturada`
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

---

# Punto de reanudación Fase 4 · 26-jul-2026

> Escrito al cerrar el día. **Nada autorizado esta noche.** Se retoma por la decisión 3.1.
> El detalle completo vive en `03_prealcance_fase4.md`; aquí sólo el estado y las decisiones.

## 1. Estado a hoy

Pre-alcance de Fase 4 entregado en **`2ddaf50`** ·
ruta `docs/_sync_ifTasador_v1/03_prealcance_fase4.md`.

Granularidad fijada: **RF-TAS × documento**, 10 filas × 3 columnas = **30 celdas**
(autoridad §6.2 del prompt con desviación C-4). No es RF-TAS × SC — esa habría dado un
diagnóstico distinto.

⚠ **Actualizado por D-H2 (31-jul-2026): el denominador es 27, no 30.** Ver §6 al final de este
archivo. Las cifras de este bloque son las del 26-jul y se conservan como registro de la medición.

| Métrica | 26-jul (30 celdas) | **Vigente (27 celdas)** |
|---|:--:|:--:|
| Cobertura A · identificador `RF-TAS-XX` presente | 47 % (14/30) | **52 %** (14/27) |
| Cobertura B · comportamiento descrito | 67 % (20/30) | **74 %** (20/27) |
| `VALIDATION.md` redactable | **50 %** (4/8 grupos) | 50 % · sin cambio |

**Marginales sobre cobertura A de `TRAZABILIDAD.md`:**

| Desbloqueo | Δ cobertura A | Efecto en `VALIDATION.md` |
|---|:--:|---|
| A-09 | **+10 pp** (47 → 57 %) | desbloquea 1 de los 4 grupos pendientes |
| A-10 | **0 pp** | desbloquea 1 grupo |
| P-5 | **0 pp** | desbloquea 1 grupo |

**Sin sinergias entre bloqueos:** resolver los tres juntos no añade nada sobre A-09 sola,
porque A-10 vive en el eje `SC` y P-5 en el dominio de un campo, y ninguno es el eje de esta
matriz.

**Conclusión que invierte la premisa del ejercicio:** `TRAZABILIDAD.md` **no está bloqueada
por decisiones externas**. Con A-09, A-10 y P-5 resueltas queda en 57 %; el 43 % restante es
trabajo propio —20 pp de citación y 23 pp de contenido sin escribir—. `VALIDATION.md` sí lo
está, en la mitad exacta de sus grupos, uno por cada bloqueo.

## 2. Recomendación en la mesa (no autorizada)

**Lote 6 de citación de identificadores `RF-TAS-XX` inline**, en documentos ya escritos,
**antes de Fase 4**.

Fundamento: **+20 pp por medio día de trabajo, sin dependencias externas** — el movimiento más
barato del backlog y el que más mueve la aguja, contra los +10 pp de A-09 que exigen sign-off
DE y trabajo en Airtable. Estimación preliminar: **6–8 citas** (5 en Blueprint v2.10, 1 en
`diseno.md`, 0–2 en `construccion.md` según resuelva H-2).

Escenarios descartados y por qué:

- **(b) coexistencia paralela** con Fase 4 — paga coordinación por un ahorro de horas; la
  matriz se escribiría dos veces y durante la ventana intermedia mentiría sobre sí misma.
- **(c) redefinir la matriz por contenido** (extender C-4 a Fase 4) — sube la cifra de 47 % a
  67 % sin tocar un archivo, pero **la matriz deja de ser verificable por búsqueda**: cada
  celda pasa a depender del juicio de quien la evaluó. Es el problema que la matriz existe
  para eliminar.

## 3. Decisiones pendientes, en orden estricto

### 3.1 · H-2 — ✅ **RESUELTA el 31-jul-2026 · D-H2. Gate abierto.**

Decisión: **`n/a` en la columna operativo para RF-TAS-01, RF-TAS-03 y RF-TAS-08**, cada una con
razón declarada. **Denominador 27.** RF-TAS-07 queda fuera del `n/a` pese a ser IF-03 puro:
`diseno.md` ya describe su comportamiento y su hueco es de citación. Ficha completa en
`03_prealcance_fase4.md` §10.

Enunciado original, conservado: definir si `diseno.md` y `construccion.md` cuentan como
"documento operativo" para las RF-TAS **puramente de IF-03**, o si esas celdas van `n/a` por
ser operativos de **IF-02**. No hay documento operativo de IF-03 en el repo.

### 3.2 · Autorizar lote 6 o no

Alcance a definir **tras** H-2. Estimación preliminar: 6–8 citas inline, medio día.
Regla de citación recomendada: **inline al primer uso** —`…los chips "Hoy" y "Por coordinar"
(RF-TAS-01)…`—, que es el patrón que el Blueprint ya usa para RF-TAS-02 y RF-TAS-07 y hace
converger las coberturas A y B para siempre.

### 3.3 · H-1 — `RF-TAS-08` y `RF-TAS-09`

Existen **sólo en el spec**. Es contenido faltante, **no citación**. ¿Entran en el lote 6
—que lo encarece y le cambia la naturaleza, de anclaje a redacción—, en un lote 7, o se
difieren? Decisión con precedente para futuros huecos de contenido.

### 3.4 · Secuencia de Fase 4

Respecto a: lote 6, A-09 (que sólo aporta a `VALIDATION.md` en términos de grupos, más los
+10 pp de cobertura A), A-10 y P-5. La recomendación del pre-alcance es **no esperar a ningún
bloqueo externo**: no existe un umbral mínimo de N bloqueos que justifique diferir.

## 4. Hallazgos §9 — registrados, sin propagar

Los tres viven en `03_prealcance_fase4.md` §9 y **no se actuó sobre ninguno** (RO-03):

- **H-1** — `RF-TAS-08` y `RF-TAS-09` sólo en el spec; contenido que ningún lote escribió.
- **H-2** — la columna "documento operativo" puede ser inaplicable para RF-TAS de IF-03.
- **H-3** — medir cobertura B por grep de literales es frágil; hubo un falso positivo de
  `RF-TAS-08` en `schema-airtable.md`. Argumento adicional a favor del lote 6: la cobertura A
  sí es automatizable sin ambigüedad.

## 5. Estado del sync a hoy

| Lote | Estado | Commit |
|---|---|---|
| 0 · bump de versión | ✅ | `196c1e1` |
| 1 · SC05 transversal | 🔴 bloqueado **A-10** | — |
| 2 · spec v1.9.4 | ✅ | `ae5202e` |
| 3 · §22 + CI-001 | 🟡 parcial · (i) bloqueado **A-09** | `ae5202e` |
| 4 · Blueprint + Arquitectura | 🟡 parcial · narrativa fuera por **A-10** | `a08bd20` |
| 5 · operativos + Motor | 🟡 parcial · 4 ítems diferidos **A-09/A-10** | `38f275d` |
| **6 · citación de identificadores** | **propuesto, NO autorizado** | — |
| **Fase 4** | **no iniciada** | — |

Bloqueos externos vigentes: **A-09** (crear `TX_CoordinacionVisita`), **A-10** (numeración
`SC`, con la ampliación `SC03` del Motor detectada en el lote 5), **P-5** (género del dominio
`tipo_propiedad`). **A-11** abierta, no bloqueante. **CI-001** abierta, fecha condicional.

<<<<<<< Updated upstream
---

# 6. Punto de reanudación · 31-jul-2026 · tras D-H2

**Hecho hoy:** sólo la decisión **3.1 · H-2**. Ningún lote ejecutado, ningún documento del sync
fuera de `03_prealcance_fase4.md` §10 y este archivo. `TRAZABILIDAD.md` y `VALIDATION.md` siguen
sin existir.

**Nota de rama:** el sync se documentó sobre `docs/sync-ifTasador-v193`, pero **los cinco commits
están ya en `main`** (`196c1e1`, `ae5202e`, `a08bd20`, `38f275d`, `2ddaf50` son ancestros de
`HEAD`). Se trabaja sobre `main`. ⚠ El árbol suele tener cambios sucios de **otro frente**
(blueprints Make · `aprendizajes.md`): al commitear el sync, **listar rutas explícitas**, nunca
`git commit -a`.

**Verificación de cobertura A (RO-02), reproducible:**
=======
**Mañana se retoma por 3.1 (H-2).**

---

# 6. Punto de reanudación · 31-jul-2026

> ⚠ **Leer entero antes de tocar nada.** La sesión del 31-jul ejecutó trabajo que **ya no está
> en el árbol**. Lo que sigue distingue qué se decidió (vale) de qué se escribió y se perdió
> (hay que rehacerlo).

## 6.1 Lo que se decidió — vigente

**H-2 · resuelta (D-H2).** La columna *documento operativo* va **`n/a` para RF-TAS-01,
RF-TAS-03 y RF-TAS-08**, cada una con razón declarada (`n/a · no existe documento operativo de
IF-03 en el repo · reevaluar al abrirse ese repo`). **Denominador de la matriz: 27, no 30.**

RF-TAS-07 **queda fuera** del `n/a` pese a ser IF-03 puro: `diseno.md` ya nombra "Calcular
Tasación". Las filas transversales o de otra interfaz —02, 04, 05, 06, 09, 10— se mantienen.

Recálculo sobre 27 celdas: cobertura A **52 %** (14/27) · cobertura B **74 %** (20/27) ·
`VALIDATION.md` sin cambio en 50 %. **A-09 pierde peso**: su marginal cae de +10 pp a **+7 pp**,
porque operativo × RF-TAS-03 sale del denominador. A-10 y P-5 siguen en 0 pp.

**3.2 · lote 6 autorizado.**

## 6.2 Lo que se escribió y se perdió — hay que rehacerlo

⚠ **La ficha D-H2 (§10 del pre-alcance), la ficha del lote 6 (§11) y las 5 citas del lote 6 se
escribieron el 31-jul y desaparecieron del árbol al final de la sesión.** No estaban commiteadas
y no son recuperables por git. Verificado por grep al cierre: el Blueprint sólo tiene RF-TAS-02
y RF-TAS-07, `diseno.md` sólo RF-TAS-04, `schema-airtable.md` sólo RF-TAS-06 — **las 14 celdas
de siempre.** La cobertura real hoy es **52 %** (14/27), no 70 %.

`03_prealcance_fase4.md` está en su estado del 26-jul: sin §10, sin §11, y H-2 sin marcar como
resuelta en §9. **La decisión D-H2 de §6.1 de este archivo es el único registro que queda de
ella.**

### Las 5 citas a rehacer — anclas exactas, es mecánico

| Documento | RF-TAS | Ancla | Texto |
|---|---|---|---|
| Blueprint v2.10 | **01** | tabla vocabulario UI, fila *Chips de la cola* | línea propia `(RF-TAS-01).` tras `{asignada, visitada, calculada}` (sin punto) |
| Blueprint v2.10 | **03** | tabla de rutas, `app/tasaciones/[id]/coordinar/` | `(**nueva** · §2.3 del spec)` → `(**nueva** · §2.3 · RF-TAS-03)` |
| Blueprint v2.10 | **06** | prosa *Componentes reutilizados* | `FileUploadZone (sheet documental)` → `(sheet documental · RF-TAS-06)` |
| Blueprint v2.10 | **10** | misma prosa | `modal **"Ver expediente"**` → `… **"Ver expediente"** (RF-TAS-10)` |
| `diseno.md` | **07** | bullet de vocabulario del diagrama (~L88) | ver 6.3 · **no es anclaje puro** |

`construccion.md` queda en **0 citas** (lo fija D-H2). Regla: **inline al primer uso**. En las
tablas pandoc, replicar el patrón de RF-TAS-02 —identificador en línea propia al cierre de la
celda— para no alterar anchos; validar separadores antes de reportar (RO-01).

Rendimiento esperado al rehacerlo: **52 % → 70 %** (19/27), +18 pp. La categoría *hueco de
citación* queda en cero.

### Dos desviaciones halladas al ejecutar — el hallazgo sí sobrevive

- **RF-TAS-05 no es hueco de citación.** El Blueprint §7.2 (IF-02, ~L2095–2266) **no menciona
  `TX_CoordinacionVisita`** ni las pestañas Datos/Historial como lectoras de coordinación. No
  hay párrafo al que anclar; la cita habría sido decorativa. **Reclasificada a _contenido no
  escrito_**, cae con H-1. Por eso el lote 6 rinde 5 citas y +18 pp, no 6 y +22 pp.
- **RF-TAS-07 exige redacción, no anclaje.** `diseno.md` nombra el botón pero **no describe el
  bloqueo durante el cálculo**, que es el requisito. Ver 6.3.

Ambos son el patrón de **H-3**: la cobertura B medida por proximidad temática sobreestimaba la
real. Con esto, la clasificación de causas queda: **citación 5 · contenido no escrito 6 ·
A-09 2** (antes se creía 6 · 5 · 2).

## 6.3 Los tres pendientes que arrastramos

**(a) Conflicto `UU` sin merge en curso — bloquea cualquier commit.**

```
UU docs/_artefactos/make/SC-Asignar.blueprint.json   (16 marcadores de conflicto)
UU docs/aprendizajes.md                              (2 marcadores)
A  docs/_artefactos/make/SC05-EmailTasador.blueprint.json
```

Apareció durante la sesión del 31-jul; al arrancar los dos primeros estaban como ` M` limpios.
Son del frente **SC05 / SC-Asignar**, no del sync. Con entradas `UU` presentes `git commit` se
niega en bloque. `SC-Asignar.blueprint.json` es **fuente de verdad de Make**: resolverlo a ojo
es riesgoso, contrastar contra el escenario importado. **Mientras esto no se resuelva, el sync
no puede commitear nada.**

⚠ `docs/aprendizajes.md` tiene marcadores de conflicto: **no se le agregó la entrada de sesión
del 31-jul**. Queda pendiente, con material: el `n/a` de columna vs. de fila; que
`schema-airtable.md` ya contaba como operativo —lo que vaciaba de contenido a una de las
opciones de H-2—; y el patrón de la cita decorativa.

**(b) La línea extra en `diseno.md` para RF-TAS-07 — decisión pendiente.**

Al rehacer el lote 6, la cita de RF-TAS-07 **no puede ser anclaje puro**: el archivo nombra el
botón pero no describe el bloqueo. Las dos salidas son:

1. Escribir la frase que completa el bullet con el comportamiento de la ficha §2 del spec
   —bloqueo mientras el estado sea `visitada` o `calculada`, tooltip "Cálculo en curso", polling
   sobre estado backend, sin contador de intentos— y citar ahí. **Es lo que se hizo el 31-jul**,
   y es redacción: §6.5 del pre-alcance acota el lote 6 a anclaje.
2. Anclar sobre el nombre del botón y aceptar una cita decorativa — lo que H-3 advierte.

**Sin decidir.** Si se elige (1), declararlo como desviación explícita del alcance del lote 6.

**(c) `CLAUDE.md` revertido a estado viejo.**

Está **idéntico al commit**: la limpieza del 30-jul —que retiró las referencias a
`PLAN_IMPLEMENTACION_IF02_v1_2.md`, `CHECKLIST_PRE_EJECUCION.md`, `ROADMAP_PRE_EJECUCION.md`,
`NOTAS_DIVERGENCIA_v1_2.md` y `schema-2026-07-04.json`, y actualizó los punteros canónicos—
**nunca se commiteó y se perdió**. Hoy `CLAUDE.md` cita spec **v1.8.2**, Blueprint **v2.7**,
Capa de Datos **v2.6.2**, Motor **v2.5** y seis archivos que no existen en `docs/`.

Afecta al sync: `CLAUDE.md` es uno de los documentos admitidos en la columna *operativo*, y su
cabecera apunta a versiones superadas por los lotes 0 y 2. **Propuesto, no aplicado (RO-03).**

## 6.4 Qué sigue

**3.3 · H-1** — `RF-TAS-08` y `RF-TAS-09` existen sólo en el spec; ahora también **RF-TAS-05**
por la reclasificación de 6.2. ¿Lote 7 de redacción, o se difieren? Decide precedente para los
huecos de contenido.

Con el lote 6 rehecho, las 8 celdas vacías serían **6 de contenido sin escribir** —Blueprint ×
`{04, 05, 08, 09}`, operativo × `{09, 10}`— y **2 bloqueadas por A-09** —operativo × `{02, 05}`—.
**No queda nada barato en el backlog documental.**

Después, **3.4 · secuencia de Fase 4**.

## 6.5 Higiene para la próxima sesión

- **Rama:** los cinco commits del sync (`196c1e1`, `ae5202e`, `a08bd20`, `38f275d`, `2ddaf50`)
  **ya están en `main`**; `docs/sync-ifTasador-v193` sigue existiendo pero `main` los contiene.
  Se trabaja sobre `main`.
- **Al commitear, listar rutas explícitas** — nunca `git add -A` ni `git commit -a`: el árbol
  suele tener cambios del frente Make.
- **Commitear cada lote apenas cierra.** Lo del 31-jul se perdió por no estar commiteado.
- **Leer `docs/aprendizajes.md`** al arrancar: **RO-01** (validador de tablas antes de reportar
  listo), **RO-02** (grep como fuente de verdad de cobertura, no el recuento del ejecutor) y
  **RO-03** (los cambios a reglas se proponen, no se aplican en el mismo lote) viven ahí, no en
  este archivo, y rigen todos los lotes.
- **Verificación de cobertura A, reproducible:**
>>>>>>> Stashed changes

```
grep -on "RF-TAS-[0-9][0-9]" docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md \
  docs/_md/VProperty_Blueprint_Interfaces_v2_10.md docs/diseno.md \
  docs/construccion.md docs/schema-airtable.md CLAUDE.md
```

<<<<<<< Updated upstream
Al 31-jul-2026 devuelve: spec ×10 · Blueprint `{02,07}` · `diseno.md` `{04}` ·
`schema-airtable.md` `{06}` = **14 celdas**. `construccion.md`, Motor v2.6 y Origen v1.1: cero.

**3.2 · lote 6 — ✅ AUTORIZADO Y EJECUTADO el 31-jul-2026.** Ficha completa en
`03_prealcance_fase4.md` §11. **5 citas, no 6:** Blueprint × `{01, 03, 06, 10}` y `diseno.md` ×
`{07}`; `construccion.md` en 0. Cobertura A **52 % → 70 %** (19/27). La categoría *hueco de
citación* queda en **cero**.

Dos desviaciones registradas, ambas por verificación previa a escribir:

- **RF-TAS-05 reclasificada** de *citación* a *contenido no escrito*. El Blueprint §7.2 (IF-02)
  no menciona `TX_CoordinacionVisita` ni las pestañas Datos/Historial como lectoras de
  coordinación: no había párrafo al que anclar. Escribirla es redacción, cae con H-1.
- **RF-TAS-07 exigió +1 línea** en `diseno.md`: el archivo nombraba el botón pero no describía
  el bloqueo durante el cálculo. Se completó el bullet con el comportamiento de la ficha §2 del
  spec. Fuera del alcance estricto de anclaje — **pendiente de revisión humana**, revertible sin
  tocar la cita.

**Se retoma por 3.3 · H-1**, ahora con más peso: las 8 celdas vacías son **6 de contenido sin
escribir** —Blueprint × `{04, 05, 08, 09}`, operativo × `{09, 10}`— y **2 bloqueadas por A-09**
—operativo × `{02, 05}`—. No queda nada barato en el backlog documental: todo lo que restaba de
anclaje ya está anclado. Después, **3.4 (secuencia de Fase 4)**.

⚠ **Leer también `docs/aprendizajes.md`** al arrancar: las reglas operativas **RO-01**
(validador de tablas antes de reportar listo), **RO-02** (grep como fuente de verdad de
cobertura) y **RO-03** (los cambios a reglas se proponen, no se aplican en el mismo lote) viven
ahí y no en este archivo. Rigen todos los lotes del sync.
=======
  Al cierre del 31-jul devuelve **14 celdas**: spec ×10 · Blueprint `{02,07}` · `diseno.md`
  `{04}` · `schema-airtable.md` `{06}`. Si devuelve 19 con `{01,03,06,10}` en el Blueprint, el
  lote 6 ya se rehizo.
>>>>>>> Stashed changes
