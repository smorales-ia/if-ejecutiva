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

## Estado de tareas

- **2026-07-08** — Pausada "Implementar endpoint real de Make y refresco de lista" (Paso 4B Fase 2): pausado para migrar `TX_Solicitudes.banco` a Link → M_Bancos, decisión de panel 2026-07-08.

## Reglas operativas aprendidas
- Antes de escribir código nuevo: leer archivos que se van a tocar y reportar qué existe reutilizable.
- Nunca commitear ni pushear: el usuario lo hace vía GitHub Desktop.
- Nunca proponer `sudo` autónomamente.
- Cuando un cambio salga del alcance del prompt, avisar antes de aplicarlo.
- Verificar puerto real del server antes de curl.
- No hacer adendas: aplicar cambios donde corresponda y entregar la nueva versión completa del archivo modificado.
