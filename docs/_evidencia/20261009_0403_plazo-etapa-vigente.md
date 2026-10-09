# Evidencia · A-02 — Plazos de la etapa vigente, no el agregado · 2026-10-09 04:03 UTC

> Hora UTC de la VM (inicio de la tanda). Cierre: ~04:40 UTC (≈ 01:40 hora de Chile).

## 1 · Contexto

| Campo | Valor |
|---|---|
| Actividad | **A-02** de `docs/Objetivo.md` — estado al iniciar: CONFIRMADA (verificado en Bloque 0) |
| Origen | **C-02** · `docs/_md/audios/revision 1.txt:3-5` («ingresamos la solicitud y ahí… apareció que quedaban dos horas y dos días y veinte y no sé cuántas horas… debiese contar que quedan las cuatro horas para el llamado o las seis horas para el primer llamado» · «acuérdate que son cuatro horas para el llamado») y `docs/_md/audios/r21.txt:7` («cuando cargamos empieza a decir dos días… el primero debe ser ocho horas para la visita») |
| Rama | `claude/actividad-a02-tanda-nocturna-d5tenk` |
| SHA inicial de `main` | `834998bded394275f1bf3a8044ea12b08109693e` |
| Sesión cloud | VM sin `.env` ni secretos (SPEC §4) · nada alcanzó Airtable, Make ni producción |
| Agentes | `planificador-tanda` → `ejecutor-ui` (3 pasadas) → `probador-tanda` → `auditor-ciego` (3 pasadas, la última sobre el estado final) |

**Diagnóstico de partida (planificador, verificado por la sesión principal):**
- El lugar destacado de la fila (bandeja `solicitud-list.tsx:490`) y la cabecera del detalle (`solicitud-detail.tsx:484`) mostraban el **agregado «N días»** (`computeSlaDias`, `lib/solicitudes.ts:440-456`). En las altas nuevas es un valor de relleno: `fecha_limite_entrega` vale `#ERROR` (CI-005), así que sale 2 o 3 según el literal del semáforo. **Ese es el «quedan dos días» del audio.**
- La píldora de etapa existía, pero en segundo plano y medida con **reloj de pared** (`etiquetaEtapa` + `duracionCorta`, 1 día = 1440 min): un viernes a las 17:00 con vencimiento el lunes a las 11:00 decía «Vence en 2d 18h» cuando quedan 3 horas hábiles.

## 2 · Cambios aplicados

| Archivo | Tipo | Resumen |
|---|---|---|
| `lib/sla-plazo-etapa.ts` | A | Helper **puro y apto para cliente**: `minutosHabilesAlVence`, `duracionHabil`, `ETAPA_DESTACABLE_POR_ESTADO` (`creada`↔e1, `asignada`↔e2 · §5.2.4 «De → A»), `ETAPAS_CON_CIERRE_ESCRITO` (e1, e2) y `plazoEtapaDestacado` (devuelve `null` cuando no es computable → UI de antes). Sin números de SLA; el color es `sla_semaforo_etapa` tal cual. |
| `lib/sla-plazo-etapa.test.ts` | A | 29 tests: etapa → texto, casos `null`, vencidas, feriado, agregado conservado, regresión C-02 (RO-06) y test estructural RO-05 (los literales del código son sólo 0, 1, 2 y 60). |
| `lib/console-data.ts` | M | Campo opcional `minutosHabilesAlVence?: number \| null` en `SlaEtapaSolicitud`. |
| `lib/solicitudes.ts` | M | `mapRecord` recibe `feriados?` y `ahora` (inyectable); calcula `minutosHabilesAlVence`. `fetchSolicitudes` lee `C_Feriados` (`obtenerFeriados`, caché 12 h) con try/catch: si falla, el campo queda `null` y la bandeja se ve como hoy. |
| `lib/solicitudes.test.ts` | M | 3 tests de `mapRecord` (con feriados, sin feriados = etiqueta idéntica a hoy, sin `slaEtapa`). |
| `app/api/solicitudes/[id]/route.ts` | M | Misma lectura tolerante de feriados que la bandeja (RO-05). Hoy ninguna pantalla consume este GET; se iguala por coherencia. |
| `components/console/solicitud-list.tsx` | M | Con `plazo`: arriba la etapa en horas hábiles y en la fila de chips el agregado en días. Sin `plazo`: el JSX de antes, byte a byte. |
| `components/console/solicitud-detail.tsx` | M | Cabecera: con `plazo`, el orden es estado · etapa · prioridad · agregado; sin `plazo`, como antes. Usa el `estado` local, así que tras la asignación optimista vuelve a la presentación previa hasta la relectura. |
| `docs/_evidencia/20261009_0403_plazo-etapa-vigente.md` | A | Este archivo. |
| `docs/aprendizajes.md` | M | Entrada de bitácora al final (sólo append). |

**Textos nuevos** (estilo §6.1, sin exclamación ni puntos suspensivos): `Quedan {X} hábiles` · `Vencida hace {X} hábiles` · `Vencida`. La píldora queda, por ejemplo, como **«E1 · Quedan 3h hábiles»**. Formato de duración `4h`, `3h 20m`, `45m`; nunca en días, porque un día hábil son 9 horas.

**Commits:**

| SHA | Mensaje |
|---|---|
| `223edd4` | feat(cu-002): helper puro de plazo de etapa en horas hábiles (A-02) |
| `cf819bf` | feat(cu-002): mapRecord calcula minutos hábiles al vencimiento de la etapa (A-02) |
| `e21887e` | feat(cu-002): bandeja y detalle destacan el plazo de la etapa vigente (A-02) |
| `e631608` | fix(cu-002): e2 roja sin escritor de cierre no se destaca como vencida (A-02) — **premisa falsa, revertida en el siguiente** |
| `e4a09cc` | fix(cu-002): e2 roja se destaca como llamado vencido; corrige premisa de CI-037 (A-02) |
| (cierre) | docs(cu-002): evidencia A-02 + bitácora + docblock exacto sobre filas previas al Frente C |

**Por qué hay un ida y vuelta (`e631608` → `e4a09cc`).** La primera auditoría ciega señaló que, según CI-037, nada cierra la e2, y que por eso toda `asignada` destacaría «Vencida hace NNNh». La sesión principal aplicó la mitigación del SPEC §8 y dejó de destacar la e2 roja. La segunda auditoría demostró que esa premisa ya no es cierta: `app/api/tasaciones/[id]/coordinacion/route.ts:229-233` cierra e2 y e3 al registrar el llamado (Frente C, desde el 21-ago-2026). **La ficha CI-037 está desactualizada.** Con eso, una `asignada` con e2 roja es un llamado vencido real, el caso más accionable de C-02, y vuelve a destacarse.

## 3 · Pruebas

| Paso | Resultado | Nota |
|---|---|---|
| `pnpm install --frozen-lockfile` | VERDE | clon limpio |
| `pnpm lint` | **ROJO · PREEXISTENTE** | `ESLint couldn't find an eslint.config.(js\|mjs\|cjs) file.` Idéntico en `main` 834998b. No hay config de ESLint v9 en el repo («deuda diferida: eslint», `docs/aprendizajes.md`). No se arregla: está fuera del alcance de A-02. |
| `pnpm typecheck` | VERDE | `tsc --noEmit` sin salida |
| `pnpm test` | **ROJO · PREEXISTENTE** | `Test Files 10 failed \| 63 passed \| 5 skipped (78) · Tests 1098 passed \| 9 skipped`. Los 10 FAIL son las suites `docs/_evidencia/T-TASADOR-E2E-*/**.test.mts`, todas con `ENOENT: open '.env.local'`: necesitan secretos de producción que la VM no tiene por diseño (SPEC §4). En `main` falla lo mismo (`10 failed \| 62 passed`, 1066 tests). |
| `pnpm vitest run lib app components` (suite de la app) | VERDE | **63/63 archivos · 1098/1098 tests** (en `main`: 1066 → +32 tests de A-02) |
| `pnpm build` | VERDE | `✓ Compiled successfully` · 46 rutas generadas |

**Tests nuevos:**
- `lib/sla-plazo-etapa.test.ts` (29):
  - Minutos hábiles: viernes 17:00 → lunes 11:00 = 180; feriado intermedio; negativo; normalización de −0; `null` sin calendario.
  - `duracionHabil`.
  - Emparejamiento estado↔etapa y `ETAPAS_CON_CIERRE_ESCRITO`.
  - «Quedan 3h hábiles» y no «2d 18h»; e2 verde y ámbar.
  - Ramas `null`: sin `slaEtapa`, `sin_dato`, sin `venceTs`, sin feriados, etapa que no corresponde al estado, `asignada` en e4, verde/ámbar con minutos ≤ 0.
  - Vencidas e1 y e2.
  - Agregado conservado.
  - **RO-06** · regresión C-02.
  - **RO-05** · test estructural sin números de SLA.
- `lib/solicitudes.test.ts` (+3): `mapRecord` con y sin feriados, y sin `slaEtapa`.
- Ningún test nuevo hace red ni toca Airtable: el helper es puro y `mapRecord` recibe los feriados como `Set`.

**Salida cruda relevante:**

```
> eslint .
Oops! Something went wrong! :(
ESLint: 10.1.0
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
 ELIFECYCLE  Command failed with exit code 2.

> tsc --noEmit
(sin salida · exit 0)

 FAIL  docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003/carbone-render-caso1.test.mts
 … (10 suites docs/_evidencia/T-TASADOR-E2E-*, mismo error)
Error: ENOENT: no such file or directory, open '.env.local'
 Test Files  10 failed | 63 passed | 5 skipped (78)
      Tests  1098 passed | 9 skipped (1107)

$ pnpm vitest run lib app components
 Test Files  63 passed (63)
      Tests  1098 passed (1098)

$ pnpm build
▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 8.6s
✓ Generating static pages using 3 workers (5/5)
(46 rutas · ƒ /consola · ƒ /api/solicitudes · ƒ /api/solicitudes/[id] …)
```

## 4 · Auditor ciego

Hubo tres pasadas. Se transcribe la **última**, hecha sobre el estado final (HEAD `e4a09cc`, más un ajuste de un comentario que se aplicó después; ver §6.3).

| # | Criterio | Veredicto | Cómo se verificó |
|---|---|---|---|
| 1 | Recién creada: el plazo destacado es el de la **etapa de coordinación** en horas hábiles, no «2 días» | **PARCIAL** | Una `creada` destaca **E1 · Ingreso de solicitud** (`lib/sla-plazo-etapa.ts`, `creada: 1`), en horas hábiles, y «2 días» deja el lugar destacado (`solicitud-detail.tsx:501-505`). Según §5.2.4 (Spec :4170-4174), la e1 «Ingreso» es 2 h ideal / 3 h máximo, y la e2 «Coordinación de visita (llamado)», de 4 h / 6 h, **la abre la asignación** (`asignar/route.ts:104-132`). El criterio y el «4–6 h de coordinación al ingreso» de Objetivo.md contradicen la Spec. **El código sigue la Spec**, que es la fuente normativa; mostrar e2 desde el alta exigiría fabricar un vencimiento que no existe. |
| 2 | Etapa no computable → igual que hoy | **OK** | 9 ramas `null` en `plazoEtapaDestacado`; en esa rama el JSX es idéntico al de `main`, byte a byte (bandeja `:498-499`, `:521-522`; detalle `:507-511`). |
| 3 | El semáforo agregado sigue como dato secundario | **OK** | `SLABadge dias/total` sigue en las dos ramas (bandeja `:518-519`, detalle `:505`); los valores no cambian. |
| 4 | Umbrales de las libs; ningún número de SLA nuevo (RO-05) | **OK** | En el código sólo hay 0, 1, 2 y 60 (lo fija un test estructural); el tono no se recalcula; minutos con `minutosHabilesEntre` y feriados con `obtenerFeriados`. |
| — | Alcance del diff | **OK** | 8 archivos coherentes con A-02. Hay tres fuera de la lista de «probables» (`lib/solicitudes.ts`, `lib/console-data.ts`, `app/api/solicitudes/[id]/route.ts`), justificados porque los feriados sólo se leen en el servidor. Es una **lectura** extra; no hay escrituras. No toca Make, `C_SLA`, fórmulas, motor ni `docs/_md/audios` / `docs/_metodo`. |
| — | Reglas duras | **OK** | Sin `@radix-ui`, `asChild`, `NEXT_PUBLIC_`, `tailwind.config` ni `sticky`; mensajes §6 intactos; sin escrituras desde la UI; el helper cliente no arrastra código de servidor. |
| — | Re-ejecución | **OK** | typecheck verde · app 1098/1098 · `pnpm test` con los 10 rojos de `.env.local` no introducidos por el diff. |

**Matriz estado × etapa × tono** (con feriados legibles):

| Estado | Etapa | Verde / Ámbar | Rojo | `sin_dato` |
|---|---|---|---|---|
| `creada` | e1 | **destaca** «Quedan Xh hábiles» | **destaca** «Vencida hace Xh hábiles» / «Vencida» | como hoy |
| `asignada` | e2 | **destaca** «Quedan Xh hábiles» | **destaca** «Vencida hace Xh hábiles» | como hoy |
| `asignada` | e1 (vista optimista) · e4 (ya coordinada) | como hoy | como hoy | como hoy |
| `visitada` en adelante | cualquiera | como hoy | como hoy | como hoy |

Sin feriados (Airtable caído o sin token), **siempre como hoy**.

**Hallazgos del auditor (últimas dos pasadas):**
- **H1** · El criterio 1 contradice §5.2.4: es decisión de producto, no un defecto de código (ver §6).
- **H2** · Las filas `asignada` anteriores al Frente C que siguen con e2 abierta van a destacar «E2 · Vencida hace NNNh hábiles». Según los datos es correcto (el llamado nunca se registró en el sistema), pero si se hizo por fuera exagera el vencimiento. Conviene contar en Airtable cuántas `asignada` están en e2 en rojo antes del merge. El comentario del módulo que lo describía mal se corrigió en el commit de cierre.
- **H3** · Un rojo con minutos > 0 muestra «Vencida» a secas: el texto sigue al color de la fórmula. Impacto práctico nulo.
- **H4** · Textos menores: con exactamente 1 hora sale «Quedan 1h hábiles», y un vencimiento muy antiguo se escribe en horas («Vencida hace 1234h hábiles»).
- **H5** · La cifra se calcula al leer en el servidor y no avanza en el cliente hasta la relectura. Igual que la etiqueta anterior, así que no es regresión.
- **H6** · El orden «por SLA» de la bandeja sigue usando `slaDias`, que ya no es el dato destacado. Fuera de los criterios.
- **H7** · El cambio en `GET /api/solicitudes/[id]` no lo consume ninguna pantalla hoy: es inocuo y coherente.

**Veredicto final del auditor: PARCIAL.** Causa única: la redacción literal del criterio 1. Los criterios 2–4, el alcance, las reglas duras y la ausencia de regresión están OK.

## 5 · Estado final

**PARCIAL.** El código está terminado y probado, y queda listo para revisión. No se marca HECHA (R2) por dos causas:
- **Criterio 1:** su redacción pide destacar la «etapa de coordinación» al ingreso, pero según la Spec §5.2.4 la etapa vigente al ingreso es **e1 · Ingreso de solicitud (2 h / 3 h)**; la coordinación (e2, 4 h / 6 h) empieza al asignar. El código muestra la etapa vigente real y no inventa un plazo.
- **Gate:** `pnpm lint` y `pnpm test` completos están en rojo **desde antes en `main`** (no hay `eslint.config`; 10 suites de evidencia necesitan `.env.local`). La suite de la app, el typecheck y el build están verdes.

`docs/Objetivo.md` no se modificó: A-02 sigue figurando como CONFIRMADA hasta que Sergio decida.

## 6 · Bloqueos y pendientes (para Sergio)

1. **Decisión de producto sobre el criterio 1.** Hay dos caminos:
   - **(a)** Aceptar «etapa vigente = e1 al ingreso, e2 tras asignar» y reescribir el criterio. Es lo que hace este PR y lo que dice la Spec.
   - **(b)** Si Héctor quiere ver las 4–6 h del llamado desde el alta, cambiar §5.2.4 o `C_SLA_Etapas`. Eso es decisión de producto y cambio de Airtable, fuera de la noche.
   - El audio (`revision 1.txt:3`) apunta a **(b)**: al ingreso, Héctor espera ver «las cuatro horas para el llamado o las seis horas». En la Spec, en cambio, el llamado (e2) empieza recién al asignar, y antes corre e1 (2 h / 3 h). La noche no resuelve esa diferencia: la deja expuesta.
   - Ojo: `r21.txt:7` menciona además «ocho horas para la visita», una tercera cifra.
2. **H2 · contar las `asignada` en e2 roja** en Airtable antes del merge: si hay muchas filas viejas, la bandeja va a mostrar varias «Vencida hace NNNh hábiles» de golpe.
3. **CI-037 está desactualizada** respecto de e2: desde el Frente C, `coordinacion/route.ts` sí cierra e2 y e3. No se editó en esta tanda (fuera de alcance); conviene actualizar la ficha.
4. **ESLint sin configuración** (`eslint.config.js` ausente) y **suites de `docs/_evidencia` dentro de `pnpm test`**: dejan el gate en rojo en cualquier sesión cloud. Hay que decidir si se crea la config y si se excluye `docs/**` de vitest, en una tanda propia.
5. **Choque probable con A-03:** también toca `solicitud-list.tsx`. Si se mergean las dos, la segunda va a necesitar resolver conflicto en `FilaSolicitud`.
6. **Decisión de `docs/diseno.md:191-192`** («no reutilizar el SLABadge agregado sin decidir antes cuál manda»): este PR decide que manda la etapa cuando es computable. `diseno.md` no se tocó; si se acepta, conviene registrarlo ahí.

## 7 · Rollback

Cerrar el PR sin merge: `main` nunca se tocó. Si se mergea y se quiere deshacer, basta con revertir `e21887e`. Sin la UI, el helper y el campo nuevo quedan sin consumidor y la pantalla vuelve a ser la de antes. Durante la noche se revirtió lógicamente `e631608` con `e4a09cc` (ver §2), sin reescribir historia.
