# Ficha de brecha — `VProperty_Especificacion_Proyecto_v1_9_2.md`

- **Familia** — A · Especificación de proyecto
- **Ruta** — `docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md` — **borrado del working tree**
- **Última modificación** — 2026-07-23 · `03e8053` · 5001 líneas (recuperable desde HEAD)
- **Versión declarada** — v1.9.2
- **Decisión** — **PENDIENTE** · ver ambigüedad **A-04**
- **Prioridad** — bloqueada hasta Checkpoint #2

---

## Situación

El archivo figura como ` D` en `git status`: borrado en el working tree, sin stage.
Sigue íntegro en HEAD (`03e8053`). Su borrado coincide con la aparición del untracked
`VProperty_Especificacion_Proyecto_v1_9_3.md`, lo que sugiere un reemplazo manual —
copiar el nuevo, borrar el viejo — en lugar del versionado paralelo que exige §4.2 del prompt.

## Conflicto normativo

| Norma | Qué exige |
|---|---|
| Regla de oro §1.3 · cero pérdida | Nada se borra; se marca DEPRECATED o SUPERSEDED con puntero al reemplazo |
| Convención §4.2 | *"Si el doc lleva versión en el nombre (`_v1_9_2.md`), crear la nueva `_v1_9_3.md` **manteniendo el anterior**"*, y añadir al header del anterior el bloque `[SUPERSEDED]` |

Ambas apuntan a **restaurar**. La objeción práctica es que reintroduce 5001 líneas de
vocabulario v1.9.2 al working tree, que luego hay que excluir de los greps de regresión de §6.1.

## Rol de v1.9.2 en el spec vigente

No es un archivo cualquiera: **v1.9.3 lo cita explícitamente** como baseline.

- Línea 1568 — *"siguiendo el patrón de presentación de la §1 (Interfaz Ejecutiva) del `VProperty_Especificacion_Proyecto_v1_9_2.md`"*
- Línea 1903 — §2.14 se titula *"Cambios a aplicar sobre `VProperty_Especificacion_Proyecto_v1_9_2.md` en su próxima versión"*
- Línea 1948 — tabla de trazabilidad: *"`VProperty_Especificacion_Proyecto_v1_9_2.md` · Baseline técnico y patrón de presentación de RF"*

Es decir: **la tabla §2.14, que es el checklist obligatorio de todo este sync, está redactada
contra v1.9.2.** Borrarlo deja las once filas de §2.14 sin su documento de referencia dentro
del repo — verificable sólo vía `git show`.

Este argumento no estaba disponible en el Checkpoint #1 y refuerza la opción de restaurar.

## Opciones

| Opción | A favor | En contra |
|---|---|---|
| **Restaurar + `[SUPERSEDED]`** | Cumple §1.3 y §4.2 al pie de la letra. Conserva dentro del repo el baseline que §2.14 y la tabla de trazabilidad de §2 citan por nombre | Reintroduce 5001 líneas con vocabulario obsoleto; hay que excluirlo por ruta de los greps de §6.1 |
| Dejarlo borrado | El borrado parece intencional; git conserva la trazabilidad en `03e8053` | Desviación consciente de §1.3 y §4.2; deja tres citas de v1.9.3 apuntando a un archivo ausente |

**Recomendación del equipo (PM + QA):** restaurar y marcar `[SUPERSEDED]`, con exclusión
explícita por ruta en los greps de regresión. Es la única opción que respeta las dos reglas
de oro y mantiene resolubles las citas del spec vigente.

**No se ejecuta ninguna acción hasta la decisión del Checkpoint #2.**

## Bloque a aplicar si se aprueba la restauración

```
> **[SUPERSEDED]** Este documento fue reemplazado por
> `VProperty_Especificacion_Proyecto_v1_9_4.md` el 25-jul-2026.
> Motivo: sincronización con §2 Interfaz Tasador del spec v1.9.3 (RF-TAS-01..10,
> TX_CoordinacionVisita, máquina de estados oficial) y aplicación de las once filas
> de la tabla §2.14, redactada originalmente contra este archivo.
> Se conserva por trazabilidad histórica (H_Documentacion).
```

Nota: el puntero va a **v1.9.4**, no a v1.9.3, porque v1.9.3 también queda SUPERSEDED
por la ampliación de scope C-3. La cadena resultante es **v1.9.2 → v1.9.3 → v1.9.4**.
