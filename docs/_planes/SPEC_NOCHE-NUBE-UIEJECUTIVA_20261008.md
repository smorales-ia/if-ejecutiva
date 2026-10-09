# SPEC · Trabajo nocturno autónomo en la nube — Correcciones UI Ejecutiva (IF-02)

**Fecha:** 2026-10-08 · **Autor:** Claude Code (sesión con Sergio) · **Estado:** Pendiente de OK Gate de Sergio
**Repo:** `/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva` · GitHub: `smorales-ia/if-ejecutiva`

---

## 1 · Problema y objetivo

Hay 22 puntos de feedback del cliente (Héctor, Value Property) consolidados en
`docs/_md/audios/VProperty_Feedback_Cliente_v1.0.docx`: 9 correcciones (C-01..C-09) y
13 mejoras (M-01..M-13). Hoy nadie los está ejecutando de noche; Sergio trabaja de día
y el backlog crece. **Objetivo:** que esta noche, sin intervención de Sergio, se ejecuten
las correcciones que SÍ son de la UI Ejecutiva, cada una como una tanda completa
(ejecutada → probada → auditada → documentada), y que a la mañana Sergio encuentre
pull requests listos para aprobar más un archivo de evidencia por actividad.

**Metas medibles de la primera noche:**
- 2 a 3 Actividades ejecutadas, cada una con PR propio en rama `claude/...`.
- 100 % de las Actividades con archivo `docs/_evidencia/YYYYMMDD_HHMM_<slug>.md` (R2).
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` en verde en cada PR.
- Veredicto del auditor ciego registrado en cada evidencia (OK / FAIL por criterio).
- Cero escrituras a Airtable, Make o producción durante la noche.

**No-metas:** no se busca mergear nada de noche (la aprobación de PR es siempre de Sergio),
no se busca resolver los 22 puntos en una noche, y no se toca nada fuera de la UI Ejecutiva.

---

## 2 · Clasificación del feedback (regla R1)

Fuente única: `docs/_md/audios/` (12 transcripciones + DOCX consolidado). Clasificación
contra el alcance IF-02 (consola Ejecutiva: código Next.js de este repo).

### 2.1 En alcance UI Ejecutiva → Actividades de esta noche

| Act. | Punto | Qué es | Riesgo |
|---|---|---|---|
| A-01 | C-08 | Precio de venta capturable siempre al crear/editar (hoy sólo aparece en el bloque Financiero cuando la propiedad es Nueva) | Bajo |
| A-02 | C-02 (parte UI) | El detalle/bandeja muestra el plazo agregado («dos días») al ingreso; debe mostrar el plazo de la **etapa vigente** (4–6 h de coordinación). Sólo capa de presentación: las libs `lib/sla-etapas.ts`, `lib/sla-habil.ts` ya existen | Medio |
| A-03 | M-08 | Filtro/contador en bandeja: solicitudes **sin fecha de visita pasadas 24 h hábiles** desde el ingreso («hoy día no sé cuántos no tienen fecha de visita») | Bajo-Medio |
| A-04 | M-09 | Al ingresar dirección/nombre de proyecto en el alta, avisar si existen solicitudes previas con dirección parecida (detección de ya-tasadas; sólo lectura) | Medio |

### 2.2 En duda — NO se ejecutan esta noche sin OK explícito de Sergio

| Punto | Por qué está en duda |
|---|---|
| C-03 (datos mínimos del alta) | **Conflicto con la norma vigente**: la spec exige campos que el cliente pide hacer opcionales. Requiere actualizar la especificación antes de tocar código (propuesta de datos mínimos). Es UI Ejecutiva pura, pero gateada por decisión de producto. |
| C-09 (reasignar tasador post-asignada) | Conflicto con RN-44 y decisión D-01 («no existe flujo de reasignación»). Revertir una decisión de producto no es trabajo nocturno autónomo. Además requiere SC13/Make (fuera de CU-002). |
| M-11 (exportación a Excel) | Es mejora nueva (no corrección) sobre la UI Ejecutiva. Candidata a Actividad futura si Sergio la prioriza. |
| M-07 (tablero de control diario) / M-03 (reprocesos) | Features grandes con modelo de datos nuevo. Requieren tanda de planificación diurna propia, no una noche. |

### 2.3 Fuera de alcance UI Ejecutiva (R1 — no se ejecutan, quedan listadas)

| Punto | Dónde vive realmente |
|---|---|
| C-01 (código sin guiones, VP+año+mes) y M-10 (sufijo de cliente en código) | Fórmula `codigo_ext` en Airtable (`fldSuJx1fDNYYwDcD`). Cambio de base de datos, no de UI. |
| C-04 (rótulo «ROL» y fonos en el correo al tasador) | Plantilla de email en escenarios Make (SC01/SC05). |
| C-05 (adjuntos no llegan por mail) | Pipeline Make → Dropbox → email (SC-Adjuntos-Upload, con anomalía de dos versiones activas). Diagnóstico posible de día; el fix es Make. |
| C-06 (catálogo de comunas) y C-07 (catálogo de instituciones) | Carga de datos en Airtable (`M_Comunas`, `M_Clientes`). Escribir a la base productiva de noche está prohibido por este SPEC. |
| M-01, M-02, M-12 | UI del Tasador / plantillas — otro repo/CU. |
| M-04 (perfil Visador) | Otra interfaz (IF de visado), no IF-02. |
| M-05, M-06 (recordatorios automáticos) | Escenarios Make + automations (§5.2.8). |
| M-13 (WhatsApp) | Retirada por el cliente el 23-ago-2026. Sin acción. |

---

## 3 · Agentes propios (entregable 1)

Viven en `.claude/agents/` del repo (deben estar **commiteados y pusheados** para existir
en la sesión cloud). Cuatro agentes, reutilizables para cualquier tanda futura:

| Agente | Propósito | Tools | Modelo | Cuándo se usa |
|---|---|---|---|---|
| `planificador-tanda` | FASE 1 de la tanda: lee Objetivo.md + código + docs y produce el plan §1-§12 sin tocar nada | Read, Grep, Glob, Bash (sólo lectura) | inherit | Al inicio de cada Actividad |
| `ejecutor-ui` | FASE 2: aplica los cambios de código respetando las reglas duras del repo (base-ui, no Radix, Regla D, mensajes §6, `…` U+2026) | Read, Edit, Write, Grep, Glob, Bash | inherit | Tras aprobar el plan interno |
| `probador-tanda` | Corre `pnpm lint/typecheck/test/build`, escribe/ejecuta tests co-ubicados nuevos, reporta salida cruda | Read, Edit, Write, Bash, Grep, Glob | inherit | Después de cada bloque de edición |
| `auditor-ciego` | NO lee los logs de los otros agentes. Verifica sólo desde el estado final (diff, archivos, salida de tests) contra los criterios de la Actividad. Veredicto OK/FAIL por criterio | Read, Grep, Glob, Bash (sólo lectura) | inherit | Último paso obligatorio, aunque todo esté verde |

Se combinan con los agentes integrados de Claude Code (`Explore` para búsquedas amplias,
`general-purpose` para investigación, `Plan` para arquitectura) **en paralelo** siempre
que no colisionen escrituras. Regla: dentro de una Actividad, todo lo que edita el mismo
archivo va en serie; lecturas y tests pueden ir en paralelo. Un agente que falla marca su
bloque como **BLOQUEADO** y la tanda sigue con el resto.

---

## 4 · Pipeline nocturna en la nube (entregable 2)

**Decisión de diseño: sesiones cloud manuales esta noche; routine recién cuando el flujo
haya funcionado 3 noches** (escalera de progreso del PDF iapro, niveles 3 → 5; la routine
es vista previa y cada ejecución arranca sin memoria).

| Pieza | Diseño |
|---|---|
| Qué servicio corre el job | **Sesión cloud de Claude Code** (VM de Anthropic, 4 vCPU/16 GB, clon limpio del repo desde GitHub). Una sesión por Actividad = paralelismo máximo entre Actividades y aislamiento de escritura gratis (cada sesión trabaja en su propia rama `claude/...`). |
| Cómo se dispara | Sergio, antes de dormir, lanza N sesiones desde claude.ai/code (o app de escritorio, opción Cloud) pegando el prompt de lanzamiento de la Actividad (está en `Objetivo.md` y en `guia_inicio_nube.txt`). Futuro (fase 2): una routine nocturna que tome la primera Actividad PENDIENTE de `Objetivo.md`. |
| Autenticación contra el repo | Conector GitHub de la cuenta claude.ai de Sergio, autorizado sobre `smorales-ia/if-ejecutiva`. La sesión clona, crea rama, commitea y abre PR ella sola. |
| Commits | **Excepción acotada a la regla «commits los hace Sergio»:** en la nube la sesión DEBE commitear — pero sólo en su rama `claude/*` y con Conventional Commits scope `cu-002`. `main` queda intacta: nada entra sin que Sergio apruebe el PR. |
| Secretos | La VM **no tiene `.env`** (ni `AIRTABLE_TOKEN`, ni Clerk). Consecuencia: la validación nocturna es estática + unitaria + build (ver §7). No se configura ningún secreto en el entorno cloud para la primera noche — es la garantía de que la noche no puede tocar Airtable/Make/producción. |
| Cómo se detiene si falla | Tres niveles: (1) un test rojo en el gate → la Actividad termina en estado FAIL, se documenta y NO se abre el PR como aprobable (título con prefijo `[BLOQUEADA]`); (2) un agente caído → su bloque queda BLOQUEADO y el resto sigue; (3) si la sesión queda esperando respuesta humana, la VM se pausa — por eso los prompts de lanzamiento son autosuficientes y prohíben preguntar. |
| Cómo avisa al terminar | (a) PR abierto en GitHub (con resumen en el cuerpo); (b) archivo de evidencia commiteado en la rama; (c) notificación de sesión terminada en claude.ai/code y app móvil. Por la mañana: `guia_inicio_nube.txt` dice exactamente dónde mirar. |

**Flujo de una Actividad (una tanda, R3):**

```
Sesión cloud (rama claude/<slug>)
 1. BLOQUE 0 — snapshot: leer Objetivo.md, verificar que la Actividad está CONFIRMADA
    y que el estado del repo coincide; si no, detener y documentar.
 2. FASE 1 — planificador-tanda (+ Explore en paralelo): plan interno con alcance,
    archivos, tests y rollback. Gate interno: el plan cumple §2 del SPEC o se aborta.
 3. FASE 2 — ejecutor-ui aplica cambios; probador-tanda corre la batería tras cada
    bloque. Paralelo sólo donde no hay colisión de archivos.
 4. GATE — lint + typecheck + test + build, todos verdes.
 5. auditor-ciego — veredicto desde el estado final, sin leer logs previos.
 6. Evidencia — docs/_evidencia/YYYYMMDD_HHMM_<slug>.md (plantilla §6).
 7. Commit(s) + push + PR hacia main. Título: "feat(cu-002): <actividad> [OK]" o
    "[BLOQUEADA] <actividad> — <causa>".
```

Reglas duras heredadas: R4 (oráculo `docs/_md/audios/` y `docs/_metodo/` es sólo lectura),
R2 (nada HECHO sin evidencia), R5 (todo comando y decisión queda en la evidencia y en los
mensajes de commit).

---

## 5 · Estructura de `docs/Objetivo.md` (entregable 3)

El archivo ya queda creado en `docs/Objetivo.md` con las 4 Actividades. Estructura:

```markdown
# Objetivo.md — Actividades de corrección UI Ejecutiva
> Fuente: docs/_md/audios/ · Clasificación R1 en docs/_planes/SPEC_NOCHE-NUBE-UIEJECUTIVA_20261008.md
> Estados: CONFIRMADA (ejecutable esta noche) · EN DUDA (requiere OK de Sergio) · HECHA (con evidencia)

## A-01 · Precio de venta siempre capturable  [CONFIRMADA]
- **Origen:** C-08 (r21) — «tiene que incorporar el precio de venta… nos da referencia para valorizar»
- **Qué se hace:** sacar `precio_venta` del bloque condicional Financiero/Nueva en
  new-request-sheet.tsx y editar-solicitud-form.tsx; opcional, visible siempre.
- **Qué NO se hace:** no se crea campo en Airtable (ya existe); no se toca el motor.
- **Archivos probables:** components/console/new-request-sheet.tsx, editar-solicitud-form.tsx,
  lib/validators/nueva-solicitud-interna.ts, lib/mappers/*.ts, solicitud-detail.tsx
- **Criterios de aceptación:** [lista Given/When/Then]
- **Pruebas:** unit del validador y el mapper + batería estándar (§7 del SPEC)
- **Rollback:** cerrar el PR sin merge
- **Slug evidencia:** precio-venta-siempre
- **Prompt de lanzamiento:** [bloque listo para pegar]
```

(El mismo bloque se repite por Actividad; el archivo real es la fuente operativa.)

---

## 6 · Plantilla del archivo de evidencia (entregable 4)

Nombre: `docs/_evidencia/YYYYMMDD_HHMM_<slug>.md` (hora UTC de la VM, anotada como tal).

```markdown
# Evidencia · <A-XX — título> · <YYYY-MM-DD HH:MM UTC>

## 1 · Contexto
Actividad, origen (C-XX/M-XX + transcripción), rama, SHA inicial de main, sesión cloud.

## 2 · Cambios aplicados
Tabla: archivo · tipo de cambio (M/A/D) · resumen de una línea. Commits con SHA.

## 3 · Pruebas
Salida resumida de pnpm lint / typecheck / test / build (y la cruda al final o adjunta).
Tests nuevos: ruta y qué cubren. Resultado: X/Y verdes.

## 4 · Auditor ciego
Veredicto por criterio de aceptación: OK / FAIL + cómo se verificó (sin leer logs previos).

## 5 · Estado final
HECHA / BLOQUEADA / PARCIAL. Si no es HECHA: causa raíz en 2 líneas.

## 6 · Bloqueos y pendientes
Qué quedó BLOQUEADO, por qué, y qué necesita de Sergio.

## 7 · Rollback
Cómo deshacer (normalmente: cerrar el PR). Si algo se revirtió durante la noche, qué y por qué.
```

---

## 7 · Plan de revisión y pruebas por tanda (entregable 5)

**Qué se corre, en orden, dentro de la VM (sin secretos — nada alcanza Airtable/Make):**

1. `pnpm install` (el clon es limpio).
2. `pnpm lint` — cero errores.
3. `pnpm typecheck` — cero errores.
4. `pnpm test` — vitest, todos verdes, incluidos los tests NUEVOS de la Actividad
   (co-ubicados, patrón de `app/api/solicitudes/[id]/asignar/route.test.ts`).
5. `pnpm build` — build de producción limpio.

**Qué cuenta como APROBADO (gate):** los 5 pasos verdes **y** veredicto OK del auditor
ciego en todos los criterios de aceptación **y** evidencia escrita. Si falta cualquiera:
la Actividad es BLOQUEADA o PARCIAL — nunca HECHA (R2).

**Qué NO se puede validar de noche (y se dice honestamente en la evidencia):**
comportamiento en runtime contra Airtable real (la VM no tiene token). La verificación
funcional la hace Sergio al día siguiente con `pnpm dev` local siguiendo la sección
«Cómo probarlo tú» que cada PR incluye en su descripción (pasos de click, en español).

**Revisión:** el auditor ciego de cada tanda + la revisión humana del PR por Sergio
(GitHub muestra línea a línea). Nada se mergea de noche.

---

## 8 · Mapa de riesgos y rollback por tipo de corrección (entregable 7)

| Tipo | Riesgo principal | Mitigación | Rollback |
|---|---|---|---|
| Formularios (A-01) | Romper validación zod/mappers y bloquear el alta | Tests unitarios del validador y mapper antes del gate | Cerrar PR; main nunca se tocó |
| Presentación SLA (A-02) | Mostrar un plazo peor que el actual (confundir a la operación); CI-005/CI-037: 5 de 7 etapas sin escritor | Alcance limitado a presentación; si la etapa no es computable, caer al comportamiento actual, nunca inventar datos | Cerrar PR |
| Filtros/consultas de bandeja (A-03, A-04) | Costo de lectura sobre Airtable (rate limits) o falsos positivos del matching | Derivar del fetch existente; lógica de matching con tests unitarios; umbral conservador | Cerrar PR |
| Cuota del plan | Se agota a mitad de la noche y las sesiones quedan a medias | Lanzar máximo 3 sesiones la primera noche; Actividades ordenadas por prioridad | Las ramas quedan; se retoman al día siguiente |
| VM pausada por pregunta | Trabajo en curso se pierde | Prompts autosuficientes; prohibido preguntar: ante duda → BLOQUEADA + documentar | Re-lanzar la Actividad otra noche |
| Deriva de alcance | La sesión «aprovecha» de tocar otra cosa | BLOQUE 0 verifica alcance; auditor ciego revisa que el diff sólo contenga archivos del plan | Rechazar PR |

Garantía estructural: **la noche sólo produce ramas y PRs**. No hay escrituras a
Airtable, Make, Railway ni `main`. El rollback universal es no aprobar el PR.

---

## 9 · Supuestos y preguntas abiertas para Sergio (entregable 8)

**Supuestos (si alguno es falso, avisar antes de lanzar):**
1. El plan de Claude de Sergio tiene sesiones cloud habilitadas y GitHub conectado a `smorales-ia/if-ejecutiva`.
2. Todo lo que está en el repo local está pusheado antes de lanzar (la nube clona desde GitHub, no ve tu disco).
3. Se acepta la excepción de commits: la sesión cloud commitea en ramas `claude/*`; Sergio sigue siendo el único que mergea.
4. La primera noche NO se configuran secretos en el entorno cloud (validación sin Airtable real).

**Preguntas abiertas (bloqueantes marcadas con ⛔):**
1. ⛔ ¿Confirmas las 4 Actividades A-01..A-04 y su orden de prioridad? ¿Cuántas lanzar esta noche? (Recomendado: A-01, A-03 y A-02; A-04 para la segunda noche.)
2. ⛔ C-03 (datos mínimos del alta): ¿lo dejamos fuera hasta actualizar la norma, como propone este SPEC? (Recomendado: sí.)
3. C-09 (reasignación post-asignada): ¿agendamos una sesión diurna de decisión de producto (revisar RN-44/D-01)?
4. C-06/C-07 (comunas e instituciones): ¿quieres que una sesión diurna CON tu supervisión cargue esos catálogos en Airtable? (De noche está prohibido.)
5. ¿La hora de los nombres de evidencia en UTC te sirve, o prefieres hora de Chile anotada en el cuerpo?

---

## 10 · Siguientes pasos para Sergio

1. **Lee la sección 9 y contesta las preguntas 1 y 2** (en una línea cada una basta).
2. **Commitea y pushea** (GitHub Desktop) los archivos nuevos de este SPEC: `docs/_planes/SPEC_NOCHE-NUBE-UIEJECUTIVA_20261008.md`, `docs/Objetivo.md`, `guia_inicio_nube.txt` y la carpeta `.claude/agents/`. Sin push, la nube no los ve.
3. **Verifica en claude.ai/code** que puedes crear una sesión cloud y que aparece el repo `if-ejecutiva`. Si no aparece, conecta GitHub desde ahí (2 clics).
4. **Esta noche, sigue `guia_inicio_nube.txt`** (está en la raíz del repo, un paso por línea).
5. **Mañana**: revisa los PRs en GitHub y los archivos de `docs/_evidencia/` — la guía dice dónde mirar y qué aprobar.
