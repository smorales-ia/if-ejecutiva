# Evidencia · A-03 — Filtro «sin fecha de visita > 24 h» · 2026-10-09 04:26 UTC

> Hora UTC de la VM (Chile, GMT−3 en octubre: 01:26). Formato SPEC §6
> (`docs/_planes/SPEC_NOCHE-NUBE-UIEJECUTIVA_20261008.md`).

## 1 · Contexto

| | |
|---|---|
| Actividad | **A-03** · Filtro «sin fecha de visita > 24 h» (`docs/Objetivo.md`, estado CONFIRMADA al inicio) |
| Origen | **M-08**: transcripciones `p5.txt` («un filtro para ver todos los que no tienen fecha de visita desde que llegó pasadas las 24 horas») y `p7.txt` («yo hoy día no sé de todos los informes cuántos no tienen fecha de visita») |
| Norma | Spec v1.9.17 §5.2.8 (tope de 24 h hábiles para responderle al cliente con fecha de visita), D-18 (sin alerta en pantalla) y §5.2.9 (filtro de bandeja) |
| Rama | `claude/actividad-a03-tanda-nocturna-ymp6v7` |
| SHA inicial de main | `834998bded394275f1bf3a8044ea12b08109693e` |
| Sesión cloud | https://claude.ai/code/session_014Bs9KQwUxnCRiRNYrgsRZg |
| Agentes | `planificador-tanda` → `ejecutor-ui` → `probador-tanda` → `auditor-ciego` (este último no leyó los logs de los demás) |

**BLOQUE 0:** A-03 figuraba como CONFIRMADA en `docs/Objetivo.md`. Los archivos probables existían y A-03 no estaba implementada: no había ningún filtro ni contador de «sin fecha de visita». Ni Airtable ni Make se consultaron ni se escribieron (el MCP `airtable` no conectó en esta VM y tampoco hacía falta).

**Línea base medida en main antes de editar:**
- `pnpm lint` falla porque no existe `eslint.config.(js|mjs|cjs)`. Es deuda preexistente (ver `docs/aprendizajes.md`).
- `pnpm test` falla en 10 archivos, todos `docs/_evidencia/**/*.test.mts`, con `ENOENT .env.local`. Los 62 archivos y 1066 tests del código pasan.
- `pnpm typecheck` y `pnpm build` en verde.

## 2 · Cambios aplicados

| Archivo | Tipo | Resumen |
|---|---|---|
| `lib/sin-fecha-visita.ts` | A | Predicado puro `sinFechaVisitaVencida(s, ahora, feriados)` sobre `sumarHorasHabiles` y `proximoInstanteHabil` de `lib/sla-habil.ts`. Declara la única constante `TOPE_RESPUESTA_CLIENTE_HORAS_HABILES = 24` (RO-05), los estados excluidos y el parámetro de URL, la clave del contador y la etiqueta. Se puede usar desde el cliente: no importa nada de servidor. |
| `lib/sin-fecha-visita.test.ts` | A | 18 tests: borde exacto, fin de semana, ingreso en sábado, feriado, Viernes Santo con cambio de horario, vencimiento justo a las 18:00, con o sin fecha, estados terminales, ingreso inválido o futuro, y un oráculo `minutosHabilesEntre`. |
| `lib/console-data.ts` | M | `Solicitud` suma `ingresoTs?` y `fechaVisitaProgramada?`, ambos opcionales. |
| `lib/solicitudes.ts` | M | `SolicitudesFiltros.sin_fecha_visita`. `mapRecord` deriva `ingresoTs` (`sla_e1_inicio_ts`, si no `fecha_solicitud`, si no `createdTime`) y `fechaVisitaProgramada`. `fetchSolicitudes` filtra en memoria antes de paginar y conserva el orden. No agrega fórmula Airtable. Los feriados se leen solo con el filtro activo, y si su lectura falla se cuenta sin feriados. |
| `lib/solicitudes.test.ts` | M | Tests de `mapRecord` y de la proyección de campos. Verifican que `buildFormula` y `filterByFormula` salen idénticos con y sin el filtro. Para `fetchSolicitudes` cubren el orden conservado, que no hay lectura de feriados sin el filtro, que los feriados entran al cálculo y la degradación cuando fallan. |
| `app/(ejecutiva)/consola/page.tsx` | M | Pasa `?sin_fecha_visita` a `fetchSolicitudes`. |
| `app/api/solicitudes/route.ts` | M | Ídem para el GET de la lista. |
| `app/api/solicitudes/contadores/route.ts` | M | Clave nueva `sin_fecha_visita_24h`, calculada con la misma consulta que la bandeja (`todas` + filtro). Vale 0 si falla. |
| `app/api/solicitudes/contadores/route.test.ts` | A | 4 tests del contador. |
| `components/console/solicitud-list.tsx` | M | Toggle nativo `<button aria-pressed>` en el panel de filtros, debajo de «Etapa SLA». Muestra un contador gris solo si es mayor que 0. Entra en `CLAVES_FILTRO`, así que «Limpiar filtros» lo borra y un deep link abre el panel. No tiene rojo, ámbar ni icono (D-18), y no toca filas ni orden. |
| `docs/_evidencia/20261009_0426_filtro-sin-fecha-visita.md` | A | Este archivo. |
| `docs/aprendizajes.md` | M | Entrada de sesión (append). |

**Commits:**
- `fb0565d` feat(cu-002): filtro de bandeja «sin fecha de visita · más de 24 h hábiles»
- `dacd9f3` test(cu-002): fija que la proyección pide los campos del filtro sin fecha de visita
- `38dfa69` test(cu-002): corrige fechas de vencimiento en comentarios del test del filtro (hallazgo m-5 del auditor)
- más el commit de esta evidencia

**Decisiones de diseño:**
- **Cálculo en el servidor, no en el cliente.** `lib/feriados.ts` solo funciona en el servidor y la lista llega paginada de a 20 filas, así que filtrar en el cliente daría totales falsos. El filtro sigue el precedente de `ordenarPorSla`: en memoria, sobre el conjunto completo, antes de paginar. No se creó ningún endpoint.
- **El tope no es una etapa.** §5.2.8 lo define como una restricción que atraviesa las etapas 2 a 4, por eso no sale de `C_SLA_Etapas`. Hay una sola constante con referencia a la spec.
- **Ingreso.** Se toma el hito de §5.2.2 (`sla_e1_inicio_ts`). Si falta, se usa `fecha_solicitud` (dateTime) y, en último caso, `createdTime`. Sin ingreso válido la fila no se lista: no se inventa antigüedad.

## 3 · Pruebas

Batería final sobre `38dfa69`, en la VM y sin secretos:

| Paso | Estado | Resumen |
|---|---|---|
| `pnpm install --frozen-lockfile` | VERDE | Done in 8.2s |
| `pnpm lint` | **ROJO PREEXISTENTE** | exit 2: `ESLint couldn't find an eslint.config.(js\|mjs\|cjs) file.` Es idéntico en main y la tanda no toca configuración de eslint. |
| `pnpm typecheck` | VERDE | `tsc --noEmit` exit 0 |
| `pnpm test` | **ROJO PREEXISTENTE** | `Test Files 10 failed \| 64 passed \| 5 skipped (79)` · `Tests 1099 passed \| 9 skipped`. Los 10 rojos son los mismos de main, todos `docs/_evidencia/**/*.test.mts` con `ENOENT .env.local` (10/10). |
| `vitest run --exclude 'docs/**'` (código) | VERDE | `Test Files 64 passed (64)` · `Tests 1099 passed (1099)`. Main daba 62/1066, así que la tanda suma 2 archivos y 33 tests. |
| `pnpm build` | VERDE | `✓ Compiled successfully in 9.3s`, exit 0 |

Tests nuevos o ampliados: `lib/sin-fecha-visita.test.ts` (nuevo), `app/api/solicitudes/contadores/route.test.ts` (nuevo) y `lib/solicitudes.test.ts` (ampliado). Todos usan `vi.mock` y ninguno toca Airtable.

## 4 · Auditor ciego

Transcripción del veredicto (auditor sin acceso a los logs de los demás agentes, sobre `dacd9f3`):

| # | Criterio / regla | Veredicto | Evidencia |
|---|---|---|---|
| CA-1 | Una solicitud con más de 24 h hábiles y sin fecha aparece con el filtro activo y suma al contador | OK | Predicado en `lib/sin-fecha-visita.ts:89-107`. Se aplica en memoria en `lib/solicitudes.ts:965-975`, antes de paginar. El contador usa la misma consulta en `contadores/route.ts:81-84`. Tests en `solicitudes.test.ts` y `contadores/route.test.ts:59` |
| CA-2 | Con fecha de visita fijada nunca aparece | OK | `sin-fecha-visita.ts:95` lee el campo crudo, no el centinela «Por agendar». Test en `sin-fecha-visita.test.ts:180` |
| CA-3 | Horas hábiles con las libs existentes, sin duplicar el calendario | OK | Usa `sumarHorasHabiles` y `proximoInstanteHabil`, más `obtenerFeriados()`. Bordes contrastados con un oráculo independiente en `sin-fecha-visita.test.ts:76-173` |
| CA-4 | Se combina con los filtros existentes y no altera el orden por defecto | OK | La fórmula Airtable es idéntica con y sin el filtro, y `filter` conserva el orden. Entra en `CLAVES_FILTRO` (`solicitud-list.tsx:96`) |
| — | Pruebas pedidas (fin de semana, feriado, con y sin fecha) | OK | Los tres archivos de test |
| — | Alcance limitado a A-03; no toca Airtable, Make, audios, `_metodo` ni `package.json` | OK | `git diff --stat main...HEAD -- docs .claude package.json pnpm-lock.yaml` salió vacío antes de esta evidencia |
| — | `@radix-ui`, `asChild`, `NEXT_PUBLIC_`, `tailwind.config`, `sticky` | OK | Ninguno aparece en el diff |
| — | Mensajes §6 intactos · `…` | OK | No hay literales §6 tocados ni puntos suspensivos nuevos |
| — | Nada de servidor en `"use client"` | OK | `solicitud-list.tsx` solo importa `lib/sin-fecha-visita`, que a su vez solo importa `sla-habil` y tipos |
| — | RO-05 | OK | El 24 se declara una sola vez (`sin-fecha-visita.ts:32`) y la etiqueta lo interpola |
| — | D-18 | OK (con nota M-3) | Contador gris dentro del panel plegable. No hay badge por fila ni nada en el header |
| — | `pnpm typecheck` y vitest de código | OK | exit 0 · 64/64 archivos, 1099/1099 tests |
| — | `pnpm test` completo y `pnpm lint` | Igual que en main | 10 rojos de `docs/_evidencia` y eslint sin config, ambos preexistentes |

**Veredicto final del auditor: OK.** Hallazgos adicionales:
- **M-1 (medio): posibles falsos positivos.** `ESTADOS_FUERA_DEL_TOPE` excluye solo `entregada`, `cerrada` y `cancelada`. Una fila en un estado posterior a la visita (`visitada`, `calculada`, `pdf_listo`, `aprobada`, `devuelta`, `pendiente_final`) que no tenga `fecha_visita_programada` se listaría. **Se deja como decisión de Sergio**: la Actividad no define «activas» y se eligió la lista conservadora, que prefiere mostrar de más antes que esconder casos.
- **m-2 (menor): diferencia con §5.2.9.** La spec pide el filtro «ordenado por antigüedad desde el ingreso», mientras que el CA-4 de A-03 pide no alterar el orden. Esta noche mandó la Actividad, que estaba CONFIRMADA.
- **M-3 (nota D-18):** el contador tiene forma `rounded-full`, igual que las pestañas. El auditor lo considera un conteo neutro de un control de filtro y no una píldora de alerta. Queda para que Sergio lo ratifique.
- **m-4 (menor): lecturas extra.** El endpoint de contadores hace una lectura completa más de `TX_Solicitudes` por cada cambio de filtros: eran 6 consultas en paralelo y ahora son 7. Hay riesgo de 429 si la tabla crece.
- **m-5 (menor): comentarios de test con fechas erróneas.** **Corregido** en `38dfa69`; las aserciones ya estaban bien.
- **m-6:** la evidencia faltaba en el momento de la auditoría. Es este archivo.

## 5 · Estado final

**PARCIAL.** El código y los criterios de aceptación están completos: auditor OK 4/4, typecheck y build en verde, 1099/1099 tests de código en verde. Pero el gate del SPEC §7 exige `pnpm lint` y `pnpm test` en verde literal, y ambos siguen rojos **por deuda heredada de main**: falta `eslint.config`, y los 10 tests de `docs/_evidencia` dependen de `.env.local`. La tanda no causó ni empeoró ninguno de los dos.

Arreglarlos queda fuera del alcance de A-03 y no era decisión de esta noche: implica sumar una configuración de eslint, que necesita revisión explícita, y excluir `docs/**` del runner de vitest. Por la regla R2 la Actividad **no se marca HECHA** en `docs/Objetivo.md`.

## 6 · Bloqueos y pendientes

Para Sergio:
1. **Gate:** decidir si los dos rojos preexistentes cuentan como bloqueo de A-03. Si no cuentan, A-03 pasa a HECHA al aprobar el PR. Hay dos arreglos posibles, cada uno en su propia tanda:
   - crear `eslint.config.mjs`;
   - excluir `docs/**` en `vitest.config.mts`.
2. **M-1:** definir qué estados cuentan como activos para el tope. Hoy se excluyen `entregada`, `cerrada` y `cancelada`. ¿Se restringe a los estados previos a la visita (`creada`, `asignada`, `requiere_atencion`)?
3. **m-2:** si se agrega en otra tanda el orden «antigüedad de ingreso» que pide §5.2.9.
4. **Motivo de no-visita:** §5.2.8 admite «fecha de visita —o el motivo por el cual no la hay—». El filtro mira solo `fecha_visita_programada`.
5. **Fallo de `C_Feriados`:** hoy se degrada a contar sin feriados, lo que sobrecuenta en días feriados. Confirmar si se acepta o si debe fallar.
6. **m-4:** el costo de la lectura extra en los contadores.
7. **Runtime:** la VM no tiene token Airtable, así que el comportamiento contra datos reales no se validó (SPEC §7). En particular falta ver el formato de `fecha_solicitud` con `cellFormat: 'string'`. Hay que validarlo con `pnpm dev` siguiendo «Cómo probarlo tú» del PR.

Nada quedó BLOQUEADO durante la ejecución.

## 7 · Rollback

Cerrar el PR sin merge; main nunca se tocó. Sin el parámetro `?sin_fecha_visita=1`, la lista se comporta igual que en main y no hace lecturas extra. Los contadores sí suman la consulta de la clave nueva. Durante la noche no se revirtió nada.
