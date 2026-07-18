# RF-09 · Diseño de la Fase 2 de Extracción (Lectura por Dominio D_)

> ⚠ **SUPERSEDED (17-jul-2026).** Este documento (12-jul-2026) diseña RF-09
> contra el dominio D_ de **8 tablas EAV** (`D_Atributo`, `D_TipoDato`,
> `D_Catalogo`, `D_CatalogoValor`, `D_Documento`, `D_DocumentoValorAtributo`
> + `D_TipoDocumento`/`D_TipoDocumentoAtributo`). Ese dominio **ya no existe**
> en la base real: la Especificación v1.8.2 y una migración de schema ya
> ejecutada lo consolidaron en **2 tablas** (`D_TipoDocumento` +
> `D_TipoDocumentoAtributo`, 19 campos) más la tabla nueva `TX_Unidades`,
> con el resultado de la extracción persistido como JSON en
> `TX_Adjuntos.atributos_obtenidos` (sin filas EAV intermedias). Ver el
> modelo vigente en `docs/schema-airtable.md` §18 y
> `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_2.md` §6.7.
>
> Además, la construcción real de RF-09 avanzó en sesiones posteriores
> (`docs/aprendizajes.md` E-033 a E-038) mucho más allá del esquema de
> módulos B3 de este documento — el blueprint real
> (`docs/make-blueprints/SC-RF09-ExtraccionClaude.blueprint.json`) tiene
> hoy 13 módulos con un pipeline
> webhook→Dropbox→Claude→ParseJSON→Router distinto al descrito abajo, y
> **todavía referencia las tablas deprecadas** `D_Atributo`/`D_TipoDato`
> en sus módulos 5 y 6 (riesgo de fallo — ver nota en el propio blueprint).
> Reconstruirlo contra el modelo de 2 tablas es trabajo de construcción
> pendiente, no cubierto por esta actualización de documentación.
>
> El contenido original de este documento se conserva íntegro abajo sólo
> como registro histórico de la Fase 2 de diseño — **no usarlo como
> referencia para construir o reconstruir el escenario Make**.
>
> **Estado: DISEÑO, no implementación.** Ningún archivo de código ni blueprint
> listo-para-importar se crea todavía — B5 del prompt de sesión exige detenerse
> antes de crear archivos nuevos de RF-09 si Sergio no ha confirmado
> `MAKE_WEBHOOK_URL_RF09` y `ANTHROPIC_API_KEY` en Railway. Este documento es
> el punto de partida para la sesión donde sí se construya.
>
> **Fecha**: 12-jul-2026 · **Sesión**: cierre Fase Adjuntos 1 + diseño Lectura Dominio D_
> **Panel firmante**: Enterprise Architect · Data Designer · Integrations Engineer · Next.js Engineer · QA Lead

---

## Contexto que justifica este diseño

Fase Adjuntos 1 (D-11 a D-14) quedó cerrada esta sesión: Sergio confirmó que
reconstruyó `SC-Adjuntos-Upload` en Make siguiendo el checklist de
`SC-Adjuntos-Upload_import_instrucciones.md` y probó una subida real —
`TX_Adjuntos` ya no queda vacío. Con eso, `construccion.md` §2 desbloquea el
Paso 6 (RF-09).

El dominio D_ (8 tablas EAV polimórfico) fue auditado vía MCP esta misma
sesión — ver `docs/schema-airtable.md` §18. Está poblado con catálogo real
(9 tipos de documento, 67 atributos, 111 relaciones tipo↔atributo, 11
catálogos) y con 2 gaps de schema ya cerrados (`D_Atributo.version`,
`D_Documento.extraccion_incompleta`). El dominio está listo para que RF-09
escriba en él.

Cupo de Make: Sergio confirmó tener cupo libre para un tercer escenario
(Make Free = 2 activos, más los ya usados por SC01/SC-Adjuntos-Upload y el
pipeline E1/E2/E3, que no cuenta contra IF-02).

**Pendiente antes de construir (no diseñar)**: `MAKE_WEBHOOK_URL_RF09` y
`ANTHROPIC_API_KEY` en `.env.local` y Railway.

---

## B2 · Contrato `POST /api/extraccion/iniciar`

Sigue el mismo patrón que `/api/adjuntos/upload` (Zod + `postToMake` de
`lib/make-client.ts`, firma HMAC-SHA256, log en `LogEscenarios`). Server-only,
nunca invocado desde un componente cliente directo — se encadena desde el
propio Route Handler de upload tras confirmar que Dropbox recibió el archivo,
o manualmente vía `ExtraccionStatusBadge` → botón "Reintentar extracción".

### Request

```ts
// Body validado con Zod
{
  adjunto_id: string,        // record_id TX_Adjuntos, obligatorio
  solicitud_id: string,      // record_id TX_Solicitudes, obligatorio
  codigo_ext: string,        // para LogEscenarios (solicitudId legible)
  tipo_documento: string,    // código D_TipoDocumento (ej. "permiso_edificacion"), obligatorio
                             // -- si viene vacío (adjunto suelto sin tipo), el endpoint responde
                             // { ok: false, error: 'Este adjunto no tiene un tipo de documento asociado.', reintentable: false }
                             // sin llamar a Make (RN-25: no se infiere el tipo, se declara)
}
```

### Efecto inmediato (antes de llamar a Make)

El Route Handler actualiza `TX_Adjuntos.estado_extraccion = "extrayendo"` vía
Airtable API (no vía Make — es un update simple, mismo patrón que
`/api/webhooks/reasignar`), **antes** de invocar el webhook, para que el
`ExtraccionStatusBadge` refleje el estado sin esperar la respuesta lenta de
Claude.

### Response (200)

```ts
{
  ok: true,
  estado: "extrayendo"
}
```

Nota: **este endpoint no espera el resultado de Claude** — Make procesa
async y escribe directo en Airtable (`D_Documento`, `D_DocumentoValorAtributo`,
`TX_Adjuntos.estado_extraccion`, `TX_DatosTasacion`). El polling del resultado
lo hace el cliente contra `GET /api/solicitudes/[id]` (ya existente), igual
que documenta `diseno.md` §10 RF-09.

### Degradación (§6, mismo patrón que `/api/adjuntos/upload`)

- Si `MAKE_WEBHOOK_URL_RF09`/`MAKE_HMAC_SECRET` faltan: `{ ok: false, degraded: true, error: 'Extracción automática temporalmente no disponible.' }`, status 200 — no revierte `estado_extraccion` a `idle` porque no se intentó llamar a Make.
- Error de red/timeout hacia Make: revertir `TX_Adjuntos.estado_extraccion` a `"error"` (no dejarlo colgado en `"extrayendo"`), responder `{ ok: false, error: MENSAJE_ERROR_RED, reintentable: true }`, status 502.
- Loguear siempre en `LogEscenarios` vía `postToMake` (ya lo hace automáticamente, igual que en adjuntos).

---

## B3 · Escenario Make RF-09 (diseño de módulos, no blueprint importable)

**Nombre**: `RF09-Extraccion-Documentos` (código propio — **nunca "SC07"**,
reservado para IF-03 post-visita, H-06).

**Principio Make = transportista puro (RN-25/RT-03)**: Make sólo orquesta la
llamada a Claude API y escribe el resultado tal cual en Airtable siguiendo
`D_TipoDocumentoAtributo`. Ninguna regla de negocio (qué atributo es
obligatorio, qué tabla destino, cómo tipar el valor) vive en el escenario —
todo se lee de `D_Atributo`/`D_TipoDocumentoAtributo` en runtime.

### Módulos (orden)

1. **Webhook** (`gateway:CustomWebHook`) — recibe `{ adjunto_id, solicitud_id, codigo_ext, tipo_documento }`.
2. **Airtable → Get a Record** (`TX_Adjuntos`, por `adjunto_id`) — trae `url_dropbox`/`mime_type` para descargar el binario.
3. **Airtable → Search Records** (`D_TipoDocumentoAtributo`, `filterByFormula: {tipo_documento} = "{{4.codigo}}"` — **cuidado**: mismo problema E-018/E-024 que en `SC-Adjuntos-Upload` — un Link dentro de una fórmula se evalúa contra el primary field del registro vinculado. Verificar primero cuál es el primary field real de `D_TipoDocumento` antes de armar esta fórmula; si el primary field no es `codigo`, filtrar por nombre o traer todas las filas de `D_TipoDocumentoAtributo` y filtrar en un iterador/Set aggregator por el `tipo_documento` esperado).
4. **Dropbox → Download a File** (por el `url_dropbox`/path de TX_Adjuntos) — trae el binario para adjuntar al prompt de Claude.
5. **HTTP → Make a Request** a la API de Claude (Anthropic Messages API, `model: claude-sonnet-5` o el vigente al momento de construir) — prompt generado inyectando, por cada fila de `D_TipoDocumentoAtributo` del módulo 3, su `D_Atributo.ejemplo_atributo` (RN-25) y el `D_Atributo.version` actual (para snapshot).
6. **Airtable → Create Record** en `D_Documento` — `tipo_documento` (Link), `codigo_documento` (generar único, ej. `{{1.codigo_ext}}-{{now}}` o hash corto), `nombre_archivo`, `ruta_archivo` (de `TX_Adjuntos.url_dropbox`), `fecha_carga` auto, `estado = "vigente"`, `hash_archivo`, `extraccion_incompleta` = `true` si Claude devolvió algún valor null/baja confianza.
7. **Iterator** sobre el JSON de Claude (`{atributo_id, valor_extraido, confianza}[]`).
8. **Airtable → Create Record** en `D_DocumentoValorAtributo` (dentro del iterador) — `documento` = record del módulo 6, `tipo_documento_atributo` = record correspondiente del módulo 3, y **una sola** de las 5 columnas de valor poblada según `D_TipoDato.codigo` del atributo (RN-32) — el escenario debe leer `tipo_dato` para decidir cuál columna llenar; no se puede hacer con un solo mapper fijo, requiere un Router de 5 rutas (una por `tipo_dato`) o un módulo de scripting (Make tiene límite de complejidad en plan Free — evaluar si conviene un Airtable Script externo en vez de 5 rutas de Router).
9. **Router** (Set A vs Set B, o ambos si el atributo tiene `usado_motor_calculo=true` Y `uso_interfaz_negocio=true`):
   - Rama Set A: si `usado_motor_calculo=true`, propagar a `TX_DatosTasacion` usando `uso_tabla_destino`/`uso_campo_destino` de `D_Atributo` (trazabilidad textual, sin FK — RN-35).
   - Rama Set B: sin propagación adicional más allá de `D_DocumentoValorAtributo` (las interfaces de negocio leen de ahí directo).
10. **Airtable → Update Record** en `TX_Adjuntos` — `estado_extraccion = "listo"` (o `"error"` si Claude falló o el JSON no parseó).
11. **Airtable → Create Record** en `LogEscenarios` (`escenario: "RF-09"`).
12. **Webhook Response** — `{ ok: true }` (no es esperado por el cliente, ver B2, pero es buena práctica cerrarlo).

**Riesgos de diseño a validar en la primera prueba real (no antes)**:
- El paso 8 (5 columnas de valor, 1 poblada según tipo) es el punto más frágil — Make Free no tiene scripting nativo tan flexible como un Airtable Script; puede requerir mover ese paso a un Airtable Automation con script (`AT-D01`, ya mencionado en Capa Datos v2.6.2 como la automation esperada para validar RN-32) en vez de resolverlo dentro de Make. **Decisión de panel pendiente para la sesión de construcción**: ¿el Router de 5 ramas vive en Make o se delega a un Airtable Script post-inserción? Ambas opciones son válidas; la segunda reduce el número de módulos Make (cuenta contra operaciones del plan) a costa de mover complejidad a Airtable.
- El módulo 3 (Search Records con Link en fórmula) reincide en el patrón E-018/E-024 — confirmar el primary field real de `D_TipoDocumento` vía MCP antes de armar la fórmula (no asumir que es `codigo`).

---

## B4 · `ExtraccionStatusBadge` (diseño de componente, código pendiente)

Ubicación: `components/vp/extraccion-status-badge.tsx` (CU-000.A, reusable
para IF-03/IF-04/IF-05 — no meterlo en `components/console/`).

### Props

```ts
interface ExtraccionStatusBadgeProps {
  estado: 'idle' | 'extrayendo' | 'listo' | 'error'
  onReintentar?: () => void // sólo visible/activo si estado === 'error'
}
```

### Mapeo visual (§10 diseno.md, ya definido — no varía)

| Estado | Color | Label | Ícono |
|---|---|---|---|
| `idle` | Gris neutro | "Sin extracción" | — |
| `extrayendo` | `#1D4ED8` + spinner | "Extrayendo…" | `Loader2` animado |
| `listo` | `#15803D` | "Datos extraídos" | `CheckCircle2` |
| `error` | `#B91C1C` | "Error en extracción" | `AlertCircle` + botón "Reintentar" inline |

### Integración

- **`AdjuntosTab`** (`solicitud-detail.tsx`): un badge por fila de adjunto, leyendo `TX_Adjuntos.estado_extraccion` (ya existe el campo, `fld54epvDJ7YdJIYD`). Requiere agregar `estado_extraccion` al `RawFields`/`Adjunto` de `lib/adjuntos.ts` y al fetch de campos — hoy ese lib no lo trae.
- **`NewRequestSheet`** (fase `subiendo`, dentro de `AdjuntosSubmitTracker`): opcional para esta fase — no bloquea el cierre del Sheet; RF-09 corre en background después de que el adjunto ya se subió y el Sheet se cerró. Se puede omitir del tracker y dejar que el badge sólo viva en el detalle (`AdjuntosTab`), que es donde el diseño original (`diseno.md` §5 Tab Adjuntos) lo ubica.
- **Polling**: reutilizar el patrón ya existente de refresco del panel tras acciones (`useEffect` con `fetch` a `/api/solicitudes/[id]/adjuntos`, mismo que ya usa `AdjuntosTab`) con un intervalo corto (ej. 3s) mientras haya al menos un adjunto en `estado_extraccion = "extrayendo"`; detener el polling cuando ninguno quede en ese estado. No se necesita WebSocket ni SSE para el volumen esperado.

---

## Pendientes registrados al cierre de Tanda D (14-jul-2026)

> Ver `docs/aprendizajes.md` E-034 a E-038 para el detalle técnico de cada
> hallazgo. Estos son los 4 puntos de acción concretos antes de retomar RF-09.

1. **Rotar la API key de Anthropic** — quedó expuesta en texto plano en un
   blueprint Make exportado durante debugging (E-037). Tratar como
   comprometida y rotar en Anthropic Console antes de seguir usando el
   escenario.
2. **Confirmar en Railway**: `MAKE_WEBHOOK_URL_RF09` y `ANTHROPIC_API_KEY`
   (con el valor rotado del punto 1).
3. **Verificar `TX_Adjuntos.estado_extraccion`** (singleSelect) — confirmar
   que las opciones agregadas en Checkpoint 1 (`skipped`, `no_corresponde`,
   `delegado_visador`) siguen ahí y no se perdieron entre sesiones.
4. **Confirmar plan Make** — RF-09 requiere un 3er escenario activo, y Make
   Free solo permite 2. Sin resolver esto, el escenario no puede quedar
   encendido en paralelo a los demás (ver §4.5 de `docs/_notas/rf09_diseno.md`
   sección "Cupo de Make" más arriba).

## Checklist para la sesión de construcción (no ejecutar todavía)

1. Confirmar `MAKE_WEBHOOK_URL_RF09` y `ANTHROPIC_API_KEY` en `.env.local` y Railway.
2. Decidir Router-en-Make vs Airtable Script para el paso 8 (RN-32).
3. Verificar primary field real de `D_TipoDocumento` vía MCP antes de escribir la fórmula del módulo 3.
4. Crear `app/api/extraccion/iniciar/route.ts` siguiendo el contrato B2.
5. Crear `components/vp/extraccion-status-badge.tsx` siguiendo B4.
6. Extender `lib/adjuntos.ts` para traer `estado_extraccion`.
7. Construir el escenario Make a mano (Sergio, con instructivo tipo `_import_instrucciones.md`) — no hay blueprint JSON listo todavía, se diseña recién en esa sesión con los módulos confirmados de Make (mismo riesgo de "Module Not Found" que Dropbox — verificar contra un escenario real antes de asumir nombres).
