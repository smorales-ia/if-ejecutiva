# NOTAS DE DIVERGENCIA · CU-002 · IF-02 · v1.2

> **Fecha**: 2026-07-06  
> **Panel firmante**: Arquitecto Enterprise · Redactor Técnico · QA Lead  
> **Propósito**: registrar los conflictos entre fuentes canónicas que el plan v1.2 resuelve con una decisión explícita. Los documentos fuente en `docs/_md/` **no se editan**; este archivo documenta que el plan v1.2 prevalece para IF-02 (CU-002) en cada caso.

---

## H-02 · SC13: definición contradictoria entre fuentes canónicas

| Documento | Definición de SC13 |
|---|---|
| **Especificación v1.4** (línea 461) | Notificaciones de reasignación, cambio de prioridad, pausa → email al tasador/destinatario |
| **Arquitectura v2.6** (línea 3047) | `entregar_al_cliente` → Payload Airtable → Gmail (trigger: `estado=aprobada`, IF-05) |
| **Blueprint v2.7** (líneas 920, 3631, 1803) | Make → Gmail con el PDF al cliente (IF-05 "Enviar al cliente") |

**Resolución en plan v1.2**: SC13 queda **fuera del alcance de CU-002** en ambas interpretaciones.

- Según Especificación v1.4: SC13 notifica reasignaciones/cambios (válido), pero IF-02 no lo invoca en este CU.
- Según Arquitectura v2.6 y Blueprint v2.7: SC13 = "entregar al cliente" (IF-05), función completamente distinta que tampoco invoca IF-02.

**Las acciones de reasignación, cambio de prioridad y pausa** en IF-02 actualizan Airtable y escriben `A_Eventos`, pero **no envían email** en CU-002. Esto queda registrado como deuda técnica para un CU posterior.

**Alerta para IF-05**: antes de provisionar SC13 en Make, el Integrador debe resolver qué función tendrá definitivamente (notificación interna vs. entrega al cliente), ya que los tres documentos fuente son incompatibles. No usar el código "SC13" sin esta aclaración previa.

---

## H-03 · SC05 / notificación al tasador: tres numeraciones distintas

| Documento | Código para "notificación al tasador cuando `estado=asignada`" |
|---|---|
| **Motor Cálculo v2.5** (línea 572) | **SC03** — "siguiente paso: Make SC03 notifica al tasador" |
| **Arquitectura v2.6** Lista B | **SC05** — "ejecutar cadena → AT03" (trigger: `estado=visitada`, no `asignada`) |
| **Blueprint v2.7** (líneas 522, 887, 1803, 3533) | **SC05** — Make → Gmail, notifica al tasador cuando `estado=asignada` |

**Resolución en plan v1.2**: se sigue **Blueprint v2.7** (SC05 = notificación al tasador en `estado=asignada`). Es la fuente más reciente y la más coherente con el flujo IF-02.

- El código "SC03" en Motor Cálculo v2.5 refleja una numeración antigua superada.
- La referencia de Arquitectura v2.6 a SC05 con trigger `visitada` corresponde al antiguo SC05 de Make, no al nuevo.

**Alerta para el Integrador Make**: antes de provisionar SC05, verificar que el código "SC05" esté libre en la organización Make 1594725 y no fue reutilizado en ningún escenario activo. Si ya existe un escenario SC05 con otro propósito, crear uno nuevo con código alternativo (ej. `SC05-b`) y documentarlo en `Z_EscenariosMake`.

---

## H-06 · RF-09: expansión de SC07 a IF-02 por decisión D-05-revocada

| Documento | Cuándo y dónde se ejecuta la extracción con Claude API |
|---|---|
| **Arquitectura v2.6** SC07 (línea 3041) | Airtable dispara cuando `estado=visitada` (post IF-03 tasador) |
| **Origen Datos v1.0** (líneas 160, 275) | Extracción de PDFs aportados por el tasador (aguas abajo de IF-02) |
| **Plan v1.2** RF-09 §1.4 | Upload en P3 de IF-02 o desde `TabAdjuntos` — **antes de la visita** |

**Resolución en plan v1.2**: SC07 se **promueve a RF-09** y se adelanta a IF-02 (adjuntos iniciales del cliente). Decisión D-05 inicialmente difería la extracción; fue **revocada** porque la extracción automática será útil para toda interfaz del negocio (IF-03, IF-04, IF-05).

El escenario Make de RF-09 es **nuevo** y no colisiona con el SC07 existente (que sigue activo para IF-03 en fases posteriores). Los documentos fuente no reflejan esta decisión — el plan v1.2 la incorpora explícitamente.

**Alerta para el Integrador Make**: crear un escenario Make **nuevo** para RF-09 con un código propio (no "SC07"). El código "SC07" debe quedar reservado para el escenario post-visita de IF-03. Documentar ambos en `Z_EscenariosMake` con sus rutas de invocación separadas.

---

## H-07 · `n_operacion_cliente`: tipo Single line text vs Number

| Fuente | Tipo definido |
|---|---|
| **Capa Datos v2.6.2** (línea 2085) | `Single line text` |
| **Schema Airtable real** (MCP 04-jul-2026) | `number` (FIELD_ID `fldb1vmKk7y3hi4uY`) |
| **Plan v1.2** §1.3 | Tipo `number` en el schema real — se sigue el schema real |

**Resolución en plan v1.2**: el tipo TypeScript en el Route Handler es `number`, siguiendo el schema real de Airtable. Si un cliente envía este campo como texto (p.ej., desde un formulario), el Route Handler debe parsear/validar antes de pasarlo a Airtable.

**Nota para construcción**: `docs/schema-airtable.md` documenta explícitamente este campo como `number` para que los tipos TS generados sean correctos. No usar `string` aunque Capa Datos v2.6.2 diga lo contrario.

---

## Jerarquía de fuentes para CU-002

Cuando dos fuentes contradicen, la precedencia es:

1. **Plan v1.2** (`docs/PLAN_IMPLEMENTACION_IF02_v1_2.md`) — decisiones del propietario explícitamente aprobadas.
2. **Blueprint Interfaces v2.7** — fuente visual y de componentes.
3. **Especificación v1.4** — fuente de requisitos funcionales.
4. **Arquitectura v2.6** — fuente de arquitectura sistémica.
5. **Capa Datos v2.6.2**, **Motor Cálculo v2.5**, **Origen Datos v1.0** — fuentes de datos y cálculo.

Los documentos fuente en `docs/_md/` no se editan. Las divergencias se registran aquí y el plan v1.2 prevalece hasta que se publique una versión fuente actualizada.
