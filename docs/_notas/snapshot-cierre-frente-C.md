# Cierre de sesión · 21-ago-2026 · Frente C completo (RF-TAS-05)

> Nota operativa con fecha. **No es especificación** — lo normativo vive en
> `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md`.

## Estado al cerrar

- **Frente C cerrado al 100%**: C1 → C2 (B1 + B1.5) → C3 (B1) → C4 (B1). RF-TAS-05 entregado.
- **Rama activa: `main`.** El trabajo se hizo en `feat/coordinacion-ejecutiva` y ya está mergeado.
- **Baseline: 452 tests verdes** (24 archivos), `pnpm tsc --noEmit` limpio, `pnpm build` compila.
- **Deploy Railway: ACTIVE**, con `feat(C4·B1): eventos de coordinación en HistorialTab + cierre
  DUDA-3` como último commit de código.
- **Verificado en producción** con `VP-2026-0061` en `/consola`:
  - *Datos* → sección **Coordinación de la visita** después de Asignación: badge "Confirmada",
    fecha `25 ago 2026`, respondida `21 ago 13:00`, intento N° 1 y la nota del tasador.
  - *Historial* → ítem con ícono de teléfono, título *"Visita confirmada para el 25 ago 2026"*,
    marca **Coordinación**, detalle desplegable rotulado *"Ocultar detalle"* — **no**
    *"Ver correo"*.
- **Árbol de trabajo limpio** al momento de escribir esto: los 8 commits están en `main`. Lo único
  sin commitear es **este snapshot**.

## Commits del frente en `main`

| # | Hash | Summary |
|---|---|---|
| 1 | `a62b5c5` | `docs(C1): cierre reducido RF-TAS-05 + plan C2/C3/C4 server-side` |
| 2 | `378fd91` | `feat(C2·B1): lectura server-side TX_CoordinacionVisita` |
| 3 | `7ab6927` | `refactor(C2·B1.5): envolver respuesta en { data } + TODO auth` |
| 4 | `00711d4` | `docs(C): agregar propuestas C2·B1 y C3·B1` |
| 5 | `6a61762` | `feat(C3·B1): sección Coordinación en DatosTab (hook + resumen puro)` |
| 6 | `c4e9d25` | `feat(C4·B1): eventos de coordinación en HistorialTab + cierre DUDA-3` |
| 7 | `8df0ccc` | `docs(C): cierre frente C · RO-38/42 + bitácora + plan actualizado` |
| 8 | `fb39fc4` | `docs(sync): cerrar A-09 · TX_CoordinacionVisita construida en Frente C` |

Commit inmediatamente anterior al frente: `b035172` (Frente A+B · gate §2.4 en card + chip
"Por coordinar" · CI-045/046/048).

**Seis de código y documentación de bloque (1-6); dos de tracking (7-8).** La progresión de la
suite fue 415 → 431 (C2) → 441 (C3) → 452 (C4).

## Qué quedó documentado — no rehacer

| Dónde | Qué |
|---|---|
| `docs/_notas/plan-frente-C.md` | C1/C2/C3/C4 marcados **CERRADO (21-ago-2026)** con su commit ref y qué entregó cada uno. Sección ***Cierre del frente*** con la tabla de commits, el resultado, la verificación en producción, la tabla RO-38…RO-42 y **la tabla de dudas: 5 cerradas + 3 que sobreviven**. Anotado también el desvío del plan original (la fusión en `historial-airtable.ts` que el plan asignaba a C2 se ejecutó en C4) |
| `docs/aprendizajes.md` | § *Estado de tareas* → entrada ✅ del frente con "próximo trabajo: por definir". § *Reglas operativas* → **RO-38 a RO-42**. § *Bitácora reciente* → entrada **2026-08-21 (b)** con los cuatro patrones destilados |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | **A-09 cerrada in-place**, con tabla de consumo real y bloque de premisa superada (los 3 sitios que citan la afirmación vieja) |
| `docs/_notas/propuesta-C2/C3/C4-bloque1.md` | Las tres propuestas aprobadas, con sus dudas numeradas por frente |

### Las cinco reglas nuevas

| Regla | Qué fija | Bloque |
|---|---|---|
| **RO-38** | Endpoints hermanos uniforman el shape en `{ data: … }` | C2·B1.5 |
| **RO-39** | Tipos compartidos server/cliente en módulo puro, sin `airtable-client` | C3·B1 |
| **RO-40** | `date` puro (`YYYY-MM-DD`) se parsea con regex, nunca `new Date()` | C3·B1 |
| **RO-41** | Fallo parcial de una lectura fundida se propaga; un criterio por función | C4·B1 |
| **RO-42** | La redacción del ítem del riel vive en el módulo del dominio (RO-05) | C4·B1 |

### Lo que A-09 dejó cerrado sobre `intento_numero`

Conviene no volver a diagnosticarlo: la fórmula `1 + COUNT(intentos previos)` de §2.12 **no es
implementable**, y el motivo **no es la idempotencia** sino que una fórmula de Airtable **no puede
contar registros hermanos de la misma tabla filtrados por un link**. Lo escribe el Route Handler
del tasador contando los intentos previos en el insert. La constraint blanda de unicidad, que sí
es un asunto de idempotencia, se implementó como **ventana deslizante de 10 s** —no por truncación
al minuto, que falla justo en el caso que dice cubrir— con carrera residual conocida (**CI-044**).

## Deudas que sobreviven

| ID | Qué | Cómo retomarla |
|---|---|---|
| **DUDA-1** (frente C) | No hay `@testing-library/react` ni `jsdom`; `vitest.config.mts` no declara `environment` y no existe **ni un `*.test.tsx`** en el árbol. No hay tests de render de componentes | Estrategia vigente y suficiente hasta ahora: **función pura + tests sobre la función**. Montar el runner toca `package.json` → **tanda de infraestructura propia, con Sergio y Óscar** |
| **DUDA-8** (frente C) | `TX_CoordinacionVisita` se lee **dos veces** por apertura del detalle: `/coordinacion` (sección Datos) y dentro de `/eventos` (riel Historial) | Coste hoy **despreciable** (paralelas, tabla chica). Si el detalle pesa, el ahorro es **fundir del lado cliente** reusando el hook de C3, **sin cambiar el contrato de ninguna ruta** |
| **TODO(auth)** | `coordinacion/route.ts` no tiene gate de Clerk, igual que `eventos/` y `decision-motor/`; `sla/` sí lo tiene | Tanda de **auth uniforme** sobre `app/api/solicitudes/**` con Óscar. **No ruta por ruta.** El TODO está en el código |
| **Archivado de la bitácora** | `docs/aprendizajes.md` pasó de 1644 a **1779 líneas**. `CLAUDE.md` fija el umbral en ~1500 | Es **operación deliberada**: reglas activas arriba, últimas ~200 líneas de bitácora, el resto a `docs/_archivo/`. **Tanda propia, en fresco** — CLAUDE.md prohíbe hacerla a mitad de otra sesión |
| **A-10 · A-18** | Siguen **BLOQUEANTES** en `_ambiguedades.md`. No tocadas en esta sesión | A-10: colisión de nombres SC05/SC08. A-18: ninguna tabla puede servir hoy un factor de homogeneización → bloquea RF-TAS-08 y `GET /api/tasaciones/config/defaults`. **Dueños: Héctor y Óscar** |
| **Preguntas a Héctor y Óscar** | Enviadas el 19-ago-2026, **sin responder**. Bloquean **T1, T3, T5, T6, T7** | Ver `docs/_notas/snapshot-P3-TAS-cerrada-esperando-hector.md` §4 |

> ⚠ **Precisión sobre las preguntas pendientes: son *seis*, no cinco.** La tabla de §4 de
> `snapshot-P3-TAS-cerrada-esperando-hector.md` las lista completas (cierre de e2 · dominio de
> incidencias · cierre de e4 · reproceso · alertas de rojo · reporte que de verdad se mira). Ese
> mismo documento dice que **también bloquean P4-TAS** — **eso ya no aplica**: CI-012 cerró en
> positivo el 19-ago y P4-TAS se ejecutó y cerró. La línea está superada.

## Próximo trabajo — **PENDIENTE DE DEFINIR por Sergio**

No hay tanda abierta. **El Frente C no continúa: está cerrado.** Candidatos vistos, sin orden ni
aprobación:

- **Destrabar las ambigüedades con Héctor y Óscar** — A-18 (defaults del formulario) y las seis
  preguntas de SLA. Es lo que libera más trabajo aguas abajo (T1, T3, T5, T6, T7 + RF-TAS-08).
- **Archivado de `docs/aprendizajes.md`** — barata, sin dependencias externas, y el umbral ya está
  superado.
- **Siguiente tanda de IF-03.** ⚠ Ojo al elegir: **P4-TAS está completa** (cerrada 19-ago) y los
  **Frentes A+B también** (`b035172`, CI-045/046/048). No son candidatos vivos.
- **T2 · etiqueta de la píldora en horas hábiles (CI-039)** — el snapshot de P3-TAS la marca **sin
  bloqueo técnico**; no arrancó sólo porque tocaba IF-02 y no cabía en `feat/tasador-ui` por R5.
  **Esa razón ya no aplica: la rama activa es `main`.** Vale reconsiderarla.
- Otro que Sergio identifique al retomar.

## Cómo arrancar la próxima sesión

1. Leer `docs/aprendizajes.md` § **Estado de tareas** (arriba del todo está el cierre del Frente C)
   y **este snapshot**.
2. Confirmar baseline verde: `pnpm tsc --noEmit` + `pnpm test` → **esperar 452 verde**. Si el
   número difiere, algo cambió fuera de esta sesión y hay que entender qué **antes** de escribir.
3. **Esperar orden explícita de Sergio** antes de arrancar cualquier trabajo. Contrato pause-total
   vigente: sin commits, sin writes a Airtable, sin tocar `package.json`.
4. **No asumir que la próxima tanda continúa el Frente C.**

### Prompt inicial

```
Sesión nueva. Leé en este orden: CLAUDE.md → docs/aprendizajes.md (sección
"Estado de tareas" + reglas RO-38 a RO-42) → docs/_notas/snapshot-cierre-frente-C.md.
Confirmame qué leíste, corré pnpm tsc --noEmit + pnpm test para verificar el
baseline de 452, y esperá indicación de tanda. El Frente C está cerrado: no lo
continúes.
```
