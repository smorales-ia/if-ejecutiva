`pnpm lint` falla porque ESLint no está instalado en este entorno (preexistente, no relacionado con este cambio) — no forma parte de los pasos de cierre solicitados (solo se pidió `build` y `typecheck`), así que no lo corrijo aquí.

## Reporte final

### Archivos modificados

**`app/api/solicitudes/route.ts`** (POST reescrito, GET intacto). Resumen del flujo nuevo:
- Valida body con `nuevaSolicitudInternaSchema` (sin cambios).
- Construye `payload = { ...parsed.data, origen_canal: 'ingreso_manual' }`.
- Si `MAKE_WEBHOOK_URL_SC01` no está definida → `console.warn` + modo simulado (`sim-<uuid>`), sin tocar Make/Airtable.
- Si está definida → `fetch` a Make con `AbortSignal.timeout(15000)`.
  - Error de red/timeout → 502 `"No pudimos registrar la solicitud. Intenta de nuevo."` + log técnico completo.
  - Respuesta no-2xx → 502 igual, logueando `status` + body de Make.
  - Respuesta no es JSON válido → 502 igual, logueando el error de parseo.
  - JSON sin `id` que empiece con `"rec"` → 502 con `"Make no retornó ID de solicitud"` + log del JSON recibido.
  - Éxito → 201 con `{ id, ...payload }` (id real `recXXX...`).

**`components/console/new-request-sheet.tsx`**:
- Importa `useRouter` de `next/navigation`.
- `onSubmit` distingue tres casos: fallo de `fetch` (red) → toast "Sin conexión. Intenta de nuevo."; `res.ok === false` (502 del servidor) → toast "No pudimos registrar la solicitud. Intenta de nuevo."; éxito → toast con el `id` real de Make en la descripción, cierra el Sheet y llama `router.refresh()` para refrescar la lista (mismo patrón que usa `SolicitudList` con `next/navigation`, que hoy dispara la recarga del Server Component `ConsolaPage`). En los dos casos de error el Sheet permanece abierto y los datos del formulario no se pierden.

**`.env.example`**: ya tenía `MAKE_WEBHOOK_URL_SC01=` con placeholder vacío — no requirió cambios.

### Resultado de verificación
- `pnpm typecheck` → exit 0, sin errores.
- `pnpm build` → compiló limpio (única advertencia preexistente y no relacionada: deprecación `middleware` → `proxy` de Next 16).
- `pnpm lint` → falla porque `eslint` no está instalado en este entorno (preexistente, no pedido en el cierre de esta fase).

### Confirmación del mapping
`origen_canal` se fija siempre a `"ingreso_manual"` justo antes de enviar a Make (tanto en modo simulado como real), y viaja también en la respuesta al cliente para que el toast y el estado post-éxito sean consistentes. El resto de los campos del payload se envían tal cual, sin transformaciones adicionales, tal como quedó alineado en Fase 1.9.

### Cómo probar en local
- **(a) Sin `MAKE_WEBHOOK_URL_SC01`**: dejar la variable vacía/ausente en `.env.local`, levantar `pnpm dev`, crear una solicitud desde el Sheet → toast muestra `sim-<uuid>` en la descripción, log de servidor imprime el warning, la lista no tiene un registro real (no hay escritura en Airtable).
- **(b) Con `MAKE_WEBHOOK_URL_SC01`**: definir la URL real del escenario SC01 en `.env.local`, reiniciar `pnpm dev`, crear una solicitud → toast muestra un `recXXX...` real, `router.refresh()` recarga la lista y la nueva solicitud debería aparecer (sujeto a que el escenario Make esté realmente activo y el filtro de la vista actual la incluya).

### Decisiones tomadas por mi cuenta
- No implementé firma HMAC-SHA256 (`X-VP-Signature`, D-03) en esta llamada: la instrucción de Fase 2 no la pidió explícitamente y el endpoint ya existente (`/api/solicitudes`, no `/api/webhooks/crear-solicitud`) es una divergencia previa a esta sesión respecto a la estructura de rutas documentada en `CLAUDE.md`. Señalo esto para que decidan si quieren añadir la firma HMAC y/o mover el handler a `/api/webhooks/crear-solicitud` en una fase posterior.
- El mensaje de error `"Make no retornó ID de solicitud"` se devuelve tal cual en el JSON de servidor (para logs/depuración), pero el cliente nunca lo muestra literalmente — cualquier respuesta 502 dispara el mismo toast humano `"No pudimos registrar la solicitud. Intenta de nuevo."`, respetando la regla de no exponer mensajes técnicos.
- Agregué el `id` real a la descripción del toast de éxito (antes no se mostraba ningún ID), ya que la instrucción 2.3 lo pedía explícitamente y el mensaje principal (§6) permanece literal sin cambios.

### Pendientes documentales heredados (sin resolver, fuera de alcance de esta fase)
- `ejecutiva_asignada` no existe en `TX_Solicitudes` (bloqueo de "Mi cartera").
- `M_Bancos` real sin "Banco Estado" ni "Banco Security".
- Filtrado `tipo_informe`/`producto` por cliente sin criterio de negocio definido.

Sin inconvenientes de entorno nuevos en esta sesión (build y typecheck limpios a la primera), así que no corresponde agregar entrada a `docs/aprendizajes.md`.
