# AUDITORÍA DE ALINEAMIENTO · CU-002 · IF-02

> **Versión**: 2.1 (H-01 cerrado · H-05 corregido · 06-jul-2026)
> **Fecha**: 2026-07-06
> **Panel firmante**: Arquitecto Enterprise · Redactor Técnico · QA Lead
> **Plan de referencia**: `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md` (v1.2 · 06-jul-2026)
> **Fuentes canónicas leídas**: Blueprint v2.7 · Especificación v1.4 · Arquitectura v2.6 · Capa Datos v2.6.2 · Motor Cálculo v2.5 · Origen Datos v1.0
> **Método**: SOLO LECTURA sobre fuentes. Cambios aplicados únicamente en `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md` y este archivo.

---

## 1. Fuentes canónicas leídas

| Archivo fuente (`docs/_md/`) | Versión | Líneas |
|---|---|---|
| `VProperty_Blueprint_Interfaces_v2_7.md` | v2.7 | 4.194 |
| `VProperty_Especificacion_Proyecto_v1_4.md` | v1.4 | 3.236 |
| `Arquitectura_Enterprise_VProperty_v2_6.md` | v2.6 | 5.038 |
| `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_2.md` | v2.6.2 | 8.625 |
| `VProperty_Motor_Calculo_AT01_AT10_v2_5.md` | v2.5 | 1.163 |
| `VProperty_Origen_Datos_Informe_v1.0.md` | v1.0 | 1.109 |

---

## 2. Discrepancias entre fuentes canónicas y plan v1.2

### H-01 · Blueprint v2.8 faltante ✅ CERRADO

**Decisión del propietario (06-jul-2026)**: Blueprint v2.7 se acepta como fuente canónica de trabajo. Las 4 restricciones técnicas de §4.4 han sido inlineadas directamente en el plan v1.2 §1.1 como "Recordatorio operativo · Restricciones técnicas transversales":

1. Tailwind CSS v4 con `@theme` en `globals.css` — sin `tailwind.config.js`.
2. `@base-ui/react`, no Radix. `asChild` → `render` prop + `nativeButton`.
3. Imports nombrados explícitos de shadcn.
4. Sin sticky action bar en presencia de portales `Select`.

Blueprint v2.8 queda como deuda de documentación para incorporar en un CU posterior si se obtiene. No bloquea sesión 1.

---

### H-02 · SC13: conflicto real entre documentos fuente

| Documento | Definición de SC13 |
|---|---|
| **Especificación v1.4** (línea 461) | Notificaciones de reasignación, cambio de prioridad, pausa → email al tasador/destinatario |
| **Arquitectura v2.6** (línea 3047) | `entregar_al_cliente` → Payload Airtable → Gmail (trigger: `estado=aprobada`, IF-05) |
| **Blueprint v2.7** (líneas 920, 3631, 1803) | Make → Gmail con el PDF al cliente (IF-05 "Enviar al cliente") |

El plan v1.2 sigue la Especificación v1.4 y retira SC13 del alcance de IF-02 declarando "la UI no lo invoca". Esto es correcto para la Especificación, pero Arquitectura y Blueprint definen SC13 como "entregar_al_cliente" (IF-05), función completamente distinta que tampoco invoca IF-02.

En ambas interpretaciones SC13 queda fuera del alcance de CU-002. El problema es que los documentos fuente se contradicen sobre qué hace SC13.

**Impacto**: Bajo para IF-02 (SC13 fuera de alcance en cualquier interpretación). Alto para IF-05 en CU posterior: el Integrador Make debe aclarar qué función tendrá SC13 antes de provisionarlo.
**Acción**: Crear `docs/NOTAS_DIVERGENCIA_v1_2.md` registrando el conflicto. El plan v1.2 prevalece para CU-002.

---

### H-03 · SC05 / notificación de tasador: tres numeraciones distintas

| Documento | Qué llama al escenario de notificación al tasador |
|---|---|
| **Motor Cálculo v2.5** (línea 572) | AT02 "siguiente paso: Make **SC03** notifica al tasador" |
| **Arquitectura v2.6** Lista B | "SC05 ejecutar cadena → AT03" (trigger: `estado=visitada`, no `asignada`) |
| **Blueprint v2.7** (líneas 522, 887, 1803, 3533) | **SC05** (Make → Gmail) notifica al tasador cuando `estado=asignada` |

El plan v1.2 sigue Blueprint v2.7 (SC05 = notificación al tasador en `asignada`). Esto es la interpretación más reciente y coherente. El Motor Cálculo v2.5 usa "SC03" para la misma función, lo que refleja una numeración antigua superada por Arquitectura v2.6. La Arquitectura v2.6 muestra SC05 como un escenario migrado a AT03 (trigger `visitada`), pero eso corresponde al antiguo SC05 de Make, no al nuevo.

**Impacto**: Antes de provisionar SC05 en Make, el Integrador debe confirmar que el código "SC05" está libre y no fue reutilizado en ningún escenario activo.
**Acción**: Agregar nota en BQ-3-b del CHECKLIST exigiendo verificación del código SC05 antes del provisionamiento.

---

### H-04 · campo trigger para AT02 · PENDIENTE DE CREACIÓN

**Estado**: Abierto · P0

El botón "Pasar a asignada" necesita un campo trigger (checkbox) en `TX_Solicitudes` para disparar AT02. Ningún documento fuente (Capa Datos v2.6.2, Motor Cálculo v2.5, Blueprint v2.7) define el nombre exacto de ese campo.

**Acción**: el Ingeniero Airtable debe inspeccionar la configuración actual de AT02 en Airtable Automations, confirmar el nombre del campo trigger y crearlo en `TX_Solicitudes` antes de construir IF-02.

---

### H-05 · `disponible` y `casos_en_curso` en M_Tasadores: plan contradice tres fuentes

| Documento | Estado de estos campos |
|---|---|
| **Capa Datos v2.6.2** (líneas 859–868) | `disponible` (Formula) y `casos_en_curso` (Count link) **están definidos** |
| **Motor Cálculo v2.5** (PASO 3 y 4) | Los usa explícitamente: `WHERE disponible = TRUE`, `ORDER BY casos_en_curso ASC` |
| **Blueprint v2.7** §7.2 (líneas 2097, 2120) | "disponible=true, zona compatible; despliega carga (casos_en_curso/capacidad)" |
| **Plan v1.2 §1.3 nota** | "los campos disponible y casos_en_curso **no existen**; la disponibilidad se deriva de `capacidad_activa` en runtime" |

La causa probable: el MCP snapshot del 04-jul-2026 no encontró estos campos en el Airtable real porque aún no se crearon. Las tres fuentes de diseño los definen explícitamente.

**Impacto**: El Route Handler `/api/tasadores` que implementará el selector inteligente debe usar `disponible = TRUE` (campo formula) cuando el campo exista. Si no existe en Airtable, debe derivarlo. El plan adapta la lógica pero diverge del diseño canónico.
**Acción**: El Ingeniero Airtable debe crear `disponible` (formula: `IF(casos_en_curso < capacidad_activa, TRUE, FALSE)`) y `casos_en_curso` (Count link a TX_Solicitudes activas) en M_Tasadores junto con los campos de D-08. Agregar al CHECKLIST §2.

---

### H-06 · RF-09: expansión de alcance respecto a las fuentes canónicas

| Documento | Cuándo y dónde se extrae con Claude |
|---|---|
| **Arquitectura v2.6** SC07 (línea 3041) | Airtable dispara cuando `estado=visitada` (post IF-03 tasador) |
| **Origen Datos v1.0** (líneas 160, 275) | Extracción de PDFs aportados por el tasador |
| **Plan v1.2** RF-09 §1.4 | Upload en **P3 de IF-02** o desde `TabAdjuntos` — antes de la visita |

El plan eleva SC07 a RF-09 y lo mueve a IF-02 (adjuntos iniciales del cliente). Los documentos fuente lo ubican post-visita (IF-03). Esto es una decisión documentada (D-05 revocada) y válida, pero los docs fuente no la reflejan.

**Impacto**: El escenario Make de RF-09 es nuevo y no colisiona con el SC07 existente (que sigue activo para IF-03 en fases posteriores). Hay que asegurarse de que el Integrador Make no reutilice el código "SC07" y cree uno nuevo para RF-09.
**Acción**: Registrar en `docs/NOTAS_DIVERGENCIA_v1_2.md` que RF-09 amplía SC07 a IF-02 por decisión D-05-revocada.

---

### H-07 · `n_operacion_cliente`: tipo Single line text vs Number

| Fuente | Tipo definido |
|---|---|
| **Capa Datos v2.6.2** (línea 2085) | `Single line text` |
| **Plan v1.2 §1.3** | "Tipo number en el schema real" |

La discrepancia refleja que el Airtable real tiene el campo como número aunque el diseño lo define como texto. El plan sigue el schema real (MCP).

**Impacto**: El tipo TS en el Route Handler debe ser `number` (plan) y puede recibir texto del cliente si se usa el campo directamente. Requiere validación de parseo.
**Acción**: El `schema-airtable.md` debe documentar explícitamente esta divergencia entre diseño (text) y Airtable real (number).

---

## 3. Alineamiento de documentos de apoyo vs plan v1.2

| Archivo | Estado | Discrepancia principal | Acción |
|---|---|---|---|
| `README.md` | **Desalineado** | Boilerplate v0.dev genérico; sin mención de CU-002, VProperty, Clerk, Railway, Airtable ni ruta `/consola`. | Actualizar |
| `docs/CHECKLIST_PRE_EJECUCION.md` | **Desalineado** | Versión 1.1. SC13 en BQ-3 como bloqueador activo (plan v1.2 lo retira). Ruta de snapshot errónea (`docs/if02/plan/snapshots/` vs `docs/`). Variables con nombres incorrectos (`MAKE_SIGNING_SECRET`, `MAKE_WEBHOOK_SC13`). D-08 marcada como abierta. No menciona RF-09 ni BQ-3-c. No incluye `solicitar_asignacion` ni `disponible/casos_en_curso` como campos a crear. | Actualizar |
| `docs/CLAUDE_MD_ADENDA.md` | **Desalineado** | Versión 1.1. Estructura de rutas anidada (`docs/if02/plan/`) que no existe. Comando de anexado con ruta incorrecta. Variables `MAKE_WEBHOOK_SC13` y `MAKE_SIGNING_SECRET` (nombres incorrectos). Referencias a plan v1.1. No menciona RF-09 ni `ExtraccionStatusBadge`. | Actualizar |
| `docs/ROADMAP_PRE_EJECUCION.md` | **Desalineado** | Versión 1.1. Fase 0: D-01..D-08 como pendientes (todas aprobadas en plan v1.2). Paso 3B.3: crea SC13 (fuera de alcance). Rutas anidadas incorrectas. No incluye RF-09 ni BQ-3-c. | Actualizar |
| `docs/DIAGNOSTICO_ESTADO_ACTUAL.md` | **Desalineado** | Fecha 2026-07-05. El "primer paso concreto" (crear `lib/airtable-client.ts` + Route Handler) ya fue ejecutado en commits `0ca128a` y `0b92b46`. Referencias a `doc_este_proyecto/` (path eliminado). Variable `MAKE_SIGNING_SECRET` (nombre incorrecto). | Actualizar |
| `package.json` | **Desalineado** | `"name": "my-project"` (debería ser `vproperty-ejecutiva`). Faltan scripts: `typecheck`, `format`, `test`, `test:e2e` (declarados canónicos en ADENDA). | Actualizar |
| `texto diagnostico INICIAL.txt` | **Obsoleto** | Prompt de trabajo previo al plan v1.1. Referencia `doc_este_proyecto/` (eliminado). No es un artefacto documental. | Marcar como histórico |
| `texto_para_docConsistentes.txt` | **Obsoleto** | Prompt de trabajo (el de esta auditoría). No es un artefacto documental. | Marcar como histórico |

---

## 4. Archivos faltantes

| Archivo esperado | Bloqueador sesión 1 | Referencia en plan v1.2 |
|---|---|---|
| `CLAUDE.md` (raíz del repo) | **Sí** | `CLAUDE_MD_ADENDA.md` se anexa a él. Sin él Claude Code no tiene instrucciones de sesión. |
| `docs/diseno.md` | **Sí** | §1.7.1: "fuente de verdad permanente" a leer al inicio de cada sesión. |
| `docs/construccion.md` | **Sí** | §1.7.1: guía operativa por RF, prompts base, criterios de aceptación. |
| `docs/schema-airtable.md` | **Sí** | §1.7.1: snapshot MD legible con TABLE_IDs, FIELD_IDs, campos de D-08 y divergencias H-04/H-05/H-07. |
| `docs/VProperty_Blueprint_Interfaces_v2_8.*` | **Sí** | Especificación v1.4 §1.8 lo designa como fuente de las restricciones §4.4. |
| `docs/NOTAS_DIVERGENCIA_v1_2.md` | No | Requerido para registrar H-02, H-03 y H-06 (conflictos entre fuentes que el plan v1.2 resuelve). |
| `.env.example` | No | Buena práctica; variables documentadas en ADENDA pero no en archivo versionado. |

---

## 5. Tabla resumen de contadores

| Categoría | Cantidad |
|---|---|
| Discrepancias fuentes canónicas vs plan v1.2 | **7** (H-01 a H-07) |
| — ✅ Cerradas | 2 (H-01 inlineado · H-05 corregido) |
| — Críticas pendientes (bloqueadoras de construcción) | 1 (H-04) |
| — Importantes (decisiones a confirmar) | 2 (H-02, H-03) |
| — Menores (documentar y seguir) | 2 (H-06, H-07) |
| Documentos de apoyo desalineados | **5** |
| Documentos de apoyo obsoletos | **2** |
| Archivos faltantes bloqueadores de sesión 1 | **5** |
| Archivos faltantes no bloqueadores | **2** |

---

## 6. Archivos de código que NO fueron tocados

> Confirmación de integridad: los archivos listados fueron identificados en el repositorio pero no leídos ni modificados. El software queda intacto.

- `app/globals.css`
- `app/layout.tsx`
- `components/console/app-header.tsx`
- `components/console/document-checklist.tsx`
- `components/console/file-upload-zone.tsx`
- `components/console/new-request-sheet.tsx`
- `components/console/reasignar-tasador-dialog.tsx`
- `components/console/solicitud-detail.tsx`
- `components/console/solicitud-list.tsx`
- `components/console/status-badges.tsx`
- `components/ui/` (todos los archivos)
- `components.json`
- `lib/console-data.ts`
- `lib/utils.ts`
- `lib/validators/nueva-solicitud-interna.ts`
- `next.config.mjs`
- `postcss.config.mjs`
- `tsconfig.json`
- `pnpm-lock.yaml`

---

## 7. Prioridad de acciones antes de sesión 1

| Prioridad | Acción | Owner |
|---|---|---|
| ✅ — | ~~Obtener Blueprint v2.8~~ — restricciones inlineadas en plan v1.2 §1.1 (H-01 cerrado) | — |
| 🔴 P0 | Crear campo trigger (checkbox) en `TX_Solicitudes` para disparar AT02; nombre exacto a confirmar con Ingeniero Airtable (H-04) | Ingeniero Airtable |
| 🟠 P1 | Crear `CLAUDE.md` base + anexar `CLAUDE_MD_ADENDA.md` actualizada | Redactor Técnico |
| 🟠 P1 | Crear `docs/diseno.md`, `docs/construccion.md`, `docs/schema-airtable.md` | Panel / Arquitecto |
| 🟠 P1 | Crear campos `disponible` y `casos_en_curso` en M_Tasadores (H-05) | Ingeniero Airtable |
| 🟡 P2 | Actualizar CHECKLIST, ADENDA, ROADMAP, DIAGNOSTICO a v1.2 | Redactor Técnico |
| 🟡 P2 | Crear `docs/NOTAS_DIVERGENCIA_v1_2.md` (H-02, H-03, H-06) | Redactor Técnico |
| 🟢 P3 | Actualizar `README.md` y `package.json` | Redactor Técnico |
| 🟢 P3 | Mover archivos `.txt` obsoletos a `docs/_archivo/` | Redactor Técnico |
