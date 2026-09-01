# Aprendizajes · P10-TAS · Reutilización cruzada e integración con SLA

**Tanda:** P10-TAS (§11 del plan v1.3)
**Fecha/hora:** 2026-08-31 22:05 -04
**Duración aprox.:** una sesión (verificación, sin construcción)
**Modo:** verificación read-only · contrato 🟡 pausa-en-comandos
**Rama:** `feat/tasador-ui`

---

## Alcance honesto

P10-TAS es una tanda de **verificación y ajuste fino**, no de construcción («No se construye
funcionalidad nueva»). Esta sesión la corrió como auditoría de sólo lectura (grep + git). **No se
tocó código, no se corrieron gates, no se modificó ningún archivo de IF-02.** El único artefacto de
escritura es este aprendizaje.

**Resultado:** las verificaciones comprobables headless quedan **verdes**; dos frentes quedan
**diferidos y documentados** por dependencias fuera del territorio IF-03. P10-TAS **no se declara
totalmente cerrada**: cierra su parte verificable y deja la integración SLA con datos reales para
cuando IF-02 resuelva su reloj.

## Qué quedó VERIFICADO (verde)

- **V1 · R7 reutilización efectiva.** `SLABadge` se importa de `@/components/console/status-badges`
  (`tasacion-card.tsx`) y `DocumentosAdjuntosSheet` de console (`fotos-screen.tsx`). Contraprueba:
  `grep` de `function/const SLABadge|StateBadge|FileUploadZone` bajo `components/tasador/` y
  `lib/tasador/` → **0 definiciones duplicadas**. El badge de SLA de la card (RF-TAS-02) reusa el de
  IF-02, que es lo que exige la Verificación 2.
- **Umbrales SLA.** `grep 4|6|24|48` fuera de tests en `app/api/tasaciones/` y `components/tasador/`
  → sólo clases Tailwind y un comentario. **Ningún umbral hardcodeado.** Domicilio único:
  `C_SLA_Etapas`. A-36 respetada.
- **A_Cambios (CI-011).** `lib/tasador/auditoria.ts` filtra por `tabla_origen` + `registro_id`,
  documentando que el Link `solicitud` no existe. Correcto, no por Link.
- **A-36 lock.** `lib/tasador/cola-filtros.test.ts` fija «asignada sin coordinar de hace un mes
  sigue en Por coordinar» y ordena por `venceTs`, sin cota de 4 h. Verde.
- **Motor SLA (a nivel unitario).** `lib/sla-habil.ts` con ventana 9:00–18:00, feriados y fin de
  semana; los tests ya cubren el **principio** del caso «viernes 17:00» (hábiles ≠ corridas):
  jueves 16:00→viernes 10:00 = 3 h; viernes 22:00→lunes 09:00; feriado en viernes arrastra al lunes.

## V5 · Frontera R5 — resuelta con atribución por commit (verde)

Un `git diff --stat` por ventana de tiempo es **engañoso** para R5: la rama `feat/tasador-ui`
carga también el **trabajo paralelo de IF-02** (el plan manda construcción en paralelo), así que
archivos de IF-02 aparecen en el diff aunque **ninguna tanda IF-03 los haya tocado**. La prueba
correcta es atribuir **cada cambio a su commit** y clasificar el commit:

| Archivos IF-02 en el diff | Commit(s) | Naturaleza | ¿Viola R5? |
|---|---|---|---|
| `new-request-sheet`, `editar-solicitud-form`, `solicitud-detail`, `console-data`, `mappers/*`, `validators/nueva-solicitud-interna`, (parte de) `solicitudes.ts` | `2134b42`/`543c5ab`/`716ffec` **CI-070** | Cutover del género femenino `nueva/usada` — fix cross-cutting `cu-002`, **no es tanda IF-03** | No |
| `documentos-adjuntos-sheet.tsx` | `dcd642b` **P5-TAS** | Reuso del sheet documental (R7) | No — **R5-E autorizado** |
| `document-checklist.tsx`, `airtable-client.ts`, `adjuntos.ts` | `93d3d84` fix `cu-002` | Resiliencia de red + extensión del cliente Airtable | No — `airtable-client` es la extensión **R5-E** de §0.4-nota3 |
| `lib/solicitudes.ts` (parte) | `84233c2` **P3-TAS** | Cola con SLA real (necesitó el lib de IF-02) | Toque IF-03 de lib IF-02, **autorizado y deployado** |
| `lib/historial-airtable.ts` | `681cded` **P4-TAS** | Limpieza RO-29 | `lib/` de **reuso aprobado** por §0.2-bis |

**Conclusión:** ninguna tanda IF-03 modificó IF-02 sin autorización. El grueso de lo que parecía
violación es **CI-070**, un cutover de dominio (género) transversal a `cu-002`, no territorio IF-03.
Los toques IF-03 restantes son R5-E autorizados o `lib/` de reuso declarado. **V5 verde.**

> Matiz frente a la hipótesis inicial: los archivos disputados **no** eran «pre-existentes al
> arranque de la rama» —se tocaron *después*, vía CI-070—, pero la conclusión de fondo se sostiene:
> IF-03 no los editó. La distinción importa para no repetir el diagnóstico por baseline.

## Qué quedó DIFERIDO (documentado, no cierra P10 hoy)

1. **CI-021 no es cerrable sin CI-005 + backfill A-5.** El motor calcula bien, pero
   `etapaVigente(solicitud)` lee `sla_e{n}_inicio_ts`, **no poblados en las filas reales** (saga del
   404 del backfill A-5 · `docs/_notas/diag-A5-404*.md`). Sin datos, la card no expone horas del
   motor para comparar. El plan lo declara: «CI-021 no se puede cerrar sin CI-005» (reloj de IF-02,
   sin implementar · §5.2). El caso «viernes 17:00 contra la card» y su test de integración
   motor↔card quedan **pendientes de datos**, no de código IF-03 (R5/R6: la corrección es de IF-02).
2. **Verificaciones 3 y 4 (entorno vivo).** Latencia <1 min en Historial de IF-02 (`A_Cambios`) y
   coherencia del recordatorio (§5.2.8) sobre una solicitud que califique requieren dev server +
   Clerk + Airtable vivo + un registro que califique. No ejecutable headless. Se difieren a una
   verificación manual conjunta.
3. **Eventos de coordinación fuera de alcance (CI-012).** RF-TAS-05 no se construyó; §1.3.3 ya los
   declara fuera *por falta de origen de datos*. **No es un bug.** P10 no lo intenta cerrar ni toca
   `components/console/**` para lograrlo (R5).

## Hallazgos R7 menores (no bloqueantes)

- **`FileUploadZone` no se importa en IF-03.** §0.2-bis lo listaba como «importado tal cual en
  P5-TAS», pero P5-TAS resolvió el organizador de fotos por su cuenta (nota en
  `estado-procesando.test.ts`). Confirmar contra el aprendizaje de P5-TAS que la decisión fue
  deliberada; si lo fue, actualizar §0.2-bis.
- **`components/tasador/estado-badge.tsx` define un `EstadoBadge` propio** (`EstadoColor` +
  `texto`), distinto del `StateBadge` de IF-02. Es un componente distinto (píldora de estado del
  tasador), no una reimplementación del `StateBadge` de console. No viola el reuso del badge de SLA,
  que sí importa `SLABadge`.

## Gates

**No se corrieron** (`pnpm tsc/build/test`) porque no se tocó código: crear este aprendizaje no
altera el build. Último verde conocido en la rama: **721 tests** (`pnpm test`), `tsc --noEmit` 0.
Al retomar la parte diferida (test de integración motor↔card), correr los tres gates.

## Reglas candidatas a migrar

- **→ MIGRAR (método R5).** Verificar R5 sobre una rama de construcción en paralelo se hace por
  **atribución de commit**, no por `git diff` de ventana temporal: un diff por fecha mezcla el
  trabajo paralelo de IF-02 con el de IF-03 y produce falsos positivos de frontera. La pregunta
  correcta es «¿qué commit tocó el archivo y de qué esfuerzo es ese commit?».
