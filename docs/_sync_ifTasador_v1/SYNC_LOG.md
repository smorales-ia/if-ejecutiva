# SYNC_LOG — bitácora viva de sincronización con §2 spec v1.9.3

**Insumo autoritativo** — `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` §2 (líneas 1574–1953)
**Rama base** — `docs/sync-ifTasador-v193` *(pendiente de crear · Checkpoint #3)*
**Inicio** — 25-jul-2026

---

## Estado global

| Fase | Estado | Entregables |
|---|---|---|
| Fase 0 · Descubrimiento | ✅ **completa** | `00_inventario.md` · `01_clasificacion.md` · `00b_correcciones_al_prompt.md` |
| Fase 1 · Análisis de brecha | ✅ **completa** | 12 fichas en `gap/` + `gap/_sin_cambio.md` + `gap/_ambiguedades.md` |
| Fase 2 · Plan de ramas | ✅ **completa** · D-A a D-D firmadas | `02_plan_fase3.md` |
| Fase 3 · Ejecución | 🟡 **en curso** — lotes 0 y 2 completos; **lote 1 bloqueado por A-10 y lote 3 por A-09**, ambos por trabajo fuera del repo | ver tabla de lotes |
| Fase 4 · Validación | ⏸ no iniciada | `TRAZABILIDAD.md` · `VALIDATION.md` |

**Punto de retoma documentado en `RESUME.md`.** Última actualización: 25-jul-2026, al cierre
de la bitácora.

> **Los lotes 2 y 3 comparten commit.** Se fusionaron junto con la bitácora en `ae5202e`,
> de modo que ese sha aparece en las filas de ambos lotes. La granularidad de un commit por
> lote no se cumplió en esta tanda; la trazabilidad se sostiene por este registro, no por el
> historial de git.

---

## Estado de los lotes

| Lote | Descripción | Estado | Commit |
|---|---|---|---|
| **0** | Bump de versión: 4 archivos nuevos + 4 predecesores SUPERSEDED | ✅ **COMPLETADO** · 25-jul-2026 | `196c1e1` |
| **1** | SC05 → SC08 (transversal) | 🔴 **BLOQUEADO por A-10** — no ejecutar hasta decisión humana. Ver `RESUME.md` | — |
| **2** | Spec v1.9.4 · 5 correcciones internas de §2.14 | ✅ **COMPLETADO** · 25-jul-2026 — adelantado sobre el lote 1 con A-10 abierto (autorización del usuario) | `ae5202e` |
| **3** | (i) Delta §2.12 · (ii) §22 alias A-05 · (iii) `CODE_INCONSISTENCIES.md` | 🟡 **PARCIAL** · 25-jul-2026 — **(ii) y (iii) completos**; **(i) BLOQUEADO por A-09**: `TX_CoordinacionVisita` no existe en Airtable y sin TABLE_ID ni FIELD_IDs no se puede escribir `schema-airtable.md`. Ver `gap/_ambiguedades.md` | `ae5202e` |
| **4** | Blueprint v2.10 + Arquitectura v2.9 · puntos 4.1–4.6 | 🟡 **PARCIAL** · 25-jul-2026 — 4.1, 4.2, 4.4, 4.5, 4.6 completos; **4.3 sólo en su mitad**: la máquina de estados sí, la narrativa de ejemplo **no requiere cambio** (su vocabulario de estados ya es el oficial; sus únicos defectos son de numeración `SC`, fuera de alcance) | `a08bd20` |
| **5** | Operativos + Motor · puntos 5.1–5.5 | 🟡 **PARCIAL** · 25-jul-2026 — 5.1–5.5 completos; **4 ítems diferidos**: SC13 acotado a IF-02 y `SC15` en Origen de Datos (`DEP-EXT:A-10`), 3 campos de `TX_Solicitudes` en `CLAUDE.md` y lectura de `TX_CoordinacionVisita` en operativos (`DEP-EXT:A-09`). `CLAUDE.md` y Origen de Datos **no se abrieron** | `<sha lote 5>` |

### Nota sobre el orden de lotes 1 y 2

El plan original (C-5) puso el lote 1 primero por ser el de mayor superficie. A-10 lo
bloqueó. El lote 2 **no depende del lote 1**: sus cinco correcciones viven en §1, §4, §6.2
y §13 del spec y ninguna toca la numeración de escenarios Make. Puede adelantarse sin
comprometer la resolución de A-10.

**Resuelto el 25-jul-2026:** el usuario autorizó adelantar el lote 2 dejando A-10 abierto.
Ejecutado en `ae5202e`. Verificado que el diff no contiene ninguna ocurrencia de `SC05`,
`SC08` ni `SC13`, de modo que la decisión de A-10 sigue sin condicionar y el lote 1 puede
ejecutarse después sin conflicto con este commit.

---

## Registro de archivos tocados

| Archivo | Familia | Lote | Fecha | Commit | RF/RN afectados | Rol firmante | ✓ |
|---|---|---|---|---|---|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md` (nuevo) | A | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md` (nuevo) | E | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_5.md` (nuevo) | D | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md` (nuevo) | C | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | A | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md` | E | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | D | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md` | C | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md` | A | 2 | 25-jul-2026 | `ae5202e` | RN-59 (excepción acotada) · RF-TAS-04 · RF-TAS-05 · RF-TAS-06 · AT03 · P-4 · P-5 | EA + PM + DE + UX + FE | ✓ |
| `docs/schema-airtable.md` (§22 nueva) | H | 3 (ii) | 25-jul-2026 | `ae5202e` | A-05 · RF-TAS-06 · P-5 | DE | ✓ |
| `docs/CODE_INCONSISTENCIES.md` (nuevo) | H | 3 (iii) | 25-jul-2026 | `ae5202e` | CI-001 · A-05 | DE | ✓ |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md` | E | 4 | 25-jul-2026 | `a08bd20` | RF-TAS-01..10 · RF-TAS-02 · RF-TAS-07 · D-B · P-3 · **DEP-EXT:A-09 ×2** (L2524 `horas_restantes` · L2560 `TX_CoordinacionVisita`) | EA + UX + FE | ✓ |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md` | C | 4 | 25-jul-2026 | `a08bd20` | máquina de estados §2.11 · 7 pantallas IF-03 · D-B · P-3 · **DEP-EXT:A-09 ×1** (L1280 `TX_CoordinacionVisita`) | EA | ✓ |
| `docs/diseno.md` | F | 5 | 25-jul-2026 | `<sha lote 5>` | vocabulario §2.11 · `devuelta` DEPRECATED · RN-59 excepción acotada · RF-TAS-04 (citada) | UX + PM | ✓ |
| `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md` | F | 5 | 25-jul-2026 | `<sha lote 5>` | `devuelta` DEPRECATED · canal único correo (§1.7) · **en sitio sin bump + changelog al pie (§3 del plan)** | EA + DE | ✓ |

**Corrección de punteros del checklist en el lote 5.** 5.5 aplicado en `docs/diseno.md:287`
(enunciado normativo de la excepción) y `docs/diseno.md:608` (REGLA C remite a ella); el
puntero original `diseno.md:256` y la inclusión de `construccion.md` resultaron incorrectos,
corregidos en ejecución. `construccion.md` no enuncia RN-59 como norma —su única mención está
en una fila de bitácora histórica de progreso— y por eso no se abrió.

**Nombres §22 actualizados vs. aprobación previa:** `tipoPropiedad` y `tipoPropiedadNuevoUsado`
adoptados de código existente vía §22.4 paso 2 (reemplazan `tipoInmueble` y
`condicionPropiedad`); sólo `condicionPropiedadAplicable` es acuñación nueva.

**Integridad del lote 0 verificada:** `cmp` byte a byte entre original y copia, más `diff`
de cuerpos contra `HEAD`. Cero cambios de contenido; sólo cabeceras.

**Integridad del lote 4 verificada:** 229 líneas nuevas en 2 archivos. Validador de columnas
sobre todas las líneas del diff: **cero** violaciones en tablas pandoc y **cero** desalineaciones
en cajas grid (ancho 73). Greps de regresión: `"Enviar visita"` en cero; `capturada` en una sola
ocurrencia, que es la nota que declara su inexistencia; `"Calcular Tasación"` en 6. Ningún `SC`
modificado —`SC06` aparece en el diff sólo arrastrado en una línea editada, balance 1:1—.
Predecesores congelados (`Blueprint_v2_9`, `Arquitectura_v2_8`, `spec_v1_9_3`, `Capa_Datos_v2_6_4`)
sin cambios. **Marca `DEP-EXT:A-09` en 3 puntos**, sin menciones huérfanas.

> **Convención de la marca DEP-EXT.** Comentario HTML de una línea, **fuera de toda tabla** para
> no romper la alineación pandoc. Formato fijo:
> `<!-- DEP-EXT:<ambigüedad> · <entidad o campo> · pendiente creación Airtable · no verificada <fecha> · declarada en spec <versión> §<sección> -->`
> Cuando A-09 se resuelva, localizar todas las referencias con `grep -rn "DEP-EXT:A-09" docs/`.
>
> **Las 3 marcas del lote 4, agrupadas por dependencia externa (A-09):**
>
> | # | Archivo:línea | Objeto bloqueado | Punto del lote |
> |---|---|---|---|
> | 1 | `Arquitectura_Enterprise_VProperty_v2_9.md:1280` | `TX_CoordinacionVisita` (entidad) | 4.4 · inventario de entidades |
> | 2 | `VProperty_Blueprint_Interfaces_v2_10.md:2560` | `TX_CoordinacionVisita` (entradas/salidas) | 4.4 · IF-03 §7.3 |
> | 3 | `VProperty_Blueprint_Interfaces_v2_10.md:2524` | `horas_restantes` (campo fórmula) | 4.5 · semáforo SLA |
>
> Las tres bloquean por la misma causa —schema declarado en §2.12 del spec v1.9.3 y no creado en
> Airtable—, no por tres causas distintas. Se resuelven todas juntas cuando A-09 cierre.

**Integridad del lote 2 verificada:** 171 inserciones · 14 supresiones en un solo archivo.
Las cuatro tablas pandoc tocadas (§1.3.2 bloques · ficha RN-59 · §6.2 AT01–AT10 · índice §13)
validadas por script de alineación de columnas: cero celdas cruzando el separador. Greps de
regresión: `capturada` sin ocurrencias vivas —quedan sólo los enunciados de deprecación y la
nota histórica—; `Informe v1.0 §3.3` en cero. Ningún identificador histórico renumerado
(`AT03` y `RN-59` reaparecen idénticos). Predecesor v1.9.3 sin cambios.

---

## Checklist de las ediciones obligatorias §5.1 del prompt

Estado al cierre de Fase 2. Ninguna ejecutada aún; la columna *Destino* indica dónde se aplicará.

### Máquina de estados y vocabulario

| Edición | Destino | Estado |
|---|---|---|
| `capturada` → `visitada` | spec §6.2 línea 2974 (**única ocurrencia viva del repo**) | ✅ **lote 2** · `ae5202e` |
| `devuelta` DEPRECATED con nota canónica | Capa Datos (2018, 5893) · Blueprint (413, 417, 602, 633, 925, 936, 948, 2465, 2576, 2603, 2660, 3717, 3755) · Arquitectura (3761, 3764, 3771) · Motor (303, 361) · schema-airtable (153) · diseno (57) | ⏸ lotes 3–5 |
| Botón → **"Calcular Tasación"** | Blueprint (554, 906, 1130, 2425) · diseno (43) — término real hallado: **"Enviar visita"** (C-7) | ⏸ lotes 4–5 |
| Eliminar "AlertDialog dual" → autosave + botón | **cero ocurrencias fuera del spec**, que ya lo enuncia correctamente (1714) | ✅ nada que hacer |

### Coordinación de visita (§2.3)

| Edición | Destino | Estado |
|---|---|---|
| Ruta `app/tasaciones/[id]/coordinar/` en Blueprint IF-03 | Blueprint — hoy **cero rutas de IF-03 documentadas** | ⏸ lote 4 |
| `TX_CoordinacionVisita` con los 11 campos de §2.12 | Capa de Datos §19.x + schema-airtable | ⏸ lote 3 |
| `coordinacion_vigente`, `observacion_rechazo_tasador`, `horas_restantes` | Capa de Datos §19.1 + schema-airtable + CLAUDE.md | ⏸ lotes 3, 5 |
| 2 plantillas en `C_Plantillas` | Capa de Datos §12.2 + schema-airtable | ⏸ lote 3 |
| SC13 sirve ambas plantillas · **no** escenario nuevo | Capa de Datos + CLAUDE.md (acotar la prohibición a IF-02) | ⏸ lotes 3, 5 |

### RN-59 con excepción acotada

| Edición | Destino | Estado |
|---|---|---|
| Ficha RN-59 + §1.4 + índice §13 | spec v1.9.4 (635, 601–632, 4409, 4511) | ✅ **lote 2** · `ae5202e` — se amplió a §1.9.1 (FUT-EJ-06 y FUT-EJ-07), que §2.14 fila 10 también nombra y afirmaban lo contrario |
| Verificar que ningún otro doc afirme la regla vieja sin excepción | diseno.md (256) · construccion.md | ⏸ lote 5 |

### Fotos vs Documentos (§2.6)

| Edición | Destino | Estado |
|---|---|---|
| Eliminar categoría "Documentos" del organizador | **cero ocurrencias en el repo.** Origen de Datos v1.1 §3.3 Sección 2 ya lista 22 categorías sin "Documentos" (verificado C-9) | ✅ nada que hacer |
| Sheet documental filtrado por `tipo_propiedad` | spec §4.2.1 + Capa de Datos + Blueprint | 🟡 **spec ✅ lote 2** (`ae5202e`) · pendientes Capa de Datos y Blueprint (lotes 3–4) |
| `tipo_propiedad` en `D_TipoDocumento` | Capa de Datos + schema-airtable + spec §4.2.1 | 🟡 **spec ✅ lote 2** (`ae5202e`) · pendientes Capa de Datos y schema-airtable (lote 3) |
| Corregir que `cuándo` **no** es proxy de tipo de propiedad | spec §4.2.1 línea 2322 | ✅ **lote 2** · `ae5202e` |

### Automatizaciones

| Edición | Destino | Estado |
|---|---|---|
| AT03 trigger `estado = visitada` | spec §6.2 (2974). **Motor v2.6 ya correcto** en 36, 157, 678, 688 | ✅ **lote 2** · `ae5202e` |
| SC08 y SC09 con sus triggers | Capa de Datos + Blueprint + Arquitectura | ⏸ lotes 3–4 |
| SC02 fusionado en SC01 → retirado | Capa de Datos (3619, 4820) | ⏸ lote 3 |
| SC04 retirado (asignación manual) | Capa de Datos (1998, 5707, 5944, 7006) · Arquitectura (3158, 3749, 3807) | ⏸ lotes 3–4 |
| SC05 → SC08 | 8 archivos · **38 ocurrencias** (la cifra 22 era errónea — ver A-10) | 🔴 **BLOQUEADO · A-10** |
| SC15 retirado (→ AT08) | Capa de Datos (5 de UF) · Arquitectura (3122, 3307) · Blueprint (3585) · Origen Datos (1034). ⚠ **no** las 2 de backups | ⏸ lotes 3–5 |
| Constraint blanda `(solicitud_id, fecha_respuesta_truncada_al_minuto)` | Capa de Datos §19.x | ⏸ lote 3 |

### UI · vocabulario y comportamiento

| Edición | Destino | Estado |
|---|---|---|
| Chips "Hoy" y "Por coordinar" | Blueprint IF-03 | ⏸ lote 4 |
| Badge "Esperando contacto de ejecutiva" | Blueprint IF-03 | ⏸ lote 4 |
| Semáforo + `horas_restantes` numérico | Blueprint + Capa de Datos | ⏸ lotes 3–4 |
| Eliminar "franja roja", "3 re-visitas", "último intento" | **cero ocurrencias fuera del spec**, que ya las retira (1582, 1794) | ✅ nada que hacer |
| Eliminar lenguaje de IA en textos de UI | **cero violaciones.** El único hit es la prohibición correctamente enunciada (spec 1698) | ✅ nada que hacer |
| Botón "Rechazar" con nueva semántica | Blueprint IF-03 (Pantalla 7) | ⏸ lote 4 |
| "Ver expediente" como modal reutilizado | Blueprint IF-03 | ⏸ lote 4 |

### Herencias desde IF-02 v1.9 (preservar)

| Herencia | Verificación | Estado |
|---|---|---|
| RN-49 · estado de conservación heredado, catálogo de 6 valores | Presente en Capa de Datos §19.1 (`estado_conservacion` singleSelect `nuevo/sin_uso/bueno/normal/malo/deficiente`) ✅ | preservar |
| RN-45 · superficies con origen y adjunto de respaldo | Presente en spec §1.3.2 (bloque Unidades) ✅ | preservar |
| RN-50 · ampliaciones con marca de regularizable | Presente en spec §1.3.2 y Blueprint (1721) ✅ | preservar |

### Punto abierto P-3 (Next.js)

| Edición | Destino | Estado |
|---|---|---|
| Nota de punto abierto donde se fije Next.js 14 (RT-01) | Blueprint + Arquitectura + spec §1.8 | ⏸ lote 4 |
| **No** cambiar RT-01 | — | 🔒 prohibido hasta sign-off PM + EA + FE |

---

## Desviaciones autorizadas respecto del prompt

| # | Desviación | Autorizada en |
|---|---|---|
| C-1 | Ruta del insumo: `docs/_md/`, no `docs/spec/` | Checkpoint #1 |
| C-2 | Versiones reales del repo prevalecen sobre las del prompt | Checkpoint #1 |
| C-3 | Ampliación de scope: se produce v1.9.4 | Checkpoint #1 |
| C-4 | Familias B y G vacías; DoD reducida a spec + Blueprint + operativo | Checkpoint #1 |
| C-7 | "Enviar visita" agregado a los greps de regresión | Fase 1 |
| **C-8** | **v1.9.2 no se restaura** — desviación de §1.3 y §4.2 | Checkpoint #2 |
| C-9 | Cita `Origen de Datos v1.0 §3.3` → v1.1 (verificado, contrato intacto) | Checkpoint #2 |
| §4.1 | Sub-ramas por **lote**, no por familia (el lote 1 es transversal) | Checkpoint #2 |
| §4.1 | **Lote 0 habilitante** antepuesto: el bump de versión debe preceder al lote 1 para no modificar los predecesores que quedan congelados como SUPERSEDED | Checkpoint #3 (D-A) |

---

## Decisiones firmadas · Checkpoint #3

| # | Resolución | Firma |
|---|---|---|
| **D-A** | Versión nueva para los tres canónicos: Blueprint **v2.10** · Capa de Datos **v2.6.5** · Arquitectura **v2.9** | EA |
| **D-B** | Métrica de tasa de devolución: **marcar, no recalcular**. Se eleva a firma PM aparte | PM + QA |
| **D-C** | `A_Eventos.visita_completada` **conserva su literal** (A-06 cerrada) | DE + INT |
| **D-D** | SC08/SC09 **no** entran al Motor de Cálculo (cubre AT01–AT10, Airtable) | EA |
