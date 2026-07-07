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

## Reglas operativas aprendidas
- Antes de escribir código nuevo: leer archivos que se van a tocar y reportar qué existe reutilizable.
- Nunca commitear ni pushear: el usuario lo hace vía GitHub Desktop.
- Nunca proponer `sudo` autónomamente.
- Cuando un cambio salga del alcance del prompt, avisar antes de aplicarlo.
- Verificar puerto real del server antes de curl.
- No hacer adendas: aplicar cambios donde corresponda y entregar la nueva versión completa del archivo modificado.
