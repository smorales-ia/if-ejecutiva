# Aprendizajes del proyecto

Este archivo guarda soluciones a problemas de entorno y patrones ya resueltos.
Debe leerse al inicio de cada sesión antes de proponer comandos.

## Cómo usar este archivo
- Al iniciar sesión: lee este archivo completo antes de proponer cualquier comando.
- Al cerrar una tanda: si resolviste un problema nuevo, agrégalo aquí.
- Formato de cada entrada: síntoma → causa → solución probada.

## Entradas

### E-001 — pnpm global roto con Node 20
**Síntoma:** `pnpm` falla con `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite`.
**Causa:** El pnpm global instalado exige Node ≥ 22.13.
**Solución probada:** configurar prefix de npm en carpeta de usuario y reinstalar pnpm 9:
```
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g pnpm@9
```
Verificar con `cd ~ && pnpm --version` → debe mostrar 9.15.9.

### E-002 — pnpm de Windows toma precedencia sobre el de WSL
**Síntoma:** `which pnpm` apunta a `/mnt/c/Users/.../AppData/Roaming/npm/pnpm`.
**Causa:** El PATH de WSL hereda el de Windows y lo pone primero.
**Solución probada:** instalar pnpm dentro de WSL con `npm install -g pnpm@9` tras configurar el prefix a `~/.npm-global`.

### E-003 — pnpm 9 rechaza pnpm-workspace.yaml sin `packages`
**Síntoma:** `pnpm --version` desde el proyecto: `ERROR: packages field missing or empty`.
**Causa:** pnpm 9 exige el campo `packages` explícito.
**Solución probada:** agregar al inicio de `pnpm-workspace.yaml`:
```yaml
packages:
  - '.'
```

### E-004 — Next.js crashea por falta de SWC binary
**Síntoma:** server llega a "Ready" pero muere con error de `@next/swc-linux-x64-gnu`.
**Causa:** SWC binary es dependencia opcional; a veces pnpm no la instala.
**Solución probada:** `pnpm install`. Si el binary está en el store pero sin symlink, crear symlink manual desde `node_modules/@next/swc-linux-x64-gnu` al store de pnpm.

### E-005 — Puerto 3000 ocupado, Next arranca en 3001
**Síntoma:** server arranca pero no responde en 3000.
**Causa:** proceso anterior quedó vivo en 3000.
**Solución probada:** verificar el puerto real reportado por Next al arrancar y usarlo en las pruebas.

### E-006 — TypeScript rechaza onValueChange de Base UI Select
**Síntoma:** `Argument of type 'string | null' is not assignable to parameter of type 'string'`.
**Causa:** Base UI Select emite `string | null`; los handlers esperan `string`.
**Solución probada:** `onValueChange={(v) => handler(v ?? '')}`. Defensivo, no cambia lógica.

### E-007 — El MCP de Airtable no permite convertir el tipo de un campo existente
**Síntoma:** Se necesitaba cambiar `TX_Solicitudes.banco` de texto libre a Link → M_Bancos; no existe ninguna herramienta MCP para "cambiar tipo de campo" sobre uno ya creado (`update_field` solo edita nombre/descripción/fórmula; `create_field` solo crea campos nuevos).
**Causa:** El servidor MCP de Airtable expone un subconjunto de la API oficial que no incluye conversión de tipo de campo in-place (esa operación en la API real de Airtable requiere resolver manualmente el mapeo de valores existentes, algo que el MCP no automatiza).
**Solución probada:** Estrategia de migración paralela: (1) crear campo nuevo con el tipo destino (`banco_link`, Link → M_Bancos), (2) migrar los valores de las filas existentes con `update_records_for_table` usando un mapeo texto→recXXX resuelto a mano, (3) dejar el campo viejo (`banco`) como deprecated conviviendo con el nuevo, (4) programar su eliminación para una tanda posterior una vez que blueprint Make y código lean/escriban del campo nuevo.
**Prevención futura:** Antes de pedir una "conversión de tipo" de un campo Airtable vía MCP, asumir que no es posible en un solo paso — planificar directamente la migración paralela (campo nuevo + migración de filas + deprecación) en vez de intentar buscar una herramienta de conversión que no existe.

### E-008 — `codigo_ext` genera valores `VP-NaN-0023` en producción
**Síntoma:** Las solicitudes creadas en Fase 2 (Paso 4B) muestran `codigo_ext` como `VP-NaN-0020`, `VP-NaN-0021`, etc., en vez de `VP-2026-00NN`.
**Causa:** `codigo_ext` es una fórmula que depende de `YEAR(fecha_solicitud)`, y `fecha_solicitud` no se mapea en el módulo 7 del blueprint SC01 — queda vacío en cada alta nueva, por lo que `YEAR()` evalúa a `NaN`.
**Solución probada:** Ninguna aplicada todavía en esta sesión — el fix (mapear `fecha_solicitud = {{formatDate(now; "YYYY-MM-DD")}}` en el módulo 7) pertenece a la **Tanda B** del gap de persistencia (`docs/_notas/gap_solicitud_persistencia.md`, caso a), no a la migración de `banco`.
**Prevención futura:** Al confirmar el tipo/existencia de un campo vía MCP, revisar también si alguna fórmula de solo lectura depende de él (`codigo_ext` depende de `fecha_solicitud`) — un campo "existente pero no mapeado en Make" puede romper fórmulas aguas abajo sin que el schema lo delate.

### E-009 — Revertir una decisión de panel requiere dejar rastro explícito, no solo actuar
**Síntoma:** El panel de arquitectura había decidido en la sesión anterior "no migrar `.banco`, solo documentar la divergencia" (Tanda A, punto 8 original); esta sesión revirtió esa decisión con evidencia nueva (5 filas con datos reales + bug `codigo_ext` confirmado) y migró el campo.
**Causa:** Sin dejar constancia explícita de que la decisión anterior fue revisada y por qué, una sesión futura podría asumir que "no migrar" seguía vigente y entrar en conflicto con el estado real del schema.
**Solución probada:** Se documentó el cambio de decisión en `docs/schema-airtable.md` §13.2, `docs/_notas/gap_solicitud_persistencia.md` (Tanda A punto 8) y aquí, todos referenciándose entre sí.
**Prevención futura:** Antes de proponer un cambio de schema en Airtable, revisar si el panel ya tomó una decisión al respecto en documentos previos (`gap_solicitud_persistencia.md`, `schema-airtable.md`); si se revierte, dejar rastro explícito de la evidencia nueva que motivó el cambio, no solo ejecutar.

### E-010 — Cambiar un catálogo hardcodeado por uno vivo en Airtable cambia el tipo del `id`
**Síntoma:** `TIPOS_DOCUMENTO` (hardcoded) usaba `id: number` (autonumber ficticio); al conectar `fetchTiposDocumento()` contra `D_TipoDocumento` real, el `id` pasó a ser `recXXX` (`string`), rompiendo temporalmente el tipado de `tipo_id` en el schema Zod y en `nuevaSolicitudInternaDefaults`.
**Causa:** Airtable identifica registros por record id (`recXXX`), no por autonumber; un catálogo hardcodeado con `id` numérico no tiene equivalente real cuando se reemplaza por lectura en vivo de Airtable.
**Solución probada:** cambiar `TipoDocumento.id` a `string` en `lib/console-data.ts`, propagar el cambio a `DocumentoChecklistItem.tipo_id` y al schema Zod (`tipo_id: z.string()`), aceptando una rotura de compilación temporal entre fases (Fase 2 → Fase 3) porque el cierre (`build`/`typecheck`) sólo se valida al final de la tanda completa.
**Prevención futura:** al planear la migración de un array hardcodeado a un fetcher de Airtable, revisar de entrada si el `id` usado en el hardcode es sintético (`number`) — si lo es, asumir que cambiará a `string` (`recXXX`) y mapear todos los consumidores del tipo antes de tocar el fetcher.

### E-011 — El prop-drilling real no siempre coincide con el que asume el plan
**Síntoma:** El plan de wiring asumía que `console-shell.tsx` renderizaba `NewRequestSheet` directamente; en realidad lo renderiza `solicitud-list.tsx` (`console-shell.tsx` → `solicitud-list.tsx` → `new-request-sheet.tsx`).
**Causa:** El plan se escribió sin verificar el árbol de renderizado real; `solicitud-list.tsx` no había sido mencionado como archivo a tocar.
**Solución probada:** detectarlo en la fase de lectura (Fase 0) con un grep del uso de `<NewRequestSheet`, señalarlo antes de escribir código, y agregar el archivo faltante al alcance de wiring sin esperar una nueva instrucción (era plomería necesaria, no una decisión de negocio).
**Prevención futura:** antes de aceptar un plan de wiring de props entre componentes, verificar con grep/lectura quién renderiza a quién — no asumir la jerarquía descrita en el prompt.

### E-012 — Filtrar por un campo checkbox en `filterByFormula` de Airtable
**Síntoma:** no había patrón existente en el repo para filtrar `listRecords` por un campo tipo Checkbox (los filtros previos eran todos sobre singleSelect o texto).
**Causa:** `D_TipoDocumento.activo` es checkbox; Airtable no lo compara como texto plano en fórmulas.
**Solución probada:** usar `filterByFormula: '{activo} = TRUE()'` en `fetchTiposDocumento()` (`lib/tipos-documento.ts`).
**Prevención futura:** para cualquier fetcher nuevo que filtre por un campo checkbox `activo`, reutilizar la sintaxis `{campo} = TRUE()` en vez de comparar contra `"1"` o string vacío.

### E-013 — Nomenclatura de `construccion.md` diverge de los archivos reales del repo
**Síntoma:** `construccion.md` §4 esperaba crear `components/console/filtros-bar.tsx` y `components/console/prioridad-badge.tsx`; ninguno existe en el repo — los filtros viven inline en `solicitud-list.tsx` y el badge de prioridad es `PriorityChip` en `status-badges.tsx`.
**Causa raíz:** `construccion.md` documenta el plan original de v0; el código evolucionó consolidando ambos componentes en archivos ya existentes sin que la guía se actualizara.
**Solución aplicada:** se extendió `solicitud-list.tsx` (filtros Cliente/Estado/SLA/Fecha por URL params) y se ajustó `PRIORIDAD_CLASSES` en `console-data.ts`, en vez de crear archivos nuevos duplicados.
**Prevención futura:** antes de crear un archivo que `construccion.md` marca como "no existe", grep primero por el nombre del componente (`PriorityChip`, `FiltrosBar`, etc.) — puede que ya exista bajo otro nombre de archivo.

### E-014 — `PRIORIDAD_CLASSES` usaba la paleta "orange" de Tailwind, chocando con el naranja de marca
**Síntoma:** el badge "Urgente" usaba `bg-orange-50 border-orange-200`, visualmente cercano al naranja de marca `#F5A213` que CLAUDE.md prohíbe explícitamente colisionar con el ámbar operacional.
**Causa raíz:** la implementación original no distinguió la paleta Tailwind "orange" de la paleta "amber" al mapear el semáforo operacional de prioridad.
**Solución aplicada:** cambiado a `bg-amber-50 border-amber-200 text-[#d97706]` (y `text-[#b91c1c]` exacto para Crítico), alineado con el mismo patrón ya usado en `SLA_CLASSES`. "Normal" pasó de `gray` a `slate` per especificación.
**Prevención futura:** cualquier badge de estado operacional (ámbar) debe usar clases Tailwind `amber-*`, nunca `orange-*` — reservar `orange` solo para elementos de marca.

### E-015 — `buildFormula`/`Vista`/`VISTAS_VALIDAS` duplicados entre Route Handler y lib
**Síntoma:** `app/api/solicitudes/route.ts` mantenía su propia copia de `buildFormula`, `Vista` y `VISTAS_VALIDAS`, divergiendo silenciosamente de `lib/solicitudes.ts` (el Route Handler no tenía los filtros Cliente/Estado/SLA/Fecha que sí necesitaba `page.tsx`).
**Causa raíz:** el Route Handler se escribió antes de que `page.tsx` migrara a llamar `fetchSolicitudes()` directamente desde `lib/solicitudes.ts`; nadie consolidó ambos después.
**Solución aplicada:** el Route Handler ahora importa `buildFormula`, `Vista` y `VISTAS_VALIDAS` desde `lib/solicitudes.ts` en vez de duplicarlos.
**Prevención futura:** al agregar lógica de filtrado sobre `TX_Solicitudes`, verificar si existe más de un punto de entrada (Route Handler vs. Server Component) y consolidar en `lib/` antes de duplicar.

### E-016 — Pedir en `fields[]` un campo que no existe en Airtable rompe TODA la consulta (422), no solo ese campo
**Síntoma:** al preparar el fetch de `TX_Solicitudes` para el Paso 3 (TabDatos espejo de NewRequestSheet) se agregaron `notas_tasador` y `notas_visador` al array `fields` de `listRecords` — ambos ⚙ pendientes de creación (D-08) según `docs/schema-airtable.md`.
**Causa raíz:** la API de Airtable devuelve `422 UNKNOWN_FIELD_NAME` para la solicitud completa si CUALQUIER nombre en el parámetro `fields` no existe en la tabla — no lo ignora en silencio. Pedirlo habría roto `GET /api/solicitudes` y `GET /api/solicitudes/[id]` enteros (Paso 2 y Paso 3), no solo esos dos labels.
**Solución aplicada:** se retiraron `notas_tasador`/`notas_visador` de `SOLICITUD_FIELDS` en `lib/solicitudes.ts`; `mapRecord` ya degrada a `"—"` cuando la clave no viene en la respuesta, así que no hace falta pedirlos. Se verificó en vivo contra la base real (`node` + `fetch` a la API de Airtable con el token de `.env.local`, solo lectura) que el resto de campos nuevos (`canal_contacto_original`, `n_operacion_cliente`, `fldd56pLZyKYoi2Vi`/`sucursal_originadora`, `solicitante_telefono`, `email_contacto`, `ejecutiva_asignada`, `regla_aplicada`) sí existen y devuelven `200`.
**Prevención futura:** antes de agregar un campo a cualquier array `fields` de `listRecords`/`getRecord`, confirmar en `docs/schema-airtable.md` que no tiene el marcador ⚙ (pendiente de creación). Si un label depende de un campo pendiente, dejar que `mapRecord` lo degrade a `"—"` por ausencia de clave — nunca pedirlo explícitamente en `fields`. Ante duda, un `fetch` de solo lectura directo a la API de Airtable (fuera de Next.js, sin pasar por Clerk) es la forma más rápida de confirmar el nombre exacto de un campo sin arriesgar builds.

### E-017 — `sucursal_originadora` con espacio final: pedir por FIELD_ID no alcanza, la respuesta igual usa el nombre con espacio como clave
**Síntoma:** se pidió el campo vía FIELD_ID (`fldd56pLZyKYoi2Vi`) en `fields[]` para evitar el problema del espacio final (D-08); la duda era si la respuesta JSON vendría con la clave `"sucursal_originadora"` o `"sucursal_originadora "`.
**Causa raíz:** `fields[]` acepta nombre o FIELD_ID para *seleccionar* qué campos incluir, pero no cambia cómo se *serializan* las claves del objeto `fields` de la respuesta — eso solo lo controla `returnFieldsByFieldId` (no usado en este repo). Verificado en vivo: la respuesta trae literalmente la clave `"sucursal_originadora "` (con espacio final).
**Solución aplicada:** `getFieldLoose()` en `lib/solicitudes.ts` — busca primero la clave exacta y, si no está, la busca tolerando espacios (`k.trim() === name`). Se usa solo para este campo.
**Prevención futura:** pedir un campo por FIELD_ID resuelve el problema de "no puedo referenciar el nombre real porque no sé cuántos espacios tiene", pero para LEER el valor de la respuesta sigue haciendo falta tolerancia a espacios en la clave — las dos partes del problema (pedir vs. leer) se resuelven por separado.

### E-018 — Los campos Link de Airtable, DENTRO de una fórmula, comparan contra el primary field del registro vinculado — nunca contra el recordId, aunque la API REST sí devuelva recordIds
**Síntoma:** "Mi cartera" seguía vacía tras el fix anterior (pasar el `userId` de Clerk a `{ejecutiva_asignada}="user_XXXX"`). La hipótesis de esta sesión era que hacían falta 2 saltos (Clerk → `AUTH_Usuarios.clerk_user_id` → recordId) y luego `FIND("recXYZ", ARRAYJOIN({ejecutiva_asignada}))`.
**Causa raíz:** se verificó en vivo (fuera de Next.js, con `fetch` directo a la API de Airtable) que un campo Link, **dentro del lenguaje de fórmulas** (`filterByFormula`), se evalúa como el *primary field* (texto mostrado) del registro vinculado — no como su recordId. Prueba: `TX_Solicitudes.tasador` para `VP-2026-0004` apunta al recordId `recAmBbFFDGyb6CLE` (M_Tasadores "Marcela Gómez"). `FIND("recAmBbFFDGyb6CLE", ARRAYJOIN({tasador}))` → 0 matches. `FIND("Marcela Gómez", ARRAYJOIN({tasador}))` → 1 match (`VP-2026-0004`). Esto contradice lo que la API REST devuelve para ese mismo campo cuando se lee vía `GET` (ahí sí vienen recordIds en un array) — son dos representaciones distintas del mismo campo según el contexto (lectura de datos vs. evaluación de fórmula).
**Solución aplicada:** el patrón correcto de 2 saltos NO termina en un recordId, sino en el *valor del primary field* del registro de `AUTH_Usuarios` (ej. `"Sergio Morales"`). `lib/solicitudes.ts` ahora expone `resolveEjecutiva(clerkUserId)` (cache en memoria de proceso, 5 min TTL) que devuelve `{ recordId, nombre }`, y `buildVistaFormula('cartera', ejecutivaNombre)` arma `FIND("<nombre>", ARRAYJOIN({ejecutiva_asignada}))` — comparando por nombre, nunca por recordId ni por clerk_user_id.
**Prevención futura:** para filtrar `TX_Solicitudes` por CUALQUIER campo Link usando un identificador que viene de un sistema externo (Clerk, etc.), resolver primero ese identificador al *primary field* (texto) del registro vinculado — nunca al recordId — antes de armar el `filterByFormula`. Si hay ambigüedad sobre qué campo es el primary field de una tabla, verificarlo en vivo con un campo Link que sí tenga datos poblados (como se hizo aquí con `tasador`) en vez de asumir.

### E-019 — Bloqueador real de "Mi cartera": AUTH_Usuarios.clerk_user_id nunca se había poblado, y ninguna solicitud tenía ejecutiva_asignada
**Síntoma:** incluso con la fórmula corregida (E-018), "Mi cartera" seguía vacía.
**Causa raíz:** verificado en vivo — (1) `AUTH_Usuarios` tenía una sola fila (Sergio Morales, `rec8XzHkBKWMb4CO1`) con `clerk_user_id` vacío (nunca sincronizado con Clerk); (2) de las 11 filas de `TX_Solicitudes`, ninguna tenía `ejecutiva_asignada` poblado (Tanda B de SC01 aún no asigna este campo al crear, ver `docs/schema-airtable.md` §2).
**Solución aplicada:** con autorización explícita de Sergio (no se escribió nada sin preguntar primero), se pobló `AUTH_Usuarios.clerk_user_id` = `user_3GBF4JpAzPfJsJJWTRGp8sRi7gv` (obtenido vía API backend de Clerk, solo lectura) para `rec8XzHkBKWMb4CO1`, y se asignó `ejecutiva_asignada` = ese recordId en 2 solicitudes de prueba (`VP-2026-0004`, `VP-2026-0028`) para validar el fix end-to-end en vivo. `fetchSolicitudes()` ahora devuelve `{ data: [], motivo: 'ejecutiva_no_encontrada' }` (en vez de degradar en silencio) cuando `resolveEjecutiva` no encuentra fila — la UI (`solicitud-list.tsx`) muestra "No pudimos encontrar tu usuario en AUTH_Usuarios. Verifica con el administrador."
**Prevención futura:** antes de dar por buena una fórmula de filtro que depende de datos maestros (AUTH_Usuarios, M_Tasadores, etc.), confirmar en vivo que esos datos maestros están efectivamente poblados — un filtro sintácticamente correcto sobre una tabla vacía de datos relevantes también devuelve "vacío", y es indistinguible de un bug de fórmula sin verificar ambos por separado. Cuando un flujo depende de un dato que pudo "nunca haberse sincronizado" (clerk_user_id, etc.), tratarlo como caso legítimo desde el diseño (campo `motivo` explícito), no como un `degraded` genérico.

### E-020 — `lib/make-client.ts` y `crear-solicitud/route.ts` ya existían de una sesión previa no reflejada en el prompt de arranque
**Síntoma:** el prompt de esta sesión (Paso 4 · SC01) asumía "lib/make-client.ts NO existe" y pedía crear `app/api/webhooks/crear-solicitud/route.ts` desde cero con un payload específico.
**Causa raíz:** una sesión anterior ("Paso 4B Fase 2 — Endpoint real crear-solicitud + contrato Tanda B", commit `43bc2f1`) ya había construido ambos archivos con el mismo contrato camelCase pedido en este prompt, pero esa sesión no quedó reflejada en el prompt de arranque de la siguiente.
**Solución aplicada:** diagnóstico silencioso antes de escribir código (`find app/api`, `find lib`) reveló que ambos archivos ya existían y cumplían el contrato exacto — se reutilizaron sin cambios en vez de sobreescribirlos.
**Prevención futura:** el diagnóstico silencioso al inicio de cada sesión (`find`/`grep` de los archivos que el prompt dice "no existe") sigue siendo obligatorio incluso cuando el prompt es muy específico — el estado real del repo puede haber avanzado más que el contexto que recibió quien escribió el prompt.

### E-021 — Mensajes de validación bloqueante no usaban el texto literal §6/§8
**Síntoma:** `lib/validators/nueva-solicitud-interna.ts` mostraba "RUT inválido", "Email inválido" e "Ingresa la dirección de la propiedad." en vez de los mensajes canónicos exactos del Blueprint (§6) / diseno.md (§8), y la dirección no validaba mínimamente calle+número.
**Causa raíz:** el schema Zod se escribió con mensajes genéricos de placeholder que nunca se actualizaron contra el texto literal, y ningún test cubría la igualdad exacta del string.
**Solución aplicada:** se reemplazaron los tres mensajes por las constantes `MSG_RUT_INVALIDO`, `MSG_EMAIL_INVALIDO`, `MSG_DIRECCION_INCOMPLETA` con el texto literal exacto, y se agregó `tieneCalleYNumero()` (exige al menos un dígito + 2 tokens) como validación adicional de dirección.
**Prevención futura:** al escribir o revisar cualquier schema Zod de un formulario de este CU, comparar cada `.refine()`/mensaje contra el texto literal de diseno.md §8 antes de darlo por bueno — los mensajes humanos §6/§8 no admiten parafraseo aunque el significado sea equivalente.

### E-022 — `MAKE_HMAC_SECRET` no está en `.env.local`, sólo `MAKE_WEBHOOK_URL_SC01`
**Síntoma:** el prompt de esta sesión afirmaba "MAKE_WEBHOOK_URL_SC01 y MAKE_HMAC_SECRET ya están en Railway y .env.local"; al revisar `.env.local` sólo aparece `MAKE_WEBHOOK_URL_SC01` (y las URLs de E1/E2/E3) — `MAKE_HMAC_SECRET` no está.
**Causa raíz:** desconocida — no se puede confirmar desde este entorno si la variable sí existe en Railway (producción) y sólo falta en el `.env.local` de desarrollo.
**Solución aplicada:** no se bloqueó la sesión porque `app/api/webhooks/crear-solicitud/route.ts` y el nuevo `app/api/adjuntos/upload/route.ts` ya degradan con gracia (`{ ok: false, error: ... }`, sin crashear) cuando falta `MAKE_HMAC_SECRET`. Se avisa aquí en vez de detener la sesión, ya que el código no necesita el secreto real para compilar ni para el resto del alcance de Paso 4.
**Prevención futura:** antes de dar por sentado en un prompt que una variable "ya está" en `.env.local`, verificar con `grep` — y si sólo se puede confirmar Railway manualmente, dejarlo como punto explícito a confirmar por Sergio antes de probar el submit real end-to-end.

### E-023 — `FileUploadZone` y `DocumentChecklist` son dos mocks de upload distintos con destinos distintos
**Síntoma:** al conectar la subida real de adjuntos (Paso 4, ALCANCE ítem 3), había dos componentes con `setInterval` simulando progreso: `FileUploadZone` ("Adjuntos opcional", sección suelta del Sheet) y `DocumentChecklist` (checklist de documentos requeridos, cada fila con su propio input de archivo).
**Causa raíz:** son necesidades distintas — `FileUploadZone` sube archivos sueltos sin relación con ningún campo del formulario (su resultado nunca viajaba al payload de `crear-solicitud`), mientras que `DocumentChecklist` alimenta `documentos[]`, que el propio Route Handler descarta explícitamente antes de enviar a Make (comentario en el código: "el upload de adjuntos es una fase posterior") porque `TX_Adjuntos.solicitud` es un Link obligatorio a un registro que aún no existe durante el alta.
**Solución aplicada:** sólo se conectó `FileUploadZone` a `/api/adjuntos/upload` real (con degradación §6 si `MAKE_WEBHOOK_URL_ADJUNTOS` no está configurado). `DocumentChecklist` se dejó con captura local (`URL.createObjectURL`) sin tocar, porque es puramente un gate client-side de `docsFaltantes` — conectarlo a un endpoint que siempre degrada (Make de adjuntos no provisionado) habría bloqueado permanentemente el botón "Crear solicitud" cada vez que se marca un documento como requerido.
**Prevención futura:** antes de "conectar un mock a un endpoint real", verificar primero si el resultado de ese mock efectivamente viaja al backend (grep el nombre del campo en el Route Handler que arma el payload) — conectar un mock que alimenta un gate bloqueante a un servicio todavía no provisionado puede convertir una simulación inofensiva en un bloqueador real de la funcionalidad principal.

### E-023 — addendum (10-jul-2026)
SUPERSEDED por D-12 (Opción C) el 2026-07-10 — solicitud_id vuelve a ser OBLIGATORIO en `/api/adjuntos/upload`; ya no hay ventana de subida sin solicitud creada.

### E-024 — TX_Solicitudes.codigo_solicitud (primary field) quedaba vacío en filas creadas por SC01
**Síntoma:** al inspeccionar `TX_Solicitudes` durante el diagnóstico de Fase 0 (Fase Adjuntos 1), todas las filas tenían `codigo_solicitud` vacío aunque `codigo_ext` (fórmula `VP-YYYY-NNNN`) sí calculaba bien.
**Causa raíz:** SC01 (módulo 7 · Create a Record) nunca mapeó `codigo_solicitud`. El primary field quedó como campo huérfano — visible en la tabla pero nunca poblado. `codigo_ext` (formula) es el que se muestra en la UI, así que el problema pasaba desapercibido. Como un campo Link, DENTRO de una fórmula, se evalúa contra el primary field del registro vinculado (no contra su record ID — lección E-018), cualquier `filterByFormula` que comparara un Link hacia `TX_Solicitudes` (ej. `TX_Adjuntos.solicitud`) siempre evaluaba contra texto vacío y nunca hacía match — rompía en silencio `lib/adjuntos.ts` (`fetchAdjuntosPorSolicitud`).
**Solución aplicada:** Sergio pobló manualmente `codigo_solicitud` en las 14 filas existentes copiando el valor de `codigo_ext`. `lib/adjuntos.ts` se corrigió para no depender de esto de todos modos (filtra en memoria por record ID en vez de `filterByFormula` sobre el Link, ver más abajo). Pendiente para próxima tanda de Make: agregar en SC01 módulo 7 el mapping `codigo_solicitud = {{7.codigo_ext}}` (o equivalente) para que solicitudes futuras nazcan con el primary field poblado. Alternativa: convertir `codigo_solicitud` en fórmula igual a `codigo_ext` y deprecar el campo texto.
**Prevención futura:** al crear una tabla nueva, revisar que el primary field esté cubierto por el flujo de creación (Make, Automation o UI) — un primary field vacío no rompe nada visiblemente pero corrompe cualquier link o lookup que dependa del display value.

### E-025 — `TX_Adjuntos.url_dropbox` guarda un path interno, no un link público (deuda técnica aceptada, Fase Adjuntos 1)
**Síntoma:** el blueprint `SC-Adjuntos-Upload` escribe en `url_dropbox` el resultado de `{{6.path_display}}` (ej. `/VProperty/Tasaciones/VP-2026-0031/escritura.pdf`), que es el path interno de Dropbox, no una URL clickeable.
**Causa raíz:** el módulo `dropbox:createSharedLink` (mejor esfuerzo original de Fase 1) no existe en la instancia Make de VProperty — ver E-026. Sin ese módulo (ni un equivalente confirmado), no hay forma de generar el link público dentro del mismo escenario sin arriesgar otro `Module Not Found`.
**Solución aplicada:** se aceptó la limitación para Fase Adjuntos 1 — el archivo queda persistido y referenciado en `TX_Adjuntos` con su path interno, que es suficiente para el criterio de aceptación de esta fase (documento guardado + fila enlazada a la solicitud). Generar el shared link público queda como fase futura: resolverlo vía Route Handler cuando la Ejecutiva pinche el link (llamar a la API de Dropbox en ese momento), o agregando el módulo Make apropiado una vez se confirme cuál existe realmente en esta instancia.
**Prevención futura:** antes de dar por bueno un campo "URL" alimentado por un módulo de storage, confirmar si el módulo usado en el blueprint devuelve una URL pública real o sólo metadata/path interno — no asumirlo por el nombre del campo de salida.

### E-026 — Antes de asumir el nombre/versión de un módulo Make de un connector, inspeccionar un blueprint existente que ya lo use en la misma organización
**Síntoma:** el primer intento del blueprint `SC-Adjuntos-Upload` usó `dropbox:uploadFile` v1 y `dropbox:createSharedLink` v1 (nombres de módulo "razonables" por convención, sin verificar contra la instancia real). Al importar en Make, ambos módulos aparecieron como "Module Not Found" — no existen en la instancia Make de VProperty.
**Causa raíz:** los nombres/versión de módulo de un connector (Dropbox, Gmail, etc.) no son universales entre instancias/planes de Make — dependen de qué versión del connector está disponible y de cuáles módulos habilitó la cuenta. Un blueprint "generado a mano" sin verificar esto es una apuesta.
**Solución aplicada:** Sergio exportó el blueprint del escenario `E3_Carbone_Download_Dropbox` (ya activo en producción) y se confirmó que el módulo Dropbox real disponible es `dropbox:uploadLargeFile` v5, con parámetros `path` (carpeta) + `filename` (nombre de archivo) separados y `data` como buffer (via `toBinary()`), no `dropbox:uploadFile` con `path` completo + `encoding: base64`. Se reemplazó el módulo 6 del blueprint con el patrón exacto de E3.
**Prevención futura:** antes de generar un blueprint Make que use un connector específico (Dropbox, Gmail, etc.), inspeccionar un blueprint EXISTENTE que ya use ese connector en la misma organización, para copiar los module IDs y version exactos — los defaults "razonables" (ej. `uploadFile` v1) no necesariamente coinciden con lo que la instancia real tiene disponible (`uploadLargeFile` v5). Referencia: `E3_Carbone_Download_Dropbox`.

### E-027 — Reescritura de `/api/adjuntos/upload`: formData/Blob → JSON+base64, y por qué XMLHttpRequest en vez de fetch
**Síntoma:** el Route Handler original (Paso 4) recibía el archivo como `multipart/form-data` y no tenía forma de reportar progreso de subida al cliente; `fetch` tampoco expone progreso de subida nativo (`ReadableStream` de request body no está soportado de forma consistente en navegadores para eso).
**Causa raíz:** D-11/D-14.3 exigen progreso real por archivo y que Make reciba el contenido codificado (no hay Dropbox directo desde el cliente). `fetch` con `body: ReadableStream` no dispara eventos de progreso; `XMLHttpRequest.upload.onprogress` sí.
**Solución aplicada:** el Route Handler se reescribió completo con un schema Zod que exige `solicitud_id` (D-12, obligatorio), `codigo_ext`, `nombre_archivo`, `mime_type`, `tamanio_kb`, `hash_md5`, `subido_por` (default `"Ejecutivo"`) y `contenido_base64`. `lib/adjuntos-uploader.ts` usa `XMLHttpRequest` en vez de `fetch` específicamente para tener `upload.onprogress`. El límite de body de Next.js 16 (10MB default cuando hay `middleware.ts`, que cubre `/api/**` en este repo) se subió a 12MB vía `experimental.proxyClientMaxBodySize: '12mb'` en `next.config.mjs` — mecanismo confirmado contra la documentación oficial de Next.js 16.2.10 (no existe forma de configurar límite de body en un Route Handler de App Router directamente; el límite real viene de la capa de proxy que introduce `middleware.ts`).
**Prevención futura:** cualquier subida que necesite progreso real de upload debe usar `XMLHttpRequest`, no `fetch` — no es una preferencia de estilo, es una limitación real de la Fetch API. Al subir el límite de body en Next 16 App Router, usar `experimental.proxyClientMaxBodySize` (no existe un equivalente estable no-experimental todavía) y verificar primero si el proyecto tiene `middleware.ts` cubriendo la ruta — sin middleware, este límite ni siquiera aplica. Nota al margen confirmada en `pnpm build` (10-jul-2026): Next.js 16.2.6 ya marca `middleware.ts` como convención deprecada a favor de `proxy.ts` — es el mismo mecanismo renombrado (de ahí el nombre `proxyClientMaxBodySize`). Migrar `middleware.ts` → `proxy.ts` queda fuera de esta sesión; no rompe nada hoy, es sólo un warning.

### E-028 — Convenciones D-12/D-13/D-14 aplicadas de forma consistente: `codigo_ext`, `subido_por`, batching
**Contexto:** varias correcciones puntuales del prompt de Fase Adjuntos 1 (A–E) exigían disciplina de nomenclatura para no repetir errores ya vistos en sesiones previas (`codigo_solicitud` vs `codigo_ext`, opciones inventadas de `subido_por`, `Promise.all` sin control).
**Aplicado:** payload del webhook de adjuntos y respuesta del Route Handler usan siempre `codigo_ext` (nunca `codigo_solicitud`, que es un campo interno de Airtable — ver E-024 — ni `codigo_solicitud` como nombre de variable en TS). `subido_por` usa el string literal `"Ejecutivo"` (opción existente del singleSelect) como default en tres lugares distintos (Zod schema del Route Handler, `lib/adjuntos-uploader.ts`, mapper del blueprint Make) — no se creó ninguna opción nueva en Airtable. `uploadEnLotes` implementa un worker pool de tamaño fijo (3) en vez de `Promise.all(archivos.map(...))`, para que 10 archivos nunca disparen 10 requests simultáneas.
**Prevención futura:** cuando un mismo valor por defecto o nombre de campo se repite en varios archivos (Zod schema, lib, blueprint Make), definirlo como constante en un solo lugar si es posible, o al menos usar el mismo string literal exacto — una sesión futura que solo actualice uno de los tres lugares rompe la consistencia en silencio (Make no valida contra el enum de Airtable hasta que falla el `Create Record`).

### E-029 — `DocumentChecklist` nunca subía archivos reales: simulaba localmente y descartaba el `File`, dejando la subida real huérfana de tipo_documento

**Síntoma:** dos reportes de Sergio tras probar en local: (1) "la lista dinámica de documentos requeridos desapareció" del `NewRequestSheet`; (2) ningún adjunto subido en las pruebas del día aparecía en `TX_Adjuntos`. El código de `document-checklist.tsx` y su wiring en `new-request-sheet.tsx` (import, render, props) estaban intactos y sin cambios respecto a antes de la Fase Adjuntos 1 — la hipótesis "se dejó de renderizar" (prompt de arranque de esta sesión) no se confirmó al leer el código.

**Causa raíz:** eran dos síntomas de una única causa preexistente, no una regresión de la sesión anterior. `DocumentChecklist` (decisión de una sesión mucho más antigua, documentada en E-023) siempre fue un mock aislado: su "subida" era un `setInterval` de 800ms que terminaba llamando `URL.createObjectURL(file)` y guardaba sólo metadata (`DocumentoArchivo`: nombre/tamaño/mime/url_local) en el array `documentos` controlado por RHF/Zod — el objeto `File` real nunca salía de la función `simularSubida`. Ese array `documentos` además se descarta explícitamente en `app/api/webhooks/crear-solicitud/route.ts` (`const { documentos: _documentos, ... } = parsed.data`) porque el upload es una fase posterior a la creación (Opción C, D-12). La única subida real (`XMLHttpRequest` a `/api/adjuntos/upload`) vivía en un dropzone genérico separado, "Adjuntos (opcional)", sin relación con los tipos de documento — si la Ejecutiva usaba el checklist (el flujo visualmente prominente, con nombres de documento reales) para adjuntar, esos archivos jamás llegaban al array `archivos: File[]` que sí se sube. De ahí Bug 2 (cero filas en `TX_Adjuntos`) y la percepción de Bug 1 ("no pasa nada visible" se interpretó como "el bloque desapareció").

**Solución aplicada:** se agregó un segundo callback `onFileChange(codigo, file | null)` en `DocumentChecklist`/`DocumentRow`, disparado junto al callback de metadata existente, que levanta el `File` real hacia `NewRequestSheet` en un nuevo state `checklistArchivos: Record<string, File>` (separado de RHF/Zod porque `File` no es serializable y el payload JSON a Make no debe cargarlo). Se eliminó el `setInterval` de `simularSubida` (ya no aporta nada real). En el submit, `checklistArchivos` + el dropzone genérico `archivos` se combinan en una sola lista `ArchivoConTipo[]` (`{file, tipoDocumento}`) que alimenta `iniciarSubidaAdjuntos`/`uploadEnLotes`. `tipo_documento` (código de `D_TipoDocumento`, ej. `permiso_edificacion`) viaja hasta `/api/adjuntos/upload` → Make → `TX_Adjuntos.clave_adjunto` (texto libre existente, sin uso previo) — **no** a los campos `tipo`/`tipo_adjunto` (dos singleSelect existentes cuyas opciones, verificadas vía Airtable Meta API de sólo lectura, no incluyen ningún código real de `D_TipoDocumento`; mapear ahí habría exigido crear opciones nuevas sin aprobación de Sergio).

**Prevención futura:** cuando un bug reportado incluye una hipótesis de causa ("se rompió al migrar X"), verificar esa hipótesis leyendo el código antes de aceptarla — en este caso la hipótesis era falsa (nada se dejó de renderizar) pero el síntoma reportado sí era real, con una causa distinta y más profunda. Antes de mapear cualquier campo nuevo hacia un singleSelect de Airtable, confirmar sus opciones reales vía API (no asumir por el nombre del campo) — un catálogo paramétrico (`D_TipoDocumento.codigo`) no necesariamente calza con las opciones ya cargadas en un singleSelect de otra tabla, aunque los nombres sugieran relación.

### E-030 — Fase Adjuntos 1 · Filas TX_Adjuntos creadas vacías + AdjuntosTab no renderiza

**Síntoma:** en pruebas reales (11-jul-2026), las filas nuevas creadas por el escenario `SC-Adjuntos-Upload` en `TX_Adjuntos` (filas 7, 8, 9) tenían TODOS los campos vacíos excepto `fecha_subida` (campo `createdTime`, se autopobla sin depender de ningún mapeo). Como consecuencia, `AdjuntosTab` en `solicitud-detail.tsx` no mostraba ningún adjunto al entrar al detalle de una solicitud que sí tenía filas en `TX_Adjuntos`. Sergio además detectó 4 campos reales en `TX_Adjuntos` no documentados en `CLAUDE.md` ni en el blueprint: `clave_adjunto`, `tipo_adjunto`, `orden`, `descripcion`.

**Causa raíz Bug 1 (filas vacías):** se reverificó el schema completo de `TX_Adjuntos` vía Airtable Meta API (de solo lectura) y los 9 nombres de campo usados en el mapper del Módulo 8 del blueprint (`nombre_archivo`, `url_dropbox`, `tamanio_kb`, `mime_type`, `hash_md5`, `subido_por`, `solicitud`, `estado_extraccion`, `clave_adjunto`) coinciden exactamente (case-sensitive) con los nombres reales — no hay mismatch de nombre en el JSON documentado. Como incluso campos sin ninguna dependencia de Dropbox (`nombre_archivo`, `hash_md5`, que vienen directo del Webhook) también salieron vacíos, la causa más probable está en el **escenario activo de Make**, no en el código: el Módulo 8 (Create Record) ahí nunca quedó realmente enlazado a los tokens del Webhook — un import parcial (el propio instructivo de importación ya advertía "es más probable que el import no quede 100% perfecto" por tener Router) o un campo sin seleccionar del picker de variables al construir el escenario a mano. No se pudo confirmar con certeza porque el MCP/History de Make no está disponible desde este entorno — Sergio necesita revisar el History del escenario o reconstruirlo siguiendo la verificación campo por campo documentada en `SC-Adjuntos-Upload_import_instrucciones.md` (sección "Diagnóstico 11-jul-2026").

**Causa raíz Bug 2 (AdjuntosTab vacío):** encadenada al Bug 1 — si `solicitud` (Link) llega vacío en `TX_Adjuntos`, `fetchAdjuntosPorSolicitud()` (que filtra correctamente en memoria por record ID, patrón E-018, sin bug propio) nunca encuentra coincidencias para ninguna solicitud. `lib/adjuntos.ts` y el Route Handler `/api/solicitudes/[id]/adjuntos` se revisaron y están correctos; no requirieron cambios.

**Solución aplicada:** (1) se documentó en el JSON del blueprint y en el instructivo de importación la verificación campo-por-campo del Módulo 8, con instrucciones para borrar el escenario y reconstruirlo desde cero en vez de editarlo (más confiable que parchear un import a medias); (2) se agregó el paso de borrar las 3 filas vacías antes de re-probar; (3) se corrigió un bug real de UI encontrado en la revisión (independiente de si `url_dropbox` llega vacío o con el path interno de Dropbox, deuda E-025): tanto en `DatosTab` como en `AdjuntosTab` de `solicitud-detail.tsx`, un `url_dropbox` no-vacío pero no-HTTP (el path interno `/VProperty/Tasaciones/...`) se renderizaba como link activo, navegando a una ruta rota dentro del propio dominio de la app — se agregó `esUrlPublica()` para distinguir ambos casos y deshabilitar el botón/link con tooltip "Enlace directo disponible en próxima versión" cuando el valor no es una URL http(s) real; (4) se decidió dejar `tipo_adjunto`, `orden`, `descripcion` sin mapear por ahora — el frontend no genera datos para ellos todavía, mapearlos vacíos no aporta nada.

**Prevención futura:** al diseñar un blueprint Make sobre una tabla de Airtable, listar el schema COMPLETO de esa tabla (todos los campos, no sólo los que se recuerdan de una sesión anterior o los documentados en CLAUDE.md) antes de dar el mapper por completo — un campo real puede pasar desapercibido durante varias sesiones si nadie vuelve a auditar el schema entero. Cuando TODOS los campos de una fila salen vacíos (no sólo uno), sospechar primero de un problema sistémico en el mapeo del módulo completo (import parcial, campo sin enlazar) antes que de un mismatch de nombre en un campo individual — un mismatch de nombre normalmente sólo afecta a ESE campo, no a todos. Ante un bug de Make que no se puede inspeccionar directamente (sin MCP ni History disponibles), la verificación más confiable que se puede dejar documentada es un checklist campo-por-campo con el módulo/campo de origen exacto para cada mapeo, más la sugerencia de borrar y reconstruir en vez de editar sobre un import posiblemente corrupto.

### E-031 — Cierre Fase Adjuntos 1 confirmado + auditoría dominio D_ para RF-09 (12-jul-2026)

**Contexto:** sesión "Cerrar Fase Adjuntos 1 + Lectura de datos por dominio D_". Diagnóstico previo a cualquier cambio de código, continuación directa de E-030.

**Hallazgo 1 — A2 (AdjuntosTab) y A3 (DocumentChecklist) nunca fueron bugs de código:** el prompt de arranque pedía confirmar `AdjuntosTab` y restaurar `DocumentChecklist` si seguía oculto. La verificación completa del código (no solo grep) confirmó que ninguno de los dos tenía bug real: `AdjuntosTab` usa correctamente `fetchAdjuntosPorSolicitud` vía `/api/solicitudes/[id]/adjuntos` (patrón E-018 en memoria, sin cambios necesarios), y `DocumentChecklist` recibe `tiposDocumento` correcto desde `fetchTiposDocumento()` → `page.tsx` → `solicitud-list.tsx` → `NewRequestSheet`, con los 9 códigos reales coincidiendo 1:1 contra los defaults de `lib/schemas.ts`. Sergio confirmó que reconstruyó el escenario Make `SC-Adjuntos-Upload` siguiendo el checklist de `SC-Adjuntos-Upload_import_instrucciones.md` (sección "Diagnóstico 11-jul-2026") y probó una subida real — `TX_Adjuntos` ya no queda vacío.

**Causa raíz:** el único bug real de E-030 estaba en el wiring del Módulo 8 (Create Record) del escenario ACTIVO de Make, no en ningún archivo de este repo. Los tres síntomas reportados (fila vacía en Airtable, `AdjuntosTab` sin datos, `DocumentChecklist` "desaparecido") eran manifestaciones de la misma única causa (adjuntos vacíos en Airtable), no bugs independientes.

**Solución aplicada:** ninguna en código — se cierra Fase Adjuntos 1 sin tocar Next.js.

**Prevención futura:** cuando un bug reportado tiene varios síntomas aparentemente distintos (tabla vacía + tab sin datos + componente "desaparecido"), verificar primero si comparten una única causa raíz antes de investigar cada síntoma por separado — evita reabrir investigaciones de código ya cerradas cuando el problema real sigue siendo 100% de configuración externa (Make).

**Hallazgo 2 — 2 campos reales faltantes en el dominio D_:** al auditar vía MCP las 8 tablas D_ contra `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_2.md` §6.7 (paso previo obligatorio antes de diseñar RF-09), se encontraron 2 campos documentados en la fuente canónica pero ausentes en Airtable real: `D_Atributo.version` (Number, snapshot de versión para reproducibilidad histórica de prompts Claude, paralelo a RN-28) y `D_Documento.extraccion_incompleta` (Checkbox, adenda v2.6.2/D-3, marca documentos con al menos un atributo extraído en null).

**Causa raíz:** ambos campos están documentados como adiciones v8.1/v2.6.2 en la fuente canónica pero nunca se materializaron en el Airtable real — mismo patrón que D-08 en `TX_Solicitudes` (campo documentado ≠ campo creado), esta vez en un dominio nuevo (D_) que nadie había auditado hasta ahora.

**Solución aplicada:** con aprobación explícita de Sergio (campos aislados, sin impacto en producción — RN-33 reverificada: cero FK cruzada del dominio D_ hacia M_/C_/TX_/A_/H_/Z_), se crearon ambos vía MCP: `D_Atributo.version` (`fldVa989k1aO6gVXV`) y `D_Documento.extraccion_incompleta` (`fldewUdLQOpVpSe7M`). Documentado en `docs/schema-airtable.md` §18 (nueva sección del dominio D_, con FIELD_IDs completos de las 8 tablas).

**Prevención futura:** antes de diseñar cualquier escritor (Make/Automation) hacia una tabla ya descrita en una fuente canónica (Capa Datos, Blueprint, Especificación), re-verificar el schema completo vía MCP en vez de asumir que "documentado" implica "creado" — el patrón D-08 se repite en dominios nuevos si nadie los audita explícitamente antes de construir sobre ellos.

**Decisiones abiertas para la sesión de construcción de RF-09** (no resueltas esta sesión; documentadas en `docs/_notas/rf09_diseno.md`):
1. Dónde resolver el paso EAV polimórfico tipado (RN-32: exactamente 1 de 5 columnas de valor poblada según `tipo_dato` del atributo) — Router de 5 ramas dentro de Make (consume operaciones del plan Free) vs. delegarlo a un Airtable Script/Automation (`AT-D01`, nombrada en Capa Datos v2.6.2 pero sin confirmar si existe activa).
2. Confirmar vía MCP el primary field real de `D_TipoDocumento` antes de escribir cualquier `filterByFormula` que compare su Link — mismo riesgo E-018/E-024 (un Link dentro de una fórmula se evalúa contra el primary field del registro vinculado, no contra su record ID).

**Estado al cierre:** RF-09 queda únicamente en fase de DISEÑO (`docs/_notas/rf09_diseno.md` — contrato de `/api/extraccion/iniciar`, módulos del escenario Make, diseño de `ExtraccionStatusBadge`). Ningún archivo de código ni blueprint Make se creó — bloqueado hasta que Sergio confirme `MAKE_WEBHOOK_URL_RF09` y `ANTHROPIC_API_KEY` en Railway y `.env.local`.

## Estado de tareas

- **2026-07-08** — Pausada "Implementar endpoint real de Make y refresco de lista" (Paso 4B Fase 2): pausado para migrar `TX_Solicitudes.banco` a Link → M_Bancos, decisión de panel 2026-07-08.
- **2026-07-09** — "Mi cartera resuelve clerk_user_id → recordId" cerrada: Sergio autorizó poblar `AUTH_Usuarios.clerk_user_id` y asignar 2 solicitudes de prueba (`VP-2026-0004`, `VP-2026-0028`) a `ejecutiva_asignada` para validar en vivo. **Pendiente:** decidir si esas 2 solicitudes de prueba deben revertirse a `ejecutiva_asignada` vacío una vez validado en el navegador, o si se dejan como está.

## Reglas operativas aprendidas
- Antes de escribir código nuevo: leer archivos que se van a tocar y reportar qué existe reutilizable.
- Nunca commitear ni pushear: el usuario lo hace vía GitHub Desktop.
- Nunca proponer `sudo` autónomamente.
- Cuando un cambio salga del alcance del prompt, avisar antes de aplicarlo.
- Verificar puerto real del server antes de curl.
- No hacer adendas: aplicar cambios donde corresponda y entregar la nueva versión completa del archivo modificado.
