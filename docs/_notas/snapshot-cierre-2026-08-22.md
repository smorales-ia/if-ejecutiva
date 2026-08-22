# Snapshot de cierre · 22-ago-2026

> Nota de cierre de sesión. Como toda nota de `docs/_notas/`, describe lo que era cierto **este
> día**: sirve para reconstruir el porqué, nunca para afirmar el estado de hoy (RO-24). El estado
> vigente de una CI vive en su ficha; el de una regla, en `docs/aprendizajes.md`.

## Estado

| | |
|---|---|
| **Rama activa** | `feat/tasador-ui`, en sync con `origin/feat/tasador-ui` |
| **Último commit** | `e7cdf99` — *feat(cu-002): P6-TAS · el stepper de lectura avanza con el estado backend* |
| **Tests baseline** | **31 archivos · 564 tests**, verificado al cerrar (tsc exit 0) |
| **Server local** | detenido · puerto 3000 libre |
| **Working tree** | limpio |

Tres commits pusheados hoy, en orden:

```
e7cdf99  feat(cu-002): P6-TAS · el stepper de lectura avanza con el estado backend
6809f36  docs(cu-002): archiva la bitácora 06-ago a 21-ago-2026 · aprendizajes.md 2010 → 830 líneas
93d3d84  fix(cu-002): resiliencia de red en lecturas Airtable · sheet mobile · paleta única en IF-03
```

## Qué se cerró en esta sesión

**Tanda 1 · B1+B2+B3** (`93d3d84`). Tres hallazgos de la verificación visual de P5-TAS. **B1:** el
500 recurrente de `/api/solicitudes/[id]/adjuntos` no era un id mal pasado sino fallo de transporte
—`ETIMEDOUT` intermitente sobre las 10 IPs de `api.airtable.com`—; `request()` reintenta ahora ante
error de red, y sólo en lecturas. **B2:** la fila del checklist documental pasa a dos columnas bajo
`sm`, que a 375 px partía los títulos en cuatro líneas. **B3:** `components/tasador/` usaba 255
clases `vp-*` que **no estaban declaradas en ningún `@theme`**, así que no generaban CSS; migradas a
los tokens de IF-02 más tres nuevos para el semáforo.

**Tanda 2 · Archivado de `aprendizajes.md`** (`6809f36`). Primer archivado del proyecto ejecutado
como tanda propia. 34 entradas y 1221 líneas a `docs/_archivo/aprendizajes_20260822.md`; el activo
quedó en 830 líneas con las 41 reglas operativas íntegras. Corte por **día completo** —el histórico
termina el 21-ago, el activo empieza el 22— en vez de por número de líneas.

**Tanda 3 · P6-TAS · Pantalla 4** (`e7cdf99`). No construyó la pantalla: la arregló. El stepper
avanzaba con dos `setTimeout` de 4 y 8 segundos y habilitaba «Continuar» pasaran ocho segundos y
nada más. Ahora sondea `GET /api/tasaciones/[id]/lectura` y mapea los 7 valores de
`estado_extraccion` a los 3 pasos, con `error` y `delegado_visador` terminando el proceso **sin**
habilitar el botón.

### Reglas nuevas

- **RO-39** — un 5xx intermitente contra Airtable es fallo de transporte hasta que se demuestre lo
  contrario; el reintento va en lecturas, nunca en escrituras.
- **RO-40** — una clase Tailwind que nadie declaró no falla: no existe, y se verifica con `grep`
  sobre el CSS compilado.
- **RO-41** — después de `pnpm build`, limpiar `.next` antes de `pnpm dev`; si `/api/health` y
  `/sign-in` dan 404 con el server verde, es `.next` contaminado y no Clerk.

### CI abiertos de esta sesión

- **CI-053** — el pie fijo de Pantalla 3 no entra a 375 px. Cosmético, preexistente al import v0,
  asignado a **P8-TAS**.

## Deudas registradas

- **Verificación visual de P6-TAS «en curso» pendiente.** Se verificó el camino feliz y el control
  de Pantalla 6, pero no el stepper a medias: haría falta una tasación con adjuntos en `idle` o
  `extrayendo`, y no hay ninguna en la cartera del tasador mock. Cubrirlo implica tocar datos en
  Airtable.
- **`delegado_visador` no enlaza con `TX_Adjuntos.datos_pendientes_visador`.** El aviso dice que el
  visador completará esos datos y el tasador no tiene desde ahí forma de ver cuáles. El campo guarda
  la lista y nadie la consume. Deuda de negocio, no bloqueante; evaluar en P9-TAS o P10-TAS.
- **A-18 sigue abierta** — `C_FactoresHomogeneizacion.valor_referencia` vacío en sus 15 filas.
  Dueños **Héctor y Óscar**, registrada en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`. Bloquea
  los defaults del formulario de P7-TAS.
- **Las cinco preguntas de SLA a Héctor siguen sin respuesta**, y con ellas las tandas T1, T3, T5,
  T6 y T7 del plan IF-02 · SLA. *(Arrastrado del cierre anterior; no se re-verificó hoy — el estado
  vivo está en `docs/aprendizajes.md` §«Estado de tareas» y en el plan `plan-ejecucion-if02-v1_9.md`.)*
- **Tanda F del SLA sigue bloqueada** por la decisión pendiente sobre el patrón de disparo de
  `AT08_Alertas_SLA` (fila observada vs webhook HMAC). Ver §«Estado de tareas».

## Próximo trabajo · pendiente de decisión de Sergio

1. **P7-TAS · Pantalla 5 · Formulario de 8 secciones.** La tanda más grande del plan. Contrato
   pausa-en-comandos, riesgo alto. Arrastra OV-12, la purga de CI-015, A-13 (grilla de comparables
   editable), A-14 (sin precarga constructiva en la sección E) y cuatro errores de tipado de §9.
   **Ojo:** parte de lo que el inventario le asignaba —la purga del literal de Regla T-C en
   `seccion-documentos.tsx`— **ya se hizo en P6-TAS**; está anotado in situ para que no se rehaga.
   Y sus defaults dependen de **A-18**, que sigue abierta.
2. **Destrabar ambigüedades con Héctor** — A-18 (defaults del formulario) y las cinco de SLA.
   Desbloquea a la vez parte de P7-TAS y cinco tandas del plan IF-02.
3. **Otro trabajo** que Sergio identifique al retomar.

## Cómo arrancar la próxima sesión

1. Leer `docs/aprendizajes.md` §«Estado de tareas» **y** este snapshot. El primero manda sobre el
   segundo si discrepan.
2. Confirmar baseline verde: `pnpm tsc --noEmit && pnpm test` → **564 tests**.
3. **Esperar orden explícita de Sergio** antes de arrancar cualquier trabajo.
4. **Si arranca P7-TAS:** leer §8 completa de `docs/_md/plan_ejecucion_UItasador_v1.2.md` antes de
   proponer batches. Es la tanda más grande y frágil de IF-03, y conviene contrastar contra el
   inventario antes de dar por pendiente algo que ya esté hecho — pasó dos veces en agosto
   (CI-046 y el literal de T-C de esta sesión).
5. **Si hace falta el server local:** `rm -rf .next` antes de `pnpm dev` (**RO-41**).
