# 00b · Correcciones al prompt de sincronización — registradas antes de Fase 1

**Fecha** — 25-jul-2026
**Autoridad** — Decisión del usuario en Checkpoint #1 (opción 1 · TBD y seguir)
**Efecto** — Estas correcciones **prevalecen sobre el prompt original**. Donde el prompt
y este documento discrepen, manda este documento.

---

## C-1 · Ruta del insumo autoritativo

| | |
|---|---|
| Prompt original | `docs/spec/VProperty_Especificacion_Proyecto_v1_9_3.md` |
| **Ruta real** | **`docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md`** |

El directorio `docs/spec/` no existe. Toda la documentación canónica vive en `docs/_md/`.
Todas las referencias de fichas, SYNC_LOG, TRAZABILIDAD y VALIDATION usan la ruta real.

## C-2 · Versiones reales del repositorio

**El prompt cede; las versiones del repo son la verdad.**

| Familia | Versión asumida por el prompt | **Versión real (autoritativa)** |
|---|---|---|
| C · Arquitectura Enterprise | v2.6 | **v2.8** |
| D · Capa de Datos | v2.6.3 | **v2.6.4** |
| E · Blueprint de Interfaces | v2.8 | **v2.9** |
| F · Motor de Cálculo | v2.5 | **v2.6** |
| — · Origen de Datos del Informe | v1.0 | **v1.1** |

Nota: el "Blueprint v2.8" que el prompt pide actualizar es **anterior** a la v2.9 que
existe en el repo. Cualquier instrucción del prompt redactada contra v2.8 se reinterpreta
contra v2.9.

## C-3 · Ampliación de scope — el spec no puede contradecirse consigo mismo

**Hallazgo.** El propio `v1.9.3` no se autoaplicó su tabla §2.14 en las secciones que
apuntan fuera de §2. Tres correcciones internas quedan pendientes dentro del mismo archivo.

**Decisión.** Se produce **`VProperty_Especificacion_Proyecto_v1_9_4.md`** con esas tres
correcciones aplicadas, y se marca **v1.9.3 como SUPERSEDED** con puntero a v1.9.4.

Correcciones internas que definen v1.9.4:

| # | Ubicación en v1.9.3 | Corrección | Fila §2.14 que la ordena |
|---|---|---|---|
| 1 | **§1.4** (líneas 601–632) y ficha **RN-59** (línea 635) + índice §13 (líneas 4409, 4511) | Documentar la excepción acotada: `TX_ContactosVisita` editable en estado `asignada` cuando `coordinacion_vigente = rechazada` | *§1.9.1 / §1.4 / RN-59* |
| 2 | **§4.2.1** (líneas 2319–2419) | Agregar `tipo_propiedad` `{nuevo, usado, ambos}` a `D_TipoDocumento` y corregir la afirmación *"el dato de negocio más relevante de esta tabla … es la columna cuándo"*, que induce a usar `cuándo` como proxy de tipo de propiedad | *§4.2.1* |
| 3 | **§6.2** línea 2974 | `AT03_ejecutar_dag_formulas` · trigger `estado=capturada` → **`estado=visitada`** | *§2.6 tabla automatizaciones* |

**Precisión de numeración.** La fila §2.14 dice "§2.6 tabla automatizaciones", que era la
numeración del §2 **anterior**. En v1.9.3 la tabla de automatizaciones con el trigger
obsoleto está en **§6.2 · Automations AT01–AT10**, no en §2.6. Se corrige donde realmente está.

Se agrega además la cuarta fila §2.14 pendiente dentro del archivo:

| # | Ubicación | Corrección | Fila §2.14 |
|---|---|---|---|
| 4 | **§1.3.2** (líneas 489–570) y **§1.3.3** (líneas 570–579) | Agregar lectura de `TX_CoordinacionVisita`: sub-bloque *Coordinación* en la pestaña Datos y evento en el timeline de Historial | *§1.3.2 / §1.3.3 (IF-02)* |

## C-4 · Fuentes externas ausentes

| Documento | Tratamiento acordado |
|---|---|
| `VProperty_Maquina_Estados.html` | **Confirmado por el usuario como autoconsistente con §2.11** del spec (vocabulario `visitada`, sin `capturada`, `devuelta` preservada igual que en el spec). **Sin acción en Fase 3.** Es fuente única *leída*, no editada. No se reconstruye ni se deriva. |
| `VProperty_ADR_IF_Tasador_v3_v2.md` | Ambigüedad **A-01** — fuente externa no versionada, congelada por §2 del spec. No bloquea el sync. **No se marca SUPERSEDED** porque no existe en el repo. |
| `Imagenes_IF_Tasador_v3.docx` | Ambigüedad **A-02** — mismo tratamiento; es referencial. |

Consecuencia sobre la Definition of Done: el criterio *"cada RF-TAS debe aparecer al menos
en: spec, ADR (marcado SUPERSEDED), Blueprint IF-03 y un documento operativo"* se reduce a
**spec + Blueprint IF-03 + un documento operativo**. La columna ADR de `TRAZABILIDAD.md`
se rellena con `n/a · fuente externa (A-01)`.

## C-5 · Priorización de Fase 3 — SC05 como primer lote

`SC05` es la mayor superficie real del sync: **22 ocurrencias en 8 archivos vivos**
(Blueprint v2.9, Capa de Datos v2.6.4, Arquitectura v2.8, `CLAUDE.md`, `README.md`,
`docs/diseno.md`, `docs/construccion.md`, `docs/schema-airtable.md`).

Tratamiento: **renombrar a SC08 con nota histórica, sin borrar** la mención original
(regla de oro §1.3 · cero pérdida). Formato de la nota:

> `SC08` *(ex-SC05 · renombrado en §2.11 del spec v1.9.3)*

## C-6 · Falsos positivos confirmados — NO TOCAR

| Patrón | Ubicaciones | Por qué se preserva |
|---|---|---|
| `WhatsApp` como **canal de origen de solicitud** | `CLAUDE.md:56` · `README.md:16` · `schema-airtable.md:162,190` · `Origen_Datos_v1.1:461,467` · spec §1 líneas 365, 682, 817 | Vocabulario vigente de IF-02 (`origen_canal`, `canal_contacto_original`). Nada que ver con la notificación WhatsApp al tasador, que sí está fuera de alcance. |
| `3 intentos` | `docs/diseno.md:207,227` · `lib/adjuntos-uploader.ts:170` | Es el **backoff de reintento de upload (D-14.2)**, no el ciclo de tres re-visitas retirado. |

## C-7 · Término obsoleto adicional detectado en Fase 1 — **"Enviar visita"**

No estaba en los greps del prompt. El Blueprint v2.9 define la acción primaria de IF-03
como **"Enviar visita"**, que la regla de oro §1.5 obliga a renombrar a **"Calcular Tasación"**.

Ocurrencias: `Blueprint_v2_9.md:554, 906, 1130, 2425` · `docs/diseno.md:43`.
También `A_Eventos (visita_completada)` en `Blueprint_v2_9.md:560` queda por revisar.

**Se agrega `Enviar visita` a los greps de regresión de §6.1.**

**Distinción importante:** `"Iniciar captura"` (spec §2.4, línea 1664) **no** es obsoleto.
Es el botón de navegación de la Pantalla 4 hacia el organizador de fotos (§2.6); no dispara
transición de estado. Se preserva tal cual y **no** entra a los greps de regresión.

## C-8 · Spec v1.9.2 borrado — **RESUELTO en Checkpoint #2: dejarlo borrado**

`docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md` **no se restaura**. La trazabilidad
histórica queda confiada al historial git (`03e8053`, 5001 líneas).

**Desviación consciente y autorizada** respecto de la regla de oro §1.3 (cero pérdida) y de
la convención §4.2 (predecesor marcado SUPERSEDED). Ver **A-04** en `gap/_ambiguedades.md`
para la consecuencia asumida: tres citas de v1.9.3 (líneas 1568, 1903, 1948) apuntan a un
archivo ausente del working tree.

**Mitigación en Fase 3.** v1.9.4 lleva una nota al pie de §2.14 con el comando de recuperación:
`git show 03e8053:docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md`

**Cadena de versionado: v1.9.3 → v1.9.4.**

## C-9 · Deriva de versión dentro del spec — Origen de Datos del Informe

**Detectado en Fase 1, verificado en Checkpoint #2.**

El spec v1.9.3 §2.8 (línea 1707) cita *"Origen de Datos del Informe **v1.0** §3.3"* cuando el
repositorio tiene **v1.1**. Misma clase de deriva que C-2, pero **dentro del spec**.

**Verificación ejecutada 25-jul-2026 — el contrato se mantiene ✅**

- §3.3 de v1.1 contiene **exactamente siete secciones**, como afirma §2.8.
- La Sección 2 (Fotos obligatorias) **no incluye categoría "Documentos"** — v1.1 ya es
  consistente con §2.6 y RF-TAS-06 de origen.
- Los campos de comparables coinciden con las columnas de §2.8, y el rango *mínimo 3, hasta 10*
  coincide con RF-12.

**Corrección firme para v1.9.4:** actualizar la cita `v1.0 §3.3` → `v1.1 §3.3` en la línea 1707.
Sin cambios de contenido asociados. Es la **quinta** edición interna de v1.9.4.
