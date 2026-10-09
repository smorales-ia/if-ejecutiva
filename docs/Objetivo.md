# Objetivo.md — Actividades de corrección UI Ejecutiva (trabajo nocturno en la nube)

> Fuente del trabajo: `docs/_md/audios/` (SOLO LECTURA · regla R4).
> Clasificación y reglas: `docs/_planes/SPEC_NOCHE-NUBE-UIEJECUTIVA_20261008.md`.
> Estados: **CONFIRMADA** (ejecutable esta noche) · **EN DUDA** (requiere OK de Sergio) · **HECHA** (con evidencia en `docs/_evidencia/`).
> Regla R3: una Actividad = una tanda = una sesión cloud = un PR = un archivo de evidencia.
> Regla R2: nada se marca HECHA sin su archivo `docs/_evidencia/YYYYMMDD_HHMM_<slug>.md`.

---

## A-01 · Precio de venta siempre capturable  [CONFIRMADA · prioridad 1]

- **Origen:** C-08 (transcripción `r21.txt`) — «tiene que incorporar el precio de venta… es un precio que a nosotros nos da referencia para poder valorizar».
- **Qué se hace:** el campo precio de venta debe poder capturarse SIEMPRE al crear y al editar una solicitud, como campo opcional. Hoy está encerrado tras el guard `esNuevo` — y el bloqueo NO es solo visual: los mappers descartan el valor a propósito cuando la propiedad no es Nueva, así que mostrarlo sin tocar los mappers no serviría de nada.
- **Los 5 puntos del guard `esNuevo` a modificar (verificados en código el 2026-10-08, dry-run):**
  1. `components/console/new-request-sheet.tsx:2191` — el Collapsible «Financiero» entero sólo se renderiza si `esNuevo`. Sacar el input «Precio de venta» del bloque condicional (visible también en usadas).
  2. `components/console/editar-solicitud-form.tsx:~1096` — mismo guard en edición («Financiero — sólo propiedades nuevas»). Ídem.
  3. `components/console/solicitud-detail.tsx:~1137` — el detalle sólo muestra el bloque si `esNuevo && s.financiero`. Mostrar DataRow «Precio de venta» también en usadas cuando hay valor.
  4. `lib/mappers/crear-solicitud.ts:379-396` — `if (esNuevo)`: en usadas, `financiero_precio_venta_uf` ni siquiera viaja en el payload a SC01. Mover SOLO esa clave fuera del guard.
  5. `lib/mappers/editar-solicitud.ts:284-296` — mismo guard hacia SC-Edicion con `financieroPrecioVentaUf`. Mover SOLO esa clave fuera del guard.
- **Qué NO se hace:** no se crea ningún campo en Airtable (`financiero_precio_venta_uf` ya existe); no se toca Make ni el motor de cálculo; no se hace obligatorio; y **los otros 7 campos del bloque Financiero quedan intactos tras el guard `esNuevo`** — ese guard existe a propósito («evita arrastrar valores residuales si la Ejecutiva cambió de rama», comentario en `crear-solicitud.ts`) y se conserva para todo lo que no sea `precioVenta`.
- **BLOQUE 0 (verificación previa obligatoria, solo lectura):**
  1. **Primer paso:** leer `docs/_artefactos/make/SC01 - Crear solicitud.blueprint.json` y confirmar que el módulo Airtable mapea `financiero_precio_venta_uf` incondicionalmente (sin filtro por tipo de propiedad). Verificar lo mismo para `financieroPrecioVentaUf` en `docs/_artefactos/make/SC-Edicion.blueprint.json`. Si cualquiera de los dos condiciona la clave → la Actividad queda BLOQUEADA y se documenta (el fix sería de Make, fuera de la noche).
  2. Confirmar que la Actividad sigue CONFIRMADA en este archivo y que el estado del repo coincide con los 5 puntos de arriba.
- **Archivos a tocar (lista confirmada por dry-run):** `components/console/new-request-sheet.tsx` · `components/console/editar-solicitud-form.tsx` · `components/console/solicitud-detail.tsx` · `lib/mappers/crear-solicitud.ts` · `lib/mappers/editar-solicitud.ts` · `lib/mappers/crear-solicitud.test.ts` (ampliar, ya existe) · `lib/mappers/editar-solicitud.test.ts` (**nuevo** — hoy no existe). `lib/validators/nueva-solicitud-interna.ts` se verifica pero NO se edita (`precioVenta: z.string()` en la línea 208 ya es opcional de facto).
- **Criterios de aceptación:**
  - Dado el alta de una solicitud con tipo de propiedad Usada, cuando abro el formulario, entonces puedo ingresar precio de venta sin abrir ningún bloque condicional.
  - Dado que dejo precio de venta vacío, cuando envío el formulario, entonces el alta procede sin error (campo opcional) y la clave se omite del payload.
  - Dada una usada con precio ingresado, cuando se arma el payload (crear y editar), entonces incluye `financiero_precio_venta_uf` / `financieroPrecioVentaUf` con el valor.
  - Dada una usada, los OTROS campos financieros (`valorTotalUf`, `subsidio`, `ahorro`, `mutuo`, `pagoContado`, `bonoCaptacion`, `bonoIntegracion`, `valor_uf`) siguen SIN viajar en el payload.
  - Dada una Nueva, el comportamiento es idéntico al actual (sin regresión en formularios, detalle ni payloads).
- **Pruebas:** ampliar `lib/mappers/crear-solicitud.test.ts` y crear `lib/mappers/editar-solicitud.test.ts` con los 4 casos de los criterios (usada con precio / usada sin precio / usada no arrastra el resto / nueva idéntica) + batería estándar (`pnpm lint/typecheck/test/build`).
- **Rollback:** cerrar el PR sin merge.
- **Slug evidencia:** `precio-venta-siempre`
- **Prompt de lanzamiento (pegar tal cual en la sesión cloud):**

```
Ejecuta la Actividad A-01 de docs/Objetivo.md como UNA tanda nocturna autónoma,
siguiendo el protocolo §4 y §7 de docs/_planes/SPEC_NOCHE-NUBE-UIEJECUTIVA_20261008.md
y las reglas de CLAUDE.md. Usa los agentes de .claude/agents/ (planificador-tanda →
ejecutor-ui → probador-tanda → auditor-ciego). No preguntes nada: ante una duda,
marca el bloque como BLOQUEADO y documenta. No toques Airtable ni Make. docs/_md/audios
y docs/_metodo son SOLO LECTURA. Al cerrar: evidencia en docs/_evidencia/ con el formato
del SPEC §6, commits Conventional (scope cu-002) en tu rama claude/*, y abre un PR hacia
main cuyo cuerpo incluya una sección "Cómo probarlo tú" con pasos de click en español.
No hagas merge.
```

---

## A-02 · Plazos de la etapa vigente, no el agregado  [CONFIRMADA · prioridad 3]

- **Origen:** C-02 (transcripciones `revision 1.txt` y `r21.txt`) — «al ingreso apareció que quedaban dos días… acuérdate que son cuatro horas para el llamado».
- **Qué se hace:** en bandeja y detalle, cuando la solicitud está en etapas tempranas, la cuenta regresiva visible debe corresponder al plazo de la **etapa vigente** en horas hábiles (4–6 h de coordinación al ingreso), no al plazo agregado en días. Sólo capa de presentación, apoyada en `lib/sla-etapas.ts` y `lib/sla-habil.ts` que ya existen.
- **Qué NO se hace:** no se implementa el reloj de etapas completo (CI-005/CI-037: cinco de siete etapas no tienen escritor); no se tocan fórmulas de Airtable ni `C_SLA`; si la etapa no es computable con los datos disponibles, se conserva el comportamiento actual — nunca inventar un plazo.
- **Archivos probables:** `components/console/solicitud-list.tsx`, `components/console/solicitud-detail.tsx`, `components/console/status-badges.tsx`, `lib/sla-etapas.ts` (sólo si falta un helper de presentación), `lib/use-cronologia-sla.ts`.
- **Criterios de aceptación:**
  - Dada una solicitud recién creada, cuando la veo en el detalle, entonces el plazo destacado es el de la etapa de coordinación en horas hábiles, no «2 días».
  - Dada una solicitud cuya etapa no es computable, cuando la veo, entonces se muestra lo mismo que hoy (sin regresión).
  - El semáforo agregado (`semaforo_sla`) sigue disponible como dato secundario; no se elimina información.
  - Los umbrales salen de las libs existentes; ningún número de SLA queda hardcodeado nuevo (RO-05).
- **Pruebas:** tests unitarios de la lógica de presentación (etapa → texto mostrado) + batería estándar.
- **Rollback:** cerrar el PR sin merge.
- **Slug evidencia:** `plazo-etapa-vigente`
- **Prompt de lanzamiento:** igual al de A-01, reemplazando «A-01» por «A-02».

---

## A-03 · Filtro «sin fecha de visita > 24 h»  [CONFIRMADA · prioridad 2]

- **Origen:** M-08 (transcripciones `p5.txt` y `p7.txt`) — «yo hoy día no sé de todos los informes cuántos no tienen fecha de visita».
- **Qué se hace:** en la bandeja, un filtro/contador de solicitudes activas que llevan más de 24 horas hábiles desde su ingreso sin `fecha_visita_programada`. Cálculo hábil con `lib/sla-habil.ts` y `lib/feriados.ts`. Derivado de los datos que la lista ya trae — sin endpoint nuevo si no es imprescindible.
- **Qué NO se hace:** no se envían correos ni recordatorios (eso es M-05, Make, fuera de alcance); no se escriben campos nuevos en Airtable.
- **Archivos probables:** `components/console/solicitud-list.tsx`, `components/console/indicador-cartera.tsx`, `components/console/console-shell.tsx`, `lib/console-data.ts` (+ test co-ubicado del predicado).
- **Criterios de aceptación:**
  - Dada una solicitud creada hace más de 24 h hábiles sin fecha de visita, cuando abro la bandeja con el filtro activo, entonces aparece en la lista y suma al contador.
  - Dada una solicitud con fecha de visita fijada, entonces nunca aparece en ese filtro.
  - El cómputo de 24 h es en horas hábiles (lunes-viernes 9:00–18:00, feriados excluidos), reutilizando las libs existentes — sin duplicar el calendario.
  - El filtro es combinable con los filtros existentes y no altera el orden por defecto de la bandeja.
- **Pruebas:** tests unitarios del predicado «sin visita > 24 h hábiles» (casos: borde de fin de semana, feriado, con/sin fecha) + batería estándar.
- **Rollback:** cerrar el PR sin merge.
- **Slug evidencia:** `filtro-sin-fecha-visita`
- **Prompt de lanzamiento:** igual al de A-01, reemplazando «A-01» por «A-03».

---

## A-04 · Aviso de propiedad ya tasada al ingresar dirección  [CONFIRMADA · prioridad 4 — segunda noche]

- **Origen:** M-09 (transcripción `r21.txt`) — «cuando cargamos buscamos direcciones parecidas… así nos damos cuenta de que ya lo hemos hecho».
- **Qué se hace:** en el alta, al escribir la dirección (y/o nombre de proyecto), consultar las solicitudes existentes y mostrar un aviso NO bloqueante (ámbar) con las coincidencias aproximadas, para que la Ejecutiva detecte proyectos ya tasados. Sólo lectura.
- **Qué NO se hace:** no se bloquea el alta; no se crea campo «nombre de proyecto» en Airtable (si falta, se registra como pendiente de decisión); no se deriva nada automáticamente.
- **Archivos probables:** `components/console/new-request-sheet.tsx`, `components/console/buscador-solicitudes.tsx` (reutilizar), `app/api/solicitudes/route.ts` (sólo si el GET existente no admite búsqueda por dirección), lib de normalización de dirección nueva con test co-ubicado.
- **Criterios de aceptación:**
  - Dado que existe una solicitud en «Teatinos 950», cuando escribo «teatinos 950» (u otra variante de mayúsculas/tildes/espacios), entonces veo el aviso con esa coincidencia.
  - El aviso es informativo: puedo continuar el alta sin fricción adicional.
  - La búsqueda espera a que el usuario deje de escribir (debounce) y nunca dispara más de una consulta por pausa de tipeo.
  - Sin coincidencias no aparece nada.
- **Pruebas:** tests unitarios de la normalización/matching de direcciones + batería estándar.
- **Rollback:** cerrar el PR sin merge.
- **Slug evidencia:** `aviso-ya-tasada`
- **Prompt de lanzamiento:** igual al de A-01, reemplazando «A-01» por «A-04».

---

## EN DUDA — no ejecutar sin OK explícito de Sergio

| Ref | Tema | Qué falta |
|---|---|---|
| C-03 | Datos mínimos del alta (contacto + fono + dirección + comuna; el resto opcional) | Conflicto con la norma vigente: primero se actualiza la especificación (decisión de producto), después se toca código |
| C-09 | Reasignar tasador después de `asignada` | Revertir RN-44 / decisión D-01 + requiere Make (SC13, fuera de CU-002) |
| M-11 | Exportar la base a Excel (honorarios y facturación) | Es mejora nueva; Sergio decide prioridad |
| M-07 / M-03 | Tablero de control diario / reprocesos | Features grandes: necesitan tanda de planificación diurna propia |

## FUERA DE ALCANCE UI Ejecutiva (R1 — viven en Airtable/Make/otras IF)

C-01 y M-10 (fórmula `codigo_ext` en Airtable) · C-04 (plantilla email en Make) ·
C-05 (pipeline adjuntos Make→Dropbox) · C-06/C-07 (carga de catálogos en Airtable) ·
M-01/M-02/M-12 (UI Tasador) · M-04 (perfil Visador) · M-05/M-06 (recordatorios Make) ·
M-13 (retirada por el cliente). Detalle y justificación: SPEC §2.3.
