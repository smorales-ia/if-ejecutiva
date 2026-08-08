# Modelo de SLA — pendiente de decisión de negocio

> Deuda D-01 · ítem 8 · 29-jul-2026
> **Para decidir con Héctor y Óscar.** No es un bug: es una regla de negocio que
> nunca se definió por escrito.

## El hallazgo

El brief de la tanda daba por hecho que `fecha_limite_entrega` era *"un date base
que SC01 debería calcular (fecha_solicitud + sla_aplicable de C_SLA, con WORKDAY
y H_Feriados)"*. **No es así.**

```
fecha_limite_entrega   fldoT1LOSgVRo32TC   formula:  DATEADD({fecha_visita}, 2, 'days')
fecha_visita           fldpTBzjfbAw5FSYI   date      (la visita REALIZADA)
semaforo_sla           fldW4oUq7LvQUZq7W   formula:  cuenta días desde {fecha_visita}
```

El SLA vigente **arranca en la visita realizada**, no en el ingreso de la
solicitud, y dura 2 días. SC01 no puede poblar `fecha_visita` al crear: la visita
todavía no ocurrió. El `#ERROR` en altas nuevas no es un fallo — es el modelo
diciendo "esta solicitud aún no entró en SLA".

## Por qué importa

Una solicitud puede estar **semanas** entre creada y visitada, y en toda esa
ventana no tiene SLA, no aparece en "SLA en riesgo" y no se puede priorizar por
urgencia. Si la operación asume que el reloj corre desde que entra la solicitud,
hoy hay un punto ciego que nadie está midiendo.

## El catálogo tampoco está listo

`C_SLA` (`tblsPZokEK5aoinTn`) existe pero está prácticamente vacío:

- **1 sola fila**: `SLA_METLIFE_Refinanciamiento`, `dias_totales = 4`, `activo`.
- Los links `cliente`, `tipo_informe`, `tipo_propiedad` **sin poblar**, así que
  no hay forma de resolver "qué SLA aplica a esta solicitud".
- Dos familias de campos duplicadas: `dias_totales` / `dias_alerta_amarilla` /
  `dias_alerta_roja` (la poblada) y `sla_dias` / `sla_dias_alerta` /
  `sla_dias_vencido` (vacía). Habría que elegir una y borrar la otra.

`C_Feriados` (`tblJVh2kPd4uMgxpb`) sí está bien estructurado (`fecha`,
`es_irrenunciable`, `activo`, `anno`).

## Tres opciones

### (a) Dejar el modelo como está — **aplicada en esta tanda**

El SLA mide la **entrega del informe tras la visita**. Se corrige sólo la
robustez: `"Sin visita"` en vez de `#ERROR`.

- ✅ Cero riesgo, cero cambio de significado, cero trabajo pendiente.
- ❌ La ventana ingreso → visita sigue sin medirse.

### (b) Re-basar a `fecha_solicitud`

`fecha_limite_entrega = WORKDAY({fecha_solicitud}, <n>, feriados)`.

- ✅ Toda solicitud tiene SLA desde el minuto uno; "SLA en riesgo" pasa a ser
  una bandeja de verdad accionable desde el ingreso.
- ❌ **Cambia el significado del SLA para las ~54 filas históricas**: los
  informes ya entregados se recalculan contra otra base y muchos pasarían a
  "VENCIDO" retroactivamente. Los reportes que se hayan sacado antes dejan de
  ser comparables.
- ❌ Exige poblar `C_SLA` y añadir un lookup en `TX_Solicitudes` para resolver
  el SLA por cliente/tipo, o aceptar un número fijo hardcodeado en la fórmula.

### (c) Dos relojes

Mantener `semaforo_sla` como está (post-visita) y **añadir** un
`semaforo_ingreso` que mida ingreso → visita.

- ✅ No rompe nada histórico y cubre el punto ciego.
- ❌ Dos semáforos en la UI: hay que decidir cuál manda en la pestaña "SLA en
  riesgo" y cuál se muestra en la lista, o la pantalla se vuelve ambigua.

## Recomendación

**(a) ahora** — ya está aplicada — y llevar **(c)** a la conversación con Héctor
y Óscar, porque resuelve el punto ciego sin reescribir la historia. (b) es la
más limpia conceptualmente pero es la única que altera datos ya entregados, y esa
decisión no es técnica.

## Qué preguntar exactamente

1. Cuando la Ejecutiva dice "esta solicitud está atrasada", ¿atrasada respecto de
   qué: de la visita o del ingreso?
2. ¿Existe un compromiso con el cliente sobre el plazo **ingreso → entrega**, o
   sólo sobre **visita → entrega**?
3. ¿Los 2 días actuales son correctos, o vienen de una prueba que quedó fija?
4. ¿El SLA varía por cliente / tipo de informe? Si sí, hay que poblar `C_SLA`
   antes de cualquier cambio de fórmula.

---

## Actualización 08-ago-2026 — respondida por la spec v1.9.7 §5.2

Las cuatro preguntas de arriba se llevaron a Héctor y volvieron respondidas. El
insumo `VProperty_SLA_Negocio_v1.1` se incorporó a la especificación como §5.2
(RF-53) en el bump v1.9.6 → v1.9.7. **El análisis y las tres opciones de arriba se
conservan tal cual**: siguen siendo el registro de por qué la decisión era difícil
y qué se evaluó. Lo que cambia es que ya hay respuesta.

| Pregunta | Respuesta de la spec |
|---|---|
| 1 · ¿Atrasada respecto de la visita o del ingreso? | **Del ingreso.** El reloj arranca cuando Control y Seguimiento abre el correo e ingresa la solicitud — no cuando el correo llega al buzón (§5.2.2). |
| 2 · ¿Hay compromiso ingreso → entrega? | **Sí.** End-to-end ~30 h hábiles ideal, ~62 h hábiles máximo (§5.2.4). |
| 3 · ¿Los 2 días son correctos? | **Los supersede una matriz de 7 etapas.** El tramo visita → informe es 24 h ideal / 48 h máximo (etapa 5); disponible para visado 2–3 h (etapa 6); visación 30 min por informe (etapa 7). |
| 4 · ¿Varía por cliente / tipo de informe? | **Sí, y convive con lo anterior.** `C_SLA` mantiene el plazo agregado por par (cliente, tipo_informe); la matriz por etapa es un segundo reloj, no un reemplazo (§5.2 intro). |

Además, la spec fija dos cosas que esta nota no había planteado: el cómputo corre
sólo de **lunes a viernes de 9:00 a 18:00**, excluidos feriados, y se pausa fuera de
esa ventana (§5.2.1); y el **reproceso** tiene matriz propia R1–R3 con la regla
"reproceso limpio" (§5.2.5).

**Qué implica para las tres opciones.** El negocio eligió, en los hechos, algo
cercano a **(c) dos relojes** —el agregado de `C_SLA` sigue vivo y se le suma el
reloj por etapa—, pero con una diferencia que importa: el reloj nuevo no mide
"ingreso → visita" como proponía (c), sino las siete etapas completas, y lo hace
sobre calendario hábil, que ninguna de las tres opciones contemplaba. La objeción
de (b) sobre reescribir la historia de las ~54 filas no aplica: la matriz por etapa
es aditiva y no recalcula `semaforo_sla`.

**Lo que sigue abierto** es la implementación, no la decisión. Nada de §5.2 está
construido: no existen los timestamps por etapa, `C_SLA` sigue con una sola fila y
sin links poblados, y `semaforo_sla` sigue contando desde `fecha_visita`. La brecha
entre la norma y lo implementado está registrada como **CI-005** en
`docs/CODE_INCONSISTENCIES.md`. La corrección cosmética de la fórmula que describe
`20260729-fix-semaforo-sla.md` sigue siendo válida y sigue sin aplicarse.
