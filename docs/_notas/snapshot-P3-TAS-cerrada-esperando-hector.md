# Snapshot · P3-TAS cerrada · esperando respuestas de Héctor

> **Fecha:** 19-ago-2026 · **Rama:** `feat/tasador-ui` · **Contrato:** 🔴 pausa-total antes de
> escribir Airtable, tocar `package.json`, crear/borrar archivos fuera de lista o commitear.
>
> **Este snapshot se abre al cerrar una tanda y antes de una espera**, no a mitad de trabajo. Su
> función es que la próxima sesión sepa, sin releer el historial, **qué está hecho, qué está
> bloqueado y por quién**.
>
> **Condición de reanudación:** llegan las respuestas de Héctor y Óscar a las seis preguntas de §4.
> Hasta entonces **no se arranca ninguna tanda**, incluida T2, que técnicamente no depende de
> nadie (ver §5).

---

## 1 · Dónde quedó el código

**P3-TAS.B cerrada y commiteada por Sergio.** Verificación visual a 375×812 hecha por Sergio: OK.

| | Estado |
|---|---|
| `pnpm tsc --noEmit` | ✅ 0 errores |
| `pnpm test` | ✅ **375 verdes** en 16 archivos (325 base + 50 de P3-TAS) |
| `pnpm build` | ✅ verde · 34 rutas |
| Frontera R5 | ✅ sin cambios fuera de IF-03, salvo la palabra `export` autorizada en `lib/solicitudes.ts:613` |

**Lo que la Pantalla 1 hace hoy**, verificado end-to-end contra la base real: cabecera con el
nombre real del tasador · tres chips (uno stub por A-12) · chip activo en `?chip=` · card con los
ocho elementos de §4.1, omitiendo Rol SII, teléfono y fecha de visita cuando no hay dato · píldora
de SLA por etapa alimentada por el motor · botón único "Abrir tasación" (Regla T-A colapsada).

**Seed de verificación vivo en Airtable** — borrar cuando estorbe, filtrando por
`ejecutivo_solicitante = "SEED P3-TAS"`:

| recordId | código | estado | para qué |
|---|---|---|---|
| `rec9qf3DchOY5Lk2N` | VP-2026-0061 | asignada | e2 verde · con Rol · dos contactos (prueba la elección por prioridad) |
| `recrx1YQYJuecthqd` | VP-2026-0062 | visitada | e5 ámbar · con visita · contacto p1 marcado erróneo (prueba el descarte) |
| `recdBwN9OimaCcL9T` | VP-2026-0063 | calculada | sin etapa · sin Rol · sin contacto (prueba la degradación) |

Contactos: `recwo3m5NXuM4qfre` · `recIjElmkYjxp7MmR` · `recfVcRnepzJ6Fu2N` · `recMU7hAbbcmZrpob`.

⚠ **Los tonos envejecen.** El semáforo es una fórmula sobre `NOW()`: a los pocos días las tres
filas estarán en rojo. Si hace falta volver a ver verde y ámbar, hay que correr
`sla_etapa_alerta_ts` y `sla_etapa_vence_ts` hacia adelante.

---

## 2 · Qué se analizó en esta ronda (sin tocar código)

Se contrastó `docs/_md/VProperty_SLA_Negocio_v1.1.md` contra el schema real y el código.

**El hallazgo que reencuadra todo:** ese documento **no era un insumo nuevo**. Está trackeado desde
el commit `dfddb37` del **07-ago-2026** y ya fue absorbido al normativo en el bump v1.9.7 (§5.2.4 ·
RF-53 · D-16). `C_SLA_Etapas` tiene sus **7 filas con los catorce umbrales exactos** desde el
10-ago. No hay brecha de especificación ni de configuración: **hay brecha de escritores**.

En todo el repositorio hay **un solo punto** que mueve el reloj por etapa —`marcarFinEtapa(id, 1,
…)` en `app/api/solicitudes/[id]/asignar/route.ts:132`, que cierra e1 y abre e2— más la apertura
de e1 en el alta. **Las etapas 3 a 7 no tienen escritor alguno** y `pausar()`/`reanudar()` no
tienen llamador.

---

## 3 · Estado documental al cierre de la ronda

| Documento | Qué cambió |
|---|---|
| `docs/aprendizajes.md` | **RO-36** (un día del calendario se ancla al mediodía local) · entrada `2026-08-19` de P3-TAS · entrada `2026-08-19 (b)` con **Q5 cerrada** |
| `docs/CODE_INCONSISTENCIES.md` | **CI-035 cerrada** · **CI-036** nueva (Clerk vs identidad mock) · **CI-037 a CI-040** nuevas · **CI-005 revisada**: sus pasos (2) y (3) ya estaban hechos |
| `docs/_archivo/aprendizajes-20260819-1218-P3-TAS.md` | Archivo de la tanda |
| `docs/_md/VProperty_SLA_Negocio_v1.1.md` | **No se tocó** — es la ubicación canónica |

**Q5 · CERRADA.** Respuesta de Héctor: la etapa 2 la cierra **el tasador** registrando el resultado
del llamado (fecha/hora de visita coordinada o incidencia); SLA 4 h ideal / 6 h máximo; el informe
post-llamado es una **etapa 3** propia con SLA de 30 min. Las tres cosas ya estaban en la matriz;
lo nuevo es la confirmación del **actor** que cierra e2.

---

## 4 · Las seis preguntas enviadas — el bloqueo

Sergio las envió a Héctor y Óscar el 19-ago-2026. **Ninguna tanda arranca hasta que lleguen.**

| # | Pregunta | Qué desbloquea |
|---|---|---|
| 1 | Cierre de e2: mecánica exacta del registro del llamado | T1 |
| 2 | **Dominio de incidencias** del llamado (no contesta, foro malo, …) | T1 — es el corazón de la pantalla |
| 3 | Cierre de e4: ¿envío automático o acuse manual de la Ejecutiva? | T3 |
| 4 | Reproceso: motivos tipificados · ¿fila nueva o marca? · qué significa "SLA en paralelo" | T5 · CI-038 |
| 5 | Alertas de rojo: a quién, por qué canal, con qué frecuencia | T6 |
| 6 | Cuál es el reporte que de verdad se mira | T7 |

**También bloquea P4-TAS** de la UI del Tasador, por su dependencia de CI-012.

---

## 5 · Plan de continuidad — propuesto y EN ESPERA

Nueve tandas identificadas. **Ninguna aprobada todavía**: cuando Héctor responda se decide el orden
completo de una sola vez.

| Tanda | Objetivo | Territorio | Bloqueo |
|---|---|---|---|
| **T1** | Cierre de e2 + etapa 3 · el tasador registra el resultado del llamado | IF-03 + campos nuevos | Preguntas 1 y 2 |
| **T2** | Etiqueta de la píldora en horas hábiles (**CI-039**) | IF-02 | **Ninguno técnico** — ver abajo |
| **T3** | Escritores de e4 y e6 | IF-02 | Pregunta 3 |
| **T4** | Escritores de e5 y e7 | IF-03 + IF-04 | CI-028 · IF-04 no existe |
| **T5** | Reproceso completo (**CI-038**) | Airtable + IF-02 + Motor | Pregunta 4 |
| **T6** | Alertas de rojo | Motor + notificaciones | Pregunta 5 · T1 · T3 · T4 |
| **T7** | Reportes de cumplimiento | IF-02 o aparte | Pregunta 6 · T1 · T3 · T4 · T5 |
| **T8** | Entregable por perfil de cliente (**CI-040**) | IF-04 / pipeline PDF | Confirmar con el dueño de E1/E2/E3 |
| **T9** | Saneamiento de `C_SLA` (**CI-005** paso 1) | Airtable schema | Héctor + Óscar para los pares |

**T2 no arranca**, y la razón es de proceso, no técnica: toca `lib/solicitudes.ts` (IF-02), no cabe
en `feat/tasador-ui` por **R5**, y Sergio prefiere no cambiar de rama mientras se espera. Decisión
tomada el 19-ago-2026.

### Qué cabe en `feat/tasador-ui` y qué no

- ✅ **Cabe:** T1 · la mitad IF-03 de T4.
- ❌ **Necesita rama propia:** T2, T3, T5, T6, T7, T8, T9 y la mitad IF-04 de T4.

---

## 6 · Para retomar

1. Leer este archivo y `docs/_archivo/aprendizajes-20260819-1218-P3-TAS.md`.
2. Leer las respuestas de Héctor y contrastarlas contra **CI-037** y **CI-038**, que son las fichas
   que esas respuestas convierten en ejecutables.
3. Decidir con Sergio el orden de tandas y la estrategia de ramas — hay siete tandas que no caben
   en la rama actual.
4. **No planificar sobre CI-005 sin leer su bloque de revisión del 19-ago-2026:** dos de sus cuatro
   pasos ya están hechos.
