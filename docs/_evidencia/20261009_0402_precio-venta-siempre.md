# Evidencia · A-01 — Precio de venta siempre capturable · 2026-10-09 04:02 UTC

> Hora en el nombre y en el título: UTC de la VM (Chile: 2026-10-09 01:02, UTC−3).

## 1 · Contexto

- **Actividad:** A-01 de `docs/Objetivo.md` (CONFIRMADA · prioridad 1).
- **Origen:** C-08, transcripción `r21.txt`: «tiene que incorporar el precio de venta… es un precio que a nosotros nos da referencia para poder valorizar».
- **Rama:** `claude/actividad-a01-tanda-nocturna-bjkle8`.
- **SHA inicial de main:** `834998bded394275f1bf3a8044ea12b08109693e` (HEAD de la rama al arrancar = main).
- **Sesión cloud:** https://claude.ai/code/session_01VEtZjC7ADvyYSV8WHZMtvs
- **Protocolo:** SPEC `docs/_planes/SPEC_NOCHE-NUBE-UIEJECUTIVA_20261008.md` §4 y §7. Agentes: planificador-tanda → ejecutor-ui → probador-tanda → auditor-ciego.
- **Sin escrituras a Airtable, Make, Railway ni main.** El MCP de Airtable ni siquiera conectó en esta VM (proxy 403); no se usó.

### BLOQUE 0 (solo lectura) — superado

| Verificación | Resultado | Evidencia |
|---|---|---|
| SC01 mapea `financiero_precio_venta_uf` sin filtro por tipo de propiedad | OK | `docs/_artefactos/make/SC01 - Crear solicitud.blueprint.json:2246` — módulo 7 `airtable:ActionCreateRecord`, `"fld1RBNe63iotfyqE": "{{parseNumber(1.financiero_precio_venta_uf)}}"`. Módulo en la ruta principal, sin `filter` ni `if()`. |
| SC-Edicion mapea `financieroPrecioVentaUf` sin filtro | OK | `docs/_artefactos/make/SC-Edicion.blueprint.json:2155` — módulo 2 `airtable:ActionUpdateRecords`, `"fld1RBNe63iotfyqE": "{{parseNumber(1.cambios.financieroPrecioVentaUf)}}"`. Sin `filter`. |
| A-01 sigue CONFIRMADA | OK | `docs/Objetivo.md:11` |
| Los 5 puntos del guard coinciden con el código | OK | Líneas reales = las de Objetivo.md (sin deriva): `new-request-sheet.tsx:2191`, `editar-solicitud-form.tsx:1096`, `solicitud-detail.tsx:1137`, `crear-solicitud.ts:376-396`, `editar-solicitud.ts:283-296`. |

### Hallazgo del planificador (lectura)

- El lector `lib/solicitudes.ts:828-837` ya llena `financiero.precioVenta` sin mirar nueva/usada → no se toca; el bloqueo de lectura estaba solo en la UI del detalle.
- El mapper de edición manda la foto completa y SC-Edicion escribe todo lo que mapea (`editar-solicitud.ts:29-32,263-265`). **INFERIDO:** antes de este cambio, cada guardado de una usada vaciaba `financiero_precio_venta_uf` en Airtable. A-01 lo corrige para el precio; los otros 7 campos financieros de una usada siguen viajando vacíos (deuda preexistente, fuera de alcance — ver §6).

## 2 · Cambios aplicados

| Archivo | Tipo | Resumen |
|---|---|---|
| `lib/mappers/crear-solicitud.ts` | M | `financiero_precio_venta_uf` pasa al objeto `campos` (sección D), fuera de `if (esNuevo)`. El resto del bloque financiero y `valor_uf` siguen tras el guard. |
| `lib/mappers/editar-solicitud.ts` | M | `financieroPrecioVentaUf` pasa a `cambios`, fuera de `if (esNuevo && d.financiero)`. Los otros 7 siguen tras el guard. |
| `components/console/new-request-sheet.tsx` | M | Input «Precio de venta» sale del array del Collapsible «Financiero» (condicionado a `esNuevo`) y queda como `Controller` siempre visible en «D · Producto y observaciones», dentro del `fieldset`. |
| `components/console/editar-solicitud-form.tsx` | M | «Precio de venta» en `FormSection` propia, siempre visible, dentro del `fieldset`; el resto del financiero sigue sólo en nuevas. |
| `components/console/solicitud-detail.tsx` | M | Nuevo bloque `!esNuevo && s.financiero?.precioVenta` → «Financiero › Precio de venta» en usadas con valor. El bloque de nuevas no se tocó. |
| `lib/mappers/crear-solicitud.test.ts` | M | `describe('toMakeSnakePayload · precio de venta (A-01)')`: 5 tests. |
| `lib/mappers/editar-solicitud.test.ts` | A | Nuevo: 8 tests de `mapearEdicionSolicitud`. |

`lib/validators/nueva-solicitud-interna.ts` verificado y **no** editado (`precioVenta: z.string()`, línea 208, default `""` en 342; el `superRefine` no toca financieros).

**Decisión tomada sin preguntar (documentada):** el input se movió a un solo lugar fuera del bloque condicional también para Nuevas (como pide Objetivo.md: «sacar el input del bloque condicional»). En Nuevas cambia su **posición visual** (ya no está dentro del Collapsible «Financiero»); clave, validación y payload son idénticos.

**Commits:**
- `a964ae3` fix(cu-002): precio de venta viaja fuera del guard esNuevo hacia SC01 y SC-Edicion
- `9f14d40` feat(cu-002): precio de venta capturable y visible también en usadas
- (este archivo y `docs/aprendizajes.md` van en un commit `docs(cu-002)` posterior)

Diff: 7 archivos, +217 / −14.

## 3 · Pruebas

| # | Paso | Estado | Clasificación |
|---|---|---|---|
| 0 | `pnpm install --frozen-lockfile` | VERDE | — |
| 1 | `pnpm lint` | ROJO (exit 2) | **Preexistente / ambiental.** El repo no tiene `eslint.config.*` ni `.eslintrc*` (`git ls-files \| grep -i eslint` vacío); ESLint 10.1.0 aborta antes de revisar ningún archivo. Ajeno al diff. |
| 2 | `pnpm typecheck` | VERDE | `tsc --noEmit` sin errores. |
| 3 | `pnpm test` (completo) | ROJO (exit 1) | **Preexistente / ambiental.** 10 archivos `docs/_evidencia/T-TASADOR-E2E-*/{carbone-render,render-audit}-caso*.test.mts` fallan al cargar con `ENOENT: open '.env.local'` (la VM no tiene secretos, SPEC §4). Mismo fallo en la línea base tomada antes de tocar nada (1066 tests verdes). Ninguno está en el diff. |
| 3b | `pnpm vitest run lib components app` (código de producto) | VERDE | 63 archivos · **1079/1079** tests. Línea base 1066 → +13 = los nuevos de A-01. |
| 4 | `pnpm build` | VERDE | Next.js 16.2.6 (Turbopack) compila limpio. Único aviso: deprecación `middleware` → `proxy`, preexistente. |

**Tests nuevos y qué cubren:**

| Criterio | Crear (`lib/mappers/crear-solicitud.test.ts`) | Editar (`lib/mappers/editar-solicitud.test.ts`) |
|---|---|---|
| Usada con precio → clave con valor | `'2.800'` → `financiero_precio_venta_uf === '2800'` | `financieroPrecioVentaUf === '2800'` |
| Usada sin precio → clave omitida, sin error | clave ausente + `nuevaSolicitudInternaSchema` no rechaza precio vacío | `''`, `undefined` y `financiero` ausente → clave ausente |
| Usada no arrastra el resto | 7 claves `financiero_*` + `valor_uf` ausentes | 7 claves `financiero*Uf` ausentes (edición no tiene `valor_uf`) |
| Nueva idéntica | 9 claves normalizadas | 8 claves normalizadas + guardar sin tocar conserva `'12500'` |

Resultado: 13/13 nuevos verdes; 18/18 en `lib/mappers`.

**No validable de noche (SPEC §7):** render real de los formularios y el round-trip contra Airtable/Make (la VM no tiene token). El repo no tiene tests de componentes: el criterio de UI se verificó leyendo el diff y queda para la prueba manual («Cómo probarlo tú» del PR).

<details><summary>Salida cruda</summary>

```
$ pnpm lint
> vproperty-ejecutiva@0.1.0 lint /home/user/if-ejecutiva
> eslint .

Oops! Something went wrong! :(
ESLint: 10.1.0
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
 ELIFECYCLE  Command failed with exit code 2.

$ pnpm typecheck
> tsc --noEmit
(sin errores)

$ pnpm test
 FAIL  docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003/carbone-render-caso1.test.mts
 FAIL  docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003/render-audit-caso1.test.mts
 FAIL  docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/carbone-render-caso{2,3,4,5}.test.mts
 FAIL  docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/render-audit-caso{2,3,4,5}.test.mts
Error: ENOENT: no such file or directory, open '.env.local'
 ❯ ...carbone-render-caso1.test.mts:12:20
     12| for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
 Test Files  10 failed | 63 passed | 5 skipped (78)
      Tests  1079 passed | 9 skipped (1088)

$ pnpm vitest run lib components app
 Test Files  63 passed (63)
      Tests  1079 passed (1079)

$ pnpm build
▲ Next.js 16.2.6 (Turbopack)
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
✓ Compiled successfully in 9.5s
✓ Generating static pages using 3 workers (5/5) in 238ms
```
</details>

## 4 · Auditor ciego

Veredicto textual del agente `auditor-ciego` (no leyó los reportes de los otros agentes; trabajó sobre `git diff main...HEAD`, commits `a964ae3` y `9f14d40`):

| Criterio | Resultado | Evidencia |
|---|---|---|
| C1. Alta de una Usada: precio ingresable sin abrir bloque condicional | OK | `new-request-sheet.tsx:2190-2199`: `Controller precioVenta` fuera de `{esNuevo && …}` (2201), dentro de «D · Producto y observaciones» (2105), que no es condicional y abre por defecto (302-311). Ya no está en el array de «Financiero» (2205-2213). |
| C2. Precio vacío: el alta procede y la clave se omite | OK | `nueva-solicitud-interna.ts:208` `z.string()`, default `""` (342), sin editar. `crear-solicitud.ts:160-163` `numeroPlano` → `undefined` si vacío. Tests en ambos archivos. |
| C3. Usada con precio: crear y editar llevan la clave | OK | `crear-solicitud.ts:374-376`; `editar-solicitud.ts:282-284`; UI de edición `editar-solicitud-form.tsx:1096-1105`; `setFinanciero` (189-194) crea el objeto si falta. |
| C4. Usada: los otros 7 + `valor_uf` no viajan | OK | Guard intacto en `crear-solicitud.ts:383-399` y `editar-solicitud.ts:288-297`; tests recorren `CLAVES_SOLO_NUEVA`. |
| C5. Nueva idéntica | OK (observación) | Payloads iguales (tests 9/8 claves); detalle de nuevas intacto (`solicitud-detail.tsx:1137-1164`). Observación: en Nuevas el input cambió de posición en ambos formularios — lo exige la propia Actividad; datos y payload no cambian. |
| Detalle de Usada con valor | OK | `solicitud-detail.tsx:1166-1174`; el lector `lib/solicitudes.ts:828-836` puebla el dato sin condicionar. |
| Otros 7 financieros siguen tras `esNuevo` en los 5 puntos | OK | `new-request-sheet.tsx:2201-2227`, `editar-solicitud-form.tsx:1107+`, `solicitud-detail.tsx:1137`, `crear-solicitud.ts:383`, `editar-solicitud.ts:288`. |
| Alcance: solo los 7 archivos confirmados; validador sin editar | OK | — |
| Sin `@radix-ui`, `asChild`, `NEXT_PUBLIC_`, `tailwind.config` | OK | Ninguna línea agregada los contiene. |
| Mensajes §6 intactos | OK | Solo etiquetas «Precio de venta»/«Financiero» y comentarios. |
| `docs/_md/audios` y `docs/_metodo` sin modificar (R4) | OK | Sin rutas en el diff. |
| `pnpm test` re-ejecutado | Rojo ajeno al diff | 1079 verdes; 10 fallos `.env.local` en `docs/_evidencia/**`. `lib/mappers` 18/18 verde; typecheck limpio; lint sin config. |

**Veredicto final del auditor: OK.**

Observaciones no bloqueantes: (1) «Vacío ⇒ SC-Edicion escribe vacío» es inferencia del contrato, no verificada en runtime; para Nuevas es el mismo comportamiento que antes. (2) Mencionar en el PR el cambio de posición del input en Nuevas.

## 5 · Estado final

**PARCIAL (por regla R2 literal) — código completo, auditor OK.**
El gate del SPEC §7 exige los 5 pasos verdes; `pnpm lint` y `pnpm test` completo salen rojos por dos causas **preexistentes y ambientales** (no hay config de ESLint en el repo; 10 tests de evidencia exigen `.env.local`). Typecheck, build y todo el código de producto (1079 tests) están verdes. Si Sergio acepta la excepción, la Actividad pasa a HECHA sin más trabajo. `docs/Objetivo.md` **no** se marcó HECHA por eso.

## 6 · Bloqueos y pendientes

Ningún bloque BLOQUEADO. Para Sergio:

1. **Aceptar o no la excepción ambiental del gate** (§5). Para que el gate quede verde en noches futuras: (a) agregar un `eslint.config.mjs` (o quitar el script `lint`), y (b) excluir `docs/**` del `include` de `vitest.config.mts` o hacer que esos tests hagan `skip` sin `.env.local`. Ambas son tandas propias, fuera de A-01.
2. **Deuda preexistente (no tocada):** en una usada, cada guardado desde «Editar solicitud» manda vacíos los 7 campos financieros solo-nueva → SC-Edicion los vacía en Airtable (INFERIDO). Es inocuo si las usadas nunca deben tenerlos; confirmar.
3. **Posible pérdida histórica (INFERIDO):** usadas editadas antes de este cambio pudieron perder un `financiero_precio_venta_uf` que tuvieran. No hay recuperación desde la app.
4. **Verificación funcional manual** con `pnpm dev` siguiendo «Cómo probarlo tú» del PR (crear usada con precio → ver en detalle → editar → borrar).

## 7 · Rollback

Cerrar el PR sin merge: `main` no se tocó y Make/Airtable tampoco. Si ya se mergeó: `git revert 9f14d40` (UI) y/o `git revert a964ae3` (mappers + tests); son independientes. Nada se revirtió durante la noche.
