# Reintento tras reinicio limpio · 404 del preview (P7-TAS.A.5)

**Fecha:** 2026-08-26
**Acción:** reinicio limpio del dev server (H-C aprobada). **No se tocó código.**

Pasos ejecutados:

1. `pkill -f "next dev"` → sin procesos `next` vivos.
2. `rm -rf .next` → OK.
3. `pnpm dev` → arranque limpio, `.env.local` cargado.

---

## Timestamp del `✓ Ready`

```
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 17.5s
```

Arranque confirmado a las **2026-08-26 22:38:15 -04** (hora local del host al
detectar el `✓ Ready`). Proceso servidor vivo: `next-server (v16.2.6)`.

---

## HTTP code de `/api/health`

**`200`** · cuerpo `{"status":"ok","airtable":"ok"}`.

> Matiz honesto: la **primera** petición en frío devolvió `503` con `ETIMEDOUT`
> (`GET /api/health 503 in 9.6s`) — la lectura real a Airtable que hace el health
> check se topó con la red de WSL aún fría más la compilación inicial de la ruta.
> La **segunda y siguientes** devuelven `200` de forma estable
> (`GET /api/health 200 in 6.0s`, y curl posterior `200`). El health check **hace
> una lectura viva a `TX_Solicitudes`**, así que su 200 confirma dos cosas: server
> vivo **y** token/base de Airtable respondiendo. Si al reabrir el navegador la
> primera carga tardara o fallara una vez, reintentar: es el mismo calentamiento en
> frío, no el diff.

---

## Instrucción para Sergio

Abrí en el navegador (ya con sesión Clerk iniciada):

```
http://localhost:3000/tasaciones/recdBwN9OimaCcL9T/informe
```

Es **VP-2026-0063** (`estado: calculada`, tasadora Maria Eugenia Soto = el mock de
la sesión). Debería mostrar el preview del informe **sin skeletons**, con la cabecera
hidratada (Isidora Goyenechea 3000 · Las Condes) y **"Cap rate: —"** (hueco
documentado CI-023/CI-063, esperado).

Si la primera carga tarda unos segundos o parpadea una vez, recargá: es el
calentamiento en frío del server, igual que el 503→200 del health.

---

## Desenlaces

- **Si Sergio confirma que carga (200) en el navegador:** el 404 era **H-C**
  (estado de proceso dev previo, no el diff .A.5). Cerrado. Se puede continuar la
  verificación manual del plan (URL 2 `recrx1YQYJuecthqd` para el estado skeleton, y
  la demo rica opcional de §Verificación manual).

- **Si persiste el 404:** capturar los **primeros ~100 ms de stdout del server** al
  recibir la petición y buscar las líneas del guard:

  ```bash
  # con el server escribiendo a /tmp/nextdev-a5-retry.log, en otra terminal:
  tail -f /tmp/nextdev-a5-retry.log | grep -E "auth-guard|leerTasacion|informe|404"
  # luego recargar la URL en el navegador y leer lo que aparezca
  ```

  Interpretación de lo que salga:
  - `[auth-guard] acceso denegado a solicitud ajena` → el `id` recibido por
    `await params` **no** casa el mock (revisar que la URL no traiga espacios ni
    caracteres invisibles pegados).
  - `[auth-guard] TASADOR_MOCK_RECORD_ID no está definida` → el server no cargó
    `.env.local:42` (revisar arranque desde la raíz del repo).
  - `[leerTasacion] fallo de infraestructura … 502` → `ETIMEDOUT`/Airtable caído en
    ese instante (transitorio; reintentar, igual que el 503 del health).
  - **Ninguna línea y sigue 404** → el foco vuelve a `isValidRecordId` sobre el `id`
    realmente recibido (no el que creemos): loguear `id` crudo sería el siguiente
    paso, y ahí sí tocaríamos código con aprobación.

---

## Estado

- Server: **vivo**, `/api/health` = **200**.
- Datos: registro existe, `estado: calculada`, `tasador` casa el mock (ver
  `diag-A5-404.md` §7).
- Diff .A.5: gates verdes (tsc 0 · build 0 · 688 tests). **No** es el sospechoso.
- Pendiente: confirmación visual de Sergio en el navegador.
