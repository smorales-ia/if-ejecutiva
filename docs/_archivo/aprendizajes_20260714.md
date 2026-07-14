# Aprendizajes archivados (E-001 a E-017) — movidos el 14-jul-2026

> Estas entradas se movieron desde `docs/aprendizajes.md` el 14-jul-2026 para
> mantener el archivo vivo bajo ~300 líneas (regla de mantenimiento del panel
> de expertos). Son lecciones de entorno local (pnpm/Node/SWC/puertos) y
> patrones de código ya asimilados en el repo (Base UI Select, migración de
> tipos de campo, consolidación de fetchers) — no se referencian por ID desde
> ninguna entrada posterior a E-018. Se conservan aquí como historial, no como
> reglas activas de sesión.

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
