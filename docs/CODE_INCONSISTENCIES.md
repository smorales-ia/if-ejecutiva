# CODE_INCONSISTENCIES — divergencias entre documentación y código

> Registro de inconsistencias detectadas entre los documentos canónicos y el código de
> producción. Creado el 25-jul-2026 durante el lote 3 del sync IF-Tasador v1.9.3.

## Para qué sirve

El sync de documentación **no modifica código**. Cuando una tarea documental descubre que el
código contradice al documento —o que lo seguirá contradiciendo tras el cambio—, el hallazgo
se registra aquí en vez de arreglarse sobre la marcha. Así el sync mantiene su alcance y el
hallazgo no se pierde.

Este archivo **no es una lista de deseos**: cada entrada describe una divergencia concreta y
verificable, con un archivo y una línea que se pueden abrir.

### Alcance: código, no documentos — decisión pospuesta (lote 5 · 25-jul-2026)

Este registro cubre divergencias **documento ↔ código de producción**. Las divergencias
**documento ↔ documento** no entran aquí.

La opción de ampliar `CODE_INCONSISTENCIES.md` a doc-vs-doc, o de crear un registro paralelo
tipo `DOC_INCONSISTENCIES.md`, **se descartó en el lote 5 para una única entrada**: la
desalineación entre la leyenda de estados del Motor v2.6 y §2.11 del spec, que se registró
como **A-11** en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`. Pesaron dos razones: crear un
registro para un solo caso es sobre-ingeniería, y A-11 no tiene dueño asignable, lo que
incumpliría la regla 1 de este archivo.

**Si aparece una segunda inconsistencia doc-vs-doc no bloqueada por decisión externa, esta
decisión se revisita antes de asimilarla a `_ambiguedades.md`.** Dos entradas dejan de ser un
caso aislado y `_ambiguedades.md` está pensado para preguntas abiertas, no para tareas
agrupadas.

## Reglas del registro

1. **Sin Dueño y sin Fecha objetivo no entra ninguna entrada.** Una divergencia sin
   responsable ni plazo es una nota, no un compromiso, y el archivo se vuelve un cementerio.
   Si no hay quién la tome, no se registra: se discute primero.
   La Fecha objetivo admite dos formas, nunca el vacío: una fecha `AAAA-MM-DD`, o una
   **condición explícita y verificable** —un punto abierto, una RF o una decisión de la que
   depende—. "Cuando se pueda" no es una condición; "condicional a RF-TAS-06, dependiente de
   P-5" sí lo es, porque ambos tienen ficha propia y estado consultable.
2. **Identificador correlativo `CI-NNN`, nunca se renumera.** Rige la misma regla de oro que
   para RF · RN · SC · AT: un identificador retirado se marca cerrado, no se reasigna.
3. **Una entrada, una divergencia.** Si un mismo síntoma tiene dos causas, son dos entradas.
4. **Archivo:línea obligatorio y verificable** al momento de escribir la entrada. Si las
   líneas se desplazan después, se corrigen al tocar la entrada; no se borra la referencia.
5. **Cerrar es explícito**: `Estado` pasa a `cerrada (AAAA-MM-DD)` con una línea en *Notas*
   diciendo qué se hizo. Las entradas cerradas **no se borran**.

## Formato

```markdown
## CI-NNN · <título corto en imperativo>

| Campo | Valor |
|---|---|
| **Identificador** | CI-NNN |
| **Archivo:línea** | `ruta/archivo.ts:NN` |
| **Síntoma** | qué se observa o se observará, en términos verificables |
| **Causa** | por qué ocurre |
| **Resolución** | qué hay que hacer, concreto y accionable |
| **Dueño** | rol o persona · **obligatorio** |
| **Fecha objetivo** | AAAA-MM-DD, o condición explícita · **obligatorio** |
| **Estado** | abierta · en curso · cerrada (AAAA-MM-DD) |
| **Origen** | qué lote, ambigüedad o revisión la detectó |

**Notas:** contexto, enlaces a § de los documentos, decisiones relacionadas.
```

---

## CI-001 · Referenciar `tipo_propiedad` por FIELD_ID, no por nombre

| Campo | Valor |
|---|---|
| **Identificador** | CI-001 |
| **Archivo:línea** | `lib/solicitudes.ts:196` · `lib/solicitudes.ts:284` |
| **Síntoma** | El cliente Airtable pide y mapea el campo por su nombre literal `'tipo_propiedad'`. Hoy funciona porque sólo lee `TX_Solicitudes`. Cuando RF-TAS-06 cruce `D_TipoDocumento` —que tiene un campo con **el mismo nombre y otro significado** (`fldIfdcjsr8KeNRCx`, condición de la propiedad, no clase de inmueble)— la referencia por nombre deja de identificar unívocamente el campo y el error será silencioso: no falla, devuelve el dato equivocado. |
| **Causa** | Airtable admite el mismo nombre de campo en tablas distintas. `§17` de `docs/schema-airtable.md` ya recomendaba preferir FIELD_ID ante riesgo de colisión, pero como recomendación, no como obligación; y el riesgo no estaba documentado cuando se escribió este código. |
| **Resolución** | Sustituir los dos literales por una constante FIELD_ID nombrada según el alias del registro §22: `tipoPropiedad` → `fld701TB0LXovvQmt`. Ubicar las constantes en un módulo único de mapeo de campos y hacer que `lib/solicitudes.ts` las importe. Al hacerlo, revisar si `tipoPropiedadNuevoUsado` (`fldHxx1P1ao33PWrl`) necesita el mismo tratamiento en los archivos que hoy lo consumen. |
| **Dueño** | Mantenedor de `lib/solicitudes.ts` |
| **Fecha objetivo** | **Condicional a RF-TAS-06**, dependiente de **P-5**. No hay fecha de calendario: la corrección se agenda cuando P-5 quede resuelto y RF-TAS-06 entre a implementación. Si RF-TAS-06 se adelanta, esta entrada pasa a bloqueante de esa RF. |
| **Estado** | abierta |
| **Origen** | Lote 3 del sync IF-Tasador v1.9.3 · ambigüedad **A-05** (colisión de nombre en `tipo_propiedad`) |

**Notas:**

- El registro de alias está en `docs/schema-airtable.md` §22; la regla de uso en código, en §22.3.
- Los tres campos implicados y sus FIELD_ID están verificados vía MCP contra la base
  `app9G7lLkIV3CpeLa` el 25-jul-2026. No derivar ninguno de un documento sin comprobarlo.
- **Esta entrada no cubre el problema de dominio.** `condicionPropiedadAplicable` está en
  femenino (`nueva · usada · ambas`) y `tipoPropiedadNuevoUsado` en masculino
  (`nuevo · usado`); RF-TAS-06 los compara y hoy nunca coinciden. Eso es el punto abierto
  **P-5** del spec v1.9.4 §2.15, se resuelve en Airtable y **no** es trabajo de código.
  Arreglar CI-001 sin resolver P-5 deja el sheet documental igualmente vacío.
- No hay cambio de código pendiente por los alias en sí: `tipoPropiedad` y
  `tipoPropiedadNuevoUsado` ya son los nombres que el código usa. Lo que cambia es **cómo se
  referencia el campo en Airtable**, no cómo se llama en TypeScript.
