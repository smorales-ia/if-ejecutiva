# P11-TAS — Autenticación y blindaje server-side (§12) · 2026-09-01 14:59

**Contrato:** pausa-total. **Modo:** default. Cierre de R2 (se retira `mockUserTasador`).

## Resumen de la tanda

Se reemplazó la identidad simulada (`lib/tasador/mock-user.ts`) por la sesión
real de Clerk resuelta contra `M_Tasadores`, se endureció el guard de RF-09 y se
corrió la matriz de 6 casos con **JWT de sesión reales** de dos tasadores contra
`localhost`, verificando en Airtable que los casos destructivos no escribieron.

### Cambios de código

- **Nuevo** `lib/tasador/usuario.ts`: `getUsuarioTasador()` real. Lee `auth()`
  (server-side) y resuelve `clerk_user_id` → `M_Tasadores` (campo
  `clerk_user_id` = `fldIu5izeAtkFXMJO`, creado en la sesión previa). Devuelve
  `null` ante sesión ausente o cuenta sin tasador; nunca lanza.
- **Borrado** `lib/tasador/mock-user.ts`. `grep mockUserTasador` en todo el repo = 0.
- **6 consumidores migrados** a `./usuario` con `await` + manejo de `null`:
  `auth-guard.ts` (null → 403 sin filtrar), `lectura-tasacion.ts::leerCola`
  (null → `[]`), `auditoria.ts::auditar` (null → 0),
  `app/api/tasaciones/[id]/coordinacion/route.ts` (null → 403),
  `app/api/tasaciones/route.ts` (null → 403), `app/tasaciones/page.tsx` (import).
- **Barrido** `mock|fixture|fake|dummy` en `app/tasaciones app/api/tasaciones
  components/tasador lib/tasador` = 0 fuera de tests (se limpiaron 5 comentarios).
- **Test** `coordinacion/route.test.ts`: se añadió `vi.mock('@/lib/tasador/usuario')`
  porque la ruta resuelve la identidad fuera del guard y `auth()` lanza en test.
- **Doc** `docs/schema-airtable.md`: fila `clerk_user_id` en la tabla de `M_Tasadores`.

### Gates

| Gate | Resultado |
|---|---|
| `pnpm tsc --noEmit` | exit 0 |
| `pnpm test` | 721 passed / 39 archivos, exit 0 |
| `pnpm build` | exit 0 |

## Matriz de 6 casos — resultado real (curl contra localhost:3000)

**Datos de prueba** (vinculación hecha en la sesión previa):
- Tasador A = Nelcy Jaimes · `recJPSCLckxLuf9nV` · `clerk_user_id=user_3I3t9D91ZYPIOQzuNcRuDVsQvnb` · solicitud propia `rec75VXoWvRImjd0f` (VP-2026-0060).
- Tasador B = Hector Martinez · `recaKT2ND8dIZpEIj` · `clerk_user_id=user_3HsNnsLu2uAQxkoRp6WNnRDDDvz` · solicitud propia `recU4PknUhFgyQQhr` (VP-2026-0059).

| # | Actor | Acción | Esperado | HTTP real | Veredicto |
|---|---|---|---|---|---|
| 1 | A | `GET /api/tasaciones` | 200, sólo suyas | **200** · contiene VP-2026-0060, NO VP-2026-0059 | ✅ |
| 2 | A | `GET /api/tasaciones/{B}` | 403 | **403** | ✅ |
| 3 | A | `PATCH /api/tasaciones/{B}/datos` | 403, sin escritura | **403** + Airtable idéntico | ✅ |
| 4 | A | `POST /api/tasaciones/{B}/calcular` | 403, estado B sin cambio | **403** + estado=asignada sin cambio | ✅ |
| 5a | — | `GET /api/tasaciones` sin sesión | ≠ 200 | **404** (Clerk corta) | ✅ |
| 5b | — | `GET /api/tasaciones/{A}` sin sesión | ≠ 200 | **404** | ✅ |
| 5c | — | `GET /api/tasaciones` Bearer basura | ≠ 200 | **500** | ✅ (ver deuda) |
| 6.1 | B | `GET /api/tasaciones` | 200, sólo suyas | **200** · contiene VP-2026-0059, NO VP-2026-0060 | ✅ |
| 6.2 | B | `GET /api/tasaciones/{A}` | 403 | **403** | ✅ |
| 6.3 | B | `PATCH /api/tasaciones/{A}/datos` | 403, sin escritura | **403** + Airtable idéntico | ✅ |
| 6.4 | B | `POST /api/tasaciones/{A}/calcular` | 403, estado A sin cambio | **403** + estado=asignada sin cambio | ✅ |

**Cuerpo del 403** (no filtra existencia, dirección ni nombre):
`{"error":"No encontramos esta solicitud entre las tuyas."}` — mismo cuerpo para
"no es tuya" que para "no existe".

**Verificación de no-escritura (Airtable, casos 3/4/6.3/6.4):** snapshot sha256 de
los `fields` de ambas solicitudes antes y después de la matriz:
- `rec75VXoWvRImjd0f`: hash `f692aebf9546b334` = `f692aebf9546b334` → **idéntico**.
- `recU4PknUhFgyQQhr`: hash `5504b5fd8f153dc3` = `5504b5fd8f153dc3` → **idéntico**.
El guard corta antes de cualquier escritura; el `sync` destructivo de `/datos` no llegó a ejecutarse.

## Inconvenientes resueltos

**Inconveniente 1 — `testing_tokens` no autentica como usuario.**
El plan/indicación pedía generar la sesión con `POST /v1/testing_tokens`. Ese
endpoint sólo **saltea la bot-detection** (E2E); no emite un JWT con `user_id`.
Usarlo habría fabricado un verde falso en un test de autorización.
*Solución:* flujo correcto de sign-in token →
`POST /v1/sign_in_tokens {user_id}` (Backend) → canje del ticket en el Frontend
API (`strategy=ticket`) → `POST /v1/client/sessions/{sid}/tokens` → `__session` JWT.

**Inconveniente 2 — instancia de desarrollo exige "dev browser".**
El canje del ticket en FAPI devolvía `dev_browser_unauthenticated` y el jar de
cookies quedaba vacío. Las instancias `pk_test_*` requieren `POST /v1/dev_browser`
primero y propagar `__clerk_db_jwt` en cada llamada FAPI.
*Solución:* se antepuso el `dev_browser` y se pasó `__clerk_db_jwt` en `sign_ins`
y en `sessions/{sid}/tokens`. El FAPI se deriva de la publishable key
(base64 → `sure-dinosaur-11.clerk.accounts.dev`).

**Inconveniente 3 — la app acepta el JWT por `Authorization: Bearer`, no por cookie `__session`.**
En dev, enviar el JWT como cookie `__session` daba 404 (Clerk quiere el
handshake del dev browser); como `Authorization: Bearer <jwt>` autentica
networkless y devuelve 200. Para futuras corridas de la matriz por curl: usar Bearer.

**Inconveniente 4 (menor) — `pkill -f "next dev"` se auto-señala.**
El patrón coincide con la propia línea de comando y mata el subshell (exit 144/143).
*Prevención:* no incluir en el comando de kill una cadena que también describa
al propio comando; o detener el server por su task-id de background.

## Deuda detectada

- **Caso 5c (Bearer inválido) → HTTP 500**, no 401. No es fuga (nunca 200, acceso
  denegado), pero un token malformado debería dar 401 limpio en vez de 500.
  Candidato a CI menor.
- **Sesiones Clerk de prueba** creadas para njaimes/hmartinez vía sign-in token
  quedaron vivas (instancia dev, expiran solas). Si molestan, revocar con
  `POST /v1/sessions/{sid}/revoke`.

## Prevención futura

- El único punto de identidad de IF-03 sigue siendo una sola función
  (`getUsuarioTasador`); mantenerlo así.
- La llave Clerk↔tasador es `M_Tasadores.clerk_user_id`, **no** `email` (placeholder
  repetido en masa). Documentado en `docs/schema-airtable.md`.
